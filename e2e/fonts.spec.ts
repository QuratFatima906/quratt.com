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
