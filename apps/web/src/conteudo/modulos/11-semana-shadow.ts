import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloSemanaShadow = criarModulo('semana-shadow', 11, 'Semana Shadow', [
  secaoPendente('texto', 'posicao-na-trilha', 'Posição na Trilha'),
  secaoPendente('texto', 'primeira-acao', 'Primeira ação'),
  secaoPendente('texto', 'ausencia-de-roteiro-unico', 'Ausência de roteiro único'),
  secaoPendente('lista', 'roteiro-por-perfil', 'Roteiro por perfil'),
]);
