'use strict';
// ======================= v4.3.91 arena netcode: buffered interpolation, smooth yaw, safe handlers, watchdog, ping/tick stats, shader warm-up =======================
(function(){if(typeof ARENA454==='undefined')return;
const NET={rtt:0,rttMax:0,snaps:0,snapHz:0,gapMax:0,last:0,hzT:0,hzN:0,errors:0,watchdog:0};window.__arenaNet=NET;
const DELAY=110;
function push(a,t,x,z,y){const B=a.b491||(a.b491={n:0,i:0,T:new Float64Array(16),X:new Float32Array(16),Z:new Float32Array(16),Y:new Float32Array(16)});const j=B.i;B.T[j]=t;B.X[j]=x;B.Z[j]=z;B.Y[j]=y;B.i=(j+1)&15;if(B.n<16)B.n++;}
const ang=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*k;};
function sample(a,T){const B=a.b491;if(!B||!B.n)return false;let hi=-1,lo=-1;for(let k=0;k<B.n;k++){const j=(B.i-1-k+32)&15;if(B.T[j]>=T)hi=j;else{lo=j;break;}}
  if(lo<0){const j=(B.i-B.n+16)&15;a.x=a.px=B.X[j];a.z=a.pz=B.Z[j];a.yaw=B.Y[j];return true;}
  if(hi<0){const j=lo,p=(j-1+16)&15,dt=B.T[j]-B.T[p];const ex=B.n>1&&dt>0?Math.min(1,(T-B.T[j])/dt):0;const e=Math.min(ex,1.5);a.x=a.px=B.X[j]+(B.X[j]-B.X[p])*e*(B.n>1?1:0);a.z=a.pz=B.Z[j]+(B.Z[j]-B.Z[p])*e*(B.n>1?1:0);a.yaw=B.Y[j];return true;}
  const k=(T-B.T[lo])/Math.max(1,B.T[hi]-B.T[lo]);a.x=a.px=B.X[lo]+(B.X[hi]-B.X[lo])*k;a.z=a.pz=B.Z[lo]+(B.Z[hi]-B.Z[lo])*k;a.yaw=ang(B.Y[lo],B.Y[hi],k);return true;}
try{const _s=arenaSnap;arenaSnap=function(msg){const r=_s.apply(this,arguments);try{const now=performance.now();NET.snaps++;if(NET.last){const g=now-NET.last;if(g>NET.gapMax)NET.gapMax=g;}NET.last=now;NET.hzN++;if(now-NET.hzT>2000){NET.snapHz=Math.round(NET.hzN*1000/(now-NET.hzT||1));NET.hzT=now;NET.hzN=0;}
    const arr=msg.players||[];for(let i=0;i<arr.length;i++){const q=arr[i];if(q.id===ARENA454.me)continue;const a=ARENA454.actors[q.id];if(a)push(a,now,+q.x||0,+q.z||0,+q.yaw||0);}}catch(e){NET.errors++;}return r;};window.arenaSnap=arenaSnap;}catch(e){}
try{const _a=arenaAnimate;arenaAnimate=function(now){try{const T=now-DELAY,ids=ARENA454.actors;for(const id in ids){const a=ids[id];if(a.b491&&sample(a,T))a.t=now-1000;}}catch(e){NET.errors++;}return _a.apply(this,arguments);};window.arenaAnimate=arenaAnimate;}catch(e){}
try{const _d=arenaDrive;arenaDrive=function(f,x,z,yaw,now,alive){try{const dt=Math.min(.1,Math.max(0,(now-(f.yt491||now))/1000));f.yt491=now;f.sy491=f.sy491==null?yaw:ang(f.sy491,yaw,1-Math.exp(-dt*14));yaw=f.sy491;}catch(e){}return _d.call(this,f,x,z,yaw,now,alive);};window.arenaDrive=arenaDrive;}catch(e){}
// every server message handled defensively; pong -> latency
try{const _m=arenaOnMsg;arenaOnMsg=function(msg){NET.lastMsg=performance.now();try{if(msg&&msg.t==='pong'){const c=+msg.c||0,n=Date.now()%1e6;let d=n-c;if(d<0)d+=1e6;if(d<10000){NET.rtt=NET.rtt?Math.round(NET.rtt*.7+d*.3):d;if(d>NET.rttMax)NET.rttMax=d;}return;}return _m.apply(this,arguments);}catch(e){NET.errors++;try{window.__DBG&&__DBG.prob&&__DBG.prob('warn','arena','messaggio '+(msg&&msg.t)+': '+(e&&e.message));}catch(x){}}};window.arenaOnMsg=arenaOnMsg;}catch(e){}
// ping every 2 s during a match, watchdog: no server data for 6 s -> warn, 12 s -> back to menu (never hang)
setInterval(()=>{try{const ws=ARENA454.ws;if(ARENA454.phase==='play'){if(ws&&ws.readyState===1)arenaSend({t:'ping',c:Date.now()%1e6});const gap=performance.now()-(NET.lastMsg||performance.now());
    if(gap>6000&&!NET.warned){NET.warned=1;try{toast('Connessione instabile…',1500);}catch(e){}}if(gap<2000)NET.warned=0;if(gap>12000){NET.watchdog++;NET.lastMsg=performance.now();try{toast('Server arena non risponde: torno al menu',2500);}catch(e){}try{arenaShutdownToMenu();}catch(e){try{showMenu();}catch(x){}}}}else NET.lastMsg=performance.now();}catch(e){NET.errors++;}},2000);
// debug report gets the arena network stats
try{const D=window.__DBG;if(D&&typeof D.report==='function'){const _r=D.report;D.report=function(){const r=_r.apply(this,arguments)||{};try{r.arenaNet={rttMs:NET.rtt,rttMaxMs:NET.rttMax,snapHz:NET.snapHz,snapGapMaxMs:Math.round(NET.gapMax),snaps:NET.snaps,errori:NET.errors,watchdog:NET.watchdog};}catch(e){}return r;};}}catch(e){}
// precompile arena shaders while the arena screen (weapon pick) is up, before a match starts
try{const _o=arenaOpen;arenaOpen=function(){const r=_o.apply(this,arguments);setTimeout(()=>{try{const cc=window.__cc482;if(cc)cc.compile(cc.list(),'arena491');}catch(e){}},600);return r;};window.arenaOpen=arenaOpen;}catch(e){}
})();
