export async function j(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

export const fmt = (n) => (n == null ? "–" : n.toLocaleString("en-US"));
export const pct = (n) => (n == null ? "–" : `${n}%`);

/** Today's calendar date in San Francisco, as YYYY-MM-DD.
    A statutory deadline set by a San Francisco ordinance has one correct answer, and it
    is not the one in the reader's timezone. en-CA formats as ISO. */
export function sfToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** Whole calendar days from date a to date b, both YYYY-MM-DD.
    Both sides go through Date.UTC, so daylight saving cannot shave an hour off a
    difference and drop a whole day through the floor. */
export function daysBetween(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** Whole days from an ISO date to today in San Francisco. Positive means it has passed. */
export function daysSince(iso) {
  return daysBetween(iso.slice(0, 10), sfToday());
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
  return Math.max(0, daysBetween(row.due, row.filed_on));
}

/** Days past the deadline, or 0 if it has not passed. */
export function daysOverdue(row) {
  if (!row.due || row.filed_on) return 0;
  return Math.max(0, daysSince(row.due));
}

/** The most recent moment any row was actually checked. The page must date itself
    from evidence, never from the clock: stamping today onto an old sweep turns a
    stale claim into a false one. */
export function lastVerified(obligations) {
  const stamps = obligations.flatMap((r) => (r.checked ?? []).map((c) => c.at)).filter(Boolean);
  return stamps.sort().at(-1) ?? null;
}

export function daysStale(obligations) {
  const last = lastVerified(obligations);
  return last ? daysSince(last.slice(0, 10)) : Infinity;
}
