import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "CRUD Resource Example"
  },
  render: () => html`
    <main style="max-width: 760px; margin: 0 auto; padding: 32px;">
      <h1>CRUD Resource</h1>
      <p>This example was scaffolded around <code>litoho g r products</code> and then expanded with typed APIs.</p>
      <ul>
        <li><a href="/products">Generated products list page</a></li>
        <li><a href="/products/new">Generated create page</a></li>
        <li><a href="/products/42">Generated detail page</a></li>
        <li><a href="/dashboard?source=crud-resource">SSR dashboard snapshot</a></li>
        <li><a href="/api/products">Generated collection API</a></li>
        <li><a href="/api/products/42">Generated detail API</a></li>
        <li><a href="/api/search?q=desk&page=2&tag=office&tag=wood">Typed query API</a></li>
        <li><a href="/api-lab">Client page that fetches <code>/api/request-info</code></a></li>
      </ul>
    </main>
  `
};

export default page;
