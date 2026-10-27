import type { CSSProperties, ReactNode } from 'react';
import type { IdModulo, Secao } from '../../dominio/conteudo/tipos';
import { useProgressoContexto } from '../layout/ContextoProgresso';
import { ValorConteudo } from '../ui';
import { BancoDePerguntas } from './BancoDePerguntas';

function Conteudo({ idModulo, secao }: { idModulo: IdModulo; secao: Secao }): ReactNode {
  const progresso = useProgressoContexto();

  switch (secao.tipo) {
    case 'texto':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(paragrafos) => (
            <>
              {paragrafos.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
            </>
          )}
        </ValorConteudo>
      );
    case 'topicos':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(topicos) => (
            <ol
              className={
                topicos.some((topico) => topico.largura === 'total')
                  ? 'nuage-topicos nuage-topicos--grade'
                  : 'nuage-topicos'
              }
            >
              {topicos.map((topico, indice) => (
                <li
                  key={topico.titulo}
                  className={topico.largura === 'total' ? 'nuage-topico nuage-topico--total' : 'nuage-topico'}
                  style={{ '--atraso-entrada': `${indice * 90}ms` } as CSSProperties}
                >
                  <span className="nuage-topico__indice" aria-hidden="true">
                    {topico.marcador ?? String(indice + 1).padStart(2, '0')}
                  </span>
                  <div className="nuage-topico__corpo">
                    <h2 className="nuage-topico__titulo">{topico.titulo}</h2>
                    {topico.paragrafos.map((paragrafo) => (
                      <p key={paragrafo}>{paragrafo}</p>
                    ))}
                    {topico.itens ? (
                      <details className="nuage-topico__detalhes">
                        <summary>{topico.itens.rotulo}</summary>
                        <ul className="nuage-topico__itens">
                          {topico.itens.itens.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </ValorConteudo>
      );
    case 'lista':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(itens) => (
            <ul className="nuage-lista-secao">
              {itens.map((item) => (
                <li key={item.rotulo}>
                  <strong>{item.rotulo}:</strong> {item.descricao}
                </li>
              ))}
            </ul>
          )}
        </ValorConteudo>
      );
    case 'passos':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(passos) => (
            <ol className="nuage-lista-secao">
              {passos.map((passo) => (
                <li key={passo}>{passo}</li>
              ))}
            </ol>
          )}
        </ValorConteudo>
      );
    case 'comparativa':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(tabela) => (
            <div className="nuage-tabela-rolagem">
              <table className="nuage-tabela">
                <caption className="oculto">{secao.titulo}</caption>
                <thead>
                  <tr>
                    {tabela.colunas.map((coluna) => (
                      <th key={coluna} scope="col">
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tabela.linhas.map((linha) => (
                    <tr key={linha.rotulo}>
                      <th scope="row">{linha.rotulo}</th>
                      {linha.valores.map((valor, indice) => (
                        <td key={`${linha.rotulo}-${indice}`}>{valor}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ValorConteudo>
      );
    case 'checklist':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(itens) => (
            <>
              {progresso.somenteLeitura ? (
                <p className="nuage-status" role="status">
                  O armazenamento do navegador está indisponível: as marcações não serão preservadas.
                </p>
              ) : null}
              <ul className="nuage-lista-secao nuage-lista-secao--sem-marcador">
                {itens.map((item) => {
                  const idCampo = `check-${idModulo}-${item.id}`;
                  return (
                    <li key={item.id} className="nuage-checklist-item">
                      <input
                        id={idCampo}
                        type="checkbox"
                        checked={progresso.registro.checklists[idModulo]?.[item.id] === true}
                        disabled={progresso.somenteLeitura}
                        onChange={(evento) => progresso.definirItemChecklist(idModulo, item.id, evento.target.checked)}
                      />
                      <label htmlFor={idCampo}>
                        <strong>{item.rotulo}</strong> — {item.descricao}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </ValorConteudo>
      );
    case 'banco-perguntas':
      return (
        <>
          <ValorConteudo conteudo={secao.conteudo}>
            {(itens) => (
              <ul className="nuage-lista-secao">
                {itens.map((item) => (
                  <li key={item.pilar}>
                    <strong>{item.pilar}:</strong> {item.perguntas.join(' ')}
                  </li>
                ))}
              </ul>
            )}
          </ValorConteudo>
          <BancoDePerguntas />
        </>
      );
    case 'referencias':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(caminhos) => (
            <ul className="nuage-lista-secao">
              {caminhos.map((caminho) => (
                <li key={caminho}>
                  <code>{caminho}</code>
                </li>
              ))}
            </ul>
          )}
        </ValorConteudo>
      );
    case 'formula':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(formulas) => (
            <>
              <p>Fórmulas apresentadas como texto. Esta plataforma não executa cálculos.</p>
              {formulas.map((formula) => (
                <code key={formula} className="nuage-formula">
                  {formula}
                </code>
              ))}
            </>
          )}
        </ValorConteudo>
      );
    case 'modelo-de-prompt':
      return (
        <ValorConteudo conteudo={secao.conteudo}>
          {(blocos) => (
            <>
              {blocos.map((bloco, indice) => (
                <pre
                  key={bloco}
                  className="nuage-bloco-literal nuage-bloco-literal--prompt"
                  aria-label={`Bloco literal ${indice + 1}`}
                >
                  {bloco}
                </pre>
              ))}
            </>
          )}
        </ValorConteudo>
      );
  }
}

/** Despacho exaustivo das dez variantes de seção: um novo `tipo` quebra a compilação aqui. */
export function SecaoDoModulo({ idModulo, secao }: { idModulo: IdModulo; secao: Secao }): ReactNode {
  return (
    <div className="nuage-secao">
      <Conteudo idModulo={idModulo} secao={secao} />
    </div>
  );
}
