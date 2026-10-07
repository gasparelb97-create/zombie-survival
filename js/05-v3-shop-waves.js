/* Zombie Survival — game code part 05-v3-shop-waves (game.html lines 2653-3266 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v3 module =======================
const cityStorageKey=k=>NEXT_CITY&&k!=='zc_surv_city2'?'zc_city2_'+k:k;
const LS={get(k,d){try{const v=localStorage.getItem(cityStorageKey(k));return v===null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){let s;try{s=JSON.stringify(v);}catch(e){return;}try{localStorage.setItem(cityStorageKey(k),s);}catch(e){if(NEXT_CITY)return;try{ls4310Free(k);localStorage.setItem(k,s);}catch(e2){}}}};
const SET={diff:'normale',mute:!!LS.get('zc_mute',false),vib:LS.get('zc_vib',true)!==false};
const DIFFS={normale:{hp:1,dmg:1,spd:1,cnt:1,score:1,label:'Normale'},difficile:{hp:1.35,dmg:1.4,spd:1.12,cnt:1.25,score:1.5,label:'Difficile'}};
function DIFF(){return DIFFS[SET.diff]||DIFFS.normale;}
const URLQ=new URLSearchParams(location.search);const DEBUG_WAVE=Math.max(0,Math.min(99,parseInt(URLQ.get('wave')||'0',10)||0));
const S={score:0,combo:0,lastKill:-99,heads:0,gemsRun:0,killGem:0,nades:0,nadeCd:0,dmgT:0,breakT:0,lastCd:-1,hbT:0,hbP:0,boss:null,bossKills:0,claimBusy:{}};
const EQ={armor:false,med:false,boots:false,magnet:false};
const PROF={gems:LS.get('zc_gems',0)|0,owned:LS.get('zc_owned',[]),eqw:LS.get('zc_eqw',''),trial:LS.get('zc_trial','')};
if(!Array.isArray(PROF.owned))PROF.owned=[];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.round(n).toLocaleString('it-IT');
function cloudOK(){return !NEXT_CITY&&!!(TG.W&&tgVer('6.9')&&TG.W.CloudStorage);}
let cloudTO=null;function cloudSave(){if(!cloudOK())return;clearTimeout(cloudTO);cloudTO=setTimeout(()=>{try{TG.W.CloudStorage.setItem('zc_prof',JSON.stringify({g:PROF.gems,o:PROF.owned,e:PROF.eqw}),()=>{});}catch(e){}},600);}
function cloudLoad(){if(!cloudOK())return;try{TG.W.CloudStorage.getItem('zc_prof',(err,v)=>{if(err||!v)return;try{const c=JSON.parse(v);let ch=false;if((c.g|0)>PROF.gems){PROF.gems=c.g|0;ch=true;}for(const o of (c.o||[]))if(!PROF.owned.includes(o)){PROF.owned.push(o);ch=true;}if(!PROF.eqw&&c.e){PROF.eqw=c.e;ch=true;}if(ch){saveProf();showBest();}}catch(e){}});}catch(e){}}
function saveProf(){LS.set('zc_gems',PROF.gems);LS.set('zc_owned',PROF.owned);LS.set('zc_eqw',PROF.eqw);LS.set('zc_trial',PROF.trial);cloudSave();}
function refreshGems(){$('menuGems').textContent='💎 '+fmt(PROF.gems);$('shopGems').textContent=fmt(PROF.gems);}
function addGems(n,silent){PROF.gems=Math.max(0,PROF.gems+n);if(game.state==='play'&&n>0)S.gemsRun+=n;saveProf();refreshGems();if(!silent&&n>0&&game.state==='play')floatText('+'+n+' 💎','#8fe2ff');}
function ownerHere449(){try{return myId()==='7780175131';}catch(e){return false;}}
function owns(id){try{if(ownerHere449()&&typeof id==='string'&&id.indexOf('w_')===0)return true;}catch(e){}return PROF.owned.includes(id);}
function pname(){try{const u=TG.W&&TG.W.initDataUnsafe&&TG.W.initDataUnsafe.user;if(u&&u.first_name)return u.first_name.slice(0,16);}catch(e){}return 'Tu';}
let mtTO=null;function mtoast(m,ms){const e=$('mtoast');e.textContent=m;e.style.opacity=1;clearTimeout(mtTO);mtTO=setTimeout(()=>e.style.opacity=0,ms||1800);}
function dialog(t,b,btns){$('dlgT').textContent=t;$('dlgB').innerHTML=b;const r=$('dlgBtns');r.innerHTML='';for(const x of btns){const e=document.createElement('button');e.className='act'+(x.ghost?' ghost':'');e.textContent=x.label;e.addEventListener('click',()=>{$('dlgScreen').classList.add('hidden');x.fn&&x.fn();});r.appendChild(e);}$('dlgScreen').classList.remove('hidden');}

// ---------- catalog ----------
const SHOP_W=[{id:'w_minigun',w:'minigun',rar:'leggendario',best:1},{id:'w_flamer',w:'flamer',rar:'leggendario'},{id:'w_sniper',w:'sniper',rar:'epico'},{id:'w_glauncher',w:'glauncher',rar:'epico'},{id:'w_vespa',w:'vespa',rar:'epico'},{id:'w_saw',w:'saw',rar:'epico'},{id:'w_hunt',w:'hunt',rar:'epico'},{id:'w_smg',w:'smg',rar:'raro'},{id:'w_burst',w:'burst',rar:'raro'},{id:'w_ar',w:'ar',rar:'epico'},{id:'w_fox',w:'fox',rar:'raro'},{id:'w_thunder',w:'thunder',rar:'epico'},{id:'w_plasma',w:'plasma',rar:'leggendario'}];
const SHOP_E=[{id:'e_backpack',name:'Zaino da esploratore',emo:'🧳',rar:'raro',desc:'Survival: lo zaino passa da 60 a 120 posti per le risorse.'},{id:'e_armor',name:'Giubbotto antiproiettile',emo:'🦺',rar:'epico',desc:'Subisci il 25% di danni in meno da zombie ed esplosioni.'},
 {id:'e_medpack',name:'Zaino medico',emo:'🎒',rar:'raro',desc:'Salute massima 150 invece di 100.'},
 {id:'e_nadebag',name:'Borsa granate',emo:'💣',rar:'raro',desc:'Inizi ogni partita con 3 granate.'},
 {id:'e_boots',name:'Stivali tattici',emo:'🥾',rar:'comune',desc:'+12% velocità di movimento.'},
 {id:'e_magnet',name:'Magnete raccoglitore',emo:'🧲',rar:'comune',desc:'Raccogli materiali e premi da più lontano.'}];
const SHOP_G=[{id:'gems_100',gems:100,name:'Scorta di diamanti'},{id:'gems_250',gems:250,name:'Forziere di diamanti',tag:'+25%'},{id:'gems_600',gems:600,name:'Tesoro di diamanti',tag:'+50% · MIGLIORE'}];
const RAR_L={comune:'Comune',raro:'Raro',epico:'Epico',leggendario:'Leggendario'};
function itemName(id){const w=SHOP_W.find(s=>s.id===id);if(w)return WEAPONS.find(q=>q.id===w.w).name;const e=SHOP_E.find(s=>s.id===id);if(e)return e.name;const g=SHOP_G.find(s=>s.id===id);return g?g.gems+' diamanti':id;}

// ---------- weapon thumbnails (rendered once from the real 3D models) ----------
let THUMBS=null,TH422=null;
// 4.2.2: thumbnails rendered incrementally (one weapon per idle slice); THUMBS is published only when complete
function thumbInit422(){if(TH422)return TH422;const W=440,H=260;TH422={W,H,P:{},keys:Object.keys(VM),i:0,done:false,ms:0,max:0,n:0};try{
  const rt=new T.WebGLRenderTarget(W,H),sc=new T.Scene();sc.add(new T.HemisphereLight(0xeef2ff,0x4a4038,3.2));
  const k=new T.DirectionalLight(0xffffff,4.5);k.position.set(1.4,1.6,.6);sc.add(k);const f2=new T.DirectionalLight(0xfff0e0,2.5);f2.position.set(1,-.2,-.6);sc.add(f2);const rim=new T.DirectionalLight(0xa8c8ff,3.5);rim.position.set(-1,.8,-1.6);sc.add(rim);
  const cam=new T.PerspectiveCamera(30,W/H,.01,10),buf=new Uint8Array(W*H*4),cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d'),id=cx.createImageData(W,H);
  const lut=new Uint8Array(256);for(let i=0;i<256;i++)lut[i]=Math.round(Math.pow(i/255,1/2.2)*255);Object.assign(TH422,{rt,sc,cam,buf,cv,cx,id,lut});}catch(e){TH422.done=true;THUMBS=TH422.P;}return TH422;}
// thumb scene uses its own lights -> its programs differ from the game ones: compile + link them first, one program per slice
function thumbWarm422(Q){if(Q.wDone)return true;const t0=performance.now();
  if(!Q.wq){Q.wq=[];Q.wp=[];const seen=new Set();for(const key of Q.keys){const g=VM[key];if(!g)continue;g.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;if(o.material===gloveM||o.material===sleeveM)return;const k2=o.material.uuid+(o.isSkinnedMesh?'S':'');if(seen.has(k2))return;seen.add(k2);Q.wq.push(o);});}}
  if(Q.wp.length){const pr=Q.wp.shift();try{pr.getUniforms();}catch(e){}return false;}
  while(Q.wq.length){const o=Q.wq.shift();const before=renderer.info.programs.length;const kids=o.children,sv=kids.slice();kids.length=0;
    try{renderer.compile(o,Q.cam,Q.sc);}catch(e){}finally{kids.length=0;for(const c of sv)kids.push(c);}
    const L=renderer.info.programs;for(let i=before;i<L.length;i++)Q.wp.push(L[i]);if(L.length>before||performance.now()-t0>6)return false;}
  if(Q.wp.length)return false;Q.wDone=true;return true;}
function thumbOne422(){const Q=thumbInit422();if(Q.done)return;if(!Q.sync&&!thumbWarm422(Q))return;const t0=performance.now();const {W,H,rt,sc,cam,buf,cv,cx,id,lut}=Q;
  const pc=renderer.getClearColor(new T.Color()),pa=renderer.getClearAlpha(),nu=renderer.shadowMap.needsUpdate;
  try{while(Q.i<Q.keys.length){const key=Q.keys[Q.i++];const g=VM[key];if(!g)continue;renderer.setClearColor(0x000000,0);const par=g.parent,vis=g.visible,pos=g.position.clone(),rot=g.rotation.clone(),hid=[];
    try{g.traverse(o=>{if((o.isSprite||(o.isMesh&&(o.material===gloveM||o.material===sleeveM)))&&o.visible){hid.push(o);o.visible=false;}});
    sc.add(g);g.visible=true;g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
    const box=new T.Box3();g.traverse(o=>{if(o.isMesh&&o.visible)box.expandByObject(o);});const c=box.getCenter(new T.Vector3()),sz=box.getSize(new T.Vector3());
    const asp=W/H,len=Math.max(sz.z/asp,sz.y*1.25),dist=len/(2*Math.tan(15*Math.PI/180))*1.32;
    cam.position.set(c.x+dist*.96,c.y+dist*.16,c.z+dist*.2);cam.lookAt(c);
    renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);renderer.readRenderTargetPixels(rt,0,0,W,H,buf);renderer.setRenderTarget(null);
    for(let y=0;y<H;y++){const sr=(H-1-y)*W*4,dr=y*W*4;for(let x=0;x<W*4;x+=4){id.data[dr+x]=lut[buf[sr+x]];id.data[dr+x+1]=lut[buf[sr+x+1]];id.data[dr+x+2]=lut[buf[sr+x+2]];id.data[dr+x+3]=buf[sr+x+3];}}
    cx.putImageData(id,0,0);const o2=document.createElement('canvas');o2.width=W/2;o2.height=H/2;const ox=o2.getContext('2d');ox.imageSmoothingQuality='high';ox.drawImage(cv,0,0,W/2,H/2);Q.P[key]=o2.toDataURL('image/png');}
    finally{sc.remove(g);if(par)par.add(g);g.visible=vis;g.position.copy(pos);g.rotation.copy(rot);hid.forEach(o=>o.visible=true);}break;}}catch(e){}
  renderer.setRenderTarget(null);renderer.setClearColor(pc,pa);renderer.shadowMap.needsUpdate=nu;
  const dt=performance.now()-t0;Q.ms+=dt;Q.max=Math.max(Q.max,dt);Q.n++;
  if(Q.i>=Q.keys.length){Q.done=true;THUMBS=Q.P;try{Q.rt.dispose();}catch(e){}try{slog('perf thumbs total='+Math.round(Q.ms)+'ms slices='+Q.n+' maxSlice='+Math.round(Q.max)+'ms');}catch(e){}
    const cbs=Q.cbs||[];Q.cbs=[];for(const f of cbs)try{f();}catch(e){}}}
function renderThumbs(){const Q=thumbInit422();Q.sync=1;while(!Q.done)thumbOne422();return THUMBS;}
function renderThumbsIdle(cb){const Q=thumbInit422();if(Q.done){if(cb)cb();return;}if(cb)(Q.cbs||(Q.cbs=[])).push(cb);if(Q.run)return;Q.run=1;
  const idle=window.requestIdleCallback?f=>requestIdleCallback(f,{timeout:700}):f=>setTimeout(f,60);
  const step=()=>{if(Q.done)return;thumbOne422();if(!Q.done)idle(step);};idle(step);}
function thumbsPartial422(){return THUMBS||(TH422&&TH422.P)||{};}

// ---------- shop ----------
let shopTab='armi';
function starsOK(id){return !!INVOICE_LINKS[id]&&!(window.__zsApk&&!tgLive());}
function adsOn(){return !!(AD_CONFIG&&AD_CONFIG.blockId);}
function wBars(w){const r=w.bars?[['Danno',w.bars[0]],['Cadenza',w.bars[1]],['Precisione',w.bars[2]],['Caricatore',w.bars[3]]]:[['Danno',Math.min(1,Math.sqrt(w.dmg*w.pellets/130))],['Cadenza',Math.min(1,(1/w.rate)/14)],['Precisione',clamp(1-w.spread/.075,.06,1)],['Caricatore',Math.min(1,w.mag/40)]];
  return r.map(([l,v])=>'<div class="sbar"><span>'+l+'</span><i><b style="width:'+Math.round(v*100)+'%"></b></i></div>').join('');}
function euroTxt(id){const st=STARS_PRICES[id];if(!st)return '';const M={15:'0,49',25:'0,99',50:'1,99',100:'3,99',200:'6,99'};return M[st]||(st/50).toFixed(2).replace('.',',');}
function moneySoon(id){const eur=euroTxt(id);dialog('Pagamento in euro','<b>'+esc(itemName(id))+'</b>'+(eur?' costa <b>€ '+eur+'</b>.':'')+'<br>Sull\'app Android si paga in euro, con Google Play. Il pagamento vero arriva quando il gioco esce sullo store: ora non viene addebitato nulla. I diamanti 💎 restano.',[{label:'Ok',ghost:1}]);}
function buyBtns(id){const st=STARS_PRICES[id],gp=GEM_PRICES[id];let h='';
  if(window.__zsApk){const eur=euroTxt(id);if(eur)h+='<button class="bEuro" data-buy="'+id+'" data-m="euro">Compra € '+eur+'</button>';}
  else if(st&&(starsOK(id)||!adsOn()))h+='<button class="bStar'+(starsOK(id)?'':' off')+'" data-buy="'+id+'" data-m="star">Compra con ⭐ '+st+'</button>';
  else if(!gp&&adsOn())h+='<button class="bAd" data-ad="'+id+'">🎬 Prova 1 partita</button>';
  if(gp)h+='<button class="bGem'+(PROF.gems<gp?' poor':'')+'" data-buy="'+id+'" data-m="gem">💎 '+gp+'</button>';return h;}
function renderShop(){refreshGems();document.querySelectorAll('#shopTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.t===shopTab));
  const L=$('shopList');let h='';const th=thumbsPartial422();
  if(shopTab==='armi'){$('shopNote').textContent='Le armi sbloccate sono nel tuo arsenale a ogni partita, con munizioni piene.';
    for(const s of SHOP_W){const w=WEAPONS.find(q=>q.id===s.w),o=owns(s.id),eq=PROF.eqw===s.w;
      h+='<div class="scard r-'+s.rar+'">'+(o?'<div class="ownTag">TUA</div>':'')+(s.best&&!o?'<div class="bestTag">LA PIÙ FORTE</div>':'')+'<div class="sthumb">'+(th[s.w]?'<img alt="" src="'+th[s.w]+'">':'<span class="emo">🔫</span>')+'</div><div class="sbody"><div class="sname">'+esc(w.name)+'</div><div class="srar">'+RAR_L[s.rar]+'</div>'+wBars(w)+
       '<div class="sbtns">'+(o?'<button class="bOwn'+(eq?' eq':'')+'" data-eq="'+s.w+'">'+(eq?'✔ In mano al via':'Equipaggia')+'</button>':buyBtns(s.id))+'</div></div></div>';}}
  else if(shopTab==='equip'){$('shopNote').textContent='L\'equipaggiamento acquistato è sempre attivo.';
    for(const s of SHOP_E){const o=owns(s.id);h+='<div class="scard r-'+s.rar+'">'+(o?'<div class="ownTag">ATTIVO</div>':'')+'<div class="sthumb"><span class="emo">'+s.emo+'</span></div><div class="sbody"><div class="sname">'+esc(s.name)+'</div><div class="srar">'+RAR_L[s.rar]+'</div><div class="sdesc">'+s.desc+'</div><div class="sbtns">'+(o?'<button class="bOwn eq" disabled>✔ Attivo</button>':buyBtns(s.id))+'</div></div></div>';}}
  else{$('shopNote').textContent=window.__zsApk?'Guadagni 💎: missioni giornaliere (1-2) · boss +5 · raramente dagli zombie (1 su 800). Le armi leggendarie sono con 💎 o in euro.':'Guadagni 💎: missioni giornaliere (1-2) · boss +5 · raramente dagli zombie (1 su 800). Le armi leggendarie sono solo con 💎 o ⭐';
    for(const g of SHOP_G)h+='<div class="scard r-'+(g.gems>=600?'leggendario':g.gems>=250?'epico':'raro')+'">'+(g.tag?'<div class="bestTag" style="background:rgba(63,162,255,.92)">'+g.tag+'</div>':'')+'<div class="sthumb"><span class="gemBig">💎 '+g.gems+'</span></div><div class="sbody"><div class="sname">'+g.name+'</div><div class="srar">'+g.gems+' diamanti</div><div class="sdesc">Usali per armi ed equipaggiamento del negozio.</div><div class="sbtns">'+(window.__zsApk?'<button class="bEuro" data-buy="'+g.id+'" data-m="euro">Compra € '+euroTxt(g.id)+'</button>':'<button class="bStar'+(starsOK(g.id)?'':' off')+'" data-buy="'+g.id+'" data-m="star">Compra con ⭐ '+STARS_PRICES[g.id]+'</button>')+'</div></div></div>';
    if(adsOn()){const a=adState();h+='<div class="scard r-epico"><div class="sthumb"><span class="emo">🎬</span></div><div class="sbody"><div class="sname">Guarda un video</div><div class="srar">+'+AD_GEMS+' 💎 gratis</div><div class="sdesc">Ancora '+(AD_DAILY_MAX-a.n)+' su '+AD_DAILY_MAX+' oggi.</div><div class="sbtns"><button class="bAd" data-adgem="1"'+(a.n>=AD_DAILY_MAX?' disabled style="opacity:.5"':'')+'>🎬 Guarda: +'+AD_GEMS+'💎</button></div></div></div>';}
    h+='<div class="scard r-comune"><div class="sthumb"><span class="emo">🏆</span></div><div class="sbody"><div class="sname">Premi settimanali</div><div class="srar">Zombie uccisi in totale questa settimana</div><div class="sdesc">🥇 20💎 · 🥈 10💎 · 🥉 5💎<br>Ogni partita si somma al tuo totale. Ogni lunedì alle 00:00 il bot ti invia il premio: toccalo e i diamanti arrivano da soli sul tuo profilo.</div></div></div>';}
  L.innerHTML=h;L.scrollLeft=0;L.scrollTop=0;}
function openShop(tab){audioInit();shopTab=tab||'armi';const thd424=thumbInit422().done;renderShop();$('shopScreen').classList.remove('hidden');
  if(!thd424)renderThumbsIdle(()=>{const S=$('shopScreen'),L=$('shopList');if(!S||S.classList.contains('hidden')||shopTab!=='armi')return;const st=L.scrollTop,sl=L.scrollLeft;renderShop();L.scrollTop=st;L.scrollLeft=sl;});}
function grant(id){const g=SHOP_G.find(s=>s.id===id);if(g){addGems(g.gems,true);}else if(!owns(id)){PROF.owned.push(id);const w=SHOP_W.find(s=>s.id===id);if(w)PROF.eqw=w.w;saveProf();}
  play('buy');renderShop();mtoast('✔ '+itemName(id)+(g?' accreditati!':' sbloccato!'),2200);}
function buy(id,m){if(typeof id==='string'&&id.indexOf('w_')===0&&ownerHere449()){try{mtoast('✔ Già tua',900);}catch(e){}return;}if(window.__zsApk&&m!=='gem'){moneySoon(id);return;}if(m==='gem'){const p=GEM_PRICES[id];if(PROF.gems<p){try{mtoast('💎 Gemme insufficienti: ne servono '+p,1800);}catch(e){}dialog('Diamanti insufficienti','Ti servono <b>💎 '+p+'</b>, ne hai <b>'+fmt(PROF.gems)+'</b>.',[{label:'Vai ai diamanti',fn:()=>{try{if($('shopScreen').classList.contains('hidden')&&typeof openShop==='function')openShop();}catch(e){}shopTab='gems';renderShop();}},{label:'Chiudi',ghost:1}]);return;}
    dialog('Confermi l\'acquisto?','<b>'+esc(itemName(id))+'</b> per <b>💎 '+p+'</b>',[{label:'Compra',fn:()=>{if(PROF.gems>=p&&!owns(id)){PROF.gems-=p;saveProf();grant(id);}}},{label:'Annulla',ghost:1}]);return;}
  if(!starsOK(id)){if(adsOn()&&!id.startsWith('gems_')){adTrial(id);return;}
    dialog('Pagamento con Stelle','Il pagamento con ⭐ Telegram Stars è disponibile aprendo il gioco dal bot su Telegram.'+(GEM_PRICES[id]?'<br>Puoi anche usare i diamanti 💎.':''),[{label:'Ok',ghost:1}]);return;}
  starBuy(id);}
// v4: robust Stars purchase. openInvoice with full t.me invoice link link; if it throws (old client / invoice already open / unsupported in this launch mode)
// fall back to openTelegramLink(link), which opens the same invoice natively in Telegram. Visible feedback + guard against double taps.
let invBusy={t:0,id:''};
function starBuy(id){const url=INVOICE_LINKS[id],W=TG.W;if(!url||!W)return;const now=Date.now();if(invBusy.id===id&&now-invBusy.t<1500)return;invBusy={t:now,id};
  const fb=()=>{try{if(W.openTelegramLink){W.openTelegramLink(url);return true;}}catch(e){}try{window.open(url,'_blank');return true;}catch(e){}return false;};
  const cb=st=>{invBusy.t=0;if(st==='paid')grant(id);else if(st==='failed')mtoast('Pagamento non riuscito');else if(st==='pending')mtoast('⏳ Pagamento in elaborazione…',2200);};
  mtoast('⭐ Apro il pagamento…',1400);
  try{W.openInvoice(url,cb);}catch(e){invBusy.t=0;if(!fb())mtoast('Pagamento non disponibile');}}
// rewarded video (AdsGram) — script loaded lazily ONLY when AD_CONFIG.blockId is set
let adLoad=null;
function loadAds(){if(!adsOn())return Promise.reject(new Error('off'));if(window.Adsgram)return Promise.resolve();if(adLoad)return adLoad;
  adLoad=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://sad.adsgram.ai/js/sad.min.js';s.async=true;s.onload=()=>res();s.onerror=()=>{adLoad=null;rej(new Error('load'));};document.head.appendChild(s);});return adLoad;}
function showAd(cb){loadAds().then(()=>window.Adsgram.init({blockId:String(AD_CONFIG.blockId)}).show()).then(r=>cb(!r||r.done!==false)).catch(()=>{cb(false);mtoast('Video non disponibile, riprova più tardi');});}
function romeDay(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome'}).format(new Date());}catch(e){return new Date().toDateString();}}
function adState(){const a=LS.get('zc_ads',{d:'',n:0});if(a.d!==romeDay())return {d:romeDay(),n:0};return a;}
function adGems(){const a=adState();if(a.n>=AD_DAILY_MAX){mtoast('Limite video di oggi raggiunto');return;}showAd(ok=>{if(!ok)return;const b=adState();b.n++;LS.set('zc_ads',b);addGems(AD_GEMS,true);play('buy');renderShop();mtoast('+'+AD_GEMS+' 💎 accreditati!');});}
function adTrial(id){dialog('Prova gratis','Guarda un breve video per usare <b>'+esc(itemName(id))+'</b> nella prossima partita.',[{label:'🎬 Guarda',fn:()=>showAd(ok=>{if(!ok)return;PROF.trial=id;saveProf();mtoast('✔ '+itemName(id)+' pronto per la prossima partita!',2400);})},{label:'Annulla',ghost:1}]);}
$('shopList').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.buy)buy(b.dataset.buy,b.dataset.m);else if(b.dataset.eq){PROF.eqw=b.dataset.eq;saveProf();renderShop();}else if(b.dataset.ad)adTrial(b.dataset.ad);else if(b.dataset.adgem)adGems();});
$('shopTabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;shopTab=b.dataset.t;renderShop();});

// ---------- ranking (local; global via bot /classifica) ----------
function romeParts(ms){const f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,weekday:'short'});const o={};for(const p of f.formatToParts(new Date(ms)))o[p.type]=p.value;return o;}
function weekStart(){const now=Date.now();try{const o=romeParts(now),wd=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(o.weekday);const wall=Date.UTC(+o.year,+o.month-1,+o.day,(+o.hour)%24,+o.minute,+o.second),off=wall-Math.floor(now/1000)*1000;return Date.UTC(+o.year,+o.month-1,+o.day-Math.max(0,wd),0,0,0)-off;}
  catch(e){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime();}}
function resetIn(){const ms=weekStart()+7*864e5-Date.now(),d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5);return d>0?d+'g '+h+'h':h+'h '+Math.floor(ms%36e5/6e4)+'m';}
function runs(){const r=LS.get('zc_runs',[]);return Array.isArray(r)?r:[];}
function saveRun(){if(game.kills<=0&&S.score<=0)return;const r=runs();r.push({id:myId(),n:pname(),k:game.kills,w:SV.on?Math.max(1,SV.day|0):game.wave,s:S.score,d:SET.diff,t:Date.now()});LS.set('zc_runs',r.slice(-400));}
function myId(){try{const u=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.user;if(u&&u.id)return String(u.id);}catch(e){}
  try{const blobs=[];try{const W=window.Telegram&&Telegram.WebApp;if(W&&W.initData)blobs.push(W.initData);}catch(e){}try{const s=sessionStorage.getItem('zs_tg425');if(s)blobs.push(s);}catch(e){}
    for(const s of blobs){const um=/user=([^&]+)/.exec(s);if(!um)continue;const u=JSON.parse(decodeURIComponent(um[1]));if(u&&u.id)return String(u.id);}}catch(e){}return 'local';}
// v4.1: one row per player; every game ADDS to the player's total (kills, score), plus games count and best single game
function rankRows(mode,max){const ws=weekStart(),me=myId(),P={};for(const x of runs()){if(mode==='week'&&!(x.t>=ws))continue;const id=x.id!=null?String(x.id):me;const k=x.k||0,sc=x.s||0;const r=P[id]||(P[id]={id,n:x.n,k:0,s:0,g:0,bk:-1,bs:0,w:x.w,t:0});r.k+=k;r.s+=sc;r.g++;if(x.t>=r.t){r.t=x.t;r.n=x.n;}if(k>r.bk||(k===r.bk&&sc>r.bs)){r.bk=k;r.bs=sc;r.w=x.w;}}return Object.values(P).map(r=>r.id===me?Object.assign(r,{n:pname()}):r).sort((a,b)=>b.k-a.k||b.s-a.s).slice(0,max);}
const MEDAL=['🥇','🥈','🥉'],PRIZE=[20,10,5];
function rowHTML(x,i,week){return '<div class="rk"><span class="pos">'+(i<3?MEDAL[i]:(i+1))+'</span><span class="nm">'+esc(x.n)+' <small style="opacity:.6">· '+x.g+(x.g===1?' partita':' partite')+' · migliore '+x.bk+'☠️</small></span><span class="kv">'+x.k+' ☠️</span>'+(week&&i<3?'<span class="prize">'+PRIZE[i]+'💎</span>':'')+'</div>';}
let rankMode='week';
function renderRank(){document.querySelectorAll('#rankScreen .tab').forEach(b=>b.classList.toggle('on',b.dataset.r===rankMode));const rows=rankRows(rankMode,10);
  $('rankList').innerHTML=rows.length?rows.map((x,i)=>rowHTML(x,i,rankMode==='week')).join(''):'<div class="rk empty">Nessuno in classifica: uccidi degli zombie per entrare.</div>';
  $('rankFoot').innerHTML='🌍 Classifica uccisioni'+(rankMode==='week'?' · dal server, si aggiorna da sola':'');}
function openRank(){rankMode='week';renderRank();$('rankScreen').classList.remove('hidden');}
$('rankScreen').addEventListener('click',e=>{const b=e.target.closest('.tab');if(b){rankMode=b.dataset.r;renderRank();}});
function miniRow422(x,i){return '<div class="rk mini422'+(x.id===myId()?' me':'')+'"><span class="pos">'+MEDAL[i]+'</span><span class="nm"><span class="nmT">'+esc(x.n)+'</span><small>'+x.g+(x.g===1?' partita':' partite')+'</small></span><span class="kv">'+x.k+' ☠️</span><span class="prize">'+PRIZE[i]+'💎</span></div>';}
function setHTML(el,html){if(!el||el.__h===html)return;el.__h=html;el.innerHTML=html;}
function renderMini(){const rows=rankRows('week',3);$('miniReset').textContent='';
  let hh=rows.map((x,i)=>miniRow422(x,i)).join('');for(let i=rows.length;i<3;i++)hh+='<div class="rk ph"><span class="pos">'+MEDAL[i]+'</span><span class="nm">posto libero</span><span class="prize">'+PRIZE[i]+'💎</span></div>';setHTML($('miniList'),hh);}

// ---------- menu ----------
function showBest(){setTimeout(svMenuInfo,0);const b=LS.get('zc_best',{});
  refreshGems();document.querySelectorAll('#diffSeg button').forEach(x=>x.classList.toggle('on',x.dataset.d===SET.diff));renderMini();syncToggles();}
function syncToggles(){$('muteIc').textContent=SET.mute?'🔇':'🔊';for(const id of ['tgMute1','tgMute2']){$(id).textContent=SET.mute?'OFF':'ON';$(id).classList.toggle('on',!SET.mute);}for(const id of ['tgVib1','tgVib2']){$(id).textContent=SET.vib?'ON':'OFF';$(id).classList.toggle('on',SET.vib);}}
function setMute(v){SET.mute=v;LS.set('zc_mute',v);if(AU.master)AU.master.gain.value=v?0:.72;syncToggles();}
function setVib(v){SET.vib=v;LS.set('zc_vib',v);syncToggles();if(v&&navigator.vibrate)try{navigator.vibrate(30);}catch(e){}}
try{LS.set('zc_diff','normale');}catch(e){}
function onTap2(el,fn){let tt=0;el.addEventListener('touchend',e=>{if(drag43(e))return;if(e.cancelable)e.preventDefault();tt=Date.now();fn();},{passive:false});el.addEventListener('click',()=>{if(Date.now()-tt>600)fn();});}
onTap('btnShop',()=>openShop('armi'));onTap('shopClose',()=>{eatNextClick();$('shopScreen').classList.add('hidden');showBest();});
onTap('miniRank',openRank);onTap('rankBack',()=>{eatNextClick();$('rankScreen').classList.add('hidden');});
onTap('btnMute',()=>{audioInit();setMute(!SET.mute);});
for(const id of ['tgMute1','tgMute2'])onTap(id,()=>{audioInit();setMute(!SET.mute);});for(const id of ['tgVib1','tgVib2'])onTap(id,()=>setVib(!SET.vib));
onTap('menuBtn',showMenu);onTap('prizeOk',()=>$('prizeScreen').classList.add('hidden'));
onTap('pauseBtn',()=>pauseGame());onTap('resumeBtn',()=>resumeGame());onTap('quitBtn',()=>{if(window.__arena454&&__arena454.busy()){arenaShutdownToMenu();return;}saveRun();queueScore();showMenu();setTimeout(()=>scoreAfterRun(),400);});
onTap('sendScoreBtn',()=>{queueScore();flushScores(true);});
['pointerdown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{if(AU.ctx&&AU.ctx.state==='running'&&MUS.g)return;audioInit();musicStart();},{passive:true}));

// ---------- pause ----------
function pauseGame(){if(window.__arena454&&__arena454.on&&__arena454.phase==='play'){__arena454.pause();return;}if(game.state!=='play')return;game.state='pause';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();try{queueScore();zs439Arm();}catch(e){}
  svSave();setBuild(false);$('pauseInfo').innerHTML=SV.on?'Giorno <b>'+SV.day+'</b> · '+clockTxt()+' · notti di fila <b>'+SV.streak+'</b> · '+DIFF().label+'<br><small style="opacity:.7">Partita salvata automaticamente</small>':'Ondata <b>'+game.wave+'</b> · <b>'+fmt(S.score)+'</b> punti · '+DIFF().label;syncToggles();$('pauseScreen').classList.remove('hidden');}
function resumeGame(){if(game.state!=='pause')return;$('pauseScreen').classList.add('hidden');game.state='play';last=performance.now();lockPointer();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(game.state==='play'||game.state==='pause'||game.state==='over'){queueScore();try{flushScores(false);}catch(e){}}if(game.state==='play')pauseGame();}});window.addEventListener('pagehide',()=>{if(game.state==='play'||game.state==='pause'||game.state==='over'){queueScore();try{flushScores(false);}catch(e){}}});
document.addEventListener('pointerlockchange',()=>{if(!isTouch&&!document.pointerLockElement&&game.state==='play')pauseGame();});

// ---------- HUD helpers ----------
let bnTO=null;function banner(t,s,cls,ms){if(ms)ms=Math.min(ms,2300);if(s&&s.length>64)s=s.slice(0,62)+'…';$('bnT').textContent=t;$('bnT').className='bt'+(cls?' '+cls:'');$('bnS').textContent=s||'';$('bnC').textContent='';$('banner').classList.add('show');clearTimeout(bnTO);if(ms)bnTO=setTimeout(hideBanner,ms);}
function hideBanner(){$('banner').classList.remove('show');}
function feed(html){const f=$('feed'),d=document.createElement('div');d.innerHTML=html;f.prepend(d);while(f.children.length>4)f.lastChild.remove();setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),450);},3000);}
function hudExtra(){hud4();$('scoreTxt').textContent=fmt(S.score);$('mNade').textContent=S.nades;$('nadeN').textContent=S.nades;$('nadeBtn').classList.toggle('none',S.nades<=0);}
const ZLABEL={normal:'Zombie',runner:'Corridore',tank:'Gigante',bloater:'Esplosivo',boss:'BOSS'};

// ---------- scoring ----------
function onKill(z,head){const V=z.V;S.combo=game.time-S.lastKill<2.6?Math.min(9,S.combo+1):1;S.lastKill=game.time;
  const mult=1+(S.combo-1)*.25,pts=Math.round((V.score||100)*(head?1.5:1)*mult*DIFF().score/5)*5;S.score+=pts;if(head)S.heads++;
  feed('☠️ '+ZLABEL[V.name]+(head?' 🎯':'')+' <em>+'+pts+'</em>');
  if(S.combo>1){$('comboN').textContent='x'+S.combo;$('combo').style.opacity=1;}
  S.killGem++;if(Math.random()<1/800)addGems(1);
  if(V.name==='boss'){addGems(3);S.bossKills++;banner('BOSS SCONFITTO','+3 💎 · +'+fmt(pts)+' punti','',2800);fx.shake+=2;play('waveClear');maybeDrop(z,true);}
  else maybeDrop(z);}

// ---------- waves ----------
function buildPlan(n){const D=DIFF(),boss=n%5===0;let tot=Math.round((6+n*2)*D.cnt*(boss?.65:1));
  let r=n>=2?Math.min(6,1+(n>>1)):0,tk=n>=3?Math.min(3,(n-1)>>1):0,bl=n>=2?Math.min(4,1+((n-2)>>1)):0,theme='';
  if(boss)theme='⚠ ARRIVA IL BOSS';else if(n>=3&&n%4===3){r=Math.min(9,r*2);theme='🏃 Orda di corridori!';}
  else if(n>=4&&n%4===0){tk=Math.min(4,tk+1);bl=Math.min(5,bl+1);theme='💥 Giganti ed esplosivi';}else if(n===2)theme='🟢 Attenti agli zombie esplosivi!';
  const plan=[];for(let i=0,nm=Math.max(2,tot-r-tk-bl);i<nm;i++)plan.push('normal');
  const ins=(v,c)=>{for(let i=0;i<c;i++)plan.splice(1+((Math.random()*plan.length)|0),0,v);};ins('runner',r);ins('bloater',bl);ins('tank',tk);
  if(boss)plan.splice(Math.min(2,plan.length),0,'boss');return {plan,boss,theme};}
function startWave(n){game.wave=n;const pl=buildPlan(n);game.plan=pl.plan;game.toSpawn=pl.plan.length;game.spawnT=1.2;S.breakT=0;
  banner('ONDATA '+n,pl.theme||(pl.plan.length+' zombie in arrivo'),pl.boss?'boss':'',2600);play(pl.boss?'warn':'waveStart');updateHUD();}
function waveUpdate(dt){
  if(S.breakT>0){S.breakT-=dt;const n=Math.max(0,Math.ceil(S.breakT));if(n!==S.lastCd){S.lastCd=n;if(n<=5&&n>0){$('bnC').textContent='Prossima ondata tra '+n+'…';if(n<=3)play('tick');}}if(S.breakT<=0)startWave(game.wave+1);return;}
  if(game.toSpawn>0){game.spawnT-=dt;if(game.spawnT<=0&&aliveCount()<MAX_ALIVE){const v=game.plan[game.plan.length-game.toSpawn];if(spawnZombie(v)){game.toSpawn--;if(v==='boss')bossIntro();updateHUD();}
    game.spawnT=(game.wave===1&&game.toSpawn>4?.6:Math.max(.55,1.5-game.wave*.06))/DIFF().cnt;}}
  else if(!zombies.some(z=>z.alive)){S.breakT=8;S.lastCd=-1;player.hp=Math.min(player.maxHp,player.hp+30);addGems(2,true);
    banner('ONDATA '+game.wave+' SUPERATA','+30 ❤️ · +2 💎','',0);play('waveClear');updateHUD();}}
function bossIntro(){const z=zombies.find(q=>q.alive&&!q.dead&&q.V.name==='boss');if(!z)return;S.boss=z;z.slamT=3.5;$('bossName').textContent='☠ IL MACELLAIO · ONDATA '+game.wave;$('bossBar').style.display='block';groan(z,'atk');fx.shake+=.8;}
function spawnExtra(z){z.fuse=0;z.boomed=false;z.slamS=0;z.slamT=rand(3,4.5);if(z.V.name==='bloater')z.cool=999;}

// ---------- boss slam + bloater ----------
const slamRing=new T.Mesh(new T.RingGeometry(.88,1,56).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xff2a10,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));
const slamDisc=new T.Mesh(new T.CircleGeometry(1,48).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xff2000,transparent:true,opacity:.16,blending:T.AdditiveBlending,depthWrite:false}));
slamRing.visible=slamDisc.visible=false;slamDisc.position.y=-.01;slamRing.add(slamDisc);slamDisc.scale.setScalar(1);scene.add(slamRing);
function special(z,dt,t,target){const V=z.V,dx=target.x-z.g.position.x,dz=target.z-z.g.position.z,d=Math.hypot(dx,dz);
  if(V.name==='bloater'){if(z.glow)z.glow.material.opacity=.42+.22*Math.sin(t*4+z.seed)+(z.fuse>0?.4:0);
    if(z.fuse>0){z.fuse-=dt;z.beepT-=dt;if(z.beepT<=0){z.beepT=Math.max(.07,z.fuse*.28);play('beep');}z.mat.emissive.setHex(((t*16)|0)%2?0x66ff18:0x1c3a06);z.g.scale.setScalar(V.scale*(1+(1-Math.max(0,z.fuse))*.12));
      if(z.fuse<=0){bloaterBoom(z);return true;}}
    else if(d<2.7){z.fuse=1.05;z.beepT=0;}return false;}
  if(V.name==='boss'){const R=6.4,TEL=1.2;
    if(z.slamS>0){z.slamS+=dt;const k=z.slamS;slamRing.position.set(z.g.position.x,.035,z.g.position.z);
      if(k<TEL){const f=k/TEL;slamRing.visible=slamDisc.visible=true;slamRing.scale.setScalar(R*(.3+.7*f));slamRing.material.opacity=.35+.5*Math.abs(Math.sin(k*11));slamDisc.material.opacity=.1+.14*f;
        z.spine.rotation.set(lerp(.2,-.45,f),0,0);z.shL.rotation.set(-3*f-.3,0,.35);z.shR.rotation.set(-3*f-.3,0,-.35);z.elL.rotation.x=-.5;z.elR.rotation.x=-.5;z.hips.position.y=.95+f*.12;z.jaw.rotation.x=.65;z.neck.rotation.set(-.5*f,0,0);}
      else{if(!z.slammed){z.slammed=true;slamImpact(z,R);}const f=Math.min(1,(k-TEL)/.22);z.spine.rotation.set(lerp(-.45,.95,f),0,0);z.shL.rotation.set(lerp(-3.3,-.3,f),0,.35);z.shR.rotation.set(lerp(-3.3,-.3,f),0,-.35);z.hips.position.y=lerp(1.07,.78,f);
        slamDisc.visible=false;slamRing.material.opacity=Math.max(0,.85-(k-TEL)*2.4);slamRing.scale.setScalar(R*(1+(k-TEL)*.5));}
      if(k>TEL+.8){z.slamS=0;z.slamT=rand(4.5,7)/DIFF().spd;slamRing.visible=false;z.state='walk';z.cool=.5;}
      let dy=Math.atan2(dx,dz)-z.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));z.g.rotation.y+=dy*Math.min(1,dt*2.5);z.stag=0;return true;}
    z.slamT-=dt;if(z.slamT<=0&&d<10.5&&z.state!=='atk'){z.slamS=1e-4;z.slammed=false;play('warn');toast('⚠ Colpo a terra! Allontanati dal cerchio!',1300);}return false;}
  return false;}
function slamImpact(z,R){svBlast(z.g.position,R,80);const p=z.g.position,d=Math.hypot(player.pos.x-p.x,player.pos.z-p.z);play('slam');fx.shake+=clamp(3.4-d*.18,.6,2.8);
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2;_tmp.set(p.x+Math.cos(a)*R*.55,.1,p.z+Math.sin(a)*R*.55);_n.set(Math.cos(a),.6,Math.sin(a));emit(_tmp,_n,2,[0xe8eef6,0xc8d0dc,0x8a8a90],{speed:4,spread:.5,life:.9,size:.18,grav:4});}
  _n.set(0,1,0);_tmp.set(p.x,.007,p.z);addDecal(holes,_tmp,_n,3.2);
  if(d<R&&!ai437Shield(p)){hurt((22+game.wave)*DIFF().dmg*(1-d/R*.45));const ax=(player.pos.x-p.x)/(d+.01),az=(player.pos.z-p.z)/(d+.01);player.vel.x+=ax*9;player.vel.z+=az*9;}
  if(SET.vib&&navigator.vibrate)try{navigator.vibrate([40,30,60]);}catch(e){}}
function bloaterBoom(z){if(z.boomed)return;svBlast(z.g.position,3.8,110);z.boomed=true;const p=new T.Vector3(z.g.position.x,1,z.g.position.z);z.dead=true;z.alive=false;z.g.visible=false;z.g.scale.setScalar(z.V.scale);
  explosion(p,4.4,125,{pdmg:34*DIFF().dmg,green:true});updateHUD();}

// ---------- explosions ----------
const booms=[];for(let i=0;i<3;i++){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffa040,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0,fog:false}));s.visible=false;scene.add(s);booms.push({s,t:0,max:.4,size:1});}
let boomIdx=0;
function explosion(p,R,dmg,o){o=o||{};const cols=o.green?[0xe0ff90,0x8aff30,0x4ac010,0xffffff]:o.plasma?[0xffe0a0,0xff9a40,0xff5a10]:[0xfff3b0,0xffb040,0xff6a10,0xffffff];
  emit(p,_up,o.small?12:44,cols,{speed:o.small?4:8.5,spread:1.1,life:o.small?.3:.55,size:o.small?.07:.15,grav:3,up:.4});
  if(!o.small){emit(p,_up,18,o.green?[0x7a9a4a,0x5a7a3a,0x9aaa7a]:[0x4a4644,0x6a6460,0x87807a],{speed:2.6,spread:1,life:1.4,size:.38,grav:-1.2,up:.3});emit(p,_up,10,[0x2a2420,0x111111],{speed:7,spread:1,life:.9,size:.07,grav:14,up:.9});}
  const b=booms[boomIdx];boomIdx=(boomIdx+1)%booms.length;b.s.position.copy(p);b.s.material.color.setHex(cols[1]);b.t=b.max=o.small?.22:.42;b.size=o.small?1.8:R*1.5;b.s.visible=true;
  muzzleLight.color.setHex(o.green?0x9aff40:0xffa040);muzzleLight.position.set(p.x,p.y+.6,p.z);muzzleLight.intensity=o.small?20:80;
  if(!o.small){_n.set(0,1,0);_tmp.set(p.x,.007,p.z);addDecal(holes,_tmp,_n,R*.5);}
  const dP=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(!o.small)fx.shake+=clamp(3.2-dP*.25,.25,2.6);play(o.small?'pop':'boom',dP);
  for(const z of zombies){if(!z.alive||z.dead)continue;const dx=z.g.position.x-p.x,dz=z.g.position.z-p.z,dd=Math.hypot(dx,dz);if(dd>R+.4*z.V.scale)continue;
    const f=1-clamp(dd/R,0,1)*.6,dir=new T.Vector3(dx,0,dz);if(dir.lengthSq()<1e-6)dir.set(0,0,1);dir.normalize();damageZombie(z,dmg*f,'body',new T.Vector3(z.g.position.x,1.1*z.V.scale,z.g.position.z),dir);}
  if(o.pdmg&&dP<R*.85&&!ai437Shield(p))hurt(o.pdmg*(.1+.9*(1-dP/(R*.85))));
  if(!o.small&&SET.vib&&navigator.vibrate&&dP<14)try{navigator.vibrate(50);}catch(e){}}

// ---------- grenades ----------
const NADE_COST={wood:1,metal:1,elec:1},NADE_MAX=6;
const nadeGeo=new T.SphereGeometry(.085,12,9),nadeMat=new T.MeshLambertMaterial({color:0x44602e}),nadeLed=new T.MeshBasicMaterial({color:0xff3020});
const nades=[];for(let i=0;i<4;i++){const m=new T.Mesh(nadeGeo,nadeMat);const l=new T.Mesh(G.box,nadeLed);l.scale.set(.035,.035,.035);l.position.y=.09;m.add(l);const c=new T.Mesh(G.box,MAT.metal);c.scale.set(.05,.04,.05);c.position.y=.075;m.add(c);m.visible=false;scene.add(m);nades.push({m,led:l,on:false,t:0,v:new T.Vector3()});}
function throwNade(){if(window.__arena454&&__arena454.on)return;if(game.state!=='play'||S.nadeCd>0)return;if(S.nades<=0){toast('💣 Nessuna granata: costruiscila nel 🔨 Crafting',1500);play('empty');return;}
  const n=nades.find(q=>!q.on);if(!n)return;S.nades--;S.nadeCd=.7;n.on=true;n.t=1.6;camera.getWorldDirection(_dir);
  n.m.position.copy(camera.position).addScaledVector(_dir,.45);n.m.position.y-=.12;n.v.copy(_dir).multiplyScalar(14).add(player.vel);n.v.y+=3.6;n.m.visible=true;fx.swap=.5;play('throw');updateHUD();}
function nadeRecipe(){const w={cost:NADE_COST};return '<div class="recipe"><div><div class="name">💣 Granata ×2</div><div class="stats">Esplosione ad area · lancia con 💣 / G · max '+NADE_MAX+' (hai '+S.nades+')</div><div class="cost">'+costHTML(w)+'</div></div><button class="act" data-i="g" '+(canCraft(w)&&S.nades<NADE_MAX?'':'disabled')+'>Costruisci</button></div>';}
function craftNade(){const w={cost:NADE_COST};if(!canCraft(w)||S.nades>=NADE_MAX)return false;inv.wood--;inv.metal--;inv.elec--;S.nades=Math.min(NADE_MAX,S.nades+2);renderCraft();updateHUD();toast('💣 +2 granate',1200);play('craft');return true;}
tapBtn('nadeBtn',throwNade);

// ---------- drops / power-ups ----------
const DROP={med:{color:0xff4a5a,txt:'+35 ❤️ Kit medico',css:'#ff8a95'},ammo:{color:0xffc23a,txt:'+ Munizioni',css:'#ffd27a'},dmg:{color:0xb86bff,txt:'⚡ Danno x2 per 12s',css:'#d2a8ff'},nade:{color:0x8aff4a,txt:'+1 💣 Granata',css:'#b8ff90'}};
const drops=[];
{const white=new T.MeshLambertMaterial({color:0xf0f0f0,emissive:0x331111}),red=new T.MeshBasicMaterial({color:0xe02030}),olive=new T.MeshLambertMaterial({color:0x5a6a34,emissive:0x1a1a08}),brass=new T.MeshLambertMaterial({color:0xd9a640,emissive:0x5a3a00}),
  purple=new T.MeshBasicMaterial({color:0xc58aff}),octa=new T.OctahedronGeometry(.2,0),bul=new T.CylinderGeometry(.025,.025,.12,6);
 for(const type of ['med','med','ammo','ammo','dmg','dmg','nade','nade']){const I=DROP[type],root=new T.Group(),item=new T.Group();root.add(item);
  if(type==='med'){const b=new T.Mesh(G.box,white);b.scale.set(.36,.22,.3);item.add(b);const c1=new T.Mesh(G.box,red);c1.scale.set(.22,.03,.07);c1.position.y=.12;item.add(c1);const c2=c1.clone();c2.scale.set(.07,.03,.22);item.add(c2);}
  else if(type==='ammo'){const b=new T.Mesh(G.box,olive);b.scale.set(.38,.2,.24);item.add(b);for(let i=0;i<4;i++){const u=new T.Mesh(bul,brass);u.position.set(-.12+i*.08,.15,0);item.add(u);}}
  else if(type==='dmg'){const m=new T.Mesh(octa,purple);item.add(m);}
  else{const m=new T.Mesh(nadeGeo,nadeMat);m.scale.setScalar(1.5);item.add(m);const c=new T.Mesh(G.box,MAT.metal);c.scale.set(.07,.06,.07);c.position.y=.13;item.add(c);}
  const halo=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:I.color,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.85,fog:false}));halo.scale.set(1.3,1.3,1);item.add(halo);
  const ring=new T.Mesh(pickGeo.ring,new T.MeshBasicMaterial({color:I.color,transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));ring.position.y=.03;root.add(ring);
  root.visible=false;scene.add(root);drops.push({type,root,item,ring,on:false,t:0,x:0,z:0,pop:0});}}
function spawnDrop(type,x,z){const d=drops.find(q=>!q.on&&q.type===type);if(!d)return false;const s={x,z};collide(s,.3);d.on=true;d.t=18;d.x=s.x;d.z=s.z;d.pop=0;d.root.position.set(s.x,0,s.z);d.root.visible=true;d.item.scale.setScalar(.01);return true;}
function maybeDrop(z,boss){const p=z.g.position;if(boss){spawnDrop('med',p.x+1,p.z);spawnDrop('ammo',p.x-1,p.z);spawnDrop('dmg',p.x,p.z+1);return;}
  if(Math.random()>(z.V.heavy?.34:.16))return;const low=player.hp<player.maxHp*.5;const w=[['med',low?45:22],['ammo',34],['dmg',14],['nade',20]];let r=Math.random()*w.reduce((a,b)=>a+b[1],0);
  for(const [k,v] of w){r-=v;if(r<=0){spawnDrop(k,p.x,p.z);return;}}}
function applyDrop(d){const I=DROP[d.type];d.on=false;d.root.visible=false;
  if(d.type==='med')player.hp=Math.min(player.maxHp,player.hp+35);
  else if(d.type==='ammo'){const pack={pistol:8,revolver:4,shotgun:4,dbarrel:2,saw:2};let any=false;for(const w of WEAPONS){if(!own[w.id]||!pack[w.id])continue;const n=pack[w.id],b=res[w.id]|0;res[w.id]=Math.min(w.maxReserve,b+n);if(res[w.id]>b)any=true;}if(!any){inv.metal+=1;bump('mMetal');}}
  else if(d.type==='dmg')S.dmgT=12;else S.nades=Math.min(NADE_MAX,S.nades+1);
  _tmp.set(d.x,.7,d.z);emit(_tmp,_up,22,[I.color,0xffffff],{speed:3.2,spread:1,life:.6,size:.06,grav:2});floatText(I.txt,I.css);play('drop');updateHUD();}

// ---------- snow ----------
const SNOWN=isTouch?650:1100,snowPos=new Float32Array(SNOWN*3),snowSp=new Float32Array(SNOWN);
for(let i=0;i<SNOWN;i++){snowPos[i*3]=rand(-18,18);snowPos[i*3+1]=rand(0,13);snowPos[i*3+2]=rand(-18,18);snowSp[i]=rand(.7,1.4);}
const snowGeo=new T.BufferGeometry();snowGeo.setAttribute('position',new T.BufferAttribute(snowPos,3));
const snow=new T.Points(snowGeo,new T.PointsMaterial({color:0xffffff,size:.12,map:glowTex,transparent:true,opacity:.9,depthWrite:false,sizeAttenuation:true}));snow.frustumCulled=false;scene.add(snow);
let snowPh=0;
function snowCovered(){const x=player.pos.x,z=player.pos.z;if(roofAt(x,z))return true;const C=window.CITY4319;if(!C||!C.plots)return false;
  for(let i=0;i<C.plots.length;i++){const p=C.plots[i];if(Math.abs(x-p.x)<p.w*.5-.25&&Math.abs(z-p.z)<p.d*.5-.25)return true;}return false;}
function updateSnow(dt,t){if(zsShow()){snow.visible=false;return;}if(snowCovered()){if(snow.visible){snow.visible=false;snowGeo.setDrawRange(0,0);}return;}
  if(!snow.visible){snow.visible=true;snowGeo.setDrawRange(0,SNOWN);}
  const cx=camera.position.x,cz=camera.position.z,step=isTouch?4:3,off=snowPh;snowPh=(snowPh+1)%step;const adv=dt*step;
  const gust=Math.sin(t*.11)*.9+Math.sin(t*.037)*.45;
  for(let i=off;i<SNOWN;i+=step){const j=i*3,sp=snowSp[i];let y=snowPos[j+1]-adv*(.42+sp*.85);if(y<0)y+=13;snowPos[j+1]=y;
    const wob=Math.sin(t*1.15+i*.47)*.62+Math.sin(t*.33+i)*.2;
    let x=snowPos[j]+(gust+wob)*adv,z=snowPos[j+2]+(Math.cos(t*.47+i*.31)*.38+gust*.25)*adv;
    if(x-cx>18)x-=36;else if(x-cx<-18)x+=36;if(z-cz>18)z-=36;else if(z-cz<-18)z+=36;snowPos[j]=x;snowPos[j+2]=z;}
  if(!isFinite(snowPos[off*3+1])){try{dbg29('err','neve','Fiocco con posizione non valida');}catch(e){}}
  snowGeo.attributes.position.needsUpdate=true;}

// ---------- per-frame extras ----------
function updateExtras(dt,t){S.nadeCd=Math.max(0,S.nadeCd-dt);updateSnow(dt,t);
  for(const n of nades){if(!n.on)continue;n.t-=dt;n.v.y-=17*dt;const p=n.m.position;p.addScaledVector(n.v,dt);
    if(p.y<.085){p.y=.085;if(n.v.y<-2)play('clink');n.v.y=-n.v.y*.3;n.v.x*=.62;n.v.z*=.62;}
    if(p.y<2.9){const q={x:p.x,z:p.z};collide(q,.09);if(Math.abs(q.x-p.x)>1e-5)n.v.x*=-.45;if(Math.abs(q.z-p.z)>1e-5)n.v.z*=-.45;p.x=q.x;p.z=q.z;}
    n.m.rotation.x+=dt*9;n.led.visible=((n.t*(n.t<.6?16:5))|0)%2===0;
    if(n.t<=0){n.on=false;n.m.visible=false;explosion(new T.Vector3(p.x,Math.max(.45,p.y),p.z),5.2,230,{pdmg:40*DIFF().dmg});}}
  for(const b of booms){if(!b.s.visible)continue;b.t-=dt;if(b.t<=0){b.s.visible=false;continue;}const k=1-b.t/b.max;b.s.scale.setScalar(b.size*(.35+.65*Math.sqrt(k)));b.s.material.opacity=(1-k)*.95;}
  const pr=EQ.magnet?2.8:1.4;
  for(const d of drops){if(!d.on)continue;d.t-=dt;d.pop=Math.min(1,d.pop+dt*4);const s=d.pop<1?Math.sin(d.pop*Math.PI*.5)*1.15:1;d.item.scale.setScalar(s);
    d.item.rotation.y+=dt*2;d.item.position.y=.55+Math.sin(t*3+d.x)*.1;d.ring.material.opacity=.3+Math.sin(t*6)*.15;d.root.visible=d.t>4||((d.t*8)|0)%2===0;
    if(d.t<=0){d.on=false;d.root.visible=false;continue;}if(Math.hypot(d.x-player.pos.x,d.z-player.pos.z)<pr)applyDrop(d);}
  if(S.dmgT>0){const before=Math.ceil(S.dmgT);S.dmgT-=dt;const now=Math.ceil(S.dmgT);if(now!==before||!$('buffs').firstChild)$('buffs').innerHTML=S.dmgT>0?'<div>⚡ Danno x2 · '+now+'s</div>':'';}
  if(S.combo>1){const k=1-(game.time-S.lastKill)/2.6;if(k<=0){S.combo=0;$('combo').style.opacity=0;}else $('comboBar').style.width=(k*100)+'%';}
  const low=player.hp>0&&player.hp<player.maxHp*.3;if(low){S.hbT-=dt;if(S.hbT<=0){S.hbT=.62+player.hp/player.maxHp*1.2;S.hbP=1;play('heart');}}S.hbP=Math.max(0,S.hbP-dt*2.2);
  $('lowhp').style.opacity=low?(.3+.55*S.hbP).toFixed(2):'0';
  if(S.boss){if(S.boss.alive&&!S.boss.dead)$('bossFill').style.width=Math.max(0,S.boss.hp/S.boss.maxHp*100).toFixed(1)+'%';else{S.boss=null;$('bossBar').style.display='none';slamRing.visible=false;}}}

// ---------- loadout at game start ----------
function ownerArm449(){if(!ownerHere449())return;for(const w of WEAPONS){if(!w||w.tool||!w.mag)continue;own[w.id]=true;mag[w.id]=w.mag;if((res[w.id]|0)<(w.reserveGive||0))res[w.id]=w.reserveGive;}}
function applyLoadout(){Object.assign(S,{score:0,combo:0,lastKill:-99,heads:0,gemsRun:0,killGem:0,nades:0,nadeCd:0,dmgT:0,breakT:0,lastCd:-1,hbT:0,hbP:0,boss:null,bossKills:0});
  const trial=PROF.trial;if(trial){PROF.trial='';saveProf();}const has=id=>owns(id)||trial===id;
  EQ.armor=has('e_armor');EQ.med=has('e_medpack');EQ.boots=has('e_boots');EQ.magnet=has('e_magnet');player.maxHp=EQ.med?150:100;player.hp=player.maxHp;S.nades=has('e_nadebag')?3:0;
  let pick=-1;for(const s of SHOP_W){if(!has(s.id))continue;const i=WEAPONS.findIndex(q=>q.id===s.w),w=WEAPONS[i];own[w.id]=true;mag[w.id]=w.mag;res[w.id]=w.reserveGive;if(trial===s.id||(pick<0&&PROF.eqw===s.w))pick=i;}
  if(trial&&trial.startsWith('w_'))pick=WEAPONS.findIndex(q=>'w_'+q.id===trial);if(pick>0){curW=-1;equip(pick,true);}
  for(const n of nades){n.on=false;n.m.visible=false;}for(const d of drops){d.on=false;d.root.visible=false;}for(const b of booms)b.s.visible=false;
  slamRing.visible=false;$('bossBar').style.display='none';$('buffs').innerHTML='';$('feed').innerHTML='';$('combo').style.opacity=0;$('lowhp').style.opacity=0;hideBanner();
  try{ownerArm449();}catch(e){}
  musicStart();if(trial)setTimeout(()=>toast('🎬 Prova: '+itemName(trial),2000),2700);}

// ---------- game over ----------
function gameOver(){if(SV.on){svGameOver();return;}game.state='over';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();
  const best=LS.get('zc_best',{}),rec=S.score>(best.score||0),nb={score:Math.max(S.score,best.score||0),wave:Math.max(game.wave,best.wave||0),kills:Math.max(game.kills,best.kills||0)};LS.set('zc_best',nb);saveRun();
  slamRing.visible=false;$('bossBar').style.display='none';hideBanner();$('lowhp').style.opacity=0;
  $('overStats').innerHTML='<div class="bigScore">'+fmt(S.score)+'</div><div class="small" style="opacity:.7;letter-spacing:2px">PUNTI · '+DIFF().label.toUpperCase()+'</div>'+(rec?'<div class="recBadge">★ NUOVO RECORD ★</div>':'')+
   '<div class="statGrid"><div><b>'+game.wave+'</b>Ondata</div><div><b>'+game.kills+'</b>Uccisi</div><div><b>'+S.heads+'</b>Headshot</div><div><b>+'+S.gemsRun+'</b>💎 Guadagnati</div></div><div class="bestLine">🏆 Record: '+fmt(nb.score)+' punti · ondata '+nb.wave+' · '+nb.kills+' uccisi</div>';
  $('sendScoreBtn').style.display=TG.W&&TG.W.sendData&&TG.W.initData?'':'none';$('overScreen').classList.remove('hidden');play('over');}

// ---------- weekly prize claims (auto-credited) ----------
const SHA_K=[],SHA_H=[];{let n=2,c=0;const fr=x=>((x-Math.floor(x))*4294967296)|0;while(c<64){let p=true;for(let d=2;d*d<=n;d++)if(n%d===0){p=false;break;}if(p){if(c<8)SHA_H[c]=fr(Math.pow(n,1/2));SHA_K[c]=fr(Math.pow(n,1/3));c++;}n++;}}
function sha256hex(str){const H=SHA_H.slice(),K=SHA_K,b=Array.from(new TextEncoder().encode(str)),l=b.length*8;b.push(0x80);while(b.length%64!==56)b.push(0);for(let i=7;i>=0;i--)b.push(i>3?0:(l>>>(i*8))&255);
  const w=new Array(64);for(let o=0;o<b.length;o+=64){for(let i=0;i<16;i++)w[i]=(b[o+i*4]<<24)|(b[o+i*4+1]<<16)|(b[o+i*4+2]<<8)|b[o+i*4+3];
    for(let i=16;i<64;i++){const x=w[i-15],y=w[i-2],s0=(x>>>7|x<<25)^(x>>>18|x<<14)^(x>>>3),s1=(y>>>17|y<<15)^(y>>>19|y<<13)^(y>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0;}
    let a=H[0],bb=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for(let i=0;i<64;i++){const S1=(e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+w[i])|0,S0=(a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0;}
    H[0]=(H[0]+a)|0;H[1]=(H[1]+bb)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0;}
  return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');}
function verifyClaim(raw){const m=/^(\d{1,4})-([A-Za-z0-9]{8})-([0-9a-fA-F]{8})$/.exec(String(raw||'').trim());if(!m)return null;const amt=+m[1];if(amt<1||amt>1000)return null;
  return sha256hex(PRIZE_SALT+amt+'-'+m[2]).slice(0,8)===m[3].toLowerCase()?{amt,key:amt+'-'+m[2]}:null;}
function showPrize(amt,already){$('prizeTitle').textContent=already?'Premio già riscattato':'Premio classifica settimanale:';$('prizeAmt').textContent=already?amt+'💎':'+'+amt+'💎!';
  $('prizeSub').innerHTML=already?'Questo premio è già stato accreditato sul tuo profilo.':'Accreditati automaticamente sul tuo profilo.<br>Saldo: <b>💎 '+fmt(PROF.gems)+'</b>';$('prizeScreen').classList.remove('hidden');if(!already)play('buy');}
function claimCheck(raw,src){if(!raw)return;const v=verifyClaim(raw);
  if(src==='url')try{URLQ.delete('claim');const q=URLQ.toString();history.replaceState(null,'',location.pathname+(q?'?'+q:'')+location.hash);}catch(e){}
  if(!v){mtoast('Link premio non valido',2400);return;}if(S.claimBusy[v.key])return;S.claimBusy[v.key]=1;
  const used=LS.get('zc_claims',[]);if(used.includes(v.key)){showPrize(v.amt,true);return;}
  let done=false;const fin=cu=>{if(done)return;done=true;if(cu&&cu.includes(v.key)){used.push(v.key);LS.set('zc_claims',used.slice(-200));showPrize(v.amt,true);return;}
    used.push(v.key);LS.set('zc_claims',used.slice(-200));addGems(v.amt,true);showPrize(v.amt,false);if(cloudOK())try{TG.W.CloudStorage.setItem('zc_claims',JSON.stringify((cu||[]).concat([v.key]).slice(-60)),()=>{});}catch(e){}};
  if(cloudOK()){setTimeout(()=>fin(null),2500);try{TG.W.CloudStorage.getItem('zc_claims',(err,val)=>{let a=[];try{a=JSON.parse(val||'[]')||[];}catch(e){}fin(Array.isArray(a)?a:[]);});}catch(e){fin(null);}}else fin(null);}
window.__zcTG=()=>{cloudLoad();try{const sp=TG.W.initDataUnsafe&&TG.W.initDataUnsafe.start_param;if(sp)claimCheck(sp,'tg');}catch(e){}renderMini();try{ownerArm449();if(ownerHere449()&&game.state==='play')updateHUD();}catch(e){}};
setTimeout(()=>claimCheck(URLQ.get('claim'),'url'),350);

// ---------- music (generated drone, intensifies with waves / boss) ----------
const MUS0={g:null,f:null,b:null,int:0,beat:0};
function musicStart0(){const c=AU.ctx;if(!c||MUS.g)return;try{MUS.g=c.createGain();MUS.g.gain.value=0;MUS.f=c.createBiquadFilter();MUS.f.type='lowpass';MUS.f.frequency.value=260;MUS.f.Q.value=3;MUS.f.connect(MUS.g);MUS.g.connect(AU.master);
  for(const [fr,ty,v] of [[55,'sawtooth',.5],[55.35,'sawtooth',.5],[82.4,'triangle',.35],[27.5,'sine',.9]]){const o=c.createOscillator();o.type=ty;o.frequency.value=fr;const g=c.createGain();g.gain.value=v;o.connect(g).connect(MUS.f);o.start();}
  const l=c.createOscillator(),lg=c.createGain();l.frequency.value=.07;lg.gain.value=110;l.connect(lg).connect(MUS.f.frequency);l.start();
  MUS.b=c.createGain();MUS.b.gain.value=0;MUS.b.connect(MUS.f);for(const fr of [77.78,116.5]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.connect(MUS.b);o.start();}}catch(e){MUS.g=null;}}
function musicUpdate0(dt){if(!MUS.g||!AU.ctx)return;const t=AU.ctx.currentTime,bossOn=!!(S.boss&&S.boss.alive&&!S.boss.dead);let tgt=.16;
  if(game.state==='play')tgt=S.breakT>0?.24:.45+Math.min(.35,aliveCount()*.05);if(bossOn&&game.state==='play')tgt=1;if(game.state==='pause'||game.state==='craft')tgt=.12;if(game.state==='over')tgt=.1;
  MUS.int=damp(MUS.int,tgt,1.2,dt);MUS.g.gain.setTargetAtTime(.025+MUS.int*.08,t,.3);MUS.f.frequency.setTargetAtTime(220+MUS.int*950,t,.4);MUS.b.gain.setTargetAtTime(bossOn&&game.state==='play'?.16:0,t,.6);
  if(game.state==='play'&&MUS.int>.4){MUS.beat-=dt;if(MUS.beat<=0){MUS.beat=60/(62+MUS.int*58);osc(t,.22,.3*MUS.int,'sine',70,38);if(MUS.int>.85)nz(t,.06,.1,'highpass',6000);}}}

Object.assign(SFX,{
 smg(){const t=AU.ctx.currentTime;nz(t,.12,.6,'lowpass',5000,700);osc(t,.08,.4,'sine',220,60);nz(t,.03,.35,'highpass',4000);},
 ar(){const t=AU.ctx.currentTime;nz(t,.2,.85,'lowpass',5200,500);nz(t,.04,.5,'highpass',3200);osc(t,.12,.6,'sine',160,40);},
 plasma(){const t=AU.ctx.currentTime;osc(t,.22,.3,'sawtooth',900,90);osc(t,.18,.25,'square',420,60);nz(t,.12,.3,'bandpass',1800,400,2);},
 boom(d){const t=AU.ctx.currentTime,v=clamp(1.4/(1+(d||0)*.08),.25,1.3);nz(t,1.2,v,'lowpass',2600,60);nz(t,.25,v*.8,'highpass',1200);osc(t,.7,v,'sine',95,28);osc(t,.35,v*.5,'triangle',180,40);},
 pop(){const t=AU.ctx.currentTime;nz(t,.25,.4,'lowpass',2200,200);osc(t,.15,.25,'sine',200,60);},
 beep(){const t=AU.ctx.currentTime;osc(t,.07,.22,'square',1760,1760);},
 warn(){const t=AU.ctx.currentTime;osc(t,.6,.35,'sawtooth',220,110);osc(t,.6,.3,'sawtooth',233,116);nz(t,.5,.2,'lowpass',600,100);},
 slam(){const t=AU.ctx.currentTime;nz(t,1,1.3,'lowpass',900,40);osc(t,.8,1.2,'sine',60,22);nz(t,.15,.6,'bandpass',300,0,1);},
 tick(){const t=AU.ctx.currentTime;osc(t,.06,.2,'sine',1200,1200);},
 waveStart(){const t=AU.ctx.currentTime;osc(t,.9,.25,'sawtooth',110,55);osc(t+.05,.9,.2,'sawtooth',165,82);nz(t,.6,.2,'lowpass',800,120);},
 waveClear(){const t=AU.ctx.currentTime;[523,659,784].forEach((f,i)=>osc(t+i*.11,.35,.2,'triangle',f,f));},
 heart(){const t=AU.ctx.currentTime;osc(t,.12,.6,'sine',62,40);osc(t+.17,.12,.42,'sine',58,38);},
 throw(){const t=AU.ctx.currentTime;nz(t,.18,.3,'bandpass',900,2600,1.2);},
 clink(){const t=AU.ctx.currentTime;osc(t,.06,.12,'triangle',1800,1500);},
 drop(){const t=AU.ctx.currentTime;osc(t,.12,.25,'sine',880,1320);osc(t+.08,.18,.2,'sine',1320,1760);},
 buy(){const t=AU.ctx.currentTime;[784,988,1175,1568].forEach((f,i)=>osc(t+i*.07,.25,.18,'triangle',f,f));},
 over(){const t=AU.ctx.currentTime;osc(t,1.4,.3,'sawtooth',220,55);osc(t,1.4,.25,'sawtooth',233,58);nz(t,1.2,.25,'lowpass',500,80);}});
// ======================= v4 audio: reverb bus, punchy SFX, voiced zombies, adaptive music =======================
// smooth reverb impulse: noise one-pole low-passed (~fc), exponential decay to -60 dB at dur, short fade-in -> no hissy tail
const MUSDBG={oldIR:false};
function makeIR(c,dur,ch,fc){const sr=c.sampleRate,len=Math.max(1,dur*sr|0),ir=c.createBuffer(ch,len,sr),a=Math.exp(-2*Math.PI*(fc||3200)/sr),k=6.9/dur;
  for(let q=0;q<ch;q++){const d=ir.getChannelData(q);let y=0,pk=0;for(let i=0;i<len;i++){const t=i/sr;if(MUSDBG.oldIR){d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2);continue;}y=a*y+(1-a)*(Math.random()*2-1);d[i]=y*Math.exp(-k*t)*Math.min(1,t/.008);pk=Math.max(pk,Math.abs(d[i]));}
    if(!MUSDBG.oldIR&&pk>0)for(let i=0;i<len;i++)d[i]*=.6/pk;}return ir;}
function auBus(){const c=AU.ctx;if(AU.rev||!c)return;try{
  const ir=makeIR(c,1.2,2,3000);
  AU.rev=c.createConvolver();AU.rev.buffer=ir;AU.revIn=c.createGain();AU.revIn.gain.value=.9;const rf=c.createBiquadFilter();rf.type='lowpass';rf.frequency.value=3500;const rg=c.createGain();rg.gain.value=.45;
  AU.revIn.connect(rf).connect(AU.rev).connect(rg).connect(AU.master);
  AU.sfx=c.createGain();AU.sfx.gain.value=.92;AU.sfx.connect(AU.master);
  AU.mus=c.createGain();AU.mus.gain.value=isTouch?.28:.38;const musHp=c.createBiquadFilter();musHp.type='highpass';musHp.frequency.value=isTouch?180:100;musHp.Q.value=.7;const musC=c.createDynamicsCompressor();musC.threshold.value=-18;musC.knee.value=18;musC.ratio.value=4;musC.attack.value=.01;musC.release.value=.25;AU.mus.connect(musHp).connect(musC);musC.connect(AU.master);
  const curve=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;curve[i]=Math.tanh(x*3.2);}AU.curve=curve;}catch(e){}}
function sendRev(node,amt){if(!AU.revIn)return;const g=AU.ctx.createGain();g.gain.value=amt;node.connect(g).connect(AU.revIn);}
function sfxOut(rev){auBus();const c=AU.ctx;if(!c)return null;const now=c.currentTime,P=AU.sPool||(AU.sPool=[]);let s=null;
  for(let i=0;i<P.length;i++)if(P[i].until<=now+.02){s=P[i];break;}
  if(!s){if(P.length>=8){s=P[0];for(let i=1;i<P.length;i++)if(P[i].until<s.until)s=P[i];}
    else{const g=c.createGain();g.connect(AU.sfx||AU.master);const rg=c.createGain();rg.gain.value=0;if(AU.revIn)g.connect(rg).connect(AU.revIn);s={g,rg,until:0};P.push(s);}}
  s.until=now+2.4;try{s.rg.gain.setValueAtTime(rev||0,now);}catch(e){}return s.g;}
function auGate(key,kind){const c=AU.ctx;if(!c)return null;const G=AU.gate||(AU.gate={});if(G[key])return G[key];auBus();
  const g=c.createGain();g.gain.value=0;g.connect(AU.sfx||AU.master);
  if(kind==='noise'){const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=640;f.Q.value=1.3;s.connect(f).connect(g);try{s.start();}catch(e){}G[key]={g,f};}
  else{const o=c.createOscillator();o.type='sine';o.frequency.value=880;o.connect(g);try{o.start();}catch(e){}G[key]={g,o};}
  return G[key];}
function auBlip(v,t,f0,f1,vol,dur){if(!v)return;const g=v.g.gain;try{g.cancelScheduledValues(t);g.setValueAtTime(.0001,t);g.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.008);g.exponentialRampToValueAtTime(.0001,t+dur);}catch(e){}
  if(v.f){try{v.f.frequency.setValueAtTime(f0,t);if(f1>0)v.f.frequency.exponentialRampToValueAtTime(f1,t+dur);}catch(e){}}
  if(v.o){try{v.o.frequency.cancelScheduledValues(t);v.o.frequency.setValueAtTime(f0,t);if(f1>0)v.o.frequency.exponentialRampToValueAtTime(f1,t+dur);}catch(e){}}}
function auEnd(nodes){AU.v433=(AU.v433|0)+1;nodes[0].onended=function(){AU.v433=Math.max(0,(AU.v433|0)-1);for(let i=0;i<nodes.length;i++){try{nodes[i].disconnect();}catch(e){}}};}
function aN(t,dur,vol,type,f0,f1,q,dest,att){if(!AU.ctx||(AU.v433|0)>=12||vol<.015||!dest)return;const c=AU.ctx,s=c.createBufferSource();s.buffer=AU.noise;s.playbackRate.value=rand(.85,1.15);const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(Math.max(1,f0),t);if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);f.Q.value=q||.7;
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+(att||.003));g.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(f).connect(g).connect(dest);auEnd([s,f,g]);s.start(t,Math.random()*1.2);s.stop(t+dur+.03);}
function aO(t,dur,vol,type,f0,f1,dest,att){if(!AU.ctx||(AU.v433|0)>=12||vol<.015||!dest)return null;const c=AU.ctx,o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(Math.max(1,f0),t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);const g=c.createGain();
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+(att||.004));g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g).connect(dest);auEnd([o,g]);o.start(t);o.stop(t+dur+.03);return o;}
function aDist(dest,amt){const w=AU.ctx.createWaveShaper();w.curve=AU.curve;w.oversample='2x';const g=AU.ctx.createGain();g.gain.value=amt||1;g.connect(w).connect(dest);return g;}
// gunshot recipe: crack + body + sub thump + mechanical + tail
function gun(o){const t=AU.ctx.currentTime,d=sfxOut(o.rev||.18),v=o.v||1;
  aN(t,.018,.9*v,'highpass',o.crack||3800,0,.8,d,.001);
  aN(t,o.body||.2,1.0*v,'lowpass',o.lp||5200,o.lp2||420,.9,d,.002);
  aO(t,o.thd||.16,.9*v,'sine',o.th||150,o.th2||42,d,.002);
  if(o.dist){const x=aDist(d,.5*v);aN(t,o.body*.7||.12,.8,'bandpass',o.bp||1200,o.bp*.4||400,1.1,x,.002);}
  if(o.mech)aN(t+o.mech,.04,.25*v,'bandpass',o.mf||2800,0,4,d);
  if(o.tail)aN(t+.02,o.tail,.22*v,'lowpass',1400,180,.6,d,.03);}
Object.assign(SFX,{
 pistol(){gun({crack:4200,body:.17,lp:6000,lp2:600,th:180,th2:48,thd:.13,v:.85,tail:.35,mech:.07});},
 revolver(){gun({crack:3000,body:.32,lp:4800,lp2:300,th:120,th2:34,thd:.26,v:1.15,tail:.8,rev:.3,dist:1,bp:900});},
 shotgun(){gun({crack:2600,body:.42,lp:3800,lp2:260,th:110,th2:30,thd:.32,v:1.2,tail:.9,rev:.28,dist:1,bp:700});const t=AU.ctx.currentTime,d=sfxOut(.05);
   aN(t+.36,.05,.42,'bandpass',2300,0,3,d);aN(t+.41,.07,.28,'bandpass',800,0,2,d);aN(t+.55,.05,.5,'bandpass',3200,0,3,d);aO(t+.55,.035,.12,'square',700,320,d);},
 dbarrel(){gun({crack:2200,body:.5,lp:3400,lp2:200,th:90,th2:26,thd:.4,v:1.35,tail:1.1,rev:.32,dist:1,bp:600});},
 smg(){gun({crack:5200,body:.09,lp:6500,lp2:900,th:230,th2:70,thd:.07,v:.62,tail:.12});},
 ar(){gun({crack:4400,body:.15,lp:5800,lp2:520,th:170,th2:44,thd:.11,v:.8,tail:.28,dist:1,bp:1500});},
 minigun(){gun({crack:5600,body:.06,lp:7000,lp2:1400,th:200,th2:80,thd:.05,v:.5,tail:.06,rev:.08});},
 sniper(){gun({crack:2800,body:.45,lp:5200,lp2:240,th:95,th2:26,thd:.38,v:1.4,tail:1.6,rev:.45,dist:1,bp:1100,mech:.55,mf:1800});const t=AU.ctx.currentTime,d=sfxOut(.1);aN(t+.75,.05,.35,'bandpass',1500,0,4,d);aN(t+.88,.06,.4,'bandpass',2600,0,4,d);},
 crossbow(){const t=AU.ctx.currentTime,d=sfxOut(.08);aO(t,.1,.35,'triangle',190,95,d);aN(t,.06,.5,'bandpass',1800,600,2,d);aN(t+.01,.22,.25,'bandpass',3500,8000,6,d,.01);aO(t,.25,.12,'sine',720,600,d);},
 launcher(){const t=AU.ctx.currentTime,d=sfxOut(.15);aO(t,.2,.9,'sine',160,40,d);aN(t,.16,.8,'lowpass',1600,200,1,d);aN(t,.03,.4,'bandpass',900,0,2,d);aN(t+.05,.3,.18,'bandpass',600,2400,3,d,.02);},
 flame(){const t=AU.ctx.currentTime,d=sfxOut(.05);aN(t,.14,.22,'bandpass',rand(500,900),rand(300,500),.6,d,.02);aN(t,.1,.12,'highpass',3000,0,.5,d,.01);},
 flameStart(){const t=AU.ctx.currentTime,d=sfxOut(.1);aN(t,.35,.5,'lowpass',2600,500,.8,d,.01);aO(t,.3,.25,'sine',90,40,d);},
 spinUp(){const t=AU.ctx.currentTime,d=sfxOut(.05);aO(t,.65,.14,'sawtooth',90,620,d,.05);aO(t,.65,.08,'square',45,310,d,.05);aN(t,.6,.12,'bandpass',300,2400,4,d,.1);},
 spinDown(){const t=AU.ctx.currentTime,d=sfxOut(.05);aO(t,.7,.1,'sawtooth',600,70,d);aN(t,.5,.08,'bandpass',2000,300,4,d);},
 plasma(){const t=AU.ctx.currentTime,d=sfxOut(.25);aO(t,.24,.3,'sawtooth',1100,90,d);aO(t,.2,.28,'square',520,70,d);aN(t,.14,.35,'bandpass',2200,400,2,d);aO(t,.06,.3,'sine',2400,800,d);},
 laser(){const t=AU.ctx.currentTime,d=sfxOut(.2);aO(t,.13,.22,'sawtooth',2600,200,d);aO(t,.1,.18,'square',1700,95,d);aN(t,.05,.2,'highpass',6000,0,.7,d);},
 knife(){const t=AU.ctx.currentTime,d=sfxOut(.05);aN(t,.17,.38,'bandpass',700,4200,1.6,d,.03);},
 knifeHit(){const t=AU.ctx.currentTime,d=sfxOut(.08);aN(t,.13,.65,'lowpass',1100,180,.8,d);aO(t,.09,.35,'sine',150,55,d);aN(t+.02,.08,.25,'bandpass',600,0,3,d);},
 chop(){const t=AU.ctx.currentTime,d=sfxOut(.18);aN(t,.012,.7,'highpass',2500,0,.7,d,.001);aN(t,.16,.9,'bandpass',rand(380,460),220,2.2,d,.002);aO(t,.11,.5,'triangle',rand(170,200),90,d);aN(t+.03,.25,.12,'bandpass',2600,1800,6,d,.02);},
 timber(){const t=AU.ctx.currentTime,d=sfxOut(.3);for(let i=0;i<6;i++)aN(t+i*.11,.09,.35-i*.04,'bandpass',300+i*120,0,3,d);aN(t+.75,.7,.9,'lowpass',700,60,.8,d,.01);aO(t+.75,.5,.7,'sine',70,30,d);},
 mine(){const t=AU.ctx.currentTime,d=sfxOut(.22);aN(t,.01,.8,'highpass',4500,0,.7,d,.001);aO(t,.32,.22,'triangle',rand(1900,2300),0,d);aO(t,.25,.12,'sine',rand(3100,3500),0,d);aN(t,.12,.6,'bandpass',900,300,1.4,d);},
 rockBreak(){const t=AU.ctx.currentTime,d=sfxOut(.3);aN(t,.5,.9,'lowpass',2200,120,.8,d);for(let i=0;i<5;i++)aN(t+.05+i*.06,.06,.25,'bandpass',rand(1500,3500),0,4,d);aO(t,.3,.5,'sine',90,35,d);},
 place(){const t=AU.ctx.currentTime,d=sfxOut(.2);aO(t,.12,.6,'sine',130,55,d);aN(t,.1,.6,'lowpass',1400,200,1,d);aN(t+.06,.05,.3,'bandpass',2400,0,4,d);aN(t+.14,.05,.25,'bandpass',2000,0,4,d);},
 hammer(){const t=AU.ctx.currentTime,d=sfxOut(.15);aN(t,.01,.6,'highpass',3500,0,.7,d,.001);aO(t,.18,.3,'triangle',rand(900,1100),600,d);aN(t,.08,.5,'bandpass',600,0,2,d);},
 breakPiece(){const t=AU.ctx.currentTime,d=sfxOut(.3);aN(t,.6,1,'lowpass',1800,100,.8,d);for(let i=0;i<7;i++)aN(t+i*.05,.07,.3,'bandpass',rand(400,1800),0,3,d);aO(t,.35,.5,'sine',80,35,d);},
 thud(){const t=AU.ctx.currentTime,d=sfxOut(.12);aN(t,.12,.45,'lowpass',700,120,1,d);aO(t,.12,.3,'sine',110,50,d);},
 door(){const t=AU.ctx.currentTime,d=sfxOut(.2);aO(t,.35,.07,'sawtooth',rand(260,320),rand(380,460),d,.05);aN(t,.3,.1,'bandpass',900,1400,5,d,.05);aN(t+.32,.08,.4,'lowpass',900,150,1,d);},
 ui(){auBlip(auGate('ui','osc'),AU.ctx.currentTime,1400,980,.1,.05);},
 uiBack(){auBlip(auGate('ui','osc'),AU.ctx.currentTime,900,620,.08,.06);},
 empty(){const t=AU.ctx.currentTime,d=sfxOut(0);aN(t,.03,.32,'bandpass',3200,0,5,d);aO(t,.02,.08,'square',1800,1200,d);},
 reload(w){const t=AU.ctx.currentTime,d=sfxOut(.06);aN(t+.05,.05,.32,'bandpass',1800,0,4,d);aN(t+.09,.06,.18,'bandpass',900,0,2,d);
   aN(t+w*.5,.05,.4,'bandpass',1300,0,4,d);aO(t+w*.5,.03,.1,'square',500,300,d);aN(t+w*.82,.04,.5,'bandpass',2800,0,5,d);aN(t+w*.86,.05,.35,'bandpass',1600,0,4,d);},
 hit(head){const t=AU.ctx.currentTime,d=sfxOut(.04);aN(t,.1,.55,'lowpass',1300,260,.8,d);aO(t,.06,.25,'sine',140,70,d);if(head){aO(t,.2,.22,'sine',1650,1600,d);aO(t+.015,.22,.14,'sine',2480,2450,d);aN(t,.05,.3,'highpass',3000,0,.7,d);}else aO(t,.04,.08,'triangle',1200,1000,d);},
 kill(){const t=AU.ctx.currentTime,d=sfxOut(.1);aO(t,.12,.12,'triangle',740,1480,d);aN(t,.18,.35,'lowpass',600,120,.8,d);},
 hurt(){const t=AU.ctx.currentTime,d=sfxOut(.05);aN(t,.22,.85,'lowpass',600,90,.8,d);aO(t,.22,.5,'sine',120,45,d);aN(t,.06,.25,'bandpass',2200,0,2,d);},
 pickup(k){const t=AU.ctx.currentTime,d=sfxOut(.3);const f=[660,784,880,988,587][k]||700;aO(t,.18,.16,'sine',f,0,d);aO(t+.06,.22,.13,'sine',f*1.5,0,d);aO(t+.06,.18,.05,'triangle',f*3,0,d);},
 craft(){const t=AU.ctx.currentTime,d=sfxOut(.2);for(let i=0;i<3;i++){aN(t+i*.11,.05,.5,'bandpass',1400+i*450,0,4,d);aO(t+i*.11,.08,.15,'triangle',800+i*200,500,d);}[523,659,784,1046].forEach((f,i)=>aO(t+.36+i*.06,.4,.12,'triangle',f,0,d));},
 impact(){const t=AU.ctx.currentTime,d=sfxOut(.05);aN(t,.04,.18,'bandpass',rand(2500,4500),0,2,d);},
 boom(dd){const t=AU.ctx.currentTime,v=clamp(1.4/(1+(dd||0)*.07),.25,1.3),d=sfxOut(.5),x=aDist(d,.6*v);
   aN(t,.03,v,'highpass',1500,0,.7,d,.001);aN(t,1.6,v*1.1,'lowpass',3000,50,.7,d,.004);aN(t,.5,.9,'lowpass',900,100,1,x,.004);aO(t,.9,v*1.1,'sine',85,24,d,.004);aO(t,.4,v*.5,'triangle',160,40,d);
   for(let i=0;i<5;i++)aN(t+.15+Math.random()*.6,.06,.12*v,'bandpass',rand(1500,4000),0,3,d);},
 pop(){const t=AU.ctx.currentTime,d=sfxOut(.2);aN(t,.28,.45,'lowpass',2400,180,.8,d);aO(t,.16,.3,'sine',210,60,d);aN(t+.03,.3,.25,'bandpass',500,200,3,d);},
 beep(){const t=AU.ctx.currentTime,d=sfxOut(.1);aO(t,.08,.2,'square',1760,0,d);},
 warn(){const t=AU.ctx.currentTime,d=sfxOut(.5);aO(t,1.1,.22,'sawtooth',110,98,d,.15);aO(t,1.1,.18,'sawtooth',116.5,104,d,.15);aO(t,1.1,.3,'sine',55,49,d,.1);aN(t,.9,.25,'lowpass',500,80,.8,d,.2);},
 slam(){const t=AU.ctx.currentTime,d=sfxOut(.5);aN(t,1.1,1.3,'lowpass',900,35,.8,d,.003);aO(t,.9,1.2,'sine',62,20,d,.003);aN(t,.15,.6,'bandpass',300,0,1,d);for(let i=0;i<6;i++)aN(t+.1+i*.08,.08,.2,'bandpass',rand(300,1200),0,3,d);},
 tick(){const t=AU.ctx.currentTime,d=sfxOut(.15);aO(t,.08,.16,'sine',1320,0,d);},
 waveStart(){const t=AU.ctx.currentTime,d=sfxOut(.6);aO(t,1.4,.2,'sawtooth',110,0,d,.1);aO(t,1.4,.16,'sawtooth',164.8,0,d,.1);aO(t,1.4,.3,'sine',55,0,d,.1);aN(t,1.2,.18,'lowpass',700,100,.8,d,.3);aO(t,.5,.4,'sine',90,30,d);},
 waveClear(){const t=AU.ctx.currentTime,d=sfxOut(.5);[523.3,659.3,784,1046.5].forEach((f,i)=>{aO(t+i*.1,.7,.14,'triangle',f,0,d);aO(t+i*.1,.5,.05,'sine',f*2,0,d);});},
 heart(){const t=AU.ctx.currentTime,d=sfxOut(0);aO(t,.12,.32,'sine',150,90,d);aO(t+.17,.12,.22,'sine',140,85,d);},
 throw(){const t=AU.ctx.currentTime,d=sfxOut(.05);aN(t,.2,.3,'bandpass',800,2800,1.2,d,.03);},
 clink(){const t=AU.ctx.currentTime,d=sfxOut(.1);aO(t,.08,.12,'triangle',1900,1500,d);aO(t,.06,.05,'sine',3800,0,d);},
 drop(){const t=AU.ctx.currentTime,d=sfxOut(.4);aO(t,.18,.18,'sine',880,0,d);aO(t+.08,.25,.15,'sine',1318,0,d);aO(t+.16,.3,.1,'sine',1760,0,d);},
 buy(){const t=AU.ctx.currentTime,d=sfxOut(.5);[784,988,1175,1568].forEach((f,i)=>{aO(t+i*.07,.4,.15,'triangle',f,0,d);aO(t+i*.07,.3,.05,'sine',f*2,0,d);});},
 over(){const t=AU.ctx.currentTime,d=sfxOut(.6);[[220,0],[207.6,.5],[164.8,1.0]].forEach(([f,o])=>{aO(t+o,.9,.15,'sawtooth',f,f*.98,d,.06);aO(t+o,.9,.12,'triangle',f/2,0,d,.06);});aN(t,1.6,.2,'lowpass',500,80,.8,d,.3);},
 dawn(){const t=AU.ctx.currentTime,d=sfxOut(.7);[392,493.9,587.3,784].forEach((f,i)=>aO(t+i*.22,1.6,.1,'sine',f,0,d,.05));},
 dusk(){const t=AU.ctx.currentTime,d=sfxOut(.7);aO(t,2.5,.12,'sawtooth',73.4,0,d,.6);aO(t,2.5,.1,'sawtooth',77.8,0,d,.6);aO(t+.4,2,.08,'sine',440,415,d,.3);},
 step(k){auBlip(auGate('step','noise'),AU.ctx.currentTime,520+Math.random()*220,340,.04*(k||1),.08);},
 zstep(o){auBlip(auGate('step','noise'),AU.ctx.currentTime,480,220,.03*(o&&o.v||1),.1);},
});
// ---- zombie voices: glottal sawtooth -> rasp -> vowel formants, gurgle tremolo, reverb ----
const VOW=[[730,1090,2440],[570,840,2410],[300,870,2240],[520,1190,2390],[640,1190,2390]];
function groan(z,kind){if(!AU.ctx||(AU.v433|0)>=12||AU.groans>=(kind==='idle'?1:2))return;if(kind==='idle'&&Math.random()<.55)return;auBus();const c=AU.ctx,t=c.currentTime+.01;
  const dx=z.g.position.x-camera.position.x,dz=z.g.position.z-camera.position.z,d=Math.hypot(dx,dz);if(d>(kind==='idle'?22:32)&&kind!=='boss')return;
  const rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);const pan=(dx*rx+dz*rz)/(d+.1);
  const V=z.V,run=V.name==='runner',big=V.heavy,vol=clamp(1/(1+d*.2),0,1)*(kind==='atk'?.65:kind==='die'?.55:.38)*(V.name==='boss'?1.3:1);
  const dest=out(pan*.85);if(!dest)return;
  let base=(run?rand(150,210):big?rand(55,75):rand(85,115))*(V.pitch>1?1:(.6+V.pitch*.4)),dur=kind==='atk'?rand(.4,.55):kind==='die'?rand(.75,1.05):rand(.65,1.1);
  if(kind==='atk'&&run)base*=1.6;if(V.name==='boss')base=rand(42,52);
  const o=c.createOscillator();o.type='sawtooth';const f=o.frequency;f.setValueAtTime(Math.max(30,base),t);
  if(kind==='atk'){f.linearRampToValueAtTime(base*1.35,t+.1);f.exponentialRampToValueAtTime(Math.max(30,base*.75),t+dur);}
  else if(kind==='die')f.exponentialRampToValueAtTime(Math.max(28,base*.5),t+dur);
  else f.linearRampToValueAtTime(Math.max(30,base*rand(.75,.95)),t+dur);
  const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=V.name==='boss'?280:big?420:run?700:520;bp.Q.value=3.2;
  const env=c.createGain();env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+(kind==='atk'?.04:.09));env.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(bp).connect(env).connect(dest);auEnd([o,bp,env]);o.start(t);o.stop(t+dur+.04);
  AU.groans++;setTimeout(()=>AU.groans--,dur*1000+40);}

// ---- adaptive music: day (calm, melodic) / night (tense) / boss (driving) / menu, crossfaded ----
const MF=n=>440*Math.pow(2,(n-69)/12);
const THEMES={
 menu:{bpm:66,chords:[[50,57,62,65,69],[46,53,58,62,65],[41,48,53,57,64],[48,55,60,64,67]],scale:[62,65,67,69,72,74,77],mel:.35,bass:1,pad:.16,bell:1,kick:0,lead:0},
 day:{bpm:76,chords:[[50,57,62,65,69],[46,53,58,62,65],[41,48,53,57,64],[48,55,60,64,67],[50,57,62,65,69],[43,50,55,58,65],[46,53,57,62,65],[45,52,57,61,64]],scale:[62,64,65,67,69,72,74,76,77],mel:.55,bass:1,pad:.15,bell:1,kick:0,lead:0},
 night:{bpm:92,chords:[[45,52,57,60,64],[41,48,53,57,60],[38,45,50,53,57],[40,47,52,56,59]],scale:[57,59,60,62,64,65,68,69],mel:.25,bass:2,pad:.12,bell:0,kick:1,lead:0,trem:1},
 boss:{bpm:138,chords:[[40,47,52,55,59],[41,48,53,57,60],[40,47,52,55,59],[38,45,50,53,57]],scale:[52,53,55,57,59,60,64],mel:.4,bass:3,pad:.08,bell:0,kick:2,lead:1}};
const MUS={g:null,int:0,started:false,th:{},cur:'menu',next:0,step:0,buf:{},LA:1.0};
// Music is PRE-RENDERED off the main thread (OfflineAudioContext) into looping AudioBuffers: several random variations per theme,
// reverb baked in, loop tail folded onto the start (seamless). Playback = 1 looping BufferSource per audible theme, crossfades on the audio clock,
// so main-thread jank (3D rendering, GC) can no longer cause gaps. Live scheduler (1 s lookahead) is only a fallback until a buffer is ready.
const MVAR={menu:1,day:2,night:2,boss:2};let MSR=48000;
function mLoopLen(k){const th=THEMES[k];return 60/th.bpm/4*16*th.chords.length;}
function renderTheme(k){let p;try{p=renderTheme0(k);}catch(e){try{MUSD.decErr++;dbgP436('err','Musica: errore di generazione del tema '+k);}catch(x){}throw e;}return p&&p.then?p.then(b=>{if(!b)try{MUSD.renderFail++;}catch(x){}return b;},e=>{try{MUSD.decErr++;dbgP436('err','Musica: errore di generazione del tema '+k);}catch(x){}throw e;}):p;}
function musLimit(buf){try{const a=buf.getChannelData(0),n=a.length,sr=buf.sampleRate||MSR;if(!n)return buf;let mean=0;for(let i=0;i<n;i++)mean+=a[i];mean/=n;const R=Math.exp(-2*Math.PI*165/sr);let x1=0,y1=0,x2=0,y2=0,pk=0;for(let i=0;i<n;i++){const x=a[i]-mean;const y=x-x1+R*y1;x1=x;y1=y;const z=y-x2+R*y2;x2=y;y2=z;a[i]=z;const v=z<0?-z:z;if(v>pk)pk=v;}const g=pk>0.42?0.4/pk:1;for(let i=0;i<n;i++)a[i]=Math.tanh(a[i]*g*1.25)*.62;const fade=Math.min((sr*.09)|0,n>>4);for(let i=0;i<fade;i++){const w=i/fade,tail=a[n-fade+i];a[i]=tail*(1-w)+a[i]*w;}a[0]=a[n-1]=0;}catch(e){}return buf;}
function renderTheme0(k){const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OAC)return Promise.resolve(null);
  const th=THEMES[k],beat=60/th.bpm,sx=beat/4,L=mLoopLen(k)*MVAR[k],tail=1.4,Ls=Math.round(L*MSR),len=Ls+tail*MSR;let oc;
  try{oc=new OAC(1,len,MSR);}catch(e){return Promise.resolve(null);}
  const sv={ctx:AU.ctx,noise:AU.noise};
  try{AU.ctx=oc;if(!AU.noise||AU.noise.sampleRate!==MSR){const n=MSR*1.5,nb=oc.createBuffer(1,n,MSR),nd=nb.getChannelData(0);for(let i=0;i<n;i++)nd[i]=Math.random()*2-1;AU.noise=nb;}
    const lp=oc.createBiquadFilter();lp.type='lowpass';lp.frequency.value=k==='boss'?5200:3600;lp.connect(oc.destination);
    const ir=makeIR(oc,1.5,1,3000);
    const cv=oc.createConvolver();cv.buffer=ir;const wl=oc.createBiquadFilter();wl.type='lowpass';wl.frequency.value=2800;const wg=oc.createGain();wg.gain.value=MUSDBG.oldIR?.3:.1;lp.connect(wl).connect(cv).connect(wg).connect(oc.destination);
    const M={step:0,lp,mi:3},steps=Math.round(L/sx);for(let i=0;i<steps;i++){schedTheme(k,M,.01+i*sx,beat);M.step=(M.step+1)%(16*th.chords.length);}
  }catch(e){AU.ctx=sv.ctx;AU.noise=sv.noise;return Promise.resolve(null);}
  AU.ctx=sv.ctx;AU.noise=sv.noise;
  return new Promise(res=>{const done=rb=>{try{const out=oc.createBuffer(1,Ls,MSR),o=out.getChannelData(0),src=rb.getChannelData(0);const fade=Math.min(Math.round(MSR*.06),Ls>>3);
      for(let i=0;i<Ls;i++)o[i]=src[i]||0;for(let i=Ls;i<src.length&&i-Ls<Ls;i++)o[i-Ls]+=src[i];
      if(fade>16){for(let i=0;i<fade;i++){const w=i/fade;o[i]=o[i]*w+(src[Ls-fade+i]||0)*(1-w);}}res(musLimit(out));}catch(e){res(null);}};
    try{const pr=oc.startRendering();if(pr&&pr.then)pr.then(done,()=>res(null));else oc.oncomplete=e=>done(e.renderedBuffer);}catch(e){res(null);}});}
let MUSGEN=0;function musicPrerender(){if(MUS.pre)return;MUS.pre=1;const gen=++MUSGEN,sr=MSR;const order=['menu','day','night','boss'];let i=0;
  const nx=()=>{if(gen!==MUSGEN)return;if(i>=order.length)return;try{if(game.state==='play'){const need=(SV.on&&(SV.phase==='night'||SV.phase==='dusk'))?'night':'day';const j=order.indexOf(need,i);if(j<0){setTimeout(nx,1500);return;}if(j!==i){order.splice(j,1);order.splice(i,0,need);}}}catch(e){}const k=order[i++];renderTheme(k).then(b=>{if(gen!==MUSGEN||sr!==MSR)return;if(b)MUS.buf[k]=b;setTimeout(nx,250);});};setTimeout(nx,50);}
setTimeout(musicPrerender,400);
function musicStart(){const c=AU.ctx;if(!c||MUS.started)return;auBus();if(!AU.mus)return;MUS.started=true;MUS.g=AU.mus;const sr=c.sampleRate|0;if(sr>=32000&&sr<=96000&&sr!==MSR){MSR=sr;MUS.pre=0;MUS.buf={};}musicPrerender();ambStart();
  for(const k in THEMES){const g=c.createGain();g.gain.value=0;g.connect(AU.mus);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=k==='boss'?5200:3600;lp.connect(g);MUS.th[k]={g,lp,on:false,step:0,next:c.currentTime+.1,lv:-1,src:null};}}
function mTheme(){if(game.state==='menu'||game.state==='over'||!game.state)return 'menu';const bossOn=!!(S.boss&&S.boss.alive&&!S.boss.dead);if(bossOn)return 'boss';
  if(typeof SV!=='undefined'&&SV.on)return SV.phase==='night'||(SV.phase==='dusk'&&SV.pt>.6)?'night':'day';return S.breakT>0?'day':'night';}
function mNote(T0,dest,f,dur,vol,type,att,rel,det){const c=AU.ctx,o=c.createOscillator();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;const g=c.createGain();g.gain.setValueAtTime(.0001,T0);g.gain.exponentialRampToValueAtTime(vol,T0+att);g.gain.setValueAtTime(vol,T0+Math.max(att,dur-rel));g.gain.exponentialRampToValueAtTime(.0001,T0+dur);o.connect(g).connect(dest);o.start(T0);o.stop(T0+dur+.05);}
function bell(T0,dest,f,vol){mNote(T0,dest,f,1.8,vol,'sine',.004,1.7);mNote(T0,dest,f*2.01,.9,vol*.35,'sine',.003,.85);mNote(T0,dest,f*3.98,.4,vol*.12,'sine',.002,.38);}
function pad(T0,dest,ch,dur,vol){for(const n of ch.slice(1)){mNote(T0,dest,MF(n),dur,vol*.85,'sine',dur*.4,dur*.5,-3);mNote(T0,dest,MF(n),dur,vol*.4,'triangle',dur*.45,dur*.5,3);}}
function schedTheme(k,M,T0,beat){const th=THEMES[k],c=AU.ctx,s=M.step,bar=(s/16)|0,b16=s%16,ch=th.chords[bar%th.chords.length],d=M.lp,sx=beat/4;
  if(b16===0)pad(T0,d,ch,beat*4.1,th.pad*.22);
  if(th.bass===1&&(b16===0||b16===10))mNote(T0,d,MF(ch[0]-12),beat*1.8,.2,'triangle',.02,.6);
  if(th.bass===2&&b16%2===0)mNote(T0,d,MF(ch[0]-(b16%8===0?12:0)),sx*1.6,.11,'triangle',.02,.16);
  if(th.bass===3)mNote(T0,d,MF(ch[0]-12+(b16%4===3?12:0)),sx*.9,.13,'triangle',.012,.1);
  if(th.kick){const kp=th.kick===2?b16%4===0:(b16===0||b16===8||b16===11);if(kp){aO(T0,.32,th.kick===2?.5:.38,'sine',120,38,d);}
    if(th.kick===2&&(b16===4||b16===12)){aN(T0,.18,.22,'bandpass',1800,900,.8,d,.002);aN(T0,.05,.15,'lowpass',400,0,.7,d);}
    if(th.kick===2&&b16%2===1)aN(T0,.02,.008,'bandpass',3200,0,.8,d,.002);if(th.kick===1&&b16%4===2)aN(T0,.02,.006,'bandpass',3000,0,.8,d,.002);}
  if(th.trem&&b16%2===0)mNote(T0,d,MF(ch[3]+12),sx*1.5,.016,'sine',.02,.1,2);
  if(th.lead&&(b16===0||b16===3||b16===6||b16===10)){const n=ch[2]+12+(b16===10?3:0);mNote(T0,d,MF(n),sx*2.2,.05,'triangle',.02,.2);mNote(T0,d,MF(n-12),sx*2.2,.03,'sine',.02,.2);}
  if(th.bell){const melStep=b16%2===0;if(melStep&&Math.random()<th.mel*(b16%4===0?1:.55)){const sc=th.scale;M.mi=clamp((M.mi||3)+((Math.random()*5|0)-2),0,sc.length-1);bell(T0,d,MF(sc[M.mi]+12),.065);}
    if(b16===0||b16===8)bell(T0,d,MF(ch[4]+12),.035);}
  else if(th.mel&&b16%4===0&&Math.random()<th.mel){const sc=th.scale;M.mi=clamp((M.mi||3)+((Math.random()*3|0)-1),0,sc.length-1);mNote(T0,d,MF(sc[M.mi]+12),beat*1.5,.05,'triangle',.08,.6,3);}}
// ---- ambience: warm low-passed wind swells (brown noise <~600 Hz), occasional distant nature/night details, campfire crackle near fires ----
const AMB={on:false,g:null,lp:null,tk:0,ev:0,crk:0};
function brownBuf(c,sec){const sr=c.sampleRate,n=sec*sr|0,b=c.createBuffer(1,n,sr),d=b.getChannelData(0);let y=0;for(let i=0;i<n;i++){y=(y+.02*(Math.random()*2-1))/1.02;d[i]=y;}
  const f=sr*.5|0;for(let i=0;i<f;i++){const k=i/f;d[i]=d[i]*k+d[n-f+i]*(1-k);}let peak=0;for(let i=0;i<n;i++){const a=d[i]<0?-d[i]:d[i];if(a>peak)peak=a;}
  const g=peak>1e-4?.62/peak:1;for(let i=0;i<n;i++)d[i]*=g;return b;}
function ambStart(){const c=AU.ctx;if(!c||AMB.on||!AU.master)return;AMB.on=true;try{const s=c.createBufferSource();s.buffer=brownBuf(c,10);s.loop=true;s.loopStart=0;s.loopEnd=(s.buffer.length-(c.sampleRate*.5|0))/c.sampleRate;
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=240;hp.Q.value=.7;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;lp.Q.value=.5;const lp2=c.createBiquadFilter();lp2.type='lowpass';lp2.frequency.value=900;const g=c.createGain();g.gain.value=0;
  s.connect(hp).connect(lp).connect(lp2).connect(g).connect(AU.master);s.start();AMB.g=g;AMB.lp=lp;}catch(e){}}
function ambVoice(t,type,f0,f1,f2,dur,vol,lpf,rev,vib){const c=AU.ctx,o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f1,t+dur*.35);o.frequency.linearRampToValueAtTime(f2,t+dur);
  const l=c.createBiquadFilter();l.type='lowpass';l.frequency.value=lpf;const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.12,dur*.3));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  let lf=null;if(vib){lf=c.createOscillator();lf.frequency.value=vib;const lg=c.createGain();lg.gain.value=f1*.012;lf.connect(lg).connect(o.frequency);lf.start(t);lf.stop(t+dur+.05);}
  const d=out(rand(-.8,.8));o.connect(l).connect(g).connect(d);sendRev(g,rev);o.start(t);o.stop(t+dur+.05);}
function ambUpdate(now,dt){if(!AMB.on||!AMB.g)return;const night=typeof SV!=='undefined'&&SV.on&&(SV.phase==='night'||(SV.phase==='dusk'&&SV.pt>.5)),play_=game.state==='play';
  AMB.tk-=(dt>0?dt:1/60);if(AMB.tk>0)return;AMB.tk=rand(8,12);
  const musOn=!!(MUS.started&&!SET.mute&&AU.ctx&&AU.ctx.state==='running');
  const base=play_?(night?.016:.012):.004;
  AMB.lp.frequency.setTargetAtTime(night?260:340,now,3.2);
  AMB.g.gain.setTargetAtTime(musOn?base*.28:base,now,1.8);}
function mSrcStart(k,M,when,offset){const c=AU.ctx;if(!c||c.state!=='running'||!MUS.buf[k])return;try{if(M.src){const old=M.src;M.src=null;try{old.onended=null;}catch(e){}try{old.stop();}catch(e){}try{old.disconnect();}catch(e){}}}catch(e){}
  const s=c.createBufferSource();s.buffer=MUS.buf[k];s.loop=true;s.onended=function(){if(M.src===s){M.src=null;try{MUSD.restarts++;}catch(e){}}};s.connect(M.g);
  try{const dur=s.buffer.duration||1;let off=offset;if(off==null)off=M.t0?((when-(M.t0||0))%dur+dur)%dur:0;else off=((off||0)%dur+dur)%dur;s.start(when,off);M.t0=when-off;}catch(e){try{s.disconnect();}catch(x){}return;}
  M.src=s;try{MUSD.starts[k]=(MUSD.starts[k]|0)+1;}catch(e){}}
function musicUpdate(dt){if(!MUS.started||!AU.ctx)return;const c=AU.ctx,now=c.currentTime,want=mTheme();if(c.state==='suspended'&&document.visibilityState==='visible'&&!SET.mute){try{const p=c.resume();if(p&&p.then)p.then(()=>{try{if(MUS.started)musicUpdate(0);}catch(e){}});if(p&&p.catch)p.catch(()=>{});}catch(e){}}try{ambUpdate(now,dt);}catch(e){}
  const prev=MUS._ct;MUS._ct=now;const frozen=prev!=null&&now-prev<.0005&&dt>.02;const jump=prev!=null&&(now-prev>.8||now+.05<prev);
  const vol=(game.state==='pause'||game.state==='craft'||game.state==='chest'||game.state==='bag')?.45:1;
  if(jump){for(const k in MUS.th){const M=MUS.th[k],on=k===want;try{M.g.gain.cancelScheduledValues(now);M.g.gain.setValueAtTime(on?vol:0,now);}catch(e){}
    M.lv=on?vol:0;M.fadeAt=0;M.offT=0;if(!on){M.on=false;if(M.src){try{M.src.onended=null;M.src.stop();}catch(e){}M.src=null;}}}}
  if(frozen)return;
  for(const k in MUS.th){const M=MUS.th[k],tgt=(k===want?1:0)*vol;
    if(tgt!==M.lv){M.lv=tgt;const gp=M.g.gain;try{gp.cancelScheduledValues(now);gp.setValueAtTime(gp.value||0,now);gp.setTargetAtTime(tgt,now+.02,k===want?.4:.25);}catch(e){}
      if(tgt>0)M.fadeAt=0;else if(!M.fadeAt)M.fadeAt=performance.now()+1000;M.offT=tgt>0?0:now+.95;}
    if(tgt>0&&!M.on){M.on=true;M.next=now+.05;if(MUS.buf[k])mSrcStart(k,M,M.next,M.t0?null:0);}
    else if(tgt===0&&M.on&&(now>(M.offT||0)||performance.now()>(M.fadeAt||1e15))){M.on=false;M.fadeAt=0;if(M.src){try{M.src.onended=null;M.src.stop();}catch(e){}M.src=null;}}
    if(!M.on||M.src||!MUS.buf[k])continue;if(M.tried&&performance.now()-M.tried<400)continue;M.tried=performance.now();M.next=now+.04;mSrcStart(k,M,M.next,null);}}
// SFX polyphony cap so effects never starve the audio thread
{const _p=play,last={},rec=[];const PRIO={over:1,warn:1,boss:1,dawn:1,dusk:1,ui:1,uiBack:1};
 play=function(name,arg){if(!AU.ctx)return;const t=performance.now();while(rec.length&&t-rec[0]>250)rec.shift();
   if(!PRIO[name]){if(rec.length>=9)return;if(t-(last[name]||-1e9)<28)return;}last[name]=t;rec.push(t);_p(name,arg);};}
// player footsteps on snow
let stepAcc=0;function footstep(spd,dt){if(!AU.ctx||spd<.6)return;stepAcc+=dt*spd*.62;if(stepAcc>1){stepAcc=0;play('step',spd>5?1.3:1);}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('button,.mBtn,.tab');if(b&&AU.ctx)play(b.classList.contains('ghost')||b.id==='shopClose'?'uiBack':'ui');},true);

