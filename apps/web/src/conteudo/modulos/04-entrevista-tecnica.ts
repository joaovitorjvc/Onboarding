import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloEntrevistaTecnica = criarModulo('entrevista-tecnica', 4, 'Entrevista técnica', [
  secaoPendente('passos', 'sequencia-da-etapa', 'Sequência da etapa'),
  secaoPendente('texto', 'bant', 'O BANT entregue pelo Account Manager'),
  secaoPendente('passos', 'roteiro-de-pesquisa-previa', 'Roteiro de pesquisa prévia'),
  secaoPendente('lista', 'conjuntos-por-situacao', 'Conjuntos de perguntas por situação'),
  secaoPendente('banco-perguntas', 'banco-de-perguntas', 'Banco de Perguntas'),
]);
