import type { EntradaIndice } from './indice';
import { normalizar } from './normalizar';

export const TERMO_MINIMO = 2;
export const TERMO_MAXIMO = 100;
export const MAXIMO_RESULTADOS = 50;

export type ResultadoBusca =
  | { tipo: 'termo-invalido'; motivo: 'curto' | 'longo' }
  | { tipo: 'resultados'; termo: string; itens: readonly EntradaIndice[] };

export function buscar(indice: readonly EntradaIndice[], termoBruto: string): ResultadoBusca {
  const termo = termoBruto.trim();
  if (termo.length < TERMO_MINIMO) return { tipo: 'termo-invalido', motivo: 'curto' };
  if (termo.length > TERMO_MAXIMO) return { tipo: 'termo-invalido', motivo: 'longo' };
  const alvo = normalizar(termo);
  const itens = indice.filter((entrada) => entrada.textoNormalizado.includes(alvo)).slice(0, MAXIMO_RESULTADOS);
  return { tipo: 'resultados', termo, itens };
}
