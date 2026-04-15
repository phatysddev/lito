import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "Basic Routing Example"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Basic Routing</h1>
      <p>This example focuses on pages, nested layouts, dynamic params, and special page conventions.</p>
      <ul>
        <li><a href="/docs/getting-started">Nested page with docs layout</a></li>
        <li><a href="/docs/reference">Second page under the same layout</a></li>
        <li><a href="/blog/hello-litoho">Dynamic route with <code>[slug]</code></a></li>
        <li><a href="/server-snapshot?source=basic-routing">SSR load() data page</a></li>
        <li><a href="/missing-route">Trigger <code>_not-found.ts</code></a></li>
        <li><a href="/server-snapshot?source=basic-routing">Check route-level document metadata</a></li>
      </ul>
    </main>
  `
};

export default page;
