// Login simulado (REQ-015): E2E-16 a E2E-25, E2E-29, E2E-30, A11Y-04 a A11Y-11 e A11Y-14 da spec da F-002.
const { test, expect } = require('@playwright/test');
const { url, preCarregar, carrinhoExemplo, pedidoExemplo, semViolacoes } = require('./ajuda');

const rotas = [
  { rota: '#/' },
  { rota: '#/restaurante/1' },
  { rota: '#/carrinho', dados: { 'rango:carrinho': carrinhoExemplo } },
  { rota: '#/checkout', dados: { 'rango:carrinho': carrinhoExemplo } },
  { rota: '#/pedido', dados: { 'rango:pedido': pedidoExemplo(Date.now() - 6000) } },
];

const entrarCabecalho = (page) => page.getByRole('banner').getByRole('button', { name: 'Entrar', exact: true });
const dialogo = (page) => page.getByRole('dialog', { name: 'Entrar no Rango' });

async function abrir(page) {
  await entrarCabecalho(page).click();
  await expect(dialogo(page)).toBeVisible();
}

async function entrar(page, email = 'ana@exemplo.com', senha = 'segredo1') {
  await abrir(page);
  await page.locator('#login-email').fill(email);
  await page.locator('#login-senha').fill(senha);
  await page.locator('#login-enviar').click();
  await expect(dialogo(page)).toBeHidden();
}

for (const largura of [320, 360, 768, 1280]) {
  test.describe(`Entrar em ${largura} px`, () => {
    test.use({ viewport: { width: largura, height: 800 } });
    test(`[REQ-015] E2E-16 botão Entrar em todas as rotas com alvo ≥ 44×44 (A11Y-04, A11Y-14)`, async ({ page }) => {
      for (const t of rotas) {
        await page.context().clearCookies();
        if (t.dados) await page.addInitScript((d) => { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, JSON.stringify(v)); }, t.dados);
        await page.goto(url(t.rota));
        await expect(page.locator('main h1')).toBeVisible();
        const b = entrarCabecalho(page);
        await expect(b).toBeVisible();
        await expect(b).toHaveAttribute('aria-haspopup', 'dialog');
        const caixa = await b.boundingBox();
        expect(caixa.width).toBeGreaterThanOrEqual(44);
        expect(caixa.height).toBeGreaterThanOrEqual(44);
        const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(rola, `rolagem horizontal em ${t.rota}`).toBe(false);
      }
    });
  });
}

test.describe('US-17 a US-19 login simulado', () => {
  test('[REQ-015] E2E-17 abrir: nome, descrição, aviso e foco no e-mail (A11Y-05, A11Y-06)', async ({ page }) => {
    await page.goto(url('#/'));
    await abrir(page);
    const d = dialogo(page);
    await expect(d).toHaveAttribute('aria-describedby', 'dialogo-login-aviso');
    await expect(d).toHaveAccessibleDescription('Login simulado: nada é enviado e a senha não fica guardada.');
    await expect(page.locator('#dialogo-login-aviso')).toBeVisible();
    await expect(page.locator('#login-email')).toBeFocused();
    await expect(page).toHaveURL(/#\/$/);
    await expect(page).toHaveTitle('Início · Rango');
  });

  test('[REQ-015] E2E-18 foco preso; Esc e Cancelar fecham e devolvem o foco; campos vazios ao reabrir (A11Y-07, A11Y-08)', async ({ page }) => {
    await page.goto(url('#/'));
    await abrir(page);
    for (const tecla of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press(tecla);
        const dentro = await page.evaluate(() => document.getElementById('dialogo-login').contains(document.activeElement));
        expect(dentro, `${tecla} #${i + 1}`).toBe(true);
      }
    }
    await page.locator('#login-email').fill('ana@');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.getElementById('dialogo-login').open)).toBe(false);
    await expect(page.locator('#botao-entrar')).toBeFocused();
    await abrir(page);
    await expect(page.locator('#login-email')).toHaveValue('');
    await page.locator('#login-senha').fill('abc');
    await dialogo(page).getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialogo(page)).toBeHidden();
    await expect(page.locator('#botao-entrar')).toBeFocused();
    await abrir(page);
    await expect(page.locator('#login-senha')).toHaveValue('');
    await expect(page.locator('.campo--erro')).toHaveCount(0);
  });

  test('[REQ-015] [REQ-010] E2E-19 mensagens de erro ligadas aos campos; erro some ao corrigir (A11Y-09, A11Y-10)', async ({ page }) => {
    await page.goto(url('#/'));
    await abrir(page);
    await page.locator('#login-enviar').click();
    const email = page.locator('#login-email');
    const senha = page.locator('#login-senha');
    await expect(page.locator('#login-email-erro')).toHaveText('Informe seu e-mail.');
    await expect(page.locator('#login-senha-erro')).toHaveText('Informe sua senha.');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', /login-email-erro/);
    await expect(senha).toHaveAttribute('aria-describedby', 'login-senha-erro login-senha-dica');
    await expect(email).toHaveAccessibleDescription('Informe seu e-mail.');
    await expect(senha).toHaveAccessibleDescription(/^Informe sua senha\./);
    await expect(email).toBeFocused();

    await email.fill('ana@');
    await page.locator('#login-enviar').click();
    await expect(page.locator('#login-email-erro')).toHaveText('Digite um e-mail válido, como nome@exemplo.com.');
    await senha.fill('12345');
    await page.locator('#login-enviar').click();
    await expect(page.locator('#login-senha-erro')).toHaveText('A senha precisa ter pelo menos 6 caracteres.');

    await email.fill('ana@exemplo.com');
    await expect(page.locator('#login-email-erro')).toBeHidden();
    await expect(email).not.toHaveAttribute('aria-invalid', /.*/);
    await expect(dialogo(page)).toBeVisible();
  });

  test('[REQ-015] E2E-19 blur valida campo tocado com valor inválido', async ({ page }) => {
    await page.goto(url('#/'));
    await abrir(page);
    await page.locator('#login-email').fill('ana');
    await page.locator('#login-senha').focus();
    await expect(page.locator('#login-email-erro')).toHaveText('Digite um e-mail válido, como nome@exemplo.com.');
  });

  test('[REQ-015] E2E-20 E2E-21 envio válido: "Entrando…", um só aviso, saudação, foco em Sair e sessão sem senha (A11Y-11)', async ({ page }) => {
    await page.goto(url('#/'));
    const avisos = [];
    await page.exposeFunction('__aviso', (t) => avisos.push(t));
    await page.evaluate(() => {
      const el = document.getElementById('aviso');
      new MutationObserver(() => { if (el.textContent) window.__aviso(el.textContent); }).observe(el, { childList: true, characterData: true, subtree: true });
    });
    await abrir(page);
    await page.locator('#login-email').fill('ana@exemplo.com');
    await page.locator('#login-senha').fill('segredo1');
    const enviar = page.locator('#login-enviar');
    // o envio leva 600 ms; o relógio fica parado para conferir o estado "Entrando…" sem corrida
    await page.clock.install();
    await enviar.click();
    await expect(enviar).toBeDisabled();
    await expect(enviar).toHaveText('Entrando…');
    await expect(enviar).toHaveAttribute('aria-busy', 'true');
    await expect(dialogo(page).getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    await expect(page.locator('#login-email')).toHaveAttribute('readonly', '');
    await expect(page.locator('#login-senha')).toHaveAttribute('readonly', '');
    // Esc ignorado durante o envio
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.getElementById('dialogo-login').open)).toBe(true);
    // novo envio (Enter no campo e requestSubmit) é ignorado: um só login e um só aviso
    await page.locator('#login-senha').press('Enter');
    await page.evaluate(() => document.getElementById('form-login').requestSubmit());
    await page.clock.runFor(700);
    await expect(dialogo(page)).toBeHidden();
    const banner = page.getByRole('banner');
    await expect(banner.getByText('Olá, ana', { exact: true })).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Sair' })).toBeVisible();
    await expect(entrarCabecalho(page)).toBeHidden();
    await expect(page.locator('#aviso')).toHaveText('Você entrou como ana.');
    await expect(page.locator('#botao-sair')).toBeFocused();
    // um envio duplicado teria agendado um segundo login; avança o relógio além dele
    await page.clock.runFor(1000);
    expect(avisos.filter((t) => t.startsWith('Você entrou'))).toHaveLength(1);

    const ls = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
    expect(ls['rango:sessao']).toBe('{"nome":"ana"}');
    for (const v of Object.values(ls)) {
      expect(v).not.toContain('segredo1');
      expect(v).not.toContain('exemplo.com');
    }
  });

  test('[REQ-015] E2E-22 sessão sobrevive ao recarregar; Sair volta ao Entrar', async ({ page }) => {
    await page.goto(url('#/'));
    await entrar(page);
    await page.reload();
    await expect(page.getByRole('banner').getByText('Olá, ana', { exact: true })).toBeVisible();
    await page.goto(url('#/carrinho'));
    await expect(page.getByRole('banner').getByText('Olá, ana', { exact: true })).toBeVisible();
    await page.getByRole('banner').getByRole('button', { name: 'Sair' }).click();
    await expect(entrarCabecalho(page)).toBeVisible();
    await expect(page.locator('#botao-entrar')).toBeFocused();
    await expect(page.locator('#aviso')).toHaveText('Você saiu da conta.');
    expect(await page.evaluate(() => localStorage.getItem('rango:sessao'))).toBeNull();
  });

  const sessoesInvalidas = [
    { nome: 'JSON inválido', valor: 'x{' },
    { nome: 'nome numérico', valor: '{"nome":123}' },
    { nome: 'array', valor: '[]' },
    { nome: 'string solta', valor: '"ana"' },
    { nome: 'nome só com espaços', valor: '{"nome":"   "}' },
    { nome: 'null', valor: 'null' },
  ];
  for (const c of sessoesInvalidas) {
    test('[REQ-015] E2E-23 sessão inválida (' + c.nome + ') abre sem login, sem erro e remove a chave', async ({ page }) => {
      const erros = [];
      page.on('pageerror', (e) => erros.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
      await page.addInitScript((v) => { if (!sessionStorage.getItem('__s')) { sessionStorage.setItem('__s', '1'); localStorage.setItem('rango:sessao', v); } }, c.valor);
      await page.goto(url());
      await expect(entrarCabecalho(page)).toBeVisible();
      await expect(page.locator('.conta__saudacao')).toBeHidden();
      expect(await page.evaluate(() => localStorage.getItem('rango:sessao'))).toBeNull();
      expect(erros).toEqual([]);
    });
  }

  test('[REQ-015] E2E-23 sessão gravada com HTML no nome mostra o texto literal', async ({ page }) => {
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.addInitScript(() => { if (!sessionStorage.getItem('__s')) { sessionStorage.setItem('__s', '1'); localStorage.setItem('rango:sessao', '{"nome":"<img src=x onerror=alert(1)>"}'); } });
    await page.goto(url());
    await expect(page.locator('.conta__saudacao')).toHaveText('Olá, <img src=x onerror=alert(1)>');
    await expect(page.locator('.conta img')).toHaveCount(0);
    expect(erros).toEqual([]);
  });

  test('[REQ-015] E2E-23 sem localStorage (getItem lança exceção): abre sem login e o login funciona em memória', async ({ page }) => {
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.addInitScript(() => {
      const erro = () => { throw new DOMException('bloqueado', 'SecurityError'); };
      Storage.prototype.getItem = erro;
      Storage.prototype.setItem = erro;
      Storage.prototype.removeItem = erro;
    });
    await page.goto(url());
    await expect(entrarCabecalho(page)).toBeVisible();
    await entrar(page);
    await expect(page.getByRole('banner').getByText('Olá, ana', { exact: true })).toBeVisible();
    await page.getByRole('banner').getByRole('button', { name: 'Sair' }).click();
    await expect(entrarCabecalho(page)).toBeVisible();
    expect(erros).toEqual([]);
  });

  test('[REQ-015] E2E-24 nome com HTML aparece como texto', async ({ page }) => {
    await page.goto(url('#/'));
    await entrar(page, '<b>x</b>@a.co');
    await expect(page.locator('.conta__saudacao')).toHaveText('Olá, <b>x</b>');
    await expect(page.locator('.conta__saudacao b')).toHaveCount(0);
  });

  test('[REQ-006] [REQ-015] E2E-30 entrar, recarregar e sair não mexem no carrinho', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': carrinhoExemplo });
    await page.goto(url('#/carrinho'));
    const antes = await page.evaluate(() => localStorage.getItem('rango:carrinho'));
    await entrar(page);
    expect(await page.evaluate(() => localStorage.getItem('rango:carrinho'))).toBe(antes);
    await page.reload();
    expect(await page.evaluate(() => localStorage.getItem('rango:carrinho'))).toBe(antes);
    await page.getByRole('banner').getByRole('button', { name: 'Sair' }).click();
    expect(await page.evaluate(() => localStorage.getItem('rango:carrinho'))).toBe(antes);
    await expect(page.locator('.item')).toHaveCount(2);
  });

  test('[REQ-005] [REQ-015] E2E-29 logado, o diálogo de troca continua o de troca', async ({ page }) => {
    await preCarregar(page, { 'rango:carrinho': { restauranteId: 1, itens: [{ pratoId: 101, qtd: 2 }] } });
    await page.goto(url('#/restaurante/2'));
    await entrar(page);
    await expect(page.locator('#link-carrinho')).toHaveAttribute('aria-label', 'Carrinho, 2 itens');
    const adicionar = page.getByRole('button', { name: 'Adicionar Clássico da Casa' });
    await adicionar.click();
    await expect(page.getByRole('dialog', { name: 'Começar um novo carrinho?' })).toBeVisible();
    await expect(dialogo(page)).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(adicionar).toBeFocused();
  });
});

test.describe('logado em 320 px', () => {
  test.use({ viewport: { width: 320, height: 700 } });
  test('[REQ-015] [REQ-009] E2E-25 conta desce para a 2ª linha, sem rolagem horizontal e Sair ≥ 44×44', async ({ page }) => {
    await page.goto(url('#/'));
    await entrar(page, 'maria.eduarda.longonome@exemplo.com');
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const de = document.documentElement;
      return { sw: de.scrollWidth, cw: de.clientWidth, logo: r('.marca').bottom, conta: r('.conta').top, sair: r('#botao-sair') };
    });
    expect(m.sw).toBeLessThanOrEqual(m.cw);
    expect(m.conta).toBeGreaterThanOrEqual(m.logo - 1);
    expect(m.sair.width).toBeGreaterThanOrEqual(44);
    expect(m.sair.height).toBeGreaterThanOrEqual(44);
  });
});

for (const largura of [360, 1280]) {
  test.describe(`axe do login em ${largura} px`, () => {
    test.use({ viewport: { width: largura, height: 800 } });
    test('[REQ-010] [REQ-015] A11Y-01 diálogo de login aberto, vazio, sem violações', async ({ page }) => {
      await page.goto(url('#/'));
      await abrir(page);
      await semViolacoes(page);
    });
    test('[REQ-010] [REQ-015] A11Y-01 diálogo de login com erros sem violações', async ({ page }) => {
      await page.goto(url('#/'));
      await abrir(page);
      await page.locator('#login-enviar').click();
      await expect(page.locator('#login-email-erro')).toBeVisible();
      await semViolacoes(page);
    });
    test('[REQ-010] [REQ-015] A11Y-01 estado logado sem violações', async ({ page }) => {
      await page.goto(url('#/'));
      await entrar(page);
      await semViolacoes(page);
    });
  });
}
