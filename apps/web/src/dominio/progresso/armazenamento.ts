import { interpretarRegistro, registroVazio } from './esquema';
import type { RegistroProgresso } from './tipos';

export const CHAVE_PROGRESSO = 'onboarding-solutions:progresso:v1';

/** Subconjunto de `Storage` usado pelo domínio; permite injetar um armazenamento em memória. */
export interface Armazenamento {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
  removeItem(chave: string): void;
}

export interface LeituraProgresso {
  /** Verdadeiro quando o armazenamento está indisponível: o progresso é exibido como vazio. */
  somenteLeitura: boolean;
  registro: RegistroProgresso;
}

export interface ResultadoGravacao {
  ok: boolean;
  /** Registro adotado pela interface: o novo em caso de sucesso, o anterior em caso de falha. */
  registro: RegistroProgresso;
}

export function lerProgresso(armazenamento: Armazenamento | null, agora: string): LeituraProgresso {
  if (armazenamento === null) return { somenteLeitura: true, registro: registroVazio(agora) };
  try {
    return { somenteLeitura: false, registro: interpretarRegistro(armazenamento.getItem(CHAVE_PROGRESSO), agora) };
  } catch {
    return { somenteLeitura: true, registro: registroVazio(agora) };
  }
}

/** Leitura-modificação-escrita do documento inteiro. Falha de gravação devolve o estado anterior. */
export function atualizarProgresso(
  armazenamento: Armazenamento | null,
  agora: string,
  mutar: (atual: RegistroProgresso) => RegistroProgresso,
): ResultadoGravacao {
  let anterior = registroVazio(agora);
  if (armazenamento === null) return { ok: false, registro: anterior };
  try {
    anterior = interpretarRegistro(armazenamento.getItem(CHAVE_PROGRESSO), agora);
    const novo = mutar(anterior);
    armazenamento.setItem(CHAVE_PROGRESSO, JSON.stringify(novo));
    return { ok: true, registro: novo };
  } catch {
    return { ok: false, registro: anterior };
  }
}

export function reiniciarProgresso(armazenamento: Armazenamento | null, agora: string): ResultadoGravacao {
  if (armazenamento === null) return { ok: false, registro: registroVazio(agora) };
  try {
    armazenamento.removeItem(CHAVE_PROGRESSO);
    return { ok: true, registro: registroVazio(agora) };
  } catch {
    return { ok: false, registro: lerProgresso(armazenamento, agora).registro };
  }
}
