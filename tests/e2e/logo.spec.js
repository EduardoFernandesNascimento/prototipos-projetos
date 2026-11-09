// Nova logo (REQ-014): E2E-13 a E2E-15 (A11Y-03, A11Y-13, A11Y-14) e reserva das fotos (REQ-012, E2E-05).
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { url } = require('./ajuda');

const SRC = path.join(__dirname, '..', '..', 'src');

for (const [largura, altura] of [[320, 28], [1280, 32]]) {
  test.describe(`logo em ${largura} px`, () => {
    test.use({ viewport: { width: largura, height: 800 } });
    test(`[REQ-014] E2E-13 link "Rango" para #/, SVG com ${altura} px de altura (A11Y-03)`, async ({ page }) => {
      await page.goto(url('#/restaurante/1'));
      const link = page.getByRole('banner').getByRole('link', { name: 'Rango', exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', '#/');
      const svg = link.locator('svg');
      await expect(svg).toHaveCount(1);
      const caixa = await svg.boundingBox();
      expect(caixa.height).toBeGreaterThanOrEqual(altura);
      if (largura === 320) expect(caixa.width).toBeLessThanOrEqual(128);
      const alvo = await link.boundingBox();
      expect(alvo.width).toBeGreaterThanOrEqual(44);
      expect(alvo.height).toBeGreaterThanOrEqual(44);
      await link.click();
      await expect(page).toHaveURL(/#\/$/);
    });
  });
}

test('[REQ-014] E2E-14 favicon SVG existe e a marca antiga saiu', async ({ page }) => {
  await page.goto(url('#/'));
  const href = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href');
  expect(href).toBe('img/favicon-rango.svg');
  expect(fs.existsSync(path.join(SRC, href))).toBe(true);
  expect(fs.existsSync(path.join(SRC, 'img', 'logo-rango.svg'))).toBe(true);
  expect(await page.locator('path[d^="M4 11h16a8"]').count()).toBe(0);
  const fav = fs.readFileSync(path.join(SRC, href), 'utf8');
  expect(fav).toContain('viewBox="0 0 32 32"');
});

test('[REQ-014] E2E-15 contraste da logo: nome ≥ 4,5:1 e símbolo ≥ 3:1 contra o cabeçalho (A11Y-13)', async ({ page }) => {
  await page.goto(url('#/'));
  const r = await page.evaluate(() => {
    const rgb = (c) => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
    const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const razao = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const fundo = getComputedStyle(document.querySelector('.cabecalho')).backgroundColor;
    const logo = document.querySelector('.marca__logo');
    const cores = (sel) => [...logo.querySelectorAll(sel)].map((el) => {
      const s = getComputedStyle(el);
      return s.fill !== 'none' ? s.fill : s.stroke;
    });
    const nome = cores('.marca__nome path');
    const simbolo = cores(':scope > g:not(.marca__nome) path, :scope > path:not(.marca__r), :scope > rect');
    return { fundo, nome: nome.map((c) => razao(c, fundo)), simbolo: simbolo.map((c) => razao(c, fundo)), n: nome.length, s: simbolo.length };
  });
  expect(r.fundo).toBe('rgb(255, 255, 255)');
  expect(r.n).toBe(5);
  expect(r.s).toBeGreaterThanOrEqual(4);
  for (const c of r.nome) expect(c).toBeGreaterThanOrEqual(4.5);
  for (const c of r.simbolo) expect(c).toBeGreaterThanOrEqual(3);
});

test('[REQ-012] E2E-05 foto que falha cai na ilustração SVG uma vez só', async ({ page }) => {
  await page.goto(url('#/restaurante/1'));
  const img = page.locator('img.cartao__foto').first();
  await img.evaluate((el) => { el.removeAttribute('srcset'); el.src = 'img/nao-existe.webp'; });
  await expect(img).toHaveAttribute('data-erro', 'sim');
  await expect(img).toHaveAttribute('src', /\.svg$/);
  expect(await img.getAttribute('srcset')).toBeNull();
  expect(await img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
  // reserva também quebrada: não tenta de novo (sem laço de error)
  // espera o evento de erro da reserva e o tratamento dele (ouvinte em captura no document) terminar
  await img.evaluate((el) => new Promise((resolve) => {
    el.addEventListener('error', () => setTimeout(resolve, 0), { once: true });
    el.src = 'img/nao-existe-2.svg';
  }));
  await expect(img).toHaveAttribute('src', 'img/nao-existe-2.svg');
});
