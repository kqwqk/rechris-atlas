/**
 * Snow Canvas Effect
 * Detailed snowflake shapes with wind drift and rotation
 */

export class SnowEffect {
  constructor(canvasId = 'snow-canvas') {
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
    this.time = 0;
    this.flakes = [];

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
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Get layer configuration based on performance mode
   */
  getLayerConfig(mode) {
    const configs = {
      low: [
        { count: 20, sizeMin: 3.2, sizeMax: 5.2, speedMin: 1.15, speedMax: 1.9, wobble: 0.65, alphaMin: 0.62, alphaMax: 0.82, driftMin: -0.34, driftMax: 0.34, windWeight: 1.35, detail: 1, branchScale: 1.12, glow: 0 },
        { count: 50, sizeMin: 1.9, sizeMax: 3.3, speedMin: 0.72, speedMax: 1.28, wobble: 0.45, alphaMin: 0.36, alphaMax: 0.62, driftMin: -0.24, driftMax: 0.24, windWeight: 1.04, detail: 0, branchScale: 0.9, glow: 0 },
      ],
      medium: [
        { count: 25, sizeMin: 3.2, sizeMax: 5.2, speedMin: 1.15, speedMax: 1.9, wobble: 0.65, alphaMin: 0.62, alphaMax: 0.82, driftMin: -0.34, driftMax: 0.34, windWeight: 1.35, detail: 2, branchScale: 1.12, glow: 0.1 },
        { count: 60, sizeMin: 1.9, sizeMax: 3.3, speedMin: 0.72, speedMax: 1.28, wobble: 0.45, alphaMin: 0.36, alphaMax: 0.62, driftMin: -0.24, driftMax: 0.24, windWeight: 1.04, detail: 1, branchScale: 0.9, glow: 0.05 },
        { count: 100, sizeMin: 0.8, sizeMax: 1.55, speedMin: 0.4, speedMax: 0.9, wobble: 0.24, alphaMin: 0.12, alphaMax: 0.32, driftMin: -0.14, driftMax: 0.15, windWeight: 0.78, detail: 0, branchScale: 0.6, glow: 0 },
      ],
      high: [
        { count: 34, sizeMin: 3.2, sizeMax: 5.2, speedMin: 1.15, speedMax: 1.9, wobble: 0.65, alphaMin: 0.62, alphaMax: 0.82, driftMin: -0.34, driftMax: 0.34, windWeight: 1.35, detail: 2, branchScale: 1.12, glow: 0.2 },
        { count: 84, sizeMin: 1.9, sizeMax: 3.3, speedMin: 0.72, speedMax: 1.28, wobble: 0.45, alphaMin: 0.36, alphaMax: 0.62, driftMin: -0.24, driftMax: 0.24, windWeight: 1.04, detail: 1, branchScale: 0.9, glow: 0.08 },
        { count: 150, sizeMin: 0.8, sizeMax: 1.55, speedMin: 0.4, speedMax: 0.9, wobble: 0.24, alphaMin: 0.12, alphaMax: 0.32, driftMin: -0.14, driftMax: 0.15, windWeight: 0.78, detail: 0, branchScale: 0.6, glow: 0.02 },
      ],
    };

    return configs[mode] || configs.medium;
  }

  /**
   * Create a single snowflake
   */
  createFlake(layer, fresh = true) {
    const size = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);
    return {
      x: Math.random() * (this.W + 160) - 80,
      y: fresh ? Math.random() * this.H : -size * (10 + Math.random() * 18),
      size,
      speed: layer.speedMin + Math.random() * (layer.speedMax - layer.speedMin),
      wobbleAmp: layer.wobble * (0.7 + Math.random() * 0.7),
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.008 + Math.random() * 0.018,
      alpha: layer.alphaMin + Math.random() * (layer.alphaMax - layer.alphaMin),
      baseDrift: layer.driftMin + Math.random() * (layer.driftMax - layer.driftMin),
      windWeight: layer.windWeight * (0.8 + Math.random() * 0.5),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      detail: layer.detail,
      branchScale: layer.branchScale,
      glow: layer.glow,
    };
  }

  /**
   * Spawn all snowflakes
   */
  spawnFlakes() {
    this.flakes = [];
    this.layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        this.flakes.push(this.createFlake(layer, true));
      }
    });
  }

  /**
   * Calculate wind effect
   */
  getWind(tick) {
    const breeze = Math.sin(tick * 0.016) * 1.02 + Math.sin(tick * 0.0054 + 1.2) * 1.2;
    const gust = Math.pow((Math.sin(tick * 0.0028 - 0.8) + 1) * 0.5, 4) * 2.85;
    return breeze + gust - 0.58;
  }

  /**
   * Draw a single snowflake
   */
  drawSnowflake(flake, windPush) {
    const { x, y, size, alpha, detail, branchScale, glow, rotation } = flake;
    const ctx = this.ctx;

    // Glow effect for larger flakes
    if (glow > 0) {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, size * 4.5);
      halo.addColorStop(0, `rgba(255, 255, 255, ${alpha * glow})`);
      halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.arc(x, y, size * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha + 0.08, 0.92)})`;
    ctx.lineWidth = Math.max(0.7, size * 0.25);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Motion blur trail for small flakes in strong wind
    if (detail === 0 && Math.abs(windPush) > 0.35) {
      const trail = Math.min(14, size * 7 + Math.abs(windPush) * 4);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
      ctx.lineWidth = Math.max(0.45, size * 0.18);
      ctx.beginPath();
      ctx.moveTo(-trail, trail * 0.12);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = Math.max(0.7, size * 0.25);
    }

    // Draw snowflake arms
    const armLength = size * 2.6;
    const branchNear = armLength * 0.45;
    const branchFar = armLength * 0.72;
    const branchLen = size * 0.78 * branchScale;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      // Main arm
      ctx.moveTo(0, 0);
      ctx.lineTo(dx * armLength, dy * armLength);

      // Near branches (detail level 1+)
      if (detail >= 1) {
        const bx = dx * branchNear;
        const by = dy * branchNear;
        ctx.moveTo(bx, by);
        ctx.lineTo(
          bx + Math.cos(angle + Math.PI * 0.68) * branchLen,
          by + Math.sin(angle + Math.PI * 0.68) * branchLen
        );
        ctx.moveTo(bx, by);
        ctx.lineTo(
          bx + Math.cos(angle - Math.PI * 0.68) * branchLen,
          by + Math.sin(angle - Math.PI * 0.68) * branchLen
        );
      }

      // Far branches (detail level 2)
      if (detail >= 2) {
        const tx = dx * branchFar;
        const ty = dy * branchFar;
        ctx.moveTo(tx, ty);
        ctx.lineTo(
          tx + Math.cos(angle + Math.PI * 0.78) * branchLen * 0.75,
          ty + Math.sin(angle + Math.PI * 0.78) * branchLen * 0.75
        );
        ctx.moveTo(tx, ty);
        ctx.lineTo(
          tx + Math.cos(angle - Math.PI * 0.78) * branchLen * 0.75,
          ty + Math.sin(angle - Math.PI * 0.78) * branchLen * 0.75
        );
      }
    }
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.45, size * 0.22), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Animation loop
   */
  tick() {
    if (!this.active) return;

    this.ctx.clearRect(0, 0, this.W, this.H);
    this.time += 1;

    const wind = this.getWind(this.time);

    for (let i = 0; i < this.flakes.length; i++) {
      const f = this.flakes[i];
      const sway = Math.sin(f.wobblePhase + this.time * f.wobbleSpeed) * f.wobbleAmp;
      const windPush = wind * f.windWeight;

      // Update position
      f.y += f.speed * (1 + Math.abs(windPush) * 0.16);
      f.x += f.baseDrift + sway + windPush * 1.22;
      f.rotation += f.rotationSpeed + windPush * 0.018;

      // Reset at bottom
      if (f.y > this.H + f.size * 6) {
        this.flakes[i] = this.createFlake({
          count: 1,
          sizeMin: f.size * 0.85,
          sizeMax: f.size * 1.05,
          speedMin: Math.max(0.2, f.speed * 0.92),
          speedMax: f.speed * 1.08,
          wobble: f.wobbleAmp,
          alphaMin: Math.max(0.1, f.alpha * 0.92),
          alphaMax: Math.min(0.9, f.alpha * 1.05),
          driftMin: f.baseDrift - 0.05,
          driftMax: f.baseDrift + 0.05,
          windWeight: f.windWeight,
          detail: f.detail,
          branchScale: f.branchScale,
          glow: f.glow,
        }, false);
        continue;
      }

      // Wrap horizontally
      if (f.x > this.W + 90) f.x = -90;
      if (f.x < -90) f.x = this.W + 90;

      this.drawSnowflake(f, windPush);
    }

    this.raf = requestAnimationFrame(() => this.tick());
  }

  /**
   * Start snow effect
   */
  start() {
    if (this.active) return;
    this.resize();
    this.spawnFlakes();
    this.time = 0;
    this.active = true;
    this.tick();
  }

  /**
   * Stop snow effect
   */
  stop() {
    this.active = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.flakes = [];
  }

  /**
   * Set performance mode
   */
  setPerformanceMode(mode) {
    if (['auto', 'high', 'medium', 'low'].includes(mode)) {
      this.performanceMode = mode;
      this.layers = this.getLayerConfig(mode);

      // If active, respawn flakes with new configuration
      if (this.active) {
        this.spawnFlakes();
      }

      if (import.meta.env.DEV) console.log(`Snow performance mode: ${mode}, flake count: ${this.flakes.length}`);
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      active: this.active,
      flakeCount: this.flakes.length,
      performanceMode: this.performanceMode,
    };
  }
}

/**
 * Create snow effect with legacy API
 */
export function createSnowEffect() {
  const snow = new SnowEffect();

  // Expose legacy global state object
  window.snowState = {
    active: false,
    raf: null,
    start: () => snow.start(),
    stop: () => snow.stop(),
    setPerformanceMode: (mode) => snow.setPerformanceMode(mode),
    getStats: () => snow.getStats(),
  };

  return snow;
}
