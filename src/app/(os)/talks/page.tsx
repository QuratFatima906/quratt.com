import { Window } from '@/components/os/window';
import { TalksWindow } from '@/components/windows/talks';
import { getTalks } from '@/lib/content/queries';
import { event, itemList, JsonLd } from '@/lib/seo/json-ld';
import { pageMetadata } from '@/lib/seo/site';
import { isIndexable, windowDef } from '@/lib/windows';

/** Disabled in the UI (D13), so the route works but stays out of the index and the sitemap. */
export const metadata = pageMetadata({
  title: 'Talks',
  description: 'Talks and workshops by Qurat ul ain Fatima, and how to invite her to one.',
  path: '/talks',
  index: isIndexable('talks'),
});

export default async function TalksPage() {
  const talks = await getTalks();

  return (
    <Window def={{ ...windowDef('talks'), width: 560 }} main>
      <JsonLd data={itemList('Talks', '/talks', talks.map(event))} />
      <TalksWindow talks={talks} />
    </Window>
  );
}
