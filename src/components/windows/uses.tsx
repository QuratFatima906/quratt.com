import type { Uses } from '@/lib/content/schema';

/**
 * `label · value` rows. A description list is the honest markup — these are term/definition
 * pairs, and a screen reader announcing "editor, VS Code" beats it reading one run-on line.
 * The separator is decorative and hidden, or every row would be announced with "middle dot".
 *
 * The term column is `9ch` wide, which in a monospaced face is exactly nine characters — so
 * the separators line up into a column and the whole thing reads like the text file it claims
 * to be. `9` is the longest label plus one; a longer one wraps rather than pushing the column.
 */
export function UsesWindow({ rows }: { rows: Uses[] }) {
  return (
    <dl className="px-[18px] pt-4 pb-[18px] font-mono text-[11.5px] leading-[1.95] text-text-secondary">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-1.5">
          <dt className="w-[9ch] flex-none text-text-muted">{row.label}</dt>
          <dd className="flex min-w-0 gap-1.5">
            <span aria-hidden="true" className="flex-none">
              ·
            </span>
            <span>{row.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
