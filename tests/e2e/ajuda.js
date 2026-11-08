// Utilitários compartilhados dos testes e2e do protótipo Rango.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const URL_BASE = pathToFileURL(path.join(__dirname, '..', '..', 'src', 'index.html')).href;

/** URL da página com a rota em hash (ex.: '#/carrinho'). */
const url = (rota = '') => URL_BASE + rota;

/** Pré-carrega o localStorage antes de a página rodar (o file:// tem origem própria; o script roda em cada navegação). */
async function preCarregar(page, dados) {
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('__pre')) return; // só na primeira carga, para não desfazer o que o teste mudou
    sessionStorage.setItem('__pre', '1');
    for (const [k, v] of Object.entries(d)) localStorage.setItem(k, JSON.stringify(v));
  }, dados);
}

const carrinhoExemplo = { restauranteId: 1, itens: [{ pratoId: 101, qtd: 2 }, { pratoId: 106, qtd: 1 }] };
const pedidoExemplo = (criadoEm = Date.now()) => ({
  numero: '4321',
  restauranteId: 1,
  itens: [{ pratoId: 101, qtd: 1 }],
  endereco: { cep: '01310-100', rua: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', complemento: '' },
  pagamento: { tipo: 'pix' },
  criadoEm,
});

/** Axe com as tags da spec (§6); falha listando o id de cada regra violada. */
async function semViolacoes(page) {
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  const resumo = r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(resumo, 'violações do axe').toEqual([]);
}

/** Aperta Tab até o localizador ficar focado (fluxo só com teclado). */
async function tabAte(page, locator, max = 60) {
  for (let i = 0; i < max; i++) {
    if (await locator.evaluate((el) => el === document.activeElement).catch(() => false)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('não chegou ao elemento com Tab');
}

const focoNoTitulo = (page) => page.evaluate(() => document.activeElement === document.querySelector('main h1'));

module.exports = { url, preCarregar, carrinhoExemplo, pedidoExemplo, semViolacoes, tabAte, focoNoTitulo };
