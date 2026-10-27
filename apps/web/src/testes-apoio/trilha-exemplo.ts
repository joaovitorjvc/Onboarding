import { confirmado } from '../conteudo/apoio';
import { TRILHA } from '../conteudo/trilha';
import type { Modulo, Secao } from '../dominio/conteudo/tipos';

const FONTE = 'teste';

const secoes: readonly Secao[] = [
  { tipo: 'texto', id: 's-texto', titulo: 'Texto de exemplo', conteudo: confirmado(['Parágrafo de exemplo.'], FONTE) },
  {
    tipo: 'lista',
    id: 's-lista',
    titulo: 'Lista de exemplo',
    conteudo: confirmado([{ rotulo: 'Item A', descricao: 'Descrição A' }], FONTE),
  },
  { tipo: 'passos', id: 's-passos', titulo: 'Passos de exemplo', conteudo: confirmado(['Primeiro', 'Segundo'], FONTE) },
  {
    tipo: 'comparativa',
    id: 's-comparativa',
    titulo: 'Comparativa de exemplo',
    conteudo: confirmado(
      { colunas: ['Critério', 'Interno', 'Externo'], linhas: [{ rotulo: 'Público', valores: ['Equipe', 'Cliente'] }] },
      FONTE,
    ),
  },
  {
    tipo: 'checklist',
    id: 's-checklist',
    titulo: 'Checklist de exemplo',
    conteudo: confirmado(
      [
        { id: 'clickup', rotulo: 'Acesso ao ClickUp', descricao: 'Solicitado' },
        { id: 'kiro', rotulo: 'Acesso ao Kiro', descricao: 'Solicitado' },
      ],
      FONTE,
    ),
  },
  {
    tipo: 'banco-perguntas',
    id: 's-banco',
    titulo: 'Banco de exemplo',
    conteudo: confirmado([{ pilar: 'Cloud', perguntas: ['Qual a região?'] }], FONTE),
  },
  {
    tipo: 'referencias',
    id: 's-referencias',
    titulo: 'Referências de exemplo',
    conteudo: confirmado(['docs/exemplo/arquivo.md'], FONTE),
  },
  {
    tipo: 'formula',
    id: 's-formula',
    titulo: 'Fórmula de exemplo',
    conteudo: confirmado(['custo = horas × valor_hora'], FONTE),
  },
  {
    tipo: 'modelo-de-prompt',
    id: 's-prompt',
    titulo: 'Prompt de exemplo',
    conteudo: confirmado(['Prompt base\n  com indentação <tag> & "aspas"'], FONTE),
  },
  {
    tipo: 'texto',
    id: 's-pendente',
    titulo: 'Seção pendente de exemplo',
    conteudo: {
      estado: 'pendente',
      pendencia: {
        id: 'exemplo-pendente',
        descricao: 'Descrição pendente de exemplo',
        requisito: 'Requisito de exemplo',
      },
    },
  },
];

const moduloExemplo: Modulo = { ...TRILHA[0], secoes };

/** Trilha real com o Módulo 1 trocado por uma versão que exercita as nove variantes de seção. */
export const TRILHA_EXEMPLO: readonly Modulo[] = [moduloExemplo, ...TRILHA.slice(1)];
