import type { Modulo } from './tipos.ts';
import { IDS_MODULO } from './tipos.ts';

const FORMATO_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/** Valida a integridade estrutural da Trilha. Lista vazia significa árvore válida. */
export function validarTrilha(trilha: readonly Modulo[]): string[] {
  const erros: string[] = [];
  if (trilha.length !== IDS_MODULO.length) {
    erros.push(`A Trilha deve ter ${IDS_MODULO.length} Módulos, mas tem ${trilha.length}.`);
  }
  trilha.forEach((modulo, indice) => {
    if (modulo.id !== IDS_MODULO[indice])
      erros.push(`Módulo na posição ${indice + 1} fora da ordem canônica: ${modulo.id}.`);
    if (modulo.posicao !== indice + 1)
      erros.push(`Módulo ${modulo.id} tem posição ${modulo.posicao}; esperado ${indice + 1}.`);
    if (modulo.secoes.length === 0) erros.push(`Módulo ${modulo.id} não tem seções.`);
    const vistos = new Set<string>();
    for (const secao of modulo.secoes) {
      if (!FORMATO_ID.test(secao.id)) erros.push(`ID de seção inválido em ${modulo.id}: ${secao.id}.`);
      if (vistos.has(secao.id)) erros.push(`ID de seção duplicado em ${modulo.id}: ${secao.id}.`);
      vistos.add(secao.id);
    }
  });
  return erros;
}
