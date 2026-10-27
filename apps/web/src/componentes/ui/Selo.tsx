import type { ReactNode } from 'react';

export function Selo({
  variante = 'neutro',
  children,
}: {
  variante?: 'neutro' | 'informativo' | 'pendencia' | 'confirmado';
  children: ReactNode;
}): ReactNode {
  return <span className={`nuage-etiqueta nuage-etiqueta--${variante}`}>{children}</span>;
}
