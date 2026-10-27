import type { ReactNode } from 'react';
import type { Conteudo, Origem } from '../../dominio/conteudo/tipos';
import { MarcacaoPendencia } from './MarcacaoPendencia';
import { Selo } from './Selo';

function descreverOrigem(origem: Origem): { fonte: string; referencia: string } {
  return origem.tipo === 'confirmacao-gestor'
    ? { fonte: 'Gestor', referencia: origem.referencia }
    : { fonte: 'Cog Solutions', referencia: origem.caminho };
}

/** Único ponto de despacho entre conteúdo confirmado e pendente: exclusão mútua garantida. */
export function ValorConteudo<T>({
  conteudo,
  children,
}: {
  conteudo: Conteudo<T>;
  children: (valor: T) => ReactNode;
}): ReactNode {
  if (conteudo.estado === 'pendente') {
    return <MarcacaoPendencia descricao={conteudo.pendencia.descricao} requisito={conteudo.pendencia.requisito} />;
  }
  const { fonte, referencia } = descreverOrigem(conteudo.origem);
  return (
    <>
      {children(conteudo.valor)}
      <p className="nuage-origem">
        <Selo variante="informativo">{fonte}</Selo>
        <span className="nuage-origem__referencia">{referencia}</span>
      </p>
    </>
  );
}
