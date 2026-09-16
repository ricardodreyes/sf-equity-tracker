"""Redraw the README charts from data/manual/obligations.json and site/public/data.

    uv run --with matplotlib python docs/charts.py
"""
import json
import textwrap
from datetime import date, timedelta
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs"
obligations = json.loads((ROOT / "data/manual/obligations.json").read_text())["obligations"]
meta = json.loads((ROOT / "site/public/data/meta.json").read_text())
fair = json.loads((ROOT / "site/public/data/fairshare.json").read_text())
AS_OF = date.fromisoformat(meta["generated_at"][:10])
TODAY = date.today()

SURFACE, INK, INK2, MUTED, GRID, AXIS = "#fcfcfb", "#0b0b0b", "#52514e", "#898781", "#e1e0d9", "#c3c2b7"
BLUE, ORANGE, RED = "#2a78d6", "#eb6834", "#d03b3b"
plt.rcParams.update({
    "font.family": ["Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans"],
    "figure.facecolor": SURFACE, "axes.facecolor": SURFACE, "savefig.facecolor": SURFACE,
    "axes.edgecolor": AXIS, "axes.linewidth": 1, "axes.spines.top": False, "axes.spines.right": False,
    "grid.color": GRID, "grid.linewidth": 1, "axes.axisbelow": True,
    "xtick.color": MUTED, "ytick.color": MUTED, "text.color": INK, "axes.labelcolor": INK2,
    "font.size": 10, "legend.frameon": False,
})


def title(fig, text, sub=None):
    fig.text(0.03, 0.96, text, fontsize=14, fontweight="bold", color=INK, va="top")
    if sub:
        fig.text(0.03, 0.915, sub, fontsize=10, color=INK2, va="top")


def days(n):
    return f"{n} day" if n == 1 else f"{n} days"


D = date.fromisoformat
rows = sorted([o for o in obligations if o["due"]], key=lambda o: o["due"]) + [o for o in obligations if not o["due"]]
n = len(rows)
XMAX = max([TODAY] + [D(o["due"]) for o in rows if o["due"]]) + timedelta(days=6)

fig, ax = plt.subplots(figsize=(12, 10.5))
fig.subplots_adjust(top=0.83, bottom=0.05, left=0.30, right=0.70)
title(fig, "12 deadlines the City wrote for itself, and what happened to each",
      f"Due date, filing date, and whether the public can find the record. Days late counted to {TODAY}; every row last checked {AS_OF}.")
labels = []
for i, o in enumerate(rows):
    y = n - 1 - i
    due = D(o["due"]) if o["due"] else None
    filed = D(o["filed_on"]) if o.get("filed_on") else None
    st, disc = o["status"], o["discoverability"]
    found = {"published": "published", "buried": "buried", "absent": "not found"}[disc]
    hollow = disc == "buried"
    if due:
        ax.plot([due], [y], marker="o", ms=8, mfc=SURFACE, mec=INK, mew=1.5, zorder=4)
    if st == "missing":
        ax.plot([due, TODAY], [y, y], color=RED, lw=3, solid_capstyle="butt", zorder=3)
        label = f"missing, {days((TODAY - due).days)} late"
        if o.get("due_certainty") == "contested":
            label += ", extension asked for before the deadline"
    elif st == "not_yet_due":
        label = "not yet due"
    elif st in ("filed", "partial"):
        window = o.get("filed_window")
        if isinstance(window, dict):
            a, b = D(window["from"]), D(window["to"])
            ax.plot([a, b], [y, y], color=BLUE, lw=7, alpha=0.3, solid_capstyle="butt", zorder=2)
            marker_at, when = b, "receipt window spans the deadline"
        else:
            marker_at = filed
            late = (filed - due).days
            if late > 0:
                ax.plot([due, filed], [y, y], color=RED, lw=3, solid_capstyle="butt", zorder=3)
                when = ("up to " if window else "") + f"{days(late)} late"
            elif late < 0:
                when = f"{days(-late)} early"
            else:
                when = "on time"
        ax.plot([marker_at], [y], marker="o", ms=8, mfc=SURFACE if hollow else BLUE, mec=BLUE, mew=2, zorder=5)
        label = f"{st}, {when}, {found}"
    elif st == "undeterminable":
        label = "no computable deadline: the enacted text stops mid-sentence"
    else:
        label = "repealed by Ordinance 137-26"
    ax.text(XMAX + timedelta(days=4), y, label, va="center", fontsize=9, color=INK2, clip_on=False)
    labels.append(textwrap.fill(o["title"], 34) + "\n" + textwrap.fill(o["law"]["citation"], 40))

ax.set_yticks(range(n)[::-1], labels, fontsize=8.5)
ax.set_ylim(-0.7, n - 0.3)
ax.set_xlim(date(2025, 9, 1), XMAX)
ax.axvline(AS_OF, color=AXIS, lw=1, zorder=1)
ax.text(AS_OF - timedelta(days=3), -0.6, f"last checked {AS_OF}", ha="right", va="bottom", fontsize=8.5, color=MUTED)
ax.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
ax.grid(axis="x")
ax.spines["left"].set_visible(False)
ax.tick_params(axis="y", length=0)
handles = [
    Line2D([], [], marker="o", ls="", ms=8, mfc=SURFACE, mec=INK, mew=1.5, label="deadline in the law"),
    Line2D([], [], marker="o", ls="", ms=8, mfc=BLUE, mec=BLUE, mew=2, label="filed, has its own page or catalogue record"),
    Line2D([], [], marker="o", ls="", ms=8, mfc=SURFACE, mec=BLUE, mew=2, label="filed, exists only inside a meeting packet"),
    Line2D([], [], color=RED, lw=3, label="days past the deadline"),
]
ax.legend(handles=handles, loc="lower left", bbox_to_anchor=(0, 1.01), ncol=2, fontsize=9, handlelength=1.6)
fig.savefig(OUT / "deadlines.png", dpi=150)
plt.close(fig)

ds = fair["districts"]
fig, ax = plt.subplots(figsize=(11, 5.6))
fig.subplots_adjust(top=0.8, bottom=0.1, left=0.08, right=0.97)
title(fig, "Where the shelter beds are, against where unsheltered people are",
      "Admin Code 124.2(b)'s Fair Share Rule, run by supervisor district. The law defines it by neighborhood; that table has never been published.")
ys = list(range(len(ds)))[::-1]
beds = [d["bed_share"] for d in ds]
unsh = [d["unsheltered_share"] for d in ds]
ax.barh([y + 0.19 for y in ys], beds, 0.34, color=BLUE, label=f"share of the {fair['totals']['beds']:,} shelter beds with a known address")
ax.barh([y - 0.19 for y in ys], unsh, 0.34, color=ORANGE, label=f"share of the {fair['totals']['unsheltered']:,} unsheltered people counted in 2024")
for y, b, u in zip(ys, beds, unsh):
    ax.text(b + 0.5, y + 0.19, f"{b:.1f}%", va="center", fontsize=8.5, color=INK)
    ax.text(u + 0.5, y - 0.19, f"{u:.1f}%", va="center", fontsize=8.5, color=INK)
ax.set_yticks(ys, [f"District {d['district']}" for d in ds])
ax.set_xticks([])
ax.spines["bottom"].set_visible(False)
ax.spines["left"].set_visible(False)
ax.tick_params(axis="y", length=0)
ax.set_xlim(0, max(beds + unsh) + 8)
ax.legend(loc="lower right", fontsize=9)
fig.savefig(OUT / "fair-share.png", dpi=150)
plt.close(fig)
print("as of", AS_OF)
for d in ds:
    print(d["district"], d["bed_share"], d["unsheltered_share"], d["over_served"])
