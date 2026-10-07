/* Zombie Survival — PRIVATE debug overlay (owner only).
 * Self-contained. Load as its own <script> BEFORE the game script (after three.js is fine).
 * Non-owners: one regex on location.hash + one property read, then return. No hooks, no timers, no per-frame work.
 * Owner (Telegram user id 7780175131): exposes window.__DBG, wraps requestAnimationFrame, renderer.render,
 * console.error/warn, error/unhandledrejection, AudioScheduledSourceNode.start, and draws a 🐞 overlay.
 */
(function(){
'use strict';
var OWNER=7780175131,VER='dbg-2.1';try{(window.__boot432=window.__boot432||{}).three=performance.now();}catch(e){}
// ---------------- gating ----------------
function numId(v){var n=+v;return n>0&&n<1e16?n:null;}
function idIn(s){if(!s)return null;var q=String(s);for(var i=0;i<4;i++){var m=/"id"\s*:\s*"?(\d+)/.exec(q);if(m)return numId(m[1]);try{var d=decodeURIComponent(q);if(d===q)break;q=d;}catch(e){break;}}return null;}
function tgUser(){try{var W=window.Telegram&&window.Telegram.WebApp;if(!W)return null;var u=W.initDataUnsafe&&W.initDataUnsafe.user;var n=u&&numId(u.id);if(n)return n;return idIn(W.initData);}catch(e){return null;}}
function hashUser(){try{return idIn(location.hash)||idIn(location.search);}catch(e){return null;}}
// true = owner, false = someone else, null = Telegram has not delivered the id yet
function ownerNow(){var a=tgUser();if(a!==null)return a===OWNER;var h=hashUser();return h===null?null:h===OWNER;}
function apkOwner(){return window.__ZS_OWNER===1||window.__ZS_OWNER==='1';}
if(ownerNow()===false&&!apkOwner())return;
if(apkOwner()||ownerNow()===true)bootDbg();
else{var nWait=0,wIv=setInterval(function(){var o=ownerNow();if(o===true||apkOwner()){clearInterval(wIv);bootDbg();}else if(o===false||++nWait>80)clearInterval(wIv);},200);}
function bootDbg(){
if(window.__DBG)return;
var early=tgUser(),hid=hashUser();
var confirmed=early===OWNER;
var LS={get:function(k){try{return localStorage.getItem(k);}catch(e){return null;}},set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
var urlDbg=/[?&#]dbg(=1|=on|=open)?(\b|$)/.test(location.search+location.hash);
var now=function(){return performance.now();};
var T0=Date.now();
// ---------------- state ----------------
var D={frames:new Float32Array(120),cpu:new Float32Array(120),rnd:new Float32Array(120),fi:0,fn:0,lastTs:0,curTs:-1,curCpu:0,curRnd:0,
  worst:0,worstAt:0,long50:0,long100:0,total:0,start:now(),fpsN:0,fpsT:0,fps:0,
  calls:0,tris:0,pts:0,lines:0,rcalls:0,lastInfo:{calls:0,tris:0},
  sys:{},sysAcc:{},stack:[],errors:[],heap:[],aSrc:0,aSrcPeak:0,aNodes:0,ctxLost:0,extRender:0,extRenderMs:0,inRaf:0,longTasks:0,longTaskMs:0};
var SYS=['ai','fisica','audio','hud','fx','mondo'];SYS.forEach(function(k){D.sys[k]=0;D.sysAcc[k]=0;});
var CAT={updateZombie:'ai',svTarget:'ai',svNoise:'ai',keepOut:'fisica',collide:'fisica',losBlocked:'fisica',musicUpdate:'audio',ambUpdate:'audio',footstep:'audio',play:'audio',gun:'audio',groan:'audio',
  updateHUD:'hud',hud41:'hud',hud4:'hud',wiUpdate:'hud',svClockHUD:'hud',drawRadar:'hud',updateNums:'hud',
  updateParticles:'fx',updateTracers:'fx',updateFlames:'fx',updateProj:'fx',updateBurn:'fx',updateSnow:'fx',
  updateEnv:'mondo',svWaves:'mondo',applyLight:'mondo',updateNodes:'mondo',updateFires:'mondo',updateExtras:'mondo'};
// ---------------- error log ----------------
function ts(){var d=new Date();function p(n,l){n=''+n;while(n.length<(l||2))n='0'+n;return n;}return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds())+'.'+p(d.getMilliseconds(),3);}
function str(a){try{if(a instanceof Error)return a.name+': '+a.message+(a.stack?' | '+String(a.stack).split('\n').slice(1,3).join(' ').replace(/\s+/g,' ').slice(0,220):'');if(typeof a==='object')return JSON.stringify(a).slice(0,300);return String(a);}catch(e){return String(a);}}
function logE(type,msg){msg=String(msg).slice(0,500);var L=D.errors,last=null,nk=type==='perf'?msg.replace(/\d+(\.\d+)?/g,'#'):msg;
  for(var li=L.length-1;li>=0&&li>=L.length-8;li--){var x=L[li];if(x.type===type&&(x.nk||x.msg)===nk){last=x;break;}}
  if(last){last.n++;last.t=ts();last.msg=msg;last.nk=nk;}else{L.push({t:ts(),ms:Math.round(now()),type:type,msg:msg,n:1});if(L.length>50)L.shift();}
  D.errDirty=true;try{if(typeof prob==='function'&&/^(errore|promise|console\.error|webgl|risorsa)$/.test(type))prob(type==='webgl'&&/PERSO/.test(msg)?'err':type==='risorsa'?'warn':'err',type,msg);}catch(e){}}
window.addEventListener('error',function(e){var t=e.target;if(t&&t!==window&&(t.src||t.href)){logE('risorsa','Caricamento fallito: '+(t.src||t.href));return;}
  logE('errore',(e.message||'Errore')+(e.filename?' @'+String(e.filename).split('/').pop().slice(0,40)+':'+e.lineno+':'+e.colno:'')+(e.error&&e.error.stack?' | '+String(e.error.stack).split('\n').slice(1,3).join(' ').replace(/\s+/g,' ').slice(0,200):''));},true);
window.addEventListener('unhandledrejection',function(e){logE('promise',str(e.reason));});
var oErr=console.error,oWarn=console.warn;
console.error=function(){try{logE('console.error',Array.prototype.map.call(arguments,str).join(' '));}catch(e){}return oErr.apply(console,arguments);};
console.warn=function(){try{logE('console.warn',Array.prototype.map.call(arguments,str).join(' '));}catch(e){}return oWarn.apply(console,arguments);};
try{if(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes&&PerformanceObserver.supportedEntryTypes.indexOf('longtask')>=0)
  new PerformanceObserver(function(l){l.getEntries().forEach(function(en){D.longTasks++;D.longTaskMs=Math.max(D.longTaskMs,en.duration);});}).observe({entryTypes:['longtask']});}catch(e){}
// ---------------- audio node tracking ----------------
var oStart=null;try{var ASN=window.AudioScheduledSourceNode;if(ASN&&ASN.prototype.start){oStart=ASN.prototype.start;
  var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  ASN.prototype.start=function(){if(!this.__dbgS&&!(OAC&&this.context instanceof OAC)){this.__dbgS=1;D.aSrc++;if(D.aSrc>D.aSrcPeak)D.aSrcPeak=D.aSrc;var self=this;this.addEventListener('ended',function(){D.aSrc--;});}return oStart.apply(this,arguments);};}
  var AC=window.AudioContext||window.webkitAudioContext;if(AC){['createGain','createBiquadFilter','createOscillator','createBufferSource','createConvolver','createDynamicsCompressor','createStereoPanner','createWaveShaper','createDelay'].forEach(function(m){var BA=window.BaseAudioContext&&BaseAudioContext.prototype[m]?BaseAudioContext.prototype:AC.prototype,o=BA[m];if(o&&!o.__dbg)(BA[m]=function(){if(!(window.OfflineAudioContext&&this instanceof OfflineAudioContext))D.aNodes++;return o.apply(this,arguments);}).__dbg=1;});}}catch(e){}
// ---------------- frame timing (rAF wrapper) ----------------
var oRAF=window.requestAnimationFrame.bind(window);
function endFrame(){if(D.curTs<0)return;var ft=D.lastTs?D.curTs-D.lastTs:0;D.lastTs=D.curTs;var i=D.fi;
  D.frames[i]=ft;D.cpu[i]=D.curCpu;D.rnd[i]=D.curRnd;D.fi=(i+1)%120;if(D.fn<120)D.fn++;D.total++;
  try{frameCheck(ft,D.curCpu,D.curRnd);fpsMon(ft);frameBase();}catch(e){}
  if(ft>0&&ft<5000){if(ft>D.worst){D.worst=ft;D.worstAt=Date.now();}if(ft>50)D.long50++;if(ft>100)D.long100++;D.fpsN++;D.fpsT+=ft;if(D.fpsT>=500){D.fps=D.fpsN*1000/D.fpsT;D.fpsN=0;D.fpsT=0;}}
  for(var k=0;k<SYS.length;k++){var s=SYS[k];D.sys[s]=D.sys[s]*.9+D.sysAcc[s]*.1;D.sysAcc[s]=0;}
  try{dq435();}catch(e){}
  D.calls=D.lastInfo.calls;D.tris=D.lastInfo.tris;D.lastInfo.calls=0;D.lastInfo.tris=0;}
window.requestAnimationFrame=function(cb){return oRAF(function(t){if(t!==D.curTs){endFrame();D.curTs=t;D.curCpu=0;D.curRnd=0;}
  var a=now();D.inRaf=1;try{cb(t);}finally{D.inRaf=0;D.curCpu+=now()-a;}});};
// ---------------- renderer hook ----------------
var R=null,gl=null,GI={};
function hookRenderer(r){if(!r||r.__dbg)return;R=r;r.__dbg=1;var oR=r.render;
  r.render=function(s,c){var a=now(),i=r.info.render,pc=r.info.autoReset?0:i.calls,pt=r.info.autoReset?0:i.triangles;try{return oR.call(r,s,c);}finally{if(D.inRaf){D.curRnd+=now()-a;D.lastInfo.calls+=i.calls-pc;D.lastInfo.tris+=i.triangles-pt;}else{D.extRender++;D.extRenderMs+=now()-a;}}};
  try{gl=r.getContext();var ext=gl.getExtension('WEBGL_debug_renderer_info');GI={webgl2:typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext,
    vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
    maxTex:gl.getParameter(gl.MAX_TEXTURE_SIZE),version:gl.getParameter(gl.VERSION),aa:!!(gl.getContextAttributes()||{}).antialias};}catch(e){GI={err:str(e)};}
  var cv=r.domElement;cv.addEventListener('webglcontextlost',function(){D.ctxLost++;logE('webgl','CONTESTO WebGL PERSO');try{prob('err','webgl','Contesto WebGL perso ('+where()+')');}catch(e){}},false);
  cv.addEventListener('webglcontextrestored',function(){logE('webgl','Contesto WebGL ripristinato');},false);}
// ---------------- per-system wrappers (optional in-game line) ----------------
function sysWrap(name,fn){var cat=CAT[name]||'mondo';return function(){var st=D.stack,t=now();if(st.length){var top=st[st.length-1];D.sysAcc[top.c]+=t-top.t;}
  var fr={c:cat,t:t};st.push(fr);try{return fn.apply(this,arguments);}finally{var e=now();D.sysAcc[cat]+=e-fr.t;st.pop();if(st.length)st[st.length-1].t=e;}};}
var sysOn=false;
window.__DBG={ver:VER,owner:true,log:logE,data:D,prob:function(a,b,c){prob(a,b,c);},problems:function(){return PB;},boot:function(){return bootMarks();},fpsHist:function(){return FH.hist;},
  sys:function(o){var r={};for(var k in o){r[k]=typeof o[k]==='function'?sysWrap(k,o[k]):o[k];}sysOn=true;return r;},
  report:function(){return report();},open:function(v){setOpen(v!==false);},reset:function(){D.worst=0;D.long50=0;D.long100=0;D.longTasks=0;D.longTaskMs=0;D.errors.length=0;D.errDirty=true;}};
// ---------------- game state ----------------
function G(){return window.__game||null;}
var lightCache={n:0,t:0,list:''};
function countLights(g){var t=now();if(t-lightCache.t<1000)return lightCache;lightCache.t=t;var n=0,tot=0,names={};
  try{g.scene.traverse(function(o){if(o.isLight){tot++;if(o.visible&&o.intensity>0){n++;var k=o.type.replace('Light','');names[k]=(names[k]||0)+1;}}});}catch(e){}
  lightCache.n=n;lightCache.tot=tot;lightCache.list=Object.keys(names).map(function(k){return k+'×'+names[k];}).join(' ');return lightCache;}
function state(){var g=G();if(!g)return null;var o={};try{
  var SV=g.SV,gm=g.game,p=g.player;o.stato=gm.state;o.modo=SV.on?'survival':(gm.state==='menu'?'survival (menu)':'survival (non avviata)');o.fase=SV.phase;o.giorno=SV.day;
  var c=SV.clock||0;o.orologio=Math.floor(c)+'s/720';o.fasePct=Math.round((SV.pt||0)*100);
  var mins=Math.floor(c/720*1440+360)%1440;o.ora=('0'+Math.floor(mins/60)).slice(-2)+':'+('0'+(mins%60)).slice(-2)+'*';
  o.orda=SV.plan?SV.plan.length:(SV.horde||0);o.ondata=gm.wave;o.uccisi=gm.kills;
  var ai={wander:0,chase:0,search:0,base:0,boss:0,altro:0},alive=0,dead=0;
  for(var i=0;i<g.zombies.length;i++){var z=g.zombies[i];if(!z.alive)continue;if(z.dead){dead++;continue;}alive++;
    if(z.tgtKind==='piece')ai.base++;else if(z.ai&&ai[z.ai]!==undefined)ai[z.ai]++;else ai.altro++;}
  o.zombie=alive;o.morenti=dead;try{var P4=window.__perf433;if(P4)o.gpu433={gpu:P4.adreno,gpuMedia:P4.gpuMid,fxaaSpento:P4.want?P4.want()===false:P4.shOff,cpuMs:window.__fl431?+(__fl431.cpuMs||0).toFixed(1):null,cpuBound:window.__fl431?!!__fl431.cpuBound:null,voci:(g.au&&g.au.v433)|0};}catch(e){}try{if(window.__ai432){var c4=__ai432.cnt();var k7=__ai432.AI432.k437||{};o.ai432={consapevoli:c4.aware,ignari:c4.unaware,assedio:c4.besiege,chiuso:!!c4.enclosed,celle:__ai432.AI432.cellsN,sawEnter:k7.sawEnter|0,baseAttackersUnaware:k7.baseAttackersUnaware|0,nightStartBaseSwitch:k7.nightStartBaseSwitch|0,dmgThroughWall:k7.dmgThroughWall|0,avvisati:k7.avvisati|0};}}catch(e){}o.pool=g.zombies.length;o.ai=ai;
  var L=countLights(g);o.luci=L.n+'/'+L.tot;o.luciTipo=L.list;var f=g.flash;o.torcia=f?+f.intensity.toFixed(2):null;
  o.pos=[+p.pos.x.toFixed(1),+p.pos.y.toFixed(1),+p.pos.z.toFixed(1)];o.hp=Math.ceil(p.hp)+'/'+p.maxHp;
  var w=g.WEAPONS[g.curW];o.arma=w?w.name+(w.melee||w.tool?'':' '+(g.mag[w.id]|0)+'/'+(g.res[w.id]|0)):'?';
  o.pr=g.pr;o.particelle=g.drops?g.drops.length:undefined;o.pezziBase=g.PIECES?g.PIECES.length:undefined;
  var au=g.au;if(au&&au.ctx){o.audio={stato:au.ctx.state,sr:au.ctx.sampleRate,lat:au.ctx.baseLatency!==undefined?Math.round(au.ctx.baseLatency*1000)+'ms':'?',outLat:au.ctx.outputLatency?Math.round(au.ctx.outputLatency*1000)+'ms':'?',latencyHint:'interactive',bluetooth:au.ctx.outputLatency>.15?'probabile (uscita '+Math.round(au.ctx.outputLatency*1000)+' ms: cuffie/altoparlante Bluetooth o percorso audio del telefono)':(au.ctx.outputLatency?'improbabile':'?'),t:+au.ctx.currentTime.toFixed(1)};}else o.audio={stato:'non avviato'};
  o.audio.sorgenti=D.aSrc;o.audio.picco=D.aSrcPeak;o.audio.nodiCreati=D.aNodes;
  if(R){var I=R.info;o.gl={draw:D.calls,tri:D.tris,geo:I.memory.geometries,tex:I.memory.textures,prog:I.programs?I.programs.length:0};}
  }catch(e){o.err=str(e);}return o;}
function heapSample(){var m=performance.memory;if(!m)return;D.heap.push([Math.round((now()-D.start)/1000),Math.round(m.usedJSHeapSize/1048576*10)/10]);if(D.heap.length>90)D.heap.shift();}
function device(){var W=window.Telegram&&window.Telegram.WebApp||{};return {ua:navigator.userAgent,schermo:screen.width+'x'+screen.height,finestra:innerWidth+'x'+innerHeight,dpr:devicePixelRatio,
  core:navigator.hardwareConcurrency,mem:navigator.deviceMemory,gpu:GI,tg:{platform:W.platform,version:W.version,fullscreen:W.isFullscreen,vh:W.viewportHeight,scheme:W.colorScheme}};}
function stats(){var n=D.fn,a=[],sum=0,cs=0,rs=0;for(var i=0;i<n;i++){var v=D.frames[i];a.push(v);sum+=v;cs+=D.cpu[i];rs+=D.rnd[i];}a.sort(function(x,y){return x-y;});
  return {fps:Math.round(D.fps),avg:n?+(sum/n).toFixed(1):0,p95:n?+a[Math.floor(n*.95)].toFixed(1):0,max120:n?+a[n-1].toFixed(1):0,worst:+D.worst.toFixed(1),long50:D.long50,long100:D.long100,
    cpu:n?+(cs/n).toFixed(2):0,render:n?+(rs/n).toFixed(2):0,update:n?+((cs-rs)/n).toFixed(2):0,frames:D.total,renderFuoriFrame:D.extRender,renderFuoriFrameMs:Math.round(D.extRenderMs),longTasks:D.longTasks,longTaskMax:Math.round(D.longTaskMs)};}
function sysObj(){var o={};SYS.forEach(function(k){o[k]=+D.sys[k].toFixed(2);});return o;}
function report(){var m=performance.memory,s=stats();return {v:VER,app:(window.GAME_VER||''),quando:new Date().toISOString(),durata_s:Math.round((now()-D.start)/1000),perf:s,sistemi:sysOn?sysObj():'non agganciati',
  stato:state(),memoria:m?{usataMB:+(m.usedJSHeapSize/1048576).toFixed(1),totMB:+(m.totalJSHeapSize/1048576).toFixed(1),limiteMB:Math.round(m.jsHeapSizeLimit/1048576),trend:D.heap.slice(-30)}:'non disponibile',
  device:device(),fluidita:(function(){try{return window.__fl431?window.__fl431.rep():null;}catch(e){return null;}})(),contestoPerso:D.ctxLost,avvio:bootMarks(),fps10s:FH.hist.slice(),top3:top3(),costoDebugMs:dqCost(),musica:(function(){try{return window.__mus436?__mus436.rep():null;}catch(e){return null;}})(),crash:(function(){try{return window.__crash4310?__crash4310.rep():null;}catch(e){return null;}})(),costruzione:build434Rep(),problemi:probSorted().slice(0,80).map(function(x){return {liv:x.sev,tipo:x.k,dove:x.w,cosa:x.msg,volte:x.n,primo:new Date(x.first).toLocaleString('it-IT'),ultimo:new Date(x.last).toLocaleString('it-IT'),questaSessione:x.s===SID,dati:x.x};}),sessioni:PB.sess.slice(-8),errori:D.errors.slice(),ultimiFrame:Array.prototype.slice.call(D.frames,0,D.fn).map(function(v){return Math.round(v*10)/10;}),lettura:(function(){try{return typeof leggi==='function'?leggi():[];}catch(e){return [];}})(),extra29:(function(){try{return window.__rep29?window.__rep29():null;}catch(e){return String(e&&e.message||e);}})()};}
function summary(){var r=report(),s=r.perf,st=r.stato||{},e=r.errori;var L=['🐞 Zombie debug '+VER+' '+new Date().toLocaleString('it-IT'),
  'FPS '+s.fps+' · media '+s.avg+'ms · p95 '+s.p95+' · peggiore '+s.worst+'ms · >50ms: '+s.long50,
  'CPU/frame '+s.cpu+'ms (render '+s.render+' / update '+s.update+')'+(sysOn?' · '+SYS.map(function(k){return k+' '+r.sistemi[k];}).join(' '):''),
  (function(){try{var f=window.__fl431&&window.__fl431.rep();return f?'Render PR '+f.pixelRatio+' (cap '+f.capQualita+' x scala '+f.scala+', '+f.buffer+') · '+f.hz+'Hz · target '+f.fpsTarget+' ('+f.fpsScelta+') · frame persi '+f.framePersiPct+'%':'';}catch(e){return '';}})(),
  st.gl?'GL draw '+st.gl.draw+' tri '+st.gl.tri+' geo '+st.gl.geo+' tex '+st.gl.tex+' prog '+st.gl.prog:'',
  'Stato '+st.stato+' '+st.fase+' g'+st.giorno+' zombie '+st.zombie+' orda '+st.orda+' luci '+st.luci+' torcia '+st.torcia,
  'Audio '+(st.audio&&st.audio.stato)+' '+(st.audio&&st.audio.sr||'')+'Hz src '+(st.audio&&st.audio.sorgenti),
  typeof r.memoria==='object'?'Heap '+r.memoria.usataMB+'/'+r.memoria.limiteMB+'MB':'',
  'GPU '+(r.device.gpu.renderer||'?')+' · '+r.device.schermo+' dpr '+r.device.dpr+' · TG '+r.device.tg.platform+' '+r.device.tg.version,
  (function(){var b=bootMarks();return 'Avvio: three '+b.threeJsPronto+'ms · gioco '+b.giocoInit+'ms · DOM '+b.domPronto+' · 1° frame '+b.primoFrame+' · menu '+b.menuVisibile+'ms'+(b.longTaskAvvio.length?' · LT '+b.longTaskAvvio.map(function(x){return x[1]+'ms@'+x[0]+'('+x[2]+')';}).join(' '):'');})(),
  'FPS/10s (min/media): '+FH.hist.slice(-12).map(function(h){return h[1]+'/'+h[2];}).join(' '),
  'Problemi: '+PB.list.filter(function(x){return x.s===SID;}).length+' in questa sessione, '+PB.list.length+' registrati',
  (function(){var b=build434Rep();return b?'Costruzione: '+b.totale+' pezzi · tentativi '+b.tentativi+' · posati '+b.posati+' · rifiuti '+b.rifiuti+' · anomalie '+b.anomalie:'';})(),
  (function(){try{var m=window.__mus436&&__mus436.rep();return m?'Musica: '+m.stato+' · tema '+m.tema+' · picco '+m.piccoMax+' · clip '+m.clipping+' · sovrapp. '+m.sovrapposizioni+' · interruz. '+m.interruzioni+' · riavvii '+m.riavvii:'';}catch(x){return '';}})(),
  'Errori: '+e.length+(e.length?'':'')];
  top3().forEach(function(x){L.push('TOP'+x.n+' '+SEV[x.liv]+' '+x.dove+(x.volte>1?' ×'+x.volte:'')+': '+x.cosa.slice(0,120)+' → causa: '+x.causaProbabile+' · dove: '+x.doveCorreggere);});
  probSorted().slice(3,10).forEach(function(x){L.push(SEV[x.sev]+' '+x.w+(x.n>1?' ×'+x.n:'')+': '+x.msg.slice(0,120));});
  e.slice(-6).forEach(function(x){L.push('['+x.t+'] '+x.type+(x.n>1?' ×'+x.n:'')+': '+x.msg.slice(0,160));});
  return L.filter(Boolean).join('\n').slice(0,3000);}
// ---------------- 4.3.2: automatic problem log (owner only, local only: nothing is uploaded) ----------------
var PB_K='zs_dbg_prob432',SS_K='zs_dbg_sess432',SEEN_K='zs_dbg_seen4317',PB={list:[],sess:[]},SEEN={},pbDirty=false,SID=Date.now().toString(36);
try{var _pb=JSON.parse(LS.get(PB_K)||'null');if(_pb&&Array.isArray(_pb.sess))PB.sess=_pb.sess;}catch(e){}
try{var _seen=JSON.parse(localStorage.getItem(SEEN_K)||'[]');if(Array.isArray(_seen))for(var _si=0;_si<_seen.length;_si++)SEEN[_seen[_si]]=1;}catch(e){}
PB.list=[];try{localStorage.removeItem(PB_K);}catch(e){}
function seenAdd(key){if(SEEN[key])return false;SEEN[key]=1;try{var ks=Object.keys(SEEN);if(ks.length>400){for(var i=0;i<ks.length-400;i++)delete SEEN[ks[i]];ks=Object.keys(SEEN);}localStorage.setItem(SEEN_K,JSON.stringify(ks));}catch(e){}return true;}
function where(){try{var g=G();if(!g)return 'avvio';var st=g.game.state;var L4=window.__ld431;if(L4&&(L4.on||L4.hold))return 'caricamento';if(st==='menu')return 'menu';if(st==='bag')return 'zaino';if(st==='play'&&g.SV&&g.SV.build)return 'costruzione';if(st==='play')return 'partita';return st;}catch(e){return '?';}}
var SEV={err:'⛔',warn:'⚠️',info:'ℹ️'};
function prob(sev,kind,msg,extra){try{msg=String(msg).slice(0,220);var w=where();if(w==='caricamento'&&(kind==='frame'||kind==='longtask'||kind==='fps'))sev='info';var key=kind+'|'+w+'|'+msg.replace(/\d+(\.\d+)?/g,'#').slice(0,90),t=Date.now();
  if(!seenAdd(key))return;
  PB.list.push({key:key,sev:sev,k:kind,msg:msg,w:w,first:t,last:t,n:1,s:SID,x:extra||null});while(PB.list.length>80)PB.list.shift();pbDirty=true;}catch(e){}}
function pbSave(){if(!pbDirty)return;pbDirty=false;try{if(PB.sess.length>12)PB.sess=PB.sess.slice(-12);LS.set(PB_K,JSON.stringify(PB));}catch(e){}}
// session tracking: 'last session ended abnormally' if the previous one never reached pagehide
(function(){var prev=null;try{prev=JSON.parse(LS.get(SS_K)||'null');}catch(e){}
  if(prev&&!prev.clean){prob('warn','sessione','Sessione precedente terminata in modo anomalo (crash, chiusura forzata o memoria) dopo '+Math.round((prev.hb-prev.start)/1000)+'s, ultimo stato: '+(prev.w||'?'),{ver:prev.v,ultimoBattito:new Date(prev.hb).toLocaleString('it-IT')});}
  if(prev)PB.sess.push({id:prev.id,start:prev.start,end:prev.hb,clean:!!prev.clean,v:prev.v,prob:prev.np|0});
  var cur={id:SID,start:Date.now(),hb:Date.now(),clean:false,v:window.GAME_VER||'',w:'avvio',np:0};
  function beat(){cur.hb=Date.now();cur.w=where();cur.v=window.GAME_VER||cur.v;cur.np=PB.list.filter(function(x){return x.s===SID;}).length;LS.set(SS_K,JSON.stringify(cur));pbSave();}
  beat();setInterval(beat,5000);
  window.addEventListener('pagehide',function(){cur.clean=true;beat();});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){cur.clean=true;beat();}else{cur.clean=false;beat();}});})();
// startup phases
var BOOT={};function bootMarks(){var b=window.__boot432||{},n=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};
  return {htmlScaricato:Math.round(n.responseEnd||0),primoScript:Math.round(b.h||0),threeJsPronto:Math.round(b.three||0),giocoAvviato:Math.round(b.g0||0),giocoInit:Math.round(b.init||0),
    domPronto:Math.round(n.domContentLoadedEventEnd||0),load:Math.round(n.loadEventEnd||0),primoFrame:Math.round(b.f1||0),menuVisibile:Math.round(b.menu||0),longTaskAvvio:BOOT.lt||[]};}
function bootPhase(t){var b=window.__boot432||{};if(b.three&&t<b.three)return 'parse/eval three.js';if(b.g0&&t<b.g0)return 'parse/eval debug+inizio gioco';if(b.init&&t<b.init)return 'init gioco (script)';if(b.f1&&t<b.f1)return 'primo frame (renderer/DOM)';if(b.menu&&t<b.menu)return 'verso il menu';return '';}
try{if(window.PerformanceObserver){new PerformanceObserver(function(l){l.getEntries().forEach(function(en){var ph=bootPhase(en.startTime),d=Math.round(en.duration);
  if(!window.__boot432||!window.__boot432.menu||ph){BOOT.lt=BOOT.lt||[];if(BOOT.lt.length<20)BOOT.lt.push([Math.round(en.startTime),d,ph||'avvio']);}
  if(d>100&&where()==='menu'&&window.__boot432&&__boot432.menu&&en.startTime>__boot432.menu)prob('err','regressione','Long task '+d+'ms nel menu (doveva essere 0 in 4.3.2)',{at:Math.round(en.startTime)});
  if(d>100)prob(d>400?'err':'warn','longtask','Blocco del thread '+d+'ms'+(ph?' durante '+ph:'')+' ('+where()+')',{at:Math.round(en.startTime),stato:sNow()});});}).observe({type:'longtask',buffered:true});}}catch(e){}
var lastStage='';function sNow(){try{var g=G();if(!g)return null;var z=0;for(var i=0;i<g.zombies.length;i++)if(g.zombies[i].alive&&!g.zombies[i].dead)z++;return {fase:g.SV.phase,g:g.SV.day,zombie:z,pezzi:g.PIECES?g.PIECES.length:0,pr:g.pr,prog:R&&R.info.programs?R.info.programs.length:0};}catch(e){return null;}}
// long frames with attribution
var lfProg=0,lfGeo=0,lfTex=0;
function frameCheck(ft,cpu,rnd){if(!(ft>100&&ft<20000))return;var pr=0,geo=0,tex=0;try{if(R){pr=R.info.programs?R.info.programs.length:0;geo=R.info.memory.geometries;tex=R.info.memory.textures;}}catch(e){}
  var why=[];if(pr>lfProg)why.push('+'+(pr-lfProg)+' shader nuovi');if(geo>lfGeo+2)why.push('+'+(geo-lfGeo)+' geometrie');if(tex>lfTex)why.push('+'+(tex-lfTex)+' texture');
  if(cpu>ft*.6)why.push('script '+Math.round(cpu)+'ms (render '+Math.round(rnd)+')');else if(cpu<ft*.3)why.push('fuori dal gioco (GPU/browser/GC) '+Math.round(ft-cpu)+'ms');
  prob(ft>400?'err':'warn','frame','Frame lungo '+Math.round(ft)+'ms: '+(why.join(', ')||'causa non chiara'),sNow());}
function frameBase(){try{if(R){lfProg=R.info.programs?R.info.programs.length:0;lfGeo=R.info.memory.geometries;lfTex=R.info.memory.textures;}}catch(e){}}
// continuous FPS monitor: per-10 s min/avg history + sustained drops (<80% of the target for >1 s)
var FH={hist:[],w:{n:0,t:0,max:0},s:{n:0,t:0},low:0,lowT:0};
function fpsTarget(){try{var F=window.__fl431;if(F&&F.period>0){var hz=1000/F.period;if(F.cap==='max'&&F.cpu60){var nv=Math.max(1,Math.ceil(hz/60-.08));return hz/nv;}if(F.cap==='60'||F.auto60)return Math.min(60,hz);return hz;}}catch(e){}return 60;}
function fpsMon(ft){if(!(ft>0&&ft<5000))return;try{var L4=window.__ld431;if(L4&&(L4.on||L4.hold||L4.cover)){FH.low=0;FH.s={n:0,t:0};return;}}catch(e){}var g=G();var st=g&&g.game&&g.game.state;if(document.visibilityState==='hidden')return;
  var W=FH.w;W.n++;W.t+=ft;if(ft>W.max)W.max=ft;if(W.t>=10000){FH.hist.push([Math.round((now()-D.start)/1000),Math.round(1000/W.max),Math.round(W.n*1000/W.t),where()]);if(FH.hist.length>60)FH.hist.shift();FH.w={n:0,t:0,max:0};}
  if(st!=='play'&&st!=='menu')return;var S=FH.s;S.n++;S.t+=ft;if(S.t>=1000){var fps=S.n*1000/S.t,tg=fpsTarget();
    if(fps<tg*.8){FH.low+=S.t;if(FH.low>1000&&now()-FH.lowT>8000){FH.lowT=now();var s=sNow()||{};prob('warn','fps','FPS '+Math.round(fps)+' sotto l\'80% del target '+Math.round(tg)+' per '+(FH.low/1000).toFixed(1)+'s'+(s.zombie!=null?' · zombie '+s.zombie+' · '+s.fase+' g'+s.g+' · pezzi '+s.pezzi+' · PR '+s.pr:''),s);}}
    else FH.low=0;FH.s={n:0,t:0};}}
// stuck / NaN / audio / memory watchdogs (every 1 s)
var WD={pp:null,pt:0,zs:new WeakMap ? new WeakMap() : null,aSusp:0,heapW:0};
setInterval(function(){try{var g=G();if(!g||!g.player)return;var p=g.player.pos,st=g.game.state;
  if(!isFinite(p.x)||!isFinite(p.z)||!isFinite(p.y))prob('err','nan','Posizione del giocatore non valida (NaN)',{pos:[p.x,p.y,p.z]});
  for(var i=0;i<g.zombies.length;i++){var z=g.zombies[i];if(!z.alive||z.dead)continue;var q=z.g.position;if(!isFinite(q.x)||!isFinite(q.z)){prob('err','nan','Zombie '+z.V.name+' con posizione NaN',null);continue;}
    if(st==='play'&&WD.zs){var o=WD.zs.get(z);if(!o){o={x:q.x,z:q.z,t:0};WD.zs.set(z,o);}var dpl=Math.hypot(q.x-p.x,q.z-p.z);
      if(z.ai==='chase'&&dpl>3&&Math.hypot(q.x-o.x,q.z-o.z)<.15){o.t++;if(o.t===6)prob('warn','stuck','Zombie '+z.V.name+' bloccato da 6s mentre insegue (dist '+dpl.toFixed(1)+'m)',{pos:[+q.x.toFixed(1),+q.z.toFixed(1)]});}else{o.t=0;o.x=q.x;o.z=q.z;}}}
  if(st==='play'){var mv=false;try{var j=g.joy||null,k=g.keys||null;mv=(j&&Math.hypot(j.x||0,j.y||0)>.5)||(k&&(k.KeyW||k.KeyA||k.KeyS||k.KeyD));}catch(e){}
    if(mv&&WD.pp&&Math.hypot(p.x-WD.pp[0],p.z-WD.pp[1])<.05){WD.pt++;if(WD.pt===3)prob('warn','stuck','Giocatore fermo da 3s nonostante il movimento (incastrato?)',{pos:[+p.x.toFixed(1),+p.z.toFixed(1)]});}else WD.pt=0;WD.pp=[p.x,p.z];}
  var au=g.au&&g.au.ctx;if(au&&st==='play'&&au.state!=='running'){WD.aSusp++;if(WD.aSusp===5)prob('warn','audio','Audio '+au.state+' da 5s durante la partita',null);}else WD.aSusp=0;
  var hp=D.heap;if(hp.length>=60){var a=hp[hp.length-60],b=hp[hp.length-1],rate=(b[1]-a[1])/((b[0]-a[0])/60);if(rate>4&&now()-WD.heapW>60000){WD.heapW=now();prob('warn','memoria','Memoria in crescita '+rate.toFixed(1)+'MB/min (ora '+b[1]+'MB)',null);}}
}catch(e){}},1000);
setInterval(pbSave,3000);
var CAUSE={longtask:['Lavoro JS sincrono troppo lungo (compilazione shader, upload geometrie, parse script, GC)','LD432 pipeline / warmShaders42 / UP424 (slice), o init script all\'avvio'],
 frame:['Frame lungo: shader nuovi, upload geometrie/texture o script pesante nel loop','vedi dettaglio: +shader → warm nel loader; script → update()/AI; fuori dal gioco → GPU/GC'],
 fps:['Calo FPS prolungato sotto l\'80% del target','risoluzione dinamica FL431, numero zombie/luci/particelle, qualità grafica'],
 regressione:['Un problema già corretto è ricomparso','vedi messaggio: menu → avvio senza warm; base chiusa → ai432Seg/ai432Sense'],
 errore:['Eccezione JavaScript','file/riga nel messaggio'],promise:['Promise rifiutata non gestita','fetch/cloud/audio async'],webgl:['Contesto WebGL perso (memoria GPU o app in background)','ridurre texture/qualità; gestione webglcontextrestored'],
 sessione:['La sessione precedente non si è chiusa normalmente (crash/kill per memoria)','controllare memoria e problemi della sessione precedente'],stuck:['Entità bloccata','collide()/keepOut, pezzi base, navigazione zombie'],
 nan:['Posizione non valida (NaN)','fisica/movimento: divisione per zero'],audio:['Audio non in esecuzione','AU.ctx resume dopo gesto utente / interruzione'],memoria:['Memoria in crescita costante (possibile leak)','geometrie/texture non liberate, array che crescono'],risorsa:['Risorsa non caricata','rete/percorso file'],hook:['Hook debug non agganciato','riga __DBG.sys']};
CAUSE.crash=['Errore intercettato: quel frame è stato saltato e il gioco continua','loop0 / crash4310'];CAUSE.potenziamento=['Un potenziamento non è andato a buon fine','Crafting, scheda Potenzia armi'];CAUSE.suggerimento=['Un suggerimento non è arrivato nella chat privata','Home, Suggerimenti, POST /suggest'];CAUSE.neve=['Errore mentre la neve scende','updateSnow / snow2Tick'];CAUSE.critico=['Errore nel colpo critico','damageZombie'];CAUSE.zaino=['Una scritta dello zaino è tagliata','layout della borsa'];var SW={err:100,warn:10,info:1};
function leggi(){var out=[],L=probSorted(),s=null;try{s=stats();}catch(e){}
  var err=L.filter(function(x){return x.sev==='err';}),warn=L.filter(function(x){return x.sev==='warn';});
  var boot=L.filter(function(x){return x.k==='longtask'&&/avvio|init|caric|menu/i.test((x.w||'')+' '+(x.msg||''));});
  if(boot.length){var ms=0;boot.forEach(function(x){var m=/(\d+(?:\.\d+)?)\s*ms/.exec(x.msg||'');if(m)ms=Math.max(ms,+m[1]);});out.push('All\'apertura il telefono resta fermo'+(ms?' circa '+Math.round(ms)+' ms':'')+': sta preparando la mappa. Non è un guasto durante la partita.');}
  if(s&&s.fps>0&&s.fps<35)out.push('In partita va piano ('+Math.round(s.fps)+' fps). Il limite è il processore del telefono, non una texture mancante.');
  var mus=L.filter(function(x){return /music|audio/i.test(x.k||'');});
  if(mus.length)out.push('Audio: '+mus[0].msg+'. Se capita solo all\'avvio, il tema è ripartito da solo.');
  var crash=L.filter(function(x){return x.k==='crash'||x.k==='errore'||x.k==='promise';});
  if(crash.length)out.push('Errore da correggere nel codice: «'+crash[0].msg+'». Non è il telefono che è lento.');
  var stuck=L.filter(function(x){return x.k==='stuck'||/incastr/i.test(x.msg||'');});
  if(stuck.length)out.push('Qualcosa resta incastrato. '+stuck[0].msg);
  if(s&&s.longTasks>2&&!boot.length)out.push('Durante il gioco ci sono stati '+s.longTasks+' blocchi lunghi. Il più pesante è '+(s.longTaskMax||'?')+' ms.');
  if(!out.length)out.push(err.length?('Ci sono '+err.length+' errori. Il primo: '+err[0].msg):'Nessun guasto. I numeri sono la misura del telefono, non un bug da inseguire.');
  if(warn.length&&out.length<4)out.push('Avvisi: '+warn.slice(0,2).map(function(x){return x.msg;}).join(' · '));
  return out.slice(0,5);}
function top3(){var L=PB.list.slice().sort(function(a,b){return (SW[b.sev]*Math.log2(1+b.n)+(b.s===SID?5:0))-(SW[a.sev]*Math.log2(1+a.n)+(a.s===SID?5:0));});
  return L.slice(0,3).map(function(x,i){var c=CAUSE[x.k]||['?','?'];return {n:i+1,liv:x.sev,cosa:x.msg,dove:x.w,volte:x.n,causaProbabile:c[0],doveCorreggere:c[1]};});}
function probSorted(){return PB.list.slice().sort(function(a,b){return SW[b.sev]-SW[a.sev]||b.n-a.n;});}
// ---------------- 4.3.5: debug checks time-sliced (a few entities per frame, round-robin), own cost measured ----------------
var DQ={cost:{giocatore:0,zombie:0,drop:0,costruzione:0,ui:0},frames:0,tot:0,zi:0,pi:0,di:0,keys:{},lastMov:0,pp:null,flip:0,flipN:0,lastD:[0,0,0],ui:null,uiI:0,uiR:[],uiNext:0,uiSt:''};
function lbl(e){if(!e)return '?';if(e.id)return '#'+e.id;var c=(e.className&&typeof e.className==='string')?e.className.split(' ')[0]:'';var t=(e.textContent||'').trim().slice(0,14);return e.tagName.toLowerCase()+(c?'.'+c:'')+(t?' «'+t+'»':'');}
function inBox(g,x,z,m){var B=g.boxes||[];for(var i=0;i<B.length;i++){var b=B[i];if(x>b.x0+m&&x<b.x1-m&&z>b.z0+m&&z<b.z1-m)return b;}return null;}
function dqPlayer(g,tn){var p=g.player.pos,H=g.HALF||52;
  if(DQ.pp){var dt=(tn-DQ.pp[2])/1000,dx=p.x-DQ.pp[0],dz=p.z-DQ.pp[1],d=Math.hypot(dx,dz),sp=d/Math.max(.2,dt);
    var j=g.joy,k=g.keys,inp=(j&&Math.hypot(j.x||0,j.y||0)>.5)||(k&&(k.KeyW||k.KeyA||k.KeyS||k.KeyD));
    if(sp>16&&g.player.hp>0)prob('warn','movimento','Giocatore: scatto/teletrasporto di '+d.toFixed(1)+'m in '+dt.toFixed(1)+'s',null);
    if(inp&&d>.05&&DQ.lastD[2]>0){var dot=(dx*DQ.lastD[0]+dz*DQ.lastD[1])/(d*DQ.lastD[2]+1e-6);DQ.flipN++;if(dot<-.3)DQ.flip++;if(DQ.flipN>=4){if(DQ.flip>=3)prob('warn','movimento','Giocatore: tremolio (direzione che si inverte con il joystick fermo)',null);DQ.flip=0;DQ.flipN=0;}}
    if(d>.05){DQ.lastD[0]=dx;DQ.lastD[1]=dz;DQ.lastD[2]=d;}
    if(inp&&sp>(g.player.speed||7)*2.2)prob('warn','movimento','Giocatore: velocità anomala '+sp.toFixed(1)+' m/s',null);
    DQ.pp[0]=p.x;DQ.pp[1]=p.z;DQ.pp[2]=tn;}else DQ.pp=[p.x,p.z,tn];
  if(Math.abs(p.x)>H+.5||Math.abs(p.z)>H+.5)prob('err','movimento','Giocatore fuori dai confini della mappa',null);
  if(p.y<-.5)prob('err','movimento','Giocatore sotto il terreno',null);
  if(inBox(g,p.x,p.z,.15))prob('warn','movimento','Giocatore dentro un ostacolo/muro',null);}
function dqZombie(g,tn){var Z=g.zombies,n=Z.length;if(!n)return;for(var tries=0;tries<n;tries++){DQ.zi=(DQ.zi+1)%n;var z=Z[DQ.zi];if(z.alive&&!z.dead)break;z=null;}if(!z)return;
  var q=z.g.position,h=z._h435;if(!h)h=z._h435=[q.x,q.z,tn,q.x,q.z,tn,q.x,q.z,tn,q.x,q.z,tn,0];
  if(tn-h[11]>=1000){var dd=Math.hypot(q.x-h[9],q.z-h[10]),ds=dd/Math.max(.2,(tn-h[11])/1000);if(ds>14&&dd<40&&h[12])prob('warn','zombie','Zombie '+z.V.name+': picco di velocità '+ds.toFixed(1)+' m/s',null);
    for(var i=0;i<9;i++)h[i]=h[i+3];h[9]=q.x;h[10]=q.z;h[11]=tn;h[12]=1;
    if(z.ai==='chase'||z.ai==='search'){var path=Math.hypot(h[3]-h[0],h[4]-h[1])+Math.hypot(h[6]-h[3],h[7]-h[4])+Math.hypot(h[9]-h[6],h[10]-h[7]),net=Math.hypot(h[9]-h[0],h[10]-h[1]);
      if(path>2.5&&net<.4)prob('warn','zombie','Zombie '+z.V.name+' oscilla avanti/indietro',null);}}
  if(inBox(g,q.x,q.z,.12))prob('warn','zombie','Zombie '+z.V.name+' dentro un muro/ostacolo',null);
  for(var b=0;b<n;b++){var o=Z[b];if(o===z||!o.alive||o.dead)continue;var A=o.g.position;if(Math.hypot(A.x-q.x,A.z-q.z)<.22*(o.V.scale+z.V.scale)){prob('warn','mondo','Zombie compenetrati ('+z.V.name+'/'+o.V.name+')',null);break;}}}
function dqDrop(g){try{var F=window.__feat432;if(!F||!F.GD||!F.GD.length)return;DQ.di=(DQ.di+1)%F.GD.length;var dr=F.GD[DQ.di];if(dr.on&&inBox(g,dr.x,dr.z,.05))prob('warn','mondo','Fascio del drop dentro un muro/ostacolo',null);}catch(e){}}
function dqBuild(g){var P=g.PIECES;if(!P||!P.length)return;if(DQ.pi>=P.length){DQ.pi=0;DQ.keys={};}var p=P[DQ.pi++];if(!p||!p.alive)return;var B=window.__b434,pp=g.player.pos;
  if(!isFinite(p.x)||!isFinite(p.z)){prob('err','costruzione','Pezzo '+p.type+' con posizione NaN',null);return;}
  if(DQ.keys[p.key])prob('err','costruzione','Pezzi sovrapposti nella stessa cella: '+p.type+' ('+p.x+','+p.z+')',null);DQ.keys[p.key]=1;
  if(p.type==='roof'&&B&&!B.roofSup(p.x,p.z))prob('warn','costruzione','Tetto sospeso senza appoggio in ('+p.x+','+p.z+')',null);
  var b=p.boxRef;if(b){if(pp.x>b.x0+.05&&pp.x<b.x1-.05&&pp.z>b.z0+.05&&pp.z<b.z1-.05)prob('warn','costruzione','Giocatore dentro il pezzo '+p.type,null);
    for(var j=0;j<g.zombies.length;j++){var z=g.zombies[j];if(!z.alive||z.dead)continue;var q=z.g.position;if(q.x>b.x0+.05&&q.x<b.x1-.05&&q.z>b.z0+.05&&q.z<b.z1-.05){prob('warn','costruzione','Zombie '+z.V.name+' dentro il pezzo '+p.type,null);break;}}}
  var L=window.__B434&&__B434.load;if(L&&L.salvati!==L.caricati&&!L.logged){L.logged=1;prob('err','costruzione','Salvataggio/caricamento: '+L.salvati+' pezzi salvati ma '+L.caricati+' caricati',null);}}
function dqUi(g,st,tn){if(!DQ.ui){if(tn<DQ.uiNext)return;var root=st==='menu'?document.getElementById('startScreen'):document.getElementById('hud');if(!root)return;
    DQ.ui=Array.prototype.slice.call(root.querySelectorAll('button,.btn,[id$="Btn"]'),0,60);if(st==='menu'){var iv=document.getElementById('inv432');if(iv)DQ.ui.push(iv);}DQ.uiI=0;DQ.uiR.length=0;DQ.uiSt=st;return;}
  if(DQ.uiSt!==st||DQ.uiI>=DQ.ui.length){DQ.ui=null;DQ.uiNext=tn+(st==='play'?12000:4000);return;}
  var e=DQ.ui[DQ.uiI++];if(!e.offsetParent)return;var cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity<.05||cs.pointerEvents==='none')return;var r=e.getBoundingClientRect();if(r.width<8||r.height<8)return;
  var W=innerWidth,Hh=innerHeight;if(!DQ.sat||DQ.uiI===1)DQ.sat=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat'))||0;
  if(r.right>W+1||r.left<-1||r.bottom>Hh+1||r.top<-1)prob('warn','ui','UI tagliata/fuori schermo: '+lbl(e),{dove:st});
  if(DQ.sat>0&&r.top<DQ.sat-1&&r.bottom>0)prob('warn','ui','UI sotto la barra di Telegram: '+lbl(e),{dove:st});
  var cx=Math.min(W-1,Math.max(0,(r.left+r.right)/2)),cy=Math.min(Hh-1,Math.max(0,(r.top+r.bottom)/2)),hit=document.elementFromPoint(cx,cy);
  if(hit&&hit!==e&&!e.contains(hit)&&!hit.contains(e)&&!(hit.closest&&hit.closest('#portrait'))){var ov=hit.closest&&hit.closest('.overlay:not(.hidden)');if(!ov||ov.contains(e))prob('warn','ui','Tocco su '+lbl(e)+' finisce su '+lbl(hit)+' (coperto)',{dove:st});}
  for(var i=0;i<DQ.uiR.length;i+=2){var e2=DQ.uiR[i],r2=DQ.uiR[i+1];if(e.contains(e2)||e2.contains(e))continue;var ix=Math.min(r.right,r2.right)-Math.max(r.left,r2.left),iy=Math.min(r.bottom,r2.bottom)-Math.max(r.top,r2.top);
    if(ix>2&&iy>2){var ar=ix*iy,m=Math.min(r.width*r.height,r2.width*r2.height);if(ar>m*.2)prob('warn','ui','UI sovrapposta: '+lbl(e)+' e '+lbl(e2),{dove:st});}}
  DQ.uiR.push(e,r);}
function dq435(){var t0=now();try{var g=G();if(!g||!g.player||!g.game)return;var st=g.game.state;DQ.frames++;var a;
  if(st==='play'){if(t0-DQ.lastMov>1000){DQ.lastMov=t0;a=now();dqPlayer(g,t0);DQ.cost.giocatore+=now()-a;}
    else{a=now();dqZombie(g,t0);dqZombie(g,t0);DQ.cost.zombie+=now()-a;a=now();dqDrop(g);DQ.cost.drop+=now()-a;a=now();dqBuild(g);DQ.cost.costruzione+=now()-a;}}
  if(st==='play'||st==='menu'||st==='pause'){a=now();dqUi(g,st,t0);DQ.cost.ui+=now()-a;}
}catch(e){}finally{DQ.tot+=now()-t0;}}
function dqCost(){var f=Math.max(1,DQ.frames),o={mediaMsPerFrame:+(DQ.tot/f).toFixed(3),frame:DQ.frames};for(var k in DQ.cost)o[k]=+(DQ.cost[k]/f).toFixed(3);return o;}
CAUSE.movimento=['Movimento del giocatore anomalo (collisioni, salti di posizione, input)','update(): movimento/inerzia, collide() con boxes/circles, respawn/teletrasporto'];
CAUSE.zombie=['Movimento zombie anomalo (bloccato, oscilla, dentro i muri, scatti)','updateZombie(): sideT/stuck, collide(), keepOut(); svTarget/svTarget433 (recupero)'];
CAUSE.mondo=['Oggetti del mondo compenetrati','separazione zombie in updateZombie(); gearDropAt() posizione drop vs boxes'];
CAUSE.ui=['Elementi dell\'interfaccia sovrapposti, tagliati o sotto la barra di Telegram','CSS del HUD/menu: posizioni con var(--sat)/(--sal), z-index, media query per altezza'];
CAUSE.recupero=['Uno zombie bloccato è stato sbloccato automaticamente','svTarget433(): passo laterale / deviazione / porta aperta'];
function build434Rep(){try{var B=window.__B434;if(!B)return null;var g=G(),tipi={};if(g&&g.PIECES)g.PIECES.forEach(function(p){if(p.alive)tipi[p.type]=(tipi[p.type]||0)+1;});
  return {pezziPerTipo:tipi,totale:g&&g.PIECES?g.PIECES.length:0,tentativi:B.n,posati:B.ok,rifiuti:B.ref,anomalie:B.anom,caricamento:B.load,ultimi:B.log.slice(-12)};}catch(e){return null;}}
CAUSE.musica=['Problema della musica (tracce sovrapposte, clipping, interruzioni, decodifica)','musicUpdate()/mSrcStart(), bus AU.mus e volume, renderTheme()/musicPrerender()'];CAUSE.costruzione=['Problema di costruzione (posizione, appoggio, sovrapposizione, salvataggio o lentezza)','buildTarget()/build434Target(), placeCheck(), roofSup434()/roofCollapse434(), svApply() per i pezzi'];

// ---------------- UI ----------------
var ui=null,open=false,tab=LS.get('zs_dbg_tab')||'perf',timer=0;
var CSS='#zdbgB{position:fixed;z-index:2147483000;left:calc(var(--sal,0px) + 52px);top:calc(var(--sat,0px) + 8px);min-width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.45);background:rgba(10,12,18,.82);color:#fff;font-size:16px;line-height:34px;text-align:center;padding:0 6px;opacity:1;pointer-events:auto;box-shadow:0 2px 10px rgba(0,0,0,.55);-webkit-tap-highlight-color:transparent;touch-action:manipulation}'+
 '#zdbgB.on{background:rgba(60,200,120,.35);opacity:1}'+
 '#zdbgP{position:fixed;z-index:2147482999;left:calc(var(--sal,0px) + 10px);top:calc(var(--sat,0px) + 48px);width:330px;max-width:calc(100vw - 20px);max-height:calc(100vh - 108px);overflow:hidden;background:rgba(6,8,12,.72);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#dfe6ee;font:10.5px/1.3 ui-monospace,Menlo,Consolas,monospace;pointer-events:none;display:none;padding:6px 7px;flex-direction:column}'+
 '#zdbgP.show{display:flex}#zdbgP .tb{display:flex;gap:3px;margin-bottom:4px;pointer-events:auto}#zdbgP .tb button{flex:1;font:600 10px sans-serif;color:#cfd8e2;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:6px;padding:4px 0;-webkit-tap-highlight-color:transparent}'+
 '#zdbgP .tb button.a{background:rgba(80,170,255,.35);color:#fff}#zdbgP canvas{display:block;width:100%;height:40px;margin:2px 0}#zdbgP .k{color:#8fa0b4}#zdbgP .w{color:#ffcc55}#zdbgP .r{color:#ff6b6b}#zdbgP .g{color:#6bff9a}'+
 '#zdbgP .ft{display:flex;gap:4px;margin-top:5px;pointer-events:auto}#zdbgP .ft button{flex:1;font:700 10px sans-serif;color:#fff;background:rgba(60,140,255,.45);border:0;border-radius:6px;padding:6px 0}#zdbgP .ft button.s{background:rgba(255,255,255,.12)}'+
 '#zdbgCopy{display:none;width:100%;height:92px;margin-top:4px;box-sizing:border-box;resize:none;pointer-events:auto;touch-action:manipulation;user-select:text;-webkit-user-select:text;font:10px/1.3 ui-monospace,Menlo,Consolas,monospace;color:#e8eef6;background:rgba(0,0,0,.55);border:1px solid rgba(120,180,255,.45);border-radius:6px;padding:4px}'+
 '#zdbgP .bd{flex:1 1 auto;min-height:0;white-space:pre-wrap;word-break:break-word;overflow:auto;-webkit-overflow-scrolling:touch;pointer-events:auto;touch-action:pan-y;user-select:text;-webkit-user-select:text}#zdbgP .ft{flex:0 0 auto}#zdbgP .er{border-top:1px solid rgba(255,255,255,.07);padding:2px 0}#zdbgP .er .k{display:block}#zdbgP .er .cp{pointer-events:auto;margin:2px 0 0;font:700 10px sans-serif;color:#fff;background:rgba(60,140,255,.55);border:0;border-radius:5px;padding:3px 8px}';
function el(t,a,p){var e=document.createElement(t);for(var k in a)e[k]=a[k];if(p)p.appendChild(e);return e;}
function stop(e){e.stopPropagation();}
function build(){if(ui)return;var st=el('style',{textContent:CSS},document.head);
  var b=el('button',{id:'zdbgB',textContent:'🐞',title:'Debug'},document.body);
  var p=el('div',{id:'zdbgP'},document.body);
  var tb=el('div',{className:'tb'},p);var tabs={};
  [['perf','Perf'],['prob','Problemi'],['stato','Stato'],['dev','Device']].forEach(function(x){tabs[x[0]]=el('button',{textContent:x[1]},tb);tabs[x[0]].dataset.t=x[0];});
  var cv=el('canvas',{width:316,height:40},p);var bd=el('div',{className:'bd'},p);
  bd.addEventListener('click',function(e){var n=e.target,b=null;while(n&&n!==bd){if(n.getAttribute&&n.getAttribute('data-cpi')!=null){b=n;break;}n=n.parentNode;}if(!b)return;e.stopPropagation();var list=probSorted(),x=list[+b.getAttribute('data-cpi')];if(!x)return;var c=CAUSE[x.k];copy((SEV[x.sev]||'')+' '+x.w+'\n'+x.msg+(c?'\n'+c[0]+'\n'+c[1]:''),b,'Copia errore');});
  var ft=el('div',{className:'ft'},p);var bc=el('button',{textContent:'📋 Copia report'},ft),bs=el('button',{textContent:'✈️ Invia'},ft),br=el('button',{textContent:'↺',className:'s'},ft);br.style.flex='.35';
  [b,p].forEach(function(n){['pointerdown','pointerup','touchstart','touchend','mousedown','click','keydown'].forEach(function(ev){n.addEventListener(ev,stop,{passive:ev.indexOf('touch')<0});});});
  b.addEventListener('click',function(){setOpen(!open);});
  tb.addEventListener('click',function(e){var t=e.target.dataset&&e.target.dataset.t;if(t){tab=t;LS.set('zs_dbg_tab',t);paint(true);}});
  bc.addEventListener('click',function(){copy(JSON.stringify(report(),null,1),bc,'📋 Copia report');});
  bs.addEventListener('click',function(){send(bs);});
  br.addEventListener('click',function(){if(tab==='prob'){PB.list.length=0;pbDirty=true;pbSave();}window.__DBG.reset();paint(true);});
  ui={b:b,p:p,cv:cv,cx:cv.getContext('2d'),bd:bd,tabs:tabs,bc:bc,bs:bs};}
function flashBtn(btn,txt,orig){btn.textContent=txt;setTimeout(function(){btn.textContent=orig;},2200);}
function showCopyBox(text){if(!ui)return null;var box=ui.cp;if(!box){box=el('textarea',{id:'zdbgCopy',readOnly:true});box.setAttribute('aria-label','Report da copiare');ui.cp=box;
  var ft=ui.bc&&ui.bc.parentNode;if(ft&&ft.parentNode)ft.parentNode.insertBefore(box,ft);else ui.p.appendChild(box);
  ['pointerdown','touchstart','mousedown','click'].forEach(function(ev){box.addEventListener(ev,function(e){e.stopPropagation();});});}
  box.value=text;box.style.display='block';try{box.focus({preventScroll:true});box.setSelectionRange(0,text.length);}catch(e){try{box.focus();box.select();}catch(_){}}return box;}
function copy(text,btn,orig){var box=showCopyBox(text);var legacy=false;var done=function(ok){flashBtn(btn,ok?'✅ Copiato':'Testo selezionato, tieni premuto',orig);};
  try{if(box){box.focus();box.setSelectionRange(0,text.length);}legacy=!!document.execCommand('copy');}catch(e){}
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){done(true);},function(){done(legacy);});else done(legacy);}catch(e){done(legacy);}}
function send(btn){var s=summary();var W=window.Telegram&&window.Telegram.WebApp;
  copy(JSON.stringify(report()),{set textContent(v){}},'');            // full JSON also goes to the clipboard
  var url='https://t.me/share/url?url='+encodeURIComponent('Zombie Survival debug')+'&text='+encodeURIComponent(s.slice(0,1800));
  try{if(W&&W.openTelegramLink){W.openTelegramLink(url);flashBtn(btn,'✈️ Aperto','✈️ Invia');return;}}catch(e){}
  try{window.open(url,'_blank');flashBtn(btn,'✈️ Aperto','✈️ Invia');}catch(e){flashBtn(btn,'⚠️ Errore','✈️ Invia');}}
function setOpen(v){if(!ui)return;open=!!v;LS.set('zs_dbg_open',open?'1':'0');ui.p.classList.toggle('show',open);ui.b.classList.toggle('on',open);
  clearInterval(timer);timer=0;if(open){paint(true);timer=setInterval(paint,250);}}
function graph(){var c=ui.cx,w=316,h=40,n=D.fn;c.clearRect(0,0,w,h);c.fillStyle='rgba(255,255,255,.05)';c.fillRect(0,0,w,h);
  var y=function(ms){return h-Math.min(h,ms/50*h);};c.strokeStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(0,y(16.7));c.lineTo(w,y(16.7));c.moveTo(0,y(33.3));c.lineTo(w,y(33.3));c.stroke();
  var bw=w/120;for(var i=0;i<n;i++){var idx=(D.fi-n+i+120)%120,v=D.frames[idx],r=D.rnd[idx],cp=D.cpu[idx];
    c.fillStyle=v>50?'#ff4d4d':v>33.4?'#ffb340':v>20?'#e8e060':'#4fdc8a';c.fillRect(i*bw,y(v),Math.max(1,bw-.3),h-y(v));
    c.fillStyle='rgba(80,160,255,.9)';c.fillRect(i*bw,y(cp),Math.max(1,bw-.3),Math.max(1,y(cp-r)-y(cp)));}
  c.fillStyle='rgba(0,0,0,.55)';c.fillRect(w-30,0,30,h);c.fillStyle='#cde';c.font='8px monospace';c.fillText('50ms',w-28,8);c.fillText('33',w-28,y(33.3)+3);c.fillText('16.7',w-28,y(16.7)+3);}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function kv(k,v,cl){return '<span class="k">'+k+'</span> '+(cl?'<span class="'+cl+'">'+esc(v)+'</span>':esc(v));}
var hT=0;
function paint(force){if(!ui||!open)return;if(tab==='err'||!ui.tabs[tab])tab='prob';for(var k in ui.tabs)ui.tabs[k].classList.toggle('a',k===tab);ui.cv.style.display=tab==='perf'?'':'none';
  var h='',s=stats(),st=state()||{};
  if(tab==='perf'){graph();var m=performance.memory;
    h+=kv('versione',window.GAME_VER||'?')+'  '+kv('debug',VER)+'\n';
    h+=kv('FPS',s.fps,s.fps<30?'r':s.fps<50?'w':'g')+'  '+kv('media',s.avg+'ms')+'  '+kv('p95',s.p95)+'\n';
    h+=kv('peggiore',s.worst+'ms',s.worst>100?'r':s.worst>50?'w':'')+'  '+kv('>50ms',s.long50,s.long50?'w':'')+'  '+kv('>100',s.long100,s.long100?'r':'')+'\n';
    h+=kv('CPU/fr',s.cpu+'ms')+' = '+kv('render',s.render)+' + '+kv('update',s.update)+'\n';
    if(sysOn){var so=sysObj(),tot=0;SYS.forEach(function(k){tot+=so[k];});h+=SYS.map(function(k){return kv(k,so[k].toFixed(2));}).join(' ')+' '+kv('altro',Math.max(0,s.update-tot).toFixed(2))+'\n';}
    else h+='<span class="k">sistemi: riga hook non inserita</span>\n';
    if(st.gl)h+=kv('draw',st.gl.draw,st.gl.draw>250?'w':'')+' '+kv('tri',st.gl.tri>=1000?(st.gl.tri/1000).toFixed(1)+'k':st.gl.tri)+' '+kv('geo',st.gl.geo)+' '+kv('tex',st.gl.tex)+' '+kv('prog',st.gl.prog)+'\n';
    h+=kv('PR',(st.pr||0).toFixed?st.pr.toFixed(2)+'x':st.pr)+'  '+kv('longtask',s.longTasks+(s.longTasks?' ('+s.longTaskMax+'ms)':''))+(D.extRender?' '+kv('render extra',D.extRender):'')+'\n';
    if(m){var hp=D.heap,tr='';if(hp.length>2){var a=hp[0],b=hp[hp.length-1],dt=(b[0]-a[0])/60;tr=dt>=1?((b[1]-a[1])/dt>=0?'+':'')+((b[1]-a[1])/dt).toFixed(1)+'MB/min':'';}
      h+=kv('heap',(m.usedJSHeapSize/1048576).toFixed(1)+'/'+Math.round(m.jsHeapSizeLimit/1048576)+'MB')+' '+kv('trend',tr||'…')+'\n';}else h+='<span class="k">heap: performance.memory non disponibile</span>\n';
    var ne=D.errors.length;h+=kv('errori',ne,ne?'r':'g')+(ne?'  ultimo: '+esc(D.errors[ne-1].msg.slice(0,60)):'');}
  else if(tab==='stato'){if(!st.stato)h='gioco non ancora caricato';else{
    h+=kv('stato',st.stato)+' '+kv('modo',st.modo)+' '+kv('fase',st.fase+' '+st.fasePct+'%')+'\n'+kv('giorno',st.giorno)+' '+kv('ora',st.ora)+' '+kv('ondata',st.ondata)+'\n';
    h+=kv('zombie',st.zombie)+' '+kv('morenti',st.morenti)+' '+kv('pool',st.pool)+' '+kv('orda',st.orda)+'\n';
    var ai=st.ai||{};h+=kv('wander',ai.wander)+' '+kv('chase',ai.chase,ai.chase?'w':'')+' '+kv('search',ai.search)+' '+kv('base',ai.base,ai.base?'r':'')+(ai.boss?' '+kv('boss',ai.boss,'r'):'')+(ai.altro?' '+kv('altro',ai.altro):'')+'\n';
    h+=kv('luci',st.luci)+' <span class="k">('+esc(st.luciTipo.replace(/Hemisphere/,'Hemi').replace(/Directional/,'Dir'))+')</span> '+kv('torcia',st.torcia,st.torcia>0?'w':'')+'\n';
    h+=kv('pos',st.pos.join(','))+' '+kv('hp',st.hp)+' '+kv('uccisi',st.uccisi)+'\n'+kv('arma',st.arma)+' '+kv('pezzi base',st.pezziBase)+'\n';
    var au=st.audio||{};h+=kv('audio',au.stato,au.stato==='running'?'g':'w')+' '+(au.sr?kv('sr',au.sr)+' '+kv('lat',au.lat+'/'+au.outLat)+'\n':'\n')+kv('src attive',au.sorgenti)+' '+kv('picco',au.picco)+' '+kv('nodi',au.nodiCreati);
    if(st.err)h+='\n<span class="r">'+esc(st.err)+'</span>';}}
  else if(tab==='prob'){var PL=probSorted();var LG=[];try{LG=leggi();}catch(e){}h='<div class="er"><b>Lettura</b><br>'+(LG.length?LG.map(esc).join('<br>'):'In attesa di misure.')+'</div>';h+='<span class="k">Problemi nuovi: '+PL.length+' · un problema già visto non viene ricontato</span>';
    if(!PL.length)h+='\n<span class="g">Nessun problema rilevato 👍</span>';
    else h+=PL.slice(0,80).map(function(x,i){var d=new Date(x.last),tt=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);var c=CAUSE[x.k];return '<div class="er">'+SEV[x.sev]+' <span class="k">'+tt+(x.s===SID?'':' (prec.)')+' · '+esc(x.w)+'</span>'+(x.n>1?' <span class="w">×'+x.n+'</span>':'')+' '+esc(x.msg)+'<div><button type="button" class="cp" data-cpi="'+i+'">Copia errore</button></div>'+(c?'<div class="k">causa: '+esc(c[0])+'<br>dove: '+esc(c[1])+'</div>':'')+'</div>';}).join('')+(PL.length>80?'<span class="k">…altri '+(PL.length-80)+' nel report copiato</span>':'');}
  else if(tab==='dev'){var d=device(),g=d.gpu||{};h+=kv('GPU',g.renderer||'?')+'\n'+kv('vendor',g.vendor||'?')+'\n'+kv('GL',(g.webgl2?'WebGL2':'WebGL1')+' maxTex '+g.maxTex+' aa '+g.aa)+'\n';
    h+=kv('schermo',d.schermo+' finestra '+d.finestra+' dpr '+d.dpr)+'\n'+kv('cpu',d.core+' core')+' '+kv('ram',d.mem?d.mem+'GB':'?')+'\n';
    h+=kv('Telegram',(d.tg.platform||'-')+' v'+(d.tg.version||'-')+' fs '+d.tg.fullscreen)+'\n'+kv('UA',d.ua.slice(0,150));}
  ui.bd.innerHTML=h;dbgBadge();}
// ---------------- start ----------------
var heapT=0;
function attach(){var g=G();if(g&&g.renderer)hookRenderer(g.renderer);}
function dbgBadge(){if(!ui)return;var n=0;for(var i=0;i<PB.list.length;i++)if(PB.list[i].s===SID&&PB.list[i].sev!=='info')n++;ui.b.textContent=n?('🐞'+n):'🐞';ui.b.title=n?(n+' problemi in questa sessione'):'Debug';}
function startUI(){build();attach();dbgBadge();setInterval(dbgBadge,1000);if(!R){var tries=0,iv=setInterval(function(){attach();if(R||++tries>40)clearInterval(iv);},250);}
  heapSample();heapT=setInterval(heapSample,2000);
  if(LS.get('zs_dbg')==='off'&&!urlDbg){ui.b.style.display='none';}   // owner can hide the bug with localStorage zs_dbg=off
  setOpen(urlDbg||LS.get('zs_dbg_open')==='1');}
function uninstall(){try{if(oStart)window.AudioScheduledSourceNode.prototype.start=oStart;}catch(e){}window.requestAnimationFrame=oRAF;console.error=oErr;console.warn=oWarn;delete window.__DBG;}
function ready(f){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else setTimeout(f,0);}
try{window.__boot432.g0=performance.now();}catch(e){}
ready(startUI);
var n=0,iv2=setInterval(function(){var id=tgUser();if(id===OWNER){clearInterval(iv2);return;}
  if(id!==null&&id!==OWNER){clearInterval(iv2);uninstall();var b=document.getElementById('zdbgB'),pn=document.getElementById('zdbgP');if(b)b.remove();if(pn)pn.remove();return;}
  if(++n>40)clearInterval(iv2);},250);
}
})();
