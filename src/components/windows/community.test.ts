import { describe, expect, it } from 'vitest';

import { carded, groupRoles, start } from './community';

import type { CommunityRole } from '@/lib/content/schema';

/** Only the fields the grouping reads; the rest are noise for this question. */
const role = (org: string, period: string, badge = org): CommunityRole =>
  ({ org, period, badge, role: 'lead', note: '', body: '' }) as CommunityRole;

describe('start', () => {
  it('takes the year a period opens on', () => {
    expect(start('2020 → 2023')).toBe('2020');
    expect(start('2023 → present')).toBe('2023');
    expect(start('2019')).toBe('2019');
  });
});

describe('groupRoles', () => {
  /*
   * The whole reason the cards and the `community.log` timeline share one table: if these two
   * lists were seeded separately, a renamed role could appear in one and not the other.
   */
  it('collects consecutive roles at one organisation into a single card', () => {
    const groups = groupRoles([
      role('Technovation', '2018 → 2019'),
      role('PWiC', '2020'),
      role('PWiC', '2020 → 2023'),
      role('PWiC', '2023 → present'),
    ]);

    expect(groups.map((g) => g.org)).toEqual(['PWiC', 'Technovation']);
    expect(groups[0]!.roles).toHaveLength(3);
  });

  it('reads newest organisation first, from chronological rows', () => {
    const groups = groupRoles([role('A', '2018'), role('B', '2019'), role('C', '2020')]);
    expect(groups.map((g) => g.org)).toEqual(['C', 'B', 'A']);
  });

  it("spans a card from its first role's start to its last role's end", () => {
    const [pwic] = groupRoles([
      role('PWiC', '2020'),
      role('PWiC', '2020 → 2023'),
      role('PWiC', '2023 → present'),
    ]);
    expect(pwic!.span).toBe('2020 → present');
  });

  it('collapses a span to one year when a card neither moves nor continues', () => {
    expect(groupRoles([role('GDG', '2019')])[0]!.span).toBe('2019');
  });

  it('keeps two spells at the same organisation apart when something sits between them', () => {
    const groups = groupRoles([role('A', '2018'), role('B', '2019'), role('A', '2020')]);
    expect(groups.map((g) => g.org)).toEqual(['A', 'B', 'A']);
  });
});

describe('carded', () => {
  /*
   * Women Techmakers is in the design's log with no card of its own, and an empty body is what
   * keeps it out. The log renders the roles it is handed, so nothing here can drop it from the
   * timeline — only from the cards above it.
   */
  const detailed = (org: string, period: string): CommunityRole => ({
    ...role(org, period),
    body: 'what the card would reveal',
  });

  it('drops an organisation with no detail written for it', () => {
    const groups = groupRoles([role('Women Techmakers', '2019'), detailed('PWiC', '2020')]);
    expect(carded(groups).map((g) => g.org)).toEqual(['PWiC']);
  });

  it('keeps a card when any one of its roles carries detail', () => {
    const groups = groupRoles([role('PWiC', '2020'), detailed('PWiC', '2023 → present')]);
    expect(carded(groups)).toHaveLength(1);
  });
});
