'use strict';
// ======================= v4.3.82 device identity: gilda / classifica / segnalazioni senza Telegram =======================
const ID482=(()=>{const rnd=n=>{const a=new Uint8Array(n);try{crypto.getRandomValues(a);}catch(e){for(let i=0;i<n;i++)a[i]=Math.random()*256|0;}return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');};
  let o=null;try{o=JSON.parse(localStorage.getItem('zs_dev482')||'null');}catch(e){}
  if(!o||!/^[a-f0-9]{16,32}$/.test(o.did||'')||!/^[a-f0-9]{32,64}$/.test(o.sec||'')){o={did:rnd(12),sec:rnd(24),nick:'',tok:'',exp:0};try{localStorage.setItem('zs_dev482',JSON.stringify(o));}catch(e){}}return o;})();
function id482Save(){try{localStorage.setItem('zs_dev482',JSON.stringify(ID482));}catch(e){}}
function id482Tg(){try{const W=window.Telegram&&Telegram.WebApp;return !!(W&&W.initData);}catch(e){return false;}}
let id482Busy=0;
function id482Register(force){if(id482Busy||typeof ZS_API==='undefined'||!ZS_API)return Promise.resolve(false);if(!force&&ID482.tok&&ID482.exp-Date.now()/1e3>3*86400)return Promise.resolve(true);
  id482Busy=1;const c=window.AbortController?new AbortController():null;const to=setTimeout(()=>{try{c&&c.abort();}catch(e){}},7000);
  return fetch(ZS_API+'/dev/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({did:ID482.did,sec:ID482.sec,nick:ID482.nick||''}),signal:c?c.signal:undefined})
    .then(r=>r.json()).then(j=>{if(j&&j.ok&&j.token){ID482.tok=j.token;ID482.exp=Math.floor(Date.now()/1e3)+(j.ttl||2592000);if(j.name&&!ID482.nick)ID482.srvName=j.name;id482Save();return true;}return false;})
    .catch(()=>false).finally(()=>{clearTimeout(to);id482Busy=0;});}
// zs439Init: Telegram initData first, else the signed device token
try{const _zi=zs439Init;zs439Init=function(){let s='';try{s=_zi.apply(this,arguments)||'';}catch(e){}if(s)return s;
  if(ID482.tok&&ID482.exp>Date.now()/1e3+60)return ID482.tok;id482Register();return '';};window.zs439Init=zs439Init;}catch(e){console.warn('id482',e);}
try{const _mi=myId;myId=function(){let r='';try{r=_mi.apply(this,arguments)||'';}catch(e){}/* 4.3.90: the base myId() returns 'local' without Telegram, so every APK got the SAME id ('local') -> arena kicked phones off each other */if(r==='local')r='';return r||(id482Tg()?'local':'d'+ID482.did);};window.myId=myId;}catch(e){}
try{const _pn=arenaPname;arenaPname=function(){if(!id482Tg()&&ID482.nick)return ID482.nick;return _pn.apply(this,arguments);};window.arenaPname=arenaPname;}catch(e){}
setTimeout(()=>{if(!id482Tg())id482Register();},1500);
// ---- nickname: asked once (no Telegram) before gilda / classifica, editable from Impostazioni ----
function nick482Open(then){let o=document.getElementById('nick482');if(!o){o=document.createElement('div');o.id='nick482';o.className='hidden';
    o.innerHTML='<div class="nk"><canvas width="44" height="44"></canvas><b>Il tuo nome da sopravvissuto</b><span>Visibile in classifica e nella gilda</span><input maxlength="20" autocomplete="off" spellcheck="false"><div class="nkb"><button type="button" class="ghost">Annulla</button><button type="button" class="ok">Salva</button></div><em></em></div>';
    document.body.appendChild(o);const st=document.createElement('style');st.textContent='#nick482{position:fixed;inset:0;z-index:99980;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7)}#nick482.hidden{display:none}#nick482 .nk{width:min(360px,92vw);background:#141a22;border:1px solid rgba(255,210,122,.5);border-radius:14px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;color:#e8eef5;font:600 13px system-ui}#nick482 b{font-size:15px;color:#ffd27a}#nick482 span{font-size:11px;opacity:.75}#nick482 input{width:100%;box-sizing:border-box;padding:9px;border-radius:9px;border:1px solid #445;background:#0b0f15;color:#fff;font:700 15px system-ui;text-align:center}#nick482 .nkb{display:flex;gap:8px;width:100%}#nick482 .nkb button{flex:1;padding:9px;border-radius:9px;border:0;font:800 13px system-ui}#nick482 .ok{background:#ff9a2a;color:#141}#nick482 .ghost{background:#2a3140;color:#dde}#nick482 em{font-size:11px;color:#ff8a7a;min-height:13px;font-style:normal}';document.head.appendChild(st);
    const g=o.querySelector('canvas').getContext('2d');g.fillStyle='#ffd27a';g.beginPath();g.arc(22,15,8,0,7);g.fill();g.beginPath();g.moveTo(8,40);g.quadraticCurveTo(22,18,36,40);g.closePath();g.fill();}
  const inp=o.querySelector('input'),[bc,bo]=o.querySelectorAll('.nkb button'),er=o.querySelector('em');inp.value=ID482.nick||'';er.textContent='';o.classList.remove('hidden');setTimeout(()=>{try{inp.focus();}catch(e){}},50);
  bc.onclick=()=>{o.classList.add('hidden');};
  bo.onclick=()=>{const v=inp.value.replace(/[<>&"'`]/g,'').replace(/\s+/g,' ').trim();if(v.length<2){er.textContent='Almeno 2 caratteri';return;}ID482.nick=v.slice(0,20);ID482.tok='';ID482.exp=0;id482Save();o.classList.add('hidden');id482Register(true).then(()=>{try{then&&then();}catch(e){}});};}
window.nick482Open=nick482Open;
function needNick482(fn){return function(){if(!id482Tg()&&!ID482.nick){const a=arguments,t=this;nick482Open(()=>fn.apply(t,a));return;}return fn.apply(this,arguments);};}
for(const k of ['gOpen482','openRank']){try{if(typeof window[k]==='function')window[k]=needNick482(window[k]);}catch(e){}}
try{if(typeof gOpen482==='function')gOpen482=window.gOpen482;if(typeof openRank==='function')openRank=window.openRank;}catch(e){}
// Settings entry "Nome giocatore" next to Suggerimenti e bug
setInterval(()=>{try{if(id482Tg())return;const rb=document.querySelector('[data-rep482],#repBtn482,#setRep482');if(!rb)return;const host=rb.parentNode;if(!host||document.getElementById('nickBtn482'))return;
  const b=document.createElement('button');b.id='nickBtn482';b.type='button';b.className=rb?rb.className:'act ghost';b.textContent='Nome giocatore';b.onclick=()=>nick482Open();host.insertBefore(b,rb?rb.nextSibling:null);}catch(e){}},2000);
// ---- APK / outside Telegram: remove Telegram-only invite button ----
(function(){if(id482Tg()&&!window.__zsApk)return;const st=document.createElement('style');st.textContent='#inv432,#invBtn472,.inv472{display:none!important}';document.head.appendChild(st);
  const kill=()=>{try{const b=document.getElementById('inv432');if(b)b.remove();}catch(e){}};kill();setTimeout(kill,1500);setTimeout(kill,6000);})();
