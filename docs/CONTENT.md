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

`src/assets/portrait.jpeg`, 800×800. Imported statically so Next derives dimensions and a
blur placeholder, and so a change to the file busts its own cache.

Two things to settle with the owner before launch:

1. **It is square; the design's slot is 100×124 portrait.** It needs an object-position that
   keeps the face centred under a 4:5 crop, not a squash.
2. **The background is saturated magenta.** Against the design's near-black desktop and its
   lime/violet accents, it is the loudest element on the page and it is not part of the
   palette. Options: leave it (it is bold, and bold is not wrong), swap in a version on a
   token-coloured background, or cut it out. Not a decision to make silently on someone's
   own photograph.

## Product settings

| Setting | Value |
|---|---|
| Default theme | **dark**, regardless of system preference; the toggle still overrides and persists |
| Default open window | `about.md` |
| Analytics | Vercel Analytics |
| Repository | public, `QuratFatima906/quratt.com` |
| Forms | `mailto:` handoff plus copy-to-clipboard (D7) |
