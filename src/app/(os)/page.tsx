import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo/site';

/**
 * The desktop with nothing focused. The layout has already rendered the shell and every
 * window body, and `about.md` opens on top of it (Q14) — so this route contributes no window
 * of its own, which is exactly what "no window focused" means in the route map.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Qurat ul Ain Fatima — things I’m building, learning & figuring out',
    description:
      'A small system for keeping track of what I’m building, learning, reading, and doing when I’m not shipping software. Because apparently one résumé, one LinkedIn profile, and several scattered notes weren’t enough.',
    card: 'A small system for keeping track of what I’m building, learning, reading, and doing when I’m not shipping software.',
    path: '/',
  }),
  // The home page is the thing the template appends to, so it opts out of it.
  title: { absolute: 'Qurat ul Ain Fatima — things I’m building, learning & figuring out' },
};

export default function Home() {
  return null;
}
