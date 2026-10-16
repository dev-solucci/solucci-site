(() => {
  const project = document.body.dataset.project;
  const image = document.getElementById('app-screen');
  const surface = document.querySelector('.gallery-surface');
  const viewport = document.querySelector('.gallery-viewport');
  const stage = document.querySelector('.gallery-stage');
  const list = document.querySelector('.gallery-list');
  const status = document.getElementById('screen-status');
  const previous = document.getElementById('previous-screen');
  const next = document.getElementById('next-screen');
  const moduleButtons = [...document.querySelectorAll('[data-module]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const result = document.querySelector('.result-scene');
  const animationControl = document.getElementById('animation-control');
  const suspense = document.querySelector('.suspense-overlay');
  const dialog = document.querySelector('.screen-dialog');
  const dialogImage = document.getElementById('dialog-image');
  let groups = [];
  let groupIndex = 0;
  let index = 0;
  let revision = 0;
  let sequenceTimer;
  let motionTimer;
  let reelAnimation;
  let playing = false;

  const links = {
    'sorteio-facil': {
      home: [[5,7,12,6,'configuracoes','Abrir configurações'],[10,45,80,7,'participantes','Sortear nomes'],[10,54,80,7,'numeros','Sortear números'],[10,62,80,7,'equipes','Sortear equipes']],
      participantes: [[10,68,80,7,'draw','Reproduzir sorteio de nomes'],[58,61,32,5,'importar','Importar lista'],[3,5,13,7,'home','Voltar ao início']],
      nomes: [[10,68,80,7,'draw','Reproduzir sorteio'],[58,61,32,5,'importar','Importar lista']],
      numeros: [[10,74,80,7,'draw','Reproduzir sequência do sorteio'],[3,5,13,7,'home','Voltar ao início']],
      equipes: [[10,74,80,7,'draw','Reproduzir sequência do sorteio'],[10,59,80,9,'importar','Carregar lista'],[3,5,13,7,'home','Voltar ao início']],
      listas: [[85,87,13,8,'criar-lista','Criar lista'],[9,14,80,6,'lista-detalhe','Abrir lista'],[3,5,13,7,'configuracoes','Voltar às configurações']],
      'criar-lista': [[10,87,80,7,'lista-vazia','Continuar criação de lista']],
      'lista-vazia': [[10,84,80,7,'colar-nomes','Importar nomes'],[10,37,80,7,'lista-detalhe','Ver lista com participantes']],
      'colar-nomes': [[10,87,80,7,'lista-detalhe','Ver participantes importados']],
      'lista-detalhe': [[86,38,10,6,'confirmacao','Remover participante'],[3,5,13,7,'listas','Voltar às listas']],
      confirmacao: [[55,54,25,6,'sucesso','Confirmar exclusão'],[22,54,28,6,'lista-detalhe','Cancelar exclusão']],
      sucesso: [[10,87,80,7,'listas','Voltar às listas']],
      importar: [[10,77,80,7,'participantes','Adicionar listas ao sorteio'],[10,85,80,6,'listas','Gerenciar listas']],
      configuracoes: [[10,22,80,7,'historico','Abrir histórico'],[10,35,80,8,'listas','Abrir minhas listas'],[3,5,13,7,'home','Voltar ao início']],
      historico: [[9,22,83,7,'resultado-historico','Consultar resultado salvo'],[3,5,13,7,'configuracoes','Voltar às configurações']],
      'resultado-historico': [[4,5,12,7,'historico','Voltar ao histórico']],
      compartilhar: [[9,87,82,7,'aviso','Ver opção de compartilhar com imagem'],[9,78,82,7,'resultado','Voltar ao resultado']],
      aviso: [[20,57,32,6,'resultado','Cancelar compartilhamento']],
      erro: [[38,55,24,6,'equipes','Revisar configurações']]
    },
    'brain-restart': {
      dashboard: [[36,27.5,28,3,'desempenho','Explorar medalhas'],[91,2,8,5,'configuracoes','Abrir preferências']],
      desempenho: [[38,34,24,8,'ranking','Consultar ranking'],[86,6,12,6,'configuracoes','Abrir configurações'],[0,91,25,9,'dashboard','Voltar ao painel']],
      ranking: [[0,6,14,7,'dashboard','Voltar ao painel']],
      configuracoes: [[0,6,14,7,'dashboard','Voltar ao painel']]
    },
    bestfisio: {},
    coonect: {}
  };
  for (const screen of ['dashboard','agenda','paciente','configuracoes']) {
    links.bestfisio[screen] = [[1,12,14,4,'dashboard','Abrir painel'],[1,18,14,4,'agenda','Abrir agenda'],[1,27.5,14,4,'paciente','Abrir informações do paciente'],[1,57,14,4,'configuracoes','Abrir configurações']];
  }
  // A altura total varia; os atalhos acompanham a mesma navegação no topo de cada tela.
  const coonectHeights = {feed:3150,busca:1347,perfil:1024,comunidades:1274,conquistas:1416};
  Object.entries(coonectHeights).forEach(([screen,height]) => {
    links.coonect[screen] = [[38,0,7,60/height*100,'feed','Abrir feed'],[46,0,8,60/height*100,'conquistas','Abrir conquistas'],[55,0,7,60/height*100,'busca','Buscar conexões'],[63,0,9,60/height*100,'comunidades','Abrir comunidades']];
  });
  links.coonect.busca.push([26,38,18,5,'perfil','Explorar perfil da empresa']);

  function setMotion(enabled) {
    if (!result) return;
    clearTimeout(motionTimer);
    playing = enabled && !reduced.matches;
    result.querySelectorAll('[data-motion]').forEach(item => {
      item.src = `../assets/cases/sorteio-facil/${item.dataset.motion}${playing ? '.gif' : '-poster.webp'}`;
    });
    animationControl.textContent = playing ? 'Pausar animação' : 'Reproduzir animação';
    animationControl.setAttribute('aria-pressed', String(playing));
    if (playing) motionTimer = setTimeout(() => setMotion(false), 13500);
  }
  function stopSequence() {
    clearTimeout(sequenceTimer);
    reelAnimation?.cancel();
    suspense.hidden = true;
    setMotion(false);
  }
  function locate(id) {
    for (let group = 0; group < groups.length; group++) {
      const screenIndex = groups[group].screens.findIndex(screen => screen.id === id);
      if (screenIndex !== -1) return [group,screenIndex];
    }
  }
  function drawList() {
    const group = groups[groupIndex];
    document.getElementById('module-heading').textContent = group.heading;
    document.getElementById('module-description').textContent = group.description;
    moduleButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === groupIndex)));
    list.replaceChildren();
    group.screens.forEach((screen, i) => {
      const button = document.createElement('button');
      button.type = 'button';button.dataset.screen = screen.id;
      const number = document.createElement('span');number.textContent = String(i+1).padStart(2,'0');
      button.append(number,document.createTextNode(screen.title));
      button.addEventListener('click', async () => {
        await navigate(screen.id);
        if (innerWidth <= 760) stage.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth', block: 'start'});
      });
      list.append(button);
    });
  }
  function drawHotspots(id) {
    const layer = document.querySelector('.hotspot-layer');layer.replaceChildren();
    (links[project][id] || []).forEach(([x,y,w,h,target,label]) => {
      const button = document.createElement('button');button.type='button';
      button.setAttribute('aria-label',label);button.title=label;
      Object.assign(button.style,{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`});
      button.addEventListener('click', () => {
        target === 'draw' ? playSequence() : navigate(target);
        stage.focus({preventScroll:true});
      });layer.append(button);
    });
  }
  async function showScreen() {
    const currentRevision = ++revision;
    const screen = groups[groupIndex].screens[index];
    const preload = new Image();preload.src=screen.src;
    try { await preload.decode(); } catch {
      if (currentRevision === revision) status.textContent='Não foi possível carregar esta tela. Escolha outra.';
      return false;
    }
    if (currentRevision !== revision) return false;
    image.src=screen.src;image.alt=`${document.title.split(' · ')[0]}: ${screen.title}`;
    image.width=screen.width;image.height=screen.height;image.hidden=false;
    if (result) {
      result.hidden=screen.id!=='resultado';image.hidden=!result.hidden;
      animationControl.hidden=result.hidden;
      animationControl.disabled=reduced.matches;
      if(reduced.matches) animationControl.textContent='Movimento reduzido ativo';
    }
    viewport.scrollTop=0;viewport.scrollLeft=0;
    drawHotspots(screen.id);
    list.querySelectorAll('button').forEach(button=>button.setAttribute('aria-current',String(button.dataset.screen===screen.id)));
    previous.disabled=index===0;next.disabled=index===groups[groupIndex].screens.length-1;
    status.replaceChildren(document.createTextNode(`${String(index+1).padStart(2,'0')} / ${String(groups[groupIndex].screens.length).padStart(2,'0')}`));
    const label=document.createElement('span');label.textContent=screen.title;status.append(label);
    surface.dataset.screen=screen.id;
    if(!reduced.matches) surface.animate([{opacity:.6},{opacity:1}],{duration:160});
    return true;
  }
  async function navigate(id) {
    const location=locate(id);if(!location)return false;
    stopSequence();const changed=groupIndex!==location[0];
    [groupIndex,index]=location;if(changed)drawList();
    return showScreen();
  }
  async function playSequence() {
    if (innerWidth <= 760) stage.scrollIntoView({behavior: 'instant', block: 'start'});
    if(reduced.matches){await navigate('resultado');return;}
    if(!await navigate('suspense'))return;
    const sequenceRevision=revision;
    const reel=document.createElement('div');reel.className='suspense-reel';
    ['Pedro Silva','Joaquim Almeida','Mario Cecci','Jaqueline Santos','Kaike Soarez','Pedro Silva','Joaquim Almeida','Mario Cecci','Kaike Soarez'].forEach(name=>{const span=document.createElement('span');span.textContent=name;reel.append(span);});
    suspense.replaceChildren(reel);suspense.hidden=false;
    reelAnimation=reel.animate([{transform:'translateY(180px)'},{transform:'translateY(-180px)'}],{duration:2400,easing:'cubic-bezier(.18,.7,.1,1)',fill:'forwards'});
    sequenceTimer=setTimeout(async()=>{if(revision!==sequenceRevision)return;if(await navigate('resultado'))setMotion(true);},2500);
  }
  function move(delta){if(!groups.length)return;const target=index+delta;if(target>=0&&target<groups[groupIndex].screens.length)navigate(groups[groupIndex].screens[target].id);}
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  stage.addEventListener('keydown',event=>{if(event.target.closest('.gallery-viewport'))return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
  let start;
  viewport.addEventListener('touchstart',event=>{start=[event.touches[0].clientX,event.touches[0].clientY];},{passive:true});
  viewport.addEventListener('touchend',event=>{if(!start)return;const dx=event.changedTouches[0].clientX-start[0],dy=event.changedTouches[0].clientY-start[1];if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6)move(dx<0?1:-1);start=null;},{passive:true});
  document.getElementById('play-journey')?.addEventListener('click',playSequence);
  animationControl?.addEventListener('click',()=>setMotion(!playing));
  result?.querySelectorAll('[data-target]').forEach(button=>button.addEventListener('click',()=>button.dataset.target==='draw'?playSequence():navigate(button.dataset.target)));
  reduced.addEventListener('change',()=>{stopSequence();if(result&&!result.hidden){animationControl.disabled=reduced.matches;animationControl.textContent=reduced.matches?'Movimento reduzido ativo':'Reproduzir animação';}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSequence();});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stopSequence();}).observe(stage);

  document.querySelector('.zoom-screen').addEventListener('click',()=>{
    const selected=groups[groupIndex].screens[index];stopSequence();
    dialogImage.src=selected.src;dialogImage.alt=image.alt;
    dialog.dataset.kind=document.body.dataset.device;
    document.getElementById('dialog-title').textContent=selected.title;
    document.querySelector('.dialog-scroll').classList.remove('native-size');
    document.getElementById('dialog-scale').textContent='Tamanho original';
    document.getElementById('dialog-scale').setAttribute('aria-pressed','false');
    dialog.showModal();document.body.style.overflow='hidden';
  });
  document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow='';});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  document.getElementById('dialog-scale').addEventListener('click',event=>{
    const original=document.querySelector('.dialog-scroll').classList.toggle('native-size');
    event.currentTarget.textContent=original?'Ajustar à janela':'Tamanho original';event.currentTarget.setAttribute('aria-pressed',String(original));
  });
  fetch(`../assets/cases/${project}/screens.json`).then(response=>{if(!response.ok)throw Error('Galeria indisponível');return response.json();}).then(data=>{
    groups=data;drawList();showScreen();
    moduleButtons.forEach((button,i)=>button.addEventListener('click',()=>navigate(groups[i].screens[0].id)));
  }).catch(()=>{
    document.querySelector('.gallery-error').hidden=false;document.querySelector('.gallery-fallback').classList.add('is-visible');
    document.querySelectorAll('.case-modules button,.gallery-list button,.gallery-controls button,.zoom-screen,.journey-actions button').forEach(button=>button.disabled=true);
  });
})();
