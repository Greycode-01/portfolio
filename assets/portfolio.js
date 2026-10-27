/* Grey Creatives — sideways project rails + project page (homepage) */
(function(){ document.querySelectorAll('.svc-card').forEach(function(c){ var a = c.querySelector('.cap-link'); if(!a) return; c.setAttribute('data-go', a.getAttribute('href')); c.addEventListener('click', function(e){ if(e.target.closest('a')) return; a.click(); }); }); })();
(function(){
"use strict";
var dataEl = document.getElementById('gcData'); if(!dataEl) return;
var D; try{ D = JSON.parse(dataEl.textContent); }catch(e){ return; }
var ALL = D.web.concat(D.brand), BY = {}; ALL.forEach(function(p){ BY[p.slug] = p; });
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
var ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var BACK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
function sfx(n, a){ if(window.GC && GC.sfx){ GC.sfx(n, a); } }

function cardHTML(p){
  var img = p.type === 'web' ? p.img : p.imgs[0][0], alt = p.type === 'web' ? p.alt : p.imgs[0][1];
  return '<a class="pf-card sound-click" href="#p/' + p.slug + '" data-slug="' + p.slug + '" draggable="false">' +
    '<div class="pf-thumb"><img src="' + esc(img) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" draggable="false"></div>' +
    '<div class="pf-body"><h3>' + esc(p.title) + '</h3><p>' + esc(p.tagline) + '</p><span class="pf-go">' + ARROW + '</span></div></a>';
}

/* ---------- rails ---------- */
document.querySelectorAll('.pf-rail[data-kind]').forEach(function(r){
  r.innerHTML = D[r.getAttribute('data-kind')].map(cardHTML).join('');
});
var TOUCH = window.matchMedia('(hover:none)').matches;
function wireRail(r){
  var parent = r.parentNode, isSvc = r.classList.contains('svc-rail');
  var cards = r.children, total = cards.length;
  var meta = document.createElement('div'); meta.className = 'pf-meta' + (isSvc ? ' pf-meta-svc' : '');
  var hint = TOUCH ? 'Swipe for more' : 'Drag or use the arrows';
  meta.innerHTML = '<span class="pf-count"><b>01</b> / ' + ('0' + total).slice(-2) + ' projects</span>' +
    '<span class="pf-track2"><i></i></span>' +
    '<span class="pf-hint"><span>' + hint + '</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6l6 6-6 6"/><path d="M12 6l6 6-6 6"/></svg></span>' +
    (isSvc ? '' : '<span class="pf-arrows"><button type="button" aria-label="Previous" data-d="-1">' + BACK + '</button><button type="button" aria-label="Next" data-d="1">' + ARROW + '</button></span>');
  parent.insertBefore(meta, r.nextSibling);
  var cnt = meta.querySelector('.pf-count b'), fill = meta.querySelector('.pf-track2 i'), btns = meta.querySelectorAll('.pf-arrows button');
  meta.addEventListener('click', function(e){
    var bt = e.target.closest('button'); if(!bt) return;
    r.scrollBy({ left: (+bt.dataset.d) * Math.max(280, r.clientWidth * 0.6), behavior:'smooth' }); sfx('nav', bt.dataset.d > 0 ? 6 : 3);
  });
  var touched = false;
  function upd(){
    var max = r.scrollWidth - r.clientWidth, x = r.scrollLeft;
    if(max <= 4){ meta.style.display = 'none'; r.classList.remove('more-r', 'more-l'); return; }
    meta.style.display = '';
    var step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
    var idx = x >= max - 6 ? total : Math.min(total, Math.round(x / step) + 1);
    cnt.textContent = ('0' + idx).slice(-2);
    fill.style.transform = 'scaleX(' + Math.min(1, (x + r.clientWidth) / r.scrollWidth).toFixed(3) + ')';
    r.classList.toggle('more-r', x < max - 8); r.classList.toggle('more-l', x > 8);
    if(btns.length){ btns[0].disabled = x < 8; btns[1].disabled = x > max - 8; }
    if(x > 24 && !touched){ touched = true; meta.classList.add('seen'); r.classList.remove('nudge'); }
  }
  r.addEventListener('scroll', upd, { passive:true }); window.addEventListener('resize', upd, { passive:true }); setTimeout(upd, 250); setTimeout(upd, 1200);
  // one-time nudge when the rail first comes into view: the cards slide left a little and settle back
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      if(!es[0].isIntersecting) return; io.disconnect();
      if(r.scrollWidth - r.clientWidth < 12 || r.scrollLeft > 10) return;
      setTimeout(function(){ if(!touched){ r.classList.add('nudge'); setTimeout(function(){ r.classList.remove('nudge'); }, 2600); } }, 500);
    }, { threshold:0.55 });
    io.observe(r);
  }
  // mouse drag
  var down = false, sx = 0, sl = 0, moved = false;
  r.addEventListener('pointerdown', function(e){
    if(e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = r.scrollLeft;
  });
  window.addEventListener('pointermove', function(e){
    if(!down) return; var dx = e.clientX - sx;
    if(!moved && Math.abs(dx) > 6){ moved = true; r.classList.add('drag'); }
    if(moved){ r.scrollLeft = sl - dx; }
  }, { passive:true });
  window.addEventListener('pointerup', function(){
    if(!down) return; down = false;
    if(moved){ setTimeout(function(){ r.classList.remove('drag'); }, 0); }
  });
}
document.querySelectorAll('.pf-rail[data-rail]').forEach(wireRail);

/* ---------- project page ---------- */
var detail = document.createElement('div');
detail.className = 'pf-detail'; detail.setAttribute('role', 'dialog'); detail.setAttribute('aria-modal', 'true'); detail.setAttribute('aria-label', 'Project');
document.body.appendChild(detail);
var current = null, opener = null;
var bl = document.querySelector('#brand .pf-btn'), ALLB = bl ? bl.getAttribute('href') : '/branding-work';

function more(p){
  var list = ALL.filter(function(x){ return x.type === p.type; }), i = list.indexOf(p), out = [];
  for(var k = 1; k < list.length && out.length < 4; k++){ out.push(list[(i + k) % list.length]); }
  return out;
}
function build(p){
  var visual, link = '';
  if(p.type === 'web'){
    visual = '<div class="pf-browser"><div class="pf-bar"><i></i><i></i><i></i><b>' + esc(p.domain) + '</b></div><img src="' + esc(p.img) + '" alt="' + esc(p.alt) + '" decoding="async"></div>';
    link = '<a class="pf-visit sound-click" href="' + esc(p.url) + '" target="_blank" rel="noopener">Visit live site ' + ARROW + '</a>';
  } else {
    visual = '<div class="pf-gal">' + p.imgs.map(function(im){ return '<figure><img src="' + esc(im[0]) + '" alt="' + esc(im[1]) + '" loading="lazy" decoding="async"></figure>'; }).join('') + '</div>';
    link = p.url ? '<a class="pf-visit sound-click" href="' + esc(p.url) + '" target="_blank" rel="noopener">See the case study ' + ARROW + '</a>' : '<a class="pf-visit sound-click" href="' + esc(ALLB) + '">All branding work ' + ARROW + '</a>';
  }
  return '<div class="pf-d-in"><button type="button" class="pf-back sound-click">' + BACK + ' Back</button>' +
    '<span class="pf-feat">Featured ' + (p.type === 'web' ? 'work' : 'identity') + '</span><h1>' + esc(p.title) + '</h1><p class="pf-sub">' + esc(p.tagline) + '</p>' + visual +
    '<div class="pf-cols"><div><div class="pf-tags">' + p.tags.map(function(t){ return '<span>' + esc(t) + '</span>'; }).join('') + '</div><p>' + esc(p.desc) + '</p></div>' +
    '<div><div class="pf-focus"><b>Our focus</b><p>' + esc(p.focus) + '</p></div>' + link + '</div></div>' +
    '<div class="pf-more"><h2>More from the notebook</h2><div class="pf-rail" data-rail>' + more(p).map(cardHTML).join('') + '</div></div></div>';
}
function show(slug, push){
  var p = BY[slug]; if(!p) return;
  opener = opener || document.activeElement;
  detail.innerHTML = build(p); current = slug; detail.scrollTop = 0;
  wireRail(detail.querySelector('.pf-rail'));
  if(!detail.classList.contains('open')){ document.body.classList.add('pf-lock'); detail.classList.add('open'); sfx('whoosh'); }
  if(push){ try{ history.pushState({ pf:slug }, '', '#p/' + slug); }catch(e){ location.hash = '#p/' + slug; } }
  var b = detail.querySelector('.pf-back'); if(b){ b.focus({ preventScroll:true }); }
}
function hide(fromPop){
  if(!detail.classList.contains('open')) return;
  detail.classList.remove('open'); document.body.classList.remove('pf-lock'); current = null;
  if(!fromPop){ if(history.state && history.state.pf){ history.back(); } else { try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){} } }
  if(opener && opener.focus){ opener.focus({ preventScroll:true }); } opener = null;
}
document.addEventListener('click', function(e){
  var a = e.target.closest('a.pf-card'); if(a){ e.preventDefault(); opener = a; show(a.dataset.slug, !detail.classList.contains('open') || true); return; }
  if(e.target.closest('.pf-back')){ hide(false); }
});
document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && detail.classList.contains('open')){ hide(false); } });
window.addEventListener('popstate', function(){
  var m = /^#p\/([\w-]+)$/.exec(location.hash);
  if(m && BY[m[1]]){ show(m[1], false); } else { hide(true); }
});
var m0 = /^#p\/([\w-]+)$/.exec(location.hash); if(m0 && BY[m0[1]]){ show(m0[1], false); }
})();
