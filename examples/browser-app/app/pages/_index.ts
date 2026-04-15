import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "Browser App Example"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Browser App</h1>
      <p>This example uses the browser-oriented middleware preset and a docs-style content structure.</p>
      <ul>
        <li><a href="/docs/getting-started">Nested docs route</a></li>
        <li><a href="/docs/performance">Second docs route under the same layout</a></li>
        <li><a href="/counter">Interactive client page</a></li>
        <li><a href="/missing-browser-route">Trigger <code>_not-found.ts</code></a></li>
      </ul>
    </main>
  `
};

export default page;
