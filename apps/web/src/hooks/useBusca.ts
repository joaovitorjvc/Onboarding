import { useMemo, useState } from 'react';
import { buscar, type ResultadoBusca } from '../dominio/busca/buscar';
import { criarIndice } from '../dominio/busca/indice';
import type { Modulo } from '../dominio/conteudo/tipos';

export interface BuscaApi {
  campo: string;
  definirCampo(valor: string): void;
  enviar(): void;
  /** Último resultado válido; um termo curto preserva a lista anterior. */
  resultado: Extract<ResultadoBusca, { tipo: 'resultados' }> | null;
  termoInvalido: 'curto' | 'longo' | null;
}

export function useBusca(trilha: readonly Modulo[]): BuscaApi {
  const indice = useMemo(() => criarIndice(trilha), [trilha]);
  const [campo, definirCampo] = useState('');
  const [resultado, setResultado] = useState<BuscaApi['resultado']>(null);
  const [termoInvalido, setTermoInvalido] = useState<BuscaApi['termoInvalido']>(null);

  const enviar = (): void => {
    const encontrado = buscar(indice, campo);
    if (encontrado.tipo === 'termo-invalido') {
      setTermoInvalido(encontrado.motivo);
      return;
    }
    setTermoInvalido(null);
    setResultado(encontrado);
  };

  return { campo, definirCampo, enviar, resultado, termoInvalido };
}
