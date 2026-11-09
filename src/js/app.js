/* Roteador por hash, aviso (toast), diálogo de troca e contador do carrinho (REQ-001, REQ-004, REQ-005). */
(function () {
  'use strict';
  var R = window.Rango = window.Rango || {};

  var main = document.getElementById('conteudo');
  var linkCarrinho = document.getElementById('link-carrinho');
  var contador = linkCarrinho.querySelector('.contador');
  var telaAtual = null;
  var primeira = true;

  /* ---------- contador do carrinho ---------- */
  function atualizarContador() {
    var n = R.loja.quantidadeTotal();
    contador.textContent = String(n);
    linkCarrinho.setAttribute('aria-label', 'Carrinho, ' + R.itensTexto(n));
  }
  R.loja.aoMudar(atualizarContador);

  /* ---------- aviso (toast) ---------- */
  var caixa = document.querySelector('.aviso-caixa');
  var aviso = document.getElementById('aviso');
  var fechar = caixa.querySelector('.aviso__fechar');
  var timerAviso = null;
  var segurando = false;

  function esconderAviso() {
    clearTimeout(timerAviso);
    var tinhaFoco = caixa.contains(document.activeElement);
    aviso.textContent = '';
    caixa.dataset.visivel = 'nao';
    if (tinhaFoco) {
      var h1 = main.querySelector('h1');
      if (h1) h1.focus();
    }
  }

  function agendar() {
    clearTimeout(timerAviso);
    timerAviso = setTimeout(function () {
      if (segurando) return;
      esconderAviso();
    }, 4000);
  }

  R.avisar = function (texto) {
    aviso.textContent = '';
    caixa.dataset.visivel = 'sim';
    /* troca o texto num segundo passo para leitores de tela anunciarem mesmo uma mensagem repetida */
    setTimeout(function () { aviso.textContent = texto; }, 30);
    agendar();
  };

  function segurar() { segurando = true; clearTimeout(timerAviso); }
  function soltar() {
    segurando = caixa.matches(':hover') || caixa.contains(document.activeElement);
    if (!segurando && caixa.dataset.visivel === 'sim') agendar();
  }
  caixa.addEventListener('mouseenter', segurar);
  caixa.addEventListener('mouseleave', function () { setTimeout(soltar, 0); });
  caixa.addEventListener('focusin', segurar);
  caixa.addEventListener('focusout', function () { setTimeout(soltar, 0); });
  fechar.addEventListener('click', esconderAviso);

  /* ---------- diálogo de troca de restaurante (US-05) ---------- */
  var dialogo = document.getElementById('dialogo-troca');
  var dialogoTexto = document.getElementById('dialogo-troca-texto');
  var origem = null;
  var pratoPendente = null;

  R.abrirTroca = function (botao, pratoId) {
    origem = botao;
    pratoPendente = pratoId;
    var atual = R.restaurante(R.loja.carrinho().restauranteId);
    var novo = R.prato(pratoId).restaurante;
    dialogoTexto.textContent = 'Seu carrinho tem itens de ' + atual.nome + '. Para adicionar itens de ' + novo.nome + ', o carrinho atual será esvaziado.';
    dialogo.showModal();
    dialogo.querySelector('[data-acao="cancelar"]').focus();
  };

  function fecharDialogo() {
    if (dialogo.open) dialogo.close();
  }

  dialogo.addEventListener('close', function () {
    if (origem && document.contains(origem)) origem.focus();
    origem = null;
    pratoPendente = null;
  });
  dialogo.querySelector('[data-acao="cancelar"]').addEventListener('click', fecharDialogo);
  dialogo.querySelector('[data-acao="confirmar"]').addEventListener('click', function () {
    var pid = pratoPendente;
    var nome = R.prato(pid).prato.nome;
    R.loja.adicionar(pid, true);
    fecharDialogo();
    R.avisar('Carrinho esvaziado. ' + nome + ' adicionado ao carrinho.');
  });

  /* ---------- foto que falha cai na ilustração SVG da categoria, uma vez só (REQ-012, UX-02) ---------- */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.dataset.reserva || img.dataset.erro === 'sim') return;
    img.dataset.erro = 'sim';
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = img.dataset.reserva;
  }, true);

  /* ---------- links para âncoras da própria página não mexem na rota ---------- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.indexOf('#/') === 0) return;
    e.preventDefault();
    var alvo = document.getElementById(href.slice(1));
    if (alvo) alvo.focus();
  });

  /* ---------- roteador ---------- */
  function rota() {
    var h = location.hash;
    if (h === '#/' ) return { tela: R.telaInicio };
    if (h === '#/carrinho') return { tela: R.telaCarrinho };
    if (h === '#/checkout') return { tela: R.telaCheckout };
    if (h === '#/pedido') return { tela: R.telaPedido };
    if (h === '#/creditos') return { tela: R.telaCreditos };
    var m = /^#\/restaurante\/([^/]+)$/.exec(h);
    if (m) {
      /* sequência percentual inválida (ex.: #/restaurante/%) lança URIError: usa o texto cru, que cai em "não encontrado" */
      var id;
      try { id = decodeURIComponent(m[1]); } catch (e) { id = m[1]; }
      return { tela: R.telaRestaurante, arg: id };
    }
    return null;
  }

  /* manterFoco=false move o foco para o h1 (troca de rota); true é usado quando a mesma tela se redesenha */
  R.renderizar = function (focarTitulo) {
    var r = rota();
    if (!r) { location.replace('#/'); return; }
    if (telaAtual && telaAtual.limpar) telaAtual.limpar();
    if (dialogo.open) dialogo.close();
    telaAtual = r.tela(main, r.arg) || {};
    document.title = telaAtual.titulo || 'Rango';
    if (focarTitulo) {
      window.scrollTo(0, 0);
      var h1 = main.querySelector('h1');
      if (h1) h1.focus({ preventScroll: true });
    }
  };

  window.addEventListener('hashchange', function () {
    R.renderizar(!primeira);
    primeira = false;
  });

  atualizarContador();
  if (!rota()) {
    location.replace('#/');
  } else {
    R.renderizar(false);
    primeira = false;
  }
})();
