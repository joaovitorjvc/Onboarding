import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { claudeParityCheck } from './claude-parity-check.ts';
import { parseClaudeModel } from '../claude/model.ts';
import { snapshotFrom } from '../core/snapshot.ts';
import { globListArb, invalidNavigationLineArb, validNavigationLineArb } from '../../test/arbitraries/claude.ts';

const modes = ['always', 'auto', 'conditional', 'manual'] as const;
type Mode = (typeof modes)[number];

function steeringFile(mode: Mode, index: number, glob = 'apps/web/**'): [string, string] {
  const path = `.kiro/steering/${mode}/rule-${index}.md`;
  const fields =
    mode === 'auto'
      ? 'inclusion: auto\nname: rule\ndescription: regra'
      : `inclusion: ${mode === 'conditional' ? 'fileMatch' : mode}`;
  const pattern = mode === 'conditional' ? `\nfileMatchPattern: ${glob}` : '';
  return [path, `---\n${fields}${pattern}\n---\n> Última alteração: 2026-10-08\nregra`];
}

function paritySnapshot(selected: readonly Mode[], removeIndex?: number): ReturnType<typeof snapshotFrom> {
  const files: Record<string, string> = {};
  const imports: string[] = [];
  const refs: string[] = [];
  const rules: string[] = [];
  selected.forEach((mode, index) => {
    const [path, content] = steeringFile(mode, index);
    files[path] = content;
    const reference = mode === 'conditional' ? `@../../${path}` : path;
    if (index !== removeIndex) {
      if (mode === 'always') imports.push(`@${path}`);
      else if (mode === 'conditional') rules.push(`.claude/rules/rule-${index}.md`);
      else refs.push(`- \`${path}\` — quando aplicável`);
    }
    if (mode === 'conditional') {
      files[`.claude/rules/rule-${index}.md`] =
        `---\npaths:\n  - "apps/web/**"\n---\n${index === removeIndex ? '' : reference}`;
    }
  });
  files['CLAUDE.md'] = ['# Regras sempre ativas', ...imports, '# Leitura sob demanda', ...refs].join('\n');
  return snapshotFrom(files);
}

describe('paridade Claude Code', () => {
  it('normaliza importações relativas das regras escopadas', () => {
    const snap = snapshotFrom({
      'CLAUDE.md': '# Regras sempre ativas\n@.kiro/constitution.md',
      '.kiro/constitution.md': 'constituição',
      '.kiro/steering/always/constitution.md': '---\ninclusion: always\n---\n#[[file:.kiro/constitution.md]]',
      '.claude/rules/react.md': '---\npaths:\n  - "apps/web/**"\n---\n@.kiro/steering/conditional/react.md',
    });
    const model = parseClaudeModel(snap);
    expect(model.scopedRules[0]?.imports).toEqual([]);
    expect(model.invalidLines.some((line) => line.file === '.claude/rules/react.md')).toBe(true);
    const violations = claudeParityCheck.run(snap);
    expect(
      violations.some((violation) => violation.requirement === '3.2' && violation.message.includes('não resolve')),
    ).toBe(true);
  });

  it('substitui ponteiros do steering pelos alvos na comparação', () => {
    const snap = snapshotFrom({
      'CLAUDE.md': '# Regras sempre ativas\n@.kiro/constitution.md',
      '.kiro/constitution.md': 'constituição',
      '.kiro/steering/always/constitution.md': '---\ninclusion: always\n---\n#[[file:.kiro/constitution.md]]',
    });
    expect(claudeParityCheck.run(snap).filter((violation) => violation.requirement === '3.5')).toEqual([]);
  });

  // Feature: project-standards, Property 4: Igualdade de conjuntos de referência do Claude Code
  it('aceita igualdade de conjuntos por canal e lista exatamente um arquivo removido', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.constantFrom<Mode>(...modes), { minLength: 1, maxLength: 4 }),
        fc.boolean(),
        (selected, remove) => {
          const removeIndex = remove ? 0 : undefined;
          const snap = paritySnapshot(selected, removeIndex);
          const setViolations = claudeParityCheck.run(snap).filter((violation) => violation.requirement === '3.5');
          if (!remove) {
            expect(setViolations).toHaveLength(0);
          } else {
            const removedPath = `.kiro/steering/${selected[0]}/rule-0.md`;
            expect(setViolations.some((violation) => violation.message.includes(removedPath))).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: project-standards, Property 5: Paridade de globs
  it('compara globs como conjuntos normalizados e mostra os dois lados', () => {
    fc.assert(
      fc.property(globListArb, globListArb, (expected, actual) => {
        const expectedYaml =
          expected.length === 1
            ? `fileMatchPattern: ${expected[0]}`
            : `fileMatchPattern:\n${expected.map((glob) => `  - ${glob}`).join('\n')}`;
        const actualYaml = actual.map((glob) => `  - "${glob}"`).join('\n');
        const snap = snapshotFrom({
          'CLAUDE.md': '# Regras sempre ativas\n# Leitura sob demanda',
          '.kiro/steering/conditional/react.md': `---\ninclusion: fileMatch\n${expectedYaml}\n---\n> Última alteração: 2026-10-08\nregra`,
          '.claude/rules/react.md': `---\npaths:\n${actualYaml}\n---\n@../../.kiro/steering/conditional/react.md`,
        });
        const normalize = (values: readonly string[]) => [...new Set(values)].sort().join('\u0000');
        const different = normalize(expected) !== normalize(actual);
        const globViolations = claudeParityCheck.run(snap).filter((violation) => violation.requirement === '3.6');
        expect(globViolations.length > 0).toBe(different);
        if (different) {
          expect(globViolations[0]?.message).toContain(expected[0] ?? '');
          expect(globViolations[0]?.message).toContain(actual[0] ?? '');
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: project-standards, Property 6: CLAUDE.md contém somente navegação
  it('reporta exatamente linhas arbitrárias inseridas na gramática', () => {
    fc.assert(
      fc.property(
        fc.array(validNavigationLineArb, { maxLength: 12 }),
        fc.array(invalidNavigationLineArb, { maxLength: 5 }),
        (valid, invalid) => {
          const lines: string[] = [];
          const inserted = new Set<number>();
          let invalidIndex = 0;
          for (const line of valid) {
            lines.push(line);
            if (invalidIndex < invalid.length) {
              inserted.add(lines.length + 1);
              lines.push(invalid[invalidIndex] ?? 'texto inválido');
              invalidIndex += 1;
            }
          }
          while (invalidIndex < invalid.length) {
            inserted.add(lines.length + 1);
            lines.push(invalid[invalidIndex] ?? 'texto inválido');
            invalidIndex += 1;
          }
          const snap = snapshotFrom({ 'CLAUDE.md': lines.join('\n') });
          const violations = claudeParityCheck.run(snap).filter((violation) => violation.requirement === '3.4');
          expect(violations).toHaveLength(inserted.size);
          expect(
            violations.map((violation) => Number(violation.message.match(/linha (\d+)/)?.[1])).sort((a, b) => a - b),
          ).toEqual([...inserted].sort((a, b) => a - b));
        },
      ),
      { numRuns: 100 },
    );
  });
});
