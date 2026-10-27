import { normalizar } from '../busca/normalizar.ts';
import type { Conteudo } from '../conteudo/tipos.ts';

export const CATEGORIAS_GLOSSARIO = [
  'Papéis do processo',
  'Jornada e etapas',
  'Filas e listas do ClickUp',
  'Documentos e artefatos',
  'Escopo e classificação',
  'Ferramentas e ambientes',
  'Esta plataforma',
] as const;

export type CategoriaGlossario = (typeof CATEGORIAS_GLOSSARIO)[number];

export interface EntradaGlossario {
  termo: string;
  categoria: CategoriaGlossario;
  definicao: Conteudo<string>;
}

/** Ordenação alfabética estável sobre o termo normalizado. */
export function ordenarGlossario(entradas: readonly EntradaGlossario[]): EntradaGlossario[] {
  return [...entradas].sort((a, b) => normalizar(a.termo).localeCompare(normalizar(b.termo), 'pt-BR'));
}

export function termosDuplicados(entradas: readonly EntradaGlossario[]): string[] {
  const vistos = new Set<string>();
  const duplicados = new Set<string>();
  for (const entrada of entradas) {
    const chave = normalizar(entrada.termo);
    if (vistos.has(chave)) duplicados.add(entrada.termo);
    vistos.add(chave);
  }
  return [...duplicados];
}
