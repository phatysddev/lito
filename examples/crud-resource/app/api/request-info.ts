import { defineApiRoute } from "@litoho/server";
const query = {
  source: "string",
  token: "string"
} as const;

const route = defineApiRoute({
  query,
  get: (context) => {
    return Response.json({
      ok: true,
      route: "request-info",
      query: context.queryData
    });
  }
});

export default route;
