#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'assets/generated');
const OUTPUT_DIR = path.join(SOURCE_DIR, 'display');

const images = [
  'about-duck-day',
  'about-duck-sunny',
  'about-duck-night',
  'about-duck-moonlight',
  'about-duck-rainy',
  'about-duck-snowy'
];

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  images.forEach((name) => {
    const source = path.join(SOURCE_DIR, `${name}.png`);
    const output = path.join(OUTPUT_DIR, `${name}.jpg`);
    if (!fs.existsSync(source)) {
      throw new Error(`缺少主题插画源文件：${source}`);
    }
    execFileSync('sips', [
      '--resampleHeightWidthMax', '1600',
      '--setProperty', 'format', 'jpeg',
      '--setProperty', 'formatOptions', '82',
      source,
      '--out', output
    ], { stdio: 'ignore' });
    console.log(`generated ${path.relative(ROOT, output)}`);
  });
}

try {
  main();
} catch (error) {
  console.error(`主题插画生成失败：${error.message}`);
  process.exit(1);
}
