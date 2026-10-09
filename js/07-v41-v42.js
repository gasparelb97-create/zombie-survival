/* Zombie Survival — game code part 07-v41-v42 (game.html lines 3836-4770 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.1.2 hotfix: Telegram late-init, robust taps, Stars fallback, viewport fit =======================
const TG_BOT='Zombie_SurvivalGame_bot',GRANT_SALT='zsg-grant-v412-k7Qp';
function tgLive(){const W=window.Telegram&&window.Telegram.WebApp;return W&&(W.initData||(W.platform&&W.platform!=='unknown'))?W:null;}
function slog(){try{window.__DBG&&window.__DBG.log&&window.__DBG.log('shop',Array.from(arguments).join(' '));}catch(e){}}
// SDK may arrive late (async load / slow network): keep trying to init for ~12s
(function(){let n=0;const iv=setInterval(()=>{n++;if(TG.W){clearInterval(iv);return;}if(tgLive()){try{tgInit();}catch(e){}if(TG.W){slog('tg late init',n*250+'ms');try{if(!$('shopScreen').classList.contains('hidden'))renderShop();}catch(e){}}}if(n>48)clearInterval(iv);},250);})();
// small edge button: "Paga in chat" (bot sends a native invoice in the chat)
let pcTO=null;
function payChatOffer(id){slog('payChat disabled',id);}
function hidePayChat(){const b=$('payChat');if(b)b.classList.remove('show');}
// Stars purchase (4.1.3): ALWAYS inside the game via openInvoice; never silent, never redirects to chat
starBuy=function(id){const url=INVOICE_LINKS[id];let W=TG.W||tgLive();if(W&&!TG.W){try{tgInit();}catch(e){}}
  const has=!!(W&&W.openInvoice),ver=W&&W.version,okv=!!(W&&(!W.isVersionAtLeast||W.isVersionAtLeast('6.1')));
  slog('buy',id,'url='+(url?'ok':'MISSING'),'W='+(W?1:0),'ver='+ver,'plat='+(W&&W.platform),'openInvoice='+(has?1:0),'v6.1='+(okv?1:0),'full='+(W&&W.isFullscreen?1:0));
  if(!url){mtoast('Articolo non disponibile al momento',2400);return;}
  if(!W){mtoast('Il pagamento con ⭐ Stelle funziona solo aprendo il gioco dal bot in Telegram',3200);slog('no Telegram.WebApp');return;}
  if(!has||!okv){mtoast('Aggiorna Telegram per pagare con le ⭐ Stelle (versione '+(ver||'?')+')',3200);slog('openInvoice unavailable');return;}
  const now=Date.now();if(invBusy.id===id&&now-invBusy.t<1500){slog('busy',id);return;}invBusy={t:now,id};
  let got=false;const to=setTimeout(()=>{if(!got)slog('no callback 4s (sheet may still be open)',id);},4000);
  const cb=st=>{got=true;clearTimeout(to);invBusy.t=0;slog('cb',id,st);
    if(st==='paid')grant(id);else if(st==='failed')mtoast('Pagamento non riuscito',2200);else if(st==='pending')mtoast('⏳ Pagamento in elaborazione…',2200);else if(st==='cancelled')mtoast('Pagamento annullato',1400);};
  mtoast('⭐ Apro il pagamento…',1600);
  try{W.openInvoice(url,cb);slog('openInvoice called',id);}catch(e){clearTimeout(to);invBusy.t=0;slog('openInvoice threw',e&&e.message);mtoast('Pagamento non disponibile: '+((e&&e.message)||'errore'),3200);}};
// robust taps on shop / tabs / dialogs (real phones: touch -> click can get lost)
function fastTap(el,sel){if(!el)return;let sx=0,sy=0,st=0,mv=false;
  el.addEventListener('touchstart',e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY;st=Date.now();mv=false;},{passive:true});
  el.addEventListener('touchmove',e=>{const t=e.changedTouches[0];if(Math.hypot(t.clientX-sx,t.clientY-sy)>12)mv=true;},{passive:true});
  el.addEventListener('touchend',e=>{if(mv||Date.now()-st>900)return;const t=e.changedTouches[0];const tg=document.elementFromPoint(t.clientX,t.clientY)||e.target;
    const b=tg&&tg.closest&&tg.closest(sel);if(!b||!el.contains(b)||b.disabled)return;if(e.cancelable)e.preventDefault();b.__tt=Date.now();b.click();},{passive:false});
  el.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest(sel);if(b&&e.isTrusted&&b.__tt&&Date.now()-b.__tt<700){e.stopImmediatePropagation();e.preventDefault();}},true);}
// v4.1.4: ONE resolver for every shop / tab / dialog control. The WHOLE shop card is a tap target (picture, name, price, button).
// Window-level CAPTURE listeners; tap = same card/control within 24 px / 800 ms (event timestamps); click as fallback; dedupe; everything logged.
const TAP_ROOT='#shopList,#shopTabs,#dlgBtns';
const TAP_SEL='[data-buy],[data-eq],[data-ad],[data-adgem],[data-cbuy],[data-prova],[data-item],.scard,button,.tab';
let tapDown=null,tapLast={k:'',t:0},tapFireT=-1e9;
function tDesc(e){if(!e)return 'null';return (e.tagName||'?').toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'')+(e.dataset&&e.dataset.buy?'[buy='+e.dataset.buy+']':'');}
function tapRes(el){if(!el||!el.closest)return null;const root=el.closest(TAP_ROOT);if(!root)return null;const c=el.closest(TAP_SEL);return c&&root.contains(c)?c:null;}
function tapBtnAt(x,y,t){return tapRes(t)||tapRes(document.elementFromPoint(x,y));}
function cardOf(b){return b&&b.closest?b.closest('.scard'):null;}
function cardBtns(c){return [...c.querySelectorAll('button')];}
function ctlId(b){const d=b.dataset||{};return d.buy||d.cbuy||d.eq||d.ad||d.adgem||d.prova||d.item||d.t||'';}
function cardId(c){const bs=cardBtns(c);for(const b of bs){const i=ctlId(b);if(i)return i;}return (c.querySelector('.sname')||c).textContent.trim().slice(0,24);}
function tapKey(b){const c=cardOf(b);return c?'card|'+cardId(c):(ctlId(b)+'|'+(b.dataset.m||'')+'|'+(b.textContent||'').slice(0,24));}
function ctlAct(b,via){const d=b.dataset;slog('act',via,tDesc(b),'id='+ctlId(b),'m='+(d.m||''));
  try{if(d.buy){buy(d.buy,d.m);return;}if(d.eq){PROF.eqw=d.eq;saveProf();renderShop();mtoast('✔ Equipaggiata',1200);return;}
    if(d.ad){adTrial(d.ad);return;}if(d.adgem){adGems();return;}}catch(e){slog('act threw',e&&e.message);mtoast('Errore: '+(e&&e.message),2500);return;}
  b.__syn=1;try{b.click();}finally{b.__syn=0;}}
function cardAct(c,via){const id=cardId(c),bs=cardBtns(c),on=bs.filter(b=>!b.disabled);slog('card',via,'id='+id,'btns='+bs.length,'enabled='+on.length);
  if(!on.length){if(bs.length)mtoast(bs[0].textContent.trim(),1400);return;}
  if(on.length===1){ctlAct(on[0],via+'>card');return;}
  const nm=(c.querySelector('.sname')||{}).textContent||id;
  dialog(nm,'Scegli come sbloccarla:',on.map(b=>({label:b.textContent.trim(),fn:()=>ctlAct(b,'choice')})).concat([{label:'Annulla',ghost:1}]));}
let tapUp424=null,tapFP424=null,tapPD424=-1e9;
function tapFire(b,via){const k=tapKey(b),now=performance.now();if(tapLast.k===k&&now-tapLast.t<700){slog('tap dup',via,k);return;}tapLast={k,t:now};
  if(via!=='click'){tapFireT=now;tapFP424=tapUp424&&now-tapUp424.t<1000?tapUp424:null;}const c=cardOf(b);slog('tap FIRE',via,tDesc(b),c?'card='+cardId(c):'');
  if(c){if(b.tagName==='BUTTON'&&!b.disabled){ctlAct(b,via);return;}cardAct(c,via);return;}
  if(b.disabled){slog('disabled');return;}
  if(b.closest('#shopList')&&b.dataset.buy){ctlAct(b,via);return;}
  b.__syn=1;try{b.click();}finally{b.__syn=0;}}
function tapOpen(){return !$('shopScreen').classList.contains('hidden')||!$('dlgScreen').classList.contains('hidden');}
function tapStart(x,y,t,ts,via){if(!tapOpen())return;const b=tapBtnAt(x,y,t);tapDown={x,y,ts,b,via};const c=cardOf(b);
  slog('tap down',via,Math.round(x)+','+Math.round(y),'t='+tDesc(t),'efp='+tDesc(document.elementFromPoint(x,y)),'btn='+(b?tDesc(b):'-'),c?'card='+cardId(c):'');}
function tapEnd(x,y,t,ts,via){if(!tapDown||!tapOpen()){tapDown=null;return;}const d=tapDown;tapDown=null;const u=tapBtnAt(x,y,null);const mv=Math.hypot(x-d.x,y-d.y),dt=ts-d.ts;
  const same=!!d.b&&(u===d.b||(cardOf(d.b)&&cardOf(d.b)===cardOf(u))||(u&&tapKey(u)===tapKey(d.b))||(!u&&mv<=24));
  slog('tap up',via,'mv='+Math.round(mv),'dt='+Math.round(dt),'btn='+(u?tDesc(u):'-'),'same='+(same?1:0)+(d.cx?' drag':''));if(d.cx||!same||mv>10||dt>800)return;tapUp424={x,y,t:performance.now()};tapFire(d.b,via);}
addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;tapStart(e.clientX,e.clientY,e.target,e.timeStamp,'ptr');},true);
addEventListener('pointerup',e=>{tapEnd(e.clientX,e.clientY,e.target,e.timeStamp,'ptr');},true);
addEventListener('pointercancel',e=>{if(tapDown&&tapDown.via==='ptr'){tapDown.cx=1;slog('tap pointercancel');}},true);
addEventListener('touchstart',e=>{if(tapDown&&tapDown.via==='ptr')return;const t=e.changedTouches[0];if(t)tapStart(t.clientX,t.clientY,e.target,e.timeStamp,'touch');},{capture:true,passive:true});
addEventListener('touchend',e=>{const t=e.changedTouches[0];if(!t)return;if(tapDown)tapEnd(t.clientX,t.clientY,e.target,e.timeStamp,tapDown.via==='ptr'?'touch2':'touch');},{capture:true,passive:true});
addEventListener('pointerdown',()=>{tapPD424=performance.now();},true);addEventListener('touchstart',()=>{tapPD424=performance.now();},{capture:true,passive:true});
addEventListener('click',e=>{if(e.isTrusted&&performance.now()-tapFireT<800){const F=tapFP424,age=Math.round(performance.now()-tapFireT),dist=F?Math.round(Math.hypot(e.clientX-F.x,e.clientY-F.y)):-1,fresh=tapPD424>tapFireT;
  if(!fresh&&age<=350&&F&&dist<=30){e.stopImmediatePropagation();e.preventDefault();slog('ghost click eaten',tDesc(e.target),'age='+age,'d='+dist);tapFireT=-1e9;return;}
  slog('click kept (not ghost)',tDesc(e.target),'age='+age,'d='+dist,fresh?'new touch':'');tapFireT=-1e9;}if(!tapOpen())return;const b=tapRes(e.target);if(!b||b.__syn||!e.isTrusted)return;
  e.stopImmediatePropagation();e.preventDefault();const k=tapKey(b);if(tapLast.k===k&&performance.now()-tapLast.t<700)return;tapFire(b,'click');},true);
// 4.1.4b: Telegram safe areas applied explicitly (older SDKs don't set the CSS vars) + shop compaction from the REAL list height
function tgSafe(){const W=TG.W||tgLive();if(!W)return;const de=document.documentElement,a=W.safeAreaInset||{},c=W.contentSafeAreaInset||{};
  for(const k of ['top','bottom','left','right']){if(a[k]!=null)de.style.setProperty('--tg-safe-area-inset-'+k,(+a[k]||0)+'px');if(c[k]!=null)de.style.setProperty('--tg-content-safe-area-inset-'+k,(+c[k]||0)+'px');}}
function shopFit(){const L=$('shopList'),S=$('shopScreen');if(!L||S.classList.contains('hidden'))return;const h=L.clientHeight,land=innerWidth>innerHeight;
  S.classList.toggle('shopC',land&&h<245);S.classList.toggle('shopXC',land&&h<185);document.body.classList.toggle('hasDbg',!!document.getElementById('zdbgB'));
  slog('shopFit','listH='+h,'vh='+innerHeight,'sat='+getComputedStyle(document.documentElement).getPropertyValue('--tg-content-safe-area-inset-top'),'C='+S.classList.contains('shopC')+' XC='+S.classList.contains('shopXC'));}
(function(){tgSafe();let hooked=false;const hook=()=>{const W=TG.W||tgLive();if(!W||hooked||!W.onEvent)return;hooked=true;
    for(const ev of ['safeAreaChanged','contentSafeAreaChanged','fullscreenChanged','viewportChanged'])try{W.onEvent(ev,()=>{tgSafe();setTimeout(shopFit,60);try{fitVP();}catch(e){}try{if(typeof bag432Fit==='function')bag432Fit();}catch(e){}});}catch(e){}};hook();
  const iv=setInterval(()=>{tgSafe();hook();if(hooked)clearInterval(iv);},500);setTimeout(()=>clearInterval(iv),15000);
  try{new ResizeObserver(()=>shopFit()).observe($('shopList'));}catch(e){}
  new MutationObserver(()=>{tgSafe();requestAnimationFrame(shopFit);}).observe($('shopScreen'),{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>setTimeout(shopFit,80));})();
// 4.1.5: one-time welcome gift +20 💎 (new AND existing players, once). Flag in localStorage + Telegram CloudStorage (survives reinstall/clear).
(function(){const FLAG='zc_gift20',AMT=20;if(LS.get(FLAG,0))return;
  const css=document.createElement('style');css.textContent=
  '#gift415{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(4,6,12,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);padding:calc(10px + var(--sat)) calc(12px + var(--sar)) calc(10px + var(--sab)) calc(12px + var(--sal));opacity:0;transition:opacity .25s}'+
  '#gift415.on{opacity:1}#gift415 .gBox{position:relative;width:min(340px,92vw);max-height:100%;overflow:hidden;text-align:center;border-radius:20px;padding:18px 18px 16px;background:linear-gradient(180deg,#1d2a44,#121827);border:1px solid rgba(111,214,255,.45);box-shadow:0 0 40px rgba(63,162,255,.35),0 12px 30px rgba(0,0,0,.5);transform:scale(.7);transition:transform .35s cubic-bezier(.2,1.6,.4,1)}'+
  '#gift415.on .gBox{transform:scale(1)}#gift415 .gIco{font-size:clamp(40px,11vh,64px);line-height:1.1;animation:g415b 1.4s ease-in-out infinite}'+
  '#gift415 h2{margin:6px 0 2px;font-family:"ZRaj",sans-serif;font-size:clamp(18px,5.2vh,24px);color:#fff}#gift415 .gAmt{font-family:"ZRaj",sans-serif;font-weight:700;font-size:clamp(28px,9vh,44px);color:#bff0ff;text-shadow:0 0 18px rgba(111,214,255,.7)}'+
  '#gift415 .gSub{font-size:13px;opacity:.75;margin:2px 0 12px}#gift415 button{width:100%;min-height:48px;border:0;border-radius:14px;font-size:18px;font-weight:800;color:#2a1600;background:linear-gradient(135deg,#ffd34a,#ff9a1f);box-shadow:0 4px 0 #b05a00;touch-action:manipulation}'+
  '#gift415 .gFly{position:absolute;left:50%;top:42%;font-size:22px;pointer-events:none;animation:g415f 1.3s ease-out forwards}'+
  '@keyframes g415b{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-6px) rotate(4deg)}}'+
  '@keyframes g415f{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}15%{opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1);opacity:0}}';
  document.head.appendChild(css);
  let shown=false;
  function show(){if(shown)return;shown=true;LS.set(FLAG,1);try{if(cloudOK())TG.W.CloudStorage.setItem(FLAG,'1',()=>{});}catch(e){}
    addGems(AMT,true);try{play('buy');}catch(e){}slog&&slog('gift +'+AMT+' granted');
    const d=document.createElement('div');d.id='gift415';d.innerHTML='<div class="gBox"><div class="gIco">🎁</div><h2>Regalo di benvenuto</h2><div class="gAmt">+'+AMT+' 💎</div><div class="gSub">Già accreditati sul tuo profilo. Buona caccia!</div><button id="giftOk">Grazie!</button></div>';
    document.body.appendChild(d);const box=d.querySelector('.gBox');
    for(let i=0;i<14;i++){const f=document.createElement('span');f.className='gFly';f.textContent='💎';const a=Math.random()*Math.PI*2,r=60+Math.random()*90;f.style.setProperty('--dx',Math.cos(a)*r+'px');f.style.setProperty('--dy',Math.sin(a)*r+'px');f.style.animationDelay=(i*.05)+'s';box.appendChild(f);}
    requestAnimationFrame(()=>d.classList.add('on'));
    let closed=false;const close=()=>{if(closed)return;closed=true;d.classList.remove('on');setTimeout(()=>d.remove(),260);try{play('ui');}catch(e){}refreshGems();};
    onTap('giftOk',close);d.addEventListener('pointerup',e=>{if(e.target.id==='giftOk')close();});}
  function ready(){return game.state==='menu'&&['shopScreen','dlgScreen','prizeScreen'].every(id=>!$(id)||$(id).classList.contains('hidden'));}
  let tries=0;function check(){if(LS.get(FLAG,0))return;if(!ready()){if(++tries<120)setTimeout(check,1000);return;}
    // already received on another device / before a reinstall?
    let done=false;const go=v=>{if(done)return;done=true;if(v==='1'){LS.set(FLAG,1);return;}show();};
    try{if(cloudOK()){TG.W.CloudStorage.getItem(FLAG,(err,v)=>go(err?null:v));setTimeout(()=>go(null),2500);return;}}catch(e){}go(null);}
  setTimeout(check,1800);
  window.__gift415={show,FLAG};})();
// shop usable in portrait even mid-run: hide the rotate overlay while the shop / a dialog is open
(function(){const sync=()=>document.body.classList.toggle('shopOpen',tapOpen());const mo=new MutationObserver(sync);for(const id of ['shopScreen','dlgScreen'])mo.observe($(id),{attributes:true,attributeFilter:['class']});sync();})();

// purchase completed in chat -> bot sends a web_app button with &grant=<id>.<r8>.<sig8>
function verifyGrant(raw){const m=/^([a-z0-9_]{2,24})\.([A-Za-z0-9]{8})\.([0-9a-fA-F]{8})$/.exec(String(raw||'').trim());if(!m||!INVOICE_LINKS[m[1]])return null;
  return sha256hex(GRANT_SALT+m[1]+'.'+m[2]).slice(0,8)===m[3].toLowerCase()?{id:m[1],key:m[1]+'.'+m[2]}:null;}
function grantCheck(raw){if(!raw)return;try{URLQ.delete('grant');const q=URLQ.toString();history.replaceState(null,'',location.pathname+(q?'?'+q:'')+location.hash);}catch(e){}
  const v=verifyGrant(raw);slog('grant link',raw,v?'ok':'INVALID');if(!v){mtoast('Link acquisto non valido',2400);return;}
  const used=LS.get('zc_grants',[]);if(used.includes(v.key)){mtoast('✅ Acquisto già accreditato',2400);return;}
  let done=false;const fin=cu=>{if(done)return;done=true;if(cu&&cu.includes(v.key)){used.push(v.key);LS.set('zc_grants',used.slice(-200));mtoast('✅ Acquisto già accreditato',2400);return;}
    used.push(v.key);LS.set('zc_grants',used.slice(-200));grant(v.id);try{play('buy');}catch(e){}mtoast('✅ Acquisto accreditato: '+itemName(v.id),3200);
    if(cloudOK())try{TG.W.CloudStorage.setItem('zc_grants',JSON.stringify((cu||[]).concat([v.key]).slice(-60)),()=>{});}catch(e){}};
  if(cloudOK()){setTimeout(()=>fin(null),2500);try{TG.W.CloudStorage.getItem('zc_grants',(err,val)=>{let a=[];try{a=JSON.parse(val||'[]')||[];}catch(e){}fin(Array.isArray(a)?a:[]);});}catch(e){fin(null);}}else fin(null);}
setTimeout(()=>grantCheck(URLQ.get('grant')),900);
// viewport fit: real visible height (Telegram bars / Android nav bar / stale innerHeight after rotation)
function fitVP(){const de=document.documentElement,lh=window.innerHeight||de.clientHeight;let vh=lh;
  try{if(window.visualViewport&&visualViewport.height>150)vh=Math.min(vh,visualViewport.height);}catch(e){}
  try{const W=TG.W;if(W&&!W.isFullscreen&&W.viewportStableHeight>150)vh=Math.min(vh,W.viewportStableHeight);}catch(e){}
  try{if(window.scrollY||document.documentElement.scrollTop)scrollTo(0,0);}catch(e){}
  let off=0;try{if(window.visualViewport)off=visualViewport.offsetTop||0;}catch(e){}
  const cut=de.classList.contains('zs-tg')?0:Math.max(0,Math.min(240,Math.round(lh-vh)));de.style.setProperty('--vcut',cut+'px');de.style.setProperty('--vh',Math.round(vh)+'px');de.style.setProperty('--vvoff',Math.round(off)+'px');de.style.setProperty('--homeh',Math.round(vh)+'px');
  de.classList.toggle('shortH',vh<=400);de.classList.toggle('tinyH',vh<=340);de.classList.toggle('shopV',vh<358&&innerWidth>vh);
  try{uiApply451();}catch(e){}
  try{const pt=$('portrait');if(pt&&window.matchMedia&&!matchMedia('(orientation:portrait)').matches)pt.style.display='';}catch(e){}}
let fitT=[];function refit(){fitVP();try{window.__zcResize&&window.__zcResize();}catch(e){}}
function refitBurst(){refit();for(const t of fitT)clearTimeout(t);fitT=[100,300,600,1000].map(t=>setTimeout(refit,t));}
addEventListener('resize',refitBurst);addEventListener('orientationchange',refitBurst);
try{visualViewport.addEventListener('resize',refitBurst);}catch(e){}try{screen.orientation.addEventListener('change',refitBurst);}catch(e){}
(function(){let n=0;const iv=setInterval(()=>{if(TG.W){clearInterval(iv);for(const ev of ['viewportChanged','fullscreenChanged','safeAreaChanged','contentSafeAreaChanged'])try{TG.W.onEvent(ev,refitBurst);}catch(e){}refitBurst();}if(++n>60)clearInterval(iv);},250);})();
function canvasUi(w,h){w=Math.max(1,w||innerWidth);h=Math.max(1,h||innerHeight);const logW=Math.log(w/1920)/Math.LN2,logH=Math.log(h/1080)/Math.LN2;return Math.pow(2,logW+(logH-logW)*0.5);}
function uiBox451(id){const e=document.getElementById(id);if(!e||e.offsetWidth<8)return null;const st=getComputedStyle(e);if(st.display==='none'||st.visibility==='hidden')return null;const r=e.getBoundingClientRect();if(r.width<8||r.height<8)return null;return r;}
function uiOverflow451(){let bad=0;const pad=2,W=innerWidth,H=innerHeight;for(const id of ['fireBtn','nadeBtn','adsBtn','topLeft']){const r=uiBox451(id);if(!r)continue;if(r.left<pad)bad=Math.max(bad,pad-r.left);if(r.top<pad)bad=Math.max(bad,pad-r.top);if(r.right>W-pad)bad=Math.max(bad,r.right-(W-pad));if(r.bottom>H-pad)bad=Math.max(bad,r.bottom-(H-pad));}return bad;}
function uiHit451(){const h=uiBox451('topLeft');if(!h)return 0;let bad=0;for(const id of ['fireBtn','nadeBtn','adsBtn']){const r=uiBox451(id);if(!r)continue;const ox=Math.min(r.right,h.right)-Math.max(r.left,h.left),oy=Math.min(r.bottom,h.bottom)-Math.max(r.top,h.top);if(ox>2&&oy>2)bad=Math.max(bad,oy);}return bad;}
function uiApply451(){const de=document.documentElement;let ui=canvasUi();for(let n=0;n<6;n++){de.style.setProperty('--ui',ui.toFixed(4));if(Math.max(uiOverflow451(),uiHit451())<=3)break;ui=Math.max(0.22,ui*0.9);}window.__ui451=ui;}
fitVP();window.__zcFit=fitVP;
// ======================= end v4.1.2 hotfix =======================
// ======================= v4.2 core: profile, coins, XP/levels, diamond rate =======================
if(LS.get('zc_diff','')==='facile')LS.set('zc_diff','normale');
const P42=Object.assign({c:0,xp:0,L:1,k:0,eq:{},gb:[],wd:[],cu:{},st:0,q:null,qs:0,qd:''},LS.get('zc_v42',null)||{});
if(!Array.isArray(P42.gb))P42.gb=[];if(!Array.isArray(P42.wd))P42.wd=[];if(!P42.eq||typeof P42.eq!=='object')P42.eq={};if(!P42.cu)P42.cu={};if(!P42.wu||typeof P42.wu!=='object'||Array.isArray(P42.wu))P42.wu={};
const ST42={a:0,h:0,sp:0,dm:0,c:0};
let s42TO=null,c42TO=null;
function save42(){LS.set('zc_v42',P42);if(cloudOK()){clearTimeout(c42TO);c42TO=setTimeout(()=>{try{const j=JSON.stringify({c:P42.c,xp:P42.xp,L:P42.L,k:P42.k,eq:P42.eq,gb:P42.gb.slice(0,24),wd:P42.wd.slice(0,16),cu:P42.cu,st:P42.st,qs:P42.qs,cos:P42.cos,cx:P42.cx,wu:P42.wu});if(j.length<4090)TG.W.CloudStorage.setItem('zc_v42',j,()=>{});}catch(e){}},3000);}}
function save42soon(){clearTimeout(s42TO);s42TO=setTimeout(save42,600);}
function cloud42Pull(){if(!cloudOK())return;try{TG.W.CloudStorage.getItem('zc_v42',(err,v)=>{if(err||!v)return;try{const c=JSON.parse(v);const sc=o=>(o.L|0)*1e7+(o.xp|0);
  if(sc(c)>sc(P42)||(c.c|0)>P42.c&&sc(c)>=sc(P42)){Object.assign(P42,c);if(!Array.isArray(P42.wd))P42.wd=[];LS.set('zc_v42',P42);gearStats&&gearStats();xpHUD();coinHUD();}}catch(e){}});}catch(e){}}
{const _zt=window.__zcTG;window.__zcTG=()=>{try{_zt&&_zt();}catch(e){}cloud42Pull();};}
// ---- sounds ----
SFX.coin=()=>{const t=AU.ctx.currentTime;osc(t,.07,.22,'triangle',1568,1568);osc(t+.05,.16,.2,'triangle',2093,2093);};
SFX.lvl=()=>{const t=AU.ctx.currentTime;[523,659,784,1047].forEach((f,i)=>osc(t+i*.09,.22,.25,'triangle',f,f));};
SFX.gear=()=>{const t=AU.ctx.currentTime;osc(t,.12,.25,'sine',880,1320);osc(t+.08,.25,.2,'triangle',1320,1760);};
let coinSndT=0;
// ---- XP / levels (next = round(100*L^1.6)) ----
const XP_NEXT=L=>Math.round(100*Math.pow(L,1.6));
const XP_GAIN={kill:5,runner:8,bloater:8,tank:8,boss:150,crate:5,craft:4,build:2};
let xpAcc=0,xpAccT=0;
function addXP(n){n=Math.round(n);if(!(n>0))return;P42.xp+=n;let up=0;while(P42.xp>=XP_NEXT(P42.L)&&P42.L<100){P42.xp-=XP_NEXT(P42.L);P42.L++;up++;}
  xpAcc+=n;xpAccT=.6;
  if(up){banner('LIVELLO '+P42.L,'Nuovi oggetti sbloccati','',2000);play('lvl');try{renderShop&&!$('shopScreen').classList.contains('hidden')&&renderShop();}catch(e){}if(window.q42)q42('lvl',up);}
  save42soon();xpHUD();}
function xpHUD(){const e=$('xp42');if(!e)return;const nx=XP_NEXT(P42.L);e.querySelector('b').textContent=P42.L;e.querySelector('i>u').style.width=Math.min(100,P42.xp/nx*100).toFixed(1)+'%';e.title=P42.xp+' / '+nx+' XP';
  const m=$('lvlMenu');if(m)m.innerHTML='⭐ Liv. <b>'+P42.L+'</b> <small>'+fmt(P42.xp)+' / '+fmt(nx)+' XP</small> · 🪙 <b>'+fmt(P42.c)+'</b>';}
function coinHUD(){const e=$('coin42');if(e)e.lastChild.textContent=fmt(P42.c);xpHUD();}
function addCoins(n,silent){n=Math.round(n);if(!n)return;P42.c=Math.max(0,P42.c+n);coinHUD();save42soon();if(n>0&&!silent){const e=$('coin42');if(e){e.classList.remove('pulse');void e.offsetWidth;e.classList.add('pulse');}}}
// HUD: coin counter + level/xp bar (top-left, under health)
{const h=document.createElement('div');h.id='hud42';h.innerHTML='<div id="xp42"><b>1</b><i><u></u></i></div><div id="coin42"><span>🪙</span><span>0</span></div><div id="xpf42"></div>';$('hud').appendChild(h);
 const m=document.createElement('div');m.id='lvlMenu';$('menuBest').parentNode.insertBefore(m,$('menuBest'));
 coinHUD();}
function upd42(dt){if(xpAccT>0){xpAccT-=dt;if(xpAccT<=0&&xpAcc>0){const f=$('xpf42');f.textContent='+'+xpAcc+' XP';f.classList.remove('go');void f.offsetWidth;f.classList.add('go');xpAcc=0;}}
  coinsUpd(dt);}
// ---- coin drops: spin, arc, sparkle, magnet, ding ----
const coinGeo=new T.CylinderGeometry(.12,.12,.028,14);coinGeo.rotateX(Math.PI/2);
const coinMat=new T.MeshStandardMaterial({color:0xffc83a,emissive:0x6a4200,metalness:.85,roughness:.28});
const COINS=[];for(let i=0;i<48;i++){const m=new T.Mesh(coinGeo,coinMat);m.visible=false;m.userData.dyn=1;scene.add(m);COINS.push({m,on:false,v:1,x:0,y:0,z:0,vx:0,vy:0,vz:0,t:0,b:0,mag:false});}
const coinSpr=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffd060,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.5,fog:false}));
function dropCoins(x,z,total){if(total<=0)return;const n=Math.min(6,Math.max(1,Math.ceil(total/3)));let left=total;
  for(let i=0;i<n;i++){const c=COINS.find(q=>!q.on);const v=i===n-1?left:Math.max(1,Math.round(total/n));left-=v;if(!c){addCoins(v);continue;}
    const a=Math.random()*Math.PI*2,sp=rand(1.2,2.6);Object.assign(c,{on:true,v,x,y:.9,z,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:rand(3.6,5),t:0,b:0,mag:false});c.m.visible=true;c.m.position.set(x,.9,z);c.m.scale.setScalar(1);}}
const _cv=new T.Vector3();
function coinsUpd(dt){const px=player.pos.x,pz=player.pos.z,R=EQ.magnet?6:3.6;let sp=0;
  for(const c of COINS){if(!c.on)continue;c.t+=dt;
    const dx=px-c.x,dz=pz-c.z,d=Math.hypot(dx,dz);
    if(c.t>.45&&d<R)c.mag=true;
    if(c.mag){const k=Math.min(1,dt*(6+c.t*4));c.x+=dx*k;c.z+=dz*k;c.y+=(1.0-c.y)*k;if(d<.55){c.on=false;c.m.visible=false;addCoins(c.v);if(game.time-coinSndT>.07){coinSndT=game.time;play('coin');}
        if(window.q42)q42('coin',c.v);continue;}}
    else{c.vy-=12*dt;c.x+=c.vx*dt;c.z+=c.vz*dt;c.y+=c.vy*dt;c.vx*=.985;c.vz*=.985;if(c.y<.13){c.y=.13;if(c.vy<-1.2&&c.b<2){c.vy=-c.vy*.42;c.b++;}else{c.vy=0;c.vx*=.8;c.vz*=.8;}}
      if(c.t>25){c.on=false;c.m.visible=false;continue;}}
    c.m.position.set(c.x,c.y+(c.vy===0&&!c.mag?Math.sin(game.time*3+c.x)*.05+.08:0),c.z);c.m.rotation.y+=dt*(c.mag?14:5);
    if(Math.random()<dt*1.6&&sp<3){sp++;_cv.set(c.x,c.y+.1,c.z);emit(_cv,_up,1,[0xfff0a0,0xffd040],{speed:.6,spread:1,life:.5,size:.05,grav:-1});}}}
// ---- kill hook: XP, coins, diamonds (1/800), gear roll, quests ----
const COIN_KILL={normal:[2,4],runner:[3,6],bloater:[3,6],tank:[5,9],boss:[60,80]};
const _onKill42=onKill;onKill=function(z,head){_onKill42(z,head);try{const nm=z.V.name,p=z.g.position;P42.k++;
  addXP(XP_GAIN[nm]||XP_GAIN.kill);const cr=COIN_KILL[nm]||COIN_KILL.normal;dropCoins(p.x,p.z,wk432Coins(Math.round(rand(cr[0],cr[1]+.99)-.49)));
  if(window.gearOnKill)gearOnKill(z);if(window.q42)q42('kill',1);}catch(e){console.error(e);}};
// crates, crafting, building
const _openLoot42=openLoot;openLoot=function(c){_openLoot42(c);addXP(XP_GAIN.crate);dropCoins(c.x,c.z,Math.round(rand(5,10)));if(window.q42)q42('crate',1);};
const _play42=play;play=function(n,a){if(n==='craft'){addXP(XP_GAIN.craft);if(window.q42)q42('craft',1);}return _play42(n,a);};
const _placeBuild42=placeBuild;placeBuild=function(){const n0=PIECES.length;_placeBuild42();if(PIECES.length>n0){addXP(XP_GAIN.build);if(window.q42)q42('build',1);}};
const _enterPhase42=enterPhase;enterPhase=function(p,silent){_enterPhase42(p,silent);if(!silent&&p==='dawn'){addXP(Math.min(250,75+10*SV.day));if(window.q42)q42('night',1);}};
// resources gathered (quests): wrap addRes
const _addRes42=addRes;addRes=function(k,n,silent){const b=bagCount(),r=_addRes42.apply(this,arguments);try{const got=bagCount()-b;if(window.q42&&k==='wood'&&!SV.build&&got>0)q42('wood',got);}catch(e){}return r;};
window.__g42={P42,ST42,addXP,addCoins,dropCoins,COINS,XP_NEXT,save42};
const TICK42=[upd42];function tick42(dt,t){for(const f of TICK42)f(dt,t);}

// ======================= v4.2 gear: 5 rarities, drops, bag equipment panel =======================
// ONE config object (also shown in-game: "Probabilità di drop")
const GEAR_CFG={dropNormal:.08,split:[70,22,6.3,1.45,.25],bossSplit:[0,55,32,12,1],req:[1,3,8,15,25],mult:[1,1.6,2.4,3.4,4.6],bagMax:24,
  rar:[{n:'Comune',c:'#e4e8ee',h:0xe4e8ee},{n:'Raro',c:'#3fa2ff',h:0x3fa2ff},{n:'Epico',c:'#b467ff',h:0xb467ff},{n:'Leggendario',c:'#ffb02e',h:0xffb02e},{n:'Celestiale',c:'#9ff8ff',h:0xbffcff}]};
const GSLOT={helmet:{n:'Elmo',i:'⛑️',st:{a:3,h:4}},torso:{n:'Giacca',i:'🧥',st:{a:5,h:10}},gloves:{n:'Guanti',i:'🧤',st:{dm:4}},pants:{n:'Pantaloni',i:'👖',st:{a:4,h:4}},boots:{n:'Stivali',i:'🥾',st:{sp:3,a:2}},backpack:{n:'Zaino',i:'🎒',st:{c:12,a:1}},weapon:{n:'Kit arma',i:'🔧',st:{dm:6}}};
const REROLL42=[150,400];
const GS_K=Object.keys(GSLOT),GST_L={a:['Armatura','%'],h:['Salute','+'],sp:['Velocità','%'],dm:['Danno','%'],c:['Capienza','+']};
function gRoll(split){let r=Math.random()*split.reduce((a,b)=>a+b,0);for(let i=0;i<split.length;i++){r-=split[i];if(r<=0)return i;}return 0;}
function gMake(r,slot){slot=slot||GS_K[(Math.random()*GS_K.length)|0];const req=GEAR_CFG.req[r],top=r<4?GEAR_CFG.req[r+1]+6:99;
  const l=clamp(Math.max(req,P42.L-((Math.random()*2)|0)),req,top);const k=GEAR_CFG.mult[r]*(1+Math.min(.5,.03*(l-req)))*rand(.92,1.08);const st={};
  for(const s in GSLOT[slot].st)st[s]=Math.round(GSLOT[slot].st[s]*k*10)/10;return {s:slot,r,l,st,id:Math.random().toString(36).slice(2,8)};}
function gPow(it){if(!it)return 0;const s=it.st||{};return (s.a||0)*1+(s.h||0)*.6+(s.sp||0)*1.3+(s.dm||0)*1.2+(s.c||0)*.25;}
function gName(it){return GSLOT[it.s].n+' '+GEAR_CFG.rar[it.r].n.toLowerCase().replace(/^./,c=>c.toUpperCase());}
function gBetter(it){return it.l<=P42.L&&gPow(it)>gPow(P42.eq[it.s])+.05;}
function gStatTxt(it){return Object.entries(it.st).map(([k,v])=>GST_L[k][0]+' '+(GST_L[k][1]==='%'?'+'+v+'%':'+'+v)).join(' · ');}
let _baseMaxHp=100;
function gearStats(){const o={a:0,h:0,sp:0,dm:0,c:0};for(const k of GS_K){const it=P42.eq[k];if(it)for(const s in it.st)o[s]+=it.st[s];}
  o.a=Math.min(55,o.a);o.sp=Math.min(25,o.sp);o.dm=Math.min(35,o.dm);o.h=Math.round(o.h+(P42.cu.hp|0)*10);o.c=Math.round(o.c+(P42.cu.cap|0)*20);{const A=Math.min(100,P42.cu.atk|0),Df=Math.min(100,P42.cu.def|0),Sp=Math.min(100,P42.cu.spd|0);o.dm+=A*.5;o.a=100*(1-(1-o.a/100)*(1-Df*.004));o.sp+=Sp*.2;}
  const dh=o.h-ST42.h;Object.assign(ST42,o);if(dh&&game.state!=='menu'){player.maxHp+=dh;player.hp=clamp(player.hp+Math.max(0,dh),1,player.maxHp);}
  armsLook();try{updateHUD();}catch(e){}}
// FP arms/gloves follow equipped clothing
const _gC0=gloveM.color.getHex(),_sC0=sleeveM.color.getHex();
function armsLook(){const g=P42.eq.gloves,t=P42.eq.torso;gloveM.color.setHex(g?[0x6a6e74,0x2f5f9a,0x5a3a8a,0x8a5a1a,0x7fd8e0][g.r]:_gC0);sleeveM.color.setHex(t?[0x55606a,0x2a4f7a,0x4a2f6e,0x7a4a16,0x6fc0c8][t.r]:_sC0);
  gloveM.emissive&&gloveM.emissive.setHex(g&&g.r>=3?0x221100:0);}
// stat hooks
const _bagCap42=bagCap;bagCap=function(){return _bagCap42()+ST42.c;};
const _apply42=applyLoadout;applyLoadout=function(){_apply42();_baseMaxHp=player.maxHp;ST42.h=0;gearStats();player.hp=player.maxHp;};
// ---- world drops (low-poly model + rarity beam/glow) ----
const GD=[];const beamGeo=new T.CylinderGeometry(.05,.22,7,8,1,true);beamGeo.translate(0,3.5,0);
const gMats=GEAR_CFG.rar.map(r=>new T.MeshLambertMaterial({color:r.h,emissive:new T.Color(r.h).multiplyScalar(.35)}));
const gDark=new T.MeshLambertMaterial({color:0x2a2e34});
function gModel(slot,r){const g=new T.Group(),M=gMats[r],B=(m,x,y,z,sx,sy,sz)=>{const o=new T.Mesh(G.box,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);return o;};
  if(slot==='helmet'){B(M,0,.12,0,.34,.2,.38);B(gDark,0,.04,.16,.3,.06,.1);}
  else if(slot==='torso'){B(M,0,.2,0,.42,.4,.2);B(M,-.26,.24,0,.1,.32,.16);B(M,.26,.24,0,.1,.32,.16);B(gDark,0,.32,.11,.14,.08,.02);}
  else if(slot==='gloves'){B(M,-.12,.08,0,.14,.12,.2);B(M,.12,.08,0,.14,.12,.2);}
  else if(slot==='pants'){B(M,-.1,.2,0,.16,.42,.18);B(M,.1,.2,0,.16,.42,.18);B(gDark,0,.4,0,.38,.06,.2);}
  else if(slot==='boots'){B(M,-.12,.08,.04,.14,.16,.28);B(M,.12,.08,.04,.14,.16,.28);B(gDark,0,.01,.04,.42,.03,.3);}
  else if(slot==='backpack'){B(M,0,.22,0,.34,.42,.2);B(gDark,0,.12,.11,.26,.14,.04);}
  else{B(gDark,0,.1,0,.5,.1,.1);B(M,-.08,.04,0,.08,.16,.08);B(M,.15,.14,0,.12,.06,.12);}
  return g;}
for(let i=0;i<8;i++){const root=new T.Group(),item=new T.Group();root.add(item);root.visible=false;root.userData.dyn=1;scene.add(root);
  const beam=new T.Mesh(beamGeo,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false,fog:false}));root.add(beam);
  const halo=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffffff,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.8,fog:false}));halo.scale.set(1.4,1.4,1);halo.position.y=.35;root.add(halo);
  GD.push({root,item,beam,halo,on:false,it:null,x:0,z:0,t:0,mdl:null});}
function gearDropAt(it,x,z){const d=GD.find(q=>!q.on)||GD.reduce((a,b)=>a.t>b.t?a:b);if(d.mdl)d.item.remove(d.mdl);d.mdl=gModel(it.s,it.r);d.item.add(d.mdl);
  const col=GEAR_CFG.rar[it.r].h;d.beam.material.color.setHex(col);d.halo.material.color.setHex(col);d.beam.scale.set(1,it.r>=3?1.25:it.r?1:.6,1);
  Object.assign(d,{on:true,it,x,z,t:0});d.root.position.set(x,0,z);d.root.visible=true;
  feed((gBetter(it)?'<span class="up42">▲</span> ':'')+'<b style="color:'+GEAR_CFG.rar[it.r].c+'">'+gName(it)+'</b> a terra');}
function gearOnKill(z){if(!SV.on)return;const p=z.g.position;let r=-1;if(z.V.name==='boss')r=gRoll(GEAR_CFG.bossSplit);else if(Math.random()<GEAR_CFG.dropNormal)r=gRoll(GEAR_CFG.split);
  if(r>=0)gearDropAt(gMake(r),p.x+rand(-.4,.4),p.z+rand(-.4,.4));}
window.gearOnKill=gearOnKill;
function gearPick(d){if(P42.gb.length>=GEAR_CFG.bagMax){if(game.time-(d.warn||-9)>3){d.warn=game.time;toast('🎒 Zaino equipaggiamento pieno ('+GEAR_CFG.bagMax+'): equipaggia o scarta qualcosa',1800);}return false;}
  const it=d.it;d.on=false;d.root.visible=false;P42.gb.push(it);play('gear');addXP(3+[0,8,20,50,150][it.r]);gearPop(it);save42soon();if(window.q42)q42('gear',1);
  if(!P42.eq[it.s]&&it.l<=P42.L){P42.eq[it.s]=it;P42.gb.pop();gearStats();toast('✔ '+gName(it)+' equipaggiato',1400);}return true;}
let gpTO=null;function gearPop(it){const e=$('gearPop');const b=gBetter(it);e.innerHTML=(b?'<span class="up42">▲</span>':'')+'+ <b style="color:'+GEAR_CFG.rar[it.r].c+'">'+gName(it)+'</b>'+(it.l>P42.L?' <small>Liv. '+it.l+'</small>':'');e.className='show r'+it.r;clearTimeout(gpTO);gpTO=setTimeout(()=>e.className='',2200);}
{const e=document.createElement('div');e.id='gearPop';$('hud').appendChild(e);}
function gearUpd(dt){for(const d of GD){if(!d.on)continue;d.t+=dt;d.item.rotation.y+=dt*1.6;d.item.position.y=.25+Math.sin(game.time*2.4+d.x)*.08;
    if(d.it.r===4){const h=(game.time*.25)%1;d.beam.material.color.setHSL(.5+Math.sin(game.time*2)*.04,.6,.8);d.halo.material.color.setHSL(.5+Math.sin(game.time*2.6)*.05,.7,.85);}
    d.beam.material.opacity=.22+Math.sin(game.time*3)*.06;
    if(d.t>120){d.on=false;d.root.visible=false;continue;}
    const gd452=Math.hypot(d.x-player.pos.x,d.z-player.pos.z);if(d.skip&&gd452>2.8)d.skip=0;if(!d.skip&&gd452<1.25)loot452Gear(d);}}
// "Usa" near a drop
const _scan42=svScanNear;svScanNear=function(){let n=_scan42();for(const d of GD){if(!d.on)continue;const dd=Math.hypot(d.x-player.pos.x,d.z-player.pos.z);if(dd<2.4&&(!n||dd<1.8)){n=svNearObj={k:'gear',o:d,t:'Raccogli'};break;}}return n;};
const _use42=svUse;svUse=function(){const n=svNearObj||svScanNear();if(n&&n.k==='gear'){loot452Gear(n.o,true);return true;}return _use42();};
// ---- bag: equipment panel (character slots, stats, gear list, ▲) ----
{const sh=$('bagScreen').querySelector('.sheet');const d=document.createElement('div');d.id='eqPanel';const ft=sh.lastElementChild;sh.insertBefore(d,ft&&ft.id!=='bagGrid'&&!ft.querySelector('#bagGrid')?ft:null);}
let eqSel=null;
function gTile(it,where,i){const lk=it.l>P42.L,b=!lk&&where==='bag'&&gBetter(it),sel=eqSel&&eqSel.w===where&&eqSel.i===i;return '<button type="button" class="gT r'+it.r+(lk?' lock':'')+(sel?' selected457':'')+'" data-w="'+where+'" data-i="'+i+'" aria-pressed="'+!!sel+'" aria-label="'+esc(gName(it)+' · Livello '+it.l+' · '+gStatTxt(it))+'" title="'+esc(gStatTxt(it))+'"><i>'+GSLOT[it.s].i+'</i><span class="gName457">'+esc(GSLOT[it.s].n)+'</span>'+(b?'<em class="up42" title="Migliore di quello indossato">▲</em>':'')+'<small>'+esc(GEAR_CFG.rar[it.r].n)+' · '+(lk?'🔒 ':'')+'Liv. '+it.l+'</small></button>';}
function renderEq(){const e=$('eqPanel');if(!e)return;const S2=ST42;
  let h='<div class="eqHead"><b>🧍 Personaggio</b> <span>Liv. '+P42.L+'</span><button class="gLink" data-dropinfo="1">Probabilità di drop</button></div><div class="eqRow"><div class="eqSlots">';
  for(const k of GS_K){const it=P42.eq[k];h+=it?'<button class="gS r'+it.r+'" data-w="eq" data-i="'+k+'"><i>'+GSLOT[k].i+'</i><small>'+esc(GSLOT[k].n)+'</small></button>':'<div class="gS empty"><i>'+GSLOT[k].i+'</i><small>'+esc(GSLOT[k].n)+'</small></div>';}
  h+='</div><div class="eqStats"><div>🛡️ Armatura <b>'+S2.a.toFixed(0)+'%</b></div><div>❤️ Salute <b>+'+S2.h+'</b></div><div>👟 Velocità <b>+'+S2.sp.toFixed(0)+'%</b></div><div>💥 Danno <b>+'+S2.dm.toFixed(0)+'%</b></div><div>🎒 Capienza <b>+'+S2.c+'</b></div></div></div>';
  h+='<div class="eqSub">Equipaggiamento nello zaino <small>'+P42.gb.length+'/'+GEAR_CFG.bagMax+'</small></div><div class="gGrid">'+(P42.gb.length?P42.gb.map((it,i)=>gTile(it,'bag',i)).join(''):'<div class="gEmpty">Uccidi zombie per trovare equipaggiamento (fascio di luce colorato).</div>')+'</div>';
  if(eqSel){const it=eqSel.w==='eq'?P42.eq[eqSel.i]:P42.gb[eqSel.i];if(it){const cur=P42.eq[it.s],dp=Math.round((gPow(it)-gPow(cur))*10)/10;
    h+='<div class="gInfo r'+it.r+'"><b>'+esc(gName(it))+'</b> <small>Liv. '+it.l+'</small><div>'+esc(gStatTxt(it))+'</div>'+(eqSel.w==='bag'&&cur?'<div class="cmp">Rispetto a quello indossato: '+(dp>0?'<span class="up42">▲ +'+dp+'</span>':dp<0?'<span class="dn42">▼ '+dp+'</span>':'uguale')+'</div>':'')+
     '<div class="btnRow">'+(eqSel.w==='bag'?(it.l>P42.L?'<button class="act ghost" disabled>🔒 Serve Liv. '+it.l+'</button>':'<button class="act" data-gact="equip">Equipaggia</button>')+'<button class="act ghost" data-gact="drop">Scarta</button>':'<button class="act" data-gact="unequip">Togli</button>')+(it.r<=1?'<button class="act ghost'+(P42.c<REROLL42[it.r]?' poor':'')+'" data-gact="reroll">🎲 Rilancia 🪙 '+REROLL42[it.r]+'</button>':'')+'</div></div>';}}
  e.innerHTML=h;}
{const BS=$('bagScreen');let y0=0,x0=0,mv=0,mt=0;BS.addEventListener('touchstart',e=>{const t=e.touches[0];if(t){x0=t.clientX;y0=t.clientY;mv=0;}},{passive:true,capture:true});BS.addEventListener('touchmove',e=>{const t=e.touches[0];if(t&&Math.hypot(t.clientX-x0,t.clientY-y0)>8){mv=1;mt=performance.now();}},{passive:true,capture:true});BS.addEventListener('click',e=>{if(mv&&performance.now()-mt<450){mv=0;e.stopPropagation();e.preventDefault();}},true);}
$('bagScreen').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!$('bagScreen').contains(b)||b.id==='bagClose'||b.id==='bagCloseApk')return;
  if(b.dataset.dropinfo){dropInfo();return;}
  if(b.dataset.gact){const it=eqSel&&(eqSel.w==='eq'?P42.eq[eqSel.i]:P42.gb[eqSel.i]);if(!it)return;const a=b.dataset.gact;
    if(a==='equip'&&it.l<=P42.L){const cur=P42.eq[it.s];P42.gb.splice(eqSel.i,1);if(cur)P42.gb.push(cur);P42.eq[it.s]=it;play('gear');}
    else if(a==='unequip'){if(P42.gb.length>=GEAR_CFG.bagMax){toast('Zaino equipaggiamento pieno',1400);return;}delete P42.eq[eqSel.i];P42.gb.push(it);play('ui');}
    else if(a==='reroll'){const c=REROLL42[it.r];if(it.r>1||c==null)return;if(P42.c<c){toast('Ti servono 🪙 '+fmt(c)+' (ne hai '+fmt(P42.c)+')',1600);return;}
      addCoins(-c);const n=gMake(it.r,it.s);it.st=n.st;it.l=Math.min(n.l,Math.max(it.l,P42.L));it.id=n.id;play('gear');toast('🎲 Nuove statistiche: '+gStatTxt(it),2000);gearStats();save42();renderEq();return;}
    else if(a==='drop'){P42.gb.splice(eqSel.i,1);addCoins([5,15,40,100,250][it.r]);toast('Scartato: +'+[5,15,40,100,250][it.r]+' 🪙',1200);}
    eqSel=null;gearStats();save42();renderEq();try{renderBag();}catch(_){}return;}
  if(b.dataset.w){eqSel={w:b.dataset.w,i:b.dataset.w==='eq'?b.dataset.i:+b.dataset.i};renderEq();}});
const _renderBag42=renderBag;renderBag=function(){_renderBag42();renderEq();};
function dropInfo(){const C=GEAR_CFG,tot=C.split.reduce((a,b)=>a+b,0);
  dialog('Probabilità di drop','<div class="dropTbl"><div>Ogni zombie ucciso: <b>'+(C.dropNormal*100)+'%</b> di equipaggiamento.<br>Boss: sempre, almeno Raro.</div><table><tr><th>Rarità</th><th>Zombie</th><th>Boss</th><th>Livello</th></tr>'+
   C.rar.map((r,i)=>'<tr><td style="color:'+r.c+'">'+r.n+'</td><td>'+(C.split[i]/tot*100).toFixed(2).replace(/\.?0+$/,'')+'%</td><td>'+C.bossSplit[i]+'%</td><td>'+C.req[i]+'+</td></tr>').join('')+'</table><div class="small">Diamanti: circa 1 ogni 800 uccisioni, 1-2 dalle missioni giornaliere, +5 per boss. Monete a ogni uccisione. Rilancio statistiche (Comune/Raro): 🪙 150 / 400.</div></div>',[{label:'Ok',ghost:1}]);}
window.__gear={GEAR_CFG,gMake,gearDropAt,gearPick,GD,gearStats,gPow,gBetter,renderEq};
gearStats();
TICK42.push(gearUpd);

// ======================= v4.2 build: bed, armadio, roofs inside/outside, traps =======================
{const add=(k,col)=>{const n=200,m=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:col}),n);m.count=0;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;
  m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);scene.add(m);solids.push(m);POOL[k]={m,free:[],n:0,max:n,owner:[]};};
 add('cloth',0x8a2a2a);add('linen',0xe8e4da);add('wire',0x8a9096);}
PDEF.bed={n:'Letto',i:'🛏️',cost:{wood:10,coal:1},hp:200,cell:'o',box:[1.0,1.9],bed:1,parts:[['wood',0,.18,0,1.0,.22,1.95],['wood',0,.5,-.94,1.0,.7,.08],['linen',0,.36,0,.92,.14,1.84],['linen',0,.47,-.66,.66,.1,.3],['cloth',0,.45,.28,.96,.06,1.24],['wood',-.45,.08,-.9,.08,.16,.08],['wood',.45,.08,.9,.08,.16,.08]]};
PDEF.ward={n:'Armadio',i:'🗄️',cost:{wood:12,metal:1},hp:260,cell:'o',box:[1.2,.62],ward:1,parts:[['plank',0,1.06,0,1.2,2.1,.6],['wood',0,2.14,0,1.28,.08,.66],['wood',0,.04,0,1.24,.08,.64],['wood',0,1.06,.31,.04,2.0,.02],['metal',-.1,1.1,.32,.04,.2,.04],['metal',.1,1.1,.32,.04,.2,.04]]};
PDEF.wire={n:'Filo spinato',i:'🪢',cost:{wood:2,iron:3},hp:180,cell:'o',trap:'wire',parts:[['wood',-.85,.45,0,.09,.9,.09],['wood',.85,.45,0,.09,.9,.09],['wire',0,.28,0,1.8,.025,.025],['wire',0,.5,0,1.8,.025,.025,.06,0,0],['wire',0,.72,0,1.8,.025,.025],['wire',0,.5,0,1.9,.02,.02,0,0,.25],['wire',0,.5,0,1.9,.02,.02,0,0,-.25]]};
PDEF.mine={n:'Mina',i:'💣',cost:{metal:2,coal:2,elec:1},hp:60,cell:'o',trap:'mine',parts:[['dark',0,.03,0,.42,.06,.42],['metal',0,.07,0,.26,.04,.26],['cloth',0,.1,0,.06,.03,.06]]};
PORDER.push('bed','ward','wire','mine');
// ---- shelter: player under a roof cell ----
function roofAt(x,z){const cx=Math.floor(x/2)*2+1,cz=Math.floor(z/2)*2+1;return PIECES.some(p=>p.alive&&p.type==='roof'&&p.x===cx&&p.z===cz);}
let shelter=false,roofsHidden=false;
function setRoofs(hide){roofsHidden=hide;for(const p of PIECES)if(p.alive&&p.type==='roof'){if(hide){for(const s of p.slots){const P=POOL[s.k];P.m.setMatrixAt(s.i,ZERO_M);P.m.instanceMatrix.needsUpdate=true;}}else pieceWrite(p);}
  const b=$('roofBtn');if(b)b.classList.toggle('on',hide);}
{const b=document.createElement('button');b.id='roofBtn';b.innerHTML='🏠<small>Tetti</small>';b.title='Mostra/nascondi i tetti mentre costruisci';const bb=$('buildBar')||$('hud');bb.appendChild(b);
 onTap('roofBtn',()=>{setRoofs(!roofsHidden);toast(roofsHidden?'Tetti nascosti (solo vista)':'Tetti visibili',900);});}
const _setBuild42=setBuild;setBuild=function(on,type){_setBuild42(on,type);if(!on&&roofsHidden)setRoofs(false);};
const _addPiece42=addPiece;addPiece=function(){const p=_addPiece42.apply(this,arguments);if(roofsHidden&&p&&p.type==='roof')setRoofs(true);return p;};
{const c=document.createElement('div');c.id='shelter42';c.textContent='🏠 Al riparo';$('hud').appendChild(c);}
// ---- bed: respawn point + sleep through the night ----
let sleep42=null;
{const o=document.createElement('div');o.id='sleep42';o.innerHTML='<div><div class="zz">💤</div><b>Stai dormendo…</b><small id="sleepTxt">Il tempo scorre veloce fino all\'alba</small><button class="act" id="wakeBtn">Svegliati</button></div>';document.body.appendChild(o);onTap('wakeBtn',()=>wake42('Ti sei svegliato'));}
function bedFree(){return PIECES.find(p=>p.alive&&p.type==='bed');}
function sleepTry(p){P42.bed=[p.x,p.z];save42soon();
  if(SV.phase==='day'){toast('🛏️ Punto di rinascita impostato. Puoi dormire al tramonto o di notte.',2200);return;}
  if(!roofAt(p.x,p.z)){toast('🛏️ Rinascita impostata · per dormire serve un tetto sopra il letto',2200);return;}
  const near=zombies.some(z=>z.alive&&!z.dead&&Math.hypot(z.g.position.x-player.pos.x,z.g.position.z-player.pos.z)<16);if(near){toast('⚠️ Zombie troppo vicini per dormire',1600);return;}
  sleep42={sp:SV.speed||1,hp:player.hp};SV.speed=Math.max(SV.speed||1,10);document.body.classList.add('sleeping');firing=false;resetTouchState();play('ui');}
function wake42(msg){if(!sleep42)return;SV.speed=sleep42.sp;sleep42=null;document.body.classList.remove('sleeping');if(msg)toast(msg,1600);}
function sleepUpd(dt){if(!sleep42)return;if(game.state!=='play'){wake42();return;}player.hp=Math.min(player.maxHp,player.hp+dt*.8*SV.speed);
  if(player.hp<sleep42.hp-1){wake42('⚠️ Ti hanno attaccato!');return;}sleep42.hp=player.hp;
  if(zombies.some(z=>z.alive&&!z.dead&&Math.hypot(z.g.position.x-player.pos.x,z.g.position.z-player.pos.z)<8)){wake42('⚠️ Uno zombie è vicino!');return;}
  if(SV.phase==='dawn'||SV.phase==='day')wake42('☀️ Buongiorno! Notte passata');}
const _svGO42=svGameOver;svGameOver=function(){wake42();_svGO42();try{const b=P42.bed&&PIECES.find(p=>p.alive&&p.type==='bed'&&p.x===P42.bed[0]&&p.z===P42.bed[1]);if(b){const s=LS.get(SV_KEY,null);if(s){s.pos=[+(b.x+1.2).toFixed(1),+(b.z).toFixed(1),0];LS.set(SV_KEY,s);}
  const sb=$('overStats').querySelector('.sub2');if(sb)sb.innerHTML+='<br>🛏️ Rinasci accanto al tuo letto.';}}catch(e){}};
// ---- armadio: gear storage ----
{const o=document.createElement('div');o.id='wardScreen';o.className='overlay sheetBg hidden';o.innerHTML='<div class="sheet wardSheet"><div class="wHead"><h2>🗄️ Armadio</h2><button class="act ghost" id="wardClose">✕ Chiudi</button></div><div class="small" style="opacity:.75">Tocca un oggetto per spostarlo tra zaino e armadio. L\'armadio resta nella base anche se muori.</div><div class="eqSub">🎒 Zaino <small id="wbN"></small></div><div class="gGrid" id="wardBag"></div><div class="eqSub">🗄️ Armadio <small id="wwN"></small></div><div class="gGrid" id="wardIn"></div></div>';document.body.appendChild(o);}
function renderWard(){$('wbN').textContent=P42.gb.length+'/'+GEAR_CFG.bagMax;$('wwN').textContent=P42.wd.length+'/40';
  $('wardBag').innerHTML=P42.gb.map((it,i)=>gTile(it,'bag',i)).join('')||'<div class="gEmpty">Vuoto</div>';$('wardIn').innerHTML=P42.wd.map((it,i)=>gTile(it,'wd',i)).join('')||'<div class="gEmpty">Vuoto</div>';}
function openWard(){if(game.state!=='play')return;game.state='ward';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();renderWard();$('wardScreen').classList.remove('hidden');play('door');}
function closeWard(){$('wardScreen').classList.add('hidden');if(game.state==='ward'){game.state='play';last=performance.now();}if(!isTouch)lockPointer();}
onTap('wardClose',closeWard);
$('wardScreen').addEventListener('click',e=>{if(e.target.id==='wardScreen'){closeWard();return;}const b=e.target.closest('button[data-w]');if(!b)return;const i=+b.dataset.i;
  if(b.dataset.w==='bag'){if(P42.wd.length>=40){toast('Armadio pieno',1200);return;}P42.wd.push(P42.gb.splice(i,1)[0]);}else{if(P42.gb.length>=GEAR_CFG.bagMax){toast('Zaino equipaggiamento pieno',1200);return;}P42.gb.push(P42.wd.splice(i,1)[0]);}
  play('ui');save42();renderWard();});
// ---- interaction ----
const _scan42b=svScanNear;svScanNear=function(){let n=_scan42b();if(n&&n.k==='gear')return n;let bd=n?Math.hypot(n.o.x-player.pos.x,n.o.z-player.pos.z):2.4;
  for(const p of PIECES){if(!p.alive||(p.type!=='bed'&&p.type!=='ward'))continue;const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(d<2.2&&d<bd){bd=d;n=svNearObj={k:p.type,o:p,t:p.type==='bed'?(SV.phase==='day'?'Letto':'Dormi'):'Armadio'};}}return n;};
const _use42b=svUse;svUse=function(){const n=svNearObj||svScanNear();if(n&&n.k==='bed'){sleepTry(n.o);return true;}if(n&&n.k==='ward'){openWard();return true;}return _use42b();};
// ---- traps: barbed wire (slow + DoT, durability) and mines (contact, area, single use; never hurt the player) ----
const _svT42=svTarget;svTarget=function(z){const r=_svT42(z);if(z.wireT>0)z.spdMul=(z.spdMul||1)*.38;return r;};
let trapT=0;
function trapsUpd(dt){trapT+=dt;if(!SV.on)return;const tick=trapT>=.1;if(tick)trapT=0;const st=tick?.1:0;
  for(const z of zombies){if(z.wireT>0)z.wireT-=dt;}
  if(!tick)return;
  for(const p of PIECES.slice()){if(!p.alive)continue;const D=PDEF[p.type];if(!D.trap)continue;
    for(const z of zombies){if(!z.alive||z.dead)continue;const dx=z.g.position.x-p.x,dz=z.g.position.z-p.z;
      if(D.trap==='wire'){const along=p.rot%2===0,u=along?dx:dz,v=along?dz:dx;if(Math.abs(u)<1.0&&Math.abs(v)<.55){z.wireT=.35;z.hp-=20*st*(z.V.name==='boss'?.5:1);z.flash=.04;p.hp-=6*st*(z.V.name==='tank'||z.V.name==='boss'?2:1);
          if(Math.random()<.3)emit(_tmp.set(z.g.position.x,.9,z.g.position.z),_up,2,BLOOD,{speed:1.2,spread:.8,life:.4,size:.04,grav:9});
          if(z.hp<=0){_tmp.set(dx,0,dz).normalize();killZombie(z,_tmp.clone(),5,false);feed('🪢 Filo spinato: zombie eliminato');}}}
      else if(D.trap==='mine'&&dx*dx+dz*dz<.85){const pos=new T.Vector3(p.x,.3,p.z);removePiece(p);explosion(pos,4.2,140,{});fx.shake+=.4;feed('💥 <b>Mina esplosa</b>');svSave();break;}}
    if(p.alive&&p.hp<=0){feed('🪢 Filo spinato consumato');removePiece(p);svSave();}else if(p.alive&&D.trap==='wire'&&((p.hp/p.max*5)|0)!==(((p.hp+6*st)/p.max*5)|0))pieceWrite(p);}}
function build42Upd(dt){const sh=SV.on&&game.state==='play'&&roofAt(player.pos.x,player.pos.z);if(sh!==shelter){shelter=sh;document.body.classList.toggle('shelter',sh);}
  if(sh&&SV.phase==='night'&&player.hp<player.maxHp&&!sleep42)player.hp=Math.min(player.maxHp,player.hp+dt*.5);
  sleepUpd(dt);trapsUpd(dt);$('roofBtn').style.display=SV.build?'':'none';}
TICK42.push(build42Upd);
window.__build42={roofAt,setRoofs,sleepTry,wake42,openWard,trapsUpd,get shelter(){return shelter},get sleep(){return sleep42}};

// ======================= v4.2 shop: coins tab, compare, daily featured, starter pack, gentle tip =======================
{const t=$('shopTabs');const b=document.createElement('button');b.className='tab';b.dataset.t='coins';b.textContent='🪙 Monete';t.insertBefore(b,t.querySelector('[data-t="gems"]'));}
const _itemName42=itemName;itemName=function(id){if(id==='starter')return 'Pacchetto di benvenuto';return _itemName42(id);};
const _grant42=grant;grant=function(id){if(id==='starter'){if(P42.st){mtoast('Pacchetto già ricevuto',2000);return;}P42.st=1;
    if(!owns('w_smg')){PROF.owned.push('w_smg');PROF.eqw=PROF.eqw||'smg';}else addGems(120,true);addGems(100,true);addCoins(1000);if(!PROF.owned.includes('starter'))PROF.owned.push('starter');saveProf();save42();
    play('buy');renderShop();mtoast('🎁 Pacchetto di benvenuto: Vipera SMG + 100 💎 + 1.000 🪙',3000);return;}
  _grant42(id);};
const WHY={smg:'Cadenza alta e caricatore capiente: ottima per le orde nei primi giorni.',ar:'Equilibrato: preciso dalla distanza e potente da vicino.',thunder:'Fucile a pompa automatico: ferma gli zombie che sfondano la base.',
  plasma:'Colpi esplosivi ad area: il danno più alto per i gruppi.',sniper:'Un colpo alla testa elimina quasi tutto, ideale dalla base.',glauncher:'Granate ad area contro i gruppi e i boss.',flamer:'Brucia a contatto e lascia fiamme: eccellente sulle porte.',minigun:'Cadenza estrema per le notti con l\'orda più grande.',
  fox:'Carabina precisa: pochi colpi, ben piazzati, anche da lontano.',burst:'Raffica continua tra la SMG e il fucile d\'assalto.',saw:'Due colpi devastanti se lo zombie è addosso.',hunt:'Ottica leggera: più colpi del cecchino, meno rinculo.',vespa:'Granate piccole per i gruppi, senza il peso del Grizzly.'};
function wCmp(w,b){const st=x=>({d:x.dmg*x.pellets,r:1/x.rate,a:1-x.spread,m:x.mag});const A=st(w),B=st(b);const pc=(x,y)=>Math.round((x/y-1)*100);
  return [['DPS',pc(dps42(w),dps42(b)||1)],['Danno',pc(A.d,B.d)],['Cadenza',pc(A.r,B.r)],['Caricatore',pc(A.m,B.m)]];}
function cmpLine(w){if(!w)return '';const h=heldW42(),dw=dps42(w),dh=dps42(h)||1,leg=w.rarity==='leggendario'&&SHOP_W.some(q=>q.w===w.id);
  const sh=(t)=>'<span class="cS42">⚡'+dw+' · '+t+(leg?' · <span class="gOnly42">Solo con 💎</span>':'')+'</span>';
  if(h&&h.id===w.id)return '<div class="cmp42"><span class="cL42">⚡ DPS <b>'+dw+'</b> · <span class="eq42">in mano</span></span>'+sh('<span class="eq42">in mano</span>')+'</div>';
  const x=dw/dh,cl=x>1.02?'up42':x<.98?'dn42':'';return '<div class="cmp42"><span class="cL42">⚡ DPS <b>'+dw+'</b> · <span class="'+cl+'">×'+x.toFixed(1)+' vs '+esc(h.name.split(' ')[0])+'</span></span>'+sh('<span class="'+cl+'">×'+x.toFixed(1)+'</span>')+'</div>';}
function featuredId(){const k=dayKey();let h=7;for(const c of k)h=(h*33+c.charCodeAt(0))>>>0;const L=SHOP_W.filter(s=>!owns(s.id));return L.length?L[h%L.length].id:'';}
// coin shop catalog (permanent upgrades + weapons + gear box + supplies)
// 4.3.2 Potenziamenti: cost(n)=round(150*1.035^(n-1)) coins -> lvl 1 = 150, lvl 25 = 342 (5.8k total), lvl 50 = 809 (19.7k), lvl 100 = 4.5k (129k)
const UPG432C=Array.from({length:100},(_,i)=>Math.round(150*Math.pow(1.035,i))),UPG432L=[1];
const CSHOP=[
  {id:'cw_smg',n:'Vipera SMG',e:'🔫',d:'Arma Rara sbloccata per sempre',lv:[3],cost:[4000],w:'w_smg',g:'Armi'},
  {id:'cw_fox',n:'Volpe',e:'🔫',d:'Carabina precisa sbloccata per sempre',lv:[4],cost:[5500],w:'w_fox',g:'Armi'},
  {id:'cw_burst',n:'Rondine',e:'🔫',d:'Fucile a raffica sbloccato per sempre',lv:[5],cost:[7000],w:'w_burst',g:'Armi'},
  {id:'cw_ar',n:'Lupo AR-7',e:'🔫',d:'Arma Epica sbloccata per sempre · la migliore a monete',lv:[6],cost:[16000],w:'w_ar',g:'Armi'},
  {id:'cw_hunt',n:'Cervo .308',e:'🎯',d:'Fucile da caccia con ottica, sbloccato per sempre',lv:[6],cost:[10000],w:'w_hunt',g:'Armi'},
  {id:'cw_saw',n:'Canne mozze',e:'💥',d:'Doppietta corta sbloccata per sempre',lv:[7],cost:[12000],w:'w_saw',g:'Armi'},
  {id:'cu_wall',n:'Muri rinforzati',e:'🧱',d:'+15% resistenza a ogni pezzo della base per livello',lv:[2,5,9],cost:[1500,3500,7000],k:'wall',g:'Base'},
  {id:'cu_chest',n:'Deposito ampliato',e:'📦',d:'+200 posti nel deposito per livello (fino a 6)',lv:[1,2,4,6,9,12],cost:[800,2000,4500,9000,16000,28000],k:'chest',g:'Base'},
  {id:'cu_trap',n:'Trappole rinforzate',e:'🪢',d:'+30% resistenza di filo spinato e mine per livello',lv:[3,7],cost:[1200,3000],k:'trap',g:'Base'},
  {id:'cu_hp',n:'Allenamento',e:'❤️',d:'+10 salute massima per sempre',lv:[2,5,9],cost:[800,2000,4500],k:'hp',g:'Personaggio'},
  {id:'cu_cap',n:'Tasche extra',e:'🎒',d:'+20 capienza dello zaino per sempre',lv:[1,4,8],cost:[600,1600,3800],k:'cap',g:'Personaggio'},
  {id:'cu_atk',n:'Attacco',e:'⚔️',d:'+0,5% danno per livello (max +50%)',lv:UPG432L,cost:UPG432C,k:'atk',g:'Potenziamenti'},
  {id:'cu_def',n:'Difesa',e:'🛡️',d:'-0,4% danni subiti per livello (max -40%)',lv:UPG432L,cost:UPG432C,k:'def',g:'Potenziamenti'},
  {id:'cu_spd',n:'Velocità',e:'👟',d:'+0,2% velocità per livello (max +20%)',lv:UPG432L,cost:UPG432C,k:'spd',g:'Potenziamenti'},
  {id:'c_sup',n:'Rifornimento granate',e:'💣',d:'+2 granate all\'inizio della prossima partita',lv:[1],cost:[150],rep:1,g:'Consumabili'},
  {id:'c_kit',n:'Kit da campo',e:'🩹',d:'+40 salute massima per la prossima partita (massimo 3)',lv:[1],cost:[180],rep:1,g:'Consumabili'},
  {id:'c_ammo',n:'Cassa munizioni',e:'🗃️',d:'+40% munizioni di riserva all\'inizio della prossima partita (massimo 3)',lv:[1],cost:[220],rep:1,g:'Consumabili'},
  {id:'c_box',n:'Cassa equipaggiamento',e:'🎁',d:'1 equipaggiamento casuale (stesse probabilità degli zombie)',lv:[1],cost:[700],rep:1,g:'Consumabili'},
  {id:'cx_red',n:'Mirino rosso',e:'🎯',d:'Cosmetico: colore del mirino',lv:[1],cost:[600],cos:1,g:'Cosmetici'},
  {id:'cx_gold',n:'Mirino oro',e:'🎯',d:'Cosmetico: colore del mirino',lv:[1],cost:[900],cos:1,g:'Cosmetici'},
  {id:'cx_neon',n:'Mirino neon',e:'🎯',d:'Cosmetico: colore del mirino',lv:[1],cost:[900],cos:1,g:'Cosmetici'}];
var HINT42={run:false};
function cItem(c){const lvl=c.k?(P42.cu[c.k]|0):0,max=c.cost.length;if(c.w&&owns(c.w))return {done:1};if(c.cos&&(P42.cos||[]).includes(c.id))return {done:1,cos:1,on:P42.cx===c.id};if(c.k&&lvl>=max)return {done:1,lvl:max,max};const i=c.rep?0:lvl;return {cost:c.cost[i],lv:c.lv[Math.min(i,c.lv.length-1)],lvl,max};}
function cBuy(id){const c=CSHOP.find(q=>q.id===id);if(!c)return;const s=cItem(c);if(s.cos){P42.cx=s.on?'':c.id;save42();try{cosApply();}catch(e){}play('ui');renderShop();return;}if(s.done)return;if(P42.L<s.lv){mtoast('🔒 Serve il livello '+s.lv,1800);return;}if(P42.c<s.cost){mtoast('Ti servono 🪙 '+fmt(s.cost)+' (ne hai '+fmt(P42.c)+')',2000);return;}
  if(c.id==='c_box'&&P42.gb.length>=GEAR_CFG.bagMax){mtoast('Zaino equipaggiamento pieno',1800);return;}
  dialog('Confermi l\'acquisto?','<b>'+esc(c.n)+'</b>'+(c.k?' · Liv. '+(s.lvl+1)+'/'+s.max:'')+' per <b>🪙 '+fmt(s.cost)+'</b>',[{label:'Compra',fn:()=>{if(P42.c<s.cost)return;addCoins(-s.cost);
    if(c.k){P42.cu[c.k]=(P42.cu[c.k]|0)+1;gearStats();}else if(c.w){if(!owns(c.w)){PROF.owned.push(c.w);saveProf();}}else if(c.id==='c_box'){const it=gMake(gRoll(GEAR_CFG.split));P42.gb.push(it);gearPop(it);mtoast('🎁 '+gName(it)+' nello zaino',2200);}
    else if(c.id==='c_sup'){P42.sup=(P42.sup|0)+1;}else if(c.id==='c_kit'){P42.kit=(P42.kit|0)+1;}else if(c.id==='c_ammo'){P42.ammo=(P42.ammo|0)+1;}else if(c.cos){if(!Array.isArray(P42.cos))P42.cos=[];P42.cos.push(c.id);P42.cx=c.id;try{cosApply();}catch(e){}}save42();play('buy');renderShop();}},{label:'Annulla',ghost:1}]);}
const _apply42s=applyLoadout;applyLoadout=function(){_apply42s();let msg='';if(P42.sup>0){S.nades=(S.nades|0)+2*P42.sup;P42.sup=0;msg='💣 +granate';}
  if(P42.kit>0){const b=40*Math.min(3,P42.kit|0);player.maxHp+=b;player.hp=player.maxHp;P42.kit=0;msg+=(msg?' · ':'')+'+salute';}
  if(P42.ammo>0){const m=Math.min(3,P42.ammo|0);P42.ammo=0;for(const w of WEAPONS){if(w.melee||!own[w.id]||!w.mag)continue;res[w.id]=Math.min(w.maxReserve,res[w.id]+Math.ceil((w.reserveGive||0)*.4*m));}msg+=(msg?' · ':'')+'+munizioni';}
  if(msg){save42();setTimeout(()=>toast(msg,1600),2500);}};
function starterCard(){if(P42.st||owns('starter'))return '';if(window.__zsApk)return '<div class="scard r-leggendario starter42"><div class="bestTag" style="background:rgba(255,176,46,.95)">UNA SOLA VOLTA</div><div class="sthumb"><span class="emo">🎁</span></div><div class="sbody"><div class="sname">Pacchetto di benvenuto</div><div class="srar">Vipera SMG + 100 💎 + 1.000 🪙</div><div class="sdesc">Comprati separatamente: SMG € 0,99 + 100💎 € 1,99. Qui tutto a <b>€ 0,99</b>.'+(owns('w_smg')?'<br>Hai già la SMG: ricevi +120💎 al suo posto.':'')+'</div><div class="sbtns"><button class="bEuro" data-buy="starter" data-m="euro">Compra € 0,99</button></div></div></div>';return '<div class="scard r-leggendario starter42"><div class="bestTag" style="background:rgba(255,176,46,.95)">UNA SOLA VOLTA</div><div class="sthumb"><span class="emo">🎁</span></div><div class="sbody"><div class="sname">Pacchetto di benvenuto</div><div class="srar">Vipera SMG + 100 💎 + 1.000 🪙</div><div class="sdesc">Comprati separatamente: SMG 25⭐ + 100💎 50⭐. Qui tutto a <b>25⭐</b>.'+(owns('w_smg')?'<br>Hai già la SMG: ricevi +120💎 al suo posto.':'')+'</div><div class="sbtns"><button class="bStar'+(starsOK('starter')?'':' off')+'" data-buy="starter" data-m="star"'+(starsOK('starter')?'':' disabled')+'>Compra con ⭐ 25</button></div></div></div>';}
const _renderShop42=renderShop;renderShop=function(){
  if(shopTab==='coins'){refreshGems();document.querySelectorAll('#shopTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.t===shopTab));$('shopNote').textContent='Monete: a ogni zombie, dalle casse e dalle missioni. Hai 🪙 '+fmt(P42.c)+' · Liv. '+P42.L;
    let h='';for(const c of CSHOP){if(c.hide29)continue;const s=cItem(c);const lk=!s.done&&P42.L<s.lv;const sw=c.w&&SHOP_W.find(q=>q.id===c.w);const th=sw&&thumbsPartial422()[sw.w];h+='<div class="scard r-'+(c.w?'epico':c.k?'raro':'comune')+'">'+(s.done&&!s.cos?'<div class="ownTag">'+(c.w?'TUA':'MAX')+'</div>':'')+'<div class="sthumb">'+(th?'<img alt="" src="'+th+'">':'<span class="emo">'+c.e+'</span>')+'</div><div class="sbody"><div class="sname">'+esc(c.n)+'</div><div class="srar">'+esc(c.g||'')+' · '+(c.k?'Liv. '+(s.lvl==null?c.cost.length:s.lvl)+'/'+c.cost.length:c.rep?'Ripetibile':c.cos?'Cosmetico':'Arma')+'</div><div class="sdesc">'+esc(c.d)+'</div>'+(c.w?cmpLine(wById(SHOP_W.find(q=>q.id===c.w).w)):'')+'<div class="sbtns">'+
      (s.cos?'<button class="bOwn'+(s.on?' eq':'')+'" data-cbuy="'+c.id+'">'+(s.on?'✔ In uso':'Usa')+'</button>':s.done?'<button class="bOwn eq" disabled>✔ '+(c.w?'Sbloccata':'Al massimo')+'</button>':lk?'<button class="bOwn" disabled>🔒 Liv. '+s.lv+'</button>':'<button class="bCoin'+(P42.c<s.cost?' poor':'')+'" data-cbuy="'+c.id+'">🪙 '+fmt(s.cost)+'</button>')+'</div></div></div>';}
    $('shopList').innerHTML=h;$('shopList').scrollLeft=0;$('shopList').scrollTop=0;return;}
  _renderShop42();const L=$('shopList');
  if(shopTab==='armi'){const eqW=WEAPONS.find(q=>q.id===(PROF.eqw||'pistol'))||WEAPONS.find(q=>q.id==='pistol');const fid=featuredId();
    for(const card of [...L.children]){const b=card.querySelector('[data-buy]'),e=card.querySelector('[data-eq]');const sid=b?b.dataset.buy:e?SHOP_W.find(s=>s.w===e.dataset.eq)?.id:'';const s=SHOP_W.find(q=>q.id===sid);if(!s)continue;
      const w=WEAPONS.find(q=>q.id===s.w),body=card.querySelector('.sbody'),bt=card.querySelector('.sbtns');if(!w||!body||!bt)continue;
      body.insertBefore(document.createRange().createContextualFragment(cmpLine(w)),bt);
      if(s.rar==='leggendario'){const r=card.querySelector('.srar');if(r&&!r.querySelector('.gOnly42'))r.insertAdjacentHTML('beforeend',' <span class="gOnly42">Solo con 💎</span>');}
      const y=document.createElement('div');y.className='why42';y.textContent='Perché conviene: '+(WHY[s.w]||'');body.insertBefore(y,bt);
      const pv=document.createElement('button');pv.className='bProva';pv.dataset.prova=s.w;pv.textContent='👁 Prova';bt.appendChild(pv);
      if(sid===fid){card.classList.add('feat42');const t=document.createElement('div');t.className='featTag';t.textContent='⭐ IN EVIDENZA OGGI';card.appendChild(t);L.insertBefore(card,L.firstChild);}}
    L.insertAdjacentHTML('afterbegin',starterCard());}
  if(shopTab==='gems'){const c=L.querySelector('[data-buy="gems_600"]');const card=c&&c.closest('.scard');if(card&&!card.querySelector('.valTag')){const t=document.createElement('div');t.className='valTag';t.textContent='MIGLIOR VALORE · +50%';card.appendChild(t);}
    L.insertAdjacentHTML('afterbegin',starterCard());}
  L.scrollLeft=0;L.scrollTop=0;};
function provaW(wid){const w=WEAPONS.find(q=>q.id===wid);if(!w)return;const eqW=WEAPONS.find(q=>q.id===(PROF.eqw||'pistol'))||WEAPONS.find(q=>q.id==='pistol');
  const rows=eqW&&eqW.id!==w.id?wCmp(w,eqW).map(([l,v])=>'<div class="pvRow"><span>'+l+'</span><b class="'+(v>0?'up42':v<0?'dn42':'')+'">'+(v>0?'+':'')+v+'%</b></div>').join(''):'';
  dialog('👁 '+w.name,'<div class="pvBars">'+wBars(w)+'</div>'+(rows?'<div class="pvCmp"><div class="small" style="opacity:.7">Rispetto a '+esc(eqW.name)+' (in mano al via)</div>'+rows+'</div>':'')+'<div class="small" style="margin-top:6px">'+esc(WHY[wid]||'')+'</div><div class="small" style="opacity:.6;margin-top:4px">DPS '+dps42(w)+' · Danno '+Math.round(w.dmg*w.pellets)+' per colpo · '+(1/w.rate).toFixed(1)+' colpi/s · caricatore '+w.mag+'</div>',[{label:'Chiudi',ghost:1}]);}
$('shopList').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.cbuy)cBuy(b.dataset.cbuy);else if(b.dataset.prova)provaW(b.dataset.prova);});
// gentle, dismissable suggestion: max once per session, after death or at dawn
let tipShown=false;
function tip42(){if(HINT42.run||tipShown||!starsOK('starter')||P42.st||owns('starter')||P42.L<2||!INVOICE_LINKS.starter)return;tipShown=true;HINT42.run=true;tipShow42(TIP42_TXT,9000);}
// soft hint placement: inline inside the game-over sheet, otherwise a small card at the top centre (never over buttons)
function tipShow42(html,ms,tries){const ov=$('overScreen');const bn=$('banner');if((!ov||ov.classList.contains('hidden'))&&bn&&bn.classList.contains('show')){if((tries|0)<10)setTimeout(()=>tipShow42(html,ms,(tries|0)+1),900);return;}if(ov&&!ov.classList.contains('hidden')){let d=ov.querySelector('.tipIn42');if(!d){d=document.createElement('div');d.className='tipIn42';const sb=ov.querySelector('.sb42');if(sb)sb.appendChild(d);else{const br=ov.querySelector('.btnRow');br.parentNode.insertBefore(d,br);}}
    d.innerHTML='<span>'+html+'</span><button class="act ghost" data-tipgo="1">Vedi</button>';return;}
  const e=$('tip42');e.querySelector('span').innerHTML=html;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),ms||9000);}
$('overScreen').addEventListener('click',ev=>{if(ev.target.closest('[data-tipgo]')){try{openShop('armi');}catch(e){}}});
const TIP42_TXT='🎁 Ti serve una mano? <b>Pacchetto di benvenuto</b>: SMG + 100💎 + 1.000🪙 per 25⭐, una sola volta.';
{const e=document.createElement('div');e.id='tip42';e.innerHTML='<span>🎁 Ti serve una mano? <b>Pacchetto di benvenuto</b>: SMG + 100💎 + 1.000🪙 per 25⭐, una sola volta.</span><button id="tipGo">Vedi</button><button id="tipX" aria-label="Chiudi">✕</button>';document.body.appendChild(e);
 onTap('tipX',()=>e.classList.remove('show'));onTap('tipGo',()=>{e.classList.remove('show');if(game.state==='over'||game.state==='menu')openShop('armi');else toast('Lo trovi nel Negozio dal menu',1600);});}
const _svGO42s=svGameOver;svGameOver=function(){_svGO42s();setTimeout(()=>{if(!(window.__econ42&&__econ42.hint42('over')))tip42();},1600);};
const _enterPhase42s=enterPhase;enterPhase=function(p,silent){_enterPhase42s(p,silent);if(!silent&&p==='dawn')setTimeout(tip42,4500);};
window.__shop42={CSHOP,cBuy,featuredId,tip42,provaW};

// ======================= v4.2 daily quests (reset at local midnight) =======================
const QPOOL=[{id:'kill30',t:'kill',n:30,tx:'Uccidi 30 zombie',c:150},{id:'night1',t:'night',n:1,tx:'Sopravvivi a 1 notte',c:200},{id:'build5',t:'build',n:5,tx:'Costruisci 5 pezzi',c:100},
  {id:'wood20',t:'wood',n:20,tx:'Raccogli 20 legna',c:80},{id:'crate3',t:'crate',n:3,tx:'Apri 3 casse',c:100},{id:'gear2',t:'gear',n:2,tx:'Raccogli 2 equipaggiamenti',c:120},{id:'craft3',t:'craft',n:3,tx:'Crea 3 oggetti',c:90},{id:'coin150',t:'coin',n:150,tx:'Raccogli 150 monete',c:100}];
function dayKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function qEnsure(){const k=dayKey();if(P42.q&&P42.q.d===k)return P42.q;
  const prev=P42.q;const y=new Date();y.setDate(y.getDate()-1);if(!(prev&&prev.d===dayKey(y)&&prev.all))P42.qs=0;
  let h=0;for(const ch of k)h=(h*31+ch.charCodeAt(0))>>>0;const pool=QPOOL.slice(),L=[];
  // always one kill/night style quest + two others
  while(L.length<3&&pool.length){h=(h*1103515245+12345)>>>0;L.push(pool.splice(h%pool.length,1)[0]);}
  P42.q={d:k,L:L.map(q=>({id:q.id,p:0,cl:0})),all:0};save42soon();return P42.q;}
function qDef(id){return QPOOL.find(q=>q.id===id);}
function qBonus(){return Math.min(.5,(P42.qs|0)*.1);}
function q42(t,n){const Q=qEnsure();let ch=false;for(const q of Q.L){const D=qDef(q.id);if(!D||D.t!==t||q.p>=D.n)continue;q.p=Math.min(D.n,q.p+(n||1));ch=true;if(q.p>=D.n){toast('📋 Missione completata: '+D.tx+' · ritira il premio',2000);play('dawn');}}
  if(ch){save42soon();qHUD();}}
window.q42=q42;
function qClaim(i){const Q=qEnsure(),q=Q.L[i],D=q&&qDef(q.id);if(!D||q.cl||q.p<D.n)return;q.cl=1;const c=Math.round(D.c*(1+qBonus()));addCoins(c);play('coin');floatTxt42('+'+c+' 🪙');
  if(Q.L.every(x=>x.cl)&&!Q.all){Q.all=1;P42.qs=(P42.qs|0)+1;const g=P42.qs>=3?2:1;addGems(g,true);setTimeout(()=>{play('buy');floatTxt42('+'+g+' 💎');toast('🎉 Tutte le missioni di oggi! +'+g+' 💎 · serie '+P42.qs+' giorni',2600);},450);}
  save42();qHUD();qRender();}
function floatTxt42(t){const d=document.createElement('div');d.className='qFloat';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1300);}
// compact collapsible edge tracker
{const e=document.createElement('div');e.id='quest42';e.innerHTML='<button id="qChip">📋 <b>0/3</b></button><div id="qList"></div>';$('hud').appendChild(e);
 onTap('qChip',()=>{e.classList.toggle('open');qHUD(true);});
 const qx=ev=>{if(ev.target.closest('#qX')){if(ev.cancelable)ev.preventDefault();e.classList.remove('open');qHUD(true);return true;}};e.addEventListener('click',qx);e.addEventListener('touchend',qx,{passive:false});
 e.addEventListener('click',ev=>{const b=ev.target.closest('button[data-qc]');if(b)qClaim(+b.dataset.qc);});
 e.addEventListener('touchend',ev=>{const b=ev.target.closest('button[data-qc]');if(b&&ev.cancelable){ev.preventDefault();qClaim(+b.dataset.qc);}},{passive:false});}
let qSig='';
function qRows(){const Q=qEnsure();return Q.L.map((q,i)=>{const D=qDef(q.id);if(!D)return '';const done=q.p>=D.n;return '<div class="qRow'+(q.cl?' cl':done?' done':'')+'"><span>'+esc(D.tx)+'</span><i><u style="width:'+Math.round(q.p/D.n*100)+'%"></u></i><small>'+Math.min(q.p,D.n)+'/'+D.n+'</small>'+(q.cl?'<em>✔</em>':done?'<button data-qc="'+i+'">Ritira '+Math.round(D.c*(1+qBonus()))+'🪙</button>':'<em>'+Math.round(D.c*(1+qBonus()))+'🪙</em>')+'</div>';}).join('');}
function qHUD(force){const Q=qEnsure();const n=Q.L.filter(q=>{const D=qDef(q.id);return D&&q.p>=D.n;}).length,cl=Q.L.filter(q=>q.cl).length,ready=n>cl;
  const s=n+'|'+cl+'|'+Q.L.map(q=>q.p).join(',')+'|'+$('quest42').classList.contains('open');if(s===qSig&&!force)return;qSig=s;
  $('qChip').innerHTML='📋 <b>'+n+'/3</b>'+(ready?' <span class="qDot"></span>':'');$('quest42').classList.toggle('ready',ready);
  if($('quest42').classList.contains('open'))$('qList').innerHTML='<div class="qHead"><b>📋 Missioni di oggi</b><button id="qX" aria-label="Chiudi">✕</button></div>'+qRows()+(P42.qs?'<div class="qStreak">🔥 Serie: '+P42.qs+' giorni · premi +'+Math.round(qBonus()*100)+'%</div>':'');
  const m=$('qMenuBtn');if(m)m.innerHTML='📋 Missioni <b>'+n+'/3</b>'+(ready?' <span class="qDot"></span>':'');}
function qRender(){const d=$('dlgB');if(d&&d.querySelector('.qPanel'))d.querySelector('.qPanel').innerHTML=qRows();}
function qOpen(){dialog('📋 Missioni di oggi','<div class="qPanel">'+qRows()+'</div><div class="small" style="opacity:.7;margin-top:6px">Si rinnovano a mezzanotte. Completale tutte per 💎 extra'+(P42.qs?' · serie attuale '+P42.qs+' giorni (+'+Math.round(qBonus()*100)+'% monete)':'')+'.</div>',[{label:'Chiudi',ghost:1}]);}
$('dlgScreen').addEventListener('click',e=>{const b=e.target.closest('.qPanel button[data-qc]');if(b)qClaim(+b.dataset.qc);});
{const b=document.createElement('button');b.id='qMenuBtn';b.className='qMenu';$('lvlMenu').appendChild(b);onTap('qMenuBtn',qOpen);}
TICK42.push(()=>{qHUD();});
qEnsure();qHUD(true);
window.__q42={qEnsure,q42,qClaim,QPOOL,P42};

// v42_ui

// ======================= v4.2 graphics & smoothness =======================
// filmic tone mapping (exposure tuned so the v4.1 look is kept, highlights roll off softly)
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=URLQ.get('expo')?+URLQ.get('expo'):1.05;
// zombie pose blending: smooth the snap between attack and walk poses
const ZJ=['spine','neck','shL','shR','elL','elR','hipL','hipR','kneeL','kneeR'],BL_T=.2;
const _updZ42=updateZombie;updateZombie=function(z,dt,t,target,canAttack){const st0=z.state;
  if(!z._pr){z._pr=new Float32Array(ZJ.length*3);z.bl=0;}
  _updZ42(z,dt,t,target,canAttack);if(z.dead||!z.spine)return;
  if(z.state!==st0&&z._ok){z.bl=BL_T;z._sn=z._pr.slice();}
  if(z.bl>0){z.bl-=dt;const k=1-Math.max(0,z.bl)/BL_T,e=k*k*(3-2*k);for(let i=0;i<ZJ.length;i++){const j=z[ZJ[i]];if(!j)continue;const o=i*3;j.rotation.x=lerp(z._sn[o],j.rotation.x,e);j.rotation.y=lerp(z._sn[o+1],j.rotation.y,e);j.rotation.z=lerp(z._sn[o+2],j.rotation.z,e);}}
  for(let i=0;i<ZJ.length;i++){const j=z[ZJ[i]];if(!j)continue;const o=i*3;z._pr[o]=j.rotation.x;z._pr[o+1]=j.rotation.y;z._pr[o+2]=j.rotation.z;}z._ok=1;
  // snow puffs from shuffling feet
  if(SV.on&&z.state!=='atk'&&Math.random()<dt*2.2){const p=z.g.position;_tmp.set(p.x+rand(-.2,.2),.05,p.z+rand(-.2,.2));emit(_tmp,_up,2,[0xeef2f8,0xd8dee8],{speed:.7,spread:1,life:.55,size:.07,grav:.6,up:.3});}};
// soft blob shadows under world drops / coins
const blob42Tex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);return t;})();
const blob42Mat=new T.MeshBasicMaterial({map:blob42Tex,transparent:true,depthWrite:false});const blob42Geo=new T.PlaneGeometry(1,1);blob42Geo.rotateX(-Math.PI/2);
for(const d of GD){const b=new T.Mesh(blob42Geo,blob42Mat);b.position.y=.02;b.scale.setScalar(.9);d.root.add(b);}
// breath vapour at night when the player is still / sprinting (subtle)
const _br42=new T.Vector3();let brT=0;TICK42.push(dt=>{if(!SV.on||game.state!=='play')return;brT-=dt;if(brT<=0&&nightF()>.5){brT=rand(2.4,3.6);camera.getWorldPosition(_tmp);const f=_br42.set(0,-.12,-.45).applyQuaternion(camera.quaternion);_tmp.add(f);emit(_tmp,_up,4,[0xffffff,0xe8eef8],{speed:.35,spread:1,life:.9,size:.06,grav:-.3});}});

// ======================= v4.2 (17) frame hitches: shader precompile, idle audio, fewer allocations =======================
// (a) three.js renders transparent DoubleSide materials in 2 passes and flips material.needsUpdate twice per draw -> program
//     lookup + getParameters garbage every frame. forceSinglePass removes it (visually identical for our additive/alpha fx).
// (b) materials shared by Mesh and InstancedMesh force a program switch per draw -> give instanced users their own clone (kept in sync).
const PF42={warm:0,split:[],syncT:0,log:[]};
function pfLog(){try{slog&&slog.apply(null,['perf'].concat([].slice.call(arguments)));}catch(e){}}
function fixMats42(root){const users=new Map();root.traverse(o=>{const m=o.material;if(!m||Array.isArray(m))return;
    if(m.transparent&&m.side===T.DoubleSide&&!m.forceSinglePass)m.forceSinglePass=true;
    const sig=(o.isInstancedMesh?'I':'')+(o.isInstancedMesh&&o.instanceColor?'c':'')+(o.isSkinnedMesh?'S':'');let u=users.get(m);if(!u)users.set(m,u=new Map());if(!u.has(sig))u.set(sig,[]);u.get(sig).push(o);});
  let n=0;for(const [m,u] of users){if(u.size<2)continue;let first=true;for(const [sig,objs] of u){if(first){first=false;continue;}const c=m.clone();for(const o of objs)o.material=c;PF42.split.push([m,c]);n++;}}
  return n;}
function syncMats42(){for(const [m,c] of PF42.split){if(m.color&&c.color)c.color.copy(m.color);if(m.emissive&&c.emissive)c.emissive.copy(m.emissive);c.opacity=m.opacity;c.visible=m.visible;if(c.map!==m.map)c.map=m.map;}}
// (c) shader warm-up: compile every program the run will need (zombie pool, coins, gear beams/halos, blob shadows, traps, VM weapons)
//     while the menu is idle, using KHR_parallel_shader_compile when available (compileAsync), so spawns don't stall a frame.
try{PF42.par=!!renderer.getContext().getExtension('KHR_parallel_shader_compile');if(!window.__DBG)renderer.debug.checkShaderErrors=false;}catch(e){}
function warmShaders42(tag){if(!renderer||!renderer.compile)return;const t0=performance.now(),p0=renderer.info.programs.length;let n=0;
  try{n=fixMats42(scene)+fixMats42(vmScene);}catch(e){}
  // renderer.compile() walks ALL materials (visible or not); do it one top-level object at a time in idle slices (<=8 ms or 1 new program per slice)
  const tmp=new T.Group();try{if(typeof gMats!=='undefined')for(const m of gMats.concat([gDark]))tmp.add(new T.Mesh(G.box,m));}catch(e){}
  const Q=[];const seen422=new Set();const add422=(root,cam,sc)=>{root.traverse(o=>{const m=o.material;if(!m)return;const ms=Array.isArray(m)?m:[m];const sig=(o.isInstancedMesh?'I':'')+(o.isSkinnedMesh?'S':'')+(o.isPoints?'P':'')+(o.isSprite?'s':'')+(o.isLine?'L':'');
    let fresh=false;for(const mm of ms){const key=mm.uuid+sig;if(!seen422.has(key)){seen422.add(key);fresh=true;}}if(fresh)Q.push([o,cam,sc,1]);});};
  for(const o of scene.children)add422(o,camera,scene);add422(tmp,camera,scene);for(const o of vmScene.children)add422(o,vmCam,vmScene);
  const pend=[];let k=0,slices=0,maxSl=0,made=0;const step=dl=>{const s0=performance.now();slices++;made=0;
    // finish (link + uniforms) one pending program per slice; with KHR_parallel_shader_compile just wait until the driver is done
    if(pend.length){const pr=pend.shift();try{if(pr.isReady&&!pr.isReady())pend.push(pr);}catch(e){}}
    else while(k<Q.length){const [o,cam,sc]=Q[k++];const before=renderer.info.programs.length;const kids=o.children;let sv=null;if(kids&&kids.length){sv=kids.slice();kids.length=0;}try{renderer.compile(o,cam,sc);}catch(e){}finally{if(sv){kids.length=0;for(const c of sv)kids.push(c);}}
      const L=renderer.info.programs;if(PF42.par)for(let i=before;i<L.length;i++)pend.push(L[i]);if(L.length>before){made=1;break;}if(performance.now()-s0>6)break;}
    maxSl=Math.max(maxSl,performance.now()-s0);
    if(k<Q.length||pend.length){if(made&&!PF42.par)setTimeout(()=>_idle42(step,1200),150);else _idle42(step,1200);return;}
    if(tag==='menu'&&typeof renderThumbsIdle==='function')_idle42(()=>{try{renderThumbsIdle();}catch(e){}},1500);
    const ms=Math.round(performance.now()-t0),np=renderer.info.programs.length-p0;PF42.warm++;PF42.log.push([tag,ms,np,n,slices,Math.round(maxSl),Math.round(t0)]);
    pfLog('warm423',tag,'total='+ms+'ms','newProg='+np,'split='+n,'slices='+slices,'maxSlice='+Math.round(maxSl)+'ms','par='+(PF42.par?1:0));};
  _idle42(step,600);}
const _idle42=window.requestIdleCallback?(f,t)=>requestIdleCallback(f,{timeout:t||1500}):(f,t)=>setTimeout(()=>f({timeRemaining:()=>8,didTimeout:true}),Math.min(t||200,200));
setTimeout(()=>_idle42(()=>{if(!(window.__ld431&&__ld431.menuW))warmShaders42('menu');},2500),1200);
const _startGame42=startGame;startGame=function(){const r=_startGame42.apply(this,arguments);setTimeout(()=>_idle42(()=>{if(!(window.__ld431&&(__ld431.on||__ld431.hold)))warmShaders42('play');},1200),700);return r;};
TICK42.push(dt=>{PF42.syncT-=dt;if(PF42.syncT<=0){PF42.syncT=.25;if(PF42.split.length)syncMats42();}});
// (d) music pre-render built in small idle-time chunks (graph building was one long task per theme)
renderTheme=function(k){const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OAC)return Promise.resolve(null);
  const th=THEMES[k],beat=60/th.bpm,sx=beat/4,L=mLoopLen(k)*MVAR[k],tail=1.4,Ls=Math.round(L*MSR),len=Ls+tail*MSR;let oc;
  try{oc=new OAC(1,len,MSR);}catch(e){return Promise.resolve(null);}
  const swap=fn=>{const sv={ctx:AU.ctx,noise:AU.noise};AU.ctx=oc;if(PF42.noise)AU.noise=PF42.noise;try{return fn();}finally{AU.ctx=sv.ctx;AU.noise=sv.noise;}};
  let M,steps,i=0,ok=true;
  try{swap(()=>{if(!PF42.noise||PF42.noise.sampleRate!==MSR){const n=MSR*1.5,nb=oc.createBuffer(1,n,MSR),nd=nb.getChannelData(0);for(let j=0;j<n;j++)nd[j]=Math.random()*2-1;PF42.noise=nb;AU.noise=nb;}
    const lp=oc.createBiquadFilter();lp.type='lowpass';lp.frequency.value=k==='boss'?5200:3600;lp.connect(oc.destination);
    const ir=makeIR(oc,1.2,1,2400);const cv=oc.createConvolver();cv.buffer=ir;const wl=oc.createBiquadFilter();wl.type='lowpass';wl.frequency.value=2800;const wg=oc.createGain();wg.gain.value=MUSDBG.oldIR?.3:.1;lp.connect(wl).connect(cv).connect(wg).connect(oc.destination);
    M={step:0,lp,mi:3};steps=Math.round(L/sx);});}catch(e){return Promise.resolve(null);}
  return new Promise(res=>{const chunk=dl=>{try{swap(()=>{const t0=performance.now();while(i<steps&&(performance.now()-t0<6)){schedTheme(k,M,.01+i*sx,beat);M.step=(M.step+1)%(16*th.chords.length);i++;}});}catch(e){ok=false;}
      if(!ok){res(null);return;}if(i<steps){_idle42(chunk,400);return;}
      const done=rb=>{try{const out=oc.createBuffer(1,Ls,MSR),o=out.getChannelData(0),src=rb.getChannelData(0);const fade=Math.min(Math.round(MSR*.06),Ls>>3);
        for(let j=0;j<Ls;j++)o[j]=src[j]||0;for(let j=Ls;j<src.length&&j-Ls<Ls;j++)o[j-Ls]+=src[j];
        if(fade>16){for(let j=0;j<fade;j++){const w=j/fade;o[j]=o[j]*w+(src[Ls-fade+j]||0)*(1-w);}}res(musLimit(out));}catch(e){res(null);}};
      try{const pr=oc.startRendering();if(pr&&pr.then)pr.then(done,()=>res(null));else oc.oncomplete=e=>done(e.renderedBuffer);}catch(e){res(null);}};
    _idle42(chunk,400);});};
// (e) collide(): hot path for player + every zombie each frame -> indexed loops, cheap AABB/radius rejects, no Math.hypot
collide=function(p,r){const B=boxes,C=circles;let x=p.x,z=p.z;
  for(let i=0,n=B.length;i<n;i++){const b=B[i];if(x<b.x0-r||x>b.x1+r||z<b.z0-r||z>b.z1+r)continue;const cx=x<b.x0?b.x0:x>b.x1?b.x1:x,cz=z<b.z0?b.z0:z>b.z1?b.z1:z;const dx=x-cx,dz=z-cz,d2=dx*dx+dz*dz;
    if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);x=cx+dx/d*r;z=cz+dz/d*r;}else{const l=x-b.x0,rr=b.x1-x,u=z-b.z0,dd=b.z1-z,m=Math.min(l,rr,u,dd);if(m===l)x=b.x0-r;else if(m===rr)x=b.x1+r;else if(m===u)z=b.z0-r;else z=b.z1+r;}}}
  for(let i=0,n=C.length;i<n;i++){const c=C[i];if(c.off)continue;const m=c.r+r,dx=x-c.x,dz=z-c.z;if(dx>m||dx<-m||dz>m||dz<-m)continue;const d2=dx*dx+dz*dz;if(d2<m*m&&d2>1e-12){const d=Math.sqrt(d2);x=c.x+dx/d*m;z=c.z+dz/d*m;}}
  const L=HALF-.5;p.x=x<-L?-L:x>L?L:x;p.z=z<-L?-L:z>L?L:z;};
window.__perf42={PF42,warmShaders42,fixMats42};

// ======================= v4.2 (19/21) Telegram: no accidental close, landscape lock =======================
// lockOrientation() locks the CURRENT orientation, so it is only called while in landscape (and again after rotating back).
const TG42={done:false,locked:false};
function tg42Land(){return innerWidth>innerHeight;}
function tg42Lock(){const W=TG.W;if(!W)return;try{if(W.unlockOrientation&&tgVer('8.0')){W.unlockOrientation();}}catch(e){}}
function tg42Setup(){const W=TG.W;if(!W||TG42.done)return;TG42.done=true;
  try{if(tgVer('7.7')&&W.disableVerticalSwipes)W.disableVerticalSwipes();}catch(e){}
  try{if(tgVer('6.2')&&W.enableClosingConfirmation)W.enableClosingConfirmation();}catch(e){}
  try{tgFull();}catch(e){}tg42Lock();
  try{W.onEvent('fullscreenChanged',()=>{TG42.locked=false;setTimeout(tg42Lock,200);});}catch(e){}}
{const iv=setInterval(()=>{if(TG.W){tg42Setup();clearInterval(iv);}},300);setTimeout(()=>clearInterval(iv),20000);}
addEventListener('resize',()=>setTimeout(()=>{if(TG.W&&tg42Land())tg42Lock();},250));
window.__tg42=TG42;

// ---- v4.2 safe layout: landscape-only + Telegram insets on every screen ----
const SAFE42={cls:'',dbg:''};
let safe42Pr=null;
const SPX431={};let SPX431t=0;addEventListener('resize',()=>{SPX431t=0;});try{visualViewport.addEventListener('resize',()=>{SPX431t=0;});}catch(e){}
function safe42Px(n){const t=performance.now();if(t-SPX431t>700){for(const k in SPX431)delete SPX431[k];SPX431t=t;}if(n in SPX431)return SPX431[n];return SPX431[n]=safe42PxRaw(n);}
function safe42PxRaw(n){if(n==='--sat'||n==='--sab'||n==='--sal'||n==='--sar'){if(!safe42Pr){safe42Pr=document.createElement('div');safe42Pr.style.cssText='position:fixed;left:0;top:0;width:0;visibility:hidden;pointer-events:none';document.body.appendChild(safe42Pr);}
    safe42Pr.style.height='var('+n+',0px)';return safe42Pr.getBoundingClientRect().height||0;}
  const v=getComputedStyle(document.documentElement).getPropertyValue(n);return parseFloat(v)||0;}
// quests chip: out of #hud (z 5) so the joystick zone (#controls z 6) never covers it
{const q=document.getElementById('quest42');if(q&&q.parentNode!==document.body)document.body.appendChild(q);}
function safe42Fit(){SPX431t=0;const de=document.documentElement,b=document.body;if(!b)return;
  const sat=safe42Px('--sat'),sab=safe42Px('--sab'),ct=safe42Px('--tg-content-safe-area-inset-top');
  let vh=innerHeight;try{if(window.visualViewport&&visualViewport.height>150)vh=Math.min(vh,visualViewport.height);}catch(e){}
  const vcut=safe42Px('--vcut');const avail=vh-sat-Math.max(0,sab-vcut),land=innerWidth>innerHeight;
  de.style.setProperty('--avh',Math.round(avail)+'px');
  b.classList.toggle('homeC',land&&avail<430);b.classList.toggle('homeXC',land&&avail<330);b.classList.toggle('homeXXC',land&&avail<250);
  b.classList.toggle('safeC',land&&avail<300);
  // rotate overlay: everywhere in portrait (touch devices)
  try{const pt=$('portrait');if(pt)pt.classList.add('show');}catch(e){}
  // debug button stays just under Telegram's bar (the old band slot sat under Chiudi and was not tappable)
  const d=document.getElementById('zdbgB');if(d){d.classList.remove('dbgBand','dbgEdge');d.style.removeProperty('--dbgTop');}
  SAFE42.cls=b.className;SAFE42.avail=avail;try{homeFit4317();}catch(e){}}
function homeFit4317(){const m=document.querySelector('#startScreen .menuL');if(!m)return;m.style.zoom='';
  const room=m.clientHeight,need=m.scrollHeight;if(room>80&&need>room+1){const z=Math.max(.72,Math.min(1,room/need));m.style.zoom=z.toFixed(3);}}
let safe42T=0;function safe42Soon(){clearTimeout(safe42T);safe42T=setTimeout(safe42Fit,40);}
addEventListener('resize',()=>{safe42Fit();[150,400,900].forEach(t=>setTimeout(safe42Fit,t));});
addEventListener('orientationchange',()=>[100,400,900].forEach(t=>setTimeout(safe42Fit,t)));
{const iv=setInterval(safe42Fit,500);setTimeout(()=>clearInterval(iv),20000);}
try{new MutationObserver(safe42Soon).observe(document.body,{childList:true});}catch(e){}
{const hk=setInterval(()=>{const W=TG.W;if(!W||!W.onEvent)return;clearInterval(hk);for(const ev of ['safeAreaChanged','contentSafeAreaChanged','fullscreenChanged','viewportChanged'])try{W.onEvent(ev,()=>setTimeout(safe42Fit,30));}catch(e){}},300);setTimeout(()=>clearInterval(hk),20000);}
safe42Fit();
window.__safe42={fit:safe42Fit,S:SAFE42};
{const hud=document.getElementById('hud');setInterval(()=>{const off=!hud||getComputedStyle(hud).display==='none'||game.state==='menu';if(document.body.classList.contains('hudOff42')!==off)document.body.classList.toggle('hudOff42',off);},250);}
// compact shop: buttons that would clip their label get the short form ("⭐ 100" instead of "Compra con ⭐ 100")
function shopShort42(){const S=$('shopScreen');if(!S||S.classList.contains('hidden'))return;
  const B=[];for(const b of S.querySelectorAll('.sbtns>button')){if(b.classList.contains('zsNote'))continue;if(b.dataset.full==null)b.dataset.full=b.textContent;if(b.textContent!==b.dataset.full)b.textContent=b.dataset.full;B.push(b);}
  const o1=B.map(b=>b.scrollWidth>b.clientWidth+1);B.forEach((b,i)=>{if(o1[i])b.textContent=b.dataset.full.replace(/^Compra con\s*/,'').replace(/^Equipaggia$/,'Usa');});
  const o2=B.map((b,i)=>o1[i]&&b.scrollWidth>b.clientWidth+1);B.forEach((b,i)=>{if(b.classList.contains('tiny42')!==o2[i])b.classList.toggle('tiny42',o2[i]);});}
{const _sf=shopFit;shopFit=function(){_sf.apply(this,arguments);try{shopShort42();}catch(e){}};
 const _rs=renderShop;renderShop=function(){const r=_rs.apply(this,arguments);try{shopShort42();requestAnimationFrame(()=>{shopShort42();});}catch(e){}return r;};}
// sheets: content scrolls, the bottom button row (Chiudi / Indietro / Riprova…) is always visible
function wrapSheets42(){for(const sh of document.querySelectorAll('.overlay.sheetBg>.sheet')){if(sh.classList.contains('wrap42'))continue;const last=sh.lastElementChild;
  if(!last||!last.classList.contains('btnRow'))continue;const sb=document.createElement('div');sb.className='sb42';while(sh.firstChild&&sh.firstChild!==last)sb.appendChild(sh.firstChild);sh.insertBefore(sb,last);sh.classList.add('wrap42');}}
try{wrapSheets42();}catch(e){console.error(e);}setTimeout(()=>{try{wrapSheets42();}catch(e){}},1500);
// ---- 4.2.1: quests chip in the top row right of level/coins; open panel never over the joystick ----
function q421Place(){const q=document.getElementById('quest42'),h=document.getElementById('hud42');if(!q||!h||document.body.classList.contains('hudOff42'))return;
  const r=h.getBoundingClientRect();if(r.width<2)return;const ch=q.querySelector('#qChip');const chH=ch?ch.offsetHeight||26:26;
  top423();
  const L=document.getElementById('qList');if(!L)return;
  document.body.classList.toggle('q421open',q.classList.contains('open'));
  if(q.classList.contains('open')){const jb=document.getElementById('joyBase').getBoundingClientRect(),bag=document.getElementById('bagBtn');
    const left=Math.max(r.right+8,(window.__joy421&&__joy421.r||jb.right)+28),top=r.bottom+6,right=bag&&bag.offsetWidth?bag.getBoundingClientRect().left-8:innerWidth-200;
    let bot=innerHeight-(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab'))||0)-60;for(const id of ['wbar','buildBar']){const e=document.getElementById(id);if(e&&e.offsetWidth){const t=e.getBoundingClientRect().top;if(t>top+60)bot=Math.min(bot,t-6);}}
    L.style.cssText='position:fixed;margin:0;left:'+Math.round(left)+'px;top:'+Math.round(top)+'px;width:'+Math.round(Math.max(220,Math.min(340,right-left)))+'px;max-height:'+Math.round(Math.max(90,bot-top))+'px;overflow-y:auto';
    L.classList.remove('qTight');if(L.scrollHeight>L.clientHeight+1)L.classList.add('qTight');try{q422Panel();}catch(e){}}
  else if(L.style.cssText)L.style.cssText='';}
setInterval(q421Place,250);
{let qT=0;const q=document.getElementById('quest42');
 const close=()=>{if(q&&q.classList.contains('open')){q.classList.remove('open');try{qHUD(true);}catch(e){}q421Place();}};
 if(q)q.addEventListener('pointerdown',()=>{if(q.classList.contains('open')){clearTimeout(qT);qT=setTimeout(close,15000);}});
 if(q)new MutationObserver(()=>{clearTimeout(qT);q421Place();if(q.classList.contains('open'))qT=setTimeout(close,15000);}).observe(q,{attributes:true,attributeFilter:['class']});
 for(const id of ['joyZone','lookZone','fireBtn'])try{document.getElementById(id).addEventListener('touchstart',close,{passive:true});document.getElementById(id).addEventListener('pointerdown',close);}catch(e){}}
// ---- 4.2.1b: joystick home never under the top HUD row / above the weapon bar; weapon name, build bar and hint kept out of the joystick zone ----
const JOY421={l:0,t:0,r:0,b:0,s:1};
function joyHome421(){const cs=getComputedStyle(document.documentElement),sl=parseFloat(cs.getPropertyValue('--sal'))||0,sab=parseFloat(cs.getPropertyValue('--sab'))||0,ui=parseFloat(cs.getPropertyValue('--ui'))||1;
  const diam=326*ui,cx=Math.min(Math.max(251*ui+sl,VW()*.13+sl),296*ui+sl);let rowB=0;
  for(const id of ['pauseBtn','hud42','quest42']){const e=document.getElementById(id);if(e&&e.offsetWidth){const r=e.getBoundingClientRect();if(r.left<cx+diam||id==='hud42')rowB=Math.max(rowB,r.bottom);}}
  if(!rowB)rowB=(parseFloat(cs.getPropertyValue('--sat'))||0)+110*ui;
  const botLim=VH()-sab-136*ui,topLim=rowB+60*ui,avail=botLim-topLim,s=Math.max(.7,Math.min(1,avail/diam)),R=diam/2*s;
  let cy=VH()-412*ui-sab;cy=Math.min(Math.max(cy,topLim+R),botLim-R);
  Object.assign(JOY421,{l:cx-R,t:cy-R,r:cx+R,b:cy+R,s,cx,cy});return JOY421;}
homeJoy=function(){const J=joyHome421();placeJoyBase(J.cx,J.cy);joyBase.style.transform=J.s<1?'scale('+J.s.toFixed(3)+')':'';joyKnob.style.transform='';};
function joy421Tick(){try{uiApply451();}catch(e){}if(document.body.classList.contains('hudOff42')){const tp=document.getElementById('tip42');if(tp)tp.style.removeProperty('top');return;}const o={...JOY421},J=joyHome421();
  if(joy.id===null&&(Math.abs(o.cy-J.cy)>.5||o.s!==J.s))homeJoy();
  const X=Math.round(J.r+28)+'px';const wi=document.getElementById('weaponInfo');if(wi)wi.style.setProperty('left',X,'important');
  const bb=document.getElementById('buildBar');if(bb)bb.style.setProperty('left',X,'important');
  let rowB=0;for(const id of ['pauseBtn','hud42','quest42','bagBtn']){const e=document.getElementById(id);if(e&&e.offsetWidth)rowB=Math.max(rowB,e.getBoundingClientRect().bottom);}
  const tp=document.getElementById('tip42');if(tp&&rowB)tp.style.setProperty('top',Math.round(rowB+8)+'px','important');}
setInterval(joy421Tick,250);setTimeout(()=>{try{homeJoy();joy421Tick();}catch(e){}},300);
window.__joy421=JOY421;

// ======================= v4.2 economy: power ladder, coin sinks, soft hints =======================
// ---- power ladder: the numbers on each weapon are the base. Coins add up to +50%, gear up to +35%.
// sustained single-target DPS (magazine + reload; 75% pellet hit rate for shotguns; flamer includes burn)
function dps42(w){if(!w||w.melee||!w.mag)return 0;const eff=w.pellets>1?.75:1;let d=w.dmg*w.pellets*eff*w.mag/(w.mag*w.rate+(w.reload||0));if(w.kind==='flame')d+=16;return Math.round(d);}
const COIN_W=['smg','ar'];
function wById(id){return WEAPONS.find(q=>q.id===id);}
function bestCoinDps(){return Math.max(...COIN_W.map(id=>dps42(wById(id))));}
function heldW42(){try{if(game.state==='play'){const w=WEAPONS[curW];if(w&&!w.melee&&w.mag)return w;}}catch(e){}return wById(PROF.eqw||'pistol')||wById('pistol');}
// ---- permanent base upgrades (coins): stronger pieces / traps ----
const _addPieceE42=addPiece;addPiece=function(type,x,z,rot,hp){const p=_addPieceE42.apply(this,arguments);try{const D=PDEF[type];
  const m=1+.15*(P42.cu.wall|0)+(D.trap?.3*(P42.cu.trap|0):0);if(m>1){p.max=Math.round(D.hp*m);p.hp=hp?Math.min(p.max,hp):p.max;pieceWrite(p);}}catch(e){}return p;};
// ---- cosmetics: crosshair colours ----
const COS42={cx_red:'#ff5a4a',cx_gold:'#ffc83a',cx_neon:'#4dfff0'};
function cosApply(){const c=COS42[P42.cx]||'';document.documentElement.style.setProperty('--cx42',c||'rgba(255,255,255,.9)');}
if(!Array.isArray(P42.cos))P42.cos=[];cosApply();
// ---- in-run coin services (crafting screen, tab "🪙 Servizi") ----
const SVC42=[{id:'ammo',n:'Munizioni piene',e:'📦',d:'Caricatori e riserva al massimo per tutte le tue armi',c:90},
  {id:'med',n:'Medikit',e:'🩹',d:'+50 salute subito',c:60},
  {id:'rep',n:'Ripara tutta la base',e:'🔨',d:'Tutti i pezzi della base tornano integri',c:150},
  {id:'nade',n:'Granata',e:'💣',d:'+1 granata subito',c:45}];
function svcState(id){if(id==='ammo'){const g=WEAPONS.filter(w=>own[w.id]&&!w.melee&&w.mag);return g.some(w=>(res[w.id]|0)<w.maxReserve||(mag[w.id]|0)<w.mag)?'':'Già al massimo';}
  if(id==='med')return player.hp>=player.maxHp?'Salute piena':'';
  if(id==='rep')return PIECES.some(p=>p.alive&&p.hp<p.max)?'':'Base integra';return '';}
function svcHTML(){return '<div class="sub2">Spendi le monete durante la partita · hai 🪙 <b>'+fmt(P42.c)+'</b></div>'+SVC42.map(s=>{const st=svcState(s.id);
  return '<div class="recipe"><div><div class="name">'+s.e+' '+esc(s.n)+'</div><div class="cost">'+esc(st||s.d)+'</div></div><button class="act'+(P42.c<s.c||st?' ghost':'')+'" data-svc="'+s.id+'"'+(st?' disabled':'')+'>🪙 '+s.c+'</button></div>';}).join('');}
function svcBuy(id){const s=SVC42.find(q=>q.id===id);if(!s||svcState(id))return;if(P42.c<s.c){toast('Ti servono 🪙 '+s.c+' (ne hai '+fmt(P42.c)+')',1500);return;}
  addCoins(-s.c);
  if(id==='ammo'){for(const w of WEAPONS)if(own[w.id]&&!w.melee&&w.mag){res[w.id]=w.maxReserve;mag[w.id]=w.mag;}toast('📦 Munizioni al massimo',1400);}
  else if(id==='med'){player.hp=Math.min(player.maxHp,player.hp+50);toast('🩹 +50 salute',1200);}
  else if(id==='rep'){for(const p of PIECES)if(p.alive&&p.hp<p.max){p.hp=p.max;pieceWrite(p);}toast('🔨 Base riparata',1400);}
  else if(id==='nade'){S.nades=(S.nades|0)+1;toast('💣 +1 granata',1200);}
  play('buy');try{updateHUD();}catch(e){}renderCraft();}
{const t=$('craftTabs');const b=document.createElement('button');b.className='tab';b.dataset.c='svc';b.textContent='🪙 Servizi';t.appendChild(b);}
const _rc42=renderCraft;renderCraft=function(){_rc42();if(SV.on&&craftTab==='svc'){$('recipes').innerHTML=svcHTML();document.querySelectorAll('#craftTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.c==='svc'));}};
$('recipes').addEventListener('click',e=>{const b=e.target.closest('button[data-svc]');if(b&&!b.disabled)svcBuy(b.dataset.svc);});
// ---- soft hint: max once per run (boss appears or death), no timers/pressure ----
const _sg42=startGame;startGame=function(){HINT42.run=false;try{const d=document.querySelector('#overScreen .tipIn42');if(d)d.remove();$('tip42').classList.remove('show');}catch(e){}return _sg42.apply(this,arguments);};
function hintTarget(){const cur=heldW42(),cd=dps42(cur)||1;let best=null;for(const s of SHOP_W){const w=wById(s.w);if(!w||owns(s.id)||s.rar!=='leggendario')continue;if(!best||dps42(w)>dps42(best))best=w;}
  if(!best)return null;const x=dps42(best)/cd;return x>=1.3?{w:best,x}:null;}
function hint42(why){if(HINT42.run)return false;const h=hintTarget();if(!h)return false;HINT42.run=true;const e=$('tip42');if(!e)return false;
  tipShow42((why==='boss'?'☠ Boss in arrivo · ':'')+'Con il <b>'+esc(h.w.name)+'</b> avresti fatto <b>×'+h.x.toFixed(1)+'</b> danno. <small>Solo con 💎</small>',why==='boss'?6000:9000);return true;}
if(typeof bossIntro2==='function'){const _bi=bossIntro2;bossIntro2=function(){const r=_bi.apply(this,arguments);setTimeout(()=>hint42('boss'),3500);return r;};}
window.__econ42={dps42,bestCoinDps,SVC42,svcBuy,hint42,hintTarget,COS42,get hintShown(){return HINT42.run;}};
window.__econ42T={WEAPONS,SHOP_W,get PROF(){return PROF;},addPiece,removePiece,PDEF,res,mag,player,SV,enterPhase,gems:()=>PROF.gems};

// ---- 4.2.1: Bacheca aggiornamenti (Novità). Live content from updates.json (same site, ?nc= cache-bust); bundled fallback below ----
const NEWS421_FB={"rev":"2026-10-09a","upcoming":[{"icon":"🆕","title":"Nuove sfide ed eventi","desc":"Altre novità per il gioco, restate sintonizzati!","eta":"In arrivo","tone":"later"}],"recent":[{"ver": "4.3.75", "date": "9 ott", "items": ["🏢 Interni dei palazzi ridisegnati: cucine, camere, uffici, ospedale, scuola, negozi e officine arredati, con finestre, quadri, lampade, scaffali pieni, detriti e sangue (dettagli in base alla grafica Bassa/Media/Alta)", "⚔️ Arena: personaggi ridisegnati con elmetto, giubbotto tattico, zaino, guanti, volto e fucile impugnato con due mani", "🚀 Arena più fluida: movimento degli avversari interpolato, grafica preparata prima di entrare e protezioni contro i blocchi", "🎨 Nuova schermata Arena: modalità chiare (Duello 1v1 / Squadre 3v3), scelta arma con immagini, regole e premi", "🪙 Premi Arena: monete per uccisioni, vittoria o pareggio (con limite giornaliero)"]},{"ver": "4.3.74", "date": "8 ott", "items": ["🐛 Corretti: errore all'avvio/rotazione schermo, boss bloccato mentre ti insegue, liste che non scorrevano o tornavano indietro", "🏠 Rifugio più realistico: assediano la casa solo gli zombie vicini che ti hanno visto entrare, gli altri continuano a vagare", "🪴 Vaso ridisegnato", "🛡️ 10 nuove difese: porta blindata, barricata chiodata, bunker di sacchi, muro chiodato, campana d'allarme, balestra automatica, fossato, fossa con punte, trappola di fuoco, pavimento elettrico", "🪤 Nuova categoria Trappole e nuove icone disegnate per tutti gli oggetti da costruire"]},{"ver":"4.3.73","date":"8 ott","items":["🛠️ Ottimizzazione interna: il codice del gioco ora è diviso in più file, così si carica e si aggiorna meglio"]},{"ver":"4.3.72","date":"8 ott","items":["👥 Invita un amico: lui riceve 500 🪙 appena entra dal tuo link, tu 1000 🪙 quando arriva al giorno 2 o uccide 50 zombie","⭐ Se un amico invitato compra con le Stelle, ricevi il 10% in monete","🎁 Le monete degli inviti arrivano da sole quando apri il gioco, e nel tasto Invita vedi quanti amici hai invitato"]},{"ver":"4.3.71","date":"7 ott","items":["⚡ Più fluido con tanti zombie: ogni zombie si disegna in un colpo solo invece di 12 pezzi","🖼️ Le immagini delle armi compaiono subito, nello zaino e nella barra","🚀 Gli effetti si preparano nel menu, così all'inizio della partita non ci sono scatti","🎵 La musica si prepara senza bloccare il gioco"]},{"ver":"4.3.70","date":"7 ott","items":["🔫 Il tasto Armi ha l'icona di una pistola","🎒 Nello zaino armi ogni arma ha il suo disegno, anche le armi in mano (1 e 2), e la lista scorre bene col dito","🔦 La torcia si accende davvero, anche di giorno, e il tasto è più comodo: giallo acceso, barrato spento","🧟 Zombie più curati: teste arrotondate, occhi incavati, naso, ciuffi, vestiti strappati, ferite e pelle di colori diversi"]},{"ver":"4.3.69","date":"7 ott","items":["⚡ Partita più fluida: niente scatti all'inizio e meno micro-blocchi durante il gioco","🔦 Tasto torcia spostato, non copre più il tasto spara","🪙 Le monete si raccolgono subito quando sei vicino, anche mentre cadono","😱 Più suspense: ogni tanto si sentono urla lontane, soprattutto di notte"]},{"ver":"4.3.68","date":"7 ott","items":["🔦 Torcia vera: fascio stretto dove miri, pulsante per accenderla e spegnerla (tasto F su PC)","🚪 Porte e cancelli si incastrano nel muro senza spazi","🎒 Porti 2 armi da fuoco, le altre restano nello zaino; ascia e piccone sempre con te","🏗️ Nuovi pezzi: muro rinforzato, feritoia, tagliola, palizzata; i pezzi si sbloccano con il livello","🌫️ Notte con nebbia fitta, vento e lamenti lontani; fulmini e tuoni durante la pioggia, che non entra più nelle case"]},{"ver":"4.3.67","date":"7 ott","items":["🌧️ Pioggia a scrosci e nebbia più fitta, atmosfera ancora più cupa","🎯 Mirini nuovi per ogni arma che mostrano la dispersione reale, marcatore per colpi alla testa","🩸 Sangue più realistico, testa che esplode col colpo in testa e cadute con fisica","🔫 Armi nelle casse con confronto: Metti nello zaino o Sostituisci","📦 Munizioni divise tra le tue armi, scatole colorate per tipo e monete d'oro che rimbalzano e rotolano"]},{"ver":"4.3.66","date":"7 ott","items":["🌫️ Atmosfera più cupa: nebbiolina sulla città e luce più scura","💡 Lampioni con luce calda, aloni e coni di luce; torcia più forte e lunga","🗺️ Minimappa nuova: zoom sul giocatore, strade, edifici, zombie e direzione","🧟 Più zombie in giro e orde più grandi"]},{"ver":"4.3.65","date":"7 ott","items":["Gli zombie camminano con un passo più naturale, ginocchia e braccia in opposizione","Nell'arena gli altri giocatori sono persone che camminano, non manichini","Li vedi di fronte, con volto, braccia, gambe e un'arma in mano"]},{"ver":"4.3.64","date":"7 ott","items":["Tornano gli zombie dell'inizio, quelli a cubi: Zombie, Corridore, Gigante, Esplosivo e BOSS","I corpi lisci della versione precedente non sono più in partita","Il passo, il sangue e i pezzi sul colpo restano"]},{"ver":"4.3.63","date":"7 ott","items":["Gli zombie si muovono con un passo più naturale","Dove li colpisci esce sangue e si staccano pezzi","I modelli sono molto più dettagliati"]},{"ver":"4.3.62","date":"7 ott","items":["Tornano gli zombie di prima: Zombie, Corridore, Gigante, Esplosivo e BOSS","I cinque modelli nuovi non sono più in partita","La città nuova resta l'unica mappa"]},{"ver":"4.3.61","date":"7 ott","items":["Si gioca con cinque zombie nuovi: Errante, Predatore, Bruto, Infetto e Abominio","Camminano, attaccano e cadono con un corpo articolato; un colpo a una gamba li mette a terra","Le parti staccate cadono e si fermano; la città nuova resta l'unica mappa"]},{"ver":"4.3.60","date":"7 ott","items":["Si gioca solo sulla città nuova: 35 edifici accessibili e quartieri collegati","La mappa precedente non si apre più, né dal menu né dall'indirizzo","Il salvataggio della città nuova resta al suo posto"]},{"ver":"4.3.59","date":"7 ott","items":["Nuova città 3D disponibile dal tasto Città nuova: 35 edifici accessibili e quartieri collegati; prima versione giocabile con salvataggi separati","Fari accesi, fumo animato, auto distrutte e ribaltate, asfalto rovinato, sangue, scheletri e ossa","Incroci senza superfici stradali sovrapposte; passaggi e interni verificati; la partita attuale resta accessibile"]},{"ver":"4.3.58","date":"6 ott","items":["Mappa rinnovata con quartieri residenziali e industriali, nuovi palazzi e officine, strade collegate a base, stazione e ospedale","Facciate rovinate, asfalto crepato, marciapiedi e segnaletica; cespugli, pozzanghere, sangue, scheletri e cadaveri ambientali","Passaggi verificati e nuove costruzioni compatibili con le strutture già salvate; risorse e casse conservano la loro posizione"]},{"ver":"4.3.57","date":"6 ott","items":["Zaino ridisegnato: schede Risorse e munizioni ed Equipaggiamento a tutta larghezza, senza pannelli schiacciati","Oggetti più grandi con nome, rarità e livello; dettagli, confronto e azioni visibili selezionando un oggetto","Scorrimento completo su telefono, layout adattato a verticale e orizzontale; chiusura sempre accessibile"]},{"ver":"4.3.56","date":"6 ott","items":["Arena: 1 contro 1 con 2 giocatori, 3 contro 3 con 6 giocatori, partenza automatica quando il gruppo è completo","Più partite contemporanee e code separate per modalità","Tasto Indietro sempre visibile in Arena; puoi cambiare modalità mentre aspetti o tornare al menu anche durante la partita"]},{"ver":"4.3.55","date":"6 ott","items":["Arena uno contro uno, oltre al tre contro tre","Le armi si scorrono con il dito prima della partita","Si vede quanti giocatori sono online"]},{"ver":"4.3.54","date":"6 ott","items":["Arena 3 contro 3: scegli l'arma e aspetti le due squadre","Mappa nuova, tre minuti, vince chi fa più uccisioni","Potenziamenti, munizioni e medikit spuntano in mappa, in tempo reale"]},{"ver":"4.3.53","date":"6 ott","items":["Lo zaino si legge tutto e Equipaggia resta visibile","I pantaloni e il resto si indossano, lo scorrimento funziona","Le casse svuotano il contenuto dritto nella borsa","Pozzanghere, stop, strisce di sangue e scheletri più chiari"]},{"ver":"4.3.52","date":"6 ott","items":["Il mondo si disegna in Full HD, 1920 per 1080","Quando trovi un oggetto lo selezioni: Cambia oppure Scarta","Casse, equipaggiamento e zaino pieno non si riempiono più da soli"]},{"ver":"4.3.51","date":"6 ott","items":["L'interfaccia segue lo schermo, dal telefono lungo al tablet","La barra della vita e il pulsante di sparo restano interi","Mira, fuoco e granata non si coprono tra loro"]},{"ver":"4.3.50","date":"6 ott","items":["Lo zaino si scorre: materiali, munizioni e attrezzi si leggono tutti","Ogni arma mostra il caricatore e la riserva, senza tagliare il nome","I materiali a zero restano in elenco, più discreti"]},{"ver":"4.3.49","date":"6 ott","items":["Sangue, scie e fendenti si vedono meglio nei combattimenti","Cespugli e piantine riempiono la città, con criterio","Pozzanghere di fango, scure e bagnate, lungo le strade"]},{"ver":"4.3.48","date":"6 ott","items":["L'ascia taglia in avanti, verso gli alberi","Lo zombie colpito a una gamba cade e si trascina"]},{"ver":"4.3.47","date":"6 ott","items":["Lo schermo di Telegram mostra il gioco e la home per intero","L'arma in mano si vede anche in orizzontale","Gli zombie subiscono i colpi delle armi"]},{"ver":"4.3.46","date":"6 ott","items":["Su Telegram c'è lo stesso gioco dell'app: città, mappa e zombie","Il negozio si paga con le stelle, non con i soldi","Zaino, menu e le altre schermate restano sopra il tasto Chiudi"]},{"ver":"4.3.45","date":"6 ott","items":["Sull'app la home è subito la città, senza il lampo della neve","Tornando al menu la schermata resta ferma, anche in basso","Su Telegram il negozio si paga con le stelle","Lo zaino lascia libero lo spazio dei tasti di Telegram"]},{"ver":"4.3.44","date":"6 ott","items":["Le armi all'inizio fanno meno: la potenza vera arriva potenziandole con le monete","Ogni arma ha il suo mirino, e in mira il colpo è più fermo","Rinculo e dispersione più veri: la pompa cala con la distanza","Elmo, giacca, guanti e gli altri pezzi contano sulla forza, con un tetto"]},{"ver":"4.3.43","date":"6 ott","items":["Gli zombie camminano e cadono in modo naturale","In testa scoppia la testa ed esce il cervello, braccia e gambe si staccano e loro zoppicano, al busto escono gli organi e il sangue","La porta della casa è ridisegnata","Home, caricamento, armi, costruzioni e mappa sono quelli di prima"]},{"ver":"4.3.41","date":"6 ott","items":["🏙️ Il campo è un quartiere, con strade e marciapiedi","🏚️ Palazzi distrutti e macerie al posto delle cripte","🚫 Gli oggetti non si sovrappongono"]},{"ver":"4.3.40","date":"6 ott","items":["🪓 L'ascia punta il filo verso l'albero","🧟 Gli zombie ti vengono incontro, senza il giro laterale","🎒 I pezzi nuovi stanno a sinistra e la schermata non si stringe","🪦 Cadaveri, sangue, alberi e palazzi distrutti da modelli gratuiti","🪵 Gli alberi ricrescono con calma e le munizioni trovate non riempiono tutto","🪵 Un recinto non si attraversa"]},{"ver":"4.3.39","date":"6 ott","items":["🏙️ Sull'app la home è una città infestata","🎒 Lo zaino entra tutto nello schermo, senza nomi tagliati","🧟 Più zombie di giorno, cadono in modo naturale, e la mappa ha bidoni, cadaveri e sangue"]},{"ver":"4.3.38","date":"6 ott","items":["🌫️ Sull'app la città è asciutta, con una foschia leggera al posto della neve"]},{"ver":"4.3.37","date":"6 ott","items":["📱 L'app Android si apre e resta sul menu"]},{"ver":"4.3.36","date":"6 ott","items":["📱 L'app Android usa tutto lo schermo","✨ Sull'app l'immagine è più nitida e i movimenti più fluidi","🎒 Lo zaino dell'app ha un tasto Chiudi grande","💶 Nel negozio dell'app i prezzi sono in euro"]},{"ver":"4.3.35","date":"6 ott","items":["📱 Il gioco è anche un'app Android: si muove più fluido sul telefono","🎵 La musica non sgrana più e non fa vibrare l'altoparlante"]},{"ver":"4.3.34","date":"6 ott","items":["🏙️ La città è stata ridisegnata: case, palazzi e ruderi diversi, non più tutti uguali","⛰️ Le montagne sono creste di roccia e neve, con una texture più ricca","🏚️ Modelli 3D di palazzi, sangue, ossa e macerie lungo le strade","🧟 Gli zombie sono più consumati: pelle spenta, ferite e ossa in vista","🪦 In costruzione ci sono tomba, gomme e macerie"]},{"ver":"4.3.32","date":"5 ott","items":["💾 Salva e la mappa resta così, anche se chiudi il gioco. Originale riporta i palazzi di partenza"]},{"ver":"4.3.31","date":"5 ott","items":["🏚️ Nei palazzi con la cassa si entra: il blocco in mezzo alla porta non c’è più, e la tettoia sta sopra la testa","❄️ La neve a terra, le montagne e gli alberi hanno una texture più vera, con neve anche sui rami","🩸 Per le strade ci sono sangue, ossa e corpi, senza chiudere il passaggio","💡 La lampada in casa illumina senza accecare la stanza","🎵 All’avvio la musica riparte da sola se un tema resta a metà"]},{"ver":"4.3.30","date":"5 ott","items":["🏠 Tetto e pavimento sono una superficie continua: il muro ha la sua texture, il pavimento la sua, il tetto la sua","🪟 La finestra fissa e quella apribile hanno un'apertura pulita. La tenda si mette su entrambe","💡 La lampada di casa è appesa e illumina la stanza","🏙️ In città auto, casse e panchine non sono più incastrate nei muri"]},{"ver":"4.3.29","date":"5 ott","items":["🎒 Lo zaino mostra ogni nome per intero: materiali da una parte, equipaggiamento dall'altra","⚔️ Nel crafting, Potenzia armi: servono tante monete per il massimo. Forza, difesa, critico e velocità si comprano lì, in partita","❄️ La neve scende in modo più naturale. Gli zombie si aprono a ventaglio e si vedono meglio","🔫 Volpe, Rondine, Cervo, Canne mozze e Vespa hanno ognuna il proprio disegno","💡 In home c'è Suggerimenti: scrivi un consiglio, lo legge solo chi gestisce il gioco"]},{"ver":"4.3.28","date":"5 ott","items":["🏠 Costruire è più facile: il pezzo dopo si mette in fila da solo, e dove costruisci non rinasce né un albero né una roccia","💡 Quadri, tende, camino e luci: muro, tetto e pavimento hanno texture nuove e la luce scalda la stanza","🪙 Dal deposito, in partita, spendi le monete per ampliare la cassa e potenziare l'arma in mano"]},{"ver":"4.3.27","date":"5 ott","items":["⚡ Se un fotogramma non arriva, il gioco riparte da solo e non resta fermo per 5 secondi","🎵 Resta acceso un solo tema: la musica non si spezza quando il telefono si blocca un attimo","👟 Passi e tocchi non creano più migliaia di suoni, la partita resta più fluida"]},{"ver":"4.3.26","date":"5 ott","items":["🏆 In classifica c’è anche chi ha giocato dall’altro telefono","⚡ La classifica si rilegge dal server ogni pochi secondi","🎮 I punti passano dal tasto Gioca del menu, non dalla tastiera della chat"]},{"ver":"4.3.25","date":"5 ott","items":["🎵 La musica resta continua, senza scatti né rumori strani","🏆 Ogni partita da Telegram entra in classifica e il server resta aggiornato","💨 Meno voci e scoppiettii a ogni fotogramma, il gioco resta più fluido"]},{"ver":"4.3.24","date":"5 ott","items":["🏗️ Recinto, assi, botte, torcia, cartello, bandiera, sedia, stufa, cassa e vaso","🔫 Negozio più ricco: Volpe, Rondine, Canne mozze, Cervo e Vespa, con kit e munizioni","📦 Il deposito si amplia pagando con le monete","❄️ Sotto un tetto non nevica, e la neve pesa meno sul gioco"]},{"ver":"4.3.23","date":"5 ott","items":["🧱 Mattoni, legno, tegole e intonaco arrivano da foto vere, gratis","🚗 Le auto parcheggiate e i lampioni sono modelli, con ruote e il braccio del faro","🏗️ In costruzione: pilastro, cancello, sacchi di sabbia, lampione, panchina e bidone"]},{"ver":"4.3.22","date":"5 ott","items":["🧱 Mattoni, legno, tegole e intonaco al posto delle superfici piatte","🛣️ L'asfalto, la pietra dei marciapiedi e il metallo arrugginito si leggono da vicino","🏠 I tetti restano a spiovente e le auto restano auto, con la vernice graffiata"]},{"ver":"4.3.21","date":"5 ott","items":["🏠 I tetti delle case e dei depositi sono a spiovente, con il colmo in alto","🚗 Le auto parcheggiate hanno carrozzeria, vetri e ruote, e stanno a bordo strada","🚑 Il bus e l'ambulanza hanno le ruote. L'ambulanza ha la croce"]},{"ver":"4.3.20","date":"5 ott","items":["🏥 Ospedale, mercato, scuola, stazione e case si distinguono: tetti, tende e insegne diversi","🛒 Il mercato ha banchi, tende colorate e vetrine. La città ha fari, cespugli, sangue e un po' di fumo","🌲 Non resti più incastrato nella chioma degli alberi: si passa accanto al tronco","🧟 Gli zombie non attaccano la base, a meno che non ti abbiano visto entrare","🏆 Il tasto Classifica non c'è più: la classifica a destra resta ferma"]},{"ver":"4.3.19","date":"5 ott","items":["🏙️ Città abbandonata: case, scuola, mercato, ospedale, deposito e stazione, collegati da strade","🗺️ Minimappa con i nomi dei quartieri, orientata a nord","🏆 Ogni zombie ucciso entra subito nel totale. Il server riceve il numero esatto e, se non risponde, viene reinviato","⚡ I palazzi nuovi non aggiungono luci: la partita resta fluida"]},{"ver":"4.3.18","date":"5 ott","items":["⚡ Con FPS su Max il gioco non torna più a 45 fotogrammi: resta al ritmo dello schermo","🏆 In home conti solo gli zombie uccisi. La classifica arriva dal server e si aggiorna da sola","🗺️ La mappa è più grande: oltre la recinzione c’è il bosco, case e strade restano al loro posto","🧟 Gli zombie non vanno più avanti e indietro sullo stesso ostacolo"]},{"ver":"4.3.17","date":"5 ott","items":["🏠 Livello e record stanno tutti in home, sopra la barra in basso","🏆 La classifica si aggiorna da sola. In Sempre i giocatori restano anche dopo il lunedì","🎵 Il vento non copre più la musica: in home è spento","🌲 Cespugli raggruppati e qualche zombie in più di giorno, vicino al paese"]},{"ver":"4.3.16","date":"5 ott","items":["⚡ Con FPS su Max, se lo schermo a 90 Hz perde fotogrammi la risoluzione scende e la partita resta più fluida"]},{"ver":"4.3.15","date":"5 ott","items":["🏠 La home è fissa: non scorre. Indietro dalla classifica torna alla home e non apre il negozio","☠️ Ogni partita parte da 0 zombie uccisi. Quelli nuovi si sommano alla classifica, senza ripartire dai vecchi"]},{"ver":"4.3.14","date":"5 ott","items":["🏠 Home ordinata: titolo, Gioca, Negozio e i quattro tasti stanno in colonna, non più in mezzo allo schermo","🎵 Musica senza gracchio: una sola traccia alla volta, e riparte se si ferma","🏆 La classifica si aggiorna quando chiudi la partita, anche se non aspetti la fine"]},{"ver":"4.3.13","date":"5 ott","items":["⚡ I primi secondi di partita non restano più a metà fotogrammi: gli shader finiscono dietro il caricamento","🔄 Si apre sempre l’ultima versione: l’indirizzo cambia a ogni aggiornamento, la copia vecchia non resta aperta","⚡ Il limite a 45 fps non si attacca mentre il telefono sta ancora scaldando gli shader"]},{"ver":"4.3.12","date":"5 ott","items":["⚡ Su telefoni a 90 Hz, con FPS su Max, il gioco non resta più bloccato a 45 fps quando la CPU è già libera","🏷️ Versione visibile nella home"]},{"ver":"4.3.11","date":"5 ott","items":["🏷️ La versione del gioco è visibile nella home, sotto il titolo","📋 Lista problemi completa e scorrevole, con la causa e dove intervenire"]},{"ver":"4.3.10","date":"4 ott","items":["🖼️ Immagine sempre nitida: la risoluzione non cala più a 45 fps","🧟 Zombie che camminano senza tremolii avanti e indietro","🕹️ Joystick più stabile: niente scatti di direzione","🎵 La musica riparte da sola se si interrompe","🛡️ Il gioco non si blocca più per un errore: lo salta e continua"]},{"ver":"4.3.9","date":"4 ott","items":["🏆 Classifica settimanale online: vedi i punteggi di tutti i giocatori, il punteggio si salva da solo","⚡ Movimento più fluido sui telefoni a 90 e 120 Hz","⏳ Caricamento della partita senza blocchi","📱 Menu che si adatta allo schermo del telefono e del tablet"]},{"ver":"4.3.8","date":"4 ott","items":["📱 Rotazione dello schermo sbloccata: il gioco segue il telefono su tutti i dispositivi"]},{"ver":"4.3.7","date":"4 ott","items":["🧟 Zombie più intelligenti: ti attaccano nel rifugio solo se ti hanno visto entrare","🌙 All'inizio della notte l'orda vaga e ti cerca, non assalta subito il rifugio","🧱 Nessun danno attraverso muri, porte e finestre chiuse"]},{"ver":"4.3.6","date":"4 ott","items":["⚡ Su telefoni a 90 Hz il gioco resta stabile a 60 fps quando serve, senza scatti","📜 Le liste non tornano più in cima da sole dopo lo scorrimento","📱 In verticale compare subito la schermata «Ruota il telefono»","💎 Avviso chiaro quando non hai abbastanza gemme","🛒 Apertura delle schede del negozio più veloce"]},{"ver":"4.3.5","date":"4 ott","items":["⚡ Più fluido: controlli interni più leggeri e risoluzione che non scende quando non serve","🏠 Anteprima di costruzione più leggera"]}]};
let NEWS421=NEWS421_FB;const NEWS421_K='zc_news_seen';
function news421Esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function news421Dot(){const b=document.getElementById('newsBtn');if(!b)return;let seen='';try{seen=localStorage.getItem(NEWS421_K)||'';}catch(e){}b.classList.toggle('new',!!NEWS421.rev&&seen!==NEWS421.rev);}
function news421Load(){try{const base=/^https?:/.test(location.protocol)?'':'https://gasparelb97-create.github.io/zombie-survival/';const ac=new AbortController();setTimeout(()=>ac.abort(),5000);
  fetch(base+'updates.json?nc='+Date.now(),{cache:'no-store',signal:ac.signal}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.upcoming)&&Array.isArray(j.recent)){NEWS421=j;news421Dot();const d=document.getElementById('dlgScreen');if(d&&d.classList.contains('news42')&&!d.classList.contains('hidden'))news421Open(true);}}).catch(()=>{});}catch(e){}}
function news421Html(){const N=NEWS421,up=(N.upcoming||[]).map(u=>'<div class="nCard '+news421Esc(u.tone||'soon')+'"><div class="nIco">'+news421Esc(u.icon||'✨')+'</div><div class="nTxt"><div class="nTop"><b>'+news421Esc(u.title)+'</b><span class="nEta">'+news421Esc(u.eta||'In lavorazione')+'</span></div><p>'+news421Esc(u.desc)+'</p></div></div>').join('');
  const rc=(N.recent||[]).map(r=>'<div class="nRel"><div class="nVer"><b>v'+news421Esc(r.ver)+'</b>'+(r.date?'<small>'+news421Esc(r.date)+'</small>':'')+'</div><ul>'+(r.items||[]).map(i=>'<li>'+news421Esc(i)+'</li>').join('')+'</ul></div>').join('');
  return '<div class="news42"><h4>🚧 In arrivo</h4><div class="nGrid">'+up+'</div><h4>✅ Ultime novità</h4>'+rc+'</div>';}
function news421Open(refresh){const d=document.getElementById('dlgScreen');dialog('📰 Novità',news421Html(),[{label:'Chiudi'}]);d.classList.add('news42');
  try{localStorage.setItem(NEWS421_K,NEWS421.rev||'');}catch(e){}news421Dot();if(!refresh)news421Load();}
{const d=document.getElementById('dlgScreen');if(d)new MutationObserver(()=>{if(d.classList.contains('hidden')&&d.classList.contains('news42'))d.classList.remove('news42');}).observe(d,{attributes:true,attributeFilter:['class']});
 const s=document.getElementById('startScreen');if(s&&!document.getElementById('newsBtn')){const b=document.createElement('button');b.id='newsBtn';b.innerHTML='📰 <span>Novità</span><i class="nDot"></i>';s.appendChild(b);onTap('newsBtn',()=>news421Open());}
 news421Dot();news421Load();}
window.__news421={open:()=>news421Open(),get data(){return NEWS421;}};
// ======================= 4.2.2 hotfix =======================
window.GAME_VER='4.2.2';
// ---- (S) touch scrolling inside panels (news, shop, bag, leaderboard, quests, settings). Native scrolling first; if the
//      WebView swallows it (Telegram Android: pointercancel but the list never moves) we scroll the list ourselves + momentum.
const SCR422={fb:0,nat:0,last:'',force:0};
(function(){let st=null,mom=0;
  // 4.2.4: every drag logs the list position before/after; if the native scroll did not move the list (WebView took the
  //        touch: touchcancel / no movement) the fallback scrolls it, and later drags go manual from the first move (force).
  const SEL='.overlay,#qList,#quest42,#buildBar,#shopScreen,#dlgScreen';
  const canY=e=>{const cs=getComputedStyle(e);return /(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+2;};
  const canX=e=>{const cs=getComputedStyle(e);return /(auto|scroll)/.test(cs.overflowX)&&e.scrollWidth>e.clientWidth+2;};
  function scroller(el,ax,d){for(let e=el;e&&e!==document.body&&e!==document.documentElement;e=e.parentElement){
      if(ax==='y'?canY(e):canX(e)){const pos=ax==='y'?e.scrollTop:e.scrollLeft,max=ax==='y'?e.scrollHeight-e.clientHeight:e.scrollWidth-e.clientWidth;
        if((d<0&&pos<max-1)||(d>0&&pos>1))return e;}}return null;}
  function anyScroller(el,ax){for(let e=el;e&&e!==document.body&&e!==document.documentElement;e=e.parentElement)if(ax==='y'?canY(e):canX(e))return e;return null;}
  const getP=(el,ax)=>ax==='y'?el.scrollTop:el.scrollLeft;
  const setP=(el,ax,v)=>{if(ax==='y')el.scrollTop=v;else el.scrollLeft=v;};
  const nm=el=>el?(el.id?'#'+el.id:(el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):''))):'-';
  function stopMom(){if(mom){cancelAnimationFrame(mom);mom=0;}}
  function momentum(S,now){let sum=0;for(const [ts,s] of S.v)if(now-ts<120)sum+=s;const first=S.v.find(([ts])=>now-ts<120);const dt=first?Math.max(16,now-first[0]):0;
    let vel=dt?sum/dt:0;if(Math.abs(vel)<.15)return;let lt=performance.now();
    const go=()=>{const tt=performance.now(),k=tt-lt;lt=tt;const before=getP(S.el,S.ax);setP(S.el,S.ax,before-vel*k);vel*=Math.pow(.94,k/16);
      if(Math.abs(vel)>.03&&getP(S.el,S.ax)!==before)mom=requestAnimationFrame(go);else mom=0;};mom=requestAnimationFrame(go);}
  addEventListener('touchstart',e=>{stopMom();if(e.touches.length!==1){st=null;return;}const t=e.touches[0],tg=e.target;
    if(!tg||!tg.closest||!tg.closest(SEL)){st=null;return;}
    st={x:t.clientX,y:t.clientY,lx:t.clientX,ly:t.clientY,tg,el:null,ax:null,s0:0,b0:0,d0:0,t0:e.timeStamp,man:false,exp:0,v:[],n:0,force:SCR422.force,why:''};},{capture:true,passive:true});
  addEventListener('touchmove',e=>{if(!st)return;const t=e.touches[0];if(!t)return;st.n++;const dx=t.clientX-st.x,dy=t.clientY-st.y;
    if(!st.ax){if(Math.hypot(dx,dy)<6)return;st.ax=Math.abs(dy)>=Math.abs(dx)?'y':'x';const d=st.ax==='y'?dy:dx;st.el=scroller(st.tg,st.ax,d);
      if(!st.el){st.why=anyScroller(st.tg,st.ax)?'edge':'noscroller';st.el0=anyScroller(st.tg,st.ax);return;}
      st.s0=st.b0=getP(st.el,st.ax);st.d0=d;st.lx=t.clientX;st.ly=t.clientY;
      if(st.force&&e.cancelable){e.preventDefault();st.man=true;st.exp=st.s0;st.mode='force';}return;}
    if(!st.el)return;
    const el=st.el,ax=st.ax,d=ax==='y'?dy:dx,step=ax==='y'?t.clientY-st.ly:t.clientX-st.lx;st.lx=t.clientX;st.ly=t.clientY;
    st.v.push([e.timeStamp,step]);if(st.v.length>6)st.v.shift();
    if(!st.man){const travel=Math.abs(d-st.d0),moved=Math.abs(getP(el,ax)-st.s0);
      if(moved>=1){if(!st.nat){st.nat=1;SCR422.nat++;}return;}
      if(travel>18&&e.timeStamp-st.t0>50){st.man=true;st.mode='fallback';SCR422.fb++;SCR422.force=1;const v0=getP(el,ax);setP(el,ax,v0-(d-st.d0));st.exp=getP(el,ax);
        SCR422.last=nm(el);try{slog('scroll fallback',SCR422.last,'ax='+ax,'cancelable='+(e.cancelable?1:0),'n='+st.n,ax+'='+Math.round(v0)+'->'+Math.round(st.exp));}catch(x){}}
      return;}
    // manual mode: if the browser scrolled too, hand back to it (no double scroll)
    const cur=getP(el,ax);if(Math.abs(cur-st.exp)>2){st.man=false;st.nat=1;st.s0=cur;st.d0=d;return;}
    if(e.cancelable)e.preventDefault();setP(el,ax,cur-step);st.exp=getP(el,ax);},{capture:true,passive:false});
  const report=(S,el,ax,dd,ev)=>{const a=el?Math.round(getP(el,ax)):0,b=Math.round(S.el?S.b0:a);const mode=S.mode||(S.nat?'native':S.why||(S.el?'none':'-'));
    try{slog('scroll drag',nm(S.tg),'list='+nm(el),'ax='+ax,'d='+Math.round(dd),ax==='y'?'scrollTop':'scrollLeft',b+'->'+a,'mode='+mode,'n='+S.n,'on='+ev);}catch(x){}
    if(el)setTimeout(()=>{try{const f=Math.round(getP(el,ax));if(f!==a)slog('scroll settled',nm(el),a+'->'+f);}catch(x){}},700);};
  const end=e=>{if(!st)return;const S=st;st=null;const ev=e.type==='touchcancel'?'cancel':'end';
    if(!S.ax)return;// a tap, not a drag
    const el=S.el||S.el0,ax=S.ax,dd=ax==='y'?S.ly-S.y:S.lx-S.x;
    if(S.el&&!S.man&&!S.nat&&Math.abs(dd-S.d0)>=10){
      // the list never moved during the drag: give native scrolling 120 ms to show up, else apply the drag ourselves
      // (WebView took the touch -> touchcancel / no more touchmoves); later drags then go manual from the first move
      const now=e.timeStamp;setTimeout(()=>{if(Math.abs(getP(S.el,ax)-S.s0)<1){const v0=getP(S.el,ax);setP(S.el,ax,v0-(dd-S.d0));S.man=true;S.mode='fallback-'+ev;SCR422.fb++;SCR422.force=1;SCR422.last=nm(S.el);
          try{slog('scroll fallback',SCR422.last,'ax='+ax,'on='+ev,'n='+S.n,ax+'='+Math.round(v0)+'->'+Math.round(getP(S.el,ax)));}catch(x){}momentum(S,now);}else{S.nat=1;SCR422.nat++;}
        report(S,el,ax,dd,ev);},120);return;}
    report(S,el,ax,dd,ev);if(S.man&&S.el)momentum(S,e.timeStamp);};
  addEventListener('touchend',end,{capture:true,passive:true});addEventListener('touchcancel',end,{capture:true,passive:true});
})();
window.__scr422=SCR422;
// ---- (U) 4.2.3 in-game top group: level + coins + 📋 chip in Telegram's top band, between 'Chiudi' and the 🐞
//      (or centred under the band when there is no band). ONE placement function, writes styles only when the result changes.
// ---- (R) 4.2.4: 🎒 + day/clock card as a compact strip in Telegram's top band, between the 🐞 and the ⌄⋮ pill.
//      Called only from top423() (the single HUD-top placement path); writes styles only when the result changes. No band -> CSS layout of 4.2.3.
const R424={k:''};
const PILL_W424=98;// Telegram ⌄⋮ pill incl. its 8 px margin, from the right safe edge (measured: starts at 920/1024)
function place424(){const b=document.body,tr=document.getElementById('topRight'),bag=document.getElementById('bagBtn');if(!tr||!bag)return;
  const ct=safe42Px('--tg-content-safe-area-inset-top'),sa=safe42Px('--tg-safe-area-inset-top'),sar=safe42Px('--sar'),W=innerWidth;
  let band=ct>=40&&W>innerHeight&&!b.classList.contains('hudOff42');let k='off',sc=1,trR=0,top=0,bagR=0,bagT=0;
  if(band){if(!b.classList.contains('hudBandR424'))b.classList.add('hudBandR424');
    const d=document.getElementById('zdbgB');let L=W/2+13;if(d&&d.offsetWidth&&d.classList.contains('dbgBand'))L=d.getBoundingClientRect().right;L+=8;
    const R=W-sar-PILL_W424-8,wT=tr.offsetWidth||218,hT=tr.offsetHeight||34,BW=bag.offsetWidth||42,gap=6;
    const avail=R-L-BW-gap;if(wT>avail)sc=Math.max(.62,Math.floor(avail/wT*100)/100);
    if(L+BW+gap+wT*sc>R+.5){band=false;}
    else{const cy=sa+ct/2;trR=Math.round(W-R);top=Math.round(cy-hT/2);bagR=Math.round(W-(R-wT*sc-gap));bagT=Math.round(cy-BW/2);k=[sc,trR,top,bagR,bagT].join(',');}}
  if(!band&&b.classList.contains('hudBandR424'))b.classList.remove('hudBandR424');
  if(k===R424.k)return;R424.k=k;
  if(k==='off'){for(const p of ['right','top','transform','transform-origin'])tr.style.removeProperty(p);for(const p of ['right','top'])bag.style.removeProperty(p);return;}
  tr.style.setProperty('right',trR+'px','important');tr.style.setProperty('top',top+'px','important');tr.style.setProperty('transform',sc<1?'scale('+sc+')':'none','important');tr.style.setProperty('transform-origin','100% 50%','important');
  bag.style.setProperty('right',bagR+'px','important');bag.style.setProperty('top',bagT+'px','important');}
// ---- (P) 4.2.4 long-task attribution: every long task / long frame is logged with the stage that was running
//      (performance.mark around shop / dialog / weapon preview / game start, + first use of new GPU programs / meshes)
function plog424(){try{window.__DBG&&window.__DBG.log&&window.__DBG.log('perf',Array.from(arguments).join(' '));}catch(e){}}
const PERF424={marks:[],lt:[],lf:[],prog:0,geo:0,tex:0,n:0,max:0,long100:0};
function stage424(){try{const o=[];for(const e of document.querySelectorAll('.overlay:not(.hidden)'))o.push((e.id||'ov').replace('Screen',''));
  return (typeof game!=='undefined'&&game&&game.state?game.state:'?')+(o.length?'/'+o.join('+'):'');}catch(e){return '?';}}
function mark424(n){const t=performance.now();try{performance.mark('z424:'+n);}catch(e){}PERF424.marks.push([t,n]);if(PERF424.marks.length>60)PERF424.marks.shift();}
function marksIn424(a,b){const r=[];for(const [t,n] of PERF424.marks)if(t>=a-2&&t<=b+2)r.push(n);return r;}
function wrap424(name,get,set){try{const f=get();if(typeof f!=='function'||f.__w424)return;const w=function(){const t0=performance.now();mark424(name+'>');
    try{return f.apply(this,arguments);}finally{const d=performance.now()-t0;mark424(name+'<'+Math.round(d));try{performance.measure('z424:'+name,{start:t0,duration:d});}catch(e){}if(d>50)plog424('stage',name,Math.round(d)+'ms',stage424());}};
  w.__w424=1;set(w);}catch(e){}}
// wrapped after all scripts ran, so later overrides (4.3 modules) are included
setTimeout(()=>{
wrap424('openShop',()=>openShop,f=>{openShop=f;});
wrap424('renderShop',()=>renderShop,f=>{renderShop=f;});
wrap424('dialog',()=>dialog,f=>{dialog=f;});
wrap424('provaW',()=>provaW,f=>{provaW=f;});
wrap424('startGame',()=>startGame,f=>{startGame=f;});
wrap424('showMenu',()=>showMenu,f=>{showMenu=f;});
},0);
try{if(window.PerformanceObserver&&(PerformanceObserver.supportedEntryTypes||[]).includes('longtask'))
  new PerformanceObserver(l=>{for(const e of l.getEntries()){const d=Math.round(e.duration),a=e.startTime;PERF424.n++;if(d>=100)PERF424.long100++;if(d>PERF424.max)PERF424.max=d;
    const at=(e.attribution&&e.attribution[0])?(e.attribution[0].containerType||'')+(e.attribution[0].containerName?':'+e.attribution[0].containerName:''):'';
    const rec=[Math.round(a),d,marksIn424(a,a+e.duration).join(',')||'-',stage424()];PERF424.lt.push(rec);if(PERF424.lt.length>40)PERF424.lt.shift();
    plog424('longtask',d+'ms','stages='+rec[2],'at='+rec[3],at?'attr='+at:'');}}).observe({type:'longtask',buffered:true});}catch(e){}
// per frame: new programs / geometries / textures = something rendered for the first time; long frames >200 ms
(function(){let lt=performance.now();const fr=()=>{const t=performance.now(),dt=t-lt;
  try{const I=renderer.info,p=(I.programs||[]).length,g=I.memory.geometries,x=I.memory.textures;
    if(PERF424.n0){if(p>PERF424.prog){mark424('newProg+'+(p-PERF424.prog));plog424('newProg +'+(p-PERF424.prog),'tot='+p,stage424());}
      if(g>PERF424.geo+3){mark424('newGeo+'+(g-PERF424.geo));}if(x>PERF424.tex){mark424('newTex+'+(x-PERF424.tex));}}
    PERF424.n0=1;PERF424.prog=p;PERF424.geo=g;PERF424.tex=x;}catch(e){}
  if(dt>200){const m=marksIn424(lt,t);PERF424.lf.push([Math.round(lt),Math.round(dt),m.join(',')||'-',stage424()]);if(PERF424.lf.length>40)PERF424.lf.shift();
    plog424('long frame',Math.round(dt)+'ms','stages='+(m.join(',')||'-'),'at='+stage424());}
  lt=t;requestAnimationFrame(fr);};requestAnimationFrame(fr);})();
PERF424.dbg={get renderer(){return renderer;},get scene(){return scene;},get camera(){return camera;}};window.__perf424=PERF424;
// ---- (W) 4.2.4 GPU upload warm-up: the menu never draws the world, so the first play frame uploaded ~150 geometries + 13 textures
//      and compiled the shadow (depth) programs in one go (one 0.5-1 s task on phones). Here the same work is done while the menu
//      is idle, a few meshes per slice, into a 1x1 target; nothing visible changes (layer 31 camera, flags restored in finally).
const UP424={done:0,i:0,list:null,ms:0,max:0,sl:0};
function up424List(){const L=[],seen=new Set();const add=(root,cam,sc,force)=>{root.traverse(o=>{if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!o.geometry)return;const k=o.geometry.uuid;if(seen.has(k))return;seen.add(k);L.push([o,cam,sc,force]);});};
  for(const o of scene.children)add(o,camera,scene,null);
  try{for(const z of zombies)if(z&&z.g)add(z.g,camera,scene,z.g);}catch(e){}// pooled zombies are hidden in the menu: shown for their warm render only
  try{for(const key of Object.keys(VM))add(VM[key],vmCam,vmScene,VM[key]);}catch(e){}return L;}
function up424Step(){if(UP424.done)return;if(typeof game!=='undefined'&&game.state==='play'&&!(window.__ld431&&__ld431.hold)){UP424.done=2;plog424('upload warm stopped (play)',UP424.i);return;}
  if(!UP424.list){UP424.list=up424List();UP424.rt=new T.WebGLRenderTarget(1,1);UP424.rt.texture.colorSpace=renderer.outputColorSpace;UP424.rt.isXRRenderTarget=true;/* same program variants as the canvas (sRGB out + tone mapping) */UP424.cam=new T.PerspectiveCamera();UP424.cam.layers.set(31);UP424.vcam=new T.PerspectiveCamera();UP424.vcam.layers.set(31);}
  const L=UP424.list,t0=performance.now();const prevRT=renderer.getRenderTarget(),au=renderer.shadowMap.autoUpdate;
  const sv=[];const on=o=>{sv.push([o,o.layers.mask,o.frustumCulled,o.visible]);o.layers.enable(31);o.frustumCulled=false;};
  try{const p0=renderer.info.programs.length;
    // one mesh per render, stop the slice after ~6 ms or as soon as a new program was compiled (keeps each idle task short)
    while(UP424.i<L.length){const [o,cam,sc,force]=L[UP424.i++];let vis=true;for(let p=o;p&&p!==sc;p=p.parent)if(!p.visible&&p!==force){vis=false;break;}if(!vis)continue;
      (UP424.got||(UP424.got=new Set())).add(o.geometry.uuid);const m0=sv.length;on(o);if(force&&!force.visible){sv.push([force,force.layers.mask,force.frustumCulled,force.visible]);force.visible=true;}
      const wc=sc===scene?UP424.cam:UP424.vcam;wc.position.copy(cam.position);wc.quaternion.copy(cam.quaternion);wc.updateMatrixWorld();
      if(!UP424.lit)UP424.lit=new Map();let lit=UP424.lit.get(sc);if(!lit){lit=[];sc.traverse(x=>{if(x.isLight)lit.push(x);});UP424.lit.set(sc,lit);}for(const x of lit)on(x);
      renderer.setRenderTarget(UP424.rt);renderer.shadowMap.needsUpdate=true;renderer.render(sc,wc);
      for(let j=sv.length-1;j>=m0;j--){const [q,mk,fc,vi]=sv[j];q.layers.mask=mk;q.frustumCulled=fc;q.visible=vi;}sv.length=m0;
      if(renderer.info.programs.length>p0||performance.now()-t0>6||performance.now()>(UP424.dl||1e15))break;}
    /* 4.3.9: textures are initialised in time slices by up439Step() */
  }catch(e){UP424.err=String(e);UP424.done=3;}
  finally{for(let j=sv.length-1;j>=0;j--){const [o,mk,fc,vi]=sv[j];o.layers.mask=mk;o.frustumCulled=fc;o.visible=vi;}renderer.setRenderTarget(prevRT);renderer.shadowMap.needsUpdate=true;/* the next real frame redraws the shadow map */renderer.shadowMap.autoUpdate=au;}
  const d=performance.now()-t0;UP424.ms+=d;UP424.sl++;UP424.max=Math.max(UP424.max,d);
  if(!UP424.done&&UP424.i<L.length){if(!(window.__ld431&&__ld431.hold))_idle42(up424Step,1500);return;}
  if(!UP424.done)UP424.done=1;try{UP424.rt.dispose();}catch(e){}plog424('upload warm',UP424.done===1?'done':'end '+UP424.done,UP424.i+'/'+L.length,'meshes',Math.round(UP424.ms)+'ms in',UP424.sl,'slices, max',Math.round(UP424.max)+'ms',UP424.err||'');}
/* 4.3.2: upload warm runs behind the match loader, never in the menu */
// decode the pre-rendered shop thumbnails once in idle time (first shop paint decoded ~20 WebP images synchronously)
const DEC424=[];function dec424(){try{const v=Object.values(typeof PRE_THUMBS423!=='undefined'?PRE_THUMBS423:(typeof PRE43!=='undefined'&&PRE43?(PRE43[typeof GFX43!=='undefined'&&GFX43.q==='bassa'?'lo':'hi']||{}):{})).filter(x=>typeof x==='string'&&x.startsWith('data:image'));let i=0;const nx=()=>{if(i>=v.length){plog424('thumbs decoded',v.length);return;}const im=new Image();im.src=v[i++];DEC424.push(im);
  (im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(()=>_idle42(nx,1000));};_idle42(nx,1000);}catch(e){}}
setTimeout(dec424,3000);
PERF424.up=UP424;
const T423={k:'',mode:''};
const CHIUDI_R423=130;// Telegram 'Chiudi' pill right edge (CSS px from the left safe edge), measured on the Oppo (165/1024*791 ≈ 128)
function top423(){const b=document.body,h=document.getElementById('hud42'),q=document.getElementById('quest42'),ch=document.getElementById('qChip');
  try{place424();}catch(e){}
  if(!h||!q||!ch||b.classList.contains('hudOff42'))return;
  const ct=safe42Px('--tg-content-safe-area-inset-top'),sa=safe42Px('--tg-safe-area-inset-top'),sal=safe42Px('--sal'),sat=safe42Px('--sat'),W=innerWidth;
  const band=ct>=34&&W>innerHeight;if(b.classList.contains('hudBand423')!==band)b.classList.toggle('hudBand423',band);
  const wH=h.offsetWidth,hH=h.offsetHeight||28,wC=ch.offsetWidth,chH=ch.offsetHeight||28,gap=6;if(!wH)return;
  let left,top,sc=1;
  if(band){const L=sal+CHIUDI_R423+8;let R=W/2-13;const d=document.getElementById('zdbgB');if(d&&d.offsetWidth&&d.classList.contains('dbgBand'))R=d.getBoundingClientRect().left;R-=8;
    const tot=wH+gap+wC,avail=R-L;if(tot>avail)sc=Math.max(.6,Math.floor(avail/tot*100)/100);
    left=Math.round(L);top=Math.round(sa+ct/2-hH*sc/2);}
  else{const tot=wH+gap+wC;left=Math.round((W-tot)/2);const pb=document.getElementById('pauseBtn'),bag=document.getElementById('bagBtn');
    let minL=pb&&pb.offsetWidth?pb.getBoundingClientRect().right+10:sal+60;const dbg=document.getElementById('zdbgB');if(dbg&&dbg.offsetWidth)minL=Math.max(minL,dbg.getBoundingClientRect().right+8);const maxR=bag&&bag.offsetWidth?bag.getBoundingClientRect().left-10:W-200;
    if(left+tot>maxR)left=Math.round(maxR-tot);if(left<minL)left=Math.round(minL);top=Math.round(sat+10);}
  const cl=left+Math.round((wH+gap)*sc),ctop=top+Math.round((hH-chH)/2*sc);
  const k=left+','+top+','+sc+','+cl+','+ctop;if(k===T423.k)return;T423.k=k;
  h.style.setProperty('left',left+'px','important');h.style.setProperty('top',top+'px','important');
  const tf=sc<1?'scale('+sc+')':'';h.style.transform=tf;h.style.transformOrigin='0 0';ch.style.transform=tf;ch.style.transformOrigin='0 0';
  q.style.left=cl+'px';q.style.top=ctop+'px';}
function q422Panel(){const q=document.getElementById('quest42'),L=document.getElementById('qList');if(!q||!L||!q.classList.contains('open')||!L.style.left)return;
  const jb=document.getElementById('joyBase').getBoundingClientRect(),bag=document.getElementById('bagBtn'),pb=document.getElementById('pauseBtn');const left=Math.round(((window.__joy421&&__joy421.r)||jb.right)+28);
  const hpE=document.getElementById('topLeft');const inBand=document.body.classList.contains('hudBandR424');const right=(!inBand&&bag&&bag.offsetWidth?bag.getBoundingClientRect().left:(hpE&&hpE.offsetWidth?hpE.getBoundingClientRect().left:innerWidth-200))-8;const top=Math.round(Math.max(safe42Px('--sat'),pb&&pb.offsetWidth?pb.getBoundingClientRect().bottom:0)+6);
  const w=Math.round(Math.max(220,Math.min(340,right-left)));const bot=parseFloat(L.style.maxHeight)||0;const t0=parseFloat(L.style.top)||top;const mh=Math.round(Math.max(90,bot+(t0-top)));
  if(L.style.left!==left+'px')L.style.left=left+'px';if(L.style.width!==w+'px')L.style.width=w+'px';if(L.style.top!==top+'px'){L.style.top=top+'px';L.style.maxHeight=mh+'px';}
  const tight=L.scrollHeight>L.clientHeight+1;if(L.classList.contains('qTight')!==tight)L.classList.toggle('qTight',tight);}
{const _qp=q421Place;q421Place=function(){const r=_qp.apply(this,arguments);try{q422Panel();}catch(e){}return r;};}
setInterval(()=>{try{q421Place();}catch(e){}},250);
// coin number: width reserved per character count (Rajdhani digits are not equal width) -> the chip only moves when the count of digits changes
{const _ch=coinHUD;coinHUD=function(){const r=_ch.apply(this,arguments);try{const e=document.getElementById('coin42');const sp=e&&e.lastChild;if(sp){const n=String(sp.textContent||'').length;if(e.__cn!==n){e.__cn=n;e.style.setProperty('--cn423',n);}}}catch(x){}return r;};try{coinHUD();}catch(e){}}
// re-place the top group in the same frame the HUD becomes visible (no 250 ms window at the old spot)
{let wasOff=true,busy=false;try{new MutationObserver(()=>{const off=document.body.classList.contains('hudOff42');if(busy||off===wasOff){wasOff=off;return;}wasOff=off;if(off)return;busy=true;try{q421Place();}catch(e){}finally{busy=false;}}).observe(document.body,{attributes:true,attributeFilter:['class']});}catch(e){}}


(window.__t43=window.__t43||[]).push(['v43_core',performance.now()]);
