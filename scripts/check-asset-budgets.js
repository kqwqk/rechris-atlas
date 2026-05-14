#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const KB = 1024;
const MB = KB * KB;

const budgets = [
  { label: 'dist total', type: 'dir', relPath: 'dist', max: 180 * MB },
  { label: 'photos total', type: 'dir', relPath: 'dist/assets/photos', max: 170 * MB },
  { label: 'generated visuals total', type: 'dir', relPath: 'dist/assets/generated', max: 10 * MB },
  { label: 'largest photo thumb', type: 'max-file', relPath: 'dist/assets/photos/thumbs', max: 250 * KB },
  { label: 'largest generated visual', type: 'max-file', relPath: 'dist/assets/generated', max: 1.8 * MB },
  { label: 'main js gzip', type: 'gzip-max-file', relPath: 'dist/assets', pattern: /^main-.*\.js$/, max: 150 * KB },
  { label: 'main css gzip', type: 'gzip-max-file', relPath: 'dist/assets', pattern: /^main-.*\.css$/, max: 20 * KB }
];

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function walk(absPath) {
  if (!fs.existsSync(absPath)) return [];
  const stat = fs.statSync(absPath);
  if (stat.isFile()) return [{ path: absPath, size: stat.size }];
  if (!stat.isDirectory()) return [];
  return fs.readdirSync(absPath).flatMap((name) => walk(path.join(absPath, name)));
}

function format(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / KB).toFixed(1)} KB`;
}

function measure(budget) {
  const absPath = path.join(ROOT, budget.relPath);
  const files = walk(absPath).filter((file) => !budget.pattern || budget.pattern.test(path.basename(file.path)));
  if (budget.type === 'dir') {
    return files.reduce((sum, file) => sum + file.size, 0);
  }
  if (budget.type === 'max-file') {
    return files.reduce((max, file) => Math.max(max, file.size), 0);
  }
  if (budget.type === 'gzip-max-file') {
    return files.reduce((max, file) => Math.max(max, zlib.gzipSync(fs.readFileSync(file.path)).length), 0);
  }
  throw new Error(`Unknown budget type: ${budget.type}`);
}

function main() {
  if (!exists('dist')) throw new Error('dist 目录不存在，请先完成构建');
  const failures = [];
  for (const budget of budgets) {
    const actual = measure(budget);
    const line = `${budget.label}: ${format(actual)} / ${format(budget.max)}`;
    if (actual > budget.max) failures.push(line);
    else console.log(line);
  }
  if (failures.length) {
    throw new Error(`资源体积超出预算：\n${failures.join('\n')}`);
  }
  console.log('资源体积检查通过。');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
