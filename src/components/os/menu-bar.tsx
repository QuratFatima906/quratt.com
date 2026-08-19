'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MENU_KEYS, windowDef } from '@/lib/windows';

import { Launcher } from './launcher';
import { WallpaperPicker } from './wallpaper-picker';

const ITEM = 'cursor-pointer whitespace-nowrap text-text-secondary hover:text-accent';
// `!` because it has to beat the hover colour the shared item class already carries; the
// two rules are otherwise equally specific and the winner would depend on emit order.
const DIM = 'text-text-muted! opacity-55';
const PANEL_ITEM =
  'w-full cursor-pointer rounded px-2.5 py-1.5 text-left whitespace-nowrap text-text hover:bg-surface-hover';

/**
 * Did this click actually use the panel? A disabled item did nothing, so the panel stays put
 * and its tooltip stays readable.
 */
const used = (event: React.MouseEvent) =>
  !(event.target as Element).closest('[aria-disabled="true"]');

/** Close a panel on Escape or on a click that lands outside it. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, close]);
  return ref;
}

export function MenuBar() {
  const navRef = useRef<HTMLElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(MENU_KEYS.length);
  const [overflow, setOverflow] = useState(false);
  const [menu, setMenu] = useState(false);

  const closeOverflow = useCallback(() => setOverflow(false), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const overflowRef = useDismiss(overflow, closeOverflow);
  const menuRef = useDismiss(menu, closeMenu);
  const overflowToggle = useRef<HTMLButtonElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);

  /**
   * How many menu items fit. Measured off a hidden probe holding every label at full width,
   * because the rendered row is already truncated and cannot answer the question.
   */
  const measure = useCallback(() => {
    const nav = navRef.current;
    const probe = probeRef.current;
    if (!nav || !probe) return;
    const available = nav.clientWidth;
    // Zero while the nav is display:none (mobile). The observer fires again when it is not.
    if (!available) return;
    const widths = Array.from(probe.children, (el) => el.getBoundingClientRect().width);
    if (!widths[0]) return;

    const gap = parseFloat(getComputedStyle(nav).columnGap) || 0;
    const moreWidth = widths[MENU_KEYS.length] ?? 0;
    let used = 0;
    let n = 0;
    for (let i = 0; i < MENU_KEYS.length; i++) {
      const need = used + (i ? gap : 0) + (widths[i] ?? 0);
      if (need > available) break;
      used = need;
      n++;
    }
    // Anything hidden needs a `more` button, which itself has to fit — so give items back
    // until it does.
    if (n < MENU_KEYS.length) {
      while (n > 0 && used + gap + moreWidth > available) {
        used -= (widths[n - 1] ?? 0) + (n > 1 ? gap : 0);
        n--;
      }
    }
    setFit(n);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    measure();
    // The first measurement runs against the fallback face; the mono face is wider, so
    // without this the bar shows one item too many until something else resizes it.
    let live = true;
    void document.fonts?.ready.then(() => live && measure());
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [measure]);

  const hidden = MENU_KEYS.slice(fit);

  return (
    <header className="absolute inset-x-0 top-0 z-9000 flex h-9 items-center gap-3 border-b border-border bg-surface-chrome px-3.5 font-mono text-[11px] tracking-[0.03em]">
      {/* The logo, not a menu item — so it gets its own margin on top of the row's gap, and
          a divider's worth of air between it and the first section. It routes to `/`, which
          is the desktop with nothing focused; open windows stay open, as they would on a
          real machine. */}
      <Link
        href="/"
        className="mr-3 flex-none font-bold tracking-[0.08em] text-accent transition-colors duration-150 hover:text-accent-hover"
      >
        qurat
      </Link>

      <nav
        ref={navRef}
        aria-label="Sections"
        // Clipped horizontally so an unmeasured row cannot spill into the clock, but open
        // downwards — `overflow-hidden` would swallow the "coming soon" tooltip. The pair
        // (clip, visible) is legal where (hidden, visible) would coerce to a scroll box.
        className="relative hidden min-w-0 flex-1 items-center gap-3 overflow-x-clip overflow-y-visible md:flex"
      >
        {MENU_KEYS.slice(0, fit).map((key) => (
          <Launcher key={key} windowKey={key} plain className={`flex-none ${ITEM}`} disabledClassName={DIM} />
        ))}
        {hidden.length > 0 && (
          <div ref={overflowRef} className="flex-none">
            <button
              type="button"
              ref={overflowToggle}
              aria-expanded={overflow}
              onClick={() => setOverflow((o) => !o)}
              className="cursor-pointer whitespace-nowrap text-accent-alt hover:text-accent"
            >
              more ({hidden.length}) <span aria-hidden="true">▾</span>
            </button>
            {overflow && (
              <div
                data-overflow-panel=""
                onClickCapture={(e) => used(e) && overflowToggle.current?.focus()}
                onClick={(e) => used(e) && setOverflow(false)}
                className="absolute top-8 left-0 z-9500 flex min-w-44 flex-col gap-px rounded-lg border border-border bg-surface-chrome p-1.5 shadow-xl"
              >
                {hidden.map((key) => (
                  <Launcher
                    key={key}
                    windowKey={key}
                    plain
                    className={PANEL_ITEM}
                    disabledClassName="text-text-muted! opacity-55 hover:bg-transparent!"
                    tooltipClassName="top-1/2 left-full ml-2 -translate-y-1/2"
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <div
          ref={probeRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute top-0 left-0 flex gap-3 whitespace-nowrap"
        >
          {MENU_KEYS.map((key) => (
            <span key={key}>{windowDef(key).menuLabel}</span>
          ))}
          <span>more ({MENU_KEYS.length}) ▾</span>
        </div>
      </nav>

      <div className="ml-auto flex flex-none items-center gap-2.5">
        <Launcher
          windowKey="contact"
          ariaLabel="say hi"
          className="flex size-6 cursor-pointer items-center justify-center rounded border border-border text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          <MailIcon />
        </Launcher>
        <WallpaperPicker className="hidden md:flex" />
        <Divider className="hidden md:block" />
        <Clock />
        <ThemeToggle />

        <div ref={menuRef} className="md:hidden">
          <button
            type="button"
            ref={menuToggle}
            aria-expanded={menu}
            aria-label="Menu"
            onClick={() => setMenu((m) => !m)}
            className="flex size-7 cursor-pointer items-center justify-center rounded border border-border text-text-secondary"
          >
            <span aria-hidden="true">☰</span>
          </button>
          {menu && (
            <nav
              aria-label="Sections"
              onClickCapture={(e) => used(e) && menuToggle.current?.focus()}
              onClick={(e) => used(e) && setMenu(false)}
              className="absolute top-9 right-2 left-2 z-9500 flex flex-col gap-px rounded-lg border border-border bg-surface-chrome p-1.5 shadow-xl"
            >
              {MENU_KEYS.map((key) => (
                <Launcher
                  key={key}
                  windowKey={key}
                  plain
                  className={PANEL_ITEM}
                  disabledClassName="text-text-muted! opacity-55 hover:bg-transparent!"
                  tooltipClassName="top-1/2 right-2 -translate-y-1/2"
                />
              ))}
              <div className="mt-1 flex items-center border-t border-border px-2.5 pt-2">
                <WallpaperPicker />
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

function Divider({ className }: { className?: string }) {
  return <span aria-hidden="true" className={`h-3.5 w-px bg-border ${className ?? ''}`} />;
}

/** The envelope for the say-hi icon — a bare mark, not the tile `Glyph` draws. */
function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
      aria-hidden="true"
    >
      <rect x="3" y="5.4" width="18" height="13.2" rx="1.6" />
      <path d="M3.6 7l8.4 6.4L20.4 7" />
    </svg>
  );
}

/**
 * `aria-hidden` on purpose: a clock that re-announces itself every twenty seconds is a
 * screen-reader denial of service, and the time is decoration here (ARCHITECTURE.md).
 */
function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    // `en-US` rather than the visitor's locale: the format is a design decision (12-hour with
    // a meridiem, like the machine this desktop is imitating), not a localisation of one.
    // Lower-cased because nothing else in the chrome shouts.
    const format = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const tick = () => setTime(format.format(new Date()).toLowerCase());
    tick();
    const timer = setInterval(tick, 20_000);
    return () => clearInterval(timer);
  }, []);

  // Empty until mounted, so the server's clock never mismatches the visitor's. Right-aligned
  // in a fixed slot so the hour losing its tens digit at 1pm does not shove the theme toggle.
  // `9ch` rather than the eight characters of "11:03 am", because the bar's letter-spacing is
  // charged per character and eight of them no longer fit in 8ch — it wrapped on mobile.
  return (
    <span
      aria-hidden="true"
      className="w-[9ch] flex-none text-right whitespace-nowrap text-text tabular-nums"
    >
      {time}
    </span>
  );
}
