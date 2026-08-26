"""Detect when a tracked document actually shows up.

Enumerates new sf.gov CMS documents since the last run and matches their titles
against each obligation's watch_terms. This is what flips a row from missing to
filed, so it errs toward reporting too much rather than too little.

Deliberately does NOT scrape the codified Municipal Code: the code publisher lags
the ordinances (Admin Code 106.5(d) still appears live months after being struck),
so repeals are tracked by hand.
"""

import json
import re
import urllib.parse

from config import MANUAL, ROOT
from fetch import get

STATE = MANUAL / "monitor_state.json"
API = "https://api.sf.gov/api/v2/documents/"


def load_state():
    return json.loads(STATE.read_text()) if STATE.exists() else {"last_id": 0}


def newest_documents(since_id, page_size=500, max_pages=8):
    """Newest-first pages until we reach the id we already saw."""
    fresh = []
    for page in range(max_pages):
        q = urllib.parse.urlencode(
            {"order": "-id", "limit": page_size, "offset": page * page_size,
             "fields": "title,created_at"}
        )
        items = json.loads(get(f"{API}?{q}")).get("items", [])
        if not items:
            break
        for it in items:
            if it["id"] <= since_id:
                return fresh
            fresh.append(it)
        if len(items) < page_size:
            break
    return fresh


def main():
    state = load_state()
    first_run = not STATE.exists()
    since = state.get("last_id", 0)
    obligations = json.loads((MANUAL / "obligations.json").read_text())["obligations"]
    watched = [(o["id"], o["title"], re.compile("|".join(o["watch_terms"]), re.I))
               for o in obligations if o.get("watch_terms")]

    if first_run:
        # Bootstrap: record where the catalogue is today and report nothing. Without this the
        # first run would replay the entire back catalogue as if it were breaking news.
        q = urllib.parse.urlencode({"order": "-id", "limit": 1, "fields": "title,created_at"})
        top = json.loads(get(f"{API}?{q}"))["items"][0]["id"]
        STATE.write_text(json.dumps({"last_id": top, "bootstrapped": True}, indent=1))
        print(f"monitor: first run, baseline set at document id {top}. Nothing to report yet.")
        return

    docs = newest_documents(since)
    if not docs:
        print(f"monitor: no new documents since id {since}")
        return

    hits = []
    for d in docs:
        title = d.get("title") or ""
        for oid, otitle, rx in watched:
            if rx.search(title):
                hits.append((oid, otitle, d))

    # Title matching alone is why this script missed both Chapter 124 filings: departmental
    # reports to the Board live inside PDFs titled "bag012726_agenda" with empty descriptions.
    # The agenda corpus is searched by body text, which is where those filings actually appear.
    try:
        import board_agendas
        found, _ = board_agendas.sync("2025-07-01", "2026-12-31")
        for oid, otitle, _rx in watched:
            terms = next(o["watch_terms"] for o in obligations if o["id"] == oid)
            for h in board_agendas.search(terms):
                hits.append((oid, otitle, {"id": h["agenda"], "title": h["text"][:160],
                                           "created_at": "", "venue": "board agenda"}))
    except Exception as e:
        print(f"  WARNING board agenda sweep failed: {e}. Absence claims are not safe to publish "
              f"until it runs, because that venue has falsified three of them.")

    top = max(d["id"] for d in docs)
    STATE.write_text(json.dumps({"last_id": top, "checked_through": docs[0].get("created_at")}, indent=1))

    print(f"monitor: {len(docs)} new documents (ids {since + 1} to {top})")
    if not hits:
        print("  no candidates for any tracked obligation")
        return
    print(f"  {len(hits)} CANDIDATE(S) to review by hand:")
    for oid, otitle, d in hits:
        print(f"    [{oid}] {otitle}")
        print(f"      doc {d['id']}: {d.get('title')}  ({(d.get('created_at') or '')[:10]})")
        print(f"      https://api.sf.gov/api/v2/documents/{d['id']}/")
    print("\n  A candidate is a lead, not a status change. Verify it is the actual deliverable,")
    print("  then update data/manual/obligations.json by hand and re-run ledger.py.")


if __name__ == "__main__":
    main()
