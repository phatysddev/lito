import type { LitoPageManifestEntry } from "@litoho/app";

export const pageManifest: LitoPageManifestEntry[] = [
  {
    page: () => import("../../app/pages/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "index",
    routePath: "/"
  },
  {
    page: () => import("../../app/pages/catalog/[id]/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "catalog:[id]",
    routePath: "/catalog/:id",
    mode: "client"
  },
  {
    page: () => import("../../app/pages/counter/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "counter",
    routePath: "/counter",
    mode: "client"
  },
  {
    page: () => import("../../app/pages/server-data/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "server-data",
    routePath: "/server-data",
    mode: "server"
  }
];
