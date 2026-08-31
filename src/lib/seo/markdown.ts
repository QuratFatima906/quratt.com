import { logOrder } from '@/components/windows/community';
import { projectSlug } from '@/components/windows/projects';
import { readingTime } from '@/components/windows/writing';
import {
  getAbout,
  getContact,
  getCommunity,
  getCv,
  getNow,
  getPosts,
  getProjects,
  getShelf,
  getTalks,
  getUses,
} from '@/lib/content/queries';
import { isIndexable } from '@/lib/windows';

/**
 * The markdown face of the site.
 *
 * One builder feeds three consumers — the `.md` twin of each page, `/llms-full.txt`, and the
 * link list in `/llms.txt`. Generating them from a single source is the whole point: a stale
 * `llms.txt` is worse than none, and three hand-maintained copies of the same content would
 * drift within a week. Everything here comes out of the database, so adding a project changes
 * all three with no code edit.
 *
 * Only indexable windows appear. The three that ship disabled (D13) carry `noindex` and are
 * absent from the sitemap, so advertising them to an agent would contradict both.
 */
export type Doc = {
  /** Route path, without the `.md` suffix. */
  path: string;
  title: string;
  /** One line, used as the link description in `llms.txt`. */
  summary: string;
  section: string;
  updatedAt: Date;
  markdown: string;
};

const line = (label: string, value: string | null | undefined) =>
  value ? `- **${label}:** ${value}` : null;

/**
 * Drops only absent parts, never empty strings — an empty string is a deliberate blank line,
 * and markdown needs those to separate a heading from a paragraph or one block from the next.
 * Filtering on truthiness here silently welds every block together.
 */
const join = (parts: (string | null | undefined)[]) =>
  parts.filter((part) => part !== null && part !== undefined).join('\n');

/** `updated_at` is trigger-maintained, so freshness is real rather than a build timestamp. */
const newest = (rows: readonly { updatedAt: Date }[], fallback: Date): Date =>
  rows.reduce<Date>((max, row) => (row.updatedAt > max ? row.updatedAt : max), fallback);

export async function documents(): Promise<Doc[]> {
  const [about, contact, now, uses, cv, projects, posts, talks, shelf, community] =
    await Promise.all([
      getAbout(),
      getContact(),
      getNow(),
      getUses(),
      getCv(),
      getProjects(),
      getPosts(),
      getTalks(),
      getShelf(),
      getCommunity(),
    ]);

  const epoch = new Date(0);
  const docs: Doc[] = [];

  if (about && isIndexable('about')) {
    docs.push({
      path: '/about',
      title: `About ${about.name}`,
      summary: `${about.role} — ${about.meta}`,
      section: 'Profile',
      updatedAt: about.updatedAt,
      markdown: join([
        `# ${about.name}`,
        '',
        join([line('Role', about.role), line('Based', about.meta)]),
        '',
        about.bio1,
        '',
        about.bio2,
      ]),
    });
  }

  if (isIndexable('resume') && cv.length) {
    docs.push({
      path: '/resume',
      title: 'Résumé',
      summary: 'Roles, dates and what each one involved.',
      section: 'Profile',
      updatedAt: newest(cv, epoch),
      // The résumé's phone number is not in the database and must never reach here (D14).
      markdown: join([
        '# Résumé',
        '',
        ...cv.flatMap((row) => [`## ${row.role}`, '', `*${row.period}*`, '', row.note, '']),
      ]),
    });
  }

  if (isIndexable('projects')) {
    const visible = projects;
    docs.push({
      path: '/projects',
      title: 'Projects',
      summary: `${visible.length} projects, tagged by kind.`,
      section: 'Work',
      updatedAt: newest(visible, epoch),
      markdown: join([
        '# Projects',
        '',
        ...visible.map((p) => `- **${p.name}** (${p.year}, ${p.lang}, ${p.tag}) — ${p.desc}`),
      ]),
    });

    for (const project of visible) {
      docs.push({
        path: `/projects/${projectSlug(project.name)}`,
        title: project.name,
        summary: project.desc,
        section: 'Work',
        updatedAt: project.updatedAt,
        markdown: join([
          `# ${project.name}`,
          '',
          join([
            line('Year', project.year),
            line('Language', project.lang),
            line('Tag', project.tag),
          ]),
          '',
          project.desc,
        ]),
      });
    }
  }

  if (isIndexable('writes')) {
    docs.push({
      path: '/writing',
      title: 'Writing',
      summary: `${posts.length} posts.`,
      section: 'Writing',
      updatedAt: newest(posts, epoch),
      markdown: join(['# Writing', '', ...posts.map((p) => `- **${p.title}** — ${p.blurb}`)]),
    });

    for (const post of posts) {
      docs.push({
        path: `/writing/${post.slug}`,
        title: post.title,
        summary: post.blurb,
        section: 'Writing',
        updatedAt: post.updatedAt,
        markdown: join([
          `# ${post.title}`,
          '',
          join([line('Published', post.date), line('Reading time', readingTime(post))]),
          '',
          post.blurb,
          '',
          // Three of seven seeded posts have no body; the twin must still be a valid document.
          post.body ?? '*This post has not been written yet.*',
        ]),
      });
    }
  }

  if (isIndexable('talks') && talks.length) {
    docs.push({
      path: '/talks',
      title: 'Talks',
      summary: `${talks.length} talks and workshops.`,
      section: 'Speaking',
      updatedAt: newest(talks, epoch),
      markdown: join([
        '# Talks',
        '',
        ...talks.map((t) => `- **${t.title}** — ${t.venue}, ${t.year}`),
      ]),
    });
  }

  if (isIndexable('reads') && shelf.length) {
    docs.push({
      path: '/reads',
      title: 'Reading',
      summary: `${shelf.length} books, with their state.`,
      section: 'Reading',
      updatedAt: newest(shelf, epoch),
      markdown: join([
        '# Reading',
        '',
        ...shelf.map((b) => `- *${b.title}* — ${b.state}${b.note ? `, ${b.note}` : ''}`),
      ]),
    });
  }

  if (isIndexable('community') && community.meta && community.roles.length) {
    const { meta, roles } = community;
    docs.push({
      path: '/community',
      title: 'Community',
      summary: `${roles.length} community roles — chapters, workshops and judging.`,
      section: 'Community',
      updatedAt: newest([meta, ...roles], epoch),
      // One entry per role, in the same order the window's log prints them — newest first, via
      // the same `logOrder` — so an agent reads the rows a visitor sees rather than a summary of
      // them, and in the order they see them.
      markdown: join([
        '# Community',
        '',
        meta.intro,
        '',
        meta.kicker,
        '',
        ...logOrder(roles).flatMap((role) => [
          `## ${role.role} — ${role.org}`,
          '',
          join([line('When', role.period), line('Note', role.note || null)]),
          '',
          role.body || null,
          role.body ? '' : null,
        ]),
        '## What all of this taught me',
        '',
        meta.lesson1,
        '',
        meta.lesson2,
      ]),
    });
  }

  if (isIndexable('now') && now.lines.length) {
    docs.push({
      path: '/now',
      title: 'Now',
      summary: 'What I am working on at the moment.',
      section: 'Profile',
      updatedAt: newest(now.lines, epoch),
      markdown: join([
        '# Now',
        '',
        now.nowUpdated ? `*Updated ${now.nowUpdated}.*` : null,
        '',
        ...now.lines.map((l) => `- ${l.line}`),
      ]),
    });
  }

  if (isIndexable('uses') && uses.length) {
    docs.push({
      path: '/uses',
      title: 'Uses',
      summary: 'Tools and setup.',
      section: 'Profile',
      updatedAt: newest(uses, epoch),
      markdown: join(['# Uses', '', ...uses.map((u) => `- **${u.label}:** ${u.value}`)]),
    });
  }

  if (contact && isIndexable('contact')) {
    docs.push({
      path: '/contact',
      title: 'Contact',
      summary: 'How to get in touch.',
      section: 'Profile',
      updatedAt: contact.updatedAt,
      markdown: join([
        '# Contact',
        '',
        line('Email', contact.email),
        '',
        contact.note,
      ]),
    });
  }

  return docs;
}

/** Looks a document up by its route path, for the `.md` twin handler. */
export async function documentFor(path: string): Promise<Doc | undefined> {
  return (await documents()).find((doc) => doc.path === path);
}
