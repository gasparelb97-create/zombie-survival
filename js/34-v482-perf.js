'use strict';
// ======================= v4.3.82 perf: chunked shader precompile (no 2.8 s freeze), all viewmodels incl. melee, persistent pre-rendered music =======================
// three r160 compileAsync() calls compile() synchronously first -> all programs are linked in ONE task. Here: one object per step, yield after each new program or 8 ms.
// 4.3.89: with KHR_parallel_shader_compile the driver links in background threads; wait (non-blocking poll) until the new programs are ready
function waitReady(next){let n=0;const pr=()=>{let busy=false;try{const L=renderer.info.programs||[];for(let k=L.length-1;k>=0&&k>=L.length-4;k--){const p=L[k];if(p&&typeof p.isReady==='function'&&!p.isReady()){busy=true;break;}}}catch(e){}if(busy&&++n<25)setTimeout(pr,16);else setTimeout(next,0);};pr();}
function chunkCompile482(list,tag){return new Promise(res=>{let i=0,n=0;const t0=performance.now();const P=()=>renderer.info.programs?renderer.info.programs.length:0;
  const step=()=>{window.__busy482=performance.now();const s=performance.now(),p0=P();try{while(i<list.length){const [o,cam,sc]=list[i++];if(!o||!o.isObject3D)continue;const kids=o.children;o.children=[];
        try{renderer.compile(o,cam,sc||o);}catch(e){}finally{o.children=kids;}n++;if(P()>p0||performance.now()-s>8)break;}}catch(e){}
    if(window.__dbg482)try{__dbg482.ev('compila shader '+tag,P());}catch(e){}
    if(i<list.length&&performance.now()-t0<20000)waitReady(step);else{window.__busy482=0;CC482.last={tag,ms:Math.round(performance.now()-t0),obj:n,prog:P()};res(CC482.last);}};setTimeout(step,0);});}
const CC482={last:null};
function ccList482(){const L=[];const add=(root,cam,sc)=>{try{root.traverse(o=>{if(o.material)L.push([o,cam,sc]);});}catch(e){}};
  try{add(scene,camera,scene);}catch(e){}try{if(typeof vmScene!=='undefined')add(vmScene,vmCam,vmScene);}catch(e){}return L;}
// build every hi-detail viewmodel (melee included) in small steps, then compile
function vmAll482(){return new Promise(res=>{let ks=[];try{ks=Object.keys(VM||{});}catch(e){}const hi=typeof GFX43==='undefined'||GFX43.q!=='bassa';let i=0;
  const st=()=>{const s=performance.now();while(i<ks.length&&performance.now()-s<10){try{if(hi)vmBuild43(ks[i]);}catch(e){}i++;}if(i<ks.length)setTimeout(st,0);else{try{vmMode43(hi);}catch(e){}res();}};st();});}
window.__cc482={compile:chunkCompile482,list:ccList482,vmAll:vmAll482,stat:CC482};
// ---- music: pre-rendered loops cached in IndexedDB (render once per device, then 0 nodes and no offline render at launch) ----
(function(){if(typeof renderTheme!=='function'||!window.indexedDB)return;const VER='m482a';let dbp=null;
  const db=()=>dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('zs_mus482',1);r.onupgradeneeded=()=>{try{r.result.createObjectStore('b');}catch(e){}};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));
  const get=k=>db().then(d=>new Promise(res=>{try{const q=d.transaction('b').objectStore('b').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);}catch(e){res(null);}})).catch(()=>null);
  const put=(k,v)=>db().then(d=>{try{d.transaction('b','readwrite').objectStore('b').put(v,k);}catch(e){}}).catch(()=>{});
  const _rt=renderTheme;renderTheme=function(k){const key=VER+'|'+k+'|'+MSR;const self=this,args=arguments;
    return get(key).then(v=>{if(v&&v.d&&v.d.length){try{const c=AU.ctx||new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,1,MSR);const b=c.createBuffer(1,v.d.length,v.sr||MSR);b.getChannelData(0).set(v.d);return b;}catch(e){}}
      return Promise.resolve(_rt.apply(self,args)).then(b=>{try{if(b)put(key,{sr:b.sampleRate,d:b.getChannelData(0).slice()});}catch(e){}return b;});});};window.renderTheme=renderTheme;})();
// startup: chunked precompile behind the loading screen (boot waits on __pc482, max 8 s)
setTimeout(()=>{try{try{if(typeof arenaBuild454==='function')arenaBuild454();}catch(e){}vmAll482().then(()=>chunkCompile482(ccList482(),'avvio')).then(r=>{try{window.__pc482r&&__pc482r(r);}catch(e){}});}catch(e){try{window.__pc482r&&__pc482r();}catch(x){}}},0);
