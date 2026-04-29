// ═══════════════════════════════════════════
// Generate overlay elements
// ═══════════════════════════════════════════

// Stars — Canvas-based with natural scintillation
const starsState = { active: false, raf: null };

(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Star color temperatures
  const colors = [
    [200, 210, 230],  // cool white
    [220, 215, 200],  // warm white
    [170, 195, 240],  // blue-white
    [240, 225, 180],  // yellow
    [230, 195, 175],  // orange
  ];

  // Generate star data
  const stars = [];
  for (let i = 0; i < 150; i++) {
    const isBright = Math.random() < 0.12;
    const c = colors[Math.floor(Math.random() * colors.length)];
    stars.push({
      x: Math.random() * 100,  // percent
      y: Math.random() * 60,   // percent — upper 60% of sky
      baseR: isBright ? (1.2 + Math.random() * 1.2) : (0.4 + Math.random() * 0.8),
      r: c[0], g: c[1], b: c[2],
      baseAlpha: isBright ? (0.5 + Math.random() * 0.3) : (0.15 + Math.random() * 0.25),
      // Each star has its own oscillation phase and speed
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.8,  // radians per second
      // Scintillation: amplitude of flicker
      flickerAmp: isBright ? (0.15 + Math.random() * 0.2) : (0.08 + Math.random() * 0.12),
      // Occasional bright flash
      flashPhase: Math.random() * Math.PI * 2,
      flashSpeed: 0.05 + Math.random() * 0.1,
      isBright,
    });
  }

  let lastTime = 0;

  function tick(time) {
    if (!starsState.active) return;
    const t = time * 0.001; // seconds
    const dt = lastTime ? t - lastTime : 0.016;
    lastTime = t;

    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      const px = s.x * W / 100;
      const py = s.y * H / 100;

      // Primary oscillation — smooth breathing
      const osc = Math.sin(s.phase + t * s.speed);
      // Secondary faster shimmer
      const shimmer = Math.sin(s.phase * 3.7 + t * s.speed * 2.3) * 0.3;
      // Rare bright flash (scintillation spike)
      const flash = Math.pow(Math.max(0, Math.sin(s.flashPhase + t * s.flashSpeed)), 12) * 0.4;

      const alpha = Math.max(0.02, s.baseAlpha + (osc + shimmer) * s.flickerAmp + flash);
      const radius = s.baseR * (1 + flash * 0.5);

      // Draw star core
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha})`;
      ctx.fill();

      // Glow for bright stars
      if (s.isBright && alpha > 0.4) {
        const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 3.5);
        glow.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${alpha * 0.25})`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    }

    starsState.raf = requestAnimationFrame(tick);
  }

  starsState.start = function() {
    if (starsState.active) return;
    resize();
    lastTime = 0;
    starsState.active = true;
    starsState.raf = requestAnimationFrame(tick);
  };
  starsState.stop = function() {
    starsState.active = false;
    if (starsState.raf) cancelAnimationFrame(starsState.raf);
    ctx.clearRect(0, 0, W, H);
  };
})();

// ═══════════════════════════════════════════
// Canvas Moon — procedural surface with craters, maria, terminator
// ═══════════════════════════════════════════
(function renderMoon() {
  const c = document.getElementById('moon-canvas');
  const ctx = c.getContext('2d');
  const S = c.width; // 480 — supersampled, displayed at 90px CSS
  const R = S / 2;
  const cx = R, cy = R;

  // Seeded random
  let seed = 42;
  function srand() { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; }

  // Clip everything to the disk
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

  // 1) Base — smooth lit surface, light from upper-left
  const base = ctx.createRadialGradient(cx * 0.72, cy * 0.68, R * 0.02, cx, cy, R);
  base.addColorStop(0, '#e2ddd2');
  base.addColorStop(0.3, '#d5d0c5');
  base.addColorStop(0.65, '#c0bbb0');
  base.addColorStop(1, '#aaa59a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);

  // 2) Lunar maria — soft dark regions
  const maria = [
    { x: 0.36, y: 0.30, rx: 0.20, ry: 0.13, a: 0.10 },
    { x: 0.46, y: 0.54, rx: 0.15, ry: 0.11, a: 0.08 },
    { x: 0.56, y: 0.40, rx: 0.11, ry: 0.15, a: 0.07 },
    { x: 0.30, y: 0.62, rx: 0.13, ry: 0.10, a: 0.06 },
  ];
  maria.forEach(m => {
    const g = ctx.createRadialGradient(m.x * S, m.y * S, 0, m.x * S, m.y * S, Math.max(m.rx, m.ry) * S);
    g.addColorStop(0, `rgba(75, 72, 65, ${m.a})`);
    g.addColorStop(0.5, `rgba(80, 77, 70, ${m.a * 0.4})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(m.x * S, m.y * S, m.rx * S, m.ry * S, srand() * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3) Craters — just 4 subtle ones
  const craters = [
    { x: 0.32, y: 0.28, r: 0.055 },
    { x: 0.52, y: 0.35, r: 0.035 },
    { x: 0.40, y: 0.56, r: 0.045 },
    { x: 0.60, y: 0.58, r: 0.03 },
  ];
  craters.forEach(cr => {
    const px = cr.x * S, py = cr.y * S, pr = cr.r * S;
    // Shadow
    const shadow = ctx.createRadialGradient(px + pr * 0.12, py + pr * 0.12, pr * 0.2, px, py, pr);
    shadow.addColorStop(0, 'rgba(50, 45, 40, 0.10)');
    shadow.addColorStop(0.8, 'rgba(50, 45, 40, 0.05)');
    shadow.addColorStop(1, 'transparent');
    ctx.fillStyle = shadow;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    // Highlight rim
    ctx.strokeStyle = 'rgba(230, 225, 218, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px - pr * 0.06, py - pr * 0.06, pr * 0.8, -Math.PI * 0.7, Math.PI * 0.15); ctx.stroke();
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
  const es = ctx.createRadialGradient(cx + R * 0.65, cy, 0, cx + R * 0.65, cy, R * 0.5);
  es.addColorStop(0, 'rgba(100, 130, 180, 0.03)');
  es.addColorStop(1, 'transparent');
  ctx.fillStyle = es;
  ctx.fillRect(0, 0, S, S);

  // 6) Limb darkening — edges fade
  const limb = ctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R);
  limb.addColorStop(0, 'transparent');
  limb.addColorStop(0.85, 'rgba(25, 22, 18, 0.06)');
  limb.addColorStop(1, 'rgba(15, 12, 8, 0.18)');
  ctx.fillStyle = limb;
  ctx.fillRect(0, 0, S, S);
})();

// ═══════════════════════════════════════════
// Canvas Snow — snowflake shapes with drifting wind
// ═══════════════════════════════════════════
const snowState = { active: false, raf: null };

(function initSnow() {
  const canvas = document.getElementById('snow-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  let time = 0;
  const flakes = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function createFlake(layer, fresh = true) {
    const size = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);
    return {
      x: Math.random() * (W + 160) - 80,
      y: fresh ? Math.random() * H : -size * (10 + Math.random() * 18),
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
      glow: layer.glow
    };
  }

  function spawnFlakes() {
    flakes.length = 0;
    const layers = [
      { count: 34, sizeMin: 3.2, sizeMax: 5.2, speedMin: 1.15, speedMax: 1.9, wobble: 0.65, alphaMin: 0.62, alphaMax: 0.82, driftMin: -0.34, driftMax: 0.34, windWeight: 1.35, detail: 2, branchScale: 1.12, glow: 0.2 },
      { count: 84, sizeMin: 1.9, sizeMax: 3.3, speedMin: 0.72, speedMax: 1.28, wobble: 0.45, alphaMin: 0.36, alphaMax: 0.62, driftMin: -0.24, driftMax: 0.24, windWeight: 1.04, detail: 1, branchScale: 0.9, glow: 0.08 },
      { count: 150, sizeMin: 0.8, sizeMax: 1.55, speedMin: 0.4, speedMax: 0.9, wobble: 0.24, alphaMin: 0.12, alphaMax: 0.32, driftMin: -0.14, driftMax: 0.15, windWeight: 0.78, detail: 0, branchScale: 0.6, glow: 0.02 },
    ];

    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        flakes.push(createFlake(layer, true));
      }
    });
  }
  spawnFlakes();

  function getWind(tick) {
    const breeze = Math.sin(tick * 0.016) * 1.02 + Math.sin(tick * 0.0054 + 1.2) * 1.2;
    const gust = Math.pow((Math.sin(tick * 0.0028 - 0.8) + 1) * 0.5, 4) * 2.85;
    return breeze + gust - 0.58;
  }

  function drawSnowflake(flake, windPush) {
    const { x, y, size, alpha, detail, branchScale, glow, rotation } = flake;

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

    const armLength = size * 2.6;
    const branchNear = armLength * 0.45;
    const branchFar = armLength * 0.72;
    const branchLen = size * 0.78 * branchScale;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      ctx.moveTo(0, 0);
      ctx.lineTo(dx * armLength, dy * armLength);

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

    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.45, size * 0.22), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    if (!snowState.active) return;
    ctx.clearRect(0, 0, W, H);
    time += 1;

    const wind = getWind(time);

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      const sway = Math.sin(f.wobblePhase + time * f.wobbleSpeed) * f.wobbleAmp;
      const windPush = wind * f.windWeight;

      f.y += f.speed * (1 + Math.abs(windPush) * 0.16);
      f.x += f.baseDrift + sway + windPush * 1.22;
      f.rotation += f.rotationSpeed + windPush * 0.018;

      if (f.y > H + f.size * 6) {
        flakes[i] = createFlake({
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
          glow: f.glow
        }, false);
        continue;
      }

      if (f.x > W + 90) f.x = -90;
      if (f.x < -90) f.x = W + 90;

      drawSnowflake(f, windPush);
    }

    snowState.raf = requestAnimationFrame(tick);
  }

  snowState.start = function() {
    if (snowState.active) return;
    resize();
    spawnFlakes();
    snowState.active = true;
    tick();
  };
  snowState.stop = function() {
    snowState.active = false;
    if (snowState.raf) cancelAnimationFrame(snowState.raf);
    ctx.clearRect(0, 0, W, H);
  };
})();

// ═══════════════════════════════════════════
// Canvas Rain — 淅淅沥沥 effect with splashes
// ═══════════════════════════════════════════
const rainState = { active: false, raf: null };

(function initRain() {
  const canvas = document.getElementById('rain-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Drop pool — three layers
  const drops = [];
  const splashes = [];

  function spawnDrops() {
    drops.length = 0;
    const layers = [
      { count: 70,  lenMin: 12, lenMax: 22, speed: 20, w: 1.0, color: [200,210,225], alphaMin: 0.20, alphaMax: 0.38 },  // foreground
      { count: 150, lenMin: 7,  lenMax: 15, speed: 14, w: 0.7, color: [185,195,212], alphaMin: 0.12, alphaMax: 0.25 },  // mid
      { count: 120, lenMin: 4,  lenMax: 9,  speed: 9,  w: 0.4, color: [170,180,200], alphaMin: 0.06, alphaMax: 0.15 },  // background
    ];
    layers.forEach(l => {
      for (let i = 0; i < l.count; i++) {
        drops.push({
          x: Math.random() * (W + 60) - 30,
          y: Math.random() * H,
          len: l.lenMin + Math.random() * (l.lenMax - l.lenMin),
          speed: l.speed + Math.random() * l.speed * 0.4,
          w: l.w + Math.random() * 0.15,
          r: l.color[0], g: l.color[1], b: l.color[2],
          alpha: l.alphaMin + Math.random() * (l.alphaMax - l.alphaMin),
          drift: 1.5 + Math.random() * 1,  // slight wind drift
          splashChance: l.w > 1 ? 0.3 : 0.05,
        });
      }
    });
  }
  spawnDrops();

  function tick() {
    if (!rainState.active) return;
    ctx.clearRect(0, 0, W, H);

    // Draw drops
    for (const d of drops) {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.drift * (d.len / d.speed), d.y + d.len);
      ctx.strokeStyle = `rgba(${d.r},${d.g},${d.b},${d.alpha})`;
      ctx.lineWidth = d.w;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Move
      d.y += d.speed;
      d.x += d.drift;

      // Reset at bottom — spawn splash
      if (d.y > H) {
        if (Math.random() < d.splashChance) {
          splashes.push({
            x: d.x, y: H - 2 + Math.random() * 4,
            r: 0, maxR: 2 + Math.random() * 3,
            alpha: 0.2 + Math.random() * 0.15,
            life: 0, maxLife: 8 + Math.random() * 6,
          });
        }
        d.y = -d.len - Math.random() * 80;
        d.x = Math.random() * (W + 60) - 30;
      }
    }

    // Draw splashes — tiny expanding rings
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.life++;
      s.r = s.maxR * (s.life / s.maxLife);
      const a = s.alpha * (1 - s.life / s.maxLife);
      if (a <= 0 || s.life >= s.maxLife) { splashes.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r * 1.5, s.r * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180,190,205,${a})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    rainState.raf = requestAnimationFrame(tick);
  }

  // Expose start/stop
  rainState.start = function() {
    if (rainState.active) return;
    resize();
    spawnDrops();
    rainState.active = true;
    tick();
  };
  rainState.stop = function() {
    rainState.active = false;
    if (rainState.raf) cancelAnimationFrame(rainState.raf);
    ctx.clearRect(0, 0, W, H);
  };
})();

// ═══════════════════════════════════════════
// Ambient audio (synthesized — no external files needed)
// ═══════════════════════════════════════════

let audioCtx = null;
let audioEnabled = true;
let activeNodes = [];

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function stopAllAudio() {
  activeNodes.forEach(n => { try { n.stop(); } catch(e) {} });
  activeNodes = [];
}

function playNightAmbience() {
  if (!audioEnabled) return;
  const ctx = getAudioCtx();
  // Crickets-like: filtered noise bursts
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.02;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 4000;
  filter.Q.value = 15;
  const gain = ctx.createGain();
  gain.gain.value = 0.3;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  activeNodes.push(source);
}

function playRainAmbience() {
  if (!audioEnabled) return;
  const ctx = getAudioCtx();

  // Helper: create pink-ish noise (−3dB/octave roll-off via shaped white noise)
  function createPinkNoise(duration, channels) {
    const len = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(channels, len, ctx.sampleRate);
    for (let ch = 0; ch < channels; ch++) {
      const d = buf.getChannelData(ch);
      let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.015;
        b6 = w * 0.115926;
      }
    }
    return buf;
  }

  // 1) Main rain curtain — stereo pink noise, band-filtered for natural rain
  const rainBuf = createPinkNoise(4, 2);
  const rainSrc = ctx.createBufferSource();
  rainSrc.buffer = rainBuf;
  rainSrc.loop = true;
  const rainHP = ctx.createBiquadFilter();
  rainHP.type = 'highpass'; rainHP.frequency.value = 400;
  const rainLP = ctx.createBiquadFilter();
  rainLP.type = 'lowpass'; rainLP.frequency.value = 8000;
  const rainGain = ctx.createGain();
  rainGain.gain.value = 0.18;
  rainSrc.connect(rainHP).connect(rainLP).connect(rainGain).connect(ctx.destination);
  rainSrc.start();
  activeNodes.push(rainSrc);

  // 2) High-frequency "sizzle" layer — lighter rain on leaves/surfaces
  const sizzleBuf = createPinkNoise(3, 1);
  const sizzleSrc = ctx.createBufferSource();
  sizzleSrc.buffer = sizzleBuf;
  sizzleSrc.loop = true;
  const sizzleHP = ctx.createBiquadFilter();
  sizzleHP.type = 'highpass'; sizzleHP.frequency.value = 3000;
  const sizzleLP = ctx.createBiquadFilter();
  sizzleLP.type = 'lowpass'; sizzleLP.frequency.value = 12000;
  const sizzleGain = ctx.createGain();
  sizzleGain.gain.value = 0.06;
  sizzleSrc.connect(sizzleHP).connect(sizzleLP).connect(sizzleGain).connect(ctx.destination);
  sizzleSrc.start();
  activeNodes.push(sizzleSrc);

  // 3) Low rumble — distant thunder bed
  const rumbleBuf = createPinkNoise(5, 1);
  const rumbleSrc = ctx.createBufferSource();
  rumbleSrc.buffer = rumbleBuf;
  rumbleSrc.loop = true;
  const rumbleLP = ctx.createBiquadFilter();
  rumbleLP.type = 'lowpass'; rumbleLP.frequency.value = 200;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.2;
  rumbleSrc.connect(rumbleLP).connect(rumbleGain).connect(ctx.destination);
  rumbleSrc.start();
  activeNodes.push(rumbleSrc);

  // 4) Periodic distant thunder cracks
  let thunderTimer = null;
  function scheduleThunder() {
    if (!audioEnabled) return;
    const now = ctx.currentTime;
    const dur = 1.5 + Math.random() * 3;
    const tBuf = createPinkNoise(dur, 1);
    const tSrc = ctx.createBufferSource();
    tSrc.buffer = tBuf;
    const tLP = ctx.createBiquadFilter();
    tLP.type = 'lowpass'; tLP.frequency.value = 120 + Math.random() * 80;
    const tGain = ctx.createGain();
    const vol = 0.15 + Math.random() * 0.2;
    tGain.gain.setValueAtTime(0, now);
    tGain.gain.linearRampToValueAtTime(vol, now + 0.05 + Math.random() * 0.1);
    tGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    tSrc.connect(tLP).connect(tGain).connect(ctx.destination);
    tSrc.start(now);
    tSrc.stop(now + dur + 0.1);
    thunderTimer = setTimeout(scheduleThunder, 8000 + Math.random() * 20000);
  }
  thunderTimer = setTimeout(scheduleThunder, 3000 + Math.random() * 5000);

  // 5) Individual drip impacts — noise burst + resonant tone
  let dripTimer = null;
  function scheduleDrip() {
    if (!audioEnabled) return;
    const now = ctx.currentTime;
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = now + Math.random() * 0.15;
      const dur = 0.02 + Math.random() * 0.04;
      // noise burst for the impact
      const nLen = Math.ceil(ctx.sampleRate * dur);
      const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
      const nd = nBuf.getChannelData(0);
      for (let j = 0; j < nLen; j++) nd[j] = (Math.random() * 2 - 1) * Math.exp(-j / (nLen * 0.3));
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = nBuf;
      const nBP = ctx.createBiquadFilter();
      nBP.type = 'bandpass';
      nBP.frequency.value = 2000 + Math.random() * 4000;
      nBP.Q.value = 2 + Math.random() * 3;
      const nGain = ctx.createGain();
      const vol = 0.04 + Math.random() * 0.06;
      nGain.gain.setValueAtTime(vol, t);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      nSrc.connect(nBP).connect(nGain).connect(ctx.destination);
      nSrc.start(t);
      nSrc.stop(t + dur + 0.01);
    }
    dripTimer = setTimeout(scheduleDrip, 40 + Math.random() * 100);
  }
  scheduleDrip();

  const origStop = stopAllAudio;
  stopAllAudio = function() {
    clearTimeout(thunderTimer);
    clearTimeout(dripTimer);
    origStop();
    stopAllAudio = origStop;
  };
}

function playSnowAmbience() {
  if (!audioEnabled) return;
  const ctx = getAudioCtx();

  function createWindNoise(duration, amplitude = 0.025) {
    const len = Math.ceil(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let smooth = 0;
    for (let i = 0; i < len; i++) {
      const white = (Math.random() * 2 - 1) * amplitude;
      smooth = smooth * 0.985 + white * 0.16;
      data[i] = smooth;
    }
    return buf;
  }

  const baseSrc = ctx.createBufferSource();
  baseSrc.buffer = createWindNoise(4.5, 0.03);
  baseSrc.loop = true;
  const baseHP = ctx.createBiquadFilter();
  baseHP.type = 'highpass';
  baseHP.frequency.value = 120;
  const baseLP = ctx.createBiquadFilter();
  baseLP.type = 'lowpass';
  baseLP.frequency.value = 1200;
  const baseGain = ctx.createGain();
  baseGain.gain.value = 0.095;
  baseSrc.connect(baseHP).connect(baseLP).connect(baseGain).connect(ctx.destination);
  baseSrc.start();

  const airySrc = ctx.createBufferSource();
  airySrc.buffer = createWindNoise(3.5, 0.018);
  airySrc.loop = true;
  const airyHP = ctx.createBiquadFilter();
  airyHP.type = 'highpass';
  airyHP.frequency.value = 700;
  const airyLP = ctx.createBiquadFilter();
  airyLP.type = 'lowpass';
  airyLP.frequency.value = 3200;
  const airyGain = ctx.createGain();
  airyGain.gain.value = 0.026;
  airySrc.connect(airyHP).connect(airyLP).connect(airyGain).connect(ctx.destination);
  airySrc.start();

  const gustSrc = ctx.createBufferSource();
  gustSrc.buffer = createWindNoise(5.5, 0.022);
  gustSrc.loop = true;
  const gustHP = ctx.createBiquadFilter();
  gustHP.type = 'highpass';
  gustHP.frequency.value = 250;
  const gustLP = ctx.createBiquadFilter();
  gustLP.type = 'lowpass';
  gustLP.frequency.value = 2100;
  const gustGain = ctx.createGain();
  gustGain.gain.value = 0.024;
  gustSrc.connect(gustHP).connect(gustLP).connect(gustGain).connect(ctx.destination);
  gustSrc.start();

  const rumbleSrc = ctx.createBufferSource();
  rumbleSrc.buffer = createWindNoise(6, 0.018);
  rumbleSrc.loop = true;
  const rumbleLP = ctx.createBiquadFilter();
  rumbleLP.type = 'lowpass';
  rumbleLP.frequency.value = 180;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.012;
  rumbleSrc.connect(rumbleLP).connect(rumbleGain).connect(ctx.destination);
  rumbleSrc.start();

  const airyLfo = ctx.createOscillator();
  airyLfo.type = 'sine';
  airyLfo.frequency.value = 0.07;
  const airyDepth = ctx.createGain();
  airyDepth.gain.value = 0.012;
  airyLfo.connect(airyDepth).connect(airyGain.gain);
  airyLfo.start();

  const gustLfo = ctx.createOscillator();
  gustLfo.type = 'sine';
  gustLfo.frequency.value = 0.028;
  const gustDepth = ctx.createGain();
  gustDepth.gain.value = 0.018;
  gustLfo.connect(gustDepth).connect(gustGain.gain);
  gustLfo.start();

  const rumbleLfo = ctx.createOscillator();
  rumbleLfo.type = 'sine';
  rumbleLfo.frequency.value = 0.021;
  const rumbleDepth = ctx.createGain();
  rumbleDepth.gain.value = 0.008;
  rumbleLfo.connect(rumbleDepth).connect(rumbleGain.gain);
  rumbleLfo.start();

  activeNodes.push({
    stop() {
      [baseSrc, airySrc, gustSrc, rumbleSrc, airyLfo, gustLfo, rumbleLfo].forEach(node => {
        try { node.stop(); } catch (e) {}
      });
    }
  });
}

function playForestAmbience() {
  if (!audioEnabled) return;
  const audio = document.getElementById('forest-audio');
  if (audio) {
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }
}

function stopForestAudio() {
  const audio = document.getElementById('forest-audio');
  if (audio) { audio.pause(); audio.currentTime = 0; }
}

// Audio toggle
document.getElementById('audio-toggle').addEventListener('click', function() {
  audioEnabled = !audioEnabled;
  this.classList.toggle('muted', !audioEnabled);
  if (!audioEnabled) {
    stopAllAudio();
    stopForestAudio();
  } else {
    // Re-start audio for the current mode
    if (currentMode === 'midnight') playNightAmbience();
    else if (currentMode === 'sunny') playForestAmbience();
    else if (currentMode === 'rain') playRainAmbience();
    else if (currentMode === 'snow') playSnowAmbience();
  }
});

// ═══════════════════════════════════════════
// Theme switching logic
// ═══════════════════════════════════════════

let currentMode = 'day';
const modes = ['night', 'midnight', 'day', 'sunny', 'rain', 'snow'];
const modeLabels = {
  night: '夜色',
  midnight: '月光',
  day: '白昼',
  sunny: '晴朗',
  rain: '雨天',
  snow: '雪天'
};

const ABOUT_ILLUSTRATIONS = {
  day: 'assets/generated/about-duck-day.png',
  sunny: 'assets/generated/about-duck-sunny.png',
  night: 'assets/generated/about-duck-night.png',
  midnight: 'assets/generated/about-duck-moonlight.png',
  rain: 'assets/generated/about-duck-rainy.png',
  snow: 'assets/generated/about-duck-snowy.png'
};

function preloadAboutIllustrations() {
  Object.keys(ABOUT_ILLUSTRATIONS).forEach((mode) => {
    const img = new Image();
    img.src = ABOUT_ILLUSTRATIONS[mode];
  });
}

function updateAboutIllustration(mode) {
  const img = document.getElementById('about-duck-scene');
  if (!img) return;
  const next = ABOUT_ILLUSTRATIONS[mode] || ABOUT_ILLUSTRATIONS.day;
  if (img.getAttribute('src') === next) return;
  img.classList.add('is-switching');
  window.setTimeout(function () {
    img.src = next;
    img.onload = function () {
      img.classList.remove('is-switching');
      img.onload = null;
    };
  }, 90);
}

function showToast(label) {
  const toast = document.getElementById('toast');
  toast.textContent = label;
  toast.classList.add('visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('visible'), 1500);
}
window.showToast = showToast;

function updateDots(mode) {
  document.querySelectorAll('.mode-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.mode === mode);
  });
}

function stopAll() {
  stopAllAudio();
  stopForestAudio();
  rainState.stop();
  starsState.stop();
  snowState.stop();
}

const STORAGE_THEME_LOCK = 'themeManualLock';

function setMode(mode, opts) {
  const silent = opts && opts.silent;
  if (opts && opts.fromUser) {
    try {
      localStorage.setItem(STORAGE_THEME_LOCK, '1');
    } catch (e) {}
  }
  const body = document.body;
  const leavesVid = document.getElementById('leaves-video');

  // Pause all videos first
  if (leavesVid) { leavesVid.pause(); leavesVid.currentTime = 0; }

  // Remove all mode classes
  body.classList.remove('midnight', 'light', 'leaves', 'rain', 'snow');

  stopAll();

  currentMode = mode;
  window.currentMode = currentMode;

  switch(mode) {
    case 'night':
      // Default — no classes needed
      break;

    case 'midnight':
      body.classList.add('midnight');
      starsState.start();
      playNightAmbience();
      break;

    case 'day':
      body.classList.add('light');
      break;

    case 'sunny':
      body.classList.add('light', 'leaves');
      if (leavesVid) leavesVid.play().catch(() => {});
      playForestAmbience();
      break;

    case 'rain':
      body.classList.add('rain');
      rainState.start();
      playRainAmbience();
      break;

    case 'snow':
      body.classList.add('snow');
      snowState.start();
      playSnowAmbience();
      break;
  }

  updateDots(mode);
  if (!silent) showToast(modeLabels[mode]);
  try {
    localStorage.setItem(STORAGE_MODE, mode);
  } catch (e) {}
  renderLaunchGrid();
  refreshWeatherIconForTheme();
  updateAboutIllustration(mode);
}

// ═══════════════════════════════════════════
// Keyboard shortcuts
// ═══════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  const ep = document.getElementById('edit-panel');
  if (ep && ep.classList.contains('open')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeShortcutSheetUiOnly();
    }
    return;
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch(e.key.toLowerCase()) {
    case 'n': setMode('night', { fromUser: true }); break;
    case 'm': setMode('midnight', { fromUser: true }); break;
    case 'd': setMode('day', { fromUser: true }); break;
    case 's': setMode('sunny', { fromUser: true }); break;
    case 'r': setMode('rain', { fromUser: true }); break;
    case 'w': setMode('snow', { fromUser: true }); break;
  }
});

// ═══════════════════════════════════════════
// Mode dot clicks
// ═══════════════════════════════════════════

document.querySelectorAll('.mode-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    setMode(dot.dataset.mode, { fromUser: true });
  });
});

// ═══════════════════════════════════════════
// Shortcuts & storage
// ═══════════════════════════════════════════

const STORAGE_MODE = 'themeLaunchMode';
/** 与 default-shortcuts.json 对齐；换键后重新从 JSON 种子，避免沿用删项前的 localStorage 条数 */
const STORAGE_SHORTCUTS = 'themeLaunchShortcuts_default51';
/** 与 Vercel SHORTCUTS_WRITE_SECRET 同值，仅本机用：localStorage.setItem(…, '<密钥>') 后带 Authorization 写 KV */
const STORAGE_API_SHORTCUTS_BEARER = 'themeApiShortcutsWriteBearer';
const STORAGE_PRIVACY_MODE = 'themeSitePrivacyMode';
const STORAGE_WEATHER_CITY = 'themeWeatherCity';

const WORK_CASES = [
  {
    title: '多项目跟进工作台',
    meta: '2026 · B 端效率',
    summary: '围绕项目状态、负责人、风险和下一步行动重组信息层级，让协作成员能在一个视图里判断优先级。',
    tags: ['Dashboard', 'Information Architecture', 'Workflow']
  },
  {
    title: '设计资源与 AI 工具流',
    meta: '2026 · Personal System',
    summary: '把灵感、素材、生成式工具和交付链路收纳到同一个入口，减少设计过程中的上下文切换。',
    tags: ['Design Ops', 'AI', 'Resource Library']
  },
  {
    title: '组件规范与前端协作',
    meta: '2025 · Design System',
    summary: '建立组件命名、状态、用法和验收说明，帮助设计稿从页面资产变成可维护的产品语言。',
    tags: ['Components', 'Spec', 'Handoff']
  },
  {
    title: '个人网站主题系统',
    meta: '2026 · Web Experience',
    summary: '用天气、昼夜和环境音组织页面情绪，同时保持文字、线框和交互控件的一致性。',
    tags: ['Theme', 'Motion', 'Personal Site']
  }
];

const INSPIRATION_ITEMS = [
  {
    title: '安静的信息密度',
    source: 'Interface Note',
    summary: '高频工具不需要讲很多故事，留白、线条和层级足够稳定时，界面会自然变得可信。',
    tags: ['Layout', 'B-side', 'Density']
  },
  {
    title: '单色图标系统',
    source: 'Icon Practice',
    summary: '在多主题界面里，单色图标比彩色图标更容易适配，也更适合作为长期维护的基础资产。',
    tags: ['Icon', 'Token', 'System']
  }
];

const LIFE_RECORDS = [
  {
    title: '阅读',
    meta: '长期',
    summary: '保留产品、城市、影像和技术相关的阅读线索，把碎片输入沉淀成设计判断。',
    tags: ['Books', 'Notes']
  },
  {
    title: '音乐与环境音',
    meta: '日常',
    summary: '把不同工作状态对应到不同声音，让打开页面本身成为切换状态的仪式。',
    tags: ['Sound', 'Focus']
  }
];

let siteContent = {
  workCases: WORK_CASES,
  inspirations: INSPIRATION_ITEMS,
  lifeRecords: LIFE_RECORDS
};

const TOOL_CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'work', label: '工作' },
  { id: 'design', label: '设计' },
  { id: 'ai', label: 'AI' },
  { id: 'dev', label: '开发' },
  { id: 'life', label: '生活' }
];

let activeView = 'home';
let activeToolCategory = 'all';
let privacyMode = 'public';

/** 离线或未加载 default-shortcuts.json 时的后备 */
const SHORTCUTS_FALLBACK = [
  { id: 'd1', title: 'Google', url: 'https://www.google.com', iconEmoji: '·', iconDataUrl: '', iconUrl: 'https://img.icons8.com/ios-filled/96/google-logo.png' },
  { id: 'd2', title: 'GitHub', url: 'https://github.com', iconEmoji: '·', iconDataUrl: '', iconUrl: 'https://img.icons8.com/ios-filled/96/github.png' },
  { id: 'd3', title: '哔哩哔哩', url: 'https://www.bilibili.com', iconEmoji: '·', iconDataUrl: '', iconUrl: 'https://img.icons8.com/ios-filled/96/bilibili.png' },
  { id: 'd4', title: '翻译', url: 'https://translate.google.com', iconEmoji: '·', iconDataUrl: '', iconUrl: 'https://img.icons8.com/ios-filled/96/google-translate.png' }
];

/** 与 icon8-host-slugs.json 同步；fetch 失败时使用（离线 / file://） */
const ICON8_SLUG_CONFIG_FALLBACK = {
  basePath: 'ios-filled/96',
  defaultSlug: 'internet',
  ipTitleContains: [{ contains: 'confluence', slug: 'confluence' }],
  hosts: {
    'cloud.seatable.cn': 'table',
    '18658196026.chandao.net': 'task',
    'chandao.net': 'task',
    'iconfont.cn': 'alphabetical-sorting',
    'figma.com': 'figma',
    'pinterest.jp': 'pinterest',
    'pinterest.com': 'pinterest',
    'fpi-inc.site': 'layers',
    'github.com': 'github',
    'github.io': 'github',
    'laoxuehost.com': 'server',
    'tianditu.gov.cn': 'map',
    'xdaforums.com': 'android-os',
    'perplexity.ai': 'artificial-intelligence',
    'pcspy.net': 'microphone',
    'giffgaff.com': 'sim-card',
    'recraft.ai': 'paint-palette',
    'paywallbuster.com': 'unlock',
    'js.design': 'pen',
    'cobalt.tools': 'download',
    'freepik.com': 'gallery',
    'ttsmaker.cn': 'microphone',
    'meshy.ai': 'blender',
    'ai-bot.cn': 'artificial-intelligence',
    'ezgif.com': 'gif',
    'yourware.so': 'cloud',
    'isparta.github.io': 'resize-four-directions',
    'playground.bfl.ai': 'artificial-intelligence',
    'live-tennis.cn': 'tennis',
    'agent.minimax.io': 'bot',
    'lovart.ai': 'color-palette',
    'gemini.google.com': 'google-logo',
    'google.com': 'google-logo',
    'mullvad.net': 'vpn',
    'chatgpt.com': 'artificial-intelligence',
    'grok.com': 'artificial-intelligence',
    'grok.x.ai': 'artificial-intelligence',
    'ncm2mp3.com': 'music',
    'whatshub.top': 'rocket',
    'bw.icu': 'globe',
    'tannel.xyz': 'globe',
    'fiodb.cn': 'globe',
    'stentvessel.shop': 'shopping-bag',
    'api-flowercloud.com': 'cloud',
    'afilmory.art': 'clapperboard',
    'newsnow.busiyi.world': 'news',
    'vercel.com': 'vercel',
    'vercel.app': 'rss',
    'bestdesignsonx.com': 'design',
    'naixi.net': 'comments',
    'taobao.com': 'taobao',
    'baidu.com': 'baidu',
    'map.baidu.com': 'baidu',
    'cqshushu.com': 'retro-tv',
    'immersivetranslate.com': 'google-translate',
    'navbar.gallery': 'menu',
    'teamxz.store': 'gift',
    'seatable.cn': 'table'
  }
};

let icon8SlugConfig = null;

function getIcon8Cfg() {
  return icon8SlugConfig || ICON8_SLUG_CONFIG_FALLBACK;
}

function shortcutHostnameFromUrl(rawUrl) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./i, '').toLowerCase();
  } catch (e) {
    return '';
  }
}

function isIcons8IconUrl(u) {
  return /^https?:\/\/img\.icons8\.com\//i.test((u || '').trim());
}

/** 规范 CDN 地址（无填色 hex），存 localStorage 用 */
function icons8Color96Url(slug) {
  const cfg = getIcon8Cfg();
  const bp = (cfg && cfg.basePath) || 'ios-filled/96';
  return 'https://img.icons8.com/' + bp + '/' + slug + '.png';
}

/** 浅色/亮色主题用深色图标；其余主题用浅色图标（无 CSS 滤镜） */
function icons8IosFilledHexForUi() {
  const b = document.body;
  if (!b) return 'c8c8c8';
  if (b.classList.contains('light') || b.classList.contains('snow')) return '2c2c2c';
  return 'c8c8c8';
}

function icons8CanonicalIosFilledUrl(u) {
  let t = (u || '').trim();
  if (!isIcons8IconUrl(t)) return t;
  t = t.replace(/\/color\/(\d+)\//gi, '/ios-filled/$1/');
  if (!/\/ios-filled\/\d+\//i.test(t)) return t;
  t = t.replace(/(\/ios-filled\/\d+\/)[0-9a-fA-F]{6}\//gi, '$1');
  return t;
}

function icons8DisplayIosFilledUrl(canonical) {
  const u = (canonical || '').trim();
  if (!isIcons8IconUrl(u) || !/\/ios-filled\/\d+\//i.test(u)) return u;
  const hex = icons8IosFilledHexForUi();
  return u.replace(/(\/ios-filled\/\d+\/)(?:[0-9a-fA-F]{6}\/)?([^/]+\.(?:png|webp))$/i, '$1' + hex + '/$2');
}

function icons8SlugForShortcut(s) {
  const cfg = getIcon8Cfg();
  const hosts = (cfg && cfg.hosts) || {};
  const defaultSlug = (cfg && cfg.defaultSlug) || 'internet';
  const ipRules = (cfg && cfg.ipTitleContains) || [];
  const host = shortcutHostnameFromUrl(s.url);

  if (!host || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    const title = (s.title || '').toLowerCase();
    for (let i = 0; i < ipRules.length; i++) {
      const c = (ipRules[i].contains || '').toLowerCase();
      if (c && title.indexOf(c) >= 0) return ipRules[i].slug;
    }
    return defaultSlug;
  }

  if (hosts[host]) return hosts[host];

  const segments = host.split('.');
  for (let start = 1; start <= segments.length - 2; start++) {
    const parent = segments.slice(start).join('.');
    if (hosts[parent]) return hosts[parent];
  }

  return defaultSlug;
}

function resolveRemoteIconUrlForShortcut(s) {
  const data = (s.iconDataUrl || '').trim();
  if (data) return '';
  const u = (s.iconUrl || '').trim();
  let canonical;
  if (isIcons8IconUrl(u)) canonical = icons8CanonicalIosFilledUrl(u);
  else canonical = icons8Color96Url(icons8SlugForShortcut(s));
  return icons8DisplayIosFilledUrl(canonical);
}

function normalizeShortcutRemoteIcon(s) {
  const data = (s.iconDataUrl || '').trim();
  if (data) return;
  const u = (s.iconUrl || '').trim();
  if (isIcons8IconUrl(u)) {
    s.iconUrl = icons8CanonicalIosFilledUrl(u);
    return;
  }
  s.iconUrl = icons8Color96Url(icons8SlugForShortcut(s));
}

function coerceSavedIconUrl(rawIconUrl, urlRaw, title) {
  const t = (rawIconUrl || '').trim();
  if (isIcons8IconUrl(t)) return icons8CanonicalIosFilledUrl(t);
  return icons8Color96Url(
    icons8SlugForShortcut({ url: urlRaw, title: title || '', iconEmoji: '·', iconDataUrl: '', iconUrl: '' })
  );
}

/** 线上利用 HTTP 缓存减轻重复读 JSON；本地开发仍 no-cache 便于改文件即刷新 */
function staticJsonFetchInit() {
  try {
    const h = typeof location !== 'undefined' && location.hostname;
    if (!h || h === 'localhost' || h === '127.0.0.1' || h === '[::1]') {
      return { cache: 'no-cache' };
    }
  } catch (e) {}
  return { cache: 'default' };
}

async function fetchIcon8SlugConfig() {
  try {
    const res = await fetch('icon8-host-slugs.json', staticJsonFetchInit());
    if (res.ok) return await res.json();
  } catch (e) {}
  return ICON8_SLUG_CONFIG_FALLBACK;
}

async function fetchDefaultShortcutsFromBookmarksJson() {
  try {
    const res = await fetch('default-shortcuts.json', staticJsonFetchInit());
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : null;
  } catch (e) {
    return null;
  }
}

async function fetchSiteContent() {
  try {
    const res = await fetch('site-content.json', staticJsonFetchInit());
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === 'object' ? data : null;
  } catch (e) {
    return null;
  }
}

function applySiteContent(data) {
  if (!data) return;
  siteContent = {
    workCases: Array.isArray(data.workCases) && data.workCases.length ? data.workCases : WORK_CASES,
    inspirations: Array.isArray(data.inspirations) && data.inspirations.length ? data.inspirations : INSPIRATION_ITEMS,
    lifeRecords: Array.isArray(data.lifeRecords) && data.lifeRecords.length ? data.lifeRecords : LIFE_RECORDS
  };
}

function renderWorkCases() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  grid.innerHTML = '';
  siteContent.workCases.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'work-card';

    const meta = document.createElement('div');
    meta.className = 'work-meta';
    meta.textContent = item.meta;

    const title = document.createElement('h3');
    title.textContent = item.title;

    const summary = document.createElement('p');
    summary.textContent = item.summary;

    const tags = document.createElement('div');
    tags.className = 'work-tags';
    item.tags.forEach((tag) => {
      const t = document.createElement('span');
      t.className = 'work-tag';
      t.textContent = tag;
      tags.appendChild(t);
    });

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(tags);
    grid.appendChild(card);
  });
}

function renderTaggedCards(gridId, items, className, metaKey) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = className;

    const meta = document.createElement('div');
    meta.className = 'content-meta';
    meta.textContent = item[metaKey] || '';

    const title = document.createElement('h3');
    title.textContent = item.title || '未命名';

    const summary = document.createElement('p');
    summary.textContent = item.summary || '';

    const tags = document.createElement('div');
    tags.className = 'content-tags';
    (item.tags || []).forEach((tag) => {
      const t = document.createElement('span');
      t.className = 'content-tag';
      t.textContent = tag;
      tags.appendChild(t);
    });

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(tags);
    grid.appendChild(card);
  });
}

function renderSiteContent() {
  if (document.getElementById('work-grid')) renderWorkCases();
  renderTaggedCards('inspiration-grid', siteContent.inspirations, 'inspiration-card', 'source');
}

function setActiveView(view) {
  if (!view) return;
  const targetPanel = document.querySelector(`.view-panel[data-view-panel="${view}"]`);
  if (targetPanel && targetPanel.hidden) view = 'home';
  activeView = view;
  document.body.classList.toggle('view-home', view === 'home');
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelectorAll('.view-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.viewPanel === view);
  });
  try {
    history.replaceState(null, '', '#' + view);
  } catch (e) {}
}

function setupSiteNavigation() {
  const visibleNavItems = Array.from(document.querySelectorAll('.nav-item')).filter((btn) => !btn.hidden);
  visibleNavItems.forEach((btn) => {
    btn.addEventListener('click', () => setActiveView(btn.dataset.view));
  });
  const hash = (window.location.hash || '').replace(/^#/, '');
  const views = visibleNavItems.map((btn) => btn.dataset.view);
  if (hash === 'about' || hash === 'work') setActiveView('home');
  else if (views.includes(hash)) setActiveView(hash);
  else setActiveView('home');
}

function loadPrivacyMode() {
  try {
    const saved = localStorage.getItem(STORAGE_PRIVACY_MODE);
    if (saved === 'private' || saved === 'public') return saved;
  } catch (e) {}
  return 'public';
}

function setPrivacyMode(mode) {
  privacyMode = mode === 'private' ? 'private' : 'public';
  try {
    localStorage.setItem(STORAGE_PRIVACY_MODE, privacyMode);
  } catch (e) {}
  const btn = document.getElementById('privacy-toggle');
  if (btn) {
    const isPrivate = privacyMode === 'private';
    btn.textContent = isPrivate ? '私人模式' : '公开模式';
    btn.classList.toggle('private', isPrivate);
    btn.setAttribute('aria-pressed', isPrivate ? 'true' : 'false');
    btn.title = isPrivate ? '当前显示全部私人入口' : '当前隐藏私人入口';
  }
  renderLaunchGrid();
}

function setupPrivacyToggle() {
  const btn = document.getElementById('privacy-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    setPrivacyMode(privacyMode === 'private' ? 'public' : 'private');
  });
  setPrivacyMode(loadPrivacyMode());
}

function textForShortcut(s) {
  return ((s.title || '') + ' ' + shortcutHostnameFromUrl(normalizeUrl(s.url || '')) + ' ' + (s.url || '')).toLowerCase();
}

function shortcutCategory(s) {
  const t = textForShortcut(s);
  if (/chatgpt|gemini|grok|perplexity|minimax|lovart|recraft|mesh|ai-|ai工具|flux|bfl|artificial/.test(t)) return 'ai';
  if (/figma|iconfont|pinterest|freepik|js\.design|bestdesign|navbar|素材|设计|palette|gallery|gif|ezgif|png|图标/.test(t)) return 'design';
  if (/github|vercel|yourware|server|laoxue|xda|fpi|component|api-|cloud|开发|部署|托管|论坛/.test(t)) return 'dev';
  if (/seatable|chandao|confluence|项目|任务|文档|translate|translation/.test(t)) return 'work';
  if (/map|taobao|tennis|podcast|播客|music|iptv|sim|vpn|mullvad|giffgaff|购物|电影|news|资讯/.test(t)) return 'life';
  return 'work';
}

function shortcutCategoryLabel(id) {
  const item = TOOL_CATEGORIES.find((x) => x.id === id);
  return item ? item.label : '其他';
}

function isShortcutPrivate(s) {
  const t = textForShortcut(s);
  return /account|accounts|login|profile|clientarea|pricing|兑换|vpn|shadowrocket|mullvad|giffgaff|chandao|seatable|confluence|47\.99\.|fpi-inc|teamxz|api-flowercloud|stentvessel|laoxue|bw\.icu|tannel|个人|内部|项目管理/.test(t);
}

function visibleShortcuts() {
  return shortcuts.filter((s) => {
    if (privacyMode !== 'private' && isShortcutPrivate(s)) return false;
    if (activeToolCategory !== 'all' && shortcutCategory(s) !== activeToolCategory) return false;
    return true;
  });
}

function renderToolFilters() {
  const wrap = document.getElementById('tool-filters');
  if (!wrap) return;
  const base = shortcuts.filter((s) => privacyMode === 'private' || !isShortcutPrivate(s));
  const counts = base.reduce((acc, s) => {
    const c = shortcutCategory(s);
    acc[c] = (acc[c] || 0) + 1;
    acc.all += 1;
    return acc;
  }, { all: 0 });
  if (activeToolCategory !== 'all' && !counts[activeToolCategory]) activeToolCategory = 'all';
  wrap.innerHTML = '';
  TOOL_CATEGORIES.forEach((cat) => {
    const count = counts[cat.id] || 0;
    if (cat.id !== 'all' && count === 0) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tool-filter';
    btn.classList.toggle('active', activeToolCategory === cat.id);
    btn.textContent = cat.label + ' ' + count;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', activeToolCategory === cat.id ? 'true' : 'false');
    btn.addEventListener('click', () => {
      activeToolCategory = cat.id;
      renderLaunchGrid();
    });
    wrap.appendChild(btn);
  });
}

let shortcuts = [];
let contextMenuShortcutId = null;
/** 编辑侧栏：当前正在编辑的 id，null 表示侧栏为「新增」表单 */
let shortcutSheetEditId = null;
let shortcutPendingDataUrlAdd = '';
let shortcutPendingDataUrlEdit = '';
/** 拖放结束后抑制一次点击，避免误打开链接 */
let launchTileSuppressNavigate = false;
/** 为 true 时从 /api/shortcuts 读列表，且增删改会 PUT 同步到服务端（Vercel KV） */
let shortcutsServerPersist = false;
/** 排序模式：'default' 或 'frequency' */
let shortcutsSortMode = localStorage.getItem('shortcutsSortMode') || 'default';

function syncGlobalAppState() {
  window.shortcuts = shortcuts;
  window.currentMode = currentMode;
  window.renderLaunchGrid = renderLaunchGrid;
  window.refreshWeatherIconForTheme = refreshWeatherIconForTheme;
}

async function fetchShortcutsFromServer() {
  try {
    const res = await fetch('/api/shortcuts', { cache: 'no-store' });
    if (!res.ok) return { persist: false };
    const persist = res.headers.get('X-Server-Persist') === '1';
    const list = await res.json();
    if (!Array.isArray(list)) return { persist: false };
    return { persist, list };
  } catch (e) {
    return { persist: false };
  }
}

function hideShortcutContextMenu() {
  const m = document.getElementById('shortcut-ctx-menu');
  if (!m) return;
  m.classList.add('hidden');
  m.setAttribute('aria-hidden', 'true');
  contextMenuShortcutId = null;
}

function showShortcutContextMenu(e, shortcutId) {
  e.preventDefault();
  e.stopPropagation();
  const m = document.getElementById('shortcut-ctx-menu');
  if (!m) return;
  contextMenuShortcutId = shortcutId;
  m.classList.remove('hidden');
  m.setAttribute('aria-hidden', 'false');
  const pad = 8;
  const mw = 168;
  const mh = 88;
  const x = Math.max(pad, Math.min(e.clientX, window.innerWidth - mw - pad));
  const y = Math.max(pad, Math.min(e.clientY, window.innerHeight - mh - pad));
  m.style.left = x + 'px';
  m.style.top = y + 'px';
}

function openShortcutSheetVisible() {
  const ep = document.getElementById('edit-panel');
  ep.classList.add('open');
  ep.setAttribute('aria-hidden', 'false');
}

function openAddShortcutPanel() {
  hideShortcutContextMenu();
  shortcutSheetEditId = null;
  shortcutPendingDataUrlAdd = '';
  const titleEl = document.getElementById('shortcut-edit-title');
  if (titleEl) titleEl.textContent = '新增快捷方式';
  const hintAdd = document.getElementById('edit-hint-add');
  const hintEdit = document.getElementById('edit-hint-edit');
  if (hintAdd) hintAdd.classList.remove('hidden');
  if (hintEdit) hintEdit.classList.add('hidden');
  const formAdd = document.getElementById('form-shortcut-add');
  const formEdit = document.getElementById('form-shortcut-edit');
  if (formAdd) formAdd.classList.remove('hidden');
  if (formEdit) formEdit.classList.add('hidden');
  const sfaTitle = document.getElementById('sfa-title');
  const sfaUrl = document.getElementById('sfa-url');
  const sfaEmoji = document.getElementById('sfa-emoji');
  const sfaIconurl = document.getElementById('sfa-iconurl');
  const sfaFile = document.getElementById('sfa-file');
  if (sfaTitle) sfaTitle.value = '';
  if (sfaUrl) sfaUrl.value = '';
  if (sfaEmoji) sfaEmoji.value = '·';
  if (sfaIconurl) sfaIconurl.value = '';
  if (sfaFile) sfaFile.value = '';
  openShortcutSheetVisible();
  if (sfaTitle) sfaTitle.focus();
}

function openEditShortcutPanel(rowId) {
  hideShortcutContextMenu();
  const item = shortcuts.find((x) => x.id === rowId);
  if (!item) return;
  shortcutSheetEditId = rowId;
  shortcutPendingDataUrlEdit = (item.iconDataUrl || '').trim();
  const titleEl = document.getElementById('shortcut-edit-title');
  if (titleEl) titleEl.textContent = '编辑快捷方式';
  const hintAdd = document.getElementById('edit-hint-add');
  const hintEdit = document.getElementById('edit-hint-edit');
  if (hintAdd) hintAdd.classList.add('hidden');
  if (hintEdit) hintEdit.classList.remove('hidden');
  const formAdd = document.getElementById('form-shortcut-add');
  const formEdit = document.getElementById('form-shortcut-edit');
  if (formAdd) formAdd.classList.add('hidden');
  if (formEdit) formEdit.classList.remove('hidden');
  const sfeTitle = document.getElementById('sfe-title');
  const sfeUrl = document.getElementById('sfe-url');
  const sfeEmoji = document.getElementById('sfe-emoji');
  const sfeIconurl = document.getElementById('sfe-iconurl');
  const sfeFile = document.getElementById('sfe-file');
  if (sfeTitle) sfeTitle.value = item.title || '';
  if (sfeUrl) sfeUrl.value = item.url || '';
  if (sfeEmoji) sfeEmoji.value = item.iconEmoji || '·';
  if (sfeIconurl) sfeIconurl.value = item.iconUrl || '';
  if (sfeFile) sfeFile.value = '';
  openShortcutSheetVisible();
  if (sfeTitle) sfeTitle.focus();
}

function shortcutUid() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function normalizeUrl(raw) {
  const t = (raw || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://' + t;
}

function persistShortcuts() {
  try {
    localStorage.setItem(STORAGE_SHORTCUTS, JSON.stringify(shortcuts));
  } catch (e) {}
  syncGlobalAppState();
  if (!shortcutsServerPersist) return;
  void (async function () {
    try {
      const headers = { 'Content-Type': 'application/json' };
      try {
        const t = localStorage.getItem(STORAGE_API_SHORTCUTS_BEARER);
        if (t) headers['Authorization'] = 'Bearer ' + t;
      } catch (e) {}
      const res = await fetch('/api/shortcuts', {
        method: 'PUT',
        headers,
        body: JSON.stringify(shortcuts)
      });
      if (!res.ok) {
        let msg = '服务端保存失败';
        try {
          const j = await res.json();
          if (j && j.error) msg = j.error;
        } catch (e2) {}
        showToast(msg);
      }
    } catch (e) {
      showToast('服务端保存失败');
    }
  })();
}

function clearLaunchDropHighlights(grid) {
  if (!grid) return;
  grid.querySelectorAll('.launch-tile-drop-target').forEach((el) => {
    el.classList.remove('launch-tile-drop-target');
  });
}

function reorderShortcutsByDrag(dragId, targetId) {
  if (!dragId || !targetId || dragId === targetId) return;
  const fromIdx = shortcuts.findIndex((x) => x.id === dragId);
  const toIdx = shortcuts.findIndex((x) => x.id === targetId);
  if (fromIdx < 0 || toIdx < 0) return;
  const next = shortcuts.slice();
  const [item] = next.splice(fromIdx, 1);
  let insertAt = toIdx;
  if (fromIdx < toIdx) insertAt = toIdx - 1;
  next.splice(insertAt, 0, item);
  shortcuts = next;
  persistShortcuts();
  renderLaunchGrid();
}

function renderLaunchGrid() {
  const grid = document.getElementById('launch-grid');
  const empty = document.getElementById('launch-empty');
  if (!grid || !empty) return;
  syncGlobalAppState();
  renderToolFilters();
  grid.innerHTML = '';
  let list = visibleShortcuts();

  // 根据排序模式排序
  if (shortcutsSortMode === 'frequency' && window.UsageAnalytics) {
    list = window.UsageAnalytics.sortByFrequency([...list]);
  }

  if (!list.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  function createLaunchTile(s) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'launch-tile';
    const iconWrap = document.createElement('div');
    iconWrap.className = 'launch-icon';
    const data = (s.iconDataUrl || '').trim();
    const remote = resolveRemoteIconUrlForShortcut(s);
    if (data) {
      const img = document.createElement('img');
      img.dataset.lazySrc = data;
      img.alt = '';
      // 添加占位符，避免布局抖动
      img.style.opacity = '0';
      img.onload = function() { this.style.opacity = '1'; };
      iconWrap.appendChild(img);
      // 使用懒加载
      if (window.LazyImageLoader) {
        window.LazyImageLoader.observe(img);
      } else {
        img.src = data;
      }
    } else if (remote && /^https?:\/\//i.test(remote)) {
      const img = document.createElement('img');
      img.dataset.lazySrc = remote;
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      // 添加占位符，避免布局抖动
      img.style.opacity = '0';
      img.onload = function() { this.style.opacity = '1'; };
      iconWrap.appendChild(img);
      // 使用懒加载
      if (window.LazyImageLoader) {
        window.LazyImageLoader.observe(img);
      } else {
        img.src = remote;
      }
    } else {
      iconWrap.textContent = (s.iconEmoji && s.iconEmoji.trim()) || '·';
    }
    const name = document.createElement('div');
    name.className = 'launch-name';
    const uNorm = normalizeUrl(s.url);
    let label = (s.title || '').trim();
    if (!label && uNorm) {
      try {
        label = new URL(uNorm).hostname.replace(/^www\./, '');
      } catch (e) {
        label = '未命名';
      }
    }
    if (!label) label = '未命名';
    name.textContent = label;
    btn.appendChild(iconWrap);
    btn.appendChild(name);
    btn.dataset.shortcutId = s.id;
    btn.draggable = true;
    btn.title = '单击打开 · 拖动排序 · 右键编辑或删除';
    btn.addEventListener('contextmenu', (ev) => showShortcutContextMenu(ev, s.id));
    btn.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', s.id);
      ev.dataTransfer.effectAllowed = 'move';
      btn.classList.add('launch-tile-dragging');
    });
    btn.addEventListener('dragend', () => {
      btn.classList.remove('launch-tile-dragging');
      clearLaunchDropHighlights(grid);
      launchTileSuppressNavigate = true;
      window.setTimeout(function () {
        launchTileSuppressNavigate = false;
      }, 80);
    });
    btn.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
      clearLaunchDropHighlights(grid);
      btn.classList.add('launch-tile-drop-target');
    });
    btn.addEventListener('dragleave', (ev) => {
      if (!btn.contains(ev.relatedTarget)) btn.classList.remove('launch-tile-drop-target');
    });
    btn.addEventListener('drop', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const dragId = ev.dataTransfer.getData('text/plain');
      clearLaunchDropHighlights(grid);
      reorderShortcutsByDrag(dragId, s.id);
    });
    btn.addEventListener('click', (ev) => {
      if (launchTileSuppressNavigate) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }
      // 记录使用统计
      if (window.UsageAnalytics) {
        window.UsageAnalytics.track(s.id);
      }
      const u = normalizeUrl(s.url);
      if (u) window.open(u, '_blank', 'noopener,noreferrer');
    });
    return btn;
  }

  const grouped = {};
  list.forEach((s) => {
    const cat = shortcutCategory(s);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  TOOL_CATEGORIES.filter((cat) => cat.id !== 'all').forEach((cat) => {
    const items = activeToolCategory === 'all' ? grouped[cat.id] : (cat.id === activeToolCategory ? grouped[cat.id] : null);
    if (!items || !items.length) return;

    const group = document.createElement('section');
    group.className = 'launch-group';

    const head = document.createElement('div');
    head.className = 'launch-group-head';
    const title = document.createElement('div');
    title.className = 'launch-group-title';
    title.textContent = shortcutCategoryLabel(cat.id);
    const count = document.createElement('div');
    count.className = 'tool-group-count';
    count.textContent = String(items.length).padStart(2, '0');
    head.appendChild(title);
    head.appendChild(count);

    const groupGrid = document.createElement('div');
    groupGrid.className = 'launch-group-grid';
    items.forEach((s) => groupGrid.appendChild(createLaunchTile(s)));

    group.appendChild(head);
    group.appendChild(groupGrid);
    grid.appendChild(group);
  });
}

function closeShortcutSheetUiOnly() {
  const ep = document.getElementById('edit-panel');
  if (!ep) return;
  ep.classList.remove('open');
  ep.setAttribute('aria-hidden', 'true');
}

function saveShortcutSheetAndClose() {
  const formAdd = document.getElementById('form-shortcut-add');
  const isAdd = formAdd && !formAdd.classList.contains('hidden');
  if (isAdd) {
    const urlRaw = document.getElementById('sfa-url');
    const u = urlRaw && normalizeUrl(urlRaw.value);
    if (!u) {
      alert('请填写网址');
      return;
    }
    const urlStr = urlRaw.value.trim();
    const titleStr = (document.getElementById('sfa-title') && document.getElementById('sfa-title').value.trim()) || '';
    const rawIcon =
      (document.getElementById('sfa-iconurl') && document.getElementById('sfa-iconurl').value.trim()) || '';
    shortcuts.push({
      id: shortcutUid(),
      title: titleStr,
      url: urlStr,
      iconEmoji:
        (document.getElementById('sfa-emoji') && document.getElementById('sfa-emoji').value.trim()) || '·',
      iconUrl: shortcutPendingDataUrlAdd ? '' : coerceSavedIconUrl(rawIcon, urlStr, titleStr),
      iconDataUrl: shortcutPendingDataUrlAdd
    });
  } else {
    const urlEl = document.getElementById('sfe-url');
    const u = urlEl && normalizeUrl(urlEl.value);
    if (!u) {
      alert('请填写网址');
      return;
    }
    const idx = shortcuts.findIndex((x) => x.id === shortcutSheetEditId);
    if (idx < 0) {
      closeShortcutSheetUiOnly();
      return;
    }
    const urlStr = urlEl.value.trim();
    const titleStr = (document.getElementById('sfe-title') && document.getElementById('sfe-title').value.trim()) || '';
    const rawIcon =
      (document.getElementById('sfe-iconurl') && document.getElementById('sfe-iconurl').value.trim()) || '';
    Object.assign(shortcuts[idx], {
      title: titleStr,
      url: urlStr,
      iconEmoji:
        (document.getElementById('sfe-emoji') && document.getElementById('sfe-emoji').value.trim()) || '·',
      iconUrl: shortcutPendingDataUrlEdit ? '' : coerceSavedIconUrl(rawIcon, urlStr, titleStr),
      iconDataUrl: shortcutPendingDataUrlEdit
    });
  }
  persistShortcuts();
  renderLaunchGrid();
  closeShortcutSheetUiOnly();
}

function setupShortcutForms() {
  function bindFile(inputId, pendingSetter, iconUrlInputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', function () {
      const f = input.files && input.files[0];
      if (!f) return;
      if (f.size > 800 * 1024) {
        alert('图片请小于 800KB，否则可能无法保存。');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        pendingSetter(typeof reader.result === 'string' ? reader.result : '');
        const iconUrlEl = document.getElementById(iconUrlInputId);
        if (iconUrlEl) iconUrlEl.value = '';
      };
      reader.readAsDataURL(f);
    });
  }

  bindFile(
    'sfa-file',
    function (v) {
      shortcutPendingDataUrlAdd = v;
    },
    'sfa-iconurl'
  );
  bindFile(
    'sfe-file',
    function (v) {
      shortcutPendingDataUrlEdit = v;
    },
    'sfe-iconurl'
  );

  const sfaUpload = document.getElementById('sfa-btn-upload');
  const sfaFile = document.getElementById('sfa-file');
  if (sfaUpload && sfaFile) sfaUpload.addEventListener('click', () => sfaFile.click());

  const sfeUpload = document.getElementById('sfe-btn-upload');
  const sfeFile = document.getElementById('sfe-file');
  if (sfeUpload && sfeFile) sfeUpload.addEventListener('click', () => sfeFile.click());

  const sfaClear = document.getElementById('sfa-btn-clear-img');
  if (sfaClear) {
    sfaClear.addEventListener('click', function () {
      shortcutPendingDataUrlAdd = '';
      if (sfaFile) sfaFile.value = '';
    });
  }

  const sfeClear = document.getElementById('sfe-btn-clear-img');
  if (sfeClear) {
    sfeClear.addEventListener('click', function () {
      shortcutPendingDataUrlEdit = '';
      if (sfeFile) sfeFile.value = '';
    });
  }

  const sfeDelete = document.getElementById('sfe-btn-delete');
  if (sfeDelete) {
    sfeDelete.addEventListener('click', function () {
      if (!shortcutSheetEditId) return;
      const s = shortcuts.find((x) => x.id === shortcutSheetEditId);
      if (!s) return;
      const name = (s.title || '').trim() || '此项';
      if (!confirm('确定删除「' + name + '」？')) return;
      shortcuts = shortcuts.filter((x) => x.id !== shortcutSheetEditId);
      shortcutSheetEditId = null;
      persistShortcuts();
      renderLaunchGrid();
      closeShortcutSheetUiOnly();
    });
  }

  const formAdd = document.getElementById('form-shortcut-add');
  const formEdit = document.getElementById('form-shortcut-edit');
  if (formAdd) {
    formAdd.addEventListener('submit', function (e) {
      e.preventDefault();
      saveShortcutSheetAndClose();
    });
  }
  if (formEdit) {
    formEdit.addEventListener('submit', function (e) {
      e.preventDefault();
      saveShortcutSheetAndClose();
    });
  }
}

function updateClock() {
  // 已由 DynamicGreeting 类接管，保留此函数以防兼容性问题
  // 如果 DynamicGreeting 未加载，使用简单版本
  if (window.dynamicGreeting) return;

  const clockEl = document.getElementById('clock');
  const greetEl = document.getElementById('greeting');
  if (!clockEl || !greetEl) return;
  const now = new Date();
  const h = now.getHours();
  let g = '你好';
  if (h < 5) g = '夜深了';
  else if (h < 12) g = '上午好';
  else if (h < 18) g = '下午好';
  else g = '晚上好';
  greetEl.textContent = g;
  clockEl.textContent = now.toLocaleString('zh-CN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ═══════════════════════════════════════════
// Local weather (Open-Meteo, browser geolocation)
// ═══════════════════════════════════════════

const WMO_WEATHER_ZH = {
  0: '晴朗',
  1: '大部晴朗',
  2: '多云',
  3: '阴',
  45: '雾',
  48: '雾',
  51: '小毛毛雨',
  53: '毛毛雨',
  55: '强毛毛雨',
  56: '冻毛毛雨',
  57: '冻毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '冻雨',
  67: '冻雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雪粒',
  80: '阵雨',
  81: '强阵雨',
  82: '暴雨',
  85: '阵雪',
  86: '强阵雪',
  95: '雷暴',
  96: '雷暴伴冰雹',
  99: '强雷暴冰雹'
};

function weatherCodeToZh(code) {
  return WMO_WEATHER_ZH[code] != null ? WMO_WEATHER_ZH[code] : '天气';
}

function weatherIsNightForIcon(isDay) {
  if (isDay === 0 || isDay === false) return true;
  if (isDay === 1 || isDay === true) return false;
  const h = new Date().getHours();
  return h < 6 || h >= 18;
}

/** Icons8 iOS Filled 图标 slug，与 WMO weather_code 对应 */
function weatherCodeToIconSlug(code, isDay) {
  if (code == null || code === undefined) return 'clouds';
  const night = weatherIsNightForIcon(isDay);
  if (code === 0 || code === 1) return night ? 'moon' : 'sun';
  if (code === 2) return night ? 'partly-cloudy-night' : 'partly-cloudy-day';
  if (code === 3) return 'clouds';
  if (code === 45 || code === 48) return 'fog-day';
  if (code >= 51 && code <= 55) return 'light-rain';
  if (code === 56 || code === 57) return 'sleet';
  if (code === 61) return 'light-rain';
  if (code === 63) return 'rain';
  if (code === 65) return 'heavy-rain';
  if (code === 66 || code === 67) return 'sleet';
  if (code === 71 || code === 77) return 'snowflake';
  if (code === 73 || code === 75) return 'snow';
  if (code === 80) return 'rain';
  if (code === 81 || code === 82) return 'heavy-rain';
  if (code === 85 || code === 86) return 'snow';
  if (code === 95) return 'storm';
  if (code === 96 || code === 99) return 'hail';
  return 'clouds';
}

function colorVarToIcons8Hex(varName, fallbackHex) {
  var hex = fallbackHex != null ? fallbackHex : '888888';
  try {
    var c = getComputedStyle(document.body).getPropertyValue(varName).trim();
    if (c.charAt(0) === '#' && (c.length === 4 || c.length === 7)) {
      hex = c.slice(1);
      if (hex.length === 3) {
        hex =
          hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
      }
    }
  } catch (e) {}
  return hex;
}

function midColorHexForIcons8() {
  return colorVarToIcons8Hex('--mid', '888888');
}

/** Icons8 OMG-IMG：ios 线框风格 + 路径内 hex 随主题 --text 动态着色 */
var WEATHER_ICON_STYLE_PATH = 'ios/96';

var lastWeatherIconSlug = 'clouds';

function weatherIcons8Url(slug) {
  var hex = colorVarToIcons8Hex('--text', '888888');
  return 'https://img.icons8.com/' + WEATHER_ICON_STYLE_PATH + '/' + hex + '/' + slug + '.png';
}

function applyWeatherIcon(slug) {
  var img = document.getElementById('weather-icon');
  if (!img) return;
  var s = slug || 'clouds';
  lastWeatherIconSlug = s;
  var url = weatherIcons8Url(s);
  if (img.getAttribute('src') !== url) img.src = url;
}

function refreshWeatherIconForTheme() {
  var img = document.getElementById('weather-icon');
  if (!img || !lastWeatherIconSlug) return;
  img.src = weatherIcons8Url(lastWeatherIconSlug);
}

/**
 * WMO 码粗分为：雪 / 雨 / 晴 / 多云（含阴、雾）
 * 与页面主题：snow, rain, sunny, day, 以及夜间 midnight / night
 */
function classifyWeatherKind(code) {
  if (code == null || code === undefined) return 'cloudy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rain';
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy';
  return 'cloudy';
}

/**
 * 默认规则：晴→sunny（夜→midnight）；多云→day（夜→night）；雨/雪昼夜均为 rain/snow
 * isDay: Open-Meteo current.is_day，1 白昼 0 夜晚；缺省时用本地 6–18 点近似
 */
function inferThemeFromWeather(weatherCode, isDay) {
  const kind = classifyWeatherKind(weatherCode);
  let night = false;
  if (isDay === 0 || isDay === false) night = true;
  else if (isDay === 1 || isDay === true) night = false;
  else {
    const h = new Date().getHours();
    night = h < 6 || h >= 18;
  }

  if (kind === 'snow') return 'snow';
  if (kind === 'rain') return 'rain';
  if (kind === 'clear') return night ? 'midnight' : 'sunny';
  if (kind === 'cloudy') return night ? 'night' : 'day';
  return night ? 'night' : 'day';
}

function isThemeManualLocked() {
  try {
    return localStorage.getItem(STORAGE_THEME_LOCK) === '1';
  } catch (e) {
    return false;
  }
}

function applyThemeFromWeatherData(data) {
  if (isThemeManualLocked()) return;
  const cur = data && data.current;
  if (!cur || cur.weather_code == null) return;
  const mode = inferThemeFromWeather(cur.weather_code, cur.is_day);
  if (modes.includes(mode)) setMode(mode, { silent: true });
}

function setWeatherLoading() {
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const metaEl = document.getElementById('weather-meta');
  if (!tempEl || !descEl) return;
  applyWeatherIcon('clouds');
  tempEl.textContent = '—';
  descEl.textContent = '加载中…';
  if (metaEl) metaEl.textContent = '';
}

function setWeatherError(msg) {
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const metaEl = document.getElementById('weather-meta');
  if (!tempEl || !descEl) return;
  applyWeatherIcon('clouds');
  tempEl.textContent = '—';
  descEl.textContent = msg;
  if (metaEl) metaEl.textContent = '';
}

/** 杭州市区近似坐标，用于无定位或定位前的默认天气 */
var HANGZHOU_COORDS = { lat: 30.2741, lon: 120.1551 };

var SS_GEO_ASKED = 'themePageGeoAsked';
var SS_GEO_COORDS = 'themePageGeoCoords';

function getStoredWeatherCity() {
  try {
    const raw = localStorage.getItem(STORAGE_WEATHER_CITY);
    if (!raw) return null;
    const city = JSON.parse(raw);
    if (city && typeof city.lat === 'number' && typeof city.lon === 'number' && city.name) return city;
  } catch (e) {}
  return null;
}

function setStoredWeatherCity(city) {
  try {
    if (!city) localStorage.removeItem(STORAGE_WEATHER_CITY);
    else localStorage.setItem(STORAGE_WEATHER_CITY, JSON.stringify(city));
  } catch (e) {}
}

function getSessionStoredCoords() {
  try {
    const raw = sessionStorage.getItem(SS_GEO_COORDS);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (typeof o.lat === 'number' && typeof o.lon === 'number') return o;
  } catch (e) {}
  return null;
}

function setSessionStoredCoords(lat, lon) {
  try {
    sessionStorage.setItem(SS_GEO_COORDS, JSON.stringify({ lat: lat, lon: lon }));
  } catch (e) {}
}

function hasAskedGeolocationThisSession() {
  try {
    return sessionStorage.getItem(SS_GEO_ASKED) === '1';
  } catch (e) {
    return false;
  }
}

function markGeolocationAskedThisSession() {
  try {
    sessionStorage.setItem(SS_GEO_ASKED, '1');
  } catch (e) {}
}

function renderWeatherFromApi(data, options) {
  window.lastWeatherData = data;
  const cityLabel = (options && options.cityLabel) || '';
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const metaEl = document.getElementById('weather-meta');
  if (!tempEl || !descEl) return;
  const cur = data && data.current;
  if (!cur) {
    setWeatherError('暂无天气数据');
    return;
  }
  const t = cur.temperature_2m;
  const code = cur.weather_code;
  const rh = cur.relative_humidity_2m;
  const wind = cur.wind_speed_10m;
  tempEl.textContent = typeof t === 'number' ? Math.round(t) + '°' : '—';
  descEl.textContent = weatherCodeToZh(code);
  applyWeatherIcon(weatherCodeToIconSlug(code, cur.is_day));
  if (metaEl) {
    metaEl.innerHTML = '';
    const pieces = [];
    if (cityLabel) {
      const cityBtn = document.createElement('button');
      cityBtn.type = 'button';
      cityBtn.className = 'weather-city-trigger';
      cityBtn.textContent = cityLabel;
      cityBtn.setAttribute('aria-label', '设置天气城市');
      cityBtn.title = cityLabel;
      cityBtn.addEventListener('click', promptWeatherCity);
      pieces.push(cityBtn);
    }
    if (typeof rh === 'number') pieces.push(document.createTextNode('湿度 ' + rh + '%'));
    if (typeof wind === 'number') pieces.push(document.createTextNode('风速 ' + Math.round(wind) + ' km/h'));
    pieces.forEach(function (piece, idx) {
      if (idx > 0) metaEl.appendChild(document.createTextNode(' · '));
      metaEl.appendChild(piece);
    });
  }

  applyThemeFromWeatherData(data);
}

function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    timezone: 'auto'
  });
  return fetch('https://api.open-meteo.com/v1/forecast?' + params.toString())
    .then((r) => {
      if (!r.ok) throw new Error('weather http');
      return r.json();
    });
}

function geocodeWeatherCity(name) {
  const params = new URLSearchParams({
    name: name,
    count: '1',
    language: 'zh',
    format: 'json'
  });
  return fetch('https://geocoding-api.open-meteo.com/v1/search?' + params.toString())
    .then((r) => {
      if (!r.ok) throw new Error('geocode http');
      return r.json();
    })
    .then((data) => {
      const first = data && data.results && data.results[0];
      if (!first) throw new Error('city not found');
      const labelParts = [first.name, first.admin1, first.country].filter(Boolean);
      return {
        name: labelParts.slice(0, 2).join(' · ') || first.name,
        lat: first.latitude,
        lon: first.longitude
      };
    });
}

function promptWeatherCity() {
  const current = getStoredWeatherCity();
  const currentName = current && current.name ? current.name : '杭州';
  const q = window.prompt('天气城市', currentName);
  if (q === null) return;
  const name = q.trim();
  if (!name) {
    setStoredWeatherCity(null);
    requestWeatherUpdate(false);
    showToast('已恢复自动天气');
    return;
  }
  setWeatherLoading();
  geocodeWeatherCity(name)
    .then(function (city) {
      setStoredWeatherCity(city);
      return fetchOpenMeteo(city.lat, city.lon).then(function (data) {
        renderWeatherFromApi(data, { cityLabel: city.name });
        showToast('天气城市已更新');
      });
    })
    .catch(function () {
      setWeatherError('未找到城市');
    });
}

function requestWeatherUpdate(silent) {
  if (!document.getElementById('weather-temp')) return;

  var localApplied = false;
  var manualCity = getStoredWeatherCity();

  if (manualCity) {
    if (!silent) setWeatherLoading();
    fetchOpenMeteo(manualCity.lat, manualCity.lon)
      .then(function (data) {
        renderWeatherFromApi(data, { cityLabel: manualCity.name });
      })
      .catch(function () {
        setWeatherError('城市天气获取失败');
      });
    return;
  }

  function tryHangzhouIfNeeded() {
    return fetchOpenMeteo(HANGZHOU_COORDS.lat, HANGZHOU_COORDS.lon)
      .then(function (data) {
        if (!localApplied) renderWeatherFromApi(data, { cityLabel: '杭州' });
      });
  }

  if (!silent) setWeatherLoading();

  tryHangzhouIfNeeded().catch(function () {
    if (!localApplied) setWeatherError('天气获取失败');
  });

  function applyLocalForecast(lat, lon) {
    return fetchOpenMeteo(lat, lon)
      .then(function (data) {
        localApplied = true;
        renderWeatherFromApi(data, { cityLabel: '本地' });
      });
  }

  function onLocalForecastFail() {
    return tryHangzhouIfNeeded().catch(function () {
      if (!localApplied) setWeatherError('天气获取失败');
    });
  }

  var cached = getSessionStoredCoords();
  if (cached) {
    applyLocalForecast(cached.lat, cached.lon).catch(onLocalForecastFail);
    return;
  }

  if (!navigator.geolocation) return;

  if (hasAskedGeolocationThisSession()) return;

  /** 本会话内首次进入页面时调用一次，由浏览器弹出定位授权；拒绝或成功后不再重复请求 */
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      markGeolocationAskedThisSession();
      setSessionStoredCoords(lat, lon);
      applyLocalForecast(lat, lon).catch(onLocalForecastFail);
    },
    function () {
      markGeolocationAskedThisSession();
    },
    { enableHighAccuracy: false, timeout: 14000, maximumAge: 600000 }
  );
}

function setupWeather() {
  if (!document.getElementById('weather-temp')) return;
  requestWeatherUpdate(false);
}

const btnNewShortcut = document.getElementById('btn-new-shortcut');
if (btnNewShortcut) btnNewShortcut.addEventListener('click', openAddShortcutPanel);

const btnSortShortcuts = document.getElementById('btn-sort-shortcuts');
if (btnSortShortcuts) {
  btnSortShortcuts.addEventListener('click', function() {
    shortcutsSortMode = shortcutsSortMode === 'default' ? 'frequency' : 'default';
    localStorage.setItem('shortcutsSortMode', shortcutsSortMode);
    this.classList.toggle('active', shortcutsSortMode === 'frequency');
    this.title = shortcutsSortMode === 'frequency' ? '按默认顺序排序' : '按使用频率排序';
    renderLaunchGrid();
  });
  // 初始状态
  btnSortShortcuts.classList.toggle('active', shortcutsSortMode === 'frequency');
  btnSortShortcuts.title = shortcutsSortMode === 'frequency' ? '按默认顺序排序' : '按使用频率排序';
}

// 导出快捷方式数据
const btnExportShortcuts = document.getElementById('btn-export-shortcuts');
if (btnExportShortcuts) {
  btnExportShortcuts.addEventListener('click', function() {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      shortcuts: shortcuts,
      usageStats: window.UsageAnalytics ? window.UsageAnalytics.stats : {}
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortcuts-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('数据已导出');
  });
}

// 导入快捷方式数据
const btnImportShortcuts = document.getElementById('btn-import-shortcuts');
const importFileInput = document.getElementById('import-shortcuts-file');
if (btnImportShortcuts && importFileInput) {
  btnImportShortcuts.addEventListener('click', function() {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const importData = JSON.parse(event.target.result);

        // 验证数据格式
        if (!importData.shortcuts || !Array.isArray(importData.shortcuts)) {
          throw new Error('无效的数据格式');
        }

        // 询问用户是合并还是替换
        const shouldMerge = confirm('导入模式：\n\n点击「确定」合并数据（保留现有快捷方式）\n点击「取消」替换数据（清空现有快捷方式）');

        if (shouldMerge) {
          // 合并模式：添加新的快捷方式，跳过重复的ID
          const existingIds = new Set(shortcuts.map(s => s.id));
          const newShortcuts = importData.shortcuts.filter(s => !existingIds.has(s.id));
          shortcuts = shortcuts.concat(newShortcuts);
          showToast(`已导入 ${newShortcuts.length} 个新快捷方式`);
        } else {
          // 替换模式：完全替换
          shortcuts = importData.shortcuts;
          showToast(`已导入 ${shortcuts.length} 个快捷方式`);
        }

        // 导入使用统计数据（如果存在）
        if (importData.usageStats && window.UsageAnalytics) {
          window.UsageAnalytics.stats = importData.usageStats;
          localStorage.setItem(window.UsageAnalytics.STORAGE_KEY, JSON.stringify(importData.usageStats));
        }

        persistShortcuts();
        renderLaunchGrid();
      } catch (err) {
        alert('导入失败：' + err.message);
      }

      // 清空文件输入
      importFileInput.value = '';
    };

    reader.readAsText(file);
  });
}

(function setupShortcutContextMenu() {
  const menu = document.getElementById('shortcut-ctx-menu');
  if (!menu) return;
  menu.addEventListener('click', function (e) {
    e.stopPropagation();
    const t = e.target.closest('[data-ctx-action]');
    if (!t) return;
    const action = t.getAttribute('data-ctx-action');
    const id = contextMenuShortcutId;
    hideShortcutContextMenu();
    if (action === 'edit' && id) openEditShortcutPanel(id);
    if (action === 'delete' && id) {
      const s = shortcuts.find((x) => x.id === id);
      if (!s) return;
      const name = (s.title || '').trim() || '此项';
      if (!confirm('确定删除「' + name + '」？')) return;
      shortcuts = shortcuts.filter((x) => x.id !== id);
      persistShortcuts();
      renderLaunchGrid();
    }
  });
  menu.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
})();

document.addEventListener('click', hideShortcutContextMenu);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') hideShortcutContextMenu();
});

document.getElementById('btn-close-edit').addEventListener('click', saveShortcutSheetAndClose);
document.getElementById('edit-backdrop').addEventListener('click', saveShortcutSheetAndClose);
setupShortcutForms();
renderSiteContent();
setupSiteNavigation();
setupPrivacyToggle();
preloadAboutIllustrations();

// Initialize clock
updateClock();
setInterval(updateClock, 30000);
setupWeather();
setInterval(function () {
  requestWeatherUpdate(true);
}, 30 * 60 * 1000);

// Load saved theme + shortcuts（线上：服务端 KV；本地或无 KV：default-shortcuts.json + localStorage）
(async function loadStoredShortcutsAndTheme() {
  const [cfg, fromFile, server, content] = await Promise.all([
    fetchIcon8SlugConfig(),
    fetchDefaultShortcutsFromBookmarksJson(),
    fetchShortcutsFromServer(),
    fetchSiteContent()
  ]);
  icon8SlugConfig = cfg;
  applySiteContent(content);
  renderSiteContent();
  const seedDefaults = fromFile || SHORTCUTS_FALLBACK;

  shortcutsServerPersist = server.persist === true;

  let list = null;
  if (shortcutsServerPersist && Array.isArray(server.list)) {
    list = server.list;
  } else {
    try {
      const raw = localStorage.getItem(STORAGE_SHORTCUTS);
      if (raw) list = JSON.parse(raw);
    } catch (e) {}
    if (!Array.isArray(list)) {
      list = seedDefaults.map((x) => Object.assign({}, x));
      try {
        localStorage.setItem(STORAGE_SHORTCUTS, JSON.stringify(list));
      } catch (e) {}
    }
  }
  shortcuts = list.map((item) => ({
    id: item.id || shortcutUid(),
    title: item.title || '',
    url: item.url || '',
    iconEmoji: item.iconEmoji || '·',
    iconDataUrl: item.iconDataUrl || '',
    iconUrl: item.iconUrl || ''
  }));
  for (let si = 0; si < shortcuts.length; si++) normalizeShortcutRemoteIcon(shortcuts[si]);
  try {
    localStorage.setItem(STORAGE_SHORTCUTS, JSON.stringify(shortcuts));
  } catch (e) {}
  renderLaunchGrid();
  if (isThemeManualLocked()) {
    let savedMode = 'day';
    try {
      savedMode = localStorage.getItem(STORAGE_MODE) || 'day';
    } catch (e) {}
    const mode = modes.includes(savedMode) ? savedMode : 'day';
    setMode(mode, { silent: true });
  }
})();

// ═══════════════════════════════════════════
// Dev Log Module Integration
// ═══════════════════════════════════════════

// Initialize dev log when DOM is ready
if (typeof initDevLog === 'function') {
  initDevLog();
}

// Dev log filter buttons
const devlogFilters = document.getElementById('devlog-filters');
if (devlogFilters) {
  devlogFilters.addEventListener('click', function(e) {
    const btn = e.target.closest('.devlog-filter-btn');
    if (!btn) return;

    // Update active state
    devlogFilters.querySelectorAll('.devlog-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter timeline
    const filter = btn.dataset.filter;
    if (typeof filterDevLog === 'function') {
      filterDevLog(filter);
    }
  });
}
