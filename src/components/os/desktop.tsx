'use client';

import { windowDef } from '@/lib/windows';

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
        <DesktopIcons />
        {open.map((key, i) => (
          <Window key={key} def={windowDef(key)} index={i} count={open.length} />
        ))}
      </main>
      <Taskbar />
    </div>
  );
}
