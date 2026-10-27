import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { REFERENCIAS } from '../conteudo/referencias';
import { tituloDaPagina } from '../conteudo/portal';
import { rotaSecao } from '../dominio/conteudo/rotas';
import { agruparPorCaminho } from '../dominio/referencias/coletar';

export function Referencias(): ReactNode {
  const grupos = agruparPorCaminho(REFERENCIAS);

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina('Referências')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Consulta
        </p>
        <h1>Referências</h1>
        <p>Caminhos textuais do repositório Cog Solutions. Esta plataforma não os lê nem os abre.</p>
      </header>
      {grupos.length === 0 ? (
        <p className="nuage-status">Nenhuma referência confirmada até o momento.</p>
      ) : (
        grupos.map(([diretorio, itens]) => (
          <section key={diretorio} className="nuage-bloco-pagina" aria-label={diretorio}>
            <h2>
              <code>{diretorio}</code>
            </h2>
            <ul className="nuage-lista-secao">
              {itens.map((item) => (
                <li key={`${item.idModulo}/${item.idSecao}/${item.caminho}`}>
                  <code>{item.caminho}</code> — <Link to={rotaSecao(item.idModulo, item.idSecao)}>origem</Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
