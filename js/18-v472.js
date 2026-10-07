/* Zombie Survival — game code part 18-v472 (game.html lines 7869-7933 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ======================= v4.3.72: "Invita un amico" with server-verified rewards (worker /ref/*) =======================
const M472={on:true,err:0};function e472(e,w){M472.err++;try{console.warn('472',w,e&&e.message);}catch(_){}if(M472.err>8)M472.on=false;}
const REF472={d:null,t:0,busy:false,claiming:false,last:null};
{const st=document.createElement('style');st.textContent='#inv432{position:relative}#inv432 em.b472{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;background:#e8452c;color:#fff;font:800 11px/18px system-ui;text-align:center;padding:0 4px;font-style:normal}'+
 '.ref472{font-size:13px;line-height:1.35}.ref472 .g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.ref472 .g div{background:rgba(255,255,255,.06);border-radius:9px;padding:6px;text-align:center}.ref472 .g b{display:block;font-size:17px;color:#ffd27a}.ref472 ul{margin:4px 0 0;padding-left:18px}.ref472 .fr{max-height:84px;overflow:auto;font-size:12px;color:#c9d3df}.ref472 .pd{color:#7dff9a;font-weight:800}';document.head.appendChild(st);}
function ref472Post(path,body){const init=zs439Init();if(!init||!ZS_API)return Promise.reject(new Error('no_tg'));const c=new AbortController();const to=setTimeout(()=>{try{c.abort();}catch(e){}},8000);
  return fetch(zs439Base()+path,{method:'POST',mode:'cors',headers:{'content-type':'text/plain'},body:JSON.stringify(Object.assign({initData:init},body||{})),signal:c.signal}).then(r=>r.json()).finally(()=>clearTimeout(to));}
function ref472Applied(){const a=LS.get('zs_ref472',[]);return Array.isArray(a)?a:[];}
function ref472Claim(){if(REF472.claiming||!REF472.d||!REF472.d.pending||!REF472.d.pending.length)return;REF472.claiming=true;const ids=REF472.d.pending.map(x=>x.id);
  ref472Post('/ref/claim',{ids}).then(j=>{if(!j||!j.ok)return;const done=ref472Applied();let add=0;for(const it of j.items||[]){if(done.includes(it.id))continue;done.push(it.id);add+=it.c|0;}
    LS.set('zs_ref472',done.slice(-200));if(add>0){addCoins(add);try{save42();}catch(e){}try{mtoast('🎁 +'+add+' 🪙 dagli inviti',2600);}catch(e){}try{play('buy');}catch(e){}}
    REF472.d.got=(REF472.d.got|0)+add;REF472.d.pending=[];ref472Badge();ref472Paint();}).catch(()=>{}).finally(()=>{REF472.claiming=false;});}
function ref472Fetch(force){if(!M472.on||REF472.busy)return;if(!force&&Date.now()-REF472.t<60000)return;if(!zs439On())return;REF472.busy=true;
  ref472Post('/ref/me').then(j=>{if(j&&j.ok){REF472.d=j;REF472.t=Date.now();ref472Badge();ref472Paint();if(j.pending&&j.pending.length)ref472Claim();}}).catch(()=>{}).finally(()=>{REF472.busy=false;});}
function ref472Badge(){try{const b=$('inv432');if(!b)return;let e=b.querySelector('em.b472');const n=REF472.d&&REF472.d.pending?REF472.d.pending.length:0;if(!n){if(e)e.remove();return;}if(!e){e=document.createElement('em');e.className='b472';b.appendChild(e);}e.textContent=n;}catch(e){}}
function ref472Html(){const d=REF472.d,R=(d&&d.rules)||{friend:500,inviter:1000,pct:.1,rate:40,dayCap:5,monCap:20};
  let h='<div class="ref472"><div>Manda il tuo link a un amico che non ha mai giocato:</div><ul><li>lui riceve <b>'+R.friend+' 🪙</b> appena entra dal tuo link;</li><li>tu ricevi <b>'+R.inviter+' 🪙</b> quando arriva al <b>giorno 2</b> o uccide <b>50 zombie</b>;</li><li>e ogni volta che compra con le ⭐ Stelle ricevi il <b>'+Math.round(R.pct*100)+'%</b> in monete: ogni ⭐ che spende vale '+Math.round(R.pct*R.rate*10)/10+' 🪙 per te.</li></ul><small>Massimo '+R.dayCap+' inviti al giorno e '+R.monCap+' al mese. Le monete arrivano da sole quando apri il gioco.</small>';
  if(d){h+='<div class="g"><div><b>'+(d.invites|0)+'</b>invitati</div><div><b>'+(d.played|0)+'</b>giocano</div><div><b>'+(d.earned|0)+'</b>🪙 guadagnate</div></div>';
    const pend=(d.pending||[]).reduce((s,x)=>s+(x.c|0),0);if(pend)h+='<div class="pd">🎁 Da ritirare: '+pend+' 🪙 (in arrivo…)</div>';
    if(d.friends&&d.friends.length)h+='<div class="fr">'+d.friends.map(f=>(f.st==='played'?'✅ ':'⏳ ')+esc(f.name||'Amico')).join('<br>')+'</div>';}
  else h+='<div class="g"><div><b>–</b>invitati</div><div><b>–</b>giocano</div><div><b>–</b>🪙 guadagnate</div></div>';
  return h+'</div>';}
function ref472Paint(){try{const b=document.querySelector('#dlgScreen .ref472');if(b)b.outerHTML=ref472Html();}catch(e){}}
inv432Open=function(){try{ref472Fetch(true);}catch(e){}const L=inv432Link();const msg='Sopravvivi con me a Zombie Survival! 🧟 Entra dal mio link e ricevi 500 monete.';
  dialog('👥 Invita un amico',L?ref472Html()+'<div class="inv432L">'+esc(L)+'</div>':'<div class="sub2">Apri il gioco da Telegram per avere il tuo link di invito.</div>',
   (L?[{label:'✈️ Condividi',fn:()=>{const u='https://t.me/share/url?url='+encodeURIComponent(L)+'&text='+encodeURIComponent(msg);try{if(TG.W&&TG.W.openTelegramLink){TG.W.openTelegramLink(u);return;}}catch(e){}try{window.open(u,'_blank');}catch(e){}}},
     {label:'📋 Copia link',ghost:1,fn:()=>{try{navigator.clipboard.writeText(L).then(()=>mtoast('Link copiato',1400),()=>mtoast(L,3000));}catch(e){mtoast(L,3000);}}}]:[]).concat([{label:'Chiudi',ghost:1}]));};
try{const b=$('inv432');if(b){const n=b.cloneNode(true);b.parentNode.replaceChild(n,b);onTap('inv432',()=>inv432Open());}}catch(e){e472(e,'btn');}
{const _mp=menu432Place;menu432Place=function(){const had=!!$('inv432');_mp();if(!had)try{const b=$('inv432');if(b){const n=b.cloneNode(true);b.parentNode.replaceChild(n,b);onTap('inv432',()=>inv432Open());}}catch(e){}ref472Badge();};}
// check for rewards at start and every few minutes while in the menu (never during play)
{let n=0;const tick=()=>{try{if(M472.on&&game.state==='menu')ref472Fetch(n++<2);}catch(e){e472(e,'tick');}setTimeout(tick,n<3?4000:180000);};setTimeout(tick,3500);}
window.__zs472={fetch:()=>{ref472Fetch(true);return REF472;},get d(){return REF472.d;},html:()=>ref472Html(),get m(){return M472;}};
// ---- 4.3.72: play-time heartbeats (signed with initData; only seconds played) + owner-only dashboard (data served only after the worker verifies the id) ----
const HB472={acc:0,last:0,t:0,busy:false};
function hb472Send(keep){if(!M472.on||HB472.busy)return;const s=Math.min(200,Math.round(HB472.acc));if(s<5)return;const init=zs439Init();if(!init||!ZS_API)return;HB472.busy=true;const sent=s;HB472.acc-=sent;
  fetch(zs439Base()+'/hb',{method:'POST',mode:'cors',keepalive:!!keep,headers:{'content-type':'text/plain'},body:JSON.stringify({initData:init,s:sent})}).then(r=>{if(!r.ok&&r.status>=500)HB472.acc+=sent;}).catch(()=>{HB472.acc+=sent;}).finally(()=>{HB472.busy=false;});}
{const _l0=loop0;loop0=function(now){try{if(M472.on){const dt=HB472.last?Math.min(1,(now-HB472.last)/1000):0;HB472.last=now;
  if(game.state==='play'&&document.visibilityState==='visible'){HB472.acc+=dt;HB472.t+=dt;if(HB472.t>=180){HB472.t=0;hb472Send(false);}}}}catch(e){e472(e,'hb');}return _l0(now);};}
document.addEventListener('visibilitychange',()=>{try{if(document.visibilityState==='hidden')hb472Send(true);}catch(e){}});
{const _sg=startGame;startGame=function(){try{hb472Send(false);}catch(e){}return _sg.apply(this,arguments);};}
const ADM472={id:'7780175131'};
function adm472Is(){try{return myId()===ADM472.id;}catch(e){return false;}}
function adm472Btn(){try{const S=$('startScreen');if(!S||!adm472Is())return;let b=$('adm472');if(!b){b=document.createElement('button');b.id='adm472';b.textContent='📊';b.title='Dashboard';
   b.style.cssText='position:absolute;left:calc(8px + var(--sal,0px));bottom:calc(8px + var(--sab,0px));width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.35);color:#fff;font-size:16px;opacity:.55;z-index:30;padding:0';
   S.appendChild(b);onTap('adm472',adm472Open);}}catch(e){e472(e,'admb');}}
function adm472Open(){dialog('📊 Dashboard','<div id="adm472b" class="sub2">Carico…</div>',[{label:'Chiudi',ghost:1}]);try{$('dlgScreen').classList.add('adm472w');}catch(e){}
  ref472Post('/admin/dash').then(j=>{const el=$('adm472b');if(!el)return;if(!j||!j.ok){el.textContent=j&&j.err==='forbidden'?'Accesso non consentito.':'Dati non disponibili ('+((j&&j.err)||'rete')+').';return;}el.outerHTML=adm472Html(j);}).catch(e=>{const el=$('adm472b');if(el)el.textContent='Dati non disponibili (rete).';});}
function adm472Html(j){const E=esc,t=(h,rows)=>'<table><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+(rows.length?rows.join(''):'<tr><td colspan="'+h.length+'">—</td></tr>')+'</table>',tr=a=>'<tr>'+a.map(x=>'<td>'+x+'</td>').join('')+'</tr>';
  const nm={};for(const p of j.players||[])nm[p.id]=p.n;const N=id=>E(nm[id]||id);
  let h='<div class="adm472"><div class="k"><div><b>'+j.act.today+'</b>oggi</div><div><b>'+j.act.d7+'</b>7 giorni</div><div><b>'+j.act.d30+'</b>30 giorni</div><div><b>'+(j.botUsers|0)+'</b>utenti bot</div></div>';
  h+='<h4>⏱️ Minuti giocati</h4>'+t(['Giocatore','Oggi','7 g','30 g','Totale','Ultimo'],(j.players||[]).slice(0,80).map(p=>tr([E(p.n)+' <small>'+p.id+'</small>',p.today,p.m7,p.m30,p.tot,E((p.last||'').slice(5))])));
  h+='<h4>👥 Invita un amico</h4>'+t(['Amico','Invitato da','Stato'],(j.refs||[]).slice(0,80).map(r=>tr([E(r.n||r.id)+' <small>'+r.id+'</small>',E(r.byN||r.by),r.st==='played'?'✅ gioca':'⏳ entrato'])));
  h+='<h4>🤝 Affiliazione Telegram</h4>'+t(['Ingresso','Data','Codice'],(j.affJoins||[]).slice(-60).reverse().map(a=>tr([E(a.n||a.u)+' <small>'+a.u+'</small>',E((a.date||'').slice(5,16).replace('T',' ')),E(a.code||'')])))+
     t(['Acquirente','Affiliato','‰','⭐ affiliato','Data'],(j.aff||[]).slice(-60).reverse().map(a=>tr([E(a.buyerN||a.buyer),E(a.aff||a.affId),a.pm,a.amt,E((a.date||'').slice(5,16).replace('T',' '))])));
  const tot=(j.spend||[]).reduce((s,x)=>s+x.stars,0);h+='<h4>⭐ Stelle spese ('+tot+')</h4>'+t(['Giocatore','⭐','Acquisti','Ultimo'],(j.spend||[]).map(s=>tr([E(s.n||s.id)+' <small>'+s.id+'</small>',s.stars,s.k,E((s.last||'').slice(5,16).replace('T',' '))])));
  return h+'<small>Dati bot aggiornati: '+(j.botTs?new Date(j.botTs).toLocaleString('it-IT',{timeZone:'Europe/Rome'}):'mai')+'</small></div>';}
{const st=document.createElement('style');st.textContent='#dlgScreen.adm472w .sheet{max-width:96vw!important;width:96vw!important}.adm472{max-height:62vh;overflow:auto;touch-action:pan-y;-webkit-overflow-scrolling:touch;font:600 12px system-ui;text-align:left}.adm472 .k{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.adm472 .k div{background:rgba(255,255,255,.06);border-radius:8px;padding:5px;text-align:center}.adm472 .k b{display:block;font-size:18px;color:#ffd27a}.adm472 h4{margin:10px 0 4px;color:#ffd27a}.adm472 table{width:100%;border-collapse:collapse}.adm472 td,.adm472 th{padding:3px 4px;border-bottom:1px solid rgba(255,255,255,.08)}.adm472 th{color:#9aa6b4;text-align:left}.adm472 small{color:#7d8794}';document.head.appendChild(st);
 try{const c=document.querySelector('.adm472');}catch(e){}}
{const _dg=dialog;dialog=function(){try{$('dlgScreen').classList.remove('adm472w');}catch(e){}return _dg.apply(this,arguments);};}
{const _mp2=menu432Place;menu432Place=function(){_mp2();try{adm472Btn();}catch(e){}};}
setTimeout(()=>{try{adm472Btn();}catch(e){}},4000);
window.__zs472adm={html:j=>adm472Html(j),is:()=>adm472Is(),hb:HB472};
try{applyLight();}catch(e){}
try{applyLight();}catch(e){}

