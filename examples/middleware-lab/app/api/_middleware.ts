import {
  composeMiddlewares,
  createLoggerMiddleware,
  json,
  requireAuth,
  withCacheControl,
  withCors,
  withRateLimit,
  withRequestId,
  withSecurityHeaders
} from "@litoho/server";

export default composeMiddlewares(
  withRequestId(),
  withSecurityHeaders(),
  withCors({
    allowOrigin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }),
  requireAuth({
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
  withRateLimit({
    protectedPathPrefixes: ["/api"],
    limit: 120,
    windowMs: 60_000
  }),
  withCacheControl({
    protectedPathPrefixes: ["/api"],
    value: "no-store"
  }),
  createLoggerMiddleware()
);
