// 4.3.91 home finder arrow + co-op partner markers (radar + HUD arrows). Cheap: DOM transform update every 100 ms, no allocations per frame.
(function(){try{
const st=document.createElement('style');st.textContent='#nav491{position:fixed;left:50%;top:calc(50px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:flex;gap:10px;z-index:60;pointer-events:none;font:800 11px/1 system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000}#nav491.hidden,#nav491 .n.hidden{display:none}#nav491 .n{display:flex;align-items:center;gap:3px;background:rgba(0,0,0,.35);border-radius:10px;padding:2px 6px 2px 3px;opacity:.85}#nav491 .a{width:18px;height:18px;display:block;will-change:transform}';
document.head.appendChild(st);
const box=document.createElement('div');box.id='nav491';box.className='hidden';
const mk=(col,lab)=>{const d=document.createElement('div');d.className='n hidden';d.innerHTML='<svg class="a" viewBox="0 0 20 20"><path d="M10 1 L17 17 L10 13 L3 17 Z" fill="'+col+'" stroke="#000" stroke-width="1.2"/></svg><span>'+lab+'</span>';box.appendChild(d);return {d,a:d.firstChild,t:d.lastChild,last:''};};
const H=mk('#7dff8a','🏠 '),PT=[];document.body.appendChild(box);
const S={spawn:null,base:null,bt:0,t:0};
const playing=()=>{try{return typeof game!=='undefined'&&(game.state==='play'||game.state==='playing')&&typeof player!=='undefined'&&player&&player.pos&&!(window.__arena454&&__arena454.busy&&__arena454.busy());}catch(e){return false;}};
function home(){const now=performance.now();if(now-S.bt>1000){S.bt=now;S.base=null;try{let b=null;const pb=(typeof P42!=='undefined'&&P42.bed)||null;for(const p of PIECES)if(p.alive&&p.type==='bed'){if(pb&&p.x===pb[0]&&p.z===pb[1]){b=p;break;}if(!b)b=p;}if(b)S.base={x:b.x,z:b.z};}catch(e){}}return S.base;}
function aim(o,x,z,label,hideNear){const dx=x-player.pos.x,dz=z-player.pos.z,d=Math.hypot(dx,dz);if(d<hideNear){if(!o.d.classList.contains('hidden'))o.d.classList.add('hidden');return;}
  o.d.classList.remove('hidden');const r=Math.atan2(dx,-dz)+player.yaw;o.a.style.transform='rotate('+r.toFixed(2)+'rad)';const s=label+Math.round(d)+'m';if(s!==o.last){o.last=s;o.t.textContent=s;}}
function partners(){try{const M=window.MP&&MP.M;if(!M||!M.inMatch||!M.remotes)return null;return M;}catch(e){return null;}}
function tick(){try{if(!playing()){if(!box.classList.contains('hidden'))box.classList.add('hidden');try{if(game.state==='menu'||game.state==='over')S.spawn=null;}catch(e){}return;}
  if(!S.spawn)S.spawn={x:player.pos.x,z:player.pos.z};box.classList.remove('hidden');
  const h=home();if(h)aim(H,h.x,h.z,'🏠 ',8);else H.d.classList.add('hidden');
  const M=partners();let i=0;if(M){for(const r of M.remotes.values()){if(r.dead)continue;const p=M.players.find(q=>q.pid===r.pid)||{};const pos=r.ch&&r.ch.root.position;if(!pos)continue;
      if(!PT[i])PT[i]=mk(['#ffd27a','#7ac8ff','#ff9a7a','#b6f08a'][(p.slot|0)%4],'');aim(PT[i],pos.x,pos.z,(p.name||'?').slice(0,10)+' ',4);i++;}}
  for(;i<PT.length;i++)PT[i].d.classList.add('hidden');}catch(e){}}
setInterval(tick,100);
// partner markers on the radar (minimap), drawn on top after the normal draw
if(typeof drawRadar==='function'){const o=drawRadar;drawRadar=function(){const r=o.apply(this,arguments);try{drawHome492();}catch(e){}try{const M=partners();if(!M||!M.remotes.size)return r;
  const W=radar.width,Hh=radar.height,u=W/168,sc=(W/2)/58,g=rctx;g.save();g.font='bold '+Math.round(9*u)+'px sans-serif';g.textAlign='center';g.textBaseline='bottom';g.lineWidth=3*u;g.strokeStyle='rgba(0,0,0,.8)';
  for(const rm of M.remotes.values()){const pos=rm.ch&&rm.ch.root.position;if(!pos)continue;const p=M.players.find(q=>q.pid===rm.pid)||{};const col=['#ffd27a','#7ac8ff','#ff9a7a','#b6f08a'][(p.slot|0)%4];
    let x=W/2+(pos.x-player.pos.x)*sc,y=Hh/2+(pos.z-player.pos.z)*sc;const m=6*u;x=Math.max(m,Math.min(W-m,x));y=Math.max(m+10*u,Math.min(Hh-m,y));
    g.fillStyle=col;g.beginPath();g.arc(x,y,4.2*u,0,6.283);g.fill();g.stroke();g.beginPath();g.arc(x,y,4.2*u,0,6.283);g.fill();g.strokeText(p.name||'?',x,y-5*u);g.fillText(p.name||'?',x,y-5*u);}
  g.restore();}catch(e){}return r;};}
function drawHome492(){if(typeof radar==='undefined'||!radar||!playing())return;const h=home();if(!h)return;const W=radar.width,Hh=radar.height,u=W/168,sc=(W/2)/58,g=rctx;
  let dx=(h.x-player.pos.x)*sc,dy=(h.z-player.pos.z)*sc;const m=9*u,lim=W/2-m,limy=Hh/2-m,out=Math.abs(dx)>lim||Math.abs(dy)>limy;
  if(out){const k=Math.min(lim/Math.abs(dx||1e-6),limy/Math.abs(dy||1e-6));dx*=k;dy*=k;}const x=W/2+dx,y=Hh/2+dy;g.save();
  g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(x,y,7.5*u,0,6.283);g.fill();g.strokeStyle='#7dff8a';g.lineWidth=1.6*u;g.stroke();
  if(out){const a=Math.atan2(dy,dx);g.fillStyle='#7dff8a';g.beginPath();g.moveTo(x+Math.cos(a)*11*u,y+Math.sin(a)*11*u);g.lineTo(x+Math.cos(a+.5)*7*u,y+Math.sin(a+.5)*7*u);g.lineTo(x+Math.cos(a-.5)*7*u,y+Math.sin(a-.5)*7*u);g.fill();}
  g.font=Math.round(10*u)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🏠',x,y+.5*u);g.restore();}
window.__nav491={tick,S,home,drawHome492};
}catch(e){console.warn('nav491',e);}})();
