/**
 * The one primary call to action on the site — `send →` in the mail draft, `download the real
 * one ↓` on the résumé.
 *
 * A shared constant rather than a component, because the two are different elements doing
 * different jobs (a `mailto:` handoff and a file download) and only their surface is shared.
 * They drifted apart the moment they were written twice: two accents and two heights, the
 * height because each inherited a different `font-size` and `line-height` from its window.
 * Both are pinned here so neither can inherit its way out of the shape again.
 */
export const CTA =
  'inline-block rounded-[5px] bg-accent px-[13px] py-2 text-[11.5px] leading-[1.6] text-on-accent transition-opacity duration-150 hover:opacity-90';
