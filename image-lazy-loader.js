/**
 * 图片懒加载优化
 * Image Lazy Loading Enhancement
 */

class ImageLazyLoader {
  constructor() {
    this.images = [];
    this.observer = null;
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    // 检查浏览器是否支持 IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // 不支持则直接加载所有图片
      this.loadAllImages();
      return;
    }

    // 创建 IntersectionObserver
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01
      }
    );

    // 观察所有懒加载图片
    this.observeImages();

    // 监听 DOM 变化，处理动态添加的图片
    this.observeDOM();
  }

  /**
   * 观察所有懒加载图片
   */
  observeImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach(img => {
      // 如果图片已经加载，跳过
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
        return;
      }

      // 添加到观察列表
      this.observer.observe(img);
      this.images.push(img);
    });
  }

  /**
   * 加载图片
   */
  loadImage(img) {
    // 如果已经加载，跳过
    if (img.classList.contains('loaded')) {
      return;
    }

    // 如果有 data-src，使用 data-src
    const src = img.dataset.src || img.src;

    if (src && src !== img.src) {
      img.src = src;
    }

    // 监听加载完成
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      this.observer.unobserve(img);
    }, { once: true });

    // 监听加载失败
    img.addEventListener('error', () => {
      console.warn('图片加载失败:', src);
      img.classList.add('loaded'); // 即使失败也标记为已处理
      this.observer.unobserve(img);
    }, { once: true });
  }

  /**
   * 加载所有图片（降级方案）
   */
  loadAllImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach(img => {
      const src = img.dataset.src || img.src;
      if (src && src !== img.src) {
        img.src = src;
      }
      img.classList.add('loaded');
    });
  }

  /**
   * 观察 DOM 变化
   */
  observeDOM() {
    const domObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          // 检查是否是元素节点
          if (node.nodeType !== 1) return;

          // 检查节点本身是否是懒加载图片
          if (node.tagName === 'IMG' && node.getAttribute('loading') === 'lazy') {
            this.observer.observe(node);
            this.images.push(node);
          }

          // 检查子节点中的懒加载图片
          const lazyImages = node.querySelectorAll?.('img[loading="lazy"]');
          lazyImages?.forEach(img => {
            this.observer.observe(img);
            this.images.push(img);
          });
        });
      });
    });

    // 开始观察
    domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 预加载图片
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * 批量预加载图片
   */
  async preloadImages(srcs) {
    const promises = srcs.map(src => this.preloadImage(src));
    return Promise.allSettled(promises);
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images = [];
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLazyLoader;
}
