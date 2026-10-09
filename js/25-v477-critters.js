'use strict';
// ======================= v4.3.77 critters: crows that roam near you (perch on walls, fences, graves, trash, ground; hop, peck, take off, fly in), realistic small cockroaches inside houses and bases =======================
const M477C={on:true,err:0};function e477c(e,w){M477C.err++;try{console.warn('477c',w,e&&e.message);}catch(_){}try{window.__DBG&&__DBG.prob('err','crit477',w+': '+(e&&e.message||e));}catch(_){}if(M477C.err>40)M477C.on=false;}
// low-poly merged builder (tiny animals: keep vertex count low)
const LP477={SH:null};function lpShapes477(){if(LP477.SH)return LP477.SH;const SH={s:new T.SphereGeometry(.5,7,5),b:new T.BoxGeometry(1,1,1),n:new T.ConeGeometry(.5,1,5)};for(const k in SH){let g=SH[k];if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');SH[k]=g;}LP477.SH=SH;return SH;}
// P = [shape, colour, x,y,z, sx,sy,sz, rx,ry,rz, tag]; returns geometry with attribute aTag477 = tag
function lpBuild477(P){const SH=lpShapes477();let n=0;for(const p of P)n+=SH[p[0]].attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),tg=new Float32Array(n);
  const M=new T.Matrix4(),N3=new T.Matrix3(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),s=new T.Vector3(),cc=new T.Color();let o=0;
  for(const p of P){const g=SH[p[0]],Pa=g.attributes.position,Na=g.attributes.normal,c=Pa.count;M.compose(v.set(p[2],p[3],p[4]),q.setFromEuler(e.set(p[8]||0,p[9]||0,p[10]||0)),s.set(p[5],p[6],p[7]));N3.getNormalMatrix(M);cc.setHex(p[1]);
    for(let i=0;i<c;i++){v.fromBufferAttribute(Pa,i).applyMatrix4(M);const j=(o+i)*3;pos[j]=v.x;pos[j+1]=v.y;pos[j+2]=v.z;v.fromBufferAttribute(Na,i).applyMatrix3(N3).normalize();nor[j]=v.x;nor[j+1]=v.y;nor[j+2]=v.z;col[j]=cc.r;col[j+1]=cc.g;col[j+2]=cc.b;tg[o+i]=p[11]||0;}o+=c;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));geo.setAttribute('aTag477',new T.BufferAttribute(tg,1));geo.computeBoundingSphere();return geo;}

// ---------- crows ----------
const CR477={list:[],mesh:null,fl:null,U:{value:0},o:new T.Object3D(),chk:0,caw:6};
function crowGeo477(){const K=0x15151b,K2=0x1d1f2a,K3=0x0c0c10,BK=0x2a2a2e,P=[],a=(...x)=>P.push(x),H=Math.PI/2;
  a('s',K,0,0,0,.17,.15,.36,-.12,0,0);a('s',K2,0,-.015,.09,.15,.15,.2);a('s',K,0,.075,.2,.12,.12,.13);a('s',K2,0,.06,.15,.1,.1,.08);
  a('n',BK,0,.065,.3,.042,.13,.05,H,0,0);a('b',BK,0,.078,.27,.02,.012,.05,.15,0,0);for(const s of [-1,1]){a('s',0x050505,s*.047,.09,.245,.026,.026,.026);a('s',0xd8d8e0,s*.055,.096,.252,.008,.008,.008);}
  for(const r of [-.22,0,.22])a('b',K3,Math.sin(r)*.06,-.02,-.27,.055,.012,.22,-.12,r,0);
  for(const s of [-1,1]){a('b',BK,s*.035,-.115,.03,.014,.11,.014);a('b',BK,s*.035,-.17,.07,.012,.008,.07);a('b',BK,s*.05,-.17,.06,.008,.008,.05,0,s*.5,0);a('b',BK,s*.035,-.17,-.0,.008,.008,.04);}
  for(const s of [-1,1]){a('b',K,s*.2,.03,0,.32,.016,.21,0,0,0,s);a('b',K2,s*.4,.03,-.03,.14,.014,.16,0,s*.25,0,s);for(let i=0;i<4;i++)a('b',K3,s*(.5+i*.012),.03,-.07+i*.035,.12,.01,.03,0,s*(.15-.12*i),0,s);a('b',K2,s*.13,.045,-.05,.14,.012,.16,0,0,0,s);}
  return lpBuild477(P);}
function crowInit477(){const q=L476.q,n=[6,10,14][q];const geo=crowGeo477();const fl=new T.InstancedBufferAttribute(new Float32Array(n*2),2);geo.setAttribute('iFl477',fl);
  const mat=new T.MeshPhongMaterial({vertexColors:true,shininess:38,specular:0x30323e});mat.onBeforeCompile=sh=>{sh.uniforms.uT477=CR477.U;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aTag477;attribute vec2 iFl477;uniform float uT477;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nif(aTag477!=0.){float fly=iFl477.x;float a=(sin(uT477*iFl477.y)*.95+.12)*fly-(1.-fly)*.1;float sx=aTag477*.07;vec3 p=transformed;p.x-=sx;p.x*=mix(.3,1.,fly);float c=cos(a),s=sin(a)*aTag477;transformed.x=sx+p.x*c-p.y*s;transformed.y=p.x*s+p.y*c+(1.-fly)*.01;transformed.z=p.z-(1.-fly)*.05;}');};
  mat.customProgramCacheKey=()=>'crow477';const m=new T.InstancedMesh(geo,mat,n);m.name='crows477';m.frustumCulled=false;m.castShadow=false;scene.add(m);CR477.mesh=m;CR477.fl=fl;
  for(let i=0;i<n;i++)CR477.list.push({g:Math.floor(i/(q?3:2)),x:0,y:-50,z:0,yaw:Math.random()*6.28,pitch:0,bank:0,st:4,fl:0,fq:15+Math.random()*5,vx:0,vy:0,vz:0,t:0,peck:0,hop:0,s:.9+Math.random()*.25,tgt:null,glide:0});
  CR477.groups=Math.ceil(n/(q?3:2));m.count=n;for(let i=0;i<n;i++)crowW477(i);}
function crowW477(i){const c=CR477.list[i],o=CR477.o;const hy=c.hop>0?Math.sin(c.hop/.28*Math.PI)*.09:0;o.position.set(c.x,c.y+(c.st===0?.18*c.s:0)+hy,c.z);
  o.rotation.set(c.pitch+(c.peck>0?Math.sin(c.peck*Math.PI)*.75:0),c.yaw,c.bank||0,'YXZ');o.scale.setScalar(c.st===4?0:c.s);o.updateMatrix();CR477.mesh.setMatrixAt(i,o.matrix);CR477.fl.setXY(i,c.fl,c.st===0?0:c.fq*(c.glide?.2:1));}
// a landing spot near the player: wall/fence/gate tops of the base, graves/posts/benches, trash piles, open ground
function crowSpot477(px,pz,away){const r=Math.random;for(let t=0;t<14;t++){const u=r();let s=null;
    if(u<.3){const L=PIECES.filter(p=>p.alive&&Math.hypot(p.x-px,p.z-pz)<45&&Math.hypot(p.x-px,p.z-pz)>9);if(L.length){const p=L[(r()*L.length)|0],D=PDEF[p.type];const top={wall:2.64,brickw:2.67,logwall:2.6,fence:1.22,wgate:1.52,gate:2.62,door:2.69,rdoor:2.68,mdoor:2.66,pillar:2.8,hesco:1.33,swall:2.63,bunker:1.12,tower:0,palisade:2.4}[p.type];
        if(top){const al=p.rot%2===0,o=(r()-.5)*1.4;s={x:p.x+(al?o:0),y:top,z:p.z+(al?0:o)};}else if(D&&D.edge)s={x:p.x,y:0,z:p.z+(r()<.5?1.2:-1.2)};}}
    else if(u<.55){const P=L476.perch.filter(p=>Math.hypot(p.x-px,p.z-pz)<55&&Math.hypot(p.x-px,p.z-pz)>10);if(P.length){const p=P[(r()*P.length)|0];s={x:p.x+(r()-.5)*.4,y:p.y,z:p.z+(r()-.5)*.4};}}
    else if(u<.75){const S=L476.spots.filter(p=>Math.hypot(p.x-px,p.z-pz)<50&&Math.hypot(p.x-px,p.z-pz)>10);if(S.length){const p=S[(r()*S.length)|0];s={x:p.x+(r()-.5)*2,y:0,z:p.z+(r()-.5)*2};}}
    if(!s){const a=away!=null?away+(r()-.5)*1.6:r()*6.28,d=14+r()*24;s={x:px+Math.sin(a)*d,y:0,z:pz+Math.cos(a)*d};}
    if(Math.abs(s.x)>HALF-5||Math.abs(s.z)>HALF-5)continue;if(s.y===0&&!freePt476(s.x,s.z,.3))continue;if(s.y===0){let inH=false;try{for(const R of (IN476.all||[]))if(s.x>R[0]&&s.x<R[1]&&s.z>R[2]&&s.z<R[3]){inH=true;break;}}catch(e){}if(inH)continue;}return s;}return null;}
function crowTick477(dt,t,play){const L=CR477.list;if(!L.length)return;CR477.U.value=t%600;const px=player.pos.x,pz=player.pos.z,run=player.moveAmt>1.05;let ch=false,cawN=0,cx=0,cz=0;
  const shot=play&&firing&&(()=>{try{const w=WEAPONS[curW];return w&&!w.melee&&!w.tool;}catch(e){return false;}})();
  // groups far away (or not placed yet) fly in to a new spot near the player
  CR477.chk-=dt;if(CR477.chk<=0){CR477.chk=2.5;for(let g=0;g<CR477.groups;g++){const M=L.filter(c=>c.g===g);if(!M.length)continue;const far=M.every(c=>c.st===4||(c.st===0&&Math.hypot(c.x-px,c.z-pz)>75));if(!far||Math.random()<.35)continue;
      const sp=crowSpot477(px,pz);if(!sp)continue;const a=Math.random()*6.28;M.forEach((c,k)=>{c.x=sp.x+Math.sin(a)*(45+k*2);c.z=sp.z+Math.cos(a)*(45+k*2);c.y=14+k;c.st=2;c.fl=1;c.tgt={x:sp.x+(k?(Math.random()-.5)*(sp.y?1:2.4):0),y:sp.y,z:sp.z+(k?(Math.random()-.5)*(sp.y?.2:2.4):0)};});}}
  for(let i=0;i<L.length;i++){const c=L[i];if(c.st===4)continue;const dx=c.x-px,dz=c.z-pz,d2=dx*dx+dz*dz;
    if(c.st===0){let zn=false;if(d2<40*40)for(const z of zombies){if(z.alive&&!z.dead&&Math.abs(z.g.position.x-c.x)<2.5&&Math.abs(z.g.position.z-c.z)<2.5){zn=true;break;}}
      const trig=play&&(d2<(run?10*10:6*6)||(shot&&d2<22*22))||zn;
      if(trig){for(const o of L)if(o.g===c.g&&o.st===0){o.st=1;o.t=-Math.random()*.3;}cawN++;cx=c.x;cz=c.z;continue;}
      c.t-=dt;if(c.peck>0){c.peck=Math.max(0,c.peck-dt*3.2);ch=true;}if(c.hop>0){c.hop=Math.max(0,c.hop-dt);const sp=c.hop>0?.9:0;c.x+=Math.sin(c.yaw)*sp*dt;c.z+=Math.cos(c.yaw)*sp*dt;ch=true;}
      if(c.t<=0){c.t=.8+Math.random()*2.8;const u=Math.random();if(u<.42)c.peck=1;else if(u<.7)c.yaw+=(Math.random()-.5)*2.2;else if(c.y<.05){const nx=c.x+Math.sin(c.yaw)*.3,nz=c.z+Math.cos(c.yaw)*.3;if(freePt476(nx,nz,.2))c.hop=.28;else c.yaw+=2;}else c.yaw+=(Math.random()-.5)*1.2;ch=true;}
      if(ch)crowW477(i);continue;}
    if(c.st===1){c.t+=dt;if(c.t<0)continue;if(!c.vy){const a=Math.atan2(dx,dz)+(Math.random()-.5)*1.1,sp=4.5+Math.random()*2;c.vx=Math.sin(a)*sp;c.vz=Math.cos(a)*sp;c.vy=3.4+Math.random()*1.4;c.fl=1;}
      c.vy=Math.max(.3,c.vy-dt*.9);c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.yaw=Math.atan2(c.vx,c.vz);c.pitch=-Math.min(.5,c.vy*.1);c.bank=Math.sin(t*1.3+i)*.15;c.glide=c.y>8&&Math.sin(t*.8+i)>.4?1:0;
      if(c.t>3+Math.random()*2||c.y>16){const lead=L.find(o=>o.g===c.g&&o.st===2&&o.tgt);const sp=lead?lead.tgt:crowSpot477(px,pz,Math.atan2(dx,dz));if(sp){c.tgt={x:sp.x+(lead?(Math.random()-.5)*(sp.y?1:2.4):0),y:sp.y,z:sp.z+(lead?(Math.random()-.5)*(sp.y?.2:2.4):0)};c.st=2;}else{c.st=4;}c.vy=0;}
      crowW477(i);ch=true;continue;}
    if(c.st===2){const g=c.tgt;if(!g){c.st=4;continue;}const ex=g.x-c.x,ez=g.z-c.z,eh=Math.hypot(ex,ez),ey=g.y-c.y;const sp=Math.min(8,1.1+eh*.55);
      c.vx+=(ex/(eh||1)*sp-c.vx)*Math.min(1,dt*1.8);c.vz+=(ez/(eh||1)*sp-c.vz)*Math.min(1,dt*1.8);c.vy=clamp(ey*(eh<6?1.7:.3),-4,2);c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;
      c.yaw=Math.atan2(c.vx,c.vz);c.pitch=clamp(-c.vy*.08,-.3,.45)-(eh<2?.35:0);c.bank=0;c.glide=eh>10&&c.vy<-.4?1:0;c.fl=eh<2.5?.8:1;
      if(eh<.3&&Math.abs(ey)<.25){c.x=g.x;c.y=g.y;c.z=g.z;c.st=0;c.fl=0;c.pitch=0;c.vy=0;c.t=.6+Math.random()*2;c.glide=0;c.peck=0;}
      else if(play&&Math.hypot(g.x-px,g.z-pz)<7){const s2=crowSpot477(px,pz,Math.atan2(dx,dz));if(s2)c.tgt=s2;}crowW477(i);ch=true;}}
  if(ch){CR477.mesh.instanceMatrix.needsUpdate=true;CR477.fl.needsUpdate=true;}
  if(cawN&&play){try{caw476(cx,cz,2+(Math.random()*2|0));flap476(cx,cz);}catch(e){}}
  CR477.caw-=dt;if(CR477.caw<=0){CR477.caw=7+Math.random()*12;if(play){const c=L[(Math.random()*L.length)|0];if(c&&c.st===0&&Math.hypot(c.x-px,c.z-pz)<45){try{caw476(c.x,c.z,1+(Math.random()*2|0));}catch(e){}c.peck=0;c.pitch=-.25;crowW477(L.indexOf(c));}}}}

// ---------- cockroaches: ~4 cm, glossy dark brown, six legs + long antennae, skitter in bursts and scatter from you ----------
const RC477={list:[],nests:[],mesh:null,U:{value:0},mv:null,o:new T.Object3D(),chk:0,idx:[]};
function roachGeo477(){const P=[],a=(...x)=>P.push(x),AB=0x3c1b0a,WG=0x4e2610,PR=0x2c1207,RIM=0x7a4a20,HD=0x1c0b04,LG=0x2a140a;
  a('s',AB,0,.0055,-.004,.016,.008,.028);for(const s of [-1,1])a('s',WG,s*.0042,.0085,-.003,.0115,.0045,.028,0,s*.07,0,0);
  a('s',RIM,0,.0062,.0125,.0175,.0042,.0125);a('s',PR,0,.0075,.0125,.0145,.0045,.011);a('s',HD,0,.0048,.0205,.0075,.005,.0065);
  for(const s of [-1,1]){a('b',LG,s*.0075,.0075,.04,.0007,.0007,.04,-.12,s*.28,0,3);a('b',LG,s*.003,.0055,-.0205,.0009,.0009,.007,0,s*.35,0,0);}
  const legs=[[.011,-.55,.75],[.002,.15,.85],[-.008,.75,1]];legs.forEach(([z,ry,L],k)=>{for(const s of [-1,1]){const tag=((k%2===0)===(s<0))?1:2;
    const c=Math.cos(ry),sn=Math.sin(ry);a('b',LG,s*(.009+.006*L*c),.0045,z-.006*L*sn,.012*L,.0012,.0014,0,s*-ry,s*.3,tag);a('b',LG,s*(.0175+.013*L*c),.0015,z-.013*L*sn*1.3,.012*L,.001,.0012,0,s*-ry*1.3,s*-.45,tag);}});
  return lpBuild477(P);}
function roachInit477(){const q=L476.q,nN=[3,5,7][q],per=[6,8,10][q],n=nN*per;const geo=roachGeo477();const mv=new T.InstancedBufferAttribute(new Float32Array(n),1);geo.setAttribute('iMv477',mv);
  const mat=new T.MeshPhongMaterial({vertexColors:true,shininess:90,specular:0x9a7050});mat.onBeforeCompile=sh=>{sh.uniforms.uT477=RC477.U;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aTag477;attribute float iMv477;uniform float uT477;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nfloat fi=float(gl_InstanceID)*1.37;if(aTag477>.5&&aTag477<2.5){float ph=aTag477<1.5?0.:3.1416;transformed.z+=sin(uT477*62.+ph+fi)*.0045*iMv477;transformed.y+=max(0.,sin(uT477*62.+ph+fi+1.57))*.002*iMv477;}else if(aTag477>2.5){float w=sin(uT477*7.+fi+position.z*60.)*.004+sin(uT477*13.+fi)*.002;transformed.x+=w*clamp(position.z*30.,0.,1.);}');};
  mat.customProgramCacheKey=()=>'roach477';const m=new T.InstancedMesh(geo,mat,n);m.name='roach477';m.frustumCulled=false;m.castShadow=false;RC477.o.scale.setScalar(0);RC477.o.updateMatrix();m.setMatrixAt(0,RC477.o.matrix);m.count=1;scene.add(m);RC477.mesh=m;RC477.mv=mv;
  for(let k=0;k<nN;k++){const ne={x:0,z:0,y:0,r:null,on:false,id:k};RC477.nests.push(ne);for(let i=0;i<per;i++)RC477.list.push({n:ne,x:0,z:0,yaw:0,st:0,t:Math.random(),v:0,run:0});}
  // the old (too big, too few, far) cockroaches are replaced by these
  try{if(VER476.cm){VER476.cm.visible=false;}VER476.roach.length=0;}catch(e){}}
function inRect477(x,z){try{for(const R of (IN476.all||[]))if(x>R[0]&&x<R[1]&&z>R[2]&&z<R[3])return R;}catch(e){}return null;}
// nest spot: inside a nearby house (along a wall), on your base floor, at trash/bins, or by a wall of your base
function nestSpot477(px,pz,forceIn){const r=Math.random;const out=s=>s;
  const rects=(IN476.all||[]).filter(R=>{const cx=(R[0]+R[1])/2,cz=(R[2]+R[3])/2;return Math.hypot(cx-px,cz-pz)<32&&R[1]-R[0]>2&&R[3]-R[2]>2;});
  const mine=inRect477(px,pz);
  for(let t=0;t<12;t++){const u=r();let s=null;
    if((forceIn&&mine)||(u<.5&&rects.length)){const R=forceIn&&mine?mine:rects[(r()*rects.length)|0];const side=(r()*4)|0,e=.25+r()*.3;let x,z;
      if(side<2){x=R[0]+.6+r()*(R[1]-R[0]-1.2);z=side?R[2]+e:R[3]-e;}else{z=R[2]+.6+r()*(R[3]-R[2]-1.2);x=side===2?R[0]+e:R[1]-e;}s={x,z,y:0,r:R};}
    else if(u<.7){const F=PIECES.filter(p=>p.alive&&PDEF[p.type]&&PDEF[p.type].cell==='f'&&Math.hypot(p.x-px,p.z-pz)<32);if(F.length){const p=F[(r()*F.length)|0];s={x:p.x+(r()-.5)*1.4,z:p.z+(r()-.5)*1.4,y:.245,r:[p.x-.98,p.x+.98,p.z-.98,p.z+.98]};}}
    else if(u<.88){const S=L476.spots.filter(p=>(p.k==='trash'||p.k==='bin'||p.k==='grave')&&Math.hypot(p.x-px,p.z-pz)<35);if(S.length){const p=S[(r()*S.length)|0];s={x:p.x+(r()-.5)*.6,z:p.z+(r()-.5)*.6,y:0,r:null};}}
    else{const W=PIECES.filter(p=>p.alive&&PDEF[p.type]&&PDEF[p.type].edge&&Math.hypot(p.x-px,p.z-pz)<30);if(W.length){const p=W[(r()*W.length)|0],al=p.rot%2===0,sd=r()<.5?-1:1;s={x:p.x+(al?(r()-.5)*1.6:sd*.3),z:p.z+(al?sd*.3:(r()-.5)*1.6),y:onFond477(Math.floor(p.x/2)*2+1,Math.floor(p.z/2)*2+1)?.245:0,r:null};}}
    if(!s)continue;if(Math.hypot(s.x-px,s.z-pz)<2.5)continue;return out(s);}return null;}
function inView477(x,z){const dx=x-camera.position.x,dz=z-camera.position.z,d=Math.hypot(dx,dz)||1;return (dx*-Math.sin(player.yaw)+dz*-Math.cos(player.yaw))/d>.45&&d<20;}
function roachTick477(dt,t,play){const L=RC477.list;if(!L.length)return;RC477.U.value=t%600;const px=player.pos.x,pz=player.pos.z,run=player.moveAmt>1.05;
  RC477.chk-=dt;if(RC477.chk<=0){RC477.chk=1.2;const mine=inRect477(px,pz);let haveIn=false;for(const ne of RC477.nests)if(ne.on&&mine&&ne.r===mine)haveIn=true;
    for(const ne of RC477.nests){const d=Math.hypot(ne.x-px,ne.z-pz);let want=!ne.on||(d>34&&!inView477(ne.x,ne.z));let force=false;if(!want&&mine&&!haveIn&&d>12&&!inView477(ne.x,ne.z)){want=true;force=true;}
      if(!want)continue;const s=nestSpot477(px,pz,force);if(!s)continue;if(force)haveIn=true;Object.assign(ne,{x:s.x,z:s.z,y:s.y,r:s.r,on:true});
      for(const v of L)if(v.n===ne){const a=Math.random()*6.28,dd=Math.random()*.5;v.x=ne.x+Math.cos(a)*dd;v.z=ne.z+Math.sin(a)*dd;v.yaw=Math.random()*6.28;v.st=0;v.run=0;v.v=0;}}}
  const o=RC477.o,m=RC477.mesh;let k=0;
  for(const v of L){const ne=v.n;if(!ne.on)continue;const dx=v.x-px,dz=v.z-pz,d=Math.hypot(dx,dz);if(d>26)continue;
    if(play&&d<(run?2.8:1.9)&&v.run<=0){v.run=.5+Math.random()*.7;v.yaw=Math.atan2(dx,dz)+(Math.random()-.5)*1.5;v.v=1.3+Math.random()*.6;}
    if(v.run>0){v.run-=dt;v.yaw+=(Math.random()-.5)*dt*10;}else{v.t-=dt;if(v.t<=0){const u=Math.random();v.t=u<.5?.3+Math.random()*1.4:.12+Math.random()*.4;v.v=u<.5?0:.15+Math.random()*.45;
        const hd=Math.hypot(ne.x-v.x,ne.z-v.z);v.yaw=hd>.9?Math.atan2(ne.x-v.x,ne.z-v.z)+(Math.random()-.5)*.9:v.yaw+(Math.random()-.5)*2.6;if(Math.random()<.08)v.v=.9;}}
    const sp=v.run>0?v.v:v.v;if(sp>0){let nx=v.x+Math.sin(v.yaw)*sp*dt,nz=v.z+Math.cos(v.yaw)*sp*dt;const R=ne.r;
      if(R){if(nx<R[0]+.12||nx>R[1]-.12){v.yaw=-v.yaw;nx=clamp(nx,R[0]+.12,R[1]-.12);}if(nz<R[2]+.12||nz>R[3]-.12){v.yaw=Math.PI-v.yaw;nz=clamp(nz,R[2]+.12,R[3]-.12);}}
      else if(Math.hypot(nx-ne.x,nz-ne.z)>3){v.yaw=Math.atan2(ne.x-v.x,ne.z-v.z);}v.x=nx;v.z=nz;}
    o.position.set(v.x,ne.y+.001,v.z);o.rotation.set(0,v.yaw,0);o.scale.setScalar(1);o.updateMatrix();m.setMatrixAt(k,o.matrix);RC477.mv.setX(k,sp>0?Math.min(1,sp*1.6):0);k++;}
  m.count=k;if(k){m.instanceMatrix.needsUpdate=true;RC477.mv.needsUpdate=true;}}

// ---------- init + tick (skipped in the arena; cheap: only nearby ones are simulated/drawn) ----------
try{crowInit477();}catch(e){e477c(e,'crowInit');}try{roachInit477();}catch(e){e477c(e,'roachInit');}
{const _t=W476.tick;W476.tick=function(dt,now,play){_t.apply(this,arguments);if(!M477C.on)return;try{if(arenaOn468()){if(CR477.mesh)CR477.mesh.visible=false;if(RC477.mesh)RC477.mesh.visible=false;return;}
    if(CR477.mesh)CR477.mesh.visible=true;if(RC477.mesh)RC477.mesh.visible=true;const inMenu=game.state==='menu';if(!play&&!inMenu)return;const t=now/1000;
    crowTick477(dt,t,play);roachTick477(dt,t,play);}catch(e){e477c(e,'tick');}};}
window.__zs477c={CR477,RC477,tpRoach:()=>{const n=RC477.nests.find(n=>n.on);if(n)player.pos.set(n.x+1.6,0,n.z);return n;}};
