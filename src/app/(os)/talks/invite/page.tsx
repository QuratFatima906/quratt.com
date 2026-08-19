import { notFound } from 'next/navigation';

import { Window } from '@/components/os/window';
import { InviteWindow } from '@/components/windows/talks';
import { getContact } from '@/lib/content/queries';
import { pageMetadata } from '@/lib/seo/site';
import { isIndexable, windowDef } from '@/lib/windows';

export const metadata = pageMetadata({
  title: 'Invite me to speak',
  description:
    'Send Qurat ul Ain Fatima the event, the date and a paragraph on the topic. That is plenty.',
  path: '/talks/invite',
  index: isIndexable('talks'),
});

export default async function InvitePage() {
  const contact = await getContact();
  if (!contact) notFound();

  return (
    <Window def={{ ...windowDef('talks'), label: 'invite-qurat.form', width: 760 }} main>
      <InviteWindow email={contact.email} />
    </Window>
  );
}
