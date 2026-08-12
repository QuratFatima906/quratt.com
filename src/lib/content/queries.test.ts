import { describe, expect, it } from 'vitest';

import { countVisible, featured, visible } from './queries';

const rows = [
  { id: 1, draft: false, pinned: true },
  { id: 2, draft: true, pinned: true },
  { id: 3, draft: false, pinned: false },
  { id: 4, draft: true, pinned: false },
  { id: 5, draft: false, pinned: true },
];

describe('visible', () => {
  it('drops drafts and keeps published rows, in order', () => {
    expect(visible(rows).map((row) => row.id)).toEqual([1, 3, 5]);
  });

  it('is a no-op when nothing is a draft', () => {
    const published = rows.filter((row) => !row.draft);
    expect(visible(published)).toEqual(published);
  });
});

describe('countVisible', () => {
  it('excludes drafts, so a draft cannot inflate a count', () => {
    expect(countVisible(rows)).toBe(3);
    expect(countVisible(rows)).toBeLessThan(rows.length);
  });
});

describe('featured', () => {
  it('takes pinned, published rows only', () => {
    expect(featured(rows).map((row) => row.id)).toEqual([1, 5]);
  });

  it('stops at four', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ id: i, draft: false, pinned: true }));
    expect(featured(many)).toHaveLength(4);
  });
});
