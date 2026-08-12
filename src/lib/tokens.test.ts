import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AA, contrastRatioOf } from './color';
import { renderTokensCss, tokens, type ThemeName, type TokenName } from './tokens';

/**
 * Surfaces anything can sit on. `surface-accent` is the accent-tinted panel, so it counts as
 * a background too — an accent-on-accent-tint pair is the easiest one to get wrong.
 */
const surfaces = [
  'surface-chrome',
  'surface',
  'surface-raised',
  'surface-overlay',
  'surface-hover',
  'surface-accent',
] as const satisfies readonly TokenName[];

/** Anything rendered as text on a surface. Body-weight, so 4.5:1. */
const inks = [
  'text',
  'text-secondary',
  'text-muted',
  'accent',
  'accent-hover',
  'accent-alt',
  'warn',
  'danger',
  'info',
] as const satisfies readonly TokenName[];

/** Solid fills that carry `--on-accent` text: buttons, badges, the close button's hover. */
const fills = [
  'accent',
  'accent-hover',
  'accent-alt',
  'warn',
  'danger',
  'info',
] as const satisfies readonly TokenName[];

/**
 * Non-text UI that must still be distinguishable: the focus ring and the boundary of
 * controls that have no text label of their own (inputs, the drag handle). 3:1.
 *
 * `--border` is deliberately absent. It is the design's decorative hairline between panels;
 * WCAG 1.4.11 does not apply to it, and forcing it to 3:1 would replace the design's quiet
 * separators with heavy rules. Controls that need a visible boundary use
 * `--border-interactive`, which is tested.
 */
const uiMarks = ['border-interactive', 'focus'] as const satisfies readonly TokenName[];

const ratio = (theme: ThemeName, a: TokenName, b: TokenName) =>
  contrastRatioOf(tokens[theme][a], tokens[theme][b]);

describe.each(['dark', 'light'] as const)('%s theme contrast', (theme) => {
  it.each(inks.flatMap((ink) => surfaces.map((surface) => [ink, surface] as const)))(
    '%s on %s meets AA body text',
    (ink, surface) => {
      expect(ratio(theme, ink, surface)).toBeGreaterThanOrEqual(AA.text);
    },
  );

  it.each(fills)('on-accent over %s meets AA body text', (fill) => {
    expect(ratio(theme, 'on-accent', fill)).toBeGreaterThanOrEqual(AA.text);
  });

  it.each(uiMarks.flatMap((mark) => surfaces.map((surface) => [mark, surface] as const)))(
    '%s against %s meets AA for UI',
    (mark, surface) => {
      expect(ratio(theme, mark, surface)).toBeGreaterThanOrEqual(AA.ui);
    },
  );
});

it('both themes define exactly the same token names', () => {
  expect(Object.keys(tokens.light)).toEqual(Object.keys(tokens.dark));
});

it('tokens.css is generated from tokens.ts and has not drifted', () => {
  const generated = readFileSync(resolve(import.meta.dirname, '../app/tokens.css'), 'utf8');
  expect(generated).toBe(renderTokensCss());
});
