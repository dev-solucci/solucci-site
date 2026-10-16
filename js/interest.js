(() => {
  if (!['solucci.com.br', 'www.solucci.com.br'].includes(location.hostname)) return;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || typeof window.gtag !== 'function') return;
    const url = new URL(link.href, location.href);
    const source = location.pathname.replace(/\/index\.html$/, '/') || '/';
    const language = document.documentElement.lang;
    if (url.hostname === 'wa.me' || url.protocol === 'mailto:') {
      window.gtag('event', 'contact_click', {
        contact_channel: url.protocol === 'mailto:' ? 'email' : 'whatsapp',
        source_page: source,
        contact_placement: link.closest('.case-contact') ? 'case' : link.closest('footer') ? 'footer' : 'page',
        language
      });
    } else if (url.origin === location.origin && /^\/cases\/[^/]+\.html$/.test(url.pathname)) {
      window.gtag('event', 'case_open', {case_slug: url.pathname.split('/').pop().replace('.html', ''), source_page: source, language});
    }
  });
})();
