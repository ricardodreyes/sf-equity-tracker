"""Validate the hand-curated obligations ledger and publish it to the site.

Deliberately computes no dates: days-overdue is derived in the browser so the
counter advances on its own without a rebuild.
"""

import json
import shutil

from config import MANUAL, OUT

SRC = MANUAL / "obligations.json"

STATUSES = {"missing", "filed", "partial", "undeterminable", "repealed", "not_yet_due"}
DISCOVERABILITY = {"published", "buried", "absent"}
UNDATED_OK = {"undeterminable", "repealed"}


def validate(doc):
    problems = []
    seen = set()
    for r in doc["obligations"]:
        rid = r.get("id", "<no id>")
        if rid in seen:
            problems.append(f"{rid}: duplicate id")
        seen.add(rid)

        for field in ("title", "what", "law", "owed_by", "status", "discoverability", "why_it_matters"):
            if not r.get(field):
                problems.append(f"{rid}: missing {field}")

        if r.get("status") not in STATUSES:
            problems.append(f"{rid}: bad status {r.get('status')!r}")
        if r.get("discoverability") not in DISCOVERABILITY:
            problems.append(f"{rid}: bad discoverability {r.get('discoverability')!r}")

        law = r.get("law") or {}
        for field in ("citation", "quote", "ordinance"):
            if not law.get(field):
                problems.append(f"{rid}: law.{field} missing")

        if r.get("due") is None and r.get("status") not in UNDATED_OK:
            problems.append(f"{rid}: null due date but status is {r.get('status')}")

        # the credibility rule, enforced in code rather than in a doc:
        # an absence claim must carry its search log and must pre-answer the obvious rebuttal.
        if r.get("status") == "missing":
            if not r.get("checked"):
                problems.append(f"{rid}: claims missing with no audit trail")
            if not r.get("considered_rejected") and not r.get("no_near_miss_reason"):
                problems.append(f"{rid}: claims missing without a considered-and-rejected list or a stated reason there is none")

        for c in r.get("checked", []):
            for field in ("url", "method", "result", "at"):
                if not c.get(field):
                    problems.append(f"{rid}: audit entry missing {field}")

        if r.get("status") in ("filed", "partial") and not r.get("filed_on"):
            problems.append(f"{rid}: status {r['status']} but no filed_on")

    return problems


def main():
    doc = json.loads(SRC.read_text())
    problems = validate(doc)
    if problems:
        for p in problems:
            print(f"  INVALID {p}")
        raise SystemExit(f"{len(problems)} problems in {SRC.name}")
    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC, OUT / "obligations.json")
    rows = doc["obligations"]
    counts = {}
    for r in rows:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    print(f"ledger: {len(rows)} obligations valid -> {(OUT / 'obligations.json')}")
    print("  " + ", ".join(f"{k} {v}" for k, v in sorted(counts.items())))


if __name__ == "__main__":
    main()
