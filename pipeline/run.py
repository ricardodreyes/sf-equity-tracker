"""End to end: fetch -> normalize -> assign -> rollup -> fairshare -> ledger.

`--no-fetch` reuses the raw snapshots already on disk.
"""

import sys

import assign
import fairshare
import fetch
import ledger
import normalize
import rollup


def main():
    if "--no-fetch" not in sys.argv:
        fetch.main()
    facilities = normalize.build()
    facilities = assign.run(facilities)
    rollup.run(facilities)
    fairshare.build()
    ledger.main()
    print("done")


if __name__ == "__main__":
    main()
