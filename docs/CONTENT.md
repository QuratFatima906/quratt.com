# Content

What is real, what is placeholder, and what must never be published.

## Never publish

**The phone number from the résumé (`+92 305 6298871`) does not go on this site.** Only the
email was authorised for publication. A scraped phone number cannot be taken back. If it
ever needs to appear, that is an explicit decision, not a default.

The résumé itself lives at `docs/private/` and is **not** served. `resume.pdf` in the UI links
to a file the owner publishes deliberately — see "Résumé" below.

## Identity

| Field | Value |
|---|---|
| Name | Qurat ul Ain Fatima |
| Role | Senior Software Engineer |
| Location | Lahore, Punjab, Pakistan |
| Email | quratfatima581@gmail.com |
| Experience | 8+ years |

`sameAs` for the `Person` JSON-LD — entity resolution for LLMs leans on these, so all four
belong in the graph:

- https://github.com/QuratFatima906
- https://www.linkedin.com/in/qurat-ul-ain-fatima/
- https://x.com/Ain_fatima_ch
- mailto:quratfatima581@gmail.com

## Window availability

Drives `src/lib/windows.ts`. Disabled windows still render — greyed, `aria-disabled`, with a
keyboard-reachable "coming soon" tooltip (D8).

| Window | State | Note |
|---|---|---|
| `about.md` | **live** | from the résumé |
| `resume.pdf` | **live** | renamed from `cv.pdf` — key, label and route all change |
| `say-hi.eml` | **live** | email only, never the phone number |
| `projects/` | **live** | placeholder content, see below |
| `now.txt` | **live** | placeholder |
| `uses.txt` | **live** | placeholder |
| `entropy.exe` | **live** | the toy stays |
| `writes.md` | **disabled** | no posts yet |
| `talks.md` | **disabled** | see the note below — this one is arguably wrong |
| `reads.md` | **disabled** | no shelf yet |

### The `talks.md` call is worth revisiting

Disabled at the owner's instruction, but the résumé carries real speaking and community
material: talks and workshops for students and early-career audiences, Global Chapter Success
Lead at Pakistani Women in Computing, Creative Lead at Google Developer Group, Design Lead at
Women Techmakers, and founder of the Technovation Lahore chapter.

It is not conference-talk-shaped — no video or slide links — so the design's `talks.md` layout
does not fit it as-is. But it is substantial, it is differentiating, and hiding it costs more
than an empty window would. Reopen with the owner before launch.

## Real content, from the résumé

### `about.md`
Senior full-stack engineer, 8+ years, based in Lahore. Software architecture, API development
and scalability across AWS and GCP. Technical leadership on production systems — observability
and incident response through to automated testing and CI.

Currently at **Shopsense AI** (remote). Previously **Afiniti** and **MarkiTech**.

Keep the design's voice. The placeholder bio's register — dry, specific, faintly self-
deprecating — is the target, not corporate résumé prose. Do not paste bullet points in.

### `resume.pdf` — real, four rows

| Period | Role | Note |
|---|---|---|
| Aug 2024 – now | Senior Software Engineer, Shopsense AI | Shoppable image widgets and an LLM-powered detection API, running across 11 services in a multi-account AWS deployment |
| Nov 2021 – Sep 2024 | Senior Software Engineer, Afiniti | Six communication channels into one contact-centre platform, for AVAYA, Genesys, Apple and Microsoft |
| Nov 2019 – Oct 2021 | Software Engineer, MarkiTech | OTN-compliant telehealth audio and video, and the device integrations behind patient monitoring |
| 2015 – 2017 | MSc Computer Science, Punjab University College of IT | Principal's list, 2017 |

### `uses.txt` — partly real
Technologies that are genuinely hers, from the résumé: Python, TypeScript, React, Next.js,
Node.js, Hono, FastAPI, AWS (Lambda, DynamoDB, Step Functions, CloudFront), AWS CDK, Pulumi,
GCP (Cloud Run, Vertex AI, Firestore), Playwright, PostHog, Tailwind, Radix UI, TanStack
Query, Zod, GitHub Actions, Turborepo.

But `uses.txt` in the design is about editor, shell, machine, keyboard and notes — none of
which the résumé reveals. Keep the design's placeholders for those five, and let the owner
replace them.

## Placeholder for now

`projects/`, `now.txt`, and the `uses.txt` hardware lines keep the design's placeholder
content. The owner replaces them by editing `src/content/seed.ts` and re-running
`pnpm db:seed`.

**`projects/` deserves a flag.** The résumé is entirely employment history — there are no
personal or open-source projects in it. The design's grid shows independent work with
`open ↗` links, so filling it with employer achievements would be misleading. It stays
placeholder until the owner supplies real ones. It is the centrepiece of an engineer's
portfolio, so this is the highest-value content gap on the site.

## Urdu

Book titles only (Q6). `reads.md` is the only window that will carry Urdu, and it is
currently disabled — so the Nastaliq work from P1 has no live surface yet. It is foundation,
deliberately, and it must keep working: the font is loaded lazily and a regression there is
invisible until the shelf ships.

## Portrait

`src/assets/portrait.webp`, 900×1125. Import it statically so Next derives dimensions and a
blur placeholder, and so changing the file busts its own cache. Both questions that were open
here are now settled.

**Aspect ratio.** The source is 4:5, matching the design's 100×124 slot almost exactly
(0.800 against 0.806). No crop compromise is needed — `object-fit: cover` is a rounding
error, not a decision.

**Background, recoloured.** The photograph arrived on a magenta backdrop measuring
`oklch(0.715 0.213 325)`. Against `--accent-alt` at `oklch(0.72 0.14 290)` that was the
awkward case: near-identical lightness, but 35° off in hue and 1.5× the chroma — close enough
to read as an attempt at the brand violet and far enough to look like a miss.

It now sits at `oklch(0.714 0.141 290)`, on the token.

The recolour ran in OKLCH rather than RGB, which matters twice:

- **Per-pixel lightness was left untouched**, so the backdrop's original vertical gradient
  survives — it still falls from 0.714 at top-left to 0.679 at top-right. A flat fill would
  have replaced a photographed backdrop with a printed one.
- **Pixels were selected by hue and chroma, not RGB distance.** In RGB, skin tones sit only
  ~112 units from that magenta, so a distance threshold wide enough to catch the backdrop
  would have tinted her face. By hue, the subject's colours — navy denim, olive hijab, skin —
  are all far away and provably safe. Measured result: 49.4% of pixels fully recoloured,
  0.55% feathered at edges, 50.1% untouched.

**Weight.** Delivered at 900px wide as WebP: **148 KB, down from 1.7 MB**. That is still
roughly 7× the display size, so there is headroom for larger use later. A 2.3 MB master for a
124px slot was never going to survive the P7 performance budget.

## Product settings

| Setting | Value |
|---|---|
| Default theme | **dark**, regardless of system preference; the toggle still overrides and persists |
| Default open window | `about.md` |
| Analytics | Vercel Analytics |
| Repository | public, `QuratFatima906/quratt.com` |
| Forms | `mailto:` handoff plus copy-to-clipboard (D7) |
