import { PERSON, absolute, siteUrl } from '@/lib/seo/site';
import { documents } from '@/lib/seo/markdown';

/**
 * The curated front door for agents.
 *
 * Kept short and grouped, per the convention that settled around the format: an authoritative
 * blockquote first, then sections of links. Generated from the database, because a stale
 * `llms.txt` is worse than none — this one cannot fall behind the site.
 *
 * Worth being honest about its value: 2026 data shows `llms.txt` alone produces no measurable
 * citation uplift. The JSON-LD and semantic HTML from P5 are what actually move visibility.
 * This is cheap forward insurance, not the lever.
 */
/** Cached as a string: a `Response` cannot cross a `use cache` boundary. */
async function body() {
  'use cache';
  const docs = await documents();

  const sections = [...new Set(docs.map((doc) => doc.section))];
  const grouped = sections.map((section) =>
    [
      `## ${section}`,
      '',
      ...docs
        .filter((doc) => doc.section === section)
        .map((doc) => `- [${doc.title}](${absolute(doc.path)}.md): ${doc.summary}`),
      '',
    ].join('\n'),
  );

  return [
    `# ${PERSON.name}`,
    '',
    `> ${PERSON.jobTitle} based in ${PERSON.locality}, Pakistan. Eight years across software`,
    `> architecture, API development and scalability on AWS and GCP, with a bias toward`,
    `> observability, incident response and the unglamorous parts of production systems.`,
    '',
    'Every page below is also available as markdown by appending `.md` to its URL.',
    `The full text of all of them is at ${absolute('/llms-full.txt')}.`,
    '',
    ...grouped,
    '',
    '## Elsewhere',
    '',
    ...PERSON.sameAs.filter((url) => !url.startsWith('mailto:')).map((url) => `- ${url}`),
    '',
  ].join('\n');
}

export async function GET() {
  return new Response(await body(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      // Long-lived but revalidatable: the file only changes when content does.
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'x-site': siteUrl,
    },
  });
}
