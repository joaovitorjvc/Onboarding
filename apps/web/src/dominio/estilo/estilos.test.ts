import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RAIOS_AUTORIZADOS, TOKENS } from '../../estilos/tokens';
import { PALETA, razaoContraste } from './contraste';

// O Vitest executa a partir de apps/web; import.meta.url não é um URL de arquivo no ambiente jsdom.
const pasta = join(process.cwd(), 'src', 'estilos');
const ler = (arquivo: string): string => readFileSync(join(pasta, arquivo), 'utf8');
const arquivosCss = readdirSync(pasta).filter((nome) => nome.endsWith('.css'));
const normalizar = (texto: string): string => texto.replace(/\s+/gu, ' ').trim();
const semComentarios = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//gu, '');

describe('tokens', () => {
  it('tokens.css espelha a paleta de contraste.ts', () => {
    const tokens = normalizar(ler('tokens.css'));
    for (const [variavel, hex] of Object.entries(PALETA)) {
      expect(tokens).toContain(`${variavel}: ${hex};`);
    }
  });

  it('tokens.css espelha os demais tokens de tokens.ts', () => {
    const tokens = normalizar(ler('tokens.css'));
    for (const [variavel, valor] of Object.entries(TOKENS)) {
      expect(tokens, variavel).toContain(`${variavel}: ${normalizar(valor)};`);
    }
  });

  it('define os papéis semânticos e os três gradientes autorizados', () => {
    const tokens = ler('tokens.css');
    for (const papel of [
      'fundo',
      'titulo',
      'texto',
      'borda',
      'destaque',
      'selecionado',
      'acao-primaria',
      'acao-secundaria',
      'pendencia',
    ]) {
      expect(tokens, papel).toContain(`--nuage-${papel}:`);
    }
    expect(tokens.match(/--nuage-gradient-[\w-]+:/gu)).toHaveLength(3);
    expect(tokens).toContain('--nuage-gradient-selected: var(--nuage-pink-deep);');
  });
});

describe('contraste', () => {
  it('pares de cor de texto atingem 4,5:1', () => {
    const cor = (variavel: string): string => PALETA[variavel] ?? '';
    const pares: ReadonlyArray<[string, string]> = [
      ['--nuage-ink-900', '--nuage-surface'],
      ['--nuage-ink-700', '--nuage-surface'],
      ['--nuage-ink-700', '--nuage-neutral-50'],
      ['--nuage-neutral-600', '--nuage-surface'],
      ['--nuage-neutral-600', '--nuage-neutral-50'],
      ['--nuage-blue', '--nuage-surface'],
      ['--nuage-blue', '--nuage-neutral-50'],
      ['--nuage-purple', '--nuage-surface'],
      ['--nuage-surface', '--nuage-purple'],
      ['--nuage-surface', '--nuage-pink-deep'],
      ['--nuage-surface', '--nuage-navy-900'],
      ['--nuage-surface', '--nuage-navy-800'],
      ['--nuage-surface', '--nuage-navy-700'],
      ['--nuage-neutral-400', '--nuage-navy-900'],
      ['--nuage-neutral-400', '--nuage-navy-800'],
      ['--nuage-purple', '--nuage-purple-soft'],
      ['--nuage-blue', '--nuage-blue-soft'],
      ['--nuage-deep-blue', '--nuage-blue-soft'],
      ['--nuage-ink-700', '--nuage-neutral-100'],
      ['--nuage-ink-900', '--nuage-pink-soft'],
      ['--nuage-ink-900', '--nuage-purple-soft'],
    ];
    for (const [texto, fundo] of pares) {
      expect(razaoContraste(cor(texto), cor(fundo)), `${texto} sobre ${fundo}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('Design System', () => {
  it('só tokens.css contém literais de cor', () => {
    for (const arquivo of arquivosCss.filter((nome) => nome !== 'tokens.css')) {
      const css = semComentarios(ler(arquivo));
      expect(css, arquivo).not.toMatch(/#[0-9a-fA-F]{3,8}\b/u);
      expect(css, arquivo).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/u);
    }
  });

  it('usa apenas raios da escala autorizada (0, 6px, 8px, 12px, 999px)', () => {
    const permitidos = new Set<string>(RAIOS_AUTORIZADOS);
    for (const [, valor] of ler('tokens.css').matchAll(/--nuage-raio-[\w-]+:\s*([^;]+);/gu)) {
      expect(permitidos.has((valor ?? '').trim())).toBe(true);
    }
    for (const arquivo of arquivosCss.filter((nome) => nome !== 'tokens.css')) {
      for (const [, valor] of semComentarios(ler(arquivo)).matchAll(/border-radius:\s*([^;]+);/gu)) {
        expect((valor ?? '').trim(), arquivo).toMatch(/^var\(--nuage-raio-[\w-]+\)$/u);
      }
    }
  });

  it('não usa pixels em tamanhos de fonte', () => {
    for (const arquivo of arquivosCss) {
      expect(ler(arquivo), arquivo).not.toMatch(/font-size:\s*\d+(?:\.\d+)?px/u);
    }
  });

  it('mantém uma única política de foco, de 3px pink com deslocamento de 2px', () => {
    const base = normalizar(ler('base.css'));
    expect(base).toContain(
      ':focus-visible { outline: var(--nuage-foco-espessura) solid var(--nuage-foco-cor); outline-offset: var(--nuage-foco-deslocamento); }',
    );
    expect(normalizar(ler('tokens.css'))).toContain('--nuage-foco-cor: var(--nuage-pink);');
    for (const arquivo of arquivosCss.filter((nome) => nome !== 'base.css')) {
      expect(ler(arquivo), arquivo).not.toMatch(/(?<![\w-])outline:\s*(?!none)\S/u);
    }
  });

  it('preserva movimento reduzido', () => {
    expect(ler('base.css')).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('não usa círculos como elemento de identidade', () => {
    for (const arquivo of arquivosCss) expect(ler(arquivo), arquivo).not.toMatch(/border-radius:\s*50%|circle\(/u);
  });

  it('declara os seis polígonos de marca com raio zero', () => {
    const formas = normalizar(ler('formas.css'));
    for (const classe of [
      'hexagono',
      'hexagono-vertical',
      'triangulo',
      'triangulo-canto',
      'selo',
      'paralelogramo',
      'seta',
    ]) {
      expect(formas, classe).toContain(`.nuage-${classe} {`);
    }
    expect(formas.match(/clip-path:/gu)).toHaveLength(7);
    expect(formas.match(/border-radius: var\(--nuage-raio-nenhum\);/gu)).toHaveLength(7);
  });

  it('usa a ordem de cascata do roteiro', () => {
    const principal = readFileSync(join(process.cwd(), 'src', 'main.tsx'), 'utf8');
    const ordem = ['base.css', 'formas.css', 'componentes.css', 'composicao.css'].map((arquivo) =>
      principal.indexOf(`./estilos/${arquivo}`),
    );
    expect(ordem.every((posicao) => posicao >= 0)).toBe(true);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
    expect(ler('base.css').trimStart().startsWith("@import './tokens.css';")).toBe(true);
  });

  it('declara a barra lateral fixa de 16rem e os dois pontos de quebra', () => {
    const componentes = normalizar(ler('componentes.css'));
    expect(componentes).toContain('.nuage-barra-lateral { position: fixed;');
    expect(componentes).toContain('width: var(--nuage-largura-barra-lateral);');
    const composicao = ler('composicao.css');
    expect(composicao).toContain('@media (max-width: 63.999rem)');
    expect(composicao).toContain('@media (max-width: 48rem)');
  });
});
