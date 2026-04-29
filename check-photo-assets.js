#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_FILE = path.join(__dirname, 'photo-records-data.js');

function loadPhotoRecords() {
  const sandbox = { window: {} };
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  vm.runInNewContext(code, sandbox, { filename: DATA_FILE });
  return Array.isArray(sandbox.window.PHOTO_RECORDS) ? sandbox.window.PHOTO_RECORDS : [];
}

function main() {
  const records = loadPhotoRecords();
  const missing = [];

  records.forEach((record) => {
    (record.images || []).forEach((imagePath) => {
      const absolutePath = path.join(__dirname, imagePath);
      if (!fs.existsSync(absolutePath)) {
        missing.push(`${record.id || 'unknown'} -> ${imagePath}`);
      }
    });
  });

  if (missing.length > 0) {
    console.error('照片数据中存在找不到的图片路径:');
    missing.forEach(item => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log(`照片资源检查通过：${records.length} 条记录。`);
}

main();
