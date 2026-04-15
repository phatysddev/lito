import type { LitoPageManifestEntry } from "@litoho/app";

export const pageManifest: LitoPageManifestEntry[] = [
  {
    page: () => import("../../app/pages/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "index",
    routePath: "/"
  },
  {
    page: () => import("../../app/pages/counter/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "counter",
    routePath: "/counter",
    mode: "client"
  },
  {
    page: () => import("../../app/pages/docs/getting-started/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }, { key: "docs", loader: () => import("../../app/pages/docs/_layout.ts") }],
    routeId: "docs:getting-started",
    routePath: "/docs/getting-started"
  },
  {
    page: () => import("../../app/pages/docs/performance/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }, { key: "docs", loader: () => import("../../app/pages/docs/_layout.ts") }],
    routeId: "docs:performance",
    routePath: "/docs/performance"
  }
];
