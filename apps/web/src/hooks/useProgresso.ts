import { useCallback, useState } from 'react';
import type { IdModulo } from '../dominio/conteudo/tipos';
import {
  atualizarProgresso,
  lerProgresso,
  reiniciarProgresso,
  type Armazenamento,
  type LeituraProgresso,
} from '../dominio/progresso/armazenamento';
import { comItemChecklist, comModuloConcluido } from '../dominio/progresso/calculo';
import type { RegistroProgresso } from '../dominio/progresso/tipos';

export interface ProgressoApi {
  registro: RegistroProgresso;
  somenteLeitura: boolean;
  /** Verdadeiro quando a última gravação falhou e a interface voltou ao estado anterior. */
  falhaDeGravacao: boolean;
  definirModuloConcluido(idModulo: IdModulo, concluido: boolean): void;
  definirItemChecklist(idModulo: IdModulo, idItem: string, marcado: boolean): void;
  reiniciar(): void;
}

export function obterArmazenamentoLocal(): Armazenamento | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

const relogioPadrao = (): string => new Date().toISOString();

/**
 * Commit-then-render: a interface só adota o registro devolvido pela gravação.
 * Navegar nunca grava; sem armazenamento a interface fica em somente leitura.
 */
export function useProgresso(
  armazenamento: Armazenamento | null = obterArmazenamentoLocal(),
  relogio: () => string = relogioPadrao,
): ProgressoApi {
  const [leitura, setLeitura] = useState<LeituraProgresso>(() => lerProgresso(armazenamento, relogio()));
  const [falhaDeGravacao, setFalha] = useState(false);

  const aplicar = useCallback(
    (mutar: (atual: RegistroProgresso, agora: string) => RegistroProgresso) => {
      if (leitura.somenteLeitura) return;
      const agora = relogio();
      const resultado = atualizarProgresso(armazenamento, agora, (atual) => mutar(atual, agora));
      setFalha(!resultado.ok);
      setLeitura((anterior) => ({ ...anterior, registro: resultado.registro }));
    },
    [armazenamento, leitura.somenteLeitura, relogio],
  );

  const definirModuloConcluido = useCallback(
    (idModulo: IdModulo, concluido: boolean) =>
      aplicar((atual, agora) => comModuloConcluido(atual, idModulo, concluido, agora)),
    [aplicar],
  );

  const definirItemChecklist = useCallback(
    (idModulo: IdModulo, idItem: string, marcado: boolean) =>
      aplicar((atual, agora) => comItemChecklist(atual, idModulo, idItem, marcado, agora)),
    [aplicar],
  );

  const reiniciar = useCallback(() => {
    if (leitura.somenteLeitura) return;
    const resultado = reiniciarProgresso(armazenamento, relogio());
    setFalha(!resultado.ok);
    setLeitura((anterior) => ({ ...anterior, registro: resultado.registro }));
  }, [armazenamento, leitura.somenteLeitura, relogio]);

  return {
    registro: leitura.registro,
    somenteLeitura: leitura.somenteLeitura,
    falhaDeGravacao,
    definirModuloConcluido,
    definirItemChecklist,
    reiniciar,
  };
}
