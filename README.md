# RECHRIS ATLAS

个人设计收藏、摄影作品和开发日志的静态网站。

## 特性

- 📸 **摄影作品集** - 支持 EXIF 信息展示和缩略图优化
- 🎨 **设计收藏** - 精选的设计工具和资源
- 📝 **开发日志** - 记录开发过程和技术思考
- 🌓 **智能主题** - 根据天气自动切换主题
- ⚡ **性能优化** - 代码分割、懒加载、资源预算管理
- ♿ **可访问性** - 符合 WCAG 2.1 AA 标准
- 📊 **监控分析** - Vercel Analytics 和 Speed Insights

## 技术栈

- **框架**: React 19
- **构建工具**: Vite 8
- **部署**: Vercel
- **样式**: CSS + CSS Houdini
- **图片处理**: Sharp (通过 sips)
- **监控**: Vercel Analytics, Speed Insights

## 快速开始

### 环境要求

- Node.js >= 18
- macOS (需要 `sips` 命令用于图片处理)

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd rechris-atlas

# 安装依赖
npm install

# 生成摄影资源（缩略图和 EXIF 数据）
npm run photos:sync

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

## 开发指南

### 项目结构

```
rechris-atlas/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── ErrorBoundary.jsx
│   │   └── LazyImage.jsx
│   ├── features/            # 功能模块
│   │   ├── devlog.jsx
│   │   ├── shortcuts.jsx
│   │   ├── weather.js
│   │   └── canvas-effects/
│   ├── photo-module/        # 摄影模块
│   │   └── main.jsx
│   ├── utils/               # 工具函数
│   │   ├── accessibility.js
│   │   ├── error-handler.js
│   │   ├── performance.js
│   │   └── seo.js
│   ├── app-constants.js     # 应用常量
│   ├── app-utils.js         # 应用工具函数
│   ├── layout.jsx           # 布局组件
│   ├── main.jsx             # 应用入口
│   └── types.js             # JSDoc 类型定义
├── assets/
│   ├── photos/              # 摄影作品
│   │   ├── originals/       # 原图
│   │   └── thumbs/          # 缩略图（自动生成）
│   ├── generated/           # 生成的资源
│   └── icons/               # 图标
├── scripts/                 # 构建脚本
│   ├── generate-photo-previews.js
│   ├── enrich-photo-records.js
│   └── check-asset-budgets.js
├── styles.css               # 全局样式
└── index.html               # HTML 入口
```

### 常用命令

```bash
# 开发
npm run dev                  # 启动开发服务器

# 摄影资源管理
npm run photos:previews      # 生成缩略图
npm run photos:enrich        # 提取 EXIF 信息
npm run photos:sync          # 完整同步（生成缩略图 + EXIF）

# 构建
npm run build                # 生产构建
npm run preview              # 预览构建产物

# 代码质量
npm run lint                 # 代码检查
npm run lint:fix             # 自动修复代码问题
npm run format               # 格式化代码
npm run format:check         # 检查代码格式

# 测试
npm run smoke                # 冒烟测试
```

### 添加新照片

1. 将照片放入 `assets/photos/originals/` 目录
2. 运行 `npm run photos:sync` 生成缩略图和 EXIF 数据
3. 在 `photo-records-data.js` 中添加照片记录（或使用自动生成）

### 添加开发日志

编辑 `src/features/devlog.jsx` 中的 `siteContent` 数组：

```javascript
{
  id: 'log-001',
  date: '2025-01-15',
  title: '日志标题',
  content: '日志内容...',
  tags: ['标签1', '标签2']
}
```

### 修改主题

主题配置在 `src/app-constants.js` 中的 `MODES` 数组。颜色变量在 `styles.css` 中定义：

```css
body.light {
  --bg: #f2efe9;
  --text: #1a1a1a;
  --accent: #7a8fa6;
}
```

## 性能优化

### 资源预算

项目使用资源预算强制执行体积限制：

- 总体积: 180 MB
- 照片总计: 170 MB
- 最大缩略图: 250 KB
- 主 JS (gzip): 150 KB
- 主 CSS (gzip): 20 KB

构建时会自动检查，超出预算将失败。

### 代码分割

- 摄影模块、开发日志、收藏页均使用懒加载
- 画布特效（星空、雨雪）按需加载
- 图片使用 Intersection Observer 懒加载

### 图片优化

- 列表页使用 720px 缩略图（72% 质量）
- 详情页使用原图
- 支持 `loading="lazy"` 原生懒加载

## 监控和分析

### Vercel Analytics

追踪页面浏览和用户事件：

```javascript
import { trackPageView, trackEvent } from './utils/performance.js';

// 页面浏览
trackPageView('photos');

// 自定义事件
trackEvent('photo_view', { photoId: 'photo-001' });
```

### 错误处理

使用统一的错误处理机制：

```javascript
import { handleError, NetworkError } from './utils/error-handler.js';

try {
  // 可能出错的代码
} catch (error) {
  handleError(error, showToast, trackEvent);
}
```

## 可访问性

- 支持完整的键盘导航
- 提供跳过导航链接
- 所有交互元素有 ARIA 标签
- 符合 WCAG 2.1 AA 标准
- 焦点指示器清晰可见

## 部署

项目配置为自动部署到 Vercel：

1. 推送到 main 分支触发自动部署
2. 构建命令: `npm run build`
3. 输出目录: `dist`

### 环境变量

无需配置环境变量，所有配置在代码中。

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)

需要支持：
- ES2021
- CSS Houdini (@property)
- Intersection Observer
- CSS Grid & Flexbox

## 贡献

这是个人项目，暂不接受外部贡献。

## 许可

私有项目，保留所有权利。

## 联系

- 网站: https://kqwqk.pw
- 作者: RECHRIS
