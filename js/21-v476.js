'use strict';
// ======================= v4.3.76: risorse dirette nello zaino, pioggia mai dentro, zombie in più + Ghigno Rosso (5 💎), urla, luna con fasi, Halloween, arena più grande / mira / sangue / armi visibili =======================
const M476={on:true,err:0};function e476(e,w){M476.err++;try{console.warn('476',w,e&&e.message);}catch(_){}try{window.__DBG&&__DBG.prob('err','v476',w+': '+(e&&e.message||e));}catch(_){}if(M476.err>60)M476.on=false;}
const W476={cem:null,park:null};
const MOON476={ph:null,spr:null,halo:null,halo2:null,tex:null,day:'',dir:null,lastPh:''};// filled by js/22 (cemetery / park centres)
function q476(){try{return GQ();}catch(e){return 'media';}}
function lv476(){const q=q476();return q==='alta'?2:q==='bassa'?0:1;}
function svPlay476(){try{return game.state==='play'&&SV.on&&!arenaOn468();}catch(e){return false;}}

// ---------- 1) ground resources go straight into the backpack; full bag = one short message, never a prompt ----------
{const _c=_collect452;let lastT=0;collect=function(p){try{if(M476.on&&SV.on&&p&&p.active&&bagCount()>=bagCap()){const n=performance.now();if(n-lastT>2600){lastT=n;toast('🎒 Zaino pieno: non c\'è spazio',1300);}return;}}catch(e){e476(e,'collect');}return _c(p);};}

// ---------- 2) rain never inside buildings: per-frame drop test against the buildings around the camera ----------
const IN476={near:[],t:0,inside:false,all:null,city:null};
function rects476(){const out=[];try{const C=window.CITY4319;if(C&&C.plots)for(const q of C.plots)out.push([q.x-q.w/2,q.x+q.w/2,q.z-q.d/2,q.z+q.d/2]);for(const h of HOUSE_RECTS)out.push([h[0]-h[2],h[0]+h[2],h[1]-h[3],h[1]+h[3]]);}catch(e){e476(e,'rects');}IN476.city=window.CITY4319;return out;}
function inTick476(){const I=IN476;if(!I.all||I.city!==window.CITY4319)I.all=rects476();const cx=camera.position.x,cz=camera.position.z,R=17;I.near.length=0;
  for(const r of I.all){if(r[1]<cx-R||r[0]>cx+R||r[3]<cz-R||r[2]>cz+R)continue;I.near.push(r);}
  try{for(const p of PIECES){if(!p.alive)continue;const D=PDEF[p.type];if(!D||(D.cell!=='r'&&p.type!=='tower'))continue;if(Math.abs(p.x-cx)>R||Math.abs(p.z-cz)>R)continue;I.near.push([p.x-1.05,p.x+1.05,p.z-1.05,p.z+1.05]);}}catch(e){}
  const px=player.pos.x,pz=player.pos.z;let ins=false;for(const r of I.near)if(px>r[0]+.05&&px<r[1]-.05&&pz>r[2]+.05&&pz<r[3]-.05){ins=true;break;}I.inside=ins;}
{const _rt=rainTick467;rainTick467=function(dt,play){_rt(dt,play);if(!M476.on)return;try{const I=IN476;I.t-=dt;if(I.t<=0){I.t=.2;inTick476();}
    const R=RAIN467;if(I.inside)R.cov=true;
    if(!rain467.visible||!I.near.length)return;const n=Math.min(RN467,(rG467.drawRange.count/2)|0),N=I.near,m=.35;let ch=false;
    for(let i=0;i<n;i++){const j=i*6;if(rP467[j+4]<-50)continue;const x=rP467[j],z=rP467[j+2];
      for(let k=0;k<N.length;k++){const r=N[k];if(x>r[0]-m&&x<r[1]+m&&z>r[2]-m&&z<r[3]+m){rP467[j+1]=-99;rP467[j+4]=-99;ch=true;break;}}}
    if(ch)rG467.attributes.position.needsUpdate=true;}catch(e){e476(e,'rain');}};}
{const _rs=rainSnd467;rainSnd467=function(k){try{if(M476.on&&IN476.inside)k*=.32;}catch(e){}return _rs(k);};}

// ---------- 3) more zombies over the whole map, more at the cemetery; rare Ghigno Rosso ----------
const Z476={mul:[1.15,1.3,1.45],next:150+Math.random()*120,t:0,gig:0,cnt:0};
{const _mx=svMaxAlive;svMaxAlive=function(){const b=_mx();try{if(!M476.on||(ARENA454&&ARENA454.on))return b;let n=b*Z476.mul[lv476()];
  const mo=MOON476.ph;if(mo&&SV.phase==='night')n*=1+.15*mo.illum*mo.illum;
  const C=W476.cem;if(C&&Math.hypot(player.pos.x-C.x,player.pos.z-C.z)<C.r+45)n+=lv476()?4:2;return Math.round(n);}catch(e){e476(e,'max');return b;}};}
function spawnAt476(v,sp){SPAWN_AT=sp;const ok=spawnZombie(v);SPAWN_AT=null;if(!ok)return null;const z=LAST_Z;z.flee=0;z.tgtPiece=null;z.burn=0;z.retT=0;z.ai=null;z.wx=undefined;if(v!=='ghigno'&&(SV.phase==='day'||SV.phase==='dawn'))z.speed*=.68;return z;}
{const _sp=svSpawn;svSpawn=function(v,nearBase){try{const C=W476.cem;if(M476.on&&C&&v!=='boss'&&!nearBase){const near=Math.hypot(player.pos.x-C.x,player.pos.z-C.z)<C.r+70;
  if(Math.random()<(near?.34:.1)){const b=baseCenter();const q=svSpawnPos(1,C.r*.8,C.x,C.z);if(q&&(!b||Math.hypot(q.x-b.x,q.z-b.z)>26)){const z=spawnAt476(v,q);if(z){try{_tmp.set(q.x,.2,q.z);emit(_tmp,_up,10,[0x3a2a1a,0x5a4430,0x1a120a],{speed:2.4,spread:1,life:.7,size:.07,grav:7});}catch(e){}return true;}}}}}catch(e){e476(e,'spawn');}return _sp(v,nearBase);};}
{const _sz=spawnZombie;spawnZombie=function(v){const ok=_sz(v);try{if(ok&&LAST_Z&&LAST_Z.V&&LAST_Z.V.name==='ghigno'){LAST_Z.gem476=0;LAST_Z.gig476=1+Math.random()*2;}}catch(e){}return ok;};}
function ghignoAlive476(){for(const z of zombies)if(z.alive&&!z.dead&&z.V.name==='ghigno')return z;return null;}
function ghignoTry476(){if(ghignoAlive476())return false;let sp=null;for(let t=0;t<8&&!sp;t++)sp=svSpawnPos(30,62,player.pos.x,player.pos.z);if(!sp)return false;const z=spawnAt476('ghigno',sp);if(!z)return false;
  Z476.cnt++;try{banner('🎩 IL GHIGNO ROSSO','Qualcosa ride nel buio · abbattilo: vale 5 💎','danger',2300);}catch(e){}try{giggle476(z,1);}catch(e){}return true;}
function ghignoTick476(dt){Z476.next-=dt;if(Z476.next>0)return;Z476.next=rand(120,240);if(SV.phase==='dawn')return;if(Math.random()<(SV.phase==='night'?.42:.3))ghignoTry476();}
{const _kz=killZombie;killZombie=function(z,dir,d,head){const r=_kz.apply(this,arguments);try{if(z&&z.V&&z.V.name==='ghigno'&&!z.gem476){z.gem476=1;addGems(5);try{banner('GHIGNO ROSSO ABBATTUTO','+5 💎 diamanti','',2300);}catch(e){}try{play('kill',true);}catch(e){}
  try{_tmp.copy(z.g.position);_tmp.y=1.2;emit(_tmp,_up,26,[0x8a0c12,0xff2a2a,0x111111,0xffd040],{speed:4,spread:1,life:.8,size:.08,grav:6});}catch(e){}}}catch(e){e476(e,'kill');}return r;};}

// ---------- 4) screams: many voices, positioned on real zombies or far away, distance falloff, never the same twice in a row ----------
const SC476={hist:[],next:30+Math.random()*30};
const SCV476={
  shriek:{f:[620,900],form:[[1050,5],[2700,7]],dur:[1.1,1.9],vib:[6,9],vd:.045,shape:'up'},
  yell:{f:[240,360],form:[[700,4],[1750,6]],dur:[.8,1.4],vib:[4,6],vd:.03,shape:'arch',rough:1},
  wail:{f:[420,560],form:[[900,4],[2300,6]],dur:[2.2,3.2],vib:[3.5,5.5],vd:.06,shape:'down'},
  howl:{f:[170,250],form:[[620,3],[1500,5]],dur:[1.2,2],vib:[9,14],vd:.08,shape:'arch',rough:1,noise:1},
  sob:{f:[380,500],form:[[850,5],[2100,7]],dur:[1.6,2.3],vib:[5,7],vd:.03,shape:'pulse'},
  child:{f:[780,1050],form:[[1300,6],[3000,8]],dur:[.9,1.5],vib:[7,10],vd:.05,shape:'arch'}};
function voice476(kind,dist,pan,volMul){const c=AU.ctx;if(!c||SET.mute||!AU.master||(AU.v433|0)>=15)return false;const P=SCV476[kind];if(!P)return false;
  const t=c.currentTime+.02,d=rand(P.dur[0],P.dur[1]),f0=rand(P.f[0],P.f[1]);
  const o=c.createOscillator();o.type='sawtooth';const fq=o.frequency;fq.setValueAtTime(f0*.85,t);
  if(P.shape==='up'){fq.linearRampToValueAtTime(f0*rand(1.25,1.5),t+d*.3);fq.linearRampToValueAtTime(f0*rand(1.05,1.2),t+d*.75);fq.exponentialRampToValueAtTime(f0*.6,t+d);}
  else if(P.shape==='down'){fq.linearRampToValueAtTime(f0*1.12,t+d*.15);fq.exponentialRampToValueAtTime(f0*.5,t+d);}
  else if(P.shape==='pulse'){for(let i=0;i<4;i++){const a=t+d*i/4;fq.setValueAtTime(f0*(1.1-i*.06),a);fq.exponentialRampToValueAtTime(f0*(.82-i*.05),a+d/4.4);}}
  else{fq.linearRampToValueAtTime(f0*rand(1.15,1.35),t+d*.35);fq.exponentialRampToValueAtTime(f0*rand(.55,.75),t+d);}
  const lfo=c.createOscillator();lfo.frequency.value=rand(P.vib[0],P.vib[1]);const lg=c.createGain();lg.gain.value=f0*P.vd;lfo.connect(lg).connect(fq);
  const mix=c.createGain();mix.gain.value=1;for(const [ff,q] of P.form){const b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=ff*rand(.92,1.08);b.Q.value=q;o.connect(b).connect(mix);}
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.max(650,7000/(1+dist/22));
  const fall=1/(1+Math.pow(dist/16,1.35)),v=Math.min(.2,.16*fall*(volMul||1));if(v<.004){return false;}
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.09);
  if(P.shape==='pulse'){for(let i=1;i<4;i++){const a=t+d*i/4;g.gain.setValueAtTime(v*.25,a-.03);g.gain.linearRampToValueAtTime(v*(1-i*.15),a+.04);}}
  g.gain.setValueAtTime(v*.9,t+d*.72);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  mix.connect(lp).connect(g);let outN=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1)*.9;g.connect(p);outN=p;}
  const wet=clamp(dist/70,.2,.85);if(AU.revIn){const wg=c.createGain();wg.gain.value=wet;outN.connect(wg).connect(AU.revIn);const dg=c.createGain();dg.gain.value=1-wet*.7;outN.connect(dg).connect(AU.master);}else outN.connect(AU.master);
  AU.v433=(AU.v433|0)+1;o.onended=()=>{AU.v433--;try{mix.disconnect();g.disconnect();}catch(e){}};o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);
  if(P.rough||P.noise){try{nz(t,d*.7,.035*fall*(P.noise?1.4:1),'bandpass',P.noise?900:1700,P.noise?500:1200,1.2,outN);}catch(e){}}return true;}
function scream476(){const c=AU.ctx;if(!c||SET.mute)return false;const keys=Object.keys(SCV476).filter(k=>SC476.hist.indexOf(k)<0);const kind=keys[(Math.random()*keys.length)|0]||'yell';
  let dx,dz,d;const zs=zombies.filter(z=>z.alive&&!z.dead&&z.g.visible!==false);const pz=zs.length&&Math.random()<.65?zs[(Math.random()*zs.length)|0]:null;
  const kz=pz&&(kind==='howl'||kind==='yell'||Math.random()<.5)?pz:null;
  if(kz){dx=kz.g.position.x-camera.position.x;dz=kz.g.position.z-camera.position.z;d=Math.hypot(dx,dz);if(d<6||d>90){const a=Math.random()*6.28;d=rand(35,120);dx=Math.cos(a)*d;dz=Math.sin(a)*d;}}
  else{const a=Math.random()*6.28;d=rand(35,130);dx=Math.cos(a)*d;dz=Math.sin(a)*d;}
  const rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw),pan=(dx*rx+dz*rz)/(d+.1);
  const ok=voice476(kind,d,pan,kind==='howl'?1.3:1);if(ok){SC476.hist.push(kind);if(SC476.hist.length>2)SC476.hist.shift();}return ok;}
function giggle476(z,loud){const c=AU.ctx;if(!c||SET.mute||!AU.master||(AU.v433|0)>=15||!z)return;const dx=z.g.position.x-camera.position.x,dz=z.g.position.z-camera.position.z,d=Math.hypot(dx,dz);if(d>45&&!loud)return;
  const rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw),pan=(dx*rx+dz*rz)/(d+.1);const fall=loud?Math.max(.35,1/(1+d/18)):1/(1+Math.pow(d/12,1.3));const t0=c.currentTime+.02,n=4+((Math.random()*3)|0),base=rand(190,240);
  const dest=c.createStereoPanner?c.createStereoPanner():null;if(dest){dest.pan.value=clamp(pan,-1,1)*.85;dest.connect(AU.revIn||AU.master);if(AU.revIn)dest.connect(AU.master);}
  for(let i=0;i<n;i++){const t=t0+i*rand(.13,.17),f=base*(1+.08*Math.sin(i*1.7))*(1-i*.03);const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*1.25,t);o.frequency.exponentialRampToValueAtTime(f*.8,t+.11);
    const b1=c.createBiquadFilter();b1.type='bandpass';b1.frequency.value=780;b1.Q.value=5;const b2=c.createBiquadFilter();b2.type='bandpass';b2.frequency.value=1250;b2.Q.value=6;const g=c.createGain();const v=.13*fall;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.002,v),t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.12);const m=c.createGain();o.connect(b1).connect(m);o.connect(b2).connect(m);m.connect(g).connect(dest||AU.master);
    AU.v433=(AU.v433|0)+1;o.onended=()=>{AU.v433--;try{m.disconnect();g.disconnect();}catch(e){}};o.start(t);o.stop(t+.14);}}
scream469=function(){try{return scream476();}catch(e){e476(e,'scr');return false;}};
scrTick469=function(dt,play){if(!play)return;SCR469.next-=dt;if(SCR469.next>0)return;const p=SV.phase;SCR469.next=p==='night'?rand(14,34):p==='dusk'?rand(28,55):rand(60,140);try{scream469();}catch(e){e469(e,'scr');}};
function zTick476(dt){for(const z of zombies){if(!z.alive||z.dead||z.V.name!=='ghigno')continue;z.gig476=(z.gig476||3)-dt;if(z.gig476<=0){z.gig476=rand(4.5,8.5);try{giggle476(z,false);}catch(e){}}}}

// ---------- 5) the moon: real phase from today's date, macabre halo, moonlight strength follows the phase ----------
function moonPhase476(d){const P=29.530588853,ref=Date.UTC(2000,0,6,18,14)/864e5;let age=(d.getTime()/864e5-ref)%P;if(age<0)age+=P;const th=age/P*Math.PI*2;
  const names=['Luna nuova','Luna crescente','Primo quarto','Gibbosa crescente','Luna piena','Gibbosa calante','Ultimo quarto','Luna calante'],ic=['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];const i=Math.floor((age/P)*8+.5)%8;
  return {age:age,th:th,illum:(1-Math.cos(th))/2,wax:age<P/2,name:names[i],icon:ic[i]};}
function moonTex476(ph){const S=128,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');let s=9176;const r=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  g.fillStyle='#ece3cc';g.beginPath();g.arc(64,64,60,0,7);g.fill();
  for(let i=0;i<9;i++){g.fillStyle='rgba(120,110,96,'+(.18+r()*.2)+')';g.beginPath();g.ellipse(30+r()*68,30+r()*68,8+r()*16,6+r()*12,r()*3,0,7);g.fill();}
  for(let i=0;i<26;i++){const x=14+r()*100,y=14+r()*100,R=1.5+r()*4.5;g.fillStyle='rgba(90,80,70,.28)';g.beginPath();g.arc(x,y,R,0,7);g.fill();g.fillStyle='rgba(255,250,236,.25)';g.beginPath();g.arc(x-R*.3,y-R*.3,R*.55,0,7);g.fill();}
  const im=g.getImageData(0,0,S,S),D=im.data,c=Math.cos(ph.th);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const nx=(x+.5-64)/60,ny=(y+.5-64)/60,r2=nx*nx+ny*ny,k=(y*S+x)*4;if(r2>1.04){D[k+3]=0;continue;}
    const w=Math.sqrt(Math.max(0,1-ny*ny)),xt=ph.wax?w*c:-w*c,e=ph.wax?(nx-xt):(xt-nx);const lit=Math.max(0,Math.min(1,e/.07+.5));
    const limb=.78+.22*Math.sqrt(Math.max(0,1-r2)),b=(.075+.925*lit)*limb;D[k]=D[k]*b;D[k+1]=D[k+1]*b*.97;D[k+2]=D[k+2]*b*.9;D[k+3]=r2>1?Math.max(0,(1.04-r2)/.04)*255:255;}
  g.putImageData(im,0,0);const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;return t;}
function moonBuild476(){const ph=moonPhase476(new Date());MOON476.ph=ph;MOON476.day=new Date().toDateString();MOON476.dir=new T.Vector3(-60,44,-42).normalize();
  if(MOON476.spr){MOON476.spr.material.map&&MOON476.spr.material.map.dispose();MOON476.spr.material.map=moonTex476(ph);MOON476.spr.material.needsUpdate=true;return;}
  const sm=new T.SpriteMaterial({map:moonTex476(ph),transparent:true,depthWrite:false,fog:false,opacity:0});const spr=new T.Sprite(sm);spr.scale.set(13,13,1);spr.renderOrder=-2;spr.frustumCulled=false;
  const h1=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffc890,blending:T.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0}));h1.scale.set(46,46,1);h1.renderOrder=-3;h1.frustumCulled=false;
  const h2=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xa01810,blending:T.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0}));h2.scale.set(120,120,1);h2.renderOrder=-4;h2.frustumCulled=false;
  const g=new T.Group();g.name='moon476';g.add(h2,h1,spr);scene.add(g);MOON476.g=g;MOON476.spr=spr;MOON476.halo=h1;MOON476.halo2=h2;}
function moonTick476(){const M=MOON476;if(!M.g)return;const nf=svPlay476()||game.state==='menu'?nightF():0,ph=M.ph||{illum:1};
  const v=nf>.02;if(M.g.visible!==v)M.g.visible=v;if(!v)return;const D=150;M.g.position.set(camera.position.x+M.dir.x*D,camera.position.y+M.dir.y*D,camera.position.z+M.dir.z*D);
  const fl=.92+.08*Math.sin(performance.now()*.0007);M.spr.material.opacity=nf;M.halo.material.opacity=nf*(.1+.22*ph.illum)*fl;M.halo2.material.opacity=nf*(.05+.1*ph.illum);}
const _moonCol476=new T.Color(0xa8bccc);
{const _al=applyLight;applyLight=function(){_al();try{if(!M476.on||!SV.on)return;const nf=nightF();if(nf<=0)return;const ph=MOON476.ph;if(!ph)return;const k=.5+.75*ph.illum;sun.intensity*=1+nf*(k-1);sun.color.lerp(_moonCol476,nf*.35);}catch(e){e476(e,'light');}};}
try{moonBuild476();}catch(e){e476(e,'moon');}

// ---------- 6) Halloween home (1 Oct - 2 Nov; localStorage zs_halloween = '0' / '1' forces it) ----------
const HW476={on:false};
function hwOn476(){try{const f=localStorage.getItem('zs_halloween');if(f==='0')return false;if(f==='1')return true;}catch(e){}const d=new Date(),m=d.getMonth(),day=d.getDate();return m===9||(m===10&&day<=2);}
function pumpkin476(w,face){return '<svg viewBox="0 0 120 110" width="'+w+'" class="pk"><defs><radialGradient id="pkG" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#ffb347"/><stop offset=".55" stop-color="#f07a12"/><stop offset="1" stop-color="#8a3a06"/></radialGradient><radialGradient id="pkF" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#fff7b0"/><stop offset=".5" stop-color="#ffcc33"/><stop offset="1" stop-color="#ff7a00"/></radialGradient></defs>'+
  '<path d="M58 22c-2-10 2-16 9-19l4 4c-5 3-7 8-6 15z" fill="#3d5a1e"/><path d="M66 12c8-6 18-4 22 2-7-1-14 0-20 4z" fill="#4f7a24"/>'+
  '<ellipse cx="34" cy="64" rx="30" ry="38" fill="url(#pkG)"/><ellipse cx="86" cy="64" rx="30" ry="38" fill="url(#pkG)"/><ellipse cx="60" cy="64" rx="32" ry="42" fill="url(#pkG)"/>'+
  '<path d="M60 24v80M40 28c-8 20-8 52 0 72M80 28c8 20 8 52 0 72" stroke="#a84a08" stroke-width="2" fill="none" opacity=".55"/>'+
  (face===2?'<g class="pkF" fill="url(#pkF)"><path d="M36 52l12-10 6 14z"/><path d="M84 52l-12-10-6 14z"/><path d="M58 64l4-8 4 8z"/><path d="M30 76c10 14 50 14 60 0l-6 4-5-5-6 6-6-6-7 6-6-6-6 6-6-5z"/></g>':
   '<g class="pkF" fill="url(#pkF)"><path d="M34 54l14-12 4 16z"/><path d="M86 54l-14-12-4 16z"/><path d="M56 66l4-9 4 9z"/><path d="M32 74c8 18 48 18 56 0-4 2-8 3-10 3l-3 6-5-5-8 1-5 5-4-6-8-1z"/></g>')+'</svg>';}
function bat476(){return '<svg viewBox="0 0 100 40" class="bt"><path class="w" d="M50 18c-4-6-12-8-20-6-6-6-16-8-28-2 8 2 12 8 12 14 6-4 12-4 16 0 4-4 12-2 14 2 2-4 4-6 6-8z"/><path class="w r" d="M50 18c4-6 12-8 20-6 6-6 16-8 28-2-8 2-12 8-12 14-6-4-12-4-16 0-4-4-12-2-14 2-2-4-4-6-6-8z"/><ellipse cx="50" cy="20" rx="5" ry="7"/><path d="M46 13l2-6 2 5 2-5 2 6z"/><circle cx="48" cy="17" r="1" fill="#ff5a1a"/><circle cx="52" cy="17" r="1" fill="#ff5a1a"/></svg>';}
function hwBuild476(){const scr=document.getElementById('startScreen');if(!scr||document.getElementById('hw476'))return;
  const css=document.createElement('style');css.id='v476hw';css.textContent=
   '#hw476{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}'+
   '#startScreen.hw .menuL{position:relative;z-index:2}#startScreen.hw #miniRank{z-index:2}'+
   '#hw476 .fogP{position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(to top,rgba(70,20,90,.55),rgba(90,30,110,.18) 55%,transparent)}'+
   '#hw476 .moon{position:absolute;top:5%;left:55%;width:min(15vh,110px);height:min(15vh,110px);border-radius:50%;background:radial-gradient(circle at 38% 36%,#fff6dc 0,#f3dfae 45%,#d9b77a 75%,#b88c4e 100%);box-shadow:0 0 30px 8px rgba(255,190,110,.45),0 0 90px 30px rgba(200,60,20,.22)}'+
   '#hw476 .moon i{position:absolute;border-radius:50%;background:rgba(150,110,60,.28)}'+
   '#hw476 .moon .cl{position:absolute;left:-30%;top:58%;width:160%;height:26%;border-radius:50%;background:rgba(40,16,50,.82);filter:blur(3px);animation:hwCl 14s ease-in-out infinite alternate}'+
   '@keyframes hwCl{from{transform:translateX(-8%)}to{transform:translateX(10%)}}'+
   '#hw476 .bt{position:absolute;width:46px;fill:#140a1a;filter:drop-shadow(0 0 2px rgba(255,140,40,.35));animation:hwFly 13s linear infinite}'+
   '#hw476 .bt .w{transform-origin:50px 18px;animation:hwFlap .22s ease-in-out infinite alternate}'+
   '@keyframes hwFlap{from{transform:scaleY(1)}to{transform:scaleY(-.35)}}'+
   '@keyframes hwFly{0%{transform:translate(-10vw,0) scale(.8)}25%{transform:translate(25vw,-4vh) scale(.9)}50%{transform:translate(55vw,3vh) scale(.7)}75%{transform:translate(85vw,-3vh) scale(.85)}100%{transform:translate(115vw,1vh) scale(.8)}}'+
   '#hw476 .pks{position:absolute;bottom:1.5%;right:31%;display:flex;align-items:flex-end;gap:6px}'+
   '#hw476 .pks2{position:absolute;bottom:1%;left:44%;display:flex;align-items:flex-end}'+
   '#hw476 .pk{filter:drop-shadow(0 4px 6px rgba(0,0,0,.6)) drop-shadow(0 0 14px rgba(255,120,20,.45))}'+
   '#hw476 .pkF{animation:hwFl 1.7s infinite}#hw476 .pks svg:nth-child(2) .pkF{animation-delay:-.6s}#hw476 .pks svg:nth-child(3) .pkF{animation-delay:-1.1s}'+
   '@keyframes hwFl{0%,100%{opacity:1}35%{opacity:.72}52%{opacity:.95}70%{opacity:.6}}'+
   '#hw476 .web{position:absolute;top:0;right:0;width:min(22vh,150px);opacity:.55}'+
   '#hw476 .spd{position:absolute;top:0;right:9%;width:2px;height:16vh;background:linear-gradient(#ccc0,#ccc8);animation:hwSp 6s ease-in-out infinite}'+
   '#hw476 .spd:after{content:"";position:absolute;bottom:-7px;left:-6px;width:14px;height:12px;border-radius:50%;background:#120812;box-shadow:-6px -2px 0 -4px #120812,6px -2px 0 -4px #120812}'+
   '@keyframes hwSp{0%,100%{height:10vh}50%{height:22vh}}'+
   '#startScreen.hw .ztitle span{background:linear-gradient(180deg,#ffd27a,#ff7a12 55%,#b8360a);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 2px 0 rgba(60,10,70,.9)) drop-shadow(0 0 12px rgba(255,110,20,.45))}'+
   '#startScreen.hw #btnZombie{border-color:#ff8a1e!important;box-shadow:0 0 0 1px rgba(255,138,30,.5),0 0 18px rgba(255,110,20,.35)!important}'+
   '#startScreen.hw #btnOnline{border-color:#9a4dff!important;box-shadow:0 0 14px rgba(140,70,255,.3)!important}'+
   '#startScreen.hw .hwTag{display:inline-flex;align-items:center;gap:6px;margin:2px 0 4px;padding:3px 10px;border-radius:999px;font:700 11px/1.3 system-ui,sans-serif;color:#ffe2b8;background:linear-gradient(90deg,rgba(255,110,20,.32),rgba(130,50,200,.32));border:1px solid rgba(255,150,60,.5)}'+
   '@media (prefers-reduced-motion:reduce){#hw476 *{animation:none!important}}';
  document.head.appendChild(css);
  const L=document.createElement('div');L.id='hw476';let bats='';for(let i=0;i<5;i++)bats+=bat476().replace('class="bt"','class="bt" style="top:'+(6+i*7)+'%;animation-delay:-'+(i*2.7).toFixed(1)+'s;animation-duration:'+(11+i*2.3).toFixed(1)+'s;width:'+(30+(i%3)*10)+'px"');
  L.innerHTML='<div class="fogP"></div><div class="moon"><i style="left:22%;top:30%;width:18%;height:16%"></i><i style="left:55%;top:52%;width:24%;height:20%"></i><i style="left:40%;top:18%;width:10%;height:9%"></i><div class="cl"></div></div>'+bats+
   '<svg class="web" viewBox="0 0 100 100" fill="none" stroke="#ddd" stroke-width=".7"><path d="M100 0L40 100M100 0L0 60M100 0L70 100M100 0L0 25"/><path d="M84 0q-2 10 6 13 8 3 10 12M68 0q-3 20 10 26 14 6 22 24M52 0q-4 30 14 40 18 10 34 36M36 0q-5 40 18 54 22 13 46 46"/></svg><div class="spd"></div>'+
   '<div class="pks">'+pumpkin476(70,1)+pumpkin476(52,2)+pumpkin476(40,1)+'</div><div class="pks2">'+pumpkin476(44,2)+'</div>';
  const sh=scr.querySelector('.shade');if(sh&&sh.nextSibling)scr.insertBefore(L,sh.nextSibling);else scr.appendChild(L);
  const tag=scr.querySelector('.ztag');if(tag&&!scr.querySelector('.hwTag')){const t=document.createElement('div');t.className='hwTag';t.textContent='🎃 Halloween · cerca il Ghigno Rosso 🎩 (5 💎)';tag.parentNode.insertBefore(t,tag);}
  scr.classList.add('hw');HW476.on=true;}
function hwOff476(){const scr=document.getElementById('startScreen');const L=document.getElementById('hw476');if(L)L.remove();const t=scr&&scr.querySelector('.hwTag');if(t)t.remove();if(scr)scr.classList.remove('hw');HW476.on=false;}
try{if(hwOn476())hwBuild476();}catch(e){e476(e,'hw');}

// ---------- 7) arena: 25% bigger, snappier movement, aim assist + lag-compensated shots, blood, real weapons in the fighters' hands ----------
const AR476={S:1.25,blocks:[],rtt:0,pingT:0,crossT:0,cross:false,dec:null,decI:0,ok:{}};
function arenaScale476(){const A=ARENA454;if(!A.root||A.env476)return;const S=AR476.S,keep=new Set();for(const f of A.pool)keep.add(f.g);for(const f of (A.demo||[]))keep.add(f.g);for(const id in A.fig)keep.add(A.fig[id].g);for(const p of A.pickMeshes)keep.add(p.m);
  const env=new T.Group();env.name='arenaEnv476';env.scale.set(S,1,S);for(const o of A.root.children.slice()){if(keep.has(o)||o.isLight)continue;A.root.remove(o);env.add(o);}A.root.add(env);A.env476=env;
  for(const b of A.blocks){b.x0*=S;b.x1*=S;b.z0*=S;b.z1*=S;}
  AR476.blocks.length=0;for(const c of ARENA_COVERS)AR476.blocks.push({x0:(c[0]-c[2]/2)*S,x1:(c[0]+c[2]/2)*S,z0:(c[1]-c[3]/2)*S,z1:(c[1]+c[3]/2)*S,h:c[4]});
  for(const p of ARENA_PILLARS)AR476.blocks.push({x0:(p[0]-.6)*S,x1:(p[0]+.6)*S,z0:(p[1]-.6)*S,z1:(p[1]+.6)*S,h:3.4});
  // blood decals on the arena floor (own pool, lives in the arena root)
  const dm=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:bloodTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,color:0xb01010}),28);
  dm.frustumCulled=false;for(let i=0;i<28;i++)dm.setMatrixAt(i,ZERO);dm.renderOrder=1;A.root.add(dm);AR476.dec=dm;}
try{arenaScale476();}catch(e){e476(e,'ascale');}
arenaCollide=function(p,r){const B=ARENA454.blocks;for(let i=0;i<B.length;i++){const b=B[i];if(p.x<b.x0-r||p.x>b.x1+r||p.z<b.z0-r||p.z>b.z1+r)continue;const cx=p.x<b.x0?b.x0:(p.x>b.x1?b.x1:p.x),cz=p.z<b.z0?b.z0:(p.z>b.z1?b.z1:p.z);const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
  if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r;}else{const l=p.x-b.x0,rr=b.x1-p.x,u=p.z-b.z0,dd=b.z1-p.z,m=Math.min(l,rr,u,dd);if(m===l)p.x=b.x0-r;else if(m===rr)p.x=b.x1+r;else if(m===u)p.z=b.z0-r;else p.z=b.z1+r;}}}
  const R=32.6*AR476.S-r,d=Math.hypot(p.x,p.z);if(d>R&&d>1e-6){p.x*=R/d;p.z*=R/d;}};
{const _sw=arenaShowWorld;arenaShowWorld=function(){_sw.apply(this,arguments);try{scene.fog.near=22;scene.fog.far=98;}catch(e){}};}

// source patches (exact substrings; when one is missing the original function stays as it is)
function patch476(name,pairs){try{const f=window[name];if(typeof f!=='function')return 0;let src=f.toString(),n=0;for(const pr of pairs){if(src.indexOf(pr[0])>=0){src=src.split(pr[0]).join(pr[1]);n++;}}
  if(n!==pairs.length){AR476.ok[name]='skip '+n+'/'+pairs.length;return 0;}const g=(0,eval)('"use strict";('+src+')');if(typeof g!=='function')return 0;window[name]=g;AR476.ok[name]='ok';return n;}catch(e){e476(e,'patch '+name);AR476.ok[name]='err';return 0;}}
patch476('arenaTick',[['const accel=14;','const accel=isTouch?20:18;'],['(isTouch?22:35)','(isTouch?30:40)'],['-0.12)/0.88,1.25)','-0.07)/0.93,1.12)'],['now-(ARENA454.sendT||0)>90','now-(ARENA454.sendT||0)>66']]);
patch476('arenaShoot',[['_dir.set(0,0,-1).applyQuaternion(camera.quaternion);','_dir.set(0,0,-1).applyQuaternion(camera.quaternion);try{aimShot476(_org,_dir,w);}catch(e476x){}'],['dz:_dir.z}','dz:_dir.z,lag:lag476()}']]);

// aim: line of sight against the same blockers as the server, gentle magnetism on touch
const _ao476=new T.Vector3(),_ad476=new T.Vector3(),_av476=new T.Vector3();
function los476(ox,oy,oz,tx,ty,tz){const dx=tx-ox,dy=ty-oy,dz=tz-oz;for(const b of AR476.blocks){let t0=0,t1=1;const lo=[b.x0,0,b.z0],hi=[b.x1,b.h,b.z1],o=[ox,oy,oz],d=[dx,dy,dz];let hit=true;
  for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-9){if(o[i]<lo[i]||o[i]>hi[i]){hit=false;break;}}else{let a=(lo[i]-o[i])/d[i],c=(hi[i]-o[i])/d[i];if(a>c){const s=a;a=c;c=s;}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1){hit=false;break;}}}
  if(hit&&t0<.97)return false;}return true;}
function aimFind476(mul,range){const A=ARENA454;camera.updateMatrixWorld();camera.getWorldPosition(_ao476);_ad476.set(0,0,-1).applyQuaternion(camera.quaternion);let best=null,bs=1;
  for(const id in A.fig){const a=A.actors[id];if(!a||!a.alive||(a.team|0)===(A.team|0))continue;const f=A.fig[id];if(!f||!f.g.visible)continue;const p=f.g.position;
    for(let k=0;k<2;k++){const y=k?1.6:1.2;_av476.set(p.x-_ao476.x,y-_ao476.y,p.z-_ao476.z);const d=_av476.length();if(d>range||d<.3)continue;
      const ang=Math.acos(clamp(_av476.dot(_ad476)/d,-1,1)),tol=clamp(Math.atan((isTouch?.8:.42)*mul/d),(isTouch?.03:.012)*mul,(isTouch?.12:.05)*mul),s=ang/tol;
      if(s<bs&&los476(_ao476.x,_ao476.y,_ao476.z,p.x,y,p.z)){bs=s;best={x:p.x,y:y,z:p.z,d:d,ang:ang};}}}
  return best;}
function aimShot476(org,dir,w){if(!M476.on||!w)return;const t=aimFind476(1,w.melee?2.7:Math.min(w.range||60,95));if(!t)return;dir.set(t.x-org.x,t.y-org.y,t.z-org.z).normalize();}
function lag476(){const d=(typeof INT475!=='undefined'&&INT475.delay)||130;return Math.round(d+clamp(AR476.rtt||110,30,260));}
function aimTick476(dt,now){const w=WEAPONS[curW];if(!w)return;
  if(now-AR476.crossT>90){AR476.crossT=now;const t=ARENA454.alive?aimFind476(1.5,w.melee?3:Math.min(w.range||60,95)):null,on=!!t;if(on!==AR476.cross){AR476.cross=on;const c=document.getElementById('cross');if(c)c.classList.toggle('on476',on);}}
  if(isTouch&&firing&&ARENA454.alive){const t=aimFind476(2.2,w.melee?3:Math.min(w.range||60,80));if(t){const dx=t.x-_ao476.x,dz=t.z-_ao476.z,h=Math.hypot(dx,dz);const yw=Math.atan2(-dx,-dz),pt=Math.atan2(t.y-_ao476.y,h);
    let dy=yw-player.tYaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const k=Math.min(1,dt*4.5),mx=1.5*dt;player.tYaw+=clamp(dy*k,-mx,mx);player.tPitch+=clamp((pt-player.tPitch)*k,-mx*.6,mx*.6);}}
  if(now-AR476.pingT>2000){AR476.pingT=now;arenaSend({t:'ping',c:Math.round(now)});}}
{const _om=arenaOnMsg;arenaOnMsg=function(msg){if(msg&&msg.t==='pong'){const r=performance.now()-(+msg.c||0);if(r>0&&r<3000)AR476.rtt=AR476.rtt?AR476.rtt+(r-AR476.rtt)*.25:r;return;}return _om(msg);};}

// blood on confirmed hits: burst + mist at the fighter you actually see, floor decal, red splash when you are the one hit
const _bv476=new T.Vector3(),_bd476=new T.Vector3(),_bo476=new T.Object3D();
function blood476(msg){const A=ARENA454;let px,pz;const f=A.fig[msg.victim];if(msg.victim===A.me){px=player.pos.x;pz=player.pos.z;}else if(f&&f.g.visible){px=f.g.position.x;pz=f.g.position.z;}else{const a=A.actors[msg.victim];if(!a)return;px=a.x;pz=a.z;}
  let sx,sz;if(msg.by===A.me){sx=player.pos.x;sz=player.pos.z;}else{const g=A.fig[msg.by];if(g){sx=g.g.position.x;sz=g.g.position.z;}else{sx=px-1;sz=pz;}}
  _bd476.set(px-sx,.25,pz-sz);const L=Math.hypot(_bd476.x,_bd476.z)||1;_bd476.x/=L;_bd476.z/=L;const head=msg.part==='head',big=!!msg.kill;
  if(msg.victim!==A.me){_bv476.set(px-_bd476.x*.15,head?1.62:1.2,pz-_bd476.z*.15);
    emit(_bv476,_bd476,big?30:(head?20:14),[0x7a0606,0xb01010,0xe02020,0x3a0000],{speed:big?5:4,spread:.75,life:.6,size:.07,grav:9});
    emit(_bv476,_bd476,head?10:6,[0x9a0c0c,0x600404],{speed:1.1,spread:1,life:.45,size:.2,grav:.6});}
  if(AR476.dec&&(big||Math.random()<.6)){const s=(big?1.5:.8)+Math.random()*.5;_bo476.position.set(px+_bd476.x*(.6+Math.random()*.6),.035,pz+_bd476.z*(.6+Math.random()*.6));_bo476.rotation.set(0,Math.random()*6.28,0);_bo476.scale.set(s,1,s*(.7+Math.random()*.5));_bo476.updateMatrix();
    AR476.dec.setMatrixAt(AR476.decI,_bo476.matrix);AR476.decI=(AR476.decI+1)%28;AR476.dec.instanceMatrix.needsUpdate=true;}
  if(msg.victim===A.me){const el=document.getElementById('bl476');if(el){el.style.transition='none';el.style.opacity=big?'.85':'.55';void el.offsetWidth;el.style.transition='opacity .7s ease-out';el.style.opacity='0';}}}
{const _fx=arenaFx;arenaFx=function(msg){const r=_fx(msg);try{if(M476.on&&msg)blood476(msg);}catch(e){e476(e,'blood');}return r;};}
{const bl=document.createElement('div');bl.id='bl476';bl.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:40;opacity:0;background:radial-gradient(ellipse at center,rgba(120,0,0,0) 45%,rgba(140,0,0,.55) 75%,rgba(90,0,0,.9) 100%)';document.body.appendChild(bl);
 const st=document.createElement('style');st.id='v476ar';st.textContent='#cross.on476 i{background:#ff3838!important;box-shadow:0 0 4px rgba(255,0,0,.9)!important}#cross.on476 b,#cross.on476 u{border-color:#ff3838!important;background-color:rgba(255,56,56,.9)!important}';document.head.appendChild(st);}

// fighters hold their real weapon: the baked carbine is removed from the shared body mesh and a per-weapon model rides the spine bone
const WPN476={geo:{},mat:null,box:null,cyl:null};
function wpnParts476(id){const P=[],X=.09;const b=(c,x,y,z,sx,sy,sz,rx,rz)=>P.push(['b',c,X+x,y,z,sx,sy,sz,rx||0,0,rz||0]),cz=(c,x,y,z,r,len)=>P.push(['c',c,X+x,y,z,r*2,len,r*2,Math.PI/2,0,0]),cy=(c,x,y,z,r,len)=>P.push(['c',c,X+x,y,z,r*2,len,r*2,0,0,0]);
  const D=0x23262b,M=0x3a3f46,S=0x9aa0a8,W=0x6b4226,K=0x111214,G=0x5a8aa8;
  const grip=(c)=>b(c||K,0,.225,-.27,.038,.11,.055,.3);
  switch(id){
  case 'knife':b(K,0,.26,-.27,.03,.035,.11);b(M,0,.26,-.33,.06,.02,.022);b(0xc8ccd0,0,.265,-.44,.008,.045,.2);b(0xe8ecf0,0,.283,-.44,.004,.01,.2);break;
  case 'pistol':case 'fox':case 'vespa':{const big=id==='vespa'?1.25:id==='fox'?1.1:1,sl=id==='vespa'?0xc8a018:D;b(sl,0,.3,-.37,.045*big,.065*big,.22*big);b(K,0,.255,-.35,.04,.035,.17);grip();cz(K,0,.305,-.37-.115*big,.012*big,.03);if(id==='fox')b(0xe07a20,0,.333,-.37,.047,.008,.2);if(id==='vespa')b(K,0,.335,-.37,.02,.012,.12);break;}
  case 'revolver':b(S,0,.3,-.33,.04,.06,.08);cz(M,0,.292,-.37,.036,.07);cz(S,0,.31,-.48,.016,.2);b(S,0,.33,-.52,.01,.02,.03);grip(W);break;
  case 'smg':case 'burst':{const c=id==='burst'?0x8a7a58:D;b(c,0,.3,-.36,.05,.08,.26);cz(K,0,.31,-.54,.015,.12);b(K,0,.2,-.4,.035,.16,.045);grip();b(M,0,.3,-.17,.02,.05,.14);b(K,0,.355,-.36,.02,.025,.06);break;}
  case 'laser':b(0xd8dde4,0,.3,-.37,.06,.1,.36);b(0x30e0ff,.032,.3,-.37,.004,.014,.3);b(0x30e0ff,-.032,.3,-.37,.004,.014,.3);cz(0x30e0ff,0,.31,-.58,.022,.07);cz(M,0,.31,-.64,.016,.06);grip(0x2a2e34);b(0xd8dde4,0,.29,-.14,.045,.08,.16);break;
  case 'plasma':b(0x2a2e34,0,.3,-.36,.06,.1,.32);for(let i=0;i<3;i++)cz(0xff8a30,0,.31,-.52-i*.05,.042,.02);cz(M,0,.31,-.6,.018,.22);grip();b(0xff8a30,0,.355,-.33,.012,.01,.2);break;
  case 'thunder':b(0x2a3442,0,.3,-.34,.055,.09,.26);cz(K,0,.32,-.6,.02,.34);for(let i=0;i<3;i++)cz(0x60a8ff,0,.32,-.5-i*.08,.034,.018);grip();b(M,0,.29,-.14,.045,.09,.18);break;
  case 'shotgun':cz(K,0,.33,-.56,.017,.5);cz(D,0,.29,-.52,.016,.4);b(W,0,.29,-.53,.05,.05,.15);b(D,0,.31,-.3,.05,.08,.18);b(W,0,.28,-.1,.045,.09,.22,-.08);grip(W);break;
  case 'dbarrel':case 'saw':{const L=id==='saw'?.26:.5;cz(K,.015,.32,-.36-L/2,.015,L);cz(K,-.015,.32,-.36-L/2,.015,L);b(W,0,.29,-.36-L*.35,.05,.04,L*.4);b(S,0,.31,-.3,.05,.08,.12);if(id==='saw')grip(W);else{b(W,0,.28,-.1,.045,.09,.22,-.08);grip(W);}break;}
  case 'sniper':case 'hunt':{const c=id==='hunt'?W:0x3e4a3a;b(c,0,.3,-.34,.06,.09,.36);cz(id==='hunt'?S:K,0,.32,-.76,.014,.56);cy(K,0,.4,-.34,.028,.001);cz(K,0,.4,-.34,.028,.26);cz(G,0,.4,-.475,.026,.01);b(K,0,.36,-.3,.02,.05,.02);b(K,0,.36,-.4,.02,.05,.02);b(c,0,.28,-.08,.05,.11,.24);grip(c===W?W:K);if(id==='sniper'){b(K,.03,.24,-.66,.01,.14,.01,0,.3);b(K,-.03,.24,-.66,.01,.14,.01,0,-.3);}break;}
  case 'crossbow':b(W,0,.3,-.33,.05,.06,.42);b(K,0,.32,-.56,.44,.025,.03);b(K,.22,.32,-.53,.012,.025,.07);b(K,-.22,.32,-.53,.012,.025,.07);b(0xd8d0c0,0,.325,-.47,.42,.005,.005);cz(0x8a6a3a,0,.338,-.47,.006,.4);b(0xc0c4c8,0,.338,-.68,.01,.01,.03);grip(W);break;
  case 'glauncher':cz(0x3a4a2a,0,.31,-.47,.046,.38);cz(D,0,.3,-.3,.065,.1);b(K,0,.36,-.42,.02,.03,.1);grip();b(M,0,.29,-.12,.045,.09,.2);break;
  case 'flamer':cy(0xa02a1a,0,.2,-.4,.07,.2);cy(0x6a1a10,0,.31,-.4,.05,.02);b(D,0,.3,-.33,.05,.08,.24);cz(S,0,.31,-.6,.018,.28);cz(K,0,.31,-.75,.026,.04);b(0xff9a30,0,.31,-.785,.02,.02,.02);grip();break;
  case 'minigun':for(let k=0;k<6;k++){const a=k/6*Math.PI*2;cz(K,Math.cos(a)*.032,.31+Math.sin(a)*.032,-.62,.009,.5);}cz(M,0,.31,-.38,.055,.08);cz(M,0,.31,-.82,.05,.03);b(D,0,.31,-.26,.1,.12,.16);b(K,0,.41,-.28,.02,.06,.1);b(0x8a6a2a,.07,.25,-.3,.05,.1,.12);grip();break;
  default:b(D,0,.3,-.33,.06,.095,.3);b(M,0,.31,-.53,.058,.07,.2);cz(K,0,.32,-.7,.015,.18);cz(K,0,.32,-.8,.022,.04);b(K,0,.2,-.38,.045,.14,.07,.25);b(K,0,.13,-.41,.043,.07,.065,.5);grip();b(M,0,.29,-.12,.05,.1,.18);b(K,0,.37,-.32,.025,.03,.08);cz(G,0,.372,-.36,.012,.004);}
  return P;}
function wpnGeo476(id){if(WPN476.geo[id])return WPN476.geo[id];if(!WPN476.box){const bx=new T.BoxGeometry(1,1,1).toNonIndexed(),cl=new T.CylinderGeometry(.5,.5,1,10).toNonIndexed();bx.deleteAttribute('uv');cl.deleteAttribute('uv');WPN476.box=bx;WPN476.cyl=cl;}
  const P=wpnParts476(id);let n=0;for(const p of P)n+=(p[0]==='b'?WPN476.box:WPN476.cyl).attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);
  const M=new T.Matrix4(),N3=new T.Matrix3(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),s=new T.Vector3(),cc=new T.Color();let o=0;
  for(const p of P){const g=p[0]==='b'?WPN476.box:WPN476.cyl,Pa=g.attributes.position,Na=g.attributes.normal,c=Pa.count;M.compose(v.set(p[2],p[3],p[4]),q.setFromEuler(e.set(p[8],p[9],p[10])),s.set(p[5],p[6],p[7]));N3.getNormalMatrix(M);cc.setHex(p[1]);
    for(let i=0;i<c;i++){v.fromBufferAttribute(Pa,i).applyMatrix4(M);pos[(o+i)*3]=v.x;pos[(o+i)*3+1]=v.y;pos[(o+i)*3+2]=v.z;v.fromBufferAttribute(Na,i).applyMatrix3(N3).normalize();nor[(o+i)*3]=v.x;nor[(o+i)*3+1]=v.y;nor[(o+i)*3+2]=v.z;col[(o+i)*3]=cc.r;col[(o+i)*3+1]=cc.g;col[(o+i)*3+2]=cc.b;}o+=c;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));geo.computeBoundingSphere();WPN476.geo[id]=geo;return geo;}
function stripCarbine476(){const geo=typeof FIG475!=='undefined'&&FIG475.geo;if(!geo||geo.userData.noGun476)return;const P=geo.attributes.position,C=geo.attributes.color,B=geo.attributes.bI475;if(!P||!C||!B)return;
  const cols=[0x26292e,0x3a3f44,0x1a1d22,0x5a8aa8].map(h=>new T.Color().setHex(h));const sp=FIG475.BONES.indexOf('spine');let n=0;
  for(let i=0;i<P.count;i++){if(Math.round(B.getX(i))!==sp)continue;const x=P.getX(i);if(x<.025||x>.16)continue;const r=C.getX(i),g=C.getY(i),bb=C.getZ(i);if(!cols.some(c=>Math.abs(c.r-r)<.002&&Math.abs(c.g-g)<.002&&Math.abs(c.b-bb)<.002))continue;if(P.getZ(i)>-.03)continue;P.setXYZ(i,0,1.2,0);n++;}
  P.needsUpdate=true;geo.userData.noGun476=n;}
function setWpn476(f,id){if(!f||!f.spine)return;id=id||'ar';if(f.wid476===id&&f.wpn476)return;if(!WPN476.mat)WPN476.mat=new T.MeshLambertMaterial({vertexColors:true});
  if(!f.wpn476){f.wpn476=new T.Mesh(wpnGeo476(id),WPN476.mat);f.wpn476.name='wpn476';f.wpn476.castShadow=false;f.spine.add(f.wpn476);}else f.wpn476.geometry=wpnGeo476(id);f.wid476=id;}
try{stripCarbine476();const A=ARENA454;for(const f of A.pool)setWpn476(f,'ar');if(A.demo){setWpn476(A.demo[0],A.weapon||'ar');if(A.demo[1])setWpn476(A.demo[1],'shotgun');}for(const k of Object.keys(GUNS476()))wpnGeo476(k);}catch(e){e476(e,'wpn');}
function GUNS476(){const o={};try{for(const w of WEAPONS)o[w.id]=1;}catch(e){}return o;}
{const _sn=arenaSnap;arenaSnap=function(msg){_sn(msg);try{const arr=msg&&msg.players||[];for(let i=0;i<arr.length;i++){const a=ARENA454.actors[arr[i].id];if(a)a.weapon=arr[i].weapon;}}catch(e){e476(e,'snapw');}};}
function wpnTick476(){const A=ARENA454;for(const id in A.fig){const a=A.actors[id],f=A.fig[id];if(a&&f&&f.g.visible)setWpn476(f,a.weapon||'pistol');}if(A.demo&&A.demo[0]&&A.demo[0].g.visible)setWpn476(A.demo[0],A.weapon||'ar');}

// ---------- warm-up: every new object is drawn once behind the match loader (no hitch when it first comes into view) ----------
{const _wf=ld432WarmFrame;ld432WarmFrame=function(){const F=LD431.fr,it=F&&F[LD431.fi];if(!M476.on||!it||it.k!=='zpool')return _wf.apply(this,arguments);const sv=[];
  try{const add=o=>{if(!o)return;sv.push([o,o.visible,o.frustumCulled]);o.visible=true;o.frustumCulled=false;};if(MOON476.g){add(MOON476.g);}for(const o of (W476.objs||[]))add(o);}catch(e){e476(e,'warm');}
  try{return _wf.apply(this,arguments);}finally{for(let i=sv.length-1;i>=0;i--){const s=sv[i];s[0].visible=s[1];s[0].frustumCulled=s[2];}}};}

// ---------- per-frame ----------
{const _l0=loop0;let l6=0,dayT=0;loop0=function(now){try{if(M476.on){const dt=l6?Math.min(.1,(now-l6)/1000):0;l6=now;const A=ARENA454;
  if(A.on&&A.phase==='play'&&game.state==='play')aimTick476(dt,now);
  if(A.on||A.preview)wpnTick476();
  const sv=svPlay476(),ld=!!(LD431.on||LD431.hold);
  if(sv&&!ld){ghignoTick476(dt);zTick476(dt);
    if(SV.phase==='night'&&MOON476.lastPh!==SV.day&&MOON476.ph){MOON476.lastPh=SV.day;const p=MOON476.ph;try{toast(p.icon+' '+p.name+' stanotte'+(p.illum>.85?' · i morti sono più inquieti':p.illum<.15?' · buio pesto':''),2200);}catch(e){}}}
  moonTick476();dayT+=dt;if(dayT>60){dayT=0;if(MOON476.day!==new Date().toDateString()){try{moonBuild476();}catch(e){}}}
  if(W476.tick)W476.tick(dt,now,sv&&!ld);}}catch(e){e476(e,'loop');}return _l0(now);};}
window.__zs476={get m(){return M476;},ghigno:()=>ghignoTry476(),moon:()=>MOON476.ph,patches:()=>AR476.ok,rtt:()=>AR476.rtt,hw:v=>{try{localStorage.setItem('zs_halloween',v?'1':'0');}catch(e){}v?hwBuild476():hwOff476();},scream:k=>k?voice476(k,20,0,1):scream476(),w:W476};
