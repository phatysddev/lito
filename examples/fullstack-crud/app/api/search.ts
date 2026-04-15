import { defineApiRoute } from "@litoho/server";
const query = {
  q: "string",
  page: "number",
  tag: "strings"
} as const;

const route = defineApiRoute({
  query,
  get: (context) => {
    return Response.json({
      ok: true,
      route: "search",
      query: context.queryData
    });
  }
});

export default route;
