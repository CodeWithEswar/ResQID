import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = ts.transpileModule(
  fs.readFileSync(
    new URL("../src/lib/dashboard-data.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const context = { exports: {}, Intl, Date };
vm.runInNewContext(source, context);
const { activitySeries, dashboardSummary, workspaceDay } = context.exports;
test("activity uses India calendar days across UTC midnight and excludes records outside the window", () => {
  const cases = [
    { created_at: "2026-10-05T18:29:59Z" },
    { created_at: "2026-10-05T18:30:00Z" },
    { created_at: "2026-10-03T12:00:00Z" },
    { created_at: "not-a-date" },
    { created_at: "2026-10-07T00:00:00Z" },
  ];
  const reviews = [{ created_at: "2026-10-06T00:00:00Z" }];
  const result = activitySeries(
    cases,
    reviews,
    2,
    new Date("2026-10-06T01:00:00Z"),
  );
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [
    { date: "2026-10-05", cases: 1, reviews: 0 },
    { date: "2026-10-06", cases: 1, reviews: 1 },
  ]);
  assert.equal(workspaceDay("2026-10-05T18:30:00Z"), "2026-10-06");
});
test("empty activity has one zero-count bucket per selected calendar day", () => {
  const result = activitySeries([], [], 7, new Date("2026-01-02T00:00:00Z"));
  assert.equal(result.length, 7);
  assert.equal(result[0].date, "2025-12-27");
  assert.equal(result.at(-1).date, "2026-01-02");
  assert.ok(result.every((item) => item.cases === 0 && item.reviews === 0));
});
test("summary separates open cases and review outcomes without treating similarity as verification", () => {
  const cases = ["pending", "urgent", "ongoing", "closed", "completed"].map(
    (status) => ({ status }),
  );
  const reviews = [
    { status: "pending", score: 1 },
    { status: "verified", score: 0.7 },
    { status: "rejected", score: 0.99 },
  ];
  assert.deepEqual(
    JSON.parse(JSON.stringify(dashboardSummary(cases, reviews))),
    {
      registered: 5,
      open: 3,
      completed: 2,
      pending: 1,
      verified: 1,
      rejected: 1,
    },
  );
});
