const { test, expect } = require('@playwright/test');
const { url, focoNoTitulo } = require('./ajuda');

test.describe('US-01 navegação por hash', () => {
  test('[REQ-001] abre sem hash e passa a #/ com o título Início', async ({ page }) => {
    await page.goto(url());
    await expect(page).toHaveURL(/#\/$/);
    await expect(page).toHaveTitle('Início · Rango');
    await expect(page.getByRole('heading', { level: 1, name: 'Restaurantes' })).toBeVisible();
  });

  test('[REQ-001] [REQ-010] trocar de rota atualiza título e põe o foco no h1 (A11Y-10)', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByRole('link', { name: 'Forno da Vila' }).click();
    await expect(page).toHaveURL(/#\/restaurante\/1$/);
    await expect(page).toHaveTitle('Forno da Vila · Rango');
    await expect.poll(() => focoNoTitulo(page)).toBe(true);
  });

  test('[REQ-001] voltar e avançar do navegador funcionam e preservam os filtros', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByLabel('Buscar restaurante').fill('sushi');
    await page.getByRole('link', { name: 'Sushi Kaori' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Sushi Kaori' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { level: 1, name: 'Restaurantes' })).toBeVisible();
    await expect(page.getByLabel('Buscar restaurante')).toHaveValue('sushi');
    await expect.poll(() => focoNoTitulo(page)).toBe(true);
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1, name: 'Sushi Kaori' })).toBeVisible();
  });

  test('[REQ-001] hash desconhecido volta para #/', async ({ page }) => {
    await page.goto(url('#/xyz'));
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Restaurantes' })).toBeVisible();
  });

  test('[REQ-001] link "Pular para o conteúdo" leva o foco ao main sem trocar de rota', async ({ page }) => {
    await page.goto(url('#/restaurante/2'));
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#conteudo')).toBeFocused();
    await expect(page).toHaveURL(/#\/restaurante\/2$/);
  });

  test('[REQ-002] nenhuma requisição de rede fora de file://', async ({ page }) => {
    const externas = [];
    page.on('request', (r) => { if (!r.url().startsWith('file:')) externas.push(r.url()); });
    for (const rota of ['#/', '#/restaurante/1', '#/restaurante/3', '#/carrinho', '#/checkout', '#/pedido']) {
      await page.goto(url(rota));
      await expect(page.locator('main h1')).toBeVisible();
    }
    expect(externas).toEqual([]);
  });
});
