import { cleanup, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArmazenamentoEmMemoria } from '../../testes-apoio/armazenamento-em-memoria';
import { renderizar } from '../../testes-apoio/renderizar';
import { TRILHA_EXEMPLO } from '../../testes-apoio/trilha-exemplo';
import { Icone, TRACADO, type NomeIcone } from './Icone';

beforeEach(() => {
  window.scrollTo = vi.fn();
});

afterEach(cleanup);

// Caminhos transcritos de ICONES-USADOS.md §2.
const CATALOGO: Readonly<Record<NomeIcone, string>> = {
  inicio: 'M3 10.5 12 3l9 7.5M5.25 9.5V20h13.5V9.5',
  trilha: 'M9 4.5h11M9 12h11M9 19.5h11M4 4.5h.01M4 12h.01M4 19.5h.01',
  triagem: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2',
  glossario: 'M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM17 7h2v13H8',
  referencias:
    'M10 13a4 4 0 0 0 5.7.4l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 11a4 4 0 0 0-5.7-.4l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2',
  pendencias: 'M12 3.5 22 20H2L12 3.5ZM12 9.5v5M12 17h.01',
  perguntas: 'M9 9a3 3 0 1 1 3 3v2.5M12 18h.01M4 4h16v16H4V4Z',
  chat: 'M4 5h16v11H9l-5 4V5Z',
  fechar: 'M6 6l12 12M18 6 6 18',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  'seta-direita': 'M5 12h13M12.5 5.5 19 12l-6.5 6.5',
  sair: 'M15 4h4v16h-4M11 8l-4 4 4 4M7 12h10',
};

describe('catálogo de ícones', () => {
  it('tem os 13 ícones, com os caminhos SVG do catálogo oficial', () => {
    expect(Object.keys(TRACADO).sort()).toEqual(Object.keys(CATALOGO).sort());
    expect(Object.keys(TRACADO)).toHaveLength(13);
    for (const nome of Object.keys(CATALOGO) as NomeIcone[]) {
      expect(TRACADO[nome], nome).toBe(CATALOGO[nome]);
    }
  });

  it.each(Object.keys(CATALOGO) as NomeIcone[])('%s desenha um <path> real na grade 24 × 24', (nome) => {
    const { container } = render(<Icone nome={nome} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.querySelector('path')?.getAttribute('d')).toBe(CATALOGO[nome]);
  });
});

describe('Icone', () => {
  it('usa a configuração padrão: 1.125rem, traço 1.5, extremidades arredondadas e currentColor', () => {
    const { container } = render(<Icone nome="busca" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('1.125rem');
    expect(svg?.getAttribute('height')).toBe('1.125rem');
    expect(svg?.getAttribute('fill')).toBe('none');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('stroke-width')).toBe('1.5');
    expect(svg?.getAttribute('stroke-linecap')).toBe('round');
    expect(svg?.getAttribute('stroke-linejoin')).toBe('round');
  });

  it('é decorativo por padrão (aria-hidden) e informativo com descrição (role img)', () => {
    const { container } = render(
      <>
        <Icone nome="busca" />
        <Icone nome="trilha" descricao="Progresso da Trilha" tamanho="2rem" />
      </>,
    );
    const [decorativo, informativo] = Array.from(container.querySelectorAll('svg'));
    expect(decorativo?.getAttribute('aria-hidden')).toBe('true');
    expect(decorativo?.getAttribute('focusable')).toBe('false');
    expect(decorativo?.getAttribute('role')).toBeNull();
    expect(informativo?.getAttribute('role')).toBe('img');
    expect(informativo?.getAttribute('aria-label')).toBe('Progresso da Trilha');
    expect(informativo?.getAttribute('aria-hidden')).toBeNull();
    expect(informativo?.getAttribute('width')).toBe('2rem');
    expect(screen.getByRole('img', { name: 'Progresso da Trilha' })).toBeTruthy();
  });

  it('descrição vazia ou só com espaços mantém o ícone decorativo', () => {
    const { container } = render(<Icone nome="check" descricao="   " />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('nunca fixa uma cor dentro do SVG', () => {
    const { container } = render(<Icone nome="pendencias" />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}|rgb\(|hsl\(/u);
    expect(container.querySelector('svg')?.getAttribute('stroke')).toBe('currentColor');
  });

  it('espelhado aplica a classe de espelhamento horizontal', () => {
    const { container } = render(<Icone nome="seta-direita" espelhado />);
    expect(container.querySelector('svg')?.getAttribute('class')).toBe('nuage-icone nuage-icone--espelhado');
  });
});

describe('onde os ícones aparecem', () => {
  const caminhoDe = (nome: NomeIcone): string => TRACADO[nome];
  const iconeDe = (elemento: Element | null): string | undefined =>
    elemento?.querySelector('svg path')?.getAttribute('d') ?? undefined;

  it('barra lateral: um ícone por item de navegação', () => {
    renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    const navegacao = screen.getByRole('navigation', { name: 'Navegação principal' });
    const esperado: ReadonlyArray<[string, NomeIcone]> = [
      ['Início', 'inicio'],
      ['Trilha', 'trilha'],
      ['Triagem de escopo', 'triagem'],
      ['Banco de Perguntas', 'perguntas'],
      ['Pesquisa prévia', 'busca'],
      ['Busca', 'busca'],
      ['Glossário', 'glossario'],
      ['Referências', 'referencias'],
      ['Pendências', 'pendencias'],
    ];
    for (const [rotulo, icone] of esperado) {
      const link = within(navegacao).getByRole('link', { name: rotulo });
      expect(iconeDe(link), rotulo).toBe(caminhoDe(icone));
    }
  });

  it('Início: indicadores com trilha, check e pendencias; próximo Módulo com seta', () => {
    const { container } = renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    const indicadores = Array.from(container.querySelectorAll('.nuage-indicador .nuage-moldura-icone')).map((moldura) =>
      iconeDe(moldura),
    );
    expect(indicadores).toEqual([caminhoDe('trilha'), caminhoDe('check'), caminhoDe('pendencias')]);
    const proximo = within(screen.getByRole('main')).getByRole('link', { name: /^Módulo 1:/u });
    expect(proximo.querySelector('svg path')?.getAttribute('d')).toBe(caminhoDe('seta-direita'));
  });

  it('chat: ícone chat no gatilho e ícone fechar no botão de fechamento', async () => {
    renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    const gatilho = screen.getByRole('button', { name: 'Abrir assistente' });
    expect(iconeDe(gatilho)).toBe(caminhoDe('chat'));
    gatilho.click();
    const fechar = await screen.findByRole('button', { name: 'Fechar assistente' });
    expect(iconeDe(fechar)).toBe(caminhoDe('fechar'));
  });

  it('seta-direita nos cartões da Trilha, dos Módulos e nos blocos expansíveis', () => {
    const { container, unmount } = renderizar('/trilha', { armazenamento: new ArmazenamentoEmMemoria() });
    const setas = Array.from(container.querySelectorAll('.nuage-lista-modulos a')).map((link) =>
      link.querySelector('svg:last-child path')?.getAttribute('d'),
    );
    expect(setas).toHaveLength(11);
    expect(new Set(setas)).toEqual(new Set([caminhoDe('seta-direita')]));
    unmount();

    const banco = renderizar('/trilha/entrevista-tecnica/secao/banco-de-perguntas', {
      armazenamento: new ArmazenamentoEmMemoria(),
    });
    const resumos = Array.from(banco.container.querySelectorAll('summary'));
    expect(resumos).toHaveLength(7);
    for (const resumo of resumos) expect(iconeDe(resumo)).toBe(caminhoDe('seta-direita'));
  });

  it('navegação entre seções: "Anterior" usa a seta espelhada', () => {
    const { container } = renderizar('/trilha/visao-da-area/secao/s-lista', {
      armazenamento: new ArmazenamentoEmMemoria(),
      trilha: TRILHA_EXEMPLO,
    });
    const [anterior, proxima] = Array.from(container.querySelectorAll('.nuage-navegacao-vizinhos a'));
    expect(anterior?.querySelector('svg')?.getAttribute('class')).toContain('nuage-icone--espelhado');
    expect(proxima?.querySelector('svg')?.getAttribute('class')).not.toContain('espelhado');
    expect(anterior?.textContent).toBe('Anterior: Texto de exemplo');
  });

  it('ícone decorativo não altera o nome acessível dos controles', () => {
    renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    expect(screen.getByRole('link', { name: 'Início' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abrir assistente' })).toBeTruthy();
  });

  it('páginas com ícones continuam sem violações de acessibilidade', async () => {
    const { container } = renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    const resultado = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(resultado.violations.map((v) => v.id)).toEqual([]);
  });
});
