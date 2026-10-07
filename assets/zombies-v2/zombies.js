/* Original articulated 3D zombie assets. Three.js r160; no network/loader dependency.
 * Five silhouettes, one merged vertex-colour mesh per articulated segment.
 * Coordinates in metres, forward +Z. Exported GLBs use the same named hierarchy.
 */
(function (root) {
  'use strict';
  const profiles = {
    normal: {label:'Errante', hp:90, dmg:11, speed:[1.15,1.55], limbHP:20, sight:1, hearing:1, skin:0x899581, cloth:0x626e75, pants:0x333c48, build:1},
    runner: {label:'Predatore', hp:65, dmg:8, speed:[3.15,3.75], limbHP:16, sight:1.2, hearing:1.3, skin:0xa69f88, cloth:0x823c36, pants:0x343239, build:.82},
    tank: {label:'Bruto', hp:380, dmg:26, speed:[.82,1.02], limbHP:70, sight:.85, hearing:.9, skin:0x8a8b71, cloth:0x766140, pants:0x3f4846, build:1.23},
    bloater: {label:'Infetto', hp:155, dmg:0, blastDamage:34, speed:[.9,1.1], limbHP:30, sight:.95, hearing:1.2, skin:0x8c9957, cloth:0xbbb896, pants:0x495348, build:1.05},
    boss: {label:'Abominio', hp:2600, dmg:34, speed:[1.15,1.35], limbHP:180, sight:1.1, hearing:1.4, skin:0x82756d, cloth:0x372c30, pants:0x292a2c, build:1.26}
  };
  const joints=['hipL','hipR','kneeL','kneeR','spine','shL','shR','elL','elR','neck','jaw'];
  const slots={armL:'shL',armR:'shR',legL:'hipL',legR:'hipR',head:'neck'};
  function rng(seed) {return () => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  function create(T, V, seed=60, material) {
    const p=profiles[V.name];if(!p)throw Error('Unknown zombie '+V.name);
    const r=rng(seed), z={V,seed,g:new T.Group(),alive:false,dead:false,v2:true};
    z.g.name=p.label;z.mat=material||new T.MeshLambertMaterial({vertexColors:true});
    z.parts=[];z.stumps={};z.wounds=[];
    const skin=p.skin, dark=new T.Color(skin).multiplyScalar(.68).getHex(), cloth=p.cloth, pants=p.pants;
    const blood=0x672823, flesh=0x994740, bone=0xcab995, leather=0x252726, metal=0x899394;
    const shape=new T.SphereGeometry(1,12,8), tiny=new T.SphereGeometry(1,8,6), box=new T.BoxGeometry(1,1,1);
    const cone=new T.ConeGeometry(1,1,8), cylinder=new T.CylinderGeometry(1,1,1,10);
    function pivot(parent,name,x,y,zz) {const o=new T.Group();o.name=name;o.position.set(x,y,zz);parent.add(o);return o;}
    function ell(c,x,y,zz,sx,sy,sz,rx=0,ry=0,rz=0,geo=shape) {return {geo,c,pos:[x,y,zz],scale:[sx,sy,sz],rot:[rx,ry,rz]};}
    function merge(parent, list, part, slot) {
      let count=0;const gs=list.map(s=>{
        const g=s.geo.index?s.geo.toNonIndexed():s.geo.clone();
        const q=new T.Quaternion().setFromEuler(new T.Euler(...s.rot));
        g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...s.pos),q,new T.Vector3(...s.scale)));
        count+=g.attributes.position.count;return [g,new T.Color(s.c)];
      });
      const pos=new Float32Array(count*3),normal=new Float32Array(count*3),colors=new Float32Array(count*3);let off=0;
      for(const [g,c] of gs){pos.set(g.attributes.position.array,off*3);normal.set(g.attributes.normal.array,off*3);
        for(let i=0;i<g.attributes.position.count;i++){
          // Seeded coordinate-based mottling: shared vertices keep continuous colour.
          const a=g.attributes.position;const n=.86+.12*Math.sin(a.getX(i)*91+a.getY(i)*47+a.getZ(i)*63+seed)+.06*Math.sin(a.getY(i)*123);
          colors[(off+i)*3]=c.r*n;colors[(off+i)*3+1]=c.g*n;colors[(off+i)*3+2]=c.b*n;
        }off+=g.attributes.position.count;g.dispose();
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(normal,3));geo.setAttribute('color',new T.BufferAttribute(colors,3));
      geo.computeBoundingBox();geo.computeBoundingSphere();
      const m=new T.Mesh(geo,z.mat);m.name=parent.name+'_surface';m.castShadow=true;m.receiveShadow=true;
      if(part){m.userData.part=part;m.userData.slot=slot;m.userData.z=z;z.parts.push(m);}parent.add(m);return m;
    }
    function cut(parent,slot,x,y,zz,sx,sy,sz){const m=merge(parent,[ell(blood,x,y,zz,sx,sy,sz),ell(bone,x,y+.006,zz,.032,.009,.032)]);m.visible=false;m.name='stump_'+slot;z.stumps[slot]=m;}
    const W=V.width*p.build;
    z.body=pivot(z.g,'body',0,0,0);z.hips=pivot(z.body,'hips',0,.95,0);
    merge(z.hips,[ell(pants,0,0,0,.22*W,.15,.15),ell(leather,0,.08,.135,.21*W,.024,.027),ell(metal,0,.08,.16,.034,.027,.013,0,0,0,box)],'body');
    function leg(side){const slot=side<0?'legL':'legR',hip=pivot(z.hips,side<0?'hipL':'hipR',side*.13*W,-.05,0);
      const thick=V.heavy?1.16:1;
      merge(hip,[ell(pants,0,-.22,0,.104*thick,.245,.112),ell(cloth,side*.068,-.15,.04,.036,.1,.05),ell(blood,0,-.34,.105,.054,.028,.008)],'limb',slot);
      const knee=pivot(hip,side<0?'kneeL':'kneeR',0,-.46,0);
      const bare=side>0||V.name==='runner';
      const list=[ell(bare?skin:pants,0,-.21,0,.079*thick,.225,.083),ell(dark,0,-.008,.024,.084,.047,.075),ell(leather,0,-.42,.053,.096,.067,.15),ell(0x4b4a43,0,-.472,.073,.1,.012,.158)];
      if(bare){list.push(ell(pants,0,-.07,-.03,.09,.1,.062),ell(blood,.025,-.22,.075,.028,.09,.008),ell(bone,.025,-.22,.084,.016,.07,.012));}
      merge(knee,list,'limb',slot);cut(z.hips,slot,side*.13*W,-.05,0,.102,.016,.108);return [hip,knee];}
    [z.hipL,z.kneeL]=leg(-1);[z.hipR,z.kneeR]=leg(1);
    z.spine=pivot(z.hips,'spine',0,.08,0);
    const torso=[ell(cloth,0,.29,0,.26*W,.32,V.heavy?.2:.165),ell(dark,0,.54,-.035,.25*W,.115,.16),ell(skin,0,.565,.07,.078,.072,.083)];
    // Open collar, shirt buttons, torn asymmetric hem and an exposed rib cage.
    for(const side of [-1,1])torso.push(ell(cloth,side*.058,.54,.133,.053,.09,.018,0,0,side*.35));
    for(let i=0;i<4;i++)torso.push(ell(metal,0,.4-i*.08,.163,.009,.009,.006,0,0,0,tiny));
    torso.push(ell(blood,.11*W,.31,.154,.087,.115,.034),ell(dark,-.07,.05,.14,.07,.08,.02));
    for(let i=0;i<4;i++)torso.push(ell(bone,.11*W,.26+i*.043,.179,.072,.012,.019,0,0,-.15));
    for(let i=0;i<5;i++)torso.push(ell(cloth,-.16*W+i*.075*W,-.015-r()*.035,.065,.034,.078,.09,0,0,(r()-.5)*.25));
    if(V.name==='runner'){
      torso.push(ell(0x242829,0,.32,-.17,.17,.24,.045),ell(0x949082,-.18,.36,.143,.018,.23,.015,0,0,-.18),ell(0x949082,.18,.36,.143,.018,.23,.015,0,0,.18));
    }
    if(V.name==='tank'){
      // Torn high-visibility work vest, bulky shoulders, exposed muscle.
      for(const side of [-1,1])torso.push(ell(0x95703c,side*.2,.32,.138,.1,.25,.04),ell(0xa4a895,side*.2,.34,.176,.015,.22,.009));
      torso.push(ell(0xa4a895,0,.16,.173,.29*W,.018,.014));
    }
    if(V.name==='bloater'){
      torso.push(ell(skin,0,.18,.13,.34,.31,.29),ell(dark,0,.17,.407,.024,.018,.013));
      for(let i=0;i<8;i++){const a=i*2.4;torso.push(ell(i%2?0x819342:0xaeb55f,Math.cos(a)*.23,.21+Math.sin(a)*.17,.34,.04+r()*.022,.05,.034));}
      for(const side of [-1,1])torso.push(ell(cloth,side*.31,.42,.05,.08,.22,.15,0,0,side*.3));
    }
    if(V.name==='boss'){
      torso.push(ell(dark,0,.45,-.12,.31*W,.26,.17));
      for(const side of [-1,1])for(let i=0;i<4;i++)torso.push(ell(bone,side*(.2*W+.035*i),.59+i*.033,-.04,.024,.17-i*.02,.032,0,0,-side*(.35+i*.12),cone));
      for(let i=0;i<6;i++)torso.push(ell(bone,.07,.2+i*.049,.178,.021,.008,.008,0,0,.3));
    }
    merge(z.spine,torso,'body');
    const wound=merge(z.spine,[ell(flesh,-.09,.3,.163,.055,.07,.018),ell(blood,-.09,.3,.183,.03,.04,.007)]);wound.visible=false;wound.name='impact_wound';z.wounds.push(wound);
    function arm(side){const slot=side<0?'armL':'armR',sh=pivot(z.spine,side<0?'shL':'shR',side*.31*W,.53,0),thick=V.heavy?1.35:1;
      merge(sh,[ell(skin,0,-.18,0,.078*thick,.188,.081*thick),ell(cloth,0,-.055,-.015,.102*thick,.105,.102),ell(blood,side*.066,-.25,.035,.015,.047,.03)],'limb',slot);
      const el=pivot(sh,side<0?'elL':'elR',0,-.36,0);
      const list=[ell(skin,0,-.15,0,.063*thick,.165,.069),ell(dark,0,-.005,0,.065,.06,.068),ell(dark,0,-.35,.015,.063,.08,.044)];
      for(let i=0;i<4;i++){const x=(i-1.5)*.029;list.push(ell(skin,x,-.425-.012*(i%3),.033,.014,.063,.018,-.24,0,0),ell(bone,x,-.48-.012*(i%3),.047,.012,.019,.011,0,0,0,cone));}
      list.push(ell(dark,side*.072,-.37,.016,.022,.039,.022,0,0,side*.65));
      merge(el,list,'limb',slot);cut(z.spine,slot,side*.31*W,.53,0,.018,.075,.075);return [sh,el];}
    [z.shL,z.elL]=arm(-1);[z.shR,z.elR]=arm(1);
    z.neck=pivot(z.spine,'neck',0,.62,.02);
    const head=[ell(skin,0,.155,-.012,.154,.178,.143),ell(dark,0,.17,.091,.139,.06,.07),ell(skin,-.115,.065,.079,.043,.06,.055),ell(skin,.115,.065,.079,.043,.06,.055),ell(dark,0,.05,.126,.075,.035,.032),ell(skin,0,.135,.139,.027,.05,.046),ell(dark,-.158,.145,-.003,.028,.046,.028),ell(dark,.158,.145,-.003,.028,.046,.028)];
    for(const side of [-1,1]){
      head.push(ell(0x252224,side*.067,.178,.135,.045,.031,.013),ell(0xb2b090,side*.067,.179,.145,.023,.015,.011),ell(V.eyes,side*.067,.179,.155,.011,.01,.005),ell(dark,side*.07,.209,.13,.058,.018,.026,0,0,-side*.2));
    }
    head.push(ell(blood,.1,.265,.1,.046,.05,.02),ell(bone,.1,.267,.113,.025,.028,.011));
    if(V.name==='normal')for(let i=0;i<9;i++)head.push(ell(0x363a36,(r()-.5)*.21,.285+r()*.038,-.015+(r()-.5)*.14,.037,.045,.035));
    if(V.name==='runner')head.push(ell(0x292828,0,.31,-.035,.034,.048,.135));
    if(V.name==='tank'){
      head.push(ell(0xa58949,0,.29,-.01,.186,.083,.17),ell(0x63503a,0,.256,.064,.197,.014,.181),ell(0xafa18b,0,.352,-.01,.022,.014,.13));
    }
    if(V.name==='bloater')head.push(ell(dark,.064,.034,.035,.1,.077,.09),ell(0xaca985,0,.3,-.02,.156,.046,.144));
    if(V.name==='boss')for(const side of [-1,1])head.push(ell(bone,side*.1,.26,.113,.031,.071,.019,0,0,side*.35),ell(bone,side*.145,.31,-.04,.023,.108,.026,0,0,-side*.48,cone));
    merge(z.neck,head,'head','head');
    z.jaw=pivot(z.neck,'jaw',0,.047,.025);
    const jaw=[ell(dark,0,-.022,.062,.104,.057,.082)];for(let i=0;i<6;i++)jaw.push(ell(bone,(i-2.5)*.026,.01,.137,.01,.017,.01));
    merge(z.jaw,jaw,'head','head');cut(z.spine,'head',0,.62,.02,.065,.015,.064);
    const shadowGeo=new T.CircleGeometry(.5,20);shadowGeo.rotateX(-Math.PI/2);
    z.blob=new T.Mesh(shadowGeo,new T.MeshBasicMaterial({color:0x000000,opacity:.25,transparent:true,depthWrite:false}));z.blob.position.y=.015;z.blob.scale.setScalar(W*1.1);z.g.add(z.blob);
    z.g.scale.setScalar(V.scale||1);z.g.visible=false;
    z.home={};for(const [slot,j] of Object.entries(slots))z.home[slot]={o:z[j],parent:z[j].parent,pos:z[j].position.clone(),scale:z[j].scale.clone()};
    for(const geo of [shape,tiny,box,cone,cylinder])geo.dispose();
    return z;
  }
  function reset(z) {
    z.gore={};z.limbHP={};for(const slot of Object.keys(slots))z.limbHP[slot]=profiles[z.V.name].limbHP;
    for(const h of Object.values(z.home)){h.parent.add(h.o);h.o.position.copy(h.pos);h.o.scale.copy(h.scale);h.o.rotation.set(0,0,0);h.o.visible=true;}
    for(const o of Object.values(z.stumps))o.visible=false;for(const o of z.wounds)o.visible=false;
    z.legGone=0;z.crawl=0;z.body.position.set(0,0,0);z.body.rotation.set(0,0,0);z.g.position.y=0;z.g.scale.setScalar(z.V.scale);
    z.poseV2=null;z.f43=null;z.bl=0;z._ok=0;z.v2Death=null;z.navV2=null;z.halt4310=0;
  }
  function minY(T, obj) {
    obj.updateWorldMatrix(true,true);let y=Infinity;const v=new T.Vector3();
    function scan(o,visible){visible=visible&&o.visible;if(!visible)return;
      if(o.isMesh&&o.geometry){const b=o.geometry.boundingBox;if(b)for(let i=0;i<8;i++){v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).applyMatrix4(o.matrixWorld);y=Math.min(y,v.y);}}
      for(const c of o.children)scan(c,visible);
    }scan(obj,true);return y;
  }
  // Bounded grid A*. Replans are requested by the game only for visible targets;
  // clearance callback includes map boxes, trees and player-built structures.
  function route(start, goal, free, step=2, budget=360) {
    const sx=Math.round(start.x/step),sz=Math.round(start.z/step),gx=Math.round(goal.x/step),gz=Math.round(goal.z/step);
    const key=(x,z)=>x+','+z,open=[{x:sx,z:sz,g:0,f:0,parent:null}],best=new Map([[key(sx,sz),0]]);
    const moves=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    let visits=0;
    while(open.length&&visits++<budget){let bi=0;for(let i=1;i<open.length;i++)if(open[i].f<open[bi].f)bi=i;
      const n=open.splice(bi,1)[0];if(n.g>best.get(key(n.x,n.z)))continue;
      if(Math.hypot(n.x-gx,n.z-gz)<1.6){const out=[];for(let c=n;c.parent;c=c.parent)out.push({x:c.x*step,z:c.z*step});return out.reverse();}
      for(const [dx,dz] of moves){const x=n.x+dx,z=n.z+dz;
        if(Math.abs(x-sx)>18||Math.abs(z-sz)>18||!free(x*step,z*step))continue;
        if(!free((n.x+dx*.5)*step,(n.z+dz*.5)*step))continue;
        if(dx&&dz&&(!free(x*step,n.z*step)||!free(n.x*step,z*step)))continue;
        const g=n.g+Math.hypot(dx,dz),k=key(x,z);if(g>=(best.get(k)??Infinity))continue;
        best.set(k,g);open.push({x,z,g,f:g+Math.hypot(x-gx,z-gz),parent:n});
      }
    }return [];
  }
  root.ZombieV2={profiles,joints,slots,create,reset,minY,route,rng};
})(typeof window!=='undefined'?window:globalThis);
