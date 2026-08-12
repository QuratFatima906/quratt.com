# plan.md

Build plan for `quratt.com`. Every agent reads this file for its task, and reports to
[`progress.md`](./progress.md). Read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) before
starting any task — it settles decisions you would otherwise re-litigate.

## Rules for every agent

1. **One phase, one branch, one PR.** Branch `phase/<n>-<slug>`. Never commit to `main`.
2. **Loop until every success criterion passes.** Do not report done on a partial result.
   Run the command, paste the output. `superpowers:verification-before-completion` governs
   this — evidence before assertions.
3. **`pnpm verify` must pass** (typecheck + lint + unit tests) before you open a PR.
4. **No raw colours, sizes, or fonts in components.** Everything comes from tokens (P1).
5. **Stay lazy.** `ponytail` is active: no abstraction with one caller, no config for a value
   that never changes, no dependency for what ten lines solve. Shortest diff that is correct.
6. **No mention of Claude, AI, or co-authorship** in code, comments, commits, or PRs.
7. Update `progress.md` when you start and when you finish. Append; never rewrite history.
8. **This is Next.js 16.** It differs from what you remember. Read the relevant guide in
   `node_modules/next/dist/docs/` before writing routing, caching, or metadata code — see
   `AGENTS.md`. Guessing the API from memory is the most likely way to waste a phase.

## Phase graph

```
P0 foundation
 ├─► P1 tokens & theme ──┐
 ├─► P2 content layer ───┤
 │                       ▼
 │                  P3 OS shell
 │                       ▼
 │                  P4 window content
 │                       ▼
 │                  P5 routing & SEO
 │                    ├─► P6 AI discoverability ─┐
 │                    └─► P7 perf & a11y ────────┤
 └──────────────────────────────────────────────► P8 deploy
```

**Parallel:** P1 ∥ P2 · P6 ∥ P7. Everything else is sequential.

---

## P0 — Foundation

**Goal:** a repo where a wrong commit cannot merge.
**Depends on:** nothing. **Skills:** `vercel:nextjs`, `vercel:env-vars`

- TypeScript `strict` + `noUncheckedIndexedAccess`; path alias `@/*`
- ESLint flat config + Prettier; `pnpm verify` script
- Vitest (jsdom) with one real test, not a placeholder
- Playwright: chromium + webkit, mobile viewport project
- `.github/workflows/ci.yml` — typecheck → lint → test → build → e2e → Lighthouse budgets
- `.env.example`; document every variable in `docs/ENVIRONMENT.md`
- Branch protection on `main`: CI required, no direct pushes

**Success criteria**
- [ ] `pnpm verify` exits 0
- [ ] `pnpm build` exits 0
- [ ] CI green on a throwaway PR
- [ ] A PR with a deliberate type error is blocked by CI (prove it, then revert)

---

## P1 — Design tokens & theming

**Goal:** the entire design's colour, type and spacing vocabulary, in both themes.
**Depends on:** P0. **Parallel with:** P2.
**Skills:** `frontend-design:frontend-design`, `emil-design-eng`

Extract every `oklch()` value from the two design files (`docs/design/`) into CSS custom
properties. Derive the light theme per the table in `ARCHITECTURE.md#design-tokens`.

- `globals.css`: `:root` (light), `[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`
- Tailwind 4 `@theme` mapping so `bg-surface` / `text-accent` work
- `next-themes` with `attribute="data-theme"`, no flash on first paint
- Fonts: Bricolage Grotesque, JetBrains Mono, Noto Nastaliq Urdu — Nastaliq **not** preloaded
- Urdu utility: `lang="ur" dir="rtl"`, `line-height: 2.2`
- `prefers-reduced-motion` token that disables transitions globally
- A contrast test asserting every foreground/background token pair ≥ 4.5:1 (3:1 for
  large text and UI borders), in **both** themes

**Success criteria**
- [ ] Contrast test passes for both themes — this is a unit test, not a screenshot
- [ ] Theme toggle causes no flash of wrong theme on hard reload (verify in browser)
- [ ] Urdu sample string renders in Nastaliq, correctly right-to-left, unclipped
- [ ] Nastaliq absent from network requests on a page with no Urdu content
- [ ] Zero raw `oklch(`, `#hex`, or `rgb(` outside `globals.css` — grep proves it

---

## P2 — Content layer

**Goal:** typed content in Postgres, seeded, cached, with the admin seams already cut.
**Depends on:** P0. **Parallel with:** P1.
**Skills:** `vercel:vercel-storage`, `vercel:marketplace`, `vercel:next-cache-components`

Collections and their fields are fully specified by the design's `SEED` and `SCHEMA` objects
— see `docs/design/data-model.md`. Nine collections: `about`, `contact`, `now`, `projects`,
`posts`, `talks`, `shelf`, `uses`, `cv`.

- Provision Neon through the Vercel Marketplace; branch-per-preview enabled
- Drizzle schema; `draft` + `pinned` on `projects`/`posts`/`talks`; `updated_at` trigger
- Zod schemas as the single source of truth for shape; drizzle types derived from them
- `src/content/seed.ts` — typed placeholder content lifted from the design
- `scripts/seed.ts` — idempotent upsert, safe to re-run
- `queries.ts` with `'use cache'` + `cacheTag(collection)`; a single `visible()` helper is
  the **only** place `draft` is filtered — that is the seam admin auth flips later

**Success criteria**
- [ ] `pnpm db:migrate && pnpm db:seed` succeeds from an empty database
- [ ] Running the seed twice produces no duplicates (assert row counts)
- [ ] Unit test: `visible()` hides drafts and keeps published rows
- [ ] A page reading content renders with zero DB queries at request time (prerendered)

---

## P3 — OS shell

**Goal:** the desktop itself — the hardest and most distinctive phase.
**Depends on:** P1. **Skills:** `emil-design-eng`, `apple-design`, `animation-vocabulary`,
`chrome-devtools-mcp:a11y-debugging`

- `MenuBar` — including the design's overflow measurement (`ResizeObserver` + hidden probe →
  `more (n) ▾`). Re-measure after `document.fonts.ready`.
- `DesktopIcons`, `Taskbar`, `WallpaperPicker` (3 wallpapers), clock
- `WindowManager` — open/close/focus/z-order; state in a context, not prop-drilled
- `Window` — title bar, close, drag via Pointer Events writing `transform` only
- **Mobile:** windows become full-screen sheets, swipe-to-dismiss, menu bar collapses to a
  hamburger, icons become a grid. Read `apple-design` before touching the gesture physics.
- Full a11y per `ARCHITECTURE.md#accessibility` — that section is a checklist, not prose

**Success criteria**
- [ ] Windows open, close, drag, stack, and raise on click; taskbar mirrors state exactly
- [ ] Keyboard alone can open every window, move focus into it, close it, and land focus
      back on the opener
- [ ] axe reports zero violations on the desktop with three windows open
- [ ] `prefers-reduced-motion: reduce` removes all window transitions
- [ ] Menu bar overflow is correct at 320 / 768 / 1024 / 1440 / 1920 px
- [ ] Dragging holds 60 fps in a DevTools performance trace
- [ ] Mobile sheet swipe-to-dismiss works on a real touch emulation, not just a click

---

## P4 — Window content

**Goal:** every window's contents, pixel-matched to the design.
**Depends on:** P2, P3. **Skills:** `frontend-design:frontend-design`, `emil-design-eng`

One component per window in `components/windows/`. Pure and presentational — no OS
concerns, no data fetching. They are reused by the routes, the background windows, and the
markdown twins, so any coupling here costs three times.

`about` · `projects` + expanded grid with tag filter · `writing` + archive · `talks` +
invite form · `reads` shelf · `now` · `uses` · `cv` · `contact` · `entropy.exe` toy

- Tag filter reads and writes `?tag=` — never local state
- `entropy.exe` keeps the design's seeded PRNG so it is deterministic and testable
- Urdu book and project titles render through the P1 Urdu utility

**Success criteria**
- [ ] Every window matches the design at 1280×840 — compare against `docs/design/` screenshots
- [ ] Unit tests: tag filter, draft exclusion, PRNG determinism for a fixed seed
- [ ] All ten windows pass axe, in both themes
- [ ] No window component imports from `components/os/`

---

## P5 — Routing & SEO

**Goal:** every window addressable, shareable, and crawlable.
**Depends on:** P3, P4. **Skills:** `vercel:nextjs`, `vercel:next-cache-components`

- The route map in `ARCHITECTURE.md#route-map`, exactly
- Focused window server-renders from the route; background windows render client-side from
  the layout's payload
- `generateMetadata` per route: title, description, canonical, OG, Twitter
- JSON-LD builders in `lib/seo/` — `Person`, `ProfilePage`, `BlogPosting`,
  `SoftwareSourceCode`, `Event`, `Book`, `ItemList`
- `sitemap.ts` with real `lastModified` from `updated_at`; `feed.xml` + `feed.json`
- OG images via `next/og`

**Success criteria**
- [ ] Every route returns 200 with JS disabled and renders readable content
- [ ] Exactly one `h1` per route — assert across all routes in a test
- [ ] Every JSON-LD block validates against schema.org
- [ ] Deep link to `/projects?tag=systems` restores the filtered view server-side
- [ ] Browser back/forward moves window focus correctly, with no full reload

---

## P6 — AI discoverability

**Goal:** the site is legible to agents and cited by models.
**Depends on:** P5. **Parallel with:** P7.

- `/llms.txt` — curated, < 5 KB, leading blockquote, generated from the DB
- `/llms-full.txt` — full markdown of every page, `---` separated
- Markdown twins: `/about.md`, `/writing/[slug].md`, etc.
- `robots.ts` allowing GPTBot, ClaudeBot, Claude-User, OAI-SearchBot, PerplexityBot,
  Google-Extended, CCBot
- `dateModified` surfaced in both JSON-LD and the markdown twins

**Success criteria**
- [ ] `/llms.txt` is under 5 KB and every link in it resolves 200
- [ ] `/llms-full.txt` content matches the rendered pages — a test diffs them, so they
      cannot drift
- [ ] Adding a project to the DB changes all generated files with no code edit
- [ ] `robots.txt` allows each named agent — asserted per user-agent

---

## P7 — Performance & accessibility hardening

**Goal:** hit the budgets, on real hardware, with evidence.
**Depends on:** P5. **Parallel with:** P6.
**Skills:** `chrome-devtools-mcp:debug-optimize-lcp`, `chrome-devtools-mcp:a11y-debugging`,
`claude-in-chrome`, agent `vercel:performance-optimizer`

Loop: measure → fix → re-measure. Do not stop at the first passing run.

- Lighthouse CI wired into the pipeline with the budgets from `ARCHITECTURE.md`
- Bundle analysis; justify every dependency that survives
- axe sweep across all routes × both themes × mobile and desktop
- Manual keyboard pass and a screen-reader pass on the window manager

**Success criteria**
- [ ] LCP < 1.2 s, CLS 0, INP < 200 ms on a mobile-throttled trace
- [ ] Route `/` ships < 100 KB gzipped JS
- [ ] Lighthouse ≥ 98 perf, 100 a11y, 100 SEO, 100 best-practices
- [ ] Zero axe violations across every route, both themes, both viewports
- [ ] No layout shift when fonts swap in — proven by a trace, not by looking

---

## P8 — Deploy

**Goal:** live on `quratt.com`.
**Depends on:** all. **Skills:** `vercel:deployments-cicd`, `vercel:vercel-cli`

- Vercel project linked; preview per PR, production on `main`
- Neon production database + preview branching
- GoDaddy → Vercel by nameserver delegation; HTTPS; `www` → apex redirect
- Vercel Analytics + Speed Insights
- `docs/RUNBOOK.md`: deploy, roll back, rotate a secret, restore the DB

**Success criteria**
- [ ] `https://quratt.com` and `https://www.quratt.com` both serve, `www` redirects
- [ ] A PR produces a working preview URL with its own database branch
- [ ] Production Lighthouse still meets the P7 budgets
- [ ] A rollback is performed once, successfully, and written up in the runbook

---

## P9 — Admin (deferred — not built)

Out of scope this cycle. P2 leaves the seams: `draft`/`pinned` columns, the `visible()`
helper, `updated_at`. When it lands: Auth.js + GitHub OAuth with a one-ID allowlist, an
`/admin` route, the design's editor window (row reorder, flag toggles, add/delete), and
`updateTag(collection)` on write.

Do not build any of this now. Do not add auth dependencies now.
