import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import schema from '../schemas/error-format.schema.json';
import { isErrorFormat, parse, serialize } from './error-format';
import { errorFormatArbitrary } from './test-support/error-format.arbitrary';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateWithAjv = ajv.compile(schema);

// Feature: project-standards, Property 22: Round-trip JSON do Formato_de_Erro
it('preserva objetos válidos no round-trip JSON', () => {
  fc.assert(
    fc.property(errorFormatArbitrary, (value) => {
      expect(parse(serialize(value))).toEqual(value);
    }),
    { numRuns: 100 },
  );
});

describe('isErrorFormat', () => {
  it('segue as mesmas regras do schema com AJV e ajv-formats', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        expect(isErrorFormat(value)).toBe(validateWithAjv(value));
      }),
      { numRuns: 100 },
    );
  });

  it('rejeita propriedades adicionais e JSON inválido', () => {
    const valid = {
      code: 'NOT_FOUND',
      message: 'Recurso não encontrado.',
      correlationId: '550e8400-e29b-41d4-a716-446655440000',
      status: 404,
    };
    expect(isErrorFormat({ ...valid, extra: true })).toBe(false);
    expect(() => parse('{')).toThrow('JSON');
  });
});
