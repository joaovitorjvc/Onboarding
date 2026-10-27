import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloApresentacaoEFormalizacao = criarModulo(
  'apresentacao-e-formalizacao',
  7,
  'Apresentação, formalização e desfecho',
  [
    secaoPendente('passos', 'sequencia-da-apresentacao', 'Sequência da apresentação'),
    secaoPendente('comparativa', 'dois-desfechos', 'Os dois desfechos'),
    secaoPendente('texto', 'remuneracao-e-contrato', 'Remuneração e contrato'),
    secaoPendente('texto', 'prazo-de-acompanhamento', 'Prazo de acompanhamento'),
  ],
);
