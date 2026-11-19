# Sync Board

A private page for two people. One of you signs up, the other joins with an invite code, and after that you share one board with a clock, a pixel canvas, a message board and a photo wall on it.

For long-distance couples, best friends, anyone really who just wants one page to share.

## The four tabs

**Time Board** — a card for each of you showing your local time and your status: free to call, at work, studying, sleeping, or busy. You pick yours from the dropdown. Each card uses the timezone from your profile, so nobody has to do the arithmetic.

**Pixel Canvas** — a 16x16 grid you both draw on. Pencil, eraser, and a fill tool that floods a whole region in one click, plus four colour palettes to pick from. Save a drawing as a doodle and it sticks around; you can reopen it, edit it, download it or bin it.

**Daily Notes** — messages with an author and a date, so the other person finds them when they show up.

**Gallery** — upload photos (JPEG, PNG or WebP, up to 5MB) and drag stickers around on top of them.

## Routines

Set up recurring slots — pick the days, a start and end time, and the status you want to be in during them. The dashboard checks your routines every ten seconds and switches your status for you, so "sleeping" shows up without you touching anything.

## The rest of it

The board has a name you can edit by clicking it, an invite code for the second person, and a leave option in the settings. Leaving takes you off the board but keeps everything on it — the other person keeps the canvas and the photos.

Also in settings: nickname, timezone, colour theme, and logout. A new account starts on its own board already, so you can either invite someone or leave and join theirs.

## Under the hood

- `client/` — React 19, Vite, Tailwind 4, dayjs. Served as static files in production.
- `server/` — Express on Node, `mysql2` for the database, `multer` for uploads.
- `db.sql` is a local MySQL dump and is gitignored, so the schema is not in this repo.

REST endpoints live under `/api` — `auth`, `boards`, `users`, `doodles`, `messages`, `routines`, `gallery`. Uploaded photos are written to `server/uploads/` and served back from `/uploads`.

Nothing uses websockets. The dashboard re-fetches board members every 5 seconds and each tab loads its own content when you open it, which is enough for two people.

Passwords are hashed with bcrypt. Login state lives in `localStorage`, so treat it as a convenience rather than real sessions.

## Running it

You need MySQL with the `sync_board` schema loaded.

### Development

```sh
# terminal 1 — API on :5000
cd server
npm install
npm run dev

# terminal 2 — Vite on :5173
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/uploads` to `localhost:5000`. Set `VITE_BACKEND_URL` if the API is somewhere else.

`server/.env` wants `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD` and `DB_NAME`.

### Docker

```sh
docker network create services   # compose joins this external network
docker compose up --build
```

The client image builds the bundle and hands it to Caddy, which serves it with an SPA fallback. The server image runs the API and mounts `./server/uploads` so photos survive a restart.

Two things to know before it works:

- compose reads `.env` from the repo root (same `DB_*` variables as above), which is separate from `server/.env`
- no ports are published in `compose.yml` — the stack expects a reverse proxy sitting on the `services` network to route to the containers

## Layout

```
sync-board/
├── client/
│   ├── src/components/    Dashboard, PixelCanvas, MessageBoard, PhotoGallery,
│   │                      TimeCard, RoutineScheduler, AuthScreen, ...
│   ├── public/            favicon and icons
│   ├── Caddyfile          serves the built bundle, SPA fallback
│   └── vite.config.js     dev proxy for /api and /uploads
├── server/
│   ├── routes/            auth, boards, users, doodles, notes, routines, gallery
│   ├── uploads/           photos land here
│   └── db.js              mysql2 pool
├── compose.yml
└── db.sql                 local dump, not committed
```

## Not finished yet

- The partner's card always reads "Sleeping" — statuses don't sync between the two sides yet
- "Delete account" in settings is a stub and only shows an alert

Built with love :3
