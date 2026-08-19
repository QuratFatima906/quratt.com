import { expect, test } from '@playwright/test';

const WIDTHS = [320, 768, 1024, 1440, 1920];

test('menu bar overflow is correct at every named width', async ({ page }) => {
  const report: string[] = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.status === 'loaded');
    await page.waitForTimeout(400);

    // A role locator skips hidden nodes, and below `md` this nav is display:none — so the
    // measurement has to reach it by selector.
    const nav = page.locator('header nav[aria-label="Sections"]').first();
    const hidden = await nav.evaluate((el) => getComputedStyle(el).display === 'none');
    if (hidden) {
      await page.getByRole('button', { name: 'Menu' }).click();
      // Every button in the panel is a window now — the wallpaper picker beneath them is
      // radio inputs, and `close all` is gone.
      const items = await page.getByRole('navigation', { name: 'Sections' }).getByRole('button').allInnerTexts();
      report.push(`${width}: hamburger, ${items.length} items in the panel`);
      expect(items.length).toBe(10);
      continue;
    }

    const shown = await nav.locator(':scope > button, :scope > span > button').allInnerTexts();
    const more = nav.getByRole('button', { name: /^more \(/ });
    const moreText = (await more.count()) ? (await more.innerText()).trim() : null;
    const overflows = await nav.evaluate((el) => {
      const items = [...el.children].filter((c) => !c.hasAttribute('aria-hidden'));
      const right = Math.max(...items.map((c) => c.getBoundingClientRect().right));
      return right - el.getBoundingClientRect().right;
    });
    report.push(`${width}: ${shown.length} shown${moreText ? ` + "${moreText}"` : ' (no more button)'}, spill ${overflows.toFixed(1)}px`);

    expect(overflows, `items must not spill out of the nav at ${width}`).toBeLessThanOrEqual(1);
    const hiddenCount = moreText ? Number(moreText.match(/\((\d+)\)/)![1]) : 0;
    expect(shown.length + hiddenCount, `every window is accounted for at ${width}`).toBe(10);
  }
  console.log('\n' + report.join('\n') + '\n');
});
