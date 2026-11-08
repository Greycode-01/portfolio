/* Grey Creatives — studio layer: intro (counters, portrait parallax) and the open-book project showcase */
(function(){
"use strict";
var doc = document, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
function $(id){ return doc.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
var D = { web:[], brand:[] }, LOGOS = [];
try{ D = JSON.parse($('gcData').textContent); }catch(e){}
try{ LOGOS = JSON.parse($('gcLogos').textContent); }catch(e){}

/* ---------- intro: counters ---------- */
(function(){
  var box = $('introStats'); if(!box) return;
  var vals = { web:D.web.length, brand:D.brand.length, logos:LOGOS.length };
  var nodes = box.querySelectorAll('[data-stat]');
  function paint(k){ for(var i = 0; i < nodes.length; i++){ nodes[i].textContent = Math.round(vals[nodes[i].getAttribute('data-stat')] * k); } }
  paint(1);
  if(reduce || !('IntersectionObserver' in window)) return;
  paint(0);
  var io = new IntersectionObserver(function(es){
    if(!es[0].isIntersecting) return; io.disconnect();
    var t0 = performance.now();
    (function f(t){ var k = Math.min(1, (t - t0) / 1200); paint(1 - Math.pow(1 - k, 3)); if(k < 1){ requestAnimationFrame(f); } })(t0);
  }, { threshold:0.5 });
  io.observe(box);
})();

/* ---------- intro: portrait leans toward the cursor ---------- */
(function(){
  var photo = $('introPhoto'), sec = $('home'); if(!photo || !sec || !fine || reduce) return;
  var raf = 0, tx = 0, ty = 0;
  sec.addEventListener('pointermove', function(e){
    if(e.pointerType !== 'mouse') return;
    var r = photo.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    tx = Math.max(-1, Math.min(1, dx * 2.2)); ty = Math.max(-1, Math.min(1, dy * 2.2));
    if(!raf){ raf = requestAnimationFrame(function(){ raf = 0;
      photo.style.setProperty('--rx', (4 + tx * 2.4).toFixed(2) + 'deg'); photo.style.setProperty('--tx', (tx * 9).toFixed(1) + 'px'); photo.style.setProperty('--ty', (ty * 7).toFixed(1) + 'px');
    }); }
  }, { passive:true });
  sec.addEventListener('pointerleave', function(){ photo.style.setProperty('--rx', '4deg'); photo.style.setProperty('--tx', '0px'); photo.style.setProperty('--ty', '0px'); });
})();

/* =========================================================
   THE BOOK — every website is a spread; turning the page moves to the next one
   ========================================================= */
(function(){
  var root = $('book'), W = D.web; if(!root || !W.length) return;
  var n = W.length, cur = 0, busy = false;
  var mobile = window.matchMedia('(max-width:820px)');
  var ARROW = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var BACK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  var OUT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M17 7H9M17 7v8"/></svg>';
  function p2(x){ return ('0' + x).slice(-2); }

  function leftInner(i){
    var p = W[i];
    return '<div class="bk-meta"><span><b>Project ' + p2(i + 1) + '</b> / ' + p2(n) + '</span>' + (p.domain ? '<span class="bk-dom">' + esc(p.domain) + '</span>' : '') + '</div>' +
      '<h3 class="bk-h">' + esc(p.title) + '</h3><p class="bk-tagline">' + esc(p.tagline) + '</p>' +
      (p.focus ? '<p class="bk-focus">' + esc(p.focus) + '</p>' : '') +
      '<div class="bk-tags">' + (p.tags || []).map(function(t){ return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="bk-actions"><a class="bk-open" href="#p/' + esc(p.slug) + '">Read the story ' + ARROW + '</a>' +
      (p.url ? '<a class="bk-visit" href="' + esc(p.url) + '" target="_blank" rel="noopener">Visit site ' + OUT + '</a>' : '') + '</div>' +
      '<span class="bk-no">' + (i * 2 + 2) + '</span>';
  }
  function rightInner(i){
    var p = W[i];
    return '<div class="bk-shot"><div class="bk-bar"><i></i><i></i><i></i><span>' + esc(p.domain || p.title) + '</span></div>' +
      '<img src="' + esc(p.img) + '" alt="' + esc(p.alt || p.title) + '" decoding="async" draggable="false"></div><p class="bk-cap">Homepage &middot; desktop view</p><span class="bk-no">' + (i * 2 + 3) + '</span>';
  }

  root.innerHTML =
    '<div class="bk-board"><div class="bk-spread" id="bkSpread" tabindex="0" role="group" aria-roledescription="book" aria-label="Selected websites. Use the left and right arrow keys to turn the page.">' +
      '<div class="bk-page bk-left bk-sl"></div><div class="bk-page bk-right bk-sr"></div>' +
      '<i class="bk-spine" aria-hidden="true"></i><i class="bk-ribbon" aria-hidden="true"></i>' +
      '<button type="button" class="bk-corner pv" aria-label="Previous project" tabindex="-1"></button><button type="button" class="bk-corner nx" aria-label="Next project" tabindex="-1"></button>' +
    '</div></div>' +
    '<div class="bk-ctrl"><button type="button" class="bk-arrow" data-d="-1" aria-label="Previous project">' + BACK + '</button>' +
      '<div class="bk-dots" role="group" aria-label="Choose a project">' + W.map(function(p, i){ return '<button type="button" data-i="' + i + '" aria-label="' + esc(p.title) + '">' + p2(i + 1) + '</button>'; }).join('') + '</div>' +
      '<button type="button" class="bk-arrow" data-d="1" aria-label="Next project">' + ARROW + '</button></div>' +
    '<p class="bk-hint">Turn the page: click a corner, use the arrows, or swipe.</p><div class="bk-live" aria-live="polite"></div>';

  var spread = $('bkSpread'), sl = spread.querySelector('.bk-sl'), sr = spread.querySelector('.bk-sr');
  var pv = spread.querySelector('.bk-corner.pv'), nx = spread.querySelector('.bk-corner.nx');
  var arrows = root.querySelectorAll('.bk-arrow'), dots = root.querySelectorAll('.bk-dots button'), live = root.querySelector('.bk-live');

  function chrome(){
    pv.disabled = arrows[0].disabled = cur === 0; nx.disabled = arrows[1].disabled = cur === n - 1;
    dots.forEach(function(d, i){ if(i === cur){ d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); } });
    live.textContent = 'Project ' + (cur + 1) + ' of ' + n + ': ' + W[cur].title;
  }
  function paint(i){ sl.innerHTML = leftInner(i); sr.innerHTML = rightInner(i); }
  function page(cls, inner, face){ var d = doc.createElement('div'); d.className = 'bk-face ' + face + ' bk-page ' + cls; d.innerHTML = inner; return d; }

  function go(to){
    if(busy || to === cur || to < 0 || to > n - 1) return;
    var dir = to > cur ? 1 : -1, from = cur;
    if(reduce){ cur = to; paint(cur); chrome(); return; }
    if(mobile.matches){
      busy = true; cur = to; paint(cur); chrome();
      spread.classList.remove('turn-n', 'turn-p'); void spread.offsetWidth; spread.classList.add(dir > 0 ? 'turn-n' : 'turn-p');
      setTimeout(function(){ busy = false; }, 650); return;
    }
    busy = true;
    var leaf = doc.createElement('div'); leaf.className = 'bk-leaf' + (dir < 0 ? ' prev' : '');
    if(dir > 0){
      sr.innerHTML = rightInner(to);                                             // revealed underneath
      leaf.appendChild(page('bk-right', rightInner(from), 'f'));                 // the old right page lifts…
      leaf.appendChild(page('bk-left', leftInner(to), 'b'));                     // …and lands as the new left page
    } else {
      sl.innerHTML = leftInner(to);
      leaf.appendChild(page('bk-left', leftInner(from), 'f'));
      leaf.appendChild(page('bk-right', rightInner(to), 'b'));
    }
    spread.appendChild(leaf); void leaf.offsetWidth; leaf.classList.add('go');
    var done = false;
    function end(){
      if(done) return; done = true;
      cur = to; paint(cur); leaf.remove(); chrome(); busy = false;
    }
    leaf.addEventListener('transitionend', function(e){ if(e.target === leaf && e.propertyName === 'transform'){ end(); } });
    setTimeout(end, 1150);
  }

  paint(0); chrome();
  nx.addEventListener('click', function(){ go(cur + 1); }); pv.addEventListener('click', function(){ go(cur - 1); });
  arrows.forEach(function(b){ b.addEventListener('click', function(){ go(cur + (+b.getAttribute('data-d'))); }); });
  dots.forEach(function(b){ b.addEventListener('click', function(){ go(+b.getAttribute('data-i')); }); });
  spread.addEventListener('keydown', function(e){
    if(e.key === 'ArrowRight'){ e.preventDefault(); go(cur + 1); } else if(e.key === 'ArrowLeft'){ e.preventDefault(); go(cur - 1); }
  });
  // swipe / drag
  var sx = 0, sy = 0, tracking = false;
  spread.addEventListener('pointerdown', function(e){ if(e.target.closest('a, button')) return; tracking = true; sx = e.clientX; sy = e.clientY; });
  spread.addEventListener('pointerup', function(e){
    if(!tracking) return; tracking = false; var dx = e.clientX - sx, dy = e.clientY - sy;
    if(Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4){ go(cur + (dx < 0 ? 1 : -1)); }
  });
  spread.addEventListener('pointercancel', function(){ tracking = false; });
  // the book opens when it scrolls into view
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){ if(es[0].isIntersecting){ io.disconnect(); root.classList.add('opened'); } }, { threshold:0.3 });
    io.observe(root);
  } else { root.classList.add('opened'); }
})();
})();
