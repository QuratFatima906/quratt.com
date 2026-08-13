import { describe, expect, it } from 'vitest';
import { readingTime } from './writing';

describe('readingTime', () => {
  it('falls back to the stored string when a post has no body', () => {
    // Three of the seven seeded posts are body-less; they must not render "0 min".
    expect(readingTime({ body: null, mins: '8 min' })).toBe('8 min');
    expect(readingTime({ body: '   ', mins: '? min' })).toBe('? min');
  });

  it('computes from the body at 200 wpm', () => {
    expect(readingTime({ body: 'word '.repeat(400), mins: 'ignored' })).toBe('2 min');
  });

  it('never rounds a real post down to zero', () => {
    expect(readingTime({ body: 'three short words', mins: 'ignored' })).toBe('1 min');
  });

  it('ignores fenced code, so a code-heavy post is not overstated', () => {
    const prose = 'word '.repeat(200);
    const withCode = `${prose}\n\`\`\`ts\n${'const x = 1;\n'.repeat(200)}\`\`\`\n`;
    expect(readingTime({ body: withCode, mins: 'ignored' })).toBe('1 min');
  });

  it('ignores markup', () => {
    expect(readingTime({ body: `<div className="a b c">${'word '.repeat(200)}</div>`, mins: 'x' })).toBe(
      '1 min',
    );
  });
});
