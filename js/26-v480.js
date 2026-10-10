'use strict';
// ======================= v4.3.80: map fixes, roofs you can climb, manholes + road signs, better lamps, roaches only in abandoned houses, swap screen, deposit with partial amounts, entry hitch cover, loading screen =======================
const M480={on:true,err:0};function e480(e,w){M480.err++;try{console.warn('480',w,e&&e.message);}catch(_){}try{window.__DBG&&__DBG.prob('err','v480',w+': '+(e&&e.message||e));}catch(_){}if(M480.err>80)M480.on=false;}
const Q480=()=>{try{return GQ();}catch(e){return 'media';}};

// ---------- ground height (roads .025, sidewalks .11, soil patches): coins, drops and critters sit ON the surface ----------
const GH480={f:null};
function gh480(x,z){try{if(!GH480.f){const C=window.CITY4319;if(C&&typeof C.groundHeight==='function')GH480.f=C.groundHeight;else return 0;}return GH480.f(x,z)||0;}catch(e){return 0;}}
{const _cu=coinsUpd;coinsUpd=function(dt){_cu(dt);if(!M480.on)return;try{for(const c of COINS){if(!c.on)continue;
    if(c.g480===undefined||c.st!==3||Math.abs(c.x-c.gx480)>.2||Math.abs(c.z-c.gz480)>.2){c.g480=gh480(c.x,c.z);c.gx480=c.x;c.gz480=c.z;}
    // lying coins sat at y .02, i.e. under the asphalt (.025) and well under the sidewalks (.11): lift them onto the surface
    const lift=c.g480+(c.st===3?.012:0);if(lift>0)c.m.position.y+=lift;}}catch(e){e480(e,'coins');}};}
{const _pp=placePickup;placePickup=function(p){_pp(p);try{if(M480.on)p.root.position.y=gh480(p.x,p.z);}catch(e){}};}
try{for(const p of pickups)if(p.root&&p.active)p.root.position.y=gh480(p.x,p.z);}catch(e){}
{const _sd=spawnDrop;spawnDrop=function(type,x,z){const r=_sd.apply(this,arguments);try{if(r&&M480.on)for(const d of drops)if(d.on&&d.type===type&&d.root.position.y===0)d.root.position.y=gh480(d.x,d.z);}catch(e){}return r;};}
{const _gd=gearDropAt;gearDropAt=function(it,x,z){const r=_gd.apply(this,arguments);try{if(M480.on)for(const d of GD)if(d.on&&d.it===it)d.root.position.y=gh480(d.root.position.x,d.root.position.z);}catch(e){}return r;};}

// ---------- found loot: clearer comparison, and "Scarta" really removes the drop ----------
function cmp480(it){try{const eq=P42.eq[it.s];if(!eq)return '<div class="c480"><div class="c480r"><span>Slot '+esc(GSLOT[it.s].n)+'</span><b class="up">vuoto · lo puoi indossare</b></div></div>';
    const a=gPow(it),b=gPow(eq),d=Math.round((a-b)*10)/10,cl=d>0?'up':d<0?'dn':'eq';
    return '<div class="c480"><div class="c480h"><span>Nuovo</span><span></span><span>Indossato</span></div>'+
      '<div class="c480r"><b style="color:'+GEAR_CFG.rar[it.r].c+'">'+esc(gName(it))+'</b><i>vs</i><b style="color:'+GEAR_CFG.rar[eq.r].c+'">'+esc(gName(eq))+'</b></div>'+
      '<div class="c480r"><small>'+esc(gStatTxt(it))+'</small><i></i><small>'+esc(gStatTxt(eq))+'</small></div>'+
      '<div class="c480r"><small>Liv. '+it.l+'</small><i></i><small>Liv. '+eq.l+'</small></div>'+
      '<div class="c480d '+cl+'">'+(d>0?'▲ +'+d+' più forte':d<0?'▼ '+d+' più debole':'= uguale')+'</div></div>';}catch(e){return '';}}
{const _lc=loot452Card;loot452Card=function(c){let h=_lc(c);try{if(M480.on&&c&&c.kind==='gear'&&c.it)h+=cmp480(c.it);else if(M480.on&&c&&c.kind==='mat'){const U=USE480[c.k];if(U)h+='<div class="c480"><div class="c480u">🔧 Serve per: '+esc(U)+'</div></div>';}}catch(e){}return h;};}
function gone480(c){try{if(c.kind==='gear'&&c.drop){const d=c.drop;d.on=false;d.skip=0;if(d.root)d.root.visible=false;}
    else if(c.kind==='mat'&&c.src){const p=c.src;p.hold452=0;p.active=false;p.fly=0;if(p.root)p.root.visible=false;p.timer=40+Math.random()*30;}}catch(e){e480(e,'gone');}}
{const _ld=loot452Discard;loot452Discard=function(){const c=LOOT452.cur;if(!M480.on||!c)return _ld();gone480(c);
  if(c.kind==='gear'&&c.it){const v=[5,15,40,100,250][c.it.r]||5;try{addCoins(v);}catch(e){}toast('Scartato: sparito · +'+v+' 🪙',1100);}else toast('Scartato',800);try{play('pickup',2);}catch(e){}loot452Next();};}
{const _la=loot452DiscardAll;loot452DiscardAll=function(){if(!M480.on)return _la();const left=[LOOT452.cur].concat(LOOT452.q).filter(Boolean);for(const c of left)gone480(c);LOOT452.q.length=0;loot452Close();};}
// relabel the buttons + a hint line
{const _le=loot452El;loot452El=function(){const e=_le();try{if(!e.dataset.v480){e.dataset.v480=1;const s=document.getElementById('loot452swap'),d=document.getElementById('loot452drop');if(s)s.innerHTML='✅ Prendi / Cambia';if(d)d.innerHTML='🗑️ Scarta (sparisce)';
    const l=e.querySelector('.loot452lab');if(l)l.textContent='Scegli dove metterlo · Scarta lo elimina dal terreno';}}catch(er){}return e;};}

// ---------- every item has a use: shown in the deposit, the swap screen and the bag ----------
const USE480={wood:'muri, porte, fuoco, bende (con carbone), carbonaia',stone:'fondamenta, muri in pietra, Hesco, sacchi di sabbia',iron:'metallo (2 ferro + 1 carbone), cancelli, armi',
  coal:'carburante del generatore, metallo, bende',metal:'difese, torrette, porte blindate, riparazioni',elec:'luci, generatore, Tesla, torrette, lampade'};

// ---------- deposit: one card per resource, choose an amount (− / + / ½ / tutto or slider), then Deposita or Preleva ----------
const CH480={q:{},css:0};
function chCss480(){if(CH480.css)return;CH480.css=1;const s=document.createElement('style');s.id='v480css';s.textContent=
 '#chRows.ch480{display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:8px;margin:8px 0}'+
 '.ch480c{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px 9px;display:flex;flex-direction:column;gap:6px}'+
 '.ch480t{display:flex;align-items:center;gap:8px}.ch480t i{font-style:normal;font-size:24px;line-height:1}.ch480t b{font-size:14px}.ch480t small{display:block;font-size:10.5px;opacity:.62;line-height:1.2}'+
 '.ch480n{display:flex;justify-content:space-between;font-size:12px;opacity:.9}.ch480n span b{font-size:13px}'+
 '.ch480q{display:flex;align-items:center;gap:4px}.ch480q button{min-width:30px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-weight:800;font-size:13px;padding:0 6px}'+
 '.ch480q input[type=range]{flex:1;min-width:40px;accent-color:#ffb347}.ch480q output{min-width:34px;text-align:center;font-weight:900;font-size:14px}'+
 '.ch480a{display:grid;grid-template-columns:1fr 1fr;gap:6px}.ch480a button{height:32px;border-radius:9px;border:0;font-weight:800;font-size:12.5px;color:#10131a;background:#ffc861}.ch480a button.wd{background:#8fd0ff}.ch480a button:disabled{opacity:.35}'+
 '.c480{margin-top:8px;padding:8px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.1);font-size:12px}'+
 '.c480h,.c480r{display:grid;grid-template-columns:1fr 26px 1fr;gap:4px;align-items:center;text-align:center}.c480h{opacity:.6;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase}.c480r i{opacity:.55;font-style:normal}.c480r small{opacity:.8}'+
 '.c480d{margin-top:6px;text-align:center;font-weight:900;font-size:13px}.c480d.up,.c480r .up{color:#8dff8d}.c480d.dn{color:#ff8a7a}.c480d.eq{color:#ddd}.c480u{opacity:.9}'+
 '#chestScreen .btnRow #chAllW{background:#8fd0ff;color:#10131a}';document.head.appendChild(s);}
function chQ480(k,mode){const room=mode==='d'?Math.min(inv[k]|0,chestCap()-chestCount()):Math.min(SV.chest[k]|0,bagCap()-bagCount());return Math.max(0,room);}
function chMove480(k,dep,n){n=Math.floor(n);if(!(n>0))return;if(dep){n=Math.min(n,inv[k]|0,chestCap()-chestCount());if(n<=0){toast('Cassa piena',900);return;}inv[k]-=n;SV.chest[k]=(SV.chest[k]|0)+n;}
  else{n=Math.min(n,SV.chest[k]|0,bagCap()-bagCount());if(n<=0){toast('Zaino pieno',900);return;}SV.chest[k]-=n;inv[k]=(inv[k]|0)+n;}
  try{play('pickup',dep?1:2);}catch(e){}toast((dep?'📦 Depositati ':'🎒 Prelevati ')+n+' '+RES[k].i+' '+RES[k].n,900);renderChest();updateHUD();}
function chCard480(k){const b=inv[k]|0,c=SV.chest[k]|0,mx=Math.max(b,c,1);let q=CH480.q[k];if(q==null)q=Math.max(1,Math.min(10,mx));q=Math.max(1,Math.min(mx,q|0));CH480.q[k]=q;
  return '<div class="ch480c" data-k480="'+k+'"><div class="ch480t"><i>'+RES[k].i+'</i><div><b>'+RES[k].n+'</b><small>Serve per: '+esc(USE480[k]||'—')+'</small></div></div>'+
    '<div class="ch480n"><span>🎒 Zaino <b>'+b+'</b></span><span>📦 Cassa <b>'+c+'</b></span></div>'+
    '<div class="ch480q"><button type="button" data-a480="m">−</button><input type="range" min="1" max="'+mx+'" step="1" value="'+q+'" data-a480="r"><output>'+q+'</output><button type="button" data-a480="p">+</button><button type="button" data-a480="h">½</button><button type="button" data-a480="t">Tutto</button></div>'+
    '<div class="ch480a"><button type="button" data-a480="dep"'+(b&&chestCount()<chestCap()?'':' disabled')+'>Deposita '+Math.min(q,b||q)+' →</button><button type="button" class="wd" data-a480="wd"'+(c&&bagCount()<bagCap()?'':' disabled')+'>← Preleva '+Math.min(q,c||q)+'</button></div></div>';}
function chSync480(card,k){const q=CH480.q[k],b=inv[k]|0,c=SV.chest[k]|0;const o=card.querySelector('output'),r=card.querySelector('input[type=range]'),d=card.querySelector('[data-a480=dep]'),w=card.querySelector('[data-a480=wd]');
  if(o)o.textContent=q;if(r&&+r.value!==q)r.value=q;if(d)d.textContent='Deposita '+Math.min(q,b||q)+' →';if(w)w.textContent='← Preleva '+Math.min(q,c||q);}
{const _rc=renderChest;renderChest=function(){_rc();if(!M480.on)return;try{chCss480();const el=$('chRows');el.classList.add('ch480');el.innerHTML=RES_K.map(chCard480).join('');
    const row=document.querySelector('#chestScreen .btnRow');if(row&&!document.getElementById('chAllW')){const b=document.createElement('button');b.className='act';b.id='chAllW';b.type='button';b.textContent='Preleva tutto';row.insertBefore(b,row.lastElementChild);
      b.addEventListener('click',()=>{for(const k of RES_K)if(SV.chest[k])chMove480(k,false,SV.chest[k]|0);});}}catch(e){e480(e,'chest');}};
  const root=document.getElementById('chRows');
  if(root){root.addEventListener('click',e=>{if(!M480.on)return;const b=e.target.closest('[data-a480]');if(!b||b.tagName==='INPUT')return;const card=b.closest('[data-k480]');if(!card)return;const k=card.dataset.k480,a=b.dataset.a480;
      const mx=Math.max(inv[k]|0,SV.chest[k]|0,1);let q=CH480.q[k]|0||1;
      if(a==='m')q=Math.max(1,q-(q>20?5:1));else if(a==='p')q=Math.min(mx,q+(q>=20?5:1));else if(a==='h')q=Math.max(1,Math.ceil(mx/2));else if(a==='t')q=mx;
      else if(a==='dep'){chMove480(k,true,q);return;}else if(a==='wd'){chMove480(k,false,q);return;}CH480.q[k]=q;chSync480(card,k);});
    root.addEventListener('input',e=>{const r=e.target;if(!r||r.dataset.a480!=='r')return;const card=r.closest('[data-k480]');if(!card)return;const k=card.dataset.k480;CH480.q[k]=Math.max(1,r.value|0);chSync480(card,k);});}}

// ---------- cockroaches: only in abandoned houses (never in your shelter, your base or the survivor clearing), they bolt and hide when you come close ----------
const AB480={list:null,city:null,t:0};
function abHouses480(){const C=window.CITY4319;if(AB480.list&&AB480.city===C&&performance.now()-AB480.t<15000)return AB480.list;const out=[];AB480.city=C;AB480.t=performance.now();
  try{const base=PIECES.filter(p=>p.alive);if(C&&C.plots)for(const q of C.plots){if(!q.enterable||q.kind!=='home'||/RIFUGIO/i.test(q.label||''))continue;
      const R=[q.x-q.w/2+.45,q.x+q.w/2-.45,q.z-q.d/2+.45,q.z+q.d/2-.45];
      if(R[1]>-146&&R[0]<-98&&R[3]>52&&R[2]<92)continue;// survivor clearing ("Rifugio")
      let mine=false;for(const p of base)if(p.x>R[0]-10&&p.x<R[1]+10&&p.z>R[2]-10&&p.z<R[3]+10){mine=true;break;}if(mine)continue;out.push(R);}}catch(e){e480(e,'abh');}
  AB480.list=out;return out;}
function inAb480(x,z){for(const R of abHouses480())if(x>R[0]&&x<R[1]&&z>R[2]&&z<R[3])return R;return null;}
nestSpot477=function(px,pz,forceIn){const r=Math.random,H=abHouses480();const near=H.filter(R=>Math.hypot((R[0]+R[1])/2-px,(R[2]+R[3])/2-pz)<40);const mine=inAb480(px,pz);
  if(!near.length&&!mine)return null;
  for(let t=0;t<14;t++){const R=forceIn&&mine?mine:(mine&&r()<.55?mine:near[(r()*near.length)|0]);if(!R)return null;
    // along a wall or in a corner (where they live), never in the open middle
    const side=(r()*4)|0,e=.12+r()*.25;let x,z;if(r()<.3){x=r()<.5?R[0]+e:R[1]-e;z=r()<.5?R[2]+e:R[3]-e;}
    else if(side<2){x=R[0]+.5+r()*(R[1]-R[0]-1);z=side?R[2]+e:R[3]-e;}else{z=R[2]+.5+r()*(R[3]-R[2]-1);x=side===2?R[0]+e:R[1]-e;}
    if(Math.hypot(x-px,z-pz)<3.2)continue;return {x,z,y:gh480(x,z),r:R};}return null;};
// purge nests that are now in a non-abandoned place (old save state, base built later)
function roachPurge480(){try{for(const ne of RC477.nests){if(!ne.on)continue;if(!inAb480(ne.x,ne.z))ne.on=false;}}catch(e){}}
roachTick477=function(dt,t,play){const L=RC477.list;if(!L.length||!RC477.mesh)return;RC477.U.value=t%600;const px=player.pos.x,pz=player.pos.z,run=player.moveAmt>1.05,mv=player.moveAmt>.08;
  RC477.chk-=dt;if(RC477.chk<=0){RC477.chk=1.2;roachPurge480();const mine=inAb480(px,pz);let haveIn=false;for(const ne of RC477.nests)if(ne.on&&mine&&ne.r===mine)haveIn=true;
    for(const ne of RC477.nests){const d=Math.hypot(ne.x-px,ne.z-pz);let want=!ne.on||(d>40&&!inView477(ne.x,ne.z));let force=false;if(!want&&mine&&!haveIn&&d>12&&!inView477(ne.x,ne.z)){want=true;force=true;}
      if(!want)continue;const s=nestSpot477(px,pz,force);if(!s){if(!ne.on)continue;if(d>40)ne.on=false;continue;}if(force)haveIn=true;Object.assign(ne,{x:s.x,z:s.z,y:s.y,r:s.r,on:true});
      for(const v of L)if(v.n===ne){const a=Math.random()*6.28,dd=Math.random()*.45;v.x=clamp(ne.x+Math.cos(a)*dd,s.r[0]+.05,s.r[1]-.05);v.z=clamp(ne.z+Math.sin(a)*dd,s.r[2]+.05,s.r[3]-.05);v.yaw=Math.random()*6.28;v.st=0;v.run=0;v.v=0;v.hid=0;v.sc=.8+Math.random()*.45;}}}
  const o=RC477.o,m=RC477.mesh;let k=0;
  for(const v of L){const ne=v.n;if(!ne.on||!ne.r)continue;const R=ne.r;
    if(v.hid>0){v.hid-=dt;if(v.hid>0)continue;// come back out of the crack near the nest
      const a=Math.random()*6.28;v.x=clamp(ne.x+Math.cos(a)*.3,R[0]+.05,R[1]-.05);v.z=clamp(ne.z+Math.sin(a)*.3,R[2]+.05,R[3]-.05);v.run=0;v.v=0;}
    const dx=v.x-px,dz=v.z-pz,d=Math.hypot(dx,dz);if(d>24)continue;
    // you come close (walking: 3.2 m, running: 4.6 m) -> they bolt away from you, toward the nearest wall, and vanish into it
    const fr=run?4.6:mv?3.2:2.2;
    if(play&&d<fr&&v.run<=0){v.run=1.6+Math.random()*1.2;const away=Math.atan2(dx,dz);
      const wx=[R[0]-v.x,R[1]-v.x],wz=[R[2]-v.z,R[3]-v.z];let best=null,bd=1e9;
      for(const c of [[wx[0],0],[wx[1],0],[0,wz[0]],[0,wz[1]]]){const l=Math.abs(c[0]+c[1]);if(l<.02)continue;const ya=Math.atan2(c[0],c[1]);let df=Math.abs(Math.atan2(Math.sin(ya-away),Math.cos(ya-away)));const sc=l+df*1.4;if(sc<bd){bd=sc;best=ya;}}
      v.yaw=(best==null?away:best)+(Math.random()-.5)*.5;v.v=2.1+Math.random()*1.1;}
    let sp=0;if(v.run>0){v.run-=dt;v.yaw+=(Math.random()-.5)*dt*6;v.v=Math.max(1.1,v.v-dt*.6);sp=v.v;}
    else{v.t-=dt;if(v.t<=0){const u=Math.random();v.t=u<.55?.4+Math.random()*1.8:.1+Math.random()*.35;v.v=u<.55?0:.12+Math.random()*.4;
        const hd=Math.hypot(ne.x-v.x,ne.z-v.z);v.yaw=hd>.8?Math.atan2(ne.x-v.x,ne.z-v.z)+(Math.random()-.5)*.9:v.yaw+(Math.random()-.5)*2.6;if(Math.random()<.07)v.v=.9;}sp=v.v;}
    if(sp>0){let nx=v.x+Math.sin(v.yaw)*sp*dt,nz=v.z+Math.cos(v.yaw)*sp*dt;let hit=false;
      if(nx<R[0]+.03||nx>R[1]-.03){hit=true;nx=clamp(nx,R[0]+.03,R[1]-.03);v.yaw=-v.yaw;}if(nz<R[2]+.03||nz>R[3]-.03){hit=true;nz=clamp(nz,R[2]+.03,R[3]-.03);v.yaw=Math.PI-v.yaw;}
      v.x=nx;v.z=nz;if(hit&&v.run>0&&Math.random()<.7){v.hid=7+Math.random()*9;v.run=0;continue;}}
    const s=v.sc||1;o.position.set(v.x,ne.y+.002,v.z);o.rotation.set(0,v.yaw,0);o.scale.setScalar(s);o.updateMatrix();m.setMatrixAt(k,o.matrix);RC477.mv.setX(k,sp>0?Math.min(1,sp*1.2):0);k++;}
  m.count=Math.max(1,k);if(!k){o.scale.setScalar(0);o.updateMatrix();m.setMatrixAt(0,o.matrix);}m.instanceMatrix.needsUpdate=true;RC477.mv.needsUpdate=true;};
// a skitter sound when a group scatters close to you
{let sT=0;const _rt=roachTick477;roachTick477=function(dt,t,play){_rt(dt,t,play);try{sT-=dt;if(!play||sT>0)return;let n=0;const px=player.pos.x,pz=player.pos.z;for(const v of RC477.list)if(v.run>1.3&&v.n.on&&Math.hypot(v.x-px,v.z-pz)<4)n++;
  if(n>=3){sT=2.5;const c=AU.ctx;if(!c)return;const t0=c.currentTime;for(let i=0;i<7;i++)osc(t0+i*.035+Math.random()*.02,.02,.025,'square',2600+Math.random()*1800,1800);}}catch(e){}};}

// ---------- zombies over the whole city (the day "haunts" were the old small map, all within 45 m of the centre) + a few more ----------
try{const C=window.CITY4319;if(C&&C.extent){const H=[];for(const x of [-140,-100,-57,-12,20,57,96,140])for(const z of [-140,-110,-72,-30,10,40,72,110,140]){if(x<-95&&x>-150&&z>45&&z<100)continue;H.push([x,z]);}
    if(typeof W476!=="undefined"&&W476.cem)H.push([W476.cem.x,W476.cem.z]);if(typeof W476!=="undefined"&&W476.park)H.push([W476.park.x,W476.park.z]);DAY_HAUNT.length=0;for(const h of H)DAY_HAUNT.push(h);}}catch(e){e480(e,'haunt');}
{const _mx=svMaxAlive;svMaxAlive=function(){const b=_mx();try{if(!M480.on||(ARENA454&&ARENA454.on))return b;return Math.round(b*(Q480()==='bassa'?1.08:1.18));}catch(e){return b;}};}
// keep new spawns away from where the others already are, so they don't all pile up in one block
{const _ss=svSpawnPos;svSpawnPos=function(r0,r1,cx,cz){if(!M480.on)return _ss(r0,r1,cx,cz);let best=null,bs=-1;
  for(let i=0;i<3;i++){const q=_ss(r0,r1,cx,cz);if(!q)continue;let near=0;for(const z of zombies)if(z.alive&&!z.dead){const dx=z.g.position.x-q.x,dz=z.g.position.z-q.z;if(dx*dx+dz*dz<196)near++;}
    const sc=10-near+Math.random();if(sc>bs){bs=sc;best=q;}if(!near)break;}return best;};}

// ---------- entering the game: cover the first frames (shadow bake, first texture uploads, programs) on every start, not only the first ----------
{const _sg=startGame;startGame=function(){const again=!!LD431.played;const r=_sg.apply(this,arguments);
  try{if(M480.on&&again&&!/[?&]noload431/.test(location.search)&&!LD431.on&&!LD431.hold){ld431Show('Entro in partita…');ld431Set(.86,'Entro in partita…');
      LD432.cv={n:0,ok:0,prog:(renderer.info.programs?renderer.info.programs.length:0),t:performance.now()};LD431.cover=1;try{renderer.shadowMap.needsUpdate=true;}catch(e){}}}catch(e){e480(e,'cover');}return r;};}
// rotate tips while the loader is up (match warm-up included), with a soft fade
LD431_TIPS.push('💡 Nella Cassa deposito puoi mettere o ritirare solo una parte: usa − / + / ½ / Tutto.','💡 Alcuni palazzi hanno una scala esterna: dal tetto vedi arrivare l\'orda.',
  '💡 Le lampade fanno luce a tutta la stanza: una basta per una casetta.','💡 Gli scarafaggi vivono nelle case abbandonate: entra piano, scappano appena ti avvicini.',
  '💡 Scarta un oggetto trovato e sparisce dal terreno: l\'equipaggiamento scartato ti dà qualche moneta.','💡 Ogni risorsa serve a qualcosa: guarda "Serve per" nella cassa.',
  '💡 La campana d\'allarme suona quando uno zombie si avvicina alla base di notte.','💡 L\'orto ti cura quando il raccolto è pronto, lo scaffale allarga il deposito.');
{let iv=0;const _sh=ld431Show;ld431Show=function(t){_sh(t);try{if(!iv)iv=setInterval(()=>{if(!LD431.on){clearInterval(iv);iv=0;return;}const e=ld431El(),tp=e&&e.querySelector('.ldTip');if(!tp)return;tp.style.opacity=0;setTimeout(()=>{try{ld431Tip();}catch(_){}tp.style.opacity=.92;},300);},4200);}catch(e){}};}
try{const d=ld431El();if(d){const t=d.querySelector('.ldTip');if(t&&Math.random()<.9){LD431.tipI=(Math.random()*LD431_TIPS.length)|0;t.textContent=LD431_TIPS[LD431.tipI];}}}catch(e){}

// ---------- house lamps: one lamp lights a small room (warm, soft wide falloff, no glare) + a soft pool of light on the floor ----------
const HL480={pool:null};
try{HL480.pool=new T.Mesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:softTex466,color:0xffcf8a,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3}));
  HL480.pool.renderOrder=4;HL480.pool.frustumCulled=false;HL480.pool.position.set(0,-60,0);scene.add(HL480.pool);}catch(e){e480(e,'hlpool');}
{const _l=lights28;lights28=function(t){_l(t);if(!M480.on)return;try{const P=HL480.pool;if(!SV.on){if(P)P.material.opacity=0;return;}
    let best=null,bd=16;for(const p of PIECES){if(!p.alive)continue;const D=PDEF[p.type];if(!D||!(D.lamp||D.fire))continue;const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(d<bd){bd=d;best=p;}}
    if(!best){if(P)P.material.opacity=0;fireLight.decay=1.6;return;}const D=PDEF[best.type],warm=D.fire||best.type==='torch'||best.type==='stove'||best.type==='camino';
    if(warm){fireLight.decay=1.6;if(P)P.material.opacity=0;return;}
    const nf=nightF(),hang=best.type==='luce',y=litY28(best,D),fl=(best.lift477||0)+gh480(best.x,best.z);
    // lower decay = light reaches the walls of a 6x6 room evenly; a bit under the shade so the hot spot is not in your face
    fireLight.position.set(best.x,y-.22+fl,best.z);fireLight.color.setHex(0xffd49a);fireLight.decay=1.05;fireLight.distance=hang?12:13.5;
    fireLight.intensity=(hang?5.2:5.8)*(.45+.75*nf)*(.97+.03*Math.sin((t||0)*3.1));
    for(const s of L28)if(Math.abs(s.position.x-best.x)<.01&&Math.abs(s.position.z-best.z)<.01){s.material.opacity*=hang?.62:.7;s.scale.multiplyScalar(.85);}
    if(P){const r=hang?7.5:8.5;P.scale.set(r,1,r);P.position.set(best.x,fl+.03,best.z);P.material.opacity=(.07+.17*nf)*Math.max(0,1-bd/16);}}catch(e){e480(e,'hl');}};}

// ---------- street lamps: warmer, nicer light pools on the asphalt, a couple of dying lamps that flicker ----------
const SL480={done:0,fl:[],c:new T.Color()};
function slTex480(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  let r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,'rgba(255,255,255,.82)');r.addColorStop(.45,'rgba(255,255,255,.36)');r.addColorStop(.75,'rgba(255,255,255,.1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);
  // faint grain so the pool reads as light on a rough surface, not a flat sticker
  const id=g.getImageData(0,0,256,256),d=id.data;let s=480;for(let i=0;i<d.length;i+=4){s=(s*16807)%2147483647;const k=.9+(s/2147483647)*.2;d[i+3]=Math.min(255,d[i+3]*k);}g.putImageData(id,0,0);
  const t=new T.CanvasTexture(c);return t;}
function slTick480(dt,t){const L=MOOD466&&MOOD466.lamps;if(!L||!L.pool)return;
  if(!SL480.done){SL480.done=1;try{L.pool.material.map=slTex480();L.pool.material.color.setHex(0xffc27a);L.pool.material.needsUpdate=true;
      const n=L.n,k=Math.max(1,Math.round(n*.06));for(let j=0;j<k;j++){const i=(Math.random()*n)|0;const M=new T.Matrix4();L.pool.getMatrixAt(i,M);SL480.fl.push({i,ph:Math.random()*9,b:1,M});}
      L.halo.material.color.setHex(0xffcf86);}catch(e){e480(e,'sl');}}
  // dying lamps: the light pool shrinks and comes back (matrix only: no new shader variant)
  if(!SL480.fl.length)return;let ch=false;
  for(const f of SL480.fl){f.ph-=dt;if(f.ph<=0){f.ph=Math.random()<.3?.05+Math.random()*.12:.4+Math.random()*3.2;const nb=f.b>.5&&Math.random()<.6?.3:1;if(nb!==f.b){f.b=nb;_m466.copy(f.M);if(nb<1){_m466.elements[0]*=nb;_m466.elements[10]*=nb;}L.pool.setMatrixAt(f.i,_m466);ch=true;}}}
  if(ch)L.pool.instanceMatrix.needsUpdate=true;}

// ---------- manholes (flush with the asphalt, no collider) and road signs (real poles with a thin collider), all merged ----------
const RD480={mh:null,sg:null,poles:null,n:0,s:0};
function clear480(x,z,r){for(const b of boxes)if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r)return false;for(const c of circles){if(c.off)continue;const m=c.r+r;if((x-c.x)*(x-c.x)+(z-c.z)*(z-c.z)<m*m)return false;}return true;}
function quads480(list,y0){// list: [cx,y,cz,w,h,yaw,u0,u1,flat]
  const n=list.length,pos=new Float32Array(n*12),nor=new Float32Array(n*12),uv=new Float32Array(n*8),idx=[];let o=0;
  for(let q=0;q<n;q++){const [cx,cy,cz,w,h,yaw,u0,u1,flat]=list[q];const c=Math.cos(yaw),s=Math.sin(yaw);const C=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]];
    for(let i=0;i<4;i++){const a=C[i][0]*w,b=C[i][1]*h;let x,y,z,nx,ny,nz;
      if(flat){x=cx+a*c+b*s;z=cz-a*s+b*c;y=cy;nx=0;ny=1;nz=0;}else{x=cx+a*c;z=cz-a*s;y=cy+b;nx=s;ny=0;nz=c;}
      pos[o*3]=x;pos[o*3+1]=y;pos[o*3+2]=z;nor[o*3]=nx;nor[o*3+1]=ny;nor[o*3+2]=nz;uv[o*2]=i===0||i===3?u0:u1;uv[o*2+1]=i<2?0:1;o++;}
    const b=q*4;if(flat)idx.push(b,b+2,b+1,b,b+3,b+2);else idx.push(b,b+1,b+2,b,b+2,b+3);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g;}
function mhTex480(){const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
  // cell 0: round cast-iron manhole cover; cell 1: square drain grate
  g.save();g.translate(64,64);g.fillStyle='#2b2c2e';g.beginPath();g.arc(0,0,62,0,Math.PI*2);g.fill();g.fillStyle='#46484b';g.beginPath();g.arc(0,0,56,0,Math.PI*2);g.fill();
  g.strokeStyle='#2a2b2d';g.lineWidth=3;for(let r=14;r<56;r+=10){g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.stroke();}
  for(let a=0;a<12;a++){g.save();g.rotate(a*Math.PI/6);g.beginPath();g.moveTo(0,8);g.lineTo(0,54);g.stroke();g.restore();}
  g.fillStyle='#55575a';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('FOGNATURA',0,4);g.fillStyle='rgba(120,70,30,.35)';for(let i=0;i<30;i++){const a=Math.random()*6.28,r=Math.random()*54;g.fillRect(Math.cos(a)*r,Math.sin(a)*r,3+Math.random()*6,2+Math.random()*3);}g.restore();
  g.fillStyle='#2b2c2e';g.fillRect(132,8,112,112);g.fillStyle='#111214';for(let i=0;i<9;i++)g.fillRect(142+i*11.5,16,6,96);g.strokeStyle='#4a4c50';g.lineWidth=5;g.strokeRect(134,10,108,108);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function sgTex480(){const c=document.createElement('canvas');c.width=1024;c.height=128;const g=c.getContext('2d');const C=i=>{g.setTransform(1,0,0,1,i*128+64,64);};
  const ring=(fill,stroke,w)=>{g.beginPath();g.arc(0,0,58,0,Math.PI*2);g.fillStyle=stroke;g.fill();g.beginPath();g.arc(0,0,58-w,0,Math.PI*2);g.fillStyle=fill;g.fill();};
  const tri=(up,fill,stroke)=>{g.beginPath();const k=up?1:-1;g.moveTo(0,-56*k);g.lineTo(60,44*k);g.lineTo(-60,44*k);g.closePath();g.fillStyle=stroke;g.fill();g.beginPath();g.moveTo(0,-36*k);g.lineTo(42,32*k);g.lineTo(-42,32*k);g.closePath();g.fillStyle=fill;g.fill();};
  g.textAlign='center';g.textBaseline='middle';
  C(0);g.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;g.lineTo(Math.cos(a)*60,Math.sin(a)*60);}g.closePath();g.fillStyle='#fff';g.fill();g.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;g.lineTo(Math.cos(a)*54,Math.sin(a)*54);}g.closePath();g.fillStyle='#c4161c';g.fill();g.fillStyle='#fff';g.font='bold 34px sans-serif';g.fillText('STOP',0,2);
  C(1);tri(false,'#fff','#c4161c');
  C(2);ring('#fff','#c4161c',13);g.fillStyle='#111';g.font='bold 46px sans-serif';g.fillText('30',0,3);
  C(3);ring('#fff','#c4161c',13);g.fillStyle='#111';g.font='bold 46px sans-serif';g.fillText('50',0,3);
  C(4);g.fillStyle='#fff';g.fillRect(-58,-58,116,116);g.fillStyle='#1d5bb4';g.fillRect(-54,-54,108,108);g.beginPath();g.moveTo(0,-42);g.lineTo(44,38);g.lineTo(-44,38);g.closePath();g.fillStyle='#fff';g.fill();
  g.fillStyle='#111';g.beginPath();g.arc(2,-14,6,0,Math.PI*2);g.fill();g.lineWidth=6;g.strokeStyle='#111';g.beginPath();g.moveTo(1,-6);g.lineTo(-2,12);g.lineTo(-12,28);g.moveTo(-2,12);g.lineTo(10,28);g.moveTo(-12,0);g.lineTo(12,4);g.stroke();
  C(5);tri(true,'#fff','#c4161c');g.fillStyle='#111';g.font='bold 40px sans-serif';g.fillText('☠',0,10);g.font='bold 10px sans-serif';g.fillText('ZOMBIE',0,30);
  C(6);g.beginPath();g.arc(0,0,58,0,Math.PI*2);g.fillStyle='#fff';g.fill();g.beginPath();g.arc(0,0,54,0,Math.PI*2);g.fillStyle='#c4161c';g.fill();g.fillStyle='#fff';g.fillRect(-38,-9,76,18);
  C(7);ring('#1d5bb4','#c4161c',12);g.strokeStyle='#c4161c';g.lineWidth=12;g.beginPath();g.moveTo(-30,-30);g.lineTo(30,30);g.stroke();
  g.setTransform(1,0,0,1,0,0);// weathering
  for(let i=0;i<260;i++){g.fillStyle='rgba(60,40,20,'+(.04+Math.random()*.1).toFixed(2)+')';g.fillRect(Math.random()*1024,Math.random()*128,1+Math.random()*4,1+Math.random()*3);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function roads480(){const C=window.CITY4319;if(!C||!C.roads||RD480.mh)return;const q=Q480(),r=rng476(4380);
  const hwV=x=>Math.abs(x)===32?5:x===-122?2.5:4,hwH=z=>z===0?5.5:4;const V=C.roads.filter(R=>R[0]===R[2]),H=C.roads.filter(R=>R[1]===R[3]);
  const J=[];for(const v of V)for(const h of H){const x=v[0],z=h[1];if(z<Math.min(v[1],v[3])||z>Math.max(v[1],v[3])||x<Math.min(h[0],h[2])||x>Math.max(h[0],h[2]))continue;J.push([x,z,hwV(x),hwH(z)]);}
  const nearJ=(x,z,m)=>J.some(j=>Math.abs(x-j[0])<j[2]+m&&Math.abs(z-j[1])<j[3]+m);
  // manholes: in the lanes, away from junctions, crosswalks and wrecks, exactly on the asphalt
  const MH=[],step=q==='bassa'?34:26;
  for(const R of C.roads){const vert=R[0]===R[2],hw=vert?hwV(R[0]):hwH(R[1]),len=Math.hypot(R[2]-R[0],R[3]-R[1]);if(hw<3)continue;let side=r()<.5?-1:1;
    for(let t=step*.5+r()*6;t<len-4;t+=step+r()*8){const f=t/len,cx=R[0]+(R[2]-R[0])*f,cz=R[1]+(R[3]-R[1])*f,lat=side*hw*.48;side=-side;const x=vert?cx+lat:cx,z=vert?cz:cz+lat;
      if(nearJ(x,z,9))continue;if(Math.abs(gh480(x,z)-.025)>.008)continue;if(!clear480(x,z,1.1))continue;if(MH.some(m=>Math.hypot(m[0]-x,m[2]-z)<10))continue;MH.push([x,.032,z,.92,.92,r()*6.28,0,.5,1]);}}
  // a few drain grates at the kerb
  for(const R of C.roads){const vert=R[0]===R[2],hw=vert?hwV(R[0]):hwH(R[1]),len=Math.hypot(R[2]-R[0],R[3]-R[1]);if(hw<3)continue;
    for(let t=20+r()*10;t<len-6;t+=44+r()*12){const f=t/len,cx=R[0]+(R[2]-R[0])*f,cz=R[1]+(R[3]-R[1])*f,sd=r()<.5?-1:1,lat=sd*(hw-.45);const x=vert?cx+lat:cx,z=vert?cz:cz+lat;
      if(nearJ(x,z,7))continue;if(Math.abs(gh480(x,z)-.025)>.008)continue;if(!clear480(x,z,.8))continue;MH.push([x,.031,z,.5,.5,vert?0:Math.PI/2,.5,1,1]);}}
  if(MH.length){const m=new T.Mesh(quads480(MH),new T.MeshLambertMaterial({map:mhTex480(),alphaTest:.5,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.name='manhole480';m.matrixAutoUpdate=false;m.receiveShadow=true;m.renderOrder=1;scene.add(m);RD480.mh=m;RD480.n=MH.length;}
  // road signs on the corners of the junctions, facing the traffic that arrives
  const SG=[],mb=new MB476(4381),per=q==='bassa'?1:2;
  for(const j of J){const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].sort(()=>r()-.5);let put=0;
    for(const [sx,sz] of corners){if(put>=per)break;const x=j[0]+sx*(j[2]+1.45),z=j[1]+sz*(j[3]+1.45);if(Math.abs(gh480(x,z)-.11)>.02)continue;if(!clear480(x,z,.55))continue;
      if(C.entrances&&C.entrances.some(e=>Math.hypot(e[0]-x,e[1]-z)<3))continue;const yaw=sz>0?0:Math.PI;const kind=put===0?(r()<.6?0:1):[2,3,4,5,5,6,7][(r()*7)|0];
      mb.add('cyl',0x8c9096,x,1.28,z,.075,2.56,.075,0,0,0,.05);mb.add('box',0x7a7e84,x+Math.sin(yaw)*.035,2.24,z+Math.cos(yaw)*.035,.62,.62,.02,0,yaw,0,.04);mb.add('cyl',0x5a5e64,x,.03,z,.2,.06,.2,0,0,0,.05);
      SG.push([x+Math.sin(yaw)*.05,2.24,z+Math.cos(yaw)*.05,.62,.62,yaw,kind/8,(kind+1)/8,0]);circles.push({x,z,r:.1,v480:1});put++;}}
  if(SG.length){RD480.poles=addMesh476(mb.build(),MAT476,'signPole480');const m=new T.Mesh(quads480(SG),new T.MeshLambertMaterial({map:sgTex480(),alphaTest:.5}));m.name='roadSign480';m.matrixAutoUpdate=false;scene.add(m);RD480.sg=m;RD480.s=SG.length;}}
try{roads480();}catch(e){e480(e,'roads');}

// ---------- explorable roofs: a few flat-roof buildings get an outside staircase, a landing over the parapet and a walkable roof ----------
const EL480={S:[],y:0,tgt:0,cur:null,mesh:null};
function stairsBuild480(){const C=window.CITY4319;if(!C||!C.buildings)return;const want=['SCUOLA','POLIZIA','SUPERMERCATO','FARMACIA','PANETTERIA','CAFFÈ'],max=Q480()==='bassa'?2:3;
  const mb=new MB476(4382),CON=0x8f918d,CON2=0x7a7c78,MET=0x3e434a,RUST=0x6a4a34;
  const onRoad=(x,z)=>{try{for(const r of C.paving.roads)if(x>r.x0-.6&&x<r.x1+.6&&z>r.z0-.6&&z<r.z1+.6)return true;}catch(e){}return false;};
  for(const lab of want){if(EL480.S.length>=max)break;const b=C.buildings.find(q=>q.label===lab);if(!b||!b.enterable)continue;if(b.kind==='home'||b.kind==='station'||b.kind==='factory')continue;
    const en=(C.entrances||[]).find(e=>Math.abs(e[0]-b.x)<1&&Math.abs(Math.abs(e[1]-b.z)-(b.d/2+2.5))<.6);if(!en)continue;const front=Math.sign(en[1]-b.z)||1,fz=b.z+front*b.d/2;
    const h=b.h,R=h+.7,Y=h+.2,L=R/.72,LAND=1.5,dirZ=-front,zb=fz+dirZ*1.0;if(L+LAND>b.d-2.4)continue;
    for(const sx of [1,-1]){const wallX=b.x+sx*b.w/2,xi=wallX+sx*.25,xo=wallX+sx*1.55,X0=Math.min(xi,xo),X1=Math.max(xi,xo);
      const zE=zb+dirZ*(L+LAND),Z0=Math.min(zb,zE),Z1=Math.max(zb,zE);let ok=true;
      // clear ground: no colliders, no road, no park/cemetery, not on top of the other stairs
      const cx0=Math.min(wallX+sx*.22,wallX+sx*1.9),cx1=Math.max(wallX+sx*.22,wallX+sx*1.9);
      for(const q of boxes)if(q.x1>cx0&&q.x0<cx1&&q.z1>Z0-.6&&q.z0<Z1+.6){ok=false;break;}
      if(ok)for(const c of circles){if(c.off)continue;if(c.x+c.r>cx0&&c.x-c.r<cx1&&c.z+c.r>Z0-.6&&c.z-c.r<Z1+.6){ok=false;break;}}
      if(ok)for(let t=0;t<=1;t+=.1){if(onRoad((X0+X1)/2,Z0+(Z1-Z0)*t)){ok=false;break;}}
      if(ok&&typeof W476!=="undefined")for(const A of [W476.cem,W476.park]){if(A&&Math.hypot(A.x-(X0+X1)/2,A.z-(Z0+Z1)/2)<(A.r||14)+L/2+3){ok=false;break;}}
      if(!ok)continue;
      const S={b,label:lab,sx,front,dirZ,wallX,X0,X1,zb,L,LAND,R,Y,h,
        roof:[b.x-b.w/2+.5,b.x+b.w/2-.5,b.z-b.d/2+.5,b.z+b.d/2-.5],obs:[],brX0:Math.min(wallX-sx*1.0,wallX+sx*.8),brX1:Math.max(wallX-sx*1.0,wallX+sx*.8),lz0:Math.min(zb+dirZ*L,zE),lz1:Math.max(zb+dirZ*L,zE)};
      // roof obstacles: the AC block on the roof
      {const ax=b.x+b.w*.22,az=b.z-b.d*.22;S.obs.push([ax-1.2-.3,ax+1.2+.3,az-.8-.3,az+.8+.3]);}
      // stairs: steps, stringers, posts, handrail, landing, bridge over the parapet, step down
      const n=Math.ceil(R/.18),sw=X1-X0,mx=(X0+X1)/2;
      for(let i=0;i<n;i++){const y=(i+1)*R/n,a0=i*L/n,a1=(i+1)*L/n,zc=zb+dirZ*(a0+a1)/2;mb.add('box',i%2?CON:CON2,mx,y-.09,zc,sw,.18,(a1-a0)+.02,0,0,0,.05);}
      const ang=Math.atan2(R,L),len=Math.hypot(R,L);
      for(const ex of [X0+.05,X1-.05])mb.add('box',MET,ex,R/2-.12,zb+dirZ*L/2,.08,.22,len,dirZ>0?-ang:ang,0,0,.04);
      for(let a=2;a<L;a+=2.6){const y=a/L*R;mb.add('box',MET,mx,(y-.2)/2,zb+dirZ*a,.12,Math.max(.2,y-.2),.12,0,0,0,.04);}
      const xr=sx>0?X1-.04:X0+.04;// outer handrail
      for(let a=0;a<=L+.01;a+=L/Math.ceil(L/1.25)){const y=a/L*R;mb.add('box',MET,xr,y+.5,zb+dirZ*a,.05,1,.05,0,0,0,.03);}
      mb.add('box',RUST,xr,R/2+1,zb+dirZ*L/2,.06,.06,len,dirZ>0?-ang:ang,0,0,.03);
      mb.add('box',CON,mx,R-.1,zb+dirZ*(L+LAND/2),sw,.2,LAND,0,0,0,.05);mb.add('box',MET,mx,(R-.2)/2,zb+dirZ*(L+LAND-.2),.14,R-.2,.14,0,0,0,.04);
      mb.add('box',MET,xr,R+.5,zb+dirZ*(L+LAND/2),.05,1,LAND,0,0,0,.03);mb.add('box',MET,xr,R+1,zb+dirZ*(L+LAND/2),.06,.06,LAND,0,0,0,.03);
      mb.add('box',MET,mx,R+.5,zb+dirZ*(L+LAND),sw,1,.05,0,0,0,.03);mb.add('box',RUST,mx,R+1,zb+dirZ*(L+LAND),sw,.06,.06,0,0,0,.03);
      const bx=(S.brX0+S.brX1)/2;mb.add('box',CON2,bx,R-.05,zb+dirZ*(L+LAND/2),S.brX1-S.brX0,.1,LAND,0,0,0,.05);
      mb.add('box',MET,wallX-sx*.85,Y+.22,zb+dirZ*(L+LAND/2),.5,.04,LAND*.9,0,0,0,.03);mb.add('box',MET,wallX-sx*.85,Y+.1,zb+dirZ*(L+LAND/2),.06,.2,LAND*.9,0,0,0,.03);
      // the roof: a lookout corner with sandbags and a supply crate
      const rx=b.x-sx*(b.w/2-1.6),rz=b.z+front*(b.d/2-1.4);for(let k=-1;k<=1;k++)mb.add('box',0xb39a6a,rx+k*.62,Y+.14,rz,.6,.26,.45,0,(k*.15),0,.12);mb.add('box',0xb39a6a,rx,Y+.38,rz,.6,.24,.45,0,.1,0,.12);
      const cx=b.x+sx*(b.w/2-1.2),cz=b.z-front*(b.d/2-1.3);mb.add('box',0x6a4a2a,cx,Y+.3,cz,.9,.6,.6,0,0,0,.08);mb.add('box',0x3a3e44,cx,Y+.3,cz+.305,.92,.08,.02,0,0,0,.04);mb.add('box',0x8a6a3a,cx,Y+.62,cz,.94,.06,.64,0,0,0,.06);
      S.crate={x:cx,z:cz,id:lab};S.obs.push([cx-.6,cx+.6,cz-.45,cz+.45]);
      // colliders at ground level: outer rail and the far end (you can only walk in from the bottom step)
      const zc=zb+dirZ*(L+LAND)/2;boxes.push({x0:sx>0?X1-.05:X0-.05,x1:sx>0?X1+.05:X0+.05,z0:Z0,z1:Z1,v480:1});boxes.push({x0:X0,x1:X1,z0:zE-(dirZ>0?.05:-.05)-.05,z1:zE-(dirZ>0?.05:-.05)+.05,v480:1});
      EL480.S.push(S);break;}}
  if(EL480.S.length)EL480.mesh=addMesh476(mb.build(),MAT476,'stairs480');}
// where am I standing (height), for a stair structure; null = not on it
function elAt480(S,x,z,r){const a=(z-S.zb)*S.dirZ,m=r*.55;
  if(x>S.X0+m&&x<S.X1-m&&a>-.05&&a<S.L+S.LAND-m)return a<S.L?Math.max(0,a/S.L*S.R):S.R;
  if(x>S.brX0&&x<S.brX1&&z>S.lz0+m&&z<S.lz1-m)return S.R;
  const R=S.roof;if(x>R[0]+m&&x<R[1]-m&&z>R[2]+m&&z<R[3]-m){for(const o of S.obs)if(x>o[0]&&x<o[1]&&z>o[2]&&z<o[3])return null;return S.Y;}return null;}
function elClamp480(S,p,r){// nearest point of the walkable union
  const m=r*.55,c=[],a0=S.zb,a1=S.zb+S.dirZ*(S.L+S.LAND-m-.01),R=S.roof;
  c.push([clamp(p.x,S.X0+m+.01,S.X1-m-.01),clamp(p.z,Math.min(a0,a1),Math.max(a0,a1))]);
  c.push([clamp(p.x,S.brX0+.01,S.brX1-.01),clamp(p.z,S.lz0+m+.01,S.lz1-m-.01)]);
  c.push([clamp(p.x,R[0]+m+.01,R[1]-m-.01),clamp(p.z,R[2]+m+.01,R[3]-m-.01)]);
  let best=null,bd=1e9;for(const q of c){if(elAt480(S,q[0],q[1],r)==null)continue;const d=(q[0]-p.x)**2+(q[1]-p.z)**2;if(d<bd){bd=d;best=q;}}
  if(!best){// pushed into a roof obstacle: step back out of it
    for(const o of S.obs)if(p.x>o[0]&&p.x<o[1]&&p.z>o[2]&&p.z<o[3]){const ds=[[o[0]-.01,p.z],[o[1]+.01,p.z],[p.x,o[2]-.01],[p.x,o[3]+.01]];for(const q of ds){const d=(q[0]-p.x)**2+(q[1]-p.z)**2;if(d<bd&&elAt480(S,q[0],q[1],r)!=null){bd=d;best=q;}}}}
  if(best){p.x=best[0];p.z=best[1];}}
function arenaOn480(){try{return !!(ARENA454&&ARENA454.on);}catch(e){return false;}}
{const _co=collide;collide=function(p,r){if(!M480.on||!EL480.S.length||arenaOn480())return _co(p,r);
  try{if(p===player.pos){const S=EL480.cur;
      if(S){const a=(p.z-S.zb)*S.dirZ;let y=elAt480(S,p.x,p.z,r);
        if(y==null&&a<=-.05&&EL480.y<.5&&p.x>S.X0-.3&&p.x<S.X1+.3){EL480.cur=null;EL480.tgt=0;return _co(p,r);}// walked off the bottom step
        if(y==null){elClamp480(S,p,r);y=elAt480(S,p.x,p.z,r);}EL480.tgt=y==null?EL480.tgt:y;
        return;}
      _co(p,r);for(const S of EL480.S){const a=(p.z-S.zb)*S.dirZ;if(p.x>S.X0&&p.x<S.X1&&a>-.05&&a<.9){EL480.cur=S;EL480.tgt=Math.max(0,a/S.L*S.R);break;}}return;}
    _co(p,r);// zombies, coins and the rest: the staircase is solid for them
    for(const S of EL480.S){if(p.x<S.X0-r||p.x>S.X1+r)continue;const a=(p.z-S.zb)*S.dirZ;if(a<-r||a>S.L+S.LAND+r)continue;if(a<1.2)p.z=S.zb-S.dirZ*(r+.02);else p.x=S.sx>0?S.X1+r+.06:S.X0-r-.06;}}catch(e){e480(e,'col');return _co(p,r);}};}
{const _za=zAttackHit;zAttackHit=function(z,d,sc){try{if(M480.on&&EL480.y>1.5&&!arenaOn480()){const tp=z.tgtPiece;if(!tp)return;}}catch(e){}return _za(z,d,sc);};}
function elTick480(dt){if(!EL480.S.length)return;if(arenaOn480()||!SV.on){EL480.cur=null;EL480.tgt=0;}
  EL480.y+=(EL480.tgt-EL480.y)*Math.min(1,dt*14);if(Math.abs(EL480.tgt-EL480.y)<.002)EL480.y=EL480.tgt;
  try{CAMY43=(B43.camY||0)+EL480.y;}catch(e){}
  try{if(EL480.y>2&&IN476)IN476.inside=false;}catch(e){}
  // supply crate on the roof: once a day, ammo for the gun in your hands + a few coins
  const S=EL480.cur;if(S&&S.crate&&EL480.y>S.Y-.3){const c=S.crate;if(Math.hypot(player.pos.x-c.x,player.pos.z-c.z)<1.5){const key='zs480roof_'+c.id;let last=-1;try{last=+LS.get(key,-1);}catch(e){}
      if(last!==SV.day){try{LS.set(key,SV.day);}catch(e){}const w=WEAPONS[curW];let txt='';if(w&&!w.melee&&!w.tool&&w.mag){const n=w.mag*2;res[w.id]=Math.min(w.maxReserve||9999,(res[w.id]|0)+n);txt='+'+n+' colpi '+w.name+' · ';}
        try{addCoins(25);}catch(e){}play('pickup');toast('📦 Rifornimento sul tetto: '+txt+'+25 🪙',1800);updateHUD();}}}}
{const _sg=startGame;startGame=function(){EL480.cur=null;EL480.y=0;EL480.tgt=0;return _sg.apply(this,arguments);};}
try{stairsBuild480();}catch(e){e480(e,'stairs');}
// ---- new build items (each with a job): shelf = bigger deposit, repair bench, alarm bell, sandbags, vegetable garden, floor lamp ----
Object.assign(PDEF,{
  shelf480:{"n":"Scaffalatura","i":"🗄️","cost":{"wood":6,"iron":2},"hp":200,"cell":"o","box":[1.4,0.5],"lv":2,"max":4,"parts":[["iron477",-0.66,0.9,-0.2,0.045,1.8,0.045],["iron477",-0.66,0.9,0.2,0.045,1.8,0.045],["iron477",0.66,0.9,-0.2,0.045,1.8,0.045],["iron477",0.66,0.9,0.2,0.045,1.8,0.045],["woodD477",0,0.12,0,1.36,0.04,0.46],["woodD477",0,0.62,0,1.36,0.04,0.46],["woodD477",0,1.12,0,1.36,0.04,0.46],["woodD477",0,1.62,0,1.36,0.04,0.46],["crate",-0.38,0.31,0,0.34,0.34,0.34],["crate",0.1,0.28,0.02,0.28,0.28,0.3],["linen",0.45,0.28,0,0.32,0.28,0.36],["crate",-0.3,0.8,0,0.4,0.32,0.36],["metal",0.3,0.75,0,0.22,0.22,0.3],["linen",-0.35,1.27,0,0.36,0.26,0.34],["crate",0.32,1.3,0,0.34,0.34,0.34],["woodD477",0,1.8,-0.22,1.4,0.08,0.02]]},
  repair480:{"n":"Banco riparazioni","i":"🛠️","cost":{"wood":5,"metal":3,"iron":1},"hp":260,"cell":"o","box":[1.6,0.8],"lv":3,"max":2,"parts":[["woodD477",0,0.88,0,1.6,0.08,0.8],["iron477",-0.72,0.42,-0.32,0.06,0.84,0.06],["iron477",-0.72,0.42,0.32,0.06,0.84,0.06],["iron477",0.72,0.42,-0.32,0.06,0.84,0.06],["iron477",0.72,0.42,0.32,0.06,0.84,0.06],["woodD477",0,0.18,0,1.5,0.04,0.7],["iron477",0.62,1.0,0.25,0.22,0.16,0.14],["ironC477",0.62,1.0,0.37,0.04,0.2,0.04,1.571,0,0],["woodD477",0,1.5,-0.38,1.6,1.1,0.04],["red477",-0.45,1.0,0.05,0.42,0.18,0.22],["dark",-0.45,1.1,0.05,0.44,0.02,0.24],["metal",0.0,1.55,-0.35,0.06,0.36,0.02],["metal",0.2,1.6,-0.35,0.05,0.42,0.02],["woodD477",-0.2,1.45,-0.35,0.04,0.3,0.03],["iron477",-0.2,1.62,-0.35,0.16,0.06,0.04],["metal",0.25,0.95,-0.1,0.3,0.06,0.12]]},
  bell480:{"n":"Campana d'allarme","i":"🔔","cost":{"wood":3,"metal":2},"hp":150,"cell":"o","circ":0.4,"lv":2,"max":2,"parts":[["woodD477",-0.5,1.2,0,0.12,2.4,0.12],["woodD477",0.5,1.2,0,0.12,2.4,0.12],["woodD477",0,2.36,0,1.2,0.12,0.14],["stone",-0.5,0.06,0,0.3,0.12,0.3],["stone",0.5,0.06,0,0.3,0.12,0.3],["brassC477",0,1.98,0,0.34,0.42,0.34],["brassC477",0,1.76,0,0.44,0.06,0.44],["brassC477",0,2.22,0,0.14,0.14,0.14],["iron477",0,1.72,0,0.06,0.1,0.06],["linen",0.08,1.25,0,0.025,0.9,0.025],["woodD477",-0.5,2.0,0,0.2,0.06,0.06,0,0,0.7],["woodD477",0.5,2.0,0,0.2,0.06,0.06,0,0,-0.7]]},
  sandbag480:{"n":"Sacchi di sabbia","i":"🟨","cost":{"stone":4,"wood":1},"hp":650,"edge":1,"box":[2,0.6],"lv":1,"parts":[["sand",-0.66,0.13,0,0.64,0.24,0.5,0,-0.06,0],["sand",0,0.13,0,0.64,0.24,0.5],["sand",0.66,0.13,0,0.64,0.24,0.5,0,0.06,0],["sand",-0.66,0.37,0,0.64,0.24,0.5,0,-0.06,0],["sand",0.0,0.37,0,0.64,0.24,0.5],["sand",0.66,0.37,0,0.64,0.24,0.5,0,0.06,0],["sand",-0.66,0.61,0,0.64,0.24,0.5,0,-0.06,0],["sand",0,0.61,0,0.64,0.24,0.5],["sand",0.66,0.61,0,0.64,0.24,0.5,0,0.06,0]]},
  garden480:{"n":"Orto","i":"🥕","cost":{"wood":4,"stone":2},"hp":120,"cell":"o","box":[1.6,1.0],"lv":2,"max":3,"parts":[["woodD477",0,0.1,-0.48,1.6,0.2,0.06],["woodD477",0,0.1,0.48,1.6,0.2,0.06],["woodD477",-0.78,0.1,0,0.06,0.2,1],["woodD477",0.78,0.1,0,0.06,0.2,1],["dark",0,0.14,0,1.5,0.12,0.9],["leaf",-0.52,0.32,-0.25,0.22,0.24,0.22],["pump477",-0.52,0.24,-0.16,0.14,0.12,0.14],["leaf",-0.52,0.28,0.25,0.12,0.3,0.08,0,0.4,0.2],["leaf",-0.48,0.28,0.25,0.08,0.26,0.12,0,-0.3,-0.2],["leaf",-0.18,0.28,-0.25,0.12,0.3,0.08,0,0.4,0.2],["leaf",-0.14,0.28,-0.25,0.08,0.26,0.12,0,-0.3,-0.2],["leaf",-0.18,0.32,0.25,0.22,0.24,0.22,0,0.5,0],["pump477",-0.18,0.24,0.34,0.14,0.12,0.14],["leaf",0.18,0.32,-0.25,0.22,0.24,0.22,0,1.0,0],["pump477",0.18,0.24,-0.16,0.14,0.12,0.14],["leaf",0.18,0.28,0.25,0.12,0.3,0.08,0,0.4,0.2],["leaf",0.22,0.28,0.25,0.08,0.26,0.12,0,-0.3,-0.2],["leaf",0.52,0.28,-0.25,0.12,0.3,0.08,0,0.4,0.2],["leaf",0.56,0.28,-0.25,0.08,0.26,0.12,0,-0.3,-0.2],["leaf",0.52,0.32,0.25,0.22,0.24,0.22,0,1.5,0],["pump477",0.52,0.24,0.34,0.14,0.12,0.14],["woodD477",0.7,0.45,-0.42,0.04,0.7,0.04],["linen",0.7,0.72,-0.42,0.2,0.12,0.02]]},
  flamp480:{"n":"Lampada a stelo","i":"🛋️","cost":{"wood":1,"metal":1,"elec":1},"hp":80,"cell":"o","circ":0.22,"lamp":1,"ly":1.62,"lv":1,"parts":[["ironC477",0,0.03,0,0.34,0.06,0.34],["ironC477",0,0.8,0,0.035,1.5,0.035],["brassC477",0,1.52,0,0.06,0.06,0.06],["linen",0,1.66,0,0.36,0.3,0.36],["glow",0,1.58,0,0.12,0.12,0.12],["ironC477",0,1.82,0,0.04,0.04,0.04]]}
});
try{const N=['sandbag480','bell480','repair480','shelf480','garden480','flamp480'].filter(k=>PDEF[k]);WALLISH468.add('sandbag480');WALLISH474.add('sandbag480');PORDER.push(...N);
  const C=k=>BCAT43.find(c=>c[0]===k);const inAny=k=>BCAT43.some(c=>c[2].includes(k));const add=(c,L)=>{const x=C(c)||C('utilita')||BCAT43[0];if(x)for(const k of L)if(PDEF[k]&&!inAny(k))x[2].push(k);};
  add('difesa',['sandbag480','bell480']);add('utilita',['repair480','shelf480','garden480','flamp480']);
  for(const c of BCAT43){const Lc=c[2];const o=Lc.map((k,i)=>[k,i]);o.sort((a,b)=>((PDEF[a[0]]&&PDEF[a[0]].lv)||1)-((PDEF[b[0]]&&PDEF[b[0]].lv)||1)||a[1]-b[1]);for(let i=0;i<o.length;i++)Lc[i]=o[i][0];}}catch(e){e480(e,'bcat');}
// shelf: +150 deposit space each
{const _cc=chestCap;chestCap=function(){let n=0;try{for(const p of PIECES)if(p.alive&&p.type==='shelf480')n++;}catch(e){}return _cc()+150*n;};}
SFX.bell480=v=>{const t=AU.ctx.currentTime,k=Math.max(.15,Math.min(1,v||1));for(let i=0;i<3;i++){const s=t+i*.55;osc(s,1.2,.12*k,'sine',880,870);osc(s,.9,.06*k,'sine',2210,2190);osc(s,.4,.05*k,'triangle',1320,1300);}};
const D480={t:0,bell:0};
function items480(dt){if(!SV.on||game.state!=='play')return;D480.t-=dt;if(D480.t>0)return;D480.t=.5;D480.bell-=.5;const px=player.pos.x,pz=player.pos.z,night=SV.phase==='night'||SV.phase==='dusk';
  for(const p of PIECES){if(!p.alive)continue;const ty=p.type;
    if(ty==='repair480'){// fixes damaged pieces within 4.5 m, slowly, while you are near (it needs hands)
      if(Math.hypot(p.x-px,p.z-pz)>9)continue;for(const q of PIECES){if(!q.alive||q===p)continue;const D=PDEF[q.type];if(!D||!D.hp||q.hp>=D.hp)continue;if(Math.hypot(q.x-p.x,q.z-p.z)>4.5)continue;q.hp=Math.min(D.hp,q.hp+D.hp*.012);}continue;}
    if(ty==='bell480'){if(!night||D480.bell>0)continue;let hit=null;for(const z of zombies){if(!z.alive||z.dead)continue;if(Math.hypot(z.g.position.x-p.x,z.g.position.z-p.z)<16){hit=z;break;}}
      if(hit){D480.bell=25;const dp=Math.hypot(p.x-px,p.z-pz);play('bell480',Math.max(.25,1-dp/90));feed('🔔 Campana d\'allarme: zombie vicino alla base!');}continue;}
    if(ty==='garden480'){const s=bst(p);s.g=Math.min(180,(s.g||0)+.5);if(s.g>=180&&Math.hypot(p.x-px,p.z-pz)<2.2&&player.hp<player.maxHp-5){const h=Math.min(35,player.maxHp-player.hp);player.hp+=h;s.g=0;play('heal477');floatText('🥕 Raccolto dall\'orto: +'+Math.round(h)+' ❤️','#9aff9a');updateHUD();}continue;}}}
TICK42.push(function(dt,t){if(!M480.on)return;try{items480(dt);}catch(e){e480(e,'items');}try{elTick480(dt);}catch(e){e480(e,'el');}try{slTick480(dt,t);}catch(e){e480(e,'sl');}});
window.__zs480={M480,EL480,RD480,AB480:()=>abHouses480().length,stairs:()=>EL480.S.map(s=>s.label+(s.sx>0?' E':' W')),gh:(x,z)=>gh480(x,z)};
