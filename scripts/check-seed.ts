/**
 * Asserts the database holds exactly the rows `src/content/seed.ts` describes — no more.
 *
 * The seeder's own output cannot answer this: it prints the length of its input arrays, so it
 * reports the same numbers whether or not a re-run duplicated every row. Run this after
 * seeding twice and a non-idempotent upsert shows up as a count that grew.
 */
import { existsSync } from 'node:fs';

import { getTableName, sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

import { seed } from '../src/content/seed';
import { db } from '../src/lib/content/db';
import * as t from '../src/lib/content/schema';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');

/** Singletons are 1 by construction; every other table is as long as its seed array. */
const expected: [table: PgTable, rows: number][] = [
  [t.about, 1],
  [t.contact, 1],
  [t.nowMeta, 1],
  [t.now, seed.now.length],
  [t.projects, seed.projects.length],
  [t.posts, seed.posts.length],
  [t.talks, seed.talks.length],
  [t.shelf, seed.shelf.length],
  [t.uses, seed.uses.length],
  [t.cv, seed.cv.length],
];

const wrong: string[] = [];

for (const [table, rows] of expected) {
  const name = getTableName(table);
  const [row] = await db()
    .select({ n: sql<number>`count(*)::int` })
    .from(table);
  const actual = row?.n ?? -1;
  const ok = actual === rows;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${actual} (expected ${rows})`);
  if (!ok) wrong.push(`${name}: ${actual} rows, expected ${rows}`);
}

await db().$client.end();

if (wrong.length > 0) {
  console.error(`\nseed is not idempotent — ${wrong.length} table(s) off:\n  ${wrong.join('\n  ')}`);
  process.exit(1);
}

console.log('\nrow counts match the seed exactly');
