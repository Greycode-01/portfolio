/* Grey Creatives: renders client reviews from assets/reviews-data.js */
(function(){
"use strict";
var list = (window.GC_REVIEWS || []).filter(function(r){ return r && r.text && r.name; });
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
function stars(n){ n = Math.max(1, Math.min(5, Math.round(Number(n)) || 5)); return '<span class="stars" role="img" aria-label="' + n + ' out of 5 stars">' + '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n) + '</span>'; }
// newest first (by date if given), then highest rated; ties keep file order
var sorted = list.map(function(r, i){ return { r:r, i:i }; }).sort(function(a, b){
  var da = a.r.date || '', db = b.r.date || '';
  if(da !== db) return da < db ? 1 : -1;
  if((b.r.rating || 0) !== (a.r.rating || 0)) return (b.r.rating || 0) - (a.r.rating || 0);
  return a.i - b.i;
}).map(function(o){ return o.r; });

function who(r){
  var line = [r.role, r.business].filter(Boolean).join(', ');
  if(r.country){ line += (line ? ' · ' : '') + r.country; }
  return '<div class="testimonial-author"><div class="author-name">' + esc(r.name) + '</div>' + (line ? '<div class="author-role">' + esc(line) + '</div>' : '') + '</div>';
}
function link(r){
  return r.case ? '<a class="rv-link sound-click" href="/work/' + esc(r.case) + '">See the project <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' : '';
}
function card(r, big){
  return '<figure class="testimonial-card' + (big ? ' rv-big' : '') + '">' + stars(r.rating) + '<blockquote class="quote">“' + esc(r.text) + '”</blockquote>' + '<figcaption>' + who(r) + link(r) + '</figcaption></figure>';
}

/* reviews page: all reviews, clean grid */
var grid = document.querySelector('[data-reviews="grid"]');
if(grid){
  if(!sorted.length){ var gs = grid.closest('section'); if(gs){ gs.hidden = true; } }
  else { grid.innerHTML = sorted.map(function(r){ return card(r, false); }).join(''); }
}

/* homepage: 1 = featured, 2-3 = side by side, 4+ = slider */
var home = document.querySelector('[data-reviews="home"]');
if(home){
  var section = home.closest('section');
  if(!sorted.length){ if(section){ section.hidden = true; } return; }
  var n = sorted.length;
  if(n === 1){
    home.className = 'rv-feature reveal in-view';
    home.innerHTML = card(sorted[0], true);
  } else if(n <= 3){
    home.className = 'rv-row rv-n' + n + ' reveal in-view';
    home.innerHTML = sorted.map(function(r){ return card(r, false); }).join('');
  } else {
    home.className = 'rv-slider reveal in-view';
    home.innerHTML = '<div class="rv-track" tabindex="0" aria-label="Client reviews">' + sorted.map(function(r){ return card(r, false); }).join('') + '</div>' +
      '<div class="rv-nav"><button type="button" class="rv-prev" aria-label="Previous review">←</button><span class="rv-count"></span><button type="button" class="rv-next" aria-label="Next review">→</button></div>';
    var track = home.querySelector('.rv-track'), prev = home.querySelector('.rv-prev'), next = home.querySelector('.rv-next'), cnt = home.querySelector('.rv-count');
    function step(){ var c = track.children[1]; return c ? c.offsetLeft - track.children[0].offsetLeft : track.clientWidth; }
    function upd(){
      var s = step(), i = Math.round(track.scrollLeft / s) + 1, max = track.scrollWidth - track.clientWidth;
      cnt.textContent = Math.min(n, i) + ' / ' + n;
      prev.disabled = track.scrollLeft < 6; next.disabled = track.scrollLeft > max - 6;
    }
    prev.addEventListener('click', function(){ track.scrollBy({ left:-step(), behavior:'smooth' }); });
    next.addEventListener('click', function(){ track.scrollBy({ left:step(), behavior:'smooth' }); });
    track.addEventListener('scroll', upd, { passive:true }); window.addEventListener('resize', upd, { passive:true }); upd(); setTimeout(upd, 300);
  }
}
})();
