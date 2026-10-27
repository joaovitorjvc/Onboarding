import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { tituloDaPagina } from '../conteudo/portal';

export function NaoEncontrada(): ReactNode {
  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina('Página não encontrada')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Erro 404
        </p>
        <h1>Página não encontrada</h1>
        <p>O endereço acessado não existe nesta plataforma.</p>
      </header>
      <p>
        <Link to="/">Voltar ao início</Link>
      </p>
    </div>
  );
}
