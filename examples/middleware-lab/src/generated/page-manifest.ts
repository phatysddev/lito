import type { LitoPageManifestEntry } from "@litoho/app";

export const pageManifest: LitoPageManifestEntry[] = [
  {
    page: () => import("../../app/pages/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "index",
    routePath: "/"
  },
  {
    page: () => import("../../app/pages/api-lab/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "api-lab",
    routePath: "/api-lab",
    mode: "client"
  },
  {
    page: () => import("../../app/pages/counter-lab/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "counter-lab",
    routePath: "/counter-lab",
    mode: "client"
  },
  {
    page: () => import("../../app/pages/failure-lab/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "failure-lab",
    routePath: "/failure-lab"
  },
  {
    page: () => import("../../app/pages/server-snapshot/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "server-snapshot",
    routePath: "/server-snapshot",
    mode: "server"
  }
];
