/* Zombie Survival — game code part 03-zombies (game.html lines 2273-2349 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ---------- zombies ----------
const VARIANTS={
 normal:{name:'normal',hp:80,speed:[1.15,1.6],dmg:10,scale:1,width:1,reach:1.45,pitch:1,stagger:1,skin:[.24,.3],eyes:0xff3010,anim:3},
 runner:{name:'runner',hp:55,speed:[3.2,3.8],dmg:7,scale:.93,width:.88,reach:1.4,pitch:1.35,stagger:1.2,skin:[.18,.25],eyes:0xffe020,anim:2.4},
 tank:{name:'tank',hp:340,speed:[.9,1.05],dmg:24,scale:1.42,width:1.3,reach:1.95,pitch:.6,stagger:.35,skin:[.3,.36],eyes:0xff7010,anim:3.4,heavy:true,score:300},
 bloater:{name:'bloater',hp:120,speed:[.95,1.15],dmg:0,scale:1.08,width:1.45,reach:1.9,pitch:.8,stagger:.5,skin:[.2,.26],eyes:0x9aff20,anim:3,special:true,score:150},
 boss:{name:'boss',hp:2400,speed:[1.25,1.35],dmg:30,scale:2.3,width:1.35,reach:1.75,pitch:.45,stagger:.08,skin:[0,.05],eyes:0xff2a10,anim:3.4,heavy:true,special:true,score:2500}};
VARIANTS.normal.score=100;VARIANTS.runner.score=125;
// v4.3.76: rare 'ghigno' (red suit, black top hat, grin): strong, a bit faster, 5 diamonds
VARIANTS.ghigno={name:'ghigno',hp:620,speed:[2.25,2.6],dmg:20,scale:1.1,width:1,reach:1.6,pitch:.92,stagger:.3,skin:[.3,.34],eyes:0xff1a12,anim:2.7,special:true,score:900};
const ZG={pelvis:new T.BoxGeometry(.42,.2,.25),thigh:new T.BoxGeometry(.17,.46,.19),shin:new T.BoxGeometry(.15,.44,.16),foot:new T.BoxGeometry(.16,.08,.27),
 torso:new T.BoxGeometry(.5,.62,.28),belly:new T.BoxGeometry(.3,.16,.04),rib:new T.BoxGeometry(.12,.05,.03),upper:new T.BoxGeometry(.13,.36,.13),fore:new T.BoxGeometry(.11,.34,.11),hand:new T.BoxGeometry(.12,.1,.14),finger:new T.BoxGeometry(.03,.09,.03),
 head:new T.BoxGeometry(.32,.3,.32),scalp:new T.BoxGeometry(.33,.07,.25),brow:new T.BoxGeometry(.3,.05,.06),eye:new T.BoxGeometry(.07,.045,.02),jaw:new T.BoxGeometry(.26,.08,.22),teeth:new T.BoxGeometry(.2,.03,.02),mouth:new T.BoxGeometry(.24,.08,.02),
 ear:new T.BoxGeometry(.04,.08,.06),rag:new T.BoxGeometry(.2,.18,.02),blob:new T.CircleGeometry(.5,12)};
// v4.3.70: rounded parts + extra face pieces
try{const rb=(w,h,d,sg,k)=>{const g=new T.BoxGeometry(w,h,d,sg,sg,sg),p=g.attributes.position,v=new T.Vector3(),hx=w/2,hy=h/2,hz=d/2;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const ux=v.x/hx,uy=v.y/hy,uz=v.z/hz,l=Math.hypot(ux,uy,uz)||1,m=Math.max(Math.abs(ux),Math.abs(uy),Math.abs(uz))/l;const f=1-k+k*m;p.setXYZ(i,v.x*f,v.y*f,v.z*f);}g.computeVertexNormals();return g;};
 ZG.head=rb(.32,.3,.32,3,.5);ZG.torso=rb(.5,.62,.28,2,.35);ZG.pelvis=rb(.42,.2,.25,2,.3);ZG.thigh=rb(.17,.46,.19,2,.4);ZG.shin=rb(.15,.44,.16,2,.4);ZG.upper=rb(.13,.36,.13,2,.45);ZG.fore=rb(.11,.34,.11,2,.45);ZG.jaw=rb(.26,.08,.22,2,.35);ZG.hand=rb(.12,.1,.14,2,.4);}catch(e){}
ZG.sock=new T.BoxGeometry(.1,.075,.02);ZG.nose=new T.BoxGeometry(.05,.075,.05);ZG.tuft=new T.BoxGeometry(.06,.05,.08);ZG.hem=new T.BoxGeometry(.09,.12,.02);
// pivot-friendly translations
ZG.thigh.translate(0,-.23,0);ZG.shin.translate(0,-.22,0);ZG.foot.translate(0,-.04,.05);ZG.torso.translate(0,.31,0);ZG.upper.translate(0,-.18,0);ZG.fore.translate(0,-.17,0);ZG.hand.translate(0,-.05,0);ZG.head.translate(0,.15,0);ZG.jaw.translate(0,-.04,.08);ZG.blob.rotateX(-Math.PI/2);
const blobMat=new T.MeshBasicMaterial({color:0,transparent:true,opacity:.42,depthWrite:false});
const woundMat=new T.MeshLambertMaterial({color:0x4a0808}),boneMat=new T.MeshLambertMaterial({color:0xcfc6a8}),mouthMat=new T.MeshBasicMaterial({color:0x120404});
const SHIRTS=[0x5a4a3a,0x6b2f2f,0x3d5a3a,0x4a4a6a,0x777060,0x2f3f5a,0x6a5a2a,0x5a2a4a],PANTS=[0x2c3550,0x3a3228,0x2a2a2a,0x4a4030,0x23303a];
const eyeMats={};function eyeMat(c){return eyeMats[c]||(eyeMats[c]=new T.MeshBasicMaterial({color:c}));}
const eyeHalo={};function eyeHaloMat(c){return eyeHalo[c]||(eyeHalo[c]=new T.SpriteMaterial({map:glowTex,color:c,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.9}));}
const zombies=[],zHitMeshes=[];
const _m4=new T.Matrix4(),_e=new T.Euler(),_s=new T.Vector3(),_pp=new T.Vector3(),_qq=new T.Quaternion();
// merge several box pieces into one vertex-coloured geometry (1 draw call per bone)
function mergePieces(list){let n=0;const geos=list.map(it=>{const g=it[0].index?it[0].toNonIndexed():it[0].clone();
  _e.set(it[3]||0,it[4]||0,it[5]||0);_qq.setFromEuler(_e);_pp.set(it[2][0],it[2][1],it[2][2]);_s.set(it[6]||1,it[7]||1,it[8]||1);_m4.compose(_pp,_qq,_s);g.applyMatrix4(_m4);g.__c2=it[9]||null;n+=g.attributes.position.count;return [g,it[1]];});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;const c=new T.Color();
  for(const [g,cc] of geos){pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);c.copy(cc);
    const cnt=g.attributes.position.count,sh=.94+Math.random()*.12,c2=g.__c2;for(let i=0;i<cnt;i++){if(c2&&i%3===0){const w=Math.random();c.copy(cc).lerp(c2,w>.5?.55+w*.4:w*.25);}col[(o+i)*3]=c.r*sh;col[(o+i)*3+1]=c.g*sh;col[(o+i)*3+2]=c.b*sh;}o+=cnt;g.dispose();}
  const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('color',new T.BufferAttribute(col,3));out.computeBoundingSphere();return out;}
function P(parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
const CW=new T.Color(0x4a0808),CB=new T.Color(0xcfc6a8),CM=new T.Color(0x120404),CD=new T.Color(0x151215),CF=new T.Color(0x18181a);
function z432Mat(m){m.onBeforeCompile=sh=>{sh.uniforms.uZ432=Z432.u;sh.fragmentShader='uniform vec4 uZ432;\n'+sh.fragmentShader.replace('#include <fog_fragment>','{vec3 vd432=normalize(vViewPosition);float fr432=1.-clamp(abs(dot(normalize(normal),vd432)),0.,1.);fr432*=fr432;gl_FragColor.rgb*=1.-uZ432.x*fr432;gl_FragColor.rgb+=vec3(.55,.68,1.)*(uZ432.y*fr432*fr432);}\n'+T.ShaderChunk.fog_fragment.replace(/fogColor,\s*fogFactor\s*\)/,'fogColor, fogFactor*uZ432.z )'));};m.customProgramCacheKey=()=>'z432';return m;}
// v4.3.102: original low-poly faceted zombies modelled after Gaspare's 4 concept images (civilian, runner, tank, rare red).
// Same joint groups as before (hips/spine/neck/jaw/hipL.../elR): animation, ragdoll, sever442, headshots and the 1-draw skin (17-v471) keep working.
const NZ=(()=>{const flat=g=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();if(n.attributes.uv)n.deleteAttribute('uv');n.computeVertexNormals();return n;};
  const lathe=(pts,seg)=>flat(new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||7));
  const ball=(r,w,h)=>flat(new T.SphereGeometry(r,w||7,h||5));
  const cone=(r,h,s)=>flat(new T.ConeGeometry(r,h,s||4));
  const box=(w,h,d)=>flat(new T.BoxGeometry(w,h,d));
  // jagged ring of hanging cloth teeth (radius 1, teeth up to 1 long): scale x/z = radius, y = tooth length
  const jag=(n,seed)=>{let s=seed||1;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};const P=[];
    for(let i=0;i<n;i++){const a0=i/n*6.283,a1=(i+1)/n*6.283,am=(a0+a1)/2,L=.35+r()*.65,R=1.04+r()*.08;
      const A=[Math.sin(a0),0,Math.cos(a0)],B=[Math.sin(a1),0,Math.cos(a1)],C=[Math.sin(am)*R,-L,Math.cos(am)*R];P.push(...A,...C,...B,...A,...B,...C);
      const D=[Math.sin(a1)*1.01,-.12-r()*.12,Math.cos(a1)*1.01];P.push(...B,...C,...D,...B,...D,...C);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(P),3));g.computeVertexNormals();return g;};
  const G={
   pelvis:lathe([[0,.1],[.15,.09],[.2,.02],[.19,-.06],[.13,-.12],[0,-.13]],8),
   thigh:lathe([[0,.03],[.085,.01],[.105,-.1],[.095,-.22],[.075,-.38],[.068,-.47],[0,-.48]],7),
   shin:lathe([[0,.03],[.072,.01],[.08,-.06],[.083,-.16],[.06,-.32],[.048,-.43],[0,-.45]],7),
   upper:lathe([[0,.07],[.07,.06],[.085,0],[.08,-.12],[.064,-.3],[.058,-.4],[0,-.42]],7),
   fore:lathe([[0,.02],[.058,0],[.066,-.08],[.06,-.18],[.044,-.33],[.04,-.39],[0,-.4]],7),
   delt:ball(.1,7,5),palm:box(.09,.1,.05),finger:box(.022,.085,.022),claw:cone(.013,.05,3),fist:ball(.08,7,5),
   shoe:box(.12,.07,.27),sole:box(.13,.03,.28),toe:box(.03,.03,.05),foot:ball(.09,7,4),
   head:ball(.17,9,7),hood:ball(.2,8,6),jaw:lathe([[0,.03],[.1,.03],[.115,-.015],[.085,-.06],[0,-.075]],8),
   socket:ball(.05,6,4),eyeball:ball(.028,5,3),nose:cone(.032,.075,4),nhole:ball(.018,4,3),ear:ball(.04,5,3),tooth:box(.022,.03,.012),fang:cone(.012,.04,3),cheek:ball(.05,5,4),brow:box(.13,.03,.04),
   flap:box(.16,.16,.02),patch:box(.12,.1,.015),rip:ball(.06,6,4),rib:box(.12,.03,.03),belly:ball(.2,8,6),strap:box(.07,.6,.02),buckle:box(.07,.06,.025),muscle:ball(.1,6,4),
   jag:jag(16,7),jagS:jag(9,3)};
  G.nose.rotateX(Math.PI/2);G.claw.rotateX(Math.PI);G.fang.rotateX(Math.PI);G.finger.translate(0,-.04,0);
  // skull: flat cheeks, heavy brow, narrow chin, sunken temples
  {const p=G.head.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y>.03&&z>.06)z+=.022*(1-Math.abs(y-.06)/.11);if(y<-.04){x*=.8;z*=.95;}if(Math.abs(x)>.12&&y>0&&y<.1)x*=.93;p.setXYZ(i,x*.95,y,z);}G.head.computeVertexNormals();}
  G.torsoP=[[0,-.03],[.17,0],[.19,.1],[.215,.25],[.245,.42],[.25,.52],[.2,.62],[.08,.67],[0,.67]];
  G.torso=(W,TZ,H,P)=>{const g=lathe(P||G.torsoP,9),p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),k=Math.max(0,y)/.66;let x=p.getX(i)*W,z=p.getZ(i)*.62*TZ;if(z<0)z*=1.1;p.setXYZ(i,x,y,z+H*k*k);}g.computeVertexNormals();return g;};
  G.front=(y,TZ,H,P)=>{P=P||G.torsoP;let r=0;for(let i=1;i<P.length;i++)if(y<=P[i][1]){const a=P[i-1],b=P[i],t=(y-a[1])/((b[1]-a[1])||1);r=a[0]+(b[0]-a[0])*t;break;}const k=Math.max(0,y)/.66;return r*.62*TZ+H*k*k;};
  G.rad=(y,P)=>{P=P||G.torsoP;for(let i=1;i<P.length;i++)if(y<=P[i][1]){const a=P[i-1],b=P[i],t=(y-a[1])/((b[1]-a[1])||1);return a[0]+(b[0]-a[0])*t;}return 0;};
  return G;})();
// concept palettes
const NZP={
 normal:{skin:[0x7f9272,0x748a6c,0x8a9478,0x6f8466],mot:0x5d6e56,shirt:[0x3f5f8a,0x35557e,0x4a6890],pants:[0x5a4232,0x4e3a2c,0x634a36],eyes:0xdff3c2},
 runner:{skin:[0xb5a865,0xa89a58,0xbfb070],mot:0x8c8040,shirt:[0x6c6c70,0x5e5f63,0x77777a],pants:[0x4d5d72,0x56667a,0x45546a],eyes:0xf0e8a0},
 tank:{skin:[0x8fae4a,0x86a446],mot:0x7a4a7c,shirt:[0x3b5534],pants:[0x3b5534],eyes:0xffd040},
 bloater:{skin:[0x8fa05a],mot:0x6a7a3a,shirt:[0x55603a],pants:[0x4a3a2a],eyes:0x9aff20},
 boss:{skin:[0x6a7a5a],mot:0x4a2a3a,shirt:[0x3a1412],pants:[0x1e1a1a],eyes:0xff2a10},
 ghigno:{skin:[0xb3202a],mot:0x7e1018,shirt:[0x18161a],pants:[0x18161a],eyes:0xff1a12}};
VARIANTS.normal.eyes=NZP.normal.eyes;VARIANTS.runner.eyes=NZP.runner.eyes;
function makeZombie(vName){const V=VARIANTS[vName];const z={V,g:new T.Group(),alive:false,dead:false,seed:Math.random()*100,nz100:1};
  const nm=V.name,GH=nm==='ghigno',RUN=nm==='runner',TK=nm==='tank'||nm==='boss',BL=nm==='bloater',CIV=!GH&&!RUN&&!TK&&!BL;
  const pick=a=>a[(Math.random()*a.length)|0],PP=NZP[nm]||NZP.normal;
  const skin=new T.Color(pick(PP.skin)).multiplyScalar(rand(.93,1.05)),skinD=skin.clone().multiplyScalar(.68),mot=new T.Color(PP.mot),
   shirt=new T.Color(pick(PP.shirt)).multiplyScalar(rand(.9,1.05)),pants=new T.Color(pick(PP.pants)).multiplyScalar(rand(.9,1.05)),shirtD=shirt.clone().multiplyScalar(.62),pantsD=pants.clone().multiplyScalar(.7);
  const MOT=TK||GH?mot:null;
  z.mat=z432Mat(new T.MeshLambertMaterial({vertexColors:true}));const W=V.width,TZ=TK?1.25:BL?1.15:1,H=GH?.1:RUN?.17:TK?.12:.14,AL=RUN?1.08:TK?1.08:GH?1.12:1.06;
  const TP=TK?[[0,-.03],[.18,0],[.2,.1],[.23,.25],[.27,.42],[.28,.52],[.24,.6],[.1,.66],[0,.66]]:GH?[[0,-.03],[.15,0],[.16,.1],[.18,.25],[.21,.42],[.22,.52],[.17,.62],[.07,.67],[0,.67]]:NZ.torsoP;
  const part=(parent,list,tag)=>{const m=new T.Mesh(mergePieces(list),z.mat);parent.add(m);if(tag){m.userData.z=z;m.userData.part=tag;zHitMeshes.push(m);}return m;};
  const F=y=>NZ.front(y,TZ,H,TP)+.006,Rx=y=>NZ.rad(y,TP)*W;
  z.body=P(z.g,0,0,0);z.hips=P(z.body,0,.95,0);
  // ---- pelvis + belt / loin rags
  const pl=[[NZ.pelvis,pants,[0,0,0],0,0,0,W,1,.72*TZ]];
  if(CIV||RUN)pl.push([NZ.jag,pantsD,[0,.09,0],0,0,0,.2*W,.05,.14*TZ]);
  if(CIV)pl.push([NZ.patch,new T.Color(0x2a1d14),[0,.06,.14*TZ],0,0,0,1.7*W,.4,1]);
  if(GH)pl.push([NZ.jag,pants,[0,.06,0],0,0,0,.215*W,.36,.17*TZ],[NZ.jagS,new T.Color(0x0e0c0e),[0,0,0],0,.3,0,.21*W,.3,.165*TZ]);
  if(TK)pl.push([NZ.jag,pantsD,[0,.07,0],0,0,0,.22*W,.08,.17*TZ]);
  part(z.hips,pl,'body');
  // ---- legs
  const leg=(side)=>{const hip=P(z.hips,side*.11*W,-.06,0);const LS=TK?1.3:GH?.85:1;
    const th=[[NZ.thigh,GH?skin:pants,[0,0,0],0,0,0,LS,1,LS,GH?mot:null]];
    if(!GH&&Math.random()<.8)th.push([NZ.rip,skin,[side*.02,-.2-Math.random()*.12,.07*LS],0,0,0,.9*LS,1.3,.5,MOT]);
    if(TK)th.push([NZ.jagS,pantsD,[0,-.42,0],0,0,0,.09*LS,.12,.09*LS]);
    part(hip,th,'limb');const knee=P(hip,0,-.46,0);
    const sh=[[NZ.shin,GH||TK?skin:pants,[0,0,0],0,0,0,LS,1,LS,MOT]];
    if(CIV||RUN){if(Math.random()<.7)sh.push([NZ.rip,skin,[-side*.015,-.14,.065],0,0,0,.8,1.2,.5]);sh.push([NZ.jag,pantsD,[0,-.36,0],0,0,0,.075,.09,.075]);sh.push([NZ.shin,skinD,[0,-.36,0],0,0,0,.75,.2,.75]);}
    if(RUN)sh.push([NZ.shoe,new T.Color(0x4a4c52),[0,-.43,.04]],[NZ.sole,new T.Color(0xdedcd4),[0,-.475,.04]],[NZ.patch,new T.Color(0xcfcfc8),[0,-.42,.175],0,0,0,.6,.35,1]);
    else if(CIV)sh.push([NZ.shoe,new T.Color(0x2a221c),[0,-.435,.04],0,0,0,.95,.95,.95],[NZ.sole,new T.Color(0x18140f),[0,-.475,.04],0,0,0,.95,1,.95]);
    else if(TK){sh.push([NZ.foot,skin,[0,-.45,.05],0,0,0,1.5,.6,1.9,MOT]);for(let i=0;i<4;i++)sh.push([NZ.toe,skinD,[(i-1.5)*.04,-.47,.2],0,0,0,1.1,1,1]);}
    else sh.push([NZ.foot,GH?skin:CF,[0,-.45,.04],0,0,0,1,.55,1.6,MOT]);
    part(knee,sh,'limb');return [hip,knee];};
  [z.hipL,z.kneeL]=leg(-1);[z.hipR,z.kneeR]=leg(1);
  z.spine=P(z.hips,0,.08,0);
  // ---- torso
  const bare=TK||GH;
  const tl=[[NZ.torso(W,TZ,H,TP),bare?skin:shirt,[0,0,0],0,0,0,1,1,1,bare?mot:null]];
  if(CIV){tl.push([NZ.jag,shirtD,[0,.06,H*.01],0,0,0,Rx(.06)*1.02,.17,NZ.rad(.06,TP)*.62*TZ*1.05]);
    tl.push([NZ.rip,skin,[rand(-.08,.08)*W,.2,F(.2)-.035],0,0,0,1.3,1.1,.5],[NZ.rip,CW,[rand(-.1,.1)*W,.4,F(.4)-.03],0,0,0,.6,.6,.5],[NZ.rip,skin,[-.15*W,.3,F(.3)-.06],0,-.6,0,.8,1,.5],[NZ.patch,shirtD,[0,.6,F(.6)],-.6,0,0,1.2,.5,1]);
    for(let i=0;i<3;i++)tl.push([NZ.rib,CB,[.05*W,.17+i*.05,F(.17+i*.05)-.012],0,0,.1,.7,1,1]);}
  if(RUN){tl.push([NZ.jag,shirtD,[0,.04,H*.01],0,0,0,Rx(.04)*1.03,.12,NZ.rad(.04,TP)*.62*TZ*1.06]);
    tl.push([NZ.hood,shirt,[0,.64,H*.9-.09],-.3,0,0,1.05,.75,.85],[NZ.patch,shirtD,[0,.36,F(.36)],-.15,0,0,1.6,.9,1],[NZ.strap,new T.Color(0xd8d8d0),[-.05,.5,F(.5)+.004],-.3,0,0,.12,.25,1],[NZ.strap,new T.Color(0xd8d8d0),[.05,.5,F(.5)+.004],-.3,0,0,.12,.25,1],
      [NZ.rip,skin,[.1*W,.25,F(.25)-.035],0,0,0,1,1.2,.5],[NZ.rip,CW,[.1*W,.25,F(.25)-.025],0,0,0,.4,.6,.5]);for(let i=0;i<3;i++)tl.push([NZ.rib,CB,[.1*W,.2+i*.045,F(.2+i*.045)-.01],0,0,.15,.6,1,1]);}
  if(TK){for(const sd of [-1,1])tl.push([NZ.muscle,skin,[sd*.12*W,.45,F(.45)-.07],0,0,0,1.35,.85,.75,mot],[NZ.muscle,skin,[sd*.17*W,.64,H*.75-.05],0,0,0,1.5,.8,1.2,mot]);
    tl.push([NZ.muscle,skin,[0,.22,F(.22)-.06],0,0,0,1.6,1,.6,mot],[NZ.patch,pants,[0,.14,F(.14)+.004],-.08,0,0,2.4,2.2,1],[NZ.jag,pantsD,[0,.27,F(.27)-.03],Math.PI,0,0,.15,.07,.03],[NZ.rip,skin,[.02,.14,F(.14)-.03],0,0,0,.9,.9,.6,mot],
      [NZ.strap,pants,[-.06*W,.38,F(.38)+.008],-.35,0,.5,1,1,1],[NZ.buckle,new T.Color(0x9a9a92),[-.15*W,.55,F(.55)+.01],-.35,0,.5],[NZ.strap,pants,[.02,.36,B0(.36)],.2,0,-.5,1,1,1]);}
  if(BL)tl.push([NZ.belly,new T.Color(0x7a9a38),[0,.2,F(.2)-.08],0,0,0,1.2*W,1,1,new T.Color(0x9acb3a)],[NZ.patch,new T.Color(0x9acb3a),[0,.26,F(.2)+.1],0,0,0,1.4,1.4,1],[NZ.jag,shirtD,[0,.08,0],0,0,0,Rx(.08)*1.02,.14,NZ.rad(.08,TP)*.62*TZ*1.05]);
  if(nm=='boss'){for(const sd of [-1,1])for(let i=0;i<3;i++)tl.push([NZ.fang,CB,[sd*(.16+i*.06)*W,.62+i*.015,H*.8-.05],-.5+Math.PI,0,-sd*(.5+i*.3),1.3,2.2-i*.4,1.3]);}
  if(GH){const K=new T.Color(0x18161a),K2=new T.Color(0x0d0b0d);
    tl.push([NZ.jag,K,[0,.3,H*.18],0,0,0,Rx(.3)*1.06,.34,NZ.rad(.3,TP)*.62*TZ*1.12],[NZ.jagS,K2,[0,.16,H*.05],0,.4,0,Rx(.16)*1.08,.3,NZ.rad(.16,TP)*.62*TZ*1.14]);
    for(const sd of [-1,1])tl.push([NZ.jagS,K,[sd*.2*W,.6,H*.7-.02],0,0,sd*.5,.13,.3,.13],[NZ.muscle,K,[sd*.17*W,.6,H*.72-.04],0,0,0,.9,.45,1.1]);
    for(let i=0;i<4;i++)tl.push([NZ.rib,skinD,[0,.22+i*.06,F(.22+i*.06)-.01],0,0,0,1.1+i*.1,1,1]);}
  part(z.spine,tl,'body');
  function B0(y){return -NZ.front(y,TZ,0,TP)+H*(Math.max(0,y)/.66)**2-.006;}
  // ---- arms (long, drooping shoulders, clawed hands / fists)
  const shY=TK?.55:.5,shZ=(NZ.front(shY,TZ,H,TP)-NZ.rad(shY,TP)*.62*TZ)*.95;
  const arm=(side)=>{const sh=P(z.spine,side*(Rx(shY)+(TK?.03:.0)),shY,shZ);const AS=TK?1.75:GH?.85:1,sl=RUN||(CIV&&Math.random()<.5);
    const up=[[NZ.upper,TK||GH?skin:sl?shirt:skin,[0,0,0],0,0,0,AS,AL,AS,MOT],[NZ.delt,TK||GH?skin:shirt,[0,.01,0],0,0,0,AS*.95,AS*.8,AS*.95,MOT]];
    if(CIV&&!sl)up.push([NZ.jagS,shirtD,[0,-.03,0],0,0,0,.1,.13,.1]);
    if(CIV&&sl)up.push([NZ.jagS,shirtD,[0,-.3,0],0,0,0,.07,.12,.07],[NZ.rip,skin,[0,-.15,.05],0,0,0,.6,.8,.5]);
    if(TK)up.push([NZ.muscle,skin,[0,-.12,.06],0,0,0,.95,1.4,.8,mot]);
    part(sh,up,'limb');
    const el=P(sh,0,-.41*AL,0);
    const fo=[[NZ.fore,RUN?shirt:skin,[0,0,0],0,0,0,AS,AL,AS,MOT]];
    if(RUN)fo.push([NZ.jagS,shirtD,[0,-.3*AL,0],0,0,0,.055,.08,.055]);
    if(TK)fo.push([NZ.muscle,skin,[0,-.1,.02],0,0,0,1,1.3,1,mot],[NZ.fist,skin,[0,-.44*AL,.01],0,0,0,1.5,1.35,1.4,mot],[NZ.patch,skinD,[0,-.48*AL,.11],0,0,0,1.2,.35,1]);
    else{const hy=-.42*AL;fo.push([NZ.palm,skin,[0,hy,.01],.15,0,0,AS,1,AS,MOT]);
      for(let i=0;i<4;i++){const fx=(i-1.5)*.022*AS;fo.push([NZ.finger,skin,[fx,hy-.05,.02],-.35-i*.05,0,0,1,1+(i===1||i===2?.15:0),1,MOT],[NZ.claw,GH?new T.Color(0x3a0508):CD,[fx,hy-.13,.05],-.6,0,0,1,1.1,1]);}
      fo.push([NZ.finger,skin,[side*-.05*AS,hy-.01,.035],-.6,0,side*.6,1.1,.8,1.1,MOT]);}
    part(el,fo,'limb');return [sh,el];};
  [z.shL,z.elL]=arm(-1);[z.shR,z.elR]=arm(1);
  // ---- head (bald skull face, deep sockets, open grin)
  z.neck=P(z.spine,0,TK?.63:.6,H*.9+.03);const HS=TK?.8:1;
  const hd=[[NZ.head,skin,[0,.15,0],0,0,0,HS,HS,HS,MOT],[NZ.lathe||NZ.upper,skinD,[0,-.02,-.01],0,0,0,TK?1.7:1,.25,TK?1.7:1],
    [NZ.socket,CM,[-.066*HS,.175*HS,.13*HS],0,0,0,1,.8,.6],[NZ.socket,CM,[.066*HS,.175*HS,.13*HS],0,0,0,1,.8,.6],[NZ.brow,skinD,[0,.225*HS,.155*HS],-.2,0,0,HS*1.15,1,1],
    [NZ.cheek,skinD,[-.08*HS,.1*HS,.12*HS],0,0,0,.9,.7,.6],[NZ.cheek,skinD,[.08*HS,.1*HS,.12*HS],0,0,0,.9,.7,.6],[NZ.ear,skinD,[-.16*HS,.15*HS,0],0,0,0,.5,1,.8],[NZ.ear,skinD,[.16*HS,.15*HS,0],0,0,0,.5,1,.8],
    [NZ.patch,CM,[0,.06*HS,.148*HS],0,0,0,1.25*HS,.85,1]];
  if(RUN||GH)hd.push([NZ.nhole,CM,[-.012,.125,.168],0,0,0,1,1.4,.6],[NZ.nhole,CM,[.012,.125,.168],0,0,0,1,1.4,.6],[NZ.nose,skinD,[0,.14,.155],0,0,0,.8,.6,.5]);else hd.push([NZ.nose,skinD,[0,.12*HS,.17*HS]]);
  if(CIV&&Math.random()<.5)hd.push([NZ.rip,CW,[(Math.random()<.5?-1:1)*.1,.26,.08],0,0,0,.7,.5,.5]);
  const TW=GH||nm=='boss'?new T.Color(0xf2eee0):new T.Color(0xd8d0b0),nt=GH?7:TK?5:6;
  for(let i=0;i<nt;i++){const x=(i-(nt-1)/2)*(GH?.03:.028)*HS;hd.push([TK&&(i===0||i===nt-1)?NZ.fang:NZ.tooth,TW,[x,.088*HS,.152*HS-Math.abs(x)*.25],0,0,0,GH?1.2:1,GH?1.3:1,1]);}
  part(z.neck,hd,'head');
  const ek='e'+HS;NZ[ek]=NZ[ek]||mergePieces([[NZ.eyeball,new T.Color(1,1,1),[-.066*HS,.175*HS,.148*HS],0,0,0,1,.8,.7],[NZ.eyeball,new T.Color(1,1,1),[.066*HS,.175*HS,.148*HS],0,0,0,1,.8,.7]]);const eyes=new T.Mesh(NZ[ek],eyeMat(V.eyes));z.neck.add(eyes);
  const eh=new T.Sprite(eyeHaloMat(V.eyes));eh.scale.set(GH?.5:.36,GH?.25:.18,1);eh.position.set(0,.175*HS,.19*HS);z.neck.add(eh);
  if(BL){z.glow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0x8aff30,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55}));z.glow.scale.set(1.5,1.5,1);z.glow.position.set(0,.25,F(.2)+.1);z.spine.add(z.glow);z.baseEm=0x1c3a06;}
  if(nm=='boss'){z.baseEm=0x200000;eh.scale.set(.7,.35,1);}if(GH)z.baseEm=0x1a0000;
  z.jaw=P(z.neck,0,.06*HS,.02);const jw=[[NZ.jaw,skinD,[0,-.01,.05*HS],.2,0,0,HS,HS,HS*1.1,MOT]];
  for(let i=0;i<nt-1;i++){const x=(i-(nt-2)/2)*(GH?.03:.028)*HS;jw.push([TK&&(i===0||i===nt-2)?NZ.fang:NZ.tooth,TW,[x,.015,.145*HS-Math.abs(x)*.3],TK?Math.PI:0,0,0,GH?1.2:1,GH?1.2:1,1]);}
  part(z.jaw,jw,'head');
  z.g.scale.setScalar(V.scale);
  z.blob=new T.Mesh(ZG.blob,blobMat);z.blob.position.y=.02;z.blob.scale.setScalar(W*1.1);z.g.add(z.blob);
  scene.add(z.g);z.g.visible=false;zombies.push(z);return z;}
for(let i=0;i<7;i++)makeZombie('normal');for(let i=0;i<5;i++)makeZombie('runner');for(let i=0;i<3;i++)makeZombie('tank');for(let i=0;i<3;i++)makeZombie('bloater');makeZombie('boss');
// v4.3.66: bigger pool so more zombies can be alive at once
for(let i=0;i<12;i++)makeZombie('normal');for(let i=0;i<4;i++)makeZombie('runner');
// v4.3.76: more zombies over the whole map + cemetery, and the rare ghigno
for(let i=0;i<9;i++)makeZombie('normal');for(let i=0;i<3;i++)makeZombie('runner');for(let i=0;i<2;i++)makeZombie('ghigno');
function resetPose(z){z.body.rotation.set(0,0,0);z.body.position.set(0,0,0);z.hips.position.y=.95;z.hips.rotation.set(0,0,0);for(const k of ['hipL','hipR','kneeL','kneeR','spine','shL','shR','elL','elR','neck','jaw'])z[k].rotation.set(0,0,0);}
function spawnZombie(vName){let z=zombies.find(q=>!q.alive&&q.V.name===vName);if(!z&&vName!=='boss')z=zombies.find(q=>!q.alive&&q.V.name==='normal')||zombies.find(q=>!q.alive&&!q.V.special);if(!z)return false;
  let x,zz;{const sp=SPAWN_AT||svSpawnPos(20,30,player.pos.x,player.pos.z)||{x:clamp(player.pos.x+24,-HALF+2,HALF-2),z:player.pos.z};x=sp.x;zz=sp.z;}LAST_Z=z;
  const V=z.V,wm=1+Math.min(.5,(game.wave-1)*.07);
  Object.assign(z,{alive:true,dead:false,hp:V.hp*(V.name==='boss'?1+(game.wave/5-1)*.6:1+(game.wave-1)*.15)*DIFF().hp,speed:rand(V.speed[0],V.speed[1])*(V.name==='boss'?1:wm)*DIFF().spd,state:'walk',atkT:0,atkHit:false,cool:0,stag:0,stagHead:0,flash:0,deadT:0,groanT:rand(1,4),phase:Math.random()*6,stuck:0,side:0,sideT:0,limp:V.name=='normal'&&Math.random()<.5?rand(.3,.6):0});
  z.maxHp=z.hp;z.g.position.set(x,0,zz);resetPose(z);z.blob.visible=true;z.g.visible=true;z.mat.emissive.setHex(z.baseEm||0);spawnExtra(z);return true;}

