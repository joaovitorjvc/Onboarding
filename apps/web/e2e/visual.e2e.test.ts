import { expect, test } from '@playwright/test';

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];
const pages = [
  { name: 'inicio', path: '/' },
  { name: 'primeiros-passos', path: '/primeiros-passos' },
  { name: 'plataformas', path: '/plataformas' },
  { name: 'playbook', path: '/playbook' },
];

for (const viewport of viewports) {
  for (const pageDefinition of pages) {
    test(`${pageDefinition.name}-${viewport.width}.png`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() => localStorage.clear());
      await page.goto(pageDefinition.path);
      await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      await expect(page).toHaveScreenshot(`${pageDefinition.name}-${viewport.width}.png`, { fullPage: true });
    });
  }
}
