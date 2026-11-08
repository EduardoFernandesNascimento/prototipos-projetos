const { test, expect } = require('@playwright/test');
const { url, preCarregar, carrinhoExemplo } = require('./ajuda');

const confirmar = (page) => page.getByRole('button', { name: 'Confirmar pedido' });

async function preencherEndereco(page) {
  await page.getByLabel('CEP').fill('01310100');
  await page.getByLabel('Rua').fill('Avenida Paulista');
  await page.getByLabel('Número').fill('s/n');
  await page.getByLabel('Bairro').fill('Bela Vista');
}

test.describe('US-08 Checkout', () => {
  test('[REQ-007] carrinho vazio mostra aviso e não redireciona', async ({ page }) => {
    await page.goto(url('#/checkout'));
    await expect(page).toHaveURL(/#\/checkout$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Finalizar pedido' })).toBeVisible();
    await expect(page.getByText('Seu carrinho está vazio. Adicione pratos antes de finalizar.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver restaurantes' })).toBeVisible();
  });

  test('[REQ-007] [REQ-010] enviar vazio mostra resumo de erros, liga mensagens aos campos e foca o primeiro (A11Y-11)', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/checkout'));
    await confirmar(page).click();
    const resumo = page.locator('#resumo-erros');
    await expect(resumo).toHaveAttribute('role', 'alert');
    await expect(resumo.getByRole('heading', { level: 2 })).toHaveText('Corrija 5 campos para continuar');
    await expect(page.locator('#cep')).toBeFocused();
    await expect(page.locator('#cep')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#cep')).toHaveAttribute('aria-describedby', /(^|\s)cep-erro(\s|$)/);
    await expect(page.locator('#cep-erro')).toHaveText('Informe o CEP.');
    await expect(page.locator('#rua-erro')).toHaveText('Informe a rua.');
    await expect(page.locator('#numero-erro')).toHaveText('Informe o número ou s/n.');
    await expect(page.locator('#bairro-erro')).toHaveText('Informe o bairro.');
    await expect(page.locator('#pagamento-erro')).toHaveText('Escolha a forma de pagamento.');
    await expect(page.locator('#grupo-pagamento')).toHaveAttribute('aria-describedby', 'pagamento-erro');
    await expect(page.getByRole('radio', { name: 'Pix' })).toHaveAttribute('aria-describedby', 'pagamento-erro');
    await resumo.getByRole('link', { name: /Bairro/ }).click();
    await expect(page.locator('#bairro')).toBeFocused();
    await expect(page).toHaveURL(/#\/checkout$/);
  });

  test('[REQ-007] valida ao sair do campo só depois de digitar; máscara do CEP', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/checkout'));
    await page.getByLabel('CEP').focus();
    await page.getByLabel('Rua').focus();
    await expect(page.locator('#cep-erro')).toBeHidden();
    await page.getByLabel('CEP').fill('0131');
    await page.getByLabel('Rua').focus();
    await expect(page.locator('#cep-erro')).toHaveText('CEP deve ter 8 dígitos, como 01310-100.');
    await page.getByLabel('CEP').fill('');
    await page.getByLabel('CEP').pressSequentially('01310100');
    await expect(page.getByLabel('CEP')).toHaveValue('01310-100');
    await expect(page.locator('#cep-erro')).toBeHidden();
    await expect(page.getByLabel('CEP')).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('[REQ-007] troco em dinheiro: opcional, numérico e maior ou igual ao total', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/checkout'));
    await preencherEndereco(page);
    await expect(page.getByLabel('Troco para quanto?')).toBeHidden();
    await page.getByRole('radio', { name: 'Dinheiro' }).check();
    const troco = page.getByLabel('Troco para quanto?');
    await expect(troco).toBeVisible();
    await expect(troco).toHaveAttribute('aria-describedby', 'troco-dica');
    await troco.fill('abc');
    await confirmar(page).click();
    await expect(page.locator('#troco-erro')).toHaveText('Informe um valor, como 50,00.');
    await expect(troco).toBeFocused();
    await expect(troco).toHaveAttribute('aria-describedby', 'troco-erro troco-dica');
    await troco.fill('50,00');
    await confirmar(page).click();
    await expect(page.locator('#troco-erro')).toHaveText('O troco deve ser para R$ 112,69 ou mais.');
    await troco.fill('');
    await confirmar(page).click();
    await expect(page.getByRole('button', { name: 'Confirmando…' })).toBeDisabled();
    await expect(page).toHaveURL(/#\/pedido$/);
  });

  test('[REQ-007] envio válido mostra "Confirmando…", grava o pedido, esvazia o carrinho e vai para #/pedido', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/checkout'));
    await expect(page.locator('.resumo')).toContainText('Forno da Vila');
    await expect(page.locator('.resumo')).toContainText('R$ 112,69');
    await preencherEndereco(page);
    await page.getByLabel('Complemento (opcional)').fill('Apto 12');
    await page.getByRole('radio', { name: 'Dinheiro' }).check();
    await page.getByLabel('Troco para quanto?').fill('150');
    await confirmar(page).click();
    const carregando = page.getByRole('button', { name: 'Confirmando…' });
    await expect(carregando).toBeDisabled();
    await expect(carregando).toHaveAttribute('aria-disabled', 'true');
    await expect(page).toHaveURL(/#\/pedido$/);
    await expect(page.getByRole('heading', { level: 1, name: /^Pedido #\d{4}$/ })).toBeVisible();
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 0 itens');
    const salvo = await page.evaluate(() => ({ c: localStorage.getItem('rango:carrinho'), p: JSON.parse(localStorage.getItem('rango:pedido')) }));
    expect(salvo.c).toBeNull();
    expect(salvo.p.endereco).toMatchObject({ cep: '01310-100', rua: 'Avenida Paulista', numero: 's/n', bairro: 'Bela Vista', complemento: 'Apto 12' });
    expect(salvo.p.pagamento).toEqual({ tipo: 'dinheiro', troco: 15000 });
    await expect(page.locator('.resumo')).toContainText('Dinheiro (troco para R$ 150,00)');
  });
  test('[REQ-007] sair do checkout durante "Confirmando…" cancela o pedido e não força a ida a #/pedido', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/checkout'));
    await preencherEndereco(page);
    await page.getByRole('radio', { name: 'Pix' }).check();
    await confirmar(page).click();
    await expect(page.getByRole('button', { name: 'Confirmando…' })).toBeDisabled();
    await page.locator('#link-carrinho').click();
    await expect(page).toHaveURL(/#\/carrinho$/);
    await page.waitForTimeout(1200);
    await expect(page).toHaveURL(/#\/carrinho$/);
    await expect(page.locator('.item')).toHaveCount(2);
    const salvo = await page.evaluate(() => localStorage.getItem('rango:pedido'));
    expect(salvo).toBeNull();
  });
});
