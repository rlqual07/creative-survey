# Creative Survey Platform

A survey platform for stimulus-based research, with block randomization of
stimulus presentation order.

> **Requires a `DATABASE_URL`.** Data is stored in PostgreSQL. Create a free
> database at [neon.com](https://neon.com) (no credit card, no expiry) and set
> `DATABASE_URL` before running. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for
> current limitations — note that admin routes have no authentication.

## Features

- Admin dashboard for creating surveys and stimulus blocks
- Participant survey flow with consent step
- Block randomization of stimulus order per participant
- Results dashboard with participation counts
- Responsive layout

## Architecture

A single Node process serves both the API and the compiled React app, so there
is one service to deploy and no CORS configuration.

```
server.js              Express entrypoint; serves /api and frontend/build
src/db.js              Postgres pool, schema, promise helpers
src/routes/            survey.js, questions.js, responses.js
frontend/              React 18 + TypeScript (Create React App)
  src/App.tsx          Router and navigation shell
  src/pages/           AdminDashboard, SurveyFlow, ResultsDashboard
  src/styles/          Per-page stylesheets
render.yaml            Render service definition
```

The frontend calls the API at the relative path `/api`. Because Express serves
the built frontend from the same origin, this works identically in development
(via the `proxy` setting in `frontend/package.json`) and in production. Do not
reintroduce an absolute API URL.

## Requirements

- Node.js 20 or later
- A PostgreSQL database (free at [neon.com](https://neon.com))

## Local development

```bash
cp .env.example .env  # then paste your DATABASE_URL into it
npm install          # backend dependencies
npm run build        # installs frontend deps and builds the React app
npm start            # serves on http://localhost:5000
```

For frontend hot-reloading, run the API and the dev server in two terminals:

```bash
npm run dev                      # terminal 1 - API on :5000
cd frontend && npm start         # terminal 2 - React on :3000, proxied to :5000
```

Routes:

| Path | Purpose |
|---|---|
| `/` | Landing page |
| `/admin` | Create and publish surveys |
| `/survey` | Participant flow |
| `/results/:surveyId` | Results dashboard |
| `/api/health` | Health check |

## Deployment

Render is the supported host. See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md).

Heroku is no longer supported. Heroku discontinued its free dyno tier in
November 2022, and the previous Heroku instructions in this repository were
obsolete.

## Documentation

| File | Contents |
|---|---|
| [QUICKSTART.md](QUICKSTART.md) | Fastest path to a running survey |
| [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) | Deployment walkthrough |
| [API_REFERENCE.md](API_REFERENCE.md) | Endpoint reference |
| [DATABASE.md](DATABASE.md) | Schema reference |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | Tracked limitations |
