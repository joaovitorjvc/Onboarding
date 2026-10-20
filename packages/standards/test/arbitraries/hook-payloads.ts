import fc from 'fast-check';

export const safeContentArbitrary = fc.constantFrom('linha segura', 'primeira\nsegunda', 'conteúdo sem achados');

export const editOperationArbitrary = fc.record({
  oldValue: fc.constantFrom('linha', 'antigo', 'valor'),
  newValue: fc.constantFrom('novo', 'substituído', 'valor atualizado'),
  replaceAll: fc.boolean(),
});

export const insertOperationArbitrary = fc.record({
  content: fc.constantFrom('adicionado', 'linha extra', 'novo conteúdo'),
  insertLine: fc.option(fc.integer({ min: 0, max: 4 }), { nil: undefined }),
});

export const malformedPayloadArbitrary = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.boolean(),
  fc.integer(),
  fc.string(),
  fc.array(fc.jsonValue(), { maxLength: 4 }),
  fc.record({ unrelated: fc.jsonValue() }),
);
