/* Zombie Survival — game code part 16-v470 (game.html lines 7775-7829 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.70: weapons bag thumbnails + touch scroll, torch fix, zombie detail =======================
const M470={on:true,err:0};function e470(e,w){M470.err++;try{console.warn('470',w,e&&e.message);}catch(_){}if(M470.err>8)M470.on=false;}
{const st=document.createElement('style');st.textContent=
 '#bag468 .c{overflow-y:auto!important;touch-action:pan-y!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scroll-behavior:auto}#bag468 .c *{touch-action:pan-y!important}'+
 '#bag468 .th470{flex:0 0 auto;width:72px;height:42px;border-radius:8px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:22px}#bag468 .th470 img{width:100%;height:100%;object-fit:contain;pointer-events:none}'+
 '#bag468 .sl470{display:flex;gap:8px;flex-wrap:wrap}#bag468 .sl470 div{display:flex;align-items:center;gap:6px;background:rgba(255,210,122,.08);border:1px solid rgba(255,210,122,.35);border-radius:9px;padding:3px 7px 3px 3px}#bag468 .sl470 em{font-style:normal;color:#ffd27a;font-weight:800}'+
 '.gun470{width:62%;height:62%;display:block;margin:auto}'+
 '#torch468{transition:background .15s,box-shadow .15s,opacity .15s}#torch468:not(.off){background:rgba(255,200,90,.9)!important;border-color:#fff3c4!important;box-shadow:0 0 14px 4px rgba(255,210,110,.75)!important;opacity:1!important;filter:none!important}'+
 '#torch468.off{background:rgba(10,14,20,.6)!important;opacity:.6!important;filter:grayscale(1)!important;box-shadow:none!important}#torch468.off::after{content:"";position:absolute;left:18%;right:18%;top:50%;height:3px;background:#ff6a5a;transform:rotate(-45deg);border-radius:2px}';
 document.head.appendChild(st);}
const GUN470='<svg class="gun470" viewBox="0 0 24 24" fill="#ffd27a" aria-hidden="true"><path d="M2 8h17l1-2h2v5h-3l-1 1h-5l-1 2h-1.5l-.8 3.5c-.2.8-.9 1.5-1.8 1.5H5.5l1.8-6H4l-2-2z"/><path d="M11 12h2.3l-.6 1.6h-1.9z" fill="#2a1d0c"/></svg>';
// ---------- 1+2) weapons bag: gun icon, thumbnails, touch scroll ----------
function th470(id){try{const t=THUMBS&&THUMBS[id];if(t)return '<div class="th470"><img alt="" src="'+t+'"></div>';}catch(e){}return '<div class="th470">🔫</div>';}
const BG470={req:0,mv:0,mt:0,y0:0,x0:0};
function thReq470(){try{if(THUMBS&&!TH43.stale)return;if(BG470.req&&performance.now()-BG470.req<4000)return;BG470.req=performance.now();
  TH43.cbs.push(()=>{try{if(BG468.open)bagRender468();hbSig='';renderWBar();}catch(e){}});thumbs43();}catch(e){e470(e,'thr');}}
{const _br=bagRender468;bagRender468=function(){_br();if(!M470.on)return;try{const el=BG468.el,c=el&&el.querySelector('.c');if(!c)return;c.classList.add('scroll');
  const nm=id=>{const w=WEAPONS.find(q=>q.id===id);return w?esc(w.name):id;};
  const rows=c.querySelectorAll('.r');
  if(!BG468.pick&&rows[0]){rows[0].innerHTML='<span><small>In mano</small><div class="sl470">'+(SL468.s.length?SL468.s.map((id,i)=>'<div>'+th470(id)+'<span><em>'+(i+1)+'</em> '+nm(id)+'</span></div>').join(''):'<small>nessuna</small>')+'</div></span>';}
  c.querySelectorAll('button[data-a="pick"]').forEach(b=>{const r=b.closest('.r');if(r&&!r.querySelector('.th470'))r.insertAdjacentHTML('afterbegin',th470(b.dataset.id));});
  if(BG468.pick){const S=SL468.s.length<2?SL468.s.concat(['']):SL468.s;c.querySelectorAll('button[data-a="put"]').forEach(b=>{const id=S[+b.dataset.i],r=b.closest('.r');if(r&&id)r.insertAdjacentHTML('afterbegin',th470(id));});
    const r0=rows[0];if(r0&&!r0.querySelector('.th470'))r0.insertAdjacentHTML('afterbegin',th470(BG468.pick));}
  thReq470();}catch(e){e470(e,'br');}};}
// tap vs drag inside the bag list: a drag never fires a button
function bagWire470(){const el=BG468.el;if(!el||el.__w470)return;el.__w470=1;
  el.addEventListener('touchstart',e=>{const t=e.touches[0];if(t){BG470.x0=t.clientX;BG470.y0=t.clientY;BG470.mv=0;}e.stopPropagation();},{passive:true,capture:true});
  el.addEventListener('touchmove',e=>{const t=e.touches[0];if(t&&Math.hypot(t.clientX-BG470.x0,t.clientY-BG470.y0)>10){BG470.mv=1;BG470.mt=performance.now();}e.stopPropagation();},{passive:true,capture:true});
  el.addEventListener('click',e=>{if(BG470.mv&&performance.now()-BG470.mt<450){e.stopPropagation();e.preventDefault();BG470.mv=0;}},{capture:true});}
{const _bo=bagOpen468;bagOpen468=function(){_bo();try{if(M470.on)bagWire470();}catch(e){e470(e,'bo');}};}
{const _rw=renderWBar;renderWBar=function(){_rw();try{if(!M470.on)return;const d=$('wbar').querySelector('[data-a="bag468"] b.te');if(d&&!d.__g){d.__g=1;d.innerHTML=GUN470;}}catch(e){e470(e,'wb');}};}
// ---------- 3) torch: always visibly on/off, day and night, every quality ----------
const TOR470={k:TOR468.on?1:0,t:0};
{const _al=applyLight;applyLight=function(){_al();if(!M470.on||!M468.on)return;try{const now=performance.now(),dt=TOR470.t?Math.min(.1,(now-TOR470.t)/1000):0;TOR470.t=now;
  const tg=TOR468.on?1:0;TOR470.k+=Math.max(-dt*6,Math.min(dt*6,tg-TOR470.k));const k=TOR470.k;if(!SV.on||k<=0)return;
  let day=1;try{day=Math.max(0,Math.min(1,hemiL.intensity/1.2));}catch(e){}
  if(window.__spot468&&TOR468.spot){TOR468.spot.intensity=Math.max(TOR468.spot.intensity,k*(14+day*22));flash.intensity=Math.max(flash.intensity,k*(1.5+day*2));}
  else flash.intensity=Math.max(flash.intensity,k*(6+day*9));}catch(e){e470(e,'al');}};}
// lower the button a bit (old 46% / 4.3.69 ~18%) and reject spots whose centre hits another control
{const _tp=torchPlace469;torchPlace469=function(){const b=TOR468.el;if(!b||!M470.on)return _tp();try{_tp();const W=innerWidth,H=innerHeight,s=b.offsetWidth||44;
  const ok=(x,y)=>{if(x<4||y<H*.24||x+s>W-4||y+s>H-4)return false;for(const [px,py] of [[.5,.5],[.15,.15],[.85,.15],[.15,.85],[.85,.85]]){const el=document.elementFromPoint(x+s*px,y+s*py);if(el&&el!==b&&!b.contains(el)&&el.closest&&el.closest('button,[id$="Btn"],.ws,#wbar,#radar,#joyBase,#topRight,#hud42,#quest42'))return false;}
    const fb=document.getElementById('fireBtn');if(fb&&fb.offsetWidth){const r=fb.getBoundingClientRect();if(x<r.right+10&&x+s>r.left-10&&y<r.bottom+10&&y+s>r.top-10)return false;}return true;};
  const cx=TOR468.pos?TOR468.pos[0]:W-s-10;let best=null;
  for(const yf of [.32,.35,.29,.38,.26,.41,.44,.24,.47,.5]){const y=Math.round(H*yf);for(const x of [cx,cx-54,cx-108]){if(ok(x,y)){best=[x,y];break;}}if(best)break;}
  if(best){b.style.left=best[0]+'px';b.style.top=best[1]+'px';TOR468.pos=best;}}catch(e){e470(e,'tp');}};}
// the button lived inside #hud (z 5) under #controls/#lookZone: taps went to the camera-look zone. Lift it above.
try{const b=TOR468.el;if(b){document.body.appendChild(b);b.style.zIndex='40';}}catch(e){e470(e,'tz');}
// ---------- 4) zombie detail: per-triangle grime / blood stains baked into vertex colours (no extra draw calls) ----------
function zGrime470(z){try{z.g.traverse(m=>{if(!m.isMesh||m.material!==z.mat||m.__g470)return;m.__g470=1;const c=m.geometry.attributes.color;if(!c)return;const a=c.array,n=c.count;
  for(let i=0;i+2<n;i+=3){const r=Math.random();let f=.8+Math.random()*.24,br=0;if(r<.05)br=.75;else if(r<.09)br=.4;else if(r<.14)f*=.62;
    for(let j=0;j<3;j++){const o=(i+j)*3;let R=a[o]*f,G=a[o+1]*f,B=a[o+2]*f;if(br){R=R*(1-br)+.32*br;G=G*(1-br)+.04*br;B=B*(1-br)+.035*br;}a[o]=R;a[o+1]=G;a[o+2]=B;}}c.needsUpdate=true;});}catch(e){e470(e,'gr');}}
try{for(const z of zombies)zGrime470(z);}catch(e){e470(e,'gr0');}
// shop thumbnails once, idle, while still in the menu (never during play)
{let tq=0;const tick=()=>{try{if(!M470.on)return;if(THUMBS&&!TH43.stale)return;if(game.state==='menu'&&!(LD431.on||LD431.hold)){if(++tq>2){thumbs43();return;}}}catch(e){e470(e,'thm');return;}setTimeout(tick,2500);};setTimeout(tick,6000);}
window.__zs470={bagOpen:()=>{bagOpen468();return BG468.el&&BG468.el.innerHTML.length;},bagClose:()=>bagClose468(),torch:v=>{torchSet468(v);for(let i=0;i<30;i++){TOR470.t=performance.now()-50;applyLight();}return {on:TOR468.on,k:TOR470.k,fi:flash.intensity,spot:TOR468.spot?TOR468.spot.intensity:null};},place:()=>{torchPlace469();return TOR468.pos;},get m(){return M470;}};
