'use strict';
// ======================= v4.3.84 backpack rebuilt: fixed tabbed inventory (grid + paper doll + detail panel), no scroll =======================
(function(){const BS=document.getElementById('bagScreen');if(!BS||typeof renderBag!=='function')return;
const css=`
body.bag484 #bagScreen{opacity:0!important;pointer-events:none!important}body.bag484 #bagCloseApk{display:none!important}
#bag484{position:fixed;inset:0;z-index:21;display:none;grid-template-rows:44px 36px 1fr;gap:6px;padding:8px 12px 10px;box-sizing:border-box;background:radial-gradient(120% 100% at 50% 0%,#232016 0%,#14130e 55%,#0b0b08 100%);color:#e9e4d6;font-family:system-ui,sans-serif;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
body.bag484 #bag484{display:grid}
#bag484 .hd{display:flex;align-items:center;gap:10px;min-width:0}
#bag484 .hd h2{margin:0;font:900 21px/1 system-ui,sans-serif;letter-spacing:3px;color:#f3ead2;text-shadow:0 2px 0 #000}
#bag484 .cap{flex:1;display:flex;align-items:center;gap:8px;min-width:0;max-width:330px}
#bag484 .cap b{font:800 14px/1 system-ui;white-space:nowrap}#bag484 .cap i{flex:1;height:10px;border-radius:5px;background:#2c2a20;border:1px solid #4a4532;overflow:hidden}#bag484 .cap u{display:block;height:100%;background:linear-gradient(90deg,#8fbf4a,#d6c24a);text-decoration:none}
#bag484 .cap.full u{background:linear-gradient(90deg,#e0603a,#ff8a5a)}
#bag484 .chip{display:flex;align-items:center;gap:6px;height:30px;padding:0 11px 0 6px;border-radius:15px;background:#201e16;border:1px solid #4a4532;font:800 15px/1 system-ui;white-space:nowrap}
#bag484 .chip i{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3b0,#f4c430 40%,#b07a10);box-shadow:inset 0 0 0 2px #8a5c08}
#bag484 .chip.lv i{border-radius:5px;background:linear-gradient(180deg,#8fd1ff,#2f7fd0);box-shadow:none}
#bag484 .x{width:38px;height:34px;border-radius:9px;border:1px solid #5a543c;background:#2a271d;color:#f3ead2;font:900 18px/1 system-ui}
#bag484 .tabs{display:flex;gap:6px}
#bag484 .tabs button{height:34px;padding:0 14px;border-radius:9px;border:1px solid #4a4532;background:#1c1a13;color:#cfc6ad;font:800 13px/1 system-ui;letter-spacing:.5px;display:flex;align-items:center;gap:7px}
#bag484 .tabs button img{width:22px;height:22px}
#bag484 .tabs button.on{background:linear-gradient(180deg,#5a4d26,#3a321a);border-color:#c9a74a;color:#fff3cf;box-shadow:inset 0 -2px 0 #c9a74a}
#bag484 .tabs button small{font-size:11px;color:#a89f86;font-weight:700}
#bag484 .bd{display:grid;gap:10px;min-height:0}
#bag484 .pn{min-height:0;border-radius:12px;background:linear-gradient(180deg,#1d1b14,#141310);border:1px solid #3c3829;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);padding:8px;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column}
#bag484 .pt{font:900 11px/1 system-ui;letter-spacing:1.5px;text-transform:uppercase;color:#b5a983;margin:0 0 6px;display:flex;justify-content:space-between;white-space:nowrap}
#bag484 .grid{flex:1;min-height:0;display:grid;gap:6px;align-content:start}
#bag484 .sl{position:relative;border-radius:8px;background:linear-gradient(180deg,#26241b,#1a1913);border:1.5px solid #3e3a2b;box-shadow:inset 0 2px 6px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0;color:inherit}
#bag484 .sl.e{background:rgba(30,29,22,.55);border-style:dashed;border-color:#2f2c21;box-shadow:none}
#bag484 .sl img{width:78%;height:78%;object-fit:contain;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
#bag484 .sl.w img{width:92%;height:70%}
#bag484 .sl.z img{opacity:.35;filter:grayscale(1)}
#bag484 .sl .q{position:absolute;right:4px;bottom:2px;font:900 14px/1 system-ui;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000}
#bag484 .sl .n{position:absolute;left:5px;top:3px;right:5px;font:800 9.5px/1.1 system-ui;color:#d9d0b6;text-align:left;text-shadow:0 1px 2px #000;white-space:normal}
#bag484 .sl.sel{border-color:#ffd25a;box-shadow:0 0 0 1px #ffd25a,0 0 12px rgba(255,210,90,.35),inset 0 2px 6px rgba(0,0,0,.5)}
#bag484 .sl .up{position:absolute;left:4px;top:3px;font:900 12px/1 system-ui;color:#7dff7a;text-shadow:0 1px 2px #000}
#bag484 .sl .lk{position:absolute;left:0;right:0;bottom:0;font:800 9px/1.4 system-ui;background:rgba(0,0,0,.65);color:#ffb0a0;text-align:center}
#bag484 .r0{border-color:#8d939c}#bag484 .r1{border-color:#3fa2ff}#bag484 .r2{border-color:#b467ff}#bag484 .r3{border-color:#ffb02e}#bag484 .r4{border-color:#9ff8ff}
#bag484 .sl.r1{background:linear-gradient(180deg,#1b2a3e,#141a22)}#bag484 .sl.r2{background:linear-gradient(180deg,#2a1c3e,#18131f)}#bag484 .sl.r3{background:linear-gradient(180deg,#3a2c12,#1c170e)}#bag484 .sl.r4{background:linear-gradient(180deg,#183a3e,#10201f)}
#bag484 .pg{display:flex;justify-content:center;gap:6px;margin-top:5px;height:22px}
#bag484 .pg button{min-width:30px;height:22px;border-radius:6px;border:1px solid #4a4532;background:#1c1a13;color:#cfc6ad;font:800 12px/1 system-ui}#bag484 .pg button.on{background:#5a4d26;border-color:#c9a74a;color:#fff}
#bag484 .det .bi{height:34%;min-height:60px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:radial-gradient(60% 70% at 50% 55%,rgba(255,220,140,.12),rgba(0,0,0,0) 70%)}
#bag484 .det .bi img{max-width:92%;max-height:100%;object-fit:contain;filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}
#bag484 .det h3{margin:4px 0 1px;font:900 16px/1.1 system-ui;color:#fff6dc}
#bag484 .det .sub{font:800 10.5px/1.2 system-ui;letter-spacing:1px;text-transform:uppercase;color:#b5a983}
#bag484 .det .rows{margin-top:5px;display:grid;gap:3px}
#bag484 .det .row{display:flex;justify-content:space-between;gap:8px;font:700 12.5px/1.25 system-ui;color:#d9d0b6;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05)}#bag484 .det .row b{color:#fff;font-weight:900}
#bag484 .det .ds{margin-top:5px;font:600 11.5px/1.3 system-ui;color:#bfb79f}
#bag484 .det .ac{margin-top:auto;display:flex;gap:6px;flex-wrap:wrap}
#bag484 .det .ac button{flex:1 1 40%;height:34px;border-radius:9px;border:0;font:900 13px/1 system-ui;color:#fff;background:linear-gradient(180deg,#5fae3a,#3c7d22);box-shadow:0 2px 0 #2a5a16}
#bag484 .det .ac button.g{background:linear-gradient(180deg,#4a4535,#34301f);box-shadow:0 2px 0 #1f1c12;color:#e9e1c8}
#bag484 .det .ac button:disabled{opacity:.5}
#bag484 .det .bar{display:grid;grid-template-columns:76px 1fr;align-items:center;gap:6px;font:700 11.5px/1 system-ui;color:#d9d0b6;margin:2px 0}#bag484 .det .bar i{height:7px;border-radius:4px;background:#2c2a20;overflow:hidden}#bag484 .det .bar b{display:block;height:100%;background:linear-gradient(90deg,#c99a3a,#ffd76a);border-radius:4px}
#bag484 .doll{position:relative}
#bag484 .doll .fig{position:absolute;left:50%;top:16px;height:196px;width:110px;transform:translateX(-50%);background-repeat:no-repeat;background-position:center;background-size:contain;opacity:.9}
#bag484 .doll .sl{position:absolute;width:48px;height:48px}
#bag484 .doll .stt{position:absolute;left:8px;right:8px;bottom:6px;display:grid;grid-template-columns:repeat(5,1fr);gap:4px}
#bag484 .doll .stt div{text-align:center;font:900 12px/1.1 system-ui;color:#fff;background:#24221a;border:1px solid #3e3a2b;border-radius:6px;padding:3px 0}#bag484 .doll .stt small{display:block;font:700 8.5px/1.1 system-ui;color:#b5a983;letter-spacing:.3px}
#bag484 .ft{font:600 10.5px/1.2 system-ui;color:#9d9580;margin-top:5px}
`;const st=document.createElement('style');st.id='bag484css';st.textContent=css;document.head.appendChild(st);
const root=document.createElement('div');root.id='bag484';document.body.appendChild(root);
const T={tab:'mat',sel:{},page:{}};const esc4=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
// ---------- drawn icons ----------
const IC={};
const lg=(g,x0,y0,x1,y1,s)=>{const r=g.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>r.addColorStop(i/(s.length-1),c));return r;};
function P(g,pts){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();}
function F(g,fill,st,lw){g.fillStyle=fill;g.fill();g.save();g.shadowColor='transparent';g.strokeStyle=st||'rgba(0,0,0,.65)';g.lineWidth=lw||2.5;g.stroke();g.restore();}
function RR(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function HL(g,x,y,w,h){g.save();g.shadowColor='transparent';RR(g,x,y,w,h,h/2);g.fillStyle='rgba(255,255,255,.25)';g.fill();g.restore();}
const DR={
 wood:g=>{for(const [x,y,a] of [[20,70,-.25],[34,44,.12],[26,92,.05]]){g.save();g.translate(x+44,y+12);g.rotate(a);RR(g,-44,-13,88,26,12);F(g,lg(g,0,-13,0,13,['#b97a44','#8a5226','#5a3212']));g.beginPath();g.ellipse(44,0,10,13,0,0,7);F(g,lg(g,34,0,54,0,['#e8c08a','#c08850']));g.save();g.shadowColor='transparent';g.strokeStyle='rgba(110,60,20,.8)';g.lineWidth=1.5;g.beginPath();g.ellipse(44,0,5,7,0,0,7);g.stroke();g.restore();HL(g,-36,-9,60,4);g.restore();}},
 stone:g=>{P(g,[[18,86],[30,50],[62,34],[96,42],[112,76],[100,104],[56,112],[26,104]]);F(g,lg(g,0,34,0,112,['#c9ccd2','#8d939c','#5a5f68']));P(g,[[30,52],[62,36],[94,44],[70,62],[40,66]]);g.fillStyle='rgba(255,255,255,.18)';g.fill();g.save();g.shadowColor='transparent';g.strokeStyle='rgba(40,42,48,.6)';g.lineWidth=2;g.beginPath();g.moveTo(70,62);g.lineTo(78,96);g.moveTo(40,66);g.lineTo(34,94);g.stroke();g.restore();},
 iron:g=>{for(let i=0;i<3;i++){const y=90-i*20,x=18+i*8;P(g,[[x,y],[x+76,y],[x+90,y-14],[x+14,y-14]]);F(g,lg(g,0,y-14,0,y,['#d6dde6','#8a95a3','#59626e']));P(g,[[x+76,y],[x+90,y-14],[x+90,y-6],[x+76,y+8]]);F(g,'#4a525c');RR(g,x,y,76,8,1);F(g,'#5f6874');HL(g,x+18,y-11,48,3);}},
 coal:g=>{for(const [x,y,s] of [[38,72,30],[78,80,26],[58,48,24],[86,52,18]]){g.beginPath();for(let i=0;i<7;i++){const a=i/7*6.283,r=s*(.8+((i*37)%5)/12);g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();F(g,lg(g,x-s,y-s,x+s,y+s,['#56585e','#26272b','#0e0e10']));g.beginPath();g.ellipse(x-s*.35,y-s*.35,s*.28,s*.14,-.6,0,7);g.fillStyle='rgba(200,210,230,.35)';g.fill();}},
 metal:g=>{g.save();g.translate(64,64);g.rotate(-.5);RR(g,-10,-44,20,70,4);F(g,lg(g,-10,0,10,0,['#9aa6b4','#e6ecf2','#7d8896']));for(let i=0;i<6;i++){g.fillStyle='rgba(40,46,56,.55)';g.fillRect(-10,-30+i*9,20,2.5);}P(g,[[-26,-54],[26,-54],[30,-42],[-30,-42]]);F(g,lg(g,0,-54,0,-42,['#eef2f6','#8a95a3']));g.beginPath();g.moveTo(-26,-54);g.lineTo(-30,-42);g.restore();
   g.beginPath();g.arc(92,92,18,0,7);F(g,lg(g,74,74,110,110,['#e6ecf2','#7d8896']));g.beginPath();g.arc(92,92,8,0,7);F(g,'#2a2f36');},
 elec:g=>{RR(g,18,40,92,58,6);F(g,lg(g,0,40,0,98,['#2f8a4a','#1d6a34','#0f4220']));g.save();g.shadowColor='transparent';g.strokeStyle='#d6b34a';g.lineWidth=2;for(const y of [52,66,80]){g.beginPath();g.moveTo(24,y);g.lineTo(52,y);g.lineTo(60,y+6);g.lineTo(104,y+6);g.stroke();}g.restore();
   RR(g,46,52,34,30,3);F(g,lg(g,0,52,0,82,['#3a3e45','#15171a']));for(let i=0;i<5;i++){g.fillStyle='#c9ced4';g.fillRect(48+i*6.5,46,3,6);g.fillRect(48+i*6.5,82,3,6);}g.beginPath();g.arc(96,52,5,0,7);g.fillStyle='#7dff9a';g.fill();},
 nade:g=>{g.beginPath();g.ellipse(60,76,30,36,0,0,7);F(g,lg(g,30,40,90,112,['#7f9a4a','#4a5f2a','#283616']));g.save();g.shadowColor='transparent';g.strokeStyle='rgba(20,28,10,.75)';g.lineWidth=2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(32,76+i*13);g.quadraticCurveTo(60,80+i*13,88,76+i*13);g.stroke();}g.restore();
   RR(g,48,30,26,16,3);F(g,lg(g,0,30,0,46,['#d6dbe2','#7d858e']));P(g,[[70,32],[98,26],[100,34],[74,42]]);F(g,lg(g,0,26,0,42,['#c9ced4','#6a727c']));g.beginPath();g.arc(42,34,9,0,7);g.save();g.shadowColor='transparent';g.strokeStyle='#d6b34a';g.lineWidth=3.5;g.stroke();g.restore();g.beginPath();g.ellipse(48,62,8,5,-.6,0,7);g.fillStyle='rgba(255,255,255,.22)';g.fill();},
 helmet:g=>{g.beginPath();g.moveTo(20,82);g.quadraticCurveTo(22,28,64,26);g.quadraticCurveTo(106,28,108,82);g.closePath();F(g,lg(g,0,26,0,82,['#7a8a4a','#4f5c2c','#313a1a']));RR(g,14,78,100,14,7);F(g,lg(g,0,78,0,92,['#5f6c36','#2f3818']));
   RR(g,40,92,48,10,4);F(g,'#3a3022');HL(g,40,36,30,6);},
 torso:g=>{P(g,[[30,26],[50,22],[64,34],[78,22],[98,26],[112,52],[104,60],[96,50],[96,110],[32,110],[32,50],[24,60],[16,52]]);F(g,lg(g,0,22,0,110,['#6d7a54','#4a5636','#2c341e']));g.save();g.shadowColor='transparent';g.strokeStyle='#2a3018';g.lineWidth=2.5;g.beginPath();g.moveTo(64,34);g.lineTo(64,110);g.stroke();g.restore();
   for(const x of [38,72]){RR(g,x,62,20,16,3);F(g,'#56623f');}for(let i=0;i<4;i++){g.beginPath();g.arc(68,46+i*16,2.2,0,7);g.fillStyle='#d6c08a';g.fill();}},
 gloves:g=>{P(g,[[36,108],[34,64],[26,46],[34,40],[42,54],[44,30],[52,28],[56,52],[60,26],[68,26],[70,52],[74,30],[82,32],[82,58],[92,50],[100,56],[86,84],[86,108]]);F(g,lg(g,0,26,0,108,['#8a6a46','#5e4528','#3a2a16']));RR(g,34,96,54,14,4);F(g,'#2a2018');HL(g,46,36,8,16);},
 pants:g=>{P(g,[[34,20],[94,20],[100,110],[74,110],[64,52],[54,110],[28,110]]);F(g,lg(g,0,20,0,110,['#5a6a8a','#3a4766','#232c42']));RR(g,32,18,64,12,3);F(g,'#2a2018');g.fillStyle='#c9a74a';g.fillRect(60,20,8,10);for(const x of [40,76]){RR(g,x,58,14,16,3);F(g,'#46557a');}},
 boots:g=>{P(g,[[34,18],[70,18],[70,72],[104,80],[110,100],[110,108],[26,108],[28,72]]);F(g,lg(g,0,18,0,108,['#7a5232','#523418','#30200c']));RR(g,22,100,92,12,4);F(g,'#151515');g.save();g.shadowColor='transparent';g.strokeStyle='#d8c8a0';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(42,30+i*11);g.lineTo(62,34+i*11);g.moveTo(42,34+i*11);g.lineTo(62,30+i*11);g.stroke();}g.restore();},
 backpack:g=>{RR(g,26,28,76,86,18);F(g,lg(g,0,28,0,114,['#8a9a5a','#5d6b38','#3a4422']));RR(g,38,14,52,22,10);F(g,'#4f5a2e');RR(g,36,66,56,40,10);F(g,lg(g,0,66,0,106,['#76854a','#4b5630']));for(const x of [40,80]){RR(g,x,38,8,30,3);F(g,'#2f2618');}HL(g,36,34,56,6);},
 weapon:g=>{g.save();g.translate(64,64);g.rotate(-.75);RR(g,-8,-50,16,64,5);F(g,lg(g,-8,0,8,0,['#8a2a1a','#c84a30','#7a2010']));RR(g,-6,12,12,40,3);F(g,lg(g,-6,0,6,0,['#9aa6b4','#e6ecf2','#7d8896']));P(g,[[-14,48],[-14,62],[-4,62],[-4,54],[4,54],[4,62],[14,62],[14,48]]);F(g,lg(g,0,48,0,62,['#e6ecf2','#7d8896']));g.restore();},
 doll:g=>{g.fillStyle='rgba(200,190,160,.10)';g.strokeStyle='rgba(200,190,160,.22)';g.lineWidth=2;g.beginPath();g.arc(64,22,14,0,7);g.fill();g.stroke();P(g,[[40,42],[88,42],[100,96],[90,98],[84,66],[84,112],[92,186],[72,186],[64,122],[56,186],[36,186],[44,112],[44,66],[38,98],[28,96]]);g.fill();g.stroke();}};
function ic(k,w,h){const key=k+(w||'');if(IC[key]!==undefined)return IC[key];let u='';try{const d=DR[k];if(d){const c=document.createElement('canvas');c.width=w||128;c.height=h||128;const g=c.getContext('2d');g.lineJoin='round';g.lineCap='round';if(w)g.scale(w/128,(h||128)/(k==='doll'?200:128));g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=6;g.shadowOffsetY=3;d(g);u=c.toDataURL('image/png');}}catch(e){}IC[key]=u;return u;}
const wIc=id=>{try{return typeof wArt482==='function'?wArt482(id):'';}catch(e){return '';}};
const DESC={wood:'Dagli alberi con l\'ascia. Serve per costruire la base, barricate e attrezzi.',stone:'Dalle rocce con il piccone. Per muri resistenti e attrezzi di pietra.',iron:'Dalle vene di ferro con il piccone. Per attrezzi e armi di ferro.',coal:'Dalle rocce scure. Serve per fondere il metallo al banco.',metal:'Dai rottami e dalle auto. Per potenziare armi e difese.',elec:'Componenti elettronici rari. Per torrette, luci e armi avanzate.'};
const fm=n=>{try{return fmt(n);}catch(e){return String(n|0);}};
// ---------- data ----------
function mats(){return RES_K.map(k=>({id:k,ic:ic(k),n:RES[k].n,q:inv[k]|0,z:!(inv[k]|0)}));}
function ammo(){const L=[{id:'nade',ic:ic('nade'),n:'Granate',q:S.nades|0,z:!(S.nades|0),nade:1}];WEAPONS.forEach(w=>{if(!own[w.id]||w.melee||w.tool||!w.mag)return;const m=mag[w.id]|0,r=res[w.id]|0;L.push({id:w.id,ic:wIc(w.id),n:w.name,q:m+'/'+r,z:!(m+r),w:1,wp:w,m,r});});return L;}
function tools(){if(!(typeof SV!=='undefined'&&SV.on))return [];return ['axe','pick','hammer'].map(k=>{const w=WEAPONS.find(q=>q.id===k);return w?{id:k,ic:wIc(k),n:toolName(w),q:'',w:1,tool:1,tier:toolTier(w)}:null;}).filter(Boolean);}
function gearBag(){return (P42.gb||[]).map((it,i)=>({id:'b'+i,i,it,ic:ic(it.s),n:GSLOT[it.s].n,r:it.r,lk:it.l>P42.L,up:!(it.l>P42.L)&&gBetter(it)}));}
// ---------- render ----------
function tile(x,sel,cls){return '<button class="sl'+(cls||'')+(x.r!=null?' r'+x.r:'')+(x.z?' z':'')+(sel?' sel':'')+'" data-s="'+esc4(x.id)+'">'+(x.ic?'<img alt="" src="'+x.ic+'">':'')+(x.nm?'<span class="n">'+esc4(x.n)+'</span>':'')+(x.up?'<span class="up">▲</span>':'')+(x.q!==''&&x.q!=null?'<span class="q">'+esc4(x.q)+'</span>':'')+(x.lk?'<span class="lk">Liv. '+x.it.l+'</span>':'')+'</button>';}
function gridHTML(items,key,tw,th,wide){return '<div class="grid" data-g="'+key+'" data-tw="'+tw+'" data-th="'+th+'"></div><div class="pg" data-pg="'+key+'"></div>';}
function layoutGrid(box,items,key,tw,th,cls){const g=box.querySelector('[data-g="'+key+'"]'),pg=box.querySelector('[data-pg="'+key+'"]');if(!g)return;const W=g.clientWidth,H=g.clientHeight,gap=6;
  const cols=Math.max(1,Math.floor((W+gap)/(tw+gap))),rows=Math.max(1,Math.floor((H+gap)/(th+gap))),per=cols*rows,pages=Math.max(1,Math.ceil(items.length/per));let p=Math.min(T.page[key]|0,pages-1);T.page[key]=p;
  const cw=Math.floor((W-gap*(cols-1))/cols);g.style.gridTemplateColumns='repeat('+cols+','+cw+'px)';g.style.gridAutoRows=th+'px';
  let h='';const sl=items.slice(p*per,p*per+per);for(const x of sl)h+=tile(x,T.sel[T.tab]===x.id,cls);for(let i=sl.length;i<per;i++)h+='<div class="sl e"></div>';g.innerHTML=h;
  pg.innerHTML=pages>1?Array.from({length:pages},(_,i)=>'<button class="'+(i===p?'on':'')+'" data-p="'+key+':'+i+'">'+(i+1)+'</button>').join(''):'';if(pages<=1)pg.style.visibility='hidden';else pg.style.visibility='';}
function detMat(x){return '<div class="bi"><img alt="" src="'+x.ic+'"></div><h3>'+esc4(x.n)+'</h3><div class="sub">Materiale</div><div class="rows"><div class="row"><span>Nello zaino</span><b>'+x.q+'</b></div></div><div class="ds">'+esc4(DESC[x.id]||'')+'</div><div class="ft">Si perde se muori: depositalo nella cassa della base.</div>';}
function detAmmo(x){if(x.nade)return '<div class="bi"><img alt="" src="'+x.ic+'"></div><h3>Granate</h3><div class="sub">Esplosivo</div><div class="rows"><div class="row"><span>Pronte</span><b>'+x.q+'</b></div></div><div class="ds">Lanciale col tasto granata: danno ad area contro gruppi di zombie.</div>';
  let bars='';try{const w=x.wp;const r=w.bars?w.bars:[Math.min(1,Math.sqrt(w.dmg*w.pellets/130)),Math.min(1,(1/w.rate)/14),clamp(1-w.spread/.075,.06,1),Math.min(1,w.mag/40)];bars=['Danno','Cadenza','Precisione','Caricatore'].map((l,i)=>'<div class="bar"><span>'+l+'</span><i><b style="width:'+Math.round(r[i]*100)+'%"></b></i></div>').join('');}catch(e){}
  return '<div class="bi"><img alt="" src="'+x.ic+'"></div><h3>'+esc4(x.n)+'</h3><div class="sub">Arma da fuoco</div><div class="rows"><div class="row"><span>Nel caricatore</span><b>'+x.m+'</b></div><div class="row"><span>Riserva</span><b>'+x.r+'</b></div></div><div style="margin-top:4px">'+bars+'</div>';}
function detTool(x){return '<div class="bi"><img alt="" src="'+x.ic+'"></div><h3>'+esc4(x.n)+'</h3><div class="sub">Attrezzo · '+(['Legno','Pietra','Ferro'][x.tier]||'')+'</div><div class="rows"><div class="row"><span>Livello</span><b>'+(x.tier+1)+' / 3</b></div></div><div class="ds">'+({axe:'Abbatte gli alberi: più alto il livello, più legna per colpo.',pick:'Spacca rocce e vene di ferro e carbone.',hammer:'Costruisce e ripara la base.'})[x.id]+' Si migliora nel Crafting.</div>';}
function detGear(sel){let it=null,where='',i=null;if(sel&&sel[0]==='q'){i=sel.slice(1);it=P42.eq[i];where='eq';}else if(sel&&sel[0]==='b'){i=+sel.slice(1);it=(P42.gb||[])[i];where='bag';}
  if(!it)return '<h3 style="margin-top:8px">Equipaggiamento</h3><div class="ds">Tocca uno slot del personaggio o un oggetto nella borsa per vedere i dettagli.<br><br>Lo trovi uccidendo zombie (fascio di luce colorato) e dai boss.</div><div class="ac"><button class="g" data-act="dropinfo">Probabilità di drop</button></div>';
  const R=GEAR_CFG.rar[it.r],cur=P42.eq[it.s],dp=Math.round((gPow(it)-gPow(cur))*10)/10;
  const rows=Object.entries(it.st).map(([k,v])=>'<div class="row"><span>'+GST_L[k][0]+'</span><b>'+(GST_L[k][1]==='%'?'+'+v+'%':'+'+v)+'</b></div>').join('');
  let ac='';if(where==='bag'){ac+=it.l>P42.L?'<button disabled>🔒 Liv. '+it.l+'</button>':'<button data-gact="equip">Equipaggia</button>';ac+='<button class="g" data-gact="drop">Scarta +'+[5,15,40,100,250][it.r]+'</button>';}else ac+='<button class="g" data-gact="unequip">Togli</button>';
  if(it.r<=1)ac+='<button class="g" data-gact="reroll">Rilancia '+REROLL42[it.r]+'</button>';
  return '<div class="bi"><img alt="" src="'+ic(it.s)+'"></div><h3 style="color:'+R.c+'">'+esc4(gName(it))+'</h3><div class="sub">'+esc4(R.n)+' · Liv. '+it.l+(where==='eq'?' · indossato':'')+'</div><div class="rows">'+rows+'</div>'+(where==='bag'&&cur?'<div class="ds">Rispetto a quello indossato: '+(dp>0?'<b style="color:#7dff7a">▲ +'+dp+'</b>':dp<0?'<b style="color:#ff8a7a">▼ '+dp+'</b>':'uguale')+'</div>':'')+'<div class="ac">'+ac+'</div>';}
const SLOTPOS={helmet:[1,0],torso:[1,1],pants:[1,2],gloves:[0,1],boots:[0,2],weapon:[2,1],backpack:[2,2]};
function render(){try{const n=bagCount(),c=bagCap(),tl=tools(),am=ammo();if(T.tab==='tools'&&!tl.length)T.tab='mat';
  const tabs=[['mat','Materiali',ic('wood'),n+'/'+c],['ammo','Munizioni',ic('nade'),''],['eq','Equipaggiamento',ic('torso'),(P42.gb||[]).length+'/'+GEAR_CFG.bagMax]];if(tl.length)tabs.splice(2,0,['tools','Attrezzi',ic('weapon'),'']);
  let h='<div class="hd"><h2>ZAINO</h2><div class="cap'+(n>=c?' full':'')+'"><b>'+n+' / '+c+'</b><i><u style="width:'+Math.min(100,n/c*100)+'%"></u></i></div><div style="flex:1"></div><div class="chip lv"><i></i>Liv. '+(P42.L|0)+'</div><div class="chip"><i></i>'+fm(P42.c)+'</div><button class="x" data-act="close">✕</button></div>';
  h+='<div class="tabs">'+tabs.map(t=>'<button data-t484="'+t[0]+'" class="'+(T.tab===t[0]?'on':'')+'"><img alt="" src="'+t[2]+'">'+t[1]+(t[3]?' <small>'+t[3]+'</small>':'')+'</button>').join('')+'</div>';
  let items=[],det='',body='';
  if(T.tab==='eq'){const gb=gearBag();let doll='<div class="pn doll"><div class="pt"><span>Personaggio</span></div><div class="fig" style="background-image:url('+ic('doll',128,200)+')"></div>'+GS_K.map(k=>{const p=SLOTPOS[k]||[1,1];return '<span style="position:absolute;left:calc(50% - 34px + '+(p[0]-1)*72+'px);width:68px;top:'+(68+p[1]*60)+'px;text-align:center;font:800 8.5px/1 system-ui;letter-spacing:.4px;color:#9d9580;text-transform:uppercase">'+esc4(GSLOT[k].n)+'</span>';}).join('');
      for(const k of GS_K){const it=P42.eq[k],p=SLOTPOS[k]||[50,50],sel=T.sel.eq==='q'+k;doll+='<button class="sl'+(it?' r'+it.r:' e')+(sel?' sel':'')+'" data-s="q'+k+'" style="left:calc(50% - 24px + '+(p[0]-1)*72+'px);top:'+(18+p[1]*60)+'px"><img alt="" src="'+ic(k)+'" style="'+(it?'':'opacity:.28;filter:grayscale(1)')+'">'+(it?'':'')+'</button>';}
      const S2=ST42;doll+='<div class="stt"><div>'+S2.a.toFixed(0)+'%<small>ARMATURA</small></div><div>+'+S2.h+'<small>SALUTE</small></div><div>+'+S2.sp.toFixed(0)+'%<small>VELOCITÀ</small></div><div>+'+S2.dm.toFixed(0)+'%<small>DANNO</small></div><div>+'+S2.c+'<small>CAPIENZA</small></div></div></div>';
      body='<div class="bd" style="grid-template-columns:250px 1fr 220px">'+doll+'<div class="pn"><div class="pt"><span>Borsa equipaggiamento</span><span>'+gb.length+' / '+GEAR_CFG.bagMax+'</span></div>'+gridHTML(gb,'gb')+'</div><div class="pn det">'+detGear(T.sel.eq)+'</div></div>';items=gb;}
  else{let title='',lst=[],tw=72,th=72,cls='';if(T.tab==='mat'){lst=mats();title='Materiali';}else if(T.tab==='ammo'){lst=am;title='Munizioni e granate';tw=150;th=76;cls=' w';}else{lst=tl;title='Attrezzi';tw=150;th=76;cls=' w';}
    lst.forEach(x=>x.nm=!!x.w);if(!lst.find(x=>x.id===T.sel[T.tab]))T.sel[T.tab]=lst[0]&&lst[0].id;const x=lst.find(q=>q.id===T.sel[T.tab]);
    det=x?(T.tab==='mat'?detMat(x):T.tab==='ammo'?detAmmo(x):detTool(x)):'';
    body='<div class="bd" style="grid-template-columns:1fr 240px"><div class="pn"><div class="pt"><span>'+title+'</span>'+(T.tab==='mat'?'<span>'+n+' / '+c+' posti</span>':'')+'</div>'+gridHTML(lst,'g_'+T.tab)+(T.tab==='mat'?'<div class="ft">I materiali nello zaino si perdono se muori: depositali nella cassa della base.</div>':'')+'</div><div class="pn det">'+det+'</div></div>';items=lst;root.__l=[lst,tw,th,cls];}
  root.innerHTML=h+body;
  if(T.tab==='eq')layoutGrid(root,items,'gb',60,60,'');else{const [l,tw,th,cls]=root.__l;layoutGrid(root,l,'g_'+T.tab,tw,th,cls);}
 }catch(e){console.warn('bag484',e);}}
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!root.contains(b))return;e.stopPropagation();const d=b.dataset;
  if(d.act==='close'){try{closeBag();}catch(_){}return;}
  if(d.act==='dropinfo'){try{dropInfo();}catch(_){}return;}
  if(d.t484){T.tab=d.t484;render();try{play('ui');}catch(_){}return;}
  if(d.p){const [k,p]=d.p.split(':');T.page[k]=+p;render();return;}
  if(d.gact){const s=T.sel.eq;if(!s)return;try{eqSel=s[0]==='q'?{w:'eq',i:s.slice(1)}:{w:'bag',i:+s.slice(1)};}catch(_){}const pb=document.createElement('button');pb.dataset.gact=d.gact;pb.style.display='none';BS.appendChild(pb);try{pb.click();}finally{pb.remove();}if(d.gact!=='reroll')T.sel.eq=null;render();return;}
  if(d.s){T.sel[T.tab]=d.s;if(T.tab==='eq'){try{eqSel=d.s[0]==='q'?{w:'eq',i:d.s.slice(1)}:{w:'bag',i:+d.s.slice(1)};}catch(_){}}render();try{play('ui');}catch(_){}}},true);
// show/hide with the original screen (all game logic still opens/closes #bagScreen)
function sync(){const on=!BS.classList.contains('hidden');document.body.classList.toggle('bag484',on);if(on){try{const z=parseInt(getComputedStyle(BS).zIndex)||20;root.style.zIndex=String(z+1);}catch(e){}render();}}
new MutationObserver(sync).observe(BS,{attributes:true,attributeFilter:['class']});
for(const fn of ['renderBag','renderEq']){try{const f=window[fn]||(fn==='renderBag'?renderBag:renderEq);const nf=function(){const r=f.apply(this,arguments);if(document.body.classList.contains('bag484'))try{render();}catch(e){}return r;};if(fn==='renderBag')renderBag=nf;else renderEq=nf;try{window[fn]=nf;}catch(e){}}catch(e){}}
window.bag484Render=render;sync();
})();
