/**
 * Rain Canvas Effect
 * Multi-layer rain with splashes and wind drift
 */

export class RainEffect {
  constructor(canvasId = 'rain-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      if (import.meta.env.DEV) console.warn(`Canvas element #${canvasId} not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.active = false;
    this.raf = null;
    this.W = 0;
    this.H = 0;

    this.drops = [];
    this.splashes = [];

    // Performance settings
    this.performanceMode = 'auto';
    this.layers = this.getLayerConfig('auto');

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Get layer configuration based on performance mode
   */
  getLayerConfig(mode) {
    const configs = {
      low: [
        { count: 40,  lenMin: 12, lenMax: 22, speed: 20, w: 1.0, color: [200,210,225], alphaMin: 0.20, alphaMax: 0.38 },
        { count: 80,  lenMin: 7,  lenMax: 15, speed: 14, w: 0.7, color: [185,195,212], alphaMin: 0.12, alphaMax: 0.25 },
      ],
      medium: [
        { count: 50,  lenMin: 12, lenMax: 22, speed: 20, w: 1.0, color: [200,210,225], alphaMin: 0.20, alphaMax: 0.38 },
        { count: 100, lenMin: 7,  lenMax: 15, speed: 14, w: 0.7, color: [185,195,212], alphaMin: 0.12, alphaMax: 0.25 },
        { count: 80,  lenMin: 4,  lenMax: 9,  speed: 9,  w: 0.4, color: [170,180,200], alphaMin: 0.06, alphaMax: 0.15 },
      ],
      high: [
        { count: 70,  lenMin: 12, lenMax: 22, speed: 20, w: 1.0, color: [200,210,225], alphaMin: 0.20, alphaMax: 0.38 },
        { count: 150, lenMin: 7,  lenMax: 15, speed: 14, w: 0.7, color: [185,195,212], alphaMin: 0.12, alphaMax: 0.25 },
        { count: 120, lenMin: 4,  lenMax: 9,  speed: 9,  w: 0.4, color: [170,180,200], alphaMin: 0.06, alphaMax: 0.15 },
      ],
    };

    return configs[mode] || configs.medium;
  }

  /**
   * Spawn rain drops based on current layer configuration
   */
  spawnDrops() {
    this.drops = [];

    this.layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        this.drops.push({
          x: Math.random() * (this.W + 60) - 30,
          y: Math.random() * this.H,
          len: layer.lenMin + Math.random() * (layer.lenMax - layer.lenMin),
          speed: layer.speed + Math.random() * layer.speed * 0.4,
          w: layer.w + Math.random() * 0.15,
          r: layer.color[0],
          g: layer.color[1],
          b: layer.color[2],
          alpha: layer.alphaMin + Math.random() * (layer.alphaMax - layer.alphaMin),
          drift: 1.5 + Math.random() * 1, // slight wind drift
          splashChance: layer.w > 1 ? 0.3 : 0.05,
        });
      }
    });
  }

  /**
   * Animation loop
   */
  tick() {
    if (!this.active) return;

    this.ctx.clearRect(0, 0, this.W, this.H);

    // Draw rain drops
    for (const d of this.drops) {
      this.ctx.beginPath();
      this.ctx.moveTo(d.x, d.y);
      this.ctx.lineTo(d.x + d.drift * (d.len / d.speed), d.y + d.len);
      this.ctx.strokeStyle = `rgba(${d.r},${d.g},${d.b},${d.alpha})`;
      this.ctx.lineWidth = d.w;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();

      // Move drop
      d.y += d.speed;
      d.x += d.drift;

      // Reset at bottom — spawn splash
      if (d.y > this.H) {
        if (Math.random() < d.splashChance) {
          this.splashes.push({
            x: d.x,
            y: this.H - 2 + Math.random() * 4,
            r: 0,
            maxR: 2 + Math.random() * 3,
            alpha: 0.2 + Math.random() * 0.15,
            life: 0,
            maxLife: 8 + Math.random() * 6,
          });
        }
        d.y = -d.len - Math.random() * 80;
        d.x = Math.random() * (this.W + 60) - 30;
      }
    }

    // Draw splashes — tiny expanding rings
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life++;
      s.r = s.maxR * (s.life / s.maxLife);
      const a = s.alpha * (1 - s.life / s.maxLife);

      if (a <= 0 || s.life >= s.maxLife) {
        this.splashes.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.ellipse(s.x, s.y, s.r * 1.5, s.r * 0.5, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(180,190,205,${a})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    }

    this.raf = requestAnimationFrame(() => this.tick());
  }

  /**
   * Start rain effect
   */
  start() {
    if (this.active) return;
    this.resize();
    this.spawnDrops();
    this.active = true;
    this.tick();
  }

  /**
   * Stop rain effect
   */
  stop() {
    this.active = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.drops = [];
    this.splashes = [];
  }

  /**
   * Set performance mode
   */
  setPerformanceMode(mode) {
    if (['auto', 'high', 'medium', 'low'].includes(mode)) {
      this.performanceMode = mode;
      this.layers = this.getLayerConfig(mode);

      // If active, respawn drops with new configuration
      if (this.active) {
        this.spawnDrops();
      }

      if (import.meta.env.DEV) console.log(`Rain performance mode: ${mode}, drop count: ${this.drops.length}`);
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      active: this.active,
      dropCount: this.drops.length,
      splashCount: this.splashes.length,
      performanceMode: this.performanceMode,
    };
  }
}

/**
 * Create rain effect with legacy API
 */
export function createRainEffect() {
  const rain = new RainEffect();

  // Expose legacy global state object
  window.rainState = {
    active: false,
    raf: null,
    start: () => rain.start(),
    stop: () => rain.stop(),
    setPerformanceMode: (mode) => rain.setPerformanceMode(mode),
    getStats: () => rain.getStats(),
  };

  return rain;
}
