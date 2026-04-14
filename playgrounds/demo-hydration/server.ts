import { scanApiRoutesFromManifest, scanPageRoutesFromManifest } from "@litoho/app";
import { resolve } from "node:path";
import { startLitoNodeApp } from "@litoho/server";
import { apiModulePaths } from "./src/generated/api-manifest";
import { pageManifest } from "./src/generated/page-manifest";

const manifestBaseUrl = new URL("./src/generated/", import.meta.url);
const pages = await scanPageRoutesFromManifest({
  manifestBaseUrl,
  pageManifest
});
const apiRoutes = await scanApiRoutesFromManifest({
  manifestBaseUrl,
  apiModulePaths
});

await startLitoNodeApp({
  appName: "Litoho App",
  rootDir: resolve(process.cwd()),
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  port: Number(process.env.PORT ?? 3000),
  pages,
  apiRoutes
});

console.log(`Litoho app is running at http://localhost:${process.env.PORT ?? 3000}`);
