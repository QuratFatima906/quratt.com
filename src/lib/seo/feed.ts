import type { Post } from '@/lib/content/schema';

import { absolute, PERSON } from './site';

/**
 * The writing feed, in both formats readers actually support. Posts come from the database and
 * `updated` from the trigger-maintained `updated_at`, so a feed reader sees a post change for
 * the same reason a crawler does.
 */
export const FEED_TITLE = `${PERSON.name} — writing`;
export const FEED_DESCRIPTION =
  'Posts on databases, caches, and the bugs in between, by Qurat ul ain Fatima.';

/** The five characters XML cares about. A post title is content, not markup. */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function postUrl(post: Post): string {
  return absolute(`/writing/${post.slug}`);
}

export function rss(posts: Post[]): string {
  const updated = posts[0]?.updatedAt ?? new Date(0);
  const items = posts
    .map((post) =>
      [
        '    <item>',
        `      <title>${xmlEscape(post.title)}</title>`,
        `      <link>${xmlEscape(postUrl(post))}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(postUrl(post))}</guid>`,
        `      <description>${xmlEscape(post.blurb)}</description>`,
        `      <pubDate>${post.updatedAt.toUTCString()}</pubDate>`,
        '    </item>',
      ].join('\n'),
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(FEED_TITLE)}</title>
    <link>${xmlEscape(absolute('/writing'))}</link>
    <description>${xmlEscape(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(absolute('/feed.xml'))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

export function jsonFeed(posts: Post[]) {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: FEED_TITLE,
    home_page_url: absolute('/writing'),
    feed_url: absolute('/feed.json'),
    description: FEED_DESCRIPTION,
    language: 'en',
    authors: [{ name: PERSON.name, url: absolute('/about') }],
    items: posts.map((post) => ({
      id: postUrl(post),
      url: postUrl(post),
      title: post.title,
      summary: post.blurb,
      date_modified: post.updatedAt.toISOString(),
    })),
  };
}
