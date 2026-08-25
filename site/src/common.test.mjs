// node src/common.test.mjs
import assert from "node:assert";
import { timeliness, daysOverdue, daysSince } from "./common.js";

assert.equal(timeliness({ due: "2025-12-31", filed_on: "2025-12-10" }), "on time");
assert.equal(timeliness({ due: "2025-10-01", filed_on: "2025-10-02" }), "late", "one day late is late");
assert.equal(timeliness({ due: "2026-07-01", filed_on: "2026-07-23" }), "late");
assert.equal(timeliness({ due: "2026-07-01", filed_on: "2026-07-01" }), "on time", "same day counts");
assert.equal(timeliness({ due: null, status: "repealed" }), "repealed");
assert.equal(timeliness({ due: null, status: "undeterminable" }), "no deadline");

// a past deadline with nothing filed is overdue; a future one is not
const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const past = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
assert.equal(timeliness({ due: past, status: "missing" }), "overdue");
assert.equal(timeliness({ due: future, status: "not_yet_due" }), "not yet due");

assert.equal(daysOverdue({ due: past, status: "missing" }), 30);
assert.equal(daysOverdue({ due: future, status: "not_yet_due" }), 0, "future deadlines are never overdue");
assert.equal(daysOverdue({ due: past, filed_on: past }), 0, "a filed row is not overdue");
assert.equal(daysSince(past), 30);

console.log("common.js date logic: all assertions passed");
