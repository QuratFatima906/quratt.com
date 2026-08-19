/**
 * The shape of a primary call to action — `send →` in the mail draft, `download the real
 * one ↓` on the résumé.
 *
 * Shape only: no background. Colour is the call site's, because the two buttons are
 * deliberately different colours — the mail draft's send is `accent-alt`, the résumé's
 * download is `accent`. What they must never differ on again is size, and they did: each
 * inherited a different `font-size` and `line-height` from the window around it, so one
 * stood 2px taller than the other. Both are pinned here, out of reach of inheritance.
 *
 * Every fill this is used with carries `--on-accent` text and is contrast-tested against it
 * in both themes (`src/lib/tokens.test.ts`), so the ink stays here even though the fill does
 * not.
 *
 * A constant rather than a component: the two are different elements doing different jobs —
 * a `mailto:` handoff and a file download — and only their surface is shared.
 */
export const CTA =
  'inline-block rounded-[5px] px-[13px] py-2 text-[11.5px] leading-[1.6] text-on-accent transition-opacity duration-150 hover:opacity-90';
