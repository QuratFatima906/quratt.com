import { Window } from '@/components/os/window';
import { ShelfWindow } from '@/components/windows/reads';
import { getShelf } from '@/lib/content/queries';
import { book, itemList, JsonLd } from '@/lib/seo/json-ld';
import { pageMetadata } from '@/lib/seo/site';
import { isIndexable, windowDef } from '@/lib/windows';

/** Disabled in the UI (D13), so the route works but stays out of the index and the sitemap. */
export const metadata = pageMetadata({
  title: 'Reads',
  description: 'The shelf: what Qurat ul ain Fatima is reading, has read, and gave up on.',
  path: '/reads',
  index: isIndexable('reads'),
});

export default async function ReadsPage() {
  const books = await getShelf();

  return (
    <Window def={{ ...windowDef('reads'), width: 620 }} main>
      <JsonLd data={itemList('Reads', '/reads', books.map(book))} />
      <ShelfWindow books={books} />
    </Window>
  );
}
