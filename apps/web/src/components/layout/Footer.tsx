import type { ReactNode } from 'react';
import styles from './Footer.module.css';

export function Footer(): ReactNode {
  return (
    <footer className={styles.footer}>
      <p>© 2026 NuageIT • Portal de Integração &amp; Rampa de Novos Colaboradores</p>
    </footer>
  );
}
