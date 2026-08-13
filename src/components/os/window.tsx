'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import type { WindowDef } from '@/lib/windows';

import { useOs } from './window-manager';

const SHEET = '(max-width: 767px)';

/** Chrome the window must not be dragged underneath. */
const MENU_BAR = 36;
const TASKBAR = 40;
/** How much of the title bar has to stay on screen horizontally. */
const KEEP_VISIBLE = 96;

function subscribeSheet(onChange: () => void) {
  const mq = window.matchMedia(SHEET);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Below `md` a window is a full-screen sheet, and the drag dismisses instead of moving (D3). */
function useIsSheet() {
  return useSyncExternalStore(
    subscribeSheet,
    () => window.matchMedia(SHEET).matches,
    () => false,
  );
}

/** Apple's resistance curve: the further past the edge, the less the sheet follows. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * overshoot);
}

/**
 * Where a flick would come to rest, from the scroll-deceleration model rather than the
 * textbook `v²/2a` — same function iOS uses to pick a snap target.
 */
function project(velocityPxPerMs: number, deceleration = 0.998) {
  return velocityPxPerMs * (deceleration / (1 - deceleration));
}

/** The live on-screen offset, so grabbing a settling sheet continues from where it *looks*. */
function readTranslate(el: HTMLElement): { x: number; y: number } {
  const value = getComputedStyle(el).translate;
  if (!value || value === 'none') return { x: 0, y: 0 };
  const [x = '0', y = '0'] = value.split(' ');
  return { x: parseFloat(x), y: parseFloat(y) };
}

type Drag = {
  pointerId: number;
  pointerX: number;
  pointerY: number;
  originX: number;
  originY: number;
  /** Where the window sits with no translate applied — the frame the bounds are expressed in. */
  layoutX: number;
  layoutY: number;
  width: number;
  height: number;
  lastY: number;
  lastAt: number;
  velocity: number;
  /** The gesture started on the title link, so a tap that never moved should navigate. */
  onLink: boolean;
};

export function Window({
  def,
  main = false,
  children,
}: {
  def: WindowDef;
  /**
   * The window the URL names. It is the page's `<main>` and carries its only `h1` (D4) — the
   * one server-rendered window on the route. Everything else on the desktop is a `<section>`.
   */
  main?: boolean;
  children: ReactNode;
}) {
  const { open, focus, closeWindow, raise } = useOs();
  const router = useRouter();
  const stack = Math.max(0, open.indexOf(def.key));
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);
  const titleId = useId();
  const isSheet = useIsSheet();

  const mine = focus?.key === def.key;
  // The nonce changes on every open, so re-opening an already-open window re-focuses it.
  const nonce = mine ? focus.nonce : null;

  useEffect(() => {
    if (nonce !== null) ref.current?.focus();
  }, [nonce]);

  const endDrag = useCallback(
    (el: HTMLElement) => {
      drag.current = null;
      delete el.dataset.dragging;
      el.style.willChange = '';
    },
    [],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      // Pointer capture retargets the following `click` at the capturing element, so starting
      // a drag from the close button would swallow its activation entirely.
      if ((event.target as Element).closest('button')) return;
      // The title link is swallowed the same way, but the whole bar has to stay draggable —
      // so the grab is allowed to start there and a tap that never moved navigates on release.
      const onLink = Boolean((event.target as Element).closest('a'));
      const el = ref.current;
      if (!el || drag.current) return; // ignore a second finger mid-drag, or it jumps

      const origin = readTranslate(el);
      const rect = el.getBoundingClientRect();
      dragged.current = false;
      el.dataset.dragging = 'true';
      el.style.willChange = 'translate';
      // Capture on the title bar, not the window: capture retargets every later pointer event
      // at the capturing element, and the window is the title bar's *ancestor* — so capturing
      // there would route the moves past these handlers instead of to them.
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        pointerId: event.pointerId,
        pointerX: event.clientX,
        pointerY: event.clientY,
        originX: origin.x,
        originY: origin.y,
        // Measured once. Deriving it per move from a rect that already includes the current
        // translate makes the bounds drift along with the window.
        layoutX: rect.left - origin.x,
        layoutY: rect.top - origin.y,
        width: rect.width,
        height: rect.height,
        lastY: event.clientY,
        lastAt: event.timeStamp,
        velocity: 0,
        onLink,
      };
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const el = ref.current;
      const d = drag.current;
      if (!el || !d || d.pointerId !== event.pointerId) return;

      // A drag that ends on the title bar still fires a click; the link must not follow it.
      if (Math.abs(event.clientX - d.pointerX) + Math.abs(event.clientY - d.pointerY) > 4) {
        dragged.current = true;
      }

      const elapsed = event.timeStamp - d.lastAt;
      if (elapsed > 0) {
        d.velocity = (event.clientY - d.lastY) / elapsed;
        d.lastY = event.clientY;
        d.lastAt = event.timeStamp;
      }

      if (isSheet) {
        const raw = d.originY + event.clientY - d.pointerY;
        // Upward has nowhere to go; resist rather than stop dead.
        const y = raw >= 0 ? raw : -rubberband(-raw, el.offsetHeight);
        el.style.translate = `0 ${y}px`;
        return;
      }

      // Bounds are in translate-space: how far the window may move from where it is laid out.
      const x = clamp(
        d.originX + event.clientX - d.pointerX,
        KEEP_VISIBLE - d.layoutX - d.width,
        window.innerWidth - KEEP_VISIBLE - d.layoutX,
      );
      const y = clamp(
        d.originY + event.clientY - d.pointerY,
        MENU_BAR - d.layoutY,
        window.innerHeight - TASKBAR - d.layoutY - 32,
      );
      el.style.translate = `${x}px ${y}px`;
    },
    [isSheet],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const el = ref.current;
      const d = drag.current;
      if (!el || !d || d.pointerId !== event.pointerId) return;
      endDrag(el);

      // `pointercancel` shares this handler, and a cancelled gesture is not a click.
      if (event.type === 'pointerup' && d.onLink && !dragged.current && def.route) {
        router.push(def.route);
        return;
      }
      if (!isSheet) return;

      const y = readTranslate(el).y;
      // A short flick should dismiss as surely as a long drag, so the decision is made on
      // where the gesture was *going*, not where the finger stopped.
      if (y > 0 && y + project(d.velocity) > el.offsetHeight * 0.45) {
        el.style.translate = '0 100%';
        const done = () => closeWindow(def.key);
        el.addEventListener('transitionend', done, { once: true });
        // The reduced-motion rule collapses the transition to 0.01ms; this catches the case
        // where it never fires at all.
        setTimeout(done, 400);
        return;
      }
      el.style.translate = '0 0';
    },
    [closeWindow, def.key, def.route, endDrag, isSheet, router],
  );

  const Frame = main ? 'main' : 'section';

  return (
    <Frame
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      data-window={def.key}
      data-focused={main ? '' : undefined}
      style={{
        zIndex: 20 + stack,
        // The registry's coordinates are for the design's 1280×820 desktop, so they are a
        // preference, not a position — CSS clamps them into whatever viewport actually
        // exists. Doing it here rather than in an effect means no first-paint jump.
        // The lower bound clears the icon column: the design composition these coordinates
        // come from has no desktop icons, so `about` at x=44 would open on top of them.
        // The window the URL names is the document, so it opens centred instead.
        left: main
          ? `clamp(1rem, calc(50vw - ${def.width / 2}px), calc(100vw - ${def.width}px - 1rem))`
          : `clamp(7.5rem, ${def.x}px, calc(100vw - ${def.width}px - 1rem))`,
        top: main ? '3.5rem' : `clamp(2.75rem, ${def.y}px, calc(100dvh - 8rem))`,
        width: def.width,
      }}
      onPointerDown={() => raise(def.key)}
      // Capped so a long document scrolls inside its own window: the desktop clips overflow,
      // so without this the end of an archive or a post would be unreachable.
      className="os-window absolute flex max-h-[calc(100dvh-6rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-border bg-surface-raised shadow-2xl max-md:inset-x-0! max-md:top-9! max-md:bottom-10! max-md:w-auto! max-md:max-h-none! max-md:max-w-none! md:rounded-lg"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex h-8 flex-none touch-none items-center gap-2 border-b border-border bg-surface-overlay px-2.5 font-mono text-[11px] text-text-secondary select-none md:cursor-grab"
      >
        {main ? (
          // The focused window is the document, so its title bar is the page's only `h1`.
          <h1 id={titleId} className="truncate text-[11px] font-normal tracking-[0.04em]">
            {def.label}
          </h1>
        ) : def.route ? (
          // A background window's title routes to it, promoting it to the focused, server
          // rendered one (ARCHITECTURE.md). A real link, so it works by keyboard and with
          // JavaScript off — and `next/link` keeps it a soft navigation when there is any.
          <Link
            id={titleId}
            href={def.route}
            draggable={false}
            onClick={(event) => dragged.current && event.preventDefault()}
            className="truncate tracking-[0.04em] hover:text-accent"
          >
            {def.label}
          </Link>
        ) : (
          <span id={titleId} className="truncate tracking-[0.04em]">
            {def.label}
          </span>
        )}
        <button
          type="button"
          aria-label={`Close ${def.label}`}
          onClick={() => closeWindow(def.key)}
          className="ml-auto flex size-5 cursor-pointer items-center justify-center rounded bg-surface-hover text-xs leading-none text-text-secondary transition-colors duration-150 hover:bg-danger hover:text-on-accent"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {/* The shell owns the frame; the body is built on the server and passed down, which is
          what keeps window components free of any OS import. */}
      <div className="min-h-24 overflow-auto">{children}</div>
    </Frame>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
