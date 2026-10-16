import type { PageSlug } from '@nuagehub/contracts';
import { isPageContent } from '@nuagehub/contracts';
import { httpClient, HttpError, normalizeError } from './http-client';
import type { PageContent } from '@nuagehub/contracts';

const pageCache = new Map<PageSlug, PageContent>();
const pendingRequests = new Map<PageSlug, Promise<PageContent>>();

type GetPageOptions = { signal?: AbortSignal };

async function requestPage(slug: PageSlug, options: GetPageOptions): Promise<PageContent> {
  const { data, response } = await httpClient.GET('/api/v1/content/pages/{slug}', {
    params: { path: { slug } },
    signal: options.signal,
  });
  if (!isPageContent(data)) {
    throw new HttpError(normalizeError(response?.status ?? 200, null, response?.headers ?? {}));
  }
  return data;
}

export function getPage(slug: PageSlug, options: GetPageOptions = {}): Promise<PageContent> {
  const cached = pageCache.get(slug);
  if (cached) return Promise.resolve(cached);

  const pending = pendingRequests.get(slug);
  if (pending) return pending;

  const request = requestPage(slug, options);
  pendingRequests.set(slug, request);
  void request
    .then(
      (page) => {
        if (pendingRequests.get(slug) === request) pageCache.set(slug, page);
      },
      () => undefined,
    )
    .then(() => {
      if (pendingRequests.get(slug) === request) pendingRequests.delete(slug);
    });
  return request;
}

export function clearPage(slug: PageSlug): void {
  pageCache.delete(slug);
  pendingRequests.delete(slug);
}

export function clearPageCache(): void {
  pageCache.clear();
  pendingRequests.clear();
}
