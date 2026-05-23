#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const PHOTOS_DIR = path.join(ROOT, 'assets/photos');
const DATA_FILE = path.join(ROOT, 'photo-records-data.js');
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg']);

function listPhotoFiles() {
  return fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function loadPhotoRecords() {
  const source = fs.readFileSync(DATA_FILE, 'utf8');
  const runnable = source
    .replace(/^\s*export\s+const\s+PHOTO_RECORDS\s*=/, 'window.PHOTO_RECORDS =')
    .replace(/if \(typeof window !== 'undefined'\) \{\s*window\.PHOTO_RECORDS = PHOTO_RECORDS;\s*\}\s*$/s, '');
  const sandbox = { window: {} };
  vm.runInNewContext(runnable, sandbox, { filename: DATA_FILE });
  return Array.isArray(sandbox.window.PHOTO_RECORDS) ? sandbox.window.PHOTO_RECORDS : [];
}

function thumbPathFor(fileName) {
  return `assets/photos/thumbs/${path.basename(fileName, path.extname(fileName))}.jpg`;
}

function imagePathFor(fileName) {
  return `assets/photos/${fileName}`;
}

function titleFor(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

function safeIdFor(fileName, existingIds) {
  const baseName = titleFor(fileName);
  let slug = baseName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    slug = Buffer.from(baseName).toString('hex').slice(0, 24);
  }

  let id = `photo-${slug}`;
  let counter = 2;
  while (existingIds.has(id)) {
    id = `photo-${slug}-${counter}`;
    counter += 1;
  }
  existingIds.add(id);
  return id;
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
  };
}

async function readShotTime(fileName) {
  try {
    const exifr = (await import('exifr')).default;
    const exif = await exifr.parse(path.join(PHOTOS_DIR, fileName), ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
    const value = exif && (exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate);
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return formatDateTime(value);
    }
  } catch (error) {
    // Keep sync resilient; date can be edited later in the local photo panel.
  }

  const stats = fs.statSync(path.join(PHOTOS_DIR, fileName));
  return formatDateTime(stats.mtime);
}

async function readPhotoMetadata(fileName) {
  try {
    const exifr = (await import('exifr')).default;
    const exif = await exifr.parse(path.join(PHOTOS_DIR, fileName), [
      'Make',
      'Model',
      'LensModel',
      'GPSLatitude',
      'GPSLongitude'
    ]);
    const camera = [exif?.Make, exif?.Model].filter(Boolean).join(' ').trim();
    const lens = String(exif?.LensModel || '').trim();
    const latitude = Number.isFinite(exif?.latitude) ? exif.latitude : null;
    const longitude = Number.isFinite(exif?.longitude) ? exif.longitude : null;
    const location = latitude != null && longitude != null
      ? `GPS ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : '';
    return { camera, lens, location };
  } catch (error) {
    return { camera: '', lens: '', location: '' };
  }
}

function serializeRecords(records) {
  return [
    `export const PHOTO_RECORDS = ${JSON.stringify(records, null, 2)};`,
    '',
    "if (typeof window !== 'undefined') {",
    '  window.PHOTO_RECORDS = PHOTO_RECORDS;',
    '}',
    ''
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    throw new Error('assets/photos 目录不存在');
  }

  const records = loadPhotoRecords();
  const existingImages = new Set(records.flatMap((record) => record.images || []));
  const existingIds = new Set(records.map((record) => record.id).filter(Boolean));
  const newFiles = listPhotoFiles().filter((fileName) => !existingImages.has(imagePathFor(fileName)));
  const publishedAt = new Date().toISOString();

  const added = [];
  for (const fileName of newFiles) {
    const shotTime = await readShotTime(fileName);
    const metadata = await readPhotoMetadata(fileName);
    const record = {
      id: safeIdFor(fileName, existingIds),
      type: 'photo',
      title: `影像记录 · ${titleFor(fileName)}`,
      content: '一帧来自个人摄影归档的发布照片，更多说明可在本地编辑面板继续补充。',
      images: [imagePathFor(fileName)],
      thumbnails: [thumbPathFor(fileName)],
      tags: ['摄影'],
      publishedAt,
      date: shotTime.date,
      time: shotTime.time,
      location: metadata.location,
      camera: metadata.camera,
      lens: metadata.lens,
      mood: 'peaceful'
    };
    records.push(record);
    added.push(fileName);
  }

  if (added.length > 0) {
    fs.writeFileSync(DATA_FILE, serializeRecords(records), 'utf8');
  }

  console.log(`照片数据同步完成：现有 ${records.length} 条记录，新增 ${added.length} 张。`);
  added.forEach((fileName) => console.log(`  + ${fileName}`));
}

main().catch((error) => {
  console.error(`照片数据同步失败：${error.message}`);
  process.exit(1);
});
