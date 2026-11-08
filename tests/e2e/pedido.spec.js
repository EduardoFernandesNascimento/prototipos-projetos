const { test, expect } = require('@playwright/test');
const { url, preCarregar, pedidoExemplo } = require('./ajuda');

test.describe('US-09 Acompanhamento', () => {
  test('[REQ-008] sem pedido mostra o estado vazio', async ({ page }) => {
    await page.goto(url('#/pedido'));
    await expect(page).toHaveTitle('Acompanhar pedido · Rango');
    await expect(page.getByRole('heading', { level: 1, name: 'Nenhum pedido em andamento' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver restaurantes' })).toHaveAttribute('href', '#/');
  });

  test('[REQ-008] [REQ-010] etapas avançam sozinhas e a atual é anunciada (A11Y-13)', async ({ page }) => {
    await page.addInitScript(() => { window.__RANGO_TEMPO_ETAPA_MS = 700; });
    await preCarregar(page, { 'rango:pedido': pedidoExemplo() });
    await page.goto(url('#/pedido'));
    await expect(page.getByRole('heading', { level: 1, name: 'Pedido #4321' })).toBeVisible();
    const status = page.locator('#etapa-atual');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveText('Etapa atual: Confirmado.');
    await expect(page.locator('li[aria-current="step"]')).toHaveCount(1);
    await expect(page.locator('li[aria-current="step"]')).toContainText('Confirmado');
    await expect(status).toHaveText('Etapa atual: Em preparo.');
    await expect(page.locator('li[aria-current="step"]')).toHaveCount(1);
    await expect(page.locator('.etapa').first()).toContainText('(concluída)');
    await expect(status).toHaveText('Etapa atual: A caminho.');
    await expect(status).toHaveText('Pedido entregue. Bom apetite!');
    await expect(page.getByRole('link', { name: 'Fazer outro pedido' })).toHaveAttribute('href', '#/');
  });

  test('[REQ-008] recarregar não reinicia as etapas (estado pelo horário do pedido)', async ({ page }) => {
    await preCarregar(page, { 'rango:pedido': pedidoExemplo(Date.now() - 11000) });
    await page.goto(url('#/pedido'));
    await expect(page.locator('#etapa-atual')).toHaveText('Etapa atual: A caminho.');
    await page.reload();
    await expect(page.locator('#etapa-atual')).toHaveText('Etapa atual: A caminho.');
  });

  test('[REQ-008] resumo mostra itens, total, endereço e pagamento', async ({ page }) => {
    await preCarregar(page, { 'rango:pedido': pedidoExemplo() });
    await page.goto(url('#/pedido'));
    const resumo = page.locator('.resumo');
    await expect(resumo).toContainText('1× Pizza Margherita');
    await expect(resumo).toContainText('R$ 55,89');
    await expect(resumo).toContainText('Avenida Paulista, 1000');
    await expect(resumo).toContainText('Pix');
  });
});
