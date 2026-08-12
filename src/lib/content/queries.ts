import { asc } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';

import { db } from './db';
import * as t from './schema';

/**
 * The one place `draft` is ever read.
 *
 * A visitor's response must not contain a draft row in any form — not hidden, not in a payload,
 * not in a count. Every exported getter below passes through here, so when admin lands (D2)
 * this single function is what an auth check relaxes.
 */
export function visible<T extends { draft: boolean }>(rows: readonly T[]): T[] {
  return rows.filter((row) => !row.draft);
}

/** Counts are of visible rows, so a draft can never inflate "projects/ — {n} items". */
export function countVisible(rows: readonly { draft: boolean }[]): number {
  return visible(rows).length;
}

/** The four projects shown in the small `projects/` window. */
export function featured<T extends { draft: boolean; pinned: boolean }>(rows: readonly T[]): T[] {
  return visible(rows)
    .filter((row) => row.pinned)
    .slice(0, 4);
}

/**
 * Content changes only when the owner edits it, so entries live until a write invalidates them
 * by tag. P9's editor calls `updateTag(collection)`.
 */
function cache(collection: string) {
  cacheTag(collection);
  cacheLife('max');
}

/*
 * The `all*` readers are the only functions that touch the database, and they are deliberately
 * not exported: raw rows include drafts, and nothing outside this file may hold them.
 */

async function allProjects() {
  'use cache';
  cache('projects');
  return db().select().from(t.projects).orderBy(asc(t.projects.sortOrder));
}

async function allPosts() {
  'use cache';
  cache('posts');
  return db().select().from(t.posts).orderBy(asc(t.posts.sortOrder));
}

async function allTalks() {
  'use cache';
  cache('talks');
  return db().select().from(t.talks).orderBy(asc(t.talks.sortOrder));
}

export async function getAbout() {
  'use cache';
  cache('about');
  const [row] = await db().select().from(t.about).limit(1);
  return row ?? null;
}

export async function getContact() {
  'use cache';
  cache('contact');
  const [row] = await db().select().from(t.contact).limit(1);
  return row ?? null;
}

export async function getNow() {
  'use cache';
  cache('now');
  const [meta] = await db().select().from(t.nowMeta).limit(1);
  const lines = await db().select().from(t.now).orderBy(asc(t.now.sortOrder));
  return { nowUpdated: meta?.nowUpdated ?? null, lines };
}

export async function getShelf() {
  'use cache';
  cache('shelf');
  return db().select().from(t.shelf).orderBy(asc(t.shelf.sortOrder));
}

export async function getUses() {
  'use cache';
  cache('uses');
  return db().select().from(t.uses).orderBy(asc(t.uses.sortOrder));
}

export async function getCv() {
  'use cache';
  cache('cv');
  return db().select().from(t.cv).orderBy(asc(t.cv.sortOrder));
}

export async function getProjects() {
  return visible(await allProjects());
}

export async function getPosts() {
  return visible(await allPosts());
}

export async function getTalks() {
  return visible(await allTalks());
}

// Derived views. Computed, never stored — see docs/design/data-model.md.

export async function getFeaturedProjects() {
  return featured(await allProjects());
}

export async function getRecentPosts() {
  return (await getPosts()).slice(0, 4);
}

export async function getRecentShelf() {
  return (await getShelf()).slice(0, 4);
}

export async function getCounts() {
  const [projects, posts, shelf] = await Promise.all([allProjects(), allPosts(), getShelf()]);
  return {
    projects: countVisible(projects),
    posts: countVisible(posts),
    shelf: shelf.length,
  };
}
