'use strict';
// ======================= v4.3.89: arena keep-alive + reconnect, leaderboard one row per player, MP room overlay never blocks, shop warm-up =======================
(function(){
// (1) Arena: an idle socket on the weapon-pick screen was dropped and never reopened, so that phone was no longer counted online
//     and never joined the queue. Ping every 15 s, reconnect automatically while the arena screen is open.
try{let tries=0;setInterval(()=>{try{const w=ARENA454.ws;if(w&&w.readyState===1&&ARENA454.phase!=='off')arenaSend({t:'ping',c:Date.now()%1e6});}catch(e){}},15000);
  const _f=arenaFail;arenaFail=function(m){try{const ph=ARENA454.phase;if(tries>=99)tries=0;else if((ph==='pick'||ph==='wait')&&tries<8){tries++;const el=$('arenaOnline');if(el)el.textContent='Riconnessione…';setTimeout(()=>{try{if(ARENA454.phase===ph&&(!ARENA454.ws||ARENA454.ws.readyState>1))arenaConnect();}catch(e){}},Math.min(5000,800*tries));return;}}catch(e){}return _f.apply(this,arguments);};window.arenaFail=arenaFail;
  const _on=arenaOnMsg;arenaOnMsg=function(msg){if(msg&&msg.t==='kick')tries=99;else if(msg&&(msg.t==='presence'||msg.t==='lobby'||msg.t==='start')&&tries<99)tries=0;return _on.apply(this,arguments);};window.arenaOnMsg=arenaOnMsg;
  document.addEventListener('visibilitychange',()=>{try{if(document.visibilityState==='visible'&&(ARENA454.phase==='pick'||ARENA454.phase==='wait')&&(!ARENA454.ws||ARENA454.ws.readyState>1))arenaConnect();}catch(e){}});
}catch(e){console.warn('v489 arena',e);}
// (2)(3) Leaderboard: one row per player. My rows (device id, old Telegram id, same nickname, local "Tu" row) merge into one with the best score.
function myName(){let n='';try{n=(typeof ID482!=='undefined'&&(ID482.nick||ID482.srvName))||'';}catch(e){}if(!n)try{n=pname();}catch(e){}return String(n||'').trim().toLowerCase();}
try{const u=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.user;if(u&&u.id)localStorage.setItem('zs_tgid489',String(u.id));}catch(e){}
zs439Rows=function(d){const me=myId(),nm=myName();let tg='';try{tg=localStorage.getItem('zs_tgid489')||'';}catch(e){}
  const by=new Map();let mine=null;
  for(const x of (d&&d.top)||[]){const r={id:String(x.uid),n:x.name,k:x.k|0,s:x.s|0,g:x.n|0,bk:x.bk|0,w:x.bw|0};
    const isMe=r.id===me||(tg&&r.id===tg)||(nm&&nm!=='tu'&&String(r.n||'').trim().toLowerCase()===nm);
    if(isMe){if(!mine){mine=Object.assign({},r,{id:me});}else{mine.k=Math.max(mine.k,r.k);mine.s=Math.max(mine.s,r.s);mine.g=Math.max(mine.g,r.g);mine.bk=Math.max(mine.bk,r.bk);}continue;}
    const o=by.get(r.id);if(!o||r.k>o.k)by.set(r.id,r);}
  let local=0;try{const b=zs439Bag();local=(b.seen|0)+(b.opt|0)+(b.add|0);}catch(e){}
  if(mine){try{mine.k=Math.max(mine.k,zs439Sync(mine.k)|0);}catch(e){}}else if(local>0)mine={id:me,n:(typeof ID482!=='undefined'&&ID482.nick)||pname(),k:local,s:0,g:1,bk:local,w:0};
  const rows=[...by.values()];if(mine)rows.push(mine);return rows.sort((a,b)=>b.k-a.k||b.s-a.s);};
window.zs439Rows=zs439Rows;
// (4) live: refresh the home list every 10 s while it is visible (the 3 s timer only re-reads a 30 s server cache), flush scores during play
setInterval(()=>{try{if(document.visibilityState!=='visible')return;if(typeof zs439Flush==='function')zs439Flush();}catch(e){}},10000);
// MP room overlay: when closed it must not catch taps on Gioca / Nuova partita
try{const st=document.createElement('style');st.textContent='#mp485.hidden,#mp485.hidden *{display:none!important;pointer-events:none!important;visibility:hidden!important}';document.head.appendChild(st);
  const _sm=showMenu;showMenu=function(){const r=_sm.apply(this,arguments);try{const o=document.getElementById('mp485');if(o&&!(window.MP&&MP.state&&MP.state().on))o.classList.add('hidden');}catch(e){}return r;};window.showMenu=showMenu;}catch(e){}
// (5) shop open lag: warm the shared 3D preview renderer once while idle on the home screen
setTimeout(()=>{const go=()=>{try{if(!window.view3d487||game.state!=='menu')return;const h=document.createElement('div');h.style.cssText='position:fixed;left:-400px;top:0;width:120px;height:60px;';document.body.appendChild(h);if(view3d487.show(h,'pistol'))setTimeout(()=>{try{view3d487.stop();}catch(e){}h.remove();},400);else h.remove();}catch(e){}};(window.requestIdleCallback||setTimeout)(go,{timeout:4000});},9000);
})();
