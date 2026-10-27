import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloHandoverDelivery = criarModulo('handover-delivery', 10, 'Handover para Delivery', [
  secaoPendente('texto', 'fim-da-responsabilidade', 'Fim da responsabilidade'),
  secaoPendente('texto', 'acompanhamento-opcional', 'Acompanhamento opcional'),
  secaoPendente('texto', 'delimitacao-do-handover', 'Delimitação do handover'),
]);
