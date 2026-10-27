import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { tituloDaPagina } from '../conteudo/portal';
import { rotaModulo } from '../dominio/conteudo/rotas';
import { useProgressoContexto } from '../componentes/layout/ContextoProgresso';
import { useTrilha } from '../componentes/layout/ContextoTrilha';
import { Hexagono, Icone, Selo } from '../componentes/ui';

export function Trilha(): ReactNode {
  const trilha = useTrilha();
  const { registro } = useProgressoContexto();

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina('Trilha')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Jornada
        </p>
        <h1>Trilha</h1>
        <p>{`Os ${trilha.length} Módulos, na ordem canônica do processo.`}</p>
      </header>
      <ol className="nuage-lista-modulos">
        {trilha.map((modulo) => {
          const concluido = registro.modulos[modulo.id]?.concluido === true;
          return (
            <li key={modulo.id}>
              <Link to={rotaModulo(modulo.id)} className="nuage-cartao nuage-cartao-navegavel nuage-cartao-modulo">
                <Hexagono tom={concluido ? 'destaque' : 'claro'}>{modulo.posicao}</Hexagono>
                <span className="nuage-cartao-modulo__texto">
                  <span className="oculto">{`Módulo ${modulo.posicao}:`}</span>{' '}
                  <span className="nuage-cartao-modulo__titulo">{modulo.titulo}</span>{' '}
                  <span className="nuage-cartao-modulo__apoio">{`${modulo.secoes.length} seções`}</span>
                </span>
                <span className="nuage-cartao-modulo__estado">
                  <Selo variante={concluido ? 'confirmado' : 'neutro'}>
                    {concluido ? 'Concluído' : 'Não concluído'}
                  </Selo>
                  <Icone nome="seta-direita" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
