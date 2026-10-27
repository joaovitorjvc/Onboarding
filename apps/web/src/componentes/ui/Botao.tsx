import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario';
  larguraTotal?: boolean;
  children: ReactNode;
}

export function Botao({
  variante = 'primario',
  larguraTotal = false,
  type = 'button',
  children,
  ...resto
}: BotaoProps): ReactNode {
  const classe = ['nuage-botao', `nuage-botao--${variante}`, larguraTotal ? 'nuage-botao--bloco' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={classe} {...resto}>
      {children}
    </button>
  );
}
