import { j, fmt, pct } from "./common.js";

let rollup, nhoods, meta, districtsGeo, fs, svg;
try {
  [rollup, nhoods, meta, districtsGeo, fs, svg] = await Promise.all([
    j("/data/rollup_districts.json"),
    j("/data/rollup_neighborhoods.json"),
    j("/data/meta.json"),
    j("/data/districts.geojson"),
    j("/data/fairshare.json"),
    fetch("/data/districts.svg").then((r) => (r.ok ? r.text() : "")).catch(() => ""),
  ]);
} catch (e) {
  document.getElementById("headline-figure").textContent = "";
  document.getElementById("headline-caption").innerHTML =
    `Could not load the evidence tables (${e.message}). <a href="">Reload the page</a>, or go
     <a href="/">back to the ledger</a>.`;
  throw e;
}

// Fair Share proxy. The caveats render above the numbers, never below them.
// static SVG rather than a tile map: no external requests, prints, screenshots cleanly
const map = document.getElementById("choropleth");
map.innerHTML = svg;
map.querySelectorAll("text").forEach((t) => t.setAttribute("aria-hidden", "true"));
document.getElementById("choropleth-cap").textContent = svg
  ? "Share of mapped shelter and transitional housing beds by supervisor district. Darker is a larger share."
  : "The district map could not be loaded. The tables below carry the same figures.";

document.getElementById("fs-caveat").innerHTML =
  `<h3>Read this before the table</h3>
   <p>${fs.proxy_caveat}</p>
   <p>${fs.bed_coverage.note}</p>`;

const fsBody = document.querySelector("#fairshare tbody");
for (const r of fs.districts) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>D${r.district}</td>
    <td>${fmt(r.beds)}</td>
    <td>${pct(r.bed_share)}</td>
    <td>${fmt(r.unsheltered)}</td>
    <td>${pct(r.unsheltered_share)}</td>
    <td class="result">${r.over_served
      ? `<span class="mark fail">Over-served</span>`
      : `<span class="mark none">Under</span>`}</td>`;
  fsBody.appendChild(tr);
}
document.getElementById("fs-source").innerHTML =
  `By this proxy ${fs.over_served.length ? `only <strong>${fs.over_served.map((d) => "D" + d).join(" and ")}</strong>` : "no district"} would be blocked from new
   City-funded facilities. Note that D5 reads as under-served despite holding the Tenderloin, because the
   Tenderloin spans three districts and the statute measures neighborhoods, not districts. Unsheltered counts:
   <a href="${fs.unsheltered_source_url}">${fs.unsheltered_source}</a>. Beds: ${fs.bed_source}.
   ${fs.excluded.confidential_scattered_site} people counted at confidential or scattered-site locations are
   excluded: ${fs.excluded.why}`;

const supName = Object.fromEntries(
  districtsGeo.features.map((f) => [String(Number(f.properties.sup_dist)), f.properties.sup_name])
);

const rows = [...rollup.districts].sort((a, b) => b.shelter_beds - a.shelter_beds);
const totalPop = rows.reduce((s, r) => s + (r.population ?? 0), 0);

// headline: the top districts by beds vs their share of population
const top = rows.slice(0, 2);
const bedShare = (top[0].shelter_beds_share + top[1].shelter_beds_share).toFixed(0);
const popShare = ((100 * (top[0].population + top[1].population)) / totalPop).toFixed(0);
const zeros = rows.filter((r) => r.shelter_beds === 0).map((r) => `D${r.district}`);
document.getElementById("headline-figure").textContent = `${bedShare}%`;
document.getElementById("headline-caption").textContent =
  `of San Francisco's mapped shelter and transitional housing beds are in Districts ${top[0].district} and ${top[1].district}, ` +
  `home to ${popShare}% of its residents.${zeros.length ? ` ${zeros.join(", ")} have none.` : ""}`;

const maxBeds = Math.max(...rows.map((r) => r.shelter_beds));
const tbody = document.querySelector("#district-table tbody");
for (const r of rows) {
  const bh = r.bh_residential_sites + r.bh_outpatient_sites + r.otp_sites + r.sobering_sites;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>D${r.district} <span class="note">${supName[r.district] ?? ""}</span></td>
    <td>${fmt(r.shelter_beds)}</td>
    <td class="bar-cell">${r.shelter_beds ? `<div class="bar" aria-hidden="true" style="width:max(2px, ${(100 * r.shelter_beds) / maxBeds}%)"></div>` : ""}</td>
    <td>${pct(r.shelter_beds_share)}</td>
    <td>${fmt(r.shelter_beds_per_10k)}</td>
    <td>${fmt(r.psh_units)}</td>
    <td>${fmt(bh)}</td>
    <td>${fmt(r.population)}</td>`;
  tbody.appendChild(tr);
}

const un = rollup.unassigned;
document.getElementById("unassigned-note").textContent =
  un.shelter_beds > 0
    ? `${fmt(un.shelter_beds)} additional beds are not mapped to a district: ${un.names.join("; ")}. ` +
      `They are excluded from the shares above and explained on the methodology page.`
    : "";

const ntbody = document.querySelector("#nhood-table tbody");
for (const r of nhoods.neighborhoods) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${r.neighborhood}</td><td>${fmt(r.shelter_beds)}</td><td>${pct(r.shelter_beds_share)}</td>
    <td>${fmt(r.psh_units)}</td><td>${fmt(r.bh_sites)}</td>`;
  ntbody.appendChild(tr);
}

document.getElementById("sources").innerHTML =
  `Generated ${meta.generated_at.slice(0, 10)}. Population: ACS 5-year estimates ending ${meta.population_acs_end_year}. ` +
  `Citywide context from the 2026 Housing Inventory Count: ${fmt(meta.context.hic_2026_shelter_th_beds)} shelter and transitional beds, ` +
  `${fmt(meta.context.hic_2026_psh_oph_beds)} permanent supportive and other permanent housing beds. ` +
  `Sources and definitions on the <a href="/methodology.html">methodology page</a>.`;
