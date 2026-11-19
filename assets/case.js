/* Grey Creatives: case study pages (/work/<slug>) and homepage cards. Data: assets/case-studies.js */
(function(){
"use strict";
var CASES = (window.GC_CASES || []).filter(function(c){ return c && c.slug && c.name; });
var REVIEWS = (window.GC_REVIEWS || []);
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
var ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function domain(u){ return String(u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }
function tags(arr){ return (arr && arr.length) ? '<div class="cs-tags">' + arr.map(function(t){ return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : ''; }
function stars(n){ n = Math.max(1, Math.min(5, Math.round(Number(n)) || 5)); return '<span class="stars" role="img" aria-label="' + n + ' out of 5 stars">' + '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n) + '</span>'; }

/* ---------- cards: homepage shows one featured case study, /case-studies shows all ---------- */
function cardHTML(c){
  return '<a class="cs-card sound-click" href="/work/' + esc(c.slug) + '">' +
    '<div class="cs-thumb"><img src="' + esc(c.cover) + '" alt="' + esc(c.coverAlt || c.name) + '" loading="lazy" decoding="async"></div>' +
    '<div class="cs-body"><span class="cs-label">Case study</span><h3>' + esc(c.name) + '</h3>' +
    '<p class="cs-ind">' + esc(c.industry) + '</p>' +
    (c.summary ? '<p class="cs-sum">' + esc(c.summary) + '</p>' : '') + tags(c.services) +
    '<span class="cs-go">Read case study ' + ARROW + '</span></div></a>';
}
var home = document.querySelector('[data-cases="home"]');
if(home){
  if(!CASES.length){ home.hidden = true; }
  else {
    home.className = 'cs-cards cs-solo reveal in-view';
    home.innerHTML = cardHTML(CASES[0]);   // the first entry in assets/case-studies.js is the featured one
    if(CASES.length > 1){
      var more = document.createElement('div'); more.className = 'cs-more reveal in-view';
      more.innerHTML = '<a class="cs-morelink sound-click" href="/case-studies">Read other case studies ' + ARROW + '</a><span>' + (CASES.length - 1) + ' more</span>';
      home.parentNode.insertBefore(more, home.nextSibling);
    }
  }
}
var all = document.querySelector('[data-cases="all"]');
if(all){
  all.className = 'cs-cards cs-multi cs-all reveal in-view';
  all.innerHTML = CASES.map(cardHTML).join('');
}

/* ---------- case study page ---------- */
var root = document.getElementById('caseRoot');
if(!root) return;
var qs = /[?&]c=([\w-]+)/.exec(location.search);
var slug = qs ? qs[1] : decodeURIComponent(location.pathname.replace(/\/+$/, '').split('/').pop() || '').replace(/\.html$/, '');
var idx = -1; CASES.forEach(function(c, i){ if(c.slug === slug) idx = i; });
if(idx < 0){ location.replace('/#work'); return; }
var c = CASES[idx];

function setMeta(sel, attr, val){ var el = document.querySelector(sel); if(el){ el.setAttribute(attr, val); } }
var title = c.name + ' — Case Study | Grey Creatives';
var desc = c.metaDescription || ('Case study: ' + c.name + ' (' + c.industry + '). ' + (c.services || []).join(', ') + ' by Grey Creatives.');
var abs = location.origin + '/work/' + c.slug, img = location.origin + '/' + String(c.cover).replace(/^\//, '');
document.title = title;
setMeta('meta[name="description"]', 'content', desc);
setMeta('meta[property="og:title"]', 'content', title); setMeta('meta[property="og:description"]', 'content', desc);
setMeta('meta[property="og:url"]', 'content', abs); setMeta('meta[property="og:image"]', 'content', img);
setMeta('meta[name="twitter:title"]', 'content', title); setMeta('meta[name="twitter:description"]', 'content', desc); setMeta('meta[name="twitter:image"]', 'content', img);
setMeta('link[rel="canonical"]', 'href', abs);

function row(label, val){ return val ? '<div><b>' + label + '</b><span>' + val + '</span></div>' : ''; }
function block(label, inner){ return inner ? '<section class="cs-block"><div class="wrap cs-two reveal in-view"><h2>' + label + '</h2><div class="cs-copy">' + inner + '</div></div></section>' : ''; }

var out = '';
out += '<section class="section-pad page-intro cs-head"><div class="wrap reveal in-view">' +
  '<a class="cs-crumb" href="/case-studies">← All case studies</a><span class="kicker">Case study</span><h1>' + esc(c.name) + '</h1>' +
  '<div class="cs-meta">' + row('Industry', esc(c.industry)) + row('Location', esc(c.location)) + (c.services && c.services.length ? '<div><b>Services</b>' + tags(c.services) + '</div>' : '') + '</div>' +
  (c.url ? '<a class="pf-visit sound-click" href="' + esc(c.url) + '" target="_blank" rel="noopener">Visit live site ' + ARROW + '</a>' : '') + '</div></section>';
if(c.cover){
  out += '<section class="cs-hero"><div class="wrap reveal in-view"><div class="pf-browser">' +
    '<div class="pf-bar"><i></i><i></i><i></i>' + (c.url ? '<b>' + esc(domain(c.url)) + '</b>' : '') + '</div><img src="' + esc(c.cover) + '" alt="' + esc(c.coverAlt || c.name) + '" decoding="async"></div></div></section>';
}
out += block('The client', c.client ? '<p>' + esc(c.client) + '</p>' : '');
out += block('The problem', c.problem ? '<p>' + esc(c.problem) + '</p>' : '');
var gal = (c.gallery && c.gallery.length) ? '<div class="cs-gallery">' + c.gallery.map(function(g){ return '<figure><img src="' + esc(g[0]) + '" alt="' + esc(g[1] || '') + '" loading="lazy" decoding="async"></figure>'; }).join('') + '</div>' : '';
out += block('What we did', (c.did && c.did.length ? '<ul class="cs-list">' + c.did.map(function(d){ return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' : '') + gal);
out += block('The result', c.result ? '<p>' + esc(c.result) + '</p>' : '');
var revs = REVIEWS.filter(function(r){ return r && r.case === c.slug && r.text && r.name; });
if(revs.length){
  out += '<section class="cs-block"><div class="wrap cs-two reveal in-view"><h2>Client review</h2><div class="cs-copy">' + revs.map(function(r){
    var line = [r.role, r.business].filter(Boolean).join(', ') + (r.country ? ' · ' + esc(r.country) : '');
    return '<figure class="testimonial-card rv-big">' + stars(r.rating) + '<blockquote class="quote">“' + esc(r.text) + '”</blockquote><figcaption><div class="testimonial-author"><div class="author-name">' + esc(r.name) + '</div>' + (line ? '<div class="author-role">' + esc(line) + '</div>' : '') + '</div></figcaption></figure>';
  }).join('') + '</div></div></section>';
}
var nxt = CASES.length > 1 ? CASES[(idx + 1) % CASES.length] : null;
out += '<section class="cs-next"><div class="wrap reveal in-view"><div class="cs-next-in"><div><span class="kicker">Next step</span><h2>Have a project in mind?</h2></div>' +
  '<div class="cs-next-actions"><a class="pf-visit sound-click" href="/#contact">Start a project ' + ARROW + '</a>' +
  (nxt ? '<a class="cs-nextlink" href="/work/' + esc(nxt.slug) + '"><small>Next case study</small>' + esc(nxt.name) + ' ' + ARROW + '</a>' : '') + '</div></div></div></section>';
root.innerHTML = out;
})();
