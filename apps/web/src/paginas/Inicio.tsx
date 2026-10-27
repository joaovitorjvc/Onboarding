import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { GLOSSARIO } from '../conteudo/glossario';
import { NOME_DO_PORTAL, tituloDaPagina } from '../conteudo/portal';
import { rotaModulo } from '../dominio/conteudo/rotas';
import { coletarPendencias } from '../dominio/pendencias/coletar';
import { resumirProgresso } from '../dominio/progresso/calculo';
import { useProgressoContexto } from '../componentes/layout/ContextoProgresso';
import { useTrilha } from '../componentes/layout/ContextoTrilha';
import { Barra, Botao, Hexagono, Icone, Indicador, IndicadorProgresso } from '../componentes/ui';

export function Inicio(): ReactNode {
  const trilha = useTrilha();
  const progresso = useProgressoContexto();
  const [confirmando, setConfirmando] = useState(false);
  const resumo = resumirProgresso(progresso.registro, trilha);
  const proximo = trilha.find((modulo) => modulo.id === resumo.proximoModulo);
  const pendencias = coletarPendencias(trilha, GLOSSARIO).length;

  return (
    <div className="nuage-pagina nuage-pagina-inicio">
      <title>{tituloDaPagina('Início')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Plataforma de Onboarding
        </p>
        <h1>{NOME_DO_PORTAL}</h1>
        <p>
          Guia navegável do processo da área de Prospecção da NuageIT, do primeiro dia até a condução autônoma de uma
          oportunidade. Também funciona como base de consulta.
        </p>
      </header>

      {progresso.somenteLeitura ? (
        <p role="status" className="nuage-faixa">
          O armazenamento do navegador está indisponível. O progresso é exibido como vazio e não pode ser salvo.
        </p>
      ) : null}
      {progresso.falhaDeGravacao ? (
        <p role="alert" className="nuage-faixa">
          Não foi possível salvar a alteração. O estado anterior foi mantido.
        </p>
      ) : null}

      <section className="nuage-bloco-pagina" aria-labelledby="titulo-progresso">
        <h2 id="titulo-progresso">Seu progresso</h2>
        <div className="nuage-faixa-indicadores">
          <Indicador icone="trilha" valor={`${resumo.percentual}%`} rotulo="da Trilha concluída" />
          <Indicador icone="check" valor={`${resumo.concluidos}/${resumo.total}`} rotulo="Módulos concluídos" />
          <Indicador
            icone="pendencias"
            valor={String(pendencias)}
            rotulo="conteúdos pendentes"
            detalhe="aguardam confirmação"
          />
        </div>
        <Barra valor={resumo.percentual} rotulo="Progresso da Trilha" />
        <IndicadorProgresso trilha={trilha} registro={progresso.registro} />
      </section>

      <section className="nuage-bloco-pagina" aria-labelledby="titulo-proximo">
        <h2 id="titulo-proximo">Próximo Módulo</h2>
        {proximo ? (
          <Link to={rotaModulo(proximo.id)} className="nuage-cartao nuage-cartao-navegavel nuage-cartao-modulo">
            <Hexagono tom="destaque">{proximo.posicao}</Hexagono>
            <span className="nuage-cartao-modulo__texto">
              <span className="oculto">{`Módulo ${proximo.posicao}:`}</span>{' '}
              <span className="nuage-cartao-modulo__titulo">{proximo.titulo}</span>{' '}
              <span className="nuage-cartao-modulo__apoio">Continuar a Trilha</span>
            </span>
            <Icone nome="seta-direita" />
          </Link>
        ) : (
          <p className="nuage-status">Todos os Módulos da Trilha foram concluídos.</p>
        )}
        <p>
          <Link to="/trilha">Abrir a Trilha completa</Link>, ou use a <Link to="/busca">busca</Link> e o{' '}
          <Link to="/glossario">glossário</Link> em modo de consulta.
        </p>
      </section>

      <section className="nuage-bloco-pagina" aria-labelledby="titulo-reinicio">
        <h2 id="titulo-reinicio">Reiniciar progresso</h2>
        {confirmando ? (
          <div role="group" aria-label="Confirmação de reinício" className="nuage-bloco-pagina">
            <p className="nuage-status">Isso apaga o progresso salvo neste navegador. Deseja continuar?</p>
            <Botao
              onClick={() => {
                progresso.reiniciar();
                setConfirmando(false);
              }}
            >
              Confirmar reinício
            </Botao>
            <Botao variante="secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </Botao>
          </div>
        ) : (
          <Botao variante="secundario" disabled={progresso.somenteLeitura} onClick={() => setConfirmando(true)}>
            Reiniciar progresso
          </Botao>
        )}
      </section>
    </div>
  );
}
