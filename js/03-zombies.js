/* Zombie Survival 4.3.97 — zombies rebuilt.
   Shared low-poly parts (head, torso, arms, legs), one Lambert material,
   one InstancedMesh per part. Pools for gibs, stump blood and stains.
   No object creation during play. Quality follows GFX43 (bassa / media / alta)
   and drops one step if the frame rate stays low. */
'use strict';
window.__z497 = true;
const VARIANTS = {
  normal: { name: 'normal', hp: 80, speed: [1.15, 1.6], dmg: 10, scale: 1, width: 1, reach: 1.45, pitch: 1, stagger: 1, skin: [.24, .3], eyes: 0xff3010, anim: 3, score: 100 },
  runner: { name: 'runner', hp: 55, speed: [3.2, 3.8], dmg: 7, scale: .93, width: .88, reach: 1.4, pitch: 1.35, stagger: 1.2, skin: [.18, .25], eyes: 0xffe020, anim: 2.4, score: 125 },
  tank: { name: 'tank', hp: 340, speed: [.9, 1.05], dmg: 24, scale: 1.42, width: 1.3, reach: 1.95, pitch: .6, stagger: .35, skin: [.3, .36], eyes: 0xff7010, anim: 3.4, heavy: true, score: 300 },
  bloater: { name: 'bloater', hp: 120, speed: [.95, 1.15], dmg: 0, scale: 1.08, width: 1.45, reach: 1.9, pitch: .8, stagger: .5, skin: [.2, .26], eyes: 0x9aff20, anim: 3, special: true, score: 150 },
  boss: { name: 'boss', hp: 2400, speed: [1.25, 1.35], dmg: 30, scale: 2.3, width: 1.35, reach: 1.75, pitch: .45, stagger: .08, skin: [0, .05], eyes: 0xff2a10, anim: 3.4, heavy: true, special: true, score: 2500 },
  ghigno: { name: 'ghigno', hp: 620, speed: [2.25, 2.6], dmg: 20, scale: 1.1, width: 1, reach: 1.6, pitch: .92, stagger: .3, skin: [.3, .34], eyes: 0xff1a12, anim: 2.7, special: true, score: 900 }
};
/* Geometries the older detail hooks still look up. They are not drawn. */
const ZG = {};
(function () {
  const b = (w, h, d) => new T.BoxGeometry(w, h, d);
  ZG.pelvis = b(.42, .2, .25); ZG.thigh = b(.17, .46, .19); ZG.shin = b(.15, .44, .16); ZG.foot = b(.16, .08, .27);
  ZG.torso = b(.5, .62, .28); ZG.belly = b(.3, .16, .04); ZG.rib = b(.12, .05, .03); ZG.upper = b(.13, .36, .13); ZG.fore = b(.11, .34, .11);
  ZG.hand = b(.12, .1, .14); ZG.finger = b(.03, .09, .03); ZG.head = b(.32, .3, .32); ZG.scalp = b(.33, .07, .25); ZG.brow = b(.3, .05, .06);
  ZG.eye = b(.07, .045, .02); ZG.jaw = b(.26, .08, .22); ZG.teeth = b(.2, .03, .02); ZG.mouth = b(.24, .08, .02); ZG.ear = b(.04, .08, .06);
  ZG.rag = b(.2, .18, .02); ZG.blob = new T.CircleGeometry(.5, 10); ZG.sock = b(.1, .075, .02); ZG.nose = b(.05, .075, .05); ZG.tuft = b(.06, .05, .08); ZG.hem = b(.09, .12, .02);
  ZG.hat476 = new T.CylinderGeometry(.5, .5, 1, 8); ZG.brim476 = new T.CylinderGeometry(.5, .5, 1, 8);
})();
function mergePieces(list) {
  let n = 0;
  const geos = list.map(it => {
    const g = it[0].index ? it[0].toNonIndexed() : it[0].clone();
    _e.set(it[3] || 0, it[4] || 0, it[5] || 0); _qq.setFromEuler(_e);
    _pp.set(it[2][0], it[2][1], it[2][2]); _s.set(it[6] || 1, it[7] || 1, it[8] || 1);
    _m4.compose(_pp, _qq, _s); g.applyMatrix4(_m4); n += g.attributes.position.count; return [g, it[1]];
  });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0; const c = new T.Color();
  for (const [g, cc] of geos) {
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); c.copy(cc);
    const cnt = g.attributes.position.count;
    for (let i = 0; i < cnt; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
    o += cnt; g.dispose();
  }
  const out = new T.BufferGeometry();
  out.setAttribute('position', new T.BufferAttribute(pos, 3));
  out.setAttribute('normal', new T.BufferAttribute(nor, 3));
  out.setAttribute('color', new T.BufferAttribute(col, 3));
  out.computeBoundingSphere(); return out;
}
function z432Mat(m) { return m; }
const _m4 = new T.Matrix4(), _e = new T.Euler(), _s = new T.Vector3(), _pp = new T.Vector3(), _qq = new T.Quaternion();
const _mw = new T.Matrix4(), _scv = new T.Vector3(), _col = new T.Color(), _ge = new T.Euler();
const zombies = [], zHitMeshes = [];
const Z497 = { bias: 0, q: 'media', batches: [], gib: [], stain: [], lowT: 0, hiT: 0 };
const bodyMat = new T.MeshLambertMaterial({ vertexColors: true });
const eyeMat497 = new T.MeshBasicMaterial({ color: 0xffffff, fog: true });
const hitMat497 = new T.MeshBasicMaterial({ color: 0xff0000, depthWrite: false });
const RED497 = new T.Color(0xff220c);
const WOUND = 0x6a1010, BONE = 0xd8d0b4, HAIR = 0x1a1614, MOUTH = 0x140606, SHOE = 0x16161a, TEETH = 0xf2ecdc;
let blobTex497 = null;
function blobMap497() {
  if (blobTex497) return blobTex497;
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(.45, 'rgba(0,0,0,.16)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  blobTex497 = new T.CanvasTexture(c); return blobTex497;
}
const blobMat497 = new T.MeshBasicMaterial({ map: blobMap497(), transparent: true, opacity: .8, depthWrite: false });
function z497Q() {
  let q = (typeof GFX43 !== 'undefined' && GFX43.q) || Z497.q || 'media';
  if (Z497.bias < 0) { if (q === 'alta') q = 'media'; else if (q === 'media') q = 'bassa'; }
  Z497.q = q; return q;
}
function z497Cap() { const q = z497Q(); return q === 'bassa' ? 4 : q === 'alta' ? 16 : 9; }
function z497StainCap() { const q = z497Q(); return q === 'bassa' ? 10 : q === 'alta' ? 40 : 22; }
function fuse497(list) {
  const geos = []; let n = 0;
  for (const it of list) {
    const seg = it.seg || 1;
    let g = new T.BoxGeometry(it.w, it.h, it.d, seg, Math.min(seg + 1, 3), seg);
    if (it.rnd) {
      const p = g.attributes.position, hx = it.w / 2, hy = it.h / 2, hz = it.d / 2, v = new T.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const ux = hx ? v.x / hx : 0, uy = hy ? v.y / hy : 0, uz = hz ? v.z / hz : 0;
        const l = Math.hypot(ux, uy, uz) || 1, m = Math.max(Math.abs(ux), Math.abs(uy), Math.abs(uz)) / l;
        const f = 1 - it.rnd + it.rnd * m; p.setXYZ(i, v.x * f, v.y * f, v.z * f);
      }
      g.computeVertexNormals();
    }
    g = g.toNonIndexed();
    _e.set(it.rx || 0, it.ry || 0, it.rz || 0); _qq.setFromEuler(_e);
    _pp.set(it.x || 0, it.y || 0, it.z || 0); _s.set(it.sx || 1, it.sy || 1, it.sz || 1);
    _m4.compose(_pp, _qq, _s); g.applyMatrix4(_m4);
    const c = new T.Color(it.col == null ? 0xffffff : it.col);
    const col = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < g.attributes.position.count; i++) {
      const sh = .86 + ((i * 17) % 9) * .02;
      col[i * 3] = Math.min(1, c.r * sh); col[i * 3 + 1] = Math.min(1, c.g * sh); col[i * 3 + 2] = Math.min(1, c.b * sh);
    }
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    n += g.attributes.position.count; geos.push(g);
  }
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  for (const g of geos) {
    const c = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3);
    o += c; g.dispose();
  }
  const out = new T.BufferGeometry();
  out.setAttribute('position', new T.BufferAttribute(pos, 3));
  out.setAttribute('normal', new T.BufferAttribute(nor, 3));
  out.setAttribute('color', new T.BufferAttribute(col, 3));
  out.computeBoundingSphere(); return out;
}
function batch497(geo, mat, n) {
  const m = new T.InstancedMesh(geo, mat, n);
  m.count = n; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  m.instanceMatrix.setUsage(T.DynamicDrawUsage);
  m.instanceColor = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  for (let i = 0; i < n; i++) m.setMatrixAt(i, ZERO);
  scene.add(m);
  const b = { m: m, n: n }; Z497.batches.push(b); return b;
}
function put497(mesh, id, node, sx, sy, sz) {
  if (!node) { mesh.setMatrixAt(id, ZERO); return; }
  node.updateWorldMatrix(true, false);
  _mw.copy(node.matrixWorld);
  if (sx) { _scv.set(sx, sy || sx, sz || sx); _mw.scale(_scv); }
  mesh.setMatrixAt(id, _mw);
}
const GEO = {};
GEO.pelvis = fuse497([
  { w: .46, h: .2, d: .26, y: 0, col: 0xffffff, rnd: .3, seg: 1 },
  { w: .16, h: .08, d: .12, x: -.13, y: -.02, col: 0xffffff },
  { w: .16, h: .08, d: .12, x: .13, y: -.02, col: 0xffffff }
]);
GEO.thigh = fuse497([{ w: .18, h: .5, d: .2, y: -.25, col: 0xffffff, rnd: .38, seg: 1 }]);
GEO.shin = fuse497([
  { w: .15, h: .44, d: .16, y: -.22, col: 0xffffff, rnd: .34, seg: 1 },
  { w: .18, h: .08, d: .3, y: -.46, z: .05, col: SHOE, rnd: .18 },
  { w: .1, h: .1, d: .06, y: -.06, z: .08, col: WOUND }
]);
GEO.torso = fuse497([
  { w: .5, h: .58, d: .28, y: .32, col: 0xffffff, rnd: .22, seg: 2 },
  { w: .2, h: .1, d: .08, y: .62, col: 0xffffff, rnd: .2 },
  { w: .14, h: .14, d: .04, y: .18, z: .15, col: 0x8a8278 },
  { w: .2, h: .06, d: .03, y: .05, z: .14, col: 0x6e665e }
]);
GEO.upper = fuse497([
  { w: .15, h: .38, d: .15, y: -.19, col: 0xffffff, rnd: .42, seg: 1 },
  { w: .08, h: .08, d: .04, y: -.24, z: .07, col: WOUND }
]);
GEO.fore = fuse497([
  { w: .12, h: .34, d: .12, y: -.17, col: 0xffffff, rnd: .4, seg: 1 },
  { w: .15, h: .1, d: .08, y: -.36, col: 0xffffff, rnd: .28 },
  { w: .032, h: .1, d: .03, x: -.045, y: -.44, z: .02, col: 0xffffff },
  { w: .032, h: .12, d: .03, y: -.45, z: .02, col: 0xffffff },
  { w: .032, h: .1, d: .03, x: .045, y: -.44, z: .02, col: 0xffffff }
]);
GEO.head = fuse497([
  { w: .3, h: .32, d: .28, y: .18, col: 0xffffff, rnd: .32, seg: 2 },
  { w: .32, h: .08, d: .26, y: .32, z: -.02, col: HAIR, rnd: .12 },
  { w: .26, h: .045, d: .06, y: .24, z: .13, col: 0xddd6cc },
  { w: .06, h: .08, d: .04, x: -.16, y: .16, col: 0xffffff },
  { w: .06, h: .08, d: .04, x: .16, y: .16, col: 0xffffff },
  { w: .05, h: .07, d: .06, y: .14, z: .15, col: 0xffffff },
  { w: .16, h: .05, d: .02, y: .07, z: .15, col: MOUTH }
]);
GEO.jaw = fuse497([
  { w: .26, h: .1, d: .22, y: -.02, z: .02, col: 0xffffff, rnd: .3 },
  { w: .16, h: .03, d: .02, y: .02, z: .12, col: TEETH }
]);
GEO.eyes = fuse497([
  { w: .07, h: .045, d: .02, x: -.075, y: .22, z: .175, col: 0xffffff },
  { w: .07, h: .045, d: .02, x: .075, y: .22, z: .175, col: 0xffffff }
]);
GEO.hat = fuse497([
  { w: .5, h: .03, d: .5, y: .36, col: 0x0e0c10 },
  { w: .28, h: .34, d: .28, y: .52, col: 0x0e0c10, rnd: .1 },
  { w: .3, h: .04, d: .3, y: .38, col: 0x4a0c14 }
]);
GEO.wound = fuse497([
  { w: .14, h: .12, d: .03, y: .28, z: .17, col: WOUND },
  { w: .06, h: .16, d: .02, y: .44, z: .17, x: .1, col: 0x3a0606 }
]);
GEO.ribs = fuse497([
  { w: .09, h: .04, d: .03, y: .4, z: .175, x: .12, col: BONE },
  { w: .09, h: .04, d: .03, y: .48, z: .175, x: .11, col: BONE },
  { w: .08, h: .04, d: .03, y: .55, z: .165, x: .08, col: BONE }
]);
GEO.belly = fuse497([
  { w: .52, h: .46, d: .44, y: .3, z: .06, col: 0x627e2e, rnd: .42, seg: 2 },
  { w: .22, h: .18, d: .08, y: .34, z: .28, col: 0x9ac84a, rnd: .3 }
]);
GEO.spikes = fuse497([
  { w: .08, h: .36, d: .08, x: -.22, y: .72, rz: .5, col: BONE },
  { w: .08, h: .3, d: .08, x: .24, y: .68, rz: -.45, col: BONE },
  { w: .07, h: .26, d: .07, x: -.08, y: .8, rz: .2, col: 0x888070 }
]);
GEO.imp = fuse497([
  { w: .42, h: .5, d: .26, y: .55, col: 0x6a655c, rnd: .16, seg: 1 },
  { w: .26, h: .22, d: .24, y: 1.05, col: 0x7a756c, rnd: .25 }
]);
GEO.gHead = fuse497([
  { w: .34, h: .32, d: .32, y: .05, col: 0xcbbda6, rnd: .48, seg: 1 },
  { w: .32, h: .08, d: .28, y: .2, col: HAIR },
  { w: .18, h: .05, d: .02, y: -.06, z: .16, col: MOUTH }
]);
GEO.gArm = fuse497([
  { w: .14, h: .36, d: .14, y: .08, col: 0x5a4638, rnd: .3 },
  { w: .12, h: .32, d: .12, y: -.26, col: 0xc2b39a, rnd: .3 },
  { w: .13, h: .08, d: .08, y: -.44, col: 0xb0a090 }
]);
GEO.gLeg = fuse497([
  { w: .18, h: .46, d: .18, y: .08, col: 0x2a3144, rnd: .25 },
  { w: .15, h: .4, d: .15, y: -.34, col: 0xc2b39a },
  { w: .17, h: .08, d: .28, y: -.56, col: SHOE }
]);
GEO.stump = fuse497([
  { w: .16, h: .07, d: .16, col: WOUND, rnd: .2 },
  { w: .07, h: .04, d: .07, y: .03, col: 0x2a0404 }
]);
const HBG = { head: new T.BoxGeometry(.36, .36, .36), body: new T.BoxGeometry(.52, .68, .36), arm: new T.BoxGeometry(.22, .8, .22), leg: new T.BoxGeometry(.26, .96, .26) };
HBG.head.translate(0, .18, 0); HBG.body.translate(0, .34, 0); HBG.arm.translate(0, -.38, 0); HBG.leg.translate(0, -.44, 0);
const N497 = 64;
const B497 = {
  pelvis: batch497(GEO.pelvis, bodyMat, N497),
  thigh: batch497(GEO.thigh, bodyMat, N497 * 2),
  shin: batch497(GEO.shin, bodyMat, N497 * 2),
  torso: batch497(GEO.torso, bodyMat, N497),
  upper: batch497(GEO.upper, bodyMat, N497 * 2),
  fore: batch497(GEO.fore, bodyMat, N497 * 2),
  head: batch497(GEO.head, bodyMat, N497),
  jaw: batch497(GEO.jaw, bodyMat, N497),
  eyes: batch497(GEO.eyes, eyeMat497, N497),
  hat: batch497(GEO.hat, bodyMat, 8),
  wound: batch497(GEO.wound, bodyMat, N497),
  ribs: batch497(GEO.ribs, bodyMat, N497),
  belly: batch497(GEO.belly, bodyMat, 6),
  spikes: batch497(GEO.spikes, bodyMat, 4),
  imp: batch497(GEO.imp, bodyMat, N497),
  blob: batch497((function () { const g = new T.CircleGeometry(.55, 12); g.rotateX(-Math.PI / 2); return g; })(), blobMat497, N497),
  gHead: batch497(GEO.gHead, bodyMat, 12),
  gArm: batch497(GEO.gArm, bodyMat, 16),
  gLeg: batch497(GEO.gLeg, bodyMat, 12),
  stump: batch497(GEO.stump, bodyMat, 24)
};
let hatN = 0, bellyN = 0, spikeN = 0;
function gibPool(type, batch, n) {
  for (let i = 0; i < n; i++) Z497.gib.push({ on: 0, type: type, batch: batch, id: i, p: new T.Vector3(), v: new T.Vector3(), rx: 0, ry: 0, rz: 0, sx: 0, sy: 0, sz: 0, age: 0, life: 3, sc: 1 });
}
gibPool('head', B497.gHead, 12); gibPool('arm', B497.gArm, 16); gibPool('leg', B497.gLeg, 12);
const stumpFree = []; for (let i = 0; i < 24; i++) stumpFree.push(i);
for (let i = 0; i < 40; i++) Z497.stain.push(null);
function P(parent, x, y, z) { const g = new T.Group(); g.position.set(x, y, z); parent.add(g); return g; }
function hit497(parent, geo, part, slot, z) {
  const m = new T.Mesh(geo, hitMat497);
  m.userData.z = z; m.userData.part = part; if (slot) m.userData.slot = slot;
  m.layers.set(2); m.castShadow = false; m.frustumCulled = false; m.visible = true;
  parent.add(m); zHitMeshes.push(m); z.hits.push(m); return m;
}
function part497(z, batch, id, node, col, slot, sx, sy, sz, detail) {
  const rec = { batch: batch, id: id, node: node, col: new T.Color(col), slot: slot || '', sx: sx || 1, sy: sy || sx || 1, sz: sz || sx || 1, detail: !!detail };
  z.parts.push(rec); batch.m.setColorAt(id, rec.col); return rec;
}
function makeZombie(vName) {
  const V = VARIANTS[vName]; const i = zombies.length; if (i >= N497) return null;
  const z = { V, g: new T.Group(), alive: false, dead: false, seed: Math.random() * 100, z497: 1, parts: [], hits: [], i497: i, stumps: [] };
  z.mat = new T.MeshLambertMaterial({ color: 0x88786a }); z.baseEm = 0;
  const nm = V.name, GH = nm === 'ghigno', run = nm === 'runner', tank = nm === 'tank', bl = nm === 'bloater', boss = nm === 'boss';
  let skin = 0xb7a890, shirt = 0x5c4636, pants = 0x2c3348, eye = V.eyes;
  if (run) { skin = 0x9aa888; shirt = 0x3e342c; pants = 0x241e18; }
  else if (tank) { skin = 0x8e8a78; shirt = 0x3a3a30; pants = 0x2a2a26; }
  else if (bl) { skin = 0x7f8a58; shirt = 0x5a6a30; pants = 0x2a3320; z.baseEm = 0x1c3a06; }
  else if (boss) { skin = 0x6a6460; shirt = 0x3a1412; pants = 0x1a1616; z.baseEm = 0x200000; }
  else if (GH) { skin = 0xd4cbb8; shirt = 0x9a1018; pants = 0x161018; }
  else { const shirts = [0x5a4638, 0x6a3430, 0x314838, 0x3c3c58, 0x6a5a3a, 0x4a3a3a]; shirt = shirts[(Math.random() * shirts.length) | 0]; if (Math.random() < .35) skin = 0x8d9a7c; }
  const W = V.width || 1, bx = run ? .86 : tank ? 1.2 : bl ? 1.28 : boss ? 1.12 : GH ? 1 : 1, bz = run ? .88 : tank ? 1.18 : bl ? 1.32 : 1;
  z.body = P(z.g, 0, 0, 0); z.hips = P(z.body, 0, .95, 0);
  part497(z, B497.pelvis, i, z.hips, pants, '', W * bx, 1, bz);
  const leg = (side, idx) => {
    const hip = P(z.hips, side * .13 * W * bx, -.04, 0);
    part497(z, B497.thigh, idx, hip, pants, side < 0 ? 'legL' : 'legR', run ? .86 : tank ? 1.25 : 1, 1, tank ? 1.2 : 1);
    const knee = P(hip, 0, -.48, 0);
    part497(z, B497.shin, idx, knee, skin, side < 0 ? 'legL' : 'legR', run ? .84 : tank ? 1.2 : 1, run ? 1.06 : 1, 1);
    hit497(hip, HBG.leg, 'limb', side < 0 ? 'legL' : 'legR', z);
    return [hip, knee];
  };
  [z.hipL, z.kneeL] = leg(-1, i); [z.hipR, z.kneeR] = leg(1, i + N497);
  z.spine = P(z.hips, 0, .08, 0);
  part497(z, B497.torso, i, z.spine, shirt, '', W * bx, boss ? 1.08 : 1, bz * (boss ? 1.05 : 1));
  hit497(z.spine, HBG.body, 'body', '', z);
  part497(z, B497.wound, i, z.spine, WOUND, '', 1, 1, 1, true);
  part497(z, B497.ribs, i, z.spine, BONE, '', 1, 1, 1, true);
  const arm = (side, idx) => {
    const sh = P(z.spine, side * (.3 * W * bx), .52, 0);
    part497(z, B497.upper, idx, sh, Math.random() < .4 ? skin : shirt, side < 0 ? 'armL' : 'armR', run ? .82 : tank ? 1.28 : 1, 1, tank ? 1.22 : 1);
    const el = P(sh, 0, -.36, 0);
    part497(z, B497.fore, idx, el, skin, side < 0 ? 'armL' : 'armR', run ? .8 : tank ? 1.22 : 1, 1, 1);
    hit497(sh, HBG.arm, 'limb', side < 0 ? 'armL' : 'armR', z);
    return [sh, el];
  };
  [z.shL, z.elL] = arm(-1, i); [z.shR, z.elR] = arm(1, i + N497);
  z.neck = P(z.spine, 0, .64, .02);
  part497(z, B497.head, i, z.neck, skin, 'head', 1, 1, 1);
  hit497(z.neck, HBG.head, 'head', 'head', z);
  part497(z, B497.eyes, i, z.neck, eye, 'head', 1, 1, 1);
  z.jaw = P(z.neck, 0, .06, .04); part497(z, B497.jaw, i, z.jaw, skin, 'head', 1, 1, 1);
  if (GH && hatN < 8) { part497(z, B497.hat, hatN, z.neck, 0x100e12, 'head', 1, 1, 1); z.hatId = hatN; hatN++; }
  if (bl && bellyN < 6) { part497(z, B497.belly, bellyN, z.spine, 0x6a8a32, '', 1.05, 1, 1); z.bellyId = bellyN; bellyN++; }
  if (boss && spikeN < 4) { part497(z, B497.spikes, spikeN, z.spine, BONE, '', 1, 1, 1); z.spikeId = spikeN; spikeN++; }
  part497(z, B497.imp, i, z.body, GH ? 0x6a1818 : bl ? 0x4a5a28 : boss ? 0x3a1816 : shirt, '', 1, 1, 1);
  z.blob = new T.Object3D(); z.blob.visible = true; z.g.add(z.blob);
  z.g.scale.setScalar(V.scale);
  scene.add(z.g); z.g.visible = false; zombies.push(z); return z;
}
for (let i = 0; i < 7; i++) makeZombie('normal'); for (let i = 0; i < 5; i++) makeZombie('runner'); for (let i = 0; i < 3; i++) makeZombie('tank'); for (let i = 0; i < 3; i++) makeZombie('bloater'); makeZombie('boss');
for (let i = 0; i < 12; i++) makeZombie('normal'); for (let i = 0; i < 4; i++) makeZombie('runner');
for (let i = 0; i < 9; i++) makeZombie('normal'); for (let i = 0; i < 3; i++) makeZombie('runner'); for (let i = 0; i < 2; i++) makeZombie('ghigno');
for (const b of Z497.batches) if (b.m.instanceColor) b.m.instanceColor.needsUpdate = true;
function z497Reset(z) {
  z.gore = null; z._cut = null; z.legGone = 0; z.crawl = 0; z.drip = 0; z._lod = -1; z._flashOn = 0; z.f497 = null;
  if (z.neck) z.neck.visible = true; if (z.blob) z.blob.visible = true;
  for (const h of z.hits) h.visible = true;
  for (const s of z.stumps || []) { s.on = 0; if (s.id != null && stumpFree.indexOf(s.id) < 0) { B497.stump.m.setMatrixAt(s.id, ZERO); stumpFree.push(s.id); } }
  z.stumps = [];
}
function resetPose(z) {
  z.body.rotation.set(0, 0, 0); z.body.position.set(0, 0, 0); z.hips.position.y = .95; z.hips.rotation.set(0, 0, 0);
  for (const k of ['hipL', 'hipR', 'kneeL', 'kneeR', 'spine', 'shL', 'shR', 'elL', 'elR', 'neck', 'jaw']) if (z[k]) z[k].rotation.set(0, 0, 0);
  z497Reset(z);
}
function spawnZombie(vName) {
  let z = zombies.find(q => !q.alive && q.V.name === vName);
  if (!z && vName !== 'boss') z = zombies.find(q => !q.alive && q.V.name === 'normal') || zombies.find(q => !q.alive && !q.V.special);
  if (!z) return false;
  let x, zz; { const sp = SPAWN_AT || svSpawnPos(20, 30, player.pos.x, player.pos.z) || { x: clamp(player.pos.x + 24, -HALF + 2, HALF - 2), z: player.pos.z }; x = sp.x; zz = sp.z; } LAST_Z = z;
  const V = z.V, wm = 1 + Math.min(.5, (game.wave - 1) * .07);
  Object.assign(z, { alive: true, dead: false, hp: V.hp * (V.name === 'boss' ? 1 + (game.wave / 5 - 1) * .6 : 1 + (game.wave - 1) * .15) * DIFF().hp, speed: rand(V.speed[0], V.speed[1]) * (V.name === 'boss' ? 1 : wm) * DIFF().spd, state: 'walk', atkT: 0, atkHit: false, cool: 0, stag: 0, stagHead: 0, flash: 0, deadT: 0, groanT: rand(1, 4), phase: Math.random() * 6, stuck: 0, side: 0, sideT: 0, limp: V.name == 'normal' && Math.random() < .5 ? rand(.3, .6) : 0 });
  z.maxHp = z.hp; z.g.position.set(x, 0, zz); resetPose(z); z.blob.visible = true; z.g.visible = true;
  try { z.mat.emissive.setHex(z.baseEm || 0); } catch (e) {}
  spawnExtra(z); try { z497Sync(z); } catch (e) {} return true;
}
function sm01(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
function z497Pose(z, t, amp) {
  const V = z.V, ph = z.phase || 0, g = z.gore || {}, a = Math.max(0, Math.min(1, amp));
  const s = Math.sin(ph), c = Math.cos(ph), run = V.name === 'runner', big = !!V.heavy, idle = a < .18;
  if (z.crawl) {
    const pull = Math.sin(ph), reach = Math.max(0, Math.cos(ph));
    z.hips.position.y = .34 + Math.abs(pull) * .04; z.hips.rotation.set(1.15 + reach * .08, pull * .06, (g.legL ? .08 : 0) - (g.legR ? .08 : 0));
    z.spine.rotation.set(.18 + reach * .1, -pull * .1, pull * .04 + (z.turn439 || 0) * .2);
    if (!g.armL) { z.shL.rotation.set(-1.6 + pull * .7, .08, .2); z.elL.rotation.x = -.7 - reach * .3; }
    if (!g.armR) { z.shR.rotation.set(-1.6 - pull * .7, -.08, -.18); z.elR.rotation.x = -.65 - reach * .28; }
    if (!g.legL) { z.hipL.rotation.set(.35, 0, 0); z.kneeL.rotation.x = .8; }
    if (!g.legR) { z.hipR.rotation.set(.35, 0, 0); z.kneeR.rotation.x = .8; }
    if (z.neck && !g.head) z.neck.rotation.set(-.65, Math.sin(t * .6 + z.seed) * .08, 0);
    if (z.jaw && !g.head) z.jaw.rotation.x = .26 + Math.max(0, Math.sin(t * 2.2 + z.seed)) * .3;
    return;
  }
  const limp = Math.min(1, z.limp || 0);
  const swing = run ? .82 : (big ? .42 : .6), lift = run ? 1.15 : (big ? .62 : .92), arm = run ? .5 : (big ? .24 : .3);
  const bob = Math.abs(Math.sin(ph * 2));
  if (!g.legL) { z.hipL.rotation.set(s * swing * a * (1 - limp * .55), .02, .04); z.kneeL.rotation.x = idle ? .16 : (.12 + Math.max(0, c) * lift * a * (1 - limp * .35)); }
  if (!g.legR) { const drag = limp > .4 ? .55 : 1; z.hipR.rotation.set(-s * swing * a * drag, -.02, -.04); z.kneeR.rotation.x = idle ? .16 : (.12 + Math.max(0, -c) * lift * a * drag); }
  z.hips.position.y = (run ? .9 : (big ? .93 : .95)) - limp * .05 + bob * (run ? .05 : .035) * a + Math.sin(t * 1.5 + z.seed) * (idle ? .012 : .004);
  z.hips.rotation.set(run ? .08 : .02, s * .08 * a, Math.cos(ph) * .06 * a + (g.legL ? .16 : (g.legR ? -.16 : limp * .08)));
  const hunch = run ? .36 : (big ? .16 : V.name === 'ghigno' ? .12 : .24);
  z.spine.rotation.set(hunch + Math.sin(ph * 2) * .03 * a + Math.sin(t * 1.4 + z.seed) * .03, -s * (run ? .12 : .08) * a, Math.sin(ph + z.seed) * .05 * a - limp * .1);
  const base = run ? -1.02 : (big ? -.7 : -1.15);
  if (!g.armL) { z.shL.rotation.set(base + (-s) * arm * a + Math.sin(t * 1.3 + z.seed) * .04, .04, .14); z.elL.rotation.x = (idle ? -.4 : -.52) - Math.max(0, -s) * (run ? .28 : .16) * a; }
  if (!g.armR) { z.shR.rotation.set(base + (s) * arm * a + Math.sin(t * 1.1 + z.seed) * .04, -.04, -.14); z.elR.rotation.x = (idle ? -.36 : -.48) - Math.max(0, s) * (run ? .26 : .14) * a; }
  if (z.neck && !g.head) z.neck.rotation.set(-hunch * .5 + Math.sin(t * .8 + z.seed) * .05 - (z.stagHead || 0) * .6, Math.sin(t * .5 + z.seed) * .08, -s * .04 * a);
  if (z.jaw && !g.head) z.jaw.rotation.x = .08 + Math.max(0, Math.sin(t * (idle ? 1.6 : 2.4) + z.seed)) * (idle ? .16 : .32);
  if (z.stag > 0 && z.state !== 'atk') { const k = Math.min(1, z.stag / .3); z.spine.rotation.x -= k * .7; if (!g.armL) z.shL.rotation.x += k * .5; if (!g.armR) z.shR.rotation.x += k * .4; }
}
function z497Attack(z, dt, t, d, sc, canAttack) {
  const V = z.V, g = z.gore || {};
  if (z.crawl) {
    const Wd = .4, S = .18, R = .34; z.atkT += dt; const at = z.atkT, bite = at >= Wd && at < Wd + S, k = bite ? (at - Wd) / S : 0;
    z.hips.position.y = .32; z.hips.rotation.set(bite ? 1 : 1.2, 0, 0); z.spine.rotation.set(bite ? -.16 : .1, 0, 0);
    if (!g.armL) { z.shL.rotation.set(bite ? -1.05 : -2, .1, .28); z.elL.rotation.x = bite ? -.15 : -1.1; }
    if (!g.armR) { z.shR.rotation.set(bite ? -1 : -1.95, -.08, -.24); z.elR.rotation.x = bite ? -.12 : -1; }
    if (z.jaw && !g.head) z.jaw.rotation.x = bite ? .8 : .25;
    if (bite) { const f = 1.1 * dt; z.g.position.x += Math.sin(z.g.rotation.y) * f; z.g.position.z += Math.cos(z.g.rotation.y) * f; if (!z.atkHit && k > .4) { z.atkHit = true; if (canAttack) zAttackHit(z, d, sc); } }
    if (at >= Wd + S + R) { z.state = 'walk'; z.cool = .5; } return;
  }
  const Wd = V.heavy ? .46 : .28, S = .16, R = V.heavy ? .38 : .3; z.atkT += dt; const at = z.atkT; let sp, sh, el, k;
  if (at < Wd) { k = sm01(at / Wd); sp = lerp(.2, -.36, k); sh = lerp(-1.1, -2.4, k); el = lerp(-.4, -1.15, k); }
  else if (at < Wd + S) {
    k = sm01((at - Wd) / S); sp = lerp(-.36, .72, k); sh = lerp(-2.4, -.3, k); el = lerp(-1.15, -.06, k);
    const f = (V.heavy ? 2 : 3.1) * dt; z.g.position.x += Math.sin(z.g.rotation.y) * f; z.g.position.z += Math.cos(z.g.rotation.y) * f;
    if (!z.atkHit && k > .42) { z.atkHit = true; if (canAttack) zAttackHit(z, d, sc); }
  } else { k = sm01(Math.min(1, (at - Wd - S) / R)); sp = lerp(.72, .2, k); sh = lerp(-.3, -1.1, k); el = lerp(-.06, -.4, k); }
  z.spine.rotation.set(sp - (z.stag || 0), 0, 0);
  if (!g.armL) { z.shL.rotation.set(sh, .06, .16); z.elL.rotation.x = el; }
  if (!g.armR) { z.shR.rotation.set(sh * .98, -.05, -.16); z.elR.rotation.x = el; }
  if (!g.legL) { z.hipL.rotation.x = -.22; z.kneeL.rotation.x = .3; }
  if (!g.legR) { z.hipR.rotation.x = .18; z.kneeR.rotation.x = .4; }
  z.hips.position.y = .9; z.hips.rotation.set(.04, 0, 0);
  if (z.neck && !g.head) z.neck.rotation.set(-.3, 0, 0);
  if (z.jaw && !g.head) z.jaw.rotation.x = .55;
  if (at >= Wd + S + R) { z.state = 'walk'; z.cool = V.heavy ? .36 : .2; }
}
const SMJ = ['hipL', 'hipR', 'kneeL', 'kneeR', 'spine', 'shL', 'shR', 'elL', 'elR', 'neck', 'jaw', 'body', 'hips'];
function z497Smooth(z, dt) {
  if (!(dt > 0)) return;
  let f = z.f497;
  if (!f) { f = z.f497 = {}; for (const k of SMJ) if (z[k]) f[k] = z[k].rotation.clone(); f.y = z.hips.position.y; }
  const k = 1 - Math.exp(-dt * (z.state === 'atk' ? 16 : z.dead ? 12 : 14));
  for (const j of SMJ) {
    const o = z[j]; if (!o || !f[j]) continue;
    const r = o.rotation, p = f[j]; p.x += (r.x - p.x) * k; p.y += (r.y - p.y) * k; p.z += (r.z - p.z) * k; r.set(p.x, p.y, p.z);
  }
  f.y += (z.hips.position.y - f.y) * k; z.hips.position.y = f.y;
}
function z497Dead(z, dt) {
  z.deadT += dt; const k = z.deadT, dir = z.fdir || 1, g = z.gore || {}, fl = z.flop || [-1.05, -.75, -.4, -.2, .25];
  const buck = Math.min(1, k / .2), raw = Math.min(1, Math.max(0, (k - .06) / .62)), fall = raw * raw * (3 - 2 * raw);
  if (!g.legL) { z.kneeL.rotation.x = buck * 1.25 * (1 - fall * .7); z.hipL.rotation.x = -buck * .7; }
  if (!g.legR) { z.kneeR.rotation.x = buck * 1.05 * (1 - fall * .65); z.hipR.rotation.x = -buck * .4; }
  z.hips.position.y = .95 - buck * .28 * (1 - fall * .35);
  z.hips.rotation.z = ((g.legL ? 1 : 0) - (g.legR ? 1 : 0)) * .32 * Math.max(buck, fall);
  z.body.rotation.x = dir * (fall * 1.2); z.body.rotation.z = dir * Math.sin(Math.min(k, 1) * 6) * .03 * (1 - fall); z.body.position.y = Math.max(0, fall * .02);
  z.spine.rotation.x = dir * fall * .3;
  const arm = Math.min(1, Math.max(0, (k - .04) / .4));
  if (!g.armL) { z.shL.rotation.set(fl[0] * arm, 0, .48 * arm); z.elL.rotation.x = -.95 * arm; }
  if (!g.armR) { z.shR.rotation.set(fl[1] * arm, 0, -.4 * arm); z.elR.rotation.x = -.8 * arm; }
  if (z.neck && !g.head) { const hd = Math.min(1, Math.max(0, (k - .1) / .35)); z.neck.rotation.set(-dir * .85 * hd, 0, (fl[4] || 0) * hd); }
  if (z.jaw && !g.head) z.jaw.rotation.x = .48 * Math.min(1, k / .3);
  if (z.sv) { z.g.position.addScaledVector(z.sv, dt); z.sv.multiplyScalar(Math.exp(-2.6 * dt)); }
  try { collide(z.g.position, .3); } catch (e) {}
  if (!z.landed && fall > .84) {
    z.landed = true; if (z.sv) z.sv.multiplyScalar(.28);
    try {
      _tmp.set(z.g.position.x + Math.sin(z.g.rotation.y) * dir * .75, .04, z.g.position.z + Math.cos(z.g.rotation.y) * dir * .75);
      emit(_tmp, _up, z497Q() === 'bassa' ? 4 : 8, DUST, { speed: 1.3, spread: .9, life: .5, size: .1, grav: 2 });
      _n.set(0, 1, 0); _tmp.y = .008; addDecal(bloods, _tmp, _n, .85 * (z.V.scale || 1));
    } catch (e) {}
  }
  if (k > 4.5 && z.blob) z.blob.visible = false;
  if (k > 6) { z.alive = false; z.g.visible = false; try { updateHUD(); } catch (e) {} }
}
function z497Lod(z) {
  const q = z497Q();
  const dx = z.g.position.x - camera.position.x, dz = z.g.position.z - camera.position.z, dist = Math.hypot(dx, dz);
  const far = q === 'bassa' ? 12 : q === 'alta' ? 28 : 18, mid = q === 'bassa' ? 22 : q === 'alta' ? 48 : 34;
  return { lod: dist > mid ? 2 : dist > far ? 1 : 0, dist: dist, q: q };
}
function z497Sync(z) {
  if (!z || !z.parts) return;
  if (!z.g.visible || (!z.alive && z.deadT > 6)) {
    if (!z._off497) { for (const p of z.parts) p.batch.m.setMatrixAt(p.id, ZERO); z._off497 = 1; z._lod = -1; B497.blob.m.setMatrixAt(z.i497, ZERO); }
    return;
  }
  z._off497 = 0;
  const L = z497Lod(z), g = z._cut || {}, q = L.q, detail = q !== 'bassa' && L.lod === 0, jaw = L.lod < 2 && !g.head && (q !== 'bassa' || L.dist < 10);
  if (z.flash > 0) z._flashOn = 1;
  else if (z._flashOn) { z._flashOn = 0; for (const p of z.parts) p.batch.m.setColorAt(p.id, p.col); }
  for (const p of z.parts) {
    let hide = false;
    if (p.batch === B497.imp) hide = L.lod < 2;
    else if (p.detail && !detail) hide = true;
    else if (p.slot && g[p.slot]) hide = true;
    else if (p.batch === B497.jaw && !jaw) hide = true;
    else if ((p.batch === B497.eyes || p.batch === B497.fore) && L.lod >= 2) hide = true;
    else if (p.batch === B497.hat && L.lod > 0) hide = true;
    else if ((p.batch === B497.belly || p.batch === B497.spikes) && L.lod > 0) hide = true;
    if (hide) { p.batch.m.setMatrixAt(p.id, ZERO); continue; }
    const node = p.batch === B497.imp ? z.g : p.node;
    put497(p.batch.m, p.id, node, p.sx, p.sy, p.sz);
    if (z._flashOn) { _col.copy(p.col).lerp(RED497, Math.min(1, z.flash * 5)); p.batch.m.setColorAt(p.id, _col); }
  }
  if (z.stumps) {
    for (const s of z.stumps) {
      if (!s.on) continue;
      if (L.lod >= 2) { B497.stump.m.setMatrixAt(s.id, ZERO); continue; }
      put497(B497.stump.m, s.id, s.node, s.sc, s.sc, s.sc);
    }
  }
  if (z.blob && z.blob.visible && (z.alive || (z.dead && z.deadT < 4.5))) {
    const sc = (z.V.width || 1) * (z.V.scale || 1) * (L.lod >= 2 ? 1.45 : 1.2);
    _o.position.set(z.g.position.x, .025, z.g.position.z); _o.rotation.set(0, 0, 0); _o.scale.set(sc, 1, sc); _o.updateMatrix();
    B497.blob.m.setMatrixAt(z.i497, _o.matrix);
  } else B497.blob.m.setMatrixAt(z.i497, ZERO);
  z._lod = L.lod;
}
function z497Flush() {
  for (const b of Z497.batches) {
    b.m.instanceMatrix.needsUpdate = true;
    if (b.m.instanceColor) b.m.instanceColor.needsUpdate = true;
  }
}
function z497Gib(type, node, dir, sc) {
  const cap = z497Cap(); let live = 0;
  for (const g of Z497.gib) if (g.on) live++;
  if (live >= cap) return;
  const g = Z497.gib.find(x => !x.on && x.type === type); if (!g || !node) return;
  node.updateWorldMatrix(true, false); node.getWorldPosition(g.p);
  g.v.set((dir && dir.x || 0) * 1.6 + rand(-.6, .6), 1.4 + rand(0, 1.3), (dir && dir.z || 0) * 1.6 + rand(-.6, .6));
  g.rx = rand(0, 6); g.ry = rand(0, 6); g.rz = rand(0, 6); g.sx = rand(-5, 5); g.sy = rand(-4, 4); g.sz = rand(-5, 5);
  g.age = 0; g.life = z497Q() === 'bassa' ? 2 : 3.2; g.sc = sc || 1; g.on = 1;
}
function z497Stump(z, node, sc) {
  if (!stumpFree.length || !node) return;
  const id = stumpFree.pop(); z.stumps = z.stumps || [];
  z.stumps.push({ on: 1, id: id, node: node, sc: sc || 1 });
}
function z497Sever(z, slot, point, dir) {
  z.gore = z.gore || {}; z._cut = z._cut || {}; if (z._cut[slot]) return;
  z._cut[slot] = 1; z.gore[slot] = 1;
  for (const h of z.hits) if (h.userData.slot === slot) h.visible = false;
  const sc = z.V.scale || 1, q = z497Q();
  if (slot === 'head') { if (z.neck) z.neck.visible = false; z497Gib('head', z.neck, dir, sc); z497Stump(z, z.spine, sc * .85); }
  else if (slot === 'armL' || slot === 'armR') { z497Gib('arm', slot === 'armL' ? z.shL : z.shR, dir, sc); z497Stump(z, slot === 'armL' ? z.shL : z.shR, sc * .65); }
  else if (slot === 'legL' || slot === 'legR') {
    z497Gib('leg', slot === 'legL' ? z.hipL : z.hipR, dir, sc); z497Stump(z, slot === 'legL' ? z.hipL : z.hipR, sc * .8);
    z.legGone = (z.legGone | 0) + 1; z.limp = 1;
    if (z.legGone >= 2) { z.crawl = 1; z.speed = .26; } else z.speed = Math.min(z.speed || .6, .48);
  }
  try {
    const p = point && point.x != null ? point : z.g.position;
    _tmp.set(p.x, (p.y || 1), p.z); const d = dir || _up;
    emit(_tmp, d, q === 'bassa' ? 4 : 10, BLOOD, { speed: 4.2, spread: 1, life: .5, size: .065, grav: 12, up: .4 });
    _n.set(0, 1, 0); _tmp.set(p.x, 0.01, p.z); addDecal(bloods, _tmp, _n, q === 'bassa' ? .55 : .85);
  } catch (e) {}
}
function z497OnHit(z, dmg, part, point, dir, slot) {
  if (!z || !z.z497 || !z.V || z.V.name === 'bloater') return;
  const head = part === 'head' || slot === 'head';
  if (head && !z.dead) { if ((dmg || 0) > 18 || z.hp <= 0) z497Sever(z, 'head', point, dir); return; }
  const limb = slot === 'armL' || slot === 'armR' || slot === 'legL' || slot === 'legR';
  if (!limb) {
    if (z.dead && z497Q() !== 'bassa' && (dmg || 0) > 30 && Math.random() < .3) {
      const s = ['armL', 'armR', 'legL', 'legR'][(Math.random() * 4) | 0]; z497Sever(z, s, point, dir);
    }
    return;
  }
  const q = z497Q();
  if (z.dead || (dmg || 0) >= 55) { z497Sever(z, slot, point, dir); return; }
  const chance = q === 'bassa' ? ((dmg > 42) ? .3 : 0) : Math.min(.8, .22 + (dmg || 10) / 70);
  if (Math.random() < chance) z497Sever(z, slot, point, dir);
}
function z497Stain(i, pos, size) {
  if (!pos || typeof bloods === 'undefined') return;
  const q = z497Q(), cap = z497StainCap();
  if (i >= cap) { bloods.m.setMatrixAt(i, ZERO); return; }
  Z497.stain[i] = { a: 0, x: pos.x, z: pos.z, s: size || .6, rot: Math.random() * 6.28, life: q === 'bassa' ? 3 : q === 'alta' ? 8 : 5.5 };
}
function z497Tick(dt) {
  if (!(dt > 0) || dt > .25) return;
  let fps = 0; try { fps = (window.__DBG && __DBG.data && __DBG.data.fps) || 0; } catch (e) {}
  if (!fps && dt > 0 && dt < .2) fps = 1 / dt;
  if (fps > 8 && fps < 28) { Z497.lowT += dt; Z497.hiT = 0; if (Z497.lowT > 2.6) Z497.bias = -1; }
  else if (fps > 50) { Z497.hiT += dt; Z497.lowT = 0; if (Z497.hiT > 8) Z497.bias = 0; }
  else Z497.lowT = Math.max(0, Z497.lowT - dt);
  const q = z497Q();
  for (const g of Z497.gib) {
    if (!g.on) continue;
    g.age += dt; g.v.y -= 12 * dt; g.p.addScaledVector(g.v, dt); g.rx += g.sx * dt; g.ry += g.sy * dt; g.rz += g.sz * dt;
    if (g.p.y < .05) { g.p.y = .05; g.v.y = Math.abs(g.v.y) * .2; g.v.x *= .55; g.v.z *= .55; g.sx *= .55; g.sz *= .55; }
    let sc = g.sc; if (g.age > g.life * .65) sc *= Math.max(0, 1 - (g.age - g.life * .65) / (g.life * .35));
    if (g.age >= g.life || sc < .02) { g.on = 0; g.batch.m.setMatrixAt(g.id, ZERO); continue; }
    _o.position.copy(g.p); _ge.set(g.rx, g.ry, g.rz); _o.rotation.copy(_ge); _o.scale.set(sc, sc, sc); _o.updateMatrix();
    g.batch.m.setMatrixAt(g.id, _o.matrix);
  }
  let drips = 0, dripMax = q === 'bassa' ? 1 : q === 'alta' ? 5 : 3;
  for (const z of zombies) {
    if (!z.alive || !z._cut || z.dead) continue;
    if (z497Lod(z).lod >= 1) continue;
    z.drip = (z.drip || 0) - dt; if (z.drip > 0 || drips >= dripMax) continue;
    z.drip = q === 'bassa' ? .95 : .45; drips++;
    const slot = z._cut.head ? 'head' : z._cut.armL ? 'armL' : z._cut.armR ? 'armR' : z._cut.legL ? 'legL' : 'legR';
    const node = slot === 'head' ? z.spine : slot === 'armL' ? z.shL : slot === 'armR' ? z.shR : slot === 'legL' ? z.hipL : z.hipR;
    try { node.updateWorldMatrix(true, false); node.getWorldPosition(_tmp); _tmp.y = Math.max(.15, _tmp.y); emit(_tmp, _up, 1, BLOOD, { speed: .6, spread: .3, life: .32, size: .04, grav: 9 }); } catch (e) {}
  }
  const pool = typeof bloods !== 'undefined' ? bloods : null;
  if (pool) {
    let dirty = false;
    for (let i = 0; i < Z497.stain.length; i++) {
      const s = Z497.stain[i]; if (!s) continue; s.a += dt; dirty = true;
      if (s.a >= s.life) { pool.m.setMatrixAt(i, ZERO); Z497.stain[i] = null; continue; }
      const k = s.a > s.life * .55 ? Math.max(0, 1 - (s.a - s.life * .55) / (s.life * .45)) : 1;
      _o.position.set(s.x, .018, s.z); _o.rotation.set(-Math.PI / 2, 0, s.rot); _o.scale.set(s.s * k, s.s * k, 1); _o.updateMatrix();
      pool.m.setMatrixAt(i, _o.matrix);
    }
    if (dirty) pool.m.instanceMatrix.needsUpdate = true;
  }
  z497Flush();
}
function z497Install() {
  if (z497Install.done) return; z497Install.done = 1;
  try { const pw = poseWalk; poseWalk = function (z, t, amp) { if (z && z.z497) { z497Pose(z, t, amp); return; } return pw.apply(this, arguments); }; } catch (e) {}
  try { const ud = updateDead; updateDead = function (z, dt) { if (z && z.z497) { if (z.V && z.V.name === 'bloater') { z.deadT += dt; if (!z.boomed && z.deadT > .1) { try { bloaterBoom(z); } catch (err) {} } return; } return z497Dead(z, dt); } return ud.apply(this, arguments); }; } catch (e) {}
  try { const uz = updateZombie; updateZombie = function (z, dt, t, tg, ok) { const r = uz.apply(this, arguments); if (z && z.z497 && z.g && z.g.visible) { try { if (!z.dead) z497Smooth(z, dt); z497Sync(z); } catch (err) {} } return r; }; } catch (e) {}
  try { const dz = damageZombie; damageZombie = function (z, dmg, part, point, dir, slot) { const r = dz.apply(this, arguments); try { if (z && z.z497) z497OnHit(z, dmg, part, point, dir, slot); } catch (err) {} return r; }; } catch (e) {}
  try { const rp = resetPose; resetPose = function (z) { const r = rp.apply(this, arguments); try { if (z && z.z497) z497Reset(z); } catch (err) {} return r; }; } catch (e) {}
  try { const ad = addDecal; addDecal = function (pool, pos, normal, size) { const i = pool ? pool.i : 0; const r = ad.apply(this, arguments); try { if (typeof bloods !== 'undefined' && pool === bloods) z497Stain(i, pos, size); } catch (err) {} return r; }; } catch (e) {}
  try { if (typeof TICK42 !== 'undefined') TICK42.push(function (dt) { try { z497Tick(dt); } catch (e) {} }); } catch (e) {}
  try { if (typeof ray !== 'undefined' && ray.layers) ray.layers.enable(2); } catch (e) {}
  try { if (typeof gfxOn43 === 'function') gfxOn43(function () { Z497.bias = 0; }); } catch (e) {}
}
setTimeout(z497Install, 0);
addEventListener('load', z497Install);
