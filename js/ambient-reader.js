// chshlab/js/ambient-reader.js
// Generative ambient reading music — Web Audio API
// Inspired by Satie's Gymnopoedies: slow modal piano-like tones.
// Muted by default. User toggles via floating button.

let ctx = null;
let playing = false;
let schedulerId = null;
let delayNode = null;
let feedbackNode = null;
let masterGain = null;

// D Dorian scale across two octaves (D3 and D4)
const SCALE_D4 = [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
const SCALE_D3 = SCALE_D4.map(f => f / 2); // One octave lower for bass notes

const NOTE_INTERVAL_MIN = 3000;
const NOTE_INTERVAL_MAX = 5000;
const MASTER_VOLUME = 0.045;

function initCtx() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  // Master gain — very soft
  masterGain = ctx.createGain();
  masterGain.gain.value = MASTER_VOLUME;
  masterGain.connect(ctx.destination);

  // Delay / echo for depth
  delayNode = ctx.createDelay(1.0);
  delayNode.delayTime.value = 0.4;

  feedbackNode = ctx.createGain();
  feedbackNode.gain.value = 0.25;

  const delayFilter = ctx.createBiquadFilter();
  delayFilter.type = 'lowpass';
  delayFilter.frequency.value = 1200;

  // Delay feedback loop: delay -> filter -> feedback -> delay
  delayNode.connect(delayFilter);
  delayFilter.connect(feedbackNode);
  feedbackNode.connect(delayNode);

  // Delay output -> master
  delayNode.connect(masterGain);
}

function playNote(freq, duration, velocity) {
  if (!ctx || !playing) return;

  const now = ctx.currentTime;

  // Primary tone: sine wave (piano fundamental)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = freq;

  // Subtle harmonic layer: triangle one octave up, much quieter
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = freq * 2;

  // Gain envelopes
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(velocity, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(velocity * 0.15, now + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);

  // Connect oscillators -> gains -> master + delay send
  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(masterGain);
  gain2.connect(masterGain);

  // Send dry signal to delay for echo
  gain1.connect(delayNode);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration + 0.1);
  osc2.stop(now + duration + 0.1);
}

function randomInterval() {
  return NOTE_INTERVAL_MIN + Math.random() * (NOTE_INTERVAL_MAX - NOTE_INTERVAL_MIN);
}

function pickNote() {
  // 20% chance of a bass note (D3 octave)
  const useBass = Math.random() < 0.2;
  const scale = useBass ? SCALE_D3 : SCALE_D4;
  return scale[Math.floor(Math.random() * scale.length)];
}

function scheduleNext() {
  if (!playing) return;

  const freq = pickNote();
  const duration = 2.0 + Math.random() * 2.0; // 2-4 seconds decay
  const velocity = 0.03 + Math.random() * 0.03; // 0.03-0.06

  playNote(freq, duration, velocity);

  schedulerId = setTimeout(scheduleNext, randomInterval());
}

function start() {
  if (playing) return;
  initCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  playing = true;
  scheduleNext();
}

function stop() {
  playing = false;
  if (schedulerId !== null) {
    clearTimeout(schedulerId);
    schedulerId = null;
  }
}

function toggle() {
  if (playing) {
    stop();
  } else {
    start();
  }
  return playing;
}

export { toggle, playing };
