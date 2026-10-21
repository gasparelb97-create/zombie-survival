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
function snap(){const o={};try{o.calls=R.info.render.calls;o.tris=R.info.render.triangles;}catch(e){}try{const z=G('zombies');o.zombie=z?z.filter(q=>q.alive&&!q.dead).length:0;}catch(e){}try{o.stato=G('game').state;}catch(e){}return o;}
(function tick(t){requestAnimationFrame(tick);if(document.hidden)return;if(lastF&&now()-hid>1000){const d=t-lastF;S.frames++;if(d>S.worst)S.worst=d;if(d>50){S.slow++;if(d>100)rep('FPS','Frame lento >'+(d>500?500:d>250?250:100)+'ms',d>500?'err':'warn',Object.assign({ms:Math.round(d)},snap()));}}lastF=t;})(0);
try{if(window.PerformanceObserver&&(PerformanceObserver.supportedEntryTypes||[]).includes('longtask'))new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.duration>=150&&now()-hid>2000)rep('FPS','Long task JS >150ms (blocca il thread)','warn',{ms:Math.round(e.duration)});}).observe({entryTypes:['longtask']});}catch(e){}
let lowRun=0;function fpsChk(){S.fps=S.frames;const sl=S.slow;S.frames=0;S.slow=0;const gm=G('game');S.lastWorst=S.worst;S.worst=0;if(!gm||gm.state!=='play'){lowRun=0;return;}
  if(S.fps>0&&S.fps<25){lowRun++;if(lowRun===5)rep('FPS','FPS sotto 25 per 5s di fila',S.fps<15?'err':'warn',Object.assign({fps:S.fps,frameLenti:sl},snap()));}else lowRun=0;}
// ---- memoria (crescita costante = probabile leak) ----
const MH=[];function memChk(){try{const m={geo:R.info.memory.geometries,tex:R.info.memory.textures,prog:(R.info.programs||[]).length,obj:0,heap:0};if(SC){let c=0;SC.traverse(()=>c++);m.obj=c;}if(performance.memory)m.heap=Math.round(performance.memory.usedJSHeapSize/1048576);
  S.mem=m;MH.push(m);if(MH.length>61)MH.shift();if(MH.length<61)return;const a=MH[0];
  for(const [k,lab,min] of [['geo','geometrie',40],['tex','texture',15],['prog','programmi shader',8],['obj','oggetti scena',300],['heap','heap JS MB',60]]){let up=0;for(let i=1;i<MH.length;i+=6)if(MH[i][k]>=MH[i-1][k])up++;if(m[k]-a[k]>=min&&up>=9)rep('MEMORIA','Possibile memory leak: '+lab+' in crescita costante (+'+(m[k]-a[k])+' in 60s)','warn',{da:a[k],a:m[k]});}
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
setInterval(()=>{if(document.hidden)return;const t=now();for(const f of [fpsChk,audioChk,memChk,meshChk,physChk]){try{f();}catch(e){}}S.cost=+(now()-t).toFixed(2);if(S.cost>8)rep('FPS','Il debug stesso ha impiegato '+S.cost+'ms','info');if(UI.open)draw();else badge();},1000);
// ---- UI ----
const UI={open:false,cat:'ALL'};let btn,pan;
function esc(s){return String(s).replace(/[<&>]/g,c=>({'<':'&lt;','&':'&amp;','>':'&gt;'})[c]);}
function list(){return S.order.map(k=>S.items[k]).filter(i=>UI.cat==='ALL'||i.cat===UI.cat).sort((a,b)=>b.last-a.last);}
function badge(){if(!btn)return;const e=S.order.filter(k=>S.items[k].sev==='err').length;btn.textContent='🐞'+(S.order.length?S.order.length:'');btn.style.background=e?'rgba(170,20,20,.85)':S.order.length?'rgba(170,110,0,.8)':'rgba(0,0,0,.45)';}
function text(){const m=S.mem||{};return 'Zombie Survival debug '+(window.GAME_VER||'')+' · sessione '+fmt(now())+' · fps '+S.fps+' · geo '+m.geo+' tex '+m.tex+' prog '+m.prog+' obj '+m.obj+(m.heap?' heap '+m.heap+'MB':'')+'\n'+navigator.userAgent+'\n\n'+
  S.order.map(k=>S.items[k]).map(i=>'['+i.cat+'/'+i.sev+'] ×'+i.n+' ('+fmt(i.first)+'→'+fmt(i.last)+') '+i.msg+(i.x?' '+JSON.stringify(i.x):'')).join('\n');}
function draw(){badge();if(!pan||!UI.open||!S.dirty&&draw.c===UI.cat)return;S.dirty=0;draw.c=UI.cat;const m=S.mem||{};const cnt={};S.order.forEach(k=>{const c=S.items[k].cat;cnt[c]=(cnt[c]||0)+1;});
  pan.querySelector('.dp-st').textContent='FPS '+S.fps+' · peggior frame '+Math.round(S.lastWorst||0)+'ms · geo '+(m.geo|0)+' · tex '+(m.tex|0)+' · shader '+(m.prog|0)+' · oggetti '+(m.obj|0)+(m.heap?' · heap '+m.heap+'MB':'')+' · costo debug '+(S.cost||0)+'ms';
  pan.querySelector('.dp-cat').innerHTML=['ALL'].concat(Object.keys(CAT)).map(c=>'<button data-c="'+c+'" class="'+(UI.cat===c?'on':'')+'">'+(c==='ALL'?'Tutti ('+S.order.length+')':CAT[c]+' ('+(cnt[c]|0)+')')+'</button>').join('');
  const L=list().slice(0,150);pan.querySelector('.dp-l').innerHTML=L.length?L.map(i=>'<li class="'+i.sev+'"><b>×'+i.n+'</b> '+esc(i.msg)+'<small>'+esc(CAT[i.cat]||i.cat)+' · prima '+fmt(i.first)+' · ultima '+fmt(i.last)+'</small></li>').join(''):'<li class="info">Nessun problema in questa sessione ✔</li>';}
function build(){const st=document.createElement('style');st.textContent='#dpBtn{position:fixed;right:6px;bottom:calc(6px + env(safe-area-inset-bottom));z-index:2147483000;font:12px sans-serif;color:#fff;border:1px solid #fff5;border-radius:14px;padding:3px 7px;opacity:.75;touch-action:manipulation}'+
  '#dpPan{position:fixed;right:6px;bottom:40px;width:min(460px,94vw);max-height:60vh;z-index:2147483000;background:rgba(12,10,18,.94);color:#ddd;font:11px/1.35 monospace;border:1px solid #ff9a2a;border-radius:10px;display:none;flex-direction:column}'+
  '#dpPan .dp-h{display:flex;gap:4px;padding:5px;align-items:center}#dpPan .dp-h b{flex:1;color:#ff9a2a}#dpPan button{font:11px sans-serif;background:#2a2433;color:#eee;border:1px solid #555;border-radius:6px;padding:2px 6px}#dpPan button.on{background:#ff9a2a;color:#000}'+
  '#dpPan .dp-st{padding:0 6px 4px;color:#9cf}#dpPan .dp-cat{display:flex;flex-wrap:wrap;gap:3px;padding:0 5px 4px}#dpPan .dp-l{list-style:none;margin:0;padding:0 6px 6px;overflow:auto;flex:1}#dpPan li{border-left:3px solid #888;padding:2px 5px;margin:2px 0;word-break:break-word}#dpPan li.err{border-color:#f44}#dpPan li.warn{border-color:#fb0}#dpPan small{display:block;color:#888}';
  document.head.appendChild(st);btn=document.createElement('button');btn.id='dpBtn';btn.type='button';pan=document.createElement('div');pan.id='dpPan';
  pan.innerHTML='<div class="dp-h"><b>DEBUG · sessione attuale</b><button data-a="copy">Copia</button><button data-a="exp">Esporta</button><button data-a="clr">Svuota</button><button data-a="x">✕</button></div><div class="dp-st"></div><div class="dp-cat"></div><ul class="dp-l"></ul>';
  ['pointerdown','touchstart','mousedown','click'].forEach(ev=>{btn.addEventListener(ev,e=>e.stopPropagation(),{passive:true});pan.addEventListener(ev,e=>e.stopPropagation(),{passive:true});});
  btn.addEventListener('click',()=>{UI.open=!UI.open;pan.style.display=UI.open?'flex':'none';S.dirty=1;draw();});
  pan.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.c){UI.cat=b.dataset.c;S.dirty=1;draw();return;}const a=b.dataset.a;
    if(a==='x'){UI.open=false;pan.style.display='none';}else if(a==='clr'){S.items={};S.order=[];S.dirty=1;draw();}
    else if(a==='copy'){const s=text();(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(s):Promise.reject()).then(()=>{b.textContent='Copiato ✔';},()=>{const ta=document.createElement('textarea');ta.value=s;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');b.textContent='Copiato ✔';}catch(x){}ta.remove();});setTimeout(()=>b.textContent='Copia',1500);}
    else if(a==='exp'){try{const N=window.ZSNative;const s=text();if(N&&N.share)N.share(s);else{const u=URL.createObjectURL(new Blob([s],{type:'text/plain'}));const l=document.createElement('a');l.href=u;l.download='zs-debug-'+Date.now()+'.txt';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);}}catch(x){}}});
  document.body.appendChild(pan);document.body.appendChild(btn);badge();}
if(document.body)build();else addEventListener('DOMContentLoaded',build);
window.__DBGPRO={report:rep,text,state:S,open:()=>{if(btn)btn.click();}};
rep('CONSOLE','Debug avviato (sessione pulita)','info');
})();
