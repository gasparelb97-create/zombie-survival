/* Zombie Survival — game code part 02-weapons (game.html lines 2115-2272 before 4.3.73). Classic script: shares globals with the other js/NN-*.js parts; load order matters. */
'use strict';
// ---------- weapons ----------
const WEAPONS=[
 {id:'knife',name:'Coltello',dmg:28,rate:.46,spread:0,pellets:1,range:2.2,melee:true,sight:'melee'},
 {id:'pistol',name:'Pistola',dmg:22,rate:.3,spread:.0035,hipSpread:.02,pellets:1,range:60,mag:12,reserveGive:36,maxReserve:96,reload:1.2,kick:.7,shake:.3,color:0xffe2a0,cost:{wood:1,metal:2,elec:0},desc:'Danno 22 · mirino a tacche · sale con le monete · +36 colpi',sight:'post',scope:1.28,bl:.008,bmax:.032},
 {id:'shotgun',name:'Fucile a pompa',dmg:9,rate:.9,spread:.045,hipSpread:.09,pellets:9,range:22,mag:6,reserveGive:18,maxReserve:36,reload:1.85,kick:1.45,shake:.85,color:0xffc470,cost:{wood:3,metal:3,elec:0},desc:'9 pallini × 9 · forte da vicino, cade con la distanza · +18 colpi',sight:'ring',scope:1.15,fall:.95,fmin:.2,bl:.02,bmax:.04},
 {id:'laser',name:'Fucile laser',dmg:11,rate:.1,spread:.005,hipSpread:.02,pellets:1,range:70,mag:30,reserveGive:90,maxReserve:180,reload:1.6,kick:.18,shake:.1,color:0x40fff0,auto:true,cost:{wood:0,metal:2,elec:3},desc:'Danno 11 · raffica stabile · mirino olografico · +90 cariche',sight:'holo',scope:1.32,bl:.006,bmax:.028},
];
// ---- v3 shop weapons ----
WEAPONS.push(
 {id:'smg',name:'Vipera SMG',dmg:9,rate:.072,spread:.009,hipSpread:.034,pellets:1,range:42,mag:35,reserveGive:140,maxReserve:280,reload:1.35,kick:.32,shake:.12,color:0xfff0b0,auto:true,shop:true,snd:'smg',rarity:'raro',cost:{wood:1,metal:2,elec:1},desc:'Danno 9 · raffica che si apre · mirino aperto',sight:'holo',scope:1.18,bl:.015,bmax:.075,spark:null},
 {id:'ar',name:'Lupo AR-7',dmg:16,rate:.11,spread:.0035,hipSpread:.016,pellets:1,range:70,mag:30,reserveGive:120,maxReserve:240,reload:1.55,kick:.48,shake:.16,color:0xffe2a0,auto:true,shop:true,snd:'ar',rarity:'epico',cost:{wood:1,metal:3,elec:1},desc:'Danno 16 · ottica rossa · preciso in mira',sight:'holo',scope:1.5,bl:.009,bmax:.042},
 {id:'thunder',name:'Tuono AS-12',dmg:7,rate:.3,spread:.04,hipSpread:.07,pellets:8,range:24,mag:10,reserveGive:30,maxReserve:60,reload:2,kick:1.05,shake:.6,color:0xbfe0ff,auto:true,shop:true,snd:'shotgun',fx:'shotgun',rarity:'epico',cost:{wood:2,metal:3,elec:1},desc:'8 pallini × 7 · anello di mira · cala con la distanza',sight:'ring',scope:1.18,fall:.75,fmin:.26,bl:.016,bmax:.05},
 {id:'plasma',name:'Fenice al plasma',dmg:30,rate:.24,spread:.004,hipSpread:.012,pellets:1,range:75,mag:20,reserveGive:60,maxReserve:120,reload:1.85,kick:.75,shake:.32,color:0xff8a30,auto:true,shop:true,snd:'plasma',fx:'laser',splash:1.6,spark:[0xffd080,0xff8a30,0xffffff],mlColor:0xff7a20,rarity:'leggendario',cost:{wood:0,metal:3,elec:3},desc:'Danno 30 · scoppio contenuto · mirino a tubo',sight:'tube',scope:1.4,bl:.008,bmax:.03});
const W_=w=>w.fx||w.id;
// ---- v4 arsenal ----
WEAPONS.push(
 {id:'revolver',name:'Revolver Magnum',dmg:46,rate:.55,spread:.0025,hipSpread:.016,pellets:1,range:70,mag:6,reserveGive:24,maxReserve:60,reload:2.15,kick:1.25,shake:.55,color:0xffe2a0,snd:'revolver',cost:{wood:1,metal:3,elec:0},desc:'Danno 46 · 6 colpi · mirino pesante · sale con le monete',sight:'iron',scope:1.3,bl:.01,bmax:.028},
 {id:'dbarrel',name:'Doppietta',dmg:8,rate:.32,spread:.06,hipSpread:.11,pellets:12,range:16,mag:2,reserveGive:16,maxReserve:40,reload:1.95,kick:1.75,shake:1.05,color:0xffc470,snd:'dbarrel',fx:'shotgun',cost:{wood:3,metal:2,elec:0},desc:'12 pallini × 8 · solo da vicino · due colpi',sight:'ring',scope:1.12,fall:1.05,fmin:.14,bl:.02,bmax:.045},
 {id:'crossbow',name:'Balestra',dmg:64,rate:.4,spread:0,hipSpread:.007,pellets:1,range:90,mag:1,reserveGive:12,maxReserve:30,reload:1.15,kick:.5,shake:.16,color:0xffffff,kind:'bolt',scope:1.75,snd:'crossbow',cost:{wood:4,metal:1,elec:0},desc:'Dardo 64 · in testa abbatte un normale · mirino a croce',sight:'bolt',bl:.004,bmax:.012,bars:[.85,.12,.95,.05]},
 {id:'sniper',name:'Falco .50',dmg:92,rate:1.15,spread:.0012,hipSpread:.032,pellets:1,range:150,mag:5,reserveGive:20,maxReserve:40,reload:2.4,kick:2.15,shake:.85,color:0xfff4d0,kind:'sniper',scope:3.6,shop:true,snd:'sniper',rarity:'epico',cost:{wood:1,metal:4,elec:1},desc:'Danno 92 · ottica 3.6x · senza mira è impreciso',sight:'optic',bl:.003,bmax:.02,bars:[1,.1,1,.13]},
 {id:'glauncher',name:'Grizzly M32',dmg:74,rate:.7,spread:.005,hipSpread:.018,pellets:1,range:55,mag:6,reserveGive:12,maxReserve:24,reload:2.6,kick:1.45,shake:.62,color:0xffb050,kind:'launcher',shop:true,snd:'launcher',rarity:'epico',cost:{wood:1,metal:3,elec:2},desc:'Esplosione 74 al centro · mirino a tubo',sight:'tube',scope:1.35,bl:.006,bmax:.02,bars:[1,.2,.6,.16]},
 {id:'flamer',name:'Drago lanciafiamme',dmg:5,rate:.05,spread:0,pellets:1,range:8,mag:120,reserveGive:240,maxReserve:480,reload:2.2,kick:.04,shake:.03,color:0xff8a30,mlColor:0xff7a20,auto:true,kind:'flame',shop:true,snd:'flame',rarity:'leggendario',cost:{wood:0,metal:3,elec:3},desc:'Getto corto · scioglie da vicino, non da lontano',sight:'cone',scope:1.08,bars:[.8,1,.5,1]},
 {id:'minigun',name:'Tritacarne minigun',dmg:8,rate:.048,spread:.02,hipSpread:.05,pellets:1,range:55,mag:200,reserveGive:400,maxReserve:800,reload:3.1,kick:.22,shake:.12,color:0xffd890,auto:true,spin:true,shop:true,snd:'minigun',rarity:'leggendario',cost:{wood:1,metal:5,elec:2},desc:'Danno 8 · tantissimi colpi · la raffica si apre',sight:'holo',scope:1.15,bl:.017,bmax:.085,bars:[.5,1,.55,1]},
 {id:'axe',name:'Ascia',dmg:22,rate:.58,spread:0,pellets:1,range:2.2,melee:true,tool:'axe',sight:'melee'},
 {id:'pick',name:'Piccone',dmg:18,rate:.62,spread:0,pellets:1,range:2.2,melee:true,tool:'pick',sight:'melee'},
 {id:'hammer',name:'Martello',dmg:14,rate:.48,spread:0,pellets:1,range:2.1,melee:true,tool:'hammer',sight:'melee'},
 {id:'fox',name:'Volpe',dmg:24,rate:.24,spread:.0028,hipSpread:.013,pellets:1,range:75,mag:18,reserveGive:54,maxReserve:140,reload:1.45,kick:.55,shake:.18,color:0xffe2a0,shop:true,snd:'ar',rarity:'raro',cost:{wood:1,metal:2,elec:0},desc:'Danno 24 · carabina · mirino a tacche strette',sight:'post',scope:1.4,bl:.006,bmax:.026},
 {id:'burst',name:'Rondine',dmg:12,rate:.082,spread:.007,hipSpread:.024,pellets:1,range:52,mag:28,reserveGive:112,maxReserve:220,reload:1.4,kick:.34,shake:.12,color:0xfff0b0,auto:true,shop:true,snd:'smg',rarity:'raro',cost:{wood:1,metal:2,elec:1},desc:'Danno 12 · raffica · mirino aperto',sight:'holo',scope:1.25,bl:.012,bmax:.055},
 {id:'saw',name:'Canne mozze',dmg:11,rate:.58,spread:.07,hipSpread:.12,pellets:7,range:12,mag:2,reserveGive:16,maxReserve:40,reload:1.6,kick:1.5,shake:.9,color:0xffc470,shop:true,snd:'dbarrel',fx:'shotgun',rarity:'epico',cost:{wood:2,metal:2,elec:0},desc:'7 pallini × 11 · solo a bruciapelo',sight:'ring',scope:1.1,fall:1.1,fmin:.12,bl:.02,bmax:.04},
 {id:'hunt',name:'Cervo .308',dmg:58,rate:.78,spread:.002,hipSpread:.026,pellets:1,range:120,mag:8,reserveGive:24,maxReserve:64,reload:2,kick:1.35,shake:.5,color:0xfff4d0,kind:'sniper',scope:2.2,shop:true,snd:'sniper',rarity:'epico',cost:{wood:1,metal:3,elec:1},desc:'Danno 58 · ottica 2.2x · trapassa',sight:'glass',bl:.004,bmax:.02,bars:[.7,.35,.9,.2]},
 {id:'vespa',name:'Vespa',dmg:46,rate:.9,spread:.007,hipSpread:.02,pellets:1,range:40,mag:3,reserveGive:9,maxReserve:18,reload:2.15,kick:1.05,shake:.42,color:0xffb050,kind:'launcher',shop:true,snd:'launcher',rarity:'epico',cost:{wood:1,metal:3,elec:2},desc:'Granata 46 · ferisce il gruppo, non lo cancella',sight:'tube',scope:1.28,bl:.006,bmax:.02,bars:[.62,.25,.7,.12]});
const TIER_N=['di legno','di pietra','di ferro'];
// --- viewmodels (separate scene) ---
const vmRoot=new T.Group();vmScene.add(vmRoot);
const VM={};const metalM=new T.MeshStandardMaterial({color:0x2c2e33,metalness:.7,roughness:.38}),metal2=new T.MeshStandardMaterial({color:0x5b5f66,metalness:.8,roughness:.3}),
 woodM=new T.MeshStandardMaterial({color:0x6b3f22,roughness:.7}),gripM=new T.MeshStandardMaterial({color:0x1c1a19,roughness:.9}),skinM=new T.MeshStandardMaterial({color:0xc89878,roughness:.8}),
 sleeveM=new T.MeshStandardMaterial({color:0x34402c,roughness:.95}),gloveM=new T.MeshStandardMaterial({color:0x2a2420,roughness:.9}),
 laserGlow=new T.MeshBasicMaterial({color:0x40fff0}),bladeM=new T.MeshStandardMaterial({color:0xd8dde2,metalness:.95,roughness:.15});
const cylZ=new T.CylinderGeometry(.5,.5,1,10);cylZ.rotateX(Math.PI/2);
function vb(g,geo,m,x,y,z,sx,sy,sz){const k=new T.Mesh(geo,m);k.position.set(x,y,z);k.scale.set(sx,sy,sz);g.add(k);return k;}
function addHand(g,x,y,z){vb(g,G.box,gloveM,x,y,z,.075,.085,.11);vb(g,G.box,sleeveM,x+.02,y-.06,z+.2,.1,.1,.32).rotation.x=.35;}
function muzzleFlash(g,z,size,col){const s=new T.Sprite(new T.SpriteMaterial({map:flashTex,color:col,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0}));s.position.set(0,.02,z);s.scale.set(size,size,1);g.add(s);g.userData.flash=s;g.userData.muzzleZ=z;}
{const g=new T.Group();vb(g,G.box,bladeM,0,.0,-.2,.012,.04,.26);const tip=vb(g,G.box,bladeM,0,.008,-.34,.012,.025,.04);tip.rotation.x=.5;vb(g,G.box,metal2,0,0,-.065,.05,.06,.02);vb(g,cylZ,gripM,0,0,0,.035,.035,.12);addHand(g,0,-.01,.01);
 g.userData.base=[.26,-.24,-.42];g.userData.rot=[.15,-.35,.5];VM.knife=g;}
{const g=new T.Group();vb(g,G.box,metalM,0,.03,-.08,.045,.045,.22);vb(g,G.box,metal2,0,.06,-.08,.035,.012,.2);vb(g,G.box,gripM,0,-.0,-.06,.04,.03,.18);
 const grip=vb(g,G.box,gripM,0,-.07,.02,.04,.12,.06);grip.rotation.x=-.25;vb(g,G.box,metalM,0,-.025,-.05,.008,.03,.05);vb(g,G.box,metal2,0,.065,-.185,.008,.012,.012);vb(g,G.box,metal2,0,.065,.02,.025,.012,.012);
 addHand(g,0,-.07,.03);muzzleFlash(g,-.21,.3,0xffd080);g.userData.base=[.2,-.19,-.42];g.userData.rot=[0,0,0];VM.pistol=g;}
{const g=new T.Group();vb(g,cylZ,metalM,0,.04,-.3,.032,.032,.62);vb(g,cylZ,metal2,0,.005,-.25,.026,.026,.5);const pump=vb(g,G.box,woodM,0,.005,-.3,.05,.05,.16);
 vb(g,G.box,metalM,0,.025,.0,.06,.075,.2);const st=vb(g,G.box,woodM,0,-.02,.2,.05,.09,.24);st.rotation.x=.12;vb(g,G.box,metal2,0,.08,-.58,.008,.015,.01);
 addHand(g,0,-.05,.06);const lh=new T.Group();vb(lh,G.box,gloveM,0,-.035,0,.08,.06,.1);pump.add(lh);lh.scale.set(1/.05,1/.05,1/.16);
 muzzleFlash(g,-.63,.5,0xffc060);g.userData.pump=pump;g.userData.base=[.2,-.2,-.38];g.userData.rot=[0,0,0];VM.shotgun=g;}
{const g=new T.Group();vb(g,G.box,metalM,0,.03,-.15,.07,.08,.36);vb(g,cylZ,metal2,0,.04,-.42,.03,.03,.2);
 const coils=[];for(let i=0;i<3;i++){const c=vb(g,new T.TorusGeometry(.5,.18,4,10),laserGlow,0,.04,-.3-i*.05,.05,.05,.05);coils.push(c);}
 vb(g,G.box,laserGlow,0,.075,-.15,.02,.01,.3);vb(g,G.box,laserGlow,.037,.03,-.1,.004,.03,.15);const cell=vb(g,G.box,new T.MeshBasicMaterial({color:0x1aff90}),0,-.03,-.12,.04,.05,.08);
 vb(g,G.box,gripM,0,-.06,.01,.045,.12,.06).rotation.x=-.2;vb(g,G.box,metalM,0,.02,.12,.05,.07,.14);addHand(g,0,-.07,.02);
 muzzleFlash(g,-.53,.32,0x40fff0);g.userData.coils=coils;g.userData.cell=cell;g.userData.base=[.2,-.2,-.4];g.userData.rot=[0,0,0];VM.laser=g;}
// ---- v3 shop weapon viewmodels ----
const viperM=new T.MeshStandardMaterial({color:0x2f6a42,metalness:.55,roughness:.35}),tanM=new T.MeshStandardMaterial({color:0x8a7352,roughness:.6,metalness:.15}),
 navyM=new T.MeshStandardMaterial({color:0x26324a,metalness:.65,roughness:.32}),boltM=new T.MeshBasicMaterial({color:0x5ab8ff}),redDot=new T.MeshBasicMaterial({color:0xff2a2a}),
 plasmaGlow=new T.MeshBasicMaterial({color:0xff8a30}),plasmaBody=new T.MeshStandardMaterial({color:0x3a3d45,metalness:.8,roughness:.25}),goldM=new T.MeshStandardMaterial({color:0xc9962e,metalness:.9,roughness:.25});
const cylY=new T.CylinderGeometry(.5,.5,1,14),torG=new T.TorusGeometry(.5,.16,6,16);
{const g=new T.Group();vb(g,G.box,metalM,0,.03,-.08,.055,.07,.26);vb(g,G.box,viperM,0,.035,-.1,.058,.03,.16);vb(g,G.box,metal2,0,.072,-.08,.03,.012,.22);
 vb(g,cylZ,metalM,0,.04,-.27,.026,.026,.14);vb(g,cylZ,metal2,0,.04,-.33,.03,.03,.04);
 const m=vb(g,G.box,gripM,0,-.08,-.13,.034,.17,.05);m.rotation.x=.12;const gr=vb(g,G.box,gripM,0,-.065,.02,.04,.11,.055);gr.rotation.x=-.25;
 vb(g,G.box,metal2,0,.045,.13,.012,.012,.2);vb(g,G.box,metal2,0,-.005,.13,.012,.012,.2);vb(g,G.box,gripM,0,.02,.23,.035,.075,.02);
 addHand(g,0,-.07,.03);muzzleFlash(g,-.36,.26,0xffe090);g.userData.base=[.2,-.19,-.42];g.userData.rot=[0,0,0];VM.smg=g;}
{const g=new T.Group();vb(g,G.box,metalM,0,.03,-.12,.06,.085,.34);vb(g,G.box,tanM,0,.025,-.39,.058,.065,.22);vb(g,cylZ,metalM,0,.035,-.57,.02,.02,.18);vb(g,cylZ,metal2,0,.035,-.66,.03,.03,.05);
 const m1=vb(g,G.box,gripM,0,-.09,-.14,.04,.13,.07);m1.rotation.x=.18;const m2=vb(g,G.box,gripM,0,-.18,-.115,.038,.09,.065);m2.rotation.x=.38;
 const gr=vb(g,G.box,gripM,0,-.07,.03,.042,.12,.06);gr.rotation.x=-.25;vb(g,G.box,tanM,0,.0,.16,.052,.09,.22);vb(g,G.box,gripM,0,-.01,.275,.054,.11,.02);
 vb(g,cylZ,metalM,0,.112,-.12,.032,.032,.15);vb(g,G.box,metalM,0,.085,-.12,.02,.03,.05);vb(g,cylZ,redDot,0,.112,-.196,.022,.022,.004);
 addHand(g,0,-.075,.04);muzzleFlash(g,-.7,.36,0xffd080);g.userData.base=[.19,-.2,-.4];g.userData.rot=[0,0,0];VM.ar=g;}
{const g=new T.Group();vb(g,G.box,navyM,0,.025,-.1,.075,.095,.32);vb(g,cylZ,metalM,0,.05,-.38,.034,.034,.42);vb(g,cylZ,metal2,0,.012,-.33,.026,.026,.32);
 const d=vb(g,cylY,metalM,0,-.085,-.08,.15,.07,.15);d.rotation.z=Math.PI/2;vb(g,G.box,boltM,.039,.03,-.1,.004,.012,.26);vb(g,G.box,boltM,-.039,.03,-.1,.004,.012,.26);
 const gr=vb(g,G.box,gripM,0,-.07,.05,.045,.12,.06);gr.rotation.x=-.25;vb(g,G.box,navyM,0,.0,.2,.06,.1,.22);vb(g,G.box,gripM,0,-.0,.315,.062,.12,.02);
 vb(g,G.box,metal2,0,.105,-.56,.008,.018,.01);addHand(g,0,-.07,.06);muzzleFlash(g,-.6,.55,0xbfe0ff);g.userData.base=[.2,-.2,-.38];g.userData.rot=[0,0,0];VM.thunder=g;}
{const g=new T.Group();vb(g,G.box,plasmaBody,0,.03,-.14,.09,.1,.38);vb(g,G.box,goldM,0,.085,-.14,.05,.014,.3);vb(g,cylZ,plasmaBody,0,.035,-.42,.05,.05,.16);
 const core=vb(g,cylZ,plasmaGlow,0,.035,-.505,.034,.034,.02);const rings=[];for(let i=0;i<3;i++){const r=vb(g,torG,plasmaGlow,0,.035,-.36-i*.05,.075,.075,.075);rings.push(r);}
 vb(g,cylZ,plasmaGlow,.052,.0,-.14,.022,.022,.2);vb(g,G.box,plasmaGlow,-.046,.04,-.12,.004,.04,.2);
 const gr=vb(g,G.box,gripM,0,-.07,.02,.045,.12,.06);gr.rotation.x=-.2;vb(g,G.box,plasmaBody,0,.01,.16,.06,.08,.18);vb(g,G.box,goldM,0,.01,.255,.062,.09,.02);
 addHand(g,0,-.075,.03);muzzleFlash(g,-.54,.4,0xff9a40);g.userData.coils=rings;g.userData.glow=plasmaGlow;g.userData.base=[.2,-.2,-.4];g.userData.rot=[0,0,0];VM.plasma=g;}
// ---- v4 viewmodels ----
const holeM=new T.MeshBasicMaterial({color:0x0a0a0a}),camoM=new T.MeshStandardMaterial({color:0x3b4430,roughness:.7,metalness:.2}),lensM=new T.MeshBasicMaterial({color:0x4aa8ff}),oliveM=new T.MeshStandardMaterial({color:0x4d5a32,roughness:.65,metalness:.25}),
 redM=new T.MeshStandardMaterial({color:0xa8261c,roughness:.45,metalness:.35}),brassM=new T.MeshStandardMaterial({color:0xc99a3a,metalness:.9,roughness:.3}),stringM=new T.MeshBasicMaterial({color:0xd8d0c0}),
 fletchM=new T.MeshBasicMaterial({color:0xd03020}),toolHead=[new T.MeshStandardMaterial({color:0x8c7c68,roughness:.9,flatShading:true}),new T.MeshStandardMaterial({color:0x7c7f86,roughness:.85,flatShading:true}),new T.MeshStandardMaterial({color:0xb8bec6,metalness:.85,roughness:.28})],
 edgeM=new T.MeshStandardMaterial({color:0xe8ecf0,metalness:.9,roughness:.2});
// revolver
{const g=new T.Group();vb(g,G.box,metal2,0,.04,-.05,.04,.065,.1);const c=vb(g,cylY,metalM,0,.042,-.045,.08,.07,.08);c.rotation.x=Math.PI/2;
 vb(g,cylZ,metal2,0,.062,-.2,.026,.026,.25);vb(g,G.box,metal2,0,.082,-.2,.012,.014,.25);vb(g,G.box,metal2,0,.092,-.318,.006,.014,.012);
 const gr=vb(g,G.box,woodM,0,-.035,.045,.042,.125,.058);gr.rotation.x=-.35;vb(g,G.box,metalM,0,.078,.025,.012,.024,.03).rotation.x=-.5;vb(g,G.box,metalM,0,-.008,-.04,.006,.035,.045);
 addHand(g,0,-.065,.055);muzzleFlash(g,-.34,.36,0xffd080);g.userData.base=[.2,-.19,-.42];g.userData.rot=[0,0,0];VM.revolver=g;}
// double barrel
{const g=new T.Group();for(const sx of [-.024,.024])vb(g,cylZ,metalM,sx,.04,-.34,.025,.025,.56);vb(g,G.box,metal2,0,.062,-.34,.012,.008,.54);
 vb(g,G.box,woodM,0,.01,-.3,.064,.036,.22);vb(g,G.box,metal2,0,.03,-.03,.064,.064,.1);const st=vb(g,G.box,woodM,0,-.012,.16,.054,.088,.28);st.rotation.x=.14;vb(g,G.box,gripM,0,-.035,.305,.056,.11,.02);
 vb(g,G.box,metal2,-.012,.068,.0,.008,.02,.02);vb(g,G.box,metal2,.012,.068,.0,.008,.02,.02);addHand(g,0,-.05,.06);muzzleFlash(g,-.64,.58,0xffc060);g.userData.base=[.2,-.2,-.38];g.userData.rot=[0,0,0];VM.dbarrel=g;}
// crossbow
{const g=new T.Group();vb(g,G.box,woodM,0,.0,-.12,.05,.055,.46);vb(g,G.box,metalM,0,.032,-.15,.02,.012,.4);
 const L1=vb(g,G.box,metalM,-.14,.02,-.34,.28,.022,.035);L1.rotation.y=.35;const L2=vb(g,G.box,metalM,.14,.02,-.34,.28,.022,.035);L2.rotation.y=-.35;
 for(const sd of [-1,1]){const s=vb(g,G.box,stringM,sd*.136,.03,-.186,.344,.004,.004);s.rotation.y=sd*.663;}
 const bolt=vb(g,cylZ,woodM,0,.048,-.24,.012,.012,.36),tip=vb(g,G.box,edgeM,0,.048,-.43,.018,.018,.04),fl=vb(g,G.box,fletchM,0,.058,-.08,.004,.02,.05);
 vb(g,cylZ,metalM,0,.085,-.08,.026,.026,.13);vb(g,G.box,metalM,0,.066,-.08,.012,.02,.03);const gr=vb(g,G.box,gripM,0,-.06,.03,.04,.11,.05);gr.rotation.x=-.25;vb(g,G.box,woodM,0,-.02,.18,.05,.09,.16);
 addHand(g,0,-.07,.04);muzzleFlash(g,-.46,.001,0xffffff);g.userData.bolt=[bolt,tip,fl];g.userData.base=[.2,-.2,-.4];g.userData.rot=[0,0,0];VM.crossbow=g;}
// sniper
{const g=new T.Group();vb(g,G.box,camoM,0,.02,-.12,.062,.08,.4);vb(g,cylZ,metalM,0,.042,-.56,.022,.022,.52);vb(g,cylZ,metal2,0,.042,-.84,.038,.038,.08);
 vb(g,cylZ,metalM,0,.118,-.12,.044,.044,.3);vb(g,cylZ,metalM,0,.118,-.29,.058,.058,.07);vb(g,cylZ,metalM,0,.118,.04,.052,.052,.05);vb(g,cylZ,lensM,0,.118,-.326,.048,.048,.004);
 vb(g,G.box,metalM,0,.082,-.17,.02,.04,.04);vb(g,G.box,metalM,0,.082,-.05,.02,.04,.04);const m=vb(g,G.box,gripM,0,-.07,-.1,.036,.1,.06);m.rotation.x=.1;
 const gr=vb(g,G.box,gripM,0,-.07,.045,.042,.12,.056);gr.rotation.x=-.3;vb(g,G.box,camoM,0,0,.2,.052,.1,.26);vb(g,G.box,gripM,0,0,.335,.056,.13,.02);vb(g,G.box,camoM,0,.06,.16,.022,.03,.14);
 vb(g,G.box,metal2,.042,.05,0,.04,.012,.012);vb(g,G.box,metalM,-.012,-.0,-.42,.008,.008,.16);vb(g,G.box,metalM,.012,-.0,-.42,.008,.008,.16);
 addHand(g,0,-.075,.05);muzzleFlash(g,-.9,.5,0xfff0c0);g.userData.base=[.19,-.2,-.42];g.userData.rot=[0,0,0];VM.sniper=g;}
// grenade launcher
{const g=new T.Group();vb(g,cylZ,oliveM,0,.045,-.3,.048,.048,.3);vb(g,cylZ,metalM,0,.045,-.46,.054,.054,.035);const d=vb(g,cylY,oliveM,0,.03,-.08,.14,.14,.14);d.rotation.x=Math.PI/2;
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;vb(g,cylZ,holeM,Math.cos(a)*.042,.03+Math.sin(a)*.042,-.152,.026,.026,.004);}
 vb(g,G.box,metalM,0,.045,.04,.052,.075,.1);vb(g,G.box,gripM,0,-.05,-.28,.032,.085,.036);const gr=vb(g,G.box,gripM,0,-.06,.08,.042,.115,.055);gr.rotation.x=-.25;
 vb(g,G.box,oliveM,0,.012,.22,.046,.075,.2);vb(g,G.box,metalM,0,.105,-.26,.02,.045,.01);addHand(g,0,-.07,.09);muzzleFlash(g,-.5,.5,0xffb060);g.userData.base=[.2,-.21,-.38];g.userData.rot=[0,0,0];VM.glauncher=g;}
// flamethrower
{const g=new T.Group();vb(g,cylZ,redM,0,-.075,-.06,.075,.075,.3);vb(g,cylZ,metal2,0,-.075,-.215,.078,.078,.012);vb(g,cylZ,metal2,0,-.075,.095,.078,.078,.012);
 vb(g,G.box,metalM,0,.03,-.12,.06,.07,.32);vb(g,cylZ,metalM,0,.04,-.4,.03,.03,.26);vb(g,cylZ,metal2,0,.04,-.55,.044,.044,.06);vb(g,G.box,brassM,.034,.045,-.3,.006,.012,.2);
 vb(g,G.box,gripM,0,.09,-.15,.03,.02,.13);vb(g,G.box,gripM,0,.07,-.21,.02,.04,.02);vb(g,G.box,gripM,0,.07,-.09,.02,.04,.02);const gr=vb(g,G.box,gripM,0,-.06,.05,.042,.11,.055);gr.rotation.x=-.25;
 const pil=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0x6aa8ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.9}));pil.position.set(0,.04,-.6);pil.scale.set(.07,.07,1);g.add(pil);
 addHand(g,0,-.07,.06);muzzleFlash(g,-.62,.3,0xff8a30);g.userData.pilot=pil;g.userData.base=[.2,-.18,-.4];g.userData.rot=[0,0,0];VM.flamer=g;}
// minigun
{const g=new T.Group();const sp=new T.Group();sp.position.set(0,.02,-.32);g.add(sp);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;vb(sp,cylZ,metalM,Math.cos(a)*.032,Math.sin(a)*.032,0,.016,.016,.52);}
 vb(sp,cylZ,metal2,0,0,-.2,.09,.09,.03);vb(sp,cylZ,metal2,0,0,.16,.09,.09,.03);vb(g,G.box,metalM,0,.02,0,.11,.115,.18);vb(g,cylZ,metal2,0,.02,.12,.075,.075,.08);
 vb(g,G.box,oliveM,.1,-.04,0,.08,.1,.14);vb(g,G.box,brassM,.055,0,-.02,.03,.016,.08);vb(g,G.box,gripM,0,.105,-.02,.03,.02,.15);vb(g,G.box,gripM,0,.085,-.08,.02,.03,.02);vb(g,G.box,gripM,0,.085,.04,.02,.03,.02);
 const gr=vb(g,G.box,gripM,0,-.06,.13,.042,.11,.05);gr.rotation.x=-.2;addHand(g,0,-.065,.14);muzzleFlash(g,-.6,.42,0xffd070);g.userData.spin=sp;g.userData.base=[.2,-.22,-.36];g.userData.rot=[0,0,0];VM.minigun=g;}
// tools (axe / pickaxe / hammer) — head material swaps with tier
function toolVM(kind){const g=new T.Group();vb(g,cylY,woodM,0,.08,0,.028,.62,.028);vb(g,cylY,gripM,0,-.13,0,.034,.16,.034);const heads=[];
  if(kind==='axe'){heads.push(vb(g,G.box,toolHead[0],0,.335,-.05,.03,.06,.08),vb(g,G.box,toolHead[0],0,.335,-.11,.02,.12,.06),vb(g,G.box,toolHead[0],0,.335,.02,.034,.05,.03));vb(g,G.box,edgeM,0,.335,-.22,.01,.16,.008);g.userData.rot=[-.55,.15,-.08];}
  else if(kind==='pick'){const a=vb(g,G.box,toolHead[0],.08,.35,0,.17,.035,.034);a.rotation.z=-.28;const b=vb(g,G.box,toolHead[0],-.08,.35,0,.17,.035,.034);b.rotation.z=.28;heads.push(a,b,vb(g,G.box,toolHead[0],0,.37,0,.05,.05,.05));}
  else{heads.push(vb(g,G.box,toolHead[0],0,.36,0,.15,.075,.075));const cl=vb(g,G.box,toolHead[0],-.1,.38,0,.07,.03,.05);cl.rotation.z=.5;heads.push(cl);}
  vb(g,G.box,gloveM,0,-.12,0,.085,.1,.085);const sl=vb(g,G.box,sleeveM,.02,-.2,.12,.1,.1,.3);sl.rotation.x=.9;
  g.userData.heads=heads;g.userData.base=[.26,-.3,-.5];if(!g.userData.rot)g.userData.rot=[.2,-.4,.55];g.scale.setScalar(.85);return g;}
VM.axe=toolVM('axe');VM.pick=toolVM('pick');VM.hammer=toolVM('hammer');
{const g=new T.Group();vb(g,G.box,woodM,0,.012,.2,.052,.1,.24);vb(g,G.box,woodM,0,.06,.3,.046,.035,.09);vb(g,G.box,brassM,0,.034,-.02,.058,.082,.16);vb(g,cylZ,metalM,0,.042,-.3,.015,.015,.3);vb(g,cylZ,metal2,0,.042,-.46,.022,.022,.035);vb(g,G.box,woodM,0,-.02,0,.016,.055,.16);const gr=vb(g,G.box,woodM,0,-.055,.08,.036,.1,.042);gr.rotation.x=-.38;vb(g,G.box,metal2,0,.095,-.1,.01,.028,.04);addHand(g,0,-.06,.09);muzzleFlash(g,-.5,.2,0xffe2a0);g.userData.base=[.2,-.2,-.42];g.userData.rot=[0,0,0];VM.fox=g;}
{const g=new T.Group();vb(g,G.box,viperM,0,.02,0,.062,.095,.44);vb(g,cylZ,metalM,0,.05,-.3,.016,.016,.12);vb(g,G.box,metal2,0,.095,-.02,.028,.01,.3);const mag=vb(g,G.box,gripM,.012,-.1,.06,.034,.15,.07);mag.rotation.z=.22;mag.rotation.x=.25;vb(g,G.box,viperM,0,.03,.22,.058,.085,.1);vb(g,G.box,lensM,0,.05,-.36,.02,.02,.012);const gr=vb(g,G.box,gripM,0,-.02,.14,.04,.1,.05);gr.rotation.x=-.2;addHand(g,0,-.04,.12);muzzleFlash(g,-.4,.22,0xfff0b0);g.userData.base=[.18,-.18,-.4];g.userData.rot=[0,0,0];VM.burst=g;}
{const g=new T.Group();for(const sx of [-.03,.03]){vb(g,cylZ,metalM,sx,.03,-.1,.032,.032,.14);vb(g,cylZ,metal2,sx,.03,-.18,.04,.04,.028);}vb(g,G.box,woodM,0,.012,-.02,.086,.05,.1);vb(g,G.box,brassM,-.02,.045,.02,.014,.014,.045);vb(g,G.box,brassM,.02,.045,.02,.014,.014,.045);const gr=vb(g,G.box,woodM,0,-.07,.08,.044,.13,.05);gr.rotation.x=-.5;addHand(g,0,-.05,.1);muzzleFlash(g,-.2,.6,0xffc060);g.userData.base=[.24,-.18,-.32];g.userData.rot=[0,0,0];VM.saw=g;}
{const g=new T.Group();vb(g,G.box,woodM,0,.012,-.02,.046,.072,.56);vb(g,G.box,woodM,0,.02,.32,.052,.11,.22);vb(g,cylZ,metal2,0,.048,-.4,.016,.016,.38);vb(g,cylZ,metalM,0,.12,-.02,.03,.03,.26);vb(g,cylZ,lensM,0,.12,-.16,.038,.038,.02);vb(g,cylZ,metal2,0,.12,.12,.034,.034,.02);vb(g,G.box,metalM,.045,.04,0,.028,.016,.07);const gr=vb(g,G.box,gripM,0,-.05,.1,.038,.11,.048);gr.rotation.x=-.32;addHand(g,0,-.06,.12);muzzleFlash(g,-.6,.28,0xfff4d0);g.userData.base=[.16,-.2,-.46];g.userData.rot=[0,0,0];VM.hunt=g;}
{const g=new T.Group();vb(g,cylZ,oliveM,0,.04,-.12,.058,.058,.2);vb(g,cylZ,metalM,0,.04,-.24,.078,.078,.05);const drum=vb(g,cylY,oliveM,.1,.02,-.02,.12,.12,.12);drum.rotation.z=Math.PI/2;vb(g,G.box,brassM,.1,.09,-.02,.13,.018,.17);vb(g,G.box,metal2,.1,.03,-.02,.13,.018,.17);vb(g,G.box,brassM,.1,-.03,-.02,.13,.018,.17);vb(g,G.box,metal2,.1,-.09,-.02,.13,.018,.17);const gr=vb(g,G.box,gripM,0,-.07,.1,.042,.13,.05);gr.rotation.x=-.35;addHand(g,0,-.06,.12);muzzleFlash(g,-.3,.5,0xffb040);g.userData.base=[.2,-.2,-.36];g.userData.rot=[0,0,0];VM.vespa=g;}
for(const k in VM){VM[k].visible=false;vmRoot.add(VM[k]);}

// ---------- pickups ----------
const MAT_INFO={wood:{name:'Legno',icon:'🪵',color:0x8b5a2b,glow:0xffa050,hud:'mWood',k:0},metal:{name:'Metallo',icon:'🔩',color:0xaeb6c0,glow:0xbfdcff,hud:'mMetal',k:1},elec:{name:'Componenti elettronici',icon:'💡',color:0x1a7a3a,glow:0x40ff90,hud:'mElec',k:2}};
const pickGeo={wood:new T.CylinderGeometry(.11,.11,.6,6),metal:new T.BoxGeometry(.42,.1,.28),elec:new T.BoxGeometry(.3,.04,.24),chip:new T.BoxGeometry(.1,.05,.1),ring:new T.RingGeometry(.55,.68,24)};
pickGeo.ring.rotateX(-Math.PI/2);
const pickMats={};for(const k in MAT_INFO){const I=MAT_INFO[k];pickMats[k]={body:new T.MeshLambertMaterial({color:I.color,emissive:I.glow,emissiveIntensity:k=='elec'?.6:.22}),
  ring:new T.MeshBasicMaterial({color:I.glow,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),
  halo:new T.SpriteMaterial({map:glowTex,color:I.glow,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.9,fog:false})};}
const chipMat=new T.MeshBasicMaterial({color:0x111111}),ledMat=new T.MeshBasicMaterial({color:0xff4040});
const pickups=[];
function randFree(r,minFromPlayer){for(let t=0;t<300;t++){const x=(Math.random()*2-1)*(HALF-2),z=(Math.random()*2-1)*(HALF-2);if(!freeSpot(x,z,r))continue;if(minFromPlayer&&Math.hypot(x-player.pos.x,z-player.pos.z)<minFromPlayer)continue;return {x,z};}return {x:6,z:6};}
function makePickup(type){const M=pickMats[type];const root=new T.Group(),item=new T.Group();root.add(item);
  if(type=='wood'){for(let i=0;i<3;i++){const m=new T.Mesh(pickGeo.wood,M.body);m.rotation.z=Math.PI/2;m.rotation.y=i*.3;m.position.set(0,i==2?.18:0,i==2?0:(i?.12:-.12));item.add(m);}}
  else if(type=='metal'){const a=new T.Mesh(pickGeo.metal,M.body);item.add(a);const b=a.clone();b.position.y=.1;b.rotation.y=.6;b.scale.set(.8,1,.8);item.add(b);}
  else{const a=new T.Mesh(pickGeo.elec,M.body);item.add(a);const c=new T.Mesh(pickGeo.chip,chipMat);c.position.y=.04;item.add(c);const l=new T.Mesh(pickGeo.chip,ledMat);l.scale.set(.3,.6,.3);l.position.set(.1,.04,.08);item.add(l);}
  const halo=new T.Sprite(M.halo);halo.scale.set(1.5,1.5,1);item.add(halo);
  const ring=new T.Mesh(pickGeo.ring,M.ring.clone());ring.position.y=.03;root.add(ring);
  scene.add(root);const p={type,root,item,ring,active:false,timer:0,x:0,z:0,fly:0,near:false};pickups.push(p);placePickup(p);return p;}
function placePickup(p){const s=randFree(.9,player.started?9:0);p.x=s.x;p.z=s.z;p.root.position.set(s.x,0,s.z);p.item.position.set(0,.6,0);p.item.scale.setScalar(1);p.root.visible=true;p.active=true;p.fly=0;}

