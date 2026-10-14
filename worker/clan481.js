// ===== 4.3.81 clans (zs-classifica worker module) =====
// Paste ABOVE `var worker_default` in worker.js; add the route line shown in DEPLOY notes.
// Needs existing helpers: json, readJson, checkInitData, authUser, kvJ, env.ZS (KV), env.BOT_TOKEN.
const CLAN = { max: 20, nameMin: 3, nameMax: 18, chatKeep: 60, msgMax: 200, ptsKillCap: 400, ptsResCap: 600, ptsWindow: 60 };
function clanLv(c) { const p = c.pts || 0, m = (c.members || []).length; return Math.min(30, 1 + Math.floor(Math.sqrt(p / 400)) + Math.floor((m - 1) / 3)); }
function clanWeek() { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); }
function clanMis(c) { const w = clanWeek(); if (!c.mis || c.mis.w !== w) { const n = Math.max(1, (c.members || []).length); c.mis = { w, kills: 0, res: 0, gk: 150 * n, gr: 400 * n, done: [] }; } return c.mis; }
function clanPub(c, uid) { const lv = clanLv(c); return { id: c.id, name: c.name, tag: c.tag, owner: c.owner, lv, pts: c.pts | 0, members: (c.members || []).map((m) => ({ n: m.n, pts: m.pts | 0, me: m.u === uid, own: m.u === c.owner, rk: m.u === c.owner ? "c" : (m.rk || "m") })), mis: clanMis(c),
  rewards: { ammo: lv >= 2, boost: lv >= 4, skin: lv >= 6 } }; }
function clanSan(s, n) { return String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n); }
async function clanGet(env, id) { return id ? await env.ZS.get("clan:" + id, "json") : null; }
async function clanPut(env, c) { await env.ZS.put("clan:" + c.id, JSON.stringify(c)); }
async function clanIdx(env, c) { const L = await kvJ(env, "clanidx", []); const i = L.findIndex((x) => x.id === c.id); const e = { id: c.id, name: c.name, tag: c.tag, n: (c.members || []).length, pts: c.pts | 0 };
  if (c.del) { if (i >= 0) L.splice(i, 1); } else if (i >= 0) L[i] = e; else L.push(e); L.sort((a, b) => b.pts - a.pts); await env.ZS.put("clanidx", JSON.stringify(L.slice(0, 300))); }
async function clanApi(path, req, env) {
  if (path === "/clan/list" && req.method === "GET") { const L = await kvJ(env, "clanidx", []); return json({ ok: true, clans: L.slice(0, 50) }); }
  const A = await authUser(req, env); if (A.err) return A.err;
  const u = A.u, uid = String(u.id), p = A.p || {}, nm = clanSan(u.first_name || u.username || "Giocatore", 24);
  const myId = await env.ZS.get("cu:" + uid); let c = await clanGet(env, myId);
  if (path === "/clan/me") { return json({ ok: true, clan: c ? clanPub(c, uid) : null }); }
  if (path === "/clan/create") {
    if (c) return json({ ok: false, err: "already" }); const name = clanSan(p.name, CLAN.nameMax); if (name.length < CLAN.nameMin) return json({ ok: false, err: "name" });
    const tag = clanSan(p.tag || name.slice(0, 4), 4).toUpperCase(); const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    c = { id, name, tag, owner: uid, pts: 0, members: [{ u: uid, n: nm, pts: 0 }], ts: Date.now() }; clanMis(c);
    await clanPut(env, c); await env.ZS.put("cu:" + uid, id); await clanIdx(env, c); return json({ ok: true, clan: clanPub(c, uid) }); }
  if (path === "/clan/join") {
    if (c) return json({ ok: false, err: "already" }); const t = await clanGet(env, clanSan(p.id, 24)); if (!t) return json({ ok: false, err: "nf" });
    if ((t.members || []).length >= CLAN.max) return json({ ok: false, err: "full" }); t.members.push({ u: uid, n: nm, pts: 0 });
    await clanPut(env, t); await env.ZS.put("cu:" + uid, t.id); await clanIdx(env, t); return json({ ok: true, clan: clanPub(t, uid) }); }
  if (!c) return json({ ok: false, err: "noclan" });
  if (path === "/clan/leave") { c.members = c.members.filter((m) => m.u !== uid); await env.ZS.delete("cu:" + uid);
    if (!c.members.length) { c.del = 1; await env.ZS.delete("clan:" + c.id); await env.ZS.delete("cc:" + c.id); } else { if (c.owner === uid) c.owner = c.members[0].u; await clanPut(env, c); }
    await clanIdx(env, c); return json({ ok: true }); }
  if (path === "/clan/promo") { // only the Capo gilda; rank "anziano" (a) or back to membro (m)
    if (c.owner !== uid) return json({ ok: false, err: "not_owner" }); const t = c.members.find((m) => m.n === clanSan(p.name, 24) && m.u !== uid); if (!t) return json({ ok: false, err: "nf" });
    t.rk = p.rank === "membro" ? "m" : "a"; await clanPut(env, c); return json({ ok: true, clan: clanPub(c, uid) }); }
  if (path === "/clan/chat") { const m = clanSan(p.m, CLAN.msgMax); if (!m) return json({ ok: false, err: "empty" });
    const L = await kvJ(env, "cc:" + c.id, []); const last = L[L.length - 1]; if (last && last.u === uid && Date.now() - last.t < 1500) return json({ ok: false, err: "slow" });
    L.push({ u: uid, n: nm, t: Date.now(), m }); await env.ZS.put("cc:" + c.id, JSON.stringify(L.slice(-CLAN.chatKeep))); return json({ ok: true }); }
  if (path === "/clan/msgs") { const L = await kvJ(env, "cc:" + c.id, []); const since = +p.since || 0; return json({ ok: true, msgs: L.filter((x) => x.t > since).map((x) => ({ n: x.n, t: x.t, m: x.m, me: x.u === uid })) }); }
  if (path === "/clan/pts") { // {k: kills, r: resources} since last call; rate-limited + capped per minute
    const lt = +(await env.ZS.get("cpt:" + uid)) || 0; if (Date.now() - lt < CLAN.ptsWindow * 1000) return json({ ok: false, err: "slow" });
    const k = Math.max(0, Math.min(CLAN.ptsKillCap, p.k | 0)), r = Math.max(0, Math.min(CLAN.ptsResCap, p.r | 0)); const add = k * 2 + Math.floor(r / 4);
    const mis = clanMis(c); mis.kills += k; mis.res += r; c.pts = (c.pts | 0) + add; const me = c.members.find((m) => m.u === uid); if (me) me.pts = (me.pts | 0) + add;
    await env.ZS.put("cpt:" + uid, String(Date.now()), { expirationTtl: 3600 }); await clanPut(env, c); await clanIdx(env, c); return json({ ok: true, add, clan: clanPub(c, uid) }); }
  if (path === "/clan/claim") { // daily per user: ammo crate (lv2), attack boost (lv4); skin unlock (lv6) is permanent client-side
    const lv = clanLv(c), what = p.r === "boost" ? "boost" : "ammo", need = what === "boost" ? 4 : 2; if (lv < need) return json({ ok: false, err: "lv" });
    const day = new Date().toISOString().slice(0, 10), key = "ccl:" + uid + ":" + what + ":" + day; if (await env.ZS.get(key)) return json({ ok: false, err: "done" });
    await env.ZS.put(key, "1", { expirationTtl: 172800 }); return json({ ok: true, r: what, boostMin: 10, boostPct: 10 }); }
  return json({ ok: false, err: "nf" }, 404);
}
// route (inside fetch, before the final "/" route):
//   if (url.pathname.startsWith("/clan/")) return await clanApi(url.pathname, req, env);
