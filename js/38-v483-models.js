'use strict';
// ======================= v4.3.83 weapon models: cleaner, smoother shapes (rounded edges, smoother barrels/handles), same parts/anchors =======================
(function(){if(typeof vmBuild43!=='function'||typeof VM==='undefined')return;
const o={rb:rboxG,pf:profG,la:latheG};let on=0;
// smoother versions, used only while a weapon is being built (world geometry untouched)
function rb2(w,h,d,b){if(!on)return o.rb(w,h,d,b);b=b===undefined?Math.min(w,h,d)*.26:b*1.25;return gk43('rb2'+w+','+h+','+d+','+b,()=>{b=Math.max(.0005,Math.min(b,w/2*.9,h/2*.9,d/2*.9));const s=new T.Shape(),x=w/2-b,y=h/2-b;
  s.moveTo(-x,-y);s.lineTo(x,-y);s.lineTo(x,y);s.lineTo(-x,y);s.closePath();const dd=Math.max(.0005,d-2*b);const g=new T.ExtrudeGeometry(s,{depth:dd,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:1});
  g.translate(0,0,-dd/2);g.computeVertexNormals();return g;});}
function pf2(key,pts,w,b){if(!on)return o.pf(key,pts,w,b);b=b===undefined?Math.min(.0065,w*.27):b;return gk43('pf2'+key+w+','+b,()=>{const s=new T.Shape();pts.forEach(([z,y],i)=>i?s.lineTo(-z,y):s.moveTo(-z,y));s.closePath();
  const d=Math.max(.0005,w-2*b);const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelOffset:-b,bevelSegments:2,curveSegments:8});g.translate(0,0,-d/2);g.rotateY(Math.PI/2);g.computeVertexNormals();return g;});}
function la2(key,pts,seg){if(!on)return o.la(key,pts,seg);return o.la(key,pts,Math.min(28,Math.max(20,Math.round((seg||16)*1.5))));}
rboxG=rb2;profG=pf2;latheG=la2;try{window.rboxG=rb2;window.profG=pf2;window.latheG=la2;}catch(e){}
const _vb=vmBuild43;vmBuild43=function(){on=1;try{return _vb.apply(this,arguments);}finally{on=0;}};try{window.vmBuild43=vmBuild43;}catch(e){}
// rebuild any viewmodel built before this file (startup) so every weapon gets the new shapes
try{const hi=typeof GFX43==='undefined'||GFX43.q!=='bassa';for(const k in VM){const vm=VM[k],H=vm&&vm.userData.hi43,L=vm&&vm.userData.lo43;if(!H||!L)continue;
    try{vm.remove(H.g);for(const c of L.children)c.visible=true;for(const u of (window.UDK43||UDK43))delete vm.userData[u];Object.assign(vm.userData,L.ud);vm.userData.base=L.base;vm.userData.rot=L.rot;
      delete vm.userData.hi43;delete vm.userData.lo43;H.g.traverse(m=>{if(m.isMesh&&m.name==='merged482')try{m.geometry.dispose();}catch(e){}});vmBuild43(k);}catch(e){console.warn('remodel',k,e);}}
  vmMode43(hi);}catch(e){console.warn('remodel',e);}
})();
