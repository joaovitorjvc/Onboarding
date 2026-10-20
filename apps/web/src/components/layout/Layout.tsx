import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from './SkipLink';
import styles from './Layout.module.css';

export function Layout({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      <SkipLink />
      <div className={styles.backgroundGlow} aria-hidden="true" />
      <Header />
      {children}
      <Footer />
    </>
  );
}
