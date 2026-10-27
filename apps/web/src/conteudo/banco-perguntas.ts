import type { Conjunto, Pilar } from '../dominio/banco-perguntas/selecionar';
import { CONJUNTOS, PILARES } from '../dominio/banco-perguntas/selecionar';
import type { Conteudo } from '../dominio/conteudo/tipos';
import { pendente } from './apoio';

export type BancoPerguntas = Readonly<Record<Pilar, Readonly<Record<Conjunto, Conteudo<readonly string[]>>>>>;

const ROTULO_PILAR: Readonly<Record<Pilar, string>> = {
  aplicacao: 'Aplicação',
  genai: 'GenAI',
  finops: 'FinOps',
  cloud: 'Cloud',
  'cloud-native': 'Cloud Native',
  security: 'Security',
  'data-analytics': 'Data & Analytics',
};

export function rotuloPilar(pilar: Pilar): string {
  return ROTULO_PILAR[pilar];
}

function conjunto(pilar: Pilar, tipo: Conjunto): Conteudo<readonly string[]> {
  return pendente(
    `banco-${pilar}-${tipo}`,
    `Perguntas de ${ROTULO_PILAR[pilar]} (${tipo === 'poc' ? 'PoC' : 'adicionais de MVP'}) ainda não confirmadas.`,
    'Confirmação do conteúdo oficial pelo Gestor da área de Soluções.',
  );
}

function criar(): BancoPerguntas {
  const entradas = PILARES.map((pilar) => [
    pilar,
    Object.fromEntries(CONJUNTOS.map((tipo) => [tipo, conjunto(pilar, tipo)])) as Record<
      Conjunto,
      Conteudo<readonly string[]>
    >,
  ]);
  return Object.fromEntries(entradas) as BancoPerguntas;
}

/** 7 Pilares × 2 conjuntos = 14 conjuntos, todos pendentes até a confirmação do conteúdo. */
export const BANCO_PERGUNTAS: BancoPerguntas = criar();
