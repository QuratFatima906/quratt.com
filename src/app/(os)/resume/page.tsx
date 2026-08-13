import { Window } from '@/components/os/window';
import { ResumeWindow } from '@/components/windows/resume';
import { getCv } from '@/lib/content/queries';
import { pageMetadata } from '@/lib/seo/site';
import { windowDef } from '@/lib/windows';

/**
 * `/resume`, never `/cv` (D12). No download link is rendered: the PDF is not served from this
 * repository, and it carries a phone number that was never authorised for publication (D14).
 */
export const metadata = pageMetadata({
  title: 'Résumé',
  description:
    'Eight years of software engineering: Shopsense AI, Afiniti, MarkiTech. Architecture, APIs and scale across AWS and GCP.',
  path: '/resume',
});

export default async function ResumePage() {
  const rows = await getCv();

  return (
    <Window def={{ ...windowDef('resume'), width: 560 }} main>
      <ResumeWindow rows={rows} />
    </Window>
  );
}
