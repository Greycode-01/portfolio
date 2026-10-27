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
function wireRail(r){
  var parent = r.parentNode, arrows = null;
  if(!r.classList.contains('svc-rail')){
    arrows = document.createElement('div'); arrows.className = 'pf-arrows';
    arrows.innerHTML = '<button type="button" aria-label="Scroll left" data-d="-1">' + BACK + '</button><button type="button" aria-label="Scroll right" data-d="1">' + ARROW + '</button>';
    parent.insertBefore(arrows, r.nextSibling);
    arrows.addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b) return;
      r.scrollBy({ left: (+b.dataset.d) * Math.max(280, r.clientWidth * 0.6), behavior:'smooth' }); sfx('nav', b.dataset.d > 0 ? 6 : 3);
    });
  }
  function upd(){
    if(!arrows) return; var b = arrows.children;
    b[0].disabled = r.scrollLeft < 8; b[1].disabled = r.scrollLeft > r.scrollWidth - r.clientWidth - 8;
  }
  r.addEventListener('scroll', upd, { passive:true }); window.addEventListener('resize', upd, { passive:true }); setTimeout(upd, 300);
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
