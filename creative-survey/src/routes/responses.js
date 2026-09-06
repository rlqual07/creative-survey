const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');

const router = express.Router();

// Save response
router.post('/', async (req, res) => {
  try {
    const { participantId, questionId, responseValue } = req.body;
    const responseId = uuidv4();

    await run(
      `INSERT INTO responses (id, participant_id, question_id, response_value) VALUES (?, ?, ?, ?)`,
      [responseId, participantId, questionId, responseValue]
    );

    const response = await get('SELECT * FROM responses WHERE id = ?', [responseId]);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save demographic response
router.post('/demographic', async (req, res) => {
  try {
    const { participantId, demographicQuestionId, responseValue } = req.body;
    const responseId = uuidv4();

    await run(
      `INSERT INTO demographic_responses (id, participant_id, demographic_question_id, response_value) VALUES (?, ?, ?, ?)`,
      [responseId, participantId, demographicQuestionId, responseValue]
    );

    const response = await get('SELECT * FROM demographic_responses WHERE id = ?', [responseId]);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get survey results
router.get('/survey/:surveyId/results', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const participants = await all('SELECT * FROM participants WHERE survey_id = ?', [surveyId]);
    const completedCount = participants.filter((p) => p.completed_at).length;
    const responses = await all(
      `SELECT r.* FROM responses r 
       JOIN participants p ON r.participant_id = p.id 
       WHERE p.survey_id = ?`,
      [surveyId]
    );

    res.json({
      totalParticipants: participants.length,
      completedParticipants: completedCount,
      completionRate: participants.length > 0 ? ((completedCount / participants.length) * 100).toFixed(1) : 0,
      totalResponses: responses.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
