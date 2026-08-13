import { CopyButton } from '@/components/ui/copy-button';
import type { Talk } from '@/lib/content/schema';

/*
 * Destinations that are routes rather than windows use a plain anchor, not `next/link`.
 * P5 builds these routes; until then `next/link` would prefetch them and log a 404 to the
 * console for every link on screen. The href is already correct, so nothing changes when the
 * route lands beyond restoring prefetching.
 */

/** The design renders venue, year and links as one meta line under the title. */
const metaLine = (talk: Talk) =>
  [talk.venue, talk.year, talk.links].filter(Boolean).join(' · ');

export function TalksWindow({ talks }: { talks: Talk[] }) {
  return (
    <div className="flex flex-col gap-3.5 px-[22px] pt-5 pb-[22px]">
      <ul className="flex flex-col gap-3.5">
        {talks.map((talk) => (
          <li key={talk.id}>
            <p className="text-[15px] leading-[1.35]">{talk.title}</p>
            <p className="mt-[3px] font-mono text-[10.5px] text-text-muted">{metaLine(talk)}</p>
          </li>
        ))}
      </ul>
      <a href="/talks/invite" className="font-mono text-[11px] text-accent-alt hover:underline">
        want me at yours? →
      </a>
    </div>
  );
}

/**
 * The design draws a form here, but D7 rules out a backend: no provider, no rate limiting, no
 * stored personal data. So the fields become a prompt for what to include, and the button is a
 * `mailto:` with that structure prefilled — the visitor writes it in their own client.
 *
 * That is honest in a way a non-submitting form is not. A form that looks like it posts and
 * silently does nothing is worse than no form.
 */
const INVITE_BODY = `event:
  [conference or team name]

when & where:
  [date] · [city or remote]

what you'd like me to talk about:
  [one paragraph is plenty]
`;

const FINE_PRINT = [
  '25 or 45 minutes',
  'no keynote fluff',
  'slides shared after, always',
  'workshops: ask early',
];

export function InviteWindow({ email }: { email: string }) {
  const mailto = `mailto:${email}?subject=${encodeURIComponent(
    'Speaking invitation',
  )}&body=${encodeURIComponent(INVITE_BODY)}`;

  return (
    <div className="flex gap-[34px] px-[34px] pt-[30px] pb-[34px] max-md:flex-col max-md:gap-6">
      <div className="flex-1">
        <h3 className="mb-2 text-[26px] font-bold tracking-[-0.02em]">Yes, probably.</h3>
        <p className="mb-[22px] text-[15px] leading-[1.6] text-pretty text-text-muted">
          I&rsquo;ll travel for a good hallway track. Tell me roughly what you need and I&rsquo;ll
          tell you honestly whether I&rsquo;m the right person.
        </p>

        <p className="mb-3 font-mono text-[11px] leading-[1.8] text-text-muted">
          Send me the event, when and where, and a paragraph on the topic. That is plenty.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={mailto}
            className="rounded-[5px] bg-accent px-3.5 py-2 font-mono text-[11px] text-on-accent transition-opacity duration-150 hover:opacity-90"
          >
            send invite →
          </a>
          <CopyButton value={email} label="copy address" />
        </div>
      </div>

      <div className="w-[230px] flex-none border-l border-border pl-7 font-mono text-[11px] leading-[1.9] text-text-secondary max-md:w-full max-md:border-l-0 max-md:border-t max-md:pt-5 max-md:pl-0">
        <h4 className="mb-2.5 text-[10px] tracking-[0.1em] uppercase text-text-muted">
          the fine print
        </h4>
        <ul>
          {FINE_PRINT.map((line) => (
            <li key={line}>
              <span aria-hidden="true">· </span>
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-3.5 text-text-muted">
          {`// I need 6 weeks. I will pretend 3 is fine and then not sleep.`}
        </p>
      </div>
    </div>
  );
}
