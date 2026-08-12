# progress.md

Append-only log. Every agent writes an entry when it starts a phase and when it finishes.
Never edit or delete someone else's entry — if you were wrong, add a correction below it.

## Format

```
### P<n> — <phase name>
**Agent:** <name> · **Branch:** phase/<n>-<slug> · **PR:** #<n> · **Status:** in progress | blocked | done

**Started:** <date>
**Finished:** <date>

**Done**
- what actually shipped

**Success criteria**
- [x] criterion — the command you ran, and its result
- [ ] criterion — why it does not pass yet

**Deviations from plan.md**
- what you changed and why. If the plan was wrong, say so here and fix plan.md in your PR.

**Blocked on**
- anything needing a human, or another phase

**Notes for later phases**
- decisions, gotchas, seams you left
```

State the evidence, not the intention. "`pnpm verify` exits 0" is a claim; the pasted output
is the proof. A criterion with no evidence counts as unmet.

---

## Status board

| Phase | Status | Branch | PR |
|---|---|---|---|
| P0 foundation | blocked — needs remote | main | — |
| P1 tokens & theme | done — local commit, no remote | phase/1-tokens-theme | — |
| P2 content layer | not started | — | — |
| P3 OS shell | not started | — | — |
| P4 window content | not started | — | — |
| P5 routing & SEO | not started | — | — |
| P6 AI discoverability | not started | — | — |
| P7 perf & a11y | not started | — | — |
| P8 deploy | not started | — | — |
| P9 admin | deferred | — | — |

---

## Log

### P-init — project setup
**Agent:** main · **Branch:** main · **Status:** done

**Done**
- Imported both design files from Claude Design into `docs/design/`
- Scaffolded Next.js 16.3 / React 19.2 / Tailwind 4 / TypeScript with pnpm
- Wrote `docs/ARCHITECTURE.md`, `plan.md`, `progress.md`, `docs/QUESTIONS.md`
- Installed dependencies: drizzle, Neon serverless, zod, next-themes, vitest, playwright, axe

**Decisions locked** (see ARCHITECTURE.md for reasoning)
- Content in Neon Postgres, not repo files — avoids a migration when admin lands
- Admin auth will be Auth.js + GitHub OAuth, single-ID allowlist — not built this cycle
- Mobile keeps the OS metaphor; windows become full-screen sheets
- Verification is a lean gate: typecheck, lint, unit, Playwright smoke, axe, Lighthouse
- URL names the focused window; the set of open windows is client state

**Notes for later phases**
- The design is dark-only. Light is derived, and the accents must be darkened or they fail
  contrast — the table is in ARCHITECTURE.md.
- The design's `SEED` and `SCHEMA` objects are the content model. Do not reinvent them.
- Vercel CLI is not installed. P8 needs `npm i -g vercel`.

### P0 — Foundation
**Agent:** main · **Branch:** main · **PR:** — · **Status:** blocked

**Started / finished:** 2026-08-12

**Done**
- TypeScript tightened: `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, target ES2022
- Vitest (jsdom) + Playwright (chromium, webkit, iPhone 14) + axe wired up
- `.github/workflows/ci.yml`: verify / build / e2e+axe / Lighthouse, with the browser cache
  keyed on the resolved Playwright version
- `lighthouserc.json` carrying the budgets from ARCHITECTURE.md
- `.env.example` + `docs/ENVIRONMENT.md`
- Template assets and the default landing page removed; minimal placeholder in their place

**Success criteria**
- [x] `pnpm verify` exits 0 — typecheck, lint clean, 12 tests pass
- [x] `pnpm build` exits 0 — 4 static routes generated
- [x] Playwright + axe pass — 3/3 on desktop-chromium
- [ ] CI green on a throwaway PR — **needs the GitHub remote to exist**
- [ ] A deliberate type error is blocked by CI — same blocker

**Deviations from plan.md**
- `pnpm typecheck` now runs `next typegen` first. Next 16 generates `LayoutProps`/`PageProps`
  into `.next/types`, and `tsc` fails on a clean checkout without them. Not optional.
- Built `src/lib/color.ts` (OKLCH → sRGB → WCAG contrast) during P0 rather than P1. P0 asked
  for a real test and there was no real logic yet; inventing a throwaway unit to justify a
  test is worse than borrowing the one piece P1 genuinely needs. It also gave the light-theme
  contrast claim in ARCHITECTURE.md an actual proof instead of an assertion.

**Blocked on**
- No GitHub remote. Everything about PRs, branch protection, and CI verification depends on
  it, and creating a repository under someone's account is their call, not mine.

**Notes for later phases**
- ESLint ignores `.remember/**` and `docs/design/**` — session scratch and imported design
  sources, neither of them ours to lint.
- `AGENTS.md` is generated and re-added by `next dev`. Commit it with your work; deleting it
  from a diff only recreates the dirty tree.
- Lighthouse budgets are live from now on. They pass trivially today because the page is
  nearly empty — expect them to bite in P4 and P7, which is the point.

### P1 — Design tokens & theming
**Agent:** p1 · **Branch:** phase/1-tokens-theme · **PR:** — · **Status:** done

**Started / finished:** 2026-08-12

**Done**
- `src/lib/tokens.ts` — the single source of truth. The design's ~110 inline `oklch()` values
  collapse into 19 semantic roles per theme (six surfaces, two border roles, four ink roles,
  seven accents). Dark is the design as-drawn; light is derived.
- `scripts/gen-tokens.ts` → `src/app/tokens.css` (`pnpm gen:tokens`). `:root` is light,
  `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])` and
  `[data-theme='dark']` are dark, so system preference, an explicit choice, and no-JS all
  land correctly. A unit test fails if the generated file drifts from `tokens.ts`.
- `globals.css` — Tailwind 4 `@theme inline` mapping (`bg-surface`, `text-accent`,
  `border-border-interactive`, `font-sans|mono|urdu`), base body/focus styles, the `.urdu`
  class, and a global `prefers-reduced-motion: reduce` rule.
- `src/lib/tokens.test.ts` — 146 assertions, both themes: every ink × surface pair at 4.5:1,
  `--on-accent` over every fill at 4.5:1, `--border-interactive` and `--focus` over every
  surface at 3:1.
- Fonts via `next/font/google`: Bricolage Grotesque + JetBrains Mono preloaded,
  Noto Nastaliq Urdu declared with `preload: false`. All three exposed as CSS variables.
- `src/components/ui/theme-toggle.tsx` (next-themes, `attribute="data-theme"`,
  `defaultTheme="system"`) and `src/components/ui/urdu.tsx` (`lang="ur" dir="rtl" .urdu`).
- `src/app/preview/page.tsx` — the token workbench: every surface, every ink, both Latin
  faces and the Urdu setting, `robots: noindex`. It is the surface the browser checks below
  were run against, and the reference P3/P4 build to.

**Success criteria**
- [x] `pnpm verify` exits 0
      ```
      Test Files  2 passed (2)
           Tests  158 passed (158)
      ===VERIFY_EXIT=0===
      ```
- [x] `pnpm build` exits 0
      ```
      Route (app)
      ┌ ○ /
      ├ ○ /_not-found
      └ ○ /preview
      ===BUILD_EXIT=0===
      ```
- [x] Contrast test passes for both themes, as a unit test — `src/lib/tokens.test.ts`,
      146 assertions, `✓ src/lib/tokens.test.ts (146 tests) 9ms`
- [x] No flash of the wrong theme on hard reload — Chrome, `localStorage.theme = 'dark'` with
      `prefers-color-scheme: light` (the flash-prone case: CSS default is light). A
      `requestAnimationFrame` probe injected before any page script recorded:
      ```
      frames: [ {t: 69.90, attr: null,   bg: lab(95.9 ...)},   ← no paint yet
                {t: 74.10, attr: "dark", bg: lab(4.36 ...)},
                {t: 81.80, attr: "dark", bg: lab(4.36 ...)} ]
      paints: [ {name: "first-paint", t: 96.00},
                {name: "first-contentful-paint", t: 96.00} ]
      ```
      `data-theme="dark"` was applied at 74.1 ms; the first paint of any kind was at 96.0 ms.
      Nothing light was ever displayed. Structurally: next-themes' synchronous script sits at
      byte 2817 of the document, after `<body>` (2086) and before `<main>` (2994), so the
      parser cannot reach any app content before it runs.
- [x] Urdu sample renders in Nastaliq, right-to-left, unclipped — verified in Chrome at
      `/preview`. 2.2 was measured rather than assumed: the same string was rendered at
      line-height 1.4 / 1.8 / 2.0 / 2.2 / 2.4 in a 340 px column. At 1.4 the second line's
      ascenders collide with the first line's descenders and the block overflows its box; at
      1.8 and 2.0 they nearly touch; 2.2 is the first value with clear separation, and 2.4
      only adds space. 2.2 confirmed.
- [x] Nastaliq absent from network requests on a page with no Urdu content — Chrome DevTools,
      fonts only:
      ```
      /            → 017d9bea37084d9b-s.p.…woff2  (41 KB, Bricolage)
                     70bc3e132a0a741e-s.p.…woff2  (40 KB, JetBrains Mono)
      /preview     → the two above, plus
                     7431e9586bb7ba3a-s.…woff2   (239 KB, Noto Nastaliq Urdu)
                     6881cf93187e1d60-s.…woff2   (20 KB, Nastaliq subset)
      ```
      The 239 KB face is fetched only by the page that renders Urdu.
- [x] Zero raw colours outside the token files
      ```
      $ grep -rnE "oklch\(|#[0-9a-fA-F]{3,8}\b|rgba?\(" src --include=*.tsx --include=*.ts \
          | grep -v "lib/color\|lib/tokens\|\.test\."
      OUTPUT:[]
      lines: 0
      ```

**Deviations from plan.md**
- **`--border` is exempt from the 3:1 UI check; `--border-interactive` carries it.** The
  design's hairline between panels is `oklch(0.34 0.018 285)` on `oklch(0.21 0.014 285)` —
  1.5:1. Forcing it to 3:1 means an L≈0.5 rule everywhere, which is a different design. WCAG
  1.4.11 covers "visual information required to identify user interface components", not
  decorative separators, and the design's chips and buttons are identified by their labels.
  So the palette carries two roles: `--border`, the design's separator, untested; and
  `--border-interactive`, tested at 3:1 against every surface, for controls whose only
  identifier is their boundary (inputs, the drag handle). Threshold unchanged — scope named.
- **Three token values moved off the design's numbers, because they failed.** The design's
  muted text `oklch(0.6 0.012 285)` is 3.7:1 on the raised surfaces — bumped to
  `oklch(0.68 0.012 285)`. Its danger red `oklch(0.68 0.13 25)` is 4.48:1 on `--surface-hover`
  — bumped to `oklch(0.7 0.13 25)`. Fixed the token, not the threshold, as instructed.
- **The light surface ladder is compressed near white, not inverted.** Strict inversion of
  the dark ladder (0.13/0.17/0.21/0.25/0.30 → 0.87/0.83/0.79/0.75/0.70) puts the accents
  below 4.5:1 immediately: `--accent` at `oklch(0.52 0.15 130)` needs a background above
  L≈0.955 to clear 4.5:1. So light runs 0.955 → 1.0 and separation comes from hairlines,
  weight and spacing rather than lightness steps — which is also what "reduce accent area"
  asks for. Accent area is reduced with it: `--surface-accent` is a pale tint rather than a
  saturated block, and the accent is mostly ink.
- **The four accent values from `ARCHITECTURE.md#design-tokens` are used exactly as written.**
  `--info` is not in that table and was derived the same way: `oklch(0.5 0.12 210)`.
- **The theme toggle's label is static.** A label naming the current theme has to be
  suppressed until mount, and `react-hooks/set-state-in-effect` (correctly) rejects the
  `useEffect(() => setMounted(true))` pattern that does it. A label that changes after
  hydration is worse for a screen reader than one that describes the action once, so it reads
  "Switch between light and dark theme" and the glyph is `◐`.
- **Added `/preview`, which is not in the route map.** Two success criteria say "verify in a
  real browser", and `/` must have no Urdu on it to prove the Nastaliq criterion. `/preview`
  is where the Urdu sample and the palette live; it is `noindex` and is the reference P3/P4
  build against. If it stops earning its keep, delete it.

**Blocked on**
- No git remote, so no PR. Committed locally on `phase/1-tokens-theme`. Same blocker as P0.

**Notes for later phases**
- **Never hand-edit `src/app/tokens.css`.** Edit `src/lib/tokens.ts` and run
  `pnpm gen:tokens`. The unit test fails if they diverge.
- Adding a token means adding it to both themes (a test asserts the key sets match) and, if
  it is ink or a fill, adding it to the arrays at the top of `tokens.test.ts`. The test only
  covers pairs it is told about — an untested pair is an unproven one.
- Light-mode headroom is thin by construction. `--accent` on `--surface-hover` is 4.59:1.
  Any new light surface darker than L 0.955 will fail, and that is the test firing correctly,
  not being fussy.
- `--surface-chrome` is the menu bar and taskbar, `--surface-raised` the window body,
  `--surface-overlay` cards inside a window, `--surface-hover` chips and hover states. That
  is the mapping the design uses; keep to it and the contrast test stays honest.
- Urdu goes through `<Urdu as="h3">`, never a bare `className="urdu"` — the class cannot set
  `lang` or `dir`.
- Reduced motion is already global. P3's window transitions need no per-component handling.
