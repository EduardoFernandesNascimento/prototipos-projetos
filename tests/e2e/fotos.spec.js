// Fotos reais (REQ-012): E2E-01 a E2E-04 e E2E-06 da spec da F-002, com a fonte trocada para o Wikimedia Commons
// (requisitos.md, decisão da pessoa em 2026-11-08). E2E-05 (reserva SVG) está em logo.spec.js.
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { url, semViolacoes } = require('./ajuda');

const ROTAS_FUNDO = ['#/', '#/restaurante/3'];
const SRC = path.join(__dirname, '..', '..', 'src');
const IMG = path.join(SRC, 'img');

/** Lê dados.js em Node (o arquivo só define window.RANGO_DADOS). */
function dados() {
  const window = {};
  new Function('window', fs.readFileSync(path.join(SRC, 'js', 'dados.js'), 'utf8'))(window);
  return window.RANGO_DADOS;
}
function itens() {
  const out = [];
  for (const r of dados().restaurantes) {
    out.push({ tipo: 'restaurante', id: r.id, nome: r.nome, foto: r.foto, alt: r.alt });
    for (const s of r.secoes) for (const p of s.pratos) out.push({ tipo: 'prato', id: p.id, nome: p.nome, foto: p.foto, alt: p.alt });
  }
  return out;
}

/** Rola até o fim para as fotos lazy carregarem e devolve o estado de cada foto. */
async function estadoFotos(page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForFunction(() => [...document.querySelectorAll('img.cartao__foto, img.capa')].every((i) => i.complete));
  return page.locator('img.cartao__foto, img.capa').evaluateAll((imgs) => imgs.map((i) => ({
    ok: i.complete && i.naturalWidth > 0, src: i.currentSrc, erro: i.dataset.erro || null,
    alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), lazy: i.getAttribute('loading'),
    srcset: i.getAttribute('srcset'), sizes: i.getAttribute('sizes'),
  })));
}

test.describe('US-12 fotos reais', () => {
  test('[REQ-012] [REQ-002] E2E-01 E2E-02 todas as fotos carregam em WebP local, sem rede fora de file://', async ({ page }) => {
    const externas = [];
    page.on('request', (r) => { if (!r.url().startsWith('file:')) externas.push(r.url()); });
    for (const rota of ['#/', '#/restaurante/1', '#/restaurante/2', '#/restaurante/3', '#/restaurante/4', '#/restaurante/5', '#/restaurante/6']) {
      await page.goto(url(rota));
      await expect(page.locator('main h1')).toBeVisible();
      const fotos = await estadoFotos(page);
      expect(fotos.length, rota).toBeGreaterThan(0);
      for (const f of fotos) {
        expect(f.ok, `${rota} ${f.src}`).toBe(true);
        expect(f.erro, `${rota} ${f.src}`).toBeNull();
        expect(f.src, rota).toMatch(/\/img\/(restaurante|prato)-[^/]+\.webp$/);
        expect(f.srcset, rota).toMatch(/\.webp \d+w, .+\.webp \d+w$/);
        expect(f.sizes, rota).toBeTruthy();
      }
    }
    expect(externas).toEqual([]);
  });

  test('[REQ-012] E2E-03 arquivos WebP até 150 KB, nomes da convenção e as duas larguras de cada item', async () => {
    const arquivos = fs.readdirSync(IMG).filter((f) => /\.(webp|jpg)$/.test(f));
    for (const f of arquivos) {
      expect(f).toMatch(/^(restaurante|prato)-\d+-[a-z0-9-]+-\d+\.(webp|jpg)$/);
      expect(fs.statSync(path.join(IMG, f)).size, f).toBeLessThanOrEqual(153600);
    }
    const lista = itens();
    expect(lista).toHaveLength(43);
    for (const it of lista) {
      expect(it.foto, `${it.tipo} ${it.id} sem foto`).toMatch(new RegExp(`^img/${it.tipo}-${it.id}-[a-z0-9-]+$`));
      const larguras = it.tipo === 'restaurante' ? [480, 960] : [400, 800];
      for (const l of larguras) expect(fs.existsSync(path.join(SRC, `${it.foto}-${l}.webp`)), `${it.foto}-${l}.webp`).toBe(true);
      expect(it.alt.length).toBeGreaterThan(0);
      expect(it.alt.length).toBeLessThanOrEqual(120);
      expect(it.alt).not.toMatch(/^(Foto|Imagem) de/i);
    }
    const bases = new Set(arquivos.map((f) => f.replace(/-\d+\.(webp|jpg)$/, '')));
    expect(bases.size).toBe(43);
  });

  test('[REQ-012] E2E-04 CREDITOS.md com uma linha por arquivo-base, origem no Commons e licença aceita', async () => {
    const md = fs.readFileSync(path.join(IMG, 'CREDITOS.md'), 'utf8');
    const linhas = md.split('\n').filter((l) => /^\| (restaurante|prato)-/.test(l));
    const bases = [...new Set(fs.readdirSync(IMG).filter((f) => /\.(webp|jpg)$/.test(f)).map((f) => f.replace(/-\d+\.(webp|jpg)$/, '')))];
    expect(linhas).toHaveLength(bases.length);
    for (const b of bases) {
      const l = linhas.find((x) => x.startsWith(`| ${b} |`));
      expect(l, b).toBeTruthy();
      const cols = l.split(/(?<!\\)\|/).map((c) => c.trim());
      expect(cols[3], `${b} autor`).not.toBe('');
      expect(cols[4], `${b} origem`).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(cols[5], `${b} licença`).toMatch(/^(Creative Commons Atribuição(-CompartilhaIgual)? \d(\.\d)? \(CC BY(-SA)? \d(\.\d)?\) \(https:\/\/creativecommons\.org\/licenses\/by(-sa)?\/\d\.\d\/?[^)]*\)|CC0 1\.0 .+|Domínio público.*)$/);
      expect(cols[5]).not.toMatch(/\b(NC|ND)\b/);
    }
  });

  test('[REQ-012] [REQ-010] E2E-06 alt descritivo, width/height e lazy só abaixo da dobra', async ({ page }) => {
    await page.goto(url('#/'));
    const inicio = await estadoFotos(page);
    inicio.forEach((f, i) => {
      expect(f.alt.trim().length).toBeGreaterThan(0);
      expect([f.w, f.h]).toEqual(['480', '270']);
      if (i < 2) expect(f.lazy).toBeNull(); else expect(f.lazy).toBe('lazy');
    });
    await page.goto(url('#/restaurante/3'));
    const capa = await page.locator('img.capa').evaluate((i) => ({ lazy: i.getAttribute('loading'), alt: i.alt, w: i.getAttribute('width'), h: i.getAttribute('height') }));
    expect(capa).toEqual({ lazy: null, alt: expect.stringMatching(/\S/), w: '480', h: '270' });
    await estadoFotos(page);
    const pratos = await page.locator('.cartao-prato img.cartao__foto').evaluateAll((imgs) => imgs.map((i) => ({
      alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), lazy: i.getAttribute('loading') })));
    expect(pratos.length).toBeGreaterThan(2);
    pratos.forEach((f, i) => {
      expect(f.alt.trim().length).toBeGreaterThan(0);
      expect([f.w, f.h]).toEqual(['400', '300']);
      // lazy a partir do 3o prato (abaixo da dobra)
      if (i < 2) expect(f.lazy, 'prato ' + (i + 1)).toBeNull(); else expect(f.lazy, 'prato ' + (i + 1)).toBe('lazy');
    });
  });

  test('[REQ-012] UX-01 espaço da foto reservado com fundo --cor-marca-clara enquanto carrega', async ({ page }) => {
    for (const rota of ROTAS_FUNDO) {
      await page.goto(url(rota));
      const fundos = await page.locator('img.cartao__foto, img.capa').evaluateAll((imgs) => imgs.map((i) => getComputedStyle(i).backgroundColor));
      expect(fundos.length, rota).toBeGreaterThan(0);
      for (const f of fundos) expect(f, rota).toBe('rgb(251, 233, 231)');
    }
  });

  test('[REQ-012] crédito visível: rodapé leva a #/creditos com autor, licença e origem de cada foto', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    await page.getByRole('contentinfo').getByRole('link', { name: 'Créditos das fotos' }).click();
    await expect(page).toHaveURL(/#\/creditos$/);
    await expect(page).toHaveTitle('Créditos das fotos · Rango');
    await expect(page.getByRole('heading', { level: 1, name: 'Créditos das fotos' })).toBeFocused();
    await expect(page.locator('.credito')).toHaveCount(43);
    const primeiro = page.locator('.credito').first();
    await expect(primeiro.getByRole('link').last()).toHaveAttribute('href', /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    await expect(primeiro).toContainText('Autor');
    await expect(primeiro).toContainText('Licença');
  });
});

for (const largura of [320, 1280]) {
  test.describe(`créditos em ${largura} px`, () => {
    test.use({ viewport: { width: largura, height: 800 } });
    test('[REQ-012] [REQ-010] [REQ-009] #/creditos sem violações do axe e sem rolagem horizontal', async ({ page }) => {
      await page.goto(url('#/creditos'));
      await expect(page.locator('main h1')).toBeVisible();
      const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(rola).toBe(false);
      await semViolacoes(page);
    });
  });
}
