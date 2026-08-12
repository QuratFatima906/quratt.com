'use client';

import { useTheme } from 'next-themes';

/**
 * The design has no theme control, so this borrows the OS chrome's vocabulary: a mono glyph
 * button, which is what the menu bar already looks like.
 *
 * The label is deliberately static. A label naming the current theme would have to be
 * suppressed until mount — the server cannot know what the blocking script will resolve —
 * and a label that changes after hydration is worse for a screen reader than one that
 * describes the action once and correctly.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Switch between light and dark theme"
      className="cursor-pointer rounded border border-border px-2 py-1 font-mono text-xs text-text-secondary hover:bg-surface-hover hover:text-text"
    >
      <span aria-hidden="true">◐</span> theme
    </button>
  );
}
