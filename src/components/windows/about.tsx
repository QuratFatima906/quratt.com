import Image from 'next/image';

import { OpenLink } from '@/components/windows/open-link';

import portrait from '@/assets/portrait.webp';
import type { About } from '@/lib/content/schema';

/** The one external identity the design puts in this window. Also a `sameAs` entry in P6. */
const GITHUB = 'https://github.com/QuratFatima906';

/**
 * The portrait is imported rather than pathed, so Next derives the intrinsic size and the blur
 * placeholder from the file itself — which also means replacing the file busts its own cache.
 * The source is 4:5 and the slot is 100×124 (0.806), so `cover` crops a rounding error.
 */
/**
 * A bio field holds one or more paragraphs, separated by a blank line. Two fields rather than a
 * list because the design gives them different emphasis — the first group is the lead, the
 * second is the history — and because the alternative was a migration for a copy change.
 */
function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

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
          <h2 className="text-[25px] leading-[1.15] font-bold tracking-[-0.03em] text-balance">
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
      {paragraphs(about.bio1).map((text, i) => (
        <p key={text} className={`text-[13px] leading-[1.75] text-pretty ${i === 0 ? 'mt-5 mb-3' : 'mb-3'}`}>
          {text}
        </p>
      ))}
      {paragraphs(about.bio2).map((text) => (
        <p key={text} className="mb-[18px] text-[13px] leading-[1.75] text-pretty text-text-secondary">
          {text}
        </p>
      ))}
      <div className="flex flex-wrap gap-[9px] font-mono text-[11px]">
        <OpenLink
          window="resume"
          href="/resume"
          className="rounded-[5px] border border-accent px-3 py-[7px] text-accent transition-colors duration-150 hover:bg-surface-accent"
        >
          resume ↓
        </OpenLink>
        <OpenLink
          window="contact"
          href="/contact"
          className="rounded-[5px] border border-border-interactive px-3 py-[7px] text-text-secondary transition-colors duration-150 hover:bg-surface-hover"
        >
          hire me →
        </OpenLink>
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
