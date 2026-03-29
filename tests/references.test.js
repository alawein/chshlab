// tests/references.test.js
import { describe, it, expect, afterEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';
import { REFS, initReferences } from '../js/references.js';

afterEach(() => cleanDOM());

describe('REFS', () => {
  it('contains 12 references', () => {
    expect(REFS.length).toBe(12);
  });

  it('starts with Bell 1964', () => {
    expect(REFS[0].key).toBe('bell1964');
    expect(REFS[0].year).toBe(1964);
    expect(REFS[0].authors).toContain('Bell');
  });

  it('ends with Wang 2025', () => {
    const last = REFS[REFS.length - 1];
    expect(last.key).toBe('wang2025');
    expect(last.year).toBe(2025);
  });

  it('every reference has required fields', () => {
    REFS.forEach((ref) => {
      expect(ref.key).toBeTruthy();
      expect(ref.authors).toBeTruthy();
      expect(ref.year).toBeGreaterThan(1900);
      expect(ref.title).toBeTruthy();
      expect(ref.journal).toBeTruthy();
      expect(ref.doi).toMatch(/^https:\/\/doi\.org\//);
    });
  });

  it('references are in chronological order', () => {
    for (let i = 1; i < REFS.length; i++) {
      expect(REFS[i].year).toBeGreaterThanOrEqual(REFS[i - 1].year);
    }
  });
});

describe('initReferences', () => {
  it('populates #referencesList with 12 items', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    const items = document.querySelectorAll('.reference-item');
    expect(items.length).toBe(12);
  });

  it('each item has an id matching ref-{key}', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    REFS.forEach((ref) => {
      const item = document.getElementById('ref-' + ref.key);
      expect(item).not.toBeNull();
    });
  });

  it('each item has a DOI link with target=_blank', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    const links = document.querySelectorAll('.reference-item a');
    expect(links.length).toBe(12);
    links.forEach((link) => {
      expect(link.textContent).toBe('DOI');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.href).toMatch(/^https:\/\/doi\.org\//);
    });
  });

  it('each item has journal name in <em> tag', () => {
    makeEl('ol', { id: 'referencesList' });

    initReferences();

    const italics = document.querySelectorAll('.reference-item em');
    expect(italics.length).toBe(12);
  });

  it('returns silently when #referencesList is missing', () => {
    expect(() => initReferences()).not.toThrow();
  });
});
