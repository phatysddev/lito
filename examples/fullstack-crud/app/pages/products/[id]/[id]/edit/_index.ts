import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "Edit [id]"
  },
  render: ({ params }) => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>Edit [id]</h1>
      <p>Updating [id] with id <strong>${params.id}</strong>.</p>
    </main>
  `
};

export default page;
