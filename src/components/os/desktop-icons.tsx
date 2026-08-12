'use client';

import { DESKTOP_ICONS, windowDef, type WindowIcon } from '@/lib/windows';

import { Launcher } from './launcher';

/**
 * The three icons the design puts on the desktop. Which three is the registry's call; the
 * shapes are the only thing that lives here.
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
            <span className="text-center font-mono text-[9.5px] text-text">{def.label}</span>
          </Launcher>
        );
      })}
    </div>
  );
}

function Glyph({ icon }: { icon: WindowIcon }) {
  const frame = 'flex h-11 w-[38px] flex-none rounded-sm border';

  if (icon === 'pdf') {
    return (
      <span
        aria-hidden="true"
        className={`${frame} items-center justify-center border-border-interactive bg-surface-raised font-mono text-[9px] font-bold text-danger`}
      >
        PDF
      </span>
    );
  }

  if (icon === 'app') {
    return (
      <span
        aria-hidden="true"
        className={`${frame} grid grid-cols-3 gap-[3px] border-border-interactive bg-surface-overlay p-1.5`}
      >
        {[0, 3, 1, 3, 0, 3, 1, 3, 3].map((tone, i) => (
          <span
            key={i}
            className={
              tone === 0 ? 'bg-accent' : tone === 1 ? 'bg-accent-alt' : 'bg-border'
            }
          />
        ))}
      </span>
    );
  }

  // `page` and everything else: a sheet of paper with a few ruled lines.
  return (
    <span
      aria-hidden="true"
      // The design draws paper as a white rectangle, which only reads as paper on a dark
      // desktop. Surface tokens invert with the theme, so the sheet stays a sheet in both.
      className={`${frame} items-end border-border-interactive bg-surface-raised p-1`}
    >
      <span className="ruled-lines h-3.5 w-full" />
    </span>
  );
}
