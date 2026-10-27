import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { tituloDaPagina } from '../conteudo/portal';
import { rotaModulo, rotaSecao } from '../dominio/conteudo/rotas';
import { useTrilha } from '../componentes/layout/ContextoTrilha';
import { SecaoDoModulo } from '../componentes/modulo/SecaoDoModulo';
import { Icone } from '../componentes/ui';
import { NaoEncontrada } from './NaoEncontrada';

export function SecaoPagina(): ReactNode {
  const { idModulo, idSecao } = useParams();
  const trilha = useTrilha();
  const modulo = trilha.find((item) => item.id === idModulo);
  const indice = modulo ? modulo.secoes.findIndex((item) => item.id === idSecao) : -1;
  const secao = modulo && indice >= 0 ? modulo.secoes[indice] : undefined;
  if (!modulo || !secao) return <NaoEncontrada />;
  const anterior = modulo.secoes[indice - 1];
  const proxima = modulo.secoes[indice + 1];

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina(`${secao.titulo} — ${modulo.titulo}`)}</title>
      <header className="nuage-secao-cabecalho">
        <p className="nuage-sobretitulo">
          <Link to={rotaModulo(modulo.id)}>{`Módulo ${modulo.posicao}: ${modulo.titulo}`}</Link>
        </p>
        <h1>{secao.titulo}</h1>
      </header>
      <SecaoDoModulo idModulo={modulo.id} secao={secao} />
      <nav aria-label="Navegação entre seções" className="nuage-navegacao-vizinhos">
        {anterior ? (
          <Link to={rotaSecao(modulo.id, anterior.id)}>
            <Icone nome="seta-direita" espelhado />
            {`Anterior: ${anterior.titulo}`}
          </Link>
        ) : (
          <span />
        )}
        {proxima ? (
          <Link to={rotaSecao(modulo.id, proxima.id)}>
            {`Próxima: ${proxima.titulo}`}
            <Icone nome="seta-direita" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
