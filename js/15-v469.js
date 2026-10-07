/* Zombie Survival — game code part 15-v469 (game.html lines 7719-7774 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.69: fluidita, torcia, monete, urla =======================
const M469={on:true,err:0,log:[]};window.__m469=M469;
function e469(e,w){M469.err++;try{if(window.__DBG)__DBG.prob('warn','m469'+(w||''),String(e&&e.message||e).slice(0,200));}catch(_){}if(M469.err>8)M469.on=false;}
// ---------- 1a) warm every hidden pooled object behind the match loader ----------
const AMLAB469=[];try{for(const id in AM467)AMLAB469.push(amLab467(id));}catch(e){}
function warmFx469(){const t0=performance.now(),p0=renderer.info.programs.length,sv=[];
  try{scene.traverse(o=>{if(o===scene)return;if(!o.visible){sv.push([o,0,o.visible]);o.visible=true;}if((o.isMesh||o.isPoints||o.isLine||o.isSprite)&&o.frustumCulled){sv.push([o,1,true]);o.frustumCulled=false;}});
    let dr=null;try{dr=rG467.drawRange.count;rG467.setDrawRange(0,40);}catch(e){}
    renderer.compile(scene,camera);
    try{if(renderer.initTexture){for(const t of AMLAB469)renderer.initTexture(t);for(const t of [cookie468,mistTex467,softTex466,fogTex466])if(t)renderer.initTexture(t);}}catch(e){}
    const rt=warmFx469.rt||(warmFx469.rt=new T.WebGLRenderTarget(4,4));rt.texture.colorSpace=renderer.outputColorSpace;
    renderer.shadowMap.needsUpdate=true;renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);
    try{if(dr!==null)rG467.setDrawRange(0,dr);}catch(e){}
  }catch(e){e469(e,'warm');}
  finally{for(let i=sv.length-1;i>=0;i--){const [o,k,v]=sv[i];if(k)o.frustumCulled=v;else o.visible=v;}renderer.shadowMap.needsUpdate=true;}
  const r=[Math.round(performance.now()-t0),renderer.info.programs.length-p0];M469.log.push(['warmFx',r[0],r[1]]);try{plog424('warm fx469',r[0]+'ms','newProg='+r[1]);}catch(e){}return r;}
{const _lfs=ld431Frames;ld431Frames=function(){const L=_lfs();try{const i=L.findIndex(x=>x.k==='end');L.splice(i<0?L.length:i,0,{k:'fx469'});}catch(e){}return L;};}
{const _lf=LD431.frame;LD431.frame=function(now){try{const F=LD431.fr;if(F&&F[LD431.fi]&&F[LD431.fi].k==='fx469'){LD431.fi++;warmFx469();ld431Set(.1+.88*Math.min(1,LD431.fi/F.length),'Preparo gli effetti…');return;}}catch(e){e469(e,'lf');}return _lf.apply(this,arguments);};}
// ---------- 1b) shop thumbnails never render during play ----------
const TH469={want:false};
{const _t=thumbs43;thumbs43=function(){try{if(M469.on&&game.state!=='menu'&&game.state!=='bag468'&&$('shopScreen').classList.contains('hidden')&&!(typeof pre43==='function'&&pre43())){TH469.want=true;return;}}catch(e){}TH469.want=false;return _t();};}
{const _os=openShop;openShop=function(){const r=_os.apply(this,arguments);try{if(TH469.want){TH469.want=false;thumbs43();}}catch(e){}return r;};}
// ---------- 1c) fewer audio automation events + DOM writes ----------
{const _rs=rainSnd467;let lastT=-1,acc=0;rainSnd467=function(k){try{const c=AU.ctx;if(!c||!AU.noise||!AU.master)return;if(!RAIN467.snd)return _rs(k);if(RAIN467.snd===1)return;const tgt=SET.mute?0:k*.075;if(Math.abs(tgt-lastT)<.004&&!(tgt===0&&lastT!==0))return;lastT=tgt;const g=RAIN467.g.gain;g.cancelScheduledValues(c.currentTime);g.setTargetAtTime(tgt,c.currentTime,.4);}catch(e){e469(e,'rs');}};}
{const _at=ambTick468;let acc=0;ambTick468=function(dt,play){acc+=dt;if(acc<.5&&AMB468.w)return;const a=acc;acc=0;_at(a,play);};}
// ---------- 1d) CPU per frame: static city matrices + lighter shadow refresh on Media ----------
function freeze469(){try{const C=window.CITY4319;if(!C||!C.root||C.root.__f469)return 0;C.root.__f469=1;let n=0;C.root.updateMatrixWorld(true);
  C.root.traverse(o=>{if(o===C.root||o.isLight||o.isPoints||(o.parent&&o.parent.isLight))return;if(o.type==='Object3D'&&o.parent&&o.parent.isSpotLight)return;if(o.matrixAutoUpdate){o.matrixAutoUpdate=false;n++;}});
  for(const L of (C.dynamicLights||[])){L.matrixAutoUpdate=true;if(L.target)L.target.matrixAutoUpdate=true;}M469.frozen=n;return n;}catch(e){e469(e,'frz');return 0;}}
{const _st=shadowTick43;let f=0;shadowTick43=function(){if(M469.on&&GQ()==='media'){f++;if(f%2)return;}return _st();};}
// ---------- 2) torch button: never over HUD controls / loader ----------
function torchPlace469(){const b=TOR468.el;if(!b)return;try{const W=innerWidth,H=innerHeight,s=Math.max(38,Math.min(48,Math.round(H*.12)));b.style.width=b.style.height=s+'px';b.style.right='auto';
  const R=[];document.querySelectorAll('#hud button,#hud [id$="Btn"],#wbar,#topRight,#radar,#weaponInfo,#hud42,#quest42,#buffs,#joy,#joyBase,#stick,#gift415,[id$="415"],[id$="466"],[id$="467"],[id$="468"]:not(#torch468):not(#ov468),#mm466,#minimap').forEach(e=>{if(e===b)return;const r=e.getBoundingClientRect();if(r.width>2&&r.height>2&&r.width<W*.4&&r.height<H*.5&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none')R.push(r);});
  const free=(x,y)=>{if(x<4||y<4||x+s>W-4||y+s>H-4)return false;for(const r of R)if(x<r.right+8&&x+s>r.left-8&&y<r.bottom+8&&y+s>r.top-8)return false;return true;};
  const sar=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sar'))||0;let best=null;
  for(let y=Math.round(H*.16);y<H*.62&&!best;y+=6)for(const dx of [10,64,118]){const x=W-sar-dx-s;if(free(x,y)){best=[x,y];break;}}
  if(!best)for(let y=Math.round(H*.12);y<H-s&&!best;y+=6)for(let x=Math.round(W*.55);x<W-s;x+=8)if(free(x,y)){best=[x,y];break;}
  if(best){b.style.left=best[0]+'px';b.style.top=best[1]+'px';}TOR468.pos=best;}catch(e){e469(e,'tp');}}
addEventListener('resize',()=>setTimeout(torchPlace469,250));addEventListener('orientationchange',()=>setTimeout(torchPlace469,400));
{const st=document.createElement('style');st.textContent='body.ld469 #torch468{display:none!important}#torch468{position:fixed!important}';document.head.appendChild(st);}
// ---------- 4) distant screams ----------
const SCR469={next:40+Math.random()*40};
function scream469(){const c=AU.ctx;if(!c||SET.mute||!AU.master||(AU.v433|0)>=16)return false;const t=c.currentTime,d=rand(1.0,2.0),dist=rand(.4,1),fem=Math.random()<.55;
  const o=c.createOscillator();o.type='sawtooth';const f0=fem?rand(520,760):rand(300,460);o.frequency.setValueAtTime(f0*.8,t);o.frequency.linearRampToValueAtTime(f0*rand(1.15,1.45),t+d*.25);o.frequency.linearRampToValueAtTime(f0*rand(.9,1.1),t+d*.7);o.frequency.exponentialRampToValueAtTime(f0*.55,t+d);
  const lfo=c.createOscillator();lfo.frequency.value=rand(5,8);const lg=c.createGain();lg.gain.value=f0*.035;lfo.connect(lg).connect(o.frequency);
  const f1=c.createBiquadFilter();f1.type='bandpass';f1.frequency.value=fem?rand(900,1200):rand(650,850);f1.Q.value=4;const f2=c.createBiquadFilter();f2.type='bandpass';f2.frequency.value=fem?rand(2200,2900):rand(1600,2200);f2.Q.value=6;
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200-dist*2200;const g=c.createGain();const v=.11*(1.2-dist);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.12);g.gain.setValueAtTime(v,t+d*.7);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  const mix=c.createGain();o.connect(f1).connect(mix);o.connect(f2).connect(mix);mix.connect(lp).connect(g);
  let out=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=rand(-.9,.9);g.connect(p);out=p;}out.connect(AU.revIn||AU.master);if(AU.revIn&&Math.random()<.6)out.connect(AU.master);
  AU.v433=(AU.v433|0)+1;o.onended=()=>{AU.v433--;try{mix.disconnect();g.disconnect();}catch(e){}};o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);
  try{nz(t,d*.6,.02*(1.2-dist),'highpass',2500,1800,.7,AU.revIn||AU.master);}catch(e){}return true;}
function scrTick469(dt,play){if(!play)return;SCR469.next-=dt;if(SCR469.next>0)return;const p=SV.phase;SCR469.next=p==='night'?rand(25,60):p==='dusk'?rand(45,90):rand(110,220);try{scream469();}catch(e){e469(e,'scr');}}
// ---------- per-frame ----------
{const _l0=loop0;let l9=0,tp=0,wasLd=null,fr=false;loop0=function(now){try{if(M469.on){const dt=l9?Math.min(.1,(now-l9)/1000):0;l9=now;const ld=!!(LD431.on||LD431.hold);if(ld!==wasLd){wasLd=ld;document.body.classList.toggle('ld469',ld);if(!ld)setTimeout(torchPlace469,120);}
  const play=game.state==='play'&&SV.on&&!arenaOn468();if(play&&!ld){if(!fr){fr=true;freeze469();}tp-=dt;if(tp<=0){tp=4;torchPlace469();}}scrTick469(dt,play&&!ld);}}catch(e){e469(e,'tick');}return _l0(now);};}
window.__zs469={warm:()=>warmFx469(),freeze:()=>freeze469(),place:()=>{torchPlace469();return TOR468.pos;},scream:()=>scream469(),thWant:()=>TH469.want,get m(){return M469;}};
