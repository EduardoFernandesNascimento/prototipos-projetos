// Sem rolagem horizontal em 320, 360, 768 e 1280 px, com dados pré-carregados (o conferir-responsividade.mjs mede só a página como abre).
const { test, expect } = require('@playwright/test');
const { url, preCarregar, carrinhoExemplo, pedidoExemplo } = require('./ajuda');

const telas = [
  { rota: '#/' },
  { rota: '#/restaurante/6' },
  { rota: '#/carrinho', dados: { 'rango:carrinho': carrinhoExemplo } },
  { rota: '#/checkout', dados: { 'rango:carrinho': carrinhoExemplo }, acao: (p) => p.getByRole('button', { name: 'Confirmar pedido' }).click() },
  { rota: '#/pedido', dados: { 'rango:pedido': pedidoExemplo(Date.now() - 6000) } },
];

for (const largura of [320, 360, 768, 1280]) {
  test.describe(`${largura} px`, () => {
    test.use({ viewport: { width: largura, height: 800 } });
    for (const t of telas) {
      test(`[REQ-009] ${t.rota} com dados sem rolagem horizontal e alvos ≥ 24 px`, async ({ page }) => {
        if (t.dados) await preCarregar(page, t.dados);
        await page.goto(url(t.rota));
        await expect(page.locator('main h1')).toBeVisible();
        if (t.acao) await t.acao(page);
        const m = await page.evaluate(() => {
          const de = document.documentElement;
          const pequenos = [...document.querySelectorAll('a[href], button, input:not([type=hidden])')]
            .filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return r.width && r.height && s.display !== 'inline' && s.opacity !== '0' && (r.width < 24 || r.height < 24); })
            .map((el) => el.outerHTML.slice(0, 80));
          return { sw: de.scrollWidth, vw: de.clientWidth, pequenos };
        });
        expect(m.sw, 'scrollWidth').toBeLessThanOrEqual(m.vw);
        expect(m.pequenos).toEqual([]);
      });
    }
  });
}

test('[REQ-009] meta viewport libera o zoom', async ({ page }) => {
  await page.goto(url('#/'));
  const meta = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(meta).toBe('width=device-width, initial-scale=1');
});
