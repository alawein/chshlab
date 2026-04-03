/**
 * starfield.js — cinematic particle starfield for #starfield canvas
 */

const initStarfield = () => {
  const canvas = document.querySelector('#starfield');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 600;
  const COUNT = isMobile ? 40 : 120;

  const TINTS = [
    [201, 169, 77],
    [100, 140, 230],
    [255, 255, 255],
  ];

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const makeParticle = (w, h) => {
    const [r, g, b] = pick(TINTS);
    const alpha = rand(0.08, 0.25);
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: rand(0.3, 1.2),
      vx: rand(-0.04, 0.04),
      vy: rand(-0.04, 0.04),
      color: `rgba(${r},${g},${b},${alpha})`,
    };
  };

  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: COUNT }, () =>
    makeParticle(canvas.width, canvas.height)
  );

  // ── SHOOTING STARS ──
  const shootingStars = [];
  const SHOOTING_STAR_CHANCE = 0.002; // per frame chance of spawning
  const SHOOTING_STAR_MAX = 2;

  const spawnShootingStar = (w, h) => {
    const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.2; // roughly 30-60 degrees
    const speed = 3 + Math.random() * 4;
    const [r, g, b] = pick(TINTS);
    return {
      x: Math.random() * w * 0.8,
      y: Math.random() * h * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.01,
      length: 20 + Math.random() * 30,
      color: [r, g, b],
    };
  };

  let lastScrollY = window.scrollY;
  let scrollDelta = 0;
  let scrollDecay = 0;
  const DECAY_FRAMES = 60;

  const drawVignette = (w, h) => {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.sqrt(cx * cx + cy * cy);
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.25, cx, cy, radius);
    grad.addColorStop(0, 'rgba(14,15,20,0)');
    grad.addColorStop(1, 'rgba(14,15,20,0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  const tick = () => {
    if (document.visibilityState === 'hidden') {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    const currentScrollY = window.scrollY;
    const frameDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (Math.abs(frameDelta) > 0.5) {
      scrollDelta = frameDelta;
      scrollDecay = DECAY_FRAMES;
    }

    const scrollBoost = scrollDecay > 0 ? (scrollDelta * 0.02 * (scrollDecay / DECAY_FRAMES)) : 0;
    if (scrollDecay > 0) scrollDecay--;

    const heroH = window.innerHeight;
    const opacity = currentScrollY < heroH
      ? 1.0
      : Math.max(0.3, 1.0 - 0.7 * ((currentScrollY - heroH) / heroH));
    canvas.style.opacity = opacity;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy + scrollBoost;

      if (p.x < -2) p.x = w + 1;
      else if (p.x > w + 2) p.x = -1;
      if (p.y < -2) p.y = h + 1;
      else if (p.y > h + 2) p.y = -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // ── SHOOTING STARS UPDATE + DRAW ──
    if (shootingStars.length < SHOOTING_STAR_MAX && Math.random() < SHOOTING_STAR_CHANCE) {
      shootingStars.push(spawnShootingStar(w, h));
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      if (s.life <= 0 || s.x > w + 50 || s.y > h + 50) {
        shootingStars.splice(i, 1);
        continue;
      }

      const tailX = s.x - (s.vx / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length * s.life;
      const tailY = s.y - (s.vy / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length * s.life;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0)`);
      grad.addColorStop(1, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.life * 0.6})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    drawVignette(w, h);
    rafId = requestAnimationFrame(tick);
  };

  let rafId = requestAnimationFrame(tick);
};

export { initStarfield };
