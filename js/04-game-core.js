/* Zombie Survival — game code part 04-game-core (game.html lines 2350-2652 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ---------- state ----------
const player={pos:new T.Vector3(),vel:new T.Vector3(),yaw:0,pitch:0,tYaw:0,tPitch:0,hp:100,maxHp:100,lastHit:-99,r:.4,bob:0,moveAmt:0,started:false};
const game={state:'menu',wave:1,toSpawn:0,spawnT:0,kills:0,waveBreak:0,time:0,frames:0,plan:[]};
const inv={wood:0,metal:0,elec:0};
const own={knife:true,pistol:false,shotgun:false,laser:false},mag={knife:0,pistol:0,shotgun:0,laser:0},res={knife:0,pistol:0,shotgun:0,laser:0};
for(const w of WEAPONS)if(!(w.id in own)){own[w.id]=false;mag[w.id]=0;res[w.id]=0;}
let curW=0,fireCd=0,firing=false,triggerHeld=false;
const fx={recoilP:0,shake:0,vmKick:0,bloom:0,slash:0,pumpT:-1,reload:-1,reloadDur:1,swap:0,swayY:0,swayX:0,lastYaw:0,lastPitch:0};
let SENS=parseFloat(localStorage.getItem('zc_sens')||'1')||1;
const MAX_ALIVE=8;

function resetGame(){document.body.classList.remove('inmenu');player.pos.set(0,0,2);player.vel.set(0,0,0);player.yaw=player.tYaw=0;player.pitch=player.tPitch=0;player.hp=100;player.lastHit=-99;player.started=true;
  game.kills=0;game.waveBreak=0;game.time=0;inv.wood=inv.metal=inv.elec=0;
  for(const k in own){own[k]=k=='knife';mag[k]=0;res[k]=0;}
  for(const z of zombies){z.alive=false;z.g.visible=false;}for(const p of pickups)placePickup(p);
  fx.reload=-1;equip(0,true);applyLoadout();if(!SV.on)startWave(DEBUG_WAVE||1);else{game.toSpawn=0;game.wave=1;}updateHUD();}
function equip(i,silent){const w=WEAPONS[i];if(!own[w.id])return false;if(i===curW&&!silent)return true;curW=i;fx.reload=-1;fx.swap=1;ADS.on=false;$("adsBtn").classList.remove("on");for(const k in VM)VM[k].visible=(k==w.id);fireCd=Math.max(fireCd,.25);updateHUD();return true;}
function nextWeapon(){if(window.__arena454&&__arena454.on)return;for(let k=1;k<=WEAPONS.length;k++){const i=(curW+k)%WEAPONS.length;if(own[WEAPONS[i].id]){if(i!==curW){equip(i);toast(WEAPONS[i].name,700);}return;}}}

// ---------- HUD ----------
let toastT=null;function toast(msg,ms){const t=$('toast');t.textContent=msg;t.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>t.style.opacity=0,ms||1800);}
function aliveCount(){let n=0;for(const z of zombies)if(z.alive&&!z.dead)n++;return n;}
function bump(id){const e=$(id);e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump');}
function floatText(txt,color){const d=document.createElement('div');d.className='floatTxt';d.textContent=txt;if(color)d.style.color=color;$('floats').appendChild(d);setTimeout(()=>d.remove(),1000);}
function updateHUD(){if(window.__arena454&&__arena454.on){__arena454.hud();return;}$('hpTxt').textContent=Math.ceil(player.hp);$('hpFill').style.width=Math.max(0,player.hp/player.maxHp*100)+'%';
  $('mWood').textContent=inv.wood;$('mMetal').textContent=inv.metal;$('mElec').textContent=inv.elec;
  $('waveTxt').textContent=game.wave;$('zLeft').textContent=aliveCount()+game.toSpawn;$('kills').textContent=game.kills;
  const w=WEAPONS[curW];$('wName').textContent=w.name+(w.tool||!w.dmg?'':' · '+Math.round(wuDmg(w)));
  $('wAmmo').innerHTML=w.melee?'∞ corpo a corpo':(fx.reload>=0?'Ricarica…':'<span class="mag">'+mag[w.id]+'</span> / '+res[w.id]);
  $('reloadBtn').classList.toggle('need',!w.melee&&mag[w.id]<=Math.floor(w.mag*.25)&&res[w.id]>0);hudExtra();}
let hitT=null;function hitMarker(kind){const h=$('hitX');h.className=kind||'';h.style.transition='none';h.style.opacity=1;h.style.transform='scale(1.3)';void h.offsetWidth;h.style.transition='opacity .25s, transform .15s';h.style.transform='scale(1)';clearTimeout(hitT);hitT=setTimeout(()=>h.style.opacity=0,kind=='kill'?220:90);}
function headshotFx(){const e=$('headshot');e.style.transition='none';e.style.opacity=1;e.style.transform='translate(-50%,-50%) scale(1.4)';void e.offsetWidth;e.style.transition='opacity .6s .25s, transform .2s';e.style.opacity=0;e.style.transform='translate(-50%,-50%) scale(1)';}

// ---------- crafting ----------
function canCraft(w){return inv.wood>=w.cost.wood&&inv.metal>=w.cost.metal&&inv.elec>=w.cost.elec;}
function costHTML(w){const parts=[];for(const k of ['wood','metal','elec'])if(w.cost[k]){const ok=inv[k]>=w.cost[k];parts.push('<span class="'+(ok?'':'miss')+'">'+MAT_INFO[k].icon+' '+w.cost[k]+' '+MAT_INFO[k].name+' ('+inv[k]+')</span>');}return parts.join(' + ');}
function renderCraft(){$('craftMats').innerHTML='Hai: '+(SV.on?RES_K:['wood','metal','elec']).map(k=>RES[k].i+' '+(inv[k]|0)+' '+RES[k].n).join(' · ');
  let h=SV.on?svCraftHTML():'';WEAPONS.forEach((w,i)=>{if(w.melee||(w.shop&&!own[w.id]))return;const o=own[w.id];h+='<div class="recipe"><div><div class="name">'+w.name+(o?' ✔':'')+'</div><div class="stats">'+w.desc+'</div><div class="cost">'+costHTML(w)+'</div></div><button class="act" data-i="'+i+'" '+(canCraft(w)?'':'disabled')+'>'+(o?'+ Munizioni':'Costruisci')+'</button></div>';});
  h+=nadeRecipe();$('recipes').innerHTML=h;}
$('recipes').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b||b.disabled)return;if(b.dataset.i==='g')craftNade();else craft(+b.dataset.i);});
function craft(i){const w=WEAPONS[i];if(!canCraft(w))return false;inv.wood-=w.cost.wood;inv.metal-=w.cost.metal;inv.elec-=w.cost.elec;
  const was=own[w.id];own[w.id]=true;if(!was){mag[w.id]=w.mag;res[w.id]=w.reserveGive;}else res[w.id]=Math.min(w.maxReserve,res[w.id]+w.reserveGive);
  curW=-1;equip(i,true);renderCraft();updateHUD();toast(was?w.name+': +'+w.reserveGive+' munizioni':'🔨 '+w.name+' costruita!');play('craft');return true;}
function openCraft(){if(window.__arena454&&__arena454.on)return;if(game.state!=='play')return;game.state='craft';firing=false;resetTouchState();if(document.pointerLockElement)document.exitPointerLock();renderCraft();$('craftScreen').classList.remove('hidden');}
function closeCraft(){$('craftScreen').classList.add('hidden');if(game.state==='craft'){game.state='play';last=performance.now();}if(!isTouch)lockPointer();}
$('craftClose').addEventListener('click',closeCraft);

// ---------- shooting ----------
const ray=new T.Raycaster();const _dir=new T.Vector3(),_org=new T.Vector3(),_n=new T.Vector3(),_from=new T.Vector3(),_tmp=new T.Vector3();
let targetsCache=[];function shootTargets(){targetsCache.length=0;for(const s of solids)targetsCache.push(s);for(const m of zHitMeshes){const z=m.userData.z;if(!z||!z.alive||z.dead)continue;const slot=m.userData.slot;if(z.gore&&slot&&z.gore[slot])continue;targetsCache.push(m);}return targetsCache;}
const BLOOD=[0x8a0000,0x5a0000,0xb01010,0x6e0505];const SPARK=[0xfff2b0,0xffc040,0xff8a20];const DUST=[0x6a6058,0x857a6e,0x4a443e];
function startReload(){const w=WEAPONS[curW];if(w.melee||fx.reload>=0||mag[w.id]>=w.mag||res[w.id]<=0)return false;fx.reload=0;fx.reloadDur=w.reload;play('reload',w.reload);$('rlBar').style.display='block';updateHUD();return true;}
function finishReload(){const w=WEAPONS[curW];const take=Math.min(w.mag-mag[w.id],res[w.id]);mag[w.id]+=take;res[w.id]-=take;fx.reload=-1;$('rlBar').style.display='none';updateHUD();}
function damageZombie(z,dmg,part,point,dir){if(z.dead)return;const head=part==='head';const d=dmg*(head?2:part==='limb'?.75:1)*(S.dmgT>0?2:1)*(1+ST42.dm/100);z.hp-=d;z.flash=.09;
  const st=clamp(d/35,.4,1.4)*z.V.stagger;z.stag=Math.max(z.stag,.3*st);if(head)z.stagHead=1;z.g.position.x+=dir.x*.12*z.V.stagger;z.g.position.z+=dir.z*.12*z.V.stagger;
  _tmp.copy(dir).multiplyScalar(.9);emit(point,_tmp,head?20:12,BLOOD,{speed:head?4.6:3.5,spread:head?1:.82,life:.75,size:head?.075:.055,grav:11,up:.4,stretch:2.4});
  _tmp.copy(dir).negate();emit(point,_tmp,head?6:4,[0x3a0000,0x1a0000,0x6a0808],{speed:1.3,spread:.8,life:.48,size:.06,grav:5,up:.2});
  _n.set(0,1,0);_tmp.set(point.x+dir.x*rand(.2,.85),0.012,point.z+dir.z*rand(.2,.85));addDecal(bloods,_tmp,_n,head?rand(.9,1.35):rand(.55,.95));
  if(head){_tmp.set(point.x+rand(-.4,.4),0.016,point.z+rand(-.4,.4));addDecal(bloods,_tmp,_n,rand(.4,.7));}
  try{spark449(point,head?0xffe0a0:0xffc8c0,head?.46:.3);}catch(e){}
  dmgNumber(point,d,head,z);play('hit',head);if(head)headshotFx();
  if(z.hp<=0){killZombie(z,dir,d,head);hitMarker('kill');}else hitMarker(head?'head':'');}
function killZombie(z,dir,d,head){z.dead=true;z.deadT=0;game.kills++;try{zs439NoteKill();}catch(e){}onKill(z,head);const fx2=Math.sin(z.g.rotation.y),fz=Math.cos(z.g.rotation.y);const dot=dir.x*fx2+dir.z*fz;z.fdir=dot<0?-1:1;
  z.fa=0;z.fv=1+d*.02;z.sv=new T.Vector3(dir.x,0,dir.z).multiplyScalar(1.5+d*.04);z.landed=false;z.flop=[rand(-2.8,-.3),rand(-2.8,-.3),rand(-1.2,0),rand(-1.2,0),rand(-.6,.6)];
  play('kill');groan(z,'die');setTimeout(updateHUD,0);}
function fire(){if(window.__arena454&&__arena454.firing())return;const w=WEAPONS[curW];if(SV.build){if(!isTouch)placeBuild();fireCd=.32;return;}if(fx.reload>=0)return;if(w.spin&&fx.spin<1)return;
  if(!w.melee&&mag[w.id]<=0){if(res[w.id]>0){startReload();return;}fireCd=.35;play('empty');toast('Munizioni finite! 🔨 Crafting per averne altre',1500);
    for(let i=WEAPONS.length-1;i>=0;i--){const ww=WEAPONS[i];if(own[ww.id]&&(ww.melee||mag[ww.id]+res[ww.id]>0)&&i!==curW){equip(i);break;}}return;}
  fireCd=w.rate;if(!w.melee)mag[w.id]--;if(!w.melee&&SV.on)svNoise(player.pos.x,player.pos.z,SV.phase==='night'?30:22);if(w.tool&&SV.on&&toolHit(w)){updateHUD();return;}if(w.kind&&wSpecial(w)){updateHUD();return;}
  camera.updateMatrixWorld();for(const z of zombies)if(z.alive&&!z.dead&&z.g)z.g.updateMatrixWorld(true);camera.getWorldPosition(_org);
  const targets=shootTargets();const spr=aimSpread(w);
  _from.set(.17,-.16,-.75).applyMatrix4(camera.matrixWorld);
  let hitAny=false;
  for(let p=0;p<w.pellets;p++){
    sprXY467(spr).normalize().applyQuaternion(camera.quaternion);
    ray.set(_org,_dir);ray.far=w.range;const hits=ray.intersectObjects(targets,false);
    let end=_tmp.copy(_org).addScaledVector(_dir,w.range).clone();
    if(hits.length){const h=hits[0];end=h.point.clone();if(w.splash)explosion(h.point.clone(),w.splash,Math.max(8,wuDmg(w)*.35),{small:true,plasma:true});
      if(h.object.userData.z){let dd=wuDmg(w);if(w.fall){const dist=_org.distanceTo(h.point);dd*=Math.max(w.fmin||.2,1-dist/Math.max(1,w.range)*w.fall);}damageZombie(h.object.userData.z,dd,h.object.userData.part,h.point,_dir,h.object.userData.slot);hitAny=true;}
      else if(!w.melee){if(h.face)_n.copy(h.face.normal).transformDirection(h.object.matrixWorld);else _n.set(0,1,0);
        emit(h.point,_n,W_(w)=='laser'?8:7,w.spark||(W_(w)=='laser'?[0x80fff8,0x40ffe0,0xffffff]:SPARK),{speed:5.2,spread:.9,life:.32,size:.042,grav:12,stretch:4});
        emit(h.point,_n,4,DUST,{speed:1.3,spread:.55,life:.65,size:.1,grav:-.4});addDecal(holes,h.point,_n,W_(w)=='shotgun'?.14:.18);spark449(h.point,w.color||0xffe0a0,W_(w)=='shotgun'?.42:.26);if(p===0)play('impact');}}
    else if(w.melee){// small aim assist for melee on touch screens
      let best=null,bd=2.6;for(const z of zombies){if(!z.alive||z.dead)continue;_tmp.set(z.g.position.x-_org.x,0,z.g.position.z-_org.z);const d=_tmp.length();if(d>bd)continue;_tmp.normalize();if(_tmp.x*_dir.x+_tmp.z*_dir.z>.8){best=z;bd=d;}}
      if(best){_tmp.set(best.g.position.x,1.3*best.V.scale,best.g.position.z);damageZombie(best,wuDmg(w),'body',_tmp.clone(),_dir);hitAny=true;}}
    if(!w.melee&&p<4){const laser=W_(w)=='laser';tracer(_from,end,w.color,laser?.05:.02,laser?.14:.085);if(p===0&&!laser)tracer(_from,end,0xfff6d2,.055,.06,.34);}
  }
  if(!hitAny&&!w.melee&&!w.tool){
    _dir.set(0,0,-1).applyQuaternion(camera.quaternion);
    ray.set(_org,_dir);ray.far=w.range;
    const near=ray.intersectObjects(targets,false);
    let block=w.range;
    if(near.length&&near[0].object.userData&&near[0].object.userData.z){const h=near[0];let dd=wuDmg(w);if(w.fall){const dist=_org.distanceTo(h.point);dd*=Math.max(w.fmin||.2,1-dist/Math.max(1,w.range)*w.fall);}damageZombie(h.object.userData.z,dd,h.object.userData.part,h.point,_dir,h.object.userData.slot);hitAny=true;}
    else{if(near.length)block=near[0].distance;const rad=isTouch?0.85:0.55;let best=null,bd=block;for(const z of zombies){if(!z.alive||z.dead)continue;const s=z.V.scale||1,px=z.g.position.x,pz=z.g.position.z;for(const yy of [0.9,1.3,1.7]){const ox=px-_org.x,oy=yy*s-_org.y,oz=pz-_org.z,along=ox*_dir.x+oy*_dir.y+oz*_dir.z;if(along<0.55||along>bd)continue;const qx=ox-_dir.x*along,qy=oy-_dir.y*along,qz=oz-_dir.z*along,rr=rad*s;if(qx*qx+qy*qy+qz*qz<rr*rr){best=z;bd=along;break;}}}
      if(best){_tmp.set(best.g.position.x,1.05*(best.V.scale||1),best.g.position.z);damageZombie(best,wuDmg(w),'body',_tmp.clone(),_dir);hitAny=true;}}
  }
  if(w.melee){fx.slash=1;slashShow449(hitAny);_tmp.copy(camera.position).addScaledVector(_dir,1.15);_tmp.y=Math.max(.7,_tmp.y-.15);emit(_tmp,_dir,hitAny?12:7,hitAny?BLOOD:[0xfff6e8,0xffffff,0xffe2b0],{speed:hitAny?3.2:2.4,spread:.75,life:.32,size:.045,grav:5,stretch:2.2});play(hitAny?'knifeHit':'knife');fx.shake+=.15;}
  else{const vm=VM[w.id];const fl=vm.userData.flash;fl.userData.t=W_(w)=='laser'?.05:.07;fl.material.opacity=1;fl.material.rotation=Math.random()*6;const sc=(W_(w)=='shotgun'?.55:.32)*rand(.8,1.2);fl.scale.set(sc,sc,1);
    vmFlash.color.setHex(w.color);vmFlash.intensity=W_(w)=='laser'?1.5:4;muzzleLight.color.setHex(w.mlColor||(W_(w)=='laser'?0x40fff0:0xffb050));muzzleLight.intensity=W_(w)=='laser'?6:W_(w)=='shotgun'?26:16;
    muzzleLight.position.copy(_from);kickShot(w);
    if(W_(w)=='shotgun')fx.pumpT=0;play(w.snd||w.id);if(SET.vib&&navigator.vibrate&&W_(w)=='shotgun')try{navigator.vibrate(25);}catch(e){}
    if(mag[w.id]===0&&res[w.id]>0)setTimeout(()=>{if(WEAPONS[curW]===w&&game.state==='play')startReload();},w.rate*1000+60);}
  updateHUD();}

// ---------- pickup ----------
function nearestPickup(maxD){let best=null,bd=maxD;for(const p of pickups){if(!p.active||p.fly>0)continue;const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);if(d<bd){bd=d;best=p;}}return best;}
function collect(p){if(SV.on&&bagCount()>=bagCap()){if(!p.full){p.full=1;toast('🎒 Zaino pieno! Deposita nella cassa',1300);setTimeout(()=>p.full=0,3000);}return;}p.active=false;p.fly=.001;p.timer=18+Math.random()*12;inv[p.type]++;const I=MAT_INFO[p.type];
  _tmp.set(p.x,p.item.position.y,p.z);emit(_tmp,_up,18,[I.glow,0xffffff],{speed:3,spread:1,life:.55,size:.05,grav:2});
  floatText('+1 '+I.name,'#'+new T.Color(I.glow).getHexString());bump(I.hud);play('pickup',I.k);updateHUD();}
function tryPick(){if(window.__arena454&&__arena454.on)return __arena454.claim();const p=nearestPickup(3.2);if(p){collect(p);return true;}return SV.on&&svUse();}

// ---------- input: keyboard / mouse ----------
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(game.state==='play'){if(e.code==='KeyE')tryPick();if(e.code==='KeyC')openCraft();if(e.code==='KeyQ')nextWeapon();if(e.code==='KeyR')startReload();
  if(e.code==='KeyG')throwNade();if(e.code==='KeyP'||e.code==='Escape')pauseGame();
  const n=['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9'].indexOf(e.code);if(n>=0&&!SV.build){const L=ownedList();if(L[n]!==undefined&&L[n]!==curW){equip(L[n]);toast(WEAPONS[L[n]].name,700);}}}
  else if(game.state==='craft'&&(e.code==='KeyC'||e.code==='Escape'))closeCraft();else if(game.state==='pause'&&(e.code==='KeyP'||e.code==='Escape'))resumeGame();});
addEventListener('keyup',e=>keys[e.code]=false);
function lockPointer(){if(!isTouch&&canvas.requestPointerLock)try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(e){}}
canvas.addEventListener('mousedown',e=>{if(isTouch||game.state!=='play')return;if(document.pointerLockElement!==canvas){lockPointer();return;}if(e.button===0){firing=true;triggerHeld=false;}});
addEventListener('mouseup',e=>{if(!isTouch&&e.button===0){firing=false;triggerHeld=false;}});
addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&game.state==='play'){player.tYaw-=e.movementX*.0022*SENS*ZK();player.tPitch-=e.movementY*.0022*SENS*ZK();clampPitch();}});
addEventListener('wheel',()=>{if(game.state==='play')nextWeapon();},{passive:true});
function clampPitch(){player.tPitch=clamp(player.tPitch,-1.4,1.4);}

// ---------- input: touch ----------
const joy={id:null,cx:0,cy:0,x:0,y:0};const look={id:null,lx:0,ly:0};const fireT={id:null,lx:0,ly:0};
const joyBase=$('joyBase'),joyKnob=$('joyKnob');const JR=58;
function placeJoyBase(x,y){joyBase.style.left=x+'px';joyBase.style.top=y+'px';}
function homeJoy(){const sl=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sal'))||0;placeJoyBase(Math.min(Math.max(100+sl,VW()*.13+sl),118+sl),VH()-164-(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab'))||0));joyKnob.style.transform='';}
homeJoy();
function resetTouchState(){joy.id=look.id=fireT.id=null;joy.x=joy.y=0;homeJoy();firing=false;$('fireBtn').classList.remove('on');}
const pd=e=>{if(e.cancelable&&!(e.target&&e.target.closest&&e.target.closest('.scroll,#payChat,#arenaGuns')))e.preventDefault();};
$('joyZone').addEventListener('touchstart',e=>{pd(e);if(game.state!=='play'||joy.id!==null)return;const t=e.changedTouches[0];joy.id=t.identifier;joy.cx=t.clientX;joy.cy=t.clientY;placeJoyBase(t.clientX,t.clientY);},{passive:false});
$('lookZone').addEventListener('touchstart',e=>{pd(e);if(game.state!=='play'||look.id!==null)return;const t=e.changedTouches[0];look.id=t.identifier;look.lx=t.clientX;look.ly=t.clientY;},{passive:false});
$('fireBtn').addEventListener('touchstart',e=>{pd(e);if(game.state!=='play')return;const t=e.changedTouches[0];fireT.id=t.identifier;fireT.lx=t.clientX;fireT.ly=t.clientY;firing=true;triggerHeld=false;$('fireBtn').classList.add('on');},{passive:false});
function tapBtn(id,fn){const el=$(id);el.addEventListener('touchstart',e=>{pd(e);if(game.state==='play'){el.classList.add('on');setTimeout(()=>el.classList.remove('on'),150);fn();}},{passive:false});el.addEventListener('click',()=>{if(game.state==='play')fn();});}
tapBtn('pickBtn',()=>{if(!tryPick())toast('Niente da usare qui vicino',900);});tapBtn('craftBtn',openCraft);tapBtn('swapBtn',nextWeapon);
tapBtn('reloadBtn',()=>{const w=WEAPONS[curW];if(w.melee)toast('Il coltello non si ricarica',800);else if(!startReload()&&res[w.id]<=0&&mag[w.id]<w.mag)toast('Niente munizioni di riserva',900);});
const LOOK_S=.0052;
document.addEventListener('touchmove',e=>{if(e.target&&e.target.closest&&e.target.closest('#arenaGuns,.scroll'))return;if(game.state==='play'||!(e.target&&e.target.closest&&e.target.closest('.overlay')))pd(e);if(game.state!=='play')return;for(const t of e.changedTouches){
  if(t.identifier===joy.id){const JR=145.6*(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui'))||1);let dx=t.clientX-joy.cx,dy=t.clientY-joy.cy;const d=Math.hypot(dx,dy);if(d>JR){dx*=JR/d;dy*=JR/d;}joy.x=dx/JR;joy.y=dy/JR;joyKnob.style.transform='translate('+dx+'px,'+dy+'px)';}
  else if(t.identifier===look.id||t.identifier===fireT.id){const L=t.identifier===look.id?look:fireT;let dx=t.clientX-L.lx,dy=t.clientY-L.ly;if(zsShow()){L.sx=(L.sx||0)*.35+dx*.65;L.sy=(L.sy||0)*.35+dy*.65;dx=L.sx;dy=L.sy;}player.tYaw-=dx*LOOK_S*SENS*ZK();player.tPitch-=dy*LOOK_S*SENS*ZK();L.lx=t.clientX;L.ly=t.clientY;clampPitch();}}},{passive:false});
function touchEnd(e){for(const t of e.changedTouches){if(t.identifier===joy.id){joy.id=null;joy.x=joy.y=0;homeJoy();}if(t.identifier===look.id){look.id=null;look.sx=look.sy=0;}if(t.identifier===fireT.id){fireT.id=null;fireT.sx=fireT.sy=0;firing=false;$('fireBtn').classList.remove('on');}}}
document.addEventListener('touchend',touchEnd);document.addEventListener('touchcancel',touchEnd);
document.addEventListener('gesturestart',pd);document.addEventListener('dblclick',pd);document.addEventListener('contextmenu',pd);

// ---------- menu / start / game over ----------
const sensEl=$('sens');sensEl.value=SENS;$('sensV').textContent=SENS.toFixed(1);
sensEl.addEventListener('input',()=>{SENS=parseFloat(sensEl.value);$('sensV').textContent=SENS.toFixed(1);try{localStorage.setItem('zc_sens',SENS);}catch(e){}});
['touchstart','touchmove','touchend'].forEach(ev=>sensEl.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));
function goFullscreen(){if(window.__zsApk){try{const el=document.documentElement;const rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq&&!document.fullscreenElement&&!document.webkitFullscreenElement){const r=rq.call(el,{navigationUI:'hide'});if(r&&r.catch)r.catch(()=>{});}}catch(e){}return;}if(TG.W){tgFull();return;}
  if(!isTouch)return;try{const el=document.documentElement;const rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq){const r=rq.call(el,{navigationUI:'hide'});if(r&&r.then)r.then(()=>{try{}catch(e){}}).catch(()=>{});}}catch(e){}}
function startGame(load){curPendR=null;if(typeof load!=='boolean')load=!!svLoadData();SV.on=true;audioInit();goFullscreen();
  for(const id of ['startScreen','overScreen','soonScreen','pauseScreen','shopScreen','rankScreen','helpScreen','dlgScreen'])$(id).classList.add('hidden');resetGame();svEnter(load);game.state='play';last=performance.now();lockPointer();setTimeout(()=>{renderThumbsIdle(()=>{wbSig='';try{hud4();}catch(e){}});wbSig='';hud4();},80);}
function showMenu(){if(window.__arena454&&__arena454.busy())__arena454.shutdown();svExit();game.state='menu';$('pauseScreen').classList.add('hidden');slamRing.visible=false;$('bossBar').style.display='none';hideBanner();$('lowhp').style.opacity=0;document.body.classList.add('inmenu');$('overScreen').classList.add('hidden');$('startScreen').classList.remove('hidden');for(const z of zombies){z.alive=false;z.g.visible=false;}showBest();}
let eatUiUntil=0;
function eatNextClick(ms){eatUiUntil=Date.now()+(ms||800);}
function onTap(id,fn){const el=$(id);let tt=0;el.addEventListener('touchend',e=>{pd(e);if(drag43(e))return;if(Date.now()<eatUiUntil)return;tt=Date.now();fn();},{passive:false});el.addEventListener('click',e=>{if(Date.now()<eatUiUntil){if(e.cancelable)e.preventDefault();e.stopPropagation();return;}if(Date.now()-tt>600)fn();});}
document.addEventListener('click',e=>{if(Date.now()<eatUiUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
onTap('btnZombie',()=>startGame());onTap('btnOnline',()=>{if(window.__arena454)__arena454.open();else{$('soonScreen').classList.remove('hidden');}});onTap('soonBack',()=>{eatNextClick();$('soonScreen').classList.add('hidden');});
onTap('restartBtn',()=>startGame());onTap('btnHelp',()=>$('helpScreen').classList.remove('hidden'));onTap('helpBack',()=>{eatNextClick();$('helpScreen').classList.add('hidden');});
function hurt(n){if(game.state!=='play')return;n*=(EQ.armor?.75:1)*(1-ST42.a/100);player.hp-=n;player.lastHit=game.time;const d=$('dmg');d.style.opacity=1;setTimeout(()=>d.style.opacity=0,200);play('hurt');fx.shake+=.9;fx.recoilP-=.03;
  if(SET.vib&&navigator.vibrate)try{navigator.vibrate(70);}catch(e){}updateHUD();if(player.hp<=0){player.hp=0;updateHUD();gameOver();}}

// ---------- zombies AI + procedural animation ----------
const _tgt=new T.Vector3();
function poseWalk(z,t,amp){const V=z.V,ph=z.phase,s=Math.sin(ph),c=Math.cos(ph);
  if(V.name==='runner'){z.hipL.rotation.x=s*.95*amp;z.hipR.rotation.x=-s*.95*amp;z.kneeL.rotation.x=.25+Math.max(0,c)*1.4*amp;z.kneeR.rotation.x=.25+Math.max(0,-c)*1.4*amp;
    z.hips.position.y=.9+Math.abs(c)*.08*amp;z.hips.rotation.y=s*.15;z.spine.rotation.set(.5+Math.sin(ph*2)*.05,-s*.2,0);
    z.shL.rotation.set(-s*1.1-.5,0,.15);z.shR.rotation.set(s*1.1-.5,0,-.15);z.elL.rotation.x=-1.3;z.elR.rotation.x=-1.3;z.neck.rotation.set(-.55+Math.sin(ph*2)*.08,0,Math.sin(t*3+z.seed)*.15);}
  else{const big=V.heavy,a=(big?.38:.5)*amp,limp=z.limp;
    z.hipL.rotation.x=s*a*(1-limp);z.hipR.rotation.x=-s*a;z.kneeL.rotation.x=.12+Math.max(0,c)*.75*amp*(1-limp*.6);z.kneeR.rotation.x=.12+Math.max(0,-c)*.75*amp;
    z.hips.position.y=.94-limp*.04+Math.abs(c)*.045*amp;z.hips.rotation.set(0,s*.1,s*(big?.12:.07)+limp*.06);
    z.spine.rotation.set((big?.18:.3)+Math.sin(ph*2)*.04,s*.08,-s*.08-limp*.12);
    const reach=big?-.95:-1.35;z.shL.rotation.set(reach+Math.sin(ph+.5)*.13,0,.1+Math.sin(t*1.3+z.seed)*.08);z.shR.rotation.set(reach+.12-Math.sin(ph+.5)*.13,0,-.1);
    z.elL.rotation.x=-.35+Math.sin(ph*1.3)*.12;z.elR.rotation.x=-.22+Math.sin(ph*1.1+1)*.1;
    z.neck.rotation.set(-.28+Math.sin(ph*2)*.08,Math.sin(t*.7+z.seed)*.18,Math.sin(ph*.5+z.seed)*.22);}
  z.jaw.rotation.x=.12+Math.max(0,Math.sin(t*2.3+z.seed))*.38;}
function updateZombie(z,dt,t,target,canAttack){const V=z.V,sc=V.scale;
  if(z.flash>0){z.flash-=dt;z.mat.emissive.setHex(z.flash>0?0x7a0000:(z.baseEm||0));}
  if(z.dead){updateDead(z,dt);return;}
  if(V.special&&canAttack&&special(z,dt,t,target))return;
  const dx=target.x-z.g.position.x,dz=target.z-z.g.position.z,d=Math.hypot(dx,dz);
  let want=Math.atan2(dx,dz);if(z.sideT>0){z.sideT-=dt;if(z.ai!=='chase')want+=z.side*.4;}
  let dy=want-z.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));if(d<.9*sc+.8&&Math.abs(dy)<.35&&!(z.sideT>0))dy=0;const turnG=z.ai==='chase'?9:(V.name==='runner'?6.4:5.2);z.g.rotation.y+=dy*Math.min(1,dt*turnG);z.turn439=dy;
  z.stag=Math.max(0,z.stag-dt);z.stagHead=Math.max(0,z.stagHead-dt*3);z.cool-=dt;
  if(canAttack){z.groanT-=dt;if(z.groanT<=0){z.groanT=rand(6,12);groan(z,'idle');}}
  if(z.state==='atk'){if(z.crawl){const Wd=.46,S=.22,R=.4;z.atkT+=dt;const at=z.atkT;const bite=at>=Wd&&at<Wd+S;
    z.hips.position.y=.34;z.hips.rotation.set(bite?1.15:1.38,0,(z.gore&&z.gore.legL?.08:0)-(z.gore&&z.gore.legR?.08:0));
    z.spine.rotation.set(bite?-.15:.08,0,0);
    const sh=bite?-1.5:-2.3;
    if(!(z.gore&&z.gore.armL)){z.shL.rotation.set(sh,.05,.25);z.elL.rotation.x=bite?-.15:-1.15;}
    if(!(z.gore&&z.gore.armR)){z.shR.rotation.set(sh,-.05,-.22);z.elR.rotation.x=bite?-.1:-1.05;}
    if(bite){const f=1.15*dt;z.g.position.x+=Math.sin(z.g.rotation.y)*f;z.g.position.z+=Math.cos(z.g.rotation.y)*f;if(!z.atkHit&&(at-Wd)/S>.45){z.atkHit=true;if(canAttack)zAttackHit(z,d,sc);}}
    if(z.jaw)z.jaw.rotation.x=bite?.75:.28;if(at>=Wd+S+R){z.state='walk';z.cool=.5;}
    collide(z.g.position,.35*sc);keepOut(z,target,canAttack);return;}
  const Wd=V.heavy?.5:.32,S=.18,R=.4;z.atkT+=dt;const at=z.atkT;
    let sp,sh,el;if(at<Wd){const k=at/Wd;sp=lerp(.3,-.25,k);sh=lerp(-1.35,-2.7,k);el=-.7;}
    else if(at<Wd+S){const k=(at-Wd)/S;sp=lerp(-.25,.8,k);sh=lerp(-2.7,-.6,k);el=lerp(-.7,-.1,k);const f=3.2*dt;z.g.position.x+=Math.sin(z.g.rotation.y)*f;z.g.position.z+=Math.cos(z.g.rotation.y)*f;
      if(!z.atkHit&&k>.5){z.atkHit=true;if(canAttack)zAttackHit(z,d,sc);}}
    else{const k=Math.min(1,(at-Wd-S)/R);sp=lerp(.8,.3,k);sh=lerp(-.6,-1.35,k);el=lerp(-.1,-.35,k);}
    z.spine.rotation.set(sp-z.stag*2,0,0);z.shL.rotation.set(sh,0,.15);z.shR.rotation.set(sh,0,-.15);z.elL.rotation.x=el;z.elR.rotation.x=el;z.jaw.rotation.x=.55;
    z.hipL.rotation.x=-.35;z.hipR.rotation.x=.3;z.kneeL.rotation.x=.3;z.kneeR.rotation.x=.45;z.hips.position.y=.9;z.neck.rotation.set(-.4,0,0);
    if(at>=Wd+S+R){z.state='walk';z.cool=.25;}
    collide(z.g.position,.35*sc);keepOut(z,target,canAttack);return;}
  const stopD=.9*sc+.35;let moved=0;if(d<=stopD)z.halt4310=1;else if(d>stopD+.3)z.halt4310=0;
  if(d>stopD&&!z.halt4310){const sp=z.speed*(z.stag>0?.15:1)*(SV.on?(z.spdMul||1):1)*dt;const ox=z.g.position.x,oz=z.g.position.z;
    const head440=z.ai==='chase'?want:z.g.rotation.y;z.g.position.x+=Math.sin(head440)*sp;z.g.position.z+=Math.cos(head440)*sp;
    for(const o of zombies){if(o===z||!o.alive||o.dead)continue;const ex=z.g.position.x-o.g.position.x,ez=z.g.position.z-o.g.position.z,ed=Math.hypot(ex,ez),md=.38*(sc+o.V.scale);if(ed<md&&ed>1e-4){z.g.position.x+=ex/ed*(md-ed)*.5;z.g.position.z+=ez/ed*(md-ed)*.5;}}
    collide(z.g.position,.35*sc);moved=Math.hypot(z.g.position.x-ox,z.g.position.z-oz);
    if(sp>0&&moved<sp*.35){z.stuck+=dt;const need440=z.ai==='chase'?1.15:(zsShow()?.7:(V.heavy||sc>1.2?.7:.35));if(z.stuck>need440&&z.sideT<=0){if(!z.side)z.side=Math.random()<.5?-1:1;z.stuckN=(z.stuckN|0)+1;z.sideLT=t;
      if(z.ai==='chase'){z.sideT=0;z.stuckN=0;const a=want+(z.side||1)*.85,sx=z.g.position.x+Math.sin(a)*1.4,sz=z.g.position.z+Math.cos(a)*1.4;if(freeSpot(sx,sz,.45))z.via433={x:sx,z:sz,until:t+.55};}
      else if(z.stuckN>=2){z.stuckN=0;z.sideT=0;const a=z.g.rotation.y+z.side*1.15;z.via433={x:z.g.position.x+Math.sin(a)*4,z:z.g.position.z+Math.cos(a)*4,until:t+2.4};}
      else{z.sideT=(V.heavy||sc>1.2)?2.4:1.8;}z.stuck=0;}}else{z.stuck=Math.max(0,z.stuck-dt);if(moved>sp*.8)z.stuckN=0;}
    z.phase+=dt*(V.name==='runner'?z.speed*2.4:z.speed*3.1)*(z.stag>0?.3:1);poseWalk(z,t,1);}
  else{z.phase+=dt*1.5;poseWalk(z,t,.25);if(canAttack&&z.cool<=0&&(!SV.on||z.tgtKind!=='point')){z.state='atk';z.atkT=0;z.atkHit=false;groan(z,'atk');}}
  if(((d<V.reach*sc&&(!SV.on||z.tgtKind!=='point'))||pieceNear(z))&&canAttack&&z.cool<=0&&z.state!=='atk'){z.state='atk';z.atkT=0;z.atkHit=false;groan(z,'atk');}
  // hit reaction stagger
  if(z.stag>0){const k=z.stag/.3;z.spine.rotation.x-=k*.85;z.shL.rotation.x+=k*.9;z.shR.rotation.x+=k*.7;z.shL.rotation.z+=k*.5;z.shR.rotation.z-=k*.5;}
  if(z.stagHead>0)z.neck.rotation.x-=z.stagHead*1.1;
  keepOut(z,target,canAttack);}
function keepOut(z,target,on){if(!on)return;const ex=z.g.position.x-target.x,ez=z.g.position.z-target.z,ed=Math.hypot(ex,ez),md=player.r+.75*z.V.scale;if(ed<md&&ed>1e-4){z.g.position.x=target.x+ex/ed*md;z.g.position.z=target.z+ez/ed*md;}}
function updateDead(z,dt){if(z.V.name==='bloater'){z.deadT+=dt;if(!z.boomed&&z.deadT>.1)bloaterBoom(z);return;}z.deadT+=dt;const k=z.deadT;
  z.kneeL.rotation.x=damp(z.kneeL.rotation.x,k<.3?1.1:.25,8,dt);z.kneeR.rotation.x=damp(z.kneeR.rotation.x,k<.3?.9:.15,8,dt);z.hips.position.y=damp(z.hips.position.y,k<.3?.75:.9,6,dt);
  z.hipL.rotation.x=damp(z.hipL.rotation.x,z.fdir*-.3,5,dt);z.hipR.rotation.x=damp(z.hipR.rotation.x,z.fdir*-.1,5,dt);
  if(k>.12){z.fv+=(6.5*Math.sin(z.fa+.25)+1)*dt;z.fa+=z.fv*dt;if(z.fa>=1.5){z.fa=1.5;if(z.fv>.7){z.fv=-z.fv*.22;}else z.fv=0;
    if(!z.landed){z.landed=true;_tmp.set(z.g.position.x+Math.sin(z.g.rotation.y)*z.fdir*1.1*z.V.scale,.05,z.g.position.z+Math.cos(z.g.rotation.y)*z.fdir*1.1*z.V.scale);
      emit(_tmp,_up,10,DUST,{speed:1.6,spread:1,life:.7,size:.12,grav:1});_n.set(0,1,0);_tmp.y=.006;addDecal(bloods,_tmp,_n,1.1*z.V.scale);fx.shake+=z.V.heavy?.5:.05;}}}
  z.body.rotation.x=z.fa*z.fdir;z.body.position.y=(z.fa/1.5)*.14;
  z.spine.rotation.x=damp(z.spine.rotation.x,z.fdir*.25,5,dt);z.shL.rotation.x=damp(z.shL.rotation.x,z.flop[0],6,dt);z.shR.rotation.x=damp(z.shR.rotation.x,z.flop[1],5,dt);
  z.shL.rotation.z=damp(z.shL.rotation.z,.6,4,dt);z.shR.rotation.z=damp(z.shR.rotation.z,-.6,4,dt);z.elL.rotation.x=damp(z.elL.rotation.x,z.flop[2],6,dt);z.elR.rotation.x=damp(z.elR.rotation.x,z.flop[3],6,dt);
  z.neck.rotation.x=damp(z.neck.rotation.x,-z.fdir*.6,7,dt);z.neck.rotation.z=damp(z.neck.rotation.z,z.flop[4],5,dt);z.jaw.rotation.x=damp(z.jaw.rotation.x,.55,6,dt);
  z.g.position.addScaledVector(z.sv,dt);z.sv.multiplyScalar(Math.exp(-4*dt));collide(z.g.position,.3);
  if(k>4){z.body.position.y-=(k-4)*.5;blobMat.opacity=.42;z.blob.visible=false;}
  if(k>5.5){z.alive=false;z.g.visible=false;updateHUD();}}

// ---------- menu showcase zombies ----------
function menuZombies(){let i=0;for(const v of ['normal','runner','tank','normal']){const z=zombies.find(q=>!q.alive&&q.V.name===v);if(!z)continue;
  Object.assign(z,{alive:true,dead:false,hp:1,speed:v==='runner'?2.6:v==='tank'?1:1.3,state:'walk',stag:0,stagHead:0,flash:0,cool:0,groanT:9,phase:i,stuck:0,side:0,sideT:0,limp:v==='normal'?.4:0,menuA:i*1.6});
  z.g.position.set(Math.cos(i*1.6)*7,0,Math.sin(i*1.6)*7);resetPose(z);z.g.visible=true;z.blob.visible=true;i++;}}

// ---------- main update ----------
const _mv=new T.Vector3();
function update(dt){if(window.__arena454&&__arena454.tick(dt))return;game.time+=dt;const t=game.time;
  // --- movement with inertia + analog joystick ---
  let mx=0,mz=0;if(keys.KeyW||keys.ArrowUp)mz-=1;if(keys.KeyS||keys.ArrowDown)mz+=1;if(keys.KeyA||keys.ArrowLeft)mx-=1;if(keys.KeyD||keys.ArrowRight)mx+=1;
  const kl=Math.hypot(mx,mz);if(kl>1){mx/=kl;mz/=kl;}
  const J4=joy4310(dt);let jm=J4.m;if(J4.on){const k=Math.pow(Math.max(0,Math.min(1,jm)-.12)/.88,1.25)/Math.max(jm,1e-4);mx+=J4.x*k;mz+=J4.y*k;}
  const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml;}
  const sprint=keys.ShiftLeft||keys.ShiftRight||jm>.96;const maxSp=(sprint?6.6:4.4)*(EQ.boots?1.12:1)*(1+ST42.sp/100)*(fx.spin>0?.7:1)*(ADS.k>.5?.6:1)*(SV.build?.85:1);
  const sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
  _mv.set((mx*cy+mz*sy)*maxSp,0,(-mx*sy+mz*cy)*maxSp);
  const accel=_mv.lengthSq()>player.vel.lengthSq()?(zsShow()?15:11):(zsShow()?11:8.5);player.vel.x=damp(player.vel.x,_mv.x,accel,dt);player.vel.z=damp(player.vel.z,_mv.z,accel,dt);
  const _px=player.pos.x,_pz=player.pos.z;player.pos.addScaledVector(player.vel,dt);collide(player.pos,player.r);
  if(dt>1e-4){const vx=(player.pos.x-_px)/dt,vz=(player.pos.z-_pz)/dt;if(player.vel.x*vx<0)player.vel.x=0;else if(Math.abs(vx)<Math.abs(player.vel.x))player.vel.x=vx;if(player.vel.z*vz<0)player.vel.z=0;else if(Math.abs(vz)<Math.abs(player.vel.z))player.vel.z=vz;}
  const spd=Math.hypot(player.vel.x,player.vel.z);player.moveAmt=clamp(spd/4.4,0,1.5);player.bob+=dt*spd*2.1;
  // --- smoothed look ---
  const lk=zsShow()?34:(isTouch?22:35);player.yaw=damp(player.yaw,player.tYaw,lk,dt);player.pitch=damp(player.pitch,player.tPitch,lk,dt);
  fx.recoilP=damp(fx.recoilP,0,fireCd>0.03?7:16,dt);fx.bloom=Math.max(0,(fx.bloom||0)-dt*(fireCd>0.03?.06:.22));fx.shake=Math.max(0,fx.shake-dt*4);const sh=Math.min(1,fx.shake)*fx.shake*.025;
  const bobY=Math.sin(player.bob)*.035*Math.min(1,player.moveAmt),bobX=Math.cos(player.bob*.5)*.02*Math.min(1,player.moveAmt);
  camera.position.set(player.pos.x+bobX*cy,1.62+bobY+CAMY43,player.pos.z-bobX*sy);
  let shx=rand(-1,1)*sh,shy=rand(-1,1)*sh,shz=rand(-1,1)*sh*.5;if(zsShow()){fx.shX=damp(fx.shX||0,shx,14,dt);fx.shY=damp(fx.shY||0,shy,14,dt);fx.shZ=damp(fx.shZ||0,shz,14,dt);shx=fx.shX;shy=fx.shY;shz=fx.shZ;}camera.rotation.set(player.pitch+fx.recoilP+shy,player.yaw+shx,Math.sin(player.bob*.5)*.006*player.moveAmt+shz);
  // --- weapon ---
  const w=WEAPONS[curW];fireCd-=dt;
  if(firing&&fireCd<=0&&fx.reload<0&&fx.swap<.3){if(w.auto||w.melee||!triggerHeld||isTouch){fire();triggerHeld=true;}}
  if(fx.reload>=0){fx.reload+=dt;$('rlFill').style.width=Math.min(100,fx.reload/fx.reloadDur*100)+'%';if(fx.reload>=fx.reloadDur)finishReload();}
  updateViewmodel(dt,w);
  muzzleLight.intensity=Math.max(0,muzzleLight.intensity-dt*200);vmFlash.intensity=Math.max(0,vmFlash.intensity-dt*50);
  // --- pickups ---
  let near=null;for(const p of pickups){
    if(p.fly>0){p.fly+=dt;const k=Math.min(1,p.fly/.35);_tmp.set(camera.position.x-p.x,camera.position.y-.35,camera.position.z-p.z);p.item.position.set(_tmp.x*k*k,lerp(.6,_tmp.y,k*k),_tmp.z*k*k);p.item.scale.setScalar(1-k*.85);p.ring.material.opacity=.35*(1-k);
      if(k>=1){p.fly=0;p.root.visible=false;}continue;}
    if(p.active){p.item.rotation.y+=dt*1.6;p.item.position.y=.6+Math.sin(t*2.5+p.x)*.1;const d=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);
      const inR=d<3.2;p.ring.material.opacity=inR?.45+Math.sin(t*9)*.3:.22;const rs2=inR?1.15+Math.sin(t*9)*.12:1;p.ring.scale.set(rs2,1,rs2);p.item.scale.setScalar(inR?1.12+Math.sin(t*9)*.06:1);
      if(d<(EQ.magnet?2.6:1.25))collect(p);else if(inR)near=p;}
    else if(!p.root.visible||p.fly===0){p.timer-=dt;if(p.timer<=0)placePickup(p);}}
  const nr=near||(SV.on&&svNearObj);$('pickHint').style.opacity=nr?1:0;$('pickBtn').classList.toggle('ready',!!nr);
  if(SV.on)svWaves(dt);else waveUpdate(dt);
  ai432Tick();expose433();for(const z of zombies)if(z.alive)updateZombie(z,dt,t,SV.on?svTarget433(z):player.pos,true);
  updateExtras(dt,t);upd4(dt,t);try{tick42(dt,t);}catch(e){if(!window.__t42e){window.__t42e=1;console.error(e);}}
  if(t-player.lastHit>6&&player.hp<player.maxHp&&player.hp>0){player.hp=Math.min(player.maxHp,player.hp+dt*2.5);if(((t*10)|0)%5==0)updateHUD();}}
function updateViewmodel(dt,w){const vm=VM[w.id];if(!vm)return;const b=vm.userData.base,r=vm.userData.rot;
  fx.vmKick=damp(fx.vmKick,0,14,dt);fx.swap=Math.max(0,fx.swap-dt*3.5);fx.slash=Math.max(0,fx.slash-dt*3.2);
  const dyaw=player.yaw-fx.lastYaw,dp=player.pitch-fx.lastPitch;fx.lastYaw=player.yaw;fx.lastPitch=player.pitch;
  fx.swayY=damp(fx.swayY,clamp(dyaw*2.5,-.15,.15),10,dt);fx.swayX=damp(fx.swayX,clamp(dp*2.5,-.12,.12),10,dt);
  const m=Math.min(1,player.moveAmt);const bx=Math.cos(player.bob*.5)*.014*m,by=-Math.abs(Math.sin(player.bob*.5))*.012*m;
  let rl=0;if(fx.reload>=0)rl=Math.sin(Math.min(1,fx.reload/fx.reloadDur)*Math.PI);
  const sw=fx.swap;
  vmRoot.position.set(b[0]+bx-fx.swayY*.15,b[1]+by-fx.vmKick*.012-rl*.12-sw*.3+fx.swayX*.1,b[2]+fx.vmKick*.065);
  if(vmCam.aspect>1.35)vmRoot.position.y+=Math.min(.1,(vmCam.aspect-1.15)*.07);
  vmRoot.rotation.set(r[0]+fx.vmKick*.16-rl*.7+fx.swayX,r[1]+fx.swayY,r[2]+rl*.6);
  if(w.tool&&fx.slash>0){const k=1-fx.slash,a=k<.3?k/.3*.85:k<.55?.85-(k-.3)/.25*2.3:-1.45*(1-(k-.55)/.45);vmRoot.rotation.x+=a;vmRoot.rotation.z-=a*.15;vmRoot.position.y+=a*.07;vmRoot.position.z-=Math.max(0,-a)*.12;}
  else if(w.melee&&fx.slash>0){const k=1-fx.slash,s=Math.sin(k*Math.PI);vmRoot.rotation.y+=s*1.1-0.2;vmRoot.rotation.x-=s*.5;vmRoot.position.x-=s*.18;vmRoot.position.z-=s*.12;}
  const fl=vm.userData.flash;if(fl){fl.userData.t=(fl.userData.t||0)-dt;fl.material.opacity=fl.userData.t>0?1:Math.max(0,fl.material.opacity-dt*30);}
  if(vm.userData.pump){if(fx.pumpT>=0){fx.pumpT+=dt;const k=clamp((fx.pumpT-.32)/.3,0,1);vm.userData.pump.position.z=-.3+Math.sin(k*Math.PI)*.09;if(k>=1)fx.pumpT=-1;}}
  if(vm.userData.coils){const pulse=.6+.4*Math.sin(game.time*8);vm.userData.coils.forEach((c,i)=>c.rotation.z+=dt*(2+i));if(vm.userData.glow)vm.userData.glow.color.setRGB(pulse,.55*pulse,.18*pulse);else laserGlow.color.setRGB(.15*pulse,pulse,.9*pulse+.1);}}

// ---------- environment animation ----------
function updateEnv(dt,t){for(const L of lamps){let k=1;if(L.flick){L.t-=dt;if(L.t<=0){L.t=rand(.03,.25);L.off=Math.random()<.22?rand(0,.3):rand(.85,1.05);}k=L.off;}else k=.95+Math.sin(t*13)*.03;
  L.L.intensity=L.base*k*(L.mul||1);L.halo.material.opacity=k;L.bulbMat.color.setRGB(k,k*.83,k*.55);}
  const SM=window.SMOKE20;if(SM)for(let i=0;i<SM.length;i++){const s=SM[i];s.position.y=s.userData.y0+Math.sin(t*.7+i)*.22;s.material.opacity=.16+.08*Math.sin(t*1.1+i);}}

