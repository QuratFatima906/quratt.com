import type { NowLine } from '@/lib/content/schema';

/**
 * The design renders this as a plain text file — a comment line carrying the "as of" date,
 * then arrow-prefixed lines. `nowUpdated` is a hand-written label rather than a derived
 * timestamp, because "updated last Tuesday" is a claim about the content, not about the row.
 */
export function NowWindow({ lines, updated }: { lines: NowLine[]; updated: string }) {
  return (
    <div className="px-[18px] pt-4 pb-[18px] font-mono text-[11.5px] leading-[1.95] text-text-secondary">
      <p className="mb-1.5 text-text-muted">{`// updated ${updated}`}</p>
      <ul>
        {lines.map((line) => (
          // A flex row rather than a text prefix, so a line that wraps hangs under itself
          // instead of running back under the arrow.
          <li key={line.id} className="flex gap-1.5">
            {/* The arrow is decoration; a screen reader should hear the line, not "right arrow". */}
            <span aria-hidden="true" className="flex-none">
              →
            </span>
            <span>{line.line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
