'use client';

import { useCallback, type MouseEvent, type ReactNode } from 'react';

import { WINDOWS, type WindowKey } from '@/lib/windows';

const isWindowKey = (value: string): value is WindowKey =>
  WINDOWS.some((def) => def.key === value);

import { DesktopIcons } from './desktop-icons';
import { MenuBar } from './menu-bar';
import { Taskbar } from './taskbar';
import { Window } from './window';
import { OsProvider, useOs } from './window-manager';

/**
 * Window bodies are rendered on the server and handed down as elements. That is what lets
 * `components/windows/*` stay pure and free of any OS import — they never learn that a window
 * manager exists, so P5 can reuse the same components for routes and P6 for markdown twins.
 */
export type WindowBodies = Partial<Record<WindowKey, ReactNode>>;

export function Desktop({ bodies }: { bodies: WindowBodies }) {
  return (
    <OsProvider>
      <Surface bodies={bodies} />
    </OsProvider>
  );
}

function Surface({ bodies }: { bodies: WindowBodies }) {
  const { open, wallpaper, openWindow } = useOs();

  /**
   * Window bodies link to each other with `<OpenLink>`, which renders a real anchor carrying
   * `data-open`. Delegating here means those components never import the window manager —
   * they emit an attribute and the shell decides what it means, which is what lets the same
   * components serve routes in P5 and markdown twins in P6 untouched.
   *
   * Modified clicks are left alone so open-in-new-tab keeps working, and P5 will extend this
   * to push the route as well as raise the window.
   */
  const onOpenLink = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const link = (event.target as Element).closest<HTMLElement>('[data-open]');
      const key = link?.dataset.open;
      if (!key || !isWindowKey(key)) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

      event.preventDefault();
      openWindow(key);
    },
    [openWindow],
  );

  return (
    <div
      data-desktop=""
      onClick={onOpenLink}
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
          <Window key={def.key} def={def} stack={open.indexOf(def.key)}>
            {bodies[def.key]}
          </Window>
        ))}
      </main>
      <Taskbar />
    </div>
  );
}
