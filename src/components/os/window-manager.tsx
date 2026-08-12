'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { WindowKey } from '@/lib/windows';

export type Wallpaper = 'dots' | 'grid' | 'gradient';

type Os = {
  /** Open windows in stacking order — last is on top. Also exactly what the taskbar shows. */
  open: readonly WindowKey[];
  /** Which window should take focus, and a nonce so re-opening an open window re-focuses it. */
  focus: { key: WindowKey; nonce: number } | null;
  openWindow: (key: WindowKey) => void;
  closeWindow: (key: WindowKey) => void;
  closeAll: () => void;
  raise: (key: WindowKey) => void;
  wallpaper: Wallpaper;
  setWallpaper: (wallpaper: Wallpaper) => void;
};

const OsContext = createContext<Os | null>(null);

export function useOs(): Os {
  const os = useContext(OsContext);
  if (!os) throw new Error('useOs must be used inside <OsProvider>');
  return os;
}

export function OsProvider({
  children,
  initialOpen = ['about'],
}: {
  children: ReactNode;
  /** `about.md` is open on first load (Q14). */
  initialOpen?: readonly WindowKey[];
}) {
  const [open, setOpen] = useState<readonly WindowKey[]>(initialOpen);
  const [focus, setFocus] = useState<Os['focus']>(null);
  const [wallpaper, setWallpaper] = useState<Wallpaper>('dots');

  /**
   * Focus must return to whatever opened the window (ARCHITECTURE.md#accessibility). The
   * opener is simply whatever had focus at the moment of opening — a menu item, a desktop
   * icon, or a link inside another window — so there is nothing to register or thread
   * through props.
   */
  const openers = useRef(new Map<WindowKey, HTMLElement>());

  const openWindow = useCallback((key: WindowKey) => {
    if (document.activeElement instanceof HTMLElement) {
      openers.current.set(key, document.activeElement);
    }
    setOpen((current) => [...current.filter((k) => k !== key), key]);
    setFocus((current) => ({ key, nonce: (current?.nonce ?? 0) + 1 }));
  }, []);

  const closeWindow = useCallback((key: WindowKey) => {
    setOpen((current) => current.filter((k) => k !== key));
    setFocus((current) => (current?.key === key ? null : current));
    const opener = openers.current.get(key);
    openers.current.delete(key);
    // The opener may itself be disappearing (a taskbar entry closing its own window), so the
    // focus attempt waits for the commit and checks the element is still in the document.
    requestAnimationFrame(() => {
      if (opener?.isConnected) opener.focus();
    });
  }, []);

  const closeAll = useCallback(() => {
    openers.current.clear();
    setOpen([]);
    setFocus(null);
  }, []);

  /** Clicking a window raises it, but does not steal focus — the click already moved it. */
  const raise = useCallback((key: WindowKey) => {
    setOpen((current) =>
      current.at(-1) === key ? current : [...current.filter((k) => k !== key), key],
    );
  }, []);

  const value = useMemo(
    () => ({ open, focus, openWindow, closeWindow, closeAll, raise, wallpaper, setWallpaper }),
    [open, focus, openWindow, closeWindow, closeAll, raise, wallpaper],
  );

  return <OsContext.Provider value={value}>{children}</OsContext.Provider>;
}
