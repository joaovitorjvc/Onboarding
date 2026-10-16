import * as fc from 'fast-check';
import { NAV_HEADINGS, NAV_TEXT } from '../../src/claude/nav-text.ts';

export const globArb = fc.constantFrom('apps/web/**', 'apps/web/**/*.tsx', 'apps/api/**', 'services/ai/**');

export const globListArb = fc.array(globArb, { minLength: 1, maxLength: 3 }).map((items) => [...new Set(items)]);

export const validNavigationLineArb = fc.oneof(
  fc.constant(''),
  fc.constant('<!-- nav:start -->'),
  fc.constant('<!-- nav:end -->'),
  fc.constant(NAV_TEXT),
  fc.constantFrom(...NAV_HEADINGS.map((heading) => `# ${heading}`)),
  fc.constant('@.kiro/constitution.md'),
  fc.constant('- `.kiro/steering/auto/testing.md` — ao escrever testes'),
);

export const invalidNavigationLineArb = fc.string({ unit: fc.constantFrom('a', 'b', 'ç', ' ') }).filter((line) => {
  const trimmed = line.trim();
  return trimmed.length > 0 && !trimmed.startsWith('@') && !trimmed.startsWith('-') && !trimmed.startsWith('#');
});

export function claudeRoot(lines: readonly string[]): string {
  return lines.join('\n');
}

export function scopedRule(globs: readonly string[], target: string): string {
  return ['---', 'paths:', ...globs.map((glob) => `  - "${glob}"`), '---', `@../../${target}`].join('\n');
}
