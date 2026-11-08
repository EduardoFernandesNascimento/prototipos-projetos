const { test, expect } = require('@playwright/test');
const { url } = require('./ajuda');

test.describe('US-04 e US-05 Restaurante', () => {
  test('[REQ-004] mostra informações e cardápio por seção com preço em pt-BR', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    await expect(page.getByRole('heading', { level: 1, name: 'Forno da Vila' })).toBeVisible();
    await expect(page.locator('.restaurante-info')).toContainText('Pizza');
    await expect(page.locator('.restaurante-info')).toContainText('Nota 4,7');
    await expect(page.getByRole('heading', { level: 2, name: 'Pizzas salgadas' })).toBeVisible();
    const card = page.locator('.cartao-prato', { has: page.getByRole('heading', { name: 'Pizza Margherita' }) });
    await expect(card).toContainText('R$ 49,90');
    await expect(page.getByRole('link', { name: 'Voltar para restaurantes' })).toHaveAttribute('href', '#/');
  });

  test('[REQ-004] [REQ-010] "Adicionar" atualiza o contador e mostra o aviso (A11Y-12)', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    const botao = page.getByRole('button', { name: 'Adicionar Pizza Margherita' });
    await botao.click();
    await expect(page.locator('#aviso')).toContainText('Pizza Margherita adicionado ao carrinho.');
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 1 item');
    await expect(page.locator('#link-carrinho .contador')).toHaveText('1');
    await expect(botao).toBeFocused();
    await botao.click();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 2 itens');
  });

  test('[REQ-004] aviso pode ser fechado e some sozinho depois de 4 s', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    await page.getByRole('button', { name: 'Adicionar Pizza Calabresa' }).click();
    await expect(page.locator('#aviso')).toContainText('Pizza Calabresa adicionado ao carrinho.');
    await page.getByRole('button', { name: 'Fechar aviso' }).click();
    await expect(page.locator('#aviso')).toHaveText('');
    await page.getByRole('button', { name: 'Adicionar Pizza Calabresa' }).click();
    await expect(page.locator('#aviso')).toContainText('adicionado');
    await page.mouse.move(0, 0);
    await expect(page.locator('#aviso')).toHaveText('', { timeout: 6000 });
  });

  test('[REQ-004] id inexistente mostra "Restaurante não encontrado"', async ({ page }) => {
    await page.goto(url('#/restaurante/999'));
    await expect(page.getByRole('heading', { level: 1, name: 'Restaurante não encontrado' })).toBeVisible();
    await expect(page.getByText('O restaurante que você procurou não existe ou saiu do ar.')).toBeVisible();
    await page.getByRole('link', { name: 'Ver restaurantes' }).click();
    await expect(page).toHaveURL(/#\/$/);
  });

  test('[REQ-004] id com sequência percentual inválida mostra "Restaurante não encontrado" sem erro', async ({ page }) => {
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    const naoEncontrado = page.getByRole('heading', { level: 1, name: 'Restaurante não encontrado' });
    // carga inicial
    await page.goto(url('#/restaurante/%'));
    await expect(naoEncontrado).toBeVisible();
    // troca de rota (hashchange) a partir de uma tela válida
    await page.goto(url('#/restaurante/1'));
    await expect(page.getByRole('heading', { level: 1, name: 'Restaurante não encontrado' })).toBeHidden();
    await page.evaluate(() => { location.hash = '#/restaurante/%E0%A4%A'; });
    await expect(naoEncontrado).toBeVisible();
    await page.reload();
    await expect(naoEncontrado).toBeVisible();
    expect(erros).toEqual([]);
  });

  test('[REQ-005] [REQ-010] trocar de restaurante pede confirmação; Cancelar e Esc não mudam nada (A11Y-14)', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await page.goto(url('#/restaurante/2'));
    const origem = page.getByRole('button', { name: 'Adicionar Clássico da Casa' });
    await origem.click();
    const dialogo = page.getByRole('dialog', { name: 'Começar um novo carrinho?' });
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toContainText('Seu carrinho tem itens de Forno da Vila. Para adicionar itens de Burger do Bairro, o carrinho atual será esvaziado.');
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
    await expect(origem).toBeFocused();
    await origem.click();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialogo).toBeHidden();
    await expect(origem).toBeFocused();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 1 item');
  });

  test('[REQ-005] "Esvaziar e adicionar" troca o carrinho para o novo restaurante', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await page.goto(url('#/restaurante/2'));
    const origem = page.getByRole('button', { name: 'Adicionar Duplo Cheddar' });
    await origem.click();
    await page.getByRole('button', { name: 'Esvaziar e adicionar' }).click();
    await expect(page.locator('#aviso')).toContainText('Carrinho esvaziado. Duplo Cheddar adicionado ao carrinho.');
    await expect(origem).toBeFocused();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 1 item');
    await page.goto(url('#/carrinho'));
    await expect(page.getByRole('heading', { level: 2, name: 'Duplo Cheddar' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pizza Margherita' })).toHaveCount(0);
  });
});
