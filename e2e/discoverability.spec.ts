import { expect, test } from '@playwright/test';

import { isIndexable, WINDOWS } from '../src/lib/windows';

/** Only meaningful once, so it does not need running on four browser projects. */
test.describe.configure({ mode: 'default' });

test('llms.txt stays under 5 KB and every link it advertises resolves', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);

  const body = await response.text();
  // The convention that settled around this format is a short, curated file.
  expect(Buffer.byteLength(body, 'utf8')).toBeLessThan(5 * 1024);

  const links = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]!);
  // Derived from the registry rather than a hardcoded floor, which went stale the moment a
  // window was disabled: every window that is indexable and has a URL must be advertised here,
  // and that is also what stops the resolve loop below from passing vacuously.
  const expected = WINDOWS.filter((w) => w.route !== null && isIndexable(w.key)).map((w) => w.route);
  expect(expected.length, 'no window is indexable — this test would prove nothing').toBeGreaterThan(0);
  const paths = links.map((link) => new URL(link).pathname.replace(/\.md$/, ''));
  for (const route of expected) {
    expect(paths, `${route} should be advertised in llms.txt`).toContain(route);
  }

  for (const link of links) {
    const path = new URL(link).pathname;
    expect((await request.get(path)).status(), `${path} should resolve`).toBe(200);
  }
});

test('llms-full.txt contains every document, verbatim', async ({ request }) => {
  const full = await (await request.get('/llms-full.txt')).text();

  // A stale or partial llms-full.txt is worse than none, so this pins it against the twins
  // rather than trusting that one generator feeds both.
  const links = [...(await (await request.get('/llms.txt')).text()).matchAll(/\]\((https?:\/\/[^)]+)\)/g)]
    .map((m) => new URL(m[1]!).pathname);

  for (const path of links) {
    const twin = await (await request.get(path)).text();
    // Strip the twin's own trailing source block; the concatenated file frames each doc itself.
    const doc = twin.split('\n---\n')[0]!.trim();
    expect(full, `${path} should appear in llms-full.txt`).toContain(doc);
  }
});

test('markdown twins are served as markdown, and a missing one 404s', async ({ request }) => {
  const ok = await request.get('/about.md');
  expect(ok.status()).toBe(200);
  expect(ok.headers()['content-type']).toContain('text/markdown');
  expect(await ok.text()).toContain('# Qurat ul Ain Fatima');

  expect((await request.get('/no-such-page.md')).status()).toBe(404);
});

test('markdown keeps the blank lines that make it markdown', async ({ request }) => {
  const body = await (await request.get('/about.md')).text();

  // Without a blank line a heading and the paragraph under it weld into one line, and every
  // consumer of this file is a parser that cares.
  expect(body).toMatch(/# .+\n\n/);
});

test('robots.txt names the AI crawlers explicitly', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();

  for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
    expect(body, `${agent} should be addressed by name`).toContain(agent);
  }
  expect(body).toContain('Sitemap:');
});

test('the disabled windows are absent from the sitemap and from llms.txt', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const llms = await (await request.get('/llms.txt')).text();

  // They carry `noindex` (P5); advertising them here would contradict that.
  for (const path of ['/projects', '/writing', '/talks', '/reads']) {
    expect(sitemap).not.toContain(`<loc>${path}</loc>`);
    expect(llms).not.toContain(`${path}.md`);
  }
});
