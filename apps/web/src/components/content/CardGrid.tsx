import type { ReactNode } from 'react';
import type { Card } from '@nuagehub/contracts';
import { Icon } from '../icons/Icon';
import { ActionButton } from './ActionButton';
import { RichText } from './RichText';
import styles from './CardGrid.module.css';

export function CardGrid({ cards }: { cards: Card[] }): ReactNode {
  return (
    <section className={styles.grid} aria-label="Módulos do onboarding">
      <h2 className={styles.visuallyHidden}>Módulos do onboarding</h2>
      {cards.map((card) => (
        <article className={styles.card} key={card.title}>
          <div>
            <div className={styles.header}>
              <div className={`${styles.icon} ${styles[card.accent]}`}>
                <Icon name={card.icon} />
              </div>
              <span className={styles.tag}>{card.tag}</span>
            </div>
            <h3 className={styles.title}>{card.title}</h3>
            <p className={styles.subtitle}>{card.subtitle}</p>
            <p className={styles.description}>
              <RichText value={card.description} />
            </p>
          </div>
          <ActionButton action={card.action} />
        </article>
      ))}
    </section>
  );
}
