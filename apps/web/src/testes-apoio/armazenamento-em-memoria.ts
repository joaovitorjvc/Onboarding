import type { Armazenamento } from '../dominio/progresso/armazenamento';

/** Armazenamento em memória para testes, com falhas injetáveis. */
export class ArmazenamentoEmMemoria implements Armazenamento {
  readonly dados = new Map<string, string>();
  falharGravacao = false;
  falharLeitura = false;
  gravacoes = 0;

  getItem(chave: string): string | null {
    if (this.falharLeitura) throw new Error('leitura indisponível');
    return this.dados.get(chave) ?? null;
  }

  setItem(chave: string, valor: string): void {
    if (this.falharGravacao) throw new Error('cota excedida');
    this.gravacoes += 1;
    this.dados.set(chave, valor);
  }

  removeItem(chave: string): void {
    this.dados.delete(chave);
  }
}
