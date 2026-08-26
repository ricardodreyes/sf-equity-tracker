import { header, j, daysOverdue, daysLate, timeliness } from "./common.js";

header("ledger");

const { obligations, enforcement_note } = await j("/data/obligations.json");

// Colour does one job here: marking failure. Everything else is a neutral mark
// plus a word, because four status hues cannot be told apart under CVD.
const STATUS = {
  missing:        ["fail", "Missing"],
  filed:          ["done", "Filed"],
  partial:        ["part", "Partial"],
  not_yet_due:    ["none", "Not yet due"],
  undeterminable: ["none", "Undeterminable"],
  repealed:       ["none", "Repealed"],
};
const FIND = {
  published: ["done", "Published"],
  buried:    ["part", "Buried"],
  absent:    ["none", "Not found"],
};

const mark = ([cls, label]) => `<span class="mark ${cls}">${label}</span>`;

function statusOf(r) {
  if (r.status === "filed" && timeliness(r) === "late") return ["part", "Filed late"];
  return STATUS[r.status];
}

const rows = [...obligations].sort((a, b) => daysOverdue(b) - daysOverdue(a) || daysLate(b) - daysLate(a));
const overdue = rows.filter((r) => daysOverdue(r) > 0);
const worst = overdue[0];

document.getElementById("hero-figure").textContent = worst ? `${daysOverdue(worst)} days` : "In order";
document.getElementById("hero-caption").innerHTML = worst
  ? `late, and counting, on the <a href="/obligation.html?id=${worst.id}">${worst.title}</a> that
     ${worst.law.citation} requires. ${overdue.length} of ${rows.length} tracked obligations are unmet.`
  : "Every tracked obligation is currently met.";
document.getElementById("dateline").textContent =
  `Computed in your browser on ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}.`;

const tbody = document.querySelector("#ledger tbody");
for (const r of rows) {
  const d = daysOverdue(r);
  const late = daysLate(r);
  const tr = document.createElement("tr");
  if (r.status === "missing") tr.className = "is-missing";
  tr.innerHTML = `
    <td data-label="Obligation">
      <a class="row-title" href="/obligation.html?id=${r.id}">${r.title}</a>
      <div class="cite">${r.law.citation}</div>
    </td>
    <td class="who" data-label="Owed by">${r.owed_by.join(", ")}</td>
    <td class="due" data-label="Due">${r.due ?? "none set"}</td>
    <td data-label="Status">${mark(statusOf(r))}</td>
    <td data-label="Findable">${mark(FIND[r.discoverability])}</td>
    <td class="days ${d > 0 ? "over" : ""}" data-label="Days late">${d > 0 ? d : late > 0 ? `+${late}` : "–"}</td>`;
  tbody.appendChild(tr);
}

document.getElementById("legend").innerHTML = [
  [["fail", "Missing"], "no document found; the row carries a margin mark"],
  [["part", "Filed late"], "late, or reachable only inside a meeting packet"],
  [["done", "Filed"], "delivered and publicly posted"],
  [["none", "Repealed"], "the duty was deleted, so nothing is owed"],
].map(([m, text]) => `<span class="legend-item">${mark(m)}<span>${text}</span></span>`).join("");

document.getElementById("foot").innerHTML =
  `${enforcement_note}<br><br>Method, near misses and corrections: <a href="/methodology.html">methodology</a>.`;
