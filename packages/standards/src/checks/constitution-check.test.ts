import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { constitutionCheck } from './constitution-check.ts';
import { steeringHeaderCheck } from './steering-header-check.ts';
import { snapshotFrom } from '../core/snapshot.ts';

const sections = [
  'Idioma',
  'Segurança',
  'Estrutura do Monorepo',
  'Testes',
  'Contratos entre aplicações',
  'Git',
  'Fluxo de Specs',
];
const dateArb = fc.constantFrom(
  '> Última alteração: 2026-10-08',
  'Última alteração: 2026-10-08',
  '',
  'Última alteração: 2026-99-99',
);

describe('Constituição e cabeçalhos', () => {
  it('aceita a data com ou sem blockquote e detecta dados do steering', () => {
    const snap = snapshotFrom({
      '.kiro/constitution.md':
        '# Constituição\n\nÚltima alteração: 2026-10-08\n\n' + sections.map((section) => `## ${section}`).join('\n'),
      '.kiro/steering/always/example.md': '---\ninclusion: always\n---\n> Última alteração: 2026-10-08',
    });
    expect(constitutionCheck.run(snap)).toEqual([]);
    expect(steeringHeaderCheck.run(snap)).toEqual([]);
  });

  // Feature: project-standards, Property 1: Cabeçalhos e seções dos documentos canônicos
  it('reporta exatamente seções ausentes e datas inválidas', () => {
    fc.assert(
      fc.property(fc.subarray(sections), dateArb, (present, dateLine) => {
        const constitution = ['# Constituição', dateLine, ...present.map((section) => `## ${section}`)].join('\n');
        const result = constitutionCheck.run(snapshotFrom({ '.kiro/constitution.md': constitution }));
        const missing = sections.length - present.length;
        const invalidDate = dateLine === '' || dateLine.includes('99-99') ? 1 : 0;
        expect(result.filter((violation) => violation.requirement === '1.2')).toHaveLength(missing);
        expect(result.filter((violation) => violation.requirement === '1.5')).toHaveLength(invalidDate);
      }),
      { numRuns: 100 },
    );
  });
});
