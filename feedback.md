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
| 9 | `qurat` treated as a logo — spaced off the sections, and clickable | ✅ |
| 10 | Drop the seed readout from `entropy.exe` | ✅ |
| 11 | Dock icons hold their position when a window is raised | ✅ |
| 12 | Remove `close all` entirely | ✅ |
| 13 | The two primary CTAs match in height (colour reverted by #17) | ✅ |
| 14 | "a bird photo" → "a cat photo" | ✅ |
| 15 | A distinct icon per window, for the dock | ✅ |
| 16 | The copy button becomes a copy icon | ✅ |
| 17 | `send →` back to purple, without losing the matched height | ✅ |

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

## Round 1b — follow-ups from the same session

9. **Logo.** `<span>` → `next/link` to `/`, with `mr-3` on top of the row's gap and looser
   tracking. `/` is the desktop with nothing focused; open windows stay open, as they would
   on a real machine.
10. **Entropy seed.** Gone from the caption and from the button's `aria-label`. The seed is
    still state — it counts rerolls and picks the palette — it is just not content.
11. **Dock order.** It was built from `open`, which is the z-order, and raising a window
    moves its key to the end of that array. It now renders `WINDOWS.filter(open.includes)`,
    so an icon's slot is a property of the window rather than of what you touched last, and
    the dock agrees with the menu bar's order.
12. **`close all` removed** from the desktop bar and the mobile panel, and `closeAll` deleted
    from the window manager — nothing called it any more. Each window closes on its own ×.
13. **CTAs.** `send →` was `bg-accent-alt` at 12px (inherited from the mail draft's type
    scale); `download the real one ↓` was `bg-accent` at 11px. Both now pull from one `CTA`
    constant that pins colour, size *and* line-height, so neither can inherit its way out of
    the shape again. Measured identical: 34.39px tall, same background in both themes.

14. **Cat photo.** `contact.subject` in the seed, and the `/contact` page description that
    repeats it. The `birdcount` project is a different thing and was left alone.
15. **Ten window icons.** Six windows shared one generic sheet, so the dock was a row of
    identical paper. Each window now has its own mark — person, folder, pen, mic, book,
    clock, sliders, download, envelope, grid — drawn as SVG on a 24×24 grid rather than as
    borders and padding, because the same drawing has to hold at 14px in the dock and 24px
    on the desktop and a border does not scale, it just gets chunkier. The marks say what
    the window *is*; the tile around them already says "file".
16. **Copy icon.** Two overlapping squares, swapping to a check for two seconds. The `label`
    prop moved from visible text to `aria-label`, where it stays put whatever the icon is
    doing — the `role="status"` region was already doing the announcing, which is what makes
    an icon-only control safe here. 24px square, the SC 2.5.8 floor for a pointer target.

17. **Purple send.** The shared `CTA` constant is shape only now — padding, radius, size,
    line-height, the `on-accent` ink — and each call site brings its own fill: `accent-alt`
    for send, `accent` for download. The thing they must never diverge on again is height,
    and they no longer can. Measured 34.39px for both, in both themes.

### Also fixed along the way

- **`sslmode=verify-full`.** Neon's `sslmode=require` makes `pg` warn on every connection,
  and Next 16's dev overlay renders that warning as a full-screen console error.
  `verify-full` silences it and pins the stronger behaviour before pg v9 changes the default.
- **An axe flake.** `window-content.spec.ts` ran axe without waiting for the window fade to
  finish, so contrast was occasionally measured against translucent text. It failed once on
  mobile-safari and passed three times in a row on the same build — the wait that
  `os-shell.spec.ts` already had is now in both.

## Left undone, deliberately

- **No close button in the dock.** A 24px target (WCAG 2.2 SC 2.5.8) does not fit beside a
  26px icon in a 40px bar without crowding both, and a Mac's dock does not close windows
  either. Raising a window from the dock puts its own × in reach. Say the word if you want
  it back and the bar can grow to 48px.
- **The dock reorders on raise**, because it mirrors stacking order. A real dock keeps a
  fixed order. Pre-existing behaviour, not touched.
- **The icon marks are monochrome.** The old PDF badge was red and the app tile carried two
  accents; a set of ten reads better uniform, and it matches the site's one-accent language.
  Say so if you want colour back on any of them.
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
