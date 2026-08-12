'use client';

import { WINDOWS } from '@/lib/windows';

import { DesktopIcons } from './desktop-icons';
import { MenuBar } from './menu-bar';
import { Taskbar } from './taskbar';
import { Window } from './window';
import { OsProvider, useOs } from './window-manager';

export function Desktop() {
  return (
    <OsProvider>
      <Surface />
    </OsProvider>
  );
}

function Surface() {
  const { open, wallpaper } = useOs();

  return (
    <div
      data-desktop=""
      className={`relative h-dvh w-full overflow-hidden bg-surface text-text select-none wall-${wallpaper}`}
    >
      <MenuBar />
      {/*
        ARCHITECTURE.md puts `<main>` on the focused window, but "focused" means "named by the
        route", and there are no routes until P5 — so in this phase the desktop itself is the
        main landmark. P5 moves it onto the routed window; nothing else has to change.
      */}
      <main aria-label="Desktop">
        {/* The desktop's own heading. P4's windows carry their own; P5 decides which one wins
            on a route that names a window. Until then this keeps `/` from having none. */}
        <h1 className="sr-only">Qurat ul ain Fatima — qurat.os</h1>
        <DesktopIcons />
        {/*
          Rendered in registry order, stacked by z-index. Mapping the `open` array directly
          would reorder the DOM on every raise, and moving a node re-runs its `@starting-style`
          entrance — so every click on a background window would flash it back in.
        */}
        {WINDOWS.filter((def) => open.includes(def.key)).map((def) => (
          <Window key={def.key} def={def} stack={open.indexOf(def.key)} />
        ))}
      </main>
      <Taskbar />
    </div>
  );
}
