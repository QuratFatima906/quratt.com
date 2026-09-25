/**
 * Who is asking.
 *
 * The site is built to be read by two audiences that want different things — a person in a
 * browser, and a model fetching text. Both are invited in (`robots.ts`, `/llms.txt`, the `.md`
 * twins), so both should be countable. `@vercel/analytics` counts only the first: its script is
 * client-side JavaScript and no agent executes it, which leaves the entire agent-facing half of
 * the site unmeasured. `src/proxy.ts` closes that gap using the lists below.
 *
 * The one signal available is the `User-Agent` header, which is self-reported and trivially
 * spoofed. Verifying a crawler properly means a reverse-DNS lookup of the source IP against the
 * ranges each vendor publishes.
 * ponytail: UA string only, no reverse-DNS verification. Add it if a number here ever decides
 * something; for a portfolio's "is anything reading this?" it is noise below the signal.
 */

/**
 * An AI fetching a page *right now*, because a person asked it something.
 *
 * This is the interesting bucket: each hit is one human's question that led here, seconds ago.
 * The closest thing to a referral the agent web has.
 */
export const LIVE_AGENTS = [
  'ChatGPT-User', // OpenAI, live fetch on a user's behalf
  'Claude-User', // Anthropic, live fetch
  'Perplexity-User',
] as const;

/**
 * An AI reading the site in bulk, to train on or index — nobody is waiting on the response.
 *
 * A steady low hum is the healthy shape. It says the content is *reachable*, which is a
 * prerequisite for the bucket above, but on its own it is not interest.
 */
export const AI_CRAWLERS = [
  'GPTBot', // OpenAI, training + search
  'OAI-SearchBot', // OpenAI, search index — builds what ChatGPT-User later fetches from
  'ClaudeBot', // Anthropic, index
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended', // Gemini grounding; separate from Googlebot
  'Applebot-Extended',
  'CCBot', // Common Crawl, which many models are trained from
  'Bytespider',
  'meta-externalagent',
  'cohere-ai',
] as const;

/**
 * Ordinary search engines. Not addressed in `robots.ts` — they are covered by the `*` rule and
 * always were — but named here so their crawling does not inflate the AI numbers.
 *
 * `Applebot` is why `AI_CRAWLERS` is tested first in `classify`: `Applebot-Extended` contains
 * it, and matching the wrong way round would file Apple's AI opt-in crawler as plain search.
 */
export const SEARCH_CRAWLERS = [
  'Googlebot',
  'bingbot',
  'DuckDuckBot',
  'Applebot',
  'YandexBot',
  'Baiduspider',
] as const;

export type Visitor = 'live-agent' | 'ai-crawler' | 'search-crawler' | 'human';

const lower = (names: readonly string[]) => names.map((name) => name.toLowerCase());

const MATCHERS: readonly (readonly [Visitor, string[]])[] = [
  ['live-agent', lower(LIVE_AGENTS)],
  ['ai-crawler', lower(AI_CRAWLERS)],
  ['search-crawler', lower(SEARCH_CRAWLERS)],
];

/**
 * `human` is the fallback, not a positive identification — an unrecognised scraper lands there
 * too. That is the right way round: the client-side analytics script is the authority on human
 * traffic, and this function exists to pull the *named* agents out of the noise, not to police
 * the rest. Anything it calls `human` is simply left to the script that already counts them.
 */
export function classify(userAgent: string | null | undefined): Visitor {
  const ua = userAgent?.toLowerCase() ?? '';
  if (!ua) return 'human';

  for (const [visitor, names] of MATCHERS) {
    if (names.some((name) => ua.includes(name))) return visitor;
  }
  return 'human';
}

/** The agent's own name, for the event property — `classify` says which bucket, this says who. */
export function agentName(userAgent: string | null | undefined): string {
  const ua = userAgent?.toLowerCase() ?? '';
  const known = [...LIVE_AGENTS, ...AI_CRAWLERS, ...SEARCH_CRAWLERS];
  return known.find((name) => ua.includes(name.toLowerCase())) ?? 'unknown';
}
