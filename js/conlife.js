(() => {
  const moduleButtons = [...document.querySelectorAll('[data-module]')];
  const screen = document.getElementById('app-screen');
  const stage = document.querySelector('.device-stage');
  const list = document.querySelector('.screen-list');
  const previous = document.getElementById('previous-screen');
  const next = document.getElementById('next-screen');
  const status = document.getElementById('screen-status');
  let modules = [];
  let moduleIndex = 0;
  let screenIndex = 0;
  let revision = 0;
  const hotspots = {
    '0:0': [[5,37,28,12,0,1,'Explorar transferências'],[36,37,28,12,1,0,'Explorar Pix'],[67,65,28,12,2,0,'Explorar recargas']],
    '1:0': [[7,30,86,14,1,1,'Ver leitura de QR Code']],
    '2:0': [[5,86,90,10,2,2,'Ver revisão da recarga']],
    '2:2': [[5,86,90,10,2,3,'Ver pagamento por Pix']],
    '2:3': [[5,86,90,10,2,4,'Ver confirmação da recarga']],
    '2:4': [[15,49,70,9,2,0,'Voltar à seleção de recarga']],
    '3:0': [[10,50,84,11,3,1,'Ver cadastro de cartão']],
    '3:2': [[65,91,32,7,3,4,'Ver orientações de solicitação']],
    '4:0': [[53,78,42,10,4,1,'Conhecer FitAnywhere']],
    '4:1': [[5,88,90,9,4,2,'Ver dados para adesão']],
    '4:2': [[5,83,90,9,4,3,'Ver revisão da assinatura']],
    '4:3': [[5,83,90,9,4,4,'Ver autorização da assinatura']]
  };
  const screenSurface = document.createElement('div');
  screenSurface.className = 'screen-surface';
  screen.parentElement.append(screenSurface);
  screenSurface.append(screen);
  function showHotspots() {
    screenSurface.querySelectorAll('.screen-hotspot').forEach(button => button.remove());
    (hotspots[`${moduleIndex}:${screenIndex}`] || []).forEach(([x,y,w,h,module,target,label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'screen-hotspot';
      button.setAttribute('aria-label', label);
      button.title = label;
      Object.assign(button.style, {left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`});
      button.addEventListener('click', () => {
        if (moduleIndex !== module) selectModule(module);
        screenIndex = target;
        showScreen();
        stage.focus({preventScroll: true});
      });
      screenSurface.append(button);
    });
  }
  stage.tabIndex = 0;
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', 'Explorador de telas. Use as setas do teclado para navegar.');

  async function showScreen() {
    const currentRevision = ++revision;
    const module = modules[moduleIndex];
    const selected = module.screens[screenIndex];
    const image = new Image();
    image.src = selected.src;
    try { await image.decode(); } catch {
      if (currentRevision === revision) status.textContent = 'Não foi possível carregar esta tela. Escolha outra.';
      return;
    }
    if (currentRevision !== revision) return;
    screen.src = image.src;
    screen.alt = `Conlife, ${module.title}: ${selected.title}`;
    screen.width = selected.width;
    screen.height = selected.height;
    screen.closest('.device-screen').scrollTop = 0;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      screen.animate([{opacity: .4, transform: 'translateX(8px)'}, {opacity: 1, transform: 'translateX(0)'}], {duration: 180});
    }
    showHotspots();
    previous.disabled = screenIndex === 0;
    next.disabled = screenIndex === module.screens.length - 1;
    status.replaceChildren(document.createTextNode(`${String(screenIndex + 1).padStart(2, '0')} / ${String(module.screens.length).padStart(2, '0')}`));
    const label = document.createElement('span');
    label.textContent = selected.title;
    status.append(label);
    list.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-current', String(index === screenIndex)));
  }

  function selectModule(index) {
    moduleIndex = index;
    screenIndex = 0;
    const module = modules[index];
    moduleButtons.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
    document.getElementById('module-heading').textContent = module.heading;
    document.getElementById('module-description').textContent = module.description;
    list.replaceChildren();
    module.screens.forEach((item, position) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.screen = position;
      const number = document.createElement('span');
      number.textContent = String(position + 1).padStart(2, '0');
      button.append(number, document.createTextNode(item.title));
      button.addEventListener('click', () => { screenIndex = position; showScreen(); });
      list.append(button);
    });
    showScreen();
  }

  function move(direction) {
    if (!modules.length) return;
    const index = Math.max(0, Math.min(modules[moduleIndex].screens.length - 1, screenIndex + direction));
    if (index !== screenIndex) { screenIndex = index; showScreen(); }
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let touch = null;
  screen.addEventListener('touchstart', event => { touch = [event.touches[0].clientX, event.touches[0].clientY]; }, {passive: true});
  screen.addEventListener('touchend', event => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch[0];
    const dy = event.changedTouches[0].clientY - touch[1];
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    touch = null;
  }, {passive: true});
  fetch('../assets/cases/conlife/screens.json').then(response => {
    if (!response.ok) throw new Error('Telas indisponíveis');
    return response.json();
  }).then(data => {
    modules = data;
    moduleButtons.forEach((button, index) => button.addEventListener('click', () => selectModule(index)));
    selectModule(0);
  }).catch(() => {
    status.textContent = 'A galeria não carregou. Recarregue a página para tentar novamente.';
    moduleButtons.forEach(button => { button.disabled = true; });
    previous.disabled = true;
    next.disabled = true;
  });

  const explanations = {
    all: ['O caminho ideal e as exceções.', 'A escolha da forma de pagamento divide a jornada. O Pix depende da confirmação do pagamento. O saldo da conta exige PIN e movimentação para a tesouraria. Quem não tem conta recebe orientação para encontrar um ponto de recarga.'],
    pix: ['Pix: confirmar antes de comprar.', 'O QR Code inicia o pagamento. Se o pagamento não for realizado, o fluxo apresenta o aviso de expiração. Com a confirmação, segue para a compra de dados e o comprovante. Um erro na compra leva ao estorno.'],
    saldo: ['Saldo: autorizar, transferir, concluir.', 'Quem tem conta digital informa o PIN. O saldo passa da conta do cliente para a tesouraria antes da compra de dados. Em caso de erro, o fluxo devolve o saldo à conta do cliente.'],
    local: ['Sem conta: orientar o próximo passo.', 'Quem não usa Pix e não tem conta digital recebe um aviso sobre a recarga. O mapa de pontos de recarga oferece uma alternativa para continuar fora do aplicativo.']
  };
  document.querySelectorAll('[data-route-select]').forEach(button => {
    button.addEventListener('click', () => {
      const route = button.dataset.routeSelect;
      document.querySelectorAll('[data-route-select]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelectorAll('.flow-scroll [data-route]').forEach(item => {
        const routes = item.dataset.route.split(' ');
        item.classList.toggle('is-active', route !== 'all' && (routes.includes(route) || routes.includes('common')));
      });
      document.getElementById('route-title').textContent = explanations[route][0];
      document.getElementById('route-copy').textContent = explanations[route][1];
    });
  });
  const zoom = document.getElementById('flow-zoom');
  zoom.addEventListener('click', () => {
    const expanded = document.querySelector('.flow-scroll').classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(expanded));
    zoom.textContent = expanded ? 'Ajustar fluxo' : 'Ampliar fluxo';
  });
})();
