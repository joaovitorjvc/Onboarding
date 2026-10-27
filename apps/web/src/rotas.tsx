import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import { TRILHA } from './conteudo/trilha';
import type { Modulo } from './dominio/conteudo/tipos';
import { ProvedorTrilha } from './componentes/layout/ContextoTrilha';
import { LayoutRaiz, type LayoutRaizProps } from './componentes/layout/LayoutRaiz';
import { Busca } from './paginas/Busca';
import { Glossario } from './paginas/Glossario';
import { Inicio } from './paginas/Inicio';
import { ModuloPagina } from './paginas/Modulo';
import { NaoEncontrada } from './paginas/NaoEncontrada';
import { Pendencias } from './paginas/Pendencias';
import { Referencias } from './paginas/Referencias';
import { SecaoPagina } from './paginas/Secao';
import { Trilha } from './paginas/Trilha';
import { Triagem } from './paginas/Triagem';

export interface RotasProps extends LayoutRaizProps {
  /** Injetável para testes. */
  trilha?: readonly Modulo[];
}

/** Todas as páginas ficam sob um único layout, que mantém progresso, barra lateral e chat durante a navegação. */
export function Rotas({ trilha = TRILHA, armazenamento, clienteChat }: RotasProps): ReactNode {
  return (
    <ProvedorTrilha trilha={trilha}>
      <Routes>
        <Route element={<LayoutRaiz armazenamento={armazenamento} clienteChat={clienteChat} />}>
          <Route index element={<Inicio />} />
          <Route path="trilha" element={<Trilha />} />
          <Route path="trilha/:idModulo" element={<ModuloPagina />} />
          <Route path="trilha/:idModulo/secao/:idSecao" element={<SecaoPagina />} />
          <Route path="triagem" element={<Triagem />} />
          <Route path="busca" element={<Busca />} />
          <Route path="glossario" element={<Glossario />} />
          <Route path="referencias" element={<Referencias />} />
          <Route path="pendencias" element={<Pendencias />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </ProvedorTrilha>
  );
}
