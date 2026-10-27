import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ehIdModulo, rotaSecao } from '../../dominio/conteudo/rotas';
import type { ModuloOrigem } from '../../servicos/contrato-chat';

export function ReferenciaModulo({ origem }: { origem: ModuloOrigem }): ReactNode {
  const rotulo = `${origem.tituloModulo} — ${origem.tituloSecao}`;
  if (!ehIdModulo(origem.idModulo)) return <span>{rotulo}</span>;
  return <Link to={rotaSecao(origem.idModulo, origem.idSecao)}>{rotulo}</Link>;
}
