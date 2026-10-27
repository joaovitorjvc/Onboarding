export const PILARES = ['aplicacao', 'genai', 'finops', 'cloud', 'cloud-native', 'security', 'data-analytics'] as const;
export type Pilar = (typeof PILARES)[number];

export const CONJUNTOS = ['poc', 'mvp'] as const;
export type Conjunto = (typeof CONJUNTOS)[number];

export type SituacaoPerguntas = 'poc' | 'mvp-apos-poc' | 'mvp-direto';

/** Conjuntos exibidos por situação. O conjunto não escolhido não deve ser renderizado, nem escondido por CSS. */
export function conjuntosParaSituacao(situacao: SituacaoPerguntas): readonly Conjunto[] {
  switch (situacao) {
    case 'poc':
      return ['poc'];
    case 'mvp-apos-poc':
      return ['mvp'];
    case 'mvp-direto':
      return ['poc', 'mvp'];
  }
}
