"""End to end: fetch -> normalize -> assign -> rollup -> fairshare -> choropleth -> ledger -> monitor.

`--no-fetch` reuses the raw snapshots already on disk.
"""

import sys

import assign
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
    print("done")


if __name__ == "__main__":
    main()
