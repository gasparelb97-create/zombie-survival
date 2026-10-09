/* Zombie Survival — game code part 20-v475 (4.3.75). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.75: arena — detailed fighters (1 draw each), smooth remote players, never-stopping loop, shader pre-warm, new lobby =======================
const M475={on:true,err:0,warm:0,hold:0,tickErr:0,kills:0};function e475(e,w){M475.err++;try{console.warn('475',w,e&&e.message);}catch(_){}try{window.__DBG&&__DBG.prob('err','arena475',w+': '+(e&&e.message||e));}catch(_){}if(M475.err>40)M475.on=false;}
const A475=ARENA454;

// ---------- 1) fighter model: rigid parts baked into ONE geometry (bone index per vertex), team colour via uniform ----------
const FIG475={geo:null,rest:null,BONES:['pelvis','hipL','kneeL','hipR','kneeR','spine','shL','elL','shR','elR','neck']};
function skel475(){const g=new T.Group();const B={};const add=(n,p,x,y,z)=>{const o=new T.Group();o.position.set(x,y,z);(p?B[p]:g).add(o);B[n]=o;return o;};
  add('pelvis',null,0,.96,0);add('hipL','pelvis',-.1,-.04,0);add('kneeL','hipL',0,-.42,0);add('hipR','pelvis',.1,-.04,0);add('kneeR','hipR',0,-.42,0);
  add('spine','pelvis',0,.1,0);add('shL','spine',-.25,.44,0);add('elL','shL',0,-.3,0);add('shR','spine',.25,.44,0);add('elR','shR',0,-.3,0);add('neck','spine',0,.52,0);return {g,B};}
function figGeo475(){if(FIG475.geo)return FIG475.geo;
  const C={skin:0xd2a27a,skinD:0xb98a64,pants:0x3d4552,boot:0x1b1b1d,sole:0x0e0e0e,vest:0x343a2c,pouch:0x434a36,belt:0x2a2420,glove:0x232528,hair:0x2a2118,helm:0x4b5240,dark:0x1a1d22,gun:0x26292e,gun2:0x3a3f44,metal:0x8a9096,lens:0x5a8aa8,white:0xeeeeee,brass:0x9a8a5a,pad:0x2a2c2e};
  const TEAM=1;// team parts: colour = shade (grey), multiplied by the team colour in the shader
  // [bone, shape, colour, team, x,y,z, sx,sy,sz, rx,ry,rz]
  const P=[
   ['pelvis','b',C.pants,0, 0,0,0, .34,.18,.22],['pelvis','b',C.belt,0, 0,.08,0, .36,.05,.24],['pelvis','b',C.brass,0, 0,.08,-.125, .06,.04,.012],
   ['pelvis','b',C.dark,0, .2,-.06,0, .06,.17,.11],['pelvis','b',C.pouch,0, -.19,.02,.04, .05,.09,.1],
   ['hipL','c',C.pants,0, 0,-.21,0, .155,.43,.155],['hipR','c',C.pants,0, 0,-.21,0, .155,.43,.155],['hipL','b',C.pouch,0, -.08,-.17,-.01, .04,.12,.1],
   ['kneeL','c',C.pants,0, 0,-.18,0, .125,.36,.125],['kneeR','c',C.pants,0, 0,-.18,0, .125,.36,.125],
   ['kneeL','b',C.pad,0, 0,-.03,-.065, .11,.11,.04],['kneeR','b',C.pad,0, 0,-.03,-.065, .11,.11,.04],
   ['kneeL','b',C.boot,0, 0,-.36,0, .13,.13,.16],['kneeR','b',C.boot,0, 0,-.36,0, .13,.13,.16],['kneeL','b',C.boot,0, 0,-.39,-.1, .12,.07,.13],['kneeR','b',C.boot,0, 0,-.39,-.1, .12,.07,.13],
   ['kneeL','b',C.sole,0, 0,-.43,-.04, .13,.03,.28],['kneeR','b',C.sole,0, 0,-.43,-.04, .13,.03,.28],
   ['spine','b',0xd8d8d8,TEAM, 0,.24,0, .35,.44,.21],['spine','b',0xc8c8c8,TEAM, 0,.41,0, .43,.15,.23],['spine','b',0xd8d8d8,TEAM, 0,.5,0, .14,.06,.13],
   ['spine','b',C.vest,0, 0,.28,-.115, .34,.3,.06],['spine','b',C.vest,0, 0,.28,.115, .34,.32,.06],['spine','b',C.vest,0, -.16,.3,0, .04,.26,.2],['spine','b',C.vest,0, .16,.3,0, .04,.26,.2],
   ['spine','b',C.pouch,0, -.1,.17,-.155, .085,.1,.045],['spine','b',C.pouch,0, 0,.17,-.155, .085,.1,.045],['spine','b',C.pouch,0, .1,.17,-.155, .085,.1,.045],
   ['spine','b',C.dark,0, -.12,.38,-.15, .05,.11,.035],['spine','c',C.dark,0, -.12,.5,-.15, .012,.16,.012],['spine','b',0xd8d8d8,TEAM, .09,.36,-.15, .07,.05,.012],
   ['spine','b',C.pouch,0, 0,.27,.19, .27,.31,.13],['spine','c',0x5a5a48,0, 0,.46,.2, .14,.3,.14, 0,0,Math.PI/2],
   // carbine, carried by the chest: hands are posed onto grip and handguard
   ['spine','b',C.gun,0, .09,.3,-.33, .06,.095,.3],['spine','b',C.gun2,0, .09,.31,-.5, .058,.065,.16],['spine','c',C.gun,0, .09,.325,-.64, .03,.16,.03, Math.PI/2,0,0],
   ['spine','c',C.dark,0, .09,.325,-.73, .042,.05,.042, Math.PI/2,0,0],['spine','b',C.gun,0, .09,.2,-.37, .045,.15,.075, .25,0,0],['spine','b',C.gun,0, .09,.24,-.25, .04,.1,.045, -.35,0,0],
   ['spine','b',C.gun,0, .095,.29,-.12, .05,.1,.17],['spine','c',C.dark,0, .09,.395,-.35, .05,.15,.05, Math.PI/2,0,0],['spine','b',C.gun,0, .09,.365,-.35, .025,.03,.05],['spine','b',C.lens,0, .09,.395,-.43, .04,.04,.005],
   ['shL','c',0xd0d0d0,TEAM, 0,-.15,0, .115,.31,.115],['shR','c',0xd0d0d0,TEAM, 0,-.15,0, .115,.31,.115],['shL','b',C.vest,0, 0,-.01,0, .13,.08,.14],['shR','b',C.vest,0, 0,-.01,0, .13,.08,.14],
   ['shL','c',0x909090,TEAM, 0,-.09,0, .122,.05,.122],
   ['elL','c',C.skin,0, 0,-.13,0, .095,.26,.095],['elR','c',C.skin,0, 0,-.13,0, .095,.26,.095],['elL','c',0xc0c0c0,TEAM, 0,-.04,0, .105,.07,.105],['elR','c',0xc0c0c0,TEAM, 0,-.04,0, .105,.07,.105],
   ['elL','b',C.glove,0, 0,-.29,0, .075,.09,.085],['elR','b',C.glove,0, 0,-.29,0, .075,.09,.085],['elL','b',C.glove,0, 0,-.345,-.02, .068,.05,.06],['elR','b',C.glove,0, 0,-.345,-.02, .068,.05,.06],
   ['elL','b',C.dark,0, 0,-.23,0, .1,.03,.1],
   ['neck','c',C.skin,0, 0,.03,0, .1,.09,.1],['neck','s',C.skin,0, 0,.165,0, .205,.25,.23],['neck','b',C.skin,0, 0,.085,-.025, .15,.07,.15],['neck','b',C.skinD,0, 0,.06,-.02, .12,.03,.1],
   ['neck','b',C.skin,0, -.105,.16,0, .03,.06,.045],['neck','b',C.skin,0, .105,.16,0, .03,.06,.045],
   ['neck','b',C.white,0, -.048,.18,-.108, .042,.022,.01],['neck','b',C.white,0, .048,.18,-.108, .042,.022,.01],['neck','b',0x2a1c12,0, -.048,.18,-.114, .018,.018,.006],['neck','b',0x2a1c12,0, .048,.18,-.114, .018,.018,.006],
   ['neck','b',C.hair,0, -.05,.207,-.108, .055,.014,.014, 0,0,.12],['neck','b',C.hair,0, .05,.207,-.108, .055,.014,.014, 0,0,-.12],['neck','b',C.skinD,0, 0,.15,-.12, .032,.055,.04],['neck','b',0x7a4a3a,0, 0,.1,-.108, .05,.01,.01],
   ['neck','b',C.hair,0, 0,.13,.09, .2,.12,.06],
   ['neck','h',C.helm,0, 0,.205,.005, .265,.25,.285],['neck','c',0xb0b0b0,TEAM, 0,.215,.005, .27,.035,.29],['neck','b',C.helm,0, 0,.205,-.13, .2,.03,.04],
   ['neck','b',C.dark,0, 0,.28,-.115, .17,.045,.04],['neck','b',C.lens,0, -.04,.28,-.137, .055,.03,.01],['neck','b',C.lens,0, .04,.28,-.137, .055,.03,.01],
   ['neck','b',C.dark,0, -.125,.13,0, .01,.12,.02],['neck','b',C.dark,0, .125,.13,0, .01,.12,.02]];
  const SH={b:new T.BoxGeometry(1,1,1),c:new T.CylinderGeometry(.5,.5,1,10),s:new T.SphereGeometry(.5,14,10),h:new T.SphereGeometry(.5,14,7,0,Math.PI*2,0,Math.PI/2)};
  for(const k in SH){const g=SH[k].toNonIndexed();g.deleteAttribute('uv');SH[k]=g;}
  const sk=skel475();sk.g.updateMatrixWorld(true);const BI={};FIG475.BONES.forEach((n,i)=>BI[n]=i);
  let n=0;for(const p of P)n+=SH[p[1]].attributes.position.count;
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),bi=new Float32Array(n),tm=new Float32Array(n);
  const M=new T.Matrix4(),Mp=new T.Matrix4(),N3=new T.Matrix3(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),cc=new T.Color();let o=0;
  for(const p of P){const bone=sk.B[p[0]],g=SH[p[1]],Pa=g.attributes.position,Na=g.attributes.normal,c=Pa.count;
    Mp.compose(v.set(p[4],p[5],p[6]),q.setFromEuler(e.set(p[10]||0,p[11]||0,p[12]||0)),new T.Vector3(p[7],p[8],p[9]));M.multiplyMatrices(bone.matrixWorld,Mp);N3.getNormalMatrix(M);cc.setHex(p[2]);
    for(let i=0;i<c;i++){v.fromBufferAttribute(Pa,i).applyMatrix4(M);pos[(o+i)*3]=v.x;pos[(o+i)*3+1]=v.y;pos[(o+i)*3+2]=v.z;v.fromBufferAttribute(Na,i).applyMatrix3(N3).normalize();nor[(o+i)*3]=v.x;nor[(o+i)*3+1]=v.y;nor[(o+i)*3+2]=v.z;
      col[(o+i)*3]=cc.r;col[(o+i)*3+1]=cc.g;col[(o+i)*3+2]=cc.b;bi[o+i]=BI[p[0]];tm[o+i]=p[3]?1:0;}o+=c;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));
  geo.setAttribute('bI475',new T.BufferAttribute(bi,1));geo.setAttribute('aT475',new T.BufferAttribute(tm,1));geo.computeBoundingSphere();geo.boundingSphere.radius*=1.5;
  FIG475.rest=FIG475.BONES.map(nm=>new T.Matrix4().copy(sk.B[nm].matrixWorld).invert());FIG475.geo=geo;FIG475.tris=n/3;return geo;}
function inj475(sh,f){sh.uniforms.uB475={value:f.B475};sh.uniforms.uTeam475={value:f.tc475};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float bI475;attribute float aT475;uniform mat4 uB475[11];uniform vec3 uTeam475;')
   .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n{mat4 bm475=uB475[int(bI475+.5)];objectNormal=mat3(bm475)*objectNormal;}')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n{mat4 bm475=uB475[int(bI475+.5)];transformed=(bm475*vec4(transformed,1.)).xyz;}')
   .replace('#include <color_vertex>','#include <color_vertex>\nvColor.xyz=mix(vColor.xyz,uTeam475*vColor.xyz,aT475);');}
const _gi475=new T.Matrix4();
function fighter475(root){const geo=figGeo475();const sk=skel475(),g=sk.g,B=sk.B;
  const f={g:g,team:-2,name:'',pelvis:B.pelvis,spine:B.spine,neck:B.neck,hipL:B.hipL,hipR:B.hipR,kneeL:B.kneeL,kneeR:B.kneeR,shL:B.shL,shR:B.shR,elL:B.elL,elR:B.elR,v475:1};
  f.B475=[];for(let i=0;i<11;i++)f.B475.push(new T.Matrix4());f.tc475=new T.Color(0x2f6fd0);f.bn475=FIG475.BONES.map(n=>B[n]);
  const mat=new T.MeshLambertMaterial({vertexColors:true});mat.onBeforeCompile=sh=>inj475(sh,f);mat.customProgramCacheKey=()=>'arena475';
  const mesh=new T.Mesh(geo,mat);mesh.name='arenaFig475';mesh.castShadow=false;mesh.receiveShadow=false;f.mesh=mesh;
  let fr=-1;mesh.onBeforeRender=function(){try{const n=renderer.info.render.frame;if(n===fr)return;fr=n;_gi475.copy(g.matrixWorld).invert();for(let i=0;i<f.bn475.length;i++)f.B475[i].multiplyMatrices(_gi475,f.bn475[i].matrixWorld).multiply(FIG475.rest[i]);}catch(e){e475(e,'bones');}};
  g.add(mesh);
  const tm={set material(m){try{if(m&&m.color)f.tc475.copy(m.color);}catch(e){}},get material(){return null;}};f.body=tm;f.chest=tm;f.hip=null;
  const ncv=document.createElement('canvas');ncv.width=256;ncv.height=64;const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(ncv),transparent:true,depthWrite:false}));sp.position.y=2.12;sp.scale.set(1.6,.4,1);sp.center.set(.5,0);g.add(sp);
  f.sp=sp;f.cv=ncv;f.ctx=ncv.getContext('2d');g.visible=false;root.add(g);return f;}
try{if(A475.root&&A475.pool){const R=A475.root,old=A475.pool.concat(A475.demo||[]);let ok=true;for(const id in A475.fig){ok=false;break;}
  if(ok){const pool=[];for(let i=0;i<8;i++)pool.push(fighter475(R));const demo=[fighter475(R),fighter475(R)];
    for(const f of old){try{R.remove(f.g);if(f.sp&&f.sp.material){f.sp.material.map&&f.sp.material.map.dispose();f.sp.material.dispose();}}catch(e){}}
    A475.pool.length=0;A475.pool.push(...pool);A475.demo=demo;demo[1].tc475.setHex(0xd23a3a);}}}catch(e){e475(e,'figs');}

// ---------- 2) poses: legs as before, arms on the carbine, head/torso follow the aim pitch, idle breathing ----------
const POSE475={R:[-.058,.955,.613,1.745],L:[1.441,-1.218,.396,.95]};
{const _ap=arenaPose;arenaPose=function(f,ph,amp,alive){if(!f||!f.v475||!alive||!M475.on)return _ap(f,ph,amp,alive);try{
  const s=Math.sin(ph),c=Math.cos(ph),a=Math.max(0,Math.min(1,amp)),idle=a<.05,tt=performance.now()/1000,br=Math.sin(tt*1.7+(f.seed475||(f.seed475=Math.random()*6)))*.012;
  f.g.rotation.x=0;
  f.hipL.rotation.set(s*.62*a,0,.04);f.hipR.rotation.set(-s*.62*a,0,-.04);
  f.kneeL.rotation.x=idle?.12:(.1+Math.max(0,c)*.95*a);f.kneeR.rotation.x=idle?.12:(.1+Math.max(0,-c)*.95*a);
  f.pelvis.position.y=.96-(idle?.02:0)+Math.abs(Math.sin(ph*2))*.04*a;f.pelvis.rotation.set(.02*a,s*.07*a,c*.03*a);
  const pt=Math.max(-.6,Math.min(.6,f.pitch475||0));
  f.spine.rotation.set(.08*a+pt*.3+br,-s*.06*a-.1,-c*.03*a);
  const R=POSE475.R,L=POSE475.L,bob=Math.sin(ph*2)*.04*a;
  f.shR.rotation.set(R[0]+bob,R[1],R[2]);f.elR.rotation.set(R[3],0,0);f.shL.rotation.set(L[0]+bob,L[1],L[2]);f.elL.rotation.set(L[3],0,0);
  f.neck.rotation.set(pt*.55-.04-br,.1+Math.sin(tt*.6+(f.seed475||0))*(idle?.12:.03),-s*.03*a);}catch(e){e475(e,'pose');}};}

// ---------- 3) smooth remote players: snapshot buffer + 110-200 ms render delay (server sends at 10 Hz), short extrapolation ----------
const INT475={iv:100,last:0,delay:140};
{const _sn=arenaSnap;arenaSnap=function(msg){_sn(msg);try{const now=performance.now();if(INT475.last){const d=Math.min(400,now-INT475.last);INT475.iv+=(d-INT475.iv)*.1;}INT475.last=now;
  INT475.delay=Math.max(110,Math.min(210,INT475.iv*1.3+15));const arr=msg.players||[];
  for(let i=0;i<arr.length;i++){const q=arr[i];if(q.id===A475.me)continue;const a=A475.actors[q.id];if(!a)continue;const s=a.b475||(a.b475=[]);const l=s[s.length-1];
    if(l&&(Math.hypot(q.x-l.x,q.z-l.z)>4.5||(q.alive&&!l.al)))s.length=0;const o=s.length>=6?s.shift():{};o.t=now;o.x=q.x;o.z=q.z;o.y=q.yaw||0;o.al=q.alive?1:0;s.push(o);}}catch(e){e475(e,'snap');}};}
function samp475(a,rt,out){const s=a.b475;if(!s||!s.length){out.x=a.x;out.z=a.z;out.y=a.yaw||0;return;}
  if(rt<=s[0].t){out.x=s[0].x;out.z=s[0].z;out.y=s[0].y;return;}
  for(let i=0;i<s.length-1;i++){const p=s[i],n=s[i+1];if(rt>=p.t&&rt<n.t){const k=(rt-p.t)/Math.max(1,n.t-p.t);out.x=p.x+(n.x-p.x)*k;out.z=p.z+(n.z-p.z)*k;let dy=n.y-p.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));out.y=p.y+dy*k;return;}}
  const l=s[s.length-1],p=s.length>1?s[s.length-2]:null;let ex=0;if(p&&l.al&&a.alive){ex=Math.min(120,rt-l.t);const dt=Math.max(1,l.t-p.t);out.x=l.x+(l.x-p.x)/dt*ex;out.z=l.z+(l.z-p.z)/dt*ex;}else{out.x=l.x;out.z=l.z;}out.y=l.y;}
const _s475={x:0,z:0,y:0};
arenaAnimate=function(now){try{const t=now/1000;for(let i=0;i<A475.pickMeshes.length;i++){const s=A475.pickMeshes[i];if(!s.m.visible)continue;s.m.rotation.y=t*1.6+i;s.m.position.y=.85+Math.sin(t*2+i)*.12;}
  const ids=A475.actors,rt=now-INT475.delay;
  for(const id in ids){const a=ids[id],f=A475.fig[id];if(!f)continue;try{samp475(a,rt,_s475);const vis=!!(a.alive||(now-(a.deadAt||0)<1800));f.g.visible=vis;if(a.name)arenaLabel(f,a.name,a.team|0);f.pitch475=a.pitch||0;if(vis)arenaDrive(f,_s475.x,_s475.z,_s475.y,now,!!a.alive);}catch(e){e475(e,'actor');}}
  if(A475.demo){const show=!!(A475.preview&&A475.phase!=='play');for(let i=0;i<A475.demo.length;i++){const f=A475.demo[i];f.g.visible=show;if(!show)continue;if(f.team!==i)arenaLabel(f,i?'ROSSI':'BLU',i);
    const P=SHOW475.pos[i],yaw=Math.atan2(-(SHOW475.cx-P[0]),-(SHOW475.cz-P[1]))+(i?-.25:.25);f.pitch475=Math.sin(t*.4+i)*.08;arenaDrive(f,P[0],P[1],yaw,now,true);}}}catch(e){e475(e,'anim');}};
{const _sw=arenaSweepHide;arenaSweepHide=function(){try{_sw();}catch(e){e475(e,'sweep');}};}
// lobby showcase: the two fighters stand to the right of the panel, camera sways slowly around them
const SHOW475={pos:[[-.55,.2],[.55,-.2]],cx:0,cz:5,_v:new T.Vector3()};
function arenaCam475(now){try{const d=A475.demo&&A475.demo[0];if(!M475.on||!d||!d.g.visible)return false;const t=now/1000,a=.25+Math.sin(t*.12)*.35,R=4.3,cx=Math.sin(a)*R,cz=Math.cos(a)*R;
  SHOW475.cx=Math.sin(.25)*R;SHOW475.cz=Math.cos(.25)*R;camera.position.set(cx,1.5,cz);
  const asp=camera.aspect||1,pf=asp>1.15?Math.min(.62,490/Math.max(1,innerWidth)):0,dist=R,lat=pf*dist*Math.tan(camera.fov*Math.PI/360)*asp*.92;
  const fx=-cx/R,fz=-cz/R,rx=-fz,rz=fx;camera.lookAt(-rx*lat,1.12,-rz*lat);return true;}catch(e){e475(e,'cam');return false;}}

// ---------- 4) the loop never stops: guarded tick / messages / HUD ----------
A475.tick=function(dt){try{return arenaTick(dt);}catch(e){M475.tickErr++;if(M475.tickErr<5||M475.tickErr%100===0)e475(e,'tick');return !!(A475.on&&A475.phase==='play'&&game.state==='play');}};
{const _om=arenaOnMsg;arenaOnMsg=function(msg){try{return _om(msg);}catch(e){e475(e,'msg '+(msg&&msg.t));}};}
const HUD475={n:0};function hs475(id,v,html){const el=document.getElementById(id);if(!el)return;if(html){if(HUD475[id]===v&&el.__h475===v)return;HUD475[id]=v;el.innerHTML=v;el.__h475=v;return;}if(el.textContent!==v)el.textContent=v;}
function hst475(id,p,v){const el=document.getElementById(id);if(el&&el.style[p]!==v)el.style[p]=v;}
arenaHud=function(){try{const left=Math.max(0,Math.ceil((A475.left||0)/1000));const mm=Math.floor(left/60),ss=left%60;const clock=mm+':'+(ss<10?'0':'')+ss;hs475('aTime',clock);
  hs475('aScore0',String(A475.scores[0]|0));hs475('aScore1',String(A475.scores[1]|0));const you=A475.you;let extra='';if(you&&!you.alive)extra='Rientri tra '+Math.ceil((you.respawnIn||0)/1000)+'s';else if(you&&you.buffs){if(you.buffs.dmg>0)extra+='Danno ';if(you.buffs.spd>0)extra+='Velocità ';if(you.buffs.arm>0)extra+='Difesa ';}
  hs475('aBuff',extra);hs475('hpTxt',String(Math.ceil(player.hp)));hst475('hpFill','width',Math.max(0,player.hp)+'%');const w=WEAPONS[curW];
  if(w){hs475('wName',w.name+(w.melee?'':' · '+w.dmg));hs475('wAmmo',w.melee?'∞':(fx.reload>=0?'Ricarica…':'<span class="mag">'+(mag[w.id]|0)+'</span> / '+(res[w.id]|0)),true);}
  hs475('clockTxt',clock);hs475('clockIc','⚔️');hs475('kills',String(A475.scores[A475.team|0]|0));const low=player.hp>0&&player.hp<30;hst475('lowhp','opacity',low?'0.45':'0');}catch(e){e475(e,'hud');}};

// ---------- 5) pre-warm: compile every arena program (fighters, pickups, viewmodels) before the first arena frame ----------
const WARM475={busy:0,done:0,t0:0};
function warmArena475(){if(WARM475.busy)return;WARM475.busy=1;WARM475.t0=performance.now();M475.hold=1;const restore=[];
  const vis=o=>{restore.push([o,o.visible]);o.visible=true;};
  try{const figs=A475.pool.concat(A475.demo||[]);for(const f of figs)vis(f.g);for(const p of A475.pickMeshes)vis(p.m);for(const k in VM)vis(VM[k]);
    const ps=[];if(renderer.compileAsync){ps.push(renderer.compileAsync(scene,camera));ps.push(renderer.compileAsync(vmScene,vmCam));}else{renderer.compile(scene,camera);renderer.compile(vmScene,vmCam);}
    try{A475.root.traverse(o=>{const m=o.material;if(m&&m.map)try{renderer.initTexture(m.map);}catch(e){}});}catch(e){}
    for(const r of restore)r[0].visible=r[1];restore.length=0;
    const fin=()=>{if(!WARM475.busy)return;WARM475.busy=0;WARM475.done=1;M475.hold=0;M475.warm=Math.round(performance.now()-WARM475.t0);lobbyBusy475(false);};
    if(ps.length)Promise.all(ps).then(fin,fin);else fin();setTimeout(fin,2600);}
  catch(e){for(const r of restore)r[0].visible=r[1];WARM475.busy=0;M475.hold=0;e475(e,'warm');}}
{const _l0=loop0;loop0=function(now){if(M475.hold&&(A475.preview||A475.on)&&game.state!=='play'){last=performance.now();return;}return _l0(now);};}
{const _ao=arenaOpen;arenaOpen=function(){const r=_ao.apply(this,arguments);try{if(!WARM475.done&&M475.on){lobbyBusy475(true);warmArena475();}}catch(e){e475(e,'open');}return r;};}

// ---------- 6) rewards (local coins, daily cap) ----------
const RW475={kill:15,win:60,draw:25,play:10,cap:600,k:0,t0:0,last:null};
function rwDay475(){try{const d=new Date().toISOString().slice(0,10),s=JSON.parse(localStorage.getItem('zs_arena475')||'null');return s&&s.d===d?s:{d,c:0};}catch(e){return {d:'',c:0};}}
{const _fx=arenaFx;arenaFx=function(msg){try{if(msg&&msg.by===A475.me&&msg.kill&&A475.phase==='play')RW475.k++;}catch(e){}return _fx(msg);};}
{const _b=arenaBegin;arenaBegin=function(msg){RW475.k=0;RW475.t0=performance.now();RW475.last=null;return _b(msg);};}
{const _e=arenaEnd;arenaEnd=function(msg){const r=_e(msg);try{const played=(performance.now()-RW475.t0)/1000,w=msg.winner;let c=0,why=[];
  if(RW475.t0&&played>=40){c+=RW475.play;why.push('partita +'+RW475.play);if(RW475.k){c+=RW475.k*RW475.kill;why.push(RW475.k+' uccision'+(RW475.k===1?'e':'i')+' +'+RW475.k*RW475.kill);}
    if(w===0||w===1){if(w===(A475.team|0)){c+=RW475.win;why.push('vittoria +'+RW475.win);}}else{c+=RW475.draw;why.push('pareggio +'+RW475.draw);}}
  const s=rwDay475();const give=Math.max(0,Math.min(c,RW475.cap-s.c));if(give>0){s.c+=give;try{localStorage.setItem('zs_arena475',JSON.stringify(s));}catch(e){}try{addCoins(give,true);}catch(e){}}
  RW475.t0=0;const el=document.getElementById('a5Rew');if(el){el.innerHTML=give>0?'<b>+'+give+' 🪙</b><small>'+why.join(' · ')+'</small>':(c>0?'<b>Limite premi di oggi raggiunto</b><small>Torna domani per altre monete</small>':'<b>Nessun premio</b><small>Gioca almeno 40 secondi per ricevere monete</small>');}
  const ks=document.getElementById('a5Kills');if(ks)ks.textContent=RW475.k+(RW475.k===1?' uccisione':' uccisioni');}catch(e){e475(e,'end');}return r;};}

// ---------- 7) lobby: clean landscape layout, mode cards, weapon strip with pictures, rules + rewards ----------
function lobbyBusy475(on){const el=document.getElementById('a5Busy');if(el)el.classList.toggle('on',!!on);}
function lobby475(){const scr=document.getElementById('arenaScreen');if(!scr||scr.dataset.v475)return;scr.dataset.v475='1';scr.classList.add('a5');
  const $$=id=>document.getElementById(id),take=id=>{const e=$$(id);if(e&&e.parentNode)e.parentNode.removeChild(e);return e;};
  const back=take('arenaBack'),duel=take('arenaDuel'),trio=take('arenaTrio'),guns=take('arenaGuns'),on1=take('arenaOnline');
  const cnt=take('arenaCount'),msgE=take('arenaMsg'),names=take('arenaNames'),cancel=take('arenaCancel'),endT=take('arenaEndT'),endS=take('arenaEndS'),again=take('arenaAgain'),menu=take('arenaMenu');
  const nav=scr.querySelector('.aNav');if(nav)nav.remove();
  const pick=$$('arenaPick'),wait=$$('arenaWait'),res=$$('arenaResult');
  pick.innerHTML='<div class="a5Top"><span class="a5BackSlot"></span><div class="a5Title"><b>⚔️ ARENA</b><small>Sfide PvP in tempo reale</small></div><span class="a5OnSlot"></span></div>'+
   '<div class="a5Modes"></div><div class="a5Sec"><span>🔫 Scegli l\'arma</span><em id="a5WName"></em></div><div class="a5GunSlot"></div>'+
   '<div class="a5Info"><span>⏱ 3 minuti</span><span>🎯 Vince chi fa più uccisioni</span><span>💊 Bonus e medikit in mappa</span></div>'+
   '<div class="a5RewRow"><b>Premi</b><span>🪙 +'+RW475.kill+' a uccisione</span><span>🏆 +'+RW475.win+' vittoria</span><span>🤝 +'+RW475.draw+' pareggio</span></div><div id="a5Busy"><i></i>Preparo l\'arena…</div>';
  back.className='a5Back';back.textContent='←';back.setAttribute('aria-label','Indietro al menu');pick.querySelector('.a5BackSlot').replaceWith(back);
  if(on1){on1.className='aOnline a5On';pick.querySelector('.a5OnSlot').replaceWith(on1);}
  const card=(b,ic,t,d,n)=>{b.className='a5Mode';b.innerHTML='<i>'+ic+'</i><b>'+t+'</b><small>'+d+'</small><span><em>'+n+'</em><u>GIOCA ▶</u></span>';return b;};
  const md=pick.querySelector('.a5Modes');md.appendChild(card(duel,'🤺','Duello 1 contro 1','Tu contro un altro sopravvissuto','2 giocatori'));md.appendChild(card(trio,'👥','Squadre 3 contro 3','BLU contro ROSSI, gioco di squadra','6 giocatori'));
  guns.className='a5Guns';pick.querySelector('.a5GunSlot').replaceWith(guns);
  wait.innerHTML='<div class="a5Top"><div class="a5Title"><b id="a5WT">In attesa</b><small>Ricerca giocatori in corso</small></div><span class="aOnline a5On"></span></div>'+
   '<div class="a5WaitBox"><div class="a5Radar"><i></i></div><div class="a5WaitTxt"><span class="a5CSlot"></span><span class="a5MSlot"></span></div></div><span class="a5NSlot"></span>'+
   '<div class="a5Tip">💡 Muoviti dietro ai ripari e raccogli i potenziamenti prima degli altri.</div><div class="a5Btns"><span class="a5XSlot"></span></div>';
  cnt.className='a5Count';msgE.className='a5Msg';wait.querySelector('.a5CSlot').replaceWith(cnt);wait.querySelector('.a5MSlot').replaceWith(msgE);names.className='a5Names';wait.querySelector('.a5NSlot').replaceWith(names);
  cancel.className='a5Ghost';cancel.textContent='← Cambia modalità';wait.querySelector('.a5XSlot').replaceWith(cancel);
  res.innerHTML='<div class="a5Top"><div class="a5Title"><span class="a5TSlot"></span><small>Partita finita</small></div><span class="aOnline a5On"></span></div>'+
   '<div class="a5Score"><span class="a5SSlot"></span><em id="a5Kills"></em></div><div id="a5Rew" class="a5Rew"></div><div class="a5Btns"><span class="a5ASlot"></span><span class="a5MenuSlot"></span></div>';
  endT.className='a5EndT';res.querySelector('.a5TSlot').replaceWith(endT);endS.className='a5Count';res.querySelector('.a5SSlot').replaceWith(endS);
  again.className='a5Main';again.textContent='⚔️ Gioca ancora';res.querySelector('.a5ASlot').replaceWith(again);menu.className='a5Ghost';menu.textContent='Menu';res.querySelector('.a5MenuSlot').replaceWith(menu);
  arenaSetOnline(A475.online||0);}
arenaSetOnline=function(n){A475.online=n|0;const nodes=document.querySelectorAll('#arenaScreen .aOnline');const label=(n|0)>0?'<i></i>'+(n|0)+' online':'<i></i>online';for(let i=0;i<nodes.length;i++)nodes[i].innerHTML=label;};
arenaFillWeapons=function(){const box=document.getElementById('arenaGuns');if(!box)return;const list=arenaChoices();let html='',pick='';const prev=A475.weapon;
  for(let i=0;i<list.length;i++){const w=list[i];if(w.id===prev)pick=w.id;html+='<button type="button" class="aGun" data-w="'+w.id+'"><span class="a5Pic"><img src="assets/thumbs/'+w.id+'.webp" alt="" draggable="false" loading="lazy" onerror="this.remove()"></span><b>'+aEsc(w.name)+'</b><small>'+(w.melee?'🗡 mischia':('💥 '+w.dmg+' danno'))+'</small></button>';}
  if(!pick)pick=list.some(w=>w.id==='pistol')?'pistol':(list.length?list[0].id:'knife');A475.weapon=pick;box.innerHTML=html;arenaMarkGun();};
{const _mg=arenaMarkGun;arenaMarkGun=function(){_mg();try{const w=WEAPONS.find(x=>x.id===A475.weapon);const n=document.getElementById('a5WName');if(n)n.textContent=w?w.name:'';const box=document.getElementById('arenaGuns'),b=box&&box.querySelector('.aGun.on');if(b){const l=b.offsetLeft-box.offsetLeft,r=l+b.offsetWidth;if(l<box.scrollLeft)box.scrollLeft=l-4;else if(r>box.scrollLeft+box.clientWidth)box.scrollLeft=r-box.clientWidth+4;}}catch(e){}};}
{const _lb=arenaLobby;arenaLobby=function(msg){const r=_lb(msg);try{const t=document.getElementById('a5WT');if(t)t.textContent=A475.mode===1?'🤺 Duello 1 contro 1':'👥 Squadre 3 contro 3';}catch(e){}return r;};}
{const _q=arenaQueue;arenaQueue=function(mode){const r=_q(mode);try{const t=document.getElementById('a5WT');if(t)t.textContent=(mode===1?'🤺 Duello 1 contro 1':'👥 Squadre 3 contro 3');}catch(e){}return r;};}
{const st=document.createElement('style');st.id='v475css';st.textContent=`
#arenaScreen.a5{padding:calc(8px + var(--sat,0px)) max(10px,var(--sar,0px)) calc(8px + var(--sab,0px)) max(10px,var(--sal,0px))!important;font-family:ZRaj,system-ui,sans-serif}
#arenaScreen.a5 .aPanel{width:min(490px,64vw)!important;max-height:100%!important;padding:10px 12px!important;gap:8px;border-radius:18px!important;background:linear-gradient(180deg,rgba(28,16,10,.94),rgba(14,9,7,.94))!important;border:1px solid rgba(255,190,120,.28)!important;box-shadow:0 14px 40px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,220,170,.08)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
@media (orientation:portrait){#arenaScreen.a5 .aPanel{width:100%!important}}
#arenaScreen .a5Top{display:flex;align-items:center;gap:10px;flex:0 0 auto}
#arenaScreen .a5Back{flex:0 0 38px;width:38px;height:38px;border-radius:12px;border:1px solid rgba(255,220,180,.25);background:rgba(255,255,255,.07);color:#ffe2b0;font:800 20px/36px system-ui,sans-serif;padding:0;pointer-events:auto}
#arenaScreen .a5Title{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.05}
#arenaScreen .a5Title b,#arenaScreen .a5EndT{font:800 22px ZRaj,sans-serif;letter-spacing:.06em;color:#ffd9a0;text-shadow:0 2px 0 rgba(0,0,0,.4);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#arenaScreen .a5Title small{font-size:11.5px;color:#d8b994;opacity:.85;letter-spacing:.03em}
#arenaScreen .a5On{flex:0 0 auto;margin:0!important;padding:4px 9px;border-radius:999px;background:rgba(80,200,120,.14);border:1px solid rgba(110,230,150,.35);color:#b8f5c8!important;font:700 11.5px system-ui,sans-serif!important;letter-spacing:.02em!important;white-space:nowrap}
#arenaScreen .a5On i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#5be38a;margin-right:5px;box-shadow:0 0 6px #5be38a;animation:a5p 1.6s infinite}
@keyframes a5p{50%{opacity:.35}}
#arenaScreen .a5Modes{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:0 0 auto}
#arenaScreen .a5Mode{pointer-events:auto;position:relative;display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto auto;column-gap:8px;text-align:left;padding:8px 10px;min-height:84px;border-radius:14px;border:1px solid rgba(255,190,110,.45);background:linear-gradient(160deg,rgba(255,150,60,.28),rgba(140,50,20,.32));color:#fff;font-family:inherit;box-shadow:0 4px 14px rgba(0,0,0,.35);transition:transform .08s}
#arenaScreen #arenaTrio.a5Mode{border-color:rgba(120,170,255,.45);background:linear-gradient(160deg,rgba(80,130,255,.28),rgba(30,40,120,.34))}
#arenaScreen .a5Mode:active{transform:scale(.97)}
#arenaScreen .a5Mode i{grid-row:1/3;font-style:normal;font-size:26px;line-height:34px;text-align:center}
#arenaScreen .a5Mode b{font:800 14.5px ZRaj,sans-serif;letter-spacing:.02em;line-height:1.15}
#arenaScreen .a5Mode small{font-size:11px;opacity:.82;line-height:1.2}
#arenaScreen .a5Mode span{grid-column:1/3;display:flex;align-items:center;justify-content:space-between;margin-top:6px}
#arenaScreen .a5Mode em{font-style:normal;font-size:10.5px;opacity:.8}
#arenaScreen .a5Mode u{text-decoration:none;font:800 12px system-ui,sans-serif;padding:4px 10px;border-radius:999px;background:#ffb547;color:#2a1400;box-shadow:0 2px 0 #b06a10}
#arenaScreen #arenaTrio.a5Mode u{background:#8fb6ff;color:#0a1640;box-shadow:0 2px 0 #3a5ab0}
#arenaScreen .a5Sec{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex:0 0 auto;font:700 12px system-ui,sans-serif;color:#e8cfae;margin:0 2px -2px}
#arenaScreen .a5Sec em{font-style:normal;color:#ffd38a;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#arenaScreen #arenaGuns.a5Guns{display:flex!important;flex-direction:row!important;gap:6px!important;margin:0!important;overflow-x:auto!important;overflow-y:hidden!important;max-height:none!important;min-height:0;flex:0 0 auto!important;padding:2px 2px 4px!important;scrollbar-width:none;overscroll-behavior-x:contain}
#arenaScreen #arenaGuns.a5Guns::-webkit-scrollbar{display:none}
#arenaScreen #arenaGuns.a5Guns,#arenaScreen #arenaGuns.a5Guns *{touch-action:pan-x!important}
#arenaScreen #arenaGuns .aGun{flex:0 0 88px;min-height:0!important;padding:5px 5px 6px!important;border-radius:12px!important;text-align:center!important;display:flex;flex-direction:column;align-items:center;gap:1px;background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.14)!important}
#arenaScreen #arenaGuns .aGun.on{border-color:#ffb547!important;background:rgba(255,150,50,.2)!important;box-shadow:0 0 0 1px #ffb547 inset}
#arenaScreen #arenaGuns .a5Pic{display:block;width:76px;height:38px;border-radius:8px;background:radial-gradient(ellipse at 50% 60%,rgba(255,220,170,.16),rgba(0,0,0,0) 70%)}
#arenaScreen #arenaGuns .a5Pic img{width:100%;height:100%;object-fit:contain;pointer-events:none}
#arenaScreen #arenaGuns .aGun b{font-size:11.5px!important;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px}
#arenaScreen #arenaGuns .aGun small{font-size:10px!important;opacity:.7}
#arenaScreen .a5Info,#arenaScreen .a5RewRow{display:flex;flex-wrap:wrap;gap:5px;flex:0 0 auto}
#arenaScreen .a5Info span,#arenaScreen .a5RewRow span{font:600 11px system-ui,sans-serif;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.07);color:#ecdcc4}
#arenaScreen .a5RewRow b{font:800 11px system-ui,sans-serif;color:#ffd38a;padding:3px 2px;letter-spacing:.06em;text-transform:uppercase}
#arenaScreen .a5RewRow span{background:rgba(255,200,80,.12);color:#ffe2a8}
#a5Busy{display:none;align-items:center;gap:8px;font:700 12px system-ui,sans-serif;color:#ffe2b0}
#a5Busy.on{display:flex}
#a5Busy i{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,220,170,.3);border-top-color:#ffb547;animation:a5s .8s linear infinite}
@keyframes a5s{to{transform:rotate(360deg)}}
#arenaScreen .a5WaitBox{display:flex;align-items:center;gap:12px;flex:0 0 auto}
#arenaScreen .a5Radar{flex:0 0 58px;height:58px;border-radius:50%;border:2px solid rgba(255,180,90,.5);position:relative;overflow:hidden;background:radial-gradient(circle,rgba(255,170,80,.18),rgba(0,0,0,0) 70%)}
#arenaScreen .a5Radar i{position:absolute;left:50%;top:50%;width:50%;height:2px;background:linear-gradient(90deg,#ffb547,rgba(255,181,71,0));transform-origin:0 50%;animation:a5s 1.4s linear infinite}
#arenaScreen .a5WaitTxt{display:flex;flex-direction:column;min-width:0}
#arenaScreen .a5Count{font:800 30px ZRaj,sans-serif!important;letter-spacing:.06em;color:#fff;margin:0!important;line-height:1.05}
#arenaScreen .a5Msg{font-size:12px;color:#e8cfae;opacity:.9;margin:0}
#arenaScreen .a5Names{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:5px;flex:0 0 auto}
#arenaScreen .a5Names li{font:700 11.5px system-ui,sans-serif;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}
#arenaScreen .a5Tip{font-size:11.5px;color:#d8c2a4;background:rgba(255,255,255,.05);border-radius:10px;padding:6px 9px;flex:0 0 auto}
#arenaScreen .a5Btns{display:flex;gap:8px;flex:0 0 auto;margin-top:auto}
#arenaScreen .a5Main,#arenaScreen .a5Ghost{pointer-events:auto;flex:1 1 0;min-height:42px;border-radius:12px;font:800 14px ZRaj,system-ui,sans-serif;letter-spacing:.03em;padding:8px 12px}
#arenaScreen .a5Main{border:0;background:linear-gradient(180deg,#ffc35a,#ff8a1f);color:#2a1400;box-shadow:0 3px 0 #a85a10}
#arenaScreen .a5Ghost{border:1px solid rgba(255,220,180,.3);background:rgba(255,255,255,.06);color:#ffe2b0}
#arenaScreen .a5Score{display:flex;align-items:baseline;gap:10px;flex:0 0 auto}
#arenaScreen .a5Score em{font-style:normal;font:700 12px system-ui,sans-serif;color:#ffd38a}
#arenaScreen .a5Rew{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px;background:linear-gradient(90deg,rgba(255,190,60,.18),rgba(255,190,60,.04));border:1px solid rgba(255,200,90,.3);flex:0 0 auto}
#arenaScreen .a5Rew:empty{display:none}
#arenaScreen .a5Rew b{font:800 16px ZRaj,sans-serif;color:#ffe08a}
#arenaScreen .a5Rew small{font-size:11px;color:#ecdcc4;opacity:.85}
@media (max-height:380px){#arenaScreen .a5Mode{min-height:74px;padding:6px 9px}#arenaScreen .a5Title b,#arenaScreen .a5EndT{font-size:19px}#arenaScreen .a5Info{display:none}}
`;document.head.appendChild(st);}
try{lobby475();}catch(e){e475(e,'lobby');}
A475.open=arenaOpen;A475.hud=arenaHud;
window.__zs475={get m(){return M475;},get warm(){return WARM475;},INT475,RW475,FIG475,warmArena475};
