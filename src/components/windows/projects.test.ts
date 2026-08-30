import { describe, expect, it } from 'vitest';

import type { Project } from '@/lib/content/schema';

import { filterByTag, projectSlug, tagsOf } from './projects';

const stamps = { createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-02') };

const project = (name: string, tag: Project['tag'], sortOrder = 0): Project => ({
  id: sortOrder + 1,
  sortOrder,
  name,
  year: '2026',
  lang: 'go',
  tag,
  desc: `${name} does a thing`,
  draft: false,
  pinned: false,
  ...stamps,
});

const projects: Project[] = [
  project('quietwatch', 'systems', 0),
  project('nudge', 'tools', 1),
  project('cold start', 'systems', 2),
  project('teapot', 'silly', 3),
];

describe('tagsOf', () => {
  it('lists each tag once, in the order it first appears', () => {
    expect(tagsOf(projects)).toEqual(['systems', 'tools', 'silly']);
  });

  it('is empty for no projects, so the chip row collapses rather than throwing', () => {
    expect(tagsOf([])).toEqual([]);
  });
});

describe('filterByTag', () => {
  it('keeps only the matching tag', () => {
    expect(filterByTag(projects, 'systems').map((p) => p.name)).toEqual(['quietwatch', 'cold start']);
  });

  // The three ways a filter can mean "everything". A hand-typed `?tag=` reaches this function
  // unvalidated, so an unknown value must widen to all rather than empty the grid.
  it.each([
    ['undefined', undefined],
    ['the explicit all chip', 'all'],
    ['a tag no project carries', 'nonsense'],
    ['an empty string', ''],
  ])('returns every project for %s', (_label, tag) => {
    expect(filterByTag(projects, tag)).toHaveLength(projects.length);
  });

  it('does not hand back the caller its own array, which a sort would mutate', () => {
    const all = filterByTag(projects, 'all');
    expect(all).not.toBe(projects);
    all.reverse();
    expect(projects.map((p) => p.name)[0]).toBe('quietwatch');
  });

  it('preserves the incoming order rather than regrouping by tag', () => {
    expect(filterByTag(projects, undefined).map((p) => p.sortOrder)).toEqual([0, 1, 2, 3]);
  });
});

describe('projectSlug', () => {
  it('joins words with a hyphen, so a two-word name is one path segment', () => {
    expect(projectSlug('cold start')).toBe('cold-start');
  });

  it('lowercases', () => {
    expect(projectSlug('QuietWatch')).toBe('quietwatch');
  });

  it('collapses punctuation instead of emitting a run of hyphens', () => {
    expect(projectSlug('a — b (v2)')).toBe('a-b-v2');
  });

  it('never leaves a leading or trailing hyphen', () => {
    expect(projectSlug('  spaced  ')).toBe('spaced');
    expect(projectSlug('!bang!')).toBe('bang');
  });
});
