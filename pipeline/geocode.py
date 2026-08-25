"""US Census Bureau geocoder (free, no key) with a local cache so re-runs are
offline. A cached null means the geocoder found no match; delete the entry in
data/manual/geocache.json to retry an address."""

import json
import time
import urllib.parse
import urllib.request

from config import MANUAL

CACHE_PATH = MANUAL / "geocache.json"


def load_cache():
    return json.loads(CACHE_PATH.read_text()) if CACHE_PATH.exists() else {}


def save_cache(cache):
    CACHE_PATH.write_text(json.dumps(cache, indent=1, sort_keys=True))


def geocode(address, cache):
    key = address.strip().lower()
    if key in cache:
        return cache[key]
    q = urllib.parse.urlencode(
        {
            "address": f"{address}, San Francisco, CA",
            "benchmark": "Public_AR_Current",
            "format": "json",
        }
    )
    url = f"https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?{q}"
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            d = json.load(r)
        matches = d.get("result", {}).get("addressMatches", [])
        result = (
            {"lat": matches[0]["coordinates"]["y"], "lon": matches[0]["coordinates"]["x"]}
            if matches
            else None
        )
    except Exception as e:
        print(f"  geocode error for {address!r}: {e}")
        return None  # transient failure: do not cache
    cache[key] = result
    time.sleep(0.15)
    return result
