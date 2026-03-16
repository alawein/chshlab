// chshlab/js/sonification.js
// Lightweight Web Audio API tone system for CHSH S value changes
// Muted by default. AudioContext created only on first unmute.

let audioCtx = null;
let muted = true;

function getCtx() {
  if (!audioCtx && typeof AudioContext !== 'undefined') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq, duration, gain = 0.04) {
  const ctx = getCtx();
  if (!ctx || muted) return;

  const osc = ctx.createOscillator();
  const gn = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gn.gain.value = gain;
  gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
  osc.connect(gn);
  gn.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration / 1000);
}

function playDualTone(f1, f2, duration) {
  playTone(f1, duration, 0.03);
  playTone(f2, duration, 0.03);
}

// Map CHSH S value to audio cue
function sonifyS(s) {
  if (muted) return;
  if (s < 2) {
    playTone(220, 80, 0.04);          // low soft
  } else if (Math.abs(s - 2) < 0.05) {
    playTone(440, 40, 0.03);          // neutral click
  } else if (s > 2 * Math.SQRT2) {
    playTone(660, 100, 0.04);         // rising
  }
  if (s > 3.9) {
    playDualTone(440, 880, 150);      // two-tone alert
  }
}

export function initSonification() {
  // Listen for state changes
  let lastS = null;
  document.addEventListener('chshlab:state', (e) => {
    const s = e.detail.s;
    if (s === undefined) return;
    // Only sonify when value crosses thresholds
    if (lastS === null || Math.abs(s - lastS) > 0.1) {
      sonifyS(s);
      lastS = s;
    }
  });

  // Create toggle button in each demo panel header
  const panels = document.querySelectorAll('.demo-controls');
  if (!panels.length) return;

  // Single toggle in the demos section header
  const demosSection = document.getElementById('demos');
  if (!demosSection) return;
  const heading = demosSection.querySelector('.section-heading');
  if (!heading) return;

  const btn = document.createElement('button');
  btn.className = 'sonification-toggle';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', 'Toggle sound effects');
  btn.title = 'Toggle sound';

  // Speaker icon (SVG)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07');
  svg.appendChild(path);
  btn.appendChild(svg);

  // Muted line
  const muteLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  muteLine.setAttribute('x1', '2');
  muteLine.setAttribute('y1', '2');
  muteLine.setAttribute('x2', '22');
  muteLine.setAttribute('y2', '22');
  muteLine.setAttribute('stroke', 'currentColor');
  muteLine.setAttribute('stroke-width', '2');
  muteLine.classList.add('mute-line');
  svg.appendChild(muteLine);

  heading.style.display = 'flex';
  heading.style.alignItems = 'center';
  heading.style.gap = '12px';
  heading.appendChild(btn);

  btn.addEventListener('click', () => {
    muted = !muted;
    btn.setAttribute('aria-pressed', String(!muted));
    btn.classList.toggle('sonification-toggle--active', !muted);
    muteLine.style.display = muted ? '' : 'none';

    // Resume AudioContext if needed (autoplay policy)
    if (!muted) {
      const ctx = getCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    }
  });
}
