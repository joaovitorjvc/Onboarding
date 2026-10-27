import type { ReactNode } from 'react';

export interface BarraProps {
  valor: number;
  rotulo: string;
  tom?: 'claro' | 'invertido';
}

/** Progresso horizontal acessível: trilho neutro e preenchimento em gradiente. Nunca um anel. */
export function Barra({ valor, rotulo, tom = 'claro' }: BarraProps): ReactNode {
  return (
    <div
      className={tom === 'invertido' ? 'nuage-barra nuage-barra--invertida' : 'nuage-barra'}
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={valor}
    >
      <div className="nuage-barra-trilho">
        <span className="nuage-barra-preenchimento" style={{ width: `${valor}%` }} />
      </div>
    </div>
  );
}
