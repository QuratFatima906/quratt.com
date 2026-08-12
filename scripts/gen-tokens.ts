import { writeFileSync } from 'node:fs';
import { renderTokensCss } from '../src/lib/tokens';

const target = new URL('../src/app/tokens.css', import.meta.url);
writeFileSync(target, renderTokensCss());
console.log(`wrote ${target.pathname}`);
