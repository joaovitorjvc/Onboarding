import fc from 'fast-check';
import type { ErrorDetail, ErrorFormat } from '../generated/error-format';

const errorDetailArbitrary: fc.Arbitrary<ErrorDetail> = fc.record({
  field: fc.string(),
  issue: fc.string(),
});

const requiredErrorFormatArbitrary: fc.Arbitrary<ErrorFormat> = fc.record({
  code: fc.stringMatching(/^[A-Z][A-Z0-9_]{2,63}$/),
  message: fc.string({ minLength: 1, maxLength: 500 }),
  correlationId: fc.uuid(),
  status: fc.integer({ min: 400, max: 599 }),
});

/** Gerador derivado das restrições do schema/error-format.schema.json. */
export const errorFormatArbitrary: fc.Arbitrary<ErrorFormat> = fc.oneof(
  requiredErrorFormatArbitrary,
  fc.record({
    code: fc.stringMatching(/^[A-Z][A-Z0-9_]{2,63}$/),
    message: fc.string({ minLength: 1, maxLength: 500 }),
    correlationId: fc.uuid(),
    status: fc.integer({ min: 400, max: 599 }),
    details: fc.array(errorDetailArbitrary),
  }),
);
