import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { MARCA_DO_PORTAL, SUBTITULO_DA_MARCA } from '../../conteudo/portal';
import { rotaSecao } from '../../dominio/conteudo/rotas';
import { resumirProgresso } from '../../dominio/progresso/calculo';
import { Barra, Hexagono, Icone } from '../ui';
import type { NomeIcone } from '../ui/Icone';
import { useProgressoContexto } from './ContextoProgresso';
import { useTrilha } from './ContextoTrilha';

interface ItemNavegacao {
  para: string;
  rotulo: string;
  icone: NomeIcone;
  exato?: boolean;
}

const GRUPOS: ReadonlyArray<{ titulo: string; itens: readonly ItemNavegacao[] }> = [
  {
    titulo: 'Jornada',
    itens: [
      { para: '/', rotulo: 'Início', icone: 'inicio', exato: true },
      { para: '/trilha', rotulo: 'Trilha', icone: 'trilha', exato: true },
    ],
  },
  { titulo: 'Decisão', itens: [{ para: '/triagem', rotulo: 'Triagem de escopo', icone: 'triagem' }] },
  {
    titulo: 'Entrevista',
    itens: [
      { para: rotaSecao('entrevista-tecnica', 'banco-de-perguntas'), rotulo: 'Banco de Perguntas', icone: 'perguntas' },
      {
        para: rotaSecao('entrevista-tecnica', 'roteiro-de-pesquisa-previa'),
        rotulo: 'Pesquisa prévia',
        icone: 'busca',
      },
    ],
  },
  {
    titulo: 'Consulta',
    itens: [
      { para: '/busca', rotulo: 'Busca', icone: 'busca' },
      { para: '/glossario', rotulo: 'Glossário', icone: 'glossario' },
      { para: '/referencias', rotulo: 'Referências', icone: 'referencias' },
      { para: '/pendencias', rotulo: 'Pendências', icone: 'pendencias' },
    ],
  },
];

export function BarraLateral(): ReactNode {
  const trilha = useTrilha();
  const { registro } = useProgressoContexto();
  const resumo = resumirProgresso(registro, trilha);

  return (
    <aside className="nuage-barra-lateral">
      <div className="nuage-marca-bloco">
        <p className="nuage-marca">{MARCA_DO_PORTAL}</p>
        <p className="nuage-marca-subtitulo">{SUBTITULO_DA_MARCA}</p>
      </div>
      <nav className="nuage-nav" aria-label="Navegação principal">
        {GRUPOS.map((grupo) => (
          <section key={grupo.titulo} className="nuage-nav-grupo" aria-label={grupo.titulo}>
            <h2 className="nuage-grupo-nav">{grupo.titulo}</h2>
            <ul className="nuage-lista-nav">
              {grupo.itens.map((item) => (
                <li key={item.para}>
                  <NavLink to={item.para} end={item.exato ?? false} className="nuage-item-nav">
                    <Icone nome={item.icone} />
                    <span>{item.rotulo}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
      <div className="nuage-cartao-usuario">
        <Hexagono tom="destaque" tamanho="3rem">
          {`${resumo.percentual}%`}
        </Hexagono>
        <div className="nuage-cartao-usuario__texto">
          <p className="nuage-cartao-usuario__titulo">Progresso da Trilha</p>
          <p className="nuage-cartao-usuario__detalhe">{`${resumo.concluidos} de ${resumo.total} Módulos`}</p>
          <Barra valor={resumo.percentual} rotulo="Progresso da Trilha" tom="invertido" />
        </div>
      </div>
    </aside>
  );
}
