'use strict';
// ======================= v4.3.76 map: cemetery, abandoned park, litter, crows, rats, cockroaches (merged / instanced, scaled by Bassa/Media/Alta) =======================
const L476={q:0,objs:[],perch:[],spots:[],grass:[],glow:[],fogP:[],rnd:null};
function rng476(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
L476.q=lv476();
// ---- merged vertex-coloured geometry builder (one draw per area, shared material) ----
const SH476=(()=>{const mk=g=>{g=g.index?g.toNonIndexed():g;if(g.attributes.uv)g.deleteAttribute('uv');return g;};return {
  box:mk(new T.BoxGeometry(1,1,1)),cyl:mk(new T.CylinderGeometry(.5,.5,1,8)),cyl12:mk(new T.CylinderGeometry(.5,.5,1,14)),trk:mk(new T.CylinderGeometry(.32,.5,1,7)),
  cone:mk(new T.ConeGeometry(.5,1,6)),cone4:mk(new T.ConeGeometry(.5,1,4)),sph:mk(new T.SphereGeometry(.5,10,7)),hemi:mk(new T.SphereGeometry(.5,10,5,0,Math.PI*2,0,Math.PI/2)),
  halfc:mk(new T.CylinderGeometry(.5,.5,1,10,1,false,0,Math.PI)),tor:mk(new T.TorusGeometry(.5,.12,5,12))};})();
function MB476(seed){this.P=[];this.r=rng476(seed);}
MB476.prototype.add=function(sh,col,x,y,z,sx,sy,sz,rx,ry,rz,jit){this.P.push([sh,col,x,y,z,sx,sy,sz,rx||0,ry||0,rz||0,jit==null?.08:jit]);return this;};
MB476.prototype.build=function(){let n=0;for(const p of this.P)n+=SH476[p[0]].attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);
  const M=new T.Matrix4(),N3=new T.Matrix3(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),s=new T.Vector3(),cc=new T.Color();let o=0;
  for(const p of this.P){const g=SH476[p[0]],Pa=g.attributes.position,Na=g.attributes.normal,c=Pa.count;M.compose(v.set(p[2],p[3],p[4]),q.setFromEuler(e.set(p[8],p[9],p[10],'YXZ')),s.set(p[5],p[6],p[7]));N3.getNormalMatrix(M);cc.setHex(p[1]);const sh=1-p[11]+this.r()*p[11]*2;
    for(let i=0;i<c;i++){v.fromBufferAttribute(Pa,i).applyMatrix4(M);const k=(o+i)*3;pos[k]=v.x;pos[k+1]=v.y;pos[k+2]=v.z;const ao=.62+.38*Math.min(1,Math.max(0,v.y)/.7);v.fromBufferAttribute(Na,i).applyMatrix3(N3).normalize();nor[k]=v.x;nor[k+1]=v.y;nor[k+2]=v.z;
      col[k]=cc.r*sh*ao;col[k+1]=cc.g*sh*ao;col[k+2]=cc.b*sh*ao;}o+=c;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));geo.computeBoundingSphere();return geo;};
const MAT476=new T.MeshLambertMaterial({vertexColors:true});
function addMesh476(geo,mat,name){const m=new T.Mesh(geo,mat||MAT476);m.name=name;m.castShadow=false;m.receiveShadow=lv476()===2;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);L476.objs.push(m);return m;}
// area frame: local (u,v) -> world; rot 0 or 90deg
function frame476(cx,cz,rot){const c=Math.cos(rot),s=Math.sin(rot);return {cx,cz,rot,x:(u,v)=>cx+u*c+v*s,z:(u,v)=>cz-u*s+v*c};}
function F476(mb,F,sh,col,u,y,v,sx,sy,sz,rx,ry,rz,jit){mb.add(sh,col,F.x(u,v),y,F.z(u,v),sx,sy,sz,rx,(ry||0)+F.rot,rz,jit);}
function boxC476(F,u,v,w,d){const x=F.x(u,v),z=F.z(u,v),sw=Math.abs(Math.cos(F.rot))>.5;const W=sw?w:d,D=sw?d:w;boxes.push({x0:x-W/2,x1:x+W/2,z0:z-D/2,z1:z+D/2,v476:1});}
function circC476(F,u,v,r){circles.push({x:F.x(u,v),z:F.z(u,v),r:r,v476:1});}

// ---- free lot search: occupancy grid (1 m) + summed-area table ----
function lots476(lv){lv=lv|0;const mP=[7,4,4][lv],mR=[7.5,6.5,6.5][lv],mL=[14,8,0][lv],mB=[1.5,1,1][lv];const H=Math.ceil(HALF),N=H*2+1,occ=new Uint8Array(N*N);const mark=(x0,x1,z0,z1)=>{const a=Math.max(0,Math.floor(x0+H)),b=Math.min(N-1,Math.ceil(x1+H)),c=Math.max(0,Math.floor(z0+H)),d=Math.min(N-1,Math.ceil(z1+H));for(let z=c;z<=d;z++)for(let x=a;x<=b;x++)occ[z*N+x]=1;};
  const C=window.CITY4319;try{if(C&&C.plots)for(const q of C.plots)mark(q.x-q.w/2-mP,q.x+q.w/2+mP,q.z-q.d/2-mP,q.z+q.d/2+mP);}catch(e){}
  try{if(C&&C.roads)for(const r of C.roads){mark(Math.min(r[0],r[2])-mR,Math.max(r[0],r[2])+mR,Math.min(r[1],r[3])-mR,Math.max(r[1],r[3])+mR);}}catch(e){}
  try{if(mL&&C&&C.landmarks)for(const l of C.landmarks)mark(l[1]-mL,l[1]+mL,l[2]-mL,l[2]+mL);}catch(e){}
  for(const b of boxes)mark(b.x0-mB,b.x1+mB,b.z0-mB,b.z1+mB);if(lv<2)for(const c of circles)if(!c.off)mark(c.x-c.r-1,c.x+c.r+1,c.z-c.r-1,c.z+c.r+1);for(const a of (L476.placed||[]))mark(a[0],a[1],a[2],a[3]);
  for(const h of HOUSE_RECTS)mark(h[0]-h[2]-3,h[0]+h[2]+3,h[1]-h[3]-3,h[1]+h[3]+3);
  mark(-40,40,-40,40);mark(-150,-95,45,100);
  try{const s=svLoadData();if(s){for(const p of (s.pc||[]))mark(p[1]-8,p[1]+8,p[2]-8,p[2]+8);if(s.pos)mark(s.pos[0]-10,s.pos[0]+10,s.pos[1]-10,s.pos[1]+10);}}catch(e){}
  const S=new Int32Array((N+1)*(N+1));for(let z=0;z<N;z++){let row=0;for(let x=0;x<N;x++){row+=occ[z*N+x];S[(z+1)*(N+1)+x+1]=S[z*(N+1)+x+1]+row;}}
  return {H,N,occ,S,mark,sum(x0,x1,z0,z1){const a=Math.max(0,Math.floor(x0+H)),b=Math.min(N,Math.ceil(x1+H)),c=Math.max(0,Math.floor(z0+H)),d=Math.min(N,Math.ceil(z1+H));if(a<=0||c<=0||b>=N||d>=N)return 1e9;return S[d*(N+1)+b]-S[c*(N+1)+b]-S[d*(N+1)+a]+S[c*(N+1)+a];}};}
function findLot476(G,w,d,px,pz){const lim=HALF-6,cand=[];for(let x=-lim;x<=lim;x+=3)for(let z=-lim;z<=lim;z+=3)cand.push([x,z,(x-px)*(x-px)+(z-pz)*(z-pz)]);cand.sort((a,b)=>a[2]-b[2]);
  for(const c of cand){for(const rot of [0,Math.PI/2]){const W=rot?d:w,D=rot?w:d;if(Math.abs(c[0])+W/2>lim||Math.abs(c[1])+D/2>lim)continue;if(G.sum(c[0]-W/2,c[0]+W/2,c[1]-D/2,c[1]+D/2)===0)return {x:c[0],z:c[1],rot:rot,W:W,D:D};}}return null;}

// ---- cemetery: iron fence with broken gaps, gate, rows of graves, open graves, mausoleum + crypt, dead trees, candles, ground fog ----
function deadTree476(mb,F,u,v,s,r){const T0=0x2a231e,T1=0x3a3029;F476(mb,F,'trk',T0,u,s*1.6,v,s*.5,s*3.2,s*.5,0,0,(r()-.5)*.12);
  for(let i=0;i<5;i++){const a=r()*6.28,h=s*(1.6+r()*1.5),L=s*(.9+r()*1.1),tilt=.6+r()*.5;const bx=Math.sin(a)*Math.sin(tilt)*L*.5,bz=Math.cos(a)*Math.sin(tilt)*L*.5,by=Math.cos(tilt)*L*.5;
    F476(mb,F,'trk',T1,u+bx,h+by,v+bz,s*.16,L,s*.16,tilt,a,0);
    if(r()<.8){const a2=a+(r()-.5)*1.6,L2=L*.55,t2=tilt+.3;F476(mb,F,'trk',T1,u+bx*2+Math.sin(a2)*Math.sin(t2)*L2*.5,h+by*2+Math.cos(t2)*L2*.5,v+bz*2+Math.cos(a2)*Math.sin(t2)*L2*.5,s*.08,L2,s*.08,t2,a2,0);}}
  circC476(F,u,v,.3*s+.1);L476.perch.push({x:F.x(u,v),y:s*3.1,z:F.z(u,v),k:'tree'});}
function cemetery476(G){const sizes=[[28,34],[24,30],[20,26]];let lot=null,w=0,d=0;for(let lv=0;lv<3&&!lot;lv++){if(lv)G=lots476(lv);for(const s of sizes){lot=findLot476(G,s[0],s[1],25,128);if(lot){w=s[0];d=s[1];L476.lv=lv;break;}}}if(!lot)return null;
  const F=frame476(lot.x,lot.z,lot.rot),r=rng476(47613),mb=new MB476(4761),q=L476.q,W2=w/2,D2=d/2;
  (L476.placed||(L476.placed=[])).push([lot.x-lot.W/2-4,lot.x+lot.W/2+4,lot.z-lot.D/2-4,lot.z+lot.D/2+4]);
  const SOIL=0x2b2a20,GR=0x343a26,STN=[0x76736b,0x6a675f,0x86837a,0x5e5c56,0x8e8a80],IRON=0x18181c,MOSS=0x3c4a2a;
  F476(mb,F,'box',GR,0,.02,0,w,.04,d,0,0,0,.05);
  for(let i=0;i<14;i++)F476(mb,F,'box',r()<.5?SOIL:MOSS,(r()-.5)*(w-3),.042,(r()-.5)*(d-3),1.5+r()*3,.01,1.5+r()*3,0,r()*3,0,.1);
  F476(mb,F,'box',0x5e5a50,0,.05,D2*.25,2.2,.02,d*.75,0,0,0,.06);
  for(let i=0;i<40;i++)F476(mb,F,'box',0x6e6a60,(r()-.5)*2,.065,D2-r()*d*.75,.18+r()*.15,.03,.14+r()*.1,0,r()*3,0,.15);
  // fence: posts, rails, spear bars, gaps (gate front + broken gaps)
  const gaps=[[0,D2,4.2],[-W2,-4,3],[W2,5,3],[W2*.4,-D2,3]];
  const inGap=(u,v)=>gaps.some(g=>(Math.abs(g[1])===D2&&Math.abs(v-g[1])<.1&&Math.abs(u-g[0])<g[2]/2)||(Math.abs(g[0])===W2&&Math.abs(u-g[0])<.1&&Math.abs(v-g[1])<g[2]/2));
  const side=(u0,v0,u1,v1)=>{const L=Math.hypot(u1-u0,v1-v0),n=Math.round(L/.3),du=(u1-u0)/L,dv=(v1-v0)/L,yaw=Math.atan2(du,dv);let run0=-1;
    const seg=(a,b)=>{if(b-a<.2)return;const m=(a+b)/2,u=u0+du*m,v=v0+dv*m;F476(mb,F,'box',IRON,u,.25,v,.05,.05,b-a,0,yaw,0,.05);F476(mb,F,'box',IRON,u,1.5,v,.05,.05,b-a,0,yaw,0,.05);
      const x=F.x(u,v),z=F.z(u,v),hor=Math.abs(du)>.5,L2=b-a,sw=Math.abs(Math.cos(F.rot))>.5,alongX=hor===sw;boxes.push(alongX?{x0:x-L2/2,x1:x+L2/2,z0:z-.15,z1:z+.15,v476:1}:{x0:x-.15,x1:x+.15,z0:z-L2/2,z1:z+L2/2,v476:1});};
    for(let i=0;i<=n;i++){const t=i/n*L,u=u0+du*t,v=v0+dv*t;const gap=inGap(u,v);if(gap){if(run0>=0){seg(run0,t);run0=-1;}continue;}if(run0<0)run0=t;
      if(i%13===0){F476(mb,F,'box',STN[1],u,.95,v,.34,1.9,.34,0,yaw,0);F476(mb,F,'box',STN[2],u,1.94,v,.44,.12,.44,0,yaw,0);F476(mb,F,'sph',STN[2],u,2.08,v,.24,.2,.24);L476.perch.push({x:F.x(u,v),y:2.18,z:F.z(u,v),k:'post'});}
      else{const bend=r()<.06?(r()-.5)*.5:0;F476(mb,F,'box',IRON,u,.85,v,.035,1.7,.035,bend,yaw,bend*.5,.04);F476(mb,F,'cone4',IRON,u,1.78+Math.cos(bend)*.0,v,.07,.16,.07,0,yaw+.78,0,.04);}}
    if(run0>=0)seg(run0,L);};
  side(-W2,D2,W2,D2);side(W2,D2,W2,-D2);side(W2,-D2,-W2,-D2);side(-W2,-D2,-W2,D2);
  // gate pillars + arch + open leaves
  for(const s of [-1,1]){F476(mb,F,'box',STN[0],s*2.35,1.4,D2,.6,2.8,.6);F476(mb,F,'box',STN[2],s*2.35,2.86,D2,.75,.14,.75);F476(mb,F,'sph',STN[2],s*2.35,3.1,D2,.42,.42,.42);boxC476(F,s*2.35,D2,.6,.6);L476.perch.push({x:F.x(s*2.35,D2),y:3.3,z:F.z(s*2.35,D2),k:'gate'});}
  for(let i=0;i<9;i++){const a=i/8*Math.PI,u=Math.cos(a)*2.1,y=2.9+Math.sin(a)*.7;F476(mb,F,'box',IRON,u,y,D2,.42,.06,.06,0,0,a-Math.PI/2);}
  F476(mb,F,'box',IRON,0,3.62,D2,.05,.4,.05);F476(mb,F,'box',IRON,0,3.7,D2,.26,.05,.05);
  for(const s of [-1,1]){const open=s<0?1.15:.35,hu=s*2.05;for(let k=0;k<7;k++){const t=(k+.5)/7*1.9,u=hu-s*Math.cos(open)*t,v=D2+Math.sin(open)*t;F476(mb,F,'box',IRON,u,.9,v,.035,1.6,.035);F476(mb,F,'cone4',IRON,u,1.76,v,.06,.14,.06,0,.78,0);}
    const mu=hu-s*Math.cos(open)*.95,mv=D2+Math.sin(open)*.95;F476(mb,F,'box',IRON,mu,.3,mv,1.9,.05,.05,0,-s*open,0);F476(mb,F,'box',IRON,mu,1.45,mv,1.9,.05,.05,0,-s*open,0);}
  // mausoleum (back centre) + small crypt
  {const mv=-D2+5.2,M=0x8a857a,MD=0x5f5b54,R=0x46423c;F476(mb,F,'box',MD,0,.18,mv,5.6,.36,6.6);F476(mb,F,'box',M,0,1.95,mv-.4,4.4,3.2,5.2);
   for(const s of [-1,1])F476(mb,F,'box',R,s*1.3,4.05,mv-.4,2.9,.18,5.8,0,0,s*-.52);F476(mb,F,'box',M,0,4.45,mv-.4,.3,.25,5.8);
   for(let i=0;i<3;i++)F476(mb,F,'box',M,0,3.65+i*.28,mv+2.25,4.2-i*1.3,.28,.3);
   for(const s of [-1.6,-.55,.55,1.6]){F476(mb,F,'cyl12',0x9a958a,s,1.75,mv+2.55,.32,2.9,.32);F476(mb,F,'box',0x9a958a,s,3.28,mv+2.55,.48,.18,.48);F476(mb,F,'box',0x9a958a,s,.42,mv+2.55,.48,.16,.48);}
   F476(mb,F,'box',M,0,3.42,mv+2.55,4.2,.26,.62);F476(mb,F,'box',0x14120f,0,1.25,mv+2.21,1.5,2.2,.06);for(let k=0;k<6;k++)F476(mb,F,'box',0x2a2620,-.6+k*.24,1.25,mv+2.25,.04,2.1,.04);
   F476(mb,F,'box',0xb8b2a2,0,2.65,mv+2.22,1.6,.32,.04);F476(mb,F,'box',MD,0,.06,mv+3.3,3,.12,.8);F476(mb,F,'box',MD,0,.02,mv+3.8,3.4,.06,.6);
   F476(mb,F,'box',0x9a958a,0,4.95,mv+2.3,.14,.8,.14);F476(mb,F,'box',0x9a958a,0,5.1,mv+2.3,.5,.12,.14);
   for(const s of [-1,1]){F476(mb,F,'box',MD,s*2.6,.55,mv+3.2,.6,.5,.6);F476(mb,F,'sph',0x4a5a3a,s*2.6,.95,mv+3.2,.6,.4,.6);}
   boxC476(F,0,mv-.4,4.6,5.4);boxC476(F,-1.6,mv+2.55,.4,.4);boxC476(F,1.6,mv+2.55,.4,.4);L476.perch.push({x:F.x(0,mv-.4),y:4.6,z:F.z(0,mv-.4),k:'roof'},{x:F.x(0,mv+2.3),y:5.2,z:F.z(0,mv+2.3),k:'cross'});
   L476.glow.push([F.x(-1.1,mv+2.9),.72,F.z(-1.1,mv+2.9),0],[F.x(1.1,mv+2.9),.72,F.z(1.1,mv+2.9),0]);
   for(const s of [-1.1,1.1]){F476(mb,F,'cyl',0xe8dcc0,s,.55,mv+2.9,.08,.2,.08);F476(mb,F,'box',MD,s,.42,mv+2.9,.3,.06,.3);}}
  {const cu=W2-4.2,cv=-D2+4,M=0x7a766c;F476(mb,F,'box',M,cu,1.3,cv,3,2.6,3.4);F476(mb,F,'box',0x5a5650,cu,2.7,cv,3.4,.2,3.8);F476(mb,F,'box',0x4a4640,cu,2.95,cv,2.4,.3,2.8);F476(mb,F,'box',0x16130f,cu,1,cv+1.71,1.1,1.8,.05);
   F476(mb,F,'cyl',0x5a6a4a,cu-1.2,3.2,cv+1.4,.36,.5,.36);F476(mb,F,'cyl',0x5a6a4a,cu+1.2,3.2,cv+1.4,.36,.5,.36);boxC476(F,cu,cv,3.2,3.6);L476.perch.push({x:F.x(cu,cv),y:3.12,z:F.z(cu,cv),k:'roof'});
   for(let i=0;i<5;i++)F476(mb,F,'box',MOSS,cu+(r()-.5)*2.6,2.82,cv+(r()-.5)*3,.5,.06,.4,0,r()*3,0,.2);}
  // graves in rows, facing the path; some open with dirt piles and a shovel
  let open=0;const graves=[];
  for(let row=0;row<6;row++){const v=D2-4.2-row*3.9;if(v<-D2+10.5)break;for(const s of [-1,1])for(let c=0;c<4;c++){const u=s*(2.6+c*2.7)+(r()-.5)*.3;if(Math.abs(u)>W2-1.4)continue;if(s>0&&u>W2-7.2&&v<-D2+7)continue;
    const vv=v+(r()-.5)*.4,t=r(),tilt=(r()-.5)*.22,tz=(r()-.5)*.16,st=STN[(r()*STN.length)|0];graves.push([u,vv]);
    if(t<.38){F476(mb,F,'box',st,u,.42,vv,.72,.84,.15,tilt,0,tz);F476(mb,F,'cyl12',st,u,.84,vv,.72,.15,.72,Math.PI/2+tilt,0,tz);F476(mb,F,'box',0xa8a294,u,.55,vv+.08,.4,.2,.01,tilt,0,tz,.02);L476.perch.push({x:F.x(u,vv),y:1.2,z:F.z(u,vv),k:'stone'});}
    else if(t<.66){F476(mb,F,'box',st,u,.7,vv,.14,1.4,.13,tilt,0,tz);F476(mb,F,'box',st,u,1.05,vv,.66,.14,.13,tilt,0,tz);F476(mb,F,'box',0x4a473f,u,.06,vv,.5,.12,.4);}
    else if(t<.85){F476(mb,F,'box',st,u,.18,vv,.7,.36,.7);F476(mb,F,'cone4',st,u,1.1,vv,.42,1.5,.42,tilt*.5,.78,tz*.5);F476(mb,F,'sph',st,u,1.92,vv,.18,.18,.18);L476.perch.push({x:F.x(u,vv),y:2.05,z:F.z(u,vv),k:'stone'});}
    else{F476(mb,F,'box',st,u,.22,vv+.9,1.05,.44,2.1,0,0,tz*.4);F476(mb,F,'box',STN[4],u,.46,vv+.9,1.15,.06,2.2);F476(mb,F,'box',st,u,.5,vv,.8,.7,.14,tilt);}
    const isOpen=open<2&&t>.3&&t<.66&&r()<.22;
    if(isOpen){open++;F476(mb,F,'box',0x080605,u,.03,vv+1.15,.95,.02,1.9,0,0,0,0);F476(mb,F,'box',0x3a2c1e,u,.05,vv+1.15,1.15,.04,2.1,0,0,0,.05);F476(mb,F,'sph',0x4a3826,u+1.05,.2,vv+1.3,1.1,.55,1.6);F476(mb,F,'box',0x5a3a22,u+.9,.65,vv+.4,.05,1.2,.05,.35,0,.3);F476(mb,F,'box',0x6a6c70,u+1.05,.12,vv+.6,.22,.04,.3,.35,0,.3);
      L476.glow.push([F.x(u,vv+.25),.35,F.z(u,vv+.25),2]);L476.spots.push({x:F.x(u,vv+1.15),z:F.z(u,vv+1.15),k:'grave'});}
    else{F476(mb,F,'box',r()<.5?0x3a3024:0x33301f,u,.08,vv+1.05,.8,.16,1.7,0,0,0,.12);if(r()<.35)for(let k=0;k<3;k++)F476(mb,F,'box',[0x6a1020,0x4a1a5a,0x8a7a20][k],u+(r()-.5)*.4,.2,vv+.3+r()*.3,.05,.12,.05,0,0,(r()-.5)*.6,.2);}
    if(r()<.22){F476(mb,F,'cyl',0xe6dcc4,u+.28,.12,vv+.18,.07,.16,.07);L476.glow.push([F.x(u+.28,vv+.18),.26,F.z(u+.28,vv+.18),0]);}
    boxC476(F,u,vv,t<.85?.75:1.1,t<.85?.35:.4);}}
  // bones and skulls
  for(let i=0;i<7;i++){const u=(r()-.5)*(w-4),v=(r()-.5)*(d-6);F476(mb,F,'sph',0xd8d0b8,u,.1,v,.16,.15,.18,0,r()*6,0,.05);F476(mb,F,'box',0x14100c,u-.035,.11,v+.08,.035,.03,.02);F476(mb,F,'box',0x14100c,u+.035,.11,v+.08,.035,.03,.02);
    for(let k=0;k<2;k++)F476(mb,F,'cyl',0xcfc6a8,u+(r()-.5)*.6,.04,v+(r()-.5)*.6,.04,.32,.04,Math.PI/2,r()*6,0,.05);}
  // dead trees
  for(const p of [[-W2+3,-D2+3.5],[W2-2.5,D2-3],[-W2+2.5,4],[W2-3,-2]])deadTree476(mb,F,p[0],p[1],.9+r()*.4,r);
  const mesh=addMesh476(mb.build(),MAT476,'cemetery476');
  // ground mist layer (soft noise, drifting) + fog puffs
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');const rr=rng476(919);for(let i=0;i<60;i++){const x=rr()*128,y=rr()*128,R=10+rr()*26,gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,'rgba(210,220,230,.35)');gr.addColorStop(1,'rgba(210,220,230,0)');g.fillStyle=gr;for(const ox of [-128,0,128])for(const oy of [-128,0,128]){g.save();g.translate(ox,oy);g.fillRect(x-R,y-R,R*2,R*2);g.restore();}}
  const mt=new T.CanvasTexture(cv);mt.wrapS=mt.wrapT=T.RepeatWrapping;mt.repeat.set(w/12,d/12);
  const mist=new T.Mesh(new T.PlaneGeometry(w+6,d+6).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:mt,transparent:true,depthWrite:false,opacity:.55,color:0xc8d2dc}));mist.position.set(lot.x,.38,lot.z);mist.rotation.y=lot.rot;mist.renderOrder=3;mist.name='cemMist476';scene.add(mist);L476.objs.push(mist);
  const cem={x:lot.x,z:lot.z,r:Math.max(w,d)/2,w:lot.W,d:lot.D,F:F,mist:mist,mt:mt,graves:graves.map(g=>[F.x(g[0],g[1]),F.z(g[0],g[1])])};
  const nP=[0,26,42][q];if(nP){const pos=new Float32Array(nP*3),base=[];for(let i=0;i<nP;i++){const u=(r()-.5)*(w+4),v=(r()-.5)*(d+4);base.push([F.x(u,v),.5+r()*1.1,F.z(u,v),r()*6.28]);pos.set(base[i],i*3);}
    const fg=new T.BufferGeometry();fg.setAttribute('position',new T.BufferAttribute(pos,3));const pt=document.createElement('canvas');pt.width=pt.height=64;const pg=pt.getContext('2d'),gr=pg.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(.6,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(255,255,255,0)');pg.fillStyle=gr;pg.fillRect(0,0,64,64);
    const fp=new T.Points(fg,new T.PointsMaterial({map:new T.CanvasTexture(pt),size:7.5,sizeAttenuation:true,transparent:true,depthWrite:false,opacity:.28,color:0xaebccb}));fp.name='cemFog476';fp.renderOrder=4;scene.add(fp);L476.objs.push(fp);cem.fog=fp;cem.fogBase=base;}
  for(let i=0;i<[30,70,110][q];i++){const u=(r()-.5)*(w-1),v=(r()-.5)*(d-1);L476.grass.push([F.x(u,v),F.z(u,v),.6+r()*.7,r()<.6?0x4a5230:0x5a5a34]);}
  for(let i=0;i<6;i++)L476.spots.push({x:F.x((r()-.5)*(w-4),(r()-.5)*(d-8)),z:F.z((r()-.5)*(w-4),(r()-.5)*(d-8)),k:'cem'});
  cem.mesh=mesh;return cem;}

// ---- abandoned park: rusty swings (one moves on its own), slide, creaking carousel, seesaw, dry fountain, broken benches and lamps, overgrown grass ----
function park476(G){const sizes=[[26,28],[22,24],[18,20]];let lot=null,w=0,d=0;for(let lv=0;lv<3&&!lot;lv++){if(lv)G=lots476(lv);for(const s of sizes){lot=findLot476(G,s[0],s[1],-40,125);if(lot){w=s[0];d=s[1];L476.lv=lv;break;}}}if(!lot)return null;
  const F=frame476(lot.x,lot.z,lot.rot),r=rng476(47677),mb=new MB476(4767),q=L476.q,W2=w/2,D2=d/2,k=w/26;(L476.placed||(L476.placed=[])).push([lot.x-lot.W/2-4,lot.x+lot.W/2+4,lot.z-lot.D/2-4,lot.z+lot.D/2+4]);
  const RUST=0x7a3a1c,RUST2=0x8e4a26,MET=0x7c7c76,WOOD=0x5a4030,STN=0x7a776e,GRS=0x3a4526;
  F476(mb,F,'box',GRS,0,.02,0,w,.04,d,0,0,0,.05);for(let i=0;i<10;i++)F476(mb,F,'box',r()<.5?0x4a4a2c:0x2e3a22,(r()-.5)*(w-3),.043,(r()-.5)*(d-3),2+r()*3,.01,2+r()*3,0,r()*3,0,.1);
  F476(mb,F,'box',0x6a5a40,0,.05,0,1.8,.02,d,0,0,0,.08);F476(mb,F,'box',0x6a5a40,0,.051,0,w,.02,1.8,0,0,0,.08);
  // fountain
  F476(mb,F,'cyl12',STN,0,.25,0,4,.5,4);F476(mb,F,'cyl12',0x2a2a24,0,.505,0,3.4,.02,3.4,0,0,0,.05);F476(mb,F,'cyl12',STN,0,.9,0,.5,1.3,.5);F476(mb,F,'cyl12',STN,0,1.55,0,1.5,.18,1.5);F476(mb,F,'sph',STN,0,1.75,0,.4,.35,.4);
  for(let i=0;i<5;i++)F476(mb,F,'box',0x3a4a2a,(r()-.5)*2.6,.52,(r()-.5)*2.6,.4,.04,.3,0,r()*3,0,.2);circC476(F,0,0,2.1);L476.perch.push({x:F.x(1.95,0),y:.55,z:F.z(1.95,0),k:'rim'},{x:F.x(0,0),y:1.95,z:F.z(0,0),k:'bowl'});
  // swings (static frame, left seat, broken right seat; the middle seat is animated)
  const su=6*k,sv=7*k;for(const e of [-2.3,2.3]){for(const s of [-1,1])F476(mb,F,'cyl',RUST,su+e,1.22,sv+s*.48,.09,2.55,.09,s*.4,0,0);}F476(mb,F,'cyl',RUST2,su,2.42,sv,.1,4.7,.1,0,0,Math.PI/2);
  for(const e of [-2.3,2.3])boxC476(F,su+e,sv,.3,2);L476.perch.push({x:F.x(su-1.5,sv),y:2.52,z:F.z(su-1.5,sv),k:'bar'},{x:F.x(su+1.7,sv),y:2.52,z:F.z(su+1.7,sv),k:'bar'});
  for(const s of [-.18,.18])F476(mb,F,'box',MET,su-1.3+s,1.48,sv,.02,1.85,.02);F476(mb,F,'box',0x3a2a1e,su-1.3,.55,sv,.5,.05,.22);
  F476(mb,F,'box',MET,su+1.3-.18,1.5,sv,.02,1.85,.02);F476(mb,F,'box',0x3a2a1e,su+1.3+.05,.62,sv,.5,.05,.22,0,0,-1.1);
  const sw=new MB476(4768);sw.add('box',MET,-.18,-.93,0,.02,1.85,.02).add('box',MET,.18,-.93,0,.02,1.85,.02).add('box',0x4a2e1c,0,-1.88,0,.52,.05,.24).add('box',MET,0,-1.86,.1,.5,.02,.02);
  const swing=new T.Mesh(sw.build(),MAT476);swing.name='swing476';swing.position.set(F.x(su,sv),2.42,F.z(su,sv));swing.rotation.order='YXZ';swing.rotation.y=F.rot;scene.add(swing);L476.objs.push(swing);
  // slide
  const lu=-6*k,lv=-6*k;for(const s of [-.32,.32]){F476(mb,F,'cyl',MET,lu+s,1,lv-1.4,.06,2.05,.06,-.12,0,0);F476(mb,F,'cyl',MET,lu+s,1,lv,.06,2,.06);}for(let i=0;i<6;i++)F476(mb,F,'cyl',MET,lu,.3+i*.3,lv-1.4+i*.035,.04,.64,.04,0,0,Math.PI/2);
  F476(mb,F,'box',0x9a3a2a,lu,1.95,lv-.7,.9,.07,1.5);for(const s of [-.45,.45])F476(mb,F,'box',MET,lu+s,2.35,lv-.7,.04,.8,1.4);
  F476(mb,F,'box',0x9a3a2a,lu,1.15,lv+1.25,.62,.05,3,.56,0,0);for(const s of [-.31,.31])F476(mb,F,'box',0xb84a32,lu+s,1.25,lv+1.25,.04,.16,3,.56,0,0);F476(mb,F,'box',0x9a3a2a,lu,.14,lv+2.7,.62,.05,.6);
  for(let i=0;i<4;i++)F476(mb,F,'box',RUST,lu+(r()-.5)*.5,1.2,lv+.7+r()*1.4,.15,.01,.2,.56,r()*3,0,.2);boxC476(F,lu,lv-.5,1,2.4);L476.perch.push({x:F.x(lu,lv-.7),y:2.78,z:F.z(lu,lv-.7),k:'slide'});
  // carousel base (static) + animated deck
  const cu=6*k,cvv=-6*k;F476(mb,F,'cyl12',0x2a2a26,cu,.08,cvv,3.9,.16,3.9);circC476(F,cu,cvv,1.95);
  const ca=new MB476(4769);ca.add('cyl12',0x3a5a7a,0,.24,0,3.6,.1,3.6).add('cyl12',0x6a3a24,0,.3,0,3.65,.02,3.65,0,0,0,.2).add('cyl',MET,0,.75,0,.12,1,.12).add('sph',0xa04030,0,1.3,0,.3,.3,.3);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.4,x=Math.sin(a)*1.25,z=Math.cos(a)*1.25;ca.add('cyl',i%2?0xc0a030:0xa04030,x,.75,z,.06,.9,.06).add('box',MET,x*.5,1.18,z*.5,.05,.05,1.25,0,a,0);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ca.add('box',i%2?0xd0c0a0:0x8a2a20,Math.sin(a)*1.05,.3,Math.cos(a)*1.05,.6,.012,.35,0,a,0,.15);}
  const car=new T.Mesh(ca.build(),MAT476);car.name='carousel476';car.position.set(F.x(cu,cvv),0,F.z(cu,cvv));scene.add(car);L476.objs.push(car);L476.perch.push({x:F.x(cu,cvv),y:1.45,z:F.z(cu,cvv),k:'car'});
  // seesaw, sandbox with teddy and ball
  const eu=0,ev=-10.5*k;F476(mb,F,'box',RUST,eu,.3,ev,.25,.6,.3);F476(mb,F,'box',WOOD,eu,.52,ev,.32,.06,3.3,.22,0,0);for(const s of [-1.35,1.35])F476(mb,F,'box',MET,eu,.62+s*-.22*.9,ev+s,.4,.25,.04,.22);boxC476(F,eu,ev,.4,3);
  const xu=-6*k,xv=6*k;for(const s of [-1,1]){F476(mb,F,'box',WOOD,xu+s*1.6,.12,xv,.15,.24,3.3);F476(mb,F,'box',WOOD,xu,.12,xv+s*1.6,3.3,.24,.15);}F476(mb,F,'box',0xb8a070,xu,.09,xv,3.1,.06,3.1,0,0,0,.1);
  F476(mb,F,'sph',0x7a5030,xu+.6,.3,xv-.3,.36,.42,.3,.3,0,.2);F476(mb,F,'sph',0x7a5030,xu+.6,.6,xv-.32,.26,.24,.24,.3,0,.2);for(const s of [-1,1])F476(mb,F,'sph',0x6a4428,xu+.6+s*.1,.72,xv-.33,.08,.08,.05);F476(mb,F,'box',0x101010,xu+.6,.6,xv-.21,.04,.03,.02);
  F476(mb,F,'sph',0xb02828,xu-.8,.17,xv+.7,.3,.3,.3);L476.spots.push({x:F.x(xu,xv),z:F.z(xu,xv),k:'park'});
  // benches (one broken), lamps (standing / bent / fallen)
  const bench=(u,v,yaw,broken)=>{const c=Math.cos(yaw),s=Math.sin(yaw);const P=(du,dv)=>[u+du*c+dv*s,v-du*s+dv*c];let p=P(0,0);
    F476(mb,F,'box',WOOD,p[0],broken?.3:.46,p[1],1.8,.07,.45,broken?0:0,yaw,broken?.28:0);p=P(0,-.22);F476(mb,F,'box',WOOD,p[0],.82,p[1],1.8,.36,.06,broken?.5:0,yaw,0);
    for(const e of [-.75,.75]){p=P(e,0);F476(mb,F,'box',0x2a2a28,p[0],.22,p[1],.06,.44,.42,0,yaw,0);}boxC476(F,u,v,Math.abs(c)*1.8+Math.abs(s)*.5,Math.abs(s)*1.8+Math.abs(c)*.5);p=P(0,-.22);L476.perch.push({x:F.x(p[0],p[1]),y:1.02,z:F.z(p[0],p[1]),k:'bench'});};
  bench(-W2+2,0,Math.PI/2,false);bench(W2-2,1.5,-Math.PI/2,true);bench(-3,D2-2,Math.PI,false);bench(4,-D2+2,0,false);
  const lamp=(u,v,mode)=>{const C=0x26342a;if(mode===2){F476(mb,F,'cyl',C,u+1.8,.1,v,.09,3.8,.09,0,0,Math.PI/2);F476(mb,F,'box',C,u+3.75,.16,v,.32,.3,.32);F476(mb,F,'box',0xd8e0b0,u+3.6,.2,v+.4,.2,.02,.14,0,.4,0);return;}
    const bend=mode===1?.32:0;F476(mb,F,'cyl',C,u,1.9,v,.09,3.8,.09,0,0,bend);const hx=u-Math.sin(bend)*1.9,hy=1.9+Math.cos(bend)*1.9;F476(mb,F,'box',C,hx,hy+.1,v,.34,.26,.34,0,0,bend);F476(mb,F,'box',mode===1?0x2a2a2a:0xe8e0a0,hx,hy-.06,v,.24,.12,.24,0,0,bend);
    circC476(F,u,v,.12);L476.perch.push({x:F.x(hx,v),y:hy+.25,z:F.z(hx,v),k:'lamp'});if(mode===0)L476.glow.push([F.x(hx,v),hy-.1,F.z(hx,v),1]);};
  lamp(-3*k,3*k,0);lamp(9*k,11*k,1);lamp(-10*k,-11*k,2);lamp(10*k,-1*k,0);
  // dead bushes on the edges, a couple of dead trees, tipped bins
  for(let i=0;i<26;i++){const e=r()*4|0,t=(r()-.5)*.9;let u=e<2?(e?W2-.8:-W2+.8):t*w,v=e<2?t*d:(e===2?D2-.8:-D2+.8);if(Math.abs(u)<1.6||Math.abs(v)<1.6)continue;F476(mb,F,'sph',r()<.5?0x4a3a28:0x3a3a22,u,.35,v,1+r()*.8,.7+r()*.5,1+r()*.8,0,r()*3,0,.15);}
  deadTree476(mb,F,-W2+2.5,-D2+2.5,1,r);deadTree476(mb,F,W2-2.5,D2-2.5,1.1,r);
  for(const p of [[-2.6,-2.6],[2.8,4.2]]){F476(mb,F,'cyl',0x3a4a3a,p[0],.25,p[1],.5,.7,.5,1.4,r()*3,0);F476(mb,F,'box',0xd8d2c0,p[0]+.5,.03,p[1]+.3,.25,.01,.3,0,r()*3,0,.1);L476.spots.push({x:F.x(p[0],p[1]),z:F.z(p[0],p[1]),k:'bin'});}
  for(let i=0;i<[60,150,240][q];i++){const u=(r()-.5)*(w-1),v=(r()-.5)*(d-1);if(Math.abs(u)<1.2||Math.abs(v)<1.2)continue;L476.grass.push([F.x(u,v),F.z(u,v),.7+r()*.9,r()<.5?0x4e5a2c:0x6a6a36]);}
  const mesh=addMesh476(mb.build(),MAT476,'park476');
  return {x:lot.x,z:lot.z,r:Math.max(w,d)/2,F:F,swing:swing,car:car,mesh:mesh,carA:0,carV:.25,cre:4};}

// ---- litter: bags, boxes, papers, cans, bottles, tyres (6 instanced draws for the whole map), grass tufts (1 draw), glows (1 draw) ----
const LITM476=new T.MeshLambertMaterial({color:0xffffff});
function inst476(geo,list,name){if(!list.length)return null;const m=new T.InstancedMesh(geo,LITM476,list.length);const o=new T.Object3D(),c=new T.Color();
  list.forEach((it,i)=>{o.position.set(it[0],it[1],it[2]);o.rotation.set(it[3],it[4],it[5],'YXZ');o.scale.set(it[6],it[7],it[8]);o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,c.setHex(it[9]));});
  m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere&&m.computeBoundingSphere();m.castShadow=false;m.receiveShadow=false;m.name=name;scene.add(m);L476.objs.push(m);return m;}
function freePt476(x,z,r){if(Math.abs(x)>HALF-3||Math.abs(z)>HALF-3)return false;for(const b of boxes)if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r)return false;const C=window.CITY4319;if(C&&C.plots)for(const q of C.plots)if(Math.abs(x-q.x)<q.w/2+.1&&Math.abs(z-q.z)<q.d/2+.1)return false;return true;}
function litter476(){const r=rng476(47699),q=L476.q,C=window.CITY4319,B=(C&&C.plots)||[];const bag=[],box=[],pap=[],can=[],bot=[],tyr=[];
  const BAGC=[0x141416,0x1e2a1a,0x2a3038,0x3a2a22],BOXC=[0x8a6a44,0x7a5a3a,0x9a7a50],PAPC=[0xd8d4c8,0xbab6aa,0xe6e0cc,0x9a968a],CANC=[0xa02020,0xa8acb0,0x2050a0,0x20803a],BOTC=[0x2a5a2a,0x5a3a1a,0x3a6a5a];
  const pile=(x,z,sz)=>{if(!freePt476(x,z,.35))return false;const nb=1+(r()*3|0)*sz;for(let i=0;i<nb;i++){const s=.45+r()*.25;bag.push([x+(r()-.5)*.8,s*.38,z+(r()-.5)*.8,(r()-.5)*.4,r()*6,(r()-.5)*.4,s*1.1,s*.85,s,BAGC[r()*4|0]]);}
    if(r()<.55){const s=.3+r()*.3,flat=r()<.35;box.push([x+(r()-.5),flat?.02:s/2,z+(r()-.5),0,r()*6,0,s*1.3,flat?.03:s,s,BOXC[r()*3|0]]);}
    for(let i=0;i<2+(r()*4|0);i++)pap.push([x+(r()-.5)*1.8,.012,z+(r()-.5)*1.8,(r()-.5)*.2,r()*6,(r()-.5)*.2,.18+r()*.2,1,.22+r()*.2,PAPC[r()*4|0]]);
    for(let i=0;i<(r()*3|0);i++)can.push([x+(r()-.5)*1.6,.035,z+(r()-.5)*1.6,Math.PI/2,r()*6,0,1,1,1,CANC[r()*4|0]]);
    if(r()<.4)bot.push([x+(r()-.5)*1.4,.04,z+(r()-.5)*1.4,Math.PI/2,r()*6,0,1,1,1,BOTC[r()*3|0]]);
    L476.spots.push({x:x,z:z,k:'trash'});return true;};
  let n=[28,60,95][q];for(let t=0;t<n*4&&n>0;t++){if(!B.length)break;const b=B[r()*B.length|0],f=r()*4|0,a=(r()-.5);let x,z;
    if(f<2){x=b.x+a*(b.w-1.5);if(Math.abs(x-b.x)<2.8)continue;z=b.z+(f?1:-1)*(b.d/2+.6+r()*.4);}else{z=b.z+a*(b.d-1.5);x=b.x+(f===2?1:-1)*(b.w/2+.6+r()*.4);}
    if(pile(x,z,1))n--;}
  for(const s of L476.spots.filter(s=>s.k==='bin'||s.k==='park'))pile(s.x+1.2,s.z+.8,0);
  const roads=(C&&C.roads)||[];let m=[60,140,220][q];for(let t=0;t<m*3&&m>0&&roads.length;t++){const rd=roads[r()*roads.length|0],k=r(),x0=rd[0]+(rd[2]-rd[0])*k,z0=rd[1]+(rd[3]-rd[1])*k,hor=Math.abs(rd[3]-rd[1])<.1,off=(r()<.5?-1:1)*(3+r()*3.2);
    const x=hor?x0:x0+off,z=hor?z0+off:z0;if(!freePt476(x,z,.15))continue;m--;const u=r();
    if(u<.55)pap.push([x,.012,z,(r()-.5)*.2,r()*6,(r()-.5)*.2,.18+r()*.22,1,.22+r()*.2,PAPC[r()*4|0]]);else if(u<.8)can.push([x,.035,z,Math.PI/2,r()*6,0,1,1,1,CANC[r()*4|0]]);else if(u<.93)bot.push([x,.04,z,Math.PI/2,r()*6,0,1,1,1,BOTC[r()*3|0]]);
    else{const nT=1+(r()*3|0);for(let i=0;i<nT;i++)tyr.push([x+(r()-.5)*.3,.11+i*.2,z+(r()-.5)*.3,Math.PI/2+(r()-.5)*.2,0,r()*6,1,1,1,0x161618]);}}
  const bg=new T.SphereGeometry(.5,8,6);{const p=bg.attributes.position,rr=rng476(5);for(let i=0;i<p.count;i++){const y=p.getY(i),k=1+(rr()-.5)*.18;p.setXYZ(i,p.getX(i)*k,y<0?y*.55:y*k,p.getZ(i)*k);}bg.computeVertexNormals();}
  inst476(bg,bag,'bags476');inst476(new T.BoxGeometry(1,1,1),box,'boxes476');inst476(new T.BoxGeometry(1,.02,1),pap,'papers476');inst476(new T.CylinderGeometry(.033,.033,.12,7),can,'cans476');inst476(new T.CylinderGeometry(.035,.04,.26,7),bot,'bottles476');inst476(new T.TorusGeometry(.3,.11,5,10),tyr,'tyres476');}
function grass476(){const G=L476.grass;if(!G.length)return;const mb=new MB476(31);for(let i=0;i<5;i++){const a=i*1.26;mb.add('cone',0xffffff,Math.sin(a)*.05,.22,Math.cos(a)*.05,.05,.45,.05,Math.cos(a)*.35,0,-Math.sin(a)*.35,.25);}mb.add('cone',0xffffff,0,.28,0,.05,.56,.05,0,0,0,.2);
  const geo=mb.build();inst476(geo,G.map(g=>[g[0],0,g[1],0,(g[0]*7.13+g[1]*3.1)%6.28,0,g[2],g[2]*(.8+((g[0]*13.7)%1+1)%1*.6),g[2],g[3]]),'grass476');}
function glows476(){const L=L476.glow,r=rng476(77);const C=W476.cem;const wisp=C&&L476.q?3:0;const n=L.length+wisp;if(!n)return;const pos=new Float32Array(n*3),col=new Float32Array(n*3);
  for(let i=0;i<L.length;i++){pos.set([L[i][0],L[i][1],L[i][2]],i*3);}for(let i=0;i<wisp;i++){const g=C.graves[(r()*C.graves.length)|0]||[C.x,C.z];pos.set([g[0],1,g[1]],(L.length+i)*3);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('color',new T.BufferAttribute(col,3));
  const p=new T.Points(geo,new T.PointsMaterial({map:glowTex,size:1.1,sizeAttenuation:true,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));p.name='glow476';p.frustumCulled=false;scene.add(p);L476.objs.push(p);
  L476.gl={p:p,n:L.length,wisp:wisp,ph:Array.from({length:n},()=>r()*6.28),wp:Array.from({length:wisp},()=>({a:r()*6.28,r:2+r()*5}))};}
function glowTick476(t){const G=L476.gl;if(!G)return;const c=G.p.geometry.attributes.color,p=G.p.geometry.attributes.position,L=L476.glow,nf=Math.max(.25,nightF());
  for(let i=0;i<G.n;i++){const ty=L[i][3];let k;if(ty===1){const f=Math.sin(t*23+G.ph[i])+Math.sin(t*7.3+G.ph[i]*2);k=f>1.1?.15:(.75+.25*Math.sin(t*40));c.setXYZ(i,.75*k*nf,.85*k*nf,.7*k*nf);}
    else if(ty===2){k=.55+.25*Math.sin(t*1.7+G.ph[i]);c.setXYZ(i,.25*k*nf,.9*k*nf,.45*k*nf);}else{k=.7+.2*Math.sin(t*11+G.ph[i])+.1*Math.sin(t*17.3+G.ph[i]);c.setXYZ(i,1*k*nf,.62*k*nf,.22*k*nf);}}
  const C=W476.cem;for(let j=0;j<G.wisp&&C;j++){const w=G.wp[j];w.a+=.0035+j*.001;const i=G.n+j,x=C.x+Math.cos(w.a*(1+j*.2))*w.r,z=C.z+Math.sin(w.a*1.3)*w.r*.8,y=.9+Math.sin(t*1.3+j)*.35;p.setXYZ(i,x,y,z);const k=(.5+.5*Math.sin(t*.9+j*2))*nf;c.setXYZ(i,.3*k,1*k,.55*k);}
  c.needsUpdate=true;if(G.wisp)p.needsUpdate=true;}

// ---- crows: flocks that take off when you get close or shoot, fly away, circle and land elsewhere; wings flap in the vertex shader (1 draw) ----
const CROW476={list:[],mesh:null,fl:null,U:{value:0},o:new T.Object3D(),dirty:true,cawT:0};
function crowGeo476(){const mb=new MB476(13),K=0x101014,K2=0x1a1c26;mb.add('sph',K,0,0,0,.2,.18,.42,0,0,0,.05).add('sph',K2,0,.06,.23,.14,.13,.15,0,0,0,.05).add('cone',0x2a2a2a,0,.05,.33,.045,.12,.045,Math.PI/2,0,0,0).add('box',K,0,.02,-.28,.12,.02,.2,-.2,0,0,.05)
  .add('box',0x3a3020,-.04,-.12,.02,.012,.1,.012).add('box',0x3a3020,.04,-.12,.02,.012,.1,.012).add('box',0x8a1010,.04,.085,.29,.02,.02,.01,0,0,0,0).add('box',0x8a1010,-.04,.085,.29,.02,.02,.01,0,0,0,0);
  const body=mb.build(),nb=body.attributes.position.count;const w=new MB476(14);w.add('box',K,.21,.03,0,.36,.014,.2,0,0,0,.05).add('box',K2,.42,.03,-.03,.12,.012,.14,0,.25,0,.05).add('box',K,-.21,.03,0,.36,.014,.2,0,0,0,.05).add('box',K2,-.42,.03,-.03,.12,.012,.14,0,-.25,0,.05);
  const wing=w.build(),nw=wing.attributes.position.count,n=nb+nw;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),wa=new Float32Array(n);
  pos.set(body.attributes.position.array,0);pos.set(wing.attributes.position.array,nb*3);nor.set(body.attributes.normal.array,0);nor.set(wing.attributes.normal.array,nb*3);col.set(body.attributes.color.array,0);col.set(wing.attributes.color.array,nb*3);
  for(let i=nb;i<n;i++)wa[i]=pos[i*3]>0?1:-1;for(let i=0;i<n*3;i++)col[i]=Math.max(col[i],.012);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('aWing476',new T.BufferAttribute(wa,1));return g;}
function crows476(){const q=L476.q,r=rng476(4711),flocks=[3,5,7][q],per=[4,5,6][q],circ=[2,4,5][q];const P=L476.perch,S=L476.spots,list=[];
  const groundSpot=()=>{for(let t=0;t<30;t++){const x=(r()-.5)*2*(HALF-12),z=(r()-.5)*2*(HALF-12);if(freePt476(x,z,.5))return {x,y:0,z};}return {x:0,y:0,z:0};};
  const cem=P.filter(p=>p.k==='stone'||p.k==='post'||p.k==='gate'||p.k==='tree'||p.k==='roof'||p.k==='cross'),park=P.filter(p=>p.k==='bar'||p.k==='lamp'||p.k==='bench'||p.k==='slide'||p.k==='rim');
  for(let f=0;f<flocks;f++){let base;const src=f<2&&cem.length?'cem':f===2&&park.length?'park':'ground';if(src==='cem')base=cem[(r()*cem.length)|0];else if(src==='park')base=park[(r()*park.length)|0];else{const sp=S.length&&r()<.5?S[(r()*S.length)|0]:null;base=sp?{x:sp.x+1.5,y:0,z:sp.z+1.5}:groundSpot();}
    for(let i=0;i<per;i++){const onPerch=i===0||r()<.3,sp=onPerch?{x:base.x,y:base.y,z:base.z}:{x:base.x+(r()-.5)*4,y:0,z:base.z+(r()-.5)*4};if(!onPerch&&!freePt476(sp.x,sp.z,.2)){sp.x=base.x;sp.z=base.z;sp.y=base.y;}
      if(onPerch&&i>0){sp.x+=(r()-.5)*.6;sp.z+=(r()-.5)*.6;}list.push({x:sp.x,y:sp.y,z:sp.z,yaw:r()*6.28,pitch:0,st:0,fl:0,ph:r()*6.28,fq:15+r()*5,vx:0,vy:0,vz:0,t:r()*4,tw:0,flock:f,home:sp,s:.85+r()*.3,peck:0,del:0});}}
  const C=W476.cem;const cx=C?C.x:0,cz=C?C.z:0;for(let i=0;i<circ;i++)list.push({x:cx,y:15+r()*5,z:cz,yaw:0,pitch:0,st:3,fl:.6,ph:r()*6.28,fq:13+r()*4,vx:0,vy:0,vz:0,t:0,a:r()*6.28,rad:7+r()*7,h:14+r()*6,sp:.25+r()*.15,flock:-1,s:1,cx:cx,cz:cz,glide:0});
  const geo=crowGeo476(),n=list.length;const fl=new T.InstancedBufferAttribute(new Float32Array(n*2),2);geo.setAttribute('iFl476',fl);
  const mat=new T.MeshLambertMaterial({vertexColors:true});mat.onBeforeCompile=sh=>{sh.uniforms.uT476=CROW476.U;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aWing476;attribute vec2 iFl476;uniform float uT476;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nif(aWing476!=0.){float fly=iFl476.x;float a=(sin(uT476*iFl476.y)*.95+.15)*fly-(1.-fly)*.12;float sx=aWing476*.06;vec3 p=transformed;p.x-=sx;p.x*=mix(.32,1.,fly);float c=cos(a),s=sin(a)*aWing476;transformed.x=sx+p.x*c-p.y*s;transformed.y=p.x*s+p.y*c-(1.-fly)*.01;transformed.z=p.z-(1.-fly)*.04;}');};
  mat.customProgramCacheKey=()=>'crow476';const m=new T.InstancedMesh(geo,mat,n);m.name='crows476';m.castShadow=false;m.frustumCulled=false;scene.add(m);L476.objs.push(m);CROW476.list=list;CROW476.mesh=m;CROW476.fl=fl;
  for(let i=0;i<n;i++)crowWrite476(i);m.instanceMatrix.needsUpdate=true;fl.needsUpdate=true;}
function crowWrite476(i){const c=CROW476.list[i],o=CROW476.o;o.position.set(c.x,c.y+(c.st===0?.13*c.s:0),c.z);o.rotation.set(c.pitch+(c.peck>0?Math.sin(c.peck*Math.PI)*.6:0),c.yaw,c.bank||0,'YXZ');o.scale.setScalar(c.s*.8);o.updateMatrix();CROW476.mesh.setMatrixAt(i,o.matrix);CROW476.fl.setXY(i,c.fl,c.st===0?0:c.fq*(c.glide>0?.25:1));}
function pickPerch476(c,px,pz){const P=L476.perch,r=Math.random;for(let t=0;t<12;t++){let p;if(P.length&&r()<.55)p=P[(r()*P.length)|0];else{const a=r()*6.28,d=30+r()*40;const x=c.x+Math.cos(a)*d,z=c.z+Math.sin(a)*d;if(!freePt476(x,z,.3))continue;p={x,y:0,z};}
  if(Math.hypot(p.x-px,p.z-pz)<26)continue;if(Math.abs(p.x)>HALF-5||Math.abs(p.z)>HALF-5)continue;return {x:p.x+(r()-.5)*.5,y:p.y,z:p.z+(r()-.5)*.5};}return null;}
function crowTick476(dt,t,play){const L=CROW476.list;if(!L.length)return;CROW476.U.value=t%600;const px=player.pos.x,pz=player.pos.z;let ch=false,cawN=0,cawX=0,cawZ=0;
  const shot=play&&firing&&(()=>{try{const w=WEAPONS[curW];return w&&!w.melee;}catch(e){return false;}})();
  for(let i=0;i<L.length;i++){const c=L[i];const dx=c.x-px,dz=c.z-pz,d2=dx*dx+dz*dz;
    if(c.st===0){if(d2>90*90)continue;const run=player.moveAmt>1.05;const trig=play&&(d2<(run?11*11:7.5*7.5)||(shot&&d2<24*24));
      if(trig){for(const o of L)if(o.flock===c.flock&&o.st===0){o.st=1;o.del=Math.random()*.35;o.t=0;}cawN++;cawX=c.x;cawZ=c.z;}
      else{c.t-=dt;if(c.peck>0){c.peck-=dt*3;if(c.peck<0)c.peck=0;ch=true;}if(c.t<=0&&d2<60*60){c.t=1.5+Math.random()*4;const u=Math.random();if(u<.45){c.peck=1;}else if(u<.8){c.yaw+=(Math.random()-.5)*2;}else if(c.y<.05){const a=c.yaw;const nx=c.x+Math.sin(a)*.25,nz=c.z+Math.cos(a)*.25;if(freePt476(nx,nz,.1)){c.x=nx;c.z=nz;}c.hop=.25;}ch=true;}
        if(c.hop>0){c.hop-=dt;ch=true;}}
      if(c.st===0){if(ch)crowWrite476(i);continue;}}
    if(c.st===1){if(c.del>0){c.del-=dt;continue;}if(c.t===0){const a=Math.atan2(dx,dz)+(Math.random()-.5)*1.2,sp=4.5+Math.random()*2;c.vx=Math.sin(a)*sp;c.vz=Math.cos(a)*sp;c.vy=3.2+Math.random()*1.4;c.fl=1;c.home=null;}
      c.t+=dt;c.vy=Math.max(.2,c.vy-dt*.9);const hs=Math.hypot(c.vx,c.vz);if(hs<9){c.vx*=1+dt*.5;c.vz*=1+dt*.5;}c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.yaw=Math.atan2(c.vx,c.vz);c.pitch=-Math.min(.5,c.vy*.1);c.bank=Math.sin(t*1.3+c.ph)*.15;
      c.glide=c.y>8&&Math.sin(t*.8+c.ph)>.4?1:0;if(c.t>5+Math.random()*3||c.y>20||Math.abs(c.x)>HALF-4||Math.abs(c.z)>HALF-4){const p=pickPerch476(c,px,pz);if(p){c.tgt=p;c.st=2;}else{const C=W476.cem;c.st=3;c.cx=C?C.x:c.x;c.cz=C?C.z:c.z;c.a=Math.atan2(c.z-c.cz,c.x-c.cx);c.rad=8+Math.random()*6;c.h=14+Math.random()*5;c.sp=.3;c.flock=-1;}}
      crowWrite476(i);ch=true;continue;}
    if(c.st===2){const g=c.tgt,ex=g.x-c.x,ez=g.z-c.z,eh=Math.hypot(ex,ez),ey=g.y-c.y;const sp=Math.min(8,1.2+eh*.6);c.vx+=(ex/(eh||1)*sp-c.vx)*Math.min(1,dt*1.6);c.vz+=(ez/(eh||1)*sp-c.vz)*Math.min(1,dt*1.6);c.vy=clamp(ey*(eh<6?1.6:.35),-4,2);
      c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.yaw=Math.atan2(c.vx,c.vz);c.pitch=clamp(-c.vy*.08,-.3,.4);c.bank=0;c.glide=eh>10&&c.vy<-.5?1:0;c.fl=eh<3?.85:1;
      if(eh<.35&&Math.abs(ey)<.25){c.x=g.x;c.y=g.y;c.z=g.z;c.st=0;c.fl=0;c.pitch=0;c.t=1+Math.random()*3;c.glide=0;c.home=g;}
      else if(play&&g&&Math.hypot(g.x-px,g.z-pz)<8){const p=pickPerch476(c,px,pz);if(p)c.tgt=p;}crowWrite476(i);ch=true;continue;}
    if(c.st===3){c.a+=c.sp*dt;const x=c.cx+Math.cos(c.a)*c.rad,z=c.cz+Math.sin(c.a)*c.rad,y=c.h+Math.sin(t*.4+c.ph)*1.2;c.yaw=Math.atan2(x-c.x,z-c.z);c.x=x;c.z=z;c.y+=(y-c.y)*Math.min(1,dt*2);c.bank=-.35;c.pitch=0;c.glide=Math.sin(t*.7+c.ph)>-.2?1:0;c.fl=1;
      if(c.flock===-1&&c.tw!==undefined){c.tw+=dt;if(c.tw>40+Math.random()*60&&Math.random()<.01&&L476.q){const p=pickPerch476(c,px,pz);if(p){c.tgt=p;c.st=2;c.flock=900+i;c.tw=0;}}}crowWrite476(i);ch=true;}}
  if(ch){CROW476.mesh.instanceMatrix.needsUpdate=true;CROW476.fl.needsUpdate=true;}
  if(cawN&&play){caw476(cawX,cawZ,2+(Math.random()*2|0));try{flap476(cawX,cawZ);}catch(e){}}
  CROW476.cawT-=dt;if(CROW476.cawT<=0){CROW476.cawT=9+Math.random()*16;if(play){const c=L[(Math.random()*L.length)|0];if(c&&Math.hypot(c.x-px,c.z-pz)<70)caw476(c.x,c.z,1+(Math.random()*2|0));}}}
function sp476(x,z){const dx=x-camera.position.x,dz=z-camera.position.z,d=Math.hypot(dx,dz),rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);return {d:d,pan:clamp((dx*rx+dz*rz)/(d+.1),-1,1)};}
function caw476(x,z,n){const c=AU.ctx;if(!c||SET.mute||!AU.master||(AU.v433|0)>=15)return;const P=sp476(x,z),fall=1/(1+Math.pow(P.d/14,1.3)),v=.09*fall;if(v<.004)return;const dest=out(P.pan);let t=c.currentTime+.02;
  for(let i=0;i<n;i++){const d=.16+Math.random()*.1,f=rand(640,820);const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*1.15,t);o.frequency.exponentialRampToValueAtTime(f*.62,t+d);
    const b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=rand(1200,1500);b.Q.value=3.5;const b2=c.createBiquadFilter();b2.type='bandpass';b2.frequency.value=rand(2400,2900);b2.Q.value=5;const g=c.createGain(),m=c.createGain();
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(b).connect(m);o.connect(b2).connect(m);m.connect(g).connect(dest);if(AU.revIn)g.connect(AU.revIn);
    AU.v433=(AU.v433|0)+1;o.onended=()=>{AU.v433--;try{m.disconnect();g.disconnect();}catch(e){}};o.start(t);o.stop(t+d+.02);try{nz(t,d*.8,v*.35,'bandpass',1800,900,2,dest);}catch(e){}t+=d+rand(.08,.2);}}
function flap476(x,z){const c=AU.ctx;if(!c||SET.mute)return;const P=sp476(x,z),v=.06/(1+P.d/10);const dest=out(P.pan);let t=c.currentTime+.01;for(let i=0;i<7;i++){try{nz(t,.07,v*(1-i*.1),'bandpass',rand(500,800),300,1.2,dest);}catch(e){}t+=.075+Math.random()*.02;}}
function squeak476(x,z){const c=AU.ctx;if(!c||SET.mute||(AU.v433|0)>=15)return;const P=sp476(x,z),v=.05/(1+Math.pow(P.d/5,1.4));if(v<.004)return;const dest=out(P.pan);let t=c.currentTime+.01;for(let i=0;i<2+(Math.random()*2|0);i++){try{osc(t,.06,v,'square',rand(2600,3400),rand(1800,2400),dest);}catch(e){}t+=.08+Math.random()*.05;}}
function creak476(x,z,v0){const c=AU.ctx;if(!c||SET.mute||(AU.v433|0)>=15)return;const P=sp476(x,z),v=(v0||.05)/(1+Math.pow(P.d/8,1.3));if(v<.004)return;const dest=out(P.pan);const t=c.currentTime+.02,d=rand(.5,.9);
  const o=c.createOscillator();o.type='sawtooth';const f=rand(150,230);o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*rand(1.25,1.6),t+d*.6);o.frequency.linearRampToValueAtTime(f*1.1,t+d);
  const am=c.createOscillator();am.type='square';am.frequency.value=rand(28,46);const ag=c.createGain();ag.gain.value=.5;const g=c.createGain();g.gain.value=0;am.connect(ag).connect(g.gain);
  const b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=rand(900,1400);b.Q.value=6;const env=c.createGain();env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(v,t+.08);env.gain.setValueAtTime(v,t+d*.8);env.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(b).connect(g).connect(env).connect(dest);if(AU.revIn)env.connect(AU.revIn);AU.v433=(AU.v433|0)+1;o.onended=()=>{AU.v433--;try{g.disconnect();env.disconnect();}catch(e){}};o.start(t);am.start(t);o.stop(t+d+.02);am.stop(t+d+.02);}

// ---- rats and cockroaches: scurry away from you, come back when you leave (only the ones near you are simulated) ----
const VER476={rats:[],roach:[],rm:null,cm:null,o:new T.Object3D()};
function vermin476(){const q=L476.q,r=rng476(4733),S=L476.spots;const nR=[6,12,18][q],nG=[5,9,12][q],per=[6,8,10][q];
  const pick=k=>{const L=S.filter(s=>!k||s.k===k);return L.length?L[(r()*L.length)|0]:null;};
  for(let i=0;i<nR;i++){const s=pick(i%3===0?'grave':'trash')||pick();if(!s)break;let x=s.x+(r()-.5)*2,z=s.z+(r()-.5)*2;if(!freePt476(x,z,.08)){x=s.x;z=s.z;}VER476.rats.push({x,z,hx:x,hz:z,yaw:r()*6.28,st:0,t:r()*3,v:0,s:.9+r()*.35,bob:r()*6});}
  for(let g=0;g<nG;g++){const s=pick(g%2?'trash':null)||pick();if(!s)break;for(let i=0;i<per;i++){const a=r()*6.28,d=r()*.7;VER476.roach.push({cx:s.x,cz:s.z,x:s.x+Math.cos(a)*d,z:s.z+Math.sin(a)*d,yaw:r()*6.28,t:r(),v:0,run:0});}}
  const rb=new MB476(91),G=0x4a3e36,P=0xb08080;rb.add('sph',G,0,.06,0,.13,.11,.28,0,0,0,.08).add('sph',G,0,.07,.15,.09,.08,.12,.15,0,0,.06).add('cone',G,0,.065,.23,.05,.08,.05,Math.PI/2,0,0,.05).add('sph',0xd09090,0,.06,.27,.02,.02,.02)
    .add('sph',0x8a6060,-.035,.115,.15,.04,.045,.015).add('sph',0x8a6060,.035,.115,.15,.04,.045,.015).add('box',P,0,.04,-.25,.016,.014,.26,.1,0,0,.04).add('box',P,0,.025,-.42,.012,.012,.14,.2,.25,0,.04)
    .add('box',0x050505,-.03,.085,.2,.012,.012,.006).add('box',0x050505,.03,.085,.2,.012,.012,.006);
  for(const s of [-1,1])for(const zz of [-.07,.1])rb.add('box',0x3a302a,s*.05,.02,zz,.025,.04,.04);
  if(VER476.rats.length){const m=new T.InstancedMesh(rb.build(),MAT476,VER476.rats.length);m.name='rats476';m.frustumCulled=false;m.castShadow=false;scene.add(m);L476.objs.push(m);VER476.rm=m;VER476.rats.forEach((v,i)=>ratW476(i));m.instanceMatrix.needsUpdate=true;}
  const cb=new MB476(92),B=0x3a1e10;cb.add('sph',B,0,.012,0,.03,.016,.05,0,0,0,.1).add('sph',0x2a1408,0,.012,.03,.022,.014,.018).add('box',0x2a1408,-.008,.012,.055,.002,.002,.04,0,-.4,0,0).add('box',0x2a1408,.008,.012,.055,.002,.002,.04,0,.4,0,0);
  for(const s of [-1,1])for(const zz of [-.012,0,.012])cb.add('box',0x2a1408,s*.02,.006,zz,.022,.003,.003,0,0,s*.3,0);
  if(VER476.roach.length){const m=new T.InstancedMesh(cb.build(),MAT476,VER476.roach.length);m.name='roach476';m.frustumCulled=false;m.castShadow=false;scene.add(m);L476.objs.push(m);VER476.cm=m;VER476.roach.forEach((v,i)=>roachW476(i));m.instanceMatrix.needsUpdate=true;}}
function ratW476(i){const v=VER476.rats[i],o=VER476.o;o.position.set(v.x,v.st===1?Math.abs(Math.sin(v.bob))*.03:0,v.z);o.rotation.set(0,v.yaw+(v.st===0?Math.sin(v.bob*.7)*.15:0),v.st===1?Math.sin(v.bob)*.08:0);o.scale.setScalar(v.s);o.updateMatrix();VER476.rm.setMatrixAt(i,o.matrix);}
function roachW476(i){const v=VER476.roach[i],o=VER476.o;o.position.set(v.x,.004,v.z);o.rotation.set(0,v.yaw,0);o.scale.setScalar(1.35);o.updateMatrix();VER476.cm.setMatrixAt(i,o.matrix);}
const _vp476={x:0,z:0};
function verminTick476(dt,t,play){const px=player.pos.x,pz=player.pos.z;let ch=false,sq=null;
  for(let i=0;i<VER476.rats.length;i++){const v=VER476.rats[i],dx=v.x-px,dz=v.z-pz,d=Math.hypot(dx,dz);if(d>45&&v.st===0)continue;
    if(play&&d<5.2&&v.st!==1){v.st=1;v.t=1+Math.random()*1.2;const a=Math.atan2(dx,dz)+(Math.random()-.5)*1.3;v.yaw=a;v.v=4+Math.random()*1.5;if(!sq)sq=v;}
    if(v.st===1){v.t-=dt;v.bob+=dt*28;v.yaw+=(Math.random()-.5)*dt*4;const nx=v.x+Math.sin(v.yaw)*v.v*dt,nz=v.z+Math.cos(v.yaw)*v.v*dt;_vp476.x=nx;_vp476.z=nz;try{collide(_vp476,.12);}catch(e){}if(Math.abs(_vp476.x-nx)+Math.abs(_vp476.z-nz)>.001)v.yaw+=1.6;v.x=_vp476.x;v.z=_vp476.z;if(v.t<=0){v.st=0;v.t=2+Math.random()*4;}ch=true;}
    else{v.t-=dt;v.bob+=dt*3;if(v.t<=0){v.t=2+Math.random()*5;const hd=Math.hypot(v.hx-v.x,v.hz-v.z);if(d>14&&hd>1.5){v.st=2;v.yaw=Math.atan2(v.hx-v.x,v.hz-v.z);}else{v.yaw+=(Math.random()-.5)*2.5;}}
      if(v.st===2){const hd=Math.hypot(v.hx-v.x,v.hz-v.z);if(hd<.4||d<8){v.st=0;}else{v.bob+=dt*20;v.x+=Math.sin(v.yaw)*1.4*dt;v.z+=Math.cos(v.yaw)*1.4*dt;}}ch=ch||d<30;}
    ratW476(i);}
  if(ch&&VER476.rm)VER476.rm.instanceMatrix.needsUpdate=true;if(sq&&play)squeak476(sq.x,sq.z);
  let cc=false;for(let i=0;i<VER476.roach.length;i++){const v=VER476.roach[i],dx=v.x-px,dz=v.z-pz;if(Math.abs(dx)>22||Math.abs(dz)>22)continue;const d=Math.hypot(dx,dz);
    if(play&&d<2.6&&v.run<=0){v.run=.7+Math.random()*.5;v.yaw=Math.atan2(dx,dz)+(Math.random()-.5)*1.4;}
    if(v.run>0){v.run-=dt;v.x+=Math.sin(v.yaw)*1.7*dt;v.z+=Math.cos(v.yaw)*1.7*dt;v.yaw+=(Math.random()-.5)*dt*8;}
    else{v.t-=dt;if(v.t<=0){v.t=.15+Math.random()*.9;v.v=Math.random()<.55?0:.25+Math.random()*.35;const hd=Math.hypot(v.cx-v.x,v.cz-v.z);v.yaw=hd>.8?Math.atan2(v.cx-v.x,v.cz-v.z)+(Math.random()-.5)*.8:v.yaw+(Math.random()-.5)*2.4;}if(v.v>0){v.x+=Math.sin(v.yaw)*v.v*dt;v.z+=Math.cos(v.yaw)*v.v*dt;}}
    roachW476(i);cc=true;}
  if(cc&&VER476.cm)VER476.cm.instanceMatrix.needsUpdate=true;}

// ---- build everything now (during the startup loader), then animate cheaply ----
function build476(){const t0=performance.now();let G=null;try{G=lots476();}catch(e){e476(e,'lots');}
  if(G){try{W476.cem=cemetery476(G);}catch(e){e476(e,'cem');}try{W476.park=park476(lots476(0));}catch(e){e476(e,'park');}}
  try{litter476();}catch(e){e476(e,'litter');}try{grass476();}catch(e){e476(e,'grass');}try{glows476();}catch(e){e476(e,'glow');}
  try{crows476();}catch(e){e476(e,'crows');}try{vermin476();}catch(e){e476(e,'vermin');}
  try{if(W476.cem){DAY_HAUNT.push([W476.cem.x,W476.cem.z],[W476.cem.x,W476.cem.z]);}if(W476.park)DAY_HAUNT.push([W476.park.x,W476.park.z]);}catch(e){}
  W476.objs=L476.objs;W476.ms=Math.round(performance.now()-t0);
  try{window.__DBG&&__DBG.prob&&__DBG.prob('info','map476','cem '+(W476.cem?Math.round(W476.cem.x)+','+Math.round(W476.cem.z):'-')+' park '+(W476.park?Math.round(W476.park.x)+','+Math.round(W476.park.z):'-')+' '+W476.ms+'ms');}catch(e){}}
try{build476();}catch(e){e476(e,'build');}
W476.tick=function(dt,now,play){if(arenaOn468())return;const t=now/1000;const inMenu=game.state==='menu';if(!play&&!inMenu)return;
  try{crowTick476(dt,t,play);}catch(e){e476(e,'crow');}try{verminTick476(dt,t,play);}catch(e){e476(e,'vermin');}try{glowTick476(t);}catch(e){e476(e,'glowT');}
  const C=W476.cem;if(C){if(C.mt){C.mt.offset.x=(t*.012)%1;C.mt.offset.y=(t*.007)%1;}if(C.fog&&Math.abs(player.pos.x-C.x)<90&&Math.abs(player.pos.z-C.z)<90){const p=C.fog.geometry.attributes.position;for(let i=0;i<C.fogBase.length;i++){const b=C.fogBase[i];p.setXYZ(i,b[0]+Math.sin(t*.13+b[3])*1.6,b[1]+Math.sin(t*.31+b[3])*.15,b[2]+Math.cos(t*.11+b[3])*1.6);}p.needsUpdate=true;C.fog.material.opacity=.2+.14*nightF();}}
  const P=W476.park;if(P){const near=Math.hypot(player.pos.x-P.x,player.pos.z-P.z)<70;if(near){P.swing.rotation.x=Math.sin(t*1.25)*(.28+.12*Math.sin(t*.13));P.carA+=P.carV*dt*(.6+.4*Math.sin(t*.21));P.car.rotation.y=P.carA;
    P.cre-=dt;if(P.cre<=0&&play){P.cre=3.5+Math.random()*5;try{if(Math.random()<.5)creak476(P.swing.position.x,P.swing.position.z,.05);else creak476(P.car.position.x,P.car.position.z,.04);}catch(e){}}}}};
window.__zs476map={get cem(){return W476.cem&&{x:W476.cem.x,z:W476.cem.z,r:W476.cem.r};},get park(){return W476.park&&{x:W476.park.x,z:W476.park.z};},crows:()=>CROW476.list.length,rats:()=>VER476.rats.length,roach:()=>VER476.roach.length,ms:()=>W476.ms,tp:k=>{const o=k==='park'?W476.park:W476.cem;if(o){player.pos.set(o.x,0,o.z+(o.r||10)+3);}}};
