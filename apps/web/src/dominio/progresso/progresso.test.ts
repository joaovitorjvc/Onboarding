import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { TRILHA } from '../../conteudo/trilha';
import { ArmazenamentoEmMemoria } from '../../testes-apoio/armazenamento-em-memoria';
import { IDS_MODULO } from '../conteudo/tipos';
import { atualizarProgresso, CHAVE_PROGRESSO, lerProgresso, reiniciarProgresso } from './armazenamento';
import { comItemChecklist, comModuloConcluido, resumirProgresso } from './calculo';
import { interpretarRegistro, registroVazio } from './esquema';

const AGORA = '2026-01-01T00:00:00.000Z';
const EXECUCOES = { numRuns: 100 };

const subconjuntoDeModulos = fc.subarray([...IDS_MODULO]);

describe('cálculo do progresso', () => {
  it('percentual = round(concluídos / total × 100), limitado a 0..100 (propriedade)', () => {
    fc.assert(
      fc.property(subconjuntoDeModulos, (concluidos) => {
        const registro = concluidos.reduce(
          (atual, id) => comModuloConcluido(atual, id, true, AGORA),
          registroVazio(AGORA),
        );
        const resumo = resumirProgresso(registro, TRILHA);
        expect(resumo.concluidos).toBe(concluidos.length);
        expect(resumo.percentual).toBe(Math.round((concluidos.length / 11) * 100));
        expect(resumo.percentual).toBeGreaterThanOrEqual(0);
        expect(resumo.percentual).toBeLessThanOrEqual(100);
      }),
      EXECUCOES,
    );
  });

  it('o próximo Módulo é o primeiro não concluído na ordem canônica, ou null (propriedade)', () => {
    fc.assert(
      fc.property(subconjuntoDeModulos, (concluidos) => {
        const registro = concluidos.reduce(
          (atual, id) => comModuloConcluido(atual, id, true, AGORA),
          registroVazio(AGORA),
        );
        const esperado = IDS_MODULO.find((id) => !concluidos.includes(id)) ?? null;
        expect(resumirProgresso(registro, TRILHA).proximoModulo).toBe(esperado);
      }),
      EXECUCOES,
    );
  });
});

describe('leitura tolerante', () => {
  it('nunca lança, para qualquer string (propriedade)', () => {
    fc.assert(
      fc.property(fc.string(), (bruto) => {
        const registro = interpretarRegistro(bruto, AGORA);
        expect(registro.versaoSchema).toBe(1);
      }),
      EXECUCOES,
    );
  });

  it('JSON inválido e versão desconhecida descartam o documento inteiro', () => {
    expect(interpretarRegistro('{não é json', AGORA)).toEqual(registroVazio(AGORA));
    const v2 = JSON.stringify({
      versaoSchema: 2,
      modulos: { 'visao-da-area': { concluido: true, atualizadoEm: AGORA } },
    });
    expect(interpretarRegistro(v2, AGORA)).toEqual(registroVazio(AGORA));
  });

  it('descarta só a entrada com ID desconhecido ou tipo inválido', () => {
    const bruto = JSON.stringify({
      versaoSchema: 1,
      modulos: {
        'visao-da-area': { concluido: true, atualizadoEm: AGORA },
        'modulo-inexistente': { concluido: true, atualizadoEm: AGORA },
        kickoffs: { concluido: 'sim', atualizadoEm: AGORA },
      },
      checklists: { 'acessos-iniciais': { clickup: true, kiro: 'talvez' }, 'modulo-inexistente': { x: true } },
      atualizadoEm: AGORA,
    });
    const registro = interpretarRegistro(bruto, AGORA);
    expect(Object.keys(registro.modulos)).toEqual(['visao-da-area']);
    expect(registro.checklists).toEqual({ 'acessos-iniciais': { clickup: true } });
  });

  it('módulo ausente significa não concluído', () => {
    expect(resumirProgresso(registroVazio(AGORA), TRILHA).concluidos).toBe(0);
  });
});

describe('armazenamento', () => {
  it('round-trip: o que se grava é o que se lê (propriedade)', () => {
    fc.assert(
      fc.property(subconjuntoDeModulos, (concluidos) => {
        const armazenamento = new ArmazenamentoEmMemoria();
        let ultimo = registroVazio(AGORA);
        for (const id of concluidos) {
          ultimo = atualizarProgresso(armazenamento, AGORA, (atual) =>
            comModuloConcluido(atual, id, true, AGORA),
          ).registro;
        }
        expect(lerProgresso(armazenamento, AGORA).registro).toEqual(ultimo);
      }),
      EXECUCOES,
    );
  });

  it('falha de gravação devolve o estado anterior e preserva o armazenado (propriedade)', () => {
    fc.assert(
      fc.property(subconjuntoDeModulos, fc.constantFrom(...IDS_MODULO), (concluidos, alvo) => {
        const armazenamento = new ArmazenamentoEmMemoria();
        for (const id of concluidos) {
          atualizarProgresso(armazenamento, AGORA, (atual) => comModuloConcluido(atual, id, true, AGORA));
        }
        const antes = armazenamento.dados.get(CHAVE_PROGRESSO) ?? null;
        const registroAntes = lerProgresso(armazenamento, AGORA).registro;
        armazenamento.falharGravacao = true;
        const resultado = atualizarProgresso(armazenamento, AGORA, (atual) =>
          comModuloConcluido(atual, alvo, true, AGORA),
        );
        expect(resultado.ok).toBe(false);
        expect(resultado.registro).toEqual(registroAntes);
        expect(armazenamento.dados.get(CHAVE_PROGRESSO) ?? null).toBe(antes);
      }),
      EXECUCOES,
    );
  });

  it('a gravação usa a chave versionada e o formato documentado', () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    atualizarProgresso(armazenamento, AGORA, (atual) =>
      comItemChecklist(atual, 'acessos-iniciais', 'clickup', true, AGORA),
    );
    expect(CHAVE_PROGRESSO).toBe('onboarding-solutions:progresso:v1');
    const salvo: unknown = JSON.parse(armazenamento.dados.get(CHAVE_PROGRESSO) ?? 'null');
    expect(salvo).toMatchObject({ versaoSchema: 1, checklists: { 'acessos-iniciais': { clickup: true } } });
  });

  it('armazenamento indisponível: somente leitura e progresso vazio', () => {
    expect(lerProgresso(null, AGORA)).toEqual({ somenteLeitura: true, registro: registroVazio(AGORA) });
    const quebrado = new ArmazenamentoEmMemoria();
    quebrado.falharLeitura = true;
    expect(lerProgresso(quebrado, AGORA).somenteLeitura).toBe(true);
    expect(atualizarProgresso(null, AGORA, (atual) => atual).ok).toBe(false);
  });

  it('reiniciar remove a chave', () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    atualizarProgresso(armazenamento, AGORA, (atual) => comModuloConcluido(atual, 'kickoffs', true, AGORA));
    expect(reiniciarProgresso(armazenamento, AGORA).ok).toBe(true);
    expect(armazenamento.dados.has(CHAVE_PROGRESSO)).toBe(false);
  });
});
