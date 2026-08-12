import { describe, expect, it } from 'vitest';
import { AA, contrastRatio, contrastRatioOf, parseOklch, relativeLuminance } from './color';

describe('parseOklch', () => {
  it('parses the notation the design uses', () => {
    expect(parseOklch('oklch(0.82 0.16 130)')).toEqual({ l: 0.82, c: 0.16, h: 130 });
  });

  it('accepts percentage lightness and an alpha channel', () => {
    expect(parseOklch('oklch(82% 0.16 130 / 0.5)')).toEqual({ l: 0.82, c: 0.16, h: 130 });
  });

  it('returns null rather than guessing at other colour spaces', () => {
    expect(parseOklch('#0b0b0e')).toBeNull();
    expect(parseOklch('rgb(11 11 14)')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('puts white at 1 and black at 0', () => {
    expect(relativeLuminance({ l: 1, c: 0, h: 0 })).toBeCloseTo(1, 2);
    expect(relativeLuminance({ l: 0, c: 0, h: 0 })).toBeCloseTo(0, 5);
  });

  it('clamps out-of-gamut colours instead of exceeding white', () => {
    // Chroma far beyond what sRGB can represent at this lightness.
    expect(relativeLuminance({ l: 0.9, c: 0.4, h: 130 })).toBeLessThanOrEqual(1);
  });
});

describe('contrastRatio', () => {
  it('gives 21:1 for black on white', () => {
    const white = { l: 1, c: 0, h: 0 };
    const black = { l: 0, c: 0, h: 0 };
    expect(contrastRatio(white, black)).toBeCloseTo(21, 1);
  });

  it('is symmetric', () => {
    const a = 'oklch(0.82 0.16 130)';
    const b = 'oklch(0.17 0.012 285)';
    expect(contrastRatioOf(a, b)).toBeCloseTo(contrastRatioOf(b, a), 10);
  });

  it('gives 1:1 for a colour against itself', () => {
    expect(contrastRatioOf('oklch(0.5 0.1 200)', 'oklch(0.5 0.1 200)')).toBeCloseTo(1, 10);
  });

  it('throws on a malformed token rather than silently scoring it', () => {
    expect(() => contrastRatioOf('oklch(0.5 0.1 200)', 'papayawhip')).toThrow(/valid oklch/);
  });
});

describe("the design's palette", () => {
  const surfaceDark = 'oklch(0.17 0.012 285)';
  const accent = 'oklch(0.82 0.16 130)';

  it('passes AA for the lime accent on the dark desktop', () => {
    expect(contrastRatioOf(accent, surfaceDark)).toBeGreaterThanOrEqual(AA.text);
  });

  it('confirms the dark accent fails on a light surface, which is why light mode darkens it', () => {
    // This is the finding that drives the light-theme token table in ARCHITECTURE.md.
    expect(contrastRatioOf(accent, 'oklch(0.98 0 0)')).toBeLessThan(AA.text);
  });

  it('confirms the derived light-mode accent passes on a light surface', () => {
    expect(contrastRatioOf('oklch(0.52 0.15 130)', 'oklch(0.98 0 0)')).toBeGreaterThanOrEqual(
      AA.text,
    );
  });
});
