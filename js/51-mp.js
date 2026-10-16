'use strict';
// ======================= 4.3.85 online co-op (opt-in). Host-authoritative: the host runs zombies, day/night and waves. =======================
// Everything here is isolated: when no match is running every hook below falls straight through to the original function.
// Any error inside multiplayer ends the match and returns to the menu; it never touches the single-player save.
const MP=(()=>{
  const URL0='wss://zs-mp.gasparelb97.workers.dev/ws';
  const M={on:false,inMatch:false,host:false,ws:null,code:'',pid:0,hostPid:0,players:[],remotes:new Map(),want:null,retry:0,closing:false,err:0,
    down:false,downT:0,downPos:null,quiet:0,sw:null,swapPid:0,bak:null,lastZ:0,lastP:0,missing:new Map(),off:new Map(),started:false,kills:0};
  const url=()=>{try{return localStorage.getItem('zs_mp_url')||URL0;}catch(e){return URL0;}};
  const log=(...a)=>{try{console.warn('[mp]',...a);window.__DBG&&__DBG.prob&&__DBG.prob('warn','mp',a.join(' ').slice(0,200));}catch(e){}};
  const nick=()=>{let n='';try{n=(typeof ID482!=='undefined'&&ID482.nick)||'';}catch(e){}if(!n)try{n=arenaPname()||'';}catch(e){}return String(n||'Sopravvissuto').slice(0,20);};
  const did=()=>{try{return 'd'+ID482.did;}catch(e){return 'x'+Math.random().toString(36).slice(2);}};
  const COL=['#ffd27a','#7ac8ff','#ff9a7a','#b6f08a'];
  // ---------- socket ----------
  function send(o){try{if(M.ws&&M.ws.readyState===1)M.ws.send(JSON.stringify(o));}catch(e){}}
  const rel=(d,to)=>send(to?{t:'m',to,d}:{t:'m',d}),toHost=d=>send({t:'m',h:1,d});
  function connect(mode,code){closeWs();M.uiOff=false;M.closing=false;M.want={mode,code};M.on=true;ui.status(mode==='create'?'Creo la stanza…':'Entro nella stanza…');
    let ws;try{ws=new WebSocket(url()+(mode==='create'?'?create=1':'?code='+encodeURIComponent(code)));}catch(e){return fail('Connessione non disponibile');}
    M.ws=ws;const to=setTimeout(()=>{if(ws.readyState!==1){try{ws.close();}catch(e){}}},8000);
    ws.onopen=()=>{clearTimeout(to);M.retry=0;send({t:mode,code,name:nick(),did:did(),v:(window.ZS_VER||'')});};
    ws.onmessage=ev=>{try{onMsg(JSON.parse(ev.data));}catch(e){M.err++;log('msg',e&&e.message);if(M.err>8)end('Errore di rete');}};
    ws.onclose=()=>{clearTimeout(to);if(M.ws!==ws)return;M.ws=null;if(M.closing||!M.on)return;
      // reconnect (server keeps our slot ~20 s)
      if(M.code&&M.retry<6){M.retry++;ui.status('Connessione persa, riprovo ('+M.retry+')…');hud.note('Riconnessione…');setTimeout(()=>{if(M.on&&!M.ws&&!M.closing)connect('join',M.code);},Math.min(4000,600*M.retry));}
      else fail(M.code?'Connessione persa':'Server non raggiungibile');};
    ws.onerror=()=>{};}
  function closeWs(){const w=M.ws;M.ws=null;if(w)try{w.onclose=null;w.close();}catch(e){}}
  function fail(msg){const was=M.inMatch;M.on=false;closeWs();if(was)end(msg);else ui.error(msg);}
  function leave(){M.closing=true;send({t:'leave'});setTimeout(closeWs,150);M.on=false;M.code='';if(M.inMatch)end('');ui.home();}
  function onMsg(m){switch(m.t){
    case 'room':{M.code=m.code;M.pid=m.pid;M.hostPid=m.host;M.host=m.pid===m.host;M.players=m.players||[];hud.note('');
      for(const pid of [...M.remotes.keys()])if(!M.players.find(p=>p.pid===pid))dropRemote(pid);
      if(m.started&&!M.inMatch)begin();ui.lobby();return;}
    case 'start':if(!M.inMatch)begin();return;
    case 'left':dropRemote(m.pid);return;
    case 'closed':{const why=m.why==='host'?'L\'host ha chiuso la partita':'Stanza chiusa';M.closing=true;M.code='';fail(why);return;}
    case 'err':M.closing=true;M.code='';fail(m.m||'Errore');return;
    case 'm':if(m.d&&typeof m.d==='object')onData(m.f|0,m.d);return;}}
  // ---------- match lifecycle ----------
  function skey(){try{return cityStorageKey(SV_KEY);}catch(e){return 'zc_surv';}}
  function begin(){if(M.inMatch)return;try{if(window.__arena454&&__arena454.busy&&__arena454.busy())__arena454.shutdown();}catch(e){}
    try{M.bak=localStorage.getItem(skey());}catch(e){M.bak=null;}
    M.inMatch=true;M.down=false;M.kills=0;M.missing.clear();ui.hide();
    try{startGame(false);}catch(e){log('start',e&&e.message);end('Avvio non riuscito');return;}
    try{toast(M.host?'Partita co-op avviata · sei l\'host':'Partita co-op · host: '+pname(M.hostPid),2500);}catch(e){}hud.show();}
  function end(msg){const was=M.inMatch;M.inMatch=false;M.down=false;M.sw=null;M.swapPid=0;
    for(const pid of [...M.remotes.keys()])dropRemote(pid);
    try{for(const z of zombies){if(z.mpNet){z.mpNet=null;z.alive=false;z.g.visible=false;}}}catch(e){}
    hud.hide();if(M.on){M.closing=true;send({t:'leave'});setTimeout(closeWs,150);M.on=false;}M.code='';
    M.ending=true;try{if(was)O.showMenu();}catch(e){try{game.state='menu';}catch(x){}}finally{M.ending=false;}
    try{if(M.bak!==null&&M.bak!==undefined)localStorage.setItem(skey(),M.bak);}catch(e){}M.bak=null;
    if(msg){try{toast(msg,3500);}catch(e){}ui.error(msg);}}
  const pname=pid=>{const p=M.players.find(q=>q.pid===pid);return p?p.name:'?';};
  // ---------- remote players ----------
  function remote(pid){let r=M.remotes.get(pid);if(r)return r;const p=M.players.find(q=>q.pid===pid);if(!p)return null;
    const ch=MPChar.createSurvivor({slot:p.slot,name:p.name,tagColor:COL[p.slot%4]});scene.add(ch.root);
    r={pid,ch,buf:[],off:null,x:0,y:0,z:0,yaw:0,pitch:0,spd:0,w:'',hp:100,dead:false,kills:0,lastSnd:0,seen:performance.now(),vec:new T.Vector3()};M.remotes.set(pid,r);return r;}
  function dropRemote(pid){const r=M.remotes.get(pid);if(!r)return;M.remotes.delete(pid);try{scene.remove(r.ch.root);r.ch.dispose();}catch(e){}}
  function onState(pid,s){const r=remote(pid);if(!r)return;const now=performance.now(),st=+s[0]||0;
    const d=now-st;r.off=r.off===null?d:Math.min(d,r.off+2); // clock offset (min filter, slow drift up)
    r.buf.push({t:st,x:+s[1]||0,y:+s[2]||0,z:+s[3]||0,yaw:+s[4]||0,pitch:+s[5]||0,spd:+s[6]||0});if(r.buf.length>30)r.buf.shift();
    const w=String(s[7]||'');if(w!==r.w){r.w=w;try{r.ch.setWeapon(w);}catch(e){}}r.hp=+s[8]||0;r.dead=!!s[9];r.kills=s[10]|0;r.seen=now;}
  const angL=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*k;};
  function interp(r,dt){const b=r.buf;if(!b.length)return;const T0=performance.now()-r.off-140;let i=b.length-1;
    if(T0>=b[i].t){const a=b[i],p=b[i-1]||a,ex=Math.min(120,T0-a.t)/Math.max(16,a.t-p.t||50);
      r.x=a.x+(a.x-p.x)*ex;r.y=a.y;r.z=a.z+(a.z-p.z)*ex;r.yaw=a.yaw;r.pitch=a.pitch;r.spd=a.spd;}
    else{while(i>0&&b[i-1].t>T0)i--;const a=b[Math.max(0,i-1)],c=b[i],k=c.t>a.t?Math.max(0,Math.min(1,(T0-a.t)/(c.t-a.t))):1;
      r.x=a.x+(c.x-a.x)*k;r.y=a.y+(c.y-a.y)*k;r.z=a.z+(c.z-a.z)*k;r.yaw=angL(a.yaw,c.yaw,k);r.pitch=a.pitch+(c.pitch-a.pitch)*k;r.spd=a.spd+(c.spd-a.spd)*k;}
    const R=r.ch.root;/* 4.3.88: critically damped follow of the interpolated target: no snaps on late packets */const kp=1-Math.exp(-dt*18);if(!r.sm||Math.hypot(R.position.x-r.x,R.position.z-r.z)>4){R.position.set(r.x,r.y,r.z);r.sm=1;}else{R.position.x+=(r.x-R.position.x)*kp;R.position.y+=(r.y-R.position.y)*kp;R.position.z+=(r.z-R.position.z)*kp;}r.sspd=(r.sspd||0)+(r.spd-(r.sspd||0))*(1-Math.exp(-dt*8));r.spd=r.sspd;R.rotation.y=angL(R.rotation.y,r.yaw,1-Math.exp(-dt*12));r.vec.set(r.x,r.y,r.z);
    r.ch.setPose(dt,{spd:r.spd,pitch:r.pitch,dead:r.dead});}
  // ---------- incoming game data ----------
  const _dir=new T.Vector3();
  function onData(f,d){if(!M.inMatch)return;if(d.k&&d.k[0]==='w'&&M.world&&M.world(f,d))return;switch(d.k){
    case 'p':onState(f,d.s||[]);return;
    case 'f':{const r=remote(f);if(!r)return;r.ch.pulse(d.m?'swing':'shoot');
      const dd=Math.hypot(r.x-player.pos.x,r.z-player.pos.z),now=performance.now();if(dd<28&&now-r.lastSnd>110&&!d.m){r.lastSnd=now;try{const W=WEAPONS.find(w=>w.id===r.w);if(W)play(W.snd||W.id);}catch(e){}}return;}
    case 'h':if(M.host)hostHit(f,d);return;
    case 'z':if(!M.host&&f===M.hostPid)applySnap(d);return;
    case 'zk':if(!M.host&&f===M.hostPid){if(d.by&&d.by===M.pid){M.kills++;try{O.zs439NoteKill&&O.zs439NoteKill();}catch(e){}}const z=zombies[d.i|0];if(z&&z.alive&&!z.dead){_dir.set(+d.x||0,0,+d.z||1);quietKill(z,_dir,30);}}return;
    case 'hu':if(!M.host&&f===M.hostPid){if(!M.down)try{O.hurt(Math.max(0,Math.min(80,+d.n||0)));}catch(e){}}return;}}
  function quietKill(z,dir,dmg){M.quiet++;const k=game.kills;try{O.killZombie(z,dir,dmg,false);}catch(e){}finally{game.kills=k;M.quiet--;}}
  function hostHit(f,d){const z=zombies[d.i|0];if(!z||!z.alive||z.dead)return;const dmg=Math.max(0,Math.min(5000,+d.d||0));const r=M.remotes.get(f);
    z.hp-=dmg;z.flash=.09;try{if(z.ai!=='chase'){z.ai='chase';}}catch(e){}
    if(z.hp<=0){M.lastBy=f;if(r)_dir.set(z.g.position.x-r.x,0,z.g.position.z-r.z).normalize();else _dir.set(0,0,1);quietKill(z,_dir,dmg);M.lastBy=0;}}
  // client: zombies driven by host snapshots
  function applySnap(d){try{if(typeof d.day==='number'){SV.day=d.day;game.wave=d.w|0||game.wave;const c=+d.c||0;let dc=Math.abs(SV.clock-c);if(dc>1.5&&dc<CYCLE-1.5)SV.clock=c;}}catch(e){}
    const seen=new Set();for(const e of d.z||[]){const z=zombies[e[0]|0];if(!z)continue;seen.add(z);
      const x=e[1]/10,zz=e[2]/10,ry=e[3]/100;
      if(!z.alive||(z.dead&&z.deadT>1.5)){Object.assign(z,{alive:true,dead:false,state:'walk',atkT:0,atkHit:false,cool:9,stag:0,stagHead:0,flash:0,deadT:0,groanT:rand(1,4),phase:Math.random()*6,stuck:0,side:0,sideT:0,limp:0,flee:0});
        z.speed=(z.V.speed[0]+z.V.speed[1])/2;z.g.position.set(x,0,zz);try{resetPose(z);}catch(x2){}z.blob.visible=true;z.g.visible=true;try{z.mat.emissive.setHex(z.baseEm||0);}catch(x2){}try{spawnExtra(z);}catch(x2){}}
      if(z.dead)continue;z.hp=e[4];z.maxHp=e[5]||z.maxHp||z.hp;z.mpNet={x,z:zz,ry,a:e[6]|0};M.missing.delete(z);}
    for(const z of zombies)if(z.mpNet&&z.alive&&!z.dead&&!seen.has(z)){const n=(M.missing.get(z)||0)+1;M.missing.set(z,n);if(n>=3){z.alive=false;z.g.visible=false;z.mpNet=null;M.missing.delete(z);}}}
  // ---------- outgoing (timers, independent from the frame rate) ----------
  setInterval(()=>{try{if(!M.inMatch||!M.ws)return;const w=WEAPONS[curW];
    rel({k:'p',s:[Math.round(performance.now()),+player.pos.x.toFixed(2),+player.pos.y.toFixed(2),+player.pos.z.toFixed(2),+player.yaw.toFixed(3),+player.pitch.toFixed(3),
      +Math.hypot(player.vel.x,player.vel.z).toFixed(2),w?w.id:'',Math.round(player.hp),M.down?1:0,M.kills]});}catch(e){M.err++;}},50);
  setInterval(()=>{try{if(!M.inMatch||!M.host||!M.ws||!M.remotes.size)return;const L=[];
    zombies.forEach((z,i)=>{if(z.alive&&!z.dead)L.push([i,Math.round(z.g.position.x*10),Math.round(z.g.position.z*10),Math.round(z.g.rotation.y*100),Math.round(z.hp),Math.round(z.maxHp||z.hp),z.state==='atk'?1:0]);});
    rel({k:'z',day:SV.day,c:+SV.clock.toFixed(1),w:game.wave,z:L});}catch(e){M.err++;}},100);
  // ---------- hooks ----------
  const O={};const hook=(n,f)=>{try{const o=window[n];if(typeof o!=='function')return;O[n]=o;window[n]=f;}catch(e){log('hook '+n);}};
  hook('svSave',function(){if(M.inMatch||M.ending)return;return O.svSave.apply(this,arguments);});
  try{const ls=LS.set;LS.set=function(k,v){if((M.inMatch||M.ending)&&k===SV_KEY)return;return ls.apply(this,arguments);};}catch(e){}
  hook('onKill',function(){if(M.quiet)return;if(M.inMatch)M.kills++;return O.onKill.apply(this,arguments);});
  hook('zs439NoteKill',function(){if(M.quiet)return;return O.zs439NoteKill.apply(this,arguments);});
  hook('spawnZombie',function(){if(M.inMatch&&!M.host)return false;return O.spawnZombie.apply(this,arguments);});
  hook('killZombie',function(z,dir){const r=O.killZombie.apply(this,arguments);try{if(M.inMatch&&M.host&&M.remotes.size){}}catch(e){}try{if(M.inMatch&&M.host&&M.remotes.size)rel({k:'zk',by:M.lastBy||0,i:zombies.indexOf(z),x:+(dir&&dir.x||0).toFixed(2),z:+(dir&&dir.z||1).toFixed(2)});}catch(e){}return r;});
  hook('damageZombie',function(z,dmg){if(!M.inMatch||M.host||!z||!z.mpNet)return O.damageZombie.apply(this,arguments);const b=z.hp;const r=O.damageZombie.apply(this,arguments);
    try{const dd=b-Math.max(0,z.hp);if(dd>0)toHost({k:'h',i:zombies.indexOf(z),d:Math.round(dd*10)/10});}catch(e){}return r;});
  hook('hurt',function(n){if(M.inMatch){if(M.swapPid){const p=M.swapPid;rel({k:'hu',n:Math.round(n*10)/10},p);return;}if(M.down)return;}return O.hurt.apply(this,arguments);});
  // ---------- 4.3.88 shared world: resources, building placement, damage/destruction, doors. Host world is authoritative. ----------
  const W={rx:0,dq:new Map(),dqT:0,lastFull:0,known:new Set(),bornAt:new Map()};
  const live=()=>M.inMatch&&M.ws&&M.remotes.size>0;
  const pkOf=p=>p&&p.key;const pFind=k=>{for(const p of PIECES)if(p.alive&&p.key===k)return p;return null;};
  function nodeMsg(n){const i=NODES.indexOf(n);if(i<0)return;rel({k:'wn',i,p:n.prog|0,a:n.alive?1:0,f:n.falling?1:0,tx:+(n.tdx||0).toFixed(2),tz:+(n.tdz||0).toFixed(2)});}
  function nodeApply(d){const n=NODES[d.i|0];if(!n)return;n.prog=d.p|0;n.shake=1;
    if(!d.a&&n.alive&&!n.falling){if(n.type==='rock'){n.alive=false;n.regrow=240;n.circle.off=true;try{play('rockBreak');}catch(e){}}else if(d.f){n.falling=1e-4;n.tdx=+d.tx||0;n.tdz=+d.tz||1;n.regrow=480;n.circle.off=true;try{play('timber');}catch(e){}}else{n.alive=false;n.regrow=480;n.circle.off=true;}bakeShadows();}
    else if(d.f&&!n.falling&&n.alive){n.falling=1e-4;n.tdx=+d.tx||0;n.tdz=+d.tz||1;n.regrow=480;n.circle.off=true;}
    try{nodeWrite(n);}catch(e){}}
  hook('toolHit',function(w){if(!live()||W.rx)return O.toolHit.apply(this,arguments);let n=null;try{n=(w&&w.tool!=='hammer')?nodeInFront(1.9):null;}catch(e){}
    const b=n?[n.prog,n.alive,!!n.falling]:null;const r=O.toolHit.apply(this,arguments);try{if(n&&(n.prog!==b[0]||n.alive!==b[1]||!!n.falling!==b[2]))nodeMsg(n);}catch(e){}return r;});
  hook('addPiece',function(type,x,z,rot,hp,open,silent){const p=O.addPiece.apply(this,arguments);try{if(p)W.bornAt.set(p.key,performance.now());if(p&&live()&&!W.rx&&!silent)rel({k:'wp',t:type,x,z,r:rot,h:Math.round(p.hp),o:p.open?1:0});}catch(e){}return p;});
  hook('removePiece',function(p,silent){const k=pkOf(p),was=p&&p.alive;const r=O.removePiece.apply(this,arguments);try{if(was&&live()&&!W.rx)rel({k:'wr',key:k});}catch(e){}return r;});
  hook('damagePiece',function(p,d){if(!p||!p.alive||!live()||W.rx)return O.damagePiece.apply(this,arguments);const k=p.key;W.dq.set(k,(W.dq.get(k)||0)+(+d||0));return O.damagePiece.apply(this,arguments);});
  hook('toggleDoor',function(p){const r=O.toggleDoor.apply(this,arguments);try{if(p&&live()&&!W.rx)rel({k:'wo',key:p.key,o:p.open?1:0});}catch(e){}return r;});
  hook('repairPiece',function(p){const h=p&&p.hp;const r=O.repairPiece.apply(this,arguments);try{if(p&&live()&&!W.rx&&p.hp!==h)rel({k:'wh',key:p.key,h:Math.round(p.hp)});}catch(e){}return r;});
  function rx(fn){W.rx++;try{fn();}catch(e){M.err++;}finally{W.rx--;}}
  function full(){const P=[];for(const p of PIECES)if(p.alive)P.push([p.type,p.x,p.z,p.rot,Math.round(p.hp),p.open?1:0]);const N=[];NODES.forEach((n,i)=>{if(!n.alive||n.falling)N.push(i);});rel({k:'wf',P,N});}
  function fullApply(d){rx(()=>{const want=new Map();for(const a of d.P||[]){const t=a[0];if(!PDEF[t])continue;want.set(pieceKey(t,a[1],a[2],a[3]),a);}
      const now=performance.now();for(const p of PIECES.slice()){if(!want.has(p.key)&&now-(W.bornAt.get(p.key)||0)>6000)O.removePiece(p,true);}
      for(const [k,a] of want){const p=pFind(k);if(!p)O.addPiece(a[0],a[1],a[2],a[3],a[4],a[5],true);else{if(Math.abs(p.hp-a[4])>1){p.hp=a[4];pieceWrite(p);}if(!!p.open!==!!a[5]){p.open=!!a[5];pieceWrite(p);pieceBox(p);}}}
      const dead=new Set(d.N||[]);NODES.forEach((n,i)=>{if(dead.has(i)&&n.alive&&!n.falling){n.alive=false;n.regrow=240;n.circle.off=true;nodeWrite(n);}});bakeShadows();});}
  setInterval(()=>{try{if(!live())return;if(W.dq.size){const L=[];for(const [k,v] of W.dq)L.push([k,Math.round(v*10)/10]);W.dq.clear();rel({k:'wd',L});}
    if(M.host){let fresh=false;for(const pid of M.remotes.keys())if(!W.known.has(pid)){W.known.add(pid);fresh=true;}const now=performance.now();if(fresh||now-W.lastFull>15000){W.lastFull=now;full();}}}catch(e){M.err++;}},250);
  function worldData(f,d){switch(d.k){
    case 'wn':rx(()=>nodeApply(d));return true;
    case 'wp':rx(()=>{if(!PDEF[d.t])return;const k=pieceKey(d.t,d.x,d.z,d.r);if(!pFind(k)){O.addPiece(d.t,d.x,d.z,d.r,d.h,d.o,false);try{play('build');}catch(e){}}});return true;
    case 'wr':rx(()=>{const p=pFind(d.key);if(p)O.removePiece(p,false);});return true;
    case 'wd':rx(()=>{for(const a of d.L||[]){const p=pFind(a[0]);if(p)O.damagePiece(p,+a[1]||0);}});return true;
    case 'wo':rx(()=>{const p=pFind(d.key);if(p&&!!p.open!==!!d.o)O.toggleDoor(p);});return true;
    case 'wh':rx(()=>{const p=pFind(d.key);if(p){p.hp=Math.min(p.max,+d.h||p.hp);pieceWrite(p);}});return true;
    case 'wf':if(f===M.hostPid&&!M.host)fullApply(d);return true;}return false;}
  M.world=worldData;
  hook('gameOver',function(){if(!M.inMatch)return O.gameOver.apply(this,arguments);
    if(M.down)return;M.down=true;M.downT=performance.now();M.downPos=player.pos.clone();player.hp=0;try{firing=false;}catch(e){}
    try{toast('Sei stato abbattuto! Rientri tra 8 secondi',3000);}catch(e){}
    setTimeout(()=>{if(!M.inMatch||!M.down)return;M.down=false;player.hp=player.maxHp;try{const bc=baseCenter&&baseCenter();if(bc)player.pos.set(bc.x+2,0,bc.z+2);}catch(e){}try{updateHUD();}catch(e){}},8000);});
  hook('fire',function(){if(M.inMatch&&M.down)return;const cd=fireCd;const r=O.fire.apply(this,arguments);
    try{if(M.inMatch&&fireCd>cd+.001&&!SV.build){const w=WEAPONS[curW];rel({k:'f',m:w&&w.melee?1:0});}}catch(e){}return r;});
  hook('showMenu',function(){if(M.inMatch){end('');return;}return O.showMenu.apply(this,arguments);});
  // host: each zombie works against the NEAREST living player. For a remote one, player.pos is swapped for the duration of
  // that zombie's AI step, so senses/attacks work unchanged; hurt() during the swap is forwarded to that player.
  function restore(){if(M.sw){player.pos.copy(M.sw);M.sw=null;}M.swapPid=0;}
  const _hp=new T.Vector3();
  hook('svTarget433',function(z){if(!M.inMatch)return O.svTarget433.apply(this,arguments);
    if(!M.host)return player.pos;restore();
    if(M.remotes.size&&z&&z.alive&&!z.dead){const P=z.g.position;let best=M.down?1e9:Math.hypot(P.x-player.pos.x,P.z-player.pos.z),bp=0,br=null;
      for(const r of M.remotes.values()){if(r.dead||!r.buf.length||performance.now()-r.seen>3000)continue;const d=Math.hypot(P.x-r.x,P.z-r.z);if(d<best-.5){best=d;bp=r.pid;br=r;}}
      if(br){M.sw=_hp.copy(player.pos);player.pos.set(br.x,player.pos.y,br.z);M.swapPid=bp;}}
    try{return O.svTarget433.apply(this,arguments);}catch(e){restore();throw e;}});
  const _nt=new T.Vector3();
  hook('updateZombie',function(z,dt,t){if(!M.inMatch)return O.updateZombie.apply(this,arguments);
    if(!M.host&&z.mpNet&&!z.dead){const n=z.mpNet;_nt.set(n.x,0,n.z);let r;try{r=O.updateZombie.call(this,z,dt,t,_nt,false);}catch(e){}
      const P=z.g.position,dx=n.x-P.x,dz=n.z-P.z,d=Math.hypot(dx,dz);if(d>3){P.x=n.x;P.z=n.z;}else{const k=Math.min(1,dt*4);P.x+=dx*k;P.z+=dz*k;}
      z.g.rotation.y=angL(z.g.rotation.y,n.ry,Math.min(1,dt*8));return r;}
    try{return O.updateZombie.apply(this,arguments);}finally{restore();}});
  hook('update',function(dt){const r=O.update.apply(this,arguments);if(M.inMatch){try{restore();frame(dt);}catch(e){M.err++;log('frame',e&&e.message);if(M.err>20)end('Errore multigiocatore');}}return r;});
  function frame(dt){if(M.down&&M.downPos){player.pos.x=M.downPos.x;player.pos.z=M.downPos.z;player.vel.set(0,0,0);}
    for(const r of M.remotes.values())interp(r,dt);hud.tick();}
  // ---------- HUD (teammates) ----------
  const hud=(()=>{let el=null,nt=null,lt=0;const st=document.createElement('style');
    st.textContent='#mpHud{position:fixed;left:calc(8px + env(safe-area-inset-left));top:64px;z-index:40;display:none;flex-direction:column;gap:3px;pointer-events:none;font:700 11px system-ui;color:#e8eef5}#mpHud .r{display:flex;align-items:center;gap:5px;background:rgba(10,14,20,.55);border-radius:7px;padding:3px 7px}#mpHud i{display:inline-block;width:46px;height:5px;border-radius:3px;background:#333;overflow:hidden}#mpHud i b{display:block;height:100%;background:#5fd16a}#mpHud .n{color:#ffd27a}#mpHud .dn{opacity:.5}#mpNote{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:41;background:rgba(160,40,30,.85);color:#fff;font:800 12px system-ui;padding:5px 12px;border-radius:9px;display:none}';
    document.head.appendChild(st);
    return {show(){if(!el){el=document.createElement('div');el.id='mpHud';document.body.appendChild(el);nt=document.createElement('div');nt.id='mpNote';document.body.appendChild(nt);}el.style.display='flex';},
      hide(){if(el)el.style.display='none';if(nt)nt.style.display='none';},
      note(s){if(nt){nt.textContent=s;nt.style.display=s?'block':'none';}},
      tick(){const now=performance.now();if(!el||now-lt<400)return;lt=now;let h='<div class="r"><span class="n">Stanza '+M.code+'</span></div>';
        for(const r of M.remotes.values()){const p=M.players.find(q=>q.pid===r.pid);const nm=(p?p.name:'?').replace(/[<>&]/g,'');const off=p&&!p.on;
          h+='<div class="r'+(r.dead||off?' dn':'')+'"><span style="color:'+COL[(p?p.slot:0)%4]+'">●</span>'+nm+(r.pid===M.hostPid?' 👑':'')+'<i><b style="width:'+Math.max(0,Math.min(100,r.hp))+'%"></b></i>'+(r.dead?'💀':off?'📶':'🧟'+r.kills)+'</div>';}
        el.innerHTML=h;}};})();
  // ---------- menu UI ----------
  const ui=(()=>{let o=null;const esc=s=>String(s).replace(/[<>&"']/g,'');
    function mk(){if(o)return o;o=document.createElement('div');o.id='mp485';o.className='hidden';document.body.appendChild(o);const st=document.createElement('style');
      st.textContent='#mp485{position:fixed;inset:0;z-index:99970;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72)}#mp485.hidden{display:none}#mp485 .bx{width:min(420px,92vw);max-height:92vh;box-sizing:border-box;background:#141a22;border:1px solid rgba(255,210,122,.5);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:9px;color:#e8eef5;font:600 13px system-ui}#mp485 h2{margin:0;font:900 18px system-ui;color:#ffd27a;text-align:center}#mp485 .sub{font-size:11px;opacity:.75;text-align:center}#mp485 button{padding:11px;border-radius:11px;border:0;font:800 14px system-ui;background:#2a3140;color:#eef}#mp485 button.ok{background:#ff9a2a;color:#141}#mp485 button:disabled{opacity:.45}#mp485 .row{display:flex;gap:8px}#mp485 .row>*{flex:1}#mp485 input{box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid #445;background:#0b0f15;color:#fff;font:900 20px ui-monospace,monospace;text-align:center;letter-spacing:4px;text-transform:uppercase;min-width:0}#mp485 .code{font:900 34px ui-monospace,monospace;letter-spacing:6px;text-align:center;color:#fff;background:#0b0f15;border-radius:12px;padding:8px}#mp485 .pl{display:flex;flex-direction:column;gap:5px}#mp485 .pl div{display:flex;align-items:center;gap:8px;background:#1d2530;border-radius:9px;padding:7px 10px}#mp485 .st{min-height:15px;font-size:12px;text-align:center;color:#9fb}#mp485 .st.e{color:#ff8a7a}';
      document.head.appendChild(st);o.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;e.stopPropagation();act(b.getAttribute('data-a'));});return o;}
    function act(a){try{if(a==='close'){if(M.on&&!M.inMatch)leave();hide();}
      else if(a==='create')withNick(()=>connect('create',''));
      else if(a==='join'){const v=(o.querySelector('input').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(v.length!==6)return status('Il codice ha 6 caratteri',1);withNick(()=>connect('join',v));}
      else if(a==='start'){if(M.host)send({t:'start'});}
      else if(a==='leave')leave();}catch(e){log('ui',e&&e.message);status('Errore',1);}}
    function withNick(fn){try{if(!id482Tg()&&!ID482.nick&&typeof nick482Open==='function'){nick482Open(fn);return;}}catch(e){}fn();}
    function show(h){M.uiOff=false;mk().innerHTML='<div class="bx">'+h+'</div>';o.classList.remove('hidden');}
    function home(){if(!o||o.classList.contains('hidden'))return;open();}
    function open(){if(M.on&&M.code)return lobby();show('<h2>👥 Multigiocatore</h2><div class="sub">Gioca la sopravvivenza insieme, fino a 4 amici</div><button class="ok" data-a="create">Crea stanza</button><div class="row"><input maxlength="6" placeholder="CODICE" autocomplete="off" spellcheck="false"><button data-a="join">Entra</button></div><div class="st"></div><button data-a="close">Chiudi</button>');}
    function lobby(){if(M.inMatch)return;if(M.uiOff&&(!o||o.classList.contains('hidden')))return;const pl=M.players.map(p=>'<div><span style="color:'+COL[p.slot%4]+'">●</span><b>'+esc(p.name)+'</b>'+(p.pid===M.hostPid?' 👑':'')+(p.pid===M.pid?' (tu)':'')+(p.on?'':' 📶')+'</div>').join('');
      show('<h2>Stanza</h2><div class="sub">Dai questo codice ai tuoi amici</div><div class="code">'+esc(M.code)+'</div><div class="pl">'+pl+'</div>'+
        (M.host?'<button class="ok" data-a="start">Inizia partita ('+M.players.length+'/4)</button>':'<div class="st">In attesa che l\'host avvii la partita…</div>')+'<div class="st"></div><button data-a="leave">Esci dalla stanza</button>');}
    function status(s,e){if(!o)return;const el=o.querySelectorAll('.st');const t=el[el.length-1];if(t){t.textContent=s;t.classList.toggle('e',!!e);}}
    function error(s){if(o&&!o.classList.contains('hidden')){open();status(s,1);}}
    function hide(){if(o)o.classList.add('hidden');M.uiOff=true;}
    return {open,home,lobby,status,error,hide};})();
  // menu button "Multigiocatore" under "Gioca"
  function addBtn(){try{if(document.getElementById('btnMp485'))return;const row=document.querySelector('#startScreen .playRow');if(!row)return;
    const r=document.createElement('div');r.className='menuRow one';r.innerHTML='<button class="mBtn online" id="btnMp485"><span class="ic">👥</span><span><b>Multigiocatore</b><small>Co-op online con codice stanza</small></span></button>';
    row.parentNode.insertBefore(r,row.nextSibling);let tt=0;const b=r.firstChild;
    const go=()=>{try{if(window.__arena454&&__arena454.busy&&__arena454.busy())return;ui.open();}catch(e){log('open',e&&e.message);}};
    b.addEventListener('touchend',e=>{if(e.cancelable)e.preventDefault();tt=Date.now();go();},{passive:false});b.addEventListener('click',()=>{if(Date.now()-tt>600)go();});}catch(e){log('btn',e&&e.message);}}
  addBtn();setTimeout(addBtn,1500);
  document.addEventListener('visibilitychange',()=>{try{if(document.visibilityState==='visible'&&M.on&&M.code&&!M.ws&&!M.closing)connect('join',M.code);}catch(e){}});
  return {M,open:()=>ui.open(),leave,end,url};})();
window.MP=MP;
