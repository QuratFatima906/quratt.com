# Architecture

`quratt.com` — a personal portfolio rendered as an operating system desktop.

## The central tension

The design is a desktop OS: draggable windows, a taskbar, client state. Requirement #9 asks
for the site to rank in LLM answers and be legible to AI agents. Those pull in opposite
directions — an OS UI whose windows are pure client state has no URLs, no documents, and
nothing for a crawler to read.

**Resolution: windows are routes, and content is a single payload.**

- Every window has a real URL (`/about`, `/projects/quietwatch`). Direct navigation
  server-renders semantic HTML with JSON-LD.
- The window the URL names is the **focused** window and is server-rendered.
- Windows opened by clicking inside the desktop are **background** windows, rendered
  client-side from a content payload the layout already fetched.
- Both chromes use the same presentational components. Clicking a background window's title
  bar routes to it, promoting it to server-rendered focused.

A URL is singular; an OS has many windows open. So the URL names the focused window, and
the set of open windows is client state. That is the only honest mapping.

## Rendering & data flow

```
Neon Postgres
     │  drizzle
     ▼
src/lib/content/queries.ts        'use cache' + cacheTag per collection
     │                            visitors never reach the DB — pages are
     │                            prerendered and revalidated on write
     ▼
src/app/(os)/layout.tsx           one call, all collections (a few KB total)
     │
     ├──► <Desktop content={…}>   client shell: menu bar, icons, taskbar,
     │                            window manager (drag, z-order, close)
     │
     └──► {children}              the focused window, server-rendered from the route
```

All content for every collection is small enough to fetch once. That single decision removes
per-window loading states, makes background windows instant, and makes dragging and stacking
trivial.

## Route map

| Route | Window key | Notes |
|---|---|---|
| `/` | — | desktop, no window focused |
| `/about` | `about` | `ProfilePage` + `Person` JSON-LD |
| `/projects` | `projects` | expanded grid, tag filter via `?tag=` |
| `/projects/[slug]` | `project` | `SoftwareSourceCode` |
| `/writing` | `writing` | archive |
| `/writing/[slug]` | `post` | `BlogPosting` |
| `/talks` | `talks` | `Event` + `PresentationDigitalDocument` |
| `/talks/invite` | `invite` | booking form |
| `/reads` | `reads` | `Book` + `ReadAction` |
| `/now` `/uses` `/cv` `/contact` | ditto | single-record windows |

Tag filtering is a URL search param, not client state — otherwise filtered views are
uncrawlable and unshareable.

## Directory structure

```
src/
  app/
    layout.tsx              fonts, theme provider, Person JSON-LD
    (os)/
      layout.tsx            content fetch + <Desktop> shell
      page.tsx              /
      about/page.tsx        … one directory per window
    llms.txt/route.ts       generated from the DB — cannot go stale
    llms-full.txt/route.ts
    feed.xml/route.ts
    robots.ts  sitemap.ts
  components/
    os/                     Desktop, MenuBar, Taskbar, Window, WindowManager,
                            DesktopIcons, WallpaperPicker, MobileSheet
    windows/                one component per collection — pure, presentational
    ui/                     primitives shared by both
  lib/
    content/                schema.ts (drizzle), queries.ts, seed data
    seo/                    json-ld builders, markdown serialisers
    hooks/                  useDrag, useWindowManager, useMediaQuery
  content/seed.ts           typed seed content, zod-validated
scripts/seed.ts
docs/
```

`components/windows/*` must stay free of OS concerns — they receive data and render content.
That is what lets the same component serve the focused route, a background window, and the
markdown twin.

## Design tokens

The design hardcodes every colour as inline `oklch()`. All of it moves into CSS custom
properties in `globals.css`, exposed to Tailwind 4 via `@theme`. Nothing in a component may
contain a raw colour.

Dark is the design's palette as-drawn. Light is derived by inverting lightness while holding
chroma and hue — except the accents, which must be darkened to stay legible:

| Token | Dark | Light | Why |
|---|---|---|---|
| `--accent` | `oklch(0.82 0.16 130)` | `oklch(0.52 0.15 130)` | lime on white fails 4.5:1 at L 0.82 |
| `--accent-alt` | `oklch(0.72 0.14 290)` | `oklch(0.50 0.18 290)` | same |
| `--warn` (draft) | `oklch(0.78 0.12 60)` | `oklch(0.52 0.13 60)` | |
| `--danger` | `oklch(0.62 0.16 25)` | `oklch(0.55 0.19 25)` | |

Every token pair is contrast-tested in CI, not by eye.

## Typography

- **Bricolage Grotesque** — display and body
- **JetBrains Mono** — all OS chrome, labels, metadata
- **Noto Nastaliq Urdu** — Urdu book and project titles

Self-hosted via `next/font/google`. Latin faces are preloaded; **Nastaliq is not** — it is
large, and preloading it would cost the LCP of every page for content most visitors never
see. `unicode-range` loads it only when Urdu codepoints appear.

Urdu text requires `lang="ur" dir="rtl"` on the element and roughly `line-height: 2.2` —
Nastaliq's steeply descending baseline clips at normal leading.

## Accessibility

The window manager is the hard part, so the rules are explicit:

- Windows are `<section aria-labelledby>`, not `role="dialog"` — they are non-modal, several
  are open at once, and their content is the page's primary content. The focused window is
  `<main>`.
- Dragging is never required to reach anything (WCAG 2.2 SC 2.5.7). Position is decorative.
- Focus moves into a window when it opens and returns to the opener when it closes.
- Menu bar `<header>` + `<nav aria-label="Sections">`; taskbar `<nav aria-label="Open windows">`.
- Close buttons carry `aria-label="Close about.md"` — `×` alone is not a name.
- Wallpaper picker is a `radiogroup`.
- The clock is `aria-hidden`; announcing a time that changes every 20 seconds is hostile.
- `prefers-reduced-motion` removes open/close transitions entirely.

## Performance budget

Enforced in CI; a PR that breaks a budget fails.

| Metric | Budget |
|---|---|
| LCP | < 1.2 s |
| CLS | 0 |
| INP | < 200 ms |
| JS (gzipped, route `/`) | < 100 KB |
| Lighthouse perf / a11y / SEO | ≥ 98 / 100 / 100 |

No animation library. Dragging uses Pointer Events writing to `transform` only — never
layout properties.

## AI discoverability

Ordered by measured impact, not by novelty:

1. **JSON-LD** — the strongest signal. `Person`, `ProfilePage`, `BlogPosting`,
   `SoftwareSourceCode`, `Event`, `Book`, `ItemList`.
2. **Semantic HTML and heading hierarchy** — exactly one `h1` per route.
3. **Freshness** — `dateModified` on everything, sourced from the DB's `updated_at`.
4. **Markdown twins** — `/about.md`, `/writing/[slug].md`.
5. **`/llms-full.txt`** — agents fetch it more than twice as often as `/llms.txt`.
6. **`/llms.txt`** — curated, under 5 KB, leading blockquote.
7. **`robots.txt`** — explicitly allowing GPTBot, ClaudeBot, Claude-User, OAI-SearchBot,
   PerplexityBot, Google-Extended, CCBot.

All generated from the same DB content, so they cannot drift from the site.

> 2026 data shows llms.txt alone produces no measurable citation uplift. It is cheap
> insurance, not a ranking lever. Items 1–3 are what actually move visibility.

## Admin (foundation only — not built this phase)

Deferred, but the seams exist from day one so it never needs a migration:

- `draft` and `pinned` columns on `projects`, `posts`, `talks`.
- All queries filter `draft = false` behind a single `visible()` helper — the one place an
  auth check later flips.
- `updated_at` maintained by trigger.
- Auth decided: Auth.js + GitHub OAuth, hard allowlist of one GitHub user ID.
- Writes will call `updateTag(collection)` to revalidate.

## Deployment

Vercel (Fluid Compute, Node 24), Neon Postgres via the Vercel Marketplace with a database
branch per preview deployment. `quratt.com` is registered at GoDaddy and will point at
Vercel by nameserver delegation.
