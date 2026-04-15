import type { LitoPageManifestEntry } from "@litoho/app";

export const pageManifest: LitoPageManifestEntry[] = [
  {
    page: () => import("../../app/pages/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "index",
    routePath: "/"
  },
  {
    page: () => import("../../app/pages/blog/[slug]/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "blog:[slug]",
    routePath: "/blog/:slug"
  },
  {
    page: () => import("../../app/pages/docs/getting-started/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }, { key: "docs", loader: () => import("../../app/pages/docs/_layout.ts") }],
    routeId: "docs:getting-started",
    routePath: "/docs/getting-started"
  },
  {
    page: () => import("../../app/pages/docs/reference/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }, { key: "docs", loader: () => import("../../app/pages/docs/_layout.ts") }],
    routeId: "docs:reference",
    routePath: "/docs/reference"
  },
  {
    page: () => import("../../app/pages/server-snapshot/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "server-snapshot",
    routePath: "/server-snapshot",
    mode: "server"
  }
];
