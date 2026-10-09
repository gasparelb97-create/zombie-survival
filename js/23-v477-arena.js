/* Zombie Survival — game code part 23-v477 (4.3.77). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.77: arena — combat-only HUD, new fighters + full animation, aim mode, visible enemy shots, clear pickups, richer map, intro / outro / scoreboard =======================
const M477={on:true,err:0,ok:{}};function e477(e,w){M477.err++;try{console.warn('477',w,e&&e.message);}catch(_){}try{window.__DBG&&__DBG.prob('err','arena477',w+': '+(e&&e.message||e));}catch(_){}if(M477.err>80)M477.on=false;}
const A7=ARENA454;
function lv477(){try{return lv476();}catch(e){return 1;}}
function play477(){return !!(A7.on&&A7.phase==='play'&&game.state==='play');}

// ---------- 1) arena HUD: only what matters in a fight (weapon, ammo, health, score, aim) ----------
{const st=document.createElement('style');st.id='v477css';st.textContent=`
body.arena454 #wbar,body.arena454 #roofBtn,body.arena454 #torch468,body.arena454 #qChip,body.arena454 #qMenuBtn,body.arena454 #shelter42,body.arena454 #sleep42,body.arena454 #wakeBtn,body.arena454 #tip42,body.arena454 #res432,body.arena454 #coin42,body.arena454 #xp42,body.arena454 #combo,body.arena454 #bossBar,body.arena454 #buildBar,body.arena454 #bCat43,body.arena454 #wpick,body.arena454 #harv,body.arena454 #mats,body.arena454 #gearPop,body.arena454 #wcmp467,body.arena454 #loot452,body.arena454 #newsBtn,body.arena454 #hw476,body.arena454 #pickHint,body.arena454 #bagBtn,body.arena454 #buffs{display:none!important}
body.touch.arena454 #controls #adsBtn{display:flex!important}
body.arena454 #adsBtn.on{background:rgba(255,90,70,.5)!important;border-color:#ffb0a0!important}
#vig477{position:fixed;inset:0;pointer-events:none;z-index:6;opacity:0;transition:opacity .12s;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 38%,rgba(0,0,0,.28) 62%,rgba(0,0,0,.72) 100%)}
body.arena454.ads #vig477{opacity:1}
body.arena454.ads #cross i{background:#fff!important}
#pk477{position:fixed;left:0;top:0;z-index:7;pointer-events:none;display:none;transform:translate(-50%,-100%);padding:5px 10px 6px;border-radius:12px;background:rgba(10,12,18,.78);border:1px solid var(--c,#fff);box-shadow:0 0 14px var(--c,#fff);color:#fff;font:800 13px ZRaj,system-ui,sans-serif;white-space:nowrap;text-align:center;line-height:1.15}
#pk477 small{display:block;font:600 10.5px system-ui,sans-serif;opacity:.85}
#pk477 i{font-style:normal;margin-right:4px}
#an477{position:fixed;left:50%;top:30%;transform:translate(-50%,-50%);z-index:8;pointer-events:none;text-align:center;font:900 30px ZRaj,system-ui,sans-serif;letter-spacing:.08em;color:#ffe08a;text-shadow:0 3px 0 rgba(0,0,0,.5),0 0 18px rgba(255,140,40,.7);opacity:0}
#an477.show{animation:an477 1.4s ease-out}
#an477 small{display:block;font:700 13px system-ui,sans-serif;letter-spacing:.04em;color:#fff;opacity:.9}
@keyframes an477{0%{opacity:0;transform:translate(-50%,-50%) scale(1.8)}12%{opacity:1;transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%) scale(.96)}}
#in477{position:fixed;inset:0;z-index:30;pointer-events:none;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:radial-gradient(ellipse at center,rgba(0,0,0,.25),rgba(0,0,0,.7));font-family:ZRaj,system-ui,sans-serif;color:#fff;transition:opacity .35s}
#in477.on{display:flex}
#in477 .t{font:900 34px ZRaj,sans-serif;letter-spacing:.14em;color:#ffd9a0;text-shadow:0 3px 0 rgba(0,0,0,.5),0 0 22px rgba(255,150,50,.6)}
#in477 .vs{display:flex;align-items:stretch;gap:14px}
#in477 .tm{min-width:130px;padding:8px 12px;border-radius:14px;background:rgba(0,0,0,.45);border:2px solid var(--c);box-shadow:0 0 16px var(--c)}
#in477 .tm b{display:block;font:900 15px ZRaj,sans-serif;letter-spacing:.1em;color:var(--c)}
#in477 .tm span{display:block;font:700 12px system-ui,sans-serif;opacity:.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
#in477 .tm span.me{color:#ffe08a}
#in477 .x{align-self:center;font:900 22px ZRaj,sans-serif;color:#fff;opacity:.85}
#in477 .cd{font:900 64px ZRaj,sans-serif;color:#fff;text-shadow:0 0 24px rgba(255,200,120,.9);min-height:72px}
#in477 .cd.go{color:#ffcf5a;font-size:52px}
#ou477{position:fixed;inset:0;z-index:30;pointer-events:none;display:none;align-items:center;justify-content:center;flex-direction:column;font-family:ZRaj,system-ui,sans-serif}
#ou477.on{display:flex;animation:ou477 .5s ease-out}
#ou477 b{font:900 46px ZRaj,sans-serif;letter-spacing:.12em;text-shadow:0 4px 0 rgba(0,0,0,.5),0 0 30px currentColor}
#ou477 small{font:700 15px system-ui,sans-serif;color:#fff;margin-top:6px}
@keyframes ou477{0%{opacity:0;transform:scale(1.6)}100%{opacity:1;transform:scale(1)}}
#dd477{position:fixed;left:50%;top:58%;transform:translateX(-50%);z-index:8;pointer-events:none;display:none;padding:8px 16px;border-radius:14px;background:rgba(40,0,0,.6);border:1px solid rgba(255,90,90,.5);color:#fff;font:800 15px ZRaj,system-ui,sans-serif;text-align:center}
#dd477 small{display:block;font:600 11.5px system-ui,sans-serif;opacity:.85}
#arenaScreen .a7Board{display:flex;flex-direction:column;gap:3px;flex:0 0 auto;font:700 12px system-ui,sans-serif}
#arenaScreen .a7Board .r{display:grid;grid-template-columns:14px 1fr 34px 34px 46px;gap:6px;align-items:center;padding:4px 8px;border-radius:9px;background:rgba(255,255,255,.05)}
#arenaScreen .a7Board .r.h{background:none;font-size:10.5px;opacity:.7;padding-top:0;padding-bottom:0}
#arenaScreen .a7Board .r.me{background:rgba(255,200,90,.16);border:1px solid rgba(255,200,90,.35)}
#arenaScreen .a7Board .r i{width:10px;height:10px;border-radius:50%;display:inline-block}
#arenaScreen .a7Board .r b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:800}
#arenaScreen .a7Board .r span{text-align:right}
#feed .k477{font:700 12px system-ui,sans-serif;padding:3px 8px;border-radius:8px;background:rgba(0,0,0,.5);white-space:nowrap}
#feed .k477 .b{color:#7fb2ff}#feed .k477 .r{color:#ff7a7a}#feed .k477 .me{text-decoration:underline}
`;document.head.appendChild(st);
 const mk=(id,html)=>{if(document.getElementById(id))return;const d=document.createElement('div');d.id=id;if(html)d.innerHTML=html;document.body.appendChild(d);};
 mk('vig477');mk('pk477');mk('an477');mk('in477');mk('ou477');mk('dd477');}
// only the weapon taken into the arena: no switching during a match
{const _eq=equip;equip=function(i,silent){try{if(M477.on&&A7.on&&A7.phase==='play'){const w=WEAPONS[i];if(w&&w.id!==A7.weapon)return false;}}catch(e){}return _eq.apply(this,arguments);};}

// ---------- 2) fighters redesigned: rounded limbs, plate carrier, helmet + goggles, face, backpack; still ONE draw each ----------
const FIG477={geo:null,tris:0};
function shapes477(){if(FIG477.SH)return FIG477.SH;const SH={b:new T.BoxGeometry(1,1,1),c:new T.CylinderGeometry(.5,.5,1,12),k:new T.CylinderGeometry(.5,.4,1,12),s:new T.SphereGeometry(.5,16,12),
  h:new T.SphereGeometry(.5,16,8,0,Math.PI*2,0,Math.PI/2),p:new T.CapsuleGeometry(.5,1,4,12).scale(1,.5,1),o:new T.OctahedronGeometry(.5,0),n:new T.ConeGeometry(.5,1,10),t:new T.TorusGeometry(.38,.12,8,18)};
  for(const k in SH){let g=SH[k];if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');SH[k]=g;}FIG477.SH=SH;return SH;}
// generic merged builder: P = [shape, colour, team(0/1), x,y,z, sx,sy,sz, rx,ry,rz, bone?]; bones = optional matrix per bone name
function build477(P,boneM,BI){const SH=shapes477();let n=0;for(const p of P)n+=SH[p[0]].attributes.position.count;
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),bi=BI?new Float32Array(n):null,tm=BI?new Float32Array(n):null;
  const M=new T.Matrix4(),Mp=new T.Matrix4(),N3=new T.Matrix3(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),s=new T.Vector3(),cc=new T.Color();let o=0;
  for(const p of P){const g=SH[p[0]],Pa=g.attributes.position,Na=g.attributes.normal,c=Pa.count;Mp.compose(v.set(p[3],p[4],p[5]),q.setFromEuler(e.set(p[9]||0,p[10]||0,p[11]||0)),s.set(p[6],p[7],p[8]));
    if(boneM)M.multiplyMatrices(boneM[p[12]],Mp);else M.copy(Mp);N3.getNormalMatrix(M);cc.setHex(p[1]);const jr=1+((o*7919)%13-6)*.004;
    for(let i=0;i<c;i++){v.fromBufferAttribute(Pa,i).applyMatrix4(M);const j=(o+i)*3;pos[j]=v.x;pos[j+1]=v.y;pos[j+2]=v.z;v.fromBufferAttribute(Na,i).applyMatrix3(N3).normalize();nor[j]=v.x;nor[j+1]=v.y;nor[j+2]=v.z;
      col[j]=cc.r*jr;col[j+1]=cc.g*jr;col[j+2]=cc.b*jr;if(BI){bi[o+i]=BI[p[12]];tm[o+i]=p[2]?1:0;}}o+=c;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));
  if(BI){geo.setAttribute('bI475',new T.BufferAttribute(bi,1));geo.setAttribute('aT475',new T.BufferAttribute(tm,1));}geo.computeBoundingSphere();return geo;}
function figParts477(){const P=[],H=Math.PI/2;let B='pelvis';const a=(sh,c,t,x,y,z,sx,sy,sz,rx,ry,rz)=>P.push([sh,c,t,x,y,z,sx,sy,sz,rx||0,ry||0,rz||0,B]);
  const C={skin:0xd6a47c,skinD:0xb98a64,pants:0x4a503c,pants2:0x3d4231,boot:0x2c2621,sole:0x111111,lace:0x15120f,pad:0x25272b,vest:0x363b2d,vest2:0x2c3025,pouch:0x464d38,flap:0x535a42,belt:0x2a2420,brass:0xa08c58,
    dark:0x1b1e23,glove:0x24262a,white:0xf0eeea,iris:0x3a2a1c,hair:0x2b2119,helm:0x4d5442,helm2:0x3d4335,lens:0x77b4d8,pack:0x4c4838,pack2:0x5c5642,tm:0xdedede,tm2:0xbdbdbd};
  // hips + belt kit
  a('b',C.pants,0, 0,0,0, .34,.2,.23);a('b',C.belt,0, 0,.085,0, .37,.055,.25);a('b',C.brass,0, 0,.085,-.128, .065,.04,.012);
  a('b',C.pouch,0, -.19,.03,.03, .06,.1,.11);a('b',C.flap,0, -.19,.085,.03, .065,.025,.115);a('b',C.pouch,0, .12,.03,.13, .1,.1,.05);a('b',C.dark,0, .2,-.06,-.01, .06,.18,.11);
  a('b',C.tm2,1, -.13,.02,-.118, .07,.05,.01);
  for(const sd of [-1,1]){B=sd<0?'hipL':'hipR';
    a('p',C.pants,0, 0,-.2,0, .17,.47,.17);a('b',C.pants2,0, sd*.088,-.2,-.005, .03,.13,.1);a('b',C.flap,0, sd*.09,-.14,-.005, .032,.03,.105);
    if(sd>0){a('b',C.dark,0, .095,-.12,.01, .03,.2,.1);a('b',C.belt,0, 0,-.24,0, .18,.03,.18);}
    B=sd<0?'kneeL':'kneeR';
    a('p',C.pants,0, 0,-.19,0, .14,.42,.14);a('b',C.pad,0, 0,-.02,-.072, .12,.13,.05);a('b',C.tm2,1, 0,-.02,-.098, .1,.025,.008);
    a('p',C.boot,0, 0,-.37,0, .145,.17,.155);a('b',C.boot,0, 0,-.435,-.075, .13,.08,.24);a('s',C.boot,0, 0,-.43,-.19, .13,.085,.09);a('b',C.lace,0, 0,-.375,-.078, .06,.1,.012);
    a('b',C.sole,0, 0,-.477,-.055, .145,.03,.31);a('b',C.boot,0, 0,-.44,.075, .12,.07,.05);}
  B='spine';
  a('b',C.tm,1, 0,.17,0, .32,.28,.2);a('b',C.tm,1, 0,.37,0, .41,.2,.23);a('p',C.tm,1, 0,.445,0, .17,.5,.17, 0,0,H);
  a('b',C.vest,0, 0,.31,-.122, .35,.33,.06);a('b',C.vest,0, 0,.31,.122, .35,.35,.06);a('b',C.vest2,0, -.172,.25,0, .04,.2,.22);a('b',C.vest2,0, .172,.25,0, .04,.2,.22);
  a('b',C.vest,0, -.12,.47,0, .075,.04,.27);a('b',C.vest,0, .12,.47,0, .075,.04,.27);a('b',C.vest2,0, 0,.47,-.13, .2,.05,.04);
  a('b',C.tm2,1, 0,.395,-.157, .2,.1,.012);a('b',C.tm2,1, 0,.36,.157, .24,.12,.012);
  for(const x of [-.105,0,.105]){a('b',C.pouch,0, x,.2,-.168, .088,.12,.05);a('b',C.flap,0, x,.267,-.172, .092,.028,.056);}
  a('b',C.dark,0, -.125,.4,-.165, .05,.1,.035);a('c',C.dark,0, -.135,.53,-.16, .012,.17,.012);a('b',C.pouch,0, .13,.33,-.165, .06,.08,.04);
  a('c',C.tm2,1, 0,.53,0, .17,.06,.16);
  a('b',C.pack,0, 0,.27,.205, .29,.33,.13);a('b',C.pack2,0, 0,.18,.275, .22,.13,.03);a('c',C.pack2,0, 0,.46,.205, .13,.29,.13, 0,0,H);a('b',C.belt,0, -.09,.3,.27, .03,.3,.012);a('b',C.belt,0, .09,.3,.27, .03,.3,.012);
  for(const sd of [-1,1]){B=sd<0?'shL':'shR';
    a('s',C.vest,0, 0,-.03,0, .16,.13,.16);a('c',C.tm2,1, 0,-.075,0, .135,.03,.135);a('p',C.tm,1, 0,-.16,0, .118,.34,.118);
    B=sd<0?'elL':'elR';
    a('s',C.pad,0, 0,0,.045, .09,.09,.06);a('c',C.tm2,1, 0,-.04,0, .108,.07,.108);a('p',C.skin,0, 0,-.14,0, .095,.27,.095);
    a('p',C.glove,0, 0,-.285,0, .088,.12,.092);a('b',C.glove,0, 0,-.345,-.02, .072,.055,.065);a('b',C.dark,0, 0,-.235,0, .1,.025,.1);}
  B='neck';
  a('c',C.skin,0, 0,.04,0, .1,.1,.1);a('s',C.skin,0, 0,.17,-.005, .2,.24,.225);a('b',C.skin,0, 0,.095,-.03, .15,.07,.15);a('s',C.skin,0, 0,.08,-.083, .085,.05,.05);
  a('b',C.skinD,0, 0,.155,-.118, .03,.055,.04);a('s',C.skin,0, -.104,.165,0, .03,.065,.05);a('s',C.skin,0, .104,.165,0, .03,.065,.05);
  for(const x of [-.047,.047]){a('b',C.white,0, x,.18,-.109, .042,.022,.01);a('b',C.iris,0, x,.18,-.115, .018,.018,.006);a('b',C.hair,0, x,.207,-.109, .055,.014,.014, 0,0,-x*2.6);}
  a('b',0x8a4e3e,0, 0,.105,-.108, .05,.011,.01);a('b',C.hair,0, 0,.13,.088, .2,.12,.06);
  a('h',C.helm,0, 0,.207,.005, .27,.25,.29);a('c',C.helm2,0, 0,.21,.005, .275,.028,.295);a('c',C.tm2,1, 0,.258,.005, .262,.022,.282);
  a('b',C.dark,0, 0,.285,-.12, .18,.045,.04);a('b',C.lens,0, -.045,.285,-.142, .062,.034,.008);a('b',C.lens,0, .045,.285,-.142, .062,.034,.008);a('b',C.dark,0, 0,.31,-.13, .05,.03,.03);
  a('c',C.dark,0, -.12,.165,0, .075,.04,.075, 0,0,H);a('c',C.dark,0, .12,.165,0, .075,.04,.075, 0,0,H);a('b',C.dark,0, -.1,.115,-.02, .012,.12,.02);a('b',C.dark,0, .1,.115,-.02, .012,.12,.02);
  a('b',C.helm2,0, -.132,.225,0, .015,.04,.17);a('b',C.helm2,0, .132,.225,0, .015,.04,.17);
  return P;}
function figGeo477(){if(FIG477.geo)return FIG477.geo;const sk=skel475();sk.g.updateMatrixWorld(true);const BM={},BI={};FIG475.BONES.forEach((n,i)=>{BM[n]=sk.B[n].matrixWorld;BI[n]=i;});
  const geo=build477(figParts477(),BM,BI);geo.boundingSphere.radius*=1.5;FIG477.geo=geo;FIG477.tris=geo.attributes.position.count/3;return geo;}
function figAll477(){const A=A7,out=[];for(const f of A.pool)out.push(f);for(const f of (A.demo||[]))out.push(f);for(const id in A.fig)out.push(A.fig[id]);return out;}
try{const g=figGeo477();for(const f of figAll477())if(f&&f.mesh&&f.v475)f.mesh.geometry=g;FIG475.geo=g;}catch(e){e477(e,'fig');}

// ---------- 3) animation: legs follow the movement (walk / run / strafe / backpedal), torso + head follow the aim, idle, recoil, hit reaction, death fall ----------
const POSE477={R:POSE475.R,L:POSE475.L};
function drive477(f,x,z,yaw,now,alive){const dt=Math.min(.05,Math.max(.001,(now-(f.t7||now-16))/1000));f.t7=now;
  if(f.x7==null||Math.hypot(x-f.x7,z-f.z7)>3){f.x7=x;f.z7=z;f.vx7=0;f.vz7=0;f.ph7=f.ph7||0;f.amp7=0;f.leg7=0;f.run7=0;}
  const vx=(x-f.x7)/dt,vz=(z-f.z7)/dt;f.x7=x;f.z7=z;const k=Math.min(1,dt*9);f.vx7+=(vx-f.vx7)*k;f.vz7+=(vz-f.vz7)*k;
  const sp=alive?Math.hypot(f.vx7,f.vz7):0,sy=Math.sin(yaw),cy=Math.cos(yaw);const fw=-(f.vx7*sy+f.vz7*cy),rt=f.vx7*cy-f.vz7*sy;
  let ang=sp>.35?Math.atan2(rt,fw):0,back=false;if(Math.abs(ang)>1.85){back=true;ang=ang>0?ang-Math.PI:ang+Math.PI;}
  const legT=Math.max(-1.05,Math.min(1.05,-ang));f.leg7+=(legT-f.leg7)*Math.min(1,dt*7);
  const ampT=Math.min(1.3,sp/4.4);f.amp7+=(ampT-f.amp7)*Math.min(1,dt*(ampT>f.amp7?8:5));const amp=f.amp7,r=Math.max(0,Math.min(1,(sp-4.6)/2.2));f.run7+=(r-f.run7)*Math.min(1,dt*5);const run=f.run7;
  f.ph7=(f.ph7||0)+dt*sp*(2.05+.35*run)*(back?-1:1);const ph=f.ph7,s=Math.sin(ph),c=Math.cos(ph),t=now/1000,sd=f.seed475||(f.seed475=Math.random()*6);
  f.g.position.set(x,0,z);f.g.rotation.set(0,yaw||0,0);
  // decays
  f.rec7=Math.max(0,(f.rec7||0)-dt*7);f.hit7=Math.max(0,(f.hit7||0)-dt*4.5);
  if(f.tb7&&f.tc475){const h=f.hit7;f.tc475.copy(f.tb7);if(h>0)f.tc475.lerp(_wh477,h*.55);}
  if(!alive){if(!f.dead7)f.dead7=now;deathPose477(f,(now-f.dead7)/1000);return;}f.dead7=0;
  const idle=amp<.06,br=Math.sin(t*1.7+sd)*.012,pt=Math.max(-.7,Math.min(.7,f.pitch475||0)),rec=f.rec7,hit=f.hit7,hd=f.hd7||1;
  const A=amp*(.62+.28*run),Kn=(.95+.45*run)*amp;
  f.hipL.rotation.set(s*A,0,.03);f.hipR.rotation.set(-s*A,0,-.03);
  f.kneeL.rotation.set(-(.1+Math.max(0,c)*Kn+(idle?.04:0)),0,0);f.kneeR.rotation.set(-(.1+Math.max(0,-c)*Kn+(idle?.04:0)),0,0);
  const bob=(1-Math.cos(ph*2))*.5*(.025+.035*run)*Math.min(1,amp);
  f.pelvis.position.set(idle?Math.sin(t*.8+sd)*.015:0,.955-.025*Math.min(1,amp)-.035*run-bob,0);
  f.pelvis.rotation.set(.05*Math.min(1,amp)+.1*run,f.leg7+s*.07*Math.min(1,amp),c*.035*Math.min(1,amp)+(idle?Math.sin(t*.8+sd)*.02:0));
  f.spine.rotation.set(.04*amp+.08*run+pt*.42+br-rec*.13-hit*.16,-f.leg7-s*.05*Math.min(1,amp)-.08+hit*.18*hd,-c*.025*Math.min(1,amp)+hit*.22*hd);
  const R=POSE477.R,L=POSE477.L,ab=Math.sin(ph*2)*.035*Math.min(1,amp),kk=rec*.16;
  f.shR.rotation.set(R[0]+ab-kk,R[1],R[2]);f.elR.rotation.set(R[3]+kk*.4,0,0);f.shL.rotation.set(L[0]+ab-kk,L[1],L[2]);f.elL.rotation.set(L[3]+kk*.4,0,0);
  f.neck.rotation.set(pt*.5-.04-br-hit*.25,.08+Math.sin(t*.6+sd)*(idle?.1:.025),-s*.03*Math.min(1,amp));}
const _wh477=new T.Color(0xffffff);
function deathPose477(f,u){const e=v=>v<0?0:v>1?1:v,k1=e(u/.22),k2=e((u-.12)/.55),ease=k2*k2*(3-2*k2),sd=f.seed475||0,side=(sd>3?1:-1);
  f.pelvis.position.set(0,.955-.2*k1+.05*ease,0);f.pelvis.rotation.set(-.25*ease,0,side*.12*ease);
  f.hipL.rotation.set(.35*k1+.25*ease,0,.12*ease);f.hipR.rotation.set(.15*k1+.6*ease,0,-.1*ease);f.kneeL.rotation.set(-(.9*k1-.4*ease),0,0);f.kneeR.rotation.set(-(.55*k1),0,0);
  f.spine.rotation.set(.3*k1-.35*ease,side*.25*ease,side*.15*ease);f.neck.rotation.set(-.2*k1-.35*ease,side*.3*ease,0);
  f.shL.rotation.set(-.4-1.4*ease,0,.5*ease);f.elL.rotation.set(.6*(1-ease)+.3,0,0);f.shR.rotation.set(-.2-1.1*ease,0,-.4*ease);f.elR.rotation.set(.9*(1-ease)+.2,0,0);
  f.g.rotation.x=1.42*ease;f.g.position.y=0;}
{const _ad=arenaDrive;arenaDrive=function(f,x,z,yaw,now,alive){if(!M477.on||!f||!f.v475)return _ad.apply(this,arguments);try{drive477(f,x,z,yaw,now,!!alive);}catch(e){e477(e,'drive');try{_ad.apply(this,arguments);}catch(_){}}};}
// team colour base for the hit flash
{const _lb=arenaLabel;arenaLabel=function(f,name,team){const r=_lb.apply(this,arguments);try{if(f&&f.tc475){f.tb7=(f.tb7||new T.Color()).setHex(team?0xd23a3a:0x2f6fd0);}}catch(e){}return r;};}

// ---------- 4) spawn effect: light pillar + rising sparks + whoosh (respawns and match start) ----------
const SPN477={pool:[],i:0};
function spawnPool477(){if(SPN477.pool.length||!A7.root)return;const cv=document.createElement('canvas');cv.width=8;cv.height=64;const g=cv.getContext('2d');const gr=g.createLinearGradient(0,64,0,0);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,8,64);
  const tex=new T.CanvasTexture(cv);const geo=new T.CylinderGeometry(.55,.75,4,18,1,true);geo.translate(0,2,0);const rg=new T.RingGeometry(.2,1,28);rg.rotateX(-Math.PI/2);
  for(let i=0;i<4;i++){const m=new T.Mesh(geo,new T.MeshBasicMaterial({map:tex,color:0xffffff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}));m.visible=false;m.frustumCulled=false;
    const ring=new T.Mesh(rg,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));ring.position.y=.04;m.add(ring);A7.root.add(m);SPN477.pool.push({m,ring,t:0,max:1});}}
function spawnFx477(x,z,team,me){try{spawnPool477();const s=SPN477.pool[SPN477.i++%SPN477.pool.length];if(!s)return;const col=team?0xff5a4a:0x5aa0ff;s.m.position.set(x,0,z);s.m.material.color.setHex(col);s.ring.material.color.setHex(col);s.t=s.max=1.1;s.m.visible=true;
  emit(_tmp.set(x,.2,z),_up,lv477()?26:12,[col,0xffffff,team?0xffb070:0xa0e0ff],{speed:3.2,spread:.55,life:.9,size:.06,grav:-2.5,up:1});
  const d=me?0:Math.hypot(x-player.pos.x,z-player.pos.z);if(d<40)sfx477('spawn',1-d/40);}catch(e){e477(e,'spawnfx');}}
function spawnTick477(dt){for(const s of SPN477.pool){if(!s.m.visible)continue;s.t-=dt;if(s.t<=0){s.m.visible=false;continue;}const k=s.t/s.max,u=1-k;
  s.m.material.opacity=Math.min(1,u*6)*k*.9;s.m.scale.set(1+u*.4,.6+u*.7,1+u*.4);s.ring.material.opacity=k*.9;s.ring.scale.setScalar(.6+u*2.6);}}

// ---------- 5) remote players: tuned interpolation buffer, smooth respawn, visible shots ----------
const INT477={jit:12,last:0,iv:62};
{const _sn=arenaSnap;arenaSnap=function(msg){
  // reconciliation: tp 2 = the server refused a jump -> only the position is corrected (aim untouched)
  try{if(msg&&msg.you&&msg.you.tp===2){player.pos.x=msg.you.x;player.pos.z=msg.you.z;player.vel.set(0,0,0);msg.you.tp=0;}}catch(e){}
  const was=A7.alive,prev={};try{for(const id in A7.actors)prev[id]=A7.actors[id].alive;}catch(e){}
  _sn(msg);
  try{const now=performance.now();if(INT477.last){const d=Math.min(400,now-INT477.last);INT477.iv+=(d-INT477.iv)*.08;INT477.jit+=(Math.abs(d-INT477.iv)-INT477.jit)*.08;}INT477.last=now;
    if(M477.on&&typeof INT475!=='undefined')INT475.delay=Math.max(80,Math.min(220,INT477.iv+INT477.jit*2.2+22));
    const arr=msg&&msg.players||[];for(const q of arr){if(q.id===A7.me)continue;const a=A7.actors[q.id];if(!a)continue;a.k7=q.k|0;a.d7=q.d|0;if(q.alive&&prev[q.id]===0)spawnFx477(q.x,q.z,q.team|0,false);}
    if(msg&&msg.you){if(!was&&msg.you.alive&&A7.phase==='play'){spawnFx477(player.pos.x,player.pos.z,A7.team|0,true);deadUI477(null);}if(msg.you.alive===0&&was)A7.deadAt7=now;}}catch(e){e477(e,'snap');}};}

// ---------- 6) sounds (WebAudio synth, distance + stereo aware) ----------
function pan477(x,z){try{const dx=x-camera.position.x,dz=z-camera.position.z,d=Math.hypot(dx,dz)||1;const rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);return Math.max(-1,Math.min(1,(dx*rx+dz*rz)/d));}catch(e){return 0;}}
function sfx477(k,v,x,z,o){try{if(!AU.ctx)return;const t=AU.ctx.currentTime,g=Math.max(0,Math.min(1,v==null?1:v));if(g<.03)return;const dest=x!=null?out(pan477(x,z)):undefined;
  if(k==='shot'){const heavy=o&&o.heavy,f=o&&o.f||1;nz(t,.09+.06*heavy,.5*g,'lowpass',(2600-1400*(1-g))*f,300,.8,dest);osc(t,.08,.3*g,'triangle',(heavy?90:150)*f,40,dest);if(g>.4)nz(t+.02,.25,.12*g,'bandpass',900,300,1.2,dest);}
  else if(k==='spawn'){osc(t,.6,.12*g,'sine',220,880);osc(t+.05,.5,.08*g,'triangle',330,1320);nz(t,.5,.12*g,'bandpass',600,3000,2);}
  else if(k==='beep'){osc(t,.14,.22*g,'square',o||660,o||660);osc(t,.14,.1*g,'sine',(o||660)*2,(o||660)*2);}
  else if(k==='horn'){osc(t,.9,.18*g,'sawtooth',196,196);osc(t,.9,.14*g,'sawtooth',247,247);osc(t,.9,.12*g,'sawtooth',294,294);nz(t,.5,.1*g,'lowpass',800,200,1);}
  else if(k==='win'){[523,659,784,1047].forEach((f,i)=>{osc(t+i*.13,.5,.16*g,'triangle',f,f);osc(t+i*.13,.5,.06*g,'square',f/2,f/2);});}
  else if(k==='lose'){[392,330,262,196].forEach((f,i)=>{osc(t+i*.18,.55,.15*g,'triangle',f,f*.97);});}
  else if(k==='streak'){osc(t,.35,.18*g,'sawtooth',300,900);osc(t+.08,.3,.12*g,'square',600,1200);}
  else if(k==='pick'){const f=o||700;osc(t,.12,.2*g,'sine',f,f*1.5);osc(t+.08,.18,.16*g,'sine',f*1.5,f*2);osc(t+.16,.25,.1*g,'triangle',f*2,f*2);}
  else if(k==='ads'){nz(t,.05,.12*g,'highpass',2500,4000,1);osc(t,.04,.06*g,'square',1800,1200);}}catch(e){}}

// ---------- 7) other players' shots: muzzle flash, tracer, recoil, distant gunfire ----------
const SH477={fl:[],i:0},_m477=new T.Vector3(),_e477=new T.Vector3();
function flashPool477(){if(SH477.fl.length||!A7.root)return;for(let i=0;i<6;i++){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffd08a,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0,fog:false}));s.visible=false;s.scale.set(.9,.9,1);A7.root.add(s);SH477.fl.push({s,t:0});}}
function shot477(msg){const f=A7.fig[msg.id],a=A7.actors[msg.id];if(!a)return;const w=WEAPONS.find(q=>q.id===a.weapon)||null,melee=!!(w&&w.melee);
  _e477.set(+msg.x||0,+msg.y||1.5,+msg.z||0).addScaledVector(_m477.set(+msg.dx||0,+msg.dy||0,+msg.dz||0),Math.max(.5,+msg.l||30));
  let ox=+msg.x||0,oz=+msg.z||0;if(f&&f.g.visible){f.rec7=1;if(!melee){try{f.spine.localToWorld(_m477.set(.09,.32,-.82));}catch(e){_m477.set(ox,1.45,oz);}
    flashPool477();const fl=SH477.fl[SH477.i++%Math.max(1,SH477.fl.length)];if(fl){fl.s.position.copy(_m477);fl.s.visible=true;fl.t=.06;fl.s.material.opacity=1;fl.s.scale.setScalar(.6+Math.random()*.5);fl.s.material.color.setHex(w&&w.color?w.color:0xffd08a);}
    try{tracer(_m477.clone(),_e477.clone(),w&&w.color||0xffe2a0,.035,.09,.85);}catch(e){}ox=_m477.x;oz=_m477.z;}}
  const d=Math.hypot(ox-player.pos.x,oz-player.pos.z);const heavy=w&&(w.id==='sniper'||w.id==='shotgun'||w.id==='dbarrel'||w.id==='glauncher'||w.id==='hunt')?1:0;
  if(!melee)sfx477('shot',1/(1+d/9),ox,oz,{heavy,f:w&&w.id==='pistol'?1.2:1});
  // near miss: a shot passing close to me
  try{if(!melee&&a.team!==A7.team&&A7.alive){const ex=_e477.x-msg.x,ez=_e477.z-msg.z,L=Math.hypot(ex,ez)||1,px=player.pos.x-msg.x,pz=player.pos.z-msg.z,tt=(px*ex+pz*ez)/L;if(tt>0&&tt<L){const off=Math.abs(px*ez-pz*ex)/L;if(off<1.4){fx.shake+=.06;nz(AU.ctx.currentTime,.12,.18,'bandpass',3200,1500,3,out(pan477(msg.x+ex/L*tt,msg.z+ez/L*tt)));}}}}catch(e){}}
function flashTick477(dt){for(const f of SH477.fl){if(!f.s.visible)continue;f.t-=dt;if(f.t<=0){f.s.visible=false;continue;}f.s.material.opacity=f.t/.06;}}

// ---------- 8) hits: reaction, damage numbers, kill feed, streaks, death screen ----------
const KS477={streak:0,lastK:0,multi:0,lastKill:0};
function name477(id){if(id===A7.me)return 'Tu';const a=A7.actors[id];return a&&a.name?a.name:'Giocatore';}
function team477(id){if(id===A7.me)return A7.team|0;const a=A7.actors[id];return a?a.team|0:0;}
function wIcon477(id){const w=WEAPONS.find(q=>q.id===id);if(!w)return '🔫';return w.melee?'🗡️':(id==='sniper'||id==='hunt')?'🎯':(id==='shotgun'||id==='dbarrel'||id==='saw')?'💥':(id==='glauncher')?'💣':(id==='flamer')?'🔥':'🔫';}
function announce477(t,s){const el=document.getElementById('an477');if(!el)return;el.innerHTML=t+(s?'<small>'+s+'</small>':'');el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
function deadUI477(msg){const el=document.getElementById('dd477');if(!el)return;if(!msg){el.style.display='none';return;}el.innerHTML='☠️ Eliminato da <b>'+aEsc(name477(msg.by))+'</b><small>Rientri tra pochi secondi…</small>';el.style.display='block';}
function fx477(msg){const me=A7.me,f=A7.fig[msg.victim];
  if(f&&f.g.visible){f.hit7=1;let hd=1;try{const sx=msg.by===me?player.pos.x:(A7.fig[msg.by]?A7.fig[msg.by].g.position.x:f.g.position.x),sz=msg.by===me?player.pos.z:(A7.fig[msg.by]?A7.fig[msg.by].g.position.z:f.g.position.z);
      const dx=f.g.position.x-sx,dz=f.g.position.z-sz,yw=f.g.rotation.y;hd=(dx*Math.cos(yw)-dz*Math.sin(yw))>0?1:-1;}catch(e){}f.hd7=hd;}
  if(msg.by===me&&msg.dmg&&f){try{dmgNumber(_m477.set(f.g.position.x,msg.part==='head'?2.05:1.85,f.g.position.z),msg.dmg,msg.part==='head',f);}catch(e){}}
  if(!msg.kill)return;
  try{const kt=team477(msg.by),vt=team477(msg.victim),wid=msg.by===me?A7.weapon:(A7.actors[msg.by]&&A7.actors[msg.by].weapon);
    feed('<span class="k477"><span class="'+(kt?'r':'b')+(msg.by===me?' me':'')+'">'+aEsc(name477(msg.by))+'</span> '+wIcon477(wid)+(msg.part==='head'?' 🎯':'')+' <span class="'+(vt?'r':'b')+(msg.victim===me?' me':'')+'">'+aEsc(name477(msg.victim))+'</span></span>');}catch(e){}
  if(msg.by===me){const now=performance.now();KS477.streak++;KS477.multi=(now-KS477.lastKill<4500)?KS477.multi+1:1;KS477.lastKill=now;
    let t='',s='';if(KS477.multi===2)t='DOPPIA UCCISIONE';else if(KS477.multi===3)t='TRIPLA UCCISIONE';else if(KS477.multi>=4)t='INARRESTABILE';
    if(!t&&KS477.streak===3)t='IN SERIE x3';else if(!t&&KS477.streak===5)t='DOMINANTE x5';else if(!t&&KS477.streak>=7&&KS477.streak%2===1)t='LEGGENDARIO x'+KS477.streak;
    if(!t)t=msg.part==='head'?'COLPO ALLA TESTA':'ELIMINATO';s=aEsc(name477(msg.victim));announce477(t,s);if(KS477.multi>1||KS477.streak>=3)sfx477('streak',1);}
  if(msg.victim===me){KS477.streak=0;KS477.multi=0;deadUI477(msg);if(ADS){ADS.on=false;ADS.hold=false;}}}
{const _fx=arenaFx;arenaFx=function(msg){const r=_fx(msg);try{if(M477.on&&msg)fx477(msg);}catch(e){e477(e,'fx');}return r;};}
{const _om=arenaOnMsg;arenaOnMsg=function(msg){if(msg&&msg.t==='sh'){try{if(M477.on&&A7.on)shot477(msg);}catch(e){e477(e,'sh');}return;}
  if(msg&&msg.t==='spawn'&&msg.pickup){try{const p=msg.pickup;emit(_tmp.set(p.x,.4,p.z),_up,14,[PK477.def[p.k]?PK477.def[p.k].col:0xffffff,0xffffff],{speed:2.4,spread:.6,life:.8,size:.05,grav:-1.5,up:1});}catch(e){}}
  if(msg&&msg.t==='taken'){try{const p=A7.picks.find(q=>q.id===msg.id),D=PK477.def[msg.k];if(p&&D){emit(_tmp.set(p.x,.9,p.z),_up,lv477()?22:10,[D.col,0xffffff],{speed:3.5,spread:1,life:.5,size:.05,grav:2});}
    if(msg.by===A7.me&&D){sfx477('pick',1,null,null,D.f);announce477(D.ic+' '+D.n.toUpperCase(),D.d);}}catch(e){}
    if(msg.by===A7.me){const r=_om(msg);try{const t=document.getElementById('toast');if(t)t.style.opacity=0;}catch(e){}return r;}}
  return _om(msg);};}

// ---------- 9) aim mode (ADS): zoom on every gun, tighter spread, vignette, slower move; spread on hip fire ----------
function ads477(dt){const w=WEAPONS[curW];if(!w)return;if(!A7.alive||fx.reload>=0){ADS.on=false;}updateADS(dt,w);
  const base=w.scope||1,sc=w.melee?1:Math.max(base,1.55);if(sc>base){const fov=75/(1+(sc-1)*ADS.k);if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}}
  if(ADS.k>.5&&!A7.ads7){A7.ads7=1;sfx477('ads',.7);}else if(ADS.k<.3)A7.ads7=0;}
const _sp1=new T.Vector3(),_sp2=new T.Vector3();
function spread477(dir,w){if(!M477.on||!w||w.melee)return;let s=0;try{s=aimSpread(w);}catch(e){s=0;}s=Math.min(.09,s*(ADS.k>.5?.5:1));if(s<1e-4)return;
  _sp1.set(0,1,0).cross(dir);if(_sp1.lengthSq()<1e-6)_sp1.set(1,0,0);_sp1.normalize();_sp2.copy(dir).cross(_sp1).normalize();const r=s*Math.sqrt(Math.random()),a=Math.random()*6.2832;
  dir.addScaledVector(_sp1,Math.cos(a)*r).addScaledVector(_sp2,Math.sin(a)*r).normalize();}
{const f=window.arenaShoot;if(typeof f==='function'){const src=f.toString(),A='try{aimShot476(_org,_dir,w);}catch(e476x){}';if(src.indexOf(A)>=0){try{const g=(0,eval)('"use strict";('+src.split(A).join('try{aimShot476(_org,_dir,w);spread477(_dir,w);}catch(e476x){}')+')');if(typeof g==='function'){window.arenaShoot=g;M477.ok.shoot='ok';}}catch(e){e477(e,'patchShoot');}}else M477.ok.shoot='skip';}}

// ---------- 10) pickups: a real 3D model per kind (medikit, ammo can, armour vest, damage booster, speed bolt), light beam + floor ring, label on approach ----------
const PK477={def:{
  med:{n:'Medikit',ic:'➕',d:'+45 vita',col:0xff4a5a,css:'#ff6a78',f:880},
  ammo:{n:'Munizioni',ic:'🔫',d:'+2 caricatori',col:0x9cff5a,css:'#a8ff70',f:660},
  arm:{n:'Armatura',ic:'🛡️',d:'-38% danni per 12 s',col:0xa98bff,css:'#b9a0ff',f:520},
  dmg:{n:'Danno',ic:'💥',d:'+40% danno per 12 s',col:0xff9a2a,css:'#ffb04a',f:740},
  spd:{n:'Velocità',ic:'⚡',d:'+28% velocità per 10 s',col:0x4ad8ff,css:'#6ae0ff',f:990}},geo:{},mat:null,fx:null,lab:null,near:null};
function pkParts477(k){const P=[],H=Math.PI/2;const a=(sh,c,x,y,z,sx,sy,sz,rx,ry,rz)=>P.push([sh,c,0,x,y,z,sx,sy,sz,rx||0,ry||0,rz||0]);
  if(k==='med'){a('b',0xf2f2f0,0,0,0,.56,.38,.22);a('b',0xd8d8d4,0,.2,0,.58,.04,.24);a('b',0xe23a3a,0,0,-.112,.3,.09,.012);a('b',0xe23a3a,0,0,-.112,.09,.3,.012);a('b',0xe23a3a,0,0,.112,.3,.09,.012);a('b',0xe23a3a,0,0,.112,.09,.3,.012);
    a('b',0x2a2c30,0,.255,0,.22,.035,.05);a('b',0x2a2c30,-.1,.225,0,.03,.06,.04);a('b',0x2a2c30,.1,.225,0,.03,.06,.04);a('b',0x9aa0a8,-.2,.16,-.115,.05,.04,.01);a('b',0x9aa0a8,.2,.16,-.115,.05,.04,.01);}
  else if(k==='ammo'){a('b',0x4f5d34,0,0,0,.56,.32,.26);a('b',0x5f6e40,0,.18,0,.58,.05,.28);a('b',0xd8b030,0,.02,-.132,.5,.06,.006);a('b',0x2a2c26,0,.215,0,.24,.03,.05);a('b',0x2a2c26,-.11,.2,0,.03,.04,.04);a('b',0x2a2c26,.11,.2,0,.03,.04,.04);
    a('b',0x3e4a28,-.29,0,0,.02,.28,.2);a('b',0x3e4a28,.29,0,0,.02,.28,.2);
    for(let i=0;i<4;i++){const x=-.15+i*.1;a('c',0xc89a3a,x,.3,.05,.035,.14,.035);a('n',0xb06a2a,x,.395,.05,.033,.06,.033);}}
  else if(k==='arm'){a('b',0x3a3f52,0,0,0,.5,.56,.14);a('b',0x8c78e8,0,.04,-.08,.36,.36,.03);a('b',0x8c78e8,0,.04,.08,.36,.4,.03);a('b',0x2c3040,-.17,.31,0,.1,.08,.16);a('b',0x2c3040,.17,.31,0,.1,.08,.16);
    a('b',0x2c3040,0,-.2,-.085,.42,.12,.03);for(const x of [-.12,0,.12])a('b',0x4a5066,x,-.12,-.1,.09,.12,.04);a('b',0xd8d8ff,0,.1,-.1,.12,.12,.006,0,0,.785);a('b',0x6a58c8,0,.1,-.103,.08,.08,.006,0,0,.785);}
  else if(k==='dmg'){a('c',0x2a2c30,0,-.24,0,.26,.06,.26);a('c',0x2a2c30,0,.24,0,.26,.06,.26);a('c',0xff7a1a,0,0,0,.2,.42,.2);a('c',0xffd060,0,0,0,.12,.44,.12);
    for(const r of [0,1.57,3.14,4.71])a('b',0x3a3c40,Math.cos(r)*.115,0,Math.sin(r)*.115,.03,.44,.03);a('b',0xf0c020,0,-.16,0,.27,.04,.27);a('b',0xf0c020,0,.16,0,.27,.04,.27);a('n',0x3a3c40,0,.32,0,.12,.1,.12);
    for(const r of [.6,2.2,3.8,5.4])a('n',0xff5a1a,Math.cos(r)*.16,.0,Math.sin(r)*.16,.05,.12,.05,0,0,0);}
  else if(k==='spd'){a('b',0x3ad0ff,.05,.17,0,.08,.26,.07,0,0,-.5);a('b',0x3ad0ff,-.01,0,0,.24,.07,.07,0,0,.35);a('b',0x3ad0ff,-.05,-.17,0,.08,.26,.07,0,0,-.5);a('n',0x3ad0ff,-.1,-.34,0,.09,.14,.07,0,0,2.65);
    a('b',0xe8fbff,.05,.17,-.04,.04,.2,.01,0,0,-.5);a('b',0xe8fbff,-.05,-.17,-.04,.04,.2,.01,0,0,-.5);
    for(const sd of [-1,1]){a('b',0xf0f4ff,sd*.2,.1,.02,.2,.05,.03,0,0,sd*.35);a('b',0xdfe8ff,sd*.24,.04,.02,.18,.045,.03,0,0,sd*.25);a('b',0xcfd8f0,sd*.26,-.02,.02,.14,.04,.03,0,0,sd*.15);}}
  return P;}
function pkInit477(){if(PK477.mat||!A7.root)return;PK477.mat=new T.MeshLambertMaterial({vertexColors:true,emissive:0x1a1a1a});for(const k in PK477.def)PK477.geo[k]=build477(pkParts477(k));
  const cv=document.createElement('canvas');cv.width=8;cv.height=64;const g=cv.getContext('2d');const gr=g.createLinearGradient(0,64,0,0);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.25,'rgba(255,255,255,.4)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,8,64);
  const tex=new T.CanvasTexture(cv);
  // ring + beam merged: the ring samples the bright bottom of the gradient
  const beam=new T.CylinderGeometry(.34,.46,lv477()?2.6:1.6,16,1,true).toNonIndexed();beam.translate(0,lv477()?1.3:.8,0);const ring=new T.RingGeometry(.42,.62,32).toNonIndexed();ring.rotateX(-Math.PI/2);ring.translate(0,.03,0);
  const ru=ring.attributes.uv;for(let i=0;i<ru.count;i++)ru.setXY(i,.5,.03);const n1=beam.attributes.position.count,n2=ring.attributes.position.count,pos=new Float32Array((n1+n2)*3),uv=new Float32Array((n1+n2)*2);
  pos.set(beam.attributes.position.array,0);pos.set(ring.attributes.position.array,n1*3);uv.set(beam.attributes.uv.array,0);uv.set(ru.array,n1*2);const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos,3));bg.setAttribute('uv',new T.BufferAttribute(uv,2));bg.computeBoundingSphere();
  PK477.fx=[];for(let i=0;i<A7.pickMeshes.length;i++){const s=A7.pickMeshes[i];const m=new T.Mesh(PK477.geo.ammo,PK477.mat);m.visible=false;m.name='pick477';A7.root.add(m);
    const b=new T.Mesh(bg,new T.MeshBasicMaterial({map:tex,color:0xffffff,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}));b.visible=false;b.renderOrder=2;A7.root.add(b);
    s.m7=m;s.b7=b;try{s.m.visible=false;s.m.scale.setScalar(.0001);}catch(e){}}
  PK477.lab=document.getElementById('pk477');}
try{pkInit477();}catch(e){e477(e,'pkInit');}
{const _ap=arenaApplyPickups;arenaApplyPickups=function(list){if(!M477.on||!PK477.mat)return _ap(list);try{A7.picks=list||[];for(let i=0;i<A7.pickMeshes.length;i++){const s=A7.pickMeshes[i],it=A7.picks[i];s.m.visible=false;
      if(!it){s.id=0;s.m7.visible=false;s.b7.visible=false;continue;}const D=PK477.def[it.k]||PK477.def.ammo;s.id=it.id;s.k=it.k;s.x=it.x;s.z=it.z;if(s.m7.geometry!==PK477.geo[it.k])s.m7.geometry=PK477.geo[it.k]||PK477.geo.ammo;
      s.m7.visible=true;s.m7.position.set(it.x,.95,it.z);s.b7.visible=true;s.b7.position.set(it.x,0,it.z);s.b7.material.color.setHex(D.col);}}catch(e){e477(e,'apply');return _ap(list);}};}
const _pv477=new T.Vector3();
function pickTick477(t){if(!PK477.mat)return;let best=null,bd=7.5;for(let i=0;i<A7.pickMeshes.length;i++){const s=A7.pickMeshes[i];if(!s.m7||!s.m7.visible)continue;
    s.m7.rotation.set(Math.sin(t*1.3+i)*.12,t*1.5+i,0);s.m7.position.y=.95+Math.sin(t*2.1+i)*.1;s.b7.material.opacity=.55+Math.sin(t*3+i)*.18;
    if(A7.on&&A7.phase==='play'){const d=Math.hypot(s.x-player.pos.x,s.z-player.pos.z);if(d<bd){bd=d;best=s;}}}
  const L=PK477.lab;if(!L)return;if(!best||!A7.alive){if(PK477.near){L.style.display='none';PK477.near=null;}return;}
  _pv477.set(best.x,1.45,best.z).project(camera);if(_pv477.z>1||Math.abs(_pv477.x)>1.1||Math.abs(_pv477.y)>1.1){if(PK477.near){L.style.display='none';PK477.near=null;}return;}
  const D=PK477.def[best.k]||PK477.def.ammo;if(PK477.near!==best.id+':'+best.k){PK477.near=best.id+':'+best.k;L.innerHTML='<i>'+D.ic+'</i>'+D.n+'<small>'+D.d+(bd<1.8?' · preso!':'')+'</small>';L.style.setProperty('--c',D.css);L.style.display='block';}
  L.style.transform='translate('+((_pv477.x*.5+.5)*innerWidth).toFixed(0)+'px,'+((-_pv477.y*.5+.5)*innerHeight).toFixed(0)+'px) translate(-50%,-100%)';L.style.opacity=String(Math.max(.35,Math.min(1,(7.5-bd)/3)));}

// ---------- 11) animation driver (replaces 4.3.75 arenaAnimate): fighters, demo, pickups, effects ----------
const _s477={x:0,z:0,y:0};
arenaAnimate=function(now){try{const t=now/1000,dt=Math.min(.05,Math.max(0,(now-(A7.an7||now))/1000));A7.an7=now;
  if(M477.on){pickTick477(t);spawnTick477(dt);flashTick477(dt);mapTick477(t,dt);}else{for(let i=0;i<A7.pickMeshes.length;i++){const s=A7.pickMeshes[i];if(!s.m.visible)continue;s.m.rotation.y=t*1.6+i;s.m.position.y=.85+Math.sin(t*2+i)*.12;}}
  const ids=A7.actors,rt=now-INT475.delay;
  for(const id in ids){const a=ids[id],f=A7.fig[id];if(!f)continue;try{samp475(a,rt,_s477);const vis=!!(a.alive||(now-(a.deadAt||0)<2200));f.g.visible=vis;if(a.name)arenaLabel(f,a.name,a.team|0);f.pitch475=a.pitch||0;if(f.sp)f.sp.visible=!!a.alive;
      if(vis)arenaDrive(f,_s477.x,_s477.z,_s477.y,now,!!a.alive);}catch(e){e477(e,'actor');}}
  if(A7.demo){const show=!!(A7.preview&&A7.phase!=='play');for(let i=0;i<A7.demo.length;i++){const f=A7.demo[i];f.g.visible=show;if(!show)continue;if(f.team!==i)arenaLabel(f,i?'ROSSI':'BLU',i);
    const P=SHOW475.pos[i],yaw=Math.atan2(-(SHOW475.cx-P[0]),-(SHOW475.cz-P[1]))+(i?-.25:.25);f.pitch475=Math.sin(t*.4+i)*.08;if(Math.sin(t*.9+i*2)>.985)f.rec7=1;arenaDrive(f,P[0],P[1],yaw,now,true);}}}catch(e){e477(e,'anim');}};

// ---------- 12) the map: dressed covers (sandbags, crates, stone walls, lockers), fluted columns with braziers, stands with crowd, gate towers, banners, floor markings, fire, dust, sun ----------
const MAP477={deco:null,out:null,fire:null,fireP:[],dust:null,floor:null,sun:null};
function rng477(s){let x=s>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function mapBuild477(){const A=A7;if(!A.root||!A.env476||MAP477.deco)return;const S=AR476.S,lv=lv477(),R=rng477(477),H=Math.PI/2;
  // hide the plain boxes/cylinders the new models replace (same footprint = same collision as the server)
  const near=(a,b)=>Math.abs(a-b)<1e-3;for(const o of A.env476.children){if(!o.isMesh)continue;
    for(const c of ARENA_COVERS)if(o.geometry===G.box&&near(o.position.x,c[0])&&near(o.position.z,c[1])&&near(o.position.y,c[4]/2)&&near(o.scale.y,c[4]))o.visible=false;
    for(const p of ARENA_PILLARS)if(near(o.position.x,p[0])&&near(o.position.z,p[1])&&(o.geometry===G.cyl||(o.geometry===G.box&&near(o.position.y,3.5))))o.visible=false;}
  const P=[],O=[];const a=(L,sh,c,x,y,z,sx,sy,sz,rx,ry,rz)=>{const j=1+(R()-.5)*.1;const cc=new T.Color(c);cc.r*=j;cc.g*=j;cc.b*=j;L.push([sh,cc.getHex(),0,x,y,z,sx,sy,sz,rx||0,ry||0,rz||0]);};
  // covers
  const N=ARENA_COVERS.length;for(let i=0;i<N;i++){const b=AR476.blocks[i];if(!b)continue;const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,w=b.x1-b.x0,d=b.z1-b.z0,h=b.h,alongX=w>=d,L=alongX?w:d,D=alongX?d:w;
    const put=(u,y,v,su,sy,sv,sh,c,rot)=>a(P,sh||'b',c,alongX?cx+u:cx+v,y,alongX?cz+v:cz+u,alongX?su:sv,sy,alongX?sv:su,0,rot||0,0);
    if(h<=1.32&&L>=2.4){// sandbag wall
      const rows=Math.max(3,Math.round(h/.27)),bh=h/rows;for(let r=0;r<rows;r++){const n=Math.max(2,Math.round(L/.62)),bl=L/n,off=(r%2)?bl*.5:0;for(let k=0;k<n+(r%2?-1:0);k++){const u=-L/2+bl*(k+.5)+off;
        const c=[0xb89a68,0xa88a58,0xc4a674,0x9c8052][(k+r)%4];if(alongX)a(P,'p',c,cx+u,bh*(r+.5),cz,bh*1.05,bl*1.02,D*.98,0,0,H);else a(P,'p',c,cx,bh*(r+.5),cz+u,bh*1.05,bl*1.02,D*.98,H,0,0);}}
      put(0,h+.01,0,L*.98,.02,D*.7,'b',0x7a6444);}
    else if(h<=1.32){// stacked crates
      const cw=Math.min(w,d)*.98;const crate=(x,y,z,s,rot)=>{const c=0x9a6a38,f=0x5a3a1c;a(P,'b',c,x,y+s/2,z,s*.96,s*.96,s*.96,0,rot,0);
        for(const sx of [-1,1])for(const sz of [-1,1])a(P,'b',f,x+Math.cos(rot)*sx*s*.47+Math.sin(rot)*sz*s*.47,y+s/2,z-Math.sin(rot)*sx*s*.47+Math.cos(rot)*sz*s*.47,s*.08,s,s*.08,0,rot,0);
        for(const yy of [.04,.96])a(P,'b',f,x,y+s*yy,z,s*1.0,s*.07,s*1.0,0,rot,0);a(P,'b',f,x,y+s/2,z,s*1.0,s*.08,s*.08,0,rot,.78);};
      if(w>1.6||d>1.6){crate(cx-(alongX?w/4:0),0,cz-(alongX?0:d/4),Math.min(cw,h*.62),0);crate(cx+(alongX?w/4:0),0,cz+(alongX?0:d/4),Math.min(cw,h*.62),.05);a(P,'b',0x9a6a38,cx,Math.min(cw,h*.62)+h*.19,cz,cw*.62,h*.36,cw*.62,0,.3,0);}
      else{crate(cx,0,cz,Math.min(cw,h*.7),0);a(P,'b',0x8a5e30,cx,Math.min(cw,h*.7)+(h-Math.min(cw,h*.7))/2,cz,cw*.55,h-Math.min(cw,h*.7),cw*.55,0,.4,0);}}
    else if(h<=1.85&&L>=2.4){// stone wall: brick courses + coping
      const rows=Math.max(4,Math.round((h-.14)/.3)),rh=(h-.14)/rows;for(let r=0;r<rows;r++){let u=-L/2;const off=(r%2)?.3:0;let first=true;while(u<L/2-.05){let bl=first?(.35+off):(.55+R()*.3);first=false;if(u+bl>L/2)bl=L/2-u;
          const c=[0xcdb08a,0xbfa27e,0xd6bc96,0xb59670][Math.floor(R()*4)];put(u+bl/2,rh*(r+.5),0,bl-.025,rh-.025,D,'b',c);u+=bl;}}
      put(0,h-.07,0,L+.08,.14,D+.12,'b',0xe8d4aa);put(0,.06,0,L+.06,.12,D+.08,'b',0x8a6a48);}
    else if(h<=1.85){// metal locker crates
      a(P,'b',0x4a5560,cx,h/2,cz,w*.98,h,d*.98);const ribs=Math.max(3,Math.round(L/.18));for(let k=0;k<ribs;k++){const u=-L/2+L*(k+.5)/ribs;put(u,h/2,D/2+.01,.05,h*.9,.03,'b',0x3a434c);put(u,h/2,-D/2-.01,.05,h*.9,.03,'b',0x3a434c);}
      a(P,'b',0x2a3138,cx,h+.02,cz,w,.05,d);a(P,'b',0xd8a020,cx,h*.82,cz,w*1.01,.08,d*1.01);put(L*.3,h*.5,D/2+.04,.04,.25,.04,'b',0x222222);}
    else{// tall reinforced wall with timber frame + team banner
      put(0,h/2,0,L,h,D,'b',0xc4a47c);for(const u of [-L/2+.12,0,L/2-.12])put(u,h/2,0,.2,h+.02,D+.06,'b',0x5a3a1e);put(0,h-.1,0,L+.04,.18,D+.08,'b',0x5a3a1e);put(0,.9,0,L+.03,.12,D+.06,'b',0x5a3a1e);
      const tc=cx<0?0x2f6fd0:0xd23a3a;put(0,h*.58,D/2+.03,L*.5,h*.6,.02,'b',tc);put(0,h*.58,-D/2-.03,L*.5,h*.6,.02,'b',tc);put(0,h*.6,D/2+.045,L*.2,L*.2,.01,'b',0xf0d080,0);}}
  // columns with braziers
  const NP=ARENA_PILLARS.length;MAP477.fireP.length=0;for(let i=0;i<NP;i++){const b=AR476.blocks[N+i];if(!b)continue;const x=(b.x0+b.x1)/2,z=(b.z0+b.z1)/2;
    a(P,'b',0xb89c74,x,.12,z,1.5,.24,1.5);a(P,'b',0xcdb08a,x,.32,z,1.3,.18,1.3);a(P,'c',0xd8c09a,x,1.95,z,1.08,3.1,1.08);
    for(let k=0;k<10;k++){const t=k/10*Math.PI*2;a(P,'b',0xc2a67e,x+Math.cos(t)*.53,1.95,z+Math.sin(t)*.53,.07,3.0,.07,0,-t,0);}
    a(P,'k',0xcdb08a,x,3.62,z,1.3,.3,1.3,Math.PI,0,0);a(P,'b',0xe8d4aa,x,3.86,z,1.5,.2,1.5);a(P,'k',0x3a3430,x,4.12,z,1.1,.34,1.1,Math.PI,0,0);a(P,'c',0x2a2420,x,4.3,z,1.12,.05,1.12);a(P,'c',0xc04a10,x,4.28,z,.9,.06,.9);
    MAP477.fireP.push([x,4.35,z,1]);}
  // outer: stands with crowd, banners, gate towers
  const RW=32.6*S+2.1;const st=[];const segs=lv?56:40;for(let s=0;s<segs;s++){const t=(s+.5)/segs*Math.PI*2,ad=Math.abs(Math.atan2(Math.sin(t),Math.cos(t)));if(ad<.3||Math.abs(ad-Math.PI)<.3)continue;st.push(t);}
  const seg=Math.PI*2/segs;for(const t of st){for(let k=0;k<4;k++){const r=RW+3.2+k*1.9,y=1.1*(k+1),len=2*r*Math.sin(seg/2)+.06,cx=Math.cos(t)*r,cz=Math.sin(t)*r;
      a(O,'b',k%2?0xb89c74:0xa88c64,cx,y/2,cz,len,y,1.95,0,H-t,0);
      const ppl=lv===0?1:2;for(let q=0;q<ppl;q++){if(R()<.18)continue;const u=(R()-.5)*len*.8,px=cx+Math.sin(t)*-u,pz=cz+Math.cos(t)*u,team=Math.cos(t)<0?0x3a6ac8:0xc84040,col=R()<.6?team:[0x6a6a6a,0xa08060,0x50604a,0x8a5a3a][Math.floor(R()*4)];
        a(O,'b',col,px,y+.38,pz,.36,.62,.26,0,H-t,0);a(O,'b',[0xd6a47c,0xb07a54,0x8a5a3a][Math.floor(R()*3)],px,y+.82,pz,.2,.22,.2,0,H-t,0);}}
    const r=RW+3.2+4*1.9,cx=Math.cos(t)*r,cz=Math.sin(t)*r;a(O,'b',0x9a7e58,cx,2.6,cz,2*r*Math.sin(seg/2)+.06,5.2,.6,0,H-t,0);}
  for(let i=0;i<10;i++){const t=(i+.5)/10*Math.PI*2,ad=Math.abs(Math.atan2(Math.sin(t),Math.cos(t)));if(ad<.35||Math.abs(ad-Math.PI)<.35)continue;const r=34.15*S-.95,x=Math.cos(t)*r,z=Math.sin(t)*r,tc=Math.cos(t)<0?0x2f6fd0:0xd23a3a;
    a(O,'b',tc,x,2.75,z,1.3,2.6,.06,0,H-t,0);a(O,'b',0xf0d080,x-Math.cos(t)*.04,3.1,z-Math.sin(t)*.04,.5,.5,.02,0,H-t,.785);a(O,'n',tc,x,1.32,z,.65,.3,.06,Math.PI,H-t,0);a(O,'b',0x5a3a1e,x,4.1,z,1.5,.1,.14,0,H-t,0);}
  for(const sx of [-1,1])for(const sz of [-1,1]){const t=(sx<0?Math.PI:0)+sz*.27,r=34.15*S+.6,x=Math.cos(t)*r,z=Math.sin(t)*r,tc=sx<0?0x2f6fd0:0xd23a3a;
    a(O,'c',0xc8ac84,x,4.5,z,4.2,9,4.2);a(O,'c',0xb39470,x,.4,z,4.6,.8,4.6);for(let k=0;k<8;k++){const u=k/8*Math.PI*2;a(O,'b',0xd8c09a,x+Math.cos(u)*1.9,9.35,z+Math.sin(u)*1.9,.8,.7,.8,0,-u,0);}
    a(O,'c',0x5a3a1e,x,10.2,z,.12,2.6,.12);a(O,'b',tc,x+Math.sin(t)*.7,10.9,z-Math.cos(t)*.7,1.3,.8,.04,0,-t+H,0);MAP477.fireP.push([x,9.4,z,1.4]);
    for(const yy of [3,6])a(O,'b',0x1a1410,x-Math.cos(t)*2.08,yy,z-Math.sin(t)*2.08,.5,.9,.1,0,H-t,0);}
  for(const sx of [-1,1]){const x=sx*(34.15*S+.6);a(O,'b',0xd2b48a,x,8.3,0,2.8,1.4,12.5);a(O,'b',sx<0?0x2f6fd0:0xd23a3a,x-sx*1.45,6.6,0,.06,2.6,3.2);a(O,'b',0xf0d080,x-sx*1.48,6.9,0,.02,.9,.9,.785,0,0);}
  const geo=build477(P),mat=new T.MeshLambertMaterial({vertexColors:true});const m=new T.Mesh(geo,mat);m.name='arenaCovers477';m.castShadow=lv>0;m.receiveShadow=true;A.root.add(m);MAP477.deco=m;
  const g2=build477(O),m2=new T.Mesh(g2,mat);m2.name='arenaOuter477';m2.castShadow=false;m2.receiveShadow=false;A.root.add(m2);MAP477.out=m2;
  // wall sconces (the old ember boxes) get flames too
  for(let i=0;i<28;i++){if(i%3)continue;const t=(i+.5)/28*Math.PI*2,ad=Math.abs(Math.atan2(Math.sin(t),Math.cos(t)));if(ad<.22||Math.abs(ad-Math.PI)<.22)continue;MAP477.fireP.push([Math.cos(t)*34.15*.96*S,3.35,Math.sin(t)*34.15*.96*S,.7]);}
  floor477();fire477();dust477();sun477();}
function floor477(){const S=AR476.S,sz=lv477()?1024:512,cv=document.createElement('canvas');cv.width=cv.height=sz;const g=cv.getContext('2d'),W=46*S,k=sz/(2*W),X=x=>sz/2+x*k,R=rng477(4777);
  g.clearRect(0,0,sz,sz);g.lineCap='round';
  // scuffs and cracks
  for(let i=0;i<(sz>600?160:80);i++){const x=X((R()-.5)*2*W*.82),y=X((R()-.5)*2*W*.82);g.strokeStyle='rgba(60,30,10,'+(.08+R()*.12)+')';g.lineWidth=k*(.05+R()*.08);g.beginPath();g.moveTo(x,y);let px=x,py=y;for(let j=0;j<4;j++){px+=(R()-.5)*k*2.2;py+=(R()-.5)*k*2.2;g.lineTo(px,py);}g.stroke();}
  // centre emblem: ring, crossed swords, laurel dots
  const c=sz/2;g.strokeStyle='rgba(255,226,150,.55)';g.lineWidth=k*.22;g.beginPath();g.arc(c,c,k*6.2,0,7);g.stroke();g.lineWidth=k*.1;g.beginPath();g.arc(c,c,k*5.5,0,7);g.stroke();
  g.fillStyle='rgba(255,226,150,.35)';for(let i=0;i<36;i++){const t=i/36*Math.PI*2;g.beginPath();g.arc(c+Math.cos(t)*k*5.85,c+Math.sin(t)*k*5.85,k*.12,0,7);g.fill();}
  const sword=(rot)=>{g.save();g.translate(c,c);g.rotate(rot);g.fillStyle='rgba(255,236,190,.6)';g.fillRect(-k*.18,-k*4,k*.36,k*6);g.beginPath();g.moveTo(-k*.18,-k*4);g.lineTo(0,-k*4.7);g.lineTo(k*.18,-k*4);g.fill();g.fillStyle='rgba(200,150,60,.7)';g.fillRect(-k*1.1,k*2,k*2.2,k*.3);g.fillRect(-k*.15,k*2.3,k*.3,k*1.2);g.restore();};sword(.6);sword(-.6);
  // team spawn zones
  for(const sd of [-1,1]){const x=X(sd*31),y=c,col=sd<0?'90,150,255':'255,90,80';const gr=g.createRadialGradient(x,y,0,x,y,k*6.5);gr.addColorStop(0,'rgba('+col+',.32)');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,k*6.5,0,7);g.fill();
    g.strokeStyle='rgba('+col+',.7)';g.lineWidth=k*.18;g.setLineDash([k*.8,k*.5]);g.beginPath();g.arc(x,y,k*5,0,7);g.stroke();g.setLineDash([]);
    g.save();g.translate(x,y);g.rotate(sd<0?Math.PI/2:-Math.PI/2);g.fillStyle='rgba('+col+',.55)';g.font='900 '+Math.round(k*1.8)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(sd<0?'BLU':'ROSSI',0,k*3.4);g.restore();}
  // lane lines towards the centre
  g.strokeStyle='rgba(255,240,210,.18)';g.lineWidth=k*.12;g.setLineDash([k*1.2,k*.9]);g.beginPath();g.moveTo(X(-25),c);g.lineTo(X(-7),c);g.moveTo(X(7),c);g.lineTo(X(25),c);g.stroke();g.setLineDash([]);
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;const m=new T.Mesh(new T.PlaneGeometry(2*W,2*W).rotateX(-Math.PI/2),new T.MeshLambertMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  m.position.y=.03;m.renderOrder=1;m.receiveShadow=true;m.name='arenaFloor477';A7.root.add(m);MAP477.floor=m;}
function fire477(){const per=lv477()===0?5:lv477()===1?9:13,n=MAP477.fireP.length*per;if(!n)return;const pos=new Float32Array(n*3),col=new Float32Array(n*3),D=[];
  for(let i=0;i<n;i++){const src=MAP477.fireP[Math.floor(i/per)];D.push({s:src,t:Math.random(),v:.9+Math.random()*.8,ox:(Math.random()-.5)*.5*src[3],oz:(Math.random()-.5)*.5*src[3]});}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));
  const p=new T.Points(g,new T.PointsMaterial({map:glowTex,size:.75,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true,fog:false}));p.frustumCulled=false;p.name='arenaFire477';A7.root.add(p);MAP477.fire=p;MAP477.fireD=D;}
function dust477(){const n=lv477()===0?90:lv477()===1?200:320,pos=new Float32Array(n*3),R=rng477(9);for(let i=0;i<n;i++){const r=Math.sqrt(R())*40,t=R()*6.283;pos[i*3]=Math.cos(t)*r;pos[i*3+1]=.3+R()*6;pos[i*3+2]=Math.sin(t)*r;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));const p=new T.Points(g,new T.PointsMaterial({map:glowTex,size:.12,color:0xffd8a0,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true}));
  p.frustumCulled=false;p.name='arenaDust477';A7.root.add(p);MAP477.dust=p;}
function sun477(){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffc070,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.9,fog:false}));s.scale.set(26,26,1);
  const s2=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xfff2d0,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:1,fog:false}));s2.scale.set(7,7,1);s.add(s2);s2.scale.set(.28,.28,1);
  s.position.set(-62,16,-58);s.name='arenaSun477';A7.root.add(s);MAP477.sun=s;}
function mapTick477(t,dt){const F=MAP477.fire;if(F&&F.visible!==false&&A7.root&&A7.root.visible){const pa=F.geometry.attributes.position,ca=F.geometry.attributes.color,D=MAP477.fireD;
    for(let i=0;i<D.length;i++){const q=D[i];q.t+=dt*q.v*1.6;if(q.t>1){q.t-=1;q.ox=(Math.random()-.5)*.45*q.s[3];q.oz=(Math.random()-.5)*.45*q.s[3];}const u=q.t,sc=q.s[3];
      pa.setXYZ(i,q.s[0]+q.ox*(1-u)+Math.sin(t*3+i)*.05*u,q.s[1]+u*1.1*sc,q.s[2]+q.oz*(1-u));const b=(1-u)*(.75+.25*Math.sin(t*20+i));ca.setXYZ(i,b,b*(.55-.35*u),b*.12*(1-u));}
    pa.needsUpdate=true;ca.needsUpdate=true;}
  const Dd=MAP477.dust;if(Dd){Dd.rotation.y=t*.012;Dd.position.y=Math.sin(t*.2)*.15;}}
{const _o=arenaOpen;arenaOpen=function(){try{mapBuild477();}catch(e){e477(e,"map");}return _o.apply(this,arguments);};}

// ---------- 13) match intro (rosters + 3-2-1 synced to spawn protection), outro, scoreboard, tick, cleanup ----------
const IO477={t0:0,on:0,cd:-1,out:0};
function intro477(msg){const el=document.getElementById('in477');if(!el)return;const ro=(msg.players||[]).slice();if(!ro.some(q=>q.id===A7.me))ro.push({id:A7.me,name:arenaPname(),team:A7.team|0});
  const col=t=>t?'#ff6a5a':'#6aa8ff',side=t=>{let h='';for(const q of ro)if((q.team|0)===t)h+='<span'+(q.id===A7.me?' class="me"':'')+'>'+aEsc(q.name||'Giocatore')+'</span>';return '<div class="tm" style="--c:'+col(t)+'"><b>'+(t?'ROSSI':'BLU')+'</b>'+h+'</div>';};
  el.innerHTML='<div class="t">'+(A7.mode===1?'DUELLO':'ARENA 3 CONTRO 3')+'</div><div class="vs">'+side(0)+'<div class="x">VS</div>'+side(1)+'</div><div class="cd">3</div>';
  el.style.opacity=1;el.classList.add('on');IO477.t0=performance.now();IO477.on=1;IO477.cd=3;sfx477('beep',.8);}
function introTick477(){if(!IO477.on)return;const el=document.getElementById('in477');if(!el){IO477.on=0;return;}const e=(performance.now()-IO477.t0)/1000,cd=el.querySelector('.cd');
  const n=e<.5?3:e<1?2:e<1.5?1:0;if(n!==IO477.cd){IO477.cd=n;if(cd){cd.textContent=n?String(n):'COMBATTI!';cd.classList.toggle('go',!n);}sfx477(n?'beep':'horn',n?.8:1);if(!n){try{spawnFx477(player.pos.x,player.pos.z,A7.team|0,true);}catch(_){}}}
  if(e>1.5){const vs=el.querySelector('.vs');if(vs)vs.style.opacity=Math.max(0,1-(e-1.5)*3);el.style.opacity=Math.max(0,1-(e-1.9)*2.5);}
  if(e>2.35){el.classList.remove('on');IO477.on=0;}}
function board477(msg){const box=document.getElementById('arenaResult');if(!box)return;let b=document.getElementById('a7Board');if(!b){b=document.createElement('div');b.id='a7Board';b.className='a7Board';const rw=box.querySelector('.a5Rew')||box.querySelector('button');if(rw&&rw.parentNode===box)box.insertBefore(b,rw);else box.appendChild(b);}
  const L=(msg&&msg.board)||[];if(!L.length){b.style.display='none';return;}b.style.display='';let h='<div class="r h"><i></i><b>Giocatore</b><span>U</span><span>M</span><span>Danni</span></div>';
  L.forEach((q,i)=>{h+='<div class="r'+(q.id===A7.me?' me':'')+'"><i style="background:'+(q.team?'#ff6a5a':'#6aa8ff')+'"></i><b>'+(i===0&&q.k>0?'👑 ':'')+aEsc(q.name||'Giocatore')+'</b><span>'+(q.k|0)+'</span><span>'+(q.d|0)+'</span><span>'+Math.round(q.dmg||0)+'</span></div>';});b.innerHTML=h;}
function outro477(msg,done){const el=document.getElementById('ou477');const w=msg.winner|0,res=(w===0||w===1)?(w===(A7.team|0)?1:-1):0;
  if(el){el.innerHTML='<b style="color:'+(res>0?'#ffd25a':res<0?'#ff6a5a':'#e8e8e8')+'">'+(res>0?'VITTORIA':res<0?'SCONFITTA':'PAREGGIO')+'</b><small>'+(msg.scores?msg.scores[0]+' — '+msg.scores[1]:'')+'</small>';el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
  sfx477(res>0?'win':res<0?'lose':'horn',1);if(res>0){for(let i=0;i<5;i++){const a=i/5*6.283;try{spawnFx477(player.pos.x+Math.cos(a)*2.5,player.pos.z+Math.sin(a)*2.5,A7.team|0,true);}catch(_){}}}
  IO477.out=1;setTimeout(()=>{IO477.out=0;if(el)el.classList.remove('on');done();},1800);}
{const _b=arenaBegin;arenaBegin=function(msg){const r=_b(msg);try{if(M477.on){KS477.streak=0;KS477.multi=0;KS477.lastKill=0;IO477.out=0;deadUI477(null);intro477(msg||{});}}catch(e){e477(e,'begin');}return r;};}
{const _e=arenaEnd;arenaEnd=function(msg){if(!M477.on||IO477.out||A7.phase!=='play'){const r=_e(msg);try{board477(msg);}catch(e){}return r;}
  try{firing=false;ADS.on=false;IO477.on=0;const ie=document.getElementById('in477');if(ie)ie.classList.remove('on');deadUI477(null);
    outro477(msg||{},()=>{if(A7.phase!=='play'||!A7.on)return;_e(msg);try{board477(msg);}catch(e){e477(e,'board');}});}catch(e){e477(e,'end');return _e(msg);}};}
{const _s=arenaShutdown;arenaShutdown=function(){IO477.on=0;IO477.out=0;try{ADS.on=false;ADS.hold=false;ADS.k=0;document.body.classList.remove('ads');camera.fov=75;camera.updateProjectionMatrix();
    for(const id of ['in477','ou477','pk477','an477','vig477'])(document.getElementById(id)||{classList:{remove(){}}}).classList.remove('on');const pk=document.getElementById('pk477');if(pk)pk.style.display='none';deadUI477(null);}catch(e){e477(e,'shut');}return _s.apply(this,arguments);};}
{const _t=A7.tick;A7.tick=function(dt){const r=_t.apply(this,arguments);if(M477.on&&A7.on&&A7.phase==='play'){try{ads477(dt);introTick477();if(IO477.out)firing=false;}catch(e){e477(e,'tick');}}return r;};}
{const _w=warmArena475;warmArena475=function(){const back=[];const v=o=>{if(o){back.push([o,o.visible]);o.visible=true;}};try{mapBuild477();spawnPool477();flashPool477();for(const s of (A7.pickMeshes||[])){v(s.m7);v(s.b7);}for(const s of (SPN477.pool||[])){v(s.m);v(s.ring);}for(const s of (SH477.fl||[]))v(s.s||s.m||s);}catch(e){e477(e,'warm');}
  try{return _w.apply(this,arguments);}finally{for(const b of back)b[0].visible=b[1];}};}
window.__zs477={M477,MAP477,IO477,KS477};
A7.open=arenaOpen;A7.shutdown=arenaShutdown;
