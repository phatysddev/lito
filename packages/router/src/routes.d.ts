export type RouteDefinition = {
    id: string;
    path: string;
};
export type RouteMatch = {
    params: Record<string, string>;
    pathname: string;
};
export type ResolvedRoute<T extends RouteDefinition> = {
    route: T;
    match: RouteMatch;
};
export declare function matchRoutePath(routePath: string, pathname: string): RouteMatch | null;
export declare function resolveRoute<T extends RouteDefinition>(routes: T[], pathname: string): ResolvedRoute<T> | null;
