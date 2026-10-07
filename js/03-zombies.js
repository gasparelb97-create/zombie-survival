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
    const cnt=g.attributes.position.count;for(let i=0;i<cnt;i++){const sh=.92+Math.random()*.16;col[(o+i)*3]=c.r*sh;col[(o+i)*3+1]=c.g*sh;col[(o+i)*3+2]=c.b*sh;}o+=cnt;g.dispose();}
  const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('color',new T.BufferAttribute(col,3));out.computeBoundingSphere();return out;}
function P(parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
const CW=new T.Color(0x4a0808),CB=new T.Color(0xcfc6a8),CM=new T.Color(0x120404),CD=new T.Color(0x151215),CF=new T.Color(0x18181a);
function z432Mat(m){m.onBeforeCompile=sh=>{sh.uniforms.uZ432=Z432.u;sh.fragmentShader='uniform vec4 uZ432;\n'+sh.fragmentShader.replace('#include <fog_fragment>','{vec3 vd432=normalize(vViewPosition);float fr432=1.-clamp(abs(dot(normalize(normal),vd432)),0.,1.);fr432*=fr432;gl_FragColor.rgb*=1.-uZ432.x*fr432;gl_FragColor.rgb+=vec3(.55,.68,1.)*(uZ432.y*fr432*fr432);}\n'+T.ShaderChunk.fog_fragment.replace(/fogColor,\s*fogFactor\s*\)/,'fogColor, fogFactor*uZ432.z )'));};m.customProgramCacheKey=()=>'z432';return m;}
function makeZombie(vName){const V=VARIANTS[vName];const z={V,g:new T.Group(),alive:false,dead:false,seed:Math.random()*100};
  const skin=(()=>{const r=Math.random();return r<.3?new T.Color().setHSL(rand(.2,.3),rand(.12,.24),rand(.22,.32)):r<.55?new T.Color().setHSL(rand(.55,.62),rand(.05,.12),rand(.26,.36)):new T.Color().setHSL(rand(.04,.14),rand(.12,.3),rand(.2,.34));})(),skinD=skin.clone().multiplyScalar(.62),
   shirt=new T.Color(SHIRTS[(Math.random()*SHIRTS.length)|0]).multiplyScalar(rand(.7,1)),pants=new T.Color(PANTS[(Math.random()*PANTS.length)|0]);
  if(V.heavy)shirt.set(0x3a3a30);if(V.name=='boss'){shirt.set(0x3a1412);pants.set(0x1e1a1a);}if(V.name=='bloater')shirt.copy(skin).multiplyScalar(.8);
  z.mat=z432Mat(new T.MeshLambertMaterial({vertexColors:true}));const W=V.width,TZ=V.heavy?1.25:1;
  const part=(parent,list,tag)=>{const m=new T.Mesh(mergePieces(list),z.mat);parent.add(m);if(tag){m.userData.z=z;m.userData.part=tag;zHitMeshes.push(m);}return m;};
  z.body=P(z.g,0,0,0);z.hips=P(z.body,0,.95,0);
  part(z.hips,[[ZG.pelvis,pants,[0,0,0],0,0,0,W,1,1]],'body');
  const leg=(side)=>{const hip=P(z.hips,side*.12*W,-.05,0);part(hip,[[ZG.thigh,pants,[0,0,0]]],'limb');const knee=P(hip,0,-.46,0);const torn=Math.random()<.5;
    part(knee,[[ZG.shin,torn?skin:pants,[0,0,0]],[ZG.foot,CF,[0,-.44,0]]].concat(torn?[[ZG.rag,pants,[0,-.02,.08],0,0,.3,.8,1,1]]:[]),'limb');return [hip,knee];};
  [z.hipL,z.kneeL]=leg(-1);[z.hipR,z.kneeR]=leg(1);
  z.spine=P(z.hips,0,.08,0);
  const tl=[[ZG.torso,shirt,[0,0,0],0,0,0,W,1,TZ],[ZG.belly,skin,[rand(-.08,.08)*W,.12,.135*TZ]],[ZG.belly,CW,[rand(-.12,.12)*W,rand(.3,.45),.142*TZ],0,0,0,.45,.8,1],
    [ZG.rag,shirt,[rand(-.15,.15)*W,-.02,.13*TZ],0,0,rand(-.4,.4)],[ZG.hem,shirt.clone().multiplyScalar(.6),[-.17*W,-.04,.142*TZ],0,0,rand(-.5,.5)],[ZG.hem,shirt.clone().multiplyScalar(.7),[.05*W,-.05,.142*TZ],0,0,rand(-.5,.5)],[ZG.hem,shirt.clone().multiplyScalar(.6),[.19*W,-.03,-.142*TZ],0,0,rand(-.5,.5)],[ZG.belly,skin,[rand(-.15,.15)*W,rand(.42,.52),.142*TZ],0,0,rand(-.5,.5),.32,.6,1],[ZG.belly,CW,[rand(-.15,.15)*W,rand(.05,.2),-.142*TZ],0,0,rand(-.5,.5),.5,.7,1],[ZG.belly,skinD,[-.12*W,.4,-.142*TZ],0,0,.3,.6,.9,1]];
  if(Math.random()<.6)for(let i=0;i<3;i++)tl.push([ZG.rib,CB,[.1*W,.36+i*.07,.15*TZ]]);
  tl.push([ZG.belly,CW,[.04*W,.26,.15*TZ],0,0,.15,.42,.55,1],[ZG.rib,CB,[.15*W,.4,.125*TZ],0,0,.3,.75,2.5,1]);
  if(V.heavy)tl.push([ZG.torso,skinD,[0,.45,-.05],0,0,0,W*1.05,.35,1.1*TZ]);
  if(V.name=='bloater')tl.push([ZG.torso,new T.Color(0x7a9a38),[0,.18,.07],0,0,0,W*1.12,.78,1.75],[ZG.belly,new T.Color(0x9acb3a),[0,.32,.29],0,0,0,1.2,1.6,1],[ZG.belly,new T.Color(0x4a6a1a),[.1,.15,.3],0,0,0,.5,.6,1]);
  if(V.name=='boss'){for(const sd of [-1,1])for(let i=0;i<3;i++)tl.push([ZG.rib,CB,[sd*(.18+i*.07)*W,.66+i*.02,-.02],0,0,sd*(.4+i*.25),1.1,3.2-i*.6,1.4]);tl.push([ZG.belly,CW,[-.1,.3,.15],0,0,.4,.8,1.4,1]);}
  part(z.spine,tl,'body');
  const arm=(side)=>{const sh=P(z.spine,side*(.31*W),.55,0);const bare=Math.random()<.45;part(sh,[[ZG.upper,bare?skin:shirt,[0,0,0]]].concat(bare?[[ZG.rib,CW,[0,-.2,.066],0,0,0,.6,1.4,1]]:[]),'limb');
    const el=P(sh,0,-.36,0);part(el,[[ZG.fore,skin,[0,0,0]],[ZG.hand,skinD,[0,-.34,0]],[ZG.finger,skinD,[-.035,-.44,.04]],[ZG.finger,skinD,[0,-.45,.04]],[ZG.finger,skinD,[.035,-.44,.04]]],'limb');return [sh,el];};
  [z.shL,z.elL]=arm(-1);[z.shR,z.elR]=arm(1);
  z.neck=P(z.spine,0,.62,.02);
  part(z.neck,[[ZG.head,skin,[0,0,0]],[ZG.scalp,CD,[0,.31,-.04],0,0,0,Math.random()<.4?.6:1,1,1],[ZG.brow,skinD,[0,.22,.155]],[ZG.ear,skinD,[-.17,.15,0]],[ZG.ear,skinD,[.17,.15,0]],[ZG.mouth,CM,[0,.05,.162]],[ZG.belly,CW,[.08,.26,.14],0,0,0,.3,.4,1],[ZG.sock,CM,[-.075,.18,.158]],[ZG.sock,CM,[.075,.18,.158]],[ZG.nose,Math.random()<.3?CM:skinD,[0,.12,.168]],[ZG.belly,skinD,[-.1,.1,.157],0,0,0,.28,.4,1],[ZG.belly,skinD,[.1,.1,.157],0,0,0,.28,.4,1],[ZG.belly,CW,[(Math.random()<.5?-1:1)*.1,.08,.163],0,0,rand(-.6,.6),.24,.32,1],[ZG.belly,CM,[0,.235,.16],0,0,rand(-.2,.2),.35,.18,1]].concat(Array.from({length:2+((Math.random()*4)|0)},()=>[ZG.tuft,CD,[rand(-.12,.12),rand(.3,.33),rand(-.12,.08)],rand(-.4,.4),rand(-1,1),rand(-.4,.4)])),'head');
  const eyes=new T.Mesh(mergePieces([[ZG.eye,new T.Color(1,1,1),[-.075,.18,.162]],[ZG.eye,new T.Color(1,1,1),[.075,.18,.162]]]),eyeMat(V.eyes));z.neck.add(eyes);
  const eh=new T.Sprite(eyeHaloMat(V.eyes));eh.scale.set(.4,.2,1);eh.position.set(0,.18,.19);z.neck.add(eh);
  if(V.name=='bloater'){z.glow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0x8aff30,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55}));z.glow.scale.set(1.5,1.5,1);z.glow.position.set(0,.3,.22);z.spine.add(z.glow);z.baseEm=0x1c3a06;}if(V.name=='boss'){z.baseEm=0x200000;eh.scale.set(.7,.35,1);}
  z.jaw=P(z.neck,0,.06,.02);part(z.jaw,[[ZG.jaw,skinD,[0,0,0]],[ZG.teeth,CB,[0,.005,.185]]],'head');
  z.g.scale.setScalar(V.scale);
  z.blob=new T.Mesh(ZG.blob,blobMat);z.blob.position.y=.02;z.blob.scale.setScalar(W*1.1);z.g.add(z.blob);
  scene.add(z.g);z.g.visible=false;zombies.push(z);return z;}
for(let i=0;i<7;i++)makeZombie('normal');for(let i=0;i<5;i++)makeZombie('runner');for(let i=0;i<3;i++)makeZombie('tank');for(let i=0;i<3;i++)makeZombie('bloater');makeZombie('boss');
// v4.3.66: bigger pool so more zombies can be alive at once
for(let i=0;i<12;i++)makeZombie('normal');for(let i=0;i<4;i++)makeZombie('runner');
function resetPose(z){z.body.rotation.set(0,0,0);z.body.position.set(0,0,0);z.hips.position.y=.95;z.hips.rotation.set(0,0,0);for(const k of ['hipL','hipR','kneeL','kneeR','spine','shL','shR','elL','elR','neck','jaw'])z[k].rotation.set(0,0,0);}
function spawnZombie(vName){let z=zombies.find(q=>!q.alive&&q.V.name===vName);if(!z&&vName!=='boss')z=zombies.find(q=>!q.alive&&q.V.name==='normal')||zombies.find(q=>!q.alive&&!q.V.special);if(!z)return false;
  let x,zz;{const sp=SPAWN_AT||svSpawnPos(20,30,player.pos.x,player.pos.z)||{x:clamp(player.pos.x+24,-HALF+2,HALF-2),z:player.pos.z};x=sp.x;zz=sp.z;}LAST_Z=z;
  const V=z.V,wm=1+Math.min(.5,(game.wave-1)*.07);
  Object.assign(z,{alive:true,dead:false,hp:V.hp*(V.name==='boss'?1+(game.wave/5-1)*.6:1+(game.wave-1)*.15)*DIFF().hp,speed:rand(V.speed[0],V.speed[1])*(V.name==='boss'?1:wm)*DIFF().spd,state:'walk',atkT:0,atkHit:false,cool:0,stag:0,stagHead:0,flash:0,deadT:0,groanT:rand(1,4),phase:Math.random()*6,stuck:0,side:0,sideT:0,limp:V.name=='normal'&&Math.random()<.5?rand(.3,.6):0});
  z.maxHp=z.hp;z.g.position.set(x,0,zz);resetPose(z);z.blob.visible=true;z.g.visible=true;z.mat.emissive.setHex(z.baseEm||0);spawnExtra(z);return true;}

