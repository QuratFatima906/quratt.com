import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';

import type { Post } from '@/lib/content/schema';

import { readingTime } from './writing';

/**
 * One post — the `/writing/[slug]` view. The body is MDX loaded from the database, rendered on
 * the server (D6): authoring happens in `src/content/posts/*.mdx`, serving always happens from
 * `posts.body`, so the future editor has one system to edit rather than two.
 *
 * The element map is the whole stylesheet. A prose plugin would be a dependency for what nine
 * class strings already do, and every value here is a token.
 */
const MDX = {
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 className="mt-7 mb-2.5 text-[19px] leading-[1.25] font-bold tracking-[-0.01em]" {...props} />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 className="mt-5 mb-2 text-[15.5px] font-bold" {...props} />
  ),
  p: (props: React.ComponentProps<'p'>) => (
    <p className="my-3 text-[15.5px] leading-[1.65] text-pretty text-text-secondary" {...props} />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul className="my-3 flex list-disc flex-col gap-1.5 pl-5 text-[15.5px] leading-[1.6] text-text-secondary" {...props} />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol className="my-3 flex list-decimal flex-col gap-1.5 pl-5 text-[15.5px] leading-[1.6] text-text-secondary" {...props} />
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote className="my-4 border-l-2 border-accent pl-4 text-[15px] leading-[1.6] text-text-muted italic" {...props} />
  ),
  a: (props: React.ComponentProps<'a'>) => (
    <a className="text-accent-alt underline underline-offset-2" {...props} />
  ),
  code: (props: React.ComponentProps<'code'>) => (
    <code className="rounded bg-surface-overlay px-1 py-0.5 font-mono text-[12.5px]" {...props} />
  ),
  // Long plans and SQL are wider than the window, so the block scrolls rather than the page.
  pre: (props: React.ComponentProps<'pre'>) => (
    <pre className="my-4 overflow-x-auto rounded-md border border-border bg-surface-overlay p-3.5 font-mono text-[12px] leading-[1.6] [&_code]:bg-transparent [&_code]:p-0" {...props} />
  ),
  hr: (props: React.ComponentProps<'hr'>) => (
    <hr className="my-6 border-0 border-t border-border" {...props} />
  ),
};

export function PostWindow({ post }: { post: Post }) {
  return (
    <article className="px-[34px] pt-7 pb-[34px]">
      <p className="font-mono text-[10.5px] tracking-[0.06em] text-text-muted">
        {post.date}
        <span aria-hidden="true"> · </span>
        {readingTime(post)}
      </p>
      <p className="mt-2.5 mb-5 text-[16px] leading-[1.5] text-pretty text-text">{post.blurb}</p>
      {post.body ? (
        <MDXRemote source={post.body} components={MDX} />
      ) : (
        <p className="text-[15px] text-text-muted">This one is still a title and a promise.</p>
      )}
      <Link
        href="/writing"
        className="mt-7 inline-block font-mono text-[11px] text-accent-alt hover:underline"
      >
        <span aria-hidden="true">← </span>all posts
      </Link>
    </article>
  );
}
