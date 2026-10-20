import type { ReactNode } from 'react';
import type { Block } from '@nuagehub/contracts';
import { CardGrid } from './CardGrid';
import { TopicSection } from './TopicSection';
import { ChecklistPanel } from './ChecklistPanel';

export function BlockRenderer({ block }: { block: Block }): ReactNode {
  switch (block.type) {
    case 'cards':
      return <CardGrid cards={block.cards} />;
    case 'checklist':
      return <ChecklistPanel block={block} />;
    case 'topic':
      return <TopicSection number={block.number} title={block.title} subtopics={block.subtopics} />;
  }
}
