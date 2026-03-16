# Performance Budget

Targets and audit checklist for CHSH Lab deployments.

---

## JS Payload

| Category | Target | Notes |
|---|---|---|
| Custom JS (all modules) | < 40 KB total | GSAP/KaTeX CDN excluded |
| main.js | < 8 KB | Entrypoint, tabs, scroll, keyboard |
| story-mode.js | < 6 KB | Story mode overlay |
| demo-*.js (3 files) | < 5 KB each | Canvas/SVG rendering |
| animation-config.js | < 2 KB | Event bus, micro-interactions |
| provenance-data.js | < 4 KB | Static metadata |
| sonification.js | < 2 KB | Web Audio tones |
| scroll.js | < 6 KB | GSAP ScrollTrigger choreography |
| starfield.js | < 3 KB | Particle system |
| annotations.js + redpen.js | < 4 KB combined | Hotspots and marks |

## Animation Frame Budget

- All continuous animations must sustain **60 fps** on mid-range mobile
- Test with Chrome DevTools throttled 4x CPU slowdown
- GPU-composited properties only for continuous: `transform`, `opacity`
- No forced reflows during animation frames (no `offsetWidth`, `getBoundingClientRect` in render loops)
- Canvas demos: clear + redraw should complete within 8ms per frame

## Asset Size

| Asset | Target |
|---|---|
| Each figure PNG | < 150 KB |
| Total page weight (excluding CDN) | < 2 MB |
| CSS total | < 20 KB |
| HTML | < 15 KB |

## Lazy Loading

- All figure images below the fold use `loading="lazy"` on `<img>`
- Story mode overlay is created on demand (not in initial HTML)
- Bound Explorer panel is created on demand via JS
- Timeline nodes are created on demand via JS
- Provenance drawers are created on demand via JS
- `AudioContext` created only on first sonification unmute

## CDN Dependencies

| Library | Version | Size (gzip) |
|---|---|---|
| GSAP | 3.12.5 | ~30 KB |
| ScrollTrigger | 3.12.5 | ~12 KB |
| ScrollToPlugin | 3.12.5 | ~3 KB |
| KaTeX | 0.16.9 | ~90 KB (CSS + JS) |
| Google Fonts | 3 families | ~40 KB |

---

## Pre-Deploy Audit Checklist

1. [ ] **No console errors** on load — open DevTools console, reload, check
2. [ ] **JS payload** — run `wc -c js/*.js` and verify total < 40 KB
3. [ ] **Figure sizes** — run `ls -la assets/figures/` and verify each < 150 KB
4. [ ] **Lighthouse Performance** >= 90 on mobile (Chrome DevTools)
5. [ ] **CLS (Cumulative Layout Shift)** < 0.1 — check via Lighthouse or Web Vitals
6. [ ] **FCP (First Contentful Paint)** < 1.5s on 4G (simulated)
7. [ ] **60 fps animations** — enable FPS meter in Chrome DevTools, scroll through all sections
8. [ ] **`prefers-reduced-motion`** — enable in OS settings, verify all animations skip to final state
9. [ ] **No horizontal overflow** on 375px viewport — resize browser or use DevTools device toolbar
10. [ ] **Lazy images** — verify `loading="lazy"` present on all figure images in source

---

## Performance Monitoring

After deploy, check:
- Vercel Analytics (if enabled) for real-user performance data
- Core Web Vitals in Google Search Console
- First-visit experience on mobile data connection
