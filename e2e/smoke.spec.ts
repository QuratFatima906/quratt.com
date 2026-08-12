import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the site responds and renders a document', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/.+/);
});

test('the page has exactly one h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('there are no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  // Name the failures in the assertion message — a bare count tells you nothing at 3am.
  expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
