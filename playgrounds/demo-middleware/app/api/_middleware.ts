import type { LitoMiddleware } from "@litoho/server";

const middleware: LitoMiddleware = async (context, next) => {
  context.setLocal("requestId", crypto.randomUUID());
  context.setLocal("requestedAt", new Date(context.timing.startedAt).toISOString());
  context.setLocal("source", context.query.get("source") ?? "direct");
  context.setLocal("visitor", context.getCookie("visitor") ?? "guest");
  context.setLocal("requestPath", context.pathname);

  await next();
};

export default middleware;
