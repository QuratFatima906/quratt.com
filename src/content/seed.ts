/**
 * Site content. `about`, `contact`, `cv` and two shelf titles are real (docs/CONTENT.md);
 * everything still carrying a bracketed value — `[book]`, `[editor]`, the `projects/` grid —
 * is the design's placeholder, waiting on the owner. `projects/` is the largest gap: the
 * résumé is employment history only, and filling the grid with employer work would misrepresent
 * it as independent.
 *
 * The phone number on the résumé is not here and never will be (D14).
 *
 * Post bodies are not here. They are authored as MDX in `src/content/posts/<slug>.mdx` and
 * loaded by `scripts/seed.ts` (D6), which is why every post carries `body: null` below.
 */
import { seedSchema } from '@/lib/content/schema';

export const seed = seedSchema.parse({
  about: {
    name: 'Qurat ul Ain Fatima',
    role: 'senior software engineer',
    meta: 'Lahore · PKT · shipping since 2017',
    // Two fields, four paragraphs: the blank lines are content, and `about.tsx` splits on
    // them. Keeping it to bio1/bio2 keeps the design's two-tone emphasis and avoids a
    // migration on a live database for what is a copy change.
    bio1: 'I like building things that have to work in the real world.\n\nThese days, that means LLM-powered systems, evaluation, observability, and the occasional incident that starts with "it worked yesterday."',
    bio2: 'Before AI entered the picture, I was building contact-center systems, telehealth platforms, and the infrastructure around them. I tend to move comfortably between the UI, the API, and whatever production decides to throw at us.\n\nCurrently at Shopsense AI, building shoppable-media products and the systems behind them. Before that: Afiniti, integrating six communication channels into one contact-center platform, and MarkiTech, building telehealth software that had to survive hospital wifi.',
  },
  contact: {
    email: 'quratfatima581@gmail.com',
    subject: 'a job / unreasonable ideas / a cat photo',
    note: 'Open to interesting problems, good teams, and suspiciously complicated bugs.',
  },
  nowUpdated: '1 Oct 2026',
  now: [
    { line: 'reading Too Good to Be True. A rom-com, and a very welcome break from anything with a stack trace.' },
    { line: 'rewriting my portfolio. Which is the thing you are currently standing in.' },
    { line: 'learning AI automation and figuring out what is actually worth automating.' },
    { line: 'raising a tiny human. Easily the most interesting thing I have worked on.' },
    { line: "open to senior software engineer roles. Looking for interesting problems and good people." },
  ],
  projects: [
    {
      name: 'petal',
      desc: 'instagram listening for a small brand: every comment and mention, tagged for sentiment and intent, in roman urdu too',
      goal: 'see every mention and tag of the brand in one place, and answer each one in a way that helps it',
      year: '2026',
      lang: 'ts',
      tag: 'systems',
      url: null,
      repo: 'https://github.com/QuratFatima906/petal',
      video: 'petal.mp4',
      draft: false,
      pinned: true,
      body: null,
    },
    {
      name: 'endpaper',
      desc: 'a memory lane for the books that stayed with you: passages photographed, read on the device, kept offline',
      goal: 'a reading year you can look back on: private by default, public one book at a time, and still there when the signal is not',
      year: '2026',
      lang: 'ts',
      tag: 'products',
      url: 'https://endpaper-alpha.vercel.app',
      repo: 'https://github.com/QuratFatima906/endpaper',
      video: 'endpaper.mp4',
      draft: false,
      pinned: true,
      body: null,
    },
    {
      name: 'tocky',
      desc: 'a time tracker that tattles on where your day went, without goals, streaks or guilt',
      goal: 'know where your day went without having to open the app, and without anyone keeping score',
      year: '2026',
      lang: 'rn',
      tag: 'products',
      url: null,
      repo: 'https://github.com/QuratFatima906/tocky',
      video: 'tocky.mp4',
      draft: false,
      pinned: true,
      body: null,
    },
    {
      name: 'omahi',
      desc: 'a new-tab planner that shapes work, food, movement and rest around the four phases of a cycle',
      goal: 'help you plan each day around the energy your cycle actually gives you',
      year: '2026',
      lang: 'ts',
      tag: 'products',
      url: null,
      repo: 'https://github.com/QuratFatima906/omahi',
      video: 'omahi.mp4',
      draft: false,
      pinned: true,
      body: null,
    },
    {
      name: 'climb',
      desc: 'one html file for a recruiting studio, with a slogan hidden in a field of dots that only your cursor can read',
      goal: '',
      year: '2026',
      lang: 'glsl',
      tag: 'client',
      url: null,
      repo: null,
      video: 'climb.mp4',
      draft: false,
      pinned: false,
      body: null,
    },
    {
      name: 'openroles',
      desc: 'a morning email of remote roles that will actually hire from lahore, minus the quietly us-only ones',
      goal: 'stay a $0, serverless job that only ever surfaces roles worth opening',
      year: '2026',
      lang: 'py',
      tag: 'tools',
      url: null,
      repo: 'https://github.com/QuratFatima906/openroles',
      video: null,
      draft: false,
      pinned: false,
      body: null,
    },
    {
      name: 'chakori',
      desc: 'a jewellery store for a pakistani brand, planned down to cash on delivery before a line of checkout',
      goal: 'launch with 150+ pieces and the first real order delivered end to end, for under $50 a month',
      year: '2026',
      lang: 'ts',
      tag: 'client',
      url: null,
      repo: null,
      video: null,
      draft: false,
      pinned: false,
      body: null,
    },
    {
      name: 'date.js',
      desc: 'a thirty-line cli that reads a date and says it back in iso, utc or english',
      goal: '',
      year: '2026',
      lang: 'js',
      tag: 'tools',
      url: null,
      repo: 'https://github.com/QuratFatima906/date.js',
      video: null,
      draft: true,
      pinned: false,
      body: null,
    },
  ],
  posts: [
    {
      slug: 'the-bug-was-in-the-calendar-obviously',
      title: 'The bug was in the calendar, obviously',
      blurb: 'Three days, one timezone, and a leap second that was never there.',
      date: 'Jul 2026',
      mins: '8 min',
      draft: false,
      pinned: false,
      body: null,
      canonical: null,
    },
    {
      slug: 'postgres-told-me-the-truth',
      title: "Postgres told me the truth, I just didn't listen",
      blurb: 'A query plan I ignored for six months, annotated line by line.',
      date: 'May 2026',
      mins: '12 min',
      draft: false,
      pinned: false,
      body: null,
      canonical: null,
    },
    {
      slug: 'a-cache-is-a-promise-to-your-future-self',
      title: 'A cache is a promise to your future self',
      blurb: 'And future you is not a reliable person.',
      date: 'Mar 2026',
      mins: '6 min',
      draft: false,
      pinned: false,
      body: null,
      canonical: null,
    },
    {
      slug: 'in-defence-of-the-extremely-boring-queue',
      title: 'In defence of the extremely boring queue',
      blurb: 'Every exciting queue I have met was exciting for bad reasons.',
      date: 'Jan 2026',
      mins: '9 min',
      draft: false,
      pinned: false,
      body: null,
      canonical: null,
    },
    {
      slug: 'how-i-read-a-codebase-i-am-afraid-of',
      title: 'How I read a codebase I am afraid of',
      blurb: 'Start at the deploy script. It cannot lie to you.',
      date: 'Nov 2025',
      mins: '14 min',
      draft: false,
      pinned: false,
      body: null,
      canonical: null,
    },
    {
      slug: 'nobody-wants-your-abstraction-yet',
      title: 'Nobody wants your abstraction yet',
      blurb: 'Three call sites is a pattern. Two is a coincidence.',
      date: 'Sep 2025',
      mins: '7 min',
      draft: false,
      pinned: false,
      body: null,
      canonical: null,
    },
    {
      slug: 'the-one-about-schedulers',
      title: 'The one about schedulers I keep not finishing',
      blurb: 'Half-written since March. Someday.',
      date: '—',
      mins: '?',
      draft: true,
      pinned: false,
      body: null,
      canonical: null,
    },
  ],
  talks: [
    {
      title: 'Everything I know about queues, in 25 minutes',
      venue: '[conference]',
      year: '2026',
      links: 'video ↗ slides ↗',
      draft: false,
      pinned: false,
    },
    {
      title: 'Migrations: a love story with three rollbacks',
      venue: '[conference]',
      year: '2025',
      links: 'video ↗',
      draft: false,
      pinned: false,
    },
    {
      title: 'You do not need a service mesh (probably)',
      venue: '[meetup]',
      year: '2024',
      links: 'slides ↗',
      draft: false,
      pinned: false,
    },
  ],
  shelf: [
    { title: 'Too Good To Be True', state: 'now', note: 'Prajakta Koli · a rom-com' },
    { title: 'The Kite Runner', state: 'done', note: 'Khaled Hosseini · loved it' },
  ],
  uses: [
    { label: 'editor', value: 'VS Code. Tried Cursor, came back' },
    { label: 'shell', value: 'zsh with a growing collection of aliases' },
    { label: 'machine', value: 'MacBook Pro, M2 Pro, 14-inch, 2023' },
    { label: 'monitor', value: 'Samsung 49" Odyssey OLED G9. Multitasking is a myth' },
    { label: 'keyboard', value: 'Aula F75, wireless, mechanical, I like my keyboards loud' },
  ],
  communityMeta: {
    intro: `I got into tech communities the usual way:
I wanted to learn something, so I helped organize a workshop.
Then I organized more workshops. Then a chapter. Then more chapters.
At some point, I was helping people across 22+ chapters around the world do the same thing.`,
    kicker: 'So, yes, community building got slightly out of hand.',
    lesson1:
      'Software engineering taught me how to build systems. Community building taught me how to build around people. Both involve figuring out what is actually needed, getting different pieces to work together, dealing with unexpected edge cases, and discovering that "simple" was an optimistic estimate.',
    lesson2:
      "I've spent years moving between building things, teaching things, organizing people, and helping other people build things themselves. Turns out, I quite like that combination.",
  },
  // Chronological. Both views reverse it to read newest first — the cards by organisation, the
  // log role by role. The stored order stays the one true sequence; neither view is seeded.
  community: [
    {
      badge: 'Technovation',
      org: 'Technovation',
      role: 'Mentor · Head Judge',
      period: '2018 → 2019',
      note: 'top 12 / ~2,000',
      body: `Technovation is a global technology and entrepreneurship program where girls build technology to solve problems they care about. I got to see that process from two sides: helping teams along the way, and evaluating what they built.

As a mentor, I helped young teams think through their ideas and turn them into something more concrete. As a Head Judge, I helped evaluate submissions and select the top 12 teams from around 2,000 — a good reminder that judging software is much easier when you're not the one who has to debug it afterwards.`,
    },
    {
      badge: 'GDG',
      org: 'GDG Lahore',
      role: 'Creative Lead',
      period: '2019',
      note: '',
      body: "Before everything became an exercise in calendars, spreadsheets, and chapter operations, there was Google Developer Group Lahore. As Creative Lead, I worked on the community side of technology — helping shape events, experiences, and the way technical ideas were presented to people. Because sometimes the hardest part isn't building the thing. It's getting people interested enough to show up, and then making sure they don't regret it.",
    },
    {
      badge: 'WTM',
      org: 'Women Techmakers',
      role: 'Design Lead',
      period: '2019',
      note: '',
      // The design lists this in the log and gives it no card of its own. The empty body is what
      // keeps it out of the cards (see `carded`); the log prints every role either way.
      body: '',
    },
    {
      badge: 'PWiC',
      org: 'Pakistani Women in Computing (PWiC)',
      role: 'Learning Lead',
      period: '2020',
      note: 'workshops · talks · labs',
      body: 'I joined PWiC because technical communities are considerably more useful when people actually have a place to learn, ask questions, find mentors, and occasionally admit they have no idea what they are doing. I started on the learning side, organizing and running technical workshops, talks, and labs for students, aspiring engineers, and early-career professionals.',
    },
    {
      badge: 'PWiC',
      org: 'Pakistani Women in Computing (PWiC)',
      role: 'Chapter Lead · Lahore',
      period: '2020 → 2023',
      note: '',
      body: `I took on the Lahore chapter and ran the usual small list of things that somehow becomes a very large list of things: people, partnerships, events, speakers, volunteers, logistics, learning, and then more people.

The goal was simple: build a community people actually wanted to come back to. We grew through partnerships and collaborations across different areas of technology, creating spaces for people to learn, meet others in the industry, and get a little less intimidated by the whole "starting a career in tech" thing.`,
    },
    {
      badge: 'PWiC',
      org: 'Pakistani Women in Computing (PWiC)',
      role: 'Global Chapter Success Lead',
      period: '2023 → present',
      note: '22+ chapters',
      body: `I moved from building one community to helping 22+ chapters around the world build and sustain theirs. My work sits somewhere between strategy, operations, problem-solving, and occasionally being the person someone messages with: "We have a situation."

Different countries. Different communities. Same fundamental problem: how do you get good people in a room and make them want to come back? Turns out, the answer is rarely just "host more events."`,
    },
  ],
  cv: [
    {
      period: 'Aug 2024–now',
      role: 'Senior Software Engineer, Shopsense AI',
      note: 'Shoppable image widgets and an LLM-powered detection API, across 11 services in a multi-account AWS deployment.',
    },
    {
      period: 'Nov 2021–Sep 2024',
      role: 'Senior Software Engineer, Afiniti',
      note: 'Six communication channels folded into one contact-centre platform, for AVAYA, Genesys, Apple and Microsoft.',
    },
    {
      period: 'Nov 2019–Oct 2021',
      role: 'Software Engineer, MarkiTech',
      note: 'OTN-compliant telehealth audio and video, and the device integrations behind patient monitoring.',
    },
    {
      period: '2015–2017',
      role: 'MSc Computer Science, Punjab University College of IT',
      note: "Principal's list, 2017.",
    },
  ],
});
