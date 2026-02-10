import { expect, test } from '@playwright/test';

test('Home abre e mostra título do mapa', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Mapa' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Serviços' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Eventos' })).toBeVisible();
});
