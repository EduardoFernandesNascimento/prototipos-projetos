const { test, expect } = require('@playwright/test');
const { url } = require('./ajuda');

test.describe('US-03 Início', () => {
  test('[REQ-002] [REQ-003] lista os 6 restaurantes com nota, tempo e taxa', async ({ page }) => {
    await page.goto(url('#/'));
    await expect(page.locator('#contagem')).toHaveText('6 restaurantes');
    await expect(page.locator('.cartao-restaurante')).toHaveCount(6);
    const primeiro = page.locator('.cartao-restaurante').first();
    await expect(primeiro).toContainText('Nota 4,7');
    await expect(primeiro).toContainText('30–40 min');
    await expect(primeiro).toContainText('R$ 5,99');
    await expect(page.locator('.cartao-restaurante').nth(1)).toContainText('Entrega grátis');
  });

  test('[REQ-002] dados: 6 restaurantes, 5 a 8 pratos, categorias da spec', async ({ page }) => {
    await page.goto(url('#/'));
    const d = await page.evaluate(() => ({
      n: window.RANGO_DADOS.restaurantes.length,
      pratos: window.RANGO_DADOS.restaurantes.map((r) => r.secoes.reduce((s, x) => s + x.pratos.length, 0)),
      cats: window.RANGO_DADOS.categorias.map((c) => c.id),
    }));
    expect(d.n).toBe(6);
    for (const n of d.pratos) { expect(n).toBeGreaterThanOrEqual(5); expect(n).toBeLessThanOrEqual(8); }
    expect(d.cats).toEqual(['pizza', 'lanches', 'japonesa', 'saudavel', 'doces']);
  });

  test('[REQ-003] busca sem distinguir maiúsculas e acentos', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByLabel('Buscar restaurante').fill('VERDE VÍVO');
    await expect(page.locator('#contagem')).toHaveText('1 restaurante');
    await expect(page.getByRole('link', { name: 'Verde Vivo' })).toBeVisible();
  });

  test('[REQ-003] Enter na busca não recarrega a página', async ({ page }) => {
    await page.goto(url('#/'));
    await page.evaluate(() => { window.__marca = 1; });
    await page.getByLabel('Buscar restaurante').fill('pizza');
    await page.getByLabel('Buscar restaurante').press('Enter');
    expect(await page.evaluate(() => window.__marca)).toBe(1);
  });

  test('[REQ-003] filtro por categoria combinado com a busca', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByRole('radio', { name: 'Pizza' }).check();
    await expect(page.locator('#contagem')).toHaveText('2 restaurantes');
    await page.getByLabel('Buscar restaurante').fill('napolitana');
    await expect(page.locator('#contagem')).toHaveText('1 restaurante');
    await expect(page.getByRole('link', { name: 'Pizzaria Napolitana Bella Notte' })).toBeVisible();
    await page.getByRole('radio', { name: 'Doces' }).check();
    await expect(page.locator('#contagem')).toHaveText('Nenhum restaurante encontrado');
  });

  test('[REQ-003] estado vazio e "Limpar filtros" devolve a lista e o foco à busca', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByLabel('Buscar restaurante').fill('zzzz');
    await expect(page.getByText('Nenhum restaurante encontrado.', { exact: true })).toBeVisible();
    await expect(page.getByText('Tente outro nome ou outra categoria.')).toBeVisible();
    await page.getByRole('button', { name: 'Limpar filtros' }).click();
    await expect(page.locator('#contagem')).toHaveText('6 restaurantes');
    await expect(page.getByLabel('Buscar restaurante')).toHaveValue('');
    await expect(page.getByLabel('Buscar restaurante')).toBeFocused();
    await expect(page.getByRole('radio', { name: 'Todas' })).toBeChecked();
  });
});
