import * as fc from 'fast-check';
import type { SteeringFolder } from '../../src/steering/model.ts';

export const steeringFolderArb: fc.Arbitrary<SteeringFolder> = fc.constantFrom<SteeringFolder>(
  'always',
  'auto',
  'conditional',
  'manual',
  null,
);

export const inclusionArb: fc.Arbitrary<string | undefined> = fc.constantFrom<string | undefined>(
  'always',
  'auto',
  'fileMatch',
  'manual',
  undefined,
);

export const fieldTextArb = fc.constantFrom<string | undefined>('valor', '', undefined);
export const patternArb = fc.constantFrom<string | string[] | undefined>(
  'apps/web/**',
  ['apps/web/**'],
  '',
  [],
  undefined,
);

export const steeringShapeArb = fc.record({
  folder: steeringFolderArb,
  inclusion: inclusionArb,
  name: fieldTextArb,
  description: fieldTextArb,
  fileMatchPattern: patternArb,
});

export function steeringPath(folder: SteeringFolder): string {
  return folder === null ? '.kiro/steering/orphan.md' : `.kiro/steering/${folder}/sample.md`;
}

export function steeringContent(shape: {
  inclusion: string | undefined;
  name: string | undefined;
  description: string | undefined;
  fileMatchPattern: string | string[] | undefined;
}): string {
  const lines = ['---'];
  if (shape.inclusion !== undefined) lines.push(`inclusion: ${shape.inclusion}`);
  if (shape.name !== undefined) lines.push(`name: ${shape.name}`);
  if (shape.description !== undefined) lines.push(`description: ${shape.description}`);
  if (shape.fileMatchPattern !== undefined) {
    if (Array.isArray(shape.fileMatchPattern)) {
      lines.push('fileMatchPattern:');
      for (const pattern of shape.fileMatchPattern) lines.push(`  - ${pattern}`);
    } else {
      lines.push(`fileMatchPattern: ${shape.fileMatchPattern}`);
    }
  }
  lines.push('---', '> Última alteração: 2026-10-08', 'regra');
  return lines.join('\n');
}
