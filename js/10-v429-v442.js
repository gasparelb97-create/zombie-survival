/* Zombie Survival — game code part 10-v429-v442 (game.html lines 6567-6923 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.29: zaino, potenziamenti in partita, neve, zombie, suggerimenti =======================
function dbg29(sev,kind,msg){try{if(window.__DBG)__DBG.prob(sev,kind,String(msg).slice(0,220));}catch(e){}}
try{
  snowGeo.setAttribute('aSp',new T.BufferAttribute(snowSp,1));
  snow.material.size=.1;snow.material.opacity=.86;snow.material.color.setHex(0xf7f9ff);
  snow.material.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aSp;').replace('gl_PointSize = size;','gl_PointSize = size * (0.55 + aSp * 0.9);');};
  snow.material.customProgramCacheKey=function(){return 'snow29';};
  sn2G.setAttribute('aSp',new T.BufferAttribute(sn2S,1));
  snow2.material.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aSp;').replace('gl_PointSize = size;','gl_PointSize = size * (0.45 + aSp * 0.7);');};
  snow2.material.customProgramCacheKey=function(){return 'snow29b';};
  snow2.material.color.setHex(0xd5e4ff);snow2.material.opacity=.62;
}catch(e){dbg29('warn','neve',e&&e.message||e);}
const _us29=updateSnow;updateSnow=function(dt,t){try{_us29(dt,t);}catch(e){dbg29('err','neve',e&&e.message||e);try{snow.visible=false;}catch(x){}}};
const _s2_29=snow2Tick;snow2Tick=function(dt,t){try{_s2_29(dt,t);}catch(e){dbg29('err','neve',e&&e.message||e);try{snow2.visible=false;}catch(x){}}};
WU28.length=0;[5000,12000,26000,52000,98000].forEach(function(v){WU28.push(v);});
if(!CSHOP.some(function(c){return c.id==='cu_crit';}))CSHOP.push({id:'cu_crit',n:'Attacco critico',e:'💥',d:'+0,25% di probabilità per livello (massimo +25%). Il colpo critico fa la metà di danno in più.',lv:UPG432L,cost:UPG432C,k:'crit',g:'Potenziamenti',hide29:1});
['cu_atk','cu_def','cu_spd','cu_crit'].forEach(function(id){const c=CSHOP.find(function(q){return q.id===id;});if(c)c.hide29=1;});
chUp28HTML=function(){const c=CSHOP.find(function(q){return q.id==='cu_chest';});const s=c?cItem(c):{done:1};
  let h='<div class="sub2" style="margin-top:8px">🪙 Hai <b>'+fmt(P42.c)+'</b> · armi, forza, difesa, critico e velocità si potenziano nel Crafting</div>';
  if(!c||s.done)h+='<div class="sub2">Deposito al massimo</div>';
  else if(P42.L<s.lv)h+='<button class="act" style="width:100%;margin-top:6px" data-ch28="chest">📦 Amplia deposito · 🔒 Liv. '+s.lv+'</button>';
  else h+='<button class="act" style="width:100%;margin-top:6px" data-ch28="chest">📦 Amplia deposito · 🪙 '+fmt(s.cost)+' · +200 posti · '+(s.lvl+1)+'/6</button>';
  return h;};
const _svc29=svcHTML;svcHTML=function(){const h=_svc29();const i=h.indexOf('<div class="sub2">Spendi le monete');return i>0?h.slice(i):h;};
function up29Row(id){const c=CSHOP.find(function(q){return q.id===id;});const s=cItem(c);const lv=s.lvl|0,max=s.max|0;
  let now='';if(id==='cu_atk')now='danno +'+(lv*0.5).toFixed(1).replace('.',',')+'%';
  else if(id==='cu_def')now='danni subiti -'+(lv*0.4).toFixed(1).replace('.',',')+'%';
  else if(id==='cu_crit')now='probabilità '+(lv*0.25).toFixed(1).replace('.',',')+'%';
  else now='velocità +'+(lv*0.2).toFixed(1).replace('.',',')+'%';
  if(s.done)return '<div class="recipe"><div><div class="name">'+esc(c.n)+'</div><div class="cost">'+esc(c.d)+' · '+now+' · al massimo, livello '+lv+'/'+max+'</div></div></div>';
  return '<div class="recipe"><div><div class="name">'+esc(c.n)+'</div><div class="cost">'+esc(c.d)+' · ora '+now+' · livello '+lv+'/'+max+'</div></div><button class="act" data-up29="'+id+'">🪙 '+fmt(s.cost)+'</button></div>';}
function up29HTML(){let sum=0;for(let i=0;i<WU28.length;i++)sum+=WU28[i];
  let h='<div class="sub2">Potenzia qui, durante la partita. Hai 🪙 <b>'+fmt(P42.c)+'</b>. Un\'arma dal primo livello all\'ultimo chiede 🪙 '+fmt(sum)+': non basta una partita.</div><div class="craftSec">🔫 Armi</div>';
  let any=false;
  for(const w of WEAPONS){if(w.tool||!own[w.id]||!w.dmg)continue;any=true;const lv=wuLv(w.id);
    if(lv>=5)h+='<div class="recipe"><div><div class="name">'+esc(w.name)+'</div><div class="cost">Al massimo · danno +50% · livello 5/5</div></div></div>';
    else h+='<div class="recipe"><div><div class="name">'+esc(w.name)+'</div><div class="cost">Livello '+lv+'/5 · danno +'+(lv*10)+'% · il prossimo porta a +'+((lv+1)*10)+'%</div></div><button class="act" data-wu="'+w.id+'">🪙 '+fmt(WU28[lv])+'</button></div>';}
  if(!any)h+='<div class="sub2">Nessuna arma sbloccata da potenziare.</div>';
  h+='<div class="craftSec">🧍 Personaggio</div>';
  h+=up29Row('cu_atk')+up29Row('cu_def')+up29Row('cu_crit')+up29Row('cu_spd');
  return h;}
function up29Buy(id){try{const c=CSHOP.find(function(q){return q.id===id;});if(!c||!c.k)return;const s=cItem(c);
  if(s.done){toast(c.n+' al massimo',1200);return;}
  if(P42.L<s.lv){toast('🔒 Serve il livello '+s.lv,1600);return;}
  if(P42.c<s.cost){toast('Ti servono 🪙 '+fmt(s.cost)+' (ne hai '+fmt(P42.c)+')',1800);return;}
  addCoins(-s.cost);P42.cu[c.k]=Math.min(c.cost.length,(P42.cu[c.k]|0)+1);save42();gearStats();play('buy');
  toast(c.n+' · livello '+P42.cu[c.k]+'/'+c.cost.length,1500);if(craftTab==='up')renderCraft();
}catch(e){dbg29('err','potenziamento',e&&e.message||e);toast('Potenziamento non riuscito',1400);}}
{const t=$('craftTabs');if(t&&!t.querySelector('[data-c="up"]')){const b=document.createElement('button');b.className='tab';b.type='button';b.dataset.c='up';b.textContent='⚔️ Potenzia armi';t.appendChild(b);}}
const _rc29=renderCraft;renderCraft=function(){_rc29();if(!(SV.on&&craftTab==='up'))return;$('recipes').innerHTML=up29HTML();document.querySelectorAll('#craftTabs .tab').forEach(function(b){b.classList.toggle('on',b.dataset.c==='up');});};
$('recipes').addEventListener('click',function(e){const b=e.target.closest('button[data-up29]');if(b)up29Buy(b.dataset.up29);});
const _wu29=wuBuy;wuBuy=function(id){try{_wu29(id);}catch(e){dbg29('err','potenziamento',e&&e.message||e);return;}try{if(craftTab==='up')renderCraft();}catch(e){}};
let crit29=0;
const _dn29=dmgNumber;dmgNumber=function(pos,val,head,z){_dn29(pos,val,head,z);if(!crit29)return;crit29=0;try{const list=$('nums').querySelectorAll('.dmgNum');const d=list[list.length-1];if(d){d.style.color='#ffd56a';if(d.textContent.indexOf('CRIT')<0)d.textContent='CRIT '+d.textContent;}}catch(e){}};
const _dz29=damageZombie;damageZombie=function(z,dmg,part,point,dir){if(!z||z.dead)return _dz29(z,dmg,part,point,dir);let bonus=1;try{const lv=Math.min(100,(P42.cu&&P42.cu.crit)|0),ch=lv*0.25;if(ch>0&&Math.random()*100<ch){bonus=1.5;crit29=1;}}catch(e){dbg29('err','critico',e&&e.message||e);}return _dz29(z,dmg*bonus,part,point,dir,arguments[5]);};
const _sv29=svTarget433;svTarget433=function(z){const tg=_sv29(z);try{if(!z.alive||z.dead||z.flee||z.via433||z.tgtKind==='piece')return tg;if(z.ai!=='chase'&&z.ai!=='search')return tg;
  const P=z.g.position;
  let sx=0,sz=0;for(let i=0;i<zombies.length;i++){const o=zombies[i];if(o===z||!o.alive||o.dead)continue;const ax=P.x-o.g.position.x,az=P.z-o.g.position.z,dd=ax*ax+az*az;if(dd<2.2&&dd>1e-4){const m=Math.sqrt(dd);sx+=ax/m;sz+=az/m;}}
  return _v433.set(tg.x+sx*.4,0,tg.z+sz*.4);}catch(e){dbg29('err','zombie',e&&e.message||e);return tg;}};
function zLook29(z){if(z.look29||!z.spine||!z.mat)return;z.look29=1;const r=rng43(((z.seed*997)|0)+29),W=z.V.width||1;
  const list=[[ZG.brow,new T.Color(0x1a1614),[0,.58,.02],0,0,0,1.35*W,1.05,3.1],[ZG.belly,new T.Color(0x6a100c),[(r()-.5)*.22,.24,.15],0,0,(r()-.5)*.5,.5,.65,1],[ZG.belly,new T.Color(0x2a2118),[0,.02,.132],0,0,0,1.5*W,.4,1],[ZG.eye,new T.Color(0xcfc6a8),[(r()<.5?-.08:.08),.2,.17],0,0,0,.65,.45,1]];
  const m=new T.Mesh(mergePieces(list),z.mat);m.userData.look29=1;m.castShadow=false;z.spine.add(m);if(!z.d43)z.d43=[];z.d43.push(m);}
const _zm29=zMode43;zMode43=function(hi){_zm29(hi);for(const z of zombies){try{zLook29(z);}catch(e){dbg29('err','zombie',e&&e.message||e);}if(!z.d43)continue;for(let i=0;i<z.d43.length;i++){const m=z.d43[i];m.visible=!!hi||!!(m.userData&&m.userData.look29)||i===2;}}};
function bag29Check(){const root=$('bagScreen');if(!root||root.classList.contains('hidden'))return;const nodes=root.querySelectorAll('.bgI span,.gS small,.gT small,.bagHd h2,#bagCap,.eqStats div');
  nodes.forEach(function(el){if(!el.textContent||el.clientWidth<8)return;if(el.scrollWidth>el.clientWidth+3)dbg29('warn','zaino','Scritta tagliata nello zaino: '+el.textContent.trim().slice(0,48));});}
const _eq29=renderEq;renderEq=function(){_eq29();try{const box=document.querySelector('#eqPanel .eqStats');if(!box||box.querySelector('.cr29'))return;const lv=Math.min(100,(P42.cu.crit)|0);const d=document.createElement('div');d.className='cr29';d.innerHTML='💥 Critico <b>'+(lv*0.25).toFixed(1).replace('.',',')+'%</b>';box.appendChild(d);}catch(e){}};
const SUG29={last:0,ok:0,fail:0,err:''};
function sug29Rep(){return {inviati:SUG29.ok,falliti:SUG29.fail,ultimoErrore:SUG29.err};}
function sug29Open(){const s=$('sugScreen');if(!s)return;s.classList.remove('hidden');const m=$('sugMsg');if(m)m.textContent='';}
function sug29Close(){const s=$('sugScreen');if(s)s.classList.add('hidden');}
function sug29Send(){const box=$('sugText'),msg=$('sugMsg'),btn=$('sugSend');if(!box)return;
  const raw=String(box.value||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,' ').replace(/[<>]/g,'').trim();
  if(raw.length<4){if(msg)msg.textContent='Scrivi almeno qualche parola.';return;}
  if(raw.length>400){if(msg)msg.textContent='Massimo 400 caratteri.';return;}
  const nowMs=Date.now();if(nowMs-SUG29.last<20000){if(msg)msg.textContent='Attendi un attimo prima di mandarne un altro.';return;}
  SUG29.last=nowMs;if(btn)btn.disabled=true;if(msg)msg.textContent='Invio in corso…';
  let name='';try{name=pname();}catch(e){}
  const W=window.Telegram&&Telegram.WebApp;const init=W&&W.initData||'';
  fetch(ZS_API+'/suggest',{method:'POST',mode:'cors',headers:{'content-type':'text/plain'},body:JSON.stringify({initData:init,text:raw.slice(0,400),name:String(name||'').slice(0,32),v:'4.3.39',chat:7780175131})}).then(function(r){return r.json().catch(function(){return {};}).then(function(j){return {st:r.status,j:j};});}).then(function(x){
    if(btn)btn.disabled=false;const j=x.j||{};
    if(x.st>=200&&x.st<300&&j.ok){SUG29.ok++;SUG29.err='';box.value='';if(msg)msg.textContent='Inviato nella chat privata di chi gestisce il gioco.';return;}
    SUG29.fail++;SUG29.err=String(j.err||('HTTP '+x.st)).slice(0,160);
    dbg29('err','suggerimento','Suggerimento non inviato: '+SUG29.err);
    if(msg)msg.textContent='Non è arrivato nella chat ('+SUG29.err+'). Il testo è ancora qui: riprova tra poco.';
  }).catch(function(e){if(btn)btn.disabled=false;SUG29.fail++;SUG29.err=String(e&&e.message||e).slice(0,160);dbg29('err','suggerimento','Suggerimento non inviato: '+SUG29.err);if(msg)msg.textContent='Non è arrivato. Controlla la rete e riprova.';});}
const bSug=$('btnSug');if(bSug)bSug.addEventListener('click',sug29Open);
const bBack=$('sugBack');if(bBack)bBack.addEventListener('click',sug29Close);
const bSend=$('sugSend');if(bSend)bSend.addEventListener('click',sug29Send);
const sScr=$('sugScreen');if(sScr)sScr.addEventListener('click',function(e){if(e.target.id==='sugScreen')sug29Close();});
window.__rep29=function(){try{return {potenziamenti:{forza:(P42.cu.atk|0),difesa:(P42.cu.def|0),critico:(P42.cu.crit|0),velocita:(P42.cu.spd|0),costoArmaAlMassimo:WU28.reduce(function(a,b){return a+b;},0),armi:Object.assign({},P42.wu||{})},suggerimenti:sug29Rep(),neve:{visibile:!!(snow.parent&&snow.visible),secondo:!!(snow2.parent&&snow2.visible),citta:zsShow()?'asciutta':'inverno'}};}catch(e){return {err:String(e&&e.message||e)};}};
window.__sug29={open:sug29Open,send:sug29Send,rep:sug29Rep};
try{const q29=(typeof GFX43!=='undefined'&&GFX43.q)||'media';zMode43(q29!=='bassa');}catch(e){dbg29('err','zombie',e&&e.message||e);}
window.__zs429={up29HTML:up29HTML,up29Buy:up29Buy,WU28:WU28,zLook29:zLook29,bag29Check:bag29Check,hide:function(){return CSHOP.filter(function(c){return c.hide29;}).map(function(c){return c.id;});}};
function dryGround438(){if(!zsShow()||!ground)return;if(!ground.userData.dry){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.fillStyle='#8c897c';g.fillRect(0,0,256,256);let s=43821;const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  for(let i=0;i<16;i++){const x=rnd()*256,y=rnd()*256,R=18+rnd()*46;const gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,rnd()<.5?'rgba(118,114,102,.5)':'rgba(164,160,146,.42)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-R,y-R,R*2,R*2);}
  for(let i=0;i<700;i++){const v=64+(rnd()*46|0);g.fillStyle='rgba('+v+','+(v-4)+','+(v-10)+',.32)';g.fillRect(rnd()*256,rnd()*256,2,2);}
  g.strokeStyle='rgba(58,54,46,.4)';g.lineWidth=1;for(let i=0;i<5;i++){g.beginPath();let x=rnd()*256,y=rnd()*256;g.moveTo(x,y);for(let k=0;k<3;k++){x+=(rnd()-.5)*70;y+=(rnd()-.5)*70;g.lineTo(x,y);}g.stroke();}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(32,32);t.anisotropy=ani432();ground.userData.dry=t;}
  ground.material.map=ground.userData.dry;ground.material.color.setHex(0xffffff);ground.material.bumpMap=null;ground.material.needsUpdate=true;}
function apkDry438(){if(!zsShow())return;try{
  snow.visible=false;snow2.visible=false;snowGeo.setDrawRange(0,0);sn2G.setDrawRange(0,0);
  if(typeof FP43!=='undefined'&&FP43.m){FP43.m.visible=false;scene.remove(FP43.m);}
  scene.remove(snow);scene.remove(snow2);
  const kill=[];scene.traverse(function(o){const m=o.material;if(m===MAT.snow)kill.push(o);else if(m&&m.length){for(let i=0;i<m.length;i++)if(m[i]===MAT.snow){kill.push(o);break;}}});
  for(let i=0;i<kill.length;i++){const o=kill[i];if(o.parent)o.parent.remove(o);const k=solids.indexOf(o);if(k>=0)solids.splice(k,1);}
  LDAY.fog.setHex(0xb7c2bc);LDAY.near=26;LDAY.far=72;LDAY.sky.setHex(0xd4e3ea);LDAY.hc.setHex(0xc9d4c6);
  LDUSK.fog.setHex(0xa09088);LDUSK.near=18;LDUSK.far=56;
  dryGround438();try{applyLight();}catch(e){}
}catch(e){}}
apkDry438();

function updateDead439(z,dt){z.deadT+=dt;const k=z.deadT,dir=z.fdir||1,fl=z.flop||[-1,-.7,-.4,-.2,0];
  const buck=smooth(Math.min(1,k/.26)),raw=Math.min(1,Math.max(0,(k-.12)/.82)),fall=raw*raw*(3-2*raw);
  const pitch=k>0.96&&k<1.28?fall+Math.sin((k-0.96)/.32*Math.PI)*.05:fall,arm=smooth(Math.min(1,Math.max(0,(k-.2)/.62))),head=smooth(Math.min(1,Math.max(0,(k-.28)/.5))),lag=Math.sin(Math.min(1,k/.75)*Math.PI)*.42;
  z.kneeL.rotation.x=buck*1.28*(1-pitch*.58);z.kneeR.rotation.x=buck*1.08*(1-pitch*.5);z.hipL.rotation.x=-buck*.72+pitch*dir*.12;z.hipR.rotation.x=-buck*.38+pitch*dir*.06;
  z.hips.position.y=.95-buck*.2;z.hips.rotation.z=dir*buck*.14*(1-pitch);z.body.rotation.x=dir*pitch*1.18;z.body.rotation.z=dir*(buck*.07+Math.sin(k*3.1)*.035*(1-pitch));z.body.position.y=pitch*.03;
  z.spine.rotation.x=dir*pitch*.48;z.spine.rotation.z=Math.sin(k*2.4)*.07*(1-pitch);
  z.shL.rotation.x=fl[0]*arm-lag;z.shR.rotation.x=fl[1]*arm-lag*.75;z.shL.rotation.z=.58*arm;z.shR.rotation.z=-.38*arm;z.elL.rotation.x=fl[2]*arm-.45*(1-arm);z.elR.rotation.x=fl[3]*arm-.2*(1-arm);
  z.neck.rotation.x=-dir*.95*head;z.neck.rotation.z=fl[4]*head+Math.sin(k*4.2)*.09*(1-head);z.jaw.rotation.x=.08+.58*head;
  if(z.sv){z.g.position.addScaledVector(z.sv,dt);z.sv.multiplyScalar(Math.exp(-1.7*dt));}
  collide(z.g.position,.3);
  if(!z.landed&&pitch>.9){z.landed=true;_tmp.set(z.g.position.x+Math.sin(z.g.rotation.y)*dir*.75*z.V.scale,.02,z.g.position.z+Math.cos(z.g.rotation.y)*dir*.75*z.V.scale);emit(_tmp,_up,8,DUST,{speed:1.2,spread:.75,life:.55,size:.1,grav:.8});_n.set(0,1,0);addDecal(bloods,_tmp,_n,.9*z.V.scale);}
  if(k>4.8&&z.blob)z.blob.visible=false;if(k>6.4){z.alive=false;z.g.visible=false;updateHUD();}}
const _dead439=updateDead;updateDead=function(z,dt){if(!zsShow()||(z.V&&z.V.name==='bloater'))return _dead439(z,dt);updateDead439(z,dt);};
// 4.3.58 — connected districts; no movement of existing harvest nodes or loot IDs.
function map458Build(){
  if(!zsShow())return;
  const city=window.CITY4319;if(!city)return;
  let seed=458117;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},R=(a,b)=>a+(b-a)*rnd();
  const saved=svLoadData(),protectedLots=(saved&&saved.pc||[]).map(p=>({x0:p[1]-2.4,x1:p[1]+2.4,z0:p[2]-2.4,z1:p[2]+2.4}));
  if(saved&&saved.pos)protectedLots.push({x0:saved.pos[0]-4,x1:saved.pos[0]+4,z0:saved.pos[1]-4,z1:saved.pos[1]+4});
  const overlap=(a,b)=>a.x1>b.x0&&a.x0<b.x1&&a.z1>b.z0&&a.z0<b.z1;
  const lanes=[],buildings=[],decor=[],groups=new Map(),meshes=[];let activeBuilding=null;
  function rect(x,z,w,d,p){p=p||0;return {x0:x-w/2-p,x1:x+w/2+p,z0:z-d/2-p,z1:z+d/2+p};}
  function clear(x,z,w,d,p,roads){const a=rect(x,z,w,d,p);if(a.x0<-93||a.x1>93||a.z0<-93||a.z1>93||Math.hypot(x,z-2)<12)return false;
    if(protectedLots.some(b=>overlap(a,b))||boxes.some(b=>overlap(a,b)))return false;
    for(const h of HOUSE_RECTS)if(overlap(a,rect(h[0],h[1],h[2]*2,h[3]*2,.5)))return false;
    for(const c of circles)if(!c.off){const dx=c.x-Math.max(a.x0,Math.min(c.x,a.x1)),dz=c.z-Math.max(a.z0,Math.min(c.z,a.z1)),rad=c.node?Math.max(c.r,c.node.r||c.r):c.r;if(dx*dx+dz*dz<rad*rad)return false;}
    if(roads&&lanes.some(b=>overlap(a,b)))return false;return true;}
  function texture(w,h,draw){return canvasTex(w,h,(g)=>draw(g,w,h));}
  const roadMap=texture(512,512,(g,w,h)=>{g.fillStyle='#42494b';g.fillRect(0,0,w,h);for(let i=0;i<20000;i++){const v=52+(rnd()*48|0);g.fillStyle='rgba('+v+','+(v+3)+','+(v+4)+',.35)';g.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2);}g.strokeStyle='rgba(15,20,21,.48)';g.lineWidth=2;for(let i=0;i<12;i++){let x=rnd()*w,y=rnd()*h;g.beginPath();g.moveTo(x,y);for(let j=0;j<5;j++){x+=R(-25,25);y+=R(10,24);g.lineTo(x,y);}g.stroke();}});
  roadMap.wrapS=roadMap.wrapT=T.RepeatWrapping;roadMap.anisotropy=ani432();
  const asphalt=new T.MeshLambertMaterial({map:roadMap,color:0xffffff,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const stone=new T.MeshLambertMaterial({color:0x94978d}),roof=new T.MeshLambertMaterial({color:0x454e4c}),trim=new T.MeshLambertMaterial({color:0x6b7169}),mark=new T.MeshLambertMaterial({color:0xd3ccb0}),rust=new T.MeshLambertMaterial({color:0x755541});
  function part(geo,mat,x,y,z,w,h,d,yaw,rx){const key=geo.uuid+':'+mat.uuid;let list=groups.get(key);if(!list){list={geo,mat,parts:[]};groups.set(key,list);}list.parts.push({x,y,z,w,h,d,yaw:yaw||0,rx:rx||0,building:activeBuilding});}
  const plane=new T.PlaneGeometry(1,1),cube=new T.BoxGeometry(1,1,1);
  function floor(mat,x,z,w,d,y,yaw){part(plane,mat,x,y||.048,z,w,d,1,yaw,-Math.PI/2);}
  function street(x0,z0,x1,z1,width){const horizontal=z0===z1,len=Math.hypot(x1-x0,z1-z0),x=(x0+x1)/2,z=(z0+z1)/2;
    const a=rect(x,z,horizontal?len:width,horizontal?width:len,1.2);lanes.push(a);city.roads.push([x0,z0,x1,z1]);
    const geo=new T.PlaneGeometry(horizontal?len:width,horizontal?width:len);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(horizontal?len:width)/4,uv.getY(i)*(horizontal?width:len)/4);
    const m=new T.Mesh(geo,asphalt);m.rotation.x=-Math.PI/2;m.position.set(x,.038,z);m.receiveShadow=true;m.userData.map458=1;scene.add(m);meshes.push(m);
    for(const side of [-1,1]){const ox=horizontal?0:side*(width/2+.9),oz=horizontal?side*(width/2+.9):0;floor(stone,x+ox,z+oz,horizontal?len:1.4,horizontal?1.4:len,.041);}
    // Painted dashes rather than a stretched road image. Junctions stay clear.
    for(let i=4;i<len-3;i+=7){const px=x0+(x1-x0)*i/len,pz=z0+(z1-z0)*i/len;if(Math.abs(px)<5||Math.abs(pz)<5||Math.abs(pz+24)<5)continue;floor(mark,px,pz,horizontal?2.7:.12,horizontal?.12:2.7,.052);}
  }
  // The hospital blocks the direct eastern avenue: route behind its west wall.
  const routes=[[-76,-74,70,-74,7],[-76,19,-76,70,7],[-76,70,-26,70,7],[38,70,38,74,7],[38,74,70,74,7],[70,36,70,74,7],[70,-44,58,-44,7],[58,-44,58,-64,7],[58,-64,70,-64,7],[70,-64,70,-74,7],[-76,0,-48,0,6.4],[48,0,70,0,6.4],[0,-52,0,-74,7],[0,52,0,70,7]];
  routes.forEach(r=>street(...r));
  // Existing avenues are also reserved when choosing new lots.
  [[0,-96,0,96,8],[-96,-24,96,-24,7],[-48,0,48,0,5],[-46,20,46,20,5]].forEach(r=>{const h=r[1]===r[3];lanes.push(rect((r[0]+r[2])/2,(r[1]+r[3])/2,h?Math.abs(r[2]-r[0]):r[4],h?r[4]:Math.abs(r[3]-r[1]),1.2));});
  for(const r of city.roads){const h=Math.abs(r[1]-r[3])<.05;lanes.push(rect((r[0]+r[2])/2,(r[1]+r[3])/2,h?Math.abs(r[2]-r[0]):7,h?7:Math.abs(r[3]-r[1]),.4));}
  function facade(kind){return texture(512,1024,(g,w,h)=>{g.fillStyle=kind==='brick'?'#827566':kind==='industrial'?'#707972':'#93968b';g.fillRect(0,0,w,h);
    for(let i=0;i<12000;i++){g.fillStyle=rnd()<.5?'rgba(30,35,29,.09)':'rgba(234,225,204,.1)';g.fillRect(rnd()*w,rnd()*h,R(1,4),R(1,5));}
    if(kind==='brick'){g.strokeStyle='rgba(39,40,33,.24)';g.lineWidth=2;for(let y=0;y<h;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();for(let x=(y/24%2)*32;x<w;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+24);g.stroke();}}}
    const floors=kind==='industrial'?2:4,cols=kind==='industrial'?3:4;
    for(let row=0;row<floors;row++){const y=28+row*(h-180)/floors;g.fillStyle='rgba(27,32,28,.32)';g.fillRect(0,y+130,w,9);
      for(let col=0;col<cols;col++){const x=25+col*w/cols,ww=w/cols-48,hh=kind==='industrial'?94:100;g.fillStyle='#343c37';g.fillRect(x-6,y-6,ww+12,hh+12);g.fillStyle=rnd()<.18?'#847e57':'#243738';g.fillRect(x,y,ww,hh);g.fillStyle='rgba(177,192,182,.25)';g.fillRect(x+4,y+4,ww*.25,hh-8);g.fillStyle='#757c72';g.fillRect(x+ww/2-2,y,4,hh);g.fillRect(x,y+hh*.5,ww,3);
        if(rnd()<.32){g.strokeStyle='#46362a';g.lineWidth=9;g.beginPath();g.moveTo(x-4,y+hh*.25);g.lineTo(x+ww+4,y+hh*.8);g.stroke();}if(rnd()<.45){g.fillStyle='rgba(23,29,23,.25)';g.fillRect(x,y+hh+5,ww*.45,35+rnd()*55);}}
    }
    g.fillStyle='rgba(25,29,24,.65)';g.fillRect(0,h-110,w,110);g.fillStyle='#403e32';g.fillRect(w/2-38,h-128,76,128);g.fillStyle='#263331';g.fillRect(w/2-30,h-116,60,78);g.fillStyle='#a49666';g.fillRect(w/2+22,h-44,5,5);
    g.strokeStyle='rgba(32,39,32,.55)';g.lineWidth=3;for(let i=0;i<7;i++){let x=rnd()*w,y=rnd()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){x+=R(-14,14);y+=R(12,38);g.lineTo(x,y);}g.stroke();}
    const grime=g.createLinearGradient(0,h-240,0,h);grime.addColorStop(0,'rgba(23,35,25,0)');grime.addColorStop(1,'rgba(23,35,25,.55)');g.fillStyle=grime;g.fillRect(0,h-240,w,240);
  });}
  const faceMats=['plaster','brick','industrial'].map(k=>new T.MeshLambertMaterial({map:facade(k)}));
  const candidates=[[-42,-62,9,8,12,0], [43,-62,10,8,15,1], [-45,-84,9,8,10,1],[43,-85,10,8,12,0], [-62,37,10,9,10,1],[-62,55,12,9,5,2],[-42,60,10,8,5,2],[42,58,9,8,11,0],[60,42,8,9,9,1],[-60,-85,10,7,7,2],[58,-85,10,8,9,1],[27,56,8,7,6,2]];
  for(const c of candidates){const [x,z,w,d,h,k]=c;if(!clear(x,z,w,d,1.2,true))continue;
    const b=rect(x,z,w,d);b.map458=1;boxes.push(b);const house=[x,z,w/2,d/2],plot={x,z,w,d,kind:k===2?'ware':'flat'};HOUSE_RECTS.push(house);city.plots.push(plot);activeBuilding={x,z,w,d,h,kind:k,collider:b,house,plot};buildings.push(activeBuilding);
    part(cube,stone,x,h/2,z,w,h,d);part(cube,roof,x,h+.12,z,w+.4,.24,d+.4);part(cube,trim,x,h+.42,z,w+.3,.42,.16);part(cube,trim,x,h+.42,z-d/2,w+.3,.42,.16);
    for(const side of [-1,1]){part(plane,faceMats[k],x,h/2,z+side*(d/2+.016),w,h,1,side<0?Math.PI:0);part(plane,faceMats[k],x+side*(w/2+.016),h/2,z,d,h,1,side*Math.PI/2);}
    part(cube,roof,x-w*.2,h+.5,z+d*.12,1.8,.8,1.4);part(cube,rust,x+w*.25,h+.9,z-d*.22,.35,1.5,.35);
    // Small forecourts give buildings breathing room, without adding collision.
    floor(stone,x,z,w+2.5,d+2.5,.025);decor.push({x:x-w/2-1.8,z:z+d/2+1.7,kind:k===2?'industrial':'garden'});
  }
  activeBuilding=null;
  // Sidewalk crossings at the existing gates and district approaches.
  for(const p of [[0,-68],[0,59],[-62,0],[63,0],[-76,35],[70,42]])for(let i=-2;i<=2;i++)floor(mark,p[0]+i*1.05,p[1],.48,4,.055);
  // A shared atlas keeps cracks, water, foliage and stains to four draw calls.
  const atlas=texture(1024,1024,(g)=>{g.clearRect(0,0,1024,1024);
    function region(x,y,fn){g.save();g.translate(x,y);fn();g.restore();}
    region(0,0,()=>{const grad=g.createRadialGradient(256,256,32,256,256,205);grad.addColorStop(0,'rgba(58,83,85,.85)');grad.addColorStop(.7,'rgba(36,52,51,.75)');grad.addColorStop(1,'rgba(29,36,32,0)');g.fillStyle=grad;g.beginPath();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,rad=180+R(-25,25),x=256+Math.cos(a)*rad,y=256+Math.sin(a)*rad*.64;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.closePath();g.fill();g.strokeStyle='rgba(193,205,190,.5)';g.lineWidth=4;g.beginPath();g.ellipse(233,244,107,35,-.1,.1,2.4);g.stroke();g.fillStyle='rgba(200,208,191,.25)';g.beginPath();g.ellipse(220,235,65,10,-.1,0,7);g.fill();});
    region(512,0,()=>{for(let i=0;i<64;i++){const a=rnd()*6.28,r=Math.sqrt(rnd())*170,x=256+Math.cos(a)*r,y=256+Math.sin(a)*r*.6;g.fillStyle=i<28?'rgba(62,10,9,.72)':'rgba(111,18,15,.72)';g.beginPath();g.ellipse(x,y,R(7,38),R(3,15),rnd(),0,7);g.fill();}g.strokeStyle='rgba(89,14,12,.55)';g.lineWidth=12;g.beginPath();g.moveTo(80,320);g.bezierCurveTo(130,280,340,330,420,195);g.stroke();});
    region(0,512,()=>{for(let i=0;i<130;i++){const x=R(72,440),y=R(140,490),a=R(-1,1);g.strokeStyle=i%3?'rgba(74,85,39,.85)':'rgba(107,112,62,.85)';g.lineWidth=2+rnd()*3;g.beginPath();g.moveTo(x,510);g.quadraticCurveTo(x+a*30,y+60,x+a*44,y);g.stroke();for(let j=0;j<3;j++){g.fillStyle=i%2?'#546a3f':'#748447';g.beginPath();g.ellipse(x+a*30,y+j*40,5,14,a+.4,0,7);g.fill();}}});
    region(512,512,()=>{for(let i=0;i<26;i++){g.fillStyle=i%3?'rgba(44,46,40,.35)':'rgba(104,106,87,.38)';g.beginPath();g.ellipse(R(80,430),R(90,430),R(4,20),R(3,10),rnd()*6,0,7);g.fill();}g.strokeStyle='rgba(30,34,28,.75)';g.lineWidth=4;g.beginPath();g.moveTo(50,100);g.lineTo(180,210);g.lineTo(260,180);g.lineTo(300,300);g.lineTo(450,380);g.stroke();});
  });
  const atlasMat=new T.MeshLambertMaterial({map:atlas,transparent:true,alphaTest:.06,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const tileGeos=[];for(let i=0;i<4;i++){const geo=plane.clone(),uv=geo.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.48+.01+(i%2)*.5,uv.getY(j)*.48+.01+(i<2?.5:0));tileGeos.push(geo);}
  function decal(k,x,z,w,d,yaw){part(tileGeos[k],atlasMat,x,.063,z,w,d,1,yaw,-Math.PI/2);}
  // Puddles and potholes hug road edges; the middle remains open for movement.
  let puddles=0,plants=0,stains=0;const scenes=[];
  for(const r of routes){const len=Math.hypot(r[2]-r[0],r[3]-r[1]);if(len<18)continue;const hor=r[1]===r[3];for(let i=8;i<len-4;i+=16){const x=r[0]+(r[2]-r[0])*i/len,z=r[1]+(r[3]-r[1])*i/len,side=rnd()<.5?-1:1,px=x+(hor?0:side*2.2),pz=z+(hor?side*2.2:0);if(clear(px,pz,2,2,0,false)){decal(0,px,pz,R(2.3,3.6),R(1.6,2.7),rnd()*6);puddles++;decal(3,x+.8,z+.5,2.2,2.2,0);}const gx=x+(hor?0:side*5.3),gz=z+(hor?side*5.3:0);if(clear(gx,gz,1,1,0,false)){for(const angle of [0,Math.PI/2])part(tileGeos[2],atlasMat,gx,.55,gz,1.6,1.1,1,angle);plants++;}}}
  const storySpots=[[63,-43,'evac'],[-69,5,'station'],[28,73,'depot'],[-56,68,'depot'],[48,-73,'evac'],[-42,-72,'residential'],[67,40,'evac'],[-76,28,'station']];
  for(const p of storySpots){if(!clear(p[0],p[1],2.7,2.7,0,false))continue;const q={x:p[0],z:p[1],yaw:R(-.6,.6),kind:p[2]};scenes.push(q);decal(1,q.x,q.z,3.3,2.5,q.yaw);stains++;}
  // Direction panels: one texture per district; poles are instanced.
  const labels=[[-7,-58,'RESIDENZE','STAZIONE ←'],[8,57,'DEPOSITI','OFFICINE ←'],[-61,6,'STAZIONE','CENTRO →'],[62,6,'MERCATO','OSPEDALE ↑']];
  for(const p of labels){if(!clear(p[0],p[1],.4,.4,0,false))continue;const t=texture(512,256,(g,w,h)=>{g.fillStyle='#243b36';g.fillRect(0,0,w,h);g.strokeStyle='#c3c8af';g.lineWidth=10;g.strokeRect(9,9,w-18,h-18);g.fillStyle='#e4e7d5';g.textAlign='center';g.font='bold 46px sans-serif';g.fillText(p[2],w/2,100);g.font='32px sans-serif';g.fillText(p[3],w/2,190);});part(cube,trim,p[0],1.15,p[1],.12,2.3,.12);part(plane,new T.MeshLambertMaterial({map:t,side:T.DoubleSide}),p[0],2.25,p[1],2.1,1.05,1,p[0]>50?-Math.PI/2:p[0]<-50?Math.PI/2:0);}
  for(const list of groups.values()){const m=new T.InstancedMesh(list.geo,list.mat,list.parts.length),o=new T.Object3D();m.count=list.parts.length;m.castShadow=false;m.receiveShadow=true;m.userData.map458=1;m.userData.map458Parts=list.parts;list.parts.forEach((p,i)=>{o.position.set(p.x,p.y,p.z);o.rotation.set(p.rx,p.rx?0:p.yaw,p.rx?p.yaw:0);o.scale.set(p.w,p.h,p.d);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();scene.add(m);meshes.push(m);}
  city.tags.push(['Officine',-56,58],['Palazzi',-42,-62]);
  window.__map458={buildings,roads:routes,lanes,protectedLots,scenes,decor,meshes,puddles,plants,stains,addedCalls:meshes.length,seed:458117,preserve:map458Preserve};
  // Reuse the existing photograph assets for all horizontal pavements.
  new T.TextureLoader().load('assets/cc0/brick_pavement_02.jpg',t=>{t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=ani432();stone.map=t;stone.needsUpdate=true;},undefined,()=>{});
}
function map458Preserve(save){const map=window.__map458;if(!map||!save)return;for(const b of map.buildings){if(b.disabled)continue;const hit=(save.pc||[]).some(p=>Math.abs(p[1]-b.x)<b.w/2+2.4&&Math.abs(p[2]-b.z)<b.d/2+2.4)||(save.pos&&Math.abs(save.pos[0]-b.x)<b.w/2+.6&&Math.abs(save.pos[1]-b.z)<b.d/2+.6);if(!hit)continue;b.disabled=true;for(const list of [boxes,HOUSE_RECTS,CITY4319.plots]){const item=list===boxes?b.collider:list===HOUSE_RECTS?b.house:b.plot,i=list.indexOf(item);if(i>=0)list.splice(i,1);}for(const mesh of map.meshes){const parts=mesh.userData.map458Parts;if(!parts)continue;parts.forEach((p,i)=>{if(p.building===b)mesh.setMatrixAt(i,ZERO_M);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}}}
function map458Remains(){const map=window.__map458;if(!map)return;
  const groups=[[],[],[]],o=new T.Object3D(),deadCloth=new T.MeshLambertMaterial({color:0x4a534b}),deadSkin=new T.MeshLambertMaterial({color:0x9a8f78}),sole=new T.MeshLambertMaterial({color:0x2a302b});
  // Rounded human silhouettes, with bent limbs, share three instanced meshes.
  for(const p of map.scenes.filter((_,i)=>i%2===0)){
    const bits=[[0,.17,0,.52,.28,.8,0], [0,.19,.61,.26,.25,.3,1],[-.18,.1,-.64,.18,.18,.62,0],[.19,.1,-.66,.18,.18,.66,0],[-.36,.11,.12,.16,.16,.62,0],[.38,.1,.03,.16,.16,.6,0],[-.18,.09,-1.02,.2,.13,.25,2],[.19,.09,-1.08,.2,.13,.25,2]];
    for(const b of bits){const x=p.x+Math.cos(p.yaw)*b[0]+Math.sin(p.yaw)*b[2],z=p.z-Math.sin(p.yaw)*b[0]+Math.cos(p.yaw)*b[2];groups[b[6]].push({x,y:b[1],z,w:b[3],h:b[4],d:b[5],yaw:p.yaw});}
  }
  const geo=new T.SphereGeometry(.5,8,6);[deadCloth,deadSkin,sole].forEach((mat,k)=>{const list=groups[k];if(!list.length)return;const m=new T.InstancedMesh(geo,mat,list.length);m.receiveShadow=true;m.castShadow=false;m.userData.map458=1;list.forEach((p,i)=>{o.position.set(p.x,p.y,p.z);o.rotation.set(0,p.yaw,0);o.scale.set(p.w,p.h,p.d);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();scene.add(m);map.meshes.push(m);});
  // Reuse the readable skeleton geometry already built for the core map.
  const skeleton=scene.children.find(m=>m.userData&&m.userData.skel453);if(skeleton){const pts=map.scenes.filter((_,i)=>i%2===1);if(pts.length){const m=new T.InstancedMesh(skeleton.geometry,skeleton.material,pts.length);m.userData.map458=1;m.receiveShadow=true;pts.forEach((p,i)=>{o.position.set(p.x,.03,p.z);o.rotation.set(0,p.yaw,0);o.scale.set(.85,.85,.85);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();scene.add(m);map.meshes.push(m);}}
  // Low hedges reuse the existing leafy geometry and stay off roads and saved structures.
  const bush=scene.children.find(m=>m.userData&&m.userData.green449==='bush'),hedges=[];
  if(bush){for(const p of map.decor)for(const dx of [-.7,.7]){const x=p.x+dx,z=p.z,blocked=map.lanes.concat(map.protectedLots,boxes).some(b=>x+.65>b.x0&&x-.65<b.x1&&z+.65>b.z0&&z-.65<b.z1)||circles.some(c=>!c.off&&Math.hypot(x-c.x,z-c.z)<c.r+.65);if(!blocked)hedges.push({x,z});}
    if(hedges.length){const m=new T.InstancedMesh(bush.geometry,bush.material,hedges.length);m.userData.map458=1;m.receiveShadow=true;hedges.forEach((p,i)=>{o.position.set(p.x,0,p.z);o.rotation.set(0,i*1.7,0);o.scale.set(.8,.7,.8);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();scene.add(m);map.meshes.push(m);}}
  map.hedges=hedges.length;
  map.corpses=map.scenes.filter((_,i)=>i%2===0).length;map.skeletons=map.scenes.filter((_,i)=>i%2===1).length;
}

function apkPlan441(){if(!zsShow())return;const occ=(window.__map458?[...__map458.lanes,...__map458.protectedLots]:[]),fit=[];
  function span(c){const n=c.node;if(!n||!n.alive)return c.r;if(n.type==='pine')return Math.max(c.r,1.5*n.s);if(n.type==='dead')return Math.max(c.r,1.15*n.s);return Math.max(c.r,(n.r||c.r)+.15);}
  function hit(x0,x1,z0,z1){if(x0<-HALF+1.5||x1>HALF-1.5||z0<-HALF+1.5||z1>HALF-1.5)return true;
    for(const b of boxes)if(x1>b.x0&&x0<b.x1&&z1>b.z0&&z0<b.z1)return true;
    for(const c of circles)if(!c.off){const rad=span(c),cx=Math.max(x0,Math.min(c.x,x1)),cz=Math.max(z0,Math.min(c.z,z1));if((cx-c.x)*(cx-c.x)+(cz-c.z)*(cz-c.z)<rad*rad)return true;}
    for(const h of HOUSE_RECTS)if(x1>h[0]-h[2]&&x0<h[0]+h[2]&&z1>h[1]-h[3]&&z0<h[1]+h[3])return true;
    for(const a of occ)if(x1>a.x0&&x0<a.x1&&z1>a.z0&&z0<a.z1)return true;return false;}
  function hold(x,z,hx,hz){if(Math.hypot(x,z-2)<7&&hx>.45)return false;const a={x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz};if(hit(a.x0,a.x1,a.z0,a.z1))return false;occ.push(a);fit.push(a);return true;}
  function putSolid(x,z,w,d,h,mat){mesh(G.box,mat,x,h/2,z,w,h,d,null,false);boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});}
  function asphalt(x,z,w,d){const m=new T.Mesh(new T.PlaneGeometry(w,d),road.material);m.rotation.x=-Math.PI/2;m.position.set(x,.022,z);m.castShadow=false;m.receiveShadow=true;scene.add(m);}
  function walkway(x,z,w,d){if(!MAT.walk)return;if(hit(x-w/2,x+w/2,z-d/2,z+d/2))return;const m=new T.Mesh(new T.PlaneGeometry(w,d),MAT.walk);m.rotation.x=-Math.PI/2;m.position.set(x,.016,z);m.castShadow=false;m.receiveShadow=true;scene.add(m);}
  function patch(x,z,w,d,hex){const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshLambertMaterial({color:hex}));m.rotation.x=-Math.PI/2;m.position.set(x,.008,z);m.castShadow=false;m.receiveShadow=true;scene.add(m);}
  patch(-33,32,30,26,0x6a7356);patch(34,-40,26,16,0x6e6a62);
  const bars=[];
  for(const x of [15,19.2,23.4])if(hold(x,-24,1.35,1.45)){putSolid(x,-24,2.3,2.5,1.45,MAT.rust2||MAT.metal);bars.push(x);}
  if(hold(-30,-24,1.35,1.45)){putSolid(-30,-24,2.3,2.5,1.55,MAT.rust2||MAT.metal);bars.push(-30);}
  if(hold(7.4,30,1.55,4.3))putSolid(7.4,30,2.3,7.8,2.35,MAT.dark);
  if(hold(-7.6,-36,1.55,4.1))putSolid(-7.6,-36,2.3,7.4,2.2,MAT.dark);
  occ.push({x0:-4.8,x1:4.8,z0:-HALF,z1:HALF},{x0:-HALF,x1:HALF,z0:-27.8,z1:-20.2},{x0:-HALF,x1:HALF,z0:-2.7,z1:2.7},{x0:-50,x1:50,z0:17.5,z1:22.5});
  asphalt(-27,0,44,4.6);asphalt(27,0,44,4.6);asphalt(-26,20,40,4.4);asphalt(26,20,40,4.4);
  let u=44191;const pick=()=>{u=(Math.imul(u,1664525)+1013904223)>>>0;return u/4294967296;};
  function spots(step){const p=[];for(let x=-76;x<=76;x+=step)for(let z=-76;z<=76;z+=step)p.push([x,z]);for(let i=p.length-1;i>0;i--){const j=Math.floor(pick()*(i+1));const t=p[i];p[i]=p[j];p[j]=t;}return p;}
  let cut=0;
  function seal(c){const n=c.node;c.off=true;if(!n)return;n.lot441=1;n.alive=false;n.blocked=0;n.falling=0;n.grow=0;n.regrow=1e9;n.circle.off=true;nodeWrite(n);cut++;}
  function claim(x,z,hx,hz,maxSoft){if(hx>.4&&Math.hypot(x,z-2)<10)return false;const x0=x-hx,x1=x+hx,z0=z-hz,z1=z+hz;
    if(x0<-HALF+2||x1>HALF-2||z0<-HALF+2||z1>HALF-2)return false;
    for(const b of boxes)if(x1>b.x0&&x0<b.x1&&z1>b.z0&&z0<b.z1)return false;
    for(const h of HOUSE_RECTS)if(x1>h[0]-h[2]&&x0<h[0]+h[2]&&z1>h[1]-h[3]&&z0<h[1]+h[3])return false;
    for(const a of occ)if(x1>a.x0&&x0<a.x1&&z1>a.z0&&z0<a.z1)return false;
    const soft=[];
    for(const c of circles)if(!c.off){const rad=span(c),cx=Math.max(x0,Math.min(c.x,x1)),cz=Math.max(z0,Math.min(c.z,z1));if((cx-c.x)*(cx-c.x)+(cz-c.z)*(cz-c.z)>=rad*rad)continue;const n=c.node;if(n&&n.alive&&(n.type==='pine'||n.type==='dead'||n.type==='rock'))soft.push(c);else return false;}
    if(soft.length>maxSoft||cut+soft.length>40)return false;
    for(const c of soft)seal(c);const a={x0:x0,x1:x1,z0:z0,z1:z1};occ.push(a);fit.push(a);return true;}
  let wt=null;for(const p of spots(8)){if(Math.abs(p[0])>46||Math.abs(p[1])>46)continue;if(Math.hypot(p[0],p[1]-2)<16)continue;if(p[0]<-16&&p[1]>22)continue;if(claim(p[0],p[1],1.6,1.6,2)){wt=p;break;}}
  if(wt){const x=wt[0],z=wt[1],mat=MAT.rust2||MAT.metal;circles.push({x:x,z:z,r:1.35});
    for(const dx of [-.9,.9])for(const dz of [-.9,.9])mesh(G.box,mat,x+dx,4,z+dz,.16,8,.16,null,false);
    mesh(G.cyl,mat,x,8.5,z,2.35,1.6,2.35,null,false);mesh(G.cyl,MAT.dark,x,9.45,z,2.55,.22,2.55,null,false);}
  let dock=null;for(let x=28;x<=48&&!dock;x+=4)for(let z=-50;z<=-34&&!dock;z+=4)if(claim(x,z,2.7,1.9,3))dock={x:x,z:z};
  if(dock){putSolid(dock.x,dock.z,5.0,3.3,.5,MAT.stoneW||MAT.brick);mesh(G.box,MAT.stoneW||MAT.brick,dock.x,.14,dock.z+1.25,4.4,.28,.7,null,false);}
  const towers=[],TSC=.7,TH=3.05;
  function plant(x,z,sep,soft){if(towers.length>=6)return;if(Math.abs(x)>46||Math.abs(z)>46)return;if(x<-16&&z>22)return;if(Math.hypot(x,z-2)<12)return;if(towers.some(t=>(t.x-x)*(t.x-x)+(t.z-z)*(t.z-z)<sep*sep))return;if(!claim(x,z,TH,TH,soft))return;towers.push({x:x,z:z,yaw:(towers.length&1)?Math.PI/2:0,sc:TSC});const c=TSC*4;boxes.push({x0:x-c,x1:x+c,z0:z-c,z1:z+c});}
  for(const p of spots(4))plant(p[0],p[1],16,5);
  if(towers.length<4)for(const p of spots(5))plant(p[0],p[1],12,8);
  const rubble=[];
  function addRub(x,z,soft){if(rubble.length>=18)return;const ok=soft?claim(x,z,1.72,1.72,soft):hold(x,z,1.72,1.72);if(!ok)return;rubble.push({x:x,z:z,yaw:(rubble.length&1)?1.5708:0});boxes.push({x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5});}
  for(const t of towers){addRub(t.x+4.85,t.z,0);addRub(t.x-4.85,t.z,0);addRub(t.x,t.z+4.85,0);addRub(t.x,t.z-4.85,0);}
  for(const h of HOUSE_RECTS){addRub(h[0]+h[2]+1.95,h[1],0);addRub(h[0]-h[2]-1.95,h[1],0);addRub(h[0],h[1]+h[3]+1.95,0);addRub(h[0],h[1]-h[3]-1.95,0);}
  for(const p of spots(6)){if(rubble.length>=14)break;if(Math.abs(p[0])>48||Math.abs(p[1])>48||(p[0]<-16&&p[1]>22))continue;addRub(p[0],p[1],0);}
  if(rubble.length<8)for(const p of spots(6)){if(rubble.length>=12)break;if(Math.abs(p[0])>48||Math.abs(p[1])>48||(p[0]<-16&&p[1]>22))continue;addRub(p[0],p[1],1);}
  const pines=[],trunks=[];
  for(let x=-46;x<=-18;x+=8)for(let z=28;z<=46;z+=8)if(hold(x,z,1.75,1.75)){pines.push({x:x,z:z,yaw:(x*3+z)*.01});circles.push({x:x,z:z,r:.8});}
  for(let x=-42;x<=-22;x+=10)if(hold(x,34,2.3,1.35)){trunks.push({x:x,z:34,yaw:.6});boxes.push({x0:x-2.1,x1:x+2.1,z0:32.55,z1:35.45});}
  let s=44119;const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  let chunks=0;
  for(let t=0;t<100&&chunks<26;t++){const x=-46+rnd()*92,z=-46+rnd()*92,w=.65+rnd()*1.15,d=.55+rnd()*1.15,h=.16+rnd()*.42;if(!hold(x,z,w/2+.15,d/2+.15))continue;chunks++;mesh(G.box,MAT.stoneW||MAT.brick,x,h/2,z,w,h,d,null,false);boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});}
  const bins=[];
  for(const h of HOUSE_RECTS){let n=0;for(const [dx,dz] of [[0,1],[0,-1],[1,0],[-1,0]]){if(bins.length>=12||n>=2)break;const x=h[0]+dx*(h[2]+1.15)+dz*2.4,z=h[1]+dz*(h[3]+1.15)+dx*2.4;if(hold(x,z,.95,.8)){bins.push({x:x,z:z,yaw:dx?1.57:0});n++;}}}
  const barrels=[];
  for(let x=24;x<=44;x+=6)for(let z=-46;z<=-32;z+=6){if(barrels.length>=6)break;if(hold(x,z,.65,.65))barrels.push({x:x,z:z,yaw:rnd()*6});}
  const bodies=[];
  function bodyAt(x,z,yaw){if(bodies.length>=14)return;if(hold(x,z,1.15,1.15))bodies.push({x:x,z:z,yaw:yaw});}
  for(let x=-40;x<=40;x+=10){bodyAt(x,5,0);bodyAt(x,-5,3.14);}
  for(let z=-40;z<=40;z+=12){if(Math.abs(z)<8||Math.abs(z+24)<7||Math.abs(z-20)<7)continue;bodyAt(6.8,z,1.57);bodyAt(-6.8,z,-1.57);}
  for(let x=-44;x<=44;x+=8){walkway(x,3.9,7.2,1.45);walkway(x,-3.9,7.2,1.45);walkway(x,23.7,7.2,1.4);walkway(x,16.3,7.2,1.4);}
  for(let z=-44;z<=44;z+=8){if(Math.abs(z)<8||Math.abs(z+24)<6||Math.abs(z-20)<6)continue;walkway(6.5,z,1.45,7.2);walkway(-6.5,z,1.45,7.2);}
  let bad=0;for(let i=0;i<fit.length;i++)for(let j=i+1;j<fit.length;j++){const a=fit[i],b=fit[j];if(a.x1>b.x0&&a.x0<b.x1&&a.z1>b.z0&&a.z0<b.z1)bad++;}
  window.__plan441={towers:towers,rubble:rubble,pines:pines,trunks:trunks,bins:bins,barrels:barrels,bodies:bodies,bars:bars.length,chunks:chunks,dock:dock?[dock.x,dock.z]:null,wt:wt||null,cut:cut,bad:bad};
  window.__fit441=fit;
}
function apkDress439(){if(!zsShow())return;const plan=window.__plan441||{bins:[],bodies:[],barrels:[]};let s=43917;const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;},R=(a,b)=>a+(b-a)*rnd();
  const bins=plan.bins,bodies=plan.bodies,stains=[],trash=[],bones=[],barrels=plan.barrels,o=new T.Object3D();
  function put(mesh,i,x,y,z,yaw,sx,sy,sz,rx){o.position.set(x,y,z);o.rotation.set(rx||0,yaw,0);o.scale.set(sx,sy,sz);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);}
  const pal=[[0x2c4a34,0x3e6244],[0x4a3b30,0x5a4a3c],[0x2a3c4c,0x3c5264]];
  const groups=pal.map(()=>[]);bins.forEach((p,i)=>groups[i%3].push(p));
  const binMeshes=[];
  groups.forEach((list,gi)=>{const body=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:pal[gi][0]}),Math.max(1,list.length)),lid=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:pal[gi][1]}),Math.max(1,list.length));
    body.castShadow=lid.castShadow=false;body.receiveShadow=lid.receiveShadow=true;scene.add(body);scene.add(lid);binMeshes.push(body,lid);
    list.forEach((p,i)=>{put(body,i,p.x,.52,p.z,p.yaw,1.2,1.02,.82);put(lid,i,p.x,1.08,p.z,p.yaw,1.26,.1,.88);boxes.push({x0:p.x-.85,x1:p.x+.85,z0:p.z-.7,z1:p.z+.7});});
    body.count=lid.count=list.length;});
  const cloth=new T.MeshLambertMaterial({color:0x3a3832}),skin=new T.MeshLambertMaterial({color:0x6b5848}),bloodM=new T.MeshBasicMaterial({map:bloodTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const N=Math.max(1,bodies.length),torso=new T.InstancedMesh(G.box,cloth,N),head=new T.InstancedMesh(G.box,skin,N),limb=new T.InstancedMesh(G.box,cloth,Math.max(1,bodies.length*4));
  [torso,head,limb].forEach(m=>{m.userData.boxCorpse=1;m.castShadow=false;m.receiveShadow=true;scene.add(m);});let li=0;
  bodies.forEach((p,i)=>{put(torso,i,p.x,.08,p.z,p.yaw,.4,.14,.92,R(-.08,.08));put(head,i,p.x+Math.sin(p.yaw)*.52,.14,p.z+Math.cos(p.yaw)*.52,p.yaw,.2,.18,.22);
    [[.26,.16],[.26,-.16],[-.2,.12],[-.2,-.12]].forEach((of,k)=>{const x=p.x+Math.cos(p.yaw)*of[1]+Math.sin(p.yaw)*of[0],z=p.z+Math.sin(p.yaw)*of[1]-Math.cos(p.yaw)*of[0];put(limb,li++,x,.06,z,p.yaw+R(-.2,.2),k<2?.34:.46,.08,.14);});});
  torso.count=head.count=bodies.length;limb.count=li;
  const puddles=bodies.concat(stains),puddle=new T.InstancedMesh(new T.PlaneGeometry(1,1),bloodM,Math.max(1,puddles.length));puddle.frustumCulled=false;scene.add(puddle);
  puddles.forEach((p,i)=>{put(puddle,i,p.x,.03,p.z,p.yaw||0,1.15,.9,1,-Math.PI/2);});puddle.count=puddles.length;
  const junk=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:0x4a453c}),1);junk.castShadow=false;scene.add(junk);junk.count=0;
  const bone=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:0xd8d2c6}),1);bone.castShadow=false;scene.add(bone);bone.count=0;
  const bar=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:0x6a3a28}),Math.max(1,barrels.length));bar.castShadow=false;bar.receiveShadow=true;scene.add(bar);
  barrels.forEach((p,i)=>{put(bar,i,p.x,.38,p.z,p.yaw,.52,.74,.52);boxes.push({x0:p.x-.45,x1:p.x+.45,z0:p.z-.45,z1:p.z+.45});});bar.count=barrels.length;
  [torso,head,limb,puddle,junk,bone,bar].concat(binMeshes).forEach(m=>{m.instanceMatrix.needsUpdate=true;});
  window.__corpse440=bodies.map(p=>({x:p.x,z:p.z,yaw:p.yaw}));window.__dress439={bins:bins.length,bodies:bodies.length,stains:0,trash:0,bones:0,barrels:barrels.length};}
function bag439Layout(){const screen=$('bagScreen');if(!screen)return;const sheet=screen.querySelector('.bagSheet');if(!sheet||sheet.querySelector('.bagFit'))return;const fit=document.createElement('div');fit.className='bagFit';while(sheet.firstChild)fit.appendChild(sheet.firstChild);const note=fit.querySelector('.sub2');if(note)note.textContent='Se muori perdi i materiali dello zaino. Mettili nella cassa della base.';const close=$('bagCloseApk');if(close){close.classList.add('bagCloseRow');fit.appendChild(close);}sheet.appendChild(fit);}
function bag439Gear(){bag439Layout();const sheet=$('bagScreen')&&$('bagScreen').querySelector('.bagSheet');const fit=sheet&&sheet.querySelector('.bagFit');if(!fit)return;fit.style.transform='none';fit.style.width='100%';fit.style.height='100%';let side=fit.querySelector('.bagSide');if(!side){side=document.createElement('div');side.className='bagSide';side.id='bagEquipmentPanel457';side.setAttribute('role','tabpanel');side.setAttribute('aria-labelledby','bagEquipment457');fit.appendChild(side);}const eq=$('eqPanel');if(eq&&eq.parentElement!==side)side.appendChild(eq);let found=fit.querySelector('.bagFound');if(!found){found=document.createElement('div');found.className='bagFound';}if(found.parentElement!==side)side.appendChild(found);if(!eq)return;const bits=['.eqSub','.gGrid','.gInfo'].map(function(sel){return eq.querySelector(sel);}).filter(Boolean);if(!bits.length)return;found.replaceChildren();bits.forEach(function(el){found.appendChild(el);});}
function bag439Fit(){bag439Gear();}
window.__bag439=bag439Fit;
{const _ob439=openBag;openBag=function(){_ob439();requestAnimationFrame(bag439Fit);};const _rb439=renderBag;renderBag=function(){_rb439();requestAnimationFrame(bag439Fit);};const _re439=renderEq;renderEq=function(){_re439();requestAnimationFrame(bag439Fit);};addEventListener('resize',function(){if($('bagScreen')&&!$('bagScreen').classList.contains('hidden'))bag439Fit();});}

function parseObjC(text){const v=[],vc=[],pos=[],col=[];
  for(const raw of text.split(/\r?\n/)){const s=raw.trim();if(!s||s.charAt(0)==='#')continue;
    if(s.startsWith('v ')){const a=s.split(/\s+/);v.push(+a[1],+a[2],+a[3]);vc.push(a.length>4?+a[4]:1,a.length>5?+a[5]:1,a.length>6?+a[6]:1);}
    else if(s.startsWith('f ')){const p=s.split(/\s+/).slice(1).map(tok=>+tok.split('/')[0]);
      for(let i=1;i<p.length-1;i++)for(const k of [0,i,i+1]){const b=(p[k]-1)*3;pos.push(v[b],v[b+1],v[b+2]);col.push(vc[b],vc[b+1],vc[b+2]);}}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;}
function apkProps440(){if(!zsShow())return;const plan=window.__plan441||{towers:[],rubble:[],pines:[],trunks:[]};const CC='assets/cc0/',VQ='?v=4.3.77';
  const loadText=u=>fetch(CC+u+VQ).then(r=>{if(!r.ok)throw new Error(u);return r.text();});
  const loadImg=u=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error(u));i.src=CC+u+VQ;});
  Promise.all([loadText('corpse-skeleton.obj'),loadText('tree-pine.obj'),loadText('tree-trunk.obj'),loadText('ruin-tower.obj'),loadText('ruin-rubble-1.obj'),loadText('ruin-rubble-2.obj'),loadText('ruin-rubble-3.obj'),loadImg('blood-splatter.png')]).then(A=>{
    const geo=A.slice(0,7).map(parseObjC),bloodImg=A[7];
    const mat=new T.MeshLambertMaterial({vertexColors:true});
    const bloodTex2=new T.Texture(bloodImg);bloodTex2.colorSpace=T.SRGBColorSpace;bloodTex2.needsUpdate=true;
    const bloodM=new T.MeshBasicMaterial({map:bloodTex2,color:0x9a1218,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    scene.traverse(o=>{if(o.userData&&o.userData.boxCorpse)o.visible=false;if(o.userData&&o.userData.scenicPine)o.visible=false;});
    const o=new T.Object3D();
    function inst(g,n,fn){const m=new T.InstancedMesh(g,mat,Math.max(1,n));m.castShadow=false;m.receiveShadow=true;m.count=n;m.frustumCulled=false;scene.add(m);for(let i=0;i<n;i++){fn(i);m.setMatrixAt(i,o.matrix);}m.instanceMatrix.needsUpdate=true;return m;}
    const corpses=window.__corpse440||[];
    /* 4.3.53: scheletro proprio in dress453, il modello steso non si leggeva */
    inst(geo[1],plan.pines.length,(i)=>{const p=plan.pines[i];o.position.set(p.x,0,p.z);o.rotation.set(0,p.yaw,0);o.scale.set(2.4,2.4,2.4);o.updateMatrix();});
    inst(geo[2],plan.trunks.length,(i)=>{const p=plan.trunks[i];o.position.set(p.x,.42,p.z);o.rotation.set(0,p.yaw,-Math.PI/2);o.scale.set(1.6,5,1.6);o.updateMatrix();});
    inst(geo[3],plan.towers.length,(i)=>{const p=plan.towers[i];const sc=p.sc||.7;o.position.set(p.x,0,p.z);o.rotation.set(0,p.yaw||0,0);o.scale.set(sc,sc,sc);o.updateMatrix();});
    const rb=[[],[],[]];plan.rubble.forEach((p,i)=>rb[i%3].push(p));
    rb.forEach((list,k)=>inst(geo[4+k],list.length,(i)=>{const p=list[i];o.position.set(p.x,0,p.z);o.rotation.set(0,p.yaw,0);o.scale.set(.5,.5,.5);o.updateMatrix();}));
    scene.traverse(obj=>{if(obj.isInstancedMesh&&obj.geometry&&obj.geometry.type==='PlaneGeometry'&&obj.material&&obj.material.map===bloodTex){obj.material=bloodM;}});
    window.__props440={corpses:corpses.length,pines:plan.pines.length,trunks:plan.trunks.length,crypts:0,walls:0,towers:plan.towers.length,rubble:plan.rubble.length};
  }).catch(e=>{console.error(e);});}

