import type { Metadata } from 'next';

/**
 * Where the site thinks it lives.
 *
 * Production sets `NEXT_PUBLIC_SITE_URL`. A preview deployment does not, and falling through to
 * the production URL there would emit a canonical pointing at production from every preview
 * page — a mistake that is invisible in review and expensive once a crawler believes it. So
 * previews fall back to their own `VERCEL_URL`, and only a machine with neither ends up on
 * localhost.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export function absolute(path: string): string {
  return new URL(path, siteUrl).toString();
}

export const SITE_NAME = 'qurat.os';

/**
 * The identity graph, from docs/CONTENT.md. All four `sameAs` links belong in it: entity
 * resolution is what lets a model connect this page to the same person elsewhere, and it is
 * the single highest-value structured-data field on the site.
 *
 * The résumé's phone number is not here and never will be (D14).
 */
export const PERSON = {
  name: 'Qurat ul ain Fatima',
  jobTitle: 'Senior Software Engineer',
  email: 'quratfatima581@gmail.com',
  locality: 'Lahore',
  region: 'Punjab',
  country: 'PK',
  sameAs: [
    'https://github.com/QuratFatima906',
    'https://www.linkedin.com/in/qurat-ul-ain-fatima/',
    'https://x.com/Ain_fatima_ch',
    'mailto:quratfatima581@gmail.com',
  ],
} as const;

/** The generated card for a page. One route renders them all, so every page gets its own. */
export function ogUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set('subtitle', subtitle);
  return absolute(`/og?${params}`);
}

/**
 * Per-route metadata. Thirteen routes need the same six fields wired the same way, and the one
 * that is easy to get silently wrong is the canonical — so it is derived from the path here
 * rather than typed out at each call site.
 */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  type = 'website',
  published,
  modified,
}: {
  title: string;
  description: string;
  /** Route path, canonical-as-written. Filtered and paginated views pass their base path. */
  path: string;
  /** `false` for a window that is disabled in the UI and has no real content yet (D13). */
  index?: boolean;
  type?: 'website' | 'article' | 'profile';
  published?: Date;
  modified?: Date;
}): Metadata {
  const url = absolute(path);
  const images = [{ url: ogUrl(title, description), width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: type === 'profile' ? 'profile' : type,
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_GB',
      images,
      ...(type === 'article' && {
        publishedTime: published?.toISOString(),
        modifiedTime: modified?.toISOString(),
        authors: [PERSON.name],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
      creator: '@Ain_fatima_ch',
    },
  };
}
