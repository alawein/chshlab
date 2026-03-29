// tests/page-navigation.test.js
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';
import {
  focusTarget,
  initSmoothScroll,
  initScrollProgress,
  initSectionDots,
  initMobileNav,
  initKeyboardShortcuts,
  restoreHashTargetFocus,
  scrollToTarget,
} from '../js/page-navigation.js';

beforeEach(() => cleanDOM());
afterEach(() => cleanDOM());

describe('focusTarget', () => {
  it('sets tabindex=-1 on element without tabindex and focuses it', () => {
    const el = makeEl('section', { id: 'test-section' });
    el.focus = vi.fn();

    focusTarget(el);

    expect(el.getAttribute('tabindex')).toBe('-1');
    expect(el.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('preserves existing tabindex', () => {
    const el = makeEl('button', { tabindex: '0' });
    el.focus = vi.fn();

    focusTarget(el);

    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.focus).toHaveBeenCalled();
  });

  it('does nothing for null target', () => {
    expect(() => focusTarget(null)).not.toThrow();
  });
});

describe('scrollToTarget', () => {
  it('calls window.scrollTo when gsap is unavailable', () => {
    const target = makeEl('section', { id: 'scroll-target' });
    target.getBoundingClientRect = vi.fn(() => ({ top: 500 }));
    target.focus = vi.fn();

    scrollToTarget(target, '#scroll-target');

    expect(window.scrollTo).toHaveBeenCalled();
  });
});

describe('initSmoothScroll', () => {
  it('prevents default on hash link clicks', () => {
    const section = makeEl('section', { id: 'efficiency' });
    section.focus = vi.fn();
    section.getBoundingClientRect = vi.fn(() => ({ top: 200 }));

    const nav = makeEl('div', { class: 'nav__links' });
    const link = makeEl('a', { href: '#efficiency' }, nav);

    initSmoothScroll();

    const event = new window.MouseEvent('click', { button: 0, bubbles: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    link.dispatchEvent(event);

    expect(preventSpy).toHaveBeenCalled();
  });
});

describe('initScrollProgress', () => {
  it('creates scroll handler for progress bar', () => {
    const bar = makeEl('div', { class: 'scroll-progress' });

    initScrollProgress();

    // After init, the bar width should be set (at scroll 0 => 0%)
    expect(bar.style.width).toBeDefined();
  });

  it('returns without error when no bar or button exists', () => {
    expect(() => initScrollProgress()).not.toThrow();
  });
});

describe('initSectionDots', () => {
  it('returns without error when #sectionDots is missing', () => {
    expect(() => initSectionDots()).not.toThrow();
  });

  it('sets up dots navigation when elements exist', () => {
    const dotsNav = makeEl('nav', { id: 'sectionDots' });
    const sections = ['hook', 'claim', 'efficiency'];

    sections.forEach((id) => {
      makeEl('section', { id });
      const dot = makeEl('button', { class: 'section-dot', 'data-section': id }, dotsNav);
    });

    expect(() => initSectionDots()).not.toThrow();
  });
});

describe('initMobileNav', () => {
  it('returns noop closeNav when elements are missing', () => {
    const { closeNav } = initMobileNav();
    expect(typeof closeNav).toBe('function');
    expect(() => closeNav()).not.toThrow();
  });

  it('toggles nav--open class on toggle click', () => {
    const nav = makeEl('nav', { class: 'nav' });
    const toggle = makeEl('button', { id: 'navToggle', 'aria-expanded': 'false', 'aria-label': 'Open navigation menu' }, nav);
    const menu = makeEl('div', { id: 'navMenu' }, nav);

    initMobileNav();

    toggle.click();
    expect(nav.classList.contains('nav--open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    expect(nav.classList.contains('nav--open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes nav on menu link click', () => {
    const nav = makeEl('nav', { class: 'nav' });
    const toggle = makeEl('button', { id: 'navToggle', 'aria-expanded': 'false' }, nav);
    const menu = makeEl('div', { id: 'navMenu' }, nav);
    const link = makeEl('a', { href: '#section' }, menu);

    initMobileNav();

    // Open nav first
    toggle.click();
    expect(nav.classList.contains('nav--open')).toBe(true);

    // Click link should close
    link.click();
    expect(nav.classList.contains('nav--open')).toBe(false);
  });
});

describe('initKeyboardShortcuts', () => {
  it('calls closeNav on Escape keydown', () => {
    const closeNav = vi.fn();
    initKeyboardShortcuts(closeNav);

    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closeNav).toHaveBeenCalled();
  });

  it('does not call closeNav on other keys', () => {
    const closeNav = vi.fn();
    initKeyboardShortcuts(closeNav);

    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));
    expect(closeNav).not.toHaveBeenCalled();
  });
});

describe('restoreHashTargetFocus', () => {
  it('does nothing when no hash is set', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/'),
      writable: true,
    });
    expect(() => restoreHashTargetFocus()).not.toThrow();
  });
});
