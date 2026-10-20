// Geradores de diretórios de Spec (Property 15) e de listas de arquivos alterados (Property 2).
import fc from 'fast-check';

export const SIMPLE_FILES = ['requirements.md', 'design.md', 'tasks.md'] as const;
export const EPIC_FILES = ['epic-requirements.md', 'epic-design.md'] as const;

export const specNameArb = fc.oneof(
  { weight: 4, arbitrary: fc.stringMatching(/^[a-z][a-z0-9]{0,6}(-[a-z0-9]{1,5}){0,2}$/) },
  { weight: 1, arbitrary: fc.constantFrom('Bad_Name', 'camelCase', 'com espaco', '-lead', 'trail-') },
);

export interface SpecShape {
  name: string;
  estimate: number | null;
  files: string[];
  subfeatures: { name: string; files: string[] }[];
}

export const specShapeArb: fc.Arbitrary<SpecShape> = fc.record({
  name: specNameArb,
  estimate: fc.option(fc.integer({ min: 1, max: 300 }), { nil: null }),
  files: fc.subarray([...SIMPLE_FILES, ...EPIC_FILES]),
  subfeatures: fc
    .array(fc.record({ name: fc.stringMatching(/^[a-z]{1,6}$/), files: fc.subarray([...SIMPLE_FILES]) }), {
      maxLength: 2,
    })
    .map((subs) => subs.filter((s, i, all) => all.findIndex((o) => o.name === s.name) === i)),
});

export const otherChangedFileArb = fc.constantFrom(
  'apps/web/src/main.tsx',
  'docs/adr/README.md',
  'docs/adr/abc-sem-numero.md',
  '.kiro/steering/always/code-style.md',
  'README.md',
);
export const adrFileArb = fc.stringMatching(/^docs\/adr\/\d{4}-[a-z]{1,8}\.md$/);
