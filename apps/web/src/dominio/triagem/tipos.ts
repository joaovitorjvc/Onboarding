import type { IdModulo } from '../conteudo/tipos';

export const PROVIDERS = ['aws', 'gcp', 'azure', 'on-premise', 'outro'] as const;
export type Provider = (typeof PROVIDERS)[number];

export interface EntradaTriagem {
  provider?: Provider;
  migracao?: boolean;
}

export type CampoTriagem = 'provider' | 'migracao';

export type ResultadoTriagem =
  | { tipo: 'conduzida-pelo-arquiteto'; proximoModulo: IdModulo }
  | { tipo: 'devolvida-ao-account-manager'; acionar: 'CAVA' }
  | { tipo: 'pendencia-do-gestor' }
  | { tipo: 'campos-ausentes'; campos: readonly CampoTriagem[] };
