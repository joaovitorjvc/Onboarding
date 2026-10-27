import type { Trilha } from '../dominio/conteudo/tipos.ts';
import { moduloVisaoDaArea } from './modulos/01-visao-da-area.ts';
import { moduloAcessosIniciais } from './modulos/02-acessos-iniciais.ts';
import { moduloFilaTechnicalValidation } from './modulos/03-fila-technical-validation.ts';
import { moduloEntrevistaTecnica } from './modulos/04-entrevista-tecnica.ts';
import { moduloConstrucaoDaSolucao } from './modulos/05-construcao-da-solucao.ts';
import { moduloPrecificacaoEHoras } from './modulos/06-precificacao-e-horas.ts';
import { moduloApresentacaoEFormalizacao } from './modulos/07-apresentacao-e-formalizacao.ts';
import { moduloRegistroClickup } from './modulos/08-registro-clickup.ts';
import { moduloKickoffs } from './modulos/09-kickoffs.ts';
import { moduloHandoverDelivery } from './modulos/10-handover-delivery.ts';
import { moduloSemanaShadow } from './modulos/11-semana-shadow.ts';

/** Ordem canônica da Trilha: não reordenar por conveniência visual. */
export const TRILHA: Trilha = [
  moduloVisaoDaArea,
  moduloAcessosIniciais,
  moduloFilaTechnicalValidation,
  moduloEntrevistaTecnica,
  moduloConstrucaoDaSolucao,
  moduloPrecificacaoEHoras,
  moduloApresentacaoEFormalizacao,
  moduloRegistroClickup,
  moduloKickoffs,
  moduloHandoverDelivery,
  moduloSemanaShadow,
];
