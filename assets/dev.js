/* Grey Creatives — developer layer (homepage): command palette, terminal, profile card, tilt, typed hero line */
(function(){
"use strict";
var doc = document, GC = window.GC = window.GC || {};
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
var MAIL = 'gr3ycreatives@gmail.com', WA = 'https://wa.me/2349167815551';
function $(id){ return doc.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
function sfx(n, a){ if(GC.sfx){ try{ GC.sfx(n, a); }catch(e){} } }
function toast(m, ms){ if(GC.toast){ GC.toast(m, ms); } }

/* ---------- data ---------- */
var D = { web:[], brand:[] };
try{ D = JSON.parse($('gcData').textContent); }catch(e){}
var PROJECTS = D.web.concat(D.brand);
var LOGOS = []; try{ LOGOS = JSON.parse($('gcLogos').textContent); }catch(e){}
var SECTION_LABEL = { home:'Home', services:'Services', work:'Selected work', stack:'Tools & stack', brand:'Brand work', logos:'Logo globe', video:'Video reel', about:'About', contact:'Start a project' };

/* ---------- helpers ---------- */
function copy(text, msg){
  function done(){ toast(msg || 'copied to clipboard'); sfx('note', 9); }
  if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
  function fallback(){
    var t = doc.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    doc.body.appendChild(t); t.select(); try{ doc.execCommand('copy'); done(); }catch(e){ toast(text); } doc.body.removeChild(t);
  }
}
GC.copy = copy;
function closeDetail(){ if(doc.body.classList.contains('pf-lock')){ doc.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape' })); } }
function go(id){
  var t = $(id); if(!t) return false; closeDetail();
  setTimeout(function(){ t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block:'start' }); }, 40); return true;
}
function openProject(slug){ closeDetail(); setTimeout(function(){ location.hash = '#p/' + slug; }, 40); }
function toggleTheme(){ var b = $('themeToggle'); if(b){ b.click(); } return doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
doc.addEventListener('click', function(e){
  var c = e.target.closest && e.target.closest('[data-copy]'); if(c){ e.preventDefault(); copy(c.getAttribute('data-copy'), c.getAttribute('data-msg') || 'copied'); }
});

/* ---------- hero: typed rotating line ---------- */
(function(){
  var el = $('heroType'); if(!el || reduce) return;
  var phrases = ['currently accepting projects', 'designing websites that convert', 'building brand identities', 'editing videos that move', 'shipping code, not excuses'];
  var i = 0, n = 0, dir = 1, timer;
  function tick(){
    if(doc.hidden){ timer = setTimeout(tick, 1200); return; }
    var p = phrases[i];
    if(dir === 1){
      n++; el.textContent = p.slice(0, n);
      if(n >= p.length){ dir = -1; timer = setTimeout(tick, 2200); return; }
      timer = setTimeout(tick, 48 + Math.random() * 40);
    } else {
      n--; el.textContent = p.slice(0, Math.max(0, n));
      if(n <= 0){ dir = 1; i = (i + 1) % phrases.length; timer = setTimeout(tick, 380); return; }
      timer = setTimeout(tick, 22);
    }
  }
  timer = setTimeout(function(){ dir = -1; n = phrases[0].length; tick(); }, 4200);
})();

/* ---------- project cards: tilt + glare ---------- */
if(fine && !reduce){
  var cur = null;
  function reset(){ if(cur){ cur.classList.remove('tilting'); cur.style.removeProperty('--rx'); cur.style.removeProperty('--ry'); cur = null; } }
  doc.addEventListener('pointermove', function(e){
    if(e.pointerType !== 'mouse') return;
    var card = e.target.closest ? e.target.closest('.pf-card') : null;
    if(!card || (card.parentNode && card.parentNode.classList.contains('drag'))){ reset(); return; }
    if(card !== cur){ reset(); cur = card; card.classList.add('tilting'); }
    var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
    card.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  }, { passive:true });
  doc.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
}

/* =========================================================
   COMMAND PALETTE
   ========================================================= */
(function(){
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  var KEY = isMac ? '⌘K' : 'Ctrl K';
  var root = doc.createElement('div'); root.className = 'cp'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Command palette');
  root.innerHTML = '<div class="cp-scrim" data-close></div><div class="cp-box">' +
    '<div class="cp-top"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
    '<input class="cp-input" id="cpInput" type="text" placeholder="Search sections, projects, actions…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cpList" aria-autocomplete="list"><kbd>esc</kbd></div>' +
    '<div class="cp-list" id="cpList" role="listbox"></div>' +
    '<div class="cp-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>esc</kbd> close</span></div></div>';
  doc.body.appendChild(root);
  var input = $('cpInput'), list = $('cpList'), items = [], shown = [], act = 0, last = null;

  function I(path){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>'; }
  var ic = { go:I('<path d="M5 12h14M13 6l6 6-6 6"/>'), proj:I('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/>'), page:I('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>'),
    act:I('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>') };
  function build(){
    items = [];
    (GC.sections || []).forEach(function(s, i){ items.push({ g:'Jump to', icon:ic.go, label:SECTION_LABEL[s[0]] || s[0], sub:s[1], hk:String(i + 1), kw:s[0] + ' ' + s[1], run:function(){ go(s[0]); } }); });
    PROJECTS.forEach(function(p){ items.push({ g:'Projects', icon:ic.proj, label:p.title, sub:p.type === 'web' ? 'website' : 'brand identity', kw:p.slug + ' ' + (p.tags || []).join(' '), run:function(){ openProject(p.slug); } }); });
    items.push({ g:'Pages', icon:ic.page, label:'Branding archive', sub:'/branding-work', kw:'brand logos archive', run:function(){ location.href = '/branding-work'; } });
    items.push({ g:'Pages', icon:ic.page, label:'Client reviews', sub:'/reviews', kw:'testimonials feedback', run:function(){ location.href = '/reviews'; } });
    items.push({ g:'Actions', icon:ic.act, label:'Toggle light / dark theme', hk:'T', kw:'theme dark light mode', run:function(){ toast(toggleTheme() + ' mode'); } });
    items.push({ g:'Actions', icon:ic.act, label:'Copy email address', sub:MAIL, kw:'mail contact copy', run:function(){ copy(MAIL, 'email copied'); } });
    items.push({ g:'Actions', icon:ic.act, label:'Chat on WhatsApp', kw:'message whatsapp contact', run:function(){ window.open(WA, '_blank', 'noopener'); } });
    items.push({ g:'Actions', icon:ic.act, label:'Start a project', kw:'hire quote enquiry form', run:function(){ go('contact'); } });
    items.push({ g:'Actions', icon:ic.act, label:'sudo hire me', sub:'easter egg', kw:'matrix root hire', run:function(){ if(GC.root) GC.root(); } });
    items.push({ g:'Actions', icon:ic.act, label:'Show keyboard shortcuts', kw:'keys hotkeys help', run:function(){ if(GC.showKeys) GC.showKeys(); } });
  }
  function score(q, it){
    if(!q) return 1; var s = (it.label + ' ' + (it.kw || '')).toLowerCase(), i = s.indexOf(q);
    if(i > -1) return 200 - i; var j = 0; for(var k = 0; k < s.length && j < q.length; k++){ if(s[k] === q[j]) j++; } return j === q.length ? 20 : 0;
  }
  var cache = [];
  function render(){
    var q = input.value.trim().toLowerCase();
    cache = items.map(function(it){ return { it:it, s:score(q, it) }; }).filter(function(x){ return x.s > 0; });
    if(q){ cache.sort(function(a, b){ return b.s - a.s; }); }
    cache = cache.map(function(x){ return x.it; });
    shown = cache.slice();
    if(!cache.length){ list.innerHTML = '<div class="cp-empty">No match for “' + esc(input.value) + '”</div>'; input.removeAttribute('aria-activedescendant'); shown = []; return; }
    var html = '', gi = '';
    cache.forEach(function(it, i){
      if(!q && it.g !== gi){ gi = it.g; html += '<div class="cp-group" role="presentation">' + esc(gi) + '</div>'; }
      html += '<button type="button" class="cp-item" role="option" id="cpo' + i + '" data-i="' + i + '"><span class="ic">' + it.icon + '</span><span class="lb">' + esc(it.label) + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span>' + (it.hk ? '<kbd class="hk">' + esc(it.hk) + '</kbd>' : '') + '</button>';
    });
    list.innerHTML = html; act = 0; mark();
  }
  function mark(){
    var els = list.querySelectorAll('.cp-item');
    for(var i = 0; i < els.length; i++){ var on = i === act; els[i].classList.toggle('on', on); els[i].setAttribute('aria-selected', on ? 'true' : 'false'); if(on){ input.setAttribute('aria-activedescendant', els[i].id); els[i].scrollIntoView({ block:'nearest' }); } }
  }
  function pick(i){ var it = shown[i]; if(!it) return; close(true); sfx('click'); setTimeout(function(){ it.run(); }, 60); }
  function open(){
    if(root.classList.contains('open')) return;
    if(!items.length) build();
    last = doc.activeElement; root.classList.add('open'); input.value = ''; render(); sfx('whoosh'); setTimeout(function(){ input.focus(); }, 10);
  }
  function close(silent){ if(!root.classList.contains('open')) return; root.classList.remove('open'); if(!silent && last && last.focus){ try{ last.focus({ preventScroll:true }); }catch(e){} } }
  GC.palette = { open:open, close:close };
  input.addEventListener('input', render);
  input.addEventListener('keydown', function(e){
    if(e.key === 'ArrowDown'){ e.preventDefault(); act = Math.min(shown.length - 1, act + 1); mark(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); act = Math.max(0, act - 1); mark(); }
    else if(e.key === 'Enter'){ e.preventDefault(); pick(act); }
    else if(e.key === 'Tab'){ e.preventDefault(); }
  });
  list.addEventListener('click', function(e){ var b = e.target.closest('.cp-item'); if(b){ pick(+b.dataset.i); } });
  list.addEventListener('pointermove', function(e){ var b = e.target.closest('.cp-item'); if(b && +b.dataset.i !== act){ act = +b.dataset.i; mark(); } });
  root.addEventListener('click', function(e){ if(e.target.hasAttribute('data-close')){ close(); } });
  doc.addEventListener('keydown', function(e){
    var k = (e.key || '').toLowerCase();
    if((e.ctrlKey || e.metaKey) && k === 'k'){ e.preventDefault(); root.classList.contains('open') ? close() : open(); return; }
    if(k === 'escape' && root.classList.contains('open')){ e.preventDefault(); e.stopPropagation(); close(); return; }
    if(k === '/' && !e.ctrlKey && !e.metaKey && !e.altKey){ var t = e.target; if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return; e.preventDefault(); open(); }
  }, true);

  // header trigger
  var hr = doc.querySelector('#siteHeader .header-right'), tt = $('themeToggle');
  if(hr){
    var b = doc.createElement('button'); b.type = 'button'; b.className = 'theme-toggle cp-open'; b.setAttribute('aria-label', 'Open command palette'); b.setAttribute('data-tip', 'Command palette · ' + KEY);
    b.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
    b.addEventListener('click', open); hr.insertBefore(b, tt || hr.firstChild);
  }
})();

/* ---------- console easter egg ---------- */
try{
  console.log('%c Grey Creatives ', 'background:#E8AA14;color:#171717;font:700 14px monospace;padding:4px 6px;border-radius:4px', '\nYou found the console. Press Ctrl/Cmd + K for the command palette.\nHiring? gr3ycreatives@gmail.com');
}catch(e){}
})();
