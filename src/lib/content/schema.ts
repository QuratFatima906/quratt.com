/**
 * The content contract.
 *
 * Zod defines the shape of every collection — it is the single source of truth, lifted from
 * the design's SEED/SCHEMA objects (see docs/design/data-model.md). Drizzle adds only what a
 * database needs on top: identity, ordering, and timestamps.
 *
 * The two are kept honest by the seed script: it parses content with zod and hands the result
 * straight to `db.insert()`, so a field that exists in one and not the other fails typecheck.
 */
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

/*
 * Enumerations are enforced in zod, not in Postgres.
 *
 * The design derives its filter chips from whatever tags exist in the data, and renders any
 * unrecognised shelf state in the danger colour rather than rejecting it — so the database is
 * deliberately permissive. Both a pg enum and a check constraint would need a migration to add
 * a value, which is exactly the friction the design was drawn to avoid. Zod still catches a
 * typo at the only write boundary that exists today, and widening it is a one-line edit.
 */
export const projectTags = ['systems', 'tools', 'silly'] as const;
export const shelfStates = ['now', 'done', 'soon', 'gave up'] as const;

// Placeholder content ships with `[city]`, `[you]@[domain]` and friends, so these are checked
// for presence, not for format. A real email validator would reject the seed.
const line = z.string().trim().min(1);

export const aboutSchema = z.object({
  name: line,
  role: line,
  meta: line,
  bio1: line,
  bio2: line,
});

export const contactSchema = z.object({
  email: line,
  subject: line,
  note: line,
});

export const nowSchema = z.object({ line });

export const projectSchema = z.object({
  name: line,
  year: line,
  lang: line,
  tag: z.enum(projectTags),
  desc: line,
  draft: z.boolean(),
  pinned: z.boolean(),
});

export const postSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase words joined by hyphens'),
  title: line,
  blurb: line,
  date: line,
  mins: line,
  draft: z.boolean(),
  pinned: z.boolean(),
  /** MDX source, authored in src/content/posts/<slug>.mdx and loaded by the seed script. */
  body: z.string().trim().min(1).max(200_000).nullable(),
  /** Set only when the post was published somewhere else first — see D6. */
  canonical: z.url().nullable(),
});

export const talkSchema = z.object({
  title: line,
  venue: line,
  year: line,
  links: z.string(),
  draft: z.boolean(),
  pinned: z.boolean(),
});

export const shelfSchema = z.object({
  title: line,
  state: z.enum(shelfStates),
  note: z.string(),
});

export const usesSchema = z.object({ label: line, value: line });

export const cvSchema = z.object({ period: line, role: line, note: z.string() });

export const seedSchema = z.object({
  about: aboutSchema,
  contact: contactSchema,
  nowUpdated: line,
  now: z.array(nowSchema),
  projects: z.array(projectSchema),
  posts: z.array(postSchema),
  talks: z.array(talkSchema),
  shelf: z.array(shelfSchema),
  uses: z.array(usesSchema),
  cv: z.array(cvSchema),
});

export type Seed = z.infer<typeof seedSchema>;

/**
 * `updated_at` is written by a database trigger (see drizzle/0001_updated_at_trigger.sql), not
 * by application code — it feeds `dateModified` in JSON-LD and `lastModified` in the sitemap,
 * and both must stay true when a row is edited outside the app.
 */
const stamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

/** Ordering is content, not incidental: the editor reorders rows by hand. */
const listBase = {
  id: serial('id').primaryKey(),
  sortOrder: integer('sort_order').notNull(),
  ...stamps,
};

const flags = {
  draft: boolean('draft').notNull().default(false),
  pinned: boolean('pinned').notNull().default(false),
};

export const about = pgTable('about', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  meta: text('meta').notNull(),
  bio1: text('bio1').notNull(),
  bio2: text('bio2').notNull(),
  ...stamps,
});

export const contact = pgTable('contact', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  note: text('note').notNull(),
  ...stamps,
});

/** The `now.txt` window carries a hand-written "as of" stamp alongside its lines. */
export const nowMeta = pgTable('now_meta', {
  id: integer('id').primaryKey(),
  nowUpdated: text('now_updated').notNull(),
  ...stamps,
});

export const now = pgTable('now', {
  ...listBase,
  line: text('line').notNull(),
});

export const projects = pgTable('projects', {
  ...listBase,
  name: text('name').notNull(),
  year: text('year').notNull(),
  lang: text('lang').notNull(),
  tag: text('tag').notNull(),
  desc: text('desc').notNull(),
  ...flags,
});

export const posts = pgTable('posts', {
  ...listBase,
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  blurb: text('blurb').notNull(),
  date: text('date').notNull(),
  mins: text('mins').notNull(),
  body: text('body'),
  canonical: text('canonical'),
  ...flags,
});

export const talks = pgTable('talks', {
  ...listBase,
  title: text('title').notNull(),
  venue: text('venue').notNull(),
  year: text('year').notNull(),
  links: text('links').notNull(),
  ...flags,
});

export const shelf = pgTable('shelf', {
  ...listBase,
  title: text('title').notNull(),
  state: text('state').notNull(),
  note: text('note').notNull(),
});

export const uses = pgTable('uses', {
  ...listBase,
  label: text('label').notNull(),
  value: text('value').notNull(),
});

export const cv = pgTable('cv', {
  ...listBase,
  period: text('period').notNull(),
  role: text('role').notNull(),
  note: text('note').notNull(),
});

/*
 * Row types for the window components. They are `import type` only, so drizzle never reaches a
 * client bundle — which is what lets `components/windows/*` describe its props with the real
 * shape instead of re-declaring a structural copy that can silently drift from the column.
 */
export type About = typeof about.$inferSelect;
export type Contact = typeof contact.$inferSelect;
export type NowLine = typeof now.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Talk = typeof talks.$inferSelect;
export type ShelfItem = typeof shelf.$inferSelect;
export type Uses = typeof uses.$inferSelect;
export type CvRow = typeof cv.$inferSelect;
