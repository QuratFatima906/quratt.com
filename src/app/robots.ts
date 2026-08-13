import type { MetadataRoute } from 'next';

import { absolute } from '@/lib/seo/site';

/**
 * Named explicitly rather than left to the `*` rule.
 *
 * Several of these crawlers respect a directive addressed to them and ignore the wildcard, and
 * a few site owners block them by default — so being explicit is what actually grants access.
 * The point of the whole discoverability phase is to be readable by these agents, so saying so
 * out loud costs nothing and removes a class of silent failure.
 */
const AI_AGENTS = [
  'GPTBot', // OpenAI, training + search
  'OAI-SearchBot', // OpenAI, search index
  'ChatGPT-User', // OpenAI, live fetch on a user's behalf
  'ClaudeBot', // Anthropic, index
  'Claude-User', // Anthropic, live fetch
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended', // Gemini grounding; separate from Googlebot
  'Applebot-Extended',
  'CCBot', // Common Crawl, which many models are trained from
  'Bytespider',
  'meta-externalagent',
  'cohere-ai',
];

/**
 * `/md/` is the rewrite target behind the `.md` twins. Crawling it directly would surface a
 * second URL for the same content, so the twins are reached through their `.md` path only.
 * `/og` renders images per request and has nothing to index.
 */
const DISALLOW = ['/md/', '/og', '/preview'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: absolute('/sitemap.xml'),
    host: absolute('/'),
  };
}
