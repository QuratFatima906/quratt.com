# Environment

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node | 22 | matches CI and Vercel |
| pnpm | 10 | `corepack enable` |
| Vercel CLI | latest | `npm i -g vercel` — needed from P2 onward for `vercel env pull` |

## Setup

```bash
pnpm install
cp .env.example .env.local     # then fill it in
pnpm dev
```

From P2 onward, once the Vercel project is linked, `vercel env pull .env.local` replaces
hand-editing.

## Variables

### `DATABASE_URL` — required from P2

Neon pooled connection string, provisioned through the Vercel Marketplace. Use the
**pooled** endpoint (`-pooler` in the host); the direct endpoint exhausts connections under
serverless concurrency.

Each preview deployment gets its own Neon database branch, so a preview can never write to
production data.

### `NEXT_PUBLIC_SITE_URL` — required

Absolute origin, no trailing slash. Feeds `metadataBase`, canonical URLs, OG image paths,
`sitemap.xml`, the feeds, and the generated `llms.txt`.

Getting this wrong is quiet and expensive: the site keeps working while every canonical
URL, feed entry and structured-data reference points somewhere wrong. Set it per
environment — `http://localhost:3000` locally, the deployment URL in preview,
`https://quratt.com` in production.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | dev server |
| `pnpm verify` | typecheck, lint, unit tests — the gate before any PR |
| `pnpm test:watch` | unit tests in watch mode |
| `pnpm test:e2e` | Playwright; builds and serves automatically |
| `pnpm build` | production build |
| `pnpm db:generate` | generate a migration from schema changes |
| `pnpm db:migrate` | apply migrations |
| `pnpm db:seed` | seed content, idempotent |
| `pnpm db:studio` | browse the database |

`pnpm typecheck` runs `next typegen` first. Next 16 generates the route types
(`LayoutProps`, `PageProps`) that layouts and pages depend on, and `tsc` fails without them.

## Secrets

Nothing secret is committed. `.env*` is gitignored except `.env.example`, which holds keys
with empty values only. Production secrets live in Vercel's environment settings.
