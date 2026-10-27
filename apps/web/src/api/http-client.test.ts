import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { errorFormatArbitrary } from '../../../../packages/contracts/src/test-support/error-format.arbitrary';
import { isErrorFormat } from '@nuagehub/contracts';
import { createHttpClient, HttpError, normalizeError } from './http-client';

describe('cliente HTTP', () => {
  it('converte payload inválido e preserva status e correlação válida', () => {
    const correlationId = '123e4567-e89b-12d3-a456-426614174000';

    expect(normalizeError(503, '<html>indisponível</html>', { 'x-correlation-id': correlationId })).toEqual({
      code: 'UNEXPECTED_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
      correlationId,
      status: 503,
    });
  });

  it('retorna o Formato_de_Erro já válido sem alterá-lo', () => {
    const payload = {
      code: 'NOT_FOUND',
      message: 'Recurso não encontrado.',
      correlationId: '123e4567-e89b-12d3-a456-426614174000',
      status: 404,
    };

    expect(normalizeError(404, payload, {})).toBe(payload);
  });

  it('lança HttpError normalizado para resposta HTTP não bem-sucedida', async () => {
    const client = createHttpClient(
      async () =>
        new Response(JSON.stringify({ erro: 'indisponível' }), {
          status: 503,
          headers: { 'content-type': 'application/json', 'x-correlation-id': '123e4567-e89b-12d3-a456-426614174000' },
        }),
      'http://localhost',
    );

    await expect(client.GET('/api/v1/health')).rejects.toBeInstanceOf(HttpError);
  });

  // Feature: project-standards, Property 23: Normalização de erro no cliente web
  it('retorna sempre um Formato_de_Erro válido para qualquer status e payload', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 1_000 }),
        fc.oneof(errorFormatArbitrary, fc.anything()),
        fc.uuid(),
        (status, payload, correlationId) => {
          const normalized = normalizeError(status, payload, { 'x-correlation-id': correlationId });

          expect(isErrorFormat(normalized)).toBe(true);
          if (isErrorFormat(payload)) {
            expect(normalized).toBe(payload);
          } else {
            expect(normalized.code).toBe('UNEXPECTED_ERROR');
            expect(normalized.status).toBe(status >= 400 && status <= 599 ? status : 500);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
