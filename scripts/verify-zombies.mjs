import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,existsSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {Script} from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url),{chromium}=require('playwright');
for(const f of ['game.html','zombie-preview.html']){
 const html=readFileSync(resolve(root,f),'utf8');for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc\s*=/.test(m[1]))new Script(m[2],{filename:f});
}
for(const id of ['normal','runner','tank','bloater','boss']){
 const b=readFileSync(resolve(root,`assets/zombies-v2/models/${id}.glb`));assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.deepEqual(j.animations.map(a=>a.name),['Walk','Attack','Death','Crawl']);
 for(const a of j.animations)for(const c of a.channels)assert.ok(j.nodes[c.target.node]);
 for(const a of j.accessors){const v=j.bufferViews[a.bufferView];assert.ok(v.byteOffset+v.byteLength<=j.buffers[0].byteLength);}
 for(const name of ['hipL','hipR','shL','shR','neck'])assert.ok(j.nodes.some(n=>n.name===name));
}
const server=createServer((req,res)=>{try{const f=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!f.startsWith(root))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary'})[extname(f)]||'text/plain');res.end(readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.ZOMBIE_TEST_CHROME||(existsSync('/tmp/chromium')?'/tmp/chromium':undefined),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={};mkdirSync(resolve(root,'artifacts'),{recursive:true});
try{
 const ctx=await browser.newContext({viewport:{width:1400,height:900}});await ctx.route('**/*',r=>r.request().url().startsWith(url)?r.continue():r.abort());
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|ReferenceError|TypeError/.test(m.text()))errors.push(m.text());});
 await page.goto(url+'/zombie-preview.html');await page.waitForFunction(()=>window.__zombiePreview?.renderer.info.render.calls>0);
 await page.selectOption('#mode','idle');await page.screenshot({path:resolve(root,'artifacts/zombies-lineup.png')});
 report.preview=await page.evaluate(()=>({models:__zombiePreview.list.length,calls:__zombiePreview.renderer.info.render.calls,triangles:__zombiePreview.renderer.info.render.triangles}));assert.equal(report.preview.models,5);
 await page.selectOption('#mode','crawl');await page.waitForTimeout(500);await page.screenshot({path:resolve(root,'artifacts/zombies-crawl.png')});
 assert.deepEqual(errors,[]);
 await page.goto(url+'/game.html?v=4.3.60&city=2&nc=zombie-test');await page.waitForFunction(()=>window.__zombieV2&&window.__game,null,{timeout:120000});
 report.game=await page.evaluate(()=>{
  const G=__game,K=__zombieV2,T=THREE,fail=[];const check=(ok,msg)=>{if(!ok)fail.push(msg);};
  // Freeze the normal frame loop. Drive the real damage and animation hooks manually.
  G.game.state='pause';G.SV.on=false;K.kit.clear();for(const z of G.zombies){z.alive=false;z.g.visible=false;}
  const types=[];for(const id of ['normal','runner','tank','bloater','boss']){
   const z=G.zombies.find(z=>z.V.name===id);K.reset(z);z.alive=true;z.dead=false;z.hp=10000;z.maxHp=10000;z.speed=K.profiles[id].speed[0];z.baseSpeedV2=z.speed;z.g.visible=true;z.g.position.set(0,0,0);z.state='walk';z.cool=2;z.stag=0;z.stagHead=0;z.phase=0;
   check(z.parts.every(m=>m.userData.z===z),'hit owner '+id);check(new Set(z.parts.map(m=>m.userData.slot).filter(Boolean)).size===5,'anatomy '+id);
   const dir=new T.Vector3(0,0,1),point=new T.Vector3(0,.5,0);
   K.damage(z,1,'limb',point,dir,'legL');check(!z.gore.legL,'weak hit should not sever '+id);
   K.damage(z,1000,'limb',point,dir,'legL');check(!!z.gore.legL&&z.crawl===1,'left leg crawl '+id);check(z.hipL.parent===G.scene,'left leg world parent '+id);
   K.damage(z,1000,'limb',point,dir,'legR');check(z.legGone===2,'both legs '+id);check(z.speed<K.profiles[id].speed[0],'crawl slowdown '+id);
   z.state='walk';z.slamS=0;z.fuse=0;z.stag=0;z.stagHead=0;z.groanT=20;z.sideT=0;z.stuck=0;z.crawlT=2;
   const q=z.hipL.quaternion.clone();K.update(z,1/60,1,new T.Vector3(0,0,5),false);
   check(q.angleTo(z.hipL.quaternion)<1e-5,'animation must not rotate detached limb '+id);
   for(let i=0;i<360;i++)K.kit.physics(1/60);
   check(K.minY(T,z.hipL)>=.02,'detached leg ground '+id);
   const settled=z.hipL.position.clone();for(let i=0;i<30;i++)K.kit.physics(1/60);check(settled.distanceTo(z.hipL.position)<.005,'debris must settle '+id);
   K.reset(z);check(z.hipL.parent===z.hips&&z.hipR.parent===z.hips,'pool reset hierarchy '+id);check(!K.kit.debris.some(d=>d.z===z),'pool stale debris '+id);
   check(K.targets().filter(m=>m.userData.z===z).length===z.parts.length,'restored hitboxes '+id);
   z.hp=20;z.state='walk';z.crawl=0;K.damage(z,100,'head',new T.Vector3(0,1.7,0),dir,'head');
   check(z.dead&&z.gore.head&&z.neck.parent===G.scene,'head death '+id);
   const kills=G.game.kills;K.kill(z,dir,10,true);check(G.game.kills===kills,'duplicate kill '+id);
   if(id!=='bloater'){
    for(let i=0;i<90;i++)K.update(z,1/60,i/60,new T.Vector3(),false);
    const low=K.minY(T,z.body);check(Number.isFinite(low)&&low>=.015,'corpse ground '+id);
    for(let i=0;i<360;i++)K.update(z,1/60,i/60,new T.Vector3(),false);check(!z.alive&&!z.g.visible,'corpse removal '+id);
   }
   K.reset(z);z.alive=false;z.g.visible=false;types.push({id,hp:z.V.hp,damage:z.V.dmg,speed:z.V.speed});
  }
  const attacker=G.zombies.find(z=>z.V.name==='normal');K.reset(attacker);
  Object.assign(attacker,{alive:true,dead:false,hp:90,speed:1.3,baseSpeedV2:1.3,state:'atk',atkT:0,atkHit:false,cool:0,stag:0,stagHead:0,sideT:0,stuck:0,groanT:20,phase:0});
  attacker.g.visible=true;attacker.g.position.set(-150,0,-150);G.player.pos.set(-150,0,-149);G.player.hp=100;G.game.state='play';
  for(let i=0;i<12;i++)K.update(attacker,1/60,i/60,G.player.pos,true);
  check(G.player.hp===100,'attack must wait for wind-up');
  for(let i=12;i<45;i++)K.update(attacker,1/60,i/60,G.player.pos,true);
  check(G.player.hp<100&&G.player.hp>=100-attacker.V.dmg-10,'one damage event per strike');
  attacker.g.position.set(-150,0,-150);G.player.pos.set(-150,0,-149);G.player.hp=100;K.attack(attacker,1,1);const fullDamage=100-G.player.hp;
  K.kit.sever(attacker,'armL',new T.Vector3(0,0,1));G.player.hp=100;K.attack(attacker,1,1);
  check(100-G.player.hp<fullDamage,'lost arm weakens attack');
  // A closed built wall between the player and attacker must block damage.
  G.SV.on=true;G.player.hp=100;const wall=G.addPiece('wall',-150,-149.5,0,true);
  attacker.tgtPiece=null;K.attack(attacker,1,1);check(G.player.hp===100,'no damage through closed wall');
  wall.alive=false;if(wall.boxRef)G.boxes.splice(G.boxes.indexOf(wall.boxRef),1);
  G.SV.on=false;G.game.state='pause';K.reset(attacker);attacker.alive=false;attacker.g.visible=false;
  const boss=G.zombies.find(z=>z.V.name==='boss');K.reset(boss);
  Object.assign(boss,{alive:true,dead:false,state:'walk',slamS:.55,slamT:3,stag:0,stagHead:0,cool:1,groanT:20,speed:1.2,phase:0});boss.g.visible=true;boss.g.position.set(-150,0,-150);
  K.update(boss,1/60,1,new T.Vector3(-150,0,-145),true);check(boss.shL.rotation.x<-1,'boss special wind-up pose preserved');
  K.reset(boss);boss.alive=false;boss.g.visible=false;
  // Fixed-step debris results must be independent of rendered frame rate.
  const testDt=dt=>{const z=G.zombies.find(z=>z.V.name==='normal');K.kit.clear();K.reset(z);z.g.visible=true;z.g.position.set(0,0,0);z.g.updateMatrixWorld(true);K.kit.sever(z,'armL',new T.Vector3(0,0,1));for(let t=0;t<120;t++)K.kit.physics(dt);return z.shL.position.toArray();};
  const p60=testDt(1/60);K.kit.clear();const p30=(()=>{const z=G.zombies.find(z=>z.V.name==='normal');K.reset(z);z.g.visible=true;z.g.position.set(0,0,0);K.kit.sever(z,'armL',new T.Vector3(0,0,1));for(let t=0;t<60;t++)K.kit.physics(1/30);return z.shL.position.toArray();})();
  check(new T.Vector3(...p60).distanceTo(new T.Vector3(...p30))<.002,'fixed timestep 30/60 FPS');
  const path=K.route({x:0,z:0},{x:10,z:0},(x,z)=>!(x>=3&&x<=7&&Math.abs(z)<=2));
  check(path.length>0&&path.every(p=>!(p.x>=3&&p.x<=7&&Math.abs(p.z)<=2)),'route around blocking wall');
  check(K.route({x:0,z:0},{x:10,z:0},()=>false).length===0,'unreachable path must stop');
  K.kit.clear();return {fail,types,pathLength:path.length,physics30vs60:[p60,p30]};
 });
 assert.deepEqual(report.game.fail,[]);assert.deepEqual(errors,[]);
 await page.setViewportSize({width:844,height:390});await page.goto(url+'/zombie-preview.html');await page.waitForFunction(()=>window.__zombiePreview?.renderer.info.render.calls>0);await page.screenshot({path:resolve(root,'artifacts/zombies-mobile.png')});assert.deepEqual(errors,[]);
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();server.close();}
