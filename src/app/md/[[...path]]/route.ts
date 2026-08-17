import { absolute } from '@/lib/seo/site';
import { documentFor, documents } from '@/lib/seo/markdown';

/**
 * The markdown twin of a page — `/about.md`, `/writing/some-post.md`.
 *
 * `next.config.ts` rewrites `/:path*.md` here, because a literal `[slug].md` segment is not a
 * thing Next can route and a root-level catch-all would shadow the real pages.
 *
 * Same `documents()` source as `/llms-full.txt` and the HTML pages, so a twin cannot drift
 * from the page it mirrors.
 */
export async function generateStaticParams() {
  const docs = await documents();
  return docs.map((doc) => ({ path: doc.path.replace(/^\//, '').split('/') }));
}

export async function GET(_request: Request, ctx: RouteContext<'/md/[[...path]]'>) {
  const { path } = await ctx.params;
  const doc = await documentFor(`/${(path ?? []).join('/')}`);

  if (!doc) {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const body = [
    doc.markdown,
    '',
    '---',
    '',
    `Source: ${absolute(doc.path)}`,
    `Updated: ${doc.updatedAt.toISOString().slice(0, 10)}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
