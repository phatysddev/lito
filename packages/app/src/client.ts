import { render } from "lit";
import type { LitoPageManifestEntry } from "./modules.js";
import { LITOHO_DATA_KEY } from "./hydration.js";

type TrackFn = <R>(fn: () => R) => {
  result: R;
  signals: Set<{ subscribe: (listener: (value: unknown) => void) => () => void }>;
};

export async function bootLitoClient(options: { pageManifest: LitoPageManifestEntry[] }) {
  console.info("Booting Litoho client runtime...");

  const root = document.getElementById("litoho-client-root");
  if (!root) {
    return;
  }

  const routeId = root.getAttribute("data-route-id");
  if (!routeId) {
    console.error("No data-route-id found on litoho-client-root");
    return;
  }

  const manifestEntry = options.pageManifest.find((entry) => entry.routeId === routeId);
  if (!manifestEntry) {
    console.error(`No route found for routeId: ${routeId}`);
    return;
  }

  try {
    const pageResult = (await manifestEntry.page()) as any;
    const pageModule = pageResult.default;
    const windowData = (window as any)[LITOHO_DATA_KEY] || {};
    const track = (globalThis as typeof globalThis & { __LITOHO_TRACK__?: TrackFn }).__LITOHO_TRACK__;

    const context = {
      params: {},
      routeId: manifestEntry.routeId,
      url: new URL(window.location.href),
      locals: {}
    };

    let data = windowData.pageData;
    let actionData = windowData.actionData;

    if (!data && pageModule.load) {
      data = await pageModule.load(context);
    }

    let cleanupSignalSubscriptions: Array<() => void> = [];
    let updatePending = false;

    const clearSignalSubscriptions = () => {
      for (const dispose of cleanupSignalSubscriptions) {
        dispose();
      }

      cleanupSignalSubscriptions = [];
    };

    const scheduleRender = () => {
      if (updatePending) {
        return;
      }

      updatePending = true;
      queueMicrotask(() => {
        updatePending = false;
        performRender();
      });
    };

    const performRender = () => {
      clearSignalSubscriptions();

      if (!track) {
        render(pageModule.render({ ...context, data, actionData }), root);
        return;
      }

      const { result: template, signals } = track(() => {
        return pageModule.render({ ...context, data, actionData });
      });

      for (const reactiveSource of signals) {
        cleanupSignalSubscriptions.push(
          reactiveSource.subscribe(() => {
            scheduleRender();
          })
        );
      }

      render(template, root);
    };

    performRender();
  } catch (error) {
    console.error("Failed to boot CSR page:", error);
  }
}
