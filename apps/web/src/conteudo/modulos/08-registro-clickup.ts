import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloRegistroClickup = criarModulo('registro-clickup', 8, 'Registro no ClickUp', [
  secaoPendente('texto', 'lista-do-clickup', 'Lista do ClickUp'),
  secaoPendente('lista', 'campos-do-registro', 'Campos do registro'),
  secaoPendente('texto', 'anexo-do-registro', 'Anexo do registro'),
  secaoPendente('comparativa', 'desfechos-de-validacao', 'Desfechos de validação'),
  secaoPendente('texto', 'kickoffs-no-registro', 'Kickoffs no registro'),
  secaoPendente('texto', 'ausencia-de-desfecho', 'Ausência de desfecho'),
]);
