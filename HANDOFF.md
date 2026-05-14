# RECHRIS ATLAS Handoff

## 1. 项目目标

`RECHRIS ATLAS` 是一个部署在 Vercel 上的个人站点，目标是把设计收藏、摄影发布、开发日志和日常氛围体验统一到一个静态前端里。

核心目标：

- 保持首页、收藏、摄影、开发日志四个主视图的一致体验。
- 摄影内容以“发布可读、详情可看、资源可控”为核心。
- 部署产物保持轻量，避免把原始大资源直接带到线上。
- 在不新增复杂后端的前提下，保留本地编辑和项目文件回写能力。

## 2. 当前完成情况

截至 2026-05-11，这一轮已完成：

- 主域名统一到 `https://kqwqk.pw`。
- `index.html` 的 `canonical`、OG、Twitter image、JSON-LD 均改为通过站点域名配置注入。
- 首页主题插画已从原始 PNG 切换到轻量 JPG 展示图，目录为 `assets/generated/display/`。
- 构建时不再复制整个 `assets/generated/`，只复制轻量展示图。
- 构建时只发布摄影 `display/` 和 `previews/`，不发布原始照片。
- 摄影详情页已改为读取预生成 `displayImages` 和预计算 `exif`，详情速度明显提升。
- `src/main.jsx` 已拆出布局、天气、收藏、开发日志模块。
- 生产环境已避免收藏/摄影模块对 `/__local-admin/status` 的无效探测。
- 构建与预算校验已经接入 `npm run build`。
- 最新确认过的生产部署在 `kqwqk.pw` 正常可访问。

截至本次交接，刚开始但未完成的工作：

- 摄影列表页缩略图进一步提速。
- 已开始把摄影列表从 `previews/` 再下沉为更小的 `thumbs/`，相关脚本已改一半，但还没有生成资源、补齐数据、接入构建和验证。

## 3. 当前架构

整体是单页 React + Vite 的静态站点：

- 入口应用：[src/main.jsx](/Users/kqwqk/Documents/rechris-atlas/src/main.jsx)
- 站点常量与站点 URL 配置：[src/app-constants.js](/Users/kqwqk/Documents/rechris-atlas/src/app-constants.js)
- 通用工具：[src/app-utils.js](/Users/kqwqk/Documents/rechris-atlas/src/app-utils.js)
- 布局与首页组件：[src/layout.jsx](/Users/kqwqk/Documents/rechris-atlas/src/layout.jsx)
- 收藏模块：[src/features/shortcuts.jsx](/Users/kqwqk/Documents/rechris-atlas/src/features/shortcuts.jsx)
- 开发日志模块：[src/features/devlog.jsx](/Users/kqwqk/Documents/rechris-atlas/src/features/devlog.jsx)
- 天气 hook：[src/features/weather.js](/Users/kqwqk/Documents/rechris-atlas/src/features/weather.js)
- 摄影模块：[src/photo-module/main.jsx](/Users/kqwqk/Documents/rechris-atlas/src/photo-module/main.jsx)

数据来源分为三类：

- 收藏：默认来自 `default-shortcuts.json`，本地开发时可通过 `__local-admin/shortcuts` 写回项目文件；线上可切到 `api/shortcuts.js` + Vercel KV。
- 摄影：主数据在 `photo-records-data.js`，图片源在 `assets/photos/`，展示资源在 `assets/photos/display/` 和 `assets/photos/previews/`。
- 开发日志：主数据在 `site-content.json`，兼容检查还会扫描 `devlog-data.js`。

构建行为：

- Vite 负责打包 React。
- `vite.config.js` 在构建完成后手动复制运行时 JSON、图标、轻量 generated 图片、摄影发布资源和 `leaves.mp4`。
- `siteMetadataPlugin` 负责把 `%SITE_URL%` 注入到 HTML 元信息。

## 4. 文件结构

高价值目录：

- `src/`
- `src/features/`
- `src/photo-module/`
- `scripts/`
- `assets/icons/`
- `assets/generated/`
- `assets/photos/`
- `api/`

高价值根文件：

- [index.html](/Users/kqwqk/Documents/rechris-atlas/index.html)
- [vite.config.js](/Users/kqwqk/Documents/rechris-atlas/vite.config.js)
- [package.json](/Users/kqwqk/Documents/rechris-atlas/package.json)
- [site-config.json](/Users/kqwqk/Documents/rechris-atlas/site-config.json)
- [photo-records-data.js](/Users/kqwqk/Documents/rechris-atlas/photo-records-data.js)
- [site-content.json](/Users/kqwqk/Documents/rechris-atlas/site-content.json)
- [default-shortcuts.json](/Users/kqwqk/Documents/rechris-atlas/default-shortcuts.json)
- [check-photo-assets.js](/Users/kqwqk/Documents/rechris-atlas/check-photo-assets.js)

## 5. 关键代码位置

主入口和视图切换：

- [src/main.jsx](/Users/kqwqk/Documents/rechris-atlas/src/main.jsx)

站点 URL、主题图、枚举常量：

- [src/app-constants.js](/Users/kqwqk/Documents/rechris-atlas/src/app-constants.js)
- [site-config.json](/Users/kqwqk/Documents/rechris-atlas/site-config.json)

首页视觉、Header、天气、氛围控件：

- [src/layout.jsx](/Users/kqwqk/Documents/rechris-atlas/src/layout.jsx)
- [src/features/weather.js](/Users/kqwqk/Documents/rechris-atlas/src/features/weather.js)

收藏模块：

- [src/features/shortcuts.jsx](/Users/kqwqk/Documents/rechris-atlas/src/features/shortcuts.jsx)
- [api/shortcuts.js](/Users/kqwqk/Documents/rechris-atlas/api/shortcuts.js)

摄影模块：

- [src/photo-module/main.jsx](/Users/kqwqk/Documents/rechris-atlas/src/photo-module/main.jsx)
- [src/photo-module/photo-module.css](/Users/kqwqk/Documents/rechris-atlas/src/photo-module/photo-module.css)
- [photo-records-data.js](/Users/kqwqk/Documents/rechris-atlas/photo-records-data.js)
- [scripts/generate-photo-previews.js](/Users/kqwqk/Documents/rechris-atlas/scripts/generate-photo-previews.js)
- [scripts/enrich-photo-records.js](/Users/kqwqk/Documents/rechris-atlas/scripts/enrich-photo-records.js)
- [scripts/sync-photo-records.js](/Users/kqwqk/Documents/rechris-atlas/scripts/sync-photo-records.js)
- [check-photo-assets.js](/Users/kqwqk/Documents/rechris-atlas/check-photo-assets.js)

构建、部署和校验：

- [vite.config.js](/Users/kqwqk/Documents/rechris-atlas/vite.config.js)
- [scripts/smoke-check.js](/Users/kqwqk/Documents/rechris-atlas/scripts/smoke-check.js)
- [scripts/check-asset-budgets.js](/Users/kqwqk/Documents/rechris-atlas/scripts/check-asset-budgets.js)
- [.vercelignore](/Users/kqwqk/Documents/rechris-atlas/.vercelignore)

## 6. 当前存在的问题

1. 摄影列表页加载仍偏慢。
原因是列表当前仍主要使用 `assets/photos/previews/`，总量约 `7.9MB`，最大单张约 `649KB`。详情页快，是因为详情只加载单张 `display` 图。

2. 摄影列表缩略图优化处于半完成状态。
`scripts/generate-photo-previews.js` 已加入 `thumbs/` 生成逻辑，但：
- `thumbs/` 目录尚未生成
- `vite.config.js` 尚未复制 `assets/photos/thumbs`
- `check-photo-assets.js`、`scripts/smoke-check.js`、`scripts/check-asset-budgets.js` 尚未更新到 `thumbs`
- 还没重新跑 `photos:previews` / `photos:enrich` / `build`

3. 工作区仍然是脏的，而且脏得比较大。
这是一次跨轮次迁移中的正常状态，但接手时不要误判为“只改了少量文件”。`git status` 里既有旧脚本删除，也有新模块和新资源未跟踪。

4. 本地预览进程还挂着。
当前 `127.0.0.1:4173` 有监听进程，PID 为 `91527`。之前尝试在当前沙箱下关闭失败，不影响线上，但会影响下一个本地预览端口判断。

## 7. 已知 bug

1. 摄影页列表首屏资源仍过重。
这更像性能 bug，不是功能错误，但用户已经明确感知到了。

2. 当前代码与验证脚本对摄影缩略图目录的契约还未同步。
如果直接把列表渲染改为依赖 `thumbs/`，在补齐构建复制和校验之前，构建或线上表现会不一致。

3. 本地预览进程残留。
不是产品 bug，但会干扰本地调试流程。

## 8. 技术栈

- React 19
- React DOM 19
- Vite 8
- 原生 CSS
- `@panzoom/panzoom`
- `exifr`
- Vercel 静态部署
- Vercel Serverless API
- Vercel KV / Upstash Redis

## 9. 环境依赖

本地开发至少需要：

- Node.js
- npm
- macOS `sips`
原因是图片派生资源依赖 `sips` 生成
- Vercel CLI
- 已链接的 `.vercel/project.json`

线上依赖：

- Vercel 项目 `rechris-atlas`
- 自定义域名 `kqwqk.pw`
- 如需线上收藏持久化，需要：
`KV_REST_API_URL`
`KV_REST_API_TOKEN`
`SHORTCUTS_WRITE_SECRET`
可选：
`SHORTCUTS_ALLOW_UNSAFE_WRITE=1` 仅用于临时调试

## 10. MCP/tool 使用情况

本项目实际使用过或接手时可能继续用到的工具：

- `functions.exec_command`
用于本地构建、Vercel 部署、资源检查、文件检查

- `functions.apply_patch`
用于手工修改文件

- `multi_tool_use.parallel`
用于并行读取文件和状态，适合快速建立上下文

- `mcp__node_repl__.js`
用于 Browser 插件配套的页内验证

- Browser / `browser-use`
已用于本地预览页验证：首页、收藏、摄影详情、开发日志、控制台日志

- Vercel CLI
已用于生产部署和域名别名检查

当前这条线里没有实际用 Figma/Pencil 改代码，但本机环境里这些 MCP 服务是装着的，不是本 repo 的关键依赖。

## 11. UI设计规范

这一版站点已经形成了比较明确的风格约束：

- 保持现有视觉语言，不要突然换设计体系。
- 首页是氛围化入口，但不是营销页。
- 摄影页默认应该以“看图”为主，不要再把大量解释性文字塞回卡片列表。
- 详情页承担文字和 EXIF 信息。
- 收藏页是工具型界面，偏紧凑、清晰、好扫读。
- 开发日志是时间线阅读体验，不要做成卡片瀑布流。
- 已经做过一轮“本地图标替代远程 Icons8 关键 UI 图标”的收口，新增关键 UI 图标优先继续走本地资源。
- 不要重新引入原始大 PNG 作为首页主图或分享图。

## 12. 下一步任务

优先任务就是把摄影列表再提速一档：

1. 生成 `assets/photos/thumbs/`
运行 `npm run photos:previews -- --force` 或直接调用当前脚本，确认 `thumbs/` 生成完成。

2. 把摄影列表正式切到 `thumbs/`
当前 `getPreviewImage()` 已经优先读 `record.thumbnails`，所以数据补齐后前端大概率不用大改。

3. 更新构建复制
在 [vite.config.js](/Users/kqwqk/Documents/rechris-atlas/vite.config.js) 里增加 `assets/photos/thumbs` 的复制，并评估是否保留 `previews/` 作为中间层或兼容层。

4. 更新校验脚本
同步修改：
- [check-photo-assets.js](/Users/kqwqk/Documents/rechris-atlas/check-photo-assets.js)
- [scripts/smoke-check.js](/Users/kqwqk/Documents/rechris-atlas/scripts/smoke-check.js)
- [scripts/check-asset-budgets.js](/Users/kqwqk/Documents/rechris-atlas/scripts/check-asset-budgets.js)

5. 重新构建并验证
跑：
- `npm run smoke`
- `npm run build`
然后在浏览器里重新验证摄影列表滚动和首屏体感。

## 13. 注意事项

- 不要把工作区当前的大量删除/新增当成“可以随手清理”的垃圾。这里面很多是迁移结果，不是冗余。
- 任何与摄影资源相关的改动，都要同时看：
前端读取逻辑、数据文件、派生图脚本、构建复制、校验脚本。
- 本地编辑接口 `__local-admin/*` 只应该在开发环境生效；不要重新把线上探测打开。
- 这套项目里“数据文件 + 本地写回 + 线上只读/受控写入”是有意设计，不要轻易改成纯浏览器 `localStorage`。
- 当前预览端口 `4173` 已被占用，继续开预览前先确认是否要复用或手动结束旧进程。

## 14. 不要修改的内容

- 不要把主域名从 `kqwqk.pw` 改回 `rechris-atlas.vercel.app`。
- 不要重新把原始 `assets/generated/*.png` 整包复制到线上。
- 不要重新发布 `assets/photos` 原图目录到生产环境。
- 不要把摄影详情重新改回浏览器端实时 EXIF 解析。
- 不要删除现有的资源预算检查和冒烟检查。
- 不要为了“清理”而回滚那些已删除的旧脚本文件，除非你明确决定全面回退 React 迁移。

## 15. 推荐继续开发顺序

1. 先收尾摄影列表缩略图优化。
这是当前最直接的用户体感问题，而且代码已经起头了。

2. 跑完整构建和浏览器验证。
确认 `thumbs/` 接入后没有把详情页、构建复制或预算打坏。

3. 如果摄影页速度明显改善，再考虑继续收口 CSS 和旧数据兼容。
这类工作重要，但优先级低于用户能感知到的加载问题。

4. 最后再考虑是否精简 `previews/`
前提是确认：
- 列表页只需要 `thumbs/`
- 详情页只需要 `display/`
- 没有其他地方仍依赖 `previews/`

## 附：当前验证结论

最近一次完整确认到的状态：

- `https://kqwqk.pw` 可访问
- 首页元信息已指向 `kqwqk.pw`
- 轻量分享图 `assets/generated/display/about-duck-day.jpg` 可访问
- 摄影详情图 `assets/photos/display/IMG_2912.jpg` 可访问
- 旧大图路径 `assets/generated/about-duck-day.png` 在线上返回 `404`，这符合当前优化目标
- 本地桌面浏览器验证通过：首页、收藏、摄影详情、开发日志、控制台错误都正常

