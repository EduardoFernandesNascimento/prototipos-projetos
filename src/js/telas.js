/* Telas do protótipo Rango. Cada tela recebe o <main>, monta o conteúdo e devolve
   { titulo, limpar? }. O roteador (app.js) cuida de foco, título e rolagem. */
(function () {
  'use strict';
  var R = window.Rango = window.Rango || {};
  var esc = R.esc;

  var ICONE_MAIS = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>';
  var ICONE_MENOS = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5 11h14v2H5z"/></svg>';
  var ICONE_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
  var ICONE_ERRO = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>';

  /* filtros da Início vivem enquanto a página não recarrega (US-01, passo 3) */
  var filtros = { busca: '', categoria: 'todas' };

  function info(r) {
    return '<span aria-hidden="true">★</span> <span class="vo">Nota </span>' + R.nota(r.nota) +
      ' <span aria-hidden="true">·</span> ' + R.tempoTexto(r.tempo) +
      ' <span aria-hidden="true">·</span> ' +
      (r.taxa === 0 ? 'Entrega grátis' : '<span class="vo">Taxa de entrega </span>' + R.preco(r.taxa));
  }

  function vazioHtml(texto, extra) {
    return '<div class="vazio">' + texto + (extra || '') + '</div>';
  }

  /* ---------------- Início ---------------- */
  R.telaInicio = function (main) {
    var cats = [{ id: 'todas', nome: 'Todas' }].concat(window.RANGO_DADOS.categorias);
    main.innerHTML =
      '<h1 tabindex="-1">Restaurantes</h1>' +
      '<div class="filtros">' +
        '<div class="campo campo--busca">' +
          '<label for="busca">Buscar restaurante</label>' +
          '<input type="search" id="busca" name="busca" placeholder="Ex.: pizza, sushi" autocomplete="off" enterkeyhint="search">' +
        '</div>' +
        '<fieldset class="chips">' +
          '<legend>Categoria</legend>' +
          '<div class="chips__lista">' +
          cats.map(function (c) {
            return '<label class="chip"><input type="radio" name="categoria" value="' + c.id + '">' +
              '<span class="chip__check" aria-hidden="true">' + ICONE_CHECK + '</span><span>' + esc(c.nome) + '</span></label>';
          }).join('') +
          '</div>' +
        '</fieldset>' +
      '</div>' +
      '<p id="contagem" class="contagem" role="status"></p>' +
      '<ul class="grade-restaurantes" id="lista-restaurantes"></ul>' +
      '<div id="inicio-vazio" hidden>' +
        vazioHtml('<p class="vazio__titulo">Nenhum restaurante encontrado.</p><p>Tente outro nome ou outra categoria.</p>',
          '<button type="button" class="botao-secundario" id="limpar-filtros">Limpar filtros</button>') +
      '</div>';

    var busca = main.querySelector('#busca');
    var lista = main.querySelector('#lista-restaurantes');
    var contagem = main.querySelector('#contagem');
    var vazio = main.querySelector('#inicio-vazio');
    busca.value = filtros.busca;
    main.querySelector('input[name="categoria"][value="' + filtros.categoria + '"]').checked = true;

    function desenhar() {
      var termo = R.normalizar(filtros.busca);
      var achados = window.RANGO_DADOS.restaurantes.filter(function (r) {
        return (filtros.categoria === 'todas' || r.categoria === filtros.categoria) &&
          (!termo || R.normalizar(r.nome).indexOf(termo) >= 0);
      });
      lista.innerHTML = achados.map(function (r, i) {
        return '<li class="cartao-restaurante">' +
          '<img class="cartao__foto" src="' + r.imagem + '" alt="" width="320" height="180"' + (i >= 2 ? ' loading="lazy"' : '') + '>' +
          '<div class="cartao__corpo">' +
            '<h2 class="cartao__nome"><a href="#/restaurante/' + r.id + '">' + esc(r.nome) + '</a></h2>' +
            '<p class="cartao__categoria">' + esc(R.categoriaNome(r.categoria)) + '</p>' +
            '<p class="cartao__info">' + info(r) + '</p>' +
          '</div></li>';
      }).join('');
      lista.hidden = achados.length === 0;
      vazio.hidden = achados.length !== 0;
      contagem.textContent = achados.length === 0 ? 'Nenhum restaurante encontrado'
        : achados.length === 1 ? '1 restaurante' : achados.length + ' restaurantes';
    }

    busca.addEventListener('input', function () { filtros.busca = busca.value; desenhar(); });
    busca.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
    main.querySelectorAll('input[name="categoria"]').forEach(function (rd) {
      rd.addEventListener('change', function () { filtros.categoria = rd.value; desenhar(); });
    });
    main.querySelector('#limpar-filtros').addEventListener('click', function () {
      filtros.busca = '';
      filtros.categoria = 'todas';
      busca.value = '';
      main.querySelector('input[name="categoria"][value="todas"]').checked = true;
      desenhar();
      busca.focus();
    });
    desenhar();
    return { titulo: 'Início · Rango' };
  };

  /* ---------------- Restaurante ---------------- */
  R.telaRestaurante = function (main, id) {
    var r = R.restaurante(id);
    if (!r) {
      main.innerHTML = '<h1 tabindex="-1">Restaurante não encontrado</h1>' +
        vazioHtml('<p>O restaurante que você procurou não existe ou saiu do ar.</p>',
          '<a class="botao-secundario" href="#/">Ver restaurantes</a>');
      return { titulo: 'Restaurante não encontrado · Rango' };
    }
    var contadorFoto = 0;
    main.innerHTML =
      '<div class="restaurante-topo">' +
        '<img class="capa" src="' + r.imagem + '" alt="" width="320" height="180">' +
        '<div class="restaurante-topo__texto">' +
          '<h1 tabindex="-1">' + esc(r.nome) + '</h1>' +
          '<p class="restaurante-info">' + esc(R.categoriaNome(r.categoria)) + ' <span aria-hidden="true">·</span> ' + info(r) + '</p>' +
          '<p><a class="link-voltar" href="#/">Voltar para restaurantes</a></p>' +
        '</div>' +
      '</div>' +
      r.secoes.map(function (s, si) {
        return '<section class="secao-cardapio" aria-labelledby="secao-' + si + '">' +
          '<h2 id="secao-' + si + '">' + esc(s.nome) + '</h2>' +
          '<ul class="grade-pratos">' +
          s.pratos.map(function (p) {
            contadorFoto++;
            return '<li class="cartao-prato"><div class="cartao-prato__corpo">' +
              '<img class="cartao__foto" src="' + p.imagem + '" alt="" width="320" height="180"' + (contadorFoto > 2 ? ' loading="lazy"' : '') + '>' +
                '<h3 class="cartao-prato__nome">' + esc(p.nome) + '</h3>' +
                '<p class="cartao-prato__descricao">' + esc(p.descricao) + '</p>' +
                '<p class="cartao-prato__preco">' + R.preco(p.preco) + '</p>' +
                '<button type="button" class="botao-adicionar" data-prato="' + p.id + '" aria-label="Adicionar ' + esc(p.nome) + '">' +
                  ICONE_MAIS + '<span>Adicionar</span></button>' +
              '</div></li>';
          }).join('') +
          '</ul></section>';
      }).join('');

    main.querySelectorAll('.botao-adicionar').forEach(function (b) {
      b.addEventListener('click', function () {
        var pid = Number(b.dataset.prato);
        var prato = R.prato(pid).prato;
        var res = R.loja.adicionar(pid);
        if (res === 'ok') R.avisar(prato.nome + ' adicionado ao carrinho.');
        else if (res === 'maximo') R.avisar('Você já tem ' + R.QTD_MAX + ' unidades de ' + prato.nome + ' no carrinho.');
        else if (res === 'outro-restaurante') R.abrirTroca(b, pid);
      });
    });
    return { titulo: r.nome + ' · Rango' };
  };

  /* ---------------- Carrinho ---------------- */
  function resumoHtml(t) {
    return '<dl class="resumo__lista">' +
      '<div><dt>Subtotal</dt><dd data-total="subtotal">' + R.preco(t.subtotal) + '</dd></div>' +
      '<div><dt>Taxa de entrega</dt><dd data-total="taxa">' + R.taxaTexto(t.taxa) + '</dd></div>' +
      '<div class="resumo__total"><dt>Total</dt><dd data-total="total">' + R.preco(t.total) + '</dd></div>' +
      '</dl>';
  }

  function nomeMenos(nome, qtd) {
    return (qtd === 1 ? 'Remover ' : 'Diminuir ') + nome;
  }

  R.telaCarrinho = function (main) {
    var c = R.loja.carrinho();
    if (!c.itens.length) {
      main.innerHTML = '<h1 tabindex="-1">Seu carrinho</h1>' +
        vazioHtml('<p>Seu carrinho está vazio.</p>', '<a class="botao-secundario" href="#/">Ver restaurantes</a>');
      return { titulo: 'Carrinho · Rango' };
    }
    var r = R.restaurante(c.restauranteId);
    main.innerHTML =
      '<h1 tabindex="-1">Seu carrinho</h1>' +
      '<div class="layout-lateral">' +
        '<section class="carrinho-itens" aria-label="Itens do carrinho">' +
          '<p class="carrinho-restaurante">Pedido de <a href="#/restaurante/' + r.id + '">' + esc(r.nome) + '</a></p>' +
          '<ul class="lista-itens">' +
          c.itens.map(function (i) {
            var p = R.prato(i.pratoId).prato;
            return '<li class="item" data-prato="' + p.id + '">' +
              '<div class="item__texto">' +
                '<h2 class="item__nome">' + esc(p.nome) + '</h2>' +
                '<p class="item__unitario">' + R.preco(p.preco) + ' cada</p>' +
              '</div>' +
              '<div class="item__controles">' +
                '<div class="qtd" role="group" aria-label="Quantidade de ' + esc(p.nome) + '">' +
                  '<button type="button" class="qtd__botao qtd__menos" aria-label="' + esc(nomeMenos(p.nome, i.qtd)) + '">' + ICONE_MENOS + '</button>' +
                  '<output class="qtd__valor" aria-live="polite">' + i.qtd + '</output>' +
                  '<button type="button" class="qtd__botao qtd__mais" aria-label="Aumentar ' + esc(p.nome) + '"' + (i.qtd >= R.QTD_MAX ? ' disabled' : '') + '>' + ICONE_MAIS + '</button>' +
                '</div>' +
                '<button type="button" class="botao-remover" aria-label="Remover ' + esc(p.nome) + ' do carrinho">Remover</button>' +
              '</div>' +
              '<p class="item__total"><span class="vo">Total do item: </span>' + R.preco(p.preco * i.qtd) + '</p>' +
              '</li>';
          }).join('') +
          '</ul>' +
        '</section>' +
        '<section class="resumo" aria-labelledby="resumo-titulo">' +
          '<h2 id="resumo-titulo">Resumo</h2>' +
          '<div class="resumo__valores">' + resumoHtml(R.loja.totais(c.restauranteId, c.itens)) + '</div>' +
          '<a class="botao-principal" href="#/checkout">Ir para o pagamento</a>' +
        '</section>' +
      '</div>';

    function atualizarResumo() {
      var atual = R.loja.carrinho();
      main.querySelector('.resumo__valores').innerHTML = resumoHtml(R.loja.totais(atual.restauranteId, atual.itens));
    }

    function removerLinha(li, nome) {
      var pid = Number(li.dataset.prato);
      var proximo = li.nextElementSibling || li.previousElementSibling;
      R.loja.remover(pid);
      R.avisar(nome + ' removido do carrinho.');
      if (!R.loja.carrinho().itens.length) {
        R.renderizar(true);
        return;
      }
      li.remove();
      atualizarResumo();
      proximo.querySelector('.qtd__menos').focus();
    }

    main.querySelectorAll('.item').forEach(function (li) {
      var pid = Number(li.dataset.prato);
      var p = R.prato(pid).prato;
      var menos = li.querySelector('.qtd__menos');
      var mais = li.querySelector('.qtd__mais');
      var valor = li.querySelector('.qtd__valor');
      var total = li.querySelector('.item__total');

      function atualizarLinha() {
        var q = R.loja.qtdDe(pid);
        valor.textContent = q;
        menos.setAttribute('aria-label', nomeMenos(p.nome, q));
        mais.disabled = q >= R.QTD_MAX;
        total.innerHTML = '<span class="vo">Total do item: </span>' + R.preco(p.preco * q);
        atualizarResumo();
      }

      mais.addEventListener('click', function () { R.loja.mudarQtd(pid, 1); atualizarLinha(); });
      menos.addEventListener('click', function () {
        if (R.loja.qtdDe(pid) <= 1) { removerLinha(li, p.nome); return; }
        R.loja.mudarQtd(pid, -1);
        atualizarLinha();
      });
      li.querySelector('.botao-remover').addEventListener('click', function () { removerLinha(li, p.nome); });
    });
    return { titulo: 'Carrinho · Rango' };
  };

  /* ---------------- Checkout ---------------- */
  var MENSAGENS = {
    cepVazio: 'Informe o CEP.',
    cepInvalido: 'CEP deve ter 8 dígitos, como 01310-100.',
    rua: 'Informe a rua.',
    numero: 'Informe o número ou s/n.',
    bairro: 'Informe o bairro.',
    pagamento: 'Escolha a forma de pagamento.',
    trocoInvalido: 'Informe um valor, como 50,00.'
  };

  function itensResumoHtml(restauranteId, itens) {
    return '<ul class="resumo__itens">' + itens.map(function (i) {
      var p = R.prato(i.pratoId).prato;
      return '<li><span>' + i.qtd + '× ' + esc(p.nome) + '</span><span>' + R.preco(p.preco * i.qtd) + '</span></li>';
    }).join('') + '</ul>' + resumoHtml(R.loja.totais(restauranteId, itens));
  }

  function campo(id, rotulo, atributos, dica) {
    return '<div class="campo" data-campo="' + id + '">' +
      '<label for="' + id + '">' + rotulo + '</label>' +
      (dica ? '<p class="dica" id="' + id + '-dica">' + dica + '</p>' : '') +
      '<input id="' + id + '" name="' + id + '" ' + atributos + (dica ? ' aria-describedby="' + id + '-dica"' : '') + '>' +
      '<p class="erro" id="' + id + '-erro" hidden></p>' +
      '</div>';
  }

  R.telaCheckout = function (main) {
    var c = R.loja.carrinho();
    if (!c.itens.length) {
      main.innerHTML = '<h1 tabindex="-1">Finalizar pedido</h1>' +
        vazioHtml('<p>Seu carrinho está vazio. Adicione pratos antes de finalizar.</p>',
          '<a class="botao-secundario" href="#/">Ver restaurantes</a>');
      return { titulo: 'Checkout · Rango' };
    }
    var r = R.restaurante(c.restauranteId);
    var totais = R.loja.totais(c.restauranteId, c.itens);

    main.innerHTML =
      '<h1 tabindex="-1">Finalizar pedido</h1>' +
      '<div class="layout-lateral">' +
        '<form id="form-checkout" class="formulario" novalidate>' +
          '<div id="resumo-erros" class="resumo-erros" role="alert" tabindex="-1" hidden></div>' +
          '<fieldset class="grupo">' +
            '<legend>Endereço de entrega</legend>' +
            '<div class="grupo__grade grupo__grade--endereco">' +
              campo('cep', 'CEP', 'type="text" inputmode="numeric" autocomplete="postal-code" maxlength="9" spellcheck="false"') +
              campo('rua', 'Rua', 'type="text" autocomplete="address-line1"') +
              campo('numero', 'Número', 'type="text" autocomplete="address-line2"') +
              campo('bairro', 'Bairro', 'type="text" autocomplete="address-level3"') +
              campo('complemento', 'Complemento (opcional)', 'type="text"') +
            '</div>' +
          '</fieldset>' +
          '<fieldset class="grupo" id="grupo-pagamento">' +
            '<legend>Forma de pagamento</legend>' +
            '<div class="opcoes">' +
              '<label class="opcao"><input type="radio" name="pagamento" value="pix" id="pagamento-pix"><span>Pix</span></label>' +
              '<label class="opcao"><input type="radio" name="pagamento" value="cartao"><span>Cartão na entrega</span></label>' +
              '<label class="opcao"><input type="radio" name="pagamento" value="dinheiro"><span>Dinheiro</span></label>' +
            '</div>' +
            '<p class="erro" id="pagamento-erro" hidden></p>' +
            '<div id="bloco-troco" hidden>' +
              campo('troco', 'Troco para quanto?', 'type="text" inputmode="decimal" autocomplete="off"', 'Deixe em branco se não precisar de troco.') +
            '</div>' +
          '</fieldset>' +
          '<button type="submit" class="botao-principal" id="confirmar">' +
            '<span class="girador" aria-hidden="true"></span><span class="botao__texto">Confirmar pedido</span></button>' +
        '</form>' +
        '<section class="resumo" aria-labelledby="resumo-titulo">' +
          '<h2 id="resumo-titulo">Resumo do pedido</h2>' +
          '<p class="carrinho-restaurante">' + esc(r.nome) + '</p>' +
          itensResumoHtml(c.restauranteId, c.itens) +
        '</section>' +
      '</div>';

    var form = main.querySelector('#form-checkout');
    var resumoErros = main.querySelector('#resumo-erros');
    var blocoTroco = main.querySelector('#bloco-troco');
    var grupoPag = main.querySelector('#grupo-pagamento');
    var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="pagamento"]'));
    var tentouEnviar = false;
    var interagido = {};
    var enviando = false;
    var timerEnvio = null;

    function valor(id) { return form.querySelector('#' + id).value.trim(); }
    function pagamento() { var x = radios.find(function (rd) { return rd.checked; }); return x ? x.value : ''; }

    function validar(id) {
      if (id === 'cep') {
        var d = valor('cep').replace(/\D/g, '');
        if (!valor('cep')) return MENSAGENS.cepVazio;
        return d.length === 8 ? '' : MENSAGENS.cepInvalido;
      }
      if (id === 'rua' || id === 'numero' || id === 'bairro') return valor(id) ? '' : MENSAGENS[id];
      if (id === 'pagamento') return pagamento() ? '' : MENSAGENS.pagamento;
      if (id === 'troco') {
        if (pagamento() !== 'dinheiro' || !valor('troco')) return '';
        var cents = R.lerReais(valor('troco'));
        if (!Number.isFinite(cents)) return MENSAGENS.trocoInvalido;
        return cents < totais.total ? 'O troco deve ser para ' + R.preco(totais.total) + ' ou mais.' : '';
      }
      return '';
    }

    function mostrar(id, msg) {
      var erro = form.querySelector('#' + id + '-erro');
      if (id === 'pagamento') {
        erro.hidden = !msg;
        erro.innerHTML = msg ? ICONE_ERRO + '<span>' + msg + '</span>' : '';
        grupoPag.classList.toggle('grupo--erro', !!msg);
        if (msg) {
          grupoPag.setAttribute('aria-describedby', 'pagamento-erro');
          radios[0].setAttribute('aria-describedby', 'pagamento-erro');
          radios[0].setAttribute('aria-invalid', 'true');
        } else {
          grupoPag.removeAttribute('aria-describedby');
          radios[0].removeAttribute('aria-describedby');
          radios[0].removeAttribute('aria-invalid');
        }
        return;
      }
      var input = form.querySelector('#' + id);
      var dica = form.querySelector('#' + id + '-dica');
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

    /* máscara do CEP: 00000-000 */
    var cep = form.querySelector('#cep');
    cep.addEventListener('input', function () {
      var d = cep.value.replace(/\D/g, '').slice(0, 8);
      cep.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
    });

    ['cep', 'rua', 'numero', 'bairro', 'troco'].forEach(function (id) {
      var input = form.querySelector('#' + id);
      input.addEventListener('input', function () {
        interagido[id] = true;
        if (input.getAttribute('aria-invalid') === 'true') conferir(id);
      });
      input.addEventListener('blur', function (e) {
        /* indo para o botao de enviar: o envio valida tudo; validar aqui mudaria o layout no meio do clique */
        if (e.relatedTarget && e.relatedTarget.id === 'confirmar') return;
        if (interagido[id] || tentouEnviar) conferir(id);
      });
    });

    radios.forEach(function (rd) {
      rd.addEventListener('change', function () {
        blocoTroco.hidden = pagamento() !== 'dinheiro';
        if (blocoTroco.hidden) mostrar('troco', '');
        if (tentouEnviar) conferir('pagamento');
      });
    });

    resumoErros.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-alvo]');
      if (!a) return;
      e.preventDefault();
      var alvo = form.querySelector('#' + a.dataset.alvo);
      if (alvo) alvo.focus();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (enviando) return;
      tentouEnviar = true;
      var ids = ['cep', 'rua', 'numero', 'bairro', 'pagamento', 'troco'];
      var rotulos = { cep: 'CEP', rua: 'Rua', numero: 'Número', bairro: 'Bairro', pagamento: 'Forma de pagamento', troco: 'Troco' };
      var erros = ids.map(function (id) { return { id: id, msg: conferir(id) }; }).filter(function (x) { return x.msg; });
      if (erros.length) {
        resumoErros.hidden = false;
        resumoErros.innerHTML = '<h2>Corrija ' + erros.length + (erros.length === 1 ? ' campo' : ' campos') + ' para continuar</h2>' +
          '<ul>' + erros.map(function (x) {
            var alvo = x.id === 'pagamento' ? 'pagamento-pix' : x.id;
            return '<li><a href="#' + alvo + '" data-alvo="' + alvo + '">' + rotulos[x.id] + ': ' + x.msg + '</a></li>';
          }).join('') + '</ul>';
        var primeiro = erros[0].id === 'pagamento' ? radios[0] : form.querySelector('#' + erros[0].id);
        primeiro.focus();
        return;
      }
      resumoErros.hidden = true;
      resumoErros.innerHTML = '';
      enviando = true;
      var botao = form.querySelector('#confirmar');
      botao.disabled = true;
      botao.setAttribute('aria-disabled', 'true');
      botao.classList.add('carregando');
      botao.querySelector('.botao__texto').textContent = 'Confirmando…';
      var tipo = pagamento();
      var pag = { tipo: tipo };
      if (tipo === 'dinheiro' && valor('troco')) pag.troco = R.lerReais(valor('troco'));
      var endereco = { cep: valor('cep'), rua: valor('rua'), numero: valor('numero'), bairro: valor('bairro'), complemento: valor('complemento') };
      /* cancelado em limpar() se a pessoa sair do checkout antes de os 800 ms passarem */
      timerEnvio = setTimeout(function () {
        timerEnvio = null;
        R.loja.criarPedido(endereco, pag);
        location.hash = '#/pedido';
      }, 800);
    });

    return {
      titulo: 'Checkout · Rango',
      limpar: function () { clearTimeout(timerEnvio); timerEnvio = null; }
    };
  };

  /* ---------------- Acompanhamento ---------------- */
  var ETAPAS = ['Confirmado', 'Em preparo', 'A caminho', 'Entregue'];
  var PAGAMENTOS = { pix: 'Pix', cartao: 'Cartão na entrega', dinheiro: 'Dinheiro' };

  function tempoEtapa() {
    var t = Number(window.__RANGO_TEMPO_ETAPA_MS);
    return Number.isFinite(t) && t > 0 ? t : 5000;
  }

  R.telaPedido = function (main) {
    var p = R.loja.pedido();
    if (!p) {
      main.innerHTML = '<h1 tabindex="-1">Nenhum pedido em andamento</h1>' +
        vazioHtml('<p>Quando você confirmar um pedido, as etapas da entrega aparecem aqui.</p>',
          '<a class="botao-secundario" href="#/">Ver restaurantes</a>');
      return { titulo: 'Acompanhar pedido · Rango' };
    }
    var r = R.restaurante(p.restauranteId);
    var e = p.endereco;
    var endTexto = [e.rua && (e.rua + ', ' + (e.numero || 's/n')), e.complemento, e.bairro, e.cep].filter(Boolean).join(' · ');
    var pagTexto = PAGAMENTOS[p.pagamento.tipo] || 'Pix';
    if (p.pagamento.tipo === 'dinheiro') pagTexto += Number.isFinite(p.pagamento.troco) ? ' (troco para ' + R.preco(p.pagamento.troco) + ')' : ' (sem troco)';

    main.innerHTML =
      '<h1 tabindex="-1">Pedido #' + esc(p.numero) + '</h1>' +
      '<p class="pedido-restaurante">' + esc(r.nome) + '</p>' +
      '<div class="layout-pedido">' +
        '<section class="acompanhamento" aria-labelledby="etapas-titulo">' +
          '<h2 id="etapas-titulo">Etapas da entrega</h2>' +
          '<ol class="etapas">' + ETAPAS.map(function (nome) {
            return '<li class="etapa"><span class="etapa__marcador" aria-hidden="true">' + ICONE_CHECK + '</span>' +
              '<span class="etapa__nome">' + nome + '</span> <span class="etapa__estado"></span></li>';
          }).join('') + '</ol>' +
          '<p id="etapa-atual" class="etapa-atual" role="status" aria-live="polite"></p>' +
          '<p class="fazer-outro" hidden><a class="botao-secundario" href="#/">Fazer outro pedido</a></p>' +
        '</section>' +
        '<section class="resumo" aria-labelledby="resumo-titulo">' +
          '<h2 id="resumo-titulo">Resumo do pedido</h2>' +
          itensResumoHtml(p.restauranteId, p.itens) +
          '<dl class="resumo__lista resumo__entrega">' +
            '<div><dt>Endereço</dt><dd>' + esc(endTexto || 'Não informado') + '</dd></div>' +
            '<div><dt>Pagamento</dt><dd>' + esc(pagTexto) + '</dd></div>' +
          '</dl>' +
        '</section>' +
      '</div>';

    var itens = main.querySelectorAll('.etapa');
    var status = main.querySelector('#etapa-atual');
    var outro = main.querySelector('.fazer-outro');
    var atual = -1;
    var timer = null;

    function atualizar() {
      var t = tempoEtapa();
      var idx = Math.min(ETAPAS.length - 1, Math.max(0, Math.floor((Date.now() - p.criadoEm) / t)));
      if (idx !== atual) {
        atual = idx;
        itens.forEach(function (li, i) {
          li.classList.toggle('etapa--concluida', i < idx || (idx === ETAPAS.length - 1 && i === idx));
          li.classList.toggle('etapa--atual', i === idx);
          if (i === idx) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
          var est = li.querySelector('.etapa__estado');
          if (i === idx && idx < ETAPAS.length - 1) { est.className = 'etapa__estado etapa__agora'; est.textContent = 'agora'; }
          else if (i <= idx) { est.className = 'etapa__estado vo'; est.textContent = '(concluída)'; }
          else { est.className = 'etapa__estado'; est.textContent = ''; }
        });
        if (idx === ETAPAS.length - 1) {
          status.textContent = 'Pedido entregue. Bom apetite!';
          outro.hidden = false;
        } else {
          status.textContent = 'Etapa atual: ' + ETAPAS[idx] + '.';
        }
      }
      if (idx < ETAPAS.length - 1) {
        var espera = t - ((Date.now() - p.criadoEm) % t) + 20;
        timer = setTimeout(atualizar, Math.max(50, espera));
      }
    }
    atualizar();

    return { titulo: 'Acompanhar pedido · Rango', limpar: function () { clearTimeout(timer); } };
  };
})();
