import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { snapshotFrom } from '../core/snapshot.ts';
import { checkHookParity, hookParityCheck, scriptsFromCommands } from './hook-parity-check.ts';
import { claudeSettings, hookSetArbitrary, kiroSettings } from '../../test/arbitraries/hooks-config.ts';

function validSettings(extraKiro: readonly string[] = [], extraClaude: readonly string[] = []): Record<string, string> {
  const kiro = kiroSettings(['pre-write-security', 'post-task-validation', ...extraKiro]);
  const claude = claudeSettings(['pre-write-security', 'post-task-validation', ...extraClaude]);
  return {
    '.kiro/agents/nuagehub.json': JSON.stringify(kiro),
    '.claude/settings.json': JSON.stringify(claude),
  };
}

describe('hookParityCheck', () => {
  it('reconhece os hooks obrigatórios nas duas configurações', () => {
    const snapshot = snapshotFrom(validSettings());
    expect(hookParityCheck.run(snapshot)).toEqual([]);
    expect(scriptsFromCommands(JSON.parse(snapshot.files.get('.kiro/agents/nuagehub.json') ?? '{}'))).toEqual(
      new Set(['scripts/hooks/pre-write-security', 'scripts/hooks/post-task-validation']),
    );
  });

  // Feature: project-standards, Property 14: Paridade de Scripts_de_Hook
  it('lista exatamente a diferença simétrica dos Scripts_de_Hook', () => {
    fc.assert(
      fc.property(hookSetArbitrary, hookSetArbitrary, (kiroExtra, claudeExtra) => {
        const snapshot = snapshotFrom(validSettings(kiroExtra, claudeExtra));
        const violations = checkHookParity(snapshot);
        const expectedKiro = new Set([
          'scripts/hooks/pre-write-security',
          'scripts/hooks/post-task-validation',
          ...kiroExtra.map((name) => `scripts/hooks/${name}`),
        ]);
        const expectedClaude = new Set([
          'scripts/hooks/pre-write-security',
          'scripts/hooks/post-task-validation',
          ...claudeExtra.map((name) => `scripts/hooks/${name}`),
        ]);
        const symmetricDifference = [...expectedKiro]
          .filter((item) => !expectedClaude.has(item))
          .concat([...expectedClaude].filter((item) => !expectedKiro.has(item)));
        const parityViolation = violations.find((violation) => violation.requirement === '5.10');
        expect(Boolean(parityViolation)).toBe(symmetricDifference.length > 0);
        if (parityViolation) {
          for (const script of symmetricDifference) expect(parityViolation.message).toContain(script);
        }
      }),
      { numRuns: 100 },
    );
  });
});
