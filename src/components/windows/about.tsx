import Image from 'next/image';
import Link from 'next/link';

import portrait from '@/assets/portrait.webp';
import type { About } from '@/lib/content/schema';

/** The one external identity the design puts in this window. Also a `sameAs` entry in P6. */
const GITHUB = 'https://github.com/QuratFatima906';

/**
 * The portrait is imported rather than pathed, so Next derives the intrinsic size and the blur
 * placeholder from the file itself — which also means replacing the file busts its own cache.
 * The source is 4:5 and the slot is 100×124 (0.806), so `cover` crops a rounding error.
 */
export function AboutWindow({ about }: { about: About }) {
  return (
    <div className="px-[26px] pt-6 pb-[26px]">
      <div className="flex items-start gap-[22px]">
        <Image
          src={portrait}
          alt={`Portrait of ${about.name}`}
          sizes="100px"
          placeholder="blur"
          className="h-[124px] w-[100px] flex-none rounded-md border border-border object-cover"
        />
        <div>
          {/* The page's `h1` belongs to the desktop; a window is a section within it. */}
          <h2 className="text-[34px] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
            {about.name}
          </h2>
          <p className="mt-1.5 font-mono text-[11.5px] tracking-[0.04em] text-accent">
            {about.role}
          </p>
          <p className="mt-[3px] font-mono text-[11.5px] tracking-[0.04em] text-text-muted">
            {about.meta}
          </p>
        </div>
      </div>
      <p className="mt-5 mb-3 text-[15.5px] leading-[1.62] text-pretty">{about.bio1}</p>
      <p className="mb-[18px] text-[15.5px] leading-[1.62] text-pretty text-text-secondary">
        {about.bio2}
      </p>
      <div className="flex flex-wrap gap-[9px] font-mono text-[11px]">
        <Link
          href="/resume"
          className="rounded-[5px] border border-accent px-3 py-[7px] text-accent transition-colors duration-150 hover:bg-surface-accent"
        >
          resume.pdf ↓
        </Link>
        <Link
          href="/contact"
          className="rounded-[5px] border border-border-interactive px-3 py-[7px] text-text-secondary transition-colors duration-150 hover:bg-surface-hover"
        >
          hire me →
        </Link>
        <a
          href={GITHUB}
          rel="me noreferrer"
          target="_blank"
          className="rounded-[5px] border border-border-interactive px-3 py-[7px] text-text-secondary transition-colors duration-150 hover:bg-surface-hover"
        >
          github ↗
        </a>
      </div>
    </div>
  );
}
