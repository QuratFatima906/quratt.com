import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quratt.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Qurat ul ain Fatima',
  description: 'Senior software engineer. Portfolio, writing, projects and reading.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
