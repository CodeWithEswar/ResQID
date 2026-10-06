import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function readModule(name, require) {
  const source = ts.transpileModule(
    fs.readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const context = { exports: {}, Intl, Date, require };
  vm.runInNewContext(source, context);
  return context.exports;
}
const dashboard = readModule("dashboard-data");
const { filterCases, emptyCaseFilters } = readModule(
  "case-registry-data",
  () => dashboard,
);
const person = (id, status, age, created_at, last_seen = "Town") => ({
  id,
  name: `Person ${id}`,
  status,
  age,
  created_at,
  last_seen,
});
test("case filters combine search, multiple statuses, and age without including unknown ages as adults", () => {
  const records = [
    person("a", "urgent", 20, "2026-10-06T00:00:00Z"),
    person("b", "ongoing", null, "2026-10-06T00:00:00Z"),
    person("c", "pending", 12, "2026-10-06T00:00:00Z"),
  ];
  const result = filterCases(
    records,
    " town ",
    { statuses: ["urgent", "ongoing"], age: "adult", days: 0 },
    "newest",
  );
  assert.deepEqual(
    Array.from(result, (p) => p.id),
    ["a"],
  );
  assert.deepEqual(
    Array.from(
      filterCases(records, "", { ...emptyCaseFilters, age: "unknown" }, "name"),
      (p) => p.id,
    ),
    ["b"],
  );
  assert.equal(
    filterCases(records, "no match", emptyCaseFilters, "name").length,
    0,
  );
});
test("registration periods use inclusive India calendar days and exclude future or malformed dates", () => {
  const records = [
    person("before", "pending", null, "2026-10-04T18:29:59Z"),
    person("start", "pending", null, "2026-10-04T18:30:00Z"),
    person("today", "pending", null, "2026-10-05T18:30:00Z"),
    person("future", "pending", null, "2026-10-06T18:30:00Z"),
    person("invalid", "pending", null, "bad"),
  ];
  const result = filterCases(
    records,
    "",
    { ...emptyCaseFilters, days: 2 },
    "oldest",
    new Date("2026-10-06T01:00:00Z"),
  );
  assert.deepEqual(
    Array.from(result, (p) => p.id),
    ["start", "today"],
  );
});
test("urgent sorting prioritizes urgent cases and keeps the source array untouched", () => {
  const records = [
    person("new", "ongoing", 20, "2026-10-06T00:00:00Z"),
    person("urgent", "urgent", 20, "2026-10-01T00:00:00Z"),
    person("old", "closed", 20, "2026-09-01T00:00:00Z"),
  ];
  assert.deepEqual(
    Array.from(
      filterCases(records, "", emptyCaseFilters, "urgent"),
      (p) => p.id,
    ),
    ["urgent", "new", "old"],
  );
  assert.deepEqual(
    records.map((p) => p.id),
    ["new", "urgent", "old"],
  );
});
