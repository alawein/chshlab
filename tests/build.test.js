// tests/build.test.js
// Validates the build script produces correct Vercel Build Output structure.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

describe('build.sh structure', () => {
  it('build.sh exists and is executable-looking', () => {
    const buildPath = join(ROOT, 'build.sh');
    expect(existsSync(buildPath)).toBe(true);

    const content = readFileSync(buildPath, 'utf-8');
    expect(content).toContain('#!/usr/bin/env bash');
    expect(content).toContain('.vercel/output');
    expect(content).toContain('config.json');
  });

  it('copies all required static directories', () => {
    const content = readFileSync(join(ROOT, 'build.sh'), 'utf-8');
    // All are in a single cp command: cp -r css js index.html paper.html 404.html
    expect(content).toContain('cp -r css js index.html paper.html 404.html');
  });

  it('generates valid config.json with clean URLs', () => {
    const content = readFileSync(join(ROOT, 'build.sh'), 'utf-8');
    // Extract the heredoc JSON
    const configMatch = content.match(/cat > .vercel\/output\/config\.json << 'CONF'\n(.*)\nCONF/s);
    expect(configMatch).not.toBeNull();

    const config = JSON.parse(configMatch[1]);
    expect(config.version).toBe(3);
    expect(config.cleanUrls).toBe(true);
    expect(config.trailingSlash).toBe(false);
  });

  it('config has security headers', () => {
    const content = readFileSync(join(ROOT, 'build.sh'), 'utf-8');
    const configMatch = content.match(/cat > .vercel\/output\/config\.json << 'CONF'\n(.*)\nCONF/s);
    const config = JSON.parse(configMatch[1]);

    const globalHeaders = config.headers.find(h => h.source === '/(.*)');
    expect(globalHeaders).toBeDefined();

    const headerMap = Object.fromEntries(globalHeaders.headers.map(h => [h.key, h.value]));
    expect(headerMap['X-Content-Type-Options']).toBe('nosniff');
    expect(headerMap['X-Frame-Options']).toBe('DENY');
    expect(headerMap['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('config has 1-year immutable cache for assets', () => {
    const content = readFileSync(join(ROOT, 'build.sh'), 'utf-8');
    const configMatch = content.match(/cat > .vercel\/output\/config\.json << 'CONF'\n(.*)\nCONF/s);
    const config = JSON.parse(configMatch[1]);

    const assetHeaders = config.headers.find(h => h.source === '/assets/(.*)');
    expect(assetHeaders).toBeDefined();

    const cacheHeader = assetHeaders.headers.find(h => h.key === 'Cache-Control');
    expect(cacheHeader.value).toContain('max-age=31536000');
    expect(cacheHeader.value).toContain('immutable');
  });

  it('config has HTML redirects (308)', () => {
    const content = readFileSync(join(ROOT, 'build.sh'), 'utf-8');
    const configMatch = content.match(/cat > .vercel\/output\/config\.json << 'CONF'\n(.*)\nCONF/s);
    const config = JSON.parse(configMatch[1]);

    expect(config.redirects.length).toBeGreaterThanOrEqual(2);
    const paperRedirect = config.redirects.find(r => r.source === '/paper.html');
    expect(paperRedirect.destination).toBe('/paper');
    expect(paperRedirect.statusCode).toBe(308);
  });
});

describe('source files exist', () => {
  const requiredFiles = [
    'index.html', 'paper.html', '404.html',
    'css/tokens.css', 'css/base.css', 'css/layout.css', 'css/components.css', 'css/paper.css',
    'js/main.js', 'js/animation-config.js', 'js/dashboard.js',
    'js/demo-chsh.js', 'js/demo-efficiency.js', 'js/demo-postselect.js',
  ];

  requiredFiles.forEach((file) => {
    it(`${file} exists`, () => {
      expect(existsSync(join(ROOT, file))).toBe(true);
    });
  });
});

describe('JS module imports are consistent', () => {
  it('main.js imports all expected modules', () => {
    const mainContent = readFileSync(join(ROOT, 'js/main.js'), 'utf-8');

    const expectedImports = [
      'animation-config',
      'katex-render',
      'page-navigation',
      'page-state',
      'page-timeline',
    ];

    expectedImports.forEach((mod) => {
      expect(mainContent).toContain(mod);
    });
  });

  it('main.js dynamically imports all demo modules', () => {
    const mainContent = readFileSync(join(ROOT, 'js/main.js'), 'utf-8');

    const dynamicImports = [
      'starfield', 'scroll', 'dashboard',
      'fig-bell-test', 'fig-gauge', 'demo-efficiency',
      'fig-event-stream', 'demo-postselect', 'demo-chsh',
      'sonification', 'references',
    ];

    dynamicImports.forEach((mod) => {
      expect(mainContent).toContain(mod);
    });
  });
});
