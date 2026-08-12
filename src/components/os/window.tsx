'use client';

import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from 'react';

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
  lastY: number;
  lastAt: number;
  velocity: number;
};

export function Window({ def, index, count }: { def: WindowDef; index: number; count: number }) {
  const { focus, closeWindow, raise } = useOs();
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<Drag | null>(null);
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
      const el = ref.current;
      if (!el || drag.current) return; // ignore a second finger mid-drag, or it jumps

      const origin = readTranslate(el);
      el.dataset.dragging = 'true';
      el.style.willChange = 'translate';
      el.setPointerCapture(event.pointerId);
      drag.current = {
        pointerId: event.pointerId,
        pointerX: event.clientX,
        pointerY: event.clientY,
        originX: origin.x,
        originY: origin.y,
        lastY: event.clientY,
        lastAt: event.timeStamp,
        velocity: 0,
      };
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const el = ref.current;
      const d = drag.current;
      if (!el || !d || d.pointerId !== event.pointerId) return;

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

      const rect = el.getBoundingClientRect();
      const x = d.originX + event.clientX - d.pointerX;
      const y = d.originY + event.clientY - d.pointerY;
      // Bounds are in translate-space: how far the element may move from where it is laid out.
      const left = rect.left - d.originX;
      const top = rect.top - d.originY;
      el.style.translate = `${clamp(x, KEEP_VISIBLE - left - rect.width, window.innerWidth - KEEP_VISIBLE - left)}px ${clamp(y, MENU_BAR - top, window.innerHeight - TASKBAR - top - 32)}px`;
    },
    [isSheet],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const el = ref.current;
      const d = drag.current;
      if (!el || !d || d.pointerId !== event.pointerId) return;
      endDrag(el);
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
    [closeWindow, def.key, endDrag, isSheet],
  );

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      data-window={def.key}
      style={{
        zIndex: 20 + index,
        // The registry's coordinates are for the design's 1280×820 desktop, so they are a
        // preference, not a position — CSS clamps them into whatever viewport actually
        // exists. Doing it here rather than in an effect means no first-paint jump.
        // The lower bound clears the icon column: the design composition these coordinates
        // come from has no desktop icons, so `about` at x=44 would open on top of them.
        left: `clamp(7.5rem, ${def.x}px, calc(100vw - ${def.width}px - 1rem))`,
        top: `clamp(2.75rem, ${def.y}px, calc(100dvh - 8rem))`,
        width: def.width,
      }}
      onPointerDown={() => raise(def.key)}
      className="os-window absolute flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-border bg-surface-raised shadow-2xl max-md:inset-x-0! max-md:top-9! max-md:bottom-10! max-md:w-auto! max-md:max-w-none! md:rounded-lg"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex h-8 flex-none touch-none items-center gap-2 border-b border-border bg-surface-overlay px-2.5 font-mono text-[11px] text-text-secondary select-none md:cursor-grab"
      >
        <span id={titleId} className="tracking-[0.04em]">
          {def.label}
        </span>
        <button
          type="button"
          aria-label={`Close ${def.label}`}
          onClick={() => closeWindow(def.key)}
          className="ml-auto flex size-5 cursor-pointer items-center justify-center rounded bg-surface-hover text-xs leading-none text-text-secondary transition-colors duration-150 hover:bg-danger hover:text-on-accent"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {/* P4 fills these. The shell only owns the frame. */}
      <div className="min-h-24 overflow-auto p-6 font-mono text-xs text-text-muted">
        {def.label} — window {index + 1} of {count}
      </div>
    </section>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
