import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule<{ safe: boolean }> = {
  document: {
    title: "Error Demo"
  },
  load: ({ query }) => {
    if (query.get("safe") === "1") {
      return {
        safe: true
      };
    }

    throw new Error("Intentional Litoho demo error from page load().");
  },
  render: ({ data }) => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Error Demo</h1>
      <p>The safe branch is active. Open <a href="/failure-lab">/failure-lab</a> to trigger <code>app/pages/_error.ts</code>.</p>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </main>
  `
};

export default page;
