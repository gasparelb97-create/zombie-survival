/* Zombie V2 animation, hit anatomy, bounded debris physics and local navigation. */
(function(root){
  'use strict';
  const Z=root.ZombieV2, smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const mix=(a,b,k)=>a+(b-a)*k;
  function pose(z,t){
    const g=z.gore||{},ph=z.phase||0,s=Math.sin(ph),c=Math.cos(ph),run=z.V.name==='runner',heavy=!!z.V.heavy;
    const amp=z.moveV2??1;
    if(z.crawl){
      const k=smooth((z.crawlT||0)/.38),pull=Math.sin(ph),bite=z.state==='atk'?Math.sin(Math.PI*smooth((z.atkT-.22)/.52)):0;
      z.hips.position.y=mix(.9,.25+Math.max(0,pull)*.018,k);z.hips.rotation.set(mix(0,1.48-bite*.16,k),pull*.045*k,0);
      z.spine.rotation.set(.08-bite*.2,pull*.045,0);
      for(const [slot,j,el,sgn] of [['armL','shL','elL',1],['armR','shR','elR',-1]])if(!g[slot]){
        z[j].rotation.set(-2.1+Math.sin(ph+(sgn<0?Math.PI:0))*.6-bite*.2,sgn*.16,sgn*.22);
        z[el].rotation.x=-.7-Math.max(0,Math.cos(ph+(sgn<0?Math.PI:0)))*.65;
        if(z.slamS>0){const wind=smooth(z.slamS/1.2);z[j].rotation.x=z.slamS<1.2?mix(-1.8,-3,wind):mix(-3,-1.5,smooth((z.slamS-1.2)/.22));}
      }
      for(const [slot,j,knee,side] of [['legL','hipL','kneeL',1],['legR','hipR','kneeR',-1]])if(!g[slot]){
        z[j].rotation.set(.16,side*.14,side*.1);z[knee].rotation.x=.25;
      }
      if(!g.head)z.neck.rotation.set(-1.32+bite*.12,Math.sin(t*.55+z.seed)*.07,0);
    }else if(z.state==='atk'){
      const wind=heavy?.5:.32,strike=.18,recover=.4,a=z.atkT||0;
      let k=a<wind?smooth(a/wind):a<wind+strike?smooth((a-wind)/strike):smooth((a-wind-strike)/recover);
      const sp=a<wind?mix(.25,-.24,k):a<wind+strike?mix(-.24,.72,k):mix(.72,.25,k);
      const sh=a<wind?mix(-.8,-2.6,k):a<wind+strike?mix(-2.6,-.5,k):mix(-.5,-.8,k);
      z.hips.position.y=.91;z.hips.rotation.set(0,Math.sin(a*5)*.1,0);z.spine.rotation.set(sp,0,0);
      for(const [slot,j,e,side] of [['armL','shL','elL',1],['armR','shR','elR',-1]])if(!g[slot]){z[j].rotation.set(sh,side*.04,side*.18);z[e].rotation.x=-.48;}
      z.hipL.rotation.x=-.22;z.hipR.rotation.x=.25;z.kneeL.rotation.x=.18;z.kneeR.rotation.x=.34;
      if(!g.head)z.neck.rotation.set(-.28,0,0);
    }else{
      const swing=(run?.86:heavy?.38:.5)*amp;
      z.hips.position.y=.935+Math.abs(s)*.018*amp;z.hips.rotation.set(0,s*.08*amp,s*.055*amp);
      z.spine.rotation.set((run?.37:heavy?.1:.17)+Math.sin(ph*2)*.017*amp,-s*.06*amp,-s*.025*amp);
      for(const [slot,hip,knee,side] of [['legL','hipL','kneeL',1],['legR','hipR','kneeR',-1]])if(!g[slot]){
        z[hip].rotation.set(side*s*swing,0,side*.035);z[knee].rotation.x=.08+Math.max(0,-side*c)*(run?1.05:.65)*amp;
      }
      for(const [slot,j,e,side] of [['armL','shL','elL',1],['armR','shR','elR',-1]])if(!g[slot]){
        z[j].rotation.set((run?-.42:-.72)-side*s*(run?.83:.22)*amp,side*.03,side*.14);z[e].rotation.x=(run?-.95:-.38)+side*c*.07*amp;
      }
      if(!g.head)z.neck.rotation.set(run?-.35:-.13,Math.sin(t*.6+z.seed)*.1,s*.035*amp);
    }
    if(!g.head)z.jaw.rotation.x=z.state==='atk'?.4:.14+Math.max(0,Math.sin(t*1.8+z.seed))*.16;
    if(z.stag>0){z.spine.rotation.x-=Math.min(.5,z.stag*1.8);if(!g.head)z.neck.rotation.x-=Math.min(.4,z.stagHead*.35);}
  }
  function deathPose(z,k,dir=1){
    const g=z.gore||{},fall=smooth((k-.07)/.66),buck=smooth(k/.22)*(1-fall),side=z.v2Death?.side||0;
    z.hips.position.y=(z.crawl?.27:.92)-buck*.25;z.hips.rotation.set(z.crawl?1.46:0,0,0);
    z.body.rotation.set((z.crawl?.12:1.47)*fall*dir,0,side*fall);
    z.spine.rotation.set(.12*fall*dir,0,0);
    for(const [slot,j,knee,sign] of [['legL','hipL','kneeL',1],['legR','hipR','kneeR',-1]])if(!g[slot]){z[j].rotation.x=-buck*.65+fall*sign*.14;z[knee].rotation.x=buck*1.1+fall*.18;}
    for(const [slot,j,e,side] of [['armL','shL','elL',1],['armR','shR','elR',-1]])if(!g[slot]){z[j].rotation.set(-.35*fall,0,side*.34*fall);z[e].rotation.x=-.3*fall;}
    if(!g.head){z.neck.rotation.set(-dir*.3*fall,0,(z.v2Death?.headTilt||.1)*fall);z.jaw.rotation.x=.38*fall;}
  }
  function install(T,E){
    const debris=[], vec=new T.Vector3();let acc=0;
    const parentVisible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
    function removeDebris(d){if(d.o.parent)d.o.parent.remove(d.o);if(d.owned)d.o.geometry.dispose();}
    function clearOwner(z){for(let i=debris.length-1;i>=0;i--)if(debris[i].z===z){removeDebris(debris[i]);debris.splice(i,1);}}
    function clear(){for(const d of debris)removeDebris(d);debris.length=0;acc=0;}
    function reset(z){clearOwner(z);Z.reset(z);z._senseTimeV2=E.time();z.baseSpeedV2=z.speed;z.crawlT=0;z.moveV2=1;}
    function sever(z,slot,dir){
      if(z.gore[slot])return false;const h=z.home[slot];if(!h||!h.o.parent)return false;
      const o=h.o;z.gore[slot]=1;E.scene.attach(o);o.visible=true;z.stumps[slot].visible=true;
      // Remove stale entries before ownership can return to the zombie pool.
      while(debris.length>=32){removeDebris(debris[0]);debris.shift();}
      debris.push({o,z,slot,owned:false,age:0,sleep:0,v:new T.Vector3(dir.x*1.8,1.9,dir.z*1.8),w:new T.Vector3(.8,.6,1.3),q:o.quaternion.clone()});
      if(slot==='legL'||slot==='legR'){
        z.legGone=(z.gore.legL?1:0)+(z.gore.legR?1:0);z.crawl=1;z.crawlT=0;
        const arms=(z.gore.armL?0:1)+(z.gore.armR?0:1);
        z.speed=(z.baseSpeedV2||z.speed)*(z.legGone===2?.2:.3)*(arms===0?.3:arms===1?.65:1);z.state='walk';z.cool=.4;
      }else if(z.crawl){z.speed=(z.baseSpeedV2||z.speed)*(z.legGone===2?.2:.3)*((z.gore.armL&&z.gore.armR)?.3:.65);}
      return true;
    }
    function damage(z,dmg,part,point,dir,slot){
      if(!z||!z.alive||z.dead)return;
      const hp=z.hp;const out=E.damage(z,dmg,part,point,dir,slot);const actual=Math.max(0,hp-z.hp);
      z.gore=z.gore||{};
      if(slot&&Z.slots[slot]&&slot!=='head'&&!z.gore[slot]){
        z.limbHP[slot]-=actual;
        if(z.limbHP[slot]<=0)sever(z,slot,dir);
      }
      if(part==='body'&&actual>0)for(const m of z.wounds)m.visible=true;
      if(part==='head'&&z.dead&&!z.gore.head){sever(z,'head',dir);}
      return out;
    }
    function beginDeath(z,dir,d){
      z.v2Death={side:Math.max(-.2,Math.min(.2,dir.x*Math.cos(z.g.rotation.y)-dir.z*Math.sin(z.g.rotation.y))),headTilt:Math.sin(z.seed)*.15};
      z.blob.visible=false;z.sv.clampLength(0,z.V.heavy?2.4:3.5);
    }
    function dead(z,dt){
      if(z.V.name==='bloater')return E.dead(z,dt);
      z.deadT+=dt;const k=z.deadT;
      if(!z.v2Death)z.v2Death={side:0,headTilt:0};
      // Blend from the final living pose; absent joints remain with physics.
      const blend=smooth(k/.25),snap=[];
      for(const j of Z.joints)if(parentVisible(z[j]))snap.push([z[j],z[j].quaternion.clone()]);
      deathPose(z,k,z.fdir||1);
      for(const [o,q] of snap)o.quaternion.slerpQuaternions(q,o.quaternion.clone(),blend);
      if(k<1.8){z.g.position.addScaledVector(z.sv,dt);z.sv.multiplyScalar(Math.exp(-6*dt));E.collide(z.g.position,.32*z.V.scale);}
      z.g.position.y=0;const low=Z.minY(T,z.body);if(Number.isFinite(low))z.g.position.y=.022-low;
      if(k>.72&&!z.landed){z.landed=true;E.land(z);}
      if(k>6.5){z.g.visible=false;z.alive=false;}
    }
    function animate(z,dt,t,from){
      z.crawlT=(z.crawlT||0)+dt;
      const distance=Math.hypot(z.g.position.x-from.x,z.g.position.z-from.z);
      const speed=distance/Math.max(dt,.001);
      z.moveV2+=(Math.min(1,speed/Math.max(.2,z.speed||1))-z.moveV2)*(1-Math.exp(-dt*9));
      // Phase follows actual displacement; a blocked zombie does not run in place.
      z.phase=from.phase+distance*(z.crawl?8:z.V.name==='runner'?3.8:5.5)+dt*.25*(1-z.moveV2);
      const previous=z.poseV2;if(!(z.slamS>0&&!z.crawl))pose(z,t);
      const blend=1-Math.exp(-dt*(z.state==='atk'?24:z.crawl?18:14));
      z.poseV2=z.poseV2||{};
      for(const j of Z.joints){const o=z[j];if(!o.parent||!isAttached(z,o))continue;
        if(previous&&previous[j])o.quaternion.slerpQuaternions(previous[j],o.quaternion.clone(),blend);
        z.poseV2[j]=o.quaternion.clone();
      }
      if(z.crawl){z.g.position.y=0;const low=Z.minY(T,z.body);if(Number.isFinite(low)&&low<.018)z.g.position.y=.018-low;}
    }
    function isAttached(z,o){for(let p=o;p;p=p.parent)if(p===z.g)return true;return false;}
    function captureDetached(z){const out=[];for(const [slot,h] of Object.entries(z.home))if(z.gore&&z.gore[slot]){
      h.o.traverse(o=>out.push([o,o.position.clone(),o.quaternion.clone()]));
    }return out;}
    function restoreDetached(list){for(const [o,p,q] of list){o.position.copy(p);o.quaternion.copy(q);}}
    function physics(dt){
      acc=Math.min(.1,acc+Math.max(0,dt));const h=1/60;
      while(acc>=h){acc-=h;
        for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.age+=h;
          if(d.age>7){removeDebris(d);debris.splice(i,1);continue;}
          if(d.sleep>.6)continue;
          d.v.y-=9.81*h;const x=d.o.position.x,zz=d.o.position.z;
          d.o.position.addScaledVector(d.v,h);E.collide(d.o.position,.12);
          if(Math.abs(d.o.position.x-(x+d.v.x*h))>.001)d.v.x*=-.12;
          if(Math.abs(d.o.position.z-(zz+d.v.z*h))>.001)d.v.z*=-.12;
          vec.copy(d.w);const angle=vec.length()*h;if(angle>1e-8)d.o.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(vec.normalize(),angle));
          const low=Z.minY(T,d.o);
          if(low<.024){d.o.position.y+=.024-low;
            d.v.y=Math.abs(d.v.y)<.4?0:-d.v.y*.14;
            d.v.x*=.82;d.v.z*=.82;d.w.multiplyScalar(.72);
            if(d.v.lengthSq()<.008&&d.w.lengthSq()<.02)d.sleep+=h;else d.sleep=0;
          }
        }
      }
    }
    function target(z,goal){
      if(!z.alive||z.dead||z.flee||z.tgtKind==='piece'||z.slamS>0||!goal)return goal;
      const now=E.time(),P=z.g.position,radius=.35*z.V.scale;
      const n=z.navV2||(z.navV2={next:now+z.seed%1,path:[],gx:0,gz:0});
      // Never predict a hidden player. Search/wander keep the existing last-known target.
      if(z.V.name==='runner'&&z.tgtKind==='player'&&!E.blocked(P.x,P.z,goal.x,goal.z)){
        const lead=Math.min(.35,Math.hypot(P.x-goal.x,P.z-goal.z)/Math.max(1,z.speed)*.12);
        const x=goal.x+E.player.vel.x*lead,zz=goal.z+E.player.vel.z*lead;
        if(E.free(x,zz,radius))return new T.Vector3(x,0,zz);
      }
      if(now>=n.next){n.next=now+1.1+z.seed%1*.4;
        if((z.stuck||0)>.2||E.blocked(P.x,P.z,goal.x,goal.z)){
          n.path=Z.route(P,goal,(x,zz)=>Math.abs(x)<E.half-2&&Math.abs(zz)<E.half-2&&E.free(x,zz,radius));
          n.gx=goal.x;n.gz=goal.z;
        }else n.path=[];
      }
      if(Math.hypot(n.gx-goal.x,n.gz-goal.z)>6)n.path=[];
      while(n.path.length&&Math.hypot(P.x-n.path[0].x,P.z-n.path[0].z)<.75)n.path.shift();
      const next=n.path[0];return next?new T.Vector3(next.x,0,next.z):goal;
    }
    return {debris,reset,sever,damage,beginDeath,dead,animate,physics,target,clear,captureDetached,restoreDetached};
  }
  Object.assign(Z,{pose,deathPose,install});
})(typeof window!=='undefined'?window:globalThis);
