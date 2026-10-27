import { PALETA } from '../dominio/estilo/contraste';

/** Cores: derivadas da fonte de verdade, nunca redigitadas. */
export const COR = PALETA;

/**
 * Espelho dos tokens que não são cor. Útil para valores computados em TypeScript.
 * `tokens.css` precisa conter exatamente os mesmos valores (testes/estilos conferem).
 */
export const TOKENS = {
  '--nuage-fonte-titulo': "'Montserrat', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  '--nuage-fonte-subtitulo': "'Montserrat', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  '--nuage-fonte-corpo': "'Inter', 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif",
  '--nuage-fonte-mono': "ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace",
  '--nuage-peso-titulo': '700',
  '--nuage-peso-subtitulo': '600',
  '--nuage-peso-medio': '500',
  '--nuage-peso-corpo': '400',
  '--nuage-escala-titulo-1': '2.25rem',
  '--nuage-escala-titulo-2': '1.5rem',
  '--nuage-escala-titulo-3': '1.125rem',
  '--nuage-escala-subtitulo': '1rem',
  '--nuage-escala-corpo': '0.9375rem',
  '--nuage-escala-apoio': '0.8125rem',
  '--nuage-escala-micro': '0.6875rem',
  '--nuage-escala-numero': '2rem',
  '--nuage-letra-sobretitulo': '0.08em',
  '--nuage-letra-rotulo': '0.02em',
  '--nuage-raio-nenhum': '0px',
  '--nuage-raio-pequeno': '6px',
  '--nuage-raio-medio': '8px',
  '--nuage-raio-grande': '12px',
  '--nuage-raio-pilula': '999px',
  '--nuage-espessura-borda': '1px',
  '--nuage-sombra-sutil': '0 1px 2px #070b2814',
  '--nuage-sombra-flutuante': '0 12px 32px #070b2824',
  '--nuage-espaco-1': '0.25rem',
  '--nuage-espaco-2': '0.5rem',
  '--nuage-espaco-3': '1rem',
  '--nuage-espaco-4': '1.5rem',
  '--nuage-espaco-5': '2rem',
  '--nuage-espaco-6': '3rem',
  '--nuage-largura-barra-lateral': '16rem',
  '--nuage-largura-barra-lateral-recolhida': '4.5rem',
  '--nuage-foco-espessura': '3px',
  '--nuage-foco-deslocamento': '2px',
} as const;

/** Raios autorizados, na ordem da escala. */
export const RAIOS_AUTORIZADOS = ['0px', '6px', '8px', '12px', '999px'] as const;
