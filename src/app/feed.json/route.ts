import { getPosts } from '@/lib/content/queries';
import { jsonFeed } from '@/lib/seo/feed';

/** Cached as a string: a `Response` cannot cross a `use cache` boundary. */
async function body() {
  'use cache';
  return JSON.stringify(jsonFeed(await getPosts()));
}

export async function GET() {
  return new Response(await body(), {
    headers: { 'content-type': 'application/feed+json; charset=utf-8' },
  });
}
