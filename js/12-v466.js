/* Zombie Survival — game code part 12-v466 (game.html lines 7337-7407 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.66: atmosfera cupa, nebbia, lampioni, torcia, piu zombie =======================
const MOOD466={on:true,err:0,lamps:null,t:0};window.__mood466=MOOD466;
function moodErr466(e){MOOD466.err++;try{if(window.__DBG)__DBG.prob('warn','mood466',String(e&&e.message||e).slice(0,200));}catch(_){}if(MOOD466.err>5)MOOD466.on=false;}
// --- more zombies (+40/60% per quality), bigger horde ---
const ZMUL466=()=>GQ()==='alta'?1.6:GQ()==='media'?1.5:1.4;
{const _mx=svMaxAlive;svMaxAlive=function(){const b=_mx();try{if(ARENA454&&ARENA454.on)return b;}catch(e){}return Math.round(b*ZMUL466());};}
{const _hp=hordePlan;hordePlan=function(){const L=_hp();try{const add=Math.round(L.filter(v=>v!=='boss').length*(ZMUL466()-1)),n=SV.day|0;for(let i=0;i<add;i++){const r=Math.random();L.splice(Math.floor(Math.random()*(L.length+1)),0,r<Math.min(.3,.1+n*.03)?'runner':'normal');}}catch(e){moodErr466(e);}return L;};}
// --- darker, foggier light presets ---
LDAY.hemi=.82;LDAY.sun=1.08;LDAY.fog.setHex(0x7f8a88);LDAY.near=16;LDAY.far=88;LDAY.sky.setHex(0x9aa6aa);LDAY.hc.setHex(0xa8b4b0);
LDUSK.hemi=.42;LDUSK.sun=.5;LDUSK.fog.setHex(0x5a4a52);LDUSK.near=10;LDUSK.far=58;LDUSK.sky.setHex(0x7a5c62);
LNIGHT.hemi=.17;LNIGHT.sun=.06;LNIGHT.fog.setHex(0x080c14);LNIGHT.near=5;LNIGHT.far=34;LNIGHT.sky.setHex(0x111828);
function expo466(q){try{if(q!=='bassa')renderer.toneMappingExposure=q==='alta'?1.18:1.14;}catch(e){}}
gfxOn43(expo466);expo466(GQ());
// --- flashlight: brighter, longer, soft ground pool ---
const FLB466={alta:1.75,media:1.6,bassa:1.45};
flash.distance=27;flash.decay=1.05;flash.position.set(0,.2,-1.2);flash.color.setHex(0xfff2dc);
{const _al=applyLight;applyLight=function(){if(flash.userData.b466!==undefined)flash.intensity=flash.userData.b466;_al();flash.userData.b466=flash.intensity;
  if(MOOD466.on)try{flash.intensity=flash.userData.b466*(FLB466[GQ()]||1.5);}catch(e){moodErr466(e);}};}
const softTex466=ctex43('soft466',128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(.7,'rgba(255,255,255,.16)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
const fPool466=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:softTex466,color:0xfff0cf,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3}));
fPool466.rotation.x=-Math.PI/2;fPool466.renderOrder=4;fPool466.visible=false;scene.add(fPool466);
{const bt=ctex43('beam466',8,64,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(.25,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=r;g.fillRect(0,0,w,h);});
 try{beam43.material.map=bt;beam43.material.needsUpdate=true;}catch(e){}}
// --- street lamps: warm halos, light pools, fake volumetric cones (instanced, no extra real lights) ---
const _m466=new T.Matrix4(),_q466=new T.Quaternion(),_s466=new T.Vector3(),_p466=new T.Vector3(),_d466=new T.Vector3();
function buildLamps466(){const C=window.CITY4319;if(!C||!C.lightSources)return null;const S=C.lightSources.filter(s=>s.kind==='street');if(!S.length)return null;
  for(const s of S){if(!s.b466){s.b466=1;s.intensity=Math.round(s.intensity*1.5);s.angle=.72;}}
  const n=S.length,o={n,S};
  const poolM=new T.MeshBasicMaterial({map:softTex466,color:0xffb560,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  o.pool=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),poolM,n);
  const coneG=new T.ConeGeometry(1,1,16,1,true);coneG.translate(0,-.5,0);
  const coneT=ctex43('cone466',8,64,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(.6,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=r;g.fillRect(0,0,w,h);});
  o.cone=new T.InstancedMesh(coneG,new T.MeshBasicMaterial({map:coneT,color:0xffc070,transparent:true,opacity:.08,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:true}),n);
  const hp=new Float32Array(n*3);S.forEach((s,i)=>{hp[i*3]=s.x;hp[i*3+1]=s.y-.05;hp[i*3+2]=s.z;
    _m466.compose(_p466.set(s.x,.13,s.z),_q466.identity(),_s466.set(12,1,12));o.pool.setMatrixAt(i,_m466);
    _m466.compose(_p466.set(s.x,s.y,s.z),_q466.identity(),_s466.set(2.6,s.y-.05,2.6));o.cone.setMatrixAt(i,_m466);});
  const hg=new T.BufferGeometry();hg.setAttribute('position',new T.BufferAttribute(hp,3));
  o.halo=new T.Points(hg,new T.PointsMaterial({map:glowTex,color:0xffc070,size:3.4,sizeAttenuation:true,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,fog:true}));
  for(const m of [o.pool,o.cone,o.halo]){m.frustumCulled=false;m.renderOrder=3;scene.add(m);}
  return o;}
// --- ground fog layer (Media/Alta) ---
const fogTex466=ctex43('fog466',256,256,(g,w,h)=>{g.clearRect(0,0,w,h);let s=4661;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  for(let i=0;i<70;i++){const x=R()*w,y=R()*h,r=20+R()*60;for(const dx of [-w,0,w])for(const dy of [-h,0,h]){const gr=g.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);gr.addColorStop(0,'rgba(255,255,255,'+(.10+R()*.12).toFixed(3)+')');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x+dx-r,y+dy-r,r*2,r*2);}}},{});
try{fogTex466.wrapS=fogTex466.wrapT=T.RepeatWrapping;fogTex466.repeat.set(4,4);}catch(e){}
const gFog466=[];for(let i=0;i<2;i++){const t=fogTex466.clone();t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(i?3:4,i?3:4);
  const m=new T.Mesh(new T.PlaneGeometry(90,90).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:t,color:0xc8d0d4,transparent:true,opacity:0,depthWrite:false,fog:true}));
  m.position.y=i?1.25:.45;m.renderOrder=6;m.visible=false;m.frustumCulled=false;scene.add(m);gFog466.push(m);}
// --- dark vignette ---
const vig466=document.createElement('div');vig466.id='vig466';vig466.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;display:none;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,0) 45%,rgba(4,6,10,.38) 80%,rgba(2,3,6,.62) 100%)';
try{const g=document.getElementById('grade43');if(g&&g.parentNode)g.parentNode.insertBefore(vig466,g.nextSibling);else document.body.appendChild(vig466);}catch(e){}
function mood466(dt){if(!MOOD466.on)return;
  const play=(game.state==='play'||game.state==='craft')&&!(typeof ARENA454!=='undefined'&&ARENA454.on);
  {const dv=play?'block':'none';if(vig466.style.display!==dv)vig466.style.display=dv;}
  const q=GQ(),nf=nightF();
  if(!MOOD466.lamps&&window.CITY4319)MOOD466.lamps=buildLamps466()||false;
  const L=MOOD466.lamps;if(L){L.pool.visible=L.halo.visible=play;L.cone.visible=play&&q!=='bassa';
    const k=.35+.65*nf;L.pool.material.opacity=(q==='bassa'?.38:.5)*k;L.halo.material.opacity=.45+.5*nf;L.halo.material.size=2.6+1.6*nf;
    L.cone.material.opacity=(q==='alta'?.11:.08)*(.25+.75*nf);
    if(q==='alta'){MOOD466.t+=dt;L.halo.material.opacity*=.92+.08*Math.sin(MOOD466.t*23)*Math.sin(MOOD466.t*3.1);}}
  const fb=flash.userData.b466||0,fk=Math.min(1,fb/12);
  if(play&&fk>.03&&!window.__spot468){camera.getWorldDirection(_d466);const cp=camera.position;let dist=7;if(_d466.y<-.08)dist=Math.min(9,Math.max(2.2,cp.y/-_d466.y*Math.hypot(_d466.x,_d466.z)));
    const hx=Math.hypot(_d466.x,_d466.z)||1;fPool466.position.set(cp.x+_d466.x/hx*dist,.16,cp.z+_d466.z/hx*dist);const sz=2.6+dist*.55;fPool466.scale.set(sz,sz,1);fPool466.rotation.z=-Math.atan2(_d466.x,-_d466.z);
    fPool466.material.opacity=fk*(q==='bassa'?.32:.42)*(1-Math.max(0,dist-7)/4);fPool466.visible=true;}else fPool466.visible=false;
  if(beam43.visible)beam43.material.opacity=Math.min(.085,fk*.085);
  const fogOn=play&&q!=='bassa';for(let i=0;i<gFog466.length;i++){const m=gFog466[i];if(i===1&&q!=='alta'){m.visible=false;continue;}m.visible=fogOn;if(!fogOn)continue;
    const cp=camera.position;m.position.x=Math.round(cp.x/4)*4;m.position.z=Math.round(cp.z/4)*4;const mp=m.material.map;mp.offset.x=(mp.offset.x+dt*(i?.004:.0025))%1;mp.offset.y=(mp.offset.y+dt*(i?.0015:.003))%1;
    m.material.opacity=(i?.16:.24)*(.55+.45*nf);m.material.color.copy(scene.fog.color).lerp(_c466w,.35);}}
const _c466w=new T.Color(0xc8d0d4);
{const _l0=loop0;let last=0;loop0=function(now){try{const dt=last?Math.min(.1,(now-last)/1000):0;last=now;mood466(dt);}catch(e){moodErr466(e);}return _l0(now);};}
try{applyLight();}catch(e){}
window.__zs466={drawRadar:()=>drawRadar(),mood:dt=>mood466(dt),svMaxAlive:()=>svMaxAlive(),horde:()=>hordePlan().length};
