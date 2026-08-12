import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const menu = (page: Page, label: string) =>
  page.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: label, exact: true });
const taskbar = (page: Page) => page.getByRole('navigation', { name: 'Open windows' });
const openWindows = (page: Page) => page.locator('[data-window]');

test.describe('desktop', () => {
  test.skip(({ isMobile }) => Boolean(isMobile), 'windows are sheets below the md breakpoint');

  test('opens, stacks and raises windows, and the taskbar mirrors them exactly', async ({ page }) => {
    await page.goto('/');
    await expect(openWindows(page)).toHaveAttribute('data-window', 'about');

    for (const label of ['projects/', 'now.txt', 'entropy.exe']) await menu(page, label).click();
    await expect(openWindows(page)).toHaveCount(4);
    await expect(taskbar(page).getByRole('listitem')).toHaveCount(4);

    // Stacking order is the taskbar's order, and the last opened is on top.
    const zOf = (key: string) =>
      page.locator(`[data-window="${key}"]`).evaluate((el) => Number(getComputedStyle(el).zIndex));
    expect(await zOf('toy')).toBeGreaterThan(await zOf('about'));

    await page.locator('[data-window="about"]').click({ position: { x: 40, y: 60 } });
    expect(await zOf('about')).toBeGreaterThan(await zOf('toy'));

    await page.getByRole('region', { name: 'now.txt' }).getByRole('button', { name: 'Close now.txt' }).click();
    await expect(openWindows(page)).toHaveCount(3);
    await expect(taskbar(page).getByRole('listitem')).toHaveCount(3);

    // Dragging: a real mouse on the title bar, and only `translate` may move.
    const about = page.locator('[data-window="about"]');
    const bar = (await about.locator('> div').first().boundingBox())!;
    const before = (await about.boundingBox())!;
    await page.mouse.move(bar.x + 40, bar.y + 16);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(bar.x + 40 + i * 15, bar.y + 16 + i * 10);
    await page.mouse.up();
    const after = (await about.boundingBox())!;
    expect(after.x - before.x).toBeGreaterThan(100);
    expect(after.y - before.y).toBeGreaterThan(60);
    expect(await about.evaluate((el) => getComputedStyle(el).translate)).not.toBe('none');

    await page.getByRole('button', { name: 'close all' }).click();
    await expect(openWindows(page)).toHaveCount(0);
    await expect(taskbar(page).getByText('nothing open')).toBeVisible();
  });

  test('the keyboard alone opens a window, lands inside it, and returns to the opener', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');
    const opener = menu(page, 'uses.txt');
    await opener.focus();
    await page.keyboard.press('Enter');

    const window = page.locator('[data-window="uses"]');
    await expect(window).toBeFocused();

    const close = page
      .getByRole('region', { name: 'uses.txt' })
      .getByRole('button', { name: 'Close uses.txt' });
    // WebKit puts buttons in the tab order only when macOS Full Keyboard Access is on, and
    // Playwright cannot toggle that. The rest of the journey is identical either way.
    if (browserName === 'webkit') await close.focus();
    else await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(window).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('unavailable windows stay reachable, say why, and open nothing', async ({ page }) => {
    await page.goto('/');
    const writes = menu(page, 'writes.md');

    await expect(writes).toHaveAttribute('aria-disabled', 'true');
    // Not the `disabled` attribute: that would take it out of the tab order, and then the
    // greying-out could never be explained to anyone who navigates by keyboard.
    // Playwright reads `aria-disabled` as disabled, so the check has to be the real DOM
    // property — that is the one that decides whether the button keeps its place in the
    // tab order, which is the whole point.
    expect(await writes.evaluate((el: HTMLButtonElement) => el.disabled)).toBe(false);

    await writes.focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('coming soon');
    await expect(writes).toHaveAttribute(
      'aria-describedby',
      (await tooltip.getAttribute('id')) ?? '',
    );

    // Keyboard activation, because that is the path that must open nothing — Playwright will
    // not synthesise a click on an `aria-disabled` element at all.
    await writes.press('Enter');
    await writes.press(' ');
    await expect(page.locator('[data-window="writes"]')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(writes).toBeFocused();
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`no accessibility violations in ${theme} with three windows open`, async ({ page }) => {
      await page.addInitScript(`localStorage.setItem('theme', '${theme}')`);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      for (const label of ['projects/', 'resume.pdf']) await menu(page, label).click();
      await expect(openWindows(page)).toHaveCount(3);
      // A tooltip is part of the page too, so open one before the sweep.
      await menu(page, 'talks.md').focus();
      await expect(page.getByRole('tooltip')).toBeVisible();

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(
        violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`)),
      ).toEqual([]);
    });
  }

  test.describe('with reduced motion', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });

    test('no window transition survives', async ({ page }) => {
      await page.goto('/');
      const durations = await page
        .locator('[data-window="about"]')
        .evaluate((el) =>
          getComputedStyle(el)
            .transitionDuration.split(',')
            .map((d) => parseFloat(d) * (d.includes('ms') ? 0.001 : 1)),
        );
      expect(durations.length).toBeGreaterThan(0);
      expect(Math.max(...durations)).toBeLessThan(0.001);
    });
  });
});

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'the sheet only exists below the md breakpoint');

  test('windows are full-screen sheets and the menu bar is a hamburger', async ({ page }) => {
    await page.goto('/');
    const sheet = page.locator('[data-window="about"]');
    const box = (await sheet.boundingBox())!;
    expect(box.x).toBeLessThan(2);
    expect(box.width).toBeGreaterThan(page.viewportSize()!.width - 3);

    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeHidden();
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Sections' }).getByRole('button')).toHaveCount(
      11, // ten windows plus `close all`
    );
  });

  test('a downward swipe dismisses the sheet, and a tap does not', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'real touch injection needs CDP');
    await page.goto('/');
    const sheet = page.locator('[data-window="about"]');
    const bar = (await sheet.locator('> div').first().boundingBox())!;
    const x = bar.x + bar.width / 2;
    const y = bar.y + bar.height / 2;

    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', at: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y: at, radiusX: 6, radiusY: 6, force: 1 }],
      });

    // A tap is a touch that goes nowhere. It must leave the sheet alone.
    await touch('touchStart', y);
    await touch('touchEnd', y);
    await expect(sheet).toHaveCount(1);

    await touch('touchStart', y);
    for (let i = 1; i <= 12; i++) await touch('touchMove', y + i * 24);
    await touch('touchEnd', y + 288);

    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Open windows' }).getByText('nothing open')).toBeVisible();
  });
});
