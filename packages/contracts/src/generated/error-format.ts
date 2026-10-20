/* eslint-disable */
/** Gerado por packages/contracts/scripts/generate.mts. */

/**
 * Formato_de_Erro padronizado do NuageHub (Req. 13.2). Definição única.
 */
export interface ErrorFormat {
  /**
   * Código estável do erro.
   */
  code: string;
  /**
   * Mensagem em pt-BR, sem stack trace.
   */
  message: string;
  /**
   * Identificador de correlação (x-correlation-id).
   */
  correlationId: string;
  /**
   * Status HTTP.
   */
  status: number;
  /**
   * Detalhes por campo (erros de validação).
   */
  details?: ErrorDetail[];
}
export interface ErrorDetail {
  field: string;
  issue: string;
}
