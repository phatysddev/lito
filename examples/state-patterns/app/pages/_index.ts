import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "State Patterns Example"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>State Patterns</h1>
      <p>This example shows the current client-side state model and how it coexists with server-rendered routes.</p>
      <ul>
        <li><a href="/counter">Client counter with <code>signal()</code> and <code>memo()</code></a></li>
        <li><a href="/server-data?source=state-patterns">SSR data page with <code>"use server"</code></a></li>
        <li><a href="/catalog/demo-item">Dynamic client page under <code>catalog/[id]</code></a></li>
        <li><a href="/api/catalog?q=lamp&page=2">Typed API query parsing</a></li>
        <li><a href="/missing-state-route">Trigger <code>_not-found.ts</code></a></li>
      </ul>
    </main>
  `
};

export default page;
