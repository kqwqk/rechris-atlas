# 开发指南

本文档提供 RECHRIS ATLAS 项目的详细开发指南。

## 目录

- [环境设置](#环境设置)
- [项目架构](#项目架构)
- [开发工作流](#开发工作流)
- [代码规范](#代码规范)
- [测试](#测试)
- [常见问题](#常见问题)

## 环境设置

### 系统要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS (需要 `sips` 命令)

### 初始化项目

```bash
# 1. 克隆仓库
git clone <repository-url>
cd rechris-atlas

# 2. 安装依赖
npm install

# 3. 生成摄影资源
npm run photos:sync

# 4. 启动开发服务器
npm run dev
```

### 开发工具推荐

- **编辑器**: VS Code
- **扩展**:
  - ESLint
  - Prettier
  - ES7+ React/Redux/React-Native snippets

## 项目架构

### 核心概念

#### 1. 视图系统

应用使用基于 hash 的单页路由：

- `#home` - 首页
- `#tools` - 设计收藏
- `#life` - 摄影作品
- `#devlog` - 开发日志

视图配置在 `src/app-constants.js` 的 `VIEWS` 数组中。

#### 2. 主题系统

支持多种主题模式：

- `day` - 白天
- `sunny` - 晴天（带落叶动画）
- `night` - 夜晚
- `midnight` - 午夜（带星空）
- `rain` - 雨天
- `snow` - 雪天

主题可以手动切换或根据天气自动切换。

#### 3. 摄影模块

摄影模块是独立的懒加载模块，包含：

- 照片列表（使用缩略图）
- 照片详情（使用原图）
- EXIF 信息展示
- 照片编辑（开发模式）

### 文件组织

```
src/
├── components/          # 可复用组件
│   ├── ErrorBoundary.jsx    # 错误边界
│   └── LazyImage.jsx         # 懒加载图片
│
├── features/            # 功能模块
│   ├── devlog.jsx            # 开发日志
│   ├── shortcuts.jsx         # 设计收藏
│   ├── weather.js            # 天气功能
│   └── canvas-effects/       # 画布特效
│       ├── stars.js
│       ├── moon.js
│       ├── rain.js
│       └── snow.js
│
├── photo-module/        # 摄影模块
│   └── main.jsx
│
├── utils/               # 工具函数
│   ├── accessibility.js      # 可访问性工具
│   ├── error-handler.js      # 错误处理
│   ├── performance.js        # 性能监控
│   └── seo.js                # SEO 工具
│
├── app-constants.js     # 应用常量
├── app-utils.js         # 应用工具函数
├── layout.jsx           # 布局组件
├── main.jsx             # 应用入口
└── types.js             # JSDoc 类型定义
```

## 开发工作流

### 添加新照片

1. **准备照片**：
   - 将原图放入 `assets/photos/`
   - 建议使用有意义的文件名（如 `hangzhou-westlake-2025.jpg`）

2. **生成资源**：
   ```bash
   npm run photos:sync
   ```
   这会：
   - 扫描 `assets/photos/` 根目录里的新增照片
   - 生成 720px 缩略图（72% 质量）
   - 提取 EXIF 信息
   - 更新 `photo-records-data.js`
   - 在摄影页按发布时间展示新照片

3. **添加元数据**（可选）：
   编辑 `photo-records-data.js`，添加标题、描述、地点等：
   ```javascript
   {
     id: 'photo-001',
     title: '西湖日落',
     content: '杭州西湖的美丽日落',
     location: '杭州西湖',
     date: '2025-01-15',
     images: ['assets/photos/hangzhou-westlake-2025.jpg'],
     thumbnails: ['assets/photos/thumbs/hangzhou-westlake-2025.jpg'],
     exif: { /* 自动生成 */ }
   }
   ```

### 添加开发日志

编辑 `src/features/devlog.jsx`：

```javascript
const siteContent = [
  {
    id: 'log-001',
    date: '2025-01-15',
    title: '性能优化完成',
    content: '完成了摄影列表的缩略图优化，加载体积从 7.9MB 降至 3.7MB。',
    tags: ['性能', '优化']
  },
  // 添加新日志...
];
```

### 添加设计收藏

编辑 `src/features/shortcuts.jsx` 中的 `defaultShortcuts`：

```javascript
{
  id: 'shortcut-001',
  title: 'Figma',
  url: 'https://figma.com',
  description: '协作设计工具',
  category: '设计工具',
  order: 1
}
```

### 修改主题

1. **添加新主题模式**：
   
   在 `src/app-constants.js` 中添加：
   ```javascript
   export const MODES = [
     // ...
     { id: 'sunset', label: '日落', hotkey: 'u' }
   ];
   ```

2. **定义主题颜色**：
   
   在 `styles.css` 中添加：
   ```css
   body.sunset {
     --bg: #ff6b35;
     --text: #ffffff;
     --accent: #f7931e;
   }
   ```

3. **添加主题图片**（可选）：
   
   在 `src/app-constants.js` 中添加：
   ```javascript
   export const THEME_IMAGE_FILES = {
     // ...
     sunset: 'assets/generated/display/about-duck-sunset.jpg'
   };
   ```

## 代码规范

### JavaScript/JSX

遵循 ESLint 配置：

```javascript
// ✅ 好的实践
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
}

// ❌ 避免
var count = 0; // 使用 const/let
function handleClick() {
  count = count + 1; // 直接修改状态
}
```

### 类型注释

使用 JSDoc 为函数添加类型注释：

```javascript
/**
 * 获取照片预览图
 * @param {PhotoRecord} record - 照片记录
 * @param {number} index - 图片索引
 * @returns {string} 预览图 URL
 */
function getPreviewImage(record, index) {
  return record.thumbnails?.[index] || record.images?.[index];
}
```

### 组件规范

```javascript
// ✅ 好的组件结构
export function PhotoCard({ photo, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 副作用
  }, []);

  const handleClick = () => {
    onClick(photo.id);
  };

  return (
    <div className="photo-card" onClick={handleClick}>
      {/* JSX */}
    </div>
  );
}
```

### CSS 规范

```css
/* 使用 BEM 命名 */
.photo-card { }
.photo-card__image { }
.photo-card__title { }
.photo-card--featured { }

/* 使用 CSS 变量 */
.button {
  background: var(--accent);
  color: var(--text);
}
```

## 错误处理

### 使用统一的错误处理

```javascript
import { handleError, NetworkError, safeFetch } from './utils/error-handler.js';

async function fetchData() {
  try {
    const response = await safeFetch('/api/data', {}, 5000);
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error, showToast, trackEvent);
    return null;
  }
}
```

### 自定义错误

```javascript
import { AppError } from './utils/error-handler.js';

if (!isValid) {
  throw new AppError('数据验证失败', 'VALIDATION_ERROR', { data });
}
```

## 性能优化

### 代码分割

使用 React.lazy 进行代码分割：

```javascript
const HeavyComponent = lazy(() => import('./HeavyComponent.jsx'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 图片优化

使用 LazyImage 组件：

```javascript
import { LazyImage } from './components/LazyImage.jsx';

<LazyImage
  src={photo.thumbnail}
  alt={photo.title}
  className="photo-thumbnail"
/>
```

### 性能监控

追踪关键操作：

```javascript
import { trackEvent, measurePerformance } from './utils/performance.js';

// 追踪事件
trackEvent('photo_view', { photoId: photo.id });

// 测量性能
measurePerformance('photo_load', () => {
  // 执行操作
});
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行冒烟测试
npm run smoke
```

### 编写测试

```javascript
import { describe, it, expect } from 'vitest';
import { getPreviewImage } from './app-utils.js';

describe('getPreviewImage', () => {
  it('should return thumbnail if available', () => {
    const record = {
      thumbnails: ['thumb.jpg'],
      images: ['original.jpg']
    };
    expect(getPreviewImage(record, 0)).toBe('thumb.jpg');
  });

  it('should fallback to original image', () => {
    const record = {
      images: ['original.jpg']
    };
    expect(getPreviewImage(record, 0)).toBe('original.jpg');
  });
});
```

## 构建和部署

### 本地构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览构建

```bash
npm run preview
```

### 资源预算检查

构建时会自动检查资源预算：

- 总体积: 180 MB
- 照片总计: 170 MB
- 最大缩略图: 250 KB
- 主 JS (gzip): 150 KB
- 主 CSS (gzip): 20 KB

超出预算会导致构建失败。

## 常见问题

### Q: 为什么需要 macOS？

A: 项目使用 macOS 的 `sips` 命令生成缩略图。如果在其他系统开发，需要修改 `scripts/generate-photo-previews.js` 使用其他图片处理工具（如 Sharp）。

### Q: 如何调试画布特效？

A: 画布特效在对应主题模式下才会加载。切换到 `midnight`（星空）、`rain`（雨天）或 `snow`（雪天）模式即可调试。

### Q: 如何禁用天气自动主题？

A: 在 `src/features/weather.js` 中注释掉 `setMode` 调用，或在 localStorage 中设置 `theme_lock` 为 `'1'`。

### Q: 构建失败：资源预算超标

A: 检查 `scripts/check-asset-budgets.js` 的输出，找出超标的资源。通常是照片文件过大，需要压缩或使用更小的缩略图。

### Q: 如何添加新的工具函数？

A: 在 `src/utils/` 目录下创建新文件，添加 JSDoc 类型注释，并在需要的地方导入使用。

### Q: 如何修改资源预算？

A: 编辑 `scripts/check-asset-budgets.js` 中的 `budgets` 对象。

## 获取帮助

- 查看 [README.md](../README.md) 了解项目概览
- 查看 [OPTIMIZATION_PLAN.md](../OPTIMIZATION_PLAN.md) 了解优化计划
- 查看 [OPTIMIZATION_PROGRESS.md](../OPTIMIZATION_PROGRESS.md) 了解优化进度

## 贡献指南

这是个人项目，暂不接受外部贡献。如有建议，请通过网站联系方式反馈。
