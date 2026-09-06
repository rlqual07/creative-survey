const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');
const { seedDefaultQuestions, SET_PROMPTS } = require('../defaultInstrument');
const { generateSequences } = require('../latinSquare');

// Unfinished sessions are cleared after this long, freeing their sequence slot.
const STALE_SESSION_SECONDS = 2 * 60 * 60;

const router = express.Router();

// Create survey
router.post('/', async (req, res) => {
  try {
    const { title, description, consentForm, introText } = req.body;
    const surveyId = uuidv4();

    await run(
      `INSERT INTO surveys (id, title, description, consent_form, intro_text, status) VALUES (?, ?, ?, ?, ?, 'draft')`,
      [surveyId, title, description, consentForm, introText || '']
    );

    await seedDefaultQuestions(surveyId);

    const survey = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    res.status(201).json(survey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await all('SELECT * FROM surveys ORDER BY created_at DESC');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get survey by ID
router.get('/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const survey = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish survey
// Update survey details (title, description, consent form)
router.put('/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { title, description, consentForm, introText } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const existing = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!existing) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    await run(
      `UPDATE surveys
       SET title = ?, description = ?, consent_form = ?, intro_text = ?,
           updated_at = strftime('%s', 'now')
       WHERE id = ?`,
      [
        title,
        description || '',
        consentForm || '',
        introText !== undefined ? introText : existing.intro_text || '',
        surveyId,
      ]
    );

    const survey = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a survey and everything belonging to it
router.delete('/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const existing = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!existing) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Blocks, questions, participants and responses cascade automatically.
    await run('DELETE FROM surveys WHERE id = ?', [surveyId]);
    res.json({ deleted: true, id: surveyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revert a published survey to draft
router.put('/:surveyId/unpublish', async (req, res) => {
  try {
    const { surveyId } = req.params;
    await run(
      `UPDATE surveys SET status = 'draft', updated_at = strftime('%s', 'now') WHERE id = ?`,
      [surveyId]
    );
    const survey = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:surveyId/publish', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey0 = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const blocks = await all('SELECT id FROM stimulus_blocks WHERE survey_id = ?', [surveyId]);
    if (blocks.length === 0) {
      return res
        .status(400)
        .json({ error: 'Add at least one stimulus block before publishing.' });
    }

    await run(
      `UPDATE surveys SET status = 'active', updated_at = strftime('%s', 'now') WHERE id = ?`,
      [surveyId]
    );
    const survey = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get full survey with blocks and questions
router.get('/:surveyId/full', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    const blocks = await all('SELECT * FROM stimulus_blocks WHERE survey_id = ? ORDER BY block_order', [
      surveyId,
    ]);
    const questions = await all(
      `SELECT q.* FROM questions q WHERE q.survey_id = ? ORDER BY q.block_id, q.question_set, q.question_number`,
      [surveyId]
    );
    const demographics = await all(
      'SELECT * FROM demographic_questions WHERE survey_id = ? ORDER BY question_number',
      [surveyId]
    );

    res.json({ survey, blocks, questions, demographics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start participant session
router.post('/:surveyId/start', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const participantId = uuidv4();
    const sessionToken = uuidv4();

    const blocks = await all(
      'SELECT id FROM stimulus_blocks WHERE survey_id = ? ORDER BY block_order ASC',
      [surveyId]
    );

    if (blocks.length === 0) {
      return res
        .status(400)
        .json({ error: 'This survey has no stimulus blocks and cannot be started.' });
    }

    // Clear sessions abandoned without pressing Exit, so their sequence slot is
    // returned to the pool. Cascade removes any partial responses.
    await run(
      `DELETE FROM participants
       WHERE survey_id = ?
         AND completed_at IS NULL
         AND started_at < (EXTRACT(EPOCH FROM NOW())::bigint - ?)`,
      [surveyId, STALE_SESSION_SECONDS]
    );

    // Balanced Latin square: every stimulus starts exactly once per cycle, and
    // each stimulus follows every other equally often.
    const sequences = generateSequences(blocks.length);

    // Qualtrics-style "evenly present": take the least-used sequence, breaking
    // ties at random. Because incomplete participants are deleted, the counts
    // reflect only live and completed sessions, so balance self-corrects.
    const counts = await all(
      `SELECT sequence_index, COUNT(*)::int AS n
       FROM participants
       WHERE survey_id = ? AND sequence_index IS NOT NULL
       GROUP BY sequence_index`,
      [surveyId]
    );

    const used = new Array(sequences.length).fill(0);
    for (const row of counts) {
      if (row.sequence_index < used.length) used[row.sequence_index] = row.n;
    }

    const lowest = Math.min(...used);
    const candidates = used
      .map((n, i) => (n === lowest ? i : -1))
      .filter((i) => i !== -1);
    const sequenceIndex = candidates[Math.floor(Math.random() * candidates.length)];

    const blockOrder = sequences[sequenceIndex].map((pos) => blocks[pos].id);

    await run(
      `INSERT INTO participants
         (id, survey_id, session_token, block_randomization, sequence_index)
       VALUES (?, ?, ?, ?, ?)`,
      [participantId, surveyId, sessionToken, JSON.stringify(blockOrder), sequenceIndex]
    );

    const participant = await get('SELECT * FROM participants WHERE id = ?', [participantId]);
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:surveyId/instrument', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    const blocks = await all(
      'SELECT * FROM stimulus_blocks WHERE survey_id = ? ORDER BY block_order ASC',
      [surveyId]
    );

    const questions = await all(
      `SELECT * FROM questions WHERE survey_id = ?
       ORDER BY question_set ASC, question_number ASC`,
      [surveyId]
    );

    // Group into sets; each set becomes one page shown after a stimulus.
    const setMap = new Map();
    for (const q of questions) {
      if (!setMap.has(q.question_set)) {
        setMap.set(q.question_set, {
          questionSet: q.question_set,
          prompt: SET_PROMPTS[q.question_set] || '',
          type: q.question_type,
          scaleMax: q.scale_max,
          items: [],
        });
      }
      setMap.get(q.question_set).items.push({
        id: q.id,
        text: q.question_text,
        type: q.question_type,
        scaleMax: q.scale_max,
        options: q.options ? JSON.parse(q.options) : null,
      });
    }

    const demographics = await all(
      `SELECT * FROM demographic_questions WHERE survey_id = ?
       ORDER BY question_number ASC`,
      [surveyId]
    );

    res.json({
      survey,
      blocks,
      questionSets: Array.from(setMap.values()).sort(
        (a, b) => a.questionSet - b.questionSet
      ),
      demographics: demographics.map((d) => ({
        id: d.id,
        text: d.question_text,
        type: d.question_type,
        options: d.options ? JSON.parse(d.options) : null,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a participant as finished. Refuses unless every stimulus has a full set
// of responses and every demographic question is answered, so partial records
// can never be marked complete.
router.post('/participant/:participantId/complete', async (req, res) => {
  try {
    const { participantId } = req.params;

    const participant = await get('SELECT * FROM participants WHERE id = ?', [participantId]);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });

    const blocks = await all(
      'SELECT id FROM stimulus_blocks WHERE survey_id = ?',
      [participant.survey_id]
    );
    const questions = await all(
      'SELECT id FROM questions WHERE survey_id = ?',
      [participant.survey_id]
    );
    const demographics = await all(
      'SELECT id FROM demographic_questions WHERE survey_id = ?',
      [participant.survey_id]
    );

    const expected = blocks.length * questions.length;
    const got = await get(
      'SELECT COUNT(*)::int AS n FROM responses WHERE participant_id = ?',
      [participantId]
    );
    const gotDemo = await get(
      'SELECT COUNT(*)::int AS n FROM demographic_responses WHERE participant_id = ?',
      [participantId]
    );

    if (got.n < expected || gotDemo.n < demographics.length) {
      return res.status(400).json({
        error: 'Survey is not complete.',
        expectedResponses: expected,
        actualResponses: got.n,
        expectedDemographics: demographics.length,
        actualDemographics: gotDemo.n,
      });
    }

    await run(
      `UPDATE participants
       SET completed_at = EXTRACT(EPOCH FROM NOW())::bigint,
           status = 'completed',
           duration_seconds = EXTRACT(EPOCH FROM NOW())::bigint - started_at
       WHERE id = ?`,
      [participantId]
    );

    const updated = await get('SELECT * FROM participants WHERE id = ?', [participantId]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exit before finishing: the participant row is deleted outright, and cascade
// removes any partial responses. Only complete records are retained, and the
// sequence slot returns to the pool for the next participant.
router.post('/participant/:participantId/abandon', async (req, res) => {
  try {
    const { participantId } = req.params;
    const result = await run(
      'DELETE FROM participants WHERE id = ? AND completed_at IS NULL',
      [participantId]
    );
    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: 'Participant not found or already complete' });
    }
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
