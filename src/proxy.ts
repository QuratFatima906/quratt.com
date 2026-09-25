import { track } from '@vercel/analytics/server';
import { NextResponse } from 'next/server';
import type { NextProxy } from 'next/server';

import { agentName, classify } from '@/lib/agents';

/**
 * Counts the visitors `@vercel/analytics` cannot see.
 *
 * Its script is client-side JavaScript, and no crawler runs JavaScript — so every agent that
 * reads `/llms.txt`, a `.md` twin or a page is invisible to it. This sends one server-side
 * event for those, into the same dashboard, so both halves of the audience sit side by side.
 *
 * `proxy.ts`, not `middleware.ts`: the middleware convention is deprecated in Next 16 and
 * renamed, and the file runs on the Node runtime by default (setting `runtime` here throws).
 *
 * It has to be here and not in the route handlers. `/llms.txt`, `/llms-full.txt` and the `.md`
 * twins all set `s-maxage=3600, stale-while-revalidate=86400`, so a crawler's fetch is answered
 * from the edge cache and the handler never runs — tracking inside `GET()` would see about one
 * request an hour per URL and miss the rest without ever looking wrong. Proxy runs ahead of the
 * cache, so it sees all of them.
 */
export const proxy: NextProxy = (request, event) => {
  const visitor = classify(request.headers.get('user-agent'));

  // Humans are already counted, accurately and for free, by the script in the page. Sending a
  // second event for them would double every pageview against the plan's event allowance and
  // tell us nothing new — so the only traffic that costs an event here is traffic that would
  // otherwise go unrecorded. It also means this early return, not the matcher, is what keeps
  // the proxy cheap: for a human visitor the whole thing is a header read and a string compare.
  if (visitor !== 'human') {
    event.waitUntil(
      track(
        'agent-visit',
        { visitor, agent: agentName(request.headers.get('user-agent')), path: request.nextUrl.pathname },
        // Real headers, so the event keeps the source IP the platform derives geo from.
        // ponytail: if these never land, Vercel is filtering the bot UA out at ingest — pass a
        // synthetic `user-agent` here instead and keep the identity in the properties above.
        { headers: request.headers },
      ),
    );
  }

  // `waitUntil` keeps the request alive for the beacon without making the visitor wait on it.
  return NextResponse.next();
};

/**
 * Everything a visitor can meaningfully *read*, which is wider than the agent-shaped surfaces
 * alone: an agent sent here by someone's question fetches `/about`, not `/about.md`, and that
 * hit is the single most interesting one on the site. The résumé PDF in `public/` counts too.
 *
 * Excluded are the things no one reads on purpose — the build's own static output and the
 * favicon — because each would be a proxy invocation spent on an asset.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
