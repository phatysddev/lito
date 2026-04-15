import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "[id] Detail"
  },
  render: ({ params }) => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>[id] Detail</h1>
      <p>Viewing [id] with id <strong>${params.id}</strong>.</p>
      <p><a href="/products/[id]/${params.id}/edit">Edit this [id]</a></p>
    </main>
  `
};

export default page;
