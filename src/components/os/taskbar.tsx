'use client';

import { WINDOWS } from '@/lib/windows';

import { Glyph } from './glyph';
import { useOs } from './window-manager';

/**
 * The dock — every open window, in **registry** order rather than stacking order.
 *
 * Deliberately not `open`: that array is the z-order, and raising a window moves its key to
 * the end of it, so a dock built from it reshuffles itself every time you click an icon. An
 * icon's position has to be a property of the window, not of which one you touched last —
 * and registry order is the order the menu bar already lists, so the two agree.
 *
 * Icons only, name on hover, the way a Mac's does (feedback.md #6): the label, the "open"
 * heading and the window counter all went, because a dock that has to caption itself is not
 * a dock. That leaves the icon carrying the whole meaning, so each one takes the window's
 * name as its accessible name and the tooltip is decoration on top of that.
 *
 * Now that every window opens dead centre on top of the last one, this is the *only* way to
 * reach a buried one — WCAG 2.2 SC 2.5.7, which asks that nothing require a drag. There is
 * deliberately no close button here: raising a window puts its own × in reach, and a 24px
 * target (SC 2.5.8) will not fit beside a 26px icon in a 40px bar without crowding both.
 */
export function Taskbar() {
  const { open, openWindow } = useOs();

  return (
    <nav
      aria-label="Open windows"
      className="absolute inset-x-0 bottom-0 z-9000 flex h-10 items-center justify-center border-t border-border bg-surface-chrome/95 px-3"
    >
      {/* No scroll container: an `overflow-x-auto` here would clip the tooltips, which open
          upwards out of the bar. The registry holds ten windows and each entry is 30px, so the
          full dock is 300px — narrower than the narrowest phone.
          ponytail: fixed ceiling. If the registry ever outgrows a small viewport, scroll the
          row and portal the tooltip out of it. */}
      <ul className="flex list-none items-center gap-0.5">
        {WINDOWS.filter((def) => open.includes(def.key)).map((def) => (
            <li key={def.key} className="flex-none">
              <button
                type="button"
                aria-label={def.label}
                onClick={() => openWindow(def.key)}
                // `group` does the tooltip in CSS rather than in state: there is one of these
                // per open window and none of them needs to re-render just to show a name.
                className="group relative flex cursor-pointer flex-col items-center gap-[3px] rounded-md px-1 pt-1 pb-0.5 transition-[background-color,scale] duration-150 ease-out hover:bg-surface-hover/60 active:scale-95"
              >
                <Glyph icon={def.icon} small />
                {/* The running light. Every window in this list is open by definition, so it
                    is on for all of them — it is what makes the row read as a dock. */}
                <span aria-hidden="true" className="size-[3px] rounded-full bg-accent" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full left-1/2 z-9999 mb-1.5 -translate-x-1/2 rounded border border-border bg-surface-overlay px-2 py-1 text-[10px] whitespace-nowrap text-text opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {def.label}
                </span>
              </button>
            </li>
        ))}
      </ul>
    </nav>
  );
}
