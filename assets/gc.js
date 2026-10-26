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

/* =========================================================
   1. AUDIO ENGINE (all sounds are synthesised — zero audio files)
   ========================================================= */
var prefs = { sfx: store.get('gc-sfx') !== '0', music: store.get('gc-music') === '1' };
var ctx = null, master, sfxBus, musicBus, noiseBuf, pluckSend;

function ensure(){
  if(!ctx){
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return false;
    try{ ctx = new AC({ latencyHint:'interactive' }); }catch(e){ try{ ctx = new AC(); }catch(e2){ return false; } }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = prefs.sfx ? 1 : 0; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    // shared echo for plucks
    var dl = ctx.createDelay(1.0); dl.delayTime.value = 0.34;
    var fb = ctx.createGain(); fb.gain.value = 0.34;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    pluckSend = ctx.createGain(); pluckSend.gain.value = 0.42;
    pluckSend.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(musicBus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for(var i = 0; i < d.length; i++){ d[i] = Math.random() * 2 - 1; }
  }
  if(ctx.state === 'suspended'){ ctx.resume(); }
  return true;
}

function osc(type, f0, f1, t, dur, peak, dest, attack){
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if(f1 && f1 !== f0){ o.frequency.exponentialRampToValueAtTime(f1, t + dur); }
  var a = attack || 0.005;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || sfxBus);
  o.start(t); o.stop(t + dur + 0.04);
  return g;
}
function noise(t, dur, peak, type, f0, f1, q, dest, attack){
  var s = ctx.createBufferSource(); s.buffer = noiseBuf;
  var f = ctx.createBiquadFilter(); f.type = type || 'bandpass';
  f.frequency.setValueAtTime(f0, t);
  if(f1){ f.frequency.exponentialRampToValueAtTime(f1, t + dur); }
  f.Q.value = q || 1;
  var g = ctx.createGain(); var a = attack || 0.004;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest || sfxBus);
  s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.04);
}
function mtof(m){ return 440 * Math.pow(2, (m - 69) / 12); }

var SFX = {
  hover: function(t){ osc('triangle', 1900, 2600, t, 0.05, 0.11); noise(t, 0.03, 0.07, 'highpass', 6500, 0, 1); },
  click: function(t){ osc('triangle', 520, 540, t, 0.09, 0.22); osc('square', 780, 790, t + 0.065, 0.12, 0.09); osc('triangle', 1170, 1180, t + 0.065, 0.14, 0.12); },
  whoosh: function(t){ noise(t, 0.55, 0.26, 'bandpass', 220, 3200, 0.8, null, 0.12); osc('sine', 180, 520, t, 0.45, 0.07, null, 0.15); },
  boot: function(t){
    var n = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
    for(var i = 0; i < n.length; i++){
      osc('triangle', n[i], n[i], t + i * 0.075, 0.5, 0.2);
      osc('square', n[i] * 2, n[i] * 2, t + i * 0.075, 0.2, 0.04);
    }
    osc('sine', 150, 38, t, 0.7, 0.42);
    noise(t + 0.45, 0.7, 0.2, 'bandpass', 300, 5000, 0.7, null, 0.2);
  },
  key: function(t){ noise(t, 0.028, 0.16, 'highpass', 2800, 0, 1); osc('sine', 1700 + Math.random() * 500, 1700, t, 0.03, 0.08); },
  step: function(t){ osc('sine', 170, 55, t, 0.08, 0.2); noise(t, 0.04, 0.05, 'lowpass', 500, 0, 1); },
  chime: function(t){
    var n = [523.25, 659.25, 783.99, 1046.5];
    for(var i = 0; i < n.length; i++){
      osc('sine', n[i], n[i], t + i * 0.085, 0.8, 0.17);
      osc('triangle', n[i] * 2, n[i] * 2, t + i * 0.085, 0.4, 0.04);
    }
  },
  'switch': function(t, dark){
    var a = dark ? 880 : 330, b = dark ? 330 : 880;
    osc('square', a, b, t, 0.16, 0.1); osc('triangle', a * 2, b * 2, t, 0.16, 0.12);
    noise(t, 0.05, 0.1, 'highpass', 4000, 0, 1);
  },
  glitch: function(t){
    for(var i = 0; i < 7; i++){ osc('square', 80 + Math.random() * 1100, 80 + Math.random() * 1100, t + i * 0.045, 0.05, 0.1); }
    noise(t, 0.3, 0.12, 'bandpass', 1200, 200, 2, null, 0.01);
  },
  unlock: function(t){
    var n = [262, 330, 392, 523, 659, 784, 1047, 1319, 1568];
    for(var i = 0; i < n.length; i++){ osc('square', n[i], n[i], t + i * 0.07, 0.14, 0.1); }
    osc('sawtooth', 130, 520, t, 0.7, 0.12);
    var c = t + 0.7; [523, 659, 784].forEach(function(f){ osc('triangle', f, f, c, 1.1, 0.14); });
  },
  jump: function(t){ osc('sine', 280, 780, t, 0.2, 0.28); osc('triangle', 560, 1560, t, 0.18, 0.1); },
  error: function(t){ osc('sawtooth', 220, 80, t, 0.28, 0.14); },
  note: function(t, i){
    var sc = [0, 2, 4, 7, 9], k = Math.max(0, Math.min(14, i | 0));
    var f = mtof(60 + sc[k % 5] + 12 * Math.floor(k / 5));
    osc('triangle', f, f, t, 1.0, 0.26); osc('sine', f * 2, f * 2, t, 0.45, 0.07); osc('sine', f * 3, f * 3, t, 0.2, 0.025);
  }
};
var lastSfx = {};
function sfx(name, arg){
  if(!prefs.sfx || !ctx || !SFX[name]) return;
  var now = performance.now();
  var gap = name === 'hover' ? 70 : (name === 'step' ? 150 : (name === 'key' ? 28 : 0));
  if(gap && lastSfx[name] && now - lastSfx[name] < gap) return;
  lastSfx[name] = now;
  try{ SFX[name](ctx.currentTime + 0.005, arg); }catch(e){}
}
GC.sfx = sfx;

/* ---------- generative music: lo-fi loop, 88 BPM, Am7 – Fmaj7 – Cmaj7 – Gmaj7 ---------- */
var M = { on:false, step:0, next:0, timer:null, bpm:88 };
var CH = [
  [45, [57, 60, 64, 67]],
  [41, [53, 57, 60, 64]],
  [48, [55, 60, 64, 67]],
  [43, [55, 59, 62, 66]]
];
var ARP = [0, -1, -1, 2, -1, 3, -1, -1, 1, -1, 2, -1, -1, 3, -1, 2];
function kick(t){ osc('sine', 150, 42, t, 0.26, 0.9, musicBus, 0.003); }
function snare(t){ noise(t, 0.16, 0.5, 'bandpass', 1900, 1400, 0.9, musicBus, 0.002); osc('triangle', 210, 150, t, 0.1, 0.22, musicBus, 0.002); }
function hat(t, open){ noise(t, open ? 0.14 : 0.04, open ? 0.22 : 0.16, 'highpass', 7200, 0, 1, musicBus, 0.001); }
function pad(t, tones, dur){
  var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 760; lp.Q.value = 0.4;
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.55);
  g.gain.setValueAtTime(0.16, t + dur - 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  lp.connect(g); g.connect(musicBus);
  tones.forEach(function(m){
    [-9, 9].forEach(function(det){
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det;
      var og = ctx.createGain(); og.gain.value = 0.25; o.connect(og); og.connect(lp);
      o.start(t); o.stop(t + dur + 0.05);
    });
  });
}
function pluck(t, m){
  var f = mtof(m + 12);
  var g = osc('triangle', f, f, t, 0.5, 0.42, musicBus, 0.003);
  g.connect(pluckSend);
  osc('sine', f * 2, f * 2, t, 0.18, 0.08, musicBus, 0.003);
}
function bass(t, m, dur){ osc('sine', mtof(m), mtof(m), t, dur, 0.85, musicBus, 0.012); osc('triangle', mtof(m + 12), mtof(m + 12), t, dur * 0.6, 0.12, musicBus, 0.012); }
function musicStep(step, t){
  var bar = Math.floor(step / 16) % 4, s = step % 16, spb = 60 / M.bpm / 4;
  var ch = CH[bar];
  if(s === 0){ pad(t, ch[1], spb * 16 + 0.15); }
  if(s === 0){ bass(t, ch[0], spb * 5); }
  if(s === 6){ bass(t, ch[0], spb * 3); }
  if(s === 10){ bass(t, ch[0] + (bar % 2 ? 7 : 0), spb * 3); }
  if(s === 0 || s === 7 || s === 10 || (bar === 3 && s === 13)){ kick(t); }
  if(s === 4 || s === 12){ snare(t); }
  if(s % 2 === 0){ hat(t, s === 14); }
  else if(Math.random() < 0.28){ hat(t, false); }
  var a = ARP[s];
  if(a >= 0 && (bar !== 3 || s < 12 || Math.random() < 0.6)){ pluck(t, ch[1][a]); }
}
function musicTick(){
  if(!ctx || !M.on) return;
  var spb = 60 / M.bpm / 4;
  while(M.next < ctx.currentTime + 0.16){
    var s = M.step % 16, swing = (s % 2) ? 0.022 : 0;
    musicStep(M.step % 64, M.next + swing);
    M.next += spb; M.step++;
  }
}
function startMusic(){
  if(!ensure()) return;
  if(M.on){ return; }
  M.on = true; M.step = 0; M.next = ctx.currentTime + 0.08;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
  musicBus.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.6);
  M.timer = setInterval(musicTick, 40);
  musicTick();
}
function stopMusic(){
  if(!M.on) return;
  M.on = false; clearInterval(M.timer);
  if(ctx){
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  }
}

/* ---------- preferences + player UI ---------- */
var ui = {};
function paintPlayer(){
  doc.body.classList.toggle('gc-music-on', prefs.music);
  doc.body.classList.toggle('gc-sfx-off', !prefs.sfx);
  if(ui.music){
    ui.music.setAttribute('aria-pressed', prefs.music ? 'true' : 'false');
    ui.state.textContent = prefs.music ? 'playing' : 'paused';
  }
  if(ui.sfx){ ui.sfx.setAttribute('aria-pressed', prefs.sfx ? 'true' : 'false'); }
}
function setMusic(on, quiet){
  prefs.music = !!on; store.set('gc-music', on ? '1' : '0');
  if(on){ if(ensure()){ startMusic(); } } else { stopMusic(); }
  paintPlayer();
}
function setSfx(on){
  prefs.sfx = !!on; store.set('gc-sfx', on ? '1' : '0');
  if(ctx){ sfxBus.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.02); }
  paintPlayer();
}
GC.setMusic = setMusic; GC.setSfx = setSfx; GC.prefs = prefs;
GC.enter = function(withSound){
  prefs.sfx = !!withSound; store.set('gc-sfx', withSound ? '1' : '0');
  prefs.music = !!withSound; store.set('gc-music', withSound ? '1' : '0');
  if(withSound && ensure()){
    sfxBus.gain.value = 1;
    sfx('boot');
    startMusic();
  }
  paintPlayer();
};

function buildPlayer(){
  var p = el('div', 'gc-player');
  p.setAttribute('role', 'group'); p.setAttribute('aria-label', 'Sound controls');
  p.innerHTML =
    '<button type="button" class="gcp-music" id="gcMusic" aria-pressed="false" aria-label="Toggle background music">' +
      '<span class="gcp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '<span class="gcp-meta"><b>grey_theme.loop</b><small>88 BPM · <span id="gcState">paused</span></small></span>' +
    '</button>' +
    '<button type="button" class="gcp-sfx" id="gcSfx" aria-pressed="true" aria-label="Toggle sound effects"><span>SFX</span><i class="gcp-dot" aria-hidden="true"></i></button>';
  doc.body.appendChild(p);
  ui.music = $('gcMusic'); ui.sfx = $('gcSfx'); ui.state = $('gcState');
  ui.music.addEventListener('click', function(){ ensure(); setMusic(!prefs.music); sfx('click'); });
  ui.sfx.addEventListener('click', function(){ ensure(); if(!prefs.sfx){ setSfx(true); sfx('click'); } else { sfx('click'); setSfx(false); } });
  paintPlayer();
}

/* unlock audio on the first gesture (browser autoplay policy) */
function unlock(){
  ensure();
  if(prefs.music && !M.on){ startMusic(); }
}
['pointerdown', 'keydown', 'touchstart'].forEach(function(ev){ doc.addEventListener(ev, unlock, { capture:true, once:true, passive:true }); });
doc.addEventListener('visibilitychange', function(){
  if(!ctx) return;
  if(doc.hidden){ ctx.suspend(); } else if(prefs.sfx || prefs.music){ ctx.resume(); }
});

/* delegated hover / click sounds (one listener each — cheap) */
var HOVER_SEL = 'a[href], button, .browser-frame, .sound-click, .capability-item, .g-item, summary, label.seg-opt';
var lastHover = null;
doc.addEventListener('pointerover', function(e){
  if(e.pointerType && e.pointerType !== 'mouse') return;
  var t = e.target.closest ? e.target.closest(HOVER_SEL) : null;
  if(t && t !== lastHover){ lastHover = t; if(!t.closest('.gc-player')){ sfx('hover'); } }
  else if(!t){ lastHover = null; }
}, { passive:true });
doc.addEventListener('pointerdown', function(e){
  var t = e.target.closest ? e.target.closest('a[href], button, .sound-click, label.seg-opt') : null;
  if(!t || t.closest('.gc-player') || t.id === 'themeToggle' || t.id === 'scrollTopBtn' && false){ return; }
  if(t.id === 'themeToggle'){ return; }
  ensure(); sfx('click');
}, { passive:true });
// typing clicks inside forms
doc.addEventListener('input', function(e){
  var t = e.target; if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && t.type !== 'radio' && t.type !== 'checkbox'){ sfx('key'); }
}, { passive:true });
// theme toggle gets its own sound
doc.addEventListener('click', function(e){
  var t = e.target.closest ? e.target.closest('#themeToggle') : null;
  if(t){ setTimeout(function(){ sfx('switch', root.getAttribute('data-theme') === 'dark'); }, 0); }
}, { passive:true });

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
   4. NAV: letter-roll links, hide on scroll down, show on scroll up
   ========================================================= */
function initNav(){
  var header = $('siteHeader'); if(!header) return;
  header.querySelectorAll('nav.links a:not(.nav-cta)').forEach(function(a){
    var t = a.textContent.trim(); if(!t || a.querySelector('.rl')) return;
    a.classList.add('roll-link');
    a.innerHTML = '<span class="rl">' + t + '</span><span class="rl rl2" aria-hidden="true">' + t + '</span>';
  });
  var lastY = window.scrollY, tick = false, nav = $('navLinks');
  function onS(){
    tick = false;
    var y = window.scrollY, dy = y - lastY;
    var menuOpen = nav && nav.classList.contains('open');
    if(menuOpen || y < 140){ header.classList.remove('gc-hide'); }
    else if(dy > 8){ header.classList.add('gc-hide'); }
    else if(dy < -8){ header.classList.remove('gc-hide'); }
    if(Math.abs(dy) > 8 || y < 140){ lastY = y; }
  }
  window.addEventListener('scroll', function(){ if(!tick){ tick = true; requestAnimationFrame(onS); } }, { passive:true });
  header.addEventListener('focusin', function(){ header.classList.remove('gc-hide'); });
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
  if(typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if(k === KON[kpos]){ kpos++; if(kpos === KON.length){ kpos = 0; GC.root(); } } else { kpos = (k === KON[0]) ? 1 : 0; }
  if(k === 'm'){ ensure(); setMusic(!prefs.music); GC.toast('music ' + (prefs.music ? 'on' : 'off')); }
  else if(k === 't'){ var tb = $('themeToggle'); if(tb){ tb.click(); GC.toast(root.getAttribute('data-theme') === 'dark' ? 'dark mode' : 'light mode'); } }
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
  k.innerHTML = (GC.sections ? '<span><kbd>1</kbd>–<kbd>6</kbd> jump</span>' : '') + '<span><kbd>M</kbd> music</span><span><kbd>T</kbd> theme</span>';
  doc.body.appendChild(k);
  requestAnimationFrame(function(){ k.classList.add('show'); });
  setTimeout(function(){ k.classList.remove('show'); }, 9000);
};

/* ---------- boot ---------- */
function boot(){
  buildPlayer();
  if(!reduce){ initRunner(); }
  initNav(); initScramble(); initWhoosh();
  if(!doc.getElementById('loader') || doc.documentElement.classList.contains('gc-seen')){ setTimeout(GC.showKeys, 1600); }
  doc.dispatchEvent(new Event('gc:ready'));
}
GC.ready = true;
if(doc.readyState === 'loading'){ doc.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
