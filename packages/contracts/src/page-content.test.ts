import Ajv from 'ajv/dist/2020';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import schema from '../schemas/page-content.schema.json';
import { duplicateChecklistIds, isPageContent, parsePageContent, serializePageContent } from './page-content';
import { pageContentArbitrary, pageContentMutationArbitrary } from './test-support/page-content.arbitrary';

const ajv = new Ajv({
  allErrors: true,
  strict: true,
  strictRequired: false,
  strictTypes: false,
});
const validateWithAjv = ajv.compile(schema);

// Feature: legacy-migration, Property 1: Round-trip do Conteudo_de_Pagina
it('preserva Conteudo_de_Pagina válido no round-trip JSON', () => {
  fc.assert(
    fc.property(pageContentArbitrary, (page) => {
      expect(parsePageContent(serializePageContent(page))).toEqual(page);
    }),
    { numRuns: 100 },
  );
});

// Feature: legacy-migration, Property 2: Guarda de tipo equivalente ao schema
it('mantém isPageContent equivalente ao AJV para valores válidos e mutados', () => {
  fc.assert(
    fc.property(fc.oneof(pageContentArbitrary, pageContentMutationArbitrary), (value) => {
      expect(isPageContent(value)).toBe(validateWithAjv(value));
    }),
    { numRuns: 100 },
  );
});

describe('gerador de mutações do contrato', () => {
  it('gera somente valores rejeitados pelo schema', () => {
    fc.assert(
      fc.property(pageContentMutationArbitrary, (value) => {
        expect(validateWithAjv(value)).toBe(false);
        expect(isPageContent(value)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

describe('utilitários do Conteudo_de_Pagina', () => {
  it('identifica ids de checklist duplicados', () => {
    const page = fc.sample(pageContentArbitrary, { numRuns: 1 })[0];
    expect(page).toBeDefined();
    if (!page) return;

    const duplicated = structuredClone(page);
    const checklist = duplicated.blocks.find((block) => block.type === 'checklist');
    expect(checklist).toBeDefined();
    if (!checklist || checklist.type !== 'checklist') return;

    checklist.items[1]!.id = checklist.items[0]!.id;
    expect(duplicateChecklistIds(duplicated)).toEqual([checklist.items[0]!.id]);
  });

  it('lança ao analisar JSON que viola o contrato', () => {
    expect(() => parsePageContent(JSON.stringify({ documentTitle: '' }))).toThrow(TypeError);
  });
});
