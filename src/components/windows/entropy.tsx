'use client';

import { useState } from 'react';

/**
 * The design's toy: a 6×6 grid of coloured cells that rerolls on click.
 *
 * The generator is the design's own linear congruential one, kept rather than swapped for
 * `Math.random()` for two reasons — a seed makes the grid reproducible in a test, and a
 * server render and its hydration must agree on the same 36 cells or React throws.
 *
 * The seed is state, not content: it counts rerolls and picks the palette, and it is not
 * shown or announced anywhere. Nobody needs to know which roll they are on.
 */
const CELLS = 36;

const SWATCHES = [
  'bg-accent',
  'bg-accent-alt',
  'bg-surface-hover',
  'bg-surface-hover',
  'bg-surface-overlay',
  'bg-info',
] as const;

/** Deterministic for a given seed — this is what `entropy.test.ts` pins. */
export function cellsForSeed(seed: number): string[] {
  let state = seed * 9301 + 49297;
  return Array.from({ length: CELLS }, () => {
    state = (state * 9301 + 49297) % 233280;
    return SWATCHES[Math.floor((state / 233280) * SWATCHES.length)] ?? SWATCHES[0];
  });
}

export function EntropyWindow() {
  const [seed, setSeed] = useState(1);
  const cells = cellsForSeed(seed);

  return (
    <div className="p-3.5">
      <button
        type="button"
        onClick={() => setSeed((s) => s + 1)}
        aria-label="Reroll the grid"
        className="block w-full cursor-pointer"
      >
        {/* Purely decorative output — describing 36 coloured squares helps nobody. */}
        <span aria-hidden="true" className="grid grid-cols-6 gap-1">
          {cells.map((cell, i) => (
            <span key={i} className={`aspect-square rounded-[2px] ${cell}`} />
          ))}
        </span>
      </button>
      <p aria-hidden="true" className="mt-[11px] font-mono text-[9.5px] text-text-muted">
        click to reroll
      </p>
    </div>
  );
}
