"use client";

import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";
import { memo, signal } from "@litoho/core";

const count = signal(0);
const doubled = memo(() => count.value * 2);

const page: LitoPageModule = {
  document: {
    title: "Client Counter"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Client Counter</h1>
      <p>This page is scaffolded with the <code>client-counter</code> template.</p>
      <div style="display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 20px 0;">
        <div style="padding: 16px; border-radius: 16px; background: #e2e8f0;">
          <div style="font-size: 0.8rem; color: #475569;">Count</div>
          <div style="font-size: 2rem;">${count.value}</div>
        </div>
        <div style="padding: 16px; border-radius: 16px; background: #dbeafe;">
          <div style="font-size: 0.8rem; color: #475569;">Doubled</div>
          <div style="font-size: 2rem;">${doubled.value}</div>
        </div>
      </div>
      <div style="display: flex; gap: 12px;">
        <button @click=${() => count.update((value) => value - 1)}>Decrease</button>
        <button @click=${() => count.update((value) => value + 1)}>Increase</button>
      </div>
    </main>
  `
};

export default page;
