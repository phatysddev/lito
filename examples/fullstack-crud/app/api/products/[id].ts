import { defineApiRoute } from "@litoho/server";

const route = defineApiRoute({
  get: () =>
    Response.json({
      ok: true,
      resource: "products/[id]",
      action: "list"
    }),
  post: () =>
    Response.json({
      ok: true,
      resource: "products/[id]",
      action: "create"
    })
});

export default route;
