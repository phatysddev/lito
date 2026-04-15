import { html } from "lit";
import type { LitoLayoutModule } from "@litoho/app";

type DocsLayoutData = {
  requestId: string;
  source: string;
  isAuthenticated: boolean;
  durationMs: number | null;
};

const layout: LitoLayoutModule<DocsLayoutData> = {
  load: ({ getLocal }) => ({
    requestId: getLocal<string>("requestId") ?? "missing",
    source: getLocal<string>("source") ?? "unknown",
    isAuthenticated: Boolean(getLocal("auth.isAuthenticated")),
    durationMs: (getLocal<number>("timing.durationMs") ?? null) as number | null
  }),
  render: ({ children, data }) => html`
    <section style="max-width: 980px; margin: 0 auto; padding: 0 32px 32px;">
      <div style="padding: 22px; border-radius: 22px; background: #dbeafe; color: #0f172a;">
        <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em;">Docs Layout Middleware Snapshot</div>
        <div style="margin-top: 12px;">requestId: <strong>${data.requestId}</strong></div>
        <div style="margin-top: 6px;">source: <strong>${data.source}</strong></div>
        <div style="margin-top: 6px;">isAuthenticated: <strong>${String(data.isAuthenticated)}</strong></div>
        <div style="margin-top: 6px;">durationMs: <strong>${data.durationMs === null ? "pending" : String(data.durationMs)}</strong></div>
      </div>
      <div style="margin-top: 18px;">${children}</div>
    </section>
  `
};

export default layout;
