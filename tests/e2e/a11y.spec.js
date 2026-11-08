// Axe (@axe-core/playwright) em cada tela e estado da spec (A11Y-01 a A11Y-09), em 360 e 1280 px.
const { test, expect } = require('@playwright/test');
const { url, preCarregar, carrinhoExemplo, pedidoExemplo, semViolacoes } = require('./ajuda');

const estados = [
  { id: 'A11Y-01', nome: 'Início com lista', rota: '#/' },
  { id: 'A11Y-02', nome: 'Início vazia', rota: '#/', acao: async (p) => { await p.getByLabel('Buscar restaurante').fill('zzzz'); await expect(p.getByRole('button', { name: 'Limpar filtros' })).toBeVisible(); } },
  { id: 'A11Y-03', nome: 'Restaurante', rota: '#/restaurante/1' },
  { id: 'A11Y-04', nome: 'Restaurante não encontrado', rota: '#/restaurante/999' },
  { id: 'A11Y-05', nome: 'Diálogo de troca aberto', rota: '#/restaurante/2', dados: { 'rango:carrinho': { restauranteId: 1, itens: [{ pratoId: 101, qtd: 1 }] } },
    acao: async (p) => { await p.getByRole('button', { name: 'Adicionar Clássico da Casa' }).click(); await expect(p.getByRole('dialog')).toBeVisible(); } },
  { id: 'A11Y-06', nome: 'Carrinho com itens', rota: '#/carrinho', dados: { 'rango:carrinho': carrinhoExemplo } },
  { id: 'A11Y-06', nome: 'Carrinho vazio', rota: '#/carrinho' },
  { id: 'A11Y-07', nome: 'Checkout com erros', rota: '#/checkout', dados: { 'rango:carrinho': carrinhoExemplo },
    acao: async (p) => { await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await expect(p.locator('#resumo-erros')).toBeVisible(); } },
  { id: 'A11Y-07', nome: 'Checkout com dinheiro e troco inválido', rota: '#/checkout', dados: { 'rango:carrinho': carrinhoExemplo },
    acao: async (p) => { await p.getByRole('radio', { name: 'Dinheiro' }).check(); await p.getByLabel('Troco para quanto?').fill('1'); await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await expect(p.locator('#troco-erro')).toBeVisible(); } },
  { id: 'A11Y-08', nome: 'Checkout vazio', rota: '#/checkout' },
  { id: 'A11Y-09', nome: 'Pedido em andamento', rota: '#/pedido', dados: { 'rango:pedido': pedidoExemplo(Date.now() - 6000) } },
  { id: 'A11Y-09', nome: 'Pedido entregue', rota: '#/pedido', dados: { 'rango:pedido': pedidoExemplo(Date.now() - 60000) } },
  { id: 'A11Y-09', nome: 'Sem pedido', rota: '#/pedido' },
];

for (const largura of [360, 1280]) {
  test.describe(`axe em ${largura} px`, () => {
    test.use({ viewport: { width: largura, height: 800 } });
    for (const e of estados) {
      test(`[REQ-010] ${e.id} ${e.nome} sem violações`, async ({ page }) => {
        if (e.dados) await preCarregar(page, e.dados);
        await page.goto(url(e.rota));
        await expect(page.locator('main h1')).toBeVisible();
        if (e.acao) await e.acao(page);
        await semViolacoes(page);
      });
    }
  });
}

test('[REQ-010] aviso visível (toast) sem violações', async ({ page }) => {
  await page.goto(url('#/restaurante/3'));
  await page.getByRole('button', { name: 'Adicionar Guioza de porco' }).click();
  await expect(page.locator('#aviso')).toContainText('Guioza de porco adicionado ao carrinho.');
  await semViolacoes(page);
});
