#!/usr/bin/env node
/**
 * 将 default-shortcuts.json 中非 Icons8 的 iconUrl 全部改为按 icon8-host-slugs.json 匹配的 CDN 地址。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultIcons8UrlForShortcut } from './icon8-resolve.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'icon8-host-slugs.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(root, 'default-shortcuts.json'), 'utf8'));
for (const item of data) {
  if ((item.iconDataUrl || '').trim()) continue;
  item.iconUrl = defaultIcons8UrlForShortcut(item, cfg);
}
fs.writeFileSync(path.join(root, 'default-shortcuts.json'), JSON.stringify(data, null, 2) + '\n');
console.log('已更新 default-shortcuts.json → 仅 Icons8');
