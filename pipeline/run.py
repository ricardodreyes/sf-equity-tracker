"""End to end: fetch -> normalize -> assign -> rollup -> fairshare -> choropleth -> ledger -> monitor.

`--no-fetch` reuses the raw snapshots already on disk.
"""

import sys

import assign
import board_agendas
import choropleth
import fairshare
import fetch
import ledger
import monitor
import normalize
import rollup


def main():
    if "--no-fetch" not in sys.argv:
        fetch.main()
    facilities = normalize.build()
    facilities = assign.run(facilities)
    rollup.run(facilities)
    fairshare.build()
    choropleth.build()
    ledger.main()
    monitor.main()
    # the venue that produced three false positives; sync so searches run against fresh agendas
    found, missing = board_agendas.sync("2025-07-01", "2026-12-31")
    print(f"board agendas: {len(found)} cached, {len(missing)} dates with none published")
    print("done")


if __name__ == "__main__":
    main()
