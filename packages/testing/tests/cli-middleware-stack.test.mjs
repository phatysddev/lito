import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTempLitoProject } from "../dist/index.js";
import { createMiddlewareStackFile } from "../../cli/dist/scaffold.js";

test("createMiddlewareStackFile writes the web middleware stack scaffold", () => {
  const project = createTempLitoProject({});

  try {
    const filePath = createMiddlewareStackFile(project.rootDir, "web");
    const source = readFileSync(filePath, "utf8");

    assert.equal(filePath, resolve(project.rootDir, "app/api/_middleware.ts"));
    assert.match(source, /composeMiddlewares/);
    assert.match(source, /createRequestMetaMiddleware/);
    assert.match(source, /createTimingMiddleware/);
    assert.match(source, /createLoggerMiddleware/);
    assert.doesNotMatch(source, /unauthorizedResponse/);
  } finally {
    project.cleanup();
  }
});

test("createMiddlewareStackFile writes the api middleware stack scaffold with unauthorized JSON response", () => {
  const project = createTempLitoProject({});

  try {
    const filePath = createMiddlewareStackFile(project.rootDir, "api");
    const source = readFileSync(filePath, "utf8");

    assert.equal(filePath, resolve(project.rootDir, "app/api/_middleware.ts"));
    assert.match(source, /composeMiddlewares/);
    assert.match(source, /createAuthGuardMiddleware/);
    assert.match(source, /protectedPathPrefixes: \["\/api"\]/);
    assert.match(source, /unauthorizedResponse:/);
    assert.match(source, /status: 401/);
  } finally {
    project.cleanup();
  }
});

test("createMiddlewareStackFile refuses to overwrite an existing middleware file unless forced", () => {
  const project = createTempLitoProject({
    "app/api/_middleware.ts": "export default null;\n"
  });

  try {
    assert.throws(
      () => createMiddlewareStackFile(project.rootDir, "web"),
      /API middleware already exists/
    );

    const filePath = createMiddlewareStackFile(project.rootDir, "api", {
      force: true
    });
    const source = readFileSync(filePath, "utf8");

    assert.match(source, /createAuthGuardMiddleware/);
  } finally {
    project.cleanup();
  }
});

test("createMiddlewareStackFile writes the secure-api middleware stack preset", () => {
  const project = createTempLitoProject({});

  try {
    const filePath = createMiddlewareStackFile(project.rootDir, "secure-api");
    const source = readFileSync(filePath, "utf8");

    assert.equal(filePath, resolve(project.rootDir, "app/api/_middleware.ts"));
    assert.match(source, /withRequestId/);
    assert.match(source, /withSecurityHeaders/);
    assert.match(source, /withCors/);
    assert.match(source, /requireAuth/);
    assert.match(source, /withRateLimit/);
    assert.match(source, /withCacheControl/);
    assert.match(source, /value: "no-store"/);
  } finally {
    project.cleanup();
  }
});

test("createMiddlewareStackFile writes the browser-app middleware stack preset", () => {
  const project = createTempLitoProject({});

  try {
    const filePath = createMiddlewareStackFile(project.rootDir, "browser-app");
    const source = readFileSync(filePath, "utf8");

    assert.equal(filePath, resolve(project.rootDir, "app/api/_middleware.ts"));
    assert.match(source, /withRequestId/);
    assert.match(source, /createRequestMetaMiddleware/);
    assert.match(source, /createTimingMiddleware/);
    assert.match(source, /withSecurityHeaders/);
    assert.match(source, /withCacheControl/);
    assert.match(source, /private, no-store/);
  } finally {
    project.cleanup();
  }
});
