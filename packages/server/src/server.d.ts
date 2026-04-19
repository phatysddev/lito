import { Hono } from "hono";
import type { LitoClientAssets } from "./client-assets.js";
export type LitoServerEnvironment = Record<string, string | undefined>;
export type LitoRequestLocals = Record<string, unknown>;
export type LitoRequestTiming = {
    startedAt: number;
    endedAt?: number;
    durationMs?: number;
};
export type LitoRequestContext = {
    request: Request;
    pathname: string;
    params: Record<string, string>;
    url: URL;
    query: URLSearchParams;
    headers: Headers;
    cookies: Readonly<Record<string, string>>;
    getCookie: (name: string) => string | undefined;
    locals: LitoRequestLocals;
    env: LitoServerEnvironment;
    timing: LitoRequestTiming;
    setLocal: <Value>(key: string, value: Value) => Value;
    getLocal: <Value>(key: string) => Value | undefined;
};
export type LitoApiContext<Params extends Record<string, string> = Record<string, string>> = Omit<LitoRequestContext, "params"> & {
    params: Params;
};
export type LitoApiHandlerContext<Params extends Record<string, string> = Record<string, string>, QuerySchema extends LitoQuerySchema | undefined = undefined> = LitoApiContext<Params> & {
    queryData: QuerySchema extends LitoQuerySchema ? LitoParsedQuery<QuerySchema> : undefined;
};
export type LitoQueryValueType = "string" | "number" | "boolean" | "strings";
export type LitoQuerySchema = Record<string, LitoQueryValueType>;
export type LitoParsedQuery<Schema extends LitoQuerySchema> = {
    [Key in keyof Schema]: Schema[Key] extends "number" ? number | null : Schema[Key] extends "boolean" ? boolean | null : Schema[Key] extends "strings" ? string[] : string | null;
};
export type LitoMiddlewareContext = LitoRequestContext & {
    kind: "page" | "api";
    routeId?: string;
};
export type LitoMiddlewareNext = () => Promise<Response | undefined>;
export type LitoMiddleware = (context: LitoMiddlewareContext, next: LitoMiddlewareNext) => Response | void | Promise<Response | void>;
export type LitoLoggerHooks = {
    onRequestStart?: (context: LitoMiddlewareContext) => void | Promise<void>;
    onRequestComplete?: (context: LitoMiddlewareContext & {
        response: Response;
    }) => void | Promise<void>;
    onRequestError?: (context: LitoMiddlewareContext & {
        error: unknown;
        status: number;
    }) => void | Promise<void>;
};
export type LitoServerOptions = {
    appName?: string;
    clientAssets?: LitoClientAssets;
    staticRoot?: string;
    publicRoot?: string;
    pages?: LitoPageRoute[];
    apiRoutes?: LitoApiRoute[];
    notFoundPage?: LitoNotFoundPage;
    errorPage?: LitoErrorPage;
    middlewares?: readonly LitoMiddleware[];
    env?: LitoServerEnvironment;
    logger?: LitoLoggerHooks;
};
export type LitoDocumentMetaTag = {
    name?: string;
    property?: string;
    content: string;
};
export type LitoDocumentLinkTag = {
    rel: string;
    href: string;
    type?: string;
    crossorigin?: string;
    as?: string;
    media?: string;
};
export type LitoDocumentDefinition = {
    title?: string;
    lang?: string;
    meta?: LitoDocumentMetaTag[];
    links?: LitoDocumentLinkTag[];
    styles?: string[];
};
export type LitoCacheConfig = {
    maxAge: number;
    staleWhileRevalidate?: number;
};
export type LitoPageRoute<Data = unknown, ActionData = unknown> = {
    id: string;
    path: string;
    mode?: "client" | "server";
    cache?: LitoCacheConfig;
    action?: (context: LitoRequestContext) => ActionData | Promise<ActionData>;
    load?: (context: LitoRequestContext) => Data | Promise<Data>;
    document?: LitoDocumentDefinition | ((context: LitoRequestContext & {
        data: Data;
        actionData?: ActionData;
    }) => LitoDocumentDefinition | Promise<LitoDocumentDefinition>);
    render: (context: LitoRequestContext & {
        data: Data;
        actionData?: ActionData;
    }) => unknown;
};
export type LitoApiHandler = (context: LitoRequestContext) => Response | Promise<Response>;
export type LitoApiRoute = {
    id: string;
    path: string;
    get?: LitoApiHandler;
    post?: LitoApiHandler;
    put?: LitoApiHandler;
    patch?: LitoApiHandler;
    delete?: LitoApiHandler;
    options?: LitoApiHandler;
};
export type LitoApiRouteDefinition<Params extends Record<string, string> = Record<string, string>, QuerySchema extends LitoQuerySchema | undefined = undefined> = {
    query?: QuerySchema;
    get?: (context: LitoApiHandlerContext<Params, QuerySchema>) => Response | Promise<Response>;
    post?: (context: LitoApiHandlerContext<Params, QuerySchema>) => Response | Promise<Response>;
    put?: (context: LitoApiHandlerContext<Params, QuerySchema>) => Response | Promise<Response>;
    patch?: (context: LitoApiHandlerContext<Params, QuerySchema>) => Response | Promise<Response>;
    delete?: (context: LitoApiHandlerContext<Params, QuerySchema>) => Response | Promise<Response>;
    options?: (context: LitoApiHandlerContext<Params, QuerySchema>) => Response | Promise<Response>;
};
export type LitoNotFoundPage = {
    document?: LitoDocumentDefinition | ((context: LitoRequestContext) => LitoDocumentDefinition | Promise<LitoDocumentDefinition>);
    render: (context: LitoRequestContext) => unknown;
};
export type LitoErrorPageContext = LitoRequestContext & {
    error: unknown;
    status: number;
};
export type LitoErrorPage = {
    document?: LitoDocumentDefinition | ((context: LitoErrorPageContext) => LitoDocumentDefinition | Promise<LitoDocumentDefinition>);
    render: (context: LitoErrorPageContext) => unknown;
};
export declare function json(data: unknown, init?: ResponseInit): Response;
export declare function redirect(location: string | URL, status?: number): Response;
export declare function unauthorized(body?: BodyInit | null, init?: ResponseInit): Response;
export declare function forbidden(body?: BodyInit | null, init?: ResponseInit): Response;
export declare function badRequest(body?: BodyInit | null, init?: ResponseInit): Response;
export declare function notFound(body?: BodyInit | null, init?: ResponseInit): Response;
export declare function methodNotAllowed(body?: BodyInit | null, init?: ResponseInit): Response;
export declare function html(body: BodyInit | null, init?: ResponseInit): Response;
export type LitoRequestMetaMiddlewareOptions = {
    requestIdKey?: string;
    requestedAtKey?: string;
    sourceKey?: string;
    visitorKey?: string;
    requestPathKey?: string;
    sourceQueryParam?: string;
    visitorCookieName?: string;
};
export type LitoAuthGuardMiddlewareOptions = {
    tokenSources?: Array<"cookie" | "header" | "query">;
    cookieName?: string;
    headerName?: string;
    queryParam?: string;
    expectedToken?: string;
    protectedPathPrefixes?: string[];
    tokenKey?: string;
    authenticatedKey?: string;
    guardKey?: string;
    unauthorizedResponse?: Response | ((context: LitoMiddlewareContext) => Response | Promise<Response>);
    createError?: (context: LitoMiddlewareContext) => Error;
};
export type LitoTimingMiddlewareOptions = {
    startedAtKey?: string;
    durationKey?: string;
    completedAtKey?: string;
};
export type LitoLoggerMiddlewareOptions = {
    requestIdKey?: string;
    durationKey?: string;
    log?: (message: string, context: LitoMiddlewareContext) => void;
};
export type LitoRequireAuthOptions = LitoAuthGuardMiddlewareOptions;
export type LitoRequireRoleOptions = {
    requiredRoles: string[];
    protectedPathPrefixes?: string[];
    roleKey?: string;
    roleSources?: Array<"local" | "header" | "query" | "cookie">;
    headerName?: string;
    queryParam?: string;
    cookieName?: string;
    forbiddenResponse?: Response | ((context: LitoMiddlewareContext) => Response | Promise<Response>);
    createError?: (context: LitoMiddlewareContext) => Error;
};
export type LitoCorsOptions = {
    allowOrigin?: string | string[];
    allowMethods?: string[];
    allowHeaders?: string[];
    exposeHeaders?: string[];
    allowCredentials?: boolean;
    maxAge?: number;
    optionsSuccessStatus?: number;
};
export type LitoRateLimitOptions = {
    limit?: number;
    windowMs?: number;
    key?: string | ((context: LitoMiddlewareContext) => string);
    protectedPathPrefixes?: string[];
    status?: number;
    retryAfterHeader?: boolean;
    response?: Response | ((context: LitoMiddlewareContext & {
        retryAfterSeconds: number;
    }) => Response | Promise<Response>);
};
export type LitoSecurityHeadersOptions = {
    frameOptions?: string;
    contentTypeOptions?: string;
    referrerPolicy?: string;
    crossOriginOpenerPolicy?: string;
    crossOriginResourcePolicy?: string;
    permissionsPolicy?: string;
    contentSecurityPolicy?: string;
};
export type LitoRequestIdOptions = {
    localKey?: string;
    headerName?: string;
    generator?: () => string;
};
export type LitoCacheControlOptions = {
    value?: string;
    protectedPathPrefixes?: string[];
};
export declare function readQuery<Schema extends LitoQuerySchema>(context: Pick<LitoRequestContext, "query">, schema: Schema): LitoParsedQuery<Schema>;
export declare function defineApiRoute<Params extends Record<string, string> = Record<string, string>, QuerySchema extends LitoQuerySchema | undefined = undefined>(definition: LitoApiRouteDefinition<Params, QuerySchema>): {
    get: LitoApiHandler | undefined;
    post: LitoApiHandler | undefined;
    put: LitoApiHandler | undefined;
    patch: LitoApiHandler | undefined;
    delete: LitoApiHandler | undefined;
    options: LitoApiHandler | undefined;
};
export declare function createRequestMetaMiddleware(options?: LitoRequestMetaMiddlewareOptions): LitoMiddleware;
export declare function createAuthGuardMiddleware(options?: LitoAuthGuardMiddlewareOptions): LitoMiddleware;
export declare function createTimingMiddleware(options?: LitoTimingMiddlewareOptions): LitoMiddleware;
export declare function createLoggerMiddleware(options?: LitoLoggerMiddlewareOptions): LitoMiddleware;
export declare function requireAuth(options?: LitoRequireAuthOptions): LitoMiddleware;
export declare function requireRole(options: LitoRequireRoleOptions): LitoMiddleware;
export declare function withSecurityHeaders(options?: LitoSecurityHeadersOptions): LitoMiddleware;
export declare function withRequestId(options?: LitoRequestIdOptions): LitoMiddleware;
export declare function withCacheControl(options?: LitoCacheControlOptions): LitoMiddleware;
export declare function withCors(options?: LitoCorsOptions): LitoMiddleware;
export declare function withRateLimit(options?: LitoRateLimitOptions): LitoMiddleware;
export declare function composeMiddlewares(...middlewares: Array<LitoMiddleware | false | null | undefined>): LitoMiddleware;
export declare function createLitoServer(options?: LitoServerOptions): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
