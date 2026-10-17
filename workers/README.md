# SSMug Check-in Backend (Cloudflare Workers + KV)

Zero-monthly-cost backend that powers `terminal.html` (in-store kiosk) and
`admin.html` (store owner dashboard). Stores bottle-owner profiles and
location check-ins. No server to maintain — fits the "one-time delivery, no
long-term ops" rule.

## Deploy (one time, ~5 min)

```bash
npm install -g wrangler
wrangler login

# create the KV store, copy the id it prints into wrangler.toml
wrangler kv namespace create CHECKINS

# (optional) protect the admin board with a key
wrangler secret put ADMIN_KEY   # type e.g. "demo"

wrangler deploy
```

After deploy you get a URL like `https://ssmug-checkin.<sub>.workers.dev`.

## Wire it to the site

In `terminal.html` and `admin.html`, change:

```js
const API = '/api';
```

to your workers URL:

```js
const API = 'https://ssmug-checkin.<sub>.workers.dev';
```

(Required because ssmug.com is static GitHub Pages on a different origin;
CORS is already enabled in the Worker.)

## API

| Method | Path | Body | Returns |
|--------|------|------|---------|
| PUT | `/api/profile` | `{sn,name,city,wechat,ig,mood,avatar,public}` | `{ok:true}` |
| POST | `/api/checkin` | `{loc, sn}` | `{ok:true, profile}` |
| GET | `/api/board?loc=CAFE001[&key=...]` | — | `{today,total,public,checkins[]}` |

`public:false` (default) → admin board shows "Anonymous". Set `public:true`
on the bottle owner's profile (via `bottle.html` / `PUT /api/profile`) to show
nickname + avatar on the board.

## Demo before deploy

If the Worker is not deployed, `terminal.html` falls back to built-in mock
data so you can show the flow to a cafe owner immediately. `admin.html` will
show "Backend not reachable" until the Worker is live.
