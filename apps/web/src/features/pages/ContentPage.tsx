import type { ReactNode } from 'react';
import type { PageSlug } from '@nuagehub/contracts';
import { PageView } from './PageView';
import { usePage } from './usePage';
import styles from './ContentPage.module.css';

export function ContentPage({ slug }: { slug: PageSlug }): ReactNode {
  const state = usePage(slug);

  if (state.status === 'loading') {
    return (
      <main id="conteudo" className={styles.loading} aria-busy="true" aria-labelledby="loading-title">
        <h1 id="loading-title" tabIndex={-1}>
          <span className={styles.skeleton} aria-hidden="true" />
          <span className={styles.visuallyHidden}>Carregando conteúdo…</span>
        </h1>
        <p className={styles.skeleton} aria-hidden="true" />
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main id="conteudo" className={styles.error} aria-labelledby="error-title">
        <div role="alert">
          <h1 id="error-title" tabIndex={-1}>
            Não foi possível carregar o conteúdo
          </h1>
          <p>{state.error.message}</p>
          <p>Código de correlação: {state.error.correlationId}</p>
          <button type="button" onClick={state.retry}>
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return <PageView page={state.page} />;
}
