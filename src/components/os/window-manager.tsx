'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { keyForPath, type WindowKey } from '@/lib/windows';

export type Wallpaper = 'dots' | 'grid' | 'gradient';

type Os = {
  /** Open windows in stacking order — last is on top. Also exactly what the taskbar shows. */
  open: readonly WindowKey[];
  /** The window the URL names (D4). Always in `open`, and the one that renders as `<main>`. */
  focused: WindowKey | null;
  /** Which window should take focus, and a nonce so re-opening an open window re-focuses it. */
  focus: { key: WindowKey; nonce: number } | null;
  openWindow: (key: WindowKey) => void;
  closeWindow: (key: WindowKey) => void;
  closeAll: () => void;
  raise: (key: WindowKey) => void;
  wallpaper: Wallpaper;
  setWallpaper: (wallpaper: Wallpaper) => void;
  /**
   * Windows already on screen when the page loaded. They skip the entrance animation: it would
   * claim they just opened, and starting the largest text on the page at `opacity: 0` delays
   * LCP by the length of the transition.
   */
  initial: readonly WindowKey[];
};

const OsContext = createContext<Os | null>(null);

export function useOs(): Os {
  const os = useContext(OsContext);
  if (!os) throw new Error('useOs must be used inside <OsProvider>');
  return os;
}

export function OsProvider({
  children,
  initialOpen,
}: {
  children: ReactNode;
  /** Overrides the default: nothing extra on a route, `about.md` on `/` (Q14). */
  initialOpen?: readonly WindowKey[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const focused = keyForPath(pathname);

  /**
   * Only the windows the visitor opened by hand. The focused one is derived from the URL rather
   * than stored, so back and forward move focus for free — there is no state to keep in step.
   */
  const [stored, setStored] = useState<readonly WindowKey[]>(
    // Landing on a route means that window is already on screen; a second copy of `about.md`
    // underneath it would be duplicate content in the HTML as well as clutter on the desktop.
    () => initialOpen ?? (keyForPath(pathname) ? [] : ['about']),
  );
  const [focus, setFocus] = useState<Os['focus']>(null);
  const [wallpaper, setWallpaper] = useState<Wallpaper>('dots');

  const open = useMemo(
    () => (focused && !stored.includes(focused) ? [...stored, focused] : stored),
    [stored, focused],
  );

  // Captured on the first render and never updated, so it survives every later open and close.
  // `useState` rather than a ref: reading a ref during render is not safe, and this value is
  // read on every render to decide whether a window animates in.
  const [initial] = useState(open);

  /**
   * Moves a window to the top of the stack, materialising the focused window into the list on
   * the way. Without that, the URL's window would be appended last by `open` on every render
   * and nothing could ever be raised above it.
   */
  const toFront = useCallback(
    (key: WindowKey) =>
      setStored((current) => {
        const base = focused && !current.includes(focused) ? [...current, focused] : current;
        return base.at(-1) === key ? base : [...base.filter((k) => k !== key), key];
      }),
    [focused],
  );

  /**
   * Focus must return to whatever opened the window (ARCHITECTURE.md#accessibility). The
   * opener is simply whatever had focus at the moment of opening — a menu item, a desktop
   * icon, or a link inside another window — so there is nothing to register or thread
   * through props.
   */
  const openers = useRef(new Map<WindowKey, HTMLElement>());

  const openWindow = useCallback(
    (key: WindowKey) => {
      if (document.activeElement instanceof HTMLElement) {
        openers.current.set(key, document.activeElement);
      }
      toFront(key);
      setFocus((current) => ({ key, nonce: (current?.nonce ?? 0) + 1 }));
    },
    [toFront],
  );

  /**
   * Navigating from one window to another leaves the first one open, as an OS would. Doing it
   * here rather than at each call site covers back, forward and a typed URL too.
   */
  const dismissed = useRef<WindowKey | null>(null);
  const previous = useRef(focused);
  useEffect(() => {
    const prior = previous.current;
    previous.current = focused;
    // Unless the visitor closed it — then reopening it behind their back would be a bug.
    if (prior && prior !== focused && prior !== dismissed.current) {
      setStored((current) => (current.includes(prior) ? current : [...current, prior]));
    }
    dismissed.current = null;
  }, [focused]);

  const closeWindow = useCallback(
    (key: WindowKey) => {
      setStored((current) => current.filter((k) => k !== key));
      setFocus((current) => (current?.key === key ? null : current));
      // The focused window is the URL. Closing it has to be a navigation, or the address bar
      // would go on naming a window that is no longer on screen.
      if (key === focused) {
        dismissed.current = key;
        router.push('/');
      }
      const opener = openers.current.get(key);
      openers.current.delete(key);
      // The opener may itself be disappearing (a taskbar entry closing its own window), so the
      // focus attempt waits for the commit and checks the element is still in the document.
      requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus();
      });
    },
    [focused, router],
  );

  const closeAll = useCallback(() => {
    openers.current.clear();
    setStored([]);
    setFocus(null);
    if (focused) {
      dismissed.current = focused;
      router.push('/');
    }
  }, [focused, router]);

  /** Clicking a window raises it, but does not steal focus — the click already moved it. */
  const raise = toFront;

  const value = useMemo(
    () => ({
      open,
      focused,
      focus,
      openWindow,
      closeWindow,
      closeAll,
      raise,
      wallpaper,
      setWallpaper,
      initial,
    }),
    [open, focused, focus, openWindow, closeWindow, closeAll, raise, wallpaper, initial],
  );

  return <OsContext.Provider value={value}>{children}</OsContext.Provider>;
}
