'use strict';
// ======================= v4.3.88: arena 2-player fallback, global leaderboard refresh, perf =======================
(function(){
// (2) Arena: the 3v3 queue needs 6 players, so 2 friends never got a match. After 10 s in a short 3v3 queue, switch to the 1v1 duel queue.
try{const A={since:0};const _al=arenaLobby;arenaLobby=function(msg){const r=_al.apply(this,arguments);try{if(ARENA454.mode===3&&(msg.n|0)<6){if(!A.since)A.since=Date.now();}else A.since=0;}catch(e){}return r;};window.arenaLobby=arenaLobby;
  const _ao=arenaOnMsg;arenaOnMsg=function(msg){if(msg&&msg.t==='lobby')return arenaLobby(msg);return _ao.apply(this,arguments);};window.arenaOnMsg=arenaOnMsg;
  setInterval(()=>{try{if(ARENA454.phase!=='wait'||ARENA454.mode!==3){A.since=0;return;}if(!A.since||Date.now()-A.since<10000||!ARENA454.ws||ARENA454.ws.readyState!==1)return;A.since=0;ARENA454.mode=1;
    arenaSend({t:'join',id:ARENA454.me||arenaPid(),name:arenaPname(),weapon:ARENA454.weapon,mode:1});const m=$('arenaMsg');if(m)m.textContent='Pochi giocatori per il 3 contro 3: passo all\'uno contro uno…';}catch(e){}},1000);
  // arena kills count for the global leaderboard
  const _fx=arenaFx;arenaFx=function(msg){try{if(msg&&msg.kill&&msg.by===ARENA454.me&&typeof zs439NoteKill==='function')zs439NoteKill();}catch(e){}return _fx.apply(this,arguments);};window.arenaFx=arenaFx;
}catch(e){console.warn('v488 arena',e);}
// (6) Global leaderboard: flush pending kills as soon as the device token exists; refresh on home and after every match.
function lbRefresh(){try{if(typeof ONL439!=='undefined')ONL439.t=0;if(typeof zs439Flush==='function')zs439Flush();setTimeout(()=>{try{if(game.state==='menu')renderMini();}catch(e){}},900);}catch(e){}}
try{const _r=id482Register;id482Register=function(){const p=_r.apply(this,arguments);try{p&&p.then&&p.then(ok=>{if(ok)lbRefresh();});}catch(e){}return p;};window.id482Register=id482Register;}catch(e){}
for(const k of ['showMenu','gameOver','svGameOver']){try{const f=window[k];if(typeof f!=='function')continue;window[k]=function(){const r=f.apply(this,arguments);setTimeout(lbRefresh,600);return r;};}catch(e){}}
setTimeout(lbRefresh,4000);
// (5) shader compile: do not block on LINK_STATUS for every program (KHR_parallel_shader_compile lets the driver link in background threads)
try{if(renderer&&renderer.debug&&!/[?&]glcheck=1/.test(location.search))renderer.debug.checkShaderErrors=false;}catch(e){}
// (5) precompile objects added for the match while the match loader is still up (programs 120-134 were linked during play)
try{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{const cc=window.__cc482;if(cc){[300,1200,2600].forEach(t=>setTimeout(()=>{try{cc.compile(cc.list(),'partita488');}catch(e){}},t));}}catch(e){}return r;};window.startGame=startGame;}catch(e){}
})();
