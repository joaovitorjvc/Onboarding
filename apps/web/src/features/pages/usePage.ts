import { useCallback, useEffect, useState } from 'react';
import type { ErrorFormat, PageContent, PageSlug } from '@nuagehub/contracts';
import { HttpError, normalizeError } from '../../api/http-client';
import { clearPage, getPage } from '../../api/content-client';

export type PageState =
  | { status: 'loading'; page?: undefined; error?: undefined }
  | { status: 'ready'; page: PageContent; error?: undefined }
  | { status: 'error'; page?: undefined; error: ErrorFormat };

type ResolvedState = { key: string; state: PageState };

export function usePage(slug: PageSlug): PageState & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const key = `${slug}:${attempt}`;
  const [resolved, setResolved] = useState<ResolvedState>({ key: '', state: { status: 'loading' } });

  useEffect(() => {
    let active = true;
    getPage(slug)
      .then((page) => {
        if (active) setResolved({ key, state: { status: 'ready', page } });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const error = reason instanceof HttpError ? reason.error : normalizeError(503, null, {});
        setResolved({ key, state: { status: 'error', error } });
      });
    return () => {
      active = false;
    };
  }, [key, slug]);

  const retry = useCallback(() => {
    clearPage(slug);
    setAttempt((value) => value + 1);
  }, [slug]);

  const state = resolved.key === key ? resolved.state : { status: 'loading' as const };
  return { ...state, retry };
}
