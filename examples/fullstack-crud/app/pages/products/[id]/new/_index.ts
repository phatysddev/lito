import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "Create [id]"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Create [id]</h1>
      <p>This page represents the create flow for products/[id].</p>
    </main>
  `
};

export default page;
