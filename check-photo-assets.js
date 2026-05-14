#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_FILE = path.join(__dirname, 'photo-records-data.js');

function loadPhotoRecords() {
  const sandbox = { window: {} };
  const code = fs.readFileSync(DATA_FILE, 'utf8')
    .replace(/^\s*export\s+const\s+PHOTO_RECORDS\s*=/, 'window.PHOTO_RECORDS =')
    .replace(/if \(typeof window !== 'undefined'\) \{\s*window\.PHOTO_RECORDS = PHOTO_RECORDS;\s*\}\s*$/s, '');
  vm.runInNewContext(code, sandbox, { filename: DATA_FILE });
  return Array.isArray(sandbox.window.PHOTO_RECORDS) ? sandbox.window.PHOTO_RECORDS : [];
}

function main() {
  const records = loadPhotoRecords();
  const missing = [];
  const qualityIssues = [];
  const ids = new Set();

  records.forEach((record) => {
    if (!record.id || ids.has(record.id)) {
      qualityIssues.push(`${record.id || 'unknown'} -> 照片 ID 缺失或重复`);
    }
    if (record.id) ids.add(record.id);

    const sourceImages = record.images || [];
    const publishImages = [
      ...(record.thumbnails || []),
      ...(record.images || [])
    ];

    [...sourceImages, ...publishImages].forEach((imagePath) => {
      const absolutePath = path.join(__dirname, imagePath);
      if (!fs.existsSync(absolutePath)) {
        missing.push(`${record.id || 'unknown'} -> ${imagePath}`);
      }
    });

    if (!publishImages.length) {
      qualityIssues.push(`${record.id || 'unknown'} -> 缺少发布用缩略图或原图`);
    }

    const title = String(record.title || '').trim();
    const content = String(record.content || '').trim();
    const location = String(record.location || '').trim();
    const lens = String(record.lens || '').trim();
    const date = String(record.date || '').trim();
    const time = String(record.time || '').trim();

    if (!title || /^(DSC|IMG)_/i.test(title)) {
      qualityIssues.push(`${record.id || 'unknown'} -> 标题仍像原始文件名`);
    }
    if (!content || content.includes('说明待补充')) {
      qualityIssues.push(`${record.id || 'unknown'} -> 说明缺失或仍是占位文案`);
    }
    if (!location) {
      qualityIssues.push(`${record.id || 'unknown'} -> 地点缺失`);
    }
    if (!lens) {
      qualityIssues.push(`${record.id || 'unknown'} -> 镜头信息缺失`);
    }
    if (!date || !time) {
      qualityIssues.push(`${record.id || 'unknown'} -> 拍摄日期或时间缺失`);
    }
  });

  if (missing.length > 0) {
    console.error('照片数据中存在找不到的图片路径:');
    missing.forEach(item => console.error(`- ${item}`));
    process.exit(1);
  }

  if (qualityIssues.length > 0) {
    console.error('照片内容质量检查未通过:');
    qualityIssues.forEach(item => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log(`照片资源检查通过：${records.length} 条记录。`);
}

main();
