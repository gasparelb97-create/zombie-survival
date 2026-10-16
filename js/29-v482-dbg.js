'use strict';
// ======================= v4.3.82 auto-diagnosi: crash, rallentamenti, sovrapposizioni, audio — sempre attiva, dedup, upload anonimo =======================
const DG={ev:[],spk:[],F:{},newF:[],shown:{},ver:String(window.GAME_VER||''),prog:0,an:0,anW:[],t0:performance.now(),wd:0,errN:0,up:0,lastUp:0};
function dgE(e,t){try{console.warn('dbg482',t,e&&e.message);}catch(x){}}
const DEV482=(()=>{try{const v=localStorage.getItem('zs_dev');if(v==='1')return true;if(v==='0')return false;return false;}catch(e){return false;}})();
const ANON482=(()=>{try{let a=localStorage.getItem('zs_anon482');if(!a){a='a'+Math.random().toString(36).slice(2,12);localStorage.setItem('zs_anon482',a);}return a;}catch(e){return 'a0';}})();
function dgEv(tag,info){try{const L=DG.ev;L.push({t:Math.round(performance.now()),tag,i:info==null?'':String(info).slice(0,60)});if(L.length>40)L.shift();}catch(e){}}
function dgScreen(){try{for(const id of ['gilda482','rep482','shopScreen','craftScreen','bagScreen','pauseScreen','helpScreen','chestScreen','arenaScreen']){const e=document.getElementById(id);if(e&&!e.classList.contains('hidden')&&e.offsetParent!==null)return id.replace(/Screen|482/,'');}
  return (typeof game!=='undefined'&&game.state==='play')?'partita':'menu';}catch(e){return '?';}}
// ---- fingerprints (persistent dedup) ----
const FP482=(()=>{try{return JSON.parse(localStorage.getItem('zs_dbgfp482')||'{}')||{};}catch(e){return {};}})();let fpDirty=0;
const SEV={info:0,warn:1,err:2};
function dgFind(type,loc,cause,text,sev,extra){try{const fp=(type+'|'+loc+'|'+cause).toLowerCase().replace(/\d+(\.\d+)?/g,'#').replace(/\s+/g,' ').slice(0,160);
  let f=DG.F[fp];if(!f){f=DG.F[fp]={fp,type,text,sev,n:0,first:Date.now(),x:extra||null};}f.n++;f.last=Date.now();f.text=text;if(SEV[sev]>SEV[f.sev])f.sev=sev;if(extra)f.x=extra;
  const h=FP482[fp];let isNew=false;if(!h){isNew=true;}else if(SEV[f.sev]>SEV[h.sev]||h.v!==DG.ver||(f.n+(h.n|0)>=Math.max(5,(h.sn|0)*2)&&!f.bump)){isNew=true;f.bump=1;}
  FP482[fp]=Object.assign(h||{first:Date.now()},{n:(h?h.n|0:0)+1,sev:f.sev,v:DG.ver,last:Date.now(),t:text.slice(0,140)});fpDirty=1;
  if(isNew&&!DG.newF.includes(f))DG.newF.push(f);
  try{if(window.__DBG&&__DBG.prob)__DBG.prob(sev,'auto482',text.slice(0,200));}catch(e){}
  if(type==='CRASH'||type==='BLOCCO')dgSoon(8000);}catch(e){dgE(e,'find');}}
setInterval(()=>{if(!fpDirty)return;fpDirty=0;try{const k=Object.keys(FP482);if(k.length>300){k.sort((a,b)=>(FP482[a].last|0)-(FP482[b].last|0)).slice(0,k.length-300).forEach(x=>delete FP482[x]);}localStorage.setItem('zs_dbgfp482',JSON.stringify(FP482));}catch(e){}},5000);
// ---- event hooks (cheap wrappers) ----
const HOOK={hurt:'colpito da zombie',damagePiece:'danno alla base',removePiece:'pezzo base distrutto',renderThumbs:'render miniature armi',thumbs43:'render miniature armi',thumbOne422:'render miniatura',preview43:'anteprima 3D arma',
  openShop:'apre negozio',openCraft:'apre crafting',openBag:'apre zaino',pauseGame:'pausa',showMenu:'torna al menu',startGame:'inizio partita',equip:'cambio arma',gOpen482:'apre gilda',killZombie:'uccide zombie',
  musicStart:'avvia musica',ambStart:'avvia ambiente',svSave:'salvataggio',bossIntro:'arriva il boss',enterPhase:'cambio fase giorno',placeBuild:'costruisce',gearPick:'raccoglie equip',craft:'crafting arma'};
for(const k in HOOK){try{const f=window[k];if(typeof f!=='function')continue;const lab=HOOK[k],th=/miniatur|anteprima/.test(HOOK[k]);window[k]=function(){if(!th||typeof game==='undefined'||game.state==='menu'||game.state==='shop')dgEv(lab,k==='equip'&&typeof WEAPONS!=='undefined'&&WEAPONS[arguments[0]]?WEAPONS[arguments[0]].id:'');return f.apply(this,arguments);};}catch(e){}}
// audio node creation counter (+ sampled caller attribution: 1 in 64)
const AUSRC={};function dgAuSrc(){try{const st=String(new Error().stack||'').split('\n');for(let i=2;i<st.length;i++){const m=st[i].match(/at ([\w$.]+) \(?[^()]*\/([\w.-]+\.js)/)||st[i].match(/([\w$]+)@[^@]*\/([\w.-]+\.js)/);if(m&&!/29-v482-dbg/.test(m[2])){const k=m[2]+':'+m[1];AUSRC[k]=(AUSRC[k]||0)+1;break;}}}catch(e){}}
function dgAuTop(){const k=Object.keys(AUSRC).sort((a,b)=>AUSRC[b]-AUSRC[a]).slice(0,3);return k.map(x=>x+' ×'+AUSRC[x]*64).join(', ');}
try{const P=(window.BaseAudioContext||window.AudioContext||window.webkitAudioContext).prototype;for(const m of ['createGain','createOscillator','createBufferSource','createBiquadFilter','createConvolver','createWaveShaper','createStereoPanner','createDynamicsCompressor','createPanner']){const o=P[m];if(typeof o!=='function')continue;P[m]=function(){if(window.OfflineAudioContext&&this instanceof OfflineAudioContext){DG.anOff=(DG.anOff|0)+1;return o.apply(this,arguments);}DG.an++;if((DG.an&63)===0)dgAuSrc();return o.apply(this,arguments);};}
  const dec=P.decodeAudioData;if(dec)P.decodeAudioData=function(){const r=dec.apply(this,arguments);try{if(r&&r.catch)r.catch(e=>dgFind('AUDIO','decode','errore decodifica','AUDIO: errore di decodifica di un suono ('+String(e&&e.message||e).slice(0,60)+')','warn'));}catch(e){}return r;};}catch(e){dgE(e,'au');}
// ---- performance: frame spikes with cause attribution ----
function dgCause(dProg,dAn,since){const E=DG.ev.filter(e=>e.t>=since);const has=r=>E.some(e=>r.test(e.tag));
  if(dProg>0)return ['compilazione shader ('+dProg+' nuovi)','shader'];if(has(/miniatur|anteprima/))return ['render miniature armi','miniature'];
  if(dAn>120)return ['creazione di '+dAn+' nodi audio','audio'];if(has(/base/))return ['danni/distruzione base','base'];if(has(/salvataggio/))return ['salvataggio','salvataggio'];
  if(has(/costruisce/))return ['piazzamento costruzione','costruzione'];if(has(/negozio|zaino|crafting|gilda|menu|pausa/))return ['apertura menu','menu'];return ['lavoro JS o GC','js'];}
function dgSpike(ms,kind){try{const now=performance.now(),since=now-ms-1500;let prog=0;try{prog=renderer.info.programs?renderer.info.programs.length:0;}catch(e){}
  const dProg=Math.max(0,prog-DG.prog);DG.prog=prog;const dAn=DG.an-(DG.anF||0);const [cause,key]=dgCause(dProg,dAn,since);
  const E=DG.ev.filter(e=>e.t>=since).slice(-4).map(e=>e.tag+(e.i?' '+e.i:''));const ev=E.length?E[E.length-1]:dgScreen();
  const sp={t:Math.round(now/1000),ms:Math.round(ms),k:kind,causa:cause,durante:E,schermata:dgScreen(),zombie:(typeof zombies!=='undefined'?zombies.filter(z=>z.alive&&!z.dead).length:0)};DG.spk.push(sp);if(DG.spk.length>30)DG.spk.shift();
  if(ms>=100)dgFind('RALLENTAMENTO',key,cause,'RALLENTAMENTO: '+cause+' '+(ms/1000).toFixed(1)+'s durante '+ev,ms>=1000?'err':'warn',sp);}catch(e){dgE(e,'spk');}}
let dgHidT=0;document.addEventListener('visibilitychange',()=>{dgHidT=performance.now();});addEventListener('pagehide',()=>{dgHidT=performance.now();});addEventListener('focus',()=>{dgHidT=performance.now();});
try{const _l0=loop0;let last=0;loop0=function(now){const t=performance.now();if(last){const gap=t-last;if(gap>400&&!document.hidden&&t-dgHidT>gap+800)dgSpike(gap,'pausa tra frame');}
  DG.fc=(DG.fc|0)+1;let r;try{r=_l0.apply(this,arguments);}finally{const e=performance.now();last=e;const d=e-t;if(d>100)dgSpike(d,'frame');DG.anF=DG.an;try{const p=renderer.info.programs?renderer.info.programs.length:0;if(p>DG.prog&&d<=100){DG.prog=p;dgEv('compila shader',p);}}catch(x){}}return r;};}catch(e){dgE(e,'loop');}
try{if(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes&&PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver(l=>{for(const en of l.getEntries())if(en.duration>=250&&!document.hidden&&performance.now()-dgHidT>en.duration+800)dgSpike(en.duration,'longtask');}).observe({type:'longtask'});}catch(e){}
// ---- crashes ----
function dgWhere(stack,file,line){let s=String(stack||'');const m=s.match(/at ([\w$.<>]+) \(?[^()]*\/([\w.-]+\.js)[^:]*:(\d+)/)||s.match(/([\w$]+)@[^@]*\/([\w.-]+\.js)[^:]*:(\d+)/);
  if(m)return m[2]+':'+m[1]+' (riga '+m[3]+')';return (file?String(file).split('/').pop().split('?')[0]:'?')+(line?':'+line:'');}
function dgCrash(msg,stack,file,line,kind){const w=dgWhere(stack,file,line);const ev=DG.ev.slice(-20).map(e=>e.tag+(e.i?' '+e.i:''));
  dgFind('CRASH',w,String(msg).replace(/['"][^'"]{0,40}['"]/g,'"…"').slice(0,80),'CRASH in '+w+' — '+String(msg).slice(0,140)+(ev.length?' (dopo: '+ev.slice(-2).join(', ')+')':''),'err',{msg:String(msg).slice(0,300),stack:String(stack||'').slice(0,600),eventi:ev,tipo:kind,schermata:dgScreen()});
  try{localStorage.setItem('zs_dbgpend482','1');}catch(e){}}
addEventListener('error',e=>{try{if(e&&e.target&&e.target!==window&&(e.target.src||e.target.href))return;dgCrash(e.message||'errore',e.error&&e.error.stack,e.filename,e.lineno,'onerror');}catch(x){}},true);
addEventListener('unhandledrejection',e=>{try{const r=e&&e.reason;dgCrash('promise: '+(r&&r.message||r),r&&r.stack,'','','promise');}catch(x){}});
try{renderer.domElement.addEventListener('webglcontextlost',()=>dgFind('CRASH','webgl','contesto perso','CRASH grafico: contesto WebGL perso durante '+((DG.ev[DG.ev.length-1]||{}).tag||dgScreen())+' (memoria GPU?)','err'),false);}catch(e){}
setInterval(()=>{try{if(typeof L4310==='undefined')return;if(L4310.restarts>DG.wd){const n=L4310.restarts-DG.wd;DG.wd=L4310.restarts;const ev=DG.ev.slice(-3).map(e=>e.tag);
    dgFind('BLOCCO','loop','watchdog','BLOCCO: il gioco si è fermato e il watchdog l\'ha riavviato ('+n+'x) durante '+(ev.length?ev.join(', '):dgScreen()),'err',{eventi:DG.ev.slice(-20),spike:DG.spk.slice(-3)});try{localStorage.setItem('zs_dbgpend482','1');}catch(e){}}
  const E=L4310.errs||[];if(DG.errN>E.length)DG.errN=E.length;for(let i=DG.errN;i<E.length;i++){const x=E[i];if(x&&x.dove!=='window.onerror'&&x.dove!=='promise')dgCrash(x.msg,x.stack,'','', 'loop:'+x.dove);}DG.errN=E.length;}catch(e){}},1000);
// ---- UI: covered / clipped buttons, clipped prices, unwanted scrolling (open screens only, ~2.5 s) ----
function dgName(el){if(!el)return '?';if(el.id)return '#'+el.id;const t=(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,18);return el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')+(t?' "'+t+'"':'');}
const NOSCROLL482=['bagScreen','craftScreen','gilda482','rep482','pauseScreen'];
function dgUI(){try{const scr=dgScreen();let roots=[];for(const id of ['gilda482','rep482','shopScreen','craftScreen','bagScreen','pauseScreen','helpScreen']){const e=document.getElementById(id);if(e&&!e.classList.contains('hidden')&&e.offsetParent!==null)roots.push(e);}
  if(!roots.length&&typeof game!=='undefined'&&game.state==='menu'){const s=document.getElementById('startScreen');if(s&&!s.classList.contains('hidden'))roots.push(s);}
  if(!roots.length)return;const W=innerWidth,H=innerHeight;let n=0;
  const lay=el=>{let x=el;while(x&&x.parentElement&&x.parentElement!==document.body)x=x.parentElement;return x;};
  const topL=lay(document.elementFromPoint(W/2,H/2)||document.body);roots=roots.filter(R=>lay(R)===topL||R.contains(topL)||topL===document.body);if(!roots.length)return;
  for(const R of roots){const bs=R.querySelectorAll('button');for(const b of bs){if(++n>80)break;if(b.offsetParent===null)continue;const r=b.getBoundingClientRect();if(r.width<4||r.height<4)continue;
      if(r.right<2||r.bottom<2||r.left>W-2||r.top>H-2)continue; // hidden by paging
      if(r.left<-2||r.top<-2||r.right>W+2||r.bottom>H+2){dgFind('SOVRAPPOSIZIONE','fuori:'+dgName(b),scr,'SOVRAPPOSIZIONE: '+dgName(b)+' è tagliato fuori dallo schermo in '+scr,'warn');continue;}
      const cx=r.left+r.width/2,cy=r.top+r.height/2,top=document.elementFromPoint(cx,cy);
      if(top&&top!==b&&!b.contains(top)&&!top.contains(b)){const tb=top.closest('button,[id]');if(tb&&tb!==b&&!b.contains(tb)&&lay(tb)===lay(b)&&R.contains(tb))dgFind('SOVRAPPOSIZIONE',dgName(tb)+'>'+dgName(b),scr,'SOVRAPPOSIZIONE: '+dgName(tb)+' copre '+dgName(b)+' in '+scr,'warn');}}
    for(const c of R.querySelectorAll('.scard')){const cr=c.getBoundingClientRect(),p=c.querySelector('.sbtns');if(!p||cr.height<4)continue;const pr=p.getBoundingClientRect();if(pr.bottom>cr.bottom+1||pr.height<6)dgFind('SOVRAPPOSIZIONE','prezzo:'+(c.querySelector('.sname')||{}).textContent,scr,'SOVRAPPOSIZIONE: prezzo/pulsante tagliato nella carta "'+((c.querySelector('.sname')||{}).textContent||'?')+'" in '+scr,'warn');}
    if(NOSCROLL482.includes(R.id)){for(const el of R.querySelectorAll('div,section,ul')){if(el.scrollHeight>el.clientHeight+4&&el.clientHeight>20){const oy=getComputedStyle(el).overflowY;if(oy==='auto'||oy==='scroll')dgFind('SOVRAPPOSIZIONE','scroll:'+dgName(el),scr,'SCORRIMENTO: '+dgName(el)+' scorre in '+scr+' (deve stare fisso)','warn');}}}}}catch(e){dgE(e,'ui');}}
setInterval(()=>{if(document.visibilityState==='visible')dgUI();},2500);
// ---- audio: clipping, node bursts, latency ----
const DA={an:null,buf:null,lat:0,n0:0};
setInterval(()=>{try{if(typeof AU==='undefined'||!AU.ctx)return;const c=AU.ctx;
  if(!DA.an&&AU.master){DA.an=c.createAnalyser();DA.an.fftSize=512;DA.buf=new Float32Array(512);AU.master.connect(DA.an);}
  if(DA.an&&c.state==='running'){DA.an.getFloatTimeDomainData(DA.buf);let pk=0;for(let i=0;i<DA.buf.length;i++){const v=Math.abs(DA.buf[i]);if(v>pk)pk=v;}if(pk>=.99)dgFind('AUDIO','clip',dgScreen(),'AUDIO: distorsione (clipping, picco '+pk.toFixed(2)+') durante '+((DG.ev[DG.ev.length-1]||{}).tag||dgScreen()),'warn');}
  const d=DG.an-DA.n0;DA.n0=DG.an;if(d>160){const src=dgAuTop();dgFind('AUDIO','nodi',src.split(' ')[0]||'','AUDIO: '+d+' nodi audio creati in 1 s, da '+(src||'?')+' (durante '+((DG.ev[DG.ev.length-1]||{}).tag||dgScreen())+')','warn',{fonti:src});}for(const k in AUSRC)AUSRC[k]=AUSRC[k]>>1;
  if(!DA.lat){const L=(c.outputLatency||0)+(c.baseLatency||0);if(L>0){DA.lat=1;if(L>.12)dgFind('AUDIO','latenza','bt','AUDIO: latenza alta '+Math.round(L*1000)+' ms (cuffie Bluetooth?)','info');}}
  try{const m=window.__mus436&&__mus436.rep&&__mus436.rep();if(m&&(m.playing>1||m.attivi>1||m.themes>1))dgFind('AUDIO','temi','musica','AUDIO: due temi musicali suonano insieme','warn');}catch(e){}}catch(e){dgE(e,'audio');}},1000);
// ---- extended report (merged into js/debug.js report() as ext482) ----
function dgFindList(all){const L=all?Object.values(DG.F):DG.newF;return L.slice().sort((a,b)=>SEV[b.sev]-SEV[a.sev]||b.n-a.n).slice(0,40).map(f=>({testo:f.text,tipo:f.type,liv:f.sev,volte:f.n,fp:f.fp,dati:f.x}));}
window.__dbgFC482=()=>DG.fc|0;
window.__dbg482x=function(){return {diagnosi:dgFindList(true),nuovi:DG.newF.length,spike:DG.spk.slice(-15),eventi:DG.ev.slice(-20),nodiAudio:DG.an,shader:DG.prog,dev:DEV482,storicoProblemi:Object.keys(FP482).length};};
function dgCauseTxt(m){m=String(m||'');
  if(/^CRASH in ([^ ]+)/.test(m))return ['eccezione JavaScript',m.match(/^CRASH in ([^—]+)/)[1].trim()];
  if(/CRASH grafico/.test(m))return ['contesto WebGL perso (memoria GPU)','qualità grafica / texture troppo grandi'];
  if(/^BLOCCO/.test(m))return ['loop fermo, riavviato dal watchdog','vedi eventi prima del blocco (spike)'];
  if(/compilazione shader/.test(m))return ['shader compilati durante il gioco','precompilare dietro il caricamento (js/28-v482.js __pc482, js/32-v482-load.js)'];
  if(/miniature/.test(m))return ['render miniature armi','guardia miniature in js/28-v482.js'];
  if(/nodi audio/.test(m))return ['troppi nodi audio creati','sorgente indicata dopo "da" (riusare/limitare i suoni)'];
  if(/lavoro JS o GC/.test(m))return ['allocazioni/garbage collection o JS lento','sistemi per-frame (sistemi: ai/fisica/hud)'];
  if(/RALLENTAMENTO/.test(m))return ['frame lento','azione indicata dopo "durante"'];
  if(/^SOVRAPPOSIZIONE|^SCORRIMENTO/.test(m))return ['layout CSS','elemento indicato (js/28-v482.js CSS v482fix)'];
  if(/clipping/.test(m))return ['volume master troppo alto','compressore AU.master (js/27-v481.js)'];
  if(/latenza/.test(m))return ['cuffie Bluetooth','nessuna correzione nel codice'];
  if(/^AUDIO/.test(m))return ['problema audio','js/01-audio-fx.js'];return null;}
window.__dbg482={cause:dgCauseTxt,find:dgFind,list:dgFindList,ev:dgEv,ui:dgUI};
// ---- auto upload (anonimo, silenzioso) ----
function dgSoon(ms){clearTimeout(DG.upT);DG.upT=setTimeout(dgUpload,ms||3000);}
function dgUpload(reason){try{const nw=DG.newF.filter(f=>!f.sent);const pend=localStorage.getItem('zs_dbgpend482')==='1';if(!nw.length&&!pend)return;
  if(Date.now()-DG.lastUp<1800000){dgSoon(1805000-(Date.now()-DG.lastUp));return;}if(typeof ZS_API==='undefined'||!ZS_API)return;DG.lastUp=Date.now();
  let rep=null;try{rep=window.__DBG&&__DBG.report?__DBG.report():null;}catch(e){}
  if(rep){delete rep.lettura;try{if(rep.device){delete rep.device.tg;delete rep.device.user;}}catch(e){}}
  const body={anon:ANON482,ver:DG.ver,apk:!!window.__zsApk,dev:DEV482,motivo:reason||(pend?'dopo crash/riavvio':'nuovi problemi'),findings:nw.slice(0,30).map(f=>({fp:f.fp,tipo:f.type,liv:f.sev,testo:f.text,volte:f.n,dati:f.x})),report:rep};
  let s=JSON.stringify(body);if(s.length>60000){body.report={troncato:true,perf:rep&&rep.perf,ext482:rep&&rep.ext482,crash:rep&&rep.crash,errori:rep&&rep.errori,device:rep&&rep.device};s=JSON.stringify(body);if(s.length>60000){body.report=null;s=JSON.stringify(body).slice(0,60000);}}
  const ctl=window.AbortController?new AbortController():null;const to=setTimeout(()=>{try{ctl&&ctl.abort();}catch(e){}},8000);
  fetch(ZS_API+'/debug',{method:'POST',headers:{'content-type':'application/json'},body:s,signal:ctl?ctl.signal:undefined}).then(r=>{clearTimeout(to);if(r.ok){nw.forEach(f=>{f.sent=1;const h=FP482[f.fp];if(h){h.sn=h.n;fpDirty=1;}});try{localStorage.removeItem('zs_dbgpend482');}catch(e){}}}).catch(()=>clearTimeout(to));}catch(e){dgE(e,'up');}}
// pending crash from previous session → upload soon after launch (FP history marks it as already-known except pending flag)
setTimeout(()=>{try{if(localStorage.getItem('zs_dbgpend482')==='1')dgUpload('dopo crash/riavvio');}catch(e){}},12000);
// ---- dev summary on return to menu / match end ----
function dgSummary(){try{if(true)return;/* 4.3.88 disabled */const L=DG.newF.filter(f=>!DG.shown[f.fp]);if(!L.length)return;L.forEach(f=>DG.shown[f.fp]=1);
  let p=document.getElementById('dg482');if(!p){p=document.createElement('div');p.id='dg482';document.body.appendChild(p);
    const st=document.createElement('style');st.textContent='#dg482{position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:99990;width:min(560px,92vw);max-height:calc(100vh - 16px);overflow:hidden;background:rgba(14,10,20,.96);border:2px solid #ff9a2a;border-radius:12px;color:#eee;font:12px/1.35 system-ui,sans-serif;padding:8px 10px;box-shadow:0 6px 24px #000a}#dg482 h4{margin:0 0 5px;font-size:13px;color:#ffb35a;display:flex;justify-content:space-between;align-items:center}#dg482 h4 button{background:#ff9a2a;border:0;border-radius:7px;color:#111;font-weight:700;padding:4px 10px}#dg482 li{margin:2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#dg482 ul{margin:0;padding-left:16px}#dg482 .e{color:#ff6b6b}#dg482 .w{color:#ffd166}#dg482 .i{color:#9ad0ff}';document.head.appendChild(st);}
  const sh=L.slice().sort((a,b)=>SEV[b.sev]-SEV[a.sev]).slice(0,7);
  p.innerHTML='<h4><span>DIAGNOSI DEBUG — solo sviluppatore ('+L.length+' nuovi)</span><button type="button">Chiudi</button></h4><ul>'+sh.map(f=>'<li class="'+(f.sev==='err'?'e':f.sev==='warn'?'w':'i')+'">'+f.text.replace(/[<&]/g,c=>c==='<'?'&lt;':'&amp;')+(f.n>1?' ×'+f.n:'')+'</li>').join('')+(L.length>7?'<li>…e altri '+(L.length-7)+' (inviati al server)</li>':'')+'</ul>';
  p.style.display='block';p.querySelector('button').onclick=()=>{p.style.display='none';};}catch(e){dgE(e,'sum');}}
for(const k of ['showMenu','gameOver','svGameOver']){try{const f=window[k];if(typeof f!=='function')continue;window[k]=function(){const r=f.apply(this,arguments);setTimeout(()=>{dgSummary();dgUpload(k==='showMenu'?'ritorno al menu':'fine partita');},600);return r;};}catch(e){}}
// attach last findings to the anonymous /report form
try{const rm=window.repMeta482;if(typeof rm==='function')window.repMeta482=function(){const m=rm.apply(this,arguments)||{};try{m.diagnosi=dgFindList(true).slice(0,12).map(f=>f.testo+' ×'+f.volte).join('\n').slice(0,1500);}catch(e){}return m;};}catch(e){}
