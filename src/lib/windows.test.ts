import { describe, expect, it } from 'vitest';

import { isIndexable, keyForPath, WINDOWS } from './windows';

describe('keyForPath', () => {
  it('focuses nothing on the desktop itself', () => {
    expect(keyForPath('/')).toBeNull();
  });

  it.each(WINDOWS.filter((w) => w.route !== null))('routes $route to $key', (def) => {
    expect(keyForPath(def.route as string)).toBe(def.key);
  });

  it('gives a nested route to its parent window', () => {
    expect(keyForPath('/projects/quietwatch')).toBe('projects');
    expect(keyForPath('/writing/a-post')).toBe('writes');
    expect(keyForPath('/talks/invite')).toBe('talks');
  });

  it('ignores a trailing slash', () => {
    expect(keyForPath('/about/')).toBe('about');
  });

  it('does not match a route that merely starts with the same letters', () => {
    expect(keyForPath('/aboutish')).toBeNull();
    expect(keyForPath('/nowhere')).toBeNull();
  });

  it('leaves the toy without a URL', () => {
    expect(keyForPath('/entropy')).toBeNull();
  });
});

describe('isIndexable', () => {
  // D13: these ship disabled, so their routes work but stay out of the index and the sitemap.
  // Flipping `available` is the single edit that reverses both.
  it('excludes every window that ships disabled', () => {
    expect(isIndexable('writes')).toBe(false);
    expect(isIndexable('talks')).toBe(false);
    expect(isIndexable('reads')).toBe(false);
    // Disabled until there are real projects to show; the seeded twelve are placeholders.
    expect(isIndexable('projects')).toBe(false);
  });

  it('includes every window that has real content', () => {
    expect(isIndexable('about')).toBe(true);
    expect(isIndexable('resume')).toBe(true);
    expect(isIndexable('contact')).toBe(true);
    expect(isIndexable('now')).toBe(true);
    expect(isIndexable('uses')).toBe(true);
  });
});
