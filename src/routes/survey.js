const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');

const router = express.Router();

// Create survey
router.post('/', async (req, res) => {
  try {
    const { title, description, consentForm } = req.body;
    const surveyId = uuidv4();

    await run(
      `INSERT INTO surveys (id, title, description, consent_form, status) VALUES (?, ?, ?, ?, 'draft')`,
      [surveyId, title, description, consentForm]
    );

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
    const { title, description, consentForm } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const existing = await get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!existing) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    await run(
      `UPDATE surveys
       SET title = ?, description = ?, consent_form = ?,
           updated_at = strftime('%s', 'now')
       WHERE id = ?`,
      [title, description || '', consentForm || '', surveyId]
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

    // Randomize over the blocks this survey actually has. Block IDs are stored
    // rather than positional indices, so the recorded order stays interpretable
    // even if blocks are later added, removed or reordered.
    const blocks = await all(
      'SELECT id FROM stimulus_blocks WHERE survey_id = ? ORDER BY block_order ASC',
      [surveyId]
    );

    if (blocks.length === 0) {
      return res
        .status(400)
        .json({ error: 'This survey has no stimulus blocks and cannot be started.' });
    }

    const blockOrder = blocks.map((b) => b.id);
    for (let i = blockOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blockOrder[i], blockOrder[j]] = [blockOrder[j], blockOrder[i]];
    }

    await run(
      `INSERT INTO participants (id, survey_id, session_token, block_randomization) VALUES (?, ?, ?, ?)`,
      [participantId, surveyId, sessionToken, JSON.stringify(blockOrder)]
    );

    const participant = await get('SELECT * FROM participants WHERE id = ?', [participantId]);
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
