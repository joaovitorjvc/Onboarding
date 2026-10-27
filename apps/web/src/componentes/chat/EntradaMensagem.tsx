import { useState, type FormEvent, type ReactNode } from 'react';
import { LIMITE_MENSAGEM } from '../../servicos/contrato-chat';
import { Botao } from '../ui';

export function EntradaMensagem({
  desabilitado,
  aoEnviar,
}: {
  desabilitado: boolean;
  aoEnviar: (texto: string) => Promise<void>;
}): ReactNode {
  const [texto, setTexto] = useState('');

  const enviar = (evento: FormEvent<HTMLFormElement>): void => {
    evento.preventDefault();
    const atual = texto;
    setTexto('');
    void aoEnviar(atual);
  };

  return (
    <form className="nuage-chat-entrada" onSubmit={enviar}>
      <label className="nuage-rotulo" htmlFor="chat-pergunta">
        Pergunta ao assistente
      </label>
      <textarea
        id="chat-pergunta"
        value={texto}
        maxLength={LIMITE_MENSAGEM}
        rows={3}
        onChange={(evento) => setTexto(evento.target.value)}
      />
      <Botao type="submit" larguraTotal disabled={desabilitado}>
        Enviar
      </Botao>
    </form>
  );
}
