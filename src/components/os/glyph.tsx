import type { WindowIcon } from '@/lib/windows';

/**
 * The shapes the OS draws for a window — a sheet of paper, a folder, a PDF, an envelope, an
 * app tile. Shared by the desktop icons and the dock so a window looks like itself in both
 * places; `small` is the dock's 40px-tall variant of the same drawing.
 *
 * Always decorative: every caller already names the window in text or in an `aria-label`,
 * and a screen reader announcing "image" between them would only be noise.
 */
export function Glyph({ icon, small = false }: { icon: WindowIcon; small?: boolean }) {
  const frame = `flex flex-none rounded-sm border border-border-interactive ${
    small ? 'h-[26px] w-[22px]' : 'h-11 w-[38px]'
  }`;

  if (icon === 'pdf') {
    return (
      <span
        aria-hidden="true"
        className={`${frame} items-center justify-center bg-surface-raised font-bold text-danger ${
          small ? 'text-[6.5px]' : 'text-[9px]'
        }`}
      >
        PDF
      </span>
    );
  }

  if (icon === 'folder') {
    return (
      <span
        aria-hidden="true"
        className={`${frame} items-end bg-surface-overlay ${small ? 'p-[3px]' : 'p-1.5'}`}
      >
        <span className="h-1/2 w-full rounded-[1px] bg-accent-alt/70" />
      </span>
    );
  }

  if (icon === 'mail') {
    return (
      <span
        aria-hidden="true"
        className={`${frame} items-center justify-center bg-surface-raised text-accent ${
          small ? 'text-[10px]' : 'text-[15px]'
        }`}
      >
        ✉
      </span>
    );
  }

  if (icon === 'app') {
    return (
      <span
        aria-hidden="true"
        className={`${frame} grid grid-cols-3 bg-surface-overlay ${
          small ? 'gap-[1.5px] p-[3px]' : 'gap-[3px] p-1.5'
        }`}
      >
        {[0, 3, 1, 3, 0, 3, 1, 3, 3].map((tone, i) => (
          <span
            key={i}
            className={tone === 0 ? 'bg-accent' : tone === 1 ? 'bg-accent-alt' : 'bg-border'}
          />
        ))}
      </span>
    );
  }

  // `page` and everything else: a sheet of paper with a few ruled lines.
  return (
    <span
      aria-hidden="true"
      // The design draws paper as a white rectangle, which only reads as paper on a dark
      // desktop. Surface tokens invert with the theme, so the sheet stays a sheet in both.
      className={`${frame} items-end bg-surface-raised ${small ? 'p-[3px]' : 'p-1'}`}
    >
      <span className={`ruled-lines w-full ${small ? 'h-2' : 'h-3.5'}`} />
    </span>
  );
}
