var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var ORIGIN = "https://gasparelb97-create.github.io";
var CAP_K = 5e3;
var CAP_W = 500;
var CAP_S = 5e7;
var RATE_S = 20;
var AUTH_MAX_S = 86400;
var TOP_N = 50;
var CACHE_S = 30;
var maxKills = /* @__PURE__ */ __name((w) => 80 * w + 60, "maxKills");
function cors() {
  return {
    "Access-Control-Allow-Origin": ORIGIN,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Admin",
    "Access-Control-Max-Age": "86400"
  };
}
__name(cors, "cors");
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors(), ...extra } });
}
__name(json, "json");
var FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  weekday: "short"
});
function romeParts(ms) {
  const o = {};
  for (const p of FMT.formatToParts(new Date(ms)))
    o[p.type] = p.value;
  return o;
}
__name(romeParts, "romeParts");
function romeOffset(ms) {
  const o = romeParts(ms);
  return Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute, +o.second) - Math.floor(ms / 1e3) * 1e3;
}
__name(romeOffset, "romeOffset");
function weekStart(now = Date.now()) {
  const o = romeParts(now), wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(o.weekday);
  const wall = Date.UTC(+o.year, +o.month - 1, +o.day - Math.max(0, wd), 0, 0, 0);
  let t = wall - romeOffset(wall);
  t = wall - romeOffset(t);
  return t;
}
__name(weekStart, "weekStart");
var enc = new TextEncoder();
async function hmac(keyBytes, msg) {
  const k = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, typeof msg === "string" ? enc.encode(msg) : msg));
}
__name(hmac, "hmac");
var hex = /* @__PURE__ */ __name((b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join(""), "hex");
function safeEq(a, b) {
  if (a.length !== b.length)
    return false;
  let r = 0;
  for (let i = 0; i < a.length; i++)
    r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
__name(safeEq, "safeEq");
// ===== 4.3.82 device identity (APK without Telegram) =====
// POST /dev/register {did, sec, nick} -> {ok, token}. Token "zsd1.<payload>.<sig>" is accepted wherever initData is (checkInitData).
// HMAC key: env.DEV_KEY if set, else derived from BOT_TOKEN. Secret stored only as SHA-256 hash.
const DEV_TTL_S = 30 * 86400;
function b64u(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unb64u(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
function devNick(n) { n = String(n || "").replace(/[\u0000-\u001f<>&"'`]/g, "").replace(/\s+/g, " ").trim().slice(0, 20); return n.length >= 2 ? n : "Sopravvissuto"; }
async function devSign(key, payload) { return hex(await hmac(enc.encode("zsdev:" + key), payload)).slice(0, 48); }
async function checkDevToken(t, key) {
  if (!key) return null; const a = t.split("."); if (a.length !== 3) return null;
  if (!safeEq(await devSign(key, a[1]), a[2])) return null;
  let p; try { p = JSON.parse(unb64u(a[1])); } catch (e) { return null; }
  if (!p || !p.d || !p.e) return null; if (Date.now() / 1e3 > p.e) return { expired: true };
  return { id: "d" + p.d, name: devNick(p.n), dev: true };
}
async function devRegister(req, env) {
  let p; try { p = await readJson(req); } catch (e) { return json({ ok: false, err: "bad_json" }, 400); }
  const did = String(p.did || ""), sec = String(p.sec || "");
  if (!/^[a-f0-9]{16,32}$/.test(did) || !/^[a-f0-9]{32,64}$/.test(sec)) return json({ ok: false, err: "bad_id" }, 400);
  const key = env.DEV_KEY || env.BOT_TOKEN; if (!key) return json({ ok: false, err: "no_key" }, 500);
  const sh = hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(sec))));
  const rec = await env.ZS.get("dev:" + did, "json"); const nick = devNick(p.nick);
  if (rec) { if (!safeEq(rec.h, sh)) return json({ ok: false, err: "bad_secret" }, 403); }
  else {
    const ip = req.headers.get("cf-connecting-ip") || "x", day = new Date().toISOString().slice(0, 10), k = "devrl:" + ip + day;
    const c = +(await env.ZS.get(k) || 0); if (c >= 15) return json({ ok: false, err: "rate" }, 429);
    await env.ZS.put(k, String(c + 1), { expirationTtl: 86400 });
  }
  await env.ZS.put("dev:" + did, JSON.stringify({ h: sh, n: nick, c: rec ? rec.c : Date.now(), l: Date.now() }));
  const pl = b64u(JSON.stringify({ d: did, n: nick, e: Math.floor(Date.now() / 1e3) + DEV_TTL_S }));
  return json({ ok: true, token: "zsd1." + pl + "." + await devSign(key, pl), id: "d" + did, name: nick, ttl: DEV_TTL_S });
}

async function checkInitData(initData, token) {
  if (typeof initData === "string" && initData.startsWith("zsd1.")) return await checkDevToken(initData, (globalThis.__ZS_DEVKEY || token));
  if (typeof initData !== "string" || initData.length > 4096 || !token)
    return null;
  const p = new URLSearchParams(initData), hash = p.get("hash");
  if (!hash)
    return null;
  p.delete("hash");
  const dcs = [...p.entries()].map(([k, v]) => k + "=" + v).sort().join("\n");
  const secret = await hmac(enc.encode("WebAppData"), token);
  if (!safeEq(hex(await hmac(secret, dcs)), hash.toLowerCase()))
    return null;
  const ad = parseInt(p.get("auth_date") || "0", 10);
  if (!ad || Date.now() / 1e3 - ad > AUTH_MAX_S)
    return { expired: true };
  let u;
  try {
    u = JSON.parse(p.get("user") || "null");
  } catch (e) {
    u = null;
  }
  if (!u || !u.id || u.is_bot)
    return null;
  const nm = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return { id: String(u.id), name: (nm || (u.username ? "@" + u.username : "Sopravvissuto")).slice(0, 32) };
}
__name(checkInitData, "checkInitData");
var int = /* @__PURE__ */ __name((v, lo, hi) => typeof v !== "number" || !Number.isFinite(v) || Math.trunc(v) < lo ? null : Math.min(Math.trunc(v), hi), "int");
async function loadWeek(env, key) {
  const W = await env.ZS.get("wk:" + key, "json");
  return W && W.u ? W : { u: {}, seen: {} };
}
__name(loadWeek, "loadWeek");
// v4.3.80: one KV key per player and week (wu:<week>:<uid>) instead of one shared blob per week.
// The old shared blob lost scores when two players (or two edge locations) wrote at the same time
// (read-modify-write on an eventually consistent KV = last write wins). Each player now only writes
// their own key; the board is the list of those keys (record in the key metadata). The old blob of
// the week (wk:<week>) is still read and merged, so nothing already counted is lost.
var RID_KEEP = 80;
function recMeta(r) {
  return { n: String(r.name || "").slice(0, 32), k: r.k | 0, s: r.s | 0, c: r.n | 0, bk: r.bk | 0, bs: r.bs | 0, bw: r.bw | 0, ts: r.ts | 0 };
}
__name(recMeta, "recMeta");
async function loadBoard(env, key) {
  const old = await loadWeek(env, key), u = {};
  for (const [id, r] of Object.entries(old.u)) u[id] = { name: r.name, k: r.k | 0, s: r.s | 0, n: r.n | 0, bk: r.bk | 0, bs: r.bs | 0, bw: r.bw | 0, ts: r.ts | 0 };
  let cur, guard = 0;
  do {
    const L = await env.ZS.list({ prefix: "wu:" + key + ":", cursor: cur, limit: 1000 });
    for (const k of L.keys) {
      const id = k.name.slice(("wu:" + key + ":").length), m = k.metadata;
      if (m && typeof m.k === "number") u[id] = { name: m.n, k: m.k, s: m.s, n: m.c, bk: m.bk, bs: m.bs, bw: m.bw, ts: m.ts };
      else { const r = await env.ZS.get(k.name, "json"); if (r) u[id] = r; }
    }
    cur = L.list_complete ? null : L.cursor;
  } while (cur && ++guard < 50);
  return { u };
}
__name(loadBoard, "loadBoard");
async function postScore(req, env) {
  let p;
  try {
    const t = await req.text();
    if (t.length > 8192)
      throw 0;
    p = JSON.parse(t);
  } catch (e) {
    return json({ ok: false, err: "bad_json" }, 400);
  }
  if (!p || typeof p !== "object")
    return json({ ok: false, err: "bad_json" }, 400);
  if (!p.initData)
    return json({ ok: false, err: "no_telegram" }, 403);
  const user = await checkInitData(p.initData, env.BOT_TOKEN);
  if (!user)
    return json({ ok: false, err: "bad_auth" }, 403);
  if (user.expired)
    return json({ ok: false, err: "auth_expired" }, 403);
  if (p.d === "facile")
    return json({ ok: false, err: "facile" }, 422);
  const k = int(p.k, 0, CAP_K), w = int(p.w, 1, CAP_W), s = int(p.s, 0, CAP_S);
  if (k === null || w === null || s === null || k >= CAP_K || k > maxKills(w))
    return json({ ok: false, err: "implausible" }, 422);
  const rid = typeof p.r === "string" && /^[A-Za-z0-9]{1,12}$/.test(p.r) ? p.r : null;
  if (!rid)
    return json({ ok: false, err: "bad_run_id" }, 400);
  const now = Date.now(), key = String(weekStart(now));
  if (typeof p.wk === "number" && Math.abs(p.wk - +key) > 3 * 3600 * 1e3)
    return json({ ok: false, err: "old_week" }, 409);
  const uk = "wu:" + key + ":" + user.id;
  let rec = await env.ZS.get(uk, "json");
  if (!rec) {
    // first send of this week under the new layout: start from what the old shared blob already counted
    const W = await loadWeek(env, key), o = W.u[user.id];
    rec = o ? { name: o.name, k: o.k | 0, s: o.s | 0, n: o.n | 0, bk: o.bk | 0, bs: o.bs | 0, bw: o.bw | 0, ts: o.ts | 0, lt: o.lt || 0, rids: [] } : null;
    if (rec && W.seen[rid]) return json({ ok: true, dup: true, week: key, me: rec });
  }
  if (rec && Array.isArray(rec.rids) && rec.rids.includes(rid))
    return json({ ok: true, dup: true, week: key, me: rec });
  if (rec && now - (rec.lt || 0) < RATE_S * 1e3)
    return json({ ok: false, err: "rate", retry: Math.ceil((RATE_S * 1e3 - (now - rec.lt)) / 1e3) }, 429);
  const ts = Math.floor(now / 1e3);
  if (!rec)
    rec = { name: user.name, k, s, n: 1, bk: k, bs: s, bw: w, ts, lt: now, rids: [rid] };
  else {
    const better = k > (rec.bk | 0) || k === (rec.bk | 0) && s > (rec.bs || 0);
    Object.assign(rec, { name: user.name, k: (rec.k | 0) + k, s: (rec.s | 0) + s, n: (rec.n | 0) + 1, ts, lt: now });
    if (better)
      Object.assign(rec, { bk: k, bs: s, bw: w });
    rec.rids = (Array.isArray(rec.rids) ? rec.rids : []).concat(rid).slice(-RID_KEEP);
  }
  await env.ZS.put(uk, JSON.stringify(rec), { expirationTtl: 120 * 86400, metadata: recMeta(rec) });
  let refUnlock = null;
  try {
    if (!await env.ZS.get("seen:" + user.id)) await env.ZS.put("seen:" + user.id, "1");
    refUnlock = await refOnScore(env, user.id, k, w);
    if (refUnlock) await tgSend(env, refUnlock.to, "\u{1F389} <b>" + escH(refUnlock.name) + "</b> ha iniziato a giocare davvero a Zombie Survival!\n\nHai sbloccato <b>" + REF.inviter + " \u{1FA99} monete</b>: apri il gioco e le trovi in <b>\u{1F465} Invita</b>.");
  } catch (e) {}
  const me = { name: rec.name, k: rec.k, s: rec.s, n: rec.n, bk: rec.bk, bs: rec.bs, bw: rec.bw, ts: rec.ts, lt: rec.lt };
  return json({ ok: true, week: key, me, ref: refUnlock ? 1 : 0 });
}
__name(postScore, "postScore");
function sorted(W) {
  return Object.entries(W.u).map(([uid, r]) => ({ uid, name: r.name, k: r.k | 0, s: r.s | 0, n: r.n | 0, bk: r.bk | 0, bw: r.bw | 0, ts: r.ts | 0 })).sort((a, b) => b.k - a.k || b.s - a.s || a.ts - b.ts || (a.uid < b.uid ? -1 : 1));
}
__name(sorted, "sorted");
async function getTop(env, ctx, url) {
  const key = String(weekStart());
  const cache = caches.default, ck = new Request(url.origin + "/__top480/" + key);
  let rows;
  const hit = await cache.match(ck);
  if (hit)
    rows = await hit.json();
  else {
    rows = sorted(await loadBoard(env, key));
    ctx.waitUntil(cache.put(ck, new Response(JSON.stringify(rows), { headers: { "Content-Type": "application/json", "Cache-Control": "max-age=" + CACHE_S } })));
  }
  const strip = /* @__PURE__ */ __name((r) => ({ uid: r.uid, name: r.name, k: r.k, s: r.s, n: r.n, bk: r.bk, bw: r.bw }), "strip");
  const uid = url.searchParams.get("uid");
  let me = null;
  if (uid) {
    const i = rows.findIndex((r) => r.uid === uid);
    if (i >= 0)
      me = { pos: i + 1, ...strip(rows[i]) };
  }
  return json({ week: key, players: rows.length, top: rows.slice(0, TOP_N).map(strip), me }, 200, { "Cache-Control": "public, max-age=" + CACHE_S });
}
__name(getTop, "getTop");
async function getWeek(req, env, url) {
  const a = req.headers.get("X-Admin") || "";
  if (!env.ADMIN_KEY || !safeEq(a, env.ADMIN_KEY))
    return json({ ok: false, err: "forbidden" }, 403);
  const key = url.searchParams.get("key") || String(weekStart());
  if (!/^\d{12,14}$/.test(key))
    return json({ ok: false, err: "bad_key" }, 400);
  const W = await loadBoard(env, key), u = {};
  for (const [id, r] of Object.entries(W.u))
    u[id] = { name: r.name, k: r.k, s: r.s, n: r.n, bk: r.bk, bs: r.bs, bw: r.bw, ts: r.ts };
  return json({ ok: true, week: key, users: u }, 200, { "Cache-Control": "no-store" });
}
__name(getWeek, "getWeek");
// ===================== v4.3.72: referral program ("Invita un amico") =====================
// KV keys: ref:<invitee> {by,ts,st:'joined'|'played',k,maxw}  rs:<inviter> {d:{day:n},m:{month:n},n,played,coins,last:[]}
//          rw:<uid> {p:[{id,c,why,ts}],done:{id:ts},tot}  pay:<charge_id> 1  seen:<uid> 1  rstat {joins,played,coins,pays,stars}
var REF = { friend: 500, inviter: 1e3, pct: 0.1, rate: 40, dayCap: 5, monCap: 20, needW: 2, needK: 50 };
var TG_API = "https://api.telegram.org";
var romeDay = /* @__PURE__ */ __name((ms) => { const o = romeParts(ms); return o.year + "-" + o.month + "-" + o.day; }, "romeDay");
var romeMon = /* @__PURE__ */ __name((ms) => { const o = romeParts(ms); return o.year + "-" + o.month; }, "romeMon");
var isId = /* @__PURE__ */ __name((v) => typeof v === "string" && /^\d{3,15}$/.test(v), "isId");
function isAdmin(req, env) { const a = req.headers.get("X-Admin") || ""; return !!env.ADMIN_KEY && safeEq(a, env.ADMIN_KEY); }
__name(isAdmin, "isAdmin");
async function readJson(req) { const t = await req.text(); if (t.length > 8192) throw new Error("big"); return JSON.parse(t); }
__name(readJson, "readJson");
async function kvJ(env, k, d) { const v = await env.ZS.get(k, "json"); return v == null ? d : v; }
__name(kvJ, "kvJ");
async function rwAdd(env, uid, c, why, now) {
  const R = await kvJ(env, "rw:" + uid, { p: [], done: {}, tot: 0 });
  const id = why.slice(0, 1) + now.toString(36) + Math.random().toString(36).slice(2, 6);
  R.p.push({ id, c, why, ts: Math.floor(now / 1e3) });
  if (R.p.length > 60) R.p = R.p.slice(-60);
  await env.ZS.put("rw:" + uid, JSON.stringify(R));
  return id;
}
__name(rwAdd, "rwAdd");
async function rstatAdd(env, f) { const S = await kvJ(env, "rstat", { joins: 0, played: 0, coins: 0, pays: 0, stars: 0, rej: {} }); f(S); await env.ZS.put("rstat", JSON.stringify(S)); }
__name(rstatAdd, "rstatAdd");
async function tgSend(env, chat, text) {
  if (!env.BOT_TOKEN) return false;
  try {
    const r = await fetch((env.TG_API || TG_API) + "/bot" + env.BOT_TOKEN + "/sendMessage", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }) });
    return r.ok;
  } catch (e) { return false; }
}
__name(tgSend, "tgSend");
var escH = /* @__PURE__ */ __name((s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), "escH");
// has this Telegram id already played (seen marker or any of the last 12 weekly boards)?
async function knownPlayer(env, uid) {
  if (await env.ZS.get("seen:" + uid)) return true;
  let t = weekStart();
  for (let i = 0; i < 12; i++) { if (await env.ZS.get("wu:" + t + ":" + uid)) return true; const W = await env.ZS.get("wk:" + t, "json"); if (W && W.u && W.u[uid]) return true; t = weekStart(t - 3 * 86400 * 1e3); }
  return false;
}
__name(knownPlayer, "knownPlayer");
// POST /ref/join (bot, X-Admin) {invitee, inviter, name, botNew, inviterKnown}
async function refJoin(req, env) {
  if (!isAdmin(req, env)) return json({ ok: false, err: "forbidden" }, 403);
  let p; try { p = await readJson(req); } catch (e) { return json({ ok: false, err: "bad_json" }, 400); }
  const a = String(p.invitee || ""), b = String(p.inviter || ""), now = Date.now();
  const rej = async (err) => { await rstatAdd(env, (S) => { S.rej = S.rej || {}; S.rej[err] = (S.rej[err] || 0) + 1; }); return json({ ok: false, err }); };
  if (!isId(a) || !isId(b)) return json({ ok: false, err: "bad_id" }, 400);
  if (a === b) return rej("self");
  if (await env.ZS.get("ref:" + a)) return rej("already_referred");
  if (p.botNew !== true) return rej("not_new");
  if (await knownPlayer(env, a)) return rej("not_new");
  if (p.inviterKnown !== true && !await knownPlayer(env, b)) return rej("unknown_inviter");
  const day = romeDay(now), mon = romeMon(now);
  const S = await kvJ(env, "rs:" + b, { d: {}, m: {}, n: 0, played: 0, coins: 0, last: [] });
  if ((S.d[day] || 0) >= REF.dayCap) return rej("cap_day");
  if ((S.m[mon] || 0) >= REF.monCap) return rej("cap_month");
  await env.ZS.put("ref:" + a, JSON.stringify({ by: b, ts: Math.floor(now / 1e3), st: "joined", k: 0, maxw: 0, name: String(p.name || "").slice(0, 32) }));
  S.d = { [day]: (S.d[day] || 0) + 1 }; S.m = { [mon]: (S.m[mon] || 0) + 1 }; S.n++;
  S.last = [{ id: a, name: String(p.name || "").slice(0, 32), ts: Math.floor(now / 1e3), st: "joined" }].concat(S.last || []).slice(0, 30);
  await env.ZS.put("rs:" + b, JSON.stringify(S));
  await rwAdd(env, a, REF.friend, "friend", now);
  await rstatAdd(env, (T) => { T.joins++; T.coins += REF.friend; });
  return json({ ok: true, friend: REF.friend, inviter: b, invites: S.n });
}
__name(refJoin, "refJoin");
// called after every accepted score: unlock the inviter reward once the friend really plays
async function refOnScore(env, uid, k, w) {
  const ref = await env.ZS.get("ref:" + uid, "json");
  if (!ref || ref.st !== "joined") return null;
  ref.k = (ref.k || 0) + k; ref.maxw = Math.max(ref.maxw || 0, w);
  if (ref.maxw >= REF.needW || ref.k >= REF.needK) {
    ref.st = "played"; ref.pt = Math.floor(Date.now() / 1e3);
    await env.ZS.put("ref:" + uid, JSON.stringify(ref));
    await rwAdd(env, ref.by, REF.inviter, "inviter", Date.now());
    const S = await kvJ(env, "rs:" + ref.by, { d: {}, m: {}, n: 0, played: 0, coins: 0, last: [] });
    S.played++; S.coins += REF.inviter; for (const x of S.last || []) if (x.id === uid) x.st = "played";
    await env.ZS.put("rs:" + ref.by, JSON.stringify(S));
    await rstatAdd(env, (T) => { T.played++; T.coins += REF.inviter; });
    return { to: ref.by, name: ref.name || "Il tuo amico" };
  }
  await env.ZS.put("ref:" + uid, JSON.stringify(ref));
  return null;
}
__name(refOnScore, "refOnScore");
// POST /ref/pay (bot, X-Admin) {buyer, stars, charge}
async function refPay(req, env) {
  if (!isAdmin(req, env)) return json({ ok: false, err: "forbidden" }, 403);
  let p; try { p = await readJson(req); } catch (e) { return json({ ok: false, err: "bad_json" }, 400); }
  const buyer = String(p.buyer || ""), stars = int(p.stars, 1, 1e5), ch = String(p.charge || "");
  if (!isId(buyer) || !stars || !/^[A-Za-z0-9_\-.:]{6,128}$/.test(ch)) return json({ ok: false, err: "bad_args" }, 400);
  if (await env.ZS.get("pay:" + ch)) return json({ ok: true, dup: true, credited: 0 });
  await env.ZS.put("pay:" + ch, "1", { expirationTtl: 400 * 86400 });
  const ref = await env.ZS.get("ref:" + buyer, "json");
  if (!ref) return json({ ok: true, credited: 0 });
  const coins = Math.floor(stars * REF.pct * REF.rate);
  if (coins <= 0) return json({ ok: true, credited: 0 });
  await rwAdd(env, ref.by, coins, "stars", Date.now());
  const S = await kvJ(env, "rs:" + ref.by, { d: {}, m: {}, n: 0, played: 0, coins: 0, last: [] });
  S.coins += coins; S.stars = (S.stars || 0) + stars; await env.ZS.put("rs:" + ref.by, JSON.stringify(S));
  await rstatAdd(env, (T) => { T.pays++; T.stars += stars; T.coins += coins; });
  return json({ ok: true, credited: coins, inviter: ref.by, name: ref.name || "" });
}
__name(refPay, "refPay");
async function authUser(req, env) {
  let p; try { p = await readJson(req); } catch (e) { return { err: json({ ok: false, err: "bad_json" }, 400) }; }
  const u = p && p.initData ? await checkInitData(p.initData, env.BOT_TOKEN) : null;
  if (!u) return { err: json({ ok: false, err: "bad_auth" }, 403) };
  if (u.expired) return { err: json({ ok: false, err: "auth_expired" }, 403) };
  return { u, p };
}
__name(authUser, "authUser");
// POST /ref/me {initData} -> pending rewards + invite stats for the verified user
async function refMe(req, env) {
  const A = await authUser(req, env); if (A.err) return A.err;
  const uid = A.u.id;
  const R = await kvJ(env, "rw:" + uid, { p: [], done: {}, tot: 0 }), S = await kvJ(env, "rs:" + uid, { n: 0, played: 0, coins: 0, last: [] });
  const ref = await env.ZS.get("ref:" + uid, "json");
  return json({ ok: true, uid, pending: R.p.map((x) => ({ id: x.id, c: x.c, why: x.why })), invites: S.n || 0, played: S.played || 0, earned: S.coins || 0, got: R.tot || 0,
    friends: (S.last || []).slice(0, 10).map((x) => ({ name: x.name, st: x.st })), invitedBy: ref ? { st: ref.st } : null, rules: REF });
}
__name(refMe, "refMe");
// POST /ref/claim {initData, ids:[...]} -> moves pending rewards to done, returns coins to add (retries of the same ids within 15 min are answered again)
async function refClaim(req, env) {
  const A = await authUser(req, env); if (A.err) return A.err;
  const uid = A.u.id, ids = Array.isArray(A.p.ids) ? A.p.ids.filter((x) => typeof x === "string").slice(0, 60) : [];
  const R = await kvJ(env, "rw:" + uid, { p: [], done: {}, tot: 0 }), now = Math.floor(Date.now() / 1e3);
  R.done = R.done || {}; R.rec = R.rec || {};
  const out = [];
  for (const id of ids) {
    const i = R.p.findIndex((x) => x.id === id);
    if (i >= 0) { const x = R.p.splice(i, 1)[0]; R.done[id] = now; R.rec[id] = x.c; R.tot = (R.tot || 0) + x.c; out.push({ id, c: x.c }); }
    else if (R.done[id] && now - R.done[id] < 900 && R.rec[id]) out.push({ id, c: R.rec[id], again: true });
  }
  for (const k in R.done) if (now - R.done[k] > 30 * 86400) { delete R.done[k]; delete R.rec[k]; }
  for (const k in R.rec) if (!R.done[k] || now - R.done[k] > 900) delete R.rec[k];
  await env.ZS.put("rw:" + uid, JSON.stringify(R));
  return json({ ok: true, items: out, coins: out.reduce((s, x) => s + x.c, 0) });
}
__name(refClaim, "refClaim");
// GET /ref/stats (bot, X-Admin)
async function refStats(req, env, url) {
  if (!isAdmin(req, env)) return json({ ok: false, err: "forbidden" }, 403);
  const S = await kvJ(env, "rstat", { joins: 0, played: 0, coins: 0, pays: 0, stars: 0, rej: {} });
  const uid = url.searchParams.get("uid");
  const me = uid && isId(uid) ? await kvJ(env, "rs:" + uid, null) : null;
  return json({ ok: true, stats: S, me }, 200, { "Cache-Control": "no-store" });
}
__name(refStats, "refStats");

// ===================== v4.3.72: play-time heartbeats + owner-only dashboard =====================
// KV: pt:<uid> {n:name,t:totalSec,d:{YYYY-MM-DD:sec} (35 days),l:lastMs}  pidx {uid:lastDay}  adm:bot {buys,aff,affJoins,ts} (pushed by the bot)
var OWNER_ID = "7780175131";
var HB_MAX = 200;
async function postHb(req, env) {
  const A = await authUser(req, env); if (A.err) return A.err;
  const uid = A.u.id, now = Date.now(), day = romeDay(now);
  let s = int(A.p.s, 1, HB_MAX); if (!s) return json({ ok: false, err: "bad_s" }, 400);
  const P = await kvJ(env, "pt:" + uid, { n: A.u.name, t: 0, d: {}, l: 0 });
  if (P.l) s = Math.min(s, Math.max(0, Math.round((now - P.l) / 1e3) + 30));   // can't credit more than the wall time since the last beat
  if (s <= 0) return json({ ok: true, s: 0 });
  P.n = A.u.name.slice(0, 24); P.t = (P.t || 0) + s; P.d[day] = (P.d[day] || 0) + s; P.l = now;
  const keep = Object.keys(P.d).sort().slice(-35), d2 = {}; for (const k of keep) d2[k] = P.d[k]; P.d = d2;
  await env.ZS.put("pt:" + uid, JSON.stringify(P));
  const I = await kvJ(env, "pidx", {});
  if (I[uid] !== day) { I[uid] = day; await env.ZS.put("pidx", JSON.stringify(I)); }
  return json({ ok: true, s });
}
__name(postHb, "postHb");
// POST /admin/push (bot, X-Admin) {buys:[{u,n,stars,item,date}], aff:[...], affJoins:[...]}
async function admPush(req, env) {
  if (!isAdmin(req, env)) return json({ ok: false, err: "forbidden" }, 403);
  let p; try { const t = await req.text(); if (t.length > 200000) throw 0; p = JSON.parse(t); } catch (e) { return json({ ok: false, err: "bad_json" }, 400); }
  const clip = (a, n) => Array.isArray(a) ? a.slice(-n) : [];
  await env.ZS.put("adm:bot", JSON.stringify({ buys: clip(p.buys, 500), aff: clip(p.aff, 300), affJoins: clip(p.affJoins, 500), users: int(p.users, 0, 1e7) || 0, ts: Date.now() }));
  return json({ ok: true });
}
__name(admPush, "admPush");
// POST /admin/dash {initData} -> only for the owner (signature-verified id), never for anyone else
async function admDash(req, env) {
  const A = await authUser(req, env); if (A.err) return A.err;
  if (A.u.id !== OWNER_ID) return json({ ok: false, err: "forbidden" }, 403);
  const now = Date.now(), I = await kvJ(env, "pidx", {}), days = [];
  for (let i = 0; i < 30; i++) days.push(romeDay(now - i * 86400 * 1e3));
  const d1 = days[0], d7 = new Set(days.slice(0, 7)), d30 = new Set(days);
  const ids = Object.keys(I).sort((a, b) => (I[b] > I[a] ? 1 : I[b] < I[a] ? -1 : 0)).slice(0, 150);
  const players = [];
  for (const uid of ids) {
    const P = await kvJ(env, "pt:" + uid, null); if (!P) continue;
    let m7 = 0, m30 = 0; for (const k in P.d) { if (d7.has(k)) m7 += P.d[k]; if (d30.has(k)) m30 += P.d[k]; }
    players.push({ id: uid, n: P.n, tot: Math.round(P.t / 60), m7: Math.round(m7 / 60), m30: Math.round(m30 / 60), today: Math.round((P.d[d1] || 0) / 60), last: I[uid] });
  }
  const act = { today: 0, d7: 0, d30: 0 };
  for (const uid in I) { if (I[uid] === d1) act.today++; if (d7.has(I[uid])) act.d7++; if (d30.has(I[uid])) act.d30++; }
  const refs = []; let cur;
  do { const L = await env.ZS.list({ prefix: "ref:", cursor: cur, limit: 200 }); for (const k of L.keys) { const r = await env.ZS.get(k.name, "json"); if (r) refs.push({ id: k.name.slice(4), n: r.name, by: r.by, st: r.st, ts: r.ts }); } cur = L.list_complete ? null : L.cursor; } while (cur && refs.length < 400);
  const names = {}; for (const p of players) names[p.id] = p.n;
  for (const r of refs) r.byN = names[r.by] || null;
  const B = await kvJ(env, "adm:bot", { buys: [], aff: [], affJoins: [], ts: 0 });
  const spend = {}; for (const b of B.buys || []) { const s = spend[b.u] || (spend[b.u] = { id: b.u, n: b.n, stars: 0, k: 0, last: "" }); s.stars += b.stars | 0; s.k++; if ((b.date || "") > s.last) s.last = b.date || ""; }
  return json({ ok: true, at: now, act, players: players.sort((a, b) => b.m30 - a.m30 || b.tot - a.tot), refs: refs.sort((a, b) => b.ts - a.ts), stats: await kvJ(env, "rstat", {}), spend: Object.values(spend).sort((a, b) => b.stars - a.stars),
    aff: B.aff || [], affJoins: B.affJoins || [], botUsers: B.users || 0, botTs: B.ts || 0 }, 200, { "Cache-Control": "no-store" });
}
__name(admDash, "admDash");

// ===== 4.3.82 gilde (roles, requests, permissions server-side) + /report =====
// Needs: json, readJson, authUser, kvJ, env.ZS (KV), env.BOT_TOKEN. Optional: env.REPORT_CHAT (default owner), env.EMAIL (send_email binding) + env.REPORT_EMAIL + env.REPORT_FROM.
const CLAN = { max: 20, nameMin: 3, nameMax: 18, chatKeep: 60, msgMax: 200, ptsKillCap: 400, ptsResCap: 600, ptsWindow: 60, reqMax: 30 };
const RK = { c: 3, a: 2, m: 1 }; // Capo gilda, Anziano/Ufficiale, Membro
function clanLv(c) { const p = c.pts || 0, m = (c.members || []).length; return Math.min(30, 1 + Math.floor(Math.sqrt(p / 400)) + Math.floor((m - 1) / 3)); }
function clanWeek() { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); }
function clanMis(c) { const w = clanWeek(); if (!c.mis || c.mis.w !== w) { const n = Math.max(1, (c.members || []).length); c.mis = { w, kills: 0, res: 0, gk: 150 * n, gr: 400 * n }; } return c.mis; }
function rkOf(c, u) { if (u === c.owner) return "c"; const m = (c.members || []).find((x) => x.u === u); return m ? (m.rk === "a" ? "a" : "m") : ""; }
function leaderName(c) { const m = (c.members || []).find((x) => x.u === c.owner); return m ? m.n : ""; }
function clanPub(c, uid) { const my = rkOf(c, uid); return { id: c.id, name: c.name, tag: c.tag, open: c.open !== false, lv: clanLv(c), pts: c.pts | 0, my, leader: leaderName(c),
  members: (c.members || []).map((m) => ({ id: m.u, n: m.n, pts: m.pts | 0, me: m.u === uid, rk: rkOf(c, m.u) })),
  req: RK[my] >= 2 ? (c.req || []).map((r) => ({ id: r.u, n: r.n })) : [], mis: clanMis(c) }; }
function clanSan(s, n) { return String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n); }
async function clanGet(env, id) { return id ? await env.ZS.get("clan:" + id, "json") : null; }
async function clanPut(env, c) { await env.ZS.put("clan:" + c.id, JSON.stringify(c)); }
async function clanIdx(env, c) { const L = await kvJ(env, "clanidx", []); const i = L.findIndex((x) => x.id === c.id);
  const e = { id: c.id, name: c.name, tag: c.tag, n: (c.members || []).length, pts: c.pts | 0, lv: clanLv(c), leader: leaderName(c), open: c.open !== false };
  if (c.del) { if (i >= 0) L.splice(i, 1); } else if (i >= 0) L[i] = e; else L.push(e); L.sort((a, b) => b.pts - a.pts); await env.ZS.put("clanidx", JSON.stringify(L.slice(0, 300))); }
async function addMember(env, c, u, n) { c.members.push({ u, n, pts: 0, rk: "m" }); c.req = (c.req || []).filter((r) => r.u !== u); await env.ZS.put("cu:" + u, c.id); }
async function clanApi(path, req, env) {
  if (path === "/clan/list" && req.method === "GET") { const url = new URL(req.url), q = (url.searchParams.get("q") || "").toLowerCase().slice(0, 20); let L = await kvJ(env, "clanidx", []);
    if (q) L = L.filter((x) => (x.name || "").toLowerCase().includes(q) || (x.tag || "").toLowerCase().includes(q)); return json({ ok: true, clans: L.slice(0, 40) }); }
  const A = await authUser(req, env); if (A.err) return A.err;
  const u = A.u, uid = String(u.id), p = A.p || {}, nm = clanSan(u.first_name || u.username || "Giocatore", 24);
  const myId = await env.ZS.get("cu:" + uid); let c = await clanGet(env, myId);
  if (myId && !c) { await env.ZS.delete("cu:" + uid); }
  if (path === "/clan/me") return json({ ok: true, clan: c ? clanPub(c, uid) : null });
  if (path === "/clan/create") {
    if (c) return json({ ok: false, err: "already" }); const name = clanSan(p.name, CLAN.nameMax); if (name.length < CLAN.nameMin) return json({ ok: false, err: "name" });
    const L = await kvJ(env, "clanidx", []); if (L.some((x) => (x.name || "").toLowerCase() === name.toLowerCase())) return json({ ok: false, err: "taken" });
    const tag = clanSan(p.tag || name.slice(0, 4), 4).toUpperCase(), id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    c = { id, name, tag, owner: uid, open: p.open !== false, pts: 0, members: [{ u: uid, n: nm, pts: 0, rk: "c" }], req: [], ts: Date.now() }; clanMis(c);
    await clanPut(env, c); await env.ZS.put("cu:" + uid, id); await clanIdx(env, c); return json({ ok: true, clan: clanPub(c, uid) }); }
  if (path === "/clan/join") {
    if (c) return json({ ok: false, err: "already" }); const t = await clanGet(env, clanSan(p.id, 24)); if (!t) return json({ ok: false, err: "nf" });
    if ((t.members || []).length >= CLAN.max) return json({ ok: false, err: "full" });
    if (t.open === false) { t.req = (t.req || []).filter((r) => r.u !== uid); t.req.push({ u: uid, n: nm, t: Date.now() }); t.req = t.req.slice(-CLAN.reqMax); await clanPut(env, t); return json({ ok: true, pending: true }); }
    await addMember(env, t, uid, nm); await clanPut(env, t); await clanIdx(env, t); return json({ ok: true, clan: clanPub(t, uid) }); }
  if (!c) return json({ ok: false, err: "noclan" });
  const my = RK[rkOf(c, uid)] || 0, tgt = clanSan(p.id, 24), tr = RK[rkOf(c, tgt)] || 0;
  const save = async () => { await clanPut(env, c); await clanIdx(env, c); return json({ ok: true, clan: clanPub(c, uid) }); };
  if (path === "/clan/leave") {
    if (uid === c.owner && c.members.length > 1) return json({ ok: false, err: "transfer_first" });
    c.members = c.members.filter((m) => m.u !== uid); await env.ZS.delete("cu:" + uid);
    if (!c.members.length) { c.del = 1; await env.ZS.delete("clan:" + c.id); await env.ZS.delete("cc:" + c.id); await clanIdx(env, c); return json({ ok: true }); }
    await clanPut(env, c); await clanIdx(env, c); return json({ ok: true }); }
  if (path === "/clan/accept" || path === "/clan/reject") { if (my < 2) return json({ ok: false, err: "perm" }); const r = (c.req || []).find((x) => x.u === tgt); if (!r) return json({ ok: false, err: "nf" });
    if (path === "/clan/reject") { c.req = c.req.filter((x) => x.u !== tgt); return await save(); }
    if (await env.ZS.get("cu:" + tgt)) { c.req = c.req.filter((x) => x.u !== tgt); await clanPut(env, c); return json({ ok: false, err: "in_other" }); }
    if (c.members.length >= CLAN.max) return json({ ok: false, err: "full" }); await addMember(env, c, r.u, r.n); return await save(); }
  if (path === "/clan/kick") { if (!tr || tgt === uid) return json({ ok: false, err: "nf" }); if (!(my === 3 || (my === 2 && tr === 1))) return json({ ok: false, err: "perm" });
    c.members = c.members.filter((m) => m.u !== tgt); await env.ZS.delete("cu:" + tgt); return await save(); }
  if (path === "/clan/promo") { if (my !== 3) return json({ ok: false, err: "perm" }); const m = c.members.find((x) => x.u === tgt); if (!m || tgt === uid) return json({ ok: false, err: "nf" });
    m.rk = p.rank === "membro" ? "m" : "a"; return await save(); }
  if (path === "/clan/transfer") { if (my !== 3) return json({ ok: false, err: "perm" }); const m = c.members.find((x) => x.u === tgt); if (!m || tgt === uid) return json({ ok: false, err: "nf" });
    const me = c.members.find((x) => x.u === uid); if (me) me.rk = "a"; m.rk = "c"; c.owner = tgt; return await save(); }
  if (path === "/clan/edit") { if (my !== 3) return json({ ok: false, err: "perm" }); if (p.name) { const n = clanSan(p.name, CLAN.nameMax); if (n.length >= CLAN.nameMin) c.name = n; }
    if (p.tag) c.tag = clanSan(p.tag, 4).toUpperCase(); if (typeof p.open === "boolean") c.open = p.open; return await save(); }
  if (path === "/clan/disband") { if (my !== 3) return json({ ok: false, err: "perm" }); for (const m of c.members) await env.ZS.delete("cu:" + m.u);
    c.del = 1; await env.ZS.delete("clan:" + c.id); await env.ZS.delete("cc:" + c.id); await clanIdx(env, c); return json({ ok: true }); }
  if (path === "/clan/chat") { const m = clanSan(p.m, CLAN.msgMax); if (!m) return json({ ok: false, err: "empty" });
    const L = await kvJ(env, "cc:" + c.id, []); const last = L[L.length - 1]; if (last && last.u === uid && Date.now() - last.t < 1500) return json({ ok: false, err: "slow" });
    L.push({ u: uid, n: nm, t: Date.now(), m }); await env.ZS.put("cc:" + c.id, JSON.stringify(L.slice(-CLAN.chatKeep))); return json({ ok: true }); }
  if (path === "/clan/msgs") { const L = await kvJ(env, "cc:" + c.id, []); const since = +p.since || 0; return json({ ok: true, msgs: L.filter((x) => x.t > since).map((x) => ({ n: x.n, t: x.t, m: x.m, me: x.u === uid })) }); }
  if (path === "/clan/pts") { const lt = +(await env.ZS.get("cpt:" + uid)) || 0; if (Date.now() - lt < CLAN.ptsWindow * 1000) return json({ ok: false, err: "slow" });
    const k = Math.max(0, Math.min(CLAN.ptsKillCap, p.k | 0)), r = Math.max(0, Math.min(CLAN.ptsResCap, p.r | 0)), add = k * 2 + Math.floor(r / 4);
    const mis = clanMis(c); mis.kills += k; mis.res += r; c.pts = (c.pts | 0) + add; const me = c.members.find((m) => m.u === uid); if (me) me.pts = (me.pts | 0) + add;
    await env.ZS.put("cpt:" + uid, String(Date.now()), { expirationTtl: 3600 }); return await save(); }
  return json({ ok: false, err: "nf" }, 404);
}
// POST /report {initData?, kind:'sugg'|'bug', text, meta:{ver,dev,crash}} -> Telegram to owner (+ email if binding configured)
async function postReport(req, env) {
  let p; try { p = await readJson(req); } catch (e) { return json({ ok: false, err: "bad_json" }, 400); }
  let who = "anonimo", key = "rp:ip:" + (req.headers.get("CF-Connecting-IP") || "x");
  try { if (p && p.initData) { const u = await checkInitData(p.initData, env.BOT_TOKEN); if (u && !u.expired) { key = "rp:u:" + u.id; who = "id " + u.id; } } } catch (e) {}
  const last = +(await env.ZS.get(key)) || 0; if (Date.now() - last < 60000) return json({ ok: false, err: "slow" }, 429);
  const kind = p.kind === "bug" ? "🐞 Bug" : "💡 Suggerimento", text = clanSan(p.text, 1500), m = p.meta || {};
  if (text.length < 3) return json({ ok: false, err: "short" });
  const body = kind + " (" + who + ")\n\n" + text + "\n\nVer: " + clanSan(m.ver, 20) + "\nDevice: " + clanSan(m.dev, 200) + (m.crash ? "\nCrash: " + clanSan(m.crash, 900) : "");
  await env.ZS.put(key, String(Date.now()), { expirationTtl: 3600 });
  let tg = false, mail = false;
  try { const r = await fetch("https://api.telegram.org/bot" + env.BOT_TOKEN + "/sendMessage", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: env.REPORT_CHAT || 7780175131, text: body.slice(0, 3900) }) }); tg = r.ok; } catch (e) {}
  try { if (env.EMAIL && env.REPORT_EMAIL && env.REPORT_FROM) { const raw = "From: " + env.REPORT_FROM + "\r\nTo: " + env.REPORT_EMAIL + "\r\nSubject: Zombie Survival " + clanSan(m.ver, 20) + " - " + (p.kind === "bug" ? "Bug" : "Suggerimento") + "\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n" + body;
    const { EmailMessage } = await import("cloudflare:email"); await env.EMAIL.send(new EmailMessage(env.REPORT_FROM, env.REPORT_EMAIL, raw)); mail = true; } } catch (e) {}
  return json({ ok: tg || mail });
}
// ===== 4.3.82 /debug: anonymous auto-diagnosis reports, dedup by fingerprint, rate-limited, size-capped =====
// POST /debug (public, anon id) | GET /debug/list?n=50 , /debug/get?k=KEY , /debug/fp (header X-Admin = env.ADMIN_KEY)
const DBG_MAX = 64000, DBG_TTL = 30 * 86400;
const DSEV = { info: 0, warn: 1, err: 2 };
async function postDebug(req, env) {
  const len = +(req.headers.get("content-length") || 0); if (len > DBG_MAX) return json({ ok: false, err: "too_big" }, 413);
  let txt; try { txt = await req.text(); } catch (e) { return json({ ok: false, err: "bad_body" }, 400); }
  if (txt.length > DBG_MAX) return json({ ok: false, err: "too_big" }, 413);
  let p; try { p = JSON.parse(txt); } catch (e) { return json({ ok: false, err: "bad_json" }, 400); }
  const anon = String(p.anon || "").replace(/[^a-z0-9]/gi, "").slice(0, 16); if (!anon) return json({ ok: false, err: "no_id" }, 400);
  const ip = req.headers.get("cf-connecting-ip") || "x";
  if (await env.ZS.get("dbgrl:" + anon) || await env.ZS.get("dbgrlip:" + ip)) return json({ ok: false, err: "rate" }, 429);
  await env.ZS.put("dbgrl:" + anon, "1", { expirationTtl: 75 });
  const day = new Date().toISOString().slice(0, 10), dk = "dbgday:" + day; const dc = +(await env.ZS.get(dk) || 0);
  if (dc > 2000) return json({ ok: false, err: "daily_cap" }, 429); await env.ZS.put(dk, String(dc + 1), { expirationTtl: 3 * 86400 });
  const ipc = +(await env.ZS.get("dbgipc:" + ip + day) || 0); if (ipc > 60) { await env.ZS.put("dbgrlip:" + ip, "1", { expirationTtl: 3600 }); return json({ ok: false, err: "rate" }, 429); }
  await env.ZS.put("dbgipc:" + ip + day, String(ipc + 1), { expirationTtl: 86400 });
  const ver = String(p.ver || "").slice(0, 16), F = Array.isArray(p.findings) ? p.findings.slice(0, 30) : [];
  const FP = await kvJ(env, "dbgfp", {}); const fresh = [];
  for (const f of F) {
    const fp = String(f.fp || "").slice(0, 160); if (!fp) continue; const sev = DSEV[f.liv] != null ? f.liv : "info"; const n = Math.max(1, Math.min(1e6, +f.volte || 1));
    let h = FP[fp]; const isNew = !h || DSEV[sev] > DSEV[h.sev] || !(h.vers || []).includes(ver) || h.n + n >= Math.max(5, (h.sn || 1) * 3);
    if (!h) h = FP[fp] = { first: Date.now(), n: 0, dev: 0, vers: [], sev, sn: 0 };
    h.n += n; h.dev = (h.dev || 0) + 1; h.last = Date.now(); h.t = String(f.testo || "").slice(0, 200); if (DSEV[sev] > DSEV[h.sev]) h.sev = sev; if (!h.vers.includes(ver)) h.vers = h.vers.concat(ver).slice(-6);
    if (isNew) { h.sn = h.n; fresh.push(fp); }
  }
  const ks = Object.keys(FP); if (ks.length > 800) ks.sort((a, b) => FP[a].last - FP[b].last).slice(0, ks.length - 800).forEach(k => delete FP[k]);
  await env.ZS.put("dbgfp", JSON.stringify(FP));
  const crash = /crash|riavvio/i.test(String(p.motivo || ""));
  if (!fresh.length && !crash) return json({ ok: true, stored: false, known: F.length });
  const key = "dbg:" + (9e15 - Date.now()) + ":" + anon; // newest first in list()
  const rec = { anon, ver, apk: !!p.apk, dev: !!p.dev, motivo: String(p.motivo || "").slice(0, 40), ts: Date.now(), country: (req.cf && req.cf.country) || "", nuovi: fresh, findings: F, report: p.report || null };
  await env.ZS.put(key, JSON.stringify(rec), { expirationTtl: DBG_TTL, metadata: { ver, n: fresh.length, crash, t: F.filter(f => fresh.includes(f.fp)).map(f => String(f.testo || "").slice(0, 90)).slice(0, 3) } });
  return json({ ok: true, stored: true, nuovi: fresh.length });
}
async function getDebug(url, req, env) {
  if (!isAdmin(req, env)) return json({ ok: false, err: "forbidden" }, 403);
  if (url.pathname === "/debug/fp") return json({ ok: true, fp: await kvJ(env, "dbgfp", {}) });
  if (url.pathname === "/debug/get") { const k = url.searchParams.get("k") || ""; if (!k.startsWith("dbg:")) return json({ ok: false }, 400); return json({ ok: true, r: await env.ZS.get(k, "json") }); }
  const n = Math.min(200, +url.searchParams.get("n") || 50); const L = await env.ZS.list({ prefix: "dbg:", limit: n, cursor: url.searchParams.get("cursor") || undefined });
  return json({ ok: true, keys: L.keys.map(k => ({ k: k.name, m: k.metadata })), cursor: L.list_complete ? null : L.cursor });
}
// routes: if (url.pathname === "/debug" && req.method === "POST") return await postDebug(req, env); if (url.pathname.startsWith("/debug/") && req.method === "GET") return await getDebug(url, req, env);

// routes: if (url.pathname.startsWith("/clan/")) return await clanApi(url.pathname, req, env);  if (url.pathname === "/report" && req.method === "POST") return await postReport(req, env);

var worker_default = {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    try {
      if (req.method === "OPTIONS")
        return new Response(null, { status: 204, headers: cors() });
      if (env.DEV_KEY) globalThis.__ZS_DEVKEY = env.DEV_KEY;
      if (url.pathname === "/dev/register" && req.method === "POST")
        return await devRegister(req, env);
      if (url.pathname === "/debug" && req.method === "POST")
        return await postDebug(req, env);
      if (url.pathname.startsWith("/debug/") && req.method === "GET")
        return await getDebug(url, req, env);
      if (url.pathname === "/report" && req.method === "POST")
        return await postReport(req, env);
      if (url.pathname.startsWith("/clan/"))
        return await clanApi(url.pathname, req, env);
      if (url.pathname === "/score" && req.method === "POST")
        return await postScore(req, env);
      if (url.pathname === "/top" && req.method === "GET")
        return await getTop(env, ctx, url);
      if (url.pathname === "/week" && req.method === "GET")
        return await getWeek(req, env, url);
      if (url.pathname === "/ref/join" && req.method === "POST")
        return await refJoin(req, env);
      if (url.pathname === "/ref/pay" && req.method === "POST")
        return await refPay(req, env);
      if (url.pathname === "/ref/me" && req.method === "POST")
        return await refMe(req, env);
      if (url.pathname === "/ref/claim" && req.method === "POST")
        return await refClaim(req, env);
      if (url.pathname === "/hb" && req.method === "POST")
        return await postHb(req, env);
      if (url.pathname === "/admin/push" && req.method === "POST")
        return await admPush(req, env);
      if (url.pathname === "/admin/dash" && req.method === "POST")
        return await admDash(req, env);
      if (url.pathname === "/ref/stats" && req.method === "GET")
        return await refStats(req, env, url);
      if (url.pathname === "/")
        return json({ ok: true, service: "zs-classifica", week: String(weekStart()), ref: 472, board: 480 });
      return json({ ok: false, err: "not_found" }, 404);
    } catch (e) {
      return json({ ok: false, err: "server" }, 500);
    }
  }
};
export {
  worker_default as default
};

