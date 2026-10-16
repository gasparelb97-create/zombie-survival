'use strict';
// 4.3.93: clean pickup card (weapons + gear), new defensive buildables, ammo craft cost chips, leaderboard at boot.
(function(){
const E=(e,w)=>{try{console.warn('493',w,e&&e.message);window.__DBG&&__DBG.prob('err','v493',w+': '+(e&&e.message||e));}catch(_){}};
const ES=s=>{try{return esc(s);}catch(e){return String(s).replace(/[<>&"]/g,'');}};
// ===================== (1) pickup card =====================
const st=document.createElement('style');st.textContent=
'#pk493{position:fixed;inset:0;z-index:950;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62);padding:8px}#pk493.hidden{display:none}'+
'#pk493 .c{width:min(620px,96vw);max-height:calc(100vh - 16px);box-sizing:border-box;background:#141a22;border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:10px 14px;color:#e8eef5;font:600 15px/1.2 system-ui,sans-serif;display:flex;flex-direction:column;gap:7px;box-shadow:0 10px 40px #000}'+
'#pk493 .t{display:flex;justify-content:space-between;align-items:baseline;font:900 17px system-ui,sans-serif;color:#ffd27a}#pk493 .t small{font-size:12px;color:#9aa6b4;font-weight:700}'+
'#pk493 .hd{display:grid;grid-template-columns:110px 1fr 1fr;gap:8px;align-items:stretch}'+
'#pk493 .it{display:flex;align-items:center;gap:8px;border:2px solid #444;border-radius:12px;padding:5px 8px;min-width:0;background:rgba(255,255,255,.04)}#pk493 .it i{font-style:normal;font-size:26px;line-height:1}#pk493 .it img{width:46px;height:26px;object-fit:contain}'+
'#pk493 .it div{min-width:0}#pk493 .it b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#pk493 .it small{display:block;font-size:11px;color:#9aa6b4;text-transform:uppercase;letter-spacing:.05em}'+
'#pk493 .it.old{opacity:.85;border-style:dashed}'+
'#pk493 .rows{display:flex;flex-direction:column;gap:2px}#pk493 .r{display:grid;grid-template-columns:110px 1fr 1fr;gap:8px;align-items:center;padding:3px 0;border-top:1px solid rgba(255,255,255,.07);font-size:15px}'+
'#pk493 .r span{color:#b9c4d2}#pk493 .r .v{text-align:center;font-weight:900}#pk493 .r .o{text-align:center;color:#9aa6b4}#pk493 .up{color:#5fe08a}#pk493 .dn{color:#ff6b5e}#pk493 .eq{color:#9aa6b4}'+
'#pk493 .note{font-size:12px;color:#ffb35a;text-align:center;min-height:0}'+
'#pk493 .b{display:grid;grid-template-columns:1.2fr 1.2fr 1fr;gap:8px}#pk493 .b button{height:42px;border-radius:12px;border:0;font:900 15px system-ui,sans-serif;color:#10131a;background:#ffc861}'+
'#pk493 .b button.bag{background:#8fd0ff}#pk493 .b button.del{background:#3a4150;color:#e8eef5}#pk493 .b button:disabled{opacity:.4}';
document.head.appendChild(st);
const el=document.createElement('div');el.id='pk493';el.className='hidden';el.innerHTML='<div class="c"><div class="t"><span>Hai trovato</span><small id="pk493n"></small></div><div class="hd" id="pk493h"></div><div class="rows" id="pk493r"></div><div class="note" id="pk493note"></div><div class="b"><button id="pk493s">🔄 Scambia</button><button class="bag" id="pk493b">🎒 Metti nello zaino</button><button class="del" id="pk493d">🗑️ Scarta</button></div></div>';
document.body.appendChild(el);
const PK={mode:null,act:null};
const arrow=(n,o,lowBetter)=>{if(o==null)return '<b class="up">▲</b>';const d=lowBetter?o-n:n-o;return Math.abs(d)<1e-9?'<b class="eq">=</b>':d>0?'<b class="up">▲</b>':'<b class="dn">▼</b>';};
function row(label,nv,ov,unit,lowBetter){const cl=ov==null?'up':Math.abs(nv-ov)<1e-9?'eq':((lowBetter?ov-nv:nv-ov)>0?'up':'dn');
  return '<div class="r"><span>'+label+'</span><div class="v '+cl+'">'+nv+unit+' '+arrow(nv,ov,lowBetter)+'</div><div class="o">'+(ov==null?'—':ov+unit)+'</div></div>';}
function show(h,rows,note,can,n){document.getElementById('pk493h').innerHTML=h;document.getElementById('pk493r').innerHTML=rows;document.getElementById('pk493note').textContent=note||'';
  document.getElementById('pk493s').disabled=!can.s;document.getElementById('pk493b').disabled=!can.b;document.getElementById('pk493n').textContent=n||'';el.classList.remove('hidden');}
function hide(){el.classList.add('hidden');PK.mode=null;}
const tap=(id,f)=>{const b=document.getElementById(id);let tt=0;const go=()=>{try{f();}catch(e){E(e,'pk '+id);}};b.addEventListener('touchend',e=>{if(e.cancelable)e.preventDefault();tt=Date.now();go();},{passive:false});b.addEventListener('click',()=>{if(Date.now()-tt>600)go();});};
tap('pk493s',()=>PK.act&&PK.act('s'));tap('pk493b',()=>PK.act&&PK.act('b'));tap('pk493d',()=>PK.act&&PK.act('d'));
// ---- gear (loot452 kind 'gear') ----
function gearRender(c){const it=c.it,eq=P42.eq[it.s],R=GEAR_CFG.rar;
  const card=(g,old)=>'<div class="it'+(old?' old':'')+'" style="border-color:'+R[g.r].c+'"><i>'+GSLOT[g.s].i+'</i><div><small>'+(old?'Indossato':'Nuovo')+'</small><b style="color:'+R[g.r].c+'">'+ES(gName(g))+'</b></div></div>';
  const h='<div></div>'+card(it,false)+(eq?card(eq,true):'<div class="it old"><i>'+GSLOT[it.s].i+'</i><div><small>Indossato</small><b>— slot vuoto</b></div></div>');
  const keys=[...new Set(Object.keys(it.st||{}).concat(eq?Object.keys(eq.st||{}):[]))];let rows='';
  for(const k of keys){const L=GST_L[k]||[k,''];const u=L[1]==='%'?'%':'';rows+=row(L[0],+(it.st[k]||0),eq?+((eq.st||{})[k]||0):null,u,false);}
  rows+=row('Potenza',Math.round(gPow(it)*10)/10,eq?Math.round(gPow(eq)*10)/10:null,'',false);
  rows+='<div class="r"><span>Livello</span><div class="v '+(it.l>P42.L?'dn':'eq')+'">'+it.l+'</div><div class="o">'+(eq?eq.l:'—')+'</div></div>';
  const can={s:it.l<=P42.L,b:P42.gb.length<GEAR_CFG.bagMax};const note=!can.s?'Serve il livello '+it.l+' per indossarlo':!can.b?'Zaino equipaggiamento pieno ('+P42.gb.length+'/'+GEAR_CFG.bagMax+')':'';
  PK.mode='gear';PK.act=a=>gearAct(c,a);show(h,rows,note,can,LOOT452.q.length?'1 di '+(LOOT452.q.length+1):'');}
function gearDone(it){try{gearStats();}catch(e){}try{play('gear');}catch(e){}try{addXP(3+[0,8,20,50,150][it.r]);}catch(e){}try{gearPop(it);}catch(e){}try{save42soon();}catch(e){}try{if(window.q42)q42('gear',1);}catch(e){}try{updateHUD();}catch(e){}}
function gearAct(c,a){const it=c.it,d=c.drop;if(LOOT452.cur!==c)return;if(a==='d'){hide();loot452Discard();return;}
  if(!d||!d.on){hide();loot452Next();return;}
  if(a==='b'){if(P42.gb.length>=GEAR_CFG.bagMax){toast('Zaino equipaggiamento pieno',1300);return;}P42.gb.push(it);d.on=false;d.root.visible=false;gearDone(it);toast('🎒 '+gName(it)+' nello zaino',1100);hide();loot452Next();return;}
  if(it.l>P42.L){toast('Serve il livello '+it.l,1400);return;}const old=P42.eq[it.s];P42.eq[it.s]=it;d.on=false;d.root.visible=false;
  if(old){if(P42.gb.length<GEAR_CFG.bagMax){P42.gb.push(old);toast('🔄 Indossato · '+gName(old)+' nello zaino',1400);}else{loot452LayGear(old);toast('🔄 Indossato · '+gName(old)+' lasciato a terra',1600);}}else toast('✅ Indossato',900);
  gearDone(it);hide();loot452Next();}
{const _r=loot452Render;loot452Render=function(){const c=LOOT452.cur;if(c&&c.kind==='gear'&&c.it){try{const o=document.getElementById('loot452');if(o)o.classList.add('hidden');gearRender(c);return;}catch(e){E(e,'gearR');}}hide();return _r.apply(this,arguments);};}
{const _c=loot452Close;loot452Close=function(){if(PK.mode==='gear')hide();return _c.apply(this,arguments);};}
// ---- weapons found in crates (wcOpen467) ----
function wStats(w){return ws431Stats(w);}
wcOpen467=function(w){try{const cur=WEAPONS[curW];const base=(cur&&!cur.melee&&!cur.tool&&cur.mag)?cur:null;const A=wStats(w),B=base?wStats(base):null;
  const img=k=>{try{const u=typeof wArt482==='function'?wArt482(k):'';return u?'<img alt="" src="'+u+'">':'<i>🔫</i>';}catch(e){return '<i>🔫</i>';}};
  const h='<div></div><div class="it" style="border-color:#ffd27a">'+img(w.id)+'<div><small>Nuova</small><b style="color:#ffd27a">'+ES(w.name)+'</b></div></div>'+(base?'<div class="it old">'+img(base.id)+'<div><small>In mano</small><b>'+ES(base.name)+'</b></div></div>':'<div class="it old"><i>✋</i><div><small>In mano</small><b>— nessuna arma da fuoco</b></div></div>');
  let rows='';for(const [l,k,u] of WS431)rows+=row(l,A[k],B?B[k]:null,u?' '+u:'',k==='rel');
  WC467.w=w;WC467.open=true;game.state='wcmp467';firing=false;try{resetTouchState();}catch(e){}if(document.pointerLockElement)document.exitPointerLock();
  PK.mode='w';PK.act=a=>{hide();if(a==='d'){WC467.w=null;toast('🗑️ Scartata',900);}wcAct467(a==='s');};show(h,rows,'',{s:1,b:1},'');}catch(e){E(e,'wc');}};
{const _wa=wcAct467;wcAct467=function(){if(PK.mode==='w')hide();return _wa.apply(this,arguments);};}
try{if(window.__zs467){__zs467.wc=id=>wcOpen467(WEAPONS.find(w=>w.id===id));}}catch(e){}
window.__pk493={gear:c=>{LOOT452.q.length=0;LOOT452.cur=c;game.state='loot452';loot452Render();},hide};

// ===================== (3) new defensive buildables =====================
try{
Object.assign(PDEF,{
  caltrop493:{n:'Triboli',i:'📍',cost:{iron:3,metal:1},hp:220,cell:'o',lv:2,max:12,def493:'caltrop',parts:[['dark',0,.02,0,1.6,.03,1.6],
    ['spikeK',-.5,.1,-.5,.06,.22,.06,.5,0,0],['spikeK',.5,.1,-.5,.06,.22,.06,-.5,0,0],['spikeK',0,.1,0,.06,.22,.06,0,0,.5],['spikeK',-.5,.1,.5,.06,.22,.06,0,0,-.5],['spikeK',.5,.1,.5,.06,.22,.06,.5,0,.5],['spikeK',0,.1,-.55,.06,.22,.06,-.5,0,0],['spikeK',0,.1,.55,.06,.22,.06,.5,0,0],['spikeK',-.55,.1,0,.06,.22,.06,0,0,.5],['spikeK',.55,.1,0,.06,.22,.06,0,0,-.5]]},
  tar493:{n:'Pozza di catrame',i:'🛢️',cost:{coal:4,wood:2},hp:300,cell:'o',lv:3,max:8,def493:'tar',parts:[['dark',0,.015,0,1.8,.03,1.8],['dark',.2,.03,-.2,1.2,.02,1.1],['woodD477',-.85,.06,0,.1,.12,1.8],['woodD477',.85,.06,0,.1,.12,1.8],['woodD477',0,.06,-.85,1.8,.12,.1],['woodD477',0,.06,.85,1.8,.12,.1]]},
  thornw493:{n:'Muro chiodato',i:'🦔',cost:{wood:6,iron:4,metal:2},hp:900,edge:1,box:[2,.5],lv:4,def493:'thorn',parts:[['woodD477',0,.9,0,2,1.8,.3],['iron477',0,1.82,0,2.04,.08,.34],['iron477',0,.06,0,2.04,.12,.34]]}
});
for(const x of [-.75,-.25,.25,.75])for(const y of [.45,1.05,1.55]){PDEF.thornw493.parts.push(['spikeK',x,y,.27,.06,.3,.06,1.571,0,0],['spikeK',x,y,-.27,.06,.3,.06,-1.571,0,0]);}
const ok=k=>{const D=PDEF[k];return D.parts.every(p=>POOL[p[0]]);};
for(const k of ['caltrop493','tar493','thornw493'])if(!ok(k)){for(const p of PDEF[k].parts)if(!POOL[p[0]])p[0]=POOL.wood?'wood':Object.keys(POOL)[0];}
try{WALLISH468.add('thornw493');}catch(e){}try{WALLISH474.add('thornw493');}catch(e){}
const N=['caltrop493','tar493','thornw493'];PORDER.push(...N);
const C=k=>BCAT43.find(c=>c[0]===k);const tr=C('trappole')||C('difesa'),di=C('difesa')||tr;
if(tr){tr[2].push('caltrop493','tar493');}if(di)di[2].push('thornw493');
}catch(e){E(e,'pdef');}
const DF={t:0};
const auth=()=>{try{const M=window.MP&&MP.M;return !(M&&M.inMatch&&!M.host);}catch(e){return true;}};
{const _t=svTarget;svTarget=function(z){const r=_t(z);if(z.slow493>0)z.spdMul=(z.spdMul||1)*z.slow493k;return r;};}
function defTick(dt){if(typeof SV==='undefined'||!SV.on)return;for(const z of zombies)if(z.slow493>0)z.slow493-=dt;DF.t+=dt;if(DF.t<.1)return;const s=DF.t;DF.t=0;const A=auth();
  for(const p of PIECES){if(!p.alive)continue;const D=PDEF[p.type];if(!D||!D.def493)continue;const kind=D.def493;let used=0;
    for(const z of zombies){if(!z.alive||z.dead)continue;const dx=z.g.position.x-p.x,dz=z.g.position.z-p.z;const boss=z.V&&z.V.name==='boss';
      if(kind==='caltrop'){if(Math.abs(dx)<.9&&Math.abs(dz)<.9){z.slow493=.3;z.slow493k=.55;if(A){z.hp-=14*s*(boss?.5:1);z.flash=.04;used+=1;if(z.hp<=0){_tmp.set(dx||.01,0,dz).normalize();killZombie(z,_tmp.clone(),4,false);try{feed('📍 Triboli: zombie eliminato');}catch(e){}}}}}
      else if(kind==='tar'){if(Math.abs(dx)<1&&Math.abs(dz)<1){z.slow493=.4;z.slow493k=boss?.6:.28;used+=.3;if(A&&z.burn>0){z.hp-=10*s;}}}
      else if(kind==='thorn'){const along=(p.rot|0)%2===0,u=along?dx:dz,v=along?dz:dx;if(Math.abs(u)<1.15&&Math.abs(v)<.85){if(A){z.hp-=22*s*(boss?.5:1);z.flash=.04;if(Math.random()<.15)try{emit(_tmp.set(z.g.position.x,1,z.g.position.z),_up,2,BLOOD,{speed:1.2,spread:.8,life:.4,size:.04,grav:9});}catch(e){}if(z.hp<=0){_tmp.set(dx||.01,0,dz).normalize();killZombie(z,_tmp.clone(),5,false);try{feed('🦔 Muro chiodato: zombie eliminato');}catch(e){}}}}}}
    if(A&&used>0){try{damagePiece(p,used*s*3);}catch(e){p.hp-=used*s*3;if(p.hp<=0)try{removePiece(p);}catch(_){}}}}}
{const _l0=loop0;let lt=0;loop0=function(now){try{const dt=lt?Math.min(.1,(now-lt)/1000):0;lt=now;if(game.state==='play'&&dt>0)defTick(dt);}catch(e){E(e,'def');}return _l0(now);};}

// ===================== (4) ammo craft: material chips =====================
const st2=document.createElement('style');st2.textContent=
'#bag484 .pn.det{display:flex!important;flex-direction:column!important;overflow:hidden!important}#bag484 .pn.det .ac486{margin-top:auto!important;flex:0 0 auto!important;padding-top:4px}'+
'#bag484 .ac486 button{height:auto!important;min-height:30px!important;padding:3px 8px!important;white-space:normal!important}#bag484 .ac486 .cc493{margin:0 0 3px}'+
'#bag484 .ac486 button[disabled]{filter:none!important;background:#3a4150!important;color:#c9d2e4!important;box-shadow:none!important}.hv493{display:none}#bag484 .ac486 .hv493{display:inline;font-style:normal}#bag484 .ac486 button small{display:flex!important;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:3px!important;opacity:1!important}#bag484 .ac486 button{flex-direction:column}'+
'#bag484 .ac486 button small span,#bag484 .ac486 .cc493 span{display:inline-flex;align-items:center;gap:2px;padding:1px 6px;border-radius:8px;background:rgba(0,0,0,.35);font:800 12px system-ui,sans-serif;color:#e8f6e8;border:1px solid rgba(95,224,138,.55)}'+
'#bag484 .ac486 button small span.miss,#bag484 .ac486 .cc493 span.miss{color:#ffb0a8;border-color:#ff6b5e;background:rgba(120,20,10,.45)}'+
'#bag484 .pn.det>*{flex-shrink:0}#bag484 .pn.det .bi{flex:1 1 0!important;min-height:28px!important;height:auto!important}#bag484 .pn.det .bi img{max-height:100%!important;height:100%!important;object-fit:contain}#bag484 .pn.det:has(.ac486) .ds{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}';
document.head.appendChild(st2);
function costOf(a){try{if(a==='nade')return NADE_COST;if(a==='band')return {wood:2,coal:1};if(a.startsWith('ammo:')){const w=WEAPONS[+a.slice(5)];return w&&w.cost;}if(a.startsWith('tool:')){const k=a.slice(5);return TOOL_UP[(SV.tools[k]|0)+1];}}catch(e){}return null;}
function chips(){return;try{const root=document.getElementById('bag484');if(!root)return;for(const b of root.querySelectorAll('.ac486 button[data-act486]')){if(b.previousElementSibling&&b.previousElementSibling.classList.contains('cc493'))continue;const c=costOf(b.dataset.act486);if(!c)continue;
    let h='<div class="cc493">';for(const k in c){if(!(c[k]>0))continue;const have=(inv[k]|0),need=c[k],R=RES[k]||{i:k,n:k};h+='<span class="'+(have>=need?'':'miss')+'" title="'+ES(R.n)+'">'+R.i+' '+have+'/'+need+'</span>';}b.insertAdjacentHTML('beforebegin',h+'</div>');}}catch(e){E(e,'chips');}}
const hk0=()=>{const r=document.getElementById('bag484');if(!r)return false;mo=new MutationObserver(()=>{if(!r.querySelector('.ac486 button:not(.d493)'))return;for(const b of r.querySelectorAll('.ac486 button'))b.classList.add('d493');chips();});mo.observe(r,{childList:true,subtree:true});chips();return true;};
window.__chips493=chips;setInterval(()=>{try{const r=document.getElementById('bag484');if(r&&r.getClientRects().length&&r.querySelector('.ac486 button:not(.d493)')){for(const b of r.querySelectorAll('.ac486 button'))b.classList.add('d493');chips();}}catch(e){}},250);

// ===================== (5) leaderboard during the loading screen =====================
try{const boot=()=>{try{if(typeof ZS_API==='undefined'||!ZS_API)return;
    const top=()=>{try{ONL439.t=0;zs439Top(d=>{try{const ss=document.getElementById('startScreen');if(d&&ss&&!ss.classList.contains('hidden'))renderMini();}catch(e){}});}catch(e){}};
    top();// list right away (6 s abort inside zs439Top)
    let reg=null;try{if(!(typeof id482Tg==='function'&&id482Tg()))reg=id482Register();}catch(e){}
    const fl=()=>{try{zs439Flush();}catch(e){}setTimeout(top,1200);};
    if(reg&&reg.then){let done=0;const t=setTimeout(()=>{if(!done){done=1;fl();}},5000);reg.then(()=>{if(!done){done=1;clearTimeout(t);fl();}},()=>{if(!done){done=1;clearTimeout(t);fl();}});}else fl();
  }catch(e){E(e,'lbboot');}};
  setTimeout(boot,0);
  // home appears: paint whatever is cached immediately
  const _sm=showMenu;showMenu=function(){const r=_sm.apply(this,arguments);try{if(ONL439.data)zs439PaintMini(ONL439.data);}catch(e){}return r;};
}catch(e){E(e,'lb');}
})();
try{const _rb=window.renderBag;if(typeof _rb==='function'){const f=function(){const r=_rb.apply(this,arguments);try{const R=document.getElementById('bag484');if(R)for(const b of R.querySelectorAll('.ac486 button'))b.classList.add('d493');}catch(e){}try{window.__chips493&&__chips493();}catch(e){}return r;};window.renderBag=f;try{renderBag=f;}catch(e){}}}catch(e){}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#bag484'))[0,60,200].forEach(t=>setTimeout(()=>{try{window.__chips493&&__chips493();}catch(_){}},t));},true);

try{costTxt=function(c){return Object.keys(c).filter(k=>c[k]>0).map(k=>{const h=inv[k]|0;return '<span class="'+(h>=c[k]?'':'miss')+'">'+RES[k].i+'<i class="hv493">'+h+'/</i>'+c[k]+'</span>';}).join(' ');};}catch(e){}
