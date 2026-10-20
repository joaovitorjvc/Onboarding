import type { ReactNode } from 'react';
import type { Subtopic as SubtopicValue, SubtopicItem } from '@nuagehub/contracts';
import { RichText } from './RichText';
import { ActionButton } from './ActionButton';
import { Icon } from '../icons/Icon';
import styles from './Subtopic.module.css';

export function SubtopicItem({ item }: { item: SubtopicItem }): ReactNode {
  switch (item.type) {
    case 'paragraph':
      return (
        <p className={styles.description}>
          <RichText value={item.text} />
        </p>
      );
    case 'bullets':
      return (
        <ul className={styles.bulletList}>
          {item.items.map((text, index) => (
            <li className={styles.bulletItem} key={index}>
              <RichText value={text} />
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className={styles.stepsList}>
          {item.items.map((text, index) => (
            <li className={styles.stepItem} key={index}>
              <span className={styles.stepBadge}>{index + 1}</span>
              <span>
                <RichText value={text} />
              </span>
            </li>
          ))}
        </ol>
      );
    case 'links':
      return (
        <div className={styles.linksGroup}>
          {item.items.map((link) =>
            link.href ? (
              <a
                className={styles.textLinkItem}
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <span>{link.title}</span>
                  <p>
                    <small>{link.description}</small>
                  </p>
                </div>
                <Icon name="external-link" size={20} />
              </a>
            ) : (
              <div className={`${styles.textLinkItem} ${styles.isDisabled}`} key={link.title}>
                <div>
                  <span>{link.title}</span>
                  <p>
                    <small>{link.description}</small>
                  </p>
                </div>
                <Icon name="clock" size={20} />
              </div>
            ),
          )}
        </div>
      );
    case 'cadence':
      return (
        <div className={styles.cadenceGrid}>
          {item.items.map((cadence) => (
            <div className={styles.cadenceStep} key={cadence.day}>
              <span className={styles.cadenceDay}>{cadence.day}</span>
              <span className={styles.cadenceAction}>{cadence.action}</span>
              <span className={styles.cadenceDetail}>{cadence.detail}</span>
            </div>
          ))}
        </div>
      );
    case 'script':
      return <div className={styles.scriptBox}>{item.text}</div>;
    case 'actions':
      return (
        <div className={styles.actionRow}>
          {item.items.map((action) => (
            <ActionButton key={action.label} action={action} />
          ))}
        </div>
      );
  }
}

export function Subtopic({ subtopic }: { subtopic: SubtopicValue }): ReactNode {
  return (
    <div className={styles.subtopic}>
      <h3 className={styles.title}>{subtopic.title}</h3>
      {subtopic.content.map((item, index) => (
        <SubtopicItem item={item} key={`${item.type}-${index}`} />
      ))}
    </div>
  );
}
