'use strict';
// 4.3.94: Workers KV budget. Fewer server calls: score only at game over / menu / app hidden, top list max every 5 min (cached),
// device register once per token (with backoff), heartbeat every 10 min, clan points every 10 min, debug uploads every 30 min.
(function(){
const LSg=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},LSs=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const K={top:0,reg:0,score:0,hb:0,skipS:0,skipT:0,skipR:0,skipH:0};window.__kv494=K;
const st=()=>{try{return game.state;}catch(e){return '';}};
// ---- (1) score: only at game over / menu / app hidden (force); long sessions: at most every 20 min ----
try{const _f=zs439Flush;let lastPlay=Date.now();
  zs439Flush=function(force){const s=st(),hidden=document.visibilityState==='hidden';
    const ok=force||hidden||s==='menu'||s==='over'||(s==='play'&&Date.now()-lastPlay>20*60000);
    if(!ok){K.skipS++;return;}let due=0;try{due=zs439Bag().add|0;}catch(e){}if(due<=0)return;// nothing new: never resend
    if(s==='play')lastPlay=Date.now();K.score++;return _f.apply(this,arguments);};
  window.zs439Flush=zs439Flush;
  // the per-kill arm timer is not needed any more
  zs439Arm=function(){};
}catch(e){console.warn('494 flush',e);}
// game over / back to menu: send once
try{const _sg=svGameOver;svGameOver=function(){const r=_sg.apply(this,arguments);setTimeout(()=>{try{zs439Flush(true);}catch(e){}},300);return r;};}catch(e){}
try{const _go=gameOver;gameOver=function(){const r=_go.apply(this,arguments);setTimeout(()=>{try{zs439Flush(true);}catch(e){}},300);return r;};}catch(e){}
try{const _sm=showMenu;showMenu=function(){const r=_sm.apply(this,arguments);setTimeout(()=>{try{zs439Flush(true);}catch(e){}},300);return r;};}catch(e){}
// ---- (2) top list: min 5 min between fetches, cached in localStorage ----
try{const TK='zs_top494',MIN=5*60000;const c=LSg(TK,null);
  if(c&&c.d&&Array.isArray(c.d.top)&&Date.now()-c.t<7*86400000&&!ONL439.data){ONL439.data=c.d;}
  let last=c?c.t|0:0,bypass=false;const _t=zs439Top;
  zs439Top=function(cb){const now=Date.now();if(!bypass&&now-last<(ONL439.data?MIN:60000)){K.skipT++;try{cb(ONL439.data||null);}catch(e){}return;}
    if(ONL439.busy){return _t.apply(this,arguments);}bypass=false;last=now;K.top++;ONL439.t=0;
    return _t.call(this,d=>{try{if(d&&Array.isArray(d.top)){LSs(TK,{t:Date.now(),d});}}catch(e){}cb(d);});};
  window.zs439Top=zs439Top;
  // after our own score was accepted, allow one refresh so the player sees it
  const _am=zs439ApplyMe;zs439ApplyMe=function(){bypass=true;return _am.apply(this,arguments);};
}catch(e){console.warn('494 top',e);}
// ---- (3) device register: once per token, backoff 10 min after a failure ----
try{const RK='zs_reg494';const _r=id482Register;let lastTry=0;
  const f=function(force){try{if(!force&&ID482.tok&&ID482.exp-Date.now()/1e3>3*86400)return Promise.resolve(true);}catch(e){}
    if(!force&&Date.now()-lastTry<600000){K.skipR++;return Promise.resolve(false);}lastTry=Date.now();K.reg++;
    const p=_r.apply(this,arguments);try{p.then(ok=>{if(ok)LSs(RK,Date.now());});}catch(e){}return p;};
  id482Register=f;window.id482Register=f;
}catch(e){console.warn('494 reg',e);}
// ---- (4) heartbeat: every 10 min of play (+ on hide / new game) ----
try{const _h=hb472Send;let last=Date.now();hb472Send=function(keep){if(!keep&&Date.now()-last<600000){K.skipH++;return;}last=Date.now();K.hb++;return _h.apply(this,arguments);};}catch(e){}
})();
