#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PHOTOS_DIR = path.join(ROOT, 'assets/photos');
const THUMBS_DIR = path.join(PHOTOS_DIR, 'thumbs');
const MAX_THUMB_EDGE = 720;
const THUMB_QUALITY = 72;
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg']);
const force = process.argv.includes('--force');

function listPhotoFiles() {
  return fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .filter((name) => !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));
}

function ensureSips() {
  const result = spawnSync('sips', ['--version'], { stdio: 'ignore' });
  if (result.status !== 0) {
    throw new Error('未找到 macOS sips，无法生成照片预览图');
  }
}

function previewName(sourceName) {
  return `${path.basename(sourceName, path.extname(sourceName))}.jpg`;
}

function outputName(sourceName) {
  return `${path.basename(sourceName, path.extname(sourceName))}.jpg`;
}

function generateDerivative(sourceName, outputDir, maxEdge, quality) {
  const sourcePath = path.join(PHOTOS_DIR, sourceName);
  const outputPath = path.join(outputDir, outputName(sourceName));
  if (!force && fs.existsSync(outputPath)) {
    return false;
  }

  const result = spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), '-Z', String(maxEdge), sourcePath, '--out', outputPath], {
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `生成失败：${sourceName}`).trim());
  }
  return true;
}

function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    throw new Error('assets/photos 目录不存在');
  }
  ensureSips();
  fs.mkdirSync(THUMBS_DIR, { recursive: true });

  const files = listPhotoFiles();
  let thumbsGenerated = 0;
  files.forEach((file) => {
    if (generateDerivative(file, THUMBS_DIR, MAX_THUMB_EDGE, THUMB_QUALITY)) thumbsGenerated += 1;
  });

  console.log(`照片缩略图检查完成：${files.length} 张原图，新增 ${thumbsGenerated} 张缩略图。`);
}

try {
  main();
} catch (error) {
  console.error(`照片预览图生成失败：${error.message}`);
  process.exit(1);
}
