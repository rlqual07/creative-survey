# Creative Survey Platform

A survey platform for stimulus-based research, with block randomization of
stimulus presentation order.

> **Before collecting real data, read [KNOWN_ISSUES.md](KNOWN_ISSUES.md).**
> Responses are currently stored in SQLite on an ephemeral filesystem and will
> be lost on redeploy. The platform is suitable for development and pilot
> testing only until that is resolved.

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
src/db.js              SQLite connection, schema, promise helpers
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

## Local development

```bash
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
