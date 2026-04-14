export function matchRoutePath(routePath, pathname) {
    const routeSegments = normalizePath(routePath).split("/").filter(Boolean);
    const pathSegments = normalizePath(pathname).split("/").filter(Boolean);
    if (routeSegments.length !== pathSegments.length) {
        return routeSegments.length === 0 && pathSegments.length === 0
            ? { params: {}, pathname: "/" }
            : null;
    }
    const params = {};
    for (let index = 0; index < routeSegments.length; index += 1) {
        const routeSegment = routeSegments[index];
        const pathSegment = pathSegments[index];
        if (routeSegment.startsWith(":")) {
            params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
            continue;
        }
        if (routeSegment !== pathSegment) {
            return null;
        }
    }
    return {
        params,
        pathname: pathname || "/"
    };
}
export function resolveRoute(routes, pathname) {
    for (const route of routes) {
        const match = matchRoutePath(route.path, pathname);
        if (match) {
            return {
                route,
                match
            };
        }
    }
    return null;
}
function normalizePath(pathname) {
    if (!pathname || pathname === "/") {
        return "/";
    }
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
//# sourceMappingURL=routes.js.map