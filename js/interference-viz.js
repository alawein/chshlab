// chshlab/js/interference-viz.js
// WebGL fragment shader rendering an animated two-slit interference pattern.

export function initInterference() {
  const canvas = document.getElementById('interferenceCanvas');
  if (!canvas) return;

  const section = canvas.closest('.interference-section');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    // Graceful fallback: show CSS gradient animation
    if (section) section.classList.add('no-webgl');
    return;
  }

  // ── Shader sources ──
  const vsSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  const fsSource = `
    precision mediump float;
    uniform float u_time;
    uniform float u_scroll;
    uniform vec2 u_resolution;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;

      // Two source positions
      vec2 s1 = vec2(0.35, 0.0);
      vec2 s2 = vec2(0.65, 0.0);

      float d1 = distance(uv, s1);
      float d2 = distance(uv, s2);

      // Phase difference creates interference
      float phase = (d1 - d2) * (30.0 + u_scroll * 20.0);
      float wave = cos(phase + u_time * 0.5);

      // Intensity with envelope
      float envelope = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
      float intensity = (wave * 0.5 + 0.5) * envelope;

      // Color palette matching the site theme
      vec3 blue = vec3(0.376, 0.647, 0.98);     // #60a5fa
      vec3 crimson = vec3(0.973, 0.443, 0.443);  // #f87171
      vec3 gold = vec3(0.788, 0.663, 0.302);     // #c9a94d
      vec3 bg = vec3(0.086, 0.098, 0.129);       // #161921

      vec3 color = mix(bg, mix(blue, gold, intensity), intensity * 0.7);
      color = mix(color, crimson * 0.3, (1.0 - intensity) * 0.15 * envelope);

      // Subtle noise grain
      float noise = fract(sin(dot(uv * u_time, vec2(12.9898, 78.233))) * 43758.5453);
      color += (noise - 0.5) * 0.02;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // ── Compile shader helper ──
  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

  if (!vertexShader || !fragmentShader) {
    if (section) section.classList.add('no-webgl');
    return;
  }

  // ── Link program ──
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(program));
    if (section) section.classList.add('no-webgl');
    return;
  }

  gl.useProgram(program);

  // ── Fullscreen quad ──
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ]), gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // ── Uniforms ──
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uScroll = gl.getUniformLocation(program, 'u_scroll');
  const uResolution = gl.getUniformLocation(program, 'u_resolution');

  // ── Canvas sizing ──
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  resize();

  // ── Scroll tracking ──
  let scrollFactor = 0;

  function updateScroll() {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when section top is at viewport bottom, 1 when section bottom is at viewport top
    const progress = 1 - (rect.bottom / (vh + rect.height));
    scrollFactor = Math.max(0, Math.min(1, progress));
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ── Reduced motion ──
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = prefersReducedMotion.matches;

  prefersReducedMotion.addEventListener('change', (e) => {
    paused = e.matches;
    if (!paused) requestAnimationFrame(render);
  });

  // ── Render loop ──
  let startTime = performance.now();

  function render(now) {
    const elapsed = (now - startTime) / 1000;

    resize();
    gl.uniform1f(uTime, paused ? 0 : elapsed);
    gl.uniform1f(uScroll, scrollFactor);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (paused) {
      // Render one static frame, then stop
      return;
    }
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
