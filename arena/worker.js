// Cloudflare Durable Object: one arena hub, WebSocket, same rules as arena/server.mjs.
import { createHub } from './logic.mjs';

export class ArenaRoom {
  constructor(state) {
    this.ctx = state;
    this.hub = createHub();
    this.hub.poke = () => {
      try { this.ctx.storage.setAlarm(Date.now() + 250); } catch (e) {}
    };
  }
  async alarm() {
    try { this.hub.tick(); } catch (e) {}
    if (this.hub.hot()) {
      try { await this.ctx.storage.setAlarm(Date.now() + 250); } catch (e) {}
    }
  }
  async fetch(req) {
    const upgrade = req.headers.get('Upgrade') || '';
    if (upgrade.toLowerCase() !== 'websocket') {
      return new Response(JSON.stringify({ ok: true, arena: true, v: 476 }), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' }
      });
    }
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.hub.connect(server);
    try { await this.ctx.storage.setAlarm(Date.now() + 250); } catch (e) {}
    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(req, env) {
    const id = env.ARENA.idFromName('arena456');
    return env.ARENA.get(id).fetch(req);
  }
};
