import type { ReactNode } from 'react';
import { Selo } from './Selo';

/** Substituto visual de conteúdo pendente. Nunca exibe valor especulativo. */
export function MarcacaoPendencia({ descricao, requisito }: { descricao: string; requisito: string }): ReactNode {
  return (
    <div className="nuage-marcacao-pendencia">
      <Selo variante="pendencia">Pendente</Selo>
      <p>{descricao}</p>
      <p className="nuage-marcacao-pendencia__requisito">Requisito: {requisito}</p>
    </div>
  );
}
