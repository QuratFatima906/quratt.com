'use client';

import { useId } from 'react';

import { useOs, type Wallpaper } from './window-manager';

const WALLPAPERS: readonly { value: Wallpaper; swatch: string }[] = [
  { value: 'dots', swatch: 'swatch-dots' },
  { value: 'grid', swatch: 'swatch-grid' },
  { value: 'gradient', swatch: 'swatch-gradient' },
];

/**
 * A radiogroup, and therefore three real radios in a fieldset: arrow-key roving, the group
 * name, and the checked state all come from the platform. A `role="radiogroup"` built from
 * buttons would be the same markup plus a keyboard handler to maintain.
 */
export function WallpaperPicker({ className }: { className?: string }) {
  const { wallpaper, setWallpaper } = useOs();
  const name = useId();

  return (
    <fieldset className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <legend className="sr-only">Wallpaper</legend>
      {WALLPAPERS.map((w) => (
        <label key={w.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={w.value}
            checked={wallpaper === w.value}
            onChange={() => setWallpaper(w.value)}
            className="peer sr-only"
          />
          <span className="sr-only">{w.value}</span>
          <span
            aria-hidden="true"
            className={`block size-4 rounded-sm bg-surface-raised outline-offset-2 peer-checked:outline-2 peer-checked:outline-accent peer-focus-visible:outline-2 peer-focus-visible:outline-focus ${w.swatch}`}
          />
        </label>
      ))}
    </fieldset>
  );
}
