import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Noto_Nastaliq_Urdu } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quratt.com';

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
  title: 'Qurat ul ain Fatima',
  description: 'Senior software engineer. Portfolio, writing, projects and reading.',
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
      </body>
    </html>
  );
}
