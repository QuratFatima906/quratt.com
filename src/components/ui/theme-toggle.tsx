'use client';

import { useTheme } from 'next-themes';

/**
 * The design has no theme control, so this borrows the OS chrome's vocabulary: a square glyph
 * button the same size as the hamburger it sits beside.
 *
 * Icon-only, so the accessible name is the only name it has — which is fine, because it was
 * always going to be: the visible word said "theme", not what the button would do to it.
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
      className="flex size-7 flex-none cursor-pointer items-center justify-center rounded border border-border text-[13px] text-text-secondary hover:bg-surface-hover hover:text-text"
    >
      <span aria-hidden="true">◐</span>
    </button>
  );
}
