import { notFound } from 'next/navigation';

import { Window } from '@/components/os/window';
import { AboutWindow } from '@/components/windows/about';
import { getAbout } from '@/lib/content/queries';
import { JsonLd, profilePage } from '@/lib/seo/json-ld';
import { pageMetadata } from '@/lib/seo/site';
import { windowDef } from '@/lib/windows';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'Qurat ul ain Fatima — senior software engineer in Lahore, eight years in. Architecture, APIs and scale across AWS and GCP.',
  path: '/about',
  type: 'profile',
});

export default async function AboutPage() {
  const about = await getAbout();
  if (!about) notFound();

  return (
    <Window def={windowDef('about')} main>
      <JsonLd data={profilePage(about)} />
      <AboutWindow about={about} />
    </Window>
  );
}
