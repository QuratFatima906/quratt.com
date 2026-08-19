import { Window } from '@/components/os/window';
import { NowWindow } from '@/components/windows/now';
import { getNow } from '@/lib/content/queries';
import { pageMetadata } from '@/lib/seo/site';
import { windowDef } from '@/lib/windows';

export const metadata = pageMetadata({
  title: 'Now',
  description: 'What Qurat ul Ain Fatima is reading, building and learning at the moment.',
  path: '/now',
});

export default async function NowPage() {
  const now = await getNow();

  return (
    <Window def={{ ...windowDef('now'), width: 340 }} main>
      <NowWindow lines={now.lines} updated={now.nowUpdated ?? 'recently'} />
    </Window>
  );
}
