"""Emit a static SVG choropleth of shelter beds by district.

Replaces a 286KB interactive map bundle with about 5KB of markup that needs no
external tile server, screenshots cleanly, and prints. Fills are baked so the
file is self-contained.
"""

import json

from config import OUT

W, H, PAD = 640, 560, 14
# Sequential blue, mid-range so the light end stays visible on a dark ground too.
RAMP = ["#cfe0f6", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#104281"]


def _thin(pts, min_d):
    """Drop consecutive points closer than min_d. Cheap linear pass that shortens
    rings enough to keep the recursive simplifier off Python's recursion limit."""
    out = [pts[0]]
    for p in pts[1:]:
        lx, ly = out[-1]
        if (p[0] - lx) ** 2 + (p[1] - ly) ** 2 >= min_d * min_d:
            out.append(p)
    if out[-1] != pts[-1]:
        out.append(pts[-1])
    return out


def _rdp(pts, eps):
    """Ramer-Douglas-Peucker in projected pixel space. The map renders at 640px,
    so anything finer than half a pixel is bytes nobody can see."""
    if len(pts) < 3:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    dx, dy = bx - ax, by - ay
    n = (dx * dx + dy * dy) ** 0.5
    worst, idx = -1.0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dx * (ay - py) - (ax - px) * dy) / n if n else ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
        if d > worst:
            worst, idx = d, i
    if worst <= eps:
        return [pts[0], pts[-1]]
    return _rdp(pts[:idx + 1], eps)[:-1] + _rdp(pts[idx:], eps)


def rings(geom):
    if geom["type"] == "MultiPolygon":
        return [poly[0] for poly in geom["coordinates"]]
    return [geom["coordinates"][0]]


def build():
    geo = json.loads((OUT / "districts.geojson").read_text())
    roll = {d["district"]: d for d in json.loads((OUT / "rollup_districts.json").read_text())["districts"]}

    all_pts = [pt for f in geo["features"] for r in rings(f["geometry"]) for pt in r]
    lons = [p[0] for p in all_pts]
    lats = [p[1] for p in all_pts]
    lat0 = (min(lats) + max(lats)) / 2
    # equirectangular is fine over a city; correct x for latitude so shapes are not stretched
    import math
    kx = math.cos(math.radians(lat0))
    x0, x1 = min(lons) * kx, max(lons) * kx
    y0, y1 = min(lats), max(lats)
    scale = min((W - 2 * PAD) / (x1 - x0), (H - 2 * PAD) / (y1 - y0))
    ox = PAD + ((W - 2 * PAD) - (x1 - x0) * scale) / 2
    oy = PAD + ((H - 2 * PAD) - (y1 - y0) * scale) / 2

    def proj(lon, lat):
        return (ox + (lon * kx - x0) * scale, oy + (y1 - lat) * scale)

    shares = [roll.get(str(int(f["properties"]["sup_dist"])), {}).get("shelter_beds_share", 0)
              for f in geo["features"]]
    top = max(shares) or 1

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'role="img" aria-label="Share of San Francisco shelter and transitional housing beds by supervisor district">',
        '<title>Share of mapped shelter and transitional housing beds by supervisor district</title>',
    ]
    labels = []
    for f in geo["features"]:
        d = str(int(f["properties"]["sup_dist"]))
        r = roll.get(d, {})
        share = r.get("shelter_beds_share", 0)
        fill = RAMP[min(len(RAMP) - 1, int(round((share / top) * (len(RAMP) - 1))))]
        for ring in rings(f["geometry"]):
            simplified = _rdp(_thin([proj(*p) for p in ring], 0.7), 0.6)
            if len(simplified) < 3:
                continue
            pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in simplified)
            parts.append(f'<polygon points="{pts}" fill="{fill}" stroke="#fcfcfb" stroke-width="1.1"/>')
        big = max(rings(f["geometry"]), key=len)
        cx = sum(p[0] for p in big) / len(big)
        cy = sum(p[1] for p in big) / len(big)
        lx, ly = proj(cx, cy)
        dark = share / top > 0.55
        labels.append(
            f'<text x="{lx:.0f}" y="{ly:.0f}" text-anchor="middle" '
            f'fill="{"#fcfcfb" if dark else "#111"}" font-family="IBM Plex Sans, sans-serif" '
            f'font-size="13" font-weight="600">D{d}'
            f'<tspan x="{lx:.0f}" dy="14" font-size="11" font-weight="400">{share}%</tspan></text>'
        )
    parts += labels
    parts.append("</svg>")
    svg = "\n".join(parts)
    (OUT / "districts.svg").write_text(svg)
    print(f"choropleth: districts.svg written, {len(svg) // 1024}KB, max share {top}%")


if __name__ == "__main__":
    build()
