// SSMug Social Bottle — Check-in Backend (Cloudflare Workers + KV)
// Endpoints:
//   PUT  /api/profile   {sn,name,city,wechat,ig,mood,avatar,public}  -> save bottle owner profile
//   POST /api/checkin   {loc, sn}                                    -> record a check-in, return profile
//   GET  /api/board?loc=CAFE001[&key=...]                            -> today's check-ins + stats

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...CORS } });
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ---- PUT /api/profile ----
    if (p === '/api/profile' && request.method === 'PUT') {
      const b = await request.json().catch(() => ({}));
      if (!b.sn) return json({ error: 'sn required' }, 400);
      await env.CHECKINS.put('p:' + b.sn, JSON.stringify({ ...b, sn: b.sn }));
      return json({ ok: true });
    }

    // ---- POST /api/checkin ----
    if (p === '/api/checkin' && request.method === 'POST') {
      const b = await request.json().catch(() => ({}));
      if (!b.loc || !b.sn) return json({ error: 'loc and sn required' }, 400);
      const dayKey = 'c:' + b.loc + ':' + todayKey();
      let arr = [];
      const raw = await env.CHECKINS.get(dayKey);
      if (raw) { try { arr = JSON.parse(raw); } catch (e) {} }
      arr.push({ sn: b.sn, t: Date.now() });
      await env.CHECKINS.put(dayKey, JSON.stringify(arr));
      const prof = await env.CHECKINS.get('p:' + b.sn);
      const profile = prof ? JSON.parse(prof) : null;
      return json({ ok: true, profile });
    }

    // ---- GET /api/board ----
    if (p === '/api/board' && request.method === 'GET') {
      const loc = url.searchParams.get('loc') || 'CAFE001';
      const key = url.searchParams.get('key');
      if (env.ADMIN_KEY && key !== env.ADMIN_KEY) return json({ error: 'bad key' }, 403);

      const dayKey = 'c:' + loc + ':' + todayKey();
      const raw = await env.CHECKINS.get(dayKey);
      let arr = [];
      if (raw) { try { arr = JSON.parse(raw); } catch (e) {} }

      const checkins = [];
      let pubCount = 0;
      for (const c of arr) {
        let profile = null;
        const pr = await env.CHECKINS.get('p:' + c.sn);
        if (pr) profile = JSON.parse(pr);
        const isPub = !!(profile && profile.public && profile.name);
        if (isPub) pubCount++;
        checkins.push({
          sn: c.sn,
          t: c.t,
          public: isPub,
          name: isPub ? profile.name : '',
          avatar: profile ? (profile.avatar || '🥤') : '🥤',
          city: profile ? (profile.city || '') : '',
          mood: profile ? (profile.mood || '') : '',
        });
      }
      return json({ today: checkins.length, total: checkins.length, public: pubCount, checkins });
    }

    return json({ error: 'not found' }, 404);
  },
};
