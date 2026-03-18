// chshlab/js/fig-bell-test.js
// Animated Bell test schematic — particles fly from source to detectors
// Beat 2 visualization. Canvas2D with requestAnimationFrame + object pooling.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initBellTest() {
  const canvas = document.getElementById('bellTestCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const controlsWrap = document.getElementById('bellTestControls');

  // State
  let running = !prefersReducedMotion;
  let setting = { alice: 0, bob: 0 }; // 0 or 1
  const particles = [];
  const MAX_PARTICLES = 50;
  let tally = { n: [0,0,0,0], sum: [0,0,0,0] }; // 4 setting pairs
  let frameId = null;

  // Measurement angles (radians)
  const angles = { a: 0, ap: Math.PI/2, b: Math.PI/4, bp: 3*Math.PI/4 };

  // Quantum correlation
  function eQ(thetaA, thetaB) { return -Math.cos(thetaA - thetaB); }

  // Layout
  let W, H, dpr;
  const ro = new ResizeObserver(() => {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = 400;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  });
  ro.observe(canvas);

  // Controls: setting toggle buttons
  if (controlsWrap) {
    const pairs = [
      { label: 'a, b', a: 0, b: 0 },
      { label: 'a, b\u2032', a: 0, b: 1 },
      { label: 'a\u2032, b', a: 1, b: 0 },
      { label: 'a\u2032, b\u2032', a: 1, b: 1 },
    ];
    pairs.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'belltest-setting-btn' + (i === 0 ? ' belltest-setting-btn--active' : '');
      btn.textContent = p.label;
      btn.addEventListener('click', () => {
        setting.alice = p.a;
        setting.bob = p.b;
        controlsWrap.querySelectorAll('button').forEach(b => b.classList.remove('belltest-setting-btn--active'));
        btn.classList.add('belltest-setting-btn--active');
      });
      controlsWrap.appendChild(btn);
    });

    // Pause/resume
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'belltest-setting-btn';
    pauseBtn.textContent = 'Pause';
    pauseBtn.addEventListener('click', () => {
      running = !running;
      pauseBtn.textContent = running ? 'Pause' : 'Resume';
    });
    controlsWrap.appendChild(pauseBtn);
  }

  // Emit a particle pair
  function emit() {
    if (particles.length >= MAX_PARTICLES) return;

    const lambda = Math.random() * Math.PI * 2;
    const thetaA = setting.alice === 0 ? angles.a : angles.ap;
    const thetaB = setting.bob === 0 ? angles.b : angles.bp;

    // Quantum-like probabilistic outcomes
    const corrAB = eQ(thetaA, thetaB);
    const outcomeA = Math.random() < 0.5 ? 1 : -1;
    const pSame = (1 - corrAB) / 2; // P(A=B)
    const outcomeB = Math.random() < pSame ? outcomeA : -outcomeA;

    particles.push({
      x: W / 2, y: H / 2,
      aliceX: W * 0.12, bobX: W * 0.88,
      targetY: H / 2,
      progress: 0,
      outcomeA, outcomeB,
      settingIdx: setting.alice * 2 + setting.bob,
      phase: 'flying', // flying -> arrived -> fade
      alpha: 1,
    });
  }

  // Update tally
  function recordOutcome(p) {
    const idx = p.settingIdx;
    tally.n[idx]++;
    tally.sum[idx] += p.outcomeA * p.outcomeB;
  }

  function computeS() {
    const E = tally.n.map((n, i) => n > 0 ? tally.sum[i] / n : 0);
    return Math.abs(E[0] - E[1] + E[2] + E[3]);
  }

  // Animation loop
  let emitTimer = 0;
  function loop() {
    frameId = requestAnimationFrame(loop);
    if (!W) return;

    ctx.clearRect(0, 0, W, H);

    // Draw source
    ctx.fillStyle = '#C9A94D';
    ctx.beginPath();
    ctx.arc(W/2, H/2, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5C5A55';
    ctx.fillText('Source', W/2, H/2 + 24);

    // Draw detectors
    const detY = H/2;
    // Alice
    ctx.fillStyle = '#4FA3D4';
    ctx.fillRect(W*0.06, detY - 20, 40, 40);
    ctx.fillStyle = '#EAE6DA';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('Alice', W*0.06 + 20, detY - 28);
    const aLabel = setting.alice === 0 ? 'a' : 'a\u2032';
    ctx.fillStyle = '#4FA3D4';
    ctx.fillText(aLabel, W*0.06 + 20, detY + 36);

    // Bob
    ctx.fillStyle = '#4FA3D4';
    ctx.fillRect(W*0.88 - 20, detY - 20, 40, 40);
    ctx.fillStyle = '#EAE6DA';
    ctx.fillText('Bob', W*0.88, detY - 28);
    const bLabel = setting.bob === 0 ? 'b' : 'b\u2032';
    ctx.fillStyle = '#4FA3D4';
    ctx.fillText(bLabel, W*0.88, detY + 36);

    // Emit particles
    if (running) {
      emitTimer++;
      if (emitTimer % 12 === 0) emit();
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.phase === 'flying') {
        p.progress += 0.02;
        if (p.progress >= 1) {
          p.phase = 'arrived';
          p.progress = 1;
          recordOutcome(p);
        }
      } else if (p.phase === 'arrived') {
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
      }

      // Draw particle going to Alice (left)
      const aliceX = W/2 + (p.aliceX - W/2) * p.progress;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.outcomeA === 1 ? '#6B8F71' : '#C94040';
      ctx.beginPath();
      ctx.arc(aliceX, detY, 4, 0, Math.PI*2);
      ctx.fill();

      // Draw particle going to Bob (right)
      const bobX = W/2 + (p.bobX - W/2) * p.progress;
      ctx.fillStyle = p.outcomeB === 1 ? '#6B8F71' : '#C94040';
      ctx.beginPath();
      ctx.arc(bobX, detY, 4, 0, Math.PI*2);
      ctx.fill();

      // Show outcome label when arrived
      if (p.phase === 'arrived') {
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = p.outcomeA === 1 ? '#6B8F71' : '#C94040';
        ctx.fillText(p.outcomeA === 1 ? '+1' : '\u22121', aliceX, detY - 12);
        ctx.fillStyle = p.outcomeB === 1 ? '#6B8F71' : '#C94040';
        ctx.fillText(p.outcomeB === 1 ? '+1' : '\u22121', bobX, detY - 12);
      }
      ctx.globalAlpha = 1;
    }

    // Draw tally
    ctx.fillStyle = '#9A9485';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    const tallyY = H - 60;
    const labels = ['E(a,b)', 'E(a,b\u2032)', 'E(a\u2032,b)', 'E(a\u2032,b\u2032)'];
    const totalN = tally.n.reduce((a,b) => a+b, 0);

    labels.forEach((l, i) => {
      const x = W * 0.15 + i * (W * 0.18);
      const E = tally.n[i] > 0 ? (tally.sum[i] / tally.n[i]).toFixed(3) : '\u2014';
      ctx.fillStyle = '#5C5A55';
      ctx.fillText(l, x, tallyY);
      ctx.fillStyle = '#EAE6DA';
      ctx.fillText(E, x, tallyY + 16);
      ctx.fillStyle = '#5C5A55';
      ctx.fillText('n=' + tally.n[i], x, tallyY + 30);
    });

    // S value
    if (totalN > 10) {
      const S = computeS();
      ctx.fillStyle = '#C9A94D';
      ctx.font = "bold 16px 'JetBrains Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillText('S = ' + S.toFixed(3), W * 0.92, tallyY + 16);
    }
  }

  // Visibility-based pause
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!frameId) loop();
      } else {
        if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
      }
    });
  }, { threshold: 0.1 });
  io.observe(canvas);

  loop();
}
