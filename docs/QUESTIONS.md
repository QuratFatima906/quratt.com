# Open questions

Answered questions move to `docs/DECISIONS.md`. Blocking questions are marked — they stop a
phase from starting.

## Already decided

| Question | Answer |
|---|---|
| Content store | Neon Postgres + Drizzle. Visitors never hit the DB; pages are prerendered and revalidated on write, so there is no latency cost. |
| Admin auth | Auth.js + GitHub OAuth, hard allowlist of one GitHub ID. Not built this cycle. |
| Mobile | Same OS metaphor; windows become full-screen sheets. |
| Test depth | Lean gate: typecheck, lint, unit, Playwright smoke, axe, Lighthouse budgets. |
| Language | TypeScript throughout, `strict`. |
| Admin scope | Deferred. Foundation only (`draft`/`pinned` columns, `visible()` seam). |
| Blog posts | Full articles hosted here. Authored as MDX files, served from the DB. |
| Forms | `mailto:` handoff plus a copy-address fallback. No backend, no spam surface. |
| DNS | Nameserver delegation to Vercel — see D9 for the MX-record risk this carries. |
| Window scope | All ten ship. Ones without content render disabled with a "coming soon" tooltip. |

## Blocking

**Q4 — Is there real content?** *(blocks P2 seed, and the site going live)*
The design is placeholders throughout: `[city]`, `[company]`, `[title], [author]`, "24
projects", "34 posts". I can seed with the placeholders and you replace them later, but the
site cannot launch on `[company]`. Specifically needed: bio, city, timezone, current role
and employer, work history for `cv.pdf`, the real project list, the real book shelf,
`now.txt` lines, and `uses.txt`.

## Content

**Q5 — Which windows have real content today?** All ten are being built, but the ones
without content ship disabled with a "coming soon" tooltip rather than showing an empty
shell. I need to know which to mark unavailable: `talks.md`, `writes.md`, `reads.md`,
`now.txt`, `uses.txt`, `cv.pdf`. Everything not listed as ready gets disabled by default.

**Q6 — Urdu scope.** You mentioned book names in Urdu. Only the shelf, or also project names,
the bio, and post titles? This decides whether Urdu is a per-string utility or the site is
genuinely bilingual with a language switcher — very different amounts of work.

**Q7 — Social links.** Which accounts should be linked? These become `sameAs` in the `Person`
JSON-LD, which is one of the stronger entity-resolution signals for LLMs, so it is worth
being complete: GitHub, LinkedIn, X, Bluesky, Mastodon, Google Scholar, ORCID.

**Q8 — Public email address.** `say-hi.eml` displays one. Publishing it plainly invites
scraping. Show it obfuscated, put it behind a form, or accept the spam?

**Q9 — CV.** "download the real one ↓" needs a real PDF. Do you have one, and should it be a
static file or generated from the `cv` collection so it can never fall out of date?

**Q10 — Portrait.** `about.md` reserves a 100×124 slot. Photo, illustration, or drop it?

## Product

**Q11 — Default theme on first visit.** The design is dark and is clearly happier there.
Follow the OS preference (correct, expected), or open dark regardless and let the toggle
override (better first impression, mildly rude)?

**Q12 — Keep `entropy.exe`?** The random-grid toy is charming and costs almost nothing, but
it is the one window with no informational value. Keep, cut, or replace with something that
says more about you?

**Q13 — Analytics.** Vercel Analytics (zero config, counts toward the plan) or a
privacy-first alternative like Plausible (small monthly cost, no cookie banner needed
either way)?

**Q14 — Default open window.** The design opens `about.md` on load. Keep that, open nothing
and let the desktop breathe, or restore whatever the visitor had open last?

## Infrastructure

**Q15 — Vercel CLI is not installed.** P8 needs it: `npm i -g vercel`. Install it yourself,
or should the deploy phase handle everything through the dashboard and GitHub integration?

**Q16 — GitHub account.** `gh` is authenticated as `QuratFatima906`. Is that the account
that should own the repository and be allowlisted for admin later?

**Q17 — Repository visibility.** Public (good for a portfolio — the code becomes part of the
portfolio) or private?
