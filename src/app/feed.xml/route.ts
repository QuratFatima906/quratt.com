import { getPosts } from '@/lib/content/queries';
import { rss } from '@/lib/seo/feed';

/** Cached as a string: a `Response` cannot cross a `use cache` boundary. */
async function body() {
  'use cache';
  return rss(await getPosts());
}

export async function GET() {
  return new Response(await body(), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
