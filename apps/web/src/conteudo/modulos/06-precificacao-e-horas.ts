import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloPrecificacaoEHoras = criarModulo('precificacao-e-horas', 6, 'Precificação e previsão de horas', [
  secaoPendente('texto', 'onde-o-calculo-acontece', 'Onde o cálculo acontece'),
  secaoPendente('formula', 'formula-de-custo', 'Fórmula de custo'),
  secaoPendente('formula', 'formula-de-valor-de-venda', 'Fórmula de valor de venda'),
  secaoPendente('texto', 'margem-de-contribuicao', 'Margem de contribuição'),
  secaoPendente('formula', 'formula-de-valor-hora', 'Fórmula de valor hora'),
  secaoPendente('lista', 'limites-de-esforco', 'Limites de esforço'),
  secaoPendente('texto', 'fator-produtividade-ia', 'Fator de Produtividade de IA'),
  secaoPendente('comparativa', 'perfis-do-fator-produtividade', 'Perfis do Fator de Produtividade'),
  secaoPendente('lista', 'acrescimos-de-precificacao', 'Acréscimos de precificação'),
  secaoPendente('lista', 'perfis-de-recurso', 'Perfis de recurso'),
  secaoPendente('texto', 'prazo-e-artefatos', 'Prazo e artefatos'),
  secaoPendente('referencias', 'referencias-da-precificacao', 'Referências da precificação'),
]);
