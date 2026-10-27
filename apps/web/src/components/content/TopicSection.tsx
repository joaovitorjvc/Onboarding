import type { ReactNode } from 'react';
import type { Subtopic as SubtopicValue } from '@nuagehub/contracts';
import { Subtopic } from './Subtopic';
import styles from './Subtopic.module.css';

export function TopicSection({
  number,
  title,
  subtopics,
}: {
  number: string;
  title: string;
  subtopics: SubtopicValue[];
}): ReactNode {
  return (
    <section className={styles.topicSection}>
      <div className={styles.topicHeader}>
        <span className={styles.topicNumber}>{number}</span>
        <h2 className={styles.topicTitle}>{title}</h2>
      </div>
      {subtopics.map((subtopic) => (
        <Subtopic key={subtopic.title} subtopic={subtopic} />
      ))}
    </section>
  );
}
