import { copyText, paramsToState } from './animation-config.js';

function setTemporaryButtonLabel(button, label) {
  const originalLabel = button.dataset.label || button.textContent;
  button.textContent = label;

  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1500);
}

export function initReadoutTick() {
  document.querySelectorAll('.readout-value').forEach((element) => {
    const observer = new MutationObserver(() => {
      element.classList.add('tick');
      window.setTimeout(() => element.classList.remove('tick'), 150);
    });

    observer.observe(element, { childList: true, characterData: true, subtree: true });
  });
}

export function enhanceSliderA11y() {
  document.querySelectorAll('input[type="range"]').forEach((slider) => {
    if (!slider.getAttribute('aria-label')) {
      const label = slider.closest('.demo-slider-row')?.querySelector('label');
      if (label) {
        slider.setAttribute('aria-label', label.textContent.replace(/:\s*\d.*$/, ''));
      }
    }

    slider.setAttribute('aria-valuemin', slider.min);
    slider.setAttribute('aria-valuemax', slider.max);
    slider.setAttribute('aria-valuenow', slider.value);
    slider.addEventListener('input', () => slider.setAttribute('aria-valuenow', slider.value));
  });
}

export function initDemoExport() {
  document.querySelectorAll('.figure-interactive').forEach((panel) => {
    const controls = panel.querySelector('.figure-controls');
    if (!controls) return;

    const wrap = document.createElement('div');
    wrap.className = 'demo-export-btns';

    const exportButton = document.createElement('button');
    exportButton.className = 'demo-export-btn';
    exportButton.textContent = 'Export JSON';
    exportButton.addEventListener('click', () => {
      const sliders = {};
      panel.querySelectorAll('input[type="range"]').forEach((slider) => {
        sliders[slider.id] = slider.value;
      });

      const readouts = {};
      panel.querySelectorAll('.readout-value').forEach((readout) => {
        readouts[readout.id] = readout.textContent;
      });

      const blob = new Blob([JSON.stringify({
        demo: panel.id,
        timestamp: new Date().toISOString(),
        sliders,
        readouts,
      }, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chsh-state.json';
      link.click();
      URL.revokeObjectURL(url);
    });

    const linkButton = document.createElement('button');
    linkButton.className = 'demo-export-btn';
    linkButton.textContent = 'Copy Link';
    linkButton.dataset.label = linkButton.textContent;
    linkButton.addEventListener('click', () => {
      const params = new URLSearchParams();
      params.set('fig', panel.id);
      panel.querySelectorAll('input[type="range"]').forEach((slider) => {
        params.set(slider.id, slider.value);
      });

      const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      (async () => {
        try {
          await copyText(url);
          setTemporaryButtonLabel(linkButton, 'Copied!');
        } catch (error) {
          console.error('Copy link failed', error);
          setTemporaryButtonLabel(linkButton, 'Copy failed');
        }
      })();
    });

    const shareButton = document.createElement('a');
    shareButton.className = 'demo-export-btn';
    shareButton.textContent = 'Share';
    shareButton.target = '_blank';
    shareButton.rel = 'noopener noreferrer';
    shareButton.addEventListener('click', (e) => {
      const params = new URLSearchParams();
      params.set('fig', panel.id);
      panel.querySelectorAll('input[type="range"]').forEach((slider) => {
        params.set(slider.id, slider.value);
      });
      const permalink = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      shareButton.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(permalink)}`;
    });

    wrap.appendChild(exportButton);
    wrap.appendChild(linkButton);
    wrap.appendChild(shareButton);
    controls.appendChild(wrap);
  });
}

export function restoreFromPermalink() {
  const state = paramsToState();
  if (!state.fig) return;

  Object.entries(state).forEach(([key, value]) => {
    if (key === 'fig') return;

    const slider = document.getElementById(key);
    if (!slider || slider.type !== 'range') return;

    slider.value = value;
    slider.dispatchEvent(new Event('input'));
  });
}
