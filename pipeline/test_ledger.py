"""Checks that fail if the ledger's credibility rules break. Run after ledger.py."""

import datetime
import json

from config import MANUAL
from ledger import validate

doc = json.loads((MANUAL / "obligations.json").read_text())
rows = doc["obligations"]

assert validate(doc) == [], validate(doc)

# every due date parses, and none silently lands on a weekend. A statutory clock that
# falls on a Saturday rolls to the next business day; if a row stores a weekend date the
# rollover was almost certainly forgotten.
for r in rows:
    if not r.get("due"):
        continue
    d = datetime.date.fromisoformat(r["due"])
    if d.weekday() >= 5:
        assert "roll" in (r.get("due_basis") or "").lower(), (
            f"{r['id']}: due {d} is a {d.strftime('%A')} with no rollover note"
        )

# the CGJ 60-day clock is the one that actually needed rolling: 60 days from 2026-06-23
# is Saturday 2026-08-22, so the stored date must be the following Monday.
cgj = next(r for r in rows if r["id"] == "cgj-at-scale-60day")
raw = datetime.date(2026, 6, 23) + datetime.timedelta(days=60)
assert raw == datetime.date(2026, 8, 22) and raw.weekday() == 5
assert cgj["due"] == "2026-08-24", cgj["due"]

# the 90-day sibling needs no roll: it lands on a Monday already.
cgj90 = next(r for r in rows if r["id"] == "cgj-at-scale-90day")
assert datetime.date(2026, 6, 23) + datetime.timedelta(days=90) == datetime.date.fromisoformat(cgj90["due"])

# a row that says it was filed must not also claim to be undiscoverable-because-absent
for r in rows:
    if r["status"] in ("filed", "partial"):
        assert r["discoverability"] != "absent", f"{r['id']}: filed but discoverability absent"
    if r["status"] == "missing":
        assert r["discoverability"] == "absent", f"{r['id']}: missing but discoverability {r['discoverability']}"

# anything that could still flip needs terms for the monitor to watch
for r in rows:
    if r["status"] in ("missing", "not_yet_due", "partial"):
        assert r.get("watch_terms"), f"{r['id']}: no watch_terms, monitor can never flip it"

# the thesis row must keep carrying its correction, since the whole method rests on it
thesis = next(r for r in rows if r["id"] == "ch124-semiannual-report")
assert thesis["status"] == "filed" and thesis["discoverability"] == "buried"
assert thesis.get("correction"), "the 124.4 correction must stay visible"

# request drafts must carry the phrase that actually triggers the next-day clock
for r in rows:
    req = r.get("request")
    if req:
        assert req["draft"].startswith("IMMEDIATE DISCLOSURE REQUEST"), f"{r['id']}: IDR phrase not at top"
        assert "1284" in req["draft"], f"{r['id']}: no custodian certificate ask"
        assert req.get("targets"), f"{r['id']}: request with no target agency"

missing = [r for r in rows if r["status"] == "missing"]
print(f"all checks passed: {len(rows)} obligations, {len(missing)} claimed missing, "
      f"{sum(len(r.get('checked', [])) for r in rows)} audit entries")
