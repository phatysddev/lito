import { defineApiRoute } from "@litoho/server";

const query = {
  source: "string"
} as const;

const route = defineApiRoute({
  query,
  get: (context) => {
    return Response.json({
      ok: true,
      route: "request-info",
      query: context.queryData,
      locals: {
        requestId: context.getLocal("requestId"),
        requestedAt: context.getLocal("requestedAt"),
        source: context.getLocal("source"),
        visitor: context.getLocal("visitor"),
        requestPath: context.getLocal("requestPath")
      }
    });
  }
});

export default route;
