import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(file);
    return entry.isFile() && file.endsWith('.module.css') ? [file] : [];
  });
}

describe('regras estáticas de renderização', () => {
  it('não duplica cores literais nos CSS Modules', () => {
    for (const file of filesIn('src')) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/#[0-9a-f]{3,8}\b|\brgb\(|\bhsl\(/iu);
    }
  });
  it('não interpreta HTML vindo do conteúdo', () => {
    for (const file of filesInTsx('src')) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('dangerouslySetInnerHTML');
    }
  });
});

function filesInTsx(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return filesInTsx(file);
    return entry.isFile() && file.endsWith('.tsx') && statSync(file).isFile() ? [file] : [];
  });
}
