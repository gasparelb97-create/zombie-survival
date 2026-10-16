'use strict';
// ======================= v4.3.82 black box: rolling snapshot ~1 s (localStorage + native file), open/closed session, emergency report on next launch, native reports =======================
(function(){
const N=window.ZSNative||null;let SID=Math.random().toString(36).slice(2,10);
function snapObj(){const D=window.__dbg482x?(()=>{try{return window.__dbg482x();}catch(e){return null;}})():null;let p=null,mem=null;
  try{p={x:+player.pos.x.toFixed(1),z:+player.pos.z.toFixed(1),hp:Math.round(player.hp),arma:(typeof WEAPONS!=='undefined'&&typeof curW!=='undefined'&&WEAPONS[curW])?WEAPONS[curW].id:''};}catch(e){}
  try{const m=performance.memory;if(m)mem={usataMB:+(m.usedJSHeapSize/1048576).toFixed(1),limiteMB:Math.round(m.jsHeapSizeLimit/1048576)};}catch(e){}
  let z=0;try{z=zombies.filter(q=>q.alive&&!q.dead).length;}catch(e){}let sys=null;try{sys=window.__DBG&&__DBG.report?null:null;}catch(e){}
  let gl=null;try{gl={prog:renderer.info.programs.length,geo:renderer.info.memory.geometries,tex:renderer.info.memory.textures,calls:renderer.info.render.calls};}catch(e){}
  return {sid:SID,t:Date.now(),ver:String(window.GAME_VER||''),frame:(window.__dbgFC482&&__dbgFC482())|0,stato:(typeof game!=='undefined'?game.state:'?'),schermata:(D&&D.eventi&&D.eventi.length?D.eventi[D.eventi.length-1].tag:''),
    player:p,zombie:z,memoria:mem,gpu:gl,eventi:D?D.eventi.slice(-20):[],spike:D?D.spike.slice(-3):[],nodiAudio:D?D.nodiAudio:0,visibile:!document.hidden};}
let prev=null;try{prev=JSON.parse(localStorage.getItem('zs_bb482')||'null');}catch(e){}
const prevOpen=(()=>{try{const s=JSON.parse(localStorage.getItem('zs_sess482')||'null');return s&&s.open?s:null;}catch(e){return null;}})();
function setSess(open){try{localStorage.setItem('zs_sess482',JSON.stringify({sid:SID,open:open?1:0,t:Date.now()}));}catch(e){}}
setSess(1);
let busy=0;setInterval(()=>{if(busy||document.hidden)return;busy=1;try{const s=JSON.stringify(snapObj());localStorage.setItem('zs_bb482',s);if(N&&N.saveSnap&&s.length<24000)N.saveSnap(s);}catch(e){}busy=0;},1000);
// clean close: app hidden / page unloaded; reopened on visible
document.addEventListener('visibilitychange',()=>setSess(!document.hidden));addEventListener('pagehide',()=>setSess(0));addEventListener('pageshow',()=>setSess(1));
const F=()=>window.__dbg482&&__dbg482.find;
setTimeout(()=>{try{const find=F();if(!find)return;
  // 1) previous session still "open" = killed/crashed while visible
  if(prevOpen&&prev&&prev.sid===prevOpen.sid&&prev.visibile!==false){const ev=(prev.eventi||[]).slice(-3).map(e=>e.tag).join(', ');
    find('CRASH','chiusura','sessione aperta','CRASH: il gioco si è chiuso all\'improvviso (stato '+prev.stato+(ev?', dopo: '+ev:'')+', memoria '+(prev.memoria?prev.memoria.usataMB+' MB':'?')+', zombie '+prev.zombie+')','err',{ultimoStato:prev});}
  // 2) native reports (Java crash, renderer gone, Android exit reasons, main-thread stalls)
  if(N&&N.pending){let L=[];try{L=JSON.parse(N.pending()||'[]');}catch(e){}
    for(const r of L){const sev=r.kind==='stall'?'warn':'err';let snapJ=null;try{snapJ=r.snap?JSON.parse(r.snap):null;}catch(e){}
      find(r.kind==='stall'?'BLOCCO':'CRASH','nativo:'+r.kind,String(r.label||'').replace(/[\d.]+ s/,'# s').slice(0,60),String(r.label||'CRASH nativo')+(snapJ&&snapJ.stato?' (stato '+snapJ.stato+')':''),sev,{dettaglio:String(r.detail||'').slice(0,6000),dispositivo:r.device,ver:r.ver,quando:new Date(r.t||0).toISOString(),ultimoStato:snapJ});}
    if(L.length)try{N.clear();}catch(e){}}
}catch(e){console.warn('bb482',e);}},4000);
})();
