import { Injectable, NotFoundException } from '@nestjs/common';
import type { PageContent, PageSlug } from '@nuagehub/contracts';
import { loadPages } from './content-loader';

const PAGE_SLUGS: readonly PageSlug[] = ['inicio', 'primeiros-passos', 'plataformas', 'playbook'];

export interface PageSummary {
  slug: PageSlug;
  navLabel: string;
  documentTitle: string;
}

@Injectable()
export class ContentService {
  private readonly pages: Map<PageSlug, PageContent>;

  constructor() {
    this.pages = new Map(loadPages().map((page) => [page.slug, page]));
  }

  list(): PageSummary[] {
    return PAGE_SLUGS.map((slug) => {
      const page = this.pages.get(slug);
      if (!page) throw new Error(`Conteúdo obrigatório ausente: ${slug}.`);
      return { slug: page.slug, navLabel: page.navLabel, documentTitle: page.documentTitle };
    });
  }

  get(slug: string): PageContent {
    const page = this.pages.get(slug as PageSlug);
    if (!page) throw new NotFoundException(`Página de conteúdo "${slug}" não encontrada.`);
    return page;
  }
}
