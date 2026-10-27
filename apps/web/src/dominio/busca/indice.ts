import { achatarSecao } from '../conteudo/achatar';
import type { IdModulo, Modulo } from '../conteudo/tipos';
import { normalizar } from './normalizar';

export interface EntradaIndice {
  idModulo: IdModulo;
  tituloModulo: string;
  idSecao: string;
  tituloSecao: string;
  textoNormalizado: string;
}

const cache = new WeakMap<readonly Modulo[], readonly EntradaIndice[]>();

/**
 * Índice pré-computado por referência de Trilha. Conteúdo pendente não entra como conteúdo confirmado:
 * só os títulos, que são sempre visíveis, são indexados nesse caso.
 */
export function criarIndice(trilha: readonly Modulo[]): readonly EntradaIndice[] {
  const existente = cache.get(trilha);
  if (existente) return existente;
  const entradas = trilha.flatMap((modulo) =>
    modulo.secoes.map((secao) => {
      const achatado = achatarSecao(secao);
      return {
        idModulo: modulo.id,
        tituloModulo: modulo.titulo,
        idSecao: secao.id,
        tituloSecao: secao.titulo,
        textoNormalizado: normalizar(`${modulo.titulo}\n${secao.titulo}\n${achatado.pendente ? '' : achatado.texto}`),
      };
    }),
  );
  cache.set(trilha, entradas);
  return entradas;
}
