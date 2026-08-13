import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo/site';

/**
 * The desktop with nothing focused. The layout has already rendered the shell and every
 * window body, and `about.md` opens on top of it (Q14) — so this route contributes no window
 * of its own, which is exactly what "no window focused" means in the route map.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Qurat ul ain Fatima — senior software engineer',
    description:
      'The portfolio of Qurat ul ain Fatima, a senior software engineer in Lahore, rendered as a desktop. Projects, writing, résumé and contact.',
    path: '/',
  }),
  // The home page is the thing the template appends to, so it opts out of it.
  title: { absolute: 'Qurat ul ain Fatima — senior software engineer' },
};

export default function Home() {
  return null;
}
