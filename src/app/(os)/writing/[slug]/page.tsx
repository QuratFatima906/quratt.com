import { notFound } from 'next/navigation';

import { Window } from '@/components/os/window';
import { PostWindow } from '@/components/windows/post';
import { getPosts } from '@/lib/content/queries';
import { blogPosting, JsonLd } from '@/lib/seo/json-ld';
import { pageMetadata } from '@/lib/seo/site';
import { isIndexable, windowDef } from '@/lib/windows';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

async function find(slug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<'/writing/[slug]'>) {
  const { slug } = await params;
  const post = await find(slug);
  if (!post) return {};

  const meta = pageMetadata({
    title: post.title,
    description: post.blurb,
    path: `/writing/${slug}`,
    index: isIndexable('writes'),
    type: 'article',
    modified: post.updatedAt,
  });

  // A post published elsewhere first credits the original (D6); everything else is canonical
  // here, which is the whole point of hosting the long form on your own domain.
  return post.canonical ? { ...meta, alternates: { canonical: post.canonical } } : meta;
}

export default async function PostPage({ params }: PageProps<'/writing/[slug]'>) {
  const { slug } = await params;
  const post = await find(slug);
  if (!post) notFound();

  return (
    <Window def={{ ...windowDef('writes'), label: post.title, width: 760 }} main>
      <JsonLd data={blogPosting(post)} />
      <PostWindow post={post} />
    </Window>
  );
}
