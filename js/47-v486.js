'use strict';
// ======================= v4.3.86: home buttons, crafting tabs (Personaggio / Potenzia armi), crafting from the backpack =======================
(function(){
const $$=id=>document.getElementById(id);
const css=`
#startScreen .playRow #btnNewRun .ic{display:inline-flex!important;font-size:22px;line-height:1}
#startScreen .playRow #btnNewRun{min-width:54px;justify-content:center}
#startScreen .menuRow.mp486{display:flex!important;margin-top:6px}
#startScreen #btnMp485{width:100%;min-height:40px!important;padding:4px 10px!important;background:linear-gradient(180deg,#2f6fb8,#1d4a82)!important;border:1px solid #5aa0ff!important}
#startScreen #btnMp485 small{display:inline!important;opacity:.8;margin-left:6px}
#craftTabs [data-c="tools"],#craftTabs [data-c="nade"]{display:none!important}
#craftTabs .tab img.ti486{width:16px;height:16px;vertical-align:-3px;margin-right:4px}
#bag484 .ac486{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}#bag484 .ac486 button{flex:1 1 100%;height:32px;border-radius:9px;border:0;font:900 12px/1.1 system-ui;color:#fff;background:linear-gradient(180deg,#5fae3a,#3c7d22);box-shadow:0 2px 0 #2a5a16}
#bag484 .ac486 button[disabled]{filter:grayscale(.8) brightness(.7)}#bag484 .ac486 small{display:block;font:700 10px system-ui;opacity:.85;margin-top:2px}
#overScreen #mpOver486{background:linear-gradient(180deg,#2f6fb8,#1d4a82)!important;color:#fff!important}
#hero484 .hImg{perspective:700px}#hero484 .hImg img{animation:spin486 7s ease-in-out infinite;transform-origin:50% 50%}@keyframes spin486{0%,100%{transform:rotateY(-30deg)}50%{transform:rotateY(30deg)}}
`;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
// ---- home: multiplayer row was hidden by the 4.3.82 rule '#startScreen .menuRow.one{display:none}' -> own class
function mpFix(){const b=$$('btnMp485');if(b&&b.parentNode&&!b.parentNode.classList.contains('mp486')){b.parentNode.classList.remove('one');b.parentNode.classList.add('mp486');}}
mpFix();setTimeout(mpFix,1600);setTimeout(mpFix,4000);
// ---- game over: multiplayer entry
try{const row=document.querySelector('#overScreen .btnRow');if(row&&!$$('mpOver486')){const b=document.createElement('button');b.className='act';b.id='mpOver486';b.textContent='👥 Gioca in due';row.insertBefore(b,$$('menuBtn'));
  b.addEventListener('click',()=>{try{const m=$$('menuBtn');m&&m.click();setTimeout(()=>{try{window.MP&&MP.open();}catch(e){}},250);}catch(e){}});}}catch(e){}
// ---- crafting tabs: Attrezzi/Granate gone (backpack), Armi -> Personaggio, Potenzia armi with drawn icon (+ weapons still to build)
function icon(kind){const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');g.lineCap='round';g.lineJoin='round';
  if(kind==='char'){g.fillStyle='#ffd27a';g.beginPath();g.arc(24,13,8,0,7);g.fill();g.beginPath();g.moveTo(10,44);g.quadraticCurveTo(10,24,24,24);g.quadraticCurveTo(38,24,38,44);g.closePath();g.fill();g.fillStyle='#ff8a3a';g.beginPath();g.moveTo(24,28);g.lineTo(28,34);g.lineTo(24,42);g.lineTo(20,34);g.closePath();g.fill();}
  else{const gr=g.createLinearGradient(0,0,48,48);gr.addColorStop(0,'#e6edf5');gr.addColorStop(1,'#8a96a6');g.fillStyle=gr;g.beginPath();g.moveTo(4,22);g.lineTo(34,22);g.lineTo(38,18);g.lineTo(44,18);g.lineTo(44,26);g.lineTo(26,26);g.lineTo(22,36);g.lineTo(15,36);g.lineTo(17,26);g.lineTo(4,26);g.closePath();g.fill();
    g.fillStyle='#ffb52e';g.beginPath();g.moveTo(30,4);g.lineTo(38,4);g.lineTo(38,10);g.lineTo(42,10);g.lineTo(34,16);g.lineTo(26,10);g.lineTo(30,10);g.closePath();g.fill();}
  return c.toDataURL();}
function tabs(){const t=$$('craftTabs');if(!t)return;const w=t.querySelector('[data-c="weap"]');if(w&&!w.dataset.r486){w.dataset.r486=1;w.innerHTML='<img class="ti486" alt="" src="'+icon('char')+'">Personaggio';}
  const u=t.querySelector('[data-c="up"]');if(u&&!u.dataset.r486){u.dataset.r486=1;u.innerHTML='<img class="ti486" alt="" src="'+icon('gun')+'">Potenzia armi';}
  try{if(craftTab==='tools'||craftTab==='nade')craftTab='mats';}catch(e){}}
tabs();
const base=window.renderCraft||renderCraft;
const R=function(){tabs();let tab;try{tab=craftTab;}catch(e){}
  if(!(typeof SV!=='undefined'&&SV.on)||(tab!=='weap'&&tab!=='up'&&tab!=='mats'))return base.apply(this,arguments);
  if(tab==='mats'){const r=base.apply(this,arguments);try{const b=document.querySelector('#recipes button[data-sv="band"]');b&&b.closest('.recipe').remove();}catch(e){}return r;}
  if(tab==='weap'){const r=base.apply(this,arguments);try{let h='<div class="sub2">Potenzia il personaggio · hai 🪙 <b>'+fmt(P42.c)+'</b></div>';h+=up29Row('cu_atk')+up29Row('cu_def')+up29Row('cu_crit')+up29Row('cu_spd');$$('recipes').innerHTML=h;}catch(e){}
    document.querySelectorAll('#craftTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.c==='weap'));return r;}
  // up: weapons that can still be built (no ammo refills) + weapon upgrades only
  let build='';try{craftTab='weap';base.apply(this,arguments);const box=$$('recipes');box.querySelectorAll('.recipe').forEach(r=>{const b=r.querySelector('button[data-i]');if(b&&!/Munizioni/.test(b.textContent)&&b.dataset.i!=='g')build+=r.outerHTML;});}catch(e){}finally{craftTab='up';}
  const r=base.apply(this,arguments);try{const box=$$('recipes');let h=box.innerHTML;const k=h.indexOf('<div class="craftSec">🧍 Personaggio</div>');if(k>0)h=h.slice(0,k);h=h.replace('<div class="craftSec">🔫 Armi</div>','');box.innerHTML=h+build;}catch(e){}
  document.querySelectorAll('#craftTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.c==='up'));try{requestAnimationFrame(()=>window.craftLayout482&&craftLayout482());}catch(e){}return r;};
window.renderCraft=R;try{renderCraft=R;}catch(e){}
try{const _u=up29Buy;up29Buy=function(){const r=_u.apply(this,arguments);try{if(craftTab==='weap')renderCraft();}catch(e){}return r;};window.up29Buy=up29Buy;}catch(e){}
// ---- backpack: craft ammo / grenades / bandages, upgrade tools (same costs and logic as the old crafting rows)
function btn(act,label,cost,ok){return '<button data-act486="'+act+'"'+(ok?'':' disabled')+'>'+label+(cost?'<small>'+cost+'</small>':'')+'</button>';}
function inject(){const root=$$('bag484');if(!root)return;const d=root.querySelector('.pn.det');if(!d||d.querySelector('.ac486'))return;
  const h=(d.querySelector('h3')||{}).textContent||'',sub=(d.querySelector('.sub')||{}).textContent||'';let html='';
  try{if(sub==='Esplosivo'){const w={cost:NADE_COST};html=btn('nade','💣 Crea 2 granate',costTxt(NADE_COST),canCraft(w)&&S.nades<NADE_MAX);}
  else if(sub==='Arma da fuoco'){const i=WEAPONS.findIndex(w=>w.name===h);const w=WEAPONS[i];if(w&&w.cost){const full=(res[w.id]|0)>=w.maxReserve;html=btn('ammo:'+i,full?'Riserva piena':'📦 Crea munizioni (+'+w.reserveGive+')',costTxt(w.cost),!full&&canCraft(w));}}
  else if(/^Attrezzo/.test(sub)){for(const k of ['axe','pick','hammer']){const w=WEAPONS.find(q=>q.id===k);if(w&&toolName(w)===h){const t=SV.tools[k]|0,nx=TOOL_UP[t+1];html=nx?btn('tool:'+k,'🛠️ Migliora a '+TIER_N[t+1],costTxt(nx),costOK(nx)):btn('x','Livello massimo ✔','',false);}}}
  if(/I materiali nello zaino/.test(root.textContent)&&typeof SV!=='undefined'&&SV.on){const c={wood:2,coal:1};html+=btn('band','🩹 Crea bende (+40 salute)',costTxt(c),costOK(c)&&player.hp<player.maxHp);}}catch(e){}
  if(html){const a=document.createElement('div');a.className='ac486';a.innerHTML=html;const ac=d.querySelector('.ac');ac?d.insertBefore(a,ac):d.appendChild(a);}}
function rer(){try{window.renderBag&&renderBag();}catch(e){}try{updateHUD();}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('#bag484 [data-act486]');if(!b||b.disabled)return;e.stopPropagation();const a=b.dataset.act486;
  try{if(a==='nade')craftNade();
  else if(a.startsWith('ammo:')){const w=WEAPONS[+a.slice(5)];if(w&&canCraft(w)){for(const r in w.cost)inv[r]-=w.cost[r];res[w.id]=Math.min(w.maxReserve,(res[w.id]|0)+w.reserveGive);play('craft');toast(w.name+': +'+w.reserveGive+' munizioni',1300);}}
  else if(a.startsWith('tool:'))svCraftClick({dataset:{tool:a.slice(5)}});
  else if(a==='band'){const c={wood:2,coal:1};if(costOK(c)){inv.wood-=2;inv.coal-=1;player.hp=Math.min(player.maxHp,player.hp+40);play('craft');toast('🩹 +40 salute',1200);}}}catch(err){console.warn('bag486',err);}
  rer();},true);
try{const root=$$('bag484');if(root){let q=0;new MutationObserver(()=>{if(q)return;q=1;requestAnimationFrame(()=>{q=0;inject();});}).observe(root,{childList:true,subtree:true});}}catch(e){}
})();
