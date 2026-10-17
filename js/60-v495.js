'use strict';
// 4.3.95: lightweight low-HP / damage red overlay.
// Replaces heavy full-screen inset box-shadows (#dmg, #lowhp) that lag on Adreno 710.
// Single cheap radial-gradient overlay, opacity only, updated via rAF only when HP changes.
(function(){
  if(document.getElementById('dmg495'))return;
  const css=`
#dmg495,#lowhp495{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;
  background:radial-gradient(ellipse at center,rgba(180,0,0,0) 42%,rgba(180,0,0,.55) 100%);
  will-change:opacity;transition:none}
#dmg,#lowhp{box-shadow:none!important;background:none!important;opacity:0!important;display:none!important}
`;
  const st=document.createElement('style');st.id='v495css';st.textContent=css;document.head.appendChild(st);
  const dmg=document.createElement('div');dmg.id='dmg495';document.body.appendChild(dmg);
  const low=document.createElement('div');low.id='lowhp495';document.body.appendChild(low);

  let lastHp=100,lowOp=0,flashOp=0,raf=0;
  function tick(){
    raf=0;
    const hp=(typeof player!=='undefined'&&player&&player.hp!=null)?player.hp:100;
    const wantLow=hp>0&&hp<32?(0.22+Math.min(0.38,(32-hp)/32*0.6)):0;
    if(Math.abs(wantLow-lowOp)>0.02||Math.abs(hp-lastHp)>0.5){
      lowOp=wantLow;low.style.opacity=wantLow.toFixed(3);lastHp=hp;
    }
    if(flashOp>0){
      flashOp=Math.max(0,flashOp-0.045);
      dmg.style.opacity=flashOp.toFixed(3);
      if(flashOp>0.01)raf=requestAnimationFrame(tick);
    }
  }
  function sched(){if(!raf)raf=requestAnimationFrame(tick);}

  // patch hurt
  try{
    const _h=hurt;
    window.hurt=function(n){
      const r=_h.apply(this,arguments);
      flashOp=0.85;sched();
      return r;
    };
  }catch(e){}

  // patch any direct lowhp opacity sets (they will be ignored by CSS display:none)
  try{
    const obs=new MutationObserver(()=>{try{if(typeof player!=='undefined'&&player)sched();}catch(e){}});
    const hpEl=document.getElementById('hpTxt');
    if(hpEl)obs.observe(hpEl,{childList:true,characterData:true,subtree:true});
  }catch(e){}

  // force initial
  setTimeout(sched,400);
  window.__zs495={sched,get flash(){return flashOp;},get low(){return lowOp;}};
})();
