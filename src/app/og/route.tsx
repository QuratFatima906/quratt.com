import { ImageResponse } from 'next/og';

import { toHex } from '@/lib/color';
import { PERSON } from '@/lib/seo/site';
import { tokens } from '@/lib/tokens';

/**
 * One card generator for every route, rather than an `opengraph-image` file per segment: the
 * routes already know their own title, and passing it here is the difference between thirteen
 * near-identical files and one.
 *
 * Rasterised by satori, which has no CSS engine — hence hex rather than the CSS custom
 * properties, converted from the same token table the site renders from.
 */
const c = {
  bg: toHex(tokens.dark['surface-chrome']),
  panel: toHex(tokens.dark['surface-raised']),
  border: toHex(tokens.dark.border),
  text: toHex(tokens.dark.text),
  muted: toHex(tokens.dark['text-muted']),
  accent: toHex(tokens.dark.accent),
};

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  // Bounded, because the values land in an image someone else's crawler asked for.
  const title = (params.get('title') ?? PERSON.name).slice(0, 90);
  const subtitle = (params.get('subtitle') ?? PERSON.jobTitle).slice(0, 160);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: c.bg,
          color: c.text,
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        {/* The site's own chrome, so a shared card is recognisably the same object as the page. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: c.accent, fontSize: 26 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: c.accent }} />
          qurat.os
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexGrow: 1,
            marginTop: 28,
            padding: '40px 44px',
            borderRadius: 18,
            border: `1px solid ${c.border}`,
            background: c.panel,
          }}
        >
          <div style={{ fontSize: 66, lineHeight: 1.1, fontWeight: 700, letterSpacing: -1.5 }}>
            {title}
          </div>
          <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.4, color: c.muted }}>
            {subtitle}
          </div>
        </div>

        {/* One text node: satori requires an explicit display on any element with several. */}
        <div style={{ marginTop: 28, fontSize: 24, color: c.muted }}>
          {`${PERSON.name} · ${PERSON.locality}`}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
