"""Smallest checks that fail if the logic breaks: pip geometry, known-point
district assignment, output schema, and rollup arithmetic. Run after run.py."""

import csv
import json

from config import MANUAL, OUT
from fetch import latest
from pip import assign, in_geom

# pip: unit square with a hole
SQUARE = {
    "type": "Polygon",
    "coordinates": [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]],
    ],
}
assert in_geom(2, 2, SQUARE)
assert not in_geom(5, 5, SQUARE)  # in the hole
assert not in_geom(11, 5, SQUARE)

# known points against the real district file
districts = latest("districts_full")
tests = {
    (-122.4058, 37.8024): "3",   # Coit Tower
    (-122.5090, 37.7600): "4",   # Ocean Beach at Judah
    (-122.3704, 37.8230): "6",   # Treasure Island
}
for (lon, lat), want in tests.items():
    got = assign(lon, lat, districts, "multipolygon", "sup_dist")
    assert str(got) == want, f"({lon},{lat}) -> D{got}, expected D{want}"

# outputs
facilities = json.loads((OUT / "facilities.json").read_text())["facilities"]
roll = json.loads((OUT / "rollup_districts.json").read_text())
required = {"id", "name", "type", "covered_by_ch124", "beds_or_units", "district", "mapped", "as_of", "source_capacity"}
for f in facilities:
    missing = required - f.keys()
    assert not missing, f"{f.get('name')} missing {missing}"
    if f["mapped"]:
        assert f["district"] in {str(d) for d in range(1, 12)}, f"{f['name']} bad district {f['district']}"

# every shelter bed accounted for: mapped district beds + unassigned == manual CSV total
csv_total = sum(int(r["capacity"]) for r in csv.DictReader((MANUAL / "shelters.csv").open()))
mapped = sum(d["shelter_beds"] for d in roll["districts"])
assert mapped + roll["unassigned"]["shelter_beds"] == csv_total, (mapped, roll["unassigned"], csv_total)

shares = sum(d["shelter_beds_share"] for d in roll["districts"])
assert 99.0 <= shares <= 101.0, shares

by_name = {f["name"]: f for f in facilities}
assert by_name["MSC-South"]["district"] == "6"
assert by_name["Bayview SAFE"]["district"] == "10"

print(f"all checks passed ({len(facilities)} facilities, {csv_total} shelter beds accounted for)")
