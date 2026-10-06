import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const compiled = ts.transpileModule(fs.readFileSync(new URL("../src/lib/video-analysis.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { frameSummary, videoTime } = context.exports;

test("frame suitability uses quality checks rather than a rejected face's higher detection score", () => {
  const frame = { faces: [
    { usable: false, confidence: .999, issues: ["Face is blurred."] },
    { usable: true, confidence: .81, issues: [] },
    { usable: true, confidence: .91, issues: [] },
  ] };
  const result = frameSummary(frame);
  assert.equal(result.suitable, true);
  assert.equal(result.usableCount, 2);
  assert.equal(result.confidence, .91);
  assert.equal(frame.faces[0].confidence, .999);
});

test("frames without usable faces remain unsuitable and preserve deduplicated reasons", () => {
  const result = frameSummary({ faces: [
    { usable: false, confidence: .99, issues: ["Face too small."] },
    { usable: false, confidence: NaN, issues: ["Face too small.", "Face blurred."] },
  ] });
  assert.equal(result.suitable, false);
  assert.equal(result.confidence, .99);
  assert.deepEqual(Array.from(result.issues), ["Face too small.", "Face blurred."]);
  const empty = frameSummary({ faces: [] });
  assert.equal(empty.suitable, false);
  assert.equal(empty.confidence, null);
});

test("video timestamps round correctly across minute boundaries and handle invalid timing", () => {
  assert.equal(videoTime(59.96), "1:00.0");
  assert.equal(videoTime(1.25), "0:01.3");
  assert.equal(videoTime(125.4), "2:05.4");
  assert.equal(videoTime(Infinity), "0:00.0");
  assert.equal(videoTime(-1), "0:00.0");
});
