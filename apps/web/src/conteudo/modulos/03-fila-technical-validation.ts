import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloFilaTechnicalValidation = criarModulo('fila-technical-validation', 3, 'Fila Technical Validation', [
  secaoPendente('texto', 'condicao-de-entrada', 'Condição de entrada'),
  secaoPendente('lista', 'etapas-fora-da-area', 'Etapas fora da área'),
  secaoPendente('texto', 'prazo-de-permanencia', 'Prazo de permanência'),
  secaoPendente('texto', 'contagem-do-prazo', 'Contagem do prazo'),
  secaoPendente('lista', 'condicoes-de-saida', 'Condições de saída'),
]);
