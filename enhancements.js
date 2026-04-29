// ═══════════════════════════════════════════
// Theme Switch Page Enhancements
// 智能主题系统 + 微交互优化 + 视觉增强
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// 1. 智能主题系统 - Auto Theme Switching
// ═══════════════════════════════════════════

const SmartTheme = {
  enabled: false,
  weatherMapping: {
    0: 'sunny',      // Clear sky
    1: 'day',        // Mainly clear
    2: 'day',        // Partly cloudy
    3: 'day',        // Overcast
    45: 'rain',      // Fog
    48: 'rain',      // Depositing rime fog
    51: 'rain',      // Drizzle
    53: 'rain',
    55: 'rain',
    61: 'rain',      // Rain
    63: 'rain',
    65: 'rain',
    71: 'snow',      // Snow
    73: 'snow',
    75: 'snow',
    77: 'snow',
    80: 'rain',      // Rain showers
    81: 'rain',
    82: 'rain',
    85: 'snow',      // Snow showers
    86: 'snow',
    95: 'rain',      // Thunderstorm
    96: 'rain',
    99: 'rain'
  },

  init() {
    const saved = localStorage.getItem('smartThemeEnabled');
    this.enabled = saved === 'true';

    if (this.enabled) {
      this.check();
      // 每30分钟检查一次
      setInterval(() => this.check(), 30 * 60 * 1000);
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('smartThemeEnabled', this.enabled);

    if (this.enabled) {
      this.check();
      showToast('智能主题已启用');
    } else {
      showToast('智能主题已关闭');
    }
  },

  check() {
    // 检查是否有手动锁定
    const manualLock = localStorage.getItem('themeManualLock');
    if (manualLock === '1') {
      // 5分钟后清除手动锁定
      setTimeout(() => {
        localStorage.removeItem('themeManualLock');
      }, 5 * 60 * 1000);
      return;
    }

    const hour = new Date().getHours();
    let suggestedMode = null;

    // 时间优先级
    if (hour >= 0 && hour < 6) {
      suggestedMode = 'midnight';  // 深夜
    } else if (hour >= 6 && hour < 8) {
      suggestedMode = 'day';       // 清晨
    } else if (hour >= 20 && hour < 24) {
      suggestedMode = 'night';     // 夜晚
    } else {
      // 白天根据天气决定
      this.checkWeatherTheme();
      return;
    }

    if (suggestedMode && currentMode !== suggestedMode) {
      setMode(suggestedMode, { silent: true });
    }
  },

  async checkWeatherTheme() {
    try {
      const weatherData = window.lastWeatherData;
      if (!weatherData || !weatherData.current) return;

      const weatherCode = weatherData.current.weather_code;
      const suggestedMode = this.weatherMapping[weatherCode] || 'day';

      if (currentMode !== suggestedMode) {
        setMode(suggestedMode, { silent: true });
      }
    } catch (e) {
      console.log('Weather theme check failed:', e);
    }
  }
};

// ═══════════════════════════════════════════
// 2. 主题切换波纹动画 - Ripple Effect
// ═══════════════════════════════════════════

const ThemeRipple = {
  create(x, y, targetMode) {
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    // 根据目标主题设置颜色
    const colors = {
      day: '#f2efe9',
      sunny: '#e8f4d9',
      night: '#1a1a1a',
      midnight: '#080808',
      rain: '#4a535e',
      snow: '#d4dde7'
    };

    ripple.style.background = colors[targetMode] || colors.day;
    document.body.appendChild(ripple);

    // 动画结束后移除
    setTimeout(() => ripple.remove(), 1200);
  }
};

// ═══════════════════════════════════════════
// 3. 光标跟随粒子效果 - Cursor Particles
// ═══════════════════════════════════════════

const CursorParticles = {
  enabled: false,
  particles: [],
  lastX: 0,
  lastY: 0,
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'cursor-particles';
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    document.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;

      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 2) {
        this.addParticle(e.clientX, e.clientY, speed);
      }

      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    this.animate();
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  addParticle(x, y, speed) {
    const count = Math.min(Math.floor(speed / 10), 3);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        decay: 0.015 + Math.random() * 0.015,
        size: 2 + Math.random() * 3,
        hue: this.getCurrentThemeHue()
      });
    }
  },

  getCurrentThemeHue() {
    const hues = {
      day: 40,
      sunny: 80,
      night: 220,
      midnight: 210,
      rain: 200,
      snow: 200
    };
    return hues[currentMode] || 40;
  },

  animate() {
    if (!this.enabled) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      requestAnimationFrame(() => this.animate());
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 60%, 60%, ${p.life * 0.6})`;
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('cursorParticlesEnabled', this.enabled);
    showToast(this.enabled ? '光标粒子已启用' : '光标粒子已关闭');
  }
};

// ═══════════════════════════════════════════
// 4. 快捷方式 3D 倾斜效果 - 3D Tilt
// ═══════════════════════════════════════════

const TiltEffect = {
  init() {
    document.addEventListener('mousemove', (e) => {
      const tile = e.target.closest('.launch-tile');
      if (!tile) return;

      const rect = tile.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -8;
      const rotateY = (x - centerX) / centerX * 8;

      tile.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
    });

    document.addEventListener('mouseleave', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('launch-tile')) {
        e.target.style.transform = '';
      }
    }, true);
  }
};

// ═══════════════════════════════════════════
// 5. 背景纹理系统 - Background Textures
// ═══════════════════════════════════════════

const BackgroundTexture = {
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'bg-texture';
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.03;mix-blend-mode:overlay;';
    document.body.insertBefore(this.canvas, document.body.firstChild);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.render();

    window.addEventListener('resize', () => {
      this.resize();
      this.render();
    });
  },

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  },

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 噪点纹理
    const imageData = this.ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = 255;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
};

// ═══════════════════════════════════════════
// 6. 快捷方式搜索功能 - Shortcut Search
// ═══════════════════════════════════════════

const ShortcutSearch = {
  input: null,
  results: [],

  init() {
    // 创建搜索框
    const searchContainer = document.createElement('div');
    searchContainer.className = 'shortcut-search-container hidden';
    searchContainer.innerHTML = `
      <input type="text" class="shortcut-search-input" placeholder="搜索快捷方式... (按 / 打开)" />
      <div class="shortcut-search-results"></div>
    `;

    document.body.appendChild(searchContainer);
    this.input = searchContainer.querySelector('.shortcut-search-input');

    // 快捷键打开搜索
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.show();
      } else if (e.key === 'Escape' && searchContainer.classList.contains('visible')) {
        this.hide();
      }
    });

    // 搜索输入
    this.input.addEventListener('input', (e) => {
      this.search(e.target.value);
    });

    // 点击外部关闭
    searchContainer.addEventListener('click', (e) => {
      if (e.target === searchContainer) {
        this.hide();
      }
    });
  },

  show() {
    const container = document.querySelector('.shortcut-search-container');
    container.classList.remove('hidden');
    setTimeout(() => {
      container.classList.add('visible');
      this.input.focus();
    }, 10);
  },

  hide() {
    const container = document.querySelector('.shortcut-search-container');
    container.classList.remove('visible');
    setTimeout(() => {
      container.classList.add('hidden');
      this.input.value = '';
      this.search('');
    }, 300);
  },

  search(query) {
    const resultsContainer = document.querySelector('.shortcut-search-results');

    if (!query.trim()) {
      resultsContainer.innerHTML = '';
      return;
    }

    // 从全局 shortcuts 搜索
    if (typeof window.shortcuts === 'undefined') {
      resultsContainer.innerHTML = '<div class="search-no-results">暂无快捷方式</div>';
      return;
    }

    const filtered = window.shortcuts.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.url.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div class="search-no-results">未找到匹配项</div>';
      return;
    }

    resultsContainer.innerHTML = filtered.slice(0, 8).map(s => `
      <a href="${s.url}" class="search-result-item" target="_blank">
        <div class="search-result-icon">${s.iconEmoji || '·'}</div>
        <div class="search-result-info">
          <div class="search-result-title">${s.title}</div>
          <div class="search-result-url">${s.url}</div>
        </div>
      </a>
    `).join('');
  }
};

// ═══════════════════════════════════════════
// 7. 使用频率统计 - Usage Analytics
// ═══════════════════════════════════════════

const UsageAnalytics = {
  STORAGE_KEY: 'shortcutUsageStats',
  stats: {},

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.stats = saved ? JSON.parse(saved) : {};
  },

  track(shortcutId) {
    if (!this.stats[shortcutId]) {
      this.stats[shortcutId] = {
        count: 0,
        lastUsed: Date.now()
      };
    }

    this.stats[shortcutId].count++;
    this.stats[shortcutId].lastUsed = Date.now();

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
  },

  getTopUsed(limit = 10) {
    return Object.entries(this.stats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([id, data]) => ({ id, ...data }));
  },

  sortByFrequency(shortcuts) {
    return shortcuts.sort((a, b) => {
      const aCount = this.stats[a.id]?.count || 0;
      const bCount = this.stats[b.id]?.count || 0;
      return bCount - aCount;
    });
  }
};

// ═══════════════════════════════════════════
// 图片懒加载
// ═══════════════════════════════════════════

const LazyImageLoader = {
  observer: null,

  init() {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, lazy loading disabled');
      return;
    }

    // 创建观察器
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.lazySrc;

          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy-src');
            this.observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px', // 提前50px开始加载
      threshold: 0.01
    });

    // 观察所有带有 data-lazy-src 的图片
    this.observeImages();
  },

  observeImages() {
    if (!this.observer) return;

    const lazyImages = document.querySelectorAll('img[data-lazy-src]');
    lazyImages.forEach(img => {
      this.observer.observe(img);
    });
  },

  // 供外部调用，当动态添加图片时
  observe(img) {
    if (this.observer && img.dataset.lazySrc) {
      this.observer.observe(img);
    }
  }
};

// ═══════════════════════════════════════════
// 初始化所有增强功能
// ═══════════════════════════════════════════

function initEnhancements() {
  // 智能主题
  SmartTheme.init();

  // 光标粒子
  const particlesEnabled = localStorage.getItem('cursorParticlesEnabled') === 'true';
  if (particlesEnabled) {
    CursorParticles.enabled = true;
  }
  CursorParticles.init();

  // 3D 倾斜效果
  TiltEffect.init();

  // 背景纹理
  BackgroundTexture.init();

  // 快捷方式搜索
  ShortcutSearch.init();

  // 使用统计
  UsageAnalytics.init();

  // 图片懒加载
  LazyImageLoader.init();

  console.log('✨ Enhancements loaded');
}

// 增强原有的 setMode 函数，添加波纹效果
const originalSetMode = window.setMode;
if (originalSetMode) {
  window.setMode = function(mode, opts) {
    // 如果是用户触发，添加波纹效果
    if (opts && opts.fromUser) {
      const dot = document.querySelector(`.mode-dot[data-mode="${mode}"]`);
      if (dot) {
        const rect = dot.getBoundingClientRect();
        ThemeRipple.create(rect.left + rect.width / 2, rect.top + rect.height / 2, mode);
      }
    }

    originalSetMode.call(this, mode, opts);
  };
}

// 导出到全局
window.SmartTheme = SmartTheme;
window.CursorParticles = CursorParticles;
window.ShortcutSearch = ShortcutSearch;
window.UsageAnalytics = UsageAnalytics;
window.LazyImageLoader = LazyImageLoader;

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}
