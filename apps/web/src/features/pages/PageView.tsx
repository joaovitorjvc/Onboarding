import type { ReactNode } from 'react';
import type { PageContent } from '@nuagehub/contracts';
import { PageHero } from '../../components/content/PageHero';
import { BlockRenderer } from '../../components/content/BlockRenderer';
import styles from './PageView.module.css';

export function PageView({ page }: { page: PageContent }): ReactNode {
  return (
    <main
      id="conteudo"
      data-page-slug={page.slug}
      className={page.hero.variant === 'home' ? `${styles.mainContent} container` : styles.articleWrap}
    >
      <title>{page.documentTitle}</title>
      <PageHero hero={page.hero} />
      {page.blocks.map((block, index) => (
        <BlockRenderer block={block} key={`${block.type}-${index}`} />
      ))}
    </main>
  );
}
