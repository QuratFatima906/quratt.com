'use client';

import { useId, useState, type ReactNode } from 'react';

import { windowDef, type WindowKey } from '@/lib/windows';

import { useOs } from './window-manager';

/**
 * The one thing that opens a window — shared by the menu bar, the overflow panel, the desktop
 * icons and the dock, so the disabled treatment (D8) cannot drift between them.
 *
 * Unavailable windows stay in the tab order. `disabled` would remove them, and then the only
 * way to discover *why* an item is greyed out is to already know. `aria-disabled` keeps them
 * reachable and announced; the click handler is what actually refuses to open anything.
 */
export function Launcher({
  windowKey,
  className,
  disabledClassName,
  tooltipClassName = 'top-full left-0 mt-1',
  ariaLabel,
  plain = false,
  children,
}: {
  windowKey: WindowKey;
  className?: string;
  /** Applied *instead of* nothing — the unavailable look, on top of `className`. */
  disabledClassName?: string;
  /** Where the tooltip sits relative to the trigger. */
  tooltipClassName?: string;
  /** The accessible name when `children` is an icon with no text of its own. */
  ariaLabel?: string;
  /** The menu form: show `menuLabel` (no file-type suffix) instead of `label`. */
  plain?: boolean;
  children?: ReactNode;
}) {
  const def = windowDef(windowKey);
  const { openWindow } = useOs();
  const tipId = useId();
  const [tip, setTip] = useState(false);

  if (def.available) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        className={className}
        onClick={() => openWindow(def.key)}
      >
        {children ?? (plain ? def.menuLabel : def.label)}
      </button>
    );
  }

  return (
    // The wrapper owns the pointer handlers so moving onto the tooltip itself does not dismiss
    // it — WCAG 2.2 SC 1.4.13 asks for hoverable, dismissible, persistent.
    <span
      className="relative inline-flex"
      onPointerEnter={() => setTip(true)}
      onPointerLeave={() => setTip(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && tip) {
          event.stopPropagation();
          setTip(false);
        }
      }}
    >
      <button
        type="button"
        aria-disabled="true"
        aria-label={ariaLabel}
        aria-describedby={tip ? tipId : undefined}
        className={`${className ?? ''} ${disabledClassName ?? ''} cursor-not-allowed`}
        onClick={(event) => event.preventDefault()}
        onFocus={() => setTip(true)}
        onBlur={() => setTip(false)}
      >
        {children ?? (plain ? def.menuLabel : def.label)}
      </button>
      {tip && (
        <span
          role="tooltip"
          id={tipId}
          className={`pointer-events-none absolute z-9999 rounded border border-border bg-surface-overlay px-2 py-1 font-mono text-[10px] whitespace-nowrap text-text shadow-lg ${tooltipClassName}`}
        >
          coming soon
        </span>
      )}
    </span>
  );
}
