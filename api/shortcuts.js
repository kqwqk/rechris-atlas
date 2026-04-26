/**
 * 快捷方式服务端存储（Vercel Serverless + Vercel KV）。
 *
 * 环境变量：在 Vercel 项目 → Integrations → 添加 Redis（Upstash）后，通常会自动注入：
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 * （旧版「Vercel KV」已迁移到 Upstash，变量名一般不变。）
 *
 * 安全（重要）：只要配置了 KV，**务必** 设置 SHORTCUTS_WRITE_SECRET。PUT/POST 需带
 *   Authorization: Bearer <密钥>
 * 未设置 secret 时写入仍被接受（便于本地/预览），**生产环境公网站点请勿长期如此**；不设 secret 的公开部署等同任何人可改 KV 中的列表。
 * 需要彻底禁止匿名写时，请设置密钥并在可信环境（自写脚本/CI、带秘钥的私有客户端）同步，或在前端不调用 persist（仅用 localStorage）。
 */
const path = require('path');
const fs = require('fs');

const KV_KEY = 'theme-launch-shortcuts';
/** 防止大 JSON / base64 图标拖垮函数内存（与浏览器 localStorage 上限同量级可接受） */
const MAX_JSON_BODY_BYTES = 450 * 1024;
const MAX_ARRAY_ITEMS = 2000;

function loadDefaultShortcuts() {
  try {
    const p = path.join(process.cwd(), 'default-shortcuts.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return [];
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return resolve(req.body);
      if (typeof req.body === 'string') {
        if (Buffer.byteLength(req.body, 'utf8') > MAX_JSON_BODY_BYTES) {
          return reject(new Error('Body too large'));
        }
        try {
          return resolve(JSON.parse(req.body));
        } catch (e) {
          return reject(e);
        }
      }
    }
    let raw = '';
    let byteLen = 0;
    let tooLarge = false;
    req.on('data', (c) => {
      if (tooLarge) return;
      byteLen += typeof c === 'string' ? Buffer.byteLength(c) : c.length;
      if (byteLen > MAX_JSON_BODY_BYTES) {
        tooLarge = true;
        try {
          req.destroy();
        } catch (e) {}
        reject(new Error('Body too large'));
        return;
      }
      raw += c;
    });
    req.on('end', () => {
      if (tooLarge) return;
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  res.setHeader('X-Server-Persist', hasKv ? '1' : '0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'GET') {
    let list;
    if (hasKv) {
      try {
        const { kv } = require('@vercel/kv');
        const v = await kv.get(KV_KEY);
        if (v !== null && v !== undefined) list = v;
      } catch (e) {
        console.error('KV get error', e);
      }
    }
    if (list === undefined) list = loadDefaultShortcuts();
    if (!Array.isArray(list)) list = loadDefaultShortcuts();
    res.statusCode = 200;
    return res.end(JSON.stringify(list));
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    if (!hasKv) {
      res.statusCode = 503;
      return res.end(JSON.stringify({ error: 'KV not configured', hint: 'Add Vercel KV to this project' }));
    }
    const secret = process.env.SHORTCUTS_WRITE_SECRET;
    if (secret) {
      const auth = req.headers.authorization || '';
      if (auth !== 'Bearer ' + secret) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }
    }
    let body;
    try {
      body = await parseJsonBody(req);
    } catch (e) {
      if (e && e.message === 'Body too large') {
        res.statusCode = 413;
        return res.end(JSON.stringify({ error: 'Payload too large', maxBytes: MAX_JSON_BODY_BYTES }));
      }
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
    try {
      if (!Array.isArray(body)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Expected JSON array' }));
      }
      if (body.length > MAX_ARRAY_ITEMS) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Too many items', max: MAX_ARRAY_ITEMS }));
      }
      for (let i = 0; i < body.length; i++) {
        if (!body[i] || typeof body[i] !== 'object') {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Invalid item at index ' + i }));
        }
      }
      const { kv } = require('@vercel/kv');
      await kv.set(KV_KEY, body);
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, count: body.length }));
    } catch (e) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
  }

  res.setHeader('Allow', 'GET, PUT, POST, OPTIONS');
  res.statusCode = 405;
  return res.end(JSON.stringify({ error: 'Method not allowed' }));
};
