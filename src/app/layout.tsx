import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { JetBrains_Mono, Noto_Nastaliq_Urdu } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

import { JsonLd, person } from '@/lib/seo/json-ld';
import { siteUrl } from '@/lib/seo/site';

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
    default: 'Qurat ul Ain Fatima',
    template: '%s · Qurat ul Ain Fatima',
  },
  description: 'Senior software engineer. Portfolio, writing, projects and reading.',
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${jetbrainsMono.variable} ${nastaliq.variable}`}
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
        {/* Only on Vercel. Both inject `<script src="/_vercel/…">` from an effect after
            hydration, and that path is served by the platform, not by this app — so anywhere
            else it is a guaranteed 404. Lighthouse counts that console error and drops
            best-practices to 0.96, which is how the first attempt at this failed CI.
            `VERCEL_ENV` is read while prerendering, so off-platform they are not in the tree
            at all. On a deployment the script is first-party: no third-party origin, no
            cookie, ~1.5 KB gzipped, fetched after the page is interactive. */}
        {process.env.VERCEL_ENV && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
