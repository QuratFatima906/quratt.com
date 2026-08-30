import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required by `use cache` in src/lib/content/queries.ts. Content is prerendered at build and
  // invalidated by tag on write, so a visitor never reaches the database.
  cacheComponents: true,

  experimental: {
    // The stylesheet is render-blocking and small (~9 KB of Tailwind atoms), so the round trip
    // to fetch it costs more than carrying it in the document does. Inlining it removes that
    // request from the critical path — worth ~160 ms of mobile LCP by Lighthouse's reckoning.
    // The trade is that returning visitors re-download it with every page rather than reading a
    // cached file; at this size, on a site whose pages are mostly first visits, that is cheap.
    inlineCss: true,
  },

  async rewrites() {
    return [
      // Markdown twins. A literal `[slug].md` segment is not routable, and a root-level
      // catch-all would shadow the real pages — so `.md` is stripped here and handled by one
      // route. `/md/` itself is disallowed in robots.ts so the content has a single URL.
      { source: '/:path*.md', destination: '/md/:path*' },
    ];
  },
};

export default nextConfig;
