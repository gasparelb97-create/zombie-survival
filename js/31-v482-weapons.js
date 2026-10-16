'use strict';
// ======================= v4.3.82 armi: finiture pulite e lucide (niente usura/graffi/ruggine) + meno draw call (merge statico per materiale) =======================
(function(){
let polished=0;
function cleanTex(key,base,hi){try{return ctex43(key,128,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,hi);gr.addColorStop(.5,base);gr.addColorStop(1,base);g.fillStyle=gr;g.fillRect(0,0,w,h);},{rep:[1,1]});}catch(e){return null;}}
function polish482(W){if(polished||!W)return;polished=1;try{
  const set=(k,o)=>{const m=W[k];if(!m)return;for(const p in o)m[p]=o[p];m.needsUpdate=true;};
  // metals: no scratch roughness map, smooth satin/gloss
  set('gun',{roughnessMap:null,roughness:.28,metalness:.85,envMapIntensity:1.9});set('park',{roughnessMap:null,roughness:.38,metalness:.7,envMapIntensity:1.6});
  set('steel',{roughness:.16});set('blued',{roughness:.18,envMapIntensity:2});set('chrome',{roughness:.07});set('brass',{roughness:.2});set('copper',{roughness:.22});
  set('blade',{roughness:.1});set('poly',{roughness:.5,bumpScale:.15});set('rubber',{roughness:.85,bumpScale:.3});
  // wood: lacquered
  set('wood',{roughness:.3,envMapIntensity:.9});set('woodD',{roughness:.32,envMapIntensity:.8});set('check',{roughness:.45,bumpScale:.35});
  // paints: clean factory finish (old maps had chips + scratches)
  const P={tan:['#9a8058','#b39a72'],olive:['#4e5a33','#66744a'],navy:['#28344c','#3c4c6c'],viper:['#2c6440','#3f8256'],red:['#a3241a','#c23a2c'],camo:['#596046','#6e7658'],white:['#dfe3e8','#f4f6f8']};
  for(const k in P){const m=W[k];if(!m)continue;const t=k==='white'?null:cleanTex('cl482'+k,P[k][0],P[k][1]);if(t){m.map=t;m.color&&m.color.set(0xffffff);}m.roughness=Math.min(m.roughness,.3);m.metalness=Math.max(.25,m.metalness*.8);m.envMapIntensity=Math.max(m.envMapIntensity||1,1.3);m.needsUpdate=true;}
}catch(e){console.warn('polish482',e);}}
try{const _wm=wmat43;wmat43=function(){const W=_wm.apply(this,arguments);polish482(W);return W;};window.wmat43=wmat43;}catch(e){}
// ---- merge static meshes per material (animated parts referenced by userData are kept) ----
function refs482(v,S,d){if(!v||d>3)return;if(v.isObject3D){S.add(v);return;}if(Array.isArray(v)){for(const x of v)refs482(x,S,d+1);return;}if(typeof v==='object'&&!v.isMaterial&&!v.isTexture)for(const k in v)refs482(v[k],S,d+1);}
function merge482(root,keep){let before=0,after=0;try{root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert();const G=new Map();
  root.traverse(o=>{if(!o.isMesh)return;before++;if(o.isInstancedMesh||o.isSkinnedMesh||Array.isArray(o.material)||!o.visible)return;for(let p=o;p&&p!==root;p=p.parent){if(keep.has(p)||!p.visible)return;}
    const m=o.material,g=o.geometry;if(!m||m.transparent||!g||!g.attributes.position||(g.morphAttributes&&Object.keys(g.morphAttributes).length))return;if(o.userData&&Object.keys(o.userData).length)return;
    let e=G.get(m.uuid);if(!e){e={m,L:[]};G.set(m.uuid,e);}e.L.push(o);});
  for(const {m,L} of G.values()){if(L.length<2)continue;const parts=[];let n=0;
    for(const o of L){const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();const M=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);g.applyMatrix4(M);
      if(!g.attributes.normal)g.computeVertexNormals();if(M.determinant()<0){for(const a of ['position','normal','uv']){const A=g.attributes[a];if(!A)continue;const s=A.itemSize,arr=A.array;for(let i=0;i<A.count;i+=3)for(let c=0;c<s;c++){const t=arr[(i+1)*s+c];arr[(i+1)*s+c]=arr[(i+2)*s+c];arr[(i+2)*s+c]=t;}}}
      parts.push(g);n+=g.attributes.position.count;}
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let off=0;
    for(const g of parts){const c=g.attributes.position.count;pos.set(g.attributes.position.array.subarray(0,c*3),off*3);nor.set(g.attributes.normal.array.subarray(0,c*3),off*3);const U=g.attributes.uv;if(U&&U.itemSize===2)uv.set(U.array.subarray(0,c*2),off*2);off+=c;g.dispose();}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.computeBoundingSphere();
    const mesh=new T.Mesh(geo,m);mesh.name='merged482';mesh.castShadow=L[0].castShadow;mesh.receiveShadow=L[0].receiveShadow;mesh.frustumCulled=false;mesh.renderOrder=L[0].renderOrder;root.add(mesh);
    for(const o of L){if(o.parent)o.parent.remove(o);}}
  root.traverse(o=>{if(o.isMesh)after++;});}catch(e){console.warn('merge482',e);}return [before,after];}
window.__wpn482={};
function mergeOne482(k){const H=VM[k]&&VM[k].userData.hi43;if(!H||H.m482)return;H.m482=1;const keep=new Set();refs482(H.ud,keep,0);refs482(H.base,keep,0);window.__wpn482[k]=merge482(H.g,keep);}
try{const _vb=vmBuild43;vmBuild43=function(k){const had=VM[k]&&VM[k].userData.hi43;const r=_vb.apply(this,arguments);try{if(!had)mergeOne482(k);}catch(e){console.warn('vm482',k,e);}return r;};window.vmBuild43=vmBuild43;}catch(e){console.warn('vmBuild482',e);}
try{if(typeof WM!=='undefined'&&WM)polish482(WM);}catch(e){}
try{for(const k in VM)try{mergeOne482(k);}catch(e){}}catch(e){}
})();
