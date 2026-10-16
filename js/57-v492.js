// 4.3.92 shop: no weapon/equipment detail modal. A card tap (or 👁 / prova) only selects the card -> left panel shows 3D model + full stats.
(function(){try{
const sel=c=>{try{if(!c)return;const L=document.getElementById('shopList');if(!L||!c.isConnected)return;c.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));}catch(e){}};
const cardFor=s=>{for(const x of document.querySelectorAll('#shopList .scard'))try{if(sh431W(x)===s||sh431E(x)===s)return x;}catch(e){}return null;};
sh431Weapon=function(s,c){sel(c&&c.isConnected?c:cardFor(s));};
sh431Equip=function(s,c){sel(c&&c.isConnected?c:cardFor(s));};
provaW=function(wid){try{const s=SHOP_W.find(q=>q.w===wid);sel(cardFor(s));}catch(e){}};
try{window.sh431Weapon=sh431Weapon;window.sh431Equip=sh431Equip;window.provaW=provaW;}catch(e){}
// full stats in the hero panel
const st=document.createElement('style');st.textContent=
'#hero484{gap:2px!important;padding:5px 8px!important}#hero484 .hImg{flex:1 1 38%!important;min-height:70px!important}'+
'#hero484>*{flex-shrink:0}#hero484 .hImg{flex:1 1 0!important;flex-shrink:1!important}#hero484 .hName{font-size:15px!important;white-space:nowrap!important;text-overflow:ellipsis;line-height:17px!important;min-height:17px}#hero484 .hRar{font-size:10px!important}'+
'#hero484 .hDet{flex:0 0 auto!important;overflow:visible!important}#hero484 .hDet.st492>*:not(.s492){display:none!important}'+
'#hero484 .s492 .vs{font-size:9.5px;color:#9fb0d0;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'#hero484 .s492 .r{display:grid;grid-template-columns:58px 1fr 52px 30px;align-items:center;gap:4px;font:700 10px/11.5px system-ui,sans-serif;color:#dfe6f3}'+
'#hero484 .s492 .r i{position:relative;height:6px;border-radius:3px;background:#2a3044}#hero484 .s492 .r i b{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:linear-gradient(90deg,#ffb347,#ffd76a)}'+
'#hero484 .s492 .r i em{position:absolute;top:-2px;width:2px;height:10px;background:#8fc2ff}#hero484 .s492 .r .v{text-align:right;white-space:nowrap}#hero484 .s492 .r .v small{font-size:8.5px;color:#9fb0d0}'+
'#hero484 .s492 .r .c{font-size:9.5px;text-align:right}#hero484 .s492 .up{color:#5fe08a}#hero484 .s492 .dn{color:#ff7a6a}#hero484 .s492 .eq{color:#9fb0d0}'+
'#hero484 .s492 .ds{font-size:10px;line-height:12px;color:#c9d2e4;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
'#hero484 .hBuy button{height:30px!important;font-size:15px!important}';
document.head.appendChild(st);
function stats(s){const w=WEAPONS.find(q=>q.id===s.w);if(!w)return '';let h=null;try{h=heldW42();}catch(e){}const A=ws431Stats(w),H=h&&h.id!==w.id&&!h.melee&&!h.tool?ws431Stats(h):null;
  const guns=WEAPONS.filter(q=>!q.melee&&!q.tool&&q.mag),mx={};for(const [,k] of WS431)mx[k]=Math.max(1,...guns.map(q=>ws431Stats(q)[k]||0));const mnRel=Math.min(...guns.map(q=>q.reload||9).filter(x=>x>0));
  const fr=(k,v)=>k==='rel'?(v>0?Math.min(1,mnRel/v):1):Math.min(1,v/mx[k]);
  let o='<div class="s492"><div class="vs">'+(H?'vs <b>'+esc(h.name)+'</b> (▮ = la tua)':'')+'</div>';
  for(const [l,k,u] of WS431){const v=A[k];let c='';if(H){const hv=H[k];let x=k==='rel'?(v>0?hv/v:1):(hv>0?v/hv:1);x=Math.round(x*10)/10;const cl=x>=1.05?'up':x<=0.95?'dn':'eq';c='<span class="c '+cl+'">'+(cl==='eq'?'≈':'×'+x)+'</span>';}
    o+='<div class="r"><span>'+l+'</span><i><b style="width:'+(Math.max(.03,fr(k,v))*100).toFixed(1)+'%"></b>'+(H?'<em style="left:'+(fr(k,H[k])*100).toFixed(1)+'%"></em>':'')+'</i><span class="v">'+v+(u?'<small> '+u+'</small>':'')+'</span>'+(c||'<span></span>')+'</div>';}
  let why='';try{why=WHY[s.w]||'';}catch(e){}return o+(why?'<div class="ds">'+esc(why)+'</div>':'')+'</div>';}
let busy=false;
function aug(){if(busy)return;try{const hero=document.getElementById('hero484');if(!hero)return;const det=hero.querySelector('.hDet');if(!det||det.querySelector('.s492'))return;
  const c=document.querySelector('#shopList .scard.sel');if(!c)return;let s=null;try{s=sh431W(c);}catch(e){}if(!s)return;const html=stats(s);if(!html)return;busy=true;det.insertAdjacentHTML('beforeend',html);det.classList.add('st492');}catch(e){}finally{busy=false;}}
const mo=new MutationObserver(aug);const hook=()=>{const h=document.getElementById('hero484');if(h){mo.observe(h,{childList:true});aug();return true;}return false;};
if(!hook()){const iv=setInterval(()=>{if(hook())clearInterval(iv);},500);}
}catch(e){console.warn('v492',e);}})();
