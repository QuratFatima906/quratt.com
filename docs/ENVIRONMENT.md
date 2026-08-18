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
pnpm db:migrate && pnpm db:seed
pnpm dev
```

From P2 onward, once the Vercel project is linked, `vercel env pull .env.local` replaces
hand-editing.

## A local Postgres

Content is prerendered at build time, so a build needs a reachable database — locally and in
CI. Neon is only a connection string away; nothing in the code is Neon-specific.

Docker is the quickest way to a throwaway instance. Port 5433 keeps it clear of a Postgres you
may already have on 5432:

```bash
docker run -d --name quratt-pg \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=quratt \
  -p 5433:5432 postgres:17-alpine

# in .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/quratt

pnpm db:migrate && pnpm db:seed
```

`docker start quratt-pg` brings it back after a reboot; `docker rm -f quratt-pg` throws it away.

With Homebrew's Postgres instead (`brew services start postgresql@17`), `createdb quratt` and
point `DATABASE_URL` at `postgresql://$USER@localhost:5432/quratt`.

To start over from empty — which is what the migration path is verified against:

```bash
docker exec quratt-pg psql -U postgres -d postgres \
  -c 'DROP DATABASE IF EXISTS quratt WITH (FORCE);' -c 'CREATE DATABASE quratt;'
pnpm db:migrate && pnpm db:seed
```

`pnpm db:seed` is an upsert on stable row ids, so it is safe to re-run; it will not duplicate
rows and it will not touch `updated_at` on rows whose content has not changed.

> Writing SQL against these tables by hand: `projects.desc` is a reserved word, so it needs
> quoting — `select "desc" from projects`. Drizzle quotes every identifier, so application code
> is unaffected.

## Variables

### `DATABASE_URL` — required from P2

Neon pooled connection string, provisioned through the Vercel Marketplace. Use the
**pooled** endpoint (`-pooler` in the host); the direct endpoint exhausts connections under
serverless concurrency.

Each preview deployment gets its own Neon database branch, so a preview can never write to
production data.

Read over the Postgres wire protocol by `pg`, not by Neon's HTTP driver — see
`src/lib/content/db.ts` for why. The same string works against a local Postgres, so there is
one code path and no local proxy.

It is needed at **build** time, because every page that reads content is prerendered. It is
not needed at request time: a running server serves prerendered content and only reaches the
database when a cache tag is invalidated.

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

## A stale local server will lie to you

`next start` renames its own process to `next-server (v16.3.0)`. So `pkill -f "next start"`
matches **nothing**, exits 0, and leaves the old server holding port 3000. The next `pnpm start`
dies with `EADDRINUSE` — easy to miss when it is backgrounded — and every measurement after that
is taken against whatever build was current whenever that server started.

It fails loudly only if the old build's chunks were deleted. Otherwise it answers 200 to
everything and reports the wrong numbers. This cost three wrong measurements in one sitting
during P8, including a Lighthouse regression chased against a build that no longer existed.

Kill by port, never by name:

```bash
lsof -ti tcp:3000 | xargs kill
```

`scripts/check-bundle.mjs` now refuses to measure a local server whose chunks are not in `.next/`,
so the bundle budget cannot be reported against a stale build. Lighthouse has no such guard —
`lighthouserc.json` starts its own server in CI, but a local `lhci autorun` will happily attach
to whatever is on the port.

## Secrets

Nothing secret is committed. `.env*` is gitignored except `.env.example`, which holds keys
with empty values only. Production secrets live in Vercel's environment settings.
