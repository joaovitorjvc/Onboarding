import type { IdModulo } from '../conteudo/tipos';

export interface EstadoModulo {
  concluido: boolean;
  atualizadoEm: string;
}

export interface RegistroProgresso {
  versaoSchema: 1;
  modulos: Partial<Record<IdModulo, EstadoModulo>>;
  /** Itens de checklist por Módulo: `checklists[idModulo][idItem]`. */
  checklists: Partial<Record<IdModulo, Record<string, boolean>>>;
  atualizadoEm: string;
}

export interface ResumoProgresso {
  concluidos: number;
  total: number;
  percentual: number;
  proximoModulo: IdModulo | null;
}
