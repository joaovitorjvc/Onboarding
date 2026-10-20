import { describe, expect, it } from 'vitest';
import { cssVariables } from './tokens';

describe('Tokens_de_Design', () => {
  // Valores herdados do :root do Site_Legado; tokens.ts é a fonte única desde o ADR-0005 (Req. 9.6).
  it('fixa as variáveis :root da identidade visual', () => {
    expect(cssVariables).toEqual({
      '--bg-main': '#020617',
      '--bg-card': 'rgba(15, 23, 42, 0.7)',
      '--bg-panel': 'rgba(15, 23, 42, 0.5)',
      '--border-color': 'rgba(51, 65, 85, 0.8)',
      '--border-soft': 'rgba(51, 65, 85, 0.6)',
      '--border-light': 'rgba(71, 85, 105, 0.4)',
      '--text-strong': '#fff',
      '--text-main': '#f8fafc',
      '--text-body': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--text-subtle': '#64748b',
      '--primary': '#4f46e5',
      '--primary-hover': '#4338ca',
      '--primary-light': '#818cf8',
      '--accent-cyan': '#22d3ee',
      '--success': '#34d399',
    });
  });
});
