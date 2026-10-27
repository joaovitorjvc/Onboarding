import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const raizSrc = join(process.cwd(), 'src');
const pastasNovas = ['componentes', 'paginas', 'estilos', 'conteudo', 'hooks', 'servicos', 'dominio'];

function listar(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    return statSync(caminho).isDirectory() ? listar(caminho) : [caminho];
  });
}

const css = listar(join(raizSrc, 'estilos'))
  .filter((arquivo) => arquivo.endsWith('.css'))
  .map((arquivo) => readFileSync(arquivo, 'utf8'))
  .join('\n')
  .replace(/\/\*[\s\S]*?\*\//gu, '')
  .replace(/@import[^;]*;/gu, '');

const seletores = [...css.matchAll(/([^{}]+)\{/gu)].map((m) => m[1] ?? '').join(' ');
const classesDefinidas = new Set([...seletores.matchAll(/\.([a-zA-Z][\w-]*)/gu)].map((m) => m[1] ?? ''));

const fontes = pastasNovas
  .flatMap((pasta) => listar(join(raizSrc, pasta)))
  .filter((arquivo) => /\.tsx?$/u.test(arquivo) && !/\.test\.tsx?$/u.test(arquivo));

describe('classes CSS', () => {
  it('toda classe do CSS usa o prefixo .nuage-* (exceto o utilitário .oculto)', () => {
    const fora = [...classesDefinidas].filter((classe) => !classe.startsWith('nuage-') && classe !== 'oculto');
    expect(fora).toEqual([]);
  });

  it('toda classe .nuage-* usada nos componentes está definida no CSS', () => {
    // Marcadores de página previstos no roteiro (§19) que não têm regra própria.
    const marcadoresSemRegra = new Set(['nuage-pagina-inicio']);
    const ausentes: string[] = [];
    for (const arquivo of fontes.filter((f) => f.endsWith('.tsx'))) {
      const codigo = readFileSync(arquivo, 'utf8');
      for (const [, nome] of codigo.matchAll(/(nuage-[\w-]*)/gu)) {
        const classe = nome ?? '';
        // Prefixos de classes montadas dinamicamente (ex.: `nuage-botao--${variante}`) terminam em hífen.
        const definida = classe.endsWith('-')
          ? [...classesDefinidas].some((definidaCss) => definidaCss.startsWith(classe))
          : classesDefinidas.has(classe);
        if (!definida && !marcadoresSemRegra.has(classe) && !/^nuage-(chat-painel|hex-tamanho)$/u.test(classe))
          ausentes.push(`${arquivo.replace(raizSrc, '')}: ${classe}`);
      }
    }
    expect(ausentes).toEqual([]);
  });

  it('nenhum componente novo usa estilo inline de cor, tipografia ou espaçamento', () => {
    const proibidos = /style=\{\{[^}]*(color|background|font|margin|padding|border)/u;
    for (const arquivo of fontes.filter((f) => f.endsWith('.tsx'))) {
      expect(readFileSync(arquivo, 'utf8'), arquivo).not.toMatch(proibidos);
    }
  });
});

describe('nome do portal', () => {
  it('o nome do portal é Nuage It Plataforma de Onboarding e nenhum nome antigo aparece na interface', () => {
    for (const arquivo of fontes) {
      const codigo = readFileSync(arquivo, 'utf8');
      expect(codigo, arquivo).not.toContain('Onboarding Solutions');
      expect(codigo, arquivo).not.toContain('Onboarding SDR');
    }
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    expect(html).not.toContain('Onboarding Solutions');
    expect(html).not.toContain('Onboarding SDR');
  });

  it('o título do documento HTML usa Nuage It Plataforma de Onboarding', () => {
    expect(readFileSync(join(process.cwd(), 'index.html'), 'utf8')).toContain(
      '<title>Nuage It Plataforma de Onboarding</title>',
    );
  });
});
