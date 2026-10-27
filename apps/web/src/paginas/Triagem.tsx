import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router';
import { tituloDaPagina } from '../conteudo/portal';
import { rotaModulo } from '../dominio/conteudo/rotas';
import { PROVIDERS } from '../dominio/triagem/tipos';
import type { ResultadoTriagem } from '../dominio/triagem/tipos';
import { useTriagem } from '../hooks/useTriagem';
import { Botao } from '../componentes/ui';

const ROTULO_PROVIDER = { aws: 'AWS', gcp: 'GCP', azure: 'Azure', 'on-premise': 'On-premise', outro: 'Outro' } as const;

function Resultado({ resultado }: { resultado: ResultadoTriagem }): ReactNode {
  switch (resultado.tipo) {
    case 'conduzida-pelo-arquiteto':
      return (
        <p className="nuage-status">
          Oportunidade conduzida pelo Arquiteto. Siga para{' '}
          <Link to={rotaModulo(resultado.proximoModulo)}>Entrevista técnica</Link>.
        </p>
      );
    case 'devolvida-ao-account-manager':
      return <p className="nuage-status">Devolva a oportunidade ao Account Manager para acionamento da CAVA.</p>;
    case 'pendencia-do-gestor':
      return (
        <p className="nuage-status">
          Pendência do Gestor: não há regra confirmada para esta combinação. Não infira a decisão.
        </p>
      );
    case 'campos-ausentes':
      return (
        <p className="nuage-status">
          Informe os campos ausentes:{' '}
          {resultado.campos
            .map((campo) => (campo === 'provider' ? 'provedor de nuvem' : 'natureza de migração'))
            .join(' e ')}
          .
        </p>
      );
  }
}

export function Triagem(): ReactNode {
  const triagem = useTriagem();
  const migracao = triagem.entrada.migracao === undefined ? '' : triagem.entrada.migracao ? 'sim' : 'nao';

  const enviar = (evento: FormEvent<HTMLFormElement>): void => {
    evento.preventDefault();
    triagem.decidir();
  };

  return (
    <div className="nuage-pagina">
      <title>{tituloDaPagina('Triagem de escopo')}</title>
      <header className="nuage-pagina-cabecalho">
        <p className="nuage-sobretitulo" aria-hidden="true">
          Decisão
        </p>
        <h1>Triagem de escopo</h1>
        <p>Informe o provedor e a natureza da migração para saber quem conduz a oportunidade. Nada é salvo.</p>
      </header>
      <form onSubmit={enviar} className="nuage-formulario">
        <div className="nuage-campo-grupo">
          <label className="nuage-rotulo" htmlFor="triagem-provider">
            Provedor de nuvem
          </label>
          <select
            id="triagem-provider"
            className="nuage-campo"
            value={triagem.entrada.provider ?? ''}
            onChange={(e) => triagem.definirProvider(e.target.value)}
          >
            <option value="">Selecione</option>
            {PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>
                {ROTULO_PROVIDER[provider]}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="nuage-campo-grupo">
          <legend>Há migração?</legend>
          <div>
            <label className="nuage-opcao">
              <input
                type="radio"
                name="migracao"
                value="sim"
                checked={migracao === 'sim'}
                onChange={(e) => triagem.definirMigracao(e.target.value)}
              />
              Sim
            </label>
            <label className="nuage-opcao">
              <input
                type="radio"
                name="migracao"
                value="nao"
                checked={migracao === 'nao'}
                onChange={(e) => triagem.definirMigracao(e.target.value)}
              />
              Não
            </label>
          </div>
        </fieldset>
        <Botao type="submit">Decidir escopo</Botao>
      </form>
      <div role="status" aria-live="polite">
        {triagem.resultado ? <Resultado resultado={triagem.resultado} /> : null}
      </div>
    </div>
  );
}
