import { describe, expect, it } from 'vitest';

import { AI_CRAWLERS, LIVE_AGENTS, agentName, classify } from './agents';

// Real header values, not the bare token — every one of these arrives wrapped in a Mozilla
// preamble, and a matcher that only works on the bare name would pass here and fail in prod.
const UA = {
  chatgpt: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  claudeUser: 'Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
  claudeBot: 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  gptBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot',
  applebotExtended: 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 (Applebot-Extended/0.1)',
  applebot: 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
  googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
};

describe('classify', () => {
  it('separates a live fetch from the crawler of the same vendor', () => {
    expect(classify(UA.chatgpt)).toBe('live-agent');
    expect(classify(UA.gptBot)).toBe('ai-crawler');
    expect(classify(UA.claudeUser)).toBe('live-agent');
    expect(classify(UA.claudeBot)).toBe('ai-crawler');
  });

  // The reason AI_CRAWLERS is tested before SEARCH_CRAWLERS. `Applebot-Extended` contains
  // `Applebot`, so the naive order files Apple's AI crawler as an ordinary search engine.
  it('does not let Applebot swallow Applebot-Extended', () => {
    expect(classify(UA.applebotExtended)).toBe('ai-crawler');
    expect(classify(UA.applebot)).toBe('search-crawler');
  });

  it('leaves a browser, and anything unrecognised, to the client-side script', () => {
    expect(classify(UA.safari)).toBe('human');
    expect(classify('')).toBe('human');
    expect(classify(null)).toBe('human');
    expect(classify(undefined)).toBe('human');
  });

  it('keeps ordinary search out of the AI buckets', () => {
    expect(classify(UA.googlebot)).toBe('search-crawler');
  });

  it.each([...LIVE_AGENTS, ...AI_CRAWLERS])('recognises %s from robots.ts', (name) => {
    expect(classify(`Mozilla/5.0 (compatible; ${name}/1.0)`)).not.toBe('human');
  });
});

describe('agentName', () => {
  it('names the agent behind the bucket', () => {
    expect(agentName(UA.chatgpt)).toBe('ChatGPT-User');
    expect(agentName(UA.applebotExtended)).toBe('Applebot-Extended');
    expect(agentName(UA.safari)).toBe('unknown');
  });
});
