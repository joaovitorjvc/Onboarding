/** Fonte de verdade da paleta do Design System NuageIT. `estilos/tokens.css` a espelha (conferido por teste). */
export const PALETA: Readonly<Record<string, string>> = {
  '--nuage-pink': '#ff0073',
  '--nuage-deep-blue': '#000a80',
  '--nuage-blue': '#003fb4',
  '--nuage-purple': '#7c1475',
  '--nuage-black': '#0c0c0c',
  '--nuage-white': '#fbfbfb',
  '--nuage-pink-deep': '#e30068',
  '--nuage-navy-900': '#070b28',
  '--nuage-navy-800': '#0d1338',
  '--nuage-navy-700': '#1a2150',
  '--nuage-surface': '#ffffff',
  '--nuage-neutral-50': '#f7f8fa',
  '--nuage-neutral-100': '#eef0f4',
  '--nuage-neutral-200': '#e2e5ec',
  '--nuage-ink-900': '#141a35',
  '--nuage-ink-700': '#2a3149',
  '--nuage-neutral-600': '#5b6478',
  '--nuage-neutral-400': '#98a0b3',
  '--nuage-pink-soft': '#ffe4ef',
  '--nuage-purple-soft': '#f4e9f3',
  '--nuage-blue-soft': '#e7eefb',
};

function canal(valor: number): number {
  const c = valor / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminanciaRelativa(hex: string): number {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razão de contraste WCAG 2.1. */
export function razaoContraste(a: string, b: string): number {
  const la = luminanciaRelativa(a);
  const lb = luminanciaRelativa(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
