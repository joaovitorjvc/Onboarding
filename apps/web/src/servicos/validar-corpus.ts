import type { CorpusChat } from './contrato-corpus.ts';

export type ResultadoValidacaoCorpus = { ok: true; corpus: CorpusChat } | { ok: false; erros: string[] };

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/** Validador total: acumula todos os erros em vez de parar no primeiro. */
export function validarCorpus(valor: unknown): ResultadoValidacaoCorpus {
  const erros: string[] = [];
  if (!ehObjeto(valor)) return { ok: false, erros: ['O corpus deve ser um objeto.'] };
  if (valor['versaoCorpus'] !== 1) erros.push('versaoCorpus deve ser 1.');
  if (typeof valor['versaoConteudo'] !== 'string' || !/^[0-9a-f]{16}$/u.test(valor['versaoConteudo'])) {
    erros.push('versaoConteudo deve ter 16 caracteres hexadecimais.');
  }
  if (typeof valor['geradoEm'] !== 'string' || Number.isNaN(Date.parse(valor['geradoEm']))) {
    erros.push('geradoEm deve ser uma data ISO válida.');
  }
  const modulos = valor['modulos'];
  if (!Array.isArray(modulos) || modulos.length === 0) {
    erros.push('modulos deve ser uma lista não vazia.');
  } else {
    modulos.forEach((modulo: unknown, indice) => {
      if (
        !ehObjeto(modulo) ||
        typeof modulo['id'] !== 'string' ||
        typeof modulo['titulo'] !== 'string' ||
        typeof modulo['posicao'] !== 'number'
      ) {
        erros.push(`modulos[${indice}] inválido.`);
        return;
      }
      const secoes = modulo['secoes'];
      if (!Array.isArray(secoes)) {
        erros.push(`modulos[${indice}].secoes deve ser uma lista.`);
        return;
      }
      secoes.forEach((secao: unknown, posicao) => {
        if (
          !ehObjeto(secao) ||
          typeof secao['id'] !== 'string' ||
          typeof secao['titulo'] !== 'string' ||
          typeof secao['texto'] !== 'string' ||
          typeof secao['pendente'] !== 'boolean'
        ) {
          erros.push(`modulos[${indice}].secoes[${posicao}] inválida.`);
        }
      });
    });
  }
  const glossario = valor['glossario'];
  if (!Array.isArray(glossario)) {
    erros.push('glossario deve ser uma lista.');
  } else {
    glossario.forEach((termo: unknown, indice) => {
      if (!ehObjeto(termo) || typeof termo['termo'] !== 'string' || typeof termo['definicao'] !== 'string') {
        erros.push(`glossario[${indice}] inválido.`);
      }
    });
  }
  return erros.length === 0 ? { ok: true, corpus: valor as unknown as CorpusChat } : { ok: false, erros };
}
