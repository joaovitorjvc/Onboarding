import type { Conteudo, IdModulo, Modulo } from '../conteudo/tipos';
import type { EntradaGlossario } from '../glossario/ordenar';

export interface ItemPendencia {
  id: string;
  descricao: string;
  requisito: string;
  idModulo: IdModulo | null;
  idSecao: string | null;
  /** Caminho estrutural legível, por exemplo "entrevista-tecnica > bant". */
  caminho: string;
}

function dePendencia(
  conteudo: Conteudo<unknown>,
  idModulo: IdModulo | null,
  idSecao: string | null,
  caminho: string,
): ItemPendencia[] {
  if (conteudo.estado !== 'pendente') return [];
  const { id, descricao, requisito } = conteudo.pendencia;
  return [{ id, descricao, requisito, idModulo, idSecao, caminho }];
}

/** Projeção derivada da árvore: não existe lista de pendências mantida manualmente. */
export function coletarPendencias(
  trilha: readonly Modulo[],
  glossario: readonly EntradaGlossario[] = [],
): ItemPendencia[] {
  const doModulos = trilha.flatMap((modulo) => [
    ...dePendencia(modulo.resumo, modulo.id, null, `${modulo.id} > resumo`),
    ...dePendencia(modulo.origem, modulo.id, null, `${modulo.id} > origem`),
    ...modulo.secoes.flatMap((secao) => dePendencia(secao.conteudo, modulo.id, secao.id, `${modulo.id} > ${secao.id}`)),
  ]);
  const doGlossario = glossario.flatMap((entrada) =>
    dePendencia(entrada.definicao, null, null, `glossario > ${entrada.termo}`),
  );
  return [...doModulos, ...doGlossario];
}
