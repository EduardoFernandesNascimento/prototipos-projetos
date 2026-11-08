/* Utilitários do protótipo Rango: formatação, texto e acesso aos dados. */
(function () {
  'use strict';
  var R = window.Rango = window.Rango || {};

  var formatoBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  /* centavos -> "R$ 12,90" (o Intl usa espaço inseparável; trocamos por espaço comum para o texto ficar previsível) */
  R.preco = function (centavos) {
    return formatoBRL.format(centavos / 100).replace(/ /g, ' ');
  };

  R.taxaTexto = function (centavos) {
    return centavos === 0 ? 'Entrega grátis' : R.preco(centavos);
  };

  R.nota = function (n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  R.tempoTexto = function (t) {
    return t[0] + '–' + t[1] + ' min';
  };

  /* sem maiúsculas e sem acentos (REQ-003) */
  R.normalizar = function (s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  };

  R.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  R.itensTexto = function (n) {
    return n === 1 ? '1 item' : n + ' itens';
  };

  R.restaurante = function (id) {
    id = Number(id);
    return window.RANGO_DADOS.restaurantes.find(function (r) { return r.id === id; }) || null;
  };

  R.prato = function (id) {
    id = Number(id);
    var rs = window.RANGO_DADOS.restaurantes;
    for (var i = 0; i < rs.length; i++) {
      for (var j = 0; j < rs[i].secoes.length; j++) {
        var p = rs[i].secoes[j].pratos.find(function (x) { return x.id === id; });
        if (p) return { prato: p, restaurante: rs[i] };
      }
    }
    return null;
  };

  R.categoriaNome = function (id) {
    var c = window.RANGO_DADOS.categorias.find(function (x) { return x.id === id; });
    return c ? c.nome : id;
  };

  /* lê valor em reais digitado ("50", "50,00", "R$ 1.050,50") -> centavos, ou NaN */
  R.lerReais = function (texto) {
    var t = String(texto).replace(/R\$/i, '').replace(/\s/g, '');
    if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(t)) return NaN;
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    return Math.round(parseFloat(t) * 100);
  };
})();
