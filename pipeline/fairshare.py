"""Run the ordinance's Fair Share test at district level.

Sec. 124.2(b) is defined on Analysis Neighborhoods, but no neighborhood-level
unsheltered count has ever been published, so this is explicitly a proxy. The
output carries its own caveats so the site cannot render the numbers naked.
"""

import json

from config import MANUAL, OUT

PIT = MANUAL / "pit_2024_district.json"


def build():
    pit = json.loads(PIT.read_text())
    unsheltered = pit["unsheltered_2024"]
    districts = json.loads((OUT / "rollup_districts.json").read_text())["districts"]
    beds = {d["district"]: d["shelter_beds"] for d in districts}

    total_u = sum(unsheltered.values())
    total_b = sum(beds.values())

    rows = []
    for d in sorted(unsheltered, key=int):
        b, u = beds.get(d, 0), unsheltered[d]
        bed_share = round(100 * b / total_b, 1)
        unsh_share = round(100 * u / total_u, 1)
        rows.append({
            "district": d,
            "beds": b,
            "bed_share": bed_share,
            "unsheltered": u,
            "unsheltered_share": unsh_share,
            # the statutory test: over-served means no new City-funded Covered Facility
            "over_served": bed_share > unsh_share,
            "ratio": round(bed_share / unsh_share, 2) if unsh_share else None,
        })

    out = {
        "test": "SF Admin Code Sec. 124.2(b) Fair Share Rule, applied at supervisorial district level",
        "is_proxy": True,
        "proxy_caveat": pit["note"],
        "bed_source": "HSH Temporary Shelter Programs report, 2026-04-13",
        "bed_coverage": {"mapped": total_b, "citywide_hic_2026": 5148,
                         "note": f"These are the {total_b:,} beds we can place at a specific address. "
                                 f"The 2026 Housing Inventory Count reports 5,148 shelter and transitional "
                                 f"beds citywide, so roughly {round(100 * (1 - total_b / 5148))}% of the "
                                 f"city's beds are not represented and every share below is approximate."},
        "unsheltered_source": pit["source"],
        "unsheltered_source_url": pit["source_url"],
        "excluded": pit["excluded"],
        "totals": {"beds": total_b, "unsheltered": total_u},
        "districts": rows,
        "over_served": [r["district"] for r in rows if r["over_served"]],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "fairshare.json").write_text(json.dumps(out, indent=1))
    blocked = ", ".join("D" + d for d in out["over_served"])
    print(f"fairshare: {total_b} beds vs {total_u} unsheltered; over-served (blocked from new siting): {blocked}")
    return out


if __name__ == "__main__":
    build()
