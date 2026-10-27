import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { decidirTriagem } from './decidir';
import { PROVIDERS, type EntradaTriagem } from './tipos';

describe('triagem', () => {
  it('AWS é conduzida pelo Arquiteto, com ou sem migração', () => {
    for (const migracao of [true, false, undefined]) {
      const entrada: EntradaTriagem = migracao === undefined ? { provider: 'aws' } : { provider: 'aws', migracao };
      expect(decidirTriagem(entrada)).toEqual({
        tipo: 'conduzida-pelo-arquiteto',
        proximoModulo: 'entrevista-tecnica',
      });
    }
  });

  it('GCP sem migração volta ao Account Manager para acionar a CAVA', () => {
    expect(decidirTriagem({ provider: 'gcp', migracao: false })).toEqual({
      tipo: 'devolvida-ao-account-manager',
      acionar: 'CAVA',
    });
  });

  it('GCP com migração é pendência do Gestor, sem inferência', () => {
    expect(decidirTriagem({ provider: 'gcp', migracao: true })).toEqual({ tipo: 'pendencia-do-gestor' });
  });

  it('Azure, on-premise e outros são pendência do Gestor', () => {
    for (const provider of ['azure', 'on-premise', 'outro'] as const) {
      expect(decidirTriagem({ provider, migracao: false })).toEqual({ tipo: 'pendencia-do-gestor' });
      expect(decidirTriagem({ provider })).toEqual({ tipo: 'pendencia-do-gestor' });
    }
  });

  it('nomeia os campos ausentes', () => {
    expect(decidirTriagem({})).toEqual({ tipo: 'campos-ausentes', campos: ['provider', 'migracao'] });
    expect(decidirTriagem({ migracao: true })).toEqual({ tipo: 'campos-ausentes', campos: ['provider'] });
    expect(decidirTriagem({ provider: 'gcp' })).toEqual({ tipo: 'campos-ausentes', campos: ['migracao'] });
  });

  it('é total: toda combinação produz um resultado (propriedade)', () => {
    fc.assert(
      fc.property(
        fc.option(fc.constantFrom(...PROVIDERS), { nil: undefined }),
        fc.option(fc.boolean(), { nil: undefined }),
        (provider, migracao) => {
          const entrada: EntradaTriagem = {};
          if (provider !== undefined) entrada.provider = provider;
          if (migracao !== undefined) entrada.migracao = migracao;
          expect(decidirTriagem(entrada)).toHaveProperty('tipo');
        },
      ),
      { numRuns: 100 },
    );
  });
});
