import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { snapshotFrom } from '../core/snapshot.ts';
import { specStructureCheck } from './spec-structure-check.ts';
import { epicLinkCheck } from './epic-link-check.ts';
import { EPIC_FILES, SIMPLE_FILES, specShapeArb, type SpecShape } from '../../test/arbitraries/specs.ts';

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function build(shape: SpecShape): Record<string, string> {
  const base = `.kiro/specs/${shape.name}`;
  const header = shape.estimate === null ? '# Req\n' : `# Req\n\n**Estimativa_de_Esforco:** ${shape.estimate}h\n`;
  const files: Record<string, string> = {};
  for (const f of shape.files) files[`${base}/${f}`] = f.includes('requirements') ? header : '# doc\n';
  for (const sub of shape.subfeatures) {
    for (const f of sub.files)
      files[`${base}/${sub.name}/${f}`] = f === 'requirements.md' ? '**Estimativa_de_Esforco:** 10h\n' : '#\n';
  }
  return files;
}

/** Modelo de referência simplificado: há violação da Spec de primeiro nível? */
function expectViolation(shape: SpecShape): boolean {
  if (!KEBAB.test(shape.name)) return true;
  const estimateVisible =
    shape.estimate !== null &&
    (shape.files.includes('requirements.md') || shape.files.includes('epic-requirements.md'));
  if (!estimateVisible) return true;
  const estimate = shape.estimate as number;
  if (estimate <= 80) return !SIMPLE_FILES.every((f) => shape.files.includes(f));
  if (!EPIC_FILES.every((f) => shape.files.includes(f))) return true;
  const subs = shape.subfeatures.filter((s) => s.files.length > 0);
  if (subs.length === 0) return true;
  return subs.some((s) => !SIMPLE_FILES.every((f) => s.files.includes(f)));
}

describe('specStructureCheck', () => {
  it('aceita Spec_Simples completa e acusa arquivo ausente', () => {
    const ok = {
      '.kiro/specs/demo/requirements.md': '**Estimativa_de_Esforco:** 10h\n',
      '.kiro/specs/demo/design.md': '',
      '.kiro/specs/demo/tasks.md': '',
    };
    expect(specStructureCheck.run(snapshotFrom(ok))).toEqual([]);
    const { ['.kiro/specs/demo/tasks.md']: _omit, ...missing } = ok;
    const [v] = specStructureCheck.run(snapshotFrom(missing));
    expect(v?.requirement).toBe('6.3');
    expect(v?.message).toContain('10h');
    expect(v?.message).toContain('tasks.md');
  });

  // Feature: project-standards, Property 15: Estrutura de Specs conforme a estimativa
  it('Property 15: viola se e somente se nome, estimativa ou arquivos divergirem do formato', () => {
    fc.assert(
      fc.property(specShapeArb, (shape) => {
        fc.pre(shape.files.length > 0 || shape.subfeatures.some((s) => s.files.length > 0));
        const violations = specStructureCheck.run(snapshotFrom(build(shape)));
        expect(violations.length > 0).toBe(expectViolation(shape));
        for (const v of violations.filter((x) => ['6.3', '6.4', '6.11'].includes(x.requirement))) {
          expect(v.message).toContain('estimativa');
          expect(v.message).toContain('arquivos ausentes');
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('epicLinkCheck', () => {
  it('exige links relativos ao épico nas Sub_Funcionalidades', () => {
    const base = '.kiro/specs/epico';
    const files = {
      [`${base}/epic-requirements.md`]: '**Estimativa_de_Esforco:** 120h\n',
      [`${base}/epic-design.md`]: '',
      [`${base}/sub/requirements.md`]: 'Ver [épico](../epic-requirements.md)\n',
      [`${base}/sub/design.md`]: 'sem link\n',
      [`${base}/sub/tasks.md`]: '',
    };
    const violations = epicLinkCheck.run(snapshotFrom(files));
    expect(violations).toHaveLength(1);
    expect(violations[0]?.file).toBe(`${base}/sub/design.md`);
    expect(violations[0]?.requirement).toBe('6.7');
  });
});
