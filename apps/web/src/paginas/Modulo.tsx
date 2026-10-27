import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { tituloDaPagina } from '../conteudo/portal';
import { rotaSecao } from '../dominio/conteudo/rotas';
import { useProgressoContexto } from '../componentes/layout/ContextoProgresso';
import { useTrilha } from '../componentes/layout/ContextoTrilha';
import { Botao, Cartao, Hexagono, Icone, ValorConteudo } from '../componentes/ui';
import { NaoEncontrada } from './NaoEncontrada';

export function ModuloPagina(): ReactNode {
  const { idModulo } = useParams();
  const trilha = useTrilha();
  const progresso = useProgressoContexto();
  const modulo = trilha.find((item) => item.id === idModulo);
  if (!modulo) return <NaoEncontrada />;
  const concluido = progresso.registro.modulos[modulo.id]?.concluido === true;

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina(modulo.titulo)}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          {`Módulo ${modulo.posicao}`}
        </p>
        <h1>{modulo.titulo}</h1>
      </header>

      <Cartao titulo="Resumo">
        <ValorConteudo conteudo={modulo.resumo}>{(resumo) => <p>{resumo}</p>}</ValorConteudo>
        <ValorConteudo conteudo={modulo.origem}>{(origem) => <p>{origem}</p>}</ValorConteudo>
      </Cartao>

      <section className="nuage-bloco-pagina" aria-labelledby="titulo-conclusao">
        <h2 id="titulo-conclusao">Conclusão</h2>
        <Botao
          variante={concluido ? 'secundario' : 'primario'}
          disabled={progresso.somenteLeitura}
          onClick={() => progresso.definirModuloConcluido(modulo.id, !concluido)}
        >
          {concluido ? 'Reabrir módulo' : 'Marcar módulo como concluído'}
        </Botao>
      </section>

      <section className="nuage-bloco-pagina" aria-labelledby="titulo-secoes">
        <h2 id="titulo-secoes">Seções</h2>
        <ol className="nuage-lista-modulos">
          {modulo.secoes.map((secao, indice) => (
            <li key={secao.id}>
              <Link
                to={rotaSecao(modulo.id, secao.id)}
                className="nuage-cartao nuage-cartao-navegavel nuage-cartao-modulo"
              >
                <Hexagono>{indice + 1}</Hexagono>
                <span className="nuage-cartao-modulo__texto">
                  <span className="nuage-cartao-modulo__titulo">{secao.titulo}</span>
                </span>
                <Icone nome="seta-direita" />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
