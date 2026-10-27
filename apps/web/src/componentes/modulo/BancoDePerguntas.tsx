import { useState, type ReactNode } from 'react';
import { BANCO_PERGUNTAS, rotuloPilar } from '../../conteudo/banco-perguntas';
import { conjuntosParaSituacao, PILARES, type SituacaoPerguntas } from '../../dominio/banco-perguntas/selecionar';
import { Expansivel, ValorConteudo } from '../ui';

const SITUACOES: ReadonlyArray<{ valor: SituacaoPerguntas; rotulo: string }> = [
  { valor: 'poc', rotulo: 'PoC' },
  { valor: 'mvp-apos-poc', rotulo: 'MVP após PoC (perguntas adicionais)' },
  { valor: 'mvp-direto', rotulo: 'MVP direto (PoC + adicionais de MVP)' },
];

const ROTULO_CONJUNTO = { poc: 'PoC', mvp: 'Adicionais de MVP' } as const;

/** Renderiza só os conjuntos da situação escolhida; o restante nem entra no DOM. */
export function BancoDePerguntas(): ReactNode {
  const [situacao, setSituacao] = useState<SituacaoPerguntas>('poc');
  const conjuntos = conjuntosParaSituacao(situacao);

  return (
    <div className="nuage-bloco-pagina">
      <div className="nuage-campo-grupo">
        <label className="nuage-rotulo" htmlFor="banco-situacao">
          Situação da oportunidade
        </label>
        <select
          id="banco-situacao"
          className="nuage-campo"
          value={situacao}
          onChange={(evento) => setSituacao(evento.target.value as SituacaoPerguntas)}
        >
          {SITUACOES.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </select>
      </div>
      {PILARES.map((pilar) => (
        <Expansivel key={pilar} titulo={rotuloPilar(pilar)}>
          {conjuntos.map((conjunto) => (
            <div key={conjunto} className="nuage-bloco-pagina">
              <h3>{ROTULO_CONJUNTO[conjunto]}</h3>
              <ValorConteudo conteudo={BANCO_PERGUNTAS[pilar][conjunto]}>
                {(perguntas) => (
                  <ul className="nuage-lista-secao">
                    {perguntas.map((pergunta) => (
                      <li key={pergunta}>{pergunta}</li>
                    ))}
                  </ul>
                )}
              </ValorConteudo>
            </div>
          ))}
        </Expansivel>
      ))}
    </div>
  );
}
