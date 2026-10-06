// Run with Playwright installed. CITY_TEST_CHROME optionally selects Chromium.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { Script } from 'node:vm';
const require = createRequire(import.meta.url), { chromium } = require('playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
for (const file of ['game.html', 'city-preview.html']) {
  const html = readFileSync(resolve(root, file), 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=/.test(match[1]) && !/application\/json/.test(match[1])) new Script(match[2], {filename:file});
  }
}
const server = createServer((req, res) => {
  try {
    const file = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (!file.startsWith(root)) throw Error('outside root');
    const mime = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
    res.setHeader('Content-Type', mime[extname(file)] || 'text/plain'); res.end(readFileSync(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + server.address().port;
const executablePath = process.env.CITY_TEST_CHROME || (existsSync('/tmp/chromium') ? '/tmp/chromium' : undefined);
const browser = await chromium.launch({executablePath, headless:true, args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report = {};
try {
  const context = await browser.newContext({viewport:{width:960,height:680}});
  await context.route('**/*', route => route.request().url().startsWith(url) ? route.continue() : route.abort());
  let page = await context.newPage();const errors = [];
  const captureErrors=p=>{p.on('pageerror', e => errors.push(e.message));p.on('console', m => {if(m.type()==='error' && /THREE|WebGL|shader|ReferenceError|TypeError|\[4\.3\.10\]/.test(m.text()))errors.push(m.text());});};
  captureErrors(page);
  await page.goto(url+'/city-preview.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.__preview?.renderer.info.render.calls > 0);
  report.preview = await page.evaluate(() => {
    const {city,boxes,circles,renderer,camera} = window.__preview;
    const overlap = (a,b) => Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>1e-7 && Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>1e-7;
    let pavingOverlaps=0;
    for(const key of ['roads','sidewalks','curbs','paint']){const list=city.paving[key];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(overlap(list[i],list[j]))pavingOverlaps++;}
    for(const road of city.paving.roads)for(const paving of city.paving.sidewalks.concat(city.paving.curbs))if(overlap(road,paving))pavingOverlaps++;
    const junctionOwners=city.paving.junctions.map(j=>{const x=(j.x0+j.x1)/2,z=(j.z0+j.z1)/2;return city.paving.roads.filter(r=>x>=r.x0&&x<r.x1&&z>=r.z0&&z<r.z1).length;});
    const N=337, MIN=-168, blocked=new Uint8Array(N*N), seen=new Uint8Array(N*N), queue=new Int32Array(N*N);
    function index(x,z){return (z-MIN)*N+x-MIN;}
    for(let i=0;i<N;i++){blocked[i]=blocked[(N-1)*N+i]=blocked[i*N]=blocked[i*N+N-1]=1;}
    for(const b of boxes)for(let z=Math.max(-167,Math.ceil(b.z0-.4));z<=Math.min(167,Math.floor(b.z1+.4));z++)for(let x=Math.max(-167,Math.ceil(b.x0-.4));x<=Math.min(167,Math.floor(b.x1+.4));x++)blocked[index(x,z)]=1;
    for(const c of circles)for(let z=Math.max(-167,Math.ceil(c.z-c.r-.4));z<=Math.min(167,Math.floor(c.z+c.r+.4));z++)for(let x=Math.max(-167,Math.ceil(c.x-c.r-.4));x<=Math.min(167,Math.floor(c.x+c.r+.4));x++)if(Math.hypot(x-c.x,z-c.z)<c.r+.4)blocked[index(x,z)]=1;
    const start=index(...city.spawn);let head=0,tail=1;queue[0]=start;seen[start]=1;
    while(head<tail){const p=queue[head++];for(const n of [p-1,p+1,p-N,p+N])if(n>=0&&n<N*N&&!seen[n]&&!blocked[n]){seen[n]=1;queue[tail++]=n;}}
    const accessible=([x,z])=>!!seen[index(Math.round(x),Math.round(z))];
    let bad=0;city.root.traverse(o=>{if(o.isInstancedMesh)for(const v of o.instanceMatrix.array)if(!Number.isFinite(v))bad++;});
    const observer=camera.clone();observer.position.set(119,1.7,-56);city.update(60,observer,680);
    const activeLights=city.dynamicLights.filter(l=>l.intensity>0).length, time0=city.smoke.material.uniforms.uTime.value;city.update(62,observer,680);
    const result={stats:city.stats,pavingOverlaps,junctionOwners,reachableEntrances:city.entrances.filter(accessible).length,reachableInteriors:city.buildings.filter(b=>accessible([b.x,b.z])).length,reachableCells:tail,badMatrices:bad,activeLights,animatedSmoke:city.smoke.material.uniforms.uTime.value>time0,drawCalls:renderer.info.render.calls};
    city.update(62,camera,680);return result;
  });
  assert.equal(report.preview.reachableEntrances,35,'an entrance is blocked');
  assert.equal(report.preview.pavingOverlaps,0,'road/pavement faces overlap');assert.ok(report.preview.junctionOwners.length>20);assert.ok(report.preview.junctionOwners.every(n=>n===1),'a junction has competing road faces');
  assert.equal(report.preview.reachableInteriors,35,'an interior is blocked');
  assert.equal(report.preview.badMatrices,0);assert.ok(report.preview.activeLights>0);assert.ok(report.preview.animatedSmoke);
  await page.getByRole('button',{name:'Relitti',exact:true}).click();
  mkdirSync(resolve(root,'docs'),{recursive:true});
  await page.screenshot({path:resolve(root,'docs/city-catastrophe-dusk.png')});
  await page.locator('#lightMode').click();
  await page.screenshot({path:resolve(root,'docs/city-catastrophe-night.png')});
  assert.deepEqual(errors,[]);
  await page.close();console.log('Desktop rendering and all 35 entrances/interiors passed.');
  const mobileContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'});
  const mobile=await mobileContext.newPage();
  captureErrors(mobile);mobile.setDefaultTimeout(60000);
  await mobile.goto(url+'/city-preview.html',{waitUntil:'domcontentloaded',timeout:60000});await mobile.waitForFunction(()=>window.__preview?.renderer.info.render.calls>0);
  await mobile.getByRole('button',{name:'Cammina',exact:true}).click();
  await mobile.waitForFunction(()=>Math.abs(__preview.camera.position.y-1.7)<.01);
  const before=await mobile.evaluate(()=>({x:__preview.camera.position.x,z:__preview.camera.position.z}));
  const forward=await mobile.locator('[data-key="KeyW"]').boundingBox();await mobile.mouse.move(forward.x+forward.width/2,forward.y+forward.height/2);await mobile.mouse.down();
  await mobile.waitForTimeout(600);await mobile.mouse.up();
  report.mobile=await mobile.evaluate(before=>({lights:__preview.city.dynamicLights.length,moved:Math.hypot(__preview.camera.position.x-before.x,__preview.camera.position.z-before.z)>.1,overflow:document.documentElement.scrollWidth>innerWidth}),before);
  assert.equal(report.mobile.lights,2);assert.ok(report.mobile.moved);assert.equal(report.mobile.overflow,false);assert.deepEqual(errors,[]);
  await mobileContext.close();
  console.log('Mobile layout and movement passed.');page=await context.newPage();captureErrors(page);
  await context.addInitScript(()=>{
    localStorage.setItem('zc_surv','{"legacyMarker":"keep"}');
    // Simulate a returning player so the one-time welcome gift does not cover the menu.
    localStorage.setItem('zc_gift20','1');localStorage.setItem('zc_city2_zc_gift20','1');
    const now=Date.now(), d=new Date(now), today=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    for(const key of ['zc_v42','zc_city2_zc_v42'])if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({dr432:{last:today,streak:1,maxT:now,claims:1}}));
  });
  await page.goto(url+'/game.html?apk=1&city=2',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__game&&window.__cityV2,null,{timeout:120000});
  await page.evaluate(()=>__game.startGame(false));
  await page.waitForFunction(()=>__game.game.state==='play'&&__cityV2.smoke.material.uniforms.uTime.value>0,null,{timeout:120000});
  report.survival=await page.evaluate(()=>{__game.svSave();return {state:__game.game.state,newCity:!!__cityV2,legacyMap:!!window.__map458,resources:__game.NODES.filter(n=>n.alive).length,newSave:!!localStorage.getItem('zc_surv_city2'),legacySave:localStorage.getItem('zc_surv'),half:__game.HALF,smokeTime:__cityV2.smoke.material.uniforms.uTime.value};});
  assert.equal(report.survival.legacyMap,false);assert.equal(report.survival.resources,126);assert.ok(report.survival.newSave);assert.equal(report.survival.legacySave,'{"legacyMarker":"keep"}');assert.equal(report.survival.half,168);assert.deepEqual(errors,[]);
  assert.equal(await page.evaluate(()=>__crash4310.rep().erroriLoop),0);
  assert.equal(await page.evaluate(()=>__zs439.api()),'','preview must not submit to the shared leaderboard');
  await page.waitForFunction(()=>!__ld431.on,null,{timeout:120000});
  await page.evaluate(()=>{__game.inv.wood=7;__game.svSave();__game.showMenu();});
  await page.getByRole('button',{name:'Torna alla partita attuale',exact:true}).click();
  await page.waitForFunction(()=>window.__game&&window.__map458&&!window.__cityV2,null,{timeout:120000});
  report.legacy=await page.evaluate(()=>({newCity:!!window.__cityV2,half:__game.HALF}));assert.equal(report.legacy.newCity,false);assert.equal(report.legacy.half,96);assert.deepEqual(errors,[]);
  await page.setViewportSize({width:844,height:390});
  const choice=page.getByRole('button',{name:'Prova la città nuova',exact:true});
  const bounds=await choice.boundingBox();assert.ok(bounds&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=844&&bounds.y+bounds.height<=390,'city choice outside phone viewport');
  await choice.click();await page.waitForFunction(()=>window.__game&&window.__cityV2,null,{timeout:120000});
  await page.evaluate(()=>__game.startGame());
  assert.equal(await page.evaluate(()=>__game.inv.wood),7,'preview inventory did not survive returning to the current game');
  assert.equal(await page.evaluate(()=>localStorage.getItem('zc_surv')),'{"legacyMarker":"keep"}');assert.deepEqual(errors,[]);
  report.selector={roundTrip:true,previewInventory:7,landscapeButtonVisible:true};
  console.log(JSON.stringify(report,null,2));
} finally {await browser.close();server.close();}
