import { useState } from 'react';
import { decidirTriagem } from '../dominio/triagem/decidir';
import { PROVIDERS, type EntradaTriagem, type Provider, type ResultadoTriagem } from '../dominio/triagem/tipos';

export interface TriagemApi {
  entrada: EntradaTriagem;
  resultado: ResultadoTriagem | null;
  definirProvider(valor: string): void;
  definirMigracao(valor: string): void;
  decidir(): void;
}

function ehProvider(valor: string): valor is Provider {
  return (PROVIDERS as readonly string[]).includes(valor);
}

/** A triagem não persiste nada: o estado vive apenas no componente. */
export function useTriagem(): TriagemApi {
  const [entrada, setEntrada] = useState<EntradaTriagem>({});
  const [resultado, setResultado] = useState<ResultadoTriagem | null>(null);

  return {
    entrada,
    resultado,
    definirProvider: (valor) => {
      const { provider: _anterior, ...resto } = entrada;
      setEntrada(ehProvider(valor) ? { ...resto, provider: valor } : resto);
    },
    definirMigracao: (valor) => {
      const { migracao: _anterior, ...resto } = entrada;
      setEntrada(
        valor === 'sim' ? { ...resto, migracao: true } : valor === 'nao' ? { ...resto, migracao: false } : resto,
      );
    },
    decidir: () => setResultado(decidirTriagem(entrada)),
  };
}
