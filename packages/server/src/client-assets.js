import { readFileSync } from "node:fs";
export function createDevClientAssets(entry = "/src/main.ts") {
    return {
        scripts: ["/@vite/client", entry]
    };
}
export function createManifestClientAssets(options) {
    const manifest = readManifest(options.manifestPath);
    const entryKey = options.entry ?? resolveEntryKey(manifest);
    const entry = manifest[entryKey];
    if (!entry) {
        throw new Error(`Unable to find manifest entry "${entryKey}" in ${options.manifestPath}`);
    }
    const basePath = normalizeBasePath(options.basePath ?? "/");
    const scripts = new Set();
    const styles = new Set();
    collectManifestAssets({
        basePath,
        manifest,
        entryKey,
        scripts,
        styles
    });
    return {
        scripts: [...scripts],
        styles: [...styles]
    };
}
function readManifest(manifestPath) {
    const content = readFileSync(manifestPath, "utf8");
    return JSON.parse(content);
}
function resolveEntryKey(manifest) {
    const entry = Object.entries(manifest).find(([, value]) => value.isEntry);
    if (!entry) {
        throw new Error("Unable to find a Vite entry chunk in manifest.");
    }
    return entry[0];
}
function collectManifestAssets(input) {
    const entry = input.manifest[input.entryKey];
    if (!entry) {
        return;
    }
    input.scripts.add(withBasePath(input.basePath, entry.file));
    for (const style of entry.css ?? []) {
        input.styles.add(withBasePath(input.basePath, style));
    }
    for (const importKey of entry.imports ?? []) {
        collectManifestAssets({
            ...input,
            entryKey: importKey
        });
    }
}
function normalizeBasePath(basePath) {
    if (!basePath || basePath === "/") {
        return "/";
    }
    return basePath.endsWith("/") ? basePath : `${basePath}/`;
}
function withBasePath(basePath, assetPath) {
    const normalizedAssetPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
    return basePath === "/" ? `/${normalizedAssetPath}` : `${basePath}${normalizedAssetPath}`;
}
//# sourceMappingURL=client-assets.js.map