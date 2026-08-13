import type { ReactNode } from 'react';

/**
 * A cross-window link.
 *
 * The design draws these as `data-open="cv"` — they raise another window rather than navigate,
 * and that is what the shell's delegated handler does with the attribute. The `href` is here so
 * the control is a real link: middle-click, copy-link and a crawler all get a URL, and once P5
 * builds the routes that URL resolves on its own.
 *
 * Emitting an attribute rather than calling `useOs()` is what keeps `components/windows/` free
 * of any OS import, so the same components can serve routes and markdown twins unchanged.
 *
 * `prefetch` is off deliberately: Next would otherwise warm a route that does not exist yet and
 * log a 404 to the console for every one of these on screen. A plain anchor is used rather than
 * `next/link` for the same reason — until P5, there is nothing to prefetch.
 */
export function OpenLink({
  window,
  href,
  className,
  children,
}: {
  /** Registry key of the window to raise. */
  window: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} data-open={window} className={className}>
      {children}
    </a>
  );
}
