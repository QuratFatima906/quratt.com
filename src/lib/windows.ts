/**
 * The window registry — the single source of truth for what the OS can open (D8).
 *
 * The menu bar, the desktop icons and the taskbar all read this one array, which is what
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

/** Only the three desktop icons draw a shape; the rest carry an icon for P4 and P5 to use. */
export type WindowIcon = 'page' | 'folder' | 'pdf' | 'mail' | 'app';

export type WindowDef = {
  readonly key: WindowKey;
  /** What the OS calls the window everywhere it appears. Also its filename in the design. */
  readonly label: string;
  readonly icon: WindowIcon;
  /** P5 owns routing; this is the URL that will focus the window. */
  readonly route: string;
  /** `false` renders the launcher disabled with a "coming soon" tooltip (D13). */
  readonly available: boolean;
  /** Opening geometry, in the design's 1280×820 desktop. Clamped to the real viewport on
   *  open, and irrelevant below the `md` breakpoint where windows become sheets. */
  readonly width: number;
  readonly x: number;
  readonly y: number;
};

export const WINDOWS: readonly WindowDef[] = [
  { key: 'about', label: 'about.md', icon: 'page', route: '/about', available: true, width: 540, x: 44, y: 72 }, // prettier-ignore
  { key: 'projects', label: 'projects/', icon: 'folder', route: '/projects', available: true, width: 420, x: 604, y: 404 }, // prettier-ignore
  // The route map calls this `/writing`; the design calls the window `writes.md`. Both stay.
  { key: 'writes', label: 'writes.md', icon: 'page', route: '/writing', available: false, width: 420, x: 604, y: 72 }, // prettier-ignore
  { key: 'talks', label: 'talks.md', icon: 'page', route: '/talks', available: false, width: 430, x: 250, y: 150 }, // prettier-ignore
  { key: 'reads', label: 'reads.md', icon: 'page', route: '/reads', available: false, width: 360, x: 700, y: 170 }, // prettier-ignore
  { key: 'now', label: 'now.txt', icon: 'page', route: '/now', available: true, width: 220, x: 1044, y: 400 }, // prettier-ignore
  { key: 'uses', label: 'uses.txt', icon: 'page', route: '/uses', available: true, width: 360, x: 330, y: 300 }, // prettier-ignore
  // `cv` became `resume` in D12 — key, label and route all changed, and no `/cv` is kept.
  { key: 'resume', label: 'resume.pdf', icon: 'pdf', route: '/resume', available: true, width: 400, x: 420, y: 120 }, // prettier-ignore
  { key: 'contact', label: 'say-hi.eml', icon: 'mail', route: '/contact', available: true, width: 360, x: 760, y: 430 }, // prettier-ignore
  // The route map in ARCHITECTURE.md does not name the toy. `/entropy` is the obvious slug;
  // P5 decides whether a toy deserves a URL at all.
  { key: 'toy', label: 'entropy.exe', icon: 'app', route: '/entropy', available: true, width: 220, x: 1044, y: 72 }, // prettier-ignore
];

/** What sits on the desktop itself, in the design's order. */
export const DESKTOP_ICONS: readonly WindowKey[] = ['about', 'resume', 'toy'];

const BY_KEY = new Map(WINDOWS.map((w) => [w.key, w]));

export function windowDef(key: WindowKey): WindowDef {
  const def = BY_KEY.get(key);
  if (!def) throw new Error(`unknown window: ${key}`);
  return def;
}
