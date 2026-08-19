'use client';

import { useCallback, type MouseEvent, type ReactNode } from 'react';

import { WINDOWS, type WindowKey } from '@/lib/windows';

const isWindowKey = (value: string): value is WindowKey =>
  WINDOWS.some((def) => def.key === value);

import { DesktopIcons } from './desktop-icons';
import { MenuBar } from './menu-bar';
import { Dock } from './dock';
import { Window } from './window';
import { OsProvider, useOs } from './window-manager';

/**
 * Window bodies are rendered on the server and handed down as elements. That is what lets
 * `components/windows/*` stay pure and free of any OS import — they never learn that a window
 * manager exists, so the routes reuse the same components and P6 will reuse them again.
 */
export type WindowBodies = Partial<Record<WindowKey, ReactNode>>;

/**
 * `children` is the focused window: the one the URL names, rendered by the route's `page.tsx`
 * on the server (D4). Everything in `bodies` is a background window, rendered from the payload
 * the layout already fetched, and only when the visitor opens it.
 */
export function Desktop({ bodies, children }: { bodies: WindowBodies; children?: ReactNode }) {
  return (
    <OsProvider>
      <Surface bodies={bodies}>{children}</Surface>
    </OsProvider>
  );
}

function Surface({ bodies, children }: { bodies: WindowBodies; children?: ReactNode }) {
  const { open, focused, wallpaper, openWindow } = useOs();

  /**
   * Window bodies link to each other with `<OpenLink>`, which renders a real anchor carrying
   * `data-open`. Delegating here means those components never import the window manager —
   * they emit an attribute and the shell decides what it means, which is what lets the same
   * components serve routes and markdown twins untouched.
   *
   * A click inside the desktop opens a *background* window rather than navigating: the URL
   * names one window and the rest are client state (D4), so following the href here would
   * collapse the desktop to a single window at a time. The href is still what a crawler,
   * a middle-click and a JavaScript-free visitor get.
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

  const windows = (
    <>
      <DesktopIcons />
      {/* The focused window comes first in the DOM: it is the page's content, and a reader
          without CSS should meet it before the windows stacked behind it. */}
      {children}
      {/*
        Rendered in registry order, stacked by z-index. Mapping the `open` array directly
        would reorder the DOM on every raise, and moving a node re-runs its `@starting-style`
        entrance — so every click on a background window would flash it back in.
      */}
      {WINDOWS.filter((def) => def.key !== focused && open.includes(def.key)).map((def) => (
        <Window key={def.key} def={def}>
          {bodies[def.key]}
        </Window>
      ))}
    </>
  );

  return (
    <div
      data-desktop=""
      onClick={onOpenLink}
      className={`relative h-dvh w-full overflow-hidden bg-surface text-text select-none wall-${wallpaper}`}
    >
      <MenuBar />
      {/*
        `<main>` belongs to the focused window (ARCHITECTURE.md#accessibility), which renders it
        itself. `/` focuses nothing, so there the desktop *is* the document and takes the
        landmark and the page's one `h1` back.
      */}
      {focused ? (
        windows
      ) : (
        <main aria-label="Desktop">
          <h1 className="sr-only">Qurat ul Ain Fatima — qurat</h1>
          {windows}
        </main>
      )}
      <Dock />
    </div>
  );
}
