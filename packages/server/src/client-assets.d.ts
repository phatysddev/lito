export type LitoClientAssets = {
    scripts: string[];
    styles?: string[];
};
export declare function createDevClientAssets(entry?: string): LitoClientAssets;
export declare function createManifestClientAssets(options: {
    manifestPath: string;
    entry?: string;
    basePath?: string;
}): LitoClientAssets;
