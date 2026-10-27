import type { IdModulo, Modulo } from '../conteudo/tipos';
import type { RegistroProgresso, ResumoProgresso } from './tipos';

export function resumirProgresso(registro: RegistroProgresso, trilha: readonly Modulo[]): ResumoProgresso {
  const total = trilha.length;
  const concluidos = trilha.filter((modulo) => registro.modulos[modulo.id]?.concluido === true).length;
  const bruto = total === 0 ? 0 : Math.round((concluidos / total) * 100);
  const proximo = trilha.find((modulo) => registro.modulos[modulo.id]?.concluido !== true);
  return {
    concluidos,
    total,
    percentual: Math.min(100, Math.max(0, bruto)),
    proximoModulo: proximo ? proximo.id : null,
  };
}

export function comModuloConcluido(
  registro: RegistroProgresso,
  idModulo: IdModulo,
  concluido: boolean,
  agora: string,
): RegistroProgresso {
  return {
    ...registro,
    modulos: { ...registro.modulos, [idModulo]: { concluido, atualizadoEm: agora } },
    atualizadoEm: agora,
  };
}

export function comItemChecklist(
  registro: RegistroProgresso,
  idModulo: IdModulo,
  idItem: string,
  marcado: boolean,
  agora: string,
): RegistroProgresso {
  return {
    ...registro,
    checklists: { ...registro.checklists, [idModulo]: { ...registro.checklists[idModulo], [idItem]: marcado } },
    atualizadoEm: agora,
  };
}
