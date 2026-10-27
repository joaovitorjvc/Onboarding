import { ehIdModulo } from '../conteudo/rotas';
import type { IdModulo } from '../conteudo/tipos';
import type { EstadoModulo, RegistroProgresso } from './tipos';

export function registroVazio(agora: string): RegistroProgresso {
  return { versaoSchema: 1, modulos: {}, checklists: {}, atualizadoEm: agora };
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * Leitura tolerante: nunca lança.
 * JSON inválido ou versão desconhecida descartam o documento; IDs ou itens inválidos descartam só a entrada.
 */
export function interpretarRegistro(bruto: string | null, agora: string): RegistroProgresso {
  if (bruto === null) return registroVazio(agora);
  let valor: unknown;
  try {
    valor = JSON.parse(bruto);
  } catch {
    return registroVazio(agora);
  }
  if (!ehObjeto(valor) || valor['versaoSchema'] !== 1) return registroVazio(agora);

  const modulos: Partial<Record<IdModulo, EstadoModulo>> = {};
  const brutoModulos = valor['modulos'];
  if (ehObjeto(brutoModulos)) {
    for (const [chave, estado] of Object.entries(brutoModulos)) {
      if (
        ehIdModulo(chave) &&
        ehObjeto(estado) &&
        typeof estado['concluido'] === 'boolean' &&
        typeof estado['atualizadoEm'] === 'string'
      ) {
        modulos[chave] = { concluido: estado['concluido'], atualizadoEm: estado['atualizadoEm'] };
      }
    }
  }

  const checklists: Partial<Record<IdModulo, Record<string, boolean>>> = {};
  const brutoChecklists = valor['checklists'];
  if (ehObjeto(brutoChecklists)) {
    for (const [chave, itens] of Object.entries(brutoChecklists)) {
      if (!ehIdModulo(chave) || !ehObjeto(itens)) continue;
      const validos: Record<string, boolean> = {};
      for (const [idItem, marcado] of Object.entries(itens)) {
        if (typeof marcado === 'boolean') validos[idItem] = marcado;
      }
      checklists[chave] = validos;
    }
  }

  const atualizadoEm = typeof valor['atualizadoEm'] === 'string' ? valor['atualizadoEm'] : agora;
  return { versaoSchema: 1, modulos, checklists, atualizadoEm };
}
