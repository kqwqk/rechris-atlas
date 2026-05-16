# 更新日志

本文档记录 RECHRIS ATLAS 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [未发布]

### 新增

#### 性能优化
- 摄影列表使用 720px 缩略图，加载体积从 7.9MB 降至 3.7MB（优化 53%）
- 实现代码分割：摄影模块、开发日志、收藏页均懒加载
- 主 JS gzip 从 ~78KB 降至 63.9KB（优化 18%）
- 创建 `LazyImage` 组件，使用 Intersection Observer 实现图片懒加载
- 添加资源预加载（preload, preconnect, dns-prefetch）
- 实施资源预算管理，构建时强制检查体积限制

#### 监控和分析
- 集成 Vercel Analytics 追踪页面浏览
- 集成 Vercel Speed Insights 监控性能指标
- 实现全局 ErrorBoundary 捕获组件错误
- 创建 `src/utils/performance.js` 性能监控工具
- 在摄影模块添加事件追踪（照片查看、编辑）

#### SEO 和可访问性
- 创建 `src/utils/seo.js` 实现动态元数据管理
- 每个视图有独立的页面标题、描述和关键词
- 自动更新 Open Graph 和 Twitter Card 标签
- 添加跳过导航链接（Skip to Content）
- 使用语义化 HTML 标签（`<main>`, `<footer>`, `<nav>`）
- 为所有区域添加 ARIA 标签
- 增强焦点指示器样式（`:focus-visible`）
- 创建 `src/utils/accessibility.js` 可访问性工具库
- 实现焦点陷阱、ESC 键关闭、键盘导航支持
- 添加屏幕阅读器专用样式（`.sr-only`）

#### 代码质量
- 创建 `src/utils/error-handler.js` 统一错误处理
- 实现自定义错误类（AppError, NetworkError, ValidationError, StorageError）
- 添加安全工具函数（safeFetch, safeLocalStorageGet, retry 等）
- 创建 `src/types.js` JSDoc 类型定义文件
- 配置 ESLint 和 Prettier
- 添加代码检查和格式化脚本

#### 文档
- 创建 `README.md` 项目概览
- 创建 `docs/DEVELOPMENT.md` 详细开发指南
- 创建 `CHANGELOG.md` 更新日志
- 创建 `OPTIMIZATION_PLAN.md` 优化计划
- 创建 `OPTIMIZATION_PROGRESS.md` 优化进度报告

### 改进

- 优化 `smoke-check.js` 支持懒加载模块检查
- 更新 `package.json` 添加 lint 和 format 脚本
- 改进加载状态的可访问性（添加 `role="status"` 和 `aria-live`）
- Toast 通知添加 `aria-atomic="true"` 属性

### 依赖

#### 新增
- @vercel/analytics@2.0.1
- @vercel/speed-insights@2.0.0
- eslint@^8.57.0
- eslint-plugin-react@^7.34.1
- eslint-plugin-react-hooks@^4.6.0
- prettier@^3.2.5

### 技术债务

- [ ] 考虑将 `photo-module/main.jsx` (663 行) 拆分为更小的组件
- [ ] 考虑将 `features/shortcuts.jsx` (328 行) 重构
- [ ] 添加单元测试覆盖关键工具函数
- [ ] 考虑引入 TypeScript 替代 JSDoc

## [1.0.0] - 初始版本

### 新增

- 摄影作品集功能
- 设计收藏功能
- 开发日志功能
- 智能主题系统（根据天气自动切换）
- 多种主题模式（day, sunny, night, midnight, rain, snow）
- 画布特效（星空、月亮、雨、雪、落叶）
- 天气卡片（Open-Meteo API）
- 响应式设计
- 暗色/亮色主题
- 本地编辑 API（开发模式）

### 技术栈

- React 19
- Vite 8
- CSS + CSS Houdini
- Panzoom（图片缩放）
- exifr（EXIF 解析）

---

## 图例

- `新增` - 新功能
- `改进` - 现有功能的改进
- `修复` - Bug 修复
- `移除` - 移除的功能
- `安全` - 安全相关的修复
- `废弃` - 即将移除的功能
- `依赖` - 依赖更新

---

## 版本规则

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正
