import { j, daysOverdue, daysLate, timeliness } from "./common.js";

const root = document.getElementById("root");
const id = new URLSearchParams(location.search).get("id");
let obligations;
try {
  ({ obligations } = await j("/data/obligations.json"));
} catch (e) {
  root.innerHTML = `<h2>Could not load this obligation</h2><p class="note">${e.message}.
    <a href="">Reload the page</a> or go <a href="/">back to the ledger</a>.</p>`;
  throw e;
}
const r = obligations.find((o) => o.id === id);

if (!r) {
  root.innerHTML = `<h2>Not found</h2><p class="note">No tracked obligation with id <code></code>.
    <a href="/">Back to the ledger</a>.</p>`;
  root.querySelector("code").textContent = id ?? ""; // the id comes from the URL; never markup
} else {
  document.title = `${r.title} | SF Accountability Ledger`;
  const d = daysOverdue(r);
  const t = timeliness(r);
  const late = daysLate(r);
  const headline = d > 0 ? `${d} days` : late > 0 ? `${late} days late` : t;

  const section = (title, body) => (body ? `<h2>${title}</h2>${body}` : "");

  const audit = r.checked?.length
    ? `<div class="tablewrap" tabindex="0" role="region" aria-label="Search log"><table class="audit">
        <thead><tr><th>What we checked</th><th>Where</th><th>Result</th><th>HTTP</th><th>When</th></tr></thead>
        <tbody>${r.checked.map((c) => `
          <tr><td>${c.method}</td>
              <td class="url"><a href="${c.url}">${c.url}</a></td>
              <td class="res">${c.result}</td><td>${c.http ?? ""}</td><td><time datetime="${c.at}">${c.at.replace("T", " ").replace("Z", " UTC")}</time></td></tr>`).join("")}</tbody>
       </table></div>`
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
       <p><button class="copy" id="copy" aria-live="polite">Copy request text</button></p>
       <pre class="draft" id="draft">${r.request.draft.replace(/</g, "&lt;")}</pre>
       ${r.requests?.length
          ? `<p class="note">Filed: ${r.requests.map((x) => `${x.agency} #${x.id}, ${x.status}`).join("; ")}</p>`
          : `<p class="note">Not yet filed. Once we file one, its public tracking number appears here and
             the city's own response clock starts running against it.</p>`}`
    : "";

  root.innerHTML = `
    <p class="crumb"><a href="/">Ledger</a> / ${r.title}</p>
    <section class="standfirst" aria-label="${r.title}">
      <span class="figure">${headline}</span>
      <p class="caption">${d > 0 ? "overdue. " : ""}${r.what}</p>
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
    ${section("Where we looked", audit + (r.search_boundary
      ? `<p class="note">${r.search_boundary}</p>` : ""))}
    ${section("Considered and rejected", rejected)}
    ${r.open_lead ? section("Open lead", `<p class="note">${r.open_lead}</p>`) : ""}
    ${section("Request the document", req)}
    ${r.we_built_instead ? section("What we built instead",
        `<p>${r.we_built_instead.label}: <a href="${r.we_built_instead.href}">see the evidence</a>.</p>`) : ""}

    <div class="footnote">Every URL above was fetched on the date shown. If you can show that a document
      listed as missing does exist, that is a correction we want. We publish it here, dated, beside
      the claim it corrects. Source code and data: <a href="https://github.com/ricardodreyes/sf-equity-tracker">github.com/ricardodreyes/sf-equity-tracker</a>.</div>`;

  document.getElementById("copy")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    clearTimeout(btn._t);
    btn.style.minWidth = `${btn.offsetWidth}px`; // the label changes, the button does not
    try {
      await navigator.clipboard.writeText(r.request.draft);
      btn.textContent = "Copied";
    } catch {
      btn.textContent = "Copy failed. Select the text below.";
    }
    btn._t = setTimeout(() => (btn.textContent = "Copy request text"), 1500);
  });
}
