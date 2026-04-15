import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { resolveRoute } from "@litoho/router";
export function readQuery(context, schema) {
    const parsedEntries = Object.entries(schema).map(([key, valueType]) => {
        if (valueType === "strings") {
            return [key, context.query.getAll(key)];
        }
        const rawValue = context.query.get(key);
        if (valueType === "number") {
            if (rawValue === null) {
                return [key, null];
            }
            const parsedNumber = Number(rawValue);
            return [key, Number.isNaN(parsedNumber) ? null : parsedNumber];
        }
        if (valueType === "boolean") {
            if (rawValue === null) {
                return [key, null];
            }
            if (rawValue === "true" || rawValue === "1") {
                return [key, true];
            }
            if (rawValue === "false" || rawValue === "0") {
                return [key, false];
            }
            return [key, null];
        }
        return [key, rawValue];
    });
    return Object.fromEntries(parsedEntries);
}
export function defineApiRoute(definition) {
    const createHandler = (handler) => {
        if (!handler) {
            return undefined;
        }
        return (context) => handler({
            ...context,
            queryData: definition.query ? readQuery(context, definition.query) : undefined
        });
    };
    return {
        get: createHandler(definition.get),
        post: createHandler(definition.post),
        put: createHandler(definition.put),
        patch: createHandler(definition.patch),
        delete: createHandler(definition.delete),
        options: createHandler(definition.options)
    };
}
export function json(data, init = {}) {
    return Response.json(data, init);
}
export function redirect(location, status = 302) {
    return Response.redirect(String(location), status);
}
export function unauthorized(body = "Unauthorized", init = {}) {
    return new Response(body, {
        ...init,
        status: init.status ?? 401
    });
}
export function forbidden(body = "Forbidden", init = {}) {
    return new Response(body, {
        ...init,
        status: init.status ?? 403
    });
}
export function badRequest(body = "Bad Request", init = {}) {
    return new Response(body, {
        ...init,
        status: init.status ?? 400
    });
}
export function notFound(body = "Not Found", init = {}) {
    return new Response(body, {
        ...init,
        status: init.status ?? 404
    });
}
export function methodNotAllowed(body = "Method Not Allowed", init = {}) {
    return new Response(body, {
        ...init,
        status: init.status ?? 405
    });
}
export function html(body, init = {}) {
    const headers = new Headers(init.headers);
    if (!headers.has("content-type")) {
        headers.set("content-type", "text/html; charset=utf-8");
    }
    return new Response(body, {
        ...init,
        headers
    });
}
export function createRequestMetaMiddleware(options = {}) {
    const requestIdKey = options.requestIdKey ?? "requestId";
    const requestedAtKey = options.requestedAtKey ?? "requestedAt";
    const sourceKey = options.sourceKey ?? "source";
    const visitorKey = options.visitorKey ?? "visitor";
    const requestPathKey = options.requestPathKey ?? "requestPath";
    const sourceQueryParam = options.sourceQueryParam ?? "source";
    const visitorCookieName = options.visitorCookieName ?? "visitor";
    return async (context, next) => {
        context.setLocal(requestIdKey, crypto.randomUUID());
        context.setLocal(requestedAtKey, new Date(context.timing.startedAt).toISOString());
        context.setLocal(sourceKey, context.query.get(sourceQueryParam) ?? "direct");
        context.setLocal(visitorKey, context.getCookie(visitorCookieName) ?? "guest");
        context.setLocal(requestPathKey, context.pathname);
        return next();
    };
}
export function createAuthGuardMiddleware(options = {}) {
    const tokenSources = options.tokenSources ?? ["cookie", "header", "query"];
    const cookieName = options.cookieName ?? "session";
    const headerName = options.headerName ?? "authorization";
    const queryParam = options.queryParam ?? "token";
    const expectedToken = options.expectedToken ?? "demo-secret";
    const protectedPathPrefixes = options.protectedPathPrefixes ?? [];
    const tokenKey = options.tokenKey ?? "auth.token";
    const authenticatedKey = options.authenticatedKey ?? "auth.isAuthenticated";
    const guardKey = options.guardKey ?? "auth.guard";
    return async (context, next) => {
        const attemptedSources = [];
        let token = null;
        for (const source of tokenSources) {
            if (source === "cookie") {
                attemptedSources.push(`cookie:${cookieName}`);
                token ??= context.getCookie(cookieName) ?? null;
            }
            if (source === "header") {
                attemptedSources.push(`header:${headerName}`);
                token ??= context.headers.get(headerName) ?? null;
            }
            if (source === "query") {
                attemptedSources.push(`query:${queryParam}`);
                token ??= context.query.get(queryParam) ?? null;
            }
        }
        const isAuthenticated = token === expectedToken;
        context.setLocal(tokenKey, token);
        context.setLocal(authenticatedKey, isAuthenticated);
        context.setLocal(guardKey, attemptedSources.join(" | "));
        const isProtectedRoute = protectedPathPrefixes.some((prefix) => context.pathname.startsWith(prefix));
        if (isProtectedRoute && !isAuthenticated) {
            if (options.unauthorizedResponse) {
                return typeof options.unauthorizedResponse === "function"
                    ? await options.unauthorizedResponse(context)
                    : options.unauthorizedResponse;
            }
            throw options.createError?.(context) ?? new Error(`Unauthorized request. Try ?${queryParam}=${expectedToken}`);
        }
        return next();
    };
}
export function createTimingMiddleware(options = {}) {
    const startedAtKey = options.startedAtKey ?? "timing.startedAt";
    const durationKey = options.durationKey ?? "timing.durationMs";
    const completedAtKey = options.completedAtKey ?? "timing.completedAt";
    return async (context, next) => {
        try {
            return await next();
        }
        finally {
            const durationMs = Date.now() - context.timing.startedAt;
            context.setLocal(startedAtKey, context.timing.startedAt);
            context.setLocal(durationKey, durationMs);
            context.setLocal(completedAtKey, new Date().toISOString());
        }
    };
}
export function createLoggerMiddleware(options = {}) {
    const requestIdKey = options.requestIdKey ?? "requestId";
    const durationKey = options.durationKey ?? "timing.durationMs";
    const writeLog = options.log ?? ((message) => console.log(message));
    return async (context, next) => {
        const requestId = String(context.getLocal(requestIdKey) ?? "missing");
        writeLog(`[litoho] -> ${context.kind.toUpperCase()} ${context.pathname} requestId=${requestId}`, context);
        try {
            return await next();
        }
        finally {
            const durationMs = context.getLocal(durationKey) ?? Date.now() - context.timing.startedAt;
            writeLog(`[litoho] <- ${context.kind.toUpperCase()} ${context.pathname} requestId=${requestId} duration=${durationMs}ms`, context);
        }
    };
}
export function requireAuth(options = {}) {
    return createAuthGuardMiddleware({
        unauthorizedResponse: unauthorized("Unauthorized", {
            headers: {
                "content-type": "text/plain; charset=utf-8"
            }
        }),
        ...options
    });
}
export function requireRole(options) {
    const protectedPathPrefixes = options.protectedPathPrefixes ?? [];
    const roleKey = options.roleKey ?? "auth.role";
    const roleSources = options.roleSources ?? ["local", "header", "query", "cookie"];
    const headerName = options.headerName ?? "x-role";
    const queryParam = options.queryParam ?? "role";
    const cookieName = options.cookieName ?? "role";
    return async (context, next) => {
        const matchesProtectedPath = protectedPathPrefixes.length === 0 || protectedPathPrefixes.some((prefix) => context.pathname.startsWith(prefix));
        if (!matchesProtectedPath) {
            return next();
        }
        const roles = new Set();
        for (const source of roleSources) {
            if (source === "local") {
                const localRole = context.getLocal(roleKey);
                if (Array.isArray(localRole)) {
                    for (const entry of localRole)
                        roles.add(entry);
                }
                else if (typeof localRole === "string") {
                    roles.add(localRole);
                }
            }
            if (source === "header") {
                const headerRole = context.headers.get(headerName);
                if (headerRole)
                    roles.add(headerRole);
            }
            if (source === "query") {
                const queryRole = context.query.get(queryParam);
                if (queryRole)
                    roles.add(queryRole);
            }
            if (source === "cookie") {
                const cookieRole = context.getCookie(cookieName);
                if (cookieRole)
                    roles.add(cookieRole);
            }
        }
        const hasRole = options.requiredRoles.some((role) => roles.has(role));
        if (!hasRole) {
            if (options.forbiddenResponse) {
                return typeof options.forbiddenResponse === "function"
                    ? await options.forbiddenResponse(context)
                    : options.forbiddenResponse;
            }
            throw options.createError?.(context) ?? new Error(`Forbidden. Required role: ${options.requiredRoles.join(", ")}`);
        }
        return next();
    };
}
export function withCors(options = {}) {
    const allowOrigin = options.allowOrigin ?? "*";
    const allowMethods = options.allowMethods ?? ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
    const allowHeaders = options.allowHeaders ?? ["content-type", "authorization"];
    const exposeHeaders = options.exposeHeaders ?? [];
    const allowCredentials = options.allowCredentials ?? false;
    const maxAge = options.maxAge;
    const optionsSuccessStatus = options.optionsSuccessStatus ?? 204;
    return async (context, next) => {
        const requestOrigin = context.headers.get("origin");
        const originValue = Array.isArray(allowOrigin)
            ? requestOrigin && allowOrigin.includes(requestOrigin)
                ? requestOrigin
                : allowOrigin[0] ?? "*"
            : allowOrigin;
        const headers = new Headers();
        headers.set("access-control-allow-origin", originValue);
        headers.set("access-control-allow-methods", allowMethods.join(", "));
        headers.set("access-control-allow-headers", allowHeaders.join(", "));
        if (exposeHeaders.length > 0) {
            headers.set("access-control-expose-headers", exposeHeaders.join(", "));
        }
        if (allowCredentials) {
            headers.set("access-control-allow-credentials", "true");
        }
        if (typeof maxAge === "number") {
            headers.set("access-control-max-age", String(maxAge));
        }
        if (context.request.method === "OPTIONS") {
            return new Response(null, {
                status: optionsSuccessStatus,
                headers
            });
        }
        const response = await next();
        if (!response) {
            return response;
        }
        for (const [key, value] of headers.entries()) {
            response.headers.set(key, value);
        }
        return response;
    };
}
const rateLimitState = new Map();
export function withRateLimit(options = {}) {
    const limit = options.limit ?? 60;
    const windowMs = options.windowMs ?? 60000;
    const protectedPathPrefixes = options.protectedPathPrefixes ?? [];
    const status = options.status ?? 429;
    const retryAfterHeader = options.retryAfterHeader ?? true;
    return async (context, next) => {
        const matchesProtectedPath = protectedPathPrefixes.length === 0 || protectedPathPrefixes.some((prefix) => context.pathname.startsWith(prefix));
        if (!matchesProtectedPath) {
            return next();
        }
        const resolvedKey = typeof options.key === "function"
            ? options.key(context)
            : options.key ??
                `${context.pathname}:${context.headers.get("x-forwarded-for") ?? context.getCookie("visitor") ?? "global"}`;
        const now = Date.now();
        const current = rateLimitState.get(resolvedKey);
        if (!current || now >= current.resetAt) {
            rateLimitState.set(resolvedKey, {
                count: 1,
                resetAt: now + windowMs
            });
            return next();
        }
        if (current.count >= limit) {
            const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
            if (options.response) {
                const response = typeof options.response === "function"
                    ? await options.response({
                        ...context,
                        retryAfterSeconds
                    })
                    : options.response;
                if (retryAfterHeader) {
                    response.headers.set("retry-after", String(retryAfterSeconds));
                }
                return response;
            }
            return json({
                ok: false,
                error: {
                    message: "Too Many Requests"
                }
            }, {
                status,
                headers: retryAfterHeader
                    ? {
                        "retry-after": String(retryAfterSeconds)
                    }
                    : undefined
            });
        }
        current.count += 1;
        return next();
    };
}
export function withSecurityHeaders(options = {}) {
    const headerEntries = new Map();
    headerEntries.set("x-frame-options", options.frameOptions ?? "DENY");
    headerEntries.set("x-content-type-options", options.contentTypeOptions ?? "nosniff");
    headerEntries.set("referrer-policy", options.referrerPolicy ?? "no-referrer");
    headerEntries.set("cross-origin-opener-policy", options.crossOriginOpenerPolicy ?? "same-origin");
    headerEntries.set("cross-origin-resource-policy", options.crossOriginResourcePolicy ?? "same-origin");
    if (options.permissionsPolicy) {
        headerEntries.set("permissions-policy", options.permissionsPolicy);
    }
    if (options.contentSecurityPolicy) {
        headerEntries.set("content-security-policy", options.contentSecurityPolicy);
    }
    return async (_context, next) => {
        const response = await next();
        if (!response) {
            return response;
        }
        for (const [key, value] of headerEntries.entries()) {
            response.headers.set(key, value);
        }
        return response;
    };
}
export function withRequestId(options = {}) {
    const localKey = options.localKey ?? "requestId";
    const headerName = options.headerName ?? "x-request-id";
    const generator = options.generator ?? (() => crypto.randomUUID());
    return async (context, next) => {
        const requestId = String(context.getLocal(localKey) ?? generator());
        context.setLocal(localKey, requestId);
        const response = await next();
        if (!response) {
            return response;
        }
        response.headers.set(headerName, requestId);
        return response;
    };
}
export function withCacheControl(options = {}) {
    const value = options.value ?? "no-store";
    const protectedPathPrefixes = options.protectedPathPrefixes ?? [];
    return async (context, next) => {
        const matchesProtectedPath = protectedPathPrefixes.length === 0 || protectedPathPrefixes.some((prefix) => context.pathname.startsWith(prefix));
        const response = await next();
        if (!response) {
            return response;
        }
        if (matchesProtectedPath) {
            response.headers.set("cache-control", value);
        }
        return response;
    };
}
export function composeMiddlewares(...middlewares) {
    const activeMiddlewares = middlewares.filter(Boolean);
    return async (context, next) => {
        let index = -1;
        const dispatch = async (nextIndex) => {
            if (nextIndex <= index) {
                throw new Error("Litoho composed middleware `next()` called multiple times.");
            }
            index = nextIndex;
            const middleware = activeMiddlewares[nextIndex];
            if (!middleware) {
                return next();
            }
            return await middleware(context, async () => {
                return dispatch(nextIndex + 1);
            });
        };
        return dispatch(0);
    };
}
export function createLitoServer(options = {}) {
    const app = new Hono();
    const appName = options.appName ?? "Litoho";
    const pages = options.pages ?? [];
    const apiRoutes = options.apiRoutes ?? [];
    const middlewares = options.middlewares ?? [];
    const env = options.env ?? process.env;
    const logger = options.logger;
    if (options.staticRoot) {
        app.use("/assets/*", serveStatic({ root: options.staticRoot }));
    }
    registerApiRoutes(app, {
        appName,
        env,
        logger,
        middlewares,
        routes: apiRoutes
    });
    app.all("/", async (context) => {
        if (pages.length === 0) {
            return context.text(`${appName} server scaffold is running.`);
        }
        return handlePageRequest({
            appName,
            clientAssets: options.clientAssets,
            env,
            errorPage: options.errorPage,
            logger,
            middlewares,
            notFoundPage: options.notFoundPage,
            pages,
            request: context.req.raw
        });
    });
    app.all("*", async (context) => handlePageRequest({
        appName,
        clientAssets: options.clientAssets,
        env,
        errorPage: options.errorPage,
        logger,
        middlewares,
        notFoundPage: options.notFoundPage,
        pages,
        request: context.req.raw
    }));
    return app;
}
function registerApiRoutes(app, input) {
    if (input.routes.length === 0) {
        app.get("/api/health", (context) => {
            return context.json({
                ok: true,
                appName: input.appName
            });
        });
        return;
    }
    for (const route of input.routes) {
        const methodEntries = [
            ["get", route.get],
            ["post", route.post],
            ["put", route.put],
            ["patch", route.patch],
            ["delete", route.delete],
            ["options", route.options]
        ];
        for (const [methodName, handler] of methodEntries) {
            if (!handler)
                continue;
            app.on(methodName.toUpperCase(), route.path, async (context) => {
                const requestContext = createRequestContext({
                    env: input.env,
                    params: context.req.param(),
                    pathname: new URL(context.req.raw.url).pathname,
                    request: context.req.raw
                });
                const loggerContext = createLoggerContext(requestContext, "api", route.id);
                try {
                    await input.logger?.onRequestStart?.(loggerContext);
                    const middlewareResponse = await runMiddlewares({
                        context: requestContext,
                        kind: "api",
                        middlewares: input.middlewares,
                        routeId: route.id
                    });
                    const response = middlewareResponse ?? (await handler(requestContext));
                    finalizeRequestTiming(requestContext);
                    await input.logger?.onRequestComplete?.({
                        ...loggerContext,
                        response
                    });
                    return response;
                }
                catch (error) {
                    finalizeRequestTiming(requestContext);
                    await input.logger?.onRequestError?.({
                        ...loggerContext,
                        error,
                        status: 500
                    });
                    return createApiErrorResponse(error);
                }
            });
        }
    }
}
async function handlePageRequest(input) {
    if (input.pages.length === 0) {
        return new Response(`${input.appName} server scaffold is running.`, {
            headers: {
                "content-type": "text/plain; charset=utf-8"
            }
        });
    }
    const url = new URL(input.request.url);
    const resolvedRoute = resolveRoute([...input.pages], url.pathname);
    const requestContext = createRequestContext({
        env: input.env,
        params: resolvedRoute?.match.params ?? {},
        pathname: resolvedRoute?.match.pathname ?? url.pathname,
        request: input.request
    });
    if (!resolvedRoute) {
        const loggerContext = createLoggerContext(requestContext, "page");
        await input.logger?.onRequestStart?.(loggerContext);
        const middlewareResponse = await runMiddlewares({
            context: requestContext,
            kind: "page",
            middlewares: input.middlewares
        });
        if (middlewareResponse) {
            finalizeRequestTiming(requestContext);
            await input.logger?.onRequestComplete?.({
                ...loggerContext,
                response: middlewareResponse
            });
            return middlewareResponse;
        }
        const response = input.notFoundPage
            ? await renderNotFoundPage({
                appName: input.appName,
                clientAssets: input.clientAssets,
                context: requestContext,
                page: input.notFoundPage
            })
            : new Response("Not Found", {
                status: 404,
                headers: {
                    "content-type": "text/plain; charset=utf-8"
                }
            });
        finalizeRequestTiming(requestContext);
        await input.logger?.onRequestComplete?.({
            ...loggerContext,
            response
        });
        return response;
    }
    const loggerContext = createLoggerContext(requestContext, "page", resolvedRoute.route.id);
    try {
        await input.logger?.onRequestStart?.(loggerContext);
        const middlewareResponse = await runMiddlewares({
            context: requestContext,
            kind: "page",
            middlewares: input.middlewares,
            routeId: resolvedRoute.route.id
        });
        if (middlewareResponse) {
            finalizeRequestTiming(requestContext);
            await input.logger?.onRequestComplete?.({
                ...loggerContext,
                response: middlewareResponse
            });
            return middlewareResponse;
        }
        const response = await renderMatchedPage({
            appName: input.appName,
            clientAssets: input.clientAssets,
            context: requestContext,
            route: resolvedRoute.route
        });
        finalizeRequestTiming(requestContext);
        await input.logger?.onRequestComplete?.({
            ...loggerContext,
            response
        });
        return response;
    }
    catch (error) {
        finalizeRequestTiming(requestContext);
        console.error("[Litoho Server Error]", error);
        await input.logger?.onRequestError?.({
            ...loggerContext,
            error,
            status: 500
        });
        if (input.errorPage) {
            return renderErrorPage({
                appName: input.appName,
                clientAssets: input.clientAssets,
                context: requestContext,
                error,
                page: input.errorPage,
                status: 500
            });
        }
        return new Response("Internal Server Error", {
            status: 500,
            headers: {
                "content-type": "text/plain; charset=utf-8"
            }
        });
    }
}
const ssrInternalCache = new Map();
async function executeAndCachePage(input, cacheKey) {
    const method = input.context.request.method;
    const isMutation = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
    const isClientOnly = input.route.mode === "client";
    let actionData = undefined;
    if (isMutation) {
        if (!input.route.action) {
            return new Response("Method Not Allowed", { status: 405 });
        }
        actionData = await input.route.action(input.context);
    }
    const data = !isClientOnly && input.route.load ? await input.route.load(input.context) : undefined;
    const template = !isClientOnly ? input.route.render({
        ...input.context,
        data,
        actionData
    }) : undefined;
    const document = input.route.document
        ? await resolveDocumentDefinition(input.route.document, {
            ...input.context,
            data,
            actionData
        })
        : undefined;
    const body = isClientOnly
        ? `<div id="litoho-client-root" data-route-id="${escapeHtml(input.route.id)}"></div>`
        : await collectResult(render(template));
    const response = createHtmlResponse({
        appName: input.appName,
        body,
        clientAssets: input.clientAssets,
        data,
        actionData,
        document
    });
    if (input.route.cache && response.status === 200) {
        const htmlString = await response.clone().text();
        const maxAgeMs = input.route.cache.maxAge * 1000;
        const staleMs = (input.route.cache.staleWhileRevalidate ?? 0) * 1000;
        response.headers.set('Cache-Control', `public, max-age=${input.route.cache.maxAge}${input.route.cache.staleWhileRevalidate ? `, stale-while-revalidate=${input.route.cache.staleWhileRevalidate}` : ''}`);
        ssrInternalCache.set(cacheKey, {
            body: htmlString,
            headers: Array.from(response.headers.entries()),
            expiry: Date.now() + maxAgeMs,
            staleExpiry: staleMs ? Date.now() + maxAgeMs + staleMs : 0
        });
    }
    return response;
}
async function renderMatchedPage(input) {
    const cacheKey = input.context.url.pathname + input.context.url.search;
    const method = input.context.request.method;
    const isGetOrHead = method === "GET" || method === "HEAD";
    if (input.route.cache && isGetOrHead) {
        const cached = ssrInternalCache.get(cacheKey);
        const now = Date.now();
        if (cached) {
            if (now < cached.expiry) {
                return new Response(cached.body, { headers: new Headers(cached.headers), status: 200 });
            }
            if (cached.staleExpiry && now < cached.staleExpiry) {
                // Serve stale, rebuild background
                setTimeout(() => {
                    executeAndCachePage(input, cacheKey).catch((err) => console.error("[LITOHO] Background cache revalidation failed:", err));
                }, 0);
                return new Response(cached.body, { headers: new Headers(cached.headers), status: 200 });
            }
        }
    }
    return executeAndCachePage(input, cacheKey);
}
async function renderNotFoundPage(input) {
    const template = input.page.render(input.context);
    const document = input.page.document ? await resolveDocumentDefinition(input.page.document, input.context) : undefined;
    const body = await collectResult(render(template));
    return createHtmlResponse({
        appName: input.appName,
        body,
        clientAssets: input.clientAssets,
        data: null,
        document,
        status: 404
    });
}
async function renderErrorPage(input) {
    const errorContext = {
        ...input.context,
        error: input.error,
        status: input.status
    };
    const template = input.page.render(errorContext);
    const document = input.page.document ? await resolveDocumentDefinition(input.page.document, errorContext) : undefined;
    const body = await collectResult(render(template));
    return createHtmlResponse({
        appName: input.appName,
        body,
        clientAssets: input.clientAssets,
        data: {
            error: {
                status: input.status
            }
        },
        document,
        status: input.status
    });
}
function createRequestContext(input) {
    const locals = {};
    const url = new URL(input.request.url);
    const cookies = parseCookies(input.request.headers.get("cookie"));
    return {
        request: input.request,
        pathname: input.pathname,
        params: input.params,
        url,
        query: url.searchParams,
        headers: input.request.headers,
        cookies,
        getCookie: (name) => cookies[name],
        locals,
        env: input.env,
        timing: {
            startedAt: Date.now()
        },
        setLocal: (key, value) => {
            locals[key] = value;
            return value;
        },
        getLocal: (key) => locals[key]
    };
}
async function runMiddlewares(input) {
    let currentIndex = -1;
    const dispatch = async (index) => {
        if (index <= currentIndex) {
            throw new Error("Litoho middleware `next()` called multiple times.");
        }
        currentIndex = index;
        const middleware = input.middlewares[index];
        if (!middleware) {
            return undefined;
        }
        return middleware({
            ...input.context,
            kind: input.kind,
            routeId: input.routeId
        }, async () => {
            return dispatch(index + 1);
        });
    };
    return dispatch(0);
}
function createApiErrorResponse(error) {
    return Response.json({
        ok: false,
        error: {
            message: error instanceof Error ? error.message : "Internal Server Error"
        }
    }, {
        status: 500
    });
}
function createHtmlResponse(input) {
    return new Response(createHtmlDocument({
        appName: input.appName,
        body: input.body,
        clientAssets: input.clientAssets,
        data: input.data,
        actionData: input.actionData,
        document: input.document
    }), {
        status: input.status ?? 200,
        headers: {
            "content-type": "text/html; charset=utf-8"
        }
    });
}
function createHtmlDocument(input) {
    const clientScript = (input.clientAssets?.scripts ?? [])
        .map((script) => `<script type="module" src="${script}"></script>`)
        .join("\n    ");
    const clientStyles = (input.clientAssets?.styles ?? [])
        .map((style) => `<link rel="stylesheet" href="${escapeHtml(style)}" />`)
        .join("\n    ");
    const payload = { pageData: input.data, actionData: input.actionData };
    const serializedData = serializePageData(payload);
    const title = escapeHtml(input.document?.title ?? input.appName);
    const lang = escapeHtml(input.document?.lang ?? "en");
    const metaTags = (input.document?.meta ?? [])
        .map((tag) => createMetaTag(tag))
        .join("\n    ");
    const documentLinkTags = (input.document?.links ?? [])
        .map((link) => createLinkTag(link))
        .join("\n    ");
    const styleTags = (input.document?.styles ?? [])
        .map((style, index) => `<style data-litoho-style="${index}">${escapeStyle(style)}</style>`)
        .join("\n    ");
    const optionalHeadTags = [metaTags, documentLinkTags, clientStyles, styleTags].filter(Boolean).join("\n    ");
    return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${optionalHeadTags}
  </head>
  <body>
    <div id="app">${input.body}</div>
    <script>window.__LITOHO_DATA__=${serializedData};</script>
    ${clientScript}
  </body>
</html>`;
}
function serializePageData(data) {
    return JSON.stringify(data ?? null).replace(/</g, "\\u003c");
}
async function resolveDocumentDefinition(definition, context) {
    return typeof definition === "function" ? await definition(context) : definition;
}
function createMetaTag(tag) {
    const attributes = [
        tag.name ? `name="${escapeHtml(tag.name)}"` : "",
        tag.property ? `property="${escapeHtml(tag.property)}"` : "",
        `content="${escapeHtml(tag.content)}"`
    ]
        .filter(Boolean)
        .join(" ");
    return `<meta ${attributes} />`;
}
function createLinkTag(tag) {
    const attributes = [
        `rel="${escapeHtml(tag.rel)}"`,
        `href="${escapeHtml(tag.href)}"`,
        tag.type ? `type="${escapeHtml(tag.type)}"` : "",
        tag.crossorigin ? `crossorigin="${escapeHtml(tag.crossorigin)}"` : "",
        tag.as ? `as="${escapeHtml(tag.as)}"` : "",
        tag.media ? `media="${escapeHtml(tag.media)}"` : ""
    ]
        .filter(Boolean)
        .join(" ");
    return `<link ${attributes} />`;
}
function parseCookies(cookieHeader) {
    if (!cookieHeader) {
        return {};
    }
    const entries = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) {
            return [part, ""];
        }
        const key = decodeURIComponent(part.slice(0, separatorIndex));
        const value = decodeURIComponent(part.slice(separatorIndex + 1));
        return [key, value];
    });
    return Object.freeze(Object.fromEntries(entries));
}
function createLoggerContext(context, kind, routeId) {
    return {
        ...context,
        kind,
        routeId
    };
}
function finalizeRequestTiming(context) {
    if (context.timing.endedAt) {
        return;
    }
    context.timing.endedAt = Date.now();
    context.timing.durationMs = context.timing.endedAt - context.timing.startedAt;
}
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function escapeStyle(value) {
    return value.replace(/<\/style/gi, "<\\/style");
}
//# sourceMappingURL=server.js.map
