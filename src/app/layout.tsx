import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Noto_Nastaliq_Urdu } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

import { JsonLd, person } from '@/lib/seo/json-ld';
import { siteUrl } from '@/lib/seo/site';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/**
 * Nastaliq is ~400 KB and only Urdu book and project titles use it. Preloading it would
 * spend the LCP budget of every page on content most visitors never see, so the face is
 * declared and the browser fetches it only when an element actually resolves to it.
 */
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  variable: '--font-nastaliq',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Qurat ul ain Fatima',
    template: '%s · Qurat ul ain Fatima',
  },
  description: 'Senior software engineer. Portfolio, writing, projects and reading.',
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${bricolage.variable} ${jetbrainsMono.variable} ${nastaliq.variable}`}
    >
      <body className="min-h-full">
        {/* Dark by default rather than following the OS (D11) — the design is built for it.
            `enableSystem` stays off, or next-themes would resolve an unset preference back to
            the system value and undo the default. The toggle still persists a choice. */}
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
        {/* One `Person` for the whole site, with a stable `@id` every other node points at.
            Entity resolution is the highest-value structured data here — everything else on
            the site is a claim *about* this person. */}
        <JsonLd data={person()} />
        {/* Both are inert off Vercel — they render nothing locally and in CI, and on a
            deployment they inject a first-party script from `/_vercel/`, so no third-party
            origin is contacted and no cookie is set. Neither is counted by
            `scripts/check-bundle.mjs`, which only measures `/_next/static` chunks; the real
            cost is ~2 KB of deferred script that arrives after the page is interactive. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
