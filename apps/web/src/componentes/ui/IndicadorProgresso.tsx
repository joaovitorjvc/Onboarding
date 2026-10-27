import type { ReactNode } from 'react';
import type { Modulo } from '../../dominio/conteudo/tipos';
import type { RegistroProgresso } from '../../dominio/progresso/tipos';

/** Onze segmentos inclinados, um por Módulo. Concluídos em roxo (claro) ou pink (invertido). */
export function IndicadorProgresso({
  trilha,
  registro,
  tom = 'claro',
}: {
  trilha: readonly Modulo[];
  registro: RegistroProgresso;
  tom?: 'claro' | 'invertido';
}): ReactNode {
  return (
    <ol
      className={tom === 'invertido' ? 'nuage-segmentos nuage-segmentos--invertido' : 'nuage-segmentos'}
      aria-label="Módulos da Trilha"
    >
      {trilha.map((modulo) => {
        const concluido = registro.modulos[modulo.id]?.concluido === true;
        return (
          <li
            key={modulo.id}
            className={`nuage-paralelogramo nuage-segmento${concluido ? ' nuage-segmento--concluido' : ''}`}
          >
            <span className="oculto">{`Módulo ${modulo.posicao}, ${modulo.titulo}: ${concluido ? 'concluído' : 'não concluído'}`}</span>
          </li>
        );
      })}
    </ol>
  );
}
