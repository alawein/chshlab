from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import matplotlib

matplotlib.use('Agg')

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import AutoMinorLocator, LogFormatterMathtext, LogLocator, MultipleLocator


ROOT = Path(__file__).resolve().parent.parent
WEB_OUT = ROOT / 'assets' / 'figures' / 'publication'
ARXIV_OUT = ROOT / 'arxiv' / 'figures'


@dataclass(frozen=True)
class Theme:
    bg: str
    ink: str
    muted: str
    grid: str
    edge: str
    blue: str
    blue_light: str
    crimson: str
    gold: str
    green: str
    slate: str


ARXIV_THEME = Theme(
    bg='#ffffff',
    ink='#1e2630',
    muted='#556270',
    grid='#d6dde6',
    edge='#c5d0db',
    blue='#1a57a8',
    blue_light='#dbe6f5',
    crimson='#a24c5a',
    gold='#b18418',
    green='#4d7a5a',
    slate='#778497',
)

WEB_DARK_THEME = Theme(
    bg='#161921',
    ink='#e2e8f0',
    muted='#94a3b8',
    grid='#1f2333',
    edge='#3b4459',
    blue='#60a5fa',
    blue_light='#1e3a5f',
    crimson='#f87171',
    gold='#c9a94d',
    green='#4ade80',
    slate='#7c8da3',
)


def ensure_dirs() -> None:
    WEB_OUT.mkdir(parents=True, exist_ok=True)
    ARXIV_OUT.mkdir(parents=True, exist_ok=True)


def configure(theme: Theme) -> None:
    plt.rcParams.update(
        {
            'figure.facecolor': theme.bg,
            'axes.facecolor': theme.bg,
            'savefig.facecolor': theme.bg,
            'savefig.edgecolor': theme.bg,
            'axes.edgecolor': theme.edge,
            'axes.labelcolor': theme.ink,
            'axes.titlecolor': theme.ink,
            'xtick.color': theme.muted,
            'ytick.color': theme.muted,
            'text.color': theme.ink,
            'grid.color': theme.grid,
            'grid.linewidth': 0.7,
            'font.family': 'DejaVu Sans',
            'font.size': 10.5,
            'axes.spines.top': False,
            'axes.spines.right': False,
            'legend.frameon': False,
            'legend.fontsize': 9.5,
            'mathtext.fontset': 'stix',
            'pdf.fonttype': 42,
            'ps.fonttype': 42,
            'svg.fonttype': 'none',
        }
    )


def style_axes(ax: plt.Axes, theme: Theme, *, x_minor: int | None = None, y_minor: int | None = None) -> None:
    ax.grid(True, axis='both', alpha=1.0)
    ax.set_axisbelow(True)
    ax.spines['left'].set_color(theme.edge)
    ax.spines['bottom'].set_color(theme.edge)
    ax.spines['left'].set_linewidth(0.85)
    ax.spines['bottom'].set_linewidth(0.85)
    if x_minor:
        ax.xaxis.set_minor_locator(AutoMinorLocator(x_minor))
    if y_minor:
        ax.yaxis.set_minor_locator(AutoMinorLocator(y_minor))
    ax.tick_params(which='major', length=4, width=0.8)
    ax.tick_params(which='minor', length=2.5, width=0.6)


def save_web(fig: plt.Figure, stem: str) -> None:
    web_png = WEB_OUT / f'{stem}.png'
    web_svg = WEB_OUT / f'{stem}.svg'
    fig.savefig(web_png, dpi=450, bbox_inches='tight', pad_inches=0.03)
    fig.savefig(web_svg, bbox_inches='tight', pad_inches=0.03)
    print(f'Wrote {web_png}')
    print(f'Wrote {web_svg}')
    plt.close(fig)


def save_arxiv(fig: plt.Figure, stem: str) -> None:
    arxiv_pdf = ARXIV_OUT / f'{stem}.pdf'
    arxiv_png = ARXIV_OUT / f'{stem}.png'
    fig.savefig(arxiv_pdf, bbox_inches='tight', pad_inches=0.03)
    fig.savefig(arxiv_png, dpi=450, bbox_inches='tight', pad_inches=0.03)
    print(f'Wrote {arxiv_pdf}')
    print(f'Wrote {arxiv_png}')
    plt.close(fig)


def fig1_bounds(theme: Theme, save_fn) -> None:
    configure(theme)
    labels = [
        'Classical bound',
        'Wang et al. (2025)',
        'Tsirelson bound',
        'Local counterexample after selection',
    ]
    values = np.array([2.0, 2.275, 2 * np.sqrt(2), 26 / 7])
    colors = [theme.gold, theme.blue, theme.green, theme.crimson]
    y = np.arange(len(labels))

    fig, ax = plt.subplots(figsize=(7.8, 4.5), layout='constrained')
    ax.hlines(y, 0, values, color=theme.edge, linewidth=1.6, zorder=1)
    ax.scatter(values, y, s=84, color=colors, edgecolor=theme.ink, linewidth=0.6, zorder=3)
    ax.axvline(2.0, color=theme.gold, linestyle='--', linewidth=1.15)
    ax.axvline(2 * np.sqrt(2), color=theme.green, linestyle=(0, (2.4, 2.4)), linewidth=1.15)
    ax.axvline(4.0, color=theme.slate, linestyle=':', linewidth=1.0)

    for yi, value in enumerate(values):
        ax.text(value + 0.07, yi, f'{value:.3f}', va='center', ha='left', fontsize=9.2, color=theme.ink)

    ax.text(2.02, -0.68, 'CHSH local bound', color=theme.gold, fontsize=8.7)
    ax.text(2 * np.sqrt(2) + 0.04, -0.35, 'Tsirelson bound', color=theme.green, fontsize=8.7)
    ax.text(3.77, 3.35, 'algebraic maximum', color=theme.slate, fontsize=8.3, ha='right')

    ax.set_xlim(0, 4.05)
    ax.set_ylim(-0.7, len(labels) - 0.35)
    ax.set_yticks(y, labels)
    ax.invert_yaxis()
    ax.set_xlabel('CHSH value $S$')
    style_axes(ax, theme, x_minor=2)
    ax.spines['left'].set_visible(False)
    save_fn(fig, 'fig1_bounds')


def fig2_efficiency(theme: Theme, save_fn) -> None:
    configure(theme)
    fig, ax = plt.subplots(figsize=(7.8, 3.0), layout='constrained')

    ax.set_xscale('log')
    ax.set_xlim(5e-19, 1.15)
    ax.set_ylim(0.0, 1.0)
    ax.set_yticks([])
    ax.axvspan(5e-19, 2 / 3, color=theme.crimson, alpha=0.06)
    ax.axvspan(2 / 3, 1.15, color=theme.blue_light, alpha=0.55)
    ax.hlines(0.52, 5e-19, 1.15, color=theme.edge, linewidth=1.0)

    markers = [
        ('Wang et al.\n$\\sim 10^{-18}$', 1e-18, theme.crimson, 0.18, (0.06, 0.25)),
        ('Eberhard\n$\\eta \\approx 0.667$', 2 / 3, theme.gold, 0.42, (0.62, 0.44)),
        ('Garg-Mermin\n$\\eta \\approx 0.828$', 2 / (1 + np.sqrt(2)), theme.blue, 0.66, (0.62, 0.70)),
        ('Unit efficiency', 1.0, theme.slate, 0.86, (0.78, 0.90)),
    ]

    for label, value, color, y, text_pos in markers:
        ax.vlines(value, 0.12, 0.90, color=color, linewidth=1.2)
        ax.scatter([value], [y], s=50, color=color, edgecolor=theme.ink, linewidth=0.45, zorder=3)
        ax.annotate(
            label,
            xy=(value, y),
            xycoords='data',
            xytext=text_pos,
            textcoords='axes fraction',
            ha='left',
            va='center',
            fontsize=8.8,
            color=color,
            arrowprops={
                'arrowstyle': '-',
                'linewidth': 0.9,
                'color': color,
                'shrinkA': 0,
                'shrinkB': 0,
            },
        )

    ax.text(7e-19, 0.93, 'selection-dominated regime', color=theme.crimson, fontsize=8.4)
    ax.text(0.70, 0.93, 'benchmark regime for detector-loophole control', color=theme.blue, fontsize=8.4)
    ax.set_xlabel('Effective acceptance or benchmark threshold $\\eta$')
    ax.xaxis.set_major_locator(LogLocator(base=10.0))
    ax.xaxis.set_major_formatter(LogFormatterMathtext())
    ax.grid(True, axis='x', which='major')
    ax.grid(False, axis='y')
    ax.spines['left'].set_visible(False)
    ax.spines['bottom'].set_color(theme.edge)
    ax.tick_params(axis='x', which='major', length=4, width=0.8)
    ax.tick_params(axis='x', which='minor', length=2.2, width=0.6)
    save_fn(fig, 'fig2_efficiency')


def fig3_postselection_curve(theme: Theme, save_fn) -> None:
    configure(theme)
    p_lo = np.linspace(0.0, 0.5, 400)
    s_sel = 4 * ((1.5 - 2 * p_lo) / (1.5 - p_lo))
    accept = 0.75 - 0.5 * p_lo
    marker_p = 0.10
    marker_s = 4 * ((1.5 - 2 * marker_p) / (1.5 - marker_p))
    marker_a = 0.75 - 0.5 * marker_p

    fig, (ax_top, ax_bottom) = plt.subplots(
        2,
        1,
        figsize=(7.8, 5.2),
        sharex=True,
        gridspec_kw={'height_ratios': [3, 2], 'hspace': 0.08},
        layout='constrained',
    )

    ax_top.plot(p_lo, s_sel, color=theme.crimson, linewidth=2.0)
    ax_top.axhline(2.0, color=theme.gold, linestyle='--', linewidth=1.0)
    ax_top.axhline(2 * np.sqrt(2), color=theme.green, linestyle=(0, (2.4, 2.4)), linewidth=1.0)
    ax_top.scatter([marker_p], [marker_s], s=48, color=theme.crimson, edgecolor=theme.ink, linewidth=0.45, zorder=4)
    ax_top.annotate(
        '$p_{\\mathrm{lo}} = 0.10$',
        xy=(marker_p, marker_s),
        xytext=(0.16, 3.78),
        textcoords='data',
        fontsize=8.8,
        color=theme.crimson,
        arrowprops={'arrowstyle': '->', 'linewidth': 0.9, 'color': theme.crimson},
    )
    ax_top.set_ylabel('Selected $S$')
    ax_top.set_ylim(1.95, 4.05)
    ax_top.text(0.01, 0.93, '(a)', transform=ax_top.transAxes, fontsize=9.4, fontweight='bold')
    ax_top.text(0.02, 2.03, 'local bound', color=theme.gold, fontsize=8.2)
    ax_top.text(0.02, 2 * np.sqrt(2) + 0.04, 'Tsirelson bound', color=theme.green, fontsize=8.2)
    style_axes(ax_top, theme, x_minor=2, y_minor=2)

    ax_bottom.plot(p_lo, accept, color=theme.blue, linewidth=2.0)
    ax_bottom.axhline(2 / (1 + np.sqrt(2)), color=theme.gold, linestyle=(0, (4, 2, 1.5, 2)), linewidth=1.0)
    ax_bottom.scatter([marker_p], [marker_a], s=44, color=theme.blue, edgecolor=theme.ink, linewidth=0.45, zorder=4)
    ax_bottom.annotate(
        '70.0% acceptance',
        xy=(marker_p, marker_a),
        xytext=(0.16, 0.645),
        textcoords='data',
        fontsize=8.8,
        color=theme.blue,
        arrowprops={'arrowstyle': '->', 'linewidth': 0.9, 'color': theme.blue},
    )
    ax_bottom.text(0.02, 2 / (1 + np.sqrt(2)) + 0.006, '$\\eta_{\\mathrm{c}} \\approx 0.828$', color=theme.gold, fontsize=8.2)
    ax_bottom.set_ylabel('Acceptance')
    ax_bottom.set_xlabel('Disfavored-sign keep rate $p_{\\mathrm{lo}}$')
    ax_bottom.set_ylim(0.50, 0.78)
    ax_bottom.yaxis.set_major_locator(MultipleLocator(0.05))
    ax_bottom.text(0.01, 0.90, '(b)', transform=ax_bottom.transAxes, fontsize=9.4, fontweight='bold')
    style_axes(ax_bottom, theme, x_minor=2, y_minor=2)

    save_fn(fig, 'fig3_postselection_curve')


def fig4_correlators(theme: Theme, save_fn) -> None:
    configure(theme)
    settings = ['$(a,b)$', "$(a,b')$", "$(a',b)$", "$(a',b')$"]
    raw = np.array([0.5, 0.5, 0.5, -0.5])
    selected = np.array([13 / 14, 13 / 14, 13 / 14, -(13 / 14)])
    x = np.arange(len(settings))
    width = 0.34

    fig, ax = plt.subplots(figsize=(7.8, 4.6), layout='constrained')
    ax.bar(
        x - width / 2,
        raw,
        width=width,
        color=theme.blue_light,
        edgecolor=theme.blue,
        linewidth=1.0,
        label='Raw correlators',
    )
    # Derive a muted crimson fill from the theme crimson
    crimson_rgb = matplotlib.colors.to_rgb(theme.crimson)
    bg_rgb = matplotlib.colors.to_rgb(theme.bg)
    crimson_fill = tuple(c * 0.25 + b * 0.75 for c, b in zip(crimson_rgb, bg_rgb))

    ax.bar(
        x + width / 2,
        selected,
        width=width,
        color=crimson_fill,
        edgecolor=theme.crimson,
        linewidth=1.0,
        label='Selected correlators',
    )
    ax.axhline(0.0, color=theme.slate, linewidth=0.9)
    ax.set_xticks(x, settings)
    ax.set_ylim(-1.05, 1.05)
    ax.set_ylabel('Correlation value')
    ax.legend(loc='upper right', ncols=1)
    style_axes(ax, theme, y_minor=2)
    save_fn(fig, 'fig4_correlators')


def main() -> None:
    ensure_dirs()
    figures = (fig1_bounds, fig2_efficiency, fig3_postselection_curve, fig4_correlators)
    for figure in figures:
        figure(WEB_DARK_THEME, save_web)
    for figure in figures:
        figure(ARXIV_THEME, save_arxiv)


if __name__ == '__main__':
    main()
