import { describe, it, expect, afterEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';
import { REFS, initReferences } from '../js/references.js';

afterEach(() => cleanDOM());

describe('REFS', () => {
  it('contains the canonical 21-entry bibliography', () => {
    expect(REFS.length).toBe(21);
  });

  it('starts with Bell 1964 and ends with Vieira 2025', () => {
    expect(REFS[0].key).toBe('bell1964');
    expect(REFS[0].year).toBe(1964);

    const last = REFS[REFS.length - 1];
    expect(last.key).toBe('vieira2025');
    expect(last.year).toBe(2025);
  });

  it('includes the current Wang rebuttal cluster', () => {
    const keys = REFS.map((ref) => ref.key);
    expect(keys).toContain('wang2025');
    expect(keys).toContain('wharton2025');
    expect(keys).toContain('wojcik2025');
    expect(keys).toContain('cieslinski2025');
  });

  it('every reference has the required display fields', () => {
    REFS.forEach((ref) => {
      expect(ref.key).toBeTruthy();
      expect(ref.authors).toBeTruthy();
      expect(ref.year).toBeGreaterThan(1900);
      expect(ref.title).toBeTruthy();
      expect(ref.journal).toBeTruthy();
      expect(ref.details).toBeTruthy();
      expect(ref.href).toMatch(/^https:\/\//);
    });
  });

  it('uses the corrected Wang 2025 title and DOI', () => {
    const wang = REFS.find((ref) => ref.key === 'wang2025');
    expect(wang.title).toBe('Violation of Bell inequality with unentangled photons');
    expect(wang.href).toBe('https://doi.org/10.1126/sciadv.adr1794');
  });
});

describe('initReferences', () => {
  it('populates #referencesList with 21 items', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    const items = document.querySelectorAll('.reference-item');
    expect(items.length).toBe(21);
  });

  it('each item has an id matching ref-{key}', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    REFS.forEach((ref) => {
      const item = document.getElementById('ref-' + ref.key);
      expect(item).not.toBeNull();
    });
  });

  it('each item renders a canonical external link', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    const links = document.querySelectorAll('.reference-item a');
    expect(links.length).toBe(21);
    links.forEach((link, index) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.href).toBe(REFS[index].href);
      expect(link.textContent).toBe(REFS[index].href);
    });
  });

  it('each item keeps the source container in an <em> tag', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    const italics = document.querySelectorAll('.reference-item em');
    expect(italics.length).toBe(21);
  });

  it('returns silently when #referencesList is missing', () => {
    expect(() => initReferences()).not.toThrow();
  });
});
