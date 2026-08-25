import { header, j, daysOverdue, daysLate, timeliness } from "./common.js";

header("ledger");

const { obligations } = await j("/data/obligations.json");
const id = new URLSearchParams(location.search).get("id");
const r = obligations.find((o) => o.id === id);
const root = document.getElementById("root");

if (!r) {
  root.innerHTML = `<h2>Not found</h2><p class="note">No tracked obligation with id <code>${id ?? ""}</code>.
    <a href="/">Back to the ledger</a>.</p>`;
} else {
  document.title = `${r.title} – SF Accountability Ledger`;
  const d = daysOverdue(r);
  const t = timeliness(r);
  const late = daysLate(r);
  const headline = d > 0 ? `${d} days` : late > 0 ? `${late} days late` : t;

  const section = (title, body) => (body ? `<h2>${title}</h2>${body}` : "");

  const audit = r.checked?.length
    ? `<table class="audit">
        <thead><tr><th>What we checked</th><th>Where</th><th>Result</th><th>HTTP</th><th>When</th></tr></thead>
        <tbody>${r.checked.map((c) => `
          <tr><td>${c.method}</td>
              <td class="url"><a href="${c.url}">${c.url}</a></td>
              <td>${c.result}</td><td>${c.http ?? ""}</td><td>${c.at}</td></tr>`).join("")}</tbody>
       </table>`
    : "";

  const rejected = r.considered_rejected?.length
    ? `<p class="note">Documents that look like this one and are not. Listed so the obvious rebuttal is
        already answered.</p>
       <ul>${r.considered_rejected.map((c) => `
         <li><a href="${c.url}">${c.title}</a><br><span class="note">${c.why_not}</span></li>`).join("")}</ul>`
    : r.no_near_miss_reason
      ? `<p class="note">${r.no_near_miss_reason}</p>`
      : "";

  const req = r.request
    ? `<p class="note">${r.request.note ?? ""} Targets:
        ${r.request.targets.map((t2) => `<a href="${t2.portal}">${t2.agency}</a>${t2.note ? ` (${t2.note})` : ""}`).join(", ")}.
        Subject line: <code>${r.request.subject}</code></p>
       <p><button class="copy" id="copy">Copy request text</button></p>
       <pre class="draft" id="draft">${r.request.draft.replace(/</g, "&lt;")}</pre>
       ${r.requests?.length
          ? `<p class="note">Filed: ${r.requests.map((x) => `${x.agency} #${x.id}, ${x.status}`).join("; ")}</p>`
          : `<p class="note">Not yet filed. Once a request is filed its public tracking number appears here,
             along with the city's own response clock.</p>`}`
    : "";

  root.innerHTML = `
    <p class="note"><a href="/">Ledger</a> / ${r.title}</p>
    <section class="hero">
      <div class="figure">${headline}</div>
      <div class="caption">${d > 0 ? "overdue. " : ""}${r.what}</div>
    </section>

    ${r.correction ? `<div class="callout"><h3>Correction, ${r.correction.date}</h3><p>${r.correction.text}</p></div>` : ""}

    <dl class="kv">
      <dt>Legal basis</dt><dd>${r.law.citation}</dd>
      <dt>Created by</dt><dd>${r.law.ordinance}</dd>
      <dt>Owed by</dt><dd>${r.owed_by.join(", ")}</dd>
      <dt>Deadline</dt><dd>${r.due ?? "none ascertainable"} <span class="note">(${r.due_basis})</span></dd>
      <dt>Certainty</dt><dd>${r.due_certainty}</dd>
      <dt>Recurs</dt><dd>${r.cadence}</dd>
      <dt>Status</dt><dd>${r.filed_on ? `filed ${r.filed_on}${late > 0 ? `, ${late} days late` : ", on time"}` : r.status}</dd>
      <dt>Findability</dt><dd>${r.discoverability}</dd>
    </dl>

    ${section("What the law says", `<blockquote class="quote">${r.law.quote}</blockquote>
      <p class="note">${[["Ordinance", r.law.ordinance_url], ["Code", r.law.code_url], ["Report", r.law.report_url]]
        .filter(([, u]) => u).map(([k, u]) => `<a href="${u}">${k}</a>`).join(" &middot; ")}</p>`)}

    ${section("Why it matters", `<p>${r.why_it_matters}</p>${r.caveat ? `<p class="note">${r.caveat}</p>` : ""}`)}
    ${section("Where we looked", audit)}
    ${section("Considered and rejected", rejected)}
    ${r.open_lead ? section("Open lead", `<p class="note">${r.open_lead}</p>`) : ""}
    ${section("Force it into daylight", req)}
    ${r.we_built_instead ? section("What we built instead",
        `<p>${r.we_built_instead.label}: <a href="${r.we_built_instead.href}">see the evidence</a>.</p>`) : ""}

    <div class="footnote">Every URL above was fetched on the date shown. If you can show that a document
      listed as missing does exist, that is a correction we want: it will be published here, dated, with
      the original claim left visible.</div>`;

  document.getElementById("copy")?.addEventListener("click", async (e) => {
    await navigator.clipboard.writeText(r.request.draft);
    e.target.textContent = "Copied";
    setTimeout(() => (e.target.textContent = "Copy request text"), 1500);
  });
}
