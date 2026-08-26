"""Search Board of Supervisors agendas, the venue that produced three false positives.

Every departmental filing to the Board is listed in the Petitions and Communications
section of a meeting agenda. Those agendas are plain PDFs at a predictable path, so
this venue was always checkable. The earlier conclusion that Legistar is unscrapeable
and therefore Board filings are unobservable was a non sequitur: the agendas are not
in Legistar.

Requires `pdftotext` (poppler), which is already present on this machine. There is no
stdlib PDF text extractor and a hand-rolled one would be the wrong kind of clever.
"""

import datetime
import re
import subprocess
import urllib.error

from config import RAW
from fetch import get

CACHE = RAW / "board_agendas"
HOSTS = [
    "https://media.api.sf.gov/documents/bag{stamp}_agenda.pdf",
    "https://sfbos.archive.sf.gov/sites/default/files/bag{stamp}_agenda.pdf",
]


def _stamp(d):
    return d.strftime("%m%d%y")


def sync(start, end):
    """Cache every agenda PDF the Board published between two ISO dates.

    The Board sits on Tuesdays, so only Tuesdays are tried. A missing agenda is a
    normal result (recess, cancellation), not an error.
    """
    CACHE.mkdir(parents=True, exist_ok=True)
    d = datetime.date.fromisoformat(start)
    last = datetime.date.fromisoformat(end)
    d += datetime.timedelta(days=(1 - d.weekday()) % 7)  # advance to Tuesday
    found, missing = [], []
    while d <= last:
        stamp = _stamp(d)
        path = CACHE / f"bag{stamp}_agenda.pdf"
        if path.exists():
            found.append(d)
        else:
            for tmpl in HOSTS:
                try:
                    body = get(tmpl.format(stamp=stamp))
                except (urllib.error.HTTPError, urllib.error.URLError):
                    continue
                if body[:4] == b"%PDF":
                    path.write_bytes(body)
                    found.append(d)
                    break
            else:
                missing.append(d)
        d += datetime.timedelta(days=7)
    return found, missing


def _text(path):
    txt = path.with_suffix(".txt")
    if not txt.exists():
        subprocess.run(["pdftotext", str(path), str(txt)], check=True, capture_output=True)
    return txt.read_text(errors="replace")


def search(terms, context=1):
    """Every line across every cached agenda matching any term. Case insensitive."""
    rx = re.compile("|".join(terms), re.I)
    hits = []
    for pdf in sorted(CACHE.glob("bag*.pdf")):
        lines = _text(pdf).splitlines()
        for i, line in enumerate(lines):
            if rx.search(line):
                window = " ".join(x.strip() for x in lines[max(0, i - context): i + context + 2])
                hits.append({"agenda": pdf.stem, "line": i + 1, "text": " ".join(window.split())[:400]})
    return hits


if __name__ == "__main__":
    import json
    found, missing = sync("2025-07-01", "2026-08-31")
    print(f"agendas cached: {len(found)}, dates with no agenda: {len(missing)}")
    obligations = json.loads((RAW.parent / "manual" / "obligations.json").read_text())["obligations"]
    for o in obligations:
        if o["status"] not in ("missing", "not_yet_due", "partial"):
            continue
        hits = search(o["watch_terms"])
        print(f"\n[{o['id']}] terms={o['watch_terms']}")
        if not hits:
            print("   no mention in any Board agenda")
        for h in hits[:6]:
            print(f"   {h['agenda']}: {h['text'][:230]}")
