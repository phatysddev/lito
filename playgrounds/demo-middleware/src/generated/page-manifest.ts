import type { LitoPageManifestEntry } from "@litoho/app";

export const pageManifest: LitoPageManifestEntry[] = [
  {
    page: () => import("../../app/pages/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "index",
    routePath: "/"
  },
  {
    page: () => import("../../app/pages/docs/trace/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }, { key: "docs", loader: () => import("../../app/pages/docs/_layout.ts") }],
    routeId: "docs:trace",
    routePath: "/docs/trace"
  },
  {
    page: () => import("../../app/pages/request-inspector/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "request-inspector",
    routePath: "/request-inspector"
  }
];
