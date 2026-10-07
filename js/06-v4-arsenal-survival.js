/* Zombie Survival — game code part 06-v4-arsenal-survival (game.html lines 3267-3835 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4 module A: arsenal FX, scope, weapon bar, radar =======================
const ZK=()=>camera.fov/75;
// --- flame / fire particle system (single Points draw call) ---
const FPN=isTouch?150:220,fpPos=new Float32Array(FPN*3),fpCol=new Float32Array(FPN*3),fpSize=new Float32Array(FPN),fpA=new Float32Array(FPN),FP=[];
for(let i=0;i<FPN;i++){FP.push({life:0,max:1,vx:0,vy:0,vz:0,s0:.3,s1:1,kind:0});fpPos[i*3+1]=-99;}
const fpGeo=new T.BufferGeometry();fpGeo.setAttribute('position',new T.BufferAttribute(fpPos,3));fpGeo.setAttribute('color',new T.BufferAttribute(fpCol,3));fpGeo.setAttribute('size',new T.BufferAttribute(fpSize,1));fpGeo.setAttribute('alpha',new T.BufferAttribute(fpA,1));
const fpMat=new T.ShaderMaterial({uniforms:{map:{value:glowTex},uScale:{value:300}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  vertexShader:'attribute float size;attribute float alpha;attribute vec3 color;varying vec3 vC;varying float vA;uniform float uScale;void main(){vC=color;vA=alpha;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=min(size*uScale/max(.1,-mv.z),uScale*.35);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D map;varying vec3 vC;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vC*t.rgb*vA,1.0)*t.a;}'});
const fpPts=new T.Points(fpGeo,fpMat);fpPts.frustumCulled=false;scene.add(fpPts);let fpI=0;
function flameP(x,y,z,vx,vy,vz,life,s0,s1,kind){const P=FP[fpI],i=fpI;fpI=(fpI+1)%FPN;P.life=P.max=life;P.vx=vx;P.vy=vy;P.vz=vz;P.s0=s0;P.s1=s1;P.kind=kind||0;fpPos[i*3]=x;fpPos[i*3+1]=y;fpPos[i*3+2]=z;}
function updateFlames(dt){fpMat.uniforms.uScale.value=VH()*curPR/(2*Math.tan(camera.fov*Math.PI/360));let any=false;
  for(let i=0;i<FPN;i++){const P=FP[i];if(P.life<=0){if(fpA[i]!==0){fpA[i]=0;any=true;}continue;}any=true;P.life-=dt;const k=1-P.life/P.max;
    fpPos[i*3]+=P.vx*dt;fpPos[i*3+1]+=P.vy*dt;fpPos[i*3+2]+=P.vz*dt;const dr=Math.exp(-2.2*dt);P.vx*=dr;P.vz*=dr;P.vy=P.vy*dr+dt*2.6;
    fpSize[i]=lerp(P.s0,P.s1,Math.sqrt(k));const a=k<.12?k/.12:1-(k-.12)/.88;
    if(P.kind===1){fpCol[i*3]=.9;fpCol[i*3+1]=.55-k*.35;fpCol[i*3+2]=.2;fpA[i]=a*.8;}else{fpCol[i*3]=1;fpCol[i*3+1]=lerp(.85,.25,k);fpCol[i*3+2]=lerp(.45,.03,k);fpA[i]=a*(k>.7?(1-k)/.3:1)*.95;}
    if(P.life<=0)fpA[i]=0;}
  if(any){for(const n of ['position','color','size','alpha'])fpGeo.attributes[n].needsUpdate=true;}}
// --- shared muzzle / impact helpers ---
function aimSpread(w){if(!w)return 0;const hip=w.hipSpread!=null?w.hipSpread:(w.spread||0)*2.5;const ads=w.spread||0;const k=Math.min(1,ADS.k||0);const base=hip+(ads-hip)*k;const move=1+(player.moveAmt||0)*(k>.55?.2:.62);return Math.max(0,(base+(fx.bloom||0))*move);}
function kickShot(w){const cut=1-Math.min(1,ADS.k||0)*.42;fx.recoilP=Math.min(.22,(fx.recoilP||0)+w.kick*.021*cut);fx.bloom=Math.min(w.bmax||.05,(fx.bloom||0)+(w.bl||.011)*cut);fx.vmKick=Math.min(1.6,(fx.vmKick||0)+w.kick);fx.shake+=(w.shake||0)*cut;player.tYaw+=rand(-1,1)*w.kick*.0045*cut;}
function aimDir(spr){camera.updateMatrixWorld();camera.getWorldPosition(_org);_from.set(.17,-.16,-.75).applyMatrix4(camera.matrixWorld);sprXY467(spr).normalize().applyQuaternion(camera.quaternion);}
function muzzleFx(w,size,ml){const vm=VM[w.id];const fl=vm&&vm.userData.flash;if(fl){fl.userData.t=.07;fl.material.opacity=1;fl.material.rotation=Math.random()*6;const sc=(size||.4)*rand(.8,1.2);fl.scale.set(sc,sc,1);}
  vmFlash.color.setHex(w.color);vmFlash.intensity=4;muzzleLight.color.setHex(w.mlColor||0xffb050);muzzleLight.intensity=ml===undefined?18:ml;muzzleLight.position.copy(_from);
  kickShot(w);
  if(mag[w.id]===0&&res[w.id]>0)setTimeout(()=>{if(WEAPONS[curW]===w&&game.state==='play')startReload();},w.rate*1000+60);}
function surfaceHit(h,w,small){if(h.face)_n.copy(h.face.normal).transformDirection(h.object.matrixWorld);else _n.set(0,1,0);
  emit(h.point,_n,small?3:6,SPARK,{speed:4.5,spread:.8,life:.28,size:.035,grav:12,stretch:3});emit(h.point,_n,3,DUST,{speed:1,spread:.5,life:.6,size:.09,grav:-.5});addDecal(holes,h.point,_n,.14);play('impact');}
// --- projectiles: crossbow bolts + grenade-launcher shells ---
const boltGeo=new T.CylinderGeometry(.012,.012,.62,5).rotateX(Math.PI/2),boltMat=new T.MeshLambertMaterial({color:0x7a5534}),shellGeo=new T.SphereGeometry(.07,10,8),shellMat=new T.MeshLambertMaterial({color:0x56602e});
const PROJ=[];for(let i=0;i<10;i++){const m=new T.Mesh(i<5?boltGeo:shellGeo,i<5?boltMat:shellMat);m.visible=false;m.userData.dyn=1;scene.add(m);if(i<5){const f=new T.Mesh(G.box,new T.MeshBasicMaterial({color:0xd03020}));f.scale.set(.004,.05,.09);f.position.z=.26;m.add(f);}PROJ.push({m,on:false,kind:i<5?'bolt':'shell',v:new T.Vector3(),t:0,stuck:0});}
function launch(kind,w){const P=PROJ.find(p=>p.kind===kind&&!p.on&&p.stuck<=0)||PROJ.find(p=>p.kind===kind&&!p.on);if(!P)return;P.on=true;P.stuck=0;P.t=0;P.w=w;P.m.visible=true;
  P.m.position.copy(_from).lerp(_org,.4);P.v.copy(_dir).multiplyScalar(kind==='bolt'?62:34);if(kind==='shell')P.v.y+=1.2;P.m.lookAt(_tmp.copy(P.m.position).add(P.v));}
const _pv=new T.Vector3(),_pn=new T.Vector3();
function updateProj(dt){for(const P of PROJ){if(P.stuck>0){P.stuck-=dt;if(P.stuck<=0)P.m.visible=false;continue;}if(!P.on)continue;P.t+=dt;
  P.v.y-=(P.kind==='bolt'?3.5:9.8)*dt;_pv.copy(P.v).multiplyScalar(dt);const len=_pv.length();_pn.copy(_pv).normalize();ray.set(P.m.position,_pn);ray.far=len+.05;
  const hits=ray.intersectObjects(shootTargets(),false);let h=hits[0];const end=P.m.position.y+_pv.y<.03;
  if(P.kind==='shell'&&P.t%0.05<dt)emit(P.m.position,_up,1,[0x9a9490,0x6a6460],{speed:.3,spread:1,life:.5,size:.12,grav:-1});
  if(h||end||P.t>4){const pt=h?h.point:_tmp.copy(P.m.position).add(_pv).setY(Math.max(.05,P.m.position.y+_pv.y));
    if(P.kind==='shell'){P.on=false;P.m.visible=false;explosion(pt.clone().setY(Math.max(.4,pt.y)),4.4,wuDmg(P.w),{pdmg:22*DIFF().dmg});continue;}
    if(h&&h.object.userData.z){const z=h.object.userData.z;damageZombie(z,wuDmg(P.w),h.object.userData.part,h.point,_pn,h.object.userData.slot);P.on=false;P.m.visible=false;continue;}
    P.on=false;P.m.position.copy(pt).addScaledVector(_pn,-.18);P.stuck=6;if(h)surfaceHit(h,P.w,1);continue;}
  P.m.position.add(_pv);P.m.lookAt(_tmp.copy(P.m.position).add(P.v));}}
// --- burning zombies ---
function igniteZ(z,s){if(!z.burn)groan(z,'atk');z.burn=Math.max(z.burn||0,s);}
function flameDmg(z,d){if(z.dead||!z.alive)return;z.hp-=d*(S.dmgT>0?2:1)*(1+(ST42.dm||0)/100);z.flash=.05;if(z.hp<=0){_tmp.set(z.g.position.x-player.pos.x,0,z.g.position.z-player.pos.z).normalize();killZombie(z,_tmp.clone(),20,false);hitMarker('kill');}}
let burnTick=0;function updateBurn(dt){burnTick-=dt;const fxT=burnTick<=0;if(fxT)burnTick=.07;
  for(const z of zombies){if(!z.burn||!z.alive)continue;z.burn-=dt;if(z.dead){if(z.burn>1.2)z.burn=1.2;}else flameDmg(z,dt*16);
    if(fxT){const p=z.g.position,s=z.V.scale;flameP(p.x+rand(-.25,.25)*s,rand(.4,1.7)*s,p.z+rand(-.25,.25)*s,0,rand(.5,1.4),0,rand(.35,.6),.25*s,.6*s);if(Math.random()<.25)flameP(p.x,1.8*s,p.z,0,1,0,.9,.4,1.1,1);}
    if(!z.dead)z.mat.emissive.setHex(((game.time*12)|0)%2?0x5a2000:0x2a0c00);if(z.burn<=0){z.burn=0;if(!z.dead)z.mat.emissive.setHex(z.baseEm||0);}}}
// --- special weapon fire (returns true when handled) ---
function wSpecial(w){const K=w.kind;
  if(K==='sniper'){aimDir(aimSpread(w));ray.set(_org,_dir);ray.far=w.range;const hits=ray.intersectObjects(shootTargets(),false);let n=0;const end=_tmp.copy(_org).addScaledVector(_dir,w.range).clone(),done=new Set();
    for(const h of hits){const z=h.object.userData.z;if(z){if(done.has(z)||z.dead)continue;done.add(z);damageZombie(z,wuDmg(w)*(1-n*.2),h.object.userData.part,h.point,_dir,h.object.userData.slot);n++;if(n>=3){end.copy(h.point);break;}}else{end.copy(h.point);surfaceHit(h,w);break;}}
    tracer(_from,end,0xfff4d0,.022,.14);muzzleFx(w,.62,30);play('sniper');if(SET.vib&&navigator.vibrate)try{navigator.vibrate(30);}catch(e){}return true;}
  if(K==='bolt'){aimDir(aimSpread(w));launch('bolt',w);muzzleFx(w,.001,0);play('crossbow');return true;}
  if(K==='launcher'){aimDir(aimSpread(w));launch('shell',w);muzzleFx(w,.5,22);play('launcher');return true;}
  if(K==='flame'){aimDir(0);const o=_from;for(let i=0;i<3;i++){const sp=.12;_tmp.set(_dir.x+rand(-sp,sp),_dir.y+rand(-sp,sp)+.02,_dir.z+rand(-sp,sp)).normalize().multiplyScalar(rand(9,12));
      flameP(o.x+_dir.x*.25,o.y+_dir.y*.25,o.z+_dir.z*.25,_tmp.x+player.vel.x,_tmp.y,_tmp.z+player.vel.z,rand(.42,.6),.12,rand(.9,1.4));}
    if(Math.random()<.3)flameP(o.x+_dir.x*3,o.y+_dir.y*3+.3,o.z+_dir.z*3,_dir.x*3,1,_dir.z*3,1,.5,1.6,1);
    for(const z of zombies){if(!z.alive||z.dead)continue;_tmp.set(z.g.position.x-_org.x,1-_org.y,z.g.position.z-_org.z);const d=Math.hypot(_tmp.x,_tmp.z);if(d>w.range+.5*z.V.scale)continue;
      const c=(_tmp.x*_dir.x+_tmp.z*_dir.z)/(d*Math.hypot(_dir.x,_dir.z)+1e-6);if(c<(d<2?.5:.88))continue;flameDmg(z,wuDmg(w));igniteZ(z,3.2);if(Math.random()<.2)hitMarker('');}
    muzzleLight.color.setHex(0xff7a20);muzzleLight.intensity=14+Math.random()*10;muzzleLight.position.copy(_from);fx.shake+=w.shake;fx.vmKick=Math.min(.4,fx.vmKick+.08);
    if(!fx.flameOn){fx.flameOn=true;play('flameStart');}else if(Math.random()<.55)play('flame');
    if(mag[w.id]===0&&res[w.id]>0)setTimeout(()=>{if(WEAPONS[curW]===w&&game.state==='play')startReload();},120);return true;}
  return false;}
// --- scope / aim (ADS) ---
const ADS={on:false,hold:false,k:0};
function canADS(w){return !!(w&&!w.melee&&!w.tool);}
function setADS(v){const w=WEAPONS[curW];ADS.on=v&&canADS(w);$('adsBtn').classList.toggle('on',ADS.on);}
function updateADS(dt,w){if(!w)return;if(!canADS(w)||fx.reload>=0||fx.swap>.3)ADS.on=false;const want=ADS.on||ADS.hold&&canADS(w)&&fx.reload<0;ADS.k=damp(ADS.k,want?1:0,want?10:14,dt);
  const fov=75/(1+(((w.scope||1)-1)*ADS.k));if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}
  const sight=canADS(w)?(w.sight||'post'):'melee';document.body.dataset.sight=sight;document.body.classList.toggle('ads',ADS.k>.45);
  const sc=(sight==='optic'||sight==='glass'||sight==='bolt')&&ADS.k>.8;$('scope').style.opacity=sc?1:0;vmRoot.visible=!sc;$('cross').style.opacity=sc?0:1;
  const gap=(8+(fx.bloom||0)*240)*(1-ADS.k*.6);$('cross').style.setProperty('--gap',gap.toFixed(1)+'px');
  if(ADS.k>.01&&!sc){vmRoot.position.x=lerp(vmRoot.position.x,0,ADS.k*.92);vmRoot.position.y=lerp(vmRoot.position.y,-.115,ADS.k*.9);vmRoot.rotation.y*=1-ADS.k;}}
// --- weapon bar (owned weapons with 3D thumbnails) ---
function ownedList(){const L=[];WEAPONS.forEach((w,i)=>{if(own[w.id]&&(!w.tool||SV.on))L.push(i);});return L;}
let wbSig='';function renderWBar(){const L=ownedList(),sig=L.join(',')+'|'+curW+'|'+(THUMBS?1:0);if(sig===wbSig)return;wbSig=sig;const th=THUMBS||{};
  $('wbar').innerHTML=L.map((i,k)=>{const w=WEAPONS[i];return '<div class="ws'+(i===curW?' on':'')+'" data-i="'+i+'">'+(w.tool?'<b class="te">'+({axe:'🪓',pick:'⛏️',hammer:'🔨'})[w.tool]+'</b>':th[w.id]?'<img alt="" src="'+th[w.id]+'">':'<span>'+esc(w.name.split(' ')[0])+'</span>')+'<em>'+(k+1)+'</em></div>';}).join('');}
function wbTap(e){const s=e.target.closest&&e.target.closest('.ws');if(!s||game.state!=='play')return;if(e.cancelable)e.preventDefault();const i=+s.dataset.i;if(i!==curW){equip(i);toast(WEAPONS[i].name,700);}}
$('wbar').addEventListener('touchstart',wbTap,{passive:false});$('wbar').addEventListener('mousedown',e=>{e.stopPropagation();wbTap(e);});
// --- radar ---
const radar=$('radar'),rctx=radar.getContext('2d');let radT=0;
function drawRadar465(){const W=radar.width,H=radar.height,cx=W/2,cy=H/2,R=W/2-3,sc=R/HALF;rctx.clearRect(0,0,W,H);
  rctx.fillStyle='rgba(8,12,20,.55)';rctx.fillRect(0,0,W,H);
  const P=(x,z)=>[cx+x*sc,cy+z*sc];
  const C=window.CITY4319;rctx.strokeStyle='rgba(180,186,196,.85)';rctx.lineWidth=2;
  if(C){for(const rd of C.roads){const a=P(rd[0],rd[1]),b=P(rd[2],rd[3]);rctx.beginPath();rctx.moveTo(a[0],a[1]);rctx.lineTo(b[0],b[1]);rctx.stroke();}
    rctx.fillStyle='rgba(150,170,190,.9)';for(const q of C.plots){const a=P(q.x-q.w/2,q.z-q.d/2);rctx.fillRect(a[0],a[1],q.w*sc,q.d*sc);}}
  rctx.strokeStyle='rgba(160,164,170,.7)';rctx.lineWidth=1.5;rctx.beginPath();const n0=P(0,-HALF),n1=P(0,HALF),e0=P(-HALF,-24),e1=P(HALF,-24);rctx.moveTo(n0[0],n0[1]);rctx.lineTo(n1[0],n1[1]);rctx.moveTo(e0[0],e0[1]);rctx.lineTo(e1[0],e1[1]);rctx.stroke();
  if(SV.on){rctx.fillStyle='rgba(110,190,255,.9)';for(const p of PIECES)if(p.alive){const a=P(p.x,p.z);rctx.fillRect(a[0]-1,a[1]-1,2,2);}}
  for(const z of zombies)if(z.alive&&!z.dead){const a=P(z.g.position.x,z.g.position.z);rctx.fillStyle=z.V.name==='boss'?'#ff3020':'#ff5a4a';rctx.fillRect(a[0]-1.5,a[1]-1.5,3,3);}
  if(C&&C.tags){rctx.fillStyle='rgba(255,255,255,.9)';rctx.font='bold 8px sans-serif';rctx.textAlign='center';for(const t of C.tags){const a=P(t[1],t[2]);rctx.fillText(t[0],a[0],a[1]);}}
  const me=P(player.pos.x,player.pos.z),yaw=player.yaw;rctx.save();rctx.translate(me[0],me[1]);rctx.rotate(-yaw);rctx.fillStyle='#fff';rctx.beginPath();rctx.moveTo(0,-5);rctx.lineTo(3.5,4);rctx.lineTo(-3.5,4);rctx.closePath();rctx.fill();rctx.restore();
  rctx.fillStyle='rgba(255,255,255,.7)';rctx.font='bold 11px sans-serif';rctx.textAlign='center';rctx.fillText('N',cx,11);}
// v4.3.66 minimap: zoomed on the player, north-up, streets/buildings, view cone, zombie dots, framed
const RAD466={bg:null,city:null,ppm:2.4,err:0};
function radarBg466(C){const ext=HALF+8,ppm=RAD466.ppm,S=Math.ceil(ext*2*ppm),c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
  const X=x=>(x+ext)*ppm;g.fillStyle='#1b2420';g.fillRect(0,0,S,S);
  const pv=C.paving||{};
  g.fillStyle='#4a5052';for(const r of (pv.sidewalks||[]))g.fillRect(X(r.x0),X(r.z0),(r.x1-r.x0)*ppm,(r.z1-r.z0)*ppm);
  g.fillStyle='#7d8386';if(pv.roads&&pv.roads.length){for(const r of pv.roads)g.fillRect(X(r.x0),X(r.z0),(r.x1-r.x0)*ppm,(r.z1-r.z0)*ppm);}
  else{g.strokeStyle='#7d8386';g.lineWidth=7*ppm;g.lineCap='square';for(const rd of (C.roads||[])){g.beginPath();g.moveTo(X(rd[0]),X(rd[1]));g.lineTo(X(rd[2]),X(rd[3]));g.stroke();}}
  g.strokeStyle='rgba(230,215,150,.35)';g.lineWidth=1;g.setLineDash([4,5]);for(const rd of (C.roads||[])){g.beginPath();g.moveTo(X(rd[0]),X(rd[1]));g.lineTo(X(rd[2]),X(rd[3]));g.stroke();}g.setLineDash([]);
  for(const q of (C.plots||[])){const x=X(q.x-q.w/2),y=X(q.z-q.d/2),w=q.w*ppm,h=q.d*ppm;g.fillStyle='#2d3440';g.fillRect(x,y,w,h);g.fillStyle='#55657a';g.fillRect(x+1.5,y+1.5,w-3,h-3);g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);}
  RAD466.bg=c;RAD466.city=C;RAD466.ext=ext;}
function drawRadar(){try{drawRadar466();}catch(e){if(++RAD466.err>3)drawRadar465();else drawRadar465();}}
function drawRadar466(){const C=window.CITY4319;if(!C||!C.plots){drawRadar465();return;}
  const cw=radar.clientWidth||168,want=Math.min(400,Math.round(cw*Math.min(2,window.devicePixelRatio||1)));if(want>40&&Math.abs(radar.width-want)>4){radar.width=radar.height=want;}
  if(RAD466.city!==C||!RAD466.bg)radarBg466(C);
  const W=radar.width,H=radar.height,cx=W/2,cy=H/2,g=rctx,u=W/168,VIEW=58,sc=(W/2)/VIEW,k=sc/RAD466.ppm,ext=RAD466.ext;
  const px=player.pos.x,pz=player.pos.z;g.save();g.clearRect(0,0,W,H);
  const rr=10*u;g.beginPath();g.moveTo(rr,0);g.arcTo(W,0,W,H,rr);g.arcTo(W,H,0,H,rr);g.arcTo(0,H,0,0,rr);g.arcTo(0,0,W,0,rr);g.closePath();g.clip();
  g.fillStyle='#10161a';g.fillRect(0,0,W,H);g.globalAlpha=.95;
  g.drawImage(RAD466.bg,(px+ext)*RAD466.ppm-VIEW*RAD466.ppm,(pz+ext)*RAD466.ppm-VIEW*RAD466.ppm,VIEW*2*RAD466.ppm,VIEW*2*RAD466.ppm,0,0,W,H);g.globalAlpha=1;
  const P=(x,z)=>[cx+(x-px)*sc,cy+(z-pz)*sc];
  if(SV.on){g.fillStyle='rgba(110,190,255,.95)';for(const p of PIECES)if(p.alive){const a=P(p.x,p.z);g.fillRect(a[0]-1.5*u,a[1]-1.5*u,3*u,3*u);}}
  if(C.tags){g.font='bold '+Math.round(8.5*u)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3*u;g.strokeStyle='rgba(0,0,0,.75)';g.fillStyle='rgba(255,240,200,.95)';
    for(const t of C.tags){const a=P(t[1],t[2]);if(a[0]<-30||a[0]>W+30||a[1]<-10||a[1]>H+10)continue;g.strokeText(t[0],a[0],a[1]);g.fillText(t[0],a[0],a[1]);}}
  const yaw=player.yaw,me=[cx,cy];
  const cg=g.createRadialGradient(cx,cy,0,cx,cy,30*u);cg.addColorStop(0,'rgba(255,240,200,.45)');cg.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=cg;
  g.beginPath();g.moveTo(cx,cy);const a0=-Math.PI/2-yaw-.55,a1=-Math.PI/2-yaw+.55;g.arc(cx,cy,30*u,a0,a1);g.closePath();g.fill();
  for(const z of zombies)if(z.alive&&!z.dead){let a=P(z.g.position.x,z.g.position.z),edge=false;const dx=a[0]-cx,dy=a[1]-cy,m=Math.max(Math.abs(dx),Math.abs(dy)),lim=W/2-4*u;
    if(m>lim){if(m>lim*1.9)continue;a=[cx+dx*lim/m,cy+dy*lim/m];edge=true;}
    const boss=z.V.name==='boss',r=(boss?4:2.6)*u*(edge?.75:1);g.fillStyle=boss?'#ff2a1a':'#ff4a3a';g.globalAlpha=edge?.55:1;g.beginPath();g.arc(a[0],a[1],r,0,7);g.fill();
    if(!edge){g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=1*u;g.stroke();}g.globalAlpha=1;}
  g.save();g.translate(me[0],me[1]);g.rotate(-yaw);g.fillStyle='#ffffff';g.strokeStyle='#000';g.lineWidth=1.4*u;g.beginPath();g.moveTo(0,-7*u);g.lineTo(5*u,5.5*u);g.lineTo(0,3*u);g.lineTo(-5*u,5.5*u);g.closePath();g.fill();g.stroke();g.restore();
  g.restore();
  g.strokeStyle='rgba(255,215,150,.75)';g.lineWidth=2*u;g.beginPath();g.moveTo(rr,1*u);g.arcTo(W-1*u,1*u,W-1*u,H-1*u,rr);g.arcTo(W-1*u,H-1*u,1*u,H-1*u,rr);g.arcTo(1*u,H-1*u,1*u,1*u,rr);g.arcTo(1*u,1*u,W-1*u,1*u,rr);g.closePath();g.stroke();
  g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.arc(cx,9*u,7*u,0,7);g.fill();g.fillStyle='#ffd27a';g.font='bold '+Math.round(10*u)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('N',cx,9.5*u);}

// ---------- v4 (same mechanism/format as the v3 hotfix, KILLS ONLY; w = day reached (>=1, bot requires w>=1)): save score to the bot from any launch mode ----------
// sendData() works only when the Mini App was opened from the reply-keyboard button (then initData is EMPTY);
// from the inline button / menu button / Main Mini App it does nothing. There we open a signed /start deep link.
const SCORE_BOT='Zombie_SurvivalGame_bot',SCORE_SALT='zs-score-2026';let curPendR=null;
function rnd8(){const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',a=new Uint8Array(8);try{crypto.getRandomValues(a);}catch(e){for(let i=0;i<8;i++)a[i]=Math.random()*256;}let r='';for(const x of a)r+=c[x%62];return r;}
function pend(){const q=LS.get('zs_pend',[]),ws=weekStart();return Array.isArray(q)?q.filter(x=>x&&Math.abs(x.wk-ws)<36e5&&x.k>=0):[];}
function queueScore(){try{if((game.kills|0)<=0)return null;const q=pend();let p=curPendR&&q.find(x=>x.r===curPendR);
  if(!p){p={r:rnd8()};q.push(p);curPendR=p.r;}Object.assign(p,{k:game.kills|0,w:Math.max(1,SV.day|0),n:(SV.streak|0),s:Math.round(S.score)||0,d:SET.diff,wk:weekStart()});
  LS.set('zs_pend',q.slice(-6));updPend();return p;}catch(e){return null;}}
function bestPend(){const q=pend();return q.sort((a,b)=>b.k-a.k||b.w-a.w)[0]||null;}
function scoreLink(p){const d1={facile:'f',normale:'n',difficile:'x'}[p.d]||'n',body=p.k+'_'+p.w+'_'+p.s+'_'+d1+'_'+p.r;return 'https://t.me/'+SCORE_BOT+'?start=sc_'+body+'_'+sha256hex(SCORE_SALT+body).slice(0,8);}
function flushScores(manual,pp){const p=pp||bestPend();if(!p){if(manual)mtoast('Nessun punteggio da salvare');return false;}
  const W=TG.W;let ok=false;
  try{if(W&&!W.initData&&W.sendData){const q=pend().filter(x=>x.r!==p.r);LS.set('zs_pend',q);markSent(p);W.sendData(JSON.stringify({t:'zs_score',k:p.k,w:p.w,n:p.n,s:p.s,d:p.d,wk:p.wk,r:p.r}));ok=true;}
   else if(W&&W.openTelegramLink){const q=pend().filter(x=>x.r!==p.r);LS.set('zs_pend',q);markSent(p);mtoast('💾 Salvo il punteggio nel bot…',1500);W.openTelegramLink(scoreLink(p));ok=true;}
   else if(manual){window.open(scoreLink(p),'_blank');ok=true;}}catch(e){if(manual)mtoast('Invio non riuscito, riprova');}
  updPend();return ok;}
function markSent(p){const b=LS.get('zs_sent',{}),ws=weekStart();const o=Math.abs((b.wk||0)-ws)<36e5?b:{wk:ws,k:-1,w:-1};o.k=Math.max(o.k,p.k);o.w=Math.max(o.w,p.w);LS.set('zs_sent',o);}
// auto-send only when the run beats what this player already sent this week (kills or wave), so normal runs don't leave the game
function scoreAfterRun(){try{if(!TG.W)return;const q=pend();const p=(curPendR&&q.find(x=>x.r===curPendR))||q.find(x=>x.k>0);if(p&&p.k>0)flushScores(false,p);}catch(e){}}
function updPend(){const el=$('menuBest');if(!el)return;const o=el.querySelector('.pendL');if(o)o.remove();return;const p=bestPend();if(!p)return;
  const a=document.createElement('span');a.className='pendL';a.textContent='💾 Punteggio da salvare: '+p.k+' 🧟 — tocca qui';a.addEventListener('click',e=>{e.stopPropagation();flushScores(true);});el.appendChild(a);}
{const _sb=showBest;showBest=function(){_sb.apply(this,arguments);updPend();};}

// ======================= v4 SURVIVAL: state, resources, nodes, loot =======================
var SV={on:false,day:1,clock:0,phase:'day',pt:0,streak:0,total:0,horde:0,spawnT:0,saveT:0,bossDone:false,tools:{axe:0,pick:0,hammer:0},chest:{},build:null,rot:0,mode:'',lastPhase:'',gems:0,nightKills:0};
const DAYLEN={day:420,dusk:60,night:180,dawn:60},CYCLE=720,PH_ORDER=['day','dusk','night','dawn'];
const RES={wood:{n:'Legna',i:'🪵',c:'#e0a060'},stone:{n:'Pietra',i:'🪨',c:'#c8ccd4'},iron:{n:'Ferro',i:'⛓️',c:'#b8c8e0'},coal:{n:'Carbone',i:'⚫',c:'#9a9a9a'},metal:{n:'Metallo',i:'🔩',c:'#bfdcff'},elec:{n:'Componenti',i:'💡',c:'#7dff9a'}};
const RES_K=Object.keys(RES);for(const k of RES_K)if(!(k in inv))inv[k]=0;
const URLQ4=new URLSearchParams(location.search);
function bagCap(){return owns('e_backpack')||PROF.trial==='e_backpack'?120:60;}
function bagCount(){let n=0;for(const k of RES_K)n+=inv[k]|0;return n;}
function addRes(k,n,silent){if(SV.on){const free=bagCap()-bagCount();if(free<=0){if(!silent){toast('🎒 Zaino pieno! Deposita nella cassa',1400);}return 0;}n=Math.min(n,free);}
  inv[k]=(inv[k]|0)+n;if(!silent&&n>0)floatText('+'+n+' '+RES[k].i+' '+RES[k].n,RES[k].c);return n;}
function phaseAt(c){let a=0;for(const p of PH_ORDER){if(c<a+DAYLEN[p])return [p,(c-a)/DAYLEN[p]];a+=DAYLEN[p];}return ['dawn',1];}
function nightF(){if(!SV.on)return 0;const p=SV.phase,k=SV.pt;return p==='night'?1:p==='dusk'?smooth(k):p==='dawn'?1-smooth(k):0;}
function smooth(k){return k*k*(3-2*k);}
function clockTxt(){const c=SV.clock;let h=(6+c/CYCLE*24)%24;const H=Math.floor(h),M=Math.floor((h-H)*60/10)*10;return String(H).padStart(2,'0')+':'+String(M).padStart(2,'0');}
// ---- harvest nodes ----
const nodeOf=new Map();for(const n of NODES)for(const p of n.parts){if(!nodeOf.has(p.im))nodeOf.set(p.im,[]);nodeOf.get(p.im)[p.idx]=n;}
const _ax=new T.Vector3(),_qt=new T.Quaternion(),_qy=new T.Quaternion(),_ns=new T.Vector3(),_npos=new T.Vector3();
nodeWrite=function(n){const s=n.s*(n.grow<1?Math.max(.01,n.grow):1);_qy.setFromAxisAngle(_up,n.rot);const tl=n.tilt+(n.shake>0?Math.sin(n.shake*40)*n.shake*.12:0);
  _ax.set(n.tdz,0,-n.tdx);if(_ax.lengthSq()<1e-6)_ax.set(1,0,0);_ax.normalize();_qt.setFromAxisAngle(_ax,tl).multiply(_qy);_nm.compose(_npos.set(n.x,n.sink||0,n.z),_qt,_ns.set(s,s,s));
  for(const p of n.parts){if(!n.alive)p.im.setMatrixAt(p.idx,ZERO_M);else{_nm2.multiplyMatrices(_nm,p.local);p.im.setMatrixAt(p.idx,_nm2);}p.im.instanceMatrix.needsUpdate=true;}};
for(const n of NODES)nodeWrite(n);
let shadowDirty=0;function bakeShadows(){shadowDirty=.25;}
function nodeInFront(range){let best=null,bd=1e9;const fx_=-Math.sin(player.yaw),fz_=-Math.cos(player.yaw);
  for(const n of NODES){if(!n.alive||n.falling)continue;const dx=n.x-player.pos.x,dz=n.z-player.pos.z,d=Math.hypot(dx,dz)-n.r;if(d>range)continue;const c=(dx*fx_+dz*fz_)/(Math.hypot(dx,dz)+1e-6);if(c<.5)continue;if(d<bd){bd=d;best=n;}}return best;}
function toolTier(w){return SV.tools[w.tool]|0;}
function toolName(w){return w.name+' '+TIER_N[toolTier(w)];}
function setToolLook(){for(const k of ['axe','pick','hammer']){const t=SV.tools[k]|0;for(const h of VM[k].userData.heads)h.material=toolHead[t];}}
let harvShow=0;
function toolHit(w){const tier=toolTier(w);svNoise(player.pos.x,player.pos.z,9);
  if(w.tool==='hammer'){const pc=pieceInFront(3.2);if(pc){repairPiece(pc);return true;}return false;}
  const n=nodeInFront(1.9);if(!n)return false;const want=n.type==='rock'?'pick':'axe';
  if(w.tool!==want){fx.slash=1;play('thud');toast(n.type==='rock'?'⛏️ Serve il piccone per la pietra':'🪓 Serve l\'ascia per la legna',1100);return true;}if(n.type!=='rock'&&n.grow<.62){fx.slash=1;play('thud');toast('🌱 È ancora un germoglio',900);return true;}
  fx.slash=1;n.shake=1;const need=Math.ceil(n.need*[1,.72,.5][tier]);n.prog++;harvShow=2.2;
  const hp=_tmp.set(n.x-(n.x-player.pos.x)*.25,n.type==='rock'?.5:1.1,n.z-(n.z-player.pos.z)*.25).clone();_n.set(player.pos.x-n.x,0,player.pos.z-n.z).normalize();
  if(n.type==='rock'){play('mine');emit(hp,_n,10,[0x8a8e96,0xb8bcc4,0xffffff,0x5a5e66],{speed:3.5,spread:.9,life:.5,size:.05,grav:12});emit(hp,_up,3,[0xfff2b0,0xffc040],{speed:4,spread:.8,life:.2,size:.02,grav:12,stretch:3});
    let got=addRes('stone',1+(tier>=2?1:0));if(Math.random()<[.1,.17,.26][tier])addRes('iron',1);if(Math.random()<.16)addRes('coal',1);}
  else{play('chop');emit(hp,_n,9,[0x8a5a2b,0xc8a070,0x5a3a1e],{speed:3,spread:.8,life:.55,size:.05,grav:10});if(n.type==='pine')emit(_tmp.set(n.x,3.2*n.s,n.z),_up,8,[0xffffff,0xe8eef8],{speed:1.2,spread:1,life:1.2,size:.07,grav:2});
    addRes('wood',1+(tier>=1&&Math.random()<.5?1:0)+(tier>=2?1:0));}
  fx.shake+=.18;if(n.prog>=need){n.prog=0;n.regrow=n.type==='rock'?240:480;
    if(n.type==='rock'){play('rockBreak');emit(_tmp.set(n.x,.5,n.z),_up,24,[0x8a8e96,0x6a6e78,0xeef2f8],{speed:4,spread:1,life:.7,size:.09,grav:10});addRes('stone',2);n.alive=false;n.circle.off=true;nodeWrite(n);bakeShadows();}
    else{play('timber');n.falling=1e-4;n.tdx=n.x-player.pos.x;n.tdz=n.z-player.pos.z;const l=Math.hypot(n.tdx,n.tdz)||1;n.tdx/=l;n.tdz/=l;n.circle.off=true;addRes('wood',2+tier);}}
  updateHUD();return true;}
function updateNodes(dt){for(const n of NODES){let ch=false;
  if(n.shake>0){n.shake=Math.max(0,n.shake-dt*3);ch=true;}
  if(n.falling){n.falling+=dt;const k=Math.min(1,n.falling/1.3);n.tilt=k*k*1.5;if(n.falling>1.3&&!n.landed){n.landed=true;fx.shake+=.3;emit(_tmp.set(n.x+n.tdx*3,.2,n.z+n.tdz*3),_up,20,[0xffffff,0xe8eef8],{speed:2.5,spread:1,life:1,size:.1,grav:3});}
    if(n.falling>2.4)n.sink=-(n.falling-2.4)*1.2;if(n.falling>3.4){n.falling=0;n.landed=false;n.tilt=0;n.sink=0;n.alive=false;bakeShadows();}ch=true;}
  else if(!n.alive){if(n.lot441){n.circle.off=true;}else if(n.blocked){n._bc=(n._bc>0?n._bc:1.4)-dt;if(n._bc<=0){n._bc=1.4;if(!buildCovers28(n.x,n.z,nodeRad28(n)))freeNode28(n);}}else{n.regrow-=dt;if(n.regrow<=0&&Math.hypot(n.x-player.pos.x,n.z-player.pos.z)>9){if(buildCovers28(n.x,n.z,nodeRad28(n)))buryNode28(n,true);else{n.alive=true;n.grow=.02;n.circle.off=false;ch=true;}}}}
  else if(n.grow<1){n.grow=Math.min(1,n.grow+dt*.07);ch=true;if(n.grow>=1)bakeShadows();}
  if(ch)nodeWrite(n);}}
function resetNodes(){for(const n of NODES){if(n.lot441){n.alive=false;n.blocked=0;n.circle.off=true;n.regrow=1e9;nodeWrite(n);continue;}n.alive=true;n.blocked=0;n.grow=1;n.tilt=0;n.sink=0;n.falling=0;n.prog=0;n.shake=0;n.circle.off=false;nodeWrite(n);}bakeShadows();}
// ---- loot crates (houses + scattered), refilled at dawn ----
const lootBody=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:0x4d5a32}),24),lootLid=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:0x5d6a3a}),24),lootBand=new T.InstancedMesh(G.box,new T.MeshBasicMaterial({color:0xffc23a}),24);
for(const m of [lootBody,lootLid,lootBand]){m.castShadow=false;m.frustumCulled=false;m.count=0;scene.add(m);}
const LOOT=[];
{const spots=HOUSE_RECTS.map(h=>[h[0]+rand(-.8,.8),h[1]+rand(-.6,.6)]);let t=0;while(spots.length<22&&t<500){t++;const s=randFree(.8,0);if(Math.hypot(s.x,s.z)>8)spots.push([s.x,s.z]);}
 spots.slice(0,24).forEach(([x,z],i)=>{LOOT.push({x,z,i,open:false,rot:rand(0,3)});});lootBody.count=lootLid.count=lootBand.count=LOOT.length;LOOT.forEach(lootWrite);}
function lootWrite(c){const show=SV.on;_no.position.set(c.x,.26,c.z);_no.rotation.set(0,c.rot,0);_no.scale.set(.9,.52,.56);_no.updateMatrix();lootBody.setMatrixAt(c.i,show?_no.matrix:ZERO_M);
  _no.position.set(c.x,.55,c.z);_no.scale.set(.94,.08,.6);if(c.open){_no.rotation.set(0,c.rot,0);_no.translateZ(-.3);_no.translateY(.25);_no.rotateX(-1.2);}_no.updateMatrix();lootLid.setMatrixAt(c.i,show?_no.matrix:ZERO_M);
  _no.position.set(c.x,.3,c.z);_no.rotation.set(0,c.rot,0);_no.scale.set(.92,.1,.58);_no.updateMatrix();lootBand.setMatrixAt(c.i,show&&!c.open?_no.matrix:ZERO_M);
  for(const m of [lootBody,lootLid,lootBand])m.instanceMatrix.needsUpdate=true;}
function refillLoot(){for(const c of LOOT){c.open=false;lootWrite(c);}}
function openLoot(c){c.open=true;lootWrite(c);play('door');const got=[];const r=Math.random;
  const guns=WEAPONS.filter(w=>own[w.id]&&!w.melee);if(guns.length&&r()<.75){const w=guns[(r()*guns.length)|0];const light=w.id==='pistol'||w.id==='revolver'||w.id==='shotgun'||w.id==='dbarrel'||w.id==='saw';const n=light?Math.max(2,Math.round(w.mag*.5)):Math.max(1,Math.round((w.mag||4)*.2));res[w.id]=Math.min(w.maxReserve,(res[w.id]|0)+n);got.push('+'+n+' colpi '+w.name);}
  if(r()<.45){const h=Math.min(player.maxHp-player.hp,40);player.hp+=h;got.push('🩹 Kit medico +'+Math.round(h)+'❤️');}
  const mats=[['wood',2,4],['stone',1,3],['metal',1,2],['elec',0,1],['iron',0,1],['coal',0,2]];for(const [k,a,b] of mats){if(r()<.55){const n=a+Math.floor(r()*(b-a+1));if(n>0){const g=addRes(k,n,true);if(g)got.push('+'+g+' '+RES[k].i);}}}
  if(r()<.25&&S.nades<NADE_MAX){S.nades++;got.push('+1 💣');}
  if(!got.length)got.push('+2 '+RES.wood.i),addRes('wood',2,true);
  floatText(got.slice(0,3).join(' · '),'#ffd27a');if(got.length>3)setTimeout(()=>floatText(got.slice(3).join(' · '),'#ffd27a'),400);play('pickup',3);updateHUD();}

// ======================= v4 SURVIVAL: grid building =======================
const PIECE_MAX=120,CHEST_MAX=3;
const PDEF={
 wall:{n:'Muro',i:'🧱',cost:{wood:4,stone:2},hp:320,edge:1,box:[2,.34],parts:[['stone',0,.25,0,2,.5,.34],['plank',0,1.42,0,1.96,1.86,.24],['wood',-.94,1.3,0,.16,2.6,.32],['wood',.94,1.3,0,.16,2.6,.32],['wood',0,2.56,0,2.04,.14,.32],['wood',0,1.4,.13,1.8,.1,.05,0,0,.62]]},
 door:{n:'Porta',i:'🚪',cost:{wood:6},hp:240,edge:1,box:[2,.3],door:1,parts:[['wood',-.92,1.3,0,.18,2.6,.3],['wood',.92,1.3,0,.18,2.6,.3],['wood',0,2.5,0,2,.22,.3],['stone',0,.04,0,2,.08,.34]],panel:[['plank',.83,1.17,0,1.64,2.3,.12],['wood',.83,.6,.07,1.5,.1,.04],['wood',.83,1.75,.07,1.5,.1,.04],['metal',1.45,1.15,.1,.06,.16,.06]]},
 window:{n:'Finestra',i:'🪟',cost:{wood:3,stone:1},hp:220,edge:1,box:[2,.32],parts:[['stone',0,.25,0,2,.5,.34],['plank',0,.78,0,1.96,.56,.24],['plank',0,2.28,0,1.96,.64,.24],['plank',-.72,1.53,0,.52,.94,.24],['plank',.72,1.53,0,.52,.94,.24],['wood',0,1.06,0,1.04,.08,.36],['wood',0,1.53,0,.06,.94,.1],['wood',0,1.53,0,.94,.06,.1],['wood',-.94,1.3,0,.16,2.6,.32],['wood',.94,1.3,0,.16,2.6,.32]],win:1,panel:[['wood',.235,1.53,-.03,.46,.92,.05,0,0,0,-.47,-1.5,.15],['wood',-.235,1.53,-.03,.46,.92,.05,0,0,0,.47,1.5,.15],['plank',.235,1.53,.0,.36,.8,.02,0,0,0,-.47,-1.5,.15],['plank',-.235,1.53,.0,.36,.8,.02,0,0,0,.47,1.5,.15]]},
 barricade:{n:'Barricata',i:'🪵',cost:{wood:3},hp:200,edge:1,box:[2,.6],spike:1,parts:[['wood',-.45,.6,0,.14,1.5,.14,0,0,.75],['wood',-.45,.6,0,.14,1.5,.14,0,0,-.75],['wood',.45,.6,0,.14,1.5,.14,0,0,.75],['wood',.45,.6,0,.14,1.5,.14,0,0,-.75],['plank',0,.62,0,2.1,.22,.08],['wood',-.6,.55,-.35,.08,.08,.9,.9,0,0],['wood',0,.55,-.35,.08,.08,.9,.9,0,0],['wood',.6,.55,-.35,.08,.08,.9,.9,0,0]]},
 fond:{n:'Fondamenta',i:'⬛',cost:{stone:4},hp:520,cell:'f',parts:[['stone',0,.12,0,2,.24,2],['wood',0,.25,-.98,2,.04,.06],['wood',0,.25,.98,2,.04,.06]]},
 roof:{n:'Tetto',i:'🏠',cost:{wood:5},hp:220,cell:'r',parts:[['plank',0,2.68,0,2.1,.12,2.1],['wood',0,2.6,0,.12,.1,2.1],['wood',-.98,2.6,0,.1,.1,2.1],['wood',.98,2.6,0,.1,.1,2.1],['snow',0,2.76,0,2.06,.05,2.06]]},
 fire:{n:'Falò',i:'🔥',cost:{wood:2,stone:3},hp:150,cell:'o',circ:.55,fire:1,parts:[]},
 chest:{n:'Cassa deposito',i:'📦',cost:{wood:8},hp:280,cell:'o',box:[1.1,.72],chest:1,parts:[['crate',0,.38,0,1.1,.76,.72],['wood',0,.8,0,1.16,.1,.78],['metal',-.4,.4,0,.06,.8,.76],['metal',.4,.4,0,.06,.8,.76],['metal',0,.6,-.37,.16,.14,.04]]}};
for(let i=0;i<6;i++){const a=i/6*Math.PI*2;PDEF.fire.parts.push(['stone',Math.cos(a)*.42,.1,Math.sin(a)*.42,.24,.2,.24,0,a,0]);}
for(let i=0;i<3;i++)PDEF.fire.parts.push(['wood',0,.14,0,.8,.1,.1,0,i*1.05,.25],['dark',0,.05,0,.6,.04,.6]);
const PORDER=['wall','door','window','barricade','fond','roof','fire','chest'];
const PMATS={stone:MAT.stoneW,plank:MAT.plank,wood:MAT.wood,metal:MAT.metal,crate:MAT.crate,snow:MAT.snow,dark:new T.MeshLambertMaterial({color:0x1a1410})};
const POOL={};for(const k in PMATS){const n=k==='plank'||k==='wood'?900:k==='stone'?700:k==='metal'?420:200;const m=new T.InstancedMesh(G.box,PMATS[k],n);m.count=0;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;
  m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);scene.add(m);solids.push(m);POOL[k]={m,free:[],n:0,max:n,owner:[]};}
function pAlloc(k){const P=POOL[k];let i=P.free.pop();if(i===undefined){if(P.n>=P.max)return -1;i=P.n++;P.m.count=P.n;}return i;}
const _pw432=new T.Matrix4();function pUp432(m,i){const a=m.instanceMatrix,c=m.instanceColor;try{if(a.addUpdateRange){a.addUpdateRange(i*16,16);if(c)c.addUpdateRange(i*3,3);}}catch(e){}a.needsUpdate=true;if(c)c.needsUpdate=true;}
function pFree(k,i){const P=POOL[k];P.m.setMatrixAt(i,ZERO_M);pUp432(P.m,i);P.owner[i]=null;P.free.push(i);}
const PIECES=[];const _pm=new T.Matrix4(),_pl=new T.Matrix4(),_pc=new T.Color();
function partMatrix(base,pt,out){_no.position.set(pt[1],pt[2],pt[3]);_no.rotation.set(pt[7]||0,pt[8]||0,pt[9]||0);_no.scale.set(pt[4],pt[5],pt[6]);_no.updateMatrix();return out.multiplyMatrices(base,_no.matrix);}
function pieceBase(p){_no.position.set(p.x,0,p.z);_no.rotation.set(0,p.rot*Math.PI/2,0);_no.scale.set(1,1,1);_no.updateMatrix();return _pm.copy(_no.matrix);}
function pieceWrite(p){const D=PDEF[p.type];const base=pieceBase(p).clone();const dmg=p.hp/p.max,col=_pc.setRGB(lerp(.55,1,dmg),lerp(.42,1,dmg),lerp(.38,1,dmg));
  p.slots.forEach(s=>{const P=POOL[s.k];let M;if(s.panel){const hp=s.pt;_no.position.set(hp[10]!==undefined?hp[10]:-.83,0,hp[12]||0);_no.rotation.set(0,p.open?(hp[11]!==undefined?hp[11]:-1.45):0,0);_no.scale.set(1,1,1);_no.updateMatrix();_pl.multiplyMatrices(base,_no.matrix);M=partMatrix(_pl,s.pt,_pw432);}else M=partMatrix(base,s.pt,_pw432);
    P.m.setMatrixAt(s.i,M);P.m.setColorAt(s.i,col);pUp432(P.m,s.i);});}
function pieceBox(p){const D=PDEF[p.type];if(p.boxRef){const i=boxes.indexOf(p.boxRef);if(i>=0)boxes.splice(i,1);p.boxRef=null;}if(p.circ){const i=circles.indexOf(p.circ);if(i>=0)circles.splice(i,1);p.circ=null;}
  if(!p.alive)return;if(D.circ){p.circ={x:p.x,z:p.z,r:D.circ};circles.push(p.circ);return;}if(!D.box||(D.door&&p.open))return;
  const along=p.rot%2===0,w=D.box[0]/2,d=D.box[1]/2;p.boxRef=along?{x0:p.x-w,x1:p.x+w,z0:p.z-d,z1:p.z+d,piece:p}:{x0:p.x-d,x1:p.x+d,z0:p.z-w,z1:p.z+w,piece:p};boxes.push(p.boxRef);}
function snapPiece(type,px,pz,rot){const D=PDEF[type];if(D.edge){if(rot%2===0)return {x:Math.floor(px/2)*2+1,z:Math.round(pz/2)*2,rot:rot%4};return {x:Math.round(px/2)*2,z:Math.floor(pz/2)*2+1,rot:rot%4};}
  return {x:Math.floor(px/2)*2+1,z:Math.floor(pz/2)*2+1,rot:rot%4};}
function pieceKey(type,x,z,rot){const D=PDEF[type];return D.edge?'e:'+x+':'+z+':'+(rot%2):'c'+D.cell+':'+x+':'+z;}
function costOK(c){for(const k in c)if((inv[k]|0)<c[k])return false;return true;}
function costTxt(c){return Object.keys(c).map(k=>'<span class="'+((inv[k]|0)>=c[k]?'':'miss')+'">'+RES[k].i+c[k]+'</span>').join(' ');}
function placeCheck(type,s){const D=PDEF[type],key=pieceKey(type,s.x,s.z,s.rot);if(PIECES.some(p=>p.alive&&p.key===key))return 'Posto già occupato';
  if(PIECES.filter(p=>p.alive).length>=PIECE_MAX)return 'Limite pezzi raggiunto ('+PIECE_MAX+')';if(D.chest&&PIECES.filter(p=>p.alive&&p.type==='chest').length>=CHEST_MAX)return 'Massimo '+CHEST_MAX+' casse';
  if(D.cell==='o'&&PIECES.some(p=>p.alive&&PDEF[p.type].cell==='o'&&p.x===s.x&&p.z===s.z))return 'Posto già occupato';
  const L=HALF-2;if(Math.abs(s.x)>L||Math.abs(s.z)>L)return 'Troppo vicino al confine';
  let hw,hd;if(D.edge){hw=s.rot%2===0?1:.2;hd=s.rot%2===0?.2:1;}else{hw=D.cell==='o'?.55:1;hd=hw;}
  if(D.cell!=='r'){for(const b of boxes){if(b.piece)continue;if(s.x+hw>b.x0&&s.x-hw<b.x1&&s.z+hd>b.z0&&s.z-hd<b.z1)return 'Ostacolo nel mezzo';}
    for(const c of circles){if(c.off||c===player)continue;const cx=clamp(c.x,s.x-hw,s.x+hw),cz=clamp(c.z,s.z-hd,s.z+hd);if(Math.hypot(c.x-cx,c.z-cz)<c.r)return 'Ostacolo nel mezzo';}
    if(D.box||D.circ){const cx=clamp(player.pos.x,s.x-hw,s.x+hw),cz=clamp(player.pos.z,s.z-hd,s.z+hd);if(Math.hypot(player.pos.x-cx,player.pos.z-cz)<player.r+.05)return 'Spostati un po\'';}}
  if(D.cell==='r'&&!roofSup434(s.x,s.z))return 'Il tetto deve poggiare su muri o pilastri';
  if(!costOK(D.cost))return 'Risorse insufficienti';return '';}
function addPiece(type,x,z,rot,hp,open,silent){const D=PDEF[type];const p={type,x,z,rot,key:pieceKey(type,x,z,rot),max:D.hp,hp:hp||D.hp,alive:true,open:!!open,slots:[],cd:0};
  for(const pt of D.parts){const i=pAlloc(pt[0]);if(i<0)continue;p.slots.push({k:pt[0],i,pt});POOL[pt[0]].owner[i]=p;}
  if(D.panel)for(const pt of D.panel){const i=pAlloc(pt[0]);if(i<0)continue;p.slots.push({k:pt[0],i,pt,panel:1});POOL[pt[0]].owner[i]=p;}
  PIECES.push(p);pieceWrite(p);pieceBox(p);ai432Bump();if(!silent)bakeShadows();return p;}
function removePiece(p,silent){removePiece0(p,silent);if(!silent)try{roofCollapse434();}catch(e){}}
function removePiece0(p,silent){p.alive=false;ai432Bump();for(const s of p.slots)pFree(s.k,s.i);p.slots.length=0;pieceBox(p);const i=PIECES.indexOf(p);if(i>=0)PIECES.splice(i,1);for(const z of zombies)if(z.tgtPiece===p)z.tgtPiece=null;if(!silent)bakeShadows();}
function clearPieces(){while(PIECES.length)removePiece(PIECES[0],true);bakeShadows();}
function damagePiece(p,d){if(!p.alive)return;p.hp-=d;p.hit=.25;const c=_tmp.set(p.x,1.1,p.z);if(p.cd<=0){p.cd=.35;play(p.type==='fond'||p.type==='fire'?'mine':'thud');emit(c,_up,8,[0x8a5a2b,0xc8a070,0x6a6e78],{speed:3,spread:1,life:.5,size:.06,grav:10});}
  if(p.hp<=0){play('breakPiece');emit(c,_up,30,[0x8a5a2b,0x5a3a1e,0x9a9ea6,0xeef2f8],{speed:5,spread:1,life:.9,size:.1,grav:11,up:.4});fx.shake+=.25;feed('💥 <b>'+PDEF[p.type].n+'</b> distrutto');removePiece(p);clearTimeout(window.__sv432);window.__sv432=setTimeout(svSave,1200);}
  else if(((p.hp/p.max*10)|0)!==((p.hp+d)/p.max*10|0))pieceWrite(p);}
function svBlast(pos,R,dmg){if(!SV.on)return;for(const p of PIECES.slice()){const d=Math.hypot(p.x-pos.x,p.z-pos.z);if(d<R)damagePiece(p,dmg*(1-d/R*.6));}}
function pieceInFront(range){camera.updateMatrixWorld();camera.getWorldPosition(_org);_dir.set(0,0,-1).applyQuaternion(camera.quaternion);ray.set(_org,_dir);ray.far=range;
  const ms=Object.values(POOL).map(P=>P.m);const h=ray.intersectObjects(ms,false)[0];if(h){const P=Object.values(POOL).find(q=>q.m===h.object);const o=P&&P.owner[h.instanceId];if(o&&o.alive)return o;}
  let best=null,bd=range;const fx_=-Math.sin(player.yaw),fz_=-Math.cos(player.yaw);for(const p of PIECES){if(!p.alive||PDEF[p.type].cell==='r')continue;const dx=p.x-player.pos.x,dz=p.z-player.pos.z,d=Math.hypot(dx,dz);if(d<bd&&(dx*fx_+dz*fz_)/(d+1e-6)>.6){bd=d;best=p;}}return best;}
function repairPiece(p){fx.slash=1;const D=PDEF[p.type];if(p.hp>=p.max){play('hammer');toast(D.n+' · integro ('+p.max+'/'+p.max+')',900);return;}
  const k=D.cost.wood?'wood':'stone';if((inv[k]|0)<1){play('thud');toast('Serve 1 '+RES[k].i+' '+RES[k].n+' per riparare',1100);return;}
  inv[k]--;const add=p.max*[.25,.34,.45][SV.tools.hammer|0];p.hp=Math.min(p.max,p.hp+add);pieceWrite(p);play('hammer');emit(_tmp.set(p.x,1.2,p.z),_up,8,[0xffe0a0,0xffffff],{speed:2,spread:1,life:.4,size:.04,grav:6});
  floatText('🔨 '+D.n+' '+Math.round(p.hp/p.max*100)+'%','#9fe0ff');updateHUD();}
function toggleDoor(p){p.open=!p.open;ai432Bump();pieceWrite(p);pieceBox(p);play('door');bakeShadows();}
// ---- ghost preview ----
const ghostMat=new T.MeshBasicMaterial({color:0x6aff8a,transparent:true,opacity:.38,depthWrite:false}),ghost=new T.Group();ghost.visible=false;ghost.userData.dyn=1;scene.add(ghost);let ghostType='';
function buildGhost(type){ghost.clear();ghostType=type;const D=PDEF[type];for(const pt of D.parts.concat(D.panel||[])){const m=new T.Mesh(G.box,ghostMat);m.position.set(pt[1],pt[2],pt[3]);m.rotation.set(pt[7]||0,pt[8]||0,pt[9]||0);m.scale.set(pt[4],pt[5],pt[6]);m.userData.dyn=1;ghost.add(m);}
  if(D.fire){const m=new T.Mesh(G.box,ghostMat);m.scale.set(.9,.25,.9);m.position.y=.12;ghost.add(m);}}
function buildTarget(){const fx_=-Math.sin(player.yaw),fz_=-Math.cos(player.yaw);const pitch=player.pitch;let dist=clamp(1.62/Math.tan(Math.max(.18,-pitch+.0001)),2.2,5);if(SV.build&&PDEF[SV.build]&&PDEF[SV.build].cell==='r')dist=pitch>.03?clamp(1.0/Math.tan(pitch),1.1,6):pitch<-.03?clamp(1.62/Math.tan(-pitch),1.1,6):6;const px=player.pos.x+fx_*dist,pz=player.pos.z+fz_*dist;
  const auto=Math.abs(fz_)>Math.abs(fx_)?0:1;return snapPiece(SV.build,px,pz,(auto+SV.rot)%4);}
let ghostMsg='';function updateGhost(){if(!SV.build){ghost.visible=false;return;}if(ghostType!==SV.build)buildGhost(SV.build);const s=buildTarget();ghost.visible=true;ghost.position.set(s.x,.01,s.z);ghost.rotation.y=s.rot*Math.PI/2;
  {const gk=SV.build+'|'+s.x+'|'+s.z+'|'+s.rot+'|'+AI432.ver+'|'+Math.round(player.pos.x*4)+'|'+Math.round(player.pos.z*4)+'|'+costOK(PDEF[SV.build].cost);if(gk!==updateGhost.k||performance.now()-(updateGhost.kt||0)>500){updateGhost.k=gk;updateGhost.kt=performance.now();ghostMsg=placeCheck(SV.build,s);}}ghostMat.color.setHex(ghostMsg?0xff4a3a:0x6aff8a);ghostMat.opacity=ghostMsg?.3:.38+Math.sin(game.time*6)*.08;SV.tgt=s;SV.tgtType=SV.build;SV.tgtT=performance.now();const gm4=ghostMsg||PDEF[SV.build].n+' · tocca ✔ per piazzare';if(gm4!==updateGhost.m){updateGhost.m=gm4;$('bPlace').classList.toggle('off',!!ghostMsg);$('bMsg').textContent=gm4;}}
function placeBuild(){return placeBuild434();}
function placeBuild0(){if(!SV.build)return;svNoise(player.pos.x,player.pos.z,12);const s=build434Target(),msg=placeCheck(SV.build,s);if(msg){toast('⚠️ '+msg,1000);play('empty');return;}const D=PDEF[SV.build];for(const k in D.cost)inv[k]-=D.cost[k];
  const p=addPiece(SV.build,s.x,s.z,s.rot);play('place');fx.slash=1;emit(_tmp.set(s.x,.3,s.z),_up,14,[0xeef2f8,0xc8a070],{speed:2.2,spread:1,life:.6,size:.07,grav:4});renderBuildBar();updateHUD();if(D.fire)svFires();}
function demolish(){const p=pieceInFront(4);if(!p){toast('Guarda un pezzo da smontare',900);return;}const D=PDEF[p.type];for(const k in D.cost)addRes(k,Math.floor(D.cost[k]*.5*(p.hp/p.max)),true);removePiece(p);play('breakPiece');toast('♻️ '+D.n+' smontato (rimborso 50%)',1100);renderBuildBar();updateHUD();svFires();}
function renderBuildBar(){$('bList').innerHTML=PORDER.map(k=>{const D=PDEF[k];return '<button class="bp'+(SV.build===k?' on':'')+(costOK(D.cost)?'':' poor')+'" data-p="'+k+'"><i>'+D.i+'</i><b>'+D.n+'</b><small>'+costTxt(D.cost)+'</small></button>';}).join('');}
function setBuild(on,type){if(window.__arena454&&__arena454.on)return;if(on){SV.build=type||SV.build||'wall';const hi=WEAPONS.findIndex(w=>w.id==='hammer');if(curW!==hi)equip(hi,true);renderBuildBar();}else SV.build=null;document.body.classList.toggle('building',!!SV.build);ghost.visible=!!SV.build;if(!on)ghostType='';}
// ---- campfires: shared pooled light + flames + warmth ----
const fireLight=new T.PointLight(0xff8a3a,0,14,1.6);fireLight.position.set(0,-50,0);scene.add(fireLight);let fireList=[],fireTk=0;
function svFires(){fireList=PIECES.filter(p=>p.alive&&PDEF[p.type].fire);}
function updateFires(dt,t){fireTk-=dt;let near=null,nd=1e9;for(const f of fireList){const d=Math.hypot(f.x-player.pos.x,f.z-player.pos.z);if(d<nd){nd=d;near=f;}
    if(fireTk<=0&&d<40){flameP(f.x+rand(-.2,.2),.25,f.z+rand(-.2,.2),rand(-.15,.15),rand(.8,1.6),rand(-.15,.15),rand(.5,.8),.35,.9);if(Math.random()<.5)flameP(f.x,.6,f.z,rand(-.1,.1),1.2,rand(-.1,.1),rand(.6,1),.15,.3);if(Math.random()<.12)flameP(f.x,1.4,f.z,0,.8,0,1.6,.4,1.4,1);}}
  if(fireTk<=0)fireTk=.06;
  if(near&&nd<40){fireLight.position.set(near.x,1.1,near.z);fireLight.intensity=(10+Math.sin(t*17)*1.6+Math.sin(t*7.3)*1.2)*(.45+.55*nightF());}else fireLight.intensity=0;
  if(near&&nd<3.2&&player.hp<player.maxHp&&player.hp>0){player.hp=Math.min(player.maxHp,player.hp+dt*3.5);}}

// ======================= v4 SURVIVAL: day/night, horde, interactions, save =======================
const hemiL=scene.children.find(o=>o.isHemisphereLight);
// v4.1: torch = plain PointLight just ahead of the camera (the SpotLight cone rendered as a black half-disc on some mobile GPUs)
const flash=new T.PointLight(0xfff0d8,0,17,1.2);flash.position.set(0,.25,-.8);camera.add(flash);
const LDAY={hemi:1.0,sun:1.15,fog:new T.Color(0x939dac),near:12,far:98,sky:new T.Color(0xffffff),hc:new T.Color(0xc4d0e8),disc:.5},
 LDUSK={hemi:.6,sun:.7,fog:new T.Color(0x8a7078),near:8,far:72,sky:new T.Color(0xd0a0a0),hc:new T.Color(0xe0b0a0),disc:.7},
 LNIGHT={hemi:.2,sun:.08,fog:new T.Color(0x0c1220),near:4,far:33,sky:new T.Color(0x1c2436),hc:new T.Color(0x6a7cb0),disc:.12};
const _lc=new T.Color();
function mixL(a,b,k){scene.fog.color.copy(a.fog).lerp(b.fog,k);scene.fog.near=lerp(a.near,b.near,k);scene.fog.far=lerp(a.far,b.far,k);sky.material.color.copy(a.sky).lerp(b.sky,k);
  hemiL.intensity=lerp(a.hemi,b.hemi,k);hemiL.color.copy(a.hc).lerp(b.hc,k);sun.intensity=lerp(a.sun,b.sun,k);sunDisc.material.opacity=lerp(a.disc,b.disc,k);}
function applyLight(){if(!SV.on){mixL(LDAY,LDAY,0);flash.intensity=0;for(const L of lamps)L.mul=1;return;}const p=SV.phase,k=SV.pt;
  if(p==='day')mixL(LDAY,LDAY,0);else if(p==='dusk'){if(k<.5)mixL(LDAY,LDUSK,smooth(k*2));else mixL(LDUSK,LNIGHT,smooth(k*2-1));}else if(p==='night')mixL(LNIGHT,LNIGHT,0);else{if(k<.5)mixL(LNIGHT,LDUSK,smooth(k*2));else mixL(LDUSK,LDAY,smooth(k*2-1));}
  const nf=nightF();{const tgt=(p==='dawn'||p==='day')?0:(nf>.35?(nf-.35)/.65*12:0),now=performance.now(),dt=Math.min(.1,(now-(flash.userData.t||now))/1000);flash.userData.t=now;const cur=flash.intensity,st=12*dt/.5;flash.intensity=Math.abs(tgt-cur)<=st?tgt:cur+Math.sign(tgt-cur)*st;}for(const L of lamps)L.mul=.35+nf*1.1;}
// ---- day cycle + spawns ----
function svSpawnPos(r0,r1,cx,cz){for(let t=0;t<40;t++){const a=Math.random()*Math.PI*2,r=rand(r0,r1),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(Math.abs(x)>HALF-2||Math.abs(z)>HALF-2)continue;if(!freeSpot(x,z,.6))continue;if(Math.hypot(x-player.pos.x,z-player.pos.z)<(SV.phase==='day'||SV.phase==='dawn'?24:14))continue;return {x,z};}return null;}
let SPAWN_AT=null;
function baseCenter(){const L=PIECES.filter(p=>p.alive);if(!L.length)return null;let x=0,z=0;for(const p of L){x+=p.x;z+=p.z;}return {x:x/L.length,z:z/L.length,n:L.length};}
const DAY_HAUNT=[[-14,-40],[16,-38],[42,-38],[-38,10],[24,38],[-28,32],[34,10],[0,-26]];
function svSpawn(v,nearBase){const b=baseCenter();let sp=null;const wide=SV.phase==='day'||SV.phase==='dawn';
  if(wide&&Math.random()<.8){const h=DAY_HAUNT[(Math.random()*DAY_HAUNT.length)|0];const q=svSpawnPos(5,16,h[0],h[1]);if(q&&(!b||Math.hypot(q.x-b.x,q.z-b.z)>20))sp=q;}
  for(let t=0;t<6&&!sp;t++){const q=wide&&Math.random()<.7?svSpawnPos(26,HALF*1.2,0,0):svSpawnPos(24,44,player.pos.x,player.pos.z);if(q&&(!b||Math.hypot(q.x-b.x,q.z-b.z)>26))sp=q;}SPAWN_AT=sp;if(!SPAWN_AT)return false;
  const ok=spawnZombie(v);SPAWN_AT=null;if(!ok)return false;const z=LAST_Z;z.flee=0;z.tgtPiece=null;z.burn=0;z.retT=0;z.ai=null;z.wx=undefined;if(SV.phase==='day'||SV.phase==='dawn')z.speed*=.68;return true;}
function svMaxAlive(){const p=SV.phase;if(zsShow())return p==='night'?12:p==='dusk'?9:p==='dawn'?6:10;return p==='night'?(isTouch?9:11):p==='dusk'?6:p==='dawn'?4:6;}
function hordePlan(){const n=SV.day,D=DIFF();const tot=Math.round(Math.min(45,8+n*3)*D.cnt);const L=[];for(let i=0;i<tot;i++){const r=Math.random();L.push(r<Math.min(.32,.1+n*.03)?'runner':r<Math.min(.45,.3+n*.02)&&n>=2?'tank':r<.52&&n>=3?'bloater':'normal');}
  if(n%5===0)L.splice(Math.floor(L.length*.35),0,'boss');else if(typeof wk432On==='function'&&wk432On()&&n>=WEEKEND432.extraBossFrom)L.splice(Math.floor(L.length*.7),0,'boss');return L;}
function enterPhase(p,silent){SV.phase=p;if(silent)return;
  if(p==='dusk'){banner('IL SOLE TRAMONTA','Torna alla base · la notte '+SV.day+' sta arrivando','warn',3200);play('dusk');}
  if(p==='night'){SV.plan=hordePlan();SV.horde=SV.plan.length;SV.nightKills=0;SV.spawnT=2;banner('NOTTE '+SV.day,(SV.day%5===0?'☠ Arriva il Macellaio! · ':'')+'L\'orda si aggira nel buio · non farti vedere','danger',3200);play('warn');}
  if(p==='dawn'){SV.streak++;SV.total++;const g=SV.day%5===0?2:0;if(g)addGems(g,true);S.gemsRun+=0;const best=Math.max(SV.streak,LS.get('zc_best_surv',0)|0);LS.set('zc_best_surv',best);
    banner('NOTTE '+SV.day+' SUPERATA',(g?'+'+g+' 💎 · ':'')+'casse rifornite · record '+best+' notti','',3600);play('dawn');refillLoot();player.hp=Math.min(player.maxHp,player.hp+25);
    {let keep=svMaxAlive();for(const z of zombies)if(z.alive&&!z.dead&&z.V.name!=='boss'){if(keep>0&&z.ai!=='chase'){keep--;z.speed*=.75;continue;}z.flee=.001;}}}
  if(p==='day'){SV.day++;feed('☀️ <b>Giorno '+SV.day+'</b>');}
  svSave();updateHUD();}
function svWaves(dt){game.wave=Math.min(SV.day,12);SV.clock+=dt*(SV.speed||1);if(SV.clock>=CYCLE)SV.clock-=CYCLE;const [p,k]=phaseAt(SV.clock);SV.pt=k;if(p!==SV.phase)enterPhase(p);applyLight();
  SV.spawnT-=dt;const alive=aliveCount();
  if(SV.phase==='night'&&SV.plan&&SV.plan.length){if(SV.spawnT<=0&&alive<svMaxAlive()){const v=SV.plan[0];if(svSpawn(v,true)){SV.plan.shift();if(v==='boss')bossIntro2();}SV.spawnT=Math.max(.8,2.4-SV.day*.08)/DIFF().cnt;}}
  else if(SV.phase!=='night'&&SV.spawnT<=0){const dayApk=zsShow()&&(SV.phase==='day'||SV.phase==='dawn');SV.spawnT=SV.phase==='dusk'?3.5:dayApk?(alive<8?1.35:3):alive<4?2.2:5.5;if(alive<svMaxAlive())svSpawn(SV.phase==='dusk'&&Math.random()<.3?'runner':(dayApk&&Math.random()<.18?'runner':'normal'),SV.phase==='dusk');}
  SV.saveT-=dt;if(SV.saveT<=0){SV.saveT=30;svSave();}}
function bossIntro2(){bossIntro();$('bossName').textContent='☠ IL MACELLAIO · NOTTE '+SV.day;}
// zombie targeting: player if close, else nearest piece (at night)
const _st=new T.Vector3();var LAST_Z=null;
function pieceDist(p,x,z){const b=p.boxRef;if(b){const cx=clamp(x,b.x0,b.x1),cz=clamp(z,b.z0,b.z1);return Math.hypot(x-cx,z-cz);}return Math.max(0,Math.hypot(x-p.x,z-p.z)-(PDEF[p.type].circ||.5));}
function pieceNear(z){const p=z.tgtPiece;return !!(p&&p.alive&&pieceDist(p,z.g.position.x,z.g.position.z)<.55+.4*z.V.scale);}
function blockingPiece(z){let best=null,bd=.75+.4*z.V.scale;for(const p of PIECES){if(!p.alive||!p.boxRef&&!p.circ)continue;const d=pieceDist(p,z.g.position.x,z.g.position.z);if(d<bd){bd=d;best=p;}}return best;}
// ---- zombie senses / AI (v4.1): zombies wander; they chase only the player they see or hear; they hit structures ONLY when
// a piece physically blocks them while chasing/searching. No zombie targets the base by default (night horde included).
const SENSE={day:[15,6],dusk:[19,8],night:[27,11],dawn:[12,5]};
function losBlocked(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/1.1);for(let i=1;i<n;i++){const k=i/n,x=x0+(x1-x0)*k,z=z0+(z1-z0)*k;
    for(const h of HOUSE_RECTS)if(Math.abs(x-h[0])<h[2]-.6&&Math.abs(z-h[1])<h[3]-.6)return true;
    for(const p of PIECES){if(!p.alive||!p.boxRef||p.open)continue;const t=PDEF[p.type];if(!t.edge||p.type==='barricade')continue;const B=p.boxRef;if(x>B.x0&&x<B.x1&&z>B.z0&&z<B.z1)return true;}}return false;}
function wanderPt(z,cx,cz,r){const tries=zsShow()?20:12,clr=zsShow()?Math.max(.72,.55*((z.V&&z.V.scale)||1)):Math.max(.5,.42*((z.V&&z.V.scale)||1)+.1);for(let t=0;t<tries;t++){const a=Math.random()*Math.PI*2,rr=rand(r*.35,r),x=clamp(cx+Math.cos(a)*rr,-HALF+3,HALF-3),zz=clamp(cz+Math.sin(a)*rr,-HALF+3,HALF-3);if(freeSpot(x,zz,clr)){z.wx=x;z.wz=zz;return;}}z.wx=clamp(cx,-HALF+3,HALF-3);z.wz=clamp(cz,-HALF+3,HALF-3);}
function svNoise(x,zz,r){if(!SV.on)return;ai432Noise(x,zz,r);const in4=AI432.enc&&ai432Inside(x,zz);for(const z of zombies){if(!z.alive||z.dead||z.flee||z.ai==='chase')continue;if(in4&&ai437Hold(z))continue;if(Math.hypot(z.g.position.x-x,z.g.position.z-zz)<r){z.ai='search';z.sawP=0;z.lx=x+rand(-2,2);z.lz=zz+rand(-2,2);z.srT=rand(7,11);}}}
function svTarget(z){const P=z.g.position;if(z.flee){const dx=P.x-player.pos.x,dz=P.z-player.pos.z,d=Math.hypot(dx,dz)||1;if(d>30||z.flee>15){z.alive=false;z.g.visible=false;z.flee=0;S.boss===z&&(S.boss=null);return player.pos;}z.flee+=.016;z.tgtKind='point';z.spdMul=1;return _st.set(P.x+dx/d*8,0,P.z+dz/d*8);}
  const dP=Math.hypot(P.x-player.pos.x,P.z-player.pos.z),boss=z.V.name==='boss';
  if(!z.ai){z.ai=boss?'chase':'wander';z.senseT=0;wanderPt(z,P.x,P.z,16);}
  z.senseT-=.016;if(z.senseT<=0){z.senseT=.25+Math.random()*.1;const [sight,hear]=SENSE[SV.phase]||SENSE.day;const run=player.vel?Math.hypot(player.vel.x,player.vel.z)>4.5:false;
    let see=dP<sight&&!losBlocked(P.x,P.z,player.pos.x,player.pos.z)&&!ai437Seg(P);const a4=ai432Sense(z,dP,see);if(a4===null)see=see||dP<hear*(run?1.5:1);else see=see||a4;
    const bz4=boss&&!ai437Hold(z);if(see||bz4){if(see&&z.ai!=='chase')ai437Tell(z);z.ai='chase';z.sawP=1;z.lx=player.pos.x;z.lz=player.pos.z;z.lost=0;}
    else if(z.ai==='chase'){z.lost=(z.lost||0)+.3;if(z.lost>1.2){z.ai='search';z.srT=rand(8,12);if(ai437Hold(z))ai437Away(z);}}}
  if(z.ai==='chase'){z.lx=player.pos.x;z.lz=player.pos.z;}
  z.spdMul=z.ai==='wander'?.5:z.ai==='search'?.8:1;
  if((z.ai==='chase'||(z.ai==='search'&&z.sawP))&&ai432Aware(z)){const bp=dP>1.7&&bp4310(z);if(bp){z.tgtPiece=bp;z.tgtKind='piece';z.spdMul=1;return _st.set(bp.x,0,bp.z);}}
  z.tgtPiece=null;
  if(z.ai==='chase'){z.tgtKind='player';return player.pos;}
  if(z.ai==='search'&&ai437Hold(z)&&ai432Inside(z.lx,z.lz))ai437Away(z);
  if(z.ai==='search'){z.srT-=.016;if(z.srT<=0){z.ai='wander';z.sawP=0;wanderPt(z,P.x,P.z,18);}else{if(Math.hypot(P.x-z.lx,P.z-z.lz)<1.6){wanderPt(z,z.lx,z.lz,5);z.lx=z.wx;z.lz=z.wz;}z.tgtKind='point';return _st.set(z.lx,0,z.lz);}}
  if(z.wx===undefined||Math.hypot(P.x-z.wx,P.z-z.wz)<1.6||(z.stuck||0)>.3&&Math.random()<.05){const _b=baseCenter(),nearB=_b&&(Math.hypot(player.pos.x-_b.x,player.pos.z-_b.z)<14||ai432Inside(player.pos.x,player.pos.z)),n=SV.phase==='night'&&!AI432.enc&&!nearB&&Math.random()<.35;wanderPt(z,n?player.pos.x+rand(-25,25):P.x,n?player.pos.z+rand(-25,25):P.z,n?10:18);}
  z.tgtKind='point';return _st.set(z.wx,0,z.wz);}
let baseWarnT=-99;
function zAttackHit(z,d,sc){const V=z.V,tp=z.tgtPiece;const dp4=Math.hypot(z.g.position.x-player.pos.x,z.g.position.z-player.pos.z);if(SV.on&&dp4<V.reach*sc+.45&&!ai432Seg(z.g.position.x,z.g.position.z,player.pos.x,player.pos.z)){if(AI432.enc&&!ai432Inside(z.g.position.x,z.g.position.z)){ai437Prob('dmgThroughWall',z);return;}hurt((V.dmg+Math.min(10,SV.day))*DIFF().dmg);return;}if(tp&&tp.alive&&!ai432Aware(z)){z.tgtPiece=null;ai437Prob('baseAttackersUnaware',z);return;}if(tp&&tp.alive&&pieceDist(tp,z.g.position.x,z.g.position.z)<V.reach*sc+.3){const spk=!!(PDEF[tp.type]&&PDEF[tp.type].spike);damagePiece(tp,(V.dmg*.6+2+SV.day*.5)*DIFF().dmg*(V.heavy?2:1));if(spk&&z.alive)flameDmg(z,14);
    if(game.time-baseWarnT>25){baseWarnT=game.time;toast('🏠 La base è sotto attacco!',2200);play('warn');}return;}
  const dp=Math.hypot(z.g.position.x-player.pos.x,z.g.position.z-player.pos.z);if(dp<V.reach*sc+.45&&!(SV.on&&(ai432Seg(z.g.position.x,z.g.position.z,player.pos.x,player.pos.z)||AI432.enc&&!ai432Inside(z.g.position.x,z.g.position.z))))hurt((V.dmg+(SV.on?Math.min(10,SV.day):game.wave))*DIFF().dmg);}
// ---- interactions (E / ✋ button) ----
let svNearObj=null;
function svScanNear(){svNearObj=null;let bd=2.6;for(const c of LOOT){if(c.open)continue;const d=Math.hypot(c.x-player.pos.x,c.z-player.pos.z);if(d<bd){bd=d;svNearObj={k:'loot',o:c,t:'Apri cassa'};}}
  for(const p of PIECES){if(!p.alive)continue;const D=PDEF[p.type];if(!D.door&&!D.chest&&!D.win)continue;const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(d<(D.door||D.win?2.4:2.3)&&d<bd+.3){bd=d;svNearObj={k:D.door||D.win?'door':'chest',o:p,t:D.win?(p.open?'Chiudi finestra':'Apri finestra'):D.door?(p.open?'Chiudi porta':'Apri porta'):'Deposito'};}}
  return svNearObj;}
function svUse(){const n=svNearObj||svScanNear();if(!n)return false;if(n.k==='loot')openLoot(n.o);else if(n.k==='door')toggleDoor(n.o);else openChest();return true;}
// ---- chest UI ----
function openChest(){if(game.state!=='play')return;game.state='chest';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();renderChest();$('chestScreen').classList.remove('hidden');play('door');}
function closeChest(){$('chestScreen').classList.add('hidden');if(game.state==='chest'){game.state='play';last=performance.now();}if(!isTouch)lockPointer();svSave();}
function chestCap(){const n=Math.max(1,PIECES.filter(p=>p.alive&&p.type==='chest').length);let up=0;try{up=Math.min(6,P42.cu.chest|0);}catch(e){}return 200*n+up*200;}
function chestCount(){let n=0;for(const k of RES_K)n+=SV.chest[k]|0;return n;}
function renderChest(){$('chBag').textContent=bagCount()+'/'+bagCap();$('chBox').textContent=chestCount()+'/'+chestCap();const lv=Math.min(6,(P42.cu&&P42.cu.chest)|0);const el=$('chLv');if(el)el.textContent=lv?' · ampliato '+lv+'/6':'';
  $('chRows').innerHTML=RES_K.map(k=>'<div class="chRow"><span class="cI">'+RES[k].i+' '+RES[k].n+'</span><b>'+(inv[k]|0)+'</b><button class="act sm" data-dep="'+k+'"'+((inv[k]|0)?'':' disabled')+'>Deposita →</button><button class="act sm ghost" data-wd="'+k+'"'+((SV.chest[k]|0)?'':' disabled')+'>← Preleva</button><b>'+(SV.chest[k]|0)+'</b></div>').join('');}
function chestMove(k,dep){if(dep){const n=Math.min(inv[k]|0,chestCap()-chestCount());if(n<=0){toast('Cassa piena',900);return;}inv[k]-=n;SV.chest[k]=(SV.chest[k]|0)+n;}
  else{const n=Math.min(SV.chest[k]|0,bagCap()-bagCount());if(n<=0){toast('Zaino pieno',900);return;}SV.chest[k]-=n;inv[k]=(inv[k]|0)+n;}play('pickup',dep?1:2);renderChest();updateHUD();}
$('chRows').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.dep)chestMove(b.dataset.dep,true);else if(b.dataset.wd)chestMove(b.dataset.wd,false);});
$('chAll').addEventListener('click',()=>{for(const k of RES_K)if(inv[k])chestMove(k,true);});$('chClose').addEventListener('click',closeChest);
// ---- tool upgrades + survival recipes in Crafting ----
const TOOL_UP=[null,{stone:3,wood:2},{iron:3,wood:2,coal:1}];
function svCraftHTML(){let h='<div class="craftSec">🛠️ Attrezzi</div>';for(const k of ['axe','pick','hammer']){const w=WEAPONS.find(q=>q.id===k),t=SV.tools[k]|0,nx=TOOL_UP[t+1];
    h+='<div class="recipe"><div><div class="name">'+toolName(w)+'</div><div class="stats">'+(nx?'Migliora a '+w.name+' '+TIER_N[t+1]+' · '+(k==='hammer'?'riparazioni più efficaci':'raccolta più veloce e più risorse'):'Livello massimo ✔')+'</div>'+(nx?'<div class="cost">'+costTxt(nx)+'</div>':'')+'</div>'+(nx?'<button class="act" data-tool="'+k+'" '+(costOK(nx)?'':'disabled')+'>Migliora</button>':'')+'</div>';}
  h+='<div class="recipe"><div><div class="name">🩹 Bende</div><div class="stats">+40 salute</div><div class="cost">'+costTxt({wood:2,coal:1})+'</div></div><button class="act" data-sv="band" '+(costOK({wood:2,coal:1})?'':'disabled')+'>Crea</button></div>';
  h+='<div class="recipe"><div><div class="name">🔩 Metallo dal ferro</div><div class="stats">Fondi 2 ferro + 1 carbone → 2 metallo</div><div class="cost">'+costTxt({iron:2,coal:1})+'</div></div><button class="act" data-sv="metal" '+(costOK({iron:2,coal:1})?'':'disabled')+'>Fondi</button></div>';
  return h+'<div class="craftSec">🔫 Armi</div>';}
function svCraftClick(b){if(b.dataset.tool){const k=b.dataset.tool,t=SV.tools[k]|0,c=TOOL_UP[t+1];if(!c||!costOK(c))return;for(const r in c)inv[r]-=c[r];SV.tools[k]=t+1;setToolLook();play('craft');toast('🛠️ '+toolName(WEAPONS.find(q=>q.id===k))+'!',1500);}
  else if(b.dataset.sv==='band'){if(!costOK({wood:2,coal:1}))return;inv.wood-=2;inv.coal--;player.hp=Math.min(player.maxHp,player.hp+40);play('craft');}
  else if(b.dataset.sv==='metal'){if(!costOK({iron:2,coal:1}))return;inv.iron-=2;inv.coal--;inv.metal+=2;play('craft');}renderCraft();updateHUD();}
// ---- save / load ----
const SV_KEY=NEXT_CITY?'zc_surv_city2':'zc_surv';
function svSnapshot(){return {v:1,day:SV.day,clock:Math.round(SV.clock),streak:SV.streak,total:SV.total,kills:game.kills,pos:[+player.pos.x.toFixed(1),+player.pos.z.toFixed(1),+player.yaw.toFixed(2)],hp:Math.round(player.hp),
  inv:Object.fromEntries(RES_K.map(k=>[k,inv[k]|0])),chest:Object.fromEntries(RES_K.map(k=>[k,SV.chest[k]|0])),tools:SV.tools,nades:S.nades,
  w:WEAPONS.filter(w=>own[w.id]&&!w.tool&&!w.shop&&w.id!=='knife'&&!ownerHere449()).map(w=>[w.id,mag[w.id],res[w.id]]),pc:PIECES.filter(p=>p.alive).map(p=>[PORDER.indexOf(p.type),p.x,p.z,p.rot,Math.round(p.hp),p.open?1:0]),
  nd:NODES.map((n,i)=>n.alive?0:[i,Math.round(n.regrow)]).filter(x=>x),lo:LOOT.map(c=>c.open?1:0).join(''),diff:SET.diff,t:Date.now()};}
let cloudSvTO=null;function svSave(){if(!SV.on||player.hp<=0)return;const s=svSnapshot();LS.set(SV_KEY,s);
  if(cloudOK()){clearTimeout(cloudSvTO);cloudSvTO=setTimeout(()=>{try{const j=JSON.stringify(s);if(j.length<4000)TG.W.CloudStorage.setItem(SV_KEY,j,()=>{});}catch(e){}},4000);}}
function svLoadData(){const s=LS.get(SV_KEY,null);return s&&s.v===1?s:null;}
function svCloudPull(){if(!cloudOK())return;try{TG.W.CloudStorage.getItem(SV_KEY,(e,v)=>{if(e||!v)return;try{const c=JSON.parse(v),l=svLoadData();if(c&&c.v===1&&(!l||c.t>l.t)){LS.set(SV_KEY,c);svMenuInfo();}}catch(_){}});}catch(e){}}
function svApply(s){map458Preserve(s);SV.day=s.day||1;SV.clock=s.clock||0;SV.streak=s.streak|0;SV.total=s.total|0;game.kills=0;player.pos.set(s.pos[0],0,s.pos[1]);player.yaw=player.tYaw=s.pos[2]||0;player.hp=clamp(s.hp||player.maxHp,20,player.maxHp);
  for(const k of RES_K){inv[k]=(s.inv&&s.inv[k])|0;SV.chest[k]=(s.chest&&s.chest[k])|0;}SV.tools=Object.assign({axe:0,pick:0,hammer:0},s.tools||{});S.nades=Math.max(S.nades,s.nades|0);
  for(const [id,m,r] of (s.w||[])){if(!(id in own))continue;own[id]=true;mag[id]=m|0;res[id]=r|0;}
  for(const q of (s.pc||[])){const t=PORDER[q[0]];if(t)addPiece(t,q[1],q[2],q[3],q[4],q[5],true);}try{B434.load={salvati:(s.pc||[]).length,caricati:PIECES.filter(p=>p.alive).length};}catch(e){}
  for(const [i,r] of (s.nd||[])){const n=NODES[i];if(!n)continue;n.alive=false;n.regrow=r;n.circle.off=true;nodeWrite(n);}
  const lo=String(s.lo||'');LOOT.forEach((c,i)=>{c.open=lo[i]==='1';lootWrite(c);});const [p,k]=phaseAt(SV.clock);SV.phase=p;SV.pt=k;if(p==='night'){SV.plan=hordePlan().slice(Math.floor(hordePlan().length*k));}}
// ---- run lifecycle ----
function svEnter(load){SV.on=true;SV.build=null;SV.rot=0;SV.chest={};SV.tools={axe:0,pick:0,hammer:0};SV.day=1;SV.clock=0;SV.streak=0;SV.total=0;SV.plan=null;SV.speed=1;
  clearPieces();resetNodes();refillLoot();for(const k of RES_K)inv[k]=0;for(const id of ['axe','pick','hammer']){own[id]=true;}
  const pistol=WEAPONS.find(w=>w.id==='pistol');own.pistol=true;mag.pistol=pistol.mag;res.pistol=24;
  if(load){const s=svLoadData();if(s)svApply(s);}else{LS.set(SV_KEY,null);}
  const q=URLQ4;if(q.get('svt'))SV.clock=clamp(+q.get('svt')||0,0,CYCLE-1);if(q.get('svday'))SV.day=Math.max(1,+q.get('svday')|0);if(q.get('svspeed'))SV.speed=clamp(+q.get('svspeed')||1,.1,60);if(q.get('svres'))for(const k of RES_K)inv[k]=Math.min(+q.get('svres')|0,20);
  const [p,k]=phaseAt(SV.clock);SV.phase=p;SV.pt=k;if(p==='night'&&!SV.plan){SV.plan=hordePlan();SV.horde=SV.plan.length;}
  SV.spawnT=3;SV.saveT=30;setToolLook();svFires();applyLight();bakeShadows();setBuild(false);
  try{ownerArm449();}catch(e){}
  const ai=WEAPONS.findIndex(w=>w.id==='axe');curW=-1;equip(PROF.eqw&&own[PROF.eqw]?WEAPONS.findIndex(w=>w.id===PROF.eqw):ai,true);
  game.kills=0;S.score=0;S.heads=0;S.combo=0;S.lastKill=-99;
  banner(load?'BENTORNATO':'GIORNO '+SV.day,load?'Giorno '+SV.day+' · '+clockTxt():'Taglia alberi 🪓, spacca rocce ⛏️ e costruisci la base prima di notte','',3800);updateHUD();}
function svExit(){if(SV.on)svSave();SV.on=false;SV.build=null;document.body.classList.remove('building');ghost.visible=false;clearPieces();refillLoot();applyLight();fireLight.intensity=0;
  for(const id of ['axe','pick','hammer'])own[id]=false;}
function svGameOver(){game.state='over';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();setBuild(false);
  const best=Math.max(SV.streak,LS.get('zc_best_surv',0)|0);LS.set('zc_best_surv',best);saveRun();
  const s=svSnapshot();s.inv=Object.fromEntries(RES_K.map(k=>[k,0]));s.streak=0;s.hp=100;s.pos=[0,2,0];const bc=baseCenter();if(bc)s.pos=[+(bc.x+2.5).toFixed(1),+(bc.z+2.5).toFixed(1),0];LS.set(SV_KEY,s);
  slamRing.visible=false;$('bossBar').style.display='none';hideBanner();$('lowhp').style.opacity=0;
  $('overStats').innerHTML='<div class="bigScore">'+SV.streak+'</div><div class="small" style="opacity:.7;letter-spacing:2px">NOTTI SOPRAVVISSUTE · '+DIFF().label.toUpperCase()+'</div>'+(SV.streak>0&&SV.streak>=best?'<div class="recBadge">★ NUOVO RECORD ★</div>':'')+
   '<div class="statGrid"><div><b>'+SV.day+'</b>Giorno</div><div><b>'+game.kills+'</b>Uccisi</div><div><b>'+PIECES.filter(p=>p.alive).length+'</b>Pezzi base</div><div><b>+'+S.gemsRun+'</b>💎 Guadagnati</div></div><div class="bestLine">🏆 Record: '+best+' notti sopravvissute di fila</div><div class="sub2" style="margin-top:6px">Con «Riprova dalla base» tieni base e cassa, ma perdi lo zaino.</div>';
  $('restartBtn').textContent='↻ Riprova dalla base';$('newRunBtn').style.display='';$('sendScoreBtn').style.display=TG.W?'':'none';queueScore();setTimeout(()=>scoreAfterRun(),900);$('overScreen').classList.remove('hidden');play('over');}
function svMenuInfo(){const s=svLoadData();$('survSub').textContent=s?'Continua · base salvata':'Nuova partita';$('btnNewRun').style.display=s?'':'none';
  const k=LS.get('zc_best',{}).kills|0;$('menuBest').innerHTML=k?'☠️ Record: <b>'+k+'</b> zombie uccisi':'Uccidi più zombie che puoi';}

// ======================= v4 glue: HUD, input, per-frame update =======================
let hudSig='';
function hud4(){if(!SV.on)return;const sig=RES_K.map(k=>inv[k]|0).join(',')+'|'+S.nades+'|'+bagCap();if(sig!==hudSig){hudSig=sig;
  $('mats').innerHTML=RES_K.map(k=>'<span>'+RES[k].i+' <b>'+(inv[k]|0)+'</b></span>').join('')+'<span>💣 <b id="mNade">'+S.nades+'</b></span><span class="bag'+(bagCount()>=bagCap()?' full':'')+'">🎒 <b>'+bagCount()+'/'+bagCap()+'</b></span><span style="display:none"><b id="mWood"></b><b id="mMetal"></b><b id="mElec"></b></span>';}
  const w=WEAPONS[curW];if(w&&w.tool)$('wName').textContent=toolName(w);if(w&&w.tool)$('wAmmo').innerHTML=w.tool==='hammer'?'Ripara · 🏗️ costruisci':w.tool==='axe'?'Alberi → 🪵':'Rocce → 🪨 ⛓️ ⚫';
  renderWBar();$('adsBtn').style.display=w&&!w.melee&&!w.tool?'':'none';}
let clkT=0;function svClockHUD(){const p=SV.phase,ic=p==='day'?'☀️':p==='dusk'?'🌅':p==='night'?'🌙':'🌄';$('clockTxt').textContent=clockTxt();$('clockIc').textContent=ic;
  let left=0;const order=PH_ORDER,i=order.indexOf(p);let acc=0;for(let k=0;k<order.length;k++){if(k<i)acc+=DAYLEN[order[k]];}const into=SV.clock-acc;
  const tn=DAYLEN.day+DAYLEN.dusk;let txt;if(p==='day'||p==='dusk'){left=tn-SV.clock;txt='Notte tra <b>'+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0')+'</b>';}
  else if(p==='night'){left=DAYLEN.night-into;txt='🧟 Orda <b>'+((SV.plan?SV.plan.length:0)+aliveCount())+'</b> · alba '+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0');}else txt='L\'alba sorge…';
  $('svPhase').innerHTML=txt;$('svDayTxt').innerHTML='Giorno <b>'+SV.day+'</b> · 🏆 '+Math.max(SV.streak,LS.get('zc_best_surv',0)|0);$('phaseFill').style.width=(SV.clock/CYCLE*100).toFixed(1)+'%';
  document.body.classList.toggle('night',nightF()>.5);}
let radarT=0,nearT=0,minSpinSnd=false;
let h41T=0;function upd4(dt,t){const w=WEAPONS[curW];try{wiUpdate(dt);}catch(e){}h41T-=dt;if(h41T<=0){h41T=.15;try{hud41();}catch(e){}}updateFlames(dt);updateProj(dt);updateBurn(dt);
  // minigun spin-up
  if(w.spin){if(firing&&fx.reload<0&&!SV.build){if(fx.spin<=0)play('spinUp');fx.spin=Math.min(1,(fx.spin||0)+dt/.6);}else{if(fx.spin>=1)play('spinDown');fx.spin=Math.max(0,(fx.spin||0)-dt/.9);}
    const sp=VM.minigun.userData.spin;sp.rotation.z+=dt*fx.spin*42;}else fx.spin=0;
  if(!firing)fx.flameOn=false;if(w.id==='flamer'){const pl=VM.flamer.userData.pilot;pl.scale.setScalar(.06+Math.random()*.025);}
  if(w.kind==='bolt'){const b=VM.crossbow.userData.bolt;const v=mag.crossbow>0&&fx.reload<0;for(const m of b)m.visible=v;}
  updateADS(dt,w);
  radarT-=dt;if(radarT<=0){radarT=.2;drawRadar();}
  footstep(Math.hypot(player.vel.x,player.vel.z),dt);
  if(shadowDirty>0){shadowDirty-=dt;if(shadowDirty<=0)renderer.shadowMap.needsUpdate=true;}
  if(!SV.on)return;
  updateNodes(dt);updateGhost();updateFires(dt,t);
  nearT-=dt;if(nearT<=0){nearT=.2;svScanNear();const n=svNearObj,ht=n?'Premi <b>E</b> / <b>✋</b> · '+n.t:'Premi <b>E</b> / <b>✋</b> · Raccogli';if($('pickHint').dataset.t!==ht){$('pickHint').dataset.t=ht;$('pickHint').innerHTML=ht;}
    // harvest target hint
    let hn=null;if(w.tool==='axe'||w.tool==='pick'){hn=nodeInFront(1.9);}$('harv').classList.toggle('show',!!hn||harvShow>0);if(hn){const need=Math.ceil(hn.need*[1,.72,.5][toolTier(w)]);$('harvFill').style.width=(hn.prog/need*100)+'%';$('harvTxt').textContent=(hn.type==='rock'?'⛏️ Roccia':'🪓 '+(hn.type==='pine'?'Abete':'Albero secco'))+(w.tool===(hn.type==='rock'?'pick':'axe')?'':' · attrezzo sbagliato');}}
  harvShow=Math.max(0,harvShow-dt);
  clkT-=dt;if(clkT<=0){clkT=.25;svClockHUD();}
  for(const p of PIECES)if(p.cd>0)p.cd-=dt;}
// ---- buttons ----
$('fireBtn').addEventListener('touchstart',()=>{if(game.state==='play'&&SV.build)placeBuild();},{passive:true});
tapBtn('adsBtn',()=>{setADS(!ADS.on);});
tapBtn('buildBtn',()=>{if(!SV.on)return;setBuild(!SV.build);});
tapBtn('bRot',()=>{SV.rot=(SV.rot+1)%4;play('ui');});tapBtn('bDel',demolish);tapBtn('bClose',()=>setBuild(false));tapBtn('bPlace',placeBuild);
$('bList').addEventListener('click',e=>{const b=e.target.closest('.bp');if(!b)return;SV.build=b.dataset.p;SV.rot=0;renderBuildBar();play('ui');});
$('bList').addEventListener('touchstart',e=>{e.stopPropagation();},{passive:true});
$('recipes').addEventListener('click',e=>{const b=e.target.closest('button[data-tool],button[data-sv]');if(!b||b.disabled)return;svCraftClick(b);});
canvas.addEventListener('mousedown',e=>{if(e.button===2&&game.state==='play')ADS.hold=true;});addEventListener('mouseup',e=>{if(e.button===2)ADS.hold=false;});
addEventListener('keydown',e=>{if(game.state!=='play'||!SV.on)return;if(e.code==='KeyB')setBuild(!SV.build);if(SV.build){if(e.code==='KeyR'||e.code==='KeyT'){SV.rot=(SV.rot+1)%4;}if(e.code==='KeyX')demolish();
  const n=['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8'].indexOf(e.code);if(n>=0){SV.build=PORDER[n];renderBuildBar();}}});
addEventListener('keydown',e=>{if(game.state==='chest'&&(e.code==='KeyE'||e.code==='Escape'))closeChest();});
onTap('btnNewRun',()=>{audioInit();dialog('Nuova partita?','Il mondo salvato (giorno, base, cassa) verrà cancellato.',[{label:'Sì, ricomincia',fn:()=>startGame(false)},{label:'Annulla',ghost:1}]);});
onTap('newRunBtn',()=>{dialog('Nuova partita?','Base e cassa verranno cancellate.',[{label:'Sì, ricomincia',fn:()=>startGame(false)},{label:'Annulla',ghost:1}]);});
svMenuInfo();svCloudPull();

// ======================= v4.1: clean HUD, backpack, direct-select hotbar, contextual action, tabbed crafting =======================
const HB={more:false};
function hbSlots(){const W=innerWidth,sl=+getComputedStyle(document.documentElement).getPropertyValue('--sal').replace('px','')||0;const r=$('wbar').getBoundingClientRect();const avail=r.width||Math.max(200,W*.4);
  return Math.max(3,Math.floor((avail-(SV.on?2*58+12:0)+4)/52));}
let hbSig='';
function renderWBar(){const L=ownedList(),max=hbSlots(),th=THUMBS||{};const sig=L.join(',')+'|'+curW+'|'+(THUMBS?1:0)+'|'+max+'|'+SV.on;if(sig===hbSig)return;hbSig=sig;
  let show=L,more=false;if(L.length>max){more=true;show=L.slice(0,max-1);if(!show.includes(curW)&&L.includes(curW))show[show.length-1]=curW;}
  const slot=(i,k)=>{const w=WEAPONS[i];return '<div class="ws'+(i===curW?' on':'')+'" data-i="'+i+'">'+(w.tool?'<b class="te">'+({axe:'🪓',pick:'⛏️',hammer:'🔨'})[w.tool]+'</b>':th[w.id]?'<img alt="" src="'+th[w.id]+'">':'<span>'+esc(w.name.split(' ')[0])+'</span>')+'<em>'+(L.indexOf(i)+1)+'</em></div>';};
  let h=show.map(slot).join('');if(more)h+='<div class="ws more" data-a="more"><b class="te">⋯</b><em>+'+(L.length-show.length)+'</em></div>';
  if(SV.on)h+='<i class="sep"></i><div class="ws act" data-a="craft"><b class="te">🔨</b><small>Crafting</small></div><div class="ws act bld" data-a="build"><b class="te">🏗️</b><small>Costruisci</small></div>';
  $('wbar').innerHTML=h;}
function wpickOpen(){const L=ownedList(),th=THUMBS||{};$('wpGrid').innerHTML=L.map(i=>{const w=WEAPONS[i];return '<div class="ws'+(i===curW?' on':'')+'" data-i="'+i+'">'+(w.tool?'<b class="te">'+({axe:'🪓',pick:'⛏️',hammer:'🔨'})[w.tool]+'</b>':th[w.id]?'<img alt="" src="'+th[w.id]+'">':'<span>'+esc(w.name.split(' ')[0])+'</span>')+'<small>'+esc(w.tool?toolName(w):w.name)+'</small></div>';}).join('');$('wpick').classList.add('show');document.body.classList.add('wpk');}
function wpickClose(){$('wpick').classList.remove('show');document.body.classList.remove('wpk');}
function hbTap(e){const s=e.target.closest&&e.target.closest('.ws');if(!s||game.state!=='play')return;if(e.cancelable)e.preventDefault();e.stopPropagation();
  const a=s.dataset.a;if(a==='more'){$('wpick').classList.contains('show')?wpickClose():wpickOpen();return;}
  if(a==='craft'){wpickClose();openCraft();return;}if(a==='build'){wpickClose();setBuild(true);return;}
  const i=+s.dataset.i;wpickClose();if(i!==curW){equip(i);play('ui');}}
// replace the v4 wbar listeners (clone node drops old ones)
{const o=$('wbar'),n=o.cloneNode(false);o.parentNode.replaceChild(n,o);n.addEventListener('touchstart',hbTap,{passive:false});n.addEventListener('mousedown',hbTap);
 $('wpick').addEventListener('touchstart',hbTap,{passive:false});$('wpick').addEventListener('mousedown',hbTap);}
// tap the ammo counter to reload
function wiTap(e){if(game.state!=='play')return;if(e.cancelable)e.preventDefault();e.stopPropagation();const w=WEAPONS[curW];if(!w||w.melee||w.tool)return;if(!startReload()&&res[w.id]<=0&&mag[w.id]<w.mag)toast('Niente munizioni di riserva',900);}
$('weaponInfo').addEventListener('touchstart',wiTap,{passive:false});$('weaponInfo').addEventListener('mousedown',wiTap);
// ---- backpack ----
function bagItems(){const L=RES_K.map(k=>({i:RES[k].i,n:RES[k].n,v:inv[k]|0}));L.push({i:'💣',n:'Granate',v:S.nades|0});
  WEAPONS.forEach(w=>{if(!own[w.id]||w.melee||w.tool)return;L.push({i:'🔫',n:w.name,v:(mag[w.id]|0)+' + '+(res[w.id]|0),am:1});});
  if(SV.on)for(const k of ['axe','pick','hammer']){const w=WEAPONS.find(q=>q.id===k);L.push({i:({axe:'🪓',pick:'⛏️',hammer:'🔨'})[k],n:toolName(w),v:'',tool:1});}return L;}
function renderBag(){const n=bagCount(),c=bagCap();$('bagCap').innerHTML='🎒 <b>'+n+' / '+c+'</b> materiali'+(n>=c?' · <span style="color:#ff8a7a">pieno</span>':'');$('bagCapFill').style.width=Math.min(100,n/c*100)+'%';
  const tile=x=>'<div class="bgI'+(x.k||'')+(x.zero?' zero':'')+'"><i>'+x.i+'</i><span>'+esc(x.n)+'</span>'+x.h+'</div>';
  const mats=RES_K.map(k=>{const v=inv[k]|0;return tile({i:RES[k].i,n:RES[k].n,zero:!v,h:'<b>'+v+'</b>'});}).join('');
  const guns=[];const nv=S.nades|0;
  guns.push(tile({i:'💣',n:'Granate',k:' am',zero:!nv,h:'<b class="bgAm"><span><em>'+nv+'</em><small>pronte</small></span></b>'}));
  WEAPONS.forEach(w=>{if(!own[w.id]||w.melee||w.tool||!w.mag)return;const m=mag[w.id]|0,r=res[w.id]|0;guns.push(tile({i:'🔫',n:w.name,k:' am',zero:!(m+r),h:'<b class="bgAm"><span><em>'+m+'</em><small>caric.</small></span><span><em>'+r+'</em><small>riserva</small></span></b>'}));});
  let tools='';
  if(SV.on){const ts=['axe','pick','hammer'].map(k=>{const w=WEAPONS.find(q=>q.id===k);return tile({i:({axe:'🪓',pick:'⛏️',hammer:'🔨'})[k],n:toolName(w),k:' tl',h:'<b></b>'});}).join('');tools='<div class="bgSec">Attrezzi</div><div class="bgTools">'+ts+'</div>';}
  $('bagGrid').innerHTML='<div class="bgSec">Materiali</div><div class="bgMats">'+mats+'</div><div class="bgSec">Munizioni <small>caricatore e riserva</small></div><div class="bgAms">'+guns.join('')+'</div>'+tools;}
function openBag(){if(window.__arena454&&__arena454.on)return;if(game.state!=='play')return;game.state='bag';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();wpickClose();renderBag();$('bagScreen').classList.remove('hidden');const xb=$('bagCloseApk');if(xb)xb.hidden=false;play('ui');}
function closeBag(){$('bagScreen').classList.add('hidden');const xb=$('bagCloseApk');if(xb)xb.hidden=true;if(game.state==='bag'){game.state='play';last=performance.now();}if(!isTouch)lockPointer();}
onTap('bagBtn',openBag);onTap('bagClose',closeBag);$('bagScreen').addEventListener('click',e=>{if(e.target.id==='bagScreen')closeBag();});
if(window.__zsApk){if(!$('bagCloseApk')){const b=document.createElement('button');b.id='bagCloseApk';b.type='button';b.hidden=true;b.textContent='Chiudi zaino';document.body.appendChild(b);onTap('bagCloseApk',closeBag);}const bc=$('bagClose');if(bc)bc.textContent='Chiudi';}
window.__zsBack=function(){try{if(!window.__zsApk)return false;
  if($('dlgScreen')&&!$('dlgScreen').classList.contains('hidden')){$('dlgScreen').classList.add('hidden');return true;}
  if($('bagScreen')&&!$('bagScreen').classList.contains('hidden')){closeBag();return true;}
  if($('craftScreen')&&!$('craftScreen').classList.contains('hidden')){closeCraft();return true;}
  if($('chestScreen')&&!$('chestScreen').classList.contains('hidden')){closeChest();return true;}
  if($('shopScreen')&&!$('shopScreen').classList.contains('hidden')){$('shopScreen').classList.add('hidden');return true;}
  if($('pauseScreen')&&!$('pauseScreen').classList.contains('hidden')){resumeGame();return true;}
  for(const id of ['helpScreen','rankScreen','soonScreen','prizeScreen']){const e=$(id);if(e&&!e.classList.contains('hidden')){e.classList.add('hidden');return true;}}
}catch(e){}return false;};
addEventListener('keydown',e=>{if(e.code==='KeyI'||e.code==='Tab'){if(game.state==='play'){e.preventDefault();openBag();}else if(game.state==='bag'){e.preventDefault();closeBag();}}else if(e.code==='Escape'&&game.state==='bag')closeBag();});
let bagSig='';function hud41(){const n=bagCount(),c=bagCap(),s=n+'/'+c;if(s!==bagSig){bagSig=s;$('bagN').textContent=s;$('bagBtn').classList.toggle('full',n>=c);}
  $('bagBtn').style.display=SV.on&&game.state!=='menu'?'':'none';
  // contextual action button
  const nr=(SV.on&&svNearObj)?svNearObj.t:($('pickBtn').classList.contains('ready')?'Raccogli':'');const lb=nr?'✋<br>'+nr:'';if($('pickBtn').dataset.l!==lb){$('pickBtn').dataset.l=lb;$('pickBtn').innerHTML=lb||'✋';}
  $('pickBtn').classList.toggle('ctx',!!nr);
  $('nadeBtn').classList.toggle('none',S.nades<=0);
  // build-bar: cost / availability of the selected piece
  if(SV.build){const D=PDEF[SV.build],ok=costOK(D.cost);const t=D.i+' <b>'+D.n+'</b> · '+Object.entries(D.cost).map(([k,v])=>'<span class="'+((inv[k]|0)>=v?'':'miss')+'">'+RES[k].i+' '+(inv[k]|0)+'/'+v+'</span>').join(' ')+(ok?' · <span class="ok">✔ disponibile</span>':' · <span class="miss">mancano risorse</span>');
    if($('bCost').dataset.t!==t){$('bCost').dataset.t=t;$('bCost').innerHTML=t;}}}
// ---- tabbed crafting ----
let craftTab='tools';
const _rc=renderCraft;renderCraft=function(){_rc();if(!SV.on){$('craftTabs').style.display='none';return;}$('craftTabs').style.display='';
  const all=$('recipes').innerHTML,iA=all.indexOf('<div class="craftSec">🔫 Armi</div>'),iB=all.indexOf('<div class="recipe"><div><div class="name">🩹'),iG=all.lastIndexOf('<div class="recipe">');
  const tools=all.slice(0,iB>0?iB:iA).replace('<div class="craftSec">🛠️ Attrezzi</div>',''),mats=iB>0?all.slice(iB,iA):'',weap=all.slice(iA,iG).replace('<div class="craftSec">🔫 Armi</div>',''),nade=all.slice(iG);
  const T={tools,mats,weap,nade};$('recipes').innerHTML=T[craftTab]||'<div class="sub2">Niente qui.</div>';
  document.querySelectorAll('#craftTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.c===craftTab));};
$('craftTabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;craftTab=b.dataset.c;renderCraft();});
// transient weapon label: full name for 1.5 s after a switch, then only the ammo pill (guns) or nothing (tools/knife)
let wiT=0,wiLast=-2;function wiUpdate(dt){if(curW!==wiLast){wiLast=curW;wiT=.85;}wiT-=dt;const w=WEAPONS[curW];const el=$('weaponInfo');const gone=wiT<=0&&(!w||w.melee||w.tool),slim=wiT<=0&&!gone;
  if(el.classList.contains('gone')!==gone)el.classList.toggle('gone',gone);if(el.classList.contains('slim')!==slim)el.classList.toggle('slim',slim);
  const ic=w&&w.tool?({axe:'🪓',pick:'⛏️',hammer:'🔨'})[w.tool]:'';document.body.classList.toggle('tool',!!ic);if(ic&&$('fireBtn').dataset.ic!==ic)$('fireBtn').dataset.ic=ic;}

