export const LIMITE_MENSAGEM = 1000;
export const LIMITE_HISTORICO = 10;
export const TIMEOUT_PROVEDOR_MS = 20_000;
export const TIMEOUT_CLIENTE_MS = 25_000;

export type PapelMensagem = 'arquiteto' | 'assistente';

export interface MensagemHistorico {
  papel: PapelMensagem;
  texto: string;
}

export interface RequisicaoChat {
  mensagem: string;
  historico: readonly MensagemHistorico[];
}

export interface ModuloOrigem {
  idModulo: string;
  tituloModulo: string;
  idSecao: string;
  tituloSecao: string;
}

export interface RespostaChat {
  resposta: string;
  encontrouConteudo: boolean;
  modulosOrigem: readonly ModuloOrigem[];
  versaoConteudo: string;
}

export const CODIGOS_ERRO_SERVICO = [
  'MENSAGEM_VAZIA',
  'MENSAGEM_MUITO_LONGA',
  'CORPO_INVALIDO',
  'ORIGEM_NAO_PERMITIDA',
  'LIMITE_TAXA',
  'CONTEUDO_INDISPONIVEL',
  'PROVEDOR_INDISPONIVEL',
  'TEMPO_LIMITE',
  'RESPOSTA_INVALIDA',
  'ERRO_INTERNO',
] as const;

export type CodigoErroServico = (typeof CODIGOS_ERRO_SERVICO)[number];

/** Falhas geradas no próprio cliente, sem resposta válida do serviço. */
export type CodigoErroCliente = CodigoErroServico | 'SERVICO_NAO_CONFIGURADO' | 'REDE';

export interface ErroChat {
  codigo: CodigoErroCliente;
  mensagem: string;
  recuperavel: boolean;
}
