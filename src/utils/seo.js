/**
 * SEO 元数据管理工具
 */

const PAGE_META = {
  home: {
    title: 'RECHRIS ATLAS — Design, Photo & Daily Systems',
    description: 'RECHRIS 的个人图谱：设计作品、摄影发布、工具收藏与开发日志。',
    keywords: 'UI设计,产品设计,摄影,前端开发,个人网站'
  },
  photos: {
    title: '摄影作品 - RECHRIS ATLAS',
    description: '个人摄影作品集，记录生活中的美好瞬间。',
    keywords: '摄影,照片,作品集,RECHRIS'
  },
  inspiration: {
    title: '设计收藏 - RECHRIS ATLAS',
    description: '精选的设计工具、资源和灵感收藏。',
    keywords: '设计工具,设计资源,收藏,灵感'
  },
  devlog: {
    title: '开发日志 - RECHRIS ATLAS',
    description: '记录开发过程、技术思考和项目进展。',
    keywords: '开发日志,技术博客,前端开发,项目记录'
  },
  work: {
    title: '工作记录 - RECHRIS ATLAS',
    description: '按日期记录工作进度，快速查看月度任务状态。',
    keywords: '工作记录,任务看板,日程管理,项目进度'
  }
};

/**
 * 更新页面元数据
 * @param {string} view - 当前视图 ID
 */
export function updatePageMeta(view = 'home') {
  const meta = PAGE_META[view] || PAGE_META.home;

  // 更新标题
  document.title = meta.title;

  // 更新描述
  updateMetaTag('name', 'description', meta.description);
  updateMetaTag('name', 'keywords', meta.keywords);

  // 更新 Open Graph
  updateMetaTag('property', 'og:title', meta.title);
  updateMetaTag('property', 'og:description', meta.description);

  // 更新 Twitter Card
  updateMetaTag('name', 'twitter:title', meta.title);
  updateMetaTag('name', 'twitter:description', meta.description);

  // 更新 canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    const baseUrl = canonical.href.split('#')[0].replace(/\/$/, '');
    canonical.href = view === 'home' ? `${baseUrl}/` : `${baseUrl}/#${view}`;
  }
}

/**
 * 更新或创建 meta 标签
 * @param {string} attr - 属性名 ('name' 或 'property')
 * @param {string} key - 属性值
 * @param {string} content - 内容
 */
function updateMetaTag(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * 为图片生成有意义的 alt 文本
 * @param {Object} photo - 照片对象
 * @returns {string} alt 文本
 */
export function generatePhotoAlt(photo) {
  const parts = [];

  if (photo.title) {
    parts.push(photo.title);
  }

  if (photo.location) {
    parts.push(`拍摄于${photo.location}`);
  }

  if (photo.date) {
    const date = new Date(photo.date);
    parts.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }));
  }

  return parts.length > 0 ? parts.join(' - ') : '摄影作品';
}

/**
 * 生成结构化数据（JSON-LD）
 * @param {string} type - 数据类型
 * @param {Object} data - 数据对象
 * @returns {string} JSON-LD 字符串
 */
export function generateStructuredData(type, data) {
  const schemas = {
    ImageObject: (photo) => ({
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      name: photo.title || '摄影作品',
      description: photo.description || generatePhotoAlt(photo),
      contentUrl: photo.url,
      thumbnailUrl: photo.thumbnail,
      author: {
        '@type': 'Person',
        name: 'RECHRIS'
      },
      datePublished: photo.date,
      locationCreated: photo.location
        ? {
            '@type': 'Place',
            name: photo.location
          }
        : undefined
    }),

    BlogPosting: (post) => ({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: 'RECHRIS'
      },
      publisher: {
        '@type': 'Person',
        name: 'RECHRIS'
      }
    })
  };

  const schema = schemas[type]?.(data);
  return schema ? JSON.stringify(schema, null, 2) : null;
}
