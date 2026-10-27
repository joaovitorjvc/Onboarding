import { useRef, useState } from 'react';
import { buscar } from '../dominio/busca/buscar';
import { criarIndice } from '../dominio/busca/indice';
import type { Modulo } from '../dominio/conteudo/tipos';
import type { ClienteChat } from '../servicos/cliente-chat';
import { erroChat } from '../servicos/cliente-chat';
import { LIMITE_MENSAGEM, type ErroChat, type MensagemHistorico, type ModuloOrigem } from '../servicos/contrato-chat';

export interface MensagemChat extends MensagemHistorico {
  id: number;
  modulosOrigem: readonly ModuloOrigem[];
}

export interface SugestaoModulo {
  idModulo: string;
  tituloModulo: string;
}

export interface ChatApi {
  mensagens: readonly MensagemChat[];
  enviando: boolean;
  erro: ErroChat | null;
  sugestoes: readonly SugestaoModulo[];
  enviar(texto: string): Promise<void>;
  tentarNovamente(): Promise<void>;
}

function sugerir(trilha: readonly Modulo[], pergunta: string): SugestaoModulo[] {
  const resultado = buscar(criarIndice(trilha), pergunta);
  if (resultado.tipo !== 'resultados') return [];
  const vistos = new Map<string, SugestaoModulo>();
  for (const item of resultado.itens) {
    if (!vistos.has(item.idModulo))
      vistos.set(item.idModulo, { idModulo: item.idModulo, tituloModulo: item.tituloModulo });
  }
  return [...vistos.values()].slice(0, 3);
}

/** Histórico apenas em memória e no máximo uma requisição em voo. */
export function useChat(cliente: ClienteChat | null, trilha: readonly Modulo[]): ChatApi {
  const [mensagens, setMensagens] = useState<readonly MensagemChat[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<ErroChat | null>(null);
  const [sugestoes, setSugestoes] = useState<readonly SugestaoModulo[]>([]);
  const emVoo = useRef(false);
  const proximoId = useRef(1);
  const ultimaPergunta = useRef<string | null>(null);

  const enviarTexto = async (bruto: string, repor: boolean): Promise<void> => {
    const texto = bruto.trim();
    if (emVoo.current) return;
    if (texto.length === 0) {
      setErro(erroChat('MENSAGEM_VAZIA'));
      return;
    }
    if (texto.length > LIMITE_MENSAGEM) {
      setErro(erroChat('MENSAGEM_MUITO_LONGA'));
      return;
    }
    if (!cliente) {
      setErro(erroChat('SERVICO_NAO_CONFIGURADO'));
      return;
    }
    emVoo.current = true;
    setEnviando(true);
    setErro(null);
    ultimaPergunta.current = texto;
    const historico = mensagens.map(({ papel, texto: conteudo }) => ({ papel, texto: conteudo }));
    if (!repor) {
      const id = proximoId.current++;
      setMensagens((atuais) => [...atuais, { id, papel: 'arquiteto', texto, modulosOrigem: [] }]);
    }
    try {
      const resultado = await cliente.enviar(texto, repor ? historico.slice(0, -1) : historico);
      if (resultado.ok) {
        const id = proximoId.current++;
        setMensagens((atuais) => [
          ...atuais,
          {
            id,
            papel: 'assistente',
            texto: resultado.resposta.resposta,
            modulosOrigem: resultado.resposta.modulosOrigem,
          },
        ]);
        setSugestoes(sugerir(trilha, texto));
        ultimaPergunta.current = null;
      } else {
        setErro(resultado.erro);
      }
    } finally {
      emVoo.current = false;
      setEnviando(false);
    }
  };

  return {
    mensagens,
    enviando,
    erro,
    sugestoes,
    enviar: (texto) => enviarTexto(texto, false),
    tentarNovamente: async () => {
      const pergunta = ultimaPergunta.current;
      if (pergunta !== null) await enviarTexto(pergunta, true);
    },
  };
}
