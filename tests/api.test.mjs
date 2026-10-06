import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadApi({
  fetch,
  session = { access_token: "test-token" },
  configured = true,
} = {}) {
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync(new URL("../src/lib/api.ts", import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const context = {
    exports,
    Headers,
    AbortController,
    setTimeout,
    clearTimeout,
    fetch,
    require: (name) =>
      name === "./config"
        ? { configuration: { apiUrl: "http://model.test" } }
        : {
            supabase: configured
              ? {
                  auth: {
                    getSession: async () => ({
                      data: { session },
                      error: null,
                    }),
                  },
                }
              : null,
          },
  };
  vm.runInNewContext(source, context);
  return exports;
}

test("JSON requests use the user's bearer token and preserve the API method", async () => {
  const { api } = loadApi({
    fetch: async (url, init) => {
      assert.equal(url, "http://model.test/api/cases");
      assert.equal(init.method, "POST");
      assert.equal(init.headers.get("Authorization"), "Bearer test-token");
      assert.equal(init.headers.get("Content-Type"), "application/json");
      assert.equal(init.cache, "no-store");
      return Response.json({ id: "saved-case" });
    },
  });
  assert.equal(
    (
      await api("/api/cases", {
        method: "POST",
        body: JSON.stringify({ name: "Test case" }),
      })
    ).id,
    "saved-case",
  );
});

test("multipart uploads leave Content-Type to the browser's boundary encoder", async () => {
  const form = new FormData();
  form.append("face", new Blob(["test"]), "face.jpg");
  const { api } = loadApi({
    fetch: async (_url, init) => {
      assert.equal(init.body, form);
      assert.equal(init.headers.has("Content-Type"), false);
      return Response.json({ candidates: [] });
    },
  });
  assert.equal(
    (await api("/api/search", { method: "POST", body: form })).candidates
      .length,
    0,
  );
});

test("signed-out requests never reach the backend", async () => {
  let called = false;
  const { api } = loadApi({
    session: null,
    fetch: async () => {
      called = true;
    },
  });
  await assert.rejects(api("/api/cases"), (error) => error.status === 401);
  assert.equal(called, false);
});

test("missing configuration does not fabricate workspace data", async () => {
  const { api } = loadApi({
    configured: false,
    fetch: async () => {
      throw new Error("Unexpected request");
    },
  });
  await assert.rejects(api("/api/cases"), (error) => error.status === 503);
});

test("backend permission errors remain visible to the user", async () => {
  const { api } = loadApi({
    fetch: async () =>
      Response.json(
        { detail: "Independent review is required." },
        { status: 403 },
      ),
  });
  await assert.rejects(
    api("/api/reviews/lead", { method: "POST" }),
    (error) =>
      error.status === 403 &&
      error.message === "Independent review is required.",
  );
});

test("validation messages are extracted from FastAPI responses", async () => {
  const { api } = loadApi({
    fetch: async () =>
      Response.json(
        {
          detail: [
            { msg: "Name is required" },
            { msg: "Choose a consent basis" },
          ],
        },
        { status: 422 },
      ),
  });
  await assert.rejects(
    api("/api/cases"),
    (error) =>
      error.status === 422 &&
      error.message === "Name is required. Choose a consent basis",
  );
});

test("cancellation propagates to an in-flight upload", async () => {
  const controller = new AbortController();
  const { api } = loadApi({
    fetch: (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener(
          "abort",
          () => reject(new Error("Aborted")),
          { once: true },
        );
        controller.abort();
      }),
  });
  await assert.rejects(
    api("/api/faces/video", { signal: controller.signal }),
    (error) => error.status === 408 && error.message === "Request canceled.",
  );
});

test("an unreachable service and invalid responses cannot become successful results", async () => {
  const offline = loadApi({
    fetch: async () => {
      throw new Error("Network error");
    },
  });
  await assert.rejects(
    offline.api("/api/cases"),
    (error) => error.status === 0,
  );
  const invalid = loadApi({
    fetch: async () =>
      new Response("<html>Proxy error</html>", { status: 502 }),
  });
  await assert.rejects(
    invalid.api("/api/cases"),
    (error) => error.status === 502,
  );
});
