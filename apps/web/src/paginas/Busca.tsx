import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router';
import { tituloDaPagina } from '../conteudo/portal';
import { rotaSecao } from '../dominio/conteudo/rotas';
import { TERMO_MAXIMO, TERMO_MINIMO } from '../dominio/busca/buscar';
import { useBusca } from '../hooks/useBusca';
import { useTrilha } from '../componentes/layout/ContextoTrilha';
import { Botao, Icone } from '../componentes/ui';

export function Busca(): ReactNode {
  const trilha = useTrilha();
  const busca = useBusca(trilha);

  const enviar = (evento: FormEvent<HTMLFormElement>): void => {
    evento.preventDefault();
    busca.enviar();
  };

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina('Busca')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Consulta
        </p>
        <h1>Busca</h1>
        <p>Pesquisa no conteúdo publicado, ignorando maiúsculas e acentos.</p>
      </header>
      <form role="search" onSubmit={enviar} className="nuage-formulario">
        <div className="nuage-campo-grupo">
          <label className="nuage-rotulo" htmlFor="busca-termo">
            Termo de busca
          </label>
          <input
            id="busca-termo"
            type="search"
            value={busca.campo}
            maxLength={TERMO_MAXIMO}
            onChange={(evento) => busca.definirCampo(evento.target.value)}
          />
        </div>
        <Botao type="submit">Buscar</Botao>
      </form>
      {busca.termoInvalido === 'curto' ? (
        <p role="alert" className="nuage-status">{`Digite pelo menos ${TERMO_MINIMO} caracteres para buscar.`}</p>
      ) : null}
      <div role="status" aria-live="polite" className="nuage-bloco-pagina">
        {busca.resultado === null ? null : busca.resultado.itens.length === 0 ? (
          <p>{`Nenhum resultado para “${busca.resultado.termo}”.`}</p>
        ) : (
          <>
            <p>{`${busca.resultado.itens.length} resultado(s) para “${busca.resultado.termo}”.`}</p>
            <ul className="nuage-lista-resultados">
              {busca.resultado.itens.map((item) => (
                <li key={`${item.idModulo}/${item.idSecao}`}>
                  <Link
                    to={rotaSecao(item.idModulo, item.idSecao)}
                    className="nuage-cartao nuage-cartao-navegavel nuage-cartao-linha"
                  >
                    <span className="nuage-cartao-modulo__titulo">{`${item.tituloModulo} — ${item.tituloSecao}`}</span>
                    <Icone nome="seta-direita" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
