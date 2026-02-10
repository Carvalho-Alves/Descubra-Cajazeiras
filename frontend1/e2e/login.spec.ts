import { expect, test } from '@playwright/test';

test('Login page abre e valida campos', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();

  const submit = page.getByRole('button', { name: 'Entrar' });
  await submit.click();

  // Validação HTML5 (required) deve marcar inválido
  await expect(page.locator('#loginEmail:invalid')).toHaveCount(1);
  await expect(page.locator('#loginSenha:invalid')).toHaveCount(1);
});
