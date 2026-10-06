// Local real-time arena server (same rules as the Cloudflare worker).
//   node arena/server.mjs
// Listens on PORT or 8791. WebSocket path is anything; GET / returns health JSON.

import http from 'http';
import crypto from 'crypto';
import { createHub } from './logic.mjs';

const port = Number(process.env.PORT || 8791);
const hub = createHub();
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function wsSend(socket, text) {
  const payload = Buffer.from(String(text));
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeUInt32BE(0, 2);
    header.writeUInt32BE(len, 6);
  }
  if (!socket.destroyed) socket.write(Buffer.concat([header, payload]));
}

function attach(socket) {
  let buf = Buffer.alloc(0);
  let frags = '';
  const listeners = { message: new Set(), close: new Set(), error: new Set() };
  const ws = {
    send(text) { wsSend(socket, text); },
    close() { try { socket.end(); } catch (e) {} },
    addEventListener(type, fn) { if (listeners[type]) listeners[type].add(fn); }
  };
  const emit = (type, ev) => { for (const fn of listeners[type]) { try { fn(ev); } catch (e) {} } };
  socket.on('data', (chunk) => {
    buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
    while (buf.length >= 2) {
      const b0 = buf[0], b1 = buf[1];
      const opcode = b0 & 0x0f;
      const fin = (b0 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) {
        if (buf.length < 4) return;
        len = buf.readUInt16BE(2);
        off = 4;
      } else if (len === 127) {
        if (buf.length < 10) return;
        const hi = buf.readUInt32BE(2);
        len = hi * 0x100000000 + buf.readUInt32BE(6);
        off = 10;
      }
      const masked = (b1 & 0x80) !== 0;
      const maskLen = masked ? 4 : 0;
      if (buf.length < off + maskLen + len) return;
      const mask = masked ? buf.subarray(off, off + 4) : null;
      off += maskLen;
      const payload = Buffer.from(buf.subarray(off, off + len));
      if (mask) { for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3]; }
      buf = buf.subarray(off + len);
      if (opcode === 8) { socket.end(); return; }
      if (opcode === 9) {
        const pong = Buffer.alloc(2 + payload.length);
        pong[0] = 0x8a;
        pong[1] = payload.length;
        payload.copy(pong, 2);
        if (!socket.destroyed) socket.write(pong);
        continue;
      }
      if (opcode === 1 || opcode === 0) {
        frags += payload.toString('utf8');
        if (fin) {
          const text = frags;
          frags = '';
          emit('message', { data: text });
        }
      }
    }
  });
  socket.on('close', () => emit('close', {}));
  socket.on('error', () => emit('error', {}));
  hub.connect(ws);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify({ ok: true, arena: true }));
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  );
  socket.setNoDelay(true);
  attach(socket);
});

server.listen(port, '0.0.0.0', () => {
  console.log('arena listening ' + port);
});
