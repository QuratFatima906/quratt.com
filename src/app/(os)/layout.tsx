import { Desktop, type WindowBodies } from '@/components/os/desktop';
import { AboutWindow } from '@/components/windows/about';
import { ContactWindow } from '@/components/windows/contact';
import { EntropyWindow } from '@/components/windows/entropy';
import { NowWindow } from '@/components/windows/now';
import { ProjectsWindow } from '@/components/windows/projects';
import { ReadsWindow } from '@/components/windows/reads';
import { ResumeWindow } from '@/components/windows/resume';
import { TalksWindow } from '@/components/windows/talks';
import { UsesWindow } from '@/components/windows/uses';
import { WritingWindow } from '@/components/windows/writing';
import {
  getAbout,
  getContact,
  getCounts,
  getCv,
  getFeaturedProjects,
  getNow,
  getRecentPosts,
  getRecentShelf,
  getTalks,
  getUses,
} from '@/lib/content/queries';

/**
 * Every collection is fetched once here and handed to the shell as rendered elements
 * (ARCHITECTURE.md, "Rendering & data flow"). The whole payload is a few kilobytes, which is
 * what buys instant background windows with no per-window loading state.
 *
 * `children` is the focused window — the one the URL names, server-rendered by its own route
 * (D4). It renders inside the same desktop, from the same components, so a visitor with
 * JavaScript disabled still gets the page's content and a crawler gets one document per URL.
 */
export default async function OsLayout({ children }: LayoutProps<'/'>) {
  const [about, contact, now, uses, cv, featured, recentPosts, recentShelf, talks, counts] =
    await Promise.all([
      getAbout(),
      getContact(),
      getNow(),
      getUses(),
      getCv(),
      getFeaturedProjects(),
      getRecentPosts(),
      getRecentShelf(),
      getTalks(),
      getCounts(),
    ]);

  const bodies: WindowBodies = {
    about: about ? <AboutWindow about={about} /> : null,
    projects: <ProjectsWindow featured={featured} total={counts.projects} />,
    writes: <WritingWindow recent={recentPosts} total={counts.posts} />,
    talks: <TalksWindow talks={talks} />,
    reads: <ReadsWindow recent={recentShelf} total={counts.shelf} />,
    now: <NowWindow lines={now.lines} updated={now.nowUpdated ?? 'recently'} />,
    uses: <UsesWindow rows={uses} />,
    resume: <ResumeWindow rows={cv} />,
    contact: contact ? <ContactWindow contact={contact} /> : null,
    toy: <EntropyWindow />,
  };

  return <Desktop bodies={bodies}>{children}</Desktop>;
}
