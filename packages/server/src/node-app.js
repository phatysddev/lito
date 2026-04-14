import { createServer as createNodeServer } from "node:http";
import { resolve } from "node:path";
import { getRequestListener } from "@hono/node-server";
import { createServer as createViteServer } from "vite";
import { createDevClientAssets, createManifestClientAssets } from "./client-assets.js";
import { createLitoServer } from "./server.js";
export async function startLitoNodeApp(options = {}) {
    const port = options.port ?? 3000;
    const mode = options.mode ?? "development";
    const isProduction = mode === "production";
    const rootDir = options.rootDir ?? process.cwd();
    const distRoot = resolve(rootDir, "dist");
    const manifestPath = resolve(distRoot, "manifest.json");
    let vite;
    const app = createLitoServer({
        appName: options.appName,
        clientAssets: isProduction
            ? createManifestClientAssets({
                manifestPath
            })
            : createDevClientAssets(options.clientEntry),
        staticRoot: isProduction ? distRoot : undefined,
        pages: options.pages,
        apiRoutes: options.apiRoutes,
        notFoundPage: options.notFoundPage,
        errorPage: options.errorPage,
        middlewares: options.middlewares,
        logger: options.logger,
        env: options.env
    });
    const honoListener = getRequestListener(app.fetch);
    const httpServer = createNodeServer(async (request, response) => {
        if (vite) {
            await new Promise((resolveRequest, rejectRequest) => {
                vite.middlewares(request, response, (error) => {
                    if (error) {
                        rejectRequest(error);
                        return;
                    }
                    resolveRequest();
                });
            });
            if (response.writableEnded) {
                return;
            }
        }
        await honoListener(request, response);
    });
    if (!isProduction) {
        vite = await createViteServer({
            appType: "custom",
            root: rootDir,
            server: {
                middlewareMode: {
                    server: httpServer
                }
            }
        });
    }
    await new Promise((resolveListen) => {
        httpServer.listen(port, resolveListen);
    });
    const close = async () => {
        await vite?.close();
        await new Promise((resolveClose, rejectClose) => {
            httpServer.close((error) => {
                if (error) {
                    rejectClose(error);
                    return;
                }
                resolveClose();
            });
        });
    };
    for (const signal of ["SIGINT", "SIGTERM"]) {
        process.on(signal, async () => {
            await close();
            process.exit(0);
        });
    }
    return {
        close,
        httpServer,
        vite
    };
}
//# sourceMappingURL=node-app.js.map