# RECHRIS ATLAS Handoff

更新时间：2026-05-23

## 1. 项目概览

`RECHRIS ATLAS` 是一个部署在 Vercel 的个人站点，把首页氛围入口、收藏工具、摄影发布和开发日志放在同一个 React/Vite 单页应用里。

核心目标：

- 首页保持安静、有氛围，但不是营销页。
- 收藏页偏工具型，重点是清晰、紧凑、可编辑。
- 摄影页以看图为主，列表轻、详情完整。
- 开发日志保持时间线阅读体验。
- 构建产物受资源预算约束，避免无意发布过大的原始资源。

## 2. 当前状态

最近完成的事：

- 新增照片 `assets/photos/新安江山水画廊.JPG`。
- 已执行 `npm run photos:sync`，生成 `assets/photos/thumbs/新安江山水画廊.jpg`。
- `photo-records-data.js` 已新增这张照片的记录，标题为 `影像记录 · 新安江山水画廊`。
- 构建检查曾因地点缺失失败，已补为 `新安江山水画廊`。
- 本地 `npm run build` 通过。
- 已清理摄影数据历史字段：移除全部 25 条记录的 `displayImages`，同步脚本不再写入该字段。
- Vercel preview 部署成功：
  [https://rechris-atlas-gv1hmcw6l-kqwqks-projects.vercel.app](https://rechris-atlas-gv1hmcw6l-kqwqks-projects.vercel.app)

当前数据规模：

- 摄影记录：25 条。
- `assets/photos/` 根目录照片：25 张。
- `assets/photos/thumbs/` 缩略图：25 张。

## 3. 当前工作区

当前 `git status --short` 有这些改动：

- `M HANDOFF.md`
- `M docs/DEVELOPMENT.md`
- `M photo-records-data.js`
- `M scripts/sync-photo-records.js`
- `M scripts/enrich-photo-records.js`
- `A assets/photos/新安江山水画廊.JPG`
- `?? assets/photos/thumbs/新安江山水画廊.jpg`

这些都是本轮相关改动，不要当成无关脏文件清理。新增原图已处于 staged 状态，新增缩略图还未 staged。

## 4. 关键文件

入口和布局：

- [src/main.jsx](/Users/kqwqk/Documents/rechris-atlas/src/main.jsx)
- [src/layout.jsx](/Users/kqwqk/Documents/rechris-atlas/src/layout.jsx)
- [src/app-constants.js](/Users/kqwqk/Documents/rechris-atlas/src/app-constants.js)
- [src/app-utils.js](/Users/kqwqk/Documents/rechris-atlas/src/app-utils.js)

功能模块：

- [src/features/shortcuts.jsx](/Users/kqwqk/Documents/rechris-atlas/src/features/shortcuts.jsx)
- [src/features/devlog.jsx](/Users/kqwqk/Documents/rechris-atlas/src/features/devlog.jsx)
- [src/features/weather.js](/Users/kqwqk/Documents/rechris-atlas/src/features/weather.js)
- [src/photo-module/main.jsx](/Users/kqwqk/Documents/rechris-atlas/src/photo-module/main.jsx)
- [src/photo-module/photo-module.css](/Users/kqwqk/Documents/rechris-atlas/src/photo-module/photo-module.css)

数据和内容：

- [photo-records-data.js](/Users/kqwqk/Documents/rechris-atlas/photo-records-data.js)
- [site-content.json](/Users/kqwqk/Documents/rechris-atlas/site-content.json)
- [default-shortcuts.json](/Users/kqwqk/Documents/rechris-atlas/default-shortcuts.json)
- [site-config.json](/Users/kqwqk/Documents/rechris-atlas/site-config.json)

脚本和验证：

- [scripts/generate-photo-previews.js](/Users/kqwqk/Documents/rechris-atlas/scripts/generate-photo-previews.js)
- [scripts/sync-photo-records.js](/Users/kqwqk/Documents/rechris-atlas/scripts/sync-photo-records.js)
- [scripts/enrich-photo-records.js](/Users/kqwqk/Documents/rechris-atlas/scripts/enrich-photo-records.js)
- [check-photo-assets.js](/Users/kqwqk/Documents/rechris-atlas/check-photo-assets.js)
- [scripts/smoke-check.js](/Users/kqwqk/Documents/rechris-atlas/scripts/smoke-check.js)
- [scripts/check-asset-budgets.js](/Users/kqwqk/Documents/rechris-atlas/scripts/check-asset-budgets.js)
- [vite.config.js](/Users/kqwqk/Documents/rechris-atlas/vite.config.js)

## 5. 固定照片流程

用户说“添加照片”时，默认执行这套流程：

1. 扫描 `assets/photos/` 根目录里的新增 `.jpg` / `.jpeg` / `.JPG` / `.JPEG` 文件。
2. 执行 `npm run photos:sync`。
3. 脚本会生成 `assets/photos/thumbs/` 缩略图，更新 `photo-records-data.js`，并补齐 EXIF/标题等元信息。
4. 如果 `npm run build` 因照片质量检查失败，优先补齐缺失字段，常见是 `location`、`lens`、`date`、`time`、`content`。
5. 刷新本地预览，切到“摄影”页确认新增照片可见。
6. 需要发布时，再跑 `npm run build` 和 Vercel 部署。

注意：文档已修正为把新照片放在 `assets/photos/` 根目录，不再使用旧说明里的 `assets/photos/originals/`。

## 6. 构建与部署

常用命令：

```bash
npm run dev
npm run photos:sync
npm run smoke
npm run build
vercel deploy /Users/kqwqk/Documents/rechris-atlas -y
```

`npm run build` 会依次执行：

- `node check-photo-assets.js`
- `npm run smoke`
- `vite build`
- `node scripts/check-asset-budgets.js`

最近一次本地构建通过，关键预算结果：

- `dist total`: 150.2 MB / 180.0 MB
- `photos total`: 145.9 MB / 170.0 MB
- `largest photo thumb`: 217.7 KB / 250.0 KB
- `main js gzip`: 约 64 KB / 150 KB
- `main css gzip`: 约 8.8-8.9 KB / 20 KB

部署策略：

- 默认部署 Vercel preview。
- 只有用户明确说生产发布时，才使用 `vercel deploy --prod`。
- 当前最新 preview：
  [https://rechris-atlas-gv1hmcw6l-kqwqks-projects.vercel.app](https://rechris-atlas-gv1hmcw6l-kqwqks-projects.vercel.app)

## 7. 架构要点

整体是 React 19 + Vite 8 的单页应用。

摄影模块：

- 页面从 `photo-records-data.js` 读取照片索引，不会自动展示文件夹里的每个图片。
- 列表预览优先使用 `record.thumbnails`。
- 详情页使用 `record.images` 作为原图来源。
- 摄影记录契约只保留 `images` 与 `thumbnails`，已移除历史 `displayImages` 字段。

构建资源复制：

- `vite.config.js` 会复制 `assets/icons`、`assets/generated/display`、`assets/photos/thumbs` 和 `assets/leaves.mp4`。
- 也会复制 `assets/photos/` 根目录下的 jpg/jpeg 原图，不复制子目录里的其他内容。
- `scripts/check-asset-budgets.js` 对总 dist、photos、generated、最大缩略图、JS/CSS gzip 设预算。

本地编辑：

- 收藏和摄影的本地写回接口在 Vite dev server 的 `__local-admin/*` 下。
- 生产环境不要重新打开本地编辑探测。

## 8. 环境依赖

本地需要：

- Node.js
- npm
- macOS `sips`，用于生成照片缩略图
- Vercel CLI
- 已链接的 `.vercel/project.json`

线上相关：

- Vercel 项目：`rechris-atlas`
- 主域名：`kqwqk.pw`
- 如果启用线上收藏持久化，需要配置：
  `KV_REST_API_URL`
  `KV_REST_API_TOKEN`
  `SHORTCUTS_WRITE_SECRET`

可选调试变量：

- `SHORTCUTS_ALLOW_UNSAFE_WRITE=1`

## 9. UI 和产品约束

- 保持现有视觉语言，不要突然换设计体系。
- 摄影列表应以图片为主，文字信息主要放在详情页。
- 收藏页保持工具感，不做营销卡片化。
- 开发日志保持时间线阅读，不做瀑布流。
- 新增关键 UI 图标优先使用本地资源。
- 不要重新引入远程 Icons8 作为关键 UI 依赖。
- 不要重新把原始 `assets/generated/*.png` 整包复制到线上。
- 不要删除资源预算检查和冒烟检查。

## 10. 已知风险和下一步

短期风险：

- `assets/photos/` 原图总量接近预算上限的一部分，当前 photos 总量 145.9 MB / 170.0 MB，继续加照片会更快逼近预算。
- `photo-records-data.js` 会随照片增加继续变大，但目前仍可接受。

建议下一步：

1. 确认是否要把最新 preview 提升到 production。
2. 如果继续添加照片，优先考虑压缩原图或重新设计生产资源策略，否则 photos 预算会先撞线。
3. 如需正式收口本轮改动，先 `git add` 新缩略图、文档和照片索引，再提交。

## 11. 不要做

- 不要随手回滚当前工作区改动。
- 不要把主域名从 `kqwqk.pw` 改回 Vercel 默认域。
- 不要绕过 `npm run build` 直接部署。
- 不要删除 `assets/photos/thumbs`。
- 不要把摄影页改回纯 `localStorage` 数据源。
- 不要把生产环境改成依赖 `__local-admin/*`。
