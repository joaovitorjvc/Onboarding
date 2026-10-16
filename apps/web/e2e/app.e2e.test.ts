import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';

const canonicalPages = ['/', '/primeiros-passos', '/plataformas', '/playbook'];
const legacyPages = [
  { legacy: '/index.html', canonical: '/' },
  { legacy: '/primeiros-passos.html', canonical: '/primeiros-passos' },
  { legacy: '/plataformas.html', canonical: '/plataformas' },
  { legacy: '/playbook.html', canonical: '/playbook' },
];
const axePath = resolve(import.meta.dirname, '../node_modules/axe-core/axe.min.js');

test.describe('rotas e acessibilidade do App_Web', () => {
  test('percorre as quatro rotas canônicas sem requisições externas', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (/fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com/u.test(request.url()))
        externalRequests.push(request.url());
    });

    for (const route of canonicalPages) {
      await page.goto(route);
      await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
      await expect(page.locator('h1')).toHaveCount(1);
    }
    expect(externalRequests).toEqual([]);
  });

  for (const { legacy, canonical } of legacyPages) {
    test(`${legacy} redireciona e não permanece no histórico`, async ({ page }) => {
      await page.goto('/');
      await page.goto(legacy);
      await expect.poll(() => new URL(page.url()).pathname).toBe(canonical);
      await page.goBack();
      expect(new URL(page.url()).pathname).not.toMatch(/\.html$/u);
    });
  }

  test('exibe 404 em caminho desconhecido', async ({ page }) => {
    await page.goto('/caminho-inexistente');
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voltar para o Início' })).toHaveAttribute('href', '/');
  });

  test('persiste o checklist e aplica a semente do Site_Legado', async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('nuagehub-checklist')) {
        localStorage.setItem('nuagehub-checklist', JSON.stringify({ plataformas: true }));
      }
    });
    await page.goto('/');
    const items = page.getByRole('checkbox');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveAttribute('aria-checked', 'true');
    await expect(items.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(items.nth(2)).toHaveAttribute('aria-checked', 'false');

    await items.nth(2).click();
    await page.reload();
    await expect(page.getByRole('checkbox').nth(2)).toHaveAttribute('aria-checked', 'true');
    const stored = await page.evaluate(() => localStorage.getItem('nuagehub-checklist'));
    expect(JSON.parse(stored ?? '{}')).toMatchObject({ plataformas: true, playbook: true });
  });

  test('oferece SkipLink como primeiro foco e alternância por teclado', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('a:focus')).toHaveText('Pular para o conteúdo');

    const checkbox = page.getByRole('checkbox').nth(1);
    await checkbox.focus();
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await page.keyboard.press('Space');
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Enter');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  for (const route of canonicalPages) {
    test(`axe-core sem violações em ${route}`, async ({ page }) => {
      const externalRequests: string[] = [];
      page.on('request', (request) => {
        if (/fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com/u.test(request.url()))
          externalRequests.push(request.url());
      });
      await page.goto(route);
      await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
      await page.addScriptTag({ path: axePath });
      const result = await page.evaluate(async () => {
        const axeApi = (
          window as Window & {
            axe: { run: (context: Document, options: unknown) => Promise<{ violations: unknown[] }> };
          }
        ).axe;
        return axeApi.run(document, { rules: { 'color-contrast': { enabled: true } } });
      });
      expect(result.violations).toEqual([]);
      expect(externalRequests).toEqual([]);
    });
  }
});
