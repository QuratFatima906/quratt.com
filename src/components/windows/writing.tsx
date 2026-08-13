import Link from 'next/link';

import type { Post } from '@/lib/content/schema';

/** 200 wpm is the usual figure for prose read on a screen, and it is what the design implies. */
const WORDS_PER_MINUTE = 200;

/**
 * Prefers the body over the stored `mins` string, which is hand-written and goes stale the
 * moment a post is edited. Falls back to `mins` for the posts that have no body yet — three
 * of the seven seeded ones — so a bodiless post still shows something rather than "0 min".
 */
export function readingTime(post: Pick<Post, 'body' | 'mins'>): string {
  if (!post.body?.trim()) return post.mins;

  const words = post.body
    // Strip fenced code and MDX/HTML tags first, or markup inflates the count.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min`;
}

/** P5 owns `/writing/[slug]`. */
const postHref = (post: Post) => `/writing/${post.slug}`;

/** The small window: the few most recent, and a way to the archive. */
export function WritingWindow({ recent, total }: { recent: Post[]; total: number }) {
  return (
    <div className="px-5 pt-[18px] pb-5">
      <h3 className="mb-[13px] font-mono text-[10.5px] tracking-[0.12em] uppercase text-text-muted">
        Recent posts
      </h3>
      <ul className="flex flex-col gap-3">
        {recent.map((post) => (
          <li key={post.id} className="flex items-baseline justify-between gap-3.5">
            <Link href={postHref(post)} className="text-[14.5px] leading-[1.35] hover:text-accent">
              {post.title}
            </Link>
            <span className="font-mono text-[10.5px] whitespace-nowrap text-text-muted">
              {post.date}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/writing"
        className="mt-4 block font-mono text-[11px] text-accent-alt hover:underline"
      >
        all {total} posts →
      </Link>
    </div>
  );
}

/** The expanded archive: date, title, blurb, read time. */
export function ArchiveWindow({ posts }: { posts: Post[] }) {
  return (
    <div className="px-[34px] pt-7 pb-[34px]">
      <ul>
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex gap-[22px] border-b border-border py-[15px] last:border-b-0"
          >
            <span className="w-[82px] flex-none pt-1 font-mono text-[10.5px] text-text-muted">
              {post.date}
            </span>
            <span className="flex-1">
              <Link
                href={postHref(post)}
                className="block text-[17px] leading-[1.3] hover:text-accent"
              >
                {post.title}
              </Link>
              <span className="mt-1 block text-[14px] leading-[1.5] text-pretty text-text-muted">
                {post.blurb}
              </span>
            </span>
            <span className="w-[52px] flex-none pt-1 text-right font-mono text-[10.5px] text-text-muted">
              {readingTime(post)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
