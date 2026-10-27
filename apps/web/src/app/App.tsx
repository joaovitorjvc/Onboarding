import type { CSSProperties, ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { ContentPage } from '../features/pages/ContentPage';
import { Layout } from '../components/layout/Layout';
import styles from '../components/layout/Layout.module.css';
import { cssVariables, applyTokens } from '../theme/tokens';

applyTokens();

export function App(): ReactNode {
  return (
    <BrowserRouter>
      <div className={styles.appShell} style={cssVariables as CSSProperties}>
        <Layout>
          <AppRoutes renderPage={(slug) => <ContentPage slug={slug} />} />
        </Layout>
      </div>
    </BrowserRouter>
  );
}
