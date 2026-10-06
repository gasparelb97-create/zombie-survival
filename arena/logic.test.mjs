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
