import { notFound } from 'next/navigation';

import { Window } from '@/components/os/window';
import { ProjectWindow, projectSlug } from '@/components/windows/projects';
import { getProjects } from '@/lib/content/queries';
import { JsonLd, softwareSourceCode } from '@/lib/seo/json-ld';
import { pageMetadata } from '@/lib/seo/site';
import { isIndexable, windowDef } from '@/lib/windows';

/** Every project is known at build time, so every detail page prerenders. */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: projectSlug(project.name) }));
}

async function find(slug: string) {
  const projects = await getProjects();
  return projects.find((project) => projectSlug(project.name) === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const project = await find(slug);
  if (!project) return {};

  return pageMetadata({
    title: project.name,
    description: project.desc,
    path: `/projects/${slug}`,
    type: 'article',
    modified: project.updatedAt,
    index: isIndexable('projects'),
  });
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const project = await find(slug);
  if (!project) notFound();

  return (
    // The window belongs to `projects/`, but the URL names one project — so the title bar,
    // which is the page's `h1`, names it too.
    <Window def={{ ...windowDef('projects'), label: project.name, width: 560 }} main>
      <JsonLd data={softwareSourceCode(project)} />
      <ProjectWindow project={project} />
    </Window>
  );
}
