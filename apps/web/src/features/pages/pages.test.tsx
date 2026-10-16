import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axe from 'axe-core';
import type { PageContent } from '@nuagehub/contracts';
import inicio from '../../../../api/src/content/data/inicio.json';
import primeirosPassos from '../../../../api/src/content/data/primeiros-passos.json';
import plataformas from '../../../../api/src/content/data/plataformas.json';
import playbook from '../../../../api/src/content/data/playbook.json';
import { Layout } from '../../components/layout/Layout';
import { PageView } from './PageView';

const pages = [inicio, primeirosPassos, plataformas, playbook] as PageContent[];
const navigationLabels = ['Página Inicial', 'Primeiros passos', 'Plataformas', 'Playbook'];

afterEach(() => cleanup());

function headingLevels(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) => Number(heading.tagName[1]));
}

describe('páginas completas e acessibilidade', () => {
  it.each(pages)('$slug não possui violações do axe-core', async (page) => {
    const { container } = render(
      <MemoryRouter initialEntries={[page.slug === 'inicio' ? '/' : `/${page.slug}`]}>
        <Layout>
          <PageView page={page} />
        </Layout>
      </MemoryRouter>,
    );

    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: true } } });
    expect(result.violations).toEqual([]);
  });

  it.each(pages)('$slug possui um h1 e hierarquia sem saltos', (page) => {
    const { container } = render(
      <MemoryRouter>
        <Layout>
          <PageView page={page} />
        </Layout>
      </MemoryRouter>,
    );
    const headings = headingLevels(container);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    headings.slice(1).forEach((level, index) => {
      const previous = headings[index];
      if (previous !== undefined) expect(level - previous).toBeLessThanOrEqual(1);
    });
  });

  it.each(pages)('$slug mantém o navLabel alinhado à navegação fixa', (page) => {
    const { container } = render(
      <MemoryRouter>
        <Layout>
          <PageView page={page} />
        </Layout>
      </MemoryRouter>,
    );
    const labels = Array.from(within(container).getByRole('navigation').querySelectorAll('a')).map((link) =>
      link.textContent?.trim(),
    );
    expect(labels).toEqual(navigationLabels);
    expect(navigationLabels).toContain(page.navLabel);
  });
});
