import { describe, expect, it } from 'vitest';
import { snapshotFrom } from '../core/snapshot.ts';
import { steeringScopeCheck } from './steering-scope-check.ts';

describe('escopo do steering condicional', () => {
  it('exige os três arquivos condicionais e seus diretórios de aplicação', () => {
    const result = steeringScopeCheck.run(
      snapshotFrom({
        '.kiro/steering/conditional/react.md': '---\ninclusion: fileMatch\nfileMatchPattern: apps/api/**\n---\nregra',
        '.kiro/steering/conditional/nestjs.md': '---\ninclusion: fileMatch\nfileMatchPattern: apps/api/**\n---\nregra',
      }),
    );
    expect(result).toHaveLength(2);
    expect(
      result.some((violation) => violation.file.endsWith('react.md') && violation.message.includes('apps/web/')),
    ).toBe(true);
    expect(result.some((violation) => violation.file.endsWith('python-ai.md'))).toBe(true);
  });
});
