import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { clearPageCache } from '../../api/content-client';
import { ContentPage } from './ContentPage';
import { pageFixture } from '../../test-support/page-fixtures';

function renderPage(): void {
  render(
    <MemoryRouter>
      <ContentPage slug="inicio" />
    </MemoryRouter>,
  );
}

describe('ContentPage', () => {
  beforeEach(() => {
    clearPageCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe carregamento, erro com correlação e permite tentar novamente', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: 'Serviço temporariamente indisponível.',
            correlationId: '123e4567-e89b-12d3-a456-426614174000',
            status: 500,
          }),
          { status: 500, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(pageFixture), { status: 200 }));
    vi.stubGlobal('fetch', fetcher);

    renderPage();
    expect(screen.getByText('Carregando conteúdo…')).toBeTruthy();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Código de correlação: 123e4567-e89b-12d3-a456-426614174000');

    screen.getByRole('button', { name: 'Tentar novamente' }).click();
    await waitFor(() => expect(screen.getByRole('heading', { name: /sua jornada/i })).toBeTruthy());
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
