import { describe, expect, it } from 'vitest';
import { cellsForSeed } from './entropy';

describe('cellsForSeed', () => {
  it('always returns a full grid', () => {
    expect(cellsForSeed(1)).toHaveLength(36);
  });

  it('is deterministic — the same seed gives the same grid', () => {
    expect(cellsForSeed(7)).toEqual(cellsForSeed(7));
  });

  it('changes when the seed changes, so rerolling actually rerolls', () => {
    expect(cellsForSeed(1)).not.toEqual(cellsForSeed(2));
  });

  it('never emits an undefined cell', () => {
    // The index is derived from a float; an off-by-one at the top of the range would leave a
    // hole in the grid that only shows up for one seed in thousands.
    for (let seed = 1; seed <= 500; seed++) {
      expect(cellsForSeed(seed).every(Boolean)).toBe(true);
    }
  });
});
