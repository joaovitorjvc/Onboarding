import type { IdModulo, Modulo } from '../conteudo/tipos.ts';

export interface Referencia {
  /** Caminho textual no repositório Cog Solutions. Nunca é lido nem vira link. */
  caminho: string;
  idModulo: IdModulo;
  idSecao: string;
}

/** Citações confirmadas nas seções de referências da Trilha. */
export function coletarCitacoes(trilha: readonly Modulo[]): Referencia[] {
  return trilha.flatMap((modulo) =>
    modulo.secoes.flatMap((secao) => {
      if (secao.tipo !== 'referencias' || secao.conteudo.estado !== 'confirmado') return [];
      return secao.conteudo.valor.map((caminho) => ({ caminho, idModulo: modulo.id, idSecao: secao.id }));
    }),
  );
}

const chave = (r: Referencia): string => `${r.idModulo}/${r.idSecao}/${r.caminho}`;

/** Correspondência nos dois sentidos entre citações da Trilha e a lista publicada. Lista vazia significa consistente. */
export function verificarCorrespondencia(trilha: readonly Modulo[], referencias: readonly Referencia[]): string[] {
  const erros: string[] = [];
  const citacoes = coletarCitacoes(trilha);
  const publicadas = new Set(referencias.map(chave));
  const citadas = new Set(citacoes.map(chave));
  if (publicadas.size !== referencias.length) erros.push('Há referências duplicadas.');
  for (const citacao of citacoes) {
    if (!publicadas.has(chave(citacao))) erros.push(`Citação sem entrada em REFERENCIAS: ${chave(citacao)}.`);
  }
  for (const referencia of referencias) {
    const modulo = trilha.find((m) => m.id === referencia.idModulo);
    const secao = modulo?.secoes.find((s) => s.id === referencia.idSecao);
    if (!modulo || !secao) erros.push(`Referência aponta para Módulo ou seção inexistente: ${chave(referencia)}.`);
    else if (secao.tipo !== 'referencias')
      erros.push(`Referência aponta para seção de espécie incompatível: ${chave(referencia)}.`);
    if (!citadas.has(chave(referencia))) erros.push(`Referência sem citação de origem: ${chave(referencia)}.`);
  }
  return erros;
}

/** Agrupa por diretório (tudo antes da última barra). */
export function agruparPorCaminho(referencias: readonly Referencia[]): Array<[string, Referencia[]]> {
  const grupos = new Map<string, Referencia[]>();
  for (const referencia of referencias) {
    const indice = referencia.caminho.lastIndexOf('/');
    const diretorio = indice === -1 ? '(raiz)' : referencia.caminho.slice(0, indice);
    grupos.set(diretorio, [...(grupos.get(diretorio) ?? []), referencia]);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
}
