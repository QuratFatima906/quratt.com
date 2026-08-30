import { Suspense } from 'react';

import { Window } from '@/components/os/window';
import { ProjectsGrid } from '@/components/windows/projects';
import { getProjects } from '@/lib/content/queries';
import { itemList, JsonLd, softwareSourceCode } from '@/lib/seo/json-ld';
import { pageMetadata } from '@/lib/seo/site';
import { isIndexable, windowDef } from '@/lib/windows';

/**
 * A filtered view canonicalises to the unfiltered grid. `?tag=systems` is a subset of the same
 * twelve projects, so three near-identical pages competing with each other would be worse for
 * all of them — the URL stays shareable and crawlable either way.
 */
export const metadata = pageMetadata({
  title: 'Projects',
  description:
    'Things Qurat ul Ain Fatima has built — systems, tools and the occasional silly one. Filter by tag.',
  path: '/projects',
  index: isIndexable('projects'),
});

export default async function ProjectsPage({ searchParams }: PageProps<'/projects'>) {
  const projects = await getProjects();

  return (
    <Window def={{ ...windowDef('projects'), width: 960 }} main>
      <JsonLd data={itemList('Projects', '/projects', projects.map(softwareSourceCode))} />
      {/*
        `?tag=` is request data, so it has to sit behind a boundary for the rest of the route to
        prerender. The fallback is the whole grid rather than a spinner: the static shell is
        then a complete, readable page on its own, and the filtered version replaces it.
      */}
      <Suspense fallback={<ProjectsGrid projects={projects} />}>
        <Filtered projects={projects} searchParams={searchParams} />
      </Suspense>
    </Window>
  );
}

async function Filtered({
  projects,
  searchParams,
}: { projects: Awaited<ReturnType<typeof getProjects>> } & Pick<
  PageProps<'/projects'>,
  'searchParams'
>) {
  const { tag } = await searchParams;
  return <ProjectsGrid projects={projects} tag={typeof tag === 'string' ? tag : undefined} />;
}
