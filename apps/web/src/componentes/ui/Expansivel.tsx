import type { ReactNode } from 'react';
import { Icone } from './Icone';

/** Conteúdo expansível nativo. Nunca substituir por `div` com `onClick`. */
export function Expansivel({ titulo, children }: { titulo: string; children: ReactNode }): ReactNode {
  return (
    <details className="nuage-expansivel">
      <summary className="nuage-expansivel-resumo">
        <span className="nuage-expansivel-seta">
          <Icone nome="seta-direita" tamanho="1rem" />
        </span>
        {titulo}
      </summary>
      <div className="nuage-expansivel-corpo">{children}</div>
    </details>
  );
}
