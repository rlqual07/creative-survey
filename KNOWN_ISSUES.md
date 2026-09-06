# Known Issues

Tracked limitations, in priority order. Reviewed 6 September 2026.

---

## RESOLVED — Response data is not persistent

Previously the platform stored data in SQLite on Render's ephemeral filesystem,
losing everything on each deploy, restart, and cold start.

Now resolved: storage has been migrated to PostgreSQL (`pg`), configured via the
`DATABASE_URL` environment variable and hosted on Neon's free plan, which has no
expiry and requires no credit card.

**Remaining caveat.** Neon's free plan allows 0.5 GB of storage and 100
compute-hours per project per month, and exhausting a monthly limit suspends
compute until the next billing cycle. Survey data is small, and compute scales
to zero after five minutes of inactivity, so a pilot will not come close. Sustained
high traffic during full recruitment could, so monitor usage in the Neon console.

Note also that free plans generally do not include automatic backups. Export
your data periodically during any real collection.

---

## 1. HIGH — No authentication on admin routes

Any visitor who reaches `/admin` can create surveys, publish them, delete them,
and read collected responses. There is no login, API key, or session check on
any route in `src/routes/`.

Relevant to participant confidentiality and to any ethics approval that assumes
access control over response data. The delete endpoints added in this round
raise the stakes: an anonymous visitor can now destroy collected data.

---

## 2. HIGH — Randomization is not counterbalanced

`POST /api/survey/:surveyId/start` now randomizes over the survey's real
stimulus blocks and stores block IDs rather than positional indices, so the
earlier hardcoded four-block bug is fixed.

It remains **pure random assignment, not counterbalancing**. Independent random
draws produce uneven cell counts at realistic sample sizes. Measured over 20
simulated participants with three blocks, the first-position block came up
9 / 8 / 3 against an expected 6.7 each. Order is therefore partially confounded
with stimulus, and some sequences may go unobserved entirely.

Also outstanding:
- `Math.random()` is unseeded, so assignment is not reproducible or auditable.
- Question order within a block is never randomized.

Planned for Phase 2: a balanced Latin square with a least-used-sequence fallback
to tolerate attrition.

---

## 3. MEDIUM — Completion is never recorded

No route sets `participants.completed_at`. The column exists and
`GET /api/responses/survey/:surveyId/results` filters on it, so the reported
completion rate is permanently 0%.

---

## 4. MEDIUM — No question management in the admin UI

The API supports adding questions (`POST /api/questions/question/add`), but the
admin dashboard has no interface for it. Questions must currently be added by
calling the API directly.

---

## 5. LOW — Results endpoint returns counts only

`GET /api/responses/survey/:surveyId/results` returns aggregate totals. There is
no per-item breakdown and no CSV or SPSS-friendly export, so data cannot be
pulled out for analysis without querying the database directly.
