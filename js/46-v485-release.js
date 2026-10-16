'use strict';
// ======================= v4.3.85 release: crafting fixed screen + filled previews, shop overlaps, debug overlay off =======================
(function(){
// RELEASE FLAG: true = test build (🐞 debug button + developer summary on), false = Play Store build
const DEBUG_BUILD=false;
const css=`
#craftScreen:not(.hidden){overflow:hidden!important;align-items:center!important}
#craftScreen>.sheet{display:flex!important;flex-direction:column!important;height:calc(100vh - 16px)!important;max-height:calc(100vh - 16px)!important;overflow:hidden!important;box-sizing:border-box}
#craftScreen>.sheet>*{flex:0 0 auto}#craftScreen .sb42{flex:1 1 auto!important;min-height:0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;max-height:none!important}#craftScreen .sb42>*{flex:0 0 auto}#craftScreen #recipes{flex:1 1 auto!important;width:min(100%,712px)!important;margin-left:auto!important;margin-right:auto!important;min-height:0!important;overflow:hidden!important;align-content:start}
#craftScreen,#craftScreen *{scrollbar-width:none}#craftScreen ::-webkit-scrollbar,#craftScreen::-webkit-scrollbar{display:none}
#craftPg482{display:flex!important}#craftPg482.one{visibility:hidden}
#craftScreen .pv481 img{width:100%;height:100%;object-fit:contain}
#shopNote{display:none!important}
#zdbgB,#zdbgP{display:none!important}body.zsDev #zdbgB{display:flex!important}body.zsDev #zdbgP{display:block!important}
`;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
try{const v=localStorage.getItem('zs_dev');if(DEBUG_BUILD){if(v!=='0')document.body.classList.add('zsDev');if(v===null)localStorage.setItem('zs_dev','1');}else{if(v==='1')document.body.classList.add('zsDev');}}catch(e){}
try{const s2=document.createElement('style');s2.textContent='body.zsDev:has(#shopScreen:not(.hidden)) #zdbgB{top:auto!important;bottom:calc(var(--sab,0px) + 8px)!important;left:calc(var(--sal,0px) + 8px)!important}';document.head.appendChild(s2);}catch(e){}
// drawn fallback for any empty/failed recipe preview
function fb(row){const t=(row.textContent||'').trim();const m=t.match(/\p{Extended_Pictographic}/u);const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
  const gr=g.createRadialGradient(48,40,6,48,48,46);gr.addColorStop(0,'#3a4152');gr.addColorStop(1,'#151820');g.fillStyle=gr;g.beginPath();g.arc(48,48,44,0,7);g.fill();
  g.textAlign='center';g.textBaseline='middle';if(m){g.font='52px sans-serif';g.fillText(m[0],48,52);}else{g.fillStyle='#e8c070';g.font='bold 44px sans-serif';g.fillText((row.querySelector('.name')||row).textContent.trim().charAt(0).toUpperCase()||'?',48,52);}return c.toDataURL();}
function fill(){const box=document.getElementById('recipes');if(!box)return;for(const row of box.querySelectorAll('.recipe')){let pv=row.querySelector('.pv481');if(!pv){pv=document.createElement('div');pv.className='pv481';row.insertBefore(pv,row.firstChild);}
  let im=pv.querySelector('img');if(!im||!im.getAttribute('src')){pv.innerHTML='';im=document.createElement('img');im.alt='';im.src=fb(row);pv.appendChild(im);}
  if(!im.__fb){im.__fb=1;im.addEventListener('error',()=>{im.src=fb(row);});if(im.complete&&im.naturalWidth===0&&im.src&&!im.src.startsWith('data:'))im.src=fb(row);}}}
// own paging: count how many cards really fit inside #recipes (pager always reserved), never a half row
try{const L0=window.craftLayout482;if(typeof L0==='function'){let busy=0,mo=null,tq=0;const L=function(){if(busy)return;busy=1;try{L0.apply(this,arguments);}catch(e){}busy=0;page();requestAnimationFrame(()=>requestAnimationFrame(page));};
  const page=function(){if(busy)return;busy=1;try{fill();
    const box=document.getElementById('recipes'),pg=document.getElementById('craftPg482');if(!box||!pg)return;pg.style.display='';
    const rows=[...box.querySelectorAll('.recipe')];if(!rows.length){pg.classList.add('one');return;}rows.forEach(r=>{if(r.style.display)r.style.removeProperty('display');});box.scrollTop=0;
    const H=box.clientHeight,t0=box.getBoundingClientRect().top;let per=0;for(const r of rows){const q=r.getBoundingClientRect();if(q.bottom-t0<=H+.5)per++;else break;}
    per=Math.max(1,per);const pages=Math.ceil(rows.length/per);if(CP482.page>=pages)CP482.page=pages-1;if(CP482.page<0)CP482.page=0;
    rows.forEach((r,i)=>{const d=(i>=CP482.page*per&&i<(CP482.page+1)*per)?'':'none';if(r.style.display!==d){if(d)r.style.setProperty('display','none','important');else r.style.removeProperty('display');}});if(mo)mo.takeRecords();
    pg.classList.toggle('one',pages<2);const sp=pg.querySelector('span');if(sp)sp.textContent=(CP482.page+1)+' / '+pages;}catch(e){}finally{busy=0;}};
  window.craftLayout482=L;try{craftLayout482=L;}catch(e){}
  try{const bx=document.getElementById('recipes');let lh=0;new ResizeObserver(()=>{const h=bx.clientHeight;if(h&&h!==lh){lh=h;requestAnimationFrame(page);}}).observe(bx);mo=new MutationObserver(()=>{if(busy||tq)return;tq=1;requestAnimationFrame(()=>{tq=0;page();});});mo.observe(bx,{childList:true,attributes:true,subtree:true,attributeFilter:['style']});document.fonts&&document.fonts.ready.then(()=>requestAnimationFrame(page));}catch(e){}}}catch(e){}
try{const _rc=window.renderCraft||renderCraft;const R=function(){const r=_rc.apply(this,arguments);requestAnimationFrame(()=>{try{window.craftLayout482();}catch(e){}});return r;};window.renderCraft=R;try{renderCraft=R;}catch(e){}}catch(e){}
try{document.getElementById('craftTabs').addEventListener('click',()=>requestAnimationFrame(()=>{try{window.craftLayout482();}catch(e){}}));}catch(e){}
addEventListener('resize',()=>{try{window.craftLayout482();}catch(e){}});
})();
