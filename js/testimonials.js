(() => {
  const section = document.querySelector('.testimonials');
  const cards = [...section.querySelectorAll('.testimonial-card')];
  const picks = [...section.querySelectorAll('[data-testimonial]')];
  const visited = new Set([0]);
  const stage = section.querySelector('.testimonial-stage');
  let current = 0;
  let animation;
  const format = value => `${String(value).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  function select(index) {
    const next = (index + cards.length) % cards.length;
    const direction = next < current ? -1 : 1;
    animation?.cancel();
    current = next;
    visited.add(current);
    cards.forEach((card, i) => { card.hidden = i !== current; });
    picks.forEach((pick, i) => {
      pick.setAttribute('aria-pressed', String(i === current));
      pick.classList.toggle('is-seen', visited.has(i));
    });
    section.querySelector('[data-testimonial-current]').textContent = format(current + 1);
    section.querySelector('[data-testimonial-progress]').textContent = format(visited.size);
    section.querySelectorAll('.collection-track span').forEach((part, i) => part.classList.toggle('is-seen', i < visited.size));
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.motion !== 'paused') {
      animation = cards[current].animate([{opacity:0, transform:`translateX(${direction * 20}px) rotate(${direction * .6}deg)`},{opacity:1, transform:'translateX(0) rotate(0)'}], {duration:320,easing:'cubic-bezier(.2,.7,.2,1)'});
    }
  }
  picks.forEach((pick, i) => pick.addEventListener('click', () => select(i)));
  section.querySelector('.testimonial-next').addEventListener('click', () => select(current + 1));
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      select(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  section.querySelector('.testimonial-navigation').hidden = false;
  section.querySelector('.testimonial-controls').hidden = false;
  select(0);
})();
