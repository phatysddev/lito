import { defineApiRoute } from "@litoho/server";
const route = defineApiRoute({
  get: (context) => {
    return Response.json({
      ok: true,
      route: "secure-data"
    });
  }
});

export default route;
