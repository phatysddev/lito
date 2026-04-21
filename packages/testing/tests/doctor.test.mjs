import test from "node:test";
import assert from "node:assert/strict";
import { createTempLitoProject } from "../dist/index.js";
import { formatDoctorReport, hasDoctorErrors, runLitoDoctor } from "../../cli/dist/doctor.js";

test("runLitoDoctor reports legacy page filenames and missing conventions", () => {
  const project = createTempLitoProject({
    "app/pages/index.ts": "export default {}\n",
    "app/api/health.ts": "export function get() { return Response.json({ ok: true }); }\n"
  });

  try {
    const findings = runLitoDoctor(project.rootDir);
    const report = formatDoctorReport(findings);

    assert.equal(hasDoctorErrors(findings), true);
    assert.match(report, /app\/pages\/index\.ts should be moved to app\/pages\/_index\.ts/);
    assert.match(report, /Missing `app\/pages\/_not-found\.ts`/);
    assert.match(report, /Missing `app\/pages\/_error\.ts`/);
    assert.match(report, /No `app\/api\/_middleware\.ts` found/);
  } finally {
    project.cleanup();
  }
});

test("runLitoDoctor reports missing production security hardening", () => {
  const project = createTempLitoProject({
    "app/pages/_index.ts": "export function render() { return 'home'; }\n",
    "app/pages/_not-found.ts": "export function render() { return 'missing'; }\n",
    "app/pages/_error.ts": "export function render() { return 'error'; }\n",
    "app/api/health.ts": "export function get() { return Response.json({ ok: true }); }\n",
    "server.ts": "import { createLitoServer } from '@litoho/server';\nexport default createLitoServer({});\n"
  });

  try {
    const report = formatDoctorReport(runLitoDoctor(project.rootDir));

    assert.match(report, /Security: `allowedHosts` is not configured/);
    assert.match(report, /Security: `withOriginCheck\(\)` is not detected/);
    assert.match(report, /Security: `withCsrf\(\)` is not detected/);
    assert.match(report, /Security: `withRateLimit\(\)` is not detected/);
    assert.match(report, /Security: audit hooks are not configured/);
  } finally {
    project.cleanup();
  }
});

test("runLitoDoctor recognizes a hardened server security posture", () => {
  const project = createTempLitoProject({
    "app/pages/_index.ts": "export function render() { return 'home'; }\n",
    "app/pages/_not-found.ts": "export function render() { return 'missing'; }\n",
    "app/pages/_error.ts": "export function render() { return 'error'; }\n",
    "app/api/_middleware.ts": `
import { composeMiddlewares, withBodyLimit, withCsrf, withJsonBody, withOriginCheck, withRateLimit, withRequestTimeout } from "@litoho/server";
export default composeMiddlewares(withRequestTimeout(), withRateLimit(), withBodyLimit(), withJsonBody(), withOriginCheck(), withCsrf());
`,
    "server.ts": `
import { createLitoServer, withCsp } from "@litoho/server";
export default createLitoServer({
  allowedHosts: ["app.example.com"],
  trustedProxy: { hops: 1 },
  audit: { onEvent(event) { console.log(event.type); } },
  middlewares: [withCsp()]
});
`
  });

  try {
    const report = formatDoctorReport(runLitoDoctor(project.rootDir));

    assert.match(report, /Security posture check found no high-priority missing server hardening/);
    assert.doesNotMatch(report, /Security: `allowedHosts` is not configured/);
    assert.doesNotMatch(report, /Security: `withOriginCheck\(\)` is not detected/);
    assert.doesNotMatch(report, /Security: `withRateLimit\(\)` is not detected/);
  } finally {
    project.cleanup();
  }
});
