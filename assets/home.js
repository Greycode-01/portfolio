/* Grey Creatives — homepage-only behaviour: instrument grid + section hotkeys */
(function(){
"use strict";
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.GC = window.GC || {};
GC.sections = [['home','home.html'],['work','work.tsx'],['services','services.jsx'],['stack','stack.json'],['brand','brand.css'],['logos','logos.svg'],['video','reel.mp4'],['contact','contact.json']];

})();
