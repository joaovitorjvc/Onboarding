import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ehIdModulo, rotaModulo } from '../../dominio/conteudo/rotas';
import { useChat } from '../../hooks/useChat';
import type { ClienteChat } from '../../servicos/cliente-chat';
import { EntradaMensagem } from '../chat/EntradaMensagem';
import { ListaMensagens } from '../chat/ListaMensagens';
import { Botao, Icone } from '../ui';
import { useTrilha } from './ContextoTrilha';

const ID_PAINEL = 'nuage-chat-painel';

/** Chat flutuante, presente em qualquer rota. Responde somente com base no conteúdo publicado. */
export function PainelChat({ cliente }: { cliente: ClienteChat | null }): ReactNode {
  const trilha = useTrilha();
  const [aberto, setAberto] = useState(false);
  const chat = useChat(cliente, trilha);
  const gatilho = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);

  const fechar = (): void => {
    devolverFoco.current = true;
    setAberto(false);
  };

  // Ao fechar (botão ou Escape), o foco volta ao gatilho assim que ele reaparece.
  useEffect(() => {
    if (aberto || !devolverFoco.current) return;
    devolverFoco.current = false;
    gatilho.current?.focus();
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (evento: KeyboardEvent): void => {
      if (evento.key !== 'Escape') return;
      devolverFoco.current = true;
      setAberto(false);
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  return (
    <div className="nuage-chat-ancora">
      {aberto ? (
        <section id={ID_PAINEL} className="nuage-chat-painel" aria-label="Assistente da Trilha">
          <header className="nuage-chat-cabecalho">
            <h2>Assistente</h2>
            <button type="button" className="nuage-botao-icone" aria-label="Fechar assistente" onClick={fechar}>
              <Icone nome="fechar" />
            </button>
          </header>
          <div className="nuage-chat-mensagens">
            <ListaMensagens mensagens={chat.mensagens} />
          </div>
          {chat.sugestoes.length > 0 ? (
            <p className="nuage-chat-sugestoes">
              Módulos relacionados:{' '}
              {chat.sugestoes.map((sugestao) =>
                ehIdModulo(sugestao.idModulo) ? (
                  <Link key={sugestao.idModulo} to={rotaModulo(sugestao.idModulo)}>
                    {sugestao.tituloModulo}
                  </Link>
                ) : null,
              )}
            </p>
          ) : null}
          {chat.enviando ? (
            <p className="nuage-chat-estado" role="status">
              Consultando o conteúdo…
            </p>
          ) : null}
          {chat.erro ? (
            <div role="alert" className="nuage-chat-erro">
              <p>{chat.erro.mensagem}</p>
              {chat.erro.recuperavel ? (
                <Botao variante="secundario" larguraTotal onClick={() => void chat.tentarNovamente()}>
                  Tentar novamente
                </Botao>
              ) : null}
            </div>
          ) : null}
          <EntradaMensagem desabilitado={chat.enviando} aoEnviar={chat.enviar} />
        </section>
      ) : (
        <button
          ref={gatilho}
          type="button"
          className="nuage-chat-gatilho"
          aria-expanded={false}
          onClick={() => setAberto(true)}
        >
          <Icone nome="chat" />
          Abrir assistente
        </button>
      )}
    </div>
  );
}
