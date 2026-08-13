import { Window } from '@/components/os/window';
import { UsesWindow } from '@/components/windows/uses';
import { getUses } from '@/lib/content/queries';
import { pageMetadata } from '@/lib/seo/site';
import { windowDef } from '@/lib/windows';

export const metadata = pageMetadata({
  title: 'Uses',
  description: 'The editor, shell, machine and stack Qurat ul ain Fatima actually works in.',
  path: '/uses',
});

export default async function UsesPage() {
  const rows = await getUses();

  return (
    <Window def={{ ...windowDef('uses'), width: 440 }} main>
      <UsesWindow rows={rows} />
    </Window>
  );
}
