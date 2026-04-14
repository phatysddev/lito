import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

type InspectorPageData = {
  requestId: string;
  requestedAt: string;
  source: string;
  visitor: string;
  requestPath: string;
};

const page: LitoPageModule<InspectorPageData> = {
  document: {
    title: "Request Inspector"
  },
  load: ({ pathname, getLocal }) => ({
    requestId: getLocal<string>("requestId") ?? "missing",
    requestedAt: getLocal<string>("requestedAt") ?? "missing",
    source: getLocal<string>("source") ?? "unknown",
    visitor: getLocal<string>("visitor") ?? "guest",
    requestPath: getLocal<string>("requestPath") ?? pathname
  }),
  render: ({ data, headers, query }) => html`
    <main style="max-width: 980px; margin: 0 auto; padding: 32px;">
      <section style="padding: 28px; border-radius: 24px; background: white; box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);">
        <h2 style="margin: 0 0 8px;">Request Inspector</h2>
        <p style="margin: 0; color: #475569;">
          This page confirms middleware locals are available during page rendering.
        </p>
        <pre style="margin-top: 20px; padding: 18px; border-radius: 18px; background: #0f172a; color: #e2e8f0; overflow: auto;">${JSON.stringify(
          {
            locals: data,
            query: Object.fromEntries(query.entries()),
            userAgent: headers.get("user-agent")
          },
          null,
          2
        )}</pre>
      </section>
    </main>
  `
};

export default page;
