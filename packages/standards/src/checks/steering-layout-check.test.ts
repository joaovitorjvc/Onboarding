import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { steeringLayoutCheck } from './steering-layout-check.ts';
import { snapshotFrom } from '../core/snapshot.ts';
import { EXPECTED_MODE } from '../steering/model.ts';
import { steeringContent, steeringPath, steeringShapeArb } from '../../test/arbitraries/steering.ts';

describe('layout do steering', () => {
  it('informa caminho, modo esperado e modo encontrado', () => {
    const path = '.kiro/steering/auto/example.md';
    const result = steeringLayoutCheck.run(
      snapshotFrom({
        [path]: steeringContent({ inclusion: 'manual', name: 'x', description: 'y', fileMatchPattern: undefined }),
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.message).toContain('modo esperado auto');
    expect(result[0]?.message).toContain('modo encontrado manual');
    expect(result[0]?.message).toContain(path);
  });

  // Feature: project-standards, Property 3: Consistência entre subpasta e front matter do steering
  it('reporta somente as violações determinadas pelo modo efetivo e pelos campos obrigatórios', () => {
    fc.assert(
      fc.property(steeringShapeArb, (shape) => {
        const path = steeringPath(shape.folder);
        const result = steeringLayoutCheck.run(snapshotFrom({ [path]: steeringContent(shape) }));
        if (shape.folder === null) {
          expect(result.filter((violation) => violation.requirement === '2.7')).toHaveLength(1);
          return;
        }
        const found = shape.inclusion ?? 'always';
        const expectedMode = EXPECTED_MODE[shape.folder];
        const modeMismatch = found !== expectedMode ? 1 : 0;
        const missingAuto = shape.folder === 'auto' && (!shape.name?.trim() || !shape.description?.trim()) ? 1 : 0;
        const conditionalPatterns = shape.fileMatchPattern;
        const missingConditional =
          shape.folder === 'conditional' &&
          (conditionalPatterns === undefined ||
            (Array.isArray(conditionalPatterns)
              ? conditionalPatterns.every((value) => !value.trim())
              : !conditionalPatterns.trim()))
            ? 1
            : 0;
        expect(result).toHaveLength(modeMismatch + missingAuto + missingConditional);
        if (modeMismatch) {
          expect(
            result.some(
              (violation) =>
                violation.message.includes(`modo esperado ${expectedMode}`) &&
                violation.message.includes(`modo encontrado ${found}`),
            ),
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
