import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "[id] List"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>[id] List</h1>
      <p>Read all products/[id] records here.</p>
      <ul>
        <li><a href="/products/[id]/new">Create new [id]</a></li>
        <li><a href="/products/[id]/1">Open [id] #1</a></li>
      </ul>
    </main>
  `
};

export default page;
