import type { ReactNode } from 'react';
import type { MensagemChat } from '../../hooks/useChat';
import { ReferenciaModulo } from './ReferenciaModulo';

export function ListaMensagens({ mensagens }: { mensagens: readonly MensagemChat[] }): ReactNode {
  return (
    <div role="log" aria-label="Conversa com o assistente" aria-live="polite">
      {mensagens.length === 0 ? (
        <p className="nuage-chat-vazio">Pergunte sobre o conteúdo publicado na Trilha.</p>
      ) : (
        <ul className="nuage-chat-lista">
          {mensagens.map((mensagem) => (
            <li key={mensagem.id} className={`nuage-chat-mensagem nuage-chat-mensagem--${mensagem.papel}`}>
              <strong>{mensagem.papel === 'arquiteto' ? 'Você' : 'Assistente'}:</strong> {mensagem.texto}
              {mensagem.modulosOrigem.length > 0 ? (
                <ul className="nuage-chat-origens" aria-label="Fontes da resposta">
                  {mensagem.modulosOrigem.map((origem) => (
                    <li key={`${origem.idModulo}/${origem.idSecao}`}>
                      <ReferenciaModulo origem={origem} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
