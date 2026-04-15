import { defineApiRoute } from "@litoho/server";

export default defineApiRoute({
  get: () =>
    Response.json({
      ok: true,
      secret: "litoho-demo-secret"
    })
});
