import type { KeyboardEvent, ReactNode } from 'react';
import type { Block } from '@nuagehub/contracts';
import { Icon } from '../icons/Icon';
import { useChecklist } from '../../features/checklist/useChecklist';
import styles from './ChecklistPanel.module.css';

export function ChecklistPanel({ block }: { block: Extract<Block, { type: 'checklist' }> }): ReactNode {
  const { done, toggle } = useChecklist(block.items);
  const activate = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle(id);
    }
  };
  return (
    <section className={styles.panel} aria-labelledby="checklist-title">
      <div className={styles.header}>
        <div>
          <span className={styles.label}>{block.label}</span>
          <h2 id="checklist-title" className={styles.title}>
            {block.title}
          </h2>
        </div>
        <div className={styles.meta}>
          <Icon name={block.meta.icon} />
          <span>{block.meta.text}</span>
        </div>
      </div>
      <div className={styles.grid}>
        {block.items.map((item) => (
          <div
            className={`${styles.item} ${done[item.id] ? styles.done : ''}`}
            key={item.id}
            role="checkbox"
            aria-checked={done[item.id]}
            tabIndex={0}
            onClick={() => toggle(item.id)}
            onKeyDown={(event) => activate(event, item.id)}
          >
            <div className={styles.top}>
              <span className={styles.day}>{item.day}</span>
              <Icon name="circle-check" size={20} />
            </div>
            <h3 className={styles.itemTitle}>{item.title}</h3>
            <p className={styles.description}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
