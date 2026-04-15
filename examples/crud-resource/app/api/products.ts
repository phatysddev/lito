import { defineApiRoute } from "@litoho/server";

const route = defineApiRoute({
  get: () =>
    Response.json({
      ok: true,
      resource: "products",
      action: "list"
    }),
  post: () =>
    Response.json({
      ok: true,
      resource: "products",
      action: "create"
    })
});

export default route;
