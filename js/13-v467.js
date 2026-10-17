/* Zombie Survival — game code part 13-v467 (game.html lines 7408-7585 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.67: pioggia, nebbia, mirini, sangue, ragdoll, confronto armi, munizioni, monete =======================
const M467={on:true,err:0,t:0};window.__m467=M467;
function e467(e,w){M467.err++;try{if(window.__DBG)__DBG.prob('warn','m467'+(w||''),String(e&&e.message||e).slice(0,200));}catch(_){}if(M467.err>8)M467.on=false;}
const Q467=()=>{try{return GQ();}catch(e){return 'media';}};
function sprXY467(spr){const a=Math.random()*6.2832,r=Math.sqrt(Math.random())*spr*1.13;return _dir.set(Math.cos(a)*r,Math.sin(a)*r,-1);}
// ---------- 1) gloomier + foggier ----------
LDAY.hemi=.7;LDAY.sun=.92;LDAY.fog.setHex(0x6e7876);LDAY.near=10;LDAY.far=64;LDAY.sky.setHex(0x7f8a8e);LDAY.hc.setHex(0x96a29e);
LDUSK.hemi=.36;LDUSK.sun=.4;LDUSK.fog.setHex(0x463a42);LDUSK.near=7;LDUSK.far=46;LDUSK.sky.setHex(0x5c4650);
LNIGHT.hemi=.15;LNIGHT.sun=.05;LNIGHT.fog.setHex(0x060910);LNIGHT.near=4;LNIGHT.far=29;
function expo467(q){try{if(q!=='bassa')renderer.toneMappingExposure=q==='alta'?1.1:1.07;}catch(e){}}gfxOn43(expo467);expo467(Q467());
// ---------- 2) rain ----------
const RAIN467={k:0,on:false,next:60+Math.random()*90,left:0,n:0,cov:false,covT:0,snd:null,g:null};
const RN467=1100,rP467=new Float32Array(RN467*6),rS467=new Float32Array(RN467);
for(let i=0;i<RN467;i++){rP467[i*6]=rand(-13,13);rP467[i*6+1]=rand(0,14);rP467[i*6+2]=rand(-13,13);rS467[i]=rand(.8,1.25);}
const rG467=new T.BufferGeometry();rG467.setAttribute('position',new T.BufferAttribute(rP467,3));
const rain467=new T.LineSegments(rG467,new T.LineBasicMaterial({color:0xa8b8c8,transparent:true,opacity:0,depthWrite:false,fog:true}));rain467.frustumCulled=false;rain467.visible=false;rain467.renderOrder=7;scene.add(rain467);
function rainSnd467(k){try{const c=AU.ctx;if(!c||!AU.noise||!AU.master)return;if(!RAIN467.snd){const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2300;bp.Q.value=.45;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;const g=c.createGain();g.gain.value=0;s.connect(bp).connect(lp).connect(g).connect(AU.master);s.start();RAIN467.snd=s;RAIN467.g=g;}
  const tgt=SET.mute?0:k*.075;RAIN467.g.gain.setTargetAtTime(tgt,c.currentTime,.4);}catch(e){e467(e,'snd');RAIN467.snd=RAIN467.snd||1;}}
function rainTick467(dt,play){const R=RAIN467;
  if(play){if(R.on){R.left-=dt;if(R.left<=0){R.on=false;R.next=rand(120,300);}}else{R.next-=dt;if(R.next<=0){R.on=true;R.left=rand(30,90);try{toast('🌧️ Inizia a piovere',1300);}catch(e){}}}}
  const tgt=R.on&&play?1:0;R.k+=(tgt-R.k)*Math.min(1,dt/3.5);if(R.k<.003)R.k=0;
  if(R.snd!==1)rainSnd467(play?R.k:0);
  if(!R.k||!play){rain467.visible=false;return;}
  R.covT-=dt;if(R.covT<=0){R.covT=.35;try{R.cov=snowCovered();}catch(e){R.cov=false;}}
  const q=Q467(),n=Math.round((q==='alta'?RN467:q==='media'?650:280)*R.k);rain467.visible=n>8;if(!rain467.visible)return;
  rG467.setDrawRange(0,n*2);rain467.material.opacity=(R.cov?.12:.42)*Math.min(1,R.k*1.4);
  const cx=camera.position.x,cy=camera.position.y,cz=camera.position.z,wx=.9,len=.55;
  for(let i=0;i<n;i++){const j=i*6,v=rS467[i]*15*dt;let x=rP467[j]+wx*dt,y=rP467[j+1]-v,z=rP467[j+2];
    if(y<cy-2){y+=14;x=cx+rand(-13,13);z=cz+rand(-13,13);}if(x-cx>13)x-=26;else if(x-cx<-13)x+=26;if(z-cz>13)z-=26;else if(z-cz<-13)z+=26;
    rP467[j]=x;rP467[j+1]=y;rP467[j+2]=z;rP467[j+3]=x-wx*.035;rP467[j+4]=y+len*rS467[i];rP467[j+5]=z;}
  rG467.attributes.position.needsUpdate=true;}
{const _al=applyLight;applyLight=function(){_al();try{const k=RAIN467.k;if(k>0&&M467.on){scene.fog.far*=1-.32*k;scene.fog.near*=1-.35*k;hemiL.intensity*=1-.2*k;sun.intensity*=1-.35*k;}}catch(e){e467(e,'al');}};}
// ---------- 3) reticles ----------
{const st=document.createElement('style');st.textContent=
'#ret467{position:absolute;left:50%;top:50%;width:0;height:0;--g:8px;pointer-events:none;display:none}body.ret467 #cross{visibility:hidden}body.ret467 #ret467{display:block}'+
'#ret467 i{position:absolute;background:rgba(255,255,255,.95);box-shadow:0 0 1.5px #000,0 0 3px rgba(0,0,0,.6);--l:7px;--w:2px}'+
'#ret467 i:nth-child(1){left:calc(var(--w)/-2);top:calc(-1*var(--g) - var(--l));width:var(--w);height:var(--l)}#ret467 i:nth-child(2){left:calc(var(--w)/-2);top:var(--g);width:var(--w);height:var(--l)}'+
'#ret467 i:nth-child(3){top:calc(var(--w)/-2);left:calc(-1*var(--g) - var(--l));height:var(--w);width:var(--l)}#ret467 i:nth-child(4){top:calc(var(--w)/-2);left:var(--g);height:var(--w);width:var(--l)}'+
'#ret467 b{position:absolute;left:-1.5px;top:-1.5px;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 2px #000}'+
'#ret467 u{display:none;position:absolute;left:0;top:0;width:calc(var(--g)*2);height:calc(var(--g)*2);transform:translate(-50%,-50%);border:1.5px solid rgba(255,255,255,.85);border-radius:50%;box-shadow:0 0 2px #000,inset 0 0 2px #000}'+
'#ret467[data-c="rifle"] i{--l:9px;--w:1.6px}#ret467[data-c="rifle"] b{width:2px;height:2px;left:-1px;top:-1px}'+
'#ret467[data-c="shot"] u{display:block}#ret467[data-c="shot"] i{--l:5px;--w:2px}'+
'#ret467[data-c="sniper"] i,#ret467[data-c="bolt"] i{--l:13px;--w:1.2px}#ret467[data-c="sniper"] b,#ret467[data-c="bolt"] b{background:#ff4a3a;width:2.5px;height:2.5px;left:-1.25px;top:-1.25px}'+
'#ret467[data-c="launch"] i:nth-child(1){display:none}#ret467[data-c="launch"] i:nth-child(2){--l:16px}#ret467[data-c="launch"] u{display:block;width:12px;height:12px}'+
'#ret467[data-c="flame"] u{display:block;border-style:dashed;border-color:rgba(255,190,120,.85)}#ret467[data-c="flame"] i{display:none}'+
'#ret467[data-c="melee"] i{display:none}#ret467[data-c="melee"] b{width:5px;height:5px;left:-2.5px;top:-2.5px;background:rgba(255,255,255,.8)}'+
'#ret467.hit i,#ret467.hit u{background-color:rgba(255,255,255,1)}#ret467.hit u{background:none;border-color:#fff}'+
'#hitX.head i{height:17px;background:#ffd23a;box-shadow:0 0 10px #ff9a20,0 0 2px #000}#hitX.head::after{content:"";position:absolute;left:-15px;top:-15px;width:26px;height:26px;border:2px solid #ffd23a;border-radius:50%;box-shadow:0 0 8px #ff9a20}'+
'#hitX.kill i{height:16px}'+
'#wcmp467{position:fixed;inset:0;z-index:900;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:calc(var(--sat,0px) + 10px) 10px 10px}'+
'#wcmp467.hidden{display:none}#wcmp467 .c{background:#141a22;border:1px solid rgba(255,210,122,.55);border-radius:14px;max-width:380px;width:92vw;max-height:86vh;overflow:auto;padding:12px 14px;color:#e8eef5;font:600 14px system-ui,sans-serif;box-shadow:0 10px 40px #000}'+
'#wcmp467 h3{margin:0 0 4px;font-size:17px;color:#ffd27a}#wcmp467 small{color:#9aa6b4}#wcmp467 table{width:100%;border-collapse:collapse;margin:8px 0}#wcmp467 td{padding:5px 4px;border-top:1px solid rgba(255,255,255,.08)}'+
'#wcmp467 td.v{text-align:right;white-space:nowrap}#wcmp467 .up{color:#6f6}#wcmp467 .dn{color:#f66}#wcmp467 .eq{color:#aaa}#wcmp467 .b{display:flex;gap:8px}#wcmp467 button{flex:1;padding:12px 6px;border-radius:10px;border:0;font:800 15px system-ui;background:#2e3a48;color:#fff}#wcmp467 button.p{background:#d9922a;color:#111}';
 document.head.appendChild(st);
 const r=document.createElement('div');r.id='ret467';r.innerHTML='<i></i><i></i><i></i><i></i><b></b><u></u>';const cr=$('cross');if(cr&&cr.parentNode)cr.parentNode.insertBefore(r,cr.nextSibling);document.body.classList.add('ret467');}
const RET467={el:$('ret467'),c:'',g:-1,hitT:0};
function retCls467(w){if(!w||w.melee)return 'melee';if(w.pellets>1||W_(w)==='shotgun')return 'shot';if(w.kind==='sniper')return 'sniper';if(w.kind==='bolt')return 'bolt';if(w.kind==='launcher')return 'launch';if(w.kind==='flame')return 'flame';return w.auto?'rifle':'pistol';}
{const _ua=updateADS;updateADS=function(dt,w){_ua(dt,w);if(!M467.on)return;try{const E=RET467.el;if(!E)return;const c=retCls467(w);if(c!==RET467.c){RET467.c=c;E.dataset.c=c;}
  const spr=w&&!w.melee?aimSpread(w):0,px=spr*1.13*(innerHeight/2)/Math.tan(camera.fov*Math.PI/360);
  const g=Math.round(Math.max(c==='shot'||c==='flame'?10:c==='melee'?0:3,c==='flame'?34:px)*2)/2;if(g!==RET467.g){RET467.g=g;E.style.setProperty('--g',g+'px');}
  const op=$('cross').style.opacity;if(E.style.opacity!==op)E.style.opacity=op;}catch(e){e467(e,'ret');}};}
{const _hm=hitMarker;hitMarker=function(k){_hm(k);try{const E=RET467.el;if(E){E.classList.remove('hit');void E.offsetWidth;E.classList.add('hit');clearTimeout(RET467.hitT);RET467.hitT=setTimeout(()=>E.classList.remove('hit'),110);}}catch(e){}};}
// ---------- 4) gait variety ----------
{const _pw=poseWalk;poseWalk=function(z,t,amp){_pw(z,t,amp);if(!M467.on||!z||!z.hips)return;try{let G=z.gait467;if(!G){const r=Math.random;G=z.gait467={sway:.03+r()*.07,lean:(r()-.5)*.14,limp:r()<.35?.25+r()*.4:0,side:r()<.5?1:-1,arm:r()*.35,tilt:(r()-.5)*.35,ph:r()*6};}
  const ph=z.phase||0,s=Math.sin(ph),a=Math.max(0,Math.min(1,amp));
  z.hips.rotation.z+=s*G.sway*a;z.spine.rotation.z+=s*G.sway*.7*a+G.lean;z.spine.rotation.y+=Math.sin(ph+.6)*G.sway*.6*a;
  if(z.neck)z.neck.rotation.z+=G.tilt*.5+Math.sin(t*.9+G.ph)*.06;
  if(G.limp){const L=G.side>0?z.hipL:z.hipR,K=G.side>0?z.kneeL:z.kneeR;L.rotation.x*=1-G.limp*.5;K.rotation.x*=1-G.limp*.45;const st=Math.max(0,G.side*s);z.hips.position.y-=G.limp*.055*st*a;z.hips.rotation.z+=G.side*G.limp*.1*st*a;}
  if(z.V&&z.V.name!=='runner'){z.shL.rotation.x+=G.arm*.4;z.shR.rotation.x-=G.arm*.25;}}catch(e){e467(e,'gait');}};}
// ---------- 5/6) blood mist + headshot burst ----------
const mistTex467=ctex43('mist467',64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(120,6,6,.95)');r.addColorStop(.5,'rgba(90,4,4,.5)');r.addColorStop(1,'rgba(60,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);
  g.fillStyle='rgba(110,0,0,.8)';for(let i=0;i<26;i++){const a=Math.random()*6.28,d=8+Math.random()*20;g.beginPath();g.arc(32+Math.cos(a)*d,32+Math.sin(a)*d,1+Math.random()*2.4,0,7);g.fill();}});
const MIST467=[];for(let i=0;i<20;i++){const s=new T.Sprite(new T.SpriteMaterial({map:mistTex467,transparent:true,opacity:0,depthWrite:false,fog:true}));s.visible=false;scene.add(s);MIST467.push({s,t:0,life:0,vx:0,vy:0,vz:0,s0:0,s1:0});}
function mist467(p,d,n,big){const cap=Q467()==='alta'?20:Q467()==='media'?14:8;let used=0;for(const m of MIST467)if(m.t>0)used++;
  for(let i=0;i<n&&used<cap;i++){const m=MIST467.find(q=>q.t<=0);if(!m)return;used++;m.life=m.t=(big?.55:.38)*rand(.8,1.2);const sp=big?rand(1,2.6):rand(.6,1.6);
    m.vx=d.x*sp+rand(-.4,.4);m.vy=(d.y||0)*sp+rand(0,big?1.4:.5);m.vz=d.z*sp+rand(-.4,.4);m.s0=big?.35:.2;m.s1=(big?1.6:.9)*rand(.8,1.2);m.s.position.set(p.x+d.x*.15,p.y,p.z+d.z*.15);m.s.material.rotation=Math.random()*6.28;m.s.visible=true;}}
function mistTick467(dt){for(const m of MIST467){if(m.t<=0)continue;m.t-=dt;if(m.t<=0){m.s.visible=false;m.s.material.opacity=0;continue;}const k=1-m.t/m.life;m.vy-=4*dt;m.s.position.x+=m.vx*dt;m.s.position.y+=m.vy*dt;m.s.position.z+=m.vz*dt;const sc=m.s0+(m.s1-m.s0)*Math.sqrt(k);m.s.scale.set(sc,sc,1);m.s.material.opacity=(1-k)*.85;}}
const _bp467=new T.Vector3(),_bn467=new T.Vector3(0,1,0),_bd467=new T.Vector3();
{const _dz=damageZombie;damageZombie=function(z,dmg,part,point,dir,slot){const alive=z&&!z.dead;const r=_dz.apply(this,arguments);if(!alive||!M467.on||!point||!dir)return r;try{const head=part==='head',q=Q467();
  _bd467.set(dir.x,0,dir.z);if(_bd467.lengthSq()<1e-6)_bd467.set(0,0,1);_bd467.normalize();
  mist467(point,dir,head?2:1,head);
  const nd=q==='bassa'?1:2;for(let i=0;i<nd;i++){const dd=rand(.9,2.6);_bp467.set(point.x+_bd467.x*dd+rand(-.25,.25),.01+i*.002,point.z+_bd467.z*dd+rand(-.25,.25));addDecal(bloods,_bp467,_bn467,rand(.3,.65));}
  if(head&&z.dead){_bp467.copy(point);emit(_bp467,_up,q==='bassa'?14:28,BLOOD,{speed:5.5,spread:1.5,life:.9,size:.07,grav:11,up:1});mist467(point,_up,3,true);_bp467.y=.012;addDecal(bloods,_bp467,_bn467,1.5);if(z.neck&&z.neck.visible){z.neck.visible=false;z.gore=z.gore||{};z.gore.head=1;try{chunk442(point,dir,goreBrain,6,.1);}catch(e){}}}
  }catch(e){e467(e,'blood');}return r;};}
// ---------- 7) ragdoll-like falls ----------
const _ax467=new T.Vector3(1,0,0);const RJ467=['kneeL','kneeR','hipL','hipR','spine','shL','shR','elL','elR','neck'];
{const _kz=killZombie;killZombie=function(z,dir,d,head){_kz(z,dir,d,head);if(!M467.on||!z||!z.g||(z.V&&z.V.name==='bloater'))return;try{const yaw=z.g.rotation.y,fx=Math.sin(yaw),fz=Math.cos(yaw);let f=dir.x*fx+dir.z*fz,s=dir.x*Math.cos(yaw)-dir.z*Math.sin(yaw);
  if(head){f+=.25;}const L=Math.hypot(f,s)||1;f/=L;s/=L;
  const heavy=z.V&&z.V.heavy;const a=[],v=[];for(const k of RJ467){a.push(z[k]?z[k].rotation.x:0);v.push(0);}
  z.rd467={th:.02,w:Math.min(4,(1.1+(d||20)*.022)*(heavy?.6:1)),f,s,a,v,land:0,sp:[rand(.2,.9),rand(.2,.9)],bend:rand(.3,1)};}catch(e){e467(e,'kill');z.rd467=null;}};}
function rdKick467(R,m){for(let i=0;i<R.v.length;i++)R.v[i]+=rand(-m,m);}
function updateDead467(z,dt){const R=z.rd467;z.deadT+=dt;const k=z.deadT,sc=z.V.scale||1;
  const Gk=6.2/sc;R.w+=Gk*Math.sin(R.th+.1)*dt;R.w*=Math.exp(-.35*dt);R.th+=R.w*dt;if(R.th<0){R.th=0;R.w=Math.abs(R.w)*.3+.15;}
  if(R.th>=1.5){R.th=1.5;if(R.w>.55){R.w=-R.w*.26;rdKick467(R,3.2);}else R.w=0;if(!R.land){R.land=1;z.landed=true;rdKick467(R,4.5);
    _tmp.set(z.g.position.x+Math.sin(z.g.rotation.y)*R.f*.8*sc+Math.cos(z.g.rotation.y)*R.s*.8*sc,.02,z.g.position.z+Math.cos(z.g.rotation.y)*R.f*.8*sc-Math.sin(z.g.rotation.y)*R.s*.8*sc);
    emit(_tmp,_up,8,DUST,{speed:1.3,spread:.8,life:.55,size:.1,grav:.8});_n.set(0,1,0);_tmp.y=.006;addDecal(bloods,_tmp,_n,.95*sc);fx.shake+=z.V.heavy?.35:.04;}}
  const th=R.th,u=th/1.5,buck=Math.min(1,k/.22),fw=R.f;
  _ax467.set(fw,0,-R.s).normalize();z.body.quaternion.setFromAxisAngle(_ax467,th);z.body.position.y=u*.05;
  z.hips.position.y=.95-buck*.2*(1-u*.5);
  const T_=[ (fw<0?1.25:.75)*buck*(1-u*.65), (fw<0?1.05:.6)*buck*(1-u*.7), -.55*buck*(1-u)+u*fw*.15, -.3*buck*(1-u)+u*fw*.05,
    fw*(.25+.25*u)*R.bend, R.land?-R.sp[0]*2.2:-fw*1.3*Math.min(1,th*1.4)-.4, R.land?-R.sp[1]*2.0:-fw*1.1*Math.min(1,th*1.4)-.5, R.land?-.25:-.8, R.land?-.4:-.6, R.land?-fw*.5:-fw*1.0*Math.min(1,th*1.6)];
  const kS=R.land?38:58,kD=R.land?7:9;
  for(let i=0;i<RJ467.length;i++){const J=z[RJ467[i]];R.v[i]+=(kS*(T_[i]-R.a[i])-kD*R.v[i])*dt;R.a[i]+=R.v[i]*dt;if(J)J.rotation.x=R.a[i];}
  if(z.shL)z.shL.rotation.z=.25+.5*u;if(z.shR)z.shR.rotation.z=-.25-.45*u;if(z.jaw)z.jaw.rotation.x=.1+.5*u;
  if(z.sv){z.g.position.addScaledVector(z.sv,dt);z.sv.multiplyScalar(Math.exp(-(R.land?4.5:1.6)*dt));}
  collide(z.g.position,.3);
  if(k>4.8&&z.blob)z.blob.visible=false;if(k>6.4){z.alive=false;z.g.visible=false;z.rd467=null;updateHUD();}}
{const _ud=updateDead;updateDead=function(z,dt){if(M467.on&&z&&z.rd467&&zsShow()){try{updateDead467(z,dt);return;}catch(e){e467(e,'dead');z.rd467=null;}}return _ud(z,dt);};}
// ---------- 9/10) ammo drops ----------
const AM467={pistol:['9mm',0xd8b04a],smg:['9mm',0xd8b04a],burst:['9mm',0xd8b04a],revolver:['.357',0xe08a3a],fox:['5.56',0x8fbf4a],ar:['5.56',0x8fbf4a],minigun:['7.62',0x8fbf4a],shotgun:['12G',0xd0453a],dbarrel:['12G',0xd0453a],saw:['12G',0xd0453a],thunder:['12G',0xd0453a],
  sniper:['.50',0x5a8cff],hunt:['.308',0x5a8cff],crossbow:['Dardi',0x9ac85a],laser:['Cella',0x40e8f0],plasma:['Plasma',0xff8a30],glauncher:['40mm',0x9a9a50],vespa:['40mm',0x9a9a50],flamer:['Gas',0xff6020]};
function amLab467(id){const A=AM467[id]||['Colpi',0xd8b04a];return ctex43('am467_'+A[0],128,64,(g,w,h)=>{const c='#'+new T.Color(A[1]).getHexString();g.fillStyle='#262b22';g.fillRect(0,0,w,h);g.fillStyle=c;g.fillRect(0,0,w,14);g.fillRect(0,h-10,w,10);
  g.fillStyle='#f4ead0';g.font='bold 26px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(A[0],w/2,h/2+2);g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3);});}
{const boxG=new T.BoxGeometry(1,1,1),bulG=new T.CylinderGeometry(.022,.022,.1,8),tipG=new T.ConeGeometry(.022,.04,8),clipG=new T.BoxGeometry(.07,.2,.13),brass=new T.MeshStandardMaterial({color:0xd9a640,metalness:.8,roughness:.3,emissive:0x2a1a00}),cop=new T.MeshStandardMaterial({color:0xb5652e,metalness:.7,roughness:.35}),dark=new T.MeshStandardMaterial({color:0x22252a,metalness:.6,roughness:.45});
 for(const d of drops){if(d.type!=='ammo')continue;try{for(let i=d.item.children.length-1;i>=0;i--){const c=d.item.children[i];if(!c.isSprite)d.item.remove(c);}
  const lab=new T.MeshStandardMaterial({map:amLab467('pistol'),roughness:.6}),side=new T.MeshStandardMaterial({color:0x3a4130,roughness:.7}),stripe=new T.MeshBasicMaterial({color:0xd8b04a});
  const b=new T.Mesh(boxG,[side,side,side,side,lab,lab]);b.scale.set(.42,.22,.26);item467(d.item,b);const lid=new T.Mesh(boxG,stripe);lid.scale.set(.43,.035,.27);lid.position.y=.12;d.item.add(lid);
  const cl=new T.Mesh(clipG,dark);cl.position.set(.27,.02,0);cl.rotation.z=.25;d.item.add(cl);
  for(let i=0;i<3;i++){const u=new T.Mesh(bulG,brass);u.position.set(-.1+i*.07,.19,0);d.item.add(u);const tp=new T.Mesh(tipG,cop);tp.position.set(-.1+i*.07,.26,0);d.item.add(tp);}
  d.lab467=lab;d.stripe467=stripe;const h=d.item.children.find(c=>c.isSprite);if(h){d.halo467=h;h.scale.set(1.1,1.1,1);}}catch(e){e467(e,'ammoM');}}}
function item467(p,m){p.add(m);}
function ammoPlan467(boss){const L=WEAPONS.filter(w=>own[w.id]&&!w.melee&&!w.tool&&w.mag&&(res[w.id]|0)<w.maxReserve);for(let i=L.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[L[i],L[j]]=[L[j],L[i]];}
  const n=Math.min(L.length,boss?3:(Math.random()<.4?2:1));const out=[];for(let i=0;i<n;i++){const w=L[i],heavy=w.kind==='sniper'||w.kind==='launcher'||w.kind==='bolt'||w.mag<=2;
    const amt=Math.max(1,Math.round(heavy?w.mag*rand(.25,.45)+(w.mag<=2?1:0):w.mag*rand(.22,.4)));out.push([w.id,Math.min(amt,w.maxReserve-(res[w.id]|0))]);}return out;}
{const _sd=spawnDrop;spawnDrop=function(type,x,z){if(type!=='ammo'||!M467.on)return _sd(type,x,z);const before=drops.filter(d=>d.type==='ammo'&&!d.on);const ok=_sd(type,x,z);try{if(ok){const d=before.find(q=>q.on);if(d){d.plan467=ammoPlan467(false);const id=d.plan467[0]&&d.plan467[0][0];const A=AM467[id]||['Colpi',0xd8b04a];if(d.lab467){d.lab467.map=amLab467(id||'pistol');}if(d.stripe467)d.stripe467.color.setHex(A[1]);if(d.halo467)d.halo467.material.color.setHex(A[1]);if(d.ring&&d.ring.material)d.ring.material.color.setHex(A[1]);}}}catch(e){e467(e,'sd');}return ok;};}
{const _ad=applyDrop;applyDrop=function(d){if(d.type!=='ammo'||!M467.on)return _ad(d);try{const plan=(d.plan467&&d.plan467.length)?d.plan467:ammoPlan467(false);d.plan467=null;const got=[];
   for(const [id,n] of plan){const w=WEAPONS.find(q=>q.id===id);if(!w||!own[id])continue;const b=res[id]|0;res[id]=Math.min(w.maxReserve,b+n);const g=res[id]-b;if(g>0)got.push('+'+g+' '+((AM467[id]||['colpi'])[0])+' ('+w.name+')');}
   d.on=false;d.root.visible=false;if(!got.length){inv.metal+=1;bump('mMetal');got.push('+1 metallo');}
   _tmp.set(d.x,.7,d.z);emit(_tmp,_up,18,[0xffd27a,0xffffff],{speed:3,spread:1,life:.55,size:.055,grav:2});toast('🔫 '+got.join(' · '),1800);floatText(got[0],'#ffd27a');play('drop');updateHUD();}catch(e){e467(e,'ad');return _ad(d);}};}
// ---------- 11) coins ----------
{try{const pr=[[0,-.013],[.098,-.013],[.106,-.02],[.121,-.016],[.124,0],[.121,.016],[.106,.02],[.098,.013],[0,.013]].map(p=>new T.Vector2(p[0],p[1]));
 const g=new T.LatheGeometry(pr,22);g.rotateX(Math.PI/2);const P=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<P.count;i++)uv.setXY(i,P.getX(i)/.25+.5,P.getY(i)/.25+.5);uv.needsUpdate=true;g.computeVertexNormals();
 const tex=ctex43('coin467',128,128,(c,w,h)=>{const r=c.createRadialGradient(48,44,6,64,64,64);r.addColorStop(0,'#fff3b0');r.addColorStop(.45,'#f2c040');r.addColorStop(1,'#a8700c');c.fillStyle=r;c.fillRect(0,0,w,h);
   c.strokeStyle='rgba(120,70,0,.7)';c.lineWidth=4;c.beginPath();c.arc(64,64,40,0,7);c.stroke();c.strokeStyle='rgba(255,240,180,.7)';c.lineWidth=2;c.beginPath();c.arc(64,63,38,0,7);c.stroke();
   c.font='900 46px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='rgba(110,60,0,.75)';c.fillText('Z',66,67);c.fillStyle='#ffe58a';c.fillText('Z',63,63);});
 const mat=new T.MeshStandardMaterial({color:0xffd050,map:tex,emissive:0x5a3800,emissiveIntensity:.8,metalness:.9,roughness:.22});
 for(const c of COINS){c.m.geometry=g;c.m.material=mat;c.m.rotation.order='YXZ';}}catch(e){e467(e,'coinM');}}
const _cs467={x:0,z:0};
dropCoins=function(x,z,total){if(total<=0)return;const n=Math.min(7,Math.max(1,Math.ceil(total/3)));let left=total;
  for(let i=0;i<n;i++){const c=COINS.find(q=>!q.on);const v=i===n-1?left:Math.max(1,Math.round(total/n));left-=v;if(!c){addCoins(v);continue;}
    const a=Math.random()*Math.PI*2,sp=rand(1.4,3.2);Object.assign(c,{on:true,v,x,y:1,z,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:rand(3.4,5.4),t:0,b:0,mag:false,st:0,roll:0,tilt:0,wx:rand(-14,14),wz:rand(-10,10),set:0});
    c.m.visible=true;c.m.position.set(x,1,z);c.m.scale.setScalar(1);}};
coinsUpd=function(dt){const px=player.pos.x,pz=player.pos.z,R=EQ.magnet?6:3.6;let sp=0;
  for(const c of COINS){if(!c.on)continue;c.t+=dt;const dx=px-c.x,dz=pz-c.z,d=Math.hypot(dx,dz),m=c.m;
    if(!c.mag&&c.t>.06&&d<R)c.mag=true;
    if(c.mag){const k=Math.min(1,dt*(11+c.t*4));c.x+=dx*k;c.z+=dz*k;c.y+=(1.0-c.y)*k;m.rotation.x=0;m.rotation.y+=dt*14;
      if(d<.8){c.on=false;m.visible=false;addCoins(c.v);if(game.time-coinSndT>.07){coinSndT=game.time;play('coin');}if(window.q42)q42('coin',c.v);continue;}}
    else if(c.st===0){c.vy-=13*dt;c.x+=c.vx*dt;c.z+=c.vz*dt;c.y+=c.vy*dt;m.rotation.x+=c.wx*dt;m.rotation.z+=c.wz*dt;
      if(c.y<.125){c.y=.125;if(c.vy<-1.4&&c.b<3){c.vy=-c.vy*.42;c.vx*=.78;c.vz*=.78;c.wx*=-.6;c.b++;}else{c.vy=0;c.st=1;c.tilt=0;}}}
    else if(c.st===1){const s=Math.hypot(c.vx,c.vz);const ns=Math.max(0,s-1.7*dt);if(s>0){c.vx*=ns/s;c.vz*=ns/s;}c.x+=c.vx*dt;c.z+=c.vz*dt;c.roll+=ns/.12*dt;
      m.rotation.y=Math.atan2(c.vx,c.vz)+Math.PI/2;c.tilt=Math.min(1,c.tilt+dt*.25+(ns<.5?dt*2:0));m.rotation.x=-c.tilt*c.tilt*Math.PI/2*(ns<.5?1:.18);m.rotation.z=c.roll;c.y=.125-.0*c.tilt;if(ns<.05&&c.tilt>=1){c.st=3;c.set=0;}}
    else{c.set+=dt;m.rotation.x=-Math.PI/2;c.y=.02;}
    _cs467.x=c.x;_cs467.z=c.z;collide(_cs467,.12);c.x=_cs467.x;c.z=_cs467.z;
    if(!c.mag&&c.t>25){c.on=false;m.visible=false;continue;}
    m.position.set(c.x,c.y,c.z);
    if(Math.random()<dt*1.2&&sp<3){sp++;_cv.set(c.x,c.y+.1,c.z);emit(_cv,_up,1,[0xfff6c0,0xffd040],{speed:.5,spread:1,life:.45,size:.045,grav:-1});}}};
// ---------- 8) weapon find + compare ----------
const WC467={el:null,w:null,q:[],open:false};
function wcStats467(w){if(!w||w.melee||w.tool)return [0,0,0,0];return [Math.round((w.dmg||0)*(w.pellets||1)),Math.round(10/(w.rate||1))/10,Math.max(0,Math.min(100,Math.round(100-((w.hipSpread!=null?w.hipSpread:(w.spread||0)*2.5)*1000)))),w.mag||0];}
function wcOpen467(w){const cur=WEAPONS[curW];const base=(cur&&!cur.melee&&!cur.tool)?cur:null;const a=wcStats467(w),b=wcStats467(base);
  if(!WC467.el){const e=document.createElement('div');e.id='wcmp467';e.className='hidden';document.body.appendChild(e);WC467.el=e;
    e.addEventListener('click',ev=>{const t=ev.target.closest('button');if(!t)return;wcAct467(t.dataset.a==='swap');});}
  const N=['Danno','Cadenza (colpi/s)','Precisione','Caricatore'],ar=(x,y)=>x>y?'<span class="up">▲</span>':x<y?'<span class="dn">▼</span>':'<span class="eq">=</span>';
  WC467.el.innerHTML='<div class="c"><h3>🔫 Hai trovato: '+esc(w.name)+'</h3><small>'+(base?'Confronto con '+esc(base.name)+' (in mano)':'Non hai un\'arma da fuoco in mano')+'</small><table>'+
    N.map((n,i)=>'<tr><td>'+n+'</td><td class="v">'+(base?b[i]:'—')+'</td><td class="v"><b>'+a[i]+'</b> '+ar(a[i],b[i])+'</td></tr>').join('')+'</table><div class="b"><button data-a="bag">🎒 Metti nello zaino</button><button class="p" data-a="swap">Sostituisci</button></div></div>';
  WC467.w=w;WC467.open=true;game.state='wcmp467';firing=false;try{resetTouchState();}catch(e){}if(document.pointerLockElement)document.exitPointerLock();WC467.el.classList.remove('hidden');}
function wcAct467(swap){try{const w=WC467.w;WC467.open=false;if(WC467.el)WC467.el.classList.add('hidden');if(w){const i=WEAPONS.indexOf(w);own[w.id]=true;mag[w.id]=w.mag;res[w.id]=Math.max(res[w.id]|0,w.reserveGive|0);
   if(swap){curW=-1;equip(i,true);toast('🔫 '+w.name+' in mano',1300);}else toast('🎒 '+w.name+' nello zaino',1300);try{renderWBar();}catch(e){}try{svSave();}catch(e){}play('pickup',2);}
  WC467.w=null;}catch(e){e467(e,'wc');}if(game.state==='wcmp467'){game.state='play';last=performance.now();if(!isTouch)try{lockPointer();}catch(e){}}updateHUD();}
{const _lc=loot452Crate;loot452Crate=function(c){const was=c&&!c.open;_lc(c);try{if(!M467.on||!was||!c.open||!SV.on)return;if(Math.random()>.16)return;
   const L=WEAPONS.filter(w=>!w.shop&&!w.melee&&!w.tool&&w.mag&&!own[w.id]);if(!L.length)return;WC467.q.push(L[(Math.random()*L.length)|0]);}catch(e){e467(e,'crate');}};}
{const _bk=window.__zsBack;window.__zsBack=function(){if(WC467.open){wcAct467(false);return true;}return _bk?_bk():false;};}
addEventListener('keydown',e=>{if(!WC467.open)return;if(e.code==='Enter'){e.preventDefault();wcAct467(true);}else if(e.code==='Escape'||e.code==='KeyE'){e.preventDefault();wcAct467(false);}});
// ---------- per-frame ----------
{const _l0=loop0;let last7=0;loop0=function(now){try{if(M467.on){const dt=last7?Math.min(.1,(now-last7)/1000):0;last7=now;const play=game.state==='play'&&SV.on&&!(typeof ARENA454!=='undefined'&&ARENA454.on);
  rainTick467(dt,play);if(game.state==='play')mistTick467(dt);
  if(WC467.open&&game.state==='play')game.state='wcmp467';if(!WC467.open&&WC467.q.length&&game.state==='play')wcOpen467(WC467.q.shift());}}catch(e){e467(e,'tick');}return _l0(now);};}
window.__zs467={rain:v=>{RAIN467.on=!!v;RAIN467.left=60;RAIN467.k=v?1:0;},wc:id=>wcOpen467(WEAPONS.find(w=>w.id===id)),wcAct:s=>wcAct467(s),drop:(x,z)=>{spawnDrop('ammo',x,z);return drops.filter(d=>d.on).length;},coins:(x,z)=>dropCoins(x,z,12),get m(){return M467;},hit:(i,part,dmg)=>{const z=zombies[i];z.alive=true;z.dead=false;z.hp=dmg?z.hp:1;z.g.visible=true;const p=z.g.position.clone();p.y=part==='head'?1.7:1.1;damageZombie(z,dmg||500,part||'body',p,new T.Vector3(1,0,0));return z.dead;},step:dt=>{rainTick467(dt,true);mistTick467(dt);coinsUpd(dt);for(const z of zombies)if(z.dead&&z.alive)updateDead(z,dt);updateADS(dt,WEAPONS[curW]);return {ret:RET467.c,g:RET467.g,rain:rain467.visible,coins:COINS.filter(c=>c.on).map(c=>c.st)};}};
