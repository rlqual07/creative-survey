# Known Issues

Tracked limitations, in priority order. Reviewed 23 August 2026.

---

## 1. CRITICAL — Response data is not persistent on Render

**Status:** open, deliberately deferred
**Blocks:** live research data collection

`src/db.js` writes responses to a local SQLite file (`survey.db`) inside the
application directory. Render's free tier uses an **ephemeral filesystem**:

- the file is destroyed on every deploy;
- it is destroyed on every restart;
- free services spin down after ~15 minutes of inactivity, and the disk is
  wiped when they spin back up.

**Consequence:** participants can complete the survey successfully, the app will
report success, and the data will later disappear with no error and no warning.
Partial data loss mid-fieldwork is the realistic failure mode, and it is silent.

**This is acceptable for development and pilot testing only.** It must be
resolved before recruiting real participants.

Resolution options:

| Option | Cost | Effort |
|---|---|---|
| Render PostgreSQL | Free tier available | Rewrite `src/db.js` query layer |
| Render persistent disk + SQLite | Paid plan required | Mount config only, minimal code change |
| Export-after-each-session safeguard | Free | Interim mitigation, not a fix |

**Interim mitigation until resolved:** export results manually and frequently
during any data collection, and treat every deploy as a data-loss event.

---

## 2. HIGH — No authentication on admin routes

Any visitor who reaches `/admin` can create surveys, publish them, and read
collected responses. There is no login, no API key, and no session check on any
route in `src/routes/`.

Relevant for participant confidentiality and any ethics approval that assumes
access control over response data.

---

## 3. HIGH — Block randomization is hardcoded to four blocks

In `src/routes/survey.js`, the participant start route contains:

```js
const blockOrder = [0, 1, 2, 3];
```

The block count is fixed regardless of how many stimulus blocks the survey
actually has. With three blocks, participants are assigned a non-existent
fourth; with six, two are never shown.

It also shuffles positional *indices* rather than block IDs, so the stored
`participants.block_randomization` value becomes uninterpretable if blocks are
ever deleted and re-added.

Further gaps:
- `Math.random()` is unseeded, so assignment is not reproducible or auditable.
- Independent random assignment is not counterbalanced; cell counts will be
  uneven at realistic sample sizes, confounding order with stimulus.
- Question order within a block is never randomized.

Scheduled for Phase 2.

---

## 4. MEDIUM — Completion is never recorded

No route sets `participants.completed_at`. The column exists in the schema and
`GET /api/responses/survey/:surveyId/results` filters on it, so the reported
completion rate is permanently 0%.

---

## 5. LOW — Results endpoint returns counts only

`GET /api/responses/survey/:surveyId/results` returns aggregate totals. There is
no per-item breakdown and no CSV or SPSS-friendly export, so response data
cannot currently be pulled out for analysis without querying the database
directly.
