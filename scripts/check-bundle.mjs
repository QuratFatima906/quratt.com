/**
 * Guards the JavaScript budget against regression.
 *
 * ARCHITECTURE.md originally set 100 KB gzipped for `/`. That number was written before the
 * framework floor was measured and is not reachable: React 19 plus the Next 16 App Router
 * runtime is ~175 KB gzipped before a single line of this site's code. Measured by comparing
 * `/preview` (a page with a theme toggle and nothing else) against `/` — the entire OS shell,
 * window manager, drag handling and all, accounts for 11 KB of the difference.
 *
 * So the budget that matters is not the total, which is mostly not ours. It is how much *our*
 * code adds. Both are checked: the app delta is the real signal, and the ceiling catches
 * someone dropping in an animation library.
 *
 * Run against a running production server: `node scripts/check-bundle.mjs [origin]`
 */
import { gzipSync } from 'node:zlib';

const origin = process.argv[2] ?? 'http://localhost:3000';

/** Our code, over the framework floor. An animation library would blow straight through this. */
const APP_BUDGET_KB = 25;
/** Total for the desktop. Tracks the framework; raise it deliberately on a Next major. */
const TOTAL_BUDGET_KB = 200;

/**
 * A failed fetch must never be measured. An error body gzips to almost nothing, so silently
 * accepting one turns a broken server into a passing budget — which is how a stale `next start`
 * on port 3000, serving HTML whose chunks a later build had already replaced, once reported
 * "budget met" while a fifth of the JavaScript 500ed.
 */
async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
}

async function bytesFor(path) {
  const html = await (await get(new URL(path, origin))).text();
  const srcs = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
  if (!srcs.length) throw new Error(`no script tags found at ${path} — is this the right origin?`);

  let total = 0;
  for (const src of new Set(srcs)) {
    const body = Buffer.from(await (await get(new URL(src, origin))).arrayBuffer());
    // Measure what a browser actually receives, not what is on disk.
    total += gzipSync(body).length;
  }
  return total;
}

const kb = (bytes) => (bytes / 1024).toFixed(1);

const [baseline, desktop] = await Promise.all([bytesFor('/preview'), bytesFor('/')]);
const app = desktop - baseline;

console.log(`framework floor  ${kb(baseline).padStart(7)} KB  (/preview)`);
console.log(`app code         ${kb(app).padStart(7)} KB  (budget ${APP_BUDGET_KB} KB)`);
console.log(`total for /      ${kb(desktop).padStart(7)} KB  (budget ${TOTAL_BUDGET_KB} KB)`);

const failures = [];
if (app > APP_BUDGET_KB * 1024) failures.push(`app code ${kb(app)} KB over ${APP_BUDGET_KB} KB`);
if (desktop > TOTAL_BUDGET_KB * 1024)
  failures.push(`total ${kb(desktop)} KB over ${TOTAL_BUDGET_KB} KB`);

if (failures.length) {
  console.error(`\nJS budget exceeded:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log('\nJS budget met.');
