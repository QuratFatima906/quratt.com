import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

let client: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Lazy so that importing the query layer — in a unit test, or in a build that never reaches a
 * cached function — does not require a database to exist.
 *
 * `node-postgres` rather than `@neondatabase/serverless`: every query here runs at build or
 * revalidate time on Node, never per request, so the HTTP driver's edge-runtime advantage buys
 * nothing and costs a second code path. Neon's pooled endpoint speaks the wire protocol, so
 * this connects to local Postgres and to Neon with one connection string and no local proxy.
 */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set — see docs/ENVIRONMENT.md');
    client = drizzle(url, { schema });
  }
  return client;
}
