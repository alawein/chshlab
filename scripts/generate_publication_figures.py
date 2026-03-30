from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
WEB_OUT = ROOT / 'assets' / 'figures' / 'publication'
ARXIV_OUT = ROOT / 'arxiv' / 'figures'

BG = '#f7f4ee'
INK = '#1d2430'
MUTED = '#5f6773'
CRIMSON = '#9f3d3d'
AMBER = '#b8842f'
BLUE = '#3f7192'
GREEN = '#537a5a'
SAND = '#dfd5c5'

plt.rcParams.update({
    'figure.facecolor': BG,
    'axes.facecolor': BG,
    'axes.edgecolor': SAND,
    'axes.labelcolor': INK,
    'axes.titlecolor': INK,
    'text.color': INK,
    'xtick.color': MUTED,
    'ytick.color': MUTED,
    'grid.color': '#d8d1c5',
    'font.size': 11,
    'font.family': 'DejaVu Serif',
    'axes.spines.top': False,
    'axes.spines.right': False,
})


def ensure_dirs() -> None:
    WEB_OUT.mkdir(parents=True, exist_ok=True)
    ARXIV_OUT.mkdir(parents=True, exist_ok=True)



def save(fig: plt.Figure, name: str) -> None:
    for target in (WEB_OUT / name, ARXIV_OUT / name):
        fig.savefig(target, dpi=300, bbox_inches='tight', facecolor=BG)
        print(f'Wrote {target}')
    plt.close(fig)



def fig1_bounds() -> None:
    labels = [
        'Classical bound',
        'Wang et al. 2025',
        'Tsirelson bound',
        'Local toy model after selection',
    ]
    values = [2.0, 2.275, 2 * np.sqrt(2), 26 / 7]
    colors = [AMBER, BLUE, GREEN, CRIMSON]

    fig, ax = plt.subplots(figsize=(8.6, 4.6))
    y = np.arange(len(labels))
    ax.barh(y, values, color=colors, edgecolor=INK, linewidth=0.9)
    ax.set_yticks(y, labels)
    ax.invert_yaxis()
    ax.set_xlim(0, 4.05)
    ax.set_xlabel('CHSH value S')
    ax.set_title('Reference scales for the two papers')
    ax.grid(axis='x', linestyle='--', linewidth=0.8, alpha=0.8)
    ax.axvline(2.0, color=AMBER, linestyle='--', linewidth=1.2)
    ax.axvline(2 * np.sqrt(2), color=GREEN, linestyle=':', linewidth=1.3)

    for yi, value in enumerate(values):
        ax.text(min(value + 0.06, 3.92), yi, f'{value:.3f}', va='center', ha='left', fontsize=10)

    ax.text(2.02, -0.55, 'fair-sampling local ceiling', color=AMBER, fontsize=9)
    ax.text(2 * np.sqrt(2) + 0.03, 1.55, 'quantum ceiling', color=GREEN, fontsize=9)
    save(fig, 'publication_fig1_bounds.png')



def fig2_efficiency() -> None:
    fig, ax = plt.subplots(figsize=(8.6, 4.8))
    ax.set_xscale('log')
    ax.set_xlim(1e-19, 1.2)
    ax.set_ylim(0, 1)
    ax.set_yticks([])
    ax.set_xlabel('Effective efficiency or threshold')
    ax.set_title('Efficiency context for interpreting S > 2')
    ax.grid(axis='x', which='both', linestyle='--', linewidth=0.8, alpha=0.7)

    ax.axvspan(1e-19, 2 / 3, color=CRIMSON, alpha=0.08)
    ax.axvspan(2 / 3, 1.2, color=GREEN, alpha=0.05)

    markers = [
        ('Wang et al. reported eta ~ 1e-18', 1e-18, CRIMSON, 0.18),
        ('Eberhard 1993 threshold ~ 0.667', 2 / 3, AMBER, 0.40),
        ('Garg-Mermin threshold ~ 0.828', 2 / (1 + np.sqrt(2)), BLUE, 0.62),
        ('Unit efficiency', 1.0, MUTED, 0.84),
    ]

    for label, value, color, y in markers:
        ax.axvline(value, color=color, linewidth=2)
        ax.scatter([value], [y], s=42, color=color, zorder=3)
        ax.text(value * 1.06, y, label, color=color, va='center', fontsize=9)

    ax.text(1.4e-19, 0.92, 'selection-heavy regime', color=CRIMSON, fontsize=9)
    ax.text(0.72, 0.92, 'threshold regime for serious loophole control', color=GREEN, fontsize=9, ha='left')
    save(fig, 'publication_fig2_efficiency.png')



def fig3_postselection_curve() -> None:
    p_lo = np.linspace(0.0, 0.5, 400)
    s_sel = 4 * ((1.5 - 2 * p_lo) / (1.5 - p_lo))
    accept = 0.75 - 0.5 * p_lo

    fig, ax1 = plt.subplots(figsize=(8.6, 5.0))
    ax2 = ax1.twinx()

    ax1.plot(p_lo, s_sel, color=CRIMSON, linewidth=2.4, label='Selected S')
    ax2.plot(p_lo, accept, color=BLUE, linewidth=2.0, linestyle='--', label='Acceptance')

    ax1.axhline(2.0, color=AMBER, linestyle='--', linewidth=1.2)
    ax1.axhline(2 * np.sqrt(2), color=GREEN, linestyle=':', linewidth=1.2)
    ax2.axhline(2 / (1 + np.sqrt(2)), color=AMBER, linestyle='-.', linewidth=1.0)

    marker_p = 0.10
    marker_s = 4 * ((1.5 - 2 * marker_p) / (1.5 - marker_p))
    marker_a = 0.75 - 0.5 * marker_p
    ax1.scatter([marker_p], [marker_s], color=CRIMSON, s=48, zorder=4)
    ax2.scatter([marker_p], [marker_a], color=BLUE, s=40, zorder=4)
    ax1.text(marker_p + 0.015, marker_s + 0.05, 'paper point: p_lo = 0.10', color=CRIMSON, fontsize=9)
    ax2.text(marker_p + 0.015, marker_a - 0.06, '70% acceptance', color=BLUE, fontsize=9)

    ax1.set_xlim(0, 0.5)
    ax1.set_ylim(1.95, 4.05)
    ax2.set_ylim(0.5, 0.78)
    ax1.set_xlabel('Disfavored-sign keep rate p_lo')
    ax1.set_ylabel('Selected CHSH value S')
    ax2.set_ylabel('Acceptance rate')
    ax1.set_title('Exact local counterexample used in the website and notebook')
    ax1.grid(axis='both', linestyle='--', linewidth=0.8, alpha=0.7)

    ax1.text(0.015, 2.03, 'classical bound', color=AMBER, fontsize=9)
    ax1.text(0.015, 2 * np.sqrt(2) + 0.03, 'Tsirelson bound', color=GREEN, fontsize=9)
    save(fig, 'publication_fig3_postselection_curve.png')



def fig4_correlators() -> None:
    settings = ['E00', 'E01', 'E10', 'E11']
    raw = np.array([0.5, 0.5, 0.5, -0.5])
    selected = np.array([13 / 14, 13 / 14, 13 / 14, -(13 / 14)])
    x = np.arange(len(settings))
    width = 0.34

    fig, ax = plt.subplots(figsize=(8.6, 4.8))
    ax.bar(x - width / 2, raw, width=width, color=BLUE, edgecolor=INK, label='Raw local correlators')
    ax.bar(x + width / 2, selected, width=width, color=CRIMSON, edgecolor=INK, label='Selected correlators')
    ax.axhline(0, color=SAND, linewidth=1)
    ax.set_xticks(x, settings)
    ax.set_ylim(-1.05, 1.05)
    ax.set_ylabel('Correlation value')
    ax.set_title('Selection inflates the correlators, not the underlying locality class')
    ax.grid(axis='y', linestyle='--', linewidth=0.8, alpha=0.7)
    ax.legend(frameon=False, loc='upper right')

    ax.text(0.02, 0.92, 'Raw S = 2.000', transform=ax.transAxes, fontsize=9, color=BLUE)
    ax.text(0.02, 0.84, 'Selected S = 26/7 = 3.714', transform=ax.transAxes, fontsize=9, color=CRIMSON)
    save(fig, 'publication_fig4_correlators.png')



def main() -> None:
    ensure_dirs()
    fig1_bounds()
    fig2_efficiency()
    fig3_postselection_curve()
    fig4_correlators()


if __name__ == '__main__':
    main()
