import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** The seven windows a visitor can actually open; the other three ship disabled (D13). */
const LIVE = ['about.md', 'projects/', 'now.txt', 'uses.txt', 'resume.pdf', 'say-hi.eml', 'entropy.exe'];

/**
 * Below the breakpoint the menu bar collapses to a hamburger (D3), so the launcher for a given
 * window is not on screen until it is opened. The panel closes on selection, so it has to be
 * reopened for each one.
 */
async function openPanel(page: import('@playwright/test').Page) {
  const hamburger = page.getByRole('button', { name: 'Menu', exact: true });
  if (!(await hamburger.isVisible())) return;

  // It is a toggle, so clicking unconditionally closes a panel that is already open —
  // which is exactly what happens on the second window in a loop.
  if ((await hamburger.getAttribute('aria-expanded')) !== 'true') await hamburger.click();
}

async function launch(page: import('@playwright/test').Page, label: string) {
  await openPanel(page);
  await page
    .getByRole('button', { name: label, exact: true })
    .filter({ visible: true })
    .first()
    .click();
}

async function openAll(page: import('@playwright/test').Page) {
  for (const label of LIVE) await launch(page, label);
}

for (const theme of ['dark', 'light'] as const) {
  test(`every live window passes axe in the ${theme} theme`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await page.goto('/');
    await openAll(page);

    await expect(page.locator('section[aria-labelledby]')).toHaveCount(LIVE.length);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

test('the contact window offers a copy fallback, not just a mailto', async ({ page }) => {
  await page.goto('/');
  await launch(page, 'say-hi.eml');

  const window = page.locator('section[aria-labelledby]').filter({ hasText: 'say-hi.eml' });
  // mailto silently does nothing for webmail users, so the copy path is the real fallback (D7).
  await expect(window.getByRole('link', { name: /send/ })).toHaveAttribute('href', /^mailto:/);
  await expect(window.getByRole('button', { name: 'copy' })).toBeVisible();
});

test('the resume never renders the phone number', async ({ page }) => {
  await page.goto('/');
  await launch(page, 'resume.pdf');
  // D14 is absolute — assert against the whole document, not just the window.
  await expect(page.locator('body')).not.toContainText('6298871');
});

test('windows whose content is not ready are reachable but inert', async ({ page }) => {
  await page.goto('/');
  const before = await page.locator('section[aria-labelledby]').count();

  for (const label of ['writes.md', 'talks.md', 'reads.md']) {
    await openPanel(page);

    const button = page
      .getByRole('button', { name: label, exact: true })
      .filter({ visible: true })
      .first();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await button.click({ force: true });
  }

  expect(await page.locator('section[aria-labelledby]').count()).toBe(before);
});
