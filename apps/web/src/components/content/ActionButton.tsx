import type { ReactNode } from 'react';
import type { Action } from '@nuagehub/contracts';
import { Link } from 'react-router';
import { Icon } from '../icons/Icon';
import styles from './ActionButton.module.css';

export function ActionButton({ action }: { action: Action }): ReactNode {
  const className = action.style === 'card' ? styles.card : `${styles.button} ${styles[action.style]}`;
  const children = (
    <>
      {action.label}
      {action.icon && <Icon name={action.icon} />}
    </>
  );

  if (action.to) {
    return (
      <Link className={className} to={action.to}>
        {children}
      </Link>
    );
  }

  return (
    <a className={className} href={action.href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className={styles.visuallyHidden}> (abre em nova aba)</span>
    </a>
  );
}
