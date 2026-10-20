import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderConditionalSteering } from './conditional-steering.ts';

describe('conditional-steering', () => {
  it('seleciona por arquivo alterado ou diretório no prompt e remove o front matter', () => {
    const root = mkdtempSync(join(tmpdir(), 'nuagehub-steering-'));
    const directory = join(root, '.kiro', 'steering', 'conditional');
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, 'react.md'),
      '---\ninclusion: fileMatch\nfileMatchPattern: apps/web/**\n---\n> Última alteração: 2026-10-08\nRegra React.\n',
    );
    writeFileSync(
      join(directory, 'python.md'),
      '---\ninclusion: fileMatch\nfileMatchPattern: services/ai/**\n---\nRegra Python.\n',
    );

    const output = renderConditionalSteering(root, 'implementar em apps/web', ['docs/readme.md']);
    expect(output).toContain('## Steering condicional: react.md');
    expect(output).toContain('Regra React.');
    expect(output).not.toContain('inclusion: fileMatch');
    expect(output).not.toContain('Regra Python.');
  });
});
