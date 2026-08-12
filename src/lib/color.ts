/**
 * The design specifies every colour in OKLCH. WCAG contrast is defined on sRGB relative
 * luminance, so checking a token pair means converting first. Doing that in code rather
 * than by eye is what makes the contrast budget enforceable in CI.
 */

export type Oklch = { l: number; c: number; h: number };

const OKLCH_PATTERN =
  /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i;

/** Parses `oklch(0.82 0.16 130)`. Lightness may be a percentage. Returns null if malformed. */
export function parseOklch(value: string): Oklch | null {
  const match = OKLCH_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, rawL, rawC, rawH] = match as unknown as [string, string, string, string];
  const l = rawL.endsWith('%') ? Number(rawL.slice(0, -1)) / 100 : Number(rawL);
  const c = Number(rawC);
  const h = Number(rawH);

  return Number.isFinite(l) && Number.isFinite(c) && Number.isFinite(h) ? { l, c, h } : null;
}

/**
 * OKLCH to linear-light sRGB, via OKLab and the LMS cone space.
 * Coefficients are Björn Ottosson's, from the original OKLab definition.
 */
function toLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const radians = (h * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);

  const lCone = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCone = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCone = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone,
  ];
}

/**
 * WCAG 2.x relative luminance. Linear-light sRGB is already what the formula wants, so the
 * usual gamma decode is unnecessary — but out-of-gamut channels must be clamped, or a
 * saturated colour the display cannot show would score as brighter than white.
 */
export function relativeLuminance(color: Oklch): number {
  const [r, g, b] = toLinearSrgb(color).map((channel) =>
    Math.min(1, Math.max(0, channel)),
  ) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1–21. Order of arguments does not matter. */
export function contrastRatio(a: Oklch, b: Oklch): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  ) as [number, number];

  return (lighter + 0.05) / (darker + 0.05);
}

/** Same, from raw `oklch(...)` strings. Throws on malformed input — a typo'd token is a bug. */
export function contrastRatioOf(a: string, b: string): number {
  const parsedA = parseOklch(a);
  const parsedB = parseOklch(b);
  if (!parsedA) throw new Error(`Not a valid oklch() colour: ${a}`);
  if (!parsedB) throw new Error(`Not a valid oklch() colour: ${b}`);

  return contrastRatio(parsedA, parsedB);
}

/** WCAG AA thresholds. Large text is 18.66px bold or 24px regular; UI covers borders and icons. */
export const AA = { text: 4.5, largeText: 3, ui: 3 } as const;
