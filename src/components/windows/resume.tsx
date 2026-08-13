import type { CvRow } from '@/lib/content/schema';

/**
 * The design calls this a PDF preview: a period column, the role, and one line on it. D12
 * renamed the window from `cv.pdf` to `resume.pdf`.
 *
 * The résumé also carries a phone number. It is not in the seed and must never be rendered
 * here (D14) — only the email was ever authorised for publication.
 */
export function ResumeWindow({ rows, downloadHref }: { rows: CvRow[]; downloadHref?: string }) {
  return (
    <div className="px-[22px] pt-5 pb-[22px]">
      <ol className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <li key={row.id} className="flex gap-3.5">
            <span className="w-[78px] flex-none pt-0.5 font-mono text-[11px] text-text-muted">
              {row.period}
            </span>
            <span>
              <span className="block text-[14.5px] leading-[1.4]">{row.role}</span>
              {row.note ? (
                <span className="mt-0.5 block text-[13px] leading-[1.45] text-text-muted">
                  {row.note}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {/* Rendered only once there is a file to point at, so the button is never a dead end. */}
      {downloadHref ? (
        <a
          href={downloadHref}
          download
          className="mt-[18px] inline-block rounded-[5px] bg-accent px-[13px] py-2 font-mono text-[11px] text-on-accent transition-opacity duration-150 hover:opacity-90"
        >
          download the real one ↓
        </a>
      ) : null}
    </div>
  );
}
