import type { About, Post, Project, ShelfItem, Talk } from '@/lib/content/schema';
import { projectSlug } from '@/components/windows/projects';
import { readingTime } from '@/components/windows/writing';

import { absolute, PERSON } from './site';

export type Node = Record<string, unknown>;

/**
 * Structured data is the strongest AI-discoverability signal the site has
 * (ARCHITECTURE.md#ai-discoverability), so the builders below are deliberately boring: every
 * node is a plain object, nothing is computed at render time, and `dateModified` always comes
 * from the database's trigger-maintained `updated_at` rather than the build clock.
 */

/** A stable identifier for the one person the whole graph is about. */
export const PERSON_ID = absolute('/#person');

/** Empty strings and `undefined` are worse than an absent property — drop them. */
function clean(node: Node): Node {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

const iso = (date: Date) => date.toISOString();

export function person(): Node {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON.name,
    jobTitle: PERSON.jobTitle,
    email: `mailto:${PERSON.email}`,
    url: absolute('/'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: PERSON.locality,
      addressRegion: PERSON.region,
      addressCountry: PERSON.country,
    },
    sameAs: [...PERSON.sameAs],
  };
}

export function profilePage(about: About): Node {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': absolute('/about'),
    url: absolute('/about'),
    name: `${about.name} — ${about.role}`,
    dateModified: iso(about.updatedAt),
    mainEntity: clean({
      '@type': 'Person',
      '@id': PERSON_ID,
      name: about.name,
      jobTitle: PERSON.jobTitle,
      // The bio carries paragraph breaks; a structured description is one line of prose.
      description: about.bio1.replace(/\s+/g, ' ').trim(),
      sameAs: [...PERSON.sameAs],
    }),
  };
}

export function softwareSourceCode(project: Project): Node {
  const url = absolute(`/projects/${projectSlug(project.name)}`);
  return clean({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': url,
    url,
    name: project.name,
    description: project.desc,
    programmingLanguage: project.lang,
    keywords: project.tag,
    dateCreated: project.year,
    dateModified: iso(project.updatedAt),
    author: { '@type': 'Person', '@id': PERSON_ID, name: PERSON.name },
  });
}

export function blogPosting(post: Post): Node {
  const url = absolute(`/writing/${post.slug}`);
  return clean({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    url,
    mainEntityOfPage: post.canonical ?? url,
    headline: post.title,
    description: post.blurb,
    datePublished: post.date,
    dateModified: iso(post.updatedAt),
    inLanguage: 'en',
    timeRequired: `PT${parseInt(readingTime(post), 10) || 1}M`,
    author: { '@type': 'Person', '@id': PERSON_ID, name: PERSON.name },
    publisher: { '@type': 'Person', '@id': PERSON_ID, name: PERSON.name },
  });
}

export function event(talk: Talk): Node {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: talk.title,
    startDate: talk.year,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: talk.venue, address: talk.venue },
    performer: { '@type': 'Person', '@id': PERSON_ID, name: PERSON.name },
    organizer: { '@type': 'Organization', name: talk.venue },
  });
}

export function book(item: ShelfItem): Node {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: item.title,
    description: item.note,
    readBy: { '@type': 'Person', '@id': PERSON_ID, name: PERSON.name },
  });
}

/**
 * The list wrapper for an index route. `itemListElement` carries the nodes themselves rather
 * than bare URLs — a crawler that reads the list gets every project or post in one pass
 * instead of having to fetch each page to find out what it is.
 */
export function itemList(name: string, path: string, items: Node[]): Node {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': absolute(path),
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      // Nested nodes inherit the graph's context; repeating it would be noise.
      item: Object.fromEntries(Object.entries(item).filter(([key]) => key !== '@context')),
    })),
  };
}

/**
 * `</script>` inside a string would close the block early, so `<` is escaped. `JSON.stringify`
 * does not do it, and this is the one place untrusted-looking content reaches raw HTML.
 */
export function JsonLd({ data }: { data: Node | Node[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
