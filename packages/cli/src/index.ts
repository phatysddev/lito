#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { formatDoctorReport, hasDoctorErrors, runLitoDoctor } from "./doctor.js";
import { generateRouteManifests } from "./generate-route-manifests.js";
import {
  createApiFile,
  createCrudResource,
  createLayoutFile,
  createNewApp,
  createPageFile,
  type ApiQueryField
} from "./scaffold.js";

const rawArgs = process.argv.slice(2);
const rootArg = readFlagValue(rawArgs, "--root") ?? ".";
const projectRoot = resolve(process.cwd(), rootArg);
const args = stripFlag(rawArgs, "--root");
const [command = "help", ...restArgs] = args;

async function main() {
  switch (command) {
    case "help":
    case "--help":
    case "-h":
      printHelp();
      return;
    case "new": {
      const appName = restArgs[0];

      if (!appName) {
        throw new Error("Usage: litoho new <name>");
      }

      const appRoot = resolve(process.cwd(), appName);
      createNewApp(appRoot);
      console.log(`Created new Litoho app at ${appRoot}`);
      return;
    }
    case "-g":
    case "generate":
    case "g":
      await handleGenerateCommand(restArgs);
      return;
    case "dev":
      generateRouteManifests(projectRoot);
      runLocalCommand(projectRoot, "tsx", ["server.ts"]);
      return;
    case "build":
      generateRouteManifests(projectRoot);
      runLocalCommand(projectRoot, "vite", ["build"]);
      return;
    case "doctor": {
      const findings = runLitoDoctor(projectRoot);
      console.log(formatDoctorReport(findings));
      if (hasDoctorErrors(findings)) {
        process.exit(1);
      }
      return;
    }
    case "start":
      generateRouteManifests(projectRoot);
      runLocalCommand(projectRoot, "tsx", ["server.ts"], {
        NODE_ENV: "production"
      });
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

async function handleGenerateCommand(commandArgs: string[]) {
  const params = readRepeatedFlagValues(commandArgs, "--params");
  const queryFields = readQueryFlags(commandArgs);
  const isCsr = commandArgs.includes("--csr");
  const isSsr = commandArgs.includes("--ssr");
  let filteredArgs = stripRepeatedFlag(stripRepeatedFlag(commandArgs, "--params"), "--query");
  filteredArgs = stripBooleanFlag(filteredArgs, "--csr");
  filteredArgs = stripBooleanFlag(filteredArgs, "--ssr");
  const [rawGenerateTarget, generatePath] = filteredArgs;
  const generateTarget = normalizeGenerateTarget(rawGenerateTarget);

  const mode = isCsr ? "client" : isSsr ? "server" : undefined;

  switch (generateTarget) {
    case "routes":
      generateRouteManifests(projectRoot);
      console.log(`Generated route manifests for ${projectRoot}`);
      return;
    case "page":
      if (!generatePath) {
        throw new Error("Usage: litoho generate page <path> [--params <name[,name2]>] [--ssr] [--csr] [--root <dir>]");
      }
      console.log(`Created page at ${createPageFile(projectRoot, buildRoutePath(generatePath, params), { mode })}`);
      return;
    case "api":
      if (!generatePath) {
        throw new Error("Usage: litoho generate api <path> [--params <name[,name2]>] [--query <key:type[,key2:type2]>] [--root <dir>]");
      }
      console.log(
        `Created api route at ${createApiFile(projectRoot, buildRoutePath(generatePath, params), { queryFields })}`
      );
      return;
    case "resource":
      if (!generatePath) {
        throw new Error("Usage: litoho generate resource <name> [--root <dir>]");
      }
      createCrudResource(projectRoot, buildRoutePath(generatePath, params));
      console.log(`Created CRUD resource for ${buildRoutePath(generatePath, params)}`);
      return;
    case "layout":
      if (!generatePath) {
        throw new Error("Usage: litoho generate layout <path> [--params <name[,name2]>] [--root <dir>]");
      }
      console.log(`Created layout at ${createLayoutFile(projectRoot, buildRoutePath(generatePath, params))}`);
      return;
    default:
      throw new Error(`Unknown generate target: ${rawGenerateTarget ?? "(missing)"}`);
  }
}

function runLocalCommand(cwd: string, binary: string, commandArgs: string[], env: Record<string, string> = {}) {
  const result = spawnSync("pnpm", ["exec", binary, ...commandArgs], {
    cwd,
    env: {
      ...process.env,
      ...env
    },
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function printHelp() {
  console.log(`Litoho CLI

Usage:
  litoho new <name>
  litoho dev [--root <dir>]
  litoho build [--root <dir>]
  litoho start [--root <dir>]
  litoho doctor [--root <dir>]
  litoho generate routes [--root <dir>]
  litoho g routes [--root <dir>]
  litoho generate page <path> [--params <name[,name2]>] [--ssr] [--csr] [--root <dir>]
  litoho -g page <path> [--params <name[,name2]>] [--ssr] [--csr] [--root <dir>]
  litoho g p <path> [--params <name[,name2]>] [--ssr] [--csr] [--root <dir>]
  litoho generate api <path> [--params <name[,name2]>] [--query <key:type[,key2:type2]>] [--root <dir>]
  litoho -g api <path> [--params <name[,name2]>] [--query <key:type[,key2:type2]>] [--root <dir>]
  litoho g a <path> [--params <name[,name2]>] [--query <key:type[,key2:type2]>] [--root <dir>]
  litoho generate resource <name> [--params <name[,name2]>] [--root <dir>]
  litoho g r <name> [--params <name[,name2]>] [--root <dir>]
  litoho generate layout <path> [--params <name[,name2]>] [--root <dir>]
  litoho g l <path> [--params <name[,name2]>] [--root <dir>]

Examples:
  litoho new blog-app
  litoho generate page docs/getting-started
  litoho -g page docs/getting-started
  litoho g p docs/getting-started
  litoho -g page products --params id
  # creates app/pages/docs/getting-started/_index.ts
  litoho generate api users --params id
  litoho g a products --params id --query q:number,draft:boolean,tag:strings
  litoho -g api users --params id,postId
  litoho g a users --params id
  litoho generate resource products --params id
  litoho g r products --params id
  litoho generate layout docs --params slug
  litoho g l docs --params slug
  litoho doctor
`);
}

function readFlagValue(args: string[], flagName: string) {
  const flagIndex = args.indexOf(flagName);
  return flagIndex >= 0 ? args[flagIndex + 1] : undefined;
}

function stripFlag(args: string[], flagName: string) {
  const values: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flagName) {
      index += 1;
      continue;
    }

    values.push(args[index]);
  }

  return values;
}

function stripBooleanFlag(args: string[], flagName: string) {
  return args.filter((arg) => arg !== flagName);
}

function readRepeatedFlagValues(args: string[], flagName: string) {
  const values: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== flagName) continue;

    const rawValue = args[index + 1];
    if (!rawValue) continue;

    values.push(
      ...rawValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    );
    index += 1;
  }

  return values;
}

function stripRepeatedFlag(args: string[], flagName: string) {
  const values: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flagName) {
      index += 1;
      continue;
    }

    values.push(args[index]);
  }

  return values;
}

function readQueryFlags(args: string[]) {
  const rawValues = readRepeatedFlagValues(args, "--query");
  return rawValues.map(parseQueryField);
}

function buildRoutePath(basePath: string, params: string[]) {
  if (params.length === 0) {
    return basePath;
  }

  const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, "");
  const dynamicSegments = params.map((param) => `[${param}]`);

  return [normalizedBasePath, ...dynamicSegments].filter(Boolean).join("/");
}

function normalizeGenerateTarget(value: string | undefined) {
  switch (value) {
    case "p":
      return "page";
    case "a":
      return "api";
    case "r":
      return "resource";
    case "l":
      return "layout";
    default:
      return value;
  }
}

function parseQueryField(rawValue: string): ApiQueryField {
  const [key, type] = rawValue.split(":").map((value) => value.trim());

  if (!key || !type) {
    throw new Error(`Invalid query field "${rawValue}". Expected <key:type>.`);
  }

  if (!isApiQueryFieldType(type)) {
    throw new Error(`Invalid query type "${type}" for "${key}". Use string, number, boolean, or strings.`);
  }

  return {
    key,
    type
  };
}

function isApiQueryFieldType(value: string): value is ApiQueryField["type"] {
  return value === "string" || value === "number" || value === "boolean" || value === "strings";
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
