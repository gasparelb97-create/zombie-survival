/* New city, independent of the legacy layout. Shared geometry and material batches.
 * All dimensions are metres. This is an opt-in playable preview with separate saves.
 */
(function () {
  'use strict';
  window.buildCityV2 = function (T, env) {
    const root = new T.Group(); root.name = 'Città nuova'; root.userData.cityV2 = true;
    env.scene.add(root);
    let seed = 826103;
    const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const range = (a, b) => a + (b - a) * rnd();
    const box = new T.BoxGeometry(1, 1, 1), plane = new T.PlaneGeometry(1, 1);
    const cyl = new T.CylinderGeometry(.5, .5, 1, 8), sphere = new T.IcosahedronGeometry(.5, 1);
    const cone = new T.ConeGeometry(.5, 1, 8);
    const batches = new Map(), buildings = [], roads = [], entrances = [], landmarks = [], foliage = [], loot = [];
    const roadRects = [], walkRects = [], curbRects = [], centreMarks = [], crosswalkMarks = [];
    const rect = (x, z, w, d) => ({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    let furnitureCount = 0;
    const lightSources = [], smokeSources = [], wrecks = [], damageSites = [];
    const protectedLots = env.protectedLots || [];
    const inside = (x, z, p = 0) => protectedLots.some(b => x > b.x0 - p && x < b.x1 + p && z > b.z0 - p && z < b.z1 + p);
    function texture(draw, size = 512) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      draw(c.getContext('2d'), size);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
      t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = Math.min(4, env.anisotropy || 1); return t;
    }
    function surface(base, type) {
      return texture((g, n) => {
        g.fillStyle = base; g.fillRect(0, 0, n, n);
        for (let i = 0; i < 7000; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.055)' : 'rgba(255,255,230,.085)'; g.fillRect(rnd() * n, rnd() * n, range(1, 5), range(1, 4)); }
        if (type === 'brick') {
          g.strokeStyle = 'rgba(35,29,24,.55)'; g.lineWidth = 4;
          for (let y = 0, row = 0; y < n; y += 32, row++) { g.beginPath(); g.moveTo(0, y); g.lineTo(n, y); g.stroke(); for (let x = (row % 2) * -32; x < n; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
        }
        if (type === 'roof') { g.strokeStyle = 'rgba(30,20,15,.45)'; for (let y = 0; y < n; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(n, y); g.stroke(); } }
        if (type === 'plaster' || type === 'asphalt') {
          for (let i = 0; i < 12; i++) { let x = rnd() * n, y = rnd() * n; g.strokeStyle = 'rgba(31,33,26,.3)'; g.lineWidth = range(1, 3); g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 7; j++) { x += range(-15, 15); y += range(7, 19); g.lineTo(x, y); } g.stroke(); }
        }
        if (type === 'plaster') { for (let i = 0; i < 20; i++) { const x = rnd() * n, y = rnd() * n; const r = range(12, 70); const grad = g.createRadialGradient(x, y, 0, x, y, r); grad.addColorStop(0, 'rgba(49,58,37,.22)'); grad.addColorStop(1, 'rgba(49,58,37,0)'); g.fillStyle = grad; g.fillRect(x - r, y - r, r * 2, r * 2); } }
      });
    }
    const m = {};
    function material(name, color, map) { const v = new T.MeshLambertMaterial({ color, map }); m[name] = v; return v; }
    material('cream', 0xffffff, surface('#aaa18a', 'plaster'));
    material('ochre', 0xffffff, surface('#a48d69', 'plaster'));
    material('sage', 0xffffff, surface('#849080', 'plaster'));
    material('brick', 0xffffff, surface('#79604c', 'brick'));
    material('roof', 0xffffff, surface('#665341', 'roof'));
    material('road', 0xffffff, surface('#434843', 'asphalt'));
    material('walk', 0xffffff, surface('#898b7b', 'brick'));
    material('soil', 0xffffff, surface('#626a4b', 'soil'));
    material('trim', 0xaaa897); material('dark', 0x242d29); material('glass', 0x34474a);
    material('metal', 0x555c52); material('wood', 0x695b42); material('leaf', 0x4c643b);
    material('leaf2', 0x687346); material('trunk', 0x514533); material('mark', 0xb3b1a0);
    material('rust', 0x795542); material('red', 0x823f32); material('blue', 0x4a5d64);
    material('cloth', 0x626b4c); material('stain', 0x66664d); material('bone', 0xb4ae94); material('blood', 0x582b21);
    material('soot', 0x252822); material('ash', 0x69665b); material('engine', 0x303832);
    m.lamp = new T.MeshBasicMaterial({ color: 0xffdb98, toneMapped: false });
    m.headlight = new T.MeshBasicMaterial({ color: 0xfff0bd, toneMapped: false });
    m.tail = new T.MeshBasicMaterial({ color: 0xb93420, toneMapped: false });
    function part(geo, mat, x, y, z, sx, sy, sz, yaw = 0, rx = 0, rz = 0) {
      const key = geo.uuid + mat.uuid;
      let b = batches.get(key); if (!b) { b = { geo, mat, parts: [] }; batches.set(key, b); }
      b.parts.push([x, y, z, sx, sy, sz, yaw, rx, rz]);
    }
    const block = (mat, x, y, z, w, h, d, yaw = 0, rx = 0, rz = 0) => part(box, mat, x, y, z, w, h, d, yaw, rx, rz);
    const flat = (mat, x, z, w, d, y = .018, yaw = 0) => {
      // All hardscape is tessellated together after the complete street plan exists.
      if (mat === m.walk && yaw === 0 && y <= .15) { walkRects.push(rect(x, z, w, d)); return; }
      part(plane, mat, x, y, z, w, d, 1, yaw, -Math.PI / 2);
    };
    function unionRects(source, excluded = [], mask = null) {
      const all = source.concat(excluded, mask || []);
      const xs = [...new Set(all.flatMap(r => [r.x0, r.x1]))].sort((a, b) => a - b);
      const zs = [...new Set(all.flatMap(r => [r.z0, r.z1]))].sort((a, b) => a - b);
      const covers = (r, x, z) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
      const result = []; let previous = new Map();
      for (let j = 0; j < zs.length - 1; j++) {
        const z = (zs[j] + zs[j + 1]) / 2, next = new Map(); let start = -1;
        function finish(end) {
          if (start < 0) return;
          const key = xs[start] + ':' + xs[end]; let r = previous.get(key);
          if (r) r.z1 = zs[j + 1];
          else { r = { x0: xs[start], x1: xs[end], z0: zs[j], z1: zs[j + 1] }; result.push(r); }
          next.set(key, r); start = -1;
        }
        for (let i = 0; i < xs.length - 1; i++) {
          const x = (xs[i] + xs[i + 1]) / 2;
          const filled = source.some(r => covers(r, x, z)) && !excluded.some(r => covers(r, x, z)) && (!mask || mask.some(r => covers(r, x, z)));
          if (filled && start < 0) start = i;
          if (!filled) finish(i);
        }
        finish(xs.length - 1); previous = next;
      }
      return result;
    }
    function groundMesh(name, rectangles, mat, y, tileSize) {
      const positions = [], normals = [], uvs = [], indices = [];
      for (const r of rectangles) {
        const offset = positions.length / 3;
        for (const [x, z] of [[r.x0, r.z0], [r.x0, r.z1], [r.x1, r.z1], [r.x1, r.z0]]) {
          positions.push(x, y, z); normals.push(0, 1, 0); uvs.push(x / tileSize, z / tileSize);
        }
        indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
      }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(normals, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeBoundingSphere();
      const mesh = new T.Mesh(geo, mat); mesh.name = name; mesh.receiveShadow = true; mesh.userData.cityV2 = true; root.add(mesh); env.solids.push(mesh); return mesh;
    }
    function collider(x, z, w, d, kind) { const c = { x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, cityV2: kind || true }; env.boxes.push(c); return c; }
    const shadowTex = texture((g, n) => {
      const grad = g.createRadialGradient(n / 2, n / 2, n * .12, n / 2, n / 2, n / 2);
      grad.addColorStop(0, 'rgba(20,27,18,.38)'); grad.addColorStop(.6, 'rgba(20,27,18,.23)'); grad.addColorStop(1, 'rgba(20,27,18,0)');
      g.fillStyle = grad; g.fillRect(0, 0, n, n);
    }, 128);
    const contactShadow = new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    function decal(draw, size = 256) {
      return new T.MeshBasicMaterial({ map: texture(draw, size), transparent: true, alphaTest: .015, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
    }
    const lightPool = decal((g, n) => {
      const v = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      v.addColorStop(0, 'rgba(255,222,153,.32)'); v.addColorStop(.35, 'rgba(255,213,137,.18)'); v.addColorStop(1, 'rgba(255,213,137,0)');
      g.fillStyle = v; g.fillRect(0, 0, n, n);
    });
    lightPool.blending = T.AdditiveBlending;
    const scorch = decal((g, n) => {
      const v = g.createRadialGradient(n / 2, n / 2, n * .08, n / 2, n / 2, n * .48);
      v.addColorStop(0, 'rgba(18,21,17,.88)'); v.addColorStop(.65, 'rgba(27,29,23,.55)'); v.addColorStop(1, 'rgba(29,31,25,0)');
      g.fillStyle = v; g.fillRect(0, 0, n, n);
    });
    const bloodDecal = decal((g, n) => {
      g.fillStyle = 'rgba(81,21,16,.82)';
      g.beginPath(); for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r = n * range(.2, .36); const x = n / 2 + Math.cos(a) * r, y = n / 2 + Math.sin(a) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fill();
      for (let i = 0; i < 42; i++) { g.beginPath(); g.ellipse(range(8, n - 8), range(8, n - 8), range(1, 5), range(1, 3), rnd() * 6, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = 'rgba(47,13,11,.6)'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(n * .38, n * .4 + i * 5); g.lineTo(n * .7, n * .6 + i * 5); g.stroke(); }
    });
    const brokenRoad = decal((g, n) => {
      const cx = n / 2, cy = n / 2;
      g.beginPath(); for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r = n * range(.25, .37); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath();
      g.fillStyle = '#272c29'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#565a51'; g.stroke();
      for (let i = 0; i < 160; i++) { g.fillStyle = i % 2 ? '#4c5048' : '#929080'; const a = rnd() * 6.28, r = n * range(.28, .4); g.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, range(1, 4), range(1, 4)); }
      for (let i = 0; i < 10; i++) { const a = rnd() * 6.28; let x = cx + Math.cos(a) * n * .3, y = cy + Math.sin(a) * n * .3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += Math.cos(a) * 6 + range(-4, 4); y += Math.sin(a) * 6 + range(-4, 4); g.lineTo(x, y); } g.strokeStyle = 'rgba(22,25,21,.8)'; g.lineWidth = range(1, 3); g.stroke(); }
    });
    const beamGeo = new T.ConeGeometry(1, 1, 12, 1, true); beamGeo.translate(0, -.5, 0);
    const beamMat = new T.MeshBasicMaterial({ color: 0xffdfaa, transparent: true, opacity: .035, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false });
    function beam(x, y, z, tx, ty, tz, radius) {
      const direction = new T.Vector3(tx - x, ty - y, tz - z), length = direction.length();
      const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, -1, 0), direction.normalize());
      const e = new T.Euler().setFromQuaternion(q, 'YXZ');
      part(beamGeo, beamMat, x, y, z, radius, length, radius, e.y, e.x, e.z);
    }
    function emission(x, y, z, height = 7, width = 2.4) { smokeSources.push({ x, y, z, height, width }); }
    function furniture(mat, x, y, z, w, h, d, kind = 'furniture') {
      block(mat, x, y, z, w, h, d); collider(x, z, w, d, kind); furnitureCount++;
    }
    // ---- 4.3.75: richer interiors. One tinted material (per-instance colour) + the shared batches, so the
    // whole city still costs a handful of draw calls. Clutter scales with the graphics quality (env.quality).
    const QI = env.quality === 'bassa' ? .4 : env.quality === 'alta' ? 1 : .72;
    const tint = new T.MeshLambertMaterial({ color: 0xffffff }); m.tint = tint;
    let es = 475113; const er = () => { es = (Math.imul(es, 1664525) + 1013904223) >>> 0; return es / 4294967296; };
    const ea = (a, b) => a + (b - a) * er(), pick = arr => arr[Math.floor(er() * arr.length) % arr.length];
    function tp(geo, c, x, y, z, sx, sy, sz, yaw = 0, rx = 0, rz = 0) { part(geo, tint, x, y, z, sx, sy, sz, yaw, rx, rz); const b = batches.get(geo.uuid + tint.uuid); b.parts[b.parts.length - 1][9] = c; }
    const WOODS = [0x6b4a32, 0x7c5a3a, 0x5a3e2a, 0x8a6a48], FABRIC = [0x5d6f8a, 0x7a3a34, 0x4f6a4a, 0x8a7a5a, 0x6a5a7a], BOOKS = [0x8a2e26, 0x2e5a8a, 0x3d6b34, 0xc9a23a, 0x5a3a6a, 0xd8d0c0, 0x2a2a2a];
    const WALLP = { home: [0x7a8f86, 0x9a7f6a, 0x6f7a94, 0x8f8a6a], hospital: [0x9ab0a8], school: [0x8a9a6a], police: [0x5f6f80], factory: [0x5a5a52], station: [0x6a7a7a], shop: [0x8a7a62, 0x6a8a84] };
    function enrich(b, front, occ) {
      const { x, z, w, d, kind } = b, iw = w / 2 - .19, id = d / 2 - .19, gap = kind === 'factory' ? 4 : 2.6, fz = z + front * id;
      const OV = (r, s) => r.x0 < s.x1 && r.x1 > s.x0 && r.z0 < s.z1 && r.z1 > s.z0;
      const res = [rect(x, fz - front * 1.9, gap + 1.6, 3.8), rect(x - w * .23, z + d * .14, 2.4, 2.4)];
      const fits = r => r.x0 > x - iw - .01 && r.x1 < x + iw + .01 && r.z0 > z - id - .01 && r.z1 < z + id + .01 && !occ.some(s => OV(r, s)) && !res.some(s => OV(r, s));
      // walls: inward normal n, tangent t, origin on the inner surface; windows as intervals along t
      const walls = [];
      const win = (len, step, start, skipDoor) => { const o = []; for (let u = start; u < len / 2 - 1; u += step) { if (skipDoor && Math.abs(u) < gap / 2 + .8) continue; o.push(u); } return o; };
      for (const s of [-1, 1]) {
        const nz = -s, yaw = Math.atan2(0, nz); // wall at z + s*id, normal pointing back into the room
        walls.push({ ox: x, oz: z + s * id, nx: 0, nz, yaw, tx: Math.cos(yaw), tz: -Math.sin(yaw), L: w - .5, door: s === front, wins: win(w, 3, -w / 2 + 2, s === front).map(u => u * Math.cos(yaw)), ww: kind === 'factory' ? 1.2 : 1.2 });
        const nx = -s, yaw2 = Math.atan2(nx, 0);
        walls.push({ ox: x + s * iw, oz: z, nx, nz: 0, yaw: yaw2, tx: Math.cos(yaw2), tz: -Math.sin(yaw2), L: d - .5, door: false, wins: win(d, 3.2, -d / 2 + 2, false).map(u => u * -Math.sin(yaw2)), ww: 1.05 });
      }
      // local (u along wall, v into the room) -> world
      const W = (wl, u, v) => [wl.ox + wl.tx * u + wl.nx * v, wl.oz + wl.tz * u + wl.nz * v];
      const LB = (wl, c, u, y, v, sw, sh, sd, rx = 0, rz = 0) => { const p = W(wl, u, v); tp(box, c, p[0], y, p[1], sw, sh, sd, wl.yaw, rx, rz); };
      const LM = (wl, mat, u, y, v, sw, sh, sd) => { const p = W(wl, u, v); block(mat, p[0], y, p[1], sw, sh, sd, wl.yaw); };
      const LC = (wl, c, u, y, v, r, h, geo = cyl) => { const p = W(wl, u, v); tp(geo, c, p[0], y, p[1], r * 2, h, r * 2, wl.yaw); };
      const foot = (wl, u, v, sw, sd) => { const a = W(wl, u - sw / 2, v), b2 = W(wl, u + sw / 2, v + sd); return { x0: Math.min(a[0], b2[0]), x1: Math.max(a[0], b2[0]), z0: Math.min(a[1], b2[1]), z1: Math.max(a[1], b2[1]) }; };
      const winHit = (wl, u0, u1) => wl.wins.some(c => u1 > c - wl.ww / 2 - .12 && u0 < c + wl.ww / 2 + .12);
      const tall = new Map(walls.map(wl => [wl, []]));
      // ---- furniture pieces (draw in wall space: u centre, v from the wall) ----
      const P = {
        wardrobe: { w: 1.2, d: .6, h: 2, f(wl, u) { const c = pick(WOODS); LB(wl, c, u, 1, .3, 1.2, 2, .6); LB(wl, 0x2a2018, u, 1.05, .605, .02, 1.8, .02); for (const s of [-1, 1]) LB(wl, 0x9a9a92, u + s * .08, 1.05, .62, .03, .22, .03); LB(wl, c, u, 2.03, .3, 1.26, .06, .64); if (er() < .5 * QI) LB(wl, 0x8a7a5a, u + .2, 2.2, .3, .5, .3, .4); } },
        books: { w: 1, d: .35, h: 1.9, f(wl, u) { const c = pick(WOODS); for (const s of [-1, 1]) LB(wl, c, u + s * .48, .95, .175, .04, 1.9, .35); LB(wl, c, u, .95, .02, 1, 1.9, .03); for (const y of [.06, .5, .95, 1.4, 1.88]) LB(wl, c, u, y, .175, .96, .035, .34);
          for (const y of [.08, .52, .97, 1.42]) { let k = -.44; while (k < .42) { const bw = ea(.035, .08), bh = ea(.24, .36); if (er() < .82 * (QI + .25)) LB(wl, pick(BOOKS), u + k + bw / 2, y + bh / 2 + .02, .19, bw, bh, ea(.18, .26), 0, er() < .12 ? .25 : 0); k += bw + .006; } } } },
        fridge: { w: .75, d: .7, h: 1.8, f(wl, u) { LB(wl, 0xd8d6cc, u, .9, .35, .74, 1.8, .68); LB(wl, 0x9a9a92, u, 1.18, .7, .72, .015, .01); LB(wl, 0x707070, u + .3, 1.45, .72, .03, .35, .03); LB(wl, 0x707070, u + .3, .8, .72, .03, .25, .03); if (er() < .6) LB(wl, pick(BOOKS), u - .1, 1.5, .695, .12, .09, .01); } },
        stove: { w: .7, d: .65, h: .92, f(wl, u) { LB(wl, 0xcfccc2, u, .45, .32, .7, .9, .64); LB(wl, 0x1e1e1e, u, .915, .32, .7, .03, .64); for (const a of [-1, 1]) for (const c of [-1, 1]) LC(wl, 0x3a3a3a, u + a * .17, .935, .32 + c * .15, .08, .02); LB(wl, 0x151515, u, .42, .645, .5, .32, .01); LB(wl, 0x8a8a8a, u, .64, .66, .5, .03, .03); } },
        sink: { w: 1.2, d: .6, h: .92, f(wl, u) { const c = pick(WOODS); LB(wl, c, u, .44, .3, 1.2, .88, .58); LB(wl, 0xbdb6a6, u, .9, .3, 1.24, .05, .62); LB(wl, 0x6f7478, u - .2, .905, .32, .5, .04, .36); LC(wl, 0x9aa0a6, u - .2, 1.05, .1, .02, .25); LB(wl, 0x9aa0a6, u - .2, 1.17, .17, .03, .03, .16); LB(wl, 0x2a2018, u + .3, .45, .585, .01, .7, .01);
          if (er() < .7 * QI) { LC(wl, 0xe8e4da, u + .35, .97, .3, .06, .1); LC(wl, 0x3a6a9a, u + .5, 1.0, .25, .04, .16); } LB(wl, c, u, 1.7, .17, 1.2, .7, .34); LB(wl, 0x2a2018, u, 1.7, .345, .01, .62, .01); } },
        sideboard: { w: 1.4, d: .45, h: .8, f(wl, u) { const c = pick(WOODS); LB(wl, c, u, .4, .22, 1.4, .8, .44); for (const s of [-.35, .35]) LB(wl, 0x2a2018, u + s, .45, .445, .6, .01, .01); LB(wl, 0xb0a890, u, .82, .22, 1.44, .03, .46);
          if (er() < .8 * QI) { LC(wl, 0x8a6a48, u - .45, .95, .22, .07, .24); LC(wl, 0xe8d8a8, u - .45, 1.13, .22, .13, .16, cone); } if (er() < .7 * QI) LB(wl, pick(BOOKS), u + .3, .93, .2, .26, .2, .03); } },
        tv: { w: 1.3, d: .45, h: .55, f(wl, u) { const c = pick(WOODS); LB(wl, c, u, .25, .22, 1.3, .5, .44); LB(wl, 0x151515, u, .86, .2, 1.1, .64, .05); LB(wl, 0x2a3036, u, .86, .225, 1.02, .56, .01); if (er() < .5) LB(wl, 0x8a9aa0, u + .12, .9, .232, .5, .015, .005, 0, .7); LB(wl, 0x151515, u, .53, .2, .3, .06, .2); } },
        desk: { w: 1.3, d: .65, h: .76, f(wl, u) { const c = pick(WOODS); LB(wl, c, u, .74, .32, 1.3, .05, .64); for (const s of [-1, 1]) LB(wl, c, u + s * .6, .36, .32, .05, .72, .6); LB(wl, c, u + .38, .45, .32, .48, .5, .58);
          if (kind === 'police' || kind === 'school' || er() < .5) { LB(wl, 0x1e1e1e, u - .15, 1.0, .18, .5, .32, .03); LB(wl, 0x3a5a6a, u - .15, 1.0, .198, .45, .27, .005); LB(wl, 0x2a2a2a, u - .15, .8, .2, .08, .1, .06); LB(wl, 0x2a2a2a, u - .1, .775, .42, .42, .015, .14); }
          for (let i = 0; i < 1 + Math.round(3 * QI); i++) LB(wl, 0xe8e4da, u + ea(-.5, .5), .77 + i * .004, ea(.3, .55), .21, .004, .29, 0, 0); 
          const cu = u - .15, p0 = W(wl, cu, 1.0); tp(box, 0x2a2a2a, p0[0], .46, p0[1], .44, .06, .44, wl.yaw + ea(-.4, .4)); LB(wl, 0x2a2a2a, cu, .75, 1.22, .42, .5, .05); LC(wl, 0x4a4a4a, cu, .22, 1.0, .03, .42); } },
        dresser: { w: 1, d: .5, h: 1.05, f(wl, u) { const c = pick(WOODS); LB(wl, c, u, .52, .25, 1, 1.04, .5); for (const y of [.22, .52, .82]) { LB(wl, 0x2a2018, u, y + .14, .505, .94, .01, .01); LB(wl, 0x9a9a92, u, y, .51, .14, .025, .02); } if (er() < .6 * QI) LB(wl, 0x9ab0b8, u, 1.45, .03, .6, .7, .02); } },
        plant: { w: .55, d: .55, h: 1.1, f(wl, u) { LC(wl, 0x9a5a3a, u, .2, .28, .2, .4); LC(wl, 0x3a2a1e, u, .4, .28, .17, .02); const p = W(wl, u, .28); part(sphere, m.leaf, p[0], .72, p[1], .55, .6, .55); part(sphere, m.leaf2, p[0] + .1, .95, p[1] - .05, .35, .4, .35); } },
        lockers: { w: 1.2, d: .5, h: 1.9, f(wl, u) { const c = pick([0x5a6a7a, 0x6a7a5a, 0x7a5a4a]); LB(wl, c, u, .95, .25, 1.2, 1.9, .5); for (const k of [-.4, 0, .4]) { LB(wl, 0x2a2f33, u + k + .2, .95, .505, .01, 1.84, .01); for (const y of [1.6, 1.68, 1.76]) LB(wl, 0x2a2f33, u + k, y, .505, .24, .02, .01); LB(wl, 0x9a9a92, u + k + .14, 1.05, .51, .03, .12, .02); } if (er() < .35) LB(wl, c, u + .4, .95, .62, .38, 1.8, .03, 0, .02); } },
        filing: { w: .55, d: .65, h: 1.32, f(wl, u) { LB(wl, 0x7a8288, u, .66, .32, .5, 1.32, .62); for (const y of [.2, .52, .84, 1.16]) { LB(wl, 0x4a5258, u, y + .15, .635, .48, .01, .01); LB(wl, 0xa0a6aa, u, y, .64, .14, .03, .02); } if (er() < .4) LB(wl, 0x7a8288, u, .2, .85, .46, .28, .4); } },
        cooler: { w: .45, d: .45, h: 1.45, f(wl, u) { LB(wl, 0xd8d6cc, u, .5, .22, .38, 1, .38); LC(wl, 0x6aa0c8, u, 1.2, .22, .16, .42); LB(wl, 0x3a6a9a, u - .08, .82, .42, .05, .05, .04); } },
        cabinet: { w: 1, d: .45, h: 1.9, f(wl, u) { LB(wl, 0xd8d8d0, u, .95, .22, 1, 1.9, .44); LB(wl, 0x34474a, u, 1.35, .445, .9, .9, .01); for (const y of [1.1, 1.45]) LB(wl, 0xc0c0b8, u, y, .3, .9, .02, .34); for (let i = 0; i < Math.round(6 * QI); i++) LC(wl, pick([0xe8e4da, 0xc8a050, 0x8ab0d0]), u + ea(-.38, .38), 1.17 + (i % 2) * .35, .3, .04, .12); LB(wl, 0x8a2e26, u, 1.82, .45, .2, .2, .005); } },
        oxygen: { w: .5, d: .4, h: 1.3, f(wl, u) { for (const s of [-.12, .12]) { LC(wl, s < 0 ? 0x3d7b34 : 0xd8d8d0, u + s, .6, .2, .1, 1.2); LC(wl, 0x707070, u + s, 1.25, .2, .03, .1); } } },
        vending: { w: .95, d: .8, h: 1.95, f(wl, u) { const c = pick([0x8a2e26, 0x2e5a8a, 0x3d6b34]); LB(wl, c, u, .97, .4, .95, 1.94, .8); LB(wl, 0x2a3036, u - .12, 1.15, .805, .6, 1.2, .01); const p = W(wl, u - .12, .81); block(m.lamp, p[0], 1.15, p[1], .5, 1.05, .004, wl.yaw); LB(wl, 0x1a1a1a, u + .32, 1.2, .81, .15, .3, .01); LB(wl, 0x1a1a1a, u - .12, .3, .81, .6, .16, .02); } },
        board: { w: 1.8, d: .06, h: 1.2, wall: 1, f(wl, u) { LB(wl, 0x2a2f2a, u, 1.65, .03, 1.8, 1.1, .04); LB(wl, 0x8a7a5a, u, 1.08, .06, 1.8, .04, .08); for (let i = 0; i < 4; i++) LB(wl, 0xd8d4c0, u - .7 + i * .38 + ea(0, .1), 1.75 - (i % 2) * .25, .055, ea(.15, .32), .015, .004); } },
        notice: { w: 1.1, d: .05, h: 1, wall: 1, f(wl, u) { LB(wl, 0x8a6a48, u, 1.6, .025, 1.1, .8, .03); for (let i = 0; i < Math.round(7 * QI) + 1; i++) LB(wl, pick([0xe8e4da, 0xf0d070, 0xd8a8a8, 0xa8c8d8]), u + ea(-.42, .42), 1.6 + ea(-.28, .28), .045, .18, .22, .004, 0, ea(-.15, .15)); } },
        barrels: { w: 1.4, d: .75, h: .95, f(wl, u) { for (const s of [-.35, .35]) { const c = pick([0x795542, 0x3a5a7a, 0x8a2e26, 0x4a5a3a]); LC(wl, c, u + s, .46, .36, .3, .92); LC(wl, 0x2a2a2a, u + s, .3, .36, .305, .03); LC(wl, 0x2a2a2a, u + s, .62, .36, .305, .03); } } },
        workbench: { w: 2, d: .75, h: .95, f(wl, u) { LB(wl, 0x6a5a42, u, .9, .37, 2, .08, .74); for (const s of [-1, 1]) LB(wl, 0x3a3a3a, u + s * .92, .43, .37, .07, .86, .68); LB(wl, 0x6a5a42, u, .2, .37, 1.9, .04, .66); LB(wl, 0x5a6066, u + .65, 1.0, .5, .2, .12, .14); LB(wl, 0x3a3a3a, u, 1.5, .03, 1.9, .9, .03);
          for (let i = 0; i < Math.round(6 * QI); i++) LB(wl, pick([0x8a2e26, 0x9a9a92, 0x2a2a2a]), u - .8 + i * .3, 1.5 + ea(-.2, .2), .06, .04, ea(.2, .35), .03, 0, ea(-.3, .3)); LB(wl, 0xc9a23a, u - .4, .97, .35, .3, .06, .12); } },
        toolcab: { w: .8, d: .5, h: 1.1, f(wl, u) { LB(wl, 0xa83228, u, .55, .25, .8, 1.1, .5); for (const y of [.25, .45, .65, .85]) LB(wl, 0x2a2a2a, u, y, .505, .74, .015, .01); LB(wl, 0x9a9a92, u, 1.12, .25, .82, .03, .52); } },
        pallet: { w: 1.3, d: 1.1, h: .9, f(wl, u) { LB(wl, 0x9a7a4a, u, .07, .55, 1.25, .12, 1.05); const n = 1 + Math.round(3 * QI); for (let i = 0; i < n; i++) { const p = W(wl, u + ea(-.3, .3), .55 + ea(-.25, .25)); tp(box, pick([0xc2a36b, 0xa07a45, 0xd8d0b8]), p[0], .28 + i * .16, p[1], ea(.5, .7), .18, ea(.38, .5), wl.yaw + ea(-.3, .3)); } } },
        freezer: { w: 1.6, d: .8, h: .92, f(wl, u) { LB(wl, 0xd8d6cc, u, .45, .4, 1.6, .9, .78); LB(wl, 0x34474a, u, .91, .4, 1.5, .02, .68); for (let i = 0; i < Math.round(5 * QI); i++) LB(wl, pick(BOOKS), u + ea(-.65, .65), .86, .4 + ea(-.25, .25), .18, .08, .12); } },
        display: { w: 1.25, d: .75, h: 2, f(wl, u) { LB(wl, 0xcfccc2, u, 1, .37, 1.25, 2, .72); LB(wl, 0x34474a, u, 1.05, .735, 1.1, 1.75, .01); const p = W(wl, u, .74); block(m.lamp, p[0], 1.92, p[1], 1, .05, .02, wl.yaw); for (const y of [.45, .9, 1.35]) for (let i = 0; i < Math.round(5 * QI); i++) LC(wl, pick(BOOKS), u - .45 + i * .22, y + .12, .45, .05, .22); } },
        counter: { w: 1.8, d: .7, h: 1.05, f(wl, u) { const c = pick(WOODS); LB(wl, c, u, .5, .35, 1.8, 1, .68); LB(wl, 0xb0a890, u, 1.02, .35, 1.86, .05, .74); LB(wl, 0x2a2a2a, u + .5, 1.15, .3, .36, .22, .3); LB(wl, 0x3a5a6a, u + .5, 1.3, .25, .3, .15, .02, .4); if (er() < .6 * QI) LB(wl, 0xc9a23a, u - .4, 1.1, .4, .3, .12, .2); } },
        rack: { w: .9, d: .4, h: 1.5, f(wl, u) { LB(wl, 0x707070, u, .75, .2, .9, 1.5, .4); for (const y of [.35, .75, 1.15]) for (let i = 0; i < 4; i++) LB(wl, pick(BOOKS), u - .33 + i * .22, y, .3, .18, .26, .02, .25, 0); } },
        safe: { w: .7, d: .65, h: .9, f(wl, u) { LB(wl, 0x3a4048, u, .45, .32, .7, .9, .64); LC(wl, 0x9a9a92, u + .1, .55, .65, .07, .03); LB(wl, 0x9a9a92, u - .18, .5, .65, .03, .2, .03); } },
        timetable: { w: 2, d: .06, h: 1, wall: 1, f(wl, u) { LB(wl, 0x1a1e22, u, 2.1, .03, 2, .8, .05); for (let i = 0; i < 5; i++) LB(wl, i % 2 ? 0xf0c040 : 0xe8e4da, u - .2 + ea(-.1, .1), 2.4 - i * .14, .058, ea(1, 1.6), .05, .004); } },
        radiator: { w: .9, d: .14, h: .6, low: 1, f(wl, u) { for (let i = 0; i < 9; i++) LB(wl, 0xc8c4b8, u - .4 + i * .1, .45, .07, .07, .55, .1); LB(wl, 0xa8a49a, u, .2, .08, .9, .04, .05); } },
        bins: { w: .9, d: .45, h: .9, f(wl, u) { for (const s of [-.22, .22]) { LC(wl, pick([0x3d6b34, 0x3a5a7a, 0x8a6a2a]), u + s, .38, .22, .2, .76); LC(wl, 0x2a2a2a, u + s, .78, .22, .21, .04); } } },
        stretcher: { w: 2, d: .7, h: .85, f(wl, u) { LB(wl, 0x9aa0a6, u, .62, .4, 1.9, .06, .62); LB(wl, 0xd8d8d0, u, .72, .4, 1.8, .1, .56); for (const s of [-.85, .85]) { LB(wl, 0x707070, u + s, .3, .4, .04, .6, .5); LC(wl, 0x1a1a1a, u + s, .07, .4, .06, .04); } if (er() < .5) part(plane, bloodDecal, ...W(wl, u + .3, .4).slice(0, 1), .785, W(wl, u + .3, .4)[1], .7, .4, 1, 0, -Math.PI / 2); } },
      };
      const SETS = {
        home: ['wardrobe', 'books', 'fridge', 'stove', 'sink', 'sideboard', 'tv', 'dresser', 'plant', 'desk', 'radiator', 'books', 'plant'],
        hospital: ['cabinet', 'oxygen', 'stretcher', 'cabinet', 'sink', 'filing', 'radiator', 'notice', 'cooler'],
        school: ['lockers', 'books', 'board', 'lockers', 'desk', 'notice', 'plant', 'books', 'radiator'],
        police: ['lockers', 'filing', 'desk', 'safe', 'notice', 'cooler', 'filing', 'desk', 'board'],
        factory: ['workbench', 'barrels', 'toolcab', 'pallet', 'lockers', 'barrels', 'pallet', 'workbench'],
        station: ['vending', 'timetable', 'lockers', 'bins', 'vending', 'plant', 'notice'],
        shop: ['display', 'counter', 'freezer', 'rack', 'display', 'bins', 'notice', 'rack'],
        cafe: ['counter', 'display', 'sink', 'plant', 'books', 'notice', 'fridge']
      };
      const set = kind === 'shop' && (b.label === 'CAFFÈ' || b.label === 'PANETTERIA') ? SETS.cafe : SETS[kind] || SETS.shop;
      let k = Math.floor(er() * set.length);
      for (const wl of walls) {
        let u = -wl.L / 2 + .25;
        while (u < wl.L / 2 - .25) {
          const key = set[k % set.length], it = P[key];
          if (!it || u + it.w > wl.L / 2 - .25) { u += .4; k++; if (u > wl.L / 2 - .3) break; continue; }
          const uc = u + it.w / 2, r = foot(wl, uc, it.wall ? 0 : .02, it.w, Math.max(.1, it.d));
          const tallOk = it.h <= .95 || !winHit(wl, u, u + it.w), doorOk = !(wl.door && Math.abs(uc) < gap / 2 + it.w / 2 + .7);
          const free = it.wall ? !tall.get(wl).some(q => u + it.w > q[0] && u < q[1]) : fits(r);
          if (tallOk && doorOk && free && (it.low || it.wall || er() < .55 + .45 * QI)) {
            try { it.f(wl, uc); } catch (e) { }
            if (!it.wall && !it.low) { collider((r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, r.x1 - r.x0, r.z1 - r.z0, 'furniture'); occ.push(r); furnitureCount++; }
            if (it.h > 1.2 || it.wall) tall.get(wl).push([u, u + it.w]);
            u += it.w + ea(.15, .6); k++;
          } else { u += .45; if (er() < .5) k++; }
        }
      }
      // wall finish: painted lower band + chair rail + skirting, interior window frames, pictures, clocks, switches
      const paint = pick(WALLP[kind] || WALLP.shop);
      for (const wl of walls) {
        const segs = wl.door ? [[-wl.L / 2 - .2, -gap / 2], [gap / 2, wl.L / 2 + .2]] : [[-wl.L / 2 - .2, wl.L / 2 + .2]];
        for (const [a, c] of segs) { const L = c - a, um = (a + c) / 2; LB(wl, paint, um, .55, .012, L, 1.02, .02); LB(wl, 0xb8b09a, um, 1.07, .025, L, .06, .04); LB(wl, 0x4a3a2a, um, .06, .02, L, .1, .03); }
        for (const c of wl.wins) {
          LB(wl, 0xd8d2c0, c, 1.7, .02, wl.ww + .2, 1.55 + .2, .04); LB(wl, 0x4a5a5e, c, 1.7, .035, wl.ww, 1.5, .02); LB(wl, 0xd8d2c0, c, 1.7, .05, .04, 1.5, .02); LB(wl, 0xd8d2c0, c, .9, .09, wl.ww + .35, .05, .18);
          if (er() < .5 * QI) { LB(wl, pick(FABRIC), c - wl.ww / 2 - .12, 1.75, .07, .22, 1.7, .05); LB(wl, pick(FABRIC), c + wl.ww / 2 + .12, 1.75, .07, .22, 1.7, .05); }
        }
        const pics = Math.round((wl.L / 4) * QI);
        for (let i = 0; i < pics; i++) {
          const u = ea(-wl.L / 2 + .8, wl.L / 2 - .8), pw = ea(.35, .8), ph = ea(.3, .6);
          if (winHit(wl, u - pw / 2 - .1, u + pw / 2 + .1) || tall.get(wl).some(q => u + pw / 2 > q[0] - .1 && u - pw / 2 < q[1] + .1) || (wl.door && Math.abs(u) < gap / 2 + .6)) continue;
          if (er() < .25) { LC(wl, 0xe8e4da, u, 2.2, .02, .16, .03); continue; }
          LB(wl, pick(WOODS), u, 1.7, .02, pw + .08, ph + .08, .03, 0, er() < .3 ? ea(-.15, .15) : 0); LB(wl, pick([0x6a8aa0, 0x9a7a4a, 0x5a7a4a, 0xa06a5a, 0x7a6a8a]), u, 1.7, .037, pw, ph, .005);
        }
        if (er() < .6) LB(wl, 0xe8e4da, ea(-wl.L / 2 + .6, wl.L / 2 - .6), 1.2, .015, .08, .12, .01);
      }
      // ceiling lamps (some dead) with a soft light pool on the floor; lit lamps only on the ground floor
      const nl = Math.max(1, Math.round(w * d / 70));
      for (let i = 0; i < nl; i++) {
        const lx = x + (nl === 1 ? 0 : (i / (nl - 1) - .5) * (w - 4)), lz = z + ea(-d * .15, d * .15), lit = er() < .55;
        block(m.metal, lx, 3.12, lz, .02, .3, .02); tp(box, 0x2a2a2a, lx, 2.96, lz, .5, .06, .5);
        if (lit) { block(m.lamp, lx, 2.925, lz, .42, .01, .42); flat(lightPool, lx, lz, 4.2, 4.2, .07); } else tp(box, 0x8a8a7a, lx, 2.925, lz, .42, .01, .42);
      }
      // rugs, debris, papers, cans, bags, a fallen chair, blood (no colliders: everything here is low)
      const inRoom = (px, pz, pad) => Math.abs(px - x) < iw - pad && Math.abs(pz - z) < id - pad;
      const clear = (px, pz, s) => !occ.some(r => px > r.x0 - s && px < r.x1 + s && pz > r.z0 - s && pz < r.z1 + s);
      if (kind === 'home' || kind === 'police' || kind === 'school') for (let i = 0; i < 2; i++) { const rx = x + ea(-w * .2, w * .2), rz = z + ea(-d * .2, d * .2); if (clear(rx, rz, .3)) tp(box, pick(FABRIC), rx, .047, rz, ea(1.6, 2.6), .012, ea(1.2, 1.8), er() < .5 ? 0 : Math.PI / 2); }
      const nd = Math.round((w * d / 9) * QI);
      for (let i = 0; i < nd; i++) {
        const px = x + ea(-iw + .4, iw - .4), pz = z + ea(-id + .4, id - .4); if (!inRoom(px, pz, .3) || !clear(px, pz, .15)) continue;
        const r = er(), yaw = er() * 6.28;
        if (r < .4) tp(plane, pick([0xe8e4da, 0xd8d0b8, 0xf0ead8]), px, .05 + i * .0004, pz, ea(.2, .32), ea(.26, .4), 1, yaw, -Math.PI / 2);
        else if (r < .55) tp(cyl, pick([0x8a2e26, 0x9aa0a6, 0x3a6a9a]), px, .1, pz, .07, .12, .07, yaw, Math.PI / 2);
        else if (r < .67) tp(box, pick(BOOKS), px, .07, pz, .16, .04, .22, yaw, 0, ea(-.2, .2));
        else if (r < .77) tp(sphere, 0x1e2226, px, .2, pz, ea(.45, .6), ea(.38, .5), ea(.45, .55), yaw);
        else if (r < .87) part(box, pick([m.ash, m.stain, m.wood]), px, .07, pz, ea(.15, .4), ea(.04, .1), ea(.1, .3), yaw, 0, ea(-.3, .3));
        else if (r < .93) { tp(box, pick(WOODS), px, .25, pz, .42, .04, .42, yaw, Math.PI / 2 - .1); tp(box, pick(WOODS), px, .1, pz + .25, .4, .4, .04, yaw); }
        else part(plane, bloodDecal, px, .16, pz, ea(.8, 1.6), ea(.6, 1.2), 1, yaw, -Math.PI / 2);
      }
      if (er() < .45 + .3 * QI) { const px = x + ea(-iw * .6, iw * .6), pz = z + ea(-id * .5, id * .5); part(plane, bloodDecal, px, .16, pz, ea(1.4, 2.4), ea(1, 1.6), 1, er() * 6, -Math.PI / 2); for (let i = 1; i <= 3; i++) part(plane, bloodDecal, px + i * .5, .161, pz + i * .3, .35, .5, 1, er() * 6, -Math.PI / 2); }
      // kitchens and hospitals get a tiled floor patch
      if (kind === 'home' || kind === 'hospital') { const rear = z - front * (id - 1.6); tp(box, kind === 'home' ? 0x9a9488 : 0xb8bcb4, x, .044, rear, w - .8, .006, 3.2); }
    }
    function furnish(b, front) {
      const { x, z, w, d, kind, label } = b, sx = w * .30, rz = d * .24;
      b.interior = kind === 'shop' ? label.toLowerCase() : kind;
      flat(m.wood, x, z, w - .8, d - .8, .04);
      flat(contactShadow, x, z, w - 1, d - 1, .046);
      function table(px, pz, ww = 2, dd = 1.1) {
        furniture(m.wood, px, .76, pz, ww, .14, dd);
        for (const a of [-1, 1]) for (const c of [-1, 1]) block(m.metal, px + a * (ww / 2 - .15), .37, pz + c * (dd / 2 - .15), .09, .74, .09);
      }
      function shelf(px, pz, ww = 2.1, dd = .65, color = m.cloth) {
        furniture(m.metal, px, 1.05, pz, ww, 2.1, dd);
        // A dark backing with protruding shelves and uneven abandoned stock.
        block(m.dark, px, 1.05, pz - dd / 2 - .015, ww * .92, 1.95, .04);
        for (const y of [.35, .95, 1.55]) {
          block(m.trim, px, y, pz + dd / 2 + .07, ww, .07, .18);
          for (const dx of [-.3, .2]) block(color, px + dx * ww, y + .18, pz + dd / 2 + .07, .28, .3, .24);
        }
      }
      if (kind === 'home') {
        const rear = z - front * rz;
        furniture(m.cloth, x - sx, .47, z + front * rz, 2.8, .72, 1.05);
        block(m.cloth, x - sx, .9, z + front * (rz + .38), 2.8, .8, .22);
        for (const a of [-1, 1]) block(m.cloth, x - sx + a * 1.28, .74, z + front * rz, .24, .52, 1.1);
        table(x + sx, z + front * rz);
        furniture(m.wood, x + sx, .44, rear, 1.7, .72, 2.6, 'bed');
        block(m.trim, x + sx, .86, rear, 1.65, .22, 2.5); block(m.cloth, x + sx, 1.01, rear + .35, 1.68, .13, 1.8);
        block(m.trim, x + sx, 1.03, rear - .88, 1.1, .17, .5);
        furniture(m.wood, x - sx, .5, rear, 3.4, 1, .9, 'kitchen');
        block(m.trim, x - sx, 1.03, rear, 3.5, .08, 1); block(m.dark, x - sx - .7, 1.09, rear, .8, .035, .7);
        block(m.metal, x - sx + .7, 1.09, rear, .8, .035, .6);
        block(m.metal, x - sx + .7, 1.3, rear - .22, .06, .4, .06);
      } else if (kind === 'hospital') {
        for (const a of [-1, 1]) for (const offset of [-rz, 0, rz]) {
          furniture(m.metal, x + a * sx, .42, z + offset, 1.5, .7, 2.5, 'bed');
          block(m.trim, x + a * sx, .87, z + offset, 1.45, .2, 2.4);
          block(m.cloth, x + a * sx, 1, z + offset + .35, 1.48, .08, 1.65);
          block(m.trim, x + a * sx, 1.04, z + offset - .88, .95, .18, .45);
          part(cyl, m.metal, x + a * (sx - 1), 1.25, z + offset, .05, 2.5, .05);
          block(m.glass, x + a * (sx - 1), 2.15, z + offset, .18, .35, .09);
        }
        shelf(x - sx, z - d * .4, 3, .6, m.trim);
      } else if (kind === 'school') {
        for (const a of [-1, 1]) for (const offset of [-rz, 0, rz]) {
          table(x + a * sx, z + offset, 2.2, 1);
          furniture(m.wood, x + a * sx, .46, z + offset + front * 1.15, 1.6, .18, .45, 'school-seat');
          block(m.wood, x + a * sx, .9, z + offset + front * 1.4, 1.6, .7, .12);
        }
        block(m.dark, x, 1.9, z - front * (d / 2 - .23), w * .48, 1.3, .06);
        for (let i = 0; i < 4; i++) block(m.trim, x - 3 + i * 1.1, 2 - i * .11, z - front * (d / 2 - .28), .75, .025, .02);
      } else if (kind === 'police') {
        table(x - sx, z + front * rz, 3, 1.2); table(x + sx, z + front * rz, 3, 1.2);
        for (const a of [-1, 1]) {
          block(m.dark, x + a * sx, 1.14, z + front * rz, .75, .6, .14);
          shelf(x + a * sx, z - front * rz, 3, .7, m.blue);
        }
        for (const a of [-1, 1]) for (let i = 0; i < 7; i++) block(m.metal, x + a * (w * .36) + (i - 3) * .42, 1.6, z - front * d * .4, .05, 3.2, .05);
      } else if (kind === 'factory') {
        for (const a of [-1, 1]) {
          shelf(x + a * sx, z - rz, 4, 1, m.rust); table(x + a * sx, z + rz, 3.2, 1.4);
          block(m.metal, x + a * sx, 1.2, z + rz, 1.2, .7, .8);
          for (const offset of [-.8, .8]) furniture(m.wood, x + a * sx + offset, .3, z, 1.3, .6, 1.3, 'crate');
        }
      } else if (kind === 'station') {
        for (const a of [-1, 1]) for (const offset of [-rz, rz]) bench(x + a * sx, z + offset);
        furniture(m.wood, x - sx, .56, z, 3.8, 1.1, 1, 'ticket-counter');
        block(m.dark, x - sx, 1.55, z, .8, .65, .14);
        shelf(x + sx, z, 2.1, .7, m.blue);
      } else if (label === 'CAFFÈ' || label === 'PANETTERIA') {
        furniture(m.wood, x - sx, .56, z, 1.3, 1.1, d * .55, 'counter');
        block(m.trim, x - sx, 1.15, z, 1.4, .12, d * .57);
        shelf(x - sx, z - front * d * .36, 2.4, .7, m.ochre);
        for (const offset of [-rz, rz]) { table(x + sx, z + offset, 1.2, 1.2); furniture(m.cloth, x + sx, .4, z + offset - 1.1, .55, .8, .55, 'chair'); }
      } else {
        for (const a of [-1, 1]) for (const offset of [-rz, rz]) shelf(x + a * sx, z + offset, Math.min(3.3, w * .24), .8, label === 'FARMACIA' ? m.trim : m.cloth);
        table(x - sx, z, 2.1, 1.2); block(m.dark, x - sx, 1, z, .6, .35, .5);
      }
    }
    function street(x0, z0, x1, z1, width = 9) {
      const horizontal = z0 === z1, len = Math.hypot(x1 - x0, z1 - z0), x = (x0 + x1) / 2, z = (z0 + z1) / 2;
      roads.push([x0, z0, x1, z1]); roadRects.push(rect(x, z, horizontal ? len : width, horizontal ? width : len));
      for (const side of [-1, 1]) {
        const dx = horizontal ? 0 : side * (width / 2 + 1.25), dz = horizontal ? side * (width / 2 + 1.25) : 0;
        walkRects.push(rect(x + dx, z + dz, horizontal ? len : 2.5, horizontal ? 2.5 : len));
        const edge = side * (width / 2 + .08);
        curbRects.push(rect(x + (horizontal ? 0 : edge), z + (horizontal ? edge : 0), horizontal ? len : .16, horizontal ? .16 : len));
      }
      for (let t = 4; t < len - 4; t += 8) { const px = x0 + (x1 - x0) * t / len, pz = z0 + (z1 - z0) * t / len; centreMarks.push(rect(px, pz, horizontal ? 3 : .12, horizontal ? .12 : 3)); }
    }
    [-80, -32, 32, 80].forEach(x => street(x, -145, x, 145, x === -32 || x === 32 ? 10 : 8));
    [-96, -48, 0, 48, 96].forEach(z => street(-148, z, 148, z, z === 0 ? 11 : 8));
    street(0, -145, 0, -48, 8); street(0, 48, 0, 145, 8);
    street(-122, 96, -122, 148, 5);
    for (const x of [-80, -32, 32, 80]) for (const z of [-96, -48, 0, 48, 96]) {
      for (const s of [-1, 1]) for (let i = -3; i <= 3; i++) {
        crosswalkMarks.push(rect(x + i * .85, z + s * 7.3, .4, 2.2));
        crosswalkMarks.push(rect(x + s * 7.3, z + i * .85, 2.2, .4));
      }
    }
    function sign(text, x, y, z, w = 5, yaw = 0, color = '#34443a') {
      // 4.3.80: wide plate (no stretched square texture), framed, a little weathered; callers place it above the door.
      const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d');
      g.fillStyle = color; g.fillRect(0, 0, 512, 128);
      const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 128);
      g.strokeStyle = '#c1bba3'; g.lineWidth = 7; g.strokeRect(9, 9, 494, 110);
      g.fillStyle = '#9a947e'; for (const [bx, by] of [[20, 20], [492, 20], [20, 108], [492, 108]]) { g.beginPath(); g.arc(bx, by, 4, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#e8e2cb'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold ' + Math.min(72, Math.floor(880 / Math.max(4, text.length))) + 'px sans-serif';
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowOffsetY = 3; g.fillText(text, 256, 68, 470); g.shadowColor = 'transparent';
      let sd = 7; const R = () => { sd = (sd * 16807 + text.length * 31) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(40,30,20,' + (.05 + R() * .12).toFixed(2) + ')'; g.fillRect(R() * 512, R() * 128, 2 + R() * 18, 1 + R() * 4); }
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
      const mat = new T.MeshLambertMaterial({ map: t }); const mesh = new T.Mesh(plane, mat); mesh.position.set(x, y, z); mesh.scale.set(w, w / 4, 1); mesh.rotation.y = yaw; mesh.castShadow = false; root.add(mesh);
    }
    function windowAt(x, y, z, yaw, wide = 1.15, tall = 1.55, boarded = false) {
      block(m.trim, x, y, z, wide + .22, tall + .22, .14, yaw);
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      block(m.dark, x + fx * .09, y, z + fz * .09, wide, tall, .09, yaw);
      const shattered = !boarded && rnd() < .22;
      if (shattered) {
        block(m.glass, x + fx * .14, y - tall * .29, z + fz * .14, wide * .8, tall * .2, .03, yaw);
        block(m.glass, x + fx * .14, y + tall * .32, z + fz * .14, wide * .45, tall * .15, .03, yaw, 0, .13);
      } else block(m.glass, x + fx * .14, y, z + fz * .14, wide * .84, tall * .83, .03, yaw);
      block(m.trim, x + fx * .16, y, z + fz * .16, .045, tall, .04, yaw);
      block(m.trim, x + fx * .16, y - .1, z + fz * .16, wide, .055, .04, yaw);
      block(m.trim, x + fx * .22, y - tall / 2 - .17, z + fz * .22, wide + .45, .14, .42, yaw);
      if (boarded) for (const yy of [-.3, .3]) block(m.wood, x + fx * .22, y + yy, z + fz * .22, wide * 1.2, .16, .08, yaw, 0, yy * .3);
    }
    function building(x, z, w, d, floors, kind, label, door = 's', enterable = true) {
      if (protectedLots.some(b => x + w / 2 + 2 > b.x0 && x - w / 2 - 2 < b.x1 && z + d / 2 + 2 > b.z0 && z - d / 2 - 2 < b.z1)) return;
      const h = floors * 3.25, wall = kind === 'factory' || kind === 'station' ? m.brick : kind === 'hospital' ? m.sage : [m.cream, m.ochre, m.sage][buildings.length % 3];
      const gap = kind === 'factory' ? 4 : 2.6, t = .38, front = door === 's' ? 1 : -1, fz = z + front * d / 2;
      const b = { x, z, w, d, h, kind, floors, enterable, label }; buildings.push(b);
      env.houses.push([x, z, w / 2, d / 2]);
      flat(contactShadow, x + 1.5, z + 1.5, w * 1.55, d * 1.55, .019);
      flat(m.walk, x, z, w + 2, d + 2, .025);
      const wallBlock = (px, pz, ww, dd) => { block(wall, px, 1.65, pz, ww, 3.3, dd); collider(px, pz, ww, dd, 'wall'); };
      if (enterable) {
        wallBlock(x - w / 4 - gap / 4, fz, w / 2 - gap / 2, t);
        wallBlock(x + w / 4 + gap / 4, fz, w / 2 - gap / 2, t);
        block(wall, x, 2.93, fz, gap, .74, t);
        wallBlock(x, z - front * d / 2, w, t);
        wallBlock(x - w / 2, z, t, d); wallBlock(x + w / 2, z, t, d);
        entrances.push([x, fz + front * 2.5]); loot.push([x - w * .23, z + d * .14]);
        // Furnish by use, keeping a clear route from every entrance to the room centre.
        const nb0 = env.boxes.length; furnish(b, front);
        try { enrich(b, front, env.boxes.slice(nb0).map(c => ({ x0: c.x0, x1: c.x1, z0: c.z0, z1: c.z1 }))); } catch (e) { try { console.warn('enrich', e); } catch (_) { } }
      } else { block(wall, x, h / 2, z, w, h, d); collider(x, z, w, d, 'building'); }
      if (enterable && floors > 1) block(wall, x, 3.3 + (h - 3.3) / 2, z, w, h - 3.3, d);
      for (let f = 0; f < floors; f++) {
        const y = 1.7 + f * 3.25;
        for (const s of [-1, 1]) {
          for (let dx = -w / 2 + 2; dx < w / 2 - 1; dx += 3) {
            if (f === 0 && s === front && Math.abs(dx) < gap / 2 + .8) continue;
            windowAt(x + dx, y, z + s * (d / 2 + .09), s > 0 ? 0 : Math.PI, 1.2, kind === 'factory' ? 1.05 : 1.55, rnd() < .17);
          }
          for (let dz = -d / 2 + 2; dz < d / 2 - 1; dz += 3.2) windowAt(x + s * (w / 2 + .08), y, z + dz, s * Math.PI / 2, 1.05, 1.45, rnd() < .12);
        }
        block(m.trim, x, (f + 1) * 3.25, z, w + .32, .18, d + .32);
      }
      if (kind === 'home' || kind === 'station' || kind === 'factory') {
        const angle = kind === 'factory' ? .22 : .42, slope = d / 2 / Math.cos(angle), rise = Math.tan(angle) * d / 4;
        block(m.roof, x, h + rise, z - d / 4, w + .9, .18, slope + .5, 0, -angle);
        block(m.roof, x, h + rise, z + d / 4, w + .9, .18, slope + .5, 0, angle);
        block(m.trim, x, h + rise * 2, z, w + 1, .2, .26);
      } else {
        block(m.roof, x, h + .1, z, w + .5, .2, d + .5);
        for (const s of [-1, 1]) { block(m.trim, x, h + .38, z + s * d / 2, w + .5, .58, .3); block(m.trim, x + s * w / 2, h + .38, z, .3, .58, d); }
        block(m.metal, x + w * .22, h + .55, z - d * .22, 2.4, .8, 1.6);
      }
      if (kind === 'home' && floors > 1) for (const s of [-1, 1]) {
        block(m.trim, x + s * w * .25, 3.3, fz + front * .65, 2.4, .16, 1.5);
        block(m.metal, x + s * w * .25, 3.86, fz + front * 1.3, 2.4, .08, .06);
        for (let k = -1; k <= 1; k++) block(m.metal, x + s * w * .25 + k, 3.6, fz + front * 1.3, .055, .65, .06);
      }
      // Weathered lower edges, service details and air-conditioning units.
      for (const side of [-1, 1]) {
        for (let i = 0; i < 5; i++) block(m.stain, x - w / 2 + 1 + rnd() * (w - 2), .25 + rnd() * .4, z + side * (d / 2 + .21), range(.2, .7), range(.3, 1.1), .02);
        block(m.metal, x + side * w * .34, 2.45, z - front * (d / 2 + .28), 1.1, .55, .5);
        block(m.dark, x + side * w * .34, 2.45, z - front * (d / 2 + .55), .7, .32, .04);
      }
      // Downpipes, plinth, entrances and signage distinguish silhouettes at eye level.
      for (const s of [-1, 1]) block(m.metal, x + s * (w / 2 - .45), h / 2, fz + front * .32, .1, h, .1);
      block(m.trim, x, .17, z - front * d / 2, w, .34, .45);
      if (label) { const sw = Math.min(w - 1, 7.5), sh = sw / 4, sy = floors > 1 ? 3.3 + sh / 2 + .22 : h + .62 + sh / 2; if (floors === 1) for (const q of [-1, 1]) block(m.metal, x + q * sw * .36, h + .5, fz - front * .05, .08, .5 + sh * .6, .08); sign(label, x, sy, fz + front * (floors > 1 ? .3 : .22), sw, front > 0 ? 0 : Math.PI, kind === 'hospital' ? '#496452' : kind === 'police' ? '#344657' : '#514a37'); landmarks.push([label, x, z]); }
      if (kind === 'shop') { block(m.cloth, x, 2.55, fz + front * 1, w * .83, .15, 1.9); for (const s of [-1, 1]) block(m.metal, x + s * w * .36, 1.25, fz + front * 1.65, .07, 2.5, .07); }
      if (kind === 'hospital') { block(m.red, x + 5, h + 1.45, fz + front * .2, .45, 2.2, .16); block(m.red, x + 5, h + 1.45, fz + front * .2, 1.8, .45, .16); }
      if (kind === 'factory') { part(cyl, m.brick, x + w * .28, h + 4.5, z - d * .2, 1.4, 9, 1.4); part(cyl, m.trim, x + w * .28, h + 9, z - d * .2, 1.7, .3, 1.7); if (z === 72) emission(x + w * .28, h + 9.1, z - d * .2, 13, 4); }
      // Damage is concentrated on exposed facades, leaving the entrance usable.
      if ((kind === 'home' && buildings.length % 4 === 0) || kind === 'police' || kind === 'factory') {
        const px = x - w * .3, pz = fz + front * .23;
        part(plane, scorch, px, Math.min(h * .5, 4.5), pz, w * .45, Math.min(h, 8), 1, front > 0 ? 0 : Math.PI);
        for (let i = 0; i < 8; i++) block(i % 2 ? m.ash : m.brick, px + range(-1.8, 1.8), .12, fz + front * range(.6, 1.6), range(.2, .7), range(.1, .22), range(.2, .5), rnd() * 6, .15, range(-.25, .25));
        if (kind === 'home' && (z === -24 || z === -72)) {
          const roofY = h + Math.tan(.42) * d * .3;
          part(plane, scorch, px, roofY + .12, z - d * .2, 6, 5, 1, 0, -Math.PI / 2 - .42);
          for (let i = 0; i < 6; i++) block(m.ash, px + range(-2, 2), roofY + range(.1, .4), z - d * .2 + range(-1, 1), .45, .11, .7, range(-.3, .3), range(-.6, .1), range(-.25, .25));
          emission(px, roofY + .3, z - d * .2, 9, 3);
        }
      }
    }
    // New plan: a civic centre between two boulevards, with distinct districts.
    for (const z of [-120, -72, -24, 24]) {
      building(-123, z, 14, 20, z === -24 ? 3 : 2, 'home', '', z < 0 ? 's' : 'n');
      building(-103, z + 1.5, 13, 17, z === 24 ? 1 : 2, 'home', '', z < 0 ? 's' : 'n');
      building(-57, z, 22, 24, z === -72 ? 4 : 3, 'home', '', z < 0 ? 's' : 'n');
    }
    for (const [x, floors] of [[-17, 3], [0, 2], [17, 3]]) building(x, -72, 12.5, 22, floors, x === 0 ? 'shop' : 'home', x === 0 ? 'EMPORIO' : '', 's');
    building(21, -24, 11, 22, 2, 'shop', 'CAFFÈ', 's');
    building(-19, 24, 11, 18, 3, 'home', '', 'n');
    building(19, 24, 11, 18, 2, 'shop', 'PANETTERIA', 'n');
    building(0, -120, 28, 16, 2, 'station', 'STAZIONE', 's');
    building(55, -120, 21, 17, 2, 'home', '', 's'); building(112, -120, 22, 18, 2, 'home', '', 's');
    building(112, -72, 30, 25, 3, 'hospital', 'OSPEDALE', 's');
    building(57, -72, 22, 18, 2, 'home', '', 's');
    building(112, -24, 24, 22, 2, 'police', 'POLIZIA', 's');
    building(57, -24, 22, 18, 2, 'school', 'SCUOLA', 's');
    building(112, 24, 24, 20, 1, 'shop', 'SUPERMERCATO', 'n');
    building(57, 24, 20, 18, 1, 'shop', 'FARMACIA', 'n');
    building(0, 24, 21, 18, 2, 'shop', 'MERCATO', 'n');
    building(57, 72, 25, 23, 2, 'factory', 'OFFICINE', 'n');
    building(112, 72, 28, 25, 2, 'factory', 'FABBRICA', 'n');
    building(57, 122, 27, 23, 1, 'factory', 'DEPOSITO', 'n');
    building(112, 122, 24, 23, 1, 'factory', 'LOGISTICA', 'n');
    building(-57, 72, 21, 18, 2, 'home', '', 'n');
    building(0, 72, 19, 18, 1, 'shop', 'DISTRIBUTORE', 'n');
    building(-57, 124, 18, 18, 1, 'home', 'RIFUGIO RURALE', 'n');
    // Town square: a fountain, benches, planters and an unobstructed pedestrian ring.
    flat(m.walk, -5, -24, 32, 36, .03);
    part(cyl, m.trim, 0, .3, -24, 6, .6, 6); part(cyl, m.dark, 0, .63, -24, 4.9, .08, 4.9);
    part(cyl, m.trim, 0, 1.05, -24, .8, 1.4, .8); part(sphere, m.trim, 0, 2.15, -24, 1.2, 1.7, 1.2); collider(0, -24, 5.8, 5.8, 'fountain');
    landmarks.push(['Piazza', 0, -24]);
    function bench(x, z, yaw = 0) {
      const co = Math.cos(yaw), si = Math.sin(yaw);
      block(m.wood, x, .55, z, 2, .16, .55, yaw);
      block(m.wood, x - si * .22, .95, z - co * .22, 2, .7, .12, yaw);
      for (const s of [-1, 1]) block(m.metal, x + s * .75 * co, .3, z - s * .75 * si, .1, .6, .5, yaw);
      collider(x, z, Math.abs(co) * 2 + Math.abs(si) * .6, Math.abs(si) * 2 + Math.abs(co) * .6, 'bench'); furnitureCount++;
      flat(contactShadow, x, z, 2.7, 1.4, .049, yaw);
    }
    for (const x of [-14, 14]) for (const z of [-34, -14]) {
      bench(x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2);
      block(m.trim, x + 3, .28, z, 1.5, .56, 1.5); part(sphere, m.leaf, x + 3, .8, z, 1.6, 1.3, 1.6);
      collider(x + 3, z, 1.5, 1.5, 'planter');
    }
    // Continuous railway beyond the northern avenue, with platforms and a freight wagon.
    flat(m.soil, 0, -154, 308, 16, .025);
    for (const z of [-151, -157]) {
      for (let x = -151; x <= 151; x += 2.2) block(m.wood, x, .09, z, .2, .18, 2.4);
      for (const s of [-1, 1]) block(m.metal, 0, .22, z + s * .8, 308, .12, .1);
    }
    block(m.walk, 0, .12, -140, 38, .24, 4.5);
    block(m.roof, 0, 3.5, -140, 37, .15, 5); for (const x of [-16, -8, 0, 8, 16]) block(m.metal, x, 1.7, -140, .13, 3.4, .13);
    for (const x of [36, 48, 60]) { block(m.rust, x, 1.7, -151, 10, 2.7, 3); collider(x, -151, 10, 3, 'wagon'); for (const dx of [-3, 3]) for (const s of [-1, 1]) part(cyl, m.dark, x + dx, .48, -151 + s * 1.5, .85, .3, .85, 0, Math.PI / 2); }
    function tree(x, z, s = 1, pine = false) {
      if (inside(x, z, 2)) return;
      part(cyl, m.trunk, x, s * 1.8, z, s * .45, s * 3.6, s * .45);
      if (pine) { for (let i = 0; i < 3; i++) part(cone, m.leaf, x, s * (3 + i * 1.4), z, s * (4 - i), s * 3.8, s * (4 - i)); }
      else {
        for (let i = 0; i < 5; i++) { const a = i * 2.4, r = i ? s * 1.1 : 0; part(sphere, i % 2 ? m.leaf2 : m.leaf, x + Math.sin(a) * r, s * (3.7 + (i % 3) * .65), z + Math.cos(a) * r, s * 3.1, s * 3.7, s * 3.1, a); }
      }
      flat(contactShadow, x + s * .6, z + s * .4, s * 6, s * 5, .024);
      foliage.push([x, z]); env.circles.push({ x, z, r: .23 * s, cityV2: true });
    }
    // Residential gardens: hedges, fences, patios, sheds and short walking paths.
    for (const b of buildings.filter(b => b.kind === 'home')) {
      const cz = b.z + b.d / 2 + 5;
      flat(m.soil, b.x, cz, b.w, 7, .021);
      flat(m.walk, b.x, cz, 1.6, 7, .04);
      for (const side of [-1, 1]) {
        for (let dz = -2; dz <= 2; dz += 1.5) part(sphere, m.leaf, b.x + side * (b.w / 2 - .5), .48, cz + dz, 1.2, 1.25, 1.5);
        block(m.wood, b.x + side * (b.w / 2 - .7), .8, cz, .09, .09, 6);
      }
      for (const side of [-1, 1]) block(m.wood, b.x + side * b.w * .29, .8, cz + 3.3, b.w * .32, .09, .09);
      bench(b.x - b.w * .24, cz, 0);
      tree(b.x + b.w * .28, cz, .52);
    }
    // Designed green belts and courtyards, rather than foliage dropped into roads.
    for (let x = -156; x < 157; x += 9) for (const z of [153, 163]) tree(x + range(-2, 2), z, range(.8, 1.4), true);
    for (let z = -136; z < 152; z += 11) for (const x of [-157, 157]) tree(x + range(-2, 2), z, range(.85, 1.3), true);
    for (const x of [-91, -21, 21, 91]) for (let z = -133; z < 140; z += 22) if (Math.min(...[-96, -48, 0, 48, 96].map(v => Math.abs(v - z))) > 10) tree(x, z, .7);
    for (const b of buildings) {
      for (const s of [-1, 1]) {
        const x = b.x + s * (b.w / 2 + 1.7), z = b.z + b.d * .26;
        if (!inside(x, z, 1)) for (let i = -1; i <= 1; i++) part(sphere, i % 2 ? m.leaf : m.leaf2, x, .5, z + i * 1.2, 1.6, 1.5, 1.7);
      }
    }
    // Survivor clearing: buildable open centre, entrances on both sides.
    flat(m.soil, -122, 72, 37, 31, .02);
    for (const x of [-140, -104]) for (let z = 57; z <= 87; z += 2) { block(m.wood, x, .9, z, .14, 1.8, .14); block(m.wood, x, .65, z + .9, .12, .13, 2.1); }
    for (const z of [57, 87]) for (const x of [-133, -111]) { block(m.wood, x, .65, z, 13, .14, .1); block(m.wood, x, 1.25, z, 13, .14, .1); collider(x, z, 13, .2, 'fence'); }
    collider(-140, 72, .2, 30, 'fence'); collider(-104, 72, .2, 30, 'fence');
    for (const x of [-132, -111]) { part(cone, m.cloth, x, 1.2, 65, 5, 2.4, 5, Math.PI / 4); collider(x, 65, 3.2, 3.2, 'tent'); }
    landmarks.push(['Rifugio', -122, 72]); sign('RIFUGIO', -119, 2.95, 87.2, 4.5);
    function vehicle(x, z, yaw, color, van = false, options = {}) {
      if (inside(x, z, 3)) return;
      const starts = new Map([...batches].map(([key, b]) => [key, b.parts.length]));
      const transform = (dx, dz) => [x + Math.cos(yaw) * dx + Math.sin(yaw) * dz, z - Math.sin(yaw) * dx + Math.cos(yaw) * dz];
      const body = (mat, dx, y, dz, w, h, d) => { const p = transform(dx, dz); block(mat, p[0], y, p[1], w, h, d, yaw); };
      const length = van ? 5.3 : 4.2;
      const burnt = !!options.burnt, headlights = !!options.headlights, paint = burnt ? m.soot : color;
      body(paint, 0, .62, .15, 1.9, .54, length - .3);
      body(m.dark, 0, .89, .35, 1.52, .16, van ? 3.1 : 1.7);
      // Roof and pillars frame a hollow cabin, with missing side windows.
      body(paint, 0, van ? 2.12 : 1.51, .5, 1.7, .12, van ? 3.5 : 1.85);
      for (const s of [-1, 1]) for (const dz of [van ? -1.1 : -.4, van ? 1.95 : 1.3]) body(paint, s * .8, van ? 1.57 : 1.18, dz, .1, van ? 1.1 : .56, .11);
      body(m.glass, 0, van ? 1.85 : 1.3, van ? -1.12 : -.45, .7, .25, .04);
      body(m.glass, .52, van ? 1.65 : 1.17, van ? -1.13 : -.46, .28, .18, .04);
      body(m.cloth, -.38, .93, .5, .58, .46, .7); body(m.cloth, .38, .93, .5, .58, .46, .7);
      body(m.engine, 0, .8, -length / 2 + .55, 1.42, .2, 1.15);
      const hp = transform(0, -length / 2 + .85);
      block(paint, hp[0], 1.05, hp[1], 1.76, .09, 1.12, yaw, -.36, -.08);
      body(m.rust, .21, .41, -length / 2 + .02, 1.53, .16, .16);
      for (const s of [-1, 1]) {
        body(m.rust, s * .91, .67, .7, .025, .17, .9);
        body(m.tail, s * .7, .7, length / 2 -.16, .26, .15, .06);
        body(headlights ? m.headlight : m.trim, s * .64, .73, -length / 2 + .1, .36, .17, .075);
        if (headlights) {
          const p = transform(s * .64, -length / 2 + .04), end = transform(s * .64, -length / 2 - 9);
          beam(p[0], .73, p[1], end[0], .08, end[1], 1.5);
          const pool = transform(s * .64, -length / 2 - 4.3);
          flat(lightPool, pool[0], pool[1], 2.8, 9.6, .055, yaw);
          lightSources.push({ x: p[0], y: .73, z: p[1], tx: end[0], ty: .08, tz: end[1], kind: 'headlight', intensity: 18, angle: .2 });
        }
      }
      for (const dx of [-.89, .89]) for (const dz of [-1.35, 1.35]) {
        if (burnt && dx > 0 && dz < 0) continue;
        const p = transform(dx, dz); part(cyl, m.dark, p[0], burnt ? .26 : .35, p[1], .65, .27, .65, yaw, 0, Math.PI / 2);
        part(cyl, m.metal, p[0], burnt ? .26 : .35, p[1], .3, .29, .3, yaw, 0, Math.PI / 2);
      }
      if (options.openDoor) {
        const p = transform(1.35, .2); block(paint, p[0], .83, p[1], 1, .52, .1, yaw + .65);
      }
      if (options.rolled) {
        const roll = new T.Quaternion().setFromAxisAngle(new T.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), Math.PI / 2);
        const o = new T.Object3D(), p = new T.Vector3(), e = new T.Euler();
        for (const [key, b] of batches) for (let i = starts.get(key) || 0; i < b.parts.length; i++) {
          const v = b.parts[i]; p.set(v[0] - x, v[1], v[2] - z).applyQuaternion(roll);
          o.rotation.set(v[7], v[6], v[8], 'YXZ'); o.quaternion.premultiply(roll); e.setFromQuaternion(o.quaternion, 'YXZ');
          v[0] = x + p.x; v[1] = 1 + p.y; v[2] = z + p.z; v[6] = e.y; v[7] = e.x; v[8] = e.z;
        }
      }
      if (burnt) {
        flat(scorch, x, z, 6.5, 8, .05, yaw);
        const p = transform(1.3, -1.8); part(cyl, m.dark, p[0], .12, p[1], .7, .24, .7);
        for (let i = 0; i < 5; i++) { const p = transform(range(-1.3, 1.3), -length / 2 - range(.2, 1.2)); block(m.rust, p[0], .08, p[1], range(.12, .55), .12, range(.12, .5), rnd() * 6); }
      }
      if (options.smoke) { const p = transform(0, -length / 2 + .65); emission(p[0], 1, p[1], 7, 2.3); }
      const co = Math.abs(Math.cos(yaw)), si = Math.abs(Math.sin(yaw));
      collider(x, z, co * 1.9 + si * length, si * 1.9 + co * length, 'vehicle');
      wrecks.push({ x, z, yaw, burnt, headlights, overturned: !!options.rolled, smoke: !!options.smoke });
    }
    let cars = 0;
    for (const x of [-80, 32, 80]) for (const z of [-125, -68, 20, 65, 120]) { vehicle(x + 2.5, z, cars % 3 === 0 ? .15 : 0, [m.rust, m.blue, m.red][cars % 3], false, { burnt: cars % 4 === 0, headlights: cars % 4 === 1, smoke: cars === 0 || cars === 8, openDoor: cars % 3 === 0 }); cars++; }
    for (const x of [-124, -66, 55, 124]) { vehicle(x, 2.5, Math.PI / 2 + .11, m.rust, false, { burnt: x === 55, smoke: x === 55, headlights: x === -66, openDoor: true }); cars++; }
    vehicle(119, -54, .1, m.cream, true, { headlights: true, openDoor: true }); vehicle(120, -8, Math.PI / 2, m.blue, false, { burnt: true, smoke: true }); vehicle(43, 80, .23, m.rust, true, { burnt: true }); cars += 3;
    // A failed evacuation at the hospital boulevard: overturned car and stalled van.
    vehicle(83.5, -40, .32, m.blue, false, { burnt: true, rolled: true, smoke: true });
    vehicle(89, -46, -.9, m.cream, true, { headlights: true, openDoor: true }); cars += 2;
    // Street furniture, utility poles and small debris are batched too.
    for (const x of [-86.5, -38.5, 38.5, 86.5]) for (let z = -132; z <= 132; z += 24) {
      if (inside(x, z, 1)) continue;
      part(cyl, m.metal, x, 2.8, z, .13, 5.6, .13); block(m.metal, x + (x > 0 ? -1 : 1), 5.4, z, 2, .09, .12);
      const lx = x + (x > 0 ? -1.8 : 1.8), working = Math.round((z + 132) / 24) % 4 !== 2;
      block(m.dark, lx, 5.35, z, .6, .2, .3); block(working ? m.lamp : m.glass, lx, 5.23, z, .4, .035, .2);
      if (working) {
        flat(lightPool, lx, z, 9, 9, .052);
        beam(lx, 5.22, z, lx, .09, z, 3.5);
        lightSources.push({ x: lx, y: 5.22, z, tx: lx, ty: .08, tz: z, kind: 'street', intensity: 30, angle: .6 });
      }
      env.circles.push({ x, z, r: .08, cityV2: true });
    }
    let puddles = 0, remains = 0, boneFragments = 0;
    const waterTex = texture((g, n) => { g.clearRect(0, 0, n, n); const grad = g.createRadialGradient(n / 2, n / 2, 20, n / 2, n / 2, n / 2); grad.addColorStop(0, 'rgba(86,109,103,.75)'); grad.addColorStop(.7, 'rgba(66,79,65,.55)'); grad.addColorStop(1, 'rgba(45,49,39,0)'); g.fillStyle = grad; g.beginPath(); g.ellipse(n / 2, n / 2, n / 2, n / 3, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(195,198,165,.45)'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(n * .2, n * .35 + i * 17); g.lineTo(n * .7, n * .35 + i * 17); g.stroke(); } });
    const water = new T.MeshLambertMaterial({ map: waterTex, transparent: true, alphaTest: .04, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const x of [-80, -32, 32, 80]) for (let z = -131; z < 140; z += 19) { flat(water, x - 2.7, z, range(2, 4), range(1.5, 3), .17, rnd() * 6); puddles++; }
    // Potholes and split asphalt are walkable; larger rubble stays on road edges.
    for (const r of roads) {
      const len = Math.hypot(r[2] - r[0], r[3] - r[1]), horizontal = r[1] === r[3];
      for (let t = 16; t < len - 8; t += 31) {
        const offset = range(-2.3, 2.3), x = r[0] + (r[2] - r[0]) * t / len + (horizontal ? 0 : offset), z = r[1] + (r[3] - r[1]) * t / len + (horizontal ? offset : 0);
        if (inside(x, z, 3)) continue;
        const size = range(1.6, 3.8); flat(brokenRoad, x, z, size, size * .8, .061, rnd() * 6);
        for (let k = 0; k < 3; k++) { const a = rnd() * 6.28; block(m.ash, x + Math.cos(a) * size * .3, .08, z + Math.sin(a) * size * .25, range(.08, .24), .09, range(.08, .22), a, .15, -.13); }
        damageSites.push([x, z]);
      }
    }
    // Evacuation remnants beside the hospital/police, clear of the door axes.
    for (const [x, z] of [[103, -52], [128, -50], [102, -8], [130, -8]]) {
      block(m.trim, x, .48, z, 2.5, .8, .48); collider(x, z, 2.5, .48, 'barricade');
      for (const dx of [-.9, -.3, .3, .9]) block(m.rust, x + dx, .5, z + .25, .25, .65, .018, 0, 0, -.4);
      flat(bloodDecal, x + 1.8, z - 1, 2.3, 1.4, .18, .6);
    }
    for (const b of buildings) for (let i = 0; i < 4; i++) { const x = b.x + range(-b.w / 2, b.w / 2), z = b.z - b.d / 2 - range(1.5, 3.5); if (inside(x, z, 1)) continue; block(i % 2 ? m.trim : m.rust, x, .08, z, range(.12, .6), .13, range(.12, .7), rnd() * 6); }
    function boneAt(x, z, yaw, length = .4) {
      block(m.bone, x, .085, z, .07, .07, length, yaw);
      for (const s of [-1, 1]) part(sphere, m.bone, x + Math.sin(yaw) * s * length / 2, .087, z + Math.cos(yaw) * s * length / 2, .12, .09, .12);
      boneFragments++;
    }
    for (const [x, z] of [[24, -42], [95, -53], [120, -39], [-71, -104], [67, 57], [126, 57], [18, -130], [-70, 36], [86, -64], [27, 19], [87, 119], [-85, -122], [108, -52], [127, -50], [99, -8], [128, -6], [-30, 42], [34, -105], [-85, 52], [84, 43]]) {
      if (inside(x, z, 2)) continue;
      const yaw = rnd() * 6, bone = remains % 2 === 0, mat = bone ? m.bone : m.cloth;
      const at = (dx, dz) => [x + Math.cos(yaw) * dx + Math.sin(yaw) * dz, z - Math.sin(yaw) * dx + Math.cos(yaw) * dz];
      flat(bloodDecal, x, z, bone ? 1.7 : 2.6, 1.5, .16, yaw);
      if (bone) {
        block(m.bone, x, .12, z, .065, .07, .76, yaw);
        for (let i = 0; i < 5; i++) { const p = at(0, -.28 + i * .12); part(cyl, m.bone, p[0], .14, p[1], .48 - i * .025, .035, .29, yaw, Math.PI / 2); }
      } else part(sphere, mat, x, .14, z, .5, .25, .83, yaw);
      const head = at(0, .63); part(sphere, m.bone, head[0], .17, head[1], .29, .27, .33, yaw);
      for (const s of [-1, 1]) { const eye = at(s * .062, .72); part(sphere, m.dark, eye[0], .265, eye[1], .063, .025, .05); }
      for (const s of [-1, 1]) {
        const leg = at(s * .16, -.66), arm = at(s * .32, .1);
        block(mat, leg[0], .08, leg[1], .1, .1, .62, yaw + s * .12);
        block(mat, arm[0], .085, arm[1], .08, .085, .48, yaw + s * .4);
      }
      for (let i = 0; i < 3; i++) { const p = at(range(-1.3, 1.3), range(-1.1, 1.1)); boneAt(p[0], p[1], rnd() * 6, range(.22, .44)); }
      // Short drag trails lead back toward the incident, rather than square stains.
      for (let i = 1; i <= 3; i++) { const p = at(.08, -1 - i * .5); flat(bloodDecal, p[0], p[1], .45, .7, .161, yaw); }
      remains++;
    }
    // A junction owns one asphalt surface. Sidewalks/curbs stop at every road,
    // and paint is also a union: there are no competing coplanar road faces.
    const junctions = [];
    for (let i = 0; i < roads.length; i++) for (let j = i + 1; j < roads.length; j++) {
      if ((roads[i][1] === roads[i][3]) === (roads[j][1] === roads[j][3])) continue;
      const a = roadRects[i], b = roadRects[j], x0 = Math.max(a.x0, b.x0), x1 = Math.min(a.x1, b.x1), z0 = Math.max(a.z0, b.z0), z1 = Math.min(a.z1, b.z1);
      if (x1 > x0 && z1 > z0) junctions.push({ x0: x0 - 4.5, x1: x1 + 4.5, z0: z0 - 4.5, z1: z1 + 4.5 });
    }
    const interiors = buildings.filter(b => b.enterable).map(b => rect(b.x, b.z, b.w - .76, b.d - .76));
    const paving = {
      roads: unionRects(roadRects),
      sidewalks: unionRects(walkRects, roadRects.concat(interiors)),
      curbs: unionRects(curbRects, roadRects),
      paint: unionRects(unionRects(centreMarks, junctions).concat(crosswalkMarks), [], roadRects),
      junctions
    };
    groundMesh('Asfalto continuo', paving.roads, m.road, .025, 4);
    groundMesh('Marciapiedi e piazze', paving.sidewalks, m.walk, .11, 2);
    groundMesh('Segnaletica senza sovrapposizioni', paving.paint, m.mark, .035, 1);
    for (const r of paving.curbs) block(m.trim, (r.x0 + r.x1) / 2, .095, (r.z0 + r.z1) / 2, r.x1 - r.x0, .19, r.z1 - r.z0);
    const groundLayers = paving.roads.map(r => ({ ...r, y: .025 })).concat(paving.sidewalks.map(r => ({ ...r, y: .11 })));
    for (const b of batches.values()) if (b.geo === plane && (b.mat === m.soil || b.mat === m.wood)) {
      for (const p of b.parts) if (Math.abs(p[7] + Math.PI / 2) < .001 && p[1] < .15) groundLayers.push({ ...rect(p[0], p[2], p[3], p[4]), y: p[1] });
    }
    const groundHeight = (x, z) => groundLayers.reduce((h, r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1 ? Math.max(h, r.y) : h, 0);
    const decalOffsets = new Map([[contactShadow, .001], [scorch, .002], [bloodDecal, .003], [brokenRoad, .004], [water, .006], [lightPool, .008]]);
    for (const b of batches.values()) for (const p of b.parts) {
      if (b.geo === plane && decalOffsets.has(b.mat) && p[1] <= .2 && Math.abs(p[7] + Math.PI / 2) < .001) p[1] = groundHeight(p[0], p[2]) + decalOffsets.get(b.mat);
      // Resting remains follow the pavement rather than being hidden by its top.
      else if ((b.mat === m.bone || b.mat === m.cloth) && p[1] < .3) p[1] += groundHeight(p[0], p[2]);
    }
    for (const b of batches.values()) {
      const im = new T.InstancedMesh(b.geo, b.mat, b.parts.length), o = new T.Object3D(), tc = new T.Color();
      b.parts.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(p[7], p[6], p[8], 'YXZ'); o.scale.set(p[3], p[4], p[5]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); if (b.mat === m.tint) im.setColorAt(i, tc.setHex(p[9] === undefined ? 0xffffff : p[9])); });
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.castShadow = false; im.receiveShadow = true; im.userData.cityV2 = true; root.add(im);
      if (b.geo !== plane && b.geo !== beamGeo) env.solids.push(im);
    }
    // One GPU particle draw for all smoke, with a repeating rise/drift/fade cycle.
    const smokeMap = texture((g, n) => {
      for (let i = 0; i < 18; i++) { const x = range(n * .3, n * .7), y = range(n * .3, n * .7), r = range(n * .14, n * .28), v = g.createRadialGradient(x, y, 0, x, y, r); v.addColorStop(0, 'rgba(255,255,255,.26)'); v.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = v; g.fillRect(x - r, y - r, r * 2, r * 2); }
    }, 128);
    const positions = [], data = [];
    for (const s of smokeSources) for (let i = 0; i < 14; i++) { positions.push(s.x, s.y, s.z); data.push(i / 14, range(.07, .11), s.width, s.height); }
    const smokeGeo = new T.BufferGeometry(); smokeGeo.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); smokeGeo.setAttribute('aData', new T.Float32BufferAttribute(data, 4));
    const smokeMat = new T.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 500 }, uMap: { value: smokeMap }, uFogColor: { value: env.scene.fog ? env.scene.fog.color.clone() : new T.Color(0x929e91) }, uFogRange: { value: new T.Vector2(70, 190) } },
      vertexShader: `attribute vec4 aData; uniform float uTime; uniform float uScale; varying float vAlpha; varying float vDistance;
        void main(){ float age=fract(uTime*aData.y+aData.x); vec3 p=position;
          p.y+=age*aData.w; p.x+=age*age*aData.w*.16+sin(age*6.28+aData.x*9.)*.3; p.z+=age*age*aData.w*.08;
          vec4 mv=modelViewMatrix*vec4(p,1.); vDistance=length(mv.xyz); vAlpha=sin(age*3.14159)*.38;
          gl_Position=projectionMatrix*mv; gl_PointSize=vDistance>190.||mv.z>=0.?0.:min(96.,aData.z*(.35+age*1.7)*uScale/max(1.,-mv.z)); }`,
      fragmentShader: `uniform sampler2D uMap; uniform vec3 uFogColor; uniform vec2 uFogRange; varying float vAlpha; varying float vDistance;
        void main(){ float alpha=texture2D(uMap,gl_PointCoord).a*vAlpha; if(alpha<.004)discard;
          vec3 color=mix(vec3(.25,.27,.25),uFogColor,smoothstep(uFogRange.x,uFogRange.y,vDistance)); gl_FragColor=vec4(color,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`, transparent: true, depthWrite: false
    });
    const smoke = new T.Points(smokeGeo, smokeMat); smoke.name = 'Fumo della catastrofe'; smoke.frustumCulled = false; root.add(smoke);
    // Keep a fixed, small light pool to avoid dozens of per-pixel lights on Android.
    const dynamicLights = [], lightLimit = env.dynamicLights === undefined ? (/Android|iPhone/i.test(navigator.userAgent) ? 2 : 4) : env.dynamicLights;
    for (let i = 0; i < lightLimit; i++) { const light = new T.SpotLight(0xffdfaa, 0, 26, .6, .65, 2); light.castShadow = false; root.add(light, light.target); dynamicLights.push(light); }
    let lastLightUpdate = -1;
    function update(time, camera, viewportHeight = innerHeight) {
      smokeMat.uniforms.uTime.value = time;
      smokeMat.uniforms.uScale.value = viewportHeight * .5 / Math.tan(camera.fov * Math.PI / 360);
      if (env.scene.fog) {
        smokeMat.uniforms.uFogColor.value.copy(env.scene.fog.color);
        smokeMat.uniforms.uFogRange.value.set(env.scene.fog.near || 70, env.scene.fog.far || 190);
      }
      if (time - lastLightUpdate < .25 && time >= lastLightUpdate) return;
      lastLightUpdate = time;
      const near = lightSources.map(s => ({ source: s, distance: (s.x - camera.position.x) ** 2 + (s.z - camera.position.z) ** 2 })).filter(s => s.distance < 34 ** 2 && camera.position.y < 15).sort((a, b) => a.distance - b.distance).slice(0, lightLimit);
      for (let i = 0; i < dynamicLights.length; i++) {
        const light = dynamicLights[i], s = near[i] && near[i].source;
        if (!s) { light.intensity = 0; continue; }
        light.position.set(s.x, s.y, s.z); light.target.position.set(s.tx, s.ty, s.tz);
        light.angle = s.angle; light.distance = s.kind === 'street' ? 16 : 15; light.intensity = s.intensity;
      }
    }
    // Photo surfaces are optional; deterministic materials stay visible offline.
    if (env.assetBase) {
      const loader = new T.TextureLoader();
      [['brick', 'brick.jpg'], ['road', 'asphalt_02.jpg'], ['walk', 'brick_pavement_02.jpg'], ['roof', 'clay_roof_tiles.jpg']].forEach(([k, file]) => loader.load(env.assetBase + file, t => { t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(k === 'road' ? 4 : 2, 2); t.anisotropy = Math.min(4, env.anisotropy || 1); m[k].map = t; m[k].needsUpdate = true; }, undefined, () => {}));
    }
    const city = { root, buildings, plots: buildings, roads, paving, groundHeight, rail: { x0: -160, x1: 160, z0: -163, z1: -144 }, entrances, landmarks, tags: landmarks, foliage, loot, wrecks, damageSites, smokeSources, lightSources, dynamicLights, smoke, update, extent: 168, spawn: [-122, 75], seed: 826103, stats: { buildings: buildings.length, entrances: entrances.length, roads: roads.length, trees: foliage.length, cars, puddles, remains, boneFragments, potholes: damageSites.length, headlights: wrecks.filter(w => w.headlights).length, smokeSources: smokeSources.length, particles: positions.length / 3, lights: lightSources.length, dynamicLights: dynamicLights.length, furniture: furnitureCount, batches: batches.size } };
    window.__cityV2 = city; return city;
  };
})();
