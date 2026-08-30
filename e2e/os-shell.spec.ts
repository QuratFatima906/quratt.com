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

    for (const label of ['uses', 'now', 'entropy']) await menu(page, label).click();
    await expect(openWindows(page)).toHaveCount(4);
    await expect(taskbar(page).getByRole('listitem')).toHaveCount(4);

    // Stacking order is the taskbar's order, and the last opened is on top.
    const zOf = (key: string) =>
      page.locator(`[data-window="${key}"]`).evaluate((el) => Number(getComputedStyle(el).zIndex));
    expect(await zOf('toy')).toBeGreaterThan(await zOf('about'));

    // Every window opens dead centre on top of the last, so a buried one cannot be clicked
    // at all — the dock is the only way to raise it, which is precisely why it exists.
    await taskbar(page).getByRole('button', { name: 'about' }).click();
    expect(await zOf('about')).toBeGreaterThan(await zOf('toy'));

    // Centred windows bury each other completely, so `now` has to be raised before its
    // own × is reachable at all. That round trip is the dock earning its place.
    await taskbar(page).getByRole('button', { name: 'now' }).click();
    await page.getByRole('region', { name: 'now' }).getByRole('button', { name: 'Close now' }).click();
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

    // The bounds are measured once at the grab, so a long drag toward an edge stops at the
    // edge rather than letting the bound drift along with the window.
    await page.mouse.move(bar.x + 160, bar.y + 96);
    await page.mouse.down();
    for (let i = 1; i <= 30; i++) await page.mouse.move(bar.x + 160 - i * 60, bar.y + 96 + i * 40);
    await page.mouse.up();
    const parked = (await about.boundingBox())!;
    expect(parked.x + parked.width).toBeGreaterThanOrEqual(90); // still grabbable
    expect(parked.y).toBeLessThanOrEqual(page.viewportSize()!.height - 40);

    // Nothing closes everything at once any more — each window goes on its own terms, which
    // means raising it from the dock first, because a centred window buries the one below it.
    for (const label of ['about', 'uses', 'entropy']) {
      await taskbar(page).getByRole('button', { name: label }).click();
      await page
        .getByRole('region', { name: label })
        .getByRole('button', { name: `Close ${label}` })
        .click();
    }
    await expect(openWindows(page)).toHaveCount(0);
    // The dock carries no empty-state text — nothing open simply means nothing in it.
    await expect(taskbar(page).getByRole('listitem')).toHaveCount(0);
  });

  test('the keyboard alone opens a window, lands inside it, and returns to the opener', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');
    const opener = menu(page, 'uses');
    await opener.focus();
    await page.keyboard.press('Enter');

    const window = page.locator('[data-window="uses"]');
    await expect(window).toBeFocused();

    const close = page
      .getByRole('region', { name: 'uses' })
      .getByRole('button', { name: 'Close uses' });
    // WebKit puts buttons in the tab order only when macOS Full Keyboard Access is on, and
    // Playwright cannot toggle that. The rest of the journey is identical either way.
    if (browserName === 'webkit') await close.focus();
    else {
      // The title bar is a link: it routes to the window, promoting it to the focused,
      // server-rendered one (D4). It is the first stop inside the window, then the close
      // button — so the keyboard can do everything the pointer can.
      await page.keyboard.press('Tab');
      await expect(
        page.getByRole('region', { name: 'uses' }).getByRole('link', { name: 'uses' }),
      ).toBeFocused();
      await page.keyboard.press('Tab');
    }
    await expect(close).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(window).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('unavailable windows stay reachable, say why, and open nothing', async ({ page }) => {
    await page.goto('/');
    const writes = menu(page, 'writes');

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

  test('every menu item fits on a laptop-width bar', async ({ page }) => {
    // Not 768: with plain labels the bar clears that width by ~10px on macOS and misses it on
    // Linux, where the mono face renders wider — so `md` is exactly where the overflow panel
    // starts earning its keep, and asserting either way there tests the font, not the bar.
    // 1024 has ~250px to spare on both. `menu-overflow.spec.ts` prints the real numbers.
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    // `document.fonts.status` reads "loaded" while idle, so it is not a signal that the mono
    // face has arrived — let the post-`fonts.ready` re-measure land before touching anything.
    await page.waitForTimeout(600);

    const nav = page.getByRole('navigation', { name: 'Sections' });
    // Nine menu items, all visible — no "more (n) ▾" needed. `menu-overflow.spec.ts` owns
    // the pixel accounting; this test only pins the first and last item being on the bar.
    await expect(nav.getByRole('button', { name: /^more \(/ })).toHaveCount(0);
    await expect(nav.getByRole('button', { name: 'about' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'entropy' })).toBeVisible();
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`no accessibility violations in ${theme} with three windows open`, async ({ page }) => {
      await page.addInitScript(`localStorage.setItem('theme', '${theme}')`);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      for (const label of ['uses', 'resume']) await menu(page, label).click();
      await expect(openWindows(page)).toHaveCount(3);
      // A tooltip is part of the page too, so open one before the sweep.
      await menu(page, 'talks').focus();
      await expect(page.getByRole('tooltip')).toBeVisible();
      // Windows fade in over 160ms, and axe measures contrast against what is on screen —
      // running mid-transition reads translucent text as failing a ratio it passes at rest.
      await page.waitForFunction(() =>
        document.getAnimations().every((animation) => animation.playState !== 'running'),
      );

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
    const width = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(box.x).toBeLessThan(2);
    expect(box.width).toBeGreaterThan(width.client - 2);
    // and the page itself never scrolls sideways
    expect(width.scroll).toBeLessThanOrEqual(width.client);

    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeHidden();
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Sections' }).getByRole('button')).toHaveCount(
      9, // one per menu window — contact moved to the email icon
    );
  });

  test('the sheet tracks the finger, and resists rather than stopping at its bound', async ({
    page,
    browserName,
  }) => {
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
    const offset = async () =>
      parseFloat((await sheet.evaluate((el) => getComputedStyle(el).translate)).split(' ')[1] ?? '0');

    await touch('touchStart', y);
    await touch('touchMove', y + 120);
    expect(await offset()).toBeCloseTo(120, 0); // downward is 1:1 with the finger

    // 200px past the top bound. A hard stop reads as frozen; this should give, but grudgingly.
    for (let i = 1; i <= 10; i++) await touch('touchMove', y + 120 - i * 32);
    const overshoot = Math.abs(await offset());
    expect(overshoot).toBeGreaterThan(0);
    expect(overshoot).toBeLessThan(120);

    await touch('touchEnd', y - 200);
    await page.waitForTimeout(500);
    expect(await offset()).toBe(0); // settles home
    await expect(sheet).toHaveCount(1); // an upward drag never dismisses
  });

  test('no accessibility violations with the section menu open', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(
      violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`)),
    ).toEqual([]);
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
    await expect(
      page.getByRole('navigation', { name: 'Open windows' }).getByRole('listitem'),
    ).toHaveCount(0);
  });
});
