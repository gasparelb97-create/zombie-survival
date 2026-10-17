/* Zombie Survival — game code part 17-v471 (game.html lines 7830-7868 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.71: 1 draw per intact zombie body (rigid bone matrices in a merged mesh), menu-idle warm-up, instant thumbnails =======================
const M471={on:true,err:0,sk:0,warm:0};function e471(e,w){M471.err++;try{console.warn('471',w,e&&e.message);}catch(_){}if(M471.err>8)M471.on=false;}
const _m471=new T.Matrix4(),_n471=new T.Matrix3(),_v471=new T.Vector3();
function bonesInj471(sh,z){sh.uniforms.uB471={value:z.B471};sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float bI471;uniform mat4 uB471[12];')
  .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n{mat4 bm471=uB471[int(bI471+.5)];objectNormal=mat3(bm471)*objectNormal;}')
  .replace('#include <begin_vertex>','#include <begin_vertex>\n{mat4 bm471=uB471[int(bI471+.5)];transformed=(bm471*vec4(transformed,1.)).xyz;}');}
function skin471(z){try{if(z.sk471||!z.g)return;const parts=[],bones=[];z.g.updateMatrixWorld(true);const gInv=new T.Matrix4().copy(z.g.matrixWorld).invert();
  z.g.traverse(o=>{if(o.isMesh&&o.material===z.mat&&o.geometry&&o.geometry.attributes.color)parts.push(o);});if(parts.length<4)return;
  let n=0;for(const m of parts)n+=m.geometry.attributes.position.count;
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),bi=new Float32Array(n);let o=0;
  for(const m of parts){let k=bones.indexOf(m.parent);if(k<0){k=bones.length;bones.push(m.parent);}if(k>11)return;
    _m471.multiplyMatrices(gInv,m.matrixWorld);_n471.getNormalMatrix(_m471);const g=m.geometry,P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color,c=P.count;
    for(let i=0;i<c;i++){_v471.fromBufferAttribute(P,i).applyMatrix4(_m471);pos[(o+i)*3]=_v471.x;pos[(o+i)*3+1]=_v471.y;pos[(o+i)*3+2]=_v471.z;
      _v471.fromBufferAttribute(N,i).applyMatrix3(_n471).normalize();nor[(o+i)*3]=_v471.x;nor[(o+i)*3+1]=_v471.y;nor[(o+i)*3+2]=_v471.z;
      col[(o+i)*3]=C.getX(i);col[(o+i)*3+1]=C.getY(i);col[(o+i)*3+2]=C.getZ(i);bi[o+i]=k;}o+=c;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));geo.setAttribute('bI471',new T.BufferAttribute(bi,1));
  geo.computeBoundingSphere();geo.boundingSphere.radius*=1.7;
  z.B471=[];for(let i=0;i<12;i++)z.B471.push(new T.Matrix4());z.BI471=bones.map(b=>new T.Matrix4().multiplyMatrices(gInv,b.matrixWorld).invert());z.BN471=bones;
  const mat=z432Mat(new T.MeshLambertMaterial({vertexColors:true}));const ob=mat.onBeforeCompile;mat.onBeforeCompile=(sh,r)=>{ob(sh,r);bonesInj471(sh,z);};mat.customProgramCacheKey=()=>'z432b471';
  const dm=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});dm.onBeforeCompile=sh=>bonesInj471(sh,z);dm.customProgramCacheKey=()=>'zd471';
  const sk=new T.Mesh(geo,mat);sk.name='zskin471';sk.customDepthMaterial=dm;sk.castShadow=parts[0].castShadow;sk.receiveShadow=false;
  let fr=-1;sk.onBeforeRender=function(){const f=renderer.info.render.frame;if(f===fr)return;fr=f;bones471(z);};z.g.add(sk);
  z.sk471=sk;z.zm471=mat;z.pt471=parts;z.md471=-1;M471.sk++;setMode471(z,1);}catch(e){e471(e,'skin');}}
const _gi471=new T.Matrix4();
function bones471(z){try{_gi471.copy(z.g.matrixWorld).invert();const B=z.B471,N=z.BN471,I=z.BI471;for(let i=0;i<N.length;i++)B[i].multiplyMatrices(_gi471,N[i].matrixWorld).multiply(I[i]);
  const a=z.mat,b=z.zm471;if(a.emissive&&!b.emissive.equals(a.emissive))b.emissive.copy(a.emissive);if(b.emissiveIntensity!==a.emissiveIntensity)b.emissiveIntensity=a.emissiveIntensity;}catch(e){e471(e,'bn');}}
function setMode471(z,intact){if(z.md471===intact)return;z.md471=intact;z.sk471.visible=!!intact;for(const m of z.pt471)m.visible=!intact;}
function zTick471(){for(const z of zombies){if(!z.sk471)continue;const sh=z.pt471[0].castShadow;if(z.sk471.castShadow!==sh)z.sk471.castShadow=sh;
  const intact=M471.on&&!z.gore&&(!z.neck||z.neck.visible);setMode471(z,intact?1:0);}}
try{for(const z of zombies)skin471(z);}catch(e){e471(e,'sk0');}
// warm-up during menu idle (and again, cheaply, in the play loader): compile + upload everything, incl. textures
function warmTex471(){let n=0;try{const seen=new Set();scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)for(const k of ['map','alphaMap','emissiveMap','lightMap','aoMap','normalMap','bumpMap','specularMap']){const t=m[k];if(t&&!seen.has(t)){seen.add(t);try{renderer.initTexture(t);n++;}catch(e){}}}});}catch(e){e471(e,'tex');}return n;}
function menuWarm471(){if(M471.warm||!M471.on)return;M471.warm=1;try{const t0=performance.now(),p0=renderer.info.programs.length;warmFx469();const nt=warmTex471();
  try{plog424&&plog424('warm471 menu '+Math.round(performance.now()-t0)+'ms newProg='+(renderer.info.programs.length-p0)+' tex='+nt);}catch(e){}}catch(e){e471(e,'mw');}}
{let it=0;const tick=()=>{try{if(M471.warm||!M471.on)return;if(game.state==='menu'&&!(LD431.on||LD431.hold)&&document.visibilityState==='visible'){if(++it>=2){(window.requestIdleCallback||setTimeout)(menuWarm471,{timeout:1500});return;}}else it=0;}catch(e){e471(e,'mt');return;}setTimeout(tick,1200);};setTimeout(tick,3000);}
// instant weapon images: all thumbnails ship pre-rendered (PRE43 + assets/thumbs/*.webp), never rendered in 3D at runtime
try{if(typeof pre43==='function'&&pre43())thumbs43();}catch(e){e471(e,'th');}
{const _l0=loop0;loop0=function(now){try{if(M471.on)zTick471();}catch(e){e471(e,'tick');}return _l0(now);};}
window.__zs471={get m(){return M471;},warm:()=>{M471.warm=0;menuWarm471();return M471.warm;},mode:()=>zombies.map(z=>z.md471)};
