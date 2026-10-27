import { createContext, useContext, type ReactNode } from 'react';
import type { Armazenamento } from '../../dominio/progresso/armazenamento';
import { useProgresso, type ProgressoApi } from '../../hooks/useProgresso';

const Contexto = createContext<ProgressoApi | null>(null);

/** Uma única instância do progresso para toda a aplicação. */
export function ProvedorProgresso({
  armazenamento,
  children,
}: {
  armazenamento?: Armazenamento | null;
  children: ReactNode;
}): ReactNode {
  const progresso = useProgresso(armazenamento);
  return <Contexto.Provider value={progresso}>{children}</Contexto.Provider>;
}

export function useProgressoContexto(): ProgressoApi {
  const valor = useContext(Contexto);
  if (valor === null) throw new Error('useProgressoContexto deve ser usado dentro de ProvedorProgresso.');
  return valor;
}
