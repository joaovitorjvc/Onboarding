import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloKickoffs = criarModulo('kickoffs', 9, 'Kickoffs', [
  secaoPendente('texto', 'quando-agendar', 'Quando agendar'),
  secaoPendente('comparativa', 'comparativo-interno-externo', 'Comparativo entre kickoff interno e externo'),
  secaoPendente('lista', 'conteudo-do-kickoff', 'Conteúdo do kickoff'),
  secaoPendente('passos', 'ordem-do-kickoff', 'Ordem do kickoff'),
  secaoPendente('texto', 'indisponibilidade', 'Indisponibilidade'),
  secaoPendente('referencias', 'referencias-dos-kickoffs', 'Referências dos kickoffs'),
]);
