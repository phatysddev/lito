# Litoho Examples

This folder contains CLI-first example apps that exercise the current Litoho feature set.

## Included Apps

- `basic-routing`
  Covers `_index.ts`, nested folders, `_layout.ts`, dynamic params, `_not-found.ts`, `_error.ts`, and SSR data pages.
- `state-patterns`
  Covers `"use client"`, `signal()`, `memo()`, interactive Lit pages, and typed API query parsing.
- `crud-resource`
  Covers `litoho g r`, generated CRUD pages and APIs, typed search queries, and SSR dashboard pages.
- `middleware-lab`
  Covers `litoho g ms secure-api`, auth/security middleware helpers, protected API routes, request inspection, and special pages.
- `browser-app`
  Covers `litoho g ms browser-app`, nested docs pages, client pages, and browser-focused response middleware defaults.

## CLI-First Scaffolding

Most of these apps were created from the repo root with `node packages/cli/dist/index.js`, which is the local equivalent of the published `litoho` binary.

### `basic-routing`

```bash
node packages/cli/dist/index.js new examples/basic-routing
node packages/cli/dist/index.js g l docs --root examples/basic-routing
node packages/cli/dist/index.js g p docs/getting-started --root examples/basic-routing
node packages/cli/dist/index.js g p docs/reference --root examples/basic-routing
node packages/cli/dist/index.js g p blog --params slug --root examples/basic-routing
node packages/cli/dist/index.js g p server-snapshot --template server-data --root examples/basic-routing
node packages/cli/dist/index.js g nf --root examples/basic-routing
node packages/cli/dist/index.js g err --root examples/basic-routing
```

### `state-patterns`

```bash
node packages/cli/dist/index.js new examples/state-patterns
node packages/cli/dist/index.js g p counter --template client-counter --root examples/state-patterns
node packages/cli/dist/index.js g p server-data --template server-data --root examples/state-patterns
node packages/cli/dist/index.js g p catalog --params id --csr --root examples/state-patterns
node packages/cli/dist/index.js g a catalog --query q:string,page:number --root examples/state-patterns
node packages/cli/dist/index.js g nf --root examples/state-patterns
```

### `crud-resource`

```bash
node packages/cli/dist/index.js new examples/crud-resource
node packages/cli/dist/index.js g r products --root examples/crud-resource
node packages/cli/dist/index.js g a search --query q:string,page:number,tag:strings --root examples/crud-resource
node packages/cli/dist/index.js g a request-info --query source:string,token:string --root examples/crud-resource
node packages/cli/dist/index.js g p dashboard --template server-data --root examples/crud-resource
node packages/cli/dist/index.js g p api-lab --template api-inspector --root examples/crud-resource
node packages/cli/dist/index.js g nf --root examples/crud-resource
node packages/cli/dist/index.js g err --root examples/crud-resource
```

### `middleware-lab`

```bash
node packages/cli/dist/index.js new examples/middleware-lab
node packages/cli/dist/index.js g ms secure-api --force --root examples/middleware-lab
node packages/cli/dist/index.js g a request-info --query source:string,token:string --root examples/middleware-lab
node packages/cli/dist/index.js g a secure-data --root examples/middleware-lab
node packages/cli/dist/index.js g p api-lab --template api-inspector --root examples/middleware-lab
node packages/cli/dist/index.js g p counter-lab --template client-counter --root examples/middleware-lab
node packages/cli/dist/index.js g p server-snapshot --template server-data --root examples/middleware-lab
node packages/cli/dist/index.js g p failure-lab --throw-demo --root examples/middleware-lab
node packages/cli/dist/index.js g nf --root examples/middleware-lab
node packages/cli/dist/index.js g err --root examples/middleware-lab
```

### `browser-app`

```bash
node packages/cli/dist/index.js new examples/browser-app
node packages/cli/dist/index.js g ms browser-app --force --root examples/browser-app
node packages/cli/dist/index.js g l docs --root examples/browser-app
node packages/cli/dist/index.js g p docs/getting-started --root examples/browser-app
node packages/cli/dist/index.js g p docs/performance --root examples/browser-app
node packages/cli/dist/index.js g p counter --template client-counter --root examples/browser-app
node packages/cli/dist/index.js g nf --root examples/browser-app
```

## Running An Example

```bash
cd examples/state-patterns
npm install
npm run dev
```

Or from the repo root with pnpm:

```bash
pnpm --dir examples/state-patterns dev
```
