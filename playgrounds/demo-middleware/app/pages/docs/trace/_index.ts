import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

type TracePageData = {
  pageSeenAt: string;
};

const page: LitoPageModule<TracePageData> = {
  document: {
    title: "Trace Docs Route"
  },
  load: () => ({
    pageSeenAt: new Date().toISOString()
  }),
  render: ({ data, layoutData }) => html`
    <article style="padding: 26px; border-radius: 24px; background: white; box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);">
      <h2 style="margin: 0 0 10px;">Nested Layout Trace</h2>
      <p style="margin: 0; color: #475569;">
        This route shows how middleware data can be lifted into a layout and then consumed by child pages.
      </p>
      <pre style="margin-top: 20px; padding: 18px; border-radius: 18px; background: #0f172a; color: #e2e8f0; overflow: auto;">${JSON.stringify(
        {
          pageData: data,
          docsLayoutData: layoutData["docs"]
        },
        null,
        2
      )}</pre>
    </article>
  `
};

export default page;
