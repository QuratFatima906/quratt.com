import { describe, expect, it } from 'vitest';

import type { About, Post, Project, ShelfItem, Talk } from '@/lib/content/schema';

import { blogPosting, book, event, itemList, person, profilePage, softwareSourceCode } from './json-ld';
import { PERSON } from './site';

const stamps = { createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-02T10:00:00Z') };

const about: About = {
  id: 1,
  name: 'Qurat ul ain Fatima',
  role: 'senior software engineer',
  meta: 'Lahore · PKT',
  bio1: 'Bio one.',
  bio2: 'Bio two.',
  ...stamps,
};

const project: Project = {
  id: 1,
  sortOrder: 0,
  name: 'cold start',
  year: '2025',
  lang: 'py',
  tag: 'systems',
  desc: 'a year of measuring one cloud',
  draft: false,
  pinned: false,
  ...stamps,
};

const post: Post = {
  id: 1,
  sortOrder: 0,
  slug: 'a-post',
  title: 'A post',
  blurb: 'A blurb.',
  date: '2026-05-01',
  mins: '4 min',
  body: 'word '.repeat(600),
  canonical: null,
  draft: false,
  pinned: false,
  ...stamps,
};

const talk: Talk = {
  id: 1,
  sortOrder: 0,
  title: 'A talk',
  venue: 'Somewhere',
  year: '2025',
  links: '',
  draft: false,
  pinned: false,
  ...stamps,
};

const shelfItem: ShelfItem = { id: 1, sortOrder: 0, title: 'A book', state: 'now', note: '', ...stamps };

/** Types schema.org actually defines — a typo here is the failure mode this test exists for. */
const KNOWN_TYPES = new Set([
  'Person',
  'PostalAddress',
  'ProfilePage',
  'BlogPosting',
  'SoftwareSourceCode',
  'Event',
  'Place',
  'Organization',
  'Book',
  'ItemList',
  'ListItem',
]);

function walk(node: unknown, visit: (object: Record<string, unknown>) => void): void {
  if (Array.isArray(node)) return node.forEach((child) => walk(child, visit));
  if (node && typeof node === 'object') {
    visit(node as Record<string, unknown>);
    Object.values(node).forEach((child) => walk(child, visit));
  }
}

const nodes = {
  Person: person(),
  ProfilePage: profilePage(about),
  SoftwareSourceCode: softwareSourceCode(project),
  BlogPosting: blogPosting(post),
  Event: event(talk),
  Book: book(shelfItem),
  ItemList: itemList('Projects', '/projects', [softwareSourceCode(project)]),
};

describe('JSON-LD builders', () => {
  it.each(Object.entries(nodes))('%s is a valid schema.org document', (type, node) => {
    expect(node['@context']).toBe('https://schema.org');
    expect(node['@type']).toBe(type);
  });

  it.each(Object.entries(nodes))('%s uses only real schema.org types', (_type, node) => {
    walk(node, (object) => {
      if ('@type' in object) expect(KNOWN_TYPES).toContain(object['@type']);
    });
  });

  it.each(Object.entries(nodes))('%s emits no empty properties', (_type, node) => {
    walk(node, (object) => {
      for (const [key, value] of Object.entries(object)) {
        expect(value, `${key} is empty`).not.toBeUndefined();
        expect(value, `${key} is empty`).not.toBeNull();
        expect(value, `${key} is empty`).not.toBe('');
      }
    });
  });

  it.each(Object.entries(nodes))('%s survives serialisation', (_type, node) => {
    expect(() => JSON.stringify(node)).not.toThrow();
  });

  it('identifies the same person everywhere', () => {
    const ids = new Set<unknown>();
    Object.values(nodes).forEach((node) =>
      walk(node, (object) => {
        if (object['@type'] === 'Person') ids.add(object['@id']);
      }),
    );
    expect([...ids]).toEqual([person()['@id']]);
  });

  it('carries every sameAs link from docs/CONTENT.md', () => {
    expect(person().sameAs).toEqual([...PERSON.sameAs]);
    expect(PERSON.sameAs).toHaveLength(4);
  });

  it('never publishes the phone number (D14)', () => {
    const serialised = JSON.stringify(nodes);
    expect(serialised).not.toContain('3056298871');
    expect(serialised).not.toMatch(/\+92[\s\d]/);
  });

  it('sources dateModified from the row, not the clock', () => {
    expect(softwareSourceCode(project).dateModified).toBe(stamps.updatedAt.toISOString());
    expect(blogPosting(post).dateModified).toBe(stamps.updatedAt.toISOString());
    expect(profilePage(about).dateModified).toBe(stamps.updatedAt.toISOString());
  });

  it('gives a post an ISO 8601 duration and an absolute canonical', () => {
    const node = blogPosting(post);
    expect(node.timeRequired).toBe('PT3M');
    expect(String(node.url)).toMatch(/^https?:\/\/.+\/writing\/a-post$/);
    expect(node.mainEntityOfPage).toBe(node.url);
  });

  it('prefers a post its own canonical when it was published elsewhere first (D6)', () => {
    const node = blogPosting({ ...post, canonical: 'https://elsewhere.example/a-post' });
    expect(node.mainEntityOfPage).toBe('https://elsewhere.example/a-post');
  });

  it('numbers list items from one', () => {
    const list = itemList('Projects', '/projects', [
      softwareSourceCode(project),
      softwareSourceCode({ ...project, name: 'parsley' }),
    ]);
    const positions = (list.itemListElement as { position: number }[]).map((i) => i.position);
    expect(positions).toEqual([1, 2]);
    expect(list.numberOfItems).toBe(2);
    // Nested nodes inherit the graph's context; repeating it would be noise.
    const first = (list.itemListElement as { item: Record<string, unknown> }[])[0]?.item;
    expect(first).not.toHaveProperty('@context');
  });
});
