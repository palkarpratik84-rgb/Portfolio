/* ═══════════════════════════════════════════════════════
   PRATIK PALKAR — PORTFOLIO JAVASCRIPT
   File: script.js
   Requires:  Three.js CDN (loaded in index.html)

TABLE OF CONTENTS
  1.  Three.js Background (stars, shapes, particles, rings)
  2.  Custom Cursor
  3.  Domain Intro Cleanup
  4.  Utilities  (smooth scroll)
  5.  Character 3D Tilt
  6.  About Card Glow
  7.  Project Flip Card Tabs
  8.  Typewriter Effect       ←  edit lines[] to change taglines
  9.  Counter Animation
  10. Scroll Reveal + Skill Bars
═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   THREE.JS — IMMERSIVE 3D BACKGROUND
═══════════════════════════════════════════ */
const bgCanvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({canvas:bgCanvas, antialias:true, alpha:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, .1, 200);
camera.position.set(0, 0, 6);

/* Stars */
const starGeo = new THREE.BufferGeometry();
const SC = 4000, sp = new Float32Array(SC * 3);
for(let i = 0; i < SC * 3; i++) sp[i] = (Math.random() - .5) * 100;
starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color:0x88bbcc, size:.055, transparent:true, opacity:.65})));

/* Floating wireframe shapes */
const shapeDefs = [
  {G:()=>new THREE.IcosahedronGeometry(.55,0), x:-3.2, y:2.2,  z:-2.5, spd:.009, c:0x00d4ff},
  {G:()=>new THREE.OctahedronGeometry(.45,0),  x:3.8,  y:-1.2, z:-3,   spd:.013, c:0xa855f7},
  {G:()=>new THREE.TetrahedronGeometry(.4,0),  x:-2.5, y:-2.8, z:-1.8, spd:.010, c:0x00ffcc},
  {G:()=>new THREE.IcosahedronGeometry(.35,0), x:2.5,  y:2.8,  z:-3,   spd:.016, c:0xcc55ff},
  {G:()=>new THREE.OctahedronGeometry(.28,0),  x:-4,   y:.8,   z:-2.5, spd:.012, c:0x00aaff},
  {G:()=>new THREE.TetrahedronGeometry(.5,0),  x:3.2,  y:1.8,  z:-4,   spd:.008, c:0xff55aa},
  {G:()=>new THREE.IcosahedronGeometry(.22,0), x:-1.5, y:3.5,  z:-2,   spd:.014, c:0x00d4ff},
];
const shapes = shapeDefs.map(d => {
  const m = new THREE.Mesh(d.G(), new THREE.MeshBasicMaterial({color:d.c, wireframe:true, opacity:.28, transparent:true}));
  m.position.set(d.x, d.y, d.z);
  m.userData = {spd:d.spd, oy:d.y};
  scene.add(m); return m;
});

/* Particle cloud */
const PC = 1200, pGeo = new THREE.BufferGeometry();
const pp = new Float32Array(PC*3), pv = new Float32Array(PC*3);
for(let i = 0; i < PC; i++){
  pp[i*3]   = (Math.random()-.5)*22;
  pp[i*3+1] = (Math.random()-.5)*22;
  pp[i*3+2] = (Math.random()-.5)*12;
  pv[i*3]   = (Math.random()-.5)*.0022;
  pv[i*3+1] = (Math.random()-.5)*.0022;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({color:0xa855f7, size:.04, transparent:true, opacity:.5, blending:THREE.AdditiveBlending}));
scene.add(particles);

/* Grid floor */
const gridMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(34, 34, 22, 22),
  new THREE.MeshBasicMaterial({color:0x00d4ff, wireframe:true, opacity:.045, transparent:true})
);
gridMesh.rotation.x = -Math.PI/2;
gridMesh.position.y = -4;
scene.add(gridMesh);

/* Energy rings */
function mkRing(r, c, op, rx){
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(r, .016, 4, 80),
    new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:op})
  );
  m.rotation.x = rx; scene.add(m); return m;
}
const ring1 = mkRing(2.8, 0x00d4ff, .13, Math.PI/2);
const ring2 = mkRing(2.0, 0xa855f7, .10, Math.PI/3);
const ring3 = mkRing(1.4, 0x00ffcc, .08, Math.PI/4);

/* Mouse parallax */
let mx = 0, my = 0;
document.addEventListener('mousemove', e => {
  mx = (e.clientX / innerWidth  - .5) * 2;
  my = -(e.clientY / innerHeight - .5) * 2;
});

const clock = new THREE.Clock();
(function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  shapes.forEach((s, i) => {
    s.rotation.x += s.userData.spd;
    s.rotation.y += s.userData.spd * 1.4;
    s.position.y  = s.userData.oy + Math.sin(t*.6 + i) * .4;
  });

  const pos = particles.geometry.attributes.position.array;
  for(let i = 0; i < PC; i++){
    pos[i*3]   += pv[i*3];
    pos[i*3+1] += pv[i*3+1];
    if(Math.abs(pos[i*3])   > 11) pv[i*3]   *= -1;
    if(Math.abs(pos[i*3+1]) > 11) pv[i*3+1] *= -1;
  }
  particles.geometry.attributes.position.needsUpdate = true;

  ring1.rotation.z += .004;  ring2.rotation.z -= .005;  ring3.rotation.z += .007;
  ring2.rotation.y += .002;  ring3.rotation.x += .003;
  gridMesh.position.z = (t * .25) % 1.5;

  camera.position.x += (mx * .9 - camera.position.x) * .022;
  camera.position.y += (my * .6 - camera.position.y) * .022;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ═══════════════════════════════════════════
   CUSTOM CURSOR (desktop only)
═══════════════════════════════════════════ */
const cur = document.getElementById('cursor');
const dot = document.getElementById('cursor-dot');
if(cur){
  let cx=0, cy=0, dx=0, dy=0;
  document.addEventListener('mousemove', e => { dx=e.clientX; dy=e.clientY; });
  (function moveCursor(){
    cx += (dx-cx)*.14; cy += (dy-cy)*.14;
    cur.style.left = cx+'px'; cur.style.top = cy+'px';
    dot.style.left = dx+'px'; dot.style.top = dy+'px';
    requestAnimationFrame(moveCursor);
  })();
  document.querySelectorAll('a,button,.about-card,.skill-card,.proj-flip,.contact-card,.back-tab,.nav-links a').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('expand'));
    el.addEventListener('mouseleave', () => cur.classList.remove('expand'));
  });
}

/* ═══════════════════════════════════════════
   DOMAIN INTRO CLEANUP
═══════════════════════════════════════════ */
setTimeout(() => {
  const o = document.getElementById('domainOverlay');
  if(!o) return;
  o.style.transition = 'opacity .6s';
  o.style.opacity = '0';
  o.style.pointerEvents = 'none';
  setTimeout(() => o.remove(), 700);
}, 4400);

/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */
function sTo(id){ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); }

function tiltChar(e, el){
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width  - .5) * 26;
  const y = ((e.clientY - r.top)  / r.height - .5) * -26;
  const img = document.getElementById('charImg');
  if(img) img.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg)`;
}
function resetChar(){
  const img = document.getElementById('charImg');
  if(img) img.style.transform = '';
}

function cardGlow(e, el){
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
  el.style.setProperty('--my', ((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
}

/* ═══════════════════════════════════════════
   PROJECT FLIP CARD TABS
═══════════════════════════════════════════ */
function switchTab(tabEl, panelId){
  /* scope to the back card that contains this tab */
  const backCard = tabEl.closest('.proj-back');
  if(!backCard) return;
  backCard.querySelectorAll('.back-tab').forEach(t => t.classList.remove('active'));
  backCard.querySelectorAll('.back-panel').forEach(p => p.classList.remove('active'));
  tabEl.classList.add('active');
  const panel = document.getElementById(panelId);
  if(panel) panel.classList.add('active');
}

/* click to lock/unlock flip on mobile */
document.querySelectorAll('.proj-flip').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

/* ═══════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════ */
const lines = [
  'Code is my Cursed Technique',
  'Building AI for the Future',
  'From Pimpri to the World',
  'Unlimited Void of Bugs'
];
let li=0, ci=0, adding=true;
const tgt = document.getElementById('typeTarget');
function type(){
  if(!tgt) return;
  if(adding){
    if(ci <= lines[li].length){ tgt.textContent = lines[li].slice(0, ci++); setTimeout(type, 65); }
    else{ adding=false; setTimeout(type, 2200); }
  } else {
    if(ci >= 0){ tgt.textContent = lines[li].slice(0, ci--); setTimeout(type, 36); }
    else{ adding=true; li=(li+1)%lines.length; setTimeout(type, 400); }
  }
}
setTimeout(type, 5000);

/* ═══════════════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════════════ */
function countUp(id, end, dur){
  const el = document.getElementById(id);
  if(!el) return;
  let v=0, step=end/dur*16;
  const t = setInterval(() => {
    v += step;
    if(v >= end){ el.textContent = end; clearInterval(t); }
    else el.textContent = Math.floor(v);
  }, 16);
}
setTimeout(() => { countUp('s1', 2, 900); countUp('s2', 6, 1100); }, 5000);

/* ═══════════════════════════════════════════
   SCROLL REVEAL + SKILL BAR ANIMATION
═══════════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    e.target.classList.add('visible');
    e.target.querySelectorAll('.sk-bar[data-w]').forEach((b, i) => {
      setTimeout(() => {
        b.style.width = (parseFloat(b.dataset.w) * 100) + '%';
        b.classList.add('run');
      }, i * 140);
    });
  });
}, {threshold: .12});

document.querySelectorAll('.reveal').forEach(el => io.observe(el));