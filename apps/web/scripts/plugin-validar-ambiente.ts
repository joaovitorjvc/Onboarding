import type { Plugin } from 'vite';

/** Devolve a mensagem de erro, ou `null` quando o valor é uma URL absoluta http(s). */
export function validarUrlServicoChat(valor: string | undefined): string | null {
  if (valor === undefined || valor.trim().length === 0) {
    return 'VITE_URL_SERVICO_CHAT está ausente ou vazia. Copie .env.example para .env e informe a URL do Serviço de Chat.';
  }
  try {
    const url = new URL(valor.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'VITE_URL_SERVICO_CHAT deve usar o esquema http ou https.';
    }
  } catch {
    return 'VITE_URL_SERVICO_CHAT deve ser uma URL absoluta válida.';
  }
  return null;
}

/** Interrompe o build quando a variável do Serviço de Chat está ausente ou inválida. */
export function pluginValidarAmbiente(): Plugin {
  return {
    name: 'onboarding-validar-ambiente',
    apply: 'build',
    configResolved(config) {
      const erro = validarUrlServicoChat(config.env['VITE_URL_SERVICO_CHAT'] as string | undefined);
      if (erro !== null) throw new Error(erro);
    },
  };
}
