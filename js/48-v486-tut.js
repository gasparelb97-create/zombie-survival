'use strict';
// ======================= v4.3.86: Survival coach-marks tutorial (texts: zs_previews/tutorial_texts.txt). First Survival entry, Salta/Avanti, Settings replay =======================
(function(){
const STEPS=[["hpBar", "Salute", "La tua vita. Non torna da sola."], ["mats", "Materiali", "Quello che porti. Se muori, resta a terra."], ["topRight", "Orologio e fase", "Il giorno finisce. Al buio arrivano."], ["radar", "Radar", "Le minacce intorno a te. Guardalo spesso."], ["joyZone", "Joystick", "Muoviti. Il rumore li attira."], ["fireBtn", "Fuoco", "Spara, colpisci, raccogli. Mira alla testa."], ["adsBtn", "Mira", "Più precisione, meno visuale."], ["reloadBtn", "Ricarica", "Ricarica al riparo, mai allo scoperto."], ["pickBtn", "Usa", "Apri casse, porte, deposito. Raccogli."], ["wbar", "Armi", "Le tue armi. Tocca per cambiare."], ["weaponInfo", "Munizioni", "Colpi nel caricatore e di riserva. Contali."], ["swapBtn", "Cambio arma", "Passa all'arma successiva. Senza esitare."], ["nadeBtn", "Granata", "Contro i gruppi. Non sprecarla su uno solo."], ["buildBtn", "Costruzione", "Muri, porte, difese. Prima del buio."], ["craftBtn", "Crafting", "Potenzia personaggio e armi. Servizi a pagamento."], ["bagBtn", "Zaino", "Spazio poco. Da qui crei munizioni, granate, bende. Migliori gli attrezzi."], ["pauseBtn", "Pausa", "Fermati qui. Il mondo no."]];
const K='zs_tut486';
const css=`#tut486{position:fixed;inset:0;z-index:2147482000;pointer-events:auto;font-family:system-ui,sans-serif}#tut486.hidden{display:none}
#tut486 .sp{position:fixed;border-radius:10px;box-shadow:0 0 0 9999px rgba(3,4,6,.78),0 0 0 2px #c8372d,0 0 18px rgba(200,55,45,.6);transition:all .22s ease;pointer-events:none}
#tut486 .cap{position:fixed;width:min(290px,60vw);box-sizing:border-box;padding:10px 12px;background:#101216;border:1px solid #3a3f48;border-left:3px solid #c8372d;color:#d8d6d0;box-shadow:0 8px 28px rgba(0,0,0,.6)}
#tut486 .n{font:700 10px/1 system-ui;letter-spacing:.18em;color:#7d7a72}#tut486 h4{margin:5px 0 4px;font:900 15px/1.1 system-ui;letter-spacing:.08em;text-transform:uppercase;color:#f0ece4}
#tut486 p{margin:0 0 8px;font:500 13px/1.35 system-ui;color:#c9c6be}#tut486 .f{display:flex;gap:6px;justify-content:flex-end}
#tut486 button{height:30px;padding:0 12px;border:1px solid #4a4e57;background:#1c1f25;color:#e6e2da;font:800 11px/1 system-ui;letter-spacing:.1em;text-transform:uppercase;border-radius:3px}#tut486 button.p{background:#8e241e;border-color:#c8372d}
#tut486 .skip{position:fixed;top:calc(var(--sat,0px) + 8px);right:calc(var(--sar,0px) + 10px)}
#helpScreen .cols.help{display:none!important}
#helpScreen #tutBtn486{margin-top:10px;width:100%;height:38px;border:1px solid #4a4e57;background:#1c1f25;color:#e6e2da;font:800 13px system-ui;letter-spacing:.08em;border-radius:8px}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const o=document.createElement('div');o.id='tut486';o.className='hidden';o.innerHTML='<div class="sp"></div><div class="cap"></div><button class="skip" data-t="x">Salta</button>';document.body.appendChild(o);
const sp=o.querySelector('.sp'),cap=o.querySelector('.cap');let list=[],i=0,prev=null;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
function vis(id){const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)return null;if(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight)return null;return r;}
function draw(){const s=list[i],r=vis(s[0]);if(!r){next();return;}const p=6,x=Math.max(2,r.left-p),y=Math.max(2,r.top-p),w=Math.min(innerWidth-4,r.width+2*p),h=Math.min(innerHeight-4,r.height+2*p);
  Object.assign(sp.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
  cap.innerHTML='<div class="n">'+(i+1)+' / '+list.length+'</div><h4>'+esc(s[1])+'</h4><p>'+esc(s[2])+'</p><div class="f">'+(i?'<button data-t="b">Indietro</button>':'')+'<button class="p" data-t="n">'+(i===list.length-1?'Fine':'Avanti')+'</button></div>';
  const cw=cap.offsetWidth,ch=cap.offsetHeight,cx=x+w/2;let L=x+w+12,T=y+h/2-ch/2;if(L+cw>innerWidth-6)L=x-cw-12;if(L<6){L=Math.min(Math.max(6,cx-cw/2),innerWidth-cw-6);T=y+h+12;if(T+ch>innerHeight-6)T=y-ch-12;}
  T=Math.min(Math.max(6,T),innerHeight-ch-6);cap.style.left=L+'px';cap.style.top=T+'px';}
function next(){if(i>=list.length-1){close();return;}i++;draw();}
function open(){list=STEPS.filter(s=>vis(s[0]));if(!list.length)return false;i=0;try{if(typeof game!=='undefined'&&game.state==='play'){prev='play';game.state='tut486';firing=false;try{resetTouchState();}catch(e){}}}catch(e){}o.classList.remove('hidden');draw();return true;}
function close(){o.classList.add('hidden');try{localStorage.setItem(K,'1');}catch(e){}try{if(prev&&game.state==='tut486'){game.state=prev;last=performance.now();}}catch(e){}prev=null;}
o.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');e.stopPropagation();e.preventDefault();if(!b)return;const t=b.dataset.t;if(t==='x')close();else if(t==='b'){i=Math.max(0,i-1);draw();}else next();},true);
['touchstart','touchend','pointerdown'].forEach(ev=>o.addEventListener(ev,e=>{if(!e.target.closest('button'))e.stopPropagation();},{passive:true}));
addEventListener('resize',()=>{if(!o.classList.contains('hidden'))draw();});
window.tutorial486=open;
function seen(){try{return localStorage.getItem(K)==='1';}catch(e){return true;}}
let wait=0;function arm(){if(wait)return;const t0=Date.now();wait=setInterval(()=>{if(Date.now()-t0>90000){clearInterval(wait);wait=0;return;}
  try{const ldOn=['boot481','ld431','ld482','mload482'].some(id=>{const e=document.getElementById(id);if(!e)return false;const c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>.02&&e.offsetWidth>0;});if(ldOn||game.state!=='play'||!(typeof SV!=='undefined'&&SV.on)){arm.ok=0;return;}arm.ok=(arm.ok||0)+1;if(arm.ok>=4&&!document.querySelector('#bag484:not([style*="none"]) .pn')){clearInterval(wait);wait=0;if(!seen())open();}}catch(e){}},400);}
try{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{if(!seen())arm();}catch(e){}return r;};window.startGame=startGame;}catch(e){}
try{const h=document.querySelector('#helpScreen .ver422');if(h&&!document.getElementById('tutBtn486')){const b=document.createElement('button');b.id='tutBtn486';b.type='button';b.textContent='TUTORIAL';h.parentNode.insertBefore(b,h);
  b.addEventListener('click',()=>{try{localStorage.removeItem(K);}catch(e){}const hs=document.getElementById('helpScreen');try{const bk=document.getElementById('helpBack');bk&&bk.click();}catch(e){}hs&&hs.classList.add('hidden');
    if(typeof game!=='undefined'&&(game.state==='play'||game.state==='paused')){setTimeout(()=>{if(!open())arm();},300);}else{try{startGame();}catch(e){}arm();}});}}catch(e){}
try{const v=document.querySelector('#helpScreen .ver422');if(v&&typeof GAME_VER!=='undefined')v.textContent='Zombie Survival v'+GAME_VER;}catch(e){}
})();
