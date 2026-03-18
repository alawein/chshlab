# CHSH Lab Narrative Upgrade Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform CHSH Lab from a card-based section layout into an 8-beat narrative scroll with GPU-accelerated interactive figures, a distill.pub-style paper page, SEO, and hyperlinked references.

**Architecture:** Full rewrite of index.html into narrative prose with interactive figures embedded at each beat. Separate paper.html for formal article. Same design system (tokens.css). No build step — vanilla HTML/CSS/ES modules.

**Tech Stack:** Vanilla HTML5 + CSS3 + ES modules · KaTeX · GSAP + ScrollTrigger · Canvas2D · Google Fonts

**Spec:** `docs/superpowers/specs/2026-03-16-narrative-upgrade-design.md`

---

## Chunk 1: Foundation — HTML Structure & CSS

### Task 1: Remove deprecated files

**Files:**
- Delete: `js/story-mode.js`
- Delete: `js/provenance-data.js`
- Delete: `js/redpen.js`
- Delete: `js/annotations.js`
- Delete: `css/redpen.css`

- [ ] **Step 1:** Delete the 5 files listed above
- [ ] **Step 2:** Remove `<link rel="stylesheet" href="css/redpen.css" />` from `index.html:47`
- [ ] **Step 3:** Commit: `chore: remove deprecated modules (story-mode, provenance, redpen, annotations)`

---

### Task 2: Rewrite index.html — narrative structure with prose

**Files:**
- Rewrite: `index.html`

This is the largest single task. The full HTML content follows. All interactive figure containers are placeholder `<div>` elements with IDs — the JS modules populate them later.

- [ ] **Step 1:** Replace the entire `<body>` content of `index.html` with the 8-beat narrative structure below. Keep `<head>` intact for now (SEO update is Task 14).

The new `<body>`:

```html
<body>
  <canvas id="starfield" aria-hidden="true"></canvas>
  <div class="atmosphere-layer" aria-hidden="true"></div>

  <!-- NAV -->
  <nav class="nav" aria-label="Site navigation">
    <a class="nav__logo" href="#hook">CHSH <span>Lab</span></a>
    <ul class="nav__links" role="list">
      <li><a href="#claim">The Claim</a></li>
      <li><a href="#loophole">The Loophole</a></li>
      <li><a href="#postselection">Post-Selection</a></li>
      <li><a href="#proof">The Proof</a></li>
      <li><a href="#standards">Standards</a></li>
      <li><a href="paper.html">Paper</a></li>
    </ul>
  </nav>

  <!-- BEAT 1: THE HOOK -->
  <section id="hook" class="beat beat--hook">
    <div class="container">
      <p class="beat__eyebrow reveal">A Reproducible Rebuttal</p>
      <h1 class="beat__title reveal">Bell Violations Without Entanglement?</h1>
      <p class="beat__subtitle reveal">
        A 2025 paper in <em>Science Advances</em> claimed to violate Bell&rsquo;s inequality
        without entanglement. The result made waves. There&rsquo;s just one problem.
      </p>
      <p class="beat__byline reveal">
        <a href="https://www.meshal.ai" target="_blank" rel="noopener noreferrer">Meshal Alawein</a>
        &middot; <a href="https://www.meshal.ai" target="_blank" rel="noopener noreferrer">meshal.ai</a>
        &middot; UC Berkeley
      </p>
    </div>
  </section>

  <hr class="section-rule">

  <!-- BEAT 2: WHAT THEY DID -->
  <section id="claim" class="beat beat--claim">
    <div class="container">
      <p class="section-label reveal">The Claim</p>
      <h2 class="section-heading reveal">What Wang et al. Actually Did</h2>

      <div class="beat__prose reveal">
        <p>
          In early 2025,
          <a href="https://doi.org/10.1126/sciadv.ads0058" target="_blank" rel="noopener noreferrer">Wang et al.</a>
          published a striking result: a measured CHSH value of
          <strong>S = 2.275 &plusmn; 0.057</strong> from a multiphoton interference experiment.
          They claimed this constituted a Bell inequality violation &mdash; evidence that their optical
          system exhibited quantum nonlocality.
        </p>
        <p>
          The experiment itself was technically impressive. Multiphoton interference at these scales
          is genuinely difficult, and the optical engineering deserves admiration. But admiration of
          the apparatus should not cloud judgment about what the measurements actually establish.
        </p>
        <p>
          A Bell test works like this: a source produces correlated particle pairs. Alice and Bob
          each choose between two measurement settings and record &plusmn;1 outcomes. Four correlations
          are combined into the CHSH parameter S. If S &gt; 2, local hidden variables can&rsquo;t explain
          the result &mdash; <em>provided every pair is detected</em>.
        </p>
      </div>

      <!-- Interactive: Animated Bell Test -->
      <div class="figure-wrap reveal" aria-label="Interactive Bell test schematic showing particle pairs emitted from a source to two detectors">
        <canvas id="bellTestCanvas" width="800" height="400"></canvas>
        <div class="figure-controls" id="bellTestControls"></div>
        <div class="demo-readouts" id="bellTestReadouts" aria-live="polite">
          <div class="demo-readout">
            <span class="demo-readout__label">CHSH S</span>
            <span class="readout-value" id="readoutBellS">&mdash;</span>
          </div>
        </div>
        <p class="figure-caption">
          <span class="figure-label">Interactive</span>
          A Bell test in action. Particle pairs fly from the source to Alice and Bob&rsquo;s detectors.
          Select measurement settings and watch the correlation tally build.
        </p>
      </div>
    </div>
  </section>

  <hr class="section-rule">

  <!-- BEAT 3: THE NUMBER THAT MATTERS -->
  <section id="efficiency" class="beat beat--efficiency">
    <div class="container">
      <p class="section-label reveal">The Number That Matters</p>
      <h2 class="section-heading reveal">One in a Quintillion</h2>

      <div class="beat__prose reveal">
        <p>
          Wang et al.&rsquo;s detection efficiency was approximately
          <strong>10<sup>&minus;18</sup></strong>. That&rsquo;s one event kept for every
          quintillion produced. To put it another way: if every human on Earth ran the experiment
          once per second, you&rsquo;d wait about forty years for a single detected pair.
        </p>
        <p>
          Why does this matter? The CHSH bound S &le; 2 holds for local hidden variable theories &mdash;
          but only when <em>all</em> particle pairs are detected. Three numbers define the landscape:
        </p>
      </div>

      <!-- Interactive: Three Regions Gauge -->
      <div class="figure-wrap reveal" id="gaugeWrap" aria-label="CHSH S value gauge showing classical, quantum, and artifact regions">
        <canvas id="gaugeCanvas" width="800" height="160"></canvas>
        <p class="figure-caption">
          <span class="figure-label">The S Landscape</span>
          Classical models stay below 2. Quantum mechanics reaches 2&radic;2.
          Post-selection artifacts can push all the way to 4.
          Wang et al. reported S = 2.275 &mdash; which zone does it really belong in?
        </p>
      </div>

      <div class="bounds-row reveal" role="list">
        <div class="badge badge--amber" role="listitem">
          <span class="badge-label">Classical LHV</span>
          <span class="badge-value">S &le; 2</span>
        </div>
        <div class="badge badge--blue" role="listitem">
          <span class="badge-label">Quantum Tsirelson</span>
          <span class="badge-value">S &le; 2&radic;2 &approx; 2.828</span>
        </div>
        <div class="badge badge--crimson" role="listitem">
          <span class="badge-label">Post-Selection Artifact</span>
          <span class="badge-value">S &rarr; 4</span>
        </div>
      </div>
    </div>
  </section>

  <hr class="section-rule">

  <!-- BEAT 4: THE DETECTION LOOPHOLE -->
  <section id="loophole" class="beat beat--loophole">
    <div class="container">
      <p class="section-label reveal">The Detection Loophole</p>
      <h2 class="section-heading reveal">Can Classical Models Fake Bell Violations?</h2>

      <div class="beat__prose reveal">
        <p>
          The answer, as
          <a href="https://doi.org/10.1103/PhysRevD.2.1418" target="_blank" rel="noopener noreferrer">Pearle (1970)</a>
          and
          <a href="https://doi.org/10.1103/PhysRevA.47.R747" target="_blank" rel="noopener noreferrer">Eberhard (1993)</a>
          showed decades ago, is yes &mdash; if detection efficiency is low enough. When detectors
          miss particles, the surviving sample is no longer representative. A classical model can
          exploit these gaps to mimic quantum correlations.
        </p>
        <p>
          The critical threshold is:
        </p>
      </div>

      <div class="math-block reveal">
        <p class="math-block__label">Detection Loophole Threshold</p>
        <span class="math-display" data-latex="\eta_c = \frac{2}{1+\sqrt{2}} \approx 82.8\%"></span>
      </div>

      <div class="beat__prose reveal">
        <p>
          Below this efficiency, the maximum CHSH value a classical model can achieve is not 2 &mdash;
          it&rsquo;s <strong>4/&eta; &minus; 2</strong>. At Wang et al.&rsquo;s efficiency of ~10<sup>&minus;18</sup>,
          that classical ceiling is astronomically high. Drag the slider below to see for yourself.
        </p>
      </div>

      <!-- Theorem 1 inline -->
      <article class="theorem-card reveal">
        <header class="theorem-header">
          <span class="theorem-card__number">Theorem 1</span>
          <h3 class="theorem-card__title">Classical CHSH Bound</h3>
        </header>
        <p class="theorem-card__statement">
          For any local hidden variable theory satisfying Locality, Realism, and Freedom:
        </p>
        <div class="theorem-math">
          <span class="math-display" data-latex="S \leq 2"></span>
        </div>
        <details>
          <summary>View proof sketch</summary>
          <div class="theorem-card__proof">
            <p class="proof-body">
              Define X(&lambda;) = A(a,&lambda;)[B(b,&lambda;) &minus; B(b&prime;,&lambda;)] + A(a&prime;,&lambda;)[B(b,&lambda;) + B(b&prime;,&lambda;)].
              Since B outcomes are &plusmn;1, either [B(b) &minus; B(b&prime;)] = 0
              and [B(b) + B(b&prime;)] = &plusmn;2, or vice versa.
              In either case |X(&lambda;)| &le; 2. Integration over &lambda; preserves the bound.
            </p>
          </div>
        </details>
      </article>

      <!-- Interactive: Efficiency Landscape -->
      <div class="figure-wrap reveal" aria-label="Interactive efficiency landscape showing how classical models can exceed quantum bounds at low detection efficiency">
        <div class="figure-interactive" id="efficiencyFigure">
          <div class="figure-controls">
            <div class="demo-slider-row">
              <label for="sliderEta">Detection efficiency &eta;: <span id="valEta">0.70</span></label>
              <input type="range" id="sliderEta" min="0.01" max="1.0" value="0.70" step="0.01" />
            </div>
            <div class="demo-readouts">
              <div class="demo-readout">
                <span class="demo-readout__label">LHV Maximum S</span>
                <span class="readout-value" id="readoutLhvMax">&mdash;</span>
              </div>
            </div>
          </div>
          <div class="demo-canvas-wrap">
            <svg id="efficiencySvg" viewBox="0 0 700 350" aria-label="Detection efficiency landscape chart" role="img"></svg>
          </div>
        </div>
        <p class="figure-caption">
          <span class="figure-label">Interactive</span>
          Sweep detection efficiency to see the classical LHV bound grow.
          At &eta; = 70%, classical models can reach S = 3.71 &mdash; exceeding even the quantum limit.
          Wang et al. sits at ~10<sup>&minus;18</sup>, deep in the loophole-vulnerable regime.
        </p>
      </div>
    </div>
  </section>

  <hr class="section-rule">

  <!-- BEAT 5: POST-SELECTION -->
  <section id="postselection" class="beat beat--postselection">
    <div class="container">
      <p class="section-label reveal">Post-Selection</p>
      <h2 class="section-heading reveal">When You Discard 99.9999&hellip;% of Your Data</h2>

      <div class="beat__prose reveal">
        <p>
          The detection loophole is a specific case of a more general problem: <em>post-selection</em>.
          When you keep only events that satisfy certain criteria, you&rsquo;re no longer testing
          Bell&rsquo;s inequality on the full ensemble. You&rsquo;re testing it on a biased sample.
        </p>
        <p>
          Here&rsquo;s the mechanism. Suppose a classical source produces outcomes deterministically.
          Now introduce a filter: keep events with probability p<sub>hi</sub> when outcomes match
          a desired pattern, and p<sub>lo</sub> otherwise. If p<sub>hi</sub> &gt; p<sub>lo</sub>,
          you&rsquo;ve biased the sample toward correlations that inflate S.
        </p>
        <p>
          The result is striking: as the bias ratio grows, S can approach <strong>4</strong> &mdash;
          the algebraic maximum &mdash; from purely classical data. Watch it happen:
        </p>
      </div>

      <!-- Theorem 3 inline -->
      <article class="theorem-card reveal">
        <header class="theorem-header">
          <span class="theorem-card__number">Theorem 3</span>
          <h3 class="theorem-card__title">Post-Selection Inflation</h3>
        </header>
        <p class="theorem-card__statement">
          Outcome-dependent post-selection on LHV data can achieve:
        </p>
        <div class="theorem-math">
          <span class="math-display" data-latex="S_{\text{post}} \to 4 \quad \text{(from purely classical data)}"></span>
        </div>
        <details>
          <summary>View proof sketch</summary>
          <div class="theorem-card__proof">
            <p class="proof-body">
              Define selection f(A,B) = 1 when AB = +1, f = &rho; when AB = &minus;1.
              As &rho; &rarr; 0, the post-selected estimator E<sub>post</sub>(a,b) &rarr; &plusmn;1.
              The resulting CHSH value S &rarr; 4.
            </p>
          </div>
        </details>
      </article>

      <!-- Interactive: Event Stream -->
      <div class="figure-wrap reveal" aria-label="Visual event stream showing how post-selection filters bias CHSH statistics">
        <canvas id="eventStreamCanvas" width="800" height="250"></canvas>
        <div class="figure-controls" id="eventStreamControls">
          <div class="demo-slider-row">
            <label for="sliderStreamBias">Selection bias &rho;: <span id="valStreamBias">0.50</span></label>
            <input type="range" id="sliderStreamBias" min="0.01" max="1.0" value="0.50" step="0.01" />
          </div>
          <div class="demo-readouts" id="streamReadouts" aria-live="polite">
            <div class="demo-readout">
              <span class="demo-readout__label">Events accepted</span>
              <span class="readout-value" id="readoutStreamAccepted">&mdash;</span>
            </div>
            <div class="demo-readout">
              <span class="demo-readout__label">Post-selected S</span>
              <span class="readout-value" id="readoutStreamS">&mdash;</span>
            </div>
          </div>
        </div>
        <p class="figure-caption">
          <span class="figure-label">Interactive</span>
          Event pairs flow through a filter. Correlated pairs pass; anti-correlated pairs are discarded.
          Watch how selective filtering inflates S beyond the quantum limit &mdash; from purely classical data.
        </p>
      </div>

      <!-- Interactive: Post-Selection Bias (upgraded demo) -->
      <div class="figure-wrap reveal" aria-label="Post-selection bias simulator showing how acceptance rate inversely correlates with inflated S">
        <div class="figure-interactive" id="postSelectFigure">
          <div class="figure-controls">
            <div class="demo-slider-row">
              <label for="sliderBias">Selection bias &rho;: <span id="valBias">0.50</span></label>
              <input type="range" id="sliderBias" min="0.01" max="1.0" value="0.50" step="0.01" />
            </div>
            <div class="demo-readouts">
              <div class="demo-readout">
                <span class="demo-readout__label">Post-selected S</span>
                <span class="readout-value" id="readoutPostS">&mdash;</span>
              </div>
              <div class="demo-readout">
                <span class="demo-readout__label">Acceptance Rate</span>
                <span class="readout-value" id="readoutAccept">&mdash;</span>
              </div>
              <div class="demo-readout demo-readout--verdict">
                <span class="demo-readout__label">Verdict</span>
                <span class="readout-value" id="readoutVerdict">&mdash;</span>
              </div>
            </div>
          </div>
          <div class="demo-canvas-wrap">
            <canvas id="postSelectCanvas" width="600" height="300" aria-label="Post-selection bias visualization"></canvas>
          </div>
        </div>
        <p class="figure-caption">
          <span class="figure-label">Interactive</span>
          Drag the bias slider to see how acceptance rate and inflated S are inversely related.
          Lower acceptance = higher S. At 70% acceptance, S already exceeds the Tsirelson bound.
        </p>
      </div>
    </div>
  </section>

  <hr class="section-rule">

  <!-- BEAT 6: WE BUILT IT -->
  <section id="proof" class="beat beat--proof">
    <div class="container">
      <p class="section-label reveal">The Proof</p>
      <h2 class="section-heading reveal">Don&rsquo;t Take Our Word For It</h2>

      <div class="beat__prose reveal">
        <p>
          We built a classical hidden-variable model. No quantum mechanics. No entanglement.
          Just deterministic outcomes from a hidden variable &lambda;, sampled uniformly from [0, 2&pi;).
        </p>
        <p>
          Without post-selection, this model produces <strong>S = 2.001</strong>
          (95% CI: [1.998, 2.004]) &mdash; consistent with the classical bound, as it should be.
        </p>
        <p>
          With outcome-dependent selection (p<sub>hi</sub> = 0.9, p<sub>lo</sub> = 0.1),
          the <em>same classical source</em> yields <strong>S = 3.716</strong>
          (95% CI: [3.714, 3.717]) at 70% acceptance. That exceeds both the classical bound
          <em>and</em> the Tsirelson bound.
        </p>
      </div>

      <!-- Results table -->
      <div class="results-table-wrap reveal">
        <table class="results-table">
          <caption>A classical model, subjected to post-selection, exceeds both classical and quantum bounds.</caption>
          <thead>
            <tr>
              <th>Dataset</th>
              <th>S</th>
              <th>Acceptance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Full (no selection)</td>
              <td>2.001 &plusmn; 0.009</td>
              <td>100%</td>
            </tr>
            <tr class="results-table__highlight">
              <td>Post-selected</td>
              <td>3.716 &plusmn; 0.004</td>
              <td>70.0%</td>
            </tr>
            <tr class="results-table__muted">
              <td>Wang et al. (2025)</td>
              <td>2.275 &plusmn; 0.057</td>
              <td>~10<sup>&minus;18</sup></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="beat__prose reveal">
        <p>
          The implication is clear: values above 2.828 are not evidence of
          stronger-than-quantum correlations. They indicate that the selected ensemble
          is no longer a fair Bell sample. The apparent violation comes from the filter,
          not from the physics.
        </p>
      </div>

      <!-- Theorem 2 inline -->
      <article class="theorem-card reveal">
        <header class="theorem-header">
          <span class="theorem-card__number">Theorem 2</span>
          <h3 class="theorem-card__title">Tsirelson Bound</h3>
        </header>
        <p class="theorem-card__statement">
          In quantum mechanics with optimal local observables:
        </p>
        <div class="theorem-math">
          <span class="math-display" data-latex="S \leq 2\sqrt{2} \approx 2.828"></span>
        </div>
        <details>
          <summary>View proof sketch</summary>
          <div class="theorem-card__proof">
            <p class="proof-body">
              The CHSH operator &#348;<sup>2</sup> = 4I &minus; [A,A&prime;] &otimes; [B,B&prime;].
              Since commutator norms satisfy &Vert;[A,A&prime;]&Vert; &le; 2,
              we get &#348;<sup>2</sup> &le; 8I, so max&#10216;&#348;&#10217; = &radic;8 = 2&radic;2.
            </p>
          </div>
        </details>
      </article>

      <!-- Interactive: Angle Sweep (upgraded) -->
      <div class="figure-wrap reveal" aria-label="Interactive angle sweep showing CHSH S value as a function of measurement angles">
        <div class="figure-interactive" id="angleSweepFigure">
          <div class="figure-controls">
            <div class="demo-slider-row">
              <label for="sliderA">Angle a (&deg;): <span id="valA">0</span></label>
              <input type="range" id="sliderA" min="0" max="360" value="0" step="1" />
            </div>
            <div class="demo-slider-row">
              <label for="sliderAp">Angle a&prime; (&deg;): <span id="valAp">90</span></label>
              <input type="range" id="sliderAp" min="0" max="360" value="90" step="1" />
            </div>
            <div class="demo-slider-row">
              <label for="sliderB">Angle b (&deg;): <span id="valB">45</span></label>
              <input type="range" id="sliderB" min="0" max="360" value="45" step="1" />
            </div>
            <div class="demo-slider-row">
              <label for="sliderBp">Angle b&prime; (&deg;): <span id="valBp">135</span></label>
              <input type="range" id="sliderBp" min="0" max="360" value="135" step="1" />
            </div>
            <div class="demo-readouts">
              <div class="demo-readout">
                <span class="demo-readout__label">Classical LHV</span>
                <span class="readout-value" id="readoutClassical">&mdash;</span>
              </div>
              <div class="demo-readout">
                <span class="demo-readout__label">Quantum</span>
                <span class="readout-value" id="readoutQuantum">&mdash;</span>
              </div>
            </div>
          </div>
          <div class="demo-canvas-wrap">
            <canvas id="chshCanvas" width="600" height="400" aria-label="Polar correlation diagram showing CHSH angle sweep"></canvas>
          </div>
        </div>
        <p class="figure-caption">
          <span class="figure-label">Interactive</span>
          Adjust the four measurement angles to explore how CHSH S varies.
          The optimal quantum settings (0&deg;, 90&deg;, 45&deg;, 135&deg;) produce S = 2&radic;2.
          No classical model exceeds S = 2 &mdash; unless you post-select.
        </p>
      </div>
    </div>
  </section>

  <hr class="section-rule">

  <!-- BEAT 7: WHAT WOULD CONVINCE US -->
  <section id="standards" class="beat beat--standards">
    <div class="container">
      <p class="section-label reveal">What Would Convince Us</p>
      <h2 class="section-heading reveal">The Standard for Bell Tests</h2>

      <div class="beat__prose reveal">
        <p>
          The history of Bell tests is instructive. The first experiments &mdash;
          <a href="https://doi.org/10.1103/PhysRevLett.28.938" target="_blank" rel="noopener noreferrer">Freedman &amp; Clauser (1972)</a>,
          <a href="https://doi.org/10.1103/PhysRevLett.49.91" target="_blank" rel="noopener noreferrer">Aspect et al. (1982)</a>
          &mdash; had open loopholes. They were brilliant pioneering work, but their authors
          were careful not to claim more than the data warranted.
        </p>
        <p>
          The community converged on a standard: either close the detection loophole
          (&eta; &gt; 82.8%), or provide diagnostics that rule out selection artifacts.
          In 2015, three independent groups achieved both simultaneously:
          <a href="https://doi.org/10.1038/nature15759" target="_blank" rel="noopener noreferrer">Hensen et al.</a> (Delft),
          <a href="https://doi.org/10.1103/PhysRevLett.115.250401" target="_blank" rel="noopener noreferrer">Giustina et al.</a> (Vienna),
          <a href="https://doi.org/10.1103/PhysRevLett.115.250402" target="_blank" rel="noopener noreferrer">Shalm et al.</a> (NIST).
        </p>
        <p>
          For future experiments with low acceptance rates, we recommend reporting:
        </p>
      </div>

      <ol class="diagnostic-list reveal">
        <li><strong>Raw correlations</strong> before any selection, if available.</li>
        <li><strong>Acceptance rates</strong> broken down by measurement setting.</li>
        <li><strong>No-signaling tests</strong> on both selected and unselected data.</li>
        <li><strong>Independence tests</strong> between acceptance and measurement settings.</li>
        <li><strong>Sensitivity analysis:</strong> how much could selection bias the result?</li>
      </ol>

      <div class="beat__prose reveal">
        <p>
          If these diagnostics are not available, the appropriate conclusion is not
          &ldquo;Bell inequality violated&rdquo; but rather &ldquo;cannot rule out classical explanation.&rdquo;
        </p>
      </div>

      <!-- Interactive: Timeline -->
      <div class="figure-wrap reveal" id="timelineWrap" aria-label="Interactive timeline of Bell test experiments from 1964 to 2025">
        <div id="timelineContainer" class="timeline-track"></div>
        <p class="figure-caption">
          <span class="figure-label">Timeline</span>
          From Bell&rsquo;s 1964 theorem through loophole-free tests in 2015 to Wang et al.&rsquo;s 2025 claim.
          Click any node for details.
        </p>
      </div>
    </div>
  </section>

  <hr class="section-rule">

  <!-- BEAT 8: CONCLUSION -->
  <section id="conclusion" class="beat beat--conclusion">
    <div class="container">
      <h2 class="section-heading reveal">The Experiment Is Impressive. The Claim Doesn&rsquo;t Hold.</h2>

      <div class="beat__prose reveal">
        <p>
          We have shown that a classical hidden-variable model, when subjected to
          outcome-dependent post-selection, can produce CHSH values well above the
          Tsirelson bound. This does not disprove quantum mechanics or invalidate Bell
          inequalities &mdash; far from it. It illustrates a principle that has been known
          for decades: post-selection can create apparent violations where none exist.
        </p>
        <p>
          The Wang et al. experiment represents impressive optical engineering.
          Perhaps future work with additional diagnostics will establish their claim.
          But the burden of proof lies with the claimant, and the present data do not
          meet that burden.
        </p>
      </div>

      <div class="conclusion-links reveal">
        <a href="paper.html" class="conclusion-link conclusion-link--primary">Read the Formal Paper &rarr;</a>
        <a href="https://github.com/alawein/chshlab" target="_blank" rel="noopener noreferrer" class="conclusion-link">Source Code on GitHub</a>
        <a href="https://doi.org/10.1126/sciadv.ads0058" target="_blank" rel="noopener noreferrer" class="conclusion-link">Wang et al. (2025)</a>
      </div>
    </div>
  </section>

  <!-- REFERENCES -->
  <section id="references" class="section section--references">
    <div class="container">
      <p class="section-label reveal">Bibliography</p>
      <h2 class="section-heading reveal">References</h2>
      <ol class="references-list reveal" role="list" id="referencesList">
        <!-- Populated by js/references.js -->
      </ol>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="site-footer">
    <div class="container">
      <p class="footer-text">
        CHSH Lab &mdash; by
        <a href="https://www.meshal.ai" target="_blank" rel="noopener noreferrer">Meshal Alawein</a>
      </p>
      <nav class="footer-author" aria-label="Author links">
        <a href="https://www.meshal.ai" target="_blank" rel="noopener noreferrer">meshal.ai</a>
        <a href="https://www.linkedin.com/in/alawein" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://www.github.com/alawein" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="mailto:contact@meshal.ai">contact@meshal.ai</a>
      </nav>
      <p class="footer-text footer-text--small">
        All simulations run client-side. No data is collected or transmitted.
        <a href="https://github.com/alawein/chshlab" target="_blank" rel="noopener noreferrer">Source code on GitHub.</a>
      </p>
    </div>
  </footer>

  <script type="module" src="js/main.js"></script>
</body>
```

- [ ] **Step 2:** Create a temporary stub `js/main.js` that only imports modules that exist, preventing import errors from deleted modules:

```javascript
// chshlab/js/main.js (STUB — replaced in Task 11)
// Minimal entrypoint while modules are being built

import { paramsToState, initMicroInteractions } from './animation-config.js';

function initKaTeX() {
  if (typeof katex === 'undefined') return;
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) katex.render(latex, el, { displayMode: true, throwOnError: false });
  });
}

window.addEventListener('load', async () => {
  if (typeof gsap !== 'undefined') {
    gsap.to(document.body, { opacity: 1, duration: 0.4, ease: 'power1.out' });
  } else {
    document.body.style.opacity = '1';
  }

  initKaTeX();

  // Only import modules that exist at this stage
  try { const { initStarfield } = await import('./starfield.js'); initStarfield(); } catch(e) { console.warn('starfield:', e); }
  try { const { initScroll } = await import('./scroll.js'); initScroll(); } catch(e) { console.warn('scroll:', e); }
});
```

- [ ] **Step 3:** Verify the page loads (prose renders, no JS errors in console). Interactive figures will be empty placeholders.
- [ ] **Step 4:** Commit: `feat: rewrite index.html as 8-beat narrative structure`

---

### Task 3: Update CSS for narrative layout

**Files:**
- Modify: `css/layout.css`
- Modify: `css/components.css`
- Modify: `css/base.css`

- [ ] **Step 1:** In `css/layout.css`, add beat layout rules and figure-wrap styling:

```css
/* ── BEAT SECTIONS ── */
.beat {
  padding-block: var(--space-8);
  position: relative;
  z-index: 10;
}

.beat--hook {
  min-height: 100svh;
  display: grid;
  place-items: center;
  text-align: center;
  overflow: hidden;
}

.beat__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: var(--space-4);
}

.beat__title {
  margin-bottom: var(--space-4);
  max-width: 20ch;
  margin-inline: auto;
}

.beat__subtitle {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 54ch;
  margin-inline: auto;
  margin-bottom: var(--space-4);
  line-height: 1.7;
}

.beat__byline {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--text-faint);
}

.beat__byline a {
  color: var(--text-muted);
}

.beat__prose {
  margin-bottom: var(--space-5);
}

.beat__prose p {
  margin-bottom: var(--space-3);
  line-height: 1.75;
}

/* ── FIGURE WRAP ── */
.figure-wrap {
  margin-block: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: var(--space-4);
}

.figure-wrap canvas {
  width: 100%;
  display: block;
  will-change: transform; /* GPU layer promotion */
}

/* GSAP-failure fallback: if JS doesn't run, show everything */
.no-js .reveal {
  opacity: 1;
  transform: none;
}

.figure-interactive {
  display: grid;
  gap: var(--space-5);
}

@media (min-width: 900px) {
  .figure-interactive {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.figure-caption {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin-top: var(--space-3);
}

.figure-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--amber);
  display: block;
  margin-bottom: var(--space-1);
}

/* ── BOUNDS ROW ── */
.bounds-row {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-5);
}

/* ── RESULTS TABLE ── */
.results-table-wrap {
  margin-block: var(--space-5);
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.results-table caption {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--text-faint);
  text-align: left;
  margin-bottom: var(--space-2);
  font-style: italic;
}

.results-table th {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-faint);
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border);
}

.results-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border-light);
  color: var(--text-muted);
}

.results-table__highlight td {
  color: var(--crimson);
  font-weight: 500;
}

.results-table__muted td {
  color: var(--text-faint);
  font-style: italic;
}

/* ── DIAGNOSTIC LIST ── */
.diagnostic-list {
  margin-block: var(--space-4);
  padding-left: var(--space-5);
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
}

.diagnostic-list li {
  margin-bottom: var(--space-2);
}

/* ── CONCLUSION LINKS ── */
.conclusion-links {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-5);
}

.conclusion-link {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border);
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.conclusion-link:hover {
  color: var(--text);
  border-color: var(--amber-dim);
  text-decoration: none;
}

.conclusion-link--primary {
  border-color: var(--amber-dim);
  color: var(--amber);
}

.conclusion-link--primary:hover {
  background: rgba(201, 169, 77, 0.08);
  border-color: var(--amber);
}

/* ── FOOTER AUTHOR (expanded) ── */
.footer-author {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.footer-author a {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border);
  transition: color 0.2s, border-color 0.2s;
}

.footer-author a:hover {
  color: var(--amber);
  border-color: var(--amber-dim);
  text-decoration: none;
}
```

- [ ] **Step 2:** In `css/components.css`, remove the following blocks (they reference deleted features):
  - `.story-overlay` through `.story-trigger-btn:hover` (lines 670-899)
  - `.bound-explorer` through `.bound-explorer--open .bound-explorer__content` at 768px (lines 901-997)
  - `.assumption-toggles` through `.assumption-banner` (lines 999-1063)
  - `.provenance-btn` through `.provenance-params dd` (lines 1137-1214)
  - `.term-linkable` through `.term-highlight` (lines 1254-1266)
  - `.shortcuts-help` through `.shortcuts-list dd` (lines 1268-1312)

  **Keep** (features marked Keep in spec):
  - `.demo-export-btns` through `.demo-export-btn:hover` (lines 1216-1234)
  - `.sonification-toggle` through `.mute-line` (lines 1236-1252)

  Keep: nav, rebuttal-card (repurposed for theorem cards), math-block, theorem-card, figure-card, demo components, readout, footer, forced-colors.

- [ ] **Step 3:** In `css/components.css`, update the forced-colors block to remove references to deleted components.

- [ ] **Step 4:** In `css/base.css`, update `prefers-reduced-motion` block — remove references to `.story-overlay`, `.bound-explorer__content`, `.provenance-drawer`, `.story-trigger-btn`. Add `.figure-wrap canvas { animation: none; }`.

- [ ] **Step 5:** Remove old layout rules from `css/layout.css`: `.demo-tabs` indicator, `.demo-panels-wrap`, `.demo-tab` active/hover styles (the tab system is removed). Keep `.demo-panel-inner`, `.demo-controls`, `.demo-readouts`, `.demo-slider-row` as they're reused.

- [ ] **Step 6:** Verify the page renders with the narrative layout. Prose should be readable, figures should have bordered containers.
- [ ] **Step 7:** Commit: `feat: update CSS for narrative beat layout, remove deprecated component styles`

---

## Chunk 2: Interactive Figures — New Modules

### Task 4: References module

**Files:**
- Create: `js/references.js`

- [ ] **Step 1:** Create `js/references.js`:

```javascript
// chshlab/js/references.js
// Reference data with DOI links, populates reference list and provides inline linking

export const REFS = [
  { key: 'bell1964', authors: 'Bell, J.S.', year: 1964, title: 'On the Einstein-Podolsky-Rosen paradox', journal: 'Physics', volume: '1(3)', pages: '195\u2013200', doi: 'https://doi.org/10.1103/PhysicsPhysique.1.195' },
  { key: 'chsh1969', authors: 'Clauser, J.F., Horne, M.A., Shimony, A., & Holt, R.A.', year: 1969, title: 'Proposed experiment to test local hidden-variable theories', journal: 'Physical Review Letters', volume: '23(15)', pages: '880\u2013884', doi: 'https://doi.org/10.1103/PhysRevLett.23.880' },
  { key: 'pearle1970', authors: 'Pearle, P.M.', year: 1970, title: 'Hidden-variable example based upon data rejection', journal: 'Physical Review D', volume: '2(8)', pages: '1418\u20131425', doi: 'https://doi.org/10.1103/PhysRevD.2.1418' },
  { key: 'freedman1972', authors: 'Freedman, S.J. & Clauser, J.F.', year: 1972, title: 'Experimental test of local hidden-variable theories', journal: 'Physical Review Letters', volume: '28(14)', pages: '938\u2013941', doi: 'https://doi.org/10.1103/PhysRevLett.28.938' },
  { key: 'tsirelson1980', authors: 'Tsirelson, B.S.', year: 1980, title: 'Quantum generalizations of Bell\u2019s inequality', journal: 'Letters in Mathematical Physics', volume: '4', pages: '93\u201398', doi: 'https://doi.org/10.1007/BF00417500' },
  { key: 'aspect1982', authors: 'Aspect, A., Grangier, P., & Roger, G.', year: 1982, title: 'Experimental realization of EPR-Bohm Gedankenexperiment', journal: 'Physical Review Letters', volume: '49(2)', pages: '91\u201394', doi: 'https://doi.org/10.1103/PhysRevLett.49.91' },
  { key: 'eberhard1993', authors: 'Eberhard, P.H.', year: 1993, title: 'Background level and counter efficiencies required for a loophole-free EPR experiment', journal: 'Physical Review A', volume: '47(2)', pages: 'R747', doi: 'https://doi.org/10.1103/PhysRevA.47.R747' },
  { key: 'weihs1998', authors: 'Weihs, G. et al.', year: 1998, title: 'Violation of Bell\u2019s inequality under strict Einstein locality conditions', journal: 'Physical Review Letters', volume: '81(23)', pages: '5039\u20135043', doi: 'https://doi.org/10.1103/PhysRevLett.81.5039' },
  { key: 'hensen2015', authors: 'Hensen, B. et al.', year: 2015, title: 'Loophole-free Bell inequality violation using electron spins separated by 1.3 kilometres', journal: 'Nature', volume: '526', pages: '682\u2013686', doi: 'https://doi.org/10.1038/nature15759' },
  { key: 'giustina2015', authors: 'Giustina, M. et al.', year: 2015, title: 'Significant-loophole-free test of Bell\u2019s theorem with entangled photons', journal: 'Physical Review Letters', volume: '115', pages: '250401', doi: 'https://doi.org/10.1103/PhysRevLett.115.250401' },
  { key: 'shalm2015', authors: 'Shalm, L.K. et al.', year: 2015, title: 'Strong loophole-free test of local realism', journal: 'Physical Review Letters', volume: '115', pages: '250402', doi: 'https://doi.org/10.1103/PhysRevLett.115.250402' },
  { key: 'wang2025', authors: 'Wang, M. et al.', year: 2025, title: 'Bell inequality violation without entanglement', journal: 'Science Advances', volume: '11', pages: 'eads0058', doi: 'https://doi.org/10.1126/sciadv.ads0058' },
];

export function initReferences() {
  const list = document.getElementById('referencesList');
  if (!list) return;

  REFS.forEach(ref => {
    const li = document.createElement('li');
    li.className = 'reference-item';
    li.id = 'ref-' + ref.key;

    const text = document.createTextNode(
      ref.authors + ' (' + ref.year + '). ' + ref.title + '. '
    );
    li.appendChild(text);

    const em = document.createElement('em');
    em.textContent = ref.journal;
    li.appendChild(em);

    const rest = document.createTextNode(
      ', ' + ref.volume + ', ' + ref.pages + '. '
    );
    li.appendChild(rest);

    const link = document.createElement('a');
    link.href = ref.doi;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'DOI';
    li.appendChild(link);

    list.appendChild(li);
  });
}
```

- [ ] **Step 2:** Commit: `feat: add references module with DOI data`

---

### Task 5: Three Regions Gauge (Beat 3)

**Files:**
- Create: `js/fig-gauge.js`

- [ ] **Step 1:** Create `js/fig-gauge.js`:

```javascript
// chshlab/js/fig-gauge.js
// Three Regions Gauge — horizontal S range [0,4] with colored zones
// Beat 3 visualization. Markers animate on via ScrollTrigger callbacks.

import { emitState } from './animation-config.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initGauge() {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const markers = [
    { s: 2.275, label: 'Wang et al.', color: '#9A9485', visible: true },
  ];

  const ro = new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 160 * dpr;
    ctx.scale(dpr, dpr);
    render();
  });
  ro.observe(canvas);

  function render() {
    const W = canvas.offsetWidth;
    const H = 160;
    ctx.clearRect(0, 0, W, H);

    const pad = 40;
    const barY = 50;
    const barH = 36;
    const barW = W - pad * 2;

    // Three zones
    const zones = [
      { start: 0, end: 2, color: 'rgba(201,169,77,0.15)', border: '#C9A94D', label: 'Classical' },
      { start: 2, end: 2 * Math.SQRT2, color: 'rgba(79,163,212,0.15)', border: '#4FA3D4', label: 'Quantum' },
      { start: 2 * Math.SQRT2, end: 4, color: 'rgba(201,64,64,0.15)', border: '#C94040', label: 'Artifact' },
    ];

    zones.forEach(z => {
      const x1 = pad + (z.start / 4) * barW;
      const x2 = pad + (z.end / 4) * barW;
      ctx.fillStyle = z.color;
      ctx.fillRect(x1, barY, x2 - x1, barH);

      // Zone label
      ctx.fillStyle = z.border;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(z.label, (x1 + x2) / 2, barY - 8);
    });

    // Border lines at S=2 and S=2√2
    [2, 2 * Math.SQRT2].forEach(val => {
      const x = pad + (val / 4) * barW;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, barY - 4);
      ctx.lineTo(x, barY + barH + 4);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // S axis labels
    ctx.fillStyle = '#5C5A55';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    [0, 1, 2, 3, 4].forEach(val => {
      const x = pad + (val / 4) * barW;
      ctx.fillText(String(val), x, barY + barH + 20);
    });
    const tsX = pad + (2 * Math.SQRT2 / 4) * barW;
    ctx.fillText('2\u221a2', tsX, barY + barH + 32);

    // Markers
    markers.forEach(m => {
      if (!m.visible) return;
      const x = pad + (m.s / 4) * barW;

      // Pin
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.moveTo(x, barY - 2);
      ctx.lineTo(x - 5, barY - 14);
      ctx.lineTo(x + 5, barY - 14);
      ctx.closePath();
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(x, barY + barH / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(m.label, x, barY - 18);
      ctx.fillText('S=' + m.s.toFixed(3), x, barY + barH + 46);
    });
  }

  // Public API: add markers from other beats via ScrollTrigger
  function addMarker(s, label, color) {
    const existing = markers.find(m => m.label === label);
    if (existing) {
      existing.visible = true;
      render();
      return;
    }
    markers.push({ s, label, color, visible: true });
    render();
  }

  // Expose for scroll callbacks
  window.__gaugeAddMarker = addMarker;

  // ScrollTrigger callbacks for Beat 6 markers
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '#proof',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        addMarker(2.001, 'Classical sim', '#C9A94D');
        setTimeout(() => addMarker(3.716, 'Post-selected', '#C94040'), 400);
      },
    });
  }

  render();
}
```

- [ ] **Step 2:** Commit: `feat: add Three Regions Gauge (Beat 3)`

---

### Task 6: Animated Bell Test (Beat 2)

**Files:**
- Create: `js/fig-bell-test.js`

- [ ] **Step 1:** Create `js/fig-bell-test.js`:

```javascript
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
```

- [ ] **Step 2:** Commit: `feat: add animated Bell test figure (Beat 2)`

---

### Task 7: Event Stream Filter (Beat 5)

**Files:**
- Create: `js/fig-event-stream.js`

- [ ] **Step 1:** Create `js/fig-event-stream.js`:

```javascript
// chshlab/js/fig-event-stream.js
// Post-Selection Event Stream — particles flow through a filter gate
// Beat 5 visualization. Canvas2D with object pooling.

import { emitState } from './animation-config.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initEventStream() {
  const canvas = document.getElementById('eventStreamCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('sliderStreamBias');
  const valLabel = document.getElementById('valStreamBias');
  const readoutAccepted = document.getElementById('readoutStreamAccepted');
  const readoutS = document.getElementById('readoutStreamS');

  let rho = slider ? parseFloat(slider.value) : 0.5;
  const events = [];
  const MAX_EVENTS = 100;
  let accepted = 0, total = 0;
  let frameId = null;

  let W, H, dpr;
  const ro = new ResizeObserver(() => {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = 250;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  });
  ro.observe(canvas);

  const gateX = () => W * 0.5;

  function postS(p) { return 2 + 2 * (1 - p); }
  function acceptRate(p) { return 0.5 + 0.5 * p; }

  function emitEvent() {
    if (events.length >= MAX_EVENTS) return;
    const correlated = Math.random() < 0.5;
    const keepProb = correlated ? 1.0 : rho;
    const kept = Math.random() < keepProb;

    events.push({
      x: 0,
      y: H * 0.2 + Math.random() * H * 0.6,
      speed: 1.5 + Math.random() * 1.5,
      correlated,
      kept,
      alpha: 1,
      phase: 'pre', // pre -> gate -> post
    });
    total++;
    if (kept) accepted++;
  }

  function loop() {
    frameId = requestAnimationFrame(loop);
    if (!W) return;

    ctx.clearRect(0, 0, W, H);
    const gx = gateX();

    // Draw filter gate
    ctx.fillStyle = 'rgba(201, 169, 77, 0.1)';
    ctx.fillRect(gx - 3, 0, 6, H);
    ctx.strokeStyle = '#C9A94D';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gate label
    ctx.fillStyle = '#C9A94D';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('FILTER', gx, 16);

    // Emit
    if (Math.random() < 0.15) emitEvent();

    // Update and draw events
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      e.x += e.speed;

      // Phase transitions
      if (e.phase === 'pre' && e.x >= gx) {
        e.phase = e.kept ? 'post' : 'rejected';
      }

      if (e.phase === 'rejected') {
        e.alpha -= 0.04;
        e.y += 1.5; // drift down
        if (e.alpha <= 0) { events.splice(i, 1); continue; }
      }

      if (e.x > W + 20) { events.splice(i, 1); continue; }

      // Draw
      ctx.globalAlpha = e.alpha;
      if (e.phase === 'rejected') {
        ctx.fillStyle = 'rgba(201, 64, 64, 0.6)';
      } else if (e.correlated) {
        ctx.fillStyle = '#6B8F71';
      } else {
        ctx.fillStyle = '#C94040';
      }
      ctx.beginPath();
      ctx.arc(e.x, e.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Readouts
    const s = postS(rho);
    const rate = acceptRate(rho);
    if (readoutAccepted) readoutAccepted.textContent = (rate * 100).toFixed(1) + '%';
    if (readoutS) readoutS.textContent = s.toFixed(3);

    // Labels
    ctx.fillStyle = '#5C5A55';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText('Incoming pairs', 10, H - 10);
    ctx.textAlign = 'right';
    ctx.fillText('Accepted \u2192 S = ' + s.toFixed(2), W - 10, H - 10);

    emitState({ demo: 'eventstream', s, accept: rate, rho });
  }

  if (slider) {
    slider.addEventListener('input', () => {
      rho = parseFloat(slider.value);
      if (valLabel) valLabel.textContent = rho.toFixed(2);
    });
  }

  // Visibility-based start/stop
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
}
```

- [ ] **Step 2:** Commit: `feat: add event stream filter visualization (Beat 5)`

---

### Task 8: Upgrade demo-chsh.js — polar correlation diagram

**Files:**
- Rewrite: `js/demo-chsh.js`

- [ ] **Step 1:** Rewrite `js/demo-chsh.js`:

```javascript
// chshlab/js/demo-chsh.js
// Demo: CHSH Angle Sweep — Polar correlation diagram
// Beat 6 visualization. Four detector arms on unit circle, correlation arcs.

import { emitState } from './animation-config.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function eQuantum(a, b) { return -Math.cos(a - b); }

function eClassical(a, b) {
  let diff = Math.abs(a - b) % Math.PI;
  if (diff > Math.PI / 2) diff = Math.PI - diff;
  return -(2 / Math.PI) * (Math.PI / 2 - diff);
}

export function initAngleDemo() {
  const canvas = document.getElementById('chshCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const sliders = {
    a: document.getElementById('sliderA'),
    ap: document.getElementById('sliderAp'),
    b: document.getElementById('sliderB'),
    bp: document.getElementById('sliderBp'),
  };
  const valLabels = {
    a: document.getElementById('valA'),
    ap: document.getElementById('valAp'),
    b: document.getElementById('valB'),
    bp: document.getElementById('valBp'),
  };
  const readoutC = document.getElementById('readoutClassical');
  const readoutQ = document.getElementById('readoutQuantum');

  function deg2rad(d) { return d * Math.PI / 180; }

  const ro = new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    render();
  });
  ro.observe(canvas);

  function render() {
    const W = canvas.offsetWidth;
    const H = 400;
    ctx.clearRect(0, 0, W, H);

    const a  = deg2rad(parseFloat(sliders.a?.value || 0));
    const ap = deg2rad(parseFloat(sliders.ap?.value || 90));
    const b  = deg2rad(parseFloat(sliders.b?.value || 45));
    const bp = deg2rad(parseFloat(sliders.bp?.value || 135));

    // Update labels
    if (valLabels.a)  valLabels.a.textContent  = sliders.a.value;
    if (valLabels.ap) valLabels.ap.textContent = sliders.ap.value;
    if (valLabels.b)  valLabels.b.textContent  = sliders.b.value;
    if (valLabels.bp) valLabels.bp.textContent = sliders.bp.value;

    // Quantum CHSH
    const eAB  = eQuantum(a, b);
    const eABp = eQuantum(a, bp);
    const eApB = eQuantum(ap, b);
    const eApBp= eQuantum(ap, bp);
    const sq = Math.abs(eAB - eABp + eApB + eApBp);

    // Classical CHSH
    const cAB  = eClassical(a, b);
    const cABp = eClassical(a, bp);
    const cApB = eClassical(ap, b);
    const cApBp= eClassical(ap, bp);
    const sc = Math.abs(cAB - cABp + cApB + cApBp);

    if (readoutC) readoutC.textContent = sc.toFixed(3);
    if (readoutQ) readoutQ.textContent = sq.toFixed(3);

    // Polar diagram
    const cx = W / 2;
    const cy = H / 2 - 20;
    const R = Math.min(W, H) * 0.32;

    // Unit circle
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Draw angle arms
    const arms = [
      { angle: a,  label: 'a',  color: '#C9A94D' },
      { angle: ap, label: 'a\u2032', color: '#C9A94D' },
      { angle: b,  label: 'b',  color: '#4FA3D4' },
      { angle: bp, label: 'b\u2032', color: '#4FA3D4' },
    ];

    arms.forEach(arm => {
      const ex = cx + R * Math.cos(arm.angle);
      const ey = cy - R * Math.sin(arm.angle);
      ctx.strokeStyle = arm.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Label
      const lx = cx + (R + 18) * Math.cos(arm.angle);
      const ly = cy - (R + 18) * Math.sin(arm.angle);
      ctx.fillStyle = arm.color;
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(arm.label, lx, ly);
    });

    // Correlation arcs between setting pairs
    const pairs = [
      { a1: a, a2: b, E: eAB, label: 'E(a,b)' },
      { a1: a, a2: bp, E: eABp, label: 'E(a,b\u2032)' },
      { a1: ap, a2: b, E: eApB, label: 'E(a\u2032,b)' },
      { a1: ap, a2: bp, E: eApBp, label: 'E(a\u2032,b\u2032)' },
    ];

    pairs.forEach((p, i) => {
      const arcR = R * 0.4 + i * 12;
      const startAngle = -p.a1;
      const endAngle = -p.a2;

      ctx.strokeStyle = p.E < 0 ? 'rgba(201,64,64,0.4)' : 'rgba(107,143,113,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, startAngle, endAngle, startAngle > endAngle);
      ctx.stroke();
    });

    // S value display
    ctx.fillStyle = sq > 2 ? '#C94040' : '#C9A94D';
    ctx.font = "bold 18px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('S(quantum) = ' + sq.toFixed(3), cx, cy + R + 30);

    ctx.fillStyle = '#9A9485';
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.fillText('S(classical) = ' + sc.toFixed(3), cx, cy + R + 54);

    // Reference lines
    ctx.fillStyle = '#5C5A55';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'right';
    ctx.fillText('S=2 classical bound', W - 10, H - 30);
    ctx.fillText('S=2\u221a2 Tsirelson bound', W - 10, H - 16);

    emitState({ demo: 'angle', s: sq, sClassical: sc, a: sliders.a?.value, ap: sliders.ap?.value, b: sliders.b?.value, bp: sliders.bp?.value });
  }

  Object.values(sliders).forEach(s => {
    if (s) s.addEventListener('input', () => {
      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.to({}, { duration: 0.1, onUpdate: render });
      } else {
        render();
      }
    });
  });

  render();
}
```

- [ ] **Step 2:** Verify: adjusting sliders updates the polar diagram and readouts.
- [ ] **Step 3:** Commit: `feat: upgrade angle sweep to polar correlation diagram (Beat 6)`

---

### Task 9: Upgrade demo-efficiency.js — ambiguity zone + Wang marker

**Files:**
- Modify: `js/demo-efficiency.js`

- [ ] **Step 1:** In the SVG rendering function, after drawing the LHV bound curve, add an ambiguity zone fill and Wang marker. Add these to the existing `render()` or `drawChart()` function:

```javascript
// Add after the existing LHV curve path creation:

// Ambiguity zone: filled area between S=2 line and LHV curve
const zonePoints = [];
for (let eta = 0.5; eta <= 1.0; eta += 0.005) {
  const sMax = 4 / eta - 2;
  if (sMax > 2) {
    zonePoints.push({ eta, s: Math.min(sMax, 6) });
  }
}
if (zonePoints.length > 0) {
  const zonePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let d = 'M' + scaleX(zonePoints[0].eta) + ',' + scaleY(2);
  zonePoints.forEach(p => { d += 'L' + scaleX(p.eta) + ',' + scaleY(p.s); });
  d += 'L' + scaleX(zonePoints[zonePoints.length - 1].eta) + ',' + scaleY(2) + 'Z';
  zonePath.setAttribute('d', d);
  zonePath.setAttribute('fill', 'rgba(201,64,64,0.08)');
  zonePath.setAttribute('stroke', 'none');
  svg.insertBefore(zonePath, svg.firstChild); // behind curve
}

// Wang et al. callout marker (at left edge, efficiency ~0)
const wangX = scaleX(0.5); // pin to left edge since 10^-18 is off-scale
const wangLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
wangLabel.setAttribute('x', wangX + 8);
wangLabel.setAttribute('y', scaleY(4) + 14);
wangLabel.setAttribute('fill', '#9A9485');
wangLabel.setAttribute('font-size', '10');
wangLabel.setAttribute('font-family', "'JetBrains Mono', monospace");
wangLabel.textContent = 'Wang et al. \u03b7\u224810\u207b\xb9\u2078 \u2192';
svg.appendChild(wangLabel);

// Set will-change on SVG container
const svgContainer = svg.parentElement;
if (svgContainer) svgContainer.style.willChange = 'transform';
```

- [ ] **Step 2:** Verify: the chart shows the red ambiguity zone and Wang marker callout.
- [ ] **Step 3:** Commit: `feat: upgrade efficiency landscape with ambiguity zone (Beat 4)`

---

### Task 10: Upgrade demo-postselect.js — enhanced gauge

**Files:**
- Modify: `js/demo-postselect.js`

- [ ] **Step 1:** In the `drawGauge()` function, add threshold markers and color transitions. Replace the S bar fill color logic:

```javascript
// Replace the S bar fill color (line ~89 in current file):
// Old: ctx.fillStyle = s > 2.01 ? '#C94040' : '#C9A94D';
// New: color transitions through three zones
if (s <= 2.01) {
  ctx.fillStyle = '#C9A94D'; // classical zone — amber
} else if (s <= 2 * Math.SQRT2) {
  ctx.fillStyle = '#4FA3D4'; // quantum zone — blue
} else {
  ctx.fillStyle = '#C94040'; // artifact zone — crimson
}

// After drawing the S bar fill, add zone boundary labels:
// S=2 marker
const s2x = startX + maxW * (2 / 4);
ctx.strokeStyle = '#C9A94D';
ctx.lineWidth = 1.5;
ctx.setLineDash([4, 4]);
ctx.beginPath();
ctx.moveTo(s2x, sBarY - 8);
ctx.lineTo(s2x, sBarY + barH + 8);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#C9A94D';
ctx.font = "9px 'JetBrains Mono', monospace";
ctx.textAlign = 'center';
ctx.fillText('Classical', s2x, sBarY - 12);

// S=2√2 marker
const tsX = startX + maxW * (2 * Math.SQRT2 / 4);
ctx.strokeStyle = '#4FA3D4';
ctx.lineWidth = 1.5;
ctx.setLineDash([4, 4]);
ctx.beginPath();
ctx.moveTo(tsX, sBarY - 8);
ctx.lineTo(tsX, sBarY + barH + 8);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#4FA3D4';
ctx.fillText('Tsirelson', tsX, sBarY - 12);
```

- [ ] **Step 2:** Add `will-change: transform` to the canvas container.
- [ ] **Step 3:** Commit: `feat: upgrade post-selection demo gauge (Beat 5)`

---

## Chunk 3: Wiring — main.js, scroll.js, timeline

### Task 11: Rewrite main.js

**Files:**
- Rewrite: `js/main.js`

- [ ] **Step 1:** Rewrite `js/main.js`:

```javascript
// chshlab/js/main.js
// Entrypoint: KaTeX, smooth scroll, module loading, timeline, permalink restore

import { paramsToState, initMicroInteractions } from './animation-config.js';

// ── KATEX ──
function initKaTeX() {
  if (typeof katex === 'undefined') return;
  document.querySelectorAll('.math-display').forEach(el => {
    const latex = el.dataset.latex;
    if (latex) katex.render(latex, el, { displayMode: true, throwOnError: false });
  });
}

// ── SMOOTH SCROLL ──
function initSmoothScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollToPlugin === 'undefined') return;
  gsap.registerPlugin(ScrollToPlugin);
  document.querySelectorAll('.nav__links a, .nav__logo').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) gsap.to(window, { scrollTo: { y: target, offsetY: 52 }, duration: 0.8, ease: 'power2.inOut' });
    });
  });
}

// ── READOUT TICK ──
function initReadoutTick() {
  document.querySelectorAll('.readout-value').forEach(el => {
    const observer = new MutationObserver(() => {
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 150);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  });
}

// ── SLIDER A11Y ──
function enhanceSliderA11y() {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    if (!slider.getAttribute('aria-label')) {
      const label = slider.closest('.demo-slider-row')?.querySelector('label');
      if (label) slider.setAttribute('aria-label', label.textContent.replace(/:\s*\d.*$/, ''));
    }
    slider.setAttribute('aria-valuemin', slider.min);
    slider.setAttribute('aria-valuemax', slider.max);
    slider.setAttribute('aria-valuenow', slider.value);
    slider.addEventListener('input', () => slider.setAttribute('aria-valuenow', slider.value));
  });
}

// ── TIMELINE (Beat 7) ──
function initTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  const line = document.createElement('div');
  line.className = 'timeline-line';
  container.appendChild(line);

  const nodes = [
    { year: '1964', title: 'Bell', note: 'Inequality derived; all detectors assumed perfect.', status: 'established' },
    { year: '1969', title: 'CHSH', note: 'Testable form; \u03b7 issue implicit.', status: 'established' },
    { year: '1982', title: 'Aspect', note: 'First convincing test; locality loophole addressed.', status: 'established' },
    { year: '1993', title: 'Eberhard', note: '\u03b7_c \u2248 82.8% proven necessary.', status: 'established' },
    { year: '2015', title: 'Loophole-free', note: 'Delft, NIST, Vienna: high-\u03b7 + spacelike separation.', status: 'resolved' },
    { year: '2025', title: 'Wang et al.', note: 'S=2.275 claimed at \u03b7\u224810\u207b\xb9\u2078.', status: 'contested' },
    { year: '2025', title: 'This rebuttal', note: 'Post-selection artifact characterised.', status: 'resolved' },
  ];

  nodes.forEach(n => {
    const node = document.createElement('div');
    node.className = 'timeline-node reveal';

    const year = document.createElement('span');
    year.className = 'timeline-node__year';
    year.textContent = n.year;

    const title = document.createElement('span');
    title.className = 'timeline-node__title';
    title.textContent = n.title;

    const note = document.createElement('p');
    note.className = 'timeline-node__note';
    note.textContent = n.note;

    const badge = document.createElement('span');
    badge.className = 'timeline-node__badge timeline-node__badge--' + n.status;
    badge.textContent = n.status;

    node.appendChild(year);
    node.appendChild(title);
    node.appendChild(note);
    node.appendChild(badge);
    container.appendChild(node);
  });
}

// ── DEMO EXPORT (kept feature) ──
function initDemoExport() {
  document.querySelectorAll('.figure-interactive').forEach(panel => {
    const controls = panel.querySelector('.figure-controls');
    if (!controls) return;

    const wrap = document.createElement('div');
    wrap.className = 'demo-export-btns';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'demo-export-btn';
    exportBtn.textContent = 'Export JSON';
    exportBtn.addEventListener('click', () => {
      const sliders = {};
      panel.querySelectorAll('input[type="range"]').forEach(s => { sliders[s.id] = s.value; });
      const readouts = {};
      panel.querySelectorAll('.readout-value').forEach(r => { readouts[r.id] = r.textContent; });
      const blob = new Blob([JSON.stringify({ demo: panel.id, timestamp: new Date().toISOString(), sliders, readouts }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'chsh-state.json'; a.click();
      URL.revokeObjectURL(url);
    });

    const linkBtn = document.createElement('button');
    linkBtn.className = 'demo-export-btn';
    linkBtn.textContent = 'Copy Link';
    linkBtn.addEventListener('click', () => {
      const params = new URLSearchParams();
      params.set('fig', panel.id);
      panel.querySelectorAll('input[type="range"]').forEach(s => params.set(s.id, s.value));
      const url = window.location.origin + window.location.pathname + '?' + params.toString();
      navigator.clipboard.writeText(url).then(() => {
        linkBtn.textContent = 'Copied!';
        setTimeout(() => { linkBtn.textContent = 'Copy Link'; }, 1500);
      });
    });

    wrap.appendChild(exportBtn);
    wrap.appendChild(linkBtn);
    controls.appendChild(wrap);
  });
}

// ── PERMALINK RESTORE ──
function restoreFromPermalink() {
  const state = paramsToState();
  if (!state.fig) return;
  Object.entries(state).forEach(([key, val]) => {
    if (key === 'fig') return;
    const slider = document.getElementById(key);
    if (slider && slider.type === 'range') {
      slider.value = val;
      slider.dispatchEvent(new Event('input'));
    }
  });
}

// ── KEYBOARD SHORTCUTS ──
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close any open drawers/overlays
      document.querySelectorAll('[aria-expanded="true"]').forEach(el => {
        el.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// ── MAIN INIT ──
window.addEventListener('load', async () => {
  if (typeof gsap !== 'undefined') {
    gsap.to(document.body, { opacity: 1, duration: 0.4, ease: 'power1.out' });
  } else {
    document.body.style.opacity = '1';
  }

  initKaTeX();
  initSmoothScroll();
  initReadoutTick();
  initTimeline();
  initDemoExport();
  enhanceSliderA11y();
  initKeyboardShortcuts();

  // Dynamic imports with error handling
  async function safeImport(path, initName) {
    try {
      const mod = await import(path);
      if (mod[initName]) mod[initName]();
    } catch (e) {
      console.warn('Module load failed:', path, e);
    }
  }

  const { initStarfield } = await import('./starfield.js').catch(() => ({ initStarfield: null }));
  if (initStarfield) initStarfield();

  const { initScroll } = await import('./scroll.js').catch(() => ({ initScroll: null }));
  if (initScroll) initScroll();

  await safeImport('./fig-bell-test.js', 'initBellTest');
  await safeImport('./fig-gauge.js', 'initGauge');
  await safeImport('./demo-efficiency.js', 'initEfficiencyDemo');
  await safeImport('./fig-event-stream.js', 'initEventStream');
  await safeImport('./demo-postselect.js', 'initPostSelectDemo');
  await safeImport('./demo-chsh.js', 'initAngleDemo');
  await safeImport('./sonification.js', 'initSonification');
  await safeImport('./references.js', 'initReferences');

  initMicroInteractions();
  restoreFromPermalink();
});
```

- [ ] **Step 2:** Verify: page loads, all figures initialize, no console errors.
- [ ] **Step 3:** Commit: `feat: rewrite main.js for narrative architecture`

---

### Task 12: Update scroll.js

**Files:**
- Modify: `js/scroll.js`

- [ ] **Step 1:** Update scroll.js to:
  - Target `.beat` sections instead of old section IDs
  - Update nav active link tracking for new nav hrefs
  - Remove references to deleted sections
  - Keep `.reveal` catch-all handler (still used in new markup)
  - Keep section-rule scaleX animation

- [ ] **Step 2:** Commit: `feat: update scroll.js for beat-based sections`

---

## Chunk 4: Paper Page

### Task 13: Create paper.html

**Files:**
- Create: `paper.html`
- Create: `css/paper.css`

- [ ] **Step 1:** Create `css/paper.css`:

```css
/* chshlab/css/paper.css — distill.pub-style article layout */

.paper-banner {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-faint);
  text-align: center;
}

.paper-banner a { color: var(--amber); }

.paper-layout {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

@media (min-width: 1100px) {
  .paper-layout {
    grid-template-columns: 180px 700px 1fr;
    gap: var(--space-5);
  }
}

/* ToC sidebar */
.paper-toc {
  position: sticky;
  top: var(--space-6);
  align-self: start;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.8;
}

.paper-toc a {
  color: var(--text-faint);
  text-decoration: none;
  display: block;
  padding: 2px 0;
  transition: color 0.15s;
}

.paper-toc a:hover,
.paper-toc a.toc-active { color: var(--amber); }

@media (max-width: 1099px) {
  .paper-toc {
    position: static;
    margin-bottom: var(--space-5);
    border: 1px solid var(--border);
    padding: var(--space-3);
  }
}

/* Article body */
.paper-article {
  max-width: 700px;
  line-height: 1.85;
}

.paper-article h1 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  margin-bottom: var(--space-3);
}

.paper-article h2 {
  font-size: clamp(1.3rem, 2vw, 1.8rem);
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
  counter-increment: section;
}

.paper-article h2::before {
  content: counter(section) ". ";
  color: var(--text-faint);
}

.paper-article h3 {
  font-size: 1.1rem;
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}

.paper-article p {
  margin-bottom: var(--space-3);
}

.paper-byline {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-faint);
  margin-bottom: var(--space-5);
}

.paper-abstract {
  border-left: 3px solid var(--amber);
  padding-left: var(--space-4);
  margin-bottom: var(--space-6);
  font-style: italic;
  color: var(--text-muted);
}

/* Sidenotes */
.sidenote {
  font-size: 0.78rem;
  color: var(--text-faint);
  line-height: 1.5;
}

@media (min-width: 1100px) {
  .sidenote {
    position: absolute;
    right: -220px;
    width: 200px;
    margin-top: 0;
  }
}

@media (max-width: 1099px) {
  .sidenote {
    display: block;
    margin: var(--space-2) 0 var(--space-2) var(--space-4);
    padding: var(--space-2);
    border-left: 1px solid var(--border);
  }
}

/* Paper figures — smaller inline */
.paper-figure {
  margin-block: var(--space-4);
  max-width: 500px;
}

.paper-figure canvas,
.paper-figure svg {
  width: 100%;
  will-change: transform;
}

/* Counter reset */
.paper-article { counter-reset: section; }
```

- [ ] **Step 2:** Create `paper.html`. The full paper content is converted from `paper.tex` (located at `../meatheadphysicist/projects/bell-inequality/paper/paper.tex`). The HTML structure:

```html
<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bell Violations Without Entanglement? A Reproducible Rebuttal — Meshal Alawein</title>
  <meta name="description" content="A classical hidden-variable model with post-selection produces S = 3.716, exceeding the Tsirelson bound. Formal paper with proofs and diagnostics." />
  <meta name="author" content="Meshal Alawein" />
  <link rel="canonical" href="https://chshlab.meshal.ai/paper.html" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="Bell Violations Without Entanglement? A Reproducible Rebuttal" />
  <meta property="og:description" content="A classical hidden-variable model with post-selection produces S = 3.716. Formal paper." />
  <meta property="article:author" content="Meshal Alawein" />
  <meta property="article:published_time" content="2025-01-01" />

  <script>document.documentElement.classList.remove('no-js');</script>

  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/paper.css" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
</head>
<body>
  <div class="paper-banner">
    This is the formal paper. <a href="index.html">Visit the interactive experience &rarr;</a>
  </div>

  <div class="paper-layout">
    <!-- ToC -->
    <nav class="paper-toc" aria-label="Table of contents" id="paperToc">
      <a href="#abstract">Abstract</a>
      <a href="#introduction">Introduction</a>
      <a href="#theory">Theoretical Background</a>
      <a href="#methods">Methods</a>
      <a href="#results">Results</a>
      <a href="#discussion">Discussion</a>
      <a href="#conclusion">Conclusion</a>
      <a href="#appendix">Appendix</a>
      <a href="#paper-references">References</a>
    </nav>

    <!-- Article -->
    <article class="paper-article">
      <h1>Bell Violations Without Entanglement?<br>A Reproducible Rebuttal of Wang et al. (2025)</h1>
      <p class="paper-byline">
        <a href="https://www.meshal.ai">Meshal Alawein</a> &middot; UC Berkeley &middot;
        <a href="mailto:contact@meshal.ai">contact@meshal.ai</a>
      </p>

      <div class="paper-abstract" id="abstract">
        <p>
          A recent paper in <em>Science Advances</em> claims to demonstrate Bell-inequality
          violation without entanglement. We argue that the reported result &mdash; a CHSH value
          of S = 2.275 &plusmn; 0.057 obtained at a detection efficiency of roughly 10<sup>&minus;18</sup>
          &mdash; does not support this conclusion. When acceptance rates drop this low,
          outcome-dependent selection can inflate CHSH statistics regardless of whether the
          underlying source is quantum, classical, or separable. We demonstrate this with explicit
          simulations: a purely classical hidden-variable model, subjected to similar post-selection,
          yields S = 3.716 (95% CI: [3.714, 3.717]), well above both the classical bound (S &le; 2)
          and the Tsirelson bound (S &le; 2&radic;2 &approx; 2.83). We provide a straightforward
          diagnostic protocol for future experiments.
        </p>
      </div>

      <h2 id="introduction">Introduction</h2>
      <!-- Content from paper.tex Section 1 — converted to HTML with inline DOI links -->
      <p>
        Bell&rsquo;s theorem has a clean statement: local hidden-variable theories cannot reproduce
        all the correlations predicted by quantum mechanics
        (<a href="https://doi.org/10.1103/PhysicsPhysique.1.195">Bell, 1964</a>). The CHSH
        inequality gives this theorem an operational form:
      </p>
      <div class="math-block">
        <span class="math-display" data-latex="S = |E(a,b) + E(a,b') + E(a',b) - E(a',b')| \leq 2"></span>
      </div>
      <!-- ... remainder of Introduction from paper.tex ... -->

      <h2 id="theory">Theoretical Background</h2>
      <h3>The CHSH Inequality</h3>
      <!-- Content from paper.tex Section 2.1 -->

      <h3>Why Post-Selection Matters</h3>
      <!-- Content from paper.tex Section 2.2 -->

      <h3>The Detection Loophole</h3>
      <!-- Content from paper.tex Section 2.3, including efficiency figure -->
      <div class="paper-figure">
        <svg id="paperEfficiencySvg" viewBox="0 0 500 250" aria-label="Efficiency landscape" role="img"></svg>
      </div>

      <h2 id="methods">Methods</h2>
      <h3>Simulation Framework</h3>
      <!-- Content from paper.tex Section 3.1 -->

      <h3>Post-Selection Model</h3>
      <!-- Content from paper.tex Section 3.2 -->

      <h2 id="results">Results</h2>
      <h3>Classical Baseline</h3>
      <!-- Content from paper.tex Section 4.1 -->

      <h3>Post-Selected Results</h3>
      <!-- Content from paper.tex Section 4.2, including post-selection figure -->
      <div class="paper-figure">
        <canvas id="paperPostSelectCanvas" width="500" height="250"></canvas>
      </div>

      <h3>Comparison with Quantum Mechanics</h3>
      <!-- Content from paper.tex Section 4.3, including angle sweep figure -->
      <div class="paper-figure">
        <canvas id="paperChshCanvas" width="500" height="300"></canvas>
      </div>

      <h2 id="discussion">Discussion</h2>
      <h3>What Makes a Bell Test Convincing?</h3>
      <!-- Content from paper.tex Section 5.1 -->

      <h3>A Diagnostic Protocol</h3>
      <!-- Content from paper.tex Section 5.2 -->

      <h2 id="conclusion">Conclusion</h2>
      <!-- Content from paper.tex Section 6 -->

      <h2 id="appendix">Appendix: Detection Efficiency Threshold Derivation</h2>
      <!-- Content from paper.tex Appendix A -->
      <div class="math-block">
        <span class="math-display" data-latex="S_{\text{LHV}}(\eta) = \frac{4}{\eta} - 2"></span>
      </div>

      <h2 id="paper-references">References</h2>
      <ol class="references-list" id="paperReferencesList"></ol>
    </article>
  </div>

  <script type="module">
    // Paper-page JS: KaTeX + references + embedded figures
    import { initReferences } from './js/references.js';

    window.addEventListener('load', () => {
      document.body.style.opacity = '1';

      // KaTeX
      if (typeof katex !== 'undefined') {
        document.querySelectorAll('.math-display').forEach(el => {
          const latex = el.dataset.latex;
          if (latex) katex.render(latex, el, { displayMode: true, throwOnError: false });
        });
      }

      // References (targets #paperReferencesList)
      const list = document.getElementById('paperReferencesList');
      if (list) {
        // Reuse references module by temporarily swapping the list ID
        const mainList = document.getElementById('referencesList');
        list.id = 'referencesList';
        initReferences();
        list.id = 'paperReferencesList';
        if (mainList) mainList.id = 'referencesList';
      }

      // ToC scroll spy
      const tocLinks = document.querySelectorAll('.paper-toc a');
      const sections = document.querySelectorAll('.paper-article h2[id]');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            tocLinks.forEach(l => l.classList.remove('toc-active'));
            const active = document.querySelector('.paper-toc a[href="#' + e.target.id + '"]');
            if (active) active.classList.add('toc-active');
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px' });
      sections.forEach(s => observer.observe(s));
    });
  </script>
</body>
</html>
```

**Note:** The `<!-- Content from paper.tex ... -->` comments indicate where the implementer must convert the corresponding LaTeX sections to semantic HTML prose. The full source is at `../meatheadphysicist/projects/bell-inequality/paper/paper.tex`. Each section should preserve all equations (as `data-latex` spans), inline DOI links for all citations, and the same paragraph structure.

- [ ] **Step 3:** Verify: paper.html loads independently, math renders, ToC scroll-spy works.
- [ ] **Step 4:** Commit: `feat: add paper.html — distill.pub-style formal article`

---

## Chunk 5: SEO & Final Polish

### Task 14: SEO meta tags

**Files:**
- Modify: `index.html` `<head>`

- [ ] **Step 1:** Replace the `<head>` content of index.html with:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bell Violations Without Entanglement? A Reproducible Rebuttal — CHSH Lab</title>
  <meta name="description" content="Wang et al. (2025) claimed Bell violation without entanglement. A classical model with post-selection produces S = 3.716 — exceeding even the quantum limit. Interactive proofs and simulations by Meshal Alawein." />
  <meta name="author" content="Meshal Alawein" />
  <meta name="keywords" content="Bell inequality, CHSH, detection loophole, post-selection bias, quantum nonlocality, Bell test, Tsirelson bound, Wang et al 2025, rebuttal" />
  <link rel="canonical" href="https://chshlab.meshal.ai" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="Bell Violations Without Entanglement? A Reproducible Rebuttal" />
  <meta property="og:description" content="Wang et al. (2025) claimed Bell violation without entanglement. A classical model with post-selection produces S = 3.716. Interactive proofs." />
  <meta property="og:url" content="https://chshlab.meshal.ai" />
  <meta property="og:site_name" content="CHSH Lab" />
  <meta property="og:image" content="https://chshlab.meshal.ai/assets/figures/fig1_chsh_bounds.png" />
  <meta property="article:author" content="Meshal Alawein" />
  <meta property="article:published_time" content="2025-01-01" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Bell Violations Without Entanglement? A Reproducible Rebuttal" />
  <meta name="twitter:description" content="A classical model with post-selection produces S = 3.716. Interactive proofs by Meshal Alawein." />
  <meta name="twitter:image" content="https://chshlab.meshal.ai/assets/figures/fig1_chsh_bounds.png" />

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "name": "Bell Violations Without Entanglement? A Reproducible Rebuttal of Wang et al. (2025)",
    "author": { "@type": "Person", "name": "Meshal Alawein", "url": "https://www.meshal.ai" },
    "description": "A classical hidden-variable model with outcome-dependent post-selection produces CHSH S = 3.716, exceeding the Tsirelson bound. Interactive proofs and simulations.",
    "url": "https://chshlab.meshal.ai",
    "datePublished": "2025-01-01",
    "about": ["Bell inequality", "CHSH inequality", "detection loophole", "quantum nonlocality", "post-selection"],
    "isBasedOn": {
      "@type": "ScholarlyArticle",
      "name": "Bell inequality violation without entanglement",
      "author": "Wang et al.",
      "url": "https://doi.org/10.1126/sciadv.ads0058"
    },
    "citation": [
      { "@type": "ScholarlyArticle", "name": "On the Einstein-Podolsky-Rosen paradox", "author": "J.S. Bell", "datePublished": "1964" },
      { "@type": "ScholarlyArticle", "name": "Proposed experiment to test local hidden-variable theories", "author": "Clauser, Horne, Shimony, Holt", "datePublished": "1969" },
      { "@type": "ScholarlyArticle", "name": "Background level and counter efficiencies required for a loophole-free EPR experiment", "author": "P.H. Eberhard", "datePublished": "1993" }
    ]
  }
  </script>

  <script>document.documentElement.classList.remove('no-js');</script>

  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/layout.css" />
  <link rel="stylesheet" href="css/components.css" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>

  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js"></script>
</head>
```

- [ ] **Step 2:** paper.html already has its own SEO meta tags (written in Task 13).
- [ ] **Step 3:** Commit: `feat: SEO meta tags and structured data`

---

### Task 15: Accessibility & reduced-motion pass

**Files:**
- Modify: `css/base.css`

- [ ] **Step 1:** Ensure `prefers-reduced-motion` block covers all new elements:
  - `.figure-wrap canvas`: no animation
  - `.beat` elements: visible immediately (no reveal)
  - Gauge markers: appear instantly

- [ ] **Step 2:** Verify all interactive figures have aria-labels and live regions.
- [ ] **Step 3:** Commit: `fix: accessibility and reduced-motion guards`

---

### Task 16: Final verification & cleanup

- [ ] **Step 1:** Test at 1440px and 375px widths — all beats readable, figures functional.
- [ ] **Step 2:** Test all inline DOI links resolve correctly.
- [ ] **Step 3:** Test paper.html loads and renders independently.
- [ ] **Step 4:** Run Lighthouse audit — check performance score, accessibility score.
- [ ] **Step 5:** Commit any remaining fixes.
- [ ] **Step 6:** Final commit: `chore: narrative upgrade complete`
