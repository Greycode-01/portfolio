/* Grey Creatives — shared runtime
   sound engine + generative music, player UI, scroll runner, nav behaviour,
   hotkeys, text scramble, Konami easter egg. No dependencies. */
(function(){
"use strict";
var GC = window.GC = window.GC || {};
var doc = document, root = doc.documentElement;
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouch = window.matchMedia('(pointer:coarse)').matches;
var store = {
  get:function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};
function $(id){ return doc.getElementById(id); }
function el(tag, cls, html){ var n = doc.createElement(tag); if(cls) n.className = cls; if(html != null) n.innerHTML = html; return n; }

/* sound removed on purpose: these no-ops keep older call sites harmless */
function ensure(){ return false; }
function sfx(){}
GC.sfx = sfx; GC.enter = function(){}; GC.setMusic = function(){}; GC.setSfx = function(){}; GC.prefs = { sfx:false, music:false };

/* =========================================================
   2. TOAST
   ========================================================= */
var toastEl, toastT;
GC.toast = function(msg, ms){
  if(!toastEl){ toastEl = el('div', 'gc-toast'); toastEl.setAttribute('role', 'status'); doc.body.appendChild(toastEl); }
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('show'); }, ms || 1800);
};

/* =========================================================
   3. PIXEL RUNNER (scroll-linked)
   ========================================================= */
var PAL = { k:'#101114', h:'#E8AA14', d:'#A87A08', v:'#39FF8A', s:'#F3F2EC' };
var BODY = [
  '....kkkkkk....', '...khhhhhhk...', '..khhhhhhhhk..', '..khvvvvvvhk..', '..khvvvvvvhk..', '..khhhhhhhhk..',
  '...kkhhhhkk...', '..khhhhhhhhk..', '.khhhhhhhhhhk.', '.khhdhhhhdhhk.', '.khhdhhhhdhhk.', '..kkhhhhhhkk..'
];
var LEGS = {
  idle: ['...khhkkhhk...', '...khk..khk...', '...ksk..ksk...', '...kkk..kkk...'],
  r1:   ['...khhkkhhk...', '..khk....khhk.', '.khk......ksk.', '.ksk......kkk.'],
  r2:   ['...khhkkhhk...', '....khhhhk....', '....ksk.khk...', '....kkk.kkk...'],
  r3:   ['...khhkkhhk...', '.khhk....khk..', '.ksk......khk.', '.kkk......ksk.']
};
function frameSVG(legs, cls){
  var rows = BODY.concat(legs), by = {};
  for(var y = 0; y < rows.length; y++){
    for(var x = 0; x < 14; x++){
      var c = rows[y].charAt(x);
      if(c !== '.'){ (by[c] = by[c] || []).push('M' + x + ' ' + y + 'h1v1h-1z'); }
    }
  }
  var out = '<g class="' + cls + '">';
  for(var k in by){ out += '<path fill="' + PAL[k] + '" d="' + by[k].join('') + '"/>'; }
  return out + '</g>';
}
GC.spriteSVG = function(){
  return '<svg class="gcr-svg" viewBox="0 0 14 16" width="42" height="48" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
    '<g class="gcr-idle">' + frameSVG(LEGS.idle, 'gcr-f') + '</g>' +
    '<g class="gcr-run">' + frameSVG(LEGS.r1, 'gcr-f f1') + frameSVG(LEGS.r2, 'gcr-f f2') + frameSVG(LEGS.r3, 'gcr-f f3') + frameSVG(LEGS.r2, 'gcr-f f4') + '</g>' +
    '</svg>';
};

var QUIPS = ['ship it.', '2px off. fixing.', 'sudo hire grey', 'hire us :)', 'git push --force-with-love', 'no bugs. only features.', 'press M for music', 'try the konami code'];
function initRunner(){
  var r = el('div', 'gc-runner');
  r.innerHTML = '<div class="gcr-track" aria-hidden="true"></div><div class="gcr-actor" id="gcrActor" role="img" aria-label="Pixel runner that follows your scroll"><span class="gcr-label" id="gcrLabel">0%</span><span class="gcr-bubble" id="gcrBubble"></span><div class="gcr-body">' + GC.spriteSVG() + '</div></div>';
  doc.body.appendChild(r);
  var actor = $('gcrActor'), label = $('gcrLabel'), bubble = $('gcrBubble');
  var lastY = window.scrollY, dir = 1, runT = 0, ticking = false, lastPct = -1, running = false, bubT, qi = 0;
  function frame(){
    ticking = false;
    var h = root.scrollHeight - root.clientHeight;
    var y = window.scrollY, p = h > 0 ? y / h : 0;
    var x = p * (root.clientWidth - 64);
    actor.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    var pct = Math.round(p * 100);
    if(pct !== lastPct){ lastPct = pct; label.textContent = pct + '%'; }
    var dy = y - lastY;
    if(Math.abs(dy) > 0){
      if(dy !== 0){ dir = dy > 0 ? 1 : -1; actor.classList.toggle('flip', dir < 0); }
      if(!running){ running = true; actor.classList.add('is-running'); }
      clearTimeout(runT);
      runT = setTimeout(function(){ running = false; actor.classList.remove('is-running'); }, 160);
      if(Math.abs(dy) > 2){ sfx('step'); }
    }
    lastY = y;
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }, { passive:true });
  window.addEventListener('resize', function(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }, { passive:true });
  frame();
  actor.addEventListener('click', function(){
    ensure(); sfx('jump');
    actor.classList.remove('jump'); void actor.offsetWidth; actor.classList.add('jump');
    bubble.textContent = QUIPS[qi++ % QUIPS.length]; bubble.classList.add('show');
    clearTimeout(bubT); bubT = setTimeout(function(){ bubble.classList.remove('show'); }, 1900);
  });
  actor.addEventListener('animationend', function(e){ if(e.animationName === 'gcJump'){ actor.classList.remove('jump'); } });
}

/* =========================================================
   4. SIDE RAIL (desktop) — built from the header links, so every page shares it
   ========================================================= */
var IC = {
  home:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11.2L12 4l8.5 7.2"/><path d="M5.8 9.8V20h4.4v-5.4h3.6V20h4.4V9.8"/></svg>',
  work:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="4" width="7.5" height="7.5" rx="2"/><rect x="3" y="14.5" width="7.5" height="5.5" rx="2"/><rect x="13.5" y="14.5" width="7.5" height="5.5" rx="2"/></svg>',
  services:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>',
  branding:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20l-1.5-4.5L4 13l16-9-5 16-3-6"/></svg>',
  logos:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z"/></svg>',
  about:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-4 4-6 7.5-6s6.6 2 7.5 6"/></svg>',
  reviews:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8L12 3.5z"/></svg>',
  cta:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H9M17 7v8"/></svg>',
  moon:'<svg class="i-moon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun:'<svg class="i-sun" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.6"/><path d="M12 1.8v2.4M12 19.8v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7"/></svg>'
};
var TIPS = {
  home:['home','Back to the top'],
  work:['work','Selected builds'], services:['services','What we do'], branding:['branding','Identity archive'], logos:['logos','Every logo I designed'],
  about:['about','The studio'], reviews:['reviews','Client words']
};
function initTopNav(){
  var header = $('siteHeader'), nav = $('navLinks'); if(!header || !nav || header.getAttribute('data-gcnav')) return;
  header.setAttribute('data-gcnav', '1');
  var links = [];
  nav.querySelectorAll('a').forEach(function(a){
    var cta = a.classList.contains('nav-cta'), label = a.textContent.replace(/\s+/g, ' ').trim(), key = label.toLowerCase(), meta = TIPS[key] || ['work', ''];
    a.setAttribute('data-tip', cta ? 'Start a project · say hello' : label + (meta[1] ? ' · ' + meta[1] : ''));
    a.innerHTML = (cta ? IC.cta : IC[meta[0]]) + '<span class="nl">' + label + '</span>';
    if(!cta){ links.push(a); }
  });
  var tt = $('themeToggle');
  if(tt){
    var setTip = function(){ tt.setAttribute('data-tip', 'Theme: ' + (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light') + ' · T'); };
    setTip(); new MutationObserver(setTip).observe(root, { attributes:true, attributeFilter:['data-theme'] });
  }
  var hr = header.querySelector('.header-right');
  if(hr){
    var v = el('span', 'hd-visits'); v.hidden = true; v.setAttribute('data-tip', 'People who have visited this site');
    v.innerHTML = '<i class="hd-dot"></i><span class="vl">Visitors :</span> <b id="gcVisits">0</b>';
    hr.insertBefore(v, $('navToggle') || null);
  }
  // highlight the section you are in (same-page links only)
  if('IntersectionObserver' in window){
    var map = {};
    links.forEach(function(a){ var h = a.getAttribute('href') || ''; var i = h.indexOf('#'); if(i > -1 && (i === 0 || /index/.test(h.slice(0, i)))){ var id = h.slice(i + 1); if($(id)){ map[id] = a; } } });
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; links.forEach(function(a){ a.classList.remove('is-cur'); }); if(map[e.target.id]){ map[e.target.id].classList.add('is-cur'); } }); }, { rootMargin:'-45% 0px -50% 0px' });
    doc.querySelectorAll('section[id]').forEach(function(sec){ io.observe(sec); });
  }
  header.addEventListener('pointerover', function(e){
    if(e.pointerType && e.pointerType !== 'mouse') return;
    var t = e.target.closest('[data-tip]'); if(!t || t === header._last) return; header._last = t; sfx('nav', links.indexOf(t) > -1 ? links.indexOf(t) : 6);
  }, { passive:true });
  header.addEventListener('pointerleave', function(){ header._last = null; }, { passive:true });
  initVisits();
  initMobileMenu(header, nav);
}

/* mobile menu: close button, tap-outside, Escape, scroll lock */
function initMobileMenu(header, nav){
  var toggle = $('navToggle'); if(!toggle) return;
  var close = el('button', 'nav-close'); close.type = 'button'; close.setAttribute('aria-label', 'Close menu');
  close.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>Close';
  nav.insertBefore(close, nav.firstChild);
  var scrim = el('div', 'nav-scrim'); scrim.setAttribute('aria-hidden', 'true'); header.insertBefore(scrim, header.firstChild);
  toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'navLinks');
  function sync(){
    var open = nav.classList.contains('open');
    doc.body.classList.toggle('nav-open', open); toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if(open){ try{ close.focus({ preventScroll:true }); }catch(e){} }
  }
  function shut(){ if(nav.classList.contains('open')){ nav.classList.remove('open'); sync(); try{ toggle.focus({ preventScroll:true }); }catch(e){} } }
  new MutationObserver(sync).observe(nav, { attributes:true, attributeFilter:['class'] });
  close.addEventListener('click', function(){ sfx('click'); shut(); });
  scrim.addEventListener('click', shut);
  doc.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ shut(); } });
  window.addEventListener('resize', function(){ if(window.innerWidth > 860 && nav.classList.contains('open')){ nav.classList.remove('open'); sync(); } });
}

/* =========================================================
   4a. VISITOR COUNTER — one tiny document in the site's own Firebase project (stats/visitors).
   Counts a browser once; never counts local previews. Hides itself if it can't read a real number.
   ========================================================= */
function initVisits(){
  var pill = doc.querySelector('.hd-visits'), out = $('gcVisits'); if(!pill || !out) return;
  var PID = 'grey-creatives', KEY = 'AIzaSyCzqjxinQF63hLuGplgVQ2NGFu1opvpD3I';
  var base = 'https://firestore.googleapis.com/v1/projects/' + PID + '/databases/(default)/documents';
  var host = location.hostname, preview = !host || /^(localhost|127\.|0\.0\.0\.0)/.test(host) || /claude|anthropic|usercontent|vscode|github\.dev/.test(host) || location.protocol === 'file:';
  var counted = false; try{ counted = localStorage.getItem('gc-counted') === '1'; }catch(e){}
  function show(n){
    if(!isFinite(n) || n < 0) return; pill.hidden = false;
    if(reduce || n < 20){ out.textContent = n.toLocaleString('en-US'); return; }
    var t0 = performance.now(); (function tick(t){ var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3); out.textContent = Math.round(n * e).toLocaleString('en-US'); if(k < 1){ requestAnimationFrame(tick); } })(t0);
  }
  function read(){
    fetch(base + '/stats/visitors?key=' + KEY).then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function(d){ show(parseInt(d.fields.count.integerValue, 10)); }).catch(function(){});
  }
  function hit(){
    fetch(base + ':commit?key=' + KEY, { method:'POST', headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ writes:[{ transform:{ document:'projects/' + PID + '/databases/(default)/documents/stats/visitors', fieldTransforms:[{ fieldPath:'count', increment:{ integerValue:'1' } }] } }] }) })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function(d){ try{ localStorage.setItem('gc-counted', '1'); }catch(e){} show(parseInt(d.writeResults[0].transformResults[0].integerValue, 10)); })
      .catch(read);
  }
  var go = function(){ if(counted || preview){ read(); } else { hit(); } };
  if('requestIdleCallback' in window){ requestIdleCallback(go, { timeout:3000 }); } else { setTimeout(go, 1500); }
}

/* =========================================================
   4b. GLISTENING BACKGROUND — one fixed canvas of twinkling dust and star glints
   ========================================================= */
function initGlitter(){
  if(doc.querySelector('.gc-glitter')) return;
  var cv = el('canvas', 'gc-glitter'); cv.setAttribute('aria-hidden', 'true'); doc.body.insertBefore(cv, doc.body.firstChild);
  var c = cv.getContext('2d'), W = 0, H = 0, dots = [], stars = [], raf = 0, last = 0, dark = root.getAttribute('data-theme') === 'dark';
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function seed(){
    W = cv.width = window.innerWidth; H = cv.height = window.innerHeight;
    var nd = W < 700 ? 46 : 120, ns = W < 700 ? 7 : 16; dots = []; stars = [];
    for(var i = 0; i < nd; i++){ dots.push({ x:rnd(0, W), y:rnd(0, H), r:rnd(0.6, 1.5), ph:rnd(0, 6.28), sp:rnd(0.5, 1.9), d:rnd(0.02, 0.16), h:Math.random() < 0.2 ? 1 : (Math.random() < 0.1 ? 2 : 0) }); }
    for(var k = 0; k < ns; k++){ stars.push({ x:rnd(0, W), y:rnd(0, H), s:rnd(6, 13), t0:rnd(0, 9), per:rnd(5, 11), d:rnd(0.03, 0.12) }); }
  }
  var COL = { dark:['255,246,222', '242,194,48', '90,255,160'], light:['160,128,70', '214,150,10', '20,140,90'] };
  function draw(now){
    raf = requestAnimationFrame(draw);
    if(now - last < 33) return; last = now;
    c.clearRect(0, 0, W, H);
    var sy = window.scrollY, pal = dark ? COL.dark : COL.light, gain = dark ? 0.85 : 0.6, tsec = now / 1000, i;
    for(i = 0; i < dots.length; i++){
      var d = dots[i], y = (((d.y - sy * d.d) % H) + H) % H;
      var a = 0.5 + 0.5 * Math.sin(tsec * d.sp + d.ph); a = a * a * a;
      c.fillStyle = 'rgba(' + pal[d.h] + ',' + (a * gain).toFixed(3) + ')';
      c.fillRect(d.x, y, d.r * 2, d.r * 2);
    }
    for(i = 0; i < stars.length; i++){
      var st = stars[i], ph = (((tsec - st.t0) % st.per) + st.per) % st.per / st.per;
      if(ph > 0.2) continue;
      var k = Math.sin(Math.PI * ph / 0.2), r = st.s * k, y2 = (((st.y - sy * st.d) % H) + H) % H, x = st.x, q = r * 0.16;
      c.fillStyle = 'rgba(' + pal[i % 3 === 0 ? 1 : 0] + ',' + (k * (dark ? 0.9 : 0.7)).toFixed(3) + ')';
      c.beginPath();
      c.moveTo(x, y2 - r); c.lineTo(x + q, y2 - q); c.lineTo(x + r, y2); c.lineTo(x + q, y2 + q);
      c.lineTo(x, y2 + r); c.lineTo(x - q, y2 + q); c.lineTo(x - r, y2); c.lineTo(x - q, y2 - q); c.closePath(); c.fill();
    }
  }
  function start(){ if(!raf && !doc.hidden && !reduce){ raf = requestAnimationFrame(draw); } }
  function stop(){ if(raf){ cancelAnimationFrame(raf); raf = 0; } }
  seed();
  if(reduce){   // one static frame
    var now0 = 3000; c.clearRect(0, 0, W, H); draw(now0); cancelAnimationFrame(raf); raf = 0;
  } else { start(); }
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(seed, 200); }, { passive:true });
  doc.addEventListener('visibilitychange', function(){ if(doc.hidden){ stop(); } else { start(); } });
  new MutationObserver(function(){ dark = root.getAttribute('data-theme') === 'dark'; }).observe(root, { attributes:true, attributeFilter:['data-theme'] });
}

/* =========================================================
   5. TEXT SCRAMBLE for .file-tag labels
   ========================================================= */
var GLY = '!<>-_\\/[]{}=+*^?#01';
function scramble(elm){
  var n = elm.firstChild; if(!n || n.nodeType !== 3) return;
  var txt = n.nodeValue, len = txt.length, t0 = performance.now(), dur = 620;
  (function f(now){
    var p = Math.min(1, (now - t0) / dur), cut = Math.floor(p * len), out = '';
    for(var i = 0; i < len; i++){ out += (i < cut || txt.charAt(i) === ' ' || txt.charAt(i) === '.') ? txt.charAt(i) : GLY.charAt((Math.random() * GLY.length) | 0); }
    n.nodeValue = out;
    if(p < 1){ requestAnimationFrame(f); } else { n.nodeValue = txt; }
  })(t0);
}
function initScramble(){
  if(reduce || !('IntersectionObserver' in window)) return;
  var tags = doc.querySelectorAll('.file-tag');
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); scramble(e.target); } });
  }, { threshold:0.8 });
  tags.forEach(function(t){ io.observe(t); });
}

/* =========================================================
   6. SECTION WHOOSH
   ========================================================= */
function initWhoosh(){
  if(!('IntersectionObserver' in window)) return;
  var secs = doc.querySelectorAll('section[id]'), last = 0, armed = false;
  setTimeout(function(){ armed = true; }, 1800);
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting && armed){ var n = performance.now(); if(n - last > 1200){ last = n; sfx('whoosh'); } }
    });
  }, { rootMargin:'-45% 0px -50% 0px' });
  secs.forEach(function(s){ io.observe(s); });
}

/* =========================================================
   7. HOTKEYS + KONAMI
   ========================================================= */
GC.sections = GC.sections || null;     // index.html sets: [['services','services.jsx'], ...]
function typing(e){ var t = e.target; return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)); }
var KON = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], kpos = 0;
GC.root = function(){
  if(doc.body.classList.contains('gc-root')) return;
  doc.body.classList.add('gc-root'); ensure(); sfx('unlock'); sfx('glitch');
  GC.toast('ROOT ACCESS GRANTED  —  sudo hire grey', 4200);
  var cv = el('canvas', 'gc-matrix'); doc.body.appendChild(cv);
  var c = cv.getContext('2d'), W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
  var fs = 16, cols = Math.ceil(W / fs), drops = []; for(var i = 0; i < cols; i++){ drops[i] = Math.random() * -30; }
  var t0 = performance.now(), last = 0, chars = 'GREYCREATIVES01<>{}/*;$#'.split('');
  (function f(now){
    var el_ = now - t0;
    if(el_ > 4300){ cv.classList.add('out'); setTimeout(function(){ cv.remove(); doc.body.classList.remove('gc-root'); }, 600); return; }
    if(now - last > 45){
      last = now;
      c.fillStyle = 'rgba(8,10,8,0.16)'; c.fillRect(0, 0, W, H);
      c.font = fs + 'px monospace';
      for(var i = 0; i < cols; i++){
        c.fillStyle = Math.random() > 0.96 ? '#F3F2EC' : '#39FF8A';
        c.fillText(chars[(Math.random() * chars.length) | 0], i * fs, drops[i] * fs);
        if(drops[i] * fs > H && Math.random() > 0.975){ drops[i] = 0; }
        drops[i]++;
      }
    }
    requestAnimationFrame(f);
  })(t0);
};
doc.addEventListener('keydown', function(e){
  if(doc.body.classList.contains('pf-lock') && /^[1-9]$/.test(e.key)) return;
  if(typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if(k === KON[kpos]){ kpos++; if(kpos === KON.length){ kpos = 0; GC.root(); } } else { kpos = (k === KON[0]) ? 1 : 0; }
  if(k === 't'){ var tb = $('themeToggle'); if(tb){ tb.click(); GC.toast(root.getAttribute('data-theme') === 'dark' ? 'dark mode' : 'light mode'); } }
  else if(GC.sections && /^[0-9]$/.test(k)){
    var i = parseInt(k, 10);
    if(i === 0){ window.scrollTo({ top:0, behavior: reduce ? 'auto' : 'smooth' }); ensure(); sfx('whoosh'); GC.toast('→ 00 top'); return; }
    var s = GC.sections[i - 1]; if(!s) return;
    var target = $(s[0]); if(!target) return;
    ensure(); sfx('click'); GC.toast('→ 0' + i + '  ' + s[1]);
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block:'start' });
  }
});
GC.showKeys = function(){
  if(isTouch || doc.querySelector('.gc-keys')) return;
  var k = el('div', 'gc-keys');
  k.innerHTML = (GC.sections ? '<span><kbd>1</kbd>–<kbd>' + GC.sections.length + '</kbd> jump</span><span><kbd>Ctrl</kbd><kbd>K</kbd> search</span>' : '') + '<span><kbd>T</kbd> theme</span>';
  doc.body.appendChild(k);
  requestAnimationFrame(function(){ k.classList.add('show'); });
  setTimeout(function(){ k.classList.remove('show'); }, 9000);
};

/* ---------- boot ---------- */
function boot(){
  initTopNav(); initGlitter(); initScramble(); initWhoosh();
  doc.dispatchEvent(new Event('gc:ready'));
}
GC.ready = true;
if(doc.readyState === 'loading'){ doc.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
