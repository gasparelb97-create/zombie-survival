'use strict';
// ======================= v4.3.82 match loading: same night screen + smooth bar on every Gioca / Nuova partita / Arena; precompile behind it =======================
(function(){
// visuals now come from the shared .zsl markup in game.html (old #ld431 visuals removed)
let showT=0,pend=0,force=0;
try{const _s=ld431Show;ld431Show=function(){showT=performance.now();pend=0;return _s.apply(this,arguments);};window.ld431Show=ld431Show;}catch(e){}
function compileMatch(){try{if(window.__cc482)return Promise.race([__cc482.vmAll().then(()=>__cc482.compile(__cc482.list(),'partita')),new Promise(r=>setTimeout(r,6500))]).catch(()=>{});}catch(e){}return Promise.resolve();}
try{const _h=ld431Hide;ld431Hide=function(){const self=this,args=arguments;
  if(force||typeof game==='undefined'||game.state!=='play'){force=0;return _h.apply(self,args);}
  if(pend)return;pend=1;LD431.cover=1;try{ld431Set(Math.max(LD431.p,.92),'Preparo le armi…');}catch(e){}
  const t0=showT||performance.now();const cap=setTimeout(()=>{if(pend){pend=0;force=1;ld431Hide();}},Math.max(500,8000-(performance.now()-t0)));
  compileMatch().then(()=>{try{ld431Set(.97,'Stabilizzo i fotogrammi…');renderer.shadowMap.needsUpdate=true;}catch(e){}
    let n=0;const wait=()=>{if(!pend)return;if(++n<4||performance.now()-t0<1000){requestAnimationFrame(wait);return;}clearTimeout(cap);pend=0;force=1;ld431Hide();};requestAnimationFrame(wait);});};window.ld431Hide=ld431Hide;}catch(e){console.warn('ld482',e);}
// cover every later start (not only when M480 is on) and the arena
function cover482(txt){try{if(/[?&]noload431/.test(location.search)||LD431.on||LD431.hold)return;ld431Show(txt);ld431Set(.3,txt);LD432.cv={n:0,ok:0,prog:(renderer.info.programs?renderer.info.programs.length:0),t:performance.now()};LD431.cover=1;}catch(e){}}
try{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);cover482('Entro in partita…');return r;};window.startGame=startGame;}catch(e){}
try{const _ab=arenaBegin;arenaBegin=function(){const r=_ab.apply(this,arguments);cover482('Entro in arena…');return r;};window.arenaBegin=arenaBegin;}catch(e){}
})();
