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
  _e.set(it[3]||0,it[4]||0,it[5]||0);_qq.setFromEuler(_e);_pp.set(it[2][0],it[2][1],it[2][2]);_s.set(it[6]||1,it[7]||1,it[8]||1);_m4.compose(_pp,_qq,_s);g.applyMatrix4(_m4);n+=g.attributes.position.count;return [g,it[1]];});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;const c=new T.Color();
  for(const [g,cc] of geos){pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);c.copy(cc);
    const cnt=g.attributes.position.count,sh=.94+Math.random()*.12;for(let i=0;i<cnt;i++){col[(o+i)*3]=c.r*sh;col[(o+i)*3+1]=c.g*sh;col[(o+i)*3+2]=c.b*sh;}o+=cnt;g.dispose();}
  const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('color',new T.BufferAttribute(col,3));out.computeBoundingSphere();return out;}
function P(parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
const CW=new T.Color(0x4a0808),CB=new T.Color(0xcfc6a8),CM=new T.Color(0x120404),CD=new T.Color(0x151215),CF=new T.Color(0x18181a);
function z432Mat(m){m.onBeforeCompile=sh=>{sh.uniforms.uZ432=Z432.u;sh.fragmentShader='uniform vec4 uZ432;\n'+sh.fragmentShader.replace('#include <fog_fragment>','{vec3 vd432=normalize(vViewPosition);float fr432=1.-clamp(abs(dot(normalize(normal),vd432)),0.,1.);fr432*=fr432;gl_FragColor.rgb*=1.-uZ432.x*fr432;gl_FragColor.rgb+=vec3(.55,.68,1.)*(uZ432.y*fr432*fr432);}\n'+T.ShaderChunk.fog_fragment.replace(/fogColor,\s*fogFactor\s*\)/,'fogColor, fogFactor*uZ432.z )'));};m.customProgramCacheKey=()=>'z432';return m;}
// v4.3.100: new original low-poly zombies (rounded lathe/sphere shapes, flat colours, hunched back, drooping shoulders, longer arms).
// Same joint groups as before (hips/spine/neck/jaw/hipL.../elR), so animation, ragdoll, sever442, headshots and the 1-draw skin (17-v471) keep working.
const NZ=(()=>{const flat=g=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();n.deleteAttribute('uv');n.computeVertexNormals();return n;};
  const lathe=(pts,seg)=>flat(new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||7));
  const ball=(r,w,h)=>flat(new T.SphereGeometry(r,w||7,h||5));
  const cone=(r,h,s)=>flat(new T.ConeGeometry(r,h,s||4));
  const box=(w,h,d)=>flat(new T.BoxGeometry(w,h,d));
  const G={
   pelvis:lathe([[0,.1],[.15,.09],[.2,.02],[.18,-.08],[.1,-.12],[0,-.12]],7),
   thigh:lathe([[0,.03],[.085,.01],[.1,-.12],[.075,-.36],[.065,-.47],[0,-.48]],6),
   shin:lathe([[0,.02],[.07,0],[.08,-.12],[.055,-.38],[.05,-.44],[0,-.45]],6),
   foot:ball(.09,6,4),
   upper:lathe([[0,.06],[.075,.04],[.08,-.06],[.062,-.3],[.055,-.41],[0,-.42]],6),
   fore:lathe([[0,.02],[.055,0],[.062,-.1],[.045,-.33],[.04,-.39],[0,-.4]],6),
   hand:ball(.065,6,4),claw:cone(.016,.07,3),
   head:ball(.17,8,6),cap:ball(.175,8,4),jaw:lathe([[0,.03],[.1,.03],[.12,-.02],[.08,-.07],[0,-.08]],7),
   socket:ball(.048,5,4),nose:cone(.035,.08,4),ear:ball(.04,4,3),tuft:cone(.035,.1,3),tooth:cone(.014,.04,3),
   flap:box(.16,.16,.02),patch:box(.12,.1,.015),rib:box(.12,.035,.03),belly:ball(.2,8,6)};
  G.nose.rotateX(Math.PI/2);G.claw.rotateX(Math.PI);G.tooth.rotateX(Math.PI);
  // head: flatter cheeks, heavy brow, narrower chin
  {const p=G.head.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y>.03&&z>.06)z+=.025*(1-Math.abs(y-.06)/.11);if(y<-.05)x*=.82;p.setXYZ(i,x*.96,y,z);}G.head.computeVertexNormals();}
  // torso: hunched lathe (profile in y 0..0.66), bent forward with height
  G.torsoP=[[0,-.02],[.17,0],[.2,.12],[.225,.3],[.245,.46],[.2,.6],[.08,.66],[0,.66]];
  G.torso=(W,TZ,H)=>{const g=lathe(G.torsoP,8),p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),k=Math.max(0,y)/.66;p.setXYZ(i,p.getX(i)*W,y,p.getZ(i)*.62*TZ+H*k*k);}g.computeVertexNormals();return g;};
  G.front=(y,TZ,H)=>{const P=G.torsoP;let r=0;for(let i=1;i<P.length;i++)if(y<=P[i][1]){const a=P[i-1],b=P[i],t=(y-a[1])/((b[1]-a[1])||1);r=a[0]+(b[0]-a[0])*t;break;}const k=Math.max(0,y)/.66;return r*.62*TZ+H*k*k;};
  G.back=(y,TZ,H)=>{const k=Math.max(0,y)/.66;return -G.front(y,TZ,0)+H*k*k;};
  return G;})();
function makeZombie(vName){const V=VARIANTS[vName];const z={V,g:new T.Group(),alive:false,dead:false,seed:Math.random()*100,nz100:1};
  const nm=V.name,GH=nm==='ghigno',RUN=nm==='runner',TK=nm==='tank'||nm==='boss',BL=nm==='bloater';
  const skin=(()=>{const r=Math.random();return r<.35?new T.Color().setHSL(rand(.2,.28),rand(.18,.28),rand(.3,.38)):r<.65?new T.Color().setHSL(rand(.52,.6),rand(.06,.12),rand(.34,.42)):new T.Color().setHSL(rand(.06,.12),rand(.15,.28),rand(.3,.38));})(),skinD=skin.clone().multiplyScalar(.7),
   shirt=new T.Color(SHIRTS[(Math.random()*SHIRTS.length)|0]).multiplyScalar(rand(.8,1.05)),pants=new T.Color(PANTS[(Math.random()*PANTS.length)|0]),shirtD=shirt.clone().multiplyScalar(.65);
  if(TK)shirt.set(0x4a4636);if(nm=='boss'){shirt.set(0x3a1412);pants.set(0x1e1a1a);}if(BL){shirt.set(0x55603a);skin.set(0x8fa05a);skinD.set(0x5e6e34);}if(RUN){shirt.set(SHIRTS[(Math.random()*3)|0]);}
  if(GH){shirt.set(0x8a0c12);pants.set(0x14101a);skin.set(0xc9c2b4);skinD.set(0x8e8678);}shirtD.copy(shirt).multiplyScalar(.65);
  z.mat=z432Mat(new T.MeshLambertMaterial({vertexColors:true}));const W=V.width,TZ=TK?1.25:BL?1.15:1,H=GH?.06:RUN?.17:TK?.16:.13,AL=RUN?1.08:TK?1.12:1.05;
  const part=(parent,list,tag)=>{const m=new T.Mesh(mergePieces(list),z.mat);parent.add(m);if(tag){m.userData.z=z;m.userData.part=tag;zHitMeshes.push(m);}return m;};
  const F=y=>NZ.front(y,TZ,H)+.006,B=y=>NZ.back(y,TZ,H)-.006;
  z.body=P(z.g,0,0,0);z.hips=P(z.body,0,.95,0);
  part(z.hips,[[NZ.pelvis,pants,[0,0,0],0,0,0,W,1,.7*TZ],[NZ.patch,shirtD,[0,.07,.135*TZ],0,0,0,1.6*W,.45,1]],'body');
  const leg=(side)=>{const hip=P(z.hips,side*.11*W,-.06,0);const torn=Math.random()<.5;part(hip,[[NZ.thigh,pants,[0,0,0],0,0,0,W>1.2?1.25:1,1,1]],'limb');const knee=P(hip,0,-.46,0);
    part(knee,[[NZ.shin,torn?skin:pants,[0,0,0],0,0,0,W>1.2?1.2:1,1,1],[NZ.foot,CF,[0,-.45,.04],0,0,0,1,.55,1.6]].concat(torn?[[NZ.flap,pants,[0,-.02,.07],0,0,.3*side,.8,.6,1]]:[]),'limb');return [hip,knee];};
  [z.hipL,z.kneeL]=leg(-1);[z.hipR,z.kneeR]=leg(1);
  z.spine=P(z.hips,0,.08,0);
  const tl=[[NZ.torso(W,TZ,H),shirt,[0,0,0]],
    [NZ.patch,skin,[rand(-.06,.06)*W,.16,F(.16)],0,0,rand(-.4,.4),1.3,1,1],[NZ.patch,CW,[rand(-.1,.1)*W,.38,F(.38)],-.2,0,rand(-.5,.5),.8,.7,1],
    [NZ.flap,shirtD,[-.12*W,-.02,F(0)+.01],.1,0,rand(-.5,.5),.7,.6,1],[NZ.flap,shirtD,[.1*W,-.03,F(0)+.01],.1,0,rand(-.5,.5),.6,.7,1],[NZ.patch,CW,[rand(-.1,.1)*W,.3,B(.3)],0,0,rand(-.5,.5),1,.8,1]];
  if(Math.random()<.55&&!GH)for(let i=0;i<3;i++)tl.push([NZ.rib,CB,[.09*W,.24+i*.06,F(.24+i*.06)+.004],0,0,.1,1,1,1]);
  if(TK)tl.push([NZ.belly,skinD,[0,.55,H*.6],0,0,0,1.5*W,.55,1.05*TZ],[NZ.belly,shirtD,[0,.22,F(.22)-.12],0,0,0,1.05*W,.9,.6]);
  if(BL)tl.push([NZ.belly,new T.Color(0x7a9a38),[0,.2,F(.2)-.08],0,0,0,1.2*W,1,1],[NZ.patch,new T.Color(0x9acb3a),[0,.26,F(.2)+.1],0,0,0,1.4,1.4,1],[NZ.patch,new T.Color(0x4a6a1a),[.1,.12,F(.2)+.07],0,0,.4,.7,.7,1]);
  if(nm=='boss'){for(const sd of [-1,1])for(let i=0;i<3;i++)tl.push([NZ.tuft,CB,[sd*(.16+i*.06)*W,.6+i*.015,H*.8-.05],-.5,0,-sd*(.5+i*.3),1,1.6-i*.3,1]);}
  if(GH){const CR=new T.Color(0x5a060a),CG=new T.Color(0xd8b040),CWt=new T.Color(0xe8e2d4),CK=new T.Color(0x0c0a0e);
    tl.push([NZ.patch,CWt,[0,.48,F(.48)],0,0,0,.9,1.7,1],[NZ.patch,CR,[-.08,.36,F(.36)+.003],0,0,-.25,.55,2.2,1],[NZ.patch,CR,[.08,.36,F(.36)+.003],0,0,.25,.55,2.2,1],[NZ.patch,CK,[0,.56,F(.56)+.006],0,0,.78,.45,.45,1],[NZ.patch,CK,[0,.56,F(.56)+.006],0,0,-.78,.45,.45,1]);
    for(let i=0;i<3;i++)tl.push([NZ.rib,CG,[0,.36-i*.11,F(.36-i*.11)+.004],0,0,0,.3,1,1]);tl.push([NZ.flap,shirt,[-.12*W,-.16,B(0)],-.15,0,.1,1.1,1.4,1],[NZ.flap,shirt,[.12*W,-.16,B(0)],-.15,0,-.1,1.1,1.4,1]);}
  part(z.spine,tl,'body');
  const shY=.5,shZ=NZ.front(.5,TZ,H)-.5*.62*.2*TZ-.02;
  const arm=(side)=>{const sh=P(z.spine,side*(.27*W+.02),shY,shZ*.55);const bare=RUN||Math.random()<.45;
    part(sh,[[NZ.upper,bare?skin:shirt,[0,0,0],0,0,0,TK?1.35:1,AL,TK?1.35:1]].concat(bare?[[NZ.patch,CW,[0,-.2,.06],0,0,0,.45,.9,1]]:[]),'limb');
    const el=P(sh,0,-.41*AL,0);
    part(el,[[NZ.fore,skin,[0,0,0],0,0,0,TK?1.3:1,AL,TK?1.3:1],[NZ.hand,skinD,[0,-.42*AL,.01],0,0,0,TK?1.35:1,1.3,1.1],[NZ.claw,skinD,[-.03,-.5*AL,.04]],[NZ.claw,skinD,[0,-.51*AL,.045]],[NZ.claw,skinD,[.03,-.5*AL,.04]]],'limb');return [sh,el];};
  [z.shL,z.elL]=arm(-1);[z.shR,z.elR]=arm(1);
  z.neck=P(z.spine,0,.6,H*.9+.03);
  const hd=[[NZ.head,skin,[0,.15,0]],[NZ.cap,CD,[0,.2,-.015],-.25,0,0,Math.random()<.4?.8:1.02,.62,1.02],[NZ.socket,CM,[-.068,.18,.13],0,0,0,1,.8,.6],[NZ.socket,CM,[.068,.18,.13],0,0,0,1,.8,.6],
    [NZ.nose,Math.random()<.3?CM:skinD,[0,.12,.17]],[NZ.ear,skinD,[-.165,.15,0],0,0,0,.5,1,.8],[NZ.ear,skinD,[.165,.15,0],0,0,0,.5,1,.8],[NZ.patch,CM,[0,.05,.152],0,0,0,1.6,.6,1],[NZ.patch,CW,[(Math.random()<.5?-1:1)*.09,.09,.148],0,.4,rand(-.6,.6),.5,.5,1]];
  for(let i=0,n=2+((Math.random()*3)|0);i<n;i++)hd.push([NZ.tuft,CD,[rand(-.1,.1),.3,rand(-.1,.05)],rand(-.5,.5),0,rand(-.5,.5)]);
  part(z.neck,hd,'head');
  if(GH){if(!ZG.hat476){ZG.hat476=new T.CylinderGeometry(.5,.5,1,10);ZG.brim476=new T.CylinderGeometry(.5,.5,1,12);}const CK=new T.Color(0x0b0a0d),CB2=new T.Color(0x2a0508),CT=new T.Color(0xf0ead8),CL=new T.Color(0x6a0810);
    const h=[[ZG.brim476,CK,[0,.31,0],0,0,0,.48,.022,.46],[ZG.hat476,CK,[0,.48,0],-.06,0,.05,.31,.34,.3],[ZG.hat476,CB2,[0,.35,0],-.06,0,.05,.315,.06,.305],[NZ.patch,CM,[0,.055,.158],0,0,0,1.9,.75,1]];
    for(let i=0;i<9;i++){const x=(i-4)*.03,cy=.055+Math.abs(i-4)*Math.abs(i-4)*.0035;h.push([NZ.tooth,CT,[x,cy+.016,.165-Math.abs(i-4)*.006],0,0,0,1,1,1],[NZ.tooth,CT,[x,cy-.014,.165-Math.abs(i-4)*.006],Math.PI,0,0,1,1,1]);}
    for(const sd of [-1,1])h.push([NZ.rib,CL,[sd*.1,.1,.15],0,0,sd*.7,.6,.7,.5],[NZ.rib,CK,[sd*.07,.235,.158],0,0,sd*.32,.6,1,.5]);
    part(z.neck,h,'head');}
  const eyes=new T.Mesh(mergePieces([[ZG.eye,new T.Color(1,1,1),[-.068,.18,.152],0,0,0,.8,1,1],[ZG.eye,new T.Color(1,1,1),[.068,.18,.152],0,0,0,.8,1,1]]),eyeMat(V.eyes));z.neck.add(eyes);
  const eh=new T.Sprite(eyeHaloMat(V.eyes));eh.scale.set(.4,.2,1);eh.position.set(0,.18,.19);z.neck.add(eh);
  if(BL){z.glow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0x8aff30,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55}));z.glow.scale.set(1.5,1.5,1);z.glow.position.set(0,.25,F(.2)+.1);z.spine.add(z.glow);z.baseEm=0x1c3a06;}if(nm=='boss'){z.baseEm=0x200000;eh.scale.set(.7,.35,1);}
  z.jaw=P(z.neck,0,.06,.02);part(z.jaw,[[NZ.jaw,skinD,[0,0,.05],0,0,0,1,1,1.1],[NZ.tooth,CB,[-.04,.02,.155]],[NZ.tooth,CB,[0,.02,.16]],[NZ.tooth,CB,[.045,.02,.155]]],'head');
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

