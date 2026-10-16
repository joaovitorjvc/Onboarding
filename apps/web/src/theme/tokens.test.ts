import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cssVariables } from './tokens';

function extractRootVariables(stylesheet: string): Record<string, string> {
  const rootBlock = stylesheet.match(/:root\s*{([\s\S]*?)}/)?.[1];
  if (!rootBlock) {
    throw new Error('Bloco :root não encontrado no Site_Legado.');
  }

  return Object.fromEntries(
    [...rootBlock.matchAll(/^\s*(--[\w-]+)\s*:\s*(.*?)\s*;\s*$/gm)].map(([, name, value]) => [name, value]),
  );
}

describe('Tokens_de_Design', () => {
  it('preserva exatamente as variáveis :root do Site_Legado', () => {
    const stylesheet = readFileSync('../../css/styles.css', 'utf8');

    expect(cssVariables).toEqual(extractRootVariables(stylesheet));
  });
});
