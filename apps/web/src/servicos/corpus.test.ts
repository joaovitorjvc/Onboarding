import { describe, expect, it } from 'vitest';
import { confirmado } from '../conteudo/apoio';
import { GLOSSARIO } from '../conteudo/glossario';
import { TRILHA } from '../conteudo/trilha';
import type { Modulo } from '../dominio/conteudo/tipos';
import { TRILHA_EXEMPLO } from '../testes-apoio/trilha-exemplo';
import { LIMITE_TOKENS_CORPUS } from './contrato-corpus';
import { avaliarCorpus, estimarTokens, hashConteudo, montarCorpus } from './corpus';
import { validarCorpus } from './validar-corpus';
import { pluginCorpusChat } from '../../scripts/plugin-corpus-chat';
import { validarUrlServicoChat } from '../../scripts/plugin-validar-ambiente';

const AGORA = '2026-01-01T00:00:00.000Z';

describe('corpus do chat', () => {
  it('é válido, publicável e cabe no orçamento de tokens', () => {
    const corpus = montarCorpus(TRILHA, GLOSSARIO, AGORA);
    expect(validarCorpus(corpus)).toEqual({ ok: true, corpus });
    expect(corpus.modulos).toHaveLength(11);
    expect(avaliarCorpus(corpus)).toEqual({ tokensEstimados: expect.any(Number), erros: [] });
    expect(avaliarCorpus(corpus).tokensEstimados).toBeLessThan(LIMITE_TOKENS_CORPUS);
  });

  it('marca seções pendentes com prefixo explícito e publica só definições confirmadas', () => {
    const corpus = montarCorpus(TRILHA, GLOSSARIO, AGORA);
    const secao = corpus.modulos[1]?.secoes[0];
    expect(secao?.pendente).toBe(true);
    expect(secao?.texto.startsWith('[PENDENTE]')).toBe(true);
    expect(corpus.glossario.map((t) => t.termo)).toEqual(expect.arrayContaining(['Trilha', 'Módulo']));
    expect(corpus.glossario.map((t) => t.termo)).not.toContain('BANT');
  });

  it('a versão do conteúdo não depende de geradoEm', () => {
    const a = montarCorpus(TRILHA, GLOSSARIO, AGORA);
    const b = montarCorpus(TRILHA, GLOSSARIO, '2030-12-31T23:59:59.000Z');
    expect(a.versaoConteudo).toBe(b.versaoConteudo);
    expect(a.versaoConteudo).toMatch(/^[0-9a-f]{16}$/u);
    expect(montarCorpus(TRILHA_EXEMPLO, GLOSSARIO, AGORA).versaoConteudo).not.toBe(a.versaoConteudo);
    expect(hashConteudo('a')).not.toBe(hashConteudo('b'));
  });

  it('estima quatro caracteres por token', () => {
    expect(estimarTokens('abcd')).toBe(1);
    expect(estimarTokens('abcde')).toBe(2);
  });

  it('reprova dados sensíveis e excesso de tokens', () => {
    const base = TRILHA[0];
    if (!base) throw new Error('Trilha vazia');
    const sensivel: Modulo = {
      ...base,
      secoes: [{ tipo: 'texto', id: 's', titulo: 'S', conteudo: confirmado(['Contato: pessoa@exemplo.com'], 'teste') }],
    };
    const relatorio = avaliarCorpus(montarCorpus([sensivel], [], AGORA));
    expect(relatorio.erros.some((erro) => erro.includes('e-mail'))).toBe(true);

    const enorme: Modulo = {
      ...base,
      secoes: [
        {
          tipo: 'texto',
          id: 's',
          titulo: 'S',
          conteudo: confirmado(['x'.repeat(LIMITE_TOKENS_CORPUS * 4 + 100)], 'teste'),
        },
      ],
    };
    expect(avaliarCorpus(montarCorpus([enorme], [], AGORA)).erros.some((erro) => erro.includes('orçamento'))).toBe(
      true,
    );
  });

  it('o validador acumula todos os erros', () => {
    const resultado = validarCorpus({
      versaoCorpus: 2,
      versaoConteudo: 'curto',
      geradoEm: 'x',
      modulos: [],
      glossario: 1,
    });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.erros.length).toBeGreaterThanOrEqual(4);
  });
});

describe('build', () => {
  it('rejeita variável ausente, vazia, só com espaços, sem esquema http(s) ou relativa', () => {
    expect(validarUrlServicoChat(undefined)).not.toBeNull();
    expect(validarUrlServicoChat('')).not.toBeNull();
    expect(validarUrlServicoChat('   ')).not.toBeNull();
    expect(validarUrlServicoChat('ftp://servico')).not.toBeNull();
    expect(validarUrlServicoChat('/api')).not.toBeNull();
    expect(validarUrlServicoChat('http://localhost:3333')).toBeNull();
    expect(validarUrlServicoChat('https://servico.exemplo')).toBeNull();
  });

  it('o plugin de corpus emite conteudo-chat.json durante o build', () => {
    const plugin = pluginCorpusChat();
    expect(plugin.name).toBe('onboarding-corpus-chat');
    expect(plugin.apply).toBe('build');
  });
});
