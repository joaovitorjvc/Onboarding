import type { EntradaGlossario } from '../dominio/glossario/ordenar.ts';
import { confirmado, pendente } from './apoio.ts';

const FONTE = 'DOCUMENTO-REPLICACAO-ESTRUTURA.md';
const PENDENCIA = 'Confirmação da definição oficial pelo Gestor da área de Soluções.';

function termoPendente(termo: string, categoria: EntradaGlossario['categoria']): EntradaGlossario {
  const id = `glossario-${termo
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')}`;
  return { termo, categoria, definicao: pendente(id, `Definição de "${termo}" ainda não confirmada.`, PENDENCIA) };
}

export const GLOSSARIO: readonly EntradaGlossario[] = [
  {
    termo: 'Trilha',
    categoria: 'Esta plataforma',
    definicao: confirmado(
      'Sequência ordenada de exatamente 11 Módulos, do primeiro dia até a condução autônoma de uma oportunidade.',
      FONTE,
    ),
  },
  {
    termo: 'Módulo',
    categoria: 'Esta plataforma',
    definicao: confirmado('Unidade da Trilha, formada por seções com identificadores estáveis.', FONTE),
  },
  {
    termo: 'Registro de Progresso',
    categoria: 'Esta plataforma',
    definicao: confirmado(
      'Documento salvo no localStorage do navegador com a conclusão de Módulos e de itens de checklist.',
      FONTE,
    ),
  },
  termoPendente('Arquiteto', 'Papéis do processo'),
  termoPendente('Account Manager', 'Papéis do processo'),
  termoPendente('Gestor', 'Papéis do processo'),
  termoPendente('Technical Validation', 'Filas e listas do ClickUp'),
  termoPendente('Proposal Doc', 'Documentos e artefatos'),
  termoPendente('Proposta Comercial', 'Documentos e artefatos'),
  termoPendente('BANT', 'Jornada e etapas'),
  termoPendente('Pilar', 'Escopo e classificação'),
  termoPendente('CAVA', 'Escopo e classificação'),
  termoPendente('Cog Solutions', 'Ferramentas e ambientes'),
  termoPendente('ClickUp', 'Ferramentas e ambientes'),
  termoPendente('Kiro', 'Ferramentas e ambientes'),
];
