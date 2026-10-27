import { describe, expect, it } from 'vitest';
import { BANCO_PERGUNTAS } from '../../conteudo/banco-perguntas';
import { GLOSSARIO } from '../../conteudo/glossario';
import { REFERENCIAS } from '../../conteudo/referencias';
import { TRILHA } from '../../conteudo/trilha';
import { CONJUNTOS, conjuntosParaSituacao, PILARES } from '../banco-perguntas/selecionar';
import { CATEGORIAS_GLOSSARIO, ordenarGlossario, termosDuplicados } from '../glossario/ordenar';
import { coletarPendencias } from '../pendencias/coletar';
import { verificarCorrespondencia } from '../referencias/coletar';
import { achatarSecao } from './achatar';
import { detectarDadosSensiveis } from './dados-sensiveis';
import { IDS_MODULO } from './tipos';
import { validarTrilha } from './validar';

describe('Trilha', () => {
  it('tem exatamente 11 Módulos, na ordem canônica e com posições 1..11', () => {
    expect(TRILHA).toHaveLength(11);
    expect(TRILHA.map((modulo) => modulo.id)).toEqual([...IDS_MODULO]);
    expect(TRILHA.map((modulo) => modulo.posicao)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(validarTrilha(TRILHA)).toEqual([]);
  });

  it('mantém os IDs completos de seção dos Módulos 5 e 6 definidos na especificação', () => {
    const ids = (posicao: number) => TRILHA[posicao - 1]?.secoes.map((secao) => secao.id);
    expect(ids(5)).toEqual([
      'proposal-doc-fonte-da-verdade',
      'ordem-dos-documentos',
      'estrutura-do-proposal-doc',
      'relacao-com-a-proposta-comercial',
      'terminologia-oficial',
      'onde-cada-documento-e-gerado',
      'geracao-da-imagem-da-arquitetura',
      'prompt-da-imagem-da-arquitetura',
      'boas-praticas-da-calculadora-aws',
      'minimos-cloudwatch-na-calculadora',
      'estimativa-de-tokens-de-ia-na-calculadora',
      'servicos-de-seguranca-na-composicao',
      'cenarios-de-multi-account',
      'referencias-da-construcao',
    ]);
    expect(ids(6)).toEqual([
      'onde-o-calculo-acontece',
      'formula-de-custo',
      'formula-de-valor-de-venda',
      'margem-de-contribuicao',
      'formula-de-valor-hora',
      'limites-de-esforco',
      'fator-produtividade-ia',
      'perfis-do-fator-produtividade',
      'acrescimos-de-precificacao',
      'perfis-de-recurso',
      'prazo-e-artefatos',
      'referencias-da-precificacao',
    ]);
  });

  it('mantém todo o conteúdo dos Módulos como pendência explícita, sem texto especulativo', () => {
    for (const modulo of TRILHA) {
      // O Módulo 1 tem resumo confirmado; os demais seguem pendentes.
      expect(modulo.resumo.estado).toBe(modulo.posicao === 1 ? 'confirmado' : 'pendente');
      for (const secao of modulo.secoes) {
        // Seções já confirmadas (Módulo 1) não são pendentes; as demais seguem pendentes.
        if (secao.conteudo.estado === 'confirmado') {
          expect(achatarSecao(secao).pendente).toBe(false);
          continue;
        }
        const achatado = achatarSecao(secao);
        expect(achatado.pendente).toBe(true);
        expect(achatado.texto).toBe('');
      }
    }
  });

  it('detecta IDs duplicados, ordem errada e quantidade incorreta', () => {
    expect(validarTrilha(TRILHA.slice(1)).length).toBeGreaterThan(0);
    expect(validarTrilha([...TRILHA].reverse()).length).toBeGreaterThan(0);
    const primeiro = TRILHA[0];
    if (!primeiro) throw new Error('Trilha vazia');
    const duplicada = [{ ...primeiro, secoes: [...primeiro.secoes, ...primeiro.secoes] }, ...TRILHA.slice(1)];
    expect(validarTrilha(duplicada).some((erro) => erro.includes('duplicado'))).toBe(true);
  });
});

describe('dados sensíveis', () => {
  it.each([
    ['e-mail', 'fale com pessoa@exemplo.com'],
    ['CPF', 'CPF 123.456.789-09'],
    ['telefone', 'ligue (11) 91234-5678'],
    ['valor monetário', 'custa R$ 150'],
    ['faixa salarial', 'a faixa salarial é confidencial'],
  ])('rejeita %s', (motivo, texto) => {
    expect(detectarDadosSensiveis(texto)).toContain(motivo);
  });

  it('aceita a identificação de papéis do processo', () => {
    expect(detectarDadosSensiveis('O Arquiteto conduz a entrevista com o Account Manager.')).toEqual([]);
  });

  it('não encontra dados sensíveis em nenhum título ou glossário publicado', () => {
    for (const modulo of TRILHA) {
      expect(detectarDadosSensiveis(modulo.titulo)).toEqual([]);
      for (const secao of modulo.secoes) expect(detectarDadosSensiveis(secao.titulo)).toEqual([]);
    }
    for (const entrada of GLOSSARIO) expect(detectarDadosSensiveis(entrada.termo)).toEqual([]);
  });
});

describe('pendências', () => {
  it('são derivadas da árvore, com IDs únicos', () => {
    const pendencias = coletarPendencias(TRILHA, GLOSSARIO);
    const doModulos = TRILHA.reduce(
      (total, modulo) =>
        total +
        (modulo.resumo.estado === 'pendente' ? 1 : 0) +
        (modulo.origem.estado === 'pendente' ? 1 : 0) +
        modulo.secoes.filter((secao) => secao.conteudo.estado === 'pendente').length,
      0,
    );
    const doGlossario = GLOSSARIO.filter((entrada) => entrada.definicao.estado === 'pendente').length;
    expect(pendencias).toHaveLength(doModulos + doGlossario);
    expect(new Set(pendencias.map((item) => item.id)).size).toBe(pendencias.length);
  });

  it('removem o nó automaticamente quando ele passa a confirmado', () => {
    const primeiro = TRILHA[1];
    if (!primeiro) throw new Error('Trilha vazia');
    const [secao, ...resto] = primeiro.secoes;
    if (!secao) throw new Error('Módulo sem seções');
    const confirmada = {
      ...secao,
      tipo: 'texto',
      conteudo: { estado: 'confirmado', valor: ['ok'], origem: { tipo: 'confirmacao-gestor', referencia: 'teste' } },
    } as const;
    const alterada = [TRILHA[0], { ...primeiro, secoes: [confirmada, ...resto] }, ...TRILHA.slice(2)];
    expect(coletarPendencias(alterada)).toHaveLength(coletarPendencias(TRILHA).length - 1);
  });
});

describe('glossário', () => {
  it('não tem termos duplicados e usa apenas categorias conhecidas', () => {
    expect(termosDuplicados(GLOSSARIO)).toEqual([]);
    for (const entrada of GLOSSARIO) expect(CATEGORIAS_GLOSSARIO).toContain(entrada.categoria);
  });

  it('ordena de forma alfabética, ignorando acentos e caixa', () => {
    const termos = ordenarGlossario(GLOSSARIO).map((entrada) => entrada.termo);
    const esperado = [...termos].sort((a, b) =>
      a
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .localeCompare(
          b
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase(),
          'pt-BR',
        ),
    );
    expect(termos).toEqual(esperado);
  });
});

describe('referências', () => {
  it('estão consistentes com as citações da Trilha', () => {
    expect(verificarCorrespondencia(TRILHA, REFERENCIAS)).toEqual([]);
  });

  it('reprovam referência sem citação de origem e duplicatas', () => {
    const solta = { caminho: 'docs/x.md', idModulo: 'visao-da-area', idSecao: 'escopo-de-atuacao' } as const;
    expect(verificarCorrespondencia(TRILHA, [solta]).length).toBeGreaterThan(0);
    expect(verificarCorrespondencia(TRILHA, [solta, solta])).toContain('Há referências duplicadas.');
  });
});

describe('Banco de Perguntas', () => {
  it('tem 7 Pilares × 2 conjuntos = 14 conjuntos', () => {
    expect(PILARES).toHaveLength(7);
    expect(CONJUNTOS).toHaveLength(2);
    const total = PILARES.flatMap((pilar) => CONJUNTOS.map((conjunto) => BANCO_PERGUNTAS[pilar][conjunto]));
    expect(total).toHaveLength(14);
  });

  it('seleciona os conjuntos corretos para cada situação', () => {
    expect(conjuntosParaSituacao('poc')).toEqual(['poc']);
    expect(conjuntosParaSituacao('mvp-apos-poc')).toEqual(['mvp']);
    expect(conjuntosParaSituacao('mvp-direto')).toEqual(['poc', 'mvp']);
  });
});
