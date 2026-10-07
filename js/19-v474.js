/* Zombie Survival — game code part 19-v474 (4.3.74). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.74: boss unstick, house AI, scroll fixes, new vase, new defenses, build icons =======================
const M474={on:true,err:0,un:0,away:0};function e474(e,w){M474.err++;try{console.warn('474',w,e&&e.message);}catch(_){}try{window.__DBG&&__DBG.prob('err','v474',w+': '+(e&&e.message||e));}catch(_){}if(M474.err>12)M474.on=false;}
const _v474=new T.Vector3(),_t474=new T.Vector3(),_d474=new T.Vector3(),_up474=new T.Vector3(0,1,0);

// ---------- 1) chase unstick: zombies (boss included) that make no progress towards the player take a free detour ----------
function clear474(x0,z0,x1,z1,r){const n=Math.max(2,Math.ceil(Math.hypot(x1-x0,z1-z0)/.7));for(let i=1;i<=n;i++){const u=i/n;if(!freeSpot(x0+(x1-x0)*u,z0+(z1-z0)*u,r))return false;}return true;}
function detour474(z,tg){const P=z.g.position,sc=z.V.scale||1,r=Math.min(1,.35*sc+.08),U=z.u474,b=Math.atan2(tg.x-P.x,tg.z-P.z);
  const side=z.side474||(z.side474=Math.random()<.5?-1:1);let best=null,bs=1e9;
  for(const s of [side,-side])for(const a of [.8,1.3,1.9,2.5])for(const L of [3+U.lvl,5+U.lvl*1.5]){const ang=b+s*a,x=P.x+Math.sin(ang)*L,zz=P.z+Math.cos(ang)*L;
    if(!freeSpot(x,zz,r)||!clear474(P.x,P.z,x,zz,r*.85))continue;const sc2=Math.hypot(tg.x-x,tg.z-zz)+(s===side?0:1.5)+a*.6;if(sc2<bs){bs=sc2;best={x,z:zz};}}
  return best;}
function nudge474(z){const P=z.g.position,sc=z.V.scale||1,r=Math.min(1,.35*sc+.08);for(let R=.6;R<=3.2;R+=.4)for(let k=0;k<12;k++){const a=k/12*Math.PI*2,x=P.x+Math.sin(a)*R,zz=P.z+Math.cos(a)*R;if(freeSpot(x,zz,r)){P.x=x;P.z=zz;return true;}}return false;}
{const _sv=svTarget433;svTarget433=function(z){const tg=_sv(z);try{if(!M474.on||!z.alive||z.dead||z.flee||z.ai!=='chase'||z.tgtKind==='piece')return tg;
  const P=z.g.position,t=game.time,sc=z.V.scale||1,dT=Math.hypot(player.pos.x-P.x,player.pos.z-P.z);
  if(z.via474){const v=z.via474;if(t>v.until||Math.hypot(P.x-v.x,P.z-v.z)<.9*sc+.75){z.via474=null;}else{z.tgtKind='point';z.tgtPiece=null;z.via433=null;return _v474.set(v.x,0,v.z);}}
  const U=z.u474||(z.u474={x:P.x,z:P.z,t:t,d:dT,lvl:0});
  if(t-U.t>=1.5){const mv=Math.hypot(P.x-U.x,P.z-U.z),prog=U.d-dT;
    if(dT>2.2+sc&&prog<.45&&mv<.9*sc){U.lvl=Math.min(4,U.lvl+1);const d=detour474(z,player.pos);
      if(d){z.via474={x:d.x,z:d.z,until:t+2.2+Math.hypot(d.x-P.x,d.z-P.z)/Math.max(.6,z.speed||1)};M474.un++;try{rec433Log(z,'474','deviazione libera');}catch(e){}}
      else{z.side474=-(z.side474||1);if(U.lvl>=3&&nudge474(z)){M474.un++;try{rec433Log(z,'474','spostato fuori dall\'ostacolo');}catch(e){}}}}
    else if(prog>1.2)U.lvl=0;
    U.x=P.x;U.z=P.z;U.t=t;U.d=dT;}}catch(e){e474(e,'unstick');}return tg;};}

// ---------- 2) house AI: only zombies that were near AND saw the player go in know he is inside ----------
const AI474={SEE_R:18,NEAR_R:4.5,FORGET_R:32};
const WALLISH474=new Set(['wall','rwall','slit','sand','palisade','bunker','swall','spikebar']);
ai432Closed=function(p){if(!p||!p.alive)return false;const t=p.type,D=PDEF[t];if(WALLISH474.has(t))return true;if(t==='door'||t==='window'||(D&&(D.door||D.win||D.shut)))return !p.open;return false;};
ai437Enter=function(){for(const z of zombies){if(!z.alive||z.dead)continue;const P=z.g.position;if(ai432Inside(P.x,P.z))continue;
    const d=Math.hypot(P.x-player.pos.x,P.z-player.pos.z),saw=game.time-(z.seen432||-99)<AI432.SEEN;
    if((saw&&d<=AI474.SEE_R)||d<=AI474.NEAR_R){if(!ai432Aware(z))AI432.k437.sawEnter++;z.aw432=game.time+AI432.AWARE;}
    else{z.aw432=0;z.sn432=0;if(z.ai==='chase'||z.ai==='search'||z.tgtKind==='piece'){ai437Away(z);M474.away++;}}}};
// every 0.5 s while the shelter is closed: unaware zombies never head for it; aware ones that wandered far forget
{const _w=ai437Watch;ai437Watch=function(enc){_w(enc);try{if(!M474.on||!enc||!SV.on)return;for(const z of zombies){if(!z.alive||z.dead||z.flee)continue;const P=z.g.position;if(ai432Inside(P.x,P.z))continue;
      const aw=ai432Aware(z);if(aw&&Math.hypot(P.x-player.pos.x,P.z-player.pos.z)>AI474.FORGET_R&&game.time-(z.seen432||-99)>8){z.aw432=0;}
      if(!ai432Aware(z)&&(z.tgtKind==='piece'||z.ai==='chase'||(z.ai==='search'&&ai432Inside(z.lx,z.lz)))){ai437Away(z);M474.away++;}}}catch(e){e474(e,'watch');}};}

// ---------- 3) scroll: lists keep their position on re-render, no re-render under the finger, tight quests panel stays tight ----------
const SC474={el:null,t:0};
addEventListener('touchstart',e=>{try{const l=e.target&&e.target.closest&&e.target.closest('#bList,#bCat43,#qList,#loot452grid');if(l){SC474.el=l;SC474.t=performance.now()+1e6;}}catch(x){}},{capture:true,passive:true});
const sc474End=()=>{if(SC474.el)SC474.t=performance.now()+450;};addEventListener('touchend',sc474End,{capture:true,passive:true});addEventListener('touchcancel',sc474End,{capture:true,passive:true});
function busy474(id){const n=performance.now();return !!(SC474.el&&SC474.el.id===id&&n<SC474.t&&n-(SC474.ls||0)<600);}
// q421Place (every 250 ms) rewrites #qList's cssText and toggles qTight: the intermediate layout clamped scrollTop to 0. Remember the user's position and put it back at the end (q422Panel runs last).
addEventListener('scroll',e=>{const t=e.target;if(t&&t.id&&(t.id==='qList'||t.id==='loot452grid'||t.id==='bList')&&!t.__r474){if(t===SC474.el)SC474.ls=performance.now();t.__st474=t.id==='bList'?t.scrollLeft:t.scrollTop;}},{capture:true,passive:true});
{const _q=q422Panel;q422Panel=function(){const r=_q.apply(this,arguments);try{const L=document.getElementById('qList'),q=document.getElementById('quest42');
    if(L&&q&&q.classList.contains('open')&&L.__st474>0&&Math.abs(L.scrollTop-L.__st474)>1){L.__r474=1;L.scrollTop=L.__st474;L.__r474=0;}}catch(e){}return r;};}
{const _qh=qHUD;qHUD=function(){const L=document.getElementById('qList'),st=L?(L.__st474||L.scrollTop):0;const r=_qh.apply(this,arguments);try{const qo=document.getElementById('quest42');if(L&&qo&&!qo.classList.contains('open')){L.__st474=0;return r;}if(L&&st&&Math.abs(L.scrollTop-st)>1)L.scrollTop=st;}catch(e){}return r;};}
{const _lr=loot452Render;loot452Render=function(){const g=document.getElementById('loot452grid'),same=LOOT452.cur&&LOOT452.cur===loot452Render.__c,st=g?g.scrollTop:0;loot452Render.__c=LOOT452.cur;
  const r=_lr.apply(this,arguments);try{const g2=document.getElementById('loot452grid');if(g2&&same&&st){g2.scrollTop=st;requestAnimationFrame(()=>{if(Math.abs(g2.scrollTop-st)>1)g2.scrollTop=st;});}}catch(e){}return r;};}

// ---------- 4/5) build items: new pools (real shapes), new vase, new defenses, icons ----------
function pool474(k,geo,mat,n){if(POOL[k])return;const m=new T.InstancedMesh(geo,mat,n);m.count=0;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;
  m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);m.visible=false;scene.add(m);solids.push(m);POOL[k]={m,free:[],n:0,max:n,owner:[],v474:1};}
{const _pa=pAlloc;pAlloc=function(k){const i=_pa(k);try{const P=POOL[k];if(i>=0&&P&&P.v474&&!P.m.visible)P.m.visible=true;}catch(e){}return i;};}
try{const L=(pts,seg)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);
  const vaseG=L([[.25,-.5],[.3,-.47],[.37,-.36],[.46,-.19],[.5,-.03],[.47,.13],[.39,.26],[.31,.35],[.32,.42],[.42,.47],[.41,.5]],18);
  const bellG=L([[.001,.5],[.12,.49],[.19,.42],[.22,.25],[.27,.05],[.36,-.2],[.47,-.42],[.5,-.5],[.001,-.47]],16);
  const cyl=new T.CylinderGeometry(.5,.5,1,12),cone=new T.ConeGeometry(.5,1,7),ico=new T.IcosahedronGeometry(.5,1),ball=new T.SphereGeometry(.5,8,6);
  const LM=c=>new T.MeshLambertMaterial({color:c});
  pool474('vaseL',vaseG,LM(0xb4532a),40);pool474('terraD',cyl,LM(0x6e2c14),40);pool474('leafI',ico,(POOL.leaf&&POOL.leaf.m.material)||LM(0x3d6b34),160);pool474('leafI2',ico,LM(0x5a8f3c),120);
  pool474('petal',ball,LM(0xe0457a),120);pool474('petalY',ball,LM(0xf2c230),60);pool474('metalC',cyl,MAT.metal,220);pool474('darkC',cyl,PMATS.dark,160);pool474('woodC',cyl,MAT.wood,200);
  pool474('spikeK',cone,MAT.metal,420);pool474('spikeW',cone,LM(0xa8784a),200);pool474('brassB',bellG,LM(0xc9a23a),12);
  pool474('water',new T.BoxGeometry(1,1,1),new T.MeshLambertMaterial({color:0x24506a,emissive:0x0a2232}),60);}catch(e){e474(e,'pools');}
const H474=Math.PI/2;
// the vase: terracotta lathe pot, dark band, soil, round foliage and a few flowers
if(POOL.vaseL&&POOL.leafI&&POOL.petal){PDEF.pot.parts=[['vaseL',0,.3,0,.5,.6,.5],['terraD',0,.39,0,.5,.035,.5],['darkC',0,.58,0,.34,.03,.34],
  ['leafI',0,.74,0,.36,.3,.36],['leafI2',.13,.84,.06,.24,.24,.24],['leafI2',-.13,.8,-.07,.22,.2,.22],['leafI',.03,.93,-.1,.2,.2,.2],['leafI2',-.08,.9,.12,.16,.16,.16],
  ['petal',.12,.98,.1,.1,.09,.1],['petalY',.12,1.02,.1,.04,.04,.04],['petal',-.15,.94,.04,.09,.08,.09],['petalY',-.15,.98,.04,.035,.035,.035],['petal',.0,1.05,-.11,.1,.09,.1],['petalY',0,1.09,-.11,.04,.04,.04],['petal',.17,.86,-.1,.08,.07,.08]];
PDEF.pot.hp=70;}
if(POOL.spikeK&&POOL.metalC&&POOL.water&&POOL.brassB){const P474={};
 P474.mdoor={n:'Porta blindata',i:'🚪',cost:{metal:6,iron:3},hp:1100,edge:1,box:[2,.34],door:1,lv:5,parts:[
   ['metal',-.93,1.315,0,.18,2.63,.38],['metal',.93,1.315,0,.18,2.63,.38],['metal',0,2.52,0,2.04,.26,.38],['stone',0,.04,0,2,.08,.38],
   ['dark',-.93,.5,.2,.06,.06,.02],['dark',-.93,1.3,.2,.06,.06,.02],['dark',-.93,2.1,.2,.06,.06,.02],['dark',.93,.5,.2,.06,.06,.02],['dark',.93,1.3,.2,.06,.06,.02],['dark',.93,2.1,.2,.06,.06,.02],['haz',0,2.52,.2,1.6,.08,.02]],
  panel:[['metal',.83,1.19,0,1.66,2.32,.14],['dark',.83,.72,.08,1.42,.74,.02],['dark',.83,1.66,.08,1.42,.74,.02],['metal',.83,1.19,.1,1.9,.09,.03,0,0,.95],['metal',.83,1.19,.1,1.9,.09,.03,0,0,-.95],
   ['metal',.83,1.19,-.08,1.5,.1,.03],['metal',.83,.5,-.08,1.5,.1,.03],['metal',.83,1.88,-.08,1.5,.1,.03],['haz',.83,.18,.08,1.5,.1,.025],
   ['dark',.16,.4,.09,.06,.06,.03],['dark',1.5,.4,.09,.06,.06,.03],['dark',.16,1.98,.09,.06,.06,.03],['dark',1.5,1.98,.09,.06,.06,.03],['metalC',1.46,1.16,.13,.1,.1,.1,H474,0,0],['metal',1.46,1.16,.18,.22,.05,.05]]};
 P474.spikebar={n:'Barricata chiodata',i:'🪵',cost:{wood:6,metal:2,iron:1},hp:480,edge:1,box:[2,.6],spike:1,lv:3,parts:[
   ['woodC',-.55,.62,0,.16,1.55,.16,0,0,.72],['woodC',-.55,.62,0,.16,1.55,.16,0,0,-.72],['woodC',.55,.62,0,.16,1.55,.16,0,0,.72],['woodC',.55,.62,0,.16,1.55,.16,0,0,-.72],
   ['woodC',0,1.02,0,.15,2.05,.15,0,0,H474],['woodC',0,.22,0,.15,2.05,.15,0,0,H474],['plank',0,.52,.09,1.9,.2,.07],['plank',0,.8,-.09,1.9,.18,.07],['wire',0,.66,.13,1.9,.02,.02],['wire',0,.38,.13,1.9,.02,.02]]};
 for(const x of [-.8,-.4,0,.4,.8])P474.spikebar.parts.push(['spikeK',x,.42,.3,.07,.34,.07,H474,0,0],['spikeK',x+.2*(x<.8?1:-1),.8,.3,.07,.34,.07,H474,0,0]);
 for(const x of [-.6,0,.6])P474.spikebar.parts.push(['spikeK',x,.6,-.28,.06,.28,.06,-H474,0,0]);
 P474.pit={n:'Fossa con punte',i:'🕳️',cost:{wood:6,stone:2,iron:1},hp:300,cell:'o',lv:4,max:10,parts:[['dark',0,.012,0,1.66,.02,1.66],
   ['sand',0,.06,-.86,1.92,.12,.2],['sand',0,.06,.86,1.92,.12,.2],['sand',-.86,.06,0,.2,.12,1.5],['sand',.86,.06,0,.2,.12,1.5],['plank',.55,.1,.58,.7,.05,.22,0,.45,.12]]};
 {const tilt=[[.08,-.06],[-.06,.05],[.04,.07],[-.08,-.04],[.02,-.08],[.07,.04],[-.04,.08],[.06,-.03],[-.07,-.07]];let i=0;for(const x of [-.5,0,.5])for(const zz of [-.5,0,.5]){const t=tilt[i++];P474.pit.parts.push(['spikeW',x,.24,zz,.17,.5,.17,t[0],0,t[1]]);}}
 P474.firetrap={n:'Trappola di fuoco',i:'🔥',cost:{metal:4,iron:2,coal:3},hp:260,cell:'o',lv:6,max:8,parts:[['dark',0,.03,0,1.5,.06,1.5],
   ['haz',0,.065,-.69,1.5,.012,.1],['haz',0,.065,.69,1.5,.012,.1],['haz',-.69,.065,0,.1,.012,1.3],['haz',.69,.065,0,.1,.012,1.3],
   ['metal',0,.07,-.3,1.2,.02,.05],['metal',0,.07,0,1.2,.02,.05],['metal',0,.07,.3,1.2,.02,.05],
   ['metalC',-.42,.12,-.42,.15,.16,.15],['metalC',.42,.12,-.42,.15,.16,.15],['metalC',-.42,.12,.42,.15,.16,.15],['metalC',.42,.12,.42,.15,.16,.15],['metalC',0,.12,0,.17,.16,.17],
   ['darkC',-.42,.21,-.42,.09,.03,.09],['darkC',.42,.21,-.42,.09,.03,.09],['darkC',-.42,.21,.42,.09,.03,.09],['darkC',.42,.21,.42,.09,.03,.09],['darkC',0,.21,0,.1,.03,.1],['glow',0,.24,0,.05,.03,.05],
   ['metalC',0,.13,.62,.2,.9,.2,0,0,H474],['haz',0,.13,.62,.06,.21,.21]]};
 P474.bell={n:'Campana d\'allarme',i:'🔔',cost:{wood:4,metal:2},hp:200,cell:'o',circ:.32,lv:2,max:3,parts:[['stone',0,.08,0,.78,.16,.6],
   ['wood',-.42,1.1,0,.13,2.1,.13],['wood',.42,1.1,0,.13,2.1,.13],['wood',0,2.12,0,1.02,.14,.16],['plank',-.27,2.33,0,.62,.05,.4,0,0,.5],['plank',.27,2.33,0,.62,.05,.4,0,0,-.5],
   ['metalC',0,1.98,0,.06,.16,.06],['brassB',0,1.68,0,.5,.52,.5],['terraD',0,1.45,0,.52,.03,.52],['dark',0,1.38,0,.07,.12,.07],['linen',.12,.98,0,.025,.86,.025]]};
 P474.bunker={n:'Bunker di sacchi',i:'🟫',cost:{stone:6,wood:2,metal:1},hp:900,edge:1,box:[2,.8],lv:4,parts:[
   ['sand',-.66,.14,0,.62,.27,.74,0,.04,0],['sand',0,.14,.02,.62,.27,.74,0,-.03,0],['sand',.66,.14,0,.62,.27,.74,0,.05,0],
   ['sand',-.84,.4,0,.32,.26,.7],['sand',-.33,.4,.02,.62,.26,.7,0,.04,0],['sand',.33,.4,0,.62,.26,.7,0,-.04,0],['sand',.84,.4,0,.32,.26,.7],
   ['sand',-.62,.66,0,.62,.25,.66,0,-.05,0],['sand',0,.66,.01,.62,.25,.66,0,.03,0],['sand',.62,.66,0,.62,.25,.66,0,.04,0],
   ['sand',-.33,.91,0,.62,.24,.6,0,.05,0],['sand',.33,.91,0,.62,.24,.6,0,-.03,0],['wood',-.98,.62,.38,.12,1.24,.12],['wood',.98,.62,.38,.12,1.24,.12],['plank',0,1.08,.36,2.02,.07,.1],['metal',0,.54,.4,1.9,.05,.02]]};
 P474.ballista={n:'Balestra automatica',i:'🏹',cost:{wood:10,metal:4,iron:3},hp:340,cell:'o',circ:.55,turret:1,lv:7,bench:1,max:2,parts:[
   ['darkC',0,.08,0,1.0,.16,1.0],['haz',0,.17,0,.7,.03,.7],['woodC',0,.6,0,.22,.9,.22],['metalC',0,1.04,0,.38,.08,.38],['crate',.42,.27,.32,.3,.2,.3],
   ['wood',0,1.16,-.05,.22,.16,1.3,0,0,0,'h'],['metal',-.07,1.26,-.05,.04,.04,1.2,0,0,0,'h'],['metal',.07,1.26,-.05,.04,.04,1.2,0,0,0,'h'],
   ['wood',-.42,1.2,-.5,.9,.09,.11,0,.35,0,'h'],['wood',.42,1.2,-.5,.9,.09,.11,0,-.35,0,'h'],['metal',-.84,1.2,-.36,.08,.12,.08,0,0,0,'h'],['metal',.84,1.2,-.36,.08,.12,.08,0,0,0,'h'],
   ['wire',0,1.22,-.3,1.66,.02,.02,0,0,0,'h'],['metal',0,1.3,-.18,.035,.035,1.0,0,0,0,'h'],['spikeK',0,1.3,-.74,.07,.18,.07,-H474,0,0,'h'],['metalC',.17,1.13,.42,.24,.05,.24,0,0,H474,'h'],['glow',0,1.3,.4,.05,.04,.05,0,0,0,'h']]};
 P474.efloor={n:'Pavimento elettrico',i:'⚡',cost:{metal:4,iron:2,elec:2},hp:320,cell:'o',lv:8,bench:1,power:1,max:10,parts:[['dark',0,.025,0,1.8,.05,1.8],
   ['haz',0,.055,-.86,1.8,.012,.08],['haz',0,.055,.86,1.8,.012,.08],['haz',-.86,.055,0,.08,.012,1.64],['haz',.86,.055,0,.08,.012,1.64],
   ['metal',0,.06,-.45,1.62,.02,.04],['metal',0,.06,0,1.62,.02,.04],['metal',0,.06,.45,1.62,.02,.04],['metal',-.45,.062,0,.04,.02,1.62],['metal',0,.062,0,.04,.02,1.62],['metal',.45,.062,0,.04,.02,1.62],
   ['blue',-.72,.08,-.72,.12,.06,.12],['blue',.72,.08,-.72,.12,.06,.12],['blue',-.72,.08,.72,.12,.06,.12],['blue',.72,.08,.72,.12,.06,.12],['glow',-.72,.12,-.72,.05,.02,.05],['glow',.72,.12,.72,.05,.02,.05]]};
 P474.moat={n:'Fossato',i:'🌊',cost:{stone:3,wood:1},hp:400,cell:'o',lv:3,parts:[['dark',0,.005,0,1.62,.01,1.62],['water',0,.035,0,1.62,.02,1.62],
   ['stone',0,.07,-.88,1.92,.14,.18],['stone',0,.07,.88,1.92,.14,.18],['stone',-.88,.07,0,.18,.14,1.58],['stone',.88,.07,0,.18,.14,1.58],
   ['leafI2',-.7,.18,-.7,.12,.3,.12],['leaf',-.62,.22,-.74,.03,.36,.03,.1,0,.1],['leaf',.7,.2,.68,.03,.36,.03,-.1,0,.12],['leafI2',.74,.16,.62,.1,.24,.1]]};
 P474.swall={n:'Muro chiodato',i:'🦔',cost:{stone:5,iron:3,metal:2},hp:820,edge:1,box:[2,.5],spike:1,lv:6,parts:[['stone',0,.3,0,2,.6,.42],['stone',0,1.45,0,1.96,1.7,.34],
   ['metal',-.94,1.315,0,.14,2.63,.4],['metal',.94,1.315,0,.14,2.63,.4],['metal',0,2.56,0,2.04,.14,.4],['metal',0,.72,.19,1.86,.1,.04],['metal',0,1.32,.19,1.86,.1,.04],['metal',0,1.92,.19,1.86,.1,.04],['metal',0,1.1,-.19,1.86,.1,.04]]};
 for(const y of [.72,1.32,1.92])for(const x of [-.66,-.22,.22,.66])P474.swall.parts.push(['spikeK',x+(y===1.32?.11:0),y,.4,.08,.42,.08,H474,0,0]);
 for(const x of [-.55,0,.55])P474.swall.parts.push(['spikeK',x,1.1,-.36,.07,.34,.07,-H474,0,0]);
 Object.assign(PDEF,P474);
 try{PORDER.push('mdoor','spikebar','pit','firetrap','bell','bunker','ballista','efloor','moat','swall');
  const mu=BCAT43.find(c=>c[0]==='muri'),di=BCAT43.find(c=>c[0]==='difesa');const TRAPS=['spikes','wire','trap','mine','moat','pit','firetrap','efloor'];
  if(di){di[2]=di[2].filter(k=>!TRAPS.includes(k));di[2].push('spikebar','bunker','swall','bell','ballista');}
  if(mu)mu[2].push('mdoor');
  const ti=BCAT43.findIndex(c=>c[0]==='difesa');BCAT43.splice(ti+1,0,['trappole','🪤 Trappole',TRAPS.filter(k=>PDEF[k])]);
  for(const c of BCAT43){const Lc=c[2];const o=Lc.map((k,i)=>[k,i]);o.sort((a,b)=>((PDEF[a[0]]&&PDEF[a[0]].lv)||1)-((PDEF[b[0]]&&PDEF[b[0]].lv)||1)||a[1]-b[1]);for(let i=0;i<o.length;i++)Lc[i]=o[i][0];}
  const bc=document.getElementById('bCat43');if(bc)bc.innerHTML=BCAT43.map(([k,l])=>'<button data-bc="'+k+'">'+l+'</button>').join('');}catch(e){e474(e,'bcat');}}

// ---- behaviour of the new defenses ----
SFX.bell474=v=>{const t=AU.ctx.currentTime,k=Math.max(.15,Math.min(1,v||1));for(let i=0;i<3;i++){const s=t+i*.42;osc(s,1.9,.2*k,'sine',660,654);osc(s,1.3,.09*k,'sine',1590,1585);osc(s,.7,.05*k,'triangle',2240,2230);}};
SFX.twang474=()=>{const t=AU.ctx.currentTime;osc(t,.18,.22,'triangle',220,90);osc(t,.08,.12,'square',140,60);};
SFX.whoosh474=()=>{const t=AU.ctx.currentTime;osc(t,.5,.16,'sawtooth',120,50);osc(t,.35,.1,'square',90,40);};
const D474={zap:0,bellT:{},fx:0};
function kill474(z,p,txt){killZombie(z,_t474.set(z.g.position.x-p.x,0,z.g.position.z-p.z).normalize().clone(),6,false);feed(txt);}
function tick474(dt){if(!M474.on||!SV.on||game.state!=='play')return;try{
  D474.zap-=dt;const tk=D474.zap<=0;if(tk)D474.zap=.1;
  for(const p of PIECES.slice()){if(!p.alive)continue;const ty=p.type;
    if(ty==='ballista'){const s=bst(p);p.cd474=(p.cd474||0)-dt;if(p.cd474>0||(s.a|0)<=0)continue;let best=null,bd=18;
      for(const z of zombies){if(!z.alive||z.dead)continue;const d=Math.hypot(z.g.position.x-p.x,z.g.position.z-p.z);if(d<bd&&!losBlocked(p.x,p.z,z.g.position.x,z.g.position.z)){bd=d;best=z;}}
      if(!best){p.cd474=.4;continue;}p.cd474=1.8;p.aim=Math.atan2(-(best.g.position.x-p.x),-(best.g.position.z-p.z));pieceWrite(p);s.a--;
      const sc=best.V.scale||1;_t474.set(p.x-Math.sin(p.aim)*.8,1.3,p.z-Math.cos(p.aim)*.8);_d474.set(best.g.position.x,1.1*sc,best.g.position.z);
      tracer(_t474,_d474,0x9a7044,.07,.14);const dir=_d474.clone().sub(_t474).normalize();damageZombie(best,(58+Math.min(15,SV.day)*1.6)*(best.V.name==='boss'?.6:1),'body',_d474.clone(),dir);
      if(best.alive&&!best.dead){best.stag=Math.max(best.stag||0,.3);best.g.position.x+=dir.x*.35;best.g.position.z+=dir.z*.35;}
      if(Math.hypot(p.x-player.pos.x,p.z-player.pos.z)<32)play('twang474');if(s.a===0)feed('🏹 Balestra scarica · ricaricala con 🔩2');continue;}
    if(ty==='bell'){p.cd474=(p.cd474||0)-dt;if(p.cd474>0||!tk)continue;let n=0;for(const z of zombies){if(!z.alive||z.dead||z.flee)continue;const d=Math.hypot(z.g.position.x-p.x,z.g.position.z-p.z);if(d<8||(d<14&&(z.ai==='chase'||z.ai==='search')))n++;}
      if(n){p.cd474=22;const dp=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);play('bell474',1-dp/70);if(dp<70)toast('🔔 Allarme! '+(n>1?n+' zombie vicini':'Uno zombie è vicino')+' alla base',2000);}else p.cd474=.5;continue;}
    if(!tk)continue;
    if(ty==='pit'||ty==='moat'||ty==='efloor'||ty==='firetrap'){const D=PDEF[ty];let g=null;if(ty==='efloor'){g=genNear43(p.x,p.z);if(!g)continue;}
      if(ty==='firetrap'){p.cd474=(p.cd474||0)-.1;if(p.cd474>0)continue;}
      let hit=0;
      for(const z of zombies){if(!z.alive||z.dead)continue;const dx=z.g.position.x-p.x,dz=z.g.position.z-p.z,boss=z.V.name==='boss';
        if(ty==='moat'){if(Math.abs(dx)<.98&&Math.abs(dz)<.98){z.wireT=Math.max(z.wireT||0,.3);if(Math.random()<.08)emit(_t474.set(z.g.position.x,.1,z.g.position.z),_up474,2,[0x9fc8e0,0xd8eef8],{speed:1.2,spread:.9,life:.35,size:.04,grav:7});}continue;}
        if(ty==='pit'){if(Math.abs(dx)<.9&&Math.abs(dz)<.9){hit=1;z.wireT=Math.max(z.wireT||0,.45);z.hp-=38*.1*(boss?.5:1);z.flash=.04;if(Math.random()<.25)emit(_t474.set(z.g.position.x,.3,z.g.position.z),_up474,2,BLOOD,{speed:1.2,spread:.8,life:.4,size:.04,grav:9});
            if(z.hp<=0)kill474(z,p,'🕳️ Fossa: zombie eliminato');}continue;}
        if(ty==='efloor'){if(Math.abs(dx)<.95&&Math.abs(dz)<.95){hit=1;z.wireT=Math.max(z.wireT||0,.25);z.stag=Math.max(z.stag||0,.12);z.hp-=32*.1*(boss?.5:1);z.flash=.08;if(Math.random()<.5)emit(_t474.set(z.g.position.x,.2,z.g.position.z),_up474,4,SPARK,{speed:4,spread:1,life:.2,size:.03,grav:6,stretch:3});
            if(z.hp<=0)kill474(z,p,'⚡ Pavimento elettrico: zombie fulminato');}continue;}
        if(ty==='firetrap'&&Math.abs(dx)<1&&Math.abs(dz)<1)hit=1;}
      if(ty==='firetrap'&&hit){p.cd474=4.5;for(const z of zombies){if(!z.alive||z.dead)continue;if(Math.hypot(z.g.position.x-p.x,z.g.position.z-p.z)<1.7){igniteZ(z,4);flameDmg(z,18*(z.V.name==='boss'?.5:1));}}
        for(let i=0;i<22;i++){const a=Math.random()*6.283,r=Math.random()*.6;flameP(p.x+Math.sin(a)*r,.25,p.z+Math.cos(a)*r,Math.sin(a)*.6,2.6+Math.random()*2,Math.cos(a)*.6,.5+Math.random()*.4,.35,1.1,0);}
        if(Math.hypot(p.x-player.pos.x,p.z-player.pos.z)<30)play('whoosh474');p.hp-=3;}
      if(hit&&ty==='pit')p.hp-=.3;
      if(hit&&ty==='efloor'){const s=bst(g);s.f=Math.max(0,(s.f||0)-.05);}
      if(p.hp<=0){feed('🧱 '+D.n+' distrutto');removePiece(p);svSave();}}}
}catch(e){e474(e,'tick');}}
TICK42.push(tick474);

// ---- build list: drawn icons (static SVG files), lock badge, scroll position kept ----
const BI474='?v=4.3.74';
function bIcon474(k,D,lk){return '<i class="bi474'+(lk?' lk':'')+'"><span>'+D.i+'</span><img src="assets/build/'+k+'.svg'+BI474+'" alt="" draggable="false" onerror="this.remove()">'+(lk?'<em>🔒</em>':'')+'</i>';}
{const _rb=renderBuildBar;let pend=0;renderBuildBar=function(){try{if(!M474.on)return _rb.apply(this,arguments);
  if(busy474('bList')){if(!pend){pend=1;const w=()=>{if(busy474('bList'))return setTimeout(w,200);pend=0;renderBuildBar();};setTimeout(w,200);}return;}
  if(SV.build)bcat43=catOf43(SV.build);const c=BCAT43.find(x=>x[0]===bcat43)||BCAT43[0];const L=c[2].filter(k=>PDEF[k]);
  for(const b of document.querySelectorAll('#bCat43 button'))b.classList.toggle('on',b.dataset.bc===bcat43);
  const el=$('bList'),sl=el.scrollLeft;
  const h=L.map(k=>{const D=PDEF[k],lk=D.lv&&(P42.L|0)<D.lv,nb=D.bench&&!hasBench43();
    return '<button class="bp'+(SV.build===k?' on':'')+(costOK(D.cost)?'':' poor')+(lk?' lock':'')+'" data-p="'+k+'">'+bIcon474(k,D,lk)+'<b>'+D.n+'</b><small>'+(lk?'Liv. '+D.lv:nb?'🛠️ Banco':costTxt(D.cost))+'</small></button>';}).join('');
  if(el.__h474!==h){el.__h474=h;el.innerHTML=h;}if(Math.abs(el.scrollLeft-sl)>1)el.scrollLeft=sl;}catch(e){e474(e,'rbb');return _rb.apply(this,arguments);}};}
{const st=document.createElement('style');st.id='v474css';st.textContent=
 '#bList .bp i.bi474{position:relative;display:block;width:34px;height:34px;margin:1px auto 1px;font-style:normal;font-size:18px;line-height:34px;text-align:center}'+
 '#bList .bp i.bi474 img{position:absolute;left:0;top:0;width:34px;height:34px;border-radius:8px;pointer-events:none}'+
 '#bList .bp i.bi474.lk img{filter:grayscale(.9) brightness(.62)}#bList .bp i.bi474 em{position:absolute;right:-4px;bottom:-3px;font-style:normal;font-size:12px;line-height:1;filter:drop-shadow(0 1px 1px #000)}'+
 '#bList .bp.lock{opacity:.78;filter:none}#bList .bp.on i.bi474 img{box-shadow:0 0 0 2px #9fd4ff}'+
 '#bCat43{width:100%;min-width:0;box-sizing:border-box;flex:0 0 auto;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain}#bCat43 button{flex:0 0 auto;white-space:nowrap}'+
 '#bList{min-width:0;overscroll-behavior-x:contain;scroll-snap-type:none}#qList{overscroll-behavior:contain}#loot452grid{overscroll-behavior:contain;scroll-snap-type:none}';
 document.head.appendChild(st);}
try{if(SV.build)renderBuildBar();}catch(e){}
window.__zs474={get m(){return M474;},AI474,detour:z=>detour474(z,player.pos),tick:tick474,icon:k=>bIcon474(k,PDEF[k],false)};
