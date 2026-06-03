#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadDevLogDataModule() {
  const sandbox = { window: {} };
  vm.runInNewContext(read('devlog-data.js'), sandbox, { filename: 'devlog-data.js' });
  return Array.isArray(sandbox.window.DEVLOG_ENTRIES) ? sandbox.window.DEVLOG_ENTRIES : [];
}

function validateWorklog(worklog) {
  assert(worklog && typeof worklog === 'object', '默认工作看板数据格式错误');
  assert(!Array.isArray(worklog.months), '工作看板 months 应为对象');
  assert(worklog.records && typeof worklog.records === 'object', '工作看板 records 应为对象');
  Object.entries(worklog.records).forEach(([dateKey, value]) => {
    assert(/^\d{4}-\d{2}-\d{2}$/.test(dateKey), `工作看板日期键无效：${dateKey}`);
    assert(value && typeof value.projects === 'object', `工作看板记录格式错误：${dateKey}`);
  });
}

function validateShortcuts(shortcuts) {
  assert(Array.isArray(shortcuts) && shortcuts.length > 0, '默认收藏数据为空或格式错误');
  const ids = new Set();
  const validCategories = new Set(['', 'design', 'ai', 'dev', 'media', 'life', 'ops', 'other']);
  shortcuts.forEach((item, index) => {
    const label = item && (item.title || item.url || index);
    assert(item && typeof item === 'object', `收藏项格式错误：${index}`);
    assert(typeof item.id === 'string' && item.id.trim(), `收藏项缺少 id：${label}`);
    assert(!ids.has(item.id), `收藏项 id 重复：${item.id}`);
    ids.add(item.id);
    assert(typeof item.title === 'string' && item.title.trim(), `收藏项缺少标题：${item.id}`);
    assert(/^https?:\/\//i.test(item.url || ''), `收藏项 URL 必须是 http(s)：${item.id}`);
    assert(!item.category || validCategories.has(item.category), `收藏项分类无效：${item.id}`);
    assert(!item.iconUrl || /^https?:\/\//i.test(item.iconUrl) || item.iconUrl.startsWith('assets/'), `收藏项图标地址无效：${item.id}`);
  });
}

function main() {
  const siteConfig = JSON.parse(read('site-config.json'));
  const indexHtml = read('index.html');
  const siteUrl = String(siteConfig.siteUrl || '').replace(/\/+$/, '');
  assert(siteUrl === 'https://kqwqk.pw', '站点主域名配置不是 kqwqk.pw');
  assert(indexHtml.includes('id="root"'), 'React 根节点缺失');
  assert(indexHtml.includes('src="./src/main.jsx"'), 'React 全站入口未加载');
  assert(indexHtml.includes('%SITE_URL%'), 'HTML 元信息未使用站点域名占位符');
  assert(!indexHtml.includes('rechris-atlas.vercel.app'), 'HTML 生产元信息仍指向旧 Vercel 域名');
  assert(indexHtml.includes('assets/generated/display/about-duck-day.jpg'), '社交分享图仍未使用轻量展示图');
  assert(indexHtml.includes('<meta name="description"'), 'SEO description 缺失');
  assert(indexHtml.includes('property="og:title"'), 'Open Graph 标题缺失');
  assert(indexHtml.includes('name="twitter:card"'), 'Twitter card 缺失');
  assert(indexHtml.includes('application/ld+json'), '结构化数据缺失');
  assert(indexHtml.includes('assets/icons/ui/sun.svg'), '本地图标未用于 favicon');
  assert(!indexHtml.includes('https://img.icons8.com/ios/50/'), '关键 UI 图标仍依赖远程 Icons8');
  assert(!indexHtml.includes('src="app.js"'), '旧 app.js 仍在页面加载');
  assert(!indexHtml.includes('src="weather-module.js"'), '旧天气脚本仍在页面加载');
  assert(!indexHtml.includes('src="devlog-module.js"'), '旧开发日志脚本仍在页面加载');
  assert(!indexHtml.includes('src="life-records.js"'), '旧摄影脚本 life-records.js 仍在页面加载');
  assert(!indexHtml.includes('src="life-record-form.js"'), '旧摄影表单脚本仍在页面加载');

  const photoData = read('photo-records-data.js');
  const photoModule = read('src/photo-module/main.jsx');
  const appEntry = read('src/main.jsx');
  const appConstants = read('src/app-constants.js');
  const shortcutsModule = read('src/features/shortcuts.jsx');
  const worklogModule = read('src/features/worklog.jsx');
  const devlogModule = read('src/features/devlog.jsx');
  const layoutModule = read('src/layout.jsx');
  const generatedDisplayImages = [
    'about-duck-day',
    'about-duck-sunny',
    'about-duck-night',
    'about-duck-moonlight',
    'about-duck-rainy',
    'about-duck-snowy'
  ].map((name) => `assets/generated/display/${name}.jpg`);
  generatedDisplayImages.forEach((filePath) => {
    assert(exists(filePath), `缺少轻量主题插画：${filePath}`);
  });
  assert(photoData.includes('export const PHOTO_RECORDS'), '摄影数据仍未作为模块导出');
  assert(photoData.includes('"exif"'), '摄影数据缺少预计算 EXIF 信息');
  assert(photoModule.includes("import { PHOTO_RECORDS } from '../../photo-records-data.js'"), 'React 摄影模块仍未直接导入摄影数据');
  assert(photoModule.includes('import.meta.env.DEV'), '摄影模块仍会在生产环境探测本地编辑 API');
  assert(photoModule.includes('export default function PhotoJournalApp'), '摄影模块未作为 React 组件导出');
  assert(!photoModule.includes("from 'exifr'"), '摄影详情仍在浏览器端加载 EXIF 解析依赖');
  assert(appEntry.includes('PhotoJournalApp'), '全站 React 入口未使用摄影组件');
  assert(appEntry.includes('lazy(() => import'), '摄影模块未拆分为懒加载入口');
  assert(appEntry.includes("'./features/shortcuts.jsx'") || appEntry.includes('Shortcuts'), '收藏页仍未拆分为独立模块');
  assert(appEntry.includes("'./features/devlog.jsx'") || appEntry.includes('Devlog'), '开发日志仍未拆分为独立模块');
  assert(appEntry.includes("from './layout.jsx'"), '布局组件仍未拆分为独立模块');
  assert(shortcutsModule.includes('readDefaultShortcuts'), '收藏页未以项目默认数据作为入口数据源');
  assert(!appEntry.includes('SHORTCUTS_STORAGE_KEY'), '收藏页仍会优先读取浏览器旧缓存');
  assert(shortcutsModule.includes('defaultShortcuts'), '收藏模块未接管收藏数据');
  assert(shortcutsModule.includes('import.meta.env.DEV'), '收藏模块仍会在生产环境探测本地编辑 API');
  assert(worklogModule.includes('readDefaultWorklog'), '工作看板未以项目默认数据作为入口数据源');
  assert(worklogModule.includes('default-worklog.json'), '工作看板未绑定 default-worklog.json');
  assert(worklogModule.includes('import.meta.env.DEV'), '工作看板仍会在生产环境探测本地编辑 API');
  assert(worklogModule.includes('/__local-admin/worklog'), '工作看板缺少本地写回接口');
  assert(!worklogModule.includes('localStorage.setItem'), '工作看板仍会写入浏览器缓存');
  assert(devlogModule.includes('siteContent'), '开发日志模块未接管开发日志数据');
  assert(layoutModule.includes('useWeather'), '天气卡片未拆分到布局/天气模块');
  assert(appConstants.includes('SITE_URL'), '缺少单一站点域名常量');
  assert(appConstants.includes('assets/generated/display/about-duck-day.jpg'), '首页主题图仍未使用轻量展示图');

  const viteConfig = read('vite.config.js');
  assert(viteConfig.includes("'default-worklog.json'"), '工作看板默认数据未复制到构建产物');
  assert(viteConfig.includes('/__local-admin/worklog'), 'Vite 未提供工作看板本地写回接口');
  assert(viteConfig.includes('siteMetadataPlugin'), 'Vite 未集中注入站点域名元信息');
  assert(viteConfig.includes("'assets/icons'"), '本地图标目录未复制到构建产物');
  assert(viteConfig.includes("'assets/generated/display'"), '轻量主题插画目录未复制到构建产物');
  assert(!viteConfig.includes("['assets/generated', 'assets/generated']"), '构建仍会复制全部 generated 原图目录');
  assert(viteConfig.includes("'assets/photos/thumbs'"), '摄影缩略图目录未复制到构建产物');
  assert(!viteConfig.includes("['assets/photos', 'assets/photos']"), '构建仍会复制全部原图目录');
  assert(!viteConfig.includes("'life-records.js'"), '旧摄影脚本仍会被复制到构建产物');
  assert(!viteConfig.includes("'life-record-form.js'"), '旧摄影表单脚本仍会被复制到构建产物');
  assert(viteConfig.includes("process.env.SOURCE_MAPS === 'true'"), '生产 sourcemap 未改为显式开启');

  validateShortcuts(JSON.parse(read('default-shortcuts.json')));
  validateWorklog(JSON.parse(read('default-worklog.json')));

  const packageJson = JSON.parse(read('package.json'));
  assert(packageJson.scripts.build.includes('check-asset-budgets.js'), '构建流程缺少资源体积预算检查');
  assert(!packageJson.dependencies.overlayscrollbars, '未使用的 OverlayScrollbars 依赖仍在生产依赖中');

  const shortcutsApi = read('api/shortcuts.js');
  assert(shortcutsApi.includes('SHORTCUTS_WRITE_SECRET not configured'), '快捷方式 API 缺少无密钥写入保护');
  assert(shortcutsApi.includes('SHORTCUTS_ALLOW_UNSAFE_WRITE'), '快捷方式 API 缺少临时调试开关');

  const siteContent = JSON.parse(read('site-content.json'));
  const siteDevLog = Array.isArray(siteContent.devLog) ? siteContent.devLog : [];
  const embeddedDevLog = loadDevLogDataModule();
  const hasPhotoMilestone = [...siteDevLog, ...embeddedDevLog].some((entry) => (
    entry && entry.title === '摄影模块 React 大版本上线'
  ));
  assert(hasPhotoMilestone, '缺少摄影模块大版本开发日志');

  console.log('站点冒烟检查通过。');
}

try {
  main();
} catch (error) {
  console.error(`站点冒烟检查失败：${error.message}`);
  process.exit(1);
}
