#!/usr/bin/env node
/**
 * 从 iTab 导出的 书签.md（内嵌 navConfig JSON）生成 default-shortcuts.json
 * 图标仅使用 Icons8 iOS Filled（img.icons8.com/ios-filled/…），按网址主机名在 icon8-host-slugs.json 中匹配。
 * 用法: node scripts/rebuild-default-shortcuts.mjs "/path/to/书签.md"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultIcons8UrlForShortcut, isIcons8IconUrl } from './icon8-resolve.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mdPath = process.argv[2] || path.join(process.env.HOME || '', 'Downloads/书签.md/书签.md');

const icon8Cfg = JSON.parse(fs.readFileSync(path.join(root, 'icon8-host-slugs.json'), 'utf8'));

const text = fs.readFileSync(mdPath, 'utf8');
const start = text.indexOf('{"navConfig"');
if (start < 0) throw new Error('未找到 navConfig JSON');
const data = JSON.parse(text.slice(start));
const items = data.navConfig[0].children || [];

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

const out = [];
const seen = new Set();
for (const x of items) {
  if (!x.url || x.component) continue;
  if (!/^https?:\/\//i.test(x.url)) continue;
  const url = x.url.trim();
  if (seen.has(url)) continue;
  seen.add(url);
  let iconUrl = (x.src || '').trim();
  if (iconUrl && !/^https?:\/\//i.test(iconUrl)) iconUrl = '';
  const title = (x.name || host(url) || 'Link').replace(/\s+/g, ' ').trim();
  if (!iconUrl || !isIcons8IconUrl(iconUrl)) {
    iconUrl = defaultIcons8UrlForShortcut({ url, title, iconEmoji: '·', iconDataUrl: '', iconUrl: '' }, icon8Cfg);
  }
  out.push({
    id: `bm${out.length}`,
    title,
    url,
    iconEmoji: '·',
    iconDataUrl: '',
    iconUrl
  });
}

const outFile = path.join(root, 'default-shortcuts.json');
fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log(`写入 ${out.length} 条 → ${outFile}`);
