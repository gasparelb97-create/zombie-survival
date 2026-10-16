'use strict';
// ======================= v4.3.82: drawn weapon art, crafting icons + paging, overlaps, coin-weapon viewmodels, windows, title + loading =======================
const M482={on:true};function e482(err,tag){try{if(window.__DBG&&__DBG.log)__DBG.log('v482:'+(tag||'?'),String(err&&err.message||err).slice(0,220));}catch(e){}}
const WA482={};
const WS482={knife:{blade:1},pistol:{b:.32,body:.42,st:'none',m:'grip',slide:1},revolver:{b:.38,body:.3,st:'none',m:'grip',cyl:1,wood:1},
 shotgun:{b:.62,body:.3,st:'wood',m:'tube',pump:1},dbarrel:{b:.62,body:.22,st:'wood',db:1},saw:{b:.34,body:.22,st:'wood',db:1,short:1},thunder:{b:.5,body:.38,st:'poly',m:'drum'},
 smg:{b:.22,body:.42,st:'skel',m:'box'},burst:{b:.3,body:.44,st:'poly',m:'curve',rail:1},ar:{b:.42,body:.46,st:'poly',m:'curve',rail:1},fox:{b:.5,body:.4,st:'wood',m:'box',rail:1,sc:.6},
 sniper:{b:.72,body:.4,st:'poly',m:'box',sc:1,bip:1},hunt:{b:.66,body:.36,st:'wood',m:'none',sc:1,bolt:1},crossbow:{bow:1},
 glauncher:{b:.3,body:.36,st:'poly',m:'none',cylBig:1},vespa:{b:.46,body:.3,st:'poly',m:'none',tube:1,olive:1},flamer:{b:.48,body:.4,st:'none',m:'none',tank:1},
 minigun:{multi:1},laser:{b:.4,body:.46,st:'poly',m:'box',glow:'#4af0ff'},plasma:{b:.4,body:.5,st:'poly',m:'none',glow:'#ff8a30'},
 axe:{tool:'axe'},pick:{tool:'pick'},hammer:{tool:'hammer'}};
function wArt482(id){if(WA482[id])return WA482[id];let url='';try{
  const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');const s=WS482[id]||{b:.4,body:.4,st:'poly',m:'box'};
  const metal=(y0,y1,dk)=>{const r=g.createLinearGradient(0,y0,0,y1);r.addColorStop(0,dk?'#5a616b':'#9aa3ae');r.addColorStop(.45,dk?'#2a2f36':'#4b525c');r.addColorStop(1,dk?'#121519':'#1d2126');return r;};
  const wood=(y0,y1)=>{const r=g.createLinearGradient(0,y0,0,y1);r.addColorStop(0,'#b07a46');r.addColorStop(.5,'#7a4a24');r.addColorStop(1,'#4a2a12');return r;};
  const poly=(y0,y1)=>{const r=g.createLinearGradient(0,y0,0,y1);r.addColorStop(0,s.olive?'#6b7a4a':'#3e434a');r.addColorStop(1,s.olive?'#2f3a20':'#16191d');return r;};
  const rr=(x,y,w,h,r,f)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fillStyle=f;g.fill();g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=1;g.stroke();};
  const hl=(x,y,w)=>{g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.stroke();};
  g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=8;g.shadowOffsetY=4;
  if(s.blade){rr(40,56,40,16,5,wood(56,72));rr(78,52,10,24,2,metal(52,76,1));g.beginPath();g.moveTo(88,56);g.lineTo(210,58);g.lineTo(222,64);g.lineTo(88,72);g.closePath();g.fillStyle=metal(56,72);g.fill();g.stroke();hl(92,59,110);}
  else if(s.tool){rr(50,60,170,10,4,wood(60,70));if(s.tool==='axe'){g.beginPath();g.moveTo(196,40);g.quadraticCurveTo(232,64,196,92);g.lineTo(186,74);g.lineTo(186,56);g.closePath();g.fillStyle=metal(40,92);g.fill();g.stroke();}
    else if(s.tool==='pick'){g.beginPath();g.moveTo(150,58);g.quadraticCurveTo(200,30,240,46);g.quadraticCurveTo(200,44,196,62);g.quadraticCurveTo(200,80,240,86);g.quadraticCurveTo(200,98,150,70);g.closePath();g.fillStyle=metal(40,90);g.fill();g.stroke();}
    else{rr(196,44,30,40,4,metal(44,84,1));rr(186,52,12,24,2,metal(52,76));}}
  else if(s.bow){rr(60,58,150,12,3,wood(58,70));rr(36,60,40,22,4,wood(60,82));g.strokeStyle='#2a2f36';g.lineWidth=6;g.beginPath();g.moveTo(206,30);g.quadraticCurveTo(190,64,206,98);g.stroke();g.strokeStyle='#ddd';g.lineWidth=1;g.beginPath();g.moveTo(206,30);g.lineTo(120,64);g.lineTo(206,98);g.stroke();rr(110,44,60,10,4,metal(44,54,1));}
  else if(s.multi){for(let i=0;i<3;i++)rr(120,50+i*7,120,6,2,metal(50+i*7,56+i*7,1));rr(80,44,48,36,6,poly(44,80));rr(232,46,10,30,3,metal(46,76,1));rr(60,74,40,30,6,'#5a4a2a');rr(96,30,36,12,4,poly(30,42));}
  else{const X0=30,len=196,bx=X0+len*(1-s.b-s.body)*.9+10,bw=len*s.body,ex=bx+bw,bl=len*s.b*(s.short?.8:1),yR=52;
    if(s.st==='wood'){g.beginPath();g.moveTo(bx,yR+2);g.lineTo(X0,yR+12);g.lineTo(X0,yR+38);g.lineTo(X0+14,yR+38);g.lineTo(bx+4,yR+20);g.closePath();g.fillStyle=wood(yR,yR+38);g.fill();g.stroke();}
    else if(s.st==='poly'){g.beginPath();g.moveTo(bx,yR+2);g.lineTo(X0+6,yR+6);g.lineTo(X0,yR+34);g.lineTo(X0+20,yR+34);g.lineTo(bx,yR+18);g.closePath();g.fillStyle=poly(yR,yR+34);g.fill();g.stroke();}
    else if(s.st==='skel'){g.strokeStyle='#22262b';g.lineWidth=4;g.beginPath();g.moveTo(bx,yR+4);g.lineTo(X0+20,yR+6);g.lineTo(X0+20,yR+28);g.lineTo(bx,yR+16);g.stroke();}
    if(s.tank){rr(bx-30,yR-6,40,40,14,'#8a2e26');}
    rr(bx,yR,bw,s.cyl?20:18,3,metal(yR,yR+18,1));hl(bx+3,yR+2,bw-6);
    if(s.slide){rr(bx,yR-4,bw+bl,14,3,metal(yR-4,yR+10));for(let i=0;i<5;i++){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(bx+6+i*4,yR-2,2,10);}}
    if(s.cyl){g.beginPath();g.arc(bx+bw*.45,yR+10,11,0,7);g.fillStyle=metal(yR,yR+20);g.fill();g.stroke();}
    if(s.cylBig){g.beginPath();g.arc(bx+bw*.55,yR+12,18,0,7);g.fillStyle=metal(yR-6,yR+30,1);g.fill();g.stroke();for(let i=0;i<6;i++){const a=i/6*6.28;g.beginPath();g.arc(bx+bw*.55+Math.cos(a)*10,yR+12+Math.sin(a)*10,3.5,0,7);g.fillStyle='#0c0e10';g.fill();}}
    const by=yR+(s.cyl?6:4);
    if(s.db){rr(ex,by-3,bl,7,3,metal(by-3,by+4));rr(ex,by+5,bl,7,3,metal(by+5,by+12));rr(ex,by+12,bl*.7,8,3,wood(by+12,by+20));}
    else if(s.tube){rr(ex-10,by-8,bl+10,20,8,poly(by-8,by+12));rr(ex+bl-6,by-10,10,24,3,metal(by-10,by+14,1));}
    else if(s.tank){rr(ex,by,bl,8,3,metal(by,by+8,1));rr(ex+bl-6,by-3,12,14,4,'#3a3f45');}
    else{rr(ex,by,bl,6,2,metal(by,by+6));hl(ex,by+1,bl);rr(ex+bl-8,by-1,10,8,2,metal(by-1,by+7,1));if(!s.slide&&s.m!=='tube'&&!s.cylBig)rr(ex,by-2,bl*.55,12,3,s.st==='wood'?wood(by-2,by+10):poly(by-2,by+10));}
    if(s.pump){rr(ex+bl*.15,by+8,bl*.35,10,3,wood(by+8,by+18));}
    g.beginPath();g.moveTo(bx+bw*.55,yR+16);g.lineTo(bx+bw*.48,yR+42);g.lineTo(bx+bw*.62,yR+42);g.lineTo(bx+bw*.72,yR+16);g.closePath();g.fillStyle=s.wood?wood(yR,yR+42):poly(yR,yR+42);g.fill();g.stroke();
    g.strokeStyle='#15181c';g.lineWidth=2;g.beginPath();g.arc(bx+bw*.82,yR+22,6,0,3.14);g.stroke();
    if(s.m==='box')rr(bx+bw*.82,yR+16,12,26,2,metal(yR+16,yR+42,1));
    if(s.m==='curve'){g.beginPath();g.moveTo(bx+bw*.8,yR+16);g.quadraticCurveTo(bx+bw*.8+4,yR+40,bx+bw*.8+16,yR+46);g.lineTo(bx+bw*.8+28,yR+40);g.quadraticCurveTo(bx+bw*.8+18,yR+34,bx+bw*.8+16,yR+16);g.closePath();g.fillStyle=metal(yR+16,yR+46,1);g.fill();g.stroke();}
    if(s.m==='drum'){g.beginPath();g.arc(bx+bw*.85,yR+32,14,0,7);g.fillStyle=metal(yR+18,yR+46,1);g.fill();g.stroke();}
    if(s.rail){for(let i=0;i<Math.floor(bw/6);i++){g.fillStyle='#1a1d21';g.fillRect(bx+2+i*6,yR-4,4,4);}}
    if(s.sc){const sw=bw*1.2*s.sc;rr(bx+bw*.1,yR-16,sw,10,5,metal(yR-16,yR-6,1));rr(bx+bw*.05,yR-19,10,16,4,metal(yR-19,yR-3,1));rr(bx+bw*.1+sw-6,yR-19,12,16,4,metal(yR-19,yR-3,1));g.fillStyle='#111';g.fillRect(bx+bw*.4,yR-6,4,6);g.fillRect(bx+bw*.7,yR-6,4,6);}
    if(s.bolt){g.fillStyle='#9aa3ae';g.beginPath();g.arc(bx+bw*.55,yR+4,4,0,7);g.fill();g.fillRect(bx+bw*.55,yR+2,10,3);}
    if(s.bip){g.strokeStyle='#22262b';g.lineWidth=3;g.beginPath();g.moveTo(ex+bl*.5,by+6);g.lineTo(ex+bl*.42,by+30);g.moveTo(ex+bl*.5,by+6);g.lineTo(ex+bl*.6,by+30);g.stroke();}
    if(s.glow){g.shadowColor=s.glow;g.shadowBlur=14;g.fillStyle=s.glow;g.fillRect(bx+6,yR+7,bw-12,3);g.fillRect(ex+4,by+2,bl-12,2);}}
  g.restore();url=c.toDataURL('image/png');}catch(e){e482(e,'art');}WA482[id]=url;return url;}
function artAll482(){const o={};try{for(const w of WEAPONS){if(w&&w.id){const u=wArt482(w.id);if(u)o[w.id]=u;}}}catch(e){}return o;}
function thumbsMerge482(){try{const A=artAll482();if(!THUMBS)THUMBS={};Object.assign(THUMBS,A);}catch(e){e482(e,'merge');}}
for(const fn of ['renderShop','renderWBar','renderThumbs','renderBag','bagRender468','sh431Open','sh431Weapon']){try{const f=window[fn];if(typeof f!=='function')continue;window[fn]=function(){thumbsMerge482();return f.apply(this,arguments);};}catch(e){}}
thumbsMerge482();
function swapImg482(){try{document.querySelectorAll('img[src*="assets/thumbs/"]').forEach(im=>{const m=/assets\/thumbs\/([a-z0-9_]+)\.webp/.exec(im.getAttribute('src')||'');if(m){const u=wArt482(m[1]);if(u)im.src=u;}});}catch(e){}}
try{let pend=0;const mo=new MutationObserver(()=>{if(pend)return;pend=1;setTimeout(()=>{pend=0;swapImg482();},120);});for(const id of ['shopList','wbar','bagScreen','arenaGuns','craftScreen'])try{const el=document.getElementById(id);if(el)mo.observe(el,{childList:true,subtree:true});}catch(e){}}catch(e){}
// coin weapons get the hi-detail viewmodels of their family (no more crossbow-looking blocks)
try{if(typeof HIB43==='object'){const al={fox:'ar',burst:'smg',saw:'dbarrel',hunt:'sniper',vespa:'glauncher'};for(const k in al)if(!HIB43[k]&&HIB43[al[k]])HIB43[k]=HIB43[al[k]];
  try{vmMode43(typeof GFX43!=='undefined'?GFX43.q!=='bassa':true);}catch(e){e482(e,'vm');}}}catch(e){e482(e,'hib');}
try{const _eq=equip;equip=function(i){const r=_eq.apply(this,arguments);try{const w=WEAPONS[curW];for(const k in VM)VM[k].visible=!!w&&k===w.id;}catch(e){}return r;};}catch(e){}
// ---------- crafting: icons for every recipe + paging grid (no scroll) ----------
const CI482={};
function cIcon482(key){if(CI482[key])return CI482[key];let u='';try{if(WS482[key])u=wArt482(key);else{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
  const glow=col=>{const r=g.createRadialGradient(48,48,4,48,48,46);r.addColorStop(0,col);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,96,96);};
  if(key==='band'){glow('rgba(255,90,90,.35)');g.save();g.translate(48,48);g.rotate(-.6);g.fillStyle='#f3e2c8';g.fillRect(-36,-12,72,24);g.fillStyle='#e0c9a6';g.fillRect(-12,-12,24,24);g.restore();g.fillStyle='#e33';g.fillRect(70,14,6,18);g.fillRect(64,20,18,6);}
  else if(key==='metal'){glow('rgba(180,210,255,.3)');for(let i=0;i<3;i++){const y=60-i*14,x=20+i*6;g.fillStyle='#8a99aa';g.beginPath();g.moveTo(x,y);g.lineTo(x+46,y);g.lineTo(x+54,y-10);g.lineTo(x+8,y-10);g.closePath();g.fill();g.fillStyle='#c5d2e0';g.fillRect(x+10,y-9,36,3);}}
  else if(key==='nade'){glow('rgba(140,200,90,.3)');g.fillStyle='#3a5a2c';g.beginPath();g.ellipse(46,58,22,28,0,0,7);g.fill();g.strokeStyle='#22381a';g.lineWidth=2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(26,58+i*9);g.lineTo(66,58+i*9);g.stroke();}g.fillStyle='#9aa3ae';g.fillRect(38,22,16,12);g.strokeStyle='#c9a23a';g.lineWidth=3;g.beginPath();g.arc(62,24,8,0,6.28);g.stroke();g.fillStyle='#6a737e';g.fillRect(52,20,18,5);}
  else if(key==='ammo'){glow('rgba(255,200,90,.3)');g.fillStyle='#4a5a32';g.fillRect(14,40,68,40);g.fillStyle='#2f3a20';g.fillRect(14,36,68,8);for(let i=0;i<5;i++){g.fillStyle='#c9a23a';g.fillRect(22+i*12,18,8,22);}}
  else if(key==='med'){glow('rgba(255,80,80,.35)');g.fillStyle='#f2f2f2';g.fillRect(18,30,60,44);g.fillStyle='#d33';g.fillRect(42,36,12,32);g.fillRect(32,46,32,12);}
  else if(key==='rep'){glow('rgba(255,200,120,.3)');g.save();g.translate(48,48);g.rotate(-.7);g.fillStyle='#7a4a24';g.fillRect(-4,-6,8,44);g.fillStyle='#5a616b';g.fillRect(-18,-22,36,16);g.restore();}
  else if(key==='up'){glow('rgba(120,220,255,.35)');g.fillStyle='#4af0ff';g.beginPath();g.moveTo(48,14);g.lineTo(76,46);g.lineTo(58,46);g.lineTo(58,82);g.lineTo(38,82);g.lineTo(38,46);g.lineTo(20,46);g.closePath();g.fill();}
  else if(key==='chest'){glow('rgba(255,200,120,.3)');g.fillStyle='#7a4a24';g.fillRect(14,38,68,40);g.fillStyle='#5a3418';g.fillRect(14,30,68,12);g.fillStyle='#c9a23a';g.fillRect(44,40,8,12);}
  else{glow('rgba(255,255,255,.2)');g.fillStyle='#9aa3ae';g.beginPath();g.arc(48,48,22,0,7);g.fill();}
  u=c.toDataURL('image/png');}}catch(e){e482(e,'cicon');}CI482[key]=u;return u;}
function recipeKey482(row){const b=row.querySelector('button')||{dataset:{}},d=b.dataset||{},nm=((row.querySelector('.name')||{}).textContent||'').toLowerCase();
  if(d.i==='g'||/granat/.test(nm))return 'nade';if(d.i!=null&&d.i!==''&&WEAPONS[+d.i])return WEAPONS[+d.i].id;
  if(d.wu)return d.wu;if(d.svc)return d.svc;if(d.up29)return 'up';if(d.ch28)return 'chest';if(d.sv==='band'||/bend/.test(nm))return 'band';if(/metallo/.test(nm))return 'metal';
  if(/ascia/.test(nm))return 'axe';if(/piccon/.test(nm))return 'pick';if(/martell/.test(nm))return 'hammer';
  for(const w of WEAPONS)if(w&&w.name&&nm.indexOf(w.name.toLowerCase())>=0)return w.id;return 'x';}
const CP482={page:0};
function craftLayout482(){try{const box=$('recipes'),scr=$('craftScreen');if(!box||!scr||scr.classList.contains('hidden'))return;const rows=[...box.querySelectorAll('.recipe')];
  for(const row of rows){let pv=row.querySelector('.pv481');if(!pv){pv=document.createElement('div');pv.className='pv481';row.insertBefore(pv,row.firstChild);}
    const k=recipeKey482(row);if(pv.dataset.k!==k||!pv.querySelector('img')){pv.dataset.k=k;pv.innerHTML='';const u=cIcon482(k);if(u){const im=document.createElement('img');im.alt='';im.src=u;pv.appendChild(im);}}}
  const H=box.clientHeight,W=box.clientWidth;if(!H||!W)return;const cols=W>=720?3:W>=460?2:1,per=cols*Math.max(1,Math.floor((H+6)/74));
  box.style.gridTemplateColumns='repeat('+cols+',minmax(0,1fr))';const pages=Math.max(1,Math.ceil(rows.length/per));if(CP482.page>=pages)CP482.page=pages-1;
  rows.forEach((r,i)=>{r.style.display=(i>=CP482.page*per&&i<(CP482.page+1)*per)?'':'none';});
  let pg=$('craftPg482');if(!pg){pg=document.createElement('div');pg.id='craftPg482';pg.innerHTML='<button type="button" data-p="-1">‹</button><span></span><button type="button" data-p="1">›</button>';box.parentNode.insertBefore(pg,box.nextSibling);
    pg.addEventListener('click',e=>{const b=e.target.closest('button[data-p]');if(!b)return;CP482.page=Math.max(0,CP482.page+(+b.dataset.p));craftLayout482();});}
  pg.style.display=pages>1?'flex':'none';pg.querySelector('span').textContent=(CP482.page+1)+' / '+pages;}catch(e){e482(e,'craftLay');}}
try{const _rc=renderCraft;renderCraft=function(){const r=_rc.apply(this,arguments);try{craftLayout482();requestAnimationFrame(craftLayout482);}catch(e){}return r;};}catch(e){}
try{$('craftTabs').addEventListener('click',()=>{CP482.page=0;},true);}catch(e){}
addEventListener('resize',()=>{try{craftLayout482();}catch(e){}});
// ---------- drawn SVG icons (no emoji) ----------
const IC482={
 shield:'<svg viewBox="0 0 48 48"><defs><linearGradient id="i8s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf6a"/><stop offset="1" stop-color="#a8641a"/></linearGradient></defs><path d="M24 4l16 6v12c0 11-7 18-16 22C15 40 8 33 8 22V10z" fill="url(#i8s)" stroke="#3a2208" stroke-width="2"/><path d="M24 11l9 3.5v8c0 7-4 11.5-9 14-5-2.5-9-7-9-14v-8z" fill="#7a1e14"/><path d="M24 16l2.4 5 5.4.6-4 3.6 1.2 5.3L24 27.8l-5 2.7 1.2-5.3-4-3.6 5.4-.6z" fill="#ffd27a"/></svg>',
 members:'<svg viewBox="0 0 48 48"><circle cx="17" cy="16" r="6" fill="#cfd6e0"/><circle cx="32" cy="15" r="5" fill="#8f9aa8"/><path d="M6 38c0-7 5-12 11-12s11 5 11 12z" fill="#cfd6e0"/><path d="M24 36c1-6 4-10 8-10 5 0 9 4 9 10z" fill="#8f9aa8"/></svg>',
 chat:'<svg viewBox="0 0 48 48"><path d="M8 10h32a4 4 0 014 4v16a4 4 0 01-4 4H22l-9 7v-7H8a4 4 0 01-4-4V14a4 4 0 014-4z" fill="#4a90c8" stroke="#1d3a55" stroke-width="2"/><rect x="12" y="17" width="22" height="3" rx="1.5" fill="#e8f2fa"/><rect x="12" y="24" width="15" height="3" rx="1.5" fill="#e8f2fa"/></svg>',
 scroll:'<svg viewBox="0 0 48 48"><rect x="10" y="8" width="26" height="32" rx="3" fill="#e8d4a6" stroke="#6a4a22" stroke-width="2"/><rect x="6" y="6" width="34" height="6" rx="3" fill="#c9a86a" stroke="#6a4a22" stroke-width="2"/><rect x="10" y="36" width="34" height="6" rx="3" fill="#c9a86a" stroke="#6a4a22" stroke-width="2"/><path d="M15 18h16M15 23h16M15 28h10" stroke="#6a4a22" stroke-width="2"/></svg>',
 star:'<svg viewBox="0 0 48 48"><path d="M24 5l5.6 11.6 12.7 1.8-9.2 9 2.2 12.6L24 34l-11.3 6 2.2-12.6-9.2-9 12.7-1.8z" fill="#ffc83a" stroke="#8a5a0a" stroke-width="2"/></svg>',
 search:'<svg viewBox="0 0 48 48"><circle cx="20" cy="20" r="11" fill="none" stroke="#cfd6e0" stroke-width="4"/><path d="M28 28l11 11" stroke="#cfd6e0" stroke-width="5" stroke-linecap="round"/></svg>',
 create:'<svg viewBox="0 0 48 48"><path d="M24 4l16 6v12c0 11-7 18-16 22C15 40 8 33 8 22V10z" fill="#2a3a2a" stroke="#7dd87d" stroke-width="2"/><path d="M24 15v16M16 23h16" stroke="#7dd87d" stroke-width="4" stroke-linecap="round"/></svg>',
 rkc:'<svg viewBox="0 0 48 48"><path d="M8 34l4-20 8 9 4-13 4 13 8-9 4 20z" fill="#ffc83a" stroke="#8a5a0a" stroke-width="2"/><rect x="8" y="34" width="32" height="6" rx="2" fill="#d89a2a"/></svg>',
 rka:'<svg viewBox="0 0 48 48"><path d="M24 6l14 6v10c0 9-6 15-14 19-8-4-14-10-14-19V12z" fill="#7a8ca8" stroke="#2a3448" stroke-width="2"/><path d="M16 20l8 6 8-6M16 27l8 6 8-6" stroke="#e8eef5" stroke-width="3" fill="none"/></svg>',
 rkm:'<svg viewBox="0 0 48 48"><path d="M24 8l12 5v9c0 8-5 13-12 17-7-4-12-9-12-17v-9z" fill="#5a6470" stroke="#22282e" stroke-width="2"/><path d="M18 24l8 0" stroke="#e8eef5" stroke-width="3"/></svg>',
 gear:'<svg viewBox="0 0 48 48"><path d="M21 4h6l1 6 4 2 5-4 4 4-4 5 2 4 6 1v6l-6 1-2 4 4 5-4 4-5-4-4 2-1 6h-6l-1-6-4-2-5 4-4-4 4-5-2-4-6-1v-6l6-1 2-4-4-5 4-4 5 4 4-2z" fill="#9aa3ae" stroke="#2a2f36" stroke-width="1.5"/><circle cx="24" cy="24" r="6" fill="#1a1e24"/></svg>',
 sound:'<svg viewBox="0 0 48 48"><path d="M8 18h8l10-8v28l-10-8H8z" fill="#cfd6e0"/><path d="M32 16c4 4 4 12 0 16M36 11c7 7 7 19 0 26" stroke="#cfd6e0" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
 shop:'<svg viewBox="0 0 48 48"><path d="M8 14h32l-3 22H11z" fill="#c9a23a" stroke="#5a3a0a" stroke-width="2"/><path d="M17 14c0-6 3-9 7-9s7 3 7 9" stroke="#5a3a0a" stroke-width="3" fill="none"/></svg>',
 arena:'<svg viewBox="0 0 48 48"><path d="M10 38L34 10M14 10l24 28" stroke="#cfd6e0" stroke-width="4" stroke-linecap="round"/><path d="M30 8l8 0 0 8M18 8l-8 0 0 8" stroke="#ff7a4a" stroke-width="3" fill="none"/></svg>',
 play:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#ff7a1a" stroke="#6a2a06" stroke-width="2"/><path d="M19 14l15 10-15 10z" fill="#fff"/></svg>',
 bug:'<svg viewBox="0 0 48 48"><ellipse cx="24" cy="27" rx="10" ry="13" fill="#c84a3a" stroke="#4a1208" stroke-width="2"/><circle cx="24" cy="12" r="5" fill="#4a1208"/><path d="M24 15v24M14 22l-6-3M34 22l6-3M14 30H7M34 30h7M15 37l-5 4M33 37l5 4" stroke="#4a1208" stroke-width="2"/></svg>'};
function ic482(k,cls){return '<i class="ic482 '+(cls||'')+'">'+(IC482[k]||'')+'</i>';}
// ---------- CSS ----------
{const st=document.createElement('style');st.id='v482css';st.textContent=
 '.ic482{display:inline-flex;width:1.6em;height:1.6em;vertical-align:middle;flex:0 0 auto}.ic482 svg{width:100%;height:100%}'+
 '#craftScreen .sheet{max-height:calc(100vh - 8px - var(--sat,0px) - var(--sab,0px))!important;height:calc(100vh - 8px - var(--sat,0px) - var(--sab,0px));width:min(980px,98vw)!important;max-width:min(980px,98vw)!important;overflow:hidden!important;display:flex;flex-direction:column;padding:8px 10px!important}'+
 '#craftScreen h2{font-size:15px;margin:0 0 2px}#craftScreen #craftMats{font-size:11px;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#craftScreen .tabs{margin:2px 0 6px;flex-wrap:nowrap;overflow:hidden}#craftScreen .tabs .tab{font-size:12px;padding:5px 8px;white-space:nowrap}'+
 '#craftScreen #recipes{flex:1;min-height:0;overflow:hidden!important;display:grid!important;gap:6px;align-content:start;padding:0!important}'+
 '#craftScreen #recipes .recipe{margin:0!important;display:grid!important;grid-template-columns:52px minmax(0,1fr) auto;gap:6px;align-items:center;padding:5px 6px!important;height:68px;box-sizing:border-box;overflow:hidden}'+
 '#craftScreen #recipes .recipe .pv481{width:52px;height:52px;background:radial-gradient(circle at 50% 40%,#232a35,#0c1016)}'+
 '#craftScreen #recipes .recipe .name{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#craftScreen #recipes .recipe .stats{display:none}#craftScreen #recipes .recipe .cost{font-size:10.5px;line-height:1.2;max-height:2.5em;overflow:hidden}'+
 '#craftScreen #recipes .recipe>div:nth-child(2){min-width:0}#craftScreen #recipes .recipe button{font-size:11.5px;padding:6px 8px;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis}'+
 '#craftScreen #recipes .craftSec,#craftScreen #recipes>.sub2{grid-column:1/-1;font-size:11px;margin:0}'+
 '#craftPg482{display:none;justify-content:center;align-items:center;gap:14px;flex:0 0 auto;margin-top:4px}#craftPg482 button{width:44px;height:30px;border-radius:8px;border:1px solid rgba(255,210,122,.5);background:rgba(255,180,60,.15);color:#ffe2a8;font-size:18px;font-weight:900}#craftPg482 span{font-size:12px;opacity:.8}'+
 '#craftScreen .btnRow{margin-top:4px!important;flex:0 0 auto}'+
 'body.ov482 #zdbgB,body.ov482 #zdbgP{display:none!important}'+
 '#shopNote{display:none!important}'+
 '#shopTabs{display:flex!important;flex-wrap:nowrap!important;gap:4px;overflow:hidden;min-width:0}#shopTabs .tab{flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;padding:6px 9px}'+
 '#shopScreen .shopHead{display:flex;align-items:center;gap:8px;min-width:0}#shopScreen .shopHead h2{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#shopScreen .shopHead .closeX{flex:0 0 auto;margin-left:auto}'+
 '#shopList img,.wsImg{object-fit:contain}'+
 '@media (max-height:500px){#bagScreen .sheet.bagSheet{max-height:calc(100vh - 8px)!important;padding:6px 10px!important}#bagScreen .bagHd h2{font-size:15px;margin:0}#bagScreen #bagGrid{gap:4px}}'+
 /* title screen */
 '#hw476 .moon .cl{display:none!important}#hw476 .bt{top:auto!important}#hw476 .bt:nth-of-type(n+3){display:none!important}'+
 '#startScreen .ztag,#startScreen #menuBest,#startScreen #sugRow #btnSug{display:none!important}'+
 '#startScreen .menuL{justify-content:center!important;gap:8px!important;overflow:hidden}'+
 '#startScreen .ztitle{margin:0!important;line-height:.95}'+
 '#startScreen .homeVer{font-size:10px;opacity:.55;margin:0}'+
 '#tiles482{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%}'+
 '#tiles482 .mBtn{flex-direction:column!important;align-items:center!important;justify-content:center;gap:2px!important;padding:8px 4px!important;min-height:64px;height:auto!important;text-align:center;min-width:0;position:relative}'+
 '#tiles482 .mBtn .ic{display:none!important}#tiles482 .mBtn small{display:none!important}#tiles482 .mBtn b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}#tiles482 .mBtn .ic482{width:28px;height:28px}#tiles482 .gemc{position:absolute;top:3px;right:4px;font-size:9.5px;padding:1px 4px}'+
 '#startScreen .playRow .mBtn .ic{display:none!important}#startScreen .playRow .ic482{width:34px;height:34px}'+
 '#qIcons482{position:absolute;top:calc(8px + var(--sat,0px));right:calc(10px + var(--sar,0px));display:flex;gap:8px;z-index:4}#qIcons482 button{width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,210,122,.4);background:rgba(10,12,18,.7);padding:6px;pointer-events:auto}#qIcons482 button.off{opacity:.45}#qIcons482 .ic482{width:100%;height:100%}'+
 '#startScreen .menuRow.three,#startScreen .menuRow.one{display:none!important}'+
 '@media (orientation:landscape){#miniRank{top:calc(54px + var(--sat,0px))!important;bottom:auto!important;max-height:calc(100vh - 54px - 34% - var(--sat,0px));overflow:hidden}#hw476 .pks{right:2%!important;bottom:1%!important;transform:scale(.8);transform-origin:right bottom}#hw476 .pks2{left:58%!important}}'+
 '@media (orientation:landscape) and (max-height:520px){#startScreen .ztitle{font-size:clamp(26px,9vh,44px)!important}#startScreen .playRow .mBtn{min-height:54px!important;padding:6px 10px!important}#tiles482 .mBtn{min-height:56px;padding:5px 4px!important}#hw476 .pks svg{width:52px!important}}'+
 '@media (orientation:portrait){#tiles482{grid-template-columns:repeat(3,minmax(0,1fr))}}'+
 /* report form */
 '#rep482{position:fixed;inset:0;z-index:1300;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66)}#rep482.hidden{display:none}#rep482 .sheet{width:min(440px,96vw);max-height:calc(100vh - 12px);overflow:hidden;display:flex;flex-direction:column;gap:6px;background:#141a22;border:1px solid rgba(255,210,122,.45);border-radius:14px;padding:10px 12px;color:#e8eef5;font:600 13px system-ui}'+
 '#rep482 h3{margin:0;font-size:15px;color:#ffd27a;display:flex;align-items:center;gap:6px}#rep482 .seg{display:flex;gap:6px}#rep482 .seg button{flex:1;padding:7px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:#cfd6e0;font-weight:800}#rep482 .seg button.on{background:rgba(255,180,60,.2);border-color:rgba(255,200,100,.6);color:#ffe2a8}'+
 '#rep482 textarea{flex:1;min-height:70px;max-height:34vh;resize:none;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.35);color:#fff;padding:8px;font:600 13px system-ui;user-select:text;-webkit-user-select:text}#rep482 .muted{font-size:11px;opacity:.65}#rep482 .row{display:flex;gap:6px;justify-content:flex-end}#rep482 .row button{padding:8px 14px;border-radius:8px;border:1px solid rgba(255,210,122,.45);background:rgba(255,180,60,.16);color:#ffe2a8;font-weight:800}#rep482 .row button.g{background:transparent;color:#cfd6e0;border-color:rgba(255,255,255,.2)}'+
 '#helpScreen #repBtn482{width:100%;display:flex;align-items:center;gap:8px;justify-content:center;margin:6px 0;padding:9px;border-radius:10px;border:1px solid rgba(255,210,122,.45);background:rgba(255,180,60,.14);color:#ffe2a8;font-weight:800}';
 document.head.appendChild(st);}
setInterval(()=>{try{const open=['shopScreen','craftScreen','bagScreen','gilda482','pauseScreen','rep482','helpScreen'].some(id=>{const e=document.getElementById(id);return e&&!e.classList.contains('hidden');});document.body.classList.toggle('ov482',open);}catch(e){}},400);
// ---------- title screen: Gioca big, 3 equal tiles (Negozio / Arena / Gilda), small settings + audio icons ----------
function title482(){try{const scr=$('startScreen'),menu=scr&&scr.querySelector('.menuL');if(!menu||$('tiles482'))return;
  const old=document.getElementById('btnGilda481');if(old)old.remove();
  const tiles=document.createElement('div');tiles.id='tiles482';
  const shop=$('btnShop'),arena=$('btnOnline');
  const gil=document.createElement('button');gil.className='mBtn';gil.id='btnGilda482';gil.type='button';gil.innerHTML='<span><b>Gilda</b></span>';
  for(const [b,k] of [[shop,'shop'],[arena,'arena'],[gil,'shield']]){if(!b)continue;b.insertAdjacentHTML('afterbegin',ic482(k));tiles.appendChild(b);}
  const pr=menu.querySelector('.playRow');if(pr){const pb=$('btnZombie');if(pb)pb.insertAdjacentHTML('afterbegin',ic482('play'));pr.after(tiles);}else menu.appendChild(tiles);
  gil.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();gOpen482();});
  const q=document.createElement('div');q.id='qIcons482';q.innerHTML='<button type="button" id="qSet482" aria-label="Impostazioni">'+ic482('gear')+'</button><button type="button" id="qSnd482" aria-label="Audio">'+ic482('sound')+'</button>';scr.appendChild(q);
  $('qSet482').addEventListener('click',e=>{e.stopPropagation();try{$('btnHelp').click();}catch(x){}});
  const sync=()=>{try{$('qSnd482').classList.toggle('off',!!SET.mute);}catch(x){}};sync();
  $('qSnd482').addEventListener('click',e=>{e.stopPropagation();try{$('btnMute').click();}catch(x){}setTimeout(sync,50);});}catch(e){e482(e,'title');}}
title482();
// ---------- Suggerimenti e bug: in-game form -> worker /report (no address in the client) ----------
function repOpen482(){try{let r=$('rep482');if(!r){r=document.createElement('div');r.id='rep482';r.className='hidden';r.innerHTML='<div class="sheet"><h3>'+ic482('bug')+'Suggerimenti e bug</h3>'+
    '<div class="seg"><button type="button" data-k="sugg" class="on">Suggerimento</button><button type="button" data-k="bug">Bug</button></div>'+
    '<textarea id="repTxt482" maxlength="1500" placeholder="Scrivi qui..."></textarea><div class="muted">Versione, dispositivo e ultimo errore vengono allegati in automatico. Invio anonimo.</div>'+
    '<div class="row"><button type="button" class="g" id="repX482">Annulla</button><button type="button" id="repGo482">Invia</button></div></div>';document.body.appendChild(r);
    r.dataset.k='sugg';r.querySelector('.seg').addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(!b)return;r.dataset.k=b.dataset.k;r.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===b));});
    $('repX482').onclick=()=>r.classList.add('hidden');$('repGo482').onclick=repSend482;}
  $('repTxt482').value='';r.classList.remove('hidden');}catch(e){e482(e,'repOpen');}}
function repMeta482(){let crash='';try{const E=(window.__DBG&&__DBG.data&&__DBG.data.errors)||[];crash=E.slice(-3).map(x=>x.t+' '+x.type+': '+x.msg).join(' | ').slice(0,900);}catch(e){}
  let gpu='';try{gpu=typeof gpuName43==='function'?String(gpuName43()||''):'';}catch(e){}
  return {ver:String(window.GAME_VER||''),dev:(navigator.userAgent||'').slice(0,140)+' · '+innerWidth+'x'+innerHeight+'@'+(devicePixelRatio||1)+(gpu?' · '+gpu.slice(0,50):'')+(window.__zsApk?' · APK':''),crash};}
function repSend482(){const r=$('rep482'),t=($('repTxt482').value||'').trim();if(t.length<3){toast('Scrivi qualcosa in più',1200);return;}
  const b=$('repGo482');b.disabled=true;const c=new AbortController(),to=setTimeout(()=>{try{c.abort();}catch(e){}},6000);let init='';try{init=zs439Init()||'';}catch(e){}
  fetch(ZS_API+'/report',{method:'POST',signal:c.signal,headers:{'content-type':'application/json'},body:JSON.stringify({initData:init,kind:r.dataset.k,text:t,meta:repMeta482()})})
   .then(x=>x.json()).then(j=>{if(j&&j.ok){toast('Inviato, grazie!',1600);r.classList.add('hidden');}else if(j&&j.err==='slow')toast('Aspetta un minuto prima di inviarne un altro',1800);else throw 0;})
   .catch(()=>{try{if(typeof sug29Open==='function'){r.classList.add('hidden');sug29Open();return;}}catch(e){}toast('Invio non riuscito, riprova più tardi',1800);}).finally(()=>{clearTimeout(to);b.disabled=false;});}
try{const h=$('helpScreen'),row=h&&h.querySelector('.btnRow');if(h&&!$('repBtn482')){const b=document.createElement('button');b.type='button';b.id='repBtn482';b.innerHTML=ic482('bug')+'Suggerimenti e bug';b.addEventListener('click',e=>{e.stopPropagation();repOpen482();});if(row)row.before(b);else h.querySelector('.sheet').appendChild(b);}}catch(e){e482(e,'repBtn');}
// ---------- Gilda v2: search/create, members + roles, requests, management; server enforces permissions ----------
const G482={tab:'',clan:null,list:[],q:'',page:0,msgs:[],since:0,down:0,k:0,r:0,lastPts:0};
const RKN482={c:'Capo gilda',a:'Anziano',m:'Membro'},RKI482={c:'rkc',a:'rka',m:'rkm'};
function gApi482(path,body){let init='';try{init=zs439Init()||'';}catch(e){}if(typeof ZS_API==='undefined'||!ZS_API)return Promise.reject(new Error('no_api'));if(body&&!init)return Promise.reject(new Error('no_tg'));
  const c=new AbortController(),to=setTimeout(()=>{try{c.abort();}catch(e){}},4500);const o={method:body?'POST':'GET',signal:c.signal};if(body){o.headers={'content-type':'application/json'};o.body=JSON.stringify(Object.assign({initData:init},body));}
  return fetch(ZS_API+path,o).then(r=>r.json()).finally(()=>clearTimeout(to));}
function gE(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const GERR482={perm:'Non hai i permessi',full:'Gilda piena',taken:'Nome già usato',name:'Nome troppo corto',already:'Sei già in una gilda',transfer_first:'Prima cedi il ruolo di Capo gilda',in_other:'È già in un\'altra gilda',slow:'Troppo veloce, riprova',nf:'Non trovato',no_tg:'Apri il gioco da Telegram'};
function gErr482(j){toast(GERR482[(j&&j.err)||'']||'Errore',1500);}
function gEnsure482(){let el=$('gilda482');if(el)return el;const st=document.createElement('style');st.textContent=
 '#gilda482{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66)}#gilda482.hidden{display:none}'+
 '#gilda482 .gs{width:min(560px,97vw);height:min(calc(100vh - 10px),520px);overflow:hidden;display:flex;flex-direction:column;background:linear-gradient(180deg,#1a1420,#0c0e14);border:1px solid rgba(255,190,90,.45);border-radius:14px;padding:8px 10px;color:#e8eef5;font:600 13px system-ui,sans-serif;box-sizing:border-box}'+
 '#gilda482 .hd{display:flex;align-items:center;gap:8px;flex:0 0 auto;min-width:0}#gilda482 .hd .ic482{width:30px;height:30px}#gilda482 .hd h2{flex:1;min-width:0;margin:0;font-size:15px;color:#ffd27a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#gilda482 .hd small{opacity:.7;font-size:11px;white-space:nowrap}'+
 '#gilda482 .x{flex:0 0 auto;width:34px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#cfd6e0;font-weight:900}'+
 '#gilda482 .tb{display:flex;gap:4px;margin:6px 0;flex:0 0 auto}#gilda482 .tb button{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 2px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#cfd6e0;font-weight:700;font-size:11.5px;white-space:nowrap;overflow:hidden}#gilda482 .tb button .ic482{width:18px;height:18px}#gilda482 .tb button.on{background:rgba(255,170,60,.18);border-color:rgba(255,200,100,.55);color:#ffe2a8}'+
 '#gilda482 .bd{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:5px}#gilda482 .ls{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:4px}'+
 '#gilda482 .it{display:flex;align-items:center;gap:6px;height:34px;padding:0 6px;border-radius:8px;background:rgba(255,255,255,.045);flex:0 0 34px;min-width:0}#gilda482 .it .ic482{width:22px;height:22px}#gilda482 .it .n{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#gilda482 .it .s{flex:0 1 auto;font-size:11px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40%}'+
 '#gilda482 .b{flex:0 0 auto;padding:5px 8px;border-radius:7px;border:1px solid rgba(255,210,122,.45);background:rgba(255,180,60,.15);color:#ffe2a8;font-weight:800;font-size:11px;white-space:nowrap}#gilda482 .b.r{border-color:rgba(255,110,90,.5);background:rgba(255,80,60,.12);color:#ffb0a0}#gilda482 .b.g{background:transparent;color:#cfd6e0;border-color:rgba(255,255,255,.2)}'+
 '#gilda482 .rw{display:flex;gap:6px;align-items:center;flex:0 0 auto}#gilda482 input{flex:1;min-width:0;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.35);color:#fff;padding:7px;font:600 13px system-ui;user-select:text;-webkit-user-select:text}'+
 '#gilda482 .pg{display:flex;justify-content:center;gap:12px;align-items:center;flex:0 0 auto;font-size:11px;opacity:.85}#gilda482 .pg button{width:36px;height:26px;border-radius:7px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#ffe2a8;font-weight:900}'+
 '#gilda482 .mu{font-size:11.5px;opacity:.7}#gilda482 .msg{font-size:12px;line-height:1.25;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.035);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 0 auto}#gilda482 .msg.me{background:rgba(255,170,60,.12)}'+
 '#gilda482 .bar{height:8px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden}#gilda482 .bar i{display:block;height:100%;background:linear-gradient(90deg,#a33a06,#ffb347)}';
 document.head.appendChild(st);el=document.createElement('div');el.id='gilda482';el.className='hidden';el.innerHTML='<div class="gs"><div class="hd">'+ic482('shield')+'<h2 id="gT482">Gilda</h2><small id="gS482"></small><button type="button" class="x" id="gX482">✕</button></div><div class="tb" id="gTb482"></div><div class="bd" id="gB482"></div></div>';
 document.body.appendChild(el);$('gX482').onclick=()=>el.classList.add('hidden');
 $('gTb482').onclick=e=>{const b=e.target.closest('button[data-t]');if(!b)return;G482.tab=b.dataset.t;G482.page=0;gPaint482();};
 $('gB482').addEventListener('click',gClick482);return el;}
function gOpen482(){const el=gEnsure482();el.classList.remove('hidden');G482.down=0;G482.tab='';G482.page=0;gPaint482();
  gApi482('/clan/me',{}).then(j=>{if(!j||!j.ok)throw 0;G482.clan=j.clan;gPaint482();if(!G482.clan)gSearch482();}).catch(()=>{G482.down=1;gPaint482();});}
function gSearch482(){gApi482('/clan/list'+(G482.q?'?q='+encodeURIComponent(G482.q):'')).then(j=>{G482.list=(j&&j.clans)||[];G482.page=0;if(G482.tab==='find')gPaint482();}).catch(()=>{});}
function gPer482(){const b=$('gB482');return Math.max(3,Math.floor(((b&&b.clientHeight)||300)-80)/38|0);}
function gPager482(n,per){const pages=Math.max(1,Math.ceil(n/per));if(G482.page>=pages)G482.page=pages-1;return pages>1?'<div class="pg"><button type="button" data-a="pg" data-v="-1">‹</button><span>'+(G482.page+1)+' / '+pages+'</span><button type="button" data-a="pg" data-v="1">›</button></div>':'';}
function gTabs482(list){if(!list.some(t=>t[0]===G482.tab))G482.tab=list[0][0];$('gTb482').innerHTML=list.map(t=>'<button type="button" data-t="'+t[0]+'" class="'+(t[0]===G482.tab?'on':'')+'">'+ic482(t[1])+t[2]+'</button>').join('');}
function gPaint482(){const B=$('gB482');if(!B)return;const c=G482.clan;
  if(G482.down){$('gT482').textContent='Gilda';$('gS482').textContent='';$('gTb482').innerHTML='';B.innerHTML='<div class="mu" style="margin:auto;text-align:center">Presto disponibile<br>Il server della gilda non risponde, riprova più tardi.</div>';return;}
  if(!c){$('gT482').textContent='Gilda';$('gS482').textContent='';gTabs482([['find','search','Cerca'],['new','create','Crea']]);
    if(G482.tab==='new'){B.innerHTML='<div class="mu">Fonda la tua gilda: diventi Capo gilda.</div><div class="rw"><input id="gN482" maxlength="18" placeholder="Nome (3-18)"><input id="gG482" maxlength="4" placeholder="Sigla" style="flex:0 0 70px"></div>'+
      '<div class="rw"><label class="mu" style="flex:1"><input type="checkbox" id="gO482" checked style="flex:0 0 auto;width:auto"> Aperta a tutti (se no, servono richieste)</label><button type="button" class="b" data-a="create">Crea gilda</button></div>';return;}
    const per=gPer482(),L=G482.list,pg=L.slice(G482.page*per,(G482.page+1)*per);
    B.innerHTML='<div class="rw"><input id="gQ482" maxlength="20" placeholder="Cerca per nome o sigla" value="'+gE(G482.q)+'"><button type="button" class="b" data-a="search">'+ic482('search')+'</button></div><div class="ls">'+
      (pg.length?pg.map(x=>'<div class="it">'+ic482('shield')+'<span class="n">'+gE(x.name)+(x.tag?' ['+gE(x.tag)+']':'')+'</span><span class="s">'+ic482('members')+(x.n|0)+'/20 · '+gE(x.leader||'')+'</span><button type="button" class="b" data-a="join" data-id="'+gE(x.id)+'">'+(x.open===false?'Richiedi':'Entra')+'</button></div>').join(''):'<div class="mu">Nessuna gilda trovata</div>')+'</div>'+gPager482(L.length,per);return;}
  const my=c.my||'m',lvl=c.lv||1;$('gT482').textContent=c.name+(c.tag?' ['+c.tag+']':'');$('gS482').innerHTML='Lv '+lvl+' · '+(c.members||[]).length+'/20';
  const tabs=[['mem','members','Membri'],['chat','chat','Chat'],['mis','scroll','Missioni']];if(my!=='m')tabs.push(['adm','gear','Gestione'+((c.req||[]).length?' ('+c.req.length+')':'')]);gTabs482(tabs);
  if(G482.tab==='mem'){const per=gPer482(),M=(c.members||[]).slice().sort((a,b)=>({c:3,a:2,m:1}[b.rk]-{c:3,a:2,m:1}[a.rk])||b.pts-a.pts),pg=M.slice(G482.page*per,(G482.page+1)*per);
    B.innerHTML='<div class="ls">'+pg.map(m=>{let act='';if(!m.me){if(my==='c'){act+=m.rk==='a'?'<button type="button" class="b g" data-a="demote" data-id="'+gE(m.id)+'">Membro</button>':'<button type="button" class="b g" data-a="promo" data-id="'+gE(m.id)+'">Anziano</button>';act+='<button type="button" class="b r" data-a="kick" data-id="'+gE(m.id)+'">Espelli</button>';}
      else if(my==='a'&&m.rk==='m')act+='<button type="button" class="b r" data-a="kick" data-id="'+gE(m.id)+'">Espelli</button>';}
      return '<div class="it">'+ic482(RKI482[m.rk]||'rkm')+'<span class="n">'+gE(m.n)+(m.me?' (tu)':'')+'</span><span class="s">'+RKN482[m.rk]+' · '+(m.pts|0)+' pt</span>'+act+'</div>';}).join('')+'</div>'+gPager482(M.length,per)+
      '<div class="rw" style="justify-content:flex-end"><button type="button" class="b r" data-a="leave">Esci dalla gilda</button></div>';return;}
  if(G482.tab==='chat'){const n=Math.max(3,Math.floor((((B.clientHeight)||300)-50)/22)),ms=(G482.msgs||[]).slice(-n);
    B.innerHTML='<div class="ls">'+(ms.length?ms.map(m=>'<div class="msg'+(m.me?' me':'')+'"><b>'+gE(String(m.n).slice(0,12))+':</b> '+gE(m.m)+'</div>').join(''):'<div class="mu">Nessun messaggio</div>')+'</div><div class="rw"><input id="gM482" maxlength="200" placeholder="Scrivi un messaggio"><button type="button" class="b" data-a="send">Invia</button></div>';gChat482();return;}
  if(G482.tab==='mis'){const s=c.mis||{},pk=Math.min(100,(s.kills|0)/Math.max(1,s.gk|0)*100),pr=Math.min(100,(s.res|0)/Math.max(1,s.gr|0)*100);
    B.innerHTML='<div class="it">'+ic482('star')+'<span class="n">Livello gilda '+lvl+'</span><span class="s">'+(c.pts|0)+' punti</span></div><div class="mu">Missioni della settimana (tutta la gilda):</div>'+
      '<div class="it">'+ic482('arena')+'<span class="n">Uccisioni '+(s.kills|0)+' / '+(s.gk|0)+'</span></div><div class="bar"><i style="width:'+pk+'%"></i></div>'+
      '<div class="it">'+ic482('scroll')+'<span class="n">Risorse '+(s.res|0)+' / '+(s.gr|0)+'</span></div><div class="bar"><i style="width:'+pr+'%"></i></div><div class="mu">Punti da uccisioni e risorse raccolte. Il livello cresce con punti e membri.</div>';return;}
  if(G482.tab==='adm'){const R=c.req||[];let h='<div class="mu">Richieste di ingresso</div><div class="ls" style="flex:0 1 auto;max-height:45%">'+(R.length?R.slice(0,4).map(r=>'<div class="it">'+ic482('members')+'<span class="n">'+gE(r.n)+'</span><button type="button" class="b" data-a="accept" data-id="'+gE(r.id)+'">Accetta</button><button type="button" class="b r" data-a="reject" data-id="'+gE(r.id)+'">Rifiuta</button></div>').join(''):'<div class="mu">Nessuna richiesta</div>')+'</div>';
    if(my==='c'){const others=(c.members||[]).filter(m=>!m.me);h+='<div class="rw"><input id="gEN482" maxlength="18" value="'+gE(c.name)+'"><button type="button" class="b" data-a="edit">Rinomina</button><button type="button" class="b g" data-a="open">'+(c.open?'Aperta':'Su richiesta')+'</button></div>'+
      '<div class="rw"><select id="gTr482" style="flex:1;min-width:0;border-radius:8px;background:#0c0e14;color:#fff;border:1px solid rgba(255,255,255,.15);padding:6px">'+others.map(m=>'<option value="'+gE(m.id)+'">'+gE(m.n)+'</option>').join('')+'</select><button type="button" class="b g" data-a="transfer"'+(others.length?'':' disabled')+'>Cedi Capo gilda</button><button type="button" class="b r" data-a="disband">Sciogli</button></div>';}
    B.innerHTML=h;return;}}
function gDo482(path,body,after){gApi482(path,body).then(j=>{if(!j||!j.ok){gErr482(j);return;}if(j.pending){toast('Richiesta inviata al Capo gilda',1600);return;}if('clan' in j)G482.clan=j.clan;else if(after==='none')G482.clan=null;gPaint482();if(!G482.clan)gSearch482();}).catch(()=>toast('Server non raggiungibile',1400));}
function gClick482(e){const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,id=b.dataset.id;
  if(a==='pg'){G482.page=Math.max(0,G482.page+(+b.dataset.v));gPaint482();return;}
  if(a==='search'){G482.q=($('gQ482').value||'').trim();gSearch482();return;}
  if(a==='create'){gDo482('/clan/create',{name:$('gN482').value,tag:$('gG482').value,open:!!$('gO482').checked});return;}
  if(a==='join'){gDo482('/clan/join',{id});return;}
  if(a==='send'){const m=($('gM482').value||'').trim();if(!m)return;gApi482('/clan/chat',{m}).then(()=>{$('gM482').value='';gChat482();}).catch(()=>{});return;}
  const conf=(t,f)=>{try{dialog(t,'',[{label:'Conferma',fn:f},{label:'Annulla',ghost:1}]);}catch(x){f();}};
  if(a==='kick')conf('Espellere questo giocatore?',()=>gDo482('/clan/kick',{id}));
  if(a==='promo')gDo482('/clan/promo',{id,rank:'anziano'});if(a==='demote')gDo482('/clan/promo',{id,rank:'membro'});
  if(a==='accept')gDo482('/clan/accept',{id});if(a==='reject')gDo482('/clan/reject',{id});
  if(a==='edit')gDo482('/clan/edit',{name:$('gEN482').value});if(a==='open')gDo482('/clan/edit',{open:!(G482.clan&&G482.clan.open)});
  if(a==='transfer'){const t=$('gTr482').value;if(t)conf('Cedere il ruolo di Capo gilda?',()=>gDo482('/clan/transfer',{id:t}));}
  if(a==='disband')conf('Sciogliere la gilda? Non si può annullare.',()=>gDo482('/clan/disband',{},'none'));
  if(a==='leave')conf('Uscire dalla gilda?',()=>gDo482('/clan/leave',{},'none'));}
function gChat482(){gApi482('/clan/msgs',{since:G482.since}).then(j=>{if(!j||!j.ok)return;const add=j.msgs||[];if(!add.length)return;G482.msgs=(G482.msgs||[]).concat(add).slice(-40);G482.since=G482.msgs[G482.msgs.length-1].t;if(G482.tab==='chat'&&!$('gilda482').classList.contains('hidden')){const v=$('gM482')?$('gM482').value:'';gPaint482();if($('gM482'))$('gM482').value=v;}}).catch(()=>{});}
// clan points from kills / resources (server caps + rate limit)
try{const _k=killZombie;killZombie=function(){const r=_k.apply(this,arguments);try{if(G482.clan)G482.k++;}catch(e){}return r;};}catch(e){}
try{const _a=addRes;addRes=function(){const got=_a.apply(this,arguments);try{if(G482.clan&&got>0)G482.r+=got;}catch(e){}return got;};}catch(e){}
setInterval(()=>{try{if(!G482.clan||(!G482.k&&!G482.r)||performance.now()-G482.lastPts<600000)return;const k=G482.k,r=G482.r;G482.k=0;G482.r=0;G482.lastPts=performance.now();gApi482('/clan/pts',{k,r}).then(j=>{if(j&&j.clan)G482.clan=j.clan;}).catch(()=>{});}catch(e){}},20000);
// know the clan at startup (for points) without blocking anything
setTimeout(()=>{gApi482('/clan/me',{}).then(j=>{if(j&&j.ok)G482.clan=j.clan;}).catch(()=>{});},6000);
try{window.__zs482={art:wArt482,craft:craftLayout482,gilda:gOpen482,report:repOpen482};}catch(e){}
// Override 4.3.81 gilda button/openers so only the new UI is used
try{if(window.__gilda481){__gilda481.open=gOpen482;__gilda481.close=()=>{const e=$('gilda482');if(e)e.classList.add('hidden');};}}catch(e){}
try{const old=$('gilda481');if(old)old.remove();}catch(e){}
try{const b=$('btnGilda481');if(b)b.remove();}catch(e){}
// Loading continues from pumpkin boot481 until menu is ready (no flash of old ld431)
(function(){try{
  const boot=$('boot481');if(!boot)return;
  const bar=$('boot481bar');let p=8;
  const tip=['Carico la città…','Preparo le armi…','Scaldo i tessuti…','Quasi pronto…'];
  let tipEl=boot.querySelector('.btip482');if(!tipEl){tipEl=document.createElement('div');tipEl.className='btip482';tipEl.style.cssText='margin-top:10px;font:600 12px system-ui;opacity:.7;letter-spacing:.04em';boot.appendChild(tipEl);}
  let ti=0;tipEl.textContent=tip[0];const tipIv=setInterval(()=>{ti=(ti+1)%tip.length;tipEl.textContent=tip[ti];},1600);
  const iv=setInterval(()=>{p=Math.min(96,p+1.4);if(bar)bar.style.width=p+'%';},140);
  const done=()=>{clearInterval(iv);clearInterval(tipIv);if(bar)bar.style.width='100%';boot.classList.add('off');setTimeout(()=>{try{boot.remove();}catch(e){}},380);try{const s=$('startScreen');if(s)s.classList.add('ready481');}catch(e){}};
  let went=0;const go=()=>{if(went)return;went=1;Promise.race([window.__pc482||Promise.resolve(),new Promise(r=>setTimeout(r,8000))]).then(done,done);};
  try{if(typeof menu432Place==='function'){const _m=menu432Place;menu432Place=function(){const r=_m.apply(this,arguments);try{go();}catch(e){}return r;};}}catch(e){}
  setTimeout(go,4200);
  // keep ld431 invisible while boot is up
  try{const st=document.createElement('style');st.textContent='#boot481~#ld431{visibility:hidden!important}#startScreen:not(.ready481){opacity:0}#startScreen.ready481{opacity:1;transition:opacity .3s}';document.head.appendChild(st);}catch(e){}
}catch(e){e482(e,'load');}})();
// ---------- separate catalogs: coin weapons vs diamond weapons (zero overlap) + diamond weapons clearly stronger ----------
const COINW482=['w_smg','w_fox','w_burst','w_saw'],GEMW482=['w_ar','w_hunt','w_thunder','w_plasma','w_sniper','w_glauncher','w_vespa','w_flamer','w_minigun'];
try{for(const id of COINW482){delete GEM_PRICES[id];delete STARS_PRICES[id];delete INVOICE_LINKS[id];}}catch(e){e482(e,'cat1');}
try{for(let i=CSHOP.length-1;i>=0;i--){const c=CSHOP[i];if(c&&c.w&&GEMW482.includes(c.w))CSHOP.splice(i,1);}
  for(const c of CSHOP){if(c&&c.w&&COINW482.includes(c.w)){c.g='Armi a monete';if(c.id==='cw_smg')c.d='Arma Rara a monete, sbloccata per sempre';}}}catch(e){e482(e,'cat2');}
// diamond tab shows only diamond weapons (SHOP_W still lists coin weapons so owned ones keep loading into every match)
try{const _rs=renderShop;renderShop=function(){if(typeof shopTab==='undefined'||shopTab!=='armi')return _rs.apply(this,arguments);const keep=SHOP_W.slice();
  for(let i=SHOP_W.length-1;i>=0;i--)if(COINW482.includes(SHOP_W[i].id))SHOP_W.splice(i,1);try{return _rs.apply(this,arguments);}finally{SHOP_W.length=0;for(const x of keep)SHOP_W.push(x);}};}catch(e){e482(e,'cat3');}
try{const _fi=featuredId;featuredId=function(){const id=_fi.apply(this,arguments);if(!COINW482.includes(id))return id;const L=SHOP_W.filter(s=>GEMW482.includes(s.id)&&!owns(s.id));return L.length?L[0].id:'';};}catch(e){}
// buy() guard: a coin weapon can never be bought with diamonds/stars, and a diamond weapon never with coins
try{const _b=buy;buy=function(id,m){if(COINW482.includes(id)){try{mtoast('Si compra con le 🪙 monete (scheda Monete)',1800);}catch(e){}return;}return _b.apply(this,arguments);};}catch(e){}
try{const _cb=cBuy;cBuy=function(id){const c=CSHOP.find(q=>q.id===id)||{};if(c.w&&GEMW482.includes(c.w))return;return _cb.apply(this,arguments);};}catch(e){}
// stat tuning: every diamond weapon beats the coin weapons of its class
try{const T482={ar:{dmg:19,rate:.1,mag:32,range:75},minigun:{dmg:9},plasma:{dmg:38,rate:.22,mag:22},hunt:{dmg:70,rate:.62,range:125},sniper:{dmg:110,rate:1},vespa:{dmg:62,rate:.8}};
  for(const w of WEAPONS){const t=w&&T482[w.id];if(!t)continue;Object.assign(w,t);try{if(typeof mag!=='undefined'&&t.mag&&(mag[w.id]|0)>t.mag)mag[w.id]=t.mag;}catch(e){}}}catch(e){e482(e,'tune');}
// ---------- backpack: no scrolling anywhere; compact grids + ‹ › pages ----------
const BP482={pg:{}};
function bpPage482(box,key,cols,tileH){try{if(!box)return;const tiles=[...box.children].filter(x=>!x.classList.contains('pg482'));if(!tiles.length)return;
  box.style.gridTemplateColumns='repeat('+cols+',minmax(0,1fr))';
  const top=box.getBoundingClientRect().top,sheet=box.closest('.sheet'),sb=sheet?sheet.getBoundingClientRect().bottom:innerHeight;
  let below=0;let n=box.nextElementSibling;while(n){if(n.offsetParent&&!n.classList.contains('pgbar482'))below+=n.getBoundingClientRect().height+4;n=n.nextElementSibling;}
  const avail=Math.max(tileH,sb-top-below-34),rows=Math.max(1,Math.floor((avail+4)/(tileH+4))),per=rows*cols,pages=Math.max(1,Math.ceil(tiles.length/per));
  let p=BP482.pg[key]|0;if(p>=pages)p=pages-1;BP482.pg[key]=p;
  tiles.forEach((t,i)=>{t.style.display=(i>=p*per&&i<(p+1)*per)?'':'none';});
  let bar=box.nextElementSibling;if(!bar||!bar.classList.contains('pgbar482')){bar=document.createElement('div');bar.className='pgbar482';bar.innerHTML='<button type="button" data-d="-1">‹</button><span></span><button type="button" data-d="1">›</button>';box.after(bar);
    bar.addEventListener('click',e=>{const b=e.target.closest('button[data-d]');if(!b)return;e.stopPropagation();BP482.pg[key]=Math.max(0,(BP482.pg[key]|0)+(+b.dataset.d));bpFit482();},true);}
  bar.style.display=pages>1?'flex':'none';bar.querySelector('span').textContent=(p+1)+' / '+pages;}catch(e){e482(e,'bpPage');}}
function bpFit482(){try{const scr=$('bagScreen');if(!scr||scr.classList.contains('hidden'))return;const W=innerWidth;
  const am=scr.querySelector('#bagGrid .bgAms');if(am&&am.offsetParent)bpPage482(am,'am',W>=900?4:W>=600?3:2,44);
  const gg=scr.querySelector('#eqPanel .gGrid');if(gg&&gg.offsetParent)bpPage482(gg,'gear',W>=900?8:W>=600?6:4,46);}catch(e){e482(e,'bpFit');}}
{const st=document.createElement('style');st.id='v482bag';st.textContent=
 'html body #bagScreen .bagSheet,html body #bagScreen .bagSheet *{overflow-y:hidden!important;scrollbar-width:none!important}html body #bagScreen .bagSheet{max-height:calc(100vh - 6px - var(--sat,0px) - var(--sab,0px))!important;overflow:hidden!important}'+
 'html body #bagScreen #bagGrid,html body #bagScreen .bagSide,html body #bagScreen #eqPanel{overflow:hidden!important;touch-action:none!important;max-height:none!important;padding-bottom:0!important}'+
 'html body #bagScreen .bgSec,html body #bagScreen .eqSub{margin:2px 0!important;font-size:11px!important;line-height:1.2!important}'+
 'html body #bagScreen .bgMats{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:4px!important}html body #bagScreen .bgTools{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:4px!important}'+
 'html body #bagScreen .bgAms,html body #bagScreen .gGrid{display:grid!important;gap:4px!important;align-content:start}'+
 'html body #bagScreen [class^="bgI"],html body #bagScreen [class*=" bgI"]{height:44px!important;min-height:0!important;padding:3px 5px!important;font-size:10.5px!important;line-height:1.15!important;overflow:hidden!important;display:flex!important;align-items:center;gap:4px}'+
 'html body #bagScreen [class^="bgI"] span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}html body #bagScreen [class^="bgI"] i{font-size:16px;flex:0 0 auto}'+
 'html body #bagScreen .gGrid>*{height:46px!important;min-height:0!important;overflow:hidden!important}'+
 'html body #bagScreen .eqSlots{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:4px!important}html body #bagScreen .gS{height:46px!important;min-height:0!important;padding:2px!important}html body #bagScreen .gS small{font-size:9px!important}'+
 'html body #bagScreen .eqStats{display:flex!important;flex-wrap:wrap;gap:2px 10px;font-size:10.5px!important}html body #bagScreen .eqRow{display:block!important}'+
 'html body #bagScreen .gInfo{position:absolute!important;left:8px;right:8px;bottom:8px;z-index:5;background:#141a22!important;border:1px solid rgba(255,210,122,.5);border-radius:10px;padding:6px 8px!important;font-size:11px}'+
 '.pgbar482{display:none;justify-content:center;align-items:center;gap:14px;margin:3px 0}.pgbar482 button{width:40px;height:26px;border-radius:7px;border:1px solid rgba(255,210,122,.5);background:rgba(255,180,60,.15);color:#ffe2a8;font-size:16px;font-weight:900}.pgbar482 span{font-size:11px;opacity:.8}';
 document.head.appendChild(st);}
for(const fn of ['renderBag','renderEq','bag439Fit','bag457View','openBag']){try{const f=window[fn];if(typeof f!=='function')continue;window[fn]=function(){const r=f.apply(this,arguments);requestAnimationFrame(bpFit482);return r;};}catch(e){}}
try{$('bagScreen').addEventListener('click',()=>setTimeout(bpFit482,30));}catch(e){}addEventListener('resize',()=>setTimeout(bpFit482,60));
// ---------- freeze guards: no synchronous thumbnail renders during a match; pre-compile new materials behind the loader ----------
for(const fn of ['renderThumbs','thumbs43','thumbOne422','thumbsPartial422']){try{const f=window[fn];if(typeof f!=='function')continue;window[fn]=function(){try{thumbsMerge482();return THUMBS;}catch(e){}return f.apply(this,arguments);}; /* 4.3.83: 3D thumbnails never rendered (2D drawn art everywhere) - they were the 3 s off-frame render */}catch(e){}}
// 4.3.82b: precompile runs at once behind the startup loading screen, async (compileAsync) — was a sync 2.5 s freeze in the menu at t≈11 s
window.__pc482=new Promise(r=>{window.__pc482r=r;}); // resolved by js/34-v482-perf.js after the chunked precompile
try{const _sg=startGame;startGame=function(){try{const g=$('gilda482');if(g)g.classList.add('hidden');const r=$('rep482');if(r)r.classList.add('hidden');}catch(e){}return _sg.apply(this,arguments);};}catch(e){}
// ---------- 790x360 fixes: home icons, scroll wrappers, shop prices ----------
{const st=document.createElement('style');st.id='v482fix';st.textContent=
 '#qIcons482{position:static!important;display:flex;gap:6px;justify-content:flex-start;margin-top:2px}#qIcons482 button{width:32px!important;height:32px!important;padding:5px!important}'+
 'html body #craftScreen .sb42,html body #bagScreen .sb42,html body #bagEquipmentPanel457,html body #bagScreen .bagSide{overflow:hidden!important;touch-action:none!important}'+
 'html body #craftScreen .sb42,html body #bagScreen .sb42{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;min-height:0!important;max-height:none!important}'+
 '#gilda482.hidden,#rep482.hidden{display:none!important}'+
 'html body #shopList .scard{display:flex!important;flex-direction:column!important;overflow:hidden!important;min-height:0!important}'+
 'html body #shopList .scard .sthumb{flex:1 1 auto!important;min-height:36px!important;height:auto!important;max-height:42%!important}html body #shopList .scard .sthumb img{max-height:100%}'+
 'html body #shopList .scard .sbody{flex:0 0 auto!important;display:flex;flex-direction:column;min-height:0;padding-bottom:4px!important}'+
 'html body #shopList .scard .sbtns{flex:0 0 auto!important;display:flex!important;gap:4px;margin-top:4px!important;position:relative;z-index:2}html body #shopList .scard .sbtns button{white-space:nowrap;min-height:28px;font-size:12px!important;padding:4px 6px!important}'+
 '@media (max-height:420px){html body #shopList .scard .sdesc,html body #shopList .scard .wbars,html body #shopList .scard [class*="bars"]{display:none!important}html body #shopList .scard .srar{font-size:10px!important}html body #shopList .scard .sname{font-size:13px!important}}'+
 'html body #shopList .ownTag{font-size:10px}';
 document.head.appendChild(st);}
try{const qi=$('qIcons482'),tl=$('tiles482');if(qi&&tl)tl.after(qi);}catch(e){}
// owned items: show 'Posseduta' label on the card button row when nothing to buy
try{const _rs2=renderShop;renderShop=function(){const r=_rs2.apply(this,arguments);try{document.querySelectorAll('#shopList .scard').forEach(c=>{const b=c.querySelector('.sbtns');if(!b)return;if(!b.querySelector('button')&&!b.textContent.trim())b.innerHTML='<span class="bOwn">Posseduta</span>';
  if(c.querySelector('.ownTag'))c.querySelector('.ownTag').textContent='Posseduta';});}catch(e){}return r;};}catch(e){}
// ---- 4.3.82 leaderboard stability: render once per open/tab/refresh, keep scroll, skip identical DOM writes ----
(function(){try{const L=document.getElementById('rankList');if(!L)return;let lastH='';
  const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  Object.defineProperty(L,'innerHTML',{configurable:true,get(){return d.get.call(this);},set(v){if(v===lastH)return;lastH=v;const sh=L.closest('.sheet'),st=sh?sh.scrollTop:0;d.set.call(this,v);if(sh&&st)sh.scrollTop=st;}});
  const sc=document.getElementById('rankScreen');const st=document.createElement('style');st.textContent='#rankScreen .sheet{overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}';document.head.appendChild(st);
  const b=document.getElementById('rankRefresh');if(b)onTap('rankRefresh',()=>{try{if(typeof ONL439!=='undefined')ONL439.t=0;lastH='';renderRank();}catch(e){}});
  const _o=openRank;openRank=function(){if(sc&&!sc.classList.contains('hidden'))return;return _o.apply(this,arguments);};
  try{window.openRank=openRank;}catch(e){}}catch(e){console.warn('rank482',e);}})();
