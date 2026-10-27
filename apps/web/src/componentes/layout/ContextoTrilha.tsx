import { createContext, useContext, type ReactNode } from 'react';
import { TRILHA } from '../../conteudo/trilha';
import type { Modulo } from '../../dominio/conteudo/tipos';

const ContextoTrilha = createContext<readonly Modulo[]>(TRILHA);

export function ProvedorTrilha({ trilha, children }: { trilha: readonly Modulo[]; children: ReactNode }): ReactNode {
  return <ContextoTrilha.Provider value={trilha}>{children}</ContextoTrilha.Provider>;
}

export function useTrilha(): readonly Modulo[] {
  return useContext(ContextoTrilha);
}
