// node src/common.test.mjs
import assert from "node:assert";
import { timeliness, daysOverdue, daysSince } from "./common.js";

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
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const future = localISO(30);
const past = localISO(-30);
assert.equal(timeliness({ due: past, status: "missing" }), "overdue");
assert.equal(timeliness({ due: future, status: "not_yet_due" }), "not yet due");

assert.equal(daysOverdue({ due: past, status: "missing" }), 30);
assert.equal(daysOverdue({ due: future, status: "not_yet_due" }), 0, "future deadlines are never overdue");
assert.equal(daysOverdue({ due: past, filed_on: past }), 0, "a filed row is not overdue");
assert.equal(daysSince(past), 30);

console.log("common.js date logic: all assertions passed");
