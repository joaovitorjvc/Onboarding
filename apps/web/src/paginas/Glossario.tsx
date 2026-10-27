import { useState, type ReactNode } from 'react';
import { GLOSSARIO } from '../conteudo/glossario';
import { tituloDaPagina } from '../conteudo/portal';
import { CATEGORIAS_GLOSSARIO, ordenarGlossario } from '../dominio/glossario/ordenar';
import { ValorConteudo } from '../componentes/ui';

export function Glossario(): ReactNode {
  const [categoria, setCategoria] = useState('');
  const entradas = ordenarGlossario(GLOSSARIO).filter((entrada) => categoria === '' || entrada.categoria === categoria);

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina('Glossário')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Consulta
        </p>
        <h1>Glossário</h1>
        <p>Termos oficiais do processo, em ordem alfabética.</p>
      </header>
      <div className="nuage-campo-grupo">
        <label className="nuage-rotulo" htmlFor="glossario-categoria">
          Categoria
        </label>
        <select
          id="glossario-categoria"
          className="nuage-campo"
          value={categoria}
          onChange={(evento) => setCategoria(evento.target.value)}
        >
          <option value="">Todas</option>
          {CATEGORIAS_GLOSSARIO.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <dl className="nuage-glossario">
        {entradas.map((entrada) => (
          <div key={entrada.termo} className="nuage-cartao">
            <dt>{entrada.termo}</dt>
            <dd>
              <ValorConteudo conteudo={entrada.definicao}>{(definicao) => <p>{definicao}</p>}</ValorConteudo>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
