"""Point-in-polygon for GeoJSON Polygon/MultiPolygon. Ray casting; ring 0 is the
outer boundary, later rings are holes."""


def _in_ring(lon, lat, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def in_geom(lon, lat, geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for poly in polys:
        if _in_ring(lon, lat, poly[0]) and not any(_in_ring(lon, lat, h) for h in poly[1:]):
            return True
    return False


def assign(lon, lat, rows, geom_key, label_key):
    for row in rows:
        geom = row.get(geom_key)
        if geom and in_geom(lon, lat, geom):
            return row[label_key]
    return None
