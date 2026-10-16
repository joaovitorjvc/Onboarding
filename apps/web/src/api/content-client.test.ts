import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isPageContent } from '@nuagehub/contracts';
import { HttpError } from './http-client';
import { clearPageCache, getPage } from './content-client';
import { pageFixture } from '../test-support/page-fixtures';

function response(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('cliente de conteúdo', () => {
  beforeEach(() => {
    clearPageCache();
    vi.restoreAllMocks();
  });

  it('valida o conteúdo, compartilha concorrência e mantém cache por slug', async () => {
    let calls = 0;
    const fetcher = vi.fn(async () => {
      calls += 1;
      await Promise.resolve();
      return response(pageFixture);
    });
    vi.stubGlobal('fetch', fetcher);

    const first = getPage('inicio');
    const second = getPage('inicio');
    expect(first).toBe(second);
    expect(isPageContent(await first)).toBe(true);
    await getPage('inicio');
    expect(calls).toBe(1);
  });

  it('preserva o Formato_de_Erro e sua correlação', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        response(
          {
            code: 'NOT_FOUND',
            message: 'Página não encontrada.',
            correlationId: '123e4567-e89b-12d3-a456-426614174000',
            status: 404,
          },
          404,
        ),
      ),
    );

    await expect(getPage('inicio')).rejects.toMatchObject({
      error: {
        code: 'NOT_FOUND',
        correlationId: '123e4567-e89b-12d3-a456-426614174000',
        status: 404,
      },
    });
  });

  it('converte resposta 2xx fora do contrato em UNEXPECTED_ERROR com o status recebido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response({ slug: 'inicio' }, 202)),
    );

    const error = await getPage('inicio').catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).error).toMatchObject({ code: 'UNEXPECTED_ERROR', status: 500 });
  });
});
