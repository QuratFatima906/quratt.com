'use client';

import { DESKTOP_ICONS, windowDef } from '@/lib/windows';

import { Glyph } from './glyph';
import { Launcher } from './launcher';

/**
 * The three icons the design puts on the desktop. Which three is the registry's call, and the
 * shapes are `Glyph`'s — the dock draws the same ones, at the same window's expense if they
 * ever drift apart.
 */
export function DesktopIcons() {
  return (
    <div className="absolute top-12 left-4 z-1 grid grid-cols-3 gap-1 max-md:right-4 md:flex md:flex-col">
      {DESKTOP_ICONS.map((key) => {
        const def = windowDef(key);
        return (
          <Launcher
            key={key}
            windowKey={key}
            // Scale on press, not just on release: the icon has to acknowledge the click at
            // the moment of the click, or the desktop feels unresponsive on slow connections.
            className="flex w-22 cursor-pointer flex-col items-center gap-1.5 rounded-md px-1.5 pt-2.5 pb-2 transition-[background-color,scale] duration-150 ease-out hover:bg-surface-hover/60 active:scale-97 max-md:w-full"
            disabledClassName="opacity-60"
            tooltipClassName="top-full left-1/2 -translate-x-1/2"
          >
            <Glyph icon={def.icon} />
            <span className="text-center text-[9.5px] text-text">{def.label}</span>
          </Launcher>
        );
      })}
    </div>
  );
}
