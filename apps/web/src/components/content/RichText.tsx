import { Fragment, type ReactNode } from 'react';
import type { RichText as RichTextValue } from '@nuagehub/contracts';
import styles from './RichText.module.css';

export function RichText({ value }: { value: RichTextValue }): ReactNode {
  return (
    <>
      {value.map((span, index) => {
        const content = span.href ? (
          <a className={styles.link} href={span.href} target="_blank" rel="noopener noreferrer">
            {span.text}
            <span className={styles.visuallyHidden}> (abre em nova aba)</span>
          </a>
        ) : (
          span.text
        );

        if (span.strong) return <strong key={index}>{content}</strong>;
        if (span.emphasis) return <em key={index}>{content}</em>;
        return <Fragment key={index}>{content}</Fragment>;
      })}
    </>
  );
}
