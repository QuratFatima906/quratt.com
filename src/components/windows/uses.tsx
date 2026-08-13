import type { Uses } from '@/lib/content/schema';

/**
 * `label · value` rows. A description list is the honest markup — these are term/definition
 * pairs, and a screen reader announcing "editor, Neovim" beats it reading one run-on line.
 * The separator is decorative and hidden, or every row would be announced with "middle dot".
 */
export function UsesWindow({ rows }: { rows: Uses[] }) {
  return (
    <dl className="px-[18px] pt-4 pb-[18px] font-mono text-[11.5px] leading-[1.95] text-text-secondary">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-1.5">
          <dt className="text-text-muted">{row.label}</dt>
          <dd className="flex gap-1.5">
            <span aria-hidden="true">·</span>
            <span>{row.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
