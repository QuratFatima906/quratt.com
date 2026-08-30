import type { ReactNode } from 'react';

import type { WindowIcon } from '@/lib/windows';

/**
 * One mark per window, drawn on a 24×24 grid and stroked in `currentColor`.
 *
 * SVG rather than the boxes-and-borders these used to be: the same drawing has to hold up at
 * 14px in the dock and 24px on the desktop, and a border-and-padding shape does not scale —
 * it just gets a chunkier border.
 *
 * The marks say what the window *is*, not what kind of file it is. The tile around them
 * already says "file"; a page icon inside a page-shaped tile would say it twice.
 */
const MARKS: Record<WindowIcon, ReactNode> = {
  // about.md — a person.
  person: (
    <>
      <circle cx="12" cy="8.5" r="3.4" />
      <path d="M5 19.5c0-3.7 3.1-5.6 7-5.6s7 1.9 7 5.6" />
    </>
  ),
  // projects/ — a folder, the one shape that was already right.
  folder: <path d="M3.5 18.6V6.9a1 1 0 0 1 1-1h4.3l1.9 2.4h8.8a1 1 0 0 1 1 1v9.3a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />,
  // writes.md — a nib, mid-stroke.
  pen: (
    <>
      <path d="M4 20.2l1.3-4.4L15.7 5.4a2.1 2.1 0 0 1 3 3L8.4 18.9z" />
      <path d="M13.6 7.5l3 3" />
    </>
  ),
  // talks.md — a microphone on its arc.
  mic: (
    <>
      <rect x="9" y="2.8" width="6" height="10.4" rx="3" />
      <path d="M5.4 11.3a6.6 6.6 0 0 0 13.2 0" />
      <path d="M12 17.9v3.3" />
    </>
  ),
  // reads.md — an open book.
  book: (
    <>
      <path d="M3.5 5.2h5.2a3.3 3.3 0 0 1 3.3 3.3v11a2.6 2.6 0 0 0-2.6-2.6H3.5z" />
      <path d="M20.5 5.2h-5.2A3.3 3.3 0 0 0 12 8.5v11a2.6 2.6 0 0 1 2.6-2.6h5.9z" />
    </>
  ),
  // community.md — two people, one behind the other. A chapter is other people.
  people: (
    <>
      <circle cx="9.5" cy="8.6" r="3.2" />
      <path d="M3.4 19.4c0-3.4 2.7-5.2 6.1-5.2s6.1 1.8 6.1 5.2" />
      <path d="M16 5.8a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17.4 14.6c2.1.5 3.2 2.2 3.2 4.8" />
    </>
  ),
  // now.txt — a clock, because "now" is a timestamp.
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 6.6v5.7l3.6 2.1" />
    </>
  ),
  // uses.txt — sliders. A setup is a set of settings.
  sliders: (
    <>
      <path d="M3.5 7h9M17.5 7h3M3.5 12h3M11.5 12h9M3.5 17h8M16.5 17h4" />
      <circle cx="15" cy="7" r="2.1" />
      <circle cx="9" cy="12" r="2.1" />
      <circle cx="14" cy="17" r="2.1" />
    </>
  ),
  // resume.pdf — a download, since the button under it is the point of the window.
  download: (
    <>
      <path d="M12 3.6v10.8" />
      <path d="M7.6 10.4L12 14.8l4.4-4.4" />
      <path d="M4.4 19.4h15.2" />
    </>
  ),
  // say-hi.eml — an envelope.
  mail: (
    <>
      <rect x="3" y="5.4" width="18" height="13.2" rx="1.6" />
      <path d="M3.6 7l8.4 6.4L20.4 7" />
    </>
  ),
  // entropy.exe — the toy's own 3×3 grid, which was already the right idea.
  grid: (
    <>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={4 + col * 6}
            y={4 + row * 6}
            width="4"
            height="4"
            rx="0.8"
            fill="currentColor"
            stroke="none"
          />
        )),
      )}
    </>
  ),
};

/**
 * The tile a window is drawn on — shared by the desktop icons and the dock, so a window looks
 * like itself in both. `small` is the dock's 40px-tall variant of the same drawing.
 *
 * Always decorative: every caller already names the window in text or in an `aria-label`, and
 * a screen reader announcing "image" between them would only be noise.
 */
export function Glyph({ icon, small = false }: { icon: WindowIcon; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex flex-none items-center justify-center rounded-sm border border-border-interactive bg-surface-raised text-text-secondary ${
        small ? 'h-[26px] w-[22px]' : 'h-11 w-[38px]'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        // Heavier at the small size: a 1.75 stroke on a 24-unit grid drawn into 14px lands
        // near half a pixel, which the rasteriser turns into grey mush.
        strokeWidth={small ? 2.3 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={small ? 'size-3.5' : 'size-6'}
      >
        {MARKS[icon]}
      </svg>
    </span>
  );
}
