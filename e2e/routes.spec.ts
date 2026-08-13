import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Every route in ARCHITECTURE.md's route map, with a phrase from its real content. The phrase
 * is the point: a shell that renders its chrome and no content would pass a status check and
 * fail a reader, and the whole phase exists to make the OS readable without JavaScript.
 */
const ROUTES: [path: string, h1: string, content: string][] = [
  ['/', 'Qurat ul ain Fatima — qurat.os', 'trapdoor'],
  ['/about', 'about.md', 'trapdoor'],
  ['/projects', 'projects/', 'quietwatch'],
  ['/projects/quietwatch', 'quietwatch', 'only pings you when it actually matters'],
  ['/writing', 'writes.md', 'The bug was in the calendar, obviously'],
  ['/writing/postgres-told-me-the-truth', "Postgres told me the truth, I just didn't listen", 'Rows Removed by Filter'], // prettier-ignore
  ['/talks', 'talks.md', 'Everything I know about queues'],
  ['/talks/invite', 'invite-qurat.form', 'Yes, probably.'],
  ['/reads', 'reads.md', 'best of the year so far'],
  ['/now', 'now.txt', 'open to staff roles'],
  ['/uses', 'uses.txt', 'editor'],
  ['/resume', 'resume.pdf', 'Shopsense'],
  ['/contact', 'say-hi.eml', 'quratfatima581@gmail.com'],
];

/** The three windows that ship disabled hold placeholder content, so they are not indexed. */
const NOINDEX = ['/writing', '/writing/postgres-told-me-the-truth', '/talks', '/talks/invite', '/reads']; // prettier-ignore

test.describe('the route map', () => {
  for (const [path, h1, content] of ROUTES) {
    test(`${path} serves one h1, one main, and readable content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Exactly one `h1` per route (ARCHITECTURE.md#ai-discoverability). The focused window
      // carries it; every other window on the desktop is a section under it.
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(h1);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('main')).toContainText(content);
    });
  }
});

/**
 * The load-bearing requirement: the desktop is a client-side OS, and it still has to be a
 * readable document with scripting off. Same components, same content, no window manager.
 */
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  for (const [path, h1, content] of ROUTES) {
    test(`${path} renders without scripts`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(h1);
      await expect(page.locator('main')).toContainText(content);
    });
  }

  test('links between windows are real URLs, not handlers', async ({ page }) => {
    await page.goto('/about');
    const link = page.getByRole('link', { name: /resume\.pdf/ });
    await expect(link).toHaveAttribute('href', '/resume');
    // Forced because Playwright's stability check runs `requestAnimationFrame` in the page's
    // main world, which cannot execute with scripting off — not because the link is obscured.
    await link.click({ force: true });
    await expect(page).toHaveURL('/resume');
    await expect(page.locator('h1')).toHaveText('resume.pdf');
  });
});

test.describe('metadata', () => {
  for (const [path] of ROUTES) {
    test(`${path} declares a canonical and an indexing decision`, async ({ page }) => {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', new RegExp(`${path === '/' ? '/?$' : path}$`));

      const robots = page.locator('meta[name="robots"]');
      if (NOINDEX.includes(path)) await expect(robots).toHaveAttribute('content', /noindex/);
      else await expect(robots).toHaveCount(0);
    });
  }

  test('the sitemap lists every indexable route and nothing that is not', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    const listed = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);

    for (const [path] of ROUTES) {
      if (NOINDEX.includes(path)) expect(listed).not.toContain(path);
      else expect(listed).toContain(path);
    }
  });
});

test.describe('the tag filter', () => {
  test('restores a filtered view from the URL, on the server', async ({ page, request }) => {
    // Server-side first: the filtered grid is in the HTML the server sent, not the product of
    // a client effect. `?tag=systems` selects four of the eleven visible projects.
    const html = await (await request.get('/projects?tag=systems')).text();
    expect(html).toContain('aria-current="true"');
    expect(html).toMatch(/4<!-- --> shown/);

    await page.goto('/projects?tag=systems');
    const cards = page.locator('main ul > li');
    await expect(cards).toHaveCount(4);
    await expect(page.getByRole('link', { name: 'systems' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    // A hand-typed tag that matches nothing must not empty the grid.
    await page.goto('/projects?tag=nonsense');
    await expect(page.locator('main ul > li')).toHaveCount(11);
  });
});

test.describe('navigation', () => {
  test.skip(({ isMobile }) => Boolean(isMobile), 'windows are sheets below the md breakpoint');

  test('moves focus between windows without a full reload, and back again', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('main[data-window="about"]')).toBeVisible();

    // A marker that only survives a soft navigation.
    await page.evaluate(() => {
      (window as unknown as { alive?: boolean }).alive = true;
    });

    // Open a second window from the menu bar, then click its title bar to focus it — that is
    // what promotes a background window to the server-rendered one (ARCHITECTURE.md).
    //
    // The assertions below read `h1:visible`: Cache Components keeps the route you came from
    // mounted under React's `<Activity mode="hidden">` so going back is instant, and a
    // `display: none` subtree is out of the accessibility tree and out of every crawler's
    // reach. The served HTML for each URL still carries exactly one `h1` — the route-map
    // tests above assert that on a cold load.
    await page.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'now.txt', exact: true }).click(); // prettier-ignore
    await page.getByRole('link', { name: 'now.txt', exact: true }).click();

    await expect(page).toHaveURL('/now');
    await expect(page.locator('main[data-window="now"]')).toBeVisible();
    await expect(page.locator('h1:visible')).toHaveText('now.txt');
    expect(await page.evaluate(() => (window as unknown as { alive?: boolean }).alive)).toBe(true);

    await page.goBack();
    await expect(page).toHaveURL('/about');
    await expect(page.locator('main[data-window="about"]')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { alive?: boolean }).alive)).toBe(true);

    await page.goForward();
    await expect(page).toHaveURL('/now');
    await expect(page.locator('main[data-window="now"]')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { alive?: boolean }).alive)).toBe(true);
  });

  test('closing the focused window returns to the desktop', async ({ page }) => {
    await page.goto('/uses');
    await page.getByRole('button', { name: 'Close uses.txt' }).first().click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('main[data-window]')).toHaveCount(0);
  });
});

/** Windows fade and scale in over 160ms; axe run mid-transition sees translucent text. */
async function settled(page: Page) {
  await page.waitForFunction(
    () =>
      document.querySelector('[data-window]') !== null &&
      document.getAnimations().every((animation) => animation.playState !== 'running'),
  );
}

async function axe(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return violations.map((v) => `${v.id}: ${v.help}`);
}

for (const theme of ['dark', 'light'] as const) {
  test(`every route passes axe in the ${theme} theme`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);

    for (const [path] of ROUTES) {
      await page.goto(path);
      await settled(page);
      expect(await axe(page), `${path} in ${theme}`).toEqual([]);
    }
  });
}
