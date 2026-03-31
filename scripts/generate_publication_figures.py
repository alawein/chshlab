from __future__ import annotations

from pathlib import Path
from typing import NamedTuple

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
WEB_OUT = ROOT / 'assets' / 'figures' / 'publication'
ARXIV_OUT = ROOT / 'arxiv' / 'figures'


class Theme(NamedTuple):
    bg: str
    ink: str
    muted: str
    crimson: str
    amber: str
    blue: str
    green: str
    sand: str
    grid: str | tuple[float, float, float, float]
    edge: str | tuple[float, float, float, float]


# Transparent dark-site theme for publication figures on the website
WEB_THEME = Theme(
    bg='none',
    ink='#EAE6DA',
    muted='#9A9485',
    crimson='#C94040',
    amber='#C9A94D',
    blue='#4FA3D4',
    green='#6B8F71',
    sand='#5C5A55',
    grid=(1.0, 248 / 255, 230 / 255, 0.10),
    edge=(1.0, 1.0, 1.0, 0.08),
)

# Light theme — white background for arXiv / print
ARXIV_THEME = Theme(
    bg='#ffffff',
    ink='#111111',
    muted='#444444',
    crimson='#9f3d3d',
    amber='#b8842f',
    blue='#2a6090',
    green='#2d6b3a',
    sand='#cccccc',
    grid='#dddddd',
    edge='#999999',
)


def _apply_theme(theme: Theme) -> None:
    is_transparent = theme.bg == 'none'
    facecolor = 'none' if is_transparent else theme.bg
    plt.rcParams.update({
        'figure.facecolor': facecolor,
        'axes.facecolor': facecolor,
        'axes.edgecolor': theme.edge,
        'axes.labelcolor': theme.ink,
        'axes.titlecolor': theme.ink,
        'text.color': theme.ink,
        'xtick.color': theme.muted,
        'ytick.color': theme.muted,
        'grid.color': theme.grid,
        'font.size': 11,
        'font.family': 'DejaVu Serif',
        'axes.spines.top': False,
        'axes.spines.right': False,
        'savefig.facecolor': facecolor,
    })


def ensure_dirs() -> None:
    WEB_OUT.mkdir(parents=True, exist_ok=True)
    ARXIV_OUT.mkdir(parents=True, exist_ok=True)


def _save(fig: plt.Figure, name: str, out_dir: Path, theme: Theme) -> None:
    target = out_dir / name
    transparent = theme.bg == 'none'
    facecolor = 'none' if transparent else theme.bg
    fig.savefig(
        target,
        dpi=300,
        bbox_inches='tight',
        facecolor=facecolor,
        edgecolor='none',
        transparent=transparent,
    )
    print(f'Wrote {target}')


def fig1_bounds(theme: Theme, out_dir: Path) -> None:
    _apply_theme(theme)
    labels = [
        'Classical bound',
        'Wang et al. 2025',
        'Tsirelson bound',
        'Local toy model after selection',
    ]
    values = [2.0, 2.275, 2 * np.sqrt(2), 26 / 7]
    colors = [theme.amber, theme.blue, theme.green, theme.crimson]

    fig, ax = plt.subplots(figsize=(8.6, 4.6))
    y = np.arange(len(labels))
    ax.barh(y, values, color=colors, edgecolor=theme.ink, linewidth=0.9)
    ax.set_yticks(y, labels)
    ax.invert_yaxis()
    ax.set_xlim(0, 4.05)
    ax.set_xlabel('CHSH value S')
    ax.set_title('Reference scales for the two papers')
    ax.grid(axis='x', linestyle='--', linewidth=0.8, alpha=0.8)
    ax.axvline(2.0, color=theme.amber, linestyle='--', linewidth=1.2)
    ax.axvline(2 * np.sqrt(2), color=theme.green, linestyle=':', linewidth=1.3)

    for yi, value in enumerate(values):
        ax.text(min(value + 0.06, 3.92), yi, f'{value:.3f}', va='center', ha='left', fontsize=10,
                color=theme.ink)

    ax.text(2.02, -0.55, 'fair-sampling local ceiling', color=theme.amber, fontsize=9)
    ax.text(2 * np.sqrt(2) + 0.03, 1.55, 'quantum ceiling', color=theme.green, fontsize=9)
    _save(fig, 'fig1_bounds.png', out_dir, theme)
    plt.close(fig)


def fig2_efficiency(theme: Theme, out_dir: Path) -> None:
    _apply_theme(theme)
    fig, ax = plt.subplots(figsize=(8.6, 4.8))
    ax.set_xscale('log')
    ax.set_xlim(1e-19, 1.2)
    ax.set_ylim(0, 1)
    ax.set_yticks([])
    ax.set_xlabel('Effective efficiency or threshold')
    ax.set_title('Efficiency context for interpreting S > 2')
    ax.grid(axis='x', which='both', linestyle='--', linewidth=0.8, alpha=0.7)

    crimson_alpha = 0.15 if theme.bg == 'none' else 0.08
    green_alpha = 0.10 if theme.bg == 'none' else 0.05
    ax.axvspan(1e-19, 2 / 3, color=theme.crimson, alpha=crimson_alpha)
    ax.axvspan(2 / 3, 1.2, color=theme.green, alpha=green_alpha)

    markers = [
        ('Wang et al. reported eta ~ 1e-18', 1e-18, theme.crimson, 0.18),
        ('Eberhard 1993 threshold ~ 0.667', 2 / 3, theme.amber, 0.40),
        ('Garg-Mermin threshold ~ 0.828', 2 / (1 + np.sqrt(2)), theme.blue, 0.62),
        ('Unit efficiency', 1.0, theme.muted, 0.84),
    ]

    for label, value, color, y in markers:
        ax.axvline(value, color=color, linewidth=2)
        ax.scatter([value], [y], s=42, color=color, zorder=3)
        ax.text(value * 1.06, y, label, color=color, va='center', fontsize=9)

    ax.text(1.4e-19, 0.92, 'selection-heavy regime', color=theme.crimson, fontsize=9)
    ax.text(0.72, 0.92, 'threshold regime for serious loophole control', color=theme.green,
            fontsize=9, ha='left')
    _save(fig, 'fig2_efficiency.png', out_dir, theme)
    plt.close(fig)


def fig3_postselection_curve(theme: Theme, out_dir: Path) -> None:
    _apply_theme(theme)
    p_lo = np.linspace(0.0, 0.5, 400)
    s_sel = 4 * ((1.5 - 2 * p_lo) / (1.5 - p_lo))
    accept = 0.75 - 0.5 * p_lo

    fig, ax1 = plt.subplots(figsize=(8.6, 5.0))
    ax2 = ax1.twinx()
    ax2.set_facecolor(theme.bg)

    ax1.plot(p_lo, s_sel, color=theme.crimson, linewidth=2.4, label='Selected S')
    ax2.plot(p_lo, accept, color=theme.blue, linewidth=2.0, linestyle='--', label='Acceptance')

    ax1.axhline(2.0, color=theme.amber, linestyle='--', linewidth=1.2)
    ax1.axhline(2 * np.sqrt(2), color=theme.green, linestyle=':', linewidth=1.2)
    ax2.axhline(2 / (1 + np.sqrt(2)), color=theme.amber, linestyle='-.', linewidth=1.0)

    marker_p = 0.10
    marker_s = 4 * ((1.5 - 2 * marker_p) / (1.5 - marker_p))
    marker_a = 0.75 - 0.5 * marker_p
    ax1.scatter([marker_p], [marker_s], color=theme.crimson, s=48, zorder=4)
    ax2.scatter([marker_p], [marker_a], color=theme.blue, s=40, zorder=4)
    ax1.text(marker_p + 0.015, marker_s + 0.05, 'paper point: p_lo = 0.10',
             color=theme.crimson, fontsize=9)
    ax2.text(marker_p + 0.015, marker_a - 0.06, '70% acceptance', color=theme.blue, fontsize=9)

    ax1.set_xlim(0, 0.5)
    ax1.set_ylim(1.95, 4.05)
    ax2.set_ylim(0.5, 0.78)
    ax1.set_xlabel('Disfavored-sign keep rate p_lo')
    ax1.set_ylabel('Selected CHSH value S')
    ax2.set_ylabel('Acceptance rate')
    ax2.yaxis.label.set_color(theme.ink)
    ax2.tick_params(colors=theme.muted)
    ax2.spines['right'].set_color(theme.edge)
    ax1.set_title('Exact local counterexample used in the website and notebook')
    ax1.grid(axis='both', linestyle='--', linewidth=0.8, alpha=0.7)

    ax1.text(0.015, 2.03, 'classical bound', color=theme.amber, fontsize=9)
    ax1.text(0.015, 2 * np.sqrt(2) + 0.03, 'Tsirelson bound', color=theme.green, fontsize=9)
    _save(fig, 'fig3_postselection_curve.png', out_dir, theme)
    plt.close(fig)


def fig4_correlators(theme: Theme, out_dir: Path) -> None:
    _apply_theme(theme)
    settings = ['E00', 'E01', 'E10', 'E11']
    raw = np.array([0.5, 0.5, 0.5, -0.5])
    selected = np.array([13 / 14, 13 / 14, 13 / 14, -(13 / 14)])
    x = np.arange(len(settings))
    width = 0.34

    fig, ax = plt.subplots(figsize=(8.6, 4.8))
    ax.bar(x - width / 2, raw, width=width, color=theme.blue, edgecolor=theme.ink,
           label='Raw local correlators')
    ax.bar(x + width / 2, selected, width=width, color=theme.crimson, edgecolor=theme.ink,
           label='Selected correlators')
    ax.axhline(0, color=theme.sand, linewidth=1)
    ax.set_xticks(x, settings)
    ax.set_ylim(-1.05, 1.05)
    ax.set_ylabel('Correlation value')
    ax.set_title('Selection inflates the correlators, not the underlying locality class')
    ax.grid(axis='y', linestyle='--', linewidth=0.8, alpha=0.7)
    ax.legend(frameon=False, loc='upper right')

    ax.text(0.02, 0.92, 'Raw S = 2.000', transform=ax.transAxes, fontsize=9, color=theme.blue)
    ax.text(0.02, 0.84, 'Selected S = 26/7 = 3.714', transform=ax.transAxes, fontsize=9,
            color=theme.crimson)
    _save(fig, 'fig4_correlators.png', out_dir, theme)
    plt.close(fig)


def main() -> None:
    ensure_dirs()
    for fn in (fig1_bounds, fig2_efficiency, fig3_postselection_curve, fig4_correlators):
        fn(WEB_THEME, WEB_OUT)    # dark — for paper.html on the website
        fn(ARXIV_THEME, ARXIV_OUT)  # white — for arXiv / print


if __name__ == '__main__':
    main()
