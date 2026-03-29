// tests/page-timeline.test.js
import { describe, it, expect, afterEach } from 'vitest';
import { cleanDOM, makeEl } from './setup.js';
import { initTimeline } from '../js/page-timeline.js';

afterEach(() => cleanDOM());

describe('initTimeline', () => {
  it('generates 7 timeline nodes', () => {
    makeEl('div', { id: 'timelineContainer' });

    initTimeline();

    const nodes = document.querySelectorAll('.timeline-node');
    expect(nodes.length).toBe(7);
  });

  it('creates timeline line element', () => {
    makeEl('div', { id: 'timelineContainer' });

    initTimeline();

    const line = document.querySelector('.timeline-line');
    expect(line).not.toBeNull();
  });

  it('each node has year, title, note, and badge', () => {
    makeEl('div', { id: 'timelineContainer' });

    initTimeline();

    const nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach((node) => {
      expect(node.querySelector('.timeline-node__year')).not.toBeNull();
      expect(node.querySelector('.timeline-node__title')).not.toBeNull();
      expect(node.querySelector('.timeline-node__note')).not.toBeNull();
      expect(node.querySelector('.timeline-node__badge')).not.toBeNull();
    });
  });

  it('first node is Bell 1964', () => {
    makeEl('div', { id: 'timelineContainer' });

    initTimeline();

    const firstNode = document.querySelector('.timeline-node');
    expect(firstNode.querySelector('.timeline-node__year').textContent).toBe('1964');
    expect(firstNode.querySelector('.timeline-node__title').textContent).toBe('Bell');
  });

  it('last node is "This rebuttal" 2025', () => {
    makeEl('div', { id: 'timelineContainer' });

    initTimeline();

    const nodes = document.querySelectorAll('.timeline-node');
    const lastNode = nodes[nodes.length - 1];
    expect(lastNode.querySelector('.timeline-node__year').textContent).toBe('2025');
    expect(lastNode.querySelector('.timeline-node__title').textContent).toBe('This rebuttal');
  });

  it('badges have correct status classes', () => {
    makeEl('div', { id: 'timelineContainer' });

    initTimeline();

    const badges = document.querySelectorAll('.timeline-node__badge');
    // First 3 are "established", 5th is "resolved", 6th is "contested", 7th is "resolved"
    expect(badges[0].classList.contains('timeline-node__badge--established')).toBe(true);
    expect(badges[5].classList.contains('timeline-node__badge--contested')).toBe(true);
    expect(badges[6].classList.contains('timeline-node__badge--resolved')).toBe(true);
  });

  it('each node has .reveal class for scroll animation', () => {
    makeEl('div', { id: 'timelineContainer' });

    initTimeline();

    const nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach((node) => {
      expect(node.classList.contains('reveal')).toBe(true);
    });
  });

  it('returns silently when container is missing', () => {
    expect(() => initTimeline()).not.toThrow();
  });
});
