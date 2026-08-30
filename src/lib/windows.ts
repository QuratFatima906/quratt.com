/**
 * The window registry — the single source of truth for what the OS can open (D8).
 *
 * The menu bar, the desktop icons and the dock all read this one array, which is what
 * keeps them from drifting apart: the design carried the same list twice, as `MENU` and
 * `LABELS`. Availability comes from the table in `docs/CONTENT.md`; P5 attaches the routes.
 */

export type WindowKey =
  | 'about'
  | 'projects'
  | 'writes'
  | 'talks'
  | 'reads'
  | 'now'
  | 'uses'
  | 'resume'
  | 'contact'
  | 'toy';

/** One per window — the dock shows all ten at once, so no two may share a mark. */
export type WindowIcon =
  | 'person'
  | 'folder'
  | 'pen'
  | 'mic'
  | 'book'
  | 'clock'
  | 'sliders'
  | 'download'
  | 'mail'
  | 'grid';

export type WindowDef = {
  readonly key: WindowKey;
  /** What the OS calls the window everywhere it appears. Also its filename in the design. */
  readonly label: string;
  /** The plain name the menu bar shows — no `.md`, `/`, `.txt` file-type suffix (D-something). */
  readonly menuLabel: string;
  readonly icon: WindowIcon;
  /** The URL that focuses this window (D4). `null` for a window that has no URL at all. */
  readonly route: string | null;
  /** `false` renders the launcher disabled with a "coming soon" tooltip (D13). */
  readonly available: boolean;
  /** How wide the window opens. Clamped to the real viewport on open, and irrelevant below
   *  the `md` breakpoint where windows become sheets. There is no `x`/`y`: every window opens
   *  centred (feedback.md #5). Widths grew when the site went all-monospace — a mono line is
   *  ~18% wider than the proportional one these were measured against. */
  readonly width: number;
};

export const WINDOWS: readonly WindowDef[] = [
  { key: 'about', label: 'about.md', menuLabel: 'about', icon: 'person', route: '/about', available: true, width: 540 }, // prettier-ignore
  { key: 'projects', label: 'projects/', menuLabel: 'projects', icon: 'folder', route: '/projects', available: false, width: 420 }, // prettier-ignore
  // The route map calls this `/writing`; the design calls the window `writes.md`. Both stay.
  { key: 'writes', label: 'writes.md', menuLabel: 'writes', icon: 'pen', route: '/writing', available: false, width: 420 }, // prettier-ignore
  { key: 'talks', label: 'talks.md', menuLabel: 'talks', icon: 'mic', route: '/talks', available: false, width: 430 }, // prettier-ignore
  { key: 'reads', label: 'reads.md', menuLabel: 'reads', icon: 'book', route: '/reads', available: false, width: 360 }, // prettier-ignore
  { key: 'now', label: 'now.txt', menuLabel: 'now', icon: 'clock', route: '/now', available: true, width: 400 }, // prettier-ignore
  { key: 'uses', label: 'uses.txt', menuLabel: 'uses', icon: 'sliders', route: '/uses', available: true, width: 460 }, // prettier-ignore
  // `cv` became `resume` in D12 — key, label and route all changed, and no `/cv` is kept.
  { key: 'resume', label: 'resume.pdf', menuLabel: 'resume', icon: 'download', route: '/resume', available: true, width: 480 }, // prettier-ignore
  { key: 'contact', label: 'say-hi.eml', menuLabel: 'say-hi', icon: 'mail', route: '/contact', available: true, width: 360 }, // prettier-ignore
  // The route map in ARCHITECTURE.md does not name the toy, and P5 decided it stays that way:
  // it holds no content, so a URL for it would be an indexable page with nothing to read on it.
  // It opens as a background window only.
  { key: 'toy', label: 'entropy.exe', menuLabel: 'entropy', icon: 'grid', route: null, available: true, width: 220 }, // prettier-ignore
];

/** What sits on the desktop itself, in the design's order. */
export const DESKTOP_ICONS: readonly WindowKey[] = ['about', 'resume', 'toy'];

/**
 * What the menu bar lists, in the design's order. The contact window is deliberately absent:
 * it is reachable as the email icon beside the wallpaper picker, so a `say-hi` text row in
 * the middle of the sections would be a second, redundant way to reach the same window.
 */
export const MENU_KEYS: readonly WindowKey[] = [
  'about',
  'projects',
  'writes',
  'talks',
  'reads',
  'now',
  'uses',
  'resume',
  'toy',
];

const BY_KEY = new Map(WINDOWS.map((w) => [w.key, w]));

export function windowDef(key: WindowKey): WindowDef {
  const def = BY_KEY.get(key);
  if (!def) throw new Error(`unknown window: ${key}`);
  return def;
}

/**
 * The window a URL names — the *focused* window (D4). `null` for `/`, which focuses nothing.
 *
 * Nested routes belong to their parent's window: `/projects/quietwatch` is still the
 * `projects/` window, showing one project instead of the grid. That is why this reads the
 * registry rather than a second table — one list of routes, and it is the one the menu bar,
 * the dock and the sitemap already agree on.
 */
export function keyForPath(pathname: string): WindowKey | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const match = WINDOWS.find(
    (w) => w.route !== null && (path === w.route || path.startsWith(`${w.route}/`)),
  );
  return match?.key ?? null;
}

/**
 * A window whose launcher is disabled (D13) still has working routes — the URLs must not break
 * the day the owner flips the flag — but it has no real content yet, so it is kept out of the
 * index and out of the sitemap. Indexing a placeholder is worse than not being indexed.
 */
export function isIndexable(key: WindowKey): boolean {
  return windowDef(key).available;
}
