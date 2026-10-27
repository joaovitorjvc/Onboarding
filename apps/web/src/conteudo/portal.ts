/**
 * Nome exibido do portal: título da aba, marca da barra lateral, H1 do Início e sufixo dos títulos de página.
 * Para renomear o portal, altere apenas esta constante e o <title> de index.html.
 */
export const NOME_DO_PORTAL = 'Nuage It Plataforma de Onboarding';

/** Marca exibida no topo da barra lateral e o subtítulo logo abaixo dela. */
export const MARCA_DO_PORTAL = 'NuageIT';
export const SUBTITULO_DA_MARCA = 'Plataforma de Onboarding';

/** Monta o título do documento de uma página. */
export function tituloDaPagina(pagina: string): string {
  return `${pagina} — ${NOME_DO_PORTAL}`;
}
