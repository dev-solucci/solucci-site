(() => {
  const locales = window.solucciLocales;
  if (!locales) return;
  const sceneBase = new URL('../assets/idiomas/', document.currentScript.src);
  const languages = {br: ['pt-BR', 'Português'], us: ['en-US', 'English'], es: ['es', 'Español'], fr: ['fr', 'Français']};
  const stored = () => { try { return localStorage.getItem('solucci-language'); } catch { return null; } };
  let current = new URL(location.href).searchParams.get('lang') || stored() || 'br';
  if (!languages[current]) current = 'br';
  const textState = new WeakMap();
  const attributeState = new WeakMap();
  const header = document.querySelector('.header');
  const trigger = document.createElement('button');
  trigger.className = 'language-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'language-panel');
  trigger.setAttribute('aria-label', 'Selecionar idioma');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/></svg><span data-language-code></span>';
  header.append(trigger);
  const panel = document.createElement('dialog');
  panel.id = 'language-panel';
  panel.className = 'language-panel';
  panel.setAttribute('aria-labelledby', 'language-title');
  panel.innerHTML = '<div class="language-heading"><h2 id="language-title">Escolha seu idioma.</h2><button type="button" class="language-close" aria-label="Fechar seletor de idioma"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="language-options" data-no-translate></div><p class="language-note">As telas dos projetos permanecem no idioma original.</p>';
  document.body.append(panel);
  const options = panel.querySelector('.language-options');
  Object.entries(languages).forEach(([code, [lang, name]]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.locale = code;
    button.lang = lang;
    button.innerHTML = `<span class="language-scene" aria-hidden="true"><img src="${sceneBase}${code}-cartoon-v3.webp" alt="" loading="lazy"></span><span class="language-code">${code.toUpperCase()}</span><span class="language-name">${name}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>`;
    button.addEventListener('click', () => { current = code; applyLanguage(); panel.close(); });
    options.append(button);
  });
  trigger.querySelector('[data-language-code]').setAttribute('data-no-translate', '');
  const normalize = text => text.trim().replace(/\s+/g, ' ');
  function translate(value) {
    const key = normalize(value);
    let translated = locales[current]?.[key];
    if (translated === undefined && /^(Conlife|Sorteio Fácil|Bestfisio|Brain Restart|Coonect): /.test(key)) {
      const separator = key.indexOf(': ') + 2;
      const suffix = locales[current]?.[key.slice(separator)];
      if (suffix) translated = key.slice(0, separator) + suffix;
    }
    return translated === undefined ? value : value.replace(value.trim(), translated);
  }
  function translateTree() {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || node.parentElement.closest('script,style,[data-no-translate]') || !node.data.trim()) continue;
      let state = textState.get(node);
      if (!state || node.data !== state.last) state = {source: node.data, last: node.data};
      const value = current === 'br' ? state.source : translate(state.source);
      if (node.data !== value) node.data = value;
      state.last = value;
      textState.set(node, state);
    }
    document.querySelectorAll('[aria-label],[alt],[title],meta[name="description"],meta[property^="og:"]').forEach(element => {
      if (element.closest('[data-no-translate]')) return;
      let states = attributeState.get(element);
      if (!states) { states = {}; attributeState.set(element, states); }
      ['aria-label', 'alt', 'title', ...(element.tagName === 'META' ? ['content'] : [])].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        const raw = element.getAttribute(attribute);
        let state = states[attribute];
        if (!state || raw !== state.last) state = {source: raw, last: raw};
        const value = current === 'br' ? state.source : translate(state.source);
        if (raw !== value) element.setAttribute(attribute, value);
        state.last = value;
        states[attribute] = state;
      });
    });
  }
  function applyLanguage() {
    document.documentElement.lang = languages[current][0];
    document.documentElement.dataset.language = current;
    trigger.querySelector('[data-language-code]').textContent = current.toUpperCase();
    trigger.setAttribute('aria-description', languages[current][1]);
    const greetings = {br: 'Oi, Solucci. Quero conversar sobre um projeto.', us: 'Hi, Solucci. I would like to discuss a project.', es: 'Hola, Solucci. Quiero hablar sobre un proyecto.', fr: 'Bonjour Solucci. Je souhaite discuter d’un projet.'};
    document.querySelectorAll('a[href^="https://wa.me/5512981569832"]').forEach(link => {
      const contact = new URL(link.href);
      const project = link.dataset.contactCase;
      const caseGreetings = {
        br: `Oi, Solucci. Vi o case ${project} e quero conversar sobre meu projeto.`,
        us: `Hi, Solucci. I saw the ${project} case study and would like to discuss my project.`,
        es: `Hola, Solucci. Vi el caso ${project} y quiero hablar sobre mi proyecto.`,
        fr: `Bonjour Solucci. J’ai vu le projet ${project} et souhaite parler de mon projet.`
      };
      contact.searchParams.set('text', project ? caseGreetings[current] : greetings[current]);
      link.href = contact.href;
    });
    options.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.locale === current)));
    const url = new URL(location.href);
    if (current === 'br') url.searchParams.delete('lang');
    else url.searchParams.set('lang', current);
    history.replaceState(null, '', url);
    try { localStorage.setItem('solucci-language', current); } catch { /* A escolha continua válida nesta página quando o navegador bloqueia armazenamento. */ }
    translateTree();
  }
  trigger.addEventListener('click', () => {
    panel.showModal();
    options.querySelector(`[data-locale="${current}"]`).focus();
  });
  panel.querySelector('.language-close').addEventListener('click', () => panel.close());
  panel.addEventListener('click', event => {
    const bounds = panel.getBoundingClientRect();
    if (event.target === panel && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) panel.close();
  });
  panel.addEventListener('close', () => trigger.focus({preventScroll: true}));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/\/(?:index\.html)?$|\/cases\/[^/]+\.html$/.test(url.pathname)) return;
    if (current === 'br') url.searchParams.delete('lang');
    else url.searchParams.set('lang', current);
    link.href = url.href;
  });
  let scheduled = false;
  new MutationObserver(records => {
    if (records.every(record => (record.target.nodeType === Node.TEXT_NODE ? record.target.parentElement : record.target).closest('.scene-coordinate,[data-no-translate]'))) return;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; translateTree(); });
  }).observe(document.body, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'alt', 'title']});
  applyLanguage();
})();
