import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../core/types.ts';
import { changedPathsArbitrary } from '../../test/arbitraries/paths.ts';
import { detectAffectedStacks } from './stacks.ts';

describe('detectAffectedStacks', () => {
  it('mapeia exemplos concretos e ignora o legado', () => {
    expect(
      detectAffectedStacks(['apps/web/src/app.tsx', 'apps/api/src/main.ts', 'index.html'], DEFAULT_CONFIG),
    ).toEqual(['api', 'web']);
    expect(detectAffectedStacks(['packages/contracts/python/error.py'], DEFAULT_CONFIG, ['example'])).toEqual([
      'ai:example',
      'api',
      'web',
    ]);
    expect(detectAffectedStacks(['index.html', 'css/styles.css'], DEFAULT_CONFIG)).toEqual([]);
  });

  // Feature: project-standards, Property 12: Detecção de Stacks_Afetadas
  it('é independente da ordem, duplicação e inclusão de caminhos legados', () => {
    fc.assert(
      fc.property(changedPathsArbitrary, (paths) => {
        const base = detectAffectedStacks(paths, DEFAULT_CONFIG, ['example', 'vision']);
        const permuted = [...paths].reverse().concat(paths.slice(0, 2));
        const withLegacy = [...permuted, 'index.html', 'css/styles.css', 'js/main.js'];
        expect(detectAffectedStacks(permuted, DEFAULT_CONFIG, ['example', 'vision'])).toEqual(base);
        expect(detectAffectedStacks(withLegacy, DEFAULT_CONFIG, ['example', 'vision'])).toEqual(base);
      }),
      { numRuns: 100 },
    );
  });
});
