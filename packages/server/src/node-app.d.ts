import type { Server as NodeHttpServer } from "node:http";
import { type ViteDevServer } from "vite";
import { type LitoApiRoute, type LitoErrorPage, type LitoLoggerHooks, type LitoMiddleware, type LitoNotFoundPage, type LitoPageRoute } from "./server.js";
export type LitoNodeAppOptions = {
    appName?: string;
    port?: number;
    mode?: "development" | "production";
    rootDir?: string;
    clientEntry?: string;
    pages?: LitoPageRoute[];
    apiRoutes?: LitoApiRoute[];
    notFoundPage?: LitoNotFoundPage;
    errorPage?: LitoErrorPage;
    middlewares?: readonly LitoMiddleware[];
    logger?: LitoLoggerHooks;
    env?: Record<string, string | undefined>;
};
export type LitoNodeApp = {
    close: () => Promise<void>;
    httpServer: NodeHttpServer;
    vite?: ViteDevServer;
};
export declare function startLitoNodeApp(options?: LitoNodeAppOptions): Promise<LitoNodeApp>;
