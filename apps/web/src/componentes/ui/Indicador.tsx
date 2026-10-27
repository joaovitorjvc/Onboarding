import type { ReactNode } from 'react';
import { Icone, type NomeIcone } from './Icone';

export interface IndicadorProps {
  valor: string;
  rotulo: string;
  /** Qualificador em fonte mono. */
  detalhe?: string;
  icone?: NomeIcone;
}

/** Número grande com rótulo auxiliar. Vários indicadores formam uma faixa com divisórias verticais. */
export function Indicador({ valor, rotulo, detalhe, icone }: IndicadorProps): ReactNode {
  return (
    <div className="nuage-indicador">
      {icone ? (
        <span className="nuage-moldura-icone">
          <Icone nome={icone} />
        </span>
      ) : null}
      <div className="nuage-indicador__corpo">
        <span className="nuage-indicador__valor">{valor}</span>
        <span className="nuage-indicador__rotulo">{rotulo}</span>
        {detalhe ? <span className="nuage-indicador__detalhe">{detalhe}</span> : null}
      </div>
    </div>
  );
}
