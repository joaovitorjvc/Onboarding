import type { IdModulo } from './tipos';
import { IDS_MODULO } from './tipos';

export function ehIdModulo(valor: unknown): valor is IdModulo {
  return typeof valor === 'string' && (IDS_MODULO as readonly string[]).includes(valor);
}

export function rotaModulo(idModulo: IdModulo): string {
  return `/trilha/${idModulo}`;
}

export function rotaSecao(idModulo: IdModulo, idSecao: string): string {
  return `/trilha/${idModulo}/secao/${idSecao}`;
}
