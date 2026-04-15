import { defineApiRoute } from "@litoho/server";
const query = {
  q: "string",
  page: "number"
} as const;

const route = defineApiRoute({
  query,
  get: (context) => {
    return Response.json({
      ok: true,
      route: "catalog",
      query: context.queryData
    });
  }
});

export default route;
