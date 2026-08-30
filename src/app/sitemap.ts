import type { MetadataRoute } from 'next';

import { projectSlug } from '@/components/windows/projects';
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
import { absolute } from '@/lib/seo/site';
import { isIndexable, type WindowKey } from '@/lib/windows';

/**
 * `lastModified` comes from the database's trigger-maintained `updated_at`, never from the
 * build clock — a redeploy that changed nothing must not claim every page is new, or the
 * signal stops meaning anything.
 *
 * Every route is listed with the window it belongs to and then filtered by the registry's
 * availability flag, so every window that ships disabled (D13) drops out here for exactly
 * the reason their pages carry `noindex`. One flag drives both; they cannot disagree.
 */
const latest = (rows: readonly { updatedAt: Date }[], fallback: Date): Date =>
  rows.reduce<Date>((newest, row) => (row.updatedAt > newest ? row.updatedAt : newest), fallback);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  const entries: (MetadataRoute.Sitemap[number] & { window?: WindowKey })[] = [
    { url: absolute('/'), lastModified: latest(projects, about?.updatedAt ?? epoch), priority: 1 },
    { url: absolute('/about'), lastModified: about?.updatedAt ?? epoch, priority: 0.9, window: 'about' }, // prettier-ignore
    { url: absolute('/projects'), lastModified: latest(projects, epoch), priority: 0.9, window: 'projects' }, // prettier-ignore
    ...projects.map((project) => ({
      url: absolute(`/projects/${projectSlug(project.name)}`),
      lastModified: project.updatedAt,
      priority: 0.7,
      window: 'projects' as const,
    })),
    { url: absolute('/writing'), lastModified: latest(posts, epoch), priority: 0.9, window: 'writes' }, // prettier-ignore
    ...posts.map((post) => ({
      url: absolute(`/writing/${post.slug}`),
      lastModified: post.updatedAt,
      priority: 0.7,
      window: 'writes' as const,
    })),
    { url: absolute('/talks'), lastModified: latest(talks, epoch), priority: 0.6, window: 'talks' },
    { url: absolute('/talks/invite'), lastModified: latest(talks, epoch), priority: 0.4, window: 'talks' }, // prettier-ignore
    { url: absolute('/reads'), lastModified: latest(shelf, epoch), priority: 0.5, window: 'reads' },
    { url: absolute('/resume'), lastModified: latest(cv, epoch), priority: 0.8, window: 'resume' },
    { url: absolute('/contact'), lastModified: contact?.updatedAt ?? epoch, priority: 0.6, window: 'contact' }, // prettier-ignore
    { url: absolute('/community'), lastModified: latest(community.roles, community.meta?.updatedAt ?? epoch), priority: 0.7, window: 'community' }, // prettier-ignore
    { url: absolute('/now'), lastModified: latest(now.lines, epoch), priority: 0.5, window: 'now' },
    { url: absolute('/uses'), lastModified: latest(uses, epoch), priority: 0.5, window: 'uses' },
  ];

  return entries
    .filter((entry) => !entry.window || isIndexable(entry.window))
    .map((entry) => ({
      url: entry.url,
      lastModified: entry.lastModified,
      priority: entry.priority,
    }));
}
