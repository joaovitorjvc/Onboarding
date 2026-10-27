export interface SecaoCorpus {
  id: string;
  titulo: string;
  texto: string;
  pendente: boolean;
}

export interface ModuloCorpus {
  id: string;
  posicao: number;
  titulo: string;
  secoes: readonly SecaoCorpus[];
}

export interface TermoCorpus {
  termo: string;
  definicao: string;
}

export interface CorpusChat {
  versaoCorpus: 1;
  versaoConteudo: string;
  geradoEm: string;
  modulos: readonly ModuloCorpus[];
  glossario: readonly TermoCorpus[];
}

export const LIMITE_TOKENS_CORPUS = 60_000;
