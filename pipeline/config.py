from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
MANUAL = ROOT / "data" / "manual"
OUT = ROOT / "site" / "public" / "data"

SODA = "https://data.sfgov.org/resource"

# name -> (base_url, params_dict_or_None, ext)
SOURCES = {
    "districts_full": (f"{SODA}/cqbw-m5m3.json", {"$limit": "50"}, "json"),
    "districts_trimmed": (f"{SODA}/hcgx-vtsb.json", {"$limit": "50"}, "json"),
    "neighborhoods": (f"{SODA}/j2bu-swwd.json", {"$limit": "100"}, "json"),
    "population": (
        f"{SODA}/4qbq-hvtt.json",
        {
            "$where": "geography='supervisor districts' AND demographic_category='all'",
            "$limit": "200",
        },
        "json",
    ),
    "psh": (
        f"{SODA}/pyxv-n29e.json",
        {"$where": "homeless_units_rollup>0", "$limit": "500"},
        "json",
    ),
    "bh": (f"{SODA}/p6m6-pkpk.json", {"$limit": "500"}, "json"),
    # Mission Local facility list (built from an HSH records request, April 2025);
    # used for shelter addresses/coords only, capacities come from the HSH 4/13/26 report.
    "ml_facilities": ("https://datawrapper.dwcdn.net/Gr334/3/dataset.csv", None, "csv"),
}

SOURCE_CITATIONS = {
    "shelter_capacity": "HSH Temporary Shelter Programs report, 4/13/2026, https://media.api.sf.gov/documents/HSH_Shelter_System_Capacity_and_Occupancy_Report_4.13.26.pdf",
    "shelter_locations": "Mission Local facility dataset (from HSH records request), https://missionlocal.org/2025/04/sf-map-homeless-shelters-restrictions/",
    "psh": "DataSF pyxv-n29e (MOHCD Affordable Housing Portfolio)",
    "bh": "DataSF p6m6-pkpk (DPH MH and SUD Provider Directory)",
    "districts": "DataSF cqbw-m5m3 (Current Supervisor Districts, 2022 lines)",
    "neighborhoods": "DataSF j2bu-swwd (Analysis Neighborhoods, the ordinance's ACS Neighborhood Profile geography)",
    "population": "DataSF 4qbq-hvtt (ACS 5-year, supervisor districts)",
}

# Citywide context, cited on the site (not computed from our layers).
CONTEXT = {
    "hic_2026_shelter_th_beds": 5148,
    "hic_2026_psh_oph_beds": 16958,
    "pit_2026_total": 7973,
    "pit_2026_unsheltered": 3400,
    "context_source": "HSH 2026 HIC & PIT results, LHCB 6/1/2026, https://media.api.sf.gov/documents/2026_HIC__PIT_Results_-_LHCB.pdf",
}
