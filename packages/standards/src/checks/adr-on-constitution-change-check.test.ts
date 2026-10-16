import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { snapshotFrom } from '../core/snapshot.ts';
import { adrOnConstitutionChangeCheck } from './adr-on-constitution-change-check.ts';
import { adrFileArb, otherChangedFileArb } from '../../test/arbitraries/specs.ts';

describe('adrOnConstitutionChangeCheck', () => {
  it('não atua localmente (sem --changed-files)', () => {
    expect(adrOnConstitutionChangeCheck.run(snapshotFrom({}))).toEqual([]);
  });

  // Feature: project-standards, Property 2: ADR exigido em mudança da Constituição
  it('Property 2: viola se e somente se a Constituição mudou sem ADR novo', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(otherChangedFileArb, adrFileArb, fc.constant('.kiro/constitution.md')), { maxLength: 8 }),
        (changedFiles) => {
          const expected =
            changedFiles.includes('.kiro/constitution.md') &&
            !changedFiles.some((f) => /^docs\/adr\/\d{4}-.+\.md$/.test(f));
          const violations = adrOnConstitutionChangeCheck.run(snapshotFrom({}, { changedFiles }));
          expect(violations.length > 0).toBe(expected);
          for (const v of violations) expect(v.requirement).toBe('1.6');
        },
      ),
      { numRuns: 100 },
    );
  });
});
