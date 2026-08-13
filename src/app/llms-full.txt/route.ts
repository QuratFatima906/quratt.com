import { PERSON, absolute } from '@/lib/seo/site';
import { documents } from '@/lib/seo/markdown';

/**
 * Every page's markdown, concatenated and `---` separated.
 *
 * Agents fetch this more than twice as often as `llms.txt`, so it is the file that actually
 * gets read. Same source as the `.md` twins, so the two can never disagree — a test asserts it.
 */
/** Cached as a string: a `Response` cannot cross a `use cache` boundary. */
async function body() {
  'use cache';
  const docs = await documents();

  return [
    `# ${PERSON.name}`,
    '',
    `${PERSON.jobTitle}, ${PERSON.locality}, Pakistan.`,
    '',
    ...docs.flatMap((doc) => [
      '---',
      '',
      `Source: ${absolute(doc.path)}`,
      `Updated: ${doc.updatedAt.toISOString().slice(0, 10)}`,
      '',
      doc.markdown,
      '',
    ]),
  ].join('\n');
}

export async function GET() {
  return new Response(await body(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
