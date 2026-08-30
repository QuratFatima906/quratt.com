/**
 * Loads the placeholder content and the authored post bodies into Postgres.
 *
 * Idempotent: every row carries a stable id, so a re-run updates in place. The `updated_at`
 * trigger only fires when something actually changed, so re-seeding unchanged content does not
 * churn the timestamps that feed the sitemap.
 */
import { existsSync, readFileSync } from 'node:fs';

import { getTableColumns, getTableName, notInArray, sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import { seed } from '../src/content/seed';
import { db } from '../src/lib/content/db';
import * as t from '../src/lib/content/schema';
import { postSchema } from '../src/lib/content/schema';

// Next loads `.env.local` for the app; a plain node script has to ask. `loadEnvFile` does not
// overwrite a variable that is already set, so `DATABASE_URL=… pnpm db:seed` still targets
// whatever the caller named — which is what lets one command point at another database.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');

// Identity and timestamps are the database's business; only content columns are overwritten.
const managed = new Set(['id', 'createdAt', 'updatedAt']);

function overwriteWithIncoming(table: PgTable) {
  return Object.fromEntries(
    Object.entries(getTableColumns(table))
      .filter(([key]) => !managed.has(key))
      .map(([key, column]) => [key, sql.raw(`excluded."${column.name}"`)]),
  );
}

/**
 * Upsert by stable id, then drop anything the seed no longer describes.
 *
 * Without the delete, shortening a list orphans its tail: ids are assigned from array position,
 * so removing one row leaves the old last row behind at an id nothing writes to again. It keeps
 * rendering, because the queries read the table and not the seed file. That is how a duplicate
 * `minipaxos` survived in the dev database — and it is what would happen the day the placeholder
 * projects are replaced by a shorter list of real ones.
 *
 * The seed file is the source of truth for content (docs/RUNBOOK.md). When P9's editor lands and
 * rows can be created outside it, this is the line that has to learn about them.
 */
async function upsert(table: PgTable & { id: PgColumn }, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  await db()
    .insert(table)
    .values(rows)
    .onConflictDoUpdate({ target: table.id, set: overwriteWithIncoming(table) });

  const keep = rows.map((row) => row.id as number);
  await db()
    .delete(table)
    .where(notInArray(table.id, keep));
}

/**
 * Post bodies are authored as files and served from the database (D6). This is a trust
 * boundary — arbitrary file contents end up in a column — so the file is validated by the same
 * zod field that describes the column. The slug is already regex-checked by `seedSchema`, so it
 * cannot walk out of the directory.
 */
function readBody(slug: string): string | null {
  const file = new URL(`../src/content/posts/${slug}.mdx`, import.meta.url);
  if (!existsSync(file)) return null;
  return postSchema.shape.body.parse(readFileSync(file, 'utf8'));
}

/**
 * List ids are assigned from the seed's own ordering, so the sequence has to be moved past them
 * or the first admin insert collides.
 */
async function syncSequence(table: PgTable) {
  const name = getTableName(table);
  await db().execute(
    sql.raw(
      `SELECT setval(pg_get_serial_sequence('${name}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "${name}"))`,
    ),
  );
}

async function main() {
  const about: typeof t.about.$inferInsert = { id: 1, ...seed.about };
  const contact: typeof t.contact.$inferInsert = { id: 1, ...seed.contact };
  const nowMeta: typeof t.nowMeta.$inferInsert = { id: 1, nowUpdated: seed.nowUpdated };

  const now: (typeof t.now.$inferInsert)[] = seed.now.map((row, i) => ({
    id: i + 1,
    sortOrder: i,
    ...row,
  }));
  const projects: (typeof t.projects.$inferInsert)[] = seed.projects.map((row, i) => ({
    id: i + 1,
    sortOrder: i,
    ...row,
  }));
  const posts: (typeof t.posts.$inferInsert)[] = seed.posts.map((row, i) => ({
    id: i + 1,
    sortOrder: i,
    ...row,
    body: readBody(row.slug),
  }));
  const talks: (typeof t.talks.$inferInsert)[] = seed.talks.map((row, i) => ({
    id: i + 1,
    sortOrder: i,
    ...row,
  }));
  const shelf: (typeof t.shelf.$inferInsert)[] = seed.shelf.map((row, i) => ({
    id: i + 1,
    sortOrder: i,
    ...row,
  }));
  const uses: (typeof t.uses.$inferInsert)[] = seed.uses.map((row, i) => ({
    id: i + 1,
    sortOrder: i,
    ...row,
  }));
  const cv: (typeof t.cv.$inferInsert)[] = seed.cv.map((row, i) => ({
    id: i + 1,
    sortOrder: i,
    ...row,
  }));

  await upsert(t.about, [about]);
  await upsert(t.contact, [contact]);
  await upsert(t.nowMeta, [nowMeta]);
  await upsert(t.now, now);
  await upsert(t.projects, projects);
  await upsert(t.posts, posts);
  await upsert(t.talks, talks);
  await upsert(t.shelf, shelf);
  await upsert(t.uses, uses);
  await upsert(t.cv, cv);

  for (const table of [t.now, t.projects, t.posts, t.talks, t.shelf, t.uses, t.cv]) {
    await syncSequence(table);
  }

  const withBodies = posts.filter((post) => post.body !== null).length;
  console.log(
    `seeded: about 1 · contact 1 · now ${now.length} · projects ${projects.length} · ` +
      `posts ${posts.length} (${withBodies} with bodies) · talks ${talks.length} · ` +
      `shelf ${shelf.length} · uses ${uses.length} · cv ${cv.length}`,
  );
}

await main();
await db().$client.end();
