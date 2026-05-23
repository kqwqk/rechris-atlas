#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'photo-records-data.js');
const PHOTOS_DIR = path.join(ROOT, 'assets/photos');

const KNOWN_CONTENT = {
  'DSC_1527.jpg': {
    title: '景德镇陶瓷龙',
    content: '风火仙师庙中的陶瓷龙细节，浓烈色彩和鳞片纹理让画面更有仪式感。',
    location: '江西景德镇 · 风火仙师庙'
  },
  'DSC_1701.jpg': {
    title: '洋彩镂空福寿纹盘口瓶',
    content: '清代乾隆瓷器的镂空层次和粉彩纹样，适合作为传统器物细节观察。',
    location: '江西景德镇 · 中国陶瓷博物馆'
  },
  'DSC_1707.jpg': {
    title: '松石绿地粉彩龙耳瓶',
    content: '清代乾隆器物的松石绿地与龙耳造型，记录釉色、纹样和器型的秩序感。',
    location: '江西景德镇 · 中国陶瓷博物馆'
  },
  'DSC_2096.jpg': {
    title: '曲院风荷',
    content: '西湖水面与荷叶交织的夏日片段，画面保留安静的湖面层次。',
    location: '杭州 · 曲院风荷'
  },
  'IMG_2644.jpg': {
    title: '曲院风荷',
    content: '长焦视角下的西湖荷景，保留植物、水面和远处景深的关系。',
    location: '杭州 · 曲院风荷'
  },
  'IMG_2573.JPG': {
    title: '释迦牟尼卧佛像',
    content: '南京牛首山佛顶宫中的卧佛像，记录空间尺度和静穆的光线。',
    location: '南京 · 牛首山佛顶宫'
  },
  'IMG_2574.JPG': {
    title: '释迦牟尼佛舍利宫',
    content: '佛顶宫内的舍利宫空间，金色细节和对称结构构成强烈的中心感。',
    location: '南京 · 牛首山'
  },
  'IMG_2912.JPG': {
    title: '黄公望结庐处',
    content: '“浑厚华滋，图成长卷垂千载；精严逸迈，论定高名冠四家。”',
    location: '杭州富阳 · 黄公望隐居地'
  },
  '抱虎角.JPG': {
    title: '抱虎角',
    content: '海岸线与礁石交错的开阔景致，记录风、浪和远处天光的层次。',
    location: '海南文昌 · 抱虎角'
  }
};

const SERIES_CONTENT = [
  {
    test: (fileName) => /^DSC_27(56|58)$/.test(path.basename(fileName, path.extname(fileName))),
    title: '海边风景',
    content: '海岸附近的明亮风景，记录强光、远景和开阔空间里的色彩关系。',
    location: '广东惠州 · 大亚湾海岸'
  },
  {
    test: (fileName) => /^DSC_28(04|13|22|46|63|81)$/.test(path.basename(fileName, path.extname(fileName))),
    title: '海岸光影',
    content: '同一组海岸散步中的连续观察，保留水面、岸线和午后光线的变化。',
    location: '广东惠州 · 大亚湾海岸'
  },
  {
    test: (fileName) => /^DSC_48(33|41|78|89)$/.test(path.basename(fileName, path.extname(fileName))),
    title: '镇江春日',
    content: '镇江春日出行中的城市与风景片段，记录清透光线和建筑环境。',
    location: '江苏镇江'
  },
  {
    test: (fileName) => /^DSC_(0844|1028|1199)_Original$/.test(path.basename(fileName, path.extname(fileName))),
    title: '山海路上',
    content: '来自浙江东部旅途的影像记录，保留路途中自然景观的安静质感。',
    location: '浙江东部'
  }
];

function loadRecords() {
  const source = fs.readFileSync(DATA_FILE, 'utf8');
  const runnable = source
    .replace(/^\s*export\s+const\s+PHOTO_RECORDS\s*=/, 'window.PHOTO_RECORDS =')
    .replace(/if \(typeof window !== 'undefined'\) \{\s*window\.PHOTO_RECORDS = PHOTO_RECORDS;\s*\}\s*$/s, '');
  const sandbox = { window: {} };
  vm.runInNewContext(runnable, sandbox, { filename: DATA_FILE });
  return Array.isArray(sandbox.window.PHOTO_RECORDS) ? sandbox.window.PHOTO_RECORDS : [];
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

function fileNameFor(record) {
  const imagePath = Array.isArray(record.images) ? record.images[0] : '';
  return imagePath ? path.basename(imagePath) : '';
}

function thumbPathFor(fileName) {
  return `assets/photos/thumbs/${path.basename(fileName, path.extname(fileName))}.jpg`;
}

function knownContentFor(fileName) {
  if (KNOWN_CONTENT[fileName]) return KNOWN_CONTENT[fileName];
  const series = SERIES_CONTENT.find((entry) => entry.test(fileName));
  if (series) return series;
  return null;
}

function formatGpsLocation(exif) {
  if (Number.isFinite(exif?.latitude) && Number.isFinite(exif?.longitude)) {
    return `GPS ${exif.latitude.toFixed(4)}, ${exif.longitude.toFixed(4)}`;
  }
  return '';
}

async function readExif(fileName) {
  try {
    const exifr = (await import('exifr')).default;
    return await exifr.parse(path.join(PHOTOS_DIR, fileName), [
      'Make',
      'Model',
      'LensMake',
      'LensModel',
      'DateTimeOriginal',
      'CreateDate',
      'ModifyDate',
      'FNumber',
      'ApertureValue',
      'ExposureTime',
      'ShutterSpeedValue',
      'ISO',
      'ISOSpeedRatings',
      'FocalLength',
      'FocalLengthIn35mmFormat',
      'FocalLengthIn35mmFilm',
      'GPSLatitude',
      'GPSLatitudeRef',
      'GPSLongitude',
      'GPSLongitudeRef',
      'GPSAltitude',
      'ExposureMode',
      'ExposureProgram',
      'MeteringMode',
      'WhiteBalance',
      'ExposureCompensation',
      'ExposureBiasValue',
      'Flash',
      'ColorSpace',
      'Software'
    ]);
  } catch (error) {
    return {};
  }
}

function formatDateTime(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  const pad = (part) => String(part).padStart(2, '0');
  return {
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`
  };
}

function formatExifDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value).replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatAperture(value) {
  if (value == null || value === '') return '';
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return String(value);
  return `f/${Number.isInteger(numeric) ? numeric : numeric.toFixed(1).replace(/\.0$/, '')}`;
}

function formatShutterSpeed(value) {
  if (value == null || value === '') return '';
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return String(value);
  if (numeric >= 1) return `${Number.isInteger(numeric) ? numeric : numeric.toFixed(1).replace(/\.0$/, '')}s`;
  return `1/${Math.round(1 / numeric)}s`;
}

function formatFocalLength(value) {
  if (value == null || value === '') return '';
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return String(value);
  return `${Number.isInteger(numeric) ? numeric : numeric.toFixed(1).replace(/\.0$/, '')}mm`;
}

function formatExposureBias(value) {
  if (value == null || value === '') return '';
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return String(value);
  return `${numeric > 0 ? '+' : ''}${numeric} EV`;
}

function formatDisplayValue(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date) return formatExifDate(value);
  if (Array.isArray(value)) return value.map(formatDisplayValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, entryValue]) => entryValue != null && entryValue !== '' && typeof entryValue !== 'object')
      .map(([key, entryValue]) => `${key}: ${entryValue}`)
      .join(' · ');
  }
  return String(value);
}

function formatGpsCoordinate(value, ref) {
  if (value == null || value === '') return '';
  const suffix = ref ? ` ${ref}` : '';
  if (Array.isArray(value)) return `${value.join(',')}°${suffix}`;
  const numeric = Number.parseFloat(value);
  if (!Number.isNaN(numeric)) return `${numeric.toFixed(5)}°${suffix}`;
  return `${String(value)}°${suffix}`;
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => (
      entryValue != null &&
      entryValue !== '' &&
      !(typeof entryValue === 'object' && !Array.isArray(entryValue) && Object.keys(entryValue).length === 0)
    ))
  );
}

function formatExifData(exif = {}) {
  const focalLength = formatFocalLength(exif.FocalLength);
  const focalLength35mm = formatFocalLength(exif.FocalLengthIn35mmFormat || exif.FocalLengthIn35mmFilm);
  const gps = compactObject({
    latitude: formatGpsCoordinate(exif.GPSLatitude, exif.GPSLatitudeRef),
    longitude: formatGpsCoordinate(exif.GPSLongitude, exif.GPSLongitudeRef),
    altitude: exif.GPSAltitude ? `${exif.GPSAltitude}m` : ''
  });

  return compactObject({
    aperture: formatAperture(exif.FNumber || exif.ApertureValue),
    shutter: formatShutterSpeed(exif.ExposureTime || exif.ShutterSpeedValue),
    iso: exif.ISO || exif.ISOSpeedRatings || '',
    focal: focalLength35mm || focalLength,
    focalActual: focalLength,
    camera: [exif.Make, exif.Model].filter(Boolean).join(' ').trim(),
    lens: [exif.LensMake, exif.LensModel].filter(Boolean).join(' ').trim() || exif.LensModel || '',
    dateTime: formatExifDate(exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate),
    exposureMode: formatDisplayValue(exif.ExposureMode),
    exposureProgram: formatDisplayValue(exif.ExposureProgram),
    meteringMode: formatDisplayValue(exif.MeteringMode),
    whiteBalance: formatDisplayValue(exif.WhiteBalance),
    exposureBias: formatExposureBias(exif.ExposureCompensation || exif.ExposureBiasValue),
    flash: formatDisplayValue(exif.Flash),
    colorSpace: formatDisplayValue(exif.ColorSpace),
    software: formatDisplayValue(exif.Software),
    gps
  });
}

async function main() {
  const records = loadRecords();
  let changed = 0;

  for (const record of records) {
    const fileName = fileNameFor(record);
    if (!fileName) continue;
    const exif = await readExif(fileName);
    const known = knownContentFor(fileName);
    const shotTime = formatDateTime(exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate);
    const camera = [exif.Make, exif.Model].filter(Boolean).join(' ').trim();
    const lens = String(exif.LensModel || record.lens || '').trim();
    const fallbackTitle = path.basename(fileName, path.extname(fileName)).replace(/[-_]+/g, ' ');
    const next = {
      ...record,
      title: known?.title || (record.title && !/^(DSC|IMG)_/i.test(record.title) ? record.title : `影像记录 · ${fallbackTitle}`),
      content: known?.content || (record.content && !record.content.includes('说明待补充')
        ? record.content
        : '一帧来自个人摄影归档的发布照片，记录当时的光线、空间和观看感受。'),
      thumbnails: [thumbPathFor(fileName)],
      location: known?.location || record.location || formatGpsLocation(exif),
      camera: camera || record.camera || '',
      lens,
      exif: formatExifData(exif),
      date: shotTime?.date || record.date,
      time: shotTime?.time || record.time,
      publishedAt: record.publishedAt || new Date('2026-05-01T03:18:20.475Z').toISOString()
    };
    Object.keys(next).forEach((key) => {
      if (next[key] === undefined) delete next[key];
    });
    if (JSON.stringify(next) !== JSON.stringify(record)) {
      Object.assign(record, next);
      changed += 1;
    }
  }

  fs.writeFileSync(DATA_FILE, serializeRecords(records), 'utf8');
  console.log(`照片元信息补齐完成：更新 ${changed} 条，合计 ${records.length} 条。`);
}

main().catch((error) => {
  console.error(`照片元信息补齐失败：${error.message}`);
  process.exit(1);
});
