"use server";

import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

type ServerData = {
  generatedAt: string;
  pathname: string;
  source: string;
};

const page: LitoPageModule<ServerData> = {
  document: {
    title: "Server Data"
  },
  load: ({ pathname, query }) => ({
    generatedAt: new Date().toISOString(),
    pathname,
    source: query.get("source") ?? "server"
  }),
  render: ({ data }) => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Server Data</h1>
      <p>This page is scaffolded with the <code>server-data</code> template.</p>
      <pre style="padding: 16px; border-radius: 16px; background: #0f172a; color: #e2e8f0; overflow: auto;">${JSON.stringify(data, null, 2)}</pre>
    </main>
  `
};

export default page;
