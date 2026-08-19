# Feedback round 1 — 2026-08-19

Owner feedback on the shipped OS shell. Branch: `feedback/round-1`.

| # | Item | Status |
|---|------|--------|
| 1 | All type in JetBrains Mono (Nastaliq stays for Urdu) | ✅ |
| 2 | `qurat.os` → `qurat` everywhere | ✅ |
| 3 | Menu-bar clock in 12-hour format with am/pm | ✅ |
| 4 | Résumé window gets a working download button | ✅ |
| 5 | Every window opens centred, stacked on top of each other | ✅ |
| 6 | Taskbar becomes an icons-only dock — no "open" label, no counter | ✅ |
| 7 | `now.txt` content rewritten | ✅ |
| 8 | `uses.txt` content rewritten | ✅ |

## Decisions taken with the owner

- **Font:** JetBrains Mono everywhere. Bricolage Grotesque is dropped entirely — one less
  font family to fetch. Noto Nastaliq stays, because no monospaced Urdu face exists.
- **Dock:** icons only, name on hover.
- **Résumé PDF:** shipped as-is, phone number included. This reverses D14 in
  `docs/CONTENT.md` — the owner authorised publication on 2026-08-19.

## What each item actually touched

1. **Mono everywhere.** `--font-sans` deleted from `globals.css`; `body` points at
   `--font-mono`; `Bricolage_Grotesque` removed from `layout.tsx`. Because `@theme inline`
   resolves the `font-*` utilities to `var(--token)` at use time, no component needed
   changing. A monospaced line runs ~18% wider, so the prose steps were scaled down
   (15.5px → 13px and friends) and `now`, `uses` and `resume` were widened.
2. **Name.** `menu-bar.tsx`, `desktop.tsx` (the `sr-only` h1), `og/route.tsx`, `SITE_NAME`
   in `lib/seo/site.ts`, and the route-map assertion in `e2e/routes.spec.ts`.
3. **Clock.** `Intl.DateTimeFormat('en-US', { hour12: true })`, lower-cased. The slot is
   `9ch` and `whitespace-nowrap`: the bar charges letter-spacing per character, so the
   eight characters of "11:03 am" wrapped at `8ch` on a phone.
4. **Résumé.** PDF moved from `src/assets/` (not served) to `public/`. The `downloadHref`
   prop is gone — there is always a file now, so the "only render it if it exists" guard
   was dead weight and two call sites had to thread it.
5. **Centring.** `left/top: 50%` inline, `transform: translate(-50%, -50%)` in a `md:`
   media query. It has to be `transform` and not the `translate` property, because the
   drag handler owns `translate` — the two are separate CSS properties that compose. It
   has to be a rule and not an inline style, because the `max-md:` sheet utilities could
   never beat an inline transform. `x`/`y` are gone from the window registry.
6. **Dock.** The glyph shapes moved out of `desktop-icons.tsx` into `os/glyph.tsx` so the
   dock and the desktop draw the same window; `folder` and `mail` variants were added,
   which the desktop never needed. Each entry takes the window name as its `aria-label`
   and shows it as a CSS-only tooltip on hover or focus.
7. **`now.txt`.** Lines are a flex row now, so a wrapped line hangs under itself rather
   than running back under the arrow.
8. **`uses.txt`.** Term column pinned to `9ch`, which in a monospaced face is exactly nine
   characters — the separators line up into a column, which is the point of a text file.

## Left undone, deliberately

- **No close button in the dock.** A 24px target (WCAG 2.2 SC 2.5.8) does not fit beside a
  26px icon in a 40px bar without crowding both, and a Mac's dock does not close windows
  either. Raising a window from the dock puts its own × in reach. Say the word if you want
  it back and the bar can grow to 48px.
- **The dock reorders on raise**, because it mirrors stacking order. A real dock keeps a
  fixed order. Pre-existing behaviour, not touched.
- **The redundant `font-mono` classes** scattered through the window components now resolve
  to the family they would inherit anyway. Harmless; not worth the diff to remove.

## Notes

- Content for `now` and `uses` lives in Postgres, seeded from `src/content/seed.ts`.
  Editing the seed is only half the job: **`pnpm db:seed` has to run against production**
  before either window shows the new copy. Done locally; production is outstanding.
- `nowUpdated` is a hand-written string, not a derived timestamp. It says `19 Aug 2026` and
  will keep saying that until someone edits it.

## Verification

- `pnpm verify` (typecheck, lint, 223 unit tests) — green.
- `pnpm test:e2e` — 260 passed, 28 skipped, zero axe violations across every window and
  every route, in both themes.
- The PDF serves `200 application/pdf` from `/Qurat_ul_Ain_Fatima_Resume_Senior_Software_Engineer.pdf`.

## Log

- 2026-08-19 — file created, work started on `phase/8-deploy` by mistake, moved to
  `feedback/round-1` before anything was committed.
- 2026-08-19 — all eight items landed; suite green.
