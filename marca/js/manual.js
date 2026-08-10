/* Solucci . manual de marca
   Quatro coisas: troca de idioma, índice que acompanha a rolagem,
   palcos de fundo do logo e amostras de cor que copiam o hex. */
(function () {
  'use strict';

  var raiz = document.documentElement;

  /* ---------- idioma ---------- */
  var botoes = document.querySelectorAll('.lang button');

  function idioma(cod) {
    raiz.setAttribute('data-lang', cod);
    raiz.setAttribute('lang', cod === 'pt' ? 'pt-BR' : 'en');
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].setAttribute('aria-pressed', String(botoes[i].dataset.set === cod));
    }
    try { localStorage.setItem('solucci-manual-lang', cod); } catch (e) {}
  }

  for (var i = 0; i < botoes.length; i++) {
    botoes[i].addEventListener('click', function () { idioma(this.dataset.set); });
  }

  try {
    var salvo = localStorage.getItem('solucci-manual-lang');
    if (salvo === 'pt' || salvo === 'en') idioma(salvo);
    else if ((navigator.language || '').slice(0, 2) !== 'pt') idioma('en');
  } catch (e) {}

  /* ---------- paleta ---------- */
  var PALETA = [
    { nome: 'Ink', hex: '#16141D', pt: 'Base. Texto, fundo escuro, logo.', en: 'Base. Text, dark backgrounds, logo.' },
    { nome: 'Ink suave', en_nome: 'Soft ink', hex: '#4A5769', pt: 'Texto de apoio e parágrafo secundário.', en: 'Support text and secondary copy.' },
    { nome: 'Ink apagado', en_nome: 'Faint ink', hex: '#8C9EA6', pt: 'Legenda, metadado, estado inativo.', en: 'Captions, metadata, inactive states.' },
    { nome: 'Coral', hex: '#F5533D', pt: 'Cor de ação. Botão e link em destaque.', en: 'Action colour. Buttons and highlighted links.' },
    { nome: 'Coral fundo', en_nome: 'Deep coral', hex: '#D63A26', pt: 'Hover, estado pressionado e link em texto.', en: 'Hover, pressed state and inline links.' },
    { nome: 'Teal', hex: '#0FB5A6', pt: 'Cor de ferramenta. Seleção, foco, estado.', en: 'Tooling colour. Selection, focus, state.' },
    { nome: 'Teal fundo', en_nome: 'Deep teal', hex: '#0A8C81', pt: 'Teal sobre fundo claro, quando precisa de contraste.', en: 'Teal on light backgrounds, when contrast is needed.' },
    { nome: 'Bronze', hex: '#E8A33D', pt: 'Acento quente. Destaque em cartão.', en: 'Warm accent. Card highlights.' },
    { nome: 'Ouro', en_nome: 'Gold', hex: '#FFC24D', pt: 'Realce pontual, selo, conquista.', en: 'Spot highlight, badges, achievements.' },
    { nome: 'Magenta', hex: '#B23A80', pt: 'Acento frio. Contrapõe o coral.', en: 'Cool accent. Counterweight to coral.' },
    { nome: 'Creme', en_nome: 'Cream', hex: '#FAF8F3', pt: 'Fundo claro principal.', en: 'Primary light background.' },
    { nome: 'Gelo', en_nome: 'Ice', hex: '#E7EBEC', pt: 'Fundo claro secundário e base de gradiente.', en: 'Secondary light background and gradient base.' },
    { nome: 'Osso', en_nome: 'Bone', hex: '#F3F1EC', pt: 'Texto e logo sobre fundo escuro.', en: 'Text and logo on dark backgrounds.' }
  ];

  var caixa = document.getElementById('swatches');
  if (caixa) {
    PALETA.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sw';
      b.innerHTML =
        '<span class="sw-cor" style="background:' + c.hex + '" data-copiado="copiado"></span>' +
        '<span class="sw-txt">' +
          '<span class="sw-nome" lang="pt">' + c.nome + '</span>' +
          '<span class="sw-nome" lang="en">' + (c.en_nome || c.nome) + '</span>' +
          '<span class="sw-hex">' + c.hex + '</span>' +
          '<span class="sw-papel" lang="pt">' + c.pt + '</span>' +
          '<span class="sw-papel" lang="en">' + c.en + '</span>' +
        '</span>';
      b.addEventListener('click', function () {
        var alvo = b.querySelector('.sw-cor');
        alvo.setAttribute('data-copiado', raiz.getAttribute('data-lang') === 'en' ? 'copied' : 'copiado');
        if (navigator.clipboard) navigator.clipboard.writeText(c.hex);
        b.classList.add('copiado');
        setTimeout(function () { b.classList.remove('copiado'); }, 1100);
      });
      caixa.appendChild(b);
    });
  }

  /* ---------- palcos do logo ---------- */
  document.querySelectorAll('.palco-bar button[data-fundo]').forEach(function (b) {
    b.addEventListener('click', function () {
      var palco = b.closest('.palco');
      palco.setAttribute('data-fundo', b.dataset.fundo);
      palco.querySelectorAll('.palco-bar button[data-fundo]').forEach(function (o) {
        o.setAttribute('aria-pressed', String(o === b));
      });
    });
  });

  /* ---------- índice e fio de progresso ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail a[href^="#"]'));
  var secoes = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  var fio = document.getElementById('prog');

  function acompanha() {
    var y = window.scrollY + window.innerHeight * 0.28;
    var atual = 0;
    for (var i = 0; i < secoes.length; i++) {
      if (secoes[i].offsetTop <= y) atual = i;
    }
    links.forEach(function (a, i) { a.classList.toggle('aqui', i === atual); });

    if (fio) {
      var alcance = document.body.scrollHeight - window.innerHeight;
      fio.style.width = (alcance > 0 ? (window.scrollY / alcance) * 100 : 0) + '%';
    }
  }

  var pendente = false;
  window.addEventListener('scroll', function () {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(function () { acompanha(); pendente = false; });
  }, { passive: true });
  window.addEventListener('resize', acompanha);
  acompanha();
})();
