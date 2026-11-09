// Cards que saltam (REQ-013): E2E-07 a E2E-12, E2E-28 e E2E-31 da spec da F-002 (RESP-09, RESP-10).
const { test, expect } = require('@playwright/test');
const { url, tabAte } = require('./ajuda');

/** Valor computado de --sombra-forte (o destino da transição de hover e foco). */
const sombraForte = (page) => page.evaluate(() => {
  const d = document.createElement('div');
  d.style.boxShadow = 'var(--sombra-forte)';
  document.body.appendChild(d);
  const v = getComputedStyle(d).boxShadow;
  d.remove();
  return v;
});
const SUBIU = 'matrix(1, 0, 0, 1, 0, -4)';
const estilo = (loc) => loc.evaluate((el) => {
  const s = getComputedStyle(el);
  return { transform: s.transform, sombra: s.boxShadow, borda: s.borderTopColor, duracao: s.transitionDuration, outline: s.outlineStyle };
});

test.describe('salto no hover com mouse', () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });

  test('[REQ-013] E2E-07 card de restaurante sobe e ganha sombra forte; volta ao tirar o mouse', async ({ page }) => {
    await page.goto(url('#/'));
    const card = page.locator('.cartao-restaurante').first();
    const repouso = await estilo(card);
    expect(repouso.transform).toBe('none');
    await card.hover();
    await expect.poll(async () => (await estilo(card)).transform).toBe('matrix(1, 0, 0, 1, 0, -4)');
    expect((await estilo(card)).sombra).not.toBe(repouso.sombra);
    await page.mouse.move(5, 890);
    await expect.poll(async () => (await estilo(card)).transform).toBe('none');
  });

  test('[REQ-013] E2E-08 card de prato sobe no hover', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    const card = page.locator('.cartao-prato').first();
    const repouso = await estilo(card);
    await card.hover();
    await expect.poll(async () => (await estilo(card)).transform).toBe('matrix(1, 0, 0, 1, 0, -4)');
    expect((await estilo(card)).sombra).not.toBe(repouso.sombra);
  });

  test('[REQ-013] E2E-09 o salto não mexe no vizinho nem cria rolagem horizontal', async ({ page }) => {
    await page.goto(url('#/'));
    const segundo = page.locator('.cartao-restaurante').nth(1);
    const antes = await segundo.boundingBox();
    const primeiro = page.locator('.cartao-restaurante').first();
    await primeiro.hover();
    await expect.poll(async () => (await estilo(primeiro)).transform).toBe(SUBIU);
    expect(await segundo.boundingBox()).toEqual(antes);
    const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(rola).toBe(false);
  });

  test('[REQ-013] [REQ-003] E2E-28 filtro e busca: hover não mexe na grade filtrada', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByRole('radio', { name: 'Pizza' }).check();
    await expect(page.locator('.cartao-restaurante')).toHaveCount(2);
    const segundo = page.locator('.cartao-restaurante').nth(1);
    const antes = await segundo.boundingBox();
    const primeiro = page.locator('.cartao-restaurante').first();
    await primeiro.hover();
    await expect.poll(async () => (await estilo(primeiro)).transform).toBe(SUBIU);
    expect(await segundo.boundingBox()).toEqual(antes);
    await page.getByLabel('Buscar restaurante').fill('Forno');
    await expect(page.locator('.cartao-restaurante')).toHaveCount(1);
    const fotos = await page.locator('.cartao-restaurante img').evaluateAll((imgs) => imgs.map((i) => i.complete && i.naturalWidth > 0));
    expect(fotos).toEqual([true]);
    const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(rola).toBe(false);
  });

  test('[REQ-013] [REQ-010] E2E-10 foco por teclado dá o mesmo destaque do hover (A11Y-15)', async ({ page }) => {
    await page.goto(url('#/'));
    const card = page.locator('.cartao-restaurante').first();
    const sombraHover = await sombraForte(page);
    await card.hover();
    await expect.poll(async () => (await estilo(card)).transform).toBe(SUBIU);
    await expect.poll(async () => (await estilo(card)).sombra).toBe(sombraHover);
    await page.mouse.move(5, 890);
    await expect.poll(async () => (await estilo(card)).transform).toBe('none');
    await tabAte(page, page.getByRole('link', { name: 'Forno da Vila' }));
    await expect.poll(async () => (await estilo(card)).transform).toBe(SUBIU);
    await expect.poll(async () => (await estilo(card)).sombra).toBe(sombraHover);
    expect((await estilo(card)).outline).not.toBe('none');

    await page.goto(url('#/restaurante/1'));
    const prato = page.locator('.cartao-prato').first();
    await tabAte(page, page.getByRole('button', { name: 'Adicionar Pizza Margherita' }));
    await expect.poll(async () => (await estilo(prato)).transform).toBe(SUBIU);
    await expect.poll(async () => (await estilo(prato)).sombra).toBe(sombraHover);
  });

  test('[REQ-013] clique de mouse no botão não deixa o destaque de foco preso', async ({ page }) => {
    await page.goto(url('#/restaurante/1'));
    const prato = page.locator('.cartao-prato').first();
    await page.getByRole('button', { name: 'Adicionar Pizza Margherita' }).click();
    await page.mouse.move(5, 890);
    await expect.poll(async () => (await estilo(prato)).transform).toBe('none');
  });
});

test.describe('movimento reduzido', () => {
  test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });

  test('[REQ-013] [REQ-009] E2E-11 com reduce, hover e foco destacam sem mover nem animar', async ({ page }) => {
    await page.goto(url('#/'));
    const card = page.locator('.cartao-restaurante').first();
    await card.hover();
    const h = await estilo(card);
    expect(h.transform).toBe('none');
    expect(h.duracao).toBe('0s');
    expect(h.borda).toBe('rgb(163, 32, 28)');
    await page.mouse.move(5, 890);
    await tabAte(page, page.getByRole('link', { name: 'Forno da Vila' }));
    const f = await estilo(card);
    expect(f.transform).toBe('none');
    expect(f.duracao).toBe('0s');
    expect(f.sombra).toBe(h.sombra);
    expect(f.borda).toBe('rgb(163, 32, 28)');
  });
});

test.describe('RESP-10 toque em 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

  test('[REQ-013] [REQ-009] E2E-12 toque abre a rota e adiciona; nenhum card fica levantado', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByRole('link', { name: 'Burger do Bairro' }).tap();
    await expect(page).toHaveURL(/#\/restaurante\/2$/);
    await page.getByRole('button', { name: 'Adicionar Clássico da Casa' }).tap();
    await expect(page.locator('#link-carrinho')).toHaveAttribute('aria-label', 'Carrinho, 1 item');
    const levantados = await page.locator('.cartao-prato').evaluateAll((els) => els.filter((e) => getComputedStyle(e).transform !== 'none').length);
    expect(levantados).toBe(0);
    await page.goto(url('#/'));
    await page.locator('.cartao-restaurante').first().tap();
    await expect(page).toHaveURL(/#\/restaurante\/1$/);
  });

  test('[REQ-015] [REQ-009] login e entrada só com toques', async ({ page }) => {
    await page.goto(url('#/'));
    await page.getByRole('banner').getByRole('button', { name: 'Entrar', exact: true }).tap();
    await page.getByLabel('E-mail').tap();
    await page.keyboard.type('bia@exemplo.com');
    await page.getByLabel('Senha', { exact: true }).tap();
    await page.keyboard.type('segredo1');
    await page.locator('#login-enviar').tap();
    await expect(page.getByRole('banner').getByText('Olá, bia', { exact: true })).toBeVisible();
    const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(rola).toBe(false);
  });
});

test.describe('fluxo só com teclado', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('[REQ-011] [REQ-013] E2E-31 de #/ a #/pedido só com teclado, sem login, com destaque no card em foco', async ({ page }) => {
    await page.goto(url());
    await tabAte(page, page.getByRole('link', { name: 'Verde Vivo' }));
    const card = page.locator('.cartao-restaurante', { has: page.getByRole('link', { name: 'Verde Vivo' }) });
    await expect.poll(async () => (await estilo(card)).transform).not.toBe('none');
    await page.keyboard.press('Enter');
    await tabAte(page, page.getByRole('button', { name: 'Adicionar Bowl de quinoa' }));
    const prato = page.locator('.cartao-prato', { has: page.getByRole('button', { name: 'Adicionar Bowl de quinoa' }) });
    await expect.poll(async () => (await estilo(prato)).transform).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(page.locator('#link-carrinho')).toHaveAccessibleName('Carrinho, 1 item');
    for (let i = 0; i < 60; i++) {
      if (await page.locator('#link-carrinho').evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press('Shift+Tab');
    }
    await page.keyboard.press('Enter');
    await tabAte(page, page.getByRole('link', { name: 'Ir para o pagamento' }));
    await page.keyboard.press('Enter');
    await tabAte(page, page.getByLabel('CEP'));
    await page.keyboard.type('01310100');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Avenida Paulista');
    await page.keyboard.press('Tab');
    await page.keyboard.type('900');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Bela Vista');
    await tabAte(page, page.getByRole('radio', { name: 'Pix' }));
    await page.keyboard.press('Space');
    await tabAte(page, page.getByRole('button', { name: 'Confirmar pedido' }));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/pedido$/);
    await expect(page.getByRole('banner').getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  });
});
