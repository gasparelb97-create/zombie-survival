/* Zombie Survival — game code part 11-v443-v465 (game.html lines 6924-7336 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ===== 4.3.43: solo zombie e porta della casa =====
function tagLimb442(root,slot){if(!root)return;root.traverse(o=>{if(o.isMesh)o.userData.slot=slot;});}
function homeLimb442(z){if(z._home442)return;z._home442=[];const pairs=[[z.shL,z.spine,'armL'],[z.shR,z.spine,'armR'],[z.hipL,z.hips,'legL'],[z.hipR,z.hips,'legR']];
  for(const [piv,parent,slot] of pairs){if(!piv||!parent)continue;tagLimb442(piv,slot);z._home442.push({p:piv,parent:parent,pos:piv.position.clone(),quat:piv.quaternion.clone()});}
  if(z.neck)tagLimb442(z.neck,'head');}
function restore442(z){if(!z||!z._home442)return;for(const h of z._home442){if(h.p.parent!==h.parent){h.parent.add(h.p);h.p.position.copy(h.pos);h.p.quaternion.copy(h.quat);h.p.scale.set(1,1,1);}h.p.visible=true;}if(z.neck)z.neck.visible=true;z.gore=null;z.legGone=0;z.crawl=0;}
for(const z of zombies)homeLimb442(z);
const _rp442=resetPose;resetPose=function(z){try{restore442(z);}catch(e){}return _rp442(z);};
const GIB442=[];const goreBrain=new T.MeshLambertMaterial({color:0xc48a98}),goreOrgan=new T.MeshLambertMaterial({color:0x8a1c2c});
const goreBit=new T.SphereGeometry(1,14,12);
function chunk442(pos,dir,mat,n,sc){for(let i=0;i<n&&GIB442.length<56;i++){const m=new T.Mesh(goreBit,mat);m.castShadow=false;const s1=sc*(0.62+Math.random()*0.7);m.scale.setScalar(s1);m.position.copy(pos);m.position.x+=(Math.random()-0.5)*0.05;m.position.y+=(Math.random()-0.5)*0.05;m.position.z+=(Math.random()-0.5)*0.05;scene.add(m);
  const sp=1.5+Math.random()*2.4;GIB442.push({o:m,chunk:1,age:0,v:new T.Vector3((dir?dir.x:0)*sp+(Math.random()-0.5)*1.1,0.9+Math.random()*2.3,(dir?dir.z:0)*sp+(Math.random()-0.5)*1.1)});}}
function sever442(z,slot,dir){z.gore=z.gore||{};if(z.gore[slot])return;const map={armL:z.shL,armR:z.shR,legL:z.hipL,legR:z.hipR};const piv=map[slot];if(!piv)return;z.gore[slot]=1;piv.updateWorldMatrix(true,true);const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();piv.matrixWorld.decompose(p,q,s);if(piv.parent)piv.parent.remove(piv);scene.add(piv);piv.position.copy(p);piv.quaternion.copy(q);piv.scale.copy(s);piv.visible=true;
  GIB442.push({o:piv,chunk:0,z:z,age:0,v:new T.Vector3((dir?dir.x:0)*1.8+(Math.random()-0.5),1.4+Math.random()*1.2,(dir?dir.z:0)*1.8+(Math.random()-0.5))});
  if(slot==='legL'||slot==='legR'){z.crawl=1;z.limp=1;z.legGone=(z.legGone|0)+1;z.speed=z.legGone>=2?.26:.4;}}
function gore442(z,part,slot,point,dir,gun){if(!z)return;const dead=!!z.dead,pt=(point&&point.x!==undefined)?point:z.g.position;
  const nBits=4+((Math.abs(Math.sin((pt.x||0)*13.1+(pt.y||0)*7.7+(pt.z||0)*9.4+(z.seed||1)))*5)|0);
  chunk442(pt,dir,part==='head'?goreBrain:goreOrgan,nBits,part==='head'?0.09:0.072);
  emit(pt,dir||_up,dead?26:16,BLOOD,{speed:dead?5.2:4.2,spread:1.1,life:0.7,size:0.085,grav:12,up:0.4});
  _n.set(0,1,0);addDecal(bloods,_tmp.set(pt.x,0.008,pt.z),_n,dead?1.25:0.72);
  if(part==='head'&&dead){if(!z.gore||!z.gore.head){z.gore=z.gore||{};z.gore.head=1;if(z.neck)z.neck.visible=false;chunk442(pt,dir,goreBrain,6,0.11);chunk442(pt,dir,goreOrgan,3,0.08);}return;}
  if(slot&&slot!=='head'&&(part==='limb'||slot==='armL'||slot==='armR'||slot==='legL'||slot==='legR'))sever442(z,slot,dir);}
const _dz442=damageZombie;damageZombie=function(z,dmg,part,point,dir,slot){if(!z||z.dead)return _dz442(z,dmg,part,point,dir,slot);const w=WEAPONS[curW];const gun=!!(w&&!w.melee&&!w.tool);const r=_dz442(z,dmg,part,point,dir,slot);try{gore442(z,part,slot,point,dir,gun);}catch(e){}return r;};
poseWalk=function(z,t,amp){const V=z.V,ph=z.phase,g=z.gore||{},s=Math.sin(ph),c=Math.cos(ph),limp=Math.min(1,z.limp||0),run=V.name==='runner',big=!!V.heavy,lean=(z.turn439||0)*(run?0.28:0.18),a=Math.max(0,Math.min(1,amp));
  if(z.crawl){const pull=Math.sin(ph),reach=Math.max(0,Math.cos(ph));
    z.hips.position.y=.34+Math.abs(pull)*.04;z.hips.rotation.set(1.22+reach*.1,pull*.08,(g.legL?0.08:0)-(g.legR?0.08:0));
    z.spine.rotation.set(.22+reach*.12,-pull*.12,pull*.04+lean);
    if(!g.armL){z.shL.rotation.set(-1.7+pull*.7,.1,.18);z.elL.rotation.x=-.7-reach*.35;}
    if(!g.armR){z.shR.rotation.set(-1.7-pull*.7,-.08,-.16);z.elR.rotation.x=-.65-reach*.3;}
    if(!g.legL){z.hipL.rotation.set(.35+Math.max(0,-pull)*.5,.04,.04);z.kneeL.rotation.x=.7+Math.max(0,pull)*.35;}
    if(!g.legR){z.hipR.rotation.set(.35+Math.max(0,pull)*.5,-.04,-.04);z.kneeR.rotation.x=.7+Math.max(0,-pull)*.35;}
    if(z.neck&&z.neck.visible)z.neck.rotation.set(-.85,Math.sin(t*.6+z.seed)*.1,0);
    if(z.jaw)z.jaw.rotation.x=.25+Math.max(0,Math.sin(t*2.2+z.seed))*.35;
    return;}
  const idle=a<0.18,swing=run?0.78:(big?0.42:0.58),arm=run?0.72:(big?0.4:0.62);
  const bob=Math.abs(Math.sin(ph*2));
  if(!g.legL){z.hipL.rotation.set(s*swing*a*(1-limp*0.65),0.02,0.05);z.kneeL.rotation.x=idle?0.16:(0.12+Math.max(0,c)*(run?1.15:0.9)*a*(1-limp*0.4));}
  if(!g.legR){const drag=limp>0.45?0.4:1;z.hipR.rotation.set(-s*swing*a*drag,-0.02,-0.05);z.kneeR.rotation.x=idle?0.16:(0.12+Math.max(0,-c)*(run?1.1:0.88)*a*drag);}
  z.hips.position.y=(run?0.9:(big?0.93:0.95))-limp*0.06+bob*(run?0.055:0.04)*a+(idle?Math.sin(t*1.6+z.seed)*0.012:0);
  z.hips.rotation.x=run?0.06:0.03;z.hips.rotation.y=s*0.1*a;z.hips.rotation.z=Math.cos(ph)*0.07*a+lean*0.35+(g.legL?0.18:(g.legR?-0.18:limp*0.08));
  const hunch=run?0.22:(big?0.1:0.14);
  z.spine.rotation.set(hunch+Math.sin(ph*2)*0.025*a,-s*(run?0.14:0.1)*a,-Math.cos(ph)*0.045*a-limp*0.12+lean*0.25);
  if(!g.armL){z.shL.rotation.set((idle?-0.18:-0.22)+(-s)*arm*a,0.04,0.16);z.elL.rotation.x=(idle?-0.35:-0.48)-Math.max(0,-s)*(run?0.35:0.22)*a;}
  if(!g.armR){z.shR.rotation.set((idle?-0.18:-0.22)+(s)*arm*a,-0.04,-0.16);z.elR.rotation.x=(idle?-0.32:-0.45)-Math.max(0,s)*(run?0.32:0.2)*a;}
  if(z.neck&&z.neck.visible)z.neck.rotation.set(-hunch*0.65+Math.sin(t*0.8+z.seed)*(idle?0.06:0.03),Math.sin(t*0.55+z.seed)*0.08,-s*0.04*a);
  if(z.jaw)z.jaw.rotation.x=0.1+Math.max(0,Math.sin(t*2.1+z.seed))*(idle?0.18:0.32);};
updateDead439=function(z,dt){z.deadT+=dt;const k=z.deadT,dir=z.fdir||1,g=z.gore||{},fl=z.flop||[-1.1,-0.8,-0.45,-0.25,0.25];
  const buck=smooth(Math.min(1,k/0.2)),raw=Math.min(1,Math.max(0,(k-0.06)/0.62)),fall=raw*raw*(3-2*raw),side=(g.legL?1:0)-(g.legR?1:0);
  if(!g.legL){z.kneeL.rotation.x=buck*1.4*(1-fall*0.72);z.hipL.rotation.x=-buck*0.9;}
  if(!g.legR){z.kneeR.rotation.x=buck*1.15*(1-fall*0.68);z.hipR.rotation.x=-buck*0.45;}
  z.hips.position.y=0.95-buck*0.32*(1-fall*0.35);z.hips.rotation.z=side*0.4*Math.max(buck,fall);
  const bounce=z.landed&&k<1.2?Math.sin((k-0.85)*11)*0.05*Math.max(0,1-(k-0.85)/0.3):0;
  z.body.rotation.x=dir*(fall*1.22-bounce);z.body.rotation.z=side*fall*0.6+Math.sin(Math.min(k,1)*8)*0.03*(1-fall);z.body.position.y=Math.max(0,fall*0.015);
  z.spine.rotation.x=dir*fall*0.4;z.spine.rotation.z=Math.sin(k*3)*0.05*(1-fall);
  const arm=smooth(Math.min(1,Math.max(0,(k-0.04)/0.45)));
  if(!g.armL){z.shL.rotation.x=fl[0]*arm;z.shL.rotation.z=0.55*arm;z.elL.rotation.x=-1.05*arm;}
  if(!g.armR){z.shR.rotation.x=fl[1]*arm;z.shR.rotation.z=-0.4*arm;z.elR.rotation.x=-0.85*arm;}
  if(z.neck&&z.neck.visible){const hd=smooth(Math.min(1,Math.max(0,(k-0.12)/0.4)));z.neck.rotation.x=-dir*0.95*hd;z.neck.rotation.z=fl[4]*hd;}
  if(z.jaw)z.jaw.rotation.x=0.5*smooth(Math.min(1,k/0.35));
  if(z.sv){z.g.position.addScaledVector(z.sv,dt);z.sv.multiplyScalar(Math.exp(-2.4*dt));}
  collide(z.g.position,0.3);
  if(!z.landed&&fall>0.84){z.landed=true;if(z.sv)z.sv.multiplyScalar(0.28);
    _tmp.set(z.g.position.x+Math.sin(z.g.rotation.y)*dir*0.8,0.04,z.g.position.z+Math.cos(z.g.rotation.y)*dir*0.8);
    emit(_tmp,_up,12,DUST,{speed:1.4,spread:1,life:0.55,size:0.1,grav:2});_n.set(0,1,0);_tmp.y=0.006;addDecal(bloods,_tmp,_n,0.9*(z.V?z.V.scale:1));}
  if(k>4.4){z.body.position.y-=(k-4.4)*0.5;if(z.blob)z.blob.visible=false;}
  if(k>6.2){z.alive=false;z.g.visible=false;}};
TICK42.push(function(dt){for(let i=GIB442.length-1;i>=0;i--){const g=GIB442[i];g.age+=dt;g.v.y-=11*dt;g.o.position.addScaledVector(g.v,dt);g.o.rotation.x+=dt*4;g.o.rotation.z+=dt*2.2;
  if(g.o.position.y<0.03){g.o.position.y=0.03;g.v.y*=-0.22;g.v.x*=0.6;g.v.z*=0.6;}
  if(g.age>3.2){if(g.chunk)scene.remove(g.o);else g.o.visible=false;GIB442.splice(i,1);}}});
(function(){const add=function(k,mat,n){if(POOL[k])return;const m=new T.InstancedMesh(G.box,mat,n);m.count=0;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);scene.add(m);solids.push(m);POOL[k]={m:m,free:[],n:0,max:n,owner:[]};};
  let s=44317;const rnd=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  const doorTex=canvasTex(256,512,function(g,w,h){g.fillStyle='#4a301c';g.fillRect(0,0,w,h);g.fillStyle='#6b4630';g.fillRect(18,16,w-36,h-32);
    g.strokeStyle='#3a2414';g.lineWidth=10;g.strokeRect(34,28,w-68,(h-80)/2);g.strokeRect(34,h/2+8,w-68,(h-90)/2);
    g.fillStyle='#5c3b26';g.fillRect(46,40,w-92,(h-110)/2);g.fillRect(46,h/2+20,w-92,(h-130)/2);
    for(let i=0;i<900;i++){g.fillStyle=rnd()<.5?'rgba(255,236,210,.05)':'rgba(40,22,10,.06)';g.fillRect(rnd()*w,rnd()*h,2+rnd()*8,1);}
    g.fillStyle='#c6a15a';g.beginPath();g.arc(w-58,h*.52,11,0,6.29);g.fill();g.fillStyle='#8a6a32';g.fillRect(w-62,h*.52,8,36);g.fillStyle='#222';g.fillRect(w-70,h*.52+30,22,6);
  });
  add('bdoor',new T.MeshLambertMaterial({map:doorTex}),80);
  PDEF.door.panel=[['bdoor',.83,1.18,.04,1.52,2.28,.1],['metal',1.48,1.2,.1,.08,.16,.06]];
})();
function cityGreen449(){if(!zsShow())return;
  let s=44991;const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};const R=(a,b)=>a+(b-a)*rnd();
  function bad(x,z,pad,kind){if(x<-HALF+2||x>HALF-2||z<-HALF+2||z>HALF-2)return true;
    if(Math.hypot(x,z-2)<(kind==='puddle'?8:11))return true;
    if(kind==='puddle'){if(Math.abs(x)<6.5)return true;}else if(Math.abs(x)<7.4)return true;
    const zRoad=kind==='puddle'?3.6:4.7;
    if(Math.abs(z+24)<zRoad+.5)return true;if(Math.abs(z)<zRoad)return true;if(Math.abs(z-20)<zRoad+.3)return true;
    const hp=kind==='puddle'?.75:kind==='plant'?1.05:1.65;
    for(const h of HOUSE_RECTS)if(Math.abs(x-h[0])<h[2]+hp&&Math.abs(z-h[1])<h[3]+hp)return true;
    const bp=pad||.45;
    for(const b of boxes)if(x>b.x0-bp&&x<b.x1+bp&&z>b.z0-bp&&z<b.z1+bp)return true;
    for(const c of circles)if(!c.off){const rad=Math.min((c.r||.4)+bp,2.3);if((x-c.x)*(x-c.x)+(z-c.z)*(z-c.z)<rad*rad)return true;}
    const fit=window.__fit441||[];
    for(const a of fit)if(x>a.x0-bp&&x<a.x1+bp&&z>a.z0-bp&&z<a.z1+bp)return true;
    return false;}
  function near(list,x,z,d){const q=d*d;for(const p of list){const dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz<q)return true;}return false;}
  const bushes=[];
  for(const h of HOUSE_RECTS){if(Math.hypot(h[0],h[1]-2)<9)continue;
    for(const sx of [-1,1])for(const t of [-.72,.72]){const x=h[0]+sx*(h[2]+2.2),z=h[1]+t*Math.max(1.3,h[3]*.85);
      if(bad(x,z,.65,'bush')||near(bushes,x,z,2.5))continue;bushes.push({x:x,z:z,yaw:R(0,6.28),sc:R(.78,1.18)});if(bushes.length>=34)break;}
    if(bushes.length>=34)break;
    for(const sz of [-1,1])for(const t of [-.72,.72]){const x=h[0]+t*Math.max(1.3,h[2]*.85),z=h[1]+sz*(h[3]+2.2);
      if(bad(x,z,.65,'bush')||near(bushes,x,z,2.5))continue;bushes.push({x:x,z:z,yaw:R(0,6.28),sc:R(.78,1.18)});if(bushes.length>=34)break;}
    if(bushes.length>=34)break;}
  const clumps=[[-36,34,11,7],[-20,40,7,5],[30,-42,9,6],[42,-36,6,5],[-42,6,6,5],[34,30,6,5],[-30,-42,8,5],[16,38,6,4]];
  for(const cl of clumps)for(let i=0;i<4&&bushes.length<42;i++){const x=cl[0]+R(-cl[2],cl[2]),z=cl[1]+R(-cl[3],cl[3]);
    if(bad(x,z,.7,'bush')||near(bushes,x,z,2.7))continue;bushes.push({x:x,z:z,yaw:R(0,6.28),sc:R(.85,1.28)});}
  const extra=[];
  for(const b of bushes){if(bushes.length+extra.length>=52)break;const x=b.x+R(-1.2,1.2),z=b.z+R(.65,1.45)*(rnd()<.5?-1:1);
    if(bad(x,z,.5,'bush')||near(bushes,x,z,1.2)||near(extra,x,z,1.2))continue;extra.push({x:x,z:z,yaw:R(0,6.28),sc:b.sc*R(.55,.78)});}
  for(const e of extra)bushes.push(e);
  const plants=[];
  function addPlant(x,z,kind){if(plants.length>=84)return;if(bad(x,z,.3,'plant')||near(plants,x,z,kind==='sprout'?1.15:.75))return;
    plants.push({x:x,z:z,yaw:R(0,6.28),sc:kind==='sprout'?R(1.15,1.85):R(1.25,2.05),kind:kind});}
  for(const b of bushes){addPlant(b.x+R(-1.35,1.35),b.z+R(-1.35,1.35),'tuft');addPlant(b.x+R(-1.7,1.7),b.z+R(-1.7,1.7),'sprout');}
  for(let i=0;i<100&&plants.length<80;i++){const x=R(-72,72),z=R(-72,72);const patch=(x>-50&&x<-16&&z>18&&z<46)||(x>20&&x<48&&z<-50&&z<-30);
    if(!patch&&Math.abs(x)<18)continue;addPlant(x,z,rnd()<.42?'sprout':'tuft');}
  const puddles=[];
  function addPuddle(x,z){if(puddles.length>=16)return;if(bad(x,z,.4,'puddle')||near(puddles,x,z,7.2))return;
    puddles.push({x:x,z:z,yaw:R(-.4,.4),w:R(3.3,4.8),d:R(2.05,2.9)});}
  const row=[];for(let z=-46;z<=46;z+=6)row.push(z);for(let i=row.length-1;i>0;i--){const j=(rnd()*(i+1))|0;const t=row[i];row[i]=row[j];row[j]=t;}
  for(const z of row){addPuddle(-11.4+R(-.4,.4),z+R(-1.1,1.1));addPuddle(11.6+R(-.4,.4),z+R(-1.1,1.1));if(puddles.length>=10)break;}
  for(let i=0;i<12&&puddles.length<16;i++)addPuddle(R(-46,-18),R(24,44));
  for(let i=0;i<10&&puddles.length<16;i++)addPuddle(R(22,46),R(-48,-32));
  function bushGeom(){const src=new T.IcosahedronGeometry(1,1);
    const lobes=[[0,.58,0,.98,.72,.9],[-.58,.46,.16,.68,.52,.62],[.54,.42,-.2,.62,.48,.58],[.06,.86,-.26,.48,.4,.46],[-.16,.32,.58,.55,.38,.52],[.4,.28,.46,.4,.32,.38]];
    const cols=[[.18,.4,.18],[.22,.5,.22],[.28,.55,.24],[.42,.66,.3],[.2,.44,.18],[.34,.58,.26]];
    const geos=[];
    for(const L of lobes){const g=src.clone();g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(L[0],L[1],L[2]),new T.Quaternion(),new T.Vector3(L[3],L[4],L[5])));geos.push(g.toNonIndexed());}
    src.dispose();let n=0;for(const g of geos)n+=g.attributes.position.count;
    const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0,minY=1e9;
    geos.forEach((g,li)=>{const a=g.attributes.position.array,b=g.attributes.normal.array,c=cols[li];
      for(let i=0;i<a.length;i+=3){if(a[i+1]<minY)minY=a[i+1];const ny=b[i+1],k=ny>.3?1.2:ny<-.15?.75:.95;
        P[o]=a[i];P[o+1]=a[i+1];P[o+2]=a[i+2];N[o]=b[i];N[o+1]=b[i+1];N[o+2]=b[i+2];C[o]=c[0]*k;C[o+1]=c[1]*k;C[o+2]=c[2]*k;o+=3;}g.dispose();});
    for(let i=1;i<P.length;i+=3)P[i]-=minY;
    for(let i=0;i<P.length;i+=9){const ax=P[i],ay=P[i+1],az=P[i+2],bx=P[i+3],by=P[i+4],bz=P[i+5],cx=P[i+6],cy=P[i+7],cz=P[i+8];
      let nx=(by-ay)*(cz-az)-(bz-az)*(cy-ay),ny=(bz-az)*(cx-ax)-(bx-ax)*(cz-az),nz=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
      N[i]=N[i+3]=N[i+6]=nx;N[i+1]=N[i+4]=N[i+7]=ny;N[i+2]=N[i+5]=N[i+8]=nz;}
    const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(P,3));bg.setAttribute('normal',new T.BufferAttribute(N,3));bg.setAttribute('color',new T.BufferAttribute(C,3));bg.computeBoundingSphere();return bg;}
  function tuftGeom(){const P=[],C=[];
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.4,h=.16+(i%3)*.045,x=Math.cos(a)*.055,z=Math.sin(a)*.055,px=-Math.sin(a)*.03,pz=Math.cos(a)*.03;
      P.push(x-px,0,z-pz,x+px,0,z+pz,x*.2,h,z*.2);const g1=.48+(i%2)*.16;for(let k=0;k<3;k++)C.push(.22,g1,.26);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.computeVertexNormals();return g;}
  function sproutGeom(){const P=[],C=[];
    P.push(-.015,0,0,.015,0,0,0,.38,.01);C.push(.32,.48,.2,.32,.48,.2,.4,.62,.24);
    const leaves=[[.22,.24,.04],[ -.18,.28,-.05],[.04,.32,.18]];
    for(const L of leaves){P.push(0,L[1]-.03,0,L[0],L[1],L[2],L[0]*.4,L[1]+.09,L[2]*.4);for(let k=0;k<3;k++)C.push(.28,.66,.28);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.computeVertexNormals();return g;}
  function mudTex(){const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d');
    g.clearRect(0,0,512,512);
    function ell(x,y,rx,ry,rot,col){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=col;g.beginPath();g.ellipse(0,0,rx,ry,0,0,6.2832);g.fill();g.restore();}
    ell(250,280,190,132,.04,'#6b4a2c');ell(175,250,88,66,-.35,'#543820');ell(340,300,104,68,.22,'#7a5534');
    ell(220,210,64,42,.4,'#3f2c18');ell(310,340,78,40,-.18,'#2e2416');
    ell(246,268,112,70,-.06,'#1e3642');ell(214,252,58,32,.12,'#163038');ell(292,278,44,24,-.22,'#2a4450');
    g.save();g.globalCompositeOperation='source-atop';
    g.fillStyle='rgba(214,232,238,.7)';g.beginPath();g.ellipse(228,250,84,8,-.16,0,6.2832);g.fill();
    g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(206,246,24,3,0,0,6.2832);g.fill();
    g.strokeStyle='rgba(186,214,222,.45)';g.lineWidth=3;g.beginPath();g.ellipse(248,272,48,15,-.08,0,6.2832);g.stroke();g.beginPath();g.ellipse(248,272,78,22,-.08,0,6.2832);g.stroke();
    g.fillStyle='rgba(92,68,42,.4)';
    for(let i=0;i<16;i++){const a=i/16*6.2832,rr=148+(i%5)*14;g.beginPath();g.ellipse(256+Math.cos(a)*rr,274+Math.sin(a)*rr*.7,9,4,a,0,6.2832);g.fill();}
    g.restore();
    g.globalCompositeOperation='destination-in';
    g.beginPath();const cx=256,cy=274;for(let i=0;i<16;i++){const a=i/16*6.2832,wob=.7+((i*3)%5)*.07,x=cx+Math.cos(a)*200*wob,y=cy+Math.sin(a)*146*wob;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.closePath();g.fillStyle='#000';g.fill();
    const rg=g.createRadialGradient(cx,cy,20,cx,cy,220);rg.addColorStop(0,'rgba(0,0,0,1)');rg.addColorStop(.6,'rgba(0,0,0,.95)');rg.addColorStop(.84,'rgba(0,0,0,.28)');rg.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=rg;g.fillRect(0,0,512,512);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
  const o3=new T.Object3D();
    if(bushes.length){const geo=bushGeom(),mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true}),m=new T.InstancedMesh(geo,mat,bushes.length);
    m.castShadow=false;m.receiveShadow=true;m.count=bushes.length;m.frustumCulled=false;const col=new T.Color();
    bushes.forEach((p,i)=>{o3.position.set(p.x,0,p.z);o3.rotation.set(0,p.yaw,0);o3.scale.set(p.sc,p.sc*R(.88,1.06),p.sc*.95);o3.updateMatrix();m.setMatrixAt(i,o3.matrix);
      const tint=.86+((i*13)%6)*.035;col.setRGB(.9*tint,tint,.82*tint);m.setColorAt(i,col);});
    m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.userData.green449='bush';scene.add(m);}
  function plantMesh(geo,list){if(!list.length)return;const m=new T.InstancedMesh(geo,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),list.length);
    m.castShadow=false;m.receiveShadow=true;m.count=list.length;m.frustumCulled=false;
    list.forEach((p,i)=>{o3.position.set(p.x,.02,p.z);o3.rotation.set(0,p.yaw,0);o3.scale.set(p.sc,p.sc,p.sc);o3.updateMatrix();m.setMatrixAt(i,o3.matrix);});
    m.instanceMatrix.needsUpdate=true;m.userData.green449='plant';scene.add(m);}
  plantMesh(tuftGeom(),plants.filter(p=>p.kind==='tuft'));plantMesh(sproutGeom(),plants.filter(p=>p.kind==='sprout'));
  if(puddles.length){const mat=new T.MeshBasicMaterial({map:mudTex(),transparent:true,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const m=new T.InstancedMesh(new T.PlaneGeometry(1,1),mat,puddles.length);m.frustumCulled=false;m.receiveShadow=false;m.castShadow=false;m.count=puddles.length;m.userData.green449='puddle';
    puddles.forEach((p,i)=>{o3.position.set(p.x,.02,p.z);o3.rotation.set(-Math.PI/2,p.yaw,0);o3.scale.set(p.w,p.d,1);o3.updateMatrix();m.setMatrixAt(i,o3.matrix);});
    m.instanceMatrix.needsUpdate=true;scene.add(m);}
  window.__green449={bushes:bushes.length,plants:plants.length,puddles:puddles.length};}

// 4.3.52: found loot asks you to pick a slot, then Cambia or Scarta.
const LOOT452={q:[],cur:null,sel:null,rows:[]};
function loot452El(){let e=document.getElementById('loot452');if(e)return e;e=document.createElement('div');e.id='loot452';e.className='overlay hidden';e.innerHTML='<div class="sheet loot452s"><div class="loot452h"><b>Hai trovato</b><small id="loot452n"></small></div><div class="loot452top"><div id="loot452new"></div><div class="loot452side"><div class="loot452lab">Seleziona, poi Cambia o Scarta</div><div id="loot452grid"></div></div></div><div class="btnRow"><button type="button" class="act" id="loot452swap">Cambia</button><button type="button" class="act ghost" id="loot452drop">Scarta</button></div></div>';document.body.appendChild(e);e.addEventListener('click',function(ev){const b=ev.target.closest('[data-i]');if(!b||!e.contains(b))return;LOOT452.sel=LOOT452.rows[+b.dataset.i]||null;loot452Mark();});onTap('loot452swap',loot452Swap);onTap('loot452drop',loot452Discard);return e;}
function loot452Mark(){const g=document.getElementById('loot452grid');if(!g)return;const nodes=g.querySelectorAll('[data-i]');nodes.forEach(function(n){n.classList.toggle('on',LOOT452.rows[+n.dataset.i]===LOOT452.sel);});}
function loot452Rows(c){const rows=[];if(c.kind==='gear'){const it=c.it,eq=P42.eq[it.s];if(!eq)rows.push({k:'empty',id:it.s,icon:GSLOT[it.s].i,name:GSLOT[it.s].n+' · vuoto',sub:it.l<=P42.L?'Puoi indossarlo':'Serve liv. '+it.l});else rows.push({k:'eq',id:it.s,icon:GSLOT[it.s].i,name:gName(eq)+' · indossato',sub:gStatTxt(eq)});if(P42.gb.length<GEAR_CFG.bagMax)rows.push({k:'bagroom',icon:'🎒',name:'Metti nello zaino',sub:P42.gb.length+' / '+GEAR_CFG.bagMax});P42.gb.forEach(function(g,i){rows.push({k:'bag',i:i,icon:GSLOT[g.s].i,name:gName(g)+(g.s===it.s?' · stesso tipo':''),sub:gStatTxt(g)});});if(!eq&&it.l<=P42.L)LOOT452.sel=rows[0];else if(P42.gb.length<GEAR_CFG.bagMax)LOOT452.sel=rows.find(function(r){return r.k==='bagroom';});}
  else if(c.kind==='mat'){const free=bagCap()-bagCount();if(free>=(c.n|0))rows.push({k:'take',icon:'🎒',name:'Spazio libero',sub:free+' posti'});RES_K.forEach(function(k){rows.push({k:'res',id:k,icon:RES[k].i,name:RES[k].n,sub:(inv[k]|0)+' nello zaino'+(k===c.k?' · lo stesso':'')});});if(free>=(c.n|0))LOOT452.sel=rows[0];}
  else if(c.kind==='ammo'){const w=WEAPONS.find(function(q){return q.id===c.wid;});rows.push({k:'ammo',id:c.wid,icon:'🔫',name:w?w.name:'Arma',sub:w?('riserva '+(res[w.id]|0)+' / '+w.maxReserve):''});LOOT452.sel=rows[0];}
  else if(c.kind==='hp'){rows.push({k:'hp',icon:'❤️',name:'La tua salute',sub:Math.ceil(player.hp)+' / '+Math.ceil(player.maxHp)});LOOT452.sel=rows[0];}
  else if(c.kind==='nade'){rows.push({k:'nade',icon:'💣',name:'Granate',sub:(S.nades|0)+' / '+NADE_MAX});LOOT452.sel=rows[0];}
  return rows;}
function loot452Card(c){let icon=c.icon||'📦',title=c.title||'Oggetto',sub=c.sub||'',col=c.color||'#ffd27a';if(c.kind==='gear'){const it=c.it,eq=P42.eq[it.s],dp=eq?Math.round((gPow(it)-gPow(eq))*10)/10:null;icon=GSLOT[it.s].i;title=gName(it);col=GEAR_CFG.rar[it.r].c;sub='Liv. '+it.l+' · '+gStatTxt(it)+(it.l>P42.L?' · troppo alto per indossarlo':'')+(dp==null?'':dp>0?' · meglio di quello indossato':dp<0?' · peggio di quello indossato':' · uguale a quello indossato');}return '<div class="loot452card" style="border-color:'+col+'"><i>'+icon+'</i><div><b style="color:'+col+'">'+esc(title)+'</b><small>'+esc(sub)+'</small></div></div>';}
function loot452Render(){const c=LOOT452.cur;if(!c){loot452Close();return;}LOOT452.sel=null;LOOT452.rows=loot452Rows(c);const e=loot452El();document.getElementById('loot452new').innerHTML=loot452Card(c);document.getElementById('loot452n').textContent=LOOT452.q.length?'1 di '+(LOOT452.q.length+1):'';document.getElementById('loot452grid').innerHTML=LOOT452.rows.map(function(r,i){return '<button type="button" class="loot452i" data-i="'+i+'"><i>'+r.icon+'</i><span><b>'+esc(r.name)+'</b><small>'+esc(r.sub||'')+'</small></span></button>';}).join('')||'<div class="loot452empty">Niente da selezionare</div>';loot452Mark();e.classList.remove('hidden');}
function loot452Open(){if(game.state!=='play'&&game.state!=='loot452')return;if(!LOOT452.q.length){loot452Close();return;}LOOT452.cur=LOOT452.q.shift();if(game.state!=='loot452'){game.state='loot452';firing=false;try{resetTouchState();}catch(e){}if(document.pointerLockElement)document.exitPointerLock();}loot452Render();}
function loot452Offer(off){if(game.state!=='play'&&game.state!=='loot452')return;LOOT452.q.push(off);if(game.state!=='loot452')loot452Open();}
function loot452Close(){const e=document.getElementById('loot452');if(e)e.classList.add('hidden');LOOT452.cur=null;LOOT452.sel=null;LOOT452.rows=[];if(game.state==='loot452'){game.state='play';last=performance.now();if(!isTouch)try{lockPointer();}catch(e){}}}
function loot452Next(){if(!LOOT452.q.length){loot452Close();return;}LOOT452.cur=LOOT452.q.shift();loot452Render();}
function loot452LayGear(it){try{gearDropAt(it,player.pos.x+.85,player.pos.z+.2);const d=GD.find(function(q){return q.on&&q.it===it;});if(d)d.skip=1;}catch(e){}}
function loot452FinishPickup(p){p.hold452=0;p.active=false;p.fly=.001;p.timer=18+Math.random()*12;const I=MAT_INFO[p.type];try{_tmp.set(p.x,p.item.position.y,p.z);emit(_tmp,_up,18,[I.glow,0xffffff],{speed:3,spread:1,life:.55,size:.05,grav:2});floatText('+1 '+I.name,'#'+new T.Color(I.glow).getHexString());bump(I.hud);play('pickup',I.k);updateHUD();}catch(e){}}
function loot452TakeMat(c){const need=c.n|0,sel=LOOT452.sel;if(sel&&sel.k==='res'&&sel.id!==c.k){const have=inv[sel.id]|0,cut=Math.min(have,need);if(cut<=0){toast('Non ne hai da cambiare',1100);return false;}inv[sel.id]=have-cut;const got=addRes(c.k,need,true);if(!got){inv[sel.id]=have;toast('Zaino pieno',1100);return false;}return true;}if(bagCap()-bagCount()>=need){const got=addRes(c.k,need,true);if(!got){toast('Zaino pieno',1100);return false;}return true;}if(sel&&sel.k==='res'&&sel.id===c.k){toast('È lo stesso materiale: scartalo o scegline un altro',1600);return false;}toast('Seleziona il materiale da cambiare',1300);return false;}
function loot452Swap(){const c=LOOT452.cur;if(!c)return;if(c.kind==='gear'){const it=c.it,d=c.drop,sel=LOOT452.sel;if(!d||!d.on){loot452Next();return;}if(!sel){toast('Seleziona cosa cambiare',1200);return;}if(sel.k==='empty'||sel.k==='eq'){if(it.l>P42.L){toast('Serve il livello '+it.l+' per indossarlo',1500);return;}if(sel.k==='eq'){const cur=P42.eq[it.s];if(cur){if(P42.gb.length>=GEAR_CFG.bagMax){toast('Zaino pieno: seleziona un oggetto dello zaino',1600);return;}P42.gb.push(cur);}}P42.eq[it.s]=it;}else if(sel.k==='bagroom'){if(P42.gb.length>=GEAR_CFG.bagMax){toast('Zaino equipaggiamento pieno',1400);return;}P42.gb.push(it);}else if(sel.k==='bag'){const old=P42.gb[sel.i];if(!old){toast('Seleziona di nuovo',1000);return;}P42.gb[sel.i]=it;d.on=false;d.root.visible=false;loot452LayGear(old);}else{toast('Seleziona cosa cambiare',1200);return;}if(sel.k!=='bag'&&d.on){d.on=false;d.root.visible=false;}try{gearStats();}catch(e){}play('gear');try{addXP(3+[0,8,20,50,150][it.r]);}catch(e){}try{gearPop(it);}catch(e){}try{save42soon();}catch(e){}try{if(window.q42)q42('gear',1);}catch(e){}updateHUD();loot452Next();return;}if(c.kind==='mat'){if(!loot452TakeMat(c))return;if(c.src)loot452FinishPickup(c.src);else{play('pickup',3);updateHUD();toast('Preso',800);}loot452Next();return;}if(c.kind==='ammo'){const w=WEAPONS.find(function(q){return q.id===c.wid;});if(!w){loot452Next();return;}const room=Math.max(0,(w.maxReserve|0)-(res[w.id]|0));if(room<=0){toast('Riserva piena: scarta questi colpi',1400);return;}const n=Math.min(c.n|0,room);res[w.id]=(res[w.id]|0)+n;play('pickup',3);updateHUD();toast('+'+n+' '+w.name,1000);loot452Next();return;}if(c.kind==='hp'){if(player.hp>=player.maxHp-.5){toast('Sei già in piena salute',1100);return;}const h=Math.min(c.n|0,player.maxHp-player.hp);player.hp+=h;play('pickup');updateHUD();toast('Kit +'+Math.round(h),1000);loot452Next();return;}if(c.kind==='nade'){if((S.nades|0)>=NADE_MAX){toast('Hai già il massimo di granate',1200);return;}S.nades=Math.min(NADE_MAX,(S.nades|0)+(c.n|0));play('pickup',3);updateHUD();toast('Granata presa',900);loot452Next();}}
function loot452Discard(){const c=LOOT452.cur;if(!c){loot452Close();return;}if(c.kind==='gear'&&c.drop)c.drop.skip=1;if(c.kind==='mat'&&c.src)c.src.hold452=1;toast('Scartato',800);loot452Next();}
function loot452DiscardAll(){const left=[LOOT452.cur].concat(LOOT452.q).filter(Boolean);for(const c of left){if(c.kind==='gear'&&c.drop)c.drop.skip=1;if(c.kind==='mat'&&c.src)c.src.hold452=1;}LOOT452.q.length=0;loot452Close();}
function loot452Gear(d,manual){if(!d||!d.on||!d.it||game.state!=='play')return;if(!manual&&d.skip)return;d.skip=0;const it=d.it;loot452Offer({kind:'gear',drop:d,it:it,icon:GSLOT[it.s].i,title:gName(it),sub:gStatTxt(it),color:GEAR_CFG.rar[it.r].c});}
function loot452Mat(p){if(!p||!p.active||game.state!=='play')return;const I=MAT_INFO[p.type]||{name:'Materiale',icon:'📦',glow:0xffd27a};loot452Offer({kind:'mat',src:p,k:p.type,n:1,icon:I.icon,title:I.name,sub:'1 · lo zaino è pieno',color:'#'+new T.Color(I.glow).getHexString()});}
function loot452Crate(c){if(!c||c.open||game.state!=='play')return;c.open=true;lootWrite(c);play('door');try{addXP(XP_GAIN.crate);}catch(e){}try{dropCoins(c.x,c.z,Math.round(rand(5,10)));}catch(e){}try{if(window.q42)q42('crate',1);}catch(e){}const got=[],r=Math.random;const guns=WEAPONS.filter(function(w){return own[w.id]&&!w.melee;});if(guns.length&&r()<.75){const w=guns[(r()*guns.length)|0];const light=w.id==='pistol'||w.id==='revolver'||w.id==='shotgun'||w.id==='dbarrel'||w.id==='saw';const n=light?Math.max(2,Math.round(w.mag*.5)):Math.max(1,Math.round((w.mag||4)*.2));res[w.id]=Math.min(w.maxReserve,(res[w.id]|0)+n);got.push('+'+n+' colpi '+w.name);}if(r()<.45){const h=Math.min(player.maxHp-player.hp,40);if(h>0){player.hp+=h;got.push('🩹 Kit medico +'+Math.round(h)+'❤️');}}const mats=[['wood',2,4],['stone',1,3],['metal',1,2],['elec',0,1],['iron',0,1],['coal',0,2]];for(const row of mats){if(r()<.55){const n=row[1]+Math.floor(r()*(row[2]-row[1]+1));if(n>0){const g=addRes(row[0],n,true);if(g)got.push('+'+g+' '+RES[row[0]].i);}}}if(r()<.25&&S.nades<NADE_MAX){S.nades++;got.push('+1 💣');}if(!got.length){addRes('wood',2,true);got.push('+2 '+RES.wood.i);}floatText(got.slice(0,3).join(' · '),'#ffd27a');if(got.length>3)setTimeout(function(){floatText(got.slice(3).join(' · '),'#ffd27a');},400);play('pickup',3);updateHUD();}
const _collect452=collect;collect=function(p){if(SV.on&&bagCount()>=bagCap()&&p&&p.active){const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(p.hold452&&d>3.4)p.hold452=0;if(p.hold452)return;if(game.state==='play'){loot452Mat(p);return;}return;}return _collect452(p);};
openLoot=function(c){loot452Crate(c);};
addEventListener('keydown',function(e){if(game.state!=='loot452')return;if(e.code==='Escape'){e.preventDefault();loot452Discard();}else if(e.code==='Enter'||e.code==='KeyE'){e.preventDefault();loot452Swap();}});
const _back452=window.__zsBack;window.__zsBack=function(){const el=document.getElementById('loot452');if(el&&!el.classList.contains('hidden')){loot452DiscardAll();return true;}return _back452?_back452():false;};
window.__loot452={gear:loot452Gear,crate:loot452Crate,swap:loot452Swap,drop:loot452Discard,get on(){return game.state==='loot452';},get n(){return LOOT452.q.length+(LOOT452.cur?1:0);}};
// 4.3.53: scheletro, stop, sangue, scorrimento zaino
function bag453Bind(){const root=$('bagScreen');if(!root||root.dataset.bag453)return;root.dataset.bag453='1';
  root.addEventListener('touchmove',function(e){const sc=e.target.closest&&e.target.closest('#bagGrid,.gGrid');if(sc)e.stopPropagation();},{capture:true,passive:true});
  root.addEventListener('wheel',function(e){const sc=e.target.closest&&e.target.closest('#bagGrid,.gGrid');if(!sc)return;if(sc.scrollHeight<=sc.clientHeight+1)return;sc.scrollTop+=e.deltaY;e.preventDefault();e.stopPropagation();},{passive:false});}
function bag457View(view){const root=$('bagScreen');view=view==='equipment'?'equipment':'resources';root.dataset.bagView=view;for(const pair of [['bagResources457','resources'],['bagEquipment457','equipment']]){const active=view===pair[1],button=$(pair[0]);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}const grid=$('bagGrid'),side=$('bagEquipmentPanel457');grid.hidden=view!=='resources';if(side)side.hidden=view!=='equipment';}
let bag457Selection='';
bag439Fit=function(){bag439Gear();bag453Bind();const root=$('bagScreen'),side=$('bagEquipmentPanel457');$('bagGearCount457').textContent=P42.gb.length+'/'+GEAR_CFG.bagMax;bag457View(root.dataset.bagView);if(side){const info=side.querySelector('.gInfo');if(info){const found=side.querySelector('.bagFound');found.insertBefore(info,found.firstChild);}const key=eqSel?eqSel.w+':'+eqSel.i:'';if(key&&key!==bag457Selection&&info&&!root.classList.contains('hidden'))info.scrollIntoView({block:'nearest'});bag457Selection=key;}};
onTap('bagResources457',function(){bag457View('resources');});onTap('bagEquipment457',function(){bag457View('equipment');});
$('bagScreen').querySelector('.bagTabs457').addEventListener('keydown',function(e){if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const view=e.key==='Home'?'resources':e.key==='End'?'equipment':$('bagScreen').dataset.bagView==='resources'?'equipment':'resources';bag457View(view);$(view==='equipment'?'bagEquipment457':'bagResources457').focus();});
function dress453(){
  const streakTex=canvasTex(512,128,function(g,w,h){g.clearRect(0,0,w,h);
    const grd=g.createLinearGradient(8,h*.5,w-8,h*.42);grd.addColorStop(0,'rgba(80,0,0,0)');grd.addColorStop(.12,'rgba(120,6,8,.55)');grd.addColorStop(.4,'rgba(150,8,12,.95)');grd.addColorStop(.72,'rgba(110,4,8,.7)');grd.addColorStop(1,'rgba(40,0,0,0)');
    g.fillStyle=grd;g.beginPath();g.moveTo(12,h*.55);g.bezierCurveTo(80,h*.22,180,h*.78,280,h*.4);g.bezierCurveTo(360,h*.18,450,h*.62,500,h*.36);g.lineTo(496,h*.58);g.bezierCurveTo(420,h*.86,240,h*.7,140,h*.88);g.bezierCurveTo(70,h*.96,24,h*.7,12,h*.55);g.fill();
    g.fillStyle='rgba(90,4,8,.75)';g.beginPath();g.ellipse(70,h*.28,16,6,.4,0,6.3);g.fill();g.beginPath();g.ellipse(390,h*.72,14,5,-.35,0,6.3);g.fill();g.beginPath();g.ellipse(250,h*.48,8,4,.2,0,6.3);g.fill();});
  const streaks=decalPool(streakTex,64);streaks.m.renderOrder=2;
  function addStreak(x,z,yaw,len,wid){_o.position.set(x,.021,z);_o.quaternion.setFromUnitVectors(_z,_up);_q.setFromAxisAngle(_z,yaw);_o.quaternion.multiply(_q);_o.scale.set(len,wid,1);_o.updateMatrix();streaks.m.setMatrixAt(streaks.i,_o.matrix);streaks.i=(streaks.i+1)%streaks.n;streaks.m.instanceMatrix.needsUpdate=true;}
  window.__addStreak453=addStreak;
  const _kill=killZombie;killZombie=function(z,dir,d,head){_kill(z,dir,d,head);try{if(!z||!z.g)return;const yaw=Math.atan2(dir.x,dir.z);addStreak(z.g.position.x+dir.x*.55,z.g.position.z+dir.z*.55,yaw,1.5+Math.random()*1.7,.26+Math.random()*.22);}catch(e){}};
  if(!zsShow())return;
  scene.traverse(function(o){if(o.userData&&o.userData.boxCorpse)o.visible=false;});
  let s=45317;const rnd=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  const corpses=window.__corpse440||[];
  corpses.forEach(function(p){const yaw=p.yaw+(rnd()-.5)*.9;const len=1.35+rnd()*1.7;const along=.35+rnd()*.9;addStreak(p.x+Math.sin(yaw)*along,p.z+Math.cos(yaw)*along,yaw,len,.22+rnd()*.28);if(rnd()<.45)addStreak(p.x+Math.sin(yaw+1.2)*.6,p.z+Math.cos(yaw+1.2)*.6,yaw+1.4,.8+rnd()*.7,.16+rnd()*.12);});
  const roads=(window.CITY4319&&CITY4319.roads)||[];
  const avenues=[[-HALF,-24,HALF,-24],[0,-HALF,0,HALF],[-48,0,-6,0],[6,0,48,0],[-46,20,46,20]].concat(roads);
  for(let i=0;i<10;i++){const r=avenues[(rnd()*avenues.length)|0];if(!r)continue;const horiz=Math.abs(r[1]-r[3])<.05;const t=.15+rnd()*.7;const x=r[0]+(r[2]-r[0])*t,z=r[1]+(r[3]-r[1])*t;const yaw=horiz?0:1.57;const ox=horiz?0:(rnd()<.5?-1:1)*2.2,oz=horiz?(rnd()<.5?-1:1)*2.2:0;if(Math.hypot(x+ox,(z+oz)-2)<6)continue;addStreak(x+ox,z+oz,yaw+(rnd()-.5)*.4,1.8+rnd()*2.2,.2+rnd()*.22);}
  function badSign(x,z){if(x<-HALF+3||x>HALF-3||z<-HALF+3||z>HALF-3)return true;if(Math.hypot(x,z-2)<11)return true;if(Math.abs(x)<4.3&&Math.abs(z)<8)return true;
    for(const h of HOUSE_RECTS)if(Math.abs(x-h[0])<h[2]+1.3&&Math.abs(z-h[1])<h[3]+1.3)return true;
    for(const b of boxes)if(x>b.x0-.45&&x<b.x1+.45&&z>b.z0-.45&&z<b.z1+.45)return true;return false;}
  function signTex(kind,label){return canvasTex(256,256,function(g){g.clearRect(0,0,256,256);
    if(kind==='stop'){g.save();g.translate(128,128);g.fillStyle='#d10b16';g.beginPath();for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,x=Math.cos(a)*108,y=Math.sin(a)*108;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.closePath();g.fill();g.lineWidth=12;g.strokeStyle='#fff';g.stroke();g.fillStyle='#fff';g.font='800 62px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('STOP',0,6);g.restore();}
    else if(kind==='one'){g.fillStyle='#14181f';g.fillRect(18,78,220,100);g.strokeStyle='#f2f4f8';g.lineWidth=8;g.strokeRect(18,78,220,100);g.fillStyle='#fff';g.beginPath();g.moveTo(48,128);g.lineTo(150,128);g.lineTo(150,100);g.lineTo(210,128);g.lineTo(150,156);g.lineTo(150,128);g.fill();}
    else{g.fillStyle='#1d4e32';g.fillRect(16,78,224,100);g.strokeStyle='#e7f6ea';g.lineWidth=8;g.strokeRect(16,78,224,100);g.fillStyle='#fff';g.font='700 42px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(label||'VIA',128,128);}});}
  const stopM=new T.MeshBasicMaterial({map:signTex('stop'),transparent:true,side:T.DoubleSide,depthWrite:false});
  const oneM=new T.MeshBasicMaterial({map:signTex('one'),transparent:true,side:T.DoubleSide,depthWrite:false});
  const nameMats={};
  function nameMat(label){if(!nameMats[label])nameMats[label]=new T.MeshBasicMaterial({map:signTex('name',label),transparent:true,side:T.DoubleSide,depthWrite:false});return nameMats[label];}
  const spots=[];
  function putSign(x,z,faceX,faceZ,kind,label){if(spots.length>=18)return;if(badSign(x,z))return;if(spots.some(function(p){return (p.x-x)*(p.x-x)+(p.z-z)*(p.z-z)<20;}))return;
    const yaw=Math.atan2(faceX-x,faceZ-z);const pole=mesh(G.cyl,MAT.metal,x,1.15,z,.07,2.3,.07,null,false);pole.userData.sign453=1;
    const mat=kind==='stop'?stopM:kind==='one'?oneM:nameMat(label||'VIA');
    const w=kind==='stop'?0.78:0.96,hh=kind==='stop'?0.78:0.46;
    const face=mesh(new T.PlaneGeometry(1,1),mat,x,2.12,z,w,hh,1,null,false);face.rotation.y=yaw;face.userData.sign453=1;
    boxes.push({x0:x-.22,x1:x+.22,z0:z-.22,z1:z+.22});spots.push({x:x,z:z,kind:kind});}
  const corners=[[-1,-1],[1,-1],[-1,1],[1,1]];
  [[0,-24],[0,20]].forEach(function(c,ci){corners.forEach(function(s,si){const x=c[0]+s[0]*6.4,z=c[1]+s[1]*6.4;putSign(x,z,c[0],c[1],si%2?'stop':'one',si%2?'':'');});});
  putSign(6.6,-8,0,-8,'name','CENTRO');putSign(-6.6,36,0,36,'name','NORD');putSign(6.6,-48,0,-48,'stop');putSign(-6.6,58,0,58,'name','MERCATO');
  const horiz=roads.filter(function(r){return Math.abs(r[1]-r[3])<.05;}),vert=roads.filter(function(r){return Math.abs(r[0]-r[2])<.05;});
  horiz.forEach(function(h){const x0=Math.min(h[0],h[2]),x1=Math.max(h[0],h[2]),z=h[1];vert.forEach(function(v){const z0=Math.min(v[1],v[3]),z1=Math.max(v[1],v[3]),x=v[0];if(x<x0-2||x>x1+2||z<z0-2||z>z1+2)return;putSign(x+5.6,z+5.6,x,z,'stop');putSign(x-5.6,z-5.6,x,z,'name',x<-20?'STAZIONE':'VIA');});});
  avenues.forEach(function(r){if(spots.length>=16)return;const horizR=Math.abs(r[1]-r[3])<.05;const len=horizR?Math.abs(r[2]-r[0]):Math.abs(r[3]-r[1]);const n=Math.max(1,Math.floor(len/36));
    for(let i=0;i<n&&spots.length<16;i++){const t=(i+.5)/n;let x,z,fx,fz;if(horizR){x=r[0]+(r[2]-r[0])*t;z=r[1]+(rnd()<.5?-1:1)*6.2;fx=x;fz=r[1];}else{z=r[1]+(r[3]-r[1])*t;x=r[0]+(rnd()<.5?-1:1)*6.2;fx=r[0];fz=z;}
      const kind=rnd()<.62?'stop':rnd()<.5?'one':'name';const label=z>30?'NORD':z<-30?'SUD':x>20?'EST':'OVEST';putSign(x,z,fx,fz,kind,label);}});
  const parts=[];const bone=[.91,.86,.74],dark=[.78,.72,.6],pit=[.22,.18,.16],tooth=[.96,.94,.9];
  function addGeo(g,x,y,z,sx,sy,sz,rx,ry,rz,col){g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0)),new T.Vector3(sx,sy,sz)));
    const ng=g.toNonIndexed();const n=ng.attributes.position.count;const c=new Float32Array(n*3);for(let i=0;i<n;i++){c[i*3]=col[0];c[i*3+1]=col[1];c[i*3+2]=col[2];}ng.setAttribute('color',new T.Float32BufferAttribute(c,3));parts.push(ng);g.dispose();}
  function addBox(x,y,z,sx,sy,sz,rx,ry,rz,col){addGeo(new T.BoxGeometry(1,1,1),x,y,z,sx,sy,sz,rx,ry,rz,col);}
  function addBall(x,y,z,sx,sy,sz,col){addGeo(new T.SphereGeometry(.5,12,9),x,y,z,sx,sy,sz,0,0,0,col);}
  addBall(0,.3,.96,.34,.3,.38,bone);addBox(0,.14,.82,.26,.08,.18,.28,0,0,dark);addBox(0,.16,.92,.18,.03,.04,0,0,0,tooth);
  addBall(-.07,.32,1.12,.06,.045,.04,pit);addBall(.07,.32,1.12,.06,.045,.04,pit);addBox(0,.24,1.14,.04,.07,.03,0,0,0,pit);
  addBox(0,.2,.7,.11,.11,.18,0,0,0,bone);
  for(let i=0;i<6;i++)addBox(0,.15,.5-i*.15,.13,.1,.11,0,0,0,i%2?bone:dark);
  for(let i=0;i<5;i++){const z=.46-i*.12;addBox(.2,.24,z,.3,.045,.05,0,0,.55,bone);addBox(-.2,.24,z,.3,.045,.05,0,0,-.55,bone);addBox(.32,.12,z,.16,.04,.045,0,0,1.15,dark);addBox(-.32,.12,z,.16,.04,.045,0,0,-1.15,dark);}
  addBox(0,.26,.3,.07,.045,.4,0,0,0,dark);
  addBox(0,.15,-.46,.4,.12,.18,0,0,0,bone);addBox(.22,.18,-.44,.14,.1,.16,0,.15,.35,bone);addBox(-.22,.18,-.44,.14,.1,.16,0,-.15,-.35,bone);
  addBox(.46,.14,.32,.4,.08,.08,0,.35,.25,bone);addBox(.82,.1,.14,.34,.06,.06,.15,.7,0,dark);addBox(1.02,.07,-.02,.14,.045,.16,0,.4,0,bone);
  addBox(-.46,.14,.3,.4,.08,.08,0,-.4,-.25,bone);addBox(-.8,.09,.1,.32,.06,.06,-.1,-.65,0,dark);addBox(-1.0,.06,-.04,.14,.045,.16,0,-.35,0,bone);
  addBox(.12,.11,-.78,.1,.1,.48,0,.08,0,bone);addBox(.16,.08,-1.22,.075,.075,.42,0,-.04,0,dark);addBox(.18,.05,-1.48,.14,.05,.24,0,.08,0,bone);
  addBox(-.16,.11,-.74,.1,.1,.44,0,-.4,0,bone);addBox(-.36,.08,-1.08,.075,.075,.38,.1,-.55,0,dark);addBox(-.52,.05,-1.26,.13,.05,.22,0,-.6,0,bone);
  let vn=0;for(const g of parts)vn+=g.attributes.position.count;const P=new Float32Array(vn*3),C=new Float32Array(vn*3);let off=0;
  for(const g of parts){const a=g.attributes.position.array,c=g.attributes.color.array,cnt=g.attributes.position.count;P.set(a,off*3);C.set(c,off*3);off+=cnt;g.dispose();}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(P,3));geo.setAttribute('color',new T.BufferAttribute(C,3));geo.computeVertexNormals();
  const n=Math.max(1,corpses.length);const m=new T.InstancedMesh(geo,new T.MeshLambertMaterial({vertexColors:true}),n);m.count=corpses.length;m.castShadow=false;m.receiveShadow=true;m.frustumCulled=false;m.userData.skel453=1;scene.add(m);
  const o=new T.Object3D();corpses.forEach(function(p,i){o.position.set(p.x,.02,p.z);o.rotation.set(0,p.yaw,0);o.scale.set(1,1,1);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.instanceMatrix.needsUpdate=true;
  window.__dress453={signs:spots.length,streaks:Math.min(64,streaks.i||corpses.length),skels:corpses.length,spots:spots};}

// 4.3.54 — Arena 3v3, mappa propria, server in tempo reale
const ARENA454={on:false,preview:false,phase:'off',weapon:'pistol',mode:3,online:0,ws:null,root:null,blocks:[],actors:{},fig:{},pool:[],picks:[],pickMeshes:[],scores:[0,0],left:180000,me:'',team:0,you:null,hpShown:100,saved:null,hid:new Map(),keep:new Set(),built:false,kidN:-1};
window.__arena454=ARENA454;
const ARENA_COVERS=[[-14,-7,3.4,0.8,1.7],[-14,7,3.4,0.8,1.7],[14,-7,3.4,0.8,1.7],[14,7,3.4,0.8,1.7],[-7,-14,0.8,3.4,1.5],[7,-14,0.8,3.4,1.5],[-7,14,0.8,3.4,1.5],[7,14,0.8,3.4,1.5],[0,-9,5.2,0.9,1.25],[0,9,5.2,0.9,1.25],[-9,0,0.9,3.6,2.15],[9,0,0.9,3.6,2.15],[-20,12,2.2,2.2,1.3],[20,-12,2.2,2.2,1.3],[-20,-12,2.4,1.1,1.45],[20,12,2.4,1.1,1.45],[-4,4,1.4,1.4,1.1],[4,-4,1.4,1.4,1.1],[4,4,1.1,1.6,1.8],[-4,-4,1.6,1.1,1.8]];
const ARENA_PILLARS=[[-22,0],[22,0],[0,-22],[0,22],[-18,-18],[18,18],[-18,18],[18,-18]];
function arenaLcg(seed){let s=seed>>>0;return function(){s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
function aEsc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function arenaPid(){let id='';try{id=myId()||'';}catch(e){}if(id)return String(id);let k='';try{k=localStorage.getItem('zs_arena_pid')||'';}catch(e){}if(!k){k='g'+Math.floor(Math.random()*1e9).toString(36);try{localStorage.setItem('zs_arena_pid',k);}catch(e){}}return k;}
function arenaPname(){try{const u=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.user;if(u&&u.first_name)return String(u.first_name).slice(0,18);}catch(e){}return 'Giocatore';}
function arenaUrl(){try{const q=new URLSearchParams(location.search).get('arena');if(q)return q;}catch(e){}const h=location.hostname;if(h==='127.0.0.1'||h==='localhost')return 'ws://127.0.0.1:8791';return 'wss://zs-arena.gasparelb97.workers.dev/ws';}
function arenaChoices(){const ids={knife:1,pistol:1};try{const s=svLoadData();if(s&&s.w)for(let i=0;i<s.w.length;i++)if(s.w[i]&&s.w[i][0])ids[s.w[i][0]]=1;}catch(e){}for(const k in own)if(own[k])ids[k]=1;for(let i=0;i<SHOP_W.length;i++)if(owns(SHOP_W[i].id))ids[SHOP_W[i].w]=1;if(ownerHere449())for(let i=0;i<WEAPONS.length;i++)if(!WEAPONS[i].tool)ids[WEAPONS[i].id]=1;const out=[];for(let i=0;i<WEAPONS.length;i++)if(ids[WEAPONS[i].id]&&!WEAPONS[i].tool)out.push(WEAPONS[i]);return out;}
function arenaMarkGun(){const box=$('arenaGuns');if(!box)return;const btns=box.querySelectorAll('button');for(let i=0;i<btns.length;i++)btns[i].classList.toggle('on',btns[i].dataset.w===ARENA454.weapon);}
function arenaFillWeapons(){const box=$('arenaGuns');const list=arenaChoices();let html='',pick='';for(let i=0;i<list.length;i++){const w=list[i];if(!pick&&w.id==='pistol')pick=w.id;html+='<button type="button" class="aGun" data-w="'+w.id+'"><b>'+aEsc(w.name)+'</b><small>'+(w.melee?'mischia':(w.dmg+' danno'))+'</small></button>';}if(!pick)pick=list.length?list[0].id:'knife';ARENA454.weapon=pick;box.innerHTML=html;arenaMarkGun();}
function arenaShowPanel(which){const map={pick:'arenaPick',wait:'arenaWait',end:'arenaResult'};for(const k in map){const el=$(map[k]);if(el)el.classList.toggle('hidden',k!==which);}}
function arenaKeep(o){return o===camera||o===ARENA454.root||o.isLight||ARENA454.keep.has(o);}
function arenaSweepHide(){if(!(ARENA454.preview||ARENA454.on))return;const kids=scene.children;if(kids.length===ARENA454.kidN)return;ARENA454.kidN=kids.length;for(let i=0;i<kids.length;i++){const o=kids[i];if(arenaKeep(o)||ARENA454.hid.has(o))continue;ARENA454.hid.set(o,o.visible);o.visible=false;}}
function arenaShowWorld(){if(!ARENA454.fogSaved){ARENA454.fogSaved={c:scene.fog.color.getHex(),n:scene.fog.near,f:scene.fog.far,sc:sun.color.getHex(),si:sun.intensity};for(let i=0;i<scene.children.length;i++)if(scene.children[i].isHemisphereLight){const h=scene.children[i];ARENA454.hemi=h;ARENA454.hemiC=h.color.getHex();ARENA454.hemiG=h.groundColor.getHex();ARENA454.hemiI=h.intensity;}}scene.fog.color.setHex(0xe7a56a);scene.fog.near=18;scene.fog.far=78;sun.color.setHex(0xffc98a);sun.intensity=1.35;if(ARENA454.hemi){ARENA454.hemi.color.setHex(0xffe2b8);ARENA454.hemi.groundColor.setHex(0x7a4a2a);ARENA454.hemi.intensity=1.05;}ARENA454.root.visible=true;ARENA454.kidN=-1;arenaSweepHide();try{renderer.shadowMap.needsUpdate=true;}catch(e){}document.body.classList.add('arena454');}
function arenaHideWorld(){if(ARENA454.root)ARENA454.root.visible=false;ARENA454.hid.forEach(function(v,o){o.visible=v;});ARENA454.hid=new Map();ARENA454.kidN=-1;if(ARENA454.fogSaved){scene.fog.color.setHex(ARENA454.fogSaved.c);scene.fog.near=ARENA454.fogSaved.n;scene.fog.far=ARENA454.fogSaved.f;sun.color.setHex(ARENA454.fogSaved.sc);sun.intensity=ARENA454.fogSaved.si;}if(ARENA454.hemi){ARENA454.hemi.color.setHex(ARENA454.hemiC);ARENA454.hemi.groundColor.setHex(ARENA454.hemiG);ARENA454.hemi.intensity=ARENA454.hemiI;}document.body.classList.remove('arena454');}
function arenaBuild454(){if(ARENA454.built)return;ARENA454.built=true;const rnd=arenaLcg(45417);const root=new T.Group();root.name='arena454';root.visible=false;scene.add(root);ARENA454.root=root;ARENA454.keep.add(pMesh);if(typeof slashS449!=='undefined'&&slashS449)ARENA454.keep.add(slashS449);for(let i=0;i<tracers.length;i++)ARENA454.keep.add(tracers[i].m);if(typeof SP449!=='undefined')for(let i=0;i<SP449.length;i++)ARENA454.keep.add(SP449[i].s);
  const cv=document.createElement('canvas');cv.width=cv.height=512;const g=cv.getContext('2d');const grd=g.createRadialGradient(256,256,30,256,256,255);grd.addColorStop(0,'#f0d7a4');grd.addColorStop(0.42,'#c4844c');grd.addColorStop(1,'#7a4e2e');g.fillStyle=grd;g.fillRect(0,0,512,512);for(let i=0;i<1600;i++){const x=rnd()*512,y=rnd()*512;g.fillStyle=rnd()<0.5?'rgba(80,42,16,.28)':'rgba(255,236,200,.16)';g.fillRect(x,y,1+rnd()*3,1+rnd()*2);}g.strokeStyle='rgba(62,32,12,.4)';g.lineWidth=4;for(let i=0;i<3;i++){g.beginPath();g.arc(256,256,78+i*62,0,Math.PI*2);g.stroke();}g.strokeStyle='rgba(255,246,220,.25)';g.lineWidth=14;g.beginPath();g.moveTo(256,28);g.lineTo(256,484);g.moveTo(28,256);g.lineTo(484,256);g.stroke();g.fillStyle='rgba(36,92,210,.2)';g.beginPath();g.arc(78,256,86,0,Math.PI*2);g.fill();g.fillStyle='rgba(196,36,36,.2)';g.beginPath();g.arc(434,256,86,0,Math.PI*2);g.fill();const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  const floor=new T.Mesh(new T.CircleGeometry(36,64),new T.MeshLambertMaterial({map:tex,color:0xffffff}));floor.rotation.x=-Math.PI/2;floor.position.y=0.02;floor.receiveShadow=true;root.add(floor);
  const skyC=document.createElement('canvas');skyC.width=4;skyC.height=128;const sg=skyC.getContext('2d');const sgG=sg.createLinearGradient(0,0,0,128);sgG.addColorStop(0,'#f6c98a');sgG.addColorStop(0.45,'#e08a48');sgG.addColorStop(1,'#8a3d28');sg.fillStyle=sgG;sg.fillRect(0,0,4,128);const skyMap=new T.CanvasTexture(skyC);skyMap.colorSpace=T.SRGBColorSpace;const skyM=new T.Mesh(new T.SphereGeometry(90,24,12),new T.MeshBasicMaterial({map:skyMap,side:T.BackSide,fog:false,depthWrite:false}));root.add(skyM);
  const stone=new T.MeshLambertMaterial({color:0xd2b48a}),stoneD=new T.MeshLambertMaterial({color:0x9a7048}),clay=new T.MeshLambertMaterial({color:0xa24b32}),iron=new T.MeshLambertMaterial({color:0x3e4450}),trim=new T.MeshLambertMaterial({color:0xf0ddb0}),wood=new T.MeshLambertMaterial({color:0x7a4a28});
  const clothB=new T.MeshBasicMaterial({color:0x2f6fd0,side:T.DoubleSide}),clothR=new T.MeshBasicMaterial({color:0xd23a3a,side:T.DoubleSide});
  const ember=new T.MeshBasicMaterial({color:0xff9a3a});
  const R=34.15,N=28;for(let i=0;i<N;i++){const a=(i+0.5)/N*Math.PI*2;const ang=Math.atan2(Math.sin(a),Math.cos(a));const ad=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));const nearE=ad<0.22,nearW=Math.abs(ad-Math.PI)<0.22;if(nearE||nearW)continue;const x=Math.cos(a)*R,z=Math.sin(a)*R;const wall=new T.Mesh(G.box,i%2?stone:stoneD);wall.position.set(x,2.15,z);wall.rotation.y=Math.PI/2-a;wall.scale.set(8.1,4.3,1.35);wall.castShadow=true;wall.receiveShadow=true;root.add(wall);const top=new T.Mesh(G.box,trim);top.position.set(x,4.45,z);top.rotation.y=wall.rotation.y;top.scale.set(8.2,0.38,1.7);root.add(top);if(i%3===0){const br=new T.Mesh(G.box,ember);br.position.set(x*0.96,3.15,z*0.96);br.scale.set(0.28,0.22,0.28);root.add(br);}}
  for(let i=0;i<ARENA_COVERS.length;i++){const c=ARENA_COVERS[i];const mat=rnd()<0.45?clay:(rnd()<0.5?iron:wood);const m=new T.Mesh(G.box,mat);m.position.set(c[0],c[4]/2,c[1]);m.scale.set(c[2],c[4],c[3]);m.castShadow=true;m.receiveShadow=true;root.add(m);ARENA454.blocks.push({x0:c[0]-c[2]/2,x1:c[0]+c[2]/2,z0:c[1]-c[3]/2,z1:c[1]+c[3]/2});}
  for(let i=0;i<ARENA_PILLARS.length;i++){const p=ARENA_PILLARS[i];const col=new T.Mesh(G.cyl,stone);col.position.set(p[0],1.7,p[1]);col.scale.set(1.15,3.4,1.15);col.castShadow=true;col.receiveShadow=true;root.add(col);const cap=new T.Mesh(G.box,trim);cap.position.set(p[0],3.5,p[1]);cap.scale.set(1.55,0.28,1.55);cap.castShadow=true;root.add(cap);ARENA454.blocks.push({x0:p[0]-0.6,x1:p[0]+0.6,z0:p[1]-0.6,z1:p[1]+0.6});}
  function arch(x,mat,cloth){const L=new T.Mesh(G.box,mat);L.position.set(x,1.7,-3.3);L.scale.set(0.5,3.4,0.5);const Rr=L.clone();Rr.position.z=3.3;const beam=new T.Mesh(G.box,mat);beam.position.set(x,3.5,0);beam.scale.set(0.45,0.4,7.1);const ban=new T.Mesh(new T.PlaneGeometry(1.5,2.1),cloth);ban.position.set(x,2.15,0);root.add(L,Rr,beam,ban);}
  arch(-24,stoneD,clothB);arch(24,stoneD,clothR);
  const ring=new T.Mesh(new T.RingGeometry(3.1,3.55,40),new T.MeshBasicMaterial({color:0xf0d090,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=0.045;root.add(ring);
  const disc=new T.Mesh(new T.CircleGeometry(2.2,24),new T.MeshBasicMaterial({color:0x6a3a22,side:T.DoubleSide}));disc.rotation.x=-Math.PI/2;disc.position.y=0.04;root.add(disc);
  for(let i=0;i<18;i++){const x=(rnd()*2-1)*28,z=(rnd()*2-1)*28;if(Math.hypot(x,z)>30)continue;if(Math.abs(x)>22&&Math.abs(z)<8)continue;const rb=new T.Mesh(G.box,rnd()<0.5?stoneD:clay);rb.position.set(x,0.18,z);rb.rotation.y=rnd()*6;rb.scale.set(0.7+rnd()*0.8,0.28+rnd()*0.2,0.55+rnd()*0.5);rb.castShadow=true;root.add(rb);}
  ARENA454.matBlu=new T.MeshLambertMaterial({color:0x2f6fd0});ARENA454.matRed=new T.MeshLambertMaterial({color:0xd23a3a});const skin=new T.MeshLambertMaterial({color:0xd2a27a}),dark=new T.MeshLambertMaterial({color:0x2a3140}),gunM=new T.MeshLambertMaterial({color:0x2a2e34});
  ARENA454.skin=skin;ARENA454.shoe=new T.MeshLambertMaterial({color:0x16181c});ARENA454.hair=new T.MeshLambertMaterial({color:0x2a2118});ARENA454.eye=new T.MeshBasicMaterial({color:0x1c140e});
  function arenaGuy(){const g=new T.Group();const pelvis=new T.Group();pelvis.position.y=0.96;g.add(pelvis);
    const hip=new T.Mesh(G.box,dark);hip.scale.set(0.34,0.16,0.22);pelvis.add(hip);
    function leg(side){const h=new T.Group();h.position.set(side*0.1,-0.04,0);pelvis.add(h);const th=new T.Mesh(G.box,dark);th.position.y=-0.21;th.scale.set(0.13,0.4,0.14);h.add(th);const k=new T.Group();k.position.y=-0.42;h.add(k);const shin=new T.Mesh(G.box,dark);shin.position.y=-0.19;shin.scale.set(0.11,0.38,0.12);k.add(shin);const ft=new T.Mesh(G.box,ARENA454.shoe);ft.position.set(0,-0.4,-0.05);ft.scale.set(0.12,0.07,0.24);k.add(ft);return {h:h,k:k};}
    const L=leg(-1),R=leg(1);const spine=new T.Group();spine.position.y=0.1;pelvis.add(spine);
    const body=new T.Mesh(G.box,ARENA454.matBlu);body.position.y=0.26;body.scale.set(0.4,0.42,0.22);spine.add(body);
    const chest=new T.Mesh(G.box,ARENA454.matBlu);chest.position.set(0,0.4,-0.01);chest.scale.set(0.46,0.14,0.24);spine.add(chest);
    function arm(side){const sh=new T.Group();sh.position.set(side*0.27,0.44,0);spine.add(sh);const up=new T.Mesh(G.box,skin);up.position.y=-0.15;up.scale.set(0.09,0.28,0.09);sh.add(up);const el=new T.Group();el.position.y=-0.3;sh.add(el);const fr=new T.Mesh(G.box,skin);fr.position.y=-0.13;fr.scale.set(0.08,0.26,0.08);el.add(fr);const hand=new T.Mesh(G.box,skin);hand.position.set(0,-0.28,-0.02);hand.scale.set(0.07,0.08,0.08);el.add(hand);return {sh:sh,el:el};}
    const aL=arm(-1),aR=arm(1);const gun=new T.Mesh(G.box,gunM);gun.position.set(0.02,-0.26,-0.22);gun.scale.set(0.05,0.06,0.38);aR.el.add(gun);
    const neck=new T.Group();neck.position.y=0.52;spine.add(neck);const head=new T.Mesh(G.box,skin);head.position.y=0.16;head.scale.set(0.22,0.24,0.22);neck.add(head);
    const hair=new T.Mesh(G.box,ARENA454.hair);hair.position.set(0,0.27,0.02);hair.scale.set(0.23,0.08,0.2);neck.add(hair);
    const eL=new T.Mesh(G.box,ARENA454.eye);eL.position.set(-0.055,0.18,-0.12);eL.scale.set(0.045,0.03,0.02);neck.add(eL);
    const eR=eL.clone();eR.position.x=0.055;neck.add(eR);
    const brow=new T.Mesh(G.box,ARENA454.hair);brow.position.set(0,0.22,-0.12);brow.scale.set(0.16,0.025,0.02);neck.add(brow);
    const ncv=document.createElement('canvas');ncv.width=256;ncv.height=64;const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(ncv),transparent:true,depthWrite:false}));sp.position.y=2.05;sp.scale.set(1.6,0.4,1);sp.center.set(0.5,0);g.add(sp);
    g.visible=false;root.add(g);
    return {g:g,body:body,chest:chest,hip:hip,sp:sp,cv:ncv,ctx:ncv.getContext('2d'),team:-2,name:'',pelvis:pelvis,spine:spine,neck:neck,hipL:L.h,hipR:R.h,kneeL:L.k,kneeR:R.k,shL:aL.sh,shR:aR.sh,elL:aL.el,elR:aR.el};}
  for(let n=0;n<8;n++)ARENA454.pool.push(arenaGuy());
  ARENA454.demo=[arenaGuy(),arenaGuy()];ARENA454.demo[1].body.material=ARENA454.matRed;ARENA454.demo[1].chest.material=ARENA454.matRed;
  const octa=new T.OctahedronGeometry(0.35,0);for(let i=0;i<12;i++){const pm=new T.Mesh(octa,new T.MeshBasicMaterial({color:0xffd060}));pm.visible=false;const halo=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffd060,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0.9}));halo.scale.set(1.4,1.4,1);pm.add(halo);root.add(pm);ARENA454.pickMeshes.push({m:pm,halo:halo,id:0});}
}
function arenaCollide(p,r){const B=ARENA454.blocks;for(let i=0;i<B.length;i++){const b=B[i];const cx=p.x<b.x0?b.x0:(p.x>b.x1?b.x1:p.x),cz=p.z<b.z0?b.z0:(p.z>b.z1?b.z1:p.z);const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r;}else{const l=p.x-b.x0,rr=b.x1-p.x,u=p.z-b.z0,dd=b.z1-p.z,m=Math.min(l,rr,u,dd);if(m===l)p.x=b.x0-r;else if(m===rr)p.x=b.x1+r;else if(m===u)p.z=b.z0-r;else p.z=b.z1+r;}}}const R=32.6-r;const d=Math.hypot(p.x,p.z);if(d>R&&d>1e-6){p.x*=R/d;p.z*=R/d;}}
function arenaSend(obj){const ws=ARENA454.ws;if(!ws||ws.readyState!==1)return;try{ws.send(JSON.stringify(obj));}catch(e){}}
function arenaCloseSock(){const ws=ARENA454.ws;ARENA454.ws=null;if(!ws)return;ws.onclose=null;ws.onmessage=null;ws.onerror=null;try{ws.close();}catch(e){}}
function arenaSetOnline(n){ARENA454.online=n|0;const nodes=document.querySelectorAll('#arenaScreen .aOnline');const label='Giocatori online: '+(n|0);for(let i=0;i<nodes.length;i++)nodes[i].textContent=label;}
function arenaFail(m){if(ARENA454.phase==='off'||ARENA454.phase==='end')return;if(ARENA454.phase==='pick'){const el=$('arenaOnline');if(el)el.textContent=m;return;}ARENA454.phase='wait';game.state='arenaView';firing=false;if(document.pointerLockElement)document.exitPointerLock();document.body.classList.add('inmenu');$('arenaMsg').textContent=m;$('arenaScreen').classList.remove('hidden');arenaShowPanel('wait');$('arenaHud').classList.add('hidden');}
function arenaSavePlayer(){if(ARENA454.saved)return;const o={},mg={},r={};for(const k in own){o[k]=own[k];mg[k]=mag[k];r[k]=res[k];}ARENA454.saved={own:o,mag:mg,res:r,w:curW,x:player.pos.x,z:player.pos.z,yaw:player.yaw,pitch:player.pitch,hp:player.hp,max:player.maxHp};}
function arenaRestorePlayer(){const s=ARENA454.saved;if(!s)return;for(const k in own){if(k in s.own)own[k]=s.own[k];if(k in s.mag)mag[k]=s.mag[k];if(k in s.res)res[k]=s.res[k];}player.pos.set(s.x,0,s.z);player.vel.set(0,0,0);player.yaw=player.tYaw=s.yaw;player.pitch=player.tPitch=s.pitch;player.hp=s.hp;player.maxHp=s.max;curW=-1;try{equip(s.w,true);}catch(e){}ARENA454.saved=null;}
function arenaLabel(f,name,team){if(f.name===name&&f.team===team)return;f.name=name;f.team=team;const ctx=f.ctx;ctx.clearRect(0,0,256,64);ctx.fillStyle=team?'#c43232':'#2a66c4';ctx.fillRect(18,10,220,44);ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(name||'').slice(0,16),128,32);f.sp.material.map.needsUpdate=true;const mat=team?ARENA454.matRed:ARENA454.matBlu;f.body.material=mat;if(f.chest)f.chest.material=mat;}
function arenaGrabFig(id,team){let f=ARENA454.fig[id];if(f)return f;f=ARENA454.pool.pop();if(!f)return null;ARENA454.fig[id]=f;f.g.visible=true;arenaLabel(f,'',team);return f;}
function arenaApplyPickups(list){ARENA454.picks=list||[];const col={dmg:0xffc14a,spd:0x5ce1ff,arm:0xc9a0ff,ammo:0x8dff72,med:0xff5a62};for(let i=0;i<ARENA454.pickMeshes.length;i++){const slot=ARENA454.pickMeshes[i],it=ARENA454.picks[i];if(!it){slot.m.visible=false;slot.id=0;continue;}slot.m.visible=true;slot.id=it.id;slot.k=it.k;slot.m.position.set(it.x,0.85,it.z);const c=col[it.k]||0xffd060;slot.m.material.color.setHex(c);slot.halo.material.color.setHex(c);}}
function arenaSyncAmmo(pool){const w=WEAPONS[curW];if(!w||w.melee||pool<0)return;const sum=(mag[w.id]|0)+(res[w.id]|0);if(sum===pool)return;if(pool<(mag[w.id]|0)){mag[w.id]=pool;res[w.id]=0;}else res[w.id]=pool-(mag[w.id]|0);}
function arenaHud(){const left=Math.max(0,Math.ceil((ARENA454.left||0)/1000));const mm=Math.floor(left/60),ss=left%60;const clock=mm+':'+(ss<10?'0':'')+ss;$('aTime').textContent=clock;$('aScore0').textContent=ARENA454.scores[0]|0;$('aScore1').textContent=ARENA454.scores[1]|0;const you=ARENA454.you;let extra='';if(you&&!you.alive)extra='Rientri tra '+Math.ceil((you.respawnIn||0)/1000)+'s';else if(you&&you.buffs){if(you.buffs.dmg>0)extra+='Danno ';if(you.buffs.spd>0)extra+='Velocità ';if(you.buffs.arm>0)extra+='Difesa ';} $('aBuff').textContent=extra;$('hpTxt').textContent=Math.ceil(player.hp);$('hpFill').style.width=Math.max(0,player.hp)+'%';const w=WEAPONS[curW];if(w){$('wName').textContent=w.name+(w.melee?'':' · '+w.dmg);$('wAmmo').innerHTML=w.melee?'∞':(fx.reload>=0?'Ricarica…':'<span class="mag">'+(mag[w.id]|0)+'</span> / '+(res[w.id]|0));}$('clockTxt').textContent=clock;$('clockIc').textContent='⚔️';$('kills').textContent=(ARENA454.scores[ARENA454.team|0]|0);const low=player.hp>0&&player.hp<30;$('lowhp').style.opacity=low?'0.45':'0';}
function arenaPose(f,ph,amp,alive){if(!f||!f.hipL)return;const s=Math.sin(ph),c=Math.cos(ph),a=Math.max(0,Math.min(1,amp)),idle=a<0.12;
  if(!alive){f.pelvis.position.y=0.62;f.pelvis.rotation.set(0.15,0,0);f.spine.rotation.set(0.3,0,0);f.hipL.rotation.set(-0.3,0,0);f.kneeL.rotation.x=1.1;f.hipR.rotation.set(0.1,0,0);f.kneeR.rotation.x=0.5;f.shL.rotation.set(0.35,0,0.3);f.elL.rotation.x=-0.7;f.shR.rotation.set(-0.1,0,-0.2);f.elR.rotation.x=-0.45;f.neck.rotation.set(0.15,0,0);f.g.rotation.x=1.02;return;}
  f.g.rotation.x=0;
  f.hipL.rotation.set(s*0.6*a,0,0.04);f.hipR.rotation.set(-s*0.6*a,0,-0.04);
  f.kneeL.rotation.x=idle?0.14:(0.1+Math.max(0,c)*0.95*a);f.kneeR.rotation.x=idle?0.14:(0.1+Math.max(0,-c)*0.95*a);
  f.pelvis.position.y=0.96+Math.abs(Math.sin(ph*2))*0.04*a;f.pelvis.rotation.set(0.02*a,s*0.08*a,Math.cos(ph)*0.06*a);
  f.spine.rotation.set(0.06+Math.sin(ph*2)*0.02*a,-s*0.12*a,-Math.cos(ph)*0.04*a);
  f.shL.rotation.set(idle?0.06:(-s*0.68*a),0.02,0.12);f.shR.rotation.set(idle?0.1:(s*0.62*a),-0.02,-0.14);
  f.elL.rotation.x=idle?-0.3:(-0.42-Math.max(0,-s)*0.25*a);f.elR.rotation.x=idle?-0.48:(-0.55-Math.max(0,s)*0.2*a);
  f.neck.rotation.set(-0.05,Math.sin(ph*0.5)*0.04,-s*0.04*a);}
function arenaDrive(f,x,z,yaw,now,alive){if(f.lx==null){f.lx=x;f.lz=z;f.lt=now;f.amp=0;f.ph=0;}const dist=Math.hypot(x-f.lx,z-f.lz);const dt=Math.min(0.05,Math.max(0.001,(now-(f.lt||now))/1000));f.lx=x;f.lz=z;f.lt=now;const spd=dist/dt;f.amp+=(Math.min(1,spd/2.6)-(f.amp||0))*Math.min(1,dt*8);f.ph=(f.ph||0)+dist*4.15+(1-Math.min(1,spd/2.6))*dt*0.65;f.g.position.set(x,0,z);f.g.rotation.y=yaw||0;arenaPose(f,f.ph,alive?f.amp:0,!!alive);}
function arenaAnimate(now){const t=now/1000;for(let i=0;i<ARENA454.pickMeshes.length;i++){const s=ARENA454.pickMeshes[i];if(!s.m.visible)continue;s.m.rotation.y=t*1.6+i;s.m.position.y=0.85+Math.sin(t*2+i)*0.12;}const ids=ARENA454.actors;for(const id in ids){const a=ids[id];const f=ARENA454.fig[id];if(!f)continue;const k=Math.min(1,(now-(a.t||now))/120);const x=a.px+(a.x-a.px)*k,z=a.pz+(a.z-a.pz)*k;const vis=!!(a.alive||(now-(a.deadAt||0)<1800));f.g.visible=vis;if(a.name)arenaLabel(f,a.name,a.team|0);if(vis)arenaDrive(f,x,z,a.yaw||0,now,!!a.alive);}if(ARENA454.demo){const show=!!(ARENA454.preview&&ARENA454.phase!=='play');const ang=t*0.65;for(let i=0;i<ARENA454.demo.length;i++){const f=ARENA454.demo[i];f.g.visible=show;if(!show)continue;if(f.team!==i)arenaLabel(f,i?'ROSSI':'BLU',i);const a=ang+i*Math.PI,rad=3.3,x=Math.sin(a)*rad,z=Math.cos(a)*rad,yaw=Math.atan2(-Math.cos(a),Math.sin(a));arenaDrive(f,x,z,yaw,now,true);}}}
function arenaSnap(msg){const now=performance.now();const seen={};const arr=msg.players||[];for(let i=0;i<arr.length;i++){const q=arr[i];if(q.id===ARENA454.me)continue;seen[q.id]=1;let a=ARENA454.actors[q.id];if(!a){a=ARENA454.actors[q.id]={px:q.x,pz:q.z,x:q.x,z:q.z,yaw:q.yaw||0,t:now};arenaGrabFig(q.id,q.team|0);}else{a.px=a.x;a.pz=a.z;}a.x=q.x;a.z=q.z;a.yaw=q.yaw||0;a.pitch=q.pitch||0;a.hp=q.hp|0;a.team=q.team|0;a.name=q.name||'';if(a.alive&&!q.alive)a.deadAt=now;a.alive=q.alive?1:0;a.t=now;}for(const id in ARENA454.actors)if(!seen[id]){const f=ARENA454.fig[id];if(f){f.g.visible=false;ARENA454.pool.push(f);delete ARENA454.fig[id];}delete ARENA454.actors[id];}if(msg.scores)ARENA454.scores=msg.scores;if(typeof msg.left==='number')ARENA454.left=msg.left;if(msg.you){const prev=ARENA454.hpShown;if(msg.you.tp){player.pos.set(msg.you.x,0,msg.you.z);player.vel.set(0,0,0);player.yaw=player.tYaw=msg.you.yaw||player.yaw;player.pitch=player.tPitch=0;}if(prev!=null&&msg.you.hp<prev){const d=$('dmg');d.style.opacity=1;setTimeout(function(){d.style.opacity=0;},180);try{play('hurt');}catch(e){}}ARENA454.hpShown=msg.you.hp;player.hp=msg.you.hp;ARENA454.you=msg.you;ARENA454.alive=!!msg.you.alive;arenaSyncAmmo(msg.you.ammo|0);}if(msg.pickups)arenaApplyPickups(msg.pickups);if(ARENA454.phase==='play')arenaHud();}
function arenaFx(msg){if(msg.scores)ARENA454.scores=msg.scores;if(msg.by===ARENA454.me){try{hitMarker(msg.kill?'kill':'');if(msg.part==='head')headshotFx();play(msg.kill?'kill':'hit',msg.part==='head');}catch(e){}}if(msg.victim===ARENA454.me&&msg.kill){try{toast('Sei a terra',1000);}catch(e){}}const a=ARENA454.actors[msg.victim];if(a){try{_tmp.set(a.x,msg.part==='head'?1.6:1.15,a.z);emit(_tmp,_up,12,[0x8a1010,0xff4040,0x3a0000],{speed:3.2,spread:1,life:0.45,size:0.06,grav:9});}catch(e){}}if(ARENA454.phase==='play')arenaHud();}
function arenaBegin(msg){arenaSavePlayer();ARENA454.on=true;ARENA454.phase='play';ARENA454.mode=msg.mode===1?1:3;ARENA454.team=msg.team|0;ARENA454.weapon=msg.weapon||ARENA454.weapon;ARENA454.scores=msg.scores||[0,0];ARENA454.left=msg.left||180000;ARENA454.alive=true;ARENA454.hpShown=100;ARENA454.you={hp:100,alive:1,buffs:{dmg:0,spd:0,arm:0},respawnIn:0};game.state='play';document.body.classList.remove('inmenu');$('arenaScreen').classList.add('hidden');$('arenaHud').classList.remove('hidden');$('arenaExitMatch').classList.remove('hidden');$('pauseScreen').classList.add('hidden');player.pos.set(msg.x,0,msg.z);player.vel.set(0,0,0);player.yaw=player.tYaw=msg.yaw||0;player.pitch=player.tPitch=0;player.hp=100;player.maxHp=100;const idx=WEAPONS.findIndex(function(w){return w.id===ARENA454.weapon;});if(idx>=0){const w=WEAPONS[idx];own[w.id]=true;if(w.melee){mag[w.id]=0;res[w.id]=0;}else{mag[w.id]=w.mag;res[w.id]=Math.max(0,(msg.ammo|0)-w.mag);}curW=-1;equip(idx,true);}for(const id in ARENA454.actors)delete ARENA454.actors[id];arenaApplyPickups(msg.pickups||[]);const roster=msg.players||[];for(let i=0;i<roster.length;i++){const q=roster[i];if(q.id===ARENA454.me)continue;ARENA454.actors[q.id]={px:0,pz:0,x:0,z:0,yaw:0,alive:1,team:q.team|0,name:q.name||'',t:performance.now()};arenaGrabFig(q.id,q.team|0);}try{toast((msg.mode===1?'Uno contro uno · ':(ARENA454.team?'Squadra ROSSI · ':'Squadra BLU · '))+'3 minuti',1400);}catch(e){}lockPointer();last=performance.now();arenaHud();}
function arenaEnd(msg){$('arenaExitMatch').classList.add('hidden');ARENA454.phase='end';ARENA454.on=true;game.state='arenaView';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();document.body.classList.add('inmenu');const w=msg.winner|0;let title='Pareggio';if(w===0||w===1)title=(w===ARENA454.team)?'Vince la tua squadra':'Vince l\'altra squadra';const side=w<0?'':(w===0?'BLU':'ROSSI');$('arenaEndT').textContent=title;$('arenaEndS').textContent=(side?side+' · ':'')+(msg.scores?msg.scores[0]:0)+' — '+(msg.scores?msg.scores[1]:0);$('arenaHud').classList.add('hidden');$('arenaScreen').classList.remove('hidden');arenaShowPanel('end');}
function arenaOnMsg(msg){if(!msg||!msg.t)return;if(msg.t==='presence'){arenaSetOnline(msg.online);return;}if(msg.t==='lobby')return arenaLobby(msg);if(msg.t==='start')return arenaBegin(msg);if(msg.t==='snap')return arenaSnap(msg);if(msg.t==='fx')return arenaFx(msg);if(msg.t==='spawn'){if(msg.pickup){ARENA454.picks.push(msg.pickup);arenaApplyPickups(ARENA454.picks);}return;}if(msg.t==='taken'){ARENA454.picks=ARENA454.picks.filter(function(p){return p.id!==msg.id;});arenaApplyPickups(ARENA454.picks);if(msg.by===ARENA454.me){try{play('pickup',0);const lab={dmg:'Danno',spd:'Velocità',arm:'Difesa',ammo:'Munizioni',med:'Medikit'}[msg.k]||'Preso';toast(lab,700);}catch(e){}}return;}if(msg.t==='end')return arenaEnd(msg);if(msg.t==='no'&&msg.m){try{toast(msg.m,800);}catch(e){}}if(msg.t==='err'||msg.t==='kick')arenaFail(msg.m||'Connessione chiusa');}
function arenaLobby(msg){if(ARENA454.phase==='play')return;ARENA454.phase='wait';ARENA454.mode=msg.mode===1?1:3;game.state='arenaView';const n=msg.n|0;const need=msg.need||(ARENA454.mode===1?2:6);$('arenaCount').textContent=n+' / '+need;let h='';const names=msg.names||[];for(let i=0;i<names.length;i++)h+='<li>'+aEsc(names[i].name)+'</li>';$('arenaNames').innerHTML=h;if(typeof msg.online==='number')arenaSetOnline(msg.online);$('arenaMsg').textContent=msg.busy?'Una partita è in corso. Sei in coda per la prossima.':(ARENA454.mode===1?'Si parte quando siete in due.':'Si parte quando siete in sei, tre contro tre.');$('arenaScreen').classList.remove('hidden');arenaShowPanel('wait');}
function arenaConnect(){arenaCloseSock();ARENA454.me=arenaPid();let ws;try{ws=new WebSocket(arenaUrl());}catch(e){arenaFail('Server arena non raggiungibile');return;}ARENA454.ws=ws;ws.onopen=function(){const hello={id:ARENA454.me,name:arenaPname()};if(ARENA454.phase==='pick')arenaSend({t:'watch',id:hello.id,name:hello.name});else arenaSend({t:'join',id:hello.id,name:hello.name,weapon:ARENA454.weapon,mode:ARENA454.mode===1?1:3});};ws.onmessage=function(ev){let msg;try{msg=JSON.parse(ev.data);}catch(e){return;}arenaOnMsg(msg);};ws.onerror=function(){};ws.onclose=function(){if(ARENA454.ws===ws)arenaFail('Connessione con il server persa');};}
function arenaQueue(mode){audioInit();arenaShowWorld();ARENA454.mode=mode===1?1:3;ARENA454.preview=true;ARENA454.phase='wait';game.state='arenaView';$('arenaCount').textContent='…';$('arenaNames').innerHTML='';$('arenaMsg').textContent=ARENA454.mode===1?'Cerco un avversario…':'Cerco la squadra…';arenaShowPanel('wait');if(ARENA454.ws&&ARENA454.ws.readyState===1)arenaSend({t:'join',id:ARENA454.me||arenaPid(),name:arenaPname(),weapon:ARENA454.weapon,mode:ARENA454.mode});else arenaConnect();}
function arenaOpen(){audioInit();arenaBuild454();arenaShowWorld();ARENA454.preview=true;ARENA454.phase='pick';ARENA454.on=false;game.state='arenaView';$('startScreen').classList.add('hidden');$('soonScreen').classList.add('hidden');$('arenaScreen').classList.remove('hidden');arenaShowPanel('pick');arenaFillWeapons();arenaSetOnline(ARENA454.online||0);last=performance.now();arenaConnect();}
function arenaShutdown(){const ph=ARENA454.phase;ARENA454.phase='off';ARENA454.on=false;ARENA454.preview=false;arenaCloseSock();firing=false;try{resetTouchState();}catch(e){}if(document.pointerLockElement)document.exitPointerLock();arenaRestorePlayer();arenaHideWorld();if(ARENA454.root)ARENA454.root.visible=false;for(const id in ARENA454.fig){const f=ARENA454.fig[id];f.g.visible=false;ARENA454.pool.push(f);}ARENA454.fig={};ARENA454.actors={};$('arenaScreen').classList.add('hidden');$('arenaHud').classList.add('hidden');$('arenaExitMatch').classList.add('hidden');$('pauseScreen').classList.add('hidden');document.body.classList.remove('arena454');document.body.classList.add('inmenu');if(game.state==='play'||game.state==='pause'||game.state==='arenaView')game.state='menu';if(ph==='play'||ph==='end'){try{hideBanner();}catch(e){}}}
function arenaShutdownToMenu(){arenaShutdown();showMenu();}
function arenaChangeMode(){if(ARENA454.phase!=='wait')return;arenaCloseSock();ARENA454.phase='pick';ARENA454.on=false;game.state='arenaView';arenaShowPanel('pick');arenaSetOnline(ARENA454.online||0);arenaConnect();}
function arenaAgain(){if(ARENA454.phase!=='end'&&ARENA454.phase!=='wait')return;ARENA454.phase='wait';$('arenaMsg').textContent='Cerco un\'altra partita…';arenaShowPanel('wait');if(!ARENA454.ws||ARENA454.ws.readyState!==1)arenaConnect();else arenaSend({t:'ready',id:ARENA454.me||arenaPid(),name:arenaPname(),weapon:ARENA454.weapon,mode:ARENA454.mode===1?1:3});}
function arenaClaim(){if(!ARENA454.on||!ARENA454.alive)return false;let best=null,bd=1.7;for(let i=0;i<ARENA454.picks.length;i++){const p=ARENA454.picks[i];const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(d<bd){bd=d;best=p;}}if(!best)return false;arenaSend({t:'claim',id:best.id});return true;}
function arenaShoot(){if(!ARENA454.alive)return;const w=WEAPONS[curW];if(!w)return;if(fx.reload>=0)return;if(w.spin&&fx.spin<1)return;if(!w.melee&&(mag[w.id]|0)<=0){if((res[w.id]|0)>0){startReload();return;}fireCd=0.35;play('empty');toast('Munizioni finite',900);return;}fireCd=w.rate;if(!w.melee)mag[w.id]=(mag[w.id]|0)-1;camera.updateMatrixWorld();camera.getWorldPosition(_org);_dir.set(0,0,-1).applyQuaternion(camera.quaternion);arenaSend({t:'shot',x:_org.x,y:_org.y,z:_org.z,dx:_dir.x,dy:_dir.y,dz:_dir.z});const reach=Math.min(w.range||40,48);const end=_tmp.copy(_org).addScaledVector(_dir,reach);if(!w.melee){try{tracer(_org.clone(),end.clone(),w.color||0xffe2a0,0.03,0.08);}catch(e){}}try{const vm=VM[w.id];if(vm&&vm.userData.flash){const fl=vm.userData.flash;fl.userData.t=0.06;fl.material.opacity=1;}muzzleLight.position.copy(_org);muzzleLight.intensity=w.melee?0:14;if(typeof kickShot==='function'&&!w.melee)kickShot(w);play(w.melee?'knife':(w.snd||w.id));}catch(e){}fx.shake+=w.melee?0.12:0.2;arenaHud();}
function arenaTick(dt){if(!(ARENA454.on&&ARENA454.phase==='play'&&game.state==='play'))return false;game.time+=dt;const t=game.time;let mx=0,mz=0;if(keys.KeyW||keys.ArrowUp)mz-=1;if(keys.KeyS||keys.ArrowDown)mz+=1;if(keys.KeyA||keys.ArrowLeft)mx-=1;if(keys.KeyD||keys.ArrowRight)mx+=1;const kl=Math.hypot(mx,mz);if(kl>1){mx/=kl;mz/=kl;}const J4=joy4310(dt);let jm=J4.m;if(J4.on){const k=Math.pow(Math.max(0,Math.min(1,jm)-0.12)/0.88,1.25)/Math.max(jm,1e-4);mx+=J4.x*k;mz+=J4.y*k;}const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml;}if(!ARENA454.alive){mx=0;mz=0;firing=false;}const buff=ARENA454.you&&ARENA454.you.buffs&&ARENA454.you.buffs.spd>0?1.28:1;const sprint=keys.ShiftLeft||keys.ShiftRight||jm>0.96;const maxSp=(sprint?6.6:4.4)*(EQ.boots?1.12:1)*buff*(fx.spin>0?0.7:1)*(ADS.k>0.5?0.6:1);const sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);_mv.set((mx*cy+mz*sy)*maxSp,0,(-mx*sy+mz*cy)*maxSp);const accel=14;player.vel.x=damp(player.vel.x,_mv.x,accel,dt);player.vel.z=damp(player.vel.z,_mv.z,accel,dt);player.pos.addScaledVector(player.vel,dt);arenaCollide(player.pos,player.r);const spd=Math.hypot(player.vel.x,player.vel.z);player.moveAmt=clamp(spd/4.4,0,1.5);player.bob+=dt*spd*2.1;const lk=zsShow()?34:(isTouch?22:35);player.yaw=damp(player.yaw,player.tYaw,lk,dt);player.pitch=damp(player.pitch,player.tPitch,lk,dt);fx.recoilP=damp(fx.recoilP,0,fireCd>0.03?7:16,dt);fx.shake=Math.max(0,fx.shake-dt*4);const sh=Math.min(1,fx.shake)*fx.shake*0.025;const bobY=Math.sin(player.bob)*0.035*Math.min(1,player.moveAmt),bobX=Math.cos(player.bob*0.5)*0.02*Math.min(1,player.moveAmt);camera.position.set(player.pos.x+bobX*cy,1.62+bobY+(typeof CAMY43!=='undefined'?CAMY43:0),player.pos.z-bobX*sy);camera.rotation.set(player.pitch+fx.recoilP,player.yaw,Math.sin(player.bob*0.5)*0.006*player.moveAmt);const w=WEAPONS[curW];fireCd-=dt;if(ARENA454.alive&&firing&&fireCd<=0&&fx.reload<0&&fx.swap<0.3){if(w.auto||w.melee||!triggerHeld||isTouch){fire();triggerHeld=true;}}if(fx.reload>=0){fx.reload+=dt;$('rlFill').style.width=Math.min(100,fx.reload/fx.reloadDur*100)+'%';if(fx.reload>=fx.reloadDur)finishReload();}try{updateViewmodel(dt,w);}catch(e){}muzzleLight.intensity=Math.max(0,muzzleLight.intensity-dt*200);const now=performance.now();if(now-(ARENA454.sendT||0)>90){ARENA454.sendT=now;arenaSend({t:'pos',x:player.pos.x,z:player.pos.z,yaw:player.yaw,pitch:player.pitch});}if(ARENA454.alive&&now-(ARENA454.claimAt||0)>180){let near=false;for(let i=0;i<ARENA454.picks.length;i++){const p=ARENA454.picks[i];if(Math.hypot(p.x-player.pos.x,p.z-player.pos.z)<1.55){near=true;ARENA454.claimAt=now;arenaSend({t:'claim',id:p.id});break;}}if($('pickBtn'))$('pickBtn').classList.toggle('ready',near);}return true;}
function arenaPause(){if(game.state!=='play')return;game.state='pause';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();$('pauseInfo').innerHTML=(ARENA454.mode===1?'Arena uno contro uno':'Arena 3 contro 3')+'<br><small>La partita continua. Se esci, resti fuori dal campo.</small>';$('pauseScreen').classList.remove('hidden');}
ARENA454.open=arenaOpen;ARENA454.shutdown=arenaShutdown;ARENA454.tick=arenaTick;ARENA454.hud=arenaHud;ARENA454.claim=arenaClaim;ARENA454.pause=arenaPause;ARENA454.busy=function(){return !!(ARENA454.preview||ARENA454.on);};ARENA454.firing=function(){if(!(ARENA454.on&&ARENA454.phase==='play'))return false;arenaShoot();return true;};
onTap('arenaBack',arenaShutdownToMenu);onTap('arenaCancel',arenaChangeMode);onTap('arenaExitMatch',arenaShutdownToMenu);onTap('arenaDuel',function(){arenaQueue(1);});onTap('arenaTrio',function(){arenaQueue(3);});onTap('arenaAgain',arenaAgain);onTap('arenaMenu',arenaShutdownToMenu);
$('arenaGuns').addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('button');if(!b||!b.dataset.w)return;ARENA454.weapon=b.dataset.w;arenaMarkGun();});
$('arenaGuns').addEventListener('touchmove',function(e){e.stopPropagation();},{passive:true});
addEventListener('keydown',function(e){if(!ARENA454.on)return;if(e.code==='KeyC'||e.code==='KeyG'||e.code==='KeyB'||e.code==='KeyI'||e.code==='Tab'||e.code.indexOf('Digit')===0){e.preventDefault();e.stopImmediatePropagation();}},true);
const loop0ArenaCity=loop0;loop0=function(now){if(ARENA454.preview||ARENA454.on){if(game.state==='arenaView'){const d=ARENA454.demo&&ARENA454.demo[0];if(d&&d.g.visible){const yaw=d.g.rotation.y,fx=-Math.sin(yaw),fz=-Math.cos(yaw);camera.position.set(d.g.position.x+fx*3.5,1.55,d.g.position.z+fz*3.5);camera.lookAt(d.g.position.x,1.25,d.g.position.z);}else{const t=now/1000;camera.position.set(Math.sin(t*0.18)*30,18,Math.cos(t*0.18)*30);camera.lookAt(0,1.2,0);}}arenaAnimate(now);arenaSweepHide();}return loop0ArenaCity(now);};
const back454=window.__zsBack;window.__zsBack=function(){if(ARENA454.preview||ARENA454.on){if(ARENA454.phase==='play'&&game.state==='play'){arenaPause();return true;}arenaShutdownToMenu();return true;}return back454?back454():false;};

LDAY.hemi=1.2;LDAY.sun=1.6;LDAY.near=48;LDAY.far=170;LDUSK.near=28;LDUSK.far=115;
const enterCity=svEnter;svEnter=function(load){enterCity(load);if(!load||!svLoadData()){player.pos.set(-122,0,75);player.vel.set(0,0,0);player.yaw=player.tYaw=0;}};
ground.userData.dry=ground.material.map;applyLight();
arenaBuild454();bag439Layout();
const _uz463=updateZombie;updateZombie=function(z,dt,t,target,canAttack){
  const ox=z.g.position.x,oz=z.g.position.z,ph=z.phase||0;
  _uz463(z,dt,t,target,canAttack);
  if(!z.alive||z.dead||!z.g||z.slamS>0)return;
  const dist=Math.hypot(z.g.position.x-ox,z.g.position.z-oz);
  const spd=dist/Math.max(dt,0.001);
  z.move463=z.move463||0;
  z.move463+=(Math.min(1,spd/Math.max(0.4,z.speed||1))-z.move463)*Math.min(1,dt*8);
  if(z.state!=='atk'){
    const stride=z.crawl?6.4:(z.V.name==='runner'?3.25:(z.V.heavy?3.7:4.15));
    z.phase=ph+dist*stride+(1-Math.min(1,spd))*dt*0.35;
    poseWalk(z,t,z.move463);
    if(z.stag>0){const k=z.stag/0.3;z.spine.rotation.x-=k*0.85;if(!z.gore||!z.gore.armL)z.shL.rotation.x+=k*0.9;if(!z.gore||!z.gore.armR)z.shR.rotation.x+=k*0.7;}
    if(z.stagHead>0&&z.neck&&z.neck.visible)z.neck.rotation.x-=z.stagHead*1.1;
  }
};

