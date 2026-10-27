import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { confirmado } from '../../conteudo/apoio';
import { TRILHA } from '../../conteudo/trilha';
import { TRILHA_EXEMPLO } from '../../testes-apoio/trilha-exemplo';
import type { Modulo } from '../conteudo/tipos';
import { buscar, MAXIMO_RESULTADOS } from './buscar';
import { criarIndice } from './indice';
import { normalizar } from './normalizar';

const indiceExemplo = criarIndice(TRILHA_EXEMPLO);

describe('busca', () => {
  it('normaliza caixa e diacríticos', () => {
    expect(normalizar('AÇÃO Técnica')).toBe('acao tecnica');
  });

  it('é invariável a caixa e acentuação (propriedade)', () => {
    fc.assert(
      fc.property(fc.constantFrom('parágrafo', 'PARAGRAFO', 'Paragrafo', 'parágrafo de exemplo', 'LISTA'), (termo) => {
        const base = buscar(
          indiceExemplo,
          termo
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, ''),
        );
        const variacao = buscar(indiceExemplo, termo);
        expect(variacao.tipo).toBe('resultados');
        expect(variacao).toMatchObject({ itens: expect.arrayContaining([]) });
        if (base.tipo === 'resultados' && variacao.tipo === 'resultados') {
          expect(variacao.itens.map((i) => i.idSecao)).toEqual(base.itens.map((i) => i.idSecao));
        }
      }),
      { numRuns: 100 },
    );
  });

  it('encontra seções por título e por conteúdo confirmado', () => {
    const porConteudo = buscar(indiceExemplo, 'Parágrafo de exemplo');
    expect(porConteudo.tipo === 'resultados' && porConteudo.itens.map((i) => i.idSecao)).toContain('s-texto');
    const porTitulo = buscar(TRILHA.length ? criarIndice(TRILHA) : [], 'bant');
    expect(porTitulo.tipo === 'resultados' && porTitulo.itens.map((i) => i.idSecao)).toContain('bant');
  });

  it('não indexa a descrição de conteúdo pendente como se fosse confirmado', () => {
    const resultado = buscar(indiceExemplo, 'Descrição pendente de exemplo');
    expect(resultado).toMatchObject({ tipo: 'resultados', itens: [] });
  });

  it('exige de 2 a 100 caracteres', () => {
    expect(buscar(indiceExemplo, 'a')).toEqual({ tipo: 'termo-invalido', motivo: 'curto' });
    expect(buscar(indiceExemplo, '   ')).toEqual({ tipo: 'termo-invalido', motivo: 'curto' });
    expect(buscar(indiceExemplo, 'a'.repeat(101))).toEqual({ tipo: 'termo-invalido', motivo: 'longo' });
  });

  it('limita o resultado a 50 entradas', () => {
    const base = TRILHA[0];
    if (!base) throw new Error('Trilha vazia');
    const secoes = Array.from({ length: MAXIMO_RESULTADOS + 10 }, (_, i) => ({
      tipo: 'texto' as const,
      id: `secao-${i}`,
      titulo: `Seção ${i}`,
      conteudo: confirmado(['termo comum'], 'teste'),
    }));
    const modulo: Modulo = { ...base, secoes };
    const resultado = buscar(criarIndice([modulo]), 'termo comum');
    expect(resultado.tipo === 'resultados' && resultado.itens.length).toBe(MAXIMO_RESULTADOS);
  });

  it('memoiza o índice por referência de Trilha', () => {
    expect(criarIndice(TRILHA)).toBe(criarIndice(TRILHA));
  });
});
