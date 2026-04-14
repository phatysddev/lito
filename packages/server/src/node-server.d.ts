type StartLitoNodeServerOptions = {
    port?: number;
};
export declare function startLitoNodeServer(fetch: (request: Request) => Response | Promise<Response>, options?: StartLitoNodeServerOptions): import("@hono/node-server").ServerType;
export {};
