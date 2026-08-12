import { cacheLife } from 'next/cache';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { getCounts } from '@/lib/content/queries';

export default async function Home() {
  'use cache';
  // Content changes only when the owner edits it, and a write invalidates by tag — so the route
  // has no reason to expire on a timer.
  cacheLife('max');
  const counts = await getCounts();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-6">
      <h1 className="font-mono text-2xl font-bold tracking-tight">qurat.os</h1>
      <p className="text-base leading-relaxed text-text-secondary">
        Under construction. The desktop arrives in phase three.
      </p>
      <p className="font-mono text-sm text-text-secondary">
        projects/ — {counts.projects} items · all {counts.posts} posts · shelf/ — {counts.shelf}{' '}
        books
      </p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <a className="font-mono text-xs text-accent underline" href="/preview">
          tokens
        </a>
      </div>
    </main>
  );
}
