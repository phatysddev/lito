"use client";

import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";
import { signal } from "@litoho/core";

const payload = signal("Loading...");

const loadApi = async () => {
  payload.value = "Loading...";

  try {
    const response = await fetch("/api/request-info?source=inspector&token=demo-secret");
    payload.value = JSON.stringify(await response.json(), null, 2);
  } catch (error) {
    payload.value = String(error);
  }
};

const page: LitoPageModule = {
  document: {
    title: "API Inspector"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>API Inspector</h1>
      <p>This page is scaffolded with the <code>api-inspector</code> template.</p>
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button @click=${() => void loadApi()}>Fetch /api/request-info</button>
      </div>
      <pre style="padding: 16px; border-radius: 16px; background: #0f172a; color: #e2e8f0; overflow: auto;">${payload.value}</pre>
    </main>
  `
};

void loadApi();

export default page;
