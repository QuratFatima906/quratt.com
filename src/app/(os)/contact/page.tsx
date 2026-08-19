import { notFound } from 'next/navigation';

import { Window } from '@/components/os/window';
import { ContactWindow } from '@/components/windows/contact';
import { getContact } from '@/lib/content/queries';
import { pageMetadata } from '@/lib/seo/site';
import { windowDef } from '@/lib/windows';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Email Qurat ul Ain Fatima about a job, a bug, or a cat photo.',
  path: '/contact',
});

export default async function ContactPage() {
  const contact = await getContact();
  if (!contact) notFound();

  return (
    <Window def={{ ...windowDef('contact'), width: 460 }} main>
      <ContactWindow contact={contact} />
    </Window>
  );
}
