/**
 * 类型定义文件
 * 使用 JSDoc 提供类型安全
 */

/**
 * @typedef {Object} PhotoRecord
 * @property {string} id - 照片唯一标识
 * @property {string} filename - 文件名
 * @property {string} [title] - 标题
 * @property {string} [description] - 描述
 * @property {string} [location] - 拍摄地点
 * @property {string} [date] - 拍摄日期
 * @property {string} [createdAt] - 创建时间
 * @property {string} [updatedAt] - 更新时间
 * @property {string} [publishedAt] - 发布时间
 * @property {string[]} [images] - 原图路径数组
 * @property {string[]} [thumbnails] - 缩略图路径数组
 * @property {Object} [exif] - EXIF 信息
 * @property {string} [exif.camera] - 相机型号
 * @property {string} [exif.lens] - 镜头型号
 * @property {string} [exif.focalLength] - 焦距
 * @property {string} [exif.aperture] - 光圈
 * @property {string} [exif.shutterSpeed] - 快门速度
 * @property {string} [exif.iso] - ISO
 */

/**
 * @typedef {Object} ShortcutItem
 * @property {string} id - 快捷方式唯一标识
 * @property {string} title - 标题
 * @property {string} url - URL
 * @property {string} [description] - 描述
 * @property {string} [category] - 分类
 * @property {string} [icon] - 图标
 * @property {string} [createdAt] - 创建时间
 * @property {number} [order] - 排序
 */

/**
 * @typedef {Object} DevlogEntry
 * @property {string} id - 日志唯一标识
 * @property {string} title - 标题
 * @property {string} content - 内容
 * @property {string} date - 日期
 * @property {string[]} [tags] - 标签
 * @property {string} [category] - 分类
 */

/**
 * @typedef {Object} WeatherData
 * @property {string} temp - 温度
 * @property {string} desc - 天气描述
 * @property {string} meta - 元信息（湿度、风速等）
 * @property {string} city - 城市名称
 * @property {string} icon - 天气图标路径
 */

/**
 * @typedef {Object} ViewConfig
 * @property {string} id - 视图 ID
 * @property {string} label - 视图标签
 * @property {string} [hotkey] - 快捷键
 */

/**
 * @typedef {Object} ModeConfig
 * @property {string} id - 模式 ID
 * @property {string} label - 模式标签
 * @property {string} hotkey - 快捷键
 */

/**
 * @typedef {Object} PageMeta
 * @property {string} title - 页面标题
 * @property {string} description - 页面描述
 * @property {string} keywords - 关键词
 */

/**
 * @typedef {Object} PerformanceMetric
 * @property {string} name - 指标名称
 * @property {number} value - 指标值
 * @property {string} [unit] - 单位
 */

/**
 * @typedef {Object} ErrorContext
 * @property {string} [component] - 组件名称
 * @property {string} [action] - 操作名称
 * @property {*} [data] - 相关数据
 */

/**
 * @typedef {Object} FocusTrapOptions
 * @property {HTMLElement} container - 容器元素
 * @property {boolean} isActive - 是否激活
 */

/**
 * @typedef {Object} KeyboardNavigationOptions
 * @property {Function} [onNext] - 下一项回调
 * @property {Function} [onPrev] - 上一项回调
 * @property {Function} [onClose] - 关闭回调
 * @property {boolean} isActive - 是否激活
 */

/**
 * @typedef {Object} ColorContrastResult
 * @property {string} ratio - 对比度比值
 * @property {boolean} passAA - 是否通过 WCAG AA 标准
 * @property {boolean} passAAA - 是否通过 WCAG AAA 标准
 * @property {boolean} passAALarge - 是否通过大文本 AA 标准
 */

/**
 * @typedef {Object} StructuredDataImage
 * @property {string} '@context' - Schema.org 上下文
 * @property {string} '@type' - 类型
 * @property {string} name - 名称
 * @property {string} description - 描述
 * @property {string} contentUrl - 内容 URL
 * @property {string} thumbnailUrl - 缩略图 URL
 * @property {Object} author - 作者
 * @property {string} datePublished - 发布日期
 * @property {Object} [locationCreated] - 拍摄地点
 */

/**
 * @typedef {Object} StructuredDataBlogPost
 * @property {string} '@context' - Schema.org 上下文
 * @property {string} '@type' - 类型
 * @property {string} headline - 标题
 * @property {string} description - 描述
 * @property {string} datePublished - 发布日期
 * @property {Object} author - 作者
 * @property {Object} publisher - 发布者
 */

export {};
