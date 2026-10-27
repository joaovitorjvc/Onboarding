export type IdModulo =
  | 'visao-da-area'
  | 'acessos-iniciais'
  | 'fila-technical-validation'
  | 'entrevista-tecnica'
  | 'construcao-da-solucao'
  | 'precificacao-e-horas'
  | 'apresentacao-e-formalizacao'
  | 'registro-clickup'
  | 'kickoffs'
  | 'handover-delivery'
  | 'semana-shadow';

export type PosicaoModulo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Origem =
  { tipo: 'confirmacao-gestor'; referencia: string } | { tipo: 'material-cog-solutions'; caminho: string };

export type Conteudo<T> =
  | { estado: 'confirmado'; valor: T; origem: Origem }
  | { estado: 'pendente'; pendencia: { id: string; descricao: string; requisito: string } };

export interface ItemLista {
  rotulo: string;
  descricao: string;
}

export interface ItemTopico {
  titulo: string;
  paragrafos: readonly string[];
  /** Texto curto do selo lateral. Sem ele, o selo mostra a posição do tópico (01, 02...). */
  marcador?: string;
  /** `total` ocupa a largura inteira quando a seção é exibida em grade. */
  largura?: 'total';
  /** Lista de apoio exibida em bloco recolhível abaixo dos parágrafos (ex.: responsabilidades). */
  itens?: { rotulo: string; itens: readonly string[] };
}

export interface ItemComparativo {
  rotulo: string;
  valores: readonly string[];
}

export interface ItemChecklist {
  id: string;
  rotulo: string;
  descricao: string;
}

export interface ItemPergunta {
  pilar: string;
  perguntas: readonly string[];
}

export type Secao =
  | { tipo: 'texto'; id: string; titulo: string; conteudo: Conteudo<readonly string[]> }
  | { tipo: 'topicos'; id: string; titulo: string; conteudo: Conteudo<readonly ItemTopico[]> }
  | { tipo: 'lista'; id: string; titulo: string; conteudo: Conteudo<readonly ItemLista[]> }
  | { tipo: 'passos'; id: string; titulo: string; conteudo: Conteudo<readonly string[]> }
  | {
      tipo: 'comparativa';
      id: string;
      titulo: string;
      conteudo: Conteudo<{ colunas: readonly string[]; linhas: readonly ItemComparativo[] }>;
    }
  | { tipo: 'checklist'; id: string; titulo: string; conteudo: Conteudo<readonly ItemChecklist[]> }
  | { tipo: 'banco-perguntas'; id: string; titulo: string; conteudo: Conteudo<readonly ItemPergunta[]> }
  | { tipo: 'referencias'; id: string; titulo: string; conteudo: Conteudo<readonly string[]> }
  | { tipo: 'formula'; id: string; titulo: string; conteudo: Conteudo<readonly string[]> }
  | { tipo: 'modelo-de-prompt'; id: string; titulo: string; conteudo: Conteudo<readonly string[]> };

export interface Modulo {
  id: IdModulo;
  posicao: PosicaoModulo;
  titulo: string;
  resumo: Conteudo<string>;
  requisitos: readonly string[];
  origem: Conteudo<string>;
  secoes: readonly Secao[];
}

export type Trilha = readonly [Modulo, Modulo, Modulo, Modulo, Modulo, Modulo, Modulo, Modulo, Modulo, Modulo, Modulo];

export const IDS_MODULO: readonly IdModulo[] = [
  'visao-da-area',
  'acessos-iniciais',
  'fila-technical-validation',
  'entrevista-tecnica',
  'construcao-da-solucao',
  'precificacao-e-horas',
  'apresentacao-e-formalizacao',
  'registro-clickup',
  'kickoffs',
  'handover-delivery',
  'semana-shadow',
];

export const TITULOS_MODULO: Readonly<Record<IdModulo, string>> = {
  'visao-da-area': 'Visão da área',
  'acessos-iniciais': 'Acessos iniciais',
  'fila-technical-validation': 'Fila Technical Validation',
  'entrevista-tecnica': 'Entrevista técnica',
  'construcao-da-solucao': 'Construção da solução',
  'precificacao-e-horas': 'Precificação e previsão de horas',
  'apresentacao-e-formalizacao': 'Apresentação, formalização e desfecho',
  'registro-clickup': 'Registro no ClickUp',
  kickoffs: 'Kickoffs',
  'handover-delivery': 'Handover para Delivery',
  'semana-shadow': 'Semana Shadow',
};
