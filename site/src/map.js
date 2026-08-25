import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { header, j, fmt } from "./common.js";

header("map");

const [facilities, districts, rollup, meta] = await Promise.all([
  j("/data/facilities.geojson"),
  j("/data/districts.geojson"),
  j("/data/rollup_districts.json"),
  j("/data/meta.json"),
]);

// join rollup metrics onto district polygons for the choropleth
const byDist = Object.fromEntries(rollup.districts.map((d) => [d.district, d]));
for (const f of districts.features) {
  Object.assign(f.properties, byDist[String(Number(f.properties.sup_dist))] ?? {});
}

// district label points: mean of the largest outer ring (good enough for labels)
const labels = {
  type: "FeatureCollection",
  features: districts.features.map((f) => {
    const rings =
      f.geometry.type === "MultiPolygon"
        ? f.geometry.coordinates.map((p) => p[0])
        : [f.geometry.coordinates[0]];
    const ring = rings.reduce((a, b) => (b.length > a.length ? b : a));
    const lon = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: f.properties,
    };
  }),
};

const GROUPS = {
  shelter: {
    color: "#2a78d6",
    label: "Shelters & transitional",
    subtypes: {
      adult_emergency: "Adult emergency",
      navigation: "Navigation centers",
      tay: "Youth (TAY)",
      family: "Family",
    },
    match: (p) => p.type === "shelter",
  },
  bh: {
    color: "#eb6834",
    label: "Behavioral health",
    subtypes: {
      bh_residential: "Residential treatment",
      otp: "Methadone / OTP",
      bh_outpatient: "Outpatient / MH sites",
      sobering: "Sobering & stabilization",
    },
    match: (p) => ["otp", "bh_residential", "bh_outpatient", "sobering", "stabilization"].includes(p.type),
  },
  psh: {
    color: "#1baf7a",
    label: "Permanent supportive housing",
    subtypes: { open: "Open", in_construction: "Under construction" },
    match: (p) => p.type === "psh",
  },
};

const map = new maplibregl.Map({
  container: "map",
  style: "https://tiles.openfreemap.org/styles/positron",
  center: [-122.4384, 37.76],
  zoom: 11.4,
  attributionControl: { compact: false },
});
map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

const state = {
  mode: "dots",
  metric: "shelter_beds_share",
  enabled: new Set(
    Object.entries(GROUPS).flatMap(([g, cfg]) => Object.keys(cfg.subtypes).map((s) => `${g}:${s}`))
  ),
};

function subtypeKey(p) {
  if (p.type === "shelter") return `shelter:${p.subtype}`;
  if (p.type === "psh") return `psh:${p.status}`;
  if (p.type === "sobering" || p.type === "stabilization") return "bh:sobering";
  return `bh:${p.type}`;
}
for (const f of facilities.features) f.properties._key = subtypeKey(f.properties);

map.on("load", () => {
  map.addSource("districts", { type: "geojson", data: districts });
  map.addSource("labels", { type: "geojson", data: labels });
  map.addSource("facilities", { type: "geojson", data: facilities });

  map.addLayer({
    id: "choropleth",
    type: "fill",
    source: "districts",
    layout: { visibility: "none" },
    paint: { "fill-color": "#cde2fb", "fill-opacity": 0.75 },
  });
  map.addLayer({
    id: "district-lines",
    type: "line",
    source: "districts",
    paint: { "line-color": "#898781", "line-width": 1 },
  });
  map.addLayer({
    id: "district-labels",
    type: "symbol",
    source: "labels",
    layout: {
      visibility: "none",
      "text-field": ["format", ["concat", "D", ["to-string", ["get", "district"]]], {}, "\n", {}, ["get", "_labelval"], { "font-scale": 0.85 }],
      "text-size": 15,
      "text-font": ["Noto Sans Bold"],
    },
    paint: { "text-color": "#0b0b0b", "text-halo-color": "#fcfcfb", "text-halo-width": 1.6 },
  });

  // dot layers: psh under bh under shelters, sized by beds/units where present
  const radius = (scale) => ["+", 3.5, ["*", scale, ["sqrt", ["coalesce", ["get", "beds_or_units"], 0]]]];
  const common = (group) => ({
    type: "circle",
    source: "facilities",
    paint: {
      "circle-color": GROUPS[group].color,
      "circle-opacity": 0.85,
      "circle-stroke-color": ["case", ["get", "covered_by_ch124"], "#0b0b0b", "#fcfcfb"],
      "circle-stroke-width": ["case", ["get", "covered_by_ch124"], 1.8, 1],
    },
  });
  map.addLayer({ id: "dots-psh", ...common("psh"), paint: { ...common("psh").paint, "circle-radius": radius(0.35) } });
  map.addLayer({ id: "dots-bh", ...common("bh"), paint: { ...common("bh").paint, "circle-radius": 5 } });
  map.addLayer({ id: "dots-shelter", ...common("shelter"), paint: { ...common("shelter").paint, "circle-radius": radius(0.55) } });

  applyFilters();
  applyMode();

  for (const id of ["dots-shelter", "dots-bh", "dots-psh"]) {
    map.on("click", id, (e) => {
      const p = e.features[0].properties;
      const kind = { beds: "beds", units: "units", sites: "" }[p.unit_kind] ?? "";
      new maplibregl.Popup({ closeButton: false, maxWidth: "280px" })
        .setLngLat(e.lngLat)
        .setHTML(
          `<b>${p.name}</b><br>
           <span class="muted">${p.address ?? ""} · D${p.district}</span><br>
           ${p.beds_or_units ? `${fmt(p.beds_or_units)} ${kind} · ` : ""}${p.subtype || p.type}<br>
           <span class="muted">${p.covered_by_ch124 ? "Covered Facility under Admin Code Ch. 124" : "Not a Ch. 124 Covered Facility"} · as of ${p.as_of}</span>
           ${p.confidence !== "verified" ? `<br><span class="muted">location ${p.confidence}</span>` : ""}`
        )
        .addTo(map);
    });
    map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
  }
});

function applyFilters() {
  const keys = [...state.enabled];
  map.setFilter("dots-shelter", ["all", ["==", ["get", "type"], "shelter"], ["in", ["get", "_key"], ["literal", keys]]]);
  map.setFilter("dots-psh", ["all", ["==", ["get", "type"], "psh"], ["in", ["get", "_key"], ["literal", keys]]]);
  map.setFilter("dots-bh", [
    "all",
    ["in", ["get", "type"], ["literal", ["otp", "bh_residential", "bh_outpatient", "sobering", "stabilization"]]],
    ["in", ["get", "_key"], ["literal", keys]],
  ]);
}

function applyMode() {
  const dots = state.mode === "dots";
  for (const id of ["dots-shelter", "dots-bh", "dots-psh"]) {
    map.setLayoutProperty(id, "visibility", dots ? "visible" : "none");
  }
  map.setLayoutProperty("choropleth", "visibility", dots ? "none" : "visible");
  map.setLayoutProperty("district-labels", "visibility", dots ? "none" : "visible");
  document.getElementById("dots-controls").hidden = !dots;
  document.getElementById("choropleth-controls").hidden = dots;
  if (!dots) applyMetric();
}

function applyMetric() {
  const vals = rollup.districts.map((d) => d[state.metric] ?? 0);
  const max = Math.max(...vals, 1);
  map.setPaintProperty("choropleth", "fill-color", [
    "interpolate", ["linear"], ["coalesce", ["get", state.metric], 0],
    0, "#cde2fb", max, "#0d366b",
  ]);
  const suffix = state.metric === "shelter_beds_share" ? "%" : "";
  for (const f of labels.features) {
    f.properties._labelval = `${f.properties[state.metric] ?? 0}${suffix}`;
  }
  map.getSource("labels").setData(labels);
  document.getElementById("ramp-max").textContent = `${max}${suffix}`;
}

// panel: build subtype checkboxes
const dc = document.getElementById("dots-controls");
for (const [g, cfg] of Object.entries(GROUPS)) {
  const div = document.createElement("div");
  div.innerHTML = `<div class="group"><span class="swatch" style="background:${cfg.color}"></span> ${cfg.label}</div>`;
  for (const [s, label] of Object.entries(cfg.subtypes)) {
    const key = `${g}:${s}`;
    const l = document.createElement("label");
    const checked = key !== "psh:in_construction";
    if (!checked) state.enabled.delete(key);
    l.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""}> ${label}`;
    l.querySelector("input").addEventListener("change", (e) => {
      e.target.checked ? state.enabled.add(key) : state.enabled.delete(key);
      applyFilters();
    });
    div.appendChild(l);
  }
  dc.appendChild(div);
}
const ringNote = document.createElement("div");
ringNote.className = "note";
ringNote.style.marginTop = ".4rem";
ringNote.innerHTML = "Dark ring = Covered Facility under the 2025 equity ordinance (Ch. 124)";
dc.appendChild(ringNote);

document.getElementById("mode-dots").addEventListener("click", () => setMode("dots"));
document.getElementById("mode-choropleth").addEventListener("click", () => setMode("choropleth"));
function setMode(m) {
  state.mode = m;
  document.getElementById("mode-dots").setAttribute("aria-pressed", String(m === "dots"));
  document.getElementById("mode-choropleth").setAttribute("aria-pressed", String(m !== "dots"));
  applyMode();
}
document.getElementById("metric").addEventListener("change", (e) => {
  state.metric = e.target.value;
  applyMetric();
});
document.getElementById("asof").textContent = `Data generated ${meta.generated_at.slice(0, 10)}. All locations from public government records.`;
