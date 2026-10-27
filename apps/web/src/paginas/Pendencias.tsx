import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { GLOSSARIO } from '../conteudo/glossario';
import { tituloDaPagina } from '../conteudo/portal';
import { rotaModulo, rotaSecao } from '../dominio/conteudo/rotas';
import { coletarPendencias } from '../dominio/pendencias/coletar';
import { useTrilha } from '../componentes/layout/ContextoTrilha';

export function Pendencias(): ReactNode {
  const trilha = useTrilha();
  const pendencias = coletarPendencias(trilha, GLOSSARIO);

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina('Pendências')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Consulta
        </p>
        <h1>Pendências</h1>
        <p>{`${pendencias.length} item(ns) de conteúdo aguardam confirmação. A lista é derivada do conteúdo publicado.`}</p>
      </header>
      <div className="nuage-tabela-rolagem">
        <table className="nuage-tabela">
          <caption className="oculto">Conteúdos pendentes</caption>
          <thead>
            <tr>
              <th scope="col">Local</th>
              <th scope="col">Descrição</th>
              <th scope="col">Requisito</th>
            </tr>
          </thead>
          <tbody>
            {pendencias.map((pendencia) => (
              <tr key={pendencia.id}>
                <td>
                  {pendencia.idModulo && pendencia.idSecao ? (
                    <Link to={rotaSecao(pendencia.idModulo, pendencia.idSecao)}>{pendencia.caminho}</Link>
                  ) : pendencia.idModulo ? (
                    <Link to={rotaModulo(pendencia.idModulo)}>{pendencia.caminho}</Link>
                  ) : (
                    pendencia.caminho
                  )}
                </td>
                <td>{pendencia.descricao}</td>
                <td>{pendencia.requisito}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
