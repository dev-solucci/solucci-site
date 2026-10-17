(() => {
  const canvas = document.getElementById('brand-scene');
  const scene = canvas.closest('.scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return;
  const vertex = `
    attribute vec3 position;
    attribute vec3 normal;
    uniform mat3 rotation;
    uniform float aspect;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 p = rotation * position;
      vPosition = p;
      vNormal = rotation * normal;
      float perspective = 8.0 / (8.0 - p.z);
      gl_Position = vec4(p.x / 2.7 * perspective / aspect, p.y / 2.7 * perspective, -p.z / 10.0, 1.0);
    }`;
  const fragment = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 n = normalize(vNormal);
      if (!gl_FrontFacing) n = -n;
      vec3 eye = normalize(vec3(0.0, 0.0, 8.0) - vPosition);
      vec3 reflection = reflect(-eye, n);
      vec3 base = vec3(0.18, 0.19, 0.22);
      float top = smoothstep(-0.2, 0.8, reflection.y);
      float strip = pow(max(0.0, dot(reflection, normalize(vec3(-0.8, 0.9, 1.0)))), 6.0);
      float bottom = pow(max(0.0, dot(reflection, normalize(vec3(0.2, -1.0, 0.8)))), 16.0);
      float coral = pow(max(0.0, dot(reflection, normalize(vec3(1.0, -0.25, 0.5)))), 9.0);
      float edge = pow(1.0 - max(dot(n,eye),0.0), 3.0);
      vec3 color = base + vec3(0.52,0.55,0.61)*top + vec3(1.0,0.97,0.92)*strip*1.2;
      color += vec3(0.4,0.43,0.48)*bottom + vec3(0.95,0.20,0.12)*coral;
      color += vec3(0.17,0.19,0.23)*edge;
      color *= 0.88 + 0.12*max(dot(n,normalize(vec3(-1.0,1.0,3.0))),0.0);
      color = pow(color,vec3(0.8));
      gl_FragColor = vec4(color, 1.0);
    }`;
  function shader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }
  const vs = shader(gl.VERTEX_SHADER, vertex);
  const fs = shader(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const rotation = gl.getUniformLocation(program, 'rotation');
  const aspect = gl.getUniformLocation(program, 'aspect');
  let count = 0;
  let frame = 0;
  let visible = true;
  let paused = reduced.matches;
  let time = 0;
  let previous = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  const angleX = document.getElementById('angle-x');
  const angleY = document.getElementById('angle-y');
  function matrix(rx, ry, rz) {
    const a = Math.cos(rx), b = Math.sin(rx), c = Math.cos(ry), d = Math.sin(ry), e = Math.cos(rz), f = Math.sin(rz);
    return new Float32Array([c*e,c*f,-d,b*d*e-a*f,b*d*f+a*e,b*c,a*d*e+b*f,a*d*f-b*e,a*c]);
  }
  function draw(stamp = 0) {
    frame = 0;
    if (!count) return;
    const active = !paused && visible && !document.hidden;
    if (active) {
      time += previous ? Math.min((stamp-previous)/1000,.05) : 0;
      x += (targetX-x)*.06;
      y += (targetY-y)*.06;
    }
    previous = stamp;
    const ry = -.42 + x*.38 + Math.sin(time*.48)*.075;
    const rx = .14 + y*.24 + Math.sin(time*.37)*.045;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix3fv(rotation, false, matrix(rx, ry, -.19));
    gl.uniform1f(aspect, canvas.width/canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, count);
    angleX.textContent = String(Math.round(Math.abs(ry)*180/Math.PI)).padStart(3,'0');
    angleY.textContent = String(Math.round(Math.abs(rx)*180/Math.PI)).padStart(3,'0');
    if (active) frame = requestAnimationFrame(draw);
  }
  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    previous = 0;
    frame = requestAnimationFrame(draw);
  }
  function resize() {
    const box = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(devicePixelRatio, 1.75);
    canvas.width = Math.round(box.width * pixelRatio);
    canvas.height = Math.round(box.height * pixelRatio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    schedule();
  }
  scene.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || paused) return;
    const box = scene.getBoundingClientRect();
    targetX = (event.clientX-box.left)/box.width*2-1;
    targetY = (event.clientY-box.top)/box.height*2-1;
  });
  scene.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  document.addEventListener('solucci:motion', event => { paused = event.detail.paused; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0 }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    scene.classList.remove('live');
  });
  fetch('assets/simbolo.bin?v=restauro1').then(response => {
    if (!response.ok) throw new Error('Malha indisponível');
    return response.arrayBuffer();
  }).then(data => {
    const vertices = new Float32Array(data);
    count = vertices.length/6;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    for (const [name, offset] of [['position',0],['normal',12]]) {
      const attribute = gl.getAttribLocation(program,name);
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute,3,gl.FLOAT,false,24,offset);
    }
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,0);
    resize();
    scene.classList.add('live');
  }).catch(() => {
    scene.classList.remove('live');
    scene.dataset.render = 'imagem';
  });
})();
