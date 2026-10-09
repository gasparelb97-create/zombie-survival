// Arena 1v1 and 3v3 — authoritative room. Shared by the Node server and the Cloudflare Durable Object.
// Map blockers must stay in sync with the client list in game.html (arena454).

export const MATCH_MS = 180000;
export const NEED = 6;
export const NEED_DUEL = 2;
export const RESPAWN_MS = 5000;
export const INVULN_MS = 1500;
// v4.3.76: the map is 25% larger (client applies the same ARENA_S to arena454)
export const ARENA_S = 1.25;
export const ARENA_R = 32.6 * ARENA_S;

const COVERS_BASE = [
  [-14, -7, 3.4, 0.8, 1.7],
  [-14, 7, 3.4, 0.8, 1.7],
  [14, -7, 3.4, 0.8, 1.7],
  [14, 7, 3.4, 0.8, 1.7],
  [-7, -14, 0.8, 3.4, 1.5],
  [7, -14, 0.8, 3.4, 1.5],
  [-7, 14, 0.8, 3.4, 1.5],
  [7, 14, 0.8, 3.4, 1.5],
  [0, -9, 5.2, 0.9, 1.25],
  [0, 9, 5.2, 0.9, 1.25],
  [-9, 0, 0.9, 3.6, 2.15],
  [9, 0, 0.9, 3.6, 2.15],
  [-20, 12, 2.2, 2.2, 1.3],
  [20, -12, 2.2, 2.2, 1.3],
  [-20, -12, 2.4, 1.1, 1.45],
  [20, 12, 2.4, 1.1, 1.45],
  [-4, 4, 1.4, 1.4, 1.1],
  [4, -4, 1.4, 1.4, 1.1],
  [4, 4, 1.1, 1.6, 1.8],
  [-4, -4, 1.6, 1.1, 1.8]
];

const PILLARS_BASE = [[-22, 0], [22, 0], [0, -22], [0, 22], [-18, -18], [18, 18], [-18, 18], [18, -18]];

const SPOTS_BASE = [
  [0, 0], [0, 5], [0, -5],
  [-11, -11], [11, 11], [-11, 11], [11, -11],
  [-6, 16], [6, -16], [16, 6], [-16, -6],
  [-24, 10], [24, -10], [-24, -10], [24, 10],
  [0, 16], [0, -16], [12, 0], [-12, 0],
  [8, -8], [-8, 8]
];

export const COVERS = COVERS_BASE.map(c => [c[0] * ARENA_S, c[1] * ARENA_S, c[2] * ARENA_S, c[3] * ARENA_S, c[4]]);
export const PILLARS = PILLARS_BASE.map(p => [p[0] * ARENA_S, p[1] * ARENA_S]);
export const PILLAR_HALF = 0.6 * ARENA_S;
export const SPOTS = SPOTS_BASE.map(p => [p[0] * ARENA_S, p[1] * ARENA_S]);

export const SPAWNS = [
  [[-31, -5.5], [-31, 0], [-31, 5.5]],
  [[31, -5.5], [31, 0], [31, 5.5]]
];

export const GUNS = {
  knife: { dmg: 28, rate: 0.46, range: 2.4, pellets: 1, mag: 0, reserve: 0, melee: 1 },
  pistol: { dmg: 22, rate: 0.3, range: 60, pellets: 1, mag: 12, reserve: 72 },
  shotgun: { dmg: 9, rate: 0.9, range: 22, pellets: 9, mag: 6, reserve: 24, fall: 0.95, fmin: 0.2 },
  laser: { dmg: 11, rate: 0.1, range: 70, pellets: 1, mag: 30, reserve: 120 },
  smg: { dmg: 9, rate: 0.072, range: 42, pellets: 1, mag: 35, reserve: 140 },
  ar: { dmg: 16, rate: 0.11, range: 70, pellets: 1, mag: 30, reserve: 120 },
  thunder: { dmg: 7, rate: 0.3, range: 24, pellets: 8, mag: 10, reserve: 40, fall: 0.75, fmin: 0.26 },
  plasma: { dmg: 30, rate: 0.24, range: 75, pellets: 1, mag: 20, reserve: 60 },
  revolver: { dmg: 46, rate: 0.55, range: 70, pellets: 1, mag: 6, reserve: 30 },
  dbarrel: { dmg: 8, rate: 0.32, range: 16, pellets: 12, mag: 2, reserve: 20, fall: 1.05, fmin: 0.14 },
  crossbow: { dmg: 64, rate: 0.4, range: 90, pellets: 1, mag: 1, reserve: 16 },
  sniper: { dmg: 92, rate: 1.15, range: 150, pellets: 1, mag: 5, reserve: 20 },
  glauncher: { dmg: 74, rate: 0.7, range: 55, pellets: 1, mag: 6, reserve: 12 },
  flamer: { dmg: 5, rate: 0.05, range: 8, pellets: 1, mag: 120, reserve: 240 },
  minigun: { dmg: 8, rate: 0.048, range: 55, pellets: 1, mag: 200, reserve: 400 },
  fox: { dmg: 24, rate: 0.24, range: 75, pellets: 1, mag: 18, reserve: 72 },
  burst: { dmg: 12, rate: 0.082, range: 52, pellets: 1, mag: 28, reserve: 112 },
  saw: { dmg: 11, rate: 0.58, range: 12, pellets: 7, mag: 2, reserve: 20, fall: 1.1, fmin: 0.12 },
  hunt: { dmg: 58, rate: 0.78, range: 120, pellets: 1, mag: 8, reserve: 32 },
  vespa: { dmg: 46, rate: 0.9, range: 40, pellets: 1, mag: 3, reserve: 12 }
};

const KIND_CYCLE = ['dmg', 'ammo', 'med', 'spd', 'ammo', 'med', 'arm', 'ammo'];
const BUFF_MS = { dmg: 12000, spd: 10000, arm: 12000 };

function blocks() {
  const out = [];
  for (const c of COVERS) out.push({ x0: c[0] - c[2] / 2, x1: c[0] + c[2] / 2, z0: c[1] - c[3] / 2, z1: c[1] + c[3] / 2, h: c[4] });
  for (const p of PILLARS) out.push({ x0: p[0] - PILLAR_HALF, x1: p[0] + PILLAR_HALF, z0: p[1] - PILLAR_HALF, z1: p[1] + PILLAR_HALF, h: 3.4 });
  return out;
}
const BLOCKS = blocks();

function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch (e) {}
}

function cleanName(s) {
  const t = String(s || 'Giocatore').replace(/[\u0000-\u001f<>]/g, '').trim();
  return (t || 'Giocatore').slice(0, 18);
}

function cleanId(s) {
  const t = String(s || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  return t;
}

function gunOf(id) {
  return GUNS[id] || GUNS.knife;
}

function rayAabb(ox, oy, oz, dx, dy, dz, box, maxT) {
  let tmin = 0, tmax = maxT;
  const min = [box.x0, 0, box.z0], max = [box.x1, box.h, box.z1];
  const o = [ox, oy, oz], d = [dx, dy, dz];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-8) {
      if (o[i] < min[i] || o[i] > max[i]) return null;
    } else {
      let t1 = (min[i] - o[i]) / d[i], t2 = (max[i] - o[i]) / d[i];
      if (t1 > t2) { const s = t1; t1 = t2; t2 = s; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return null;
    }
  }
  if (tmax < 0) return null;
  return tmin >= 0 ? tmin : 0;
}

function capsule(ox, oy, oz, dx, dy, dz, tx, tz, range) {
  let best = null;
  const heights = [0.9, 1.25, 1.62];
  for (let i = 0; i < heights.length; i++) {
    const yy = heights[i];
    const lx = tx - ox, ly = yy - oy, lz = tz - oz;
    const along = lx * dx + ly * dy + lz * dz;
    if (along < 0.35 || along > range) continue;
    const qx = lx - dx * along, qy = ly - dy * along, qz = lz - dz * along;
    const rad = yy > 1.5 ? 0.4 : 0.62;
    if (qx * qx + qy * qy + qz * qz < rad * rad) {
      if (!best || along < best.along) best = { along: along, part: yy > 1.5 ? 'head' : 'body' };
    }
  }
  return best;
}

export function createHub() {
  const queues = { 1: new Map(), 3: new Map() };
  const watchers = new Map();
  const bySock = new Map();
  const matches = new Set();
  let pid = 1;
  let spotCursor = 0;
  const hub = {
    poke: null,
    tick,
    hot,
    connect
  };
  const timer = setInterval(tick, 33);
  if (timer.unref) timer.unref();
  return hub;

  function hot() {
    return !!(matches.size || queues[1].size || queues[3].size || watchers.size);
  }

  function wake() {
    if (hub.poke) { try { hub.poke(); } catch (e) {} }
  }

  function modeNeed(mode) {
    return mode === 1 ? NEED_DUEL : NEED;
  }

  function queueOf(mode) {
    return mode === 1 ? queues[1] : queues[3];
  }

  function inQueue(id) {
    if (queues[1].has(id)) return queues[1].get(id);
    if (queues[3].has(id)) return queues[3].get(id);
    return null;
  }

  function removeQueued(id) {
    queues[1].delete(id);
    queues[3].delete(id);
  }

  function onlineCount() {
    const ids = new Set();
    for (const id of watchers.keys()) ids.add(id);
    for (const id of queues[1].keys()) ids.add(id);
    for (const id of queues[3].keys()) ids.add(id);
    for (const match of matches) for (const id of match.players.keys()) ids.add(id);
    return ids.size;
  }

  function presenceMsg() {
    return { t: 'presence', online: onlineCount() };
  }

  function tellPresence() {
    const msg = presenceMsg();
    const seen = new Set();
    const once = (ws) => {
      if (!ws || seen.has(ws)) return;
      seen.add(ws);
      send(ws, msg);
    };
    for (const p of watchers.values()) once(p.ws);
    for (const p of queues[1].values()) once(p.ws);
    for (const p of queues[3].values()) once(p.ws);
    for (const match of matches) for (const p of match.players.values()) once(p.ws);
  }

  function lobbyMsg(mode) {
    const q = queueOf(mode);
    const names = [];
    for (const p of q.values()) names.push({ id: p.id, name: p.name });
    return { t: 'lobby', n: names.length, need: modeNeed(mode), mode: mode, names: names, online: onlineCount(), busy: false };
  }

  function tellLobby() {
    for (const mode of [1, 3]) {
      const msg = lobbyMsg(mode);
      for (const p of queueOf(mode).values()) send(p.ws, msg);
    }
    tellPresence();
  }

  function connect(ws) {
    const conn = { ws: ws, msgs: 0, win: Date.now(), id: null };
    bySock.set(ws, conn);
    const onMsg = (ev) => {
      const now = Date.now();
      if (now - conn.win > 1000) { conn.win = now; conn.msgs = 0; }
      conn.msgs++;
      if (conn.msgs > 40) return;
      let data = ev && ev.data != null ? ev.data : ev;
      if (typeof data !== 'string') {
        try { data = String(data); } catch (e) { return; }
      }
      let msg;
      try { msg = JSON.parse(data); } catch (e) { return; }
      if (!msg || typeof msg.t !== 'string') return;
      onClient(conn, msg);
    };
    const onClose = () => dropSock(ws);
    if (ws.addEventListener) {
      ws.addEventListener('message', onMsg);
      ws.addEventListener('close', onClose);
      ws.addEventListener('error', onClose);
    } else {
      ws.onmessage = onMsg;
      ws.onclose = onClose;
    }
    wake();
  }

  function dropSock(ws) {
    const conn = bySock.get(ws);
    bySock.delete(ws);
    if (!conn || !conn.id) return;
    if (watchers.has(conn.id) && watchers.get(conn.id).ws === ws) watchers.delete(conn.id);
    const queued = inQueue(conn.id);
    const leftQueue = !!(queued && queued.ws === ws);
    if (leftQueue) removeQueued(conn.id);
    const match = matchOf(conn.id);
    if (match) {
      const p = match.players.get(conn.id);
      if (p.ws === ws) {
        match.players.delete(conn.id);
        if (match.players.size === 0) matches.delete(match);
      }
    }
    if (leftQueue) tellLobby();
    else tellPresence();
    wake();
  }

  function matchOf(id) {
    for (const match of matches) if (match.players.has(id)) return match;
    return null;
  }

  function findPlayer(id) {
    const match = matchOf(id);
    if (match) return match.players.get(id);
    return inQueue(id);
  }

  function onClient(conn, msg) {
    if (msg.t === 'watch') return watch(conn, msg);
    if (msg.t === 'join' || msg.t === 'ready') return join(conn, msg);
    if (msg.t === 'ping') { send(conn.ws, { t: 'pong', c: +msg.c || 0 }); return; }
    const p = conn.id ? findPlayer(conn.id) : null;
    if (!p || p.ws !== conn.ws) return;
    if (msg.t === 'arm') return setArm(p, msg);
    if (msg.t === 'pos') return setPos(p, msg);
    if (msg.t === 'shot') return onShot(p, msg);
    if (msg.t === 'claim') return onClaim(p, msg);
    if (msg.t === 'leave') {
      try { conn.ws.close(); } catch (e) {}
      dropSock(conn.ws);
    }
  }

  function kickOther(id, ws) {
    const oldW = watchers.get(id);
    if (oldW && oldW.ws !== ws) { send(oldW.ws, { t: 'kick', m: 'Connessione sostituita' }); try { oldW.ws.close(); } catch (e) {} watchers.delete(id); }
    const oldL = inQueue(id);
    if (oldL && oldL.ws !== ws) { send(oldL.ws, { t: 'kick', m: 'Connessione sostituita' }); try { oldL.ws.close(); } catch (e) {} removeQueued(id); }
    const match = matchOf(id);
    if (match) {
      const old = match.players.get(id);
      if (old.ws !== ws) { send(old.ws, { t: 'kick', m: 'Connessione sostituita' }); try { old.ws.close(); } catch (e) {} match.players.delete(id); if (!match.players.size) matches.delete(match); }
    }
  }

  function watch(conn, msg) {
    const id = cleanId(msg.id);
    if (!id) { send(conn.ws, { t: 'err', m: 'Identità mancante' }); return; }
    kickOther(id, conn.ws);
    conn.id = id;
    const queued = inQueue(id);
    const match = matchOf(id);
    const playing = match ? match.players.get(id) : null;
    if (queued && queued.ws === conn.ws) { send(conn.ws, lobbyMsg(queued.mode)); return; }
    if (playing && playing.ws === conn.ws) { send(conn.ws, presenceMsg()); return; }
    watchers.set(id, { id: id, name: cleanName(msg.name), ws: conn.ws });
    tellPresence();
    wake();
  }

  function join(conn, msg) {
    const id = cleanId(msg.id);
    const name = cleanName(msg.name);
    const weapon = GUNS[msg.weapon] ? msg.weapon : 'knife';
    const mode = Number(msg.mode) === 1 ? 1 : 3;
    if (!id) { send(conn.ws, { t: 'err', m: 'Identità mancante' }); return; }
    const match = matchOf(id);
    if (match && match.players.get(id).ws === conn.ws) {
      send(conn.ws, { t: 'no', m: 'Sei già in partita' });
      return;
    }
    const prev = inQueue(id);
    const keptJoined = prev && prev.ws === conn.ws && prev.mode === mode ? prev.joined : 0;
    kickOther(id, conn.ws);
    watchers.delete(id);
    removeQueued(id);
    conn.id = id;
    const p = {
      id: id, name: name, weapon: weapon, ws: conn.ws, mode: mode,
      team: -1, x: 0, z: 0, yaw: 0, pitch: 0,
      hp: 100, alive: false, ammo: 0, magSize: 0,
      buffs: { dmg: 0, spd: 0, arm: 0 },
      lastShot: 0, respawnAt: 0, invuln: 0, tp: 0, slot: 0,
      joined: keptJoined || Date.now()
    };
    queueOf(mode).set(id, p);
    tellLobby();
    tryStart();
    wake();
  }

  function setArm(p, msg) {
    if (!inQueue(p.id) || matchOf(p.id)) return;
    if (GUNS[msg.weapon]) p.weapon = msg.weapon;
    tellLobby();
  }

  function tryStart() {
    for (const mode of [1, 3]) {
      while (queueOf(mode).size >= modeNeed(mode)) startMatch(mode);
    }
  }

  function startMatch(mode) {
    const need = modeNeed(mode);
    const picked = [];
    for (const p of queueOf(mode).values()) {
      picked.push(p);
      if (picked.length === need) break;
    }
    for (const p of picked) removeQueued(p.id);
    const now = Date.now();
    const match = {
      id: now,
      mode: mode,
      t0: now,
      ends: now + MATCH_MS,
      scores: [0, 0],
      players: new Map(),
      pickups: [],
      nextSpawn: now + 7000,
      seq: 1,
      teams: [0, 0]
    };
    matches.add(match);
    picked.forEach((p, i) => {
      const team = mode === 1 ? i : (i % 2);
      p.team = team;
      p.slot = mode === 1 ? 0 : match.teams[team]++;
      const sp = SPAWNS[team][mode === 1 ? 1 : (p.slot % 3)];
      p.x = sp[0];
      p.z = sp[1];
      p.yaw = team === 0 ? -Math.PI / 2 : Math.PI / 2;
      p.pitch = 0;
      p.hp = 100;
      p.alive = true;
      p.invuln = now + INVULN_MS;
      p.respawnAt = 0;
      p.buffs = { dmg: 0, spd: 0, arm: 0 };
      const g = gunOf(p.weapon);
      p.magSize = g.mag || 0;
      p.ammo = g.melee ? -1 : (g.mag + g.reserve);
      p.tp = 1;
      p.hist = [];
      match.players.set(p.id, p);
    });
    for (let n = 0; n < 6; n++) spawnPickup(match, true);
    for (const p of match.players.values()) {
      send(p.ws, {
        t: 'start',
        mode: mode,
        team: p.team,
        slot: p.slot,
        x: p.x, z: p.z, yaw: p.yaw,
        ends: match.ends,
        left: MATCH_MS,
        scores: match.scores,
        weapon: p.weapon,
        mag: p.magSize,
        ammo: p.ammo,
        players: roster(match),
        pickups: pickupList(match)
      });
      p.tp = 0;
    }
    tellLobby();
  }

  function roster(m) {
    const arr = [];
    for (const p of m.players.values()) arr.push({ id: p.id, name: p.name, team: p.team, weapon: p.weapon });
    return arr;
  }

  function pickupList(m) {
    return m.pickups.map((q) => ({ id: q.id, k: q.k, x: q.x, z: q.z }));
  }

  function spawnPickup(m, force) {
    if (!force && m.pickups.length >= 10) { m.nextSpawn = Date.now() + 4000; return; }
    let guard = 0;
    let spot = SPOTS[spotCursor % SPOTS.length];
    spotCursor++;
    while (guard < SPOTS.length && m.pickups.some((q) => Math.hypot(q.x - spot[0], q.z - spot[1]) < 3)) {
      spot = SPOTS[spotCursor % SPOTS.length];
      spotCursor++;
      guard++;
    }
    const k = KIND_CYCLE[(m.seq + spotCursor) % KIND_CYCLE.length];
    const item = { id: m.seq++, k: k, x: spot[0], z: spot[1] };
    m.pickups.push(item);
    m.nextSpawn = Date.now() + 8000;
    if (!force) {
      for (const p of m.players.values()) send(p.ws, { t: 'spawn', pickup: item });
    }
  }

  function setPos(p, msg) {
    const match = matchOf(p.id);
    if (!match || !match.players.has(p.id) || !p.alive) return;
    const x = +msg.x, z = +msg.z;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;
    const dx = x - p.x, dz = z - p.z;
    if (dx * dx + dz * dz > 64) return;
    const d = Math.hypot(x, z);
    if (d > ARENA_R) {
      p.x = x * (ARENA_R / d);
      p.z = z * (ARENA_R / d);
    } else {
      p.x = x;
      p.z = z;
    }
    const h = p.hist || (p.hist = []);
    h.push({ t: Date.now(), x: p.x, z: p.z });
    if (h.length > 24) h.shift();
    if (Number.isFinite(+msg.yaw)) p.yaw = +msg.yaw;
    if (Number.isFinite(+msg.pitch)) p.pitch = Math.max(-1.4, Math.min(1.4, +msg.pitch));
  }

  function posAt(o, t) {
    const h = o.hist;
    if (!h || !h.length || o.tp) return null;
    if (t >= h[h.length - 1].t) return null;
    for (let i = h.length - 1; i > 0; i--) {
      const b = h[i], a = h[i - 1];
      if (t >= a.t) {
        const k = (t - a.t) / Math.max(1, b.t - a.t);
        return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k };
      }
    }
    return { x: h[0].x, z: h[0].z };
  }

  function onShot(p, msg) {
    const match = matchOf(p.id);
    if (!match || !match.players.has(p.id) || !p.alive) return;
    const now = Date.now();
    const g = gunOf(p.weapon);
    if (now - p.lastShot < g.rate * 1000 * 0.82) return;
    if (!g.melee && p.ammo === 0) return;
    let dx = +msg.dx, dy = +msg.dy, dz = +msg.dz;
    const len = Math.hypot(dx, dy, dz);
    if (!(len > 0.2)) return;
    dx /= len; dy /= len; dz /= len;
    const ox = +msg.x, oy = +msg.y, oz = +msg.z;
    if (!Number.isFinite(ox) || !Number.isFinite(oy) || !Number.isFinite(oz)) return;
    if (Math.hypot(ox - p.x, oz - p.z) > 3 || oy < 0.6 || oy > 2.4) return;
    p.lastShot = now;
    // v4.3.76 lag compensation: the shooter sees the others ~lag ms in the past (interpolation + round trip)
    const lag = Number.isFinite(+msg.lag) ? Math.max(0, Math.min(350, +msg.lag)) : 0;
    if (!g.melee) p.ammo = Math.max(0, p.ammo - 1);
    let best = null;
    let bestId = null;
    for (const o of match.players.values()) {
      if (o.id === p.id || !o.alive || o.team === p.team) continue;
      if (now < o.invuln) continue;
      const at = lag > 0 ? posAt(o, now - lag) : null;
      const hit = capsule(ox, oy, oz, dx, dy, dz, at ? at.x : o.x, at ? at.z : o.z, g.range);
      if (!hit) continue;
      if (!best || hit.along < best.along) { best = hit; bestId = o.id; }
    }
    if (best) {
      let blocked = false;
      for (const b of BLOCKS) {
        const t = rayAabb(ox, oy, oz, dx, dy, dz, b, best.along);
        if (t != null && t < best.along - 0.35) { blocked = true; break; }
      }
      if (blocked) best = null;
    }
    if (!best) return;
    const victim = match.players.get(bestId);
    let dmg = g.dmg;
    if (g.pellets > 1) dmg *= Math.min(g.pellets, 6);
    if (g.fall) dmg *= Math.max(g.fmin || 0.2, 1 - best.along / Math.max(1, g.range) * g.fall);
    if (best.part === 'head') dmg *= 2;
    if (p.buffs.dmg > now) dmg *= 1.4;
    if (victim.buffs.arm > now) dmg *= 0.62;
    dmg = Math.max(1, Math.round(dmg));
    victim.hp -= dmg;
    const fx = { t: 'fx', by: p.id, victim: victim.id, part: best.part, dmg: dmg, hp: Math.max(0, victim.hp) };
    if (victim.hp <= 0) {
      victim.hp = 0;
      victim.alive = false;
      victim.respawnAt = now + RESPAWN_MS;
      victim.buffs = { dmg: 0, spd: 0, arm: 0 };
      match.scores[p.team] += 1;
      fx.kill = 1;
      fx.scores = match.scores.slice();
    }
    for (const o of match.players.values()) send(o.ws, fx);
  }

  function onClaim(p, msg) {
    const match = matchOf(p.id);
    if (!match || !match.players.has(p.id) || !p.alive) return;
    const id = msg.id | 0;
    const ix = match.pickups.findIndex((q) => q.id === id);
    if (ix < 0) return;
    const item = match.pickups[ix];
    if (Math.hypot(p.x - item.x, p.z - item.z) > 2.3) return;
    const now = Date.now();
    if (item.k === 'med' && p.hp >= 100) { send(p.ws, { t: 'no', m: 'Vita già piena' }); return; }
    if (item.k === 'ammo' && !gunOf(p.weapon).melee) {
      const g = gunOf(p.weapon);
      const cap = g.mag + g.reserve * 2;
      if (p.ammo >= cap) { send(p.ws, { t: 'no', m: 'Munizioni piene' }); return; }
      p.ammo = Math.min(cap, p.ammo + g.mag * 2);
    }
    if (item.k === 'med') p.hp = Math.min(100, p.hp + 45);
    if (item.k === 'dmg' || item.k === 'spd' || item.k === 'arm') p.buffs[item.k] = now + BUFF_MS[item.k];
    match.pickups.splice(ix, 1);
    for (const o of match.players.values()) send(o.ws, { t: 'taken', id: id, by: p.id, k: item.k });
  }

  function tick() {
    const now = Date.now();
    for (const match of matches) tickMatch(match, now);
  }

  function tickMatch(match, now) {
    for (const p of match.players.values()) {
      if (!p.alive && p.respawnAt && now >= p.respawnAt) {
        const sp = SPAWNS[p.team][match.mode === 1 ? 1 : (p.slot % 3)];
        p.x = sp[0];
        p.z = sp[1];
        p.yaw = p.team === 0 ? -Math.PI / 2 : Math.PI / 2;
        p.hp = 100;
        p.alive = true;
        p.invuln = now + INVULN_MS;
        p.respawnAt = 0;
        p.tp = 1;
        p.hist = [];
      }
    }
    if (now >= match.nextSpawn) spawnPickup(match, false);
    if (now >= match.ends) { endMatch(match); return; }
    if (match.lastSnap && now - match.lastSnap < 62) return;
    match.lastSnap = now;
    const basePlayers = [];
    for (const p of match.players.values()) {
      basePlayers.push({
        id: p.id, name: p.name, team: p.team, weapon: p.weapon,
        x: +p.x.toFixed(2), z: +p.z.toFixed(2), yaw: +p.yaw.toFixed(3), pitch: +p.pitch.toFixed(3),
        hp: p.hp | 0, alive: p.alive ? 1 : 0
      });
    }
    const left = Math.max(0, match.ends - now);
    const scores = match.scores.slice();
    const picks = pickupList(match);
    for (const p of match.players.values()) {
      const you = {
        hp: p.hp | 0,
        ammo: p.ammo | 0,
        alive: p.alive ? 1 : 0,
        respawnIn: (!p.alive && p.respawnAt) ? Math.max(0, p.respawnAt - now) : 0,
        buffs: {
          dmg: Math.max(0, p.buffs.dmg - now),
          spd: Math.max(0, p.buffs.spd - now),
          arm: Math.max(0, p.buffs.arm - now)
        },
        tp: p.tp ? 1 : 0,
        x: +p.x.toFixed(2),
        z: +p.z.toFixed(2),
        yaw: +p.yaw.toFixed(3)
      };
      send(p.ws, { t: 'snap', players: basePlayers, scores: scores, left: left, you: you, pickups: picks });
      p.tp = 0;
    }
  }

  function endMatch(m) {
    if (!matches.delete(m)) return;
    const winner = m.scores[0] === m.scores[1] ? -1 : (m.scores[0] > m.scores[1] ? 0 : 1);
    for (const p of m.players.values()) {
      send(p.ws, { t: 'end', scores: m.scores.slice(), winner: winner });
    }
    tryStart();
    tellLobby();
    wake();
  }
}
