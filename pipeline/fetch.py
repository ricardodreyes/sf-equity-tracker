"""Snapshot every source into data/raw/<name>/<date>.<ext>."""

import datetime
import json
import urllib.parse
import urllib.request

from config import RAW, ROOT, SOURCES

HEADERS = {"User-Agent": "sf-equity-tracker/0.1 (civic data project)"}


def get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def latest(name):
    """Newest raw snapshot for a source, parsed."""
    d = RAW / name
    files = sorted(d.iterdir()) if d.exists() else []
    if not files:
        raise FileNotFoundError(f"no raw snapshot for {name}; run fetch.py")
    p = files[-1]
    if p.suffix == ".json":
        return json.loads(p.read_text())
    return p.read_text()


def main():
    today = datetime.date.today().isoformat()
    for name, (base, params, ext) in SOURCES.items():
        url = f"{base}?{urllib.parse.urlencode(params)}" if params else base
        data = get(url)
        if ext == "json":
            json.loads(data)  # validate before writing
        d = RAW / name
        d.mkdir(parents=True, exist_ok=True)
        p = d / f"{today}.{ext}"
        p.write_bytes(data)
        print(f"fetched {name}: {len(data)} bytes -> {p.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
