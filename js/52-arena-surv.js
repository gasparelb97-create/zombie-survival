'use strict';
// ======================= 4.3.85 Arena: fighters drawn with the survivor character (MPChar) =======================
// Arena logic is untouched: the original arenaDrive still runs (position, recoil/hit decays, skeleton); we only hide the old
// skinned mesh and pose a light survivor (Lambert, no shadows, 15 merged meshes) from the same values. Any error -> old look back.
(function(){if(typeof arenaDrive!=='function'||!window.MPChar)return;let off=false;try{if(localStorage.getItem('zs_arena_oldfig')==='1')off=true;}catch(e){}
  const _ad=arenaDrive,WD=['ar','smg','shotgun','pistol'];
  const darker=h=>{const c=new T.Color(h);c.multiplyScalar(.55);return c.getHex();};
  function make(f,col){const ch=MPChar.createSurvivor({skin:{lite:true,palette:{jk:col,hd:darker(col)},slot:(f.seed475*10|0)%4},weapon:f.w485||WD[(f.seed475*7|0)%WD.length]});
    f.g.add(ch.root);f.sv485=ch;f.col485=col;f.lr485=f.rec7||0;f.lh485=f.hit7||0;return ch;}
  function drop(f){try{if(f.sv485){f.g.remove(f.sv485.root);f.sv485.dispose();}}catch(e){}f.sv485=null;if(f.mesh)f.mesh.visible=true;}
  arenaDrive=function(f,x,z,yaw,now,alive){const r=_ad.apply(this,arguments);if(off||!f||!f.v475||!f.g)return r;
    try{const col=(f.tb7||f.tc475)?(f.tb7||f.tc475).getHex():0x2f6fd0;let ch=f.sv485;if(ch&&f.col485!==col&&!(f.hit7>0)){drop(f);ch=null;}if(!ch)ch=make(f,col);
      if(f.mesh)f.mesh.visible=false;const dt=Math.min(.05,Math.max(.001,(now-(f.t485||now-16))/1000));f.t485=now;
      const rc=f.rec7||0,ht=f.hit7||0;if(rc>f.lr485+.3)ch.pulse('shoot');if(ht>f.lh485+.3)ch.pulse('hit');f.lr485=rc;f.lh485=ht;
      let spd;if(f.vx7!=null)spd=Math.hypot(f.vx7,f.vz7);else{const px=f.px485==null?x:f.px485,pz=f.pz485==null?z:f.pz485;f.sp485=(f.sp485||0)*.8+Math.hypot(x-px,z-pz)/dt*.2;f.px485=x;f.pz485=z;spd=f.sp485;}ch.setPose(dt,{spd:alive?spd:0,pitch:(f.pitch475||0),dead:!alive});}
    catch(e){off=true;try{for(const g of (typeof figAll477==='function'?figAll477():[]))drop(g);}catch(x){}try{console.warn('arena485',e);}catch(x){}}
    return r;};
  window.arenaDrive=arenaDrive;})();
