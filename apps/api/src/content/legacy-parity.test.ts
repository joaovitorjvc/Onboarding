import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadPages } from './content-loader';

const pages = [
  ['inicio', 'index.html'],
  ['primeiros-passos', 'primeiros-passos.html'],
  ['plataformas', 'plataformas.html'],
  ['playbook', 'playbook.html'],
] as const;

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/gu, '&')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;|&apos;/gu, "'")
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&nbsp;/gu, ' ');
}

function normalize(value: string): string {
  return decodeEntities(value).replace(/\s+/gu, ' ').trim();
}

function legacyFragments(fileName: string): string[] {
  const html = readFileSync(resolve(__dirname, '../../../..', fileName), 'utf8')
    .replace(/<head>[\s\S]*?<\/head>/giu, '')
    .replace(/<script[\s\S]*?<\/script>/giu, '')
    .replace(/<!--[\s\S]*?-->/gu, '')
    .replace(/<[^>]+>/gu, '|');
  return html
    .split('|')
    .map(normalize)
    .filter((fragment) => fragment.length > 0);
}

function contentText(value: unknown, key = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => contentText(item, key));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([childKey, child]) => contentText(child, childKey));
  }
  if (
    typeof value === 'string' &&
    !['href', 'to', 'id', 'icon', 'accent', 'style', 'type', 'variant', 'slug', 'documentTitle', 'navLabel'].includes(
      key,
    )
  )
    return [value];
  return [];
}

const commonFragments = new Set([
  'Nuage',
  'Hub',
  'Página Inicial',
  'Primeiros passos',
  'Plataformas',
  'Playbook',
  'Novo SDR',
  '© 2026 NuageIT • Portal de Integração & Rampa de Novos Colaboradores',
]);

describe('paridade textual do Site_Legado', () => {
  it.each(pages)('mantém os textos de %s no conteúdo estruturado', (slug, fileName) => {
    const page = loadPages().find((item) => item.slug === slug);
    if (!page) throw new Error(`Página não carregada: ${slug}`);
    const legacy = legacyFragments(fileName);
    const structured = contentText(page).join(' ');

    for (const fragment of legacy) {
      if (commonFragments.has(fragment) || fragment.length < 3) continue;
      expect(structured).toContain(fragment);
    }
    for (const fragment of contentText(page)
      .map(normalize)
      .filter((item) => item.length >= 3)) {
      if (commonFragments.has(fragment)) continue;
      expect(legacy.join(' ')).toContain(fragment);
    }
  });
});
