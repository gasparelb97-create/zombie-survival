/* Zombie Survival — game code part 00-core-world (game.html lines 1482-2021 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ================= CONFIG (edit here) =================
// Telegram Stars invoice links (create them in the bot with createInvoiceLink, currency XTR). Empty = Stars button disabled.
const INVOICE_LINKS={w_smg:'https://t.me/$18i6FxoBAFK5BQAAmj_8KQEVFQc',w_ar:'https://t.me/$jvi0lhoBAFK6BQAA5U-P70RQ8qo',w_thunder:'https://t.me/$9Ac2OhoBAFK7BQAAyZ2ixXYFqaE',w_plasma:'https://t.me/$kBTBkxoBAFK8BQAArzvqRnhaT3Q',e_armor:'https://t.me/$gULpZxoBAFK9BQAAnoLU7-hwSzY',e_medpack:'https://t.me/$KRHysxoBAFK-BQAA8-gRozarsNM',e_nadebag:'https://t.me/$eIR5uRoBAFK_BQAAy4b0MzcEDHg',e_boots:'https://t.me/$QrUPlxoBAFLABQAADESkQqSL1K4',e_magnet:'https://t.me/$4gEiqhoBAFLBBQAAUr6ekQTsc5A',gems_100:'https://t.me/$X6nIZhoBAFLCBQAAhM_hIJlx6_I',gems_250:'https://t.me/$DsTdQRoBAFLDBQAAcX_wyRmItpw',gems_600:'https://t.me/$jTxNZRoBAFLEBQAA8EOR6YUqC08',w_sniper:'https://t.me/$zrtv-BoBAFLOBQAAbV2X9P9gMh8',w_glauncher:'https://t.me/$BPzb6BoBAFLPBQAAnpk2xihBF8I',w_flamer:'https://t.me/$DLJ2ThoBAFLQBQAA1ZD0-8K9zNw',w_minigun:'https://t.me/$S7U8JBoBAFLRBQAA-J0kZaIwWgk',starter:'https://t.me/$WzUNmBoBAFLlBQAAZkZHn9bO9sM',e_backpack:'https://t.me/$zNPuZhoBAFLSBQAA5uOX_sxAIa4'};
const STARS_PRICES={w_smg:25,w_ar:50,w_thunder:50,w_plasma:100,e_armor:50,e_medpack:25,e_nadebag:25,e_boots:15,e_magnet:15,gems_100:50,gems_250:100,gems_600:200,w_sniper:50,w_glauncher:50,w_flamer:100,w_minigun:100,e_backpack:25,starter:25};
const GEM_PRICES={w_smg:120,w_ar:220,w_thunder:240,w_plasma:300,e_armor:180,e_medpack:90,e_nadebag:80,e_boots:40,e_magnet:30,w_sniper:240,w_glauncher:260,w_flamer:300,w_minigun:300,e_backpack:100,w_fox:140,w_burst:160,w_hunt:180,w_saw:200,w_vespa:210};
// Rewarded video ads. Empty blockId = no ad buttons and no ad script is ever loaded.
const AD_CONFIG={provider:'adsgram',blockId:''};
const AD_DAILY_MAX=5,AD_GEMS=5;
// Weekly prize claim links: ?claim=<amount>-<random8>-<sig8>, sig8 = first 8 hex of sha256(PRIZE_SALT+amount+'-'+random8)
const PRIZE_SALT='zs-2026';

const T=window.THREE;
const $=id=>document.getElementById(id);
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
if(isTouch){document.body.classList.add('touch');$('portrait').classList.add('show');}
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));

// ---------- Telegram Mini App (only if present / running inside Telegram) ----------
const TG={W:null};
function tgVer(v){try{return TG.W&&TG.W.isVersionAtLeast&&TG.W.isVersionAtLeast(v);}catch(e){return false;}}
function tgFull(){const W=TG.W;try{if(W&&tgVer('8.0')&&W.requestFullscreen&&!W.isFullscreen)W.requestFullscreen();}catch(e){}}
function tgInit(){const W=window.Telegram&&window.Telegram.WebApp;if(!W||TG.W===W||!(W.initData||(W.platform&&W.platform!=='unknown')))return;TG.W=W;try{document.documentElement.classList.add('zs-tg','zs-city');}catch(e){}try{W.ready();W.expand();if(W.disableVerticalSwipes)W.disableVerticalSwipes();if(tgVer('6.1')){W.setHeaderColor('#0b0d12');W.setBackgroundColor('#0b0d12');}if(tgVer('7.10')&&W.setBottomBarColor)W.setBottomBarColor('#0b0d12');}catch(e){}
  setTimeout(()=>{try{window.__zcTG&&window.__zcTG();}catch(e){}},0);tgFull();for(const ev of ['viewportChanged','fullscreenChanged','safeAreaChanged','contentSafeAreaChanged'])try{W.onEvent(ev,()=>setTimeout(function(){try{fitVP();}catch(e){}try{window.__zcResize&&window.__zcResize();}catch(e){}try{if(typeof bag432Fit==='function')bag432Fit();}catch(e){}},30));}catch(e){}
  setTimeout(()=>window.__zcResize&&window.__zcResize(),120);}
try{if(window.__zsApk){}
  else if(window.Telegram&&window.Telegram.WebApp)tgInit();
  else if(/tgWebApp/i.test(location.hash+location.search)||window.TelegramWebviewProxy){const s=document.createElement('script');s.src='https://telegram.org/js/telegram-web-app.js';s.async=true;s.onload=tgInit;s.onerror=function(){};document.head.appendChild(s);}}catch(e){}

// ---------- renderer ----------
const canvas=$('c');
const VW=()=>Math.max(1,canvas.clientWidth||document.documentElement.clientWidth||innerWidth),VH=()=>Math.max(1,canvas.clientHeight||document.documentElement.clientHeight||innerHeight);
const renderer=new T.WebGLRenderer({canvas,antialias:!isTouch,powerPreference:'high-performance',stencil:false});
function hd452Ratio(){const w=Math.max(1,innerWidth),h=Math.max(1,innerHeight),dpr=window.devicePixelRatio||1;let pr=Math.max(dpr,1920/w,1080/h);const capPx=1920*1080*1.5;if(w*h*pr*pr>capPx)pr=Math.sqrt(capPx/(w*h));pr=Math.max(1,Math.min(3,pr));if(pr+0.02<dpr&&w*h*dpr*dpr<=capPx)pr=Math.min(3,dpr);return Math.round(pr*100)/100;}
const MAX_PR=Math.min(3,Math.max(window.devicePixelRatio||1,hd452Ratio())),PR_MIN=Math.min(MAX_PR,isTouch?1.25:1);
let _pPR=0,curPR=hd452Ratio();
renderer.setPixelRatio(curPR);renderer.setSize(VW(),VH(),false);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false; // static baked-once shadows
renderer.outputColorSpace=T.SRGBColorSpace;renderer.autoClear=false;
const scene=new T.Scene();
const FOG=0x939dac;
scene.fog=new T.Fog(FOG,9,56);
const camera=new T.PerspectiveCamera(75,VW()/VH(),0.05,140);camera.rotation.order='YXZ';scene.add(camera);
// viewmodel scene (drawn on top, never clips into walls)
const vmScene=new T.Scene();const vmCam=new T.PerspectiveCamera(60,VW()/VH(),0.01,5);
vmScene.add(new T.HemisphereLight(0x9aa0d0,0x302018,1.1));const vmSun=new T.DirectionalLight(0xffb070,1.6);vmSun.position.set(-1,1.2,.6);vmScene.add(vmSun);
const vmFlash=new T.PointLight(0xffc060,0,3,1.5);vmFlash.position.set(.25,-.1,-.8);vmScene.add(vmFlash);
let _lw=0,_lh=0;function onResize(){const w=VW(),hh=VH();_lw=w;_lh=hh;renderer.setSize(w,hh,false);camera.aspect=vmCam.aspect=w/hh;camera.updateProjectionMatrix();vmCam.updateProjectionMatrix();if(typeof homeJoy==='function')homeJoy();try{fl431Apply(true);}catch(e){}}
addEventListener('resize',onResize);window.__zcResize=onResize;if(window.visualViewport)visualViewport.addEventListener('resize',onResize);try{new ResizeObserver(()=>{if(VW()!==_lw||VH()!==_lh)onResize();}).observe(canvas);}catch(e){}addEventListener('orientationchange',()=>setTimeout(onResize,250));

// ---------- textures ----------
function ani432(){let q='media';try{const u=new URLSearchParams(location.search).get('gfx');const j=JSON.parse(localStorage.getItem('zc_gfx')||'null');q=(typeof GFX43!=='undefined'&&GFX43.q)||u||(j&&j.q)||'media';}catch(e){}let mx=8;try{mx=renderer.capabilities.getMaxAnisotropy();}catch(e){}const want=zsShow()?(q==='bassa'?8:mx):(q==='bassa'?4:q==='alta'?16:8);return Math.max(1,Math.min(mx,want));}
function ani432Refresh(){const a=ani432(),seen=new Set();scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)for(const k of ['map','normalMap','bumpMap','roughnessMap']){const t=m[k];if(t&&!seen.has(t)&&t.wrapS===T.RepeatWrapping){seen.add(t);if(t.anisotropy!==a){t.anisotropy=a;t.needsUpdate=true;}}}});}
function grit(g,w,h,seed){let s=seed|0;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};g.save();
  g.strokeStyle='rgba(28,32,38,.34)';g.lineWidth=1;for(let i=0;i<16;i++){g.beginPath();let x=r()*w,y=r()*h;g.moveTo(x,y);for(let k=0;k<4;k++){x+=(r()-.5)*w*.14;y+=(r()-.5)*h*.08;g.lineTo(x,y);}g.stroke();}
  for(let i=0;i<34;i++){g.fillStyle=r()<.45?'rgba(255,255,255,.22)':'rgba(16,18,22,.22)';g.fillRect(r()*w,r()*h,1+r()*2.2,1+r()*3);}g.restore();}
function canvasTex(w,h,draw,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;if(rx){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry||rx);}t.anisotropy=ani432();return t;}
function speckle(g,w,h,n,cols,sw,sh){for(let i=0;i<n;i++){g.fillStyle=cols[(Math.random()*cols.length)|0];g.fillRect(Math.random()*w,Math.random()*h,sw||2,(sh||2)*(.5+Math.random()));}}
const groundTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#c3ccd8';g.fillRect(0,0,w,h);
  const blob=(n,col,r0,r1)=>{for(let i=0;i<n;i++){const x=Math.random()*w,y=Math.random()*h,r=r0+Math.random()*(r1-r0);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,col.replace(/[\d.]+\)$/,'0)'));g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}};
  blob(20,'rgba(140,156,182,.45)',30,95);blob(14,'rgba(250,252,255,.6)',25,80);blob(7,'rgba(92,90,78,.32)',12,34);
  speckle(g,w,h,9000,['rgba(255,255,255,.55)','rgba(170,182,202,.35)','rgba(120,132,150,.22)'],1.5,1.5);speckle(g,w,h,420,['rgba(70,74,66,.45)','rgba(96,84,62,.4)'],2,4);grit(g,w,h,43211);
  {let s=43351;const r=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
    for(let i=0;i<8;i++){const y=r()*h,th=14+r()*26;const gr=g.createLinearGradient(0,y,0,y+th);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.4,'rgba(248,252,255,.5)');gr.addColorStop(1,'rgba(130,148,170,0)');g.fillStyle=gr;g.fillRect(0,y,w,th);}
    for(let i=0;i<16;i++){const x=r()*w,y=r()*h,a=22+r()*36;g.fillStyle='rgba(96,114,138,.16)';g.beginPath();g.ellipse(x,y,a,a*.42,r()*2.4,0,6.3);g.fill();}
    g.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<260;i++){const x=r()*w,y=r()*h;g.fillRect(x,y,1.2,1.2);if(x<3)g.fillRect(x+w,y,1.2,1.2);if(y<3)g.fillRect(x,y+h,1.2,1.2);}}
},17);
const roadTex=canvasTex(128,512,(g,w,h)=>{g.clearRect(0,0,w,h);const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(150,156,166,0)');gr.addColorStop(.15,'rgba(150,154,162,.85)');gr.addColorStop(.85,'rgba(150,154,162,.85)');gr.addColorStop(1,'rgba(150,156,166,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  speckle(g,w,h,3500,['rgba(230,236,244,.5)','rgba(110,112,118,.4)','rgba(90,86,80,.35)'],2,2);
  g.fillStyle='rgba(78,72,66,.55)';for(const x of [36,47,80,91]){for(let y=0;y<h;y+=2)g.fillRect(x+Math.sin(y*.05)*2,y,6,2);}g.fillStyle='rgba(245,248,252,.35)';for(const x of [62]){for(let y=0;y<h;y+=2)g.fillRect(x+Math.sin(y*.04)*3,y,8,2);}},1,6);
const crateTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#7c5630';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.fillStyle='rgba(40,25,10,.25)';g.fillRect(0,Math.random()*h,w,1);}g.strokeStyle='#4a2f14';g.lineWidth=12;g.strokeRect(6,6,w-12,h-12);g.lineWidth=9;g.beginPath();g.moveTo(10,10);g.lineTo(w-10,h-10);g.stroke();});
const plankTex=canvasTex(256,256,(g,w,h)=>{for(let x=0;x<w;x+=32){const v=60+Math.random()*30;g.fillStyle=`rgb(${v+25},${v+12},${v-5})`;g.fillRect(x,0,32,h);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x,0,3,h);}
  speckle(g,w,h,2500,['rgba(30,20,10,.3)','rgba(150,130,100,.15)'],1,6);g.fillStyle='rgba(20,15,10,.5)';for(let i=0;i<12;i++)g.fillRect(Math.random()*w,Math.random()*h,3,3);grit(g,w,h,43213);});
const roofTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#4a3530';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16){for(let x=(y/16%2)*10;x<w;x+=20){g.fillStyle='rgba('+(70+Math.random()*30)+','+(40+Math.random()*15)+',34,1)';g.fillRect(x,y,18,14);}}
  g.fillStyle='rgba(236,241,248,.96)';g.fillRect(0,0,w,h*.78);for(let x=0;x<w;x+=6){g.fillRect(x,h*.78,6,Math.random()*12);}speckle(g,w,h*.78,600,['rgba(190,202,220,.6)','rgba(255,255,255,.8)'],3,2);grit(g,w,h,43217);});
const brickTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#4a4038';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=((y/16)%2)*16;x<w+16;x+=32){g.fillStyle=`rgb(${110+Math.random()*30},${60+Math.random()*20},${50+Math.random()*15})`;g.fillRect(x-14,y+1,30,14);}speckle(g,w,h,500,['rgba(0,0,0,.25)'],2,2);grit(g,w,h,43219);});
const barrelTex=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#7a2a1e';g.fillRect(0,0,w,h);g.fillStyle='#3a1a12';g.fillRect(0,10,w,4);g.fillRect(0,50,w,4);speckle(g,w,h,300,['rgba(140,80,40,.6)','rgba(40,20,10,.5)'],2,3);});
const barrelTex2=canvasTex(64,64,(g,w,h)=>{g.fillStyle='#2a4a6a';g.fillRect(0,0,w,h);g.fillStyle='#172a3a';g.fillRect(0,10,w,4);g.fillRect(0,50,w,4);speckle(g,w,h,300,['rgba(140,90,50,.6)','rgba(20,20,20,.5)'],2,3);});
const glowTex=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
const flashTex=canvasTex(64,64,(g)=>{g.translate(32,32);const gr=g.createRadialGradient(0,0,0,0,0,30);gr.addColorStop(0,'rgba(255,255,230,1)');gr.addColorStop(.3,'rgba(255,200,90,.9)');gr.addColorStop(1,'rgba(255,120,20,0)');g.fillStyle=gr;
  for(let i=0;i<7;i++){g.rotate(Math.PI*2/7);g.beginPath();g.moveTo(-5,0);g.lineTo(0,-31);g.lineTo(5,0);g.fill();}g.beginPath();g.arc(0,0,13,0,7);g.fill();});
const holeTex=canvasTex(32,32,(g)=>{const gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.35,'rgba(15,12,10,.95)');gr.addColorStop(.6,'rgba(40,35,30,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);});
const bloodTex=canvasTex(64,64,(g)=>{g.fillStyle='rgba(90,0,0,.9)';for(let i=0;i<9;i++){g.beginPath();g.arc(32+rand(-14,14),32+rand(-14,14),rand(4,12),0,7);g.fill();}g.fillStyle='rgba(60,0,0,.9)';g.beginPath();g.arc(32,32,10,0,7);g.fill();});
const skyTex=canvasTex(4,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#2c3442');gr.addColorStop(.28,'#58647a');gr.addColorStop(.43,'#8d98aa');gr.addColorStop(.5,'#a3adbb');gr.addColorStop(.56,'#929cab');gr.addColorStop(1,'#7e8796');g.fillStyle=gr;g.fillRect(0,0,w,h);});

// ---------- lights & sky ----------
const sky=new T.Mesh(new T.SphereGeometry(120,24,12),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,fog:false,depthWrite:false}));scene.add(sky);
const sunDisc=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0x9aa6ba,fog:false,depthWrite:false,blending:T.AdditiveBlending,transparent:true,opacity:.5}));sunDisc.scale.set(30,30,1);sunDisc.position.set(-95,8,-60);scene.add(sunDisc);
scene.add(new T.HemisphereLight(0xc4d0e8,0x4c505c,1.0));
const sun=new T.DirectionalLight(0xe6edff,1.15);sun.position.set(-60,30,-42);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
{const sc=sun.shadow.camera;sc.left=-100;sc.right=100;sc.top=100;sc.bottom=-100;sc.near=1;sc.far=240;}sun.shadow.bias=-0.0008;sun.shadow.normalBias=.03;scene.add(sun);
const muzzleLight=new T.PointLight(0xffc060,0,9,1.6);scene.add(muzzleLight);

// ---------- world ----------
const NEXT_CITY=true;
const OLD_CITY_BASE=new Set(scene.children);
const CORE=52,HALF=NEXT_CITY?168:96;const HOUSE_RECTS=[];
const boxes=[],circles=[],solids=[];
const ground=new T.Mesh(new T.PlaneGeometry(NEXT_CITY?400:240,NEXT_CITY?400:240),new T.MeshLambertMaterial({map:groundTex}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);solids.push(ground);
const road=new T.Mesh(new T.PlaneGeometry(8,HALF*2+4),new T.MeshLambertMaterial({map:roadTex,transparent:true,depthWrite:false}));road.rotation.x=-Math.PI/2;road.position.y=.012;road.receiveShadow=true;scene.add(road);
const MAT={wood:new T.MeshLambertMaterial({color:0x5a3e26}),crate:new T.MeshLambertMaterial({map:crateTex}),plank:new T.MeshLambertMaterial({map:plankTex}),roof:new T.MeshLambertMaterial({map:roofTex}),
 brick:new T.MeshLambertMaterial({map:brickTex}),dark:new T.MeshLambertMaterial({color:0x111015}),rust:new T.MeshLambertMaterial({color:0x6e3520,flatShading:true}),rust2:new T.MeshLambertMaterial({color:0x3e4a52,flatShading:true}),
 glass:new T.MeshLambertMaterial({color:0x1a2228,emissive:0x05080a}),tire:new T.MeshLambertMaterial({color:0x18181a}),metal:new T.MeshLambertMaterial({color:0x55585c}),
 trunk:new T.MeshLambertMaterial({color:0x3a2a1e}),pine:new T.MeshLambertMaterial({color:0x26402f,flatShading:true}),snow:new T.MeshLambertMaterial({color:0xeef2f8,flatShading:true}),rock:new T.MeshLambertMaterial({color:0x6a6e78,flatShading:true}),
 barrel:new T.MeshLambertMaterial({map:barrelTex}),barrel2:new T.MeshLambertMaterial({map:barrelTex2}),hill:new T.MeshLambertMaterial({color:0x6a7484,flatShading:true})};
// Real materials (4.3.22). Local LCG only: do not call Math.random here, the hills below still consume the global sequence.
const TXR22=(()=>{
  function make(w,h,seed,rx,ry,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
    let s=seed>>>0||1;const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};draw(g,w,h,rnd);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=ani432();return t;}
  const brick=make(256,256,0xB21C4,4,3,(g,w,h,rnd)=>{g.fillStyle='#b7aea6';g.fillRect(0,0,w,h);
    const cols=[[158,64,50],[176,82,60],[136,52,42],[192,102,74],[124,46,38]];const bw=58,bh=26,row=bh+6;
    for(let y=0,ri=0;y<h+row;y+=row,ri++){const off=ri%2?32:0;for(let x=-off;x<w;x+=64){const c=cols[(rnd()*cols.length)|0],j=(rnd()-.5)*14;
      g.fillStyle='rgb('+(c[0]+j|0)+','+(c[1]+j*.55|0)+','+(c[2]+j*.35|0)+')';g.fillRect(x+1,y+1,bw,bh);
      g.fillStyle='rgba(255,214,190,.28)';g.fillRect(x+1,y+1,bw,3);g.fillStyle='rgba(50,18,14,.32)';g.fillRect(x+1,y+bh-3,bw,3);
      if(rnd()<.16){g.fillStyle='rgba(70,28,20,.4)';g.fillRect(x+8+rnd()*28,y+7,8+rnd()*12,3);}}}});
  const wood=make(256,256,0xD00D11,4,1,(g,w,h,rnd)=>{const cols=[[118,76,42],[142,98,58],[98,64,36],[156,112,70],[84,54,30]];
    for(let x=0,i=0;x<w;x+=32,i++){const c=cols[i%cols.length],j=(rnd()-.5)*8;g.fillStyle='rgb('+(c[0]+j|0)+','+(c[1]+j|0)+','+(c[2]+j*.4|0)+')';g.fillRect(x,0,32,h);
      g.fillStyle='rgba(36,18,8,.7)';g.fillRect(x,0,3,h);g.strokeStyle='rgba(72,40,16,.4)';g.lineWidth=1;
      for(let k=0;k<5;k++){const x0=x+5+rnd()*22;g.beginPath();g.moveTo(x0,0);for(let y=0;y<=h;y+=18)g.lineTo(x0+Math.sin(y*.045+k+i)*1.5,y);g.stroke();}
      if(i%2===0){const ky=36+rnd()*(h-72),kx=x+16;g.fillStyle='rgba(62,32,12,.6)';g.beginPath();g.ellipse(kx,ky,3.5,6.5,0,0,7);g.fill();g.strokeStyle='rgba(96,58,24,.45)';g.beginPath();g.ellipse(kx,ky,7,11,0,0,7);g.stroke();}}
    if(!zsShow()){g.fillStyle='rgba(236,242,248,.55)';g.fillRect(0,0,w,5);}});
  const tile=make(256,256,0x710E5,4,3,(g,w,h,rnd)=>{g.fillStyle='#3a2924';g.fillRect(0,0,w,h);
    const cols=[[184,86,58],[204,108,72],[156,68,46],[172,78,52],[214,124,86]];const th=32,tw=42;
      for(let y=0,ri=0;y<h;y+=th,ri++){const off=ri%2?tw/2:0;if(!zsShow()){g.fillStyle='rgba(236,241,248,.7)';g.fillRect(0,y,w,2);}
      for(let x=-off;x<w;x+=tw){const c=cols[(rnd()*cols.length)|0],j=(rnd()-.5)*12;g.fillStyle='rgb('+(c[0]+j|0)+','+(c[1]+j*.65|0)+','+(c[2]+j*.35|0)+')';g.fillRect(x+1,y+4,tw-3,th-6);
        g.fillStyle='rgba(255,206,176,.3)';g.fillRect(x+1,y+4,tw-3,3);g.fillStyle='rgba(48,16,10,.6)';g.fillRect(x+1,y+th-5,tw-3,3);
        if(rnd()<.1){g.fillStyle='rgba(42,18,14,.7)';g.fillRect(x+6,y+9,tw-14,th-16);}}}});
  const plaster=make(256,256,0xA1A57,3,2,(g,w,h)=>{g.fillStyle='#e7e0d4';g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=20){g.fillStyle=y%40?'rgba(255,252,246,.1)':'rgba(92,78,64,.12)';g.fillRect(0,y,w,10);}
    g.fillStyle='#d4c6b0';g.fillRect(16,28,78,52);g.fillStyle='#c9b79a';g.fillRect(148,132,86,58);
    g.strokeStyle='rgba(120,104,86,.45)';g.strokeRect(16,28,78,52);g.strokeRect(148,132,86,58);
    for(const s of [[52,150,70,'rgba(122,108,86,.55)'],[190,48,64,'rgba(98,108,96,.4)'],[100,210,80,'rgba(90,82,70,.42)']]){
      const gr=g.createRadialGradient(s[0],s[1],6,s[0],s[1],s[2]);gr.addColorStop(0,s[3]);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(s[0],s[1],s[2],0,7);g.fill();}
    const dg=g.createLinearGradient(0,h*.62,0,h);dg.addColorStop(0,'rgba(110,96,82,0)');dg.addColorStop(1,'rgba(96,84,70,.5)');g.fillStyle=dg;g.fillRect(0,h*.62,w,h*.38);
    g.lineWidth=2.4;g.strokeStyle='rgba(62,50,40,.9)';g.beginPath();g.moveTo(24,8);g.lineTo(48,64);g.lineTo(36,124);g.lineTo(70,188);g.lineTo(52,248);g.stroke();
    g.beginPath();g.moveTo(176,6);g.lineTo(158,70);g.lineTo(196,128);g.lineTo(172,210);g.stroke();
    g.lineWidth=1.2;g.beginPath();g.moveTo(48,64);g.lineTo(92,78);g.moveTo(36,124);g.lineTo(8,146);g.stroke();
    g.strokeStyle='rgba(255,250,242,.55)';g.lineWidth=1;g.beginPath();g.moveTo(26,8);g.lineTo(50,64);g.lineTo(38,124);g.lineTo(72,188);g.stroke();});
  const stone=make(256,256,0x5704E,3,2,(g,w,h,rnd)=>{g.fillStyle='#6a645c';g.fillRect(0,0,w,h);
    const cols=[[176,172,164],[154,150,142],[196,192,184],[138,134,128]];
    for(let y=0,ri=0;y<h;y+=128,ri++){const off=ri%2?42:0;for(let x=-off;x<w;x+=84){const c=cols[(rnd()*cols.length)|0];
      g.fillStyle='rgb('+c[0]+','+c[1]+','+c[2]+')';g.fillRect(x+4,y+4,76,120);
      g.strokeStyle='rgba(255,255,255,.2)';g.strokeRect(x+6,y+6,72,116);g.strokeStyle='rgba(48,42,36,.4)';g.beginPath();g.moveTo(x+18,y+28);g.lineTo(x+48,y+46);g.lineTo(x+42,y+88);g.stroke();}}});
  const walk=stone.clone();walk.repeat.set(14,1);
  const asphalt=make(256,512,0xA5FA17,1,10,(g,w,h,rnd)=>{g.clearRect(0,0,w,h);const gr=g.createLinearGradient(0,0,w,0);
    gr.addColorStop(0,'rgba(52,56,62,0)');gr.addColorStop(.12,'rgba(58,62,68,.95)');gr.addColorStop(.88,'rgba(58,62,68,.95)');gr.addColorStop(1,'rgba(52,56,62,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.fillStyle='rgba(36,38,42,.6)';g.fillRect(78,36,96,34);g.fillRect(96,188,78,26);g.fillRect(72,348,120,42);
    g.strokeStyle='rgba(16,16,18,.85)';g.lineWidth=1.6;g.beginPath();g.moveTo(92,6);g.lineTo(104,78);g.lineTo(88,156);g.lineTo(114,248);g.lineTo(96,330);g.lineTo(120,430);g.lineTo(102,508);g.stroke();
    g.beginPath();g.moveTo(156,48);g.lineTo(166,132);g.lineTo(150,196);g.stroke();
    for(let i=0;i<640;i++){const x=w*.18+rnd()*w*.64,y=rnd()*h,v=36+rnd()*48;g.fillStyle='rgba('+v+','+v+','+(v+6|0)+','+(.22+rnd()*.3)+')';g.fillRect(x,y,1+(rnd()*2),1+(rnd()*2));}
    g.fillStyle='#d2bc6a';for(let y=22;y<h;y+=80)g.fillRect(w/2-5,y,10,32);});
  const scratch=make(256,256,0x5C2A7,3,2,(g,w,h,rnd)=>{g.fillStyle='#f2f2f3';g.fillRect(0,0,w,h);g.strokeStyle='rgba(28,28,30,.82)';
    for(let i=0;i<16;i++){g.lineWidth=rnd()<.75?1:1.7;g.beginPath();let x=rnd()*w,y=rnd()*h;g.moveTo(x,y);for(let k=0;k<5;k++){x+=(rnd()-.5)*70;y+=(rnd()-.5)*26;g.lineTo(x,y);}g.stroke();}
    g.fillStyle='rgba(18,18,20,.5)';for(let i=0;i<10;i++){g.beginPath();g.arc(rnd()*w,rnd()*h,1.4+rnd()*2.4,0,7);g.fill();}});
  const metal=make(256,256,0x3E7A1,2,2,(g,w,h)=>{g.fillStyle='#8d949c';g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=2){g.fillStyle=y%4?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)';g.fillRect(0,y,w,1);}
    g.strokeStyle='#3a4046';g.lineWidth=3;g.strokeRect(6,6,w-12,h-12);g.strokeStyle='#d0d6de';g.lineWidth=1;g.strokeRect(9,9,w-18,h-18);g.fillStyle='#2c3238';
    for(let y=28;y<h;y+=50)for(let x=28;x<w;x+=50){g.beginPath();g.arc(x,y,3.2,0,7);g.fill();g.fillStyle='#d8dee6';g.fillRect(x-1,y-2,2,1);g.fillStyle='#2c3238';}
    for(const p of [[58,188,30],[196,64,18]]){const gr=g.createRadialGradient(p[0],p[1],2,p[0],p[1],p[2]);gr.addColorStop(0,'rgba(146,74,36,.6)');gr.addColorStop(1,'rgba(146,74,36,0)');g.fillStyle=gr;g.beginPath();g.arc(p[0],p[1],p[2],0,7);g.fill();}});
  const bark=make(128,256,0xBA2C3,2,1,(g,w,h,rnd)=>{g.fillStyle='#4a3122';g.fillRect(0,0,w,h);
    for(let x=0;x<w;x+=7){const deep=x%14<7;g.fillStyle=deep?'rgba(22,10,6,.55)':'rgba(196,156,108,.16)';g.fillRect(x,0,4,h);g.strokeStyle=deep?'rgba(12,6,2,.8)':'rgba(110,70,40,.45)';g.lineWidth=1;g.beginPath();const x0=x+2;g.moveTo(x0,0);for(let y=0;y<=h;y+=14)g.lineTo(x0+Math.sin(y*.05+x)*.18*8,y);g.stroke();}
    g.strokeStyle='rgba(12,6,2,.75)';g.lineWidth=1.3;for(let y=22;y<h;y+=38){g.beginPath();g.moveTo(0,y);g.lineTo(w,y+(y%76?4:-3));g.stroke();}
    if(!zsShow()){g.fillStyle='rgba(236,242,248,.75)';for(let i=0;i<18;i++)g.fillRect(rnd()*w,rnd()*40,3+rnd()*8,2);}});
  const pine=make(256,256,0x91EE2,2,2,(g,w,h,rnd)=>{g.fillStyle='#143024';g.fillRect(0,0,w,h);
    const greens=[[28,64,40],[46,92,54],[22,50,32],[70,112,68],[18,42,30]];
    for(let y=4;y<h;y+=12)for(let x=4;x<w;x+=12){const c=greens[(rnd()*greens.length)|0];g.strokeStyle='rgb('+c[0]+','+c[1]+','+c[2]+')';g.lineWidth=1.45;const ox=x+(rnd()-.5)*2,oy=y+(rnd()-.5)*2;
      for(let k=0;k<5;k++){const a=-2.15+k*.4;g.beginPath();g.moveTo(ox,oy);g.lineTo(ox+Math.cos(a)*(7+rnd()*6),oy+Math.sin(a)*(7+rnd()*5));g.stroke();}
      if(rnd()<.6&&!zsShow()){g.strokeStyle='rgba(240,246,252,.9)';g.lineWidth=1;g.beginPath();g.moveTo(ox-4,oy-2);g.lineTo(ox+5,oy-1);g.stroke();}}
    if(!zsShow()){g.fillStyle='rgba(248,252,255,.92)';for(let i=0;i<40;i++)g.fillRect(rnd()*w,rnd()*h,2+rnd()*6,1.3);
    const cap=g.createLinearGradient(0,0,0,h*.34);cap.addColorStop(0,'rgba(246,250,255,.95)');cap.addColorStop(.55,'rgba(230,238,246,.55)');cap.addColorStop(1,'rgba(230,238,246,0)');g.fillStyle=cap;g.fillRect(0,0,w,h*.34);
    g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<18;i++)g.fillRect(rnd()*w,rnd()*h*.28,4+rnd()*10,2);}});
  return {brick,wood,tile,plaster,stone,walk,asphalt,scratch,metal,bark,pine};
})();
function txApply22(m,map,hex){if(!m||!map)return;m.map=map;if(hex!=null)m.color.setHex(hex);m.needsUpdate=true;}
txApply22(MAT.brick,TXR22.brick,0xffffff);txApply22(MAT.plank,TXR22.wood,0xffffff);txApply22(MAT.roof,TXR22.tile,0xffffff);
txApply22(MAT.wood,TXR22.wood,0xffffff);txApply22(MAT.pine,TXR22.pine,0xffffff);txApply22(MAT.trunk,TXR22.bark,0xffffff);
{const hillTex=canvasTex(512,512,function(g,w,h){let s=43341;const r=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#8b93a1');sky.addColorStop(.45,'#5e6876');sky.addColorStop(1,'#3d4550');g.fillStyle=sky;g.fillRect(0,0,w,h);
  for(let i=0;i<26;i++){const y=r()*h,v=48+r()*40;g.strokeStyle='rgba('+(v|0)+','+(v+8|0)+','+(v+18|0)+',.55)';g.lineWidth=2+r()*7;g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=28)g.lineTo(x,y+(r()-.5)*16);g.stroke();}
  for(let i=0;i<140;i++){const v=62+r()*70;g.fillStyle='rgb('+(v|0)+','+(v+4|0)+','+(v+14|0)+')';g.beginPath();g.moveTo(r()*w,r()*h);g.lineTo(r()*w,r()*h);g.lineTo(r()*w,r()*h);g.fill();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(28,32,38,'+(.15+r()*.35)+')';g.beginPath();g.ellipse(r()*w,r()*h,4+r()*18,2+r()*6,r()*3,0,6.3);g.fill();}
  if(!zsShow()){const sn=g.createLinearGradient(0,0,0,h*.7);sn.addColorStop(0,'rgba(250,252,255,.98)');sn.addColorStop(.28,'rgba(236,242,248,.9)');sn.addColorStop(.55,'rgba(214,224,234,.45)');sn.addColorStop(1,'rgba(214,224,234,0)');g.fillStyle=sn;g.fillRect(0,0,w,h*.7);
  g.strokeStyle='rgba(186,198,212,.55)';g.lineWidth=1.2;for(let i=0;i<18;i++){g.beginPath();g.moveTo(r()*w,r()*h*.35);g.lineTo(r()*w,r()*h*.55);g.stroke();}
  g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<80;i++)g.fillRect(r()*w,r()*h*.42,2+r()*10,1+r()*2);}},2,2);
 MAT.hill.map=hillTex;MAT.hill.color.setHex(0xffffff);}
txApply22(MAT.metal,TXR22.metal,0xffffff);txApply22(MAT.rust,TXR22.scratch,null);txApply22(MAT.rust2,TXR22.scratch,null);
txApply22(road.material,TXR22.asphalt,0xffffff);
const G={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(.5,.5,1,8),barrel:new T.CylinderGeometry(.36,.36,.95,10),wheel:new T.CylinderGeometry(.36,.36,.25,10),tire:new T.TorusGeometry(.32,.12,5,10),
 trunk:new T.CylinderGeometry(.16,.28,1,6),branch:new T.CylinderGeometry(.04,.1,1,4),pine:new T.ConeGeometry(1.5,3,7),rock:new T.DodecahedronGeometry(1,0)};
function mesh(geo,mat,x,y,z,sx,sy,sz,parent,cast){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);if(sx!==undefined)m.scale.set(sx,sy,sz);m.castShadow=cast!==false;m.receiveShadow=true;(parent||scene).add(m);return m;}
function solidBox(x,z,w,d,h,mat,y0,noCollide){const m=mesh(G.box,mat,x,(y0||0)+h/2,z,w,h,d);solids.push(m);if(!noCollide)boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});return m;}
// perimeter fence (instanced posts + rails, some broken)
{const posts=[],rails=[];
 for(let s=0;s<4;s++)for(let i=-CORE;i<=CORE;i+=2.5){const x=s<2?i:(s==2?-CORE:CORE),z=s<2?(s==0?-CORE:CORE):i;const jx=rand(-.12,.12),jz=rand(-.12,.12);if(Math.abs(i)>=6.5)posts.push([x,z,jx,jz]);
  if(i+2.5<=CORE)for(const yy of [.55,1.15])if(Math.random()>.15){const yy2=yy+rand(-.08,.08),tilt=rand(-.1,.1);if(Math.abs(i+1.25)>=6.5)rails.push([s<2?x+1.25:x,yy2,s<2?z:z+1.25,s>=2,tilt]);}}
 const pm=new T.InstancedMesh(G.box,MAT.wood,posts.length),rm=new T.InstancedMesh(G.box,MAT.wood,rails.length);const o=new T.Object3D();
 posts.forEach((p,i)=>{o.position.set(p[0],.85,p[1]);o.rotation.set(p[2],0,p[3]);o.scale.set(.18,1.7,.18);o.updateMatrix();pm.setMatrixAt(i,o.matrix);});
 rails.forEach((r,i)=>{o.position.set(r[0],r[1],r[2]);o.rotation.set(0,r[3]?Math.PI/2:0,r[4]);o.scale.set(2.55,.14,.06);o.updateMatrix();rm.setMatrixAt(i,o.matrix);});
 pm.castShadow=rm.castShadow=true;scene.add(pm,rm);const gate=6.5,camp=CORE,thick=.5;boxes.push({x0:-camp,x1:-gate,z0:-camp-thick,z1:-camp+thick},{x0:gate,x1:camp,z0:-camp-thick,z1:-camp+thick},{x0:-camp,x1:-gate,z0:camp-thick,z1:camp+thick},{x0:gate,x1:camp,z0:camp-thick,z1:camp+thick},{x0:-camp-thick,x1:-camp+thick,z0:-camp,z1:-gate},{x0:-camp-thick,x1:-camp+thick,z0:gate,z1:camp},{x0:camp-thick,x1:camp+thick,z0:-camp,z1:-gate},{x0:camp-thick,x1:camp+thick,z0:gate,z1:camp});}
// houses (axis aligned) with door gap
function house(cx,cz,w,d,door){HOUSE_RECTS.push([cx,cz,w/2+.6,d/2+.6]);const h=2.8,t=.3;const mat=MAT.plank;
  const wall=(x,z,ww,dd)=>solidBox(x,z,ww,dd,h,mat);
  if(door!=='n')wall(cx,cz-d/2,w,t);else{wall(cx-w/4-.4,cz-d/2,w/2-.8,t);wall(cx+w/4+.4,cz-d/2,w/2-.8,t);solidBox(cx,cz-d/2,1.6,t,.6,mat,h-.6,true);}
  if(door!=='s')wall(cx,cz+d/2,w,t);else{wall(cx-w/4-.4,cz+d/2,w/2-.8,t);wall(cx+w/4+.4,cz+d/2,w/2-.8,t);solidBox(cx,cz+d/2,1.6,t,.6,mat,h-.6,true);}
  if(door!=='w')wall(cx-w/2,cz,t,d);else{wall(cx-w/2,cz-d/4-.4,t,d/2-.8);wall(cx-w/2,cz+d/4+.4,t,d/2-.8);solidBox(cx-w/2,cz,t,1.6,.6,mat,h-.6,true);}
  if(door!=='e')wall(cx+w/2,cz,t,d);else{wall(cx+w/2,cz-d/4-.4,t,d/2-.8);wall(cx+w/2,cz+d/4+.4,t,d/2-.8);solidBox(cx+w/2,cz,t,1.6,.6,mat,h-.6,true);}
  // windows (dark, visual)
  mesh(G.box,MAT.dark,cx,1.6,cz-d/2-.01,1,.8,.32,null,false);mesh(G.box,MAT.dark,cx,1.6,cz+d/2+.01,1,.8,.32,null,false);
  // gable roof (two slabs, one partially collapsed)
  const ang=.55,half=w/2/Math.cos(ang)+.3;
  const r1=mesh(G.box,MAT.roof,cx-w/4,h+Math.tan(ang)*w/4,cz,half,.12,d+.5);r1.rotation.z=ang;
  const r2=mesh(G.box,MAT.roof,cx+w/4,h+Math.tan(ang)*w/4-.25,cz+.3,half,.12,d*.7);r2.rotation.z=-ang+.12;solids.push(r1,r2);}
house(-13,-10,7,6,'e');house(13,9,6,6,'w');
// broken cars
function car(x,z,rot,mat){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
  mesh(G.box,mat,0,.62,0,1.8,.55,4.1,g);const hood=mesh(G.box,mat,0,.92,-1.45,1.75,.12,1.1,g);hood.rotation.x=.18;
  mesh(G.box,mat,0,1.15,.35,1.6,.55,2.1,g);mesh(G.box,MAT.glass,0,1.17,.35,1.64,.4,1.6,g,false);mesh(G.box,MAT.glass,0,1.17,.35,1.3,.4,2.14,g,false);
  mesh(G.box,MAT.metal,0,.45,-2.07,1.7,.18,.08,g);mesh(G.box,MAT.metal,0,.45,2.07,1.7,.18,.08,g);
  for(const [wx,wz,miss] of [[-.88,-1.3],[.88,-1.3],[-.88,1.3],[.88,1.3,1]]){if(miss)continue;const w=mesh(G.wheel,MAT.tire,wx,.34,wz,1,1,1,g);w.rotation.z=Math.PI/2;}
  mesh(G.box,MAT.snow,0,1.46,.35,1.56,.07,2.02,g);mesh(G.box,MAT.snow,0,1.0,-1.45,1.7,.05,1.0,g).rotation.x=.18;mesh(G.box,MAT.snow,0,.93,1.6,1.7,.05,.8,g);
  g.rotation.z=.07;g.userData.sc=[1.15,.92,1.5];g.children.forEach(c=>{c.userData.dyn=1;solids.push(c);});
  (window.__cars23=window.__cars23||[]).push(g);
  const c=Math.abs(Math.cos(rot))>.5;boxes.push({x0:x-(c?1:2.15),x1:x+(c?1:2.15),z0:z-(c?2.15:1),z1:z+(c?2.15:1)});}
car(2.8,-13,0.04,MAT.rust);car(-5,15,Math.PI/2+.05,MAT.rust2);
// barrels
function barrel(x,z,lying,mat){const m=mesh(G.barrel,mat||MAT.barrel,x,lying?.36:.475,z);if(lying){m.rotation.z=Math.PI/2;m.rotation.y=rand(0,3);}solids.push(m);circles.push({x,z,r:lying?.55:.4});}
[[8,-3],[8.8,-2.4,0,1],[8.3,-1.4,1],[-8,4],[-8.8,4.6,0,1],[16,-14],[-20,20,0,1],[20,22],[-22,-20,1],[-3.5,-24],[24,-24,0,1]].forEach(b=>barrel(b[0],b[1],b[2],b[3]?MAT.barrel2:MAT.barrel));
// crates
[[-6,-20,1.2],[-4.8,-21.2,1],[18,-2,1.3],[22,14,1.1],[-18,8,1.2],[-16,24,1],[-17,25.2,.9]].forEach(([x,z,s])=>{const m=solidBox(x,z,s,s,s,MAT.crate);m.rotation.y=rand(-.3,.3);const c=mesh(G.box,MAT.snow,x,s+.03,z,s*1.02,.07,s*1.02,null,false);c.rotation.y=m.rotation.y;});
// brick ruins
solidBox(10,-21,6,.4,1.4,MAT.brick);solidBox(7.2,-19.5,.4,3,1.0,MAT.brick);solidBox(-24,10,.4,5,1.6,MAT.brick);solidBox(-24,13.2,.4,1.4,.7,MAT.brick);
// inner broken fences
function fenceLine(x0,z0,x1,z1){const n=Math.round(Math.hypot(x1-x0,z1-z0)/1.5);for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),z=lerp(z0,z1,i/n);const p=mesh(G.box,MAT.wood,x,.65,z,.14,1.3,.14);p.rotation.z=rand(-.15,.15);}
  const len=Math.hypot(x1-x0,z1-z0),ang=Math.atan2(z1-z0,x1-x0);for(const yy of [.45,.95]){const r=mesh(G.box,MAT.wood,(x0+x1)/2,yy,(z0+z1)/2,len,.12,.05);r.rotation.y=-ang;r.rotation.z=rand(-.06,.06);}
  const thin=Math.abs(x1-x0)<Math.abs(z1-z0),pad=thin?.55:.12,padz=thin?.12:.55;boxes.push({x0:Math.min(x0,x1)-pad,x1:Math.max(x0,x1)+pad,z0:Math.min(z0,z1)-padz,z1:Math.max(z0,z1)+padz});}
fenceLine(-26,-2,-19,-2);fenceLine(19,-21,19,-14);fenceLine(-9,23,-2,23);
// lamp posts with flickering lights
const lamps=[];
function lamp(x,z,side,flick){const pole=mesh(G.cyl,MAT.metal,x,1.9,z,.12,3.8,.12);pole.userData.dyn=1;solids.push(pole);circles.push({x,z,r:.15});
  const arm=mesh(G.box,MAT.metal,x+side*.45,3.75,z,.9,.07,.07);arm.userData.dyn=1;const head=mesh(G.box,MAT.dark,x+side*.85,3.65,z,.35,.12,.25);head.userData.dyn=1;
  const bulbMat=new T.MeshBasicMaterial({color:0xffd590});const bulb=mesh(G.box,bulbMat,x+side*.85,3.57,z,.22,.05,.16,null,false);bulb.userData.dyn=1;
  const halo=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffb050,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));halo.scale.set(2.6,2.6,1);halo.position.set(x+side*.85,3.5,z);scene.add(halo);
  const L=new T.PointLight(0xffb060,14,16,1.6);L.position.set(x+side*.85,3.3,z);scene.add(L);lamps.push({L,halo,bulbMat,base:14,flick,t:0,off:0});
  (window.__lamps23=window.__lamps23||[]).push({x,z,side,hide:[pole,arm,head,bulb]});}
lamp(4.4,-4,-1,true);lamp(-4.4,8,1,false);lamp(4.4,22,-1,true);
// tires & debris
[[6,10],[-10,-16],[15,18]].forEach(([x,z])=>{const t=mesh(G.tire,MAT.tire,x,.12,z);t.rotation.x=Math.PI/2;});
function freeSpot(x,z,r){if(Math.abs(x)>HALF-2||Math.abs(z)>HALF-2)return false;if(Math.abs(x)<4.5&&r>1)return false;if(Math.hypot(x,z)<4)return false;
  for(const b of boxes)if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r)return false;for(const c of circles)if(!c.off&&Math.hypot(x-c.x,z-c.z)<c.r+r)return false;
  for(const h of HOUSE_RECTS)if(Math.abs(x-h[0])<h[2]&&Math.abs(z-h[1])<h[3]&&r>1)return false;if(Math.abs(z+24)<4&&r>1)return false;return true;}
let rs=777;const rnd=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;};
// ================= v4 expanded map (~3x area) =================
{const r2=new T.Mesh(new T.PlaneGeometry(7,HALF*2+4),road.material);r2.rotation.set(-Math.PI/2,0,Math.PI/2);r2.position.set(0,.013,-24);r2.receiveShadow=true;scene.add(r2);}
roadTex.repeat.set(1,11);
function lampFake(x,z,side){const pole=mesh(G.cyl,MAT.metal,x,1.9,z,.12,3.8,.12);pole.userData.dyn=1;solids.push(pole);circles.push({x,z,r:.15});
  const arm=mesh(G.box,MAT.metal,x+side*.45,3.75,z,.9,.07,.07);arm.userData.dyn=1;const head=mesh(G.box,MAT.dark,x+side*.85,3.65,z,.35,.12,.25);head.userData.dyn=1;
  const bulb=mesh(G.box,lampBulbFake,x+side*.85,3.57,z,.22,.05,.16,null,false);bulb.userData.dyn=1;const halo=new T.Sprite(lampHaloMat);halo.scale.set(2.4,2.4,1);halo.position.set(x+side*.85,3.5,z);scene.add(halo);
  (window.__lamps23=window.__lamps23||[]).push({x,z,side,hide:[pole,arm,head,bulb]});}
const lampBulbFake=new T.MeshBasicMaterial({color:0xffd590}),lampHaloMat=new T.SpriteMaterial({map:glowTex,color:0xffb050,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.85});
MAT.hay=new T.MeshLambertMaterial({color:0xb89a52});MAT.redPaint=new T.MeshLambertMaterial({color:0x8a2a22,map:TXR22.scratch});MAT.stoneW=new T.MeshLambertMaterial({map:TXR22.stone,color:0xffffff,flatShading:true});MAT.walk=new T.MeshLambertMaterial({map:TXR22.walk,color:0xffffff});
// north village
house(-14,-38,7,6,'s');house(13,-37,6,6,'s');house(27,-44,7,6,'w');house(-29,-33,6,6,'e');house(-12,-48,6,4.6,'s');house(-40,-44,6,5,'e');
// church with bell tower
solidBox(42,-40,4.6,4.6,7.6,MAT.brick);mesh(G.pine,MAT.roof,42,9.1,-40,1.75,1.0,1.75);mesh(G.box,MAT.dark,42,6.2,-42.32,1,1.3,.1,null,false);mesh(G.box,MAT.dark,39.68,6.2,-40,.1,1.3,1,null,false);
solidBox(42,-35.2,6,5,4,MAT.stoneW);{const r=mesh(G.box,MAT.roof,40.6,4.7,-35.2,3.6,.14,5.4);r.rotation.z=.7;const r2=mesh(G.box,MAT.roof,43.4,4.7,-35.2,3.6,.14,5.4);r2.rotation.z=-.7;solids.push(r,r2);}
// gas station (east)
for(const [px,pz] of [[30,6],[38,6],[30,14],[38,14]]){const p=mesh(G.cyl,MAT.metal,px,2,pz,.25,4,.25);solids.push(p);circles.push({x:px,z:pz,r:.2});}
{const c=mesh(G.box,MAT.metal,34,4.1,10,10.5,.35,10.5);solids.push(c);mesh(G.box,MAT.snow,34,4.32,10,10.4,.1,10.4);mesh(G.box,MAT.redPaint,34,3.82,4.7,10.5,.3,.12,null,false);}
solidBox(32.6,10,.7,.9,1.5,MAT.redPaint);solidBox(35.4,10,.7,.9,1.5,MAT.redPaint);house(45,10,6,7,'w');
// farm (west): barn + hay + tractor
house(-38,9,10,8,'e');for(const [hx,hz] of [[-30,2],[-31.4,2.4],[-30.6,3.8],[-45,20],[-43.6,20.6]]){const m=mesh(G.cyl,MAT.hay,hx,.62,hz,1.25,1.1,1.25);m.rotation.z=Math.PI/2;m.rotation.y=rand(0,3);solids.push(m);circles.push({x:hx,z:hz,r:.65});}
fenceLine(-48,-1,-31,-1);fenceLine(-48,18,-34,18);car(-28,16,.2,MAT.redPaint);
// south cabins
house(22,38,6,5,'n');house(-24,40,6,6,'n');house(40,30,6,6,'n');
// cars, ruins, props
car(1.9,-33,.06,MAT.rust);car(-20,-24.6,Math.PI/2+.04,MAT.rust2);car(27,-23.2,Math.PI/2-.1,MAT.rust);car(36,0,.3,MAT.rust2);car(-2,36,-.08,MAT.rust);car(-40,-24,Math.PI/2,MAT.rust);
solidBox(-40,-12,6,.4,1.5,MAT.brick);solidBox(-37.2,-10.6,.4,3,1.1,MAT.brick);solidBox(18,26,5,.4,1.3,MAT.brick);solidBox(-12,28,.4,4,1.6,MAT.brick);solidBox(46,-14,.4,5,1.4,MAT.brick);
[[-30,-20],[-30.8,-19.4,0,1],[30,-28],[44,22,1],[-46,30,0,1],[10,44],[11,44.8,1,1],[-6,-44],[46,40,0,1],[-18,-30,1]].forEach(b=>barrel(b[0],b[1],b[2],b[3]?MAT.barrel2:MAT.barrel));
[[-26,-38,1.2],[16,-30,1],[30,18,1.3],[-34,24,1.1],[24,44,1],[-10,-40,.9],[34,-46,1.1],[-44,-6,1.2]].forEach(([x,z,s])=>{const m=solidBox(x,z,s,s,s,MAT.crate);m.rotation.y=rand(-.3,.3);const c=mesh(G.box,MAT.snow,x,s+.03,z,s*1.02,.07,s*1.02,null,false);c.rotation.y=m.rotation.y;});
lampFake(4.4,-20,-1);lampFake(-4.4,-28,1);lampFake(4.4,-40,-1);lampFake(20,-20.4,-1);lampFake(-20,-20.4,1);lampFake(-4.4,36,1);lampFake(32,-20.4,-1);
fenceLine(8,-50,20,-50);fenceLine(-49,36,-38,36);fenceLine(30,48,44,48);
[[6,10],[-10,-16],[15,18],[-34,-30],[28,32]].forEach(([x,z])=>{const t=mesh(G.tire,MAT.tire,x,.12,z);t.rotation.x=Math.PI/2;});

// ================= harvestable nodes (instanced: trees / dead trees / rocks) =================
const NODES=[];const _nm=new T.Matrix4(),_nm2=new T.Matrix4(),_no=new T.Object3D(),_nq=new T.Quaternion(),_ne=new T.Euler();
function nIM(geo,mat,n){const m=new T.InstancedMesh(geo,mat,n);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.count=0;for(let i=0;i<n;i++)m.setMatrixAt(i,ZERO_M);scene.add(m);solids.push(m);return m;}
const ZERO_M=new T.Matrix4().makeScale(0,0,0);
const NIM={trunk:nIM(G.trunk,MAT.trunk,110),pine:nIM(G.pine,MAT.pine,170),snowc:nIM(G.pine,MAT.snow,170),branch:nIM(G.branch,MAT.trunk,110),rock:nIM(G.rock,MAT.rock,60),rocks:nIM(G.rock,MAT.snow,60)};
function nLocal(px,py,pz,sx,sy,sz,rx,ry,rz,ty){_no.position.set(px,py,pz);_no.rotation.set(rx||0,ry||0,rz||0);_no.scale.set(sx,sy,sz);if(ty)_no.translateY(ty);_no.updateMatrix();return _no.matrix.clone();}
function nAdd(n,im,local){const idx=im.count++;n.parts.push({im,idx,local});}
function nodeWrite(n){_ne.set(n.tilt*n.tdx,n.rot,n.tilt*n.tdz,'YXZ');_nq.setFromEuler(_ne);const s=n.s*(n.grow<1?Math.max(.01,n.grow):1);_nm.compose(_no.position.set(n.x,0,n.z),_nq,_no.scale.set(s,s,s));
  for(const p of n.parts){if(!n.alive){p.im.setMatrixAt(p.idx,ZERO_M);}else{_nm2.multiplyMatrices(_nm,p.local);p.im.setMatrixAt(p.idx,_nm2);}p.im.instanceMatrix.needsUpdate=true;}}
function makeNode(type,x,z,s){const n={type,x,z,s,rot:rnd()*6.28,parts:[],alive:true,tilt:0,tdx:0,tdz:1,grow:1,prog:0,given:0,regrow:0,fall:0,shake:0,
  need:type==='pine'?6:type==='dead'?4:5,r:type==='rock'?s*1.0:type==='pine'?1.5*s:.35*s};
  if(type==='pine'){nAdd(n,NIM.trunk,nLocal(0,1,0,1,2,1));nAdd(n,NIM.pine,nLocal(0,2.8,0,1,1,1));nAdd(n,NIM.pine,nLocal(0,4,0,.75,.8,.75));nAdd(n,NIM.snowc,nLocal(0,4.42,0,.5,.52,.5));nAdd(n,NIM.snowc,nLocal(0,3.35,0,.8,.42,.8));}
  else if(type==='dead'){nAdd(n,NIM.trunk,nLocal(0,1.6,0,1,3.2,1));for(let b=0;b<4;b++)nAdd(n,NIM.branch,nLocal(0,2+b*.35,0,1,1.4-b*.15,1,rnd()*.6+.5,b*1.7,0,.6));}
  else{const rx=rnd(),rz=rnd();nAdd(n,NIM.rock,nLocal(0,.3,0,1.25,.75,1,rx,0,rz));nAdd(n,NIM.rocks,nLocal(0,.55,0,1.05,.32,.85,rx*.3,0,rz*.3));}
  n.circle={x,z,r:type==='pine'?Math.min(.42,n.r*.28):n.r,off:false,node:n};circles.push(n.circle);NODES.push(n);nodeWrite(n);return n;}
for(let n=0,t=0;n<64&&t<4000;t++){const forest=n<34;const x=forest?(rnd()*2-1)*(CORE-4):(rnd()*2-1)*(CORE-3),z=forest?24+rnd()*(CORE-27):(rnd()*2-1)*(CORE-3);if(!freeSpot(x,z,2))continue;n++;makeNode('pine',x,z,.9+rnd()*.55);}
for(let n=0,t=0;n<22&&t<3000;t++){const x=(rnd()*2-1)*(CORE-3),z=(rnd()*2-1)*(CORE-3);if(!freeSpot(x,z,1.6))continue;n++;makeNode('dead',x,z,.9+rnd()*.5);}
for(let n=0,t=0;n<40&&t<3000;t++){const x=(rnd()*2-1)*(CORE-3),z=(rnd()*2-1)*(CORE-3);if(!freeSpot(x,z,1.5))continue;n++;makeNode('rock',x,z,.45+rnd()*.6);}
for(const k in NIM){NIM[k].instanceMatrix.needsUpdate=true;NIM[k].computeBoundingSphere&&NIM[k].computeBoundingSphere();}

// distant silhouettes moved farther for the bigger map
for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=112+Math.random()*6,sx=7+Math.random()*5,sy=3+Math.random()*4,sz=7+Math.random()*5,px=Math.cos(a)*r,pz=Math.sin(a)*r;
  const h=mesh(G.pine,MAT.hill,px,sy*.85,pz,sx*1.2,sy*2.05,sz*1.2,null,false);h.receiveShadow=false;
  const sh=mesh(G.pine,MAT.hill,px+Math.cos(a+1.15)*sx*.85,sy*.45,pz+Math.sin(a+1.15)*sz*.85,sx*.85,sy*1.05,sz*.85,null,false);sh.castShadow=false;sh.receiveShadow=false;
  const rk=mesh(G.box,MAT.hill,px,sy*.16,pz,sx*.8,.42,sz*.8,null,false);rk.rotation.y=a;rk.castShadow=false;rk.receiveShadow=false;
  const cap=mesh(G.pine,MAT.snow,px,sy*1.22,pz,sx*.42,sy*.36,sz*.42,null,false);cap.castShadow=false;cap.receiveShadow=false;}
for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2,r=110+Math.random()*6,sx=3+Math.random()*3,sy=4.4+Math.random()*3,px=Math.cos(a)*r,pz=Math.sin(a)*r;
  const m=mesh(G.pine,MAT.hill,px,sy*.5,pz,sx*1.55,sy*1.15,sx*1.15,null,false);m.rotation.y=a;m.receiveShadow=false;
  const m2=mesh(G.pine,MAT.hill,px+Math.cos(a)*sx*.85,sy*.3,pz+Math.sin(a)*sx*.85,sx*.72,sy*.55,sx*.6,null,false);m2.castShadow=false;m2.receiveShadow=false;
  const cap=mesh(G.pine,MAT.snow,px,sy*1.02,pz,sx*.5,sy*.26,sx*.42,null,false);cap.castShadow=false;cap.receiveShadow=false;}
// ---- merge static meshes by material/shadow/cell: keeps draw calls low on phones ----
function mergeStatics(){const skip=new Set([ground,road,sky]);const groups=new Map();scene.updateMatrixWorld(true);const _p=new T.Vector3();
  scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||skip.has(o)||o.userData.dyn)return;const m=o.material;if(Array.isArray(m)||m.transparent)return;let p=o.parent;while(p&&p!==scene){if(p.isCamera)return;p=p.parent;}
    _p.setFromMatrixPosition(o.matrixWorld);const key=m.uuid+'|'+(o.castShadow?1:0)+'|'+Math.floor((_p.x+90)/26)+':'+Math.floor((_p.z+90)/26);let g=groups.get(key);if(!g){g={m,cast:o.castShadow,list:[]};groups.set(key,g);}g.list.push(o);});
  const solidSet=new Set(solids),added=[];let merged=0;
  for(const g0 of groups.values()){if(g0.list.length<2)continue;let n=0;const gs=g0.list.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);n+=g.attributes.position.count;return g;});
    const P=new Float32Array(n*3),Nn=new Float32Array(n*3),U=new Float32Array(n*2);let off=0;
    for(const g of gs){P.set(g.attributes.position.array,off*3);Nn.set(g.attributes.normal.array,off*3);if(g.attributes.uv)U.set(g.attributes.uv.array,off*2);off+=g.attributes.position.count;g.dispose();}
    const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(P,3));bg.setAttribute('normal',new T.BufferAttribute(Nn,3));bg.setAttribute('uv',new T.BufferAttribute(U,2));bg.computeBoundingSphere();
    const mm=new T.Mesh(bg,g0.m);mm.castShadow=g0.cast;mm.receiveShadow=true;mm.matrixAutoUpdate=false;scene.add(mm);let sol=false;
    for(const o of g0.list){if(solidSet.delete(o))sol=true;o.parent.remove(o);merged++;}if(sol)added.push(mm);}
  solids.length=0;for(const s of solidSet)solids.push(s);for(const s of added)solids.push(s);
  for(const c of scene.children.slice())if(c.isGroup&&!c.children.length)scene.remove(c);return merged;}
// ================= v4.2 richer map: POIs, trails, props (merged into static chunks) =================
{let ws=4242;const wr=()=>{ws=(ws*16807)%2147483647;return ws/2147483647;};const wR=(a,b)=>a+(b-a)*wr();
 const ok=(x,z,r)=>Math.abs(x)<CORE-3&&Math.abs(z)<CORE-3&&Math.hypot(x,z)>9&&Math.abs(x)>4.2&&Math.abs(z+24)>4.2&&freeSpot(x,z,r);
 MAT.bush=new T.MeshLambertMaterial({color:0x34503a,flatShading:true});MAT.dead=new T.MeshLambertMaterial({color:0x4a3a2c,flatShading:true});MAT.tent=new T.MeshLambertMaterial({color:0x4f6a3a,flatShading:true});
 MAT.tent2=new T.MeshLambertMaterial({color:0x7a5a32,flatShading:true});MAT.trail=new T.MeshLambertMaterial({color:0x9aa0aa,transparent:true,opacity:.55,depthWrite:false});MAT.sign=new T.MeshLambertMaterial({color:0xb8a070});
 const ico=new T.IcosahedronGeometry(1,0),cone4=new T.ConeGeometry(1,1,4);
 // snow drifts + bushes + small stones scattered (non-blocking)
 for(let i=0;i<150;i++){const x=wR(-CORE+4,CORE-4),z=wR(-CORE+4,CORE-4);if(!ok(x,z,.6))continue;const k=wr();
   if(k<.45){const s=wR(.5,1.1);const m=mesh(ico,MAT.bush,x,s*.45,z,s,s*.7,s);m.rotation.y=wr()*6;const c=mesh(ico,MAT.snow,x,s*.75,z,s*.7,s*.25,s*.7,null,false);c.rotation.y=m.rotation.y;}
   else if(k<.8){const m=mesh(ico,MAT.snow,x,.05,z,wR(1,2.4),wR(.15,.35),wR(.8,1.6),null,false);m.rotation.y=wr()*6;}
   else{const s=wR(.2,.45);const m=mesh(G.rock,MAT.rock,x,s*.4,z,s,s*.7,s*1.1);m.rotation.set(wr(),wr()*6,wr());}}
 // dead trees (blocking, thin)
 for(let i=0;i<22;i++){const x=wR(-CORE+5,CORE-5),z=wR(-CORE+5,CORE-5);if(!ok(x,z,1))continue;const h=wR(3,4.6);const t=mesh(G.trunk,MAT.dead,x,h/2,z,.8,h,.8);solids.push(t);circles.push({x,z,r:.32});
   for(let b=0;b<3;b++){const br=mesh(G.branch,MAT.dead,x,h*wR(.55,.85),z,1,wR(1,1.7),1);br.rotation.set(wR(.6,1.1),wr()*6,0);br.position.x+=Math.sin(br.rotation.y)*.4;br.position.z+=Math.cos(br.rotation.y)*.4;}}
 // abandoned camp (south-west): tents, cold fire ring, crates, sign
 {const cx=-30,cz=30;for(const [dx,dz,ry,m] of [[-3,-1,.4,MAT.tent],[2.6,-2,-.5,MAT.tent2],[0,3.2,1.6,MAT.tent]]){const x=cx+dx,z=cz+dz;if(!freeSpot(x,z,1.4))continue;const t=mesh(cone4,m,x,1.05,z,1.7,2.1,2.2);t.rotation.y=ry+Math.PI/4;solids.push(t);circles.push({x,z,r:1.25});mesh(G.box,MAT.snow,x,2.0,z,.5,.08,.5,null,false);}
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;mesh(G.rock,MAT.rock,cx+Math.cos(a)*.7,.12,cz+Math.sin(a)*.7,.22,.16,.22);}mesh(G.box,MAT.dark,cx,.03,cz,1.1,.04,1.1,null,false);
  if(freeSpot(cx+4,cz+2,.8))solidBox(cx+4,cz+2,.9,.9,.9,MAT.crate);
  const p=mesh(G.box,MAT.wood,cx+5.5,1,cz-4,.12,2,.12);solids.push(p);circles.push({x:cx+5.5,z:cz-4,r:.12});mesh(G.box,MAT.sign,cx+5.5,1.7,cz-4,1.2,.5,.06);}
 // radio tower (north-east)
 {const tx=46,tz=-24;if(freeSpot(tx,tz,2)){for(const [ox,oz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const l=mesh(G.box,MAT.metal,tx+ox*.9,6,tz+oz*.9,.12,12,.12);l.rotation.set(oz*.06,0,-ox*.06);solids.push(l);}
   for(let y=1.5;y<12;y+=2){mesh(G.box,MAT.metal,tx,y,tz-.85,1.8-y*.06,.08,.08);mesh(G.box,MAT.metal,tx,y,tz+.85,1.8-y*.06,.08,.08);mesh(G.box,MAT.metal,tx-.85,y,tz,.08,.08,1.8-y*.06);mesh(G.box,MAT.metal,tx+.85,y,tz,.08,.08,1.8-y*.06);}
   boxes.push({x0:tx-1.1,x1:tx+1.1,z0:tz-1.1,z1:tz+1.1});mesh(G.box,MAT.redPaint,tx,12.2,tz,.3,.3,.3,null,false);solidBox(tx+3,tz+1,2.4,2,2.2,MAT.metal);mesh(G.box,MAT.snow,tx+3,2.26,tz+1,2.5,.1,2.1,null,false);}}
 // tyre piles and a wrecked bus (west road)
 for(const [x,z] of [[-20,-6],[24,-10],[8,30],[-44,40]]){if(!freeSpot(x,z,.9))continue;for(let i=0;i<4;i++){const t=mesh(G.tire,MAT.tire,x+wR(-.3,.3),.12+i*.22,z+wR(-.3,.3),1.3,1.3,1.3);t.rotation.x=Math.PI/2;}circles.push({x,z,r:.6});}
 {const bx=-46,bz=-28;if(freeSpot(bx,bz,2.5)){const b=solidBox(bx,bz,2.6,8,2.6,MAT.rust2,.3);mesh(G.box,MAT.snow,bx,3,bz,2.5,.12,7.9,null,false);for(let i=-3;i<=3;i++){mesh(G.box,MAT.glass,bx+1.31,2.1,bz+i*1.05,.04,.7,.8,null,false);mesh(G.box,MAT.glass,bx-1.31,2.1,bz+i*1.05,.04,.7,.8,null,false);}
   for(const oz of [-2.8,2.8])for(const ox of [-1.2,1.2]){const w=mesh(G.wheel,MAT.tire,bx+ox,.36,bz+oz,1,1,1);w.rotation.z=Math.PI/2;}}}
 // trails: worn paths from the road to POIs (decals, non-blocking)
 const trail=(x0,z0,x1,z1)=>{const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/2.2);for(let i=0;i<n;i++){const k=(i+.5)/n,x=x0+(x1-x0)*k+wR(-.4,.4),z=z0+(z1-z0)*k+wR(-.4,.4);const m=mesh(G.box,MAT.trail,x,.016,z,wR(1.3,1.8),.01,wR(1.8,2.4),null,false);m.rotation.y=Math.atan2(x1-x0,z1-z0)+wR(-.2,.2);m.receiveShadow=true;}};
 trail(-3.5,8,-30,30);trail(3.5,-12,46,-24);trail(-3.5,-30,-46,-28);trail(3.5,20,22,38);
 // wooden signposts at the crossroads
 for(const [x,z,ry] of [[5,-20,.3],[-5,6,-.4]]){if(!freeSpot(x,z,.3))continue;const p=mesh(G.box,MAT.wood,x,1.1,z,.1,2.2,.1);solids.push(p);circles.push({x,z,r:.12});const s1=mesh(G.box,MAT.sign,x+.3,1.8,z,.9,.22,.05);s1.rotation.y=ry;const s2=mesh(G.box,MAT.sign,x-.25,1.45,z,.8,.2,.05);s2.rotation.y=-ry*2;}
 // clumps of bushes along the forest, the village edge and the farm — own seed, so the rest of the map stays put
 {let cs=9151;const cr=()=>{cs=(cs*16807)%2147483647;return cs/2147483647;},cR=(a,b)=>a+(b-a)*cr();
  const clumps=[[-16,36,14,8],[8,40,10,6],[-6,-46,18,6],[20,-42,8,6],[-40,16,8,6],[30,6,6,8]];
  for(const [cx,cz,rx,rz] of clumps)for(let i=0;i<8;i++){const x=cx+cR(-rx,rx),z=cz+cR(-rz,rz);if(Math.abs(x)<6.5)continue;if(!freeSpot(x,z,1.3))continue;
    let inH=false;for(const h of HOUSE_RECTS)if(Math.abs(x-h[0])<h[2]+1.4&&Math.abs(z-h[1])<h[3]+1.4)inH=true;if(inH)continue;
    const s=cR(.5,.95),m=mesh(ico,MAT.bush,x,s*.42,z,s,s*.6,s);m.rotation.y=cr()*6;const sn=mesh(ico,MAT.snow,x,s*.68,z,s*.55,s*.2,s*.55,null,false);sn.rotation.y=m.rotation.y;}}
 // abandoned city past the old fence. Streets first, then blocks that face them. Own meshes, no global Math.random, so the old town stays put.
 {const CITY={plots:[],roads:[]};window.CITY4319=CITY;const wins=[];
  const face=(mat,x,y,z,w,h,d)=>{const m=mesh(G.box,mat,x,y,z,w,h,d);m.castShadow=false;return m;};
  MAT.hosp=new T.MeshLambertMaterial({map:TXR22.plaster,color:0xffffff});MAT.awnG=new T.MeshLambertMaterial({color:0x2c6b45});MAT.awnY=new T.MeshLambertMaterial({color:0xc4a15a});MAT.awnB=new T.MeshLambertMaterial({color:0x3a4e78});MAT.crossB=new T.MeshBasicMaterial({color:0xe10600});
  MAT.leaf=new T.MeshLambertMaterial({color:0x2e5234,flatShading:true});MAT.leaf2=new T.MeshLambertMaterial({color:0x6a7040,flatShading:true});MAT.bulb=new T.MeshBasicMaterial({color:0xffd590});
  MAT.bloodM=new T.MeshLambertMaterial({map:bloodTex,transparent:true,depthWrite:false,opacity:.9});
  function abandon(x,z,w,d,h,door,kind){let s=((Math.imul((x*10)|0,374761393)^Math.imul((z*10)|0,668265263))>>>0)||1;const r=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};const v=(r()*6)|0;const nz=door==='n'?-1:door==='s'?1:0,nx=door==='e'?1:door==='w'?-1:0;const fx=nx?x+nx*(w/2+.05):x+(r()-.5)*w*.4,fz=nz?z+nz*(d/2+.05):z+(r()-.5)*d*.4;
    if(v===0)face(MAT.dark,fx,h*.42,fz,nx?.06:w*.34,h*.32,nz?.06:d*.3);
    else if(v===1){face(MAT.wood,fx,1.22,fz,nx?.07:.9,.1,nz?.07:.12);face(MAT.wood,fx,1.38,fz,nx?.07:.12,.62,nz?.07:.12);}
    else if(v===2)face(MAT.rust2,x+(r()-.5)*w*.25,h+.1,z,.6,.08,.42);
    else if(v===3)face(MAT.leaf,x-w*.4,.75,z,.5,.95,.42);
    else if(v===4)face(MAT.crate,x+w*.12,.28,z+d*.15,.48,.48,.48);
    else face(MAT.stoneW,x,.24,z,.5,.4,d*.28);
    if(kind==='flat'||kind==='shop')face(MAT.dark,x,h*.55,z-(d/2+.02),w*.22,.16,.04);}
  function shell(x,z,w,d,h,door,mat,kind){kind=kind||'house';const t=.26,gap=1.7,y=h/2;
    const jamb=(horiz,sign)=>{if(horiz){face(mat,x+sign*(w/4+gap/4),y,z+(door==='s'?d/2:-d/2),w/2-gap/2,h,t);}else{face(mat,x+(door==='e'?w/2:-w/2),y,z+sign*(d/4+gap/4),t,h,d/2-gap/2);}};
    if(door==='n'||door==='s'){jamb(true,-1);jamb(true,1);face(mat,x,h-.28,z+(door==='s'?d/2:-d/2),gap,.55,t);}else face(mat,x,y,z-d/2,w,h,t);
    if(door!=='n'&&door!=='s')face(mat,x,y,z+d/2,w,h,t);else if(door==='n')face(mat,x,y,z+d/2,w,h,t);else face(mat,x,y,z-d/2,w,h,t);
    if(door==='w'||door==='e'){jamb(false,-1);jamb(false,1);face(mat,x+(door==='e'?w/2:-w/2),h-.28,z,t,.55,gap);face(mat,x+(door==='e'?-w/2:w/2),y,z,t,h,d);}else{face(mat,x-w/2,y,z,t,h,d);face(mat,x+w/2,y,z,t,h,d);}
    const gable=(ang)=>{const ns=door==='n'||door==='s',span=ns?d:w,half=span/2/Math.cos(ang)+.2,rise=Math.tan(ang)*(span/4);
      if(ns){const a=face(MAT.roof,x,h+rise,z-span/4,w+.4,.11,half),b=face(MAT.roof,x,h+rise,z+span/4,w+.4,.11,half);a.rotation.x=-ang;b.rotation.x=ang;face(MAT.snow,x,h+rise*1.85,z,w*.55,.05,.35);}
      else{const a=face(MAT.roof,x-span/4,h+rise,z,half,.11,d+.4),b=face(MAT.roof,x+span/4,h+rise,z,half,.11,d+.4);a.rotation.z=ang;b.rotation.z=-ang;face(MAT.snow,x,h+rise*1.85,z,.35,.05,d*.55);}
      return h+rise*2;};
    if(kind==='house'){const peak=gable(.55);face(mat,x+w*.22,peak+.28,z,.28,.62,.28);}
    else if(kind==='ruin'){face(MAT.roof,x-w*.12,h-.02,z-d*.06,w*.58,.12,d*.5);face(MAT.stoneW,x+w*.16,.32,z,.5,.55,.65);face(MAT.wood,x-w*.04,h*.32,z-d*.08,.12,.75,.12);}
    else if(kind==='flat'){face(MAT.roof,x,h+.08,z,w+.25,.12,d+.25);face(MAT.stoneW,x,h+.28,z-d/2,w+.15,.22,.12);face(MAT.stoneW,x,h+.28,z+d/2,w+.15,.22,.12);face(MAT.stoneW,x-w/2,h+.28,z,.12,.22,d);face(MAT.stoneW,x+w/2,h+.28,z,.12,.22,d);}
    else if(kind==='shop'){face(MAT.roof,x,h+.06,z,w+.2,.1,d+.2);const col=[MAT.redPaint,MAT.awnY,MAT.awnG,MAT.awnB][((x*3+z)|0)%4],aw=1.15,sy=h-.3,ay=Math.max(2.25,h-.4);
      if(door==='e'){face(col,x+w/2+aw*.42,ay,z,aw,.06,Math.min(d*.7,3.1));face(MAT.sign,x+w/2+.05,sy,z+1.15,.06,.32,1.15);}
      else if(door==='w'){face(col,x-w/2-aw*.42,ay,z,aw,.06,Math.min(d*.7,3.1));face(MAT.sign,x-w/2-.05,sy,z+1.15,.06,.32,1.15);}
      else if(door==='n'){face(col,x,ay,z-d/2-aw*.42,Math.min(w*.7,3.1),.06,aw);face(MAT.sign,x+1.15,sy,z-d/2-.05,1.15,.32,.06);}
      else{face(col,x,ay,z+d/2+aw*.42,Math.min(w*.7,3.1),.06,aw);face(MAT.sign,x+1.15,sy,z+d/2+.05,1.15,.32,.06);}}
    else if(kind==='hosp'){face(MAT.snow,x,h+.1,z,w+.45,.16,d+.45);
      face(MAT.snow,x,h+.28,z-d/2,w+.1,.2,.12);face(MAT.snow,x,h+.28,z+d/2,w+.1,.2,.12);face(MAT.snow,x-w/2,h+.28,z,.12,.2,d);face(MAT.snow,x+w/2,h+.28,z,.12,.2,d);
      face(MAT.snow,x-w*.28,2.35,z+d/2+.04,w*.42,.12,.05);face(MAT.snow,x+w*.28,2.35,z+d/2+.04,w*.42,.12,.05);face(MAT.snow,x,2.55,z-d/2-.04,w*.7,.12,.05);
      const fz=z+d/2+.08;face(MAT.crossB,x-2.7,2.5,fz,.36,1.85,.1);face(MAT.crossB,x-2.7,2.5,fz,1.55,.32,.1);
      face(MAT.crossB,x,h+.95,z,.36,1.7,.36);face(MAT.crossB,x,h+.95,z,1.55,.32,.36);}
    else if(kind==='ware'){gable(.38);face(MAT.rust2,x,h+Math.tan(.38)*(d/2)+.08,z,.55,.12,d*.22);}
    else if(kind==='station'){face(MAT.roof,x,h+.08,z,w+.25,.12,d+.25);face(MAT.metal,x+w/2+.95,h*.62,z,1.7,.07,Math.min(d*.8,7.2));face(MAT.metal,x+w/2+1.7,h*.3,z-2.2,.07,h*.58,.07);face(MAT.metal,x+w/2+1.7,h*.3,z+2.2,.07,h*.58,.07);face(MAT.sign,x+w/2+.04,h-.35,z+2.4,.05,.4,1.6);}
    else if(kind==='school'){face(MAT.roof,x,h+.06,z,w+.35,.12,d+.35);face(MAT.stoneW,x,h+.2,z,w*.96,.14,d*.96);const cup=mesh(ico,MAT.hosp,x,h+.72,z,1.35,.7,1.35);cup.castShadow=false;face(MAT.metal,x-4.2,h+1.15,z,.08,1.15,.08);face(MAT.crossB,x-4.55,h+1.55,z,.08,.48,.9);}
    else{face(MAT.roof,x,h+.08,z,w+.2,.1,d+.2);face(MAT.sign,x+(door==='e'?w/2+.05:-w/2-.05),h*.7,z,.05,.36,Math.min(d*.7,2.4));}
    const win=(px,py,pz,sx,sy,sz)=>wins.push([px,py,pz,sx,sy,sz]);
    if(kind==='shop'){const s=door==='e'?1:door==='w'?-1:0;if(s){win(x+s*(w/2+.04),1.2,z+1.55,.07,1.15,1.2);win(x,1.45,z-d/2-.02,.6,.5,.04);win(x,1.45,z+d/2+.02,.6,.5,.04);}
      else{const q=door==='n'?-1:1;win(x+1.55,1.2,z+q*(d/2+.04),1.2,1.15,.07);win(x-w/2-.02,1.45,z,.04,.5,.6);win(x+w/2+.02,1.45,z,.04,.5,.6);}}
    else if(kind==='hosp'){for(const s of [-1,1]){win(x+s*2.3,2.15,z-d/2-.03,.7,.65,.05);win(x-w/2-.03,2.15,z+s*1.6,.05,.65,.55);win(x+w/2+.03,2.15,z+s*1.6,.05,.65,.55);}win(x+2.6,2.2,z+d/2+.03,.7,.6,.05);win(x-2.6,2.2,z+d/2+.03,.7,.6,.05);}
    else if(kind==='ware'){for(const s of [-1,1]){win(x+s*w*.22,h*.78,z-d/2-.02,1.15,.22,.04);win(x+s*w*.22,h*.78,z+d/2+.02,1.15,.22,.04);}}
    else if(kind==='school'){for(const i of [-2,-1,1,2]){win(x+i*w*.14,1.55,z-d/2-.02,.5,.7,.04);win(x+i*w*.14,2.45,z-d/2-.02,.5,.45,.04);win(x+i*w*.14,1.55,z+d/2+.02,.5,.7,.04);}}
    else if(kind==='flat'){for(const s of [-1,1]){win(x+s*w*.22,1.15,z-d/2-.02,.48,.48,.04);win(x+s*w*.22,2.15,z-d/2-.02,.48,.48,.04);win(x+s*w*.22,1.15,z+d/2+.02,.48,.48,.04);win(x+s*w*.22,2.15,z+d/2+.02,.48,.48,.04);}}
    else if(kind==='station'){for(const i of [-2,-1,1,2])win(x+w/2+.03,1.65,z+i*1.7,.04,.65,.6);win(x-w/2-.03,1.6,z,.04,.7,1.1);}
    else if(kind==='house'){for(const s of [-1,1]){win(x+s*w*.28,1.3,z-d/2-.02,.48,.58,.04);win(x+s*w*.24,1.35,z+d/2+.02,.42,.52,.04);}win(x-w/2-.02,1.4,z,.04,.5,.45);win(x+w/2+.02,1.45,z,.04,.46,.42);}
    else{win(x+(door==='e'?w/2+.03:-w/2-.03),1.3,z+1.35,.04,.55,.55);}
    const th=.32;
    const wbox=(ax,az,bx,bz)=>{if(bx<ax){const q=ax;ax=bx;bx=q;}if(bz<az){const q=az;az=bz;bz=q;}boxes.push({x0:ax,x1:bx,z0:az,z1:bz});};
    if(door==='n'||door==='s'){const zd=door==='n'?z-d/2:z+d/2;wbox(x-w/2,zd-th/2,x-gap/2,zd+th/2);wbox(x+gap/2,zd-th/2,x+w/2,zd+th/2);const zo=door==='n'?z+d/2:z-d/2;wbox(x-w/2,zo-th/2,x+w/2,zo+th/2);wbox(x-w/2-th/2,z-d/2,x-w/2+th/2,z+d/2);wbox(x+w/2-th/2,z-d/2,x+w/2+th/2,z+d/2);}
    else{const xd=door==='w'?x-w/2:x+w/2;wbox(xd-th/2,z-d/2,xd+th/2,z-gap/2);wbox(xd-th/2,z+gap/2,xd+th/2,z+d/2);const xo=door==='w'?x+w/2:x-w/2;wbox(xo-th/2,z-d/2,xo+th/2,z+d/2);wbox(x-w/2,z-d/2-th/2,x+w/2,z-d/2+th/2);wbox(x-w/2,z+d/2-th/2,x+w/2,z+d/2+th/2);}
    abandon(x,z,w,d,h,door,kind);HOUSE_RECTS.push([x,z,w/2+.4,d/2+.4]);CITY.plots.push({x,z,w,d,kind});}
  function roadStrip(x,z,len,horiz){const m=new T.Mesh(new T.PlaneGeometry(horiz?len:7.2,horiz?7.2:len),road.material);m.rotation.x=-Math.PI/2;m.position.set(x,.018,z);m.receiveShadow=true;scene.add(m);
    CITY.roads.push(horiz?[x-len/2,z,x+len/2,z]:[x,z-len/2,x,z+len/2]);}
  roadStrip(0,-74,70,true);
  roadStrip(70,-4,80,false);[-16,0,16,32].forEach((z,i)=>{shell(59,z,[6.2,5.4,7.4,6.0][i],5.2,[2.6,3.9,2.4,4.5][i],'e',i%2?MAT.plank:MAT.brick,['shop','flat','ruin','shop'][i]);});
  shell(70,-50,12,8,4.6,'s',MAT.hosp,'hosp');
  roadStrip(6,70,64,true);shell(-26,81,14,7,3.6,'n',MAT.rust2,'ware');shell(20,80,8,5,3.0,'n',MAT.plank,'ware');shell(48,79,10,6,3.4,'n',MAT.rust2,'ware');
  roadStrip(-76,-4,46,false);shell(-87,-4,6.4,12,3.5,'e',MAT.brick,'station');shell(-87,-28,5.6,4.2,2.6,'e',MAT.plank,'booth');
  for(const z of [-16,-4,8]){face(MAT.rust2,-66,1.25,z,2.3,2.2,7);face(MAT.dark,-66,2.45,z,2,.45,5.6);boxes.push({x0:-67.2,x1:-64.8,z0:z-3.5,z1:z+3.5});}
  circles.push({x:-2.05,z:-58,r:1.15});circles.push({x:2.05,z:-58,r:1.15});
  // one west street from the station up to the houses, with a school and two blocks facing it
  roadStrip(-55,-74,42,true);roadStrip(-76,-50,48,false);
  shell(-60,-63.5,14,9,4.1,'w',MAT.brick,'school');shell(-87,-58,8,6.2,4.3,'e',MAT.brick,'flat');shell(-87,-46,8,6.2,3.7,'e',MAT.plank,'flat');
  // the market street keeps going south, into two garages
  roadStrip(70,58,44,false);shell(58,64,9,6.4,3.3,'e',MAT.rust2,'ware');shell(82,70,10,7,3.5,'w',MAT.plank,'ware');
  const walk=(x,z,len,horiz)=>{const m=new T.Mesh(new T.PlaneGeometry(horiz?len:1.45,horiz?1.45:len),MAT.walk);m.rotation.x=-Math.PI/2;m.position.set(x,.021,z);m.receiveShadow=true;m.castShadow=false;scene.add(m);};
  walk(0,-70.55,70,true);walk(0,-77.45,70,true);walk(-55,-70.55,42,true);walk(-55,-77.45,42,true);
  walk(65.15,-4,80,false);walk(74.85,-4,80,false);walk(65.15,58,44,false);walk(74.85,58,44,false);
  walk(-80.6,-50,48,false);walk(-71.3,-50,48,false);walk(-80.6,-4,46,false);walk(-71.3,-4,46,false);
  walk(6,65.3,64,true);walk(6,74.8,64,true);
  face(MAT.rust2,60,1.15,56,8.2,2.2,2.2);face(MAT.dark,60,1.55,56,7.4,.55,2.05);face(MAT.redPaint,60,1.15,54.9,.15,.5,2.1);boxes.push({x0:55.9,x1:64.1,z0:54.9,z1:57.1});
  for(const [wx,wz] of [[57.1,55.1],[57.1,56.9],[62.9,55.1],[62.9,56.9]]){const wh=mesh(G.wheel,MAT.tire,wx,.3,wz,.95,.95,.95,null,false);wh.rotation.x=Math.PI/2;wh.castShadow=false;}
  face(MAT.redPaint,79,.75,-50,2.2,1.35,4.6);face(MAT.dark,79,1.15,-50.2,2.05,.55,1.5);face(MAT.snow,79,1.46,-50,2.1,.06,4.4);face(MAT.crossB,79,1.15,-47.35,.7,.7,.06);boxes.push({x0:77.85,x1:80.15,z0:-52.35,z1:-47.65});
  for(const [wx,wz] of [[78.05,-51.3],[79.95,-51.3],[78.05,-48.7],[79.95,-48.7]]){const wh=mesh(G.wheel,MAT.tire,wx,.28,wz,.8,.8,.8,null,false);wh.rotation.z=Math.PI/2;wh.castShadow=false;}
  const sign=(x,z)=>{face(MAT.wood,x,1.05,z,.1,2.1,.1);face(MAT.sign,x,1.85,z,1.15,.32,.06);circles.push({x,z,r:.12});};
  sign(8,-70.55);sign(65.15,6);sign(-71.3,-40);sign(14,65.3);
  face(MAT.wood,-60,.42,-69.4,1.3,.1,.38);face(MAT.wood,-60,.2,-69.24,.08,.4,.08);face(MAT.wood,-60,.2,-69.56,.08,.4,.08);
  face(MAT.wood,-52,.42,-69.4,1.3,.1,.38);face(MAT.wood,-52,.2,-69.24,.08,.4,.08);face(MAT.wood,-52,.2,-69.56,.08,.4,.08);
  const crateAt=(x,z)=>{face(MAT.crate,x,.55,z,1.05,1.05,1.05);boxes.push({x0:x-.52,x1:x+.52,z0:z-.52,z1:z+.52});};
  crateAt(-17,-69.55);crateAt(0,-69.55);crateAt(17,-69.55);crateAt(0,-86.3);crateAt(17,-86.3);crateAt(63.2,8);crateAt(63.2,-8);
  for(let i=-2;i<=2;i++){face(MAT.snow,i*1.15,.03,-71.2,.28,.02,2.1);face(MAT.snow,70+i*1.15,.03,-24,.28,.02,2.1);face(MAT.snow,-76,.03,-71.2+i*.7,2.1,.02,.26);}
  CITY.tags=[['Case',0,-90],['Scuola',-60,-54],['Mercato',86,8],['Ospedale',86,-58],['Deposito',-16,86],['Stazione',-90,8]];
  {let fs=43181;const fr=()=>{fs=(fs*16807)%2147483647;return fs/2147483647;};const N=36,im=new T.InstancedMesh(G.pine,MAT.pine,N),o=new T.Object3D();
    im.castShadow=false;im.receiveShadow=false;im.frustumCulled=false;im.userData.scenicPine=1;
    for(let i=0;i<N;i++){const a=fr()*Math.PI*2,r=102+fr()*12;o.position.set(Math.cos(a)*r,0,Math.sin(a)*r);o.rotation.set(0,fr()*6,0);const s=.85+fr()*.6;o.scale.set(s,1.2+fr()*.8,s);o.updateMatrix();im.setMatrixAt(i,o.matrix);}scene.add(im);}
  const iw=new T.InstancedMesh(G.box,MAT.dark,Math.max(1,wins.length));iw.castShadow=false;iw.receiveShadow=false;iw.frustumCulled=false;const ow=new T.Object3D();
  if(!wins.length){ow.scale.set(0,0,0);ow.updateMatrix();iw.setMatrixAt(0,ow.matrix);}else wins.forEach((w,i)=>{ow.position.set(w[0],w[1],w[2]);ow.rotation.set(0,0,0);ow.scale.set(w[3],w[4],w[5]);ow.updateMatrix();iw.setMatrixAt(i,ow.matrix);});scene.add(iw);CITY.winMesh=iw;CITY.wins=wins;
  const parked=[[-18,64,Math.PI/2,0],[-10,64,Math.PI/2,1],[-2,64,Math.PI/2,2],[8,64,Math.PI/2,0],[16,64,Math.PI/2,3],[30,64,Math.PI/2,1],[40,64,Math.PI/2,2],[65,-8,0,1],[65,8,0,2],[65,24,0,0],[75.9,-8,0,3],[75.9,10,Math.PI,1],[75.9,26,0,2],[-68,6,0,0],[-68,-18,0,3],[0,-90,Math.PI/2,1],[14,-90,Math.PI/2,2],[89,8,0,0]];
  const carCols=[MAT.rust,MAT.redPaint,MAT.awnB,MAT.rust2];
  const parkedCar=(x,z,rot,mat)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
    const p=(geo,m,px,py,pz,sx,sy,sz)=>{const o=mesh(geo,m,px,py,pz,sx,sy,sz,g,false);o.castShadow=false;o.userData.dyn=1;return o;};
    p(G.box,mat,0,.34,0,1.55,.32,3.55);const hood=p(G.box,mat,0,.58,-1.22,1.48,.1,1.2);hood.rotation.x=.28;
    p(G.box,MAT.dark,0,.78,.42,1.38,.42,1.55);const win=p(G.box,MAT.glass,0,.86,-.32,1.4,.32,.08);win.rotation.x=-.55;
    p(G.box,MAT.glass,0,.84,.42,1.42,.22,1.15);p(G.box,MAT.metal,0,.28,-1.78,1.35,.1,.08);p(G.box,MAT.redPaint,0,.42,-1.72,.28,.1,.06);
    for(const [wx,wz] of [[-.72,-1.15],[.72,-1.15],[-.72,1.15],[.72,1.15]]){const wh=p(G.wheel,MAT.tire,wx,.26,wz,1,1,1);wh.rotation.z=Math.PI/2;}
    g.userData.sc=[1.12,.98,1.32];(window.__cars23=window.__cars23||[]).push(g);};
  parked.forEach(c=>parkedCar(c[0],c[1],c[2],carCols[c[3]]));
  const poles=[[-18,-77.45],[6,-70.55],[28,-77.45],[-40,-77.45],[65.15,-28],[65.15,20],[74.85,-8],[74.85,48],[-80.6,-62],[-71.3,-36],[-80.6,8],[-71.3,-16],[-12,65.3],[28,74.8],[48,65.3],[79,-42]];
  const ip=new T.InstancedMesh(G.cyl,MAT.metal,poles.length),op=new T.Object3D();ip.castShadow=false;ip.receiveShadow=false;ip.frustumCulled=false;
  poles.forEach((c,i)=>{op.position.set(c[0],1.7,c[1]);op.rotation.set(0,0,0);op.scale.set(.1,3.4,.1);op.updateMatrix();ip.setMatrixAt(i,op.matrix);});scene.add(ip);
  const bags=[[-17,-70.55],[-3,-77.45],[17,-70.55],[32,-77.45],[65.15,-30],[74.85,-14],[65.15,24],[74.85,30],[-80.6,-44],[-71.3,-56],[-14,65.3],[30,74.8],[-72.2,10],[-79.6,-18]];
  const ib=new T.InstancedMesh(G.box,MAT.rust,bags.length);ib.castShadow=false;ib.receiveShadow=false;ib.frustumCulled=false;
  bags.forEach((c,i)=>{op.position.set(c[0],.22,c[1]);op.rotation.set(0,i*.4,.2);op.scale.set(.55,.32,.4);op.updateMatrix();ib.setMatrixAt(i,op.matrix);});scene.add(ib);
  const bulbs=new T.InstancedMesh(G.box,MAT.bulb,poles.length);bulbs.castShadow=false;bulbs.frustumCulled=false;
  poles.forEach((c,i)=>{op.position.set(c[0],3.42,c[1]);op.rotation.set(0,0,0);op.scale.set(.32,.16,.32);op.updateMatrix();bulbs.setMatrixAt(i,op.matrix);});scene.add(bulbs);
  window.__poles23={mesh:ip,bulbs,poles};
  const stalls=[[54.2,-8,MAT.redPaint],[54.2,8,MAT.awnY],[54.2,24,MAT.awnG],[86.2,-8,MAT.awnB],[86.2,8,MAT.awnY],[86.2,24,MAT.redPaint]];
  for(const [sx,sz,col] of stalls){face(MAT.plank,sx,.48,sz,1.5,.08,.9);face(MAT.wood,sx,.24,sz-.35,.08,.48,.08);face(MAT.wood,sx,.24,sz+.35,.08,.48,.08);face(col,sx,1.15,sz,1.55,.05,.95);face(MAT.crate,sx,.72,sz,.45,.35,.4);}
  face(MAT.rust2,54.2,.28,-24,.7,.5,1.3);face(MAT.rust2,86.4,.32,40,1.4,.4,.7);face(MAT.wood,86.4,.55,40,.08,.5,.08);
  const blood=[[2,-74,1.4,.9],[70,-12,1.1,1.6],[70,14,.8,1.2],[-76,2,1.3,.7],[8,70,1.6,.8],[0,-40,1,.7],[-60,-71,.9,1.3],[20,60,1.2,.6],[70,-36,.7,1.1],[-4,8,1.5,.5],[-24,-70,1.2,.6],[24,-78,.8,1.1],[59,-4,1,.8],[81,20,.9,.7],[-87,-8,1.3,.5],[48,76,.7,1.2]];
  const ibl=new T.InstancedMesh(G.box,MAT.bloodM,blood.length);ibl.castShadow=false;ibl.receiveShadow=false;ibl.frustumCulled=false;
  blood.forEach((c,i)=>{op.position.set(c[0],.03,c[1]);op.rotation.set(-Math.PI/2,0,i*.4);op.scale.set(c[2],c[3],.02);op.updateMatrix();ibl.setMatrixAt(i,op.matrix);});scene.add(ibl);
  {let s=43361;const fr=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
    const spot=()=>{for(let n=0;n<48;n++){const x=fr()*150-75,z=fr()*150-75;if(Math.hypot(x,z)<14)continue;let bad=false;for(const h of HOUSE_RECTS)if(Math.abs(x-h[0])<h[2]+1.3&&Math.abs(z-h[1])<h[3]+1.3){bad=true;break;}if(bad)continue;for(const b of boxes)if(x>b.x0-.8&&x<b.x1+.8&&z>b.z0-.8&&z<b.z1+.8){bad=true;break;}if(!bad)return [x,z,fr()*6];}return null;};
    const bodies=[],bones=[];for(let i=0;i<16;i++){const q=spot();if(q)bodies.push(q);}for(let i=0;i<24;i++){const q=spot();if(q)bones.push(q);}
    const mb=new T.MeshLambertMaterial({color:0x3c2e2a}),bo=new T.MeshLambertMaterial({color:0xd9d3c4});
    const ib=new T.InstancedMesh(G.box,mb,Math.max(1,bodies.length)),ik=new T.InstancedMesh(G.box,bo,Math.max(1,bones.length));
    ib.castShadow=ik.castShadow=false;ib.receiveShadow=ik.receiveShadow=false;ib.frustumCulled=ik.frustumCulled=false;
    const put=(mesh,list,sc)=>{if(!list.length){op.scale.set(0,0,0);op.updateMatrix();mesh.setMatrixAt(0,op.matrix);return;}list.forEach((c,i)=>{op.position.set(c[0],sc[1]*.5,c[1]);op.rotation.set(0,c[2],0);op.scale.set(sc[0],sc[1],sc[2]);op.updateMatrix();mesh.setMatrixAt(i,op.matrix);});};
    put(ib,bodies,[1.55,.16,.42]);put(ik,bones,[.5,.05,.07]);scene.add(ib);scene.add(ik);
    const extra=[];bodies.forEach(c=>{extra.push([c[0]+.3,.04,c[1],.7,.45]);});
    if(extra.length){const ix=new T.InstancedMesh(G.box,MAT.bloodM,extra.length);ix.castShadow=false;ix.receiveShadow=false;extra.forEach((c,i)=>{op.position.set(c[0],c[1],c[2]);op.rotation.set(-Math.PI/2,0,c[0]);op.scale.set(c[3],c[4],.02);op.updateMatrix();ix.setMatrixAt(i,op.matrix);});scene.add(ix);}}
  const bushAt=[[-21.2,-69.6],[ -12.6,-80.4],[13.4,-69.6],[21,-80.2],[63.2,-8],[63.2,24],[76.6,-8],[76.6,24],[-64,-56],[-52,-66],[56,70],[48,86],[-18,86],[-90,6],[-90,-20],[88,-58],[88,18],[40,-90],[-46,-90]];
  const ibu=new T.InstancedMesh(ico,MAT.bush,bushAt.length),ibu2=new T.InstancedMesh(ico,MAT.snow,bushAt.length);ibu.castShadow=ibu2.castShadow=false;ibu.frustumCulled=ibu2.frustumCulled=false;
  bushAt.forEach((c,i)=>{const s=.55+(i%5)*.08;op.position.set(c[0],s*.4,c[1]);op.rotation.set(0,i*.7,0);op.scale.set(s,s*.65,s);op.updateMatrix();ibu.setMatrixAt(i,op.matrix);op.position.y=s*.72;op.scale.set(s*.6,s*.22,s*.6);op.updateMatrix();ibu2.setMatrixAt(i,op.matrix);});scene.add(ibu,ibu2);
  const trees=[[48,-90],[-48,-90],[90,-62],[90,42],[-94,22],[28,92],[-52,90],[94,56]];
  const itree=new T.InstancedMesh(ico,MAT.leaf,trees.length),itr2=new T.InstancedMesh(G.trunk,MAT.dead,trees.length);itree.castShadow=itr2.castShadow=false;itree.frustumCulled=itr2.frustumCulled=false;
  trees.forEach((c,i)=>{op.position.set(c[0],1.7,c[1]);op.rotation.set(0,i,0);const s=1.25+(i%3)*.25;op.scale.set(s,1.45,s);op.updateMatrix();itree.setMatrixAt(i,op.matrix);op.position.y=.7;op.scale.set(.28,1.5,.28);op.updateMatrix();itr2.setMatrixAt(i,op.matrix);circles.push({x:c[0],z:c[1],r:.34});});scene.add(itree,itr2);
  {let fs=43201;const fr=()=>{fs=(fs*16807)%2147483647;return fs/2147483647;};const N=18,im=new T.InstancedMesh(ico,MAT.leaf2,N),o=new T.Object3D();im.castShadow=false;im.frustumCulled=false;
    for(let i=0;i<N;i++){const a=fr()*Math.PI*2,r=100+fr()*10;o.position.set(Math.cos(a)*r,1.1,Math.sin(a)*r);o.rotation.set(0,fr()*6,0);const s=.9+fr()*.7;o.scale.set(s,s*.8,s);o.updateMatrix();im.setMatrixAt(i,o.matrix);}scene.add(im);}
  const smokes=[];const puff=(x,y,z,sc)=>{const sp=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xb7bcc4,transparent:true,opacity:.26,depthWrite:false}));sp.position.set(x,y,z);sp.scale.set(sc,sc*.75,1);sp.userData.y0=y;scene.add(sp);smokes.push(sp);};
  puff(70,5.4,-50,2.4);puff(-26,4.4,81,2.8);puff(18,2.8,63.1,1.7);puff(48,4.2,79,2.1);window.SMOKE20=smokes;
  {let s=43411;const fr=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};const N=28,ip=new T.InstancedMesh(G.box,MAT.wood,N),ir=new T.InstancedMesh(G.box,MAT.rust2,18);ip.castShadow=ir.castShadow=false;ip.frustumCulled=ir.frustumCulled=false;
    for(let i=0;i<N;i++){const a=fr()*6.2,rad=26+fr()*64,x=Math.cos(a)*rad,z=Math.sin(a)*rad;op.position.set(x,.08,z);op.rotation.set(fr()*.4,fr()*6,fr()*.5);op.scale.set(.15,.08,.7+fr()*.5);op.updateMatrix();ip.setMatrixAt(i,op.matrix);}
    for(let i=0;i<18;i++){op.position.set((fr()-.5)*150,(fr()<.5)?.12:.28,(fr()-.5)*150);op.rotation.set(0,fr()*6,fr()*.3);op.scale.set(.35+fr()*.3,.12,.22);op.updateMatrix();ir.setMatrixAt(i,op.matrix);}scene.add(ip,ir);}}
}

const MERGED=mergeStatics();
if(NEXT_CITY){
  // Remove the entire old environment before actors/loot are created.
  // Retain harvest instance meshes so their gameplay hooks still work.
  const keep=new Set([ground,...Object.values(NIM)]);
  for(const o of scene.children.slice())if(!OLD_CITY_BASE.has(o)&&!keep.has(o))scene.remove(o);
  boxes.length=0;HOUSE_RECTS.length=0;
  for(let i=circles.length-1;i>=0;i--)if(!circles[i].node)circles.splice(i,1);
  solids.length=0;solids.push(ground,...Object.values(NIM));
  lamps.length=0;window.__cars23=[];window.__lamps23=[];window.SMOKE20=[];window.__poles23=null;
  const city=window.buildCityV2(T,{scene,ground,boxes,circles,solids,houses:HOUSE_RECTS,assetBase:'assets/cc0/',anisotropy:ani432(),quality:(()=>{try{const u=new URLSearchParams(location.search).get('gfx');if(u)return u;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/zc_gfx$/.test(k||'')){const v=JSON.parse(localStorage.getItem(k)||'null');if(v&&v.q)return v.q;}}}catch(e){}return 'media';})()});
  window.CITY4319=city;
  // Stable new resource positions; the preview uses a separate save namespace.
  let ns=192837;const nr=()=>{ns=(Math.imul(ns,1664525)+1013904223)>>>0;return ns/4294967296;};
  for(const n of NODES){let found=false;for(let tries=0;tries<3000;tries++){
    const side=nr()<.5?-1:1,x=side*(147+nr()*16),z=-135+nr()*275;
    if(Math.hypot(x+122,z-75)<16||city.roads.some(r=>r[1]===r[3]?Math.abs(z-r[1])<7:Math.abs(x-r[0])<7))continue;
    if(boxes.some(b=>x>b.x0-2&&x<b.x1+2&&z>b.z0-2&&z<b.z1+2))continue;
    if(NODES.some(o=>o!==n&&o.cityV2Placed&&Math.hypot(o.x-x,o.z-z)<3.4))continue;
    n.x=n.circle.x=x;n.z=n.circle.z=z;n.cityV2Placed=true;nodeWrite(n);found=true;break;
  }if(!found){n.alive=false;n.circle.off=true;nodeWrite(n);}}
  for(const im of Object.values(NIM)){im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();}
  camera.far=390;camera.updateProjectionMatrix();sky.scale.setScalar(3);sun.shadow.camera.left=sun.shadow.camera.bottom=-180;sun.shadow.camera.right=sun.shadow.camera.top=180;
}

function collide(p,r){
  for(const b of boxes){const cx=clamp(p.x,b.x0,b.x1),cz=clamp(p.z,b.z0,b.z1);const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
    if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r;}else{const l=p.x-b.x0,rr=b.x1-p.x,u=p.z-b.z0,dd=b.z1-p.z,m=Math.min(l,rr,u,dd);if(m==l)p.x=b.x0-r;else if(m==rr)p.x=b.x1+r;else if(m==u)p.z=b.z0-r;else p.z=b.z1+r;}}}
  for(const c of circles){if(c.off)continue;const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-6){p.x=c.x+dx/d*m;p.z=c.z+dz/d*m;}}
  const L=HALF-.5;p.x=clamp(p.x,-L,L);p.z=clamp(p.z,-L,L);}

