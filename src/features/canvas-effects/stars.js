/**
 * Stars Canvas Effect
 * Natural scintillation animation with performance optimization
 */

export class StarsEffect {
  constructor(canvasId = 'stars-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      if (import.meta.env.DEV) console.warn(`Canvas element #${canvasId} not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.active = false;
    this.raf = null;
    this.lastTime = 0;
    this.stars = [];
    this.W = 0;
    this.H = 0;

    // Performance settings
    this.performanceMode = 'auto'; // 'auto', 'high', 'low'
    this.targetFPS = 60;
    this.actualFPS = 60;
    this.frameCount = 0;
    this.fpsCheckInterval = 1000; // Check FPS every second
    this.lastFPSCheck = 0;

    this.init();
  }

  init() {
    this.resize();
    this.generateStars();
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

  generateStars() {
    // Star color temperatures
    const colors = [
      [200, 210, 230],  // cool white
      [220, 215, 200],  // warm white
      [170, 195, 240],  // blue-white
      [240, 225, 180],  // yellow
      [230, 195, 175],  // orange
    ];

    // Adjust star count based on performance mode
    const starCount = this.getStarCount();

    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      const isBright = Math.random() < 0.12;
      const c = colors[Math.floor(Math.random() * colors.length)];
      this.stars.push({
        x: Math.random() * 100,  // percent
        y: Math.random() * 60,   // percent — upper 60% of sky
        baseR: isBright ? (1.2 + Math.random() * 1.2) : (0.4 + Math.random() * 0.8),
        r: c[0], g: c[1], b: c[2],
        baseAlpha: isBright ? (0.5 + Math.random() * 0.3) : (0.15 + Math.random() * 0.25),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.8,
        flickerAmp: isBright ? (0.15 + Math.random() * 0.2) : (0.08 + Math.random() * 0.12),
        flashPhase: Math.random() * Math.PI * 2,
        flashSpeed: 0.05 + Math.random() * 0.1,
        isBright,
      });
    }
  }

  getStarCount() {
    if (this.performanceMode === 'low') return 80;
    if (this.performanceMode === 'high') return 150;

    // Auto mode: adjust based on device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    if (isMobile || isLowEnd) return 100;
    return 150;
  }

  checkPerformance(time) {
    this.frameCount++;

    if (time - this.lastFPSCheck >= this.fpsCheckInterval) {
      this.actualFPS = Math.round((this.frameCount * 1000) / (time - this.lastFPSCheck));
      this.frameCount = 0;
      this.lastFPSCheck = time;

      // Auto-adjust performance mode
      if (this.performanceMode === 'auto') {
        if (this.actualFPS < 45 && this.stars.length > 80) {
          if (import.meta.env.DEV) console.log('Stars: Low FPS detected, reducing star count');
          this.stars = this.stars.slice(0, 80);
        }
      }
    }
  }

  tick(time) {
    if (!this.active) return;

    const t = time * 0.001; // seconds
    const dt = this.lastTime ? t - this.lastTime : 0.016;
    this.lastTime = t;

    // Performance monitoring
    this.checkPerformance(time);

    this.ctx.clearRect(0, 0, this.W, this.H);

    for (const s of this.stars) {
      const px = s.x * this.W / 100;
      const py = s.y * this.H / 100;

      // Primary oscillation — smooth breathing
      const osc = Math.sin(s.phase + t * s.speed);
      // Secondary faster shimmer
      const shimmer = Math.sin(s.phase * 3.7 + t * s.speed * 2.3) * 0.3;
      // Rare bright flash (scintillation spike)
      const flash = Math.pow(Math.max(0, Math.sin(s.flashPhase + t * s.flashSpeed)), 12) * 0.4;

      const alpha = Math.max(0.02, s.baseAlpha + (osc + shimmer) * s.flickerAmp + flash);
      const radius = s.baseR * (1 + flash * 0.5);

      // Draw star core
      this.ctx.beginPath();
      this.ctx.arc(px, py, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha})`;
      this.ctx.fill();

      // Glow for bright stars (skip in low performance mode)
      if (s.isBright && alpha > 0.4 && this.performanceMode !== 'low') {
        const glow = this.ctx.createRadialGradient(px, py, 0, px, py, radius * 3.5);
        glow.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${alpha * 0.25})`);
        glow.addColorStop(1, 'transparent');
        this.ctx.beginPath();
        this.ctx.arc(px, py, radius * 3.5, 0, Math.PI * 2);
        this.ctx.fillStyle = glow;
        this.ctx.fill();
      }
    }

    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  start() {
    if (this.active) return;
    this.resize();
    this.lastTime = 0;
    this.lastFPSCheck = performance.now();
    this.frameCount = 0;
    this.active = true;
    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  stop() {
    this.active = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.ctx.clearRect(0, 0, this.W, this.H);
  }

  setPerformanceMode(mode) {
    if (['auto', 'high', 'low'].includes(mode)) {
      this.performanceMode = mode;
      this.generateStars();
      if (import.meta.env.DEV) console.log(`Stars performance mode: ${mode}, star count: ${this.stars.length}`);
    }
  }

  getStats() {
    return {
      active: this.active,
      starCount: this.stars.length,
      fps: this.actualFPS,
      performanceMode: this.performanceMode
    };
  }
}

// Legacy global API for backward compatibility
export function createStarsEffect() {
  const stars = new StarsEffect();

  // Expose legacy global state object
  window.starsState = {
    active: false,
    raf: null,
    start: () => stars.start(),
    stop: () => stars.stop(),
    setPerformanceMode: (mode) => stars.setPerformanceMode(mode),
    getStats: () => stars.getStats()
  };

  return stars;
}
