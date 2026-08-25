"""District + neighborhood assignment via point-in-polygon, then manual overrides."""

import csv

from config import MANUAL
from fetch import latest
from pip import assign as pip_assign


def run(facilities):
    districts = latest("districts_full")
    neighborhoods = latest("neighborhoods")
    for f in facilities:
        if not f["mapped"]:
            continue
        f["district"] = pip_assign(f["lon"], f["lat"], districts, "multipolygon", "sup_dist")
        f["neighborhood"] = pip_assign(f["lon"], f["lat"], neighborhoods, "the_geom", "nhood")
        if f["district"] is None:
            print(f"  WARNING: no district for {f['name']} at {f['lat']},{f['lon']}")
        src = f.pop("_src_district", None)
        if src and f["district"] and str(int(src)) != str(int(f["district"])):
            print(f"  WARNING: district mismatch for {f['name']}: computed {f['district']}, source says {src}")

    for row in csv.DictReader((MANUAL / "overrides.csv").open()):
        for f in facilities:
            if f["name"] == row["name"]:
                f[row["field"]] = row["value"]
                print(f"  override applied: {row['name']}.{row['field']} = {row['value']}")
    return facilities
