import {
  composeMiddlewares,
  createLoggerMiddleware,
  createRequestMetaMiddleware,
  createTimingMiddleware,
  withCacheControl,
  withRequestId,
  withSecurityHeaders
} from "@litoho/server";

export default composeMiddlewares(
  withRequestId(),
  createRequestMetaMiddleware(),
  createTimingMiddleware(),
  withSecurityHeaders({
    contentSecurityPolicy: "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
  }),
  withCacheControl({
    value: "private, no-store"
  }),
  createLoggerMiddleware()
);
