// Rebuild original GLB assets without Blender, npm packages or a network connection.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const dir=fileURLToPath(new URL('../',import.meta.url));
const source=readFileSync(resolve(dir,'js/three.min.js'),'utf8').replace(/\n$/,''); // 4.3.73: three.js moved out of game.html
const context=vm.createContext({window:{},console});vm.runInContext(source,context);
for(const name of ['zombies','runtime'])vm.runInContext(readFileSync(resolve(dir,`assets/zombies-v2/${name}.js`),'utf8'),context);
const T=context.window.THREE,Z=context.window.ZombieV2;
// Independent preview shares the exact bundled Three version already in the game.
writeFileSync(resolve(dir,'assets/zombies-v2/three-r160.js'),source+'\n');
const dimensions={normal:[1,1],runner:[.93,.88],tank:[1.42,1.3],bloater:[1.08,1.45],boss:[2.3,1.35]};
function glb(z){
  const doc={asset:{version:'2.0',generator:'Zombie Survival original articulated assets v2'},scene:0,scenes:[{nodes:[0]}],nodes:[],meshes:[],materials:[{name:'Mottled skin and distressed clothing',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:.95}}],bufferViews:[],accessors:[],animations:[],buffers:[{byteLength:0}]};
  const chunks=[];let byteLength=0;const ids=new Map();
  function accessor(data,size,target,minmax=false){
    const bytes=Buffer.from(data.buffer,data.byteOffset,data.byteLength);const pad=(4-bytes.length%4)%4;
    const view=doc.bufferViews.push({buffer:0,byteOffset:byteLength,byteLength:bytes.length,...(target?{target}:{})})-1;
    chunks.push(bytes,Buffer.alloc(pad));byteLength+=bytes.length+pad;
    const a={bufferView:view,componentType:data instanceof Uint32Array?5125:5126,count:data.length/size,type:{1:'SCALAR',3:'VEC3',4:'VEC4'}[size]};
    if(minmax){a.min=Array(size).fill(Infinity);a.max=Array(size).fill(-Infinity);for(let i=0;i<data.length;i++){const j=i%size;a.min[j]=Math.min(a.min[j],data[i]);a.max[j]=Math.max(a.max[j],data[i]);}}
    return doc.accessors.push(a)-1;
  }
  function add(o){if(!o.visible||o===z.blob)return null;const i=doc.nodes.length;ids.set(o,i);
    const n={name:o.name||'joint',translation:o.position.toArray(),rotation:o.quaternion.toArray(),scale:o.scale.toArray()};doc.nodes.push(n);
    if(o.isMesh){
      const g=o.geometry,unique=new Map(),p=[],norm=[],col=[],indices=[];
      for(let v=0;v<g.attributes.position.count;v++){
        const values=[...g.attributes.position.array.subarray(v*3,v*3+3),...g.attributes.normal.array.subarray(v*3,v*3+3),...g.attributes.color.array.subarray(v*3,v*3+3)];
        const key=values.map(x=>x.toFixed(5)).join(',');let idx=unique.get(key);
        if(idx===undefined){idx=unique.size;unique.set(key,idx);p.push(...values.slice(0,3));norm.push(...values.slice(3,6));col.push(...values.slice(6,9));}indices.push(idx);
      }
      n.mesh=doc.meshes.push({name:o.name,primitives:[{attributes:{POSITION:accessor(new Float32Array(p),3,34962,true),NORMAL:accessor(new Float32Array(norm),3,34962),COLOR_0:accessor(new Float32Array(col),3,34962)},indices:accessor(new Uint32Array(indices),1,34963),material:0,mode:4}]})-1;
    }
    const children=o.children.map(add).filter(v=>v!==null);if(children.length)n.children=children;return i;
  }
  z.g.visible=true;z.g.position.set(0,0,0);Z.reset(z);add(z.g);
  for(const [name,duration] of [['Walk',1.2],['Attack',1.1],['Death',1.2],['Crawl',1.5]]){
    Z.reset(z);z.state=name==='Attack'?'atk':'walk';z.crawl=name==='Crawl'?1:0;z.crawlT=2;z.moveV2=1;
    const frames=Math.ceil(duration*30)+1,times=new Float32Array(frames);const tracks=new Map();
    for(const o of [z.body,z.hips,...Z.joints.map(j=>z[j])])tracks.set(o,{r:new Float32Array(frames*4),p:new Float32Array(frames*3)});
    for(let f=0;f<frames;f++){const t=duration*f/(frames-1);times[f]=t;z.phase=t/duration*Math.PI*2;z.atkT=t;
      if(name==='Death')Z.deathPose(z,t,1);else Z.pose(z,t);
      if(name==='Death'||name==='Crawl'){
        z.body.position.y=0;const low=Z.minY(T,z.body);
        z.body.position.y=Math.max(0,(.024-low)/(z.V.scale||1));
      }
      z.g.updateMatrixWorld(true);
      for(const [o,a] of tracks){o.quaternion.toArray(a.r,f*4);o.position.toArray(a.p,f*3);}
    }
    const input=accessor(times,1,undefined,true),animation={name,samplers:[],channels:[]};
    for(const [o,a] of tracks)for(const [path,data,size] of [['rotation',a.r,4],['translation',a.p,3]]){
      const sampler=animation.samplers.push({input,output:accessor(data,size),interpolation:'LINEAR'})-1;
      animation.channels.push({sampler,target:{node:ids.get(o),path}});
    }doc.animations.push(animation);
  }
  doc.buffers[0].byteLength=byteLength;const bin=Buffer.concat(chunks);
  const raw=Buffer.from(JSON.stringify(doc)),json=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]);
  const out=Buffer.alloc(12+8+json.length+8+bin.length);out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
  out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);
  const b=20+json.length;out.writeUInt32LE(bin.length,b);out.writeUInt32LE(0x004e4942,b+4);bin.copy(out,b+8);return out;
}
mkdirSync(resolve(dir,'assets/zombies-v2/models'),{recursive:true});
const catalog=[];
for(const [name,p] of Object.entries(Z.profiles)){
  const [scale,width]=dimensions[name],V={...p,name,scale,width,eyes:name==='bloater'?0x9aa955:name==='runner'?0xc09b63:0xb48768,heavy:name==='tank'||name==='boss'};
  const z=Z.create(T,V,60007),data=glb(z),path=`assets/zombies-v2/models/${name}.glb`;
  writeFileSync(resolve(dir,path),data);catalog.push({id:name,...p,model:path,animations:['Walk','Attack','Death','Crawl'],sizeBytes:data.length});
  console.log(`${name}: ${(data.length/1024).toFixed(0)} KB`);
}
writeFileSync(resolve(dir,'assets/zombies-v2/catalog.json'),JSON.stringify({version:'4.3.60',models:catalog},null,2)+'\n');
