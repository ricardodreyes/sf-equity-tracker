import { header, j, daysOverdue, daysLate, timeliness } from "./common.js";

header("ledger");

const { obligations, enforcement_note } = await j("/data/obligations.json");

const STATUS_UI = {
  missing:        { cls: "critical", label: "Missing" },
  filed:          { cls: "good",     label: "Filed" },
  partial:        { cls: "warning",  label: "Partial" },
  not_yet_due:    { cls: "muted",    label: "Not yet due" },
  undeterminable: { cls: "muted",    label: "Undeterminable" },
  repealed:       { cls: "muted",    label: "Repealed" },
};
const FIND_UI = {
  published: { cls: "good",    label: "Published" },
  buried:    { cls: "serious", label: "Buried" },
  absent:    { cls: "muted",   label: "Not found" },
};

const pill = (ui) => `<span class="pill ${ui.cls}">${ui.label}</span>`;

// a filed-but-late row should not read as clean, so the status pill degrades
function statusUI(r) {
  const base = STATUS_UI[r.status];
  if (r.status === "filed" && timeliness(r) === "late") {
    const n = daysLate(r);
    return { cls: "serious", label: n === 1 ? "Filed 1 day late" : `Filed ${n} days late` };
  }
  return base;
}

const rows = [...obligations].sort((a, b) => daysOverdue(b) - daysOverdue(a));
const overdue = rows.filter((r) => daysOverdue(r) > 0);
const worst = overdue[0];

document.getElementById("hero-figure").textContent = worst ? `${daysOverdue(worst)} days` : "0";
document.getElementById("hero-caption").innerHTML = worst
  ? `is how long San Francisco has been late delivering the <a href="/obligation.html?id=${worst.id}">${worst.title}</a>
     required by ${worst.law.citation}. ${overdue.length} of ${rows.length} tracked obligations are currently unmet.`
  : "Every tracked obligation is currently met.";

const tbody = document.querySelector("#ledger tbody");
for (const r of rows) {
  const d = daysOverdue(r);
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>
      <a class="row-title" href="/obligation.html?id=${r.id}">${r.title}</a>
      <div class="cite">${r.law.citation}</div>
    </td>
    <td class="who">${r.owed_by.join(", ")}</td>
    <td class="due">${r.due ?? "none set"}</td>
    <td>${pill(statusUI(r))}</td>
    <td>${pill(FIND_UI[r.discoverability])}</td>
    <td class="days ${d > 0 ? "over" : ""}">${d > 0 ? d : daysLate(r) > 0 ? `+${daysLate(r)}` : "–"}</td>`;
  tbody.appendChild(tr);
}

document.getElementById("legend").innerHTML =
  `${pill(STATUS_UI.missing)} no document found &nbsp; ${pill({ cls: "serious", label: "Filed late" })} arrived after the deadline, with the lag in days
   &nbsp; ${pill(FIND_UI.buried)} exists, but only inside a meeting packet &nbsp; ${pill(STATUS_UI.repealed)} the duty was deleted`;

document.getElementById("foot").innerHTML =
  `Overdue counts advance on their own and are computed in your browser against each deadline, so this
   page is never stale. ${enforcement_note}
   <br><br>Method, near misses and corrections: <a href="/methodology.html">methodology</a>.`;
