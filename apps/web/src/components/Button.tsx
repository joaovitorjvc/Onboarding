import type { ButtonHTMLAttributes, ReactElement } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function Button({ label, className = '', type = 'button', ...props }: ButtonProps): ReactElement {
  return (
    <button className={`button ${className}`.trim()} type={type} {...props}>
      {label}
    </button>
  );
}
