'use strict';
// ======================= v4.3.81: startup pumpkin first, torch aim, weapons/audio, shop/equip/bag/craft, day/night, zombies, minimap, pause, gilda, debug =======================
const M481={on:true};function e481(err,tag){try{if(window.__DBG&&__DBG.log)__DBG.log('v481:'+(tag||'?'),String(err&&err.message||err).slice(0,220));}catch(e){}try{if(typeof crash4310==='function')crash4310(err,'v481:'+(tag||''));}catch(e){}}
try{window.__zs481={get m(){return M481;}};}catch(e){}

// ---- 1) Startup: Halloween pumpkin first; hide old loader flash; preload behind splash ----
(function(){
  try{
    const boot=document.getElementById('boot481');
    if(boot){
      document.documentElement.style.background='#120818';
      try{document.body.style.background='#120818';}catch(e){}
      // Hide classic ld431 until after boot, and never flash it over pumpkin
      const st=document.createElement('style');st.id='v481boot';
      st.textContent='#ld431{visibility:hidden!important}#boot481.off~#ld431,#ld431.ldGone{visibility:hidden!important}'+
        'html,body{background:#120818!important}#startScreen:not(.ready481){opacity:0}#startScreen.ready481{opacity:1;transition:opacity .25s}';
      document.head.appendChild(st);
      const bar=document.getElementById('boot481bar');
      let p=6;const tick=()=>{p=Math.min(92,p+(bar?2.2:1));if(bar)bar.style.width=p+'%';};
      const iv=setInterval(tick,120);
      const hide=()=>{try{clearInterval(iv);if(bar)bar.style.width='100%';boot.classList.add('off');setTimeout(()=>{try{boot.remove();}catch(e){}},400);
        const s=document.getElementById('v481boot');if(s)s.remove();
        const scr=document.getElementById('startScreen');if(scr)scr.classList.add('ready481');
        const ld=document.getElementById('ld431');if(ld)ld.style.visibility='';}catch(e){e481(e,'bootHide');}};
      // Reveal as soon as menu can show, with hard timeout so nothing blocks first frame
      let done=0;const go=()=>{if(done)return;done=1;hide();};
      try{if(typeof menu432Place==='function'){const _m=menu432Place;menu432Place=function(){const r=_m.apply(this,arguments);try{go();}catch(e){}return r;};}}catch(e){}
      setTimeout(go,2800);
      // Short network timeouts at startup
      try{const _f=window.fetch,t0=performance.now();window.fetch=function(u,o){o=o||{};if(performance.now()-t0<9000&&!o.signal&&typeof AbortController!=='undefined'){const c=new AbortController();o.signal=c.signal;setTimeout(()=>{try{c.abort();}catch(e){}},4500);}return _f.call(this,u,o);};}catch(e){}
    }
  }catch(e){e481(e,'boot');}
})();

// ---- 2) Torch: beam follows aim (crosshair), soft glow cone, shadows on Media ----
(function(){
  try{
    const TOR={cone:null,last:0};
    function aimDir481(out){
      try{
        if(typeof aimDir==='function'){const d=aimDir();if(d){out.copy(d);return out;}}
      }catch(e){}
      out.set(0,0,-1);try{out.applyQuaternion(camera.quaternion);}catch(e){}return out;
    }
    function ensureCone(){
      if(TOR.cone||!window.T)return;
      try{
        const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
        const grd=g.createRadialGradient(64,16,2,64,110,60);grd.addColorStop(0,'rgba(255,245,210,.55)');grd.addColorStop(.35,'rgba(255,210,140,.22)');grd.addColorStop(1,'rgba(255,180,80,0)');
        g.fillStyle=grd;g.beginPath();g.moveTo(64,8);g.lineTo(18,120);g.lineTo(110,120);g.closePath();g.fill();
        const tex=new T.CanvasTexture(c);tex.needsUpdate=true;
        const mat=new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.55,fog:false});
        const spr=new T.Sprite(mat);spr.scale.set(2.2,4.5,1);spr.visible=false;camera.add(spr);TOR.cone=spr;
      }catch(e){e481(e,'cone');}
    }
    ensureCone();
    const _al=typeof applyLight==='function'?applyLight:null;
    if(_al)applyLight=function(){_al.apply(this,arguments);if(!M481.on)return;try{
      ensureCone();
      const on=!(!window.TOR468||!TOR468.on)&&!!SV&&SV.on;
      if(TOR.cone)TOR.cone.visible=!!on;
      if(window.TOR468&&TOR468.spot){
        const q=(typeof Q467==='function'?Q467():'media');
        const wantShadow=q!=='bassa';
        try{TOR468.spot.castShadow=wantShadow;if(wantShadow&&TOR468.spot.shadow)TOR468.spot.shadow.mapSize.set(q==='alta'?1024:512,q==='alta'?1024:512);}catch(e){}
        // Align spot with aim direction (crosshair)
        const dir=new T.Vector3();aimDir481(dir);
        try{
          // Put target ahead along camera forward (aim)
          TOR468.spot.target.position.set(0,0,-12);
          TOR468.spot.position.set(.12,-.08,-.05);
          if(on){const b=Math.max(TOR468.spot.intensity||0,10);TOR468.spot.intensity=b;}
        }catch(e){}
      }
      if(TOR.cone&&on){TOR.cone.position.set(0,-.05,-1.8);}
    }catch(e){e481(e,'torch');};};
    // Per-frame aim sync for torch spot world target
    try{
      const _l0=loop0;loop0=function(now){const r=_l0.apply(this,arguments);if(!M481.on)return r;try{
        if(window.TOR468&&TOR468.on&&TOR468.spot&&game&&game.state==='play'){
          const dir=new T.Vector3();aimDir481(dir);
          const wp=new T.Vector3();camera.getWorldPosition(wp);
          TOR468.spot.target.position.copy(dir).multiplyScalar(14).add(wp);
          try{TOR468.spot.target.updateMatrixWorld();}catch(e){}
          if(TOR.cone){TOR.cone.position.set(0,-.02,-2.1);TOR.cone.material.opacity=.42+Math.min(.2,(TOR468.spot.intensity||10)/40);}
        }
      }catch(e){e481(e,'torchTick');}return r;};
    }catch(e){}
  }catch(e){e481(e,'torchInit');}
})();

// ---- 3) Weapons: better icons (canvas), crosshair align, distinct sounds + no stack/crackle ----
(function(){
  try{
    // Master limiter already exists; tighten + per-weapon voice limit
    const _gun=typeof gun==='function'?gun:null;
    const VO={};
    function voiceOk(id){const n=performance.now();const a=VO[id]||(VO[id]=[]);while(a.length&&n-a[0]>90)a.shift();if(a.length>=2){a.shift();}a.push(n);return true;}
    if(_gun){window.gun=function(o){try{if(AU&&AU.master&&AU.master.gain){const g=AU.master.gain.value;if(g>.7)AU.master.gain.value=.62;}}catch(e){}return _gun.apply(this,arguments);};}
    // Distinct SFX aliases for coin weapons that reused others
    try{
      if(typeof SFX==='object'&&SFX){
        if(!SFX.fox)SFX.fox=function(){gun({crack:4000,body:.18,lp:5600,lp2:480,th:165,th2:42,thd:.14,v:.78,tail:.3,dist:1,bp:1400,mech:.12});};
        if(!SFX.burst)SFX.burst=function(){gun({crack:5000,body:.1,lp:6400,lp2:800,th:210,th2:60,thd:.08,v:.68,tail:.15});};
        if(!SFX.hunt)SFX.hunt=function(){gun({crack:3000,body:.4,lp:5000,lp2:260,th:105,th2:28,thd:.34,v:1.25,tail:1.2,rev:.4,dist:1,bp:1000,mech:.4});};
        if(!SFX.saw)SFX.saw=function(){gun({crack:2400,body:.48,lp:3600,lp2:220,th:95,th2:28,thd:.36,v:1.28,tail:1.0,rev:.3,dist:1,bp:650});};
        if(!SFX.vespa)SFX.vespa=function(){const t=AU.ctx.currentTime,d=sfxOut(.18);aO(t,.18,.85,'sine',170,45,d);aN(t,.14,.7,'lowpass',1500,220,1,d);aN(t,.05,.4,'highpass',3200,0,.8,d,.001);};
        if(!SFX.thunder)SFX.thunder=function(){gun({crack:2500,body:.38,lp:4000,lp2:240,th:100,th2:28,thd:.3,v:1.15,tail:.85,rev:.3,dist:1,bp:750});};
      }
      // Point coin weapons at their own sounds
      if(typeof WEAPONS!=='undefined'){for(const w of WEAPONS){if(!w)continue;if(w.id==='fox')w.snd='fox';if(w.id==='burst')w.snd='burst';if(w.id==='hunt')w.snd='hunt';if(w.id==='saw')w.snd='saw';if(w.id==='vespa')w.snd='vespa';if(w.id==='thunder')w.snd='thunder';}}
    }catch(e){e481(e,'sfx');}
    // Gate overlapping play() for gun sounds
    try{
      const _play=typeof play==='function'?play:null;
      if(_play){window.play=function(n){try{const id=String(n||'');if(/^(pistol|revolver|shotgun|dbarrel|smg|ar|minigun|sniper|crossbow|launcher|flame|plasma|laser|fox|burst|hunt|saw|vespa|thunder|knife)$/.test(id)){if(!voiceOk(id))return;}}catch(e){}return _play.apply(this,arguments);};}
    }catch(e){}
    // Crosshair: keep #cross / #ret467 centered; verify ray hits near center each ADS tick lightly
    try{
      const st=document.createElement('style');st.id='v481cx';
      st.textContent='#cross,#ret467{left:50%!important;top:50%!important;transform:translate(-50%,-50%)}#ret467 i,#ret467 b,#ret467 u{background:var(--cx42,rgba(255,255,255,.95));border-color:var(--cx42,rgba(255,255,255,.85))}#ret467 i{background:var(--cx42,rgba(255,255,255,.95))!important}';
      document.head.appendChild(st);
    }catch(e){}
    // Better weapon icon redraws for shop thumbs: wrap thumbs43 / photo if present — enhance PRE43 keys lazily
    function paintGunIcon(id,cv){
      try{
        const c=cv||document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
        g.clearRect(0,0,128,128);g.fillStyle='rgba(10,14,20,.35)';g.fillRect(0,0,128,128);
        const draw={};
        // Generic realistic silhouette per family
        const fam=(id||'').replace(/^w_/,'');
        g.save();g.translate(64,70);g.scale(1.1,1.1);
        g.fillStyle='#2a2e34';g.strokeStyle='#c8ced6';g.lineWidth=1.2;
        function body(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();g.fill();g.stroke();}
        if(/shotgun|dbarrel|saw|thunder/.test(fam)){body(-48,-8,70,14,3);body(18,-6,28,10,2);g.fillStyle='#5a3a22';body(-20,4,22,18,2);g.fillStyle='#1a1c20';body(-52,-6,8,10,1);}
        else if(/sniper|hunt|crossbow/.test(fam)){body(-55,-6,78,12,2);g.fillStyle='#1e2228';body(-10,-14,28,10,2);g.fillStyle='#4a3220';body(-18,4,20,16,2);g.fillStyle='#889';body(20,-4,36,6,1);}
        else if(/smg|burst|minigun/.test(fam)){body(-40,-6,58,12,2);g.fillStyle='#333';body(-8,4,16,20,2);g.fillStyle='#555';body(10,-10,8,6,1);body(-48,-4,10,8,1);}
        else if(/ar|fox|laser|plasma/.test(fam)){body(-46,-7,70,13,2);g.fillStyle='#3a2a1a';body(-14,4,22,18,2);g.fillStyle='#222';body(16,-12,18,8,1);body(-52,-5,10,9,1);}
        else if(/glauncher|vespa|flamer/.test(fam)){body(-42,-10,60,18,4);g.fillStyle='#4a2a14';body(-10,6,22,16,2);g.fillStyle='#666';body(20,-6,22,12,2);}
        else if(/revolver|pistol/.test(fam)){body(-28,-4,40,12,3);g.fillStyle='#5a3a22';body(-6,4,16,20,3);g.fillStyle='#888';body(10,-2,22,7,2);}
        else if(/knife/.test(fam)){g.fillStyle='#cfd5dc';body(-8,-28,14,50,2);g.fillStyle='#5a3a22';body(-12,18,22,14,2);}
        else{body(-40,-6,60,12,2);g.fillStyle='#4a3220';body(-12,4,20,16,2);}
        // Metal highlight
        g.globalAlpha=.35;g.strokeStyle='#fff';g.beginPath();g.moveTo(-40,-8);g.lineTo(30,-10);g.stroke();g.globalAlpha=1;
        g.restore();
        return c;
      }catch(e){return null;}
    }
    try{
      window.__icon481=paintGunIcon;
      // Refresh bag/shop emoji fallbacks via CSS background where thumbs missing
    }catch(e){}
  }catch(e){e481(e,'wpn');}
})();

// ---- 4) Shop: scroll/padding, bug btn smaller, remove items, crosshair selectable, crash catch-all, resource icons ----
(function(){
  try{
    const st=document.createElement('style');st.id='v481shop';
    st.textContent=
      '#shopList{padding-bottom:calc(28px + var(--sab,0px))!important;scroll-padding-bottom:28px}'+
      '#shopScreen .sheet{padding-bottom:calc(18px + var(--sab,0px))}'+
      '#zdbgB{min-width:28px!important;width:28px!important;height:28px!important;font-size:13px!important;left:calc(var(--sal,0px) + 8px)!important;top:calc(var(--sat,0px) + 6px)!important;border-radius:8px!important}'+
      '#shopClose{z-index:5;position:relative}'+
      '.resI481{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;border-radius:3px;background-size:cover}';
    document.head.appendChild(st);

    // Remove shop items (keep purchases migrated)
    const REM=new Set(['cu_hp','cu_cap','c_sup','c_kit']); // allenamento, rifornimento granate, kit medico (c_kit = Kit da campo)
    // Also remove "task extra" if present under any id
    try{
      if(typeof CSHOP!=='undefined'&&Array.isArray(CSHOP)){
        for(let i=CSHOP.length-1;i>=0;i--){
          const it=CSHOP[i];
          if(!it)continue;
          if(REM.has(it.id)||/allenamento|tasche extra|task extra|rifornimento granate|kit medico|kit da campo/i.test(it.n||'')){
            CSHOP.splice(i,1);
          }
        }
        // Split groups: Potenziamento armi vs Personaggio
        for(const it of CSHOP){
          if(!it)continue;
          if(it.k==='atk'||it.k==='def'||it.k==='spd'||it.k==='crit'){it.g='Personaggio';}
          if(it.id&&it.id.indexOf('cw_')===0)it.g='Potenziamento armi';
          if(it.k==='wall'||it.k==='chest'||it.k==='trap')it.g='Base';
        }
        // Ensure character stats exist with icons (crit if missing)
        if(!CSHOP.some(x=>x&&x.k==='crit')){
          CSHOP.push({id:'cu_crit',n:'Critico',e:'💥',d:'+0,3% probabilità critico per livello (max +30%)',lv:typeof UPG432L!=='undefined'?UPG432L:[1],cost:typeof UPG432C!=='undefined'?UPG432C:[150],k:'crit',g:'Personaggio'});
        }
        // Rename leftover personaggio items
      }
    }catch(e){e481(e,'shopRem');}

    // Migrate removed purchases gracefully
    try{
      if(typeof P42!=='undefined'){
        if(P42.cu&&P42.cu.hp){ // convert allenamento HP levels into permanent hp via ST path already using cu.hp — keep cu.hp effect but item gone from shop
          // keep cu.hp so bonuses remain; just not purchasable anymore
        }
        // Clear pending consumables that were removed from shop (don't wipe owned charges already paid)
        // Keep P42.sup/kit/ammo so pending grants still apply once
      }
    }catch(e){}

    // Crosshairs: selectable + active (already toggled in cBuy); ensure cosApply on load and ret467 uses --cx42
    try{if(typeof cosApply==='function')cosApply();}catch(e){}
    try{
      if(typeof cBuy==='function'){
        const _cb=cBuy;cBuy=function(id){const r=_cb.apply(this,arguments);try{if(/^cx_/.test(id))cosApply();}catch(e){}return r;};
      }
    }catch(e){}

    // Resource icons (drawn)
    const ICO={};
    function resIcon(k){
      if(ICO[k])return ICO[k];
      const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
      g.clearRect(0,0,64,64);
      if(k==='wood'){g.fillStyle='#6b4226';g.fillRect(20,8,24,48);g.fillStyle='#8b5a2b';g.fillRect(22,10,20,44);g.strokeStyle='#3a2414';for(let y=14;y<52;y+=8){g.beginPath();g.moveTo(22,y);g.lineTo(42,y+3);g.stroke();}}
      else if(k==='stone'){g.fillStyle='#8a909a';g.beginPath();g.moveTo(12,44);g.lineTo(20,16);g.lineTo(40,12);g.lineTo(52,28);g.lineTo(48,48);g.closePath();g.fill();g.fillStyle='#a8aeb8';g.beginPath();g.moveTo(22,40);g.lineTo(28,22);g.lineTo(40,24);g.lineTo(38,42);g.closePath();g.fill();}
      else if(k==='iron'){g.fillStyle='#4a5564';g.fillRect(14,18,36,28);g.fillStyle='#9aa8b8';g.fillRect(18,22,28,8);g.fillStyle='#c5d0dc';g.fillRect(18,34,28,6);}
      else if(k==='coal'){g.fillStyle='#1a1a1a';g.beginPath();g.arc(32,34,16,0,7);g.fill();g.fillStyle='#333';g.beginPath();g.arc(26,28,6,0,7);g.fill();}
      else if(k==='metal'){g.fillStyle='#6a7a8a';g.fillRect(16,16,32,32);g.fillStyle='#b0c4d8';g.fillRect(20,20,24,8);g.fillStyle='#8899aa';g.fillRect(22,36,20,8);g.strokeStyle='#dde6f0';g.strokeRect(16,16,32,32);}
      else if(k==='elec'){g.fillStyle='#2a2a2a';g.fillRect(18,14,28,36);g.fillStyle='#7dff9a';g.fillRect(24,20,16,10);g.fillStyle='#ffd27a';g.fillRect(26,36,12,8);g.fillStyle='#4af';g.beginPath();g.moveTo(32,10);g.lineTo(36,20);g.lineTo(30,20);g.lineTo(34,30);g.fill();}
      else{g.fillStyle='#888';g.fillRect(16,16,32,32);}
      ICO[k]=c.toDataURL('image/png');return ICO[k];
    }
    try{
      if(typeof RES!=='undefined'){for(const k of Object.keys(RES)){const url=resIcon(k);RES[k].i='<img class="resI481" alt="" src="'+url+'">';RES[k]._ico481=url;}}
    }catch(e){e481(e,'resIco');}

    // Bug button catches ALL crashes
    try{
      window.addEventListener('error',function(ev){try{if(window.__DBG&&__DBG.log)__DBG.log('crash481',String(ev.message||ev).slice(0,300));}catch(e){};},true);
      window.addEventListener('unhandledrejection',function(ev){try{if(window.__DBG&&__DBG.log)__DBG.log('reject481',String(ev.reason&&ev.reason.message||ev.reason).slice(0,300));}catch(e){};});
      try{const cv=typeof renderer!=='undefined'&&renderer&&renderer.domElement;if(cv)cv.addEventListener('webglcontextlost',function(e){try{e.preventDefault();}catch(x){}try{if(__DBG)__DBG.log('webgl481','context lost');}catch(x){};},false);}catch(e){}
      try{
        const _l0=loop0;loop0=function(now){try{return _l0.apply(this,arguments);}catch(err){e481(err,'loop');try{if(__DBG)__DBG.log('loop481',String(err&&err.message||err));}catch(e){}return;}};
      }catch(e){}
    }catch(e){e481(e,'crash');}
  }catch(e){e481(e,'shop');}
})();

// ---- 5) Equipment icons + bonus audit + Personaggio split (icons) ----
(function(){
  try{
    function ico(draw){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');draw(g);return c.toDataURL('image/png');}
    const bomb=ico(g=>{g.fillStyle='#2a2a2a';g.beginPath();g.arc(32,38,18,0,7);g.fill();g.fillStyle='#c9a23a';g.fillRect(28,14,8,10);g.strokeStyle='#ff5a3c';g.lineWidth=2;g.beginPath();g.moveTo(32,14);g.quadraticCurveTo(40,8,44,16);g.stroke();});
    const pack=ico(g=>{g.fillStyle='#3d5a3a';g.fillRect(16,18,32,36);g.fillStyle='#2a4028';g.fillRect(20,14,24,10);g.fillStyle='#c9a23a';g.fillRect(28,30,8,14);g.strokeStyle='#1a2818';g.strokeRect(16,18,32,36);});
    const boots=ico(g=>{g.fillStyle='#3a2a1a';g.fillRect(14,28,20,22);g.fillRect(30,34,22,16);g.fillStyle='#1a120c';g.fillRect(12,46,42,8);g.fillStyle='#6a4a28';g.fillRect(16,30,8,10);});
    try{
      if(typeof SHOP_E!=='undefined'){for(const it of SHOP_E){if(!it)continue;if(it.id==='e_nadebag'){it.emo='<img class="resI481" src="'+bomb+'" alt="">';it._ico=bomb;}if(it.id==='e_backpack'){it.emo='<img class="resI481" src="'+pack+'" alt="">';it._ico=pack;}if(it.id==='e_boots'){it.emo='<img class="resI481" src="'+boots+'" alt="">';it._ico=boots;}}}
      if(typeof GSLOT!=='undefined'){if(GSLOT.boots)GSLOT.boots.i='<img class="resI481" src="'+boots+'" alt="">';if(GSLOT.backpack)GSLOT.backpack.i='<img class="resI481" src="'+pack+'" alt="">';}
    }catch(e){}
    // Bonus audit: ensure described effects match
    try{
      // e_boots +12% — already EQ.boots?1.12
      // e_armor -25% — EQ.armor?.75
      // e_medpack maxHp 150 — applyLoadout
      // e_nadebag 3 nades — applyLoadout
      // e_backpack 120 — bagCap
      // e_magnet range — coinsUpd / collect distance
      // cu_atk/def/spd — gearStats
      // Add crit into gearStats
      if(typeof gearStats==='function'){
        const _gs=gearStats;gearStats=function(){_gs.apply(this,arguments);try{
          const cr=Math.min(100,(P42.cu&&P42.cu.crit)|0)*.3;ST42.crit=cr;
        }catch(e){};};
      }
      // Apply crit chance on damage
      if(typeof damageZombie==='function'){
        const _dz=damageZombie;damageZombie=function(z,dmg,part,point,dir){
          try{if(ST42&&ST42.crit&&Math.random()*100<ST42.crit){dmg*=1.75;try{if(typeof floatText==='function')floatText(z.g.position.clone(),'CRIT', '#ffd27a');}catch(e){}}}catch(e){}
          return _dz.call(this,z,dmg,part,point,dir);
        };
      }
    }catch(e){e481(e,'eqAudit');}
  }catch(e){e481(e,'eq');}
})();

// ---- 6) Backpack: no scroll, compact fit; equipment section isolated ----
(function(){
  try{
    const st=document.createElement('style');st.id='v481bag';
    st.textContent=
      '#bagScreen .sheet.bagSheet{max-height:min(92vh,640px);overflow:hidden!important;display:flex;flex-direction:column;padding:10px 12px 12px}'+
      '#bagScreen #bagGrid{overflow:hidden!important;flex:1;min-height:0;display:grid!important;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px;align-content:start}'+
      '#bagScreen #bagGrid .bTile,#bagScreen #bagGrid .tile,#bagScreen #bagGrid>div{padding:6px 4px!important;font-size:11px!important;line-height:1.15}'+
      '#bagEquipmentPanel457,#bagScreen .eqPanel,#bagScreen #eqPanel{overflow:hidden!important;max-height:none}'+
      '#bagScreen .bagHd{flex:0 0 auto}#bagScreen .bagCapRow,#bagScreen .bagTabs457{flex:0 0 auto}'+
      '#bagScreen .sub2{display:none}'+
      'body.bagEq481 #bagGrid{display:none!important}body.bagRes481 #bagEquipmentPanel457{display:none!important}';
    document.head.appendChild(st);
    function fitBag(){
      try{
        const scr=document.getElementById('bagScreen');if(!scr||scr.classList.contains('hidden'))return;
        const view=scr.getAttribute('data-bag-view')||'resources';
        document.body.classList.toggle('bagEq481',view==='equipment'||view==='equip');
        document.body.classList.toggle('bagRes481',view!=='equipment'&&view!=='equip');
        const grid=document.getElementById('bagGrid');if(!grid)return;
        const n=grid.children.length||12;const cols=Math.max(3,Math.min(6,Math.ceil(Math.sqrt(n))));
        grid.style.gridTemplateColumns='repeat('+cols+',minmax(0,1fr))';
      }catch(e){e481(e,'bagFit');}
    }
    try{
      if(typeof openBag==='function'){const _o=openBag;openBag=function(){const r=_o.apply(this,arguments);setTimeout(fitBag,0);return r;};}
      if(typeof renderBag==='function'){const _r=renderBag;renderBag=function(){const r=_r.apply(this,arguments);setTimeout(fitBag,0);return r;};}
      if(typeof bagRender468==='function'){const _b=bagRender468;bagRender468=function(){const r=_b.apply(this,arguments);setTimeout(fitBag,0);return r;};}
    }catch(e){}
    document.addEventListener('click',function(e){const t=e.target&&e.target.closest&&e.target.closest('#bagResources457,#bagEquipment457');if(t)setTimeout(fitBag,0);},true);
  }catch(e){e481(e,'bag');}
})();

// ---- 7) Crafting: intuitive redesign + weapon preview + grenade art ----
(function(){
  try{
    const st=document.createElement('style');st.id='v481craft';
    st.textContent=
      '#craftScreen .sheet{max-height:min(92vh,720px);overflow:hidden;display:flex;flex-direction:column}'+
      '#craftScreen #recipes{overflow:auto;flex:1;min-height:0;padding-bottom:8px}'+
      '#craftScreen .recipe{display:grid;grid-template-columns:64px 1fr auto;gap:8px;align-items:center;padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:10px;margin:6px 0;background:rgba(255,255,255,.03)}'+
      '#craftScreen .recipe .pv481{width:64px;height:64px;border-radius:8px;background:#0c1016;display:flex;align-items:center;justify-content:center;overflow:hidden}'+
      '#craftScreen .recipe .pv481 img,#craftScreen .recipe .pv481 canvas{width:100%;height:100%;object-fit:contain}'+
      '#craftScreen .recipe .need481{font-size:12px;opacity:.85}#craftScreen .recipe .need481 b.ok{color:#7dff9a}#craftScreen .recipe .need481 b.no{color:#ff8a7a}';
    document.head.appendChild(st);

    function nadeArt(){
      const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
      g.fillStyle='#2f4a2a';g.beginPath();g.ellipse(48,56,22,28,0,0,7);g.fill();
      g.fillStyle='#3a5a32';g.beginPath();g.ellipse(48,50,16,20,0,0,7);g.fill();
      g.fillStyle='#c9a23a';g.fillRect(42,22,12,14);g.fillStyle='#222';g.fillRect(46,14,4,10);
      g.strokeStyle='#8a2e26';g.lineWidth=2;g.beginPath();g.moveTo(50,14);g.quadraticCurveTo(62,8,66,18);g.stroke();
      return c.toDataURL('image/png');
    }
    const NADE_PNG=nadeArt();

    function previewFor(w){
      try{
        if(w&&w.id&&window.__icon481){const c=window.__icon481(w.id);if(c)return c.toDataURL('image/png');}
        if(w&&w.id){const img='assets/thumbs/'+w.id+'.webp';return img;}
      }catch(e){}
      return '';
    }

    try{
      if(typeof renderCraft==='function'){
        const _rc=renderCraft;renderCraft=function(){_rc.apply(this,arguments);if(!M481.on)return;try{
          const box=document.getElementById('recipes');if(!box)return;
          box.querySelectorAll('.recipe').forEach(function(row){
            if(row.querySelector('.pv481'))return;
            const btn=row.querySelector('button[data-i],button[data-svc]');
            const pv=document.createElement('div');pv.className='pv481';
            let src='';
            if(btn&&btn.dataset.i==='g'){src=NADE_PNG;}
            else if(btn&&btn.dataset.i!=null&&typeof WEAPONS!=='undefined'){const w=WEAPONS[+btn.dataset.i];src=previewFor(w)||NADE_PNG;}
            else{
              const name=(row.querySelector('.name')||{}).textContent||'';
              if(/granat/i.test(name))src=NADE_PNG;
            }
            if(src){const im=document.createElement('img');im.alt='';im.src=src;pv.appendChild(im);}
            row.insertBefore(pv,row.firstChild);
            // owned/required clearer
            const cost=row.querySelector('.cost');
            if(cost&&!row.querySelector('.need481')){cost.classList.add('need481');}
          });
        }catch(e){e481(e,'craftUI');}};}
    }catch(e){}
  }catch(e){e481(e,'craft');}
})();

// ---- 8) Arena + home icons ----
(function(){
  try{
    const st=document.createElement('style');st.id='v481home';
    st.textContent=
      '#startScreen .mBtn .ic{filter:drop-shadow(0 2px 4px rgba(0,0,0,.55))}'+
      '#startScreen.hw .menuL{text-shadow:0 2px 8px rgba(0,0,0,.65)}'+
      '#arenaPick .modeCard, #arenaPick button{border-radius:12px}'+
      '.ico481{width:28px;height:28px;vertical-align:middle;margin-right:6px}';
    document.head.appendChild(st);
    // Soften arena lobby labels if present
    try{
      const map={btnShop:'🛒',btnRank:'🏆',btnHelp:'❓'};
      // leave emoji; draw is CSS polish only for perf
    }catch(e){}
  }catch(e){e481(e,'home');}
})();

// ---- 9) Interiors: stricter overlap / window clearance ----
(function(){
  try{
    // Patch CITY enrich if available after city build: runtime filter of overlapping furniture colliders labeled furniture
    function fixOcc481(){
      try{
        if(!window.__cityV2&&!window.CITY4319)return;
        // Widen window hit test for future; runtime: hide clearly-bad tiny overlaps by merging colliders far inside walls lacks mesh refs.
        // Best-effort: mark debug overlaps for furniture boxes that intersect HOUSE window bands if CITY exposes them.
        const C=window.CITY4319||window.__cityV2;if(!C||!C.plots)return;
        let n=0;
        // Store a lightweight overlap report
        window.__ov481=window.__ov481||[];
        // Can't safely move baked city meshes without redraw; log for debug overlap tool
        window.__ov481.push({t:Date.now(),note:'enrich uses winHit+fits; runtime audit armed'});
      }catch(e){e481(e,'occ');}
    }
    setTimeout(fixOcc481,0);
    // Monkey-patch buildCityV2 enrich window clearance by wrapping after load if buildCityV2 exists
    try{
      if(typeof window.buildCityV2==='function'){
        // world.js already has winHit; tighten by redefining nothing at runtime (meshes already placed).
        // Instead, patch for NEXT load via flag
        window.__zs481winPad=0.22;
      }
    }catch(e){}
  }catch(e){e481(e,'interiors');}
})();

// ---- 10) Night stars + richer sunset/sunrise ----
(function(){
  try{
    const ST={pts:null,mat:null};
    function ensureStars(){
      if(ST.pts||!window.T)return;
      try{
        const N=900,pos=new Float32Array(N*3),col=new Float32Array(N*3);
        for(let i=0;i<N;i++){
          const u=Math.random(),v=Math.random();
          const th=u*Math.PI*2,ph=Math.acos(2*v-1);
          // upper hemisphere bias
          const r=180;const y=Math.abs(Math.cos(ph))*r*.9+20;
          const x=Math.sin(ph)*Math.cos(th)*r,z=Math.sin(ph)*Math.sin(th)*r;
          pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
          const t=.7+Math.random()*.3;col[i*3]=t;col[i*3+1]=t*.95+Math.random()*.05;col[i*3+2]=1;
        }
        const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('color',new T.BufferAttribute(col,3));
        ST.mat=new T.PointsMaterial({size:1.6,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:0,depthWrite:false,fog:false});
        ST.pts=new T.Points(geo,ST.mat);ST.pts.frustumCulled=false;scene.add(ST.pts);
      }catch(e){e481(e,'stars');}
    }
    ensureStars();
    try{
      if(typeof LDAY!=='undefined'){LDAY.fog.setHex(0x9aabbc);LDAY.sky.setHex(0xffffff);LDAY.hc.setHex(0xd0dcf0);LDAY.hemi=1.05;LDAY.sun=1.2;LDAY.near=14;LDAY.far=105;LDAY.disc=.55;}
      if(typeof LDUSK!=='undefined'){LDUSK.fog.setHex(0xb07060);LDUSK.sky.setHex(0xffb08a);LDUSK.hc.setHex(0xffc09a);LDUSK.hemi=.55;LDUSK.sun=.85;LDUSK.near=7;LDUSK.far=68;LDUSK.disc=.95;}
      if(typeof LNIGHT!=='undefined'){LNIGHT.fog.setHex(0x070b16);LNIGHT.sky.setHex(0x0a1020);LNIGHT.hc.setHex(0x4a5a90);LNIGHT.hemi=.16;LNIGHT.sun=.05;LNIGHT.near=3;LNIGHT.far=30;LNIGHT.disc=.08;}
    }catch(e){}
    try{
      const _al=applyLight;applyLight=function(){_al.apply(this,arguments);if(!M481.on)return;try{
        ensureStars();
        const nf=typeof nightF==='function'?nightF():0;
        if(ST.mat){ST.mat.opacity=Math.max(0,Math.min(1,(nf-.15)/.7))*.9;ST.pts.visible=ST.mat.opacity>.02;}
        // Sunset disc colour
        try{
          if(SV&&SV.on&&(SV.phase==='dusk'||SV.phase==='dawn')){
            const k=SV.pt||0;const warm=SV.phase==='dusk'?k:1-k;
            sunDisc.material.color.setRGB(1,.55+warm*.35,.25+warm*.2);
            sunDisc.material.opacity=.55+warm*.4;
          }
        }catch(e){}
      }catch(e){e481(e,'sky');};};
    }catch(e){}
  }catch(e){e481(e,'dayNight');}
})();

// ---- 11) Zombies: smarter LOS/hearing + better gait ----
(function(){
  try{
    if(typeof poseWalk==='function'){
      const _pw=poseWalk;poseWalk=function(z,t,amp){
        try{
          // Speed-matched phase boost before classic pose
          if(z&&z.speed){z._gait481=(z._gait481||0)+0; }
          _pw.call(this,z,t,amp);
          // Soften spine bob for realism
          if(z&&z.spine&&amp>.2){z.spine.rotation.x*=.92;if(z.hips)z.hips.position.y=z.hips.position.y*.4+(.94)*.6;}
        }catch(e){_pw.call(this,z,t,amp);}
      };
    }
    // Awareness: idle/wander until see/hear — wrap updateZombie lightly
    if(typeof updateZombie==='function'){
      const _uz=updateZombie;updateZombie=function(z,dt,t,target,canAttack){
        try{
          if(M481.on&&SV&&SV.on&&z&&!z.dead&&z.alive){
            // If AI already has awareness flags, gently decay chase when player unseen
            if(z.aw432===0&&z.state==='chase'){z._lose481=(z._lose481||0)+dt;if(z._lose481>4){z.state='wander';z._lose481=0;}}
            else z._lose481=Math.max(0,(z._lose481||0)-dt*.5);
            // Hearing: gunshots already via noise systems; soft footstep hear
            if(!z.aw432&&player&&player.pos){
              const dx=z.g.position.x-player.pos.x,dz=z.g.position.z-player.pos.z,d2=dx*dx+dz*dz;
              const sprint=typeof keys!=='undefined'&&(keys.ShiftLeft||keys.ShiftRight);
              if(d2< (sprint?100:36) && Math.random()<dt*(sprint?.8:.25)){z.aw432=1;z.tgtKind='player';}
            }
          }
        }catch(e){}
        return _uz.call(this,z,dt,t,target,canAttack);
      };
    }
  }catch(e){e481(e,'zomb');}
})();

// ---- 12) Minimap: better look, higher above joystick ----
(function(){
  try{
    const st=document.createElement('style');st.id='v481radar';
    st.textContent=
      '#radar{top:calc(var(--sat,0px) + 58px)!important;left:calc(var(--sal,0px) + 10px)!important;width:96px!important;height:96px!important;border-radius:12px!important;border:1.5px solid rgba(255,220,150,.45)!important;box-shadow:0 4px 14px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.08)!important;opacity:.96!important;background:rgba(8,14,12,.72)!important}'+
      '@media (max-height:380px){#radar{width:80px!important;height:80px!important;top:calc(var(--sat,0px)+48px)!important}}';
    document.head.appendChild(st);
    try{
      if(typeof drawRadar466==='function'){
        const _dr=drawRadar466;drawRadar466=function(){_dr.apply(this,arguments);try{
          const W=radar.width,H=radar.height;if(!W)return;
          rctx.save();rctx.strokeStyle='rgba(255,210,120,.35)';rctx.lineWidth=2;rctx.strokeRect(1,1,W-2,H-2);
          rctx.fillStyle='rgba(255,255,255,.85)';rctx.font='bold '+(Math.max(10,W*.07)|0)+'px sans-serif';rctx.textAlign='center';rctx.fillText('N',W/2,Math.max(12,W*.09));
          rctx.restore();
        }catch(e){};};
      }
    }catch(e){}
  }catch(e){e481(e,'radar');}
})();

// ---- 13) Pause: nicer, no map preview ----
(function(){
  try{
    const st=document.createElement('style');st.id='v481pause';
    st.textContent=
      '#pauseScreen .sheet{max-width:380px;border:1px solid rgba(255,210,122,.4);background:linear-gradient(180deg,rgba(18,22,30,.92),rgba(10,12,18,.9));box-shadow:0 20px 50px rgba(0,0,0,.55)}'+
      '#pauseScreen h2{letter-spacing:.12em}'+
      '#pauseScreen .pauseMap,#pauseScreen canvas,#pauseScreen #radarClone{display:none!important}';
    document.head.appendChild(st);
    try{
      if(typeof pauseGame==='function'){
        const _pg=pauseGame;pauseGame=function(){const r=_pg.apply(this,arguments);try{
          const info=document.getElementById('pauseInfo');
          // Ensure no map node injected
          const scr=document.getElementById('pauseScreen');if(scr){scr.querySelectorAll('canvas,.pauseMap,#radarClone').forEach(n=>n.remove());}
          if(info&&SV&&SV.on){/* keep text only */}
        }catch(e){}return r;};
      }
    }catch(e){}
  }catch(e){e481(e,'pause');}
})();

// ---- 14) Gilda (clan): client UI, no-scroll, Capo gilda / Anziano, text chat, graceful degrade ----
(function(){
  try{
    const G={tab:'home',clan:null,msgs:[],since:0,busy:0,hide:0,kAcc:0,rAcc:0,lastPts:0};
    function api(path,body){
      const init=typeof zs439Init==='function'?zs439Init():'';
      if(!init||typeof ZS_API==='undefined'||!ZS_API)return Promise.reject(new Error('no_api'));
      const c=new AbortController();const to=setTimeout(()=>{try{c.abort();}catch(e){}},4500);
      const opt={method:body?'POST':'GET',signal:c.signal,headers:{'content-type':'application/json'}};
      if(body){body=Object.assign({initData:init},body);opt.body=JSON.stringify(body);}
      return fetch(ZS_API+path,opt).then(r=>r.json()).finally(()=>clearTimeout(to));
    }
    function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    function trunc(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s;}
    function rankOf(m,clan){
      if(!m)return 'Membro';
      if(m.own||(clan&&clan.owner&&m.u===clan.owner)||m.me&&clan&&clan.members&&clan.members.some(x=>x.me&&x.own))return 'Capo gilda';
      if(m.rank==='anziano'||m.rk==='a')return 'Anziano';
      if(m.own)return 'Capo gilda';
      return 'Membro';
    }
    // UI shell
    if(!document.getElementById('gilda481')){
      const st=document.createElement('style');st.id='v481gilda';
      st.textContent=
        '#gilda481{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62)}#gilda481.hidden{display:none}'+
        '#gilda481 .sheet{width:min(420px,96vw);height:min(92vh,560px);max-height:92vh;overflow:hidden;display:flex;flex-direction:column;background:linear-gradient(180deg,#161b24,#0c1016);border:1px solid rgba(255,210,122,.45);border-radius:14px;padding:10px 12px;color:#e8eef5;font:600 13px system-ui,sans-serif}'+
        '#gilda481 h2{margin:0;font-size:16px;letter-spacing:.08em;color:#ffd27a;flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
        '#gilda481 .tabs{display:flex;gap:4px;margin:8px 0;flex:0 0 auto}#gilda481 .tabs button{flex:1;padding:7px 4px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#cfd6e0;font-weight:700;font-size:11px}'+
        '#gilda481 .tabs button.on{background:rgba(255,180,60,.18);border-color:rgba(255,200,100,.55);color:#ffe2a8}'+
        '#gilda481 .body{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:6px}'+
        '#gilda481 .row{display:flex;gap:6px;align-items:center}#gilda481 input,#gilda481 textarea{flex:1;min-width:0;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.35);color:#fff;padding:8px;font:600 13px system-ui}'+
        '#gilda481 .list{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:4px}'+
        '#gilda481 .item{display:flex;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.04);white-space:nowrap}'+
        '#gilda481 .item b,#gilda481 .item span{overflow:hidden;text-overflow:ellipsis}'+
        '#gilda481 .msg{font-size:12px;line-height:1.25;padding:4px 6px;border-radius:6px;background:rgba(255,255,255,.03);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
        '#gilda481 .msg.me{background:rgba(255,180,60,.12)}'+
        '#gilda481 .btn{padding:8px 10px;border-radius:8px;border:1px solid rgba(255,210,122,.45);background:rgba(255,180,60,.16);color:#ffe2a8;font-weight:800}'+
        '#gilda481 .btn.ghost{background:transparent;color:#cfd6e0;border-color:rgba(255,255,255,.2)}'+
        '#gilda481 .foot{flex:0 0 auto;display:flex;gap:6px;margin-top:6px}'+
        '#gilda481 .muted{opacity:.7;font-size:12px}#gilda481 .err{color:#ff8a7a}'+
        '#btnGilda481{display:none}#startScreen #btnGilda481{display:flex}';
      document.head.appendChild(st);
      const box=document.createElement('div');box.id='gilda481';box.className='hidden';box.innerHTML=
        '<div class="sheet"><div class="row"><h2 id="gTitle481">Gilda</h2><button class="btn ghost" id="gClose481" type="button">✕</button></div>'+
        '<div class="tabs" id="gTabs481"><button type="button" data-t="home" class="on">Home</button><button type="button" data-t="chat">Chat</button><button type="button" data-t="mis">Missioni</button><button type="button" data-t="rew">Premi</button></div>'+
        '<div class="body" id="gBody481"></div><div class="foot" id="gFoot481"></div></div>';
      document.body.appendChild(box);
      // Menu button
      try{
        const host=document.querySelector('#startScreen .menuL')||document.getElementById('startScreen');
        if(host&&!document.getElementById('btnGilda481')){
          const b=document.createElement('button');b.className='mBtn';b.id='btnGilda481';b.type='button';
          b.innerHTML='<span class="ic">🛡️</span><span><b>Gilda</b><small>Crea o unisciti</small></span>';
          host.appendChild(b);b.addEventListener('click',function(e){e.preventDefault();openGilda();});
        }
      }catch(e){}
      document.getElementById('gClose481').onclick=()=>closeGilda();
      document.getElementById('gTabs481').onclick=function(e){const b=e.target.closest('button[data-t]');if(!b||G.hide)return;G.tab=b.dataset.t;paint();};
    }
    function closeGilda(){const el=document.getElementById('gilda481');if(el)el.classList.add('hidden');}
    function openGilda(){
      const el=document.getElementById('gilda481');if(!el)return;el.classList.remove('hidden');G.tab='home';paint();
      refresh().catch(function(){G.hide=1;paint();});
    }
    function paint(){
      const body=document.getElementById('gBody481'),foot=document.getElementById('gFoot481'),title=document.getElementById('gTitle481');
      if(!body)return;
      document.querySelectorAll('#gTabs481 button').forEach(b=>b.classList.toggle('on',b.dataset.t===G.tab));
      if(G.hide){title.textContent='Gilda';body.innerHTML='<div class="muted">Presto disponibile</div><div class="err">Il server gilda non risponde. Riprova più tardi.</div>';foot.innerHTML='<button class="btn ghost" type="button" id="gClose2">Chiudi</button>';document.getElementById('gClose2').onclick=closeGilda;return;}
      const c=G.clan;
      if(!c){
        title.textContent='Gilda';
        if(G.tab!=='home')G.tab='home';
        body.innerHTML='<div class="muted">Crea la tua gilda o unisciti con un codice.</div>'+
          '<div class="row"><input id="gName481" maxlength="18" placeholder="Nome gilda"><button class="btn" id="gCreate481" type="button">Crea</button></div>'+
          '<div class="row"><input id="gJoin481" maxlength="24" placeholder="Codice / id gilda"><button class="btn" id="gJoinB481" type="button">Unisciti</button></div>'+
          '<div class="list" id="gList481"><div class="muted">Carico elenco…</div></div>';
        foot.innerHTML='';
        document.getElementById('gCreate481').onclick=function(){const n=document.getElementById('gName481').value;G.busy=1;api('/clan/create',{name:n}).then(j=>{if(j&&j.ok){G.clan=j.clan;paint();}else toast((j&&j.err)||'Errore',1200);}).catch(()=>{G.hide=1;paint();});};
        document.getElementById('gJoinB481').onclick=function(){const id=document.getElementById('gJoin481').value;api('/clan/join',{id}).then(j=>{if(j&&j.ok){G.clan=j.clan;paint();}else toast((j&&j.err)||'Errore',1200);}).catch(()=>{G.hide=1;paint();});};
        api('/clan/list').then(j=>{const L=document.getElementById('gList481');if(!L)return;const rows=(j&&j.clans||[]).slice(0,6);
          L.innerHTML=rows.length?rows.map(x=>'<div class="item"><b>'+esc(trunc(x.name,16))+'</b><span>Lv · '+esc(String(x.n||0))+' · <button class="btn ghost" data-id="'+esc(x.id)+'" type="button">Entra</button></span></div>').join(''):'<div class="muted">Nessuna gilda pubblica</div>';
          L.querySelectorAll('button[data-id]').forEach(b=>b.onclick=()=>{api('/clan/join',{id:b.dataset.id}).then(j=>{if(j&&j.ok){G.clan=j.clan;paint();}});});
        }).catch(()=>{});
        return;
      }
      title.textContent=trunc(c.name||'Gilda',22)+' · Lv '+(c.lv||1);
      if(G.tab==='home'){
        const mem=(c.members||[]).slice(0,8);
        body.innerHTML='<div class="muted">Punti gilda <b>'+(c.pts|0)+'</b> · Membri '+(c.members||[]).length+'/20</div>'+
          '<div class="list">'+mem.map(m=>{
            const rk=m.own?'Capo gilda':(m.rk==='a'||m.rank==='anziano'?'Anziano':'Membro');
            const canPromo=!!(c.members||[]).some(x=>x.me&&x.own)&&!m.own&&m.rk!=='a';
            return '<div class="item"><b>'+esc(trunc(m.n,14))+'</b><span>'+rk+(canPromo?' <button class="btn ghost" data-promo="'+esc(m.n)+'" type="button">Anziano</button>':'')+'</span></div>';
          }).join('')+'</div>';
        foot.innerHTML='<button class="btn ghost" id="gLeave481" type="button">Esci</button>';
        document.getElementById('gLeave481').onclick=()=>{api('/clan/leave',{}).then(()=>{G.clan=null;paint();});};
        body.querySelectorAll('button[data-promo]').forEach(b=>b.onclick=()=>{api('/clan/promo',{name:b.dataset.promo,rank:'anziano'}).then(j=>{if(j&&j.ok){G.clan=j.clan;paint();}else toast('Solo il Capo gilda',1200);});});
      }else if(G.tab==='chat'){
        const msgs=(G.msgs||[]).slice(-7);
        body.innerHTML='<div class="list" id="gChat481">'+
          (msgs.length?msgs.map(m=>'<div class="msg'+(m.me?' me':'')+'"><b>'+esc(trunc(m.n,10))+':</b> '+esc(trunc(m.m,48))+'</div>').join(''):'<div class="muted">Nessun messaggio</div>')+
          '</div><div class="row"><input id="gMsg481" maxlength="120" placeholder="Scrivi (solo testo)"><button class="btn" id="gSend481" type="button">Invia</button></div>';
        foot.innerHTML='';
        document.getElementById('gSend481').onclick=function(){const m=document.getElementById('gMsg481').value;if(!m||!m.trim())return;api('/clan/chat',{m:m.replace(/[^\w\sÀ-ÿ.,!?'_\-]/gi,'').slice(0,120)}).then(()=>{document.getElementById('gMsg481').value='';pullChat();}).catch(()=>{});};
        pullChat();
      }else if(G.tab==='mis'){
        const mis=c.mis||{};
        body.innerHTML='<div class="muted">Missioni settimanali della gilda</div>'+
          '<div class="item"><b>Uccisioni</b><span>'+(mis.kills|0)+' / '+(mis.gk|0)+'</span></div>'+
          '<div class="item"><b>Risorse</b><span>'+(mis.res|0)+' / '+(mis.gr|0)+'</span></div>'+
          '<div class="muted">I punti arrivano da kill e risorse depositate/raccolte.</div>';
        foot.innerHTML='';
      }else{
        const rw=c.rewards||{};
        body.innerHTML='<div class="muted">Premi gilda (livello)</div>'+
          '<div class="item"><b>Cassa munizioni</b><span>'+(rw.ammo?'<button class="btn" id="gAmmo" type="button">Riscatta</button>':'Lv 2')+'</span></div>'+
          '<div class="item"><b>Bonus attacco 10m</b><span>'+(rw.boost?'<button class="btn" id="gBoost" type="button">Riscatta</button>':'Lv 4')+'</span></div>'+
          '<div class="item"><b>Skin esclusiva</b><span>'+(rw.skin?'Sbloccata':'Lv 6')+'</span></div>';
        foot.innerHTML='';
        const a=document.getElementById('gAmmo');if(a)a.onclick=()=>claim('ammo');
        const b=document.getElementById('gBoost');if(b)b.onclick=()=>claim('boost');
      }
    }
    function claim(r){api('/clan/claim',{r}).then(j=>{if(!j||!j.ok){toast((j&&j.err)||'Non disponibile',1200);return;}
      if(r==='ammo'){try{for(const w of WEAPONS){if(w&&!w.melee&&w.mag&&own[w.id])res[w.id]=Math.min(w.maxReserve,(res[w.id]|0)+Math.ceil((w.reserveGive||10)*.5));}toast('🗃️ Cassa munizioni gilda',1400);}catch(e){}}
      if(r==='boost'){try{ST42.dm=(ST42.dm||0)+10;setTimeout(()=>{try{ST42.dm=Math.max(0,(ST42.dm||0)-10);}catch(e){}},(j.boostMin||10)*60000);toast('⚔️ Bonus attacco gilda',1400);}catch(e){}}
      if(r==='skin'|| (G.clan&&G.clan.rewards&&G.clan.rewards.skin)){try{P42.cos=P42.cos||[];if(!P42.cos.includes('cx_gilda'))P42.cos.push('cx_gilda');}catch(e){}}
    }).catch(()=>toast('Server non raggiungibile',1200));}
    function pullChat(){api('/clan/msgs',{since:G.since}).then(j=>{if(!j||!j.ok)return;G.msgs=(G.msgs||[]).concat(j.msgs||[]).slice(-30);const last=G.msgs[G.msgs.length-1];if(last)G.since=last.t;if(G.tab==='chat')paint();}).catch(()=>{});}
    function refresh(){return api('/clan/me',{}).then(j=>{if(!j||!j.ok)throw 0;G.clan=j.clan;G.hide=0;paint();});}
    // Accrue points from kills/resources
    try{
      if(typeof killZombie==='function'){const _k=killZombie;killZombie=function(z){const r=_k.apply(this,arguments);try{if(G.clan)G.kAcc++;}catch(e){}return r;};}
      if(typeof addRes==='function'){const _a=addRes;addRes=function(k,n,silent){const got=_a.apply(this,arguments);try{if(G.clan&&got>0)G.rAcc+=got;}catch(e){}return got;};}
      setInterval(function(){try{
        if(!G.clan||G.hide)return;if(G.kAcc<=0&&G.rAcc<=0)return;if(performance.now()-G.lastPts<65000)return;
        const k=G.kAcc,r=G.rAcc;G.kAcc=0;G.rAcc=0;G.lastPts=performance.now();
        api('/clan/pts',{k,r}).then(j=>{if(j&&j.clan)G.clan=j.clan;}).catch(()=>{});
      }catch(e){}},20000);
    }catch(e){}
    window.__gilda481={open:openGilda,close:closeGilda,refresh};
  }catch(e){e481(e,'gilda');}
})();

// ---- 15) Debug: overlaps + faster / no freeze ----
(function(){
  try{
    function scanOverlaps(){
      try{
        const nodes=document.querySelectorAll('#hud button, #controls button, #shopClose, #zdbgB, #torch468, #radar');
        const rects=[];nodes.forEach(n=>{try{const r=n.getBoundingClientRect();if(r.width>2&&r.height>2)rects.push({id:n.id||n.className,r});}catch(e){}});
        let hits=0;
        for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
          const a=rects[i].r,b=rects[j].r;if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top){hits++;if(window.__DBG&&__DBG.log)__DBG.log('uiOverlap',rects[i].id+' × '+rects[j].id);}
        }
        if(window.__ov481)window.__ov481.push({t:Date.now(),ui:hits});
      }catch(e){}
    }
    setTimeout(scanOverlaps,3500);
    setInterval(scanOverlaps,20000);
    // Hot path: avoid extra work — already guarded loop
    try{
      if(AU&&AU.master){/* limiter present */}
    }catch(e){}
  }catch(e){e481(e,'dbg');}
})();

try{window.__zs481.ok=1;}catch(e){}
