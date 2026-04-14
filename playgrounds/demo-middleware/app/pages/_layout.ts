import { html } from "lit";
import type { LitoLayoutModule } from "@litoho/app";

const layout: LitoLayoutModule<{ appName: string }> = {
  load: () => ({
    appName: "Litoho App"
  }),
  render: ({ children, data }) => html`
    <div
      style="min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); color: #0f172a;"
    >
      <header style="max-width: 980px; margin: 0 auto; padding: 24px 32px 0;">
        <div
          style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;"
        >
          <div>
            <div style="font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: #475569;">
              ${data.appName}
            </div>
            <h1 style="margin: 8px 0 0; font-size: 2rem;">Middleware Demo</h1>
          </div>
          <nav style="display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="/" style="color: #0f172a;">Home</a>
            <a href="/request-inspector?source=page" style="color: #0f172a;">Request Inspector</a>
            <a href="/docs/trace?source=docs" style="color: #0f172a;">Docs Trace</a>
            <a href="/api/request-info?source=api" style="color: #0f172a;">API JSON</a>
          </nav>
        </div>
      </header>
      ${children}
    </div>
  `
};

export default layout;
