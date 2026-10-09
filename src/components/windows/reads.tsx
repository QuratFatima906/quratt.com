import type { ReactNode } from 'react';

import { Urdu } from '@/components/ui/urdu';
import { type Book, ENDPAPER_PROFILE } from '@/lib/content/endpaper';

/**
 * `data-model.md` names four states but requires an unrecognised one to still render, so the
 * fallback is the danger colour — which is how the design draws "gave up".
 */
const STATE_COLOR: Record<string, string> = {
  now: 'text-accent',
  done: 'text-text-muted',
  soon: 'text-accent-alt',
};

const stateColor = (state: string) => STATE_COLOR[state] ?? 'text-danger';

/**
 * Urdu titles are the only Urdu on the site (Q6). Detected by codepoint rather than by a flag
 * on the row, so adding an Urdu book is just typing one — no schema change, nothing to forget.
 * The range covers Arabic script including the Urdu-specific extensions.
 */
const URDU = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

export function BookTitle({ title }: { title: string }) {
  return URDU.test(title) ? <Urdu>{title}</Urdu> : <>{title}</>;
}

/** Outbound, so it opens in a new tab like every other link off the site. */
function External({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

/** A book's title, linked to its Endpaper page when it has one. */
function Title({ book }: { book: Book }) {
  const title = <BookTitle title={book.title} />;
  return book.url ? (
    <External href={book.url} className="hover:text-accent-alt hover:underline">
      {title}
    </External>
  ) : (
    title
  );
}

/** The way to the full shelf, which lives on Endpaper. */
function EndpaperLink() {
  return (
    <External href={ENDPAPER_PROFILE} className="text-accent-alt hover:underline">
      the whole shelf, on endpaper<span aria-hidden="true"> ↗</span>
    </External>
  );
}

/** The small window: a few books and a way to the whole shelf. */
export function ReadsWindow({ recent, total }: { recent: Book[]; total: number }) {
  return (
    <div className="px-5 pt-[18px] pb-5 font-mono text-[12px] leading-[1.9] text-text-secondary">
      <p className="mb-2 text-text-muted">{`// ${total} books on the shelf`}</p>
      <ul>
        {recent.map((book) => (
          <li key={book.id}>
            <span className={stateColor(book.state)}>{book.state}</span>
            <span aria-hidden="true"> · </span>
            <Title book={book} />
          </li>
        ))}
      </ul>
      <p className="mt-2">
        <EndpaperLink />
      </p>
    </div>
  );
}

/** The expanded shelf: every book, with its note. */
export function ShelfWindow({ books }: { books: Book[] }) {
  return (
    <div className="px-[30px] pt-[26px] pb-[30px]">
      <ul>
        {books.map((book) => (
          <li
            key={book.id}
            className="flex items-baseline gap-3.5 border-b border-border py-2.5 last:border-b-0"
          >
            <span
              className={`w-[46px] flex-none font-mono text-[10px] ${stateColor(book.state)}`}
            >
              {book.state}
            </span>
            {/* Nastaliq needs its own leading, which would otherwise be clipped by the row. */}
            <span className="text-[14.5px] text-text">
              <Title book={book} />
            </span>
            <span className="ml-auto font-mono text-[10.5px] whitespace-nowrap text-text-muted">
              {book.note}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-mono text-[11px]">
        <EndpaperLink />
      </p>
    </div>
  );
}
