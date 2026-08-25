"""Build the canonical facility list from raw snapshots + manual CSVs."""

import csv
import io

from config import MANUAL, SOURCE_CITATIONS
from fetch import latest
from geocode import geocode, load_cache, save_cache

COVERED = {
    # type -> (covered_by_ch124, reason)
    "shelter": (True, "Homeless Shelter under Admin Code Sec. 124.1 (City-funded)"),
    "sobering": (True, "Sobering centers are Behavioral Health Residential Care and Treatment Facilities under Sec. 124.1"),
    "stabilization": (True, "Crisis stabilization units are Behavioral Health Residential Care and Treatment Facilities under Sec. 124.1"),
    "psh": (False, "Permanent supportive housing is not a Covered Facility type under Ch. 124"),
    "otp": (False, "Outpatient clinics were removed from the enacted ordinance"),
    "bh_outpatient": (False, "Outpatient clinics were removed from the enacted ordinance"),
    "bh_residential": (False, "State-licensed residential treatment is excluded from the Sec. 124.1 definition"),
}


def _clean(name):
    return " ".join(name.replace("*", " ").split()).lower()


def _slug(name):
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")


def _base(name, ftype, subtype=None):
    covered, reason = COVERED[ftype]
    return {
        "id": _slug(name),
        "name": name,
        "type": ftype,
        "subtype": subtype,
        "covered_by_ch124": covered,
        "covered_reason": reason,
        "address": None,
        "lat": None,
        "lon": None,
        "district": None,
        "neighborhood": None,
        "beds_or_units": None,
        "unit_kind": "beds",
        "status": "open",
        "mapped": False,
        "confidence": "verified",
        "source_capacity": None,
        "source_location": None,
        "notes": "",
        "as_of": None,
    }


def shelters(cache):
    ml_rows = {}
    for r in csv.DictReader(io.StringIO(latest("ml_facilities"))):
        ml_rows[_clean(r["site"])] = r

    out = []
    for row in csv.DictReader((MANUAL / "shelters.csv").open()):
        f = _base(row["name"], "shelter", row["subtype"])
        f["beds_or_units"] = int(row["capacity"])
        f["confidence"] = row["confidence"]
        f["notes"] = row["notes"]
        f["as_of"] = "2026-04-13"
        f["source_capacity"] = SOURCE_CITATIONS["shelter_capacity"]
        ml = ml_rows.get(_clean(row["ml_site"])) if row["ml_site"] else None
        if ml:
            f["address"] = ml["address"].strip()
            f["lat"], f["lon"] = float(ml["LAT"]), float(ml["LON"])
            f["source_location"] = SOURCE_CITATIONS["shelter_locations"]
        elif row["ml_site"]:
            print(f"  WARNING: no Mission Local match for {row['ml_site']!r}")
        elif row["address"]:
            f["address"] = row["address"]
            f["source_location"] = row["location_source"]
            loc = geocode(row["address"], cache)
            if loc:
                f["lat"], f["lon"] = loc["lat"], loc["lon"]
        f["mapped"] = f["lat"] is not None
        out.append(f)
    return out


def other_facilities(cache):
    out = []
    for row in csv.DictReader((MANUAL / "other_facilities.csv").open()):
        f = _base(row["name"], row["type"])
        f["beds_or_units"] = int(row["capacity"]) if row["capacity"] else None
        f["address"] = row["address"]
        f["confidence"] = row["confidence"]
        f["notes"] = row["notes"]
        f["source_capacity"] = row["location_source"]
        f["source_location"] = row["location_source"]
        f["as_of"] = "2026-08-16"
        loc = geocode(row["address"], cache)
        if loc:
            f["lat"], f["lon"] = loc["lat"], loc["lon"]
            f["mapped"] = True
        out.append(f)
    return out


def psh():
    out = []
    for r in latest("psh"):
        complete = r.get("project_status") == "Construction Complete"
        f = _base(r["development_name"], "psh")
        f["subtype"] = r.get("general_housing_program")
        f["address"] = r.get("marketing_address")
        f["lat"] = float(r["latitude"]) if r.get("latitude") else None
        f["lon"] = float(r["longitude"]) if r.get("longitude") else None
        f["beds_or_units"] = int(float(r["homeless_units_rollup"]))
        f["unit_kind"] = "units"
        f["status"] = "open" if complete else "in_construction"
        f["mapped"] = f["lat"] is not None
        f["source_capacity"] = SOURCE_CITATIONS["psh"]
        f["source_location"] = SOURCE_CITATIONS["psh"]
        f["as_of"] = "2026-05-21"
        f["notes"] = f"{r.get('total_project_units', '?')} total units; homeless-dedicated shown"
        f["_src_district"] = r.get("supervisor_district")
        out.append(f)
    return out


def behavioral_health(cache):
    out = []
    for r in latest("bh"):
        if r.get("city") != "San Francisco" or not r.get("address_line_1"):
            continue
        tt = r.get("treatment_type") or ""
        if "Opioid Treatment" in tt:
            ftype = "otp"
        elif "Residential" in tt or "Withdrawal" in tt:
            ftype = "bh_residential"
        else:
            ftype = "bh_outpatient"
        f = _base(f"{r['program_name']}", ftype)
        f["id"] = _slug(f"{r['program_name']}-{r.get('site_id', '')}")
        f["subtype"] = tt or r.get("provider_directory")
        f["address"] = r["address_line_1"]
        f["source_capacity"] = SOURCE_CITATIONS["bh"]
        f["source_location"] = SOURCE_CITATIONS["bh"]
        f["as_of"] = (r.get("data_as_of") or "")[:10] or None
        f["unit_kind"] = "sites"
        loc = geocode(r["address_line_1"], cache)
        if loc:
            f["lat"], f["lon"] = loc["lat"], loc["lon"]
            f["mapped"] = True
        out.append(f)
    return out


def build():
    cache = load_cache()
    facilities = []
    facilities += shelters(cache)
    facilities += other_facilities(cache)
    facilities += psh()
    facilities += behavioral_health(cache)
    save_cache(cache)
    unmapped = [f["name"] for f in facilities if not f["mapped"]]
    print(f"normalized {len(facilities)} facilities; unmapped: {len(unmapped)} {unmapped}")
    return facilities
