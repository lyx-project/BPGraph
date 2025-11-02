# BPGraph — Monorepo

Lightweight node-based visual programming toolkit for building flow editors, AI pipelines, and data-processing graphs. This repository is a monorepo that contains the core runtime library, UI integrations, and example apps.

## Repository layout

- packages/
  - packages/bpgraph-core — Core runtime, node system, and engine (detailed API in package README)
  - packages/bpgraph-react — React components and editor integrations
- examples/
  - examples/bpgraph-react — Minimal React + Vite demo
- package.json — workspace scripts and tooling

> Keep package-level README files for API details and examples. The root README should remain a concise project overview and entry point.

## Quick start

Install dependencies and build the workspace:

```bash
# using pnpm (recommended)
pnpm install
pnpm run build
```

Run the React example:

```bash
cd examples/bpgraph-react
pnpm install
pnpm run dev
```

## License

MIT