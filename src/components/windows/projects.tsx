import type { Project } from '@/lib/content/schema';

/*
 * Destinations that are routes rather than windows use a plain anchor, not `next/link`.
 * P5 builds these routes; until then `next/link` would prefetch them and log a 404 to the
 * console for every link on screen. The href is already correct, so nothing changes when the
 * route lands beyond restoring prefetching.
 */

/**
 * The dot and the chips are the only place a tag is styled. `data-model.md` names three tags
 * and says an unknown one must still render — new tags appear in the filter automatically, so
 * an unmapped tag falls back to a neutral dot rather than disappearing.
 */
const TAG_DOT: Record<string, string> = {
  systems: 'bg-accent',
  tools: 'bg-accent-alt',
  silly: 'bg-warn',
};

/** Chips derive from the data, in the order the tags first appear — never from a hardcoded list. */
export function tagsOf(projects: readonly Project[]): string[] {
  return [...new Set(projects.map((p) => p.tag))];
}

/** `undefined` and anything unknown mean "all", so a hand-typed `?tag=` cannot empty the grid. */
export function filterByTag(projects: readonly Project[], tag: string | undefined): Project[] {
  if (!tag || tag === 'all' || !tagsOf(projects).includes(tag)) return [...projects];
  return projects.filter((p) => p.tag === tag);
}

/** P5 owns `/projects/[slug]`; the row has no slug column, so the name is the slug. */
export function projectSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The small window: the pinned few, and a way to the whole grid. */
export function ProjectsWindow({ featured, total }: { featured: Project[]; total: number }) {
  return (
    <div className="flex flex-col gap-[11px] px-5 pt-4 pb-[18px]">
      {featured.map((project) => (
        <div key={project.id} className="flex items-baseline gap-3">
          <span className="w-[86px] flex-none font-mono text-xs text-accent">{project.name}</span>
          <span className="text-sm leading-[1.4] text-text-secondary">{project.desc}</span>
        </div>
      ))}
      <a
        href="/projects"
        className="mt-0.5 font-mono text-[11px] text-accent-alt hover:underline"
      >
        open all {total} →
      </a>
    </div>
  );
}

/**
 * The expanded grid. The active tag arrives as a prop and the chips are links, so the filter
 * lives entirely in the URL — a filtered view stays shareable and crawlable (ARCHITECTURE.md).
 */
export function ProjectsGrid({
  projects,
  tag,
  basePath = '/projects',
}: {
  projects: Project[];
  tag?: string;
  basePath?: string;
}) {
  const shown = filterByTag(projects, tag);
  const chips = ['all', ...tagsOf(projects)];
  const active = chips.includes(tag ?? 'all') ? (tag ?? 'all') : 'all';

  return (
    <div className="px-[30px] pt-[26px] pb-[30px]">
      <div className="mb-5 flex flex-wrap items-center gap-[7px] font-mono text-[11px]">
        {chips.map((chip) => (
          <a
            key={chip}
            href={chip === 'all' ? basePath : `${basePath}?tag=${chip}`}
            aria-current={chip === active ? 'true' : undefined}
            className={`rounded-full border border-border px-[13px] py-[7px] transition-colors duration-150 ${
              chip === active
                ? 'bg-accent text-on-accent'
                : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {chip === 'all' ? `all ${projects.length}` : chip}
          </a>
        ))}
        <span className="ml-auto whitespace-nowrap text-text-muted" role="status">
          {shown.length} shown
        </span>
      </div>
      <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <li
            key={project.id}
            className="flex min-h-[132px] flex-col gap-[7px] rounded-lg border border-border bg-surface-overlay px-4 pt-4 pb-[14px]"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-[7px] flex-none rounded-full ${TAG_DOT[project.tag] ?? 'bg-border-interactive'}`}
              />
              <span className="font-mono text-[12.5px]">{project.name}</span>
              <span className="ml-auto font-mono text-[10px] text-text-muted">{project.year}</span>
            </div>
            <p className="text-[13.5px] leading-[1.45] text-pretty text-text-secondary">
              {project.desc}
            </p>
            <div className="mt-auto flex gap-1.5 font-mono text-[9.5px] text-text-muted">
              <span className="rounded bg-surface px-[7px] py-[3px]">{project.lang}</span>
              <span className="rounded bg-surface px-[7px] py-[3px]">{project.tag}</span>
              <a
                href={`/projects/${projectSlug(project.name)}`}
                className="ml-auto self-center text-accent-alt hover:underline"
              >
                open<span aria-hidden="true"> ↗</span>
                <span className="sr-only"> {project.name}</span>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
