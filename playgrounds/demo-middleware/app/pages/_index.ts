import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

type HomePageData = {
  requestId: string;
  requestedAt: string;
  source: string;
  visitor: string;
  requestPath: string;
};

const page: LitoPageModule<HomePageData> = {
  document: {
    title: "Litoho Middleware Demo"
  },
  load: ({ getLocal, pathname }) => ({
    requestId: getLocal<string>("requestId") ?? "missing",
    requestedAt: getLocal<string>("requestedAt") ?? "missing",
    source: getLocal<string>("source") ?? "unknown",
    visitor: getLocal<string>("visitor") ?? "guest",
    requestPath: getLocal<string>("requestPath") ?? pathname
  }),
  render: ({ data }) => html`
    <main style="max-width: 980px; margin: 0 auto; padding: 32px;">
      <section
        style="padding: 28px; border-radius: 24px; background: white; box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);"
      >
        <h2 style="margin: 0 0 12px; font-size: 1.6rem;">App-level middleware is active</h2>
        <p style="margin: 0; color: #475569;">
          This page reads values that were attached inside <code>app/api/_middleware.ts</code>.
        </p>
        <div style="display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top: 24px;">
          ${renderFact("requestId", data.requestId)}
          ${renderFact("requestedAt", data.requestedAt)}
          ${renderFact("source", data.source)}
          ${renderFact("visitor", data.visitor)}
          ${renderFact("requestPath", data.requestPath)}
        </div>
      </section>

      <section style="margin-top: 24px; display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        ${renderCard(
          "Page middleware access",
          "Open a page that reads middleware locals during load().",
          "/request-inspector?source=page"
        )}
        ${renderCard(
          "Nested layout access",
          "Open a docs route that receives middleware data through layout load().",
          "/docs/trace?source=docs"
        )}
        ${renderCard(
          "API middleware access",
          "Call an API route that returns middleware locals plus typed query data.",
          "/api/request-info?source=api"
        )}
      </section>
    </main>
  `
};

export default page;

function renderFact(label: string, value: string) {
  return html`
    <div style="padding: 16px; border-radius: 18px; background: #e2e8f0;">
      <div style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.08em; color: #475569;">${label}</div>
      <div style="margin-top: 10px; font-size: 1rem; word-break: break-word;">${value}</div>
    </div>
  `;
}

function renderCard(title: string, description: string, href: string) {
  return html`
    <a
      href=${href}
      style="display: block; text-decoration: none; color: inherit; padding: 22px; border-radius: 22px; background: rgba(15, 23, 42, 0.95); color: white;"
    >
      <h3 style="margin: 0 0 10px;">${title}</h3>
      <p style="margin: 0; color: #cbd5e1;">${description}</p>
    </a>
  `;
}
