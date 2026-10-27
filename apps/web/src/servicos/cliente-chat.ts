import {
  CODIGOS_ERRO_SERVICO,
  LIMITE_HISTORICO,
  LIMITE_MENSAGEM,
  TIMEOUT_CLIENTE_MS,
  type CodigoErroCliente,
  type CodigoErroServico,
  type ErroChat,
  type MensagemHistorico,
  type RespostaChat,
} from './contrato-chat';

export type ResultadoChat = { ok: true; resposta: RespostaChat } | { ok: false; erro: ErroChat };

export interface OpcoesClienteChat {
  urlBase: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface ClienteChat {
  enviar(mensagem: string, historico: readonly MensagemHistorico[]): Promise<ResultadoChat>;
  saude(): Promise<boolean>;
}

const MENSAGENS: Readonly<Record<CodigoErroCliente, { mensagem: string; recuperavel: boolean }>> = {
  MENSAGEM_VAZIA: { mensagem: 'Escreva uma pergunta antes de enviar.', recuperavel: false },
  MENSAGEM_MUITO_LONGA: {
    mensagem: `A pergunta deve ter no máximo ${LIMITE_MENSAGEM} caracteres.`,
    recuperavel: false,
  },
  CORPO_INVALIDO: { mensagem: 'Não foi possível enviar a pergunta. Tente reformulá-la.', recuperavel: false },
  ORIGEM_NAO_PERMITIDA: { mensagem: 'O assistente não aceita pedidos desta origem.', recuperavel: false },
  LIMITE_TAXA: {
    mensagem: 'Muitas perguntas em pouco tempo. Aguarde um instante e tente novamente.',
    recuperavel: true,
  },
  CONTEUDO_INDISPONIVEL: { mensagem: 'O conteúdo do assistente está indisponível no momento.', recuperavel: false },
  PROVEDOR_INDISPONIVEL: {
    mensagem: 'O assistente está indisponível. Tente novamente em instantes.',
    recuperavel: true,
  },
  TEMPO_LIMITE: { mensagem: 'O assistente demorou demais para responder. Tente novamente.', recuperavel: true },
  RESPOSTA_INVALIDA: { mensagem: 'O assistente devolveu uma resposta inesperada. Tente novamente.', recuperavel: true },
  ERRO_INTERNO: { mensagem: 'Ocorreu um erro no assistente. Tente novamente.', recuperavel: true },
  SERVICO_NAO_CONFIGURADO: { mensagem: 'O assistente não está configurado neste ambiente.', recuperavel: false },
  REDE: {
    mensagem: 'Não foi possível contactar o assistente. Verifique a conexão e tente novamente.',
    recuperavel: true,
  },
};

export function erroChat(codigo: CodigoErroCliente): ErroChat {
  return { codigo, ...MENSAGENS[codigo] };
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function ehRespostaChat(valor: unknown): valor is RespostaChat {
  if (!ehObjeto(valor)) return false;
  return (
    typeof valor['resposta'] === 'string' &&
    typeof valor['encontrouConteudo'] === 'boolean' &&
    typeof valor['versaoConteudo'] === 'string' &&
    Array.isArray(valor['modulosOrigem']) &&
    valor['modulosOrigem'].every(
      (origem) =>
        ehObjeto(origem) &&
        typeof origem['idModulo'] === 'string' &&
        typeof origem['tituloModulo'] === 'string' &&
        typeof origem['idSecao'] === 'string' &&
        typeof origem['tituloSecao'] === 'string',
    )
  );
}

function codigoDoCorpo(corpo: unknown, status: number): CodigoErroCliente {
  if (ehObjeto(corpo)) {
    const candidato = corpo['codigo'] ?? corpo['code'];
    if (typeof candidato === 'string' && (CODIGOS_ERRO_SERVICO as readonly string[]).includes(candidato)) {
      return candidato as CodigoErroServico;
    }
  }
  return status === 429 ? 'LIMITE_TAXA' : 'ERRO_INTERNO';
}

/** Único ponto de leitura da variável de ambiente do serviço de chat. */
export function lerUrlServicoChat(): string | null {
  const valor: unknown = import.meta.env['VITE_URL_SERVICO_CHAT'];
  return typeof valor === 'string' && valor.trim().length > 0 ? valor.trim().replace(/\/+$/u, '') : null;
}

export function criarClienteChat(opcoes: OpcoesClienteChat): ClienteChat {
  const executar = opcoes.fetchImpl ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const timeoutMs = opcoes.timeoutMs ?? TIMEOUT_CLIENTE_MS;

  return {
    async enviar(mensagem, historico) {
      const controlador = new AbortController();
      const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
      try {
        const resposta = await executar(`${opcoes.urlBase}/api/chat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ mensagem, historico: historico.slice(-LIMITE_HISTORICO) }),
          signal: controlador.signal,
        });
        let corpo: unknown = null;
        try {
          corpo = await resposta.json();
        } catch {
          corpo = null;
        }
        if (!resposta.ok) return { ok: false, erro: erroChat(codigoDoCorpo(corpo, resposta.status)) };
        if (!ehRespostaChat(corpo)) return { ok: false, erro: erroChat('RESPOSTA_INVALIDA') };
        return { ok: true, resposta: corpo };
      } catch (erro) {
        const abortado = typeof erro === 'object' && erro !== null && 'name' in erro && erro.name === 'AbortError';
        return { ok: false, erro: erroChat(abortado ? 'TEMPO_LIMITE' : 'REDE') };
      } finally {
        clearTimeout(temporizador);
      }
    },
    async saude() {
      try {
        const resposta = await executar(`${opcoes.urlBase}/api/saude`);
        return resposta.ok;
      } catch {
        return false;
      }
    },
  };
}
