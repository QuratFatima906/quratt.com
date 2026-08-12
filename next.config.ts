import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required by `use cache` in src/lib/content/queries.ts. Content is prerendered at build and
  // invalidated by tag on write, so a visitor never reaches the database.
  cacheComponents: true,
};

export default nextConfig;
