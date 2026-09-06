const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');

const router = express.Router();

// Save response
router.post('/', async (req, res) => {
  try {
    const { participantId, questionId, responseValue, blockId, blockPosition } =
      req.body;
    const responseId = uuidv4();

    await run(
      `INSERT INTO responses
         (id, participant_id, question_id, block_id, block_position, response_value)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        responseId,
        participantId,
        questionId,
        blockId || null,
        blockPosition !== undefined ? blockPosition : null,
        responseValue,
      ]
    );

    const response = await get('SELECT * FROM responses WHERE id = ?', [responseId]);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save a page of responses in one request (used by the Likert grids)
router.post('/batch', async (req, res) => {
  try {
    const { participantId, blockId, blockPosition, answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'answers must be a non-empty array' });
    }

    const saved = [];
    for (const a of answers) {
      const responseId = uuidv4();
      await run(
        `INSERT INTO responses
           (id, participant_id, question_id, block_id, block_position, response_value)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          responseId,
          participantId,
          a.questionId,
          blockId || null,
          blockPosition !== undefined ? blockPosition : null,
          String(a.responseValue),
        ]
      );
      saved.push(responseId);
    }

    res.status(201).json({ saved: saved.length });
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
    const inProgressCount = participants.filter((p) => !p.completed_at).length;

    // Duration stats over completed participants only.
    const durations = participants
      .filter((p) => p.duration_seconds != null)
      .map((p) => p.duration_seconds)
      .sort((a, b) => a - b);
    const median =
      durations.length === 0
        ? null
        : durations.length % 2
        ? durations[(durations.length - 1) / 2]
        : Math.round(
            (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
          );

    // How evenly the counterbalanced sequences are filling up.
    const bySequence = {};
    for (const p of participants) {
      if (p.sequence_index == null || !p.completed_at) continue;
      bySequence[p.sequence_index] = (bySequence[p.sequence_index] || 0) + 1;
    }
    const responses = await all(
      `SELECT r.* FROM responses r 
       JOIN participants p ON r.participant_id = p.id 
       WHERE p.survey_id = ?`,
      [surveyId]
    );

    res.json({
      totalParticipants: participants.length,
      completedParticipants: completedCount,
      inProgressParticipants: inProgressCount,
      medianDurationSeconds: median,
      meanDurationSeconds: durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null,
      completedBySequence: bySequence,
      completionRate: participants.length > 0 ? ((completedCount / participants.length) * 100).toFixed(1) : 0,
      totalResponses: responses.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
