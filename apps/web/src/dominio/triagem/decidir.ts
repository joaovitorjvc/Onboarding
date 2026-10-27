import type { EntradaTriagem, ResultadoTriagem } from './tipos';

/** Função total: toda combinação de entrada produz um resultado, sem inferir decisões sem regra. */
export function decidirTriagem(entrada: EntradaTriagem): ResultadoTriagem {
  const { provider, migracao } = entrada;
  if (provider === undefined) {
    return { tipo: 'campos-ausentes', campos: migracao === undefined ? ['provider', 'migracao'] : ['provider'] };
  }
  switch (provider) {
    case 'aws':
      return { tipo: 'conduzida-pelo-arquiteto', proximoModulo: 'entrevista-tecnica' };
    case 'gcp':
      if (migracao === undefined) return { tipo: 'campos-ausentes', campos: ['migracao'] };
      return migracao ? { tipo: 'pendencia-do-gestor' } : { tipo: 'devolvida-ao-account-manager', acionar: 'CAVA' };
    case 'azure':
    case 'on-premise':
    case 'outro':
      return { tipo: 'pendencia-do-gestor' };
  }
}
