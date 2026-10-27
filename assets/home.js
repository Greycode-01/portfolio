/* Grey Creatives — homepage-only behaviour: instrument grid + section hotkeys */
(function(){
"use strict";
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.GC = window.GC || {};
GC.sections = [['services','services.jsx'],['work','work.tsx'],['stack','stack.json'],['brand','brand.css'],['video','reel.mp4'],['about','about.md'],['contact','contact.json']];

/* ---------- hero: a grid of squares you can play ---------- */
var hero = document.getElementById('heroSection');
var field = hero && hero.querySelector('.hero-field');
if(!field || reduce){ return; }
var cv = document.createElement('canvas'); cv.className = 'hero-cells'; cv.setAttribute('aria-hidden', 'true');
field.appendChild(cv);
var c = cv.getContext('2d');
var CELL = 56, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
var W = 0, H = 0, cols = 0, rows = 0, heat = null, hue = null, ripples = [], raf = 0, visible = true, lastT = 0;

function size(){
  W = hero.clientWidth; H = hero.clientHeight;
  cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  heat = new Float32Array(cols * rows); hue = new Uint8Array(cols * rows);
}
size();
var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(size, 150); }, { passive:true });

function kick(){ if(!raf && visible){ lastT = performance.now(); raf = requestAnimationFrame(draw); } }
function poke(col, row, v, green){
  if(col < 0 || row < 0 || col >= cols || row >= rows) return;
  var i = row * cols + col;
  if(heat[i] < v){ heat[i] = v; hue[i] = green ? 1 : 0; }
}
function draw(now){
  raf = 0;
  var dt = Math.min(64, now - lastT); lastT = now;
  c.clearRect(0, 0, W, H);
  var alive = ripples.length > 0;
  for(var r = ripples.length - 1; r >= 0; r--){
    var rp = ripples[r], age = (now - rp.t0) / 1000, rad = age * 620;
    if(age > 1.3){ ripples.splice(r, 1); continue; }
    var cx0 = Math.max(0, Math.floor((rp.x - rad - CELL) / CELL)), cx1 = Math.min(cols - 1, Math.ceil((rp.x + rad + CELL) / CELL));
    var cy0 = Math.max(0, Math.floor((rp.y - rad - CELL) / CELL)), cy1 = Math.min(rows - 1, Math.ceil((rp.y + rad + CELL) / CELL));
    for(var y = cy0; y <= cy1; y++){ for(var x = cx0; x <= cx1; x++){
      var dx = (x + 0.5) * CELL - rp.x, dy = (y + 0.5) * CELL - rp.y, d = Math.sqrt(dx * dx + dy * dy);
      if(Math.abs(d - rad) < CELL * 0.9){ poke(x, y, 0.9 * (1 - age / 1.3), rp.green); }
    } }
  }
  var k = Math.pow(0.9, dt / 16);
  for(var i = 0, n = cols * rows; i < n; i++){
    var h = heat[i]; if(h < 0.02){ heat[i] = 0; continue; }
    alive = true;
    var x2 = (i % cols) * CELL, y2 = ((i / cols) | 0) * CELL;
    c.fillStyle = hue[i] ? 'rgba(57,255,138,' + (h * 0.38).toFixed(3) + ')' : 'rgba(232,170,20,' + (h * 0.5).toFixed(3) + ')';
    c.fillRect(x2 + 1, y2 + 1, CELL - 1, CELL - 1);
    heat[i] = h * k;
  }
  if(alive){ raf = requestAnimationFrame(draw); }
}

var rect = null;
function local(e){ rect = hero.getBoundingClientRect(); return { x:e.clientX - rect.left, y:e.clientY - rect.top }; }
function isUi(t){ return t.closest && t.closest('a, button, input, textarea, label, .code-window, .hero-status, .hero-eyebrow, h1, .lede, .hero-service-chip, .hero-hint'); }
var lastCell = -1;
hero.addEventListener('pointermove', function(e){
  if(e.pointerType !== 'mouse') return;
  var p = local(e), col = Math.floor(p.x / CELL), row = Math.floor(p.y / CELL), id = row * 1000 + col;
  if(id === lastCell) return; lastCell = id;
  poke(col, row, 1, Math.random() < 0.2); kick();
}, { passive:true });
hero.addEventListener('pointerdown', function(e){
  if(isUi(e.target)) return;
  var p = local(e), col = Math.floor(p.x / CELL);
  ripples.push({ x:p.x, y:p.y, t0:performance.now(), green:Math.random() < 0.4 });
  if(window.GC){ GC.sfx('note', Math.floor(col / Math.max(1, cols) * 15)); }
  kick();
}, { passive:true });
if('IntersectionObserver' in window){
  new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if(!visible && raf){ cancelAnimationFrame(raf); raf = 0; } else if(visible){ kick(); } }).observe(hero);
}
})();
