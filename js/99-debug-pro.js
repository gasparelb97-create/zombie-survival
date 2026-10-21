'use strict';
// ======================= 99-debug-pro: debug completo in-game (solo memoria, riparte pulito a ogni avvio) =======================
// Carica DOPO tutti gli altri script. Nessun salvataggio: lo stato vive solo in RAM.
(function(){
if(window.__DBGPRO)return;
const T0=performance.now(),now=()=>performance.now(),G=n=>{try{return eval('typeof '+n+'!=="undefined"?'+n+':undefined');}catch(e){return undefined;}};
// ---- REGOLA: avvio pulito. Rimuove log/diagnosi persistiti delle sessioni precedenti (solo chiavi di debug, non i salvataggi del gioco).
try{const kill=/^(zs_dbgfp482|zs_dbgpend482|zs_dbgpro.*|zs_debuglog.*|zs_dbglog.*)$/;const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&kill.test(k))ks.push(k);}ks.forEach(k=>localStorage.removeItem(k));}catch(e){}
const CAT={CRASH:'💥 Crash',CONSOLE:'⚠️ Console',WEBGL:'🎨 WebGL/Shader',MESH:'🧊 Mesh',AUDIO:'🔊 Audio/Musica',FISICA:'🧲 Fisica',MEMORIA:'🧠 Memoria',FPS:'🐢 Frame/FPS',SOVRAPP:'📦 Sovrapposizioni'};
const S={items:{},order:[],n:0,max:400,dirty:1,fps:0,frames:0,worst:0,slow:0};
const fmt=t=>((t-T0)/1000).toFixed(1)+'s';
function rep(cat,msg,sev,extra){try{msg=String(msg==null?'':msg).slice(0,300);const key=cat+'|'+msg.replace(/\d+(\.\d+)?/g,'#');let it=S.items[key];const t=now();
  if(!it){if(S.order.length>=S.max){const old=S.order.shift();delete S.items[old];}it=S.items[key]={cat,msg,sev:sev||'warn',n:0,first:t,x:null};S.order.push(key);}
  it.n++;it.last=t;it.msg=msg;if(extra)it.x=extra;if(sev==='err')it.sev='err';S.n++;S.dirty=1;}catch(e){}}
// ---- errori JS ----
addEventListener('error',e=>{try{const tg=e&&e.target;if(tg&&tg!==window&&(tg.src||tg.href)){const u=String(tg.src||tg.href).split('/').pop().split('?')[0];rep(/audio|mp3|ogg|wav/i.test(tg.tagName+u)?'AUDIO':'CRASH','Risorsa non caricata: '+(tg.tagName||'').toLowerCase()+' '+u,'err');return;}
  rep('CRASH',(e.message||'errore')+' @ '+String(e.filename||'').split('/').pop().split('?')[0]+':'+(e.lineno|0),'err',{stack:String(e.error&&e.error.stack||'').slice(0,800)});}catch(x){}},true);
addEventListener('unhandledrejection',e=>{try{const r=e&&e.reason;rep('CRASH','Promise rifiutata: '+(r&&r.message||r),'err',{stack:String(r&&r.stack||'').slice(0,800)});}catch(x){}});
// ---- console.error / warn (incluse le segnalazioni di shader di three.js) ----
for(const lv of ['error','warn']){const o=console[lv];if(typeof o!=='function')continue;console[lv]=function(){try{const a=[].map.call(arguments,v=>v&&v.message?v.message:typeof v==='object'?(()=>{try{return JSON.stringify(v).slice(0,120);}catch(e){return String(v);}})():String(v)).join(' ');
  if(!/^dbg482|^bb482/.test(a)){const sh=/THREE\.WebGL(Program|Shader)|shader|program info|VALIDATE_STATUS|compile/i.test(a);rep(sh?'WEBGL':'CONSOLE',(sh?'Shader/Program: ':'console.'+lv+': ')+a,lv==='error'?'err':'warn');}}catch(e){}return o.apply(this,arguments);};}
// ---- WebGL ----
const R=G('renderer'),SC=G('scene'),CAM=G('camera');
try{if(R&&R.domElement){R.domElement.addEventListener('webglcontextlost',()=>rep('WEBGL','Contesto WebGL PERSO (memoria GPU esaurita o app in background)','err'),false);R.domElement.addEventListener('webglcontextrestored',()=>rep('WEBGL','Contesto WebGL ripristinato','info'),false);}
  if(R&&R.debug){R.debug.checkShaderErrors=true;const prev=R.debug.onShaderError;R.debug.onShaderError=function(gl,prog,vs,fs){try{rep('WEBGL','Errore compilazione shader: '+String(gl.getProgramInfoLog(prog)||gl.getShaderInfoLog(vs)||gl.getShaderInfoLog(fs)||'?').slice(0,200),'err');}catch(e){}if(prev)return prev.apply(this,arguments);};}}catch(e){}
// ---- audio ----
try{const P=(window.BaseAudioContext||window.AudioContext||window.webkitAudioContext||{}).prototype;const dec=P&&P.decodeAudioData;if(dec)P.decodeAudioData=function(buf,ok,ko){const wk=ko?function(e){rep('AUDIO','Decodifica suono fallita: '+(e&&e.message||e),'err');return ko.apply(this,arguments);}:ko;const r=dec.call(this,buf,ok,wk);try{if(r&&r.catch)r.catch(e=>rep('AUDIO','Decodifica suono fallita: '+(e&&e.message||e),'err'));}catch(e){}return r;};}catch(e){}
try{const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){const r=pl.apply(this,arguments);try{if(r&&r.catch)r.catch(e=>rep('AUDIO','play() bloccato: '+(e&&e.name||'')+' '+String(this.currentSrc||'').split('/').pop(),'warn'));}catch(e){}return r;};}catch(e){}
let musWas=false;function audioChk(){const AU=G('AU'),MUS=G('MUS'),SET=G('SET'),gm=G('game');if(!AU||!AU.ctx)return;const st=AU.ctx.state,vis=document.visibilityState==='visible',muted=!!(SET&&SET.mute);
  if(st==='suspended'&&vis&&!muted){audioChk.sus=(audioChk.sus|0)+1;if(audioChk.sus===3)rep('AUDIO','AudioContext sospeso da 3s con app visibile (nessun suono)','warn');}else audioChk.sus=0;
  if(st==='closed')rep('AUDIO','AudioContext chiuso','err');
  const on=!!(MUS&&MUS.started&&MUS.g);if(musWas&&!on&&vis&&!muted&&gm&&gm.state==='play')rep('AUDIO','Musica fermata inaspettatamente durante la partita','warn');musWas=on;
  if((AU.v433|0)>=20){audioChk.sat=(audioChk.sat|0)+1;if(audioChk.sat===3)rep('AUDIO','Limite voci audio (20) saturo da 3s: suoni tagliati','warn');}else audioChk.sat=0;}
// ---- frame / FPS ----
let lastF=0,hid=0;document.addEventListener('visibilitychange',()=>{hid=now();lastF=0;});
function slowOk(){try{const gm=G('game');if(!gm||gm.state!=='play')return false;return R&&R.info.render.calls>=10;}catch(e){return false;}}
function snap(){const o={};try{o.calls=R.info.render.calls;o.tris=R.info.render.triangles;}catch(e){}try{const z=G('zombies');o.zombie=z?z.filter(q=>q.alive&&!q.dead).length:0;}catch(e){}try{o.stato=G('game').state;}catch(e){}return o;}
(function tick(t){requestAnimationFrame(tick);if(document.hidden)return;if(lastF&&now()-hid>1000){const d=t-lastF;S.frames++;if(d>S.worst)S.worst=d;if(d>50){S.slow++;if(d>100&&slowOk())rep('FPS','Frame lento >'+(d>500?500:d>250?250:100)+'ms',d>500?'err':'warn',Object.assign({ms:Math.round(d)},snap()));}}lastF=t;})(0);
try{if(window.PerformanceObserver&&(PerformanceObserver.supportedEntryTypes||[]).includes('longtask'))new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.duration>=150&&now()-hid>2000&&slowOk())rep('FPS','Long task JS >150ms (blocca il thread)','warn',{ms:Math.round(e.duration)});}).observe({entryTypes:['longtask']});}catch(e){}
let lowRun=0;function fpsChk(){S.fps=S.frames;const sl=S.slow;S.frames=0;S.slow=0;const gm=G('game');S.lastWorst=S.worst;S.worst=0;if(!gm||gm.state!=='play'){lowRun=0;return;}
  if(S.fps>0&&S.fps<25){lowRun++;if(lowRun===5)rep('FPS','FPS sotto 25 per 5s di fila',S.fps<15?'err':'warn',Object.assign({fps:S.fps,frameLenti:sl},snap()));}else lowRun=0;}
// ---- memoria (crescita costante = probabile leak) ----
const MH=[];let play0=0;function memChk(){try{{const gm=G('game');if(!gm||gm.state!=='play'){play0=0;MH.length=0;}else if(!play0)play0=now();}const m={geo:R.info.memory.geometries,tex:R.info.memory.textures,prog:(R.info.programs||[]).length,obj:0,heap:0};if(SC){let c=0;SC.traverse(()=>c++);m.obj=c;}if(performance.memory)m.heap=Math.round(performance.memory.usedJSHeapSize/1048576);
  S.mem=m;if(!play0||now()-play0<90000)return;MH.push(m);if(MH.length>61)MH.shift();if(MH.length<61)return;const a=MH[0];
  for(const [k,lab,min] of [['geo','geometrie',40],['tex','texture',15],['prog','programmi shader',8],['obj','oggetti scena',300],['heap','heap JS MB',60]]){let up=0;for(let i=1;i<MH.length;i+=6)if(MH[i][k]>=MH[i-1][k])up++;const h=MH[30];if(m[k]-a[k]>=min&&up>=9&&h[k]-a[k]>=min/2&&m[k]-h[k]>=min/2)rep('MEMORIA','Possibile memory leak: '+lab+' in crescita costante (+'+(m[k]-a[k])+' in 60s)','warn',{da:a[k],a:m[k]});}
  if(performance.memory&&performance.memory.jsHeapSizeLimit&&performance.memory.usedJSHeapSize>performance.memory.jsHeapSizeLimit*.85)rep('MEMORIA','Heap JS oltre l\'85% del limite','err');}catch(e){}}
// ---- mesh (scansione a rate limitato: max 400 oggetti per secondo) ----
let mq=[],mi=0;function meshChk(){if(!SC)return;if(mi>=mq.length){mq=[];SC.traverse(o=>{if(o.isMesh||o.isSkinnedMesh||o.isInstancedMesh)mq.push(o);});mi=0;}
  const end=Math.min(mq.length,mi+400);for(;mi<end;mi++){const o=mq[mi];try{const nm=(o.name||o.type)+(o.parent&&o.parent.name?' in '+o.parent.name:'');
    if(!o.geometry)rep('MESH','Mesh senza geometria: '+nm,'err');else{const p=o.geometry.attributes&&o.geometry.attributes.position;if(!p)rep('MESH','Geometria senza posizioni: '+nm,'err');
      const bs=o.geometry.boundingSphere;if(bs&&(!isFinite(bs.radius)||!isFinite(bs.center.x)))rep('MESH','Bounding sphere NaN (vertici rotti): '+nm,'err');}
    if(!o.material)rep('MESH','Mesh senza materiale: '+nm,'err');
    const q=o.position;if(!isFinite(q.x)||!isFinite(q.y)||!isFinite(q.z)||!isFinite(o.scale.x))rep('MESH','Posizione/scala NaN: '+nm,'err');}catch(e){}}}
// ---- fisica + sovrapposizioni zombie (economico) ----
const stuck=new WeakMap();function physChk(){const P=G('player'),Z=G('zombies'),gm=G('game');if(!gm||gm.state!=='play')return;
  try{if(P){const p=P.pos,v=P.vel;if(!isFinite(p.x+p.y+p.z))rep('FISICA','Posizione giocatore NaN','err');if(v&&!isFinite(v.x+v.y+v.z))rep('FISICA','Velocità giocatore NaN','err');if(p.y<-5)rep('FISICA','Giocatore caduto sotto il terreno (y='+p.y.toFixed(1)+')','err');}}catch(e){}
  if(!Z)return;const A=[];for(const z of Z){if(!z||!z.alive||z.dead||!z.g)continue;const q=z.g.position;A.push(z);
    if(!isFinite(q.x+q.y+q.z)){rep('FISICA','Zombie con posizione NaN','err');continue;}if(z.vel&&!isFinite(z.vel.x+z.vel.z))rep('FISICA','Zombie con velocità NaN','err');
    if(q.y<-3)rep('FISICA','Zombie caduto sotto il terreno','warn');
    const s=stuck.get(z);if(s&&Math.hypot(q.x-s.x,q.z-s.z)<.05&&P&&Math.hypot(q.x-P.pos.x,q.z-P.pos.z)>3){s.n++;if(s.n===8)rep('FISICA','Zombie bloccato fermo da 8s lontano dal giocatore','warn',{x:+q.x.toFixed(1),z:+q.z.toFixed(1)});}else stuck.set(z,{x:q.x,z:q.z,n:0});}
  let ov=0;for(let i=0;i<A.length&&i<40;i++)for(let j=i+1;j<A.length&&j<40;j++){const a=A[i].g.position,b=A[j].g.position;if(Math.abs(a.x-b.x)<.12&&Math.abs(a.z-b.z)<.12)ov++;}
  if(ov)rep('SOVRAPP','Zombie compenetrati nello stesso punto ('+ov+' coppie)','warn');}
// ---- loop periodico ~1s ----
setInterval(()=>{if(document.hidden)return;const t=now();for(const f of [fpsChk,audioChk,memChk,meshChk,physChk]){try{f();}catch(e){}}S.cost=+(now()-t).toFixed(2);if(S.cost>8)rep('FPS','Il debug stesso ha impiegato '+S.cost+'ms','info');},1000);
// ---- UI ----
const UI={cat:'ALL'};
function esc(s){return String(s).replace(/[<&>]/g,c=>({'<':'&lt;','&':'&amp;','>':'&gt;'})[c]);}
function list(){return S.order.map(k=>S.items[k]).filter(i=>UI.cat==='ALL'||i.cat===UI.cat).sort((a,b)=>b.last-a.last);}
function text(){const m=S.mem||{};return 'Zombie Survival debug '+(window.GAME_VER||'')+' · sessione '+fmt(now())+' · fps '+S.fps+' · geo '+m.geo+' tex '+m.tex+' prog '+m.prog+' obj '+m.obj+(m.heap?' heap '+m.heap+'MB':'')+'\n'+navigator.userAgent+'\n\n'+
  S.order.map(k=>S.items[k]).map(i=>'['+i.cat+'/'+i.sev+'] ×'+i.n+' ('+fmt(i.first)+'→'+fmt(i.last)+') '+i.msg+(i.x?' '+JSON.stringify(i.x):'')).join('\n');}
/* owner gate: same check as debug.js (Telegram id 7780175131 via WebApp initData or URL hash/search, or APK flag window.__ZS_OWNER) */
const OWNER=7780175131;function numId(v){const n=+v;return n>0&&n<1e16?n:null;}
function idIn(s){if(!s)return null;let q=String(s);for(let i=0;i<4;i++){const m=/"id"\s*:\s*"?(\d+)/.exec(q);if(m)return numId(m[1]);try{const d=decodeURIComponent(q);if(d===q)break;q=d;}catch(e){break;}}return null;}
function tgUser(){try{const W=window.Telegram&&window.Telegram.WebApp;if(!W)return null;const u=W.initDataUnsafe&&W.initDataUnsafe.user;const n=u&&numId(u.id);if(n)return n;return idIn(W.initData);}catch(e){return null;}}
function hashUser(){try{return idIn(location.hash)||idIn(location.search);}catch(e){return null;}}
function ownerNow(){if(window.__ZS_OWNER===1||window.__ZS_OWNER==='1')return true;const a=tgUser();if(a!==null)return a===OWNER;const h=hashUser();return h===null?null:h===OWNER;}
window.__DBGPRO={report:rep,text,state:S,cats:CAT,list:function(cat){UI.cat=cat||'ALL';return list();},clear:function(){S.items={};S.order=[];S.dirty=1;},isOwner:ownerNow};
rep('CONSOLE','Debug avviato (sessione pulita)','info');
})();
