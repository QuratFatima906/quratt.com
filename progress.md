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
| P1 tokens & theme | not started | — | — |
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
