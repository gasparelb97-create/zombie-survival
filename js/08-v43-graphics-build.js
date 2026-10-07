/* Zombie Survival — game code part 08-v43-graphics-build (game.html lines 4771-5495 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3 graphics core: quality presets (Bassa / Media / Alta) =======================
// The player's choice is saved and always respected. Auto-pick only sets the initial default (GPU string + a one-time fps check).
const GFX43={q:'media',user:false,fns:[],gpu:'',auto:'',settled:false};
function gpuName43(){try{const gl=renderer.getContext(),e=gl.getExtension('WEBGL_debug_renderer_info');return String(e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||'');}catch(e){return '';}}
function gfxAuto43(g){g=g||'';const mem=navigator.deviceMemory||4;let q;
  if(/swiftshader|llvmpipe|software|microsoft basic/i.test(g))q='bassa';
  else{let m;
    if(m=g.match(/adreno[^\d]*(\d{3})/i)){const n=+m[1];q=n>=730?'alta':n>=640?'media':n>=530?'media':'bassa';}
    else if(m=g.match(/mali-g(\d+)/i)){const n=+m[1];q=(n>=710||[76,77,78].includes(n))?'alta':([57,68,72].includes(n)||(n>=610&&n<710))?'media':'bassa';}
    else if(/mali/i.test(g))q='bassa';
    else if(/apple|xclipse|immortalis/i.test(g))q='alta';
    else if(/powervr/i.test(g))q=/bxm|dxt|cxt/i.test(g)?'media':'bassa';
    else if(/nvidia|geforce|radeon|amd|rtx|gtx|quadro/i.test(g))q='alta';
    else if(/intel/i.test(g))q=/iris|arc|xe/i.test(g)?'alta':'media';
    else q=isTouch?'media':'alta';}
  if(mem<=2)q='bassa';else if(mem<=3&&q==='alta')q='media';return q;}
{const s=LS.get('zc_gfx',null);GFX43.gpu=gpuName43();GFX43.auto=gfxAuto43(GFX43.gpu);
 if(s&&s.q&&['bassa','media','alta'].includes(s.q)){GFX43.q=s.q;GFX43.user=!!s.user;GFX43.settled=!!(s.user||s.settled);}
 else{GFX43.q=GFX43.auto;LS.set('zc_gfx',{q:GFX43.q,user:0,settled:0,gpu:GFX43.gpu.slice(0,60)});}
 if(URLQ.get('gfx')&&['bassa','media','alta'].includes(URLQ.get('gfx')))GFX43.q=URLQ.get('gfx');}
const GQ=()=>GFX43.q,GHI=()=>GFX43.q!=='bassa',GALTA=()=>GFX43.q==='alta';
function gfxOn43(fn){GFX43.fns.push(fn);}
function gfxApply43(){for(const f of GFX43.fns){try{f(GFX43.q);}catch(e){console.error('gfx43',e);}}try{THUMBS=null;}catch(e){}gfxCompile43();
  document.body.classList.remove('gfx-bassa','gfx-media','gfx-alta');document.body.classList.add('gfx-'+GFX43.q);}
function gfxSet43(q,user){if(!['bassa','media','alta'].includes(q))return;const ch=q!==GFX43.q;GFX43.q=q;if(user){GFX43.user=true;GFX43.settled=true;}
  LS.set('zc_gfx',{q,user:GFX43.user?1:0,settled:GFX43.settled?1:0,gpu:GFX43.gpu.slice(0,60)});if(ch)gfxApply43();gfxSync43();}
// precompile every shader the current preset can use (world + all weapon viewmodels) so the first shot / first night never hitches
let _gc43=0;function gfxCompile43(){try{const t0=performance.now();renderer.compile(scene,camera);
  const vis=[];for(const k in VM){vis.push([VM[k],VM[k].visible]);VM[k].visible=true;}
  vmScene.updateMatrixWorld(true);renderer.compile(vmScene,vmCam);for(const [g,v] of vis)g.visible=v;_gc43=performance.now()-t0;}catch(e){console.error('compile43',e);}}
// one-time fps check on the very first game (only while the preset is still the automatic default)
{let acc=0,n=0,warm=0;TICK42.push(dt=>{if(GFX43.settled||GFX43.user)return;warm+=dt;if(warm<6)return;acc+=dt;n++;if(acc<20)return;const fps=n/acc;GFX43.settled=true;
  let q=GFX43.q;if(q==='alta'&&fps<45)q='media';else if(q==='media'&&fps<30)q='bassa';GFX43.fps=Math.round(fps);
  if(q!==GFX43.q){gfxSet43(q,false);mtoast('🎨 Grafica impostata su '+GLBL43[q]+' per la fluidità · puoi cambiarla in Impostazioni',3600);}else LS.set('zc_gfx',{q,user:0,settled:1,gpu:GFX43.gpu.slice(0,60)});});}
const GLBL43={bassa:'Bassa',media:'Media',alta:'Alta'};
// ---- settings UI (Impostazioni + Pausa) ----
function gfxRow43(id){const d=document.createElement('div');d.className='toggle gfx43';d.id=id;
  d.innerHTML='🎨 Grafica <span class="seg43">'+['bassa','media','alta'].map(q=>'<button data-gq="'+q+'">'+GLBL43[q]+'</button>').join('')+'</span>';
  d.addEventListener('click',e=>{const b=e.target.closest('button[data-gq]');if(!b)return;const q=b.dataset.gq;if(q===GFX43.q&&GFX43.user)return;gfxSet43(q,true);mtoast('🎨 Grafica: '+GLBL43[q]+(q==='bassa'?' · massima fluidità':q==='alta'?' · massimo dettaglio':''),1800);});return d;}
function gfxSync43(){for(const b of document.querySelectorAll('.gfx43 button[data-gq]'))b.classList.toggle('on',b.dataset.gq===GFX43.q);
  for(const s of document.querySelectorAll('.gfx43 .gAuto'))s.remove();}
{const h=$('helpScreen'),p=$('pauseScreen');try{const r1=gfxRow43('gfxRowH');const sens=h.querySelector('.toggle');sens.parentNode.insertBefore(r1,sens);
  const r2=gfxRow43('gfxRowP');const pm=p.querySelector('.toggle');pm.parentNode.insertBefore(r2,pm);gfxSync43();}catch(e){console.error(e);}}
// ---- procedural canvas textures (no external assets) ----
const TX43={};
function ctex43(key,w,h,draw,o){if(TX43[key])return TX43[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new T.CanvasTexture(c);
  if(!(o&&o.linear))t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;if(o&&o.rep)t.repeat.set(o.rep[0],o.rep[1]);t.anisotropy=ani432();TX43[key]=t;return t;}
function rng43(seed){let s=seed>>>0||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function noise43(g,w,h,n,a,b,s0,s1,rnd){rnd=rnd||Math.random;for(let i=0;i<n;i++){const v=a+rnd()*(b-a);g.fillStyle='rgba('+v+','+v+','+v+','+(.15+rnd()*.35)+')';const s=s0+rnd()*(s1-s0);g.fillRect(rnd()*w,rnd()*h,s,s);}}
// environment map for metals (PMREM from a tiny procedural studio)
let ENV43=null;function env43(){if(ENV43)return ENV43;try{const sc=new T.Scene();const tex=ctex43('envsky',256,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#dfe8f6');gr.addColorStop(.45,'#9aa6b8');gr.addColorStop(.52,'#55534f');gr.addColorStop(1,'#1e1c1a');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='rgba(255,255,255,.95)';g.fillRect(w*.18,h*.12,w*.16,h*.16);g.fillRect(w*.62,h*.08,w*.08,h*.28);g.fillStyle='rgba(255,220,180,.7)';g.fillRect(w*.42,h*.3,w*.1,h*.08);},{});
  tex.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer);ENV43=pm.fromEquirectangular(tex).texture;pm.dispose();}catch(e){console.error('env43',e);ENV43=null;}return ENV43;}
window.__gfx43=GFX43;
(window.__t43=window.__t43||[]).push(['v43_core_end',performance.now()]);
// ---- 4.2.2: a drag / scroll is never a tap (shared tracker used by onTap/onTap2 and the tap resolver) ----
const DR43={m:new Map()};
addEventListener('touchstart',e=>{for(const t of e.changedTouches)DR43.m.set(t.identifier,{x:t.clientX,y:t.clientY,mx:0,c:0});},{capture:true,passive:true});
addEventListener('touchmove',e=>{for(const t of e.changedTouches){const d=DR43.m.get(t.identifier);if(d)d.mx=Math.max(d.mx,Math.hypot(t.clientX-d.x,t.clientY-d.y));}},{capture:true,passive:true});
addEventListener('pointercancel',e=>{if(e.pointerType==='touch')for(const d of DR43.m.values())d.c=1;},{capture:true,passive:true});
function drag43(e){try{const t=e&&e.changedTouches&&e.changedTouches[0];if(!t)return false;const d=DR43.m.get(t.identifier);if(!d)return false;
  // in gameplay a short finger slide on a HUD button is still a press; in menus/panels 10px = scroll
  const lim=game.state==='play'&&!(e.target&&e.target.closest&&e.target.closest('.overlay'))?28:10;return d.mx>lim||(d.c&&d.mx>4);}catch(_){return false;}}
addEventListener('touchend',e=>{setTimeout(()=>{for(const t of e.changedTouches)DR43.m.delete(t.identifier);},0);},{capture:false,passive:true});

(window.__t43=window.__t43||[]).push(['v43_wpn',performance.now()]);
// ======================= v4.3 weapons: detailed first-person models (Media/Alta); Bassa keeps the classic low-poly set =======================
const GC43=new Map();function gk43(k,f){let g=GC43.get(k);if(!g){g=f();GC43.set(k,g);}return g;}
function rboxG(w,h,d,b){b=b===undefined?Math.min(w,h,d)*.18:b;return gk43('rb'+w+','+h+','+d+','+b,()=>{b=Math.max(.0005,Math.min(b,w/2*.9,h/2*.9,d/2*.9));const s=new T.Shape(),x=w/2-b,y=h/2-b;
  s.moveTo(-x,-y);s.lineTo(x,-y);s.lineTo(x,y);s.lineTo(-x,y);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:Math.max(.0005,d-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:1,curveSegments:1});
  g.translate(0,0,-Math.max(.0005,d-2*b)/2);const n=g.toNonIndexed?g:g;n.computeVertexNormals();return n;});}
// side profile [[z,y],...] (forward = -z) extruded along x, total width w, chamfer b
function profG(key,pts,w,b){b=b===undefined?Math.min(.006,w*.25):b;return gk43('pf'+key+w+','+b,()=>{const s=new T.Shape();pts.forEach(([z,y],i)=>i?s.lineTo(-z,y):s.moveTo(-z,y));s.closePath();
  const d=Math.max(.0005,w-2*b);const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelOffset:-b,bevelSegments:1,curveSegments:6});g.translate(0,0,-d/2);g.rotateY(Math.PI/2);g.computeVertexNormals();return g;});}
// lathe along z: pts [[r,z],...]
function latheG(key,pts,seg){return gk43('la'+key+(seg||16),()=>{const g=new T.LatheGeometry(pts.map(([r,z])=>new T.Vector2(Math.max(0,r),z)),seg||16);g.rotateX(Math.PI/2);return g;});}
function cylG(r,len,seg,c){c=c===undefined?Math.min(r*.25,len*.2):c;return latheG('cy'+r+','+len+','+c,[[0,len/2],[r-c,len/2],[r,len/2-c],[r,-len/2+c],[r-c,-len/2],[0,-len/2]],seg||16);}
function tubeG(r,ri,len,seg){return latheG('tu'+r+','+ri+','+len,[[ri,len/2],[r,len/2],[r,-len/2],[ri,-len/2],[ri,len/2]],seg||16);}
function M43(g,geo,mat,x,y,z,rx,ry,rz){const m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m;}
function G43(par,x,y,z){const g=new T.Group();g.position.set(x||0,y||0,z||0);par.add(g);return g;}
// ---- materials ----
let WM=null;
function wmat43(){if(WM)return WM;const env=env43();
  const rough=ctex43('gmRough',128,128,(g,w,h)=>{g.fillStyle='#777';g.fillRect(0,0,w,h);const r=rng43(7);for(let i=0;i<500;i++){const v=90+r()*90|0;g.fillStyle='rgba('+v+','+v+','+v+',.35)';g.fillRect(0,r()*h,w,1);}noise43(g,w,h,1600,60,200,1,2,r);},{linear:1,rep:[6,6]});
  const wood=ctex43('wpWood',256,256,(g,w,h)=>{const r=rng43(11);g.fillStyle='#6a3d1f';g.fillRect(0,0,w,h);for(let y=0;y<h;y++){const t=Math.sin(y*.21+Math.sin(y*.05)*3)*.5+.5,v=t*28;g.fillStyle='rgba('+(120+v|0)+','+(72+v*.6|0)+','+(38+v*.3|0)+',.55)';g.fillRect(0,y,w,1);}
    for(let i=0;i<90;i++){g.strokeStyle='rgba(40,20,8,'+(.15+r()*.25)+')';g.lineWidth=.6+r()*1.2;g.beginPath();const y=r()*h;g.moveTo(0,y);for(let x=0;x<=w;x+=16)g.lineTo(x,y+Math.sin(x*.03+i)*4);g.stroke();}
    for(let i=0;i<3;i++){const x=r()*w,y=r()*h;const gr=g.createRadialGradient(x,y,0,x,y,10);gr.addColorStop(0,'rgba(40,18,6,.8)');gr.addColorStop(1,'rgba(40,18,6,0)');g.fillStyle=gr;g.fillRect(x-12,y-12,24,24);}},{rep:[5,5]});
  const stip=ctex43('stip',64,64,(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);const r=rng43(5);for(let i=0;i<700;i++){const v=r()<.5?40:220;g.fillStyle='rgba('+v+','+v+','+v+',.7)';g.fillRect(r()*w,r()*h,1.5,1.5);}},{linear:1,rep:[14,14]});
  const check=ctex43('check',128,128,(g,w,h)=>{g.fillStyle='#5a3218';g.fillRect(0,0,w,h);g.strokeStyle='rgba(20,10,4,.75)';g.lineWidth=1.2;for(let i=-w;i<w*2;i+=7){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i,h);g.lineTo(i+h,0);g.stroke();}},{rep:[8,8]});
  const paint=(key,base,chip,blot)=>ctex43(key,256,256,(g,w,h)=>{const r=rng43(key.length*31);g.fillStyle=base;g.fillRect(0,0,w,h);
    if(blot)for(let i=0;i<34;i++){g.fillStyle=blot[i%blot.length];g.beginPath();const x=r()*w,y=r()*h;g.moveTo(x,y);for(let k=0;k<7;k++)g.lineTo(x+(r()-.5)*70,y+(r()-.5)*50);g.closePath();g.fill();}
    noise43(g,w,h,900,0,255,1,3,r);for(let i=0;i<120;i++){g.fillStyle=chip;const s=1+r()*3.5;g.fillRect(r()*w,r()*h,s*1.6,s);}
    g.strokeStyle='rgba(200,200,200,.18)';for(let i=0;i<40;i++){g.lineWidth=.5+r();g.beginPath();const x=r()*w,y=r()*h;g.moveTo(x,y);g.lineTo(x+(r()-.5)*40,y+(r()-.5)*12);g.stroke();}},{rep:[4,4]});
  const S=(o)=>{const ei=o.ei,ne=o.noEnv;delete o.ei;delete o.noEnv;o=Object.assign({},o);const m=new T.MeshStandardMaterial(o);o.ei=ei;o.noEnv=ne;if(env&&!o.noEnv)m.envMap=env;m.envMapIntensity=o.ei||1;return m;};
  WM={
   gun:S({color:0x3a3d43,metalness:.8,roughness:.42,roughnessMap:rough,ei:1.7}),
   park:S({color:0x2c2f33,metalness:.6,roughness:.6,roughnessMap:rough,ei:1.4}),
   steel:S({color:0xa8aeb6,metalness:1,roughness:.24,ei:1.3}),
   blued:S({color:0x2c3140,metalness:.95,roughness:.26,ei:1.8}),
   poly:S({color:0x26272a,ei:1.2,metalness:0,roughness:.72,bumpMap:stip,bumpScale:.4}),
   rubber:S({color:0x121212,metalness:0,roughness:.95,bumpMap:stip,bumpScale:.8}),
   wood:S({color:0xffffff,map:wood,metalness:0,roughness:.5,ei:.6}),
   woodD:S({color:0xb08a70,map:wood,metalness:0,roughness:.55,ei:.5}),
   check:S({color:0xffffff,map:check,metalness:0,roughness:.6,bumpMap:check,bumpScale:.6}),
   brass:S({color:0xc9a040,metalness:1,roughness:.3,ei:1.3}),
   copper:S({color:0xb86a3a,metalness:1,roughness:.35}),
   chrome:S({color:0xe6e9ee,metalness:1,roughness:.12,ei:1.5}),
   tan:S({color:0xffffff,map:paint('pTan','#9a8058','rgba(160,160,165,.75)'),metalness:.15,roughness:.62}),
   olive:S({color:0xffffff,map:paint('pOlive','#4e5a33','rgba(150,150,140,.7)'),metalness:.2,roughness:.6}),
   navy:S({color:0xffffff,map:paint('pNavy','#28344c','rgba(170,175,185,.7)'),metalness:.45,roughness:.45}),
   viper:S({color:0xffffff,map:paint('pViper','#2c6440','rgba(170,180,175,.7)'),metalness:.35,roughness:.42}),
   red:S({color:0xffffff,map:paint('pRed','#a3241a','rgba(190,180,170,.75)'),metalness:.35,roughness:.42}),
   camo:S({color:0xffffff,map:paint('pCamo','#596046','rgba(150,150,140,.6)',['#3d4430','#7a7454','#2a2d22']),metalness:.1,roughness:.7}),
   white:S({color:0xdfe3e8,metalness:.2,roughness:.35}),
   lens:S({color:0x1d3f7a,metalness:.9,roughness:.06,emissive:0x0a1a40,ei:2}),
   glassR:new T.MeshBasicMaterial({color:0xff3030}),
   dot:new T.MeshBasicMaterial({color:0xfff6c8}),
   hole:new T.MeshBasicMaterial({color:0x050505}),
   cyan:new T.MeshBasicMaterial({color:0x40fff0}),
   blueGlow:new T.MeshBasicMaterial({color:0x5ab8ff}),
   plasma:new T.MeshBasicMaterial({color:0xff8a30}),
   pilot:new T.MeshBasicMaterial({color:0x6aa8ff}),
   raro:S({color:0x1d4fae,metalness:.6,roughness:.3,emissive:0x2f7dff,emissiveIntensity:.55}),
   epico:S({color:0x5a1f9a,metalness:.6,roughness:.3,emissive:0xa04dff,emissiveIntensity:.6}),
   legg:S({color:0xc9962e,metalness:1,roughness:.22,emissive:0xffb52e,emissiveIntensity:.35,ei:1.4}),
   blade:S({color:0xd8dde2,metalness:1,roughness:.16,ei:1.5}),
   edge:S({color:0xf4f6f8,metalness:1,roughness:.06,ei:1.8}),
   leather:S({color:0x4a2f1c,metalness:0,roughness:.8,bumpMap:stip,bumpScale:.3}),
   cord:S({color:0x3a3a2e,metalness:0,roughness:.95}),
   string:new T.MeshBasicMaterial({color:0xd8d0c0}),
   fletch:new T.MeshBasicMaterial({color:0xd03020}),
   tier:[S({color:0xffffff,map:wood,metalness:0,roughness:.6}),S({color:0x7d8086,metalness:.05,roughness:.92,flatShading:true}),S({color:0xb8bec6,metalness:.9,roughness:.3,ei:1.3})],
   tierEdge:[S({color:0xb08060,metalness:0,roughness:.6,map:wood}),S({color:0xa9adb4,metalness:.05,roughness:.75,flatShading:true}),S({color:0xf0f3f6,metalness:1,roughness:.1,ei:1.6})]};
  return WM;}
// ---- hands ----
function rHand43(g,x,y,z,rx){const h=G43(g,x,y,z);h.rotation.x=rx||0;const gm=gloveM;
  M43(h,rboxG(.05,.085,.075,.012),gm,.006,0,.03);for(let i=0;i<4;i++){const f=M43(h,rboxG(.052,.018,.03,.007),gm,-.003,.03-i*.02,-.03);f.rotation.z=.05;}
  M43(h,rboxG(.018,.045,.022,.007),gm,-.026,.035,0,0,0,-.3);M43(h,rboxG(.06,.02,.08,.008),gm,.006,-.048,.03);
  const sl=M43(h,latheG('sleeveR',[[0,.17],[.044,.17],[.049,.12],[.047,-.14],[.038,-.16],[0,-.16]],12),sleeveM,.018,-.085,.2,.62-(rx||0));return h;}
function lHand43(g,x,y,z){const h=G43(g,x,y,z);const gm=gloveM;M43(h,rboxG(.07,.03,.09,.012),gm,0,-.008,0);for(let i=0;i<3;i++)M43(h,rboxG(.018,.05,.022,.006),gm,.03,.012,-.03+i*.024,0,0,.25);
  M43(h,rboxG(.016,.04,.04,.006),gm,-.034,.012,.01,0,0,-.3);M43(h,latheG('sleeveL2',[[0,.2],[.036,.2],[.04,.15],[.039,-.15],[.032,-.17],[0,-.17]],12),sleeveM,-.07,-.16,.12,1.38,.85,0);return h;}
function flash43(g,z,y,size,col){const s=new T.Sprite(new T.SpriteMaterial({map:flashTex,color:col,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0}));s.position.set(0,y,z);s.scale.set(size,size,1);g.add(s);return s;}
function rail43(g,mat,y,z0,z1,w){const L=Math.abs(z1-z0);M43(g,rboxG(w||.03,.008,L,.002),mat,0,y,(z0+z1)/2);for(let z=Math.min(z0,z1)+.008;z<Math.max(z0,z1)-.004;z+=.016)M43(g,rboxG((w||.03)+.004,.008,.008,.0015),mat,0,y+.007,z);}
function port43(g,x,y,z){const o=new T.Object3D();o.position.set(x,y,z);g.add(o);return o;}
// ---------------- models ----------------
const HI43={};
// extra viewmodel lights for the detailed set (always present -> same shader programs on every preset; 0 on Bassa)
const vmKey43=new T.DirectionalLight(0xfff4e8,0),vmRim43=new T.DirectionalLight(0xa8c4ff,0);vmKey43.position.set(.8,1.2,.9);vmRim43.position.set(-1,.6,-1.2);vmScene.add(vmKey43,vmRim43);
gfxOn43(q=>{vmKey43.visible=vmRim43.visible=q!=='bassa';vmKey43.intensity=q==='bassa'?0:q==='alta'?2.1:1.8;vmRim43.intensity=q==='bassa'?0:1.5;});
function hiKnife(){const W=wmat43(),g=new T.Group();
  M43(g,profG('kBlade',[[-.06,-.012],[-.06,.016],[-.25,.016],[-.33,.022],[-.37,.004],[-.33,-.008],[-.26,-.016]],.007,.0025),W.blade);
  M43(g,profG('kEdge',[[-.065,-.0135],[-.26,-.0175],[-.335,-.009],[-.372,.003],[-.33,-.004],[-.26,-.011],[-.065,-.008]],.0035,.0008),W.edge);
  M43(g,rboxG(.0075,.006,.17,.001),W.park,0,.006,-.16);
  M43(g,rboxG(.026,.05,.014,.004),W.gun,0,.002,-.055);
  M43(g,latheG('kHandle',[[0,-.05],[.017,-.05],[.019,-.04],[.017,-.03],[.019,-.02],[.017,-.01],[.019,0],[.017,.01],[.019,.02],[.017,.03],[.019,.04],[.016,.05],[0,.05]],12),W.rubber,0,0,.0);
  M43(g,cylG(.021,.016,14),W.gun,0,0,.056);rHand43(g,0,-.01,.0,0);
  return {g,ud:{},base:[.26,-.24,-.42],rot:[.15,-.35,.5]};}
function hiPistol(){const W=wmat43(),g=new T.Group(),slide=G43(g,0,0,0);
  M43(slide,profG('pSlide',[[.036,.036],[.036,.079],[-.168,.079],[-.19,.071],[-.19,.036]],.034,.004),W.gun);
  for(let i=0;i<7;i++)M43(slide,rboxG(.0352,.03,.0025,.0008),W.park,0,.058,.03-i*.0065);
  M43(slide,rboxG(.002,.016,.042,.001),W.hole,.0172,.064,-.045);
  M43(slide,rboxG(.006,.011,.007,.0012),W.park,0,.0845,-.176);M43(slide,cylG(.0019,.002,8),W.dot,0,.087,-.1715);
  for(const sx of [-.009,.009]){M43(slide,rboxG(.007,.011,.009,.0012),W.park,sx,.0845,.028);M43(slide,cylG(.0017,.002,8),W.dot,sx,.087,.0328);}
  M43(g,tubeG(.0095,.005,.012,16),W.steel,0,.057,-.19);M43(g,cylG(.0052,.002,10),W.hole,0,.057,-.1965);
  M43(g,profG('pFrame',[[.03,.037],[.03,.02],[-.015,.02],[-.035,.006],[-.172,.006],[-.172,.037]],.03,.003),W.poly);rail43(g,W.poly,.003,-.085,-.165,.024);
  M43(g,rboxG(.012,.006,.058,.002),W.poly,0,-.024,-.034);M43(g,rboxG(.012,.034,.007,.002),W.poly,0,-.008,-.061,.3);
  M43(g,rboxG(.006,.024,.008,.002),W.steel,0,-.004,-.02,.3);
  M43(g,profG('pGrip',[[-.006,.021],[.012,-.097],[.052,-.097],[.056,-.07],[.04,.0],[.047,.03],[.03,.037]],.034,.006),W.poly);
  for(const sx of [-.0175,.0175])M43(g,profG('pPanel',[[.004,.0],[.016,-.08],[.044,-.08],[.034,-.0]],.002,.0005),W.rubber,sx,0,0);
  M43(g,rboxG(.008,.015,.012,.002),W.gun,0,.064,.042,-.4);
  const mag=G43(g,0,0,0);M43(mag,profG('pMag',[[.004,.0],[.016,-.098],[.046,-.098],[.036,.0]],.024,.002),W.park);M43(mag,rboxG(.036,.009,.046,.003),W.gun,0,-.103,.032,-.2);
  rHand43(g,.002,-.045,.03,-.25);const fl=flash43(g,-.215,.057,.32,0xffd080);
  return {g,ud:{flash:fl,muzzleZ:-.21,mag,magType:'mag',slide,port:port43(g,.02,.066,-.045),shell:'p'},base:[.2,-.19,-.42],rot:[0,0,0]};}
function hiShotgun(){const W=wmat43(),g=new T.Group();
  M43(g,cylG(.017,.64,18),W.blued,0,.042,-.33);M43(g,tubeG(.019,.013,.02,18),W.steel,0,.042,-.645);M43(g,cylG(.013,.003,12),W.hole,0,.042,-.654);
  M43(g,cylG(.0135,.5,16),W.blued,0,.008,-.27);M43(g,cylG(.016,.02,14),W.steel,0,.008,-.52);M43(g,cylG(.004,.006,8),W.brass,0,.064,-.64);
  for(const z of [-.42,-.2])M43(g,rboxG(.04,.046,.012,.003),W.park,0,.025,z);
  M43(g,profG('sgRec',[[.07,.012],[.07,.066],[-.06,.066],[-.06,-.012],[.03,-.016],[.05,-.01]],.052,.006),W.gun);
  M43(g,rboxG(.002,.03,.07,.001),W.hole,.0265,.04,0);M43(g,rboxG(.002,.012,.05,.001),W.hole,0,-.0135,-.0);
  M43(g,rboxG(.01,.006,.05,.002),W.park,0,-.04,.06);M43(g,rboxG(.01,.03,.007,.002),W.park,0,-.026,.034,.3);M43(g,rboxG(.006,.022,.008,.002),W.steel,0,-.022,.055,.3);
  M43(g,profG('sgStock',[[.07,.06],[.07,-.012],[.11,-.035],[.15,-.07],[.33,-.085],[.33,.03],[.16,.04],[.11,.056]],.046,.008),W.wood);
  M43(g,rboxG(.05,.12,.02,.006),W.rubber,0,-.03,.34,-.12);
  const pump=G43(g,0,.005,-.3);M43(pump,cylG(.027,.17,18),W.woodD,0,0,0);for(let i=0;i<7;i++)M43(pump,tubeG(.0285,.0255,.006,18),W.park,0,0,-.065+i*.022);
  lHand43(pump,0,-.03,0);rHand43(g,0,-.035,.1,-.35);const fl=flash43(g,-.67,.042,.5,0xffc060);
  return {g,ud:{flash:fl,muzzleZ:-.63,pump,mag:pump,magType:'pump',port:port43(g,.03,.04,0),shell:'s'},base:[.2,-.2,-.38],rot:[0,0,0]};}
function hiLaser(){const W=wmat43(),g=new T.Group();
  M43(g,profG('lzBody',[[.08,.0],[.08,.07],[-.12,.075],[-.3,.062],[-.32,.02],[-.2,.0],[-.05,-.01]],.07,.012),W.white);
  M43(g,profG('lzTop',[[.04,.07],[.04,.088],[-.24,.084],[-.26,.068]],.03,.004),W.gun);
  M43(g,rboxG(.074,.012,.2,.003),W.gun,0,.035,-.13);for(let i=0;i<5;i++)M43(g,rboxG(.0755,.004,.02,.001),W.cyan,0,.035,-.06-i*.035);
  M43(g,cylG(.022,.2,18),W.gun,0,.04,-.42);M43(g,tubeG(.03,.02,.02,18),W.steel,0,.04,-.525);
  const coils=[];for(let i=0;i<3;i++){const c=M43(g,new T.TorusGeometry(.027,.006,6,18),W.cyan,0,.04,-.36-i*.045);coils.push(c);}
  const cell=G43(g,0,0,0);M43(cell,rboxG(.04,.06,.07,.008),W.gun,0,-.03,-.12);M43(cell,rboxG(.042,.03,.05,.005),new T.MeshBasicMaterial({color:0x1aff90}),0,-.032,-.12);
  M43(g,profG('lzGrip',[[.02,.0],[.035,-.1],[.07,-.1],[.06,.0]],.04,.007),W.poly);M43(g,profG('lzStock',[[.08,.065],[.24,.05],[.25,-.04],[.2,-.045],[.08,.0]],.055,.01),W.white);
  rHand43(g,0,-.045,.045,-.2);lHand43(g,0,-.005,-.24);const fl=flash43(g,-.55,.04,.32,0x40fff0);
  return {g,ud:{flash:fl,muzzleZ:-.53,coils,cell,mag:cell,magType:'cell'},base:[.2,-.2,-.4],rot:[0,0,0]};}
function hiSMG(){const W=wmat43(),g=new T.Group();
  M43(g,profG('smRec',[[.12,.0],[.12,.07],[-.17,.07],[-.17,.008],[-.04,.0]],.056,.006),W.viper);
  rail43(g,W.park,.076,.1,-.15,.03);M43(g,rboxG(.058,.012,.24,.003),W.raro,0,.04,-.03);
  M43(g,cylG(.024,.17,16),W.park,0,.038,-.26);for(let i=0;i<5;i++)M43(g,cylG(.006,.05,8),W.hole,.022,.038,-.2-i*.028,0,0,Math.PI/2);
  M43(g,tubeG(.026,.012,.025,16),W.gun,0,.038,-.35);
  M43(g,rboxG(.06,.026,.016,.004),W.park,0,.075,.06);M43(g,cylG(.006,.02,8),W.steel,.034,.055,.03,0,0,Math.PI/2);
  const mag=G43(g,0,0,0);M43(mag,profG('smMag',[[-.02,.0],[-.035,-.16],[-.005,-.16],[.012,.0]],.03,.004),W.park);M43(mag,rboxG(.036,.012,.04,.004),W.gun,0,-.164,-.02);
  M43(g,profG('smGrip',[[.06,.0],[.075,-.11],[.11,-.11],[.11,-.085],[.095,.0]],.036,.007),W.poly);
  M43(g,rboxG(.01,.006,.05,.002),W.park,0,-.022,.04);M43(g,rboxG(.006,.022,.008,.002),W.steel,0,-.012,.035,.3);
  M43(g,profG('smFG',[[-.1,.0],[-.11,-.07],[-.08,-.07],[-.075,.0]],.03,.006),W.poly);
  for(const sx of [-.022,.022])M43(g,cylG(.0045,.2,8),W.steel,sx,.02,.22);M43(g,rboxG(.05,.07,.012,.004),W.rubber,0,.0,.325);
  rHand43(g,0,-.05,.085,-.2);lHand43(g,0,-.05,-.095);const fl=flash43(g,-.37,.038,.28,0xffe090);
  return {g,ud:{flash:fl,muzzleZ:-.36,mag,magType:'mag',port:port43(g,.03,.05,-.02),shell:'p',accent:W.raro},base:[.2,-.19,-.42],rot:[0,0,0]};}
function hiAR(){const W=wmat43(),g=new T.Group();
  M43(g,profG('arUp',[[.1,.04],[.1,.088],[-.16,.088],[-.16,.04]],.054,.006),W.tan);rail43(g,W.park,.094,.09,-.36,.03);
  M43(g,profG('arLow',[[.12,.0],[.12,.042],[-.14,.042],[-.14,.01],[-.08,-.002],[.02,-.002]],.05,.006),W.tan);
  M43(g,rboxG(.06,.06,.24,.008),W.park,0,.062,-.28);for(let i=0;i<6;i++)for(const sx of [-.0305,.0305])M43(g,rboxG(.002,.012,.024,.002),W.hole,sx,.062,-.19-i*.036);
  M43(g,rboxG(.062,.008,.24,.002),W.epico,0,.033,-.28);
  M43(g,cylG(.011,.16,14),W.blued,0,.062,-.47);const br=M43(g,latheG('arBrake',[[0,-.03],[.016,-.03],[.016,.03],[0,.03]],14),W.gun,0,.062,-.57);
  for(let i=0;i<3;i++)M43(g,rboxG(.034,.004,.006,.001),W.hole,0,.07,-.555-i*.012);
  M43(g,rboxG(.03,.03,.008,.003),W.park,0,.11,-.38);M43(g,rboxG(.004,.02,.004,.001),W.park,0,.13,-.38);
  M43(g,cylG(.022,.07,18),W.gun,0,.128,-.08);M43(g,tubeG(.026,.019,.012,18),W.gun,0,.128,-.12);M43(g,cylG(.019,.003,16),W.lens,0,.128,-.116);M43(g,cylG(.0035,.002,8),W.glassR,0,.128,-.05);
  M43(g,rboxG(.024,.03,.05,.004),W.park,0,.104,-.08);M43(g,cylG(.008,.012,10),W.park,.03,.128,-.08,0,0,Math.PI/2);
  M43(g,rboxG(.05,.012,.016,.004),W.park,0,.098,.09);M43(g,rboxG(.002,.016,.04,.001),W.hole,.028,.064,-.02);
  const mag=G43(g,0,0,0);M43(mag,profG('arMag',[[-.05,.0],[-.06,-.06],[-.085,-.15],[-.05,-.165],[-.025,-.07],[-.01,.0]],.026,.004),W.park);
  M43(g,profG('arGrip',[[.06,.0],[.08,-.11],[.115,-.11],[.112,-.085],[.095,.0]],.036,.007),W.poly);
  M43(g,rboxG(.01,.006,.05,.002),W.tan,0,-.02,.04);M43(g,rboxG(.006,.022,.008,.002),W.steel,0,-.01,.035,.3);
  M43(g,cylG(.016,.14,14),W.park,0,.05,.18);M43(g,profG('arStock',[[.16,.085],[.34,.085],[.36,.07],[.36,-.07],[.33,-.075],[.24,-.02],[.16,.02]],.05,.008),W.tan);M43(g,rboxG(.054,.15,.02,.006),W.rubber,0,.01,.36);
  rHand43(g,0,-.05,.09,-.2);lHand43(g,0,.02,-.3);const fl=flash43(g,-.62,.062,.36,0xffd080);
  return {g,ud:{flash:fl,muzzleZ:-.6,mag,magType:'mag',port:port43(g,.03,.064,-.02),shell:'r',accent:W.epico},base:[.19,-.2,-.4],rot:[0,0,0]};}
function hiThunder(){const W=wmat43(),g=new T.Group();
  M43(g,profG('thRec',[[.1,-.01],[.1,.075],[-.2,.075],[-.2,-.01]],.074,.01),W.navy);rail43(g,W.park,.081,.06,-.18,.032);
  M43(g,cylG(.03,.36,18),W.blued,0,.05,-.37);for(let i=0;i<8;i++)M43(g,tubeG(.036,.031,.018,16),W.park,0,.05,-.24-i*.03);
  M43(g,tubeG(.038,.022,.05,18),W.gun,0,.05,-.56);
  const drum=G43(g,0,-.085,-.08);M43(drum,cylG(.075,.07,24),W.navy,0,0,0,0,Math.PI/2,0);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;M43(drum,rboxG(.074,.008,.008,.002),W.park,0,Math.cos(a)*.074,Math.sin(a)*.074,a,0,0);}
  M43(drum,cylG(.03,.074,16),W.steel,0,0,0,0,Math.PI/2,0);
  for(const sx of [-.0385,.0385])M43(g,rboxG(.003,.012,.26,.002),W.epico,sx,.035,-.08);for(const sx of [-.0395,.0395])M43(g,rboxG(.002,.004,.24,.001),W.blueGlow,sx,.012,-.08);
  M43(g,profG('thGrip',[[.06,.0],[.08,-.11],[.115,-.11],[.112,-.085],[.095,.0]],.04,.007),W.poly);M43(g,profG('thStock',[[.1,.07],[.32,.06],[.33,-.06],[.28,-.065],[.18,-.01],[.1,-.01]],.062,.01),W.navy);
  M43(g,rboxG(.066,.13,.02,.006),W.rubber,0,.0,.33);rHand43(g,0,-.05,.09,-.2);lHand43(g,0,.01,-.3);const fl=flash43(g,-.61,.05,.55,0xbfe0ff);
  return {g,ud:{flash:fl,muzzleZ:-.6,mag:drum,magType:'mag',port:port43(g,.04,.05,-.02),shell:'s',accent:W.epico},base:[.2,-.2,-.38],rot:[0,0,0]};}
function hiPlasma(){const W=wmat43(),g=new T.Group();
  M43(g,profG('plBody',[[.12,.0],[.12,.09],[-.1,.1],[-.28,.075],[-.3,.02],[-.18,-.005],[-.02,-.01]],.08,.014),W.gun);
  M43(g,profG('plTrim',[[.1,.1],[.1,.112],[-.12,.11],[-.26,.085],[-.25,.074],[-.1,.098]],.05,.006),W.legg);
  for(const sx of [-.041,.041])M43(g,profG('plSide',[[.08,.04],[-.2,.05],[-.24,.03],[.08,.02]],.004,.001),W.legg,sx,0,0);
  M43(g,cylG(.032,.12,20),W.gun,0,.045,-.36);const coils=[];for(let i=0;i<3;i++){const c=M43(g,new T.TorusGeometry(.04,.008,8,24),W.plasma,0,.045,-.33-i*.04);coils.push(c);}
  M43(g,tubeG(.04,.025,.03,20),W.legg,0,.045,-.43);const core=M43(g,cylG(.022,.012,16),W.plasma,0,.045,-.445);
  const cell=G43(g,0,0,0);M43(cell,cylG(.024,.11,16),W.gun,.045,.0,-.12);M43(cell,cylG(.016,.09,12),W.plasma,.052,.0,-.12);
  for(let i=0;i<4;i++)M43(g,rboxG(.082,.004,.012,.001),W.hole,0,.07,-.02-i*.024);
  M43(g,profG('plGrip',[[.06,.0],[.08,-.11],[.115,-.11],[.112,-.085],[.095,.0]],.04,.008),W.poly);M43(g,profG('plStock',[[.12,.085],[.3,.06],[.31,-.05],[.26,-.055],[.12,-.005]],.06,.012),W.gun);
  M43(g,rboxG(.062,.11,.016,.005),W.legg,0,.005,.31);rHand43(g,0,-.05,.09,-.2);lHand43(g,0,.0,-.26);const fl=flash43(g,-.47,.045,.42,0xff9a40);
  return {g,ud:{flash:fl,muzzleZ:-.45,coils,glow:W.plasma,cell,mag:cell,magType:'cell',accent:W.legg,legg:1},base:[.2,-.2,-.4],rot:[0,0,0]};}
function hiRevolver(){const W=wmat43(),g=new T.Group();
  M43(g,profG('rvFrame',[[.03,.02],[.03,.085],[-.02,.085],[-.08,.07],[-.08,.025],[-.04,.012],[.0,.012]],.036,.005),W.blued);
  M43(g,cylG(.013,.21,16),W.blued,0,.065,-.18);M43(g,rboxG(.016,.012,.21,.003),W.blued,0,.08,-.18);M43(g,rboxG(.014,.016,.17,.004),W.blued,0,.046,-.165);
  M43(g,rboxG(.005,.012,.008,.001),W.park,0,.09,-.28);M43(g,cylG(.0075,.003,12),W.hole,0,.065,-.287);
  const cyl=G43(g,0,.05,-.04);M43(cyl,cylG(.036,.058,24,.006),W.steel,0,0,0);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;M43(cyl,cylG(.0075,.06,10),W.hole,Math.cos(a)*.022,Math.sin(a)*.022,.0);
    M43(cyl,rboxG(.006,.006,.046,.002),W.park,Math.cos(a+.52)*.035,Math.sin(a+.52)*.035,0,0,0,a+.52);}
  M43(cyl,cylG(.008,.064,10),W.chrome,0,0,0);
  M43(g,rboxG(.01,.02,.014,.003),W.blued,0,.09,.035,-.5);M43(g,rboxG(.012,.006,.05,.002),W.blued,0,-.002,-.015);M43(g,rboxG(.006,.022,.008,.002),W.chrome,0,.0,-.005,.3);
  M43(g,profG('rvGrip',[[.0,.02],[.025,-.09],[.06,-.095],[.065,-.07],[.04,.03]],.04,.01),W.check);M43(g,rboxG(.042,.01,.03,.004),W.blued,0,-.092,.042,-.3);
  rHand43(g,.002,-.04,.035,-.3);const fl=flash43(g,-.3,.065,.38,0xffd080);
  return {g,ud:{flash:fl,muzzleZ:-.29,mag:cyl,magType:'swing',drum:cyl},base:[.2,-.19,-.42],rot:[0,0,0]};}
function hiDBarrel(){const W=wmat43(),g=new T.Group();const brk=G43(g,0,.03,-.05);
  for(const sx of [-.0215,.0215]){M43(brk,cylG(.0215,.56,18),W.blued,sx,.012,-.3);M43(brk,cylG(.015,.003,14),W.hole,sx,.012,-.582);}
  M43(brk,rboxG(.016,.01,.54,.003),W.blued,0,.034,-.3);M43(brk,cylG(.004,.006,8),W.brass,0,.042,-.56);
  M43(brk,profG('dbFore',[[-.04,.0],[-.25,.002],[-.27,-.02],[-.25,-.035],[-.04,-.035]],.07,.01),W.wood);
  M43(g,profG('dbRec',[[.06,-.02],[.06,.06],[-.05,.06],[-.05,-.02]],.068,.008),W.chrome);M43(g,rboxG(.07,.004,.08,.001),W.legg,0,.045,.005);
  for(const sx of [-.012,.012])M43(g,rboxG(.008,.02,.016,.002),W.blued,sx,.07,.045,-.4);
  M43(g,rboxG(.012,.006,.05,.002),W.blued,0,-.035,.06);M43(g,rboxG(.006,.022,.008,.002),W.chrome,0,-.026,.055,.3);
  M43(g,profG('dbStock',[[.06,.055],[.12,.04],[.36,.01],[.36,-.1],[.2,-.07],[.11,-.06],[.06,-.02]],.054,.01),W.wood);M43(g,rboxG(.056,.115,.02,.006),W.rubber,0,-.045,.365,-.1);
  rHand43(g,0,-.045,.1,-.4);lHand43(brk,0,-.05,-.17);const fl=flash43(g,-.66,.042,.58,0xffc060);
  return {g,ud:{flash:fl,muzzleZ:-.64,mag:brk,magType:'break',shell:'s',port:port43(g,0,.05,.0)},base:[.2,-.2,-.38],rot:[0,0,0]};}
function hiCrossbow(){const W=wmat43(),g=new T.Group();
  M43(g,profG('cbStock',[[.25,.02],[.25,-.06],[.1,-.04],[.06,-.1],[.03,-.1],[.0,-.02],[-.42,-.0],[-.42,.03],[.0,.035]],.05,.008),W.wood);
  M43(g,rboxG(.024,.012,.42,.003),W.park,0,.04,-.18);
  for(const sd of [-1,1]){const L=M43(g,rboxG(.28,.02,.034,.008),W.gun,sd*.14,.025,-.34);L.rotation.y=-sd*.35;M43(g,cylG(.014,.016,12),W.steel,sd*.271,.025,-.292,Math.PI/2,0,0);
   const s2=M43(g,rboxG(.003,.003,.301,.0008),W.string,sd*.1355,.035,-.226);s2.rotation.y=-sd*1.117;}
  M43(g,rboxG(.06,.02,.014,.004),W.gun,0,.022,-.42);M43(g,new T.TorusGeometry(.035,.005,6,14,Math.PI),W.gun,0,.0,-.44,Math.PI/2,0,0);
  const bolt=M43(g,cylG(.006,.36,8),W.woodD,0,.05,-.24),tip=M43(g,latheG('cbTip',[[0,-.03],[.012,.0],[.006,.012],[0,.012]],8),W.edge,0,.05,-.43),fl=M43(g,rboxG(.002,.022,.05,.001),W.fletch,0,.06,-.08);
  M43(g,cylG(.017,.13,16),W.gun,0,.09,-.08);M43(g,tubeG(.022,.016,.012,16),W.gun,0,.09,-.15);M43(g,cylG(.016,.003,14),W.lens,0,.09,-.146);M43(g,rboxG(.012,.022,.03,.003),W.park,0,.07,-.08);
  M43(g,profG('cbGrip',[[.02,-.02],[.04,-.11],[.075,-.11],[.06,-.02]],.036,.007),W.poly);
  rHand43(g,0,-.05,.045,-.25);lHand43(g,0,-.03,-.24);const ffl=flash43(g,-.46,.04,.001,0xffffff);
  return {g,ud:{flash:ffl,muzzleZ:-.46,bolt:[bolt,tip,fl]},base:[.2,-.2,-.4],rot:[0,0,0]};}
function hiSniper(){const W=wmat43(),g=new T.Group();
  M43(g,profG('snStock',[[.36,.05],[.36,-.09],[.3,-.09],[.22,-.03],[.12,-.03],[.09,-.12],[.05,-.12],[.04,-.02],[-.42,-.0],[-.42,.04],[.1,.045],[.16,.06]],.062,.01),W.camo);
  M43(g,rboxG(.066,.13,.02,.006),W.rubber,0,-.02,.37);M43(g,rboxG(.024,.03,.14,.006),W.camo,0,.07,.2);
  M43(g,cylG(.022,.2,20),W.gun,0,.05,-.07);M43(g,cylG(.016,.5,18),W.blued,0,.05,-.58);for(let i=0;i<6;i++)for(const sx of [-1,1])M43(g,rboxG(.002,.006,.18,.001),W.park,sx*.0158,.05+(i%3-1)*.007,-.6);
  M43(g,latheG('snBrake',[[0,-.05],[.026,-.05],[.026,.05],[0,.05]],16),W.gun,0,.05,-.86);for(let i=0;i<3;i++)for(const sx of [-1,1])M43(g,rboxG(.004,.016,.012,.001),W.hole,sx*.026,.05,-.84-i*.02);
  M43(g,cylG(.006,.05,10),W.steel,.03,.06,.02,0,0,Math.PI/2);const bk=M43(g,cylG(.011,.014,12),W.steel,.058,.06,.02,0,0,Math.PI/2);
  M43(g,cylG(.026,.26,20),W.gun,0,.125,-.12);M43(g,latheG('snObj',[[0,-.06],[.026,-.06],[.04,-.02],[.04,.04],[0,.04]],20),W.gun,0,.125,-.29);M43(g,cylG(.037,.003,20),W.lens,0,.125,-.33);
  M43(g,latheG('snEye',[[0,-.03],[.026,-.03],[.032,.02],[.032,.04],[0,.04]],20),W.rubber,0,.125,.035);M43(g,cylG(.012,.024,12),W.park,0,.155,-.12);M43(g,cylG(.012,.024,12),W.park,.034,.125,-.12,0,0,Math.PI/2);
  for(const z of [-.18,-.05])M43(g,rboxG(.03,.05,.025,.005),W.park,0,.09,z);M43(g,rboxG(.068,.006,.12,.002),W.epico,0,.025,-.12);
  for(const sx of [-.012,.012])M43(g,cylG(.006,.2,8),W.park,sx,-.008,-.42,.05,0,0);
  const mag=G43(g,0,0,0);M43(mag,rboxG(.04,.07,.1,.006),W.park,0,-.03,-.06);
  rHand43(g,0,-.06,.07,-.25);lHand43(g,0,-.02,-.3);const fl=flash43(g,-.93,.05,.5,0xfff0c0);
  return {g,ud:{flash:fl,muzzleZ:-.9,mag,magType:'mag',boltAct:bk,port:port43(g,.04,.06,-.03),shell:'b',accent:W.epico},base:[.2,-.24,-.45],rot:[.02,-.05,0]};}
function hiGL(){const W=wmat43(),g=new T.Group();
  M43(g,cylG(.044,.3,22),W.olive,0,.05,-.3);for(let i=0;i<4;i++)M43(g,rboxG(.006,.096,.24,.002),W.park,0,.05,-.31,0,0,i*Math.PI/4);
  M43(g,tubeG(.052,.036,.035,22),W.gun,0,.05,-.465);M43(g,cylG(.036,.003,18),W.hole,0,.05,-.48);
  const drum=G43(g,0,.035,-.08);M43(drum,cylG(.072,.14,24,.01),W.olive,0,0,0);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;M43(drum,cylG(.024,.142,12),W.park,Math.cos(a)*.044,Math.sin(a)*.044,0);M43(drum,cylG(.018,.144,12),W.hole,Math.cos(a)*.044,Math.sin(a)*.044,0);
    M43(drum,rboxG(.01,.012,.13,.003),W.park,Math.cos(a+.52)*.07,Math.sin(a+.52)*.07,0,0,0,a+.52);}
  M43(drum,cylG(.014,.15,12),W.steel,0,0,0);M43(g,rboxG(.09,.1,.03,.01),W.gun,0,.045,.0);M43(g,rboxG(.09,.1,.02,.01),W.gun,0,.045,-.16);
  M43(g,rboxG(.026,.05,.03,.004),W.park,0,.11,-.26);M43(g,rboxG(.004,.03,.004,.001),W.epico,0,.14,-.26);
  M43(g,profG('glGrip',[[.02,.0],[.04,-.11],[.075,-.11],[.072,-.085],[.055,.0]],.04,.007),W.poly);M43(g,profG('glFG',[[-.25,.0],[-.265,-.09],[-.23,-.09],[-.225,.0]],.034,.006),W.poly);
  for(const sx of [-.025,.025])M43(g,cylG(.006,.22,8),W.steel,sx,.03,.13);M43(g,rboxG(.06,.09,.016,.005),W.rubber,0,.01,.245);M43(g,rboxG(.092,.008,.03,.002),W.epico,0,.098,.0);
  rHand43(g,0,-.05,.05,-.2);lHand43(g,0,-.07,-.245);const fl=flash43(g,-.5,.05,.5,0xffb060);
  return {g,ud:{flash:fl,muzzleZ:-.5,drum,mag:drum,magType:'drumTilt',accent:W.epico},base:[.2,-.21,-.38],rot:[0,0,0]};}
function hiFlamer(){const W=wmat43(),g=new T.Group();
  const tank=G43(g,0,-.08,-.06);M43(tank,cylG(.07,.3,24,.02),W.red,0,0,0);for(const z of [-.155,.155])M43(tank,latheG('flCap',[[0,0],[.07,0],[.05,.03],[0,.035]],20),W.chrome,0,0,z,0,z<0?Math.PI:0,0);
  M43(tank,cylG(.022,.012,16),W.chrome,0,.07,-.05,Math.PI/2,0,0);M43(tank,cylG(.017,.003,16),new T.MeshBasicMaterial({color:0xeeeeee}),0,.077,-.05,Math.PI/2,0,0);
  M43(tank,rboxG(.004,.012,.012,.001),W.hole,0,.079,-.05);for(let i=0;i<2;i++)M43(tank,tubeG(.072,.068,.012,24),W.legg,0,0,-.08+i*.16);
  M43(g,profG('flBody',[[.1,.0],[.1,.07],[-.2,.07],[-.2,.0]],.062,.008),W.gun);M43(g,rboxG(.064,.006,.28,.002),W.legg,0,.074,-.05);
  M43(g,cylG(.028,.24,18),W.gun,0,.04,-.33);for(let i=0;i<6;i++)M43(g,new T.TorusGeometry(.032,.004,6,18),W.copper,0,.04,-.25-i*.03);
  M43(g,latheG('flNoz',[[.02,-.06],[.034,-.06],[.03,.0],[.022,.03],[.02,.03]],18),W.chrome,0,.04,-.48);M43(g,cylG(.016,.003,14),W.hole,0,.04,-.54);
  M43(g,new T.TorusGeometry(.06,.008,8,16,Math.PI*.9),W.cord,0,-.03,-.24,0,Math.PI/2,0);
  M43(g,rboxG(.012,.02,.03,.003),W.chrome,.03,.03,-.5);
  M43(g,profG('flGrip',[[.06,.0],[.08,-.11],[.115,-.11],[.112,-.085],[.095,.0]],.04,.007),W.poly);M43(g,rboxG(.03,.016,.15,.004),W.poly,0,.09,-.15);M43(g,rboxG(.016,.03,.016,.003),W.poly,0,.074,-.21);M43(g,rboxG(.016,.03,.016,.003),W.poly,0,.074,-.09);
  const pil=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0x6aa8ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.9}));pil.position.set(.03,.03,-.52);pil.scale.set(.07,.07,1);g.add(pil);
  rHand43(g,0,-.05,.09,-.2);lHand43(g,0,.1,-.15);const fl=flash43(g,-.6,.04,.3,0xff8a30);
  return {g,ud:{flash:fl,muzzleZ:-.6,pilot:pil,mag:tank,magType:'tank',accent:W.legg,legg:1,nozzle:port43(g,0,.04,-.55)},base:[.2,-.18,-.4],rot:[0,0,0]};}
function hiMinigun(){const W=wmat43(),g=new T.Group();const sp=G43(g,0,.02,-.32);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;M43(sp,cylG(.0125,.54,10),W.blued,Math.cos(a)*.034,Math.sin(a)*.034,0);M43(sp,cylG(.007,.003,8),W.hole,Math.cos(a)*.034,Math.sin(a)*.034,-.271);}
  for(const z of [-.22,-.02,.17])M43(sp,cylG(.056,.026,20),W.gun,0,0,z);M43(sp,cylG(.012,.56,10),W.steel,0,0,0);
  M43(g,rboxG(.12,.13,.22,.016),W.gun,0,.02,0);M43(g,cylG(.07,.1,20),W.park,0,.02,.14);for(let i=0;i<5;i++)M43(g,tubeG(.073,.068,.008,20),W.legg,0,.02,.1+i*.02);
  M43(g,rboxG(.122,.006,.2,.002),W.legg,0,.085,0);
  const box=G43(g,.11,-.06,.0);M43(box,rboxG(.08,.11,.15,.008),W.olive,0,0,0);M43(box,rboxG(.084,.01,.155,.003),W.park,0,.05,0);
  for(let i=0;i<7;i++){const c=M43(g,cylG(.006,.03,8),W.brass,.065-i*.0065,.04+i*.004,-.02,0,0,Math.PI/2);}
  M43(g,rboxG(.03,.02,.15,.006),W.poly,0,.11,-.02);M43(g,rboxG(.02,.03,.02,.004),W.poly,0,.09,-.08);M43(g,rboxG(.02,.03,.02,.004),W.poly,0,.09,.04);
  M43(g,profG('mgGrip',[[.1,-.04],[.12,-.15],[.155,-.15],[.152,-.125],[.135,-.04]],.042,.008),W.poly);
  rHand43(g,0,-.09,.14,-.2);lHand43(g,0,.12,-.03);const fl=flash43(g,-.62,.02,.45,0xffd070);
  return {g,ud:{flash:fl,muzzleZ:-.6,spin:sp,mag:box,magType:'mag',port:port43(g,.07,.0,-.04),shell:'r',accent:W.legg,legg:1},base:[.23,-.25,-.5],rot:[0,0,0]};}
function hiTool(kind){const W=wmat43(),g=new T.Group();M43(g,latheG('tHandle',[[0,-.31],[.016,-.31],[.015,.2],[.013,.3],[.014,.31],[0,.31]],10),W.wood,0,.08,0,-Math.PI/2,0,0);
  M43(g,latheG('tWrap',[[0,-.09],[.019,-.09],[.019,.09],[0,.09]],10),W.leather,0,-.13,0,-Math.PI/2,0,0);for(let i=0;i<5;i++)M43(g,new T.TorusGeometry(.0195,.0025,4,10),W.cord,0,-.2+i*.035,0,Math.PI/2,0,0);
  const heads=[],edges=[];
  if(kind==='axe'){heads.push(M43(g,profG('axHead',[[.03,-.03],[.03,.03],[-.05,.04],[-.09,.065],[-.1,-.06],[-.06,-.035]],.034,.006),W.tier[0],0,.335,0));
    edges.push(M43(g,profG('axEdge',[[-.088,-.058],[-.088,.063],[-.104,.068],[-.106,-.064]],.012,.002),W.tierEdge[0],0,.335,0));}
  else if(kind==='pick'){heads.push(M43(g,profG('pkHead',[[.2,.0],[.1,.03],[.0,.035],[-.1,.03],[-.2,.0],[-.1,.012],[.0,.01],[.1,.012]],.03,.006),W.tier[0],0,.35,0,0,Math.PI/2,0));
    heads.push(M43(g,rboxG(.05,.05,.05,.008),W.tier[0],0,.355,0));edges.push(M43(g,latheG('pkTip',[[0,-.02],[.01,.0],[0,.02]],6),W.tierEdge[0],.2,.348,0,0,Math.PI/2,0));}
  else{heads.push(M43(g,rboxG(.15,.075,.075,.012),W.tier[0],0,.36,0));heads.push(M43(g,cylG(.042,.03,14),W.tier[0],.088,.36,0,0,Math.PI/2,0));
    const cl=M43(g,profG('hmClaw',[[.0,-.02],[.0,.02],[.06,.035],[.1,.0],[.06,.01]],.05,.006),W.tier[0],-.075,.37,0,0,-Math.PI/2,0);heads.push(cl);edges.push(M43(g,cylG(.036,.004,14),W.tierEdge[0],.105,.36,0,0,Math.PI/2,0));}
  M43(g,rboxG(.06,.09,.07,.014),gloveM,0,-.12,0);for(let i=0;i<4;i++)M43(g,rboxG(.022,.018,.07,.006),gloveM,-.035,-.155+i*.022,0);
  M43(g,latheG('tSleeve',[[0,.17],[.055,.17],[.06,.12],[.058,-.14],[.046,-.16],[0,-.16]],12),sleeveM,.02,-.2,.12,.9,0,0);
  return {g,ud:{heads,edges},base:[.26,-.3,-.5],rot:[.2,-.4,.55],scale:.85};}
// ---- install: each VM[k] keeps its classic children (Bassa); a 'hi43' child holds the new model (Media/Alta) ----
const HIB43={knife:hiKnife,pistol:hiPistol,shotgun:hiShotgun,laser:hiLaser,smg:hiSMG,ar:hiAR,thunder:hiThunder,plasma:hiPlasma,revolver:hiRevolver,dbarrel:hiDBarrel,crossbow:hiCrossbow,sniper:hiSniper,glauncher:hiGL,flamer:hiFlamer,minigun:hiMinigun,axe:()=>hiTool('axe'),pick:()=>hiTool('pick'),hammer:()=>hiTool('hammer')};
const UDK43=['flash','muzzleZ','spin','pump','coils','glow','pilot','bolt','heads','cell'];
function vmBuild43(k){const vm=VM[k];if(!vm||vm.userData.hi43)return;const f=HIB43[k];if(!f)return;let r;try{r=f();}catch(e){console.error('hi43 '+k,e);return;}
  const lo={children:vm.children.slice(),ud:{},base:vm.userData.base,rot:vm.userData.rot,scale:vm.scale.x};for(const u of UDK43)if(u in vm.userData)lo.ud[u]=vm.userData[u];
  r.g.name='hi43';r.g.visible=false;if(r.scale){r.g.scale.setScalar(r.scale/lo.scale);}vm.add(r.g);vm.userData.lo43=lo;vm.userData.hi43=r;}
function vmMode43(hi){for(const k in VM){const vm=VM[k];if(hi)vmBuild43(k);const H=vm.userData.hi43,L=vm.userData.lo43;if(!H)continue;
  for(const c of L.children)c.visible=!hi;H.g.visible=hi;for(const u of UDK43)delete vm.userData[u];Object.assign(vm.userData,hi?H.ud:L.ud);
  if(L.ud.flash&&H.ud.flash){(hi?L.ud.flash:H.ud.flash).material.opacity=0;}
  vm.userData.base=hi&&H.base?H.base:L.base;vm.userData.rot=hi&&H.rot?H.rot:L.rot;}
  try{setToolLook();}catch(e){}}
// tool tiers for the new heads
const _stl43=setToolLook;setToolLook=function(){_stl43();for(const k of ['axe','pick','hammer']){const H=VM[k]&&VM[k].userData.hi43;if(!H||!H.g.visible)continue;const t=SV.tools[k]|0,W=wmat43();
  for(const h of H.ud.heads)h.material=W.tier[t];for(const e of H.ud.edges)e.material=W.tierEdge[t];}};
gfxOn43(q=>vmMode43(q!=='bassa'));
(window.__t43=window.__t43||[]).push(['v43_wpn_end',performance.now()]);

(window.__t43=window.__t43||[]).push(['v43_anim',performance.now()]);
// ======================= v4.3 viewmodel animation: draw, recoil spring, sway/strafe roll, breathing, reload (mag out/in), slide/bolt/drum, casings, flames, glow =======================
const A43={last:'',draw:1,prevT:0,kick:0,roll:0,roll2:0,slide:0,boltT:-1,shells:[],flames:[],fT:0,t:0};
const ez43=k=>1-Math.pow(1-k,3),bump43=(k,a,b)=>k<=a||k>=b?0:Math.sin((k-a)/(b-a)*Math.PI);
// casings pool (vm space)
const SHELLG43={p:()=>cylG(.0045,.016,8),r:()=>cylG(.0045,.026,8),b:()=>cylG(.0065,.04,8),s:()=>cylG(.009,.04,10)};
function shellMat43(t){const W=wmat43();return t==='s'?(W.shellR||(W.shellR=new T.MeshStandardMaterial({color:0xb02a20,roughness:.5,metalness:.1}))):W.brass;}
function ejectShell43(vm,type){const ud=vm.userData;if(!ud.port)return;const max=GALTA()?14:7;const pool=A43.shells.slice(0,max);let s=pool.find(q=>q.life<=0);
  if(!s){if(pool.length>=max)s=pool.reduce((a,b)=>a.life<b.life?a:b);else{const m=new T.Mesh(SHELLG43.p(),wmat43().brass);m.visible=false;vmScene.add(m);s={m,v:new T.Vector3(),w:new T.Vector3(),life:0};A43.shells.push(s);}}
  s.m.geometry=SHELLG43[type]?SHELLG43[type]():SHELLG43.p();s.m.material=shellMat43(type);ud.port.getWorldPosition(s.m.position);s.m.rotation.set(Math.random()*3,Math.random()*3,0);
  s.v.set(.9+Math.random()*.5,.9+Math.random()*.5,.15+Math.random()*.3);s.w.set((Math.random()-.5)*30,(Math.random()-.5)*30,(Math.random()-.5)*20);s.life=.75;s.m.visible=true;s.m.scale.setScalar(1);}
function updShells43(dt){for(const s of A43.shells){if(s.life<=0)continue;s.life-=dt;if(s.life<=0){s.m.visible=false;continue;}s.v.y-=5.5*dt;s.m.position.addScaledVector(s.v,dt);
  s.m.rotation.x+=s.w.x*dt;s.m.rotation.y+=s.w.y*dt;s.m.rotation.z+=s.w.z*dt;if(s.life<.15)s.m.scale.setScalar(s.life/.15);}}
// flame sprites near the nozzle (vm space)
const FLTEX43=ctex43('flame43',64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,220,1)');gr.addColorStop(.35,'rgba(255,190,70,.85)');gr.addColorStop(.7,'rgba(255,90,20,.35)');gr.addColorStop(1,'rgba(120,20,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
function flame43(vm){const ud=vm.userData;if(!ud.nozzle)return;const max=GALTA()?18:9;let f=A43.flames.slice(0,max).find(q=>q.life<=0);
  if(!f){if(A43.flames.length>=max)return;const sp=new T.Sprite(new T.SpriteMaterial({map:FLTEX43,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));sp.visible=false;vmScene.add(sp);f={sp,v:new T.Vector3(),life:0};A43.flames.push(f);}
  ud.nozzle.getWorldPosition(f.sp.position);f.v.set((Math.random()-.5)*.25,(Math.random()-.2)*.2,-2.6-Math.random());f.life=f.max=.22+Math.random()*.1;f.sp.visible=true;f.sp.material.rotation=Math.random()*6;}
function updFlames43(dt){for(const f of A43.flames){if(f.life<=0)continue;f.life-=dt;if(f.life<=0){f.sp.visible=false;continue;}const k=1-f.life/f.max;f.sp.position.addScaledVector(f.v,dt);
  const s=.05+k*.42;f.sp.scale.set(s,s,1);f.sp.material.opacity=Math.min(1,(1-k)*1.4);f.sp.material.color.setRGB(1,1-k*.55,1-k*.9);}}
let vmGlow43=new T.PointLight(0xff8a30,0,.9,1.5);vmScene.add(vmGlow43);
function vmExtra43(dt,w,vm){const ud=vm.userData;A43.t+=dt;
  if(w.id!==A43.last){A43.last=w.id;A43.draw=0;A43.slide=0;A43.boltT=-1;}
  // shot detection: the flash timer jumps up on every shot
  const fl=ud.flash,ft=fl&&fl.userData.t||0;if(fl&&ft>A43.prevT+.005&&!w.melee){A43.kick=1;A43.roll=(Math.random()-.5)*Math.min(1,(w.kick||.5));A43.slide=1;
    if(ud.shell&&ud.magType!=='pump'&&ud.magType!=='break')ejectShell43(vm,ud.shell);if(ud.boltAct)A43.boltT=0;if(ud.drum&&ud.magType==='swing')ud.drum.userData.tg=(ud.drum.userData.tg||0)+Math.PI/3;
    if(ud.drum&&ud.magType==='drumTilt')ud.drum.userData.tg=(ud.drum.userData.tg||0)+Math.PI/3;if(ud.magType==='pump')setTimeout(()=>{if(A43.last===w.id)ejectShell43(vm,'s');},380);
    if(fl){const s=(fl.userData.s0||(fl.userData.s0=fl.scale.x))*(.85+Math.random()*.5);fl.scale.set(s*(1+Math.random()*.3),s,1);}}
  A43.prevT=ft;
  // draw / switch
  A43.draw=Math.min(1,A43.draw+dt/.4);const de=1-ez43(A43.draw);vmRoot.rotation.x-=de*.95;vmRoot.rotation.z+=de*.55;vmRoot.position.y-=de*.14;vmRoot.position.x+=de*.05;
  // recoil spring + roll
  A43.kick=Math.max(0,A43.kick-dt*7);const kk=A43.kick*A43.kick;vmRoot.rotation.z+=A43.roll*kk*.12;vmRoot.rotation.y+=A43.roll*kk*.05;
  // breathing + strafe roll
  const br=Math.sin(A43.t*1.7);vmRoot.position.y+=br*.0022;vmRoot.rotation.x+=br*.004;
  const lat=player.vel?player.vel.x*Math.cos(player.yaw)-player.vel.z*Math.sin(player.yaw):0;A43.roll2+=(clamp(-lat*.018,-.09,.09)-A43.roll2)*Math.min(1,dt*8);vmRoot.rotation.z+=A43.roll2;
  // slide blowback / sniper bolt
  A43.slide=Math.max(0,A43.slide-dt*14);if(ud.slide)ud.slide.position.z=.026*Math.sin(Math.min(1,A43.slide)*Math.PI*.5);
  if(ud.boltAct){if(A43.boltT>=0){A43.boltT+=dt;const k=clamp((A43.boltT-.25)/.45,0,1);ud.boltAct.position.z=.02+bump43(k,0,1)*.07;ud.boltAct.rotation.z=Math.PI/2+bump43(k,0,.5)*.9;if(k>=1){A43.boltT=-1;ejectShell43(vm,'b');}}}
  if(ud.drum&&ud.drum.userData.tg!==undefined)ud.drum.rotation.z+=(ud.drum.userData.tg-ud.drum.rotation.z)*Math.min(1,dt*18);
  // reload: magazine out / in
  const m=ud.mag;if(m){if(!m.userData.p0)m.userData.p0=[m.position.x,m.position.y,m.position.z,m.rotation.x,m.rotation.z];const p0=m.userData.p0;
    if(fx.reload>=0){const k=clamp(fx.reload/(fx.reloadDur||1),0,1),T_=ud.magType;vmRoot.rotation.x+=Math.sin(k*Math.PI)*.35;
      if(T_==='mag'||T_==='cell'){const d=T_==='cell'?.12:.24;let o=0,r=0;if(k<.12)o=0;else if(k<.4){o=ez43((k-.12)/.28);r=o;}else if(k<.55){o=1;}else if(k<.82){o=1-ez43((k-.55)/.27);r=o;}
        m.visible=!(k>.4&&k<.55);m.position.set(p0[0]+(T_==='cell'?.06*o:0),p0[1]-d*o,p0[2]+.03*o);m.rotation.x=p0[3]+.35*r;}
      else if(T_==='swing'){const o=bump43(k,.08,.92)>0?Math.min(1,bump43(k,.08,.92)*1.6):0;m.position.x=p0[0]-.055*o;m.rotation.z+=dt*(o>.9?10:0);vmRoot.rotation.z-=o*.35;}
      else if(T_==='break'){const o=Math.min(1,bump43(k,.05,.95)*1.5);m.rotation.x=-.5*o;if(k>.2&&k<.25&&!m.userData.ej){m.userData.ej=1;ejectShell43(vm,'s');ejectShell43(vm,'s');}}
      else if(T_==='pump'){m.position.z=p0[2]+.07*Math.abs(Math.sin(k*Math.PI*3));vmRoot.rotation.z-=Math.sin(k*Math.PI)*.4;}
      else if(T_==='drumTilt'){const o=Math.min(1,bump43(k,.05,.95)*1.6);m.position.x=p0[0]-.05*o;m.rotation.z+=dt*(o>.9?7:0);vmRoot.rotation.z-=o*.3;}
      else if(T_==='tank'){const o=Math.min(1,bump43(k,.08,.92)*1.5);m.position.y=p0[1]-.17*o;m.visible=!(k>.45&&k<.55);}}
    else if(m.userData.dirty){m.position.set(p0[0],p0[1],p0[2]);m.rotation.x=p0[3];if(ud.magType!=='swing'&&ud.magType!=='drumTilt')m.rotation.z=p0[4];m.visible=true;m.userData.ej=0;m.userData.dirty=0;}
    if(fx.reload>=0)m.userData.dirty=1;}
  // legendary accent glow + plasma light
  if(ud.accent&&ud.legg)ud.accent.emissiveIntensity=.3+.25*(.5+.5*Math.sin(A43.t*3));
  if(w.id==='plasma'||w.id==='laser'){vmGlow43.color.setHex(w.id==='plasma'?0xff8a30:0x40fff0);vmGlow43.position.set(vmRoot.position.x,vmRoot.position.y+.05,vmRoot.position.z-.35);vmGlow43.intensity=.5+.3*Math.sin(A43.t*8)+(ft>0?1.2:0);}else vmGlow43.intensity=0;
  // flamethrower stream
  if(w.id==='flamer'&&firing&&fx.reload<0&&(mag.flamer|0)>0){A43.fT-=dt;while(A43.fT<=0){A43.fT+=GALTA()?.018:.035;flame43(vm);}}
  vmFlash.intensity=Math.max(0,vmFlash.intensity-dt*40);}
function vmFx43Tick(dt){updShells43(dt);updFlames43(dt);}
const _uvm43=updateViewmodel;updateViewmodel=function(dt,w){_uvm43(dt,w);try{const vm=VM[w.id];if(vm&&GHI())vmExtra43(dt,w,vm);vmFx43Tick(dt);}catch(e){if(!window.__a43e){window.__a43e=1;console.error(e);}}};
gfxOn43(q=>{vmGlow43.visible=q!=='bassa';if(q==='bassa'){for(const s of A43.shells){s.life=0;s.m.visible=false;}for(const f of A43.flames){f.life=0;f.sp.visible=false;}if(vmGlow43)vmGlow43.intensity=0;}});

// pre-create the pools so their programs are compiled by the menu warm-up (no first-shot hitch)
for(let i=0;i<14;i++){const m=new T.Mesh(SHELLG43.p(),wmat43().brass);m.visible=false;vmScene.add(m);A43.shells.push({m,v:new T.Vector3(),w:new T.Vector3(),life:0});}
for(let i=0;i<18;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:FLTEX43,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));sp.visible=false;vmScene.add(sp);A43.flames.push({sp,v:new T.Vector3(),life:0});}
(window.__t43=window.__t43||[]).push(['v43_anim_end',performance.now()]);

(window.__t43=window.__t43||[]).push(['v43_world',performance.now()]);
// ======================= v4.3 world graphics: dynamic sun/moon shadows, procedural textures, light glow, grade, particles =======================
// ---- shadows ----
const SUN43={dir:new T.Vector3(-60,30,-42).normalize(),orig:sun.position.clone(),frame:0};scene.add(sun.target);
const pShadow43=new T.Mesh(new T.CylinderGeometry(.28,.26,1.7,8),new T.MeshBasicMaterial({colorWrite:false,depthWrite:false}));pShadow43.castShadow=true;pShadow43.receiveShadow=false;pShadow43.visible=false;scene.add(pShadow43);
function shadow43(q){const sc=sun.shadow.camera;if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
  if(q==='bassa'){renderer.shadowMap.type=T.PCFShadowMap;sun.shadow.mapSize.set(2048,2048);sc.left=-58;sc.right=58;sc.top=58;sc.bottom=-58;sun.position.copy(SUN43.orig);sun.target.position.set(0,0,0);sun.shadow.radius=1;pShadow43.visible=false;}
  else{const h=q==='alta'?24:19;renderer.shadowMap.type=q==='alta'?T.PCFSoftShadowMap:T.PCFShadowMap;sun.shadow.mapSize.set(q==='alta'?2048:1024,q==='alta'?2048:1024);sc.left=-h;sc.right=h;sc.top=h;sc.bottom=-h;pShadow43.visible=true;}
  sc.near=1;sc.far=220;sc.updateProjectionMatrix();sun.shadow.bias=q==='bassa'?-0.0008:-0.0004;sun.shadow.normalBias=q==='bassa'?.03:.02;
  for(const z of zombies)z.g.traverse(o=>{if(o.isMesh)o.castShadow=q!=='bassa';});renderer.shadowMap.needsUpdate=true;}
function shadowTick43(){if(!GHI())return;const q=GQ(),h=q==='alta'?24:19,tex=2*h/sun.shadow.mapSize.x;SUN43.frame++;
  const px=Math.round(camera.position.x/tex)*tex,pz=Math.round(camera.position.z/tex)*tex;sun.target.position.set(px,0,pz);sun.position.set(px+SUN43.dir.x*90,SUN43.dir.y*90,pz+SUN43.dir.z*90);
  pShadow43.position.set(player.pos.x,.85,player.pos.z);pShadow43.visible=game.state==='play';
  if(SUN43.frame%(q==='alta'?2:3)===0)renderer.shadowMap.needsUpdate=true;}// 4.3.1: map + matrix stay consistent between updates (world-space correct)
// moonlight: on Media/Alta the night keeps a soft blue key light so shadows stay readable
const _al43=applyLight;applyLight=function(){_al43();if(!GHI())return;const nf=nightF();if(nf>0){sun.intensity=Math.max(sun.intensity,.26*nf);sun.color.setHex(0xe6edff).lerp(_moonC43,nf);}else sun.color.setHex(0xe6edff);};
const _moonC43=new T.Color(0x9cb4ff);
// ---- procedural textures (Media/Alta) ----
const TXL43={};let TXH43=null;
function txHi43(){if(TXH43)return TXH43;const r=rng43(3);
  const snow=zsShow()?null:ctex43('snow43',1024,1024,(g,w,h)=>{g.fillStyle='#c6cfdb';g.fillRect(0,0,w,h);const rr=rng43(17);
    for(let i=0;i<60;i++){const x=rr()*w,y=rr()*h,R=60+rr()*200;const gr=g.createRadialGradient(x,y,0,x,y,R);const c=rr()<.5?'rgba(150,164,188,':'rgba(250,252,255,';gr.addColorStop(0,c+'.45)');gr.addColorStop(1,c+'0)');g.fillStyle=gr;g.fillRect(x-R,y-R,R*2,R*2);}
    for(let i=0;i<26;i++){const x=rr()*w,y=rr()*h,R=10+rr()*30;const gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,'rgba(96,94,82,.35)');gr.addColorStop(1,'rgba(96,94,82,0)');g.fillStyle=gr;g.fillRect(x-R,y-R,R*2,R*2);}
    noise43(g,w,h,26000,170,255,1,2,rr);for(let i=0;i<1500;i++){g.fillStyle='rgba(255,255,255,'+(.5+rr()*.5)+')';g.fillRect(rr()*w,rr()*h,1,1);}
    for(let i=0;i<14;i++){const y=rr()*h,th=26+rr()*64;const gr=g.createLinearGradient(0,y,0,y+th);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.32,'rgba(255,255,255,.62)');gr.addColorStop(.68,'rgba(176,190,208,.3)');gr.addColorStop(1,'rgba(70,88,112,0)');g.fillStyle=gr;g.fillRect(0,y,w,th);}
    for(let i=0;i<28;i++){const x=rr()*w,y=rr()*h,a=36+rr()*80;g.fillStyle='rgba(72,90,118,.2)';g.beginPath();g.ellipse(x,y,a,a*.36,rr()*3.1,0,6.3);g.fill();}
    g.fillStyle='rgba(255,255,255,.92)';for(let i=0;i<640;i++){const x=rr()*w,y=rr()*h;g.fillRect(x,y,1.5,1.5);if(x<4)g.fillRect(x+w-4,y,1.5,1.5);if(y<4)g.fillRect(x,y+h-4,1.5,1.5);}},{rep:[17,17]});
  const snowB=zsShow()?null:ctex43('snowB43',256,256,(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);const rr=rng43(23);for(let i=0;i<120;i++){const x=rr()*w,y=rr()*h,R=8+rr()*40;const gr=g.createRadialGradient(x,y,0,x,y,R);const v=rr()<.5?255:0;gr.addColorStop(0,'rgba('+v+','+v+','+v+',.35)');gr.addColorStop(1,'rgba('+v+','+v+','+v+',0)');g.fillStyle=gr;g.fillRect(x-R,y-R,R*2,R*2);}noise43(g,w,h,5000,60,200,1,2,rr);
    for(let i=0;i<16;i++){g.fillStyle=rr()<.5?'rgba(255,255,255,.5)':'rgba(0,0,0,.38)';g.fillRect(0,rr()*h,w,5+rr()*14);}},{linear:1,rep:[34,34]});
  const plank=ctex43('plank43',512,512,(g,w,h)=>{const rr=rng43(41);for(let x=0;x<w;x+=64){const v=56+rr()*34;g.fillStyle='rgb('+(v+28|0)+','+(v+14|0)+','+(v-6|0)+')';g.fillRect(x,0,64,h);
      for(let i=0;i<26;i++){g.strokeStyle='rgba(30,16,6,'+(.12+rr()*.22)+')';g.lineWidth=.6+rr()*1.4;g.beginPath();const x0=x+rr()*64;g.moveTo(x0,0);for(let y=0;y<=h;y+=24)g.lineTo(x0+Math.sin(y*.02+i)*3,y);g.stroke();}
      g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,0,3,h);g.fillStyle='rgba(255,230,190,.08)';g.fillRect(x+3,0,2,h);
      for(let y=rr()*120;y<h;y+=150+rr()*120){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x,y,64,2);g.fillStyle='#2a2a2c';g.fillRect(x+8,y-5,4,4);g.fillRect(x+52,y-5,4,4);}
      for(let k=0;k<2;k++){const kx=x+10+rr()*44,ky=rr()*h;const gr=g.createRadialGradient(kx,ky,0,kx,ky,7);gr.addColorStop(0,'rgba(40,20,8,.8)');gr.addColorStop(1,'rgba(40,20,8,0)');g.fillStyle=gr;g.fillRect(kx-8,ky-8,16,16);}}
    g.fillStyle='rgba(236,242,250,.85)';for(let x=0;x<w;x+=4)g.fillRect(x,0,4,6+rr()*10);});
  const brick=ctex43('brick43',512,512,(g,w,h)=>{const rr=rng43(51);g.fillStyle='#5a5048';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=((y/32)%2)*32;x<w+32;x+=64){const v=rr()*30;g.fillStyle='rgb('+(112+v|0)+','+(58+v*.6|0)+','+(46+v*.4|0)+')';g.fillRect(x-30,y+3,60,27);
      g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-30,y+24,60,6);g.fillStyle='rgba(255,220,200,.07)';g.fillRect(x-30,y+3,60,3);}noise43(g,w,h,9000,0,255,1,2,rr);
    g.fillStyle='rgba(240,244,250,.8)';for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=6)g.fillRect(x,y,6,1+rr()*3);});
  const metal=ctex43('metal43',256,256,(g,w,h)=>{const rr=rng43(61);g.fillStyle='#5a5e63';g.fillRect(0,0,w,h);for(let i=0;i<300;i++){g.fillStyle='rgba(255,255,255,'+rr()*.06+')';g.fillRect(0,rr()*h,w,1);}
    for(let i=0;i<50;i++){const x=rr()*w,y=rr()*h,R=4+rr()*22;const gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,'rgba(120,60,28,.55)');gr.addColorStop(1,'rgba(120,60,28,0)');g.fillStyle=gr;g.fillRect(x-R,y-R,R*2,R*2);}
    g.fillStyle='rgba(20,20,22,.7)';for(let y=16;y<h;y+=64)for(let x=16;x<w;x+=64){g.beginPath();g.arc(x,y,3,0,7);g.fill();}});
  const bark=ctex43('bark43',128,256,(g,w,h)=>{const rr=rng43(71);g.fillStyle='#3d2c20';g.fillRect(0,0,w,h);for(let i=0;i<70;i++){g.strokeStyle='rgba('+(rr()<.5?'20,12,6':'92,70,52')+','+(.3+rr()*.4)+')';g.lineWidth=1+rr()*3;g.beginPath();const x=rr()*w;g.moveTo(x,0);for(let y=0;y<=h;y+=16)g.lineTo(x+Math.sin(y*.05+i)*4,y);g.stroke();}
    noise43(g,w,h,1600,0,140,1,3,rr);},{rep:[1,2]});
  const pine=ctex43('pine43',256,256,(g,w,h)=>{const rr=rng43(81);g.fillStyle='#3a5e44';g.fillRect(0,0,w,h);for(let i=0;i<1400;i++){const x=rr()*w,y=rr()*h,l=5+rr()*9,a=(rr()-.5)*1.2+Math.PI/2;const v=rr();g.strokeStyle='rgba('+(44+v*50|0)+','+(80+v*70|0)+','+(56+v*40|0)+',.8)';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
    for(let i=0;i<220;i++){g.fillStyle='rgba(240,246,252,'+(.4+rr()*.5)+')';g.fillRect(rr()*w,rr()*h,2+rr()*5,1+rr()*2);}},{rep:[2,2]});
  const road=ctex43('road43',256,1024,(g,w,h)=>{const rr=rng43(91);g.clearRect(0,0,w,h);const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(120,124,132,0)');gr.addColorStop(.12,'rgba(138,142,152,.9)');gr.addColorStop(.88,'rgba(138,142,152,.9)');gr.addColorStop(1,'rgba(120,124,132,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    noise43(g,w,h,14000,40,200,1,2,rr);for(const x of [70,92,162,184]){g.fillStyle='rgba(60,62,66,.45)';for(let y=0;y<h;y+=2)g.fillRect(x+Math.sin(y*.012)*4,y,14,2);g.fillStyle='rgba(30,30,32,.22)';for(let y=0;y<h;y+=9)g.fillRect(x+Math.sin(y*.012)*4,y,14,3);}
    g.fillStyle='rgba(236,240,246,.75)';for(let i=0;i<520;i++){const x=rr()<.5?rr()*70:w-rr()*70;g.fillRect(x,rr()*h,4+rr()*18,2+rr()*7);}for(let i=0;i<140;i++){g.fillStyle='rgba(232,238,246,'+(.25+rr()*.4)+')';g.fillRect(rr()*w,rr()*h,6+rr()*30,2+rr()*5);}
    g.fillStyle='rgba(220,200,120,.5)';for(let y=0;y<h;y+=90)g.fillRect(w/2-3,y,6,45);},{rep:[1,6]});
  TXH43={snow,snowB,plank,brick,metal,bark,pine,road};return TXH43;}
function tex43(q){const hi=q!=='bassa';const T_=hi?txHi43():null;const set=(m,k,v)=>{if(!m)return;if(!(k in TXL43))TXL43[k]={};const L=TXL43[k];if(!('map' in L))Object.assign(L,{map:m.map,bump:m.bumpMap,bs:m.bumpScale,color:m.color.getHex()});
    if(hi){Object.assign(m,v);}else{m.map=L.map;m.bumpMap=L.bump;m.bumpScale=L.bs;m.color.setHex(L.color);}m.needsUpdate=true;};
  if(zsShow()){try{dryGround438();}catch(e){}}else set(ground.material,'ground',hi?{map:T_.snow,bumpMap:GALTA()?T_.snowB:null,bumpScale:1.2}:{});
  set(MAT.plank,'plank',hi?{map:TXR22.wood,color:new T.Color(0xffffff)}:{});set(MAT.brick,'brick',hi?{map:TXR22.brick,color:new T.Color(0xffffff)}:{});
  set(MAT.metal,'metal',hi?{map:TXR22.metal,color:new T.Color(0xffffff)}:{});set(MAT.trunk,'trunk',hi?{map:TXR22.bark,color:new T.Color(0xffffff)}:{});
  set(MAT.pine,'pine',hi?{map:TXR22.pine,color:new T.Color(0xffffff)}:{});set(road.material,'road',hi?{map:TXR22.asphalt}:{});
  if(MAT.wood)set(MAT.wood,'wood',hi?{map:TXR22.wood,color:new T.Color(0xffffff)}:{});
  if(MAT.roof)set(MAT.roof,'roof',hi?{map:TXR22.tile,color:new T.Color(0xffffff)}:{});
  if(MAT.stoneW)set(MAT.stoneW,'stoneW',hi?{map:TXR22.stone,color:new T.Color(0xffffff)}:{});
  if(MAT.hosp)set(MAT.hosp,'hosp',hi?{map:TXR22.plaster,color:new T.Color(0xffffff)}:{});
  if(MAT.rust)set(MAT.rust,'rust',hi?{map:TXR22.scratch}:{});if(MAT.rust2)set(MAT.rust2,'rust2',hi?{map:TXR22.scratch}:{});
  if(MAT.redPaint)set(MAT.redPaint,'redPaint',hi?{map:TXR22.scratch}:{});try{phApply23();}catch(e){}}
let TXP23=null;
function phApply23(){const P=TXP23;if(!P)return;const put=(m,t)=>{if(m&&t){m.map=t;m.color.setHex(0xffffff);m.needsUpdate=true;}};
  put(MAT.brick,P.brick);put(MAT.plank,P.plank);put(MAT.wood,P.plank);put(MAT.roof,P.roof);put(MAT.hosp,P.plaster);put(MAT.walk,P.walk);
  if(P.road&&road&&road.material){road.material.map=P.road;road.material.color.setHex(0xffffff);road.material.needsUpdate=true;}}
// ---- glow sprites (bloom-lite), torch beam, vignette/grade ----
const muzGlow43=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffc070,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0,fog:false}));muzGlow43.scale.set(2.2,2.2,1);scene.add(muzGlow43);
const beam43=new T.Mesh(new T.ConeGeometry(2.6,11,20,1,true),new T.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}));
beam43.geometry.translate(0,-5.5,0);beam43.geometry.rotateX(Math.PI/2);beam43.position.set(.25,-.3,-.2);beam43.renderOrder=5;camera.add(beam43);
{const v=document.createElement('div');v.id='grade43';document.body.appendChild(v);}
function lights43(dt){const hi=GHI();muzGlow43.visible=hi;if(hi){muzGlow43.position.copy(muzzleLight.position);const k=Math.min(1,muzzleLight.intensity/18);muzGlow43.material.opacity=k*.9;muzGlow43.material.color.copy(muzzleLight.color);const s=1.4+k*1.6;muzGlow43.scale.set(s,s,1);}
  beam43.visible=GALTA()&&flash.intensity>.5;if(beam43.visible)beam43.material.opacity=Math.min(.05,flash.intensity/12*.05);
  for(const L of lamps){if(!L.halo)continue;if(L.h0===undefined)L.h0=L.halo.scale.x;const s=L.h0*(hi?1+nightF()*.9:1);L.halo.scale.set(s,s,1);}}
function grade43(q){renderer.toneMapping=q==='bassa'?T.NoToneMapping:T.ACESFilmicToneMapping;renderer.toneMappingExposure=q==='alta'?1.32:1.28;
  for(const m of [sky.material])m.toneMapped=q==='bassa';}
// ---- particles: denser snow (2nd layer), footprints, sparkle ----
const SN2=isTouch?900:1400,sn2P=new Float32Array(SN2*3),sn2S=new Float32Array(SN2);for(let i=0;i<SN2;i++){sn2P[i*3]=rand(-16,16);sn2P[i*3+1]=rand(0,12);sn2P[i*3+2]=rand(-16,16);sn2S[i]=rand(.6,1.3);}
const sn2G=new T.BufferGeometry();sn2G.setAttribute('position',new T.BufferAttribute(sn2P,3));
const snow2=new T.Points(sn2G,new T.PointsMaterial({color:0xffffff,size:.075,map:glowTex,transparent:true,opacity:.85,depthWrite:false,sizeAttenuation:true}));snow2.frustumCulled=false;snow2.visible=false;scene.add(snow2);
let snowPh2=0;
function snow2Tick(dt,t){if(zsShow()){snow2.visible=false;return;}if(snowCovered()||!GHI()){if(snow2.visible)snow2.visible=false;return;}if(!snow2.visible)snow2.visible=true;
  const cx=camera.position.x,cz=camera.position.z,n=GALTA()?SN2:SN2>>1,step=isTouch?4:3,off=snowPh2;snowPh2=(snowPh2+1)%step;const adv=dt*step;sn2G.setDrawRange(0,n);
  const gust2=Math.sin(t*.09)*.55+Math.cos(t*.05)*.2;for(let i=off;i<n;i+=step){const j=i*3;let y=sn2P[j+1]-adv*(.28+sn2S[i]*.55);if(y<0)y+=12;sn2P[j+1]=y;let x=sn2P[j]+(gust2+Math.sin(t*.8+i*.2)*.35)*adv,z=sn2P[j+2]+(Math.cos(t*.41+i*.27)*.28+gust2*.2)*adv;
    if(x-cx>16)x-=32;else if(x-cx<-16)x+=32;if(z-cz>16)z-=32;else if(z-cz<-16)z+=32;sn2P[j]=x;sn2P[j+2]=z;}sn2G.attributes.position.needsUpdate=true;}
const FPTEX43=ctex43('foot43',32,64,(g)=>{g.fillStyle='rgba(70,80,100,.55)';g.beginPath();g.ellipse(16,40,9,17,0,0,7);g.fill();g.beginPath();g.ellipse(16,12,7,9,0,0,7);g.fill();});
const FP43={m:new T.InstancedMesh(new T.PlaneGeometry(.2,.36),new T.MeshBasicMaterial({map:FPTEX43,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),48),i:0,d:0,side:1,lx:0,lz:0,t:[]};
FP43.m.frustumCulled=false;for(let i=0;i<48;i++){FP43.m.setMatrixAt(i,ZERO);FP43.t.push(0);}FP43.m.visible=false;scene.add(FP43.m);
const _fo43=new T.Object3D();
function feet43(dt){if(!FP43.m.visible||game.state!=='play')return;const dx=player.pos.x-FP43.lx,dz=player.pos.z-FP43.lz,d=Math.hypot(dx,dz);if(d>3){FP43.lx=player.pos.x;FP43.lz=player.pos.z;return;}
  FP43.d+=d;FP43.lx=player.pos.x;FP43.lz=player.pos.z;if(FP43.d<.75)return;FP43.d=0;FP43.side=-FP43.side;const yaw=Math.atan2(dx,dz);
  _fo43.position.set(player.pos.x+Math.cos(yaw)*.13*FP43.side,.018,player.pos.z-Math.sin(yaw)*.13*FP43.side);_fo43.rotation.set(-Math.PI/2,0,yaw+Math.PI);_fo43.scale.set(1,1,1);_fo43.updateMatrix();
  FP43.m.setMatrixAt(FP43.i,_fo43.matrix);FP43.i=(FP43.i+1)%(GALTA()?48:24);FP43.m.instanceMatrix.needsUpdate=true;}
// better blood / sparks: extra particles on hits (hooks the generic emitter)
const _emit43=emit;emit=function(pos,dir,n,color,o){_emit43(pos,dir,n,color,o);if(!GALTA())return;
  if(color===BLOOD)_emit43(pos,dir,Math.ceil(n*(GALTA()?.9:.5)),[0x4a0000,0x7a0606,0x300000],Object.assign({},o,{size:(o&&o.size||.05)*.6,stretch:2.4,speed:(o&&o.speed||3)*1.35}));
  else if(color===SPARK)_emit43(pos,dir,Math.ceil(n*(GALTA()?.8:.4)),[0xffffff,0xffe08a,0xffb040],Object.assign({},o,{size:.02,stretch:5,speed:(o&&o.speed||3)*1.7,life:.22}));};

// ---- zombies (Media/Alta): extra detail meshes + smoothed, layered animation ----
const ZD43={wound:new T.Color(0x4a0806),blood:new T.Color(0x6a0a08),bone:new T.Color(0xcfc6a8),hair:new T.Color(0x1c1814),dirt:new T.Color(0x3a3228),belt:new T.Color(0x24180e),buckle:new T.Color(0x9a9a8a)};
const ZJ43=['hipL','hipR','kneeL','kneeR','spine','shL','shR','elL','elR','neck','jaw'];
function zDetail43(z){if(z.d43)return;const W=z.V.width||1,r=rng43((z.seed*1000)|0),L=[];const hip=[],sp=[],nk=[],arm=[];
  sp.push([ZG.belly,ZD43.wound,[(r()-.5)*.3*W,.1+r()*.35,.146],0,0,r()*.6,.5+r()*.5,.7+r()*.6,1]);sp.push([ZG.rib,ZD43.bone,[(r()-.5)*.2*W,.25+r()*.2,.152],0,0,(r()-.5)*.6,.8,1,1]);
  sp.push([ZG.belly,ZD43.dirt,[0,-.22,.145],0,0,0,1.5*W,.6,1]);sp.push([ZG.belly,ZD43.blood,[(r()-.5)*.25,.48,.146],0,0,(r()-.5),.4,.4,1]);
  sp.push([ZG.brow,ZD43.dirt,[0,.6,0],0,0,0,1.25*W,1.2,4.4]);// collar
  hip.push([ZG.belly,ZD43.belt,[0,.08,.128],0,0,0,1.45*W,.5,1],[ZG.eye,ZD43.buckle,[0,.08,.135],0,0,0,1.1,1.4,1],[ZG.belly,ZD43.belt,[0,.08,-.128],0,0,0,1.45*W,.5,1]);
  for(let i=0;i<5;i++)nk.push([ZG.finger,ZD43.hair,[(r()-.5)*.28,.3+r()*.04,(r()-.5)*.22-.02],(r()-.5)*.8,0,(r()-.5)*.8,1.2,1+r()*.8,1.2]);
  nk.push([ZG.eye,ZD43.blood,[(r()-.5)*.16,.03,.168],0,0,0,1.6,1.2,1],[ZG.belly,ZD43.wound,[.12,.2,.14],0,0,.3,.25,.5,1]);
  arm.push([ZG.rag,ZD43.dirt,[0,-.12,.07],0,0,(r()-.5)*.6,.65,.9,1],[ZG.belly,ZD43.wound,[0,-.25,.06],0,0,0,.3,.35,1]);
  const mk=(par,list)=>{const m=new T.Mesh(mergePieces(list),z.mat);m.castShadow=true;par.add(m);return m;};
  z.d43=[mk(z.spine,sp),mk(z.hips,hip),mk(z.neck,nk),mk(r()<.5?z.shL:z.shR,arm)];z.f43={};for(const k of ZJ43)z.f43[k]=z[k].rotation.clone();z.fy43=z.hips.position.y;}
function zMode43(hi){for(const z of zombies){zDetail43(z);for(let i=0;i<z.d43.length;i++)z.d43[i].visible=!!hi||i===2;}}
const _uz43=updateZombie;updateZombie=function(z,dt,t,target,canAttack){_uz43(z,dt,t,target,canAttack);if(!z.f43||!z.alive)return;
  if(z.dead){for(const k of ZJ43)z.f43[k].copy(z[k].rotation);return;}
  // layered secondary motion: lurch roll, asymmetric reach, head jitter, breathing
  const ph=z.phase||0,sd=z.seed,run=z.V.name==='runner';
  z.spine.rotation.z+=Math.sin(ph)*(run?.05:.09);z.spine.rotation.y+=Math.sin(ph*.5+sd)*.06;
  if(z.state!=='atk'){z.shL.rotation.x+=Math.sin(t*1.7+sd)*.12-.08;z.shR.rotation.x+=Math.sin(t*1.3+sd*2)*.1;z.elL.rotation.x+=Math.sin(t*2.1+sd)*.08;
    z.neck.rotation.z+=Math.sin(t*2.3+sd*3)*.07+(zsShow()?Math.sin(t*1.7+sd)*.04:(Math.sin(t*9+sd)>.96?.25:0));z.neck.rotation.y+=Math.sin(t*.9+sd)*(zsShow()?.1:.18);z.jaw.rotation.x=Math.max(z.jaw.rotation.x,.12+Math.sin(t*3+sd)*.1);}
  // low-pass the joints: removes pose snaps between walk / attack / stagger
  const k=1-Math.exp(-dt*(z.state==='atk'?(zsShow()?12:26):(zsShow()?7:16)));
  for(const j of ZJ43){const r=z[j].rotation,f=z.f43[j];f.x+=(r.x-f.x)*k;f.y+=(r.y-f.y)*k;f.z+=(r.z-f.z)*k;r.set(f.x,f.y,f.z);}
  z.fy43+=(z.hips.position.y-z.fy43)*k;z.hips.position.y=z.fy43;};
gfxOn43(q=>zMode43(q!=='bassa'));
// ---- per-frame hook (every rendered frame) ----
const _ue43=updateEnv;updateEnv=function(dt,t){_ue43(dt,t);try{shadowTick43();lights43(dt);snow2Tick(dt,t);feet43(dt);}catch(e){if(!window.__w43e){window.__w43e=1;console.error(e);}}};
gfxOn43(q=>{shadow43(q);tex43(q);grade43(q);const hi=q!=='bassa',fall=!zsShow();snow2.visible=hi&&fall;FP43.m.visible=hi&&fall;if(!hi||!fall){for(let i=0;i<48;i++)FP43.m.setMatrixAt(i,ZERO);FP43.m.instanceMatrix.needsUpdate=true;}
  document.getElementById('grade43').className='g43-'+q;try{applyLight();}catch(e){}});
(window.__t43=window.__t43||[]).push(['v43_world_end',performance.now()]);
window.__w43={snow2,FP43,muzGlow43,beam43,pShadow43,FL43:null};
// ---- night breath: the 4.2 version emitted opaque white particle cubes 45 cm in front of the camera
// (seen as floating white boxes at dusk/night). 4.3: soft translucent vapour sprites instead.
{const i=TICK42.findIndex(f=>/nightF\(\)>\.5/.test(String(f))&&/_br42/.test(String(f)));if(i>=0)TICK42.splice(i,1);
 const BR=[];for(let k=0;k<3;k++){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xe8eef8,transparent:true,depthWrite:false,opacity:0,fog:false}));s.visible=false;s.renderOrder=5;scene.add(s);BR.push({s,t:9,v:new T.Vector3()});}
 let brT=0,k=0;const off=new T.Vector3();
 TICK42.push(dt=>{if(!SV.on||game.state!=='play'){for(const b of BR)b.s.visible=false;return;}brT-=dt;
  if(brT<=0&&nightF()>.5){brT=rand(2.6,3.8);const b=BR[k++%BR.length];camera.getWorldPosition(b.s.position);off.set(rand(-.04,.04),-.2,-.7).applyQuaternion(camera.quaternion);b.s.position.add(off);b.v.set(0,.12,0).add(off.set(0,0,-.25).applyQuaternion(camera.quaternion));b.t=0;b.s.visible=true;}
  for(const b of BR){if(!b.s.visible)continue;b.t+=dt;const u=b.t/1.3;if(u>=1){b.s.visible=false;continue;}b.s.position.addScaledVector(b.v,dt);const sc=.12+u*.32;b.s.scale.set(sc,sc,1);b.s.material.opacity=.16*Math.sin(Math.PI*u);}});}

(window.__t43=window.__t43||[]).push(['v43_build',performance.now()]);
// ======================= v4.3 build: shutters, watchtower, turret, workbench, floor spikes, electric fence, generator, floodlight, water collector, decor =======================
{const add=(k,mat,n)=>{const m=new T.InstancedMesh(G.box,mat,n);m.count=0;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;
  m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);scene.add(m);solids.push(m);POOL[k]={m,free:[],n:0,max:n,owner:[]};};
 add('haz',new T.MeshLambertMaterial({color:0xd8a020}),160);add('glow',new T.MeshBasicMaterial({color:0xfff0b8}),200);add('rug',new T.MeshLambertMaterial({color:0x7a2a24}),60);add('blue',new T.MeshLambertMaterial({color:0x3a6a9a}),80);add('sand',new T.MeshLambertMaterial({color:0xc2a36b}),160);}
const WIN_PARTS=PDEF.window.parts.map(p=>p.slice());
// lv = player level (P42.L) needed · bench = needs a Workbench in the world · cat = Costruisci category
Object.assign(PDEF,{
 shutter:{n:'Finestra con imposte',i:'🪟',cost:{wood:6,stone:1,iron:1},hp:380,edge:1,box:[2,.32],shut:1,lv:2,parts:WIN_PARTS,
   panel:[['plank',.83,1.53,.17,1.0,.98,.06],['wood',.83,1.2,.21,.98,.08,.03],['wood',.83,1.86,.21,.98,.08,.03],['wood',.83,1.53,.21,.08,.9,.03],['metal',1.26,1.53,.22,.05,.16,.05]]},
 tower:{n:'Torre di guardia',i:'🗼',cost:{wood:20,stone:4,iron:2},hp:640,cell:'f',circ:1.0,tower:1,lv:4,parts:[
   ['wood',-.86,1.2,-.86,.18,2.4,.18],['wood',.86,1.2,-.86,.18,2.4,.18],['wood',-.86,1.2,.86,.18,2.4,.18],['wood',.86,1.2,.86,.18,2.4,.18],
   ['wood',0,1.0,-.86,1.9,.1,.1,0,0,.9],['wood',0,1.0,.86,1.9,.1,.1,0,0,-.9],['wood',-.86,1.0,0,.1,.1,1.9,.9,0,0],
   ['plank',0,2.42,0,2.08,.14,2.08],['snow',0,2.5,0,2.0,.03,2.0],
   ['wood',-.98,2.95,0,.08,.9,2.0],['wood',.98,2.95,0,.08,.9,2.0],['wood',0,2.95,-.98,2.0,.9,.08],['wood',-.6,3.4,.98,.8,.08,.08],['wood',.6,3.4,.98,.8,.08,.08],
   ['wood',-.32,1.25,1.12,.07,2.6,.07],['wood',.32,1.25,1.12,.07,2.6,.07],['wood',0,.35,1.12,.62,.06,.07],['wood',0,.75,1.12,.62,.06,.07],['wood',0,1.15,1.12,.62,.06,.07],['wood',0,1.55,1.12,.62,.06,.07],['wood',0,1.95,1.12,.62,.06,.07],['wood',0,2.3,1.12,.62,.06,.07],
   ['metal',0,3.42,-.98,.3,.06,.08]]},
 turret:{n:'Torretta automatica',i:'🔫',cost:{metal:6,iron:4,elec:3},hp:300,cell:'o',circ:.5,turret:1,lv:8,bench:1,max:2,parts:[
   ['dark',0,.1,0,.74,.2,.74],['haz',0,.22,0,.6,.06,.6],['metal',0,.55,0,.16,.66,.16],['metal',0,.9,0,.3,.08,.3],
   ['metal',0,1.04,.02,.44,.26,.5,0,0,0,'h'],['dark',0,1.04,-.5,.08,.08,.56,0,0,0,'h'],['dark',0,1.04,-.8,.12,.12,.08,0,0,0,'h'],['haz',.27,1.02,.08,.1,.22,.32,0,0,0,'h'],['glow',0,1.2,.12,.08,.05,.08,0,0,0,'h'],['blue',-.23,1.04,.02,.03,.18,.36,0,0,0,'h']]},
 bench:{n:'Banco da lavoro',i:'🛠️',cost:{wood:12,stone:4,iron:2},hp:300,cell:'o',box:[1.6,.8],bench:0,isBench:1,lv:3,parts:[
   ['plank',0,.86,0,1.6,.1,.8],['wood',-.72,.42,-.32,.1,.84,.1],['wood',.72,.42,-.32,.1,.84,.1],['wood',-.72,.42,.32,.1,.84,.1],['wood',.72,.42,.32,.1,.84,.1],['plank',0,.3,0,1.44,.06,.66],
   ['metal',-.5,.98,-.1,.3,.14,.18],['dark',-.5,1.07,-.1,.06,.06,.22],['wood',.35,.95,.15,.42,.04,.06,0,.5,0],['metal',.52,.95,.13,.12,.07,.08,0,.5,0],['crate',.55,.36,0,.42,.36,.5],['metal',0,1.2,-.36,1.4,.5,.04]]},
 spikes:{n:'Punte a terra',i:'📌',cost:{wood:4,iron:1},hp:220,cell:'o',floor43:1,lv:2,parts:[['plank',0,.04,0,1.7,.06,1.7]]},
 efence:{n:'Recinto elettrico',i:'⚡',cost:{metal:4,iron:2,elec:2},hp:280,edge:1,box:[2,.9],efence:1,lv:7,bench:1,power:1,parts:[
   ['metal',-.92,.8,0,.1,1.6,.1],['metal',.92,.8,0,.1,1.6,.1],['dark',-.92,.04,0,.3,.08,.3],['dark',.92,.04,0,.3,.08,.3],
   ['wire',0,.35,0,1.84,.025,.025],['wire',0,.7,0,1.84,.025,.025],['wire',0,1.05,0,1.84,.025,.025],['wire',0,1.4,0,1.84,.025,.025],
   ['blue',-.86,.35,0,.06,.06,.06],['blue',.86,.35,0,.06,.06,.06],['blue',-.86,.7,0,.06,.06,.06],['blue',.86,.7,0,.06,.06,.06],['blue',-.86,1.05,0,.06,.06,.06],['blue',.86,1.05,0,.06,.06,.06],['blue',-.86,1.4,0,.06,.06,.06],['blue',.86,1.4,0,.06,.06,.06],['haz',0,1.62,0,.3,.18,.03]]},
 gen:{n:'Generatore',i:'🔋',cost:{metal:5,iron:3,elec:2},hp:320,cell:'o',box:[1.1,.7],gen:1,lv:5,bench:1,max:2,parts:[
   ['haz',0,.42,0,1.0,.62,.6],['dark',0,.06,0,1.1,.12,.7],['metal',-.25,.78,0,.36,.12,.4],['dark',.3,.6,.31,.24,.24,.02],['metal',.42,.84,0,.06,.24,.06],['dark',.42,.98,0,.1,.06,.1],['glow',-.36,.6,.31,.07,.07,.02],['metal',0,.42,-.31,.9,.4,.02]]},
 flood:{n:'Faro',i:'💡',cost:{metal:3,iron:1,elec:2},hp:160,cell:'o',circ:.2,flood:1,lv:5,bench:1,power:1,parts:[
   ['dark',0,.05,0,.5,.1,.5],['metal',0,1.5,0,.09,3.0,.09],['metal',0,3.02,0,.7,.08,.08],['dark',-.26,2.92,0,.26,.24,.22,.5,0,0],['dark',.26,2.92,0,.26,.24,.22,.5,0,0],['glow',-.26,2.84,-.1,.2,.16,.03,.5,0,0],['glow',.26,2.84,-.1,.2,.16,.03,.5,0,0],['dark',.08,.5,.06,.18,.26,.1]]},
 rain:{n:'Raccoglitore d\'acqua',i:'💧',cost:{wood:6,metal:1},hp:180,cell:'o',circ:.45,rain:1,lv:3,parts:[
   ['blue',0,.42,0,.62,.8,.62],['metal',0,.2,0,.66,.05,.66],['metal',0,.62,0,.66,.05,.66],['wood',0,.86,0,1.1,.05,1.1],['plank',0,.92,0,.9,.03,.9],['metal',.34,.3,0,.08,.08,.14]]},
 rug:{n:'Tappeto',i:'🟥',cost:{wood:1},hp:60,cell:'o',decor:1,lv:1,parts:[['rug',0,.015,0,1.6,.02,1.1],['haz',0,.02,0,1.3,.02,.8],['rug',0,.025,0,1.1,.02,.6]]},
 table:{n:'Tavolo',i:'🪑',cost:{wood:5},hp:120,cell:'o',box:[1.4,.8],decor:1,lv:1,parts:[['plank',0,.78,0,1.4,.08,.8],['wood',-.62,.38,-.32,.08,.76,.08],['wood',.62,.38,-.32,.08,.76,.08],['wood',-.62,.38,.32,.08,.76,.08],['wood',.62,.38,.32,.08,.76,.08],['crate',.3,.88,.1,.2,.12,.2],['metal',-.3,.86,-.1,.1,.08,.1]]},
 shelf:{n:'Scaffale',i:'🗃️',cost:{wood:6},hp:150,cell:'o',box:[1.2,.42],decor:1,lv:1,parts:[['wood',-.58,1.0,0,.06,2.0,.4],['wood',.58,1.0,0,.06,2.0,.4],['plank',0,.12,0,1.12,.05,.38],['plank',0,.7,0,1.12,.05,.38],['plank',0,1.3,0,1.12,.05,.38],['plank',0,1.9,0,1.12,.05,.38],
   ['crate',-.3,.88,0,.32,.3,.3],['metal',.25,.8,0,.2,.16,.24],['blue',.32,1.42,0,.16,.2,.16],['rug',-.2,1.42,0,.3,.18,.24],['haz',.1,.2,0,.5,.12,.3]]}});
{const sp=[];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)sp.push(['metal',i*.5,.2,j*.5,.05,.34,.05,(j)*.25,0,(i)*.25],['metal',i*.5+.22,.17,j*.5+.18,.04,.26,.04,.3,0,-.3]);PDEF.spikes.parts.push(...sp);}
PDEF.fire.cat='utilita';
const NEW43=['shutter','tower','turret','bench','spikes','efence','gen','flood','rain','rug','table','shelf'];PORDER.push(...NEW43);
const BCAT43=[['muri','🧱 Muri',['wall','door','window','shutter','fond','roof']],['difesa','🛡️ Difesa',['barricade','spikes','wire','mine','efence','turret','tower']],
  ['utilita','🔧 Utilità',['fire','chest','bed','ward','bench','gen','flood','rain']],['decor','🪴 Decorazioni',['rug','table','shelf']]];
Object.assign(PDEF,{
 pillar:{n:'Pilastro',i:'🏛️',cost:{stone:3,wood:2},hp:420,cell:'p',box:[.62,.62],lv:1,parts:[['stone',0,.1,0,.78,.2,.78],['stone',0,1.45,0,.48,2.5,.48],['wood',0,2.74,0,.66,.1,.66],['metal',0,1.45,0,.52,.06,.06],['metal',0,1.45,0,.06,.06,.52]]},
 gate:{n:'Cancello',i:'🚧',cost:{metal:3,iron:2},hp:300,edge:1,box:[2,.28],door:1,lv:1,parts:[['metal',-.92,1.2,0,.12,2.4,.12],['metal',.92,1.2,0,.12,2.4,.12],['metal',0,2.36,0,2,.12,.12],['dark',0,.06,0,2,.12,.36]],panel:[['metal',.55,1.15,0,1.2,2.1,.07],['metal',.55,.55,.05,1.05,.07,.03],['metal',.55,1.15,.05,1.05,.07,.03],['metal',.55,1.75,.05,1.05,.07,.03],['haz',.95,1.15,.07,.1,.18,.05]]},
 sand:{n:'Sacchi di sabbia',i:'🟫',cost:{stone:4},hp:380,edge:1,box:[2,.72],lv:1,parts:[['sand',-.5,.22,0,.9,.42,.62],['sand',.48,.22,.06,.9,.42,.62],['sand',-.05,.58,0,.95,.34,.56],['sand',.15,.88,.04,.7,.28,.48]]},
 post:{n:'Lampione',i:'🏮',cost:{metal:2,iron:1},hp:150,cell:'o',circ:.28,decor:1,lv:1,parts:[['metal',0,1.4,0,.1,2.8,.1],['metal',.28,2.78,0,.66,.08,.08],['dark',.55,2.64,0,.28,.18,.22],['glow',.55,2.56,0,.16,.08,.14]]},
 seat:{n:'Panchina',i:'🪑',cost:{wood:4},hp:110,cell:'o',box:[1.55,.5],decor:1,lv:1,parts:[['plank',0,.46,0,1.5,.08,.42],['plank',0,.78,-.16,1.5,.42,.07],['wood',-.66,.24,-.12,.08,.48,.08],['wood',.66,.24,-.12,.08,.48,.08],['wood',-.66,.24,.12,.08,.48,.08],['wood',.66,.24,.12,.08,.48,.08]]},
 bin:{n:'Bidone',i:'🗑️',cost:{metal:2},hp:100,cell:'o',circ:.38,decor:1,lv:1,parts:[['dark',0,.42,0,.52,.78,.52],['metal',0,.84,0,.58,.08,.58],['haz',0,.48,.27,.22,.28,.04],['metal',.2,.96,0,.05,.18,.05],['metal',-.2,.96,0,.05,.18,.05]]}});
PORDER.push('pillar','gate','sand','post','seat','bin');
BCAT43[0][2].push('pillar','gate');BCAT43[1][2].push('sand');BCAT43[3][2].push('post','seat','bin');
{const m=new T.InstancedMesh(G.box,new T.MeshLambertMaterial({color:0x3d6b34}),120);m.count=0;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;
  m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(120*3).fill(1),3);scene.add(m);solids.push(m);POOL.leaf={m,free:[],n:0,max:120,owner:[]};}
Object.assign(PDEF,{
 fence:{n:'Recinto',i:'🪵',cost:{wood:3},hp:160,edge:1,box:[2,.9],lv:1,parts:[['wood',-.92,.55,0,.1,1.1,.1],['wood',.92,.55,0,.1,1.1,.1],['wood',0,.85,0,1.7,.06,.06],['wood',0,.42,0,1.7,.06,.06]]},
 boards:{n:'Assi',i:'🟫',cost:{wood:2},hp:80,cell:'g',lv:1,parts:[['plank',0,.04,0,1.92,.06,1.92],['wood',0,.08,-.9,1.84,.04,.06],['wood',0,.08,.9,1.84,.04,.06],['wood',-.9,.08,0,.06,.04,1.84]]},
 barrel:{n:'Botte',i:'🛢️',cost:{wood:3,metal:1},hp:140,cell:'o',circ:.34,decor:1,lv:1,parts:[['wood',0,.42,0,.62,.78,.62],['metal',0,.82,0,.66,.08,.66],['metal',0,.18,0,.66,.08,.66],['dark',0,.48,.32,.16,.16,.04]]},
 torch:{n:'Torcia',i:'🔥',cost:{wood:2,coal:1},hp:80,cell:'o',circ:.16,decor:1,lv:1,parts:[['wood',0,.7,0,.08,1.4,.08],['dark',0,1.42,0,.14,.14,.14],['glow',0,1.58,0,.1,.2,.1]]},
 signb:{n:'Cartello',i:'🪧',cost:{wood:2},hp:90,cell:'o',circ:.16,decor:1,lv:1,parts:[['wood',0,.85,0,.08,1.7,.08],['wood',0,1.55,0,.9,.42,.06],['haz',0,1.55,.04,.7,.26,.02]]},
 flag:{n:'Bandiera',i:'🚩',cost:{wood:2,coal:1},hp:70,cell:'o',circ:.14,decor:1,lv:1,parts:[['wood',0,.9,0,.07,1.8,.07],['cloth',.32,1.55,0,.58,.36,.04],['haz',.32,1.55,.03,.42,.2,.02]]},
 chair:{n:'Sedia',i:'🪑',cost:{wood:3},hp:90,cell:'o',box:[.55,.5],decor:1,lv:1,parts:[['wood',0,.46,0,.46,.06,.46],['wood',0,.74,-.18,.46,.4,.06],['wood',-.18,.22,-.16,.06,.44,.06],['wood',.18,.22,-.16,.06,.44,.06],['wood',-.18,.22,.16,.06,.44,.06],['wood',.18,.22,.16,.06,.44,.06]]},
 stove:{n:'Stufa',i:'🪨',cost:{metal:4,stone:2},hp:220,cell:'o',box:[.72,.55],lv:1,parts:[['dark',0,.06,0,.78,.1,.58],['metal',0,.42,0,.68,.62,.5],['dark',0,.78,0,.28,.14,.28],['glow',.2,.4,.26,.08,.12,.02],['metal',0,1.05,0,.14,.36,.14]]},
 cratew:{n:'Cassa',i:'📦',cost:{wood:4},hp:120,cell:'o',box:[.7,.7],decor:1,lv:1,parts:[['crate',0,.36,0,.68,.68,.68],['wood',0,.72,0,.74,.08,.74],['metal',0,.38,.35,.22,.08,.04]]},
 pot:{n:'Vaso',i:'🪴',cost:{stone:1,wood:1},hp:60,cell:'o',circ:.22,decor:1,lv:1,parts:[['dark',0,.2,0,.34,.36,.34],['sand',0,.4,0,.4,.08,.4],['leaf',0,.58,0,.26,.26,.26],['leaf',.12,.74,.04,.16,.2,.16]]}});
PORDER.push('fence','boards','barrel','torch','signb','flag','chair','stove','cratew','pot');
BCAT43[0][2].push('fence','boards');BCAT43[2][2].push('stove');BCAT43[3][2].push('barrel','torch','signb','flag','chair','cratew','pot');
let bcat43='muri';
// ---- extra piece state (fuel, ammo, water) saved next to the survival save ----
const B43={st:LS.get('zc_b43',{})||{},tower:null,camY:0,turT:0,pw:0,zapT:0};
function bst(p){return B43.st[p.key]||(B43.st[p.key]={});}
function b43Save(){const o={};for(const p of PIECES)if(p.alive&&B43.st[p.key]){const s=B43.st[p.key];for(const k in s)s[k]=Math.round(s[k]);o[p.key]=s;}B43.st=o;LS.set('zc_b43',o);}
const _svSave43=svSave;svSave=function(){_svSave43();try{b43Save();}catch(e){}};
const _addP43=addPiece;addPiece=function(type,x,z,rot,hp,open,silent){const p=_addP43.apply(this,arguments);if(p){const D=PDEF[type],s=bst(p);
    if(D.turret&&s.a===undefined)s.a=60;if(D.gen&&s.f===undefined)s.f=180;if(D.rain&&s.w===undefined)s.w=1;if(D.turret)p.aim=p.rot*Math.PI/2;}return p;};
const _rmP43=removePiece;removePiece=function(p,silent){if(B43.tower===p)towerDown43(true);_rmP43.apply(this,arguments);};
// ---- placement rules: level gate, workbench, power, per-type limits ----
const hasBench43=()=>PIECES.some(p=>p.alive&&p.type==='bench');
const _pc43=placeCheck;placeCheck=function(type,s){const D=PDEF[type];
  if(D.lv&&(P42.L|0)<D.lv)return '🔒 Liv. '+D.lv;
  if(D.bench&&!hasBench43())return 'Serve un 🛠️ Banco da lavoro nella base';
  if(D.max&&PIECES.filter(p=>p.alive&&p.type===type).length>=D.max)return 'Massimo '+D.max+' '+D.n.toLowerCase();
  return _pc43(type,s);};
// ---- turret head aims (rewrite only its head slots) ----
const _pw43=pieceWrite,_hm43=new T.Matrix4(),_hr43=new T.Matrix4();
pieceWrite=function(p){_pw43(p);const D=PDEF[p.type];if(!D.turret)return;const base=pieceBase(p).clone();_hr43.makeRotationY((p.aim||0)-p.rot*Math.PI/2);_hm43.multiplyMatrices(base,_hr43);
  for(const s of p.slots){if(s.pt[10]!=='h')continue;const P=POOL[s.k];P.m.setMatrixAt(s.i,partMatrix(_hm43,s.pt,new T.Matrix4()));P.m.instanceMatrix.needsUpdate=true;}};
// repair: metal machines are fixed with 1 metal (wood/stone pieces unchanged)
const _rep43=repairPiece;repairPiece=function(p){const D=PDEF[p.type];if(!D||D.cost.wood||D.cost.stone||!D.cost.metal)return _rep43(p);fx.slash=1;
  if(p.hp>=p.max){play('hammer');toast(D.n+' · integro ('+p.max+'/'+p.max+')',900);return;}
  if((inv.metal|0)<1){play('thud');toast('Serve 1 '+RES.metal.i+' '+RES.metal.n+' per riparare',1100);return;}
  inv.metal--;p.hp=Math.min(p.max,p.hp+p.max*[.25,.34,.45][SV.tools.hammer|0]);pieceWrite(p);play('hammer');emit(_tmp.set(p.x,1.2,p.z),_up,8,[0xffe0a0,0xffffff],{speed:2,spread:1,life:.4,size:.04,grav:6});
  floatText('🔨 '+D.n+' '+Math.round(p.hp/p.max*100)+'%','#9fe0ff');updateHUD();};
// shutters: closed = half damage
const _dp43=damagePiece;damagePiece=function(p,d){const D=PDEF[p.type];if(D&&D.shut&&!p.open)d*=.5;if(D&&D.tower&&B43.tower===p)d*=.8;return _dp43(p,d);};
// ---- interaction ----
function towerUp43(p){B43.tower=p;if(p.circ)p.circ.off=true;player.pos.set(p.x,0,p.z);player.vel&&player.vel.set(0,0,0);play('step');toast('🗼 Sei sulla torre · spara dall\'alto, gli zombie colpiscono la torre',2200);}
function towerDown43(silent){const p=B43.tower;B43.tower=null;if(!p)return;if(p.circ)p.circ.off=false;const a=p.rot*Math.PI/2;player.pos.set(p.x+Math.sin(a)*1.7+(p.rot%2?0:0),0,p.z+Math.cos(a)*1.7);if(!silent)play('step');}
function genNear43(x,z){let g=null;for(const p of PIECES)if(p.alive&&p.type==='gen'&&bst(p).f>0&&Math.hypot(p.x-x,p.z-z)<14){g=p;break;}return g;}
const fmtT43=s=>{s=Math.max(0,s|0);return (s/60|0)+':'+String(s%60).padStart(2,'0');};
const _scan43=svScanNear;svScanNear=function(){if(B43.tower){svNearObj={k:'tower',o:B43.tower,t:'Scendi'};return svNearObj;}let n=_scan43();
  let bd=n?Math.hypot(n.o.x-player.pos.x,n.o.z-player.pos.z):2.4;
  for(const p of PIECES){if(!p.alive)continue;const D=PDEF[p.type];if(!(D.shut||D.tower||D.turret||D.gen||D.rain||D.isBench))continue;const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);const lim=D.tower?2.3:2.2;if(d>=lim||d>=bd)continue;
    const s=bst(p);let t;if(D.shut)t=p.open?'Chiudi imposte':'Apri imposte';else if(D.tower)t='Sali';else if(D.turret)t='Ricarica '+(s.a|0)+'/120';else if(D.gen)t='Carbone ⛽'+fmtT43(s.f);else if(D.rain)t='Bevi 💧'+(s.w|0);else t='Banco';
    bd=d;n=svNearObj={k:'b43',o:p,t};}return n;};
const _use43=svUse;svUse=function(){const n=svNearObj||svScanNear();if(n&&n.k==='tower'){towerDown43();return true;}if(!n||n.k!=='b43')return _use43();const p=n.o,D=PDEF[p.type],s=bst(p);
  if(D.shut){p.open=!p.open;pieceWrite(p);play('door');bakeShadows();}
  else if(D.tower)towerUp43(p);
  else if(D.turret){if((s.a|0)>=120){toast('🔫 Torretta già carica (120)',1200);return true;}if((inv.metal|0)<2){toast('Servono 🔩2 Metallo per ricaricare',1400);play('empty');return true;}inv.metal-=2;s.a=Math.min(120,(s.a|0)+60);play('reload');toast('🔫 Torretta: '+s.a+' colpi',1200);updateHUD();}
  else if(D.gen){if((s.f|0)>=900){toast('🔋 Serbatoio pieno',1200);return true;}if((inv.coal|0)<1){toast('Serve ⚫1 Carbone come carburante',1400);play('empty');return true;}inv.coal--;s.f=Math.min(960,(s.f|0)+240);play('clink');toast('🔋 Generatore: '+fmtT43(s.f)+' di carburante',1400);updateHUD();}
  else if(D.rain){if((s.w|0)<1){toast('💧 Vuoto · si riempie ogni alba',1400);return true;}if(player.hp>=player.maxHp){toast('Sei già in piena salute',1100);return true;}s.w--;player.hp=Math.min(player.maxHp,player.hp+30);play('pickup');floatText('💧 +30','#8fd0ff');updateHUD();}
  else if(D.isBench){openCraft();}
  svNearObj=null;b43Save();return true;};
// ---- zombies vs tower ----
const _zah43=zAttackHit;zAttackHit=function(z,d,sc){const tw=B43.tower;if(tw&&tw.alive){const dd=Math.hypot(z.g.position.x-tw.x,z.g.position.z-tw.z);if(dd<1.0+z.V.reach*sc+.6){damagePiece(tw,(z.V.dmg*.6+2+SV.day*.5)*DIFF().dmg*(z.V.heavy?2:1));return;}}return _zah43(z,d,sc);};
// ---- floodlights: 2 pooled lights created up-front (fixed light count = no shader recompiles) ----
const FL43=[0,1].map(()=>{const L=new T.PointLight(0xfff2d8,0,22,1.4);L.position.set(0,-60,0);scene.add(L);const h=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xfff0c0,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0}));h.scale.set(3,3,1);h.position.set(0,-60,0);scene.add(h);return {L,h};});
const _tmp43=new T.Vector3(),_d43=new T.Vector3(),_up43=new T.Vector3(0,1,0);
function b43Tick(dt){if(!SV.on)return;const nf=nightF();
  // tower: lock on the platform and lift the eye
  if(B43.tower){const p=B43.tower;if(!p.alive){towerDown43(true);}else{const dx=player.pos.x-p.x,dz=player.pos.z-p.z;player.pos.x=p.x+clamp(dx,-.62,.62);player.pos.z=p.z+clamp(dz,-.62,.62);}}
  const want=B43.tower?2.5:0;B43.camY+=(want-B43.camY)*Math.min(1,dt*6);CAMY43=B43.camY;
  // generators burn fuel while something they power is active
  B43.turT-=dt;const fire=B43.turT<=0;if(fire)B43.turT=.35;
  let used=new Set();
  // floodlights at dusk/night
  const fl=[];if(nf>.05)for(const p of PIECES){if(!p.alive||p.type!=='flood')continue;const g=genNear43(p.x,p.z);if(!g)continue;used.add(g);fl.push([Math.hypot(p.x-player.pos.x,p.z-player.pos.z),p]);}
  fl.sort((a,b)=>a[0]-b[0]);const nL=GQ()==='bassa'?1:2;
  FL43.forEach((f,i)=>{const e=fl[i];if(e&&i<2&&e[0]<45){const p=e[1],a=p.rot*Math.PI/2;f.L.position.set(p.x-Math.sin(a)*.4,2.7,p.z-Math.cos(a)*.4);f.L.intensity=26*nf;f.h.position.set(p.x,2.86,p.z);f.h.material.opacity=.9*nf;}else{f.L.intensity=0;f.h.material.opacity=0;f.h.position.y=-60;}});
  // turrets
  for(const p of PIECES){if(!p.alive||p.type!=='turret')continue;const s=bst(p);if(!fire||(s.a|0)<=0)continue;let best=null,bd=15;
    for(const z of zombies){if(!z.alive||z.dead)continue;const d=Math.hypot(z.g.position.x-p.x,z.g.position.z-p.z);if(d<bd&&!losBlocked(p.x,p.z,z.g.position.x,z.g.position.z)){bd=d;best=z;}}
    if(!best)continue;p.aim=Math.atan2(-(best.g.position.x-p.x),-(best.g.position.z-p.z));pieceWrite(p);s.a--;
    const sc=best.V.scale||1;_tmp43.set(p.x-Math.sin(p.aim)*.85,1.04,p.z-Math.cos(p.aim)*.85);_d43.set(best.g.position.x,1.1*sc,best.g.position.z);
    tracer(_tmp43,_d43,0xffd080,.035,.07);emit(_tmp43,_up43,3,SPARK,{speed:2.5,spread:.8,life:.15,size:.03,grav:4,stretch:2});
    const dir=_d43.clone().sub(_tmp43).normalize();damageZombie(best,(13+Math.min(12,SV.day)*.6)*(best.V.name==='boss'?.6:1),'body',_d43.clone(),dir);
    if(Math.hypot(p.x-player.pos.x,p.z-player.pos.z)<30)play('smg');if(s.a===0){feed('🔫 Torretta scarica · ricaricala con 🔩2');}}
  // traps: floor spikes + electric fence
  B43.zapT-=dt;const tick=B43.zapT<=0;if(tick)B43.zapT=.1;
  if(tick)for(const p of PIECES.slice()){if(!p.alive)continue;const D=PDEF[p.type];if(!D.floor43&&!D.efence)continue;let g=null;if(D.efence){g=genNear43(p.x,p.z);if(!g)continue;}
    for(const z of zombies){if(!z.alive||z.dead)continue;const dx=z.g.position.x-p.x,dz=z.g.position.z-p.z;
      if(D.floor43){if(Math.abs(dx)<.85&&Math.abs(dz)<.85){z.wireT=Math.max(z.wireT||0,.2);z.hp-=26*.1*(z.V.name==='boss'?.5:1);z.flash=.04;p.hp-=4*.1*(z.V.heavy?2:1);if(Math.random()<.25)emit(_tmp43.set(z.g.position.x,.3,z.g.position.z),_up43,2,BLOOD,{speed:1.2,spread:.8,life:.4,size:.04,grav:9});
          if(z.hp<=0){killZombie(z,_tmp43.set(dx,0,dz).normalize().clone(),5,false);feed('📌 Punte: zombie eliminato');}}}
      else{const along=p.rot%2===0,u=along?dx:dz,v=along?dz:dx;if(Math.abs(u)<1.0&&Math.abs(v)<.7){used.add(g);z.wireT=Math.max(z.wireT||0,.3);z.stag=Math.max(z.stag||0,.15);z.hp-=34*.1*(z.V.name==='boss'?.5:1);z.flash=.08;
          if(Math.random()<.5)emit(_tmp43.set(z.g.position.x,1.0,z.g.position.z),_up43,4,SPARK,{speed:4,spread:1,life:.2,size:.03,grav:6,stretch:3});
          if(z.hp<=0){killZombie(z,_tmp43.set(dx,0,dz).normalize().clone(),8,false);feed('⚡ Recinto elettrico: zombie fulminato');}}}}
    if(p.hp<=0){feed('📌 '+D.n+' distrutto');removePiece(p);svSave();}}
  for(const g of used){const s=bst(g);s.f=Math.max(0,(s.f||0)-dt);if(s.f===0)feed('🔋 Generatore senza carburante');}}
TICK42.push(b43Tick);
// Bassa: no extra dynamic lights at all (same light set / shaders as 4.2.1); floodlights keep their halo
gfxOn43(q=>{for(const f of FL43)f.L.visible=q!=='bassa';});
let CAMY43=0;
// water collectors refill at dawn
const _ep43=enterPhase;enterPhase=function(ph){const r=_ep43.apply(this,arguments);try{if(ph==='dawn'){for(const p of PIECES)if(p.alive&&p.type==='rain'){const s=bst(p);s.w=Math.min(3,(s.w|0)+1);}b43Save();}}catch(e){}return r;};
// ---- Costruisci menu: scrollable categories ----
{const bb=$('buildBar'),c=document.createElement('div');c.id='bCat43';c.className='hscroll43';c.innerHTML=BCAT43.map(([k,l])=>'<button data-bc="'+k+'">'+l+'</button>').join('');bb.insertBefore(c,bb.firstChild);
 const pick=e=>{const b=e.target.closest('button[data-bc]');if(!b)return;if(e.type==='touchend'&&typeof drag43==='function'&&drag43(e))return;if(e.cancelable)e.preventDefault();e.stopPropagation();bcat43=b.dataset.bc;const L=BCAT43.find(x=>x[0]===bcat43)[2];if(!L.includes(SV.build))setBuild(true,L.find(k=>!PDEF[k].lv||(P42.L|0)>=PDEF[k].lv)||L[0]);else renderBuildBar();play('ui');};
 c.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});c.addEventListener('touchend',pick,{passive:false});c.addEventListener('click',pick);}
function catOf43(k){const c=BCAT43.find(x=>x[2].includes(k));return c?c[0]:'muri';}
renderBuildBar=function(){if(SV.build)bcat43=catOf43(SV.build);const L=BCAT43.find(x=>x[0]===bcat43)[2].filter(k=>PDEF[k]);
  for(const b of document.querySelectorAll('#bCat43 button'))b.classList.toggle('on',b.dataset.bc===bcat43);
  $('bList').innerHTML=L.map(k=>{const D=PDEF[k],lk=D.lv&&(P42.L|0)<D.lv,nb=D.bench&&!hasBench43();
    return '<button class="bp'+(SV.build===k?' on':'')+(costOK(D.cost)?'':' poor')+(lk?' lock':'')+'" data-p="'+k+'"><i>'+(lk?'🔒':D.i)+'</i><b>'+D.n+'</b><small>'+(lk?'Liv. '+D.lv:nb?'🛠️ Banco':costTxt(D.cost))+'</small></button>';}).join('');};
window.__build43={PDEF,inv,PIECES,repair:p=>repairPiece(p),placeCheck:(t,s)=>placeCheck(t,s),pieceWrite:p=>pieceWrite(p),setBuild:(a,b)=>setBuild(a,b),svUse:()=>svUse(),svScanNear:()=>svScanNear(),BCAT43,B43,towerUp43,towerDown43,b43Tick,genNear43,bst,get camY(){return CAMY43}};
