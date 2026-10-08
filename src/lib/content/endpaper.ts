import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import type { ShelfItem } from './schema';

/** The owner's public Endpaper profile. Its public books are read from `<profile>/shelf.json`. */
export const ENDPAPER_PROFILE = 'https://endpaper-alpha.vercel.app/@qurat';

/** Endpaper's four statuses, in the shelf's own words. */
const STATE = { reading: 'now', finished: 'done', shelf: 'soon', set_aside: 'gave up' } as const;

/** Another site's response, so it is validated rather than trusted. */
const feedSchema = z.object({
  books: z.array(
    z.object({
      title: z.string().trim().min(1),
      author: z.string(),
      status: z.enum(['reading', 'shelf', 'finished', 'set_aside']),
      verdict: z.string().nullable(),
      url: z.url(),
      updatedAt: z.coerce.date(),
    }),
  ),
});

/** A shelf row, plus where to read about it. Rows seeded by hand have no link. */
export type Book = ShelfItem & { url: string | null };

/**
 * Books change when the owner reads, not when she deploys, so this is cached by the hour rather
 * than until a write. An Endpaper outage must not take the shelf down with it: on any failure the
 * shelf simply shows the seeded rows.
 */
export async function getEndpaperBooks(): Promise<Book[]> {
  'use cache';
  cacheTag('shelf');
  cacheLife('hours');
  try {
    const res = await fetch(`${ENDPAPER_PROFILE}/shelf.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { books } = feedSchema.parse(await res.json());
    return books.map((book, i) => ({
      // Negative, so a key can never collide with a seeded row's serial id.
      id: -(i + 1),
      sortOrder: i,
      title: book.title,
      state: STATE[book.status],
      note: [book.author, book.verdict?.toLowerCase()].filter(Boolean).join(' · '),
      url: book.url,
      createdAt: book.updatedAt,
      updatedAt: book.updatedAt,
    }));
  } catch (error) {
    console.warn('Endpaper shelf unavailable, showing seeded books only:', error);
    return [];
  }
}
