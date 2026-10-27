import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloAcessosIniciais = criarModulo('acessos-iniciais', 2, 'Acessos iniciais', [
  secaoPendente('texto', 'origem-do-proposal-doc', 'Origem do Proposal Doc'),
  secaoPendente('checklist', 'checklist-de-acessos', 'Checklist de acessos'),
]);
