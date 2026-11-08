const { test, expect } = require('@playwright/test');
const { url, tabAte } = require('./ajuda');

test.describe('US-11 fluxo completo', () => {
  test('[REQ-011] [REQ-001] início → restaurante → carrinho → checkout → pedido', async ({ page }) => {
    await page.goto(url());
    await page.getByRole('radio', { name: 'Japonesa' }).check();
    await page.getByRole('link', { name: 'Sushi Kaori' }).click();
    await page.getByRole('button', { name: 'Adicionar Hot Philadelphia' }).click();
    await page.getByRole('button', { name: 'Adicionar Guioza de porco' }).click();
    await page.locator('#link-carrinho').click();
    await expect(page).toHaveTitle('Carrinho · Rango');
    await page.getByRole('link', { name: 'Ir para o pagamento' }).click();
    await expect(page).toHaveTitle('Checkout · Rango');
    await page.getByLabel('CEP').fill('04538133');
    await page.getByLabel('Rua').fill('Rua Funchal');
    await page.getByLabel('Número').fill('418');
    await page.getByLabel('Bairro').fill('Vila Olímpia');
    await page.getByRole('radio', { name: 'Cartão na entrega' }).check();
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await expect(page).toHaveURL(/#\/pedido$/);
    await expect(page.locator('.pedido-restaurante')).toHaveText('Sushi Kaori');
    await expect(page.locator('.resumo')).toContainText('Cartão na entrega');
  });

  test('[REQ-010] [REQ-011] fluxo inteiro só com teclado (A11Y-15)', async ({ page }) => {
    await page.goto(url());
    await tabAte(page, page.getByRole('link', { name: 'Verde Vivo' }));
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Verde Vivo' })).toBeFocused();
    await tabAte(page, page.getByRole('button', { name: 'Adicionar Bowl de quinoa' }));
    await page.keyboard.press('Enter');
    await expect(page.locator('#aviso')).toContainText('Bowl de quinoa adicionado ao carrinho.');
    await page.keyboard.press('Space');
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 2 itens');
    // volta ao cabeçalho com Shift+Tab até o link do carrinho
    for (let i = 0; i < 40; i++) {
      if (await page.locator('#link-carrinho').evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press('Shift+Tab');
    }
    await expect(page.locator('#link-carrinho')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Seu carrinho' })).toBeFocused();
    await tabAte(page, page.getByRole('link', { name: 'Ir para o pagamento' }));
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Finalizar pedido' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('CEP')).toBeFocused();
    await page.keyboard.type('01310100');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Avenida Paulista');
    await page.keyboard.press('Tab');
    await page.keyboard.type('900');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Bela Vista');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Pix' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByRole('radio', { name: 'Pix' })).toBeChecked();
    await tabAte(page, page.getByRole('button', { name: 'Confirmar pedido' }));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/pedido$/);
    await expect(page.getByRole('heading', { level: 1, name: /^Pedido #\d{4}$/ })).toBeFocused();
  });
});

test.describe('RESP-10 toque em 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

  test('[REQ-009] chega a "Confirmar pedido" só com toques', async ({ page }) => {
    await page.goto(url());
    await page.getByRole('link', { name: 'Burger do Bairro' }).tap();
    await page.getByRole('button', { name: 'Adicionar Clássico da Casa' }).tap();
    await page.getByRole('button', { name: 'Fechar aviso' }).tap();
    await page.locator('#link-carrinho').tap();
    await page.getByRole('button', { name: 'Aumentar Clássico da Casa' }).tap();
    await expect(page.locator('.qtd__valor')).toHaveText('2');
    await page.getByRole('link', { name: 'Ir para o pagamento' }).tap();
    await page.getByLabel('CEP').tap();
    await page.keyboard.type('01310100');
    await page.getByLabel('Rua').tap();
    await page.keyboard.type('Rua Augusta');
    await page.getByLabel('Número').tap();
    await page.keyboard.type('50');
    await page.getByLabel('Bairro').tap();
    await page.keyboard.type('Consolação');
    await page.getByText('Pix', { exact: true }).tap();
    await expect(page.getByRole('radio', { name: 'Pix' })).toBeChecked();
    const confirmar = page.getByRole('button', { name: 'Confirmar pedido' });
    const caixa = await confirmar.boundingBox();
    expect(caixa.height).toBeGreaterThanOrEqual(44);
    await confirmar.tap();
    await expect(page).toHaveURL(/#\/pedido$/);
    const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(rola).toBe(false);
  });
});

test.describe('RESP-09 movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('[REQ-009] [REQ-010] sem transição nem animação com prefers-reduced-motion: reduce (A11Y-16)', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await expect(page.locator('#aviso')).toContainText('adicionado');
    const estilos = await page.evaluate(() => [document.querySelector('.botao-adicionar'), document.querySelector('.aviso-caixa')]
      .map((el) => ({ t: getComputedStyle(el).transitionDuration, a: getComputedStyle(el).animationName })));
    for (const e of estilos) { expect(e.t).toBe('0s'); expect(e.a).toBe('none'); }
    await page.goto(url('#/carrinho'));
    const principal = await page.locator('.botao-principal').first().evaluate((el) => ({ t: getComputedStyle(el).transitionDuration, a: getComputedStyle(el).animationName }));
    expect(principal).toEqual({ t: '0s', a: 'none' });
  });
});
