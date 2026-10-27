import type { ReactNode, SVGProps } from 'react';

export type NomeIcone =
  | 'inicio'
  | 'trilha'
  | 'triagem'
  | 'busca'
  | 'glossario'
  | 'referencias'
  | 'pendencias'
  | 'perguntas'
  | 'chat'
  | 'fechar'
  | 'check'
  | 'seta-direita'
  | 'sair';

/** Caminhos SVG na grade 24 × 24. Conjunto fechado, desenhado no projeto. */
export const TRACADO: Readonly<Record<NomeIcone, string>> = {
  inicio: 'M3 10.5 12 3l9 7.5M5.25 9.5V20h13.5V9.5',
  trilha: 'M9 4.5h11M9 12h11M9 19.5h11M4 4.5h.01M4 12h.01M4 19.5h.01',
  triagem: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2',
  glossario: 'M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM17 7h2v13H8',
  referencias:
    'M10 13a4 4 0 0 0 5.7.4l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 11a4 4 0 0 0-5.7-.4l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2',
  pendencias: 'M12 3.5 22 20H2L12 3.5ZM12 9.5v5M12 17h.01',
  perguntas: 'M9 9a3 3 0 1 1 3 3v2.5M12 18h.01M4 4h16v16H4V4Z',
  chat: 'M4 5h16v11H9l-5 4V5Z',
  fechar: 'M6 6l12 12M18 6 6 18',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  'seta-direita': 'M5 12h13M12.5 5.5 19 12l-6.5 6.5',
  // Definido no catálogo, sem uso atual na interface.
  sair: 'M15 4h4v16h-4M11 8l-4 4 4 4M7 12h10',
};

export interface PropsIcone extends Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox' | 'className'> {
  nome: NomeIcone;
  tamanho?: string;
  /** Alternativa textual. Sem ela o ícone é decorativo (`aria-hidden`): o texto vizinho carrega o significado. */
  descricao?: string;
  /** Espelha horizontalmente (ex.: seta de "voltar"). */
  espelhado?: boolean;
}

/** Cor herdada do elemento pai por `currentColor`: nunca fixar cor dentro do SVG. */
export function Icone({ nome, tamanho = '1.125rem', descricao, espelhado = false, ...resto }: PropsIcone): ReactNode {
  const informativo = descricao !== undefined && descricao.trim().length > 0;
  return (
    <svg
      {...resto}
      className={espelhado ? 'nuage-icone nuage-icone--espelhado' : 'nuage-icone'}
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(informativo ? { role: 'img', 'aria-label': descricao } : { 'aria-hidden': true, focusable: false })}
    >
      <path d={TRACADO[nome]} />
    </svg>
  );
}
