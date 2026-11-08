/* Estado do protótipo Rango: carrinho e pedido, com localStorage e queda para memória (REQ-005, REQ-006). */
(function () {
  'use strict';
  var R = window.Rango = window.Rango || {};

  var CHAVE_CARRINHO = 'rango:carrinho';
  var CHAVE_PEDIDO = 'rango:pedido';
  var QTD_MAX = 20;
  var memoria = {};
  var armazenamentoFalhou = false;
  var avisoFalhaDado = false;
  var ouvintes = [];

  function falhou() {
    armazenamentoFalhou = true;
    if (!avisoFalhaDado) {
      avisoFalhaDado = true;
      /* depois do carregamento, para o aviso existir na página */
      setTimeout(function () {
        if (R.avisar) R.avisar('Não foi possível salvar o carrinho neste navegador. Ele será perdido ao recarregar a página.');
      }, 0);
    }
  }

  function ler(chave) {
    if (!armazenamentoFalhou) {
      try {
        var v = window.localStorage.getItem(chave);
        return v === null ? null : JSON.parse(v);
      } catch (e) {
        if (e instanceof SyntaxError) return null;
        falhou();
      }
    }
    return Object.prototype.hasOwnProperty.call(memoria, chave) ? JSON.parse(memoria[chave]) : null;
  }

  function gravar(chave, valor) {
    var texto = valor === null ? null : JSON.stringify(valor);
    if (texto === null) delete memoria[chave]; else memoria[chave] = texto;
    if (armazenamentoFalhou) return;
    try {
      if (texto === null) window.localStorage.removeItem(chave);
      else window.localStorage.setItem(chave, texto);
    } catch (e) {
      falhou();
    }
  }

  /* --- validação do que veio guardado: dado inválido some em silêncio --- */
  function itensValidos(restauranteId, itens) {
    if (!Array.isArray(itens)) return [];
    var vistos = {};
    return itens.filter(function (i) {
      if (!i || typeof i !== 'object') return false;
      var achado = R.prato(i.pratoId);
      var qtd = Number(i.qtd);
      if (!achado || achado.restaurante.id !== restauranteId || vistos[i.pratoId]) return false;
      if (!Number.isInteger(qtd) || qtd < 1) return false;
      vistos[i.pratoId] = true;
      return true;
    }).map(function (i) {
      return { pratoId: Number(i.pratoId), qtd: Math.min(Number(i.qtd), QTD_MAX) };
    });
  }

  function carrinhoValido(c) {
    var vazio = { restauranteId: null, itens: [] };
    if (!c || typeof c !== 'object' || !R.restaurante(c.restauranteId)) return vazio;
    var itens = itensValidos(Number(c.restauranteId), c.itens);
    return itens.length ? { restauranteId: Number(c.restauranteId), itens: itens } : vazio;
  }

  function pedidoValido(p) {
    if (!p || typeof p !== 'object' || !R.restaurante(p.restauranteId)) return null;
    var itens = itensValidos(Number(p.restauranteId), p.itens);
    if (!itens.length || !Number.isFinite(Number(p.criadoEm))) return null;
    return {
      numero: String(p.numero || '').replace(/\D/g, '').slice(0, 4) || '0000',
      restauranteId: Number(p.restauranteId),
      itens: itens,
      endereco: p.endereco && typeof p.endereco === 'object' ? p.endereco : {},
      pagamento: p.pagamento && typeof p.pagamento === 'object' ? p.pagamento : { tipo: 'pix' },
      criadoEm: Number(p.criadoEm)
    };
  }

  var carrinho = carrinhoValido(ler(CHAVE_CARRINHO));

  function avisarOuvintes() {
    ouvintes.forEach(function (f) { f(); });
  }

  function salvarCarrinho() {
    gravar(CHAVE_CARRINHO, carrinho.itens.length ? carrinho : null);
    avisarOuvintes();
  }

  R.QTD_MAX = QTD_MAX;

  R.loja = {
    aoMudar: function (f) { ouvintes.push(f); },

    carrinho: function () { return carrinho; },

    quantidadeTotal: function () {
      return carrinho.itens.reduce(function (s, i) { return s + i.qtd; }, 0);
    },

    qtdDe: function (pratoId) {
      var i = carrinho.itens.find(function (x) { return x.pratoId === pratoId; });
      return i ? i.qtd : 0;
    },

    /* devolve 'outro-restaurante' quando seria preciso esvaziar antes; 'maximo' quando já há 20 */
    adicionar: function (pratoId, forcarTroca) {
      var achado = R.prato(pratoId);
      if (!achado) return 'invalido';
      var rid = achado.restaurante.id;
      if (carrinho.itens.length && carrinho.restauranteId !== rid) {
        if (!forcarTroca) return 'outro-restaurante';
        carrinho = { restauranteId: rid, itens: [] };
      }
      carrinho.restauranteId = rid;
      var item = carrinho.itens.find(function (x) { return x.pratoId === pratoId; });
      if (item) {
        if (item.qtd >= QTD_MAX) return 'maximo';
        item.qtd++;
      } else {
        carrinho.itens.push({ pratoId: pratoId, qtd: 1 });
      }
      salvarCarrinho();
      return 'ok';
    },

    mudarQtd: function (pratoId, delta) {
      var item = carrinho.itens.find(function (x) { return x.pratoId === pratoId; });
      if (!item) return;
      item.qtd = Math.min(QTD_MAX, item.qtd + delta);
      if (item.qtd < 1) {
        carrinho.itens = carrinho.itens.filter(function (x) { return x !== item; });
      }
      if (!carrinho.itens.length) carrinho = { restauranteId: null, itens: [] };
      salvarCarrinho();
    },

    remover: function (pratoId) {
      carrinho.itens = carrinho.itens.filter(function (x) { return x.pratoId !== pratoId; });
      if (!carrinho.itens.length) carrinho = { restauranteId: null, itens: [] };
      salvarCarrinho();
    },

    esvaziar: function () {
      carrinho = { restauranteId: null, itens: [] };
      salvarCarrinho();
    },

    /* subtotal, taxa e total em centavos de uma lista de itens */
    totais: function (restauranteId, itens) {
      var r = R.restaurante(restauranteId);
      var subtotal = itens.reduce(function (s, i) { return s + R.prato(i.pratoId).prato.preco * i.qtd; }, 0);
      var taxa = r && itens.length ? r.taxa : 0;
      return { subtotal: subtotal, taxa: taxa, total: subtotal + taxa };
    },

    pedido: function () { return pedidoValido(ler(CHAVE_PEDIDO)); },

    criarPedido: function (endereco, pagamento) {
      var p = {
        numero: String(1000 + Math.floor(Math.random() * 9000)),
        restauranteId: carrinho.restauranteId,
        itens: carrinho.itens.map(function (i) { return { pratoId: i.pratoId, qtd: i.qtd }; }),
        endereco: endereco,
        pagamento: pagamento,
        criadoEm: Date.now()
      };
      gravar(CHAVE_PEDIDO, p);
      this.esvaziar();
      return p;
    }
  };
})();
