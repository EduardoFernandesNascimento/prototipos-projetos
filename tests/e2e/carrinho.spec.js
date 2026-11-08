const { test, expect } = require('@playwright/test');
const { url, preCarregar, carrinhoExemplo } = require('./ajuda');

const valor = (page, chave) => page.locator(`[data-total="${chave}"]`);

test.describe('US-06 e US-07 Carrinho', () => {
  test('[REQ-005] vazio mostra aviso e link para o início', async ({ page }) => {
    await page.goto(url('#/carrinho'));
    await expect(page).toHaveTitle('Carrinho · Rango');
    await expect(page.getByRole('heading', { level: 1, name: 'Seu carrinho' })).toBeVisible();
    await expect(page.getByText('Seu carrinho está vazio.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver restaurantes' })).toHaveAttribute('href', '#/');
  });

  test('[REQ-005] [REQ-006] restaura do localStorage e mostra subtotal, taxa e total', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/carrinho'));
    await expect(page.getByRole('link', { name: 'Forno da Vila' })).toBeVisible();
    await expect(valor(page, 'subtotal')).toHaveText('R$ 106,70');
    await expect(valor(page, 'taxa')).toHaveText('R$ 5,99');
    await expect(valor(page, 'total')).toHaveText('R$ 112,69');
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 3 itens');
  });

  test('[REQ-005] + e − recalculam na hora; − com 1 remove o item com aviso', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/carrinho'));
    await page.getByRole('button', { name: 'Aumentar Pizza Margherita' }).click();
    await expect(valor(page, 'subtotal')).toHaveText('R$ 156,60');
    await page.getByRole('button', { name: 'Diminuir Pizza Margherita' }).click();
    await page.getByRole('button', { name: 'Diminuir Pizza Margherita' }).click();
    await expect(valor(page, 'subtotal')).toHaveText('R$ 56,80');
    const menos = page.getByRole('button', { name: 'Remover Pizza Margherita', exact: true });
    await expect(menos).toBeVisible();
    await menos.click();
    await expect(page.locator('#aviso')).toContainText('Pizza Margherita removido do carrinho.');
    await expect(page.getByRole('heading', { level: 2, name: 'Pizza Margherita' })).toHaveCount(0);
    await expect(valor(page, 'total')).toHaveText('R$ 12,89');
    await expect(page.getByRole('button', { name: 'Remover Refrigerante lata', exact: true })).toBeFocused();
  });

  test('[REQ-005] "+" fica desabilitado em 20 unidades', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': { restauranteId: 1, itens: [{ pratoId: 101, qtd: 19 }] } });
    await page.goto(url('#/carrinho'));
    const mais = page.getByRole('button', { name: 'Aumentar Pizza Margherita' });
    await mais.click();
    await expect(page.locator('.qtd__valor')).toHaveText('20');
    await expect(mais).toBeDisabled();
  });

  test('[REQ-005] "Remover" tira o item e, no último, mostra o vazio com foco no h1', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/carrinho'));
    await page.getByRole('button', { name: 'Remover Refrigerante lata do carrinho' }).click();
    await expect(page.locator('#aviso')).toContainText('Refrigerante lata removido do carrinho.');
    await expect(page.getByRole('button', { name: 'Diminuir Pizza Margherita' })).toBeFocused();
    await page.getByRole('button', { name: 'Remover Pizza Margherita do carrinho' }).click();
    await expect(page.getByText('Seu carrinho está vazio.')).toBeVisible();
    await expect(page.locator('main h1')).toBeFocused();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 0 itens');
  });

  test('[REQ-006] carrinho continua depois de recarregar a página', async ({ page }) => {
    await page.goto(url('#/restaurante/4'));
    await page.getByRole('button', { name: 'Adicionar Bowl de quinoa' }).click();
    await page.reload();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 1 item');
    const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('rango:carrinho')));
    expect(salvo).toEqual({ restauranteId: 4, itens: [{ pratoId: 402, qtd: 1 }] });
  });

  test('[REQ-006] dado inválido ou de prato inexistente é descartado em silêncio', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': { restauranteId: 1, itens: [{ pratoId: 9999, qtd: 2 }, { pratoId: 201, qtd: 1 }, { pratoId: 101, qtd: 1 }] } });
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.goto(url('#/carrinho'));
    await expect(page.locator('.item')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2, name: 'Pizza Margherita' })).toBeVisible();
    expect(erros).toEqual([]);
  });

  test('[REQ-006] com localStorage lançando exceção a página funciona em memória e avisa uma vez', async ({ page }) => {
    await page.addInitScript(() => {
      const quebra = () => { throw new Error('bloqueado'); };
      Object.defineProperty(window, 'localStorage', { configurable: true, get: () => ({ getItem: quebra, setItem: quebra, removeItem: quebra }) });
    });
    // registra cada texto que passa por #aviso: um aviso repetido conta mesmo que outro o sobrescreva logo depois
    await page.addInitScript(() => {
      window.__avisos = [];
      document.addEventListener('DOMContentLoaded', () => {
        const aviso = document.getElementById('aviso');
        new MutationObserver(() => {
          const t = aviso.textContent.trim();
          if (t) window.__avisos.push(t);
        }).observe(aviso, { childList: true, characterData: true, subtree: true });
      });
    });
    const FALHA = 'Não foi possível salvar o carrinho neste navegador. Ele será perdido ao recarregar a página.';
    const vezesFalha = () => page.evaluate((m) => window.__avisos.filter((t) => t === m).length, FALHA);
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.goto(url('#/restaurante/1'));
    await expect(page.locator('#aviso')).toContainText('Não foi possível salvar o carrinho neste navegador. Ele será perdido ao recarregar a página.');
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await expect(page.locator('#aviso')).toContainText('Pizza Margherita adicionado ao carrinho.');
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 1 item');
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 2 itens');
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 3 itens');
    await page.locator('#link-carrinho').click();
    await expect(valor(page, 'subtotal')).toHaveText('R$ 149,70');
    await page.getByRole('button', { name: 'Aumentar Pizza Margherita' }).click();
    await expect(valor(page, 'subtotal')).toHaveText('R$ 199,60');
    await page.waitForTimeout(300); // folga para um aviso repetido (setTimeout 0 + 30 ms) aparecer no registro
    expect(await vezesFalha(), 'aviso de falha deve aparecer uma única vez').toBe(1);
    expect(erros).toEqual([]);
  });
});
