"""Aggregate facilities per supervisor district and Analysis Neighborhood and
write everything the site consumes."""

import datetime
import json

from config import CONTEXT, OUT, SOURCE_CITATIONS
from fetch import latest


def _populations():
    rows = latest("population")
    latest_year = max(int(float(r["end_year"])) for r in rows)
    pops = {}
    for r in rows:
        if int(float(r["end_year"])) == latest_year and r.get("unit") == "population count":
            dist = str(int(r["geography_name"].split()[-1]))
            pops[dist] = int(float(r["estimate"]))
    return pops, latest_year


def _feature_collection(rows, geom_key, props):
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": r[geom_key],
                "properties": {k: r.get(k) for k in props},
            }
            for r in rows
        ],
    }


def run(facilities):
    OUT.mkdir(parents=True, exist_ok=True)
    pops, pop_year = _populations()

    dist_rollup = {
        str(d): {
            "district": str(d),
            "population": pops.get(str(d)),
            "shelter_beds": 0,
            "shelter_sites": 0,
            "psh_units": 0,
            "psh_sites": 0,
            "psh_units_in_construction": 0,
            "bh_residential_sites": 0,
            "bh_outpatient_sites": 0,
            "otp_sites": 0,
            "sobering_sites": 0,
        }
        for d in range(1, 12)
    }
    nhood_rollup = {}
    unassigned = {"shelter_beds": 0, "names": []}

    for f in facilities:
        d = dist_rollup.get(str(f["district"])) if f["district"] else None
        n = None
        if f["neighborhood"]:
            n = nhood_rollup.setdefault(
                f["neighborhood"],
                {"neighborhood": f["neighborhood"], "shelter_beds": 0, "shelter_sites": 0, "psh_units": 0, "bh_sites": 0},
            )
        beds = f["beds_or_units"] or 0
        if f["type"] == "shelter":
            if d:
                d["shelter_beds"] += beds
                d["shelter_sites"] += 1
            else:
                unassigned["shelter_beds"] += beds
                unassigned["names"].append(f["name"])
            if n:
                n["shelter_beds"] += beds
                n["shelter_sites"] += 1
        elif f["type"] == "psh":
            if f["status"] == "open":
                if d:
                    d["psh_units"] += beds
                    d["psh_sites"] += 1
                if n:
                    n["psh_units"] += beds
            elif d:
                d["psh_units_in_construction"] += beds
        elif f["type"] in ("sobering", "stabilization"):
            if d:
                d["sobering_sites"] += 1
        elif f["type"] == "otp":
            if d:
                d["otp_sites"] += 1
            if n:
                n["bh_sites"] += 1
        elif f["type"] in ("bh_residential", "bh_outpatient"):
            if d:
                d[f["type"] + "_sites"] += 1
            if n:
                n["bh_sites"] += 1

    mapped_beds = sum(r["shelter_beds"] for r in dist_rollup.values())
    total_psh = sum(r["psh_units"] for r in dist_rollup.values())
    for r in dist_rollup.values():
        r["shelter_beds_share"] = round(100 * r["shelter_beds"] / mapped_beds, 1) if mapped_beds else 0
        r["psh_units_share"] = round(100 * r["psh_units"] / total_psh, 1) if total_psh else 0
        r["shelter_beds_per_10k"] = round(r["shelter_beds"] / r["population"] * 10000, 1) if r["population"] else None
    nhood_beds = sum(r["shelter_beds"] for r in nhood_rollup.values())
    for r in nhood_rollup.values():
        r["shelter_beds_share"] = round(100 * r["shelter_beds"] / nhood_beds, 1) if nhood_beds else 0

    # change tracking vs previous published facilities.json
    changes = {"generated_at": datetime.date.today().isoformat(), "added": [], "removed": [], "capacity_changed": []}
    prev_path = OUT / "facilities.json"
    if prev_path.exists():
        prev = {f["id"]: f for f in json.loads(prev_path.read_text())["facilities"]}
        cur = {f["id"]: f for f in facilities}
        changes["added"] = sorted(cur.keys() - prev.keys())
        changes["removed"] = sorted(prev.keys() - cur.keys())
        changes["capacity_changed"] = sorted(
            k for k in cur.keys() & prev.keys() if cur[k]["beds_or_units"] != prev[k]["beds_or_units"]
        )

    meta = {
        "generated_at": datetime.datetime.now().isoformat(timespec="seconds"),
        "population_acs_end_year": pop_year,
        "facility_count": len(facilities),
        "mapped_shelter_beds": mapped_beds,
        "unassigned_shelter_beds": unassigned["shelter_beds"],
        "sources": SOURCE_CITATIONS,
        "context": CONTEXT,
    }

    (OUT / "facilities.json").write_text(json.dumps({"facilities": facilities}, indent=1))
    (OUT / "facilities.geojson").write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [f["lon"], f["lat"]]},
                        "properties": {
                            k: f[k]
                            for k in (
                                "id", "name", "type", "subtype", "covered_by_ch124", "address",
                                "district", "neighborhood", "beds_or_units", "unit_kind",
                                "status", "confidence", "as_of",
                            )
                        },
                    }
                    for f in facilities
                    if f["mapped"]
                ],
            }
        )
    )
    (OUT / "districts.geojson").write_text(
        json.dumps(_feature_collection(latest("districts_trimmed"), "the_geom", ["sup_dist", "sup_name"]))
    )
    (OUT / "neighborhoods.geojson").write_text(
        json.dumps(_feature_collection(latest("neighborhoods"), "the_geom", ["nhood"]))
    )
    (OUT / "rollup_districts.json").write_text(
        json.dumps({"districts": list(dist_rollup.values()), "unassigned": unassigned}, indent=1)
    )
    (OUT / "rollup_neighborhoods.json").write_text(
        json.dumps({"neighborhoods": sorted(nhood_rollup.values(), key=lambda r: -r["shelter_beds"])}, indent=1)
    )
    (OUT / "meta.json").write_text(json.dumps(meta, indent=1))
    (OUT / "changes.json").write_text(json.dumps(changes, indent=1))

    print(f"rollup: {mapped_beds} mapped shelter beds, {unassigned['shelter_beds']} unassigned ({', '.join(unassigned['names'])})")
    for r in sorted(dist_rollup.values(), key=lambda r: -r["shelter_beds"]):
        print(f"  D{r['district']}: {r['shelter_beds']} beds ({r['shelter_beds_share']}%), {r['psh_units']} PSH units, pop {r['population']}")
