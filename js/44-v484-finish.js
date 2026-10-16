'use strict';
// ======================= v4.3.84 firearm finish pass: realistic dark gunmetal/polymer, colour only as accents, recessed side cuts, fluted barrels + crowns, magazine ribs (fitted to the magazine's own bounds) =======================
(function(){if(typeof HIB43==='undefined'||typeof wmat43!=='function')return;
const GUNS=['pistol','revolver','smg','ar','shotgun','dbarrel','sniper','crossbow','glauncher','flamer','minigun','laser','plasma','thunder'];
let F=null;function fin(){if(F)return F;const W=wmat43(),env=W.gun.envMap||null;
  const S=(o,ei)=>{const m=new T.MeshStandardMaterial(o);if(env){m.envMap=env;m.envMapIntensity=ei||1.2;}return m;};
  F={metal:S({color:0x2c2f34,metalness:.88,roughness:.3},1.6),metal2:S({color:0x3a3e44,metalness:.8,roughness:.4},1.3),
     poly:S({color:0x1d1e21,metalness:.05,roughness:.58},1),polyD:S({color:0x141517,metalness:0,roughness:.7},.8),
     cut:S({color:0x0c0d0f,metalness:.4,roughness:.6},.5),crown:S({color:0x8f969e,metalness:1,roughness:.18},1.5)};return F;}
const box3=()=>new T.Box3(),v3=()=>new T.Vector3();
function lb(o,root){root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert(),b=box3();o.updateMatrixWorld(true);
  o.traverse(m=>{if(!m.isMesh)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld));b.union(bb);});return b;}
function finish(k,r){const W=wmat43(),f=fin(),g=r.g;const paints=new Map([[W.viper,'m'],[W.tan,'p'],[W.navy,'m'],[W.white,'m'],[W.olive,'p'],[W.camo,'p'],[W.red,'m']]);
  const handM=[typeof gloveM!=='undefined'?gloveM:null,typeof sleeveM!=='undefined'?sleeveM:null];const keep=new Set();
  for(const v of Object.values(r.ud||{})){(Array.isArray(v)?v:[v]).forEach(o=>{if(o&&o.isObject3D)keep.add(o);});}
  const big=[],barrels=[];const inKeep=m=>{for(let p=m.parent;p&&p!==g;p=p.parent)if(keep.has(p))return true;return false;};
  g.traverse(m=>{if(!m.isMesh||handM.includes(m.material)||keep.has(m))return;const mat=m.material;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const s=m.geometry.boundingBox.getSize(v3()),mx=Math.max(s.x,s.y,s.z);
    if(paints.has(mat)){if(mx>.07||s.x*s.y*s.z>2e-5){m.material=paints.get(mat)==='p'?f.poly:f.metal;big.push([m,mat]);}}           // big painted parts -> real finish; small stay as accents
    else if(k==='dbarrel'&&mat===W.chrome&&mx>.07)m.material=f.metal2;else if(mat===W.gun)m.material=f.metal;else if(mat===W.park)m.material=f.metal2;else if(mat===W.poly)m.material=f.poly;
    if((mat===W.blued||mat===W.gun||mat===W.park)&&s.z>.14&&s.x<.06&&s.y<.06&&Math.abs(s.x-s.y)<.004)barrels.push(m);});
  // accent stripe in the weapon's original colour along each big painted part + recessed side cuts
  for(const [m,col] of big){const b=lb(m,g),c=b.getCenter(v3()),s=b.getSize(v3());if(s.z<.08||s.y<.02)continue;
    for(const sx of [-1,1]){M43(g,rboxG(.0016,Math.max(.003,s.y*.08),s.z*.78,.0005),col,c.x+sx*(s.x/2+.0006),b.max.y-s.y*.18,c.z);
      if(paints.get(col)==='m'&&!inKeep(m)&&c.z<.08&&s.y>.035&&s.z>.12){const n=Math.min(4,Math.floor(s.z/.06));for(let i=0;i<n;i++)M43(g,rboxG(.0014,s.y*.32,s.z/(n*2.2),.0004),f.cut,c.x+sx*(s.x/2+.0004),c.y-s.y*.08,b.min.z+s.z*(i+.5)/n*.86+s.z*.07);}}}
  // barrels: flutes + bright crown at the muzzle end
  for(const m of barrels){const b=lb(m,g),c=b.getCenter(v3()),s=b.getSize(v3()),rr=s.x/2;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1]])M43(g,rboxG(dx?.0012:rr*.5,dy?.0012:rr*.5,s.z*.55,.0003),f.cut,c.x+dx*(rr+.0002),c.y+dy*(rr+.0002),c.z+s.z*.05);
    M43(g,tubeG(rr*1.02,rr*.62,.004,18),f.crown,c.x,c.y,b.min.z+.002);}
  // magazine ribs, placed from the magazine's own bounds (moves with it on reload)
  const mg=r.ud&&r.ud.mag;if(mg&&mg.isObject3D&&['pistol','smg','sniper'].includes(k)){const b=lb(mg,mg),c=b.getCenter(v3()),s=b.getSize(v3());
    if(s.y>.05)for(let i=0;i<3;i++){const y=b.max.y-s.y*(.35+i*.17);M43(mg,rboxG(s.x+.002,.004,Math.min(s.z*.42,.03),.0012),f.metal2,c.x,y,c.z+(k==='smg'?(y-c.y)*.12:0));}}
}
for(const k of GUNS){const o=HIB43[k];if(typeof o!=='function')continue;HIB43[k]=function(){const r=o.apply(this,arguments);try{finish(k,r);}catch(e){console.warn('fin484',k,e);}return r;};}
try{const hi=typeof GFX43==='undefined'||GFX43.q!=='bassa';for(const k of GUNS){const vm=VM[k],H=vm&&vm.userData.hi43,L=vm&&vm.userData.lo43;if(!H||!L)continue;
  try{vm.remove(H.g);for(const ch of L.children)ch.visible=true;for(const u of UDK43)delete vm.userData[u];Object.assign(vm.userData,L.ud);vm.userData.base=L.base;vm.userData.rot=L.rot;delete vm.userData.hi43;delete vm.userData.lo43;vmBuild43(k);}catch(e){console.warn('fin484',k,e);}}
  vmMode43(hi);}catch(e){}
})();
