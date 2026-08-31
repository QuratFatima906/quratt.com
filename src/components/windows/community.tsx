import type { CommunityMeta, CommunityRole } from '@/lib/content/schema';

/**
 * `community.md` — the design's career log.
 *
 * It draws the roles twice: as expandable cards grouped by organisation, and again as the
 * `community.log` timeline at the foot. The log carries every role; the cards carry only those
 * with detail written for them (see `carded`). Both are rendered from one ordered list of roles
 * (see `communitySchema`), so a renamed role can never appear in one list and not the other, and
 * both read newest first.
 *
 * The cards are `<details>`, not state. A disclosure that the platform already implements is
 * keyboard-operable, announced as expandable, findable by in-page search, and works on the
 * server-rendered page with no JavaScript — which is the same bargain every other window here
 * makes. A `useState` version would be more code and less behaviour.
 */

/** The seeded order is chronological; the cards read newest organisation first. */
export type Group = {
  org: string;
  badge: string;
  span: string;
  roles: CommunityRole[];
};

/** A period is a display string — `2020`, `2020 → 2023`, `2023 → present`. */
export const start = (period: string) => period.split('→')[0]!.trim();
const end = (period: string) => period.split('→').at(-1)!.trim();

/**
 * A group's span runs from its first role's start to its last role's end, so PWiC's three roles
 * read as `2020 → present` on one card without storing that string anywhere.
 */
export function groupRoles(roles: CommunityRole[]): Group[] {
  const groups: Group[] = [];
  for (const role of roles) {
    const last = groups.at(-1);
    if (last?.org === role.org) last.roles.push(role);
    else groups.push({ org: role.org, badge: role.badge, span: '', roles: [role] });
  }
  for (const group of groups) {
    const first = start(group.roles[0]!.period);
    const final = end(group.roles.at(-1)!.period);
    group.span = first === final ? first : `${first} → ${final}`;
  }
  return groups.reverse();
}

/**
 * A card is a disclosure you open for the detail, so an organisation with no detail written for
 * it has nothing to open. Those appear in the `community.log` timeline only, which is where the
 * design puts Women Techmakers — the log carries every role either way.
 */
export const carded = (groups: Group[]): Group[] =>
  groups.filter((group) => group.roles.some((role) => role.body));

/**
 * Cards are told apart by colour, and the colour comes from position rather than a column: the
 * palette is fixed, the order is the owner's, and a new organisation should not need a token
 * chosen for it. Every entry is a tested fill — `on-accent` over it clears AA (tokens.test.ts).
 */
const ACCENTS = [
  { text: 'text-accent', fill: 'bg-accent' },
  { text: 'text-accent-alt', fill: 'bg-accent-alt' },
  { text: 'text-warn', fill: 'bg-warn' },
  { text: 'text-info', fill: 'bg-info' },
] as const;

const accentFor = (index: number) => ACCENTS[index % ACCENTS.length]!;

/** Bodies are authored as prose with blank lines between paragraphs. */
const paragraphs = (body: string) => body.split(/\n\s*\n/).filter(Boolean);

function RoleDetail({ role, tone }: { role: CommunityRole; tone: string }) {
  return (
    <div>
      <p className={`mb-1.5 font-mono text-[11px] ${tone}`}>{role.role}</p>
      {paragraphs(role.body).map((text) => (
        <p key={text} className="mt-2 text-[13px] leading-[1.6] text-pretty first:mt-0">
          {text}
        </p>
      ))}
    </div>
  );
}

function Card({ group, index }: { group: Group; index: number }) {
  const tone = accentFor(index);
  const detailed = group.roles.filter((role) => role.body);
  const [only] = group.roles;
  const single = group.roles.length === 1;

  const header = (
    <div className="flex flex-wrap items-center gap-x-[11px] gap-y-1.5">
      <span
        className={`rounded-[5px] px-2 py-1 font-mono text-[10px] tracking-[0.06em] text-on-accent ${tone.fill}`}
      >
        {group.badge}
      </span>
      <h3 className="text-[15px] font-bold tracking-[-0.01em]">{group.org}</h3>
      {single ? <span className="text-[13px] text-text-secondary">{only!.role}</span> : null}
      <span className={`ml-auto font-mono text-[11px] whitespace-nowrap ${tone.text}`}>
        {single && only!.note ? only!.note : group.span}
      </span>
    </div>
  );

  return (
    <li className="overflow-hidden rounded-[9px] border border-border bg-surface-overlay">
      <details className="group/card">
        <summary className="cursor-pointer list-none px-[18px] py-4 transition-colors duration-150 hover:bg-surface-hover [&::-webkit-details-marker]:hidden">
          <div className="flex gap-[11px]">
            {/* Decoration: the summary is already announced as expanded or collapsed. */}
            {/* `self-start` matters: a stretched flex child is as tall as the open card, and
                rotating that box about its centre would drop the glyph halfway down it. */}
            <span
              aria-hidden="true"
              className={`mt-0.5 w-2.5 flex-none self-start font-mono text-[13px] transition-transform duration-150 group-open/card:rotate-90 ${tone.text}`}
            >
              ›
            </span>
            <div className="min-w-0 flex-1">
              {header}
              {single ? null : (
                <ol className="mt-3 flex flex-col">
                  {group.roles.map((role, i) => (
                    <li key={role.id}>
                      {i > 0 ? (
                        <span
                          aria-hidden="true"
                          className="ml-[3px] block h-3.5 w-px bg-border-interactive"
                        />
                      ) : null}
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="text-[13px]">{role.role}</span>
                        <span className="font-mono text-[10.5px] text-text-muted">
                          {role.note || role.period}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </summary>
        <div className="flex flex-col gap-4 border-t border-border px-[18px] py-4 pl-[39px] text-text-secondary">
          {detailed.map((role) => (
            <RoleDetail key={role.id} role={role} tone={tone.text} />
          ))}
        </div>
      </details>
    </li>
  );
}

/**
 * The log reads newest first, the same direction the cards above it run in, so the page has one
 * direction rather than two. The seeded order is chronological and stays that way — the log
 * reverses a copy at the point of drawing rather than the database storing a second ordering.
 */
export const logOrder = (roles: CommunityRole[]): CommunityRole[] => [...roles].reverse();

/** The `community.log` foot — the same roles, newest first, as a dated spine. */
function Log({ roles }: { roles: CommunityRole[] }) {
  return (
    <div className="rounded-[9px] border border-border bg-surface-chrome px-[22px] py-5 font-mono text-[11.5px]">
      <p className="mb-4 text-text-muted">community.log</p>
      <ol className="flex flex-col gap-[17px] border-l border-border pl-5">
        {logOrder(roles).map((role) => (
          <li key={role.id} className="relative flex flex-wrap gap-x-3">
            <span
              aria-hidden="true"
              className="absolute top-[5px] -left-[23px] size-[7px] rounded-full bg-accent ring-4 ring-surface-chrome"
            />
            <span className="w-[38px] flex-none text-accent">{start(role.period)}</span>
            <span className="text-text">{role.org}</span>
            <span className="text-text-muted">{role.role.toLowerCase()}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CommunityWindow({ meta, roles }: { meta: CommunityMeta; roles: CommunityRole[] }) {
  const groups = carded(groupRoles(roles));

  return (
    <div className="px-[26px] pt-6 pb-[26px]">
      <h2 className="mb-4 text-[21px] leading-[1.15] font-bold tracking-[-0.02em] text-balance">
        Building communities, apparently
      </h2>

      <div className="rounded-lg border border-border bg-surface px-[18px] py-4 font-mono text-[11.5px] leading-[1.85] text-text-secondary">
        {/* Authored as four short lines, and the line breaks are the joke's timing. */}
        <p className="whitespace-pre-line">{meta.intro}</p>
        <p className="mt-2.5 text-accent">{meta.kicker}</p>
      </div>

      <div className="mt-[26px] mb-3.5 flex items-center gap-2.5">
        <h3 className="font-mono text-[10px] tracking-[0.16em] text-text-muted uppercase">
          the log
        </h3>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <ol className="mb-[22px] flex flex-col gap-3">
        {groups.map((group, index) => (
          <Card key={group.org} group={group} index={index} />
        ))}
      </ol>

      <div className="mb-5 rounded-[9px] border border-border bg-surface px-5 py-[18px]">
        <h3 className="mb-3 font-mono text-[10px] tracking-[0.14em] text-text-muted uppercase">
          what all of this taught me
        </h3>
        <p className="text-[13.5px] leading-[1.65] text-pretty">{meta.lesson1}</p>
        <p className="mt-3 text-[13.5px] leading-[1.65] text-pretty text-text-secondary">
          {meta.lesson2}
        </p>
      </div>

      <Log roles={roles} />
    </div>
  );
}
