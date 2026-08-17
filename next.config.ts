import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required by `use cache` in src/lib/content/queries.ts. Content is prerendered at build and
  // invalidated by tag on write, so a visitor never reaches the database.
  cacheComponents: true,

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
