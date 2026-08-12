# Decisions

Settled. Reopen one only with a reason — and update this file when you do.

### D1 · Content lives in Neon Postgres, not repo files
Admin CRUD is a stated future requirement, and retrofitting a database behind a file-based
content layer is the painful path. Latency is a non-issue: pages are prerendered and
revalidated on write, so visitors never touch the database.

### D2 · Admin is deferred; the seams are cut now
`draft` and `pinned` columns, `updated_at`, and a single `visible()` helper ship in P2. No
auth dependencies are installed this cycle. When admin lands it is Auth.js + GitHub OAuth
with a hard allowlist of one GitHub ID — no password storage, no reset flow, no user table.

### D3 · Mobile keeps the OS metaphor
Windows become full-screen, swipe-to-dismiss sheets; the menu bar collapses to a hamburger;
icons become a grid. One codebase, one mental model, rather than two UIs to keep in sync.

### D4 · The URL names the focused window
A URL is singular and an OS has many windows open, so the URL identifies the focused window
and the set of open windows is client state. The focused window server-renders from its
route; background windows render client-side from the payload the layout already fetched.
This is what makes the site crawlable without giving up the desktop.

### D5 · Verification is a lean gate
Typecheck, lint, Vitest on logic, Playwright smoke on critical flows, axe, and Lighthouse
budgets. No visual regression — screenshot diffing is the flakiest thing a small project can
own, and the budgets plus axe catch the failures that matter.

### D6 · Posts are full articles, hosted here
Original long-form content on your own domain is the strongest authority signal available
for LLM ranking, so posts are not link-outs.

Authoring and storage are split: post bodies are authored as MDX files in
`src/content/posts/*.mdx` — good editing, syntax highlighting, git history — and the seed
script loads them into the `posts.body` column. The site always serves from the database, so
the future admin editor edits one system rather than two. Rendered with `next-mdx-remote`
in a server component at build time.

### D7 · Forms are `mailto:` handoffs
`say-hi.eml` and `invite-qurat.form` open the visitor's mail client prefilled. No provider,
no rate limiting, no spam surface, no stored personal data.

Known ceiling: `mailto:` is unreliable for webmail users with no protocol handler
registered. Mitigation is to also render the address as selectable text with a copy button,
so the window is never a dead end. Upgrade path if it proves annoying: a server action
behind Resend with a honeypot and rate limit.

### D8 · Every window ships; unavailable ones are visibly disabled
Rather than cutting sections without content, all ten windows are built. Those without real
content yet render disabled in the menu bar and desktop, with a "coming soon" tooltip.

This requires a **window registry** (`src/lib/windows.ts`) as the single source of truth for
key, label, icon, route, and availability — driving the menu bar, desktop icons, and taskbar
together. The disabled state must be `aria-disabled` with a keyboard-reachable tooltip; the
`title` attribute is not an accessible tooltip and must not be used.

### D9 · Nameserver delegation to Vercel
Simplest setup and best cache behaviour.

**Risk accepted:** delegation moves *all* DNS to Vercel, so any existing MX, TXT or
subdomain records on `quratt.com` stop resolving until recreated. P8 must snapshot the
current GoDaddy zone before delegating and recreate every non-Vercel record. Confirm mail on
the domain is either unused or migrated before cutting over.

### D10 · TypeScript, strict
`strict` plus `noUncheckedIndexedAccess`. No `any` without a comment justifying it.

### D11 · Dark is the default theme, not system preference
The design is dark and is clearly happier there, so a first-time visitor gets dark regardless
of their OS setting. The toggle still works and still persists.

**This corrects P1**, which shipped `defaultTheme="system"` and generated `:root` as light —
correct for a system-following site, wrong for this one. Two changes are required and neither
is cosmetic:

- `ThemeProvider` moves to `defaultTheme="dark"`.
- `scripts/gen-tokens.ts` must emit **dark on bare `:root`**, with light under
  `[data-theme='light']` and under `prefers-color-scheme: light` guarded by
  `:not([data-theme='dark'])`. Otherwise a visitor with JavaScript disabled, or anyone seeing
  the page before the theme script runs, gets a light page the site never intended to show.

The contrast tests cover both palettes either way, so this is a change of default, not of
safety.

### D12 · Résumé, not CV
The `cv` window becomes `resume`: key, label (`resume.pdf`), and route (`/resume`) all change.
No `/cv` route is kept — nothing has linked to it yet, so there is nothing to redirect.

### D13 · Three windows ship disabled
`writes.md`, `talks.md` and `reads.md` render disabled with a "coming soon" tooltip.

Consequences worth stating, because each looks like a bug later:
- The MDX pipeline from D6 still gets built, but has no live surface. It is foundation.
- Nastaliq from P1 likewise has no live surface — Urdu is book titles only, and the shelf is
  the disabled window. A regression in the lazy font load would be invisible.
- `talks.md` is disabled despite the owner having real speaking and community material. See
  `docs/CONTENT.md` — this one should be revisited before launch.

### D14 · The phone number is never published
The résumé carries a mobile number. Only the email was authorised for publication, and a
scraped phone number cannot be withdrawn. It appears in no seed data, no structured data, no
markdown twin, and no generated file.

The résumé PDF itself is not served from the repository. `resume.pdf` in the UI points at a
file the owner publishes deliberately.

### D15 · Analytics is Vercel Analytics
Zero-config, no cookie banner required. Revisit only if the free tier's retention proves too
short to be useful.
