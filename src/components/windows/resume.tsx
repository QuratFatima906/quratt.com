import { CTA } from '@/components/ui/cta';
import type { CvRow } from '@/lib/content/schema';

/**
 * The file the button hands over. It lives in `public/` under its full name on purpose: that
 * name is what lands in a recruiter's downloads folder, so it has to read as a résumé there
 * and not as `resume.pdf` among nine other `resume.pdf`s.
 */
const RESUME_PDF = '/Qurat_ul_Ain_Fatima_Resume_Senior_Software_Engineer.pdf';

/**
 * The design calls this a PDF preview: a period column, the role, and one line on it. D12
 * renamed the window from `cv.pdf` to `resume.pdf`.
 *
 * The résumé carries a phone number. D14 kept the file out of the repository for that reason;
 * the owner reversed that on 2026-08-19 (feedback.md #4) and the PDF is now served publicly,
 * phone number included. The number still must not be rendered as text on the page — a
 * crawler reading HTML is a different exposure from one that has to open a PDF.
 */
export function ResumeWindow({ rows }: { rows: CvRow[] }) {
  return (
    <div className="px-[22px] pt-5 pb-[22px]">
      <ol className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <li key={row.id} className="flex gap-3.5">
            <span className="w-[78px] flex-none pt-0.5 text-[11px] text-text-muted">
              {row.period}
            </span>
            <span>
              <span className="block text-[13.5px] leading-[1.45]">{row.role}</span>
              {row.note ? (
                <span className="mt-0.5 block text-[12px] leading-[1.5] text-text-muted">
                  {row.note}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      <a href={RESUME_PDF} download className={`mt-[18px] ${CTA}`}>
        download the real one ↓
      </a>
    </div>
  );
}
