// node src/common.test.mjs
import assert from "node:assert";
import { timeliness, daysOverdue, daysSince, daysBetween, sfToday } from "./common.js";

assert.equal(timeliness({ due: "2025-12-31", filed_on: "2025-12-10" }), "on time");
assert.equal(timeliness({ due: "2025-10-01", filed_on: "2025-10-02" }), "late", "one day late is late");
assert.equal(timeliness({ due: "2026-07-01", filed_on: "2026-07-23" }), "late");
assert.equal(timeliness({ due: "2026-07-01", filed_on: "2026-07-01" }), "on time", "same day counts");
assert.equal(timeliness({ due: null, status: "repealed" }), "repealed");
assert.equal(timeliness({ due: null, status: "undeterminable" }), "no deadline");

// Fixtures must be built in LOCAL calendar time. daysSince() parses "YYYY-MM-DD" as
// local midnight, so a UTC-derived fixture is off by one whenever local time and UTC
// fall on different dates (any evening in Pacific time).
const localISO = (offsetDays) => {
  const [y, m, d] = sfToday().split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return t.toISOString().slice(0, 10);
};

// Daylight saving must not move a calendar-day difference. 2026-03-08 is spring forward
// in the US, so this span contains a 23 hour day.
assert.equal(daysBetween("2026-03-01", "2026-03-15"), 14, "DST must not eat a day");
assert.equal(daysBetween("2026-10-25", "2026-11-08"), 14, "fall back must not add one");
assert.equal(daysBetween("2026-01-16", "2026-08-25"), 221);
assert.equal(daysBetween("2026-08-25", "2026-01-16"), -221, "direction is signed");
assert.match(sfToday(), /^\d{4}-\d{2}-\d{2}$/);
const future = localISO(30);
const past = localISO(-30);
assert.equal(timeliness({ due: past, status: "missing" }), "overdue");
assert.equal(timeliness({ due: future, status: "not_yet_due" }), "not yet due");

assert.equal(daysOverdue({ due: past, status: "missing" }), 30);
assert.equal(daysOverdue({ due: future, status: "not_yet_due" }), 0, "future deadlines are never overdue");
assert.equal(daysOverdue({ due: past, filed_on: past }), 0, "a filed row is not overdue");
assert.equal(daysSince(past), 30);

console.log("common.js date logic: all assertions passed");
