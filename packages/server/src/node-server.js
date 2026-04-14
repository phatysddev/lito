import { serve } from "@hono/node-server";
export function startLitoNodeServer(fetch, options = {}) {
    const port = options.port ?? 3000;
    return serve({
        fetch,
        port
    });
}
//# sourceMappingURL=node-server.js.map