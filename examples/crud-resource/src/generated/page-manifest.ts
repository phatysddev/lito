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
    page: () => import("../../app/pages/dashboard/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "dashboard",
    routePath: "/dashboard",
    mode: "server"
  },
  {
    page: () => import("../../app/pages/products/[id]/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "products:[id]",
    routePath: "/products/:id"
  },
  {
    page: () => import("../../app/pages/products/[id]/edit/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "products:[id]:edit",
    routePath: "/products/:id/edit"
  },
  {
    page: () => import("../../app/pages/products/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "products",
    routePath: "/products"
  },
  {
    page: () => import("../../app/pages/products/new/_index.ts"),
    layouts: [{ key: "root", loader: () => import("../../app/pages/_layout.ts") }],
    routeId: "products:new",
    routePath: "/products/new"
  }
];
