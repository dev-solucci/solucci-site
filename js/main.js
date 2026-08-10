/* =========================================================
   Solucci . versão enxuta
   Quatro comportamentos, nada além. Sem lib, sem build.
   ========================================================= */
(function () {
'use strict';

var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
var $ = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

/* ---------------------------------------------------------
   1. Revelação na entrada
   --------------------------------------------------------- */
(function () {
  var alvos = $$('.reveal');
  if (!alvos.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    alvos.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });
  alvos.forEach(function (e) { io.observe(e); });
})();

/* ---------------------------------------------------------
   2. Título que decodifica perto do cursor
   Cada letra troca por glifo de código enquanto o ponteiro
   passa e vai assentando, com a troca desacelerando no fim.
   --------------------------------------------------------- */
(function () {
  var h1 = $('#h1'); if (!h1) return;

  var GLIFOS = '{}[]()<>/\\|=+-*!?#$%&_:;.~^01';
  var letras = [], estados = [], centros = [];

  (function fatiar(el) {
    [].slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split('').forEach(function (ch) {
          if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span');
          s.className = 'dc';
          s.textContent = ch;
          s.setAttribute('data-ch', ch);
          frag.appendChild(s);
          letras.push(s);
        });
        el.replaceChild(frag, n);
      } else if (n.nodeName !== 'BR') {
        fatiar(n);
      }
    });
  })(h1);
  if (!letras.length) return;

  var caret = document.createElement('i');
  caret.className = 'dc-caret';
  (h1.querySelector('.o') || h1).appendChild(caret);

  letras.forEach(function () { estados.push({ h: 0, t: 0 }); });

  function travar() {
    letras.forEach(function (s) {
      s.style.width = '';
      s.style.width = s.getBoundingClientRect().width.toFixed(2) + 'px';
    });
  }
  function medir() {
    centros = letras.map(function (s) {
      var r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  }
  // só vale medir com a fonte final já carregada
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { travar(); medir(); });
  } else { travar(); medir(); }
  addEventListener('resize', function () { travar(); medir(); });

  if (reduce) return;

  var mx = -9999, my = -9999, dentro = false;
  h1.addEventListener('pointerenter', function () { dentro = true; medir(); });
  h1.addEventListener('pointerleave', function () { dentro = false; });
  h1.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; });

  // no toque não existe hover, então o clique varre da esquerda pra direita
  h1.addEventListener('click', function () {
    letras.forEach(function (s, i) {
      setTimeout(function () { estados[i].h = 1; }, i * 24);
    });
  });

  var R = 132;
  (function quadro() {
    for (var i = 0; i < letras.length; i++) {
      var st = estados[i], s = letras[i], c = centros[i];
      if (dentro && c) {
        var dx = c.x - mx, dy = c.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < R) { var f = 1 - d / R; if (f > st.h) st.h = f; }
      }
      if (st.h > .03) {
        st.h *= .915;
        st.t++;
        var passo = Math.max(2, Math.round(9 - st.h * 7));
        if (st.t % passo === 0) s.textContent = GLIFOS.charAt((Math.random() * GLIFOS.length) | 0);
        s.style.color = st.h > .45 ? 'var(--tool)' : 'var(--gold)';
      } else if (st.h !== 0) {
        st.h = 0;
        s.textContent = s.getAttribute('data-ch');
        s.style.color = '';
      }
    }
    requestAnimationFrame(quadro);
  })();
})();

/* ---------------------------------------------------------
   3. Flutuante de WhatsApp, só depois da primeira tela
   --------------------------------------------------------- */
(function () {
  var wa = $('#waFloat'); if (!wa) return;
  wa.style.opacity = '0';
  wa.style.transform = 'translateY(14px) scale(.9)';
  wa.style.transition = 'opacity .35s cubic-bezier(.34,1.56,.64,1),transform .35s cubic-bezier(.34,1.56,.64,1)';
  function ver() {
    if (scrollY < innerHeight * .7) return;
    wa.style.opacity = '1';
    wa.style.transform = 'none';
    removeEventListener('scroll', ver);
  }
  addEventListener('scroll', ver, { passive: true });
  ver();
})();

/* ---------------------------------------------------------
   4. Prévia ao vivo dos trabalhos
   O quadro tem 1440 de largura fixa e é reduzido pra caber no
   cartão. O fundo em gradiente da marca fica embaixo e some
   quando o site termina de carregar.
   --------------------------------------------------------- */
(function () {
  var molduras = $$('.wk-live');
  if (!molduras.length) return;
  function ajustar() {
    molduras.forEach(function (m) {
      m.style.setProperty('--k', (m.clientWidth / 1440).toFixed(4));
    });
  }
  ajustar();
  addEventListener('resize', ajustar);
  $$('.wk-if').forEach(function (f) {

    f.addEventListener('load', function () {
      ajustar();
      f.classList.add('pronto');
      if (f.parentNode) f.parentNode.classList.add('pronto');
    });
  });
})();

/* ---------------------------------------------------------
   5. Zona de brincar
   Um terminal de verdade: você digita, ele responde. Os comandos
   dizem o que a casa faz, e um deles guarda o segredo mais velho
   da computação.
   --------------------------------------------------------- */
(function () {
  var forma = $('#csForm'), entrada = $('#csIn'), saida = $('#csOut'), consola = $('#console');
  if (!forma || !entrada || !saida || !consola) return;

  var fine = matchMedia('(pointer:fine)').matches;
  var WA = 'https://wa.me/5512997303068?text=Oi%2C%20Solucci.%20Tenho%20um%20projeto%20pra%20tirar%20do%20papel.';

  // a estrela da marca, tirada do próprio arquivo do logo
  var ESTRELA =
    '            -#*\n' +
    '          .*@@@-\n' +
    '         :%@@@@%\n' +
    '        -@@@@@@@.      .::\n' +
    '       -@@@@@#-..:+*%%@@#:\n' +
    '   .. :@@@@+:.=#@@@@@@@+\n' +
    '-*%@..@@@*-=#@@@#%@@@%-\n' +
    ':-+= %@@%#@@@%==#@@@#.\n' +
    '    =@@@@@@*::*@@@@@\n' +
    '   .@@@@@*: =@@@@@@@-\n' +
    '   +@@@#:   :=#@@@@@%\n' +
    '   #@#:        .-*@@@=\n' +
    '   *+              -**';

  function linha(classe, texto) {
    var p = document.createElement('p');
    if (classe) p.className = classe;
    if (texto !== undefined) p.textContent = texto;
    saida.appendChild(p);
    saida.scrollTop = saida.scrollHeight;
    return p;
  }
  function item(chave, valor) {
    var p = linha('ok');
    var c = document.createElement('span');
    c.className = 'ch';
    c.textContent = chave;
    p.appendChild(c);
    p.appendChild(document.createTextNode(valor));
    saida.scrollTop = saida.scrollHeight;
    return p;
  }
  function itemLink(chave, rotulo, href) {
    var p = linha('ok');
    var c = document.createElement('span');
    c.className = 'ch';
    c.textContent = chave;
    var a = document.createElement('a');
    a.href = href; a.textContent = rotulo;
    if (href.indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
    p.appendChild(c); p.appendChild(a);
    saida.scrollTop = saida.scrollHeight;
    return p;
  }

  var insistiu = 0;
  var TEIMOSIA = [
    'undefined',
    'undefined (de novo)',
    'sério, undefined',
    'você é persistente, hein',
    'ok, você venceu. continua undefined'
  ];

  var COMANDOS = {
    ajuda: function () {
      linha('ok', 'comandos disponíveis');
      item('divisoes', 'o que sai daqui');
      item('trabalhos', 'quem já está no ar');
      item('contato', 'como falar com a gente');
      item('nada', 'não faz nada, é sério');
      item('limpar', 'limpa a tela');
    },
    divisoes: function () {
      item('design', 'identidade, UX/UI e direção de arte');
      item('dev', 'sites, sistemas, integração e automação');
      item('games', 'digital e analógico, do conceito ao jogável');
      item('music', 'produção, distribuição e palco');
    },
    trabalhos: function () {
      itemLink('serramar', 'serramar.coop.br', 'https://www.serramar.coop.br/');
      itemLink('mcg', 'mcglab.com.br', 'https://mcglab.com.br/');
      itemLink('prime', 'primereab.com.br', 'https://www.primereab.com.br/');
      linha('ret', 'o resto a gente mostra na conversa');
    },
    contato: function () {
      itemLink('whatsapp', '+55 12 99730 3068', WA);
      itemLink('email', 'contato@solucci.com.br', 'mailto:contato@solucci.com.br');
      item('status', 'aberto pra novos projetos');
    },
    nada: function () {
      linha('ret', TEIMOSIA[Math.min(insistiu, TEIMOSIA.length - 1)]);
      insistiu++;
    },
    limpar: function () { saida.innerHTML = ''; },
    xyzzy: function () { revelar(); }
  };
  // apelidos que qualquer um tentaria
  COMANDOS['help'] = COMANDOS.ajuda;
  COMANDOS['clear'] = COMANDOS.limpar;
  COMANDOS['divisões'] = COMANDOS.divisoes;
  COMANDOS['nada()'] = COMANDOS.nada;

  function rodar(bruto) {
    var cmd = (bruto || '').trim().toLowerCase();
    if (!cmd) cmd = 'ajuda';
    linha('eco', cmd);
    var fn = COMANDOS[cmd];
    if (fn) fn();
    else linha('err', 'comando não encontrado. tenta ajuda');
  }

  forma.addEventListener('submit', function (e) {
    e.preventDefault();
    rodar(entrada.value);
    entrada.value = '';
  });

  /* ---- o segredo mais velho da computação ----
     XYZZY, do Colossal Cave de 1976, responde "nothing happens".
     Combina demais com uma função que devolve undefined. ---- */
  var secreto = false;
  function revelar() {
    if (secreto) { linha('ret', 'nothing happens. de novo.'); return; }
    secreto = true;
    consola.classList.add('secreto');
    linha('ret', 'nothing happens.');
    var arte = linha('arte');
    arte.textContent = ESTRELA;
    linha('ret', 'Colossal Cave, 1976. o easter egg mais velho que existe.');
    var dica = $('#csHint');
    if (dica) dica.innerHTML = 'modo fósforo . <b>xyzzy</b>';
  }

  var KONAMI = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  var passoK = 0;
  addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    passoK = (k === KONAMI[passoK]) ? passoK + 1 : (k === KONAMI[0] ? 1 : 0);
    if (passoK === KONAMI.length) {
      passoK = 0;
      linha('eco', 'xyzzy');
      revelar();
    }
  });

  // no toque não tem teclado pro Konami, então o nome do arquivo abre a porta
  var arquivo = $('#csFile'), batidas = 0, relogio = null;
  if (arquivo) {
    arquivo.addEventListener('click', function () {
      batidas++;
      clearTimeout(relogio);
      relogio = setTimeout(function () { batidas = 0; }, 900);
      if (batidas >= 5) { batidas = 0; linha('eco', 'xyzzy'); revelar(); }
    });
  }
  if (!fine) {
    var dicaT = $('#csHint');
    if (dicaT) dicaT.innerHTML = 'dica: <b>toca cinco vezes em nada.js</b>';
  }

  // já começa com uma resposta na tela, senão o terminal parece morto
  linha('eco', 'ajuda');
  COMANDOS.ajuda();
})();

/* ---------------------------------------------------------
   6. Topo transparente sobre o hero, sólido depois dele
   --------------------------------------------------------- */
(function () {
  var top = $('.top'), hero = $('.hero');
  if (!top || !hero) return;
  function ver() {
    top.classList.toggle('solid', scrollY > hero.offsetHeight - 80);
  }
  addEventListener('scroll', ver, { passive: true });
  addEventListener('resize', ver);
  ver();
})();

/* ---------------------------------------------------------
   7. Ano do rodapé
   --------------------------------------------------------- */
(function () {
  var a = $('#ano');
  if (a) a.textContent = new Date().getFullYear();
})();

})();
