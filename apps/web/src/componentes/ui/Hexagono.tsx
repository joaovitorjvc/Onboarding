import type { CSSProperties, ReactNode } from 'react';

export interface HexagonoProps {
  tom?: 'claro' | 'destaque' | 'escuro';
  tamanho?: string;
  /** Alternativa textual. Sem ela o marcador é decorativo (`aria-hidden`). */
  rotulo?: string;
  children?: ReactNode;
}

/** Marcador poligonal de posição ou valor. Nunca circular. */
export function Hexagono({ tom = 'claro', tamanho, rotulo, children }: HexagonoProps): ReactNode {
  const estilo = tamanho ? ({ '--nuage-hex-tamanho': tamanho } as CSSProperties) : undefined;
  const acessibilidade = rotulo ? { role: 'img', 'aria-label': rotulo } : { 'aria-hidden': true as const };
  return (
    <span className={`nuage-hexagono nuage-marcador nuage-marcador--${tom}`} style={estilo} {...acessibilidade}>
      {children}
    </span>
  );
}
