import { createServer as createNodeServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getRequestListener } from "@hono/node-server";
import type { IncomingMessage, Server as NodeHttpServer, ServerResponse } from "node:http";
import { createDevClientAssets, createManifestClientAssets } from "./client-assets.js";
import {
  createLitoServer,
  type LitoApiRoute,
  type LitoErrorPage,
  type LitoLoggerHooks,
  type LitoMiddleware,
  type LitoNotFoundPage,
  type LitoPageRoute
} from "./server.js";

export type LitoNodeAppOptions = {
  appName?: string;
  port?: number;
  mode?: "development" | "production";
  rootDir?: string;
  clientEntry?: string;
  hmrPort?: number;
  hmrHost?: string;
  hmrProtocol?: "ws" | "wss";
  pages?: LitoPageRoute[];
  apiRoutes?: LitoApiRoute[];
  notFoundPage?: LitoNotFoundPage;
  errorPage?: LitoErrorPage;
  middlewares?: readonly LitoMiddleware[];
  logger?: LitoLoggerHooks;
  env?: Record<string, string | undefined>;
};

type ViteDevServer = {
  middlewares: (request: IncomingMessage, response: ServerResponse, next: (error?: Error) => void) => void;
  close: () => Promise<void>;
};

export type LitoNodeApp = {
  close: () => Promise<void>;
  httpServer: NodeHttpServer;
  vite?: ViteDevServer;
};

export async function startLitoNodeApp(options: LitoNodeAppOptions = {}): Promise<LitoNodeApp> {
  const port = options.port ?? 3000;
  const mode = options.mode ?? "development";
  const isProduction = mode === "production";
  const rootDir = options.rootDir ?? process.cwd();
  const distRoot = resolve(rootDir, "dist");
  const publicRoot = resolve(rootDir, "public");
  const manifestPath = resolve(distRoot, "manifest.json");
  const envHmrPort = toOptionalNumber(process.env.LITOHO_HMR_PORT);
  const hmrPort = options.hmrPort ?? envHmrPort;
  const hmrHost = options.hmrHost ?? process.env.LITOHO_HMR_HOST;
  const hmrProtocol =
    options.hmrProtocol ?? (process.env.LITOHO_HMR_PROTOCOL === "wss" ? "wss" : process.env.LITOHO_HMR_PROTOCOL === "ws" ? "ws" : undefined);
  let vite: ViteDevServer | undefined;

  const app = createLitoServer({
    appName: options.appName,
    clientAssets: isProduction
      ? createManifestClientAssets({
          manifestPath
        })
      : createDevClientAssets(options.clientEntry),
    staticRoot: isProduction ? distRoot : undefined,
    publicRoot: existsSync(publicRoot) ? publicRoot : undefined,
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
      await new Promise<void>((resolveRequest, rejectRequest) => {
        vite!.middlewares(request, response, (error?: Error) => {
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
    vite = await createDevViteServer(rootDir, {
      appPort: port,
      hmrPort,
      hmrHost,
      hmrProtocol
    });
  }

  await new Promise<void>((resolveListen) => {
    httpServer.listen(port, resolveListen);
  });

  const close = async () => {
    await vite?.close();
    await new Promise<void>((resolveClose, rejectClose) => {
      httpServer.close((error) => {
        if (error) {
          rejectClose(error);
          return;
        }

        resolveClose();
      });
    });
  };

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
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

async function createDevViteServer(
  rootDir: string,
  options: {
    appPort: number;
    hmrPort?: number;
    hmrHost?: string;
    hmrProtocol?: "ws" | "wss";
  }
): Promise<ViteDevServer> {
  const { createServer } = await import("vite");
  const hmrPort = await resolveHmrPort(options.appPort, options.hmrPort);

  return createServer({
    appType: "custom",
    root: rootDir,
    server: {
      middlewareMode: true,
      hmr: {
        host: options.hmrHost,
        protocol: options.hmrProtocol,
        port: hmrPort,
        clientPort: hmrPort
      }
    }
  });
}

async function resolveHmrPort(appPort: number, configuredPort?: number) {
  if (configuredPort) {
    return configuredPort;
  }

  for (let candidate = appPort + 1; candidate <= appPort + 10; candidate += 1) {
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  return appPort + 1;
}

async function isPortAvailable(port: number) {
  return new Promise<boolean>((resolveAvailability) => {
    const probe = createNetServer();

    probe.once("error", () => {
      resolveAvailability(false);
    });

    probe.listen(port, () => {
      probe.close(() => {
        resolveAvailability(true);
      });
    });
  });
}

function toOptionalNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
