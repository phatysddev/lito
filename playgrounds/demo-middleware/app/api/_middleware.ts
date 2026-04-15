import {
  composeMiddlewares,
  createAuthGuardMiddleware,
  createLoggerMiddleware,
  createRequestMetaMiddleware,
  createTimingMiddleware,
  json
} from "@litoho/server";

export default composeMiddlewares(
  createRequestMetaMiddleware(),
  createAuthGuardMiddleware({
    protectedPathPrefixes: ["/docs"],
    createError: () => new Error("Unauthorized demo request. Try /docs/trace?token=demo-secret")
  }),
  createAuthGuardMiddleware({
    protectedPathPrefixes: ["/api/secure-data"],
    unauthorizedResponse: json(
      {
        ok: false,
        error: {
          message: "Unauthorized"
        }
      },
      {
        status: 401
      }
    )
  }),
  createTimingMiddleware(),
  createLoggerMiddleware()
);
