/* Zombie Survival — game code part 01-audio-fx (game.html lines 2022-2114 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ---------- audio (WebAudio synth) ----------
const AU={ctx:null,master:null,noise:null,groans:0};
function audioInit(){if(AU.ctx){if(AU.ctx.state!=='running')AU.ctx.resume();return;}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const phone=isTouch||/Android/i.test(navigator.userAgent);
  try{let c;try{c=new AC(phone?{latencyHint:'balanced'}:{latencyHint:'interactive'});}catch(e){try{c=new AC();}catch(e2){return;}}AU.ctx=c;const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=8;comp.attack.value=.003;comp.release.value=.22;AU.master=c.createGain();AU.master.gain.value=SET.mute?0:.62;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=phone?170:90;hp.Q.value=.7;AU.hp=hp;const hp2=c.createBiquadFilter();hp2.type='highpass';hp2.frequency.value=phone?140:70;hp2.Q.value=.5;const lpM=c.createBiquadFilter();lpM.type='highshelf';lpM.frequency.value=5200;lpM.gain.value=phone?-6:-4;AU.master.connect(hp).connect(hp2).connect(lpM).connect(comp).connect(c.destination);
  const n=c.sampleRate*1.5,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;AU.noise=b;}catch(e){AU.ctx=null;}}
function out(pan){const c=AU.ctx;if(pan&&c.createStereoPanner){const k=Math.round(clamp(pan,-1,1)*4);if(!k)return AU.master;const P=AU.pan433||(AU.pan433={});let p=P[k];if(!p){p=c.createStereoPanner();p.pan.value=k/4;p.connect(AU.master);P[k]=p;}return p;}return AU.master;}
function nz(t0,dur,vol,type,f0,f1,q,dest){if((AU.v433|0)>=20||vol<.015)return;const c=AU.ctx,s=c.createBufferSource();AU.v433=(AU.v433|0)+1;s.onended=()=>{AU.v433--;};s.buffer=AU.noise;s.playbackRate.value=rand(.9,1.1);const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t0);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t0+dur);f.Q.value=q||.7;
  const g=c.createGain();g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dur);s.connect(f).connect(g).connect(dest||AU.master);s.start(t0,Math.random()*.5);s.stop(t0+dur+.02);}
function osc(t0,dur,vol,type,f0,f1,dest,att){if((AU.v433|0)>=20||vol<.015)return;const c=AU.ctx,o=c.createOscillator();AU.v433=(AU.v433|0)+1;o.onended=()=>{AU.v433--;};o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);const g=c.createGain();
  g.gain.setValueAtTime(att?0.0001:vol,t0);if(att)g.gain.exponentialRampToValueAtTime(vol,t0+att);g.gain.exponentialRampToValueAtTime(.001,t0+dur);o.connect(g).connect(dest||AU.master);o.start(t0);o.stop(t0+dur+.02);}
const SFX={
 pistol(){const t=AU.ctx.currentTime;nz(t,.22,.9,'lowpass',6000,600);nz(t,.05,.6,'highpass',3000);osc(t,.14,.7,'sine',190,45);osc(t,.06,.25,'square',900,200);},
 shotgun(){const t=AU.ctx.currentTime;nz(t,.55,1.2,'lowpass',4200,300);nz(t,.08,.8,'highpass',2000);osc(t,.3,1,'sine',130,32);osc(t,.12,.4,'triangle',300,60);
   nz(t+.38,.05,.45,'bandpass',2500,0,3);nz(t+.42,.06,.25,'bandpass',900,0,2);nz(t+.56,.05,.5,'bandpass',3000,0,3);osc(t+.56,.03,.15,'square',600,300);},
 laser(){const t=AU.ctx.currentTime;osc(t,.13,.22,'sawtooth',2400,180);osc(t,.1,.18,'square',1600,90);nz(t,.06,.2,'highpass',5000);},
 knife(){const t=AU.ctx.currentTime;nz(t,.16,.35,'bandpass',600,3500,1.5);},
 knifeHit(){const t=AU.ctx.currentTime;nz(t,.12,.6,'lowpass',900,200);osc(t,.08,.3,'sine',160,60);},
 empty(){const t=AU.ctx.currentTime;nz(t,.03,.3,'bandpass',3000,0,4);},
 reload(w){const t=AU.ctx.currentTime;nz(t+.05,.05,.35,'bandpass',1800,0,3);nz(t+w*.55,.06,.4,'bandpass',1200,0,3);nz(t+w*.85,.05,.5,'bandpass',2600,0,4);osc(t+w*.85,.03,.15,'square',800,400);},
 hit(head){const t=AU.ctx.currentTime;nz(t,.09,.5,'lowpass',1200,300);if(head){osc(t,.18,.25,'sine',1500,1400);osc(t+.02,.2,.15,'sine',2200,2100);}else osc(t,.05,.12,'square',1100,900);},
 kill(){const t=AU.ctx.currentTime;osc(t,.12,.15,'triangle',700,1400);},
 hurt(){const t=AU.ctx.currentTime;nz(t,.2,.8,'lowpass',500,100);osc(t,.2,.5,'sine',110,50);},
 pickup(k){const t=AU.ctx.currentTime;const f=[660,780,880][k]||700;osc(t,.12,.25,'sine',f,f*1.5);osc(t+.07,.16,.2,'sine',f*1.5,f*2);},
 craft(){const t=AU.ctx.currentTime;for(let i=0;i<3;i++){nz(t+i*.12,.06,.5,'bandpass',1500+i*500,0,3);}osc(t+.36,.3,.25,'triangle',523,1046);},
 impact(){const t=AU.ctx.currentTime;nz(t,.05,.2,'bandpass',3500,0,2);},
};
function play(name,arg){if(!AU.ctx)return;try{SFX[name](arg);}catch(e){}}
function groanOld(z,kind){if(!AU.ctx||AU.groans>=3)return;const c=AU.ctx,t=c.currentTime;
  const dx=z.g.position.x-camera.position.x,dz=z.g.position.z-camera.position.z,d=Math.hypot(dx,dz);if(d>30)return;
  const rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);const pan=(dx*rx+dz*rz)/(d+.1);
  const vol=clamp(1.2/(1+d*.22),0,1)*(kind==='atk'?1.3:1);const dest=out(pan*.8);
  const base=(kind==='atk'?140:kind==='die'?110:rand(70,105))*z.V.pitch,dur=kind==='atk'?.45:kind==='die'?1.1:rand(.9,1.6);
  const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(base,t);o.frequency.linearRampToValueAtTime(base*(kind==='die'?.5:rand(.75,1.2)),t+dur);
  const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=rand(5,9);lg.gain.value=base*.08;lfo.connect(lg).connect(o.frequency);
  const f1=c.createBiquadFilter();f1.type='bandpass';f1.frequency.value=rand(450,650);f1.Q.value=5;const f2=c.createBiquadFilter();f2.type='bandpass';f2.frequency.value=rand(950,1250);f2.Q.value=6;
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.12);g.gain.setValueAtTime(vol,t+dur*.6);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(f1);o.connect(f2);const mix=c.createGain();mix.gain.value=2.2;f1.connect(mix);f2.connect(mix);mix.connect(g).connect(dest);
  nz(t,dur,vol*.25,'bandpass',800,400,2,dest);
  o.start(t);lfo.start(t);o.stop(t+dur+.05);lfo.stop(t+dur+.05);AU.groans++;setTimeout(()=>AU.groans--,dur*1000);}

// ---------- particles (single InstancedMesh, pooled) ----------
const PMAX=360;const pMesh=new T.InstancedMesh(G.box,new T.MeshBasicMaterial({color:0xffffff}),PMAX);pMesh.frustumCulled=false;pMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(pMesh);
const parts=[];const _o=new T.Object3D(),_c=new T.Color(),ZERO=new T.Matrix4().makeScale(0,0,0);
for(let i=0;i<PMAX;i++){parts.push({life:0,max:1,p:new T.Vector3(),v:new T.Vector3(),s:.05,g:9,spin:0});pMesh.setMatrixAt(i,ZERO);pMesh.setColorAt(i,_c.set(0xffffff));}
let pIdx=0;
function emit(pos,dir,n,color,o){o=o||{};n=emit433(n);for(let k=0;k<n;k++){const P=parts[pIdx];const idx=pIdx;pIdx=(pIdx+1)%PMAX;
  P.p.copy(pos);const sp=o.speed||3,spr=o.spread===undefined?.6:o.spread;P.v.set(dir.x+rand(-spr,spr),dir.y+rand(-spr,spr)+(o.up||0),dir.z+rand(-spr,spr)).normalize().multiplyScalar(sp*rand(.4,1.1));
  P.max=P.life=(o.life||.5)*rand(.6,1.2);P.s=(o.size||.05)*rand(.6,1.3);P.g=o.grav===undefined?9:o.grav;P.stretch=o.stretch||0;
  _c.set(Array.isArray(color)?color[(Math.random()*color.length)|0]:color);pMesh.setColorAt(idx,_c);}pMesh.instanceColor.needsUpdate=true;}
const _q=new T.Quaternion(),_up=new T.Vector3(0,1,0),_vtmp=new T.Vector3();
function updateParticles(dt){let any=false;for(let i=0;i<PMAX;i++){const P=parts[i];if(P.life<=0)continue;any=true;P.life-=dt;
  if(P.life<=0){pMesh.setMatrixAt(i,ZERO);continue;}P.v.y-=P.g*dt;P.p.addScaledVector(P.v,dt);if(P.p.y<.02){P.p.y=.02;P.v.multiplyScalar(.3);P.v.y=0;}
  const k=P.life/P.max,s=P.s*(.4+.6*k);_o.position.copy(P.p);
  if(P.stretch){_vtmp.copy(P.v).normalize();_o.quaternion.setFromUnitVectors(_up,_vtmp);_o.scale.set(s*.5,s*(1+P.stretch*P.v.length()*.08),s*.5);}else{_o.quaternion.identity();_o.scale.set(s,s,s);}
  _o.updateMatrix();pMesh.setMatrixAt(i,_o.matrix);}if(any)pMesh.instanceMatrix.needsUpdate=true;}

// ---------- decals (pooled instanced quads) ----------
function decalPool(tex,n){const m=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),n);
  m.frustumCulled=false;for(let i=0;i<n;i++)m.setMatrixAt(i,ZERO);scene.add(m);return {m,n,i:0};}
const holes=decalPool(holeTex,70),bloods=decalPool(bloodTex,40);const _z=new T.Vector3(0,0,1);
function addDecal(pool,pos,normal,size){_o.position.copy(pos).addScaledVector(normal,.012);_o.quaternion.setFromUnitVectors(_z,normal);_q.setFromAxisAngle(_z,Math.random()*6.28);_o.quaternion.multiply(_q);_o.scale.set(size,size,size);_o.updateMatrix();
  pool.m.setMatrixAt(pool.i,_o.matrix);pool.i=(pool.i+1)%pool.n;pool.m.instanceMatrix.needsUpdate=true;}

// ---------- tracers (pooled stretched boxes) ----------
const tracers=[];
for(let i=0;i<16;i++){const m=new T.Mesh(G.box,new T.MeshBasicMaterial({color:0xffe0a0,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));m.visible=false;scene.add(m);tracers.push({m,t:0,max:.06});}
let trIdx=0;
function tracer(from,to,color,width,life,op){const tr=tracers[trIdx];trIdx=(trIdx+1)%tracers.length;const len=Math.max(.08,from.distanceTo(to));tr.m.position.copy(from).lerp(to,.5);tr.m.lookAt(to);tr.m.scale.set(width,width,len);tr.m.material.color.setHex(color);tr.op=op==null?1:op;tr.m.material.opacity=tr.op;tr.m.visible=true;tr.t=tr.max=life;}
const slashTex449=canvasTex(160,160,(g)=>{g.clearRect(0,0,160,160);g.translate(80,80);g.rotate(-.45);g.lineCap='round';
  const gr=g.createLinearGradient(-70,24,74,-28);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.22,'rgba(255,236,190,.25)');gr.addColorStop(.42,'rgba(255,250,230,.96)');gr.addColorStop(.74,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.strokeStyle=gr;g.lineWidth=18;g.beginPath();g.arc(8,16,58,Math.PI*1.02,Math.PI*1.9);g.stroke();g.lineWidth=6;g.strokeStyle='rgba(255,255,255,.75)';g.stroke();});
const slashS449=new T.Sprite(new T.SpriteMaterial({map:slashTex449,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0,fog:false}));
slashS449.visible=false;slashS449.frustumCulled=false;slashS449.scale.set(1.65,1.2,1);scene.add(slashS449);
let slashT449=0;const slashDir449=new T.Vector3();
function slashShow449(bloody){slashDir449.copy(_dir);slashS449.position.copy(camera.position).addScaledVector(_dir,1.28);slashS449.position.y-=.08;slashS449.material.color.setHex(bloody?0xffb4aa:0xfff4dc);slashS449.material.rotation=-.85+Math.random()*1.6;slashS449.material.opacity=.95;slashS449.visible=true;slashT449=.2;}
const SP449=[];
for(let i=0;i<8;i++){const s=new T.Sprite(new T.SpriteMaterial({map:flashTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0,fog:false}));s.visible=false;s.frustumCulled=false;scene.add(s);SP449.push({s,t:0,max:.09});}
let sp449i=0;
function spark449(pos,hex,sz){const sp=SP449[sp449i];sp449i=(sp449i+1)%SP449.length;sp.s.position.copy(pos);sp.s.material.color.setHex(hex);sp.s.material.opacity=.95;const sc=sz||.28;sp.s.scale.set(sc,sc,1);sp.s.visible=true;sp.t=sp.max=.09;}
function updateTracers(dt){for(const tr of tracers){if(!tr.m.visible)continue;tr.t-=dt;if(tr.t<=0)tr.m.visible=false;else tr.m.material.opacity=(tr.op==null?1:tr.op)*(tr.t/tr.max);}
  if(slashT449>0){slashT449-=dt;slashS449.material.opacity=Math.max(0,slashT449/.2);slashS449.position.addScaledVector(slashDir449,dt*.5);if(slashT449<=0)slashS449.visible=false;}
  for(const sp of SP449){if(!sp.s.visible)continue;sp.t-=dt;if(sp.t<=0)sp.s.visible=false;else{sp.s.material.opacity=sp.t/sp.max;sp.s.scale.multiplyScalar(1+dt*2.4);}}}

// ---------- floating damage numbers (DOM pool) ----------
const nums=[];for(let i=0;i<14;i++){const d=document.createElement('div');d.className='dmgNum';$('nums').appendChild(d);nums.push({d,t:0,p:new T.Vector3()});}
let numIdx=0;const _proj=new T.Vector3();
function dmgNumber(pos,val,head,z){for(const q of nums){if(q.t>.55&&q.z===z&&z){q.val+=val;q.t=.8;q.d.textContent=Math.round(q.val);if(head)q.d.className='dmgNum h';return;}}
  const n=nums[numIdx];numIdx=(numIdx+1)%nums.length;n.z=z;n.val=val;n.p.copy(pos);n.p.x+=rand(-.15,.15);n.t=.8;n.d.textContent=Math.round(val);n.d.className='dmgNum'+(head?' h':'');n.d.style.display='block';}
function updateNums(dt){for(const n of nums){if(n.t<=0)continue;n.t-=dt;n.p.y+=dt*.9;if(n.t<=0){n.d.style.display='none';continue;}
  _proj.copy(n.p).project(camera);if(_proj.z>1){n.d.style.display='none';continue;}n.d.style.display='block';
  n.d.style.transform='translate('+((_proj.x*.5+.5)*VW()-10)+'px,'+((-_proj.y*.5+.5)*VH())+'px) scale('+(.8+n.t*.5)+')';n.d.style.opacity=Math.min(1,n.t*3);}}

