'use strict';
// ======================= v4.3.83: kill path — weekly-kill bag + pending score were written to localStorage (JSON + score link hash) on EVERY kill; batch them =======================
(function(){try{const _nk=zs439NoteKill;let n=0,t=0;const flush=()=>{t=0;if(!n)return;const k=n;n=0;try{const o=zs439Bag();o.add=(o.add|0)+k;zs439SaveBag(o);}catch(e){}try{queueScore();}catch(e){}try{zs439Arm();}catch(e){}};
  zs439NoteKill=function(){n++;if(!t)t=setTimeout(flush,1500);};window.zs439NoteKill=zs439NoteKill;window.__flushKills483=flush;
  for(const k of ['gameOver','svGameOver','showMenu']){try{const f=window[k];if(typeof f==='function')window[k]=function(){flush();return f.apply(this,arguments);};}catch(e){}}
  try{gameOver=window.gameOver;showMenu=window.showMenu;}catch(e){}
  addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});void _nk;}catch(e){console.warn('v483 kill',e);}})();
// ---- saves: deferred to idle time and coalesced (was a 117-122 ms JSON.stringify + localStorage write in the frame) ----
(function(){try{const _sv=svSave;let pend=0;const ric=window.requestIdleCallback?(f=>requestIdleCallback(f,{timeout:2500})):(f=>setTimeout(f,400));
  const run=()=>{if(!pend)return;pend=0;try{_sv();}catch(e){}};
  svSave=function(){if(pend)return;pend=1;ric(run);};window.svSave=svSave;window.__svFlush483=()=>{if(pend)run();};
  for(const k of ['gameOver','svGameOver','showMenu','svExit']){try{const f=window[k];if(typeof f==='function')window[k]=function(){if(pend)run();return f.apply(this,arguments);};}catch(e){}}
  try{gameOver=window.gameOver;showMenu=window.showMenu;}catch(e){}
  addEventListener('pagehide',()=>{if(pend)run();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&pend)run();});}catch(e){console.warn('v483 save',e);}})();
// ---- base damage: piece re-tint/matrix rewrite coalesced to once per 250 ms per piece ----
(function(){try{const _pw=pieceWrite,_dp=damagePiece;let inD=0;const Q=new Set();let t=0;
  pieceWrite=function(p){if(inD){Q.add(p);if(!t)t=setTimeout(()=>{t=0;const L=[...Q];Q.clear();for(const q of L)try{if(q.alive)_pw(q);}catch(e){}},250);return;}return _pw.apply(this,arguments);};
  damagePiece=function(){inD=1;try{return _dp.apply(this,arguments);}finally{inD=0;}};window.pieceWrite=pieceWrite;window.damagePiece=damagePiece;}catch(e){console.warn('v483 base',e);}})();
// ---- shotgun crosshair: the 4.3.81 colour rule also painted the spread ring's background (filled white disc). Ring stays an outline only. ----
(function(){const st=document.createElement('style');st.textContent='html body #ret467 u{background:transparent!important}';document.head.appendChild(st);})();
// ---- gunshots: punchier and less harsh, fewer nodes per shot ----
// crack: band-limited (was a full-level highpass hiss) · body: same envelope, slightly shorter · added short sub "kick" for punch ·
// distortion: ONE shared waveshaper per output (was 2 new nodes every shot) · tail softer.
(function(){try{const DW=new WeakMap();const dist=(d,amt)=>{let w=DW.get(d);if(!w){const c=AU.ctx,ws=c.createWaveShaper();ws.curve=AU.curve;ws.oversample='2x';const g=c.createGain();g.gain.value=.45;g.connect(ws).connect(d);w=g;DW.set(d,w);}return w;};
  gun=function(o){const c=AU.ctx;if(!c)return;const t=c.currentTime,d=sfxOut(o.rev||.18),v=o.v||1;if(!d)return;
    aN(t,.016,.55*v,'bandpass',Math.min(6500,(o.crack||3800)*1.1),0,.9,d,.001);
    aN(t,(o.body||.2)*.9,.95*v,'lowpass',Math.min(5200,o.lp||5200),o.lp2||420,.8,d,.002);
    aO(t,o.thd||.16,1.0*v,'sine',o.th||150,o.th2||42,d,.002);
    aO(t,.06,.7*v,'sine',Math.max(55,(o.th2||42)*1.6),38,d,.001);
    if(o.dist)aN(t,(o.body||.15)*.6,.55*v,'bandpass',o.bp||1200,(o.bp||1000)*.4,1.0,dist(d,v),.002);
    if(o.mech)aN(t+o.mech,.035,.2*v,'bandpass',o.mf||2800,0,4,d);
    if(o.tail)aN(t+.02,o.tail,.16*v,'lowpass',1100,160,.6,d,.03);};window.gun=gun;}catch(e){console.warn('v483 gun',e);}})();
// ---- debug: remaining error classes + 4.3.83 telemetry in the report ----
(function(){const F=(...a)=>{try{window.__dbg482&&__dbg482.find(...a);}catch(e){}};
  // resource load failures (img/script/css/audio), previously ignored
  addEventListener('error',e=>{try{const el=e&&e.target;if(!el||el===window)return;const src=el.src||el.href||el.currentSrc||'';if(!src)return;
    const f=String(src).startsWith('data:')?'immagine incorporata':String(src).split('/').pop().split('?')[0];F('CRASH','risorsa:'+f,'load','RISORSA non caricata: '+f+' ('+el.tagName.toLowerCase()+')','warn');}catch(x){}},true);
  // WebGL shader/program errors
  try{renderer.debug.checkShaderErrors=true;renderer.debug.onShaderError=function(gl,prog,vs,fs){let log='';try{log=(gl.getProgramInfoLog(prog)||'')+' '+(gl.getShaderInfoLog(fs)||'')+' '+(gl.getShaderInfoLog(vs)||'');}catch(e){}
    F('CRASH','webgl:shader',log.slice(0,40),'CRASH grafico: errore di compilazione shader — '+log.trim().slice(0,160),'err');};}catch(e){}
  try{renderer.domElement.addEventListener('webglcontextrestored',()=>F('CRASH','webgl','ripristinato','GRAFICA: contesto WebGL ripristinato dopo la perdita','warn'));}catch(e){}
  // memory pressure (OOM risk) and watchdog restarts
  let memW=0;setInterval(()=>{try{const m=performance.memory;if(m&&m.jsHeapSizeLimit&&m.usedJSHeapSize/m.jsHeapSizeLimit>.85&&!memW){memW=1;F('CRASH','memoria','quasi piena','MEMORIA quasi piena: '+Math.round(m.usedJSHeapSize/1048576)+' / '+Math.round(m.jsHeapSizeLimit/1048576)+' MB (rischio chiusura)','err');}}catch(e){}},5000);
  // telemetry block merged into the report (ext483)
  const _x=window.__dbg482x;window.__dbg482x=function(){const r=_x?_x():{};try{r.v483={
      precompile:window.__cc482&&__cc482.stat?__cc482.stat.last:null,shaderOra:renderer.info.programs?renderer.info.programs.length:0,drawCall:renderer.info.render.calls,
      watchdogRiavvii:typeof L4310!=='undefined'?L4310.restarts:0,salvataggioDifferito:!!window.__svFlush483,killBatch:!!window.__flushKills483,
      musicaInCache:(()=>{try{return Object.keys(MUS.buf||{});}catch(e){return [];}})(),nativo:!!window.ZSNative};}catch(e){}return r;};})();
