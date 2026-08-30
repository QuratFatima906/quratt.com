import { expect, test, type Page } from '@playwright/test';

/**
 * The Nastaliq `.woff2` the stylesheet points at, read from the cascade rather than hardcoded
 * — the filename carries a content hash and changes on every font or Next upgrade.
 */
async function nastaliqFile(page: Page): Promise<string> {
  const file = await page.evaluate(() => {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRule[];
      // A cross-origin sheet throws on access rather than returning nothing.
      try {
        rules = Array.from(sheet.cssRules);
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (!(rule instanceof CSSFontFaceRule)) continue;
        if (!/nastaliq/i.test(rule.style.getPropertyValue('font-family'))) continue;
        // `local(...)` fallback faces carry no url, so take the first real one.
        const url = rule.style.getPropertyValue('src').match(/([^/"')]+\.woff2)/);
        if (url) return url[1];
      }
    }
    return null;
  });
  expect(file, 'the Nastaliq @font-face must reach the page, or this test proves nothing').not.toBeNull();
  return file!;
}

/** Every font file the browser actually fetched for this navigation. */
function recordFonts(page: Page): string[] {
  const seen: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') seen.push(request.url());
  });
  return seen;
}

test.describe('Nastaliq is fetched only where Urdu is', () => {
  // 400 KB of Urdu face on a page with no Urdu would be the whole LCP budget of that page,
  // which is why `preload: false` is on the font in `layout.tsx`. This asserts the outcome
  // rather than the setting — `preload: false` still lets a stray rule pull the file in.
  test('a page with no Urdu content never requests it', async ({ page }) => {
    const fonts = recordFonts(page);
    await page.goto('/about');
    await page.evaluate(() => document.fonts.ready);
    // The fetch is lazy, so a font that is coming would arrive after `ready` resolves.
    await page.waitForTimeout(1000);

    const nastaliq = await nastaliqFile(page);
    expect(await page.locator('[lang="ur"]').count(), '/about must have no Urdu for this to mean anything').toBe(0);
    expect(fonts.filter((url) => url.includes(nastaliq)), `${nastaliq} should not be fetched on /about`).toEqual([]);
    // The mono face is the control: fonts did load on this page, so an empty Nastaliq list is
    // a real absence and not a listener that never fired.
    expect(fonts.length, 'some font must have loaded, or the recorder is broken').toBeGreaterThan(0);
  });

  test('the page that does carry Urdu requests it', async ({ page }) => {
    const fonts = recordFonts(page);
    await page.goto('/reads');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);

    const nastaliq = await nastaliqFile(page);
    expect(await page.locator('[lang="ur"]').count(), '/reads must carry Urdu titles').toBeGreaterThan(0);
    expect(fonts.filter((url) => url.includes(nastaliq)), `${nastaliq} should be fetched on /reads`).not.toEqual([]);
  });
});

/**
 * P1 asks that the Urdu sample render in Nastaliq, right-to-left, and unclipped. The leading is
 * the fragile part: `.urdu` carries `line-height: 2.2` because Nastaliq's kasheeda descends into
 * the next line at normal leading, and the row it sits in is a flex item that would happily crop
 * it. A regression here is silent — the text is still there, just sheared.
 */
test.describe('the Urdu sample', () => {
  test('is Nastaliq, right-to-left, and not clipped by its row', async ({ page }) => {
    await page.goto('/reads');
    await page.evaluate(() => document.fonts.ready);

    const urdu = page.locator('[lang="ur"]').first();
    await expect(urdu).toHaveAttribute('dir', 'rtl');
    await expect(urdu).toHaveAttribute('lang', 'ur');

    // The face has to have actually loaded, not merely been asked for — `check` is false while
    // the family is still only a declaration.
    expect(
      await page.evaluate(() => document.fonts.check('14.5px "Noto Nastaliq Urdu"')),
      'the Nastaliq face must be loaded before the rest of this test means anything',
    ).toBe(true);

    const box = await urdu.evaluate((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      // The nearest ancestor that could crop it.
      let clipper: HTMLElement | null = el.parentElement;
      while (clipper && getComputedStyle(clipper).overflow === 'visible') clipper = clipper.parentElement;
      return {
        family: style.fontFamily,
        lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize),
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        height: rect.height,
        clipperBottom: clipper ? clipper.getBoundingClientRect().bottom : null,
        bottom: rect.bottom,
      };
    });

    expect(box.family, 'the computed family must resolve to Nastaliq').toMatch(/nastaliq/i);
    // 2.2 from globals.css — measured, per the comment there. Anything near 1 means the rule lost.
    expect(box.lineHeight).toBeGreaterThan(1.8);
    // Sub-pixel rounding makes an exact comparison flaky; a real crop is whole pixels.
    expect(box.scrollHeight, 'the glyphs must not overflow their own box').toBeLessThanOrEqual(box.clientHeight + 1);
    if (box.clipperBottom !== null) {
      expect(box.bottom, 'the row must not crop the descenders').toBeLessThanOrEqual(box.clipperBottom + 1);
    }
  });
});
