import type { Conteudo, IdModulo, Modulo, Origem, PosicaoModulo, Secao } from '../dominio/conteudo/tipos.ts';

export function origemGestor(referencia: string): Origem {
  return { tipo: 'confirmacao-gestor', referencia };
}

export function origemCogSolutions(caminho: string): Origem {
  return { tipo: 'material-cog-solutions', caminho };
}

export function confirmado<T>(valor: T, referencia: string): Conteudo<T> {
  return { estado: 'confirmado', valor, origem: origemGestor(referencia) };
}

export function confirmadoDoCog<T>(valor: T, caminho: string): Conteudo<T> {
  return { estado: 'confirmado', valor, origem: origemCogSolutions(caminho) };
}

/** Nó pendente: substitui o valor e nunca carrega texto especulativo. */
export function pendente(id: string, descricao: string, requisito: string): Conteudo<never> {
  return { estado: 'pendente', pendencia: { id, descricao, requisito } };
}

const REQUISITO_PADRAO = 'Confirmação do conteúdo oficial pelo Gestor da área de Soluções.';

/** Seção cujo conteúdo ainda aguarda confirmação. O ID e o título já são estáveis. */
export function secaoPendente(tipo: Secao['tipo'], id: string, titulo: string): Secao {
  const conteudo = pendente(`${id}-pendente`, `Conteúdo da seção "${titulo}" ainda não confirmado.`, REQUISITO_PADRAO);
  return { tipo, id, titulo, conteudo } as Secao;
}

export function criarModulo(id: IdModulo, posicao: PosicaoModulo, titulo: string, secoes: readonly Secao[]): Modulo {
  return {
    id,
    posicao,
    titulo,
    resumo: pendente(`${id}-resumo`, `Resumo do módulo "${titulo}" ainda não confirmado.`, REQUISITO_PADRAO),
    requisitos: [],
    origem: pendente(`${id}-origem`, `Origem do módulo "${titulo}" ainda não registrada.`, REQUISITO_PADRAO),
    secoes,
  };
}
