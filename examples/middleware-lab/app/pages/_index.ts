import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "Middleware Lab Example"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Middleware Lab</h1>
      <p>This example focuses on middleware stacks, auth/security helpers, protected APIs, and special error handling.</p>
      <ul>
        <li><a href="/api-lab">Client page hitting the public request-info API</a></li>
        <li><a href="/counter-lab">Client page for state + hydration</a></li>
        <li><a href="/server-snapshot?source=middleware-lab">SSR page</a></li>
        <li><a href="/failure-lab">Error demo page</a></li>
        <li><a href="/api/request-info?source=middleware-lab&token=demo-secret">Open API route with middleware headers</a></li>
        <li><a href="/api/secure-data">Protected API route expected to return 401 without auth</a></li>
        <li><a href="/missing-middleware-route">Trigger <code>_not-found.ts</code></a></li>
      </ul>
    </main>
  `
};

export default page;
