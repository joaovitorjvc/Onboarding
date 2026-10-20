import type { PageSlug, Route } from '@nuagehub/contracts';

export type RouteResolution =
  { kind: 'page'; slug: PageSlug } | { kind: 'redirect'; to: Route } | { kind: 'not-found' };

const canonicalRoutes: Record<string, PageSlug> = {
  '/': 'inicio',
  '/primeiros-passos': 'primeiros-passos',
  '/plataformas': 'plataformas',
  '/playbook': 'playbook',
};

const legacyRoutes: Record<string, Route> = {
  '/index.html': '/',
  '/primeiros-passos.html': '/primeiros-passos',
  '/plataformas.html': '/plataformas',
  '/playbook.html': '/playbook',
};

export function resolveRoute(path: string): RouteResolution {
  const rawPath = path.split(/[?#]/u, 1)[0] || '/';
  const normalizedPath = rawPath.length > 1 ? rawPath.replace(/\/+$/u, '').toLowerCase() : '/';
  const slug = canonicalRoutes[normalizedPath];
  if (slug) return { kind: 'page', slug };
  const redirect = legacyRoutes[normalizedPath];
  if (redirect) return { kind: 'redirect', to: redirect };
  return { kind: 'not-found' };
}
