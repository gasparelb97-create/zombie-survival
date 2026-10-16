'use strict';
// ======================= v4.3.84 shop icons: weapons rendered from the real 3D models (assets/icons), drawn equipment icons =======================
(function(){
const R={};['ar','axe','burst','crossbow','dbarrel','flamer','fox','glauncher','hammer','hunt','knife','laser','minigun','pick','pistol','plasma','revolver','saw','shotgun','smg','sniper','thunder','vespa'].forEach(k=>R[k]='assets/icons/'+k+'.webp');
const bad={};
if(typeof wArt482==='function'){const _wa=wArt482;wArt482=function(id){if(R[id]&&!bad[id])return R[id];return _wa.apply(this,arguments);};try{window.wArt482=wArt482;}catch(e){}
  // fallback to the drawn art if an icon file fails to load
  for(const k in R){const im=new Image();im.onerror=()=>{bad[k]=1;try{document.querySelectorAll('img[src="'+R[k]+'"]').forEach(x=>{x.src=_wa(k);});}catch(e){}};im.src=R[k];}}
const C={};
function cv(f){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.lineJoin='round';g.lineCap='round';g.save();g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=14;g.shadowOffsetY=8;f(g);g.restore();
  // same 512x256 box as the weapon icons, art fitted to the same 196px content height, centred
  const o=document.createElement('canvas');o.width=512;o.height=256;const h=196/218*256;o.getContext('2d').drawImage(c,(512-h)/2,(256-h)/2,h,h);return o.toDataURL('image/png');}
const lg=(g,x0,y0,x1,y1,st)=>{const r=g.createLinearGradient(x0,y0,x1,y1);st.forEach((s,i)=>r.addColorStop(i/(st.length-1),s));return r;};
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function fs(g,fill,stroke,lw){g.fillStyle=fill;g.fill();g.save();g.shadowColor='transparent';g.strokeStyle=stroke||'rgba(0,0,0,.6)';g.lineWidth=lw||3;g.stroke();g.restore();}
function shine(g,x,y,w,h){g.save();g.shadowColor='transparent';rr(g,x,y,w,h,h/2);g.fillStyle='rgba(255,255,255,.22)';g.fill();g.restore();}
const D={
 backpack:g=>{rr(g,58,52,140,170,34);fs(g,lg(g,0,52,0,222,['#8a9a5a','#5d6b38','#3a4422']));rr(g,82,30,92,40,18);fs(g,lg(g,0,30,0,70,['#6d7a44','#434d28']));
  rr(g,76,120,104,80,18);fs(g,lg(g,0,120,0,200,['#76854a','#4b5630']));g.save();g.shadowColor='transparent';g.strokeStyle='#2a3018';g.lineWidth=3;g.setLineDash([7,6]);rr(g,84,128,88,64,12);g.stroke();g.restore();
  for(const x of [92,148]){rr(g,x,80,16,46,5);fs(g,lg(g,0,80,0,126,['#3a3022','#221b12']));rr(g,x+2,110,12,10,3);fs(g,lg(g,0,110,0,120,['#e7d08a','#a9893c']),'#5a4a1a',2);}shine(g,72,62,112,12);},
 vest:g=>{g.beginPath();g.moveTo(70,40);g.lineTo(104,40);g.quadraticCurveTo(128,74,152,40);g.lineTo(186,40);g.lineTo(206,96);g.lineTo(196,222);g.lineTo(60,222);g.lineTo(50,96);g.closePath();fs(g,lg(g,0,40,0,222,['#f0a640','#e07a1a','#a24d0c']));
  for(const y of [118,170]){rr(g,58,y,140,16,4);fs(g,lg(g,0,y,0,y+16,['#e8eef2','#a9b5bf']),'#4a5560',2);}g.save();g.shadowColor='transparent';g.strokeStyle='#5a2c06';g.lineWidth=4;g.beginPath();g.moveTo(128,72);g.lineTo(128,222);g.stroke();g.restore();
  for(const x of [76,150]){rr(g,x,190,30,26,5);fs(g,lg(g,0,190,0,216,['#c96a14','#8a440a']));}shine(g,80,50,30,9);shine(g,146,50,30,9);},
 medpack:g=>{rr(g,40,70,176,140,22);fs(g,lg(g,0,70,0,210,['#f4f6f8','#cfd6dc','#9aa5ae']));rr(g,96,44,64,36,12);g.save();g.shadowColor='transparent';g.strokeStyle='#5a6670';g.lineWidth=10;g.stroke();g.restore();
  rr(g,40,104,176,10,3);fs(g,'#b8c1c9','rgba(0,0,0,.3)',2);g.beginPath();g.moveTo(112,120);g.lineTo(144,120);g.lineTo(144,140);g.lineTo(164,140);g.lineTo(164,172);g.lineTo(144,172);g.lineTo(144,192);g.lineTo(112,192);g.lineTo(112,172);g.lineTo(92,172);g.lineTo(92,140);g.lineTo(112,140);g.closePath();fs(g,lg(g,0,120,0,192,['#ff5a4e','#d0201a','#8e1210']),'#5a0a08',3);shine(g,56,78,144,12);},
 nadebag:g=>{g.beginPath();g.ellipse(128,150,68,76,0,0,7);fs(g,lg(g,0,74,0,226,['#7f8c4a','#55602c','#2f3618']));for(let i=-1;i<=1;i++){g.save();g.shadowColor='transparent';g.strokeStyle='rgba(20,24,10,.7)';g.lineWidth=3;g.beginPath();g.moveTo(66,150+i*34);g.quadraticCurveTo(128,160+i*34,190,150+i*34);g.stroke();g.restore();}
  rr(g,108,52,40,30,6);fs(g,lg(g,0,52,0,82,['#c9ced4','#7d858e']));g.beginPath();g.arc(166,62,18,0,7);g.save();g.shadowColor='transparent';g.strokeStyle='#c9ced4';g.lineWidth=6;g.stroke();g.restore();g.beginPath();g.ellipse(104,112,18,12,-.5,0,7);g.fillStyle='rgba(255,255,255,.2)';g.fill();},
 boots:g=>{g.beginPath();g.moveTo(84,30);g.lineTo(150,30);g.lineTo(150,146);g.quadraticCurveTo(214,150,222,190);g.lineTo(222,210);g.lineTo(60,210);g.lineTo(62,150);g.closePath();fs(g,lg(g,0,30,0,210,['#8a5a32','#5e3a1c','#3a220e']));
  rr(g,54,200,174,22,8);fs(g,lg(g,0,200,0,222,['#3a3a3a','#141414']));for(let i=0;i<5;i++){g.save();g.shadowColor='transparent';g.strokeStyle='#d8c8a0';g.lineWidth=3;g.beginPath();g.moveTo(100,54+i*20);g.lineTo(140,62+i*20);g.moveTo(100,62+i*20);g.lineTo(140,54+i*20);g.stroke();g.restore();}shine(g,90,36,50,8);},
 magnet:g=>{g.beginPath();g.moveTo(52,40);g.lineTo(104,40);g.lineTo(104,140);g.arc(128,140,24,Math.PI,0,true);g.lineTo(152,40);g.lineTo(204,40);g.lineTo(204,140);g.arc(128,140,76,0,Math.PI);g.closePath();fs(g,lg(g,0,40,0,216,['#ff6a5a','#d82a1e','#8a120c']));
  rr(g,52,40,52,34,4);fs(g,lg(g,0,40,0,74,['#f2f5f8','#a6b0ba']),'#4a5560',2);rr(g,152,40,52,34,4);fs(g,lg(g,0,40,0,74,['#f2f5f8','#a6b0ba']),'#4a5560',2);g.beginPath();g.ellipse(84,150,8,40,.2,0,7);g.fillStyle='rgba(255,255,255,.22)';g.fill();},
 gift:g=>{rr(g,48,104,160,114,10);fs(g,lg(g,0,104,0,218,['#e8473a','#b82018','#7a100a']));rr(g,38,80,180,36,8);fs(g,lg(g,0,80,0,116,['#ff6a5a','#c82a1e']));
  rr(g,114,80,28,138,3);fs(g,lg(g,114,0,142,0,['#ffe08a','#f4b52a','#c98a10']),'#7a5208',2);for(const s of [-1,1]){g.beginPath();g.moveTo(128,80);g.bezierCurveTo(128+s*20,30,128+s*70,40,128+s*40,78);g.closePath();fs(g,lg(g,0,36,0,80,['#ffe08a','#e0a020']),'#7a5208',3);}shine(g,50,86,150,10);}};
const MAP={e_backpack:'backpack',e_armor:'vest',e_medpack:'medpack',e_nadebag:'nadebag',e_boots:'boots',e_magnet:'magnet',starter:'gift'};
window.icon484=function(key){const d=MAP[key];if(!d||!D[d])return '';if(!C[d])try{C[d]=cv(D[d]);}catch(e){C[d]='';}return C[d];};
})();
