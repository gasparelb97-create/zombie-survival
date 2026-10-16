'use strict';
// ======================= v4.3.82 UI fixes (790x360): shop backdrop/art/buttons/carousel, crafting paging by real height, coal icon, no-scroll servizi/potenziamenti =======================
(function(){
const st=document.createElement('style');st.textContent=
 // shop: fully opaque dark backdrop (home must not show through)
 '#shopScreen{background:radial-gradient(120% 90% at 50% 0,#1a1426 0,#0b0910 70%)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}#shopScreen>.sheet,#shopScreen .sheetBg{background:transparent!important}'+
 // shop cards: big illustration at the top
 '#shopList .scard .sthumb{flex:0 0 auto!important;height:clamp(64px,25vh,100px)!important;max-height:none!important;min-height:0!important;display:flex!important;align-items:center;justify-content:center;padding:2px 4px!important;box-sizing:border-box}'+
 '#shopList .scard .sthumb img{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;image-rendering:auto}'+
 '#shopList .scard .sbtns{display:flex!important;gap:6px;flex-wrap:nowrap}#shopList .scard .sbtns button{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 // carousel starts aligned, whole cards snap
 'html body #shopList{overflow-x:auto!important;overflow-y:hidden!important;touch-action:pan-x!important;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scroll-snap-type:none!important;scroll-behavior:auto}html body #shopList *{touch-action:pan-x!important}#shopList .scard{scroll-snap-align:none!important}'+
 
 // crafting
 '#recipes{overflow:hidden!important}#recipes .sub2{grid-column:1/-1;margin:0 0 2px!important}#craftScreen .sheet,#craftScreen .sb42{overflow:hidden!important}'+
 '.pv481{display:flex;align-items:center;justify-content:center}.pv481 img{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important}';
document.head.appendChild(st);
// coal glyph missing in Android fonts (⚫) -> safe glyph

// APK: diamond weapons/equipment only with diamonds (no €/Stars button on items; gem packs untouched)
try{const _bb=buyBtns;buyBtns=function(id){let h=_bb.apply(this,arguments)||'';if(window.__zsApk&&GEM_PRICES&&GEM_PRICES[id]!=null)h=h.replace(/<button class="b(Euro|Star)[^"]*"[^>]*>[^<]*<\/button>/g,'');return h;};window.buyBtns=buyBtns;}catch(e){}
// shop: force drawn art on every weapon card + reset carousel to the first whole card
function shopFix(){try{const L=document.getElementById('shopList');if(!L)return;for(const c of L.querySelectorAll('.scard')){const b=c.querySelector('[data-eq],[data-buy]');if(!b)continue;let wid=b.dataset.eq||'';
    if(!wid){const id=b.dataset.buy;const s=(typeof SHOP_W!=='undefined'?SHOP_W:[]).find(q=>q.id===id);if(s)wid=s.w;else if(typeof CSHOP!=='undefined'){const q=CSHOP.find(x=>x.id===id);if(q&&q.w)wid=String(q.w).replace(/^w_/,'');}}
    if(!wid||typeof wArt482!=='function')continue;const u=wArt482(wid);if(!u)continue;const th=c.querySelector('.sthumb');if(!th)continue;let im=th.querySelector('img');if(!im){th.innerHTML='';im=document.createElement('img');im.alt='';th.appendChild(im);}if(im.src!==u)im.src=u;}
  }catch(e){}}
for(const k of ['renderShop','openShop']){try{const f=window[k];if(typeof f!=='function')continue;window[k]=function(){const L=document.getElementById('shopList'),sl=L?L.scrollLeft:0;const r=f.apply(this,arguments);shopFix();if(L){if(k==='openShop'){L.scrollLeft=0;L.scrollTop=0;}else if(L.scrollLeft!==sl)L.scrollLeft=sl;}return r;};}catch(e){}}
// 4.3.83: swipe only (arrows removed). Root cause of the blocked swipe was scroll-snap fighting the game's own manual scroll fallback (SCR422): every scrollLeft step was snapped back.
try{const L=document.getElementById('shopList');L.addEventListener('touchmove',e=>{e.stopPropagation();},{passive:true});}catch(e){}
try{renderShop=window.renderShop;openShop=window.openShop;}catch(e){}
try{document.getElementById('shopTabs').addEventListener('click',()=>setTimeout(()=>{const L=document.getElementById('shopList');if(L){L.scrollLeft=0;L.scrollTop=0;}shopFix();},0));}catch(e){}
// crafting: rows per page from real card height; header lines (sub2) included; works for every tab (ricette, potenziamenti, servizi)
try{window.craftLayout482=craftLayout482=function(){try{const box=$('recipes'),scr=$('craftScreen');if(!box||!scr||scr.classList.contains('hidden'))return;const rows=[...box.querySelectorAll('.recipe')];
  for(const row of rows){let pv=row.querySelector('.pv481');if(!pv){pv=document.createElement('div');pv.className='pv481';row.insertBefore(pv,row.firstChild);}
    const k=recipeKey482(row);if(pv.dataset.k!==k||!pv.querySelector('img')){pv.dataset.k=k;pv.innerHTML='';const u=cIcon482(k);if(u){const im=document.createElement('img');im.alt='';im.src=u;pv.appendChild(im);}}}
  const W=box.clientWidth;if(!W)return;const cols=W>=720?3:W>=460?2:1;box.style.gridTemplateColumns='repeat('+cols+',minmax(0,1fr))';
  rows.forEach(r=>r.style.display='');let hdr=0;for(const c of box.children)if(!c.classList.contains('recipe')&&c.offsetParent!==null)hdr+=c.getBoundingClientRect().height+4;
  const H=box.clientHeight-hdr;let rh=0;for(const r of rows)rh=Math.max(rh,r.getBoundingClientRect().height);const gap=parseFloat(getComputedStyle(box).rowGap)||6;
  const per=cols*Math.max(1,Math.floor((H+gap)/((rh||74)+gap)));const pages=Math.max(1,Math.ceil(rows.length/per));if(CP482.page>=pages)CP482.page=pages-1;
  rows.forEach((r,i)=>{r.style.display=(i>=CP482.page*per&&i<(CP482.page+1)*per)?'':'none';});box.scrollTop=0;
  let pg=$('craftPg482');if(!pg){pg=document.createElement('div');pg.id='craftPg482';pg.innerHTML='<button type="button" data-p="-1">‹</button><span></span><button type="button" data-p="1">›</button>';box.parentNode.insertBefore(pg,box.nextSibling);
    pg.addEventListener('click',e=>{const b=e.target.closest('button[data-p]');if(!b)return;CP482.page=Math.max(0,CP482.page+(+b.dataset.p));craftLayout482();});}
  pg.style.display=pages>1?'flex':'none';pg.querySelector('span').textContent=(CP482.page+1)+' / '+pages;}catch(e){console.warn('craft482',e);}};}catch(e){}
try{const _rc=renderCraft;renderCraft=function(){const r=_rc.apply(this,arguments);requestAnimationFrame(()=>{try{craftLayout482();}catch(e){}});return r;};window.renderCraft=renderCraft;}catch(e){}
try{document.getElementById('craftTabs').addEventListener('click',()=>{CP482.page=0;});}catch(e){}
})();
