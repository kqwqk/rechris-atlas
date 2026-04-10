/**
 * 快捷方式服务端存储（Vercel Serverless + Vercel KV）。
 *
 * 环境变量：在 Vercel 项目 → Integrations → 添加 Redis（Upstash）后，通常会自动注入：
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 * （旧版「Vercel KV」已迁移到 Upstash，变量名一般不变。）
 *
 * 可选：SHORTCUTS_WRITE_SECRET — 若设置，PUT/POST 须带 Header：
 *   Authorization: Bearer <与之一致的密钥>
 * （启用后浏览器端无法匿名写入，需自建带密钥的客户端或关闭此项。）
 */
const path = require('path');
const fs = require('fs');

const KV_KEY = 'theme-launch-shortcuts';

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
        try {
          return resolve(JSON.parse(req.body));
        } catch (e) {
          return reject(e);
        }
      }
    }
    let raw = '';
    req.on('data', (c) => {
      raw += c;
    });
    req.on('end', () => {
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
    try {
      const body = await parseJsonBody(req);
      if (!Array.isArray(body)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Expected JSON array' }));
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
