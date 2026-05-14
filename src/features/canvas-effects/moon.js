/**
 * Moon Canvas Effect
 * Procedural moon surface with craters, maria, and terminator
 */

export class MoonEffect {
  constructor(canvasId = 'moon-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      if (import.meta.env.DEV) console.warn(`Canvas element #${canvasId} not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.rendered = false;

    // Moon is static, so we render once
    this.render();
  }

  /**
   * Seeded random number generator for consistent moon surface
   */
  createSeededRandom(seed = 42) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 16807 + 0) % 2147483647;
      return (currentSeed - 1) / 2147483646;
    };
  }

  /**
   * Render the moon surface
   */
  render() {
    if (this.rendered) return;

    const S = this.canvas.width; // 480px - supersampled, displayed at 90px CSS
    const R = S / 2;
    const cx = R, cy = R;
    const ctx = this.ctx;

    // Seeded random for consistent appearance
    const srand = this.createSeededRandom(42);

    // Clip everything to the disk
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    // 1) Base surface — smooth lit surface, light from upper-left
    const base = ctx.createRadialGradient(cx * 0.72, cy * 0.68, R * 0.02, cx, cy, R);
    base.addColorStop(0, '#e2ddd2');
    base.addColorStop(0.3, '#d5d0c5');
    base.addColorStop(0.65, '#c0bbb0');
    base.addColorStop(1, '#aaa59a');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);

    // 2) Lunar maria — soft dark regions (seas)
    const maria = [
      { x: 0.36, y: 0.30, rx: 0.20, ry: 0.13, a: 0.10 },
      { x: 0.46, y: 0.54, rx: 0.15, ry: 0.11, a: 0.08 },
      { x: 0.56, y: 0.40, rx: 0.11, ry: 0.15, a: 0.07 },
      { x: 0.30, y: 0.62, rx: 0.13, ry: 0.10, a: 0.06 },
    ];

    maria.forEach(m => {
      const g = ctx.createRadialGradient(
        m.x * S, m.y * S, 0,
        m.x * S, m.y * S, Math.max(m.rx, m.ry) * S
      );
      g.addColorStop(0, `rgba(75, 72, 65, ${m.a})`);
      g.addColorStop(0.5, `rgba(80, 77, 70, ${m.a * 0.4})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(m.x * S, m.y * S, m.rx * S, m.ry * S, srand() * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3) Craters — subtle impact craters
    const craters = [
      { x: 0.32, y: 0.28, r: 0.055 },
      { x: 0.52, y: 0.35, r: 0.035 },
      { x: 0.40, y: 0.56, r: 0.045 },
      { x: 0.60, y: 0.58, r: 0.03 },
    ];

    craters.forEach(cr => {
      const px = cr.x * S;
      const py = cr.y * S;
      const pr = cr.r * S;

      // Shadow
      const shadow = ctx.createRadialGradient(
        px + pr * 0.12, py + pr * 0.12, pr * 0.2,
        px, py, pr
      );
      shadow.addColorStop(0, 'rgba(50, 45, 40, 0.10)');
      shadow.addColorStop(0.8, 'rgba(50, 45, 40, 0.05)');
      shadow.addColorStop(1, 'transparent');
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();

      // Highlight rim
      ctx.strokeStyle = 'rgba(230, 225, 218, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px - pr * 0.06, py - pr * 0.06, pr * 0.8, -Math.PI * 0.7, Math.PI * 0.15);
      ctx.stroke();
    });

    // 4) Terminator — dark limb on the right side
    const terminator = ctx.createLinearGradient(cx * 0.5, 0, S, 0);
    terminator.addColorStop(0, 'transparent');
    terminator.addColorStop(0.55, 'transparent');
    terminator.addColorStop(0.8, 'rgba(12, 15, 28, 0.2)');
    terminator.addColorStop(1, 'rgba(5, 8, 18, 0.55)');
    ctx.fillStyle = terminator;
    ctx.fillRect(0, 0, S, S);

    // 5) Earthshine — very faint blue on dark limb
    const earthshine = ctx.createRadialGradient(
      cx + R * 0.65, cy, 0,
      cx + R * 0.65, cy, R * 0.5
    );
    earthshine.addColorStop(0, 'rgba(100, 130, 180, 0.03)');
    earthshine.addColorStop(1, 'transparent');
    ctx.fillStyle = earthshine;
    ctx.fillRect(0, 0, S, S);

    // 6) Limb darkening — edges fade
    const limb = ctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R);
    limb.addColorStop(0, 'transparent');
    limb.addColorStop(0.85, 'rgba(25, 22, 18, 0.06)');
    limb.addColorStop(1, 'rgba(15, 12, 8, 0.18)');
    ctx.fillStyle = limb;
    ctx.fillRect(0, 0, S, S);

    ctx.restore();
    this.rendered = true;
  }

  /**
   * Clear the moon (not typically needed)
   */
  clear() {
    const S = this.canvas.width;
    this.ctx.clearRect(0, 0, S, S);
    this.rendered = false;
  }

  /**
   * Start - moon is static, so just ensure it's rendered
   */
  start() {
    if (!this.rendered) {
      this.render();
    }
  }

  /**
   * Stop - moon stays visible (it's static)
   */
  stop() {
    // Moon is static, no need to clear
  }

  /**
   * Performance mode (moon is static, no performance impact)
   */
  setPerformanceMode(mode) {
    // Moon is static, performance mode doesn't affect it
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      rendered: this.rendered,
      static: true,
      performanceImpact: 'none'
    };
  }
}

/**
 * Create and render moon effect
 */
export function createMoonEffect() {
  const moon = new MoonEffect();
  return moon;
}
