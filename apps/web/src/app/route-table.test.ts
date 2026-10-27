import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { resolveRoute } from './route-table';
import type { PageSlug, Route } from '@nuagehub/contracts';

const pages: Array<[Route, PageSlug]> = [
  ['/', 'inicio'],
  ['/primeiros-passos', 'primeiros-passos'],
  ['/plataformas', 'plataformas'],
  ['/playbook', 'playbook'],
];
const legacy: Array<[string, Route]> = [
  ['/index.html', '/'],
  ['/primeiros-passos.html', '/primeiros-passos'],
  ['/plataformas.html', '/plataformas'],
  ['/playbook.html', '/playbook'],
];

describe('resolveRoute', () => {
  // Feature: legacy-migration, Property 3: Resolução de rotas
  it('normaliza rotas canônicas e redireciona URLs legadas', () => {
    fc.assert(
      fc.property(fc.constantFrom(...pages), fc.boolean(), ([route, slug], trailing) => {
        const path = `${route}${trailing && route !== '/' ? '/' : ''}`.toUpperCase();
        expect(resolveRoute(path)).toEqual({ kind: 'page', slug });
      }),
      { numRuns: 100 },
    );
    fc.assert(
      fc.property(fc.constantFrom(...legacy), ([path, to]) => {
        expect(resolveRoute(path.toUpperCase())).toEqual({ kind: 'redirect', to });
      }),
      { numRuns: 100 },
    );
  });

  it('retorna not-found para caminhos desconhecidos', () => {
    expect(resolveRoute('/nao-existe')).toEqual({ kind: 'not-found' });
    expect(resolveRoute('/playbook.html/outro')).toEqual({ kind: 'not-found' });
  });
});
