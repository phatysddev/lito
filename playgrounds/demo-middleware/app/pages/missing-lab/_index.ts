"use server";

import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "Not Found Demo"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Not Found Demo</h1>
      <p>Open a route that does not exist, such as <a href="/missing-demo-route">/missing-demo-route</a>, to exercise <code>app/pages/_not-found.ts</code>.</p>
    </main>
  `
};

export default page;
