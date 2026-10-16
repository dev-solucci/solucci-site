(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded','false');
    menuButton.querySelector('span').textContent = '+';
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menu.hidden = open;
    menuButton.setAttribute('aria-expanded',String(!open));
    menuButton.querySelector('span').textContent = open ? '+' : '×';
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });
  matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);
  document.getElementById('year').textContent = new Date().getFullYear();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.getElementById('motion-toggle');
  const video = document.querySelector('.factory video');
  let paused = reduced.matches;
  let videoVisible = false;
  function updateVideo() {
    if (paused || !videoVisible || document.hidden) video.pause();
    else video.play().catch(() => { video.dataset.playback = 'poster'; });
  }
  function setMotion() {
    document.documentElement.dataset.motion = paused ? 'paused' : 'playing';
    motion.setAttribute('aria-pressed',String(paused));
    motion.querySelector('.motion-label').textContent = paused ? 'Ativar movimento' : 'Pausar movimento';
    motion.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    document.dispatchEvent(new CustomEvent('solucci:motion',{detail:{paused}}));
    updateVideo();
  }
  motion.addEventListener('click',() => { paused = !paused; setMotion(); });
  reduced.addEventListener('change',() => { paused = reduced.matches; setMotion(); });
  new IntersectionObserver(entries => {
    videoVisible = entries[0].isIntersecting;
    updateVideo();
  },{threshold:.15}).observe(video);
  document.addEventListener('visibilitychange',updateVideo);
  document.querySelectorAll('.capability-list summary').forEach(summary => {
    let feedbackTimer;
    const title = summary.querySelector('.cap-title');
    function feedback() {
      clearTimeout(feedbackTimer);
      title.classList.remove('cap-active');
      void title.offsetWidth;
      title.classList.add('cap-active');
      feedbackTimer = setTimeout(() => title.classList.remove('cap-active'), 850);
    }
    summary.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') feedback();
    });
    summary.addEventListener('click', feedback);
    summary.addEventListener('focus', feedback);
    summary.addEventListener('pointerleave', () => {
      clearTimeout(feedbackTimer);
      title.classList.remove('cap-active');
    });
  });
  setMotion();
})();
