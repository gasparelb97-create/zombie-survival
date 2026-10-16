'use strict';
// ======================= 4.3.85 MP: remote survivor character (third person) =======================
// Hierarchical low-poly survivor: each body segment is ONE merged mesh with vertex colours (≈15 draw calls / player).
// Weapon in hand = clone of the same model the local player uses (VM[k] / hi43), without the first-person hands.
const MPChar=(()=>{
  const MAT=new T.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:.05});
  const PAL=[{jk:0x4b5a3a,hd:0x30352c,cap:0x6b2a20,pt:0x5d5443},{jk:0x2f4a66,hd:0x23303d,cap:0x23272c,pt:0x3f4246},
             {jk:0x7a3d22,hd:0x3a2a22,cap:0x3d4a2b,pt:0x4d4a3c},{jk:0x5a5a60,hd:0x2b2b30,cap:0x8a6a2a,pt:0x51473a}];
  const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_s=new T.Vector3(),_p=new T.Vector3(),_c=new T.Color();
  // parts: [geo,color,x,y,z,rx,ry,rz,sx,sy,sz]
  function merge(parts){let n=0;const gs=[];for(const pr of parts){let g=pr[0].index?pr[0].toNonIndexed():pr[0].clone();
      _e.set(pr[5]||0,pr[6]||0,pr[7]||0);_q.setFromEuler(_e);_p.set(pr[2]||0,pr[3]||0,pr[4]||0);_s.set(pr[8]||1,pr[9]||1,pr[10]||1);g.applyMatrix4(_m.compose(_p,_q,_s));gs.push([g,pr[1]]);n+=g.attributes.position.count;}
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
    for(const [g,c] of gs){const P=g.attributes.position,N=g.attributes.normal;_c.setHex(c);
      for(let i=0;i<P.count;i++){pos[o*3]=P.getX(i);pos[o*3+1]=P.getY(i);pos[o*3+2]=P.getZ(i);nor[o*3]=N.getX(i);nor[o*3+1]=N.getY(i);nor[o*3+2]=N.getZ(i);
        // subtle per-vertex shade for a worn-fabric look
        const k=.92+.08*Math.sin(P.getX(i)*41+P.getY(i)*29+P.getZ(i)*37);col[o*3]=_c.r*k;col[o*3+1]=_c.g*k;col[o*3+2]=_c.b*k;o++;}g.dispose();}
    const G2=new T.BufferGeometry();G2.setAttribute('position',new T.BufferAttribute(pos,3));G2.setAttribute('normal',new T.BufferAttribute(nor,3));G2.setAttribute('color',new T.BufferAttribute(col,3));G2.computeBoundingSphere();
    const m=new T.Mesh(G2,MAT);m.castShadow=true;return m;}
  const BX=new T.BoxGeometry(1,1,1),SP=new T.SphereGeometry(.5,10,8),CY=new T.CylinderGeometry(.5,.5,1,10),CP=new T.CapsuleGeometry(.5,1,3,8),
        CN=new T.CylinderGeometry(.42,.5,1,10);
  const SKIN=0xc89878,GLOVE=0x1d1d1f,BOOT=0x2a2018,SOLE=0x111111,VEST=0x2b2f2a,POUCH=0x7d6a4a,STRAP=0x1f1f1f,BAG=0x55603f,BAG2=0x3e4630,HAIR=0x2b1d14,BELT=0x221a12;
  const MATL=new T.MeshLambertMaterial({vertexColors:true});
  function compact(root,lite){const groups=[];root.traverse(o=>{if(o.isGroup||o===root)groups.push(o);});
    for(const g of groups){const ms=g.children.filter(c=>c.isMesh&&c.material===MAT);if(!ms.length)continue;let m=ms[0];
      if(ms.length>1){let n=0;for(const x of ms)n+=x.geometry.attributes.position.count;const A={position:new Float32Array(n*3),normal:new Float32Array(n*3),color:new Float32Array(n*3)};let o=0;
        for(const x of ms){for(const k in A)A[k].set(x.geometry.attributes[k].array,o*3);o+=x.geometry.attributes.position.count;x.geometry.dispose();g.remove(x);}
        const G2=new T.BufferGeometry();for(const k in A)G2.setAttribute(k,new T.BufferAttribute(A[k],3));G2.computeBoundingSphere();m=new T.Mesh(G2,MAT);g.add(m);}
      if(lite){m.material=MATL;m.castShadow=false;}else m.castShadow=true;}}
  function pivot(parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function build(arg){const sk=(arg&&typeof arg==='object')?arg:{};const C=Object.assign({skin:SKIN,glove:GLOVE,boot:BOOT,vest:VEST,pouch:POUCH,bag:BAG,bag2:BAG2,hair:HAIR},PAL[((typeof arg==='number'?arg:sk.slot)|0)%PAL.length],sk.palette||{});
    const PT=Object.assign({cap:true,hood:true,vest:true,backpack:true,beard:true,kneepads:true},sk.parts||{});const SKIN_=C.skin;const root=new T.Group();root.name='mpChar';
    const hips=pivot(root,0,.98,0);
    hips.add(merge([[BX,C.pt,0,-.02,0,0,0,0,.36,.2,.22],[BX,BELT,0,.07,0,0,0,0,.38,.05,.24],[BX,0x8a7a50,0,.07,-.122,0,0,0,.06,.04,.01]]));
    const spine=pivot(hips,0,.1,0),chest=pivot(spine,0,.2,0);
    chest.add(merge([[BX,C.jk,0,0,0,0,0,0,.42,.46,.24],[CP,C.jk,0,.2,0,0,0,Math.PI/2,.2,.2,.2],[BX,0x4a4a48,0,-.22,0,0,0,0,.43,.04,.25]]));
    if(PT.vest)chest.add(merge([[BX,C.vest,0,.02,-.005,0,0,0,.44,.36,.27],[BX,C.pouch,-.1,-.08,-.14,0,0,0,.09,.1,.04],[BX,C.pouch,0,-.08,-.14,0,0,0,.08,.1,.04],[BX,C.pouch,.1,-.08,-.14,0,0,0,.09,.1,.04],
      [BX,0x9a8a5a,.13,.11,-.14,0,0,0,.08,.05,.02],[BX,STRAP,-.14,.12,-.13,0,0,0,.05,.22,.02],[BX,STRAP,.14,.12,-.13,0,0,0,.05,.22,.02]]));
    if(PT.hood)chest.add(merge([[CY,C.hd,0,.26,.04,.3,0,0,.26,.12,.24],[BX,C.hd,0,.24,.13,0,0,0,.3,.14,.06]]));
    if(PT.backpack)chest.add(merge([ // backpack: body, lid, side pockets, bedroll, straps
      [BX,C.bag,0,.0,.21,0,0,0,.34,.42,.17],[BX,C.bag2,0,.2,.2,0,0,0,.35,.08,.19],[BX,C.bag2,-.19,-.06,.21,0,0,0,.05,.2,.12],[BX,C.bag2,.19,-.06,.21,0,0,0,.05,.2,.12],
      [BX,C.bag2,0,-.1,.305,0,0,0,.24,.16,.04],[CY,0x6a3a2a,0,-.27,.22,0,0,Math.PI/2,.14,.38,.14],[BX,STRAP,-.1,.05,.12,0,0,0,.04,.4,.02],[BX,STRAP,.1,.05,.12,0,0,0,.04,.4,.02]]));
    const neck=pivot(chest,0,.27,0),head=pivot(neck,0,.06,0);
    const face=[[SP,SKIN_,0,.13,0,0,0,0,.2,.24,.22],[SP,SKIN_,0,.06,-.02,0,0,0,.17,.14,.18],[CY,SKIN_,0,-.03,0,0,0,0,.09,.08,.09], // skull, jaw, neck
      [SP,0xb88a6c,-.06,.09,-.085,0,0,0,.06,.04,.05],[SP,0xb88a6c,.06,.09,-.085,0,0,0,.06,.04,.05], // cheeks
      [SP,0xf2eee8,-.045,.14,-.098,0,0,0,.045,.032,.02],[SP,0xf2eee8,.045,.14,-.098,0,0,0,.045,.032,.02], // eye whites
      [SP,0x3b2a1a,-.045,.14,-.107,0,0,0,.024,.026,.012],[SP,0x3b2a1a,.045,.14,-.107,0,0,0,.024,.026,.012], // irises
      [BX,0x2e1f15,-.047,.168,-.104,0,0,.12,.055,.014,.012],[BX,0x2e1f15,.047,.168,-.104,0,0,-.12,.055,.014,.012], // brows
      [BX,0xb88466,0,.115,-.112,-.25,0,0,.032,.055,.03],[SP,0xb07c5e,0,.092,-.118,0,0,0,.04,.022,.025], // nose bridge + tip
      [BX,0x8a5040,0,.058,-.1,0,0,0,.055,.012,.012], // mouth
      [BX,C.hair,-.098,.15,-.01,0,0,0,.02,.07,.06],[BX,C.hair,.098,.15,-.01,0,0,0,.02,.07,.06],[SP,C.hair,0,.17,.035,0,0,0,.215,.19,.19],[SP,C.hair,0,.2,0,0,0,0,.2,.1,.2], // sideburns, hair
      [SP,SKIN_,-.1,.13,.005,0,0,0,.035,.065,.045],[SP,SKIN_,.1,.13,.005,0,0,0,.035,.065,.045], // ears
      ];
    if(PT.beard)face.push([SP,C.hair,0,.045,-.035,0,0,0,.175,.1,.17],[BX,C.hair,0,.075,-.103,0,0,0,.07,.014,.01]);
    if(PT.cap)face.push([SP,C.cap,0,.215,.005,0,0,0,.225,.13,.235],[CY,C.cap,0,.205,-.125,-.2,0,0,.19,.014,.12],[BX,0x2a2a2a,0,.175,-.1,0,0,0,.2,.012,.02],[BX,0xdddddd,0,.255,-.105,-.3,0,0,.05,.03,.01]);
    head.add(merge(face));
    const arms=[],legs=[];
    for(const sd of [-1,1]){const sh=pivot(chest,sd*.27,.17,0);
      sh.add(merge([[SP,C.jk,0,0,0,0,0,0,.15,.15,.15],[CP,C.jk,0,-.15,0,0,0,0,.12,.17,.12],[BX,VEST,0,.02,0,0,0,0,.1,.06,.16]]));
      const el=pivot(sh,0,-.3,0);
      el.add(merge([[CP,C.jk,0,-.12,0,0,0,0,.105,.15,.105],[CY,0x2a2a28,0,-.25,0,0,0,0,.1,.04,.1]]));
      const hand=pivot(el,0,-.3,0);
      hand.add(merge([[BX,C.glove,0,-.03,0,0,0,0,.08,.1,.1],[BX,C.glove,0,-.07,-.02,.4,0,0,.07,.05,.08],[BX,0x3a3a3a,0,0,.0,0,0,0,.085,.03,.105]]));
      arms.push({sh,el,hand});
      const hp=pivot(hips,sd*.1,-.08,0);
      hp.add(merge([[CP,C.pt,0,-.2,0,0,0,0,.15,.25,.15],[BX,C.pt,sd*.08,-.24,0,0,0,0,.04,.14,.11],[BX,STRAP,sd*.08,-.18,0,0,0,0,.045,.015,.115]])); // cargo pocket
      const kn=pivot(hp,0,-.43,0);
      kn.add(merge([[CP,C.pt,0,-.17,0,0,0,0,.13,.22,.13],...(PT.kneepads?[[BX,0x3a3530,0,-.02,-.06,0,0,0,.1,.08,.03]]:[])])); // knee pad
      const ft=pivot(kn,0,-.4,0);
      ft.add(merge([[BX,C.boot,0,-.04,-.04,0,0,0,.13,.14,.25],[CY,C.boot,0,.06,0,0,0,0,.13,.12,.14],[BX,SOLE,0,-.105,-.04,0,0,0,.14,.03,.27],[BX,0x6a5a40,0,.03,-.13,0,0,0,.08,.01,.06]]));
      legs.push({hp,kn,ft});}
    const grip=pivot(arms[1].hand,0,-.07,-.02);
    const ch={root,hips,spine,chest,neck,head,arms,legs,grip,wk:null,wId:'',ph:0,amp:0,shootT:9,swingT:9,hitT:9,dead:0,deadT:0,aim:0};
    compact(root,!!sk.lite);
    if(Array.isArray(sk.extra))for(const e of sk.extra){try{const bn=ch[e.bone]||chest;if(e.mesh)bn.add(e.mesh);}catch(x){}}
    root.userData.mpc=ch;return ch;}
  // third-person weapon = same model as the local first-person one, with the FP hands/sleeves stripped
  const cache={};
  function weaponModel(k){try{if(!cache[k]){const vm=typeof VM!=='undefined'&&VM[k];if(!vm)return null;try{if(typeof vmBuild43==='function')vmBuild43(k);}catch(e){}
      const hi=vm.userData.hi43,src=hi&&hi.g?hi.g:vm;const g=src.clone(true);const strip=[];
      const handM=[typeof gloveM!=='undefined'&&gloveM,typeof sleeveM!=='undefined'&&sleeveM,typeof skinM!=='undefined'&&skinM].filter(Boolean);
      g.traverse(o=>{if(o.isSprite){o.visible=false;return;}if(o.isMesh){if(handM.indexOf(o.material)>=0)strip.push(o);o.castShadow=true;}});for(const o of strip)o.visible=false;
      g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);g.visible=true;
      const b=new T.Box3().setFromObject(g),len=Math.max(.05,b.max.z-b.min.z);const W=WEAPONS.find(w=>w.id===k)||{};
      cache[k]={g,len,melee:!!W.melee,two:!W.melee&&len>.42,muz:b.min.z};}
    const c=cache[k];return {g:c.g.clone(true),len:c.len,melee:c.melee,two:c.two,muz:c.muz};}catch(e){return null;}}
  const flashM=new T.SpriteMaterial({map:typeof flashTex!=='undefined'?flashTex:null,color:0xffc060,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0});
  function setWeapon(ch,k){if(ch.wId===k)return;ch.wId=k;if(ch.wk){ch.grip.remove(ch.wk.g);ch.wk=null;}const w=weaponModel(k);if(!w)return;
    // first-person models are sized for the camera: scale to a believable world length
    const want=w.melee?(k==='knife'?.44:.62):(w.two?.85:.3),s=want/w.len;w.g.scale.setScalar(s);w.g.position.set(0,0,0);
    const fl=new T.Sprite(flashM.clone());fl.scale.set(.45,.45,1);fl.position.set(0,.02,w.muz*s-.04);w.g.add(fl);w.fl=fl;
    ch.grip.add(w.g);ch.wk=w;}
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  // st: {spd (m/s), pitch, shoot (bool pulse), swing (pulse), hit (pulse), dead}
  function animate(ch,dt,st){const t=(ch.t=(ch.t||0)+dt);const run=Math.min(1,(st.spd||0)/6.6),mv=Math.min(1,(st.spd||0)/2.2);
    ch.amp+=(mv-ch.amp)*Math.min(1,dt*8);ch.ph+=dt*(4.5+run*5);const a=ch.amp,s=Math.sin(ch.ph),c=Math.cos(ch.ph);
    ch.shootT+=dt;ch.swingT+=dt;ch.hitT+=dt;
    const L=ch.legs,A=ch.arms,w=ch.wk,two=w&&w.two,mel=w&&w.melee,P=Math.max(-1.2,Math.min(1.2,st.pitch||0));
    // conventions: character faces -Z; +rot.x swings a hanging limb forward; knees bend with -rot.x
    if(st.dead){ch.deadT=Math.min(1,ch.deadT+dt*1.6);const k=ease(ch.deadT);ch.hips.position.y=.98-.8*k;ch.hips.rotation.set(1.45*k,0,0);ch.spine.rotation.set(0,0,0);ch.chest.rotation.x=0;
      L[0].hp.rotation.x=L[1].hp.rotation.x=-.5*k;L[0].kn.rotation.x=L[1].kn.rotation.x=-.4*k;A[0].sh.rotation.set(2.6*k,0,-.4*k);A[1].sh.rotation.set(2.4*k,0,.4*k);if(w&&w.fl)w.fl.material.opacity=0;return;}
    ch.deadT=0;
    const st1=(.5+run*.35)*a;
    for(let i=0;i<2;i++){const q=i?-s:s,lc=i?-c:c;L[i].hp.rotation.set(q*st1+.03,0,(i?1:-1)*.03);L[i].kn.rotation.x=-(Math.max(0,lc)*(.9+run*.5)*a+.06);L[i].ft.rotation.x=-L[i].kn.rotation.x*.4-q*.12*a;}
    const bob=Math.abs(c)*.05*a,breathe=Math.sin(t*1.8)*.008*(1-a);
    ch.hips.position.y=.98-bob*.6-run*.05;ch.hips.rotation.set(0,s*.08*a,0);
    ch.spine.rotation.set(-.05-run*.18,-s*.08*a,0);ch.chest.position.y=.2+breathe;
    const hk=ch.hitT<.35?Math.sin(ch.hitT/.35*Math.PI):0;ch.spine.rotation.x+=hk*.35;ch.spine.rotation.z=hk*.12;
    ch.chest.rotation.x=P*.4;ch.neck.rotation.x=-P*.1;const head=P*.5-ch.spine.rotation.x;ch.head.rotation.x=head*.6;
    const kick=ch.shootT<.12?(1-ch.shootT/.12):0;const base=ch.spine.rotation.x+ch.chest.rotation.x;
    if(!w){A[0].sh.rotation.set(-s*.6*a,0,-.1);A[1].sh.rotation.set(s*.6*a,0,.1);A[0].el.rotation.x=A[1].el.rotation.x=.25+.3*a;}
    else if(mel){const sw=ch.swingT<.45?ch.swingT/.45:1,wind=sw<.3?ease(sw/.3):1-ease((sw-.3)/.7),strike=sw<.3?0:Math.sin(Math.min(1,(sw-.3)/.4)*Math.PI);
      A[1].sh.rotation.set(.5+P*.3+wind*1.9-strike*1.1-s*.12*a,.1-strike*.5,.12+wind*.2);A[1].el.rotation.set(.9-wind*.4+strike*.4,0,0);
      A[0].sh.rotation.set(-s*.5*a+.1,0,-.12);A[0].el.rotation.x=.35;ch.grip.rotation.set(1.35+Math.PI,0,0);}
    else{const two_=two;const aimX=Math.PI/2+P-base;
      if(two_){A[1].sh.rotation.set(aimX-.45,0,-.12);A[1].el.rotation.set(.8,0,0);A[0].sh.rotation.set(aimX-.15,0,.62);A[0].el.rotation.set(.35,0,0);}
      else{A[1].sh.rotation.set(aimX,0,-.12);A[1].el.rotation.set(0,0,0);A[0].sh.rotation.set(aimX-.05,0,.42);A[0].el.rotation.set(.3,0,0);}
      A[1].sh.rotation.x-=kick*.12;
      const chain=base+A[1].sh.rotation.x+A[1].el.rotation.x;ch.grip.rotation.set(P-chain+kick*.15,two_?-.12:0,0);
      if(two_)ik(ch,A[0],w,.42);else ik(ch,A[0],w,.92);}
    if(w&&w.fl){w.fl.material.opacity=ch.shootT<.06?1:0;w.fl.material.rotation=Math.random()*6;}}
  // 2-bone IK: put the support hand on the weapon (fraction f of its length from the back of the gun)
  const _t=new T.Vector3(),_d=new T.Vector3(),_dn=new T.Vector3(0,-1,0),_qa=new T.Quaternion(),_qb=new T.Quaternion(),_x=new T.Vector3(1,0,0);
  function ik(ch,arm,w,f){try{ch.root.updateMatrixWorld(true);const g=w.g,b=w.box||(w.box=new T.Box3().setFromObject(g.clone()));
      // local point on the weapon: just under the barrel/handguard
      const s=g.scale.x||1;_t.set(0,(b.min.y/s)*.45,w.muz*f+(1-f)*(b.max.z/s)).multiplyScalar(1);g.localToWorld(_t);ch.chest.worldToLocal(_t);
      _d.copy(_t).sub(arm.sh.position);const u=.3,fo=.34;let L=_d.length();L=Math.min(Math.max(L,.12),u+fo-.005);_d.normalize();
      const ca=Math.max(-1,Math.min(1,(u*u+L*L-fo*fo)/(2*u*L))),al=Math.acos(ca),cb=Math.max(-1,Math.min(1,(u*u+fo*fo-L*L)/(2*u*fo))),be=Math.PI-Math.acos(cb);
      _qa.setFromUnitVectors(_dn,_d);_qb.setFromAxisAngle(_x,-al);arm.sh.quaternion.copy(_qa).multiply(_qb);arm.el.rotation.set(be,0,0);}catch(e){}}
  function pulse(ch,what){if(what==='shoot')ch.shootT=0;else if(what==='swing')ch.swingT=0;else if(what==='hit')ch.hitT=0;}
  // floating name tag
  function nameTag(name,col){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(10,14,20,.72)';
    const w=Math.min(250,40+g.measureText?(g.font='bold 30px system-ui',g.measureText(name).width+30):200);g.beginPath();g.roundRect?g.roundRect((256-w)/2,6,w,48,12):g.rect((256-w)/2,6,w,48);g.fill();
    g.fillStyle=col||'#ffd27a';g.font='bold 30px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(String(name).slice(0,16),128,31);
    const tx=new T.CanvasTexture(c);try{tx.colorSpace=T.SRGBColorSpace;}catch(e){}const sp=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:false,transparent:true}));sp.scale.set(1.1,.275,1);sp.position.y=2.15;sp.renderOrder=999;return sp;}
  function dispose(ch){try{ch.root.traverse(o=>{if(o.isMesh&&o.geometry&&(o.material===MAT||o.material===MATL))o.geometry.dispose();if(o.isSprite&&o.material.map&&o.material.map.isCanvasTexture)o.material.map.dispose();});}catch(e){}}
  // public API (MP co-op, Arena, future skins).
  // skin = {slot, palette:{jk,hd,cap,pt,skin,hair,glove,boot,vest,pouch,bag,bag2}, parts:{cap,hood,vest,backpack,beard,kneepads}, extra:[{bone,mesh}]}
  function createSurvivor(o){o=o||{};const ch=build(o.skin||o.slot||0);if(o.name){ch.tag=nameTag(o.name,o.tagColor);ch.root.add(ch.tag);}if(o.weapon)setWeapon(ch,o.weapon);
    ch.setWeapon=k=>setWeapon(ch,k);ch.setPose=(dt,st)=>animate(ch,dt,st);ch.pulse=w=>pulse(ch,w);ch.dispose=()=>dispose(ch);return ch;}
  return {createSurvivor,build,setWeapon,animate,setPose:animate,pulse,nameTag,dispose,PAL};})();
window.MPChar=MPChar;
