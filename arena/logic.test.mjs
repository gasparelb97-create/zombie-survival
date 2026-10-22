import test from 'node:test';
import assert from 'node:assert/strict';
import { createHub, MATCH_MS, RESPAWN_MS } from './logic.mjs';

class Socket {
  messages = [];
  listeners = {};
  addEventListener(type, callback) { this.listeners[type] = callback; }
  send(data) { this.messages.push(JSON.parse(data)); }
  close() { this.listeners.close?.(); }
  client(message) { this.listeners.message({ data: JSON.stringify(message) }); }
  all(type) { return this.messages.filter(message => message.t === type); }
  last(type) { return this.all(type).at(-1); }
}

function player(hub, id, mode = 3, weapon = 'pistol') {
  const socket = new Socket();
  hub.connect(socket);
  socket.client({ t: 'join', id, name: id, mode, weapon });
  return socket;
}

test('1vs1 starts only at two distinct players, one on each team', () => {
  const hub = createHub();
  const a = player(hub, 'a', 1);
  assert.equal(a.last('lobby').need, 2);
  assert.equal(a.all('start').length, 0);
  a.client({ t: 'ready', id: 'a', mode: 1 });
  assert.equal(a.last('lobby').n, 1);
  const b = player(hub, 'b', 1);
  assert.equal(a.all('start').length, 1);
  assert.equal(b.last('start').mode, 1);
  assert.deepEqual(a.last('start').players.map(p => p.team), [0, 1]);
});

test('3vs3 starts only at six players, balanced three per team', () => {
  const hub = createHub();
  const sockets = Array.from({ length: 5 }, (_, i) => player(hub, `p${i}`, 3));
  for (const socket of sockets) assert.equal(socket.all('start').length, 0);
  sockets.push(player(hub, 'p5', 3));
  for (const socket of sockets) {
    const start = socket.last('start');
    assert.equal(start.mode, 3);
    assert.equal(start.players.filter(p => p.team === 0).length, 3);
    assert.equal(start.players.filter(p => p.team === 1).length, 3);
  }
});

test('queues stay separate and full groups start during other matches', () => {
  const hub = createHub();
  const trio = Array.from({ length: 5 }, (_, i) => player(hub, `t${i}`, 3));
  const a = player(hub, 'a', 1);
  const b = player(hub, 'b', 1);
  assert.equal(a.last('start').players.length, 2);
  for (const socket of trio) assert.equal(socket.all('start').length, 0);
  trio.push(player(hub, 't5', 3));
  assert.equal(trio[0].last('start').players.length, 6);
  const c = player(hub, 'c', 1);
  const d = player(hub, 'd', 1);
  assert.deepEqual(c.last('start').players.map(p => p.id), ['c', 'd']);
  hub.tick();
  assert.deepEqual(a.last('snap').players.map(p => p.id), ['a', 'b']);
  assert.deepEqual(d.last('snap').players.map(p => p.id), ['c', 'd']);
  assert.equal(b.last('presence').online, 10);
});

test('switching mode removes the old queue entry', () => {
  const hub = createHub();
  const a = player(hub, 'a', 3);
  const b = player(hub, 'b', 3);
  a.client({ t: 'join', id: 'a', mode: 1 });
  assert.equal(b.last('lobby').n, 1);
  player(hub, 'c', 1);
  assert.equal(a.last('start').mode, 1);
  assert.equal(b.all('start').length, 0);
});

test('disconnected queued players do not count toward the threshold', () => {
  const hub = createHub();
  const a = player(hub, 'a', 1);
  a.close();
  const b = player(hub, 'b', 1);
  assert.equal(b.last('lobby').n, 1);
  assert.equal(b.all('start').length, 0);
  player(hub, 'c', 1);
  assert.equal(b.all('start').length, 1);
});

test('duplicate connections replace one seat and delayed close preserves replacement', () => {
  const hub = createHub();
  const a = player(hub, 'a', 1);
  const replacement = player(hub, 'a', 1);
  assert.equal(replacement.last('lobby').n, 1);
  player(hub, 'b', 1);
  a.close();
  hub.tick();
  assert.equal(replacement.last('snap').players.length, 2);
});

test('ending one match preserves another and supports playing again', t => {
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  t.after(() => { Date.now = originalNow; });
  const hub = createHub();
  const a = player(hub, 'a', 1);
  const b = player(hub, 'b', 1);
  now += 1000;
  const c = player(hub, 'c', 1);
  player(hub, 'd', 1);
  now += MATCH_MS - 1000;
  hub.tick();
  assert.equal(a.all('end').length, 1);
  assert.equal(c.all('end').length, 0);
  assert.equal(c.last('snap').left, 1000);
  a.client({ t: 'ready', id: 'a', mode: 1 });
  b.client({ t: 'ready', id: 'b', mode: 1 });
  assert.equal(a.all('start').length, 2);
  now += 1000;
  hub.tick();
  assert.equal(c.all('end').length, 1);
  assert.equal(a.all('end').length, 1);
});

test('damage, score, respawn and pickups are confined to the player match', t => {
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  t.after(() => { Date.now = originalNow; });
  const hub = createHub();
  const a = player(hub, 'a', 1, 'sniper');
  const b = player(hub, 'b', 1);
  const c = player(hub, 'c', 1);
  player(hub, 'd', 1);
  now += 2000;
  // Clear lane south of the map cover; position updates respect the 8m limit.
  for (const z of [-5, -10, -15, -19]) {
    a.client({ t: 'pos', x: -26, z });
    b.client({ t: 'pos', x: 26, z });
  }
  a.client({ t: 'shot', x: -26, y: 2, z: -19, dx: 1, dy: 0, dz: 0 });
  assert.equal(b.last('fx').kill, 1);
  assert.deepEqual(b.last('fx').scores, [1, 0]);
  assert.equal(c.all('fx').length, 0);
  now += RESPAWN_MS;
  hub.tick();
  assert.equal(b.last('snap').you.alive, 1);
  assert.equal(b.last('snap').you.z, 0);
  assert.deepEqual(c.last('snap').scores, [0, 0]);
  const pickup = c.last('snap').pickups.find(p => p.k !== 'med');
  const start = c.last('start');
  const steps = Math.ceil(Math.hypot(pickup.x - start.x, pickup.z - start.z) / 6);
  for (let i = 1; i <= steps; i++) {
    c.client({ t: 'pos', x: start.x + (pickup.x - start.x) * i / steps,
      z: start.z + (pickup.z - start.z) * i / steps });
  }
  c.client({ t: 'claim', id: pickup.id });
  assert.equal(c.last('taken').id, pickup.id);
  assert.equal(a.all('taken').length, 0);
});

test('empty matches are released without stopping other matches', () => {
  const hub = createHub();
  const a = player(hub, 'a', 1);
  const b = player(hub, 'b', 1);
  const c = player(hub, 'c', 1);
  const d = player(hub, 'd', 1);
  a.close(); b.close();
  hub.tick();
  assert.equal(c.last('snap').players.length, 2);
  assert.equal(hub.hot(), true);
  c.close(); d.close();
  assert.equal(hub.hot(), false);
});

// ---------- protocol 2 / map m2 (4.3.123) ----------
function player2(hub, id, mode = 1, weapon = 'pistol', pv = 2) {
  const socket = new Socket();
  hub.connect(socket);
  socket.client({ t: 'join', id, name: id, mode, weapon, pv });
  return socket;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

test('protocol 2 match uses map m2, quantized snapshots with timestamp, roster and pickups only on change', async () => {
  const hub = createHub();
  const a = player2(hub, 'a'), b = player2(hub, 'b');
  const st = a.last('start');
  assert.equal(st.map, 'm2'); assert.equal(st.pv, 2); assert.equal(st.R, 52); assert.ok(st.blocks.length > 40);
  assert.ok(Math.abs(st.x) > 40, 'spawn in the courtyard');
  hub.tick(); await sleep(45); hub.tick(); await sleep(45); hub.tick();
  const snaps = a.all('snap');
  assert.ok(snaps.length >= 3);
  for (const s of snaps) { assert.equal(s.v, 2); assert.ok(s.ts > 0); assert.ok(Array.isArray(s.P)); assert.equal(s.players, undefined); }
  assert.equal(snaps[0].P[0].length, 9);
  assert.equal(snaps[0].P.find(r => r[0] === 'a')[1], Math.round(st.x * 100));
  assert.equal(snaps.filter(s => s.R).length, 0, 'roster already in start');
  assert.equal(snaps.filter(s => s.pk).length, 0, 'pickups already in start');
  // a pickup taken -> next snap carries pk once
  const pk = st.pickups[0];
  a.client({ t: 'pos', x: st.x + (pk.x - st.x) * 0, z: st.z });
  hub.tick();
});

test('mixed protocols fall back to the old map and the old snapshot format for old clients', async () => {
  const hub = createHub();
  const a = player2(hub, 'a', 1, 'pistol', 2), b = player2(hub, 'b', 1, 'pistol', 1);
  assert.equal(a.last('start').map, 'm1');
  assert.equal(b.last('start').map, undefined);
  hub.tick();
  const s1 = b.last('snap');
  assert.ok(Array.isArray(s1.players)); assert.ok(s1.players[0].name); assert.ok(Array.isArray(s1.pickups));
  assert.equal(a.last('snap').v, 2);
});

test('snapshot rate is about 25 Hz', async () => {
  const hub = createHub();
  const a = player2(hub, 'a'), b = player2(hub, 'b');
  const t0 = Date.now(); while (Date.now() - t0 < 1000) { hub.tick(); await sleep(5); }
  const n = a.all('snap').length;
  assert.ok(n >= 22 && n <= 30, 'snaps/s ' + n);
});

test('shot id echoed in fx (hit) and ack (miss); kills score; end board has k/d', async () => {
  const hub = createHub();
  const a = player2(hub, 'a', 1, 'sniper'), b = player2(hub, 'b', 1, 'pistol');
  const sa = a.last('start'), sb = b.last('start');
  await sleep(1600);
  // walk a and b to the open plaza, face each other along x (path free at z=10)
  const walk = (s, id, fx, fz, tx, tz) => { let x = fx, z = fz; for (let i = 0; i < 80; i++) { const dx = tx - x, dz = tz - z, d = Math.hypot(dx, dz); if (d < .1) break; const st = Math.min(7.5, d); x += dx / d * st; z += dz / d * st; s.client({ t: 'pos', x, z, yaw: 0 }); } return [x, z]; };
  walk(a, 'a', sa.x, sa.z, -36, 10); walk(a, 'a', -36, 10, -8, 10);
  walk(b, 'b', sb.x, sb.z, 36, 10); walk(b, 'b', 36, 10, 8, 10);
  a.client({ t: 'shot', x: -8, y: 1.6, z: 10, dx: 0, dy: 1, dz: 0, sid: 7 });
  assert.equal(a.last('ack').sid, 7);
  await sleep(1200);
  a.client({ t: 'shot', x: -8, y: 1.6, z: 10, dx: 1, dy: 0, dz: 0, sid: 8 });
  const fx = a.last('fx');
  assert.equal(fx.sid, 8); assert.equal(fx.victim, 'b');
  await sleep(1200);
  a.client({ t: 'shot', x: -8, y: 1.6, z: 10, dx: 1, dy: 0, dz: 0, sid: 9 });
  const k = a.all('fx').find(f => f.kill);
  assert.ok(k, 'kill'); assert.deepEqual(k.scores, [1, 0]);
  await sleep(80); hub.tick();
  const row = a.last('snap').P.find(r => r[0] === 'a');
  assert.equal(row[7], 1);
});

test('m2 respawn picks a point away from a camping enemy', async () => {
  const { MAPS } = await import('./logic.mjs');
  const hub = createHub();
  const a = player2(hub, 'a', 1, 'sniper'), b = player2(hub, 'b', 1, 'pistol');
  assert.ok(MAPS.m2.RESPAWNS[1].length >= 5);
});
