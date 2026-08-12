'use client';

import { windowDef } from '@/lib/windows';

import { useOs } from './window-manager';

/**
 * A mirror of the window manager's `open` array — same order, same membership. It is the only
 * way to reach a window buried under another one without dragging (WCAG 2.2 SC 2.5.7).
 */
export function Taskbar() {
  const { open, openWindow, closeWindow } = useOs();

  return (
    <nav
      aria-label="Open windows"
      className="absolute inset-x-0 bottom-0 z-9000 flex h-10 items-center gap-2 border-t border-border bg-surface-chrome/95 px-3 font-mono text-[11px]"
    >
      <span className="hidden flex-none border-r border-border pr-1.5 text-[9.5px] tracking-[0.1em] text-text-muted uppercase sm:block">
        open
      </span>
      <ul className="flex min-w-0 list-none items-center gap-1.5 overflow-x-auto">
        {open.map((key) => {
          const def = windowDef(key);
          return (
            <li key={key} className="flex flex-none items-center rounded-md border border-border bg-surface-raised">
              <button
                type="button"
                onClick={() => openWindow(key)}
                className="flex cursor-pointer items-center gap-2 py-1.5 pr-1.5 pl-2.5 whitespace-nowrap text-text"
              >
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                {def.label}
              </button>
              <button
                type="button"
                aria-label={`Close ${def.label}`}
                onClick={() => closeWindow(key)}
                className="mr-1.5 flex size-4 cursor-pointer items-center justify-center rounded-sm bg-surface-hover text-[11px] leading-none text-text-secondary transition-colors duration-150 hover:bg-danger hover:text-on-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          );
        })}
        {open.length === 0 && (
          <li className="whitespace-nowrap text-text-muted">
            nothing open — click an icon, or use the menu bar
          </li>
        )}
      </ul>
      <span className="ml-auto hidden flex-none text-text-muted lg:block">
        {open.length} window{open.length === 1 ? '' : 's'}
      </span>
    </nav>
  );
}
