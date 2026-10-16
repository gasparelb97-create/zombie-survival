'use strict';
// ======================= v4.3.84 shop rebuilt: header with balances, big hero preview of selected item, swipe cards with big price buttons =======================
(function(){if(typeof renderShop!=='function')return;
const css=`
#shopScreen:not(.hidden){display:grid!important;position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;grid-template-columns:clamp(250px,37vw,320px) 1fr;grid-template-rows:44px 34px 1fr;gap:6px 10px;padding:8px 12px 10px!important;box-sizing:border-box;background:radial-gradient(120% 90% at 30% 0%,#1d2233 0%,#0d0f16 60%,#08090d 100%)!important;backdrop-filter:none!important;overflow:hidden!important}
#shopScreen>.shopHead{grid-column:1/3;grid-row:1;display:flex!important;align-items:center;gap:8px;margin:0!important;padding:0!important;min-width:0}
#shopScreen>.shopHead h2{flex:1;margin:0;font-size:22px!important;letter-spacing:2px;color:#fff;white-space:nowrap}
#shopScreen .bal484{display:flex;align-items:center;gap:6px;height:32px;padding:0 12px 0 6px;border-radius:16px;background:#151a26;border:1px solid #2c3550;font:800 17px/1 system-ui,sans-serif;color:#fff;white-space:nowrap}
#shopScreen .bal484 i{width:22px;height:22px;display:inline-block;border-radius:50%}
#shopScreen .bal484.c i{background:radial-gradient(circle at 35% 30%,#fff3b0,#f4c430 40%,#b07a10 100%);box-shadow:inset 0 0 0 2px #8a5c08}
#shopScreen .bal484.g i{border-radius:4px;transform:rotate(45deg) scale(.78);background:linear-gradient(135deg,#d9f6ff,#45c4ff 45%,#1a6fd0);box-shadow:0 0 6px #45c4ff}
#shopScreen>.shopHead .gemPill{display:none!important}
#shopScreen>#shopTabs{grid-column:1/3;grid-row:2;display:flex!important;gap:6px;margin:0!important;padding:0!important}
#shopScreen>#shopTabs .tab{height:32px;padding:0 14px!important;font-size:13px!important;font-weight:800;border-radius:16px}
#shopScreen>#shopNote{display:none!important}
#hero484{grid-column:1;grid-row:3;align-self:stretch;min-height:0;height:100%;display:flex;flex-direction:column;gap:5px;padding:8px 10px;border-radius:14px;background:linear-gradient(180deg,#1b2131,#11141d);border:1px solid #2b3349;overflow:hidden;box-sizing:border-box}
#hero484 .hImg{height:30%;min-height:58px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:radial-gradient(70% 80% at 50% 55%,rgba(120,150,220,.22),rgba(0,0,0,0) 70%)}
#hero484 .hImg img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6))}
#hero484 .hImg .emo{font-size:46px}#hero484 .hImg .gemBig{font-size:30px!important;line-height:1!important;white-space:nowrap}#hero484 .hImg{overflow:hidden}
#hero484 .hName{font:900 17px/1.1 system-ui,sans-serif;color:#fff;white-space:normal;overflow:hidden}
#hero484 .hRar{font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#9fb0d0;white-space:normal;overflow:hidden}
#hero484 .hDet{flex:1;min-height:0;overflow:hidden;font-size:12px;line-height:1.25;color:#c9d2e4}
#hero484 .hDet .sbar{display:grid;grid-template-columns:72px 1fr;align-items:center;gap:6px;margin:2px 0;font-size:12px;font-weight:700;color:#dfe6f3}
#hero484 .hDet .sbar i{display:block;height:7px;border-radius:4px;background:#2a3044;overflow:hidden}#hero484 .hDet .sbar b{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#ffb347,#ffd76a)}
#hero484 .hDet .sdesc{margin-top:3px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
#hero484 .hBuy{display:flex;gap:6px}#hero484 .hBuy button{flex:1;height:40px;border-radius:12px;border:0;font:900 18px/1 system-ui,sans-serif;color:#fff;background:linear-gradient(180deg,#3ad07a,#1f9a52);box-shadow:0 3px 0 #136b37}
#hero484 .hBuy button.poor{background:linear-gradient(180deg,#5a6273,#3b4150);box-shadow:0 3px 0 #252a35;color:#d6dbe6}
#hero484 .hBuy button.own{background:linear-gradient(180deg,#3a4256,#272d3c);box-shadow:0 3px 0 #1a1f2a;font-size:15px}
#hero484 .hBuy button.eye{flex:0 0 44px;background:#2a3044;box-shadow:0 3px 0 #1a1f2a}
#shopScreen>#shopList{grid-column:2;grid-row:3;padding-top:3px!important;align-self:stretch!important;justify-self:stretch!important;position:relative!important;top:auto!important;bottom:auto!important;left:auto!important;right:auto!important;transform:none!important;max-height:none!important;flex:none!important;width:auto!important;min-height:0;height:100%!important;align-items:stretch!important;display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:8px!important;overflow-x:auto!important;overflow-y:hidden!important;touch-action:pan-x!important;scroll-snap-type:none!important;padding:2px 2px 4px!important;margin:0!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
#shopScreen>#shopList::-webkit-scrollbar{display:none}
#shopList .scard.c484{flex:0 0 138px!important;width:138px!important;height:100%!important;max-height:100%!important;min-height:0!important;align-self:stretch!important;margin:0!important;padding:6px!important;box-sizing:border-box;display:flex!important;flex-direction:column!important;gap:3px;border-radius:12px!important;position:relative;overflow:hidden!important;background:linear-gradient(180deg,#1a1f2d,#10131b)!important;border:2px solid #283049!important}
#shopList .scard.c484.sel{box-shadow:0 0 0 2px #fff,0 0 16px rgba(255,255,255,.35)!important}
#shopList .scard.c484.r-comune{border-color:#6b7488!important}#shopList .scard.c484.r-raro{border-color:#3f8cff!important}#shopList .scard.c484.r-epico{border-color:#a04dff!important}#shopList .scard.c484.r-leggendario{border-color:#ffb52e!important}
#shopList .scard.c484.r-raro{background:linear-gradient(180deg,#16233d,#10131b)!important}#shopList .scard.c484.r-epico{background:linear-gradient(180deg,#26173d,#10131b)!important}#shopList .scard.c484.r-leggendario{background:linear-gradient(180deg,#36270f,#10131b)!important}
#shopList .r-raro .cRar,#hero484.r-raro .hRar{color:#6fb0ff!important}#shopList .r-epico .cRar,#hero484.r-epico .hRar{color:#c48aff!important}#shopList .r-leggendario .cRar,#hero484.r-leggendario .hRar{color:#ffc65a!important}
#hero484.r-raro{border-color:#3f8cff}#hero484.r-epico{border-color:#a04dff}#hero484.r-leggendario{border-color:#ffb52e}
#shopList .c484 .cImg{flex:1 1 0;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center}
#shopList .c484 .cImg img{width:100%;height:100%;object-fit:contain}#shopList .c484 .cImg .emo{font-size:38px}#shopList .c484 .cImg .gemBig{font-size:22px;font-weight:900;color:#bfefff}
#shopList .c484 .cName{font:800 13px/1.12 system-ui,sans-serif;color:#fff;white-space:normal;overflow:hidden;text-overflow:clip;word-break:normal;overflow-wrap:anywhere;max-height:2.3em}
#shopList .c484 .cRar{font-size:10px;line-height:1.15;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#93a2c0;white-space:normal;overflow:hidden;text-overflow:clip;max-height:2.35em}
#shopList .c484 .sbtns{display:flex!important;gap:4px;margin:0!important;flex-wrap:nowrap!important}
#shopList .c484 .sbtns button{flex:1;min-width:0;height:34px!important;padding:0 4px!important;font:900 16px/1 system-ui,sans-serif!important;border-radius:10px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#shopList .c484 .sbtns button[data-prova],#shopList .c484 .sbtns button.eye{flex:0 0 34px}
#shopList .c484 .bGem,#hero484 .hBuy button.g{background:linear-gradient(180deg,#4fb6ff,#1f6fd6)!important;color:#fff!important;box-shadow:0 3px 0 #164a92!important;border:0!important}
#shopList .c484 .bCoin,#hero484 .hBuy button.c{background:linear-gradient(180deg,#ffd45a,#e09a12)!important;color:#2a1a00!important;box-shadow:0 3px 0 #9a6608!important;border:0!important}
#shopList .c484 .bGem.poor,#shopList .c484 .bCoin.poor{filter:saturate(.35) brightness(.8)}
#shopList .c484 .sthumb{width:100%!important;height:100%!important;min-height:0!important;margin:0!important;display:flex;align-items:center;justify-content:center;background:none!important}
#hero484 .hImg .sthumb{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:none!important}
#shopList .c484 .bOwn{font-size:12px!important}
#shopList .c484 .ownTag,#shopList .c484 .bestTag{position:absolute;top:5px;left:5px;z-index:2;font-size:9px!important;padding:2px 6px!important;border-radius:6px;max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;
const st=document.createElement('style');st.id='shop484css';st.textContent=css;document.head.appendChild(st);
const S=document.getElementById('shopScreen'),L=document.getElementById('shopList');if(!S||!L)return;
const head=S.querySelector('.shopHead');let bc=null,bg=null;
if(head){bc=document.createElement('div');bc.className='bal484 c';bg=document.createElement('div');bg.className='bal484 g';const x=head.querySelector('.closeX');head.insertBefore(bc,x);head.insertBefore(bg,x);}
const hero=document.createElement('div');hero.id='hero484';S.appendChild(hero);
const fmt4=n=>{try{return fmt(n);}catch(e){return String(n|0);}};
function bal(){try{if(bc)bc.innerHTML='<i></i>'+fmt4(typeof P42!=='undefined'?P42.c:0);if(bg)bg.innerHTML='<i></i>'+fmt4(PROF.gems);}catch(e){}}
let selKey='';
function keyOf(c){const b=c.querySelector('[data-buy],[data-eq],[data-cbuy],[data-adgem]');return b?(b.dataset.buy||b.dataset.eq||b.dataset.cbuy||'ad'):(c.__n||'');}
function wid(c){const b=c.querySelector('[data-eq],[data-buy],[data-prova],[data-cbuy]');if(!b)return '';const d=b.dataset;if(d.eq)return d.eq;if(d.prova)return d.prova;
  try{const id=d.buy||'';let s=SHOP_W.find(q=>q.id===id);if(!s&&d.cbuy){const c2=CSHOP.find(q=>q.id===d.cbuy);if(c2&&c2.w)s=SHOP_W.find(q=>q.id===c2.w);}return s?s.w:'';}catch(e){return '';}}
function fit484(el,max,min,lines){if(!el)return;let f=max;el.style.fontSize=f+'px';const lh=()=>parseFloat(getComputedStyle(el).lineHeight)||f*1.15;let g=0;while(el.scrollHeight>lh()*lines+1&&f>min&&g++<12){f-=.5;el.style.fontSize=f+'px';}}
function fitAll484(){try{for(const e of L.querySelectorAll('.c484 .cName'))fit484(e,13,9,2);for(const e of L.querySelectorAll('.c484 .cRar'))fit484(e,10,7.5,2);fit484(hero.querySelector('.hName'),17,12,2);fit484(hero.querySelector('.hRar'),11,8,2);}catch(e){}}
function build(){try{bal();for(const c of [...L.querySelectorAll('.scard')]){if(c.classList.contains('c484'))continue;
    const th=c.querySelector('.sthumb'),nm=c.querySelector('.sname'),rr=c.querySelector('.srar'),bt=c.querySelector('.sbtns'),body=c.querySelector('.sbody');
    let w=wid(c);if(!w&&nm)try{const ww=WEAPONS.find(q=>q.name===nm.textContent.trim());if(ww)w=ww.id;}catch(e){}let img=th?th.outerHTML:'';if(w&&typeof wArt482==='function'){const u=wArt482(w);if(u)img='<img alt="" src="'+u+'">';}else if(typeof window.icon484==='function'){const u=window.icon484(keyOf(c));if(u)img='<img alt="" src="'+u+'">';}
    const det=document.createElement('div');if(body)for(const ch of [...body.children])if(ch!==nm&&ch!==rr&&ch!==bt)det.appendChild(ch.cloneNode(true));
    c.__d={img,name:nm?nm.textContent:'',rar:rr?rr.innerHTML:'',det:det.innerHTML};c.__n=c.__d.name;
    const tags=[...c.querySelectorAll('.ownTag,.bestTag')];c.innerHTML='';tags.forEach(t=>c.appendChild(t));
    const ci=document.createElement('div');ci.className='cImg';ci.innerHTML=img;c.appendChild(ci);
    const n=document.createElement('div');n.className='cName';n.textContent=c.__d.name;c.appendChild(n);
    const r=document.createElement('div');r.className='cRar';r.innerHTML=c.__d.rar;c.appendChild(r);
    if(bt){for(const b of [...bt.querySelectorAll('button')])if(b.dataset.prova||/👁/.test(b.textContent)||b.classList.contains('eye'))b.remove();c.appendChild(bt);}c.classList.add('c484');}
  const cs=[...L.querySelectorAll('.scard.c484')];let s=cs.find(c=>keyOf(c)===selKey)||cs.find(c=>keyOf(c)!=='starter')||cs[0];select(s);fitAll484();}catch(e){console.warn('shop484',e);}}
function select(c){for(const x of L.querySelectorAll('.scard.sel'))x.classList.remove('sel');if(!c||!c.__d){hero.innerHTML='';return;}c.classList.add('sel');selKey=keyOf(c);const d=c.__d;hero.className=[...c.classList].filter(x=>/^r-/.test(x)).join(' ');
  hero.innerHTML='<div class="hImg">'+d.img+'</div><div class="hName"></div><div class="hRar">'+d.rar+'</div><div class="hDet">'+d.det+'</div><div class="hBuy"></div>';hero.querySelector('.hName').textContent=d.name;
  const hb=hero.querySelector('.hBuy');for(const b of c.querySelectorAll('.sbtns button')){const p=document.createElement('button');const eye=!!b.dataset.prova||/👁/.test(b.textContent);
    p.textContent=eye?'👁':(b.dataset.m==='gem'||b.classList.contains('bGem')||b.classList.contains('bCoin')?'Compra  '+b.textContent.trim():b.textContent.trim());
    p.className=(b.classList.contains('bGem')?'g ':b.classList.contains('bCoin')?'c ':'')+(b.classList.contains('poor')?'poor':'')+(b.classList.contains('bOwn')?' own':'')+(eye?' eye':'');p.disabled=b.disabled;p.addEventListener('click',ev=>{ev.stopPropagation();b.click();});hb.appendChild(p);}fitAll484();}
L.addEventListener('click',e=>{const c=e.target.closest('.scard.c484');if(!c)return;if(e.target.closest('button'))return;
  // 4.3.86: a card tap only selects (no extra screen); diamond packs go straight to purchase
  e.stopPropagation();e.preventDefault();let gemTab=false;try{gemTab=shopTab==='gems';}catch(_){}
  if(gemTab){const b=c.querySelector('button:not([disabled])');if(b)b.click();return;}if(!c.classList.contains('sel'))select(c);},true);
const _rs=renderShop;renderShop=function(){const r=_rs.apply(this,arguments);build();requestAnimationFrame(()=>{build();requestAnimationFrame(build);});return r;};try{window.renderShop=renderShop;}catch(e){}
bal();
})();

try{const st2=document.createElement('style');st2.textContent='#shopList .c484 .sthumb img,#hero484 .hImg img,#shopList .c484 .cImg>img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;margin:0!important;transform:none!important}#shopList .c484 .sthumb,#hero484 .sthumb{position:static!important;height:100%!important;min-height:0!important;max-height:100%!important;padding:0!important}#hero484 .hImg{flex:0 0 26%}#hero484 .hDet .sbar{margin:1px 0!important}#hero484{gap:3px!important}#shopList .c484 .sthumb .emo,#shopList .c484 .sthumb .gemBig{display:block!important;font-size:40px!important;opacity:1!important;visibility:visible!important;line-height:1!important}#shopList .c484 .sthumb .gemBig{font-size:22px!important}';document.head.appendChild(st2);}catch(e){}
