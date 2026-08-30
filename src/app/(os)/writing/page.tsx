import { Window } from '@/components/os/window';
import { ArchiveWindow } from '@/components/windows/writing';
import { getPosts } from '@/lib/content/queries';
import { blogPosting, itemList, JsonLd } from '@/lib/seo/json-ld';
import { pageMetadata } from '@/lib/seo/site';
import { isIndexable, windowDef } from '@/lib/windows';

/**
 * `writes.md` is one of the windows that ship disabled (D13), so the route works but is
 * not indexed — see `isIndexable`. The sitemap makes the same call from the same flag.
 */
export const metadata = pageMetadata({
  title: 'Writing',
  description: 'Posts by Qurat ul Ain Fatima on databases, caches, and the bugs in between.',
  path: '/writing',
  index: isIndexable('writes'),
});

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <Window def={{ ...windowDef('writes'), width: 760 }} main>
      <JsonLd data={itemList('Writing', '/writing', posts.map(blogPosting))} />
      <ArchiveWindow posts={posts} />
    </Window>
  );
}
