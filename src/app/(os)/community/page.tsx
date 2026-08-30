import { notFound } from 'next/navigation';

import { Window } from '@/components/os/window';
import { CommunityWindow } from '@/components/windows/community';
import { getCommunity } from '@/lib/content/queries';
import { pageMetadata } from '@/lib/seo/site';
import { windowDef } from '@/lib/windows';

export const metadata = pageMetadata({
  title: 'Community',
  description:
    'Chapters, workshops and judging — the community work behind Qurat ul Ain Fatima’s engineering, from Technovation to 22+ PWiC chapters.',
  path: '/community',
});

export default async function CommunityPage() {
  const { meta, roles } = await getCommunity();
  if (!meta) notFound();

  return (
    <Window def={{ ...windowDef('community'), width: 660 }} main>
      <CommunityWindow meta={meta} roles={roles} />
    </Window>
  );
}
