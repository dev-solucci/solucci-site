const stage = document.querySelector('#stage');
const bottle = document.querySelector('#bottle');
const angle = document.querySelector('#angle');
const play = document.querySelector('#play');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const frames = new Map();
let current = 0;
let playing = !motion.matches;
let visible = false;
let timer;
function frame(index) {
  if (!frames.has(index)) {
    const img = new Image();
    img.src = 'orbit/' + String(index).padStart(2, '0') + '.webp';
    frames.set(index, img);
  }
  return frames.get(index);
}
function show(index) {
  current = (index + 48) % 48;
  const img = frame(current);
  const paint = () => { if (frame(current) === img) bottle.src = img.src; };
  if (img.complete && img.naturalWidth) paint();
  else img.addEventListener('load', paint, {once:true});
  angle.value = current;
  const degrees = Math.round(current * 7.5) + '°';
  angle.setAttribute('aria-valuetext', degrees);
  document.querySelector('#degrees').value = degrees;
  frame((current + 1) % 48);
}
function sync() {
  clearInterval(timer);
  play.textContent = playing ? 'Pause' : 'Play';
  play.setAttribute('aria-label', playing ? 'Pause rotation' : 'Play rotation');
  if (playing && visible && !document.hidden) timer = setInterval(() => show(current + 1), 115);
}
function manual(index) {
  playing = false;
  sync();
  show(index);
}
stage.querySelector('.controls').hidden = false;
play.onclick = () => { playing = !playing; sync(); };
angle.oninput = () => manual(Number(angle.value));
let start;
stage.addEventListener('pointerdown', e => {
  if (e.target.closest('.controls') || e.button !== 0) return;
  start = {x:e.clientX, index:current};
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', e => {
  if (start && Math.abs(e.clientX - start.x) > 3) manual(start.index + Math.round((e.clientX - start.x) / 5) % 48);
});
stage.onlostpointercapture = stage.onpointercancel = stage.onpointerup = () => {start = null;};
new IntersectionObserver(entries => {visible = entries[0].isIntersecting; sync();}).observe(stage);
document.addEventListener('visibilitychange', sync);
motion.addEventListener('change', () => {playing = !motion.matches; sync();});
show(0);
sync();
const parts = {
  loop: ['detail.webp','A flattened silicone loop arcs above the cap.'],
  cap: ['detail.webp','Fine concentric grooves catch the light on the metal cap.'],
  body: ['brand.webp','The Solucci mark follows the curve of the graphite body.']
};
for (const button of document.querySelectorAll('[data-part]')) {
  button.onclick = () => {
    const part = button.dataset.part;
    for (const other of document.querySelectorAll('.choices button')) other.setAttribute('aria-pressed', String(button === other));
    const [src, note] = parts[part];
    const macro = document.querySelector('#macro');
    macro.src = src;
    macro.alt = note;
    macro.parentElement.dataset.part = part;
    document.querySelector('#materialNote').textContent = note;
  };
}
