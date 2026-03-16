"""
generate_figures.py
Publication-quality matplotlib figures for the CHSH Lab physics website.
Dark cinematic theme -- Bell inequality detection loopholes.

Output: assets/figures/fig{1..5}_*.png
"""

import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import (
    Circle, FancyBboxPatch, FancyArrowPatch, Arc, PathPatch
)
from matplotlib.path import Path
import matplotlib.patheffects as pe

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUT_DIR = os.path.join(REPO_ROOT, "assets", "figures")
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Theme constants
# ---------------------------------------------------------------------------
BG = "#0E0F14"
GRID_COLOR = (1, 1, 1, 0.06)
LABEL_COLOR = "rgba(255,255,255,0.7)"  # converted below
TITLE_COLOR = "rgba(255,255,255,0.85)"
SPINE_COLOR = (1, 1, 1, 0.12)

# Matplotlib needs tuples / hex — pre-convert
LABEL_RGBA = (1, 1, 1, 0.7)
TITLE_RGBA = (1, 1, 1, 0.85)

AMBER = "#C9A94D"
BLUE = "#648CE6"
CRIMSON = "#C0392B"
GREEN = "#6B8F71"
MUTED = "#5C5A55"

FONT_MONO = "JetBrains Mono"
FONT_MONO_FALLBACK = "monospace"
FONT_SERIF = "serif"

DPI = 150

# ---------------------------------------------------------------------------
# Global rcParams
# ---------------------------------------------------------------------------
plt.rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor": BG,
    "savefig.facecolor": BG,
    "savefig.edgecolor": "none",
    "axes.edgecolor": SPINE_COLOR,
    "axes.labelcolor": LABEL_RGBA,
    "xtick.color": LABEL_RGBA,
    "ytick.color": LABEL_RGBA,
    "text.color": LABEL_RGBA,
    "axes.grid": True,
    "grid.color": GRID_COLOR,
    "grid.alpha": 1.0,        # alpha already baked in
    "grid.linewidth": 0.4,
    "font.family": FONT_MONO_FALLBACK,
    "legend.facecolor": BG,
    "legend.edgecolor": SPINE_COLOR,
    "legend.labelcolor": LABEL_RGBA,
})

# Try to use JetBrains Mono if available
try:
    from matplotlib.font_manager import fontManager
    jb_available = any(FONT_MONO.lower() in f.name.lower() for f in fontManager.ttflist)
    if jb_available:
        plt.rcParams["font.family"] = FONT_MONO
except Exception:
    pass


def _save(fig, filename):
    path = os.path.join(OUT_DIR, filename)
    fig.savefig(
        path, dpi=DPI, bbox_inches="tight",
        facecolor=BG, edgecolor="none",
        transparent=False, pad_inches=0.15,
    )
    plt.close(fig)
    print(f"  -> {path}")


# ===================================================================
# Figure 1: CHSH Bounds Comparison (bar chart)
# ===================================================================
def fig1_chsh_bounds():
    print("[1/5] CHSH Bounds Comparison ...")

    labels = ["Classical\nLHV", "Quantum\nSinglet", "Post-Selected\nLHV"]
    values = [2.001, 2 * np.sqrt(2), 3.716]
    colors = [AMBER, BLUE, CRIMSON]

    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    bars = ax.bar(labels, values, width=0.52, color=colors, edgecolor="none",
                  zorder=3, alpha=0.92)

    # Reference lines
    ax.axhline(2, color=AMBER, ls="--", lw=1, alpha=0.6, zorder=2,
               label="Classical bound  S = 2")
    ax.axhline(2 * np.sqrt(2), color=BLUE, ls="--", lw=1, alpha=0.6,
               zorder=2, label=f"Tsirelson bound  S = 2√2 ≈ {2*np.sqrt(2):.3f}")
    ax.axhline(4, color=MUTED, ls=":", lw=1, alpha=0.5, zorder=2,
               label="Algebraic max  S = 4")

    # Value labels above bars
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, val + 0.12,
                f"S ≈ {val:.3f}", ha="center", va="bottom",
                fontsize=11, color=TITLE_RGBA, fontfamily=FONT_SERIF,
                fontweight="bold")

    ax.set_ylim(0, 4.5)
    ax.set_ylabel("CHSH Parameter  (S)", fontsize=12)
    ax.set_title("CHSH Bounds Comparison", fontsize=16, color=TITLE_RGBA,
                 fontfamily=FONT_SERIF, pad=14)
    ax.legend(loc="upper left", fontsize=9, framealpha=0.6)
    ax.tick_params(axis="x", labelsize=11)
    ax.grid(axis="y", linewidth=0.3)
    ax.grid(axis="x", visible=False)

    _save(fig, "fig1_chsh_bounds.png")


# ===================================================================
# Figure 2: Detection Efficiency Landscape
# ===================================================================
def fig2_efficiency_landscape():
    print("[2/5] Detection Efficiency Landscape ...")

    eta = np.linspace(0.5, 1.0, 500)
    s_lhv = 4.0 / eta - 2.0
    eta_c = 4.0 / (2 + 2 * np.sqrt(2))  # ≈ 0.8284

    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    # LHV max curve
    ax.plot(eta, s_lhv, color=CRIMSON, lw=2.2, zorder=4,
            label=r"$S_{\mathrm{LHV}}^{\max}(\eta) = 4/\eta - 2$")

    # Reference lines
    ax.axhline(2, color=AMBER, ls="--", lw=1, alpha=0.6, zorder=2,
               label="Classical bound  S = 2")
    ax.axhline(2 * np.sqrt(2), color=BLUE, ls="--", lw=1, alpha=0.6,
               zorder=2, label=f"Tsirelson bound  S ≈ {2*np.sqrt(2):.3f}")

    # Critical threshold
    ax.axvline(eta_c, color=GREEN, ls="--", lw=1.2, alpha=0.7, zorder=3)
    ax.annotate(f"η_c ≈ {eta_c:.3f}", xy=(eta_c, 2 * np.sqrt(2)),
                xytext=(eta_c + 0.06, 2 * np.sqrt(2) + 1.0),
                fontsize=10, color=GREEN,
                arrowprops=dict(arrowstyle="->", color=GREEN, lw=1.2),
                fontweight="bold")

    # Fill region where S_LHV > 2
    ax.fill_between(eta, s_lhv, 2, where=(s_lhv > 2),
                    color=CRIMSON, alpha=0.08, zorder=1)

    ax.set_xlim(0.5, 1.0)
    ax.set_ylim(1.5, 6.5)
    ax.set_xlabel("Detection Efficiency  η", fontsize=12)
    ax.set_ylabel("Maximum CHSH  (S)", fontsize=12)
    ax.set_title("Detection Efficiency Landscape", fontsize=16,
                 color=TITLE_RGBA, fontfamily=FONT_SERIF, pad=14)
    ax.legend(loc="upper right", fontsize=9, framealpha=0.6)
    ax.grid(linewidth=0.3)

    _save(fig, "fig2_efficiency_landscape.png")


# ===================================================================
# Figure 3: Post-Selection Mechanism (dual axis)
# ===================================================================
def fig3_postselection_mechanism():
    print("[3/5] Post-Selection Mechanism ...")

    p = np.linspace(0, 1, 500)
    s_post = 2 + 2 * (1 - p)
    acceptance = 0.5 + 0.5 * p

    fig, ax1 = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor(BG)
    ax1.set_facecolor(BG)

    # Left axis — CHSH S
    ln1 = ax1.plot(p, s_post, color=CRIMSON, lw=2.2, label="S_post(p)",
                   zorder=4)
    ax1.axhline(2, color=AMBER, ls="--", lw=1, alpha=0.6, label="S = 2")
    ax1.axhline(2 * np.sqrt(2), color=BLUE, ls="--", lw=1, alpha=0.6,
                label=f"S = 2√2 ≈ {2*np.sqrt(2):.3f}")
    ax1.set_xlabel("Selection Bias Parameter  (p)", fontsize=12)
    ax1.set_ylabel("CHSH  S", fontsize=12, color=CRIMSON)
    ax1.tick_params(axis="y", labelcolor=CRIMSON)
    ax1.set_ylim(1.5, 4.5)
    ax1.grid(linewidth=0.3)

    # Right axis — Acceptance rate
    ax2 = ax1.twinx()
    ax2.set_facecolor("none")
    ln2 = ax2.plot(p, acceptance, color=GREEN, lw=2.2, ls="-.",
                   label="Acceptance rate", zorder=4)
    ax2.set_ylabel("Acceptance Rate", fontsize=12, color=GREEN)
    ax2.tick_params(axis="y", labelcolor=GREEN)
    ax2.set_ylim(0.3, 1.05)
    ax2.grid(False)
    for spine in ax2.spines.values():
        spine.set_color(SPINE_COLOR)

    # η_c on acceptance axis
    eta_c = 4.0 / (2 + 2 * np.sqrt(2))
    ax2.axhline(eta_c, color=GREEN, ls=":", lw=0.9, alpha=0.5)
    ax2.annotate(f"η_c ≈ {eta_c:.3f}", xy=(0.05, eta_c),
                 xytext=(0.15, eta_c - 0.1),
                 fontsize=9, color=GREEN,
                 arrowprops=dict(arrowstyle="->", color=GREEN, lw=1))

    # Annotation: inverse relationship
    ax1.annotate("Lower acceptance\n→ higher S inflation",
                 xy=(0.2, 2 + 2 * 0.8), xytext=(0.45, 3.8),
                 fontsize=9, color=TITLE_RGBA, fontstyle="italic",
                 arrowprops=dict(arrowstyle="->", color=MUTED, lw=1))

    # Combined legend
    lns = ln1 + ln2
    labs = [l.get_label() for l in lns]
    ax1.legend(lns, labs, loc="center right", fontsize=9, framealpha=0.6)

    ax1.set_title("Post-Selection Mechanism", fontsize=16,
                  color=TITLE_RGBA, fontfamily=FONT_SERIF, pad=14)

    _save(fig, "fig3_postselection_mechanism.png")


# ===================================================================
# Figure 4: Bell Test Schematic (patches / arrows)
# ===================================================================
def fig4_bell_test_schematic():
    print("[4/5] Bell Test Schematic ...")

    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(-5, 5)
    ax.set_ylim(-3.5, 3.5)
    ax.set_aspect("equal")
    ax.axis("off")

    # --- Source ---
    source = Circle((0, 0.6), 0.55, facecolor=BG, edgecolor=MUTED,
                     lw=1.8, zorder=5)
    ax.add_patch(source)
    ax.text(0, 0.6, "|Ψ⁻⟩", ha="center", va="center",
            fontsize=13, color=TITLE_RGBA, fontfamily=FONT_SERIF,
            fontweight="bold", zorder=6)
    ax.text(0, 1.45, "Source", ha="center", va="bottom", fontsize=10,
            color=LABEL_RGBA, fontfamily=FONT_SERIF)

    # --- Detectors ---
    det_w = 1.6
    det_h = 1.2
    alice_x, alice_y = -3.5, 0.0
    bob_x, bob_y = 3.5, 0.0

    alice_box = FancyBboxPatch(
        (alice_x - det_w / 2, alice_y - det_h / 2), det_w, det_h,
        boxstyle="round,pad=0.12", facecolor=BG, edgecolor=AMBER,
        lw=1.5, zorder=5)
    ax.add_patch(alice_box)
    ax.text(alice_x, alice_y, "Alice", ha="center", va="center",
            fontsize=12, color=AMBER, fontweight="bold", zorder=6)

    bob_box = FancyBboxPatch(
        (bob_x - det_w / 2, bob_y - det_h / 2), det_w, det_h,
        boxstyle="round,pad=0.12", facecolor=BG, edgecolor=BLUE,
        lw=1.5, zorder=5)
    ax.add_patch(bob_box)
    ax.text(bob_x, bob_y, "Bob", ha="center", va="center",
            fontsize=12, color=BLUE, fontweight="bold", zorder=6)

    # --- Measurement settings labels ---
    ax.text(alice_x, alice_y + det_h / 2 + 0.3, "a , a'",
            ha="center", va="bottom", fontsize=11, color=AMBER,
            fontfamily=FONT_SERIF, fontstyle="italic")
    ax.text(bob_x, bob_y + det_h / 2 + 0.3, "b , b'",
            ha="center", va="bottom", fontsize=11, color=BLUE,
            fontfamily=FONT_SERIF, fontstyle="italic")

    # --- Wavy photon paths ---
    def draw_wavy_line(ax, x0, y0, x1, y1, color, n_waves=8):
        """Draw a wavy line from (x0,y0) to (x1,y1)."""
        t = np.linspace(0, 1, 300)
        dx, dy = x1 - x0, y1 - y0
        length = np.sqrt(dx**2 + dy**2)
        # perpendicular direction
        px, py = -dy / length, dx / length
        amp = 0.12
        x = x0 + t * dx + amp * np.sin(n_waves * 2 * np.pi * t) * px
        y = y0 + t * dy + amp * np.sin(n_waves * 2 * np.pi * t) * py
        ax.plot(x, y, color=color, lw=1.3, alpha=0.7, zorder=3)

    # Source to Alice
    draw_wavy_line(ax, -0.55, 0.6, alice_x + det_w / 2, alice_y,
                   AMBER, n_waves=10)
    # Source to Bob
    draw_wavy_line(ax, 0.55, 0.6, bob_x - det_w / 2, bob_y,
                   BLUE, n_waves=10)

    # Label photon paths
    ax.text(-1.8, 1.05, "γ", fontsize=11, color=AMBER, fontstyle="italic",
            fontfamily=FONT_SERIF, alpha=0.8)
    ax.text(1.8, 1.05, "γ", fontsize=11, color=BLUE, fontstyle="italic",
            fontfamily=FONT_SERIF, alpha=0.8)

    # --- Coincidence counter ---
    cc_w, cc_h = 2.4, 0.8
    cc_x, cc_y = 0, -2.4
    cc_box = FancyBboxPatch(
        (cc_x - cc_w / 2, cc_y - cc_h / 2), cc_w, cc_h,
        boxstyle="round,pad=0.1", facecolor=BG, edgecolor=GREEN,
        lw=1.5, zorder=5)
    ax.add_patch(cc_box)
    ax.text(cc_x, cc_y, "Coincidence\nCounter", ha="center", va="center",
            fontsize=10, color=GREEN, fontweight="bold", zorder=6,
            linespacing=1.2)

    # Lines from detectors down to coincidence counter
    # Alice -> CC
    ax.annotate("", xy=(cc_x - 0.4, cc_y + cc_h / 2),
                xytext=(alice_x, alice_y - det_h / 2),
                arrowprops=dict(arrowstyle="-|>", color=AMBER,
                                lw=1.2, alpha=0.6,
                                connectionstyle="arc3,rad=0.15"))
    # Bob -> CC
    ax.annotate("", xy=(cc_x + 0.4, cc_y + cc_h / 2),
                xytext=(bob_x, bob_y - det_h / 2),
                arrowprops=dict(arrowstyle="-|>", color=BLUE,
                                lw=1.2, alpha=0.6,
                                connectionstyle="arc3,rad=-0.15"))

    ax.set_title("Bell Test Schematic", fontsize=16, color=TITLE_RGBA,
                 fontfamily=FONT_SERIF, pad=14, y=1.02)

    _save(fig, "fig4_bell_test_schematic.png")


# ===================================================================
# Figure 5: Bell Test Timeline
# ===================================================================
def fig5_timeline():
    print("[5/5] Bell Test Timeline ...")

    # (year, description, color, direction, stem_multiplier)
    # direction: +1 = above, -1 = below
    # stem_multiplier: controls stem length to avoid overlap
    events = [
        (1964, "Bell's Theorem",   AMBER,   1,  1.0),
        (1969, "CHSH Inequality",  AMBER,  -1,  1.0),
        (1972, "Freedman\u2013Clauser", BLUE,  1,  1.0),
        (1982, "Aspect et al.",    BLUE,   -1,  1.0),
        (1998, "Innsbruck",        BLUE,    1,  1.0),
        (2015, "Loophole-free tests\n(Hensen, Giustina, Shalm)", GREEN, -1, 1.0),
        (2025, "Wang et al.\n[contested]", CRIMSON, 1, 1.0),
    ]

    fig, ax = plt.subplots(figsize=(14, 6))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    years = [e[0] for e in events]
    y_min, y_max = min(years) - 6, max(years) + 6

    # Horizontal timeline
    ax.plot([y_min, y_max], [0, 0], color=MUTED, lw=1.5, zorder=2)

    dot_size = 70
    base_stem = 1.8

    for year, desc, color, direction, smul in events:
        # Dot on the timeline
        ax.scatter(year, 0, s=dot_size, color=color, zorder=5,
                   edgecolors="none")

        # Stem line
        stem_len = base_stem * smul * direction
        ax.plot([year, year], [0, stem_len], color=color, lw=0.8,
                alpha=0.5, zorder=3)

        # Year label (closer to dot)
        ax.text(year, 0.35 * direction, str(year), ha="center",
                va="bottom" if direction > 0 else "top",
                fontsize=9, color=color, fontweight="bold", zorder=6)

        # Description (farther out)
        ax.text(year, stem_len + 0.25 * direction, desc, ha="center",
                va="bottom" if direction > 0 else "top",
                fontsize=8.5, color=LABEL_RGBA,
                fontfamily=FONT_SERIF, linespacing=1.2, zorder=6)

    # "This Work" annotation for Wang et al.
    ax.annotate("This Work", xy=(2025, 0), xytext=(2025, -1.8),
                fontsize=9, color=CRIMSON, fontstyle="italic",
                fontweight="bold", ha="center",
                arrowprops=dict(arrowstyle="->", color=CRIMSON, lw=1.2))

    ax.set_xlim(1955, 2035)
    ax.set_ylim(-4.0, 4.0)
    ax.axis("off")

    ax.set_title("Bell Test Timeline", fontsize=16, color=TITLE_RGBA,
                 fontfamily=FONT_SERIF, pad=14)

    _save(fig, "fig5_timeline.png")


# ===================================================================
# Main
# ===================================================================
if __name__ == "__main__":
    print(f"Generating figures -> {OUT_DIR}\n")
    fig1_chsh_bounds()
    fig2_efficiency_landscape()
    fig3_postselection_mechanism()
    fig4_bell_test_schematic()
    fig5_timeline()
    print("\nDone -- all 5 figures written.")
