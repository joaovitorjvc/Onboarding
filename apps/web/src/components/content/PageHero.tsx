import type { ReactNode } from 'react';
import type { Hero, IconName } from '@nuagehub/contracts';
import { Icon } from '../icons/Icon';
import { ActionButton } from './ActionButton';
import { RichText } from './RichText';
import styles from './PageHero.module.css';

export function PageHero({ hero }: { hero: Hero }): ReactNode {
  const isHome = hero.variant === 'home';
  const title = hero.title[0]?.map((span) => span.text).join('') ?? '';
  const eyebrowIcon: IconName =
    title === 'Primeiros Passos' ? 'compass' : title === 'Plataformas' ? 'layers' : 'book-open';

  return (
    <section className={isHome ? styles.hero : styles.pageHero}>
      {hero.badge ? (
        <div className={styles.pillBadge}>
          {hero.badge.icon && <Icon name={hero.badge.icon} />}
          <span>{hero.badge.text}</span>
        </div>
      ) : hero.eyebrow ? (
        <div className={styles.pillBadge}>
          <Icon name={eyebrowIcon} />
          <span>{hero.eyebrow}</span>
        </div>
      ) : null}
      <h1 className={styles.heroTitle} tabIndex={-1}>
        {hero.title
          .map((line, index) => (
            <span className={index === 1 ? styles.gradientText : undefined} key={index}>
              {line.map((span) => span.text).join('')}
            </span>
          ))
          .reduce<ReactNode[]>((children, child, index) => {
            if (index === 0) return [child];
            return [...children, <br key={`break-${index}`} />, child];
          }, [])}
      </h1>
      <p className={styles.heroDescription}>
        <RichText value={hero.description} />
      </p>
      {hero.actions && (
        <div className={styles.heroActions}>
          {hero.actions.map((action) => (
            <ActionButton key={action.label} action={action} />
          ))}
        </div>
      )}
    </section>
  );
}
