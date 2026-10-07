/* Zombie Survival — game code part 14-v468 (game.html lines 7586-7718 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.68: torcia, porte, 2 armi, costruzione a livelli, nebbia notte, fulmini =======================
const M468={on:true,err:0};window.__m468=M468;
function e468(e,w){M468.err++;try{if(window.__DBG)__DBG.prob('warn','m468'+(w||''),String(e&&e.message||e).slice(0,200));}catch(_){}if(M468.err>8)M468.on=false;}
function lsG468(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}}
function lsS468(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
// ---------- 4/8) night fog + gloom ----------
LNIGHT.fog.setHex(0x080b0e);LNIGHT.near=2.5;LNIGHT.far=21;LNIGHT.hemi=.13;LNIGHT.hc.setHex(0x52608a);LNIGHT.sky.setHex(0x0b1018);
LDUSK.near=6;LDUSK.far=40;
// ---------- 1) rain cover grid (buildings + built roofs) ----------
const RC468={g:null,ext:0,n:0};
function rcBuild468(){const C=window.CITY4319;const ext=HALF+4,n=Math.ceil(ext*2);const g=new Uint8Array(n*n);
  if(C&&C.plots)for(const q of C.plots){const x0=Math.max(0,Math.floor(q.x-q.w/2+ext)),x1=Math.min(n-1,Math.floor(q.x+q.w/2+ext)),z0=Math.max(0,Math.floor(q.z-q.d/2+ext)),z1=Math.min(n-1,Math.floor(q.z+q.d/2+ext));for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)g[z*n+x]=1;}
  RC468.g=g;RC468.ext=ext;RC468.n=n;RC468.city=C;}
function covered468(x,z){const R=RC468;if(!R.g||R.city!==window.CITY4319)rcBuild468();const n=R.n,ix=Math.floor(x+R.ext),iz=Math.floor(z+R.ext);if(ix>=0&&iz>=0&&ix<n&&iz<n&&R.g[iz*n+ix])return true;
  for(const p of PIECES){if(!p.alive)continue;const D=PDEF[p.type];if(D.cell!=='r'&&p.type!=='tower')continue;if(Math.abs(x-p.x)<1.05&&Math.abs(z-p.z)<1.05)return true;}return false;}
// rain: re-implement drop recycling with cover culling (same buffers as 4.3.67)
rainTick467=function(dt,play){const R=RAIN467;
  if(play){if(R.on){R.left-=dt;if(R.left<=0){R.on=false;R.next=rand(120,300);}}else{R.next-=dt;if(R.next<=0){R.on=true;R.left=rand(30,90);try{toast('🌧️ Inizia a piovere',1300);}catch(e){}}}}
  const tgt=R.on&&play?1:0;R.k+=(tgt-R.k)*Math.min(1,dt/3.5);if(R.k<.003)R.k=0;
  R.covT-=dt;if(R.covT<=0){R.covT=.3;try{R.cov=snowCovered()||covered468(player.pos.x,player.pos.z);}catch(e){R.cov=false;}}
  if(R.snd!==1){rainSnd467(play?R.k:0);try{if(R.lp468){if(R.lpc!==R.cov){R.lpc=R.cov;R.lp468.frequency.cancelScheduledValues(AU.ctx.currentTime);R.lp468.frequency.setTargetAtTime(R.cov?650:5200,AU.ctx.currentTime,.25);}}else if(R.snd&&R.g){const c=AU.ctx,lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;R.g.disconnect();R.g.connect(lp).connect(AU.master);R.lp468=lp;}}catch(e){}}
  if(!R.k||!play){rain467.visible=false;return;}
  const q=Q467(),n=Math.round((q==='alta'?RN467:q==='media'?650:280)*R.k);rain467.visible=n>8;if(!rain467.visible)return;
  rG467.setDrawRange(0,n*2);rain467.material.opacity=(R.cov?.3:.42)*Math.min(1,R.k*1.4);
  const cx=camera.position.x,cy=camera.position.y,cz=camera.position.z,wx=.9,len=.55;let rs=0;
  for(let i=0;i<n;i++){const j=i*6,v=rS467[i]*15*dt;let x=rP467[j]+wx*dt,y=rP467[j+1]-v,z=rP467[j+2],re=false;
    if(y<cy-2||rP467[j+4]<-50){re=true;y+=14;if(y<cy-2)y=cy+rand(4,12);x=cx+rand(-13,13);z=cz+rand(-13,13);}
    if(x-cx>13){x-=26;re=true;}else if(x-cx<-13){x+=26;re=true;}if(z-cz>13){z-=26;re=true;}else if(z-cz<-13){z+=26;re=true;}
    let hide=false;if(re&&rs<120){rs++;if(covered468(x,z))hide=true;}else if(re)hide=rP467[j+4]<-50;else hide=rP467[j+4]<-50;
    rP467[j]=x;rP467[j+1]=y;rP467[j+2]=z;rP467[j+3]=x-wx*.035;rP467[j+4]=hide?-99:y+len*rS467[i];rP467[j+5]=z;if(hide){rP467[j+1]=-99;}}
  rG467.attributes.position.needsUpdate=true;};
// ---------- 2) torch ----------
const TOR468={on:lsG468('zs_torch468',1)!==0,spot:null,el:null};window.__spot468=false;
const cookie468=ctex43('cookie468',128,128,(g,w,h)=>{const c=w/2;const r=g.createRadialGradient(c,c,0,c,c,c);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,'rgba(255,250,235,1)');r.addColorStop(.32,'rgba(220,210,190,.6)');r.addColorStop(.62,'rgba(150,140,125,.35)');r.addColorStop(.7,'rgba(190,180,160,.45)');r.addColorStop(.76,'rgba(110,100,90,.2)');r.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle=r;g.beginPath();g.arc(c,c,c,0,7);g.fill();});
function torchSpot468(){const q=Q467();const want=q==='alta';if(want&&!TOR468.spot){try{const s=new T.SpotLight(0xfff1d8,0,32,.36,.6,1.25);s.position.set(.18,-.12,0);s.target.position.set(0,0,-10);camera.add(s);camera.add(s.target);
      s.castShadow=true;s.shadow.mapSize.set(512,512);s.shadow.camera.near=.3;s.shadow.camera.far=32;s.shadow.bias=-.0006;try{s.map=cookie468;}catch(e){}TOR468.spot=s;try{gfxCompile43();}catch(e){}}catch(e){e468(e,'spot');TOR468.spot=null;}}
  if(TOR468.spot)TOR468.spot.visible=want;window.__spot468=want&&!!TOR468.spot;flash.position.set(0,.2,want?-.6:-2.4);}
gfxOn43(()=>{try{torchSpot468();}catch(e){}});torchSpot468();
{const _al=applyLight;applyLight=function(){_al();if(!M468.on)return;try{const b=flash.intensity;
  if(!TOR468.on){flash.intensity=0;flash.userData.b466=0;if(TOR468.spot)TOR468.spot.intensity=0;}
  else if(window.__spot468&&TOR468.spot){TOR468.spot.intensity=b*3.2;flash.intensity=b*.28;}
  if(LT468.k>0){hemiL.intensity+=LT468.k*2.6;sun.intensity+=LT468.k*1.2;}}catch(e){e468(e,'al');}};}
function torchSet468(v){TOR468.on=!!v;lsS468('zs_torch468',v?1:0);try{play('ui');}catch(e){}try{if(AU.ctx){const t=AU.ctx.currentTime;osc(t,.04,.12,'square',2400,1800);osc(t+.03,.03,.08,'square',1200,900);}}catch(e){}
  if(TOR468.el)TOR468.el.classList.toggle('off',!TOR468.on);try{applyLight();}catch(e){}try{toast(v?'🔦 Torcia accesa':'🔦 Torcia spenta',700);}catch(e){}}
{const st=document.createElement('style');st.textContent='#torch468{position:absolute;right:max(10px,var(--sar,0px));top:calc(var(--sat,0px) + 46%);width:46px;height:46px;border-radius:50%;border:1.5px solid rgba(255,220,150,.75);background:rgba(10,14,20,.55);color:#fff;font-size:22px;display:none;align-items:center;justify-content:center;z-index:5;pointer-events:auto;touch-action:none}#torch468.off{opacity:.45;border-color:rgba(255,255,255,.3);filter:grayscale(1)}body.playing468 #torch468{display:flex}'+
 '#bag468{position:fixed;inset:0;z-index:900;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)}#bag468.hidden{display:none}#bag468 .c{background:#141a22;border:1px solid rgba(255,210,122,.55);border-radius:14px;max-width:420px;width:92vw;max-height:86vh;overflow:auto;padding:12px;color:#e8eef5;font:600 14px system-ui,sans-serif}#bag468 h3{margin:0 0 6px;color:#ffd27a;font-size:17px}#bag468 .r{display:flex;align-items:center;gap:8px;padding:8px;border-top:1px solid rgba(255,255,255,.08)}#bag468 .r span{flex:1}#bag468 small{color:#9aa6b4}#bag468 button{padding:9px 10px;border-radius:9px;border:0;background:#2e3a48;color:#fff;font:800 13px system-ui}#bag468 button.p{background:#d9922a;color:#111}';document.head.appendChild(st);
 const b=document.createElement('button');b.id='torch468';b.type='button';b.textContent='🔦';b.setAttribute('aria-label','Torcia');if(!TOR468.on)b.classList.add('off');
 const stop=e=>{e.stopPropagation();};b.addEventListener('touchstart',e=>{stop(e);if(e.cancelable)e.preventDefault();torchSet468(!TOR468.on);},{passive:false});b.addEventListener('mousedown',stop);b.addEventListener('click',e=>{stop(e);if(!isTouch)torchSet468(!TOR468.on);});
 (document.getElementById('hud')||document.body).appendChild(b);TOR468.el=b;}
addEventListener('keydown',e=>{if(e.code==='KeyF'&&game.state==='play'&&!e.repeat){torchSet468(!TOR468.on);}});
// ---------- 9) lightning ----------
const LT468={k:0,next:15,bolt:null,ov:null};
{const N=14,pos=new Float32Array(N*3),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));const l=new T.Line(g,new T.LineBasicMaterial({color:0xe8f0ff,transparent:true,opacity:0,fog:false,depthWrite:false}));l.frustumCulled=false;l.visible=false;scene.add(l);LT468.bolt=l;LT468.bp=pos;
 const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2;background:#dfe8ff;opacity:0';document.body.appendChild(o);LT468.ov=o;}
function strike468(){const a=Math.random()*6.283,d=rand(70,130),x=camera.position.x+Math.cos(a)*d,z=camera.position.z+Math.sin(a)*d,P=LT468.bp;let px=x,pz=z;
  for(let i=0;i<14;i++){const y=60-i*(60/13);P[i*3]=px;P[i*3+1]=y;P[i*3+2]=pz;px+=rand(-3,3);pz+=rand(-3,3);}LT468.bolt.geometry.attributes.position.needsUpdate=true;
  LT468.k=1;LT468.bt=.16;LT468.bolt.visible=true;LT468.bolt.material.opacity=1;
  try{const c=AU.ctx;if(c&&!SET.mute){const km=rand(.6,3),t0=c.currentTime+km*2.9,v=.32/Math.sqrt(km);nz(t0,.35,v,'lowpass',900,300);nz(t0+.08,2.6,v*.9,'lowpass',260,60,1);nz(t0+.5,1.8,v*.6,'lowpass',180,50);}}catch(e){}}
function lightTick468(dt){if(LT468.k>0){LT468.k=Math.max(0,LT468.k-dt*(LT468.k>.5?7:3));if(Math.random()<dt*8&&LT468.k<.5&&LT468.k>.2)LT468.k=.7;}
  {const ov=LT468.k>0?(LT468.k*.28).toFixed(3):'0';if(ov!==LT468.ovs){LT468.ovs=ov;LT468.ov.style.opacity=ov;}}
  if(LT468.bolt.visible){LT468.bt-=dt;LT468.bolt.material.opacity=Math.max(0,LT468.bt/.16);if(LT468.bt<=0)LT468.bolt.visible=false;}
  if(RAIN467.k>.6){LT468.next-=dt;if(LT468.next<=0){LT468.next=rand(12,35);strike468();}}else if(LT468.next<6)LT468.next=rand(8,20);}
// ---------- 8) ambient wind + distant groans ----------
const AMB468={w:null,g:null,next:10};
function ambTick468(dt,play){try{const c=AU.ctx;if(!c||!AU.noise||!AU.master)return;if(!AMB468.w){const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;s.playbackRate.value=.5;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=420;f.Q.value=1.4;const g=c.createGain();g.gain.value=0;s.connect(f).connect(g).connect(AU.master);s.start();AMB468.w=s;AMB468.f=f;AMB468.g=g;}
  const nf=nightF(),t=c.currentTime,v=SET.mute||!play?0:(.018+.03*nf)*(.6+.4*Math.sin(t*.13)*Math.sin(t*.07+1));AMB468.g.gain.setTargetAtTime(Math.max(0,v),t,.8);AMB468.f.frequency.setTargetAtTime(300+180*Math.sin(t*.11),t,1);
  if(play&&!SET.mute){AMB468.next-=dt;if(AMB468.next<=0){AMB468.next=rand(9,24)*(nf>.5?.7:1.3);const f0=rand(85,140),d=rand(1.2,2.2),dest=AU.revIn||AU.master;osc(t,d,.05+.04*nf,'sawtooth',f0,f0*.62,dest,.3);nz(t,d*.8,.03,'bandpass',f0*3,f0*2,4,dest);}}}catch(e){e468(e,'amb');AMB468.w=AMB468.w||1;}}
// ---------- 3) doors & gates fit the wall slot ----------
PDEF.door.parts=[['wood',-.93,1.315,0,.16,2.63,.34],['wood',.93,1.315,0,.16,2.63,.34],['wood',0,2.5,0,2.02,.26,.34],['stone',0,.04,0,2,.08,.36]];
PDEF.door.panel=[['plank',.83,1.19,0,1.68,2.34,.12],['wood',.83,.6,.07,1.5,.1,.04],['wood',.83,1.75,.07,1.5,.1,.04],['metal',1.45,1.15,.1,.06,.16,.06]];
PDEF.gate.parts=[['metal',-.93,1.315,0,.16,2.63,.18],['metal',.93,1.315,0,.16,2.63,.18],['metal',0,2.5,0,2.02,.26,.18],['dark',0,.06,0,2,.12,.36]];
PDEF.gate.panel=[['metal',.83,1.18,0,1.68,2.3,.06],['metal',.83,.55,.05,1.6,.07,.03],['metal',.83,1.15,.05,1.6,.07,.03],['metal',.83,1.75,.05,1.6,.07,.03],['haz',1.5,1.15,.07,.1,.18,.05]];
const DOORISH468=new Set(['door','gate','window','shutter','slit']),WALLISH468=new Set(['wall','window','shutter','slit','rwall','fence']);
function slotOcc468(type,s){if(!DOORISH468.has(type))return null;const key=pieceKey(type,s.x,s.z,s.rot);return PIECES.find(p=>p.alive&&p.key===key&&p.type!==type&&WALLISH468.has(p.type))||null;}
{const _pc=placeCheck;placeCheck=function(type,s){let o=null;try{o=M468.on?slotOcc468(type,s):null;}catch(e){}if(!o)return _pc(type,s);o.alive=false;let m;try{m=_pc(type,s);}finally{o.alive=true;}return m;};}
{const _pb=placeBuild;placeBuild=function(){try{if(M468.on&&SV.build&&DOORISH468.has(SV.build)){const s=build434Target(),o=slotOcc468(SV.build,s);if(o&&!placeCheck(SV.build,s)){const D=PDEF[o.type];removePiece(o,true);for(const k in D.cost)addRes(k,D.cost[k],true);toast('🚪 '+PDEF[SV.build].n+' inserita nel muro',1000);}}}catch(e){e468(e,'door');}return _pb();};}
// ---------- 7) more buildables + level ordering ----------
Object.assign(PDEF,{
 rwall:{n:'Muro rinforzato',i:'🛡️',cost:{stone:4,iron:2,wood:2},hp:720,edge:1,box:[2,.4],lv:4,parts:[['stone',0,.3,0,2,.6,.4],['stone',0,1.45,0,1.96,1.7,.34],['metal',-.94,1.315,0,.14,2.63,.38],['metal',.94,1.315,0,.14,2.63,.38],['metal',0,2.56,0,2.04,.14,.38],['metal',0,1.0,.19,1.9,.08,.03],['metal',0,1.9,.19,1.9,.08,.03]]},
 slit:{n:'Muro con feritoia',i:'🔭',cost:{wood:4,stone:2},hp:300,edge:1,box:[2,.34],lv:3,parts:[['stone',0,.25,0,2,.5,.34],['plank',0,.9,0,1.96,.8,.24],['plank',0,2.06,0,1.96,.88,.24],['plank',-.62,1.43,0,.72,.26,.24],['plank',.62,1.43,0,.72,.26,.24],['wood',-.94,1.3,0,.16,2.6,.32],['wood',.94,1.3,0,.16,2.6,.32],['wood',0,2.56,0,2.04,.14,.32],['metal',0,1.29,0,.5,.03,.3]]},
 trap:{n:'Tagliola',i:'🪤',cost:{metal:2,iron:1},hp:160,cell:'o',floor43:1,lv:3,parts:[['dark',0,.025,0,.9,.04,.9],['metal',0,.08,-.32,.8,.06,.06],['metal',0,.08,.32,.8,.06,.06],['metal',-.32,.1,0,.06,.1,.6],['metal',.32,.1,0,.06,.1,.6],['haz',0,.06,0,.2,.03,.2]]},
 palisade:{n:'Palizzata appuntita',i:'🪓',cost:{wood:6,iron:1},hp:420,edge:1,box:[2,.5],spike:1,lv:5,parts:[]}});
for(let i=0;i<7;i++){const x=-.86+i*.287;PDEF.palisade.parts.push(['wood',x,.85,0,.2,1.7,.2],['wood',x,1.82,0,.12,.3,.12,0,.785,0]);}PDEF.palisade.parts.push(['plank',0,.55,.13,2,.14,.05],['plank',0,1.3,.13,2,.14,.05]);
{const LV={shutter:2,sand:2,pillar:2,post:2,spikes:2,bench:3,gate:3,wire:3,tower:4,gen:5,flood:5,mine:6,efence:7,turret:8};for(const k in LV)if(PDEF[k])PDEF[k].lv=LV[k];}
try{PORDER.push('rwall','slit','trap','palisade');const mu=BCAT43.find(c=>c[0]==='muri'),di=BCAT43.find(c=>c[0]==='difesa');if(mu)mu[2].push('slit','rwall');if(di)di[2].push('trap','palisade');
  for(const c of BCAT43){const L=c[2];const o=L.map((k,i)=>[k,i]);o.sort((a,b)=>((PDEF[a[0]]&&PDEF[a[0]].lv)||1)-((PDEF[b[0]]&&PDEF[b[0]].lv)||1)||a[1]-b[1]);for(let i=0;i<o.length;i++)L[i]=o[i][0];}}catch(e){e468(e,'bcat');}
// ---------- 5/6) tools always, 2 firearm slots + backpack ----------
const SL468={s:[],k:[],ready:false};
const isGun468=w=>!!(w&&!w.melee&&!w.tool&&w.mag);
function slSave468(){lsS468(cityStorageKey?cityStorageKey('zs_slots468'):'zs_slots468',{s:SL468.s,k:SL468.k});}
function slInit468(){if(SL468.ready)return;SL468.ready=true;const key=(typeof cityStorageKey==='function')?cityStorageKey('zs_slots468'):'zs_slots468';const d=lsG468(key,null);
  const owned=WEAPONS.filter(w=>isGun468(w)&&own[w.id]).map(w=>w.id);
  if(d&&Array.isArray(d.s)){SL468.s=d.s.filter(id=>owned.includes(id)).slice(0,2);SL468.k=Array.isArray(d.k)?d.k.slice():owned.slice();}
  else{const cur=WEAPONS[curW];const s=[];if(isGun468(cur)&&own[cur.id])s.push(cur.id);const rest=owned.filter(id=>!s.includes(id)).sort((a,b)=>{const A=WEAPONS.find(w=>w.id===a),B=WEAPONS.find(w=>w.id===b);return (B.dmg*(B.pellets||1)/B.rate)-(A.dmg*(A.pellets||1)/A.rate);});while(s.length<2&&rest.length)s.push(rest.shift());SL468.s=s;SL468.k=owned.slice();}
  for(const id of owned)if(!SL468.k.includes(id))SL468.k.push(id);slSave468();}
function slReconcile468(){const owned=WEAPONS.filter(w=>isGun468(w)&&own[w.id]).map(w=>w.id);let ch=false;
  SL468.s=SL468.s.filter(id=>{const ok=owned.includes(id);if(!ok)ch=true;return ok;});
  for(const id of owned)if(!SL468.k.includes(id)){SL468.k.push(id);ch=true;const w=WEAPONS.find(q=>q.id===id);if(SL468.s.length<2){SL468.s.push(id);}else{try{toast('🎒 '+w.name+' nello zaino (hai già 2 armi)',1600);}catch(e){}}}
  if(SV.on){for(const t of ['axe','pick'])if(!own[t]){own[t]=true;ch=true;}}
  if(ch){slSave468();try{hbSig='';renderWBar();}catch(e){}}}
function slPut468(id,idx){if(!SL468.s.includes(id)){if(SL468.s.length<2)SL468.s.push(id);else SL468.s[idx|0]=id;}if(!SL468.k.includes(id))SL468.k.push(id);slSave468();try{hbSig='';renderWBar();}catch(e){}}
const arenaOn468=()=>{try{return !!(ARENA454&&(ARENA454.on||ARENA454.preview));}catch(e){return false;}};
{const _ol=ownedList;ownedList=function(){const L=_ol();if(!M468.on||arenaOn468()||!SL468.ready)return L;try{const out=[];for(const i of L){const w=WEAPONS[i];if(isGun468(w)&&!SL468.s.includes(w.id))continue;out.push(i);}
  if(SV.on)for(const t of ['axe','pick']){const i=WEAPONS.findIndex(w=>w.id===t);if(i>=0&&!out.includes(i)&&own[t])out.push(i);}return out;}catch(e){e468(e,'ol');return L;}};}
{const _eq=equip;equip=function(i,silent){try{const w=WEAPONS[i];if(M468.on&&SL468.ready&&!arenaOn468()&&isGun468(w)&&own[w.id]&&!SL468.s.includes(w.id)){if(SL468.s.length<2)slPut468(w.id,SL468.s.length);else{if(!silent)try{toast('🎒 '+w.name+' è nello zaino: aprilo per cambiarla',1500);}catch(e){}if(curW>=0&&WEAPONS[curW]&&own[WEAPONS[curW].id])return false;}}}catch(e){e468(e,'eq');}return _eq(i,silent);};}
{const _nw=nextWeapon;nextWeapon=function(){if(!M468.on||arenaOn468()||!SL468.ready)return _nw();try{const L=ownedList();if(!L.length)return;const k=L.indexOf(curW),n=L[(k+1)%L.length];if(n!==curW){equip(n);toast(WEAPONS[n].name,700);}}catch(e){e468(e,'nw');return _nw();}};}
{const _wa=wcAct467;wcAct467=function(swap){try{const w=WC467.w;if(w&&M468.on){if(!SL468.k.includes(w.id))SL468.k.push(w.id);
   if(swap){const cur=WEAPONS[curW];let idx=SL468.s.indexOf(cur&&cur.id);if(idx<0)idx=SL468.s.length<2?SL468.s.length:0;own[w.id]=true;slPut468(w.id,idx);}
   else{slSave468();}}}catch(e){e468(e,'wc');}return _wa(swap);};}
// backpack panel
const BG468={el:null,open:false,pick:null};
function bagOpen468(){if(game.state!=='play')return;BG468.open=true;BG468.pick=null;game.state='bag468';firing=false;try{resetTouchState();}catch(e){}if(document.pointerLockElement)document.exitPointerLock();bagRender468();}
function bagRender468(){if(!BG468.el){const e=document.createElement('div');e.id='bag468';e.className='hidden';document.body.appendChild(e);BG468.el=e;e.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const a=b.dataset.a;
   if(a==='close')bagClose468();else if(a==='pick'){BG468.pick=b.dataset.id;bagRender468();}else if(a==='put'){const id=BG468.pick;slPut468(id,+b.dataset.i);const i=WEAPONS.findIndex(w=>w.id===id);try{equip(i,true);}catch(e){}try{play('pickup',2);}catch(e){}try{svSave();}catch(e){}bagClose468();}else if(a==='back'){BG468.pick=null;bagRender468();}});}
  const nm=id=>{const w=WEAPONS.find(q=>q.id===id);return w?esc(w.name):id;};let h='<div class="c"><h3>🔫 Zaino armi</h3><small>Puoi portare 2 armi da fuoco. Ascia e piccone sono sempre con te.</small>';
  if(!BG468.pick){const bag=WEAPONS.filter(w=>isGun468(w)&&own[w.id]&&!SL468.s.includes(w.id));h+='<div class="r"><span>In mano: <b>'+(SL468.s.map(nm).join(' · ')||'nessuna')+'</b></span></div>';
    h+=bag.length?bag.map(w=>{const s=wcStats467(w);return '<div class="r"><span><b>'+esc(w.name)+'</b><br><small>Danno '+s[0]+' · '+s[1]+' colpi/s · precisione '+s[2]+' · caricatore '+s[3]+' · riserva '+(res[w.id]|0)+'</small></span><button class="p" data-a="pick" data-id="'+w.id+'">Prendi</button></div>';}).join(''):'<div class="r"><span><small>Nessuna arma nello zaino</small></span></div>';
    h+='<div class="r"><span></span><button data-a="close">Chiudi</button></div>';}
  else{h+='<div class="r"><span>Prendi <b>'+nm(BG468.pick)+'</b> al posto di:</span></div>';const S=SL468.s.length<2?SL468.s.concat(['']):SL468.s;
    h+=S.map((id,i)=>'<div class="r"><span>'+(id?nm(id):'Posto libero')+'</span><button class="p" data-a="put" data-i="'+i+'">'+(id?'Sostituisci':'Metti qui')+'</button></div>').join('')+'<div class="r"><span></span><button data-a="back">Indietro</button></div>';}
  BG468.el.innerHTML=h+'</div>';BG468.el.classList.remove('hidden');}
function bagClose468(){BG468.open=false;BG468.pick=null;if(BG468.el)BG468.el.classList.add('hidden');if(game.state==='bag468'){game.state='play';last=performance.now();if(!isTouch)try{lockPointer();}catch(e){}}try{updateHUD();}catch(e){}}
{const _rw=renderWBar;renderWBar=function(){_rw();try{if(!M468.on||arenaOn468()||!SV.on)return;const wb=$('wbar');if(wb&&!wb.querySelector('[data-a="bag468"]')){const d=document.createElement('div');d.className='ws act';d.dataset.a='bag468';d.innerHTML='<b class="te">🔫</b><small>Armi</small>';wb.appendChild(d);}}catch(e){e468(e,'wb');}};}
{const wb=$('wbar');if(wb){let tT=0;const h=e=>{const s=e.target.closest&&e.target.closest('[data-a="bag468"]');if(!s)return;e.stopPropagation();if(e.cancelable)e.preventDefault();const n=performance.now();if(n-tT<400)return;tT=n;bagOpen468();};for(const ev of ['touchstart','mousedown','click','pointerdown'])wb.addEventListener(ev,h,{capture:true,passive:false});}}
{const _bk=window.__zsBack;window.__zsBack=function(){if(BG468.open){bagClose468();return true;}return _bk?_bk():false;};}
addEventListener('keydown',e=>{if(game.state==='play'&&e.code==='KeyB'&&!e.repeat&&SV.on&&!arenaOn468()&&!SV.build){/* B used elsewhere? only open with Shift+B */}if(BG468.open&&e.code==='Escape'){e.preventDefault();bagClose468();}});
// ---------- per-frame ----------
{const _l0=loop0;let l8=0,rT=0;loop0=function(now){try{if(M468.on){const dt=l8?Math.min(.1,(now-l8)/1000):0;l8=now;const pl=game.state==='play';const play=pl&&SV.on&&!arenaOn468();
  document.body.classList.toggle('playing468',pl&&!arenaOn468());
  if(play){if(!SL468.ready)slInit468();rT-=dt;if(rT<=0){rT=.5;slReconcile468();}}
  if(BG468.open&&game.state==='play')game.state='bag468';
  lightTick468(dt);ambTick468(dt,play);}}catch(e){e468(e,'tick');}return _l0(now);};}
window.__zs468={torch:v=>{torchSet468(v);return {on:TOR468.on,saved:lsG468('zs_torch468',1),spot:window.__spot468,fi:flash.intensity};},covered:(x,z)=>covered468(x,z),SL:SL468,init:()=>{SL468.ready=false;slInit468();return SL468;},rec:()=>{slReconcile468();return SL468;},put:(id,i)=>slPut468(id,i),bag:()=>{bagOpen468();return game.state;},bagClose:()=>bagClose468(),strike:()=>{strike468();return LT468.k;},lt:()=>LT468.k,ol:()=>ownedList().map(i=>WEAPONS[i].id),get m(){return M468;}};
