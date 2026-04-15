import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();
const scope = process.env.LITOHO_SCOPE?.trim() || "@litoho";
const cliPackageName = process.env.LITOHO_CLI_PACKAGE?.trim() || "litoho";
const cliBin = process.env.LITOHO_CLI_BIN?.trim() || "litoho";

const packages = [
  {
    dir: "packages/router",
    expectedName: `${scope}/router`,
    distFiles: ["dist/index.js", "dist/index.d.ts"]
  },
  {
    dir: "packages/core",
    expectedName: `${scope}/core`,
    distFiles: ["dist/index.js", "dist/index.d.ts"]
  },
  {
    dir: "packages/server",
    expectedName: `${scope}/server`,
    distFiles: ["dist/index.js", "dist/index.d.ts"]
  },
  {
    dir: "packages/app",
    expectedName: `${scope}/app`,
    distFiles: ["dist/index.js", "dist/index.d.ts"]
  },
  {
    dir: "packages/cli",
    expectedName: cliPackageName,
    distFiles: ["dist/index.js", "dist/index.d.ts"],
    expectedBin: cliBin
  }
];

let hasErrors = false;

console.log("Litoho publish preflight\n");
console.log(`- scope: ${scope}`);
console.log(`- cli package: ${cliPackageName}`);
console.log(`- cli bin: ${cliBin}`);
console.log("");

if (cliPackageName === "litoho") {
  console.log("[note] Unscoped CLI publishing depends on npm allowing the package name.");
  console.log("[note] If npm rejects it, use a scoped CLI package such as @your-scope/litoho.\n");
}

for (const pkg of packages) {
  const packageJsonPath = resolve(rootDir, pkg.dir, "package.json");

  if (!existsSync(packageJsonPath)) {
    hasErrors = true;
    console.log(`[error] Missing ${pkg.dir}/package.json`);
    continue;
  }

  const json = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  console.log(`${pkg.dir}`);
  console.log(`- current name: ${json.name}`);
  console.log(`- publish name: ${pkg.expectedName}`);
  console.log(`- version: ${json.version}`);

  if (!json.version) {
    hasErrors = true;
    console.log("- status: error, missing version");
  }

  for (const relativeFile of pkg.distFiles) {
    const fullPath = resolve(rootDir, pkg.dir, relativeFile);
    const ok = existsSync(fullPath);
    console.log(`- ${relativeFile}: ${ok ? "ok" : "missing"}`);
    if (!ok) {
      hasErrors = true;
    }
  }

  if ("expectedBin" in pkg) {
    const bin = json.bin ?? {};
    const hasBin = typeof bin === "object" && pkg.expectedBin in bin;
    console.log(`- bin ${pkg.expectedBin}: ${hasBin ? "ok" : "missing"}`);
    if (!hasBin) {
      hasErrors = true;
    }
  }

  console.log("");
}

console.log("Suggested commands:");
console.log(`- pnpm run identity:preview`);
console.log(`- LITOHO_SCOPE=${scope} LITOHO_CLI_PACKAGE=${cliPackageName} LITOHO_CLI_BIN=${cliBin} pnpm run release:pack`);
console.log(`- LITOHO_SCOPE=${scope} LITOHO_CLI_PACKAGE=${cliPackageName} LITOHO_CLI_BIN=${cliBin} pnpm run release:publish`);

if (hasErrors) {
  console.log("\nPreflight result: FAILED");
  process.exit(1);
}

console.log("\nPreflight result: OK");
