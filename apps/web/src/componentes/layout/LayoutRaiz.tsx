import { useMemo, type ReactNode } from 'react';
import { Outlet } from 'react-router';
import type { Armazenamento } from '../../dominio/progresso/armazenamento';
import { criarClienteChat, lerUrlServicoChat, type ClienteChat } from '../../servicos/cliente-chat';
import { BarraLateral } from './BarraLateral';
import { ProvedorProgresso } from './ContextoProgresso';
import { PainelChat } from './PainelChat';
import { RestauracaoDeRolagem } from './RestauracaoDeRolagem';
import { Rodape } from './Rodape';

function clienteDoAmbiente(): ClienteChat | null {
  const url = lerUrlServicoChat();
  return url === null ? null : criarClienteChat({ urlBase: url });
}

export interface LayoutRaizProps {
  armazenamento?: Armazenamento | null;
  /** `undefined` usa o ambiente; `null` desativa o chat. */
  clienteChat?: ClienteChat | null;
}

/** Moldura persistente: uma única instância do progresso, barra lateral, rodapé e chat em todas as rotas. */
export function LayoutRaiz({ armazenamento, clienteChat }: LayoutRaizProps): ReactNode {
  const cliente = useMemo(() => (clienteChat === undefined ? clienteDoAmbiente() : clienteChat), [clienteChat]);

  return (
    <ProvedorProgresso armazenamento={armazenamento}>
      <div className="nuage-aplicacao">
        <a className="nuage-atalho" href="#conteudo-principal">
          Ir para o conteúdo principal
        </a>
        <BarraLateral />
        <div className="nuage-area-conteudo">
          <main id="conteudo-principal" className="nuage-corpo nuage-prosa" tabIndex={-1}>
            <Outlet />
          </main>
          <Rodape />
        </div>
        <PainelChat cliente={cliente} />
        <RestauracaoDeRolagem />
      </div>
    </ProvedorProgresso>
  );
}
