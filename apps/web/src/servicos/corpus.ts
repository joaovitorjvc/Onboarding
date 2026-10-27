import { achatarSecao } from '../dominio/conteudo/achatar.ts';
import { detectarDadosSensiveis } from '../dominio/conteudo/dados-sensiveis.ts';
import type { Modulo } from '../dominio/conteudo/tipos.ts';
import type { EntradaGlossario } from '../dominio/glossario/ordenar.ts';
import { LIMITE_TOKENS_CORPUS, type CorpusChat } from './contrato-corpus.ts';

/** Estimativa conservadora: quatro caracteres por token. */
export function estimarTokens(texto: string): number {
  return Math.ceil(texto.length / 4);
}

/** FNV-1a de 32 bits com duas sementes, produzindo 16 caracteres hexadecimais sem depender de APIs de runtime. */
export function hashConteudo(texto: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < texto.length; i += 1) {
    const codigo = texto.charCodeAt(i);
    a = Math.imul(a ^ codigo, 0x01000193) >>> 0;
    b = Math.imul(b ^ codigo, 0x811c9dc5) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

/** Monta o corpus. `versaoConteudo` é calculada sem `geradoEm`, então é estável entre execuções. */
export function montarCorpus(
  trilha: readonly Modulo[],
  glossario: readonly EntradaGlossario[],
  geradoEm: string,
): CorpusChat {
  const modulos = trilha.map((modulo) => ({
    id: modulo.id,
    posicao: modulo.posicao,
    titulo: modulo.titulo,
    secoes: modulo.secoes.map((secao) => {
      const achatado = achatarSecao(secao);
      return {
        id: secao.id,
        titulo: secao.titulo,
        texto: achatado.pendente ? `[PENDENTE] ${achatado.descricaoPendencia ?? ''}`.trim() : achatado.texto,
        pendente: achatado.pendente,
      };
    }),
  }));
  const termos = glossario.flatMap((entrada) =>
    entrada.definicao.estado === 'confirmado' ? [{ termo: entrada.termo, definicao: entrada.definicao.valor }] : [],
  );
  return {
    versaoCorpus: 1,
    versaoConteudo: hashConteudo(JSON.stringify({ modulos, termos })),
    geradoEm,
    modulos,
    glossario: termos,
  };
}

export interface RelatorioCorpus {
  tokensEstimados: number;
  erros: string[];
}

/** Orçamento de tokens e varredura de dados sensíveis. `erros` vazio significa corpus publicável. */
export function avaliarCorpus(corpus: CorpusChat): RelatorioCorpus {
  const texto = JSON.stringify({ modulos: corpus.modulos, glossario: corpus.glossario });
  const tokensEstimados = estimarTokens(texto);
  const erros: string[] = [];
  if (tokensEstimados > LIMITE_TOKENS_CORPUS) {
    erros.push(`Corpus excede o orçamento: ${tokensEstimados} tokens estimados (limite ${LIMITE_TOKENS_CORPUS}).`);
  }
  for (const modulo of corpus.modulos) {
    for (const secao of modulo.secoes) {
      const motivos = detectarDadosSensiveis(`${secao.titulo}\n${secao.texto}`);
      if (motivos.length > 0) erros.push(`Dado sensível (${motivos.join(', ')}) em ${modulo.id}/${secao.id}.`);
    }
  }
  for (const termo of corpus.glossario) {
    const motivos = detectarDadosSensiveis(`${termo.termo}\n${termo.definicao}`);
    if (motivos.length > 0) erros.push(`Dado sensível (${motivos.join(', ')}) no glossário: ${termo.termo}.`);
  }
  return { tokensEstimados, erros };
}
