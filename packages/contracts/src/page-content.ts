// Utilitários do Contrato_de_Conteudo (Spec legacy-migration, Req. 3.6 e 6.4).
// A guarda de tipo reproduz exatamente as regras de schemas/page-content.schema.json, sem dependência de runtime;
// um teste de propriedade confirma a equivalência com o ajv.
import type { Action, Block, IconName, PageContent, RichText, Route, SubtopicItem } from './generated/page-content';

export const ICON_NAMES: readonly IconName[] = [
  'arrow-right',
  'award',
  'book-open',
  'chevron-right',
  'circle-check',
  'clock',
  'compass',
  'external-link',
  'house',
  'layers',
  'receipt',
  'sparkles',
];
export const PAGE_SLUGS = ['inicio', 'primeiros-passos', 'plataformas', 'playbook'] as const;
export const ROUTES: readonly Route[] = ['/', '/primeiros-passos', '/plataformas', '/playbook'];

const HREF = /^https:\/\/[^\s]+$/u;
const CHECK_ID = /^[a-z][a-z0-9-]*$/u;
const TOPIC_NUMBER = /^[0-9]{2}$/u;

type Rec = Record<string, unknown>;

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
/** Objeto com chaves obrigatórias presentes e nenhuma chave fora de `allowed`. */
function shape(v: unknown, required: readonly string[], optional: readonly string[] = []): v is Rec {
  if (!isRec(v)) return false;
  const allowed = new Set([...required, ...optional]);
  return required.every((k) => k in v) && Object.keys(v).every((k) => allowed.has(k));
}
function isText(v: unknown): v is string {
  // minLength do JSON Schema conta pontos de código; para mínimo 1 basta não ser vazia.
  return typeof v === 'string' && v.length > 0;
}
function oneOf<T extends string>(v: unknown, values: readonly T[]): v is T {
  return typeof v === 'string' && (values as readonly string[]).includes(v);
}
function nonEmptyArray(v: unknown, item: (x: unknown) => boolean): boolean {
  return Array.isArray(v) && v.length > 0 && v.every(item);
}
function optional(v: Rec, key: string, check: (x: unknown) => boolean): boolean {
  return !(key in v) || check(v[key]);
}
const isHref = (v: unknown): boolean => typeof v === 'string' && HREF.test(v);
const isIcon = (v: unknown): boolean => oneOf(v, ICON_NAMES);

function isSpan(v: unknown): boolean {
  return (
    shape(v, ['text'], ['strong', 'emphasis', 'href']) &&
    isText(v.text) &&
    optional(v, 'strong', (x) => typeof x === 'boolean') &&
    optional(v, 'emphasis', (x) => typeof x === 'boolean') &&
    optional(v, 'href', isHref)
  );
}
export function isRichText(v: unknown): v is RichText {
  return nonEmptyArray(v, isSpan);
}
function isAction(v: unknown): v is Action {
  if (!shape(v, ['label', 'style'], ['to', 'href', 'icon'])) return false;
  const hasTo = 'to' in v;
  const hasHref = 'href' in v;
  return (
    isText(v.label) &&
    oneOf(v.style, ['primary', 'secondary', 'card']) &&
    hasTo !== hasHref &&
    optional(v, 'to', (x) => oneOf(x, ROUTES)) &&
    optional(v, 'href', isHref) &&
    optional(v, 'icon', isIcon)
  );
}
function isHero(v: unknown): boolean {
  return (
    shape(v, ['variant', 'title', 'description'], ['badge', 'eyebrow', 'actions']) &&
    oneOf(v.variant, ['home', 'page']) &&
    nonEmptyArray(v.title, isRichText) &&
    isRichText(v.description) &&
    optional(v, 'eyebrow', isText) &&
    optional(v, 'actions', (x) => Array.isArray(x) && x.every(isAction)) &&
    optional(v, 'badge', (b) => shape(b, ['text'], ['icon']) && isText(b.text) && optional(b, 'icon', isIcon))
  );
}
function isSubtopicItem(v: unknown): v is SubtopicItem {
  if (!isRec(v)) return false;
  switch (v.type) {
    case 'paragraph':
      return shape(v, ['type', 'text']) && isRichText(v.text);
    case 'bullets':
    case 'steps':
      return shape(v, ['type', 'items']) && nonEmptyArray(v.items, isRichText);
    case 'links':
      return (
        shape(v, ['type', 'items']) &&
        nonEmptyArray(
          v.items,
          (i) =>
            shape(i, ['title', 'description'], ['href']) &&
            isText(i.title) &&
            isText(i.description) &&
            optional(i, 'href', isHref),
        )
      );
    case 'cadence':
      return (
        shape(v, ['type', 'items']) &&
        nonEmptyArray(
          v.items,
          (i) => shape(i, ['day', 'action', 'detail']) && isText(i.day) && isText(i.action) && isText(i.detail),
        )
      );
    case 'script':
      return shape(v, ['type', 'text']) && isText(v.text);
    case 'actions':
      return shape(v, ['type', 'items']) && nonEmptyArray(v.items, isAction);
    default:
      return false;
  }
}
function isCard(v: unknown): boolean {
  return (
    shape(v, ['icon', 'accent', 'tag', 'title', 'subtitle', 'description', 'action']) &&
    isIcon(v.icon) &&
    oneOf(v.accent, ['blue', 'purple', 'teal']) &&
    isText(v.tag) &&
    isText(v.title) &&
    isText(v.subtitle) &&
    isRichText(v.description) &&
    isAction(v.action)
  );
}
function isChecklistItem(v: unknown): boolean {
  return (
    shape(v, ['id', 'day', 'title', 'description', 'defaultDone']) &&
    typeof v.id === 'string' &&
    CHECK_ID.test(v.id) &&
    isText(v.day) &&
    isText(v.title) &&
    isText(v.description) &&
    typeof v.defaultDone === 'boolean'
  );
}
function isBlock(v: unknown): v is Block {
  if (!isRec(v)) return false;
  switch (v.type) {
    case 'cards':
      return shape(v, ['type', 'cards']) && nonEmptyArray(v.cards, isCard);
    case 'checklist':
      return (
        shape(v, ['type', 'label', 'title', 'meta', 'items']) &&
        isText(v.label) &&
        isText(v.title) &&
        shape(v.meta, ['icon', 'text']) &&
        isIcon(v.meta.icon) &&
        isText(v.meta.text) &&
        nonEmptyArray(v.items, isChecklistItem)
      );
    case 'topic':
      return (
        shape(v, ['type', 'number', 'title', 'subtopics']) &&
        typeof v.number === 'string' &&
        TOPIC_NUMBER.test(v.number) &&
        isText(v.title) &&
        nonEmptyArray(
          v.subtopics,
          (s) => shape(s, ['title', 'content']) && isText(s.title) && nonEmptyArray(s.content, isSubtopicItem),
        )
      );
    default:
      return false;
  }
}

/** Verdadeiro se e somente se `value` respeita o Contrato_de_Conteudo. */
export function isPageContent(value: unknown): value is PageContent {
  return (
    shape(value, ['slug', 'documentTitle', 'navLabel', 'hero', 'blocks']) &&
    oneOf(value.slug, PAGE_SLUGS) &&
    isText(value.documentTitle) &&
    isText(value.navLabel) &&
    isHero(value.hero) &&
    Array.isArray(value.blocks) &&
    value.blocks.every(isBlock)
  );
}

/** Ids de checklist repetidos numa página (regra fora do JSON Schema). */
export function duplicateChecklistIds(page: PageContent): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const block of page.blocks) {
    if (block.type !== 'checklist') continue;
    for (const item of block.items) (seen.has(item.id) ? dup : seen).add(item.id);
  }
  return [...dup].sort();
}

export function parsePageContent(json: string): PageContent {
  const value: unknown = JSON.parse(json);
  if (!isPageContent(value)) throw new TypeError('Conteudo_de_Pagina inválido.');
  return value;
}

export function serializePageContent(page: PageContent): string {
  return JSON.stringify(page);
}
