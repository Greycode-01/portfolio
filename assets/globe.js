/* Grey Creatives — logo globe: every logo on one slowly turning sphere. Drag to spin, hover to enlarge, click to open. */
(function(){
"use strict";
var stage = document.getElementById('glStage'), dataEl = document.getElementById('gcLogos');
if(!stage || !dataEl) return;
var L; try{ L = JSON.parse(dataEl.textContent); }catch(e){ return; }
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var field = stage.querySelector('.gl-field'), nameEl = document.getElementById('glName'), N = L.length;
function sfx(n, a){ if(window.GC && GC.sfx){ GC.sfx(n, a); } }

/* even points on a sphere (Fibonacci) */
var P = [], GA = Math.PI * (3 - Math.sqrt(5));
for(var i = 0; i < N; i++){ var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = GA * i; P.push({ x:Math.cos(th) * r, y:y, z:Math.sin(th) * r }); }

var els = L.map(function(l, i){
  var b = document.createElement('button'); b.type = 'button'; b.className = 'gl-tile'; b.setAttribute('aria-label', l.n);
  b.style.background = l.bg;
  var im = document.createElement('img'); im.src = 'assets/img/logos/' + l.f + '.webp'; im.alt = l.n + ' logo'; im.loading = 'lazy'; im.decoding = 'async'; im.draggable = false;
  b.appendChild(im); field.appendChild(b); return { el:b, h:0, i:i, z:0 };
});

var W = 0, H = 0, R = 0, T = 64;
function size(){ var r = stage.getBoundingClientRect(); W = r.width; H = r.height; R = Math.min(W, H) / 2 * 0.80; T = Math.max(50, Math.min(96, R * 0.30)); els.forEach(function(o){ o.el.style.width = o.el.style.height = T + 'px'; o.el.style.marginLeft = o.el.style.marginTop = (-T / 2) + 'px'; }); }
size(); window.addEventListener('resize', size, { passive:true });

var yaw = 0.6, pitch = -0.28, vy = 0.0035, vp = 0, speed = 0.0035, hot = -1, drag = false, moved = 0, lx = 0, ly = 0, raf = 0, visible = false, lastT = 0;
function frame(now){
  raf = 0; if(!visible || document.hidden) return;
  var dt = Math.min(48, now - lastT) / 16.67; lastT = now;
  if(!drag){
    var target = (hot >= 0 || reduce) ? 0 : speed;
    vy += (target - vy) * 0.06 * dt; vp *= Math.pow(0.92, dt);
    yaw += vy * dt; pitch += vp * dt;
  }
  pitch = Math.max(-0.9, Math.min(0.9, pitch));
  var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  for(var i = 0; i < N; i++){
    var p = P[i], o = els[i];
    var x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
    var y2 = p.y * cp - z1 * sp, z2 = p.y * sp + z1 * cp;
    o.z = z2;
    var depth = (z2 + 1) / 2;
    o.h += ((hot === i ? 1 : 0) - o.h) * 0.2 * dt;
    var s = (0.58 + 0.42 * depth) * (1 + 0.62 * o.h);
    o.el.style.transform = 'translate(' + (W / 2 + x1 * R).toFixed(1) + 'px,' + (H / 2 + y2 * R).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
    o.el.style.opacity = (hot === i ? 1 : (0.30 + 0.70 * depth)).toFixed(2);
    o.el.style.zIndex = (hot === i ? 400 : Math.round(depth * 100));
    o.el.style.pointerEvents = z2 > -0.25 ? 'auto' : 'none';
  }
  raf = requestAnimationFrame(frame);
}
function kick(){ if(!raf && visible && !document.hidden){ lastT = performance.now(); raf = requestAnimationFrame(frame); } }
if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if(visible){ kick(); } }, { rootMargin:'120px' }).observe(stage); } else { visible = true; kick(); }
document.addEventListener('visibilitychange', kick);

function setHot(i){
  if(i === hot) return; hot = i;
  nameEl.textContent = i >= 0 ? L[i].n : 'Hover a logo to look closer';
  nameEl.classList.toggle('on', i >= 0);
  if(i >= 0){ sfx('nav', i % 15); }
  if(reduce){ kick(); }
}
field.addEventListener('pointerover', function(e){ if(drag) return; var t = e.target.closest('.gl-tile'); if(t){ setHot(els.map(function(o){ return o.el; }).indexOf(t)); } });
field.addEventListener('pointerout', function(e){ if(!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.gl-tile')){ setHot(-1); } });
field.addEventListener('focusin', function(e){ var t = e.target.closest('.gl-tile'); if(t){ setHot(els.map(function(o){ return o.el; }).indexOf(t)); } });
field.addEventListener('focusout', function(){ setHot(-1); });

/* drag to spin */
stage.addEventListener('pointerdown', function(e){ if(e.button > 0) return; drag = true; moved = 0; lx = e.clientX; ly = e.clientY; vy = 0; vp = 0; });
stage.addEventListener('pointermove', function(e){
  if(!drag) return; var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
  if(moved > 6 && !stage.classList.contains('grab')){ stage.classList.add('grab'); try{ stage.setPointerCapture(e.pointerId); }catch(_){} }
  yaw += dx * 0.008; pitch += dy * 0.006; vy = dx * 0.008; vp = dy * 0.006; kick(); if(reduce && !raf){ raf = requestAnimationFrame(frame); }
});
function up(){ if(!drag) return; drag = false; stage.classList.remove('grab'); if(Math.abs(vy) < 0.002){ vy = speed; } }
stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);

/* lightbox */
var box = document.createElement('div'); box.className = 'gl-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
box.innerHTML = '<button type="button" class="gl-x" aria-label="Close">&times;</button><figure><img alt=""><figcaption></figcaption></figure>';
document.body.appendChild(box);
var bImg = box.querySelector('img'), bCap = box.querySelector('figcaption'), lastFocus = null;
function openBox(i){ lastFocus = document.activeElement; bImg.src = 'assets/img/logos/' + L[i].f + '-lg.webp'; bImg.alt = L[i].n + ' logo'; bCap.textContent = L[i].n; box.classList.add('open'); document.body.classList.add('pf-lock'); sfx('whoosh'); box.querySelector('.gl-x').focus({ preventScroll:true }); }
function closeBox(){ if(!box.classList.contains('open')) return; box.classList.remove('open'); if(!document.querySelector('.pf-detail.open')){ document.body.classList.remove('pf-lock'); } if(lastFocus && lastFocus.focus){ lastFocus.focus({ preventScroll:true }); } }
field.addEventListener('click', function(e){ var t = e.target.closest('.gl-tile'); if(!t || moved > 6) return; openBox(els.map(function(o){ return o.el; }).indexOf(t)); });
box.addEventListener('click', function(e){ if(e.target === box || e.target.closest('.gl-x')){ closeBox(); } });
document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeBox(); } });
if(reduce){ visible = true; kick(); setTimeout(function(){ visible = false; }, 200); }
})();
