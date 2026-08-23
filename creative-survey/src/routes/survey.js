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
router.put('/:surveyId/publish', async (req, res) => {
  try {
    const { surveyId } = req.params;
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

    // Generate random block order
    const blockOrder = [0, 1, 2, 3];
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
