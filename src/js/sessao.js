/* Login simulado do protótipo Rango (REQ-015): botão "Entrar", diálogo com validação e sessão
   em localStorage ("rango:sessao", só o nome; nunca a senha nem o e-mail). Sem autenticação real. */
(function () {
  'use strict';
  var R = window.Rango = window.Rango || {};

  var CHAVE = 'rango:sessao';
  var ESPERA_MS = 600;
  var memoria = null;
  var semArmazenamento = false;
  var ICONE_ERRO = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>';
  var MENSAGENS = {
    emailVazio: 'Informe seu e-mail.',
    emailInvalido: 'Digite um e-mail válido, como nome@exemplo.com.',
    senhaVazia: 'Informe sua senha.',
    senhaCurta: 'A senha precisa ter pelo menos 6 caracteres.'
  };

  /* ---------- sessão ---------- */
  function lerSessao() {
    var texto = null;
    if (!semArmazenamento) {
      try { texto = window.localStorage.getItem(CHAVE); } catch (e) { semArmazenamento = true; }
    }
    if (semArmazenamento) return memoria;
    if (texto === null) return null;
    var v = null;
    try { v = JSON.parse(texto); } catch (e) { v = null; }
    if (!v || typeof v !== 'object' || typeof v.nome !== 'string' || !v.nome.trim()) {
      try { window.localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento: nada a limpar */ }
      return null;
    }
    return { nome: v.nome };
  }

  function gravarSessao(s) {
    memoria = s;
    if (semArmazenamento) return;
    try {
      if (s) window.localStorage.setItem(CHAVE, JSON.stringify({ nome: s.nome }));
      else window.localStorage.removeItem(CHAVE);
    } catch (e) {
      semArmazenamento = true;
    }
  }

  /* ---------- cabeçalho ---------- */
  var conta = document.querySelector('.conta');
  var botaoEntrar = document.getElementById('botao-entrar');
  var botaoSair = document.getElementById('botao-sair');
  var saudacao = conta.querySelector('.conta__saudacao');

  function desenharConta() {
    var s = lerSessao();
    var logado = !!s;
    conta.dataset.estado = logado ? 'logado' : 'anonimo';
    botaoEntrar.hidden = logado;
    saudacao.hidden = !logado;
    botaoSair.hidden = !logado;
    /* texto, nunca HTML (o nome vem do que a pessoa digitou) */
    saudacao.textContent = logado ? 'Olá, ' + s.nome : '';
  }

  /* ---------- diálogo ---------- */
  var dialogo = document.getElementById('dialogo-login');
  var form = document.getElementById('form-login');
  var email = document.getElementById('login-email');
  var senha = document.getElementById('login-senha');
  var enviar = document.getElementById('login-enviar');
  var cancelar = dialogo.querySelector('[data-acao="cancelar"]');
  var textoEnviar = enviar.querySelector('.botao__texto');
  var enviando = false;
  var entrou = false;
  var tentouEnviar = false;
  var interagido = {};
  var timer = null;

  function validar(id) {
    if (id === 'login-email') {
      var v = email.value.trim();
      if (!v) return MENSAGENS.emailVazio;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : MENSAGENS.emailInvalido;
    }
    if (!senha.value) return MENSAGENS.senhaVazia;
    return senha.value.length < 6 ? MENSAGENS.senhaCurta : '';
  }

  function mostrar(id, msg) {
    var input = document.getElementById(id);
    var erro = document.getElementById(id + '-erro');
    var dica = document.getElementById(id + '-dica');
    erro.hidden = !msg;
    erro.innerHTML = msg ? ICONE_ERRO + '<span>' + msg + '</span>' : '';
    input.closest('.campo').classList.toggle('campo--erro', !!msg);
    var desc = [];
    if (msg) desc.push(id + '-erro');
    if (dica) desc.push(id + '-dica');
    if (desc.length) input.setAttribute('aria-describedby', desc.join(' '));
    else input.removeAttribute('aria-describedby');
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }

  function conferir(id) { var m = validar(id); mostrar(id, m); return m; }

  function estadoEnvio(ligado) {
    enviando = ligado;
    enviar.disabled = ligado;
    cancelar.disabled = ligado;
    enviar.classList.toggle('carregando', ligado);
    if (ligado) enviar.setAttribute('aria-busy', 'true'); else enviar.removeAttribute('aria-busy');
    email.readOnly = ligado;
    senha.readOnly = ligado;
    textoEnviar.textContent = ligado ? 'Entrando…' : 'Entrar';
  }

  function limpar() {
    clearTimeout(timer);
    timer = null;
    estadoEnvio(false);
    form.reset();
    mostrar('login-email', '');
    mostrar('login-senha', '');
    tentouEnviar = false;
    interagido = {};
  }

  function abrir() {
    limpar();
    entrou = false;
    dialogo.showModal();
    email.focus();
  }

  function fechar() {
    if (dialogo.open) dialogo.close();
  }

  botaoEntrar.addEventListener('click', abrir);
  cancelar.addEventListener('click', function () { if (!enviando) fechar(); });

  /* foco preso: Tab e Shift+Tab circulam só dentro do diálogo */
  dialogo.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && enviando) { e.preventDefault(); return; }
    if (e.key !== 'Tab') return;
    var focaveis = Array.prototype.filter.call(
      dialogo.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.disabled && !el.hidden && el.getClientRects().length; });
    if (!focaveis.length) return;
    var primeiro = focaveis[0];
    var ultimo = focaveis[focaveis.length - 1];
    var dentro = dialogo.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === primeiro || !dentro)) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) { e.preventDefault(); primeiro.focus(); }
  });
  dialogo.addEventListener('cancel', function (e) { if (enviando) e.preventDefault(); });

  dialogo.addEventListener('close', function () {
    var sucesso = entrou;
    limpar();
    entrou = false;
    if (sucesso) botaoSair.focus();
    else if (!botaoEntrar.hidden) botaoEntrar.focus();
  });

  ['login-email', 'login-senha'].forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener('input', function () {
      interagido[id] = true;
      if (input.getAttribute('aria-invalid') === 'true') conferir(id);
    });
    input.addEventListener('blur', function (e) {
      /* indo para o botão de enviar: o envio valida tudo (como no checkout) */
      if (e.relatedTarget && e.relatedTarget.id === 'login-enviar') return;
      if (!dialogo.open || enviando) return;
      if (interagido[id] || tentouEnviar) conferir(id);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando) return;
    tentouEnviar = true;
    var erroEmail = conferir('login-email');
    var erroSenha = conferir('login-senha');
    if (erroEmail) { email.focus(); return; }
    if (erroSenha) { senha.focus(); return; }
    var nome = email.value.trim().split('@')[0].trim();
    estadoEnvio(true);
    timer = setTimeout(function () {
      timer = null;
      gravarSessao({ nome: nome });
      desenharConta();
      entrou = true;
      fechar();
      if (R.avisar) R.avisar('Você entrou como ' + nome + '.');
    }, ESPERA_MS);
  });

  botaoSair.addEventListener('click', function () {
    gravarSessao(null);
    desenharConta();
    botaoEntrar.focus();
    if (R.avisar) R.avisar('Você saiu da conta.');
  });

  desenharConta();
})();
