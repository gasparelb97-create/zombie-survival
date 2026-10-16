'use strict';
// ======================= v4.3.87: one debug button + clean report panel, 3D rotating weapon preview, Survival chooser, crafting no-scroll, tutorial after load =======================
(function(){
const $$=id=>document.getElementById(id);
const css=`
#zdbgP,#dg482,#fps,#adm472,.dbgBand,#zdbgCopy{display:none!important}
#zdbgB{font-size:15px!important}#zdbgB{display:none!important}body.dev487 #dbgB487{display:flex!important;align-items:center;justify-content:center}
#craftScreen #recipes{row-gap:6px!important}#craftScreen #recipes .recipe{padding:4px 8px!important;min-height:0!important}#craftScreen #recipes .recipe img,#craftScreen #recipes .recipe canvas,#craftScreen #recipes .recipe .pv481{width:42px!important;height:42px!important;min-height:0!important}#craftScreen #craftClose,#craftScreen .sheet>button:last-child{height:32px!important;min-height:0!important;line-height:32px!important;padding-top:0!important;padding-bottom:0!important}
#craftScreen .sb42{display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important}#craftScreen .sb42>*{flex:0 0 auto}#craftScreen .sb42>#recipes{flex:1 1 0!important;min-height:0!important;height:auto!important;max-height:none!important;align-content:start!important;grid-auto-rows:min-content}
#dbg487{position:fixed;inset:0;z-index:2147483300;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-family:system-ui,sans-serif}#dbg487.hidden{display:none}
#dbg487 .p{width:min(560px,90vw);height:min(300px,86vh);display:flex;flex-direction:column;background:#111318;border:1px solid #3a3f48;border-radius:10px;padding:12px;box-sizing:border-box;color:#ddd}
#dbg487 h4{margin:0 0 6px;font:900 14px system-ui;letter-spacing:.06em}#dbg487 pre{flex:1;margin:0;overflow:hidden;white-space:pre-wrap;font:11px/1.35 ui-monospace,monospace;color:#b9c0c8;background:#0a0b0e;border-radius:6px;padding:8px}
#dbg487 .r{display:flex;gap:8px;margin-top:8px}#dbg487 button{flex:1;height:36px;border-radius:8px;border:0;font:900 13px system-ui;color:#fff;background:#2f6fb8}#dbg487 button.g{background:#333842}
#craftScreen,#craftScreen *{overscroll-behavior:none!important}#craftScreen .sheet,#craftScreen .sb42,#craftScreen #recipes{overflow:hidden!important;touch-action:manipulation}
#chs487{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:center;justify-content:center;background:rgba(3,4,6,.72);font-family:system-ui,sans-serif}#chs487.hidden{display:none}
#chs487 .p{width:min(440px,86vw);background:linear-gradient(180deg,#16191f,#0d0f13);border:1px solid #3a3f48;border-left:3px solid #c8372d;border-radius:8px;padding:14px;box-sizing:border-box;color:#e6e2da}
#chs487 h4{margin:0 0 10px;font:900 16px system-ui;letter-spacing:.1em;text-transform:uppercase}#chs487 button{display:block;width:100%;height:46px;margin-top:8px;border-radius:8px;border:1px solid #4a4e57;background:#1c1f25;color:#fff;font:900 14px system-ui;letter-spacing:.06em;text-align:left;padding:0 14px}
#chs487 button small{display:block;font:500 11px system-ui;opacity:.7;letter-spacing:0}#chs487 button.solo{background:linear-gradient(180deg,#9c2a22,#6e1a15);border-color:#c8372d}#chs487 button.mp{background:linear-gradient(180deg,#2f6fb8,#1d4a82);border-color:#5aa0ff}#chs487 button.x{height:34px;text-align:center;background:none}
.v3d487{width:100%;height:100%;display:block}
`;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
// ---------- (1) debug: one button, one clean panel with Copia report
const dp=document.createElement('div');dp.id='dbg487';dp.className='hidden';dp.innerHTML='<div class="p"><h4>DEBUG · Zombie Survival '+(typeof GAME_VER!=='undefined'?GAME_VER:'')+'</h4><pre></pre><div class="r"><button data-a="copy">Copia report</button><button class="g" data-a="close">Chiudi</button></div></div>';document.body.appendChild(dp);
function rep(){let r={};try{r=window.__DBG&&__DBG.report?__DBG.report():{};}catch(e){r={err:String(e)};}try{r.findings=window.__dbg482&&__dbg482.findings?__dbg482.findings():r.findings;}catch(e){}return JSON.stringify(r,null,1);}
function sum(t){try{const r=JSON.parse(t),p=r.perf||{};return 'Versione '+(r.ver||'')+'\nFPS medio '+(p.fpsAvg||p.avg||'?')+' · peggiore '+(p.worst||'?')+' ms\nErrori '+((r.errori||[]).length||0)+' · problemi '+((r.problemi||[]).length||0)+'\n\n'+t.slice(0,1800);}catch(e){return t.slice(0,2000);}}
function copy(t){let ok=false;try{if(window.ZSNative&&ZSNative.copy)ok=!!ZSNative.copy(t);}catch(e){}
  if(!ok){try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(()=>{});ok=true;}}catch(e){}}
  if(!ok){try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(a);a.select();ok=document.execCommand('copy');a.remove();}catch(e){}}return ok;}
const db=document.createElement('button');db.id='dbgB487';db.textContent='🐞';db.style.cssText='position:fixed;right:6px;bottom:6px;z-index:2147483200;width:34px;height:34px;border-radius:50%;border:1px solid #555;background:rgba(15,17,22,.85);color:#fff;font-size:16px;padding:0;display:none';document.body.appendChild(db);db.addEventListener('click',e=>{e.stopPropagation();openDbg();});
let last='';dp.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b){if(e.target===dp)dp.classList.add('hidden');return;}
  if(b.dataset.a==='close')dp.classList.add('hidden');else{const ok=copy(last||rep());b.textContent=ok?'Copiato':'Copia non riuscita';setTimeout(()=>b.textContent='Copia report',1600);}});
function openDbg(){last=rep();dp.querySelector('pre').textContent=sum(last);dp.classList.remove('hidden');}
['click','touchend'].forEach(ev=>document.addEventListener(ev,e=>{const b=e.target.closest&&e.target.closest('#zdbgB');if(!b)return;e.stopImmediatePropagation();e.preventDefault();if(ev==='touchend'||!openDbg.t||Date.now()-openDbg.t>600){openDbg.t=Date.now();openDbg();}},true));
// debug button hidden by default; long-press the home title 5 s toggles it (persisted in localStorage zs_dev). Error capture (debug.js / blackbox) always runs regardless.
try{if(!localStorage.getItem('zs_dev487m')){localStorage.setItem('zs_dev','0');localStorage.setItem('zs_dev487m','1');document.body.classList.remove('zsDev');}if(localStorage.getItem('zs_dev')==='1')document.body.classList.add('dev487');}catch(e){}
(function(){let tm=0;const st0=e=>{if(!(e.target.closest&&e.target.closest('#startScreen .ztitle')))return;clearTimeout(tm);tm=setTimeout(()=>{const on=!document.body.classList.contains('dev487');document.body.classList.toggle('dev487',on);try{localStorage.setItem('zs_dev',on?'1':'0');}catch(_){}try{toast&&toast(on?'Debug visibile':'Debug nascosto');}catch(_){}if(navigator.vibrate)navigator.vibrate(60);},5000);};const en=()=>clearTimeout(tm);
  document.addEventListener('pointerdown',st0,true);['pointerup','pointercancel','pointerleave'].forEach(v=>document.addEventListener(v,en,true));})();
setInterval(()=>{const b=$$('zdbgB');if(b){const d='none';if(b.style.getPropertyValue('display')!==d)b.style.setProperty('display',d,'important');}if(b&&b.textContent!=='🐞')b.textContent='🐞';},1500);
// ---------- (2) real 3D weapon preview, one shared renderer, full 360° turn
const V={r:null,sc:null,cam:null,env:null,obj:null,key:'',host:null,raf:0,t:0,mc:new Map(),fail:false};
function initR(){if(V.r||V.fail)return !!V.r;try{const T=THREE,r=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});r.setPixelRatio(Math.min(2,devicePixelRatio||1));r.setClearColor(0,0);r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.15;if('outputColorSpace' in r)r.outputColorSpace=T.SRGBColorSpace;r.domElement.className='v3d487';
  const es=new T.Scene();es.add(new T.Mesh(new T.SphereGeometry(10,16,8),new T.MeshBasicMaterial({color:0x8a8f99,side:T.BackSide})));const pl=new T.Mesh(new T.PlaneGeometry(6,2),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));pl.position.set(3,5,4);pl.lookAt(0,0,0);es.add(pl);
  const pm=new T.PMREMGenerator(r);V.env=pm.fromScene(es,.02).texture;pm.dispose();
  const sc=new T.Scene();sc.add(new T.HemisphereLight(0xeef3ff,0x40382f,.9));const k=new T.DirectionalLight(0xffffff,2);k.position.set(1.5,3,2);sc.add(k);const rim=new T.DirectionalLight(0xcfe0ff,1.6);rim.position.set(-2,1,-3);sc.add(rim);
  V.cam=new T.PerspectiveCamera(28,2,.05,20);V.r=r;V.sc=sc;return true;}catch(e){V.fail=true;return false;}}
function mat(m){if(!m||!m.isMaterial)return m;let c=V.mc.get(m.uuid);if(c)return c;c=m.clone();if(c.isMeshStandardMaterial){c.envMap=V.env;c.envMapIntensity=Math.min(1.6,m.envMapIntensity||1);}V.mc.set(m.uuid,c);return c;}
function model(k){try{const vm=VM[k],hi=vm&&vm.userData.hi43;const src=hi?hi.g:vm;if(!src)return null;const g=src.clone(true);g.visible=true;g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);
  g.traverse(m=>{if(m.isSprite||m.isLight){m.visible=false;return;}if(m.isMesh){if((typeof gloveM!=='undefined'&&m.material===gloveM)||(typeof sleeveM!=='undefined'&&m.material===sleeveM)){m.visible=false;return;}m.visible=true;m.material=mat(m.material);if(m.material&&m.material.transparent&&m.material.opacity<.05)m.visible=false;}});
  const piv=new THREE.Group(),inner=new THREE.Group();inner.add(g);if(k==='axe'){g.rotation.x=-Math.PI/2;g.rotation.y=Math.PI;}else if(/^(pick|hammer)$/.test(k))g.rotation.z=-Math.PI/2;
  inner.rotation.y=Math.PI/2;piv.add(inner);piv.updateMatrixWorld(true);const b=new THREE.Box3();piv.traverse(m=>{if(m.isMesh&&m.visible){m.geometry.computeBoundingBox();b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));}});
  const c=b.getCenter(new THREE.Vector3()),s=b.getSize(new THREE.Vector3());inner.position.sub(c);piv.userData.R=Math.hypot(s.x,s.z)*.5;piv.userData.H=s.y*.5;return piv;}catch(e){return null;}}
function loop(t){V.raf=0;if(!V.host||!V.host.isConnected||!V.host.offsetWidth){stop();return;}const dt=Math.min(.05,(t-(V.t||t))/1000);V.t=t;
  const w=V.host.clientWidth,h=V.host.clientHeight;if(V.r.domElement.width!==Math.round(w*V.r.getPixelRatio())||V.r.domElement.height!==Math.round(h*V.r.getPixelRatio())){V.r.setSize(w,h,false);V.cam.aspect=w/h;V.cam.updateProjectionMatrix();}
  if(V.obj){V.obj.rotation.y+=dt*.9;const R=V.obj.userData.R||.4,H=V.obj.userData.H||.1;const tv=Math.tan(V.cam.fov*Math.PI/360),th=tv*V.cam.aspect,dist=Math.max(R/th,(H*1.3)/tv)*1.06+R*.3;V.cam.position.set(0,R*.18,dist);V.cam.lookAt(0,0,0);}
  V.r.render(V.sc,V.cam);V.raf=requestAnimationFrame(loop);}
function stop(){if(V.raf)cancelAnimationFrame(V.raf);V.raf=0;if(V.obj){V.sc.remove(V.obj);V.obj=null;}V.key='';V.host=null;/* 4.3.88: keep the one small renderer + env map for the session (re-creating them cost a 0.3-0.4 s long task on every backpack/shop open); only free the cloned materials */if(V.r){try{V.r.domElement.remove();}catch(e){}V.mc.forEach(m=>{try{m.dispose();}catch(e){}});V.mc.clear();}}
function show(host,k){if(!host)return false;if(V.host===host&&V.key===k&&V.raf)return true;if(!initR())return false;const o=model(k);if(!o)return false;if(V.obj)V.sc.remove(V.obj);V.obj=o;V.sc.add(o);V.key=k;V.host=host;
  host.querySelectorAll('img').forEach(i=>i.style.display='none');if(V.r.domElement.parentNode!==host)host.appendChild(V.r.domElement);if(!V.raf){V.t=0;V.raf=requestAnimationFrame(loop);}return true;}
window.view3d487={show,stop};
function keyOf(img){const m=img&&(img.getAttribute('src')||'').match(/assets\/icons\/([a-z]+)\.webp/);return m&&typeof VM!=='undefined'&&VM[m[1]]?m[1]:null;}
function sync(){try{let host=null,k=null;const sh=$$('shopScreen');if(sh&&!sh.classList.contains('hidden')){const hi=document.querySelector('#hero484 .hImg');const im=hi&&hi.querySelector('img');k=keyOf(im);host=k?hi:null;}
  if(!host){const bg=$$('bag484');const bi=bg&&bg.offsetParent!==null||bg&&getComputedStyle(bg).display!=='none'?bg.querySelector('.pn.det .bi'):null;const im=bi&&bi.querySelector('img');k=keyOf(im);host=k?bi:null;}
  if(host&&k){if(!show(host,k)){const im=host.querySelector('img');im&&(im.style.display='');}}else if(V.host)stop();}catch(e){}}
let q=0;new MutationObserver(()=>{if(q)return;q=1;requestAnimationFrame(()=>{q=0;sync();});}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','src','style']});
setInterval(sync,1000);
// non-weapon items in the shop panel: continuous 360° turn of the picture
st.textContent+='#hero484 .hImg{flex:0 0 44%!important;height:auto!important;min-height:96px!important;position:relative}#hero484 .hImg canvas.v3d487{position:absolute;inset:0;width:100%!important;height:100%!important}#hero484 .hDesc,#hero484 .why{display:none!important}#hero484 .hImg img{animation:spin487 6s linear infinite!important}@keyframes spin487{from{transform:perspective(600px) rotateY(0deg)}to{transform:perspective(600px) rotateY(360deg)}}';
// ---------- (B/C) crafting: polished weapons-tab icon, no scrolling at all
try{const u=document.querySelector('#craftTabs [data-c="up"] img.ti486');if(u){u.src='assets/icons/ar.webp';u.style.width='30px';u.style.height='15px';u.style.objectFit='contain';}}catch(e){}
document.addEventListener('scroll',e=>{const t=e.target;if(t&&t.closest&&t.closest('#craftScreen')){if(t.scrollTop)t.scrollTop=0;if(t.scrollLeft&&t.id!=='craftTabs')t.scrollLeft=0;}},true);
try{const cs=$$('craftScreen');cs&&cs.addEventListener('touchmove',e=>{if(!e.target.closest('#craftTabs')&&e.cancelable)e.preventDefault();},{passive:false});}catch(e){}
function fitCraft(){try{const cs=$$('craftScreen');if(!cs||cs.classList.contains('hidden'))return;const r=$$('recipes'),sb=r&&r.parentElement;if(!sb)return;let used=0;for(const k of sb.children){if(k===r||getComputedStyle(k).display==='none')continue;const q=getComputedStyle(k);used+=k.offsetHeight+parseFloat(q.marginTop)+parseFloat(q.marginBottom);}
  const rq=getComputedStyle(r),h=Math.floor(sb.clientHeight-used-parseFloat(rq.marginTop)-parseFloat(rq.marginBottom)-2);if(h>40&&Math.abs(r.offsetHeight-h)>2){r.style.setProperty('height',h+'px','important');r.style.setProperty('max-height',h+'px','important');}}catch(e){}}
new MutationObserver(()=>requestAnimationFrame(fitCraft)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setInterval(fitCraft,800);
// ---------- (D) Survival: choose solo or multiplayer
const ch=document.createElement('div');ch.id='chs487';ch.className='hidden';document.body.appendChild(ch);let pass=0;
function chooser(){let save=false;try{save=!!svLoadData();}catch(e){}
  ch.innerHTML='<div class="p"><h4>Survival</h4><button class="solo" data-c="solo">Gioca da solo<small>'+(save?'Continua dalla tua base':'Nuova partita')+'</small></button>'+(save?'<button data-c="new">Nuova partita da solo<small>Il mondo salvato verrà cancellato</small></button>':'')+'<button class="mp" data-c="mp">Multigiocatore<small>Stanza con codice, co-op online</small></button><button class="x" data-c="x">Annulla</button></div>';ch.classList.remove('hidden');}
ch.addEventListener('click',e=>{const b=e.target.closest('button[data-c]');if(!b){if(e.target===ch)ch.classList.add('hidden');return;}ch.classList.add('hidden');const c=b.dataset.c;
  if(c==='solo'){pass=Date.now();try{startGame();}catch(err){}}else if(c==='new'){const n=$$('btnNewRun');n&&n.click();}else if(c==='mp'){try{window.MP&&MP.open();}catch(err){}}});
/* 4.3.91: Survival/GIOCA starts solo directly again (chooser removed; Multigiocatore has its own button) */
// ---------- (4) version labels
function ver(){try{if(typeof GAME_VER==='undefined')return;document.querySelectorAll('.ver422,#startScreen .zver,#startScreen small, #startScreen .ver').forEach(el=>{if(/Zombie Survival v4\.\d+\.\d+/.test(el.textContent)&&el.children.length===0)el.textContent=el.textContent.replace(/v4\.\d+\.\d+/,'v'+GAME_VER);});
  const w=document.createTreeWalker($$('startScreen')||document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(/Zombie Survival v4\.\d+\.\d+/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/v4\.\d+\.\d+/,'v'+GAME_VER);}}catch(e){}}
ver();setTimeout(ver,1500);setTimeout(ver,5000);setInterval(ver,10000);
})();
