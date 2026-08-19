import { Window } from '@/components/os/window';
import { ResumeWindow } from '@/components/windows/resume';
import { getCv } from '@/lib/content/queries';
import { pageMetadata } from '@/lib/seo/site';
import { windowDef } from '@/lib/windows';

/**
 * `/resume`, never `/cv` (D12). The window carries a download button; the PDF it points at is
 * served from `public/` (feedback.md #4, superseding D14).
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
