import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { Modulo } from '../dominio/conteudo/tipos';
import type { Armazenamento } from '../dominio/progresso/armazenamento';
import type { ClienteChat } from '../servicos/cliente-chat';
import { Rotas } from '../rotas';

export interface OpcoesRender {
  armazenamento?: Armazenamento | null;
  clienteChat?: ClienteChat | null;
  trilha?: readonly Modulo[];
}

export function renderizar(rota: string, opcoes: OpcoesRender = {}) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Rotas
        armazenamento={opcoes.armazenamento}
        clienteChat={opcoes.clienteChat === undefined ? null : opcoes.clienteChat}
        {...(opcoes.trilha ? { trilha: opcoes.trilha } : {})}
      />
    </MemoryRouter>,
  );
}
