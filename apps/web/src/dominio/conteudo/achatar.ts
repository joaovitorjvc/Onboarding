import type { Conteudo, Secao } from './tipos.ts';

export interface TextoAchatado {
  texto: string;
  pendente: boolean;
  /** Descrição da pendência quando o nó está pendente. Nunca contém valor especulativo. */
  descricaoPendencia: string | null;
}

export function achatarConteudo<T>(conteudo: Conteudo<T>, achatar: (valor: T) => string): TextoAchatado {
  if (conteudo.estado === 'pendente') {
    return { texto: '', pendente: true, descricaoPendencia: conteudo.pendencia.descricao };
  }
  return { texto: achatar(conteudo.valor), pendente: false, descricaoPendencia: null };
}

export function achatarSecao(secao: Secao): TextoAchatado {
  switch (secao.tipo) {
    case 'texto':
    case 'passos':
    case 'referencias':
    case 'formula':
    case 'modelo-de-prompt':
      return achatarConteudo(secao.conteudo, (valor) => valor.join('\n'));
    case 'topicos':
      return achatarConteudo(secao.conteudo, (valor) =>
        valor
          .map((item) =>
            [item.titulo, ...item.paragrafos, ...(item.itens ? [item.itens.rotulo, ...item.itens.itens] : [])].join(
              '\n',
            ),
          )
          .join('\n'),
      );
    case 'lista':
      return achatarConteudo(secao.conteudo, (valor) =>
        valor.map((item) => `${item.rotulo}: ${item.descricao}`).join('\n'),
      );
    case 'comparativa':
      return achatarConteudo(secao.conteudo, (valor) =>
        [
          valor.colunas.join(' | '),
          ...valor.linhas.map((linha) => `${linha.rotulo} | ${linha.valores.join(' | ')}`),
        ].join('\n'),
      );
    case 'checklist':
      return achatarConteudo(secao.conteudo, (valor) =>
        valor.map((item) => `${item.rotulo}: ${item.descricao}`).join('\n'),
      );
    case 'banco-perguntas':
      return achatarConteudo(secao.conteudo, (valor) =>
        valor.map((item) => `${item.pilar}: ${item.perguntas.join(' ')}`).join('\n'),
      );
  }
}
