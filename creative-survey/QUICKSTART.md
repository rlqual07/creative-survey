# Quick Start

Getting a survey running, entirely in the browser.

> Pilot testing only until the data persistence issue in
> [KNOWN_ISSUES.md](KNOWN_ISSUES.md) is resolved. Responses will be lost on
> redeploy.

## 1. Deploy to Render

Full walkthrough in [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md). In short:

1. Fork this repository on GitHub.
2. At [render.com](https://render.com), create a new **Web Service** and connect
   your fork.
3. Render reads `render.yaml` and configures the build automatically.
4. Wait for the first deploy to finish.

Your app will be live at `https://<your-service-name>.onrender.com`.

Note that free Render services spin down after inactivity, so the first request
after a quiet period takes roughly 30-60 seconds to respond. Warm the app before
sending participants to it.

## 2. Create a survey

Go to `https://<your-service-name>.onrender.com/admin`.

1. Enter a title, description, and consent text, then create the survey.
2. Add your stimulus blocks. Each block needs a type (image or video), a URL,
   and a title. Stimulus files must be hosted somewhere publicly reachable.
3. Publish the survey when you are ready.

## 3. Collect responses

Send participants to `https://<your-service-name>.onrender.com/survey`.

Each participant is assigned a randomized stimulus block order at the point they
begin, stored against their session.

> The current randomization assumes exactly four stimulus blocks. See item 3 in
> [KNOWN_ISSUES.md](KNOWN_ISSUES.md) before designing your study around a
> different number.

## 4. View results

Go to `https://<your-service-name>.onrender.com/results/<surveyId>`.

The survey ID appears in the admin dashboard after creation.

> Completion rate currently reads 0% regardless of actual completions — see item
> 4 in [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## Troubleshooting

**Build fails on Render.** Check the build log. Render sets `CI=true`, which
makes Create React App treat lint warnings as build errors. Any new warning you
introduce will fail the build.

**Blank page or failing requests.** Confirm the frontend is calling the relative
path `/api`, not an absolute URL. An absolute `localhost` URL will send every
participant's browser to their own machine.

**First request very slow.** Expected on the free tier. The service is waking up.
