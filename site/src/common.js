export async function j(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

export const fmt = (n) => (n == null ? "–" : n.toLocaleString("en-US"));
export const pct = (n) => (n == null ? "–" : `${n}%`);

const NAV = [
  ["/", "Ledger", "ledger"],
  ["/evidence.html", "Evidence", "evidence"],
  ["/methodology.html", "Methodology", "methodology"],
];

export function header(active) {
  const el = document.createElement("header");
  el.className = "site";
  el.innerHTML = `
    <h1><a href="/" style="text-decoration:none">SF Accountability Ledger</a></h1>
    <nav>${NAV.map(([href, label, key]) =>
      `<a href="${href}"${key === active ? " aria-current='page'" : ""}>${label}</a>`
    ).join("")}</nav>`;
  document.body.prepend(el);
}

/** Whole days from an ISO date to today. Positive means the date has passed. */
export function daysSince(iso) {
  const then = new Date(iso + "T00:00:00");
  const now = new Date();
  return Math.floor((now - then) / 86400000);
}

export function timeliness(row) {
  if (!row.due) return row.status === "repealed" ? "repealed" : "no deadline";
  // ISO dates compare correctly as strings, which keeps this readable
  if (row.filed_on) return row.filed_on <= row.due ? "on time" : "late";
  return daysSince(row.due) > 0 ? "overdue" : "not yet due";
}

/** Days between filing and deadline. Positive means it arrived late. */
export function daysLate(row) {
  if (!row.due || !row.filed_on) return 0;
  return Math.max(0, Math.round((new Date(row.filed_on) - new Date(row.due)) / 86400000));
}

/** Days past the deadline, or 0 if it has not passed. */
export function daysOverdue(row) {
  if (!row.due || row.filed_on) return 0;
  return Math.max(0, daysSince(row.due));
}
