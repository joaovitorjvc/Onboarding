import type { ReactNode } from 'react';
import styles from './SkipLink.module.css';

export function SkipLink(): ReactNode {
  return (
    <a className={styles.skipLink} href="#conteudo">
      Pular para o conteúdo
    </a>
  );
}
